CLANG WASM BUILD SCRIPTS
========================

These scripts build Clang/LLVM to WebAssembly for use in the browser.
Run them on the buildbox (192.168.1.62) for fastest compilation.


AVAILABLE SCRIPTS
-----------------

build-clang-riscv.sh
    Builds Clang WASM with RISC-V backend
    Output: clang-riscv.wasm.gz
    Targets: ESP32-C3, ESP32-C6, ESP32-H2
    Source: Upstream LLVM (release/19.x)

build-clang-xtensa.sh
    Builds Clang WASM with Xtensa backend
    Output: clang-xtensa.wasm.gz
    Targets: ESP32, ESP32-S2, ESP32-S3
    Source: Espressif LLVM Fork (xtensa_release_18.1.2)

setup-buildbox.sh
    Installs dependencies on the buildbox
    Run once before first build

deploy-scripts.sh
    Copies scripts to the buildbox from local machine


QUICK START
-----------

1. Deploy scripts to buildbox:

   From Windows (PowerShell):
   scp -i "$env:USERPROFILE\.ssh\buildbox_key" buildbox-scripts\*.sh builder@192.168.1.62:~/

   From Linux/Mac:
   scp -i ~/.ssh/buildbox_key buildbox-scripts/*.sh builder@192.168.1.62:~/

2. SSH to buildbox:

   ssh -i ~/.ssh/buildbox_key builder@192.168.1.62
   # Or if alias configured: ssh buildbox

3. Run setup (first time only):

   chmod +x *.sh
   ./setup-buildbox.sh

4. Build:

   ./build-clang-riscv.sh   # For RISC-V ESP32s
   ./build-clang-xtensa.sh  # For Xtensa ESP32s

5. Retrieve output:

   scp builder@192.168.1.62:~/clang-wasm-builds/output/*.wasm.gz .


BUILD CONFIGURATION
-------------------

Environment variables you can set:

  BUILD_ROOT    - Where to store builds (default: ~/clang-wasm-builds)
  LLVM_BRANCH   - LLVM version/branch to use
  EMSDK_VERSION - Emscripten SDK version (default: 3.1.50)
  NUM_JOBS      - Parallel build jobs (default: auto-detect)

Example:
  LLVM_BRANCH=release/20.x ./build-clang-riscv.sh


OUTPUT FILES
------------

After successful build:

  ~/clang-wasm-builds/output/clang-riscv.wasm     - Uncompressed
  ~/clang-wasm-builds/output/clang-riscv.wasm.gz  - Compressed (~15-20MB)
  ~/clang-wasm-builds/output/clang-xtensa.wasm    - Uncompressed
  ~/clang-wasm-builds/output/clang-xtensa.wasm.gz - Compressed (~15-20MB)

The compressed .wasm.gz files should be copied to:
  apps/web/public/wasm/clang_riscv/clang-riscv.wasm.gz
  apps/web/public/wasm/clang_xtensa/clang-xtensa.wasm.gz


TARGET TRIPLES
--------------

RISC-V (clang-riscv.wasm):
  - riscv32-unknown-elf         (bare metal)
  - riscv32-esp-elf             (ESP-IDF)
  - riscv32imc-unknown-none-elf (ESP32-C3)
  - riscv32imac-unknown-none-elf (ESP32-C6, H2)

Xtensa (clang-xtensa.wasm):
  - xtensa-esp32-elf            (ESP32)
  - xtensa-esp32s2-elf          (ESP32-S2)
  - xtensa-esp32s3-elf          (ESP32-S3)


BUILDBOX INFO
-------------

  Host:     192.168.1.62
  User:     builder
  CPU:      128 threads
  SSH Key:  ~/.ssh/buildbox_key (Linux/Mac)
            %USERPROFILE%\.ssh\buildbox_key (Windows)


TROUBLESHOOTING
---------------

"Command not found" errors:
  Run ./setup-buildbox.sh first

Out of memory:
  Reduce NUM_JOBS: NUM_JOBS=32 ./build-clang-riscv.sh

Build fails:
  Check disk space: df -h
  Clear old builds: rm -rf ~/clang-wasm-builds/build-*

Xtensa target not found:
  Make sure you're using Espressif's LLVM fork, not upstream


SEE ALSO
--------

  docs/BUILDING_CLANG.md       - Full documentation for ARM build
  experiments/archive/clang-wasm-experiment-2025-01/  - Original research
