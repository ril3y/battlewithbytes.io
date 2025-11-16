# BattleMagic Analyzer - Quick Start Guide

Get started with the Rust WASM binary analyzer in 5 minutes.

## Prerequisites

```bash
# Install Rust (skip if already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install wasm-pack
cargo install wasm-pack
```

## 1. Build the WASM Module

```bash
cd packages/battlemagic-analyzer

# Windows
build.bat

# Unix/Mac
chmod +x build.sh
./build.sh
```

This creates the `pkg/` directory with your WASM module.

## 2. Test with Live Demo

```bash
# Start a local web server
python -m http.server 8000

# Open browser to:
# http://localhost:8000/example.html
```

Click "Analyze Sample Binary" to see the analyzer in action!

## 3. Install in Your Project

```bash
cd apps/web
npm install ../../packages/battlemagic-analyzer/pkg
```

## 4. Use in Your Code

```typescript
import init, { BinaryAnalyzer } from 'battlemagic-analyzer';

// Initialize WASM
await init();

// Create analyzer
const analyzer = new BinaryAnalyzer(0x8000);

// Prepare disassembly data
const instructions = [
  {
    address: 0x8000,
    bytes: [0x00, 0x48, 0x00, 0x47],
    mnemonic: 'bl',
    operands: '#0x8100'
  },
  // ... more instructions
];

// Analyze!
const results = analyzer.analyze_from_disasm(instructions);

console.log(`Found ${results.xrefs.length} cross-references`);
console.log(`Analysis took ${results.analysis_time_ms}ms`);

// Query xrefs to specific address
const xrefs = analyzer.get_xrefs_to(0x8100);
console.log(`Found ${xrefs.count} references to 0x8100`);
```

## 5. React Integration

```typescript
import { useBinaryAnalyzer } from './lib/hooks/useBinaryAnalyzer';

function MyComponent() {
  const { analyzer, isReady, analyzeFromDisasm } = useBinaryAnalyzer(0x8000);

  const handleAnalyze = () => {
    const instructions = getInstructions();
    const results = analyzeFromDisasm(instructions);
    console.log(results);
  };

  return (
    <button onClick={handleAnalyze} disabled={!isReady}>
      Analyze Binary
    </button>
  );
}
```

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [INTEGRATION.md](INTEGRATION.md) for detailed integration guide
- Review [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md) for technical details

## Troubleshooting

**Build fails?**
```bash
rustup target add wasm32-unknown-unknown
```

**Module won't load in browser?**
Make sure you're using `await init()` before creating the analyzer.

**Type errors in TypeScript?**
Check that you're importing from the correct path:
```typescript
import init, { BinaryAnalyzer } from 'battlemagic-analyzer';
```

## Performance

Expected performance on typical ARM binary:
- Analysis: 50-100ms for 128KB
- WASM size: 65KB (~25KB gzipped)
- Memory: ~2MB peak

## Support

For issues or questions:
- Check example.html for working demo
- Review README.md for detailed docs
- Run cargo test to verify installation
