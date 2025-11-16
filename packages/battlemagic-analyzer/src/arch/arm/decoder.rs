//! ARM Thumb-2 instruction decoder
//!
//! This module decodes raw bytes into ARM Thumb/Thumb-2 instructions.
//!
//! ## Architecture Overview
//!
//! ARM Cortex-M processors use the Thumb-2 instruction set, which combines:
//! - 16-bit Thumb instructions (compact, common operations)
//! - 32-bit Thumb-2 instructions (extended functionality)
//!
//! ## Instruction Encoding
//!
//! Thumb instructions are little-endian. A 16-bit instruction:
//! ```text
//! Memory: [0xAB, 0xCD] -> Instruction: 0xCDAB
//! ```
//!
//! 32-bit instructions consist of two 16-bit halfwords:
//! ```text
//! Memory: [0x12, 0x34, 0x56, 0x78] -> Instruction: 0x3412 0x7856
//! ```
//!
//! ## Implementation Strategy
//!
//! This decoder prioritizes:
//! 1. **Correctness** - Accurate decoding of common instructions
//! 2. **Completeness** - Coverage of instructions used in firmware analysis
//! 3. **Performance** - Efficient bit manipulation without string parsing
//! 4. **Maintainability** - Clear encoding documentation

use crate::traits::Instruction;

/// Decode a single ARM Thumb/Thumb-2 instruction from bytes
///
/// # Arguments
/// * `bytes` - Raw instruction bytes (little-endian)
/// * `addr` - Address of the instruction (for PC-relative calculations)
///
/// # Returns
/// `Some(Instruction)` if successfully decoded, `None` for unknown/invalid instructions
///
/// # Example
/// ```rust
/// use battlemagic_analyzer::arch::arm::ArmArchitecture;
/// use battlemagic_analyzer::traits::Architecture;
///
/// let arch = ArmArchitecture;
/// let bytes = &[0x00, 0xF0, 0x10, 0xF8]; // bl #0x20
/// let inst = arch.decode(bytes, 0x8000);
/// assert!(inst.is_some());
/// ```
pub fn decode_arm_instruction(bytes: &[u8], addr: u32) -> Option<Instruction> {
    if bytes.is_empty() {
        return None;
    }

    // Read first halfword (16-bit)
    if bytes.len() < 2 {
        return None;
    }

    let hw1 = u16::from_le_bytes([bytes[0], bytes[1]]);

    // Determine if this is a 32-bit instruction
    // 32-bit Thumb-2 instructions have specific patterns in bits [15:11]
    let is_32bit = is_thumb2_32bit(hw1);

    if is_32bit {
        // Need at least 4 bytes for 32-bit instruction
        if bytes.len() < 4 {
            // Incomplete 32-bit instruction - treat as unknown 16-bit
            return Some(Instruction::new(
                addr,
                hw1.to_le_bytes().to_vec(),
                "unknown".to_string(),
                format!("0x{:04x} (incomplete 32-bit)", hw1),
            ));
        }

        let hw2 = u16::from_le_bytes([bytes[2], bytes[3]]);
        decode_thumb2_32bit(hw1, hw2, addr)
    } else {
        decode_thumb_16bit(hw1, addr)
    }
}

/// Check if a halfword indicates a 32-bit Thumb-2 instruction
///
/// 32-bit instructions have one of these patterns in bits [15:11]:
/// - 0b11101 - Various 32-bit instructions
/// - 0b11110 - Branches, load/store
/// - 0b11111 - Branches, coprocessor ops
fn is_thumb2_32bit(hw: u16) -> bool {
    let bits_15_11 = (hw >> 11) & 0x1F;
    matches!(bits_15_11, 0b11101 | 0b11110 | 0b11111)
}

/// Decode a 16-bit Thumb instruction
fn decode_thumb_16bit(hw: u16, addr: u32) -> Option<Instruction> {
    let opcode = (hw >> 10) & 0x3F; // Bits [15:10]

    match opcode {
        // Conditional branch (B<cond> <label>) and SVC
        // Format: 1101 cccc iiii iiii
        0b110100..=0b110111 => {
            // Check if this is SVC (1101 1111 xxxx xxxx)
            if (hw >> 8) == 0xDF {
                decode_thumb_svc(hw, addr)
            } else {
                decode_thumb_bcond(hw, addr)
            }
        }

        // Unconditional branch (B <label>)
        // Format: 1110 0iii iiii iiii
        0b111000..=0b111001 => decode_thumb_b(hw, addr),

        // ADD/SUB register (ADD/SUB Rd, Rn, Rm)
        // Format: 0001 10x rrr nnn ddd
        0b000110 => decode_thumb_add_sub_reg(hw, addr),

        // ADD/SUB immediate (ADD/SUB Rd, Rn, #imm3)
        // Format: 0001 11x iii nnn ddd
        0b000111 => decode_thumb_add_sub_imm(hw, addr),

        // MOV immediate (MOV Rd, #imm8)
        // Format: 0010 0ddd iiii iiii
        0b001000..=0b001001 => decode_thumb_mov_imm(hw, addr),

        // CMP immediate (CMP Rn, #imm8)
        // Format: 0010 1nnn iiii iiii
        0b001010..=0b001011 => decode_thumb_cmp_imm(hw, addr),

        // ADD immediate (ADD Rd, #imm8)
        // Format: 0011 0ddd iiii iiii
        0b001100..=0b001101 => decode_thumb_add_imm8(hw, addr),

        // SUB immediate (SUB Rd, #imm8)
        // Format: 0011 1ddd iiii iiii
        0b001110..=0b001111 => decode_thumb_sub_imm8(hw, addr),

        // LDR/STR register offset
        // Format: 0101 xxx mmm nnn ttt
        0b010100..=0b010111 => decode_thumb_ldr_str_reg(hw, addr),

        // LDR/STR immediate offset
        // Format: 011x xlll lll nnn ttt
        0b011000..=0b011111 => decode_thumb_ldr_str_imm(hw, addr),

        // LDR PC-relative (LDR Rd, [PC, #imm8])
        // Format: 0100 1ddd iiii iiii
        0b010010..=0b010011 => decode_thumb_ldr_pc(hw, addr),

        // ADD to SP or PC (ADD Rd, SP/PC, #imm8)
        // Format: 1010 xddd iiii iiii
        0b101000..=0b101011 => decode_thumb_add_sp_pc(hw, addr),

        // PUSH/POP and BKPT
        // Format: 1011 x10x xxxx xxxx
        0b101101 | 0b101111 => {
            // Check if this is BKPT (1011 1110 xxxx xxxx)
            if (hw >> 8) == 0xBE {
                decode_thumb_bkpt(hw, addr)
            } else {
                decode_thumb_push_pop(hw, addr)
            }
        }

        // Data processing register
        // Format: 0100 00xx xxxx xxxx
        0b010000 => decode_thumb_data_proc(hw, addr),

        // Special data processing (ADD/CMP/MOV with high registers) and BX/BLX
        // Format: 0100 01xx xxxx xxxx
        0b010001 => {
            // Check if this is BX/BLX (0100 0111 0xxx xxxx or 0100 0111 1xxx xxxx)
            // Bits [15:7] should be 0b010001110 or 0b010001111
            if (hw >> 7) == 0b010001110 || (hw >> 7) == 0b010001111 {
                decode_thumb_bx_blx(hw, addr)
            } else {
                decode_thumb_special_data(hw, addr)
            }
        }

        // Load/Store multiple
        // Format: 1100 xnnn xxxx xxxx
        0b110000..=0b110011 => decode_thumb_ldm_stm(hw, addr),

        _ => {
            // Unknown instruction - return minimal representation
            Some(Instruction::new(
                addr,
                hw.to_le_bytes().to_vec(),
                "unknown".to_string(),
                format!("0x{:04x}", hw),
            ))
        }
    }
}

/// Decode a 32-bit Thumb-2 instruction
fn decode_thumb2_32bit(hw1: u16, hw2: u16, addr: u32) -> Option<Instruction> {
    let op1 = (hw1 >> 11) & 0x3; // Bits [12:11] of first halfword
    let op2 = (hw1 >> 4) & 0x7F; // Bits [10:4] of first halfword

    // Branch and miscellaneous control
    if (hw1 >> 12) & 0xF == 0b1111 {
        return decode_thumb2_branch(hw1, hw2, addr);
    }

    // Load/Store multiple, Table branch
    if op1 == 0b10 && (op2 & 0x60) == 0x00 {
        return decode_thumb2_ldm_stm(hw1, hw2, addr);
    }

    // Data processing (shifted register)
    if (hw1 >> 9) & 0x7F == 0b1110101 {
        return decode_thumb2_data_proc(hw1, hw2, addr);
    }

    // Load/store single
    if op1 == 0b10 {
        return decode_thumb2_load_store(hw1, hw2, addr);
    }

    // Unknown 32-bit instruction
    let bytes = [
        hw1.to_le_bytes()[0],
        hw1.to_le_bytes()[1],
        hw2.to_le_bytes()[0],
        hw2.to_le_bytes()[1],
    ];

    Some(Instruction::new(
        addr,
        bytes.to_vec(),
        "unknown.w".to_string(),
        format!("0x{:04x}{:04x}", hw1, hw2),
    ))
}

// ============================================================================
// 16-bit Thumb Instruction Decoders
// ============================================================================

/// Decode conditional branch (B<cond>)
/// Encoding: 1101 cccc iiii iiii
fn decode_thumb_bcond(hw: u16, addr: u32) -> Option<Instruction> {
    let cond = (hw >> 8) & 0xF;
    let imm8 = (hw & 0xFF) as i8; // Sign-extended
    let offset = (imm8 as i32) << 1; // Multiply by 2

    // PC = current instruction + 4 + offset
    let target = (addr as i32).wrapping_add(4).wrapping_add(offset) as u32;

    let condition = match cond {
        0x0 => "eq", 0x1 => "ne", 0x2 => "cs", 0x3 => "cc",
        0x4 => "mi", 0x5 => "pl", 0x6 => "vs", 0x7 => "vc",
        0x8 => "hi", 0x9 => "ls", 0xA => "ge", 0xB => "lt",
        0xC => "gt", 0xD => "le", 0xE => "al", _ => "nv",
    };

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        format!("b.{}", condition),
        format!("#0x{:x}", target),
    ))
}

/// Decode unconditional branch (B)
/// Encoding: 1110 0iii iiii iiii
fn decode_thumb_b(hw: u16, addr: u32) -> Option<Instruction> {
    let imm11 = hw & 0x7FF;
    // Sign extend from 11 bits
    let offset = if imm11 & 0x400 != 0 {
        // Negative
        ((imm11 as i32) | !0x7FF) << 1
    } else {
        (imm11 as i32) << 1
    };

    let target = (addr as i32).wrapping_add(4).wrapping_add(offset) as u32;

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        "b".to_string(),
        format!("#0x{:x}", target),
    ))
}

/// Decode ADD/SUB register
/// Encoding: 0001 10x rrr nnn ddd
fn decode_thumb_add_sub_reg(hw: u16, addr: u32) -> Option<Instruction> {
    let op = (hw >> 9) & 1;
    let rm = (hw >> 6) & 7;
    let rn = (hw >> 3) & 7;
    let rd = hw & 7;

    let mnemonic = if op == 0 { "add" } else { "sub" };

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        mnemonic.to_string(),
        format!("r{}, r{}, r{}", rd, rn, rm),
    ))
}

/// Decode ADD/SUB immediate (3-bit)
/// Encoding: 0001 11x iii nnn ddd
fn decode_thumb_add_sub_imm(hw: u16, addr: u32) -> Option<Instruction> {
    let op = (hw >> 9) & 1;
    let imm3 = (hw >> 6) & 7;
    let rn = (hw >> 3) & 7;
    let rd = hw & 7;

    let mnemonic = if op == 0 { "add" } else { "sub" };

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        mnemonic.to_string(),
        format!("r{}, r{}, #{}", rd, rn, imm3),
    ))
}

/// Decode MOV immediate
/// Encoding: 0010 0ddd iiii iiii
fn decode_thumb_mov_imm(hw: u16, addr: u32) -> Option<Instruction> {
    let rd = (hw >> 8) & 7;
    let imm8 = hw & 0xFF;

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        "mov".to_string(),
        format!("r{}, #{}", rd, imm8),
    ))
}

/// Decode CMP immediate
/// Encoding: 0010 1nnn iiii iiii
fn decode_thumb_cmp_imm(hw: u16, addr: u32) -> Option<Instruction> {
    let rn = (hw >> 8) & 7;
    let imm8 = hw & 0xFF;

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        "cmp".to_string(),
        format!("r{}, #{}", rn, imm8),
    ))
}

/// Decode ADD immediate (8-bit)
/// Encoding: 0011 0ddd iiii iiii
fn decode_thumb_add_imm8(hw: u16, addr: u32) -> Option<Instruction> {
    let rd = (hw >> 8) & 7;
    let imm8 = hw & 0xFF;

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        "add".to_string(),
        format!("r{}, #{}", rd, imm8),
    ))
}

/// Decode SUB immediate (8-bit)
/// Encoding: 0011 1ddd iiii iiii
fn decode_thumb_sub_imm8(hw: u16, addr: u32) -> Option<Instruction> {
    let rd = (hw >> 8) & 7;
    let imm8 = hw & 0xFF;

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        "sub".to_string(),
        format!("r{}, #{}", rd, imm8),
    ))
}

/// Decode LDR/STR with register offset
/// Encoding: 0101 xxx mmm nnn ttt
fn decode_thumb_ldr_str_reg(hw: u16, addr: u32) -> Option<Instruction> {
    let opcode = (hw >> 9) & 0x7;
    let rm = (hw >> 6) & 0x7;
    let rn = (hw >> 3) & 0x7;
    let rt = hw & 0x7;

    let mnemonic = match opcode {
        0b000 => "str",
        0b001 => "strh",
        0b010 => "strb",
        0b011 => "ldrsb",
        0b100 => "ldr",
        0b101 => "ldrh",
        0b110 => "ldrb",
        0b111 => "ldrsh",
        _ => "unknown",
    };

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        mnemonic.to_string(),
        format!("r{}, [r{}, r{}]", rt, rn, rm),
    ))
}

/// Decode LDR/STR with immediate offset
/// Encoding: 011x xlll lll nnn ttt
fn decode_thumb_ldr_str_imm(hw: u16, addr: u32) -> Option<Instruction> {
    let opcode = (hw >> 11) & 0x3;
    let imm5 = (hw >> 6) & 0x1F;
    let rn = (hw >> 3) & 0x7;
    let rt = hw & 0x7;

    let (mnemonic, offset) = match opcode {
        0b00 => ("str", imm5 << 2),  // Word: imm5 * 4
        0b01 => ("ldr", imm5 << 2),  // Word: imm5 * 4
        0b10 => ("strb", imm5),      // Byte: imm5 * 1
        0b11 => ("ldrb", imm5),      // Byte: imm5 * 1
        _ => ("unknown", 0),
    };

    if offset == 0 {
        Some(Instruction::new(
            addr,
            hw.to_le_bytes().to_vec(),
            mnemonic.to_string(),
            format!("r{}, [r{}]", rt, rn),
        ))
    } else {
        Some(Instruction::new(
            addr,
            hw.to_le_bytes().to_vec(),
            mnemonic.to_string(),
            format!("r{}, [r{}, #{}]", rt, rn, offset),
        ))
    }
}

/// Decode LDR PC-relative
/// Encoding: 0100 1ddd iiii iiii
fn decode_thumb_ldr_pc(hw: u16, addr: u32) -> Option<Instruction> {
    let rt = (hw >> 8) & 0x7;
    let imm8 = hw & 0xFF;
    let offset = imm8 << 2; // imm8 * 4

    // PC-relative: Align(PC, 4) + offset
    let pc_aligned = (addr + 4) & !0x3;
    let _target = pc_aligned + (offset as u32);

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        "ldr".to_string(),
        format!("r{}, [pc, #0x{:x}]", rt, offset),
    ))
}

/// Decode ADD to SP or PC
/// Encoding: 1010 xddd iiii iiii
fn decode_thumb_add_sp_pc(hw: u16, addr: u32) -> Option<Instruction> {
    let sp = (hw >> 11) & 1;
    let rd = (hw >> 8) & 7;
    let imm8 = hw & 0xFF;
    let offset = imm8 << 2; // imm8 * 4

    let base_reg = if sp == 1 { "sp" } else { "pc" };

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        "add".to_string(),
        format!("r{}, {}, #{}", rd, base_reg, offset),
    ))
}

/// Decode PUSH/POP
/// Encoding: 1011 x10x xxxx xxxx
fn decode_thumb_push_pop(hw: u16, addr: u32) -> Option<Instruction> {
    let load = (hw >> 11) & 1;
    let pc_lr = (hw >> 8) & 1;
    let reg_list = hw & 0xFF;

    let mnemonic = if load == 1 { "pop" } else { "push" };

    let mut regs = Vec::new();
    for i in 0..8 {
        if reg_list & (1 << i) != 0 {
            regs.push(format!("r{}", i));
        }
    }

    if pc_lr == 1 {
        if load == 1 {
            regs.push("pc".to_string());
        } else {
            regs.push("lr".to_string());
        }
    }

    let operands = format!("{{{}}}", regs.join(", "));

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        mnemonic.to_string(),
        operands,
    ))
}

/// Decode data processing register
/// Encoding: 0100 00xx xxxx xxxx
fn decode_thumb_data_proc(hw: u16, addr: u32) -> Option<Instruction> {
    let opcode = (hw >> 6) & 0xF;
    let rm = (hw >> 3) & 7;
    let rd = hw & 7;

    let mnemonic = match opcode {
        0x0 => "and", 0x1 => "eor", 0x2 => "lsl", 0x3 => "lsr",
        0x4 => "asr", 0x5 => "adc", 0x6 => "sbc", 0x7 => "ror",
        0x8 => "tst", 0x9 => "neg", 0xA => "cmp", 0xB => "cmn",
        0xC => "orr", 0xD => "mul", 0xE => "bic", 0xF => "mvn",
        _ => "unknown",
    };

    // TST and CMP don't have destination
    let operands = if matches!(opcode, 0x8 | 0xA | 0xB) {
        format!("r{}, r{}", rd, rm)
    } else {
        format!("r{}, r{}", rd, rm)
    };

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        mnemonic.to_string(),
        operands,
    ))
}

/// Decode special data processing (high registers)
/// Encoding: 0100 01xx xxxx xxxx
fn decode_thumb_special_data(hw: u16, addr: u32) -> Option<Instruction> {
    let opcode = (hw >> 8) & 0x3;
    let h1 = (hw >> 7) & 1;
    let h2 = (hw >> 6) & 1;
    let rm = ((hw >> 3) & 0x7) | (h2 << 3);
    let rd = (hw & 0x7) | (h1 << 3);

    let mnemonic = match opcode {
        0x0 => "add",
        0x1 => "cmp",
        0x2 => "mov",
        _ => "unknown",
    };

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        mnemonic.to_string(),
        format!("r{}, r{}", rd, rm),
    ))
}

/// Decode branch exchange (BX/BLX)
/// Encoding: 0100 0111 xxxx xxxx
fn decode_thumb_bx_blx(hw: u16, addr: u32) -> Option<Instruction> {
    let link = (hw >> 7) & 1;
    let rm = (hw >> 3) & 0xF;

    let mnemonic = if link == 1 { "blx" } else { "bx" };

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        mnemonic.to_string(),
        format!("r{}", rm),
    ))
}

/// Decode load/store multiple
/// Encoding: 1100 xnnn xxxx xxxx
fn decode_thumb_ldm_stm(hw: u16, addr: u32) -> Option<Instruction> {
    let load = (hw >> 11) & 1;
    let rn = (hw >> 8) & 7;
    let reg_list = hw & 0xFF;

    let mnemonic = if load == 1 { "ldm" } else { "stm" };

    let mut regs = Vec::new();
    for i in 0..8 {
        if reg_list & (1 << i) != 0 {
            regs.push(format!("r{}", i));
        }
    }

    let operands = format!("r{}!, {{{}}}", rn, regs.join(", "));

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        mnemonic.to_string(),
        operands,
    ))
}

/// Decode software interrupt (SVC)
/// Encoding: 1101 1111 iiii iiii
fn decode_thumb_svc(hw: u16, addr: u32) -> Option<Instruction> {
    let imm8 = hw & 0xFF;

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        "svc".to_string(),
        format!("#{}", imm8),
    ))
}

/// Decode breakpoint (BKPT)
/// Encoding: 1011 1110 iiii iiii
fn decode_thumb_bkpt(hw: u16, addr: u32) -> Option<Instruction> {
    let imm8 = hw & 0xFF;

    Some(Instruction::new(
        addr,
        hw.to_le_bytes().to_vec(),
        "bkpt".to_string(),
        format!("#{}", imm8),
    ))
}

// ============================================================================
// 32-bit Thumb-2 Instruction Decoders
// ============================================================================

/// Decode 32-bit branch instructions
fn decode_thumb2_branch(hw1: u16, hw2: u16, addr: u32) -> Option<Instruction> {
    let op1 = (hw1 >> 12) & 0x7;
    let _op2 = (hw2 >> 12) & 0x7;

    // BL (Branch with Link)
    // Encoding: 1111 0Sii iiii iiii 11J1 Jiii iiii iiii
    if op1 == 0b111 && (hw1 >> 11) & 1 == 0 && (hw2 >> 14) & 0x3 == 0b11 {
        let s = (hw1 >> 10) & 1;
        let imm10 = hw1 & 0x3FF;
        let j1 = (hw2 >> 13) & 1;
        let j2 = (hw2 >> 11) & 1;
        let imm11 = hw2 & 0x7FF;

        // Decode I1, I2 from J1, J2
        let i1 = !(j1 ^ s) & 1;
        let i2 = !(j2 ^ s) & 1;

        // Construct 25-bit signed offset (cast to u32 for shifts)
        let imm25 = ((s as u32) << 24) | ((i1 as u32) << 23) | ((i2 as u32) << 22)
                    | ((imm10 as u32) << 12) | ((imm11 as u32) << 1);

        // Sign extend from 25 bits
        let offset = if s == 1 {
            (imm25 as i32) | !0x1FFFFFF
        } else {
            imm25 as i32
        };

        let target = (addr as i32).wrapping_add(4).wrapping_add(offset) as u32;

        let bytes = [
            hw1.to_le_bytes()[0],
            hw1.to_le_bytes()[1],
            hw2.to_le_bytes()[0],
            hw2.to_le_bytes()[1],
        ];

        return Some(Instruction::new(
            addr,
            bytes.to_vec(),
            "bl".to_string(),
            format!("#0x{:x}", target),
        ));
    }

    // B.W (Wide unconditional branch)
    // Encoding: 1111 0Sii iiii iiii 1010 Jiii iiii iiii
    if op1 == 0b111 && (hw1 >> 11) & 1 == 0 && (hw2 >> 12) & 0xF == 0b1010 {
        let s = (hw1 >> 10) & 1;
        let imm10 = hw1 & 0x3FF;
        let j1 = (hw2 >> 13) & 1;
        let j2 = (hw2 >> 11) & 1;
        let imm11 = hw2 & 0x7FF;

        let i1 = !(j1 ^ s) & 1;
        let i2 = !(j2 ^ s) & 1;

        let imm25 = ((s as u32) << 24) | ((i1 as u32) << 23) | ((i2 as u32) << 22)
                    | ((imm10 as u32) << 12) | ((imm11 as u32) << 1);

        let offset = if s == 1 {
            (imm25 as i32) | !0x1FFFFFF
        } else {
            imm25 as i32
        };

        let target = (addr as i32).wrapping_add(4).wrapping_add(offset) as u32;

        let bytes = [
            hw1.to_le_bytes()[0],
            hw1.to_le_bytes()[1],
            hw2.to_le_bytes()[0],
            hw2.to_le_bytes()[1],
        ];

        return Some(Instruction::new(
            addr,
            bytes.to_vec(),
            "b.w".to_string(),
            format!("#0x{:x}", target),
        ));
    }

    // Conditional branch (B<cond>.W)
    // Encoding: 1111 0Sii iiii iiii 10J0 Jiii iiii iiii (with cond)
    if op1 == 0b111 && (hw1 >> 11) & 1 == 0 && (hw2 >> 12) & 0xD == 0b1000 {
        let cond = (hw2 >> 6) & 0xF;

        // Skip if cond is 0b1110 or 0b1111 (unconditional)
        if cond >= 0xE {
            return None;
        }

        let s = (hw1 >> 10) & 1;
        let imm6 = hw1 & 0x3F;
        let j1 = (hw2 >> 13) & 1;
        let j2 = (hw2 >> 11) & 1;
        let imm11 = hw2 & 0x7FF;

        let imm21 = ((s as u32) << 20) | ((j2 as u32) << 19) | ((j1 as u32) << 18)
                    | ((imm6 as u32) << 12) | ((imm11 as u32) << 1);

        let offset = if s == 1 {
            (imm21 as i32) | !0x1FFFFF
        } else {
            imm21 as i32
        };

        let target = (addr as i32).wrapping_add(4).wrapping_add(offset) as u32;

        let condition = match cond {
            0x0 => "eq", 0x1 => "ne", 0x2 => "cs", 0x3 => "cc",
            0x4 => "mi", 0x5 => "pl", 0x6 => "vs", 0x7 => "vc",
            0x8 => "hi", 0x9 => "ls", 0xA => "ge", 0xB => "lt",
            0xC => "gt", 0xD => "le", _ => "al",
        };

        let bytes = [
            hw1.to_le_bytes()[0],
            hw1.to_le_bytes()[1],
            hw2.to_le_bytes()[0],
            hw2.to_le_bytes()[1],
        ];

        return Some(Instruction::new(
            addr,
            bytes.to_vec(),
            format!("b.{}", condition),
            format!("#0x{:x}", target),
        ));
    }

    None
}

/// Decode 32-bit load/store multiple
fn decode_thumb2_ldm_stm(hw1: u16, hw2: u16, addr: u32) -> Option<Instruction> {
    let load = (hw1 >> 4) & 1;
    let w = (hw1 >> 5) & 1;
    let rn = hw1 & 0xF;
    let reg_list = hw2 & 0x1FFF;

    let mnemonic = if load == 1 { "ldm" } else { "stm" };

    let mut regs = Vec::new();
    for i in 0..13 {
        if reg_list & (1 << i) != 0 {
            if i <= 12 {
                regs.push(format!("r{}", i));
            }
        }
    }

    if reg_list & (1 << 14) != 0 {
        regs.push("lr".to_string());
    }
    if reg_list & (1 << 15) != 0 {
        regs.push("pc".to_string());
    }

    let wb = if w == 1 { "!" } else { "" };
    let operands = format!("r{}{}, {{{}}}", rn, wb, regs.join(", "));

    let bytes = [
        hw1.to_le_bytes()[0],
        hw1.to_le_bytes()[1],
        hw2.to_le_bytes()[0],
        hw2.to_le_bytes()[1],
    ];

    Some(Instruction::new(
        addr,
        bytes.to_vec(),
        mnemonic.to_string(),
        operands,
    ))
}

/// Decode 32-bit data processing instructions
fn decode_thumb2_data_proc(hw1: u16, hw2: u16, addr: u32) -> Option<Instruction> {
    let op = (hw1 >> 5) & 0xF;
    let rn = hw1 & 0xF;
    let rd = (hw2 >> 8) & 0xF;
    let rm = hw2 & 0xF;

    let mnemonic = match op {
        0x0 => "and",
        0x1 => "bic",
        0x2 => "orr",
        0x3 => "orn",
        0x4 => "eor",
        0x8 => "add",
        0xA => "adc",
        0xB => "sbc",
        0xD => "sub",
        0xE => "rsb",
        _ => "unknown",
    };

    let bytes = [
        hw1.to_le_bytes()[0],
        hw1.to_le_bytes()[1],
        hw2.to_le_bytes()[0],
        hw2.to_le_bytes()[1],
    ];

    Some(Instruction::new(
        addr,
        bytes.to_vec(),
        mnemonic.to_string(),
        format!("r{}, r{}, r{}", rd, rn, rm),
    ))
}

/// Decode 32-bit load/store single
fn decode_thumb2_load_store(hw1: u16, hw2: u16, addr: u32) -> Option<Instruction> {
    let op1 = (hw1 >> 7) & 0x3;
    let op2 = (hw1 >> 5) & 0x3;
    let rn = hw1 & 0xF;
    let rt = (hw2 >> 12) & 0xF;
    let imm12 = hw2 & 0xFFF;

    // PC-relative load
    if rn == 15 {
        let mnemonic = if op1 == 0x1 { "ldr.w" } else { "ldr" };

        // Calculate target address
        let pc_aligned = (addr + 4) & !0x3;
        let _target = pc_aligned.wrapping_add(imm12 as u32);

        let bytes = [
            hw1.to_le_bytes()[0],
            hw1.to_le_bytes()[1],
            hw2.to_le_bytes()[0],
            hw2.to_le_bytes()[1],
        ];

        return Some(Instruction::new(
            addr,
            bytes.to_vec(),
            mnemonic.to_string(),
            format!("r{}, [pc, #0x{:x}]", rt, imm12),
        ));
    }

    let mnemonic = match (op1, op2) {
        (0x0, _) => "str.w",
        (0x1, _) => "ldr.w",
        (0x2, _) => "strb.w",
        (0x3, _) => "ldrb.w",
        _ => "unknown",
    };

    let bytes = [
        hw1.to_le_bytes()[0],
        hw1.to_le_bytes()[1],
        hw2.to_le_bytes()[0],
        hw2.to_le_bytes()[1],
    ];

    Some(Instruction::new(
        addr,
        bytes.to_vec(),
        mnemonic.to_string(),
        format!("r{}, [r{}, #{}]", rt, rn, imm12),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_16bit_detection() {
        // MOV r0, #42 (16-bit)
        assert!(!is_thumb2_32bit(0x2A00));

        // 32-bit instruction prefix
        assert!(is_thumb2_32bit(0xF000));
    }

    #[test]
    fn test_decode_b_conditional() {
        // beq #0x10 (forward branch)
        // Encoding: 0xD008 (1101 0000 0000 1000)
        let bytes = [0x08, 0xD0];
        let inst = decode_arm_instruction(&bytes, 0x1000).unwrap();

        assert_eq!(inst.mnemonic, "b.eq");
        assert_eq!(inst.size, 2);
        assert!(inst.operands.contains("0x"));
    }

    #[test]
    fn test_decode_b_unconditional() {
        // b #0x20 (forward branch)
        // Encoding: 0xE010 (1110 0000 0001 0000)
        let bytes = [0x10, 0xE0];
        let inst = decode_arm_instruction(&bytes, 0x1000).unwrap();

        assert_eq!(inst.mnemonic, "b");
        assert!(inst.operands.contains("0x"));
    }

    #[test]
    fn test_decode_bl_32bit() {
        // bl #0x100
        // Simplified encoding for test
        let bytes = [0x00, 0xF0, 0x80, 0xF8];
        let inst = decode_arm_instruction(&bytes, 0x1000);

        assert!(inst.is_some());
        let inst = inst.unwrap();
        assert_eq!(inst.mnemonic, "bl");
        assert_eq!(inst.size, 4);
    }

    #[test]
    fn test_decode_push() {
        // push {r4, lr}
        // Encoding: 0xB510 (1011 0101 0001 0000)
        let bytes = [0x10, 0xB5];
        let inst = decode_arm_instruction(&bytes, 0x1000).unwrap();

        assert_eq!(inst.mnemonic, "push");
        assert!(inst.operands.contains("r4"));
        assert!(inst.operands.contains("lr"));
    }

    #[test]
    fn test_decode_pop() {
        // pop {r4, pc}
        // Encoding: 0xBD10 (1011 1101 0001 0000)
        let bytes = [0x10, 0xBD];
        let inst = decode_arm_instruction(&bytes, 0x1000).unwrap();

        assert_eq!(inst.mnemonic, "pop");
        assert!(inst.operands.contains("r4"));
        assert!(inst.operands.contains("pc"));
    }

    #[test]
    fn test_decode_ldr_pc_relative() {
        // ldr r0, [pc, #0x10]
        // Encoding: 0x4804 (0100 1000 0000 0100)
        let bytes = [0x04, 0x48];
        let inst = decode_arm_instruction(&bytes, 0x1000).unwrap();

        assert_eq!(inst.mnemonic, "ldr");
        assert!(inst.operands.contains("r0"));
        assert!(inst.operands.contains("pc"));
    }

    #[test]
    fn test_decode_ldr_immediate() {
        // ldr r0, [r1, #4]
        // Encoding: 0x6848 (0110 1000 0100 1000)
        let bytes = [0x48, 0x68];
        let inst = decode_arm_instruction(&bytes, 0x1000).unwrap();

        assert_eq!(inst.mnemonic, "ldr");
        assert!(inst.operands.contains("r0"));
        assert!(inst.operands.contains("r1"));
    }

    #[test]
    fn test_decode_str_immediate() {
        // str r0, [r1, #4]
        // Encoding: 0x6048 (0110 0000 0100 1000)
        let bytes = [0x48, 0x60];
        let inst = decode_arm_instruction(&bytes, 0x1000).unwrap();

        assert_eq!(inst.mnemonic, "str");
    }

    #[test]
    fn test_decode_mov_imm() {
        // mov r0, #42
        // Encoding: 0x202A (0010 0000 0010 1010)
        let bytes = [0x2A, 0x20];
        let inst = decode_arm_instruction(&bytes, 0x1000).unwrap();

        assert_eq!(inst.mnemonic, "mov");
        assert!(inst.operands.contains("r0"));
        assert!(inst.operands.contains("42"));
    }

    #[test]
    fn test_decode_add_reg() {
        // add r0, r1, r2
        // Encoding: 0x1888 (0001 1000 1000 1000)
        let bytes = [0x88, 0x18];
        let inst = decode_arm_instruction(&bytes, 0x1000).unwrap();

        assert_eq!(inst.mnemonic, "add");
        assert!(inst.operands.contains("r0"));
        assert!(inst.operands.contains("r1"));
        assert!(inst.operands.contains("r2"));
    }

    #[test]
    fn test_decode_sub_reg() {
        // sub r0, r1, r2
        // Encoding: 0x1A88 (0001 1010 1000 1000)
        let bytes = [0x88, 0x1A];
        let inst = decode_arm_instruction(&bytes, 0x1000).unwrap();

        assert_eq!(inst.mnemonic, "sub");
    }

    #[test]
    fn test_decode_bx_lr() {
        // bx lr
        // Encoding: 0x4770 (0100 0111 0111 0000)
        let bytes = [0x70, 0x47];
        let inst = decode_arm_instruction(&bytes, 0x1000).unwrap();

        assert_eq!(inst.mnemonic, "bx");
        assert!(inst.operands.contains("14") || inst.operands.contains("lr"));
    }

    #[test]
    fn test_decode_nop() {
        // nop (actually mov r8, r8)
        // Encoding: 0x46C0 (0100 0110 1100 0000)
        let bytes = [0xC0, 0x46];
        let inst = decode_arm_instruction(&bytes, 0x1000).unwrap();

        assert_eq!(inst.mnemonic, "mov");
    }

    #[test]
    fn test_decode_cmp_imm() {
        // cmp r0, #10
        // Encoding: 0x280A (0010 1000 0000 1010)
        let bytes = [0x0A, 0x28];
        let inst = decode_arm_instruction(&bytes, 0x1000).unwrap();

        assert_eq!(inst.mnemonic, "cmp");
        assert!(inst.operands.contains("r0"));
        assert!(inst.operands.contains("10"));
    }

    #[test]
    fn test_invalid_instruction() {
        // Empty bytes
        let inst = decode_arm_instruction(&[], 0x1000);
        assert!(inst.is_none());

        // Single byte (incomplete)
        let inst = decode_arm_instruction(&[0x00], 0x1000);
        assert!(inst.is_none());
    }

    #[test]
    fn test_unknown_instruction_graceful() {
        // Unknown opcode - should return unknown instead of panicking
        let bytes = [0xFF, 0xFF];
        let inst = decode_arm_instruction(&bytes, 0x1000);

        assert!(inst.is_some());
        // Should decode to something, even if marked as unknown
    }

    #[test]
    fn test_32bit_incomplete() {
        // 32-bit instruction marker but only 2 bytes
        let bytes = [0x00, 0xF0];
        let inst = decode_arm_instruction(&bytes, 0x1000);

        // Should return unknown instruction rather than None
        assert!(inst.is_some());
        let inst = inst.unwrap();
        assert_eq!(inst.mnemonic, "unknown");
        assert!(inst.operands.contains("incomplete"));
    }
}
