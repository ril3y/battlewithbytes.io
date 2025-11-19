//! Architecture-specific implementations
//!
//! This module contains architecture-specific code organized by ISA.
//!
//! Supported architectures:
//! - ARM/Thumb (fully implemented)
//! - MIPS (skeleton/proof of concept)
//! - RISC-V (pattern matching only)

pub mod common;
pub mod arm;
pub mod mips;
pub mod riscv;
