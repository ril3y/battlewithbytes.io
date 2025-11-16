//! Analysis database schema and serialization
//!
//! This module defines the persistent database schema for BattleMagic analysis results.
//! All structs are serializable to JSON for storage in IndexedDB.
//!
//! Design inspired by IDA Pro's .idb format, optimized for browser storage.

use crate::types::CrossReference;
use crate::xref::XrefDatabase;
use serde::{Deserialize, Serialize};

// ============================================================================
// Timestamp utilities (WASM-compatible)
// ============================================================================

/// Get current timestamp in milliseconds since epoch
/// Note: In WASM, we can't use std::time, so this is a placeholder
/// JavaScript will provide timestamps via API calls
#[cfg(not(target_arch = "wasm32"))]
fn current_timestamp() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

#[cfg(target_arch = "wasm32")]
fn current_timestamp() -> u64 {
    // In WASM, timestamp will be set by JavaScript
    // Return 0 as placeholder - caller should set proper timestamp
    0
}

// ============================================================================
// Project Metadata
// ============================================================================

/// Top-level project metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectMetadata {
    /// Schema version for migrations
    pub schema_version: u32,

    /// Project name (user-editable)
    pub project_name: String,

    /// Creation timestamp (Unix epoch milliseconds)
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

    /// Create new project metadata
    pub fn new(
        project_name: String,
        architecture: String,
        base_address: u32,
        firmware_size: u32,
    ) -> Self {
        let now = current_timestamp();

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

    /// Update modification timestamp
    pub fn touch(&mut self) {
        self.modified_at = current_timestamp();
    }
}

// ============================================================================
// Function Table
// ============================================================================

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

    /// Add a caller to this function
    pub fn add_caller(&mut self, caller_addr: u32) {
        if !self.callers.contains(&caller_addr) {
            self.callers.push(caller_addr);
        }
    }

    /// Add a callee from this function
    pub fn add_callee(&mut self, callee_addr: u32) {
        if !self.callees.contains(&callee_addr) {
            self.callees.push(callee_addr);
        }
    }
}

// ============================================================================
// Symbol Table
// ============================================================================

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

    pub fn new_user_defined(address: u32, name: String, symbol_type: SymbolType) -> Self {
        Self {
            address,
            name,
            symbol_type,
            is_user_defined: true,
        }
    }
}

// ============================================================================
// Comment Table
// ============================================================================

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

    pub fn update_text(&mut self, new_text: String) {
        self.text = new_text;
        self.modified_at = current_timestamp();
    }
}

// ============================================================================
// Memory Map
// ============================================================================

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
    pub fn new(
        name: String,
        start_address: u32,
        end_address: u32,
        segment_type: SegmentType,
        permissions: SegmentPermissions,
    ) -> Self {
        Self {
            name,
            start_address,
            end_address,
            segment_type,
            permissions,
        }
    }

    pub fn size(&self) -> u32 {
        self.end_address - self.start_address
    }

    pub fn contains(&self, address: u32) -> bool {
        address >= self.start_address && address < self.end_address
    }
}

impl SegmentPermissions {
    pub fn read_only() -> Self {
        Self {
            read: true,
            write: false,
            execute: false,
        }
    }

    pub fn read_write() -> Self {
        Self {
            read: true,
            write: true,
            execute: false,
        }
    }

    pub fn read_execute() -> Self {
        Self {
            read: true,
            write: false,
            execute: true,
        }
    }
}

// ============================================================================
// Vector Table (ARM Cortex-M)
// ============================================================================

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
    pub fn new(vector_number: u32, handler_address: u32) -> Self {
        let handler_name = Self::default_name(vector_number).to_string();
        let is_valid = handler_address != 0 && handler_address != 0xFFFFFFFF;

        Self {
            vector_number,
            handler_address,
            handler_name,
            is_valid,
        }
    }

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
            _ if vector_number >= 16 => "IRQHandler",
            _ => "Reserved",
        }
    }
}

// ============================================================================
// XrefDatabase Export (for serialization)
// ============================================================================

/// Wrapper for serializing XrefDatabase
#[derive(Debug, Serialize, Deserialize)]
pub struct XrefDatabaseExport {
    /// All cross-references
    pub xrefs: Vec<CrossReference>,
}

impl XrefDatabaseExport {
    pub fn new(xrefs: Vec<CrossReference>) -> Self {
        Self { xrefs }
    }

    pub fn from_xref_db(db: &XrefDatabase) -> Self {
        Self {
            xrefs: db.get_all_xrefs().clone(),
        }
    }

    pub fn into_xref_db(self) -> XrefDatabase {
        let mut db = XrefDatabase::with_capacity(self.xrefs.len());

        for xref in self.xrefs {
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

// ============================================================================
// Analysis Database (Top-Level)
// ============================================================================

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

    /// Get statistics for UI display
    pub fn stats(&self) -> DatabaseStats {
        DatabaseStats {
            xref_count: self.xrefs.xrefs.len(),
            function_count: self.functions.len(),
            symbol_count: self.symbols.len(),
            comment_count: self.comments.len(),
            segment_count: self.segments.len(),
            vector_table_size: self.vector_table.len(),
            estimated_size_bytes: self.estimated_size_bytes(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseStats {
    pub xref_count: usize,
    pub function_count: usize,
    pub symbol_count: usize,
    pub comment_count: usize,
    pub segment_count: usize,
    pub vector_table_size: usize,
    pub estimated_size_bytes: usize,
}

// ============================================================================
// Database Migrator (for schema versioning)
// ============================================================================

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
                // Add future migrations here
                // 1 => Self::migrate_1_to_2(db)?,
                _ => {
                    return Err(format!("Unknown migration path from version {}", version))
                }
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
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::XrefType;

    #[test]
    fn test_project_metadata_creation() {
        let metadata = ProjectMetadata::new(
            "Test Project".to_string(),
            "ARM Cortex-M3".to_string(),
            0x8000000,
            65536,
        );

        assert_eq!(metadata.project_name, "Test Project");
        assert_eq!(metadata.architecture, "ARM Cortex-M3");
        assert_eq!(metadata.base_address, 0x8000000);
        assert_eq!(metadata.firmware_size, 65536);
        assert_eq!(metadata.schema_version, ProjectMetadata::CURRENT_SCHEMA_VERSION);
    }

    #[test]
    fn test_function_entry() {
        let mut func = FunctionEntry::new_auto(0x8000100);

        assert_eq!(func.name, "sub_8000100");
        assert!(!func.name_is_user_defined);

        func.rename("my_function".to_string());
        assert_eq!(func.name, "my_function");
        assert!(func.name_is_user_defined);

        func.add_caller(0x8000200);
        func.add_caller(0x8000200); // Duplicate should be ignored
        assert_eq!(func.callers.len(), 1);
    }

    #[test]
    fn test_symbol_creation() {
        let symbol = Symbol::new(0x8000000, "Reset_Handler".to_string(), SymbolType::Function);

        assert_eq!(symbol.address, 0x8000000);
        assert_eq!(symbol.name, "Reset_Handler");
        assert_eq!(symbol.symbol_type, SymbolType::Function);
        assert!(!symbol.is_user_defined);
    }

    #[test]
    fn test_comment_creation() {
        let comment = Comment::new(
            0x8000100,
            "This is a test comment".to_string(),
            CommentType::Standard,
        );

        assert_eq!(comment.address, 0x8000100);
        assert_eq!(comment.text, "This is a test comment");
        assert_eq!(comment.comment_type, CommentType::Standard);
    }

    #[test]
    fn test_memory_segment() {
        let segment = MemorySegment::new(
            "FLASH".to_string(),
            0x8000000,
            0x8010000,
            SegmentType::Code,
            SegmentPermissions::read_execute(),
        );

        assert_eq!(segment.size(), 0x10000);
        assert!(segment.contains(0x8000100));
        assert!(!segment.contains(0x7FFFFFF));
        assert!(!segment.contains(0x8010000));
    }

    #[test]
    fn test_vector_table_entry() {
        let entry = VectorTableEntry::new(1, 0x8000101);

        assert_eq!(entry.vector_number, 1);
        assert_eq!(entry.handler_address, 0x8000101);
        assert_eq!(entry.handler_name, "Reset_Handler");
        assert!(entry.is_valid);

        let invalid_entry = VectorTableEntry::new(2, 0);
        assert!(!invalid_entry.is_valid);
    }

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
        db.comments.push(Comment::new(
            0x8000200,
            "Test comment".to_string(),
            CommentType::Standard,
        ));

        // Serialize to JSON
        let json = serde_json::to_string(&db).expect("Serialization failed");

        // Deserialize back
        let db2: AnalysisDatabase =
            serde_json::from_str(&json).expect("Deserialization failed");

        // Verify data integrity
        assert_eq!(db2.metadata.project_name, "Test Project");
        assert_eq!(db2.functions.len(), 1);
        assert_eq!(db2.comments.len(), 1);
    }

    #[test]
    fn test_xref_database_export() {
        let mut xrefs = Vec::new();
        xrefs.push(CrossReference::new(
            0x8000100,
            0x8000200,
            XrefType::Call,
            "bl".to_string(),
            "#0x8000200".to_string(),
        ));

        let export = XrefDatabaseExport::new(xrefs.clone());

        // Serialize and deserialize
        let json = serde_json::to_string(&export).expect("Serialization failed");
        let export2: XrefDatabaseExport =
            serde_json::from_str(&json).expect("Deserialization failed");

        assert_eq!(export2.xrefs.len(), 1);
        assert_eq!(export2.xrefs[0].from_addr, 0x8000100);
        assert_eq!(export2.xrefs[0].to_addr, 0x8000200);
    }

    #[test]
    fn test_database_migration() {
        let metadata = ProjectMetadata::new(
            "Test".to_string(),
            "ARM".to_string(),
            0x8000000,
            65536,
        );

        let mut db = AnalysisDatabase::new(metadata);
        db.metadata.schema_version = 0; // Pretend it's old version

        let migrated = DatabaseMigrator::migrate(db).expect("Migration failed");
        assert_eq!(
            migrated.metadata.schema_version,
            ProjectMetadata::CURRENT_SCHEMA_VERSION
        );
    }

    #[test]
    fn test_future_version_rejection() {
        let metadata = ProjectMetadata::new(
            "Test".to_string(),
            "ARM".to_string(),
            0x8000000,
            65536,
        );

        let mut db = AnalysisDatabase::new(metadata);
        db.metadata.schema_version = 999; // Future version

        let result = DatabaseMigrator::migrate(db);
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("newer than supported version"));
    }

    #[test]
    fn test_database_stats() {
        let metadata = ProjectMetadata::new(
            "Test".to_string(),
            "ARM".to_string(),
            0x8000000,
            65536,
        );

        let mut db = AnalysisDatabase::new(metadata);
        db.functions.push(FunctionEntry::new_auto(0x8000100));
        db.functions.push(FunctionEntry::new_auto(0x8000200));
        db.comments.push(Comment::new(
            0x8000300,
            "Comment".to_string(),
            CommentType::Standard,
        ));

        let stats = db.stats();
        assert_eq!(stats.function_count, 2);
        assert_eq!(stats.comment_count, 1);
        assert!(stats.estimated_size_bytes > 0);
    }
}
