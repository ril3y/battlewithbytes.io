# Multi-Architecture Clang WASM Builds

Guide for creating custom Clang WASM compilers for different embedded architectures.

## Quick Start: New Architecture

To create a new architecture build (e.g., MIPS), copy the ARM build and modify:

```bash
# Copy ARM build as template
cp -r 2-clang-arm 3-clang-mips

# Update configuration
cd 3-clang-mips
```

Then edit these files:

### 1. `build-docker.sh` - Change target

```bash
# Line 28: Change ARM to your target
-DLLVM_TARGETS_TO_BUILD="Mips"
```

### 2. `docker-compose.yml` - Update metadata

```yaml
services:
  clang-builder:
    image: battlewithbytes/clang-wasm-builder:mips
    container_name: clang-mips-builder
    environment:
      - LLVM_TARGETS_TO_BUILD=Mips
```

### 3. `Dockerfile.multistage` - Update build args

```dockerfile
ARG LLVM_TARGETS=Mips
```

That's it! Build with same commands.

## Supported Architectures

| Target | LLVM Name | Use Case | Est. Size (compressed) |
|--------|-----------|----------|------------------------|
| ARM | `ARM` | STM32, Cortex-M | 5-7 MB |
| MIPS | `Mips` | PIC32, older embedded | 6-8 MB |
| RISC-V | `RISCV` | ESP32-C3, modern RISC-V | 6-8 MB |
| AVR | `AVR` | Arduino, ATmega | 4-6 MB |
| x86 | `X86` | PC emulators, testing | 10-15 MB |
| PowerPC | `PowerPC` | Legacy automotive | 7-9 MB |
| AArch64 | `AArch64` | ARM 64-bit (RPi 4, etc.) | 8-10 MB |
| MSP430 | `MSP430` | TI ultra-low-power MCUs | 4-6 MB |

## Multi-Architecture Build

Build a single WASM with multiple backends (trade-off: larger size):

```cmake
# In build-docker.sh, line 28:
-DLLVM_TARGETS_TO_BUILD="ARM;Mips;RISCV"
```

**Size impact:** Each additional backend adds ~3-5 MB compressed.

Example sizes:
- ARM only: ~6 MB
- ARM + MIPS: ~11 MB
- ARM + MIPS + RISC-V: ~16 MB
- All targets: ~60-80 MB (not recommended)

## Patches Required (CRITICAL)

All builds need these patches (already included in template):

### 1. POSIX Syscall Fix

```cmake
-DHAVE_WAIT4=0
-DHAVE_POSIX_SPAWN=0
-DCMAKE_EXE_LINKER_FLAGS="-sERROR_ON_UNDEFINED_SYMBOLS=0 -sALLOW_MEMORY_GROWTH=1"
-DCMAKE_CXX_FLAGS="-DHAVE_WAIT4=0"
```

Without this: Build fails with `undefined symbol: wait4`

### 2. Size Optimization

```cmake
-DCMAKE_BUILD_TYPE=MinSizeRel
-DLLVM_ENABLE_ASSERTIONS=OFF
-DLLVM_ENABLE_DUMP=OFF
-DLLVM_INCLUDE_TESTS=OFF
# ... (see patches/README.md for full list)
```

Without this: Binary is 50-100+ MB instead of 5-10 MB

## Fast CI/CD Builds

Use the multi-stage Dockerfile for cached builds:

### First time (builds cache):
```bash
docker build --target llvm-build \
  -t battlewithbytes/llvm-wasm-mips:18.x \
  -f Dockerfile.multistage \
  --build-arg LLVM_TARGETS=Mips \
  .
```

**Time:** 30-60 minutes (one-time cost)

### Subsequent builds (uses cache):
```bash
docker build --target custom-wasm \
  -f Dockerfile.multistage \
  --build-arg LLVM_TARGETS=Mips \
  -o dist \
  .
```

**Time:** 1-5 minutes ✅

### Push cache to Docker Hub:
```bash
docker push battlewithbytes/llvm-wasm-mips:18.x
```

Now CI/CD can pull the cache and rebuild in minutes.

## Directory Structure

```
experiments/c-compiler-poc/
├── 2-clang-arm/           # ARM Cortex-M (STM32)
│   ├── Dockerfile
│   ├── Dockerfile.multistage  # For fast rebuilds
│   ├── build-docker.sh
│   ├── docker-compose.yml
│   └── patches/
│       └── README.md      # Documents all patches
├── 3-clang-mips/          # MIPS (PIC32) [copy of ARM]
├── 4-clang-riscv/         # RISC-V [copy of ARM]
├── 5-clang-multi/         # Multi-arch build
└── ARCHITECTURE_BUILDS.md # This file
```

## Example: Create MIPS Build

```bash
# 1. Copy ARM template
cp -r 2-clang-arm 3-clang-mips
cd 3-clang-mips

# 2. Update build-docker.sh
sed -i 's/LLVM_TARGETS_TO_BUILD="ARM"/LLVM_TARGETS_TO_BUILD="Mips"/' build-docker.sh

# 3. Update docker-compose.yml
sed -i 's/clang-arm-builder/clang-mips-builder/' docker-compose.yml
sed -i 's/LLVM_TARGETS_TO_BUILD=ARM/LLVM_TARGETS_TO_BUILD=Mips/' docker-compose.yml

# 4. Build
docker-compose up

# 5. Output: dist/clang.wasm.gz
```

## Testing Your Build

After building, test the compiler:

```bash
# Extract WASM
gunzip -c dist/clang.wasm.gz > test-clang.wasm

# Test in Node.js
node --experimental-wasm-modules test-compiler.js
```

## Common Issues

### Issue: Binary too large (>20 MB)

**Cause:** Missing size optimization flags

**Fix:** Verify all flags in `patches/README.md` are present

### Issue: `undefined symbol: wait4`

**Cause:** Missing Emscripten linker flags

**Fix:** Add `-sERROR_ON_UNDEFINED_SYMBOLS=0` to `CMAKE_EXE_LINKER_FLAGS`

### Issue: CI/CD rebuild takes 60 minutes

**Cause:** Not using cached multi-stage build

**Fix:** Use `Dockerfile.multistage` and push cache to Docker Hub

### Issue: Line endings break build in Docker

**Cause:** Windows CRLF propagated to container

**Fix:**
```bash
sed -i 's/\r$//' build-docker.sh
# Or: Let Docker clone LLVM (don't mount volumes)
```

## Version Management

### Update LLVM Version

```bash
# In build-docker.sh, line 13:
git clone --depth=1 --branch=release/19.x https://github.com/llvm/llvm-project.git
#                              ^^^^^ Change version here
```

**Note:** Changing LLVM version requires rebuilding cache (30-60 min one-time)

### Update Emscripten Version

```dockerfile
# In Dockerfile, line 1:
FROM emscripten/emsdk:3.1.51
#                      ^^^^^^ Change version here
```

## Performance Summary

| Scenario | Time (First) | Time (Cached) | Size |
|----------|--------------|---------------|------|
| ARM only | 30-60 min | 1-5 min | ~6 MB |
| MIPS only | 30-60 min | 1-5 min | ~7 MB |
| RISC-V only | 30-60 min | 1-5 min | ~7 MB |
| ARM+MIPS | 35-65 min | 2-7 min | ~11 MB |
| ARM+MIPS+RISCV | 40-70 min | 3-10 min | ~16 MB |
| All targets | 60-120 min | N/A | ~70 MB |

**Recommendation:** Build separate WASM files per architecture (smaller, faster)

## CI/CD Strategy

1. **Build cache images weekly** (scheduled GitHub Action)
2. **Use cached builds for development** (1-5 min rebuilds)
3. **Store final WASM in git** (5-10 MB per architecture)
4. **Load WASM dynamically in app** (based on user's target MCU)

This approach gives you:
- ✅ Fast development iteration (minutes, not hours)
- ✅ Small binary sizes (5-10 MB per arch)
- ✅ Reusable build infrastructure
- ✅ Easy to add new architectures
