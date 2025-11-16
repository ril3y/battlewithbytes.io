//! Stack frame analysis and local variable tracking
//!
//! This module analyzes stack operations to:
//! - Detect stack frame allocation
//! - Track local variables
//! - Identify saved registers vs local variables
//! - Calculate stack frame sizes

use crate::traits::Instruction;
use crate::types::{FunctionInfo, StackAccessType, StackVariable};
use std::collections::HashMap;

/// Stack frame analyzer
///
/// Analyzes stack operations within a function to identify:
/// - Stack frame size
/// - Local variables and their offsets
/// - Saved registers
/// - Stack access patterns
pub struct StackAnalyzer;

impl StackAnalyzer {
    /// Create a new stack analyzer
    pub fn new() -> Self {
        Self
    }

    /// Analyze stack usage for a function
    ///
    /// # Arguments
    /// * `function` - The function to analyze (will be modified with stack info)
    /// * `instructions` - All instructions in this function
    ///
    /// # Returns
    /// Updated function with stack analysis results
    pub fn analyze_function(&self, function: &mut FunctionInfo, instructions: &[Instruction]) {
        // Step 1: Detect stack allocation
        let stack_alloc = self.detect_stack_allocation(instructions);
        function.stack_frame_size = stack_alloc;

        // Step 2: Track stack accesses
        let stack_vars = self.track_stack_accesses(function.start_address, instructions);
        function.stack_vars = stack_vars;
    }

    /// Detect stack frame allocation size
    ///
    /// Looks for instructions like:
    /// - `sub sp, sp, #N` - Allocate N bytes
    /// - `push {...}` - Each register = 4 bytes
    ///
    /// # Arguments
    /// * `instructions` - Instructions in the function
    ///
    /// # Returns
    /// Total stack frame size in bytes
    fn detect_stack_allocation(&self, instructions: &[Instruction]) -> u32 {
        let mut total_size = 0u32;

        for instr in instructions {
            let mnemonic = instr.mnemonic.to_lowercase();
            let operands = instr.operands.to_lowercase();

            // Check for "sub sp, sp, #N"
            if mnemonic == "sub" && operands.starts_with("sp") && operands.contains("sp") {
                if let Some(size) = self.extract_immediate(&operands) {
                    total_size += size;
                }
            }

            // Check for "push {...}" - count registers
            else if mnemonic == "push" {
                let reg_count = self.count_registers_in_list(&operands);
                total_size += reg_count * 4;
            }

            // Check for "add sp, sp, #N" (stack deallocation - subtract from total)
            else if mnemonic == "add" && operands.starts_with("sp") && operands.contains("sp") {
                if let Some(size) = self.extract_immediate(&operands) {
                    total_size = total_size.saturating_sub(size);
                }
            }
        }

        total_size
    }

    /// Track all stack accesses to identify variables
    ///
    /// Analyzes load/store instructions that access stack memory:
    /// - `str rX, [sp, #offset]` - Store to stack
    /// - `ldr rX, [sp, #offset]` - Load from stack
    ///
    /// # Arguments
    /// * `function_start` - Address where function starts
    /// * `instructions` - Instructions in the function
    ///
    /// # Returns
    /// Vector of detected stack variables
    fn track_stack_accesses(
        &self,
        function_start: u32,
        instructions: &[Instruction],
    ) -> Vec<StackVariable> {
        let mut accesses: HashMap<i32, StackVariable> = HashMap::new();

        for instr in instructions {
            let mnemonic = instr.mnemonic.to_lowercase();
            let operands = instr.operands.to_lowercase();

            // Check for stack stores: str rX, [sp, #offset]
            if mnemonic.starts_with("str") && operands.contains("sp") {
                if let Some(offset) = self.extract_stack_offset(&operands) {
                    let size = self.get_store_size(&mnemonic);
                    let access_type = StackAccessType::Write;

                    accesses
                        .entry(offset)
                        .and_modify(|var| var.merge_access(access_type))
                        .or_insert_with(|| {
                            StackVariable::new(function_start, offset, size, access_type)
                        });
                }
            }

            // Check for stack loads: ldr rX, [sp, #offset]
            else if mnemonic.starts_with("ldr") && operands.contains("sp") {
                if let Some(offset) = self.extract_stack_offset(&operands) {
                    let size = self.get_load_size(&mnemonic);
                    let access_type = StackAccessType::Read;

                    accesses
                        .entry(offset)
                        .and_modify(|var| var.merge_access(access_type))
                        .or_insert_with(|| {
                            StackVariable::new(function_start, offset, size, access_type)
                        });
                }
            }
        }

        // Convert to sorted vector
        let mut vars: Vec<StackVariable> = accesses.into_values().collect();
        vars.sort_by_key(|v| v.offset);
        vars
    }

    /// Extract immediate value from operand string
    ///
    /// # Examples
    /// - "sp, sp, #16" -> Some(16)
    /// - "sp, #0x20" -> Some(32)
    fn extract_immediate(&self, operands: &str) -> Option<u32> {
        // Find the '#' character
        let parts: Vec<&str> = operands.split('#').collect();
        if parts.len() < 2 {
            return None;
        }

        // Extract the number after '#'
        let num_str = parts[1]
            .split(',')
            .next()?
            .trim()
            .trim_end_matches(']')
            .trim();

        // Parse as hex or decimal
        if num_str.starts_with("0x") || num_str.starts_with("0X") {
            u32::from_str_radix(&num_str[2..], 16).ok()
        } else {
            num_str.parse::<u32>().ok()
        }
    }

    /// Extract stack offset from operand string
    ///
    /// # Examples
    /// - "[sp, #4]" -> Some(4)
    /// - "[sp, #-8]" -> Some(-8)
    /// - "[sp]" -> Some(0)
    fn extract_stack_offset(&self, operands: &str) -> Option<i32> {
        // Find the bracket containing sp
        let bracket_content = operands
            .split('[')
            .nth(1)?
            .split(']')
            .next()?;

        // Check if it contains sp
        if !bracket_content.contains("sp") {
            return None;
        }

        // Look for offset after '#'
        if bracket_content.contains('#') {
            let parts: Vec<&str> = bracket_content.split('#').collect();
            if parts.len() < 2 {
                return Some(0);
            }

            let num_str = parts[1].trim().trim_end_matches(']');

            // Handle negative offsets
            if num_str.starts_with('-') {
                if let Some(hex_str) = num_str.strip_prefix("-0x") {
                    return i32::from_str_radix(hex_str, 16).ok().map(|n| -n);
                } else {
                    return num_str.parse::<i32>().ok();
                }
            } else {
                // Positive offset
                if num_str.starts_with("0x") {
                    return i32::from_str_radix(&num_str[2..], 16).ok();
                } else {
                    return num_str.parse::<i32>().ok();
                }
            }
        }

        // No offset specified, default to 0
        Some(0)
    }

    /// Count registers in a register list like "{r4, r5, r7, lr}"
    fn count_registers_in_list(&self, operands: &str) -> u32 {
        let list = operands
            .trim_start_matches('{')
            .trim_end_matches('}');

        if list.is_empty() {
            return 0;
        }

        list.split(',').count() as u32
    }

    /// Get the size of a store operation based on mnemonic
    ///
    /// - str -> 4 bytes (word)
    /// - strh -> 2 bytes (halfword)
    /// - strb -> 1 byte
    fn get_store_size(&self, mnemonic: &str) -> u8 {
        if mnemonic.contains("strb") {
            1
        } else if mnemonic.contains("strh") {
            2
        } else {
            4 // str, strd
        }
    }

    /// Get the size of a load operation based on mnemonic
    ///
    /// - ldr -> 4 bytes (word)
    /// - ldrh -> 2 bytes (halfword)
    /// - ldrb -> 1 byte
    fn get_load_size(&self, mnemonic: &str) -> u8 {
        if mnemonic.contains("ldrb") {
            1
        } else if mnemonic.contains("ldrh") {
            2
        } else {
            4 // ldr, ldrd
        }
    }
}

impl Default for StackAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_inst(addr: u32, mnemonic: &str, operands: &str) -> Instruction {
        Instruction::new(
            addr,
            vec![],
            mnemonic.to_string(),
            operands.to_string(),
        )
    }

    #[test]
    fn test_detect_stack_allocation_sub() {
        let analyzer = StackAnalyzer::new();
        let instructions = vec![
            make_inst(0x1000, "sub", "sp, sp, #16"),
        ];

        let size = analyzer.detect_stack_allocation(&instructions);
        assert_eq!(size, 16);
    }

    #[test]
    fn test_detect_stack_allocation_push() {
        let analyzer = StackAnalyzer::new();
        let instructions = vec![
            make_inst(0x1000, "push", "{r4, r5, r7, lr}"),
        ];

        let size = analyzer.detect_stack_allocation(&instructions);
        assert_eq!(size, 16); // 4 registers * 4 bytes
    }

    #[test]
    fn test_detect_stack_allocation_combined() {
        let analyzer = StackAnalyzer::new();
        let instructions = vec![
            make_inst(0x1000, "push", "{r7, lr}"),
            make_inst(0x1004, "sub", "sp, sp, #24"),
        ];

        let size = analyzer.detect_stack_allocation(&instructions);
        assert_eq!(size, 32); // 8 (push) + 24 (sub)
    }

    #[test]
    fn test_track_stack_store() {
        let analyzer = StackAnalyzer::new();
        let instructions = vec![
            make_inst(0x1000, "str", "r0, [sp, #4]"),
        ];

        let vars = analyzer.track_stack_accesses(0x1000, &instructions);
        assert_eq!(vars.len(), 1);
        assert_eq!(vars[0].offset, 4);
        assert_eq!(vars[0].access_type, StackAccessType::Write);
        assert_eq!(vars[0].size, 4);
    }

    #[test]
    fn test_track_stack_load() {
        let analyzer = StackAnalyzer::new();
        let instructions = vec![
            make_inst(0x1000, "ldr", "r0, [sp, #8]"),
        ];

        let vars = analyzer.track_stack_accesses(0x1000, &instructions);
        assert_eq!(vars.len(), 1);
        assert_eq!(vars[0].offset, 8);
        assert_eq!(vars[0].access_type, StackAccessType::Read);
    }

    #[test]
    fn test_track_stack_read_write() {
        let analyzer = StackAnalyzer::new();
        let instructions = vec![
            make_inst(0x1000, "str", "r0, [sp, #4]"),
            make_inst(0x1004, "ldr", "r1, [sp, #4]"),
        ];

        let vars = analyzer.track_stack_accesses(0x1000, &instructions);
        assert_eq!(vars.len(), 1);
        assert_eq!(vars[0].offset, 4);
        assert_eq!(vars[0].access_type, StackAccessType::ReadWrite);
    }

    #[test]
    fn test_extract_immediate_decimal() {
        let analyzer = StackAnalyzer::new();
        assert_eq!(analyzer.extract_immediate("sp, sp, #16"), Some(16));
        assert_eq!(analyzer.extract_immediate("sp, #100"), Some(100));
    }

    #[test]
    fn test_extract_immediate_hex() {
        let analyzer = StackAnalyzer::new();
        assert_eq!(analyzer.extract_immediate("sp, sp, #0x10"), Some(16));
        assert_eq!(analyzer.extract_immediate("sp, #0x20"), Some(32));
    }

    #[test]
    fn test_extract_stack_offset_positive() {
        let analyzer = StackAnalyzer::new();
        assert_eq!(analyzer.extract_stack_offset("[sp, #4]"), Some(4));
        assert_eq!(analyzer.extract_stack_offset("[sp, #0x8]"), Some(8));
    }

    #[test]
    fn test_extract_stack_offset_negative() {
        let analyzer = StackAnalyzer::new();
        assert_eq!(analyzer.extract_stack_offset("[sp, #-4]"), Some(-4));
        assert_eq!(analyzer.extract_stack_offset("[sp, #-0x8]"), Some(-8));
    }

    #[test]
    fn test_extract_stack_offset_zero() {
        let analyzer = StackAnalyzer::new();
        assert_eq!(analyzer.extract_stack_offset("[sp]"), Some(0));
    }

    #[test]
    fn test_count_registers() {
        let analyzer = StackAnalyzer::new();
        assert_eq!(analyzer.count_registers_in_list("{r4}"), 1);
        assert_eq!(analyzer.count_registers_in_list("{r4, r5}"), 2);
        assert_eq!(analyzer.count_registers_in_list("{r4, r5, r7, lr}"), 4);
        assert_eq!(analyzer.count_registers_in_list("{}"), 0);
    }

    #[test]
    fn test_get_store_size() {
        let analyzer = StackAnalyzer::new();
        assert_eq!(analyzer.get_store_size("str"), 4);
        assert_eq!(analyzer.get_store_size("strh"), 2);
        assert_eq!(analyzer.get_store_size("strb"), 1);
    }

    #[test]
    fn test_get_load_size() {
        let analyzer = StackAnalyzer::new();
        assert_eq!(analyzer.get_load_size("ldr"), 4);
        assert_eq!(analyzer.get_load_size("ldrh"), 2);
        assert_eq!(analyzer.get_load_size("ldrb"), 1);
    }

    #[test]
    fn test_analyze_function() {
        let analyzer = StackAnalyzer::new();
        let instructions = vec![
            make_inst(0x1000, "push", "{r7, lr}"),
            make_inst(0x1004, "sub", "sp, sp, #16"),
            make_inst(0x1008, "str", "r0, [sp, #4]"),
            make_inst(0x100c, "ldr", "r1, [sp, #4]"),
            make_inst(0x1010, "add", "sp, sp, #16"),
            make_inst(0x1014, "pop", "{r7, pc}"),
        ];

        let mut function = FunctionInfo::new(0x1000);
        analyzer.analyze_function(&mut function, &instructions);

        assert_eq!(function.stack_frame_size, 8); // 8 (push) + 16 (sub) - 16 (add)
        assert_eq!(function.stack_vars.len(), 1);
        assert_eq!(function.stack_vars[0].offset, 4);
        assert_eq!(function.stack_vars[0].access_type, StackAccessType::ReadWrite);
    }

    #[test]
    fn test_multiple_stack_variables() {
        let analyzer = StackAnalyzer::new();
        let instructions = vec![
            make_inst(0x1000, "str", "r0, [sp, #0]"),
            make_inst(0x1004, "str", "r1, [sp, #4]"),
            make_inst(0x1008, "str", "r2, [sp, #8]"),
        ];

        let vars = analyzer.track_stack_accesses(0x1000, &instructions);
        assert_eq!(vars.len(), 3);
        assert_eq!(vars[0].offset, 0);
        assert_eq!(vars[1].offset, 4);
        assert_eq!(vars[2].offset, 8);
    }

    #[test]
    fn test_strb_ldrb_sizes() {
        let analyzer = StackAnalyzer::new();
        let instructions = vec![
            make_inst(0x1000, "strb", "r0, [sp, #0]"),
            make_inst(0x1004, "ldrb", "r1, [sp, #0]"),
        ];

        let vars = analyzer.track_stack_accesses(0x1000, &instructions);
        assert_eq!(vars.len(), 1);
        assert_eq!(vars[0].size, 1);
    }

    #[test]
    fn test_strh_ldrh_sizes() {
        let analyzer = StackAnalyzer::new();
        let instructions = vec![
            make_inst(0x1000, "strh", "r0, [sp, #0]"),
            make_inst(0x1004, "ldrh", "r1, [sp, #0]"),
        ];

        let vars = analyzer.track_stack_accesses(0x1000, &instructions);
        assert_eq!(vars.len(), 1);
        assert_eq!(vars[0].size, 2);
    }
}
