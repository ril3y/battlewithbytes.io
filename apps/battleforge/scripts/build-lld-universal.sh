#!/bin/bash
#
# Build Universal LLD WASM (ARM + RISC-V + Xtensa)
#
# Builds a single LLD linker that supports all target architectures.
#
# Run this on the buildbox: ssh builder@192.168.1.62
# Usage: ./build-lld-universal.sh
#
# Requirements:
#   - Emscripten SDK (will be installed if missing)
#   - ~8GB disk space
#   - 16GB+ RAM recommended
#
# Output: lld.wasm.gz (supports ARM, RISC-V, Xtensa)
#
# Note: Uses Espressif's LLVM fork for Xtensa support

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_ROOT="${BUILD_ROOT:-$HOME/clang-wasm-builds}"

# Use Espressif fork for Xtensa support (includes ARM and RISC-V too)
LLVM_REPO="${LLVM_REPO:-https://github.com/espressif/llvm-project.git}"
LLVM_BRANCH="${LLVM_BRANCH:-xtensa_release_18.1.2}"
EMSDK_VERSION="${EMSDK_VERSION:-3.1.50}"
NUM_JOBS="${NUM_JOBS:-$(nproc)}"

# Directories
LLVM_SRC="${BUILD_ROOT}/llvm-universal"
NATIVE_BUILD="${BUILD_ROOT}/build-native-lld"
WASM_BUILD="${BUILD_ROOT}/build-wasm-lld"
EMSDK_DIR="${BUILD_ROOT}/emsdk"
OUTPUT_DIR="${BUILD_ROOT}/output"

# Output files
OUTPUT_WASM="lld.wasm"
OUTPUT_JS="lld.js"
OUTPUT_COMPRESSED="lld.wasm.gz"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# Helper Functions
# ============================================================================

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

log_step() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Required command '$1' not found."
    fi
}

# ============================================================================
# Setup
# ============================================================================

setup_directories() {
    log_step "Setting up directories"
    mkdir -p "${BUILD_ROOT}" "${OUTPUT_DIR}"
    log_info "Build root: ${BUILD_ROOT}"
}

setup_emscripten() {
    log_step "Setting up Emscripten SDK"

    if [ -d "${EMSDK_DIR}" ] && [ -f "${EMSDK_DIR}/emsdk_env.sh" ]; then
        log_info "Emscripten SDK already installed"
    else
        log_info "Installing Emscripten SDK ${EMSDK_VERSION}..."
        rm -rf "${EMSDK_DIR}"
        git clone https://github.com/emscripten-core/emsdk.git "${EMSDK_DIR}"
        cd "${EMSDK_DIR}"
        ./emsdk install ${EMSDK_VERSION}
        ./emsdk activate ${EMSDK_VERSION}
    fi

    source "${EMSDK_DIR}/emsdk_env.sh"
    log_success "Emscripten ready: $(emcc --version | head -n1)"
}

clone_llvm() {
    log_step "Cloning LLVM (Espressif fork for Xtensa support)"

    if [ -d "${LLVM_SRC}" ]; then
        log_info "LLVM source exists, updating..."
        cd "${LLVM_SRC}"
        git fetch origin
        git checkout "${LLVM_BRANCH}"
        git pull origin "${LLVM_BRANCH}" || true
    else
        log_info "Cloning LLVM..."
        git clone --depth 1 --branch "${LLVM_BRANCH}" "${LLVM_REPO}" "${LLVM_SRC}"
    fi

    log_success "LLVM source ready"
}

# ============================================================================
# Stage 1: Native tablegen tools
# ============================================================================

build_native_tools() {
    log_step "Stage 1: Building native tablegen tools"

    rm -rf "${NATIVE_BUILD}"
    mkdir -p "${NATIVE_BUILD}"
    cd "${NATIVE_BUILD}"

    # Build with all targets for tablegen
    cmake -G Ninja "${LLVM_SRC}/llvm" \
        -DCMAKE_BUILD_TYPE=Release \
        -DLLVM_TARGETS_TO_BUILD="ARM;RISCV" \
        -DLLVM_EXPERIMENTAL_TARGETS_TO_BUILD="Xtensa" \
        -DLLVM_ENABLE_PROJECTS="lld" \
        -DLLVM_INCLUDE_TESTS=OFF \
        -DLLVM_INCLUDE_EXAMPLES=OFF \
        -DLLVM_INCLUDE_BENCHMARKS=OFF

    log_info "Building tablegen with ${NUM_JOBS} jobs..."
    ninja -j${NUM_JOBS} llvm-tblgen

    log_success "Native tools built"
}

# ============================================================================
# Stage 2: WASM LLD Build
# ============================================================================

build_wasm_lld() {
    log_step "Stage 2: Building Universal LLD WASM"

    source "${EMSDK_DIR}/emsdk_env.sh"

    rm -rf "${WASM_BUILD}"
    mkdir -p "${WASM_BUILD}"
    cd "${WASM_BUILD}"

    log_info "Configuring WASM build with ARM + RISC-V + Xtensa..."

    emcmake cmake -G Ninja "${LLVM_SRC}/llvm" \
        -DCMAKE_BUILD_TYPE=MinSizeRel \
        \
        -DLLVM_TARGETS_TO_BUILD="ARM;RISCV" \
        -DLLVM_EXPERIMENTAL_TARGETS_TO_BUILD="Xtensa" \
        -DLLVM_ENABLE_PROJECTS="lld" \
        \
        -DLLVM_TABLEGEN="${NATIVE_BUILD}/bin/llvm-tblgen" \
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
        \
        -DHAVE_WAIT4=0 \
        -DHAVE_POSIX_SPAWN=0 \
        \
        -DCMAKE_EXE_LINKER_FLAGS="-sERROR_ON_UNDEFINED_SYMBOLS=0 -sALLOW_MEMORY_GROWTH=1 -sSTANDALONE_WASM=1 -sEXPORTED_FUNCTIONS=_main -sINVOKE_RUN=0 -sEXPORTED_RUNTIME_METHODS=callMain,FS" \
        -DCMAKE_CXX_FLAGS="-DHAVE_WAIT4=0 -fno-exceptions -fno-rtti"

    log_info "Building LLD with ${NUM_JOBS} jobs..."
    ninja -j${NUM_JOBS} lld

    log_success "WASM LLD build complete"
}

# ============================================================================
# Post-processing
# ============================================================================

process_output() {
    log_step "Processing output"

    cd "${WASM_BUILD}"

    # Find the built LLD
    local lld_wasm=""
    for candidate in "bin/lld.wasm" "bin/lld" "bin/ld.lld.wasm" "bin/ld.lld"; do
        if [ -f "$candidate" ]; then
            lld_wasm="$candidate"
            break
        fi
    done

    if [ -z "$lld_wasm" ]; then
        log_error "Could not find LLD binary in ${WASM_BUILD}/bin/"
    fi

    log_info "Found LLD: ${lld_wasm}"
    local original_size=$(stat -c%s "${lld_wasm}")
    log_info "Original size: $(numfmt --to=iec ${original_size})"

    # Copy to output
    cp "${lld_wasm}" "${OUTPUT_DIR}/${OUTPUT_WASM}"

    # Copy JS glue if exists
    local js_file="${lld_wasm%.wasm}.js"
    if [ -f "$js_file" ]; then
        cp "$js_file" "${OUTPUT_DIR}/${OUTPUT_JS}"
        log_info "Copied JS glue: ${OUTPUT_JS}"
    fi

    # Strip if available
    if command -v wasm-strip &> /dev/null; then
        log_info "Stripping WASM..."
        wasm-strip "${OUTPUT_DIR}/${OUTPUT_WASM}" || true
    fi

    # Compress
    log_info "Compressing..."
    gzip -9 -f -k "${OUTPUT_DIR}/${OUTPUT_WASM}"

    local final_size=$(stat -c%s "${OUTPUT_DIR}/${OUTPUT_WASM}")
    local compressed_size=$(stat -c%s "${OUTPUT_DIR}/${OUTPUT_COMPRESSED}")

    log_success "Output: ${OUTPUT_DIR}/${OUTPUT_WASM}"
    log_info "  Uncompressed: $(numfmt --to=iec ${final_size})"
    log_info "  Compressed:   $(numfmt --to=iec ${compressed_size})"
}

print_summary() {
    log_step "Build Summary"

    echo "Universal LLD WASM Build Complete!"
    echo ""
    echo "Supported targets:"
    echo "  - ARM (Cortex-M0/M3/M4/M7/M33)"
    echo "  - RISC-V (ESP32-C3, ESP32-C6, ESP32-H2)"
    echo "  - Xtensa (ESP32, ESP32-S2, ESP32-S3)"
    echo ""
    echo "Files:"
    echo "  ${OUTPUT_DIR}/${OUTPUT_WASM}"
    echo "  ${OUTPUT_DIR}/${OUTPUT_COMPRESSED}"
    [ -f "${OUTPUT_DIR}/${OUTPUT_JS}" ] && echo "  ${OUTPUT_DIR}/${OUTPUT_JS}"
    echo ""
    echo "SHA256:"
    sha256sum "${OUTPUT_DIR}/${OUTPUT_WASM}" | cut -d' ' -f1
    echo ""
    echo "To copy to your machine:"
    echo "  scp builder@192.168.1.62:${OUTPUT_DIR}/${OUTPUT_COMPRESSED} ."
}

# ============================================================================
# Main
# ============================================================================

main() {
    log_step "Universal LLD WASM Build (ARM + RISC-V + Xtensa)"
    log_info "Using ${NUM_JOBS} parallel jobs"

    local start_time=$(date +%s)

    setup_directories
    setup_emscripten
    clone_llvm
    build_native_tools
    build_wasm_lld
    process_output

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    print_summary
    log_success "Build time: $(($duration / 60))m $(($duration % 60))s"
}

main "$@"
