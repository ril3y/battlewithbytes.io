/**
 * ARM Cortex-M Type Definitions - Usage Examples
 *
 * This file demonstrates practical usage of the ARM register type definitions.
 * These examples show how to integrate the types with debugger operations.
 */

import {
  ArmCortexMRegisters,
  SystemControlBlock,
  RegisterSnapshot,
  CpuFeatures,
  ArmArchitecture,
  decodePsr,
  decodeCpuid,
  decodeIcsr,
  decodeCfsr,
  decodeHfsr,
  decodeDhcsr,
  encodeDhcsr,
  encodeDcrsrRead,
  decodeFpCtrl,
  getFpbCodeComparators,
  encodeFpComp,
  getCpuName,
  getArchitecture,
  describeCfsr,
  formatConditionFlags,
  formatExceptionNumber,
  formatRegisterValue,
  getRegisterMetadata,
} from "./index";

import {
  SCB_ADDRESSES,
  DEBUG_ADDRESSES,
  FPB_ADDRESSES,
  CORE_REGISTER_NUMBERS,
  EXCEPTION_NUMBERS,
} from "./constants";

/**
 * ============================================================================
 * EXAMPLE 1: Reading and Decoding Core Registers
 * ============================================================================
 */
export function exampleReadCoreRegisters(): void {
  // Simulated register values from GDB
  const registers: ArmCortexMRegisters = {
    r0: 0x00000042,
    r1: 0x20001000,
    r2: 0x00000001,
    r3: 0xdeadbeef,
    r4: 0x12345678,
    r5: 0x00000000,
    r6: 0x00000000,
    r7: 0x20004f00,
    r8: 0x00000000,
    r9: 0x00000000,
    r10: 0x00000000,
    r11: 0x00000000,
    r12: 0x00000000,
    sp: 0x20005000,
    lr: 0x080001ff,
    pc: 0x08000100,
    xpsr: 0x61000000,
    apsr: 0x60000000,
    ipsr: 0x00000000,
    epsr: 0x01000000,
    msp: 0x20005000,
    psp: 0x20003000,
    primask: 0,
    faultmask: 0,
    basepri: 0,
    control: 0x00,
  };

  console.log("=== Core Registers ===");
  console.log(`PC:  ${formatRegisterValue(registers.pc)}`);
  console.log(`SP:  ${formatRegisterValue(registers.sp)}`);
  console.log(`LR:  ${formatRegisterValue(registers.lr)}`);
  console.log(`R0:  ${formatRegisterValue(registers.r0)}`);

  // Decode PSR
  const psr = decodePsr(registers.xpsr);
  console.log("\n=== Program Status Register ===");
  console.log(`Flags: ${formatConditionFlags(psr.apsr)}`);
  console.log(`Exception: ${formatExceptionNumber(psr.ipsr.exceptionNumber)}`);
  console.log(`Thumb: ${psr.epsr.T}`);
}

/**
 * ============================================================================
 * EXAMPLE 2: CPU Identification
 * ============================================================================
 */
export async function exampleIdentifyCpu(
  readMemory: (address: number) => Promise<number>,
): Promise<CpuFeatures> {
  // Read CPUID register
  const cpuidValue = await readMemory(SCB_ADDRESSES.CPUID);
  const cpuid = decodeCpuid(cpuidValue);

  const cpuName = getCpuName(cpuid);
  const architecture = getArchitecture(cpuid);

  console.log("=== CPU Identification ===");
  console.log(`CPU: ${cpuName}`);
  console.log(`Architecture: ${architecture}`);
  console.log(`Implementer: 0x${cpuid.implementer.toString(16)}`);
  console.log(`Part Number: 0x${cpuid.partno.toString(16)}`);
  console.log(`Variant: ${cpuid.variant}`);
  console.log(`Revision: ${cpuid.revision}`);

  // Determine features based on CPU
  const features: CpuFeatures = {
    architecture,
    hasFpu: architecture === ArmArchitecture.ARMv7EM, // M4/M7 may have FPU
    hasDsp: architecture === ArmArchitecture.ARMv7EM,
    hasMpu: architecture !== ArmArchitecture.ARMv6M,
    hasSecurityExtension: architecture === ArmArchitecture.ARMv8M_MAIN,
    numBreakpoints: 6, // Read from FP_CTRL in practice
    numWatchpoints: 4, // Read from DWT_CTRL in practice
  };

  return features;
}

/**
 * ============================================================================
 * EXAMPLE 3: Fault Analysis
 * ============================================================================
 */
export async function exampleAnalyzeFault(
  readMemory: (address: number) => Promise<number>,
): Promise<void> {
  console.log("=== Fault Analysis ===");

  // Read fault status registers
  const cfsrValue = await readMemory(SCB_ADDRESSES.CFSR);
  const hfsrValue = await readMemory(SCB_ADDRESSES.HFSR);
  const mmfarValue = await readMemory(SCB_ADDRESSES.MMFAR);
  const bfarValue = await readMemory(SCB_ADDRESSES.BFAR);

  const cfsr = decodeCfsr(cfsrValue);
  const hfsr = decodeHfsr(hfsrValue);

  // Check for HardFault
  if (hfsr.FORCED) {
    console.log("HardFault (escalated from configurable fault)");
  }

  if (hfsr.VECTTBL) {
    console.log("HardFault: Vector table read error");
  }

  // Decode and display all active faults
  const faults = describeCfsr(cfsr);
  if (faults.length > 0) {
    console.log("\nActive Faults:");
    faults.forEach((fault) => console.log(`  - ${fault}`));
  } else {
    console.log("No active faults");
  }

  // Display fault addresses if valid
  if (cfsr.MMFSR.MMARVALID) {
    console.log(
      `\nMemManage Fault Address: ${formatRegisterValue(mmfarValue)}`,
    );
  }

  if (cfsr.BFSR.BFARVALID) {
    console.log(`BusFault Address: ${formatRegisterValue(bfarValue)}`);
  }
}

/**
 * ============================================================================
 * EXAMPLE 4: Debug Control - Halt CPU
 * ============================================================================
 */
export async function exampleHaltCpu(
  writeMemory: (address: number, value: number) => Promise<void>,
  readMemory: (address: number) => Promise<number>,
): Promise<boolean> {
  console.log("=== Halting CPU ===");

  // Enable debug and request halt
  const dhcsrHalt = encodeDhcsr({
    C_DEBUGEN: true,
    C_HALT: true,
    C_MASKINTS: false,
  });

  await writeMemory(DEBUG_ADDRESSES.DHCSR, dhcsrHalt);

  // Poll for halt status
  for (let i = 0; i < 10; i++) {
    const dhcsrValue = await readMemory(DEBUG_ADDRESSES.DHCSR);
    const dhcsr = decodeDhcsr(dhcsrValue);

    if (dhcsr.S_HALT) {
      console.log("CPU halted successfully");
      return true;
    }

    // Wait a bit before polling again
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  console.log("Failed to halt CPU");
  return false;
}

/**
 * ============================================================================
 * EXAMPLE 5: Single Stepping
 * ============================================================================
 */
export async function exampleSingleStep(
  writeMemory: (address: number, value: number) => Promise<void>,
  readMemory: (address: number) => Promise<number>,
): Promise<number> {
  console.log("=== Single Step ===");

  // Read current PC
  const dcrsrReadPC = encodeDcrsrRead(CORE_REGISTER_NUMBERS.PC);
  await writeMemory(DEBUG_ADDRESSES.DCRSR, dcrsrReadPC);

  // Wait for register ready
  let dhcsrValue = await readMemory(DEBUG_ADDRESSES.DHCSR);
  let dhcsr = decodeDhcsr(dhcsrValue);
  while (!dhcsr.S_REGRDY) {
    await new Promise((resolve) => setTimeout(resolve, 1));
    dhcsrValue = await readMemory(DEBUG_ADDRESSES.DHCSR);
    dhcsr = decodeDhcsr(dhcsrValue);
  }

  const pcBefore = await readMemory(DEBUG_ADDRESSES.DCRDR);
  console.log(`PC before step: ${formatRegisterValue(pcBefore)}`);

  // Execute single step
  const dhcsrStep = encodeDhcsr({
    C_DEBUGEN: true,
    C_MASKINTS: true,
    C_STEP: true,
  });

  await writeMemory(DEBUG_ADDRESSES.DHCSR, dhcsrStep);

  // Wait for halt after step
  do {
    await new Promise((resolve) => setTimeout(resolve, 1));
    dhcsrValue = await readMemory(DEBUG_ADDRESSES.DHCSR);
    dhcsr = decodeDhcsr(dhcsrValue);
  } while (!dhcsr.S_HALT);

  // Read PC after step
  await writeMemory(DEBUG_ADDRESSES.DCRSR, dcrsrReadPC);
  const pcAfter = await readMemory(DEBUG_ADDRESSES.DCRDR);
  console.log(`PC after step:  ${formatRegisterValue(pcAfter)}`);

  return pcAfter;
}

/**
 * ============================================================================
 * EXAMPLE 6: Setting Hardware Breakpoints
 * ============================================================================
 */
export async function exampleSetBreakpoint(
  writeMemory: (address: number, value: number) => Promise<void>,
  readMemory: (address: number) => Promise<number>,
  breakpointAddress: number,
): Promise<boolean> {
  console.log("=== Setting Hardware Breakpoint ===");

  // Read FP_CTRL to check capabilities
  const fpCtrlValue = await readMemory(FPB_ADDRESSES.FP_CTRL);
  const fpCtrl = decodeFpCtrl(fpCtrlValue);

  const numBreakpoints = getFpbCodeComparators(fpCtrl);
  console.log(`Available hardware breakpoints: ${numBreakpoints}`);

  if (numBreakpoints === 0) {
    console.log("No hardware breakpoints available");
    return false;
  }

  // Enable FPB unit
  if (!fpCtrl.ENABLE) {
    console.log("Enabling FPB unit...");
    await writeMemory(FPB_ADDRESSES.FP_CTRL, fpCtrlValue | 0x3); // KEY=1, ENABLE=1
  }

  // Set breakpoint in first comparator
  const fpCompValue = encodeFpComp(breakpointAddress, true);
  await writeMemory(FPB_ADDRESSES.FP_COMP0, fpCompValue);

  console.log(`Breakpoint set at ${formatRegisterValue(breakpointAddress)}`);
  return true;
}

/**
 * ============================================================================
 * EXAMPLE 7: Reading All Registers for Snapshot
 * ============================================================================
 */
export async function exampleCaptureSnapshot(
  readMemory: (address: number) => Promise<number>,
): Promise<RegisterSnapshot> {
  console.log("=== Capturing Register Snapshot ===");

  // This would typically use GDB 'g' command to read all registers at once
  // For demonstration, we'll show the structure

  const registers: ArmCortexMRegisters = {
    r0: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.R0,
    ),
    r1: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.R1,
    ),
    r2: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.R2,
    ),
    r3: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.R3,
    ),
    r4: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.R4,
    ),
    r5: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.R5,
    ),
    r6: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.R6,
    ),
    r7: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.R7,
    ),
    r8: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.R8,
    ),
    r9: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.R9,
    ),
    r10: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.R10,
    ),
    r11: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.R11,
    ),
    r12: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.R12,
    ),
    sp: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.SP,
    ),
    lr: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.LR,
    ),
    pc: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.PC,
    ),
    xpsr: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.XPSR,
    ),
    apsr: 0,
    ipsr: 0,
    epsr: 0,
    msp: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.MSP,
    ),
    psp: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.PSP,
    ),
    primask: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.PRIMASK,
    ),
    faultmask: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.FAULTMASK,
    ),
    basepri: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.BASEPRI,
    ),
    control: await readRegisterViaDebug(
      readMemory,
      writeMemoryStub,
      CORE_REGISTER_NUMBERS.CONTROL,
    ),
  };

  // Read SCB registers
  const scb: Partial<SystemControlBlock> = {
    CPUID: decodeCpuid(await readMemory(SCB_ADDRESSES.CPUID)),
    ICSR: decodeIcsr(await readMemory(SCB_ADDRESSES.ICSR)),
    CFSR: decodeCfsr(await readMemory(SCB_ADDRESSES.CFSR)),
    HFSR: decodeHfsr(await readMemory(SCB_ADDRESSES.HFSR)),
  };

  const snapshot: RegisterSnapshot = {
    timestamp: Date.now(),
    registers,
    scb,
  };

  console.log("Snapshot captured");
  return snapshot;
}

/**
 * Helper function to read a register via debug interface
 */
async function readRegisterViaDebug(
  readMemory: (address: number) => Promise<number>,
  writeMemory: (address: number, value: number) => Promise<void>,
  regNum: number,
): Promise<number> {
  // Write register selector
  const dcrsrRead = encodeDcrsrRead(regNum);
  await writeMemory(DEBUG_ADDRESSES.DCRSR, dcrsrRead);

  // Wait for register ready
  let dhcsrValue = await readMemory(DEBUG_ADDRESSES.DHCSR);
  let dhcsr = decodeDhcsr(dhcsrValue);
  let timeout = 100;
  while (!dhcsr.S_REGRDY && timeout-- > 0) {
    await new Promise((resolve) => setTimeout(resolve, 1));
    dhcsrValue = await readMemory(DEBUG_ADDRESSES.DHCSR);
    dhcsr = decodeDhcsr(dhcsrValue);
  }

  // Read register data
  return await readMemory(DEBUG_ADDRESSES.DCRDR);
}

// Stub for examples that need write capability
const writeMemoryStub = async (): Promise<void> => {
  // Stub implementation
};

/**
 * ============================================================================
 * EXAMPLE 8: Register Metadata Query
 * ============================================================================
 */
export function exampleRegisterMetadata(): void {
  console.log("=== Register Metadata ===");

  const registers = ["r0", "sp", "pc", "primask", "control"] as const;

  registers.forEach((regName) => {
    const meta = getRegisterMetadata(regName);
    console.log(`\n${meta.name.toUpperCase()}:`);
    console.log(`  GDB #: ${meta.number}`);
    console.log(`  Size: ${meta.size} bits`);
    console.log(
      `  R: ${meta.permissions.readable}, W: ${meta.permissions.writable}`,
    );
    if (meta.permissions.privileged) {
      console.log("  Requires privileged mode");
    }
    console.log(`  ${meta.description}`);
  });
}

/**
 * ============================================================================
 * EXAMPLE 9: Exception Handling State
 * ============================================================================
 */
export async function exampleExceptionState(
  readMemory: (address: number) => Promise<number>,
): Promise<void> {
  console.log("=== Exception State ===");

  const icsrValue = await readMemory(SCB_ADDRESSES.ICSR);
  const icsr = decodeIcsr(icsrValue);

  console.log(`Active Exception:  ${formatExceptionNumber(icsr.VECTACTIVE)}`);
  console.log(`Pending Exception: ${formatExceptionNumber(icsr.VECTPENDING)}`);
  console.log(`Return to Base:    ${icsr.RETTOBASE}`);
  console.log(`ISR Pending:       ${icsr.ISRPENDING}`);
  console.log(`ISR Preempted:     ${icsr.ISRPREEMPT}`);

  if (icsr.VECTACTIVE === EXCEPTION_NUMBERS.THREAD_MODE) {
    console.log("Currently in Thread mode");
  } else {
    console.log("Currently in Handler mode");
  }
}

/**
 * ============================================================================
 * EXAMPLE 10: Complete Debug Session
 * ============================================================================
 */
export async function exampleCompleteDebugSession(
  readMemory: (address: number) => Promise<number>,
  writeMemory: (address: number, value: number) => Promise<void>,
): Promise<void> {
  console.log("=== Complete Debug Session ===\n");

  // 1. Identify CPU
  const features = await exampleIdentifyCpu(readMemory);
  console.log(`\nFeatures: FPU=${features.hasFpu}, DSP=${features.hasDsp}`);

  // 2. Halt the CPU
  const halted = await exampleHaltCpu(writeMemory, readMemory);
  if (!halted) {
    console.log("Failed to halt CPU, aborting");
    return;
  }

  // 3. Capture initial state
  const snapshot = await exampleCaptureSnapshot(readMemory);
  console.log(`\nInitial PC: ${formatRegisterValue(snapshot.registers.pc)}`);

  // 4. Check for any faults
  await exampleAnalyzeFault(readMemory);

  // 5. Set a breakpoint
  const breakpointAddress = 0x08000200;
  await exampleSetBreakpoint(writeMemory, readMemory, breakpointAddress);

  // 6. Single step
  const newPC = await exampleSingleStep(writeMemory, readMemory);
  console.log(`\nStepped to: ${formatRegisterValue(newPC)}`);

  console.log("\n=== Debug Session Complete ===");
}
