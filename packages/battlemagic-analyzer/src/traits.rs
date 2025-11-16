//! Architecture trait and related types for multi-architecture support

use crate::types::XrefType;

/// Core trait that all instruction set architectures must implement
///
/// This trait defines the contract for architecture-specific analysis.
/// Implementations should be stateless and thread-safe.
pub trait Architecture: Send + Sync {
    /// Decode a single instruction from bytes at given address
    fn decode(&self, bytes: &[u8], addr: u32) -> Option<Instruction>;

    /// Extract cross-references from an instruction
    fn extract_xrefs(&self, inst: &Instruction) -> Vec<CrossReference>;

    /// Check if instruction is a function prologue
    fn is_function_start(&self, inst: &Instruction) -> bool;

    /// Check if instruction is a function epilogue
    fn is_function_end(&self, inst: &Instruction) -> bool;

    /// Get architecture name
    fn name(&self) -> &'static str;

    /// Get default instruction alignment
    fn instruction_alignment(&self) -> usize {
        4  // Default for most RISC architectures
    }
}

/// Generic instruction representation
#[derive(Clone, Debug)]
pub struct Instruction {
    pub address: u32,
    pub bytes: Vec<u8>,
    pub mnemonic: String,
    pub operands: String,
    pub size: usize,
}

impl Instruction {
    pub fn new(address: u32, bytes: Vec<u8>, mnemonic: String, operands: String) -> Self {
        let size = bytes.len();
        Self {
            address,
            bytes,
            mnemonic,
            operands,
            size,
        }
    }
}

/// Cross-reference information extracted from an instruction
#[derive(Debug, Clone)]
pub struct CrossReference {
    /// Source address
    pub from_addr: u32,

    /// Target address
    pub to_addr: u32,

    /// Type of cross-reference
    pub xref_type: XrefType,

    /// Instruction mnemonic
    pub instruction: String,

    /// Instruction operands
    pub operands: String,
}

impl CrossReference {
    pub fn new(from_addr: u32, to_addr: u32, xref_type: XrefType, instruction: String, operands: String) -> Self {
        Self {
            from_addr,
            to_addr,
            xref_type,
            instruction,
            operands,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Mock architecture for testing
    struct MockArch;

    impl Architecture for MockArch {
        fn name(&self) -> &'static str {
            "Mock"
        }

        fn instruction_alignment(&self) -> usize {
            4
        }

        fn decode(&self, _bytes: &[u8], _addr: u32) -> Option<Instruction> {
            None
        }

        fn extract_xrefs(&self, _inst: &Instruction) -> Vec<CrossReference> {
            vec![]
        }

        fn is_function_start(&self, _inst: &Instruction) -> bool {
            false
        }

        fn is_function_end(&self, _inst: &Instruction) -> bool {
            false
        }
    }

    #[test]
    fn test_mock_architecture() {
        let arch = MockArch;
        assert_eq!(arch.name(), "Mock");
        assert_eq!(arch.instruction_alignment(), 4);
    }

    #[test]
    fn test_instruction_creation() {
        let instr = Instruction::new(
            0x1000,
            vec![0, 0, 0, 0],
            "bl".to_string(),
            "#0x2000".to_string(),
        );

        assert_eq!(instr.address, 0x1000);
        assert_eq!(instr.mnemonic, "bl");
        assert_eq!(instr.operands, "#0x2000");
        assert_eq!(instr.size, 4);
    }

    #[test]
    fn test_crossref_creation() {
        let xref = CrossReference::new(
            0x1000,
            0x2000,
            XrefType::Call,
            "bl".to_string(),
            "#0x2000".to_string(),
        );

        assert_eq!(xref.from_addr, 0x1000);
        assert_eq!(xref.to_addr, 0x2000);
        assert_eq!(xref.xref_type, XrefType::Call);
    }
}
