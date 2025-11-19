# BattleMagic Migration Guide

Guide for upgrading from previous versions of BattleMagic to v2.0+ with new analysis features.

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema Changes](#database-schema-changes)
3. [API Changes](#api-changes)
4. [Breaking Changes](#breaking-changes)
5. [Migration Steps](#migration-steps)
6. [Backwards Compatibility](#backwards-compatibility)

---

## Overview

BattleMagic v2.0 introduces significant enhancements to firmware analysis capabilities:

- **Argument Analysis**: Automatic detection of function arguments
- **Vector Table Detection**: ARM Cortex-M interrupt handler parsing
- **Comment Types**: Multiple comment types (standard, repeatable, anterior, block)
- **Enhanced Functions**: Extended function metadata with complexity metrics
- **Database v3**: New schema with vector table and comment type support

### Version History

| Version | Schema | Key Features |
|---------|--------|-------------|
| v1.x | v1 | Basic xrefs, functions, standard comments |
| v2.x | v2 | Added comment types |
| v2.1+ | v3 | Added vector table, argument annotations |

---

## Database Schema Changes

### Schema v1 → v2

**Changes:**
- Added `comment_type` field to comments
- Added `comment_type` index to comments store

**Migration:**
```typescript
// Automatic migration applied by database manager
// All v1 comments are migrated to 'standard' type
comment.comment_type = 'standard';  // Default for existing comments
```

**Impact:**
- Existing comments are preserved
- All old comments become 'standard' type
- No data loss
- Compatible with v1 databases

---

### Schema v2 → v3

**Changes:**
- Added `vector_table` object store
- Extended functions with argument annotations
- Added loop detection results
- Enhanced metadata

**New Fields:**
```typescript
// Functions
interface FunctionInfo {
    // ... existing fields
    arg_annotations?: ArgAnnotation[];  // NEW
    complexity?: number;                 // NEW
    end_address?: number;                // NEW
}

// Analysis Results
interface AnalysisResults {
    // ... existing fields
    vector_table?: VectorTableEntry[];   // NEW
    loops?: Loop[];                      // NEW
}
```

**Migration:**
```typescript
// Automatic migration applied
// Old databases work without vector_table
// New analysis populates missing fields
```

**Impact:**
- Fully backwards compatible
- Old databases load correctly
- Missing fields filled on next analysis
- Vector table auto-detected on firmware load

---

## API Changes

### WASM API

#### New Methods (v2.0+)

```typescript
// Vector table
get_vector_table(): VectorTableEntry[]

// Database operations
export_database(): string
import_database(json: string): void
get_database_stats(): DatabaseStats

// Comments with types
add_comment(address: number, text: string, type: CommentType): void

// Progress callbacks
analyze_from_bytes_with_progress(
    bytes: Uint8Array,
    callback: (stage: string, progress: number) => void
): AnalysisResults
```

#### Changed Methods

**analyze_from_bytes (v2.0+)**
```typescript
// v1.x - Returns basic results
const results = analyzer.analyze_from_bytes(bytes);
// results: { xrefs, total_instructions, ... }

// v2.0+ - Returns extended results
const results = analyzer.analyze_from_bytes(bytes);
// results: { xrefs, functions, vector_table, loops, ... }
```

#### Deprecated Methods

None. All v1.x methods still supported.

---

### TypeScript Context API

#### New Methods (v2.0+)

```typescript
// Vector table
getVectorTable(): VectorTableEntry[]
getHandlerByVector(vectorNum: number): VectorTableEntry | null
renameVectorHandler(vectorNum: number, newName: string): void

// Argument annotations
getArgAnnotation(callAddress: number): ArgAnnotation | null

// Comment types
getCommentsAt(address: number): Map<CommentType, Comment>
getAllRepeatableComments(): Map<number, Comment>

// Loops
getLoopsInRange(startAddr: number, endAddr: number): Loop[]
```

#### Changed Methods

**setComment (v2.0+)**
```typescript
// v1.x - Single comment type
setComment(address: number, text: string): void

// v2.0+ - Multiple comment types
setComment(address: number, text: string, type: CommentType): void
```

**Migration:**
```typescript
// Old code (v1.x)
setComment(0x08000100, 'My comment');

// New code (v2.0+)
setComment(0x08000100, 'My comment', 'standard');
```

---

## Breaking Changes

### ⚠️ BREAKING: Comment API Change

**v1.x:**
```typescript
interface Comment {
    text: string;
    timestamp: number;
}

// Single comment per address
comments: Map<number, Comment>
```

**v2.0+:**
```typescript
interface Comment {
    text: string;
    type: CommentType;
    timestamp: number;
}

// Multiple comments per address (one per type)
comments: Map<number, Map<CommentType, Comment>>
```

**Fix:**
```typescript
// Old code
const comment = comments.get(address);
if (comment) {
    console.log(comment.text);
}

// New code
const commentMap = comments.get(address);
if (commentMap) {
    const standardComment = commentMap.get('standard');
    if (standardComment) {
        console.log(standardComment.text);
    }
}

// Or use helper method
const comment = getComment(address, 'standard');
if (comment) {
    console.log(comment.text);
}
```

---

### ⚠️ BREAKING: Function Interface Extension

**v1.x:**
```typescript
interface FunctionInfo {
    address: number;
    name: string;
    callers: number[];
    callees: number[];
    xref_count: number;
}
```

**v2.0+:**
```typescript
interface FunctionInfo {
    address: number;
    name: string;
    callers: number[];
    callees: number[];
    xref_count: number;
    // New optional fields
    end_address?: number;
    stack_frame_size?: number;
    stack_vars?: StackVariable[];
    arg_annotations?: ArgAnnotation[];
    complexity?: number;
}
```

**Fix:**
```typescript
// Old code assumes these don't exist
const size = func.end_address - func.address;  // ERROR in v1.x

// New code checks for existence
const size = func.end_address
    ? func.end_address - func.address
    : undefined;
```

---

### ⚠️ BREAKING: Database Export Format

**v1.x:**
```json
{
    "metadata": { ... },
    "functions": [ ... ],
    "comments": [ ... ],
    "xrefs": [ ... ]
}
```

**v2.0+:**
```json
{
    "version": 3,
    "timestamp": 1234567890,
    "metadata": { ... },
    "functions": [ ... ],
    "comments": [ ... ],
    "xrefs": [ ... ],
    "vector_table": [ ... ]
}
```

**Fix:**
- No action needed - automatic migration applied on import
- v1.x exports can be imported into v2.0+
- v2.0+ exports cannot be imported into v1.x (add version check if needed)

---

## Migration Steps

### Step 1: Update Dependencies

```bash
# Update battlemagic-analyzer package
cd packages/battlemagic-analyzer
wasm-pack build --release --target web

# Update web app
cd apps/web
npm install
```

### Step 2: Database Migration

**Automatic Migration:**
```typescript
// Database is automatically migrated on first load
// No manual intervention required
const { loadFromDatabase } = useAnalysis();
await loadFromDatabase();  // Migrates v1/v2 → v3
```

**Manual Migration (if needed):**
```typescript
// Export from v1.x
const oldAnalyzer = new BinaryAnalyzer(0x08000000);
oldAnalyzer.import_database(oldDatabaseJson);
const exportedData = oldAnalyzer.export_database();

// Import into v2.0+
const newAnalyzer = new ArmAnalyzer(0x08000000);
newAnalyzer.import_database(exportedData);  // Auto-migrates
```

### Step 3: Update Code

**Update Comment Usage:**
```typescript
// Before (v1.x)
const { setComment, getComment } = useAnalysis();
setComment(0x08000100, 'My comment');
const comment = getComment(0x08000100);

// After (v2.0+)
const { setComment, getComment } = useAnalysis();
setComment(0x08000100, 'My comment', 'standard');
const comment = getComment(0x08000100, 'standard');
```

**Update Function Access:**
```typescript
// Before (v1.x)
const func = getFunctionAt(0x08000100);
console.log(`Function: ${func.name}`);

// After (v2.0+) - Check optional fields
const func = getFunctionAt(0x08000100);
console.log(`Function: ${func.name}`);
if (func.arg_annotations) {
    console.log(`Has ${func.arg_annotations.length} annotated calls`);
}
if (func.complexity !== undefined) {
    console.log(`Complexity: ${func.complexity}`);
}
```

### Step 4: Test Migration

```typescript
// 1. Export old database
const oldDb = await db.downloadMdb('old_database.mdb');

// 2. Clear database
await clearDatabase();

// 3. Import old database
await importDatabase(oldDb);

// 4. Verify data integrity
const functions = await db.getAllFunctions();
const comments = await db.getAllComments();
console.log(`Migrated ${functions.length} functions`);
console.log(`Migrated ${comments.length} comments`);

// 5. Verify new features work
const vectorTable = getVectorTable();
console.log(`Detected ${vectorTable.length} vectors`);
```

### Step 5: Update UI Components

**Add Vector Table Panel:**
```typescript
import VectorTablePanel from './components/VectorTablePanel';

function MyLayout() {
    return (
        <>
            {/* Existing panels */}
            <VectorTablePanel onNavigateToAddress={handleNavigate} />
        </>
    );
}
```

**Add Argument Annotations:**
```typescript
import { ArgumentAnnotation } from './components/ArgumentAnnotation';
import { useAnalysis } from './lib/context/AnalysisContext';

function DisassemblyLine({ instruction }) {
    const { getArgAnnotation } = useAnalysis();
    const annotation = getArgAnnotation(instruction.address);

    return (
        <div>
            {instruction.text}
            {annotation && (
                <ArgumentAnnotation
                    annotation={annotation}
                    functionName={getFunctionName(annotation.function_target)}
                />
            )}
        </div>
    );
}
```

---

## Backwards Compatibility

### What Works

✅ **v1.x databases load in v2.0+**
- All data preserved
- Automatic schema migration
- Comments converted to 'standard' type
- Functions retain all v1.x fields

✅ **v1.x API calls still work**
- No deprecated methods
- Old method signatures maintained
- Optional parameters for new features

✅ **v1.x export files import correctly**
- JSON format compatible
- Missing fields filled with defaults
- No data loss

### What Doesn't Work

❌ **v2.0+ databases in v1.x**
- Schema version too new
- v1.x cannot read v3 schema
- Export from v2.0+ and import to v1.x will fail

**Workaround:**
```typescript
// To use v2.0+ database in v1.x, strip new fields
function downgradeDatabase(v3db: MdbExport): MdbExport {
    return {
        version: 1,
        timestamp: v3db.timestamp,
        metadata: v3db.metadata,
        functions: v3db.functions.map(f => ({
            address: f.address,
            name: f.name,
            callers: f.callers,
            callees: f.callees,
            xref_count: f.xref_count
            // Strip: arg_annotations, complexity, etc.
        })),
        comments: v3db.comments.filter(c => c.comment_type === 'standard'),
        xrefs: v3db.xrefs
        // Strip: vector_table
    };
}
```

---

## Common Migration Issues

### Issue 1: "Invalid comment type" Error

**Cause:** Using old comment API without specifying type.

**Fix:**
```typescript
// Old code
analyzer.add_comment(0x08000100, 'Comment');  // ERROR: missing type

// Fixed
analyzer.add_comment(0x08000100, 'Comment', 'standard');
```

---

### Issue 2: Comments Not Appearing

**Cause:** Comment type mismatch or incorrect Map access.

**Fix:**
```typescript
// Wrong: Direct Map access
const comment = comments.get(address);  // Returns Map, not Comment

// Right: Use helper method
const comment = getComment(address, 'standard');
```

---

### Issue 3: Function Fields Undefined

**Cause:** Accessing optional fields that don't exist in old databases.

**Fix:**
```typescript
// Unsafe
const complexity = func.complexity;  // May be undefined

// Safe
const complexity = func.complexity ?? 0;
// Or
if (func.complexity !== undefined) {
    // Use func.complexity
}
```

---

### Issue 4: Vector Table Not Detected

**Cause:** Old database doesn't have vector table, need to re-analyze.

**Fix:**
```typescript
// Re-analyze firmware to detect vector table
const { setAnalysisResults } = useAnalysis();
const results = analyzer.analyze_from_bytes(firmwareBytes);
setAnalysisResults(results, baseAddress, firmwareSize);
```

---

### Issue 5: Database Migration Failed

**Cause:** Corrupted database or unsupported version.

**Fix:**
```typescript
try {
    await loadFromDatabase();
} catch (error) {
    console.error('Migration failed:', error);

    // Option 1: Clear and re-analyze
    await clearDatabase();
    // Re-run analysis

    // Option 2: Import from .mdb backup
    await importDatabase(backupFile);
}
```

---

## Testing Checklist

After migration, verify:

- [ ] All functions load correctly
- [ ] Comments appear in disassembly
- [ ] Cross-references still work
- [ ] Vector table appears in panel
- [ ] Argument annotations shown on calls
- [ ] Database export/import works
- [ ] Function renaming works
- [ ] Comment types function correctly
- [ ] Loop visualization appears
- [ ] No console errors

---

## Rollback Procedure

If you need to rollback to v1.x:

### 1. Export Current Database
```typescript
await exportDatabase();  // Downloads .mdb file
```

### 2. Downgrade Dependencies
```bash
npm install battlemagic-analyzer@1.x
```

### 3. Clear Browser Data
```typescript
await clearDatabase();
```

### 4. Restore v1.x Backup
```typescript
// Import v1.x backup (if available)
await importDatabase(v1BackupFile);
```

---

## Getting Help

If you encounter migration issues:

1. Check console for error messages
2. Review this migration guide
3. Check [API.md](./API.md) for updated API docs
4. Review [NEW_FEATURES.md](./NEW_FEATURES.md) for feature details
5. Open issue on GitHub with:
   - Error message
   - Database version
   - Migration steps attempted
   - Browser console logs

---

## Summary

### Key Points

- **Automatic Migration**: v1/v2 databases automatically migrate to v3
- **Backwards Compatible**: All v1.x code works in v2.0+
- **New Features**: Vector table, argument analysis, comment types
- **No Data Loss**: All existing data preserved during migration
- **Breaking Changes**: Minimal (comment API structure only)

### Recommended Approach

1. **Backup**: Export current database before upgrading
2. **Update**: Install v2.0+ packages
3. **Test**: Load database and verify migration
4. **Update Code**: Adapt to new comment API if needed
5. **Verify**: Run through testing checklist
6. **Deploy**: Roll out to users

Migration is designed to be smooth with minimal disruption. Most projects can upgrade with zero code changes.
