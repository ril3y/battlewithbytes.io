//! Calling convention analysis for different architectures
//!
//! This module provides a generic trait for analyzing calling conventions
//! and detecting function arguments at call sites.

use crate::traits::Instruction;

/// Trait for architecture-specific calling conventions
///
/// Different architectures have different conventions for passing arguments
/// to functions. This trait abstracts those differences.
pub trait CallingConvention {
    /// Get the list of registers used for passing arguments (in order)
    ///
    /// # Returns
    /// Slice of register names in the order they're used for arguments.
    /// For ARM: ["r0", "r1", "r2", "r3"]
    fn arg_registers(&self) -> &[&str];

    /// Get the primary return value register
    ///
    /// # Returns
    /// The register name used for return values.
    /// For ARM: "r0"
    fn return_register(&self) -> &str;

    /// Detect arguments passed to a function call
    ///
    /// Analyzes instructions preceding a call to determine what arguments
    /// are being passed and where they're coming from.
    ///
    /// # Arguments
    /// * `call_instr` - The call instruction itself
    /// * `preceding_instrs` - Instructions before the call (typically 4-8 instructions)
    ///
    /// # Returns
    /// Vector of (argument_number, location) tuples where location is a
    /// register name like "r0" or stack location like "stack+4"
    fn detect_args(
        &self,
        call_instr: &Instruction,
        preceding_instrs: &[Instruction],
    ) -> Vec<(u8, String)>;

    /// Get the stack pointer register name
    fn stack_pointer(&self) -> &str;

    /// Get the link register (return address) name
    fn link_register(&self) -> &str;
}

/// ARM AAPCS (ARM Architecture Procedure Call Standard) calling convention
///
/// Arguments:
/// - First 4 arguments in r0-r3
/// - Additional arguments on stack
/// - Return value in r0 (and r1 for 64-bit values)
pub struct ArmCallingConvention;

impl CallingConvention for ArmCallingConvention {
    fn arg_registers(&self) -> &[&str] {
        &["r0", "r1", "r2", "r3"]
    }

    fn return_register(&self) -> &str {
        "r0"
    }

    fn stack_pointer(&self) -> &str {
        "sp"
    }

    fn link_register(&self) -> &str {
        "lr"
    }

    fn detect_args(
        &self,
        _call_instr: &Instruction,
        preceding_instrs: &[Instruction],
    ) -> Vec<(u8, String)> {
        let mut args = Vec::new();
        let arg_regs = self.arg_registers();

        // Track which argument registers have been written to
        let mut reg_written = [false; 4];
        let mut stack_args = 0u8;

        // Scan backwards through preceding instructions
        for instr in preceding_instrs.iter().rev() {
            let mnemonic = instr.mnemonic.to_lowercase();
            let operands = instr.operands.to_lowercase();

            // Check for moves to argument registers
            if mnemonic == "mov" || mnemonic == "movw" || mnemonic == "movt" {
                // Parse "mov r0, ..." or "movw r1, #123"
                if let Some(dest_reg) = extract_first_register(&operands) {
                    for (i, &arg_reg) in arg_regs.iter().enumerate() {
                        if dest_reg == arg_reg && !reg_written[i] {
                            args.push((i as u8, arg_reg.to_string()));
                            reg_written[i] = true;
                        }
                    }
                }
            }

            // Check for loads to argument registers (ldr r0, ...)
            else if mnemonic.starts_with("ldr") {
                if let Some(dest_reg) = extract_first_register(&operands) {
                    for (i, &arg_reg) in arg_regs.iter().enumerate() {
                        if dest_reg == arg_reg && !reg_written[i] {
                            args.push((i as u8, arg_reg.to_string()));
                            reg_written[i] = true;
                        }
                    }
                }
            }

            // Check for stack pushes (arguments passed on stack)
            else if mnemonic == "push" || mnemonic.starts_with("str") && operands.contains("sp") {
                // Track stack arguments
                stack_args += 1;
            }
        }

        // Add detected stack arguments
        for i in 0..stack_args {
            let offset = i * 4;
            args.push((
                4 + i,
                format!("stack+{}", offset),
            ));
        }

        // Sort by argument number
        args.sort_by_key(|&(arg_num, _)| arg_num);
        args
    }
}

/// Extract the first register from an operand string
///
/// # Arguments
/// * `operands` - Operand string like "r0, r1, #4" or "r2, [r3, #8]"
///
/// # Returns
/// The first register name if found
fn extract_first_register(operands: &str) -> Option<&str> {
    // Split on comma and take first part
    let first_operand = operands.split(',').next()?.trim();

    // Remove any brackets
    let cleaned = first_operand.trim_start_matches('[').trim_end_matches(']').trim();

    // Check if it's a valid register
    if cleaned.starts_with('r') || cleaned == "sp" || cleaned == "lr" || cleaned == "pc" {
        Some(cleaned)
    } else {
        None
    }
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

    #[test]
    fn test_arm_calling_convention_basics() {
        let cc = ArmCallingConvention;
        assert_eq!(cc.arg_registers(), &["r0", "r1", "r2", "r3"]);
        assert_eq!(cc.return_register(), "r0");
        assert_eq!(cc.stack_pointer(), "sp");
        assert_eq!(cc.link_register(), "lr");
    }

    #[test]
    fn test_detect_single_argument() {
        let cc = ArmCallingConvention;
        let preceding = vec![
            make_inst(0x1000, "mov", "r0, #10"),
        ];
        let call = make_inst(0x1004, "bl", "#0x2000");

        let args = cc.detect_args(&call, &preceding);
        assert_eq!(args.len(), 1);
        assert_eq!(args[0], (0, "r0".to_string()));
    }

    #[test]
    fn test_detect_multiple_arguments() {
        let cc = ArmCallingConvention;
        let preceding = vec![
            make_inst(0x1000, "mov", "r0, #1"),
            make_inst(0x1002, "mov", "r1, #2"),
            make_inst(0x1004, "ldr", "r2, [pc, #8]"),
            make_inst(0x1006, "movw", "r3, #100"),
        ];
        let call = make_inst(0x1008, "bl", "#0x2000");

        let args = cc.detect_args(&call, &preceding);
        assert_eq!(args.len(), 4);
        assert_eq!(args[0], (0, "r0".to_string()));
        assert_eq!(args[1], (1, "r1".to_string()));
        assert_eq!(args[2], (2, "r2".to_string()));
        assert_eq!(args[3], (3, "r3".to_string()));
    }

    #[test]
    fn test_detect_no_arguments() {
        let cc = ArmCallingConvention;
        let preceding = vec![
            make_inst(0x1000, "push", "{r7, lr}"),
            make_inst(0x1002, "sub", "sp, sp, #8"),
        ];
        let call = make_inst(0x1004, "bl", "#0x2000");

        let args = cc.detect_args(&call, &preceding);
        // May detect stack pushes but no register arguments
        assert!(args.is_empty() || args.iter().all(|(n, _)| *n >= 4));
    }

    #[test]
    fn test_extract_first_register() {
        assert_eq!(extract_first_register("r0, r1"), Some("r0"));
        assert_eq!(extract_first_register("r2, #100"), Some("r2"));
        assert_eq!(extract_first_register("[r3, #4]"), Some("r3"));
        assert_eq!(extract_first_register("sp, r7"), Some("sp"));
        assert_eq!(extract_first_register("#100, r0"), None);
        assert_eq!(extract_first_register(""), None);
    }

    #[test]
    fn test_detect_ldr_arguments() {
        let cc = ArmCallingConvention;
        let preceding = vec![
            make_inst(0x1000, "ldr", "r0, [pc, #16]"),
            make_inst(0x1002, "ldr", "r1, [sp, #4]"),
        ];
        let call = make_inst(0x1004, "bl", "#0x2000");

        let args = cc.detect_args(&call, &preceding);
        assert!(args.len() >= 2);
        assert!(args.contains(&(0, "r0".to_string())));
        assert!(args.contains(&(1, "r1".to_string())));
    }

    #[test]
    fn test_ignore_non_argument_registers() {
        let cc = ArmCallingConvention;
        let preceding = vec![
            make_inst(0x1000, "mov", "r4, #5"),
            make_inst(0x1002, "mov", "r0, #10"),
        ];
        let call = make_inst(0x1004, "bl", "#0x2000");

        let args = cc.detect_args(&call, &preceding);
        // Should only detect r0, not r4
        assert_eq!(args.len(), 1);
        assert_eq!(args[0], (0, "r0".to_string()));
    }

    #[test]
    fn test_movt_instruction() {
        let cc = ArmCallingConvention;
        let preceding = vec![
            make_inst(0x1000, "movw", "r0, #0x1234"),
            make_inst(0x1002, "movt", "r0, #0x5678"),
        ];
        let call = make_inst(0x1004, "bl", "#0x2000");

        let args = cc.detect_args(&call, &preceding);
        // Both movw and movt write to r0, should only count once
        assert_eq!(args.len(), 1);
        assert_eq!(args[0], (0, "r0".to_string()));
    }
}
