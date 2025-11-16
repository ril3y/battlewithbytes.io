//! Generic binary analyzer parameterized by architecture

use crate::traits::{Architecture, Instruction as TraitInstruction};
use crate::types::{AnalysisResults, CrossReference as TypesXref, Instruction};
use crate::xref::XrefDatabase;

/// Generic binary analyzer supporting multiple architectures
///
/// This analyzer is parameterized by an Architecture implementation,
/// allowing it to analyze binaries from different instruction sets
/// using the same core logic.
pub struct BinaryAnalyzer<A: Architecture> {
    /// Architecture-specific decoder and analyzer
    arch: A,

    /// Cross-reference database
    xref_db: XrefDatabase,

    /// Base address of the binary
    base_address: u32,

    /// Analysis state flag
    is_analyzed: bool,
}

impl<A: Architecture> BinaryAnalyzer<A> {
    /// Create a new analyzer with the given architecture
    pub fn new(arch: A, base_address: u32) -> Self {
        Self {
            arch,
            xref_db: XrefDatabase::new(),
            base_address,
            is_analyzed: false,
        }
    }

    /// Analyze binary from pre-disassembled instructions
    ///
    /// This is the main entry point for analysis. It accepts instructions
    /// that have already been disassembled (e.g., by Capstone in JavaScript)
    /// and performs cross-reference extraction using the architecture-specific
    /// implementation.
    pub fn analyze_from_disasm(&mut self, instructions: &[Instruction]) -> AnalysisResults {
        // Clear previous analysis
        self.xref_db.clear();

        // Pre-allocate capacity
        self.xref_db = XrefDatabase::with_capacity(instructions.len());

        // Convert to trait instructions and extract xrefs
        for instr in instructions {
            // Convert types::Instruction to traits::Instruction
            let trait_instr = TraitInstruction::new(
                instr.address,
                instr.bytes.clone(),
                instr.mnemonic.clone(),
                instr.operands.clone(),
            );

            // Ask architecture to extract xrefs
            let xref_infos = self.arch.extract_xrefs(&trait_instr);

            // Add to database
            for xref_info in xref_infos {
                self.xref_db.add_xref(
                    xref_info.from_addr,
                    xref_info.to_addr,
                    xref_info.xref_type,
                    &xref_info.instruction,
                    &xref_info.operands,
                );
            }
        }

        // Build indices for fast queries
        self.xref_db.build_indices();

        self.is_analyzed = true;

        // Convert trait xrefs to types xrefs for serialization
        let xrefs: Vec<TypesXref> = self.xref_db.get_all_xrefs().iter().map(|xref| {
            TypesXref::new(
                xref.from_addr,
                xref.to_addr,
                xref.xref_type,
                xref.instruction.clone(),
                xref.operands.clone(),
            )
        }).collect();

        // Create results
        // Note: elapsed_ms set to 0 in WASM (timing not available)
        AnalysisResults::new(
            xrefs,
            instructions.len(),
            0, // elapsed_ms
            instructions.first().map(|i| i.address).unwrap_or(self.base_address),
            instructions.last().map(|i| i.address).unwrap_or(self.base_address),
        )
    }

    /// Get cross-references targeting a specific address
    pub fn get_xrefs_to(&self, address: u32) -> Vec<TypesXref> {
        self.xref_db.get_xrefs_to(address).iter().map(|xref| {
            TypesXref::new(
                xref.from_addr,
                xref.to_addr,
                xref.xref_type,
                xref.instruction.clone(),
                xref.operands.clone(),
            )
        }).collect()
    }

    /// Get cross-references originating from a specific address
    pub fn get_xrefs_from(&self, address: u32) -> Vec<TypesXref> {
        self.xref_db.get_xrefs_from(address).iter().map(|xref| {
            TypesXref::new(
                xref.from_addr,
                xref.to_addr,
                xref.xref_type,
                xref.instruction.clone(),
                xref.operands.clone(),
            )
        }).collect()
    }

    /// Get total number of cross-references
    pub fn xref_count(&self) -> usize {
        self.xref_db.count()
    }

    /// Check if binary has been analyzed
    pub fn is_analyzed(&self) -> bool {
        self.is_analyzed
    }

    /// Get architecture name
    pub fn architecture(&self) -> &'static str {
        self.arch.name()
    }

    /// Reset analyzer state
    pub fn reset(&mut self) {
        self.xref_db.clear();
        self.is_analyzed = false;
    }

    /// Analyze binary directly from raw bytes
    ///
    /// This method decodes instructions from raw bytes using the architecture's
    /// decoder and then performs cross-reference analysis. This eliminates the
    /// need for an external disassembler like Capstone.js.
    ///
    /// # Arguments
    /// * `bytes` - Raw binary bytes (firmware dump from GDB)
    ///
    /// # Returns
    /// Complete analysis results
    ///
    /// # Example
    /// ```rust
    /// use battlemagic_analyzer::analyzer::BinaryAnalyzer;
    /// use battlemagic_analyzer::arch::arm::ArmArchitecture;
    ///
    /// let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, 0x8000);
    /// let firmware_bytes = &[0x10, 0xB5, 0x00, 0xF0, 0x10, 0xF8]; // push {r4, lr}; bl ...
    /// let results = analyzer.analyze_from_bytes(firmware_bytes);
    /// ```
    pub fn analyze_from_bytes(&mut self, bytes: &[u8]) -> AnalysisResults {
        // Clear previous analysis
        self.xref_db.clear();

        let mut instructions = Vec::new();
        let mut offset = 0;
        let alignment = self.arch.instruction_alignment();

        // Decode all instructions
        while offset < bytes.len() {
            let addr = self.base_address + (offset as u32);
            let remaining = &bytes[offset..];

            // Try to decode instruction at current position
            if let Some(instr) = self.arch.decode(remaining, addr) {
                let instr_size = instr.size;

                // Extract cross-references from this instruction
                let xref_infos = self.arch.extract_xrefs(&instr);

                // Add to database
                for xref_info in xref_infos {
                    self.xref_db.add_xref(
                        xref_info.from_addr,
                        xref_info.to_addr,
                        xref_info.xref_type,
                        &xref_info.instruction,
                        &xref_info.operands,
                    );
                }

                // Track decoded instruction for statistics
                instructions.push(instr);

                // Move to next instruction
                offset += instr_size;
            } else {
                // Failed to decode - skip by alignment
                offset += alignment;
            }
        }

        // Build indices for fast queries
        self.xref_db.build_indices();
        self.is_analyzed = true;

        // Convert trait xrefs to types xrefs for serialization
        let xrefs: Vec<TypesXref> = self.xref_db.get_all_xrefs().iter().map(|xref| {
            TypesXref::new(
                xref.from_addr,
                xref.to_addr,
                xref.xref_type,
                xref.instruction.clone(),
                xref.operands.clone(),
            )
        }).collect();

        // Create results
        // Note: elapsed_ms set to 0 in WASM (timing not available)
        AnalysisResults::new(
            xrefs,
            instructions.len(),
            0, // elapsed_ms
            instructions.first().map(|i| i.address).unwrap_or(self.base_address),
            instructions.last().map(|i| i.address).unwrap_or(self.base_address),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::traits::CrossReference;
    use crate::types::XrefType;

    // Mock architecture for testing
    struct TestArch;

    impl Architecture for TestArch {
        fn name(&self) -> &'static str { "Test" }
        fn instruction_alignment(&self) -> usize { 4 }

        fn decode(&self, _bytes: &[u8], _addr: u32) -> Option<TraitInstruction> {
            None
        }

        fn extract_xrefs(&self, instr: &TraitInstruction) -> Vec<CrossReference> {
            // Simple test: if mnemonic is "call", extract target from operands
            if instr.mnemonic == "call" {
                if let Some(addr_str) = instr.operands.strip_prefix("#0x") {
                    if let Ok(addr) = u32::from_str_radix(addr_str, 16) {
                        return vec![CrossReference::new(
                            instr.address,
                            addr,
                            XrefType::Call,
                            instr.mnemonic.clone(),
                            instr.operands.clone(),
                        )];
                    }
                }
            }
            vec![]
        }

        fn is_function_start(&self, _: &TraitInstruction) -> bool { false }
        fn is_function_end(&self, _: &TraitInstruction) -> bool { false }
    }

    #[test]
    fn test_analyzer_creation() {
        let analyzer = BinaryAnalyzer::new(TestArch, 0x8000);
        assert_eq!(analyzer.architecture(), "Test");
        assert_eq!(analyzer.base_address, 0x8000);
        assert!(!analyzer.is_analyzed());
    }

    #[test]
    fn test_analysis() {
        let mut analyzer = BinaryAnalyzer::new(TestArch, 0x8000);

        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "call".to_string(), "#0x2000".to_string()),
            Instruction::new(0x1004, vec![0, 0, 0, 0], "nop".to_string(), "".to_string()),
        ];

        let results = analyzer.analyze_from_disasm(&instructions);

        assert_eq!(results.total_instructions, 2);
        assert_eq!(results.xrefs.len(), 1);
        assert_eq!(results.xrefs[0].to_addr, 0x2000);
        assert!(analyzer.is_analyzed());
    }

    #[test]
    fn test_xref_queries() {
        let mut analyzer = BinaryAnalyzer::new(TestArch, 0x8000);

        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "call".to_string(), "#0x2000".to_string()),
            Instruction::new(0x1004, vec![0, 0, 0, 0], "call".to_string(), "#0x2000".to_string()),
        ];

        analyzer.analyze_from_disasm(&instructions);

        // Query xrefs to 0x2000
        let xrefs_to = analyzer.get_xrefs_to(0x2000);
        assert_eq!(xrefs_to.len(), 2);

        // Query xrefs from 0x1000
        let xrefs_from = analyzer.get_xrefs_from(0x1000);
        assert_eq!(xrefs_from.len(), 1);
        assert_eq!(xrefs_from[0].to_addr, 0x2000);
    }

    #[test]
    fn test_reset() {
        let mut analyzer = BinaryAnalyzer::new(TestArch, 0x8000);

        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "call".to_string(), "#0x2000".to_string()),
        ];

        analyzer.analyze_from_disasm(&instructions);
        assert!(analyzer.is_analyzed());
        assert_eq!(analyzer.xref_count(), 1);

        analyzer.reset();
        assert!(!analyzer.is_analyzed());
        assert_eq!(analyzer.xref_count(), 0);
    }
}
