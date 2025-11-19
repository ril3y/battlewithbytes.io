// WASM Bindings for RSP Parsers
//
// Provides JavaScript/TypeScript-friendly bindings for all RSP parsers.
// All functions return JSON-serialized results for easy consumption.

use wasm_bindgen::prelude::*;
use super::registers::{parse_arm_cortex_m, parse_single_register};
use super::memory::{parse_memory_read, parse_memory_write};
use super::stop_reply::parse_stop_reply;
use super::breakpoint::parse_breakpoint_response;
use super::monitor::{parse_monitor_output, encode_monitor_command};
use super::error::parse_error;

/// Parse ARM Cortex-M register dump (WASM binding)
///
/// # Arguments
/// * `hex_response` - Hex string from 'g' command
///
/// # Returns
/// JSON string with register values or error
#[wasm_bindgen(js_name = parseArmCortexMRegisters)]
pub fn wasm_parse_arm_cortex_m(hex_response: &str) -> String {
    match parse_arm_cortex_m(hex_response) {
        Ok(regs) => serde_json::to_string(&regs).unwrap_or_else(|e| {
            format!("{{\"error\": \"Serialization failed: {}\"}}", e)
        }),
        Err(e) => format!("{{\"error\": \"{}\"}}", e),
    }
}

/// Parse single register value (WASM binding)
///
/// # Arguments
/// * `hex_response` - Hex string from 'p' command
/// * `reg_num` - Register number
///
/// # Returns
/// JSON string with register value or error
#[wasm_bindgen(js_name = parseSingleRegister)]
pub fn wasm_parse_single_register(hex_response: &str, reg_num: u32) -> String {
    match parse_single_register(hex_response, reg_num) {
        Ok(reg) => serde_json::to_string(&reg).unwrap_or_else(|e| {
            format!("{{\"error\": \"Serialization failed: {}\"}}", e)
        }),
        Err(e) => format!("{{\"error\": \"{}\"}}", e),
    }
}

/// Parse memory read response (WASM binding)
///
/// # Arguments
/// * `hex_response` - Hex string from 'm' command
/// * `address` - Address that was read
/// * `length` - Expected number of bytes
///
/// # Returns
/// JSON string with memory data or error
#[wasm_bindgen(js_name = parseMemoryRead)]
pub fn wasm_parse_memory_read(hex_response: &str, address: u32, length: u32) -> String {
    match parse_memory_read(hex_response, address, length as usize) {
        Ok(mem) => serde_json::to_string(&mem).unwrap_or_else(|e| {
            format!("{{\"error\": \"Serialization failed: {}\"}}", e)
        }),
        Err(e) => format!("{{\"error\": \"{}\"}}", e),
    }
}

/// Parse memory write response (WASM binding)
///
/// # Arguments
/// * `response` - Response from 'M' command
/// * `address` - Address that was written
/// * `length` - Number of bytes written
///
/// # Returns
/// JSON string with write result or error
#[wasm_bindgen(js_name = parseMemoryWrite)]
pub fn wasm_parse_memory_write(response: &str, address: u32, length: u32) -> String {
    match parse_memory_write(response, address, length as usize) {
        Ok(result) => serde_json::to_string(&result).unwrap_or_else(|e| {
            format!("{{\"error\": \"Serialization failed: {}\"}}", e)
        }),
        Err(e) => format!("{{\"error\": \"{}\"}}", e),
    }
}

/// Parse stop reply (WASM binding)
///
/// # Arguments
/// * `packet` - Stop reply packet (T or S)
///
/// # Returns
/// JSON string with stop information or error
#[wasm_bindgen(js_name = parseStopReply)]
pub fn wasm_parse_stop_reply(packet: &str) -> String {
    match parse_stop_reply(packet) {
        Ok(stop) => serde_json::to_string(&stop).unwrap_or_else(|e| {
            format!("{{\"error\": \"Serialization failed: {}\"}}", e)
        }),
        Err(e) => format!("{{\"error\": \"{}\"}}", e),
    }
}

/// Parse breakpoint response (WASM binding)
///
/// # Arguments
/// * `response` - Response from Z/z command
/// * `address` - Breakpoint address
/// * `bp_type` - Breakpoint type (0-4)
///
/// # Returns
/// JSON string with breakpoint result or error
#[wasm_bindgen(js_name = parseBreakpointResponse)]
pub fn wasm_parse_breakpoint_response(response: &str, address: u32, bp_type: u32) -> String {
    match parse_breakpoint_response(response, address, bp_type) {
        Ok(result) => serde_json::to_string(&result).unwrap_or_else(|e| {
            format!("{{\"error\": \"Serialization failed: {}\"}}", e)
        }),
        Err(e) => format!("{{\"error\": \"{}\"}}", e),
    }
}

/// Parse monitor output (WASM binding)
///
/// # Arguments
/// * `packet` - Monitor output packet (O)
///
/// # Returns
/// JSON string with monitor output or error
#[wasm_bindgen(js_name = parseMonitorOutput)]
pub fn wasm_parse_monitor_output(packet: &str) -> String {
    match parse_monitor_output(packet) {
        Ok(output) => serde_json::to_string(&output).unwrap_or_else(|e| {
            format!("{{\"error\": \"Serialization failed: {}\"}}", e)
        }),
        Err(e) => format!("{{\"error\": \"{}\"}}", e),
    }
}

/// Encode monitor command (WASM binding)
///
/// # Arguments
/// * `command` - ASCII command string
///
/// # Returns
/// Hex-encoded command string
#[wasm_bindgen(js_name = encodeMonitorCommand)]
pub fn wasm_encode_monitor_command(command: &str) -> String {
    encode_monitor_command(command)
}

/// Parse error response (WASM binding)
///
/// # Arguments
/// * `packet` - Error packet (E)
///
/// # Returns
/// JSON string with error information or parse error
#[wasm_bindgen(js_name = parseError)]
pub fn wasm_parse_error(packet: &str) -> String {
    match parse_error(packet) {
        Ok(err) => serde_json::to_string(&err).unwrap_or_else(|e| {
            format!("{{\"error\": \"Serialization failed: {}\"}}", e)
        }),
        Err(e) => format!("{{\"error\": \"{}\"}}", e),
    }
}
