# JSON Protocol Support - Design Document

## Problem Statement
Current GDB RSP protocol requires manual string parsing which is error-prone and hard to maintain.

## Solution Options

### Option 1: Full GDB/MI with JSON (NOT RECOMMENDED)
**Architecture:**
```
Browser ←WebSocket→ Python/Node GDB Server ←Serial→ Black Magic Probe
                          ↓
                    GDB/MI JSON Parser
```

**Pros:**
- Industry standard
- Rich structured data
- Well-documented

**Cons:**
- ❌ Requires local server installation
- ❌ Loses browser-only capability
- ❌ BMP doesn't natively support GDB/MI
- ❌ Deployment complexity

**Verdict:** Too complex for a browser-based tool

---

### Option 2: Enhanced RSP with Typed Parsers (RECOMMENDED)
Keep RSP protocol but add structured TypeScript interfaces and better parsers.

**Architecture:**
```
Browser ←WebSerial→ Black Magic Probe (RSP)
          ↓
    Typed RSP Parser (TypeScript)
          ↓
    Structured Objects (Like JSON)
```

**Example Implementation:**

```typescript
// Instead of this (current):
const response = await sendCommand('g'); // Returns: "00000000..."
const regs = parseHexString(response);

// Do this (proposed):
interface RegisterSet {
  r0: number;
  r1: number;
  // ... all registers
  pc: number;
  sp: number;
  lr: number;
}

const registers: RegisterSet = await gdb.getRegisters();
// Returns structured object, RSP parsing is internal
```

**Benefits:**
- ✅ Keep browser-only architecture
- ✅ Type-safe responses
- ✅ Easier to use API
- ✅ Internal parsing complexity hidden
- ✅ No deployment changes needed

**Implementation Plan:**

1. **Create Response Type Definitions:**
```typescript
// src/app/tools/battlemagic/lib/gdb/ResponseTypes.ts

export interface MemoryReadResponse {
  address: number;
  data: Uint8Array;
  success: boolean;
}

export interface StopReplyResponse {
  signal: number;
  reason: 'breakpoint' | 'watchpoint' | 'signal' | 'step';
  threadId?: number;
  registers?: Map<string, number>;
  address?: number;
}

export interface BacktraceResponse {
  frames: StackFrame[];
  depth: number;
}

export interface BreakpointResponse {
  id: number;
  address: number;
  type: 'software' | 'hardware';
  enabled: boolean;
}
```

2. **Enhanced Command Methods:**
```typescript
class GdbClient {
  // Current (string-based):
  async sendCommand(cmd: string): Promise<string>

  // Proposed (typed):
  async readMemory(addr: number, len: number): Promise<MemoryReadResponse>
  async getBacktrace(): Promise<BacktraceResponse>
  async setBreakpoint(addr: number): Promise<BreakpointResponse>
}
```

3. **Internal Parser Layer:**
```typescript
// src/app/tools/battlemagic/lib/gdb/parsers/

export class StopReplyParser {
  static parse(rspResponse: string): StopReplyResponse {
    // Handle: T05thread:01;
    // Handle: S05
    // Handle: T0Athread:01;0e:0000;0d:1234;

    const result: StopReplyResponse = {
      signal: 0,
      reason: 'signal'
    };

    // Parsing logic here...

    return result;
  }
}
```

---

### Option 3: Hybrid Approach (FUTURE CONSIDERATION)
For advanced users who want GDB/MI features:

**Dual Mode Support:**
- **Direct Mode** (default): Browser ←WebSerial→ BMP
- **Server Mode** (optional): Browser ←WebSocket→ GDB Server ←Serial→ BMP

```typescript
const gdb = new GdbClient({
  mode: 'direct', // or 'server'
  serverUrl: 'ws://localhost:2345' // only for server mode
});
```

**Benefits:**
- Defaults to simple browser-only mode
- Power users can optionally run server for GDB/MI features
- Gradual migration path

---

## Recommendation

**Implement Option 2: Enhanced RSP with Typed Parsers**

### Phase 1: Core Infrastructure (1-2 weeks)
1. Create `ResponseTypes.ts` with all typed interfaces
2. Create `parsers/` directory with dedicated parser classes
3. Refactor existing parsers into new system
4. Add comprehensive unit tests

### Phase 2: API Modernization (1 week)
1. Add typed methods to `GdbClient`
2. Deprecate raw `sendCommand()` for most operations
3. Update all UI components to use typed APIs
4. Documentation updates

### Phase 3: Enhanced Features (ongoing)
1. Better error handling with typed errors
2. Command batching for efficiency
3. Response caching where appropriate
4. Performance optimizations

### Why This Is Better Than Full GDB/MI

| Feature | GDB/MI + Server | Enhanced RSP (Typed) |
|---------|----------------|----------------------|
| Browser-only | ❌ No | ✅ Yes |
| Easy deployment | ❌ Complex | ✅ Simple |
| Type safety | ✅ Yes | ✅ Yes |
| Structured data | ✅ Yes | ✅ Yes |
| Industry standard | ✅ Yes | ⚠️ Custom |
| BMP compatibility | ⚠️ Needs proxy | ✅ Native |
| Maintenance | ⚠️ Server + Client | ✅ Client only |

---

## Example: Before vs After

### Before (Current):
```typescript
const response = await gdbClient.sendCommand('qRcmd,73776473636e');
// Response: "OK" or "E01" or "Scanning..."
// Manual parsing, error-prone
```

### After (Proposed):
```typescript
const result = await gdbClient.scanForTargets();
// result: {
//   targets: [{ id: 1, type: 'STM32', ... }],
//   voltage: 3.3,
//   success: true
// }
```

Much cleaner, type-safe, and maintainable!
