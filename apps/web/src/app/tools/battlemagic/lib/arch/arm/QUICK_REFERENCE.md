# ARM Cortex-M Types - Quick Reference

## Import Statement

```typescript
import {
  // Common types
  ArmCortexMRegisters,
  ProgramStatusRegister,
  SystemControlBlock,

  // Decoders
  decodePsr,
  decodeCpuid,
  decodeCfsr,
  decodeDhcsr,

  // Encoders
  encodeDhcsr,
  encodeAircr,
  encodeFpComp,

  // Utilities
  getCpuName,
  describeCfsr,
  formatConditionFlags,
  getRegisterMetadata,

  // Constants
  SCB_ADDRESSES,
  DEBUG_ADDRESSES,
  CORE_REGISTER_NUMBERS,
} from '@/app/tools/battlemagic/lib/arm';
```

## Common Operations

### Read and Decode PSR
```typescript
const psr = decodePsr(registers.xpsr);
console.log(`Flags: ${formatConditionFlags(psr.apsr)}`); // "NZ--"
console.log(`Exception: ${psr.ipsr.exceptionNumber}`);
```

### Identify CPU
```typescript
const cpuid = decodeCpuid(await readMemory(SCB_ADDRESSES.CPUID));
const name = getCpuName(cpuid);        // "Cortex-M4"
const arch = getArchitecture(cpuid);   // ARMv7E-M
```

### Analyze Faults
```typescript
const cfsr = decodeCfsr(await readMemory(SCB_ADDRESSES.CFSR));
const faults = describeCfsr(cfsr);
faults.forEach(f => console.log(f));
// ["UsageFault: Undefined instruction"]
```

### Halt CPU
```typescript
const dhcsrValue = encodeDhcsr({ C_DEBUGEN: true, C_HALT: true });
await writeMemory(DEBUG_ADDRESSES.DHCSR, dhcsrValue);

// Check if halted
const dhcsr = decodeDhcsr(await readMemory(DEBUG_ADDRESSES.DHCSR));
if (dhcsr.S_HALT) { /* halted */ }
```

### Set Breakpoint
```typescript
const fpComp = encodeFpComp(0x08000100, true);
await writeMemory(FPB_ADDRESSES.FP_COMP0, fpComp);
```

### Read Register via Debug Interface
```typescript
const dcrsr = encodeDcrsrRead(CORE_REGISTER_NUMBERS.PC);
await writeMemory(DEBUG_ADDRESSES.DCRSR, dcrsr);
const pc = await readMemory(DEBUG_ADDRESSES.DCRDR);
```

## Key Addresses

| Register | Address | Constant |
|----------|---------|----------|
| CPUID | 0xE000ED00 | `SCB_ADDRESSES.CPUID` |
| DHCSR | 0xE000EDF0 | `DEBUG_ADDRESSES.DHCSR` |
| CFSR | 0xE000ED28 | `SCB_ADDRESSES.CFSR` |
| FP_CTRL | 0xE0002000 | `FPB_ADDRESSES.FP_CTRL` |

## Register Numbers (GDB)

| Register | Number | Constant |
|----------|--------|----------|
| R0-R12 | 0-12 | `CORE_REGISTER_NUMBERS.R0` ... |
| SP | 13 | `CORE_REGISTER_NUMBERS.SP` |
| LR | 14 | `CORE_REGISTER_NUMBERS.LR` |
| PC | 15 | `CORE_REGISTER_NUMBERS.PC` |
| xPSR | 16 | `CORE_REGISTER_NUMBERS.XPSR` |
| MSP | 17 | `CORE_REGISTER_NUMBERS.MSP` |
| PSP | 18 | `CORE_REGISTER_NUMBERS.PSP` |

## PSR Flags

| Flag | Bit | Meaning |
|------|-----|---------|
| N | 31 | Negative |
| Z | 30 | Zero |
| C | 29 | Carry |
| V | 28 | Overflow |
| Q | 27 | Saturation |
| T | 24 | Thumb (always 1) |

## Exception Numbers

| Number | Exception |
|--------|-----------|
| 0 | Thread mode |
| 2 | NMI |
| 3 | HardFault |
| 4 | MemManage |
| 5 | BusFault |
| 6 | UsageFault |
| 11 | SVCall |
| 14 | PendSV |
| 15 | SysTick |
| 16+ | IRQ0-N |

## Magic Keys

```typescript
DHCSR_DBGKEY = 0xA05F  // Must be in bits 31:16 for DHCSR writes
AIRCR_VECTKEY = 0x05FA // Must be in bits 31:16 for AIRCR writes
```

Encoders automatically include these keys.

## Architecture Detection

```typescript
const arch = getArchitecture(cpuid);
// ARMv6M, ARMv7M, ARMv7EM, ARMv8M_BASE, ARMv8M_MAIN
```

## CPU Part Numbers

| Part | Name |
|------|------|
| 0xC20 | Cortex-M0 |
| 0xC60 | Cortex-M0+ |
| 0xC23 | Cortex-M3 |
| 0xC24 | Cortex-M4 |
| 0xC27 | Cortex-M7 |
| 0xD21 | Cortex-M33 |
