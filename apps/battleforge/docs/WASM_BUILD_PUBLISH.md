# WASM Build & Publish Workflow

This document describes how to build Clang WASM compilers and publish them to GitHub Releases.

## Overview

BattleForge uses WebAssembly-compiled Clang compilers to compile code in the browser. These compilers are:

| Component | Targets | Size (compressed) |
|-----------|---------|-------------------|
| clang-arm | STM32, nRF52, RP2040, Cortex-M | ~23 MB |
| clang-riscv | ESP32-C3, ESP32-C6, ESP32-H2 | ~16 MB |
| clang-xtensa | ESP32, ESP32-S2, ESP32-S3 | ~14 MB |
| lld (universal) | ARM + RISC-V + Xtensa | ~26 MB |

## Prerequisites

- SSH access to buildbox (192.168.1.62)
- SSH key at `~/.ssh/buildbox_key`
- GitHub CLI (`gh`) authenticated for publishing

## 1. Build on Buildbox

The buildbox is a 128-thread server dedicated to compiling LLVM/Clang to WASM.

### Build Commands

```bash
cd apps/battleforge

# Build specific target
pnpm wasm:build arm      # ARM compiler (STM32, nRF52, RP2040)
pnpm wasm:build riscv    # RISC-V compiler (ESP32-C3, ESP32-C6)
pnpm wasm:build xtensa   # Xtensa compiler (ESP32, ESP32-S2, ESP32-S3)
pnpm wasm:build lld      # Universal LLD linker (ARM + RISC-V + Xtensa)
pnpm wasm:build all      # All compilers (not lld)

# Just check connection
pnpm wasm:build:check
```

### What Happens During Build

1. **Connect** - SSH to buildbox at 192.168.1.62
2. **Upload** - Copy build script (e.g., `build-clang-xtensa.sh`)
3. **Fix line endings** - Convert CRLF to LF with `sed`
4. **Build Stage 1** - Compile native tablegen tools (~5 min)
5. **Build Stage 2** - Cross-compile to WASM via Emscripten (~15-60 min)
6. **Download** - Copy `.wasm` and `.wasm.gz` to `public/wasm/`
7. **Update manifest** - Add hash and version to `manifest.json`

### Build Times (128 threads)

- ARM: ~20 minutes
- RISC-V: ~15 minutes
- Xtensa: ~25 minutes

## 2. Publish to GitHub Releases

WASM files are stored in GitHub Releases on the `battlewithbytes/battleforge_boards` repository (our submodule).

### Publish Commands

```bash
cd apps/battleforge

pnpm wasm:upload              # Auto-generate tag from version
pnpm wasm:upload --tag v1.0   # Specific tag
pnpm wasm:upload --draft      # Create as draft first
pnpm wasm:upload --dry-run    # Preview without uploading
```

### What Gets Uploaded

- `clang_arm/*.wasm` and `*.js`
- `clang_riscv/*.wasm` and `*.js`
- `clang_xtensa/*.wasm` and `*.js`
- `capstone/*.wasm` and `*.js`
- `manifest.json`

### Release Notes

The upload script automatically generates release notes with:
- Compiler versions
- File sizes
- SHA256 hashes (truncated)
- Usage instructions

## 3. Download in CI/Dev

### Download Commands

```bash
cd apps/battleforge

pnpm wasm:download            # Download latest release
pnpm wasm:download --force    # Re-download even if exists
pnpm wasm:download --tag X    # Download specific release
pnpm wasm:check               # Verify required files present
```

### Automatic Download

The `prebuild` script runs `download-wasm.js` automatically:

```json
{
  "prebuild": "node scripts/copy-battleforge-data.js && node scripts/download-wasm.js"
}
```

This means CI automatically fetches WASM files from GitHub Releases before building.

### Environment Variables

- `GITHUB_TOKEN` - Optional, for higher API rate limits

## File Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BUILDBOX                                  │
│                    (192.168.1.62)                               │
│                                                                  │
│  build-clang-arm.sh ──────► clang-arm.wasm.gz                   │
│  build-clang-riscv.sh ────► clang-riscv.wasm.gz                 │
│  build-clang-xtensa.sh ───► clang-xtensa.wasm.gz                │
└──────────────────────────────┬──────────────────────────────────┘
                               │ SCP download
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LOCAL (public/wasm/)                         │
│                                                                  │
│  clang-arm.wasm.gz     clang_arm/clang.js                       │
│  clang-riscv.wasm.gz   clang_riscv/clang.js                     │
│  clang-xtensa.wasm.gz  clang_xtensa/clang.js                    │
│  manifest.json                                                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │ gh release create
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              GITHUB RELEASES                                     │
│     battlewithbytes/battleforge_boards                          │
│                                                                  │
│  Release: wasm-clang-20.0.0                                     │
│  Assets:  clang-arm.wasm.gz (23 MB)                             │
│           clang-riscv.wasm.gz (16 MB)                           │
│           clang-xtensa.wasm.gz (14 MB)                          │
│           manifest.json                                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ download-wasm.js
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CI / OTHER DEVS                               │
│                                                                  │
│  pnpm wasm:download ──► public/wasm/ populated                  │
│  pnpm build ──────────► App builds with WASM compilers          │
└─────────────────────────────────────────────────────────────────┘
```

## Build Scripts

| Script | Purpose |
|--------|---------|
| `scripts/build-remote.js` | Orchestrates remote builds via SSH |
| `scripts/build-clang-arm.sh` | ARM compiler build script |
| `scripts/build-clang-riscv.sh` | RISC-V compiler build script |
| `scripts/build-clang-xtensa.sh` | Xtensa compiler build script (Espressif fork) |
| `scripts/build-lld-universal.sh` | Universal LLD linker (ARM + RISC-V + Xtensa) |
| `scripts/download-wasm.js` | Download from GitHub Releases |
| `scripts/upload-wasm-release.js` | Upload to GitHub Releases |

## Troubleshooting

### SSH Connection Failed

```bash
# Check SSH key exists
ls ~/.ssh/buildbox_key

# Test connection manually
ssh -i ~/.ssh/buildbox_key builder@192.168.1.62 "echo OK"
```

### CMake: Experimental Target Error

If you see "target is experimental", ensure the build script uses:
```cmake
-DLLVM_TARGETS_TO_BUILD=""
-DLLVM_EXPERIMENTAL_TARGETS_TO_BUILD="Xtensa"
```

### Windows: Shell Redirect Interpreted Locally

The build script uses `sed -i` instead of pipes/redirects to avoid Windows cmd.exe interpreting `|` and `<` locally.

### Download Fails: Rate Limited

Set `GITHUB_TOKEN` environment variable or use `gh` CLI which handles auth automatically.

## Notes

- Xtensa uses Espressif's LLVM fork: https://github.com/espressif/llvm-project
- ARM and RISC-V use upstream LLVM
- WASM files are gitignored (`**/*.wasm`) - always fetched from releases
