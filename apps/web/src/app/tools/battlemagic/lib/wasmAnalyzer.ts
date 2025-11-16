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
  from: number;
  to: number;
  xref_type: XrefType;
  instruction: string;
}

export enum XrefType {
  Call = 0,
  Branch = 1,
  ConditionalBranch = 2,
  DataRead = 3,
  DataWrite = 4,
}

export interface AnalysisResults {
  xrefs: XrefResult[];
  total_xrefs: number;
  analyzed: boolean;
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

export interface ArmAnalyzerInstance {
  analyze_from_bytes(bytes: Uint8Array): AnalysisResults;
  analyze_from_disasm(disasmData: DisasmData): AnalysisResults;
  get_xrefs_to(address: number): XrefResult[];
  get_xrefs_from(address: number): XrefResult[];
  xref_count(): number;
  is_analyzed(): boolean;
  reset(): void;
  free(): void;
}

export interface WasmAnalyzerModule {
  ArmAnalyzer: ArmAnalyzerClass;
  XrefType: typeof XrefType;
  init(): void;
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

      // Dynamically import the WASM module
      // The battlemagic_analyzer.js loader expects the .wasm file to be at the same path
      const wasmImport = await import('/wasm/battlemagic_analyzer.js');

      // Initialize the WASM
      await wasmImport.default('/wasm/battlemagic_analyzer_bg.wasm');

      console.log('[WasmAnalyzer] WASM module initialized successfully');

      wasmModule = {
        ArmAnalyzer: wasmImport.ArmAnalyzer,
        XrefType: wasmImport.XrefType,
        init: wasmImport.init || (() => {}),
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
