// Monitor Command Parser
//
// Parses GDB monitor command responses (qRcmd).
// Monitor commands return hex-encoded console output with 'O' prefix.
// Multiple 'O' packets may be sent for long output.

use super::{ParseError, ParseResult};
use super::hex_decode::decode_hex_to_vec;
use serde::{Deserialize, Serialize};

/// Monitor command response
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MonitorResponse {
    /// Decoded output text
    pub output: String,
    /// Raw hex-encoded response
    pub hex: String,
}

/// Parse monitor command output
///
/// # Format
/// OXXXXXXXX... (hex-encoded ASCII)
///
/// # Algorithm
/// 1. Check for 'O' prefix
/// 2. Extract hex data after 'O'
/// 3. Decode hex pairs to ASCII characters
///
/// # Arguments
/// * `packet` - Response packet starting with 'O'
///
/// # Returns
/// Parsed monitor output or error
///
/// # Example
/// ```
/// use battlemagic_analyzer::parsing::monitor::parse_monitor_output;
///
/// // O48656c6c6f (hex for "Hello")
/// let result = parse_monitor_output("O48656c6c6f").unwrap();
/// assert_eq!(result.output, "Hello");
/// ```
pub fn parse_monitor_output(packet: &str) -> ParseResult<MonitorResponse> {
    // Step 1: Validate prefix
    if !packet.starts_with('O') {
        return Err(ParseError::with_raw(
            "Not a monitor output packet (must start with O)",
            packet,
        ));
    }

    // Step 2: Extract hex data
    let hex_data = &packet[1..];

    if hex_data.is_empty() {
        return Ok(MonitorResponse {
            output: String::new(),
            hex: String::new(),
        });
    }

    let hex_bytes = hex_data.as_bytes();

    if hex_bytes.len() % 2 != 0 {
        return Err(ParseError::with_raw(
            "Odd number of hex digits in monitor output",
            packet,
        ));
    }

    // Step 3: Decode hex to ASCII
    let bytes = decode_hex_to_vec(hex_bytes)?;
    let output = String::from_utf8(bytes).map_err(|e| {
        ParseError::with_raw(
            format!("Invalid UTF-8 in monitor output: {}", e),
            packet,
        )
    })?;

    Ok(MonitorResponse {
        output,
        hex: hex_data.to_string(),
    })
}

/// Encode monitor command to hex for qRcmd
///
/// # Arguments
/// * `command` - ASCII command string
///
/// # Returns
/// Hex-encoded command
///
/// # Example
/// ```
/// use battlemagic_analyzer::parsing::monitor::encode_monitor_command;
///
/// assert_eq!(encode_monitor_command("help"), "68656c70");
/// ```
pub fn encode_monitor_command(command: &str) -> String {
    command
        .bytes()
        .map(|b| format!("{:02x}", b))
        .collect::<Vec<_>>()
        .join("")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_monitor_output() {
        // "Hello" in hex
        let result = parse_monitor_output("O48656c6c6f").unwrap();
        assert_eq!(result.output, "Hello");
        assert_eq!(result.hex, "48656c6c6f");
    }

    #[test]
    fn test_parse_monitor_output_empty() {
        let result = parse_monitor_output("O").unwrap();
        assert_eq!(result.output, "");
        assert_eq!(result.hex, "");
    }

    #[test]
    fn test_parse_monitor_output_invalid_prefix() {
        assert!(parse_monitor_output("X48656c6c6f").is_err());
    }

    #[test]
    fn test_parse_monitor_output_odd_length() {
        assert!(parse_monitor_output("O123").is_err());
    }

    #[test]
    fn test_encode_monitor_command() {
        assert_eq!(encode_monitor_command("help"), "68656c70");
        assert_eq!(encode_monitor_command("reset"), "7265736574");
    }

    #[test]
    fn test_monitor_roundtrip() {
        let original = "test command";
        let encoded = encode_monitor_command(original);
        let packet = format!("O{}", encoded);
        let result = parse_monitor_output(&packet).unwrap();
        assert_eq!(result.output, original);
    }
}
