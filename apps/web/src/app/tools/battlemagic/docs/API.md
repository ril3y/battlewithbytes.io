# BattleMagic API Documentation

Complete API reference for the BattleMagic firmware analysis toolset, covering both the Rust WASM module and TypeScript/React interfaces.

---

## Table of Contents

1. [WASM API (Rust)](#wasm-api-rust)
2. [TypeScript Interfaces](#typescript-interfaces)
3. [React Context API](#react-context-api)
4. [Component Props](#component-props)
5. [Database Schema](#database-schema)

---

## WASM API (Rust)

### ArmAnalyzer

The main WASM analyzer class for ARM Cortex-M binaries.

#### Constructor

```typescript
new ArmAnalyzer(base_address: number): ArmAnalyzer
```

Creates a new ARM binary analyzer.

**Parameters:**
- `base_address`: Flash base address where firmware is loaded (e.g., `0x08000000` for STM32)

**Example:**
```typescript
const analyzer = new ArmAnalyzer(0x08000000);
```

---

#### analyze_from_bytes

```rust
fn analyze_from_bytes(&mut self, bytes: &[u8]) -> Result<JsValue, JsValue>
```

```typescript
analyze_from_bytes(bytes: Uint8Array): AnalysisResults
```

Analyzes firmware directly from raw bytes using built-in ARM Thumb-2 decoder.

**Parameters:**
- `bytes`: Raw firmware binary data

**Returns:**
- `AnalysisResults`: Complete analysis results including xrefs, functions, vector table

**Example:**
```typescript
const firmwareBytes = new Uint8Array([...]);
const results = analyzer.analyze_from_bytes(firmwareBytes);

console.log(`Found ${results.xrefs.length} cross-references`);
console.log(`Detected ${results.functions.length} functions`);
```

**Errors:**
- Throws `JsValue` error if analysis fails

---

#### analyze_from_bytes_with_progress

```rust
fn analyze_from_bytes_with_progress(
    &mut self,
    bytes: &[u8],
    progress_callback: Option<JsFunction>
) -> Result<JsValue, JsValue>
```

```typescript
analyze_from_bytes_with_progress(
    bytes: Uint8Array,
    progress_callback: (stage: string, progress: number) => void
): AnalysisResults
```

Same as `analyze_from_bytes` but with progress callbacks for long-running analysis.

**Parameters:**
- `bytes`: Raw firmware binary data
- `progress_callback`: Optional callback function called with progress updates

**Progress Updates:**
- `"Decoding instructions", 0.0` - Starting instruction decode
- `"Building xref database", 25.0` - Building cross-reference database
- `"Analyzing functions", 50.0` - Detecting functions
- `"Detecting loops", 75.0` - CFG and loop analysis
- `"Analysis complete", 100.0` - Finished

**Example:**
```typescript
const results = analyzer.analyze_from_bytes_with_progress(
    firmwareBytes,
    (stage, progress) => {
        console.log(`${stage}: ${progress}%`);
    }
);
```

---

#### get_xrefs_to

```rust
fn get_xrefs_to(&self, address: u32) -> Result<JsValue, JsValue>
```

```typescript
get_xrefs_to(address: number): XrefQueryResult
```

Gets all cross-references TO a specific address.

**Parameters:**
- `address`: Target address to query

**Returns:**
- `XrefQueryResult`: Object containing array of xrefs and count

**Example:**
```typescript
const xrefs = analyzer.get_xrefs_to(0x08000100);
console.log(`${xrefs.count} references to 0x08000100`);
xrefs.xrefs.forEach(xref => {
    console.log(`  From 0x${xref.from_addr.toString(16)}: ${xref.instruction}`);
});
```

**Errors:**
- Throws error if analyzer has not been run yet

---

#### get_xrefs_from

```rust
fn get_xrefs_from(&self, address: u32) -> Result<JsValue, JsValue>
```

```typescript
get_xrefs_from(address: number): XrefQueryResult
```

Gets all cross-references FROM a specific address.

**Parameters:**
- `address`: Source address to query

**Returns:**
- `XrefQueryResult`: Object containing array of xrefs and count

**Example:**
```typescript
const xrefs = analyzer.get_xrefs_from(0x08000100);
xrefs.xrefs.forEach(xref => {
    console.log(`  To 0x${xref.to_addr.toString(16)}: ${xref.xref_type}`);
});
```

---

#### get_vector_table

```rust
fn get_vector_table(&self) -> Result<JsValue, JsValue>
```

```typescript
get_vector_table(): VectorTableEntry[]
```

Returns the detected ARM Cortex-M vector table.

**Returns:**
- Array of `VectorTableEntry` objects

**Example:**
```typescript
const vectorTable = analyzer.get_vector_table();
vectorTable.forEach(entry => {
    if (entry.is_valid && entry.vector_number > 0) {
        console.log(`${entry.handler_name}: 0x${entry.handler_address.toString(16)}`);
    }
});
```

---

#### export_database

```rust
fn export_database(&self) -> Result<String, JsValue>
```

```typescript
export_database(): string
```

Exports complete analysis database as JSON string.

**Returns:**
- JSON string containing all analysis data

**Example:**
```typescript
const json = analyzer.export_database();
localStorage.setItem('battlemagic-analysis', json);
```

---

#### import_database

```rust
fn import_database(&mut self, json: &str) -> Result<(), JsValue>
```

```typescript
import_database(json: string): void
```

Imports previously exported analysis database.

**Parameters:**
- `json`: JSON string from `export_database()`

**Example:**
```typescript
const json = localStorage.getItem('battlemagic-analysis');
analyzer.import_database(json);
```

**Errors:**
- Throws error if JSON is invalid or schema version is incompatible

---

#### get_database_stats

```rust
fn get_database_stats(&self) -> Result<JsValue, JsValue>
```

```typescript
get_database_stats(): DatabaseStats
```

Returns statistics about the analysis database.

**Returns:**
- `DatabaseStats` object with counts and size information

**Example:**
```typescript
const stats = analyzer.get_database_stats();
console.log(`Database contains:`);
console.log(`  ${stats.xref_count} xrefs`);
console.log(`  ${stats.function_count} functions`);
console.log(`  ${stats.comment_count} comments`);
console.log(`  ${stats.estimated_size_bytes} bytes estimated`);
```

---

#### add_comment

```rust
fn add_comment(
    &mut self,
    address: u32,
    text: String,
    comment_type_str: &str
) -> Result<(), JsValue>
```

```typescript
add_comment(address: number, text: string, comment_type: CommentTypeStr): void
```

Adds or updates a comment at an address.

**Parameters:**
- `address`: Address where comment is placed
- `text`: Comment text
- `comment_type`: One of: `"standard"`, `"repeatable"`, `"anterior"`, `"block"`

**Example:**
```typescript
analyzer.add_comment(0x08000100, 'Initialize peripherals', 'standard');
analyzer.add_comment(0x08002000, 'Main loop entry point', 'block');
```

---

#### get_comment

```rust
fn get_comment(&self, address: u32) -> Result<JsValue, JsValue>
```

```typescript
get_comment(address: number): Comment | null
```

Gets comment at specific address.

**Parameters:**
- `address`: Address to query

**Returns:**
- `Comment` object or null if no comment exists

**Example:**
```typescript
const comment = analyzer.get_comment(0x08000100);
if (comment) {
    console.log(`Comment at 0x08000100: ${comment.text}`);
}
```

---

#### delete_comment

```rust
fn delete_comment(&mut self, address: u32) -> Result<(), JsValue>
```

```typescript
delete_comment(address: number): void
```

Deletes comment at address.

**Parameters:**
- `address`: Address where comment exists

**Example:**
```typescript
analyzer.delete_comment(0x08000100);
```

---

#### add_symbol

```rust
fn add_symbol(
    &mut self,
    address: u32,
    name: String,
    symbol_type_str: &str
) -> Result<(), JsValue>
```

```typescript
add_symbol(address: number, name: string, symbol_type: SymbolTypeStr): void
```

Adds a symbol/label at an address.

**Parameters:**
- `address`: Address where symbol is defined
- `name`: Symbol name
- `symbol_type`: One of: `"code"`, `"data"`, `"function"`, `"vector"`, `"import"`, `"export"`

**Example:**
```typescript
analyzer.add_symbol(0x08000100, 'main', 'function');
analyzer.add_symbol(0x20000000, 'heap_start', 'data');
```

---

#### rename_function

```rust
fn rename_function(&mut self, address: u32, new_name: String) -> Result<(), JsValue>
```

```typescript
rename_function(address: number, new_name: string): void
```

Renames a function (marks as user-defined).

**Parameters:**
- `address`: Function start address
- `new_name`: New function name

**Example:**
```typescript
analyzer.rename_function(0x08000100, 'UART_Init');
```

---

#### Other Methods

```typescript
// State queries
is_analyzed(): boolean
xref_count(): number
reset(): void

// Function queries
get_function(address: number): FunctionEntry
get_all_functions(): FunctionEntry[]

// Symbol queries
get_symbol(address: number): Symbol

// Metadata
get_metadata(): ProjectMetadata
set_metadata(metadata: ProjectMetadata): void
init_metadata(
    project_name: string,
    architecture: string,
    base_address: number,
    firmware_size: number
): void
```

---

## TypeScript Interfaces

### AnalysisResults

Complete analysis results from WASM analyzer.

```typescript
interface AnalysisResults {
    xrefs: CrossReference[];
    total_instructions: number;
    analysis_time_ms: number;
    unique_targets: number;
    start_address: number;
    end_address: number;

    // Extended results (v2.0+)
    functions?: FunctionInfo[];
    loops?: Loop[];
    vector_table?: VectorTableEntry[];
}
```

---

### CrossReference

Single cross-reference between two addresses.

```typescript
interface CrossReference {
    from_addr: number;
    to_addr: number;
    xref_type: XrefType;
    instruction: string;
    operands: string;
}

enum XrefType {
    Call = 0,
    Branch = 1,
    ConditionalBranch = 2,
    DataRead = 3,
    DataWrite = 4,
}
```

**Example:**
```typescript
const xref: CrossReference = {
    from_addr: 0x08000100,
    to_addr: 0x08002000,
    xref_type: XrefType.Call,
    instruction: 'bl',
    operands: '#0x08002000'
};
```

---

### FunctionInfo

Detected function with metadata.

```typescript
interface FunctionInfo {
    start_address: number;
    name: string;
    callers: number[];
    callees: number[];
    xref_count: number;

    // Extended metadata (v2.0+)
    end_address?: number;
    stack_frame_size?: number;
    stack_vars?: StackVariable[];
    arg_annotations?: ArgAnnotation[];
    complexity?: number;
}
```

---

### ArgAnnotation

Argument annotation for a function call.

```typescript
interface ArgAnnotation {
    call_address: number;
    function_target: number;
    args: Array<[number, string]>;  // [arg_number, value]
}
```

**Example:**
```typescript
const annotation: ArgAnnotation = {
    call_address: 0x08000100,
    function_target: 0x08002000,
    args: [
        [0, '0x8001234'],  // r0 = 0x8001234
        [1, '0xa'],        // r1 = 10
        [2, '[pc+16]']     // r2 = [pc+16]
    ]
};
```

---

### VectorTableEntry

ARM Cortex-M vector table entry.

```typescript
interface VectorTableEntry {
    vector_number: number;
    handler_address: number;
    handler_name: string;
    is_valid: boolean;
}
```

**Standard Vector Numbers:**
- `0`: Initial_SP
- `1`: Reset_Handler
- `2`: NMI_Handler
- `3`: HardFault_Handler
- `4-6`: Fault handlers
- `11`: SVC_Handler
- `14`: PendSV_Handler
- `15`: SysTick_Handler
- `16+`: IRQ handlers

---

### Loop

Detected loop in control flow graph.

```typescript
interface Loop {
    header_addr: number;
    back_edge_addr: number;
    body_addrs: number[];
    is_natural: boolean;
}
```

---

### Comment

User comment at an address.

```typescript
interface Comment {
    text: string;
    type: CommentType;
    timestamp: number;
}

type CommentType = 'standard' | 'repeatable' | 'anterior' | 'block';
```

---

### XrefQueryResult

Result from xref query.

```typescript
interface XrefQueryResult {
    address: number;
    xrefs: CrossReference[];
    count: number;
}
```

---

### DatabaseStats

Statistics about analysis database.

```typescript
interface DatabaseStats {
    xref_count: number;
    function_count: number;
    symbol_count: number;
    comment_count: number;
    segment_count: number;
    vector_table_size: number;
    estimated_size_bytes: number;
}
```

---

## React Context API

### AnalysisContext

The `AnalysisContext` provides centralized state management for all analysis data.

#### Hook

```typescript
import { useAnalysis } from '../lib/context/AnalysisContext';

function MyComponent() {
    const analysis = useAnalysis();
    // ...
}
```

---

#### State Properties

```typescript
interface AnalysisContextState {
    // Raw analysis results
    results: AnalysisResults | null;

    // Firmware info
    baseAddress: number;
    firmwareSize: number;

    // Indexed lookups
    xrefsTo: Map<number, XrefResult[]>;
    xrefsFrom: Map<number, XrefResult[]>;
    functions: Map<number, FunctionInfo>;
    comments: Map<number, Map<CommentType, Comment>>;
    loops: Loop[];
    vectorTable: VectorTableEntry[];
}
```

---

#### Methods

##### setAnalysisResults

```typescript
setAnalysisResults(
    results: AnalysisResults,
    baseAddr: number,
    size: number
): void
```

Sets new analysis results and builds indexes.

**Example:**
```typescript
const { setAnalysisResults } = useAnalysis();
setAnalysisResults(results, 0x08000000, 131072);
```

---

##### clearAnalysis

```typescript
clearAnalysis(): void
```

Clears all analysis data.

---

##### getXrefsTo

```typescript
getXrefsTo(address: number): XrefResult[]
```

Gets all cross-references TO an address.

**Example:**
```typescript
const { getXrefsTo } = useAnalysis();
const xrefs = getXrefsTo(0x08000100);
console.log(`${xrefs.length} references to 0x08000100`);
```

---

##### getXrefsFrom

```typescript
getXrefsFrom(address: number): XrefResult[]
```

Gets all cross-references FROM an address.

---

##### getFunctionAt

```typescript
getFunctionAt(address: number): FunctionInfo | null
```

Gets function at specific address.

**Example:**
```typescript
const { getFunctionAt } = useAnalysis();
const func = getFunctionAt(0x08000100);
if (func) {
    console.log(`Function: ${func.name}`);
    console.log(`Called by ${func.callers.length} locations`);
}
```

---

##### renameFunction

```typescript
renameFunction(address: number, newName: string): void
```

Renames a function.

---

##### Comment Methods

```typescript
getComment(address: number, type?: CommentType): Comment | null
getCommentsAt(address: number): Map<CommentType, Comment>
setComment(address: number, text: string, type: CommentType): void
deleteComment(address: number, type: CommentType): void
getAllRepeatableComments(): Map<number, Comment>
```

**Example:**
```typescript
const { setComment, getComment } = useAnalysis();

// Add comment
setComment(0x08000100, 'Initialize UART', 'standard');

// Retrieve comment
const comment = getComment(0x08000100);
console.log(comment?.text);
```

---

##### Loop Methods

```typescript
getLoopsInRange(startAddr: number, endAddr: number): Loop[]
```

Gets all loops that overlap with the specified address range.

---

##### Argument Annotation Methods

```typescript
getArgAnnotation(callAddress: number): ArgAnnotation | null
```

Gets argument annotation for a specific call instruction.

**Example:**
```typescript
const { getArgAnnotation } = useAnalysis();
const annotation = getArgAnnotation(0x08000100);
if (annotation) {
    console.log(`Call to 0x${annotation.function_target.toString(16)}`);
    annotation.args.forEach(([num, val]) => {
        console.log(`  arg${num}: ${val}`);
    });
}
```

---

##### Vector Table Methods

```typescript
getVectorTable(): VectorTableEntry[]
getHandlerByVector(vectorNum: number): VectorTableEntry | null
renameVectorHandler(vectorNum: number, newName: string): void
```

**Example:**
```typescript
const { getVectorTable, renameVectorHandler } = useAnalysis();

// Get all vectors
const vectors = getVectorTable();

// Rename SysTick handler
renameVectorHandler(15, 'My_SysTick_Handler');
```

---

##### Database Methods

```typescript
saveToDatabase(): Promise<void>
loadFromDatabase(): Promise<boolean>
exportDatabase(): Promise<void>
importDatabase(file: File): Promise<void>
clearDatabase(): Promise<void>
```

**Example:**
```typescript
const { saveToDatabase, exportDatabase } = useAnalysis();

// Auto-save to IndexedDB
await saveToDatabase();

// Export to .mdb file
await exportDatabase(); // Downloads battlemagic_TIMESTAMP.mdb
```

---

##### State Query

```typescript
isAnalyzed(): boolean
```

Returns true if analysis has been performed.

---

## Component Props

### VectorTablePanel

```typescript
interface VectorTablePanelProps {
    onNavigateToAddress?: (address: number) => void;
}
```

**Usage:**
```typescript
<VectorTablePanel
    onNavigateToAddress={(addr) => navigateTo(addr)}
/>
```

---

### ArgumentAnnotation

```typescript
interface ArgumentAnnotationProps {
    annotation: ArgAnnotation;
    functionName?: string;
    compact?: boolean;
}
```

**Usage:**
```typescript
<ArgumentAnnotation
    annotation={annotation}
    functionName="UART_Init"
    compact={true}
/>
```

---

### CommentModal

```typescript
interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (comment: string) => void;
    onDelete?: () => void;
    address: number;
    currentComment: string;
    setCurrentComment: (comment: string) => void;
}
```

---

## Database Schema

### IndexedDB Schema (v3)

#### Object Stores

**functions**
- Primary key: `address` (number)
- Indexes: `name`
- Fields: `address`, `name`, `callers`, `callees`, `xref_count`

**comments**
- Primary key: `address` (number)
- Indexes: `timestamp`, `comment_type`
- Fields: `address`, `text`, `comment_type`, `timestamp`

**xrefs**
- Primary key: `id` (string, composite)
- Indexes: `from_addr`, `to_addr`, `xref_type`
- Fields: `id`, `from_addr`, `to_addr`, `xref_type`, `instruction`, `operands`

**metadata**
- Primary key: `key` (string)
- Fields: `key`, `value`

**vector_table**
- Primary key: `vector_number` (number)
- Indexes: `handler_address`, `is_valid`
- Fields: `vector_number`, `handler_address`, `handler_name`, `is_valid`

---

### .mdb Export Format

Magic Database (.mdb) export file format:

```typescript
interface MdbExport {
    version: number;              // Schema version (currently 3)
    timestamp: number;            // Export timestamp
    metadata: Record<string, unknown>;
    functions: DbFunction[];
    comments: DbComment[];
    xrefs: DbXref[];
    vector_table: DbVectorTableEntry[];
}
```

**File Format:**
- Plain JSON text file
- Extension: `.mdb`
- Compression: Optional gzip (`.mdb.gz`)
- Filename pattern: `battlemagic_YYYYMMDD_HHMMSS.mdb`

---

## Error Handling

### WASM Errors

All WASM methods return `Result<T, JsValue>`. Errors are thrown as JavaScript exceptions.

**Common Errors:**
- `"Binary not analyzed. Call analyze_from_disasm() first."` - Must analyze before querying
- `"No function at 0x{address}"` - Function not found
- `"No comment at 0x{address}"` - Comment not found
- `"Invalid comment type"` - Unknown comment type string
- `"Serialization failed"` - Failed to serialize to JSON
- `"Deserialization failed"` - Failed to parse JSON
- `"Migration failed"` - Database schema migration error

**Handling Errors:**
```typescript
try {
    const results = analyzer.analyze_from_bytes(bytes);
} catch (error) {
    console.error('Analysis failed:', error);
    // Handle error
}
```

---

### Context Errors

AnalysisContext methods that can fail return `null` or empty arrays instead of throwing.

**Safe Patterns:**
```typescript
const func = getFunctionAt(address);
if (func) {
    // Use func
}

const comment = getComment(address);
if (comment) {
    // Use comment
}
```

---

## Performance Considerations

### Best Practices

1. **Batch Operations**: Use batch methods when available
```typescript
// Good: Single analysis
const results = analyzer.analyze_from_bytes(bytes);

// Bad: Multiple small analyses
bytes.forEach(chunk => analyzer.analyze_from_bytes(chunk));
```

2. **Index Lookups**: Use AnalysisContext methods for fast lookups
```typescript
// Good: O(1) lookup
const xrefs = getXrefsTo(address);

// Bad: O(n) search
const xrefs = results.xrefs.filter(x => x.to_addr === address);
```

3. **Database Saves**: Debounce frequent updates
```typescript
// Good: Debounced auto-save (built-in)
setComment(address, text, type);  // Auto-saves after 2s

// Bad: Save after every operation
setComment(address, text, type);
await saveToDatabase();  // Too frequent
```

4. **Memory Management**: Clear unused data
```typescript
// Clear analysis when switching firmware
clearAnalysis();

// Reset analyzer between files
analyzer.reset();
```

---

## Migration Guide

For migrating from older versions, see [MIGRATION.md](./MIGRATION.md).

For development and architecture details, see [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md).

For feature documentation, see [NEW_FEATURES.md](./NEW_FEATURES.md).
