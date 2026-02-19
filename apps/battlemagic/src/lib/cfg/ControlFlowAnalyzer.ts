/**
 * Control Flow Analyzer
 *
 * Builds complete control flow graphs from basic blocks.
 * Performs additional analysis like:
 * - Cyclomatic complexity calculation
 * - Loop detection
 * - Dominator tree construction
 * - Unreachable code detection
 */

import { BlockType } from "./types";
import type {
  BasicBlock,
  ControlFlowGraph,
  CFGAnalysisResult,
  BlockAnalysisOptions,
  Loop,
} from "./types";

export class ControlFlowAnalyzer {
  private options: BlockAnalysisOptions;

  constructor(options: BlockAnalysisOptions) {
    this.options = options;
  }

  /**
   * Build complete CFG from basic blocks with full analysis
   */
  buildCFG(blocks: BasicBlock[]): CFGAnalysisResult {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    if (blocks.length === 0) {
      errors.push("No basic blocks provided");
      return {
        cfg: this.createEmptyCFG(),
        warnings,
        errors,
        statistics: {
          analysisTimeMs: Date.now() - startTime,
          blocksCreated: 0,
          edgesCreated: 0,
        },
      };
    }

    // Build CFG structure
    const cfg = this.createCFG(blocks);

    // Detect unreachable blocks
    if (this.options.detectUnreachable) {
      const unreachable = this.detectUnreachableBlocks(cfg);
      if (unreachable.length > 0) {
        warnings.push(`Found ${unreachable.length} unreachable blocks`);
        unreachable.forEach((id) => {
          const block = cfg.blocks.get(id);
          if (block) {
            block.type = BlockType.UNREACHABLE;
          }
        });
      }
    }

    // Detect loops
    if (this.options.detectLoops) {
      cfg.loops = this.detectLoops(cfg);
      if (cfg.loops.length > 0) {
        cfg.metadata.maxLoopDepth = Math.max(...cfg.loops.map((l) => l.depth));
      }
    }

    // Calculate cyclomatic complexity: E - N + 2P
    // E = edges, N = nodes, P = connected components (usually 1)
    cfg.metadata.cyclomaticComplexity = this.calculateCyclomaticComplexity(cfg);

    const analysisTimeMs = Date.now() - startTime;

    return {
      cfg,
      warnings,
      errors,
      statistics: {
        analysisTimeMs,
        blocksCreated: blocks.length,
        edgesCreated: this.countEdges(cfg),
      },
    };
  }

  /**
   * Create CFG structure from blocks
   */
  private createCFG(blocks: BasicBlock[]): ControlFlowGraph {
    const blockMap = new Map<string, BasicBlock>();
    const exitBlocks: string[] = [];

    // Add all blocks to map
    for (const block of blocks) {
      blockMap.set(block.id, block);

      // Identify exit blocks (no successors or return blocks)
      if (block.successors.length === 0 || block.type === BlockType.RETURN) {
        exitBlocks.push(block.id);
      }
    }

    const firstBlock = blocks[0];
    const lastBlock = blocks[blocks.length - 1];

    return {
      blocks: blockMap,
      entryBlock: firstBlock.id,
      exitBlocks,
      functionStart: firstBlock.startAddress,
      functionEnd: lastBlock.endAddress,
      metadata: {
        architecture: this.options.architecture,
        totalInstructions: blocks.reduce(
          (sum, b) => sum + b.instructions.length,
          0,
        ),
        totalBlocks: blocks.length,
        cyclomaticComplexity: 1, // Will be calculated
        maxLoopDepth: 0, // Will be calculated if loops detected
      },
    };
  }

  /**
   * Create empty CFG for error cases
   */
  private createEmptyCFG(): ControlFlowGraph {
    return {
      blocks: new Map(),
      entryBlock: "",
      exitBlocks: [],
      functionStart: 0,
      functionEnd: 0,
      metadata: {
        architecture: this.options.architecture,
        totalInstructions: 0,
        totalBlocks: 0,
        cyclomaticComplexity: 0,
        maxLoopDepth: 0,
      },
    };
  }

  /**
   * Detect unreachable blocks using depth-first search
   */
  private detectUnreachableBlocks(cfg: ControlFlowGraph): string[] {
    const reachable = new Set<string>();
    const visited = new Set<string>();

    // DFS from entry block
    const dfs = (blockId: string) => {
      if (visited.has(blockId)) return;
      visited.add(blockId);
      reachable.add(blockId);

      const block = cfg.blocks.get(blockId);
      if (!block) return;

      for (const successorId of block.successors) {
        dfs(successorId);
      }
    };

    dfs(cfg.entryBlock);

    // Find unreachable blocks
    const unreachable: string[] = [];
    for (const [blockId] of cfg.blocks) {
      if (!reachable.has(blockId)) {
        unreachable.push(blockId);
      }
    }

    return unreachable;
  }

  /**
   * Detect loops using back-edge detection
   *
   * A back-edge is an edge whose target dominates its source.
   * This indicates a loop structure.
   */
  private detectLoops(cfg: ControlFlowGraph): Loop[] {
    const loops: Loop[] = [];
    const visited = new Set<string>();
    const inStack = new Set<string>();

    // DFS to find back edges
    const dfs = (blockId: string, path: string[]): void => {
      if (visited.has(blockId)) {
        // Found a back edge if block is in current path
        if (inStack.has(blockId)) {
          const loop = this.extractLoop(
            blockId,
            path[path.length - 1],
            path,
            cfg,
          );
          if (loop) {
            loops.push(loop);
          }
        }
        return;
      }

      visited.add(blockId);
      inStack.add(blockId);
      path.push(blockId);

      const block = cfg.blocks.get(blockId);
      if (block) {
        for (const successorId of block.successors) {
          dfs(successorId, [...path]);
        }
      }

      inStack.delete(blockId);
    };

    dfs(cfg.entryBlock, []);

    // Assign loop depths
    this.assignLoopDepths(loops);

    return loops;
  }

  /**
   * Extract loop structure from back edge
   */
  private extractLoop(
    header: string,
    backedge: string,
    path: string[],
    _cfg: ControlFlowGraph,
  ): Loop | null {
    // Find all blocks in loop body
    const headerIndex = path.indexOf(header);
    if (headerIndex === -1) return null;

    const loopBlocks = new Set<string>(path.slice(headerIndex));

    return {
      header,
      backedge,
      blocks: loopBlocks,
      depth: 1, // Will be calculated later
    };
  }

  /**
   * Assign nesting depths to loops
   */
  private assignLoopDepths(loops: Loop[]): void {
    // Sort loops by size (smaller loops are more nested)
    loops.sort((a, b) => a.blocks.size - b.blocks.size);

    for (let i = 0; i < loops.length; i++) {
      const loop = loops[i];
      let maxParentDepth = 0;

      // Find parent loops (loops that contain this loop)
      for (let j = i + 1; j < loops.length; j++) {
        const parentLoop = loops[j];
        if (parentLoop.blocks.has(loop.header)) {
          maxParentDepth = Math.max(maxParentDepth, parentLoop.depth);
        }
      }

      loop.depth = maxParentDepth + 1;
    }
  }

  /**
   * Calculate cyclomatic complexity
   *
   * Formula: M = E - N + 2P
   * Where:
   * - E = number of edges
   * - N = number of nodes
   * - P = number of connected components (usually 1)
   */
  private calculateCyclomaticComplexity(cfg: ControlFlowGraph): number {
    const E = this.countEdges(cfg);
    const N = cfg.blocks.size;
    const P = 1; // Assuming single connected component

    return E - N + 2 * P;
  }

  /**
   * Count total edges in CFG
   */
  private countEdges(cfg: ControlFlowGraph): number {
    let count = 0;
    for (const [, block] of cfg.blocks) {
      count += block.successors.length;
    }
    return count;
  }

  /**
   * Build dominator tree (optional advanced analysis)
   *
   * A block A dominates block B if all paths from entry to B go through A.
   * This is useful for advanced optimizations and understanding control flow.
   */
  buildDominatorTree(cfg: ControlFlowGraph): Map<string, string[]> {
    const dominators = new Map<string, Set<string>>();

    // Initialize: entry dominates itself, all others dominated by everyone
    const allBlocks = new Set(cfg.blocks.keys());
    dominators.set(cfg.entryBlock, new Set([cfg.entryBlock]));

    for (const [blockId] of cfg.blocks) {
      if (blockId !== cfg.entryBlock) {
        dominators.set(blockId, new Set(allBlocks));
      }
    }

    // Iterative algorithm
    let changed = true;
    while (changed) {
      changed = false;

      for (const [blockId, block] of cfg.blocks) {
        if (blockId === cfg.entryBlock) continue;

        // New dominators = {block} ∪ (∩ dominators of predecessors)
        const newDominators = new Set([blockId]);

        if (block.predecessors.length > 0) {
          // Start with first predecessor's dominators
          const firstPred = dominators.get(block.predecessors[0]);
          if (firstPred) {
            for (const dom of firstPred) {
              newDominators.add(dom);
            }
          }

          // Intersect with other predecessors
          for (let i = 1; i < block.predecessors.length; i++) {
            const predDom = dominators.get(block.predecessors[i]);
            if (!predDom) continue;

            // Remove dominators not in this predecessor
            for (const dom of newDominators) {
              if (!predDom.has(dom) && dom !== blockId) {
                newDominators.delete(dom);
              }
            }
          }
        }

        // Check if changed
        const oldDominators = dominators.get(blockId)!;
        if (
          newDominators.size !== oldDominators.size ||
          ![...newDominators].every((d) => oldDominators.has(d))
        ) {
          dominators.set(blockId, newDominators);
          changed = true;
        }
      }
    }

    // Convert to array map
    const dominatorTree = new Map<string, string[]>();
    for (const [blockId, doms] of dominators) {
      dominatorTree.set(blockId, Array.from(doms));
    }

    return dominatorTree;
  }
}
