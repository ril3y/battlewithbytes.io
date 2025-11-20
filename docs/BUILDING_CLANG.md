# Rebuilding ARM Clang WASM

The ARM-enabled Clang WASM binary used in BattleForge is built from a custom fork of YoWASP's Clang project with ARM backend support enabled.

## Source Repository

**Fork:** https://github.com/ril3y/clang-arm (branch: `develop`)
**Original:** https://github.com/YoWASP/clang.git

The fork includes modifications to enable ARM Cortex-M targets (thumbv6m, thumbv7m, thumbv7em) for embedded development.

## What Gets Built

- **Input:** LLVM source code with ARM backend enabled
- **Output:** `clang-arm.wasm` (~74MB uncompressed, ~19MB compressed)
- **Target:** ARM embedded systems (STM32, ESP32, etc.)
- **Runtime:** Browser via WebAssembly

## Build Process

### Option 1: Local Build (Linux/WSL Required)

```bash
# Clone the repository
git clone -b develop https://github.com/ril3y/clang-arm.git experiments/yowasp-clang
cd experiments/yowasp-clang

# Build (requires significant RAM and time - expect 30+ minutes)
./build.sh

# Output location
# experiments/yowasp-clang/clang-arm.wasm
```

**Requirements:**
- Linux or WSL2
- 16GB+ RAM recommended
- ~10GB disk space
- Emscripten SDK
- Python 3.8+
- Build essentials (gcc, make, cmake)

### Option 2: Docker Build (Recommended)

```bash
# Clone the repository
git clone -b develop https://github.com/ril3y/clang-arm.git experiments/yowasp-clang
cd experiments/yowasp-clang

# Build using Docker
docker build -t clang-arm-builder .
docker run -v $(pwd)/output:/output clang-arm-builder

# Extract the WASM binary
cp output/clang-arm.wasm ../apps/web/public/wasm/clang_arm/
```

**Advantages:**
- ✅ Reproducible builds
- ✅ No local dependencies needed
- ✅ Same environment for all developers
- ✅ CI/CD compatible

### Option 3: GitHub Actions (Automated)

A GitHub Actions workflow can be set up to automatically build the WASM on demand.

See `.github/workflows/build-clang.yml` (if implemented)

## Deploying the Built WASM

After building, copy the WASM binary to the public directory:

```bash
# Compress for faster downloads
gzip -9 -k clang-arm.wasm

# Copy both versions to public directory
cp clang-arm.wasm.gz ../../apps/web/public/wasm/clang_arm/
cp clang-arm.wasm ../../apps/web/public/wasm/clang_arm/
```

**What gets committed:**
- ✅ `apps/web/public/wasm/clang_arm/clang-arm.wasm.gz` (compressed, ~19MB)
- ❌ `apps/web/public/wasm/clang_arm/clang-arm.wasm` (uncompressed, ignored by .gitignore)
- ❌ `experiments/yowasp-clang/` (build tooling, ignored by .gitignore)

The compressed `.wasm.gz` file is small enough to commit to the repository. At runtime, the browser decompresses it automatically or the ClangWasmLoader handles decompression.

## Customizations in the Fork

The `ril3y/clang-arm` fork includes these modifications from the original YoWASP Clang:

1. **ARM Backend Enabled** (`build.sh:78`)
   - Added `ARM` to `-DLLVM_TARGETS_TO_BUILD`
   - Enables compilation for ARM Cortex-M targets

2. **Cortex-M Target Configuration** (`build.sh:107`)
   - Added `-mcpu=cortex-m3`, `-mthumb` flags
   - Configured for embedded ARM development

3. **STM32 Support**
   - Includes necessary headers and linker scripts
   - Optimized for STM32F1/F4 families

4. **Size Optimization**
   - Stripped debugging symbols
   - Minimized WASM binary size

## Architecture

```
experiments/yowasp-clang/          ← Build tooling (NOT in git)
    ├── llvm-project/              ← LLVM source with ARM backend
    ├── compiler-rt/               ← Compiler runtime
    ├── wasi-libc/                 ← WASI standard library
    ├── build.sh                   ← Build script
    └── clang-arm.wasm             ← Output (after build)
                ↓
         (copy and compress)
                ↓
apps/web/public/wasm/clang_arm/
    ├── clang-arm.wasm.gz          ✅ Committed to git (~19MB)
    └── clang-arm.wasm             ❌ Generated locally, ignored
                ↓
         (loaded at runtime)
                ↓
apps/web/src/app/tools/battleforge-new/lib/compiler/ClangWasmLoader.ts
    └── Fetches /wasm/clang_arm/clang-arm.wasm
        Compiles to WebAssembly.Module
        Executes with WASI runtime
```

## When to Rebuild

You typically only need to rebuild the WASM when:

- ✅ Updating to a new LLVM version
- ✅ Adding support for new ARM targets (Cortex-M4F, M7, etc.)
- ✅ Changing compiler optimization flags
- ✅ Fixing bugs in the LLVM/Clang codebase
- ❌ Changing BattleForge UI code (doesn't require rebuild)
- ❌ Updating dependencies in package.json

## Troubleshooting

### Build Fails with "Out of Memory"

Increase Docker memory allocation or build on a machine with 16GB+ RAM.

### WASM File Too Large

Check that optimizations are enabled in `build.sh`:
```bash
-DCMAKE_BUILD_TYPE=Release
-DLLVM_OPTIMIZED_TABLEGEN=ON
```

### Runtime Errors in Browser

Verify the WASM imports match `wasiBindings.ts`:
```bash
node experiments/yowasp-clang/inspect-wasm-imports.js clang-arm.wasm
```

## References

- **YoWASP Project:** https://yowasp.org/
- **LLVM ARM Backend:** https://llvm.org/docs/CompileCmdLine.html#target-selection-options
- **Emscripten:** https://emscripten.org/
- **WASI:** https://wasi.dev/

## License

The LLVM/Clang source code is licensed under the Apache 2.0 License with LLVM Exceptions.
See https://github.com/ril3y/clang-arm/blob/develop/LICENSE for details.
