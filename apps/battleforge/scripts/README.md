# BattleForge WASM Build Scripts

Scripts for building WASM binaries on the buildbox (192.168.1.62).

## Available Scripts

### Compilers

| Script                  | Target       | Platforms                    |
| ----------------------- | ------------ | ---------------------------- |
| `build-clang-arm.sh`    | ARM Cortex-M | STM32, nRF52, RP2040         |
| `build-clang-riscv.sh`  | RISC-V       | ESP32-C3, ESP32-C6, ESP32-H2 |
| `build-clang-xtensa.sh` | Xtensa       | ESP32, ESP32-S2, ESP32-S3    |

### Disassemblers & Tools

| Script                  | Tool         | Description                             | Size     |
| ----------------------- | ------------ | --------------------------------------- | -------- |
| `build-capstone-wasm.sh`| Capstone     | ARM/Thumb disassembler for code analysis | ~120KB   |

## Build Box

- **Host:** 192.168.1.62 (Proxmox container)
- **CPU:** 128 threads available
- **User:** builder
- **SSH Key:** `%USERPROFILE%\.ssh\buildbox_key` (Windows) or `~/.ssh/buildbox_key` (Linux/Mac)

## Quick Start

```bash
# 1. Copy scripts to buildbox
scp -i "$USERPROFILE/.ssh/buildbox_key" build-clang-*.sh builder@192.168.1.62:~/

# 2. SSH to buildbox
ssh -i "$USERPROFILE/.ssh/buildbox_key" builder@192.168.1.62

# 3. Run the build (pick one)
chmod +x build-clang-arm.sh build-clang-riscv.sh build-clang-xtensa.sh
./build-clang-arm.sh      # ~15-20 min
./build-clang-riscv.sh    # ~15-20 min
./build-clang-xtensa.sh   # ~20-30 min

# 4. Copy results back (from Windows)
scp -i "%USERPROFILE%\.ssh\buildbox_key" builder@192.168.1.62:~/clang-wasm-builds/output/*.wasm.gz .
```

## Output Files

After building, compressed WASM files are in `~/clang-wasm-builds/output/`:

- `clang-arm.wasm.gz` (~20MB) → deploy to `/wasm/clang_arm/`
- `clang-riscv.wasm.gz` (~20MB) → deploy to `/wasm/clang_riscv/`
- `clang-xtensa.wasm.gz` (~25MB) → deploy to `/wasm/clang_xtensa/`

## Build Details

All scripts use a two-stage build process:

1. **Stage 1:** Build native tablegen tools (required for cross-compilation)
2. **Stage 2:** Cross-compile to WASM using Emscripten

The first run installs Emscripten SDK automatically (~5 min extra).

## LLVM Sources

| Compiler | Repository               | Branch                  |
| -------- | ------------------------ | ----------------------- |
| ARM      | `ril3y/clang-arm`        | `develop`               |
| RISC-V   | `llvm/llvm-project`      | `release/19.x`          |
| Xtensa   | `espressif/llvm-project` | `xtensa_release_18.1.2` |

Note: Xtensa uses Espressif's LLVM fork since upstream LLVM doesn't include the Xtensa backend.

## Deploy to BattleForge

```bash
# From your machine, after building
cd apps/web/public/wasm

# ARM (existing directory)
scp -i "%USERPROFILE%\.ssh\buildbox_key" builder@192.168.1.62:~/clang-wasm-builds/output/clang-arm.wasm.gz clang_arm/

# RISC-V (create directory first)
mkdir -p clang_riscv
scp -i "%USERPROFILE%\.ssh\buildbox_key" builder@192.168.1.62:~/clang-wasm-builds/output/clang-riscv.wasm.gz clang_riscv/

# Xtensa (create directory first)
mkdir -p clang_xtensa
scp -i "%USERPROFILE%\.ssh\buildbox_key" builder@192.168.1.62:~/clang-wasm-builds/output/clang-xtensa.wasm.gz clang_xtensa/
```

Then update `manifest.json` with the new file hashes.

## Building Capstone (ARM Disassembler)

```bash
# 1. Copy script to buildbox
scp -i "$USERPROFILE/.ssh/buildbox_key" build-capstone-wasm.sh builder@192.168.1.62:~/

# 2. SSH to buildbox
ssh -i "$USERPROFILE/.ssh/buildbox_key" builder@192.168.1.62

# 3. Run the build (~30 seconds!)
chmod +x build-capstone-wasm.sh
./build-capstone-wasm.sh

# 4. Copy results back (from Windows)
scp -i "%USERPROFILE%\.ssh\buildbox_key" builder@192.168.1.62:~/capstone-wasm-build/output/* .
```

### Deploy Capstone to BattleForge

```bash
# Create directory and copy files
mkdir -p apps/battleforge/public/wasm/capstone
cp capstone-arm.* capstone-api.js apps/battleforge/public/wasm/capstone/
```

### Capstone Features

- ARM 32-bit disassembly (ARM, Thumb, Thumb2 modes)
- Cortex-M support with MCLASS mode
- Instruction decode with operand details
- Register name lookup
- Modern WebAssembly (only 120KB compressed!)

### Usage Example

```javascript
const cs = new CapstoneARM();
await cs.init();
cs.open(CS_MODE.THUMB | CS_MODE.MCLASS);

const code = new Uint8Array([0x00, 0xbf, 0x01, 0x20]);  // nop; movs r0, #1
console.log(cs.disasmToString(code, 0x08000000));
// Output:
// 0x08000000: 00 bf        nop
// 0x08000002: 01 20        movs     r0, #1

cs.close();
```
