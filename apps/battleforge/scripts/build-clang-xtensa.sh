#!/bin/bash
#
# Build Clang WASM with Xtensa Backend (Espressif Fork)
# For ESP32, ESP32-S2, ESP32-S3 support
#
# Run this on the buildbox: ssh builder@192.168.1.62
# Usage: ./build-clang-xtensa.sh
#
# Requirements:
#   - Emscripten SDK (will be installed if missing)
#   - ~10GB disk space
#   - 16GB+ RAM recommended
#
# Output: clang-xtensa.wasm.gz
#
# Note: This uses Espressif's LLVM fork since upstream LLVM does not
# include the Xtensa backend. See: https://github.com/espressif/llvm-project

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_ROOT="${BUILD_ROOT:-$HOME/clang-wasm-builds}"

# Espressif LLVM fork - this is the official source for Xtensa support
LLVM_REPO="${LLVM_REPO:-https://github.com/espressif/llvm-project.git}"
# Use the latest stable Espressif release branch
# Check https://github.com/espressif/llvm-project/branches for available branches
LLVM_BRANCH="${LLVM_BRANCH:-xtensa_release_18.1.2}"
EMSDK_VERSION="${EMSDK_VERSION:-3.1.50}"
NUM_JOBS="${NUM_JOBS:-$(nproc)}"

# Directories
LLVM_SRC="${BUILD_ROOT}/llvm-xtensa"
NATIVE_BUILD="${BUILD_ROOT}/build-native-xtensa"
WASM_BUILD="${BUILD_ROOT}/build-wasm-xtensa"
EMSDK_DIR="${BUILD_ROOT}/emsdk"
OUTPUT_DIR="${BUILD_ROOT}/output"

# Output file
OUTPUT_WASM="clang-xtensa.wasm"
OUTPUT_COMPRESSED="clang-xtensa.wasm.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

log_step() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Required command '$1' not found. Please install it."
    fi
}

# ============================================================================
# Setup Functions
# ============================================================================

setup_directories() {
    log_step "Setting up directories"

    mkdir -p "${BUILD_ROOT}"
    mkdir -p "${OUTPUT_DIR}"

    log_info "Build root: ${BUILD_ROOT}"
    log_info "Output directory: ${OUTPUT_DIR}"
}

install_dependencies() {
    log_step "Checking dependencies"

    # Check for required tools
    check_command git
    check_command cmake
    check_command ninja
    check_command python3

    # Check if we need to install packages
    if ! command -v ninja &> /dev/null; then
        log_info "Installing build dependencies..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y build-essential cmake ninja-build python3 git
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y gcc gcc-c++ cmake ninja-build python3 git
        else
            log_warning "Please install: cmake, ninja-build, python3, git"
        fi
    fi

    log_success "All dependencies available"
}

setup_emscripten() {
    log_step "Setting up Emscripten SDK"

    if [ -d "${EMSDK_DIR}" ] && [ -f "${EMSDK_DIR}/emsdk_env.sh" ]; then
        log_info "Emscripten SDK already installed at ${EMSDK_DIR}"
    else
        log_info "Installing Emscripten SDK ${EMSDK_VERSION}..."

        rm -rf "${EMSDK_DIR}"
        git clone https://github.com/emscripten-core/emsdk.git "${EMSDK_DIR}"

        cd "${EMSDK_DIR}"
        ./emsdk install ${EMSDK_VERSION}
        ./emsdk activate ${EMSDK_VERSION}
    fi

    # Activate Emscripten
    source "${EMSDK_DIR}/emsdk_env.sh"

    log_info "Emscripten version: $(emcc --version | head -n1)"
    log_success "Emscripten SDK ready"
}

# ============================================================================
# LLVM Source (Espressif Fork)
# ============================================================================

clone_llvm() {
    log_step "Cloning Espressif LLVM fork (Xtensa backend)"
    log_info "Repository: ${LLVM_REPO}"
    log_info "Branch: ${LLVM_BRANCH}"

    if [ -d "${LLVM_SRC}" ]; then
        log_info "LLVM source already exists at ${LLVM_SRC}"
        log_info "Updating to latest..."
        cd "${LLVM_SRC}"
        git fetch origin
        git checkout "${LLVM_BRANCH}"
        git pull origin "${LLVM_BRANCH}" || true
    else
        log_info "Cloning Espressif LLVM repository..."
        log_warning "This is a large repository, may take several minutes..."

        # Clone with depth to speed up, but get full branch history
        git clone --depth 1 --branch "${LLVM_BRANCH}" \
            "${LLVM_REPO}" "${LLVM_SRC}"
    fi

    # Verify Xtensa target exists
    if [ ! -d "${LLVM_SRC}/llvm/lib/Target/Xtensa" ]; then
        log_error "Xtensa target not found! This doesn't appear to be the Espressif fork."
    fi

    log_success "Espressif LLVM source ready at ${LLVM_SRC}"
    log_info "Xtensa target directory: ${LLVM_SRC}/llvm/lib/Target/Xtensa"
}

# ============================================================================
# Stage 1: Native Build (for tablegen tools)
# ============================================================================

build_native_tools() {
    log_step "Stage 1: Building native tablegen tools"

    rm -rf "${NATIVE_BUILD}"
    mkdir -p "${NATIVE_BUILD}"
    cd "${NATIVE_BUILD}"

    log_info "Configuring native build..."

    # Note: Xtensa is an EXPERIMENTAL target in Espressif's fork
    cmake -G Ninja "${LLVM_SRC}/llvm" \
        -DCMAKE_BUILD_TYPE=Release \
        -DLLVM_TARGETS_TO_BUILD="" \
        -DLLVM_EXPERIMENTAL_TARGETS_TO_BUILD="Xtensa" \
        -DLLVM_ENABLE_PROJECTS="clang" \
        -DLLVM_INCLUDE_TESTS=OFF \
        -DLLVM_INCLUDE_EXAMPLES=OFF \
        -DLLVM_INCLUDE_BENCHMARKS=OFF \
        -DLLVM_ENABLE_ASSERTIONS=OFF

    log_info "Building tablegen tools with ${NUM_JOBS} jobs..."
    ninja -j${NUM_JOBS} llvm-tblgen clang-tblgen

    log_success "Native tablegen tools built"
    log_info "  llvm-tblgen: ${NATIVE_BUILD}/bin/llvm-tblgen"
    log_info "  clang-tblgen: ${NATIVE_BUILD}/bin/clang-tblgen"
}

# ============================================================================
# Stage 2: WASM Build
# ============================================================================

build_wasm() {
    log_step "Stage 2: Building Clang WASM with Xtensa backend"

    # Ensure Emscripten is activated
    source "${EMSDK_DIR}/emsdk_env.sh"

    rm -rf "${WASM_BUILD}"
    mkdir -p "${WASM_BUILD}"
    cd "${WASM_BUILD}"

    log_info "Configuring WASM build..."

    # Cross-compile to WASM using Emscripten
    # Note: Xtensa is an EXPERIMENTAL target in Espressif's fork
    emcmake cmake -G Ninja "${LLVM_SRC}/llvm" \
        -DCMAKE_BUILD_TYPE=MinSizeRel \
        \
        -DLLVM_TARGETS_TO_BUILD="" \
        -DLLVM_EXPERIMENTAL_TARGETS_TO_BUILD="Xtensa" \
        -DLLVM_ENABLE_PROJECTS="clang" \
        \
        -DLLVM_TABLEGEN="${NATIVE_BUILD}/bin/llvm-tblgen" \
        -DCLANG_TABLEGEN="${NATIVE_BUILD}/bin/clang-tblgen" \
        \
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
        \
        -DCLANG_ENABLE_ARCMT=OFF \
        -DCLANG_ENABLE_STATIC_ANALYZER=OFF \
        \
        -DHAVE_WAIT4=0 \
        -DHAVE_POSIX_SPAWN=0 \
        \
        -DCMAKE_EXE_LINKER_FLAGS="-sERROR_ON_UNDEFINED_SYMBOLS=0 -sALLOW_MEMORY_GROWTH=1 -sSTANDALONE_WASM=1 -sEXPORTED_FUNCTIONS=_main -sINVOKE_RUN=0" \
        -DCMAKE_CXX_FLAGS="-DHAVE_WAIT4=0 -fno-exceptions -fno-rtti"

    log_info "Building clang with ${NUM_JOBS} jobs..."
    log_info "This may take 15-30 minutes..."

    # Build only the clang binary (not all tools)
    ninja -j${NUM_JOBS} clang

    log_success "WASM build complete"
}

# ============================================================================
# Post-processing
# ============================================================================

process_output() {
    log_step "Processing output"

    cd "${WASM_BUILD}"

    # Find the built clang WASM file
    local wasm_file=""
    if [ -f "bin/clang.wasm" ]; then
        wasm_file="bin/clang.wasm"
    elif [ -f "bin/clang" ]; then
        wasm_file="bin/clang"
    else
        log_error "Could not find built clang binary in ${WASM_BUILD}/bin/"
    fi

    log_info "Found WASM binary: ${wasm_file}"
    local original_size=$(stat -c%s "${wasm_file}")
    log_info "Original size: $(numfmt --to=iec ${original_size})"

    # Copy to output directory
    cp "${wasm_file}" "${OUTPUT_DIR}/${OUTPUT_WASM}"

    # Strip if wasm-strip is available (from wabt)
    if command -v wasm-strip &> /dev/null; then
        log_info "Stripping WASM binary..."
        wasm-strip "${OUTPUT_DIR}/${OUTPUT_WASM}" || true
        local stripped_size=$(stat -c%s "${OUTPUT_DIR}/${OUTPUT_WASM}")
        log_info "Stripped size: $(numfmt --to=iec ${stripped_size})"
    else
        log_warning "wasm-strip not found, skipping strip step"
        log_info "Install wabt for smaller binaries: apt install wabt"
    fi

    # Compress
    log_info "Compressing with gzip..."
    gzip -9 -f -k "${OUTPUT_DIR}/${OUTPUT_WASM}"

    local compressed_size=$(stat -c%s "${OUTPUT_DIR}/${OUTPUT_COMPRESSED}")
    log_success "Compressed size: $(numfmt --to=iec ${compressed_size})"
}

print_summary() {
    log_step "Build Summary"

    local wasm_path="${OUTPUT_DIR}/${OUTPUT_WASM}"
    local gz_path="${OUTPUT_DIR}/${OUTPUT_COMPRESSED}"

    echo "Xtensa Clang WASM Build Complete!"
    echo ""
    echo "Files:"
    echo "  WASM:       ${wasm_path}"
    echo "  Compressed: ${gz_path}"
    echo ""
    echo "Sizes:"
    echo "  Uncompressed: $(stat -c%s "${wasm_path}" | numfmt --to=iec)"
    echo "  Compressed:   $(stat -c%s "${gz_path}" | numfmt --to=iec)"
    echo ""
    echo "SHA256 Hashes:"
    echo "  WASM: $(sha256sum "${wasm_path}" | cut -d' ' -f1)"
    echo "  GZ:   $(sha256sum "${gz_path}" | cut -d' ' -f1)"
    echo ""
    echo "Source: Espressif LLVM Fork"
    echo "Branch: ${LLVM_BRANCH}"
    echo "Repository: ${LLVM_REPO}"
    echo ""
    echo "To copy to your machine:"
    echo "  scp builder@192.168.1.62:${gz_path} ."
    echo ""
    echo "Supported target triples:"
    echo "  - xtensa-esp32-elf        (ESP32)"
    echo "  - xtensa-esp32s2-elf      (ESP32-S2)"
    echo "  - xtensa-esp32s3-elf      (ESP32-S3)"
    echo ""
    echo "Note: ESP32-C3, ESP32-C6, ESP32-H2 use RISC-V, not Xtensa."
    echo "Use clang-riscv.wasm for those chips."
}

# ============================================================================
# Main
# ============================================================================

main() {
    log_step "Clang Xtensa WASM Build Script (Espressif Fork)"
    log_info "Build root: ${BUILD_ROOT}"
    log_info "LLVM branch: ${LLVM_BRANCH}"
    log_info "Parallel jobs: ${NUM_JOBS}"

    local start_time=$(date +%s)

    setup_directories
    install_dependencies
    setup_emscripten
    clone_llvm
    build_native_tools
    build_wasm
    process_output

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    print_summary

    log_success "Total build time: $(($duration / 60)) minutes $(($duration % 60)) seconds"
}

# Run main function
main "$@"
