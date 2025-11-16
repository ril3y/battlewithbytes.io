pub mod arch;
pub mod analyzer;
pub mod traits;
pub mod types;
pub mod xref;

use analyzer::BinaryAnalyzer;
use arch::arm::ArmArchitecture;
use types::{Instruction, XrefQueryResult};
#[cfg(test)]
use types::XrefType;
use wasm_bindgen::prelude::*;

/// Main binary analyzer that builds cross-reference database
#[wasm_bindgen]
pub struct ArmAnalyzer {
    inner: BinaryAnalyzer<ArmArchitecture>,
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
