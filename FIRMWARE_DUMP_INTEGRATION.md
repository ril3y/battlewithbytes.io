# Firmware Dump & Analysis Integration Architecture

## Overview

Integration of two independent subsystems into a unified workflow:

1. **GDB UART Firmware Dumper** - Dumps firmware from target via Black Magic Probe
2. **WASM Binary Analyzer** - Analyzes dumped firmware for cross-references, functions, CFG

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     BattleMagic UI (React)                           │
│  ┌──────────────────────┐        ┌──────────────────────────────┐  │
│  │  FirmwareDumpWorkflow │───────▶│  Analysis Display Components │  │
│  │  Component            │        │  (XRefPanel, CFG, etc.)      │  │
│  └───────────┬───────────┘        └──────────────────────────────┘  │
│              │                                                        │
└──────────────┼────────────────────────────────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
┌───────▼──────┐  ┌──▼──────────┐
│ GDB Subsystem │  │ WASM Analyzer│
│  (TypeScript) │  │  (Rust WASM) │
└───────┬───────┘  └──┬───────────┘
        │             │
        │             │
┌───────▼──────┐  ┌──▼───────────┐
│ Web Serial   │  │ JavaScript API│
│ (GDB RSP)    │  │ (serde-wasm) │
└──────────────┘  └──────────────┘
        │
┌───────▼──────┐
│ Black Magic  │
│ Probe (BMP)  │
└──────────────┘
```

## Workflow Stages

### Stage 1: Firmware Dump (GDB Subsystem)

```typescript
// Entry point: FirmwareDumpWorkflow.tsx
async function handleDumpFirmware() {
  // 1. Connect to BMP via Web Serial
  const port = await gdbClient.requestPort();
  await gdbClient.connect(port, { baudRate: 115200 });

  // 2. Scan for targets (SWD)
  const { targets, voltage } = await gdbClient.scanSwd();

  // 3. Attach to target
  await gdbClient.attach(targets[0].id);
  await gdbClient.halt();

  // 4. Dump firmware memory
  const FLASH_BASE = 0x0;
  const DUMP_SIZE = 0x10000; // 64KB
  const CHUNK_SIZE = 256;

  const firmware: Uint8Array[] = [];
  for (let offset = 0; offset < DUMP_SIZE; offset += CHUNK_SIZE) {
    const chunk = await gdbClient.readMemory(FLASH_BASE + offset, CHUNK_SIZE);
    firmware.push(chunk);
  }

  // 5. Parse ARM Cortex-M vector table
  const vectorTable = parseVectorTable(firmwareData);

  return {
    data: firmwareData,
    baseAddress: FLASH_BASE,
    vectorTable,
    architecture: 'ARM Thumb'
  };
}
```

**Dependencies:**
- `GdbClient.ts` - Protocol orchestration
- `RspProtocol.ts` - Packet encoding/decoding
- `BlackMagicCommands.ts` - Command builders
- `SerialTransport.ts` - Web Serial wrapper

**Output:** `FirmwareDump` object with `Uint8Array` data

---

### Stage 2: Disassembly (Bridge Layer)

```typescript
// Option A: Use Capstone.js (current approach)
import Capstone from 'capstone.js';

async function disassembleFirmware(dump: FirmwareDump) {
  const cs = await Capstone.Capstone.initialize(
    Capstone.ARCH_ARM,
    Capstone.MODE_THUMB
  );

  const instructions = cs.disasm(
    dump.data,
    dump.baseAddress
  );

  return instructions.map(inst => ({
    address: inst.address,
    mnemonic: inst.mnemonic,
    operands: inst.op_str,
    bytes: Array.from(inst.bytes)
  }));
}

// Option B: Future - Rust WASM decoder
// (Add to battlemagic-analyzer crate)
```

**Output:** Array of `Instruction` objects

---

### Stage 3: Analysis (WASM Subsystem)

```typescript
// Load WASM analyzer
import { loadWasmAnalyzer } from './lib/loadWasmAnalyzer';

async function analyzeFirmware(instructions: Instruction[]) {
  // 1. Load WASM module
  const wasm = await loadWasmAnalyzer();

  // 2. Create analyzer instance
  const analyzer = wasm.ArmAnalyzer.new(baseAddress);

  // 3. Analyze instructions
  const results = analyzer.analyze_from_disasm(instructions);

  return {
    xrefs: results.xrefs,              // Cross-references
    functions: results.functions,       // Detected functions
    cfg: results.control_flow_graph,   // CFG (future)
    complexity: results.complexity      // Cyclomatic complexity
  };
}
```

**Dependencies:**
- `battlemagic-analyzer` WASM module (Rust)
- `loadWasmAnalyzer.ts` - WASM loader utility

**Output:** Analysis results object

---

### Stage 4: Visualization (React UI)

```typescript
// Display analysis results
function AnalysisDisplay({ results, firmware }) {
  return (
    <>
      {/* Disassembly view with xrefs */}
      <DisassemblyView
        instructions={results.instructions}
        xrefs={results.xrefs}
        baseAddress={firmware.baseAddress}
      />

      {/* Cross-reference panel */}
      <XrefPanel xrefs={results.xrefs} />

      {/* Control flow graph (future) */}
      <ControlFlowGraphView cfg={results.cfg} />

      {/* Function list */}
      <FunctionList functions={results.functions} />
    </>
  );
}
```

---

## Data Flow

```
[User Action: "Dump Firmware"]
         ↓
[GdbClient.scanSwd()]          → Find targets
         ↓
[GdbClient.attach()]           → Attach to nRF52
         ↓
[GdbClient.halt()]             → Stop execution
         ↓
[GdbClient.readMemory()] x16   → Read 64KB in 256-byte chunks
         ↓
[parseVectorTable()]           → Extract ARM vectors
         ↓
         Uint8Array (firmware data)
         ↓
[Capstone.js disassemble()]    → ARM Thumb disassembly
         ↓
         Instruction[] (JSON)
         ↓
[WASM: ArmAnalyzer.analyze()]  → Cross-reference extraction
         ↓
         AnalysisResults (xrefs, functions)
         ↓
[React: Display components]    → UI visualization
```

---

## Implementation Checklist

### Phase 1: Basic Dump (✓ Complete)
- [x] Create `FirmwareDumpWorkflow.tsx` component
- [x] Implement firmware dump logic using `GdbClient`
- [x] Parse ARM Cortex-M vector table
- [x] Add download .bin functionality
- [x] Progress tracking UI

### Phase 2: WASM Integration (In Progress)
- [ ] Load `battlemagic-analyzer` WASM module
- [ ] Integrate Capstone.js for disassembly
- [ ] Pass disassembly to WASM analyzer
- [ ] Handle WASM analysis results
- [ ] Display cross-references in UI

### Phase 3: Visualization (Planned)
- [ ] Create enhanced `DisassemblyView` with xrefs
- [ ] Update `XrefPanel` for analysis results
- [ ] Add function detection visualization
- [ ] Implement CFG viewer (future)

### Phase 4: Advanced Features (Future)
- [ ] Support multiple architectures (MIPS, x86, RISC-V)
- [ ] Add ELF/Hex file loading
- [ ] Implement raw binary decoder in Rust
- [ ] Add symbol table support
- [ ] Export analysis results (JSON/CSV)

---

## File Structure

```
apps/web/src/app/tools/battlemagic/
├── components/
│   ├── FirmwareDumpWorkflow.tsx  ← Main orchestration component
│   ├── DisassemblyView/          ← Display disassembly + xrefs
│   ├── XrefPanel.tsx             ← Cross-reference viewer
│   └── ControlFlowGraphView/     ← CFG visualization (future)
├── lib/
│   ├── gdb/                      ← GDB subsystem (existing)
│   │   ├── GdbClient.ts
│   │   ├── RspProtocol.ts
│   │   ├── BlackMagicCommands.ts
│   │   └── SerialTransport.ts
│   ├── loadWasmAnalyzer.ts       ← WASM loader
│   └── disasm/
│       └── CapstoneWrapper.ts    ← Capstone.js wrapper
└── page.tsx                      ← Add workflow to UI

packages/battlemagic-analyzer/    ← WASM analyzer subsystem
├── src/
│   ├── lib.rs                    ← WASM API (@wasm_bindgen)
│   ├── analyzer.rs               ← Generic analyzer
│   ├── arch/
│   │   ├── arm/                  ← ARM-specific
│   │   └── mips/                 ← MIPS skeleton
│   └── xref.rs                   ← Cross-reference DB
└── Cargo.toml
```

---

## API Contracts

### FirmwareDump Interface

```typescript
interface FirmwareDump {
  data: Uint8Array;           // Raw firmware bytes
  baseAddress: number;        // Flash base (0x0)
  size: number;               // Total bytes dumped
  vectorTable: VectorTable;   // ARM vectors
  architecture: string;       // "ARM Thumb"
  chipInfo?: {
    name: string;             // "nRF52 M4"
    voltage: number | null;   // 3.0V
  };
}

interface VectorTable {
  initialSP: number;          // 0x20000400
  resetVector: number;        // 0x8E9
  resetAddress: number;       // 0x8E8 (Thumb bit cleared)
}
```

### Instruction Interface (Bridge)

```typescript
interface Instruction {
  address: number;            // 0x8E8
  mnemonic: string;           // "push"
  operands: string;           // "{r4, r5, r6, lr}"
  bytes: number[];            // [0xF0, 0xB5, ...]
}
```

### Analysis Results Interface

```typescript
interface AnalysisResults {
  xrefs: CrossReference[];
  functions?: Function[];     // Future
  cfg?: ControlFlowGraph;     // Future
  complexity?: number;        // Future
}

interface CrossReference {
  from_addr: number;
  to_addr: number;
  xref_type: 'Call' | 'Jump' | 'ConditionalBranch' | 'DataRef';
  instruction: string;
  operands: string;
}
```

---

## Error Handling

### Dump Stage Errors

| Error | Cause | Recovery |
|-------|-------|----------|
| Port selection cancelled | User cancelled | Prompt retry |
| No targets found | Bad SWD connection | Check wiring, retry |
| Attach failed | Target locked/protected | Check debug settings |
| Memory read error (0xFF) | Read protection enabled | Disable RDP |
| Invalid vector table | Erased flash | Flash firmware first |

### Analysis Stage Errors

| Error | Cause | Recovery |
|-------|-------|----------|
| WASM load failed | Network/path issue | Retry with fallback |
| Disassembly error | Invalid architecture | Verify ARM Thumb mode |
| Analysis timeout | Large firmware | Increase timeout |

---

## Performance Considerations

### Dump Performance
- **Duration**: ~3-5 seconds for 64KB @ 115200 baud
- **Chunk size**: 256 bytes (reliable with BMP)
- **Memory**: ~65KB peak for 64KB dump

### Analysis Performance
- **Disassembly**: ~50ms for 10K instructions (Capstone.js)
- **WASM analysis**: ~2.5ms for 10K instructions
- **Total**: <100ms for typical firmware

### Memory Usage
- **Firmware data**: 64KB-512KB typical
- **Disassembly**: ~2.5KB per 1K instructions
- **WASM analyzer**: ~500KB for 10K instructions
- **Total**: <2MB for typical workflow

---

## Testing Strategy

### Unit Tests
```typescript
describe('FirmwareDumpWorkflow', () => {
  it('should parse valid ARM vector table', () => {
    const data = new Uint8Array([...]);
    const vt = parseVectorTable(data);
    expect(vt.initialSP).toBe(0x20000400);
  });

  it('should validate vector table', () => {
    expect(isValidVectorTable(vt)).toBe(true);
  });
});
```

### Integration Tests
```typescript
describe('End-to-end workflow', () => {
  it('should dump and analyze firmware', async () => {
    // Mock GdbClient
    const firmware = await dumpFirmware();
    const instructions = await disassemble(firmware);
    const results = await analyze(instructions);

    expect(results.xrefs.length).toBeGreaterThan(0);
  });
});
```

---

## Future Enhancements

### Short-term
1. Add Capstone.js integration
2. Complete WASM analyzer integration
3. Enhance visualization components

### Medium-term
4. Add ELF file support
5. Implement raw binary decoder in Rust
6. Add symbol table parsing
7. Support multiple architectures

### Long-term
8. Advanced CFG visualization
9. Function recovery algorithms
10. Automated vulnerability detection
11. Binary diffing support

---

## References

- Node.js test: `packages/battlemagic-analyzer/test-firmware-dump.mjs`
- GDB protocol docs: [GDB Remote Serial Protocol](https://sourceware.org/gdb/current/onlinedocs/gdb.html/Remote-Protocol.html)
- ARM Cortex-M: [ARM Architecture Reference Manual](https://developer.arm.com/documentation/)
- WASM analyzer: `packages/battlemagic-analyzer/src/lib.rs`
