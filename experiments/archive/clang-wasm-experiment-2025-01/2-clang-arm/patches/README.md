# Clang WASM Build Patches

This directory contains patches and configuration needed to build Clang to WebAssembly.

## Patches Applied

### 1. POSIX Syscall Compatibility (`wait4` fix)

**Problem:** WebAssembly doesn't support POSIX syscalls like `wait4` and `posix_spawn`.

**Solution:** Added Emscripten linker flags to ignore undefined symbols:

```cmake
-DCMAKE_EXE_LINKER_FLAGS="-sERROR_ON_UNDEFINED_SYMBOLS=0 -sALLOW_MEMORY_GROWTH=1"
-DCMAKE_CXX_FLAGS="-DHAVE_WAIT4=0"
-DHAVE_WAIT4=0
-DHAVE_POSIX_SPAWN=0
```

**Why Safe:**

- Code paths using these syscalls are disabled via CMake flags
- Emscripten provides stubs where needed
- Features requiring these syscalls are already disabled (backtraces, expensive checks, etc.)

### 2. Size Optimization

**Target-Specific Backend:**

```cmake
-DLLVM_TARGETS_TO_BUILD="ARM"
```

**Disabled Features:**

- Tests, examples, benchmarks
- Static analyzer
- ARCMT (Automatic Reference Counting Migration Tool)
- Backtraces and expensive checks
- Assertions and debug dumps

**Result:** ~5-7 MB compressed vs 50+ MB for full build

## Reusable for Other Architectures

### MIPS Build

Create `../3-clang-mips/` with same structure, change:

```cmake
# In build-docker.sh
-DLLVM_TARGETS_TO_BUILD="Mips"
```

### Multi-Architecture Build

For a single WASM with multiple backends:

```cmake
-DLLVM_TARGETS_TO_BUILD="ARM;Mips;RISCV"
```

**Trade-off:** Each backend adds ~3-5 MB to compressed size.

## Configuration Template

All architecture-specific builds should use this base configuration:

```cmake
emcmake cmake ../llvm-project/llvm \
  -G Ninja \
  -DCMAKE_BUILD_TYPE=MinSizeRel \
  -DLLVM_TARGETS_TO_BUILD="<ARCHITECTURE>" \
  -DLLVM_ENABLE_PROJECTS="clang;lld" \
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
  -DLLVM_OPTIMIZED_TABLEGEN=ON \
  -DCLANG_ENABLE_ARCMT=OFF \
  -DCLANG_ENABLE_STATIC_ANALYZER=OFF \
  -DHAVE_WAIT4=0 \
  -DHAVE_POSIX_SPAWN=0 \
  -DCMAKE_EXE_LINKER_FLAGS="-sERROR_ON_UNDEFINED_SYMBOLS=0 -sALLOW_MEMORY_GROWTH=1" \
  -DCMAKE_CXX_FLAGS="-DHAVE_WAIT4=0"
```

## Supported Architectures

| Architecture | CMake Value | Use Case                |
| ------------ | ----------- | ----------------------- |
| ARM          | `ARM`       | STM32, ARM Cortex-M     |
| MIPS         | `Mips`      | PIC32, legacy embedded  |
| RISC-V       | `RISCV`     | ESP32-C3, modern RISC-V |
| AVR          | `AVR`       | Arduino, ATmega         |
| x86          | `X86`       | PC emulators            |

## Version Information

- LLVM Version: 18.x (release/18.x branch)
- Emscripten Version: 3.1.50
- Build System: Ninja

## Known Issues

### Line Endings

Windows CRLF line endings break bash scripts in Docker. Always use LF:

```bash
sed -i 's/\r$//' build-docker.sh
```

### Volume Mounts

Mounting Windows directories with source code can propagate CRLF. Clone inside container instead.
