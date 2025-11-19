//! Calling convention analysis for different architectures
//!
//! This module provides analyzers for detecting function arguments at call sites
//! by tracking register values and stack operations.

use crate::traits::Instruction;
use crate::types::{ArgAnnotation, FunctionInfo};
use std::collections::HashMap;

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

/// Calling convention analyzer with value tracking
///
/// Analyzes function calls to track what values are being passed as arguments.
/// Uses a sliding window to track register values leading up to each call.
pub struct CallingConventionAnalyzer {
    /// Number of instructions to look back when analyzing call sites
    lookback_window: usize,
}

impl CallingConventionAnalyzer {
    /// Create a new analyzer
    ///
    /// # Arguments
    /// * `lookback_window` - Number of instructions before call to analyze (default 8)
    pub fn new(lookback_window: usize) -> Self {
        Self { lookback_window }
    }

    /// Analyze function to detect all argument passing at call sites
    ///
    /// # Arguments
    /// * `function` - Function to analyze (will be modified with arg annotations)
    /// * `instructions` - All instructions in the function
    pub fn analyze_function(&self, function: &mut FunctionInfo, instructions: &[Instruction]) {
        // Find all call instructions in this function
        let calls = self.find_calls(instructions);

        for call_addr in calls {
            // Find the call instruction
            if let Some(call_idx) = instructions.iter().position(|i| i.address == call_addr) {
                let call_instr = &instructions[call_idx];

                // Extract target address from call
                if let Some(target_addr) = self.extract_call_target(call_instr) {
                    // Get preceding instructions window
                    let start_idx = call_idx.saturating_sub(self.lookback_window);
                    let preceding = &instructions[start_idx..call_idx];

                    // Track values in argument registers
                    let args = self.track_argument_values(preceding, call_instr);

                    // Create annotation if we found any arguments
                    if !args.is_empty() {
                        let annotation = ArgAnnotation::new(call_addr, target_addr, args);
                        function.arg_annotations.push(annotation);
                    }
                }
            }
        }
    }

    /// Find all call instructions in the given instruction slice
    fn find_calls(&self, instructions: &[Instruction]) -> Vec<u32> {
        instructions
            .iter()
            .filter(|i| {
                let mnemonic = i.mnemonic.to_lowercase();
                mnemonic == "bl" || mnemonic == "blx"
            })
            .map(|i| i.address)
            .collect()
    }

    /// Extract target address from a call instruction
    fn extract_call_target(&self, call_instr: &Instruction) -> Option<u32> {
        let operands = call_instr.operands.trim();

        // Handle "#0x1234" format
        if let Some(hex_str) = operands.strip_prefix("#0x").or_else(|| operands.strip_prefix("0x")) {
            u32::from_str_radix(hex_str, 16).ok()
        }
        // Handle "#1234" decimal format
        else if let Some(dec_str) = operands.strip_prefix('#') {
            dec_str.parse::<u32>().ok()
        }
        // Handle direct address
        else if let Some(stripped) = operands.strip_prefix("0x") {
            u32::from_str_radix(stripped, 16).ok()
        } else {
            None
        }
    }

    /// Track argument values through preceding instructions
    ///
    /// Analyzes register assignments leading up to a call to determine
    /// what values are being passed in argument registers.
    fn track_argument_values(
        &self,
        preceding_instrs: &[Instruction],
        _call_instr: &Instruction,
    ) -> Vec<(u8, String)> {
        // Register value tracker: register name -> value description
        let mut reg_values: HashMap<String, ArgValue> = HashMap::new();

        // Argument registers (r0-r3 for ARM)
        let arg_registers = ["r0", "r1", "r2", "r3"];

        // Scan forward through preceding instructions to track register values
        for instr in preceding_instrs {
            let mnemonic = instr.mnemonic.to_lowercase();
            let operands = instr.operands.to_lowercase();

            self.track_instruction(&mnemonic, &operands, &mut reg_values);
        }

        // Extract argument values from tracked registers
        let mut args = Vec::new();
        for (i, &reg_name) in arg_registers.iter().enumerate() {
            if let Some(value) = reg_values.get(reg_name) {
                args.push((i as u8, value.to_string()));
            }
        }

        args
    }

    /// Track a single instruction's effect on register values
    fn track_instruction(
        &self,
        mnemonic: &str,
        operands: &str,
        reg_values: &mut HashMap<String, ArgValue>,
    ) {
        match mnemonic {
            // MOV immediate: mov r0, #5
            "mov" | "movw" => {
                if let Some((dest, src)) = self.parse_two_operands(operands) {
                    if let Some(imm) = self.extract_immediate(&src) {
                        reg_values.insert(dest.to_string(), ArgValue::Immediate(imm));
                    } else if self.is_register(&src) {
                        // Register copy: mov r0, r1
                        if let Some(src_val) = reg_values.get(&src).cloned() {
                            reg_values.insert(dest.to_string(), src_val);
                        } else {
                            reg_values.insert(dest.to_string(), ArgValue::Register(src.to_string()));
                        }
                    }
                }
            }

            // MOVT for high 16 bits: movt r0, #0x5678
            "movt" => {
                if let Some((dest, src)) = self.parse_two_operands(operands) {
                    if let Some(high_bits) = self.extract_immediate(&src) {
                        // Combine with existing low bits if present
                        let dest_str = dest.to_string();
                        if let Some(ArgValue::Immediate(low_bits)) = reg_values.get(&dest_str) {
                            let combined = (high_bits << 16) | (low_bits & 0xFFFF);
                            reg_values.insert(dest_str, ArgValue::Immediate(combined));
                        } else {
                            reg_values.insert(dest_str, ArgValue::Immediate(high_bits << 16));
                        }
                    }
                }
            }

            // LDR PC-relative: ldr r0, [pc, #offset]
            "ldr" | "ldrh" | "ldrb" | "ldrsb" | "ldrsh" => {
                if let Some(dest) = extract_first_register(operands) {
                    if operands.contains("[pc") {
                        // PC-relative load
                        if let Some(offset) = self.extract_offset_from_brackets(operands) {
                            reg_values.insert(
                                dest.to_string(),
                                ArgValue::PcRelative(offset),
                            );
                        }
                    } else if operands.contains("[sp") {
                        // Stack load
                        if let Some(offset) = self.extract_offset_from_brackets(operands) {
                            reg_values.insert(
                                dest.to_string(),
                                ArgValue::StackLoad(offset),
                            );
                        }
                    } else {
                        // Memory load from register
                        reg_values.insert(dest.to_string(), ArgValue::MemoryLoad);
                    }
                }
            }

            // ADD/SUB immediate
            "add" | "adds" | "sub" | "subs" => {
                if let Some((dest, rest)) = self.parse_two_operands(operands) {
                    // Parse "r1, #10" or "r1, r2, #10"
                    let parts: Vec<&str> = rest.split(',').map(|s| s.trim()).collect();
                    if parts.len() == 2 {
                        // add r0, r1, #10
                        let src_reg = parts[0];
                        if let Some(imm) = self.extract_immediate(parts[1]) {
                            if let Some(src_val) = reg_values.get(src_reg) {
                                if let ArgValue::Immediate(base) = src_val {
                                    let result = if mnemonic.starts_with("add") {
                                        base.wrapping_add(imm)
                                    } else {
                                        base.wrapping_sub(imm)
                                    };
                                    reg_values.insert(dest.to_string(), ArgValue::Immediate(result));
                                } else {
                                    reg_values.insert(dest.to_string(), ArgValue::Unknown);
                                }
                            }
                        }
                    } else if parts.len() == 1 {
                        // add r0, #10 (dest == src)
                        if let Some(imm) = self.extract_immediate(parts[0]) {
                            let dest_str = dest.to_string();
                            if let Some(ArgValue::Immediate(base)) = reg_values.get(&dest_str) {
                                let result = if mnemonic.starts_with("add") {
                                    base.wrapping_add(imm)
                                } else {
                                    base.wrapping_sub(imm)
                                };
                                reg_values.insert(dest_str, ArgValue::Immediate(result));
                            }
                        }
                    }
                }
            }

            _ => {
                // Unknown instruction - don't track
            }
        }
    }

    /// Parse two-operand instruction like "r0, r1" or "r0, #5"
    fn parse_two_operands<'a>(&self, operands: &'a str) -> Option<(&'a str, String)> {
        let parts: Vec<&str> = operands.split(',').map(|s| s.trim()).collect();
        if parts.len() >= 2 {
            Some((parts[0], parts[1..].join(",")))
        } else {
            None
        }
    }

    /// Extract immediate value from operand string
    fn extract_immediate(&self, operand: &str) -> Option<u32> {
        let trimmed = operand.trim();

        // Handle "#0x1234" hex format
        if let Some(hex_str) = trimmed.strip_prefix("#0x").or_else(|| trimmed.strip_prefix("#0X")) {
            u32::from_str_radix(hex_str, 16).ok()
        }
        // Handle "#1234" decimal format
        else if let Some(dec_str) = trimmed.strip_prefix('#') {
            dec_str.parse::<u32>().ok()
        }
        // Handle "0x1234" hex without #
        else if let Some(hex_str) = trimmed.strip_prefix("0x").or_else(|| trimmed.strip_prefix("0X")) {
            u32::from_str_radix(hex_str, 16).ok()
        } else {
            None
        }
    }

    /// Extract offset from bracket notation like "[pc, #16]"
    fn extract_offset_from_brackets(&self, operands: &str) -> Option<i32> {
        // Find bracket content
        let bracket_content = operands.split('[').nth(1)?.split(']').next()?;

        // Look for offset after comma
        if let Some(offset_part) = bracket_content.split(',').nth(1) {
            let trimmed = offset_part.trim();

            // Handle negative offsets
            if let Some(neg_part) = trimmed.strip_prefix("#-") {
                if let Some(hex_str) = neg_part.strip_prefix("0x") {
                    i32::from_str_radix(hex_str, 16).ok().map(|n| -n)
                } else {
                    neg_part.parse::<i32>().ok().map(|n| -n)
                }
            }
            // Handle positive offsets
            else if let Some(pos_part) = trimmed.strip_prefix('#') {
                if let Some(hex_str) = pos_part.strip_prefix("0x") {
                    i32::from_str_radix(hex_str, 16).ok()
                } else {
                    pos_part.parse::<i32>().ok()
                }
            } else {
                None
            }
        } else {
            // No offset specified
            Some(0)
        }
    }

    /// Check if string represents a register name
    fn is_register(&self, s: &str) -> bool {
        let trimmed = s.trim();
        trimmed.starts_with('r')
            || trimmed == "sp"
            || trimmed == "lr"
            || trimmed == "pc"
            || trimmed == "fp"
    }
}

impl Default for CallingConventionAnalyzer {
    fn default() -> Self {
        Self::new(8)
    }
}

/// Represents a tracked argument value
#[derive(Debug, Clone, PartialEq)]
enum ArgValue {
    /// Immediate constant value
    Immediate(u32),
    /// Value from another register
    Register(String),
    /// PC-relative load (offset from PC)
    PcRelative(i32),
    /// Stack load (offset from SP)
    StackLoad(i32),
    /// Generic memory load
    MemoryLoad,
    /// Unknown/untracked value
    Unknown,
}

impl std::fmt::Display for ArgValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ArgValue::Immediate(val) => write!(f, "0x{:x}", val),
            ArgValue::Register(reg) => write!(f, "{}", reg),
            ArgValue::PcRelative(offset) => write!(f, "[pc+{}]", offset),
            ArgValue::StackLoad(offset) => write!(f, "[sp+{}]", offset),
            ArgValue::MemoryLoad => write!(f, "[mem]"),
            ArgValue::Unknown => write!(f, "?"),
        }
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

    // CallingConventionAnalyzer tests

    #[test]
    fn test_analyzer_track_immediate_value() {
        let analyzer = CallingConventionAnalyzer::new(8);
        let instructions = vec![
            make_inst(0x1000, "mov", "r0, #42"),
            make_inst(0x1004, "bl", "0x2000"),
        ];

        let mut function = FunctionInfo::new(0x1000);
        analyzer.analyze_function(&mut function, &instructions);

        assert_eq!(function.arg_annotations.len(), 1);
        assert_eq!(function.arg_annotations[0].call_address, 0x1004);
        assert_eq!(function.arg_annotations[0].function_target, 0x2000);
        assert_eq!(function.arg_annotations[0].args.len(), 1);
        assert_eq!(function.arg_annotations[0].args[0], (0, "0x2a".to_string()));
    }

    #[test]
    fn test_analyzer_track_register_copy() {
        let analyzer = CallingConventionAnalyzer::new(8);
        let instructions = vec![
            make_inst(0x1000, "mov", "r4, #100"),
            make_inst(0x1004, "mov", "r0, r4"),
            make_inst(0x1008, "bl", "0x2000"),
        ];

        let mut function = FunctionInfo::new(0x1000);
        analyzer.analyze_function(&mut function, &instructions);

        assert_eq!(function.arg_annotations.len(), 1);
        assert_eq!(function.arg_annotations[0].args.len(), 1);
        assert_eq!(function.arg_annotations[0].args[0], (0, "0x64".to_string()));
    }

    #[test]
    fn test_analyzer_track_pc_relative_load() {
        let analyzer = CallingConventionAnalyzer::new(8);
        let instructions = vec![
            make_inst(0x1000, "ldr", "r0, [pc, #16]"),
            make_inst(0x1004, "bl", "0x2000"),
        ];

        let mut function = FunctionInfo::new(0x1000);
        analyzer.analyze_function(&mut function, &instructions);

        assert_eq!(function.arg_annotations.len(), 1);
        assert_eq!(function.arg_annotations[0].args.len(), 1);
        assert_eq!(function.arg_annotations[0].args[0], (0, "[pc+16]".to_string()));
    }

    #[test]
    fn test_analyzer_track_multiple_arguments() {
        let analyzer = CallingConventionAnalyzer::new(8);
        let instructions = vec![
            make_inst(0x1000, "mov", "r0, #1"),
            make_inst(0x1004, "mov", "r1, #2"),
            make_inst(0x1008, "mov", "r2, #3"),
            make_inst(0x100c, "mov", "r3, #4"),
            make_inst(0x1010, "bl", "0x2000"),
        ];

        let mut function = FunctionInfo::new(0x1000);
        analyzer.analyze_function(&mut function, &instructions);

        assert_eq!(function.arg_annotations.len(), 1);
        assert_eq!(function.arg_annotations[0].args.len(), 4);
        assert_eq!(function.arg_annotations[0].args[0], (0, "0x1".to_string()));
        assert_eq!(function.arg_annotations[0].args[1], (1, "0x2".to_string()));
        assert_eq!(function.arg_annotations[0].args[2], (2, "0x3".to_string()));
        assert_eq!(function.arg_annotations[0].args[3], (3, "0x4".to_string()));
    }

    #[test]
    fn test_analyzer_movw_movt_combined() {
        let analyzer = CallingConventionAnalyzer::new(8);
        let instructions = vec![
            make_inst(0x1000, "movw", "r0, #0x1234"),
            make_inst(0x1004, "movt", "r0, #0x5678"),
            make_inst(0x1008, "bl", "0x2000"),
        ];

        let mut function = FunctionInfo::new(0x1000);
        analyzer.analyze_function(&mut function, &instructions);

        assert_eq!(function.arg_annotations.len(), 1);
        assert_eq!(function.arg_annotations[0].args.len(), 1);
        // Should combine: 0x5678 << 16 | 0x1234 = 0x56781234
        assert_eq!(function.arg_annotations[0].args[0], (0, "0x56781234".to_string()));
    }

    #[test]
    fn test_analyzer_add_immediate() {
        let analyzer = CallingConventionAnalyzer::new(8);
        let instructions = vec![
            make_inst(0x1000, "mov", "r0, #10"),
            make_inst(0x1004, "add", "r0, #5"),
            make_inst(0x1008, "bl", "0x2000"),
        ];

        let mut function = FunctionInfo::new(0x1000);
        analyzer.analyze_function(&mut function, &instructions);

        assert_eq!(function.arg_annotations.len(), 1);
        assert_eq!(function.arg_annotations[0].args.len(), 1);
        assert_eq!(function.arg_annotations[0].args[0], (0, "0xf".to_string())); // 10 + 5 = 15
    }

    #[test]
    fn test_analyzer_stack_load() {
        let analyzer = CallingConventionAnalyzer::new(8);
        let instructions = vec![
            make_inst(0x1000, "ldr", "r0, [sp, #8]"),
            make_inst(0x1004, "bl", "0x2000"),
        ];

        let mut function = FunctionInfo::new(0x1000);
        analyzer.analyze_function(&mut function, &instructions);

        assert_eq!(function.arg_annotations.len(), 1);
        assert_eq!(function.arg_annotations[0].args.len(), 1);
        assert_eq!(function.arg_annotations[0].args[0], (0, "[sp+8]".to_string()));
    }

    #[test]
    fn test_analyzer_no_calls() {
        let analyzer = CallingConventionAnalyzer::new(8);
        let instructions = vec![
            make_inst(0x1000, "mov", "r0, #42"),
            make_inst(0x1004, "add", "r1, r0, #1"),
        ];

        let mut function = FunctionInfo::new(0x1000);
        analyzer.analyze_function(&mut function, &instructions);

        assert_eq!(function.arg_annotations.len(), 0);
    }

    #[test]
    fn test_analyzer_multiple_calls() {
        let analyzer = CallingConventionAnalyzer::new(8);
        let instructions = vec![
            make_inst(0x1000, "mov", "r0, #1"),
            make_inst(0x1004, "bl", "0x2000"),
            make_inst(0x1008, "mov", "r0, #2"),
            make_inst(0x100c, "bl", "0x3000"),
        ];

        let mut function = FunctionInfo::new(0x1000);
        analyzer.analyze_function(&mut function, &instructions);

        assert_eq!(function.arg_annotations.len(), 2);
        assert_eq!(function.arg_annotations[0].call_address, 0x1004);
        assert_eq!(function.arg_annotations[0].function_target, 0x2000);
        assert_eq!(function.arg_annotations[0].args[0], (0, "0x1".to_string()));

        assert_eq!(function.arg_annotations[1].call_address, 0x100c);
        assert_eq!(function.arg_annotations[1].function_target, 0x3000);
        assert_eq!(function.arg_annotations[1].args[0], (0, "0x2".to_string()));
    }

    #[test]
    fn test_extract_call_target_formats() {
        let analyzer = CallingConventionAnalyzer::new(8);

        assert_eq!(
            analyzer.extract_call_target(&make_inst(0x1000, "bl", "#0x2000")),
            Some(0x2000)
        );
        assert_eq!(
            analyzer.extract_call_target(&make_inst(0x1000, "bl", "0x2000")),
            Some(0x2000)
        );
        assert_eq!(
            analyzer.extract_call_target(&make_inst(0x1000, "bl", "#8192")),
            Some(8192)
        );
    }

    #[test]
    fn test_transitive_register_tracking() {
        let analyzer = CallingConventionAnalyzer::new(8);
        let instructions = vec![
            make_inst(0x1000, "mov", "r4, #100"),
            make_inst(0x1004, "mov", "r5, r4"),
            make_inst(0x1008, "mov", "r0, r5"),
            make_inst(0x100c, "bl", "0x2000"),
        ];

        let mut function = FunctionInfo::new(0x1000);
        analyzer.analyze_function(&mut function, &instructions);

        assert_eq!(function.arg_annotations.len(), 1);
        assert_eq!(function.arg_annotations[0].args.len(), 1);
        // Should track through r4 -> r5 -> r0
        assert_eq!(function.arg_annotations[0].args[0], (0, "0x64".to_string()));
    }
}
