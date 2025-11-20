#!/bin/bash
set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Clang WASM Builder for STM32         ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Step 1: Check prerequisites
echo -e "${BLUE}Step 1/7: Checking prerequisites...${NC}"

if ! command_exists python; then
    print_error "Python not found. Please install Python 3.8+"
    exit 1
fi
print_status "Python found: $(python --version)"

if ! command_exists cmake; then
    print_error "CMake not found. Please install CMake 3.20+"
    exit 1
fi
print_status "CMake found: $(cmake --version | head -n1)"

if ! command_exists git; then
    print_error "Git not found. Please install Git"
    exit 1
fi
print_status "Git found"

echo ""

# Step 2: Install Python requirements
echo -e "${BLUE}Step 2/7: Installing Python dependencies...${NC}"
if [ -f "requirements.txt" ]; then
    python -m pip install -r requirements.txt --quiet
    print_status "Python dependencies installed"
else
    print_warning "requirements.txt not found, skipping"
fi
echo ""

# Step 3: Setup Emscripten
echo -e "${BLUE}Step 3/7: Setting up Emscripten...${NC}"
if [ ! -d "emsdk" ]; then
    print_info "Cloning Emscripten SDK..."
    git clone https://github.com/emscripten-core/emsdk.git
    print_status "Emscripten SDK cloned"
else
    print_status "Emscripten SDK already exists"
fi

cd emsdk
print_info "Installing latest Emscripten..."
# Use Python version of emsdk for better Windows compatibility
python emsdk.py install latest
python emsdk.py activate latest

# Get Emscripten paths and export them
EMSDK_ROOT="$(pwd)"
EMSDK_NODE="$EMSDK_ROOT/node/22.16.0_64bit/bin"
EMSDK_UPSTREAM="$EMSDK_ROOT/upstream/emscripten"

# Export environment variables manually for reliability
export EMSDK="$EMSDK_ROOT"
export EM_CONFIG="$EMSDK_ROOT/.emscripten"
export PATH="$EMSDK_UPSTREAM:$EMSDK_NODE:$PATH"

cd ..
print_status "Emscripten activated: $(emcc --version 2>/dev/null | head -n1 || echo 'configured')"
echo ""

# Step 4: Clone LLVM if needed
echo -e "${BLUE}Step 4/7: Preparing LLVM source...${NC}"
if [ ! -d "llvm-project" ]; then
    print_info "Cloning LLVM project (this will take a while)..."
    git clone --depth=1 --branch=release/18.x https://github.com/llvm/llvm-project.git
    print_status "LLVM cloned"
else
    print_status "LLVM already exists"
fi
echo ""

# Step 5: Configure build
echo -e "${BLUE}Step 5/7: Configuring Clang build...${NC}"
mkdir -p build-wasm
cd build-wasm

print_info "Running CMake configuration (ARM-only target)..."
emcmake cmake ../llvm-project/llvm \
  -DCMAKE_BUILD_TYPE=MinSizeRel \
  -DLLVM_TARGETS_TO_BUILD="ARM" \
  -DLLVM_ENABLE_PROJECTS="clang;lld" \
  -DLLVM_ENABLE_DUMP=OFF \
  -DLLVM_ENABLE_ASSERTIONS=OFF \
  -DLLVM_ENABLE_EXPENSIVE_CHECKS=OFF \
  -DLLVM_ENABLE_BACKTRACES=OFF \
  -DLLVM_BUILD_TOOLS=OFF \
  -DLLVM_ENABLE_THREADS=OFF \
  -DLLVM_BUILD_LLVM_DYLIB=OFF \
  -DLLVM_INCLUDE_TESTS=OFF \
  -DLLVM_INCLUDE_EXAMPLES=OFF \
  -DLLVM_INCLUDE_BENCHMARKS=OFF \
  -DLLVM_OPTIMIZED_TABLEGEN=ON \
  -DCLANG_ENABLE_ARCMT=OFF \
  -DCLANG_ENABLE_STATIC_ANALYZER=OFF \
  -G "Unix Makefiles"

print_status "CMake configuration complete"
cd ..
echo ""

# Step 6: Build Clang
echo -e "${BLUE}Step 6/7: Building Clang to WASM...${NC}"
print_warning "This will take 30-60 minutes depending on your CPU"
print_info "Building with $(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4) parallel jobs..."

cd build-wasm
emmake make -j$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4) clang

print_status "Clang built successfully!"
cd ..
echo ""

# Step 7: Package output
echo -e "${BLUE}Step 7/7: Packaging WASM files...${NC}"
mkdir -p dist

if [ -f "build-wasm/bin/clang.wasm" ]; then
    print_info "Compressing clang.wasm..."
    gzip -9 -c build-wasm/bin/clang.wasm > dist/clang.wasm.gz
    print_status "Clang WASM packaged to dist/clang.wasm.gz"

    ORIGINAL_SIZE=$(stat -f%z build-wasm/bin/clang.wasm 2>/dev/null || stat -c%s build-wasm/bin/clang.wasm)
    COMPRESSED_SIZE=$(stat -f%z dist/clang.wasm.gz 2>/dev/null || stat -c%s dist/clang.wasm.gz)

    print_info "Original size: $(numfmt --to=iec $ORIGINAL_SIZE 2>/dev/null || echo $((ORIGINAL_SIZE / 1024 / 1024))MB)"
    print_info "Compressed size: $(numfmt --to=iec $COMPRESSED_SIZE 2>/dev/null || echo $((COMPRESSED_SIZE / 1024 / 1024))MB)"
else
    print_error "clang.wasm not found in build-wasm/bin/"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Build Complete! ✓                    ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Copy ${YELLOW}dist/clang.wasm.gz${NC} to your web app"
echo -e "  2. Integrate with the STM32 plugin system"
echo -e "  3. Replace pattern compiler with real Clang"
echo ""
