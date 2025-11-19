/// ARM binary pattern matching for architecture detection

use std::cmp::min;
use crate::arch::common::{helpers::*, MAX_SCAN_BYTES};

/// ARM pattern scoring configuration
const ARM_VECTOR_SCORE: f32 = 0.3;
const ARM_THUMB_BIT_SCORE: f32 = 0.3;
const ARM_MULTIPLE_VECTORS_SCORE: f32 = 0.2;
const ARM_THUMB_PATTERNS_SCORE: f32 = 0.1;

/// ARM-specific memory ranges for stack pointer validation
const ARM_RAM_RANGES: &[(u32, u32)] = &[
    (0x2000_0000, 0x3000_0000), // ARM SRAM
    (0x1000_0000, 0x1010_0000), // ARM CCM
    (0x0000_0000, 0x0010_0000), // Low RAM
];

/// Score ARM instruction patterns in binary data
///
/// Checks for:
/// - Valid ARM Cortex-M vector table
/// - Thumb bit set on reset handler
/// - Multiple valid vector entries
/// - Common Thumb/Thumb-2 instruction patterns
pub fn score_arm_patterns(data: &[u8], hints: &mut Vec<String>) -> f32 {
    let mut score = 0.0f32;

    if data.len() < 8 {
        return score;
    }

    // Check for valid ARM Cortex-M vector table
    let stack_pointer = read_u32_le(data, 0);
    let reset_handler = read_u32_le(data, 4);

    // Check if first word looks like a stack pointer (RAM address)
    if is_likely_stack_pointer(stack_pointer) {
        score += ARM_VECTOR_SCORE;
        hints.push("First word looks like ARM stack pointer".to_string());
    }

    // Check if second word has Thumb bit set
    if (reset_handler & 1) == 1 && reset_handler > 0x100 && reset_handler < 0x2000_0000 {
        score += ARM_THUMB_BIT_SCORE;
        hints.push("Second word has Thumb bit set".to_string());
    }

    // Check for more vector entries
    let max_vectors = min(64 * 4, data.len());
    let mut valid_vectors = 0;

    for offset in (8..max_vectors).step_by(4) {
        if offset + 4 > data.len() {
            break;
        }
        let vector = read_u32_le(data, offset);
        if vector != 0 && vector != 0xFFFF_FFFF && (vector & 1) == 1 {
            valid_vectors += 1;
        }
    }

    if valid_vectors > 5 {
        score += ARM_MULTIPLE_VECTORS_SCORE;
        hints.push(format!("Found {} valid ARM vector entries", valid_vectors));
    }

    // Look for Thumb-2 instruction patterns
    let scan_limit = min(MAX_SCAN_BYTES, data.len() - 4);
    let thumb_patterns = count_thumb_patterns(data, scan_limit);

    if thumb_patterns > 20 {
        score += ARM_THUMB_PATTERNS_SCORE;
        hints.push(format!("Found {} Thumb instruction patterns", thumb_patterns));
    }

    score.min(1.0)
}

/// Count common Thumb/Thumb-2 instruction patterns
#[inline]
fn count_thumb_patterns(data: &[u8], scan_limit: usize) -> usize {
    let mut count = 0;

    for offset in (0..scan_limit).step_by(2) {
        if offset + 2 > data.len() {
            break;
        }

        let inst16 = read_u16_le(data, offset);

        // Check for common Thumb instructions
        if (inst16 & 0xF800) == 0x4800 { count += 1; } // LDR (literal)
        if (inst16 & 0xFF00) == 0xB500 { count += 1; } // PUSH {lr}
        if (inst16 & 0xFF00) == 0xBD00 { count += 1; } // POP {pc}

        // Check for 32-bit Thumb-2 instruction prefix
        if (inst16 & 0xF800) == 0xF000 && offset + 4 <= data.len() {
            let inst32 = read_u32_le(data, offset);
            if (inst32 & 0xF800_D000) == 0xF000_D000 {
                count += 1; // BL instruction
            }
        }
    }

    count
}

/// Check if value looks like a valid ARM stack pointer
#[inline]
fn is_likely_stack_pointer(value: u32) -> bool {
    // Check if in RAM range and word-aligned
    let in_ram = ARM_RAM_RANGES.iter().any(|&(start, end)| value >= start && value <= end);
    let aligned = (value & 0x3) == 0;

    in_ram && aligned && value != 0 && value != 0xFFFF_FFFF
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_likely_stack_pointer() {
        // Valid ARM SRAM address
        assert!(is_likely_stack_pointer(0x2000_1000));

        // Not aligned
        assert!(!is_likely_stack_pointer(0x2000_1001));

        // Not in RAM range
        assert!(!is_likely_stack_pointer(0x0800_0000));

        // Invalid values
        assert!(!is_likely_stack_pointer(0));
        assert!(!is_likely_stack_pointer(0xFFFF_FFFF));
    }
}
