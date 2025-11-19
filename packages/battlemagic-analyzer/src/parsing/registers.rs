// ARM Cortex-M Register Parser
//
// Parses GDB 'g' (read all registers) and 'p' (read single register) responses
// for ARM Cortex-M processors.
//
// Register Layout (from 'g' command):
// - R0-R12: General purpose registers (13 registers)
// - R13 (SP): Stack pointer
// - R14 (LR): Link register
// - R15 (PC): Program counter
// - XPSR: Combined program status register (optional)
// - MSP: Main stack pointer (optional)
// - PSP: Process stack pointer (optional)
// - PRIMASK, BASEPRI, FAULTMASK, CONTROL: Special registers (optional)
//
// Each register is encoded as 8 hex characters in little-endian format.

use super::{ParseError, ParseResult};
use super::hex_decode::decode_hex_u32_le;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// ARM Cortex-M register dump (from 'g' command)
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct ArmCortexMRegisters {
    // General purpose registers (R0-R12)
    pub r0: u32,
    pub r1: u32,
    pub r2: u32,
    pub r3: u32,
    pub r4: u32,
    pub r5: u32,
    pub r6: u32,
    pub r7: u32,
    pub r8: u32,
    pub r9: u32,
    pub r10: u32,
    pub r11: u32,
    pub r12: u32,

    // Special registers (R13-R15)
    pub sp: u32,  // R13 - Stack pointer
    pub lr: u32,  // R14 - Link register
    pub pc: u32,  // R15 - Program counter

    // Additional special registers (optional)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub xpsr: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub msp: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub psp: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub primask: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub basepri: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub faultmask: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub control: Option<u32>,
}

/// Single register value (from 'p' command)
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RegisterValue {
    pub reg_num: u32,
    pub value: u32,
    pub hex: String,
}

/// Parse ARM Cortex-M register dump from 'g' command
///
/// # Algorithm
/// 1. Validate hex string length (must be multiple of 8)
/// 2. Split into 8-character chunks (one per register)
/// 3. Decode each chunk from little-endian hex to u32
/// 4. Map to register structure
///
/// # Performance
/// - Zero-copy parsing using slices
/// - Stack-allocated parsing (no heap allocations)
/// - Optimized hex decoding
///
/// # Arguments
/// * `hex_response` - Hex string from 'g' command (e.g., "00000000010000000200000003000000...")
///
/// # Returns
/// Parsed register structure or error
///
/// # Example
/// ```
/// use battlemagic_analyzer::parsing::registers::parse_arm_cortex_m;
///
/// let response = "00000000010000000200000003000000\
///                 04000000050000000600000007000000\
///                 08000000090000000a0000000b000000\
///                 0c0000000d0000000e0000000f000000";
/// let regs = parse_arm_cortex_m(response).unwrap();
/// assert_eq!(regs.r0, 0x00000000);
/// assert_eq!(regs.r1, 0x00000001);
/// assert_eq!(regs.pc, 0x0000000f);
/// ```
pub fn parse_arm_cortex_m(hex_response: &str) -> ParseResult<ArmCortexMRegisters> {
    let hex = hex_response.as_bytes();

    // Step 1: Validate input
    if hex.is_empty() {
        return Err(ParseError::with_raw("Empty register response", hex_response));
    }

    if hex.len() % 8 != 0 {
        return Err(ParseError::with_raw(
            format!("Register data length {} is not multiple of 8", hex.len()),
            hex_response,
        ));
    }

    // Minimum: 16 registers (R0-R15) = 128 hex chars
    if hex.len() < 128 {
        return Err(ParseError::with_raw(
            format!("Register data too short: {} < 128 chars", hex.len()),
            hex_response,
        ));
    }

    // Helper to parse one register at offset
    let parse_reg = |offset: usize| -> ParseResult<u32> {
        if offset + 8 > hex.len() {
            return Err(ParseError::new("Unexpected end of register data"));
        }
        decode_hex_u32_le(&hex[offset..offset + 8])
    };

    // Step 2: Parse standard registers (R0-R15)
    let mut regs = ArmCortexMRegisters {
        r0: parse_reg(0)?,
        r1: parse_reg(8)?,
        r2: parse_reg(16)?,
        r3: parse_reg(24)?,
        r4: parse_reg(32)?,
        r5: parse_reg(40)?,
        r6: parse_reg(48)?,
        r7: parse_reg(56)?,
        r8: parse_reg(64)?,
        r9: parse_reg(72)?,
        r10: parse_reg(80)?,
        r11: parse_reg(88)?,
        r12: parse_reg(96)?,
        sp: parse_reg(104)?,  // R13
        lr: parse_reg(112)?,  // R14
        pc: parse_reg(120)?,  // R15
        xpsr: None,
        msp: None,
        psp: None,
        primask: None,
        basepri: None,
        faultmask: None,
        control: None,
    };

    // Step 3: Parse optional special registers
    let mut offset = 128;

    if offset + 8 <= hex.len() {
        regs.xpsr = Some(parse_reg(offset)?);
        offset += 8;
    }
    if offset + 8 <= hex.len() {
        regs.msp = Some(parse_reg(offset)?);
        offset += 8;
    }
    if offset + 8 <= hex.len() {
        regs.psp = Some(parse_reg(offset)?);
        offset += 8;
    }
    if offset + 8 <= hex.len() {
        regs.primask = Some(parse_reg(offset)?);
        offset += 8;
    }
    if offset + 8 <= hex.len() {
        regs.basepri = Some(parse_reg(offset)?);
        offset += 8;
    }
    if offset + 8 <= hex.len() {
        regs.faultmask = Some(parse_reg(offset)?);
        offset += 8;
    }
    if offset + 8 <= hex.len() {
        regs.control = Some(parse_reg(offset)?);
    }

    Ok(regs)
}

/// Parse single register response from 'p' command
///
/// # Algorithm
/// 1. Validate hex string
/// 2. Decode little-endian hex to u32
/// 3. Return register value with metadata
///
/// # Arguments
/// * `hex_response` - Hex string from 'p' command (e.g., "12345678")
/// * `reg_num` - Register number being read (0-15 for standard regs)
///
/// # Returns
/// Parsed register value or error
///
/// # Example
/// ```
/// use battlemagic_analyzer::parsing::registers::parse_single_register;
///
/// let result = parse_single_register("78563412", 15).unwrap();
/// assert_eq!(result.value, 0x12345678);
/// assert_eq!(result.reg_num, 15);
/// ```
pub fn parse_single_register(hex_response: &str, reg_num: u32) -> ParseResult<RegisterValue> {
    let hex = hex_response.as_bytes();

    // Validate
    if hex.is_empty() {
        return Err(ParseError::with_raw("Empty register response", hex_response));
    }

    if hex.len() % 2 != 0 {
        return Err(ParseError::with_raw(
            "Odd number of hex digits",
            hex_response,
        ));
    }

    // Most ARM registers are 32-bit (8 hex chars)
    if hex.len() != 8 {
        return Err(ParseError::with_raw(
            format!("Expected 8 hex chars for ARM register, got {}", hex.len()),
            hex_response,
        ));
    }

    // Decode little-endian value
    let value = decode_hex_u32_le(hex)?;

    Ok(RegisterValue {
        reg_num,
        value,
        hex: hex_response.to_string(),
    })
}

/// Get register name from number (ARM Cortex-M)
///
/// # Arguments
/// * `reg_num` - Register number (0-22)
///
/// # Returns
/// Register name or None if unknown
pub fn get_register_name(reg_num: u32) -> Option<&'static str> {
    match reg_num {
        0 => Some("r0"),
        1 => Some("r1"),
        2 => Some("r2"),
        3 => Some("r3"),
        4 => Some("r4"),
        5 => Some("r5"),
        6 => Some("r6"),
        7 => Some("r7"),
        8 => Some("r8"),
        9 => Some("r9"),
        10 => Some("r10"),
        11 => Some("r11"),
        12 => Some("r12"),
        13 => Some("sp"),
        14 => Some("lr"),
        15 => Some("pc"),
        16 => Some("xpsr"),
        17 => Some("msp"),
        18 => Some("psp"),
        19 => Some("primask"),
        20 => Some("basepri"),
        21 => Some("faultmask"),
        22 => Some("control"),
        _ => None,
    }
}

/// Convert register value to little-endian hex string for writing
///
/// # Arguments
/// * `value` - Register value (32-bit)
///
/// # Returns
/// Little-endian hex string (8 characters)
pub fn register_to_hex(value: u32) -> String {
    let bytes = value.to_le_bytes();
    format!(
        "{:02x}{:02x}{:02x}{:02x}",
        bytes[0], bytes[1], bytes[2], bytes[3]
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_arm_cortex_m_minimal() {
        // 16 registers (R0-R15), all zeros
        let hex = "00000000".repeat(16);
        let regs = parse_arm_cortex_m(&hex).unwrap();

        assert_eq!(regs.r0, 0);
        assert_eq!(regs.pc, 0);
        assert_eq!(regs.xpsr, None);
    }

    #[test]
    fn test_parse_arm_cortex_m_with_special() {
        // 16 standard + 7 special registers
        let mut hex = String::new();
        for i in 0..23 {
            hex.push_str(&format!("{:08x}", i));
        }

        let regs = parse_arm_cortex_m(&hex).unwrap();

        assert_eq!(regs.r0, 0x00000000);
        assert_eq!(regs.r1, 0x01000000); // Little-endian!
        assert_eq!(regs.pc, 0x0f000000);
        assert_eq!(regs.xpsr, Some(0x10000000));
        assert_eq!(regs.control, Some(0x16000000));
    }

    #[test]
    fn test_parse_single_register() {
        let result = parse_single_register("78563412", 15).unwrap();
        assert_eq!(result.value, 0x12345678);
        assert_eq!(result.reg_num, 15);
        assert_eq!(result.hex, "78563412");
    }

    #[test]
    fn test_parse_register_errors() {
        assert!(parse_arm_cortex_m("").is_err());
        assert!(parse_arm_cortex_m("12345").is_err()); // Not multiple of 8
        assert!(parse_arm_cortex_m("12345678").is_err()); // Too short
        assert!(parse_single_register("", 0).is_err());
        assert!(parse_single_register("123", 0).is_err()); // Odd length
    }

    #[test]
    fn test_register_name() {
        assert_eq!(get_register_name(0), Some("r0"));
        assert_eq!(get_register_name(13), Some("sp"));
        assert_eq!(get_register_name(15), Some("pc"));
        assert_eq!(get_register_name(16), Some("xpsr"));
        assert_eq!(get_register_name(99), None);
    }

    #[test]
    fn test_register_to_hex() {
        assert_eq!(register_to_hex(0x12345678), "78563412");
        assert_eq!(register_to_hex(0x00000000), "00000000");
        assert_eq!(register_to_hex(0xFFFFFFFF), "ffffffff");
    }
}
