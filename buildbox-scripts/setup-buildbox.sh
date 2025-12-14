#!/bin/bash
#
# Setup script for the Clang WASM build box
# Run this once to prepare the buildbox for building Clang WASM binaries
#
# Usage: ssh builder@192.168.1.62 'bash -s' < setup-buildbox.sh
#    or: ./setup-buildbox.sh (if already on the buildbox)

set -euo pipefail

echo "========================================="
echo "Setting up Clang WASM Build Environment"
echo "========================================="
echo ""

# Update system
echo "[1/5] Updating system packages..."
if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y \
        build-essential \
        cmake \
        ninja-build \
        python3 \
        python3-pip \
        git \
        curl \
        wget \
        wabt \
        zlib1g-dev
elif command -v dnf &> /dev/null; then
    sudo dnf install -y \
        gcc \
        gcc-c++ \
        cmake \
        ninja-build \
        python3 \
        python3-pip \
        git \
        curl \
        wget \
        wabt \
        zlib-devel
else
    echo "Warning: Unsupported package manager. Please install dependencies manually."
fi

# Create build directory
echo ""
echo "[2/5] Creating build directory..."
BUILD_ROOT="${HOME}/clang-wasm-builds"
mkdir -p "${BUILD_ROOT}"
echo "Build directory: ${BUILD_ROOT}"

# Install Emscripten SDK
echo ""
echo "[3/5] Installing Emscripten SDK..."
EMSDK_DIR="${BUILD_ROOT}/emsdk"
if [ ! -d "${EMSDK_DIR}" ]; then
    git clone https://github.com/emscripten-core/emsdk.git "${EMSDK_DIR}"
    cd "${EMSDK_DIR}"
    ./emsdk install 3.1.50
    ./emsdk activate 3.1.50
    echo "Emscripten installed at ${EMSDK_DIR}"
else
    echo "Emscripten already installed at ${EMSDK_DIR}"
fi

# Add emsdk to shell profile
echo ""
echo "[4/5] Configuring shell environment..."
if ! grep -q "emsdk_env.sh" ~/.bashrc 2>/dev/null; then
    echo "" >> ~/.bashrc
    echo "# Emscripten SDK" >> ~/.bashrc
    echo "source ${EMSDK_DIR}/emsdk_env.sh 2>/dev/null || true" >> ~/.bashrc
    echo "Added emsdk to ~/.bashrc"
else
    echo "emsdk already in ~/.bashrc"
fi

# Verify installation
echo ""
echo "[5/5] Verifying installation..."
source "${EMSDK_DIR}/emsdk_env.sh"
echo ""
echo "Installed versions:"
echo "  CMake:      $(cmake --version | head -n1)"
echo "  Ninja:      $(ninja --version)"
echo "  Python:     $(python3 --version)"
echo "  Git:        $(git --version)"
echo "  Emscripten: $(emcc --version | head -n1)"

if command -v wasm-strip &> /dev/null; then
    echo "  wabt:       $(wasm-strip --version 2>&1 | head -n1 || echo 'installed')"
else
    echo "  wabt:       NOT INSTALLED (optional, for stripping binaries)"
fi

echo ""
echo "========================================="
echo "Build Environment Ready!"
echo "========================================="
echo ""
echo "Build scripts available:"
echo "  - build-clang-riscv.sh  (ESP32-C3, C6, H2)"
echo "  - build-clang-xtensa.sh (ESP32, S2, S3)"
echo ""
echo "Copy scripts to the buildbox:"
echo "  scp buildbox-scripts/*.sh builder@192.168.1.62:~/"
echo ""
echo "Run a build:"
echo "  ssh builder@192.168.1.62"
echo "  ./build-clang-riscv.sh"
echo ""
