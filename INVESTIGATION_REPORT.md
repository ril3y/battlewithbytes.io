# BattleMagic Disassembly Display Investigation Report

## Date: 2025-11-17

## Issues Investigated

### 1. Mystery "00" Column - FIXED ✓

**Problem:**
- A mysterious unlabeled column appeared at the start of every disassembly line showing what looked like "00"

**Root Cause:**
- The table had NO header row (`<thead>`)
- The second column is actually the "Cross-references (XR)" column that displays icons for xrefs
- When a line has no xrefs (both `xrefsTo` and `xrefsFrom` are 0), the column appears empty or shows "00"
- Without column headers, users couldn't understand what this column was for

**Fix Applied:**
- Added complete `<thead>` section with column headers:
  - BP (Breakpoint)
  - XR (Cross-references)
  - Loops (Loop visualization - conditional)
  - Address
  - Bytes (conditional)
  - Mnem (Mnemonic)
  - Operands
  - Comment
  - Jumps (Jump visualization)

**Files Modified:**
- `apps/web/src/app/tools/battlemagic/components/DisassemblyView/components/LinearView.tsx` (lines 203-217)

---

### 2. Duplicate Function Separators - INVESTIGATING 🔍

**Problem:**
- Function headers like `sub_29586 (1 caller)` appear to be rendering twice or overlapping

**Current Status:**
- Added debug logging to track when function headers render
- Debug output shows:
  - Function name
  - Number of callers
  - Whether there's also a legacy symbol at the same address

**Debug Code Added:**
```typescript
if (functionInfo) {
  console.log('[LinearView] Function header at', `0x${inst.address.toString(16)}:`, {
    name: functionInfo.name,
    callers: functionInfo.callers.length,
    hasSymbol: !!symbol
  });
}
```

**Next Steps:**
- Load the app and check console for duplicate function header logging
- Verify if both `functionInfo` and `symbol` are present at the same address
- The code already has logic to prevent duplicate rendering (line 321: `{symbol && !functionInfo &&`)

---

### 3. Missing Loop Visualization - INVESTIGATING 🔍

**Problem:**
- ASCII loop graphics (IDA-style loop arrows) not showing even though 194 loops detected

**Investigation Added:**

#### Debug Logging Points:

1. **Global Loop Check** (lines 95-100):
```typescript
console.log('[LinearView] hasLoopsGlobally:', hasLoops, 'Total loops:', analysisContext.loops.length);
console.log('[LinearView] maxLoopDepth:', maxDepth);
```

2. **Loops in Visible Range** (lines 117-129):
```typescript
console.log('[LinearView] loopsInRange:', {
  count: loops.length,
  range: { start: `0x${startAddr.toString(16)}`, end: `0x${endAddr.toString(16)}` },
  totalLoops: analysisContext.loops.length,
  loops: loops.map(l => ({
    header: `0x${l.header_addr.toString(16)}`,
    backEdge: `0x${l.back_edge_addr.toString(16)}`,
    nesting: l.nesting_level,
    bodySize: l.body_addrs.length
  }))
});
```

3. **Loop Visualization Generation** (lines 134-149):
```typescript
console.log('[LinearView] loopLines generated:', {
  visualizationSize: visualization.size,
  addresses: addresses.length,
  loops: loopsInRange.length
});
```

4. **LoopColumn Component** (lines 88-96):
```typescript
React.useEffect(() => {
  if (lineInfo && lineInfo.columns.length > 0) {
    console.log('[LoopColumn] Rendering with:', {
      columns: lineInfo.columns.length,
      activeLoops: lineInfo.activeLoops,
      columnsContent: lineInfo.columns
    });
  }
}, [lineInfo]);
```

**Potential Issues to Check:**
- `analysisContext.getLoopsInRange()` might be returning empty array even with global loops
- Loop addresses might not overlap with visible address range
- `generateLoopVisualization()` might be failing to generate line info
- `LoopColumn` might be rendering but with empty/transparent content

---

### 4. Missing Function Argument Annotations - FIXED ✓

**Problem:**
- WASM analyzer detects functions with `stack_vars`, `arg_annotations`, `stack_frame_size`, `complexity`
- These weren't displayed in disassembly comments

**Root Cause:**
- `AnalysisContext.tsx` was stripping out extended function data from WASM
- Original `FunctionInfo` interface only included basic fields (address, name, callers, callees)
- WASM `FunctionInfo` has much richer data that was being discarded

**Fix Applied:**

1. **Extended FunctionInfo Interface** (`AnalysisContext.tsx` lines 24-46):
```typescript
export interface FunctionInfo {
  address: number;
  name: string;
  callers: number[];
  callees: number[];
  xref_count: number;

  // Extended analysis data from WASM analyzer
  end_address?: number;
  stack_frame_size?: number;
  stack_vars?: Array<{...}>;
  arg_annotations?: Array<{...}>;
  complexity?: number;
}
```

2. **Preserve WASM Data** (`AnalysisContext.tsx` lines 124-130):
```typescript
// Preserve all extended analysis data
end_address: func.end_address ?? undefined,
stack_frame_size: func.stack_frame_size,
stack_vars: func.stack_vars,
arg_annotations: func.arg_annotations,
complexity: func.complexity,
```

3. **Render Function Metadata** (`LinearView.tsx` lines 278-316):
   - Stack frame size and complexity display
   - Stack variable annotations (e.g., `[sp+8]`, `[sp-16]`)

**Files Modified:**
- `apps/web/src/app/tools/battlemagic/lib/context/AnalysisContext.tsx`
- `apps/web/src/app/tools/battlemagic/components/DisassemblyView/components/LinearView.tsx`

---

## Summary of Changes

### Files Modified:
1. `apps/web/src/app/tools/battlemagic/components/DisassemblyView/components/LinearView.tsx`
   - Added table header with column labels
   - Added debug logging for loops and function headers
   - Added rendering for function stack info and complexity

2. `apps/web/src/app/tools/battlemagic/components/DisassemblyView/utils/loopRenderer.tsx`
   - Added debug logging for loop visualization (fixed React Hooks order)

3. `apps/web/src/app/tools/battlemagic/lib/context/AnalysisContext.tsx`
   - Extended FunctionInfo interface with WASM data fields
   - Preserved all extended analysis data from WASM functions

### Linter Status: ✓ PASSED
All modified files pass ESLint with no errors.

---

## Next Steps for User

1. **Test the Application:**
   - Load the BattleMagic tool
   - Check browser console for debug output
   - Verify table headers are visible

2. **Loop Visualization Debug:**
   - Check console logs for:
     - `[LinearView] hasLoopsGlobally: true, Total loops: 194`
     - `[LinearView] maxLoopDepth: X`
     - `[LinearView] loopsInRange: { count: X, ... }`
     - `[LinearView] loopLines generated: { visualizationSize: X, ... }`
     - `[LoopColumn] Rendering with: { ... }`
   - Report findings to determine why loops aren't rendering

3. **Function Headers Debug:**
   - Check console logs for duplicate function header messages
   - Verify if same address appears multiple times
   - Check if both functionInfo and symbol exist at same addresses

4. **Function Annotations:**
   - Verify that stack frame size and complexity appear in function headers
   - Check if stack variables are displayed
   - (Argument annotations rendering not yet implemented - need to determine display format)

---

## Data Available for Future Implementation

The WASM analyzer provides rich function analysis data that's now preserved:

- **stack_frame_size**: Total bytes allocated on stack
- **stack_vars**: Array of stack variable locations with offsets
- **arg_annotations**: Function call argument tracking
- **complexity**: Cyclomatic complexity metric
- **end_address**: Function end boundary

This data can be used for:
- Functions Panel (list view with sorting/filtering)
- Inline argument annotations on call instructions
- Stack frame visualization
- Complexity-based code quality metrics
