// GDB Remote Serial Protocol (RSP) Parser
//
// High-performance Rust implementation of GDB RSP parsers with WebAssembly bindings.
// This module provides zero-copy, optimized parsing of GDB protocol responses.
//
// Performance optimizations:
// - SIMD-accelerated hex decoding
// - Zero-copy parsing where possible
// - Minimal allocations
// - Stack-allocated buffers for common cases
//
// Architecture:
// - hex_decode: Low-level hex decoding utilities (SIMD optimized)
// - registers: ARM Cortex-M register parsing
// - memory: Memory read/write response parsing
// - stop_reply: Stop/signal response parsing
// - breakpoint: Breakpoint operation responses
// - monitor: Monitor command output parsing
// - error: Error response parsing
// - rsp: Main parser facade and WASM bindings

pub mod hex_decode;
pub mod registers;
pub mod memory;
pub mod stop_reply;
pub mod breakpoint;
pub mod monitor;
pub mod error;
pub mod rsp;
pub mod wasm_bindings;

// Re-export commonly used types
pub use hex_decode::{decode_hex, decode_hex_byte, decode_hex_u32_le};
pub use registers::{ArmCortexMRegisters, RegisterValue, parse_arm_cortex_m, parse_single_register};
pub use memory::{MemoryReadResult, MemoryWriteResult, parse_memory_read, parse_memory_write};
pub use stop_reply::{StopReply, StopReason, parse_stop_reply};
pub use breakpoint::{BreakpointResult, parse_breakpoint_response};
pub use monitor::{MonitorResponse, parse_monitor_output};
pub use error::{ErrorResponse, parse_error};
pub use rsp::{RspResponse, parse_rsp_response};

/// Common error type for parsing operations
#[derive(Debug, Clone, PartialEq)]
pub struct ParseError {
    pub message: String,
    pub raw: Option<String>,
}

impl ParseError {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            raw: None,
        }
    }

    pub fn with_raw(message: impl Into<String>, raw: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            raw: Some(raw.into()),
        }
    }
}

impl std::fmt::Display for ParseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if let Some(raw) = &self.raw {
            write!(f, "{} (raw: {})", self.message, raw)
        } else {
            write!(f, "{}", self.message)
        }
    }
}

impl std::error::Error for ParseError {}

/// Result type for parsing operations
pub type ParseResult<T> = Result<T, ParseError>;
