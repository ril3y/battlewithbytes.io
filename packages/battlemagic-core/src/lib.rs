//! BattleMagic Core - WebAssembly-powered firmware analysis engine
//!
//! This crate provides high-performance binary analysis, disassembly, and
//! debugging capabilities for embedded ARM systems.

use wasm_bindgen::prelude::*;

// Module declarations
mod disasm;
mod error;
mod utils;

// Re-exports
pub use error::{BattleMagicError, Result};

/// Initialize the WASM module
/// Sets up panic hooks and logging
#[wasm_bindgen(start)]
pub fn initialize() {
    console_error_panic_hook::set_once();
    utils::log("BattleMagic WASM core initialized");
}

/// Get version information
#[wasm_bindgen]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Module feature information
#[wasm_bindgen]
pub struct ModuleInfo {
    version: String,
}

#[wasm_bindgen]
impl ModuleInfo {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            version: env!("CARGO_PKG_VERSION").to_string(),
        }
    }

    #[wasm_bindgen(getter)]
    pub fn version(&self) -> String {
        self.version.clone()
    }
}

impl Default for ModuleInfo {
    fn default() -> Self {
        Self::new()
    }
}
