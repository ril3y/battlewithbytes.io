//! MIPS-specific cross-reference extraction
//!
//! This module handles the detection and parsing of cross-references in MIPS code.
//! MIPS cross-references include:
//! - JAL (Jump And Link) - function calls
//! - J (Jump) - unconditional branches
//! - Branch instructions (BEQ, BNE, BGTZ, etc.) - conditional branches
//! - Load/Store with immediate offsets

use crate::traits::{CrossReference, Instruction};
use crate::types::XrefType;

/// Extract cross-references from a MIPS instruction
///
/// Analyzes a MIPS instruction and returns all cross-references it contains.
///
/// # Arguments
/// * `inst` - The instruction to analyze
///
/// # Returns
/// A vector of cross-references found in the instruction (may be empty)
pub fn extract_mips_xrefs(inst: &Instruction) -> Vec<CrossReference> {
    let mut xrefs = Vec::new();

    let mnemonic = inst.mnemonic.to_lowercase();
    let operands = &inst.operands;

    // JAL (Jump And Link) - function call
    if mnemonic == "jal" || mnemonic == "jalr" {
        if let Some(target) = parse_jump_target(operands, inst.address) {
            xrefs.push(CrossReference::new(
                inst.address,
                target,
                XrefType::Call,
                inst.mnemonic.clone(),
                inst.operands.clone(),
            ));
        }
    }

    // J (Jump) - unconditional branch
    else if mnemonic == "j" {
        if let Some(target) = parse_jump_target(operands, inst.address) {
            xrefs.push(CrossReference::new(
                inst.address,
                target,
                XrefType::Branch,
                inst.mnemonic.clone(),
                inst.operands.clone(),
            ));
        }
    }

    // Conditional branches (BEQ, BNE, BGTZ, BLEZ, etc.)
    else if is_conditional_branch(&mnemonic) {
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

    // Load/Store instructions with potential data references
    // LW/SW with absolute addresses or label references
    else if (mnemonic.starts_with("lw") || mnemonic.starts_with("sw")) && operands.contains("0x") {
        if let Some(target) = parse_memory_reference(operands) {
            let xref_type = if mnemonic.starts_with("lw") {
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

/// Parse jump target from operands (JAL/J instructions)
fn parse_jump_target(operands: &str, _current_addr: u32) -> Option<u32> {
    let target_str = operands.trim();

    // Handle hex format (0x1234)
    if let Some(hex) = target_str.strip_prefix("0x") {
        return u32::from_str_radix(hex, 16).ok();
    }

    // Handle decimal format
    target_str.parse().ok()
}

/// Parse branch target from operands (BEQ, BNE, etc.)
/// Format: "rs, rt, offset" or "rs, offset"
fn parse_branch_target(operands: &str, current_addr: u32) -> Option<u32> {
    // Find the last comma-separated part (the offset/target)
    let parts: Vec<&str> = operands.split(',').collect();
    let target_str = parts.last()?.trim();

    // Parse as hex
    if let Some(hex) = target_str.strip_prefix("0x") {
        return u32::from_str_radix(hex, 16).ok();
    }

    // Parse as decimal offset and calculate target
    if let Ok(offset) = target_str.parse::<i32>() {
        // MIPS branches use PC-relative addressing
        // PC = current_addr + 4 (delay slot)
        let pc = current_addr.wrapping_add(4);
        return Some(pc.wrapping_add(offset as u32));
    }

    None
}

/// Parse memory reference from load/store operands
/// Format: "offset(base)" or just "0xaddress"
fn parse_memory_reference(operands: &str) -> Option<u32> {
    let trimmed = operands.trim();

    // Extract address from "rt, offset(base)" format
    if let Some(paren_pos) = trimmed.find('(') {
        let offset_part = &trimmed[..paren_pos].split(',').next_back()?.trim();
        if let Some(hex) = offset_part.strip_prefix("0x") {
            return u32::from_str_radix(hex, 16).ok();
        }
    }

    // Direct address format
    if let Some(hex) = trimmed.strip_prefix("0x") {
        return u32::from_str_radix(hex, 16).ok();
    }

    None
}

/// Check if mnemonic is a conditional branch instruction
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
    fn test_jal_extraction() {
        let inst = Instruction::new(
            0x1000,
            vec![0x0c, 0x00, 0x08, 0x00],
            "jal".to_string(),
            "0x2000".to_string(),
        );

        let xrefs = extract_mips_xrefs(&inst);
        assert_eq!(xrefs.len(), 1);
        assert_eq!(xrefs[0].xref_type, XrefType::Call);
        assert_eq!(xrefs[0].to_addr, 0x2000);
    }

    #[test]
    fn test_jump_extraction() {
        let inst = Instruction::new(
            0x1000,
            vec![0x08, 0x00, 0x08, 0x00],
            "j".to_string(),
            "0x3000".to_string(),
        );

        let xrefs = extract_mips_xrefs(&inst);
        assert_eq!(xrefs.len(), 1);
        assert_eq!(xrefs[0].xref_type, XrefType::Branch);
        assert_eq!(xrefs[0].to_addr, 0x3000);
    }

    #[test]
    fn test_conditional_branch() {
        let inst = Instruction::new(
            0x1000,
            vec![0x10, 0x40, 0x00, 0x10],
            "beq".to_string(),
            "$v0, $zero, 0x1040".to_string(),
        );

        let xrefs = extract_mips_xrefs(&inst);
        assert_eq!(xrefs.len(), 1);
        assert_eq!(xrefs[0].xref_type, XrefType::ConditionalBranch);
        assert_eq!(xrefs[0].to_addr, 0x1040);
    }

    #[test]
    fn test_load_word() {
        let inst = Instruction::new(
            0x1000,
            vec![0x8c, 0x82, 0x00, 0x00],
            "lw".to_string(),
            "$v0, 0x4000($gp)".to_string(),
        );

        let xrefs = extract_mips_xrefs(&inst);
        assert_eq!(xrefs.len(), 1);
        assert_eq!(xrefs[0].xref_type, XrefType::DataRead);
        assert_eq!(xrefs[0].to_addr, 0x4000);
    }

    #[test]
    fn test_no_xrefs() {
        let inst = Instruction::new(
            0x1000,
            vec![0x00, 0x00, 0x10, 0x21],
            "addu".to_string(),
            "$v0, $zero, $zero".to_string(),
        );

        let xrefs = extract_mips_xrefs(&inst);
        assert_eq!(xrefs.len(), 0);
    }
}
