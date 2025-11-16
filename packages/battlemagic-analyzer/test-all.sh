#!/bin/bash

# BattleMagic Analyzer - Complete Test Suite
# Runs ALL tests including benchmarks

set -e

echo "========================================"
echo "BattleMagic Analyzer - Complete Test Suite"
echo "========================================"
echo ""

# Run standard tests
./test.sh

# Run benchmarks
echo ""
echo "[BONUS] Running performance benchmarks..."
echo "----------------------------------------"
echo "This may take several minutes..."
echo ""
cargo bench --bench analyzer_bench

echo ""
echo "========================================"
echo "All tests and benchmarks complete!"
echo "========================================"
echo ""
echo "Check target/criterion for benchmark reports"
echo ""
