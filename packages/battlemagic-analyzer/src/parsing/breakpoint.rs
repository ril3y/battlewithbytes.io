// Breakpoint Parser
//
// Parses GDB breakpoint operation responses:
// - 'Z' command: Insert breakpoint/watchpoint
// - 'z' command: Remove breakpoint/watchpoint
//
// Response is typically 'OK' on success, 'Enn' on error

use super::ParseResult;
use serde::{Deserialize, Serialize};

/// Breakpoint operation result
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BreakpointResult {
    /// Operation succeeded
    pub success: bool,
    /// Breakpoint address
    pub address: u32,
    /// Breakpoint type (0=software, 1=hardware, 2-4=watchpoint)
    pub bp_type: u32,
    /// Error message if failed
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

/// Parse breakpoint insert response (Z command)
///
/// # Format
/// Command: Z<type>,<addr>,<kind>
/// Response: OK (success) or E<nn> (error)
///
/// # Arguments
/// * `response` - Response packet
/// * `address` - Breakpoint address
/// * `bp_type` - Breakpoint type (0-4)
///
/// # Returns
/// Breakpoint result
///
/// # Example
/// ```
/// use battlemagic_analyzer::parsing::breakpoint::parse_breakpoint_insert;
///
/// let result = parse_breakpoint_insert("OK", 0x08000000, 0).unwrap();
/// assert!(result.success);
/// assert_eq!(result.address, 0x08000000);
/// ```
pub fn parse_breakpoint_insert(
    response: &str,
    address: u32,
    bp_type: u32,
) -> ParseResult<BreakpointResult> {
    if response == "OK" {
        return Ok(BreakpointResult {
            success: true,
            address,
            bp_type,
            error: None,
        });
    }

    // Parse error
    let error = if response.starts_with('E') {
        let code = &response[1..];
        format!("Error code {}", code)
    } else if response.is_empty() {
        "Empty response (unsupported)".to_string()
    } else {
        format!("Unknown response: {}", response)
    };

    Ok(BreakpointResult {
        success: false,
        address,
        bp_type,
        error: Some(error),
    })
}

/// Parse breakpoint remove response (z command)
///
/// # Format
/// Command: z<type>,<addr>,<kind>
/// Response: OK (success) or E<nn> (error)
///
/// # Arguments
/// * `response` - Response packet
/// * `address` - Breakpoint address
/// * `bp_type` - Breakpoint type (0-4)
///
/// # Returns
/// Breakpoint result
pub fn parse_breakpoint_remove(
    response: &str,
    address: u32,
    bp_type: u32,
) -> ParseResult<BreakpointResult> {
    // Same logic as insert
    parse_breakpoint_insert(response, address, bp_type)
}

/// Parse generic breakpoint response
///
/// # Arguments
/// * `response` - Response packet
/// * `address` - Breakpoint address
/// * `bp_type` - Breakpoint type (0-4)
///
/// # Returns
/// Breakpoint result
pub fn parse_breakpoint_response(
    response: &str,
    address: u32,
    bp_type: u32,
) -> ParseResult<BreakpointResult> {
    parse_breakpoint_insert(response, address, bp_type)
}

/// Get breakpoint type name
///
/// # Arguments
/// * `bp_type` - Breakpoint type number
///
/// # Returns
/// Type name string
///
/// # Example
/// ```
/// use battlemagic_analyzer::parsing::breakpoint::get_breakpoint_type_name;
///
/// assert_eq!(get_breakpoint_type_name(0), "Software Breakpoint");
/// assert_eq!(get_breakpoint_type_name(1), "Hardware Breakpoint");
/// ```
pub fn get_breakpoint_type_name(bp_type: u32) -> String {
    match bp_type {
        0 => "Software Breakpoint".to_string(),
        1 => "Hardware Breakpoint".to_string(),
        2 => "Write Watchpoint".to_string(),
        3 => "Read Watchpoint".to_string(),
        4 => "Access Watchpoint".to_string(),
        _ => format!("Unknown ({})", bp_type),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_breakpoint_insert_success() {
        let result = parse_breakpoint_insert("OK", 0x08000000, 0).unwrap();
        assert!(result.success);
        assert_eq!(result.address, 0x08000000);
        assert_eq!(result.bp_type, 0);
        assert_eq!(result.error, None);
    }

    #[test]
    fn test_parse_breakpoint_insert_error() {
        let result = parse_breakpoint_insert("E01", 0x08000000, 0).unwrap();
        assert!(!result.success);
        assert_eq!(result.address, 0x08000000);
        assert!(result.error.is_some());
    }

    #[test]
    fn test_parse_breakpoint_remove() {
        let result = parse_breakpoint_remove("OK", 0x08000000, 1).unwrap();
        assert!(result.success);
        assert_eq!(result.bp_type, 1);
    }

    #[test]
    fn test_get_breakpoint_type_name() {
        assert_eq!(get_breakpoint_type_name(0), "Software Breakpoint");
        assert_eq!(get_breakpoint_type_name(1), "Hardware Breakpoint");
        assert_eq!(get_breakpoint_type_name(2), "Write Watchpoint");
        assert_eq!(get_breakpoint_type_name(99), "Unknown (99)");
    }
}
