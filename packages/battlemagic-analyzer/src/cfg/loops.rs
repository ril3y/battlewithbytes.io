//! Loop Detection and Classification
//!
//! This module implements natural loop detection using back-edge analysis and
//! dominator trees. It also provides loop type classification based on control
//! flow patterns.
//!
//! ## Natural Loops
//! A natural loop is identified by a back-edge (an edge whose target dominates
//! its source). The loop consists of:
//! - Loop header: The target of the back-edge
//! - Loop body: All nodes that can reach the back-edge source without going
//!   through the header
//!
//! ## Loop Types
//! Loops are classified based on their structure:
//! - **While**: Pre-test loop (condition at header)
//! - **DoWhile**: Post-test loop (condition at back-edge)
//! - **For**: Counter-based loop (identifiable increment pattern)
//! - **Infinite**: No exit condition

use crate::cfg::basic_blocks::ControlFlowGraph;
use crate::cfg::dominators::DominatorTree;
use crate::traits::{Architecture, Instruction};
use crate::types::{Loop, LoopType};
use std::collections::{HashSet, VecDeque};

/// Information about a detected loop
#[derive(Debug, Clone)]
pub struct LoopInfo {
    /// Loop header address (entry point)
    pub header: u32,

    /// Back-edge source address
    pub back_edge: u32,

    /// All addresses in the loop body
    pub body: HashSet<u32>,

    /// Nesting depth (1 = outermost)
    pub depth: usize,
}

impl LoopInfo {
    /// Create a new loop info
    pub fn new(header: u32, back_edge: u32, body: HashSet<u32>, depth: usize) -> Self {
        Self {
            header,
            back_edge,
            body,
            depth,
        }
    }

    /// Get the size of the loop body
    pub fn size(&self) -> usize {
        self.body.len()
    }

    /// Check if this loop contains another loop
    pub fn contains_loop(&self, other: &LoopInfo) -> bool {
        self.body.contains(&other.header)
    }
}

/// Detector for finding natural loops in control flow graphs
pub struct LoopDetector;

impl LoopDetector {
    /// Detect all natural loops in a control flow graph
    ///
    /// # Algorithm
    /// 1. Compute dominator tree
    /// 2. Find all back-edges (edges where target dominates source)
    /// 3. For each back-edge, compute natural loop body
    /// 4. Calculate nesting depths based on loop containment
    ///
    /// # Returns
    /// Vector of detected loops with nesting information
    pub fn detect_loops(cfg: &ControlFlowGraph, dom_tree: &DominatorTree) -> Vec<LoopInfo> {
        let mut loops = Vec::new();

        // Find all back-edges
        let back_edges = Self::find_back_edges(cfg, dom_tree);

        // Build natural loop for each back-edge
        for (source, target) in back_edges {
            let body = Self::find_natural_loop_body(cfg, source, target);
            loops.push(LoopInfo::new(target, source, body, 0)); // Depth calculated later
        }

        // Calculate nesting depths
        Self::calculate_nesting_depths(&mut loops);

        loops
    }

    /// Find all back-edges in the CFG
    ///
    /// A back-edge is an edge (A -> B) where B dominates A
    fn find_back_edges(cfg: &ControlFlowGraph, dom_tree: &DominatorTree) -> Vec<(u32, u32)> {
        let mut back_edges = Vec::new();

        for (_, block) in &cfg.blocks {
            let source = block.start_addr;

            for &target in &block.successors {
                // Check if target dominates source
                if dom_tree.dominates(target, source) {
                    back_edges.push((source, target));
                }
            }
        }

        back_edges
    }

    /// Find the natural loop body for a back-edge
    ///
    /// The natural loop body includes all nodes that can reach the back-edge
    /// source without going through the header.
    ///
    /// # Algorithm
    /// Start from back-edge source, work backwards to find all nodes that
    /// can reach it without passing through the header.
    fn find_natural_loop_body(cfg: &ControlFlowGraph, source: u32, header: u32) -> HashSet<u32> {
        let mut body = HashSet::new();
        body.insert(header); // Header is always in the loop
        body.insert(source); // Back-edge source is in the loop

        // Work backwards from source to find all loop members
        let mut worklist = VecDeque::new();
        worklist.push_back(source);

        while let Some(node) = worklist.pop_front() {
            if node == header {
                continue; // Don't traverse backwards through header
            }

            // Add all predecessors to the loop body
            if let Some(block) = cfg.get_block(node) {
                for &pred in &block.predecessors {
                    if !body.contains(&pred) {
                        body.insert(pred);
                        worklist.push_back(pred);
                    }
                }
            }
        }

        body
    }

    /// Calculate nesting depths for loops
    ///
    /// Depth is determined by how many loops contain this loop.
    /// Outermost loops have depth 1.
    fn calculate_nesting_depths(loops: &mut [LoopInfo]) {
        for i in 0..loops.len() {
            let mut depth = 1;

            // Count how many other loops contain this loop
            for j in 0..loops.len() {
                if i != j && loops[j].contains_loop(&loops[i]) {
                    depth += 1;
                }
            }

            loops[i].depth = depth;
        }
    }

    /// Convert LoopInfo to types::Loop with classification
    pub fn to_typed_loops<A: Architecture>(
        loops: &[LoopInfo],
        instructions: &[Instruction],
        arch: &A,
    ) -> Vec<Loop> {
        let classifier = LoopClassifier::new(arch);

        loops
            .iter()
            .map(|loop_info| {
                let loop_type = classifier.classify(loop_info, instructions);
                let body_addrs: Vec<u32> = loop_info.body.iter().copied().collect();

                Loop::new(
                    loop_info.header,
                    loop_info.back_edge,
                    body_addrs,
                    loop_type,
                    loop_info.depth as u32,
                )
            })
            .collect()
    }
}

/// Classifier for determining loop types
pub struct LoopClassifier<'a, A: Architecture> {
    #[allow(dead_code)]
    arch: &'a A,
}

impl<'a, A: Architecture> LoopClassifier<'a, A> {
    /// Create a new loop classifier
    pub fn new(arch: &'a A) -> Self {
        Self { arch }
    }

    /// Classify a loop based on its structure
    ///
    /// # Classification Logic
    /// - **Infinite**: No conditional branches in body or header always jumps
    /// - **DoWhile**: Conditional branch at back-edge (post-test)
    /// - **For**: Counter pattern detected (increment + compare)
    /// - **While**: Conditional branch at header (pre-test)
    pub fn classify(&self, loop_info: &LoopInfo, instructions: &[Instruction]) -> LoopType {
        // Check for infinite loop
        if self.is_infinite_loop(loop_info, instructions) {
            return LoopType::Infinite;
        }

        // Check for do-while (condition at back-edge)
        if self.is_do_while_loop(loop_info, instructions) {
            return LoopType::DoWhile;
        }

        // Check for for-loop pattern
        if self.is_for_loop(loop_info, instructions) {
            return LoopType::For;
        }

        // Default to while loop
        LoopType::While
    }

    /// Check if loop is infinite (no exit conditions)
    fn is_infinite_loop(&self, loop_info: &LoopInfo, instructions: &[Instruction]) -> bool {
        // Find instructions in loop body
        let loop_instrs: Vec<&Instruction> = instructions
            .iter()
            .filter(|i| loop_info.body.contains(&i.address))
            .collect();

        // Check if there are any conditional branches
        let has_conditional = loop_instrs
            .iter()
            .any(|i| self.is_conditional_branch(i));

        // If no conditional branches, it's likely infinite
        !has_conditional
    }

    /// Check if loop is do-while style (post-test)
    fn is_do_while_loop(&self, loop_info: &LoopInfo, instructions: &[Instruction]) -> bool {
        // Find back-edge instruction
        if let Some(back_edge_instr) = instructions.iter().find(|i| i.address == loop_info.back_edge)
        {
            // Do-while has condition at the back-edge
            return self.is_conditional_branch(back_edge_instr);
        }

        false
    }

    /// Check if loop is for-loop style (counter-based)
    fn is_for_loop(&self, loop_info: &LoopInfo, instructions: &[Instruction]) -> bool {
        // Look for increment pattern in loop body
        let loop_instrs: Vec<&Instruction> = instructions
            .iter()
            .filter(|i| loop_info.body.contains(&i.address))
            .collect();

        // Simple heuristic: look for add/sub instructions (counter increment)
        // and compare instructions (counter check)
        let has_increment = loop_instrs.iter().any(|i| {
            let mnem = i.mnemonic.to_lowercase();
            mnem.starts_with("add") || mnem.starts_with("sub") || mnem.starts_with("inc")
                || mnem.starts_with("dec")
        });

        let has_compare = loop_instrs.iter().any(|i| {
            let mnem = i.mnemonic.to_lowercase();
            mnem.starts_with("cmp") || mnem.starts_with("tst")
        });

        has_increment && has_compare
    }

    /// Check if instruction is a conditional branch
    fn is_conditional_branch(&self, instr: &Instruction) -> bool {
        let mnem = instr.mnemonic.to_lowercase();

        // Common conditional branch patterns
        (mnem.starts_with("b") && mnem.len() > 1 && mnem != "bl" && mnem != "blx" && mnem != "b")
            || mnem.starts_with("cbz")
            || mnem.starts_with("cbnz")
            || mnem.starts_with("tbz")
            || mnem.starts_with("tbnz")
            || mnem.starts_with("j") && mnem.len() > 1 // jz, jnz, je, jne, etc.
    }
}

/// Find exits from a loop (edges leaving the loop)
pub fn find_loop_exits(cfg: &ControlFlowGraph, loop_body: &HashSet<u32>) -> Vec<(u32, u32)> {
    let mut exits = Vec::new();

    for &node in loop_body {
        if let Some(block) = cfg.get_block(node) {
            for &succ in &block.successors {
                // If successor is not in loop body, this is an exit edge
                if !loop_body.contains(&succ) {
                    exits.push((node, succ));
                }
            }
        }
    }

    exits
}

/// Find entry edges to a loop (edges entering the loop from outside)
pub fn find_loop_entries(cfg: &ControlFlowGraph, loop_header: u32) -> Vec<(u32, u32)> {
    let mut entries = Vec::new();

    if let Some(header_block) = cfg.get_block(loop_header) {
        for &pred in &header_block.predecessors {
            entries.push((pred, loop_header));
        }
    }

    entries
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::cfg::basic_blocks::BasicBlock;
    use crate::cfg::dominators::DominatorAnalyzer;

    // Mock architecture for testing
    struct MockArch;

    impl Architecture for MockArch {
        fn name(&self) -> &'static str {
            "Mock"
        }
        fn instruction_alignment(&self) -> usize {
            4
        }

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
    fn test_simple_loop_detection() {
        // Create a simple loop: A -> B -> A
        let mut cfg = ControlFlowGraph::new();
        cfg.entry_point = Some(0x1000);

        let mut block_a = BasicBlock::new(0x1000, 0x1000, vec![0x1000]);
        block_a.add_successor(0x2000);
        cfg.add_block(block_a);

        let mut block_b = BasicBlock::new(0x2000, 0x2000, vec![0x2000]);
        block_b.add_predecessor(0x1000);
        block_b.add_predecessor(0x2000); // Self-loop back edge
        block_b.add_successor(0x2000); // Self-loop
        cfg.add_block(block_b);

        let dom_tree = DominatorAnalyzer::analyze(&cfg);
        let loops = LoopDetector::detect_loops(&cfg, &dom_tree);

        // Should detect one loop
        assert_eq!(loops.len(), 1);
        assert_eq!(loops[0].header, 0x2000);
        assert_eq!(loops[0].back_edge, 0x2000);
    }

    #[test]
    fn test_while_loop_structure() {
        // Classic while loop:
        //   Entry -> Header -> Body -> Back to Header -> Exit
        let mut cfg = ControlFlowGraph::new();
        cfg.entry_point = Some(0x1000);

        let mut entry = BasicBlock::new(0x1000, 0x1000, vec![0x1000]);
        entry.add_successor(0x2000);
        cfg.add_block(entry);

        let mut header = BasicBlock::new(0x2000, 0x2000, vec![0x2000]);
        header.add_predecessor(0x1000);
        header.add_predecessor(0x3000); // Back edge
        header.add_successor(0x3000); // To body
        header.add_successor(0x4000); // Exit
        cfg.add_block(header);

        let mut body = BasicBlock::new(0x3000, 0x3000, vec![0x3000]);
        body.add_predecessor(0x2000);
        body.add_successor(0x2000); // Back edge
        cfg.add_block(body);

        let mut exit = BasicBlock::new(0x4000, 0x4000, vec![0x4000]);
        exit.add_predecessor(0x2000);
        cfg.add_block(exit);

        let dom_tree = DominatorAnalyzer::analyze(&cfg);
        let loops = LoopDetector::detect_loops(&cfg, &dom_tree);

        assert_eq!(loops.len(), 1);
        assert_eq!(loops[0].header, 0x2000);
        assert_eq!(loops[0].back_edge, 0x3000);

        // Loop body should contain header and body block
        assert!(loops[0].body.contains(&0x2000));
        assert!(loops[0].body.contains(&0x3000));
        assert!(!loops[0].body.contains(&0x4000)); // Exit not in loop
    }

    #[test]
    fn test_nested_loops() {
        // Outer loop with inner loop:
        //   A -> B -> C -> D -> C (inner) -> B (outer) -> Exit
        let mut cfg = ControlFlowGraph::new();
        cfg.entry_point = Some(0x1000);

        let mut block_a = BasicBlock::new(0x1000, 0x1000, vec![0x1000]);
        block_a.add_successor(0x2000);
        cfg.add_block(block_a);

        let mut block_b = BasicBlock::new(0x2000, 0x2000, vec![0x2000]);
        block_b.add_predecessor(0x1000);
        block_b.add_predecessor(0x3000); // Outer back edge
        block_b.add_successor(0x3000);
        block_b.add_successor(0x5000); // Exit
        cfg.add_block(block_b);

        let mut block_c = BasicBlock::new(0x3000, 0x3000, vec![0x3000]);
        block_c.add_predecessor(0x2000);
        block_c.add_predecessor(0x4000); // Inner back edge
        block_c.add_successor(0x4000);
        block_c.add_successor(0x2000); // Outer back edge
        cfg.add_block(block_c);

        let mut block_d = BasicBlock::new(0x4000, 0x4000, vec![0x4000]);
        block_d.add_predecessor(0x3000);
        block_d.add_successor(0x3000); // Inner back edge
        cfg.add_block(block_d);

        let mut exit = BasicBlock::new(0x5000, 0x5000, vec![0x5000]);
        exit.add_predecessor(0x2000);
        cfg.add_block(exit);

        let dom_tree = DominatorAnalyzer::analyze(&cfg);
        let mut loops = LoopDetector::detect_loops(&cfg, &dom_tree);

        // Should detect two loops
        assert_eq!(loops.len(), 2);

        // Sort by header address for consistent testing
        loops.sort_by_key(|l| l.header);

        // Outer loop (header 0x2000)
        assert_eq!(loops[0].header, 0x2000);
        assert_eq!(loops[0].depth, 1); // Outermost

        // Inner loop (header 0x3000)
        assert_eq!(loops[1].header, 0x3000);
        assert_eq!(loops[1].depth, 2); // Nested
    }

    #[test]
    fn test_loop_classification_infinite() {
        let arch = MockArch;
        let classifier = LoopClassifier::new(&arch);

        let loop_info = LoopInfo::new(0x1000, 0x1004, {
            let mut set = HashSet::new();
            set.insert(0x1000);
            set.insert(0x1004);
            set
        }, 1);

        // Instructions with no conditional branches = infinite loop
        let instructions = vec![
            Instruction::new(0x1000, vec![0], "mov".to_string(), "r0, r1".to_string()),
            Instruction::new(0x1004, vec![0], "b".to_string(), "#0x1000".to_string()),
        ];

        let loop_type = classifier.classify(&loop_info, &instructions);
        assert_eq!(loop_type, LoopType::Infinite);
    }

    #[test]
    fn test_loop_classification_do_while() {
        let arch = MockArch;
        let classifier = LoopClassifier::new(&arch);

        let loop_info = LoopInfo::new(0x1000, 0x1004, {
            let mut set = HashSet::new();
            set.insert(0x1000);
            set.insert(0x1004);
            set
        }, 1);

        // Conditional branch at back-edge = do-while
        let instructions = vec![
            Instruction::new(0x1000, vec![0], "mov".to_string(), "r0, r1".to_string()),
            Instruction::new(0x1004, vec![0], "b.ne".to_string(), "#0x1000".to_string()),
        ];

        let loop_type = classifier.classify(&loop_info, &instructions);
        assert_eq!(loop_type, LoopType::DoWhile);
    }

    #[test]
    fn test_loop_classification_for() {
        let arch = MockArch;
        let classifier = LoopClassifier::new(&arch);

        let loop_info = LoopInfo::new(0x1000, 0x100c, {
            let mut set = HashSet::new();
            set.insert(0x1000);
            set.insert(0x1004);
            set.insert(0x1008);
            set.insert(0x100c);
            set
        }, 1);

        // Instructions with increment and compare = for loop
        let instructions = vec![
            Instruction::new(0x1000, vec![0], "cmp".to_string(), "r0, #10".to_string()),
            Instruction::new(0x1004, vec![0], "b.ge".to_string(), "#0x2000".to_string()),
            Instruction::new(0x1008, vec![0], "add".to_string(), "r0, r0, #1".to_string()),
            Instruction::new(0x100c, vec![0], "b".to_string(), "#0x1000".to_string()),
        ];

        let loop_type = classifier.classify(&loop_info, &instructions);
        assert_eq!(loop_type, LoopType::For);
    }

    #[test]
    fn test_find_loop_exits() {
        let mut cfg = ControlFlowGraph::new();

        let mut block_a = BasicBlock::new(0x1000, 0x1000, vec![0x1000]);
        block_a.add_successor(0x2000); // In loop
        block_a.add_successor(0x3000); // Exit
        cfg.add_block(block_a);

        let mut block_b = BasicBlock::new(0x2000, 0x2000, vec![0x2000]);
        block_b.add_successor(0x1000);
        cfg.add_block(block_b);

        let block_c = BasicBlock::new(0x3000, 0x3000, vec![0x3000]);
        cfg.add_block(block_c);

        let loop_body: HashSet<u32> = [0x1000, 0x2000].iter().copied().collect();
        let exits = find_loop_exits(&cfg, &loop_body);

        assert_eq!(exits.len(), 1);
        assert_eq!(exits[0], (0x1000, 0x3000));
    }

    #[test]
    fn test_loop_containment() {
        let outer = LoopInfo::new(0x1000, 0x3000, {
            let mut set = HashSet::new();
            set.insert(0x1000);
            set.insert(0x2000);
            set.insert(0x3000);
            set
        }, 1);

        let inner = LoopInfo::new(0x2000, 0x2004, {
            let mut set = HashSet::new();
            set.insert(0x2000);
            set.insert(0x2004);
            set
        }, 2);

        assert!(outer.contains_loop(&inner));
        assert!(!inner.contains_loop(&outer));
    }

    #[test]
    fn test_to_typed_loops() {
        let arch = MockArch;

        let loop_info = LoopInfo::new(0x1000, 0x1004, {
            let mut set = HashSet::new();
            set.insert(0x1000);
            set.insert(0x1004);
            set
        }, 1);

        let instructions = vec![
            Instruction::new(0x1000, vec![0], "cmp".to_string(), "r0, #10".to_string()),
            Instruction::new(0x1004, vec![0], "b.lt".to_string(), "#0x1000".to_string()),
        ];

        let typed_loops = LoopDetector::to_typed_loops(&[loop_info], &instructions, &arch);

        assert_eq!(typed_loops.len(), 1);
        assert_eq!(typed_loops[0].header_addr, 0x1000);
        assert_eq!(typed_loops[0].back_edge_addr, 0x1004);
        assert_eq!(typed_loops[0].nesting_level, 1);
    }
}
