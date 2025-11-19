/**
 * WASM Analyzer Loader
 *
 * Provides a centralized loader for the battlemagic-analyzer WASM module.
 * This module includes a complete ARM Thumb-2 decoder and cross-reference analyzer.
 *
 * Usage:
 *   const analyzer = await loadWasmAnalyzer();
 *   const instance = new analyzer.ArmAnalyzer(baseAddress);
 *   const results = instance.analyze_from_bytes(firmwareBytes);
 */

export interface XrefResult {
  from_addr: number;
  to_addr: number;
  xref_type: XrefType;
  instruction: string;
  operands: string;
}

export enum XrefType {
  Call = 0,
  Branch = 1,
  ConditionalBranch = 2,
  DataRead = 3,
  DataWrite = 4,
}

export enum LoopType {
  While = 0,
  DoWhile = 1,
  For = 2,
  Infinite = 3,
}

export interface Loop {
  header_addr: number;
  back_edge_addr: number;
  body_addrs: number[];
  loop_type: LoopType;
  nesting_level: number;
}

export interface StackVariable {
  function_start: number;
  offset: number;
  size: number;
  access_type: number; // StackAccessType enum
}

export interface ArgAnnotation {
  call_address: number;
  function_target: number;
  args: Array<[number, string]>; // (arg_number, location)
}

export interface FunctionInfo {
  start_address: number;
  end_address: number | null;
  name: string | null;
  stack_frame_size: number;
  stack_vars: StackVariable[];
  arg_annotations: ArgAnnotation[];
  callers: number[];
  callees: number[];
  complexity: number;
}

export interface VectorTableEntry {
  vector_number: number;
  handler_address: number;
  handler_name: string;
  is_valid: boolean;
}

export interface AnalysisResults {
  xrefs: XrefResult[];
  loops: Loop[];
  functions: FunctionInfo[];
  vector_table?: VectorTableEntry[];
  total_instructions: number;
  analysis_time_ms: number;
  unique_targets: number;
  start_address: number;
  end_address: number;
}

export interface ArmAnalyzerClass {
  new (baseAddress: number): ArmAnalyzerInstance;
}

export interface DisasmData {
  instructions: Array<{
    address: number;
    bytes: number[];
    mnemonic: string;
    operands: string;
  }>;
}

export type ProgressCallback = (stage: string, progress: number) => void;

export interface ArmAnalyzerInstance {
  analyze_from_bytes(bytes: Uint8Array): AnalysisResults;
  analyze_from_bytes_with_progress(
    bytes: Uint8Array,
    progressCallback?: ProgressCallback
  ): AnalysisResults;
  analyze_from_disasm(disasmData: DisasmData): AnalysisResults;
  get_xrefs_to(address: number): XrefResult[];
  get_xrefs_from(address: number): XrefResult[];
  get_vector_table(): VectorTableEntry[];
  xref_count(): number;
  is_analyzed(): boolean;
  reset(): void;
  free(): void;
}

export interface ArchitectureInfo {
  architecture: string;      // "ArmCortexM4"
  chip_name: string;         // "STM32F407"
  manufacturer: string;      // "STMicroelectronics"
  supported: boolean;        // true if decoder available
  confidence: number;        // 0.0-1.0 match confidence
  flash_base?: number;       // Optional flash base address from vector table
}

export interface WasmAnalyzerModule {
  ArmAnalyzer: ArmAnalyzerClass;
  XrefType: typeof XrefType;
  init(): void;
  detect_architecture_wasm(target_description: string): ArchitectureInfo;
  get_supported_chips_wasm(): ArchitectureInfo[];
  is_architecture_supported_wasm(arch_name: string): boolean;
}

let wasmModule: WasmAnalyzerModule | null = null;
let initPromise: Promise<WasmAnalyzerModule> | null = null;

/**
 * Load and initialize the WASM analyzer module
 *
 * This function handles:
 * - Loading the WASM file from /wasm/battlemagic_analyzer_bg.wasm
 * - Initializing the module
 * - Caching the result for subsequent calls
 *
 * @returns Promise that resolves to the initialized WASM module
 * @throws Error if WASM fails to load or initialize
 */
export async function loadWasmAnalyzer(): Promise<WasmAnalyzerModule> {
  // Return cached module if already loaded
  if (wasmModule) {
    return wasmModule;
  }

  // Return existing initialization promise if in progress
  if (initPromise) {
    return initPromise;
  }

  // Start new initialization
  initPromise = (async () => {
    try {
      console.log('[WasmAnalyzer] Loading WASM module from /wasm/battlemagic_analyzer_bg.wasm');

      // Import the glue code from local copy (same pattern as wasm-loader.ts)
      const glueModule = await import(
        /* webpackChunkName: "battlemagic-analyzer-glue" */
        /* webpackMode: "lazy" */
        './battlemagic_analyzer_bg.js'
      );

      // Fetch WASM from public directory
      const response = await fetch('/wasm/battlemagic_analyzer_bg.wasm');
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM: ${response.statusText}`);
      }
      const wasmBytes = await response.arrayBuffer();

      // Instantiate WASM with the glue code as imports
      // Note: glueModule contains enums and other exports that TypeScript doesn't recognize as valid WASM imports
      const result = await WebAssembly.instantiate(wasmBytes, {
        './battlemagic_analyzer_bg.js': glueModule as unknown as WebAssembly.ModuleImports,
        wbg: glueModule as unknown as WebAssembly.ModuleImports
      });

      // Set the WASM instance
      if (glueModule.__wbg_set_wasm) {
        glueModule.__wbg_set_wasm(result.instance.exports);
      }

      // Start the module if needed
      const startFn = result.instance.exports.__wbindgen_start;
      if (typeof startFn === 'function') {
        startFn();
      }

      console.log('[WasmAnalyzer] WASM module initialized successfully');

      wasmModule = {
        ArmAnalyzer: glueModule.ArmAnalyzer,
        XrefType: glueModule.XrefType || XrefType,
        init: glueModule.init || (() => {}),
        detect_architecture_wasm: glueModule.detect_architecture_wasm,
        get_supported_chips_wasm: glueModule.get_supported_chips_wasm,
        is_architecture_supported_wasm: glueModule.is_architecture_supported_wasm,
      };

      return wasmModule;
    } catch (error) {
      console.error('[WasmAnalyzer] Failed to load WASM:', error);
      initPromise = null;
      throw new Error(`Failed to load WASM analyzer: ${error instanceof Error ? error.message : String(error)}`);
    }
  })();

  return initPromise;
}

/**
 * Create a new analyzer instance
 *
 * Convenience function that loads the WASM module and creates an analyzer.
 *
 * @param baseAddress - Base address of the firmware/binary
 * @returns Promise that resolves to a new ArmAnalyzer instance
 */
export async function createAnalyzer(baseAddress: number): Promise<ArmAnalyzerInstance> {
  const wasmMod = await loadWasmAnalyzer();
  return new wasmMod.ArmAnalyzer(baseAddress);
}

/**
 * Check if WASM module is loaded
 */
export function isWasmLoaded(): boolean {
  return wasmModule !== null;
}

/**
 * Reset the WASM module cache (useful for testing)
 */
export function resetWasmCache(): void {
  wasmModule = null;
  initPromise = null;
}

/**
 * Detect target architecture from GDB target description
 *
 * Uses the TypeScript chip database instead of WASM for flexibility.
 * This allows users to add custom chips without recompiling WASM.
 *
 * @param targetDescription - Target description string from BMP scan (e.g., "STM32F407VG")
 * @returns Architecture info including support status and confidence
 */
export async function detectArchitecture(targetDescription: string): Promise<ArchitectureInfo> {
  // Use TypeScript chip database (supports custom chips)
  const { getChipDatabase } = await import('./chips/ChipDatabase');
  const chipDb = getChipDatabase();
  return chipDb.detectArchitecture(targetDescription);
}

/**
 * Get list of all supported chips
 *
 * @returns Array of all chips in the database with support status
 */
export async function getSupportedChips(): Promise<ArchitectureInfo[]> {
  const { getChipDatabase } = await import('./chips/ChipDatabase');
  const chipDb = getChipDatabase();
  await chipDb.ready();

  return chipDb.getAllChips()
    .filter(chip => chip.supported)
    .map(chip => ({
      architecture: chip.architecture,
      chip_name: chip.family,
      manufacturer: chip.manufacturer,
      supported: chip.supported,
      confidence: 1.0,
      architecture_name: chip.architecture,
      isa_family: chip.architecture.startsWith('ArmCortex') ? 'ARM' :
                  chip.architecture.startsWith('Mips') ? 'MIPS' :
                  chip.architecture.startsWith('RiscV') ? 'RISC-V' : 'Unknown',
      flash_base: parseInt(chip.flashBase, 16),
      flash_size: parseInt(chip.flashSize, 16),
      ram_base: parseInt(chip.ramBase, 16),
      ram_size: parseInt(chip.ramSize, 16),
      vector_table_offset: chip.vectorTableOffset,
    }));
}

/**
 * Check if a specific architecture is supported for analysis
 *
 * @param archName - Architecture name (e.g., "ArmCortexM4", "Mips32")
 * @returns True if we have a decoder for this architecture
 */
export async function isArchitectureSupported(archName: string): Promise<boolean> {
  // ARM Cortex-M architectures are supported
  const supported = [
    'ArmCortexM0',
    'ArmCortexM0Plus',
    'ArmCortexM3',
    'ArmCortexM4',
    'ArmCortexM7',
    'ArmCortexM23',
    'ArmCortexM33',
  ];

  return supported.includes(archName);
}
