# Implementation Guide
## Step-by-Step Refactoring Instructions

This guide provides concrete implementation steps for the refactoring plan.

---

## Phase 1: Foundation (Week 1)

### Step 1.1: Create `src/traits.rs`

**File:** `X:\battlewithbytes.io\packages\battlemagic-analyzer\src\traits.rs`

```rust
//! Architecture trait and related types for multi-architecture support

use crate::types::XrefType;
use serde::{Deserialize, Serialize};

/// Core trait that all instruction set architectures must implement
///
/// This trait defines the contract for architecture-specific analysis.
/// Implementations should be stateless and thread-safe.
pub trait Architecture: Send + Sync {
    /// Get the architecture name
    ///
    /// # Example
    /// ```
    /// use battlemagic_analyzer::arch::arm::ArmArchitecture;
    /// use battlemagic_analyzer::traits::Architecture;
    ///
    /// let arch = ArmArchitecture::new();
    /// assert_eq!(arch.name(), "ARM");
    /// ```
    fn name(&self) -> &'static str;

    /// Get the instruction alignment in bytes
    ///
    /// Returns the natural alignment for instructions in this architecture:
    /// - ARM: 4 bytes
    /// - Thumb: 2 bytes
    /// - MIPS: 4 bytes
    /// - x86: 1 byte (variable length)
    fn instruction_alignment(&self) -> usize;

    /// Decode raw instruction bytes (optional)
    ///
    /// This method is optional and returns None by default.
    /// Implement this if you want to decode raw bytes directly.
    ///
    /// # Arguments
    /// * `bytes` - Raw instruction bytes
    /// * `address` - Address of the instruction
    ///
    /// # Returns
    /// Decoded instruction if successful, None otherwise
    fn decode(&self, _bytes: &[u8], _address: u32) -> Option<DecodedInstruction> {
        None
    }

    /// Extract cross-references from an instruction
    ///
    /// This is the primary method for architecture-specific analysis.
    /// Analyze the instruction and return all cross-references it contains.
    ///
    /// # Arguments
    /// * `instr` - The decoded instruction to analyze
    ///
    /// # Returns
    /// Vector of cross-reference information
    ///
    /// # Example
    /// ```
    /// // ARM: bl #0x1000
    /// // Returns: XrefInfo { target: 0x1000, xref_type: Call, is_direct: true }
    /// ```
    fn extract_xrefs(&self, instr: &DecodedInstruction) -> Vec<XrefInfo>;

    /// Detect if instruction is a function prologue
    ///
    /// Used for automatic function boundary detection.
    ///
    /// # Example ARM
    /// - `push {r4-r7, lr}`
    /// - `stmfd sp!, {..., lr}`
    fn is_function_start(&self, instr: &DecodedInstruction) -> bool;

    /// Detect if instruction is a function epilogue
    ///
    /// Used for automatic function boundary detection.
    ///
    /// # Example ARM
    /// - `pop {r4-r7, pc}`
    /// - `bx lr`
    fn is_function_end(&self, instr: &DecodedInstruction) -> bool;

    /// Detect if instruction terminates a basic block
    ///
    /// Used for control flow graph construction.
    ///
    /// # Returns
    /// true if this instruction ends a basic block (branch, call, return)
    fn is_block_terminator(&self, instr: &DecodedInstruction) -> bool;

    /// Calculate the effective PC value for this instruction
    ///
    /// Different architectures have different PC semantics:
    /// - ARM: PC = addr + 8 (pipeline effect)
    /// - Thumb: PC = addr + 4
    /// - MIPS: PC = addr + 4
    /// - x86: PC = addr + instruction_length
    ///
    /// # Arguments
    /// * `address` - Current instruction address
    /// * `instr_len` - Instruction length in bytes
    fn effective_pc(&self, address: u32, instr_len: usize) -> u32;
}

/// Information about a cross-reference extracted from an instruction
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct XrefInfo {
    /// Target address being referenced
    pub target: u32,

    /// Type of cross-reference
    pub xref_type: XrefType,

    /// Whether this is a direct reference (immediate) or indirect (register)
    pub is_direct: bool,
}

impl XrefInfo {
    pub fn new(target: u32, xref_type: XrefType, is_direct: bool) -> Self {
        Self {
            target,
            xref_type,
            is_direct,
        }
    }
}

/// Decoded instruction with architecture-specific metadata
#[derive(Debug, Clone)]
pub struct DecodedInstruction {
    /// Address of the instruction
    pub address: u32,

    /// Raw bytes of the instruction
    pub bytes: Vec<u8>,

    /// Mnemonic (e.g., "bl", "jalr", "call")
    pub mnemonic: String,

    /// Disassembled operands
    pub operands: String,

    /// Architecture-specific metadata
    pub metadata: InstructionMetadata,
}

impl DecodedInstruction {
    /// Create a new decoded instruction
    pub fn new(address: u32, bytes: Vec<u8>, mnemonic: String, operands: String) -> Self {
        Self {
            address,
            bytes,
            mnemonic,
            operands,
            metadata: InstructionMetadata::default(),
        }
    }

    /// Create with metadata
    pub fn with_metadata(
        address: u32,
        bytes: Vec<u8>,
        mnemonic: String,
        operands: String,
        metadata: InstructionMetadata,
    ) -> Self {
        Self {
            address,
            bytes,
            mnemonic,
            operands,
            metadata,
        }
    }
}

/// Architecture-specific instruction metadata
///
/// This metadata enables advanced analysis without requiring
/// architectures to implement complex decoding.
#[derive(Debug, Clone, Default)]
pub struct InstructionMetadata {
    /// Is this a conditional instruction?
    pub is_conditional: bool,

    /// Does this instruction modify the link register?
    pub modifies_lr: bool,

    /// Does this instruction access memory?
    pub accesses_memory: bool,

    /// Instruction category for high-level analysis
    pub category: InstructionCategory,
}

/// High-level instruction categories
///
/// Used for control flow analysis and pattern matching.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum InstructionCategory {
    /// Default/unknown category
    #[default]
    Other,

    /// Branch (unconditional or conditional)
    Branch,

    /// Function call
    Call,

    /// Return from function
    Return,

    /// Load from memory
    Load,

    /// Store to memory
    Store,

    /// Arithmetic operation
    Arithmetic,

    /// Logical operation
    Logic,

    /// System instruction
    System,
}

#[cfg(test)]
mod tests {
    use super::*;

    // Mock architecture for testing
    struct MockArch;

    impl Architecture for MockArch {
        fn name(&self) -> &'static str {
            "Mock"
        }

        fn instruction_alignment(&self) -> usize {
            4
        }

        fn extract_xrefs(&self, _instr: &DecodedInstruction) -> Vec<XrefInfo> {
            vec![]
        }

        fn is_function_start(&self, _instr: &DecodedInstruction) -> bool {
            false
        }

        fn is_function_end(&self, _instr: &DecodedInstruction) -> bool {
            false
        }

        fn is_block_terminator(&self, _instr: &DecodedInstruction) -> bool {
            false
        }

        fn effective_pc(&self, address: u32, instr_len: usize) -> u32 {
            address + instr_len as u32
        }
    }

    #[test]
    fn test_mock_architecture() {
        let arch = MockArch;
        assert_eq!(arch.name(), "Mock");
        assert_eq!(arch.instruction_alignment(), 4);
        assert_eq!(arch.effective_pc(0x1000, 4), 0x1004);
    }

    #[test]
    fn test_xref_info_creation() {
        let xref = XrefInfo::new(0x1000, XrefType::Call, true);
        assert_eq!(xref.target, 0x1000);
        assert_eq!(xref.xref_type, XrefType::Call);
        assert!(xref.is_direct);
    }

    #[test]
    fn test_decoded_instruction_creation() {
        let instr = DecodedInstruction::new(
            0x1000,
            vec![0, 0, 0, 0],
            "bl".to_string(),
            "#0x2000".to_string(),
        );

        assert_eq!(instr.address, 0x1000);
        assert_eq!(instr.mnemonic, "bl");
        assert_eq!(instr.operands, "#0x2000");
    }
}
```

**Action Items:**
1. Create the file
2. Run `cargo test` to verify compilation
3. Commit: "feat: add Architecture trait for multi-arch support"

### Step 1.2: Refactor `src/xref.rs` → `XrefDatabase`

**Changes:**
1. Rename struct: `XrefBuilder` → `XrefDatabase`
2. Remove all parsing methods
3. Keep only data structure operations
4. Change API: `build_from_instructions()` → `add_xref()` + `build_indices()`

**Modified File:** `X:\battlewithbytes.io\packages\battlemagic-analyzer\src\xref.rs`

```rust
//! Generic cross-reference database
//!
//! This module provides a pure data structure for storing and querying
//! cross-references. It is architecture-agnostic - all architecture-specific
//! logic has been moved to the Architecture trait implementations.

use crate::types::{CrossReference, XrefType};
use std::collections::HashMap;

/// Cross-reference database for efficient xref lookups
///
/// This is a pure data structure with no architecture-specific logic.
/// All parsing and xref extraction is handled by Architecture implementations.
///
/// # Performance
/// - Adding xrefs: O(1)
/// - Building indices: O(N)
/// - Querying xrefs: O(1) average case
pub struct XrefDatabase {
    /// All cross-references stored in insertion order
    xrefs: Vec<CrossReference>,

    /// Index for lookups by target address: target_addr -> xref_indices
    to_index: HashMap<u32, Vec<usize>>,

    /// Index for lookups by source address: source_addr -> xref_indices
    from_index: HashMap<u32, Vec<usize>>,

    /// Whether indices have been built
    indices_built: bool,
}

impl XrefDatabase {
    /// Create a new empty xref database
    pub fn new() -> Self {
        Self {
            xrefs: Vec::new(),
            to_index: HashMap::new(),
            from_index: HashMap::new(),
            indices_built: false,
        }
    }

    /// Create with pre-allocated capacity
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            xrefs: Vec::with_capacity(capacity),
            to_index: HashMap::new(),
            from_index: HashMap::new(),
            indices_built: false,
        }
    }

    /// Add a cross-reference to the database
    ///
    /// Note: Indices are not automatically updated. Call `build_indices()`
    /// after adding all xrefs to enable fast lookups.
    ///
    /// # Arguments
    /// * `from_addr` - Source address
    /// * `to_addr` - Target address
    /// * `xref_type` - Type of cross-reference
    /// * `instruction` - Instruction mnemonic
    /// * `operands` - Instruction operands
    pub fn add_xref(
        &mut self,
        from_addr: u32,
        to_addr: u32,
        xref_type: XrefType,
        instruction: &str,
        operands: &str,
    ) {
        let xref = CrossReference::new(
            from_addr,
            to_addr,
            xref_type,
            instruction.to_string(),
            operands.to_string(),
        );
        self.xrefs.push(xref);
        self.indices_built = false; // Invalidate indices
    }

    /// Build indices for fast lookups
    ///
    /// This must be called after adding all xrefs and before querying.
    /// Rebuilds both to_index and from_index HashMaps.
    ///
    /// # Performance
    /// O(N) where N is the number of xrefs
    pub fn build_indices(&mut self) {
        self.to_index.clear();
        self.from_index.clear();

        for (idx, xref) in self.xrefs.iter().enumerate() {
            // Index by target address
            self.to_index
                .entry(xref.to_addr)
                .or_insert_with(Vec::new)
                .push(idx);

            // Index by source address
            self.from_index
                .entry(xref.from_addr)
                .or_insert_with(Vec::new)
                .push(idx);
        }

        self.indices_built = true;
    }

    /// Get all cross-references targeting a specific address
    ///
    /// # Arguments
    /// * `address` - Target address to query
    ///
    /// # Returns
    /// Vector of all xrefs pointing to this address
    ///
    /// # Performance
    /// O(1) average case (HashMap lookup + clone)
    pub fn get_xrefs_to(&self, address: u32) -> Vec<CrossReference> {
        if let Some(indices) = self.to_index.get(&address) {
            indices.iter().map(|&i| self.xrefs[i].clone()).collect()
        } else {
            Vec::new()
        }
    }

    /// Get all cross-references originating from a specific address
    ///
    /// # Arguments
    /// * `address` - Source address to query
    ///
    /// # Returns
    /// Vector of all xrefs originating from this address
    ///
    /// # Performance
    /// O(1) average case (HashMap lookup + clone)
    pub fn get_xrefs_from(&self, address: u32) -> Vec<CrossReference> {
        if let Some(indices) = self.from_index.get(&address) {
            indices.iter().map(|&i| self.xrefs[i].clone()).collect()
        } else {
            Vec::new()
        }
    }

    /// Get all cross-references in the database
    ///
    /// # Returns
    /// Reference to the internal xref vector
    pub fn get_all_xrefs(&self) -> &Vec<CrossReference> {
        &self.xrefs
    }

    /// Get the total number of cross-references
    pub fn count(&self) -> usize {
        self.xrefs.len()
    }

    /// Check if indices have been built
    pub fn has_indices(&self) -> bool {
        self.indices_built
    }

    /// Clear all xrefs and indices
    pub fn clear(&mut self) {
        self.xrefs.clear();
        self.to_index.clear();
        self.from_index.clear();
        self.indices_built = false;
    }
}

impl Default for XrefDatabase {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_database_creation() {
        let db = XrefDatabase::new();
        assert_eq!(db.count(), 0);
        assert!(!db.has_indices());
    }

    #[test]
    fn test_add_xref() {
        let mut db = XrefDatabase::new();
        db.add_xref(0x1000, 0x2000, XrefType::Call, "bl", "#0x2000");

        assert_eq!(db.count(), 1);
        assert!(!db.has_indices()); // Not built yet
    }

    #[test]
    fn test_build_indices() {
        let mut db = XrefDatabase::new();
        db.add_xref(0x1000, 0x2000, XrefType::Call, "bl", "#0x2000");
        db.add_xref(0x1004, 0x2000, XrefType::Call, "bl", "#0x2000");

        db.build_indices();
        assert!(db.has_indices());

        // Test xrefs_to
        let xrefs_to = db.get_xrefs_to(0x2000);
        assert_eq!(xrefs_to.len(), 2);

        // Test xrefs_from
        let xrefs_from = db.get_xrefs_from(0x1000);
        assert_eq!(xrefs_from.len(), 1);
        assert_eq!(xrefs_from[0].to_addr, 0x2000);
    }

    #[test]
    fn test_query_nonexistent() {
        let mut db = XrefDatabase::new();
        db.add_xref(0x1000, 0x2000, XrefType::Call, "bl", "#0x2000");
        db.build_indices();

        let xrefs = db.get_xrefs_to(0x9999);
        assert_eq!(xrefs.len(), 0);
    }

    #[test]
    fn test_clear() {
        let mut db = XrefDatabase::new();
        db.add_xref(0x1000, 0x2000, XrefType::Call, "bl", "#0x2000");
        db.build_indices();

        db.clear();
        assert_eq!(db.count(), 0);
        assert!(!db.has_indices());
    }

    #[test]
    fn test_multiple_xrefs_same_target() {
        let mut db = XrefDatabase::new();
        db.add_xref(0x1000, 0x2000, XrefType::Call, "bl", "#0x2000");
        db.add_xref(0x1004, 0x2000, XrefType::Call, "bl", "#0x2000");
        db.add_xref(0x1008, 0x2000, XrefType::Branch, "b", "#0x2000");

        db.build_indices();

        let xrefs_to = db.get_xrefs_to(0x2000);
        assert_eq!(xrefs_to.len(), 3);

        // Count by type
        let calls = xrefs_to.iter().filter(|x| x.xref_type == XrefType::Call).count();
        let branches = xrefs_to.iter().filter(|x| x.xref_type == XrefType::Branch).count();

        assert_eq!(calls, 2);
        assert_eq!(branches, 1);
    }
}
```

**Action Items:**
1. Update xref.rs
2. Run `cargo test` - tests should still pass
3. Commit: "refactor: convert XrefBuilder to generic XrefDatabase"

### Step 1.3: Create `src/analyzer.rs`

**New File:** `X:\battlewithbytes.io\packages\battlemagic-analyzer\src\analyzer.rs`

```rust
//! Generic binary analyzer parameterized by architecture

use crate::traits::{Architecture, DecodedInstruction};
use crate::types::{AnalysisResults, CrossReference, Instruction};
use crate::xref::XrefDatabase;
use std::time::Instant;

/// Generic binary analyzer supporting multiple architectures
///
/// This analyzer is parameterized by an Architecture implementation,
/// allowing it to analyze binaries from different instruction sets
/// using the same core logic.
///
/// # Type Parameters
/// * `A` - The architecture type implementing the Architecture trait
///
/// # Example
/// ```
/// use battlemagic_analyzer::analyzer::BinaryAnalyzer;
/// use battlemagic_analyzer::arch::arm::ArmArchitecture;
///
/// let analyzer = BinaryAnalyzer::new(ArmArchitecture::new(), 0x8000);
/// // Use analyzer...
/// ```
pub struct BinaryAnalyzer<A: Architecture> {
    /// Architecture-specific decoder and analyzer
    arch: A,

    /// Cross-reference database
    xref_db: XrefDatabase,

    /// Base address of the binary
    base_address: u32,

    /// Analysis state flag
    is_analyzed: bool,
}

impl<A: Architecture> BinaryAnalyzer<A> {
    /// Create a new analyzer with the given architecture
    ///
    /// # Arguments
    /// * `arch` - Architecture implementation
    /// * `base_address` - Base address where the binary is loaded
    pub fn new(arch: A, base_address: u32) -> Self {
        Self {
            arch,
            xref_db: XrefDatabase::new(),
            base_address,
            is_analyzed: false,
        }
    }

    /// Analyze binary from pre-disassembled instructions
    ///
    /// This is the main entry point for analysis. It accepts instructions
    /// that have already been disassembled (e.g., by Capstone in JavaScript)
    /// and performs cross-reference extraction using the architecture-specific
    /// implementation.
    ///
    /// # Arguments
    /// * `instructions` - Vector of disassembled instructions
    ///
    /// # Returns
    /// Complete analysis results including xrefs and statistics
    pub fn analyze_from_disasm(&mut self, instructions: &[Instruction]) -> AnalysisResults {
        let start_time = Instant::now();

        // Clear previous analysis
        self.xref_db.clear();

        // Pre-allocate capacity
        self.xref_db = XrefDatabase::with_capacity(instructions.len());

        // Convert to decoded instructions and extract xrefs
        for instr in instructions {
            // Convert generic Instruction to DecodedInstruction
            let decoded = self.decode_instruction(instr);

            // Ask architecture to extract xrefs
            let xref_infos = self.arch.extract_xrefs(&decoded);

            // Add to database
            for xref_info in xref_infos {
                self.xref_db.add_xref(
                    decoded.address,
                    xref_info.target,
                    xref_info.xref_type,
                    &decoded.mnemonic,
                    &decoded.operands,
                );
            }
        }

        // Build indices for fast queries
        self.xref_db.build_indices();

        self.is_analyzed = true;

        let elapsed = start_time.elapsed();

        // Create results
        AnalysisResults::new(
            self.xref_db.get_all_xrefs().clone(),
            instructions.len(),
            elapsed.as_millis() as u64,
            instructions.first().map(|i| i.address).unwrap_or(self.base_address),
            instructions.last().map(|i| i.address).unwrap_or(self.base_address),
        )
    }

    /// Convert generic Instruction to architecture-aware DecodedInstruction
    fn decode_instruction(&self, instr: &Instruction) -> DecodedInstruction {
        // For now, create a basic decoded instruction
        // In the future, architectures can enhance this with metadata
        DecodedInstruction::new(
            instr.address,
            instr.bytes.clone(),
            instr.mnemonic.clone(),
            instr.operands.clone(),
        )
    }

    /// Get cross-references targeting a specific address
    ///
    /// # Arguments
    /// * `address` - Target address to query
    ///
    /// # Returns
    /// Vector of all xrefs pointing to this address
    pub fn get_xrefs_to(&self, address: u32) -> Vec<CrossReference> {
        self.xref_db.get_xrefs_to(address)
    }

    /// Get cross-references originating from a specific address
    ///
    /// # Arguments
    /// * `address` - Source address to query
    ///
    /// # Returns
    /// Vector of all xrefs originating from this address
    pub fn get_xrefs_from(&self, address: u32) -> Vec<CrossReference> {
        self.xref_db.get_xrefs_from(address)
    }

    /// Get total number of cross-references
    pub fn xref_count(&self) -> usize {
        self.xref_db.count()
    }

    /// Check if binary has been analyzed
    pub fn is_analyzed(&self) -> bool {
        self.is_analyzed
    }

    /// Get architecture name
    pub fn architecture(&self) -> &'static str {
        self.arch.name()
    }

    /// Reset analyzer state
    pub fn reset(&mut self) {
        self.xref_db.clear();
        self.is_analyzed = false;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::traits::{XrefInfo};
    use crate::types::XrefType;

    // Mock architecture for testing
    struct TestArch;

    impl Architecture for TestArch {
        fn name(&self) -> &'static str { "Test" }
        fn instruction_alignment(&self) -> usize { 4 }

        fn extract_xrefs(&self, instr: &DecodedInstruction) -> Vec<XrefInfo> {
            // Simple test: if mnemonic is "call", extract target from operands
            if instr.mnemonic == "call" {
                if let Some(addr_str) = instr.operands.strip_prefix("#0x") {
                    if let Ok(addr) = u32::from_str_radix(addr_str, 16) {
                        return vec![XrefInfo::new(addr, XrefType::Call, true)];
                    }
                }
            }
            vec![]
        }

        fn is_function_start(&self, _: &DecodedInstruction) -> bool { false }
        fn is_function_end(&self, _: &DecodedInstruction) -> bool { false }
        fn is_block_terminator(&self, _: &DecodedInstruction) -> bool { false }
        fn effective_pc(&self, address: u32, len: usize) -> u32 { address + len as u32 }
    }

    #[test]
    fn test_analyzer_creation() {
        let analyzer = BinaryAnalyzer::new(TestArch, 0x8000);
        assert_eq!(analyzer.architecture(), "Test");
        assert_eq!(analyzer.base_address, 0x8000);
        assert!(!analyzer.is_analyzed());
    }

    #[test]
    fn test_analysis() {
        let mut analyzer = BinaryAnalyzer::new(TestArch, 0x8000);

        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "call".to_string(), "#0x2000".to_string()),
            Instruction::new(0x1004, vec![0, 0, 0, 0], "nop".to_string(), "".to_string()),
        ];

        let results = analyzer.analyze_from_disasm(&instructions);

        assert_eq!(results.total_instructions, 2);
        assert_eq!(results.xrefs.len(), 1);
        assert_eq!(results.xrefs[0].to_addr, 0x2000);
        assert!(analyzer.is_analyzed());
    }

    #[test]
    fn test_xref_queries() {
        let mut analyzer = BinaryAnalyzer::new(TestArch, 0x8000);

        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "call".to_string(), "#0x2000".to_string()),
            Instruction::new(0x1004, vec![0, 0, 0, 0], "call".to_string(), "#0x2000".to_string()),
        ];

        analyzer.analyze_from_disasm(&instructions);

        // Query xrefs to 0x2000
        let xrefs_to = analyzer.get_xrefs_to(0x2000);
        assert_eq!(xrefs_to.len(), 2);

        // Query xrefs from 0x1000
        let xrefs_from = analyzer.get_xrefs_from(0x1000);
        assert_eq!(xrefs_from.len(), 1);
        assert_eq!(xrefs_from[0].to_addr, 0x2000);
    }

    #[test]
    fn test_reset() {
        let mut analyzer = BinaryAnalyzer::new(TestArch, 0x8000);

        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "call".to_string(), "#0x2000".to_string()),
        ];

        analyzer.analyze_from_disasm(&instructions);
        assert!(analyzer.is_analyzed());
        assert_eq!(analyzer.xref_count(), 1);

        analyzer.reset();
        assert!(!analyzer.is_analyzed());
        assert_eq!(analyzer.xref_count(), 0);
    }
}
```

**Action Items:**
1. Create analyzer.rs
2. Update lib.rs to include: `pub mod analyzer;`
3. Run `cargo test` - verify all tests pass
4. Commit: "feat: add generic BinaryAnalyzer parameterized by architecture"

---

## Phase 2: ARM Extraction (Week 2)

### Step 2.1: Create ARM module structure

```bash
# Create directory structure
mkdir -p src/arch/arm
```

### Step 2.2: Create `src/arch/mod.rs`

```rust
//! Architecture implementations

pub mod arm;

#[cfg(feature = "mips")]
pub mod mips;

#[cfg(feature = "riscv")]
pub mod riscv;

#[cfg(feature = "x86")]
pub mod x86;
```

### Step 2.3: Implement ARM architecture

Follow the code examples in REFACTORING_PLAN.md sections for:
- `src/arch/arm/mod.rs`
- `src/arch/arm/xref.rs`
- `src/arch/arm/patterns.rs`
- `src/arch/arm/decoder.rs` (stub)

### Step 2.4: Update `src/lib.rs`

Replace `BinaryAnalyzer` with `ArmAnalyzer`:

```rust
pub mod analyzer;
pub mod arch;
pub mod traits;
pub mod types;
pub mod xref;

use analyzer::BinaryAnalyzer;
use arch::arm::ArmArchitecture;
// ... rest of imports

#[wasm_bindgen]
pub struct ArmAnalyzer {
    inner: BinaryAnalyzer<ArmArchitecture>,
}

#[wasm_bindgen]
impl ArmAnalyzer {
    #[wasm_bindgen(constructor)]
    pub fn new(base_address: u32) -> ArmAnalyzer {
        #[cfg(feature = "console_errors")]
        console_error_panic_hook::set_once();

        ArmAnalyzer {
            inner: BinaryAnalyzer::new(ArmArchitecture::new(), base_address),
        }
    }

    // Delegate all methods to inner...
}

// Backward compatibility alias
#[wasm_bindgen]
pub type BinaryAnalyzer = ArmAnalyzer;
```

---

## Testing Checklist

After each phase:

- [ ] Run `cargo test` - all tests pass
- [ ] Run `cargo bench` - no performance regression
- [ ] Run `wasm-pack build` - WASM builds successfully
- [ ] Test in browser - JavaScript integration works
- [ ] Check binary size - within acceptable limits
- [ ] Run linter - `cargo clippy`
- [ ] Format code - `cargo fmt`

---

## Common Issues & Solutions

### Issue: Circular dependencies

**Symptom:** Compiler error about circular module dependencies

**Solution:** Ensure traits.rs doesn't depend on arch/, and arch/ doesn't depend on analyzer.rs

### Issue: Tests fail after refactoring

**Symptom:** Unit tests fail that previously passed

**Solution:** Check that XrefDatabase.build_indices() is called before queries

### Issue: Performance regression

**Symptom:** Benchmarks show slower execution

**Solution:** Profile with `cargo flamegraph` and add `#[inline]` to hot paths

### Issue: WASM build fails

**Symptom:** wasm-pack build errors

**Solution:** Ensure all types used in WASM API implement Serialize/Deserialize

---

## Verification Steps

### After Phase 1:

```bash
# Compile check
cargo build

# Run tests
cargo test

# Run benchmarks
cargo bench

# Check for warnings
cargo clippy
```

### After Phase 2:

```bash
# Build WASM
cd packages/battlemagic-analyzer
wasm-pack build --target web

# Test in browser
cd ../../apps/web
npm run dev
# Navigate to BattleMagic tool and verify ARM analysis works
```

### After Phase 3:

```bash
# Test MIPS support
cargo test --features mips

# Build MIPS WASM
wasm-pack build --target web --features mips
```

---

## Roll back Strategy

If something goes wrong:

1. **Phase 1 issues:**
   - Revert to commit before traits.rs
   - Keep XrefDatabase refactor if possible

2. **Phase 2 issues:**
   - Keep traits.rs and analyzer.rs
   - Revert arch/arm/ changes
   - Use git cherry-pick to selectively apply commits

3. **Phase 3+ issues:**
   - Core (ARM) should still work
   - Simply disable MIPS feature flag

---

## Timeline Checkpoints

### Week 1 End:
- [ ] traits.rs created and tested
- [ ] XrefDatabase refactored
- [ ] analyzer.rs created and tested
- [ ] All existing tests pass

### Week 2 End:
- [ ] arch/arm/ created
- [ ] ArmArchitecture implements trait
- [ ] ArmAnalyzer WASM binding works
- [ ] Performance benchmarks match baseline

### Week 3 End:
- [ ] arch/mips/ created
- [ ] MipsAnalyzer WASM binding works
- [ ] MIPS tests pass

### Week 4 End:
- [ ] Function detection implemented
- [ ] CFG builder implemented
- [ ] Integration tests pass

### Week 5 End:
- [ ] Documentation complete
- [ ] Examples working
- [ ] Ready for release

---

This guide should provide enough detail to implement the refactoring systematically. Start with Phase 1, verify everything works, then proceed to Phase 2.
