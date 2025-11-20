.PHONY: help install clean build all docker-build docker-clean docker-shell

help:
	@echo "Clang WASM Build System for STM32"
	@echo ""
	@echo "🐳 Docker Build (Recommended):"
	@echo "  make docker-build  - Build Clang WASM in Docker"
	@echo "  make docker-shell  - Open shell in Docker container"
	@echo "  make docker-clean  - Remove Docker volumes"
	@echo ""
	@echo "💻 Local Build:"
	@echo "  make install       - Install Python dependencies"
	@echo "  make build         - Build Clang to WASM (30-60 min)"
	@echo "  make all           - Install deps + build"
	@echo ""
	@echo "🧹 Cleanup:"
	@echo "  make clean         - Remove build artifacts"
	@echo "  make clean-all     - Remove everything (including LLVM source)"
	@echo ""

install:
	@echo "Installing Python dependencies..."
	@python -m pip install -r requirements.txt
	@echo "✓ Dependencies installed"

build:
	@chmod +x build.sh
	@./build.sh

all: install build

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf build-wasm dist
	@echo "✓ Build artifacts removed"

clean-all:
	@echo "Removing all build files and sources..."
	@rm -rf build-wasm dist llvm-project emsdk
	@echo "✓ Everything cleaned"

# Docker build targets
docker-build:
	@echo "🐳 Building Clang WASM in Docker..."
	@docker-compose up --build

docker-shell:
	@echo "🐳 Opening shell in Docker container..."
	@docker-compose run --rm clang-builder /bin/bash

docker-clean:
	@echo "🐳 Cleaning Docker volumes..."
	@docker-compose down -v
	@echo "✓ Docker volumes removed"
