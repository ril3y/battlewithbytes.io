#!/bin/bash

# BattleMagic Analyzer Build Script
# Builds the Rust WASM module with optimal settings

set -e

echo "Building BattleMagic Binary Analyzer..."

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "Error: wasm-pack not found. Install with: cargo install wasm-pack"
    exit 1
fi

# Determine build mode
BUILD_MODE=${1:-release}

if [ "$BUILD_MODE" = "dev" ]; then
    echo "Building in development mode (fast compilation)..."
    wasm-pack build --dev --target web
else
    echo "Building in release mode (optimized)..."
    wasm-pack build --release --target web

    # Optional: Further optimize with wasm-opt if available
    if command -v wasm-opt &> /dev/null; then
        echo "Running wasm-opt for additional size reduction..."
        wasm-opt -Oz -o pkg/battlemagic_analyzer_bg_opt.wasm pkg/battlemagic_analyzer_bg.wasm
        mv pkg/battlemagic_analyzer_bg_opt.wasm pkg/battlemagic_analyzer_bg.wasm
    fi
fi

echo "Build complete! Output in pkg/ directory"
echo ""
echo "File sizes:"
ls -lh pkg/*.wasm 2>/dev/null || ls -l pkg/*.wasm
echo ""
echo "To use in your project:"
echo "  npm install ../../packages/battlemagic-analyzer/pkg"
