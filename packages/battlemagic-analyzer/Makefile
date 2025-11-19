# BattleMagic Analyzer - Makefile
# Quick commands for common operations

.PHONY: help build test analyze clean examples

# Default target
help:
	@echo "BattleMagic Analyzer - Available Commands"
	@echo "=========================================="
	@echo ""
	@echo "Building:"
	@echo "  make build          - Build library (debug)"
	@echo "  make release        - Build library (optimized)"
	@echo "  make wasm           - Build WASM module"
	@echo ""
	@echo "Testing:"
	@echo "  make test           - Run all tests"
	@echo "  make test-verbose   - Run tests with output"
	@echo "  make bench          - Run benchmarks"
	@echo ""
	@echo "Examples:"
	@echo "  make examples       - Build all examples"
	@echo "  make chip-detect    - Run chip detection example"
	@echo "  make analyze-fw     - Analyze firmware (set FIRMWARE=path)"
	@echo "  make analyze-json   - Export analysis as JSON (set FIRMWARE=path)"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean          - Remove build artifacts"
	@echo ""
	@echo "Usage Examples:"
	@echo "  make analyze-fw FIRMWARE=../../firmware.bin"
	@echo "  make analyze-json FIRMWARE=../../firmware.bin > results.json"

# ============================================================================
# Building
# ============================================================================

build:
	cargo build

release:
	cargo build --release

wasm:
	wasm-pack build --target web --out-dir pkg

# ============================================================================
# Testing
# ============================================================================

test:
	cargo test

test-verbose:
	cargo test -- --nocapture

bench:
	cargo bench

# ============================================================================
# Examples
# ============================================================================

examples:
	@echo "Building examples..."
	cargo build --examples --release

chip-detect: examples
	@echo "Running chip detection example..."
	cargo run --example chip_detection --release

# Analyze firmware with detailed output
analyze-fw: examples
	@if [ -z "$(FIRMWARE)" ]; then \
		echo "Error: FIRMWARE path not specified"; \
		echo "Usage: make analyze-fw FIRMWARE=path/to/firmware.bin"; \
		exit 1; \
	fi
	@echo "Analyzing firmware: $(FIRMWARE)"
	cargo run --example analyze_full_firmware --release -- "$(FIRMWARE)"

# Export analysis as JSON
analyze-json: examples
	@if [ -z "$(FIRMWARE)" ]; then \
		echo "Error: FIRMWARE path not specified"; \
		echo "Usage: make analyze-json FIRMWARE=path/to/firmware.bin > results.json"; \
		exit 1; \
	fi
	cargo run --example analyze_full_firmware --release -- "$(FIRMWARE)" --json

# Analyze the test firmware if it exists
analyze-test: examples
	@if [ -f "../../firmware_Unknown_1763317348910.bin" ]; then \
		echo "Analyzing test firmware..."; \
		cargo run --example analyze_full_firmware --release -- "../../firmware_Unknown_1763317348910.bin"; \
	else \
		echo "Test firmware not found at ../../firmware_Unknown_1763317348910.bin"; \
		exit 1; \
	fi

# ============================================================================
# Cleanup
# ============================================================================

clean:
	cargo clean
	rm -rf pkg/
	rm -rf node_modules/

# ============================================================================
# Development
# ============================================================================

fmt:
	cargo fmt

clippy:
	cargo clippy -- -W clippy::all

check: fmt clippy test
	@echo "All checks passed!"

# ============================================================================
# Documentation
# ============================================================================

doc:
	cargo doc --no-deps --open

doc-private:
	cargo doc --no-deps --document-private-items --open
