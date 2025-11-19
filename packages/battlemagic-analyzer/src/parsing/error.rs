// Error Response Parser
//
// Parses GDB error responses (E packets).
// Format: Enn (nn = two-digit hex error code)

use super::{ParseError, ParseResult};
use serde::{Deserialize, Serialize};

/// Error response from GDB
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ErrorResponse {
    /// Error code (hex string)
    pub code: String,
    /// Error code (decimal)
    pub code_num: u32,
    /// Human-readable error message
    pub message: String,
}

/// Get error message for standard GDB error codes
fn get_error_message(code_num: u32) -> String {
    match code_num {
        0x00 => "No error".to_string(),
        0x01 => "Generic error".to_string(),
        0x02 => "Invalid memory address".to_string(),
        0x03 => "Invalid register number".to_string(),
        0x04 => "Not stopped".to_string(),
        0x05 => "Not running".to_string(),
        0x06 => "Invalid parameter".to_string(),
        0x07 => "Permission denied".to_string(),
        0x08 => "Not supported".to_string(),
        0x09 => "Resource not available".to_string(),
        0x0A => "Invalid thread".to_string(),
        0x0B => "Invalid target".to_string(),
        _ => format!("Unknown error (code {:02x})", code_num),
    }
}

/// Parse error response
///
/// # Format
/// Enn - nn: Two-digit hex error code
///
/// # Arguments
/// * `packet` - Error packet
///
/// # Returns
/// Parsed error or parse error
///
/// # Example
/// ```
/// use battlemagic_analyzer::parsing::error::parse_error;
///
/// let result = parse_error("E02").unwrap();
/// assert_eq!(result.code, "02");
/// assert_eq!(result.code_num, 2);
/// assert_eq!(result.message, "Invalid memory address");
/// ```
pub fn parse_error(packet: &str) -> ParseResult<ErrorResponse> {
    if !packet.starts_with('E') {
        return Err(ParseError::with_raw("Not an error packet", packet));
    }

    if packet.len() < 2 {
        return Err(ParseError::with_raw("Error packet too short", packet));
    }

    let code = &packet[1..];

    let code_num = u32::from_str_radix(code, 16)
        .map_err(|_| ParseError::with_raw("Invalid hex in error code", packet))?;

    let message = get_error_message(code_num);

    Ok(ErrorResponse {
        code: code.to_string(),
        code_num,
        message,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_error() {
        let result = parse_error("E02").unwrap();
        assert_eq!(result.code, "02");
        assert_eq!(result.code_num, 2);
        assert_eq!(result.message, "Invalid memory address");
    }

    #[test]
    fn test_parse_error_unknown() {
        let result = parse_error("EFF").unwrap();
        assert_eq!(result.code, "FF");
        assert_eq!(result.code_num, 255);
        assert!(result.message.contains("Unknown error"));
    }

    #[test]
    fn test_parse_error_invalid() {
        assert!(parse_error("X02").is_err());
        assert!(parse_error("E").is_err());
        assert!(parse_error("EGG").is_err());
    }

    #[test]
    fn test_all_standard_errors() {
        for code in 0..=0x0B {
            let packet = format!("E{:02x}", code);
            let result = parse_error(&packet).unwrap();
            assert_eq!(result.code_num, code);
            assert!(!result.message.is_empty());
        }
    }
}
