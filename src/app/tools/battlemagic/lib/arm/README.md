# ARM Cortex-M Register Type Definitions

Comprehensive TypeScript type definitions for ARM Cortex-M microcontrollers, providing strongly-typed interfaces for all core registers, system control registers, debugging interfaces, and peripheral registers.

## Features

- **Complete Register Coverage**: All ARM Cortex-M core registers (R0-R12, SP, LR, PC, PSR, etc.)
- **System Control Block**: Full SCB register definitions with bit field access
- **Debug Registers**: DHCSR, DCRSR, DCRDR, DEMCR with utilities
- **FPU Support**: Floating-point registers (S0-S31, D0-D15, FPSCR)
- **Breakpoint/Watchpoint**: FPB and DWT register definitions
- **Bit Field Access**: Type-safe bit field extraction and manipulation
- **Architecture Detection**: CPU identification from CPUID register
- **Fault Analysis**: Decode and describe fault status registers

## Installation

```typescript
import {
  ArmCortexMRegisters,
  ProgramStatusRegister,
  SystemControlBlock,
  decodePsr,
  decodeCpuid,
  getCpuName,
  formatConditionFlags,
} from '@/app/tools/battlemagic/lib/arm';
```

## Usage Examples

### 1. Working with Core Registers

```typescript
import { ArmCortexMRegisters, formatRegisterValue } from '@/app/tools/battlemagic/lib/arm';

// Define a register set
const registers: ArmCortexMRegisters = {
  r0: 0x12345678,
  r1: 0xABCDEF00,
  r2: 0x00000000,
  r3: 0xFFFFFFFF,
  r4: 0x20000000,
  r5: 0x08000000,
  r6: 0x00000000,
  r7: 0x20004000,
  r8: 0x00000000,
  r9: 0x00000000,
  r10: 0x00000000,
  r11: 0x00000000,
  r12: 0x00000000,
  sp: 0x20005000,
  lr: 0x080001FF,
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

// Format register values
console.log(`PC: ${formatRegisterValue(registers.pc)}`); // "PC: 0x08000100"
console.log(`SP: ${formatRegisterValue(registers.sp)}`); // "SP: 0x20005000"
```

### 2. Decoding Program Status Register (PSR)

```typescript
import { decodePsr, formatConditionFlags } from '@/app/tools/battlemagic/lib/arm';

// PSR value from GDB
const xpsrValue = 0x61000000;

// Decode into structured fields
const psr = decodePsr(xpsrValue);

console.log('APSR Flags:');
console.log(`  Negative (N): ${psr.apsr.N}`);      // true
console.log(`  Zero (Z):     ${psr.apsr.Z}`);      // true
console.log(`  Carry (C):    ${psr.apsr.C}`);      // false
console.log(`  Overflow (V): ${psr.apsr.V}`);      // false
console.log(`  Formatted:    ${formatConditionFlags(psr.apsr)}`); // "NZ--"

console.log('\nIPSR:');
console.log(`  Exception:    ${psr.ipsr.exceptionNumber}`); // 0 (thread mode)

console.log('\nEPSR:');
console.log(`  Thumb bit:    ${psr.epsr.T}`); // true (always on Cortex-M)
```

### 3. CPU Identification

```typescript
import { decodeCpuid, getCpuName, getArchitecture } from '@/app/tools/battlemagic/lib/arm';

// Read CPUID register (0xE000ED00)
const cpuidValue = 0x410FC241; // Example: Cortex-M4

const cpuid = decodeCpuid(cpuidValue);

console.log('CPU Information:');
console.log(`  Implementer: 0x${cpuid.implementer.toString(16)}`); // 0x41 (ARM)
console.log(`  Part Number: 0x${cpuid.partno.toString(16)}`);      // 0xC24
console.log(`  Variant:     ${cpuid.variant}`);                    // 0
console.log(`  Revision:    ${cpuid.revision}`);                   // 1

console.log(`  CPU Name:    ${getCpuName(cpuid)}`);                // "Cortex-M4"
console.log(`  Architecture: ${getArchitecture(cpuid)}`);          // "ARMv7E-M"
```

### 4. Analyzing Fault Status

```typescript
import { decodeCfsr, describeCfsr, decodeHfsr } from '@/app/tools/battlemagic/lib/arm';

// Read CFSR register (0xE000ED28)
const cfsrValue = 0x00020000; // UsageFault: INVSTATE

const cfsr = decodeCfsr(cfsrValue);

// Get human-readable fault descriptions
const faults = describeCfsr(cfsr);
faults.forEach(fault => console.log(fault));
// Output: "UsageFault: Invalid state"

// Check specific fault bits
if (cfsr.UFSR.INVSTATE) {
  console.log('Invalid state detected - likely ARM/Thumb mode error');
}

if (cfsr.BFSR.PRECISERR) {
  console.log('Precise bus fault - check BFAR for fault address');
}

// Check HardFault status
const hfsrValue = 0x40000000;
const hfsr = decodeHfsr(hfsrValue);

if (hfsr.FORCED) {
  console.log('HardFault escalated from configurable fault - check CFSR');
}
```

### 5. Debug Control

```typescript
import {
  encodeDhcsr,
  decodeDhcsr,
  encodeDcrsrRead,
  encodeDcrsrWrite,
} from '@/app/tools/battlemagic/lib/arm';

// Enable debug mode and halt the CPU
const dhcsrHalt = encodeDhcsr({
  C_DEBUGEN: true,
  C_HALT: true,
  C_MASKINTS: false,
});

console.log(`DHCSR write value: 0x${dhcsrHalt.toString(16)}`);
// Output: "DHCSR write value: 0xa05f0003"

// Read DHCSR status
const dhcsrValue = 0x00030003;
const dhcsr = decodeDhcsr(dhcsrValue);

if (dhcsr.S_HALT) {
  console.log('CPU is halted');
}

if (dhcsr.S_REGRDY) {
  console.log('Core register data ready');
}

// Read R0 via debug interface
const dcrsrReadR0 = encodeDcrsrRead(0); // Register 0
console.log(`DCRSR (read R0): 0x${dcrsrReadR0.toString(16)}`);

// Write to R1 via debug interface
const dcrsrWriteR1 = encodeDcrsrWrite(1); // Register 1
console.log(`DCRSR (write R1): 0x${dcrsrWriteR1.toString(16)}`);
```

### 6. Hardware Breakpoints

```typescript
import {
  decodeFpCtrl,
  getFpbCodeComparators,
  encodeFpComp,
} from '@/app/tools/battlemagic/lib/arm';

// Read FP_CTRL to determine capabilities
const fpCtrlValue = 0x00000060; // 6 code comparators
const fpCtrl = decodeFpCtrl(fpCtrlValue);

const numBreakpoints = getFpbCodeComparators(fpCtrl);
console.log(`Hardware breakpoints available: ${numBreakpoints}`); // 6

// Set hardware breakpoint at 0x08000100
const breakpointAddress = 0x08000100;
const fpCompValue = encodeFpComp(breakpointAddress, true);

console.log(`FP_COMP[0] = 0x${fpCompValue.toString(16)}`);
// Set this value to 0xE0002008 (FP_COMP0)
```

### 7. Working with FPU Registers

```typescript
import { FpuRegisters, decodeFpscr, getRoundingMode } from '@/app/tools/battlemagic/lib/arm';

// FPU register set
const fpuRegs: Partial<FpuRegisters> = {
  s0: 0x3F800000,  // 1.0 in IEEE-754
  s1: 0x40000000,  // 2.0 in IEEE-754
  fpscr: 0x00000000,
};

// Decode FPSCR
const fpscr = decodeFpscr(fpuRegs.fpscr!);

console.log('FPU Status:');
console.log(`  Rounding Mode: ${getRoundingMode(fpscr)}`);
console.log(`  Flush-to-Zero: ${fpscr.FZ}`);
console.log(`  Default NaN:   ${fpscr.DN}`);

// Check exception flags
if (fpscr.IOC) console.log('  Invalid operation detected');
if (fpscr.DZC) console.log('  Divide by zero detected');
if (fpscr.OFC) console.log('  Overflow detected');
if (fpscr.UFC) console.log('  Underflow detected');
if (fpscr.IXC) console.log('  Inexact result detected');
```

### 8. Register Metadata

```typescript
import { getRegisterMetadata, RegisterName } from '@/app/tools/battlemagic/lib/arm';

const regNames: RegisterName[] = ['r0', 'sp', 'pc', 'primask'];

regNames.forEach(name => {
  const meta = getRegisterMetadata(name as any);
  console.log(`${meta.name.toUpperCase()}:`);
  console.log(`  GDB Number:  ${meta.number}`);
  console.log(`  Size:        ${meta.size} bits`);
  console.log(`  Readable:    ${meta.permissions.readable}`);
  console.log(`  Writable:    ${meta.permissions.writable}`);
  console.log(`  Privileged:  ${meta.permissions.privileged || false}`);
  console.log(`  Description: ${meta.description}`);
  console.log();
});
```

### 9. Register Snapshots

```typescript
import { RegisterSnapshot, RegisterChange } from '@/app/tools/battlemagic/lib/arm';

// Capture register state
const snapshot: RegisterSnapshot = {
  timestamp: Date.now(),
  registers: {
    r0: 0x00000000,
    r1: 0x12345678,
    // ... other registers
    pc: 0x08000100,
    xpsr: 0x61000000,
    // ... rest of registers
  } as any,
  scb: {
    ICSR: {
      raw: 0x00000000,
      VECTACTIVE: 0,
      VECTPENDING: 0,
      // ... other fields
    } as any,
  },
};

// Track register changes
const changes: RegisterChange[] = [
  {
    name: 'r0',
    oldValue: 0x00000000,
    newValue: 0x12345678,
    timestamp: Date.now(),
  },
  {
    name: 'pc',
    oldValue: 0x08000100,
    newValue: 0x08000104,
    timestamp: Date.now(),
  },
];

changes.forEach(change => {
  console.log(`${change.name}: 0x${change.oldValue.toString(16)} -> 0x${change.newValue.toString(16)}`);
});
```

### 10. Complete System State

```typescript
import {
  ArmCortexMRegisters,
  SystemControlBlock,
  DebugRegisters,
  decodeCpuid,
  decodeIcsr,
  decodeDhcsr,
  formatExceptionNumber,
} from '@/app/tools/battlemagic/lib/arm';

interface SystemState {
  core: ArmCortexMRegisters;
  scb: SystemControlBlock;
  debug: DebugRegisters;
}

function analyzeSystemState(state: SystemState): void {
  // Identify CPU
  const cpuName = getCpuName(state.scb.CPUID);
  console.log(`CPU: ${cpuName}`);

  // Check execution state
  const activeException = formatExceptionNumber(state.scb.ICSR.VECTACTIVE);
  const pendingException = formatExceptionNumber(state.scb.ICSR.VECTPENDING);

  console.log(`Active Exception:  ${activeException}`);
  console.log(`Pending Exception: ${pendingException}`);

  // Debug state
  if (state.debug.DHCSR.S_HALT) {
    console.log('CPU is halted by debugger');
  }

  if (state.debug.DHCSR.S_LOCKUP) {
    console.log('WARNING: CPU is in lockup state');
  }

  // Check for faults
  const faults = describeCfsr(state.scb.CFSR);
  if (faults.length > 0) {
    console.log('\nActive Faults:');
    faults.forEach(fault => console.log(`  - ${fault}`));
  }

  // Memory fault address
  if (state.scb.CFSR.MMFSR.MMARVALID) {
    console.log(`MemManage Fault Address: 0x${state.scb.MMFAR.toString(16)}`);
  }

  if (state.scb.CFSR.BFSR.BFARVALID) {
    console.log(`BusFault Address: 0x${state.scb.BFAR.toString(16)}`);
  }
}
```

## Type Reference

### Core Types

- `ArmCortexMRegisters` - Complete core register set
- `GeneralPurposeRegisters` - R0-R12 only
- `StackPointers` - SP, MSP, PSP
- `SpecialRegisters` - PRIMASK, FAULTMASK, BASEPRI, CONTROL
- `FpuRegisters` - S0-S31, D0-D15, FPSCR

### System Control Block

- `SystemControlBlock` - Complete SCB register set
- `CpuidRegister` - CPU identification
- `IcsrRegister` - Interrupt control and status
- `VtorRegister` - Vector table offset
- `AircrRegister` - Application interrupt and reset control
- `CfsrRegister` - Configurable fault status
- `HfsrRegister` - HardFault status
- `DfsrRegister` - Debug fault status

### Debug Registers

- `DebugRegisters` - Complete debug register set
- `DhcsrRegister` - Debug halting control and status
- `DcrsrRegister` - Debug core register selector
- `DemcrRegister` - Debug exception and monitor control

### Breakpoints and Watchpoints

- `FlashPatchBreakpoint` - FPB unit registers
- `DataWatchpointTrace` - DWT unit registers

## Architecture Support

This module supports the following ARM Cortex-M variants:

| Architecture | Cores | Features |
|--------------|-------|----------|
| ARMv6-M | Cortex-M0, M0+, M1 | Basic instruction set |
| ARMv7-M | Cortex-M3 | Full instruction set, MPU |
| ARMv7E-M | Cortex-M4, M7 | DSP, optional FPU |
| ARMv8-M.BASE | Cortex-M23 | TrustZone security |
| ARMv8-M.MAIN | Cortex-M33, M35P | Full features, TrustZone |

## Memory Map Reference

### System Control Space (SCS)

| Register | Address | Description |
|----------|---------|-------------|
| CPUID | 0xE000ED00 | CPU ID Base Register |
| ICSR | 0xE000ED04 | Interrupt Control State |
| VTOR | 0xE000ED08 | Vector Table Offset |
| AIRCR | 0xE000ED0C | Application Interrupt/Reset Control |
| SCR | 0xE000ED10 | System Control |
| CCR | 0xE000ED14 | Configuration Control |
| SHPR1-3 | 0xE000ED18-20 | System Handler Priority |
| SHCSR | 0xE000ED24 | System Handler Control State |
| CFSR | 0xE000ED28 | Configurable Fault Status |
| HFSR | 0xE000ED2C | HardFault Status |
| DFSR | 0xE000ED30 | Debug Fault Status |
| MMFAR | 0xE000ED34 | MemManage Fault Address |
| BFAR | 0xE000ED38 | BusFault Address |

### Debug Registers

| Register | Address | Description |
|----------|---------|-------------|
| DHCSR | 0xE000EDF0 | Debug Halting Control/Status |
| DCRSR | 0xE000EDF4 | Debug Core Register Selector |
| DCRDR | 0xE000EDF8 | Debug Core Register Data |
| DEMCR | 0xE000EDFC | Debug Exception/Monitor Control |

### Flash Patch and Breakpoint (FPB)

| Register | Address | Description |
|----------|---------|-------------|
| FP_CTRL | 0xE0002000 | Flash Patch Control |
| FP_REMAP | 0xE0002004 | Flash Patch Remap |
| FP_COMP0-7 | 0xE0002008-24 | Flash Patch Comparators |

### Data Watchpoint and Trace (DWT)

| Register | Address | Description |
|----------|---------|-------------|
| DWT_CTRL | 0xE0001000 | DWT Control |
| DWT_CYCCNT | 0xE0001004 | Cycle Counter |
| DWT_COMP0-3 | 0xE0001020-50 | Comparators |

## References

- [ARMv7-M Architecture Reference Manual](https://developer.arm.com/documentation/ddi0403/)
- [Cortex-M Programming Guide](https://developer.arm.com/documentation/den0042/)
- [ARM Debug Interface Architecture](https://developer.arm.com/documentation/ihi0031/)

## License

Part of the BattleMagic debugger project.
