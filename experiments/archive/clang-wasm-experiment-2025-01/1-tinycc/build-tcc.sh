#!/bin/bash
# Build TinyCC for WebAssembly with ARM target support
#
# Reference: https://github.com/lupyuen/tcc-riscv32-wasm
# TinyCC source: https://repo.or.cz/tinycc.git

set -e

echo "=== TinyCC WASM Build Script ==="

# Check for Emscripten
if ! command -v emcc &> /dev/null; then
    echo "Error: Emscripten not found!"
    echo "Install from: https://emscripten.org/docs/getting_started/downloads.html"
    echo "Or run: git clone https://github.com/emscripten-core/emsdk.git && cd emsdk && ./emsdk install latest && ./emsdk activate latest"
    exit 1
fi

# Clone TinyCC if not present
if [ ! -d "tinycc" ]; then
    echo "Cloning TinyCC..."
    git clone https://repo.or.cz/tinycc.git
    cd tinycc

    # Checkout stable version
    git checkout mob

    cd ..
fi

cd tinycc

echo "Configuring TinyCC for WASM with ARM target..."

# Configure for WASM build
# --enable-cross: Enable ARM cross-compilation
# --cpu=wasm32: Target WASM
emconfigure ./configure \
    --enable-cross \
    --cpu=wasm32 \
    --triplet=arm-linux-gnueabi \
    --extra-cflags="-DTCC_TARGET_ARM -DTCC_ARM_EABI -DTCC_ARM_HARDFLOAT=0"

echo "Building TinyCC to WASM..."

# Build with Emscripten
emmake make \
    CC=emcc \
    LDFLAGS="-s WASM=1 \
             -s ALLOW_MEMORY_GROWTH=1 \
             -s EXPORTED_FUNCTIONS='[\"_tcc_new\",\"_tcc_delete\",\"_tcc_set_output_type\",\"_tcc_compile_string\",\"_tcc_relocate\",\"_tcc_get_symbol\",\"_tcc_add_library_path\",\"_tcc_add_include_path\"]' \
             -s EXPORTED_RUNTIME_METHODS='[\"ccall\",\"cwrap\",\"FS\"]' \
             -s MODULARIZE=1 \
             -s EXPORT_NAME='createTCCModule' \
             -s ENVIRONMENT=web \
             -s STACK_SIZE=1MB \
             -s INITIAL_MEMORY=32MB"

echo "TinyCC built successfully!"
echo "Output: tinycc/tcc.js and tcc.wasm"

# Copy to test directory
cp tcc.js ../test/
cp tcc.wasm ../test/

echo "Files copied to test/ directory"
echo "Open test-tcc.html in a browser to test"
