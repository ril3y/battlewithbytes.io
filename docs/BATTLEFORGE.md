# BattleForge IDE

Browser-based C/C++ compiler, linker, and flasher for embedded ARM microcontrollers.

## Vision

A complete embedded development workflow in the browser:

```
Write C/C++ → Compile (Clang WASM) → Link (LLD WASM) → Flash (WebSerial) → Debug (BattleMagic)
```

No toolchain installation required. Just open a browser and start developing for STM32.

## Current Status

### Working

- [x] Clang ARM WASM compiler (~74MB) with ARM Cortex-M backend
- [x] Compile C to `.o` object files (ARM thumb) - **TESTED & WORKING**
- [x] Virtual filesystem for in-browser file management
- [x] WASI bindings for WASM execution (fd_write, path_rename, etc.)
- [x] Basic code editor with syntax highlighting
- [x] Terminal/output panel
- [x] Compiler loading with progress indicator

### In Progress

- [ ] **Linking** - Need to rebuild Clang WASM with LLD enabled (current YoWASP build lacks LLD)
- [ ] **STM32 Headers** - Pull CMSIS/HAL headers from GitHub
- [ ] **Monaco Editor** - Better code editing experience

### Planned

- [ ] **UART Flashing** - WebSerial + STM32 UART bootloader protocol
- [ ] **BMP Flashing** - WebSerial + Black Magic Probe (UART or SWD)
- [ ] **Debug Integration** - "Debug in BattleMagic" button
- [ ] **Project Templates** - Blinky, UART echo, etc.
- [ ] **Multi-file Support** - Projects with multiple source files
- [ ] **Binary Blob Linking** - Link pre-compiled libraries
- [ ] **Save/Load Projects** - LocalStorage or file system

## Architecture

```
battleforge/
├── page.tsx                    # Route entry point
├── layout.tsx                  # Fullscreen layout
├── battleforge.css             # Tool-specific styles
├── components/
│   ├── BattleForgeMonitor.tsx  # Main IDE container
│   ├── EditorPanel.tsx         # Code editor
│   ├── TerminalPanel.tsx       # Output/logs
│   ├── ToolbarPanel.tsx        # Compile/Flash buttons
│   └── VFSConsolePanel.tsx     # Virtual filesystem inspector
└── lib/
    ├── compiler/
    │   └── ClangWasmLoader.ts  # Clang WASM loader & executor
    ├── context/
    │   └── ProjectContext.tsx  # React context for project state
    ├── hooks/
    │   └── usePluginCompiler.ts # Compiler plugin hook
    ├── vfs/
    │   └── VFSCommands.ts      # Virtual filesystem commands
    └── wasi/
        └── wasiBindings.ts     # WASI + Emscripten bindings
```

## Clang WASM Build

### Current Binary (YoWASP)

- **Binary:** `public/wasm/clang_arm/clang-arm.wasm` (~74MB, ~19MB gzipped)
- **Source:** YoWASP/llvm-project (Clang 21.1.4)
- **Targets:** ARM Cortex-M (thumbv6m, thumbv7m, thumbv7em)
- **Limitation:** Does NOT include LLD linker

### Custom Fork (for LLD support)

To enable linking, rebuild from the custom fork:

- **Fork:** https://github.com/ril3y/clang-arm (branch: `develop`)
- **Build with:** `-DLLVM_ENABLE_PROJECTS="clang;lld"`
- **Build box:** 192.168.1.62 (128 threads available)

See `docs/BUILDING_CLANG.md` for rebuild instructions.

## Target Chips

### Phase 1 (Current Focus)

- **STM32F1** (Cortex-M3) - Blue Pill, etc.
- **STM32F4** (Cortex-M4) - Black Pill, Nucleo, etc.

### Phase 2 (Future)

- **nRF52** (Cortex-M4F)
- **RP2040** (Cortex-M0+)
- **ESP32** (Xtensa/RISC-V) - requires different backend

## Flashing Methods

| Method                   | Protocol                        | Status  |
| ------------------------ | ------------------------------- | ------- |
| STM32 UART Bootloader    | WebSerial + STM32 boot protocol | Planned |
| Black Magic Probe (UART) | WebSerial + GDB RSP             | Planned |
| Black Magic Probe (SWD)  | WebSerial + GDB RSP             | Planned |

## Headers & Libraries

### STM32 Headers

Need to integrate STM32 CMSIS and HAL headers. Options:

1. Bundle minimal headers in WASM filesystem
2. Fetch from GitHub on demand (STMicroelectronics/cmsis_device_f1, etc.)
3. Use CDN/cached versions

### Standard Library

Options for embedded libc:

- newlib-nano (small footprint)
- picolibc
- No stdlib (`-nostdlib -ffreestanding`)

### Binary Blobs

For linking pre-compiled libraries:

- USB stack
- RTOS (FreeRTOS, Zephyr)
- Vendor HAL libraries

## Integration with BattleMagic

BattleMagic provides:

- ARM disassembly (yaxpeax-arm)
- ELF parsing (goblin)
- GDB RSP protocol parsing
- Control flow graph analysis
- Vector table detection

Future integration:

- "Debug in BattleMagic" button after successful compile
- Share compiled `.elf` between tools
- Live debugging via Black Magic Probe

## Development

```bash
# Start dev server
pnpm dev

# Navigate to
http://localhost:3001/tools/battleforge-new

# Load compiler, write code, compile
```

## Compile Flow (Current)

```typescript
// 1. Load compiler
const loader = getClangWasmLoader();
await loader.load();

// 2. Compile C to object file
const result = await loader.execute({
  args: [
    "-target",
    "arm-none-eabi",
    "-mcpu=cortex-m3",
    "-mthumb",
    "-nostdlib",
    "-ffreestanding",
    "-c",
    "/main.c",
    "-o",
    "/main.o",
  ],
  files: { "/main.c": sourceCode },
});

// 3. TODO: Link object files to ELF
// 4. TODO: Convert ELF to BIN
// 5. TODO: Flash via WebSerial
```

## Related Documentation

- `docs/BUILDING_CLANG.md` - How to rebuild the Clang WASM
- `packages/battlemagic-analyzer/README.md` - BattleMagic capabilities
- `BlackMagicProbe_BrowserGdbUartClient_PRD.md` - Debug client PRD

## License

MIT - See repository root for details.
