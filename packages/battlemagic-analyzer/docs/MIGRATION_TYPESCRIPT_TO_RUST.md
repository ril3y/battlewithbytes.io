# Migration Guide: TypeScript Chip Detection → Rust WASM

## Overview

This guide explains how to migrate from TypeScript-based chip detection in `TargetInfo.ts` to the new Rust-based chip database with WASM exports.

## Why Migrate?

### Problems with TypeScript Implementation

1. **String Fragility**: Pattern matching based on string contains/regex
2. **No Type Safety**: Easy to make typos in chip names
3. **Runtime Errors**: Mistakes only caught when specific chip tested
4. **Duplication**: Pattern logic duplicated across methods
5. **Hard to Extend**: Adding new chips requires understanding complex if-else chains

### Benefits of Rust Implementation

1. **Compile-Time Validation**: Errors caught at build time
2. **Type Safety**: Architecture enum prevents invalid values
3. **Maintainability**: Single const array database
4. **Performance**: Zero-cost abstractions, const evaluation
5. **Confidence Scoring**: Sophisticated fuzzy matching with quality metrics
6. **Testability**: Comprehensive test suite (22 tests)
7. **Community Friendly**: Easy to add new chips via PR

## Migration Steps

### Phase 1: Integrate WASM Module

#### 1.1 Build WASM

```bash
cd packages/battlemagic-analyzer
wasm-pack build --target web --out-dir ../../apps/web/public/wasm
```

#### 1.2 Load WASM in Application

```typescript
// apps/web/src/app/tools/battlemagic/lib/loadWasmAnalyzer.ts
import init, {
  detect_architecture_wasm,
  get_supported_chips_wasm,
  is_architecture_supported_wasm,
  ArmAnalyzer
} from '@/public/wasm/battlemagic_analyzer';

let wasmInitialized = false;

export async function initWasm() {
  if (!wasmInitialized) {
    await init();
    wasmInitialized = true;
  }
}

export {
  detect_architecture_wasm as detectArchitecture,
  get_supported_chips_wasm as getSupportedChips,
  is_architecture_supported_wasm as isArchitectureSupported,
  ArmAnalyzer
};
```

### Phase 2: Create TypeScript Wrapper

#### 2.1 Type Definitions

```typescript
// apps/web/src/app/tools/battlemagic/lib/chips/types.ts

export interface ArchitectureInfo {
  architecture: string;      // "ArmCortexM4"
  chipName: string;          // "STM32F4"
  manufacturer: string;      // "STMicroelectronics"
  supported: boolean;        // true if decoder available
  confidence: number;        // 0.0-1.0 match confidence
  architectureName: string;  // "ARM Cortex-M4"
  isaFamily: string;         // "ARM"
}

export enum ConfidenceLevel {
  PERFECT = 1.0,
  EXCELLENT = 0.95,
  GOOD = 0.85,
  FAIR = 0.70,
  WEAK = 0.50,
  NONE = 0.0
}
```

#### 2.2 Wrapper Functions

```typescript
// apps/web/src/app/tools/battlemagic/lib/chips/index.ts

import { initWasm, detectArchitecture as wasmDetect } from '../loadWasmAnalyzer';
import type { ArchitectureInfo, ConfidenceLevel } from './types';

/**
 * Detect chip architecture from target description
 *
 * Automatically initializes WASM if needed.
 *
 * @param targetDescription - Target string from GDB/BMP (e.g., "STM32F407VG")
 * @returns Architecture information with confidence score
 *
 * @example
 * ```ts
 * const info = await detectChipArchitecture("STM32F407VG");
 * if (info.supported && info.confidence > 0.9) {
 *   console.log(`Detected: ${info.architectureName}`);
 * }
 * ```
 */
export async function detectChipArchitecture(
  targetDescription: string
): Promise<ArchitectureInfo> {
  await initWasm();
  return wasmDetect(targetDescription);
}

/**
 * Get list of all supported chip families
 */
export async function getSupportedChipFamilies(): Promise<ArchitectureInfo[]> {
  await initWasm();
  const { get_supported_chips_wasm } = await import('../loadWasmAnalyzer');
  return get_supported_chips_wasm();
}

/**
 * Validate confidence level for UI feedback
 */
export function getConfidenceStatus(confidence: number): {
  level: 'success' | 'info' | 'warning' | 'error';
  message: string;
} {
  if (confidence >= 0.95) {
    return { level: 'success', message: 'Exact match' };
  } else if (confidence >= 0.85) {
    return { level: 'success', message: 'Good match' };
  } else if (confidence >= 0.70) {
    return { level: 'info', message: `Fair match (${(confidence * 100).toFixed(0)}%)` };
  } else if (confidence > 0) {
    return { level: 'warning', message: `Weak match (${(confidence * 100).toFixed(0)}%)` };
  } else {
    return { level: 'error', message: 'Unknown chip' };
  }
}
```

### Phase 3: Update TargetInfo.ts

#### 3.1 Modify parseChipInfo Method

**Before** (fragile string matching):
```typescript
private parseChipInfo(target: Target): ChipInfo {
  const desc = target.description;
  const info: ChipInfo = {
    id: '',
    description: desc
  };

  // STM32 family
  if (desc.includes('STM32')) {
    info.manufacturer = 'STMicroelectronics';
    info.core = this.detectCortexCore(desc);

    if (desc.match(/STM32F[0-4]/)) {
      info.family = 'STM32F' + desc.match(/STM32F([0-4])/)?.[1];
    }
    // ... many more lines ...
  }
  // ... many more if-else blocks ...

  return info;
}
```

**After** (simple Rust call):
```typescript
import { detectChipArchitecture } from '../chips';

private async parseChipInfo(target: Target): Promise<ChipInfo> {
  const desc = target.description;

  // Use Rust chip database
  const archInfo = await detectChipArchitecture(desc);

  const info: ChipInfo = {
    id: '',
    description: desc,
    manufacturer: archInfo.manufacturer,
    family: archInfo.chipName,
    core: archInfo.architectureName,
  };

  return info;
}
```

#### 3.2 Update getTargetInfo Method

Make it async to support WASM:

```typescript
async getTargetInfo(forceRefresh = false): Promise<TargetInformation> {
  // ... existing code ...

  if (scanResult && scanResult.targets.length > 0) {
    // Changed: now async
    info.chip = await this.parseChipInfo(scanResult.targets[0]);
    info.rawDescription = scanResult.targets[0].description;

    // NEW: Add confidence information
    const archInfo = await detectChipArchitecture(scanResult.targets[0].description);
    (info as any).architectureConfidence = archInfo.confidence;
    (info as any).architectureSupported = archInfo.supported;
  }

  // ... rest of method ...
}
```

#### 3.3 Remove detectCortexCore Method

This is now handled by Rust database:

```typescript
// DELETE THIS METHOD - no longer needed
private detectCortexCore(desc: string): string {
  if (desc.includes('Cortex-M0')) return 'Cortex-M0+';
  // ... etc
}
```

### Phase 4: Update UI Components

#### 4.1 TargetInfoPanel Component

**Add confidence display**:

```typescript
// apps/web/src/app/tools/battlemagic/components/TargetInfoPanel.tsx

import { getConfidenceStatus } from '../lib/chips';

export function TargetInfoPanel({ targetInfo }: Props) {
  const confidence = (targetInfo as any).architectureConfidence ?? 0;
  const status = getConfidenceStatus(confidence);

  return (
    <div>
      {/* Existing chip info */}
      <div>
        <strong>Chip:</strong> {targetInfo.chip?.description}
      </div>

      {/* NEW: Confidence indicator */}
      {confidence > 0 && (
        <div className={`confidence-${status.level}`}>
          <strong>Detection:</strong> {status.message}
          {confidence < 0.7 && (
            <span className="warning">
              Manual verification recommended
            </span>
          )}
        </div>
      )}

      {/* Existing manufacturer/core info */}
      <div>
        <strong>Manufacturer:</strong> {targetInfo.chip?.manufacturer}
      </div>
      <div>
        <strong>Core:</strong> {targetInfo.chip?.core}
      </div>

      {/* NEW: Support status */}
      {!(targetInfo as any).architectureSupported && (
        <div className="alert-warning">
          This architecture is not yet supported by BattleMagic analyzer.
          Disassembly features may be limited.
        </div>
      )}
    </div>
  );
}
```

#### 4.2 Add Supported Chips List

Create new component to show all supported chips:

```typescript
// apps/web/src/app/tools/battlemagic/components/SupportedChipsList.tsx

import { useEffect, useState } from 'react';
import { getSupportedChipFamilies } from '../lib/chips';
import type { ArchitectureInfo } from '../lib/chips/types';

export function SupportedChipsList() {
  const [chips, setChips] = useState<ArchitectureInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupportedChipFamilies()
      .then(setChips)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading chip database...</div>;

  // Group by manufacturer
  const byManufacturer = chips.reduce((acc, chip) => {
    if (!acc[chip.manufacturer]) acc[chip.manufacturer] = [];
    acc[chip.manufacturer].push(chip);
    return acc;
  }, {} as Record<string, ArchitectureInfo[]>);

  return (
    <div className="supported-chips">
      <h3>Supported Chip Families ({chips.length})</h3>
      {Object.entries(byManufacturer).map(([mfg, chipList]) => (
        <div key={mfg} className="manufacturer-group">
          <h4>{mfg}</h4>
          <ul>
            {chipList.map(chip => (
              <li key={chip.chipName}>
                <strong>{chip.chipName}</strong> - {chip.architectureName}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### Phase 5: Testing

#### 5.1 Unit Tests

```typescript
// apps/web/src/app/tools/battlemagic/lib/chips/__tests__/chips.test.ts

import { describe, it, expect, beforeAll } from 'vitest';
import { detectChipArchitecture, getSupportedChipFamilies } from '../index';

beforeAll(async () => {
  // Initialize WASM once for all tests
  const { initWasm } = await import('../../loadWasmAnalyzer');
  await initWasm();
});

describe('Chip Detection', () => {
  it('should detect STM32F4', async () => {
    const info = await detectChipArchitecture('STM32F407VG');
    expect(info.chipName).toBe('STM32F4');
    expect(info.manufacturer).toBe('STMicroelectronics');
    expect(info.architecture).toBe('ArmCortexM4');
    expect(info.supported).toBe(true);
    expect(info.confidence).toBeGreaterThan(0.9);
  });

  it('should detect nRF52', async () => {
    const info = await detectChipArchitecture('nRF52840');
    expect(info.chipName).toBe('nRF52840');
    expect(info.manufacturer).toBe('Nordic Semiconductor');
    expect(info.confidence).toBeGreaterThan(0.9);
  });

  it('should handle unknown chips', async () => {
    const info = await detectChipArchitecture('UnknownChip123');
    expect(info.architecture).toBe('Unknown');
    expect(info.confidence).toBe(0.0);
    expect(info.supported).toBe(false);
  });

  it('should be case-insensitive', async () => {
    const info = await detectChipArchitecture('stm32f407vg');
    expect(info.chipName).toBe('STM32F4');
    expect(info.confidence).toBeGreaterThan(0.8);
  });
});

describe('Supported Chips List', () => {
  it('should return all supported chips', async () => {
    const chips = await getSupportedChipFamilies();
    expect(chips.length).toBeGreaterThan(30);

    // All should be marked as supported
    chips.forEach(chip => {
      expect(chip.supported).toBe(true);
    });
  });

  it('should include STM32, Nordic, and NXP chips', async () => {
    const chips = await getSupportedChipFamilies();
    const manufacturers = [...new Set(chips.map(c => c.manufacturer))];

    expect(manufacturers).toContain('STMicroelectronics');
    expect(manufacturers).toContain('Nordic Semiconductor');
    expect(manufacturers).toContain('NXP');
  });
});
```

#### 5.2 Integration Tests

```typescript
// Test with real GDB connection
describe('GDB Integration', () => {
  it('should detect chip from real BMP scan', async () => {
    const gdb = new GdbClient();
    await gdb.connect('/dev/ttyACM0', 115200);

    const targetInfo = new TargetInfo(gdb);
    const info = await targetInfo.getTargetInfo();

    expect(info.chip).toBeDefined();
    expect(info.chip?.manufacturer).toBeDefined();

    if (info.chip) {
      const confidence = (info as any).architectureConfidence;
      expect(confidence).toBeGreaterThan(0.5);
    }

    await gdb.disconnect();
  });
});
```

### Phase 6: Cleanup

#### 6.1 Remove Old Code

Once migration is complete and tested:

1. **Delete methods**:
   - `parseChipInfo()` old implementation
   - `detectCortexCore()`
   - Any chip-specific parsing logic

2. **Update imports**:
   - Remove unused chip detection utilities
   - Add new chip module imports

3. **Update documentation**:
   - Update API docs to reflect async methods
   - Add examples of new chip detection

#### 6.2 Update Dependencies

Add to `package.json`:
```json
{
  "dependencies": {
    "@/public/wasm/battlemagic_analyzer": "file:../../public/wasm"
  }
}
```

### Phase 7: Performance Optimization

#### 7.1 WASM Lazy Loading

Only load WASM when needed:

```typescript
// Lazy load WASM module
let wasmModule: any = null;

export async function getWasmModule() {
  if (!wasmModule) {
    wasmModule = await import('@/public/wasm/battlemagic_analyzer');
    await wasmModule.default(); // init()
  }
  return wasmModule;
}

export async function detectArchitecture(desc: string) {
  const wasm = await getWasmModule();
  return wasm.detect_architecture_wasm(desc);
}
```

#### 7.2 Caching

Cache detection results:

```typescript
const detectionCache = new Map<string, ArchitectureInfo>();

export async function detectChipArchitectureCached(
  targetDescription: string
): Promise<ArchitectureInfo> {
  const cached = detectionCache.get(targetDescription);
  if (cached) return cached;

  const result = await detectChipArchitecture(targetDescription);
  detectionCache.set(targetDescription, result);
  return result;
}
```

## Rollback Plan

If issues arise:

1. **Keep old code temporarily**: Comment out instead of deleting
2. **Feature flag**: Use environment variable to toggle implementations
3. **Gradual rollout**: Test with subset of users first

```typescript
const USE_RUST_CHIPS = process.env.NEXT_PUBLIC_USE_RUST_CHIPS === 'true';

async function parseChipInfo(target: Target): Promise<ChipInfo> {
  if (USE_RUST_CHIPS) {
    return parseChipInfoRust(target);
  } else {
    return parseChipInfoTypeScript(target);
  }
}
```

## Common Issues

### WASM not loading

**Symptom**: `init is not a function` error

**Solution**: Check WASM file path and ensure `wasm-pack` build succeeded

```typescript
// Verify WASM file exists
import { existsSync } from 'fs';
const wasmPath = './public/wasm/battlemagic_analyzer_bg.wasm';
if (!existsSync(wasmPath)) {
  throw new Error('WASM file not found - run wasm-pack build');
}
```

### Async conversion errors

**Symptom**: TypeScript errors about `Promise<ChipInfo>` vs `ChipInfo`

**Solution**: Update all callers to use `await`:

```typescript
// Before
const chip = this.parseChipInfo(target);

// After
const chip = await this.parseChipInfo(target);
```

### Low confidence matches

**Symptom**: Chip detected but confidence < 0.7

**Solution**: Add more specific pattern to Rust database or handle in UI:

```typescript
if (info.confidence < 0.7) {
  // Show manual override option
  return (
    <ChipSelector
      detectedChip={info}
      onManualSelect={handleManualSelection}
    />
  );
}
```

## Verification Checklist

- [ ] WASM module builds successfully
- [ ] All chip detection tests pass
- [ ] UI shows confidence indicators
- [ ] Low confidence chips show warnings
- [ ] Unsupported architectures show appropriate messages
- [ ] No TypeScript compilation errors
- [ ] Bundle size hasn't increased significantly
- [ ] Performance is equal or better than TypeScript version
- [ ] Real BMP/GDB connections work correctly
- [ ] Documentation updated

## Timeline Estimate

- **Phase 1** (WASM Integration): 2-4 hours
- **Phase 2** (TypeScript Wrapper): 2-3 hours
- **Phase 3** (Update TargetInfo): 1-2 hours
- **Phase 4** (Update UI): 2-4 hours
- **Phase 5** (Testing): 4-8 hours
- **Phase 6** (Cleanup): 1-2 hours
- **Phase 7** (Optimization): 2-3 hours

**Total**: ~14-26 hours depending on team size and testing requirements

## Success Metrics

1. **Correctness**: 100% of previously detected chips still detected
2. **Confidence**: > 95% of detections have confidence > 0.8
3. **Performance**: Detection latency < 5ms
4. **Bundle Size**: WASM adds < 50KB to bundle
5. **Maintainability**: New chip addition takes < 5 minutes
6. **Test Coverage**: > 90% code coverage on chip detection

## Support

For questions or issues:
1. Check Rust test suite: `cargo test chips::`
2. Review CHIPS.md documentation
3. Open issue on GitHub with target description and expected result
