// Stop Reply Parser
//
// Parses GDB stop reply packets that indicate why the target stopped:
// - 'T' packets: Detailed stop information with key-value pairs
// - 'S' packets: Simple stop with signal number only
//
// Format:
// - Txx[key:value;]... - Detailed stop (xx = signal number in hex)
// - Sxx - Simple stop (xx = signal number in hex)

use super::{ParseError, ParseResult};
use super::hex_decode::decode_hex_u32_le;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Stop reason classification
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum StopReason {
    Breakpoint,
    Watchpoint,
    SingleStep,
    Signal,
    Exited,
    Terminated,
    Unknown,
}

/// Detailed stop reply (from 'T' packets)
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StopReplyDetailed {
    /// Signal number (5 = SIGTRAP for breakpoint, 2 = SIGINT for Ctrl+C)
    pub signal: u8,
    /// Stop reason if determinable
    pub reason: StopReason,
    /// Thread ID if available
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thread: Option<u32>,
    /// Core ID for multi-core systems
    #[serde(skip_serializing_if = "Option::is_none")]
    pub core: Option<u32>,
    /// Watchpoint address if applicable
    #[serde(skip_serializing_if = "Option::is_none")]
    pub watch_addr: Option<u32>,
    /// Register values included in stop reply
    #[serde(skip_serializing_if = "Option::is_none")]
    pub registers: Option<HashMap<u32, u32>>,
    /// Raw key-value pairs from packet
    pub raw_info: HashMap<String, String>,
}

/// Simple stop reply (from 'S' packets)
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StopReplySimple {
    /// Signal number
    pub signal: u8,
    /// Stop reason (inferred from signal)
    pub reason: StopReason,
}

/// Combined stop reply type
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum StopReply {
    Detailed(StopReplyDetailed),
    Simple(StopReplySimple),
}

/// Signal number to stop reason mapping
fn signal_to_reason(signal: u8) -> StopReason {
    match signal {
        2 => StopReason::Signal,      // SIGINT - Ctrl+C
        5 => StopReason::Breakpoint,  // SIGTRAP - Breakpoint/watchpoint
        11 => StopReason::Signal,     // SIGSEGV - Memory fault
        _ => StopReason::Unknown,
    }
}

/// Parse detailed stop reply from 'T' packet
///
/// # Algorithm
/// 1. Extract signal number from first 2 hex digits
/// 2. Parse key:value pairs separated by semicolons
/// 3. Determine stop reason from signal and keys
/// 4. Extract thread, core, watchpoint info
/// 5. Parse any included register values
///
/// # Format
/// Txx[key:value;]...
/// - xx: Signal number (2 hex digits)
/// - key:value pairs provide additional context
///
/// Common keys:
/// - thread: Thread ID
/// - core: Core number
/// - watch/rwatch/awatch: Watchpoint address
/// - swbreak: Software breakpoint indicator
/// - hwbreak: Hardware breakpoint indicator
/// - NN: Register value (NN is hex register number)
///
/// # Arguments
/// * `packet` - Raw 'T' packet data
///
/// # Returns
/// Parsed stop reply or error
///
/// # Example
/// ```
/// use battlemagic_analyzer::parsing::stop_reply::parse_detailed_stop_reply;
///
/// let result = parse_detailed_stop_reply("T05thread:01;swbreak:;").unwrap();
/// assert_eq!(result.signal, 5);
/// assert_eq!(result.thread, Some(1));
/// ```
pub fn parse_detailed_stop_reply(packet: &str) -> ParseResult<StopReplyDetailed> {
    // Step 1: Validate packet format
    if !packet.starts_with('T') {
        return Err(ParseError::with_raw("Not a T packet", packet));
    }

    if packet.len() < 3 {
        return Err(ParseError::with_raw("T packet too short", packet));
    }

    // Step 2: Extract signal number
    let signal_hex = &packet[1..3];
    let signal = u8::from_str_radix(signal_hex, 16)
        .map_err(|_| ParseError::with_raw("Invalid signal hex", packet))?;

    // Step 3: Parse key:value pairs
    let mut raw_info = HashMap::new();
    let remainder = &packet[3..];

    if !remainder.is_empty() {
        let pairs: Vec<&str> = remainder.split(';').filter(|p| !p.is_empty()).collect();

        for pair in pairs {
            if let Some(colon_idx) = pair.find(':') {
                let key = &pair[..colon_idx];
                let value = &pair[colon_idx + 1..];
                raw_info.insert(key.to_string(), value.to_string());
            } else {
                // Key without value (e.g., "swbreak")
                raw_info.insert(pair.to_string(), String::new());
            }
        }
    }

    // Step 4: Determine stop reason
    let mut reason = signal_to_reason(signal);

    if raw_info.contains_key("swbreak") || raw_info.contains_key("hwbreak") {
        reason = StopReason::Breakpoint;
    } else if raw_info.contains_key("watch")
        || raw_info.contains_key("rwatch")
        || raw_info.contains_key("awatch")
    {
        reason = StopReason::Watchpoint;
    }

    // Step 5: Extract structured data
    let mut result = StopReplyDetailed {
        signal,
        reason,
        thread: None,
        core: None,
        watch_addr: None,
        registers: None,
        raw_info: raw_info.clone(),
    };

    // Parse thread ID
    if let Some(thread_val) = raw_info.get("thread") {
        if !thread_val.is_empty() {
            if let Ok(tid) = u32::from_str_radix(thread_val, 16) {
                result.thread = Some(tid);
            }
        }
    }

    // Parse core ID
    if let Some(core_val) = raw_info.get("core") {
        if !core_val.is_empty() {
            if let Ok(cid) = u32::from_str_radix(core_val, 16) {
                result.core = Some(cid);
            }
        }
    }

    // Parse watchpoint address
    for key in &["watch", "rwatch", "awatch"] {
        if let Some(addr_val) = raw_info.get(*key) {
            if !addr_val.is_empty() {
                if let Ok(addr) = u32::from_str_radix(addr_val, 16) {
                    result.watch_addr = Some(addr);
                    break;
                }
            }
        }
    }

    // Step 6: Parse register values
    // Register values have numeric keys (hex register number)
    let mut registers = HashMap::new();

    for (key, value) in &raw_info {
        // Check if key is a hex number (register number)
        if key.chars().all(|c| c.is_ascii_hexdigit()) && !value.is_empty() {
            if let Ok(reg_num) = u32::from_str_radix(key, 16) {
                // Parse register value (little-endian)
                if value.len() == 8 {
                    if let Ok(reg_value) = decode_hex_u32_le(value.as_bytes()) {
                        registers.insert(reg_num, reg_value);
                    }
                }
            }
        }
    }

    if !registers.is_empty() {
        result.registers = Some(registers);
    }

    Ok(result)
}

/// Parse simple stop reply from 'S' packet
///
/// # Format
/// Sxx - xx: Signal number only
///
/// # Arguments
/// * `packet` - Raw 'S' packet data
///
/// # Returns
/// Parsed stop reply or error
///
/// # Example
/// ```
/// use battlemagic_analyzer::parsing::stop_reply::parse_simple_stop_reply;
///
/// let result = parse_simple_stop_reply("S05").unwrap();
/// assert_eq!(result.signal, 5);
/// ```
pub fn parse_simple_stop_reply(packet: &str) -> ParseResult<StopReplySimple> {
    if !packet.starts_with('S') {
        return Err(ParseError::with_raw("Not an S packet", packet));
    }

    if packet.len() != 3 {
        return Err(ParseError::with_raw(
            "S packet must be exactly 3 characters",
            packet,
        ));
    }

    let signal_hex = &packet[1..3];
    let signal = u8::from_str_radix(signal_hex, 16)
        .map_err(|_| ParseError::with_raw("Invalid signal hex", packet))?;

    let reason = signal_to_reason(signal);

    Ok(StopReplySimple { signal, reason })
}

/// Parse any stop reply (auto-detects T or S packet)
///
/// # Arguments
/// * `packet` - Raw stop reply packet
///
/// # Returns
/// Parsed stop reply or error
pub fn parse_stop_reply(packet: &str) -> ParseResult<StopReply> {
    if packet.starts_with('T') {
        Ok(StopReply::Detailed(parse_detailed_stop_reply(packet)?))
    } else if packet.starts_with('S') {
        Ok(StopReply::Simple(parse_simple_stop_reply(packet)?))
    } else {
        Err(ParseError::with_raw(
            "Not a stop reply packet (must start with T or S)",
            packet,
        ))
    }
}

/// Get human-readable signal name
///
/// # Arguments
/// * `signal` - Signal number
///
/// # Returns
/// Signal name string
pub fn get_signal_name(signal: u8) -> String {
    match signal {
        0 => "SIG0".to_string(),
        2 => "SIGINT".to_string(),
        5 => "SIGTRAP".to_string(),
        11 => "SIGSEGV".to_string(),
        15 => "SIGTERM".to_string(),
        _ => format!("SIG{}", signal),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_stop_reply() {
        let result = parse_simple_stop_reply("S05").unwrap();
        assert_eq!(result.signal, 5);
        assert_eq!(result.reason, StopReason::Breakpoint);
    }

    #[test]
    fn test_parse_detailed_stop_reply_minimal() {
        let result = parse_detailed_stop_reply("T05").unwrap();
        assert_eq!(result.signal, 5);
        assert_eq!(result.reason, StopReason::Breakpoint);
        assert_eq!(result.thread, None);
    }

    #[test]
    fn test_parse_detailed_stop_reply_with_thread() {
        let result = parse_detailed_stop_reply("T05thread:01;swbreak:;").unwrap();
        assert_eq!(result.signal, 5);
        assert_eq!(result.thread, Some(1));
        assert_eq!(result.reason, StopReason::Breakpoint);
        assert!(result.raw_info.contains_key("swbreak"));
    }

    #[test]
    fn test_parse_detailed_stop_reply_with_registers() {
        let result = parse_detailed_stop_reply("T05thread:01;0f:12345678;").unwrap();
        assert_eq!(result.signal, 5);
        assert!(result.registers.is_some());
        let regs = result.registers.unwrap();
        assert_eq!(regs.get(&15), Some(&0x78563412)); // Little-endian
    }

    #[test]
    fn test_parse_stop_reply_auto() {
        let result = parse_stop_reply("S05").unwrap();
        match result {
            StopReply::Simple(s) => assert_eq!(s.signal, 5),
            _ => panic!("Expected Simple variant"),
        }

        let result = parse_stop_reply("T05").unwrap();
        match result {
            StopReply::Detailed(d) => assert_eq!(d.signal, 5),
            _ => panic!("Expected Detailed variant"),
        }
    }

    #[test]
    fn test_get_signal_name() {
        assert_eq!(get_signal_name(2), "SIGINT");
        assert_eq!(get_signal_name(5), "SIGTRAP");
        assert_eq!(get_signal_name(99), "SIG99");
    }
}
