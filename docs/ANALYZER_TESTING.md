# BattleMagic Analyzer - Testing Guide

This document describes the comprehensive testing suite for the BattleMagic Analyzer WASM module.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Test Files](#test-files)
- [Performance Benchmarks](#performance-benchmarks)
- [CI/CD Integration](#cicd-integration)
- [Adding New Tests](#adding-new-tests)
- [Troubleshooting](#troubleshooting)

## Overview

The testing suite validates the BattleMagic Analyzer across multiple environments and use cases:

- **Rust Unit Tests**: Test core logic without WASM compilation
- **Rust Integration Tests**: Test complete workflows with realistic ARM code
- **Node.js Tests**: Verify WASM module works in Node.js environment
- **Browser Tests**: Automated test suite in real browser environment
- **Standalone Binary**: Command-line tool for testing with custom binaries
- **Performance Benchmarks**: Measure and track performance metrics

## Quick Start

### Run All Tests (Recommended)

**Windows:**

```bash
cd packages/battlemagic-analyzer
test.bat
```

**Unix/Linux/macOS:**

```bash
cd packages/battlemagic-analyzer
chmod +x test.sh
./test.sh
```

### Run Specific Test Suites

```bash
# Rust unit tests only
cargo test --lib

# Integration tests only
cargo test --test integration_test

# Node.js tests only (after building WASM)
node test-node.js

# Benchmarks only
cargo bench
```

## Test Types

### 1. Rust Unit Tests

**Location:** `src/lib.rs`, `src/xref.rs`, `src/types.rs`

**Purpose:** Test individual components and functions in isolation.

**Coverage:**

- Analyzer creation and initialization
- Branch detection (b, b.eq, b.ne, etc.)
- Function call detection (bl, blx)
- PC-relative data reference parsing
- Address calculation edge cases
- Empty and invalid input handling
- Large binary stress testing (10,000 instructions)
- Cross-reference query operations
- Analyzer reset functionality

**Running:**

```bash
cargo test --lib
```

**Example Output:**

```
running 13 tests
test tests::test_analyzer_creation ... ok
test tests::test_branch_detection ... ok
test tests::test_call_detection ... ok
test tests::test_data_reference_parsing ... ok
test tests::test_pc_relative_calculation ... ok
test tests::test_empty_input ... ok
test tests::test_invalid_address_formats ... ok
test tests::test_large_binary ... ok
test tests::test_xref_queries ... ok
test tests::test_mixed_instruction_types ... ok
test tests::test_address_edge_cases ... ok
test tests::test_analyzer_reset ... ok

test result: ok. 13 passed; 0 failed; 0 ignored
```

### 2. Rust Integration Tests

**Location:** `tests/integration_test.rs`

**Purpose:** Test complete analysis workflows with realistic ARM code patterns.

**Test Cases:**

- Complete function with prologue/epilogue
- Multiple functions with cross-calls
- Jump table patterns (switch statements)
- Loop patterns (for, while, do-while, nested)
- Literal pool patterns
- Recursive functions
- Mutual recursion
- Error handling paths
- Thumb/ARM mode transitions
- Large binary analysis (1,000 functions)

**Running:**

```bash
cargo test --test integration_test
```

**Example Output:**

```
running 10 tests
test test_complete_function_analysis ... ok
test test_multiple_functions_with_calls ... ok
test test_jump_table_pattern ... ok
test test_loop_pattern ... ok
test test_literal_pool_pattern ... ok
test test_recursive_function ... ok
test test_interleaved_code_and_data ... ok
test test_error_handling_pattern ... ok
test test_realistic_binary_size ... ok

test result: ok. 10 passed; 0 failed; 0 ignored
```

### 3. Node.js Tests

**Location:** `test-node.js`

**Purpose:** Verify WASM module works correctly in Node.js environment.

**Test Coverage:**

- Module loading and initialization
- Simple ARM analysis
- Branch detection
- Call detection
- Data reference parsing
- PC-relative address calculation
- Cross-reference queries
- Empty input handling
- Invalid input handling
- Analyzer reset
- Large binary stress test (10,000 instructions)
- Complete function analysis
- Error handling before analysis

**Prerequisites:**

```bash
# Build WASM module first
./build.bat   # Windows
./build.sh    # Unix/Linux/macOS
```

**Running:**

```bash
node test-node.js
```

**Example Output:**

```
=== BattleMagic Analyzer WASM Test Suite ===

Loading WASM module...
WASM module loaded successfully!

Test 1: Analyzer Creation
  ✓ Analyzer instance created
  ✓ Analyzer not analyzed initially
  ✓ Initial xref count is zero

Test 2: Simple ARM Analysis
  ✓ Analysis results returned
  ✓ Correct instruction count
  ✓ Detected 3 cross-references
  ✓ Analyzer marked as analyzed

... (additional tests)

=== Test Summary ===

Total tests run: 40
Tests passed: 40
Tests failed: 0

Pass rate: 100.0%

✓ All tests passed!
```

### 4. Browser Tests

**Location:** `test-browser.html`

**Purpose:** Interactive test suite for browser environment with visual feedback.

**Features:**

- Real-time test execution with status updates
- Performance metrics dashboard
- Detailed test results with pass/fail indicators
- Progress bar
- Test log output
- Individual or grouped test execution

**Running:**

```bash
# Option 1: Open directly in browser
start test-browser.html   # Windows
open test-browser.html     # macOS
xdg-open test-browser.html # Linux

# Option 2: Using a local server (recommended for CORS)
npx serve .
# Then navigate to http://localhost:3000/test-browser.html
```

**Test Categories:**

- **Unit Tests:** Basic WASM functionality
- **Integration Tests:** Complex scenarios and stress tests
- **Performance Metrics:** Analysis time, throughput, memory usage

### 5. Standalone Test Binary

**Location:** `src/bin/test_analyzer.rs`

**Purpose:** Command-line tool for analyzing custom ARM binary files.

**Features:**

- Load ARM assembly from text files
- Analyze and report cross-references
- JSON output option for automation
- Verbose mode for detailed xref lists
- Performance timing

**Usage:**

```bash
# Basic analysis
cargo run --bin test_analyzer -- test-data/simple.txt

# With verbose output
cargo run --bin test_analyzer -- test-data/complex.txt --verbose

# JSON output for automation
cargo run --bin test_analyzer -- test-data/data-refs.txt --json
```

**Input File Format:**

```
# Comments start with # or //
<address> <mnemonic> <operands>

# Example:
0x8000 bl #0x9000
0x8004 b.eq #0x8010
0x8008 ldr r0, [pc, #0x20]
```

**Example Output:**

```
BattleMagic Analyzer - Standalone Test Tool
============================================

Analysis Results:
  Total Instructions: 8
  Analysis Time:      0.15ms

Cross-Reference Statistics:
  Total Xrefs:        5
    Calls:            2
    Branches:         2
    Data References:  1

Address Range:
  Start:              0x00008000
  End:                0x0000801c
  Unique Targets:     5

Analysis complete!
```

## Test Files

### Sample Test Data

**Location:** `test-data/`

All test files use the same format: `<address> <mnemonic> <operands>`

| File            | Description                   | Expected Xrefs          |
| --------------- | ----------------------------- | ----------------------- |
| `simple.txt`    | Basic function with branches  | 2                       |
| `complex.txt`   | Multiple functions with calls | Multiple                |
| `data-refs.txt` | PC-relative data accesses     | High data ref ratio     |
| `loop.txt`      | Various loop patterns         | Backward branches       |
| `switch.txt`    | Jump table pattern            | Multiple to same target |
| `recursive.txt` | Recursive function calls      | Self-references         |

See `test-data/README.md` for detailed descriptions.

## Performance Benchmarks

**Location:** `benches/analyzer_bench.rs`

**Purpose:** Measure and track performance over time using Criterion.

**Benchmark Groups:**

1. **Small Analysis** (10-500 instructions)
   - Pure calls
   - Pure branches
   - Pure data references
   - Mixed instructions

2. **Large Analysis** (1,000-50,000 instructions)
   - Mixed instruction types
   - Stress testing

3. **Xref Queries**
   - Query hot addresses (many refs)
   - Query cold addresses (no refs)
   - Query from address
   - Count operations

4. **Address Parsing**
   - Hex address parsing
   - PC-relative calculations

5. **Instruction Classification**
   - is_call performance
   - is_branch performance
   - is_data_ref performance

6. **Realistic Functions**
   - Complete function analysis

7. **Memory Overhead**
   - Builder creation with various sizes

**Running Benchmarks:**

```bash
# Run all benchmarks
cargo bench

# Run specific benchmark group
cargo bench analysis_small
cargo bench xref_queries

# Save baseline for comparison
cargo bench -- --save-baseline main

# Compare against baseline
cargo bench -- --baseline main
```

**Output Location:** `target/criterion/`

**Example Output:**

```
analysis_small/calls/10    time: [245.32 ns 247.89 ns 250.63 ns]
analysis_small/calls/50    time: [1.2341 µs 1.2456 µs 1.2578 µs]
analysis_small/calls/100   time: [2.4567 µs 2.4789 µs 2.5012 µs]
...
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown

      - name: Install wasm-pack
        run: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

      - name: Run tests
        working-directory: packages/battlemagic-analyzer
        run: |
          chmod +x test.sh
          ./test.sh

      - name: Run benchmarks
        working-directory: packages/battlemagic-analyzer
        run: cargo bench --bench analyzer_bench
```

### Test Scripts for CI

**All-in-one test runner:**

```bash
# Unix/Linux/macOS
./test-all.sh

# Windows
test-all.bat
```

This runs:

1. Rust unit tests
2. Rust integration tests
3. WASM build
4. Node.js tests
5. Standalone binary tests
6. Performance benchmarks

## Adding New Tests

### Adding a Rust Unit Test

Edit `src/lib.rs` or module files:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_feature() {
        // Arrange
        let analyzer = BinaryAnalyzer::new(0x8000);

        // Act
        // ... test code

        // Assert
        assert_eq!(result, expected);
    }
}
```

### Adding an Integration Test

Edit `tests/integration_test.rs`:

```rust
#[test]
fn test_new_pattern() {
    let instructions = vec![
        // Create test instructions
    ];

    let mut builder = XrefBuilder::new();
    builder.build_from_instructions(&instructions);

    // Assertions
    assert_eq!(builder.count(), expected_count);
}
```

### Adding a Node.js Test

Edit `test-node.js`:

```javascript
log("Test N: New Test", "info");
try {
  const analyzer = new BinaryAnalyzer(0x1000);
  // ... test code
  assert(condition, "Test description");
  log("");
} catch (error) {
  log(`Test failed: ${error.message}`, "error");
}
```

### Adding a Browser Test

Edit `test-browser.html` in the appropriate test function:

```javascript
testDiv = createTestElement("New Test Name", "unit-tests");
try {
  const analyzer = new BinaryAnalyzer(0x1000);
  // ... test code
  updateTestResult(testDiv, passed, message);
} catch (error) {
  updateTestResult(testDiv, false, `Error: ${error.message}`);
}
```

### Adding Test Data

Create a new file in `test-data/`:

```
# test-data/my-test.txt
# Description of what this tests

0x1000 bl #0x2000
0x1004 b.eq #0x1010
...
```

Then test with:

```bash
cargo run --bin test_analyzer -- test-data/my-test.txt
```

### Adding a Benchmark

Edit `benches/analyzer_bench.rs`:

```rust
fn bench_new_feature(c: &mut Criterion) {
    let mut group = c.benchmark_group("new_feature");

    group.bench_function("test_case", |b| {
        b.iter(|| {
            // Code to benchmark
            black_box(result)
        });
    });

    group.finish();
}

// Add to criterion_group!
criterion_group!(benches, ..., bench_new_feature);
```

## Troubleshooting

### WASM Build Fails

**Problem:** `wasm-pack` not found or build errors

**Solution:**

```bash
# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Or via cargo
cargo install wasm-pack

# Ensure wasm32 target is installed
rustup target add wasm32-unknown-unknown
```

### Node.js Tests Fail with Module Not Found

**Problem:** Cannot find `./pkg` module

**Solution:**

```bash
# Build WASM module first
./build.bat   # Windows
./build.sh    # Unix/Linux/macOS
```

### Browser Tests Don't Load

**Problem:** CORS errors or module loading issues

**Solution:**

```bash
# Use a local server instead of file://
npx serve .
# Navigate to http://localhost:3000/test-browser.html
```

### Tests Pass Locally But Fail in CI

**Problem:** Environment differences

**Solution:**

- Check Rust version: `rustc --version`
- Ensure wasm32 target installed
- Verify wasm-pack version
- Check Node.js version for WASM compatibility

### Benchmarks Take Too Long

**Problem:** Benchmarks run for extended periods

**Solution:**

```bash
# Run specific benchmark group
cargo bench analysis_small

# Reduce sample size (edit benchmark file)
group.sample_size(10);

# Run quick benchmarks only
cargo bench -- --quick
```

## Test Coverage Statistics

Target coverage goals:

- **Unit Tests:** 90%+ line coverage
- **Integration Tests:** All major code paths
- **Browser Tests:** All public API functions
- **Node.js Tests:** WASM interop validation
- **Benchmarks:** All performance-critical paths

Generate coverage report (requires tarpaulin):

```bash
cargo install cargo-tarpaulin
cargo tarpaulin --out Html
```

## Expected Test Results

### Passing Criteria

All tests should pass with:

- 0 failed tests
- 100% pass rate
- No panics or crashes
- Benchmarks complete without errors

### Performance Expectations

Typical performance metrics (may vary by system):

- **Small analysis (100 instructions):** < 10µs
- **Medium analysis (1,000 instructions):** < 100µs
- **Large analysis (10,000 instructions):** < 1ms
- **Xref queries:** < 1µs
- **WASM load time:** < 50ms

## Continuous Improvement

- Run `cargo bench` regularly to track performance
- Add tests for bug fixes to prevent regressions
- Update integration tests for new ARM patterns
- Expand browser tests for new features
- Keep test data realistic and diverse

## Support

For issues or questions:

- Check this documentation
- Review test output for specific errors
- Examine test source code for examples
- See main README.md for project information
