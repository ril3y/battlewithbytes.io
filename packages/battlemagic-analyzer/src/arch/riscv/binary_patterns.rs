/// RISC-V binary pattern matching for architecture detection

use std::cmp::min;
use crate::arch::common::{helpers::*, MAX_SCAN_BYTES};

/// RISC-V pattern scoring configuration
const RISCV_PATTERN_THRESHOLD: usize = 30;
const RISCV_PATTERN_SCORE: f32 = 0.4;
const RISCV_COMPRESSED_THRESHOLD: usize = 10;
const RISCV_COMPRESSED_SCORE: f32 = 0.3;
const RISCV_BOOT_JAL_SCORE: f32 = 0.2;

/// Score RISC-V instruction patterns
///
/// Checks for:
/// - RISC-V compressed instructions (C extension)
/// - Common RISC-V opcodes (LUI, AUIPC, JAL, JALR, Branch, Load, Store, OP-IMM, OP)
/// - Jump at start pattern
pub fn score_riscv_patterns(data: &[u8], hints: &mut Vec<String>) -> f32 {
    let mut score = 0.0f32;

    if data.len() < 4 {
        return score;
    }

    let (riscv_patterns, compressed_insts) = count_riscv_patterns(data);

    if riscv_patterns > RISCV_PATTERN_THRESHOLD {
        score += RISCV_PATTERN_SCORE;
        hints.push(format!("Found {} RISC-V instruction patterns", riscv_patterns));
    }

    if compressed_insts > RISCV_COMPRESSED_THRESHOLD {
        score += RISCV_COMPRESSED_SCORE;
        hints.push(format!("Found {} RISC-V compressed instructions", compressed_insts));
    }

    // Check for RISC-V jump at start
    if data.len() >= 4 {
        let first_inst = read_u32_le(data, 0);
        let opcode = first_inst & 0x7F;
        if opcode == 0x6F {
            score += RISCV_BOOT_JAL_SCORE;
            hints.push("First instruction is RISC-V JAL".to_string());
        }
    }

    score.min(1.0)
}

/// Count RISC-V patterns
fn count_riscv_patterns(data: &[u8]) -> (usize, usize) {
    let scan_limit = min(MAX_SCAN_BYTES, data.len() - 4);
    let mut riscv_count = 0;
    let mut compressed_count = 0;

    let mut offset = 0;
    while offset < scan_limit {
        if offset + 2 > data.len() {
            break;
        }

        let inst16 = read_u16_le(data, offset);

        // Check for compressed instructions (low 2 bits != 11)
        if (inst16 & 0x3) != 0x3 {
            compressed_count += 1;
            offset += 2;
            continue;
        }

        // 32-bit instruction
        if offset + 4 <= data.len() {
            let inst32 = read_u32_le(data, offset);
            let opcode = inst32 & 0x7F;

            // Check for common RISC-V opcodes
            match opcode {
                0x37 => riscv_count += 1, // LUI
                0x17 => riscv_count += 1, // AUIPC
                0x6F => riscv_count += 1, // JAL
                0x67 => riscv_count += 1, // JALR
                0x63 => riscv_count += 1, // Branch
                0x03 => riscv_count += 1, // Load
                0x23 => riscv_count += 1, // Store
                0x13 => riscv_count += 1, // OP-IMM
                0x33 => riscv_count += 1, // OP
                _ => {}
            }

            offset += 4;
        } else {
            break;
        }
    }

    (riscv_count, compressed_count)
}
