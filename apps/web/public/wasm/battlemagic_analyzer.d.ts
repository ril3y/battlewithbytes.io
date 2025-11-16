/* tslint:disable */
/* eslint-disable */
/**
 * Initialize WASM module
 */
export function init(): void;
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

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_armanalyzer_free: (a: number, b: number) => void;
  readonly armanalyzer_analyze_from_bytes: (a: number, b: number, c: number, d: number) => void;
  readonly armanalyzer_analyze_from_disasm: (a: number, b: number, c: number) => void;
  readonly armanalyzer_get_xrefs_from: (a: number, b: number, c: number) => void;
  readonly armanalyzer_get_xrefs_to: (a: number, b: number, c: number) => void;
  readonly armanalyzer_is_analyzed: (a: number) => number;
  readonly armanalyzer_new: (a: number) => number;
  readonly armanalyzer_reset: (a: number) => void;
  readonly armanalyzer_xref_count: (a: number) => number;
  readonly detect_architecture_wasm: (a: number, b: number) => number;
  readonly get_supported_chips_wasm: () => number;
  readonly init: () => void;
  readonly is_architecture_supported_wasm: (a: number, b: number) => number;
  readonly __wbindgen_export: (a: number, b: number) => number;
  readonly __wbindgen_export2: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export3: (a: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
