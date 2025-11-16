//! MIPS architecture implementation
//!
//! This module provides MIPS32/MIPS64 architecture support for the analyzer.
//! Currently a skeleton implementation demonstrating architecture extensibility.

use crate::traits::{Architecture, CrossReference, Instruction};

mod xref;
mod patterns;

pub use xref::extract_mips_xrefs;
pub use patterns::{is_mips_function_start, is_mips_function_end};

/// MIPS architecture implementation
pub struct MipsArchitecture;

impl Architecture for MipsArchitecture {
    fn name(&self) -> &'static str {
        "MIPS"
    }

    fn instruction_alignment(&self) -> usize {
        4 // MIPS instructions are always 4-byte aligned
    }

    fn decode(&self, _bytes: &[u8], _addr: u32) -> Option<Instruction> {
        // TODO: Implement MIPS instruction decoding
        // For now, this is a placeholder for future implementation
        None
    }

    fn extract_xrefs(&self, inst: &Instruction) -> Vec<CrossReference> {
        extract_mips_xrefs(inst)
    }

    fn is_function_start(&self, inst: &Instruction) -> bool {
        is_mips_function_start(inst)
    }

    fn is_function_end(&self, inst: &Instruction) -> bool {
        is_mips_function_end(inst)
    }

    // ========================================================================
    // Control Flow Analysis Methods
    // ========================================================================
    // TODO: Stub implementations for MIPS architecture

    fn is_conditional_branch(&self, _inst: &Instruction) -> bool {
        // TODO: Implement MIPS conditional branch detection (BEQ, BNE, BGTZ, etc.)
        false
    }

    fn is_unconditional_branch(&self, _inst: &Instruction) -> bool {
        // TODO: Implement MIPS unconditional branch detection (B, J)
        false
    }

    fn is_call(&self, _inst: &Instruction) -> bool {
        // TODO: Implement MIPS call detection (JAL, JALR)
        false
    }

    fn is_comparison(&self, _inst: &Instruction) -> bool {
        // TODO: Implement MIPS comparison detection (SLT, SLTU, SLTI, etc.)
        false
    }

    fn get_branch_target(&self, _inst: &Instruction) -> Option<u32> {
        // TODO: Implement MIPS branch target extraction
        // Must handle delay slots and PC-relative addressing
        None
    }

    // ========================================================================
    // Calling Convention Methods (MIPS O32 ABI)
    // ========================================================================

    fn arg_registers(&self) -> &[&str] {
        // MIPS O32 ABI: Arguments in $a0-$a3
        &["a0", "a1", "a2", "a3"]
    }

    fn return_register(&self) -> &str {
        // MIPS O32 ABI: Return value in $v0
        "v0"
    }

    fn link_register(&self) -> &str {
        // MIPS: $ra (register 31) stores return address
        "ra"
    }

    fn stack_pointer(&self) -> &str {
        // MIPS: $sp (register 29) is stack pointer
        "sp"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mips_architecture_basics() {
        let arch = MipsArchitecture;
        assert_eq!(arch.name(), "MIPS");
        assert_eq!(arch.instruction_alignment(), 4);
    }

    #[test]
    fn test_mips_function_detection() {
        // Test standard MIPS function prologue
        let prologue = Instruction::new(
            0x1000,
            vec![0x27, 0xbd, 0xff, 0xe0], // addiu sp, sp, -32
            "addiu".to_string(),
            "sp, sp, -32".to_string(),
        );

        let arch = MipsArchitecture;
        assert!(arch.is_function_start(&prologue));
    }

    #[test]
    fn test_mips_function_return() {
        // Test MIPS function epilogue with jr ra
        let epilogue = Instruction::new(
            0x1000,
            vec![0x03, 0xe0, 0x00, 0x08], // jr ra
            "jr".to_string(),
            "ra".to_string(),
        );

        let arch = MipsArchitecture;
        assert!(arch.is_function_end(&epilogue));
    }
}
