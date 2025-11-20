#!/bin/bash
# Build Clang/LLVM for WebAssembly with ARM-only target
# Optimized for STM32 embedded development
# Expected final size: 8-12MB compressed

set -e  # Exit on error

echo "========================================="
echo "Building Clang WASM - ARM Only"
echo "Target: Cortex-M3 (STM32F103)"
echo "========================================="

# Configuration
LLVM_VERSION="18.1.8"  # Latest stable as of 2024
BUILD_DIR="build-wasm-arm"
INSTALL_DIR="install-arm"

# Step 1: Install Emscripten
echo ""
echo "Step 1: Installing Emscripten..."
if [ ! -d "emsdk" ]; then
    git clone --depth 1 https://github.com/emscripten-core/emsdk.git
    cd emsdk
    ./emsdk install latest
    ./emsdk activate latest
    cd ..
fi

source emsdk/emsdk_env.sh
echo "✓ Emscripten installed: $(emcc --version | head -1)"

# Step 2: Clone LLVM (shallow clone for speed)
echo ""
echo "Step 2: Cloning LLVM project..."
if [ ! -d "llvm-project" ]; then
    git clone --depth 1 --branch "llvmorg-${LLVM_VERSION}" \
        https://github.com/llvm/llvm-project.git
fi
echo "✓ LLVM cloned"

# Step 3: Configure build
echo ""
echo "Step 3: Configuring build..."
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

emcmake cmake ../llvm-project/llvm \
  -DCMAKE_BUILD_TYPE=MinSizeRel \
  -DCMAKE_INSTALL_PREFIX="../${INSTALL_DIR}" \
  \
  `# Only build ARM target (saves ~80% size)` \
  -DLLVM_TARGETS_TO_BUILD="ARM" \
  \
  `# Only build essential tools` \
  -DLLVM_ENABLE_PROJECTS="clang;lld" \
  -DLLVM_BUILD_TOOLS=ON \
  \
  `# Disable unnecessary features` \
  -DLLVM_INCLUDE_TESTS=OFF \
  -DLLVM_INCLUDE_EXAMPLES=OFF \
  -DLLVM_INCLUDE_BENCHMARKS=OFF \
  -DLLVM_INCLUDE_DOCS=OFF \
  -DLLVM_ENABLE_THREADS=OFF \
  -DLLVM_ENABLE_ASSERTIONS=OFF \
  -DLLVM_ENABLE_BACKTRACES=OFF \
  -DLLVM_ENABLE_CRASH_OVERRIDES=OFF \
  -DLLVM_ENABLE_EXPENSIVE_CHECKS=OFF \
  -DLLVM_ENABLE_LIBXML2=OFF \
  -DLLVM_ENABLE_LIBEDIT=OFF \
  -DLLVM_ENABLE_TERMINFO=OFF \
  -DLLVM_ENABLE_ZLIB=OFF \
  -DLLVM_ENABLE_ZSTD=OFF \
  \
  `# Minimal runtime` \
  -DLLVM_ENABLE_RTTI=OFF \
  -DLLVM_ENABLE_EH=OFF \
  \
  `# Emscripten-specific optimizations` \
  -DCMAKE_EXE_LINKER_FLAGS="-s ALLOW_MEMORY_GROWTH=1 -s MAXIMUM_MEMORY=2GB" \
  -DCMAKE_CXX_FLAGS="-Oz" \
  \
  `# Build static binaries` \
  -DBUILD_SHARED_LIBS=OFF \
  -DLLVM_BUILD_LLVM_DYLIB=OFF

echo "✓ Build configured"

# Step 4: Build
echo ""
echo "Step 4: Building... (this takes 30-60 minutes)"
echo "Building clang and lld..."

# Build only what we need
emmake make clang lld -j$(nproc)

echo "✓ Build complete"

# Step 5: Extract binaries
echo ""
echo "Step 5: Extracting WASM binaries..."
cd ..

mkdir -p wasm-binaries
cp "${BUILD_DIR}/bin/clang.wasm" wasm-binaries/ 2>/dev/null || \
cp "${BUILD_DIR}/bin/clang" wasm-binaries/clang.wasm

cp "${BUILD_DIR}/bin/lld.wasm" wasm-binaries/ 2>/dev/null || \
cp "${BUILD_DIR}/bin/lld" wasm-binaries/lld.wasm

echo "✓ Binaries extracted"

# Step 6: Optimize
echo ""
echo "Step 6: Optimizing WASM binaries..."

# Install wasm-opt if not present
if ! command -v wasm-opt &> /dev/null; then
    echo "Installing binaryen (wasm-opt)..."
    npm install -g binaryen
fi

cd wasm-binaries

# Original sizes
echo "Original sizes:"
ls -lh clang.wasm lld.wasm

# Optimize for size
echo ""
echo "Optimizing with wasm-opt..."
wasm-opt clang.wasm -Oz -o clang-opt.wasm
wasm-opt lld.wasm -Oz -o lld-opt.wasm

# Strip debug info
echo "Stripping debug symbols..."
wasm-strip clang-opt.wasm -o clang-final.wasm || mv clang-opt.wasm clang-final.wasm
wasm-strip lld-opt.wasm -o lld-final.wasm || mv lld-opt.wasm lld-final.wasm

# Compress
echo ""
echo "Compressing with gzip..."
gzip -9 -k clang-final.wasm
gzip -9 -k lld-final.wasm

echo ""
echo "Final sizes:"
echo "clang.wasm:        $(ls -lh clang-final.wasm | awk '{print $5}')"
echo "clang.wasm.gz:     $(ls -lh clang-final.wasm.gz | awk '{print $5}')"
echo "lld.wasm:          $(ls -lh lld-final.wasm | awk '{print $5}')"
echo "lld.wasm.gz:       $(ls -lh lld-final.wasm.gz | awk '{print $5}')"

cd ..

# Step 7: Bundle headers
echo ""
echo "Step 7: Bundling C headers..."

mkdir -p headers/include
mkdir -p headers/lib/clang

# Copy minimal C standard library headers
if [ -d "${BUILD_DIR}/lib/clang/${LLVM_VERSION}/include" ]; then
    cp -r "${BUILD_DIR}/lib/clang/${LLVM_VERSION}/include" headers/lib/clang/
fi

echo "✓ Headers bundled"

# Step 8: Create summary
echo ""
echo "========================================="
echo "Build Complete!"
echo "========================================="
echo ""
echo "Output directory: wasm-binaries/"
echo ""
echo "Files generated:"
echo "  - clang-final.wasm      (Full compiler)"
echo "  - clang-final.wasm.gz   (Compressed)"
echo "  - lld-final.wasm        (Linker)"
echo "  - lld-final.wasm.gz     (Compressed)"
echo ""
echo "Next steps:"
echo "  1. Copy wasm-binaries/ to your web project"
echo "  2. Use with Web Workers for compilation"
echo "  3. Bundle STM32 CMSIS headers"
echo ""
echo "Usage in browser:"
echo "  clang -target thumbv7m-none-eabi -mcpu=cortex-m3 main.c"
echo ""
echo "========================================="
