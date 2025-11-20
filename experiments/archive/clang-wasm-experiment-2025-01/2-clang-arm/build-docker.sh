#!/bin/bash
set -e

echo "========================================="
echo "  Clang WASM Builder (Docker)"
echo "  ARM-only backend for STM32"
echo "========================================="
echo ""

# Step 1: Clone LLVM if needed
if [ ! -d "llvm-project" ]; then
    echo "Cloning LLVM project..."
    git clone --depth=1 --branch=release/18.x https://github.com/llvm/llvm-project.git
    echo "✓ LLVM cloned"
else
    echo "✓ LLVM already exists"
fi

# Fix line endings in config.guess (Windows CRLF -> Linux LF)
if [ -f "llvm-project/llvm/cmake/config.guess" ]; then
    echo "Converting line endings in config.guess..."
    sed -i 's/\r$//' llvm-project/llvm/cmake/config.guess
    chmod +x llvm-project/llvm/cmake/config.guess
    echo "✓ Line endings fixed"
fi

# Step 2: Configure build
echo ""
echo "Configuring Clang build (ARM-only)..."
mkdir -p build-wasm
cd build-wasm

emcmake cmake ../llvm-project/llvm \
  -G Ninja \
  -DCMAKE_BUILD_TYPE=MinSizeRel \
  -DLLVM_TARGETS_TO_BUILD="ARM" \
  -DLLVM_ENABLE_PROJECTS="clang" \
  -DLLVM_ENABLE_LIBCXX=ON \
  -DLLVM_COMPILER_CHECKED=ON \
  -DHAVE_CXX_ATOMICS_WITHOUT_LIB=1 \
  -DLLVM_ENABLE_DUMP=OFF \
  -DLLVM_ENABLE_ASSERTIONS=OFF \
  -DLLVM_ENABLE_EXPENSIVE_CHECKS=OFF \
  -DLLVM_ENABLE_BACKTRACES=OFF \
  -DLLVM_BUILD_TOOLS=OFF \
  -DLLVM_ENABLE_THREADS=OFF \
  -DLLVM_BUILD_LLVM_DYLIB=OFF \
  -DLLVM_INCLUDE_TESTS=OFF \
  -DLLVM_INCLUDE_EXAMPLES=OFF \
  -DLLVM_INCLUDE_BENCHMARKS=OFF \
  -DLLVM_INCLUDE_DOCS=OFF \
  -DLLVM_ENABLE_ZLIB=OFF \
  -DLLVM_ENABLE_ZSTD=OFF \
  -DLLVM_ENABLE_LIBXML2=OFF \
  -DLLVM_OPTIMIZED_TABLEGEN=ON \
  -DCLANG_ENABLE_ARCMT=OFF \
  -DCLANG_ENABLE_STATIC_ANALYZER=OFF \
  -DCLANG_BUILD_TOOLS=ON \
  -DCLANG_INCLUDE_DOCS=OFF \
  -DCLANG_TOOL_C_INDEX_TEST_BUILD=OFF \
  -DCLANG_TOOL_CLANG_CHECK_BUILD=OFF \
  -DCLANG_TOOL_CLANG_DIFF_BUILD=OFF \
  -DCLANG_TOOL_CLANG_FORMAT_BUILD=OFF \
  -DCLANG_TOOL_CLANG_FUZZER_BUILD=OFF \
  -DCLANG_TOOL_CLANG_IMPORT_TEST_BUILD=OFF \
  -DCLANG_TOOL_CLANG_OFFLOAD_BUNDLER_BUILD=OFF \
  -DCLANG_TOOL_CLANG_OFFLOAD_WRAPPER_BUILD=OFF \
  -DCLANG_TOOL_CLANG_RENAME_BUILD=OFF \
  -DCLANG_TOOL_CLANG_SCAN_DEPS_BUILD=OFF \
  -DCLANG_TOOL_DIAGTOOL_BUILD=OFF \
  -DCLANG_TOOL_LIBCLANG_BUILD=OFF \
  -DHAVE_WAIT4=0 \
  -DHAVE_POSIX_SPAWN=0 \
  -DCMAKE_EXE_LINKER_FLAGS="-sERROR_ON_UNDEFINED_SYMBOLS=0 -sALLOW_MEMORY_GROWTH=1 -sSTANDALONE_WASM -Wl,--export=_start" \
  -DCMAKE_CXX_FLAGS="-DHAVE_WAIT4=0 -DLLVM_DISABLE_CRASH_REPORT=1 -Os" \
  -DCMAKE_C_FLAGS="-Os"

echo "✓ CMake configuration complete"

# Step 3: Build Clang
echo ""
echo "Building Clang to WASM..."
echo "This will take 30-60 minutes..."
echo ""

ninja -j$(nproc) clang

echo "✓ Clang built successfully!"

# Step 4: Package output
echo ""
echo "Packaging output..."
cd ..
mkdir -p dist

if [ -f "build-wasm/bin/clang.wasm" ]; then
    # Copy uncompressed version
    cp build-wasm/bin/clang.wasm dist/

    # Create compressed version
    gzip -9 -c build-wasm/bin/clang.wasm > dist/clang.wasm.gz

    # Show sizes
    ORIGINAL_SIZE=$(stat -c%s build-wasm/bin/clang.wasm)
    COMPRESSED_SIZE=$(stat -c%s dist/clang.wasm.gz)

    echo "✓ Build complete!"
    echo ""
    echo "Output files:"
    echo "  dist/clang.wasm     - $(numfmt --to=iec $ORIGINAL_SIZE)"
    echo "  dist/clang.wasm.gz  - $(numfmt --to=iec $COMPRESSED_SIZE)"
    echo ""
    echo "Compression ratio: $(echo "scale=1; $COMPRESSED_SIZE * 100 / $ORIGINAL_SIZE" | bc)%"
else
    echo "✗ Error: clang.wasm not found!"
    exit 1
fi

echo ""
echo "========================================="
echo "  Build successful! ✓"
echo "========================================="
