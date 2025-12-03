- always make sure we check the linter for this project on new and modified code so it will build eventually

## Build Infrastructure

### Clang WASM Build Box
A dedicated build server is available for compiling Clang/LLVM WASM binaries:
- **Host:** 192.168.1.62 (Proxmox container)
- **CPU:** 128 threads available
- **User:** builder
- **SSH Key:** `%USERPROFILE%\.ssh\buildbox_key` (Windows) or `~/.ssh/buildbox_key` (Linux/Mac)
- **Connect:** `ssh builder@192.168.1.62`

Use this box when rebuilding the Clang ARM WASM binary (`clang-arm.wasm`) which requires significant RAM and CPU. See `docs/BUILDING_CLANG.md` for full build instructions.