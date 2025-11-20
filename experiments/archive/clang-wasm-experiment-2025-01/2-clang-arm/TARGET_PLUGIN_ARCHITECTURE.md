# Target Plugin Architecture

## Overview

Instead of a monolithic compiler with all targets bundled, we use a **plugin-based architecture** where each MCU family (STM32, ESP32, Nordic nRF, etc.) is a separate WASM module that can be loaded on-demand.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser IDE                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐         ┌──────────────────────┐   │
│  │  Compiler Core │ ◄─────► │  Target Plugin API   │   │
│  │  (Clang WASM)  │         │                      │   │
│  └────────────────┘         └──────────────────────┘   │
│         │                             │                 │
│         │                             │                 │
│         ▼                             ▼                 │
│  ┌────────────────┐         ┌──────────────────────┐   │
│  │   LLVM Core    │         │  Target Plugins:     │   │
│  │   - Parser     │         │  ┌────────────────┐  │   │
│  │   - IR Gen     │         │  │ STM32 Plugin   │  │   │
│  │   - Optimizer  │         │  │ - ARM Cortex-M │  │   │
│  └────────────────┘         │  │ - CMSIS Headers│  │   │
│                             │  │ - Linker Script│  │   │
│                             │  └────────────────┘  │   │
│                             │  ┌────────────────┐  │   │
│                             │  │ ESP32 Plugin   │  │   │
│                             │  │ - Xtensa/RISC-V│  │   │
│                             │  │ - ESP-IDF      │  │   │
│                             │  └────────────────┘  │   │
│                             │  ┌────────────────┐  │   │
│                             │  │ nRF52 Plugin   │  │   │
│                             │  │ - ARM Cortex-M4│  │   │
│                             │  │ - Nordic SDK   │  │   │
│                             │  └────────────────┘  │   │
│                             └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. Compiler Core (clang-core.wasm)

**Responsibilities:**
- C/C++ parsing and semantic analysis
- LLVM IR generation
- Platform-agnostic optimizations
- Linker (LLD)

**What it DOESN'T include:**
- Target-specific backends (no ARM, Xtensa, RISC-V codegen)
- Headers (no CMSIS, ESP-IDF, etc.)
- Linker scripts

**Size:** ~3-4 MB compressed (minimal, no backends)

### 2. Target Plugins (e.g., stm32-target.wasm)

Each target plugin is a **separate WASM module** containing:

**A. Target Backend**
- LLVM target backend (ARM, Xtensa, RISC-V, etc.)
- Instruction selection
- Register allocation
- Code emission

**B. SDK Files (Virtual Filesystem)**
- Headers (CMSIS, ESP-IDF, Nordic SDK, etc.)
- Linker scripts
- Startup code

**C. Build Configuration**
- Compiler flags (`-mcpu=cortex-m3`, `-mthumb`)
- Linker flags
- Preprocessor defines (`-DSTM32F103xB`)

**D. Metadata**
- Target name and description
- Supported devices
- Memory layouts
- Flash tool integration info

**Size:** 1-3 MB compressed per target

## Target Plugin Interface

### Plugin Manifest (JSON)

Each plugin exports a manifest:

```typescript
interface TargetPluginManifest {
  name: string;                    // "stm32f1"
  displayName: string;             // "STM32F1 Series"
  version: string;                 // "1.0.0"

  // Architecture info
  architecture: string;            // "arm-none-eabi"
  cpu: string;                     // "cortex-m3"
  features: string[];              // ["+thumb", "+strict-align"]

  // Supported devices
  devices: DeviceInfo[];

  // Build settings
  compilerFlags: string[];         // ["-mcpu=cortex-m3", "-mthumb"]
  linkerFlags: string[];
  defines: Record<string, string>; // { "STM32F103xB": "1" }

  // SDK files
  headers: HeaderFile[];           // Virtual filesystem paths
  linkerScripts: LinkerScript[];

  // WASM backend module
  backendWasm: string;             // URL to backend WASM
}

interface DeviceInfo {
  id: string;                      // "STM32F103C8T6"
  name: string;                    // "STM32F103C8T6 (Blue Pill)"
  flash: number;                   // 65536 bytes
  ram: number;                     // 20480 bytes
  linkerScript: string;            // "STM32F103C8Tx_FLASH.ld"
}

interface HeaderFile {
  path: string;                    // "/sdk/stm32f1xx.h"
  url: string;                     // URL to fetch header
}
```

### Plugin API

```typescript
interface TargetPlugin {
  // Lifecycle
  initialize(): Promise<void>;
  dispose(): void;

  // Compilation
  getCompilerArgs(device: string): string[];
  getLinkerArgs(device: string): string[];

  // Virtual filesystem
  loadHeaders(): Promise<VirtualFS>;
  getLinkerScript(device: string): string;

  // Code generation backend
  getBackendModule(): WebAssembly.Module;
}
```

## Example: STM32 Target Plugin

### File Structure

```
stm32-target-plugin/
├── manifest.json              # Plugin metadata
├── backend/
│   └── llvm-arm-backend.wasm  # LLVM ARM backend
├── sdk/
│   ├── headers/
│   │   ├── stm32f103xb.h
│   │   ├── stm32f1xx.h
│   │   ├── core_cm3.h
│   │   └── ...
│   └── linker-scripts/
│       ├── STM32F103C8Tx_FLASH.ld
│       └── STM32F103RBTx_FLASH.ld
└── index.js                   # Plugin entry point
```

### manifest.json

```json
{
  "name": "stm32f1",
  "displayName": "STM32F1 Series (ARM Cortex-M3)",
  "version": "1.0.0",
  "architecture": "thumbv7m-none-eabi",
  "cpu": "cortex-m3",
  "features": ["+thumb2", "+strict-align"],

  "devices": [
    {
      "id": "STM32F103C8T6",
      "name": "STM32F103C8T6 (Blue Pill)",
      "flash": 65536,
      "ram": 20480,
      "linkerScript": "STM32F103C8Tx_FLASH.ld"
    },
    {
      "id": "STM32F103RBT6",
      "name": "STM32F103RBT6",
      "flash": 131072,
      "ram": 20480,
      "linkerScript": "STM32F103RBTx_FLASH.ld"
    }
  ],

  "compilerFlags": [
    "-target", "thumbv7m-none-eabi",
    "-mcpu=cortex-m3",
    "-mthumb",
    "-mfloat-abi=soft",
    "-fno-exceptions",
    "-fno-rtti"
  ],

  "linkerFlags": [
    "-nostdlib",
    "-Wl,--gc-sections"
  ],

  "defines": {
    "STM32F103xB": "1",
    "USE_HAL_DRIVER": "1"
  },

  "backendWasm": "./backend/llvm-arm-backend.wasm"
}
```

## Compilation Flow

### 1. User Selects Target

```typescript
// User selects device in IDE
const selectedDevice = "STM32F103C8T6";

// Load appropriate plugin
const plugin = await loadTargetPlugin("stm32f1");
await plugin.initialize();
```

### 2. Prepare Virtual Filesystem

```typescript
// Plugin provides headers and linker script
const vfs = await plugin.loadHeaders();
vfs.writeFile("/project/main.c", sourceCode);
vfs.writeFile("/sdk/linker.ld", plugin.getLinkerScript(selectedDevice));
```

### 3. Compile

```typescript
// Get compile args from plugin
const compilerArgs = [
  "/project/main.c",
  "-o", "/project/firmware.elf",
  ...plugin.getCompilerArgs(selectedDevice),
  "-I/sdk/headers",
  "-T/sdk/linker.ld"
];

// Pass to Clang core + plugin backend
const result = await clangCore.compile(compilerArgs, {
  backend: plugin.getBackendModule(),
  filesystem: vfs
});
```

## Building Target Plugins

### STM32 Plugin Build

```bash
# Build LLVM ARM backend only
emcmake cmake ../llvm-project/llvm \
  -DLLVM_TARGETS_TO_BUILD="ARM" \
  -DLLVM_INCLUDE_EXAMPLES=OFF \
  -DLLVM_INCLUDE_TESTS=OFF \
  -DCMAKE_BUILD_TYPE=MinSizeRel

emmake make ARMCodeGen -j8

# Package plugin
node package-plugin.js \
  --backend build/lib/libLLVMARMCodeGen.a \
  --sdk ../stm32-headers \
  --manifest stm32f1-manifest.json \
  --output stm32-target.wasm
```

### ESP32 Plugin Build

```bash
# Build LLVM Xtensa/RISC-V backend
emcmake cmake ../llvm-project/llvm \
  -DLLVM_EXPERIMENTAL_TARGETS_TO_BUILD="Xtensa;RISCV" \
  ...

# Package with ESP-IDF headers
node package-plugin.js \
  --backend build/lib/libLLVMXtensaCodeGen.a \
  --sdk ../esp-idf/components \
  --manifest esp32-manifest.json \
  --output esp32-target.wasm
```

## Plugin Loading System

```typescript
class TargetPluginManager {
  private plugins: Map<string, TargetPlugin> = new Map();
  private registry: PluginRegistry;

  async loadPlugin(pluginName: string): Promise<TargetPlugin> {
    // Check cache
    if (this.plugins.has(pluginName)) {
      return this.plugins.get(pluginName)!;
    }

    // Fetch plugin manifest
    const manifest = await fetch(`/targets/${pluginName}/manifest.json`)
      .then(r => r.json());

    // Load backend WASM
    const backendWasm = await fetch(manifest.backendWasm)
      .then(r => r.arrayBuffer());

    const backendModule = await WebAssembly.compile(backendWasm);

    // Create plugin instance
    const plugin = new TargetPluginImpl(manifest, backendModule);
    await plugin.initialize();

    this.plugins.set(pluginName, plugin);
    return plugin;
  }

  listAvailablePlugins(): PluginInfo[] {
    return this.registry.getPlugins();
  }
}

// Usage in IDE
const pluginManager = new TargetPluginManager();

// Load STM32 plugin when user selects it
const stm32Plugin = await pluginManager.loadPlugin("stm32f1");

// Compile with plugin
const binary = await compile(sourceCode, {
  target: stm32Plugin,
  device: "STM32F103C8T6"
});
```

## Benefits

### 1. **Modular Loading**
- Only load what you need (e.g., only STM32 backend)
- Faster initial page load
- Reduced bandwidth

### 2. **Independent Updates**
- Update STM32 plugin without touching ESP32
- Add new targets without recompiling core
- Version each plugin separately

### 3. **Community Extensions**
- Third parties can create plugins
- Share plugins via NPM or CDN
- Plugin marketplace

### 4. **Size Optimization**
- Core: 3-4 MB (no backends)
- STM32 plugin: 1-2 MB (ARM backend + headers)
- ESP32 plugin: 2-3 MB (Xtensa backend + ESP-IDF)
- **Total loaded:** 4-7 MB (vs 10+ MB monolithic)

### 5. **Architecture Diversity**
- ARM Cortex-M (STM32, nRF)
- Xtensa (ESP32 classic)
- RISC-V (ESP32-C3, GD32V)
- 8051 (legacy MCUs)

## Example Plugins

### 1. STM32 Family
- **stm32f1-target** (Cortex-M3)
- **stm32f4-target** (Cortex-M4F)
- **stm32h7-target** (Cortex-M7)

### 2. ESP32 Family
- **esp32-target** (Xtensa LX6)
- **esp32s2-target** (Xtensa LX7)
- **esp32c3-target** (RISC-V)

### 3. Nordic Family
- **nrf51-target** (Cortex-M0)
- **nrf52-target** (Cortex-M4F)
- **nrf53-target** (Cortex-M33)

### 4. Others
- **rp2040-target** (Raspberry Pi Pico - Cortex-M0+)
- **teensy-target** (PJRC Teensy - Cortex-M7)
- **gd32v-target** (GigaDevice RISC-V)

## Implementation Phases

### Phase 1: Core Infrastructure
1. Design plugin interface
2. Build plugin loader
3. Create virtual filesystem bridge

### Phase 2: First Plugin (STM32)
1. Build LLVM ARM backend to WASM
2. Package CMSIS headers
3. Create STM32F1 manifest
4. Test end-to-end compilation

### Phase 3: Additional Plugins
1. ESP32 plugin (Xtensa backend)
2. nRF52 plugin (ARM Cortex-M4)
3. RP2040 plugin (ARM Cortex-M0+)

### Phase 4: Plugin Ecosystem
1. NPM package for each plugin
2. Plugin CDN hosting
3. Plugin marketplace
4. Community plugin SDK

## Next Steps

1. ✅ Design plugin architecture (this document)
2. Create plugin interface TypeScript definitions
3. Implement TargetPluginManager
4. Build first STM32 plugin
5. Test with real STM32 code
