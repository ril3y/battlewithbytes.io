//! ARM-specific cross-reference extraction
//!
//! This module handles the detection and parsing of cross-references in ARM/Thumb code.
//! It supports:
//! - Branch instructions (b, b.eq, b.ne, etc.)
//! - Call instructions (bl, blx)
//! - PC-relative data references (ldr/str with [pc, #offset])

use crate::traits::{CrossReference, Instruction};
use crate::types::XrefType;

/// Extract cross-references from an ARM instruction
///
/// Analyzes an instruction and returns all cross-references it contains.
/// This includes branches, calls, and PC-relative data accesses.
///
/// # Arguments
/// * `inst` - The instruction to analyze
///
/// # Returns
/// A vector of cross-references found in the instruction (may be empty)
pub fn extract_arm_xrefs(inst: &Instruction) -> Vec<CrossReference> {
    let mut xrefs = Vec::new();

    let mnemonic = inst.mnemonic.to_lowercase();
    let operands = &inst.operands;

    // Branch and Link (function calls)
    if mnemonic == "bl" || mnemonic == "blx" {
        if let Some(target) = parse_branch_target(operands, inst.address) {
            xrefs.push(CrossReference::new(
                inst.address,
                target,
                XrefType::Call,
                inst.mnemonic.clone(),
                inst.operands.clone(),
            ));
        }
    }

    // Unconditional branch
    else if mnemonic == "b" {
        if let Some(target) = parse_branch_target(operands, inst.address) {
            xrefs.push(CrossReference::new(
                inst.address,
                target,
                XrefType::Branch,
                inst.mnemonic.clone(),
                inst.operands.clone(),
            ));
        }
    }

    // Conditional branches (b.eq, b.ne, b.gt, etc.)
    else if mnemonic.starts_with("b.") {
        if let Some(target) = parse_branch_target(operands, inst.address) {
            xrefs.push(CrossReference::new(
                inst.address,
                target,
                XrefType::ConditionalBranch,
                inst.mnemonic.clone(),
                inst.operands.clone(),
            ));
        }
    }

    // Data references (ldr/str with PC-relative addressing)
    else if (mnemonic.starts_with("ldr") || mnemonic.starts_with("str")) && operands.contains("[pc") {
        if let Some(target) = parse_pc_relative(operands, inst.address) {
            let xref_type = if mnemonic.starts_with("ldr") {
                XrefType::DataRead
            } else {
                XrefType::DataWrite
            };

            xrefs.push(CrossReference::new(
                inst.address,
                target,
                xref_type,
                inst.mnemonic.clone(),
                inst.operands.clone(),
            ));
        }
    }

    xrefs
}

/// Parse branch target from operands (handles #0x1234, 0x1234, #-0x10, etc.)
///
/// # Arguments
/// * `operands` - The operand string from the instruction
/// * `current_addr` - The address of the current instruction (for relative branches)
///
/// # Returns
/// The target address if successfully parsed, None otherwise
fn parse_branch_target(operands: &str, current_addr: u32) -> Option<u32> {
    // Extract the target address from various formats
    let target_str = operands.trim().trim_start_matches('#');

    // Try parsing as hex (0x1234 or 0X1234)
    if let Some(hex_str) = target_str.strip_prefix("0x").or_else(|| target_str.strip_prefix("0X")) {
        if let Ok(addr) = u32::from_str_radix(hex_str, 16) {
            return Some(addr);
        }
    }

    // Try parsing as decimal
    if let Ok(addr) = target_str.parse::<u32>() {
        return Some(addr);
    }

    // Try parsing as signed offset (negative hex: -0x10)
    if target_str.starts_with('-') {
        if let Some(hex_str) = target_str.strip_prefix("-0x").or_else(|| target_str.strip_prefix("-0X")) {
            if let Ok(offset) = u32::from_str_radix(hex_str, 16) {
                // ARM adds 8 to PC for pipeline (in Thumb mode, usually +4, but we use +8 for consistency)
                return Some(current_addr.wrapping_add(8).wrapping_sub(offset));
            }
        }

        // Try parsing as signed decimal offset
        if let Ok(offset) = target_str.trim_start_matches('-').parse::<u32>() {
            return Some(current_addr.wrapping_add(8).wrapping_sub(offset));
        }
    }

    None
}

/// Parse PC-relative address from ldr/str operands
///
/// Handles formats like:
/// - [pc, #0x10]
/// - [pc, #-0x10]
/// - [pc, #16]
///
/// # Arguments
/// * `operands` - The operand string from the instruction
/// * `current_addr` - The address of the current instruction
///
/// # Returns
/// The calculated target address if successfully parsed, None otherwise
fn parse_pc_relative(operands: &str, current_addr: u32) -> Option<u32> {
    // Format: "r0, [pc, #0x10]" or "r1, [pc, #-0x10]"
    // We need to find the part with the offset (after the second comma if present, or after first if simple format)

    // Find the bracket containing pc
    let pc_start = operands.find("[pc")?;
    let bracket_end = operands[pc_start..].find(']')?;
    let pc_part = &operands[pc_start..pc_start + bracket_end + 1];

    // Now extract the offset from within [pc, #offset]
    // Split by comma and get the part after "pc"
    let parts: Vec<&str> = pc_part.split(',').collect();
    if parts.len() < 2 {
        return None;
    }

    let offset_str = parts[1].trim()
        .trim_start_matches('#')
        .trim_end_matches(']')
        .trim();

    let is_negative = offset_str.starts_with('-');
    let offset_str = offset_str.trim_start_matches('-');

    // Parse hex offset (0x10 or 0X10)
    if let Some(hex_str) = offset_str.strip_prefix("0x").or_else(|| offset_str.strip_prefix("0X")) {
        if let Ok(offset) = u32::from_str_radix(hex_str, 16) {
            // ARM PC is current + 8 for pipeline
            let pc_value = current_addr.wrapping_add(8);

            return Some(if is_negative {
                pc_value.wrapping_sub(offset)
            } else {
                pc_value.wrapping_add(offset)
            });
        }
    }

    // Parse decimal offset
    if let Ok(offset) = offset_str.parse::<u32>() {
        let pc_value = current_addr.wrapping_add(8);

        return Some(if is_negative {
            pc_value.wrapping_sub(offset)
        } else {
            pc_value.wrapping_add(offset)
        });
    }

    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_branch_target_hex() {
        assert_eq!(parse_branch_target("#0x1000", 0x8000), Some(0x1000));
        assert_eq!(parse_branch_target("0x2000", 0x8000), Some(0x2000));
        assert_eq!(parse_branch_target("#0X3000", 0x8000), Some(0x3000));
    }

    #[test]
    fn test_parse_branch_target_decimal() {
        assert_eq!(parse_branch_target("8192", 0x8000), Some(8192));
        assert_eq!(parse_branch_target("#4096", 0x8000), Some(4096));
    }

    #[test]
    fn test_parse_branch_target_negative_hex() {
        // -0x10 from address 0x8000
        // PC = 0x8000 + 8 = 0x8008
        // Result = 0x8008 - 0x10 = 0x7FF8
        assert_eq!(parse_branch_target("#-0x10", 0x8000), Some(0x7FF8));
    }

    #[test]
    fn test_parse_pc_relative_positive() {
        // [pc, #0x10] at address 0x8000
        // PC = 0x8000 + 8 = 0x8008
        // Result = 0x8008 + 0x10 = 0x8018
        assert_eq!(parse_pc_relative("[pc, #0x10]", 0x8000), Some(0x8018));
    }

    #[test]
    fn test_parse_pc_relative_negative() {
        // [pc, #-0x10] at address 0x8000
        // PC = 0x8000 + 8 = 0x8008
        // Result = 0x8008 - 0x10 = 0x7FF8
        assert_eq!(parse_pc_relative("[pc, #-0x10]", 0x8000), Some(0x7FF8));
    }

    #[test]
    fn test_parse_pc_relative_decimal() {
        // [pc, #16] at address 0x1000
        // PC = 0x1000 + 8 = 0x1008
        // Result = 0x1008 + 16 = 0x1018
        assert_eq!(parse_pc_relative("[pc, #16]", 0x1000), Some(0x1018));
    }

    #[test]
    fn test_extract_call_xref() {
        let inst = Instruction::new(
            0x8000,
            vec![0x00, 0xF0],
            "bl".to_string(),
            "#0x9000".to_string(),
        );

        let xrefs = extract_arm_xrefs(&inst);
        assert_eq!(xrefs.len(), 1);
        assert_eq!(xrefs[0].xref_type, XrefType::Call);
        assert_eq!(xrefs[0].to_addr, 0x9000);
        assert_eq!(xrefs[0].from_addr, 0x8000);
    }

    #[test]
    fn test_extract_branch_xref() {
        let inst = Instruction::new(
            0x8000,
            vec![0x00, 0xE0],
            "b".to_string(),
            "#0x8100".to_string(),
        );

        let xrefs = extract_arm_xrefs(&inst);
        assert_eq!(xrefs.len(), 1);
        assert_eq!(xrefs[0].xref_type, XrefType::Branch);
        assert_eq!(xrefs[0].to_addr, 0x8100);
    }

    #[test]
    fn test_extract_conditional_branch_xref() {
        let inst = Instruction::new(
            0x8000,
            vec![0x00, 0xD0],
            "b.eq".to_string(),
            "#0x8050".to_string(),
        );

        let xrefs = extract_arm_xrefs(&inst);
        assert_eq!(xrefs.len(), 1);
        assert_eq!(xrefs[0].xref_type, XrefType::ConditionalBranch);
    }

    #[test]
    fn test_extract_data_read_xref() {
        let inst = Instruction::new(
            0x8000,
            vec![0x00, 0x48],
            "ldr".to_string(),
            "r0, [pc, #0x20]".to_string(),
        );

        let xrefs = extract_arm_xrefs(&inst);
        assert_eq!(xrefs.len(), 1);
        assert_eq!(xrefs[0].xref_type, XrefType::DataRead);
        assert_eq!(xrefs[0].to_addr, 0x8028); // 0x8000 + 8 + 0x20
    }

    #[test]
    fn test_extract_data_write_xref() {
        let inst = Instruction::new(
            0x9000,
            vec![0x01, 0x60],
            "str".to_string(),
            "r1, [pc, #0x40]".to_string(),
        );

        let xrefs = extract_arm_xrefs(&inst);
        assert_eq!(xrefs.len(), 1);
        assert_eq!(xrefs[0].xref_type, XrefType::DataWrite);
        assert_eq!(xrefs[0].to_addr, 0x9048); // 0x9000 + 8 + 0x40
    }

    #[test]
    fn test_extract_no_xrefs() {
        let inst = Instruction::new(
            0x8000,
            vec![0x00, 0x20],
            "mov".to_string(),
            "r0, r1".to_string(),
        );

        let xrefs = extract_arm_xrefs(&inst);
        assert_eq!(xrefs.len(), 0);
    }

    #[test]
    fn test_ldr_without_pc_no_xref() {
        let inst = Instruction::new(
            0x8000,
            vec![0x00, 0x68],
            "ldr".to_string(),
            "r0, [r1, #0x10]".to_string(),
        );

        let xrefs = extract_arm_xrefs(&inst);
        assert_eq!(xrefs.len(), 0);
    }

    #[test]
    fn test_invalid_operand_no_crash() {
        let inst = Instruction::new(
            0x8000,
            vec![0x00, 0xF0],
            "bl".to_string(),
            "invalid_operand".to_string(),
        );

        let xrefs = extract_arm_xrefs(&inst);
        assert_eq!(xrefs.len(), 0); // Should gracefully handle invalid input
    }
}
