# Memory Detection & Protection Module

Comprehensive auto-detection and protection checking for embedded targets in BattleMagic.

## Overview

This module solves the problem of hardcoded memory addresses and provides intelligent MCU detection, memory layout discovery, and read protection status checking across different embedded platforms.

## Features

### Auto-Detection

- **MCU Type Detection**: Identifies STM32, nRF52, nRF51, ESP32, RP2040
- **Architecture Detection**: ARM Thumb, ARM, RISC-V
- **Memory Layout**: Automatically determines correct flash base address
- **Protection Status**: Detects RDP, APPROTECT, flash encryption

### Protection Checking

- **STM32**: RDP Level 0/1/2 detection
- **Nordic nRF**: APPROTECT status
- **ESP32**: Flash encryption detection
- **Generic**: Read access testing

### User Experience

- Clear error messages when protection is detected
- Step-by-step unlock instructions (with warnings!)
- Alternative analysis methods (upload binary files)
- Manual configuration override

## Architecture

### Components

#### 1. `types.ts`

Type definitions for the entire module:

- `McuFamily`: Enum of supported MCU families
- `Architecture`: Supported CPU architectures
- `ProtectionStatus`: Read/write protection states
- `MemoryDetectionResult`: Complete detection result

#### 2. `MemoryDetector.ts`

Auto-detects MCU type and memory configuration:

```typescript
const detector = new MemoryDetector(gdbClient);
const result = await detector.detect();

// result.mcu.family: 'NRF52' | 'STM32' | ...
// result.recommendedFlashBase: 0x00000000 (for NRF52)
// result.protection.status: 'None' | 'Read Protected' | ...
```

**Detection Methods:**

1. GDB `monitor version` command parsing
2. Memory probing at known flash addresses
3. Memory region query (if supported)

#### 3. `ProtectionChecker.ts`

Checks memory protection for specific MCU families:

```typescript
const checker = new ProtectionChecker(gdbClient);
const protection = await checker.check("NRF52", 0x00000000);

// protection.canRead: boolean
// protection.unlockInstructions: string[]
// protection.alternativeMethods: string[]
```

**Protection Mechanisms Detected:**

- **STM32 RDP**: Read Protection Levels 0, 1, 2
- **nRF52 APPROTECT**: Enabled/disabled via UICR register
- **ESP32 Flash Encryption**: Encrypted flash detection
- **Generic**: Memory read test fallback

### Integration with AnalysisPanel

The AnalysisPanel component uses the memory detection system:

1. **Auto-Detect Button**: Triggers full MCU detection
2. **Detection Results Display**: Shows MCU type, flash base, architecture
3. **Protection Status**: Visual indicator with unlock guidance
4. **Manual Override**: User can specify custom configuration
5. **Smart Analysis**: Uses detected config or manual override

## Usage

### Basic Auto-Detection

```typescript
import { MemoryDetector } from "./lib/memory";

const detector = new MemoryDetector(gdbClient);
const result = await detector.detect();

if (result.success) {
  console.log(`Detected: ${result.mcu.name}`);
  console.log(`Flash base: 0x${result.recommendedFlashBase.toString(16)}`);

  if (result.protection.canRead) {
    // Proceed with analysis
    const memory = await gdbClient.readMemory(
      result.recommendedFlashBase,
      result.recommendedReadSize,
    );
  } else {
    console.log("Protection enabled:", result.protection.details);
    console.log("Unlock instructions:", result.protection.unlockInstructions);
  }
}
```

### Manual Configuration

```typescript
const manualConfig: ManualMemoryConfig = {
  flashBase: 0x00000000, // Nordic nRF52
  readSize: 0x20000, // 128KB
  architecture: "ARM Thumb",
  force: true, // Override auto-detection
};
```

## Supported MCUs

### STM32 Family

- **Flash Base**: `0x08000000`
- **Protection**: RDP Levels 0/1/2
- **Detection Method**: `monitor option` command
- **Unlock**: STM32CubeProgrammer (WARNING: erases flash!)

### Nordic nRF52/nRF51

- **Flash Base**: `0x00000000`
- **Protection**: APPROTECT (UICR register)
- **Detection Method**: Read UICR `0x10001208`
- **Unlock**: `nrfjprog --recover` (WARNING: erases flash!)

### ESP32

- **Flash Base**: `0x40000000`
- **Protection**: Flash encryption
- **Detection Method**: Memory read test
- **Unlock**: Cannot disable once enabled

### Raspberry Pi RP2040

- **Flash Base**: `0x10000000`
- **Protection**: Usually none
- **Detection Method**: Memory read test

## Error Handling

The system provides helpful guidance when things go wrong:

### Read Protection Detected

```
Cannot read flash memory. Possible causes:
  - Read protection enabled (RDP/APPROTECT)
  - Incorrect flash address
  - Target not halted

Try: Auto-detect or manually configure flash address

Protection Status: Read Protected
APPROTECT enabled - debug access disabled, flash cannot be read
```

### Unlock Instructions (Example: STM32)

```
WARNING: Unlocking RDP will ERASE ALL FLASH MEMORY
1. Use STM32CubeProgrammer or OpenOCD
2. Connect via SWD
3. Read option bytes
4. Change RDP level to 0xAA (Level 0)
5. Flash will be erased automatically

Alternative: Analyze unprotected firmware backup
```

## UI Components

### Auto-Detect Button

Triggers MCU detection and displays results in the Target Configuration panel.

### Detection Results

Shows:

- MCU name and family
- Flash base address (hex)
- Architecture (ARM Thumb/ARM/RISC-V)
- Protection status (with visual indicator)

### Protection Warning

Red alert box with:

- Protection type (RDP/APPROTECT/etc.)
- Detailed explanation
- Expandable unlock instructions
- Alternative methods

### Manual Configuration

Collapsible panel with:

- Flash base address (hex input)
- Read size (dropdown)
- Architecture (dropdown)
- Force override checkbox

## Memory Regions

The detector identifies standard memory regions:

### STM32

```typescript
{
  name: 'Flash',
  start: 0x08000000,
  size: 0x10000,  // 64KB (varies by model)
  type: 'flash'
}
```

### nRF52840

```typescript
{
  name: 'Flash',
  start: 0x00000000,
  size: 0x100000,  // 1MB
  type: 'flash'
}
```

## Future Enhancements

- [ ] JTAG chain detection for multi-target systems
- [ ] Automatic size detection from ELF headers
- [ ] Support for external flash (QSPI/SPI)
- [ ] Memory protection bypass techniques (where legal)
- [ ] Cached detection results (localStorage)
- [ ] Import/export memory configurations
- [ ] Support for more MCU families (AVR, MSP430, etc.)

## Testing

### Manual Testing Checklist

- [ ] STM32 with RDP Level 0 (unprotected)
- [ ] STM32 with RDP Level 1 (protected)
- [ ] nRF52 with APPROTECT disabled
- [ ] nRF52 with APPROTECT enabled
- [ ] RP2040 (no protection)
- [ ] Manual override functionality
- [ ] Error handling (disconnected target)
- [ ] UI responsiveness

### Test with Real Hardware

```bash
# Connect to nRF52840
1. Connect BMP to nRF52840
2. Click "Quick Connect (SWD)"
3. Click "Auto-Detect" in Analysis Panel
4. Verify detection shows "nRF52840" and flash base 0x00000000
5. If APPROTECT enabled, verify warning appears
```

## License

Part of BattleMagic - Browser-based Reverse Engineering Tool
