#!/bin/bash

# BattleMagic Analyzer - Test Runner (Unix/Linux/macOS)
# Runs all tests for the WASM module

set -e  # Exit on error

echo "========================================"
echo "BattleMagic Analyzer - Test Suite"
echo "========================================"
echo ""

# Check if cargo is installed
if ! command -v cargo &> /dev/null; then
    echo "Error: Cargo not found. Please install Rust."
    exit 1
fi

# 1. Run Rust unit tests
echo "[1/5] Running Rust unit tests..."
echo "----------------------------------------"
cargo test --lib
echo ""

# 2. Run Rust integration tests
echo "[2/5] Running Rust integration tests..."
echo "----------------------------------------"
cargo test --test integration_test
echo ""

# 3. Build WASM module
echo "[3/5] Building WASM module..."
echo "----------------------------------------"
./build.sh
echo ""

# 4. Run Node.js tests (if pkg directory exists)
if [ -f "pkg/package.json" ]; then
    echo "[4/5] Running Node.js tests..."
    echo "----------------------------------------"
    node test-node.js
    echo ""
else
    echo "[4/5] Skipping Node.js tests (pkg not built)"
    echo ""
fi

# 5. Run standalone test binary with sample data
echo "[5/5] Running standalone binary tests..."
echo "----------------------------------------"
if [ -d "test-data" ]; then
    echo "Testing simple.txt:"
    cargo run --bin test_analyzer -- test-data/simple.txt
    echo ""

    echo "Testing complex.txt:"
    cargo run --bin test_analyzer -- test-data/complex.txt
    echo ""

    echo "Testing data-refs.txt:"
    cargo run --bin test_analyzer -- test-data/data-refs.txt
    echo ""
else
    echo "Warning: test-data directory not found, skipping"
    echo ""
fi

echo "========================================"
echo "All tests passed!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  - Open test-browser.html in a browser for browser tests"
echo "  - Run 'cargo bench' for performance benchmarks"
echo ""
