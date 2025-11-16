/* tslint:disable */
/* eslint-disable */
/**
 * Initialize WASM module
 */
export function init(): void;
/**
 * Detect architecture from target description (WASM export)
 *
 * JavaScript-compatible wrapper for detect_architecture().
 *
 * # Arguments
 * * `target_description` - Target string from GDB/BMP
 *
 * # Returns
 * JsValue containing ArchitectureInfo serialized to JavaScript object
 *
 * # Example (JavaScript)
 * ```javascript
 * import { detect_architecture } from './battlemagic_analyzer';
 *
 * const info = detect_architecture("STM32F407VG");
 * console.log(info.architecture); // "ArmCortexM4"
 * console.log(info.manufacturer); // "STMicroelectronics"
 * console.log(info.confidence);   // 0.95
 * ```
 */
export function detect_architecture_wasm(target_description: string): any;
/**
 * Get list of all supported chips (WASM export)
 *
 * Returns array of all chip families with working decoders.
 *
 * # Returns
 * JsValue containing array of ArchitectureInfo objects
 *
 * # Example (JavaScript)
 * ```javascript
 * import { get_supported_chips } from './battlemagic_analyzer';
 *
 * const chips = get_supported_chips();
 * console.log(`Supported chips: ${chips.length}`);
 * chips.forEach(chip => {
 *   console.log(`${chip.chipName} - ${chip.manufacturer}`);
 * });
 * ```
 */
export function get_supported_chips_wasm(): any;
/**
 * Check if architecture name is supported (WASM export)
 *
 * Case-insensitive check against architecture names.
 *
 * # Arguments
 * * `arch_name` - Architecture name (e.g., "ArmCortexM4", "MIPS32")
 *
 * # Returns
 * true if architecture has a working decoder
 *
 * # Example (JavaScript)
 * ```javascript
 * import { is_architecture_supported } from './battlemagic_analyzer';
 *
 * console.log(is_architecture_supported("ArmCortexM4")); // true
 * console.log(is_architecture_supported("MIPS32"));      // false
 * ```
 */
export function is_architecture_supported_wasm(arch_name: string): boolean;
/**
 * Loop type classification
 */
export enum LoopType {
  /**
   * While loop (pre-test)
   */
  While = 0,
  /**
   * Do-while loop (post-test)
   */
  DoWhile = 1,
  /**
   * For loop (counter-based)
   */
  For = 2,
  /**
   * Infinite loop
   */
  Infinite = 3,
}
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
   * Add symbol at address
   */
  add_symbol(address: number, name: string, symbol_type_str: string): void;
  /**
   * Get symbol at address
   */
  get_symbol(address: number): any;
  /**
   * Get total number of cross-references found
   */
  xref_count(): number;
  /**
   * Add or update comment at address
   */
  add_comment(address: number, text: string, comment_type_str: string): void;
  /**
   * Get comment at address
   */
  get_comment(address: number): any;
  /**
   * Check if binary has been analyzed
   */
  is_analyzed(): boolean;
  /**
   * Get function at specific address
   */
  get_function(address: number): any;
  /**
   * Get project metadata
   */
  get_metadata(): any;
  /**
   * Get all cross-references TO a specific address
   */
  get_xrefs_to(address: number): any;
  /**
   * Set project metadata
   */
  set_metadata(metadata_js: any): void;
  /**
   * Initialize metadata with basic info
   */
  init_metadata(project_name: string, architecture: string, base_address: number, firmware_size: number): void;
  /**
   * Delete comment at address
   */
  delete_comment(address: number): void;
  /**
   * Get all cross-references FROM a specific address
   */
  get_xrefs_from(address: number): any;
  /**
   * Export complete analysis database as JSON string
   *
   * This serializes all analysis data (xrefs, functions, comments, etc.)
   * for storage in IndexedDB. Returns JSON string that can be saved.
   */
  export_database(): string;
  /**
   * Import analysis database from JSON string
   *
   * This loads a previously saved database and restores all analysis state.
   * Validates schema version and applies migrations if needed.
   */
  import_database(json: string): void;
  /**
   * Rename function (marks as user-defined)
   */
  rename_function(address: number, new_name: string): void;
  /**
   * Get all functions
   */
  get_all_functions(): any;
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
   * Get database statistics (for UI display)
   */
  get_database_stats(): any;
  /**
   * Analyze binary from disassembly data
   */
  analyze_from_disasm(disasm_data: any): any;
  /**
   * Analyze binary with progress callbacks
   *
   * Similar to analyze_from_bytes but accepts an optional JavaScript callback
   * function that will be called with progress updates during analysis.
   *
   * # Arguments
   * * `bytes` - Raw firmware bytes from GDB memory dump
   * * `progress_callback` - Optional JavaScript function(stage: string, progress: number)
   *
   * # Example
   * ```javascript
   * const analyzer = new ArmAnalyzer(0x8000);
   * const firmwareBytes = new Uint8Array([...]);
   * const results = analyzer.analyze_from_bytes_with_progress(
   *     firmwareBytes,
   *     (stage, progress) => {
   *         console.log(`${stage}: ${progress}%`);
   *     }
   * );
   * ```
   */
  analyze_from_bytes_with_progress(bytes: Uint8Array, progress_callback?: Function | null): any;
  /**
   * Create a new binary analyzer
   */
  constructor(base_address: number);
  /**
   * Reset analyzer state
   */
  reset(): void;
}
