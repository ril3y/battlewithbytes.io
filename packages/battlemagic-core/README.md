# BattleMagic Core (WASM)

High-performance WebAssembly core for BattleMagic firmware analysis tool.

## Features

- ARM/Thumb disassembly
- Binary format parsing (ELF, Intel HEX, raw binary)
- Control flow graph analysis
- GDB Remote Serial Protocol support
- Memory operations

## Building

Requires Rust toolchain and wasm-pack.

```bash
# Install wasm-pack
cargo install wasm-pack

# Build for production
pnpm build

# Build for development
pnpm build:dev
```

## Usage

```typescript
import { Disassembler } from "@battlewithbytes/battlemagic-core";

const disasm = new Disassembler(0x08000000);
const instructions = disasm.disassemble_thumb(bytes, 100);
```

## Size Optimization

The WASM module is optimized for size:

- LTO enabled
- Size optimization level `z`
- Debug symbols stripped
- Typical bundle size: ~500KB-1MB
