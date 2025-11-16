//! Control Flow Graph (CFG) Analysis Module
//!
//! This module provides architecture-independent control flow analysis for binary code.
//! It includes algorithms for:
//! - Basic block identification
//! - Dominator tree computation
//! - Loop detection and classification
//!
//! All algorithms are generic over the `Architecture` trait, making them suitable
//! for any instruction set architecture.
//!
//! # Example
//! ```rust
//! use battlemagic_analyzer::cfg::{BasicBlockAnalyzer, LoopDetector};
//! use battlemagic_analyzer::traits::{Architecture, Instruction};
//!
//! fn analyze_loops<A: Architecture>(arch: &A, instructions: &[Instruction]) {
//!     // Build basic blocks
//!     let bb_analyzer = BasicBlockAnalyzer::new(arch);
//!     let basic_blocks = bb_analyzer.analyze(instructions);
//!
//!     // Detect loops
//!     let loop_detector = LoopDetector::new();
//!     let loops = loop_detector.detect_loops(&basic_blocks);
//!
//!     println!("Found {} loops", loops.len());
//! }
//! ```

pub mod basic_blocks;
pub mod dominators;
pub mod loops;

// Re-export key types for convenience
pub use basic_blocks::{BasicBlock, BasicBlockAnalyzer, ControlFlowGraph};
pub use dominators::{DominatorTree, DominatorAnalyzer};
pub use loops::{LoopDetector, LoopClassifier};
