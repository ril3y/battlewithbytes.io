pub mod arch;
pub mod analyzer;
pub mod chips;
pub mod database;
pub mod traits;
pub mod types;
pub mod xref;

use analyzer::BinaryAnalyzer;
use arch::arm::ArmArchitecture;
use database::{
    AnalysisDatabase, Comment, CommentType, FunctionEntry, ProjectMetadata,
    Symbol, SymbolType, VectorTableEntry, XrefDatabaseExport
};
use types::{Instruction, XrefQueryResult};
#[cfg(test)]
use types::XrefType;
use wasm_bindgen::prelude::*;
use std::collections::HashMap;

/// Main binary analyzer that builds cross-reference database
#[wasm_bindgen]
pub struct ArmAnalyzer {
    inner: BinaryAnalyzer<ArmArchitecture>,

    // Database state for persistence
    metadata: Option<ProjectMetadata>,
    functions: HashMap<u32, FunctionEntry>,
    symbols: HashMap<u32, Symbol>,
    comments: HashMap<u32, Comment>,
    vector_table: Vec<VectorTableEntry>,
}

#[wasm_bindgen]
impl ArmAnalyzer {
    /// Create a new binary analyzer
    #[wasm_bindgen(constructor)]
    pub fn new(base_address: u32) -> ArmAnalyzer {
        #[cfg(feature = "console_errors")]
        console_error_panic_hook::set_once();

        ArmAnalyzer {
            inner: BinaryAnalyzer::new(ArmArchitecture, base_address),
            metadata: None,
            functions: HashMap::new(),
            symbols: HashMap::new(),
            comments: HashMap::new(),
            vector_table: Vec::new(),
        }
    }

    /// Analyze binary from disassembly data
    #[wasm_bindgen]
    pub fn analyze_from_disasm(&mut self, disasm_data: JsValue) -> Result<JsValue, JsValue> {
        // Deserialize JavaScript array to Rust Vec
        let js_instructions: Vec<JsInstruction> = serde_wasm_bindgen::from_value(disasm_data)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse disassembly data: {}", e)))?;

        // Convert to internal instruction format
        let instructions: Vec<Instruction> = js_instructions
            .into_iter()
            .map(|js_instr| {
                Instruction::new(
                    js_instr.address,
                    js_instr.bytes,
                    js_instr.mnemonic,
                    js_instr.operands,
                )
            })
            .collect();

        let results = self.inner.analyze_from_disasm(&instructions);

        // Serialize to JavaScript
        serde_wasm_bindgen::to_value(&results)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize results: {}", e)))
    }

    /// Get all cross-references TO a specific address
    #[wasm_bindgen]
    pub fn get_xrefs_to(&self, address: u32) -> Result<JsValue, JsValue> {
        if !self.inner.is_analyzed() {
            return Err(JsValue::from_str(
                "Binary not analyzed. Call analyze_from_disasm() first.",
            ));
        }

        let xrefs = self.inner.get_xrefs_to(address);
        let result = XrefQueryResult::new(address, xrefs);

        serde_wasm_bindgen::to_value(&result)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize xrefs: {}", e)))
    }

    /// Get all cross-references FROM a specific address
    #[wasm_bindgen]
    pub fn get_xrefs_from(&self, address: u32) -> Result<JsValue, JsValue> {
        if !self.inner.is_analyzed() {
            return Err(JsValue::from_str(
                "Binary not analyzed. Call analyze_from_disasm() first.",
            ));
        }

        let xrefs = self.inner.get_xrefs_from(address);
        let result = XrefQueryResult::new(address, xrefs);

        serde_wasm_bindgen::to_value(&result)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize xrefs: {}", e)))
    }

    /// Get total number of cross-references found
    #[wasm_bindgen]
    pub fn xref_count(&self) -> usize {
        self.inner.xref_count()
    }

    /// Check if binary has been analyzed
    #[wasm_bindgen]
    pub fn is_analyzed(&self) -> bool {
        self.inner.is_analyzed()
    }

    /// Reset analyzer state
    #[wasm_bindgen]
    pub fn reset(&mut self) {
        self.inner.reset();
    }

    /// Analyze binary directly from raw bytes (eliminates Capstone.js dependency)
    ///
    /// This method decodes raw firmware bytes using the built-in ARM Thumb-2 decoder
    /// and performs cross-reference analysis.
    ///
    /// # Arguments
    /// * `bytes` - Raw firmware bytes from GDB memory dump
    ///
    /// # Returns
    /// Analysis results containing all cross-references found
    ///
    /// # Example
    /// ```javascript
    /// const analyzer = new ArmAnalyzer(0x8000);
    /// const firmwareBytes = new Uint8Array([...]);
    /// const results = analyzer.analyze_from_bytes(firmwareBytes);
    /// ```
    #[wasm_bindgen]
    pub fn analyze_from_bytes(&mut self, bytes: &[u8]) -> Result<JsValue, JsValue> {
        let results = self.inner.analyze_from_bytes(bytes);

        // Serialize to JavaScript
        serde_wasm_bindgen::to_value(&results)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize results: {}", e)))
    }

    // ========================================================================
    // Database Export/Import
    // ========================================================================

    /// Export complete analysis database as JSON string
    ///
    /// This serializes all analysis data (xrefs, functions, comments, etc.)
    /// for storage in IndexedDB. Returns JSON string that can be saved.
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
    ///
    /// This loads a previously saved database and restores all analysis state.
    /// Validates schema version and applies migrations if needed.
    #[wasm_bindgen]
    pub fn import_database(&mut self, json: &str) -> Result<(), JsValue> {
        // Deserialize from JSON
        let db: AnalysisDatabase = serde_json::from_str(json)
            .map_err(|e| JsValue::from_str(&format!("Deserialization failed: {}", e)))?;

        // Validate and migrate schema if needed
        let db = database::DatabaseMigrator::migrate(db)
            .map_err(|e| JsValue::from_str(&format!("Migration failed: {}", e)))?;

        // Load database into analyzer
        self.load_database(db)?;

        Ok(())
    }

    /// Get database statistics (for UI display)
    #[wasm_bindgen]
    pub fn get_database_stats(&self) -> Result<JsValue, JsValue> {
        if !self.inner.is_analyzed() {
            return Err(JsValue::from_str("No analysis available"));
        }

        let db = self.build_database();
        let stats = db.stats();

        serde_wasm_bindgen::to_value(&stats)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize stats: {}", e)))
    }

    // ========================================================================
    // Project Metadata
    // ========================================================================

    /// Get project metadata
    #[wasm_bindgen]
    pub fn get_metadata(&self) -> Result<JsValue, JsValue> {
        if let Some(ref metadata) = self.metadata {
            serde_wasm_bindgen::to_value(metadata)
                .map_err(|e| JsValue::from_str(&format!("Serialization failed: {}", e)))
        } else {
            Err(JsValue::from_str("No metadata available"))
        }
    }

    /// Set project metadata
    #[wasm_bindgen]
    pub fn set_metadata(&mut self, metadata_js: JsValue) -> Result<(), JsValue> {
        let metadata: ProjectMetadata = serde_wasm_bindgen::from_value(metadata_js)
            .map_err(|e| JsValue::from_str(&format!("Deserialization failed: {}", e)))?;

        self.metadata = Some(metadata);
        Ok(())
    }

    /// Initialize metadata with basic info
    #[wasm_bindgen]
    pub fn init_metadata(
        &mut self,
        project_name: String,
        architecture: String,
        base_address: u32,
        firmware_size: u32,
    ) {
        self.metadata = Some(ProjectMetadata::new(
            project_name,
            architecture,
            base_address,
            firmware_size,
        ));
    }

    // ========================================================================
    // Function Operations
    // ========================================================================

    /// Get function at specific address
    #[wasm_bindgen]
    pub fn get_function(&self, address: u32) -> Result<JsValue, JsValue> {
        if let Some(func) = self.functions.get(&address) {
            serde_wasm_bindgen::to_value(func)
                .map_err(|e| JsValue::from_str(&format!("Serialization failed: {}", e)))
        } else {
            Err(JsValue::from_str(&format!(
                "No function at 0x{:X}",
                address
            )))
        }
    }

    /// Rename function (marks as user-defined)
    #[wasm_bindgen]
    pub fn rename_function(&mut self, address: u32, new_name: String) -> Result<(), JsValue> {
        if let Some(func) = self.functions.get_mut(&address) {
            func.rename(new_name);
            Ok(())
        } else {
            Err(JsValue::from_str(&format!(
                "No function at 0x{:X}",
                address
            )))
        }
    }

    /// Get all functions
    #[wasm_bindgen]
    pub fn get_all_functions(&self) -> Result<JsValue, JsValue> {
        let funcs: Vec<&FunctionEntry> = self.functions.values().collect();
        serde_wasm_bindgen::to_value(&funcs)
            .map_err(|e| JsValue::from_str(&format!("Serialization failed: {}", e)))
    }

    // ========================================================================
    // Comment Operations
    // ========================================================================

    /// Add or update comment at address
    #[wasm_bindgen]
    pub fn add_comment(
        &mut self,
        address: u32,
        text: String,
        comment_type_str: &str,
    ) -> Result<(), JsValue> {
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

    /// Get comment at address
    #[wasm_bindgen]
    pub fn get_comment(&self, address: u32) -> Result<JsValue, JsValue> {
        if let Some(comment) = self.comments.get(&address) {
            serde_wasm_bindgen::to_value(comment)
                .map_err(|e| JsValue::from_str(&format!("Serialization failed: {}", e)))
        } else {
            Err(JsValue::from_str(&format!(
                "No comment at 0x{:X}",
                address
            )))
        }
    }

    /// Delete comment at address
    #[wasm_bindgen]
    pub fn delete_comment(&mut self, address: u32) -> Result<(), JsValue> {
        if self.comments.remove(&address).is_some() {
            Ok(())
        } else {
            Err(JsValue::from_str(&format!(
                "No comment at 0x{:X}",
                address
            )))
        }
    }

    // ========================================================================
    // Symbol Operations
    // ========================================================================

    /// Add symbol at address
    #[wasm_bindgen]
    pub fn add_symbol(
        &mut self,
        address: u32,
        name: String,
        symbol_type_str: &str,
    ) -> Result<(), JsValue> {
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

    /// Get symbol at address
    #[wasm_bindgen]
    pub fn get_symbol(&self, address: u32) -> Result<JsValue, JsValue> {
        if let Some(symbol) = self.symbols.get(&address) {
            serde_wasm_bindgen::to_value(symbol)
                .map_err(|e| JsValue::from_str(&format!("Serialization failed: {}", e)))
        } else {
            Err(JsValue::from_str(&format!(
                "No symbol at 0x{:X}",
                address
            )))
        }
    }

    // ========================================================================
    // Internal Helper Methods
    // ========================================================================

    /// Build AnalysisDatabase from current analyzer state
    fn build_database(&self) -> AnalysisDatabase {
        // Use metadata or create default
        let metadata = self.metadata.clone().unwrap_or_else(|| {
            ProjectMetadata::new(
                "Untitled Project".to_string(),
                "ARM Cortex-M".to_string(),
                0,
                0,
            )
        });

        // Export xrefs from XrefDatabase
        let xrefs = XrefDatabaseExport::from_xref_db(self.inner.get_xref_db());

        // Convert HashMaps to Vecs
        let functions: Vec<FunctionEntry> = self.functions.values().cloned().collect();
        let symbols: Vec<Symbol> = self.symbols.values().cloned().collect();
        let comments: Vec<Comment> = self.comments.values().cloned().collect();

        AnalysisDatabase {
            metadata,
            xrefs,
            functions,
            symbols,
            comments,
            segments: Vec::new(), // TODO: Add segment detection
            vector_table: self.vector_table.clone(),
        }
    }

    /// Load database into analyzer state
    fn load_database(&mut self, db: AnalysisDatabase) -> Result<(), JsValue> {
        // Load metadata
        self.metadata = Some(db.metadata);

        // Load xrefs into XrefDatabase
        let xref_db = db.xrefs.into_xref_db();
        self.inner.load_xref_db(xref_db);

        // Load functions
        self.functions.clear();
        for func in db.functions {
            self.functions.insert(func.address, func);
        }

        // Load symbols
        self.symbols.clear();
        for symbol in db.symbols {
            self.symbols.insert(symbol.address, symbol);
        }

        // Load comments
        self.comments.clear();
        for comment in db.comments {
            self.comments.insert(comment.address, comment);
        }

        // Load vector table
        self.vector_table = db.vector_table;

        Ok(())
    }
}

// Note: Backward compatibility is maintained through same WASM API
// JavaScript code can still use either BinaryAnalyzer or ArmAnalyzer name

/// JavaScript instruction format (for deserialization)
#[derive(serde::Deserialize)]
struct JsInstruction {
    address: u32,
    bytes: Vec<u8>,
    mnemonic: String,
    operands: String,
}

/// Initialize WASM module
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_errors")]
    console_error_panic_hook::set_once();
}

// Export types for TypeScript
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "{ address: number; bytes: number[]; mnemonic: string; operands: string; }")]
    pub type JsInstructionType;

    #[wasm_bindgen(typescript_type = "{ from_addr: number; to_addr: number; xref_type: string; instruction: string; operands: string; }")]
    pub type CrossReferenceType;

    #[wasm_bindgen(typescript_type = "{ xrefs: CrossReferenceType[]; total_instructions: number; analysis_time_ms: number; unique_targets: number; start_address: number; end_address: number; }")]
    pub type AnalysisResultsType;

    #[wasm_bindgen(typescript_type = "{ address: number; xrefs: CrossReferenceType[]; count: number; }")]
    pub type XrefQueryResultType;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_analyzer_creation() {
        let analyzer = ArmAnalyzer::new(0x8000);
        assert_eq!(analyzer.is_analyzed(), false);
        assert_eq!(analyzer.xref_count(), 0);
    }

    #[test]
    fn test_analyzer_reset() {
        let mut analyzer = ArmAnalyzer::new(0x8000);
        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "bl".to_string(), "#0x2000".to_string()),
        ];
        analyzer.inner.analyze_from_disasm(&instructions);
        assert!(analyzer.is_analyzed());

        analyzer.reset();
        assert_eq!(analyzer.is_analyzed(), false);
    }

    #[test]
    fn test_branch_detection() {
        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "b".to_string(), "#0x2000".to_string()),
            Instruction::new(0x1004, vec![0, 0, 0, 0], "b.eq".to_string(), "#0x2004".to_string()),
            Instruction::new(0x1008, vec![0, 0, 0, 0], "b.ne".to_string(), "#0x2008".to_string()),
            Instruction::new(0x100c, vec![0, 0, 0, 0], "bic".to_string(), "r0, r1".to_string()),
        ];

        let mut analyzer = ArmAnalyzer::new(0x1000);
        let results = analyzer.inner.analyze_from_disasm(&instructions);

        // Should detect 3 branches (b, b.eq, b.ne) but not bic
        assert_eq!(results.xrefs.len(), 3);
    }

    #[test]
    fn test_call_detection() {
        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "bl".to_string(), "#0x2000".to_string()),
            Instruction::new(0x1004, vec![0, 0, 0, 0], "blx".to_string(), "#0x2100".to_string()),
            Instruction::new(0x1008, vec![0, 0, 0, 0], "mov".to_string(), "r0, r1".to_string()),
        ];

        let mut analyzer = ArmAnalyzer::new(0x1000);
        let results = analyzer.inner.analyze_from_disasm(&instructions);

        assert_eq!(results.xrefs.len(), 2);
        assert_eq!(results.xrefs[0].xref_type, XrefType::Call);
        assert_eq!(results.xrefs[0].to_addr, 0x2000);
        assert_eq!(results.xrefs[1].xref_type, XrefType::Call);
        assert_eq!(results.xrefs[1].to_addr, 0x2100);
    }

    #[test]
    fn test_data_reference_parsing() {
        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "ldr".to_string(), "r0, [pc, #0x10]".to_string()),
            Instruction::new(0x1004, vec![0, 0, 0, 0], "str".to_string(), "r1, [pc, #0x20]".to_string()),
            Instruction::new(0x1008, vec![0, 0, 0, 0], "ldr".to_string(), "r2, [r3, #0x4]".to_string()),
        ];

        let mut analyzer = ArmAnalyzer::new(0x1000);
        let results = analyzer.inner.analyze_from_disasm(&instructions);

        // Should detect 2 PC-relative refs
        assert_eq!(results.xrefs.len(), 2);
        assert_eq!(results.xrefs[0].xref_type, XrefType::DataRead);
        assert_eq!(results.xrefs[0].to_addr, 0x1000 + 8 + 0x10);
        assert_eq!(results.xrefs[1].xref_type, XrefType::DataWrite);
        assert_eq!(results.xrefs[1].to_addr, 0x1004 + 8 + 0x20);
    }

    #[test]
    fn test_pc_relative_calculation() {
        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "ldr".to_string(), "r0, [pc, #0x100]".to_string()),
            Instruction::new(0x2000, vec![0, 0, 0, 0], "ldr".to_string(), "r1, [pc, #-0x8]".to_string()),
            Instruction::new(0x3000, vec![0, 0, 0, 0], "ldr".to_string(), "r2, [pc, #16]".to_string()),
        ];

        let mut analyzer = ArmAnalyzer::new(0x1000);
        let results = analyzer.inner.analyze_from_disasm(&instructions);

        assert_eq!(results.xrefs.len(), 3);
        assert_eq!(results.xrefs[0].to_addr, 0x1108);
        assert_eq!(results.xrefs[1].to_addr, 0x2000);
        assert_eq!(results.xrefs[2].to_addr, 0x3018);
    }

    #[test]
    fn test_empty_input() {
        let instructions: Vec<Instruction> = vec![];
        let mut analyzer = ArmAnalyzer::new(0x1000);
        let results = analyzer.inner.analyze_from_disasm(&instructions);

        assert_eq!(results.xrefs.len(), 0);
        assert_eq!(results.total_instructions, 0);
    }

    #[test]
    fn test_invalid_address_formats() {
        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "bl".to_string(), "invalid".to_string()),
            Instruction::new(0x1004, vec![0, 0, 0, 0], "b".to_string(), "#".to_string()),
            Instruction::new(0x1008, vec![0, 0, 0, 0], "b".to_string(), "".to_string()),
        ];

        let mut analyzer = ArmAnalyzer::new(0x1000);
        let results = analyzer.inner.analyze_from_disasm(&instructions);

        // Should not crash, just skip invalid addresses
        assert_eq!(results.xrefs.len(), 0);
    }

    #[test]
    fn test_large_binary() {
        let mut instructions = Vec::new();
        for i in 0..10000 {
            let addr = 0x8000 + (i * 4);
            let target = 0x10000 + (i * 4);
            instructions.push(Instruction::new(
                addr,
                vec![0, 0, 0, 0],
                "bl".to_string(),
                format!("#0x{:x}", target),
            ));
        }

        let mut analyzer = ArmAnalyzer::new(0x8000);
        let results = analyzer.inner.analyze_from_disasm(&instructions);

        assert_eq!(results.xrefs.len(), 10000);

        // Test that lookups still work
        let xrefs_from = analyzer.inner.get_xrefs_from(0x8000);
        assert_eq!(xrefs_from.len(), 1);
        assert_eq!(xrefs_from[0].to_addr, 0x10000);
    }

    #[test]
    fn test_xref_queries() {
        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "bl".to_string(), "#0x2000".to_string()),
            Instruction::new(0x1010, vec![0, 0, 0, 0], "bl".to_string(), "#0x2000".to_string()),
            Instruction::new(0x1020, vec![0, 0, 0, 0], "b".to_string(), "#0x2000".to_string()),
            Instruction::new(0x3000, vec![0, 0, 0, 0], "bl".to_string(), "#0x4000".to_string()),
            Instruction::new(0x3000, vec![0, 0, 0, 0], "b.eq".to_string(), "#0x5000".to_string()),
        ];

        let mut analyzer = ArmAnalyzer::new(0x1000);
        analyzer.inner.analyze_from_disasm(&instructions);

        // Test xrefs_to
        let xrefs_to_2000 = analyzer.inner.get_xrefs_to(0x2000);
        assert_eq!(xrefs_to_2000.len(), 3);

        // Test xrefs_from
        let xrefs_from_3000 = analyzer.inner.get_xrefs_from(0x3000);
        assert_eq!(xrefs_from_3000.len(), 2);

        // Test non-existent address
        let xrefs_to_9999 = analyzer.inner.get_xrefs_to(0x9999);
        assert_eq!(xrefs_to_9999.len(), 0);
    }

    #[test]
    fn test_mixed_instruction_types() {
        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "bl".to_string(), "#0x2000".to_string()),
            Instruction::new(0x1004, vec![0, 0, 0, 0], "b.eq".to_string(), "#0x2004".to_string()),
            Instruction::new(0x1008, vec![0, 0, 0, 0], "ldr".to_string(), "r0, [pc, #0x10]".to_string()),
            Instruction::new(0x100c, vec![0, 0, 0, 0], "mov".to_string(), "r0, r1".to_string()),
            Instruction::new(0x1010, vec![0, 0, 0, 0], "str".to_string(), "r2, [pc, #0x20]".to_string()),
            Instruction::new(0x1014, vec![0, 0, 0, 0], "blx".to_string(), "#0x3000".to_string()),
        ];

        let mut analyzer = ArmAnalyzer::new(0x1000);
        let results = analyzer.inner.analyze_from_disasm(&instructions);

        assert_eq!(results.xrefs.len(), 5); // All except mov

        let call_count = results.xrefs.iter().filter(|x| x.xref_type == XrefType::Call).count();
        let branch_count = results.xrefs.iter().filter(|x| x.xref_type == XrefType::ConditionalBranch).count();
        let data_read_count = results.xrefs.iter().filter(|x| x.xref_type == XrefType::DataRead).count();
        let data_write_count = results.xrefs.iter().filter(|x| x.xref_type == XrefType::DataWrite).count();

        assert_eq!(call_count, 2);
        assert_eq!(branch_count, 1);
        assert_eq!(data_read_count, 1);
        assert_eq!(data_write_count, 1);
    }

    #[test]
    fn test_address_edge_cases() {
        let instructions = vec![
            Instruction::new(0x0, vec![0, 0, 0, 0], "bl".to_string(), "#0x1000".to_string()),
            Instruction::new(0xFFFFFFFC, vec![0, 0, 0, 0], "b".to_string(), "#0xFFFFFF00".to_string()),
            Instruction::new(0xFFFFFFF0, vec![0, 0, 0, 0], "ldr".to_string(), "r0, [pc, #0x100]".to_string()),
        ];

        let mut analyzer = ArmAnalyzer::new(0x1000);
        let results = analyzer.inner.analyze_from_disasm(&instructions);

        // Should handle edge cases without panicking
        assert!(results.xrefs.len() >= 2);
    }
}
