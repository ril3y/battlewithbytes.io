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

    // ========================================================================
    // Control Flow Analysis Methods
    // ========================================================================

    /// Check if instruction is any type of branch (conditional, unconditional, call)
    ///
    /// This is a convenience method that aggregates all branch types including:
    /// - Conditional branches (BEQ, BNE, etc.)
    /// - Unconditional branches (B)
    /// - Function calls (BL, BLX)
    ///
    /// Default implementation combines the three specific branch checks.
    fn is_branch(&self, inst: &Instruction) -> bool {
        self.is_conditional_branch(inst)
            || self.is_unconditional_branch(inst)
            || self.is_call(inst)
    }

    /// Check if instruction is a conditional branch
    ///
    /// Conditional branches alter control flow based on processor flags.
    /// Examples: BEQ, BNE, BGT, BLT (ARM); JE, JNE, JG, JL (x86)
    ///
    /// IMPORTANT: This should NOT include calls (BL, BLX) even though
    /// they may be conditional variants.
    fn is_conditional_branch(&self, inst: &Instruction) -> bool;

    /// Check if instruction is an unconditional branch
    ///
    /// Unconditional branches always transfer control.
    /// Examples: B (ARM), JMP (x86)
    ///
    /// IMPORTANT: This should NOT include calls (BL) - only pure branches.
    fn is_unconditional_branch(&self, inst: &Instruction) -> bool;

    /// Check if instruction is a function call
    ///
    /// Function calls transfer control and save a return address.
    /// Examples: BL, BLX (ARM); CALL (x86); JAL, JALR (RISC-V)
    fn is_call(&self, inst: &Instruction) -> bool;

    /// Check if instruction is a comparison or test
    ///
    /// Comparisons set processor flags without storing results.
    /// Examples: CMP, CMN, TST, TEQ (ARM); CMP, TEST (x86)
    ///
    /// Used by CFG analysis to detect condition checks that precede
    /// conditional branches.
    fn is_comparison(&self, inst: &Instruction) -> bool;

    /// Get branch target address if statically determinable
    ///
    /// Returns the target address for direct branches/calls where the
    /// destination can be computed at analysis time.
    ///
    /// Returns None for:
    /// - Register indirect branches (BX, BLX with register operand)
    /// - Computed jumps through tables
    /// - Invalid/malformed instructions
    ///
    /// # Arguments
    /// * `inst` - The instruction to analyze
    ///
    /// # Returns
    /// * `Some(address)` - Static target address
    /// * `None` - Dynamic target or not a branch
    fn get_branch_target(&self, inst: &Instruction) -> Option<u32>;

    // ========================================================================
    // Calling Convention Methods
    // ========================================================================

    /// Get argument register names in order
    ///
    /// Returns registers used for passing function arguments in standard
    /// calling convention, in the order they are used.
    ///
    /// # Examples
    /// - ARM: ["r0", "r1", "r2", "r3"]
    /// - x86-64 SysV: ["rdi", "rsi", "rdx", "rcx", "r8", "r9"]
    /// - RISC-V: ["a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7"]
    fn arg_registers(&self) -> &[&str];

    /// Get return value register name
    ///
    /// Returns the primary register used for function return values.
    ///
    /// # Examples
    /// - ARM: "r0" (sometimes r0-r1 for 64-bit)
    /// - x86-64: "rax"
    /// - RISC-V: "a0"
    fn return_register(&self) -> &str;

    /// Get link register name (where return address is stored)
    ///
    /// For architectures with dedicated link registers, returns the
    /// register that stores the return address during function calls.
    ///
    /// For stack-based return addressing (x86), return the stack pointer
    /// or a sentinel value like "stack".
    ///
    /// # Examples
    /// - ARM: "lr" (r14)
    /// - RISC-V: "ra" (x1)
    /// - x86: "stack" (return address pushed to stack)
    fn link_register(&self) -> &str;

    /// Get stack pointer register name
    ///
    /// Returns the register used as the stack pointer.
    ///
    /// # Examples
    /// - ARM: "sp" (r13)
    /// - x86-64: "rsp"
    /// - RISC-V: "sp" (x2)
    fn stack_pointer(&self) -> &str;
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

        // Control flow methods - stub implementations
        fn is_conditional_branch(&self, _inst: &Instruction) -> bool {
            false
        }

        fn is_unconditional_branch(&self, _inst: &Instruction) -> bool {
            false
        }

        fn is_call(&self, _inst: &Instruction) -> bool {
            false
        }

        fn is_comparison(&self, _inst: &Instruction) -> bool {
            false
        }

        fn get_branch_target(&self, _inst: &Instruction) -> Option<u32> {
            None
        }

        // Calling convention methods - stub implementations
        fn arg_registers(&self) -> &[&str] {
            &["r0", "r1", "r2", "r3"]
        }

        fn return_register(&self) -> &str {
            "r0"
        }

        fn link_register(&self) -> &str {
            "lr"
        }

        fn stack_pointer(&self) -> &str {
            "sp"
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

    #[test]
    fn test_control_flow_methods() {
        let arch = MockArch;
        let inst = Instruction::new(
            0x1000,
            vec![0, 0, 0, 0],
            "nop".to_string(),
            "".to_string(),
        );

        // Test control flow detection (should all be false for stub)
        assert_eq!(arch.is_conditional_branch(&inst), false);
        assert_eq!(arch.is_unconditional_branch(&inst), false);
        assert_eq!(arch.is_call(&inst), false);
        assert_eq!(arch.is_comparison(&inst), false);

        // Test default is_branch implementation (aggregates the above)
        assert_eq!(arch.is_branch(&inst), false);

        // Test branch target
        assert_eq!(arch.get_branch_target(&inst), None);
    }

    #[test]
    fn test_calling_convention_methods() {
        let arch = MockArch;

        // Test argument registers
        let args = arch.arg_registers();
        assert_eq!(args.len(), 4);
        assert_eq!(args[0], "r0");
        assert_eq!(args[1], "r1");
        assert_eq!(args[2], "r2");
        assert_eq!(args[3], "r3");

        // Test return register
        assert_eq!(arch.return_register(), "r0");

        // Test link register
        assert_eq!(arch.link_register(), "lr");

        // Test stack pointer
        assert_eq!(arch.stack_pointer(), "sp");
    }

    #[test]
    fn test_is_branch_default_implementation() {
        // Create a test architecture that overrides one branch check
        struct TestArch;

        impl Architecture for TestArch {
            fn name(&self) -> &'static str { "Test" }
            fn decode(&self, _: &[u8], _: u32) -> Option<Instruction> { None }
            fn extract_xrefs(&self, _: &Instruction) -> Vec<CrossReference> { vec![] }
            fn is_function_start(&self, _: &Instruction) -> bool { false }
            fn is_function_end(&self, _: &Instruction) -> bool { false }

            // Override to return true for conditional branches
            fn is_conditional_branch(&self, inst: &Instruction) -> bool {
                inst.mnemonic == "b.eq"
            }

            fn is_unconditional_branch(&self, _: &Instruction) -> bool { false }
            fn is_call(&self, _: &Instruction) -> bool { false }
            fn is_comparison(&self, _: &Instruction) -> bool { false }
            fn get_branch_target(&self, _: &Instruction) -> Option<u32> { None }
            fn arg_registers(&self) -> &[&str] { &[] }
            fn return_register(&self) -> &str { "" }
            fn link_register(&self) -> &str { "" }
            fn stack_pointer(&self) -> &str { "" }
        }

        let arch = TestArch;
        let conditional_branch = Instruction::new(
            0x1000,
            vec![0, 0],
            "b.eq".to_string(),
            "#0x2000".to_string(),
        );
        let other_inst = Instruction::new(
            0x1004,
            vec![0, 0],
            "mov".to_string(),
            "r0, r1".to_string(),
        );

        // is_branch should return true when is_conditional_branch is true
        assert_eq!(arch.is_branch(&conditional_branch), true);
        assert_eq!(arch.is_branch(&other_inst), false);
    }
}
