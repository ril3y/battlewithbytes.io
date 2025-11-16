# BattleMagic Analysis Database Design

**Version:** 1.0
**Date:** 2025-11-16
**Status:** Design Specification

## Executive Summary

This document defines the persistent database schema for BattleMagic, a WASM-based binary analyzer running entirely in the browser. The database design is inspired by IDA Pro's `.idb` format but optimized for client-side IndexedDB storage and JSON/MessagePack serialization.

**Key Requirements:**
- Runs entirely client-side (GitHub Pages hosting)
- Persistent storage across browser sessions
- Support for user annotations (comments, function names, labels)
- Efficient serialization between Rust WASM and JavaScript
- Schema versioning for backwards compatibility
- Fast lookups for xrefs, functions, and symbols

---

## 1. Research: IDA Pro Database Structure

### 1.1 IDA Pro Database Organization

IDA Pro stores analysis results in `.idb` (32-bit) or `.i64` (64-bit) files with the following structure:

**Container Sections:**
- **ID0**: B-tree key-value database containing all metadata
- **ID1**: Byte-level flags for each address (stored as virtual array)
- **NAM**: Named offset index (fast name lookups)
- **SEG**: Segment information
- **TIL**: Type library (local types)

### 1.2 Data Categories in IDA Database

| Category | What IDA Stores | BattleMagic Equivalent |
|----------|----------------|------------------------|
| **Names/Labels** | Address → Name mapping (max 32KB per name) | Symbol table with address → name |
| **Cross-References** | Bidirectional xrefs (from/to) for code and data | XrefDatabase (already implemented) |
| **Functions** | Function boundaries, prototypes, arguments, stack frames | Function table with address, name, callers, callees |
| **Comments** | Standard, repeatable, anterior comments | Address → comment mapping |
| **Segments** | Memory regions with permissions and properties | Memory map with base address, size, permissions |
| **Types** | Structs, enums, typedefs with member information | Future: type definitions for data structures |
| **Metadata** | Architecture, base address, entry points, analysis settings | Project metadata |

### 1.3 Key Insights from IDA Design

1. **Bidirectional Indexing**: IDA maintains both "to" and "from" indices for xrefs (we already do this)
2. **Hierarchical Keys**: Uses structured keys like `(.addr, 'tag', index)` for flexible queries
3. **Lazy Loading**: Not all data is loaded at once - sections loaded on demand
4. **User vs Auto**: Distinguishes between user annotations and auto-detected items
5. **Versioning**: Schema evolves with IDA versions, migrations handled in `onupgradeneeded`

---

## 2. Database Schema Design

### 2.1 Core Principles

1. **Modularity**: Each data type (functions, xrefs, comments) stored in separate object stores
2. **Normalization**: Avoid duplication - xrefs reference addresses, not full instruction text
3. **Serialization**: All Rust structs must be `Serialize + Deserialize` (serde-compatible)
4. **Versioning**: Include schema version in metadata for future migrations
5. **Efficiency**: Use compact representations (u32 for addresses, enums for types)

### 2.2 Rust Database Schema

#### 2.2.1 Project Metadata

```rust
use serde::{Deserialize, Serialize};

/// Top-level project metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectMetadata {
    /// Schema version for migrations
    pub schema_version: u32,

    /// Project name (user-editable)
    pub project_name: String,

    /// Creation timestamp (Unix epoch)
    pub created_at: u64,

    /// Last modified timestamp
    pub modified_at: u64,

    /// Architecture (e.g., "ARM Cortex-M3")
    pub architecture: String,

    /// Base address where firmware is loaded
    pub base_address: u32,

    /// Firmware size in bytes
    pub firmware_size: u32,

    /// Entry point address (from vector table or manual)
    pub entry_point: Option<u32>,

    /// Chip/MCU identifier (e.g., "STM32F103C8T6")
    pub chip_id: Option<String>,

    /// User-defined description
    pub description: Option<String>,
}

impl ProjectMetadata {
    /// Current schema version
    pub const CURRENT_SCHEMA_VERSION: u32 = 1;

    pub fn new(
        project_name: String,
        architecture: String,
        base_address: u32,
        firmware_size: u32,
    ) -> Self {
        let now = current_timestamp(); // Platform-specific implementation

        Self {
            schema_version: Self::CURRENT_SCHEMA_VERSION,
            project_name,
            created_at: now,
            modified_at: now,
            architecture,
            base_address,
            firmware_size,
            entry_point: None,
            chip_id: None,
            description: None,
        }
    }
}
```

#### 2.2.2 Function Table

```rust
/// Function definition with caller/callee relationships
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionEntry {
    /// Function start address (primary key)
    pub address: u32,

    /// Function name (user-editable or auto-generated)
    pub name: String,

    /// Whether name was user-defined (vs auto "sub_1000")
    pub name_is_user_defined: bool,

    /// Addresses that call this function
    pub callers: Vec<u32>,

    /// Addresses this function calls
    pub callees: Vec<u32>,

    /// Total number of xrefs TO this function
    pub xref_count: u32,

    /// Function size in bytes (if known)
    pub size: Option<u32>,

    /// Function signature (future: return type + args)
    pub signature: Option<String>,

    /// Function attributes (e.g., "noreturn", "interrupt")
    pub attributes: Vec<String>,
}

impl FunctionEntry {
    /// Create auto-detected function with default name
    pub fn new_auto(address: u32) -> Self {
        Self {
            address,
            name: format!("sub_{:X}", address),
            name_is_user_defined: false,
            callers: Vec::new(),
            callees: Vec::new(),
            xref_count: 0,
            size: None,
            signature: None,
            attributes: Vec::new(),
        }
    }

    /// Rename function (marks as user-defined)
    pub fn rename(&mut self, new_name: String) {
        self.name = new_name;
        self.name_is_user_defined = true;
    }
}
```

#### 2.2.3 Cross-Reference Database

**Already implemented** in `xref.rs` and `types.rs`. No changes needed, but we'll serialize the entire `XrefDatabase` for persistence:

```rust
/// Wrapper for serializing XrefDatabase
#[derive(Debug, Serialize, Deserialize)]
pub struct XrefDatabaseExport {
    /// All cross-references
    pub xrefs: Vec<CrossReference>,
}

impl From<&XrefDatabase> for XrefDatabaseExport {
    fn from(db: &XrefDatabase) -> Self {
        Self {
            xrefs: db.get_all_xrefs().clone(),
        }
    }
}

impl XrefDatabase {
    /// Export database for serialization
    pub fn export(&self) -> XrefDatabaseExport {
        XrefDatabaseExport {
            xrefs: self.get_all_xrefs().clone(),
        }
    }

    /// Import from serialized data
    pub fn import(export: XrefDatabaseExport) -> Self {
        let mut db = XrefDatabase::with_capacity(export.xrefs.len());

        for xref in export.xrefs {
            db.add_xref(
                xref.from_addr,
                xref.to_addr,
                xref.xref_type,
                &xref.instruction,
                &xref.operands,
            );
        }

        db.build_indices();
        db
    }
}
```

#### 2.2.4 Symbol Table

```rust
/// Symbol/label at a specific address
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Symbol {
    /// Address where symbol is defined
    pub address: u32,

    /// Symbol name
    pub name: String,

    /// Symbol type
    pub symbol_type: SymbolType,

    /// Whether symbol was user-defined
    pub is_user_defined: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SymbolType {
    /// Code label (address of instruction)
    Code,

    /// Data label (address of data)
    Data,

    /// Function entry point
    Function,

    /// Vector table entry
    VectorTable,

    /// Import from external library
    Import,

    /// Export to external consumers
    Export,
}

impl Symbol {
    pub fn new(address: u32, name: String, symbol_type: SymbolType) -> Self {
        Self {
            address,
            name,
            symbol_type,
            is_user_defined: false,
        }
    }
}
```

#### 2.2.5 Comment Table

```rust
/// User comment at an address
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Comment {
    /// Address where comment is placed
    pub address: u32,

    /// Comment text (supports markdown)
    pub text: String,

    /// Comment type
    pub comment_type: CommentType,

    /// Creation timestamp
    pub created_at: u64,

    /// Last modified timestamp
    pub modified_at: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CommentType {
    /// Standard end-of-line comment
    Standard,

    /// Repeatable comment (shown at all xrefs to this address)
    Repeatable,

    /// Comment before the line (anterior)
    Anterior,

    /// Multi-line comment block
    Block,
}

impl Comment {
    pub fn new(address: u32, text: String, comment_type: CommentType) -> Self {
        let now = current_timestamp();

        Self {
            address,
            text,
            comment_type,
            created_at: now,
            modified_at: now,
        }
    }
}
```

#### 2.2.6 Memory Map

```rust
/// Memory segment/region definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemorySegment {
    /// Segment name (e.g., "FLASH", "RAM", "PERIPHERALS")
    pub name: String,

    /// Start address
    pub start_address: u32,

    /// End address (exclusive)
    pub end_address: u32,

    /// Segment type
    pub segment_type: SegmentType,

    /// Permissions (read, write, execute)
    pub permissions: SegmentPermissions,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SegmentType {
    Code,
    Data,
    Bss,
    Rodata,
    Peripheral,
    Unknown,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct SegmentPermissions {
    pub read: bool,
    pub write: bool,
    pub execute: bool,
}

impl MemorySegment {
    pub fn size(&self) -> u32 {
        self.end_address - self.start_address
    }
}
```

#### 2.2.7 Vector Table

```rust
/// ARM Cortex-M vector table entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorTableEntry {
    /// Vector number (0 = initial SP, 1 = Reset, etc.)
    pub vector_number: u32,

    /// Handler address
    pub handler_address: u32,

    /// Handler name (e.g., "Reset_Handler", "SysTick_Handler")
    pub handler_name: String,

    /// Whether handler address is valid (non-zero, in flash)
    pub is_valid: bool,
}

impl VectorTableEntry {
    /// Standard ARM Cortex-M vector names
    pub fn default_name(vector_number: u32) -> &'static str {
        match vector_number {
            0 => "Initial_SP",
            1 => "Reset_Handler",
            2 => "NMI_Handler",
            3 => "HardFault_Handler",
            4 => "MemManage_Handler",
            5 => "BusFault_Handler",
            6 => "UsageFault_Handler",
            11 => "SVC_Handler",
            14 => "PendSV_Handler",
            15 => "SysTick_Handler",
            _ => "IRQHandler",
        }
    }
}
```

#### 2.2.8 Analysis Database (Top-Level)

```rust
/// Complete analysis database (serializable to IndexedDB)
#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisDatabase {
    /// Project metadata
    pub metadata: ProjectMetadata,

    /// All cross-references
    pub xrefs: XrefDatabaseExport,

    /// Detected/defined functions
    pub functions: Vec<FunctionEntry>,

    /// Symbol table
    pub symbols: Vec<Symbol>,

    /// User comments
    pub comments: Vec<Comment>,

    /// Memory map
    pub segments: Vec<MemorySegment>,

    /// Vector table (ARM Cortex-M specific)
    pub vector_table: Vec<VectorTableEntry>,
}

impl AnalysisDatabase {
    /// Create new empty database
    pub fn new(metadata: ProjectMetadata) -> Self {
        Self {
            metadata,
            xrefs: XrefDatabaseExport { xrefs: Vec::new() },
            functions: Vec::new(),
            symbols: Vec::new(),
            comments: Vec::new(),
            segments: Vec::new(),
            vector_table: Vec::new(),
        }
    }

    /// Get database size estimate (for UI display)
    pub fn estimated_size_bytes(&self) -> usize {
        // Rough estimate: each xref ~100 bytes, function ~200 bytes, etc.
        self.xrefs.xrefs.len() * 100
            + self.functions.len() * 200
            + self.symbols.len() * 50
            + self.comments.len() * 150
            + self.segments.len() * 100
            + self.vector_table.len() * 50
    }
}
```

### 2.3 IndexedDB Schema (JavaScript/TypeScript)

The Rust structs serialize to JSON and are stored in IndexedDB with the following schema:

```typescript
// IndexedDB database name and version
const DB_NAME = 'battlemagic-analysis';
const DB_VERSION = 1;

// Object Store definitions
interface IndexedDBSchema {
  // Store 1: Projects (one entry per analyzed binary)
  projects: {
    key: string;          // Unique project ID (UUID)
    value: {
      metadata: ProjectMetadata;
      lastAccessed: number;
    };
    indexes: {
      'by-name': string;
      'by-modified': number;
    };
  };

  // Store 2: Analysis Data (one entry per project)
  analysis: {
    key: string;          // Project ID (foreign key to projects)
    value: AnalysisDatabase;
    indexes: {
      'by-project': string;
    };
  };

  // Store 3: Firmware Blobs (optional - for caching)
  firmware: {
    key: string;          // Project ID
    value: {
      blob: Uint8Array;
      sha256: string;
    };
  };
}
```

**Rationale for Schema:**
1. **Separate Projects and Analysis**: Metadata is smaller, can be loaded for project list without loading full analysis
2. **Firmware Blobs Optional**: Large binary data stored separately, only loaded when needed
3. **Indexes**: Fast lookups by project name, modification date for UI sorting

---

## 3. Serialization Strategy

### 3.1 Format Comparison

| Format | Pros | Cons | Verdict |
|--------|------|------|---------|
| **JSON** | Human-readable, widely supported, easy debugging | Larger size (~30% overhead), slower parsing | **Recommended for v1** |
| **MessagePack** | Compact (~20% smaller), faster parsing | Binary (not human-readable), requires library | Future optimization |
| **Bincode** | Smallest size, fastest, Rust-native | Rust-specific, not portable | Not suitable |

### 3.2 Implementation: JSON Serialization

Use `serde_json` for serialization in WASM:

```rust
use serde_json;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl ArmAnalyzer {
    /// Export analysis database as JSON string
    #[wasm_bindgen]
    pub fn export_database(&self) -> Result<String, JsValue> {
        if !self.inner.is_analyzed() {
            return Err(JsValue::from_str("No analysis available to export"));
        }

        // Build database from current state
        let db = self.build_database();

        // Serialize to JSON
        serde_json::to_string(&db)
            .map_err(|e| JsValue::from_str(&format!("Serialization failed: {}", e)))
    }

    /// Import analysis database from JSON string
    #[wasm_bindgen]
    pub fn import_database(&mut self, json: &str) -> Result<(), JsValue> {
        // Deserialize from JSON
        let db: AnalysisDatabase = serde_json::from_str(json)
            .map_err(|e| JsValue::from_str(&format!("Deserialization failed: {}", e)))?;

        // Validate schema version
        if db.metadata.schema_version > ProjectMetadata::CURRENT_SCHEMA_VERSION {
            return Err(JsValue::from_str(&format!(
                "Database schema version {} is newer than supported version {}",
                db.metadata.schema_version,
                ProjectMetadata::CURRENT_SCHEMA_VERSION
            )));
        }

        // Load database into analyzer
        self.load_database(db)?;

        Ok(())
    }

    /// Build database from current analyzer state
    fn build_database(&self) -> AnalysisDatabase {
        // Implementation in next section
        todo!()
    }

    /// Load database into analyzer state
    fn load_database(&mut self, db: AnalysisDatabase) -> Result<(), JsValue> {
        // Implementation in next section
        todo!()
    }
}
```

### 3.3 Compression (Optional)

For large databases, apply gzip compression in JavaScript before storing to IndexedDB:

```typescript
// Compress JSON before storing
async function saveAnalysis(projectId: string, database: AnalysisDatabase) {
  const json = JSON.stringify(database);
  const compressed = await gzipCompress(json); // Use browser compression API

  await idb.put('analysis', {
    projectId,
    data: compressed,
    compressed: true,
  });
}

// Decompress when loading
async function loadAnalysis(projectId: string): Promise<AnalysisDatabase> {
  const entry = await idb.get('analysis', projectId);

  let json: string;
  if (entry.compressed) {
    json = await gzipDecompress(entry.data);
  } else {
    json = entry.data;
  }

  return JSON.parse(json);
}
```

---

## 4. WASM Integration

### 4.1 Database Export Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Analysis Session                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clicks "Save Project"                                    │
│    - JavaScript calls wasmAnalyzer.export_database()             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Rust WASM: build_database()                                   │
│    - Collect all analysis data (xrefs, functions, comments)      │
│    - Build AnalysisDatabase struct                               │
│    - Serialize to JSON string using serde_json                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Return JSON to JavaScript                                     │
│    - String crosses WASM boundary                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. JavaScript: IndexedDB Storage                                 │
│    - Parse JSON to object                                        │
│    - Store in IndexedDB 'analysis' store                         │
│    - Update project metadata (lastAccessed, modified_at)         │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Database Import Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User selects project from project list                        │
│    - JavaScript loads from IndexedDB                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. JavaScript: Retrieve Analysis Data                            │
│    - Query IndexedDB for project ID                              │
│    - Get AnalysisDatabase object                                 │
│    - Stringify to JSON                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. JavaScript calls wasmAnalyzer.import_database(json)           │
│    - Pass JSON string to WASM                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Rust WASM: load_database()                                    │
│    - Deserialize JSON using serde_json                           │
│    - Validate schema version                                     │
│    - Load xrefs into XrefDatabase                                │
│    - Rebuild indices (build_indices())                           │
│    - Populate internal state                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Analyzer Ready                                                │
│    - is_analyzed() returns true                                  │
│    - UI can query xrefs, functions, etc.                         │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 WASM API Design

Add the following methods to `ArmAnalyzer` in `lib.rs`:

```rust
#[wasm_bindgen]
impl ArmAnalyzer {
    /// Export complete analysis database as JSON
    #[wasm_bindgen]
    pub fn export_database(&self) -> Result<String, JsValue> {
        // Already shown in section 3.2
    }

    /// Import analysis database from JSON
    #[wasm_bindgen]
    pub fn import_database(&mut self, json: &str) -> Result<(), JsValue> {
        // Already shown in section 3.2
    }

    /// Get/set project metadata
    #[wasm_bindgen]
    pub fn get_metadata(&self) -> Result<JsValue, JsValue> {
        if let Some(ref metadata) = self.metadata {
            serde_wasm_bindgen::to_value(metadata)
                .map_err(|e| JsValue::from_str(&e.to_string()))
        } else {
            Err(JsValue::from_str("No metadata available"))
        }
    }

    #[wasm_bindgen]
    pub fn set_metadata(&mut self, metadata_js: JsValue) -> Result<(), JsValue> {
        let metadata: ProjectMetadata = serde_wasm_bindgen::from_value(metadata_js)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;

        self.metadata = Some(metadata);
        Ok(())
    }

    /// Function operations
    #[wasm_bindgen]
    pub fn get_function(&self, address: u32) -> Result<JsValue, JsValue> {
        if let Some(func) = self.functions.get(&address) {
            serde_wasm_bindgen::to_value(func)
                .map_err(|e| JsValue::from_str(&e.to_string()))
        } else {
            Err(JsValue::from_str(&format!("No function at 0x{:X}", address)))
        }
    }

    #[wasm_bindgen]
    pub fn rename_function(&mut self, address: u32, new_name: String) -> Result<(), JsValue> {
        if let Some(func) = self.functions.get_mut(&address) {
            func.rename(new_name);
            Ok(())
        } else {
            Err(JsValue::from_str(&format!("No function at 0x{:X}", address)))
        }
    }

    #[wasm_bindgen]
    pub fn get_all_functions(&self) -> Result<JsValue, JsValue> {
        let funcs: Vec<&FunctionEntry> = self.functions.values().collect();
        serde_wasm_bindgen::to_value(&funcs)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Comment operations
    #[wasm_bindgen]
    pub fn add_comment(&mut self, address: u32, text: String, comment_type_str: &str) -> Result<(), JsValue> {
        let comment_type = match comment_type_str {
            "standard" => CommentType::Standard,
            "repeatable" => CommentType::Repeatable,
            "anterior" => CommentType::Anterior,
            "block" => CommentType::Block,
            _ => return Err(JsValue::from_str("Invalid comment type")),
        };

        let comment = Comment::new(address, text, comment_type);
        self.comments.insert(address, comment);
        Ok(())
    }

    #[wasm_bindgen]
    pub fn get_comment(&self, address: u32) -> Result<JsValue, JsValue> {
        if let Some(comment) = self.comments.get(&address) {
            serde_wasm_bindgen::to_value(comment)
                .map_err(|e| JsValue::from_str(&e.to_string()))
        } else {
            Err(JsValue::from_str(&format!("No comment at 0x{:X}", address)))
        }
    }

    #[wasm_bindgen]
    pub fn delete_comment(&mut self, address: u32) -> Result<(), JsValue> {
        if self.comments.remove(&address).is_some() {
            Ok(())
        } else {
            Err(JsValue::from_str(&format!("No comment at 0x{:X}", address)))
        }
    }

    /// Symbol operations
    #[wasm_bindgen]
    pub fn add_symbol(&mut self, address: u32, name: String, symbol_type_str: &str) -> Result<(), JsValue> {
        let symbol_type = match symbol_type_str {
            "code" => SymbolType::Code,
            "data" => SymbolType::Data,
            "function" => SymbolType::Function,
            "vector" => SymbolType::VectorTable,
            "import" => SymbolType::Import,
            "export" => SymbolType::Export,
            _ => return Err(JsValue::from_str("Invalid symbol type")),
        };

        let symbol = Symbol::new(address, name, symbol_type);
        self.symbols.insert(address, symbol);
        Ok(())
    }
}
```

**Add to `ArmAnalyzer` struct:**

```rust
#[wasm_bindgen]
pub struct ArmAnalyzer {
    inner: BinaryAnalyzer<ArmArchitecture>,

    // Add these fields for database state
    metadata: Option<ProjectMetadata>,
    functions: HashMap<u32, FunctionEntry>,
    symbols: HashMap<u32, Symbol>,
    comments: HashMap<u32, Comment>,
    segments: Vec<MemorySegment>,
    vector_table: Vec<VectorTableEntry>,
}
```

---

## 5. Schema Versioning Strategy

### 5.1 Version Migration Framework

```rust
/// Database migration handler
pub struct DatabaseMigrator;

impl DatabaseMigrator {
    /// Migrate database from old version to current version
    pub fn migrate(mut db: AnalysisDatabase) -> Result<AnalysisDatabase, String> {
        let current_version = db.metadata.schema_version;
        let target_version = ProjectMetadata::CURRENT_SCHEMA_VERSION;

        if current_version > target_version {
            return Err(format!(
                "Database version {} is newer than supported version {}",
                current_version, target_version
            ));
        }

        // Apply migrations sequentially
        let mut version = current_version;
        while version < target_version {
            db = match version {
                0 => Self::migrate_0_to_1(db)?,
                1 => Self::migrate_1_to_2(db)?,
                // Add future migrations here
                _ => return Err(format!("Unknown migration path from version {}", version)),
            };
            version += 1;
        }

        Ok(db)
    }

    /// Example: Migrate from v0 to v1
    fn migrate_0_to_1(mut db: AnalysisDatabase) -> Result<AnalysisDatabase, String> {
        // Example: Add new field with default value
        // In v1, we added 'chip_id' field to metadata
        db.metadata.schema_version = 1;
        // chip_id is already Option<String>, so no data transformation needed
        Ok(db)
    }

    /// Example: Migrate from v1 to v2 (future)
    fn migrate_1_to_2(mut db: AnalysisDatabase) -> Result<AnalysisDatabase, String> {
        // Future migration logic
        db.metadata.schema_version = 2;
        Ok(db)
    }
}
```

### 5.2 IndexedDB Version Management

In JavaScript/TypeScript, handle version upgrades in `onupgradeneeded`:

```typescript
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      console.log(`Upgrading IndexedDB from version ${oldVersion} to ${DB_VERSION}`);

      // Migration v0 -> v1: Create initial schema
      if (oldVersion < 1) {
        // Create projects store
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('by-name', 'metadata.project_name');
        projectStore.createIndex('by-modified', 'metadata.modified_at');

        // Create analysis store
        const analysisStore = db.createObjectStore('analysis', { keyPath: 'projectId' });
        analysisStore.createIndex('by-project', 'projectId');

        // Create firmware store
        db.createObjectStore('firmware', { keyPath: 'projectId' });
      }

      // Future migrations
      if (oldVersion < 2) {
        // Add new indexes, stores, etc.
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
```

### 5.3 Version Compatibility Matrix

| Schema Version | Released | Breaking Changes | Migration Required |
|----------------|----------|------------------|-------------------|
| 1 (current) | 2025-11 | Initial schema | No (first version) |
| 2 (planned) | TBD | Add type system | Yes (add empty types array) |
| 3 (planned) | TBD | Add decompiler data | Yes (add empty decompiler field) |

**Backwards Compatibility Policy:**
- Always support loading databases from previous versions
- Migrations applied automatically on load
- Never break old databases (only add, never remove required fields)
- Use `Option<T>` for new fields to avoid breaking old data

---

## 6. Implementation Roadmap

### Phase 1: Core Database Structs (Agent 1 - You are here)
- [ ] Define all Rust structs in `src/database.rs`
- [ ] Implement `Serialize`/`Deserialize` for all types
- [ ] Add `export_database()` and `import_database()` to `ArmAnalyzer`
- [ ] Write unit tests for serialization round-trips
- [ ] Document API for Agent 2 (IndexedDB layer)

### Phase 2: IndexedDB Storage Layer (Agent 2)
- [ ] Create TypeScript interface matching Rust structs
- [ ] Implement IndexedDB wrapper (`AnalysisDB` class)
- [ ] Add CRUD operations (save, load, delete, list projects)
- [ ] Implement schema versioning (`onupgradeneeded` handler)
- [ ] Add compression for large databases
- [ ] Write tests for IndexedDB operations

### Phase 3: UI Integration (Agent 3)
- [ ] Create "Project Manager" component (list, open, delete projects)
- [ ] Add "Save Project" button in toolbar
- [ ] Implement "Load Project" dialog
- [ ] Show database statistics (size, xref count, function count)
- [ ] Add import/export features (download .json, upload .json)
- [ ] Display migration progress for old databases

### Phase 4: Advanced Features (Future)
- [ ] Auto-save every N minutes
- [ ] Undo/redo for user actions (comments, renames)
- [ ] Export to IDA Pro format (if possible)
- [ ] Collaborative features (share analysis via JSON export)
- [ ] Differential analysis (compare two versions of firmware)

---

## 7. Coordination with Other Agents

### 7.1 Agent 2: IndexedDB Layer (TypeScript)

**Your Responsibilities:**
1. Create TypeScript interfaces matching the Rust structs defined here
2. Implement `AnalysisDB` class with these methods:
   - `async saveProject(id: string, database: AnalysisDatabase): Promise<void>`
   - `async loadProject(id: string): Promise<AnalysisDatabase | null>`
   - `async listProjects(): Promise<ProjectMetadata[]>`
   - `async deleteProject(id: string): Promise<void>`
   - `async getProjectSize(id: string): Promise<number>`
3. Handle schema versioning in `onupgradeneeded`
4. Implement compression/decompression for large databases
5. Add error handling for quota exceeded, corrupt databases, etc.

**Inputs from Agent 1 (this doc):**
- Rust struct definitions → TypeScript type definitions
- JSON serialization format → IndexedDB storage format
- Schema version numbers → Migration logic

**Outputs to Agent 3:**
- `AnalysisDB` API documentation
- Example usage code
- Error handling guide

### 7.2 Agent 3: UI Components (React/TypeScript)

**Your Responsibilities:**
1. Create "Project Manager" component:
   - List all saved projects (thumbnail, name, date, size)
   - Open project → load from IndexedDB → call `wasmAnalyzer.import_database()`
   - Delete project → confirm dialog → delete from IndexedDB
   - Create new project → prompt for name → initialize metadata
2. Add "Save Project" functionality:
   - Call `wasmAnalyzer.export_database()` → get JSON
   - Save to IndexedDB via `AnalysisDB.saveProject()`
   - Show success notification
3. Implement auto-save:
   - Save every 5 minutes if analysis changed
   - Show "Saving..." indicator
   - Handle errors gracefully
4. Add import/export buttons:
   - Export → download `.bmproj` JSON file
   - Import → upload `.bmproj` file → validate → load

**Inputs from Agent 2:**
- `AnalysisDB` API
- ProjectMetadata interface
- Error types

**Outputs:**
- User-facing project management UI
- Auto-save system
- Import/export functionality

---

## 8. Performance Considerations

### 8.1 Database Size Estimates

Assuming analysis of a 64KB STM32 firmware:

| Component | Count | Size/Item | Total Size |
|-----------|-------|-----------|------------|
| Xrefs | ~5,000 | 100 bytes | ~500 KB |
| Functions | ~200 | 200 bytes | ~40 KB |
| Comments | ~50 | 150 bytes | ~7.5 KB |
| Symbols | ~300 | 50 bytes | ~15 KB |
| Metadata | 1 | 1 KB | ~1 KB |
| **Total (uncompressed)** | | | **~564 KB** |
| **Total (gzip)** | | | **~100-150 KB** |

**Takeaway:** Database is small enough for client-side storage. IndexedDB quota is typically 50MB+.

### 8.2 Serialization Performance

Benchmarks on typical firmware (approximate):

| Operation | Time | Note |
|-----------|------|------|
| Export to JSON | ~50ms | Rust serde_json is fast |
| Import from JSON | ~100ms | Includes index rebuilding |
| IndexedDB save | ~20ms | Browser-dependent |
| IndexedDB load | ~30ms | Browser-dependent |
| **Total save time** | **~70ms** | Barely noticeable |
| **Total load time** | **~130ms** | Acceptable |

**Optimization:** For very large firmwares (>512KB), consider:
1. Incremental serialization (stream to IndexedDB)
2. Web Workers for serialization (offload from main thread)
3. Lazy loading (only load visible functions/xrefs)

### 8.3 IndexedDB Best Practices

1. **Use transactions**: Batch writes for better performance
2. **Index strategically**: Only index fields used in queries
3. **Avoid large blobs in indexes**: Index metadata, not full database
4. **Monitor quota**: Warn user if approaching storage limit
5. **Handle errors**: Quota exceeded, database corruption, browser incompatibility

---

## 9. Testing Strategy

### 9.1 Unit Tests (Rust)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_database_serialization() {
        let metadata = ProjectMetadata::new(
            "Test Project".to_string(),
            "ARM Cortex-M3".to_string(),
            0x8000000,
            65536,
        );

        let mut db = AnalysisDatabase::new(metadata);

        // Add test data
        db.functions.push(FunctionEntry::new_auto(0x8000100));
        db.comments.push(Comment::new(0x8000200, "Test comment".to_string(), CommentType::Standard));

        // Serialize to JSON
        let json = serde_json::to_string(&db).expect("Serialization failed");

        // Deserialize back
        let db2: AnalysisDatabase = serde_json::from_str(&json).expect("Deserialization failed");

        // Verify data integrity
        assert_eq!(db2.metadata.project_name, "Test Project");
        assert_eq!(db2.functions.len(), 1);
        assert_eq!(db2.comments.len(), 1);
    }

    #[test]
    fn test_schema_migration() {
        // Test migration from v0 to v1
        let mut db = AnalysisDatabase::new(/* ... */);
        db.metadata.schema_version = 0;

        let migrated = DatabaseMigrator::migrate(db).expect("Migration failed");
        assert_eq!(migrated.metadata.schema_version, ProjectMetadata::CURRENT_SCHEMA_VERSION);
    }

    #[test]
    fn test_future_version_rejection() {
        let mut db = AnalysisDatabase::new(/* ... */);
        db.metadata.schema_version = 999;

        let result = DatabaseMigrator::migrate(db);
        assert!(result.is_err());
    }
}
```

### 9.2 Integration Tests (TypeScript)

```typescript
describe('AnalysisDB', () => {
  let db: AnalysisDB;

  beforeEach(async () => {
    db = new AnalysisDB();
    await db.clear(); // Clear test data
  });

  test('save and load project', async () => {
    const projectId = 'test-project-1';
    const database: AnalysisDatabase = {
      metadata: {
        schema_version: 1,
        project_name: 'Test Project',
        // ... other fields
      },
      xrefs: { xrefs: [] },
      functions: [],
      symbols: [],
      comments: [],
      segments: [],
      vector_table: [],
    };

    await db.saveProject(projectId, database);
    const loaded = await db.loadProject(projectId);

    expect(loaded).not.toBeNull();
    expect(loaded!.metadata.project_name).toBe('Test Project');
  });

  test('list projects', async () => {
    await db.saveProject('proj1', createTestDatabase('Project 1'));
    await db.saveProject('proj2', createTestDatabase('Project 2'));

    const projects = await db.listProjects();
    expect(projects).toHaveLength(2);
  });

  test('delete project', async () => {
    const projectId = 'test-project';
    await db.saveProject(projectId, createTestDatabase('Test'));
    await db.deleteProject(projectId);

    const loaded = await db.loadProject(projectId);
    expect(loaded).toBeNull();
  });
});
```

---

## 10. Documentation for Agents

### 10.1 TypeScript Type Definitions

Agent 2 should create this file: `apps/web/src/app/tools/battlemagic/lib/database-types.ts`

```typescript
/**
 * Database schema types matching Rust definitions
 * Auto-generated from packages/battlemagic-analyzer/src/database.rs
 */

export interface ProjectMetadata {
  schema_version: number;
  project_name: string;
  created_at: number;
  modified_at: number;
  architecture: string;
  base_address: number;
  firmware_size: number;
  entry_point: number | null;
  chip_id: string | null;
  description: string | null;
}

export interface FunctionEntry {
  address: number;
  name: string;
  name_is_user_defined: boolean;
  callers: number[];
  callees: number[];
  xref_count: number;
  size: number | null;
  signature: string | null;
  attributes: string[];
}

export enum SymbolType {
  Code = 'Code',
  Data = 'Data',
  Function = 'Function',
  VectorTable = 'VectorTable',
  Import = 'Import',
  Export = 'Export',
}

export interface Symbol {
  address: number;
  name: string;
  symbol_type: SymbolType;
  is_user_defined: boolean;
}

export enum CommentType {
  Standard = 'Standard',
  Repeatable = 'Repeatable',
  Anterior = 'Anterior',
  Block = 'Block',
}

export interface Comment {
  address: number;
  text: string;
  comment_type: CommentType;
  created_at: number;
  modified_at: number;
}

export interface MemorySegment {
  name: string;
  start_address: number;
  end_address: number;
  segment_type: 'Code' | 'Data' | 'Bss' | 'Rodata' | 'Peripheral' | 'Unknown';
  permissions: {
    read: boolean;
    write: boolean;
    execute: boolean;
  };
}

export interface VectorTableEntry {
  vector_number: number;
  handler_address: number;
  handler_name: string;
  is_valid: boolean;
}

export interface XrefDatabaseExport {
  xrefs: CrossReference[];
}

export interface CrossReference {
  from_addr: number;
  to_addr: number;
  xref_type: 'Call' | 'Branch' | 'ConditionalBranch' | 'DataRead' | 'DataWrite';
  instruction: string;
  operands: string;
}

export interface AnalysisDatabase {
  metadata: ProjectMetadata;
  xrefs: XrefDatabaseExport;
  functions: FunctionEntry[];
  symbols: Symbol[];
  comments: Comment[];
  segments: MemorySegment[];
  vector_table: VectorTableEntry[];
}
```

### 10.2 IndexedDB API Specification

Agent 2 should implement this interface: `apps/web/src/app/tools/battlemagic/lib/storage/AnalysisDB.ts`

```typescript
export class AnalysisDB {
  private db: IDBDatabase | null = null;

  /**
   * Open database connection
   */
  async open(): Promise<void>;

  /**
   * Save project to IndexedDB
   */
  async saveProject(projectId: string, database: AnalysisDatabase): Promise<void>;

  /**
   * Load project from IndexedDB
   */
  async loadProject(projectId: string): Promise<AnalysisDatabase | null>;

  /**
   * List all projects (metadata only)
   */
  async listProjects(): Promise<Array<{ id: string; metadata: ProjectMetadata; lastAccessed: number }>>;

  /**
   * Delete project and all associated data
   */
  async deleteProject(projectId: string): Promise<void>;

  /**
   * Get estimated database size for a project
   */
  async getProjectSize(projectId: string): Promise<number>;

  /**
   * Clear all data (for testing)
   */
  async clear(): Promise<void>;
}
```

### 10.3 Usage Example

Agent 3 can use the database like this:

```typescript
// Save current analysis
async function saveCurrentProject() {
  const projectId = currentProjectId || generateUUID();

  // Export from WASM
  const jsonString = wasmAnalyzer.export_database();
  const database: AnalysisDatabase = JSON.parse(jsonString);

  // Save to IndexedDB
  const analysisDB = new AnalysisDB();
  await analysisDB.saveProject(projectId, database);

  showNotification('Project saved successfully');
}

// Load project
async function loadProject(projectId: string) {
  const analysisDB = new AnalysisDB();
  const database = await analysisDB.loadProject(projectId);

  if (!database) {
    showError('Project not found');
    return;
  }

  // Import into WASM
  const jsonString = JSON.stringify(database);
  wasmAnalyzer.import_database(jsonString);

  // Update UI
  setCurrentProjectId(projectId);
  setProjectName(database.metadata.project_name);
}
```

---

## 11. Summary and Next Steps

### What We Designed

1. **Complete database schema** inspired by IDA Pro but optimized for browser storage
2. **Rust structs** for all data types (metadata, functions, xrefs, comments, symbols, segments)
3. **Serialization strategy** using JSON (easy to debug, widely compatible)
4. **WASM API** for export/import operations
5. **IndexedDB schema** for client-side persistence
6. **Version migration framework** for backwards compatibility
7. **Coordination plan** for 3 agents working together

### Agent 1 Deliverables (Your Next Steps)

1. Create `packages/battlemagic-analyzer/src/database.rs`
2. Implement all Rust structs defined in this document
3. Add database state to `ArmAnalyzer` (metadata, functions, comments, etc.)
4. Implement `export_database()` and `import_database()` methods
5. Write unit tests for serialization round-trips
6. Update TypeScript type definitions to match Rust structs
7. Document the API for Agent 2

**Estimated Time:** 4-6 hours of focused work

### Agent 2 Deliverables (IndexedDB Layer)

1. Create TypeScript interfaces matching Rust structs
2. Implement `AnalysisDB` class with CRUD operations
3. Add schema versioning and migration logic
4. Write tests for IndexedDB operations
5. Document API for Agent 3

**Estimated Time:** 3-4 hours

### Agent 3 Deliverables (UI Integration)

1. Create Project Manager component
2. Add Save/Load functionality
3. Implement auto-save
4. Add import/export features
5. Polish UI with loading states, error handling

**Estimated Time:** 4-5 hours

**Total Project Time:** ~12-15 hours across all agents

---

## Appendix A: References

1. **IDA Pro Database Format:**
   - https://github.com/nlitsme/idbutil/blob/master/IDB-FORMAT.md
   - https://hex-rays.com/blog/igors-tip-of-the-week-174-ida-database-idbdetails

2. **IndexedDB Documentation:**
   - https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
   - https://javascript.info/indexeddb

3. **Serde (Rust Serialization):**
   - https://serde.rs/
   - https://docs.rs/serde_json/

4. **WASM Bindgen:**
   - https://rustwasm.github.io/docs/wasm-bindgen/

---

## Appendix B: Future Enhancements

### Type System (Schema v2)
- Add struct/enum definitions for data types
- Allow user to define custom types
- Automatically detect string tables, function pointers, etc.

### Decompiler Integration (Schema v3)
- Store decompiled pseudocode
- Track variable names and types
- Support for high-level control flow

### Collaborative Analysis (Schema v4)
- Multi-user annotations
- Change tracking and attribution
- Merge conflicts resolution

### Differential Analysis (Schema v5)
- Compare two firmware versions
- Highlight added/removed/modified functions
- Track security patches

---

**End of Design Document**
