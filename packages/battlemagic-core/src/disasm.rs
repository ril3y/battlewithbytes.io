//! ARM disassembly module
//!
//! Provides high-performance ARM/Thumb disassembly using Capstone

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use crate::error::{Result, BattleMagicError};

/// Disassembled instruction
#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Instruction {
    #[wasm_bindgen(readonly)]
    pub address: u32,
    
    #[wasm_bindgen(readonly)]
    pub size: u8,
    
    #[wasm_bindgen(skip)]
    pub bytes: Vec<u8>,
    
    mnemonic: String,
    operands: String,
}

#[wasm_bindgen]
impl Instruction {
    #[wasm_bindgen(getter)]
    pub fn mnemonic(&self) -> String {
        self.mnemonic.clone()
    }
    
    #[wasm_bindgen(getter)]
    pub fn operands(&self) -> String {
        self.operands.clone()
    }
    
    #[wasm_bindgen(getter)]
    pub fn bytes(&self) -> js_sys::Uint8Array {
        js_sys::Uint8Array::from(&self.bytes[..])
    }
    
    /// Get full disassembly string
    pub fn to_string(&self) -> String {
        if self.operands.is_empty() {
            self.mnemonic.clone()
        } else {
            format!("{} {}", self.mnemonic, self.operands)
        }
    }
    
    /// Check if this is a branch instruction
    pub fn is_branch(&self) -> bool {
        self.mnemonic.starts_with('b') || 
        self.mnemonic == "bl" || 
        self.mnemonic == "blx"
    }
    
    /// Check if this is a return instruction
    pub fn is_return(&self) -> bool {
        self.mnemonic == "bx" && self.operands.contains("lr")
    }
}

/// Simple ARM disassembler (proof of concept)
/// In production, this would use Capstone library
#[wasm_bindgen]
pub struct Disassembler {
    base_address: u32,
}

#[wasm_bindgen]
impl Disassembler {
    /// Create new disassembler
    #[wasm_bindgen(constructor)]
    pub fn new(base_address: u32) -> Self {
        Self { base_address }
    }
    
    /// Disassemble ARM Thumb instructions (proof of concept)
    /// For now, this returns mock data to demonstrate the API
    /// Real implementation would use Capstone
    pub fn disassemble_thumb(&self, data: &[u8], max_instructions: u32) -> Result<Vec<JsValue>> {
        if data.is_empty() {
            return Err(BattleMagicError::InvalidInput("Empty data".into()));
        }
        
        let mut instructions = Vec::new();
        let mut offset = 0u32;
        let mut count = 0u32;
        
        // Simple proof-of-concept: parse basic Thumb instructions
        while offset < data.len() as u32 && count < max_instructions {
            let remaining = &data[offset as usize..];
            
            if remaining.len() < 2 {
                break;
            }
            
            // Read 16-bit instruction (little-endian)
            let instr_word = u16::from_le_bytes([remaining[0], remaining[1]]);
            
            let (mnemonic, operands, size) = decode_thumb_instruction(instr_word);
            
            let bytes = if size == 2 {
                vec![remaining[0], remaining[1]]
            } else if remaining.len() >= 4 {
                vec![remaining[0], remaining[1], remaining[2], remaining[3]]
            } else {
                break;
            };
            
            let instruction = Instruction {
                address: self.base_address + offset,
                size: size as u8,
                bytes,
                mnemonic,
                operands,
            };
            
            instructions.push(serde_wasm_bindgen::to_value(&instruction).unwrap());
            offset += size;
            count += 1;
        }
        
        Ok(instructions)
    }
}

/// Decode a single Thumb instruction (simplified proof of concept)
fn decode_thumb_instruction(instr: u16) -> (String, String, u32) {
    // Check for 32-bit instruction (Thumb-2)
    if (instr & 0xE000) == 0xE000 && (instr & 0x1800) != 0x0000 {
        return ("(32-bit)".to_string(), "thumb2".to_string(), 4);
    }
    
    // Simplified decoder for common 16-bit Thumb instructions
    match instr {
        0xBF00 => ("nop".to_string(), "".to_string(), 2),
        0x4770 => ("bx".to_string(), "lr".to_string(), 2),
        _ if (instr & 0xF800) == 0x2000 => {
            // MOVS Rd, #imm8
            let rd = (instr >> 8) & 0x7;
            let imm = instr & 0xFF;
            ("movs".to_string(), format!("r{}, #{}", rd, imm), 2)
        }
        _ if (instr & 0xF800) == 0x3000 => {
            // ADDS Rd, #imm8
            let rd = (instr >> 8) & 0x7;
            let imm = instr & 0xFF;
            ("adds".to_string(), format!("r{}, #{}", rd, imm), 2)
        }
        _ if (instr & 0xFE00) == 0xB400 => {
            // PUSH/POP
            let is_pop = (instr & 0x0800) != 0;
            let reglist = instr & 0xFF;
            let name = if is_pop { "pop" } else { "push" };
            (name.to_string(), format_reglist(reglist), 2)
        }
        _ if (instr & 0xF000) == 0xD000 => {
            // B<cond> (conditional branch)
            let cond = (instr >> 8) & 0xF;
            let offset = ((instr & 0xFF) as i8 as i32) * 2;
            ("b".to_string(), format!("pc{:+#x}", offset), 2)
        }
        _ if (instr & 0xF800) == 0xE000 => {
            // B (unconditional branch)
            let offset = ((instr & 0x7FF) as i16) << 1;
            ("b".to_string(), format!("pc{:+#x}", offset), 2)
        }
        _ => {
            // Unknown instruction - return hex
            ("???".to_string(), format!("0x{:04x}", instr), 2)
        }
    }
}

/// Format register list for PUSH/POP
fn format_reglist(reglist: u16) -> String {
    let mut regs = Vec::new();
    for i in 0..8 {
        if (reglist & (1 << i)) != 0 {
            regs.push(format!("r{}", i));
        }
    }
    format!("{{{}}}", regs.join(", "))
}
