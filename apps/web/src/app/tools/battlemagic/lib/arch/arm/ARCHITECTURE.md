# ARM Cortex-M Type System Architecture

## Overview

This module provides a comprehensive, strongly-typed TypeScript interface for ARM Cortex-M microcontroller registers and debugging infrastructure. It is designed for integration with the BattleMagic browser-based debugger.

## Design Principles

### 1. Type Safety First

Every register, bit field, and memory address is strongly typed. No magic numbers or string literals for critical operations.

```typescript
// Bad (stringly-typed, error-prone)
const value = await readMemory("DHCSR");
if ((value & 0x20000) !== 0) { /* ... */ }

// Good (strongly-typed, self-documenting)
const dhcsr = decodeDhcsr(await readMemory(DEBUG_ADDRESSES.DHCSR));
if (dhcsr.S_HALT) { /* CPU is halted */ }
```

### 2. Bit Field Abstraction

All multi-bit fields are represented as structured objects with named fields rather than raw numbers requiring manual bit manipulation.

```typescript
// Raw value: 0x61000000
const psr = decodePsr(xpsrValue);
console.log(psr.apsr.N); // true (Negative flag)
console.log(psr.apsr.Z); // true (Zero flag)
console.log(formatConditionFlags(psr.apsr)); // "NZ--"
```

### 3. Immutable Decoders

Decoder functions never modify the original value. They return new structured objects, enabling functional programming patterns and making state changes explicit.

### 4. Bidirectional Conversion

Critical registers provide both decode (read) and encode (write) functions:

```typescript
// Read and decode
const dhcsr = decodeDhcsr(rawValue);

// Modify and encode
const newValue = encodeDhcsr({
  C_DEBUGEN: true,
  C_HALT: true,
});
```

### 5. Architecture Compliance

All definitions match the official ARM Architecture Reference Manual specifications. Register layouts, bit positions, and semantics are identical to hardware documentation.

## Module Structure

```
lib/arm/
├── types.ts          # All TypeScript type definitions
├── utils.ts          # Decoder/encoder functions and utilities
├── constants.ts      # Memory addresses, magic values, bit masks
├── index.ts          # Public API exports
├── examples.ts       # Usage examples and integration patterns
├── README.md         # User documentation with examples
└── ARCHITECTURE.md   # This file
```

## Type Hierarchy

### Core Register Types

```
ArmCortexMRegisters (complete register set)
├── GeneralPurposeRegisters (R0-R12)
├── StackPointers (SP, MSP, PSP)
├── SpecialRegisters (PRIMASK, FAULTMASK, BASEPRI, CONTROL)
└── ProgramStatusRegister (xPSR with bit fields)
```

### System Control Block

```
SystemControlBlock
├── CPUID (CPU identification)
├── ICSR (Interrupt control/state)
├── VTOR (Vector table offset)
├── AIRCR (Application interrupt/reset control)
├── SCR (System control)
├── CCR (Configuration control)
├── SHPR (System handler priorities)
├── SHCSR (System handler control/state)
├── CFSR (Configurable fault status)
│   ├── MMFSR (MemManage fault)
│   ├── BFSR (BusFault)
│   └── UFSR (UsageFault)
├── HFSR (HardFault status)
├── DFSR (Debug fault status)
├── MMFAR (MemManage fault address)
├── BFAR (BusFault address)
└── AFSR (Auxiliary fault status)
```

### Debug Infrastructure

```
DebugRegisters
├── DHCSR (Debug halting control/status)
├── DCRSR (Debug core register selector)
├── DCRDR (Debug core register data)
└── DEMCR (Debug exception/monitor control)

FlashPatchBreakpoint
├── FP_CTRL (Control register)
├── FP_REMAP (Remap register)
└── FP_COMP[] (Comparator registers)

DataWatchpointTrace
├── DWT_CTRL (Control register)
├── DWT_CYCCNT (Cycle counter)
└── comparators[] (Watchpoint comparators)
```

### FPU Support

```
FpuRegisters
├── s0-s31 (Single precision)
├── d0-d15 (Double precision)
└── fpscr (FPU status/control)
```

## Key Design Patterns

### Pattern 1: Structured Bit Fields

Instead of manual bit masking:

```typescript
// Traditional approach
const flags = (psr >> 28) & 0xF;
const negative = (flags & 0x8) !== 0;
const zero = (flags & 0x4) !== 0;

// Type-safe approach
const psr = decodePsr(psrValue);
const { N, Z, C, V } = psr.apsr;
```

### Pattern 2: Register Metadata

Every register has associated metadata:

```typescript
const meta = getRegisterMetadata('primask');
// {
//   name: 'primask',
//   number: 19,           // GDB register number
//   size: 32,             // bits
//   permissions: {
//     readable: true,
//     writable: true,
//     privileged: true    // Requires privileged mode
//   },
//   description: 'Priority Mask Register'
// }
```

### Pattern 3: Safe Register I/O

Encode functions always include safety checks:

```typescript
// DHCSR writes require debug key
const dhcsrValue = encodeDhcsr({ C_HALT: true });
// Returns: 0xA05F0002 (key automatically included)

// AIRCR writes require VECTKEY
const aircrValue = encodeAircr({ SYSRESETREQ: true });
// Returns: 0x05FA0004 (key automatically included)
```

### Pattern 4: Human-Readable Descriptions

Complex registers have formatter functions:

```typescript
// Fault analysis
const cfsr = decodeCfsr(cfsrValue);
const faults = describeCfsr(cfsr);
// [
//   "MemManage: Data access violation",
//   "UsageFault: Undefined instruction"
// ]

// Exception identification
const exceptionName = formatExceptionNumber(exceptionNum);
// "HardFault" or "IRQ42"
```

### Pattern 5: CPU Feature Detection

Architecture-aware feature detection:

```typescript
const cpuid = decodeCpuid(cpuidValue);
const cpuName = getCpuName(cpuid);        // "Cortex-M4"
const arch = getArchitecture(cpuid);      // ARMv7E-M

const features: CpuFeatures = {
  architecture: arch,
  hasFpu: arch === ArmArchitecture.ARMv7EM,
  hasDsp: true,
  hasMpu: true,
  // ...
};
```

## Integration with GDB Protocol

The type system aligns with GDB Remote Serial Protocol conventions:

### Register Numbering

```typescript
CORE_REGISTER_NUMBERS = {
  R0: 0,
  R1: 1,
  // ...
  SP: 13,
  LR: 14,
  PC: 15,
  XPSR: 16,
  MSP: 17,
  PSP: 18,
  // ...
}
```

### Register Read/Write

```typescript
// GDB 'p' command (read register)
const regNum = CORE_REGISTER_NUMBERS.PC;
const pcValue = await gdb.readRegister(regNum);

// GDB 'P' command (write register)
await gdb.writeRegister(CORE_REGISTER_NUMBERS.R0, 0x12345678);
```

### Memory-Mapped Register Access

```typescript
// GDB 'm' command (read memory)
const dhcsrValue = await gdb.readMemory(DEBUG_ADDRESSES.DHCSR, 4);
const dhcsr = decodeDhcsr(dhcsrValue);

// GDB 'M' command (write memory)
const dhcsrNew = encodeDhcsr({ C_DEBUGEN: true, C_HALT: true });
await gdb.writeMemory(DEBUG_ADDRESSES.DHCSR, dhcsrNew);
```

## Memory Map Constants

All memory-mapped registers use symbolic constants:

```typescript
// System Control Block
SCB_ADDRESSES.CPUID   // 0xE000ED00
SCB_ADDRESSES.ICSR    // 0xE000ED04
SCB_ADDRESSES.VTOR    // 0xE000ED08
// ...

// Debug registers
DEBUG_ADDRESSES.DHCSR // 0xE000EDF0
DEBUG_ADDRESSES.DCRSR // 0xE000EDF4
DEBUG_ADDRESSES.DCRDR // 0xE000EDF8
DEBUG_ADDRESSES.DEMCR // 0xE000EDFC

// Flash Patch and Breakpoint
FPB_ADDRESSES.FP_CTRL    // 0xE0002000
FPB_ADDRESSES.FP_COMP0   // 0xE0002008
// ...
```

## Bit Manipulation Utilities

Low-level bit operations are provided but abstracted:

```typescript
// Extract bit field
const value = extractBitField(register, startBit, numBits);

// Extract single bit
const flag = extractBit(register, bitNumber);

// Set bit field
const newValue = setBitField(original, startBit, numBits, value);

// Set single bit
const newValue = setBit(original, bitNumber, true);
```

Users should prefer high-level decoders over manual bit manipulation.

## Error Handling Philosophy

The type system uses compile-time safety rather than runtime exceptions:

1. **Type constraints** prevent invalid register names
2. **Const enums** ensure valid bit field values
3. **Required fields** enforce complete register specifications
4. **Readonly types** prevent accidental mutations

```typescript
// Compile error: 'r13' is not assignable to type 'RegisterName'
const bad: RegisterName = 'r13'; // Use 'sp' instead

// Compile error: Property 'C_DEBUGEN' is missing
const incomplete = encodeDhcsr({ C_HALT: true });

// Compile error: Cannot assign to readonly property
psr.apsr.N = false; // Use encoder instead
```

## Performance Considerations

### Decoder Overhead

Decoders create new objects. For high-frequency operations, consider:

1. **Cache decoded values** when reading multiple bit fields
2. **Batch register reads** using GDB 'g' command
3. **Use raw values** for simple comparisons

```typescript
// Inefficient: Multiple decodes
if (decodeDhcsr(value).S_HALT && decodeDhcsr(value).S_REGRDY) { }

// Efficient: Single decode
const dhcsr = decodeDhcsr(value);
if (dhcsr.S_HALT && dhcsr.S_REGRDY) { }

// Most efficient: Raw comparison when appropriate
if ((value & DHCSR_MASKS.S_HALT) !== 0) { }
```

### Memory Footprint

Types have zero runtime cost (erased during compilation). Only decoder functions add code size.

## Testing Strategy

The type system enables comprehensive testing:

### Unit Tests

```typescript
describe('PSR Decoder', () => {
  it('should decode APSR flags correctly', () => {
    const psr = decodePsr(0x80000000); // N flag set
    expect(psr.apsr.N).toBe(true);
    expect(psr.apsr.Z).toBe(false);
  });
});
```

### Integration Tests

```typescript
describe('Debug Session', () => {
  it('should halt CPU correctly', async () => {
    const dhcsrValue = encodeDhcsr({ C_DEBUGEN: true, C_HALT: true });
    await writeMemory(DEBUG_ADDRESSES.DHCSR, dhcsrValue);

    const dhcsr = decodeDhcsr(await readMemory(DEBUG_ADDRESSES.DHCSR));
    expect(dhcsr.S_HALT).toBe(true);
  });
});
```

### Property-Based Tests

```typescript
describe('Bit Field Round-Trip', () => {
  it('should preserve values through encode/decode', () => {
    fc.assert(
      fc.property(fc.boolean(), fc.boolean(), (halt, step) => {
        const encoded = encodeDhcsr({ C_HALT: halt, C_STEP: step });
        const decoded = decodeDhcsr(encoded);
        return decoded.C_HALT === halt && decoded.C_STEP === step;
      })
    );
  });
});
```

## Future Extensions

### ARMv8-M TrustZone

Add support for security extensions:

```typescript
interface SecureRegisters {
  MSP_S: number;    // Secure Main Stack Pointer
  PSP_S: number;    // Secure Process Stack Pointer
  CONTROL_S: number; // Secure Control Register
  // ...
}
```

### Cortex-M55/M85

Add support for newer cores:

```typescript
interface MveBridge {
  VPR: number;     // Vector Predicate Register
  FPCCR_S: number; // Secure FP Context Control
  // ...
}
```

### Profiling Extensions

Add DWT profiling counter support:

```typescript
interface ProfilingCounters {
  cycleCount: number;
  cpiCount: number;
  exceptionOverhead: number;
  sleepCycles: number;
  lsuCycles: number;
  foldCount: number;
}
```

## References

- [ARMv7-M Architecture Reference Manual](https://developer.arm.com/documentation/ddi0403/)
- [ARM Cortex-M4 Technical Reference Manual](https://developer.arm.com/documentation/100166/)
- [ARM Debug Interface Architecture Specification](https://developer.arm.com/documentation/ihi0031/)
- [GDB Remote Serial Protocol](https://sourceware.org/gdb/current/onlinedocs/gdb/Remote-Protocol.html)

## License

Part of the BattleMagic debugger project by ril3y.
