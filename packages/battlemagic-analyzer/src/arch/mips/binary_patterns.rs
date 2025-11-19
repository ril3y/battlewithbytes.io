/// MIPS binary pattern matching for architecture detection

use std::cmp::min;
use crate::arch::common::{helpers::*, MAX_SCAN_BYTES};

/// MIPS pattern scoring configuration
const MIPS_PATTERN_THRESHOLD: usize = 50;
const MIPS_PATTERN_SCORE: f32 = 0.5;
const MIPS_BOOT_VECTOR_SCORE: f32 = 0.2;

/// Score MIPS instruction patterns
///
/// Checks for:
/// - Common MIPS opcodes (R-type, J/JAL, ADDI, LUI, LW/SW, etc.)
/// - NOP instructions
/// - Boot vector patterns
/// - Both little-endian and big-endian
pub fn score_mips_patterns(data: &[u8], hints: &mut Vec<String>) -> f32 {
    let mut score = 0.0f32;

    if data.len() < 4 {
        return score;
    }

    // Try both endiannesses
    let (le_patterns, be_patterns) = count_mips_patterns(data);

    if le_patterns > MIPS_PATTERN_THRESHOLD {
        score = score.max(MIPS_PATTERN_SCORE);
        hints.push(format!("Found {} MIPS patterns (LE)", le_patterns));
    }

    if be_patterns > MIPS_PATTERN_THRESHOLD {
        score = score.max(MIPS_PATTERN_SCORE);
        hints.push(format!("Found {} MIPS patterns (BE)", be_patterns));
    }

    // Check for MIPS boot vector location patterns
    if data.len() >= 16 {
        // Look for jump at beginning (common in MIPS boot code)
        let inst0_be = read_u32_be(data, 0);
        let opcode0 = (inst0_be >> 26) & 0x3F;
        if opcode0 == 0x02 || opcode0 == 0x03 {
            score += MIPS_BOOT_VECTOR_SCORE;
            hints.push("First instruction is MIPS J/JAL".to_string());
        }
    }

    score.min(1.0)
}

/// Count MIPS patterns in both endiannesses
fn count_mips_patterns(data: &[u8]) -> (usize, usize) {
    let scan_limit = min(MAX_SCAN_BYTES, data.len() - 4);
    let mut le_count = 0;
    let mut be_count = 0;
    let mut zero_count = 0;

    for offset in (0..scan_limit).step_by(4) {
        if offset + 4 > data.len() {
            break;
        }

        // Little endian
        let inst_le = read_u32_le(data, offset);

        // Track consecutive zeros to avoid false positives
        if inst_le == 0 {
            zero_count += 1;
        }

        le_count += count_mips_opcode_matches(inst_le);

        // Big endian
        let inst_be = read_u32_be(data, offset);
        be_count += count_mips_opcode_matches(inst_be);
    }

    // Reduce score if too many zeros (likely uninitialized data)
    if zero_count > (scan_limit / 8) {
        le_count = le_count.saturating_sub(zero_count / 2);
        be_count = be_count.saturating_sub(zero_count / 2);
    }

    (le_count, be_count)
}

/// Check if instruction matches common MIPS opcodes
#[inline]
fn count_mips_opcode_matches(inst: u32) -> usize {
    let opcode = (inst >> 26) & 0x3F;
    let mut matches = 0;

    match opcode {
        0x00 => matches += 1, // R-type
        0x02 | 0x03 => matches += 1, // J, JAL
        0x08 | 0x09 => matches += 1, // ADDI, ADDIU
        0x0F => matches += 1, // LUI
        0x23 | 0x2B => matches += 1, // LW, SW
        0x24 | 0x25 => matches += 1, // LBU, LHU
        _ => {}
    }

    // NOP instruction (0x00000000)
    if inst == 0x0000_0000 {
        matches += 1;
    }

    matches
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_count_mips_opcode_matches() {
        // R-type instruction
        assert_eq!(count_mips_opcode_matches(0x0000_0000), 2); // NOP

        // JAL instruction
        assert_eq!(count_mips_opcode_matches(0x0C00_0000), 1);

        // LUI instruction
        assert_eq!(count_mips_opcode_matches(0x3C00_0000), 1);
    }
}
