//! Optimized Dominator Tree Construction
//!
//! Uses the Cooper-Harvey-Kennedy algorithm with reverse postorder for fast convergence.
//! This version stores only immediate dominators (not full sets) for O(n) space complexity.

use super::basic_blocks::ControlFlowGraph;
use std::collections::{HashMap, HashSet};

/// Dominator tree representation
#[derive(Debug, Clone)]
pub struct DominatorTree {
    /// Immediate dominator map: node → its immediate dominator
    pub idom: HashMap<u32, u32>,

    /// Children in dominator tree: node → nodes it immediately dominates
    pub children: HashMap<u32, Vec<u32>>,

    /// Entry point of the CFG
    pub entry: Option<u32>,
}

impl DominatorTree {
    /// Create empty dominator tree
    pub fn new() -> Self {
        Self {
            idom: HashMap::new(),
            children: HashMap::new(),
            entry: None,
        }
    }

    /// Check if node A dominates node B
    pub fn dominates(&self, a: u32, b: u32) -> bool {
        if a == b {
            return true;
        }

        let mut current = b;
        let mut visited = HashSet::new();

        while let Some(&dom) = self.idom.get(&current) {
            if dom == a {
                return true;
            }
            if !visited.insert(current) {
                break; // Cycle detected
            }
            current = dom;
        }

        false
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
    /// Optimized Cooper-Harvey-Kennedy algorithm using reverse postorder
    ///
    /// Key optimizations:
    /// 1. Stores only immediate dominators (O(n) space vs O(n²))
    /// 2. Processes nodes in reverse postorder (fast convergence)
    /// 3. Uses intersect operation instead of set intersection
    ///
    /// # Time Complexity
    /// O(E * d) where E is edges and d is average depth
    /// Typically O(E log V) for reducible graphs, converges in 1-2 iterations
    pub fn analyze(cfg: &ControlFlowGraph) -> DominatorTree {
        if cfg.blocks.is_empty() {
            return DominatorTree::new();
        }

        let entry = match cfg.entry_point {
            Some(e) => e,
            None => return DominatorTree::new(),
        };

        // Step 1: Compute reverse postorder via DFS
        let postorder = Self::compute_postorder_dfs(cfg, entry);

        // Create postorder number mapping for fast comparison
        let mut postorder_num: HashMap<u32, usize> = HashMap::new();
        for (num, &addr) in postorder.iter().enumerate() {
            postorder_num.insert(addr, num);
        }

        // Step 2: Initialize immediate dominators
        let mut idom: HashMap<u32, u32> = HashMap::new();
        idom.insert(entry, entry);

        // Step 3: Iteratively compute idoms in reverse postorder
        let mut changed = true;
        let mut iteration = 0;
        const MAX_ITERATIONS: usize = 100; // Usually converges in 1-2

        while changed && iteration < MAX_ITERATIONS {
            changed = false;
            iteration += 1;

            // Process in reverse postorder
            for &node in postorder.iter().rev() {
                if node == entry {
                    continue;
                }

                let block = match cfg.get_block(node) {
                    Some(b) => b,
                    None => continue,
                };

                if block.predecessors.is_empty() {
                    continue;
                }

                // Find new idom = intersect of all processed predecessors' idoms
                let mut new_idom: Option<u32> = None;

                for &pred in &block.predecessors {
                    if !idom.contains_key(&pred) {
                        continue; // Skip unprocessed predecessors
                    }

                    new_idom = match new_idom {
                        None => Some(pred),
                        Some(current) => Some(Self::intersect(&idom, &postorder_num, current, pred)),
                    };
                }

                // Update if changed
                if let Some(new) = new_idom {
                    if idom.get(&node) != Some(&new) {
                        idom.insert(node, new);
                        changed = true;
                    }
                }
            }
        }

        // Step 4: Build tree structure
        Self::build_tree_from_idom(&idom, entry)
    }

    /// Compute postorder numbering via DFS
    fn compute_postorder_dfs(cfg: &ControlFlowGraph, entry: u32) -> Vec<u32> {
        let mut postorder = Vec::new();
        let mut visited = HashSet::new();

        Self::dfs_postorder(cfg, entry, &mut visited, &mut postorder);

        postorder
    }

    /// DFS helper for postorder traversal
    fn dfs_postorder(
        cfg: &ControlFlowGraph,
        node: u32,
        visited: &mut HashSet<u32>,
        postorder: &mut Vec<u32>,
    ) {
        if !visited.insert(node) {
            return;
        }

        // Visit successors first
        if let Some(block) = cfg.get_block(node) {
            for &succ in &block.successors {
                Self::dfs_postorder(cfg, succ, visited, postorder);
            }
        }

        // Add to postorder after children
        postorder.push(node);
    }

    /// Find intersection point in dominator tree (lowest common ancestor)
    fn intersect(
        idom: &HashMap<u32, u32>,
        postorder_num: &HashMap<u32, usize>,
        mut finger1: u32,
        mut finger2: u32,
    ) -> u32 {
        while finger1 != finger2 {
            while postorder_num.get(&finger1).copied().unwrap_or(0)
                < postorder_num.get(&finger2).copied().unwrap_or(0)
            {
                finger1 = *idom.get(&finger1).unwrap_or(&finger1);
            }
            while postorder_num.get(&finger2).copied().unwrap_or(0)
                < postorder_num.get(&finger1).copied().unwrap_or(0)
            {
                finger2 = *idom.get(&finger2).unwrap_or(&finger2);
            }
        }
        finger1
    }

    /// Build tree structure from idom map
    fn build_tree_from_idom(idom: &HashMap<u32, u32>, entry: u32) -> DominatorTree {
        let mut tree = DominatorTree::new();
        tree.entry = Some(entry);
        tree.idom = idom.clone();

        // Build children map
        for (&node, &dom) in idom {
            if node != dom {
                tree.children.entry(dom).or_insert_with(Vec::new).push(node);
            }
        }

        tree
    }
}
