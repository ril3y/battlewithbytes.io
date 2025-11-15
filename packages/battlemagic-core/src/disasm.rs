//! ARM disassembly module
//!
//! Provides high-performance ARM/Thumb disassembly using yaxpeax-arm

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use yaxpeax_arm::armv7::InstDecoder;
use yaxpeax_arch::{Decoder, LengthedInstruction, U8Reader};
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

    text: String,
}

#[wasm_bindgen]
impl Instruction {
    #[wasm_bindgen(getter)]
    pub fn mnemonic(&self) -> String {
        // Extract mnemonic from full text (first word)
        self.text.split_whitespace().next().unwrap_or("").to_string()
    }

    #[wasm_bindgen(getter)]
    pub fn operands(&self) -> String {
        // Extract operands from full text (everything after first word)
        self.text
            .split_once(' ')
            .map(|(_, ops)| ops.to_string())
            .unwrap_or_default()
    }

    #[wasm_bindgen(getter)]
    pub fn bytes(&self) -> js_sys::Uint8Array {
        js_sys::Uint8Array::from(&self.bytes[..])
    }

    /// Get full disassembly string
    pub fn to_string(&self) -> String {
        self.text.clone()
    }

    /// Check if this is a branch instruction
    pub fn is_branch(&self) -> bool {
        let mnem = self.mnemonic().to_lowercase();
        mnem.starts_with('b') || mnem == "bl" || mnem == "blx"
    }

    /// Check if this is a return instruction
    pub fn is_return(&self) -> bool {
        let text = self.text.to_lowercase();
        text.contains("bx") && text.contains("lr")
    }
}

/// ARM disassembler using yaxpeax-arm
#[wasm_bindgen]
pub struct Disassembler {
    base_address: u32,
}

#[wasm_bindgen]
impl Disassembler {
    /// Create new disassembler for ARM Thumb mode
    #[wasm_bindgen(constructor)]
    pub fn new(base_address: u32) -> Self {
        Self { base_address }
    }

    /// Disassemble ARM Thumb instructions using yaxpeax-arm
    pub fn disassemble_thumb(&self, data: &[u8], max_instructions: u32) -> Result<Vec<JsValue>> {
        if data.is_empty() {
            return Err(BattleMagicError::InvalidInput("Empty data".into()));
        }

        // Create Thumb decoder
        let decoder = InstDecoder::default_thumb();
        let mut instructions = Vec::new();
        let mut offset = 0usize;
        let mut count = 0u32;

        while offset < data.len() && count < max_instructions {
            let remaining = &data[offset..];
            let mut reader = U8Reader::new(remaining);

            // Try to decode instruction
            match decoder.decode(&mut reader) {
                Ok(instr) => {
                    let len = instr.len().to_const() as usize;

                    if len == 0 || len > remaining.len() {
                        break;
                    }

                    let bytes = remaining[..len].to_vec();
                    let text = format!("{}", instr);

                    let instruction = Instruction {
                        address: self.base_address + offset as u32,
                        size: len as u8,
                        bytes,
                        text,
                    };

                    instructions.push(serde_wasm_bindgen::to_value(&instruction)
                        .map_err(|e| BattleMagicError::SerializationError(format!("{}", e)))?);

                    offset += len;
                    count += 1;
                }
                Err(_) => {
                    // If we can't decode, try skipping 2 bytes (minimum Thumb instruction size)
                    if remaining.len() >= 2 {
                        let bytes = vec![remaining[0], remaining[1]];
                        let instruction = Instruction {
                            address: self.base_address + offset as u32,
                            size: 2,
                            bytes: bytes.clone(),
                            text: format!("??? 0x{:02x}{:02x}", bytes[0], bytes[1]),
                        };

                        instructions.push(serde_wasm_bindgen::to_value(&instruction)
                            .map_err(|e| BattleMagicError::SerializationError(format!("{}", e)))?);

                        offset += 2;
                        count += 1;
                    } else {
                        break;
                    }
                }
            }
        }

        Ok(instructions)
    }

    /// Disassemble ARM (not Thumb) instructions
    pub fn disassemble_arm(&self, data: &[u8], max_instructions: u32) -> Result<Vec<JsValue>> {
        if data.is_empty() {
            return Err(BattleMagicError::InvalidInput("Empty data".into()));
        }

        // Create ARM decoder
        let decoder = InstDecoder::default();
        let mut instructions = Vec::new();
        let mut offset = 0usize;
        let mut count = 0u32;

        while offset < data.len() && count < max_instructions {
            let remaining = &data[offset..];

            // Try to decode instruction (ARM instructions are always 4 bytes)
            if remaining.len() < 4 {
                break;
            }

            let mut reader = U8Reader::new(remaining);

            match decoder.decode(&mut reader) {
                Ok(instr) => {
                    let len = instr.len().to_const() as usize;

                    if len == 0 || len > remaining.len() {
                        break;
                    }

                    let bytes = remaining[..len].to_vec();
                    let text = format!("{}", instr);

                    let instruction = Instruction {
                        address: self.base_address + offset as u32,
                        size: len as u8,
                        bytes,
                        text,
                    };

                    instructions.push(serde_wasm_bindgen::to_value(&instruction)
                        .map_err(|e| BattleMagicError::SerializationError(format!("{}", e)))?);

                    offset += len;
                    count += 1;
                }
                Err(_) => {
                    // If we can't decode, skip 4 bytes
                    let bytes = remaining[..4].to_vec();
                    let instruction = Instruction {
                        address: self.base_address + offset as u32,
                        size: 4,
                        bytes: bytes.clone(),
                        text: format!("??? 0x{:02x}{:02x}{:02x}{:02x}",
                            bytes[0], bytes[1], bytes[2], bytes[3]),
                    };

                    instructions.push(serde_wasm_bindgen::to_value(&instruction)
                        .map_err(|e| BattleMagicError::SerializationError(format!("{}", e)))?);

                    offset += 4;
                    count += 1;
                }
            }
        }

        Ok(instructions)
    }
}
