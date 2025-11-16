//! Dominator Tree Computation
//!
//! This module implements the classic dominator analysis algorithm for control flow graphs.
//! Dominator analysis is essential for proper loop detection and program structure analysis.
//!
//! ## Definitions
//! - Node A **dominates** node B if all paths from the entry to B go through A
//! - Node A is the **immediate dominator** (idom) of B if A dominates B and there's no
//!   other node C that dominates B but is dominated by A
//! - The **dominator tree** represents the immediate dominator relationships

use crate::cfg::basic_blocks::ControlFlowGraph;
use std::collections::{HashMap, HashSet};

/// Represents a dominator tree for a control flow graph
#[derive(Debug, Clone)]
pub struct DominatorTree {
    /// Map from node address to its immediate dominator
    pub idom: HashMap<u32, u32>,

    /// Map from node address to nodes it immediately dominates (children in dom tree)
    pub dominated: HashMap<u32, Vec<u32>>,

    /// Entry point of the CFG
    pub entry: Option<u32>,
}

impl DominatorTree {
    /// Create a new empty dominator tree
    pub fn new() -> Self {
        Self {
            idom: HashMap::new(),
            dominated: HashMap::new(),
            entry: None,
        }
    }

    /// Get the immediate dominator of a node
    pub fn get_idom(&self, node: u32) -> Option<u32> {
        self.idom.get(&node).copied()
    }

    /// Get all nodes immediately dominated by this node
    pub fn get_dominated(&self, node: u32) -> &[u32] {
        self.dominated.get(&node).map(|v| v.as_slice()).unwrap_or(&[])
    }

    /// Check if node `a` dominates node `b`
    ///
    /// This walks up the dominator tree from `b` to see if we reach `a`
    pub fn dominates(&self, a: u32, b: u32) -> bool {
        if a == b {
            return true;
        }

        let mut current = b;
        let mut visited = HashSet::new();

        // Walk up dominator tree
        while let Some(dom) = self.idom.get(&current) {
            if *dom == a {
                return true;
            }

            // Prevent infinite loops in malformed trees
            if !visited.insert(current) {
                break;
            }

            current = *dom;
        }

        false
    }

    /// Get the dominator tree depth of a node (distance from entry)
    pub fn depth(&self, node: u32) -> usize {
        let mut depth = 0;
        let mut current = node;
        let mut visited = HashSet::new();

        while let Some(dom) = self.idom.get(&current) {
            depth += 1;

            // Prevent infinite loops
            if !visited.insert(current) {
                break;
            }

            current = *dom;
        }

        depth
    }

    /// Get all dominators of a node (path to root)
    pub fn get_all_dominators(&self, node: u32) -> Vec<u32> {
        let mut doms = Vec::new();
        let mut current = node;
        let mut visited = HashSet::new();

        while let Some(dom) = self.idom.get(&current) {
            doms.push(*dom);

            if !visited.insert(current) {
                break;
            }

            current = *dom;
        }

        doms
    }
}

impl Default for DominatorTree {
    fn default() -> Self {
        Self::new()
    }
}

/// Analyzer for computing dominator trees
pub struct DominatorAnalyzer;

impl DominatorAnalyzer {
    /// Compute the dominator tree for a control flow graph
    ///
    /// # Algorithm
    /// Uses the Cooper-Harvey-Kennedy algorithm (simple iterative dataflow):
    /// 1. Initialize all nodes' dominators to all nodes
    /// 2. Set entry node's dominator to itself
    /// 3. Iterate until fixed point:
    ///    - For each node, its dominators = {node} ∪ (∩ dominators of predecessors)
    /// 4. Extract immediate dominators from dominator sets
    ///
    /// # Time Complexity
    /// O(n²) in worst case, but typically much faster on structured code
    pub fn analyze(cfg: &ControlFlowGraph) -> DominatorTree {
        if cfg.blocks.is_empty() {
            return DominatorTree::new();
        }

        let entry = match cfg.entry_point {
            Some(e) => e,
            None => return DominatorTree::new(),
        };

        // Step 1: Initialize dominator sets
        let all_nodes: HashSet<u32> = cfg.blocks.keys().copied().collect();
        let mut dominators: HashMap<u32, HashSet<u32>> = HashMap::new();

        // Initialize all nodes to be dominated by all nodes
        for &node in &all_nodes {
            if node == entry {
                // Entry is only dominated by itself
                let mut entry_doms = HashSet::new();
                entry_doms.insert(entry);
                dominators.insert(entry, entry_doms);
            } else {
                dominators.insert(node, all_nodes.clone());
            }
        }

        // Step 2: Iterate to fixed point
        let mut changed = true;
        let mut iteration = 0;
        let max_iterations = all_nodes.len() * all_nodes.len(); // Safety limit

        while changed && iteration < max_iterations {
            changed = false;
            iteration += 1;

            for &node in &all_nodes {
                if node == entry {
                    continue;
                }

                // Get predecessors
                let block = match cfg.get_block(node) {
                    Some(b) => b,
                    None => continue,
                };

                if block.predecessors.is_empty() {
                    continue;
                }

                // Compute intersection of predecessor dominators
                // Start with first predecessor's dominators
                let mut new_doms: Option<HashSet<u32>> = None;

                for &pred in &block.predecessors {
                    if let Some(pred_doms) = dominators.get(&pred) {
                        new_doms = match new_doms {
                            None => Some(pred_doms.clone()),
                            Some(current) => Some(current.intersection(pred_doms).copied().collect()),
                        };
                    }
                }

                // Add self to dominator set
                if let Some(mut doms) = new_doms {
                    doms.insert(node);

                    // Check if dominators changed
                    let old_doms = dominators.get(&node).unwrap();
                    if &doms != old_doms {
                        dominators.insert(node, doms);
                        changed = true;
                    }
                }
            }
        }

        // Step 3: Extract immediate dominators
        Self::extract_immediate_dominators(&dominators, entry)
    }

    /// Extract immediate dominators from full dominator sets
    ///
    /// The immediate dominator of node B is the unique node A such that:
    /// - A dominates B (A is in B's dominator set)
    /// - A ≠ B
    /// - A is not dominated by any other dominator of B (except B itself)
    ///
    /// In other words, idom(B) is the "closest" dominator to B in the dominator tree
    fn extract_immediate_dominators(
        dominators: &HashMap<u32, HashSet<u32>>,
        entry: u32,
    ) -> DominatorTree {
        let mut tree = DominatorTree::new();
        tree.entry = Some(entry);

        for (&node, doms) in dominators {
            if node == entry {
                continue; // Entry has no idom
            }

            // Get all dominators except node itself
            let candidates: Vec<u32> = doms.iter().copied().filter(|&d| d != node).collect();

            if candidates.is_empty() {
                continue;
            }

            // Find the dominator that is dominated by all other dominators
            // This is the "closest" one to the node (furthest from entry)
            let mut idom = None;
            let mut max_dominated_by = -1i32;

            for &cand in &candidates {
                // Count how many other candidates dominate this candidate
                let dominated_by_count = candidates.iter().filter(|&&other| {
                    if other == cand {
                        return false;
                    }
                    // Check if 'other' dominates 'cand'
                    if let Some(cand_doms) = dominators.get(&cand) {
                        cand_doms.contains(&other)
                    } else {
                        false
                    }
                }).count() as i32;

                // The immediate dominator is the one dominated by the most others
                // (i.e., furthest from entry in the dominator tree, closest to node)
                if dominated_by_count > max_dominated_by {
                    max_dominated_by = dominated_by_count;
                    idom = Some(cand);
                }
            }

            // Insert the immediate dominator
            if let Some(idom_addr) = idom {
                tree.idom.insert(node, idom_addr);

                // Add to dominated list
                tree.dominated.entry(idom_addr).or_insert_with(Vec::new).push(node);
            }
        }

        tree
    }

    /// Compute dominance frontier for a node
    ///
    /// The dominance frontier of a node X is the set of nodes Y such that:
    /// - X dominates a predecessor of Y
    /// - X does not strictly dominate Y
    ///
    /// This is useful for SSA construction and advanced optimizations.
    pub fn compute_dominance_frontier(
        cfg: &ControlFlowGraph,
        tree: &DominatorTree,
        node: u32,
    ) -> HashSet<u32> {
        let mut frontier = HashSet::new();

        // Check all blocks in the CFG
        for (&block_addr, block) in &cfg.blocks {
            // For each predecessor of this block
            for &pred in &block.predecessors {
                // If node dominates pred but doesn't strictly dominate block_addr
                if tree.dominates(node, pred) && !tree.dominates(node, block_addr) || node == block_addr {
                    frontier.insert(block_addr);
                }
            }
        }

        frontier.remove(&node); // Node is not in its own frontier
        frontier
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::cfg::basic_blocks::BasicBlock;

    #[test]
    fn test_empty_cfg() {
        let cfg = ControlFlowGraph::new();
        let tree = DominatorAnalyzer::analyze(&cfg);

        assert!(tree.entry.is_none());
        assert_eq!(tree.idom.len(), 0);
    }

    #[test]
    fn test_single_block() {
        let mut cfg = ControlFlowGraph::new();
        cfg.entry_point = Some(0x1000);

        let block = BasicBlock::new(0x1000, 0x1008, vec![0x1000, 0x1004, 0x1008]);
        cfg.add_block(block);

        let tree = DominatorAnalyzer::analyze(&cfg);

        assert_eq!(tree.entry, Some(0x1000));
        // Entry has no idom
        assert!(tree.get_idom(0x1000).is_none());
    }

    #[test]
    fn test_linear_sequence() {
        // Create a linear CFG: A -> B -> C
        let mut cfg = ControlFlowGraph::new();
        cfg.entry_point = Some(0x1000);

        let mut block_a = BasicBlock::new(0x1000, 0x1000, vec![0x1000]);
        block_a.add_successor(0x2000);
        cfg.add_block(block_a);

        let mut block_b = BasicBlock::new(0x2000, 0x2000, vec![0x2000]);
        block_b.add_predecessor(0x1000);
        block_b.add_successor(0x3000);
        cfg.add_block(block_b);

        let mut block_c = BasicBlock::new(0x3000, 0x3000, vec![0x3000]);
        block_c.add_predecessor(0x2000);
        cfg.add_block(block_c);

        let tree = DominatorAnalyzer::analyze(&cfg);

        // A dominates itself (entry)
        assert!(tree.get_idom(0x1000).is_none());

        // B is dominated by A
        assert_eq!(tree.get_idom(0x2000), Some(0x1000));

        // C is dominated by B
        assert_eq!(tree.get_idom(0x3000), Some(0x2000));

        // Test dominates method
        assert!(tree.dominates(0x1000, 0x2000));
        assert!(tree.dominates(0x1000, 0x3000));
        assert!(tree.dominates(0x2000, 0x3000));
        assert!(!tree.dominates(0x2000, 0x1000));
    }

    #[test]
    fn test_diamond_cfg() {
        // Create diamond CFG:
        //     A
        //    / \
        //   B   C
        //    \ /
        //     D
        let mut cfg = ControlFlowGraph::new();
        cfg.entry_point = Some(0x1000);

        let mut block_a = BasicBlock::new(0x1000, 0x1000, vec![0x1000]);
        block_a.add_successor(0x2000);
        block_a.add_successor(0x3000);
        cfg.add_block(block_a);

        let mut block_b = BasicBlock::new(0x2000, 0x2000, vec![0x2000]);
        block_b.add_predecessor(0x1000);
        block_b.add_successor(0x4000);
        cfg.add_block(block_b);

        let mut block_c = BasicBlock::new(0x3000, 0x3000, vec![0x3000]);
        block_c.add_predecessor(0x1000);
        block_c.add_successor(0x4000);
        cfg.add_block(block_c);

        let mut block_d = BasicBlock::new(0x4000, 0x4000, vec![0x4000]);
        block_d.add_predecessor(0x2000);
        block_d.add_predecessor(0x3000);
        cfg.add_block(block_d);

        let tree = DominatorAnalyzer::analyze(&cfg);

        // A dominates everyone
        assert!(tree.dominates(0x1000, 0x2000));
        assert!(tree.dominates(0x1000, 0x3000));
        assert!(tree.dominates(0x1000, 0x4000));

        // B and C don't dominate each other
        assert!(!tree.dominates(0x2000, 0x3000));
        assert!(!tree.dominates(0x3000, 0x2000));

        // But A should be idom of both B, C, and D
        assert_eq!(tree.get_idom(0x2000), Some(0x1000));
        assert_eq!(tree.get_idom(0x3000), Some(0x1000));
        assert_eq!(tree.get_idom(0x4000), Some(0x1000));
    }

    #[test]
    fn test_loop_cfg() {
        // Create a simple loop:
        //   A -> B -> C
        //        ^    |
        //        |____|
        let mut cfg = ControlFlowGraph::new();
        cfg.entry_point = Some(0x1000);

        let mut block_a = BasicBlock::new(0x1000, 0x1000, vec![0x1000]);
        block_a.add_successor(0x2000);
        cfg.add_block(block_a);

        let mut block_b = BasicBlock::new(0x2000, 0x2000, vec![0x2000]);
        block_b.add_predecessor(0x1000);
        block_b.add_predecessor(0x3000); // Back edge
        block_b.add_successor(0x3000);
        cfg.add_block(block_b);

        let mut block_c = BasicBlock::new(0x3000, 0x3000, vec![0x3000]);
        block_c.add_predecessor(0x2000);
        block_c.add_successor(0x2000); // Back edge
        cfg.add_block(block_c);

        let tree = DominatorAnalyzer::analyze(&cfg);

        // A dominates B and C
        assert!(tree.dominates(0x1000, 0x2000));
        assert!(tree.dominates(0x1000, 0x3000));

        // B dominates C (loop header dominates body)
        assert!(tree.dominates(0x2000, 0x3000));

        // Immediate dominators
        assert_eq!(tree.get_idom(0x2000), Some(0x1000));
        assert_eq!(tree.get_idom(0x3000), Some(0x2000));
    }

    #[test]
    fn test_dominated_children() {
        let mut cfg = ControlFlowGraph::new();
        cfg.entry_point = Some(0x1000);

        let mut block_a = BasicBlock::new(0x1000, 0x1000, vec![0x1000]);
        block_a.add_successor(0x2000);
        block_a.add_successor(0x3000);
        cfg.add_block(block_a);

        let mut block_b = BasicBlock::new(0x2000, 0x2000, vec![0x2000]);
        block_b.add_predecessor(0x1000);
        cfg.add_block(block_b);

        let mut block_c = BasicBlock::new(0x3000, 0x3000, vec![0x3000]);
        block_c.add_predecessor(0x1000);
        cfg.add_block(block_c);

        let tree = DominatorAnalyzer::analyze(&cfg);

        // A should dominate both B and C
        let dominated = tree.get_dominated(0x1000);
        assert_eq!(dominated.len(), 2);
        assert!(dominated.contains(&0x2000));
        assert!(dominated.contains(&0x3000));
    }

    #[test]
    fn test_depth_calculation() {
        let mut cfg = ControlFlowGraph::new();
        cfg.entry_point = Some(0x1000);

        let mut block_a = BasicBlock::new(0x1000, 0x1000, vec![0x1000]);
        block_a.add_successor(0x2000);
        cfg.add_block(block_a);

        let mut block_b = BasicBlock::new(0x2000, 0x2000, vec![0x2000]);
        block_b.add_predecessor(0x1000);
        block_b.add_successor(0x3000);
        cfg.add_block(block_b);

        let mut block_c = BasicBlock::new(0x3000, 0x3000, vec![0x3000]);
        block_c.add_predecessor(0x2000);
        cfg.add_block(block_c);

        let tree = DominatorAnalyzer::analyze(&cfg);

        assert_eq!(tree.depth(0x1000), 0); // Entry
        assert_eq!(tree.depth(0x2000), 1); // One level deep
        assert_eq!(tree.depth(0x3000), 2); // Two levels deep
    }

    #[test]
    fn test_get_all_dominators() {
        let mut cfg = ControlFlowGraph::new();
        cfg.entry_point = Some(0x1000);

        let mut block_a = BasicBlock::new(0x1000, 0x1000, vec![0x1000]);
        block_a.add_successor(0x2000);
        cfg.add_block(block_a);

        let mut block_b = BasicBlock::new(0x2000, 0x2000, vec![0x2000]);
        block_b.add_predecessor(0x1000);
        block_b.add_successor(0x3000);
        cfg.add_block(block_b);

        let mut block_c = BasicBlock::new(0x3000, 0x3000, vec![0x3000]);
        block_c.add_predecessor(0x2000);
        cfg.add_block(block_c);

        let tree = DominatorAnalyzer::analyze(&cfg);

        let doms = tree.get_all_dominators(0x3000);
        assert_eq!(doms.len(), 2);
        assert!(doms.contains(&0x2000));
        assert!(doms.contains(&0x1000));
    }

    #[test]
    fn test_dominance_frontier() {
        // Diamond CFG for dominance frontier
        let mut cfg = ControlFlowGraph::new();
        cfg.entry_point = Some(0x1000);

        let mut block_a = BasicBlock::new(0x1000, 0x1000, vec![0x1000]);
        block_a.add_successor(0x2000);
        block_a.add_successor(0x3000);
        cfg.add_block(block_a);

        let mut block_b = BasicBlock::new(0x2000, 0x2000, vec![0x2000]);
        block_b.add_predecessor(0x1000);
        block_b.add_successor(0x4000);
        cfg.add_block(block_b);

        let mut block_c = BasicBlock::new(0x3000, 0x3000, vec![0x3000]);
        block_c.add_predecessor(0x1000);
        block_c.add_successor(0x4000);
        cfg.add_block(block_c);

        let mut block_d = BasicBlock::new(0x4000, 0x4000, vec![0x4000]);
        block_d.add_predecessor(0x2000);
        block_d.add_predecessor(0x3000);
        cfg.add_block(block_d);

        let tree = DominatorAnalyzer::analyze(&cfg);

        // Dominance frontier of B should be D (B dominates itself but not D)
        let frontier_b = DominatorAnalyzer::compute_dominance_frontier(&cfg, &tree, 0x2000);
        assert!(frontier_b.contains(&0x4000));

        // Dominance frontier of C should also be D
        let frontier_c = DominatorAnalyzer::compute_dominance_frontier(&cfg, &tree, 0x3000);
        assert!(frontier_c.contains(&0x4000));
    }
}
