# Infinite Scroll Implementation for Disassembly View

## Overview
This implementation adds infinite scrolling capabilities to the BattleMagic disassembly view with database enrichment. Users can now scroll through large binaries without pre-loading everything, and the view automatically merges stored analysis data (function names, comments, xrefs) with live UART disassembly.

## Architecture

### Key Components

#### 1. Memory Chunk Manager (`useMemoryChunks.ts`)
- **Purpose**: Tracks which memory address ranges have been loaded
- **Features**:
  - Prevents duplicate loads of the same address range
  - Automatically merges overlapping chunks
  - Prunes distant chunks to keep memory under control (default: 5 chunks max)
  - Provides fast lookup for "is this address loaded?"

**Key Functions**:
```typescript
const memoryChunks = useMemoryChunks(5); // Max 5 chunks

memoryChunks.isRangeLoaded(start, end)  // Check if range is loaded
memoryChunks.addChunk(start, end)        // Add new chunk
memoryChunks.pruneDistantChunks(center, maxDistance) // Remove far chunks
memoryChunks.clearChunks()               // Clear all (on refresh)
```

#### 2. Enriched Disassembly Hook (`useEnrichedDisassembly.ts`)
- **Purpose**: Merges database analysis data with live UART disassembly
- **Features**:
  - Enriches instructions with function names from IndexedDB
  - Adds user comments to instructions
  - Includes xref counts (calls to/from this address)
  - Automatic function name resolution for branch targets

**Enrichment Flow**:
```
UART Disassembly → Raw Instructions
                ↓
        AnalysisContext (IndexedDB)
                ↓
Function Names, Comments, Xrefs
                ↓
        Enriched Display Lines
```

#### 3. Infinite Scroll Hook (`useInfiniteScroll.ts`)
- **Purpose**: Detects when user scrolls near top/bottom
- **Technology**: IntersectionObserver API for efficient detection
- **Features**:
  - Top sentinel: Triggers `loadPreviousChunk()` when visible
  - Bottom sentinel: Triggers `loadNextChunk()` when visible
  - Configurable threshold and root margin (default: 200px)
  - Prevents rapid re-triggers with debouncing

**Configuration**:
```typescript
const { topSentinelRef, bottomSentinelRef } = useInfiniteScroll({
  onLoadPrevious: loadPreviousChunk,
  onLoadNext: loadNextChunk,
  threshold: 0.1,
  rootMargin: '200px',
  enabled: infiniteScrollEnabled && isConnected
});
```

### How It Works

#### Initial Load
1. User connects to target or goes to PC
2. Loads 512 bytes from UART at starting address
3. Disassembles and enriches with database data
4. Enables infinite scroll mode
5. Adds sentinel elements to top/bottom of view

#### Scrolling Up (Loading Previous Chunk)
1. User scrolls near top of view
2. IntersectionObserver detects top sentinel
3. `loadPreviousChunk()` called
4. Calculates previous address: `firstAddress - 512`
5. Loads and disassembles from UART
6. Enriches with database data
7. **Prepends** to existing lines array
8. Prunes far-away chunks to keep memory usage low

#### Scrolling Down (Loading Next Chunk)
1. User scrolls near bottom of view
2. IntersectionObserver detects bottom sentinel
3. `loadNextChunk()` called
4. Calculates next address: `lastAddress + 4`
5. Loads and disassembles from UART
6. Enriches with database data
7. **Appends** to existing lines array
8. Prunes far-away chunks

#### Database Enrichment
For each instruction:
1. Check `AnalysisContext.getFunctionAt(address)`
   - If function exists: Use stored name (e.g., "Init_Hardware" instead of "sub_0x8000100")
2. Check `AnalysisContext.getComment(address)`
   - If comment exists: Display in green
3. Check `XrefContext.getXrefsTo/From(address)`
   - Show caller counts and targets
   - Display clickable xref links

### Memory Management

#### Chunk Window Strategy
```
Current view: 0x8000000-0x8000200
Loaded chunks:
  [0x7FFFE00-0x7FFFF00] ← -2 chunks (will be pruned)
  [0x7FFFF00-0x8000000] ← -1 chunk
  [0x8000000-0x8000200] ← Current chunk (center)
  [0x8000200-0x8000400] ← +1 chunk
  [0x8000400-0x8000600] ← +2 chunks (will be pruned)
```

**Pruning Logic**:
- Keep chunks within `maxDistance` of current center
- Default: `chunkSize * 3 = 512 * 3 = 1536 bytes`
- Keeps ~1.5KB on each side of current view

#### Performance Targets
- Initial load: <100ms
- Load chunk: <150ms
- Scroll smoothness: 60fps
- Memory usage: <10MB for reasonable scrolling

## Files Modified

### New Files Created
1. `hooks/useMemoryChunks.ts` - Memory chunk tracking
2. `hooks/useEnrichedDisassembly.ts` - Database enrichment
3. `hooks/useInfiniteScroll.ts` - Scroll detection

### Modified Files
1. `components/LinearView.tsx`
   - Added `topSentinelRef` and `bottomSentinelRef` props
   - Added sentinel elements at top/bottom of table
   - Added infinite scroll callbacks

2. `DisassemblyView.tsx`
   - Integrated all new hooks
   - Modified `loadDisassembly()` to support append modes
   - Added `loadPreviousChunk()` and `loadNextChunk()`
   - Added memory chunk tracking
   - Updated `handleRefresh()` to clear chunks

3. `hooks/index.ts`
   - Exported new hooks

## Usage Examples

### For Users

#### Scrolling Through Binary
1. Connect to target
2. Click "Go to PC" to load initial view
3. Scroll down → Automatically loads next 512 bytes
4. Scroll up → Automatically loads previous 512 bytes
5. Works seamlessly with no manual intervention

#### With Database Enrichment
1. Run "Analyze Binary" from Analysis Panel
2. Rename functions in the view (Right-click → Rename)
3. Add comments (`;` key on selected line)
4. Navigate away and back → Names and comments persist
5. Scroll to see renamed functions automatically

### For Developers

#### Adding Custom Enrichment
```typescript
// In useEnrichedDisassembly.ts
const enrichInstruction = (inst: DisassembledInstruction) => {
  // Add your custom enrichment logic
  const myData = getCustomData(inst.address);

  return {
    ...result,
    customField: myData
  };
};
```

#### Adjusting Chunk Size
```typescript
// In loadPreviousChunk/loadNextChunk
const chunkSize = 1024; // Change from 512 to 1024 bytes
```

#### Changing Memory Window
```typescript
// In useMemoryChunks call
const memoryChunks = useMemoryChunks(10); // Keep 10 chunks instead of 5
```

## Testing Checklist

- [x] Load disassembly at 0x8000100
- [x] Scroll down → Should load 0x8000300-0x8000500
- [x] Scroll up → Should load 0x7FFFF00-0x8000100
- [x] Rename a function → Should show renamed name in view
- [x] Add comment → Should appear in disassembly
- [x] Scroll far away → Old chunks should unload
- [x] Refresh → Should clear chunks and reload

## Known Limitations

1. **No Virtual Scrolling**: For very large binaries (>10MB), DOM can get heavy
   - Solution: Add react-window for virtual scrolling in future
2. **Chunk Boundary Issues**: If function spans chunk boundary, header may appear multiple times
   - Solution: Deduplicate function headers based on address
3. **No Backward Compatibility**: If analysis database is from older version, may not load
   - Solution: Add database version migration

## Future Enhancements

### Stretch Goals
1. **Vector Table Detection**: When scrolling to 0x0-0x200, auto-show interrupt handler names
2. **Smart Prefetch**: Predict scroll direction and preload next chunk
3. **Compression**: Store compressed chunks in memory
4. **IndexedDB Cache**: Cache recently viewed chunks to avoid re-fetching from UART
5. **Infinite Scroll in Graph View**: Apply same pattern to CFG view

### Performance Optimizations
1. Use Web Workers for disassembly (avoid blocking UI)
2. Implement virtual scrolling with react-window
3. Add progressive loading indicators
4. Cache control flow analysis between chunks

## Technical Notes

### Why IntersectionObserver?
- More efficient than scroll event listeners
- Automatic viewport detection
- Better performance for long lists
- Built-in threshold support

### Why 512 Bytes?
- Good balance between network overhead and responsiveness
- Typical ARM function is 50-200 bytes (2-10 instructions)
- 512 bytes = ~128 ARM Thumb instructions
- Matches common UART read buffer sizes

### Why Prepend/Append Instead of Replace?
- Maintains scroll position
- Smoother user experience
- Allows unlimited scrolling in both directions
- More efficient than re-rendering entire list

## Debugging Tips

### Enable Debug Logging
All components log to console with `[ComponentName]` prefix:
```javascript
console.log('[InfiniteScroll] Top sentinel visible - loading previous chunk');
console.log('[DisassemblyView] Loading previous chunk at 0x7FFFF00');
console.log('[MemoryChunks] Added chunk: 0x7FFFF00-0x8000100');
```

### Check Chunk Status
```typescript
// In browser console
memoryChunks.chunks // View all loaded chunks
memoryChunks.getLoadedRange() // Get min/max addresses
```

### Verify Enrichment
```typescript
// Check if analysis data is loaded
analysisContext?.isAnalyzed() // Should return true after analysis
analysisContext?.functions.size // Number of detected functions
analysisContext?.comments.size // Number of user comments
```

## References

- [IntersectionObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [React Infinite Scroll Pattern](https://www.patterns.dev/posts/infinite-scroll)
- [IndexedDB Best Practices](https://web.dev/indexeddb-best-practices/)
