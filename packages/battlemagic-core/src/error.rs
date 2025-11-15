//! Error handling for WASM boundary

use wasm_bindgen::prelude::*;
use std::fmt;

pub type Result<T> = std::result::Result<T, BattleMagicError>;

/// Main error type exposed to JavaScript
#[derive(Debug, Clone)]
pub enum BattleMagicError {
    Disassembly(String),
    DisassemblyError(String),
    SerializationError(String),
    BinaryParse(String),
    InvalidInput(String),
    Internal(String),
}

impl fmt::Display for BattleMagicError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            BattleMagicError::Disassembly(msg) => write!(f, "Disassembly error: {}", msg),
            BattleMagicError::DisassemblyError(msg) => write!(f, "Disassembly error: {}", msg),
            BattleMagicError::SerializationError(msg) => write!(f, "Serialization error: {}", msg),
            BattleMagicError::BinaryParse(msg) => write!(f, "Binary parsing error: {}", msg),
            BattleMagicError::InvalidInput(msg) => write!(f, "Invalid input: {}", msg),
            BattleMagicError::Internal(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

impl std::error::Error for BattleMagicError {}

// Convert to JsValue for WASM boundary
impl From<BattleMagicError> for JsValue {
    fn from(err: BattleMagicError) -> Self {
        JsValue::from_str(&err.to_string())
    }
}
