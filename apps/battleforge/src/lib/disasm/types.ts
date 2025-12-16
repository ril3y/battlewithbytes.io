/**
 * Disassembler Types
 *
 * Type definitions for disassembler integrations (Capstone, etc.)
 */

/**
 * Capstone architecture modes
 */
export enum CapstoneArch {
  ARM = 0,
  ARM64 = 1,
  MIPS = 2,
  X86 = 3,
  PPC = 4,
  SPARC = 5,
  SYSZ = 6,
  XCORE = 7,
  M68K = 8,
  TMS320C64X = 9,
  M680X = 10,
  EVM = 11,
  MOS65XX = 12,
  WASM = 13,
  BPF = 14,
  RISCV = 15,
  SH = 16,
  TRICORE = 17,
}

/**
 * Capstone ARM mode flags
 */
export enum CapstoneArmMode {
  ARM = 0,
  THUMB = 1 << 4,
  MCLASS = 1 << 5, // Cortex-M
  V8 = 1 << 6, // ARMv8
}

/**
 * Capstone RISC-V mode flags
 */
export enum CapstoneRiscvMode {
  RISCV32 = 1 << 0,
  RISCV64 = 1 << 1,
  RISCVC = 1 << 2, // Compressed instructions
}

/**
 * Disassembled instruction
 */
export interface DisassembledInstruction {
  /** Address of the instruction */
  address: number;
  /** Raw bytes of the instruction */
  bytes: Uint8Array;
  /** Mnemonic (e.g., "mov", "ldr", "bl") */
  mnemonic: string;
  /** Operands string (e.g., "r0, r1", "#0x1234") */
  opStr: string;
  /** Instruction size in bytes */
  size: number;
  /** Instruction ID (Capstone-specific) */
  id?: number;
  /** Groups this instruction belongs to (e.g., "jump", "call", "return") */
  groups?: string[];
}

/**
 * Capstone instance interface
 */
export interface CapstoneInstance {
  /** Disassemble code at a given address */
  disassemble(code: Uint8Array, address: number, count?: number): DisassembledInstruction[];

  /** Open a new disassembler handle */
  open(arch: CapstoneArch, mode: number): void;

  /** Close the current disassembler handle */
  close(): void;

  /** Get the last error message */
  getError(): string | null;

  /** Get Capstone version */
  getVersion(): string;

  /** Clean up and release resources */
  dispose(): void;
}

/**
 * Options for loading Capstone
 */
export interface CapstoneLoadOptions {
  /** Path to WASM file (defaults to manifest path) */
  wasmPath?: string;
  /** Path to JS loader file (defaults to manifest path) */
  jsPath?: string;
  /** Initial architecture to open */
  arch?: CapstoneArch;
  /** Initial mode flags */
  mode?: number;
  /** Progress callback */
  onProgress?: (progress: { loaded: number; total: number; message: string }) => void;
}

/**
 * Disassembler factory for creating architecture-specific disassemblers
 */
export interface DisassemblerFactory {
  /** Create an ARM disassembler in Thumb mode (Cortex-M) */
  createArmThumb(): CapstoneInstance;
  /** Create an ARM disassembler in ARM mode */
  createArm(): CapstoneInstance;
  /** Create a RISC-V 32-bit disassembler */
  createRiscv32(): CapstoneInstance;
}
