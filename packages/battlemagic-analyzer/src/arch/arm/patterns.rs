//! ARM-specific function pattern detection
//!
//! This module provides pattern detection for ARM/Thumb instruction sequences
//! to identify function boundaries, calls, and complexity metrics.

use crate::traits::Instruction;

/// Check if instruction is an ARM function prologue (function start)
///
/// Function prologues typically include:
/// - `push {lr}` or `push {..., lr}` - Save return address
/// - `push {r7, lr}` / `push {r11, lr}` - Save frame pointer and return address
///
/// # Arguments
/// * `inst` - The instruction to analyze
///
/// # Returns
/// True if the instruction is likely a function prologue
pub fn is_arm_function_start(inst: &Instruction) -> bool {
    let mnemonic = inst.mnemonic.to_lowercase();

    // Check for push instruction that saves LR (link register)
    if mnemonic == "push" && inst.operands.to_lowercase().contains("lr") {
        return true;
    }

    // Check for ARM STMDB (Store Multiple, Decrement Before) variant of push
    // stmdb sp!, {..., lr}
    if (mnemonic == "stmdb" || mnemonic == "stm")
        && inst.operands.to_lowercase().contains("sp!")
        && inst.operands.to_lowercase().contains("lr") {
        return true;
    }

    false
}

/// Check if instruction is an ARM function epilogue (function end)
///
/// Function epilogues typically include:
/// - `bx lr` - Return from function (branch to link register)
/// - `pop {pc}` - Pop return address from stack and jump
/// - `pop {..., pc}` - Restore registers and return
///
/// # Arguments
/// * `inst` - The instruction to analyze
///
/// # Returns
/// True if the instruction is likely a function epilogue
pub fn is_arm_function_end(inst: &Instruction) -> bool {
    let mnemonic = inst.mnemonic.to_lowercase();

    // Check for BX LR (branch exchange to link register)
    if mnemonic == "bx" && inst.operands.to_lowercase().contains("lr") {
        return true;
    }

    // Check for POP PC (pop return address and jump)
    if mnemonic == "pop" && inst.operands.to_lowercase().contains("pc") {
        return true;
    }

    // Check for LDMIA (Load Multiple, Increment After) variant of pop
    // ldmia sp!, {..., pc}
    if (mnemonic == "ldmia" || mnemonic == "ldm")
        && inst.operands.to_lowercase().contains("sp!")
        && inst.operands.to_lowercase().contains("pc") {
        return true;
    }

    false
}

/// Check if instruction is a function call
///
/// Function calls in ARM are typically:
/// - `bl` - Branch with Link (32-bit ARM)
/// - `blx` - Branch with Link and Exchange (ARM to Thumb/Thumb to ARM)
/// - `blx r0` etc. - Indirect calls via register
///
/// # Arguments
/// * `inst` - The instruction to analyze
///
/// # Returns
/// True if the instruction is a function call
pub fn is_function_call(inst: &Instruction) -> bool {
    let mnemonic = inst.mnemonic.to_lowercase();

    // BL and BLX are the primary call instructions
    mnemonic == "bl" || mnemonic == "blx"
}

/// Estimate function complexity based on a single instruction
///
/// This provides a rough complexity metric for an instruction:
/// - Basic instructions (move, arithmetic): 1
/// - Memory operations (load, store): 2
/// - Conditional branches: 3
/// - Unconditional branches: 2
/// - Function calls: 5
/// - Complex operations: varies
///
/// # Arguments
/// * `inst` - The instruction to analyze
///
/// # Returns
/// Estimated complexity score (higher = more complex)
pub fn estimate_function_complexity(inst: &Instruction) -> u32 {
    let mnemonic = inst.mnemonic.to_lowercase();

    // Function calls are most complex (indicate sub-tasks)
    if mnemonic == "bl" || mnemonic == "blx" {
        return 5;
    }

    // Conditional branches indicate branching logic
    if is_conditional_branch(&mnemonic) {
        return 3;
    }

    // Unconditional branches are simpler jumps
    if mnemonic == "b" {
        return 2;
    }

    // Memory operations (load/store) are moderately complex
    if mnemonic.starts_with("ldr")
        || mnemonic.starts_with("str")
        || mnemonic.starts_with("ldm")
        || mnemonic.starts_with("stm") {
        return 2;
    }

    // Push/Pop are stack operations
    if mnemonic == "push" || mnemonic == "pop" {
        return 1;
    }

    // Arithmetic operations
    if is_arithmetic_op(&mnemonic) {
        return 1;
    }

    // Move operations
    if mnemonic == "mov" || mnemonic == "movw" || mnemonic == "movt" {
        return 1;
    }

    // Default for unknown instructions
    1
}

/// Check if instruction is a conditional branch
fn is_conditional_branch(mnemonic: &str) -> bool {
    mnemonic == "beq"    // Branch if equal
        || mnemonic == "bne"    // Branch if not equal
        || mnemonic == "blt"    // Branch if less than
        || mnemonic == "ble"    // Branch if less than or equal
        || mnemonic == "bgt"    // Branch if greater than
        || mnemonic == "bge"    // Branch if greater than or equal
        || mnemonic == "bls"    // Branch if lower or same (unsigned)
        || mnemonic == "bhi"    // Branch if higher (unsigned)
        || mnemonic == "bcc"    // Branch if carry clear
        || mnemonic == "bcs"    // Branch if carry set
        || mnemonic == "bpl"    // Branch if plus (positive)
        || mnemonic == "bmi"    // Branch if minus (negative)
        || mnemonic == "bvs"    // Branch if overflow set
        || mnemonic == "bvc"    // Branch if overflow clear
        || mnemonic == "bah"    // Branch if always (rarely used)
        || mnemonic == "bnv"    // Branch if never (never taken)
}

/// Check if instruction is an arithmetic operation
fn is_arithmetic_op(mnemonic: &str) -> bool {
    mnemonic == "add"
        || mnemonic == "sub"
        || mnemonic == "mul"
        || mnemonic == "and"
        || mnemonic == "orr"
        || mnemonic == "eor"
        || mnemonic == "lsl"
        || mnemonic == "lsr"
        || mnemonic == "asr"
        || mnemonic == "ror"
        || mnemonic == "bic"
        || mnemonic == "mvn"
        || mnemonic == "cmp"
        || mnemonic == "cmn"
        || mnemonic == "tst"
        || mnemonic == "teq"
}

#[cfg(test)]
mod tests {
    use super::*;

    // Helper function to create test instructions
    fn make_inst(addr: u32, mnemonic: &str, operands: &str) -> Instruction {
        Instruction::new(
            addr,
            vec![],
            mnemonic.to_string(),
            operands.to_string(),
        )
    }

    // ============ Tests for is_arm_function_start ============

    #[test]
    fn test_push_lr_is_function_start() {
        let inst = make_inst(0x1000, "push", "{lr}");
        assert!(is_arm_function_start(&inst));
    }

    #[test]
    fn test_push_multiple_with_lr_is_function_start() {
        let inst = make_inst(0x1000, "push", "{r7, lr}");
        assert!(is_arm_function_start(&inst));
    }

    #[test]
    fn test_push_r11_lr_is_function_start() {
        let inst = make_inst(0x1000, "push", "{r11, lr}");
        assert!(is_arm_function_start(&inst));
    }

    #[test]
    fn test_stmdb_sp_with_lr_is_function_start() {
        let inst = make_inst(0x1000, "stmdb", "sp!, {r7, lr}");
        assert!(is_arm_function_start(&inst));
    }

    #[test]
    fn test_push_without_lr_not_function_start() {
        let inst = make_inst(0x1000, "push", "{r4, r5}");
        assert!(!is_arm_function_start(&inst));
    }

    #[test]
    fn test_other_instruction_not_function_start() {
        let inst = make_inst(0x1000, "mov", "r0, #1");
        assert!(!is_arm_function_start(&inst));
    }

    // ============ Tests for is_arm_function_end ============

    #[test]
    fn test_bx_lr_is_function_end() {
        let inst = make_inst(0x2000, "bx", "lr");
        assert!(is_arm_function_end(&inst));
    }

    #[test]
    fn test_pop_pc_is_function_end() {
        let inst = make_inst(0x2000, "pop", "{pc}");
        assert!(is_arm_function_end(&inst));
    }

    #[test]
    fn test_pop_multiple_with_pc_is_function_end() {
        let inst = make_inst(0x2000, "pop", "{r4, r7, pc}");
        assert!(is_arm_function_end(&inst));
    }

    #[test]
    fn test_ldmia_sp_with_pc_is_function_end() {
        let inst = make_inst(0x2000, "ldmia", "sp!, {r4, r7, pc}");
        assert!(is_arm_function_end(&inst));
    }

    #[test]
    fn test_pop_without_pc_not_function_end() {
        let inst = make_inst(0x2000, "pop", "{r4, r5}");
        assert!(!is_arm_function_end(&inst));
    }

    #[test]
    fn test_bx_r0_not_function_end() {
        let inst = make_inst(0x2000, "bx", "r0");
        assert!(!is_arm_function_end(&inst));
    }

    // ============ Tests for is_function_call ============

    #[test]
    fn test_bl_is_function_call() {
        let inst = make_inst(0x1500, "bl", "#0x2000");
        assert!(is_function_call(&inst));
    }

    #[test]
    fn test_blx_is_function_call() {
        let inst = make_inst(0x1500, "blx", "#0x2000");
        assert!(is_function_call(&inst));
    }

    #[test]
    fn test_blx_register_is_function_call() {
        let inst = make_inst(0x1500, "blx", "r0");
        assert!(is_function_call(&inst));
    }

    #[test]
    fn test_b_not_function_call() {
        let inst = make_inst(0x1500, "b", "#0x2000");
        assert!(!is_function_call(&inst));
    }

    #[test]
    fn test_mov_not_function_call() {
        let inst = make_inst(0x1500, "mov", "r0, r1");
        assert!(!is_function_call(&inst));
    }

    // ============ Tests for estimate_function_complexity ============

    #[test]
    fn test_bl_has_high_complexity() {
        let inst = make_inst(0x1500, "bl", "#0x2000");
        assert_eq!(estimate_function_complexity(&inst), 5);
    }

    #[test]
    fn test_conditional_branch_has_moderate_complexity() {
        let inst = make_inst(0x1500, "beq", "#0x2000");
        assert_eq!(estimate_function_complexity(&inst), 3);
    }

    #[test]
    fn test_blx_has_high_complexity() {
        let inst = make_inst(0x1500, "blx", "#0x3000");
        assert_eq!(estimate_function_complexity(&inst), 5);
    }

    #[test]
    fn test_unconditional_branch_has_low_complexity() {
        let inst = make_inst(0x1500, "b", "#0x2000");
        assert_eq!(estimate_function_complexity(&inst), 2);
    }

    #[test]
    fn test_ldr_has_moderate_complexity() {
        let inst = make_inst(0x1500, "ldr", "r0, [r1]");
        assert_eq!(estimate_function_complexity(&inst), 2);
    }

    #[test]
    fn test_str_has_moderate_complexity() {
        let inst = make_inst(0x1500, "str", "r0, [r1]");
        assert_eq!(estimate_function_complexity(&inst), 2);
    }

    #[test]
    fn test_mov_has_low_complexity() {
        let inst = make_inst(0x1500, "mov", "r0, r1");
        assert_eq!(estimate_function_complexity(&inst), 1);
    }

    #[test]
    fn test_push_has_low_complexity() {
        let inst = make_inst(0x1500, "push", "{r4, r5}");
        assert_eq!(estimate_function_complexity(&inst), 1);
    }

    #[test]
    fn test_pop_has_low_complexity() {
        let inst = make_inst(0x1500, "pop", "{r4, r5}");
        assert_eq!(estimate_function_complexity(&inst), 1);
    }

    #[test]
    fn test_add_has_low_complexity() {
        let inst = make_inst(0x1500, "add", "r0, r0, r1");
        assert_eq!(estimate_function_complexity(&inst), 1);
    }

    #[test]
    fn test_bne_conditional_branch() {
        let inst = make_inst(0x1500, "bne", "#0x2000");
        assert_eq!(estimate_function_complexity(&inst), 3);
    }

    #[test]
    fn test_ldm_stack_operation() {
        let inst = make_inst(0x1500, "ldm", "sp!, {r4, r5}");
        assert_eq!(estimate_function_complexity(&inst), 2);
    }

    #[test]
    fn test_stm_stack_operation() {
        let inst = make_inst(0x1500, "stm", "sp!, {r4, r5}");
        assert_eq!(estimate_function_complexity(&inst), 2);
    }
}
