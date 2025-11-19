/// Binary architecture detection module
///
/// This module provides high-performance architecture detection from binary firmware files.
/// It replaces the TypeScript implementation with optimized Rust code compiled to WASM.
///
/// Architecture-specific pattern matching has been moved to `crate::arch::{arm,mips,riscv}::binary_patterns`.

pub mod detector;
pub mod elf;
pub mod types;

pub use detector::{detect_architecture, ArchitectureDetector};
pub use types::{Architecture, DetectionResult, BinaryFormat};
