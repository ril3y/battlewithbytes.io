//! MIPS function pattern detection
//!
//! This module identifies function boundaries and calling conventions in MIPS code.
//! MIPS function patterns:
//! - Prologue: Stack frame setup (addiu sp, sp, -N)
//! - Epilogue: Stack restore + return (jr ra)

use crate::traits::Instruction;

/// Detect MIPS function start patterns
///
/// Common MIPS function prologues:
/// - `addiu sp, sp, -N` - Allocate stack frame
/// - `sw ra, offset(sp)` - Save return address
/// - `sw fp, offset(sp)` - Save frame pointer
///
/// # Arguments
/// * `inst` - The instruction to check
///
/// # Returns
/// `true` if the instruction indicates a function start
pub fn is_mips_function_start(inst: &Instruction) -> bool {
    let mnemonic = inst.mnemonic.to_lowercase();
    let operands = inst.operands.to_lowercase();

    // Stack frame allocation
    if mnemonic == "addiu" && operands.contains("sp") && operands.contains("-") {
        return true;
    }

    // Saving return address
    if mnemonic == "sw" && operands.contains("ra") && operands.contains("(sp)") {
        return true;
    }

    // Frame pointer setup
    if mnemonic == "move" && operands.contains("fp") && operands.contains("sp") {
        return true;
    }

    false
}

/// Detect MIPS function end patterns
///
/// Common MIPS function epilogues:
/// - `jr ra` - Return to caller
/// - `lw ra, offset(sp)` followed by return
/// - Stack frame deallocation before return
///
/// # Arguments
/// * `inst` - The instruction to check
///
/// # Returns
/// `true` if the instruction indicates a function end
pub fn is_mips_function_end(inst: &Instruction) -> bool {
    let mnemonic = inst.mnemonic.to_lowercase();
    let operands = inst.operands.to_lowercase();

    // Return instruction
    if mnemonic == "jr" && operands.contains("ra") {
        return true;
    }

    // Return with delay slot (MIPS)
    if mnemonic == "j" && operands.contains("ra") {
        return true;
    }

    // Stack deallocation (often before jr ra in delay slot)
    if mnemonic == "addiu" && operands.contains("sp") && operands.contains("sp") {
        // Check if it's adding back (positive offset)
        if !operands.contains("-") {
            return true;
        }
    }

    false
}

/// Detect if instruction is a function call
///
/// # Arguments
/// * `inst` - The instruction to check
///
/// # Returns
/// `true` if the instruction is a function call
#[allow(dead_code)]
pub fn is_function_call(inst: &Instruction) -> bool {
    let mnemonic = inst.mnemonic.to_lowercase();
    matches!(mnemonic.as_str(), "jal" | "jalr")
}

/// Check if instruction is a conditional branch
///
/// # Arguments
/// * `mnemonic` - The instruction mnemonic
///
/// # Returns
/// `true` if it's a conditional branch instruction
#[allow(dead_code)]
fn is_conditional_branch(mnemonic: &str) -> bool {
    matches!(
        mnemonic,
        "beq" | "bne" | "bgtz" | "blez" | "bgez" | "bltz" | "beqz" | "bnez"
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_function_prologue_stack_alloc() {
        let inst = Instruction::new(
            0x1000,
            vec![0x27, 0xbd, 0xff, 0xe0],
            "addiu".to_string(),
            "sp, sp, -32".to_string(),
        );

        assert!(is_mips_function_start(&inst));
    }

    #[test]
    fn test_function_prologue_save_ra() {
        let inst = Instruction::new(
            0x1000,
            vec![0xaf, 0xbf, 0x00, 0x1c],
            "sw".to_string(),
            "ra, 28(sp)".to_string(),
        );

        assert!(is_mips_function_start(&inst));
    }

    #[test]
    fn test_function_epilogue_jr_ra() {
        let inst = Instruction::new(
            0x1000,
            vec![0x03, 0xe0, 0x00, 0x08],
            "jr".to_string(),
            "ra".to_string(),
        );

        assert!(is_mips_function_end(&inst));
    }

    #[test]
    fn test_function_epilogue_stack_restore() {
        let inst = Instruction::new(
            0x1000,
            vec![0x27, 0xbd, 0x00, 0x20],
            "addiu".to_string(),
            "sp, sp, 32".to_string(),
        );

        assert!(is_mips_function_end(&inst));
    }

    #[test]
    fn test_function_call_jal() {
        let inst = Instruction::new(
            0x1000,
            vec![0x0c, 0x00, 0x08, 0x00],
            "jal".to_string(),
            "0x2000".to_string(),
        );

        assert!(is_function_call(&inst));
    }

    #[test]
    fn test_not_function_boundary() {
        let inst = Instruction::new(
            0x1000,
            vec![0x00, 0x00, 0x10, 0x21],
            "addu".to_string(),
            "$v0, $zero, $zero".to_string(),
        );

        assert!(!is_mips_function_start(&inst));
        assert!(!is_mips_function_end(&inst));
    }

    #[test]
    fn test_conditional_branch_detection() {
        assert!(is_conditional_branch("beq"));
        assert!(is_conditional_branch("bne"));
        assert!(is_conditional_branch("bgtz"));
        assert!(!is_conditional_branch("jal"));
        assert!(!is_conditional_branch("addu"));
    }
}
