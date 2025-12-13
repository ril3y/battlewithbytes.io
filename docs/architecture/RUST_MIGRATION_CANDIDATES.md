# TypeScript → Rust/WASM Migration Candidates

Analysis of performance-critical TypeScript code that should be migrated to Rust/WASM for better performance.

## High Priority (Should Migrate)

### 1. **GDB Protocol Parsing** (`lib/gdb/RspParser.ts` - 1193 lines)

**Current Implementation:** TypeScript string parsing
**Why Migrate:** Heavy hex string parsing, memory parsing, register decoding

**Operations:**
- Hex string → binary conversion (happens frequently)
- Register dump parsing (16+ registers × 8 hex chars each)
- Memory dump parsing (large hex strings)
- Stop reply packet parsing
- Checksum validation

**Performance Impact:** HIGH - Called on every GDB response

**Rust Benefits:**
- Zero-copy parsing
- SIMD-optimized hex decoding
- No GC pauses during parsing

**Migration Strategy:**
```rust
// Rust WASM module
pub fn parse_register_dump(hex: &str) -> RegisterSet { ... }
pub fn parse_memory_dump(hex: &str) -> Vec<u8> { ... }
pub fn parse_stop_reply(packet: &str) -> StopReply { ... }
```

---

### 2. **Binary Architecture Detection** (`lib/binary/BinaryParserFactory.ts` - 482 lines)

**Current Implementation:** JavaScript pattern matching on Uint8Array
**Why Migrate:** Scans thousands of bytes looking for instruction patterns

**Operations:**
- ARM pattern scoring (loops through 10,000 bytes)
- MIPS pattern scoring
- RISC-V pattern scoring
- ELF header parsing
- Vector table validation

**Performance Impact:** HIGH - Runs on every firmware file load

**Rust Benefits:**
- Parallel pattern matching
- Efficient byte slice operations
- SIMD pattern matching

**Already Partially in Rust:** ✅ (vector table detection)
**Remaining:** Architecture auto-detection, pattern scoring

---

### 3. **SWO (Serial Wire Output) Decoding** (`lib/swo/SwoDecoder.ts`)

**Current Implementation:** TypeScript bit manipulation
**Why Migrate:** Real-time stream processing of binary data

**Operations:**
- ITM packet decoding
- DWT packet decoding
- Timestamp synchronization
- Multi-byte packet assembly

**Performance Impact:** MEDIUM-HIGH - Real-time streaming

**Rust Benefits:**
- Zero-copy stream processing
- Efficient buffering
- Lower latency

---

### 4. **Binary Format Parsers** (`lib/binary/parsers/*.ts`)

**Current Implementation:** TypeScript classes
**Why Migrate:** Pattern matching on large binary files

**Files:**
- `ArmBinaryParser.ts` - ARM-specific binary parsing
- `MipsBinaryParser.ts` - MIPS pattern detection
- `RiscVBinaryParser.ts` - 751 lines of RISC-V patterns

**Performance Impact:** MEDIUM - Load time operation

**Rust Benefits:**
- Memory-mapped file access
- Parallel section parsing
- Zero-copy slicing

---

## Medium Priority (Should Consider)

### 5. **Control Flow Analysis** (`lib/cfg/`)

**Current:** TypeScript graph algorithms
**Files:**
- `BasicBlockAnalyzer.ts` - Basic block identification
- `ControlFlowAnalyzer.ts` - CFG construction

**Operations:**
- Graph traversal
- Dominator tree calculation
- Loop detection

**Performance Impact:** MEDIUM - Analysis time operation

**Note:** Already have some CFG analysis in Rust (`packages/battlemagic-analyzer/src/cfg/`)
**Action:** Move remaining TypeScript CFG code to Rust

---

### 6. **Disassembly Operations** (`lib/disasm/`)

**Current:** Mix of WASM (good!) and TypeScript
**Files:**
- `WasmDisassembler.ts` - ✅ Already uses Rust WASM
- `ArmDisassembler.ts` - ⚠️ TypeScript fallback (should remove?)
- `CapstoneDisassembler.ts` - ⚠️ JavaScript Capstone binding

**Action:**
- Remove TypeScript fallbacks if WASM is always available
- Ensure all disassembly goes through Rust

---

## Low Priority (Probably Keep in TypeScript)

### 7. **UI State Management**
- React hooks (must stay in TS)
- Component logic (must stay in TS)
- IndexedDB operations (async, fine in TS)

### 8. **GDB Client Communication**
- `GdbClient.ts` - Connection management, callbacks
- `SerialTransport.ts` - Web Serial API (browser-only)

**Reason:** Heavy integration with browser APIs, async/await, callbacks

---

## Migration Roadmap

### Phase 1: High-Impact Parsers (Immediate)
1. ✅ Disassembly (already done!)
2. ✅ Vector table detection (already done!)
3. ✅ Function analysis (already done!)
4. 🔲 **RSP Parser** → Move to Rust
5. 🔲 **Architecture detection** → Move to Rust

### Phase 2: Streaming/Real-time (Next)
6. 🔲 **SWO decoder** → Move to Rust
7. 🔲 **Binary parsers** → Move to Rust

### Phase 3: Analysis (Future)
8. 🔲 Complete CFG analysis migration
9. 🔲 Remove TypeScript disassembly fallbacks

---

## Performance Wins Expected

**Current Bottlenecks (from testing):**
- Firmware analysis: 5.5s (mostly in Rust ✅)
- GDB response parsing: ~10-50ms per response ⚠️
- Architecture detection: ~100-500ms ⚠️
- SWO decoding: Varies with data rate ⚠️

**Expected Improvements:**
- RSP parsing: **10x faster** (50ms → 5ms)
- Arch detection: **5-10x faster** (500ms → 50-100ms)
- SWO decoding: **2-3x faster** + lower latency

---

## Implementation Notes

### Rust Module Structure
```
packages/battlemagic-analyzer/src/
├── arch/arm/          # ✅ Already organized!
├── parsing/           # NEW: RSP/protocol parsing
│   ├── rsp.rs
│   ├── gdb_packets.rs
│   └── hex_decode.rs
├── binary/            # NEW: Binary format detection
│   ├── detector.rs
│   ├── patterns.rs
│   └── elf.rs
└── streaming/         # NEW: SWO decoding
    ├── swo.rs
    ├── itm.rs
    └── dwt.rs
```

### WASM Export Pattern
```rust
#[wasm_bindgen]
pub fn parse_gdb_registers(hex: &str) -> JsValue {
    let regs = rsp::parse_register_dump(hex);
    serde_wasm_bindgen::to_value(&regs).unwrap()
}
```

### TypeScript Integration
```typescript
import { parse_gdb_registers } from '../lib/battlemagic_analyzer';

// Before (slow):
const regs = RegisterParser.parseGPacket(hex);

// After (fast):
const regs = parse_gdb_registers(hex);
```

---

## Metrics to Track

After migration, measure:
- [ ] GDB response parsing time (per response)
- [ ] Firmware load time (total)
- [ ] Architecture detection time
- [ ] Memory usage during analysis
- [ ] SWO decode latency (real-time streaming)

---

## Conclusion

**Top 3 Migrations for Maximum Impact:**
1. 🔥 **RspParser.ts** → Rust (high frequency operation)
2. 🔥 **BinaryParserFactory.ts** → Rust (user-facing load time)
3. 🔥 **SwoDecoder.ts** → Rust (real-time performance)

**Estimated Total Performance Gain:** 30-50% reduction in analysis/parsing time
**Estimated Implementation Time:** 2-3 weeks for all three
