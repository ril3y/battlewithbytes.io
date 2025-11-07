/**
 * ARM Cortex-M Constants
 *
 * Standard addresses, bit masks, and magic values for ARM Cortex-M systems.
 */

/**
 * ============================================================================
 * REGISTER ADDRESSES
 * ============================================================================
 */

/**
 * System Control Space (SCS) base address
 */
export const SCS_BASE = 0xE000E000;

/**
 * System Control Block (SCB) base address
 */
export const SCB_BASE = 0xE000ED00;

/**
 * SysTick Timer base address
 */
export const SYSTICK_BASE = 0xE000E010;

/**
 * NVIC base address
 */
export const NVIC_BASE = 0xE000E100;

/**
 * Debug base address
 */
export const DEBUG_BASE = 0xE000EDF0;

/**
 * Flash Patch and Breakpoint (FPB) base address
 */
export const FPB_BASE = 0xE0002000;

/**
 * Data Watchpoint and Trace (DWT) base address
 */
export const DWT_BASE = 0xE0001000;

/**
 * Instrumentation Trace Macrocell (ITM) base address
 */
export const ITM_BASE = 0xE0000000;

/**
 * Trace Port Interface Unit (TPIU) base address
 */
export const TPIU_BASE = 0xE0040000;

/**
 * Embedded Trace Macrocell (ETM) base address
 */
export const ETM_BASE = 0xE0041000;

/**
 * System Control Block register addresses
 */
export const SCB_ADDRESSES = {
  CPUID: SCB_BASE + 0x00,
  ICSR: SCB_BASE + 0x04,
  VTOR: SCB_BASE + 0x08,
  AIRCR: SCB_BASE + 0x0C,
  SCR: SCB_BASE + 0x10,
  CCR: SCB_BASE + 0x14,
  SHPR1: SCB_BASE + 0x18,
  SHPR2: SCB_BASE + 0x1C,
  SHPR3: SCB_BASE + 0x20,
  SHCSR: SCB_BASE + 0x24,
  CFSR: SCB_BASE + 0x28,
  MMFSR: SCB_BASE + 0x28, // Byte 0 of CFSR
  BFSR: SCB_BASE + 0x29,  // Byte 1 of CFSR
  UFSR: SCB_BASE + 0x2A,  // Bytes 2-3 of CFSR
  HFSR: SCB_BASE + 0x2C,
  DFSR: SCB_BASE + 0x30,
  MMFAR: SCB_BASE + 0x34,
  BFAR: SCB_BASE + 0x38,
  AFSR: SCB_BASE + 0x3C,
} as const;

/**
 * Debug register addresses
 */
export const DEBUG_ADDRESSES = {
  DHCSR: DEBUG_BASE + 0x00,
  DCRSR: DEBUG_BASE + 0x04,
  DCRDR: DEBUG_BASE + 0x08,
  DEMCR: DEBUG_BASE + 0x0C,
} as const;

/**
 * Flash Patch and Breakpoint register addresses
 */
export const FPB_ADDRESSES = {
  FP_CTRL: FPB_BASE + 0x000,
  FP_REMAP: FPB_BASE + 0x004,
  FP_COMP0: FPB_BASE + 0x008,
  FP_COMP1: FPB_BASE + 0x00C,
  FP_COMP2: FPB_BASE + 0x010,
  FP_COMP3: FPB_BASE + 0x014,
  FP_COMP4: FPB_BASE + 0x018,
  FP_COMP5: FPB_BASE + 0x01C,
  FP_COMP6: FPB_BASE + 0x020,
  FP_COMP7: FPB_BASE + 0x024,
} as const;

/**
 * Data Watchpoint and Trace register addresses
 */
export const DWT_ADDRESSES = {
  DWT_CTRL: DWT_BASE + 0x000,
  DWT_CYCCNT: DWT_BASE + 0x004,
  DWT_CPICNT: DWT_BASE + 0x008,
  DWT_EXCCNT: DWT_BASE + 0x00C,
  DWT_SLEEPCNT: DWT_BASE + 0x010,
  DWT_LSUCNT: DWT_BASE + 0x014,
  DWT_FOLDCNT: DWT_BASE + 0x018,
  DWT_PCSR: DWT_BASE + 0x01C,
  DWT_COMP0: DWT_BASE + 0x020,
  DWT_MASK0: DWT_BASE + 0x024,
  DWT_FUNCTION0: DWT_BASE + 0x028,
  DWT_COMP1: DWT_BASE + 0x030,
  DWT_MASK1: DWT_BASE + 0x034,
  DWT_FUNCTION1: DWT_BASE + 0x038,
  DWT_COMP2: DWT_BASE + 0x040,
  DWT_MASK2: DWT_BASE + 0x044,
  DWT_FUNCTION2: DWT_BASE + 0x048,
  DWT_COMP3: DWT_BASE + 0x050,
  DWT_MASK3: DWT_BASE + 0x054,
  DWT_FUNCTION3: DWT_BASE + 0x058,
} as const;

/**
 * ============================================================================
 * MAGIC VALUES
 * ============================================================================
 */

/**
 * DHCSR debug key (write to bits 31:16)
 */
export const DHCSR_DBGKEY = 0xA05F;

/**
 * AIRCR register key (write to bits 31:16)
 */
export const AIRCR_VECTKEY = 0x05FA;

/**
 * ============================================================================
 * REGISTER NUMBERS (GDB Protocol)
 * ============================================================================
 */

/**
 * Core register numbers for GDB protocol
 */
export const CORE_REGISTER_NUMBERS = {
  R0: 0,
  R1: 1,
  R2: 2,
  R3: 3,
  R4: 4,
  R5: 5,
  R6: 6,
  R7: 7,
  R8: 8,
  R9: 9,
  R10: 10,
  R11: 11,
  R12: 12,
  SP: 13,
  LR: 14,
  PC: 15,
  XPSR: 16,
  MSP: 17,
  PSP: 18,
  PRIMASK: 19,
  BASEPRI: 20,
  FAULTMASK: 21,
  CONTROL: 22,
} as const;

/**
 * FPU register numbers for GDB protocol (starting at 0x40)
 */
export const FPU_REGISTER_NUMBERS = {
  S0: 0x40,
  S1: 0x41,
  S2: 0x42,
  S3: 0x43,
  S4: 0x44,
  S5: 0x45,
  S6: 0x46,
  S7: 0x47,
  S8: 0x48,
  S9: 0x49,
  S10: 0x4A,
  S11: 0x4B,
  S12: 0x4C,
  S13: 0x4D,
  S14: 0x4E,
  S15: 0x4F,
  S16: 0x50,
  S17: 0x51,
  S18: 0x52,
  S19: 0x53,
  S20: 0x54,
  S21: 0x55,
  S22: 0x56,
  S23: 0x57,
  S24: 0x58,
  S25: 0x59,
  S26: 0x5A,
  S27: 0x5B,
  S28: 0x5C,
  S29: 0x5D,
  S30: 0x5E,
  S31: 0x5F,
  FPSCR: 0x60,
} as const;

/**
 * ============================================================================
 * EXCEPTION NUMBERS
 * ============================================================================
 */

/**
 * Exception numbers as defined by ARMv7-M
 */
export const EXCEPTION_NUMBERS = {
  THREAD_MODE: 0,
  RESET: 1,
  NMI: 2,
  HARDFAULT: 3,
  MEMMANAGE: 4,
  BUSFAULT: 5,
  USAGEFAULT: 6,
  SVCALL: 11,
  DEBUG_MONITOR: 12,
  PENDSV: 14,
  SYSTICK: 15,
  // IRQ0-N start at 16
  IRQ_BASE: 16,
} as const;

/**
 * ============================================================================
 * BIT MASKS
 * ============================================================================
 */

/**
 * PSR bit masks
 */
export const PSR_MASKS = {
  N_FLAG: 1 << 31,  // Negative
  Z_FLAG: 1 << 30,  // Zero
  C_FLAG: 1 << 29,  // Carry
  V_FLAG: 1 << 28,  // Overflow
  Q_FLAG: 1 << 27,  // Saturation
  T_BIT: 1 << 24,   // Thumb state (always 1 on Cortex-M)
  GE_MASK: 0x000F0000,    // Greater-Equal flags
  EXCEPTION_MASK: 0x1FF,  // Exception number
} as const;

/**
 * CONTROL register bit masks
 */
export const CONTROL_MASKS = {
  nPRIV: 1 << 0,  // Thread mode privilege
  SPSEL: 1 << 1,  // Stack pointer select
  FPCA: 1 << 2,   // FP context active
} as const;

/**
 * PRIMASK/FAULTMASK bit masks
 */
export const INTERRUPT_MASKS = {
  PRIMASK: 1 << 0,
  FAULTMASK: 1 << 0,
} as const;

/**
 * DHCSR bit masks
 */
export const DHCSR_MASKS = {
  C_DEBUGEN: 1 << 0,     // Debug enable
  C_HALT: 1 << 1,        // Halt request
  C_STEP: 1 << 2,        // Single step
  C_MASKINTS: 1 << 3,    // Mask interrupts
  C_SNAPSTALL: 1 << 5,   // Snap stall
  S_REGRDY: 1 << 16,     // Register ready
  S_HALT: 1 << 17,       // Halted
  S_SLEEP: 1 << 18,      // Sleeping
  S_LOCKUP: 1 << 19,     // Lockup
  S_RETIRE_ST: 1 << 24,  // Instruction retired
  S_RESET_ST: 1 << 25,   // Reset status
  DBGKEY: 0xFFFF0000,    // Debug key field
} as const;

/**
 * DCRSR bit masks
 */
export const DCRSR_MASKS = {
  REGSEL: 0x1F,      // Register select
  REGWnR: 1 << 16,   // Write (1) or Read (0)
} as const;

/**
 * DEMCR bit masks
 */
export const DEMCR_MASKS = {
  VC_CORERESET: 1 << 0,   // Core reset vector catch
  VC_MMERR: 1 << 4,       // MemManage vector catch
  VC_NOCPERR: 1 << 5,     // No coprocessor vector catch
  VC_CHKERR: 1 << 6,      // Check error vector catch
  VC_STATERR: 1 << 7,     // State error vector catch
  VC_BUSERR: 1 << 8,      // BusFault vector catch
  VC_INTERR: 1 << 9,      // Interrupt error vector catch
  VC_HARDERR: 1 << 10,    // HardFault vector catch
  MON_EN: 1 << 16,        // Monitor enable
  MON_PEND: 1 << 17,      // Monitor pend
  MON_STEP: 1 << 18,      // Monitor step
  MON_REQ: 1 << 19,       // Monitor request
  TRCENA: 1 << 24,        // Trace enable
} as const;

/**
 * ============================================================================
 * CPUID PART NUMBERS
 * ============================================================================
 */

/**
 * ARM Cortex-M part numbers
 */
export const CORTEX_M_PARTS = {
  0xC20: 'Cortex-M0',
  0xC60: 'Cortex-M0+',
  0xC21: 'Cortex-M1',
  0xC23: 'Cortex-M3',
  0xC24: 'Cortex-M4',
  0xC27: 'Cortex-M7',
  0xD20: 'Cortex-M23',
  0xD21: 'Cortex-M33',
  0xD22: 'Cortex-M35P',
  0xD23: 'Cortex-M55',
  0xD24: 'Cortex-M85',
} as const;

/**
 * ============================================================================
 * FPB CONSTANTS
 * ============================================================================
 */

/**
 * FP_COMP REPLACE field values
 */
export const FP_COMP_REPLACE = {
  REMAP: 0b00,              // Remap to flash patch
  BREAKPOINT_LOWER: 0b01,   // Breakpoint on lower halfword
  BREAKPOINT_UPPER: 0b10,   // Breakpoint on upper halfword
  BREAKPOINT_BOTH: 0b11,    // Breakpoint on both halfwords (deprecated)
} as const;

/**
 * Maximum number of FPB comparators (implementation defined)
 */
export const MAX_FPB_COMPARATORS = 8;

/**
 * ============================================================================
 * DWT CONSTANTS
 * ============================================================================
 */

/**
 * DWT_FUNCTION function codes
 */
export const DWT_FUNCTION_CODES = {
  DISABLED: 0,
  PC_SAMPLE: 1,
  DATA_ADDR_RO: 5,        // Read-only watchpoint
  DATA_ADDR_WO: 6,        // Write-only watchpoint
  DATA_ADDR_RW: 7,        // Read/write watchpoint
  DATA_VALUE_RO: 8,       // Read with data value
  DATA_VALUE_WO: 9,       // Write with data value
  DATA_VALUE_RW: 10,      // Read/write with data value
} as const;

/**
 * DWT_FUNCTION DATAVSIZE values
 */
export const DWT_DATAVSIZE = {
  BYTE: 0,
  HALFWORD: 1,
  WORD: 2,
} as const;

/**
 * Maximum number of DWT comparators (implementation defined)
 */
export const MAX_DWT_COMPARATORS = 4;

/**
 * ============================================================================
 * MEMORY REGIONS
 * ============================================================================
 */

/**
 * Standard ARM Cortex-M memory map regions
 */
export const MEMORY_REGIONS = {
  CODE: {
    start: 0x00000000,
    end: 0x1FFFFFFF,
    name: 'Code',
  },
  SRAM: {
    start: 0x20000000,
    end: 0x3FFFFFFF,
    name: 'SRAM',
  },
  PERIPHERAL: {
    start: 0x40000000,
    end: 0x5FFFFFFF,
    name: 'Peripheral',
  },
  EXTERNAL_RAM: {
    start: 0x60000000,
    end: 0x9FFFFFFF,
    name: 'External RAM',
  },
  EXTERNAL_DEVICE: {
    start: 0xA0000000,
    end: 0xDFFFFFFF,
    name: 'External Device',
  },
  PRIVATE_PERIPHERAL: {
    start: 0xE0000000,
    end: 0xE00FFFFF,
    name: 'Private Peripheral Bus',
  },
  VENDOR_SPECIFIC: {
    start: 0xE0100000,
    end: 0xFFFFFFFF,
    name: 'Vendor Specific',
  },
} as const;

/**
 * ============================================================================
 * RESET VALUES
 * ============================================================================
 */

/**
 * Common register reset values
 */
export const RESET_VALUES = {
  PRIMASK: 0x00000000,
  FAULTMASK: 0x00000000,
  BASEPRI: 0x00000000,
  CONTROL: 0x00000000,
  FPSCR: 0x00000000,
} as const;

/**
 * ============================================================================
 * PRIORITY LEVELS
 * ============================================================================
 */

/**
 * Priority group configurations (AIRCR.PRIGROUP)
 */
export const PRIORITY_GROUPS = {
  GROUP_7_1: 0, // 7 bits group priority, 1 bit subpriority
  GROUP_6_2: 1, // 6 bits group priority, 2 bits subpriority
  GROUP_5_3: 2, // 5 bits group priority, 3 bits subpriority
  GROUP_4_4: 3, // 4 bits group priority, 4 bits subpriority
  GROUP_3_5: 4, // 3 bits group priority, 5 bits subpriority
  GROUP_2_6: 5, // 2 bits group priority, 6 bits subpriority
  GROUP_1_7: 6, // 1 bit group priority, 7 bits subpriority
  GROUP_0_8: 7, // 0 bits group priority, 8 bits subpriority
} as const;

/**
 * Exception priority levels (lower number = higher priority)
 */
export const EXCEPTION_PRIORITIES = {
  HIGHEST: -3, // Reset, NMI, HardFault (fixed)
  HIGH: 0,
  MEDIUM: 128,
  LOW: 255,
} as const;
