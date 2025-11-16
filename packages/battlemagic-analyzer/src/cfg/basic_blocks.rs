//! Basic Block Identification and Control Flow Graph Construction
//!
//! This module provides architecture-independent algorithms for identifying basic blocks
//! from instruction sequences and building control flow graphs.
//!
//! A basic block is a maximal sequence of instructions with:
//! - Single entry point (first instruction)
//! - Single exit point (last instruction)
//! - No branches except at the end
//! - No branch targets except at the start

use crate::traits::{Architecture, Instruction};
use std::collections::{HashMap, HashSet};

/// Represents a single basic block in the control flow graph
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BasicBlock {
    /// Starting address of the block
    pub start_addr: u32,

    /// Ending address of the block (inclusive)
    pub end_addr: u32,

    /// Addresses of successor blocks (control flow targets)
    pub successors: Vec<u32>,

    /// Addresses of predecessor blocks (blocks that branch here)
    pub predecessors: Vec<u32>,

    /// All instruction addresses in this block
    pub instruction_addrs: Vec<u32>,
}

impl BasicBlock {
    /// Create a new basic block
    pub fn new(start_addr: u32, end_addr: u32, instruction_addrs: Vec<u32>) -> Self {
        Self {
            start_addr,
            end_addr,
            successors: Vec::new(),
            predecessors: Vec::new(),
            instruction_addrs,
        }
    }

    /// Add a successor block
    pub fn add_successor(&mut self, addr: u32) {
        if !self.successors.contains(&addr) {
            self.successors.push(addr);
        }
    }

    /// Add a predecessor block
    pub fn add_predecessor(&mut self, addr: u32) {
        if !self.predecessors.contains(&addr) {
            self.predecessors.push(addr);
        }
    }

    /// Check if this block contains the given address
    pub fn contains(&self, addr: u32) -> bool {
        self.instruction_addrs.contains(&addr)
    }

    /// Get number of instructions in this block
    pub fn size(&self) -> usize {
        self.instruction_addrs.len()
    }
}

/// Control Flow Graph representation
#[derive(Debug, Clone)]
pub struct ControlFlowGraph {
    /// Map from start address to basic block
    pub blocks: HashMap<u32, BasicBlock>,

    /// Entry point address
    pub entry_point: Option<u32>,
}

impl ControlFlowGraph {
    /// Create a new empty CFG
    pub fn new() -> Self {
        Self {
            blocks: HashMap::new(),
            entry_point: None,
        }
    }

    /// Get a block by its start address
    pub fn get_block(&self, addr: u32) -> Option<&BasicBlock> {
        self.blocks.get(&addr)
    }

    /// Get mutable block by start address
    pub fn get_block_mut(&mut self, addr: u32) -> Option<&mut BasicBlock> {
        self.blocks.get_mut(&addr)
    }

    /// Add a basic block to the CFG
    pub fn add_block(&mut self, block: BasicBlock) {
        self.blocks.insert(block.start_addr, block);
    }

    /// Get number of basic blocks
    pub fn block_count(&self) -> usize {
        self.blocks.len()
    }

    /// Get all block addresses in sorted order
    pub fn block_addresses(&self) -> Vec<u32> {
        let mut addrs: Vec<u32> = self.blocks.keys().copied().collect();
        addrs.sort_unstable();
        addrs
    }

    /// Find which basic block contains the given address
    pub fn find_block_containing(&self, addr: u32) -> Option<&BasicBlock> {
        self.blocks.values().find(|block| block.contains(addr))
    }
}

impl Default for ControlFlowGraph {
    fn default() -> Self {
        Self::new()
    }
}

/// Analyzes instruction sequences to identify basic blocks and build CFG
pub struct BasicBlockAnalyzer<'a, A: Architecture> {
    #[allow(dead_code)]
    arch: &'a A,
}

impl<'a, A: Architecture> BasicBlockAnalyzer<'a, A> {
    /// Create a new basic block analyzer
    pub fn new(arch: &'a A) -> Self {
        Self { arch }
    }

    /// Analyze instructions and build control flow graph
    ///
    /// # Algorithm
    /// 1. Identify all block leaders (entry points):
    ///    - First instruction
    ///    - Any branch target
    ///    - Instruction after a branch
    /// 2. Build blocks between leaders
    /// 3. Connect blocks with successor/predecessor edges
    pub fn analyze(&self, instructions: &[Instruction]) -> ControlFlowGraph {
        if instructions.is_empty() {
            return ControlFlowGraph::new();
        }

        // Step 1: Find all block leaders
        let leaders = self.find_block_leaders(instructions);

        // Step 2: Build basic blocks
        let blocks = self.build_basic_blocks(instructions, &leaders);

        // Step 3: Build control flow edges
        let mut cfg = ControlFlowGraph::new();
        cfg.entry_point = instructions.first().map(|i| i.address);

        for mut block in blocks {
            // Find successors based on last instruction
            if let Some(last_addr) = block.instruction_addrs.last().copied() {
                let successors = self.find_successors(instructions, last_addr);
                for succ_addr in successors {
                    block.add_successor(succ_addr);
                }
            }

            cfg.add_block(block);
        }

        // Add predecessor edges (reverse of successor edges)
        self.build_predecessor_edges(&mut cfg);

        cfg
    }

    /// Find all block leaders (first instruction of each basic block)
    fn find_block_leaders(&self, instructions: &[Instruction]) -> HashSet<u32> {
        let mut leaders = HashSet::new();

        // First instruction is always a leader
        if let Some(first) = instructions.first() {
            leaders.insert(first.address);
        }

        for (i, instr) in instructions.iter().enumerate() {
            // Check if this is a branch instruction
            if self.is_branch_instruction(instr) {
                // Add branch targets as leaders
                if let Some(target) = self.extract_branch_target(instr) {
                    leaders.insert(target);
                }

                // Add instruction after branch as leader (fall-through)
                if i + 1 < instructions.len() {
                    leaders.insert(instructions[i + 1].address);
                }
            }
        }

        leaders
    }

    /// Build basic blocks from instruction sequence and leaders
    fn build_basic_blocks(
        &self,
        instructions: &[Instruction],
        leaders: &HashSet<u32>,
    ) -> Vec<BasicBlock> {
        let mut blocks = Vec::new();
        let mut current_block_addrs = Vec::new();
        let mut block_start: Option<u32> = None;

        for instr in instructions {
            let addr = instr.address;

            // Start new block if this is a leader
            if leaders.contains(&addr) {
                // Finish previous block if exists
                if let Some(start) = block_start {
                    if !current_block_addrs.is_empty() {
                        let end = *current_block_addrs.last().unwrap();
                        blocks.push(BasicBlock::new(start, end, current_block_addrs.clone()));
                        current_block_addrs.clear();
                    }
                }
                block_start = Some(addr);
            }

            current_block_addrs.push(addr);
        }

        // Finish last block
        if let Some(start) = block_start {
            if !current_block_addrs.is_empty() {
                let end = *current_block_addrs.last().unwrap();
                blocks.push(BasicBlock::new(start, end, current_block_addrs));
            }
        }

        blocks
    }

    /// Find successors of a given instruction address
    fn find_successors(&self, instructions: &[Instruction], addr: u32) -> Vec<u32> {
        let mut successors = Vec::new();

        // Find the instruction at this address
        if let Some(instr) = instructions.iter().find(|i| i.address == addr) {
            if self.is_branch_instruction(instr) {
                // Add branch target
                if let Some(target) = self.extract_branch_target(instr) {
                    successors.push(target);
                }

                // Add fall-through for conditional branches
                if self.is_conditional_branch(instr) {
                    if let Some(next_instr) = instructions.iter().find(|i| i.address > addr) {
                        successors.push(next_instr.address);
                    }
                }
            } else {
                // Not a branch - fall through to next instruction
                if let Some(next_instr) = instructions.iter().find(|i| i.address > addr) {
                    successors.push(next_instr.address);
                }
            }
        }

        successors
    }

    /// Build predecessor edges from successor edges
    fn build_predecessor_edges(&self, cfg: &mut ControlFlowGraph) {
        let edges: Vec<(u32, u32)> = cfg
            .blocks
            .iter()
            .flat_map(|(from, block)| {
                block.successors.iter().map(move |to| (*from, *to))
            })
            .collect();

        for (from, to) in edges {
            if let Some(block) = cfg.get_block_mut(to) {
                block.add_predecessor(from);
            }
        }
    }

    /// Check if instruction is a branch (conditional or unconditional)
    fn is_branch_instruction(&self, instr: &Instruction) -> bool {
        let mnem = instr.mnemonic.to_lowercase();

        // Common branch mnemonics across architectures
        mnem.starts_with("b") && !mnem.starts_with("bic") && !mnem.starts_with("bit")
            || mnem.starts_with("j") // Jump instructions (x86, MIPS, etc.)
            || mnem == "ret" || mnem == "return"
            || mnem == "call"
    }

    /// Check if instruction is a conditional branch
    fn is_conditional_branch(&self, instr: &Instruction) -> bool {
        let mnem = instr.mnemonic.to_lowercase();

        // Conditional branches have suffixes or specific names
        (mnem.starts_with("b") && mnem.len() > 1 && mnem != "bl" && mnem != "blx" && mnem != "b")
            || mnem.starts_with("cbz")
            || mnem.starts_with("cbnz")
            || mnem.starts_with("tbz")
            || mnem.starts_with("tbnz")
    }

    /// Extract branch target from instruction
    fn extract_branch_target(&self, instr: &Instruction) -> Option<u32> {
        // Try to parse target from operands
        let operands = instr.operands.trim();

        // Handle various formats: #0x1234, 0x1234, #1234
        if let Some(hex_str) = operands.strip_prefix("#0x") {
            u32::from_str_radix(hex_str.split_whitespace().next()?, 16).ok()
        } else if let Some(hex_str) = operands.strip_prefix("0x") {
            u32::from_str_radix(hex_str.split_whitespace().next()?, 16).ok()
        } else if let Some(hex_str) = operands.strip_prefix("#") {
            // Try decimal first, then hex
            hex_str.split_whitespace().next()?.parse::<u32>().ok()
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::traits::Architecture;

    // Mock architecture for testing
    struct MockArch;

    impl Architecture for MockArch {
        fn name(&self) -> &'static str { "Mock" }
        fn instruction_alignment(&self) -> usize { 4 }

        fn decode(&self, _bytes: &[u8], _addr: u32) -> Option<Instruction> {
            None
        }

        fn extract_xrefs(&self, _inst: &Instruction) -> Vec<crate::traits::CrossReference> {
            vec![]
        }

        fn is_function_start(&self, _inst: &Instruction) -> bool {
            false
        }

        fn is_function_end(&self, _inst: &Instruction) -> bool {
            false
        }

        // Control flow methods
        fn is_conditional_branch(&self, _inst: &Instruction) -> bool { false }
        fn is_unconditional_branch(&self, _inst: &Instruction) -> bool { false }
        fn is_call(&self, _inst: &Instruction) -> bool { false }
        fn is_comparison(&self, _inst: &Instruction) -> bool { false }
        fn get_branch_target(&self, _inst: &Instruction) -> Option<u32> { None }

        // Calling convention methods
        fn arg_registers(&self) -> &[&str] { &["r0", "r1", "r2", "r3"] }
        fn return_register(&self) -> &str { "r0" }
        fn link_register(&self) -> &str { "lr" }
        fn stack_pointer(&self) -> &str { "sp" }
    }

    #[test]
    fn test_basic_block_creation() {
        let block = BasicBlock::new(0x1000, 0x100c, vec![0x1000, 0x1004, 0x1008, 0x100c]);

        assert_eq!(block.start_addr, 0x1000);
        assert_eq!(block.end_addr, 0x100c);
        assert_eq!(block.size(), 4);
        assert!(block.contains(0x1000));
        assert!(block.contains(0x100c));
        assert!(!block.contains(0x2000));
    }

    #[test]
    fn test_basic_block_successors() {
        let mut block = BasicBlock::new(0x1000, 0x1008, vec![0x1000, 0x1004, 0x1008]);

        block.add_successor(0x2000);
        block.add_successor(0x3000);
        block.add_successor(0x2000); // Duplicate should be ignored

        assert_eq!(block.successors.len(), 2);
        assert!(block.successors.contains(&0x2000));
        assert!(block.successors.contains(&0x3000));
    }

    #[test]
    fn test_empty_cfg() {
        let arch = MockArch;
        let analyzer = BasicBlockAnalyzer::new(&arch);
        let instructions: Vec<Instruction> = vec![];

        let cfg = analyzer.analyze(&instructions);

        assert_eq!(cfg.block_count(), 0);
        assert!(cfg.entry_point.is_none());
    }

    #[test]
    fn test_single_block() {
        let arch = MockArch;
        let analyzer = BasicBlockAnalyzer::new(&arch);

        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "mov".to_string(), "r0, r1".to_string()),
            Instruction::new(0x1004, vec![0, 0, 0, 0], "add".to_string(), "r0, r0, #1".to_string()),
            Instruction::new(0x1008, vec![0, 0, 0, 0], "mov".to_string(), "r1, r0".to_string()),
        ];

        let cfg = analyzer.analyze(&instructions);

        assert_eq!(cfg.block_count(), 1);
        assert_eq!(cfg.entry_point, Some(0x1000));

        let block = cfg.get_block(0x1000).unwrap();
        assert_eq!(block.start_addr, 0x1000);
        assert_eq!(block.end_addr, 0x1008);
        assert_eq!(block.size(), 3);
    }

    #[test]
    fn test_unconditional_branch_splits_blocks() {
        let arch = MockArch;
        let analyzer = BasicBlockAnalyzer::new(&arch);

        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "mov".to_string(), "r0, r1".to_string()),
            Instruction::new(0x1004, vec![0, 0, 0, 0], "b".to_string(), "#0x2000".to_string()),
            Instruction::new(0x1008, vec![0, 0, 0, 0], "mov".to_string(), "r1, r0".to_string()),
            Instruction::new(0x2000, vec![0, 0, 0, 0], "nop".to_string(), "".to_string()),
        ];

        let cfg = analyzer.analyze(&instructions);

        // Should have 3 blocks: [0x1000-0x1004], [0x1008], [0x2000]
        assert_eq!(cfg.block_count(), 3);

        let block1 = cfg.get_block(0x1000).unwrap();
        assert_eq!(block1.end_addr, 0x1004);
        assert_eq!(block1.successors.len(), 1);
        assert_eq!(block1.successors[0], 0x2000);
    }

    #[test]
    fn test_conditional_branch_creates_two_successors() {
        let arch = MockArch;
        let analyzer = BasicBlockAnalyzer::new(&arch);

        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "cmp".to_string(), "r0, r1".to_string()),
            Instruction::new(0x1004, vec![0, 0, 0, 0], "b.eq".to_string(), "#0x2000".to_string()),
            Instruction::new(0x1008, vec![0, 0, 0, 0], "mov".to_string(), "r1, r0".to_string()),
            Instruction::new(0x2000, vec![0, 0, 0, 0], "nop".to_string(), "".to_string()),
        ];

        let cfg = analyzer.analyze(&instructions);

        let block1 = cfg.get_block(0x1000).unwrap();
        assert_eq!(block1.end_addr, 0x1004);

        // Conditional branch should have two successors: branch target and fall-through
        assert_eq!(block1.successors.len(), 2);
        assert!(block1.successors.contains(&0x2000)); // Branch target
        assert!(block1.successors.contains(&0x1008)); // Fall-through
    }

    #[test]
    fn test_predecessor_edges() {
        let arch = MockArch;
        let analyzer = BasicBlockAnalyzer::new(&arch);

        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "b.eq".to_string(), "#0x2000".to_string()),
            Instruction::new(0x1004, vec![0, 0, 0, 0], "b".to_string(), "#0x2000".to_string()),
            Instruction::new(0x2000, vec![0, 0, 0, 0], "nop".to_string(), "".to_string()),
        ];

        let cfg = analyzer.analyze(&instructions);

        // Block at 0x2000 should have two predecessors
        let block = cfg.get_block(0x2000).unwrap();
        assert_eq!(block.predecessors.len(), 2);
        assert!(block.predecessors.contains(&0x1000));
        assert!(block.predecessors.contains(&0x1004));
    }

    #[test]
    fn test_branch_target_extraction() {
        let arch = MockArch;
        let analyzer = BasicBlockAnalyzer::new(&arch);

        // Test various address formats
        let instr1 = Instruction::new(0x1000, vec![0], "b".to_string(), "#0x2000".to_string());
        assert_eq!(analyzer.extract_branch_target(&instr1), Some(0x2000));

        let instr2 = Instruction::new(0x1000, vec![0], "b".to_string(), "0x3000".to_string());
        assert_eq!(analyzer.extract_branch_target(&instr2), Some(0x3000));

        let instr3 = Instruction::new(0x1000, vec![0], "b".to_string(), "#4096".to_string());
        assert_eq!(analyzer.extract_branch_target(&instr3), Some(4096));
    }

    #[test]
    fn test_find_block_containing() {
        let arch = MockArch;
        let analyzer = BasicBlockAnalyzer::new(&arch);

        let instructions = vec![
            Instruction::new(0x1000, vec![0, 0, 0, 0], "mov".to_string(), "r0, r1".to_string()),
            Instruction::new(0x1004, vec![0, 0, 0, 0], "add".to_string(), "r0, r0, #1".to_string()),
            Instruction::new(0x1008, vec![0, 0, 0, 0], "b".to_string(), "#0x2000".to_string()),
            Instruction::new(0x2000, vec![0, 0, 0, 0], "nop".to_string(), "".to_string()),
        ];

        let cfg = analyzer.analyze(&instructions);

        // Find block containing 0x1004
        let block = cfg.find_block_containing(0x1004).unwrap();
        assert_eq!(block.start_addr, 0x1000);

        // Find block containing 0x2000
        let block2 = cfg.find_block_containing(0x2000).unwrap();
        assert_eq!(block2.start_addr, 0x2000);

        // Non-existent address
        assert!(cfg.find_block_containing(0x9999).is_none());
    }

    #[test]
    fn test_block_addresses_sorted() {
        let arch = MockArch;
        let analyzer = BasicBlockAnalyzer::new(&arch);

        let instructions = vec![
            Instruction::new(0x1000, vec![0], "b".to_string(), "#0x3000".to_string()),
            Instruction::new(0x2000, vec![0], "nop".to_string(), "".to_string()),
            Instruction::new(0x3000, vec![0], "nop".to_string(), "".to_string()),
        ];

        let cfg = analyzer.analyze(&instructions);
        let addrs = cfg.block_addresses();

        // Should be sorted
        assert_eq!(addrs, vec![0x1000, 0x2000, 0x3000]);
    }
}
