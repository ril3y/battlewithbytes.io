# Building TinyCC for WebAssembly

## Why TinyCC?

- **Size**: 500KB vs 100MB+ for GCC
- **Speed**: 9x faster than GCC
- **Simplicity**: Single-pass compiler with built-in linker
- **C99**: Full C99 support (no C++ needed for embedded)

## TinyCC ARM Support Status

### Current State
- TinyCC has ARM backend, but primarily for 32-bit ARM (not Thumb-2)
- Cortex-M3 STM32 uses **ARM Thumb-2** (16/32-bit mixed instructions)
- We need to either:
  1. Extend TinyCC's ARM backend for Thumb-2
  2. Use alternative approach

### Alternative: LLVM/Clang for ARM

Actually, there's a better option: **wasm-clang** with ARM cross-compilation

## Recommended Approach: Clang WASM + ARM Target

### Architecture
```
┌────────────────────────────────────────┐
│  Clang/LLVM compiled to WASM           │
│  (using upstream wasm-clang project)   │
├────────────────────────────────────────┤
│  Target: ARM Cortex-M3 (Thumb-2)       │
│  ├── -target thumbv7m-none-eabi        │
│  ├── -mcpu=cortex-m3                   │
│  └── -mthumb                           │
└────────────────────────────────────────┘
```

### Build Steps

#### 1. Install Emscripten
```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

#### 2. Clone LLVM
```bash
git clone --depth 1 https://github.com/llvm/llvm-project.git
cd llvm-project
mkdir build-wasm
cd build-wasm
```

#### 3. Configure LLVM for WASM
```bash
emcmake cmake ../llvm \
  -DCMAKE_BUILD_TYPE=Release \
  -DLLVM_TARGETS_TO_BUILD="ARM" \
  -DLLVM_ENABLE_PROJECTS="clang;lld" \
  -DLLVM_INCLUDE_TESTS=OFF \
  -DLLVM_INCLUDE_EXAMPLES=OFF \
  -DLLVM_ENABLE_THREADS=OFF \
  -DLLVM_BUILD_TOOLS=ON
```

#### 4. Build
```bash
emmake make clang lld -j8
```

Result: `clang.wasm` + `lld.wasm` (ARM linker)

### Size Optimization

To reduce from 50MB to ~10MB:

```bash
# Strip debug symbols
wasm-opt clang.wasm -O3 -o clang-opt.wasm

# Enable compression
gzip -9 clang-opt.wasm
# Result: ~10MB compressed, ~30MB uncompressed
```

## Simpler Alternative: Use Existing wasm-clang

**Good news**: Someone already did this!

### Option A: Use @wasmer/wasm-clang
```bash
npm install @wasmer/wasm-clang
```

```typescript
import { Clang } from '@wasmer/wasm-clang';

const clang = new Clang();
await clang.compile({
  sources: {
    'main.c': `
      #include <stdint.h>
      int main() {
        uint32_t x = 42;
        return 0;
      }
    `
  },
  options: [
    '-target', 'thumbv7m-none-eabi',
    '-mcpu=cortex-m3',
    '-mthumb',
    '-nostdlib',
    '-c'
  ]
});
```

### Option B: Use wasm-clang from WebAssembly Binary Toolkit
- Pre-built WASM clang available
- Supports ARM cross-compilation
- ~15MB compressed

## Practical Implementation

### Phase 1: Proof of Concept (This Week)
Use our current pattern-matching compiler to validate workflow:
- ✅ Monaco editor
- ✅ Basic ARM code generation
- ✅ Binary download
- ✅ Disassembly verification

### Phase 2: Integrate Real Compiler (Next Week)
Two paths:

#### Path A: TinyCC (Simpler, Limited)
1. Fork TinyCC
2. Add Thumb-2 codegen
3. Compile to WASM
4. ~1 week of work

**Effort**: Medium
**Result**: Fast, small, limited ARM support

#### Path B: Clang WASM (Better, Larger)
1. Use `@wasmer/wasm-clang` or build from source
2. Configure for ARM Cortex-M3
3. Bundle ARM CMSIS headers
4. Create virtual FS with Emscripten FS

**Effort**: Lower (use existing work)
**Result**: Professional, full C support, larger binary

## Recommended: Hybrid Approach

### Stage 1: Client-side Pattern Compiler (Current)
- Instant feedback
- Educational
- Works offline
- Limited to templates

### Stage 2: Cloud-based Real Compiler (Optional)
- Full GCC ARM toolchain on server
- Compile complex projects
- Fallback for advanced features

### Stage 3: WASM Clang (Future)
- When user downloads larger files
- Full offline capability
- Professional toolchain

## Minimal Viable Real Compiler

Instead of full Clang, create **hybrid approach**:

```typescript
class STM32Compiler {
  // Fast path: Pattern matching for simple code
  tryFastCompile(source: string): Uint8Array | null {
    if (isSimplePattern(source)) {
      return this.patternCompiler.compile(source);
    }
    return null;
  }

  // Full compiler: Clang WASM for complex code
  async fullCompile(source: string): Promise<Uint8Array> {
    const { clang } = await import('./clang.wasm');
    return clang.compile(source, {
      target: 'thumbv7m-none-eabi',
      includes: this.virtualFS.headers
    });
  }

  async compile(source: string): Promise<Uint8Array> {
    // Try fast path first
    const fast = this.tryFastCompile(source);
    if (fast) return fast;

    // Fall back to real compiler
    return this.fullCompile(source);
  }
}
```

## Next Steps

1. **Research @wasmer/wasm-clang**: See if it supports ARM
2. **Test Clang WASM build**: Compile simple ARM program
3. **Bundle CMSIS headers**: STM32F103 device headers
4. **Create VFS**: Emscripten filesystem with includes
5. **Build wrapper**: TypeScript API around WASM compiler

## Estimated Timeline

| Phase | Description | Time | Dependencies |
|-------|-------------|------|--------------|
| 1 | Research wasm-clang ARM support | 1 day | None |
| 2 | Test compilation to ARM | 2 days | Clang WASM |
| 3 | Virtual FS + headers | 2 days | Emscripten |
| 4 | Linker integration | 3 days | lld WASM |
| 5 | Runtime library | 3 days | CMSIS |
| 6 | Multi-file projects | 2 days | All above |
| **Total** | | **2 weeks** | |

## Resources

- [TinyCC](https://bellard.org/tcc/)
- [LLVM for WebAssembly](https://github.com/llvm/llvm-project)
- [Emscripten](https://emscripten.org/)
- [@wasmer/wasm-clang](https://github.com/wasmerio/wasmer-js/tree/main/packages/wasm-clang)
- [ARM CMSIS](https://github.com/ARM-software/CMSIS_5)
- [STM32CubeF1](https://github.com/STMicroelectronics/STM32CubeF1)
