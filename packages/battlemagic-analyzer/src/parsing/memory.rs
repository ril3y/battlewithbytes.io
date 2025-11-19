// Memory Parser
//
// Parses GDB memory operation responses:
// - 'm' command: Read memory
// - 'M' command: Write memory
//
// Memory data is encoded as hex bytes in memory order (NOT little-endian).
// For example, reading address 0x20000000 might return "48656c6c6f" (ASCII "Hello").

use super::{ParseError, ParseResult};
use super::hex_decode::decode_hex_to_vec;
use serde::{Deserialize, Serialize};

/// Memory read result (from 'm' command)
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MemoryReadResult {
    /// Starting address that was read
    pub address: u32,
    /// Number of bytes read
    pub length: usize,
    /// Raw data bytes
    pub data: Vec<u8>,
    /// Hex string representation
    pub hex: String,
}

/// Memory write result (from 'M' command)
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MemoryWriteResult {
    /// Address written to
    pub address: u32,
    /// Number of bytes written
    pub length: usize,
    /// Write succeeded
    pub success: bool,
}

/// Parse memory read response from 'm' command
///
/// # Algorithm
/// 1. Validate hex string
/// 2. Decode hex pairs to bytes
/// 3. Return byte array with metadata
///
/// # Format
/// Command: m<addr>,<length>
/// Response: XXXXXXXX... (hex bytes in memory order, NOT little-endian)
///
/// # Performance
/// - Zero-copy validation
/// - Single pass hex decoding
/// - No intermediate allocations
///
/// # Arguments
/// * `hex_response` - Hex string from 'm' command response
/// * `address` - Address that was read (for metadata)
/// * `expected_length` - Length that was requested (for validation)
///
/// # Returns
/// Parsed memory data or error
///
/// # Example
/// ```
/// use battlemagic_analyzer::parsing::memory::parse_memory_read;
///
/// // Response: "48656c6c6f" (ASCII "Hello")
/// let result = parse_memory_read("48656c6c6f", 0x20000000, 5).unwrap();
/// assert_eq!(result.data, b"Hello");
/// assert_eq!(result.address, 0x20000000);
/// assert_eq!(result.length, 5);
/// ```
pub fn parse_memory_read(
    hex_response: &str,
    address: u32,
    expected_length: usize,
) -> ParseResult<MemoryReadResult> {
    let hex = hex_response.as_bytes();

    // Step 1: Validate
    if hex.is_empty() {
        return Err(ParseError::with_raw("Empty memory response", hex_response));
    }

    if hex.len() % 2 != 0 {
        return Err(ParseError::with_raw(
            "Odd number of hex digits",
            hex_response,
        ));
    }

    let actual_length = hex.len() / 2;

    // Warning if length mismatch, but not fatal
    // Some targets may return less data than requested
    if actual_length != expected_length {
        eprintln!(
            "Memory read length mismatch: requested {}, got {}",
            expected_length, actual_length
        );
    }

    // Step 2: Decode hex to bytes
    let data = decode_hex_to_vec(hex)?;

    // Step 3: Return result
    Ok(MemoryReadResult {
        address,
        length: actual_length,
        data,
        hex: hex_response.to_string(),
    })
}

/// Parse memory write confirmation from 'M' command
///
/// # Format
/// Command: M<addr>,<length>:<hex_data>
/// Response: OK (success) or Enn (error)
///
/// # Arguments
/// * `response` - Response packet ('OK' or 'Enn')
/// * `address` - Address written to
/// * `length` - Number of bytes written
///
/// # Returns
/// Write result
///
/// # Example
/// ```
/// use battlemagic_analyzer::parsing::memory::parse_memory_write;
///
/// let result = parse_memory_write("OK", 0x20000000, 5).unwrap();
/// assert!(result.success);
/// assert_eq!(result.address, 0x20000000);
/// ```
pub fn parse_memory_write(
    response: &str,
    address: u32,
    length: usize,
) -> ParseResult<MemoryWriteResult> {
    let success = response == "OK";

    Ok(MemoryWriteResult {
        address,
        length,
        success,
    })
}

/// Convert bytes to hex string for memory write
///
/// # Arguments
/// * `data` - Bytes to convert
///
/// # Returns
/// Hex string (raw memory order, not little-endian)
///
/// # Example
/// ```
/// use battlemagic_analyzer::parsing::memory::bytes_to_hex;
///
/// assert_eq!(bytes_to_hex(b"Hello"), "48656c6c6f");
/// ```
pub fn bytes_to_hex(data: &[u8]) -> String {
    data.iter()
        .map(|b| format!("{:02x}", b))
        .collect::<Vec<_>>()
        .join("")
}

/// Read 32-bit word from memory data (little-endian)
///
/// # Arguments
/// * `data` - Memory data
/// * `offset` - Byte offset
///
/// # Returns
/// 32-bit value or error if past end
///
/// # Example
/// ```
/// use battlemagic_analyzer::parsing::memory::read_word;
///
/// let data = vec![0x12, 0x34, 0x56, 0x78];
/// assert_eq!(read_word(&data, 0).unwrap(), 0x78563412);
/// ```
pub fn read_word(data: &[u8], offset: usize) -> ParseResult<u32> {
    if offset + 4 > data.len() {
        return Err(ParseError::new(format!(
            "Read past end of memory data: offset {} + 4 > length {}",
            offset,
            data.len()
        )));
    }

    Ok(u32::from_le_bytes([
        data[offset],
        data[offset + 1],
        data[offset + 2],
        data[offset + 3],
    ]))
}

/// Read 16-bit halfword from memory data (little-endian)
///
/// # Arguments
/// * `data` - Memory data
/// * `offset` - Byte offset
///
/// # Returns
/// 16-bit value or error if past end
pub fn read_halfword(data: &[u8], offset: usize) -> ParseResult<u16> {
    if offset + 2 > data.len() {
        return Err(ParseError::new(format!(
            "Read past end of memory data: offset {} + 2 > length {}",
            offset,
            data.len()
        )));
    }

    Ok(u16::from_le_bytes([data[offset], data[offset + 1]]))
}

/// Read byte from memory data
///
/// # Arguments
/// * `data` - Memory data
/// * `offset` - Byte offset
///
/// # Returns
/// Byte value or error if past end
pub fn read_byte(data: &[u8], offset: usize) -> ParseResult<u8> {
    if offset >= data.len() {
        return Err(ParseError::new(format!(
            "Read past end of memory data: offset {} >= length {}",
            offset,
            data.len()
        )));
    }

    Ok(data[offset])
}

/// Write 32-bit word to buffer (little-endian)
///
/// # Arguments
/// * `data` - Buffer to write to
/// * `offset` - Byte offset
/// * `value` - Value to write
///
/// # Returns
/// Ok(()) or error if past end
pub fn write_word(data: &mut [u8], offset: usize, value: u32) -> ParseResult<()> {
    if offset + 4 > data.len() {
        return Err(ParseError::new(format!(
            "Write past end of buffer: offset {} + 4 > length {}",
            offset,
            data.len()
        )));
    }

    let bytes = value.to_le_bytes();
    data[offset..offset + 4].copy_from_slice(&bytes);
    Ok(())
}

/// Write 16-bit halfword to buffer (little-endian)
pub fn write_halfword(data: &mut [u8], offset: usize, value: u16) -> ParseResult<()> {
    if offset + 2 > data.len() {
        return Err(ParseError::new(format!(
            "Write past end of buffer: offset {} + 2 > length {}",
            offset,
            data.len()
        )));
    }

    let bytes = value.to_le_bytes();
    data[offset..offset + 2].copy_from_slice(&bytes);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_memory_read() {
        // "Hello" in hex
        let result = parse_memory_read("48656c6c6f", 0x20000000, 5).unwrap();
        assert_eq!(result.data, b"Hello");
        assert_eq!(result.address, 0x20000000);
        assert_eq!(result.length, 5);
        assert_eq!(result.hex, "48656c6c6f");
    }

    #[test]
    fn test_parse_memory_read_empty() {
        assert!(parse_memory_read("", 0, 0).is_err());
    }

    #[test]
    fn test_parse_memory_read_odd_length() {
        assert!(parse_memory_read("123", 0, 1).is_err());
    }

    #[test]
    fn test_parse_memory_write() {
        let result = parse_memory_write("OK", 0x20000000, 5).unwrap();
        assert!(result.success);
        assert_eq!(result.address, 0x20000000);
        assert_eq!(result.length, 5);

        let result = parse_memory_write("E01", 0x20000000, 5).unwrap();
        assert!(!result.success);
    }

    #[test]
    fn test_bytes_to_hex() {
        assert_eq!(bytes_to_hex(b"Hello"), "48656c6c6f");
        assert_eq!(bytes_to_hex(&[0x00, 0xFF, 0xAB]), "00ffab");
    }

    #[test]
    fn test_read_word() {
        let data = vec![0x12, 0x34, 0x56, 0x78];
        assert_eq!(read_word(&data, 0).unwrap(), 0x78563412);

        assert!(read_word(&data, 1).is_err()); // Would read past end
    }

    #[test]
    fn test_read_halfword() {
        let data = vec![0x12, 0x34, 0x56, 0x78];
        assert_eq!(read_halfword(&data, 0).unwrap(), 0x3412);
        assert_eq!(read_halfword(&data, 2).unwrap(), 0x7856);

        assert!(read_halfword(&data, 3).is_err()); // Would read past end
    }

    #[test]
    fn test_write_word() {
        let mut data = vec![0u8; 4];
        write_word(&mut data, 0, 0x12345678).unwrap();
        assert_eq!(data, vec![0x78, 0x56, 0x34, 0x12]);
    }

    #[test]
    fn test_write_halfword() {
        let mut data = vec![0u8; 2];
        write_halfword(&mut data, 0, 0x1234).unwrap();
        assert_eq!(data, vec![0x34, 0x12]);
    }
}
