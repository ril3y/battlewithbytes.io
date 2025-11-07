# GDB RSP Parser - Quick Reference Card

## Import

```typescript
import {
  RegisterParser,
  MemoryParser,
  StopReplyParser,
  BreakpointParser,
  MonitorParser,
  ErrorParser,
  RspParser
} from './lib/gdb/RspParser';
```

## Pattern

All parsers return `ParseResult<T>`:

```typescript
const result = Parser.parseMethod(response);

if (result.success) {
  // result.data is strongly typed
  console.log(result.data.field);
} else {
  // result.error contains error message
  // result.raw contains original input
  console.error(result.error);
}
```

---

## Register Parser

### Parse All Registers (g command response)

```typescript
const result = RegisterParser.parseArmCortexM(hexResponse);

if (result.success) {
  const pc = result.data.pc;        // Program counter
  const sp = result.data.sp;        // Stack pointer
  const lr = result.data.lr;        // Link register
  const r0 = result.data.r0;        // General registers
  const xpsr = result.data.xpsr;    // Status (optional)
}
```

### Parse Single Register (p command response)

```typescript
const result = RegisterParser.parseSingleRegister(hexResponse, regNum);

if (result.success) {
  console.log(`Register ${result.data.regNum}: 0x${result.data.value.toString(16)}`);
}
```

### Convert to Little-Endian Hex

```typescript
const hexValue = RegisterParser.toHex(0x08008000);  // "00800008"
```

### Get Register Name

```typescript
const name = RegisterParser.getRegisterName(15);  // "pc"
```

---

## Memory Parser

### Parse Memory Read (m command response)

```typescript
const result = MemoryParser.parseMemoryRead(hexResponse, address, length);

if (result.success) {
  const bytes = result.data.data;           // Uint8Array
  const text = new TextDecoder().decode(bytes);  // ASCII decode
  const word = MemoryParser.readWord(bytes, 0);  // 32-bit word
}
```

### Parse Memory Write (M command response)

```typescript
const result = MemoryParser.parseMemoryWrite(response, address, length);

if (result.success && result.data.success) {
  console.log('Write succeeded');
}
```

### Convert Bytes to Hex

```typescript
const hexString = MemoryParser.toHex(byteArray);
```

### Read Multi-Byte Values

```typescript
const word = MemoryParser.readWord(data, offset);      // 32-bit
const half = MemoryParser.readHalfword(data, offset);  // 16-bit
```

---

## Stop Reply Parser

### Parse Any Stop Reply (auto-detect T or S)

```typescript
const result = StopReplyParser.parse(packet);

if (result.success) {
  console.log(`Signal: ${result.data.signal}`);
  console.log(`Reason: ${result.data.reason}`);

  // Check if detailed (T packet)
  if ('rawInfo' in result.data) {
    const stop = result.data as StopReplyDetailed;

    if (stop.thread) console.log(`Thread: ${stop.thread}`);
    if (stop.watchAddr) console.log(`Watch: 0x${stop.watchAddr.toString(16)}`);

    if (stop.registers) {
      const pc = stop.registers.get(15);  // PC from stop packet
    }
  }
}
```

### Parse T Packet (detailed)

```typescript
const result = StopReplyParser.parseDetailed(packet);
```

### Parse S Packet (simple)

```typescript
const result = StopReplyParser.parseSimple(packet);
```

### Get Signal Name

```typescript
const name = StopReplyParser.getSignalName(5);  // "SIGTRAP"
```

---

## Breakpoint Parser

### Parse Insert Response

```typescript
const result = BreakpointParser.parseInsert(response, address, type);

if (result.success) {
  console.log(`Breakpoint set at 0x${result.address.toString(16)}`);
} else {
  console.error(result.error);
}
```

### Parse Remove Response

```typescript
const result = BreakpointParser.parseRemove(response, address, type);
```

### Get Type Name

```typescript
const name = BreakpointParser.getTypeName(0);  // "Software Breakpoint"
```

---

## Monitor Parser

### Parse Monitor Output (O packet)

```typescript
const result = MonitorParser.parse(packet);

if (result.success) {
  console.log(result.data.output);  // Decoded ASCII text
}
```

### Encode Monitor Command

```typescript
const hexCmd = MonitorParser.encodeCommand('version');
const packet = `qRcmd,${hexCmd}`;
```

---

## Error Parser

### Parse Error Response (E packet)

```typescript
const result = ErrorParser.parse(packet);

if (result.success) {
  console.log(`Error code: 0x${result.data.code}`);
  console.log(`Message: ${result.data.message}`);
}
```

---

## RspParser (Auto-Detection)

### Parse Any Response

```typescript
const parsed = RspParser.parse(response);

switch (parsed.type) {
  case 'ok':
    console.log('Success');
    break;

  case 'error':
    console.error(parsed.data.message);
    break;

  case 'data':
    console.log('Data:', parsed.data);
    break;

  case 'stop':
    console.log('Stopped:', parsed.data.reason);
    break;

  case 'monitor':
    console.log('Output:', parsed.data.output);
    break;

  case 'empty':
    console.log('No response');
    break;
}
```

### Check Success/Error

```typescript
if (RspParser.isSuccess(response)) {
  // Process success
}

if (RspParser.isError(response)) {
  // Handle error
}
```

---

## Common Patterns

### Read PC

```typescript
const regResponse = await gdbClient.readRegisters();
const result = RegisterParser.parseArmCortexM(regResponse);
if (result.success) {
  const pc = result.data.pc;
}
```

### Read Memory as String

```typescript
const memResponse = await gdbClient.readMemory(address, length);
const result = MemoryParser.parseMemoryRead(memResponse, address, length);
if (result.success) {
  const text = new TextDecoder().decode(result.data.data);
}
```

### Read 32-bit Value

```typescript
const memResponse = await gdbClient.readMemory(address, 4);
const result = MemoryParser.parseMemoryRead(memResponse, address, 4);
if (result.success) {
  const value = MemoryParser.readWord(result.data.data, 0);
}
```

### Handle Breakpoint Hit

```typescript
const result = StopReplyParser.parse(stopPacket);
if (result.success && result.data.reason === StopReason.BREAKPOINT) {
  console.log('Breakpoint hit!');

  if ('registers' in result.data && result.data.registers) {
    const pc = result.data.registers.get(15);
    console.log(`PC: 0x${pc?.toString(16)}`);
  }
}
```

---

## Types Reference

### ParseResult<T>

```typescript
type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; raw?: string };
```

### ArmCortexMRegisters

```typescript
interface ArmCortexMRegisters {
  r0-r12: number;
  sp: number;    // r13
  lr: number;    // r14
  pc: number;    // r15
  xpsr?: number;
  msp?: number;
  psp?: number;
  // ... more special registers
}
```

### StopReason

```typescript
enum StopReason {
  BREAKPOINT = 'breakpoint',
  WATCHPOINT = 'watchpoint',
  SINGLE_STEP = 'single-step',
  SIGNAL = 'signal',
  EXITED = 'exited',
  TERMINATED = 'terminated',
  UNKNOWN = 'unknown'
}
```

---

## Error Handling Best Practices

### Always Check Success

```typescript
// ✓ Correct
const result = Parser.parse(response);
if (!result.success) {
  console.error(result.error);
  return;
}
const data = result.data;

// ✗ Wrong (unsafe)
const data = Parser.parse(response).data;  // May crash!
```

### Log Raw Data on Errors

```typescript
if (!result.success) {
  console.error(`Parse error: ${result.error}`);
  console.error(`Raw response: ${result.raw}`);
  // Helps debug protocol issues
}
```

### Graceful Degradation

```typescript
const result = RegisterParser.parseArmCortexM(response);
if (!result.success) {
  // Fallback to safe defaults
  return {
    pc: 0,
    sp: 0,
    lr: 0
  };
}
return result.data;
```

---

## Performance Tips

1. **Reuse parsers** - They're stateless, no need to create instances
2. **Cache register values** - Parse once, use many times
3. **Validate before parsing** - Check response type first
4. **Use typed objects** - Avoid converting to Maps unless needed

---

## Testing

```typescript
import { RegisterParser } from './RspParser';

describe('My GDB operations', () => {
  it('should parse registers', () => {
    const mockResponse = '00000000'.repeat(16);
    const result = RegisterParser.parseArmCortexM(mockResponse);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pc).toBe(0);
    }
  });
});
```

---

## Documentation

- **Full Examples:** `RspParser.examples.md`
- **Protocol Spec:** `RSP_PROTOCOL_SPEC.md`
- **Implementation:** `RspParser.ts` (inline comments)
- **Tests:** `RspParser.test.ts`

---

**Quick tip:** Use TypeScript's autocomplete! Type `result.data.` and let your IDE show you available fields.
