/**
 * Unicorn WASM Loader
 *
 * Loads and manages the Unicorn CPU emulator WASM ucModule.
 * Provides a clean interface for emulating ARM Cortex-M code.
 */

import { WasmManager } from "../wasm";
import type {
  UnicornInstance,
  UnicornLoadOptions,
  CortexMConfig,
  CodeHookCallback,
  MemoryHookCallback,
  InterruptHookCallback,
  CpuState,
  EmulationResult,
} from "./types";
import {
  UnicornArch,
  UnicornArmMode,
  UnicornPerm,
  UnicornHookType,
  ArmReg,
} from "./types";

// Module-level state
let unicornWasm: UnicornModule | null = null;
let loadPromise: Promise<UnicornModule> | null = null;

/**
 * Internal Unicorn module interface (from Emscripten)
 */
interface UnicornModule {
  _uc_open(arch: number, mode: number, ucPtr: number): number;
  _uc_close(uc: number): number;
  _uc_mem_map(uc: number, address: bigint, size: number, perms: number): number;
  _uc_mem_unmap(uc: number, address: bigint, size: number): number;
  _uc_mem_write(uc: number, address: bigint, data: number, size: number): number;
  _uc_mem_read(uc: number, address: bigint, data: number, size: number): number;
  _uc_reg_write(uc: number, regId: number, value: number): number;
  _uc_reg_read(uc: number, regId: number, value: number): number;
  _uc_emu_start(
    uc: number,
    begin: bigint,
    until: bigint,
    timeout: bigint,
    count: number
  ): number;
  _uc_emu_stop(uc: number): number;
  _uc_hook_add(
    uc: number,
    hh: number,
    type: number,
    callback: number,
    userData: number,
    begin: bigint,
    end: bigint
  ): number;
  _uc_hook_del(uc: number, hh: number): number;
  _uc_errno(uc: number): number;
  _uc_strerror(err: number): number;
  _malloc(size: number): number;
  _free(ptr: number): void;
  HEAPU8: Uint8Array;
  HEAP32: Int32Array;
  HEAPU32: Uint32Array;
  UTF8ToString(ptr: number): string;
  addFunction(fn: (...args: number[]) => void, sig: string): number;
  removeFunction(ptr: number): void;
}

/**
 * Load the Unicorn WASM module
 */
export async function loadUnicornModule(
  options?: UnicornLoadOptions
): Promise<UnicornModule> {
  // Return cached module if available
  if (unicornWasm) {
    return unicornWasm;
  }

  // Deduplicate concurrent loads
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      // Get manifest info for unicorn-arm
      const emulators = await WasmManager.getAvailableEmulators();
      const unicornInfo = emulators.find((e) => e.id === "unicorn-arm");

      if (!unicornInfo) {
        throw new Error(
          "Unicorn ARM emulator not found in manifest. It may not be available yet."
        );
      }

      // Determine paths
      const baseUrl = await WasmManager.getBaseUrl();
      const jsPath = options?.jsPath || `${baseUrl}/${unicornInfo.files.js}`;
      const wasmPath =
        options?.wasmPath ||
        `${baseUrl}/${unicornInfo.files.wasmGz || unicornInfo.files.wasm}`;

      options?.onProgress?.({
        loaded: 0,
        total: unicornInfo.size,
        message: "Loading Unicorn emulator...",
      });

      // Load the JS module
      const response = await fetch(jsPath);
      if (!response.ok) {
        throw new Error(`Failed to load Unicorn JS: ${response.statusText}`);
      }

      const jsCode = await response.text();

      // Create a module factory from the JS code
      const moduleFactory = new Function(`return ${jsCode}`)() as (
        options: Record<string, unknown>
      ) => Promise<UnicornModule>;

      // Load WASM
      const wasmResponse = await fetch(wasmPath);
      if (!wasmResponse.ok) {
        throw new Error(`Failed to load Unicorn WASM: ${wasmResponse.statusText}`);
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
        message: "Initializing Unicorn...",
      });

      // Initialize the module
      const wasmModule = await moduleFactory({
        wasmBinary,
        noInitialRun: true,
        print: (text: string) => console.log("[Unicorn]", text),
        printErr: (text: string) => console.error("[Unicorn]", text),
      });

      unicornWasm = wasmModule;

      options?.onProgress?.({
        loaded: wasmBinary.byteLength,
        total: wasmBinary.byteLength,
        message: "Unicorn ready",
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
 * Create a Unicorn emulator instance
 */
export async function createUnicornInstance(
  options?: UnicornLoadOptions
): Promise<UnicornInstance> {
  const ucModule = await loadUnicornModule(options);

  // Allocate handle storage
  const ucPtr = ucModule._malloc(8);
  let uc = 0;
  const hooks: Map<number, number> = new Map(); // hookId -> callback function pointer

  const arch = options?.arch ?? UnicornArch.ARM;
  const mode = options?.mode ?? (UnicornArmMode.THUMB | UnicornArmMode.MCLASS);

  // Initialize the engine
  const err = ucModule._uc_open(arch, mode, ucPtr);
  if (err !== 0) {
    ucModule._free(ucPtr);
    const errMsg = ucModule.UTF8ToString(ucModule._uc_strerror(err));
    throw new Error(`Failed to initialize Unicorn: ${errMsg}`);
  }
  uc = ucModule.HEAP32[ucPtr / 4];

  // Map initial memory regions if provided
  if (options?.memoryRegions) {
    for (const region of options.memoryRegions) {
      const mapErr = ucModule._uc_mem_map(
        uc,
        BigInt(region.address),
        region.size,
        region.perms
      );
      if (mapErr !== 0) {
        console.warn(
          `Failed to map memory at 0x${region.address.toString(16)}: ${ucModule.UTF8ToString(ucModule._uc_strerror(mapErr))}`
        );
      }
      if (region.data) {
        const dataPtr = ucModule._malloc(region.data.length);
        ucModule.HEAPU8.set(region.data, dataPtr);
        ucModule._uc_mem_write(uc, BigInt(region.address), dataPtr, region.data.length);
        ucModule._free(dataPtr);
      }
    }
  }

  const instance: UnicornInstance = {
    memMap(address: number, size: number, perms: UnicornPerm): void {
      const mapErr = ucModule._uc_mem_map(uc, BigInt(address), size, perms);
      if (mapErr !== 0) {
        throw new Error(
          `Failed to map memory: ${ucModule.UTF8ToString(ucModule._uc_strerror(mapErr))}`
        );
      }
    },

    memUnmap(address: number, size: number): void {
      const unmapErr = ucModule._uc_mem_unmap(uc, BigInt(address), size);
      if (unmapErr !== 0) {
        throw new Error(
          `Failed to unmap memory: ${ucModule.UTF8ToString(ucModule._uc_strerror(unmapErr))}`
        );
      }
    },

    memWrite(address: number, data: Uint8Array): void {
      const dataPtr = ucModule._malloc(data.length);
      ucModule.HEAPU8.set(data, dataPtr);
      const writeErr = ucModule._uc_mem_write(uc, BigInt(address), dataPtr, data.length);
      ucModule._free(dataPtr);
      if (writeErr !== 0) {
        throw new Error(
          `Failed to write memory: ${ucModule.UTF8ToString(ucModule._uc_strerror(writeErr))}`
        );
      }
    },

    memRead(address: number, size: number): Uint8Array {
      const dataPtr = ucModule._malloc(size);
      const readErr = ucModule._uc_mem_read(uc, BigInt(address), dataPtr, size);
      if (readErr !== 0) {
        ucModule._free(dataPtr);
        throw new Error(
          `Failed to read memory: ${ucModule.UTF8ToString(ucModule._uc_strerror(readErr))}`
        );
      }
      const data = new Uint8Array(size);
      data.set(ucModule.HEAPU8.subarray(dataPtr, dataPtr + size));
      ucModule._free(dataPtr);
      return data;
    },

    regWrite(regId: ArmReg, value: number): void {
      const valPtr = ucModule._malloc(4);
      ucModule.HEAP32[valPtr / 4] = value;
      const writeErr = ucModule._uc_reg_write(uc, regId, valPtr);
      ucModule._free(valPtr);
      if (writeErr !== 0) {
        throw new Error(
          `Failed to write register: ${ucModule.UTF8ToString(ucModule._uc_strerror(writeErr))}`
        );
      }
    },

    regRead(regId: ArmReg): number {
      const valPtr = ucModule._malloc(4);
      const readErr = ucModule._uc_reg_read(uc, regId, valPtr);
      if (readErr !== 0) {
        ucModule._free(valPtr);
        throw new Error(
          `Failed to read register: ${ucModule.UTF8ToString(ucModule._uc_strerror(readErr))}`
        );
      }
      const value = ucModule.HEAP32[valPtr / 4];
      ucModule._free(valPtr);
      return value;
    },

    emuStart(
      begin: number,
      until: number,
      timeout: number = 0,
      count: number = 0
    ): void {
      const startErr = ucModule._uc_emu_start(
        uc,
        BigInt(begin),
        BigInt(until),
        BigInt(timeout),
        count
      );
      if (startErr !== 0) {
        throw new Error(
          `Emulation failed: ${ucModule.UTF8ToString(ucModule._uc_strerror(startErr))}`
        );
      }
    },

    emuStop(): void {
      ucModule._uc_emu_stop(uc);
    },

    hookAddCode(
      callback: CodeHookCallback,
      begin: number = 1,
      end: number = 0
    ): number {
      // Create a callback function pointer
      const wrappedCallback = (
        _uc: number,
        address: number,
        size: number,
        _userData: number
      ) => {
        callback(address, size);
      };

      const funcPtr = ucModule.addFunction(wrappedCallback, "viiii");
      const hhPtr = ucModule._malloc(8);

      const hookErr = ucModule._uc_hook_add(
        uc,
        hhPtr,
        UnicornHookType.CODE,
        funcPtr,
        0,
        BigInt(begin),
        BigInt(end)
      );

      if (hookErr !== 0) {
        ucModule._free(hhPtr);
        ucModule.removeFunction(funcPtr);
        throw new Error(
          `Failed to add hook: ${ucModule.UTF8ToString(ucModule._uc_strerror(hookErr))}`
        );
      }

      const hookId = ucModule.HEAP32[hhPtr / 4];
      ucModule._free(hhPtr);
      hooks.set(hookId, funcPtr);
      return hookId;
    },

    hookAddMemory(
      type: UnicornHookType,
      callback: MemoryHookCallback,
      begin: number = 1,
      end: number = 0
    ): number {
      const wrappedCallback = (
        _uc: number,
        hookType: number,
        address: number,
        size: number,
        value: number,
        _userData: number
      ) => {
        const accessType =
          hookType === UnicornHookType.MEM_READ ? "read" : "write";
        callback(accessType, address, size, value);
      };

      const funcPtr = ucModule.addFunction(wrappedCallback, "viiiiii");
      const hhPtr = ucModule._malloc(8);

      const hookErr = ucModule._uc_hook_add(
        uc,
        hhPtr,
        type,
        funcPtr,
        0,
        BigInt(begin),
        BigInt(end)
      );

      if (hookErr !== 0) {
        ucModule._free(hhPtr);
        ucModule.removeFunction(funcPtr);
        throw new Error(
          `Failed to add memory hook: ${ucModule.UTF8ToString(ucModule._uc_strerror(hookErr))}`
        );
      }

      const hookId = ucModule.HEAP32[hhPtr / 4];
      ucModule._free(hhPtr);
      hooks.set(hookId, funcPtr);
      return hookId;
    },

    hookAddInterrupt(callback: InterruptHookCallback): number {
      const wrappedCallback = (
        _uc: number,
        intNo: number,
        _userData: number
      ) => {
        callback(intNo);
      };

      const funcPtr = ucModule.addFunction(wrappedCallback, "viii");
      const hhPtr = ucModule._malloc(8);

      const hookErr = ucModule._uc_hook_add(
        uc,
        hhPtr,
        UnicornHookType.INTR,
        funcPtr,
        0,
        BigInt(1),
        BigInt(0)
      );

      if (hookErr !== 0) {
        ucModule._free(hhPtr);
        ucModule.removeFunction(funcPtr);
        throw new Error(
          `Failed to add interrupt hook: ${ucModule.UTF8ToString(ucModule._uc_strerror(hookErr))}`
        );
      }

      const hookId = ucModule.HEAP32[hhPtr / 4];
      ucModule._free(hhPtr);
      hooks.set(hookId, funcPtr);
      return hookId;
    },

    hookDel(hookId: number): void {
      ucModule._uc_hook_del(uc, hookId);
      const funcPtr = hooks.get(hookId);
      if (funcPtr) {
        ucModule.removeFunction(funcPtr);
        hooks.delete(hookId);
      }
    },

    getError(): string | null {
      const errorCode = ucModule._uc_errno(uc);
      if (errorCode === 0) return null;
      return ucModule.UTF8ToString(ucModule._uc_strerror(errorCode));
    },

    getState(): CpuState {
      return {
        registers: {
          r0: this.regRead(ArmReg.R0),
          r1: this.regRead(ArmReg.R1),
          r2: this.regRead(ArmReg.R2),
          r3: this.regRead(ArmReg.R3),
          r4: this.regRead(ArmReg.R4),
          r5: this.regRead(ArmReg.R5),
          r6: this.regRead(ArmReg.R6),
          r7: this.regRead(ArmReg.R7),
          r8: this.regRead(ArmReg.R8),
          r9: this.regRead(ArmReg.R9),
          r10: this.regRead(ArmReg.R10),
          r11: this.regRead(ArmReg.R11),
          r12: this.regRead(ArmReg.R12),
          lr: this.regRead(ArmReg.LR),
        },
        pc: this.regRead(ArmReg.PC),
        sp: this.regRead(ArmReg.SP),
        cpsr: this.regRead(ArmReg.CPSR),
      };
    },

    setState(state: Partial<CpuState>): void {
      if (state.pc !== undefined) this.regWrite(ArmReg.PC, state.pc);
      if (state.sp !== undefined) this.regWrite(ArmReg.SP, state.sp);
      if (state.cpsr !== undefined) this.regWrite(ArmReg.CPSR, state.cpsr);

      if (state.registers) {
        const regMap: Record<string, ArmReg> = {
          r0: ArmReg.R0,
          r1: ArmReg.R1,
          r2: ArmReg.R2,
          r3: ArmReg.R3,
          r4: ArmReg.R4,
          r5: ArmReg.R5,
          r6: ArmReg.R6,
          r7: ArmReg.R7,
          r8: ArmReg.R8,
          r9: ArmReg.R9,
          r10: ArmReg.R10,
          r11: ArmReg.R11,
          r12: ArmReg.R12,
          lr: ArmReg.LR,
        };

        for (const [name, value] of Object.entries(state.registers)) {
          const reg = regMap[name];
          if (reg !== undefined) {
            this.regWrite(reg, value);
          }
        }
      }
    },

    reset(): void {
      // Reset all registers to 0
      for (let i = ArmReg.R0; i <= ArmReg.R12; i++) {
        this.regWrite(i, 0);
      }
      this.regWrite(ArmReg.SP, 0);
      this.regWrite(ArmReg.LR, 0);
      this.regWrite(ArmReg.PC, 0);
      this.regWrite(ArmReg.CPSR, 0);
    },

    close(): void {
      // Remove all hooks
      for (const [hookId, funcPtr] of hooks) {
        ucModule._uc_hook_del(uc, hookId);
        ucModule.removeFunction(funcPtr);
      }
      hooks.clear();

      // Close engine
      if (uc !== 0) {
        ucModule._uc_close(uc);
        uc = 0;
      }
      ucModule._free(ucPtr);
    },
  };

  return instance;
}

/**
 * Create a Cortex-M configured emulator
 */
export async function createCortexMEmulator(
  config: CortexMConfig,
  options?: UnicornLoadOptions
): Promise<UnicornInstance> {
  const memoryRegions = [
    {
      address: config.flash.origin,
      size: config.flash.size,
      perms: UnicornPerm.READ | UnicornPerm.EXEC,
    },
    {
      address: config.ram.origin,
      size: config.ram.size,
      perms: UnicornPerm.ALL,
    },
  ];

  if (config.peripherals) {
    memoryRegions.push({
      address: config.peripherals.origin,
      size: config.peripherals.size,
      perms: UnicornPerm.READ | UnicornPerm.WRITE,
    });
  }

  const instance = await createUnicornInstance({
    ...options,
    arch: UnicornArch.ARM,
    mode: UnicornArmMode.THUMB | UnicornArmMode.MCLASS,
    memoryRegions,
  });

  // Load ELF data if provided
  if (config.elfData) {
    // For now, assume raw binary at flash origin
    // TODO: Parse ELF and load sections properly
    instance.memWrite(config.flash.origin, config.elfData);
  }

  // Set initial SP and PC
  if (config.initialSp !== undefined) {
    instance.regWrite(ArmReg.SP, config.initialSp);
  }

  if (config.entryPoint !== undefined) {
    // Set PC to entry point with Thumb bit
    instance.regWrite(ArmReg.PC, config.entryPoint | 1);
  }

  return instance;
}

/**
 * Run emulation and return result
 */
export async function runEmulation(
  instance: UnicornInstance,
  begin: number,
  until: number,
  options?: { timeout?: number; maxInstructions?: number }
): Promise<EmulationResult> {
  let instructionsExecuted = 0;
  let stopReason: EmulationResult["stopReason"] = "until";

  // Add instruction counting hook
  const hookId = instance.hookAddCode(() => {
    instructionsExecuted++;
  });

  try {
    instance.emuStart(
      begin,
      until,
      options?.timeout ?? 0,
      options?.maxInstructions ?? 0
    );

    const finalState = instance.getState();

    // Determine stop reason
    if (finalState.pc === until || finalState.pc === until - 1) {
      stopReason = "until";
    } else if (options?.maxInstructions && instructionsExecuted >= options.maxInstructions) {
      stopReason = "count";
    } else if (options?.timeout) {
      stopReason = "timeout";
    }

    return {
      success: true,
      instructionsExecuted,
      stopReason,
      finalState,
    };
  } catch (error) {
    return {
      success: false,
      instructionsExecuted,
      stopReason: "error",
      finalState: instance.getState(),
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    instance.hookDel(hookId);
  }
}

/**
 * Check if Unicorn is loaded
 */
export function isUnicornLoaded(): boolean {
  return unicornWasm !== null;
}

/**
 * Unload Unicorn module (for cleanup)
 */
export function unloadUnicorn(): void {
  unicornWasm = null;
  loadPromise = null;
}

// Re-export types and enums for convenience
export {
  UnicornArch,
  UnicornArmMode,
  UnicornPerm,
  UnicornHookType,
  ArmReg,
};
