/**
 * Control Flow Graph Types
 *
 * Core type definitions for control flow analysis and visualization
 */

import type { DisassembledInstruction } from '../arm/ArmDisassembler';

/**
 * Type of basic block based on its terminating instruction
 */
export enum BlockType {
  ENTRY = 'entry',               // Function entry point
  NORMAL = 'normal',             // Regular sequential code
  CONDITIONAL = 'conditional',   // Ends with conditional branch
  CALL = 'call',                 // Ends with function call
  RETURN = 'return',             // Ends with return instruction
  EXIT = 'exit',                 // Dead end (no successors)
  UNREACHABLE = 'unreachable'    // Unreachable code detected
}

/**
 * Type of edge connecting two basic blocks
 */
export enum EdgeType {
  UNCONDITIONAL = 'unconditional', // Direct jump or fall-through
  CONDITIONAL_TRUE = 'true',       // Branch taken
  CONDITIONAL_FALSE = 'false',     // Branch not taken (fall-through)
  CALL = 'call',                   // Function call
  RETURN = 'return'                // Return from function
}

/**
 * Edge connecting two basic blocks with metadata
 */
export interface CFGEdge {
  target: string;              // Target block ID
  type: EdgeType;              // Edge type
  condition?: string;          // Condition string (e.g., "Z==1", "N==0")
}

/**
 * A basic block - continuous sequence of instructions with single entry/exit
 *
 * Basic blocks are fundamental units of control flow:
 * - Single entry point (only first instruction can be jumped to)
 * - Single exit point (only last instruction can branch)
 * - No branches in the middle
 */
export interface BasicBlock {
  id: string;                     // Unique identifier (hex address)
  startAddress: number;           // First instruction address
  endAddress: number;             // Last instruction address (inclusive)
  instructions: DisassembledInstruction[];
  type: BlockType;                // Block classification

  // Graph connectivity
  predecessors: string[];         // IDs of blocks that jump here
  successors: string[];           // IDs of blocks this jumps to
  edges: CFGEdge[];               // Outgoing edges with metadata

  // Analysis metadata
  dominates?: string[];           // IDs of blocks this dominates
  postDominates?: string[];       // IDs of blocks this post-dominates
  loopHeader?: boolean;           // Is this a loop header?
  loopDepth?: number;             // Nesting level of loops
}

/**
 * Complete control flow graph for a function or code region
 */
export interface ControlFlowGraph {
  blocks: Map<string, BasicBlock>;  // All basic blocks indexed by ID
  entryBlock: string;               // Entry point block ID
  exitBlocks: string[];             // Exit block IDs (returns, dead ends)

  // Function metadata
  functionStart: number;            // Function start address
  functionEnd: number;              // Function end address

  // Analysis results
  metadata: {
    architecture: Architecture;
    totalInstructions: number;
    totalBlocks: number;
    cyclomaticComplexity: number;   // Measure of code complexity (E - N + 2)
    maxLoopDepth: number;            // Maximum nesting of loops
  };

  // Optional enhancements
  dominatorTree?: Map<string, string[]>;  // Dominator relationships
  loops?: Loop[];                         // Detected loops
}

/**
 * Loop structure detected in control flow
 */
export interface Loop {
  header: string;                  // Loop header block ID
  backedge: string;                // Block that jumps back to header
  blocks: Set<string>;             // All blocks in loop body
  depth: number;                   // Nesting depth (1 = outermost)
}

/**
 * Layout information for rendering a single block
 */
export interface BlockLayout {
  id: string;
  x: number;                       // Top-left X coordinate
  y: number;                       // Top-left Y coordinate
  width: number;
  height: number;
  level: number;                   // Hierarchical level (for layered layout)
}

/**
 * Layout information for rendering an edge
 */
export interface EdgeLayout {
  from: string;                    // Source block ID
  to: string;                      // Target block ID
  type: EdgeType;
  points: Point[];                 // Bezier control points
  color: string;                   // Rendering color
  isBackEdge?: boolean;            // Is this a loop back-edge?
}

/**
 * 2D point for layout coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Complete layout for CFG visualization
 */
export interface CFGLayout {
  blocks: Map<string, BlockLayout>;
  edges: EdgeLayout[];
  bounds: {
    width: number;
    height: number;
  };
}

/**
 * Options for layout computation
 */
export interface LayoutOptions {
  algorithm: 'hierarchical' | 'force-directed';
  blockWidth: number;
  blockHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  edgePadding?: number;
  compactLayout?: boolean;
}

/**
 * CPU architecture for architecture-specific analysis
 */
export type Architecture = 'ARM' | 'RISC-V' | 'MIPS' | 'x86' | 'x86-64';

/**
 * Options for basic block identification
 */
export interface BlockAnalysisOptions {
  architecture: Architecture;
  startAddress: number;
  maxInstructions?: number;        // Limit analysis size
  detectLoops?: boolean;           // Enable loop detection
  detectUnreachable?: boolean;     // Mark unreachable code
}

/**
 * Result of control flow analysis
 */
export interface CFGAnalysisResult {
  cfg: ControlFlowGraph;
  warnings: string[];              // Analysis warnings (e.g., unreachable code)
  errors: string[];                // Analysis errors
  statistics: {
    analysisTimeMs: number;
    blocksCreated: number;
    edgesCreated: number;
  };
}
