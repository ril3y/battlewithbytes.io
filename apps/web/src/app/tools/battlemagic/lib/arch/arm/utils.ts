/**
 * ARM Cortex-M Register Utilities
 *
 * Helper functions for manipulating and interpreting ARM Cortex-M registers.
 * Provides bit-field extraction, register decoding, and format conversion.
 */

import {
  ApsrFlags,
  IpsrFields,
  EpsrFields,
  ProgramStatusRegister,
  ControlRegister,
  PrimaskRegister,
  FaultmaskRegister,
  BasepriRegister,
  CpuidRegister,
  IcsrRegister,
  VtorRegister,
  AircrRegister,
  ScrRegister,
  CcrRegister,
  ShcsrRegister,
  CfsrRegister,
  HfsrRegister,
  DfsrRegister,
  DhcsrRegister,
  DcrsrRegister,
  DemcrRegister,
  FpCtrlRegister,
  FpCompRegister,
  DwtCtrlRegister,
  DwtFunctionRegister,
  FpscrRegister,
  CoreRegisterName,
  RegisterMetadata,
  RegisterSize,
  ArmArchitecture,
} from "./types";

/**
 * ============================================================================
 * BIT MANIPULATION UTILITIES
 * ============================================================================
 */

/**
 * Extract a bit field from a 32-bit value
 */
export function extractBitField(
  value: number,
  startBit: number,
  numBits: number,
): number {
  const mask = (1 << numBits) - 1;
  return (value >>> startBit) & mask;
}

/**
 * Extract a single bit as boolean
 */
export function extractBit(value: number, bit: number): boolean {
  return ((value >>> bit) & 1) === 1;
}

/**
 * Set a bit field in a 32-bit value
 */
export function setBitField(
  original: number,
  startBit: number,
  numBits: number,
  value: number,
): number {
  const mask = (1 << numBits) - 1;
  const cleared = original & ~(mask << startBit);
  return cleared | ((value & mask) << startBit);
}

/**
 * Set a single bit
 */
export function setBit(original: number, bit: number, value: boolean): number {
  if (value) {
    return original | (1 << bit);
  } else {
    return original & ~(1 << bit);
  }
}

/**
 * ============================================================================
 * PSR (PROGRAM STATUS REGISTER) UTILITIES
 * ============================================================================
 */

/**
 * Decode APSR flags from raw value
 */
export function decodeApsr(value: number): ApsrFlags {
  return {
    N: extractBit(value, 31),
    Z: extractBit(value, 30),
    C: extractBit(value, 29),
    V: extractBit(value, 28),
    Q: extractBit(value, 27),
    GE: extractBitField(value, 16, 4),
  };
}

/**
 * Encode APSR flags to raw value
 */
export function encodeApsr(flags: ApsrFlags): number {
  let value = 0;
  value = setBit(value, 31, flags.N);
  value = setBit(value, 30, flags.Z);
  value = setBit(value, 29, flags.C);
  value = setBit(value, 28, flags.V);
  value = setBit(value, 27, flags.Q);
  value = setBitField(value, 16, 4, flags.GE);
  return value;
}

/**
 * Decode IPSR fields from raw value
 */
export function decodeIpsr(value: number): IpsrFields {
  return {
    exceptionNumber: extractBitField(value, 0, 9),
  };
}

/**
 * Decode EPSR fields from raw value
 */
export function decodeEpsr(value: number): EpsrFields {
  const ici_it_low = extractBitField(value, 10, 6);
  const ici_it_high = extractBitField(value, 25, 2);
  return {
    T: extractBit(value, 24),
    ICI_IT: (ici_it_high << 6) | ici_it_low,
  };
}

/**
 * Decode combined PSR (xPSR) into all components
 */
export function decodePsr(value: number): ProgramStatusRegister {
  return {
    raw: value,
    apsr: decodeApsr(value),
    ipsr: decodeIpsr(value),
    epsr: decodeEpsr(value),
  };
}

/**
 * Get condition code flags as string (NZCV)
 */
export function formatConditionFlags(apsr: ApsrFlags): string {
  return `${apsr.N ? "N" : "-"}${apsr.Z ? "Z" : "-"}${apsr.C ? "C" : "-"}${apsr.V ? "V" : "-"}`;
}

/**
 * ============================================================================
 * SPECIAL REGISTER DECODERS
 * ============================================================================
 */

/**
 * Decode CONTROL register
 */
export function decodeControl(value: number): ControlRegister {
  return {
    raw: value,
    nPRIV: extractBit(value, 0),
    SPSEL: extractBit(value, 1),
    FPCA: extractBit(value, 2),
  };
}

/**
 * Decode PRIMASK register
 */
export function decodePrimask(value: number): PrimaskRegister {
  return {
    raw: value,
    PM: extractBit(value, 0),
  };
}

/**
 * Decode FAULTMASK register
 */
export function decodeFaultmask(value: number): FaultmaskRegister {
  return {
    raw: value,
    FM: extractBit(value, 0),
  };
}

/**
 * Decode BASEPRI register
 */
export function decodeBasepri(value: number): BasepriRegister {
  return {
    raw: value,
    basepri: extractBitField(value, 0, 8),
  };
}

/**
 * ============================================================================
 * SYSTEM CONTROL BLOCK (SCB) DECODERS
 * ============================================================================
 */

/**
 * Decode CPUID register
 */
export function decodeCpuid(value: number): CpuidRegister {
  return {
    raw: value,
    implementer: extractBitField(value, 24, 8),
    variant: extractBitField(value, 20, 4),
    architecture: extractBitField(value, 16, 4),
    partno: extractBitField(value, 4, 12),
    revision: extractBitField(value, 0, 4),
  };
}

/**
 * Get CPU name from CPUID
 */
export function getCpuName(cpuid: CpuidRegister): string {
  // ARM implementer code is 0x41
  if (cpuid.implementer !== 0x41) {
    return `Unknown (0x${cpuid.partno.toString(16)})`;
  }

  const partNames: Record<number, string> = {
    0xc20: "Cortex-M0",
    0xc60: "Cortex-M0+",
    0xc21: "Cortex-M1",
    0xc23: "Cortex-M3",
    0xc24: "Cortex-M4",
    0xc27: "Cortex-M7",
    0xd20: "Cortex-M23",
    0xd21: "Cortex-M33",
  };

  return (
    partNames[cpuid.partno] || `Unknown Cortex (0x${cpuid.partno.toString(16)})`
  );
}

/**
 * Get architecture from CPUID
 */
export function getArchitecture(cpuid: CpuidRegister): ArmArchitecture {
  const archMap: Record<number, ArmArchitecture> = {
    0xc: ArmArchitecture.ARMv6M, // ARMv6-M
    0xf: ArmArchitecture.ARMv7M, // ARMv7-M and ARMv7E-M
  };

  // Default based on part number if architecture field doesn't distinguish
  if (cpuid.architecture === 0xf) {
    if (cpuid.partno === 0xc23) return ArmArchitecture.ARMv7M;
    if (cpuid.partno === 0xc24 || cpuid.partno === 0xc27)
      return ArmArchitecture.ARMv7EM;
  }

  return archMap[cpuid.architecture] || ArmArchitecture.ARMv7M;
}

/**
 * Decode ICSR register
 */
export function decodeIcsr(value: number): IcsrRegister {
  return {
    raw: value,
    NMIPENDSET: extractBit(value, 31),
    PENDSVSET: extractBit(value, 28),
    PENDSVCLR: extractBit(value, 27),
    PENDSTSET: extractBit(value, 26),
    PENDSTCLR: extractBit(value, 25),
    ISRPREEMPT: extractBit(value, 23),
    ISRPENDING: extractBit(value, 22),
    VECTPENDING: extractBitField(value, 12, 10),
    RETTOBASE: extractBit(value, 11),
    VECTACTIVE: extractBitField(value, 0, 9),
  };
}

/**
 * Decode VTOR register
 */
export function decodeVtor(value: number): VtorRegister {
  return {
    raw: value,
    TBLOFF: extractBitField(value, 7, 23) << 7,
  };
}

/**
 * Decode AIRCR register
 */
export function decodeAircr(value: number): AircrRegister {
  return {
    raw: value,
    VECTKEY: extractBitField(value, 16, 16),
    ENDIANNESS: extractBit(value, 15),
    PRIGROUP: extractBitField(value, 8, 3),
    SYSRESETREQ: extractBit(value, 2),
    VECTCLRACTIVE: extractBit(value, 1),
    VECTRESET: extractBit(value, 0),
  };
}

/**
 * Encode AIRCR register (with proper key)
 */
export function encodeAircr(aircr: Partial<AircrRegister>): number {
  let value = 0x05fa0000; // Always include the key
  if (aircr.PRIGROUP !== undefined)
    value = setBitField(value, 8, 3, aircr.PRIGROUP);
  if (aircr.SYSRESETREQ) value = setBit(value, 2, true);
  if (aircr.VECTCLRACTIVE) value = setBit(value, 1, true);
  if (aircr.VECTRESET) value = setBit(value, 0, true);
  return value;
}

/**
 * Decode SCR register
 */
export function decodeScr(value: number): ScrRegister {
  return {
    raw: value,
    SEVONPEND: extractBit(value, 4),
    SLEEPDEEP: extractBit(value, 2),
    SLEEPONEXIT: extractBit(value, 1),
  };
}

/**
 * Decode CCR register
 */
export function decodeCcr(value: number): CcrRegister {
  return {
    raw: value,
    STKALIGN: extractBit(value, 9),
    BFHFNMIGN: extractBit(value, 8),
    DIV_0_TRP: extractBit(value, 4),
    UNALIGN_TRP: extractBit(value, 3),
    USERSETMPEND: extractBit(value, 1),
    NONBASETHRDENA: extractBit(value, 0),
  };
}

/**
 * Decode SHCSR register
 */
export function decodeShcsr(value: number): ShcsrRegister {
  return {
    raw: value,
    USGFAULTENA: extractBit(value, 18),
    BUSFAULTENA: extractBit(value, 17),
    MEMFAULTENA: extractBit(value, 16),
    SVCALLPENDED: extractBit(value, 15),
    BUSFAULTPENDED: extractBit(value, 14),
    MEMFAULTPENDED: extractBit(value, 13),
    USGFAULTPENDED: extractBit(value, 12),
    SYSTICKACT: extractBit(value, 11),
    PENDSVACT: extractBit(value, 10),
    MONITORACT: extractBit(value, 8),
    SVCALLACT: extractBit(value, 7),
    USGFAULTACT: extractBit(value, 3),
    BUSFAULTACT: extractBit(value, 1),
    MEMFAULTACT: extractBit(value, 0),
  };
}

/**
 * Decode CFSR register (composite)
 */
export function decodeCfsr(value: number): CfsrRegister {
  return {
    raw: value,
    MMFSR: {
      MMARVALID: extractBit(value, 7),
      MLSPERR: extractBit(value, 5),
      MSTKERR: extractBit(value, 4),
      MUNSTKERR: extractBit(value, 3),
      DACCVIOL: extractBit(value, 1),
      IACCVIOL: extractBit(value, 0),
    },
    BFSR: {
      BFARVALID: extractBit(value, 15),
      LSPERR: extractBit(value, 13),
      STKERR: extractBit(value, 12),
      UNSTKERR: extractBit(value, 11),
      IMPRECISERR: extractBit(value, 10),
      PRECISERR: extractBit(value, 9),
      IBUSERR: extractBit(value, 8),
    },
    UFSR: {
      DIVBYZERO: extractBit(value, 25),
      UNALIGNED: extractBit(value, 24),
      NOCP: extractBit(value, 19),
      INVPC: extractBit(value, 18),
      INVSTATE: extractBit(value, 17),
      UNDEFINSTR: extractBit(value, 16),
    },
  };
}

/**
 * Format CFSR as human-readable fault description
 */
export function describeCfsr(cfsr: CfsrRegister): string[] {
  const faults: string[] = [];

  // MemManage faults
  if (cfsr.MMFSR.IACCVIOL)
    faults.push("MemManage: Instruction access violation");
  if (cfsr.MMFSR.DACCVIOL) faults.push("MemManage: Data access violation");
  if (cfsr.MMFSR.MUNSTKERR) faults.push("MemManage: Unstacking error");
  if (cfsr.MMFSR.MSTKERR) faults.push("MemManage: Stacking error");
  if (cfsr.MMFSR.MLSPERR)
    faults.push("MemManage: FP lazy state preservation error");

  // BusFault faults
  if (cfsr.BFSR.IBUSERR) faults.push("BusFault: Instruction bus error");
  if (cfsr.BFSR.PRECISERR) faults.push("BusFault: Precise data bus error");
  if (cfsr.BFSR.IMPRECISERR) faults.push("BusFault: Imprecise data bus error");
  if (cfsr.BFSR.UNSTKERR) faults.push("BusFault: Unstacking error");
  if (cfsr.BFSR.STKERR) faults.push("BusFault: Stacking error");
  if (cfsr.BFSR.LSPERR)
    faults.push("BusFault: FP lazy state preservation error");

  // UsageFault faults
  if (cfsr.UFSR.UNDEFINSTR) faults.push("UsageFault: Undefined instruction");
  if (cfsr.UFSR.INVSTATE) faults.push("UsageFault: Invalid state");
  if (cfsr.UFSR.INVPC) faults.push("UsageFault: Invalid PC load");
  if (cfsr.UFSR.NOCP) faults.push("UsageFault: No coprocessor");
  if (cfsr.UFSR.UNALIGNED) faults.push("UsageFault: Unaligned access");
  if (cfsr.UFSR.DIVBYZERO) faults.push("UsageFault: Divide by zero");

  return faults;
}

/**
 * Decode HFSR register
 */
export function decodeHfsr(value: number): HfsrRegister {
  return {
    raw: value,
    DEBUGEVT: extractBit(value, 31),
    FORCED: extractBit(value, 30),
    VECTTBL: extractBit(value, 1),
  };
}

/**
 * Decode DFSR register
 */
export function decodeDfsr(value: number): DfsrRegister {
  return {
    raw: value,
    EXTERNAL: extractBit(value, 4),
    VCATCH: extractBit(value, 3),
    DWTTRAP: extractBit(value, 2),
    BKPT: extractBit(value, 1),
    HALTED: extractBit(value, 0),
  };
}

/**
 * ============================================================================
 * DEBUG REGISTER DECODERS
 * ============================================================================
 */

/**
 * Decode DHCSR register
 */
export function decodeDhcsr(value: number): DhcsrRegister {
  return {
    raw: value,
    DBGKEY: extractBitField(value, 16, 16),
    S_RESET_ST: extractBit(value, 25),
    S_RETIRE_ST: extractBit(value, 24),
    S_LOCKUP: extractBit(value, 19),
    S_SLEEP: extractBit(value, 18),
    S_HALT: extractBit(value, 17),
    S_REGRDY: extractBit(value, 16),
    C_SNAPSTALL: extractBit(value, 5),
    C_MASKINTS: extractBit(value, 3),
    C_STEP: extractBit(value, 2),
    C_HALT: extractBit(value, 1),
    C_DEBUGEN: extractBit(value, 0),
  };
}

/**
 * Encode DHCSR register (with proper key)
 */
export function encodeDhcsr(dhcsr: Partial<DhcsrRegister>): number {
  let value = 0xa05f0000; // Always include the debug key
  if (dhcsr.C_SNAPSTALL) value = setBit(value, 5, true);
  if (dhcsr.C_MASKINTS) value = setBit(value, 3, true);
  if (dhcsr.C_STEP) value = setBit(value, 2, true);
  if (dhcsr.C_HALT) value = setBit(value, 1, true);
  if (dhcsr.C_DEBUGEN) value = setBit(value, 0, true);
  return value;
}

/**
 * Decode DCRSR register
 */
export function decodeDcrsr(value: number): DcrsrRegister {
  return {
    raw: value,
    REGWnR: extractBit(value, 16),
    REGSEL: extractBitField(value, 0, 5),
  };
}

/**
 * Encode DCRSR for reading a register
 */
export function encodeDcrsrRead(regNum: number): number {
  return regNum & 0x1f;
}

/**
 * Encode DCRSR for writing a register
 */
export function encodeDcrsrWrite(regNum: number): number {
  return (1 << 16) | (regNum & 0x1f);
}

/**
 * Decode DEMCR register
 */
export function decodeDemcr(value: number): DemcrRegister {
  return {
    raw: value,
    TRCENA: extractBit(value, 24),
    MON_REQ: extractBit(value, 19),
    MON_STEP: extractBit(value, 18),
    MON_PEND: extractBit(value, 17),
    MON_EN: extractBit(value, 16),
    VC_HARDERR: extractBit(value, 10),
    VC_INTERR: extractBit(value, 9),
    VC_BUSERR: extractBit(value, 8),
    VC_STATERR: extractBit(value, 7),
    VC_CHKERR: extractBit(value, 6),
    VC_NOCPERR: extractBit(value, 5),
    VC_MMERR: extractBit(value, 4),
    VC_CORERESET: extractBit(value, 0),
  };
}

/**
 * ============================================================================
 * FLASH PATCH AND BREAKPOINT (FPB) DECODERS
 * ============================================================================
 */

/**
 * Decode FP_CTRL register
 */
export function decodeFpCtrl(value: number): FpCtrlRegister {
  return {
    raw: value,
    NUM_CODE2: extractBitField(value, 12, 3),
    NUM_LIT: extractBitField(value, 8, 4),
    NUM_CODE1: extractBitField(value, 4, 4),
    KEY: extractBit(value, 1),
    ENABLE: extractBit(value, 0),
  };
}

/**
 * Get total number of code comparators from FP_CTRL
 */
export function getFpbCodeComparators(fpCtrl: FpCtrlRegister): number {
  return (fpCtrl.NUM_CODE2 << 4) | fpCtrl.NUM_CODE1;
}

/**
 * Decode FP_COMP register
 */
export function decodeFpComp(value: number): FpCompRegister {
  return {
    raw: value,
    REPLACE: extractBitField(value, 30, 2),
    COMP: extractBitField(value, 2, 28) << 2,
    ENABLE: extractBit(value, 0),
  };
}

/**
 * Encode FP_COMP for hardware breakpoint
 */
export function encodeFpComp(address: number, enable: boolean): number {
  let value = 0;
  value = setBitField(value, 30, 2, 0b10); // Breakpoint on both halfwords
  value = setBitField(value, 2, 28, address >>> 2);
  value = setBit(value, 0, enable);
  return value;
}

/**
 * ============================================================================
 * DATA WATCHPOINT AND TRACE (DWT) DECODERS
 * ============================================================================
 */

/**
 * Decode DWT_CTRL register
 */
export function decodeDwtCtrl(value: number): DwtCtrlRegister {
  return {
    raw: value,
    NUMCOMP: extractBitField(value, 28, 4),
    NOTRCPKT: extractBit(value, 27),
    NOEXTTRIG: extractBit(value, 26),
    NOCYCCNT: extractBit(value, 25),
    NOPRFCNT: extractBit(value, 24),
    CYCEVTENA: extractBit(value, 22),
    FOLDEVTENA: extractBit(value, 21),
    LSUEVTENA: extractBit(value, 20),
    SLEEPEVTENA: extractBit(value, 19),
    EXCEVTENA: extractBit(value, 18),
    CPIEVTENA: extractBit(value, 17),
    EXCTRCENA: extractBit(value, 16),
    PCSAMPLENA: extractBit(value, 12),
    SYNCTAP: extractBitField(value, 10, 2),
    CYCTAP: extractBit(value, 9),
    POSTINIT: extractBitField(value, 5, 4),
    POSTPRESET: extractBitField(value, 1, 4),
    CYCCNTENA: extractBit(value, 0),
  };
}

/**
 * Decode DWT_FUNCTION register
 */
export function decodeDwtFunction(value: number): DwtFunctionRegister {
  return {
    raw: value,
    MATCHED: extractBit(value, 24),
    DATAVSIZE: extractBitField(value, 10, 2),
    DATAVMATCH: extractBit(value, 8),
    CYCMATCH: extractBit(value, 7),
    EMITRANGE: extractBit(value, 5),
    FUNCTION: extractBitField(value, 0, 4),
  };
}

/**
 * ============================================================================
 * FPSCR (FPU STATUS AND CONTROL) DECODER
 * ============================================================================
 */

/**
 * Decode FPSCR register
 */
export function decodeFpscr(value: number): FpscrRegister {
  return {
    raw: value,
    N: extractBit(value, 31),
    Z: extractBit(value, 30),
    C: extractBit(value, 29),
    V: extractBit(value, 28),
    AHP: extractBit(value, 26),
    DN: extractBit(value, 25),
    FZ: extractBit(value, 24),
    RMode: extractBitField(value, 22, 2),
    IDC: extractBit(value, 7),
    IXC: extractBit(value, 4),
    UFC: extractBit(value, 3),
    OFC: extractBit(value, 2),
    DZC: extractBit(value, 1),
    IOC: extractBit(value, 0),
  };
}

/**
 * Get rounding mode as string
 */
export function getRoundingMode(fpscr: FpscrRegister): string {
  const modes = [
    "RN (Round to Nearest)",
    "RP (Round towards Plus Infinity)",
    "RM (Round towards Minus Infinity)",
    "RZ (Round towards Zero)",
  ];
  return modes[fpscr.RMode] || "Unknown";
}

/**
 * ============================================================================
 * REGISTER METADATA
 * ============================================================================
 */

/**
 * Get metadata for a core register
 */
export function getRegisterMetadata(name: CoreRegisterName): RegisterMetadata {
  const coreRegs: Record<CoreRegisterName, RegisterMetadata> = {
    r0: {
      name: "r0",
      number: 0,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "General Purpose Register 0",
    },
    r1: {
      name: "r1",
      number: 1,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "General Purpose Register 1",
    },
    r2: {
      name: "r2",
      number: 2,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "General Purpose Register 2",
    },
    r3: {
      name: "r3",
      number: 3,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "General Purpose Register 3",
    },
    r4: {
      name: "r4",
      number: 4,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "General Purpose Register 4",
    },
    r5: {
      name: "r5",
      number: 5,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "General Purpose Register 5",
    },
    r6: {
      name: "r6",
      number: 6,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "General Purpose Register 6",
    },
    r7: {
      name: "r7",
      number: 7,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "General Purpose Register 7",
    },
    r8: {
      name: "r8",
      number: 8,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "General Purpose Register 8",
    },
    r9: {
      name: "r9",
      number: 9,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "General Purpose Register 9",
    },
    r10: {
      name: "r10",
      number: 10,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "General Purpose Register 10",
    },
    r11: {
      name: "r11",
      number: 11,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "General Purpose Register 11 (Frame Pointer)",
    },
    r12: {
      name: "r12",
      number: 12,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "General Purpose Register 12",
    },
    sp: {
      name: "sp",
      number: 13,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "Stack Pointer",
    },
    lr: {
      name: "lr",
      number: 14,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "Link Register",
    },
    pc: {
      name: "pc",
      number: 15,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "Program Counter",
    },
    xpsr: {
      name: "xpsr",
      number: 16,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "Combined Program Status Register",
    },
    apsr: {
      name: "apsr",
      number: 16,
      size: 32,
      permissions: { readable: true, writable: false },
      description: "Application Program Status Register",
    },
    ipsr: {
      name: "ipsr",
      number: 16,
      size: 32,
      permissions: { readable: true, writable: false },
      description: "Interrupt Program Status Register",
    },
    epsr: {
      name: "epsr",
      number: 16,
      size: 32,
      permissions: { readable: true, writable: false },
      description: "Execution Program Status Register",
    },
    msp: {
      name: "msp",
      number: 17,
      size: 32,
      permissions: { readable: true, writable: true, privileged: true },
      description: "Main Stack Pointer",
    },
    psp: {
      name: "psp",
      number: 18,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "Process Stack Pointer",
    },
    primask: {
      name: "primask",
      number: 19,
      size: 32,
      permissions: { readable: true, writable: true, privileged: true },
      description: "Priority Mask Register",
    },
    faultmask: {
      name: "faultmask",
      number: 20,
      size: 32,
      permissions: { readable: true, writable: true, privileged: true },
      description: "Fault Mask Register",
    },
    basepri: {
      name: "basepri",
      number: 21,
      size: 32,
      permissions: { readable: true, writable: true, privileged: true },
      description: "Base Priority Register",
    },
    control: {
      name: "control",
      number: 22,
      size: 32,
      permissions: { readable: true, writable: true },
      description: "Control Register",
    },
  };

  return coreRegs[name];
}

/**
 * ============================================================================
 * FORMAT UTILITIES
 * ============================================================================
 */

/**
 * Format register value as hex string with appropriate width
 */
export function formatRegisterValue(
  value: number,
  size: RegisterSize = 32,
): string {
  const hexDigits = size / 4;
  return "0x" + value.toString(16).toUpperCase().padStart(hexDigits, "0");
}

/**
 * Format exception number as string
 */
export function formatExceptionNumber(exceptionNum: number): string {
  const exceptions: Record<number, string> = {
    0: "Thread mode",
    1: "Reserved",
    2: "NMI",
    3: "HardFault",
    4: "MemManage",
    5: "BusFault",
    6: "UsageFault",
    11: "SVCall",
    12: "DebugMonitor",
    14: "PendSV",
    15: "SysTick",
  };

  return (
    exceptions[exceptionNum] ||
    (exceptionNum >= 16 ? `IRQ${exceptionNum - 16}` : "Reserved")
  );
}

/**
 * Parse hex string to number
 */
export function parseHexValue(hexStr: string): number {
  const cleaned = hexStr.replace(/^0x/i, "");
  return parseInt(cleaned, 16);
}
