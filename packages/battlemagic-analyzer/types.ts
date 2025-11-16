/**
 * TypeScript type definitions for BattleMagic Binary Analyzer
 * Provides type-safe wrappers around the WASM module
 */

// Re-export the WASM types
export { BinaryAnalyzer, XrefType, init } from './pkg/battlemagic_analyzer';

/**
 * Disassembled instruction (input format)
 */
export interface DisassembledInstruction {
  address: number;
  bytes: number[];
  mnemonic: string;
  operands: string;
}

/**
 * Cross-reference between two addresses
 */
export interface CrossReference {
  from_addr: number;
  to_addr: number;
  xref_type: 'Call' | 'Branch' | 'ConditionalBranch' | 'DataRead' | 'DataWrite';
  instruction: string;
  operands: string;
}

/**
 * Complete analysis results
 */
export interface AnalysisResults {
  xrefs: CrossReference[];
  total_instructions: number;
  analysis_time_ms: number;
  unique_targets: number;
  start_address: number;
  end_address: number;
}

/**
 * Query result for xrefs to/from specific address
 */
export interface XrefQueryResult {
  address: number;
  xrefs: CrossReference[];
  count: number;
}

/**
 * Type-safe wrapper for BinaryAnalyzer with proper TypeScript types
 */
export interface TypedBinaryAnalyzer {
  /**
   * Analyze binary from disassembly data
   */
  analyze_from_disasm(disasm_data: DisassembledInstruction[]): AnalysisResults;

  /**
   * Get all cross-references TO a specific address
   */
  get_xrefs_to(address: number): XrefQueryResult;

  /**
   * Get all cross-references FROM a specific address
   */
  get_xrefs_from(address: number): XrefQueryResult;

  /**
   * Get total number of cross-references found
   */
  xref_count(): number;

  /**
   * Check if binary has been analyzed
   */
  is_analyzed(): boolean;

  /**
   * Reset analyzer state
   */
  reset(): void;

  /**
   * Free WASM resources
   */
  free(): void;
}
