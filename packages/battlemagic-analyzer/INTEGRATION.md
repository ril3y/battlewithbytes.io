# BattleMagic Integration Guide

Step-by-step guide to integrate the Rust WASM analyzer into BattleMagic.

## 1. Build the WASM Module

```bash
cd packages/battlemagic-analyzer
./build.bat  # or ./build.sh on Unix
```

This generates the `pkg/` directory with all necessary files.

## 2. Install in BattleMagic Web App

From the `apps/web` directory:

```bash
npm install ../../packages/battlemagic-analyzer/pkg
```

Or add to `apps/web/package.json`:

```json
{
  "dependencies": {
    "battlemagic-analyzer": "file:../../packages/battlemagic-analyzer/pkg"
  }
}
```

Then run `npm install`.

## 3. Create React Hook

Create `apps/web/src/app/tools/battlemagic/lib/hooks/useBinaryAnalyzer.ts`:

```typescript
import { useEffect, useState, useCallback } from 'react';
import init, { BinaryAnalyzer, XrefType } from 'battlemagic-analyzer';
import type {
  DisassembledInstruction,
  AnalysisResults,
  XrefQueryResult
} from 'battlemagic-analyzer/types';

export interface BinaryAnalyzerState {
  analyzer: BinaryAnalyzer | null;
  isReady: boolean;
  isAnalyzing: boolean;
  error: string | null;
}

export function useBinaryAnalyzer(baseAddress: number = 0x8000) {
  const [state, setState] = useState<BinaryAnalyzerState>({
    analyzer: null,
    isReady: false,
    isAnalyzing: false,
    error: null,
  });

  // Initialize WASM module
  useEffect(() => {
    let mounted = true;

    init()
      .then(() => {
        if (!mounted) return;
        const instance = new BinaryAnalyzer(baseAddress);
        setState({
          analyzer: instance,
          isReady: true,
          isAnalyzing: false,
          error: null,
        });
      })
      .catch((err) => {
        if (!mounted) return;
        setState({
          analyzer: null,
          isReady: false,
          isAnalyzing: false,
          error: err.message,
        });
      });

    return () => {
      mounted = false;
    };
  }, [baseAddress]);

  const analyzeFromDisasm = useCallback(
    (instructions: DisassembledInstruction[]): AnalysisResults | null => {
      if (!state.analyzer || !state.isReady) {
        console.error('Analyzer not ready');
        return null;
      }

      setState(prev => ({ ...prev, isAnalyzing: true }));

      try {
        const results = state.analyzer.analyze_from_disasm(instructions);
        setState(prev => ({ ...prev, isAnalyzing: false }));
        return results;
      } catch (err: any) {
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: err.message
        }));
        return null;
      }
    },
    [state.analyzer, state.isReady]
  );

  const getXrefsTo = useCallback(
    (address: number): XrefQueryResult | null => {
      if (!state.analyzer || !state.isReady) return null;
      try {
        return state.analyzer.get_xrefs_to(address);
      } catch (err: any) {
        console.error('Failed to get xrefs:', err);
        return null;
      }
    },
    [state.analyzer, state.isReady]
  );

  const getXrefsFrom = useCallback(
    (address: number): XrefQueryResult | null => {
      if (!state.analyzer || !state.isReady) return null;
      try {
        return state.analyzer.get_xrefs_from(address);
      } catch (err: any) {
        console.error('Failed to get xrefs:', err);
        return null;
      }
    },
    [state.analyzer, state.isReady]
  );

  const reset = useCallback(() => {
    if (state.analyzer) {
      state.analyzer.reset();
    }
  }, [state.analyzer]);

  return {
    ...state,
    analyzeFromDisasm,
    getXrefsTo,
    getXrefsFrom,
    reset,
    XrefType, // Export enum for use in components
  };
}
```

## 4. Update DisassemblyView Component

Modify `apps/web/src/app/tools/battlemagic/components/DisassemblyView/DisassemblyView.tsx`:

```typescript
import { useBinaryAnalyzer } from '../../lib/hooks/useBinaryAnalyzer';
import { useEffect, useState } from 'react';

export function DisassemblyView() {
  const {
    analyzer,
    isReady,
    analyzeFromDisasm,
    getXrefsTo,
    XrefType
  } = useBinaryAnalyzer(0x8000);

  const [analysisResults, setAnalysisResults] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [xrefsToSelected, setXrefsToSelected] = useState([]);

  // Analyze full binary when ready
  useEffect(() => {
    if (!isReady || !analyzer) return;

    // Get all disassembled instructions from your existing Capstone integration
    const instructions = getAllDisassembledInstructions();

    const results = analyzeFromDisasm(instructions);
    if (results) {
      setAnalysisResults(results);
      console.log(`Analysis complete:`, results);
      console.log(`Found ${results.xrefs.length} xrefs in ${results.analysis_time_ms}ms`);
      console.log(`${results.unique_targets} unique targets`);
    }
  }, [isReady, analyzer]);

  // Update xrefs when address is selected
  useEffect(() => {
    if (selectedAddress === null || !isReady) return;

    const xrefs = getXrefsTo(selectedAddress);
    if (xrefs) {
      setXrefsToSelected(xrefs.xrefs);
    }
  }, [selectedAddress, isReady, getXrefsTo]);

  const handleAddressClick = (address: number) => {
    setSelectedAddress(address);
  };

  return (
    <div>
      {/* Your existing disassembly view */}

      {/* Xref panel */}
      {selectedAddress && (
        <div className="xref-panel">
          <h3>Cross-references to 0x{selectedAddress.toString(16)}</h3>
          <div>
            {xrefsToSelected.length === 0 ? (
              <p>No cross-references found</p>
            ) : (
              <ul>
                {xrefsToSelected.map((xref, idx) => (
                  <li key={idx}>
                    <span className={`xref-type xref-${xref.xref_type.toLowerCase()}`}>
                      {xref.xref_type}
                    </span>
                    {' '}
                    0x{xref.from_addr.toString(16)}: {xref.instruction} {xref.operands}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Analysis stats */}
      {analysisResults && (
        <div className="analysis-stats">
          <span>Total xrefs: {analysisResults.xrefs.length}</span>
          <span>Analysis time: {analysisResults.analysis_time_ms}ms</span>
          <span>Unique targets: {analysisResults.unique_targets}</span>
        </div>
      )}
    </div>
  );
}
```

## 5. Helper Function to Convert Capstone Output

Create `apps/web/src/app/tools/battlemagic/lib/utils/capstoneAdapter.ts`:

```typescript
import type { DisassembledInstruction } from 'battlemagic-analyzer/types';

/**
 * Convert Capstone disassembly output to format expected by Rust analyzer
 */
export function convertCapstoneToAnalyzerFormat(
  capstoneInstructions: any[]
): DisassembledInstruction[] {
  return capstoneInstructions.map(instr => ({
    address: instr.address,
    bytes: Array.from(instr.bytes),
    mnemonic: instr.mnemonic,
    operands: instr.op_str || '',
  }));
}
```

## 6. Full Integration Example

```typescript
import { useEffect } from 'react';
import { useBinaryAnalyzer } from './lib/hooks/useBinaryAnalyzer';
import { useCapstone } from './lib/hooks/useCapstone'; // Your existing Capstone hook
import { convertCapstoneToAnalyzerFormat } from './lib/utils/capstoneAdapter';

export function BattleMagicDebugger() {
  const { disassemble } = useCapstone();
  const { analyzer, isReady, analyzeFromDisasm, getXrefsTo, getXrefsFrom } = useBinaryAnalyzer(0x8000);

  const analyzeFullBinary = async () => {
    if (!isReady) {
      console.log('Analyzer not ready yet');
      return;
    }

    // 1. Get memory from GDB (your existing code)
    const memory = await getMemoryRange(0x8000, 0x10000);

    // 2. Disassemble with Capstone
    const capstoneResults = disassemble(memory, 0x8000);

    // 3. Convert to analyzer format
    const instructions = convertCapstoneToAnalyzerFormat(capstoneResults);

    // 4. Analyze with Rust WASM
    const results = analyzeFromDisasm(instructions);

    if (results) {
      console.log(`Analysis complete!`);
      console.log(`  Instructions: ${results.total_instructions}`);
      console.log(`  Cross-references: ${results.xrefs.length}`);
      console.log(`  Unique targets: ${results.unique_targets}`);
      console.log(`  Time: ${results.analysis_time_ms}ms`);

      // Show xrefs for specific function
      const mainFunctionXrefs = getXrefsTo(0x8000);
      console.log(`Main function has ${mainFunctionXrefs?.count} callers`);
    }
  };

  return (
    <div>
      <button onClick={analyzeFullBinary} disabled={!isReady}>
        Analyze Binary
      </button>
    </div>
  );
}
```

## 7. Styling Cross-references

Add to your CSS/Tailwind:

```css
.xref-type {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.xref-call {
  background-color: #3b82f6;
  color: white;
}

.xref-branch {
  background-color: #8b5cf6;
  color: white;
}

.xref-conditionalbranch {
  background-color: #a855f7;
  color: white;
}

.xref-dataread {
  background-color: #10b981;
  color: white;
}

.xref-datawrite {
  background-color: #ef4444;
  color: white;
}
```

## 8. Performance Optimization

For large binaries, consider analyzing incrementally:

```typescript
// Analyze in chunks to avoid blocking UI
async function analyzeIncrementally(
  memory: Uint8Array,
  baseAddr: number,
  chunkSize: number = 4096
) {
  const chunks = [];
  for (let i = 0; i < memory.length; i += chunkSize) {
    const chunk = memory.slice(i, i + chunkSize);
    const addr = baseAddr + i;

    // Disassemble chunk
    const instructions = disassemble(chunk, addr);
    chunks.push(...instructions);
  }

  // Analyze all at once
  const results = analyzeFromDisasm(chunks);
  return results;
}
```

## 9. Testing

Create a test file to verify integration:

```typescript
// apps/web/src/app/tools/battlemagic/lib/hooks/__tests__/useBinaryAnalyzer.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useBinaryAnalyzer } from '../useBinaryAnalyzer';

describe('useBinaryAnalyzer', () => {
  it('should initialize analyzer', async () => {
    const { result } = renderHook(() => useBinaryAnalyzer(0x8000));

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
      expect(result.current.analyzer).not.toBeNull();
    });
  });

  it('should analyze instructions', async () => {
    const { result } = renderHook(() => useBinaryAnalyzer(0x8000));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    const instructions = [
      { address: 0x8000, bytes: [0, 0, 0, 0], mnemonic: 'bl', operands: '#0x8100' },
      { address: 0x8004, bytes: [0, 0, 0, 0], mnemonic: 'b.eq', operands: '#0x8200' },
    ];

    const results = result.current.analyzeFromDisasm(instructions);

    expect(results).not.toBeNull();
    expect(results!.xrefs.length).toBe(2);
    expect(results!.total_instructions).toBe(2);
  });
});
```

## 10. Debugging

If you encounter issues:

1. **Check WASM loading**:
   ```typescript
   init().then(() => console.log('WASM loaded successfully'));
   ```

2. **Enable console errors** (rebuild with feature):
   ```bash
   wasm-pack build --release --target web -- --features console_errors
   ```

3. **Verify data format**:
   ```typescript
   console.log('Input format:', instructions[0]);
   // Should match: { address: number, bytes: number[], mnemonic: string, operands: string }
   ```

4. **Check browser compatibility**:
   - Requires WebAssembly support
   - Bulk memory operations enabled (modern browsers)

## Next Steps

- Add xref visualization in UI
- Integrate with control flow graph
- Add function boundary detection
- Cache analysis results
- Add export/import functionality

## Support

For issues or questions:
- Check the main README.md
- Review examples in this guide
- Test with the provided test cases
