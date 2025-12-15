#!/bin/bash
#
# Build Clang WASM with ARM Backend
# For STM32, nRF52, RP2040, and other ARM Cortex-M microcontrollers
#
# This script wraps the clang-arm repo's build process with:
# - Automatic submodule initialization
# - Parallel builds using all available cores
# - Output to a known location for easy retrieval
#
# Usage: ./build-clang-arm.sh
#

set -euo pipefail

# Configuration
BUILD_ROOT="${BUILD_ROOT:-$HOME/clang-wasm-builds}"
LLVM_REPO="${LLVM_REPO:-https://github.com/ril3y/clang-arm.git}"
LLVM_BRANCH="${LLVM_BRANCH:-develop}"
NUM_JOBS="${NUM_JOBS:-$(nproc)}"

# Directories
REPO_DIR="${BUILD_ROOT}/llvm-arm"
OUTPUT_DIR="${BUILD_ROOT}/output"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
log_step() { echo -e "\n${GREEN}========================================${NC}\n${GREEN}$1${NC}\n${GREEN}========================================${NC}\n"; }

# ============================================================================
# Setup
# ============================================================================

setup() {
    log_step "Setup"
    mkdir -p "${BUILD_ROOT}" "${OUTPUT_DIR}"
    log_info "Build root: ${BUILD_ROOT}"
    log_info "Parallel jobs: ${NUM_JOBS}"
}

# ============================================================================
# Clone/Update Repository
# ============================================================================

clone_repo() {
    log_step "Cloning/Updating Repository"

    if [ -d "${REPO_DIR}" ]; then
        log_info "Repository exists, updating..."
        cd "${REPO_DIR}"
        git fetch origin
        git checkout "${LLVM_BRANCH}"
        git pull origin "${LLVM_BRANCH}" || true
    else
        log_info "Cloning ${LLVM_REPO}..."
        git clone --branch "${LLVM_BRANCH}" "${LLVM_REPO}" "${REPO_DIR}"
    fi

    cd "${REPO_DIR}"

    # Initialize submodules (critical - llvm-src contains actual source)
    log_info "Initializing submodules..."
    git submodule update --init llvm-src
    git submodule update --init wasi-libc-src

    if [ ! -d "${REPO_DIR}/llvm-src/llvm" ]; then
        log_error "LLVM source not found after submodule init!"
    fi

    log_success "Repository ready"
}

# ============================================================================
# Setup WASI SDK
# ============================================================================

setup_wasi_sdk() {
    log_step "Setting up WASI SDK"

    cd "${REPO_DIR}"

    WASI_VER=27
    WASI_SDK="wasi-sdk-${WASI_VER}.0-x86_64-linux"

    if [ -d "${WASI_SDK}" ]; then
        log_info "WASI SDK already present"
    else
        log_info "Downloading WASI SDK..."
        curl -L "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-${WASI_VER}/${WASI_SDK}.tar.gz" | tar xzf -
    fi

    log_success "WASI SDK ready"
}

# ============================================================================
# Build Native Tools (tablegen)
# ============================================================================

build_native_tools() {
    log_step "Building Native Tablegen Tools"

    cd "${REPO_DIR}"

    if [ -f "llvm-tblgen-build/bin/llvm-tblgen" ] && [ -f "llvm-tblgen-build/bin/clang-tblgen" ]; then
        log_info "Native tools already built, skipping..."
        return
    fi

    mkdir -p llvm-tblgen-build

    cmake -B llvm-tblgen-build -S llvm-src/llvm \
        -DLLVM_CCACHE_BUILD=ON \
        -DCMAKE_BUILD_TYPE=MinSizeRel \
        -DLLVM_BUILD_RUNTIME=OFF \
        -DLLVM_BUILD_TOOLS=OFF \
        -DLLVM_INCLUDE_UTILS=OFF \
        -DLLVM_INCLUDE_RUNTIMES=OFF \
        -DLLVM_INCLUDE_EXAMPLES=OFF \
        -DLLVM_INCLUDE_TESTS=OFF \
        -DLLVM_INCLUDE_BENCHMARKS=OFF \
        -DLLVM_INCLUDE_DOCS=OFF \
        -DLLVM_TARGETS_TO_BUILD="ARM" \
        -DLLVM_ENABLE_PROJECTS="clang"

    cmake --build llvm-tblgen-build --target llvm-tblgen --target clang-tblgen -j${NUM_JOBS}

    log_success "Native tools built"
}

# ============================================================================
# Build WASM Clang
# ============================================================================

build_wasm() {
    log_step "Building WASM Clang (this takes a while...)"

    cd "${REPO_DIR}"

    WASI_SDK_PATH="${REPO_DIR}/wasi-sdk-27.0-x86_64-linux"
    WASI_TARGET="wasm32-wasip1"

    # Create toolchain file
    cat > Toolchain-WASI-LLVM.cmake <<EOF
set(CMAKE_SYSTEM_NAME WASI)
set(CMAKE_SYSTEM_VERSION 1)
set(CMAKE_SYSTEM_PROCESSOR wasm32)
set(WASI 1)

set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)

set(CMAKE_C_COMPILER ${WASI_SDK_PATH}/bin/clang)
set(CMAKE_C_COMPILER_TARGET ${WASI_TARGET})
set(CMAKE_CXX_COMPILER ${WASI_SDK_PATH}/bin/clang++)
set(CMAKE_CXX_COMPILER_TARGET ${WASI_TARGET})
set(CMAKE_LINKER ${WASI_SDK_PATH}/bin/wasm-ld)
set(CMAKE_AR ${WASI_SDK_PATH}/bin/ar)
set(CMAKE_RANLIB ${WASI_SDK_PATH}/bin/ranlib)

set(CMAKE_C_FLAGS "--sysroot ${WASI_SDK_PATH}/share/wasi-sysroot -D_WASI_EMULATED_MMAN -flto")
set(CMAKE_CXX_FLAGS "--sysroot ${WASI_SDK_PATH}/share/wasi-sysroot -D_WASI_EMULATED_MMAN -flto")
set(CMAKE_EXE_LINKER_FLAGS "--sysroot ${WASI_SDK_PATH}/share/wasi-sysroot -lwasi-emulated-mman -Wl,--max-memory=4294967296 -Wl,-z,stack-size=8388608,--stack-first -flto -Wl,--strip-all")
EOF

    mkdir -p llvm-build

    cmake -B llvm-build -S llvm-src/llvm \
        -DCMAKE_TOOLCHAIN_FILE=../Toolchain-WASI-LLVM.cmake \
        -DLLVM_CCACHE_BUILD=ON \
        -DLLVM_NATIVE_TOOL_DIR="${REPO_DIR}/llvm-tblgen-build/bin" \
        -DCMAKE_BUILD_TYPE=MinSizeRel \
        -DLLVM_TARGETS_TO_BUILD="ARM" \
        -DLLVM_DEFAULT_TARGET_TRIPLE="${WASI_TARGET}" \
        -DLLVM_ENABLE_PROJECTS="clang" \
        -DLLVM_ENABLE_ASSERTIONS=ON \
        -DLLVM_BUILD_SHARED_LIBS=OFF \
        -DLLVM_ENABLE_PIC=OFF \
        -DLLVM_BUILD_STATIC=ON \
        -DLLVM_ENABLE_THREADS=OFF \
        -DLLVM_BUILD_RUNTIME=OFF \
        -DLLVM_BUILD_TOOLS=OFF \
        -DLLVM_INCLUDE_UTILS=OFF \
        -DLLVM_INCLUDE_RUNTIMES=OFF \
        -DLLVM_INCLUDE_EXAMPLES=OFF \
        -DLLVM_INCLUDE_TESTS=OFF \
        -DLLVM_INCLUDE_BENCHMARKS=OFF \
        -DLLVM_INCLUDE_DOCS=OFF \
        -DCLANG_ENABLE_ARCMT=OFF \
        -DCLANG_ENABLE_STATIC_ANALYZER=OFF \
        -DCLANG_INCLUDE_TESTS=OFF \
        -DCLANG_BUILD_TOOLS=OFF \
        -DCLANG_BUILD_EXAMPLES=OFF \
        -DCLANG_INCLUDE_DOCS=OFF \
        -DDEFAULT_SYSROOT=/usr \
        -DCLANG_RESOURCE_DIR=/usr

    log_info "Building llvm-driver with ${NUM_JOBS} parallel jobs..."
    cmake --build llvm-build --target llvm-driver -j${NUM_JOBS}

    # Build resource headers
    cmake --build llvm-build --target clang-resource-headers -j${NUM_JOBS}

    log_success "WASM build complete"
}

# ============================================================================
# Process Output
# ============================================================================

process_output() {
    log_step "Processing Output"

    cd "${REPO_DIR}"

    # Find the WASM binary (WASI SDK outputs without .wasm extension)
    local wasm_file=""
    for candidate in "llvm-build/bin/llvm" "llvm-build/bin/llvm.wasm" "llvm-build/bin/llvm-driver" "llvm-build/bin/clang"; do
        if [ -f "${candidate}" ]; then
            wasm_file="${candidate}"
            break
        fi
    done

    if [ -z "${wasm_file}" ]; then
        log_error "Could not find WASM binary!"
    fi

    log_info "Found: ${wasm_file}"

    # Copy to output
    cp "${wasm_file}" "${OUTPUT_DIR}/clang-arm.wasm"

    # Compress
    log_info "Compressing..."
    gzip -9 -f -k "${OUTPUT_DIR}/clang-arm.wasm"

    # Show results
    local size=$(stat -c%s "${OUTPUT_DIR}/clang-arm.wasm.gz")
    local hash=$(sha256sum "${OUTPUT_DIR}/clang-arm.wasm.gz" | cut -d' ' -f1)

    log_success "Output: ${OUTPUT_DIR}/clang-arm.wasm.gz"
    log_info "Size: $(numfmt --to=iec ${size})"
    log_info "SHA256: ${hash}"
}

# ============================================================================
# Main
# ============================================================================

main() {
    log_step "Clang ARM WASM Build"

    local start_time=$(date +%s)

    setup
    clone_repo
    setup_wasi_sdk
    build_native_tools
    build_wasm
    process_output

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    log_step "Build Complete!"
    log_success "Total time: $(($duration / 60)) minutes $(($duration % 60)) seconds"
    log_info "Output: ${OUTPUT_DIR}/clang-arm.wasm.gz"
}

main "$@"
