# ARM Cortex-M Stack Unwinding Implementation

## Overview

This document describes the enhanced stack backtrace functionality implemented in `GdbClient.getBacktrace()`. The implementation performs proper ARM Cortex-M stack unwinding to provide complete call stacks.

## Implementation Location

**File:** `X:\battlewithbytes.io\src\app\tools\battlemagic\lib\gdb\GdbClient.ts`

**Methods:**
- `getBacktrace()`: Main stack unwinding function (lines 506-624)
- `isValidReturnAddress()`: Return address validation (lines 638-674)

## ARM Cortex-M Architecture Background

### Calling Convention (AAPCS)

ARM Cortex-M processors follow the ARM Architecture Procedure Call Standard (AAPCS):

- **R0-R3**: Argument/scratch registers
- **R4-R11**: Callee-saved registers
- **R12**: Intra-procedure-call scratch register
- **R13 (SP)**: Stack Pointer
- **R14 (LR)**: Link Register (stores return address)
- **R15 (PC)**: Program Counter

### Stack Layout

- Stack grows **downward** (high addresses to low addresses)
- SP points to the **last pushed value**
- Function calls push return addresses onto stack
- Frame pointer (R7 or R11) may or may not be used depending on compiler flags

### Thumb Mode

ARM Cortex-M processors operate exclusively in **Thumb mode**:
- All code addresses have **bit 0 set** to indicate Thumb mode
- Actual instruction addresses are even (bit 0 cleared)
- Return addresses stored in LR and on stack have bit 0 set

### Exception Return Values

Special values in range `0xFFFFFF00` to `0xFFFFFFFF` are **exception return values**, not code addresses:
- `0xFFFFFFF1`: Return to Handler mode
- `0xFFFFFFF9`: Return to Thread mode with MSP
- `0xFFFFFFFD`: Return to Thread mode with PSP
- These must be **excluded** from backtrace

## Algorithm

### Step 1: Initialize Frames

```
Frame 0: Current PC (program counter)
Frame 1: LR (link register - immediate caller)
```

### Step 2: Read Stack Memory

Read 512 bytes from current SP (stack pointer) upward into older frames.

### Step 3: Scan for Return Addresses

Walk through stack memory in 4-byte increments (32-bit values), looking for valid return addresses.

### Step 4: Validate Each Candidate

For each 32-bit value found on stack:

1. **Non-zero check**: `address != 0`
2. **Exception return check**: `(address & 0xFFFFFF00) != 0xFFFFFF00`
3. **Thumb bit check**: `(address & 1) == 1`
4. **Memory range check**: Address is in valid code region

### Step 5: Build Frame List

Add validated return addresses as stack frames, avoiding duplicates.

### Step 6: Limit Depth

Stop at 30 frames maximum to prevent infinite loops.

## Memory Regions

### Valid Code Regions

**Flash Memory:**
- Start: `0x00000000`
- End: `0x20000000`
- Contains: Application firmware

**SRAM (executable):**
- Start: `0x20000000`
- End: `0x30000000`
- Contains: Position-independent code, exception vectors

### Stack Region

**SRAM:**
- Start: `0x20000000`
- End: `0x30000000`
- Stack pointer must be in this range

## Return Address Validation

### Valid Return Address Criteria

```typescript
function isValidReturnAddress(address: number): boolean {
  // 1. Must be non-zero
  if (address === 0) return false;

  // 2. Must not be exception return value
  if ((address & 0xFFFFFF00) === 0xFFFFFF00) return false;

  // 3. Must have Thumb bit set (bit 0 = 1)
  if ((address & 1) === 0) return false;

  // 4. Must be in valid code region
  const cleanAddr = address & ~1;
  const inFlash = cleanAddr >= 0x00000000 && cleanAddr < 0x20000000;
  const inSram = cleanAddr >= 0x20000000 && cleanAddr < 0x30000000;

  return inFlash || inSram;
}
```

### Why These Checks?

1. **Non-zero**: Null pointers are not valid code addresses
2. **Exception return**: These are special values, not code
3. **Thumb bit**: ARM Cortex-M requires Thumb mode
4. **Memory range**: Prevents invalid/peripheral addresses

## Edge Cases Handled

### 1. Corrupted Stack

If stack contains random data, validation filters out invalid addresses.

### 2. Recursive Functions

Duplicate detection prevents same address appearing multiple times.

### 3. Invalid SP

If SP is outside SRAM range, unwinding stops gracefully after PC/LR frames.

### 4. Stack Overflow

Reading only 512 bytes prevents excessive memory reads. Max 128 potential frames checked.

### 5. Infinite Loops

Maximum frame limit (30) prevents infinite unwinding.

### 6. No Frame Pointer

Algorithm works with both frame-pointer and no-frame-pointer compilation.

## Debug Logging

Enable debug output with `config.debug = true`:

```typescript
const client = new GdbClient({ debug: true });
```

### Log Output

```
[getBacktrace] Initial registers:
  PC: 0x00001234
  LR: 0x00005679
  SP: 0x20003f00
  R7 (FP): 0x20003f10
  R11: 0x00000000

[getBacktrace] Frame 0: PC = 0x00001234
[getBacktrace] Frame 1: LR = 0x00005678
[getBacktrace] Read 512 bytes from stack at 0x20003f00
[getBacktrace] Frame 2: 0x00002345 (SP+8)
[getBacktrace] Frame 3: 0x00006789 (SP+20)
[getBacktrace] Stack unwinding complete: 4 frames found

[getBacktrace] Call stack:
  #0: 0x00001234 <current>
  #1: 0x00005678 <return>
  #2: 0x00002345 <frame_2>
  #3: 0x00006789 <frame_3>
```

## GDB Protocol Commands Used

### Register Read
```
Command: g
Response: <hex-encoded register values>
```

Gets PC, LR, SP, and other registers.

### Memory Read
```
Command: m<address>,<length>
Response: <hex-encoded memory data>
```

Reads stack memory from SP.

## Performance Characteristics

- **Register read**: 1 GDB command (~10ms typical)
- **Memory read**: 1 GDB command (~50ms typical)
- **Total time**: ~60ms typical
- **Data transferred**: ~80 bytes (registers) + 512 bytes (stack) = 592 bytes

## Limitations

### 1. Frame Information

Current implementation returns addresses only, not function names. Future enhancement could integrate with symbol table.

### 2. Inline Functions

Compiler-inlined functions won't appear in backtrace.

### 3. Tail Call Optimization

Tail-call optimized functions may not appear correctly.

### 4. Interrupt Context

Stack unwinding through interrupt handlers requires special handling (not yet implemented).

### 5. Multi-Core

Only works with single core. Multi-core requires per-core stack unwinding.

## Future Enhancements

### 1. Symbol Resolution

Integrate with ELF symbol table to resolve addresses to function names:

```typescript
interface StackFrame {
  level: number;
  address: number;
  function: string;      // Function name from symbols
  file?: string;         // Source file
  line?: number;         // Source line
}
```

### 2. DWARF Unwinding

Use DWARF debug information for precise frame pointer tracking:
- `.debug_frame` section provides unwind tables
- More accurate than heuristic scanning
- Handles complex scenarios (exceptions, optimizations)

### 3. Exception Frame Detection

Detect and parse exception stack frames:
- Identify exception return values in LR
- Parse exception stack frame (R0-R3, R12, LR, PC, xPSR)
- Show pre-exception call stack

### 4. Parameter Values

Show function parameters for each frame:
- Use calling convention (R0-R3 for first 4 args)
- Read remaining args from stack

### 5. Optimized Frame Pointers

Handle frame pointer optimizations:
- Detect omitted frame pointer
- Use compiler-specific unwind info

## Testing

### Manual Test

```typescript
const client = new GdbClient({ debug: true });
await client.connect(port);
await client.attach(targetId);

// Halt at breakpoint
await client.halt();

// Get backtrace
const frames = await client.getBacktrace();

// Display
for (const frame of frames) {
  console.log(`#${frame.level}: 0x${frame.address.toString(16)}`);
}
```

### Expected Output

```
#0: 0x00001234
#1: 0x00005678
#2: 0x00002345
#3: 0x00006789
#4: 0x00001abc
```

## References

### ARM Documentation

- **ARM Architecture Procedure Call Standard (AAPCS)**
  https://developer.arm.com/documentation/ihi0042/latest

- **ARM Cortex-M4 Technical Reference Manual**
  https://developer.arm.com/documentation/100166/latest

- **ARM v7-M Architecture Reference Manual**
  https://developer.arm.com/documentation/ddi0403/latest

### GDB Protocol

- **GDB Remote Serial Protocol (RSP) Specification**
  https://sourceware.org/gdb/current/onlinedocs/gdb/Remote-Protocol.html

- **GDB Memory Map**
  https://sourceware.org/gdb/current/onlinedocs/gdb/Memory-Map-Format.html

### Exception Handling

- **ARM Cortex-M Exception Handling**
  https://developer.arm.com/documentation/100235/latest

## Glossary

- **AAPCS**: ARM Architecture Procedure Call Standard
- **BMP**: Black Magic Probe
- **DWARF**: Debugging With Attributed Record Formats
- **FP**: Frame Pointer (R7 or R11)
- **LR**: Link Register (R14)
- **PC**: Program Counter (R15)
- **RSP**: Remote Serial Protocol (GDB protocol)
- **SP**: Stack Pointer (R13)
- **SWD**: Serial Wire Debug
- **Thumb**: ARM instruction set with 16-bit instructions

## Author

Implementation by ril3y
Date: 2025-11-03
Target: ARM Cortex-M4 (nRF52832)
