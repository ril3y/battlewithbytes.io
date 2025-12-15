/**
 * ARM Cortex-M Type Definitions
 *
 * Comprehensive TypeScript type definitions for ARM Cortex-M microcontrollers.
 * Covers core registers, system control, debugging, and peripheral registers.
 *
 * References:
 * - ARMv7-M Architecture Reference Manual
 * - ARM Cortex-M Programming Guide
 * - ARM Debug Interface Architecture Specification
 */

/**
 * ============================================================================
 * CORE REGISTER TYPES
 * ============================================================================
 */

/**
 * Complete set of ARM Cortex-M core registers
 */
export interface ArmCortexMRegisters {
  // General Purpose Registers (R0-R12)
  r0: number;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  r5: number;
  r6: number;
  r7: number;
  r8: number;
  r9: number;
  r10: number;
  r11: number;
  r12: number;

  // Stack Pointer (R13) - banked between MSP and PSP
  sp: number;

  // Link Register (R14)
  lr: number;

  // Program Counter (R15)
  pc: number;

  // Program Status Registers
  xpsr: number; // Combined PSR
  apsr: number; // Application PSR
  ipsr: number; // Interrupt PSR
  epsr: number; // Execution PSR

  // Special Registers
  primask: number; // Priority Mask Register
  faultmask: number; // Fault Mask Register
  basepri: number; // Base Priority Register
  control: number; // Control Register

  // Stack Pointers (banked)
  msp: number; // Main Stack Pointer
  psp: number; // Process Stack Pointer
}

/**
 * General purpose registers only (R0-R12)
 */
export interface GeneralPurposeRegisters {
  r0: number;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  r5: number;
  r6: number;
  r7: number;
  r8: number;
  r9: number;
  r10: number;
  r11: number;
  r12: number;
}

/**
 * Stack pointer variants
 */
export interface StackPointers {
  sp: number; // Current stack pointer (either MSP or PSP)
  msp: number; // Main Stack Pointer
  psp: number; // Process Stack Pointer
}

/**
 * Special function registers
 */
export interface SpecialRegisters {
  primask: number;
  faultmask: number;
  basepri: number;
  control: number;
}

/**
 * ============================================================================
 * FLOATING POINT UNIT (FPU) REGISTERS
 * ============================================================================
 */

/**
 * FPU single-precision registers (S0-S31)
 */
export interface FpuSingleRegisters {
  s0: number;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
  s6: number;
  s7: number;
  s8: number;
  s9: number;
  s10: number;
  s11: number;
  s12: number;
  s13: number;
  s14: number;
  s15: number;
  s16: number;
  s17: number;
  s18: number;
  s19: number;
  s20: number;
  s21: number;
  s22: number;
  s23: number;
  s24: number;
  s25: number;
  s26: number;
  s27: number;
  s28: number;
  s29: number;
  s30: number;
  s31: number;
}

/**
 * FPU double-precision registers (D0-D15)
 * Each D register overlaps two S registers
 */
export interface FpuDoubleRegisters {
  d0: number;
  d1: number;
  d2: number;
  d3: number;
  d4: number;
  d5: number;
  d6: number;
  d7: number;
  d8: number;
  d9: number;
  d10: number;
  d11: number;
  d12: number;
  d13: number;
  d14: number;
  d15: number;
}

/**
 * Complete FPU register set
 */
export interface FpuRegisters extends FpuSingleRegisters, FpuDoubleRegisters {
  fpscr: number; // Floating-Point Status and Control Register
}

/**
 * ============================================================================
 * PROGRAM STATUS REGISTER (PSR) BIT FIELDS
 * ============================================================================
 */

/**
 * Application Program Status Register (APSR) bit fields
 */
export interface ApsrFlags {
  N: boolean; // Negative condition flag (bit 31)
  Z: boolean; // Zero condition flag (bit 30)
  C: boolean; // Carry condition flag (bit 29)
  V: boolean; // Overflow condition flag (bit 28)
  Q: boolean; // Saturation flag (bit 27)
  GE: number; // Greater than or Equal flags (bits 16-19, 4 bits)
}

/**
 * Interrupt Program Status Register (IPSR) bit fields
 */
export interface IpsrFields {
  exceptionNumber: number; // Exception number (bits 0-8)
}

/**
 * Execution Program Status Register (EPSR) bit fields
 */
export interface EpsrFields {
  T: boolean; // Thumb state bit (bit 24, always 1 for Cortex-M)
  ICI_IT: number; // Interrupt-Continuable Instruction / If-Then state (bits 10-15, 25-26)
}

/**
 * Combined Program Status Register with bit field access
 */
export interface ProgramStatusRegister {
  raw: number; // Raw 32-bit value

  // Decomposed fields
  apsr: ApsrFlags;
  ipsr: IpsrFields;
  epsr: EpsrFields;
}

/**
 * CONTROL register bit fields
 */
export interface ControlRegister {
  raw: number;

  nPRIV: boolean; // Thread mode privilege level (0=privileged, 1=unprivileged)
  SPSEL: boolean; // Stack pointer selection (0=MSP, 1=PSP)
  FPCA: boolean; // Floating-point context active (Cortex-M4F/M7F only)
}

/**
 * PRIMASK register (single bit)
 */
export interface PrimaskRegister {
  raw: number;
  PM: boolean; // Exception mask bit (0=no effect, 1=prevents activation of all exceptions with configurable priority)
}

/**
 * FAULTMASK register (single bit)
 */
export interface FaultmaskRegister {
  raw: number;
  FM: boolean; // Fault mask bit (0=no effect, 1=prevents activation of all exceptions except NMI)
}

/**
 * BASEPRI register
 */
export interface BasepriRegister {
  raw: number;
  basepri: number; // Priority mask value (bits 0-7, implementation defined width)
}

/**
 * ============================================================================
 * SYSTEM CONTROL BLOCK (SCB) REGISTERS
 * ============================================================================
 */

/**
 * System Control Block base address
 */
export const SCB_BASE = 0xe000ed00;

/**
 * SCB Register offsets from base
 */
export enum ScbOffset {
  CPUID = 0x00, // CPUID Base Register
  ICSR = 0x04, // Interrupt Control and State Register
  VTOR = 0x08, // Vector Table Offset Register
  AIRCR = 0x0c, // Application Interrupt and Reset Control Register
  SCR = 0x10, // System Control Register
  CCR = 0x14, // Configuration and Control Register
  SHPR1 = 0x18, // System Handler Priority Register 1
  SHPR2 = 0x1c, // System Handler Priority Register 2
  SHPR3 = 0x20, // System Handler Priority Register 3
  SHCSR = 0x24, // System Handler Control and State Register
  CFSR = 0x28, // Configurable Fault Status Register
  HFSR = 0x2c, // HardFault Status Register
  DFSR = 0x30, // Debug Fault Status Register
  MMFAR = 0x34, // MemManage Fault Address Register
  BFAR = 0x38, // BusFault Address Register
  AFSR = 0x3c, // Auxiliary Fault Status Register
}

/**
 * CPUID Base Register bit fields
 */
export interface CpuidRegister {
  raw: number;

  implementer: number; // Implementer code (bits 24-31)
  variant: number; // Variant number (bits 20-23)
  architecture: number; // Architecture code (bits 16-19)
  partno: number; // Part number (bits 4-15)
  revision: number; // Revision number (bits 0-3)
}

/**
 * Interrupt Control and State Register (ICSR) bit fields
 */
export interface IcsrRegister {
  raw: number;

  NMIPENDSET: boolean; // NMI set-pending bit (bit 31)
  PENDSVSET: boolean; // PendSV set-pending bit (bit 28)
  PENDSVCLR: boolean; // PendSV clear-pending bit (bit 27)
  PENDSTSET: boolean; // SysTick set-pending bit (bit 26)
  PENDSTCLR: boolean; // SysTick clear-pending bit (bit 25)
  ISRPREEMPT: boolean; // Interrupt preempted flag (bit 23)
  ISRPENDING: boolean; // Interrupt pending flag (bit 22)
  VECTPENDING: number; // Pending exception number (bits 12-21)
  RETTOBASE: boolean; // Return to base level (bit 11)
  VECTACTIVE: number; // Active exception number (bits 0-8)
}

/**
 * Vector Table Offset Register (VTOR) bit fields
 */
export interface VtorRegister {
  raw: number;
  TBLOFF: number; // Vector table base offset (bits 7-29, must be aligned)
}

/**
 * Application Interrupt and Reset Control Register (AIRCR) bit fields
 */
export interface AircrRegister {
  raw: number;

  VECTKEY: number; // Register key (bits 16-31, must be 0x05FA to write)
  ENDIANNESS: boolean; // Data endianness (bit 15, 0=little, 1=big)
  PRIGROUP: number; // Priority grouping (bits 8-10)
  SYSRESETREQ: boolean; // System reset request (bit 2)
  VECTCLRACTIVE: boolean; // Clear active vector (bit 1, debug only)
  VECTRESET: boolean; // Reserved (bit 0)
}

/**
 * System Control Register (SCR) bit fields
 */
export interface ScrRegister {
  raw: number;

  SEVONPEND: boolean; // Send Event on Pending (bit 4)
  SLEEPDEEP: boolean; // Sleep deep enable (bit 2)
  SLEEPONEXIT: boolean; // Sleep on ISR exit (bit 1)
}

/**
 * Configuration and Control Register (CCR) bit fields
 */
export interface CcrRegister {
  raw: number;

  STKALIGN: boolean; // Stack alignment on exception entry (bit 9)
  BFHFNMIGN: boolean; // Ignore bus faults in NMI/HardFault (bit 8)
  DIV_0_TRP: boolean; // Divide by zero trap enable (bit 4)
  UNALIGN_TRP: boolean; // Unaligned access trap enable (bit 3)
  USERSETMPEND: boolean; // User mode can set STIR (bit 1)
  NONBASETHRDENA: boolean; // Non-base thread enable (bit 0)
}

/**
 * System Handler Priority Registers (SHPR1-3)
 * Contains priority levels for system exceptions
 */
export interface ShprRegisters {
  shpr1: number; // MemManage, BusFault, UsageFault priorities
  shpr2: number; // SVCall priority
  shpr3: number; // SysTick, PendSV, DebugMonitor priorities
}

/**
 * System Handler Control and State Register (SHCSR) bit fields
 */
export interface ShcsrRegister {
  raw: number;

  USGFAULTENA: boolean; // UsageFault enable (bit 18)
  BUSFAULTENA: boolean; // BusFault enable (bit 17)
  MEMFAULTENA: boolean; // MemManage fault enable (bit 16)
  SVCALLPENDED: boolean; // SVCall pending (bit 15)
  BUSFAULTPENDED: boolean; // BusFault pending (bit 14)
  MEMFAULTPENDED: boolean; // MemManage fault pending (bit 13)
  USGFAULTPENDED: boolean; // UsageFault pending (bit 12)
  SYSTICKACT: boolean; // SysTick active (bit 11)
  PENDSVACT: boolean; // PendSV active (bit 10)
  MONITORACT: boolean; // DebugMonitor active (bit 8)
  SVCALLACT: boolean; // SVCall active (bit 7)
  USGFAULTACT: boolean; // UsageFault active (bit 3)
  BUSFAULTACT: boolean; // BusFault active (bit 1)
  MEMFAULTACT: boolean; // MemManage fault active (bit 0)
}

/**
 * Configurable Fault Status Register (CFSR) - composite of MMFSR, BFSR, UFSR
 */
export interface CfsrRegister {
  raw: number;

  // MemManage Fault Status Register (bits 0-7)
  MMFSR: {
    MMARVALID: boolean; // MMFAR valid (bit 7)
    MLSPERR: boolean; // MemManage fault during FP lazy state preservation (bit 5)
    MSTKERR: boolean; // MemManage fault on stacking (bit 4)
    MUNSTKERR: boolean; // MemManage fault on unstacking (bit 3)
    DACCVIOL: boolean; // Data access violation (bit 1)
    IACCVIOL: boolean; // Instruction access violation (bit 0)
  };

  // BusFault Status Register (bits 8-15)
  BFSR: {
    BFARVALID: boolean; // BFAR valid (bit 15)
    LSPERR: boolean; // BusFault during FP lazy state preservation (bit 13)
    STKERR: boolean; // BusFault on stacking (bit 12)
    UNSTKERR: boolean; // BusFault on unstacking (bit 11)
    IMPRECISERR: boolean; // Imprecise data bus error (bit 10)
    PRECISERR: boolean; // Precise data bus error (bit 9)
    IBUSERR: boolean; // Instruction bus error (bit 8)
  };

  // UsageFault Status Register (bits 16-31)
  UFSR: {
    DIVBYZERO: boolean; // Divide by zero (bit 25)
    UNALIGNED: boolean; // Unaligned access (bit 24)
    NOCP: boolean; // No coprocessor (bit 19)
    INVPC: boolean; // Invalid PC load (bit 18)
    INVSTATE: boolean; // Invalid state (bit 17)
    UNDEFINSTR: boolean; // Undefined instruction (bit 16)
  };
}

/**
 * HardFault Status Register (HFSR) bit fields
 */
export interface HfsrRegister {
  raw: number;

  DEBUGEVT: boolean; // Debug event (bit 31)
  FORCED: boolean; // Forced HardFault (bit 30)
  VECTTBL: boolean; // Vector table read fault (bit 1)
}

/**
 * Debug Fault Status Register (DFSR) bit fields
 */
export interface DfsrRegister {
  raw: number;

  EXTERNAL: boolean; // External debug request (bit 4)
  VCATCH: boolean; // Vector catch (bit 3)
  DWTTRAP: boolean; // DWT match (bit 2)
  BKPT: boolean; // BKPT instruction (bit 1)
  HALTED: boolean; // Halt request (bit 0)
}

/**
 * Complete System Control Block register set
 */
export interface SystemControlBlock {
  CPUID: CpuidRegister;
  ICSR: IcsrRegister;
  VTOR: VtorRegister;
  AIRCR: AircrRegister;
  SCR: ScrRegister;
  CCR: CcrRegister;
  SHPR: ShprRegisters;
  SHCSR: ShcsrRegister;
  CFSR: CfsrRegister;
  HFSR: HfsrRegister;
  DFSR: DfsrRegister;
  MMFAR: number; // MemManage Fault Address Register (raw address)
  BFAR: number; // BusFault Address Register (raw address)
  AFSR: number; // Auxiliary Fault Status Register (implementation defined)
}

/**
 * ============================================================================
 * DEBUG REGISTERS
 * ============================================================================
 */

/**
 * Debug Core Register Selector Register (DCRSR)
 */
export interface DcrsrRegister {
  raw: number;

  REGWnR: boolean; // Write (1) or Read (0) (bit 16)
  REGSEL: number; // Register selector (bits 0-4)
}

/**
 * Debug Core Register Data Register (DCRDR)
 * Simple 32-bit data register for reading/writing core registers
 */
export type DcrdrRegister = number;

/**
 * Debug Halting Control and Status Register (DHCSR) bit fields
 */
export interface DhcsrRegister {
  raw: number;

  DBGKEY: number; // Debug key (bits 16-31, must be 0xA05F to write)
  S_RESET_ST: boolean; // Reset status (bit 25)
  S_RETIRE_ST: boolean; // Instruction retired status (bit 24)
  S_LOCKUP: boolean; // Lockup status (bit 19)
  S_SLEEP: boolean; // Sleep status (bit 18)
  S_HALT: boolean; // Halt status (bit 17)
  S_REGRDY: boolean; // Register ready (bit 16)
  C_SNAPSTALL: boolean; // Snap stall (bit 5)
  C_MASKINTS: boolean; // Mask interrupts (bit 3)
  C_STEP: boolean; // Single step (bit 2)
  C_HALT: boolean; // Halt request (bit 1)
  C_DEBUGEN: boolean; // Debug enable (bit 0)
}

/**
 * Debug Exception and Monitor Control Register (DEMCR) bit fields
 */
export interface DemcrRegister {
  raw: number;

  TRCENA: boolean; // Trace enable (bit 24)
  MON_REQ: boolean; // DebugMonitor request (bit 19)
  MON_STEP: boolean; // DebugMonitor step (bit 18)
  MON_PEND: boolean; // DebugMonitor pend (bit 17)
  MON_EN: boolean; // DebugMonitor enable (bit 16)
  VC_HARDERR: boolean; // HardFault vector catch (bit 10)
  VC_INTERR: boolean; // Interrupt error vector catch (bit 9)
  VC_BUSERR: boolean; // BusFault vector catch (bit 8)
  VC_STATERR: boolean; // State error vector catch (bit 7)
  VC_CHKERR: boolean; // Check error vector catch (bit 6)
  VC_NOCPERR: boolean; // No coprocessor vector catch (bit 5)
  VC_MMERR: boolean; // MemManage vector catch (bit 4)
  VC_CORERESET: boolean; // Core reset vector catch (bit 0)
}

/**
 * Complete Debug register set
 */
export interface DebugRegisters {
  DHCSR: DhcsrRegister; // Debug Halting Control and Status
  DCRSR: DcrsrRegister; // Debug Core Register Selector
  DCRDR: DcrdrRegister; // Debug Core Register Data
  DEMCR: DemcrRegister; // Debug Exception and Monitor Control
}

/**
 * ============================================================================
 * FLASH PATCH AND BREAKPOINT (FPB) REGISTERS
 * ============================================================================
 */

/**
 * Flash Patch Control Register (FP_CTRL) bit fields
 */
export interface FpCtrlRegister {
  raw: number;

  NUM_CODE2: number; // Number of code comparators [14:12] (upper 3 bits)
  NUM_LIT: number; // Number of literal comparators [11:8]
  NUM_CODE1: number; // Number of code comparators [7:4] (lower 4 bits)
  KEY: boolean; // Key bit (bit 1, write 1 to enable changes)
  ENABLE: boolean; // FPB enable (bit 0)
}

/**
 * Flash Patch Comparator Register (FP_COMPn) bit fields
 */
export interface FpCompRegister {
  raw: number;

  REPLACE: number; // Breakpoint type (bits 30-31, 0=remap, 1=breakpoint on lower half, 2=breakpoint on upper half, 3=both)
  COMP: number; // Comparator address (bits 2-29, word aligned)
  ENABLE: boolean; // Comparator enable (bit 0)
}

/**
 * Flash Patch and Breakpoint unit
 */
export interface FlashPatchBreakpoint {
  FP_CTRL: FpCtrlRegister;
  FP_REMAP: number; // Flash patch remap register
  FP_COMP: FpCompRegister[]; // Comparator registers (up to 8)
}

/**
 * ============================================================================
 * DATA WATCHPOINT AND TRACE (DWT) REGISTERS
 * ============================================================================
 */

/**
 * DWT Control Register bit fields
 */
export interface DwtCtrlRegister {
  raw: number;

  NUMCOMP: number; // Number of comparators (bits 28-31, read-only)
  NOTRCPKT: boolean; // No trace packets (bit 27)
  NOEXTTRIG: boolean; // No external triggers (bit 26)
  NOCYCCNT: boolean; // No cycle counter (bit 25)
  NOPRFCNT: boolean; // No profiling counters (bit 24)
  CYCEVTENA: boolean; // Cycle count event enable (bit 22)
  FOLDEVTENA: boolean; // Fold event enable (bit 21)
  LSUEVTENA: boolean; // LSU event enable (bit 20)
  SLEEPEVTENA: boolean; // Sleep event enable (bit 19)
  EXCEVTENA: boolean; // Exception event enable (bit 18)
  CPIEVTENA: boolean; // CPI event enable (bit 17)
  EXCTRCENA: boolean; // Exception trace enable (bit 16)
  PCSAMPLENA: boolean; // PC sample enable (bit 12)
  SYNCTAP: number; // Sync tap position (bits 10-11)
  CYCTAP: boolean; // Cycle count tap (bit 9)
  POSTINIT: number; // Post-init (bits 5-8)
  POSTPRESET: number; // Post-preset (bits 1-4)
  CYCCNTENA: boolean; // Cycle counter enable (bit 0)
}

/**
 * DWT Comparator Function Register bit fields
 */
export interface DwtFunctionRegister {
  raw: number;

  MATCHED: boolean; // Comparator matched (bit 24)
  DATAVSIZE: number; // Data value size (bits 10-11, 0=byte, 1=halfword, 2=word)
  DATAVMATCH: boolean; // Data value match (bit 8)
  CYCMATCH: boolean; // Cycle count match (bit 7)
  EMITRANGE: boolean; // Emit range (bit 5)
  FUNCTION: number; // Function select (bits 0-3)
}

/**
 * Data Watchpoint and Trace unit
 */
export interface DataWatchpointTrace {
  DWT_CTRL: DwtCtrlRegister;
  DWT_CYCCNT: number; // Cycle counter
  DWT_CPICNT: number; // CPI counter
  DWT_EXCCNT: number; // Exception overhead counter
  DWT_SLEEPCNT: number; // Sleep counter
  DWT_LSUCNT: number; // LSU counter
  DWT_FOLDCNT: number; // Folder counter
  DWT_PCSR: number; // Program counter sample

  // Comparator registers (typically 4 comparators)
  comparators: Array<{
    DWT_COMP: number; // Comparator value
    DWT_MASK: number; // Comparator mask
    DWT_FUNCTION: DwtFunctionRegister; // Comparator function
  }>;
}

/**
 * ============================================================================
 * REGISTER NAME TYPES
 * ============================================================================
 */

/**
 * Core register names
 */
export type CoreRegisterName =
  | "r0"
  | "r1"
  | "r2"
  | "r3"
  | "r4"
  | "r5"
  | "r6"
  | "r7"
  | "r8"
  | "r9"
  | "r10"
  | "r11"
  | "r12"
  | "sp"
  | "lr"
  | "pc"
  | "xpsr"
  | "apsr"
  | "ipsr"
  | "epsr"
  | "msp"
  | "psp"
  | "primask"
  | "faultmask"
  | "basepri"
  | "control";

/**
 * FPU register names
 */
export type FpuRegisterName =
  | "s0"
  | "s1"
  | "s2"
  | "s3"
  | "s4"
  | "s5"
  | "s6"
  | "s7"
  | "s8"
  | "s9"
  | "s10"
  | "s11"
  | "s12"
  | "s13"
  | "s14"
  | "s15"
  | "s16"
  | "s17"
  | "s18"
  | "s19"
  | "s20"
  | "s21"
  | "s22"
  | "s23"
  | "s24"
  | "s25"
  | "s26"
  | "s27"
  | "s28"
  | "s29"
  | "s30"
  | "s31"
  | "d0"
  | "d1"
  | "d2"
  | "d3"
  | "d4"
  | "d5"
  | "d6"
  | "d7"
  | "d8"
  | "d9"
  | "d10"
  | "d11"
  | "d12"
  | "d13"
  | "d14"
  | "d15"
  | "fpscr";

/**
 * All register names (core + optional FPU)
 */
export type RegisterName = CoreRegisterName | FpuRegisterName;

/**
 * Register size in bits
 */
export type RegisterSize = 8 | 16 | 32 | 64;

/**
 * Register read/write permissions
 */
export interface RegisterPermissions {
  readable: boolean;
  writable: boolean;
  privileged?: boolean; // Requires privileged mode
}

/**
 * Register metadata
 */
export interface RegisterMetadata {
  name: RegisterName;
  number?: number; // GDB register number
  size: RegisterSize;
  permissions: RegisterPermissions;
  address?: number; // Memory-mapped address (for special registers)
  description?: string;
  resetValue?: number;
}

/**
 * ============================================================================
 * REGISTER MAPPING AND ADDRESSING
 * ============================================================================
 */

/**
 * Debug register addresses
 */
export const DEBUG_BASE = 0xe000edf0;

export enum DebugRegisterAddress {
  DHCSR = 0xe000edf0, // Debug Halting Control and Status
  DCRSR = 0xe000edf4, // Debug Core Register Selector
  DCRDR = 0xe000edf8, // Debug Core Register Data
  DEMCR = 0xe000edfc, // Debug Exception and Monitor Control
}

/**
 * Flash Patch and Breakpoint addresses
 */
export const FPB_BASE = 0xe0002000;

export enum FpbRegisterAddress {
  FP_CTRL = 0xe0002000, // Flash Patch Control
  FP_REMAP = 0xe0002004, // Flash Patch Remap
  FP_COMP0 = 0xe0002008, // Flash Patch Comparator 0
  FP_COMP1 = 0xe000200c, // Flash Patch Comparator 1
  FP_COMP2 = 0xe0002010, // Flash Patch Comparator 2
  FP_COMP3 = 0xe0002014, // Flash Patch Comparator 3
  FP_COMP4 = 0xe0002018, // Flash Patch Comparator 4
  FP_COMP5 = 0xe000201c, // Flash Patch Comparator 5
  FP_COMP6 = 0xe0002020, // Flash Patch Comparator 6
  FP_COMP7 = 0xe0002024, // Flash Patch Comparator 7
}

/**
 * Data Watchpoint and Trace addresses
 */
export const DWT_BASE = 0xe0001000;

export enum DwtRegisterAddress {
  DWT_CTRL = 0xe0001000, // Control
  DWT_CYCCNT = 0xe0001004, // Cycle Counter
  DWT_CPICNT = 0xe0001008, // CPI Counter
  DWT_EXCCNT = 0xe000100c, // Exception Overhead Counter
  DWT_SLEEPCNT = 0xe0001010, // Sleep Counter
  DWT_LSUCNT = 0xe0001014, // LSU Counter
  DWT_FOLDCNT = 0xe0001018, // Folder Counter
  DWT_PCSR = 0xe000101c, // Program Counter Sample
  DWT_COMP0 = 0xe0001020, // Comparator 0
  DWT_MASK0 = 0xe0001024, // Mask 0
  DWT_FUNCTION0 = 0xe0001028, // Function 0
  DWT_COMP1 = 0xe0001030, // Comparator 1
  DWT_MASK1 = 0xe0001034, // Mask 1
  DWT_FUNCTION1 = 0xe0001038, // Function 1
  DWT_COMP2 = 0xe0001040, // Comparator 2
  DWT_MASK2 = 0xe0001044, // Mask 2
  DWT_FUNCTION2 = 0xe0001048, // Function 2
  DWT_COMP3 = 0xe0001050, // Comparator 3
  DWT_MASK3 = 0xe0001054, // Mask 3
  DWT_FUNCTION3 = 0xe0001058, // Function 3
}

/**
 * ============================================================================
 * FPSCR BIT FIELDS (FPU Status and Control Register)
 * ============================================================================
 */

export interface FpscrRegister {
  raw: number;

  N: boolean; // Negative condition flag (bit 31)
  Z: boolean; // Zero condition flag (bit 30)
  C: boolean; // Carry condition flag (bit 29)
  V: boolean; // Overflow condition flag (bit 28)
  AHP: boolean; // Alternative half-precision (bit 26)
  DN: boolean; // Default NaN mode (bit 25)
  FZ: boolean; // Flush-to-zero mode (bit 24)
  RMode: number; // Rounding mode (bits 22-23)
  IDC: boolean; // Input denormal cumulative flag (bit 7)
  IXC: boolean; // Inexact cumulative flag (bit 4)
  UFC: boolean; // Underflow cumulative flag (bit 3)
  OFC: boolean; // Overflow cumulative flag (bit 2)
  DZC: boolean; // Division by zero cumulative flag (bit 1)
  IOC: boolean; // Invalid operation cumulative flag (bit 0)
}

/**
 * ============================================================================
 * UTILITY TYPES
 * ============================================================================
 */

/**
 * Register value with metadata
 */
export interface RegisterValue {
  name: RegisterName;
  value: number;
  metadata?: RegisterMetadata;
}

/**
 * Register set snapshot (all core registers at a point in time)
 */
export interface RegisterSnapshot {
  timestamp: number;
  registers: ArmCortexMRegisters;
  fpu?: FpuRegisters;
  scb?: Partial<SystemControlBlock>;
}

/**
 * Register change event
 */
export interface RegisterChange {
  name: RegisterName;
  oldValue: number;
  newValue: number;
  timestamp: number;
}

/**
 * ARM architecture variant
 */
export enum ArmArchitecture {
  ARMv6M = "ARMv6-M", // Cortex-M0, M0+, M1
  ARMv7M = "ARMv7-M", // Cortex-M3
  ARMv7EM = "ARMv7E-M", // Cortex-M4, M7 (with optional FPU)
  ARMv8M_BASE = "ARMv8-M.BASE", // Cortex-M23
  ARMv8M_MAIN = "ARMv8-M.MAIN", // Cortex-M33, M35P
}

/**
 * CPU feature flags
 */
export interface CpuFeatures {
  architecture: ArmArchitecture;
  hasFpu: boolean;
  hasDsp: boolean;
  hasMpu: boolean;
  hasSecurityExtension: boolean; // TrustZone (ARMv8-M)
  numBreakpoints: number;
  numWatchpoints: number;
}

/**
 * ============================================================================
 * BINARY PARSER TYPES
 * ============================================================================
 */

/**
 * Supported architectures
 */
export type Architecture = "ARM" | "MIPS" | "RISCV" | "x86" | "Unknown";

/**
 * Parser capabilities
 */
export interface ParserCapabilities {
  formats: string[];
  canParseSymbols: boolean;
  canParseDebugInfo: boolean;
  canDetectEntryPoint: boolean;
  canParseVectorTable: boolean;
  supportsStreaming: boolean;
}

/**
 * Vector types
 */
export type VectorType =
  | "reset"
  | "nmi"
  | "hardfault"
  | "memfault"
  | "busfault"
  | "usagefault"
  | "svc"
  | "pendsv"
  | "systick"
  | "irq"
  | "exception";

/**
 * Vector information
 */
export interface VectorInfo {
  name: string;
  address: number;
  handlerAddress: number;
  type: VectorType;
  index: number;
  priority?: number;
  enabled?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * ARM-specific metadata
 */
export interface ArmMetadata {
  archVersion: string;
  thumbMode: boolean;
  fpuSupport: "none" | "single" | "double";
  processorType?: string;
  vtorOffset?: number;
  numExternalInterrupts?: number;
  securityExtension?: boolean;
  mpuRegions?: number;
}

/**
 * Cortex-M exception numbers
 */
export enum CortexMException {
  Reset = 1,
  NMI = 2,
  HardFault = 3,
  MemManage = 4,
  BusFault = 5,
  UsageFault = 6,
  SVCall = 11,
  DebugMon = 12,
  PendSV = 14,
  SysTick = 15,
}

/**
 * Standard Cortex-M vector table names
 */
export const CORTEX_M_VECTORS = [
  "Initial_SP",
  "Reset",
  "NMI",
  "HardFault",
  "MemManage",
  "BusFault",
  "UsageFault",
  "Reserved_7",
  "Reserved_8",
  "Reserved_9",
  "Reserved_10",
  "SVCall",
  "DebugMon",
  "Reserved_13",
  "PendSV",
  "SysTick",
];

/**
 * Memory region for binary parser
 */
export interface MemoryRegion {
  name: string;
  start: number;
  end: number;
  size: number;
  type: "flash" | "ram" | "peripheral" | "external" | "reserved";
  permissions: string[];
  cacheable: boolean;
}

/**
 * Binary info result from parser
 */
export interface BinaryInfo {
  format: string;
  architecture: Architecture;
  baseAddress: number;
  entryPoint?: number;
  size: number;
  vectors: VectorInfo[];
  memoryMap: MemoryRegion[];
  warnings: string[];
  stackPointer?: number;
}

/**
 * Parser options
 */
export interface ParserOptions {
  baseAddress?: number;
  architectureOptions?: {
    arm?: {
      vtorOffset?: number;
      assumeCortexM?: boolean;
    };
  };
}

/**
 * ELF machine types
 */
export enum ElfMachine {
  EM_NONE = 0,
  EM_ARM = 40,
  EM_MIPS = 8,
  EM_RISCV = 243,
  EM_386 = 3,
}

/**
 * ELF header structure
 */
export interface ElfHeader {
  magic: number[];
  class: number;
  data: number;
  version: number;
  osabi: number;
  type: number;
  machine: number;
  entry: number;
  phoff: number;
  shoff: number;
  flags: number;
  ehsize: number;
  phentsize: number;
  phnum: number;
  shentsize: number;
  shnum: number;
  shstrndx: number;
}
