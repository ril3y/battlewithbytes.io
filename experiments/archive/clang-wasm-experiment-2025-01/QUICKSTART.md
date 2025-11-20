# Quick Start - Prove C Compilation Works NOW

## Option 1: Test UI Right Now (No Build Required) ⚡

The HTML test file has a **mock mode** built-in!

```bash
cd experiments/c-compiler-poc/1-tinycc
# Open test-tcc.html in your browser (double-click or use a local server)
```

**What you'll see:**
- ✅ Full C editor with syntax
- ✅ Mock ARM compilation (simulated)
- ✅ Binary hex dump output
- ✅ Download as .bin and .hex
- ✅ Complete UI workflow

This proves the **UI and workflow** works before investing time in building TinyCC.

---

## Option 2: Use Wasmer's Clang (Ready-Made) 🎯

Wasmer provides a pre-built Clang WASM package you can use immediately:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Wasmer Clang Test</title>
</head>
<body>
    <h1>Clang in Browser via Wasmer</h1>
    <script type="module">
        import { init, Wasmer } from "https://unpkg.com/@wasmer/sdk@0.8.0/dist/WasmerSDKBundled.js";

        await init();

        const clang = await Wasmer.fromRegistry("clang/clang");

        const result = await clang.entrypoint.run({
            args: ["--version"]
        });

        console.log("Clang output:", await result.output);
    </script>
</body>
</html>
```

**Limitations:**
- Outputs WASM, not ARM (need to add ARM target)
- Large download (~100MB)
- But it WORKS in browser right now!

---

## Option 3: Build TinyCC from Source (2-3 hours) 🔨

### Prerequisites

1. **Install Emscripten**:
```bash
# Windows (with Git Bash or WSL)
cd ~
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

2. **Verify Emscripten**:
```bash
emcc --version
# Should show: emcc (Emscripten gcc/clang-like replacement) x.x.x
```

### Build TinyCC

```bash
cd experiments/c-compiler-poc/1-tinycc
bash build-tcc.sh
```

**Expected output:**
```
=== TinyCC WASM Build Script ===
Cloning TinyCC...
Configuring TinyCC for WASM with ARM target...
Building TinyCC to WASM...
TinyCC built successfully!
Output: tinycc/tcc.js and tcc.wasm
```

### Test

```bash
# Serve locally
npx http-server -p 8080

# Open browser to:
# http://localhost:8080/test-tcc.html
```

---

## Option 4: Fastest Real Test - arm-none-eabi-gcc via JS 🚀

There's a JavaScript ARM GCC wrapper available!

```bash
npm install arm-none-eabi-gcc
```

```javascript
const gcc = require('arm-none-eabi-gcc');

const result = gcc.compile({
    source: 'int main() { return 42; }',
    flags: ['-mcpu=cortex-m3', '-mthumb', '-nostdlib']
});

console.log('Binary size:', result.binary.length);
```

**Status:** Research if this exists or if we need to create it.

---

## Recommended Path

### Day 1 (Today - 1 hour):
1. ✅ Open `test-tcc.html` in browser
2. ✅ Test mock mode UI
3. ✅ Validate workflow makes sense
4. ✅ Decide if UI is acceptable

### Day 2 (Tomorrow - 3 hours):
1. Install Emscripten
2. Run `build-tcc.sh`
3. Test real compilation
4. Verify ARM output

### Day 3 (Next - 4 hours):
1. Add ARM-specific build flags
2. Test with STM32 examples
3. Validate generated binaries
4. Flash to real hardware

---

## Success Metrics

### Phase 1: Mock Mode ✅ (Available NOW)
- [x] UI loads in browser
- [x] Can edit C code
- [x] Mock compilation runs
- [x] Binary output shown
- [x] Can download .hex/.bin

### Phase 2: Real TinyCC (After Build)
- [ ] Compiles real C code
- [ ] Generates ARM Thumb instructions
- [ ] Binary is valid ARM code
- [ ] Sub-second compilation

### Phase 3: STM32 Ready (After Testing)
- [ ] Compiles GPIO blink code
- [ ] Generates correct memory layout
- [ ] Can link with startup code
- [ ] Flashes to STM32 successfully

---

## Troubleshooting

### "Emscripten not found"
Install Emscripten first (see Option 3 prerequisites)

### "TinyCC build failed"
Check:
- Emscripten is activated: `source ~/emsdk/emsdk_env.sh`
- Git is installed
- Internet connection (to clone TinyCC)

### "Browser shows CORS error"
Must serve via HTTP, not file://
Use: `npx http-server` or `python -m http.server`

### "Mock mode works but real compilation doesn't"
This is expected! Build TinyCC first with `build-tcc.sh`

---

## Next Steps After Proof-of-Concept

Once C compilation works:

1. **Add Linker Support**
   - Generate linker scripts
   - Link multiple .o files
   - Apply memory layout

2. **Add Startup Code**
   - Vector table generation
   - Reset handler
   - System init

3. **Integration with STM32 IDE**
   - Move to `packages/stm32-compiler/`
   - Add React UI
   - Connect to flasher

4. **Optimization**
   - Cache compiled WASM module
   - Incremental compilation
   - Source maps for debugging
