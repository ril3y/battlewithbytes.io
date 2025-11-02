# ARM/Thumb Disassembler

## Overview

The ARM disassembler provides comprehensive decoding of ARM Cortex-M instructions, focusing on the Thumb and Thumb-2 instruction sets commonly used in embedded microcontrollers.

## Architecture

### Modular Design

The disassembler follows a clean, testable architecture:

1. **DisassembledInstruction Interface**: Represents a single decoded instruction with all relevant metadata
2. **ArmDisassembler Class**: Main orchestrator that manages the disassembly process
3. **Instruction Decoding**: Pattern-based decoding for various instruction formats

### Key Features

- **16-bit Thumb Instructions**: Full support for the base Thumb instruction set
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

## Usage Example

```typescript
import { ArmDisassembler } from './ArmDisassembler';

// Create disassembler instance
const disassembler = new ArmDisassembler();

// Example ARM Thumb code (simple function prologue)
const code = new Uint8Array([
  0x80, 0xB5,  // PUSH {r7, lr}
  0x00, 0xAF,  // ADD r7, sp, #0
  0x04, 0x46,  // MOV r4, r0
  0x0D, 0x46,  // MOV r5, r1
  0x20, 0x46,  // MOV r0, r4
  0x29, 0x46,  // MOV r1, r5
  0x00, 0xF0, 0x04, 0xF8,  // BL <function>
  0x80, 0xBD,  // POP {r7, pc}
]);

// Disassemble at flash base address
const instructions = disassembler.disassemble(code, 0x08000000, true);

// Display disassembled instructions
for (const inst of instructions) {
  console.log(disassembler.formatInstruction(inst));
}
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

## Future Enhancements

Potential improvements for the disassembler:

1. **ELF File Support**: Direct loading of debugging symbols
2. **ARM Mode**: Support for 32-bit ARM instructions (less common in Cortex-M)
3. **Pseudo-Instructions**: Show high-level equivalents (e.g., NOP for MOV r8, r8)
4. **Advanced Analysis**: Function boundary detection, call graph generation
5. **Inline Source**: Mix source code with assembly when debug info available