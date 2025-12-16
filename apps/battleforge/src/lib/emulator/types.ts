/**
 * Emulator Types
 *
 * Type definitions for CPU emulation (Unicorn, etc.)
 */

/**
 * Unicorn architecture types
 */
export enum UnicornArch {
  ARM = 1,
  ARM64 = 2,
  MIPS = 3,
  X86 = 4,
  PPC = 5,
  SPARC = 6,
  M68K = 7,
  RISCV = 8,
  S390X = 9,
  TRICORE = 10,
}

/**
 * Unicorn ARM mode flags
 */
export enum UnicornArmMode {
  ARM = 0,
  THUMB = 1 << 4,
  MCLASS = 1 << 5,
  V8 = 1 << 6,
  ARMBE8 = 1 << 10,
}

/**
 * Unicorn memory permissions
 */
export enum UnicornPerm {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  EXEC = 4,
  ALL = 7,
}

/**
 * ARM register IDs for Cortex-M
 */
export enum ArmReg {
  R0 = 66,
  R1 = 67,
  R2 = 68,
  R3 = 69,
  R4 = 70,
  R5 = 71,
  R6 = 72,
  R7 = 73,
  R8 = 74,
  R9 = 75,
  R10 = 76,
  R11 = 77,
  R12 = 78,
  SP = 79, // R13
  LR = 80, // R14
  PC = 81, // R15
  CPSR = 82,
  SPSR = 83,
  // System registers
  MSP = 84, // Main Stack Pointer
  PSP = 85, // Process Stack Pointer
  PRIMASK = 86,
  BASEPRI = 87,
  FAULTMASK = 88,
  CONTROL = 89,
}

/**
 * Hook types
 */
export enum UnicornHookType {
  CODE = 1 << 2, // Hook all code
  BLOCK = 1 << 3, // Hook basic blocks
  MEM_READ = 1 << 4, // Hook memory reads
  MEM_WRITE = 1 << 5, // Hook memory writes
  MEM_FETCH = 1 << 6, // Hook instruction fetches
  MEM_INVALID = 1 << 12, // Hook invalid memory access
  INTR = 1 << 0, // Hook interrupts
}

/**
 * Memory region configuration
 */
export interface MemoryRegion {
  address: number;
  size: number;
  perms: UnicornPerm;
  data?: Uint8Array;
}

/**
 * CPU state snapshot
 */
export interface CpuState {
  registers: Record<string, number>;
  pc: number;
  sp: number;
  cpsr: number;
}

/**
 * Code hook callback
 */
export type CodeHookCallback = (
  address: number,
  size: number
) => void;

/**
 * Memory hook callback
 */
export type MemoryHookCallback = (
  type: "read" | "write",
  address: number,
  size: number,
  value?: number
) => void;

/**
 * Interrupt hook callback
 */
export type InterruptHookCallback = (intNo: number) => void;

/**
 * Unicorn instance interface
 */
export interface UnicornInstance {
  /** Map memory region */
  memMap(address: number, size: number, perms: UnicornPerm): void;

  /** Unmap memory region */
  memUnmap(address: number, size: number): void;

  /** Write data to memory */
  memWrite(address: number, data: Uint8Array): void;

  /** Read data from memory */
  memRead(address: number, size: number): Uint8Array;

  /** Write a 32-bit register */
  regWrite(regId: ArmReg, value: number): void;

  /** Read a 32-bit register */
  regRead(regId: ArmReg): number;

  /** Start emulation from address */
  emuStart(begin: number, until: number, timeout?: number, count?: number): void;

  /** Stop emulation */
  emuStop(): void;

  /** Add a code execution hook */
  hookAddCode(callback: CodeHookCallback, begin?: number, end?: number): number;

  /** Add a memory access hook */
  hookAddMemory(
    type: UnicornHookType,
    callback: MemoryHookCallback,
    begin?: number,
    end?: number
  ): number;

  /** Add an interrupt hook */
  hookAddInterrupt(callback: InterruptHookCallback): number;

  /** Remove a hook */
  hookDel(hookId: number): void;

  /** Get last error message */
  getError(): string | null;

  /** Get CPU state snapshot */
  getState(): CpuState;

  /** Set CPU state from snapshot */
  setState(state: Partial<CpuState>): void;

  /** Reset the emulator to initial state */
  reset(): void;

  /** Close and release resources */
  close(): void;
}

/**
 * Options for loading Unicorn
 */
export interface UnicornLoadOptions {
  /** Path to WASM file */
  wasmPath?: string;
  /** Path to JS loader file */
  jsPath?: string;
  /** Initial architecture */
  arch?: UnicornArch;
  /** Initial mode */
  mode?: number;
  /** Memory regions to map on init */
  memoryRegions?: MemoryRegion[];
  /** Progress callback */
  onProgress?: (progress: { loaded: number; total: number; message: string }) => void;
}

/**
 * Cortex-M specific emulator configuration
 */
export interface CortexMConfig {
  /** Flash memory origin and size */
  flash: { origin: number; size: number };
  /** RAM origin and size */
  ram: { origin: number; size: number };
  /** Peripheral memory region (optional) */
  peripherals?: { origin: number; size: number };
  /** Initial stack pointer value */
  initialSp?: number;
  /** Entry point (Reset_Handler address) */
  entryPoint?: number;
  /** ELF binary to load */
  elfData?: Uint8Array;
}

/**
 * Emulation result
 */
export interface EmulationResult {
  /** Whether emulation completed successfully */
  success: boolean;
  /** Number of instructions executed */
  instructionsExecuted: number;
  /** Reason emulation stopped */
  stopReason: "timeout" | "breakpoint" | "halt" | "error" | "count" | "until";
  /** Final CPU state */
  finalState: CpuState;
  /** Error message if failed */
  error?: string;
}
