/**
 * Binary Parser Type Definitions
 *
 * Core type definitions for the binary parsing architecture.
 * Designed for embedded systems with focus on ARM, MIPS, and RISC-V architectures.
 */

/**
 * Supported processor architectures
 */
export type Architecture =
  | "ARM"
  | "MIPS"
  | "RISCV"
  | "X86"
  | "AVR"
  | "PIC"
  | "UNKNOWN";

/**
 * Binary file formats
 */
export type BinaryFormat =
  | "RAW"
  | "ELF"
  | "AXF"
  | "COFF"
  | "PE"
  | "MACHO"
  | "SREC"
  | "HEX";

/**
 * Endianness configuration
 */
export type Endianness = "little" | "big";

/**
 * Vector/interrupt types for embedded systems
 */
export type VectorType =
  | "reset" // Reset vector
  | "nmi" // Non-maskable interrupt
  | "hardfault" // ARM HardFault
  | "memfault" // ARM Memory Management Fault
  | "busfault" // ARM Bus Fault
  | "usagefault" // ARM Usage Fault
  | "svc" // Supervisor Call
  | "pendsv" // ARM PendSV
  | "systick" // System Tick Timer
  | "irq" // External Interrupt
  | "exception" // Generic exception
  | "trap" // RISC-V trap
  | "syscall"; // System call

/**
 * Information about a vector/interrupt handler
 */
export interface VectorInfo {
  /** Vector name (e.g., "Reset_Handler", "NMI_Handler") */
  name: string;

  /** Vector address in memory */
  address: number;

  /** Vector type classification */
  type: VectorType;

  /** Vector number/index in the vector table */
  index: number;

  /** Priority level (if applicable) */
  priority?: number;

  /** Whether this vector is enabled/active */
  enabled?: boolean;

  /** Handler function address (where it points to) */
  handlerAddress?: number;

  /** Additional architecture-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Memory section information
 */
export interface SectionInfo {
  /** Section name (e.g., ".text", ".data", ".bss") */
  name: string;

  /** Section start address */
  address: number;

  /** Section size in bytes */
  size: number;

  /** Section type */
  type: "code" | "data" | "bss" | "rodata" | "stack" | "heap" | "unknown";

  /** Section flags/attributes */
  flags: SectionFlag[];

  /** Load address (if different from virtual address) */
  loadAddress?: number;

  /** File offset */
  fileOffset?: number;

  /** Alignment requirement */
  alignment?: number;

  /** Raw section data */
  data?: Uint8Array;
}

/**
 * Section flags/attributes
 */
export type SectionFlag =
  | "readable"
  | "writable"
  | "executable"
  | "allocated"
  | "initialized"
  | "debug"
  | "compressed";

/**
 * Symbol information
 */
export interface SymbolInfo {
  /** Symbol name */
  name: string;

  /** Symbol address */
  address: number;

  /** Symbol size */
  size?: number;

  /** Symbol type */
  type: "function" | "variable" | "object" | "label" | "unknown";

  /** Symbol visibility */
  visibility?: "local" | "global" | "weak" | "hidden";

  /** Section the symbol belongs to */
  section?: string;

  /** Demangled name (for C++ symbols) */
  demangledName?: string;
}

/**
 * ARM-specific metadata
 */
export interface ArmMetadata {
  /** ARM architecture version (e.g., "v7-M", "v8-M") */
  archVersion: string;

  /** Processor type (e.g., "Cortex-M3", "Cortex-M4") */
  processorType?: string;

  /** Whether Thumb mode is used */
  thumbMode: boolean;

  /** Floating point support */
  fpuSupport?: "none" | "single" | "double";

  /** Vector table offset register value */
  vtorOffset?: number;

  /** Number of external interrupts */
  numExternalInterrupts?: number;

  /** Memory Protection Unit regions */
  mpuRegions?: number;

  /** Security extension present */
  securityExtension?: boolean;
}

/**
 * MIPS-specific metadata
 */
export interface MipsMetadata {
  /** MIPS architecture version (e.g., "MIPS32", "MIPS64") */
  archVersion: string;

  /** Instruction set (e.g., "mips32r2", "mips64r6") */
  instructionSet?: string;

  /** ABI type */
  abi?: "o32" | "n32" | "n64" | "eabi";

  /** Coprocessor availability */
  coprocessors?: number[];

  /** Exception vector base */
  exceptionBase?: number;
}

/**
 * RISC-V-specific metadata
 */
export interface RiscVMetadata {
  /** RISC-V architecture string (e.g., "rv32imac", "rv64gc") */
  archString: string;

  /** Base ISA (RV32I, RV64I, etc.) */
  baseIsa: "RV32I" | "RV32E" | "RV64I" | "RV128I";

  /** Extensions present */
  extensions: string[];

  /** ABI type */
  abi?: "ilp32" | "ilp32f" | "ilp32d" | "lp64" | "lp64f" | "lp64d";

  /** Machine mode trap vector */
  mtvec?: number;

  /** Supervisor mode trap vector */
  stvec?: number;
}

/**
 * Architecture-specific metadata union
 */
export type ArchitectureMetadata =
  | { arch: "ARM"; specific: ArmMetadata }
  | { arch: "MIPS"; specific: MipsMetadata }
  | { arch: "RISCV"; specific: RiscVMetadata }
  | { arch: "UNKNOWN"; specific?: Record<string, unknown> };

/**
 * Complete binary file metadata
 */
export interface BinaryMetadata {
  /** File format */
  format: BinaryFormat;

  /** Detected architecture */
  architecture: Architecture;

  /** Architecture-specific metadata */
  architectureMetadata?: ArchitectureMetadata;

  /** Endianness */
  endianness: Endianness;

  /** Entry point address */
  entryPoint?: number;

  /** Initial stack pointer (for ARM) */
  stackPointer?: number;

  /** Build/compile timestamp */
  timestamp?: Date;

  /** Compiler/toolchain info */
  toolchain?: string;

  /** Build ID or UUID */
  buildId?: string;

  /** File checksum/hash */
  checksum?: {
    type: "crc32" | "md5" | "sha1" | "sha256";
    value: string;
  };

  /** Debug info present */
  hasDebugInfo?: boolean;

  /** Symbol table present */
  hasSymbols?: boolean;

  /** File size */
  fileSize: number;

  /** Load size (actual memory footprint) */
  loadSize?: number;
}

/**
 * Complete parsed binary information
 */
export interface BinaryInfo {
  /** Detected architecture */
  architecture: Architecture;

  /** Entry point address */
  entryPoint: number;

  /** Initial stack pointer (primarily for ARM) */
  stackPointer?: number;

  /** Vector/interrupt table */
  vectors: VectorInfo[];

  /** Memory sections */
  sections: SectionInfo[];

  /** Symbol table */
  symbols?: SymbolInfo[];

  /** Binary metadata */
  metadata: BinaryMetadata;

  /** Raw binary data */
  rawData: Uint8Array;

  /** Memory map */
  memoryMap?: MemoryRegion[];

  /** Warnings/notes from parsing */
  warnings?: string[];
}

/**
 * Memory region definition
 */
export interface MemoryRegion {
  /** Region name */
  name: string;

  /** Start address */
  start: number;

  /** End address */
  end: number;

  /** Size in bytes */
  size: number;

  /** Region type */
  type: "flash" | "ram" | "eeprom" | "peripheral" | "reserved";

  /** Access permissions */
  permissions: ("read" | "write" | "execute")[];

  /** Whether region is cacheable */
  cacheable?: boolean;
}

/**
 * Binary parsing options
 */
export interface BinaryParseOptions {
  /** Base address for raw binaries */
  baseAddress?: number;

  /** Force specific architecture */
  forceArchitecture?: Architecture;

  /** Force specific endianness */
  forceEndianness?: Endianness;

  /** Parse symbols if available */
  parseSymbols?: boolean;

  /** Parse debug information if available */
  parseDebugInfo?: boolean;

  /** Maximum file size to parse (bytes) */
  maxFileSize?: number;

  /** Validate checksums */
  validateChecksums?: boolean;

  /** Architecture-specific options */
  architectureOptions?: {
    arm?: {
      /** Assume Cortex-M series */
      assumeCortexM?: boolean;
      /** Vector table offset */
      vtorOffset?: number;
    };
    mips?: {
      /** Boot vector address */
      bootVector?: number;
    };
    riscv?: {
      /** Assume embedded profile */
      assumeEmbedded?: boolean;
    };
  };
}

/**
 * Parser capability flags
 */
export interface ParserCapabilities {
  /** Supported file formats */
  formats: BinaryFormat[];

  /** Can parse symbols */
  canParseSymbols: boolean;

  /** Can parse debug info */
  canParseDebugInfo: boolean;

  /** Can detect entry point */
  canDetectEntryPoint: boolean;

  /** Can parse vector table */
  canParseVectorTable: boolean;

  /** Supports streaming/chunked parsing */
  supportsStreaming: boolean;
}

/**
 * Binary parser result
 */
export interface ParseResult {
  /** Success flag */
  success: boolean;

  /** Parsed binary info (if successful) */
  info?: BinaryInfo;

  /** Error message (if failed) */
  error?: string;

  /** Warnings/notes */
  warnings: string[];

  /** Parse duration in milliseconds */
  duration: number;
}

/**
 * Utility type for address ranges
 */
export interface AddressRange {
  start: number;
  end: number;
  size: number;
}

/**
 * ARM Cortex-M exception numbers
 */
export enum CortexMException {
  Reset = 1,
  NMI = 2,
  HardFault = 3,
  MemManage = 4,
  BusFault = 5,
  UsageFault = 6,
  // 7-10 are reserved
  SVCall = 11,
  DebugMonitor = 12,
  // 13 is reserved
  PendSV = 14,
  SysTick = 15,
  // 16+ are external interrupts
}

/**
 * Common ARM Cortex-M vector names
 */
export const CORTEX_M_VECTORS: readonly string[] = [
  "Initial_SP", // 0
  "Reset_Handler", // 1
  "NMI_Handler", // 2
  "HardFault_Handler", // 3
  "MemManage_Handler", // 4
  "BusFault_Handler", // 5
  "UsageFault_Handler", // 6
  "Reserved_7", // 7
  "Reserved_8", // 8
  "Reserved_9", // 9
  "Reserved_10", // 10
  "SVC_Handler", // 11
  "DebugMon_Handler", // 12
  "Reserved_13", // 13
  "PendSV_Handler", // 14
  "SysTick_Handler", // 15
] as const;

/**
 * ELF machine types (e_machine field)
 */
export enum ElfMachine {
  EM_NONE = 0,
  EM_ARM = 40,
  EM_AARCH64 = 183,
  EM_MIPS = 8,
  EM_RISCV = 243,
  EM_386 = 3,
  EM_X86_64 = 62,
  EM_AVR = 83,
  EM_PIC = 204,
}

/**
 * Memory alignment utilities
 */
export const MemoryAlignment = {
  align: (address: number, alignment: number): number => {
    return Math.floor((address + alignment - 1) / alignment) * alignment;
  },

  isAligned: (address: number, alignment: number): boolean => {
    return address % alignment === 0;
  },

  getPadding: (address: number, alignment: number): number => {
    const aligned = MemoryAlignment.align(address, alignment);
    return aligned - address;
  },
} as const;
