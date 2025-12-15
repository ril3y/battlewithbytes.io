# BattleMagic Binary Analyzer (WASM)

High-performance Rust-based binary analysis module that builds comprehensive cross-reference (xref) databases for ARM binaries. Compiled to WebAssembly for seamless integration with the BattleMagic web debugger.

## Features

### Core Analysis

- **Complete Xref Database**: Analyzes entire binary to build cross-reference database
- **Fast Analysis**: Processes 128KB binaries in < 100ms
- **Cross-Reference Types**:
  - Function calls (bl, blx)
  - Unconditional branches (b)
  - Conditional branches (b.eq, b.ne, etc.)
  - Data references (ldr, str with PC-relative addressing)
- **Bidirectional Lookup**: Find xrefs TO and FROM any address
- **Zero-copy Design**: Efficient memory usage with indexed lookups
- **TypeScript Support**: Auto-generated type definitions

### New in v2.0: Advanced Analysis

#### 1. Argument Analysis

Automatically detects and tracks function arguments at call sites:

- Tracks values passed in registers (r0-r3 for ARM AAPCS)
- Analyzes stack arguments for functions with > 4 parameters
- Supports immediate values, PC-relative loads, register copies
- Handles complex operations (movw/movt pairs, arithmetic)
- Provides structured annotations for each function call

#### 2. Vector Table Detection

Parses ARM Cortex-M vector tables to identify interrupt handlers:

- Validates all vector table entries (Initial SP, Reset, exceptions, IRQs)
- Checks Thumb bit and address bounds for each handler
- Auto-creates symbols for valid interrupt handlers
- Supports up to 256 vectors (covers all standard MCUs)
- Exports handler names and addresses for UI integration

#### 3. Control Flow Graph Analysis

Advanced CFG analysis with loop detection:

- Builds complete control flow graphs for functions
- Detects natural loops using dominator analysis
- Identifies loop headers and back edges
- Tracks loop body addresses for visualization
- Optimized dominator tree computation

#### 4. Function Analysis

Enhanced function detection and metadata:

- Detects function boundaries from call xrefs
- Tracks caller/callee relationships
- Calculates function complexity metrics
- Detects stack frame operations
- Identifies local variables on stack

#### 5. Database Persistence

IDA Pro-style database for persistent analysis:

- Schema versioning with automatic migrations
- Stores functions, comments, xrefs, symbols
- Supports multiple comment types (standard, repeatable, anterior, block)
- Export/import to JSON for portability
- Efficient serialization for browser storage

## Prerequisites

Install Rust and wasm-pack:

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install wasm-pack
cargo install wasm-pack
```

## Building

### Development Build

Fast compilation for testing:

```bash
cd packages/battlemagic-analyzer
wasm-pack build --dev --target web
```

### Production Build

Optimized for size and performance:

```bash
cd packages/battlemagic-analyzer
wasm-pack build --release --target web
```

This generates the `pkg/` directory with:

- `battlemagic_analyzer_bg.wasm` - Compiled WebAssembly module
- `battlemagic_analyzer.js` - JavaScript bindings
- `battlemagic_analyzer.d.ts` - TypeScript type definitions
- `package.json` - NPM package metadata

### Build Profiles

The project includes two optimized build profiles:

**Release Profile** (Cargo.toml):

- Size optimization (`opt-level = "z"`)
- Link-time optimization (LTO)
- Symbol stripping
- Panic unwinding removed
- Target binary size: ~20-30KB

**Dev Profile**:

- Fast compilation
- No optimizations
- Useful for development/testing

## Usage

### JavaScript/TypeScript Integration

```typescript
import init, { BinaryAnalyzer } from "./pkg/battlemagic_analyzer.js";

// Initialize WASM module
await init();

// Create analyzer with base address
const analyzer = new BinaryAnalyzer(0x8000);

// Prepare disassembly data from Capstone
const disasmData = [
  {
    address: 0x8000,
    bytes: [0x00, 0x48, 0x00, 0x47],
    mnemonic: "bl",
    operands: "#0x8100",
  },
  {
    address: 0x8004,
    bytes: [0x01, 0x20],
    mnemonic: "b.eq",
    operands: "#0x8200",
  },
  // ... more instructions
];

// Analyze entire binary
const results = analyzer.analyze_from_disasm(disasmData);

console.log(`Analysis complete in ${results.analysis_time_ms}ms`);
console.log(`Found ${results.xrefs.length} cross-references`);
console.log(`Analyzed ${results.total_instructions} instructions`);
console.log(`${results.unique_targets} unique target addresses`);

// Query xrefs to specific address
const xrefsTo = analyzer.get_xrefs_to(0x8100);
xrefsTo.xrefs.forEach((xref) => {
  console.log(
    `0x${xref.from_addr.toString(16)}: ${xref.instruction} -> 0x${xref.to_addr.toString(16)}`,
  );
});

// Query xrefs from specific address
const xrefsFrom = analyzer.get_xrefs_from(0x8000);
xrefsFrom.xrefs.forEach((xref) => {
  console.log(
    `${xref.instruction}: 0x${xref.from_addr.toString(16)} -> 0x${xref.to_addr.toString(16)}`,
  );
});

// Check analysis status
console.log(`Analyzer ready: ${analyzer.is_analyzed()}`);
console.log(`Total xrefs: ${analyzer.xref_count()}`);

// Reset for new analysis
analyzer.reset();
```

### NEW: Direct Byte Analysis (Eliminates Capstone Dependency)

```typescript
import init, { ArmAnalyzer } from './pkg/battlemagic_analyzer.js';

await init();

// Create analyzer
const analyzer = new ArmAnalyzer(0x08000000);

// Analyze firmware directly from bytes (no Capstone needed!)
const firmwareBytes = new Uint8Array([...]);
const results = analyzer.analyze_from_bytes(firmwareBytes);

console.log(`Found ${results.xrefs.length} cross-references`);
console.log(`Detected ${results.functions.length} functions`);
console.log(`Vector table has ${results.vector_table.length} entries`);

// Get argument annotations for function calls
results.functions.forEach(func => {
  if (func.arg_annotations && func.arg_annotations.length > 0) {
    console.log(`Function ${func.name} has ${func.arg_annotations.length} annotated calls`);
    func.arg_annotations.forEach(ann => {
      console.log(`  Call at 0x${ann.call_address.toString(16)}:`);
      ann.args.forEach(([argNum, value]) => {
        console.log(`    arg${argNum}: ${value}`);
      });
    });
  }
});

// Get vector table
const vectorTable = analyzer.get_vector_table();
vectorTable.forEach(entry => {
  if (entry.is_valid && entry.vector_number > 0) {
    console.log(`Vector ${entry.vector_number}: ${entry.handler_name} @ 0x${entry.handler_address.toString(16)}`);
  }
});
```

### Progress Callbacks for Long Analysis

```typescript
const analyzer = new ArmAnalyzer(0x08000000);

const results = analyzer.analyze_from_bytes_with_progress(
  firmwareBytes,
  (stage, progress) => {
    console.log(`${stage}: ${progress}%`);
    // Update UI progress bar
    updateProgressBar(progress);
  },
);

// Progress updates:
// "Decoding instructions: 0.0%"
// "Building xref database: 25.0%"
// "Analyzing functions: 50.0%"
// "Detecting loops: 75.0%"
// "Analysis complete: 100.0%"
```

### Database Operations

```typescript
// Export complete analysis database
const json = analyzer.export_database();
localStorage.setItem("analysis", json);

// Import previously saved database
const savedJson = localStorage.getItem("analysis");
analyzer.import_database(savedJson);

// Get database statistics
const stats = analyzer.get_database_stats();
console.log(`Database contains:`);
console.log(`  - ${stats.xref_count} cross-references`);
console.log(`  - ${stats.function_count} functions`);
console.log(`  - ${stats.comment_count} comments`);
console.log(`  - ${stats.vector_table_size} vector entries`);
```

### Comment Management

```typescript
// Add comments to specific addresses
analyzer.add_comment(0x08000100, "Initialize UART peripheral", "standard");
analyzer.add_comment(0x08002000, "Main application loop", "block");
analyzer.add_comment(0x08003000, "Calculate CRC32 checksum", "repeatable");

// Get comment at address
const comment = analyzer.get_comment(0x08000100);
console.log(comment.text); // "Initialize UART peripheral"

// Delete comment
analyzer.delete_comment(0x08000100);
```

### Type Definitions

The module exports TypeScript-compatible types:

```typescript
interface CrossReference {
  from_addr: number;
  to_addr: number;
  xref_type: "Call" | "Branch" | "ConditionalBranch" | "DataRead" | "DataWrite";
  instruction: string;
  operands: string;
}

interface AnalysisResults {
  xrefs: CrossReference[];
  total_instructions: number;
  analysis_time_ms: number;
  unique_targets: number;
  start_address: number;
  end_address: number;
}

interface XrefQueryResult {
  address: number;
  xrefs: CrossReference[];
  count: number;
}
```

## Integration with BattleMagic

### 1. Install in your project

```bash
cd apps/web
npm install ../../packages/battlemagic-analyzer/pkg
```

Or add to package.json:

```json
{
  "dependencies": {
    "battlemagic-analyzer": "file:../../packages/battlemagic-analyzer/pkg"
  }
}
```

### 2. Create analyzer hook

Create `apps/web/src/app/tools/battlemagic/lib/hooks/useBinaryAnalyzer.ts`:

```typescript
import { useEffect, useState } from "react";
import init, { BinaryAnalyzer } from "battlemagic-analyzer";

export function useBinaryAnalyzer(baseAddress: number = 0x8000) {
  const [analyzer, setAnalyzer] = useState<BinaryAnalyzer | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    init().then(() => {
      const instance = new BinaryAnalyzer(baseAddress);
      setAnalyzer(instance);
      setIsReady(true);
    });
  }, [baseAddress]);

  return { analyzer, isReady };
}
```

### 3. Use in components

```typescript
import { useBinaryAnalyzer } from '../lib/hooks/useBinaryAnalyzer';

function DisassemblyView() {
  const { analyzer, isReady } = useBinaryAnalyzer(0x8000);
  const [xrefs, setXrefs] = useState([]);

  const analyzeFullBinary = async () => {
    if (!analyzer || !isReady) return;

    // Get disassembly from Capstone (existing code)
    const disasmData = await getFullDisassembly();

    // Analyze with Rust WASM
    const results = analyzer.analyze_from_disasm(disasmData);

    console.log(`Analysis: ${results.xrefs.length} xrefs in ${results.analysis_time_ms}ms`);
  };

  const showXrefsTo = (address: number) => {
    if (!analyzer || !isReady) return;

    const result = analyzer.get_xrefs_to(address);
    setXrefs(result.xrefs);
  };

  return (
    <div>
      <button onClick={analyzeFullBinary}>Analyze Binary</button>
      {/* Render xrefs */}
    </div>
  );
}
```

## Performance Benchmarks

Expected performance on 128KB ARM Cortex-M binary:

### Analysis Speed (128KB firmware)

- **Instruction Decoding**: 20-30ms
- **Xref Database Build**: 30-50ms
- **Function Analysis**: 10-20ms
- **Argument Analysis**: 5-10ms
- **Vector Table Detection**: < 1ms
- **CFG + Loop Detection**: 15-25ms
- **Total Analysis Time**: 80-135ms

### Memory Usage

- **WASM Module Size**: ~35KB (gzipped: ~12KB)
- **Peak Memory Usage**: ~3MB
- **Per-Xref Overhead**: ~80 bytes
- **Per-Function Overhead**: ~200 bytes
- **Per-Annotation Overhead**: ~40 bytes

### Typical Results (128KB firmware)

- **Instructions Decoded**: 20,000-30,000
- **Cross-References**: 1,500-5,000
- **Functions Detected**: 100-500
- **Argument Annotations**: 200-1,000
- **Vector Table Entries**: 16-64 (standard Cortex-M)
- **Loops Detected**: 50-200

### Performance Optimizations

- Zero-copy instruction parsing
- Indexed xref lookups (O(1) average case)
- Lazy CFG computation (only when needed)
- Efficient dominator tree algorithm
- Minimal allocations in hot paths

## Architecture

```
┌─────────────────────────────────────────┐
│  JavaScript/TypeScript (BattleMagic)    │
│  - UI Components                        │
│  - Capstone Disassembly                 │
└────────────┬────────────────────────────┘
             │ wasm-bindgen
             ▼
┌─────────────────────────────────────────┐
│  Rust WASM Module                       │
│  ┌───────────────────────────────────┐  │
│  │ BinaryAnalyzer                    │  │
│  │ - Public WASM API                 │  │
│  └──────────┬────────────────────────┘  │
│             │                            │
│  ┌──────────▼────────────────────────┐  │
│  │ XrefBuilder                       │  │
│  │ - Parse instructions              │  │
│  │ - Build xref database             │  │
│  │ - Index for fast lookups          │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │ Types & Data Structures           │  │
│  │ - CrossReference                  │  │
│  │ - AnalysisResults                 │  │
│  │ - Serde serialization             │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Data Flow

1. **Disassembly**: JavaScript uses existing Capstone WASM to disassemble binary
2. **Transfer**: Pass instruction array to Rust via wasm-bindgen
3. **Analysis**: Rust parses instructions and builds xref database
4. **Indexing**: Build hash maps for O(1) lookup by address
5. **Return**: Serialize results back to JavaScript
6. **Query**: Fast xref lookups using indexed database

## Testing

Run Rust tests:

```bash
cargo test
```

Run WASM tests in browser:

```bash
wasm-pack test --headless --firefox
```

## Debugging

Enable console error messages by adding to Cargo.toml:

```toml
[dependencies]
console_error_panic_hook = "0.1"
```

Then rebuild with:

```bash
wasm-pack build --release --target web -- --features console_error_panic_hook
```

## Size Optimization Tips

Current optimizations applied:

- Link-time optimization (LTO)
- Size-focused optimization (`opt-level = "z"`)
- Symbol stripping
- Panic unwinding removed

Further optimizations:

- Use `wasm-opt` from binaryen toolkit:
  ```bash
  wasm-opt -Oz -o pkg/battlemagic_analyzer_bg_opt.wasm pkg/battlemagic_analyzer_bg.wasm
  ```

## Troubleshooting

### Build fails with "wasm32-unknown-unknown not installed"

```bash
rustup target add wasm32-unknown-unknown
```

### Module not loading in browser

Check that you're using `--target web` and initializing with `await init()`.

### Type errors in TypeScript

Regenerate type definitions:

```bash
wasm-pack build --release --target web
```

Import from the generated `.d.ts` file.

## Future Enhancements

- [ ] Function boundary detection
- [ ] String reference extraction
- [ ] Control flow graph generation
- [ ] Call graph analysis
- [ ] Data flow tracking
- [ ] Symbol resolution
- [ ] ARM64 support
- [ ] Thumb mode detection

## License

MIT

## Author

ril3y
