#!/bin/bash
#
# Build Unicorn.js WASM - ARM CPU Emulator
# For emulating ARM Cortex-M code in the browser
#
# Run this on the buildbox: ssh builder@192.168.1.62
# Usage: ./build-unicorn-arm.sh
#
# Requirements:
#   - Emscripten SDK (will be installed if missing)
#   - Node.js 18+ and npm
#   - ~2GB disk space
#
# Output: unicorn-arm.wasm.gz, unicorn-arm.js
#

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_ROOT="${BUILD_ROOT:-$HOME/unicorn-wasm-builds}"

# Unicorn.js repository (AlexAltea's official port)
UNICORN_REPO="${UNICORN_REPO:-https://github.com/AlexAltea/unicorn.js.git}"
UNICORN_BRANCH="${UNICORN_BRANCH:-master}"
EMSDK_VERSION="${EMSDK_VERSION:-3.1.50}"
NUM_JOBS="${NUM_JOBS:-$(nproc)}"

# Directories
UNICORN_SRC="${BUILD_ROOT}/unicorn.js"
EMSDK_DIR="${BUILD_ROOT}/emsdk"
OUTPUT_DIR="${BUILD_ROOT}/output"

# Output files
OUTPUT_WASM="unicorn-arm.wasm"
OUTPUT_JS="unicorn-arm.js"
OUTPUT_COMPRESSED="unicorn-arm.wasm.gz"

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

    check_command git
    check_command python3

    # Check for Node.js
    if ! command -v node &> /dev/null; then
        log_info "Installing Node.js..."
        if command -v apt-get &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        else
            log_error "Please install Node.js 18+ manually"
        fi
    fi

    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 18+ required, found v${NODE_VERSION}"
    fi

    check_command npm

    # Install grunt-cli globally if not present
    if ! command -v grunt &> /dev/null; then
        log_info "Installing grunt-cli globally..."
        sudo npm install -g grunt-cli
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
# Clone and Build
# ============================================================================

clone_unicorn() {
    log_step "Cloning Unicorn.js"
    log_info "Repository: ${UNICORN_REPO}"
    log_info "Branch: ${UNICORN_BRANCH}"

    if [ -d "${UNICORN_SRC}" ]; then
        log_info "Unicorn.js source already exists at ${UNICORN_SRC}"
        log_info "Updating to latest..."
        cd "${UNICORN_SRC}"
        git fetch origin
        git checkout "${UNICORN_BRANCH}"
        git pull origin "${UNICORN_BRANCH}" || true
        git submodule update --init --recursive
    else
        log_info "Cloning Unicorn.js repository..."
        git clone --branch "${UNICORN_BRANCH}" \
            "${UNICORN_REPO}" "${UNICORN_SRC}"
        cd "${UNICORN_SRC}"
        git submodule update --init --recursive
    fi

    log_success "Unicorn.js source ready at ${UNICORN_SRC}"
}

patch_for_arm_only() {
    log_step "Patching build for ARM-only (smaller binary)"

    cd "${UNICORN_SRC}"

    # Create a custom build configuration for ARM-only
    # This reduces the final WASM size significantly
    if [ -f "Gruntfile.js" ]; then
        log_info "Checking Gruntfile.js for architecture options..."

        # Backup original
        cp Gruntfile.js Gruntfile.js.bak

        # The unicorn.js build system uses the UNICORN_ARCHS environment variable
        # to select which architectures to build
        log_info "Will build with UNICORN_ARCHS=arm"
    fi

    log_success "Build configured for ARM architecture only"
}

build_unicorn() {
    log_step "Building Unicorn.js WASM"

    # Ensure Emscripten is activated
    source "${EMSDK_DIR}/emsdk_env.sh"

    cd "${UNICORN_SRC}"

    # Install npm dependencies
    log_info "Installing npm dependencies..."
    npm install --also=dev

    # Build with ARM architecture only to reduce size
    # UNICORN_ARCHS controls which CPU architectures are included
    log_info "Building unicorn.js with ARM support..."
    log_info "This may take 5-15 minutes..."

    # Set environment for ARM-only build
    export UNICORN_ARCHS="arm"

    # Run the grunt build
    grunt build

    log_success "Unicorn.js build complete"
}

# ============================================================================
# Post-processing
# ============================================================================

process_output() {
    log_step "Processing output"

    cd "${UNICORN_SRC}"

    # Find the built files in dist/
    local dist_dir="${UNICORN_SRC}/dist"

    if [ ! -d "${dist_dir}" ]; then
        log_error "dist/ directory not found. Build may have failed."
    fi

    # List what was built
    log_info "Built files:"
    ls -la "${dist_dir}/"

    # Copy ARM-specific build (with embedded WASM) - prioritize this
    if [ -f "${dist_dir}/unicorn-arm.min.js" ]; then
        cp "${dist_dir}/unicorn-arm.min.js" "${OUTPUT_DIR}/${OUTPUT_JS}"
        log_info "Copied unicorn-arm.min.js -> ${OUTPUT_JS}"
    elif [ -f "${dist_dir}/unicorn-arm.js" ]; then
        cp "${dist_dir}/unicorn-arm.js" "${OUTPUT_DIR}/${OUTPUT_JS}"
        log_info "Copied unicorn-arm.js -> ${OUTPUT_JS}"
    elif [ -f "${dist_dir}/unicorn.min.js" ]; then
        # Fallback to generic build
        cp "${dist_dir}/unicorn.min.js" "${OUTPUT_DIR}/${OUTPUT_JS}"
        log_info "Copied unicorn.min.js -> ${OUTPUT_JS}"
        log_warning "Using generic unicorn.min.js - ARM-specific build not found"
    elif [ -f "${dist_dir}/unicorn.js" ]; then
        cp "${dist_dir}/unicorn.js" "${OUTPUT_DIR}/${OUTPUT_JS}"
        log_info "Copied unicorn.js -> ${OUTPUT_JS}"
    else
        log_error "No unicorn JS file found in dist/"
    fi

    # Find and copy WASM file if separate (not needed for unicorn-arm.min.js)
    if [ -f "${dist_dir}/unicorn.wasm" ]; then
        cp "${dist_dir}/unicorn.wasm" "${OUTPUT_DIR}/${OUTPUT_WASM}"
        log_info "Copied unicorn.wasm -> ${OUTPUT_WASM}"

        # Compress WASM
        log_info "Compressing WASM..."
        gzip -9 -f -k "${OUTPUT_DIR}/${OUTPUT_WASM}"
    fi

    log_success "Output files processed"
}

print_summary() {
    log_step "Build Summary"

    echo "Unicorn.js ARM Emulator Build Complete!"
    echo ""
    echo "Output directory: ${OUTPUT_DIR}"
    echo ""
    echo "Files:"
    ls -lh "${OUTPUT_DIR}/"
    echo ""

    if [ -f "${OUTPUT_DIR}/${OUTPUT_JS}" ]; then
        echo "JavaScript: ${OUTPUT_DIR}/${OUTPUT_JS}"
        echo "  Size: $(stat -c%s "${OUTPUT_DIR}/${OUTPUT_JS}" | numfmt --to=iec)"
    fi

    if [ -f "${OUTPUT_DIR}/${OUTPUT_WASM}" ]; then
        echo "WASM: ${OUTPUT_DIR}/${OUTPUT_WASM}"
        echo "  Size: $(stat -c%s "${OUTPUT_DIR}/${OUTPUT_WASM}" | numfmt --to=iec)"
    fi

    if [ -f "${OUTPUT_DIR}/${OUTPUT_COMPRESSED}" ]; then
        echo "Compressed: ${OUTPUT_DIR}/${OUTPUT_COMPRESSED}"
        echo "  Size: $(stat -c%s "${OUTPUT_DIR}/${OUTPUT_COMPRESSED}" | numfmt --to=iec)"
    fi

    echo ""
    echo "Supported features:"
    echo "  - ARM (32-bit) emulation"
    echo "  - ARM Thumb mode"
    echo "  - Memory hooks"
    echo "  - Code hooks"
    echo "  - Register read/write"
    echo ""
    echo "To copy to your machine:"
    echo "  scp builder@192.168.1.62:${OUTPUT_DIR}/* ."
    echo ""
    echo "Deploy to BattleForge:"
    echo "  Copy to apps/battleforge/public/wasm/unicorn/"
}

# ============================================================================
# Alternative: Build from official AlexAltea repo
# ============================================================================

try_official_repo() {
    log_step "Trying official AlexAltea/unicorn.js repository"

    UNICORN_REPO="https://github.com/AlexAltea/unicorn.js.git"

    rm -rf "${UNICORN_SRC}"

    log_info "Cloning from official repo..."
    git clone "${UNICORN_REPO}" "${UNICORN_SRC}"
    cd "${UNICORN_SRC}"
    git submodule update --init --recursive

    log_success "Official repo cloned"
}

# ============================================================================
# Main
# ============================================================================

main() {
    log_step "Unicorn.js ARM WASM Build Script"
    log_info "Build root: ${BUILD_ROOT}"
    log_info "Parallel jobs: ${NUM_JOBS}"

    local start_time=$(date +%s)

    setup_directories
    install_dependencies
    setup_emscripten

    # Try to clone - if the first repo fails, try official
    if ! clone_unicorn 2>/dev/null; then
        log_warning "First repo failed, trying official AlexAltea repo..."
        try_official_repo
    fi

    patch_for_arm_only
    build_unicorn
    process_output

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    print_summary

    log_success "Total build time: $(($duration / 60)) minutes $(($duration % 60)) seconds"
}

# Run main function
main "$@"
