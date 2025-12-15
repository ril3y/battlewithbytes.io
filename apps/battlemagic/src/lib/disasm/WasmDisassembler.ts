/**
 * WASM-based ARM/Thumb Disassembler
 *
 * Provides high-performance disassembly using Rust/WASM (yaxpeax-arm).
 * This is a drop-in replacement for CapstoneDisassembler with 97% smaller size (155KB vs 5.2MB).
 *
 * Architecture:
 * - Uses battlemagic-core Rust WASM module (yaxpeax-arm)
 * - Implements same interface as ArmDisassembler/CapstoneDisassembler for compatibility
 * - Handles ARM Cortex-M Thumb/Thumb-2 and full ARM instruction sets
 * - Detects branch instructions and calculates targets
 * - Fast initialization and execution
 *
 * Usage:
 *   const disasm = new WasmDisassembler();
 *   await disasm.initialize();
 *   const instructions = await disasm.disassemble(data, baseAddress);
 */

import type { DisassembledInstruction } from "./ArmDisassembler";
import { loadBattleMagicCore } from "../wasm-loader";

/**
 * WASM Module interface for battlemagic-core
 */
interface BattleMagicWasmModule {
  Disassembler: new (baseAddress: number) => {
    disassemble_thumb: (
      data: Uint8Array,
      maxInstructions: number,
    ) => WasmInstruction[];
    disassemble_arm: (
      data: Uint8Array,
      maxInstructions: number,
    ) => WasmInstruction[];
  };
}

/**
 * Raw instruction format from WASM
 */
interface WasmInstruction {
  address: number;
  text: string;
  bytes: Uint8Array | number[];
}

/**
 * ARM branch instruction mnemonics
 */
const ARM_BRANCH_MNEMONICS = new Set([
  "b",
  "bl",
  "bx",
  "blx",
  "bxj",
  "beq",
  "bne",
  "bcs",
  "bhs",
  "bcc",
  "blo",
  "bmi",
  "bpl",
  "bvs",
  "bvc",
  "bhi",
  "bls",
  "bge",
  "blt",
  "bgt",
  "ble",
  "bal",
  "b.w",
  "bl.w",
  "cbz",
  "cbnz",
  "tbb",
  "tbh",
]);

/**
 * Check if instruction is a return
 */
const isReturnInstruction = (mnemonic: string, operands: string): boolean => {
  const mnLower = mnemonic.toLowerCase();
  const opLower = operands.toLowerCase();

  // BX LR or BLX LR
  if ((mnLower === "bx" || mnLower === "blx") && opLower.includes("lr")) {
    return true;
  }

  // POP with PC in register list
  if (mnLower === "pop" && opLower.includes("pc")) {
    return true;
  }

  // MOV PC, LR
  if (mnLower === "mov" && opLower.includes("pc") && opLower.includes("lr")) {
    return true;
  }

  return false;
};

/**
 * Parse immediate value from operand string
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const parseImmediate = (operand: string): number | null => {
  // Match #0x1234, #1234, 0x1234
  const hexMatch = operand.match(/#?0x([0-9a-fA-F]+)/);
  if (hexMatch) {
    return parseInt(hexMatch[1], 16);
  }

  const decMatch = operand.match(/#(-?[0-9]+)/);
  if (decMatch) {
    return parseInt(decMatch[1], 10);
  }

  return null;
};

/**
 * WasmDisassembler - Rust/WASM-based ARM disassembler
 *
 * Provides high-quality ARM/Thumb disassembly using yaxpeax-arm via WASM.
 * Must be initialized asynchronously before use.
 */
export class WasmDisassembler {
  private wasmModule: BattleMagicWasmModule | null = null;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private thumbMode: boolean;

  constructor(thumbMode: boolean = true) {
    this.thumbMode = thumbMode;
  }

  /**
   * Initialize the WASM module
   *
   * This must be called before disassembly can occur.
   * Safe to call multiple times - will reuse existing initialization.
   *
   * @returns Promise that resolves when initialization is complete
   * @throws Error if WASM fails to load or initialize
   */
  async initialize(): Promise<void> {
    // Return existing initialization if in progress or complete
    if (this.initPromise) {
      return this.initPromise;
    }

    if (this.isInitialized) {
      return Promise.resolve();
    }

    this.initPromise = (async () => {
      try {
        this.wasmModule = await loadBattleMagicCore();
        this.isInitialized = true;
      } catch (err) {
        console.error("[WasmDisassembler] Failed to load WASM:", err);
        this.initPromise = null;
        throw new Error(`Failed to initialize WASM disassembler: ${err}`);
      }
    })();

    return this.initPromise;
  }

  /**
   * Set instruction mode (ARM vs Thumb)
   */
  setThumbMode(thumbMode: boolean): void {
    this.thumbMode = thumbMode;
  }

  /**
   * Disassemble ARM/Thumb instructions
   *
   * @param data - Binary data to disassemble
   * @param baseAddress - Base address for instructions
   * @param thumbMode - Use Thumb mode (default: true for Cortex-M)
   * @returns Array of disassembled instructions
   */
  async disassemble(
    data: Uint8Array,
    baseAddress: number,
    thumbMode: boolean = this.thumbMode,
  ): Promise<DisassembledInstruction[]> {
    if (!this.isInitialized || !this.wasmModule) {
      throw new Error(
        "WASM disassembler not initialized. Call initialize() first.",
      );
    }

    try {
      // Validate data
      if (!data || data.length === 0) {
        throw new Error("No data provided for disassembly");
      }

      // Create disassembler instance
      const disasm = new this.wasmModule.Disassembler(baseAddress);

      // Disassemble using appropriate mode
      const maxInstructions = 1000; // Limit to prevent infinite loops
      let rawInstructions;
      try {
        const result = thumbMode
          ? disasm.disassemble_thumb(data, maxInstructions)
          : disasm.disassemble_arm(data, maxInstructions);

        if (!result) {
          throw new Error("WASM disassembler returned null/undefined");
        }

        rawInstructions = result;
      } catch (e) {
        const errorMsg =
          e instanceof Error
            ? e.message
            : e
              ? String(e)
              : "Unknown WASM error (undefined exception)";
        console.error("[WASM] Disassembly failed:", errorMsg);
        throw new Error(
          `Failed to disassemble at 0x${baseAddress.toString(16)}: ${errorMsg}`,
        );
      }

      // Convert WASM instruction format to our interface
      const instructions: DisassembledInstruction[] = rawInstructions.map(
        (inst: WasmInstruction) => {
          // Safely extract text field
          let text = "???";
          try {
            text = inst.text ? String(inst.text) : "???";
          } catch (e) {
            console.error(
              "[WASM] Failed to extract text from instruction:",
              inst,
              e,
            );
          }

          const firstSpace = text.indexOf(" ");
          const mnemonic =
            firstSpace >= 0 ? text.substring(0, firstSpace) : text;
          const operands =
            firstSpace >= 0 ? text.substring(firstSpace + 1).trim() : "";

          const bytes = Array.isArray(inst.bytes)
            ? new Uint8Array(inst.bytes)
            : new Uint8Array();
          const address = typeof inst.address === "number" ? inst.address : 0;

          // Detect branch instructions
          const isBranch = ARM_BRANCH_MNEMONICS.has(mnemonic.toLowerCase());
          const isReturn = isReturnInstruction(mnemonic, operands);

          // Calculate branch target for PC-relative branches
          let branchTarget: number | undefined = undefined;
          if (isBranch && !isReturn) {
            // Check if operands start with $ (PC-relative offset format from yaxpeax)
            // Example: "bl.w $-0x16c" or "b $+0x8"
            const pcRelMatch = operands.match(/\$([+-]0x[0-9a-fA-F]+)/);
            if (pcRelMatch) {
              const offset = parseInt(pcRelMatch[1], 16);
              // yaxpeax already accounts for PC offset, just add to current address
              branchTarget = address + offset;
            } else if (
              operands.startsWith("0x") ||
              operands.startsWith("$0x")
            ) {
              // Absolute address in operands
              const addrStr = operands.replace("$", "");
              branchTarget = parseInt(addrStr, 16);
            }
            // If we still don't have a target, don't try to calculate one
            // This prevents false positives from register-based branches
          }

          return {
            address,
            mnemonic,
            operands,
            bytes,
            size: bytes.length,
            isBranch,
            isReturn,
            branchTarget,
          };
        },
      );

      return instructions;
    } catch (err) {
      console.error("[WasmDisassembler] Disassembly failed:", err);
      throw new Error(`Disassembly failed: ${err}`);
    }
  }

  /**
   * Analyze control flow to find branch targets
   *
   * @param instructions - Array of disassembled instructions
   * @returns Map of source address to array of target addresses
   */
  analyzeControlFlow(
    instructions: DisassembledInstruction[],
  ): Map<number, number[]> {
    const flowMap = new Map<number, number[]>();

    for (const inst of instructions) {
      // Only add branch targets, not sequential flow
      // Sequential flow is implicit and doesn't need to be in the map
      if (inst.isBranch && inst.branchTarget !== undefined) {
        if (!flowMap.has(inst.address)) {
          flowMap.set(inst.address, []);
        }
        flowMap.get(inst.address)!.push(inst.branchTarget);
      }
    }

    return flowMap;
  }

  /**
   * Check if instruction is a function entry point
   *
   * Heuristic: PUSH with LR or STM with LR/PC
   */
  isFunctionEntry(
    instructions: DisassembledInstruction[],
    index: number,
  ): boolean {
    if (index < 0 || index >= instructions.length) return false;

    const inst = instructions[index];
    const mnem = inst.mnemonic.toLowerCase();
    const ops = inst.operands?.toLowerCase() || "";

    // PUSH {... lr ...} or PUSH {... lr, ...}
    if (mnem === "push" && ops.includes("lr")) {
      return true;
    }

    // STM with LR
    if (mnem.startsWith("stm") && ops.includes("lr")) {
      return true;
    }

    // Check if previous instruction was a branch/return (gap in code)
    if (index > 0) {
      const prevInst = instructions[index - 1];
      const isReturn =
        prevInst.mnemonic.toLowerCase().startsWith("bx") ||
        (prevInst.mnemonic.toLowerCase() === "pop" &&
          prevInst.operands.includes("pc"));
      if (isReturn || prevInst.isBranch) {
        return true;
      }
    }

    return false;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    // WASM module cleanup handled by garbage collection
    this.wasmModule = null;
    this.isInitialized = false;
    this.initPromise = null;
  }
}
