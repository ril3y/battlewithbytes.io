# Stack Backtrace Quick Reference

## Usage

```typescript
// Enable debug logging to see unwinding details
const client = new GdbClient({ debug: true });

// Get backtrace
const frames = await client.getBacktrace();

// Display
frames.forEach(frame => {
  console.log(`#${frame.level}: 0x${frame.address.toString(16)}`);
});
```

## Frame Structure

```typescript
interface StackFrame {
  level: number;        // Frame number (0 = current, 1 = caller, etc.)
  address: number;      // Instruction address (with Thumb bit cleared)
  function?: string;    // Function label (e.g., '<current>', '<return>')
}
```

## Validation Rules

### Valid Return Address Requirements

| Check | Rule | Why |
|-------|------|-----|
| Non-zero | `address != 0` | Null is not code |
| Exception return | `(address & 0xFFFFFF00) != 0xFFFFFF00` | 0xFFFFFFxx are special values |
| Thumb bit | `(address & 1) == 1` | Cortex-M requires Thumb mode |
| Flash range | `0x00000000 <= addr < 0x20000000` | Code in Flash |
| SRAM range | `0x20000000 <= addr < 0x30000000` | Code in RAM |

### Memory Map (Typical ARM Cortex-M)

```
0x00000000 ┌─────────────────┐
           │   Flash (Code)  │
           │                 │
0x08000000 │   (Typical)     │
           │                 │
0x20000000 ├─────────────────┤
           │   SRAM (Stack)  │
           │   SRAM (Heap)   │
           │   SRAM (Data)   │
0x30000000 ├─────────────────┤
           │   Peripherals   │
0xE0000000 ├─────────────────┤
           │   System        │
0xFFFFFFFF └─────────────────┘
```

## Debug Output

Enable with `config.debug = true`:

```
[getBacktrace] Initial registers:
  PC: 0x00001234       <- Current instruction
  LR: 0x00005679       <- Return address
  SP: 0x20003f00       <- Stack pointer
  R7 (FP): 0x20003f10  <- Frame pointer
  R11: 0x00000000

[getBacktrace] Frame 0: PC = 0x00001234
[getBacktrace] Frame 1: LR = 0x00005678
[getBacktrace] Read 512 bytes from stack at 0x20003f00
[getBacktrace] Frame 2: 0x00002345 (SP+8)
[getBacktrace] Frame 3: 0x00006789 (SP+20)
[getBacktrace] Stack unwinding complete: 4 frames found
```

## Common Patterns

### Deep Call Stack
```
#0: 0x00001234 <current>     <- Where we are now
#1: 0x00005678 <return>      <- Immediate caller
#2: 0x00002345 <frame_2>     <- Caller's caller
#3: 0x00006789 <frame_3>     <- ...
#4: 0x00001abc <frame_4>     <- ...
```

### Shallow Stack (Main)
```
#0: 0x00001234 <current>     <- Current function
#1: 0x00008001 <return>      <- main()
```

### Recursive Function
```
#0: 0x00001234 <current>     <- factorial(1)
#1: 0x00001240 <frame_1>     <- factorial(2)
#2: 0x00001240 <frame_2>     <- factorial(3)
#3: 0x00001240 <frame_3>     <- factorial(4)
#4: 0x00008001 <frame_4>     <- main()
```

## Exception Return Values (Excluded)

These values appear in LR during exceptions:

| Value | Meaning |
|-------|---------|
| `0xFFFFFFF1` | Return to Handler mode, MSP |
| `0xFFFFFFF9` | Return to Thread mode, MSP |
| `0xFFFFFFFD` | Return to Thread mode, PSP |
| `0xFFFFFFE1` | Return to Handler mode, MSP, FPU |
| `0xFFFFFFE9` | Return to Thread mode, MSP, FPU |
| `0xFFFFFFED` | Return to Thread mode, PSP, FPU |

These are **not** included in backtrace.

## Thumb Bit Encoding

ARM Cortex-M addresses always have bit 0 set:

```
Return address:     0x00001235 (odd)  <- Stored in LR, on stack
Instruction addr:   0x00001234 (even) <- Actual PC value
                               ^
                    Thumb bit (always 1)
```

Function returns with `BX LR` which:
1. Clears bit 0
2. Jumps to even address

## Troubleshooting

### No Frames Beyond PC/LR

**Problem:** Only 2 frames returned

**Causes:**
- Stack not initialized (early boot)
- SP invalid (outside SRAM)
- Stack corrupted
- Function is main() with no callers

**Solution:**
- Check SP value in debug output
- Verify target is running normal code (not bootloader)

### Too Many Invalid Frames

**Problem:** Frames with suspicious addresses

**Causes:**
- Stack contains random data
- Stack overflow
- Memory corruption

**Solution:**
- Check stack pointer alignment (should be 4-byte aligned)
- Verify stack hasn't overflowed into data section

### Missing Intermediate Frames

**Problem:** Gaps in call stack

**Causes:**
- Tail call optimization
- Inlined functions
- Corrupted stack section

**Solution:**
- Recompile with `-fno-inline -fno-optimize-sibling-calls`
- Use DWARF unwinding (future enhancement)

## Performance

| Operation | Time | GDB Commands |
|-----------|------|--------------|
| Register read | ~10ms | 1 (g command) |
| Memory read | ~50ms | 1 (m command) |
| **Total** | **~60ms** | **2** |

## Limitations

1. **No function names** - Only addresses returned (symbol lookup needed)
2. **No source location** - No file:line info (DWARF needed)
3. **No parameters** - Function arguments not shown
4. **No locals** - Local variables not shown
5. **Heuristic** - Not 100% accurate without DWARF
6. **Single core** - Only current core's stack

## GDB Commands Used

### Get Registers
```
TX: $g#67
RX: $<160 hex chars>#XX
```

### Read Stack
```
TX: $m20003f00,200#XX
RX: $<1024 hex chars>#XX
```

## Code Locations

| File | Lines | Description |
|------|-------|-------------|
| `GdbClient.ts` | 506-624 | Main `getBacktrace()` |
| `GdbClient.ts` | 638-674 | `isValidReturnAddress()` |
| `STACK_UNWINDING.md` | - | Full documentation |

## Related Functions

```typescript
// Get registers (used internally)
async getFormattedRegisters(): Promise<Map<string, number>>

// Read memory (used internally)
async readMemory(address: number, length: number): Promise<Uint8Array>

// Main backtrace function
async getBacktrace(): Promise<StackFrame[]>
```

## ARM Registers

```
R0-R3:    Arguments / scratch
R4-R11:   Callee-saved
R12:      IP (intra-procedure-call scratch)
R13 (SP): Stack pointer          <- Used for unwinding
R14 (LR): Link register          <- First return address
R15 (PC): Program counter        <- Current location
```

## Stack Growth

```
High Address
    ↑
    │  ┌─────────┐
    │  │  Older  │
    │  │  Frames │
    │  ├─────────┤
SP ──→ │  Current│
       │  Frame  │
       └─────────┘
           ↓
Low Address
```

Stack grows **downward** (toward lower addresses).

## Integration Example

```typescript
// In your debugger UI
async function updateBacktraceView() {
  const frames = await gdbClient.getBacktrace();

  const html = frames.map(f => `
    <div class="frame">
      <span class="level">#${f.level}</span>
      <span class="address">0x${f.address.toString(16).padStart(8, '0')}</span>
      <span class="function">${f.function || '??'}</span>
    </div>
  `).join('');

  document.getElementById('backtrace').innerHTML = html;
}
```

## Testing Checklist

- [ ] Test with simple function call (1-2 frames)
- [ ] Test with deep call stack (10+ frames)
- [ ] Test with recursive function
- [ ] Test with inlined functions
- [ ] Test with tail call optimization
- [ ] Test with invalid SP
- [ ] Test with corrupted stack
- [ ] Verify Thumb bit handling
- [ ] Verify exception return exclusion
- [ ] Check performance (<100ms)

## References

- Full documentation: `STACK_UNWINDING.md`
- Implementation: `GdbClient.ts:506-674`
- Tests: `GdbClient.test.ts:362-372`
