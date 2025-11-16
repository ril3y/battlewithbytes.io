# BattleMagic Binary Analyzer (WASM)

High-performance Rust-based binary analysis module that builds comprehensive cross-reference (xref) databases for ARM binaries. Compiled to WebAssembly for seamless integration with the BattleMagic web debugger.

## Features

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
import init, { BinaryAnalyzer } from './pkg/battlemagic_analyzer.js';

// Initialize WASM module
await init();

// Create analyzer with base address
const analyzer = new BinaryAnalyzer(0x8000);

// Prepare disassembly data from Capstone
const disasmData = [
  {
    address: 0x8000,
    bytes: [0x00, 0x48, 0x00, 0x47],
    mnemonic: 'bl',
    operands: '#0x8100'
  },
  {
    address: 0x8004,
    bytes: [0x01, 0x20],
    mnemonic: 'b.eq',
    operands: '#0x8200'
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
xrefsTo.xrefs.forEach(xref => {
  console.log(`0x${xref.from_addr.toString(16)}: ${xref.instruction} -> 0x${xref.to_addr.toString(16)}`);
});

// Query xrefs from specific address
const xrefsFrom = analyzer.get_xrefs_from(0x8000);
xrefsFrom.xrefs.forEach(xref => {
  console.log(`${xref.instruction}: 0x${xref.from_addr.toString(16)} -> 0x${xref.to_addr.toString(16)}`);
});

// Check analysis status
console.log(`Analyzer ready: ${analyzer.is_analyzed()}`);
console.log(`Total xrefs: ${analyzer.xref_count()}`);

// Reset for new analysis
analyzer.reset();
```

### Type Definitions

The module exports TypeScript-compatible types:

```typescript
interface CrossReference {
  from_addr: number;
  to_addr: number;
  xref_type: 'Call' | 'Branch' | 'ConditionalBranch' | 'DataRead' | 'DataWrite';
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
import { useEffect, useState } from 'react';
import init, { BinaryAnalyzer } from 'battlemagic-analyzer';

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

Expected performance on 128KB ARM binary:

- **Analysis Time**: 50-100ms
- **WASM Size**: ~25KB (gzipped: ~10KB)
- **Memory Usage**: ~2MB peak
- **Xrefs Found**: 1000-5000 (depending on code density)

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
