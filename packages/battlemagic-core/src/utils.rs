//! Utility functions for WASM

use wasm_bindgen::prelude::*;
use web_sys::console;

/// Log to browser console
pub fn log(msg: &str) {
    console::log_1(&JsValue::from_str(msg));
}

/// Warning to browser console
#[allow(dead_code)]
pub fn warn(msg: &str) {
    console::warn_1(&JsValue::from_str(msg));
}

/// Error to browser console
#[allow(dead_code)]
pub fn error(msg: &str) {
    console::error_1(&JsValue::from_str(msg));
}
