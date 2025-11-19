// Main RSP Parser Facade
//
// High-level RSP response parser with auto-detection and WASM bindings.
// Provides a unified interface for parsing all RSP response types.

use super::ParseResult;
use super::error::{parse_error, ErrorResponse};
use super::monitor::{parse_monitor_output, MonitorResponse};
use super::stop_reply::{parse_stop_reply, StopReply};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// RSP response type
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum RspResponse {
    /// OK response (success with no data)
    Ok,
    /// Error response
    Error(ErrorResponse),
    /// Raw data response (hex string or other data)
    Data(String),
    /// Stop reply (T or S packet)
    Stop(StopReply),
    /// Monitor output (O packet)
    Monitor(MonitorResponse),
    /// Empty response
    Empty,
}

/// Auto-detect response type and parse accordingly
///
/// # Arguments
/// * `response` - Raw response string (packet data without $ and #checksum)
///
/// # Returns
/// Parsed response with type information
///
/// # Example
/// ```
/// use battlemagic_analyzer::parsing::rsp::parse_rsp_response;
///
/// let result = parse_rsp_response("OK").unwrap();
/// // Returns RspResponse::Ok
///
/// let result = parse_rsp_response("E02").unwrap();
/// // Returns RspResponse::Error(...)
/// ```
pub fn parse_rsp_response(response: &str) -> ParseResult<RspResponse> {
    // Empty response
    if response.is_empty() {
        return Ok(RspResponse::Empty);
    }

    // OK response
    if response == "OK" {
        return Ok(RspResponse::Ok);
    }

    // Error response
    if response.starts_with('E') {
        match parse_error(response) {
            Ok(err) => return Ok(RspResponse::Error(err)),
            Err(_) => {
                // Not a valid error packet, fall through to data
            }
        }
    }

    // Stop reply
    if response.starts_with('S') || response.starts_with('T') {
        match parse_stop_reply(response) {
            Ok(stop) => return Ok(RspResponse::Stop(stop)),
            Err(_) => {
                // Not a valid stop packet, fall through to data
            }
        }
    }

    // Monitor output
    if response.starts_with('O') {
        match parse_monitor_output(response) {
            Ok(monitor) => return Ok(RspResponse::Monitor(monitor)),
            Err(_) => {
                // Not a valid monitor packet, fall through to data
            }
        }
    }

    // Data response (default)
    Ok(RspResponse::Data(response.to_string()))
}

/// Check if response indicates success
///
/// # Arguments
/// * `response` - Raw response string
///
/// # Returns
/// True if success (OK or valid data)
pub fn is_success(response: &str) -> bool {
    if response == "OK" {
        return true;
    }

    if response.starts_with('E') || response.is_empty() {
        return false;
    }

    true
}

/// Check if response indicates error
///
/// # Arguments
/// * `response` - Raw response string
///
/// # Returns
/// True if error
pub fn is_error(response: &str) -> bool {
    response.starts_with('E') || response.is_empty()
}

// ============================================================================
// WASM BINDINGS
// ============================================================================

/// WASM-compatible RSP parser result
#[wasm_bindgen]
pub struct WasmRspParseResult {
    success: bool,
    response_type: String,
    data_json: String,
    error: Option<String>,
}

#[wasm_bindgen]
impl WasmRspParseResult {
    #[wasm_bindgen(getter)]
    pub fn success(&self) -> bool {
        self.success
    }

    #[wasm_bindgen(getter)]
    pub fn response_type(&self) -> String {
        self.response_type.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn data_json(&self) -> String {
        self.data_json.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn error(&self) -> Option<String> {
        self.error.clone()
    }
}

/// Parse RSP response (WASM binding)
///
/// # Arguments
/// * `response` - Raw response string
///
/// # Returns
/// WASM-compatible parse result with JSON-serialized data
#[wasm_bindgen(js_name = parseRspResponse)]
pub fn wasm_parse_rsp_response(response: &str) -> WasmRspParseResult {
    match parse_rsp_response(response) {
        Ok(rsp) => {
            let response_type = match &rsp {
                RspResponse::Ok => "ok",
                RspResponse::Error(_) => "error",
                RspResponse::Data(_) => "data",
                RspResponse::Stop(_) => "stop",
                RspResponse::Monitor(_) => "monitor",
                RspResponse::Empty => "empty",
            };

            let data_json = serde_json::to_string(&rsp).unwrap_or_else(|e| {
                format!("{{\"error\": \"Serialization failed: {}\"}}", e)
            });

            WasmRspParseResult {
                success: true,
                response_type: response_type.to_string(),
                data_json,
                error: None,
            }
        }
        Err(e) => WasmRspParseResult {
            success: false,
            response_type: "error".to_string(),
            data_json: "{}".to_string(),
            error: Some(e.to_string()),
        },
    }
}

/// Check if response is successful (WASM binding)
#[wasm_bindgen(js_name = isSuccess)]
pub fn wasm_is_success(response: &str) -> bool {
    is_success(response)
}

/// Check if response is error (WASM binding)
#[wasm_bindgen(js_name = isError)]
pub fn wasm_is_error(response: &str) -> bool {
    is_error(response)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_ok() {
        let result = parse_rsp_response("OK").unwrap();
        assert_eq!(result, RspResponse::Ok);
    }

    #[test]
    fn test_parse_empty() {
        let result = parse_rsp_response("").unwrap();
        assert_eq!(result, RspResponse::Empty);
    }

    #[test]
    fn test_parse_error() {
        let result = parse_rsp_response("E02").unwrap();
        match result {
            RspResponse::Error(e) => {
                assert_eq!(e.code_num, 2);
            }
            _ => panic!("Expected Error variant"),
        }
    }

    #[test]
    fn test_parse_stop() {
        let result = parse_rsp_response("S05").unwrap();
        match result {
            RspResponse::Stop(_) => {}
            _ => panic!("Expected Stop variant"),
        }
    }

    #[test]
    fn test_parse_monitor() {
        let result = parse_rsp_response("O48656c6c6f").unwrap();
        match result {
            RspResponse::Monitor(m) => {
                assert_eq!(m.output, "Hello");
            }
            _ => panic!("Expected Monitor variant"),
        }
    }

    #[test]
    fn test_parse_data() {
        let result = parse_rsp_response("00112233").unwrap();
        match result {
            RspResponse::Data(d) => {
                assert_eq!(d, "00112233");
            }
            _ => panic!("Expected Data variant"),
        }
    }

    #[test]
    fn test_is_success() {
        assert!(is_success("OK"));
        assert!(is_success("00112233"));
        assert!(!is_success("E02"));
        assert!(!is_success(""));
    }

    #[test]
    fn test_is_error() {
        assert!(is_error("E02"));
        assert!(is_error(""));
        assert!(!is_error("OK"));
        assert!(!is_error("00112233"));
    }
}
