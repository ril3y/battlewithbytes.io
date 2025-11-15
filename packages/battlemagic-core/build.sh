#!/bin/bash
set -e

echo "Building BattleMagic WASM core..."

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "Error: wasm-pack not found!"
    echo "Install it with: cargo install wasm-pack"
    exit 1
fi

# Build mode
if [ "$1" = "--dev" ]; then
    echo "Building in development mode..."
    wasm-pack build --target web --out-dir pkg --dev
else
    echo "Building in release mode..."
    wasm-pack build --target web --out-dir pkg --release
fi

echo "WASM build complete! Output in pkg/"
