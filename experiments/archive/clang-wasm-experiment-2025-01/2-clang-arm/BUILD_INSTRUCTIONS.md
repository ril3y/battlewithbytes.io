# Building Clang to WebAssembly for STM32

This directory contains everything needed to build a WebAssembly version of Clang with ARM backend support for compiling STM32 firmware in the browser.

## Quick Start

```bash
# One-command build (installs deps + builds)
make all

# Or step by step:
make install  # Install Python dependencies
make build    # Build Clang WASM (30-60 min)
```

## Prerequisites

Before building, ensure you have:

- **Python 3.8+** - For build scripts
- **CMake 3.20+** - LLVM build system
- **Git** - To clone LLVM and Emscripten
- **Make** - To run Makefile targets
- **10+ GB free disk space** - For LLVM source and build
- **4+ GB RAM** - For compilation
- **Good CPU** - Build time depends on CPU cores

## What Gets Built

The build process creates:

1. **Clang compiler** compiled to WebAssembly
2. **ARM backend** (ARM Cortex-M support only)
3. **LLD linker** for linking ARM binaries
4. **Compressed WASM** (~5-7 MB after gzip)

**What's excluded** (to reduce size):
- Other architectures (x86, RISC-V, etc.)
- Static analyzer
- ARC migration tool
- Tests and examples
- Debug symbols

## Build Process

### Step 1: Install Dependencies

```bash
make install
```

This installs Python packages from `requirements.txt`:
- cmake
- ninja
- setuptools, wheel
- psutil (for parallel build optimization)

### Step 2: Run Build

```bash
make build
```

Or directly:

```bash
chmod +x build.sh
./build.sh
```

The `build.sh` script automatically:

1. **Checks prerequisites** (Python, CMake, Git)
2. **Installs Emscripten SDK** (if not present)
3. **Clones LLVM project** (release/18.x branch)
4. **Configures CMake** with ARM-only target
5. **Builds Clang** using Emscripten
6. **Packages output** as compressed WASM

### Build Output

After successful build, you'll find:

```
dist/
└── clang.wasm.gz    # Compressed Clang WASM (~5-7 MB)

build-wasm/
└── bin/
    └── clang.wasm   # Uncompressed (~20-30 MB)
```

## Build Time Estimates

| CPU Cores | Estimated Time |
|-----------|----------------|
| 4 cores   | 60-90 minutes  |
| 8 cores   | 30-45 minutes  |
| 16 cores  | 15-25 minutes  |

**Note:** First build downloads ~1.5 GB of LLVM source code.

## Build Configuration

The build uses aggressive size optimizations:

```cmake
-DCMAKE_BUILD_TYPE=MinSizeRel      # Minimize binary size
-DLLVM_TARGETS_TO_BUILD="ARM"      # ARM backend only
-DLLVM_ENABLE_PROJECTS="clang;lld" # Minimal toolchain
-DLLVM_INCLUDE_TESTS=OFF           # No tests
-DLLVM_BUILD_TOOLS=OFF             # No extra tools
-DLLVM_ENABLE_THREADS=OFF          # Single-threaded
```

### Why ARM-only?

Including all LLVM backends (x86, RISC-V, etc.) would create a ~50+ MB WASM file. By building ARM-only, we get:

- **20-30 MB uncompressed** (vs 50+ MB)
- **5-7 MB compressed** (vs 15+ MB)
- **Faster loads** in the browser
- **Same ARM code quality**

For STM32 (ARM Cortex-M), this is perfect!

## Cleaning Up

```bash
# Remove build artifacts (keep source)
make clean

# Remove everything (including LLVM source)
make clean-all
```

## Troubleshooting

### "Python not found"

Make sure Python is in your PATH:
```bash
which python
python --version
```

### "CMake not found"

Install CMake 3.20+:
```bash
# Windows
winget install Kitware.CMake

# macOS
brew install cmake

# Linux
sudo apt install cmake
```

### "Out of memory"

LLVM compilation is memory-intensive. If the build fails:

1. Close other applications
2. Reduce parallel jobs: Edit `build.sh` and change `-j$(nproc)` to `-j2`
3. Add swap space (Linux)

### "Build too slow"

To speed up:

1. **Use more cores:** Build script auto-detects, but you can edit manually
2. **Use faster storage:** Build on SSD, not HDD
3. **Use ccache:** Install ccache to cache intermediate builds

## Integration with STM32 IDE

After building, integrate with the web IDE:

### 1. Copy WASM file

```bash
cp dist/clang.wasm.gz ../../apps/web/public/compiler/
```

### 2. Create Clang loader

```typescript
// lib/compiler/ClangWASM.ts
export async function loadClangWASM() {
  const response = await fetch('/compiler/clang.wasm.gz');
  const compressed = await response.arrayBuffer();
  const decompressed = pako.ungzip(compressed);
  const module = await WebAssembly.compile(decompressed);
  return new WebAssembly.Instance(module, {
    // WASI imports, filesystem, etc.
  });
}
```

### 3. Replace pattern compiler

```typescript
// In PluginCompiler.ts, replace:
const result = await this.patternBasedCompile(...);

// With:
const clang = await loadClangWASM();
const result = await clang.compile(sourceCode, {
  args: compilerArgs,
  filesystem: vfs
});
```

## Architecture

```
Browser
  │
  ├─ Clang WASM (this build)
  │   ├─ C/C++ Parser
  │   ├─ LLVM IR Generator
  │   ├─ ARM CodeGen Backend
  │   └─ LLD Linker
  │
  └─ STM32 Plugin
      ├─ CMSIS Headers
      ├─ Linker Scripts
      └─ Device Config
```

## Size Comparison

| Configuration | Uncompressed | Compressed | Notes |
|--------------|--------------|------------|-------|
| **ARM-only (this)** | 20-30 MB | 5-7 MB | ✅ Recommended |
| All backends | 50+ MB | 15+ MB | ❌ Too large |
| TinyCC | 1 MB | 300 KB | ⚠️ Limited features |

## Next Steps

1. ✅ Build completes → `dist/clang.wasm.gz`
2. Copy to web app public directory
3. Implement WASM loader in TypeScript
4. Create WASI bindings for filesystem
5. Replace pattern compiler
6. Test real STM32 compilation!

## References

- [LLVM Docs](https://llvm.org/docs/)
- [Emscripten](https://emscripten.org/)
- [WebAssembly](https://webassembly.org/)
- [STM32 CMSIS](https://github.com/STMicroelectronics/cmsis-device-f1)

## Build Script Features

The `build.sh` script includes:

- ✅ Automatic prerequisite checking
- ✅ Colored output for easy reading
- ✅ Progress indicators
- ✅ Error handling (stops on failure)
- ✅ Size reporting (before/after compression)
- ✅ Automatic parallel build (uses all CPU cores)
- ✅ Emscripten SDK management

## License

LLVM/Clang is licensed under Apache 2.0 with LLVM exceptions.
This build script is provided as-is for educational purposes.
