//! High-level analysis module for binary reverse engineering
//!
//! This module provides architecture-aware analysis capabilities:
//! - Function boundary detection and analysis
//! - Calling convention detection and argument tracking
//! - Stack frame analysis and local variable identification
//!
//! # Architecture
//!
//! The analysis module is designed to work with any architecture that
//! implements the `Architecture` trait from `crate::traits`. All algorithms
//! query architecture-specific information via trait methods, ensuring
//! portability across different instruction sets.
//!
//! # Example Usage
//!
//! ```rust,ignore
//! use battlemagic_analyzer::analysis::{FunctionDetector, StackAnalyzer};
//! use battlemagic_analyzer::arch::arm::ArmArchitecture;
//!
//! let arch = ArmArchitecture;
//! let detector = FunctionDetector::new(arch);
//!
//! // Detect all functions in the binary
//! let functions = detector.detect_functions(&instructions, &xrefs);
//!
//! // Analyze stack usage for each function
//! let stack_analyzer = StackAnalyzer::new();
//! for (addr, func) in &mut functions {
//!     let func_instrs = detector.get_function_instructions(func, &instructions);
//!     stack_analyzer.analyze_function(func, &func_instrs);
//! }
//! ```

pub mod calling_convention;
pub mod functions;
pub mod stack_analysis;
pub mod vector_table;

// Re-export primary types for convenience
pub use calling_convention::{ArmCallingConvention, CallingConvention, CallingConventionAnalyzer};
pub use functions::FunctionDetector;
pub use stack_analysis::StackAnalyzer;
pub use vector_table::VectorTableDetector;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::arch::arm::ArmArchitecture;

    #[test]
    fn test_module_integration() {
        // This test verifies all modules work together
        let _detector = FunctionDetector::new(&ArmArchitecture);
        let _analyzer = StackAnalyzer::new();
        let _calling_conv = ArmCallingConvention;

        // Basic smoke test - modules load and instantiate correctly
        assert!(true);
    }

    #[test]
    fn test_calling_convention_trait_object() {
        // Test that CallingConvention can be used as a trait object
        let cc: Box<dyn CallingConvention> = Box::new(ArmCallingConvention);
        assert_eq!(cc.arg_registers(), &["r0", "r1", "r2", "r3"]);
        assert_eq!(cc.return_register(), "r0");
    }
}
