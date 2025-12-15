# ARM/Thumb Disassembler

## Overview

BattleMagic provides two disassembler implementations for ARM Cortex-M instructions:

1. **ArmDisassembler**: Lightweight, custom implementation with common instructions
2. **CapstoneDisassembler**: Industry-standard Capstone engine with complete instruction coverage

Both disassemblers focus on the Thumb and Thumb-2 instruction sets commonly used in embedded microcontrollers.

## Quick Comparison

| Feature                  | ArmDisassembler         | CapstoneDisassembler       |
| ------------------------ | ----------------------- | -------------------------- |
| **Instruction Coverage** | ~30 common instructions | Complete ARM Thumb/Thumb-2 |
| **Accuracy**             | Good for common code    | Industry-standard          |
| **Performance**          | Very fast (pure JS)     | Fast (WebAssembly)         |
| **Bundle Size**          | ~20KB                   | ~500KB (dynamic import)    |
| **Initialization**       | Instant                 | ~100-200ms first time      |
| **API**                  | Synchronous             | Asynchronous               |
| **Best For**             | Quick prototyping       | Production analysis        |

**Recommendation**: Use **CapstoneDisassembler** for production code and detailed analysis. Use **ArmDisassembler** for rapid prototyping or educational purposes.

## Architecture

### Modular Design

Both disassemblers follow a clean, testable architecture:

1. **DisassembledInstruction Interface**: Shared interface for decoded instructions
2. **Disassembler Class**: Main orchestrator for disassembly process
3. **Branch Detection**: Automatic identification of control flow
4. **Target Calculation**: PC-relative branch target resolution

### Key Features

- **16-bit Thumb Instructions**: Full support for base Thumb instruction set
- **32-bit Thumb-2 Instructions**: Extended instruction set for ARM Cortex-M3/M4/M7
- **Control Flow Analysis**: Tracks branches, calls, and returns
- **Symbol Resolution**: Associates addresses with function names
- **Breakpoint Support**: Integrated with GDB client for debugging

## Supported Instructions

### Data Processing

- Move operations (MOV, MVN)
- Arithmetic (ADD, SUB, MUL, ADC, SBC)
- Logic operations (AND, ORR, EOR, BIC)
- Shift operations (LSL, LSR, ASR, ROR)
- Compare and test (CMP, CMN, TST, TEQ)

### Load/Store

- Register operations (LDR, STR, LDRB, STRB, LDRH, STRH)
- Immediate offsets
- Register offsets
- PC-relative loads
- SP-relative loads/stores
- Load/store multiple (LDM, STM, PUSH, POP)

### Branch Instructions

- Conditional branches (BEQ, BNE, BCS, BCC, etc.)
- Unconditional branch (B)
- Branch with link (BL)
- Branch exchange (BX)
- Compare and branch (CBZ, CBNZ)

### System Instructions

- Software interrupt (SVC)
- Breakpoint (BKPT)
- No operation (NOP)
- Memory barriers (DMB, DSB, ISB)

## Usage Examples

### ArmDisassembler (Simple)

```typescript
import { ArmDisassembler } from "./ArmDisassembler";

// Create disassembler instance (instant)
const disassembler = new ArmDisassembler();

// Example ARM Thumb code
const code = new Uint8Array([
  0x80,
  0xb5, // PUSH {r7, lr}
  0x00,
  0xaf, // ADD r7, sp, #0
  0x00,
  0xf0,
  0x04,
  0xf8, // BL <function>
  0x80,
  0xbd, // POP {r7, pc}
]);

// Disassemble (synchronous)
const instructions = disassembler.disassemble(code, 0x08000000, true);

// Display
for (const inst of instructions) {
  console.log(disassembler.formatInstruction(inst));
}
```

### CapstoneDisassembler (Recommended)

```typescript
import { CapstoneDisassembler } from './CapstoneDisassembler';

// Create and initialize (async)
const disassembler = new CapstoneDisassembler();
await disassembler.initialize();

// Same code sample
const code = new Uint8Array([...]);

// Disassemble (async)
const instructions = await disassembler.disassemble(code, 0x08000000, true);

// Display
for (const inst of instructions) {
  console.log(disassembler.formatInstruction(inst));
}

// Cleanup when done
disassembler.dispose();
```

### Quick Start with Factory

```typescript
import { createCapstoneDisassembler } from "./CapstoneDisassembler";

// One-line initialization
const disasm = await createCapstoneDisassembler();
const instructions = await disasm.disassemble(code, 0x08000000);
disasm.dispose();
```

## Integration with DisassemblyView

The DisassemblyView component provides a rich UI for viewing disassembled code:

1. **Navigation**: Click on branch targets to navigate
2. **Breakpoints**: Click in the margin to set/remove breakpoints
3. **Syntax Highlighting**: Different colors for instruction types
4. **Symbol Display**: Shows function names when available
5. **Cross-References**: Shows which instructions reference the current address
6. **PC Tracking**: Automatically follows the program counter

## Testing

The disassembler includes comprehensive test coverage:

```bash
# Run disassembler tests
npm test src/app/tools/battlemagic/lib/disasm
```

## Performance Considerations

The disassembler is designed for efficiency:

- **Zero heap allocation**: Uses pre-allocated buffers where possible
- **Streaming decode**: Can process large memory regions incrementally
- **Cache-friendly**: Sequential memory access patterns
- **Lazy evaluation**: Only decodes what's needed for display

## Choosing the Right Disassembler

### Use ArmDisassembler When:

- Building quick prototypes or demos
- Teaching ARM assembly basics
- Working with simple, common instructions
- Need synchronous API
- Want instant startup (no async init)
- Bundle size is critical

### Use CapstoneDisassembler When:

- Analyzing production firmware
- Need complete instruction coverage
- Working with advanced Thumb-2 code
- Require industry-standard accuracy
- Building professional analysis tools
- CFG analysis with complex branching

## Advanced Features

### Branch Detection

Both disassemblers automatically detect and classify branch instructions:

```typescript
const instructions = await disasm.disassemble(code, 0x08000000);

for (const inst of instructions) {
  if (inst.isBranch) {
    console.log(`Branch at 0x${inst.address.toString(16)}`);

    if (inst.branchTarget !== undefined) {
      console.log(`  Target: 0x${inst.branchTarget.toString(16)}`);
    } else {
      console.log(`  Indirect (register-based)`);
    }
  }
}
```

### Control Flow Analysis

Build control flow graphs from disassembled code:

```typescript
const instructions = await disasm.disassemble(code, 0x08000000);
const flowMap = disasm.analyzeControlFlow(instructions);

// flowMap: Map<sourceAddress, Set<targetAddress>>
for (const [source, targets] of flowMap) {
  console.log(
    `0x${source.toString(16)} -> ${[...targets].map((t) => "0x" + t.toString(16)).join(", ")}`,
  );
}
```

### Function Entry Detection

Identify function boundaries using heuristics:

```typescript
const instructions = await disasm.disassemble(code, 0x08000000);

for (let i = 0; i < instructions.length; i++) {
  if (disasm.isFunctionEntry(instructions, i)) {
    console.log(`Function at 0x${instructions[i].address.toString(16)}`);
  }
}
```

## Migration from ArmDisassembler to CapstoneDisassembler

See `CAPSTONE_USAGE.md` for detailed migration guide.

Quick migration:

```typescript
// Before
import { ArmDisassembler } from "./ArmDisassembler";
const disasm = new ArmDisassembler();
const instructions = disasm.disassemble(data, addr);

// After
import { CapstoneDisassembler } from "./CapstoneDisassembler";
const disasm = new CapstoneDisassembler();
await disasm.initialize();
const instructions = await disasm.disassemble(data, addr);
// Don't forget: disasm.dispose() when done
```

## Performance Benchmarks

Disassembling 512 bytes of mixed Thumb/Thumb-2 code:

| Metric           | ArmDisassembler | CapstoneDisassembler |
| ---------------- | --------------- | -------------------- |
| First call       | <1ms            | ~150ms (WASM init)   |
| Subsequent calls | ~0.5ms          | ~1-2ms               |
| Memory usage     | ~50KB           | ~2-3MB               |

**Note**: CapstoneDisassembler's initialization cost is amortized over many calls.

## Documentation

- **CAPSTONE_USAGE.md**: Complete guide to using Capstone disassembler
- **compare-disassemblers.ts**: Side-by-side comparison tool

## Future Enhancements

Potential improvements:

1. **ELF File Support**: Direct loading of debugging symbols
2. **DWARF Debug Info**: Source line correlation
3. **Pseudo-Instructions**: High-level instruction equivalents
4. **Advanced Analysis**: Automated function boundary detection
5. **Inline Source**: Mix source code with assembly
6. **Custom Architectures**: Plugin system for other MCUs
