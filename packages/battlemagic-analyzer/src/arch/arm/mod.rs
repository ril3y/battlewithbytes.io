//! ARM Thumb-2 architecture implementation

mod xref;
mod patterns;
mod decoder;

pub mod binary_patterns;

use crate::traits::{Architecture, Instruction, CrossReference};

pub use xref::extract_arm_xrefs;
pub use patterns::{is_arm_function_start, is_arm_function_end};

/// ARM Thumb-2 architecture
pub struct ArmArchitecture;

impl Architecture for ArmArchitecture {
    fn decode(&self, bytes: &[u8], addr: u32) -> Option<Instruction> {
        decoder::decode_arm_instruction(bytes, addr)
    }

    fn extract_xrefs(&self, inst: &Instruction) -> Vec<CrossReference> {
        extract_arm_xrefs(inst)
    }

    fn is_function_start(&self, inst: &Instruction) -> bool {
        is_arm_function_start(inst)
    }

    fn is_function_end(&self, inst: &Instruction) -> bool {
        is_arm_function_end(inst)
    }

    fn name(&self) -> &'static str {
        "ARM Thumb-2"
    }

    fn instruction_alignment(&self) -> usize {
        2  // Thumb mode uses 2-byte alignment
    }

    // ========================================================================
    // Control Flow Analysis Methods
    // ========================================================================

    fn is_conditional_branch(&self, inst: &Instruction) -> bool {
        let mnemonic = inst.mnemonic.to_lowercase();

        // Thumb conditional branches (all 2-byte except .w variants)
        matches!(
            mnemonic.as_str(),
            "beq" | "bne" | "bcs" | "bhs" | "bcc" | "blo" |
            "bmi" | "bpl" | "bvs" | "bvc" | "bhi" | "bls" |
            "bge" | "blt" | "bgt" | "ble" | "bal" |
            // Thumb-2 wide conditional branches
            "beq.w" | "bne.w" | "bcs.w" | "bhs.w" | "bcc.w" | "blo.w" |
            "bmi.w" | "bpl.w" | "bvs.w" | "bvc.w" | "bhi.w" | "bls.w" |
            "bge.w" | "blt.w" | "bgt.w" | "ble.w" | "bal.w" |
            // Compare and branch instructions
            "cbz" | "cbnz"
        )
    }

    fn is_unconditional_branch(&self, inst: &Instruction) -> bool {
        let mnemonic = inst.mnemonic.to_lowercase();

        // Unconditional branch only - must be exactly "b" or "b.w"
        // Exclude calls (bl, blx) and other instructions starting with 'b'
        matches!(mnemonic.as_str(), "b" | "b.w")
    }

    fn is_call(&self, inst: &Instruction) -> bool {
        let mnemonic = inst.mnemonic.to_lowercase();

        // Branch with link instructions (function calls)
        matches!(mnemonic.as_str(), "bl" | "bl.w" | "blx" | "blx.w")
    }

    fn is_comparison(&self, inst: &Instruction) -> bool {
        let mnemonic = inst.mnemonic.to_lowercase();

        // Comparison and test instructions
        // These set flags without storing results (except for adds/subs variants)
        matches!(
            mnemonic.as_str(),
            "cmp" | "cmn" | "tst" | "teq" |
            "cbz" | "cbnz" |
            "subs" | "adds" | "rsbs"
        )
    }

    fn get_branch_target(&self, inst: &Instruction) -> Option<u32> {
        let operands = inst.operands.trim();

        // Skip register-based branches (indirect jumps)
        if operands.starts_with('r') || operands.starts_with("lr") {
            return None;
        }

        // Remove '#' prefix if present
        let operands = operands.strip_prefix('#').unwrap_or(operands);

        // Handle PC-relative format: $+0x1234 or $-0x56
        if operands.starts_with('$') {
            return parse_pc_relative_target(inst.address, operands);
        }

        // Handle absolute format: 0x1234 or just decimal
        parse_absolute_target(operands)
    }

    // ========================================================================
    // Calling Convention Methods (ARM AAPCS)
    // ========================================================================

    fn arg_registers(&self) -> &[&str] {
        // ARM AAPCS: First 4 arguments in R0-R3
        &["r0", "r1", "r2", "r3"]
    }

    fn return_register(&self) -> &str {
        // ARM AAPCS: Return value in R0
        "r0"
    }

    fn link_register(&self) -> &str {
        // ARM: LR (R14) stores return address
        "lr"
    }

    fn stack_pointer(&self) -> &str {
        // ARM: SP (R13) is stack pointer
        "sp"
    }
}

// ========================================================================
// Helper Functions for Branch Target Parsing
// ========================================================================

/// Parse PC-relative branch target
///
/// Handles formats like:
/// - `$+0x1234` - PC + offset
/// - `$-0x56` - PC - offset
///
/// # Arguments
/// * `pc` - Current program counter (instruction address)
/// * `operands` - Operand string starting with '$'
///
/// # Returns
/// Computed target address or None if parsing fails
fn parse_pc_relative_target(pc: u32, operands: &str) -> Option<u32> {
    // Remove '$' prefix
    let offset_str = operands.strip_prefix('$')?;

    // Parse the offset (handles +/- sign)
    if let Some(hex_str) = offset_str.strip_prefix("+0x") {
        let offset = i32::from_str_radix(hex_str, 16).ok()?;
        Some(pc.wrapping_add(offset as u32))
    } else if let Some(hex_str) = offset_str.strip_prefix("-0x") {
        let offset = i32::from_str_radix(hex_str, 16).ok()?;
        Some(pc.wrapping_sub(offset as u32))
    } else if let Some(dec_str) = offset_str.strip_prefix('+') {
        let offset = dec_str.parse::<i32>().ok()?;
        Some(pc.wrapping_add(offset as u32))
    } else if let Some(dec_str) = offset_str.strip_prefix('-') {
        let offset = dec_str.parse::<i32>().ok()?;
        Some(pc.wrapping_sub(offset as u32))
    } else {
        None
    }
}

/// Parse absolute branch target
///
/// Handles formats like:
/// - `0x1234` - Hexadecimal
/// - `1234` - Decimal
///
/// # Arguments
/// * `operands` - Operand string containing the address
///
/// # Returns
/// Parsed address or None if parsing fails
fn parse_absolute_target(operands: &str) -> Option<u32> {
    if let Some(hex_str) = operands.strip_prefix("0x") {
        u32::from_str_radix(hex_str, 16).ok()
    } else {
        operands.parse::<u32>().ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Helper to create test instructions
    fn make_inst(addr: u32, mnemonic: &str, operands: &str) -> Instruction {
        Instruction::new(
            addr,
            vec![],
            mnemonic.to_string(),
            operands.to_string(),
        )
    }

    // ========================================================================
    // Architecture Basic Tests
    // ========================================================================

    #[test]
    fn test_arm_architecture_creation() {
        let arch = ArmArchitecture;
        assert_eq!(arch.name(), "ARM Thumb-2");
        assert_eq!(arch.instruction_alignment(), 2);
    }

    #[test]
    fn test_calling_convention() {
        let arch = ArmArchitecture;

        // Test argument registers
        assert_eq!(arch.arg_registers(), &["r0", "r1", "r2", "r3"]);

        // Test return register
        assert_eq!(arch.return_register(), "r0");

        // Test link register
        assert_eq!(arch.link_register(), "lr");

        // Test stack pointer
        assert_eq!(arch.stack_pointer(), "sp");
    }

    // ========================================================================
    // Conditional Branch Tests
    // ========================================================================

    #[test]
    fn test_conditional_branches_standard() {
        let arch = ArmArchitecture;

        let conditionals = vec![
            "beq", "bne", "bcs", "bhs", "bcc", "blo",
            "bmi", "bpl", "bvs", "bvc", "bhi", "bls",
            "bge", "blt", "bgt", "ble", "bal"
        ];

        for mnemonic in conditionals {
            let inst = make_inst(0x1000, mnemonic, "#0x2000");
            assert!(arch.is_conditional_branch(&inst),
                    "Expected {} to be conditional branch", mnemonic);
        }
    }

    #[test]
    fn test_conditional_branches_wide_thumb2() {
        let arch = ArmArchitecture;

        let wide_conditionals = vec![
            "beq.w", "bne.w", "bge.w", "blt.w", "bhi.w"
        ];

        for mnemonic in wide_conditionals {
            let inst = make_inst(0x1000, mnemonic, "#0x2000");
            assert!(arch.is_conditional_branch(&inst),
                    "Expected {} to be conditional branch", mnemonic);
        }
    }

    #[test]
    fn test_compare_and_branch_instructions() {
        let arch = ArmArchitecture;

        let inst_cbz = make_inst(0x1000, "cbz", "r0, #0x1010");
        assert!(arch.is_conditional_branch(&inst_cbz));

        let inst_cbnz = make_inst(0x1000, "cbnz", "r1, #0x1020");
        assert!(arch.is_conditional_branch(&inst_cbnz));
    }

    #[test]
    fn test_conditional_branch_case_insensitive() {
        let arch = ArmArchitecture;

        let inst_lower = make_inst(0x1000, "beq", "#0x2000");
        let inst_upper = make_inst(0x1000, "BEQ", "#0x2000");
        let inst_mixed = make_inst(0x1000, "BeQ", "#0x2000");

        assert!(arch.is_conditional_branch(&inst_lower));
        assert!(arch.is_conditional_branch(&inst_upper));
        assert!(arch.is_conditional_branch(&inst_mixed));
    }

    #[test]
    fn test_not_conditional_branch() {
        let arch = ArmArchitecture;

        // Unconditional branches
        assert!(!arch.is_conditional_branch(&make_inst(0x1000, "b", "#0x2000")));
        assert!(!arch.is_conditional_branch(&make_inst(0x1000, "b.w", "#0x2000")));

        // Calls
        assert!(!arch.is_conditional_branch(&make_inst(0x1000, "bl", "#0x2000")));
        assert!(!arch.is_conditional_branch(&make_inst(0x1000, "blx", "#0x2000")));

        // Other instructions starting with 'b'
        assert!(!arch.is_conditional_branch(&make_inst(0x1000, "bic", "r0, r1")));
        assert!(!arch.is_conditional_branch(&make_inst(0x1000, "bkpt", "#0")));

        // Regular instructions
        assert!(!arch.is_conditional_branch(&make_inst(0x1000, "mov", "r0, r1")));
        assert!(!arch.is_conditional_branch(&make_inst(0x1000, "add", "r0, r0, #1")));
    }

    // ========================================================================
    // Unconditional Branch Tests
    // ========================================================================

    #[test]
    fn test_unconditional_branch_basic() {
        let arch = ArmArchitecture;

        let inst_b = make_inst(0x1000, "b", "#0x2000");
        assert!(arch.is_unconditional_branch(&inst_b));

        let inst_b_w = make_inst(0x1000, "b.w", "#0x2000");
        assert!(arch.is_unconditional_branch(&inst_b_w));
    }

    #[test]
    fn test_unconditional_branch_case_insensitive() {
        let arch = ArmArchitecture;

        assert!(arch.is_unconditional_branch(&make_inst(0x1000, "b", "#0x2000")));
        assert!(arch.is_unconditional_branch(&make_inst(0x1000, "B", "#0x2000")));
        assert!(arch.is_unconditional_branch(&make_inst(0x1000, "B.W", "#0x2000")));
    }

    #[test]
    fn test_not_unconditional_branch() {
        let arch = ArmArchitecture;

        // Conditional branches
        assert!(!arch.is_unconditional_branch(&make_inst(0x1000, "beq", "#0x2000")));
        assert!(!arch.is_unconditional_branch(&make_inst(0x1000, "bne", "#0x2000")));

        // Calls (bl, blx)
        assert!(!arch.is_unconditional_branch(&make_inst(0x1000, "bl", "#0x2000")));
        assert!(!arch.is_unconditional_branch(&make_inst(0x1000, "blx", "#0x2000")));
        assert!(!arch.is_unconditional_branch(&make_inst(0x1000, "bl.w", "#0x2000")));

        // Similar-looking instructions
        assert!(!arch.is_unconditional_branch(&make_inst(0x1000, "bic", "r0, r1")));
        assert!(!arch.is_unconditional_branch(&make_inst(0x1000, "bkpt", "#0")));
        assert!(!arch.is_unconditional_branch(&make_inst(0x1000, "bx", "lr")));

        // Regular instructions
        assert!(!arch.is_unconditional_branch(&make_inst(0x1000, "mov", "r0, r1")));
    }

    // ========================================================================
    // Call Detection Tests
    // ========================================================================

    #[test]
    fn test_call_instructions() {
        let arch = ArmArchitecture;

        // Basic calls
        assert!(arch.is_call(&make_inst(0x1000, "bl", "#0x2000")));
        assert!(arch.is_call(&make_inst(0x1000, "blx", "#0x2000")));

        // Wide Thumb-2 variants
        assert!(arch.is_call(&make_inst(0x1000, "bl.w", "#0x2000")));
        assert!(arch.is_call(&make_inst(0x1000, "blx.w", "#0x2000")));

        // Indirect calls (register operands)
        assert!(arch.is_call(&make_inst(0x1000, "blx", "r0")));
    }

    #[test]
    fn test_call_case_insensitive() {
        let arch = ArmArchitecture;

        assert!(arch.is_call(&make_inst(0x1000, "bl", "#0x2000")));
        assert!(arch.is_call(&make_inst(0x1000, "BL", "#0x2000")));
        assert!(arch.is_call(&make_inst(0x1000, "Bl", "#0x2000")));
        assert!(arch.is_call(&make_inst(0x1000, "BLX", "r0")));
    }

    #[test]
    fn test_not_call() {
        let arch = ArmArchitecture;

        // Branches (not calls)
        assert!(!arch.is_call(&make_inst(0x1000, "b", "#0x2000")));
        assert!(!arch.is_call(&make_inst(0x1000, "beq", "#0x2000")));
        assert!(!arch.is_call(&make_inst(0x1000, "bne", "#0x2000")));

        // Branch exchange (return, not call)
        assert!(!arch.is_call(&make_inst(0x1000, "bx", "lr")));

        // Regular instructions
        assert!(!arch.is_call(&make_inst(0x1000, "mov", "r0, r1")));
        assert!(!arch.is_call(&make_inst(0x1000, "add", "r0, r0, #1")));
    }

    // ========================================================================
    // Comparison Instruction Tests
    // ========================================================================

    #[test]
    fn test_comparison_instructions() {
        let arch = ArmArchitecture;

        // Basic comparisons
        assert!(arch.is_comparison(&make_inst(0x1000, "cmp", "r0, r1")));
        assert!(arch.is_comparison(&make_inst(0x1000, "cmn", "r0, #1")));
        assert!(arch.is_comparison(&make_inst(0x1000, "tst", "r0, r1")));
        assert!(arch.is_comparison(&make_inst(0x1000, "teq", "r0, r1")));

        // Compare and branch
        assert!(arch.is_comparison(&make_inst(0x1000, "cbz", "r0, #0x1010")));
        assert!(arch.is_comparison(&make_inst(0x1000, "cbnz", "r1, #0x1020")));

        // Arithmetic with flags
        assert!(arch.is_comparison(&make_inst(0x1000, "subs", "r0, r0, #1")));
        assert!(arch.is_comparison(&make_inst(0x1000, "adds", "r0, r0, r1")));
        assert!(arch.is_comparison(&make_inst(0x1000, "rsbs", "r0, r1, #0")));
    }

    #[test]
    fn test_comparison_case_insensitive() {
        let arch = ArmArchitecture;

        assert!(arch.is_comparison(&make_inst(0x1000, "cmp", "r0, r1")));
        assert!(arch.is_comparison(&make_inst(0x1000, "CMP", "r0, r1")));
        assert!(arch.is_comparison(&make_inst(0x1000, "Cmp", "r0, r1")));
    }

    #[test]
    fn test_not_comparison() {
        let arch = ArmArchitecture;

        // Regular arithmetic (without 's' suffix)
        assert!(!arch.is_comparison(&make_inst(0x1000, "add", "r0, r0, #1")));
        assert!(!arch.is_comparison(&make_inst(0x1000, "sub", "r0, r0, #1")));

        // Branches
        assert!(!arch.is_comparison(&make_inst(0x1000, "b", "#0x2000")));
        assert!(!arch.is_comparison(&make_inst(0x1000, "bl", "#0x2000")));

        // Regular instructions
        assert!(!arch.is_comparison(&make_inst(0x1000, "mov", "r0, r1")));
        assert!(!arch.is_comparison(&make_inst(0x1000, "ldr", "r0, [r1]")));
    }

    // ========================================================================
    // Branch Target Parsing Tests
    // ========================================================================

    #[test]
    fn test_get_branch_target_absolute_hex() {
        let arch = ArmArchitecture;

        let inst = make_inst(0x1000, "b", "#0x2000");
        assert_eq!(arch.get_branch_target(&inst), Some(0x2000));

        let inst2 = make_inst(0x1000, "bl", "0x1234");
        assert_eq!(arch.get_branch_target(&inst2), Some(0x1234));
    }

    #[test]
    fn test_get_branch_target_absolute_decimal() {
        let arch = ArmArchitecture;

        let inst = make_inst(0x1000, "b", "#8192");
        assert_eq!(arch.get_branch_target(&inst), Some(8192));

        let inst2 = make_inst(0x1000, "bl", "4096");
        assert_eq!(arch.get_branch_target(&inst2), Some(4096));
    }

    #[test]
    fn test_get_branch_target_pc_relative_positive_hex() {
        let arch = ArmArchitecture;

        // PC = 0x1000, offset = +0x100 => target = 0x1100
        let inst = make_inst(0x1000, "beq", "$+0x100");
        assert_eq!(arch.get_branch_target(&inst), Some(0x1100));

        // PC = 0x8000, offset = +0x50 => target = 0x8050
        let inst2 = make_inst(0x8000, "b", "#$+0x50");
        assert_eq!(arch.get_branch_target(&inst2), Some(0x8050));
    }

    #[test]
    fn test_get_branch_target_pc_relative_negative_hex() {
        let arch = ArmArchitecture;

        // PC = 0x2000, offset = -0x100 => target = 0x1F00
        let inst = make_inst(0x2000, "bne", "$-0x100");
        assert_eq!(arch.get_branch_target(&inst), Some(0x1F00));

        // PC = 0x8000, offset = -0x50 => target = 0x7FB0
        let inst2 = make_inst(0x8000, "b", "#$-0x50");
        assert_eq!(arch.get_branch_target(&inst2), Some(0x7FB0));
    }

    #[test]
    fn test_get_branch_target_pc_relative_decimal() {
        let arch = ArmArchitecture;

        // PC = 0x1000, offset = +256 => target = 0x1100
        let inst = make_inst(0x1000, "beq", "$+256");
        assert_eq!(arch.get_branch_target(&inst), Some(0x1100));

        // PC = 0x2000, offset = -256 => target = 0x1F00
        let inst2 = make_inst(0x2000, "bne", "$-256");
        assert_eq!(arch.get_branch_target(&inst2), Some(0x1F00));
    }

    #[test]
    fn test_get_branch_target_register_indirect() {
        let arch = ArmArchitecture;

        // Register-based branches should return None
        assert_eq!(arch.get_branch_target(&make_inst(0x1000, "bx", "r0")), None);
        assert_eq!(arch.get_branch_target(&make_inst(0x1000, "bx", "lr")), None);
        assert_eq!(arch.get_branch_target(&make_inst(0x1000, "blx", "r3")), None);
    }

    #[test]
    fn test_get_branch_target_with_whitespace() {
        let arch = ArmArchitecture;

        // Test that leading/trailing whitespace is handled
        let inst = make_inst(0x1000, "b", "  #0x2000  ");
        assert_eq!(arch.get_branch_target(&inst), Some(0x2000));

        let inst2 = make_inst(0x1000, "beq", "  $+0x100  ");
        assert_eq!(arch.get_branch_target(&inst2), Some(0x1100));
    }

    #[test]
    fn test_get_branch_target_invalid() {
        let arch = ArmArchitecture;

        // Invalid/malformed operands should return None
        assert_eq!(arch.get_branch_target(&make_inst(0x1000, "b", "")), None);
        assert_eq!(arch.get_branch_target(&make_inst(0x1000, "b", "invalid")), None);
        assert_eq!(arch.get_branch_target(&make_inst(0x1000, "b", "$")), None);
    }

    // ========================================================================
    // Integration Tests - is_branch()
    // ========================================================================

    #[test]
    fn test_is_branch_aggregation() {
        let arch = ArmArchitecture;

        // Conditional branch should be detected by is_branch
        assert!(arch.is_branch(&make_inst(0x1000, "beq", "#0x2000")));

        // Unconditional branch should be detected by is_branch
        assert!(arch.is_branch(&make_inst(0x1000, "b", "#0x2000")));

        // Call should be detected by is_branch
        assert!(arch.is_branch(&make_inst(0x1000, "bl", "#0x2000")));

        // Non-branch should not be detected
        assert!(!arch.is_branch(&make_inst(0x1000, "mov", "r0, r1")));
        assert!(!arch.is_branch(&make_inst(0x1000, "add", "r0, r0, #1")));
    }

    // ========================================================================
    // Helper Function Tests
    // ========================================================================

    #[test]
    fn test_parse_pc_relative_target() {
        // Positive hex offset
        assert_eq!(parse_pc_relative_target(0x1000, "$+0x100"), Some(0x1100));
        assert_eq!(parse_pc_relative_target(0x8000, "$+0x50"), Some(0x8050));

        // Negative hex offset
        assert_eq!(parse_pc_relative_target(0x2000, "$-0x100"), Some(0x1F00));
        assert_eq!(parse_pc_relative_target(0x8000, "$-0x50"), Some(0x7FB0));

        // Positive decimal offset
        assert_eq!(parse_pc_relative_target(0x1000, "$+256"), Some(0x1100));

        // Negative decimal offset
        assert_eq!(parse_pc_relative_target(0x2000, "$-256"), Some(0x1F00));

        // Invalid formats
        assert_eq!(parse_pc_relative_target(0x1000, "$"), None);
        assert_eq!(parse_pc_relative_target(0x1000, "$invalid"), None);
        assert_eq!(parse_pc_relative_target(0x1000, "0x100"), None);  // Missing $
    }

    #[test]
    fn test_parse_absolute_target() {
        // Hexadecimal
        assert_eq!(parse_absolute_target("0x1234"), Some(0x1234));
        assert_eq!(parse_absolute_target("0x8000"), Some(0x8000));
        assert_eq!(parse_absolute_target("0xFFFF"), Some(0xFFFF));

        // Decimal
        assert_eq!(parse_absolute_target("4096"), Some(4096));
        assert_eq!(parse_absolute_target("8192"), Some(8192));

        // Invalid
        assert_eq!(parse_absolute_target("invalid"), None);
        assert_eq!(parse_absolute_target("0xGHIJ"), None);
        assert_eq!(parse_absolute_target(""), None);
    }
}
