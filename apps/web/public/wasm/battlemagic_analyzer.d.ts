/* tslint:disable */
/* eslint-disable */
/**
 * Initialize WASM module
 */
export function init(): void;
/**
 * Type of cross-reference
 */
export enum XrefType {
  /**
   * Function call - bl, blx
   */
  Call = 0,
  /**
   * Unconditional branch - b
   */
  Branch = 1,
  /**
   * Conditional branch - b.eq, b.ne, etc.
   */
  ConditionalBranch = 2,
  /**
   * Data read reference - ldr
   */
  DataRead = 3,
  /**
   * Data write reference - str
   */
  DataWrite = 4,
}
/**
 * Main binary analyzer that builds cross-reference database
 */
export class ArmAnalyzer {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get total number of cross-references found
   */
  xref_count(): number;
  /**
   * Check if binary has been analyzed
   */
  is_analyzed(): boolean;
  /**
   * Get all cross-references TO a specific address
   */
  get_xrefs_to(address: number): any;
  /**
   * Get all cross-references FROM a specific address
   */
  get_xrefs_from(address: number): any;
  /**
   * Analyze binary directly from raw bytes (eliminates Capstone.js dependency)
   *
   * This method decodes raw firmware bytes using the built-in ARM Thumb-2 decoder
   * and performs cross-reference analysis.
   *
   * # Arguments
   * * `bytes` - Raw firmware bytes from GDB memory dump
   *
   * # Returns
   * Analysis results containing all cross-references found
   *
   * # Example
   * ```javascript
   * const analyzer = new ArmAnalyzer(0x8000);
   * const firmwareBytes = new Uint8Array([...]);
   * const results = analyzer.analyze_from_bytes(firmwareBytes);
   * ```
   */
  analyze_from_bytes(bytes: Uint8Array): any;
  /**
   * Analyze binary from disassembly data
   */
  analyze_from_disasm(disasm_data: any): any;
  /**
   * Create a new binary analyzer
   */
  constructor(base_address: number);
  /**
   * Reset analyzer state
   */
  reset(): void;
}
