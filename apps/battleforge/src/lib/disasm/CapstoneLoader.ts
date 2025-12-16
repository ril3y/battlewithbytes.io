/**
 * Capstone WASM Loader
 *
 * Loads and manages the Capstone disassembler WASM module.
 * Provides a clean interface for disassembling ARM/Thumb/RISC-V code.
 */

import { WasmManager } from "../wasm";
import type {
  CapstoneInstance,
  CapstoneLoadOptions,
  DisassembledInstruction,
  CapstoneArch,
  DisassemblerFactory,
} from "./types";
import { CapstoneArmMode } from "./types";

// Module-level state
let capstoneWasm: CapstoneModule | null = null;
let loadPromise: Promise<CapstoneModule> | null = null;

// Type for the Capstone module factory
type CapstoneModuleFactory = (options: Record<string, unknown>) => Promise<CapstoneModule>;

/**
 * Load the Capstone JS file and extract the module factory
 * The JS file defines CapstoneModule as a global factory function
 */
async function loadCapstoneScript(jsPath: string): Promise<CapstoneModuleFactory> {
  // Check if already loaded globally
  if (typeof (globalThis as { CapstoneModule?: CapstoneModuleFactory }).CapstoneModule === "function") {
    return (globalThis as { CapstoneModule: CapstoneModuleFactory }).CapstoneModule;
  }

  // Fetch the JS code
  const response = await fetch(jsPath);
  if (!response.ok) {
    throw new Error(`Failed to load Capstone JS: ${response.statusText}`);
  }

  const jsCode = await response.text();

  // Execute the JS code to define CapstoneModule
  // The file structure is: var CapstoneModule = (() => { ... return factory; })();
  // We need to execute it and capture CapstoneModule
  const executeModule = new Function(`
    ${jsCode}
    return typeof CapstoneModule !== 'undefined' ? CapstoneModule : null;
  `);

  const factory = executeModule() as CapstoneModuleFactory | null;

  if (typeof factory !== "function") {
    throw new Error("Failed to load Capstone: CapstoneModule is not a function");
  }

  // Store globally for reuse
  (globalThis as { CapstoneModule?: CapstoneModuleFactory }).CapstoneModule = factory;

  return factory;
}

/**
 * Internal Capstone module interface (from capstone.js wrapper)
 * This uses a JavaScript wrapper API, not raw Emscripten exports
 */
interface CapstoneModule {
  // Core API (JS wrapper functions)
  _cs_open_js(arch: number, mode: number, handlePtr: number): number;
  _cs_close_js(handlePtr: number): number;
  _cs_option_js(handle: number, type: number, value: number): number;
  _cs_disasm_js(
    handle: number,
    codePtr: number,
    codeSize: number,
    addressLo: number,
    addressHi: number,
    count: number
  ): number;
  _cs_free_js(): void;
  _cs_strerror_js(code: number): number;
  _cs_version_js(majorPtr: number, minorPtr: number): number;

  // Instruction accessors (by index after disasm)
  _cs_insn_address(idx: number): number;
  _cs_insn_size(idx: number): number;
  _cs_insn_mnemonic(idx: number): number;
  _cs_insn_op_str(idx: number): number;
  _cs_insn_bytes(idx: number): number;
  _cs_insn_id(idx: number): number;

  // Memory management
  _malloc(size: number): number;
  _free(ptr: number): void;

  // Emscripten runtime
  HEAPU8: Uint8Array;
  HEAP32: Int32Array;
  HEAPU32: Uint32Array;
  UTF8ToString(ptr: number): string;
  getValue(ptr: number, type: string): number;
  setValue(ptr: number, value: number, type: string): void;
}

/**
 * Load the Capstone WASM module
 */
export async function loadCapstoneModule(
  options?: CapstoneLoadOptions
): Promise<CapstoneModule> {
  // Return cached module if available
  if (capstoneWasm) {
    return capstoneWasm;
  }

  // Deduplicate concurrent loads
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      // Get manifest info for capstone-arm
      const disassemblers = await WasmManager.getAvailableDisassemblers();
      const capstoneInfo = disassemblers.find((d) => d.id === "capstone-arm");

      if (!capstoneInfo) {
        throw new Error("Capstone ARM disassembler not found in manifest");
      }

      // Determine paths
      const baseUrl = await WasmManager.getBaseUrl();
      const jsPath = options?.jsPath || `${baseUrl}/${capstoneInfo.files.js}`;
      const wasmPath =
        options?.wasmPath ||
        `${baseUrl}/${capstoneInfo.files.wasmGz || capstoneInfo.files.wasm}`;

      options?.onProgress?.({
        loaded: 0,
        total: capstoneInfo.size,
        message: "Loading Capstone disassembler...",
      });

      // Load the JS module via script injection
      // The Capstone JS file defines CapstoneModule as a factory function
      const moduleFactory = await loadCapstoneScript(jsPath);

      // Load WASM
      const wasmResponse = await fetch(wasmPath);
      if (!wasmResponse.ok) {
        throw new Error(`Failed to load Capstone WASM: ${wasmResponse.statusText}`);
      }

      let wasmBinary: ArrayBuffer;
      if (wasmPath.endsWith(".gz")) {
        // Decompress gzipped WASM
        const compressedData = await wasmResponse.arrayBuffer();
        const decompressedStream = new Response(compressedData).body!.pipeThrough(
          new DecompressionStream("gzip")
        );
        wasmBinary = await new Response(decompressedStream).arrayBuffer();
      } else {
        wasmBinary = await wasmResponse.arrayBuffer();
      }

      options?.onProgress?.({
        loaded: wasmBinary.byteLength,
        total: wasmBinary.byteLength,
        message: "Initializing Capstone...",
      });

      // Initialize the module
      const wasmModule = await moduleFactory({
        wasmBinary,
        noInitialRun: true,
        print: (text: string) => console.log("[Capstone]", text),
        printErr: (text: string) => console.error("[Capstone]", text),
      });

      capstoneWasm = wasmModule;

      options?.onProgress?.({
        loaded: wasmBinary.byteLength,
        total: wasmBinary.byteLength,
        message: "Capstone ready",
      });

      return wasmModule;
    } catch (error) {
      loadPromise = null;
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Create a Capstone disassembler instance
 * Uses the capstone.js wrapper API
 */
export async function createCapstoneInstance(
  options?: CapstoneLoadOptions
): Promise<CapstoneInstance> {
  const csModule = await loadCapstoneModule(options);

  // Allocate handle storage
  const handlePtr = csModule._malloc(4);
  let handle = 0;

  const instance: CapstoneInstance = {
    open(arch: CapstoneArch, mode: number): void {
      if (handle !== 0) {
        this.close();
      }

      const err = csModule._cs_open_js(arch, mode, handlePtr);
      if (err !== 0) {
        const errMsgPtr = csModule._cs_strerror_js(err);
        const errMsg = csModule.UTF8ToString(errMsgPtr);
        throw new Error(`Failed to open Capstone: ${errMsg}`);
      }

      handle = csModule.getValue(handlePtr, "i32");
    },

    close(): void {
      if (handle !== 0) {
        csModule._cs_close_js(handlePtr);
        handle = 0;
      }
    },

    disassemble(
      code: Uint8Array,
      address: number,
      count: number = 0
    ): DisassembledInstruction[] {
      if (handle === 0) {
        throw new Error("Capstone not initialized. Call open() first.");
      }

      // Allocate code buffer
      const codePtr = csModule._malloc(code.length);
      csModule.HEAPU8.set(code, codePtr);

      const instructions: DisassembledInstruction[] = [];

      try {
        // Split 64-bit address into low and high 32-bit parts
        const addressLo = address >>> 0; // Lower 32 bits
        const addressHi = Math.floor(address / 0x100000000) >>> 0; // Upper 32 bits

        const numInsns = csModule._cs_disasm_js(
          handle,
          codePtr,
          code.length,
          addressLo,
          addressHi,
          count
        );

        if (numInsns > 0) {
          // Use the JS wrapper accessor functions to get instruction data
          for (let i = 0; i < numInsns; i++) {
            const insnAddress = csModule._cs_insn_address(i);
            const size = csModule._cs_insn_size(i);
            const id = csModule._cs_insn_id(i);

            // Get mnemonic string
            const mnemonicPtr = csModule._cs_insn_mnemonic(i);
            const mnemonic = csModule.UTF8ToString(mnemonicPtr);

            // Get operand string
            const opStrPtr = csModule._cs_insn_op_str(i);
            const opStr = csModule.UTF8ToString(opStrPtr);

            // Get bytes
            const bytesPtr = csModule._cs_insn_bytes(i);
            const bytes = new Uint8Array(size);
            for (let j = 0; j < size; j++) {
              bytes[j] = csModule.HEAPU8[bytesPtr + j];
            }

            instructions.push({
              address: insnAddress,
              bytes,
              mnemonic,
              opStr,
              size,
              id,
            });
          }

          // Free the instruction array (no arguments in JS wrapper)
          csModule._cs_free_js();
        }
      } finally {
        csModule._free(codePtr);
      }

      return instructions;
    },

    getError(): string | null {
      // JS wrapper doesn't expose cs_errno directly
      return null;
    },

    getVersion(): string {
      const majorPtr = csModule._malloc(4);
      const minorPtr = csModule._malloc(4);
      csModule._cs_version_js(majorPtr, minorPtr);
      const major = csModule.getValue(majorPtr, "i32");
      const minor = csModule.getValue(minorPtr, "i32");
      csModule._free(majorPtr);
      csModule._free(minorPtr);
      return `${major}.${minor}`;
    },

    dispose(): void {
      this.close();
      csModule._free(handlePtr);
    },
  };

  // Open with initial arch/mode if provided
  if (options?.arch !== undefined) {
    instance.open(options.arch, options.mode || 0);
  }

  return instance;
}

/**
 * Create a disassembler factory for common architectures
 */
export async function createDisassemblerFactory(
  options?: CapstoneLoadOptions
): Promise<DisassemblerFactory> {
  const csModule = await loadCapstoneModule(options);

  const createInstance = (arch: CapstoneArch, mode: number): CapstoneInstance => {
    // Inline implementation without async
    const handlePtr = csModule._malloc(4);
    let handle = 0;

    const instance: CapstoneInstance = {
      open(a: CapstoneArch, m: number): void {
        if (handle !== 0) {
          this.close();
        }
        const err = csModule._cs_open(a, m, handlePtr);
        if (err !== 0) {
          throw new Error(`Failed to open Capstone: ${csModule.UTF8ToString(csModule._cs_strerror(err))}`);
        }
        handle = csModule.HEAP32[handlePtr / 4];
      },

      close(): void {
        if (handle !== 0) {
          csModule._cs_close(handlePtr);
          handle = 0;
        }
      },

      disassemble(code: Uint8Array, address: number, count = 0): DisassembledInstruction[] {
        if (handle === 0) throw new Error("Capstone not initialized");

        const codePtr = csModule._malloc(code.length);
        csModule.HEAPU8.set(code, codePtr);
        const insnPtrPtr = csModule._malloc(4);
        const instructions: DisassembledInstruction[] = [];

        try {
          const numInsns = csModule._cs_disasm(
            handle, codePtr, code.length, BigInt(address), count, insnPtrPtr
          );

          if (numInsns > 0) {
            const insnPtr = csModule.HEAPU32[insnPtrPtr / 4];
            const INSN_SIZE = 240;

            for (let i = 0; i < numInsns; i++) {
              const base = insnPtr + i * INSN_SIZE;
              const id = csModule.HEAPU32[base / 4];
              const addrLow = csModule.HEAPU32[(base + 8) / 4];
              const size = csModule.HEAPU8[base + 16] | (csModule.HEAPU8[base + 17] << 8);
              const bytes = new Uint8Array(size);
              for (let j = 0; j < size && j < 24; j++) {
                bytes[j] = csModule.HEAPU8[base + 18 + j];
              }
              let mnemonic = "";
              for (let j = 0; j < 32; j++) {
                const c = csModule.HEAPU8[base + 42 + j];
                if (c === 0) break;
                mnemonic += String.fromCharCode(c);
              }
              let opStr = "";
              for (let j = 0; j < 160; j++) {
                const c = csModule.HEAPU8[base + 74 + j];
                if (c === 0) break;
                opStr += String.fromCharCode(c);
              }
              instructions.push({ address: addrLow, bytes, mnemonic, opStr, size, id });
            }
            csModule._cs_free(insnPtr, numInsns);
          }
        } finally {
          csModule._free(codePtr);
          csModule._free(insnPtrPtr);
        }

        return instructions;
      },

      getError(): string | null {
        if (handle === 0) return null;
        const err = csModule._cs_errno(handle);
        return err === 0 ? null : csModule.UTF8ToString(csModule._cs_strerror(err));
      },

      getVersion(): string {
        const majorPtr = csModule._malloc(4);
        const minorPtr = csModule._malloc(4);
        csModule._cs_version(majorPtr, minorPtr);
        const major = csModule.HEAP32[majorPtr / 4];
        const minor = csModule.HEAP32[minorPtr / 4];
        csModule._free(majorPtr);
        csModule._free(minorPtr);
        return `${major}.${minor}`;
      },

      dispose(): void {
        this.close();
        csModule._free(handlePtr);
      },
    };

    instance.open(arch, mode);
    return instance;
  };

  return {
    createArmThumb(): CapstoneInstance {
      return createInstance(0, CapstoneArmMode.THUMB | CapstoneArmMode.MCLASS);
    },
    createArm(): CapstoneInstance {
      return createInstance(0, CapstoneArmMode.ARM);
    },
    createRiscv32(): CapstoneInstance {
      return createInstance(15, 1); // RISCV arch, RISCV32 mode
    },
  };
}

/**
 * Check if Capstone is loaded
 */
export function isCapstoneLoaded(): boolean {
  return capstoneWasm !== null;
}

/**
 * Unload Capstone module (for cleanup)
 */
export function unloadCapstone(): void {
  capstoneWasm = null;
  loadPromise = null;
}
