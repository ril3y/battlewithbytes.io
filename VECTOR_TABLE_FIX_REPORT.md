# Vector Table Detection Issue - Investigation Report

## Problem Statement

The WASM analyzer detects only 1 valid vector table entry (Initial_SP) out of 256 possible entries in the 256KB STM32 firmware. All interrupt/exception handler vectors (Reset_Handler, NMI_Handler, etc.) are being marked as invalid.

## Root Cause Analysis

### 1. Firmware Data Analysis

Examining the firmware binary (`firmware_Unknown_(already_attached)_1763317348910.bin`):

```
Offset  | Value      | Vector Name       | Handler Address | Status
--------|------------|-------------------|-----------------|--------
0x0000  | 0x20000400 | Initial_SP        | 0x20000400      | VALID
0x0004  | 0x000008E9 | Reset_Handler     | 0x000008E8      | INVALID
0x0008  | 0x0000057D | NMI_Handler       | 0x0000057C      | INVALID
0x000C  | 0x000008C9 | HardFault_Handler | 0x000008C8      | INVALID
...
```

Key observations:
- Initial_SP = `0x20000400` (valid RAM address)
- All handler addresses are in range `0x0000057C - 0x0000090C`
- All handlers have Thumb bit set correctly (bit 0 = 1)
- Handlers point to addresses **below 0x08000000**

### 2. Memory Mapping Issue

**The Problem:** STM32 microcontrollers use memory aliasing at boot:

1. **Physical Flash Location**: `0x08000000 - 0x08040000` (256KB)
2. **Boot Alias**: Flash is ALSO mapped to `0x00000000 - 0x00040000`
3. **Vector Table Content**: Contains addresses relative to the boot alias (`0x00000000`)

When firmware is compiled and linked:
- Linker places code at address `0x00000000` (boot configuration)
- Vector table entries reference code starting at `0x00000000`
- At runtime, the MCU boots from the aliased region at `0x00000000`

When firmware is dumped via GDB:
- GDB reads from physical flash at `0x08000000`
- Firmware content is unchanged (still references `0x00000000` addresses)
- WASM analyzer is told baseAddress = `0x08000000`

### 3. Validation Logic Failure

In `packages/battlemagic-analyzer/src/analysis/vector_table.rs` line 203:

```rust
// Check if address is within firmware bounds
if handler_addr < firmware_start || handler_addr >= firmware_end {
    return false;
}
```

With current setup:
- `firmware_start` = `0x08000000`
- `firmware_end` = `0x08040000`
- `handler_addr` = `0x000008E8` (Reset_Handler)
- Validation: `0x000008E8 < 0x08000000` → **FAIL**

## Verification

Tested with correct base address:

### Test 1: Base Address = 0x08000000 (Current - WRONG)
```
Summary: 1 valid, 63 invalid
Rejection: 58 out-of-bounds, 5 zero/unprogrammed
```

### Test 2: Base Address = 0x00000000 (CORRECT)
```
Summary: 59 valid, 5 invalid
Rejection: 0 out-of-bounds, 5 zero/unprogrammed (expected - reserved vectors)
Valid Handlers:
  - Reset_Handler: 0x000008E8
  - NMI_Handler: 0x0000057C
  - HardFault_Handler: 0x000008C8
  ... and 56 more
```

## Solution Options

### Option 1: Fix at Firmware Dump Level (RECOMMENDED)

**File**: `apps/web/src/app/tools/battlemagic/lib/firmware/FirmwareExtractor.ts`

Detect boot aliasing and adjust baseAddress accordingly:

```typescript
export async function dumpFirmware(
  gdbClient: GdbClient,
  archInfo: ArchitectureInfo,
  progressCallback?: (progress: number, bytesRead: number, totalBytes: number) => void
): Promise<FirmwareDump | null> {
  try {
    const layout = getMemoryLayout(archInfo);
    const { flashBase, flashSize } = layout;

    // ... dump firmware ...

    // Parse vector table (ARM Cortex-M only)
    let vectorTable: VectorTable | null = null;
    let effectiveBaseAddress = flashBase;

    if (archInfo.architecture.startsWith('ArmCortex')) {
      vectorTable = parseVectorTable(firmwareData, layout.vectorTableOffset);

      if (vectorTable && !isValidVectorTable(vectorTable, layout)) {
        console.warn('[FirmwareExtractor] Vector table validation failed');
      }

      // Detect boot aliasing: if reset vector points below flashBase,
      // firmware was likely linked for 0x00000000 boot alias
      if (vectorTable && vectorTable.resetAddress < flashBase) {
        console.log('[FirmwareExtractor] Detected boot memory aliasing');
        console.log(`  Reset vector: 0x${vectorTable.resetAddress.toString(16).toUpperCase()}`);
        console.log(`  Flash base:   0x${flashBase.toString(16).toUpperCase()}`);

        // Use the address range that the firmware was actually linked for
        effectiveBaseAddress = 0x00000000;

        console.log(`  Using effective base: 0x${effectiveBaseAddress.toString(16).toUpperCase()}`);
      }
    }

    const dump: FirmwareDump = {
      data: firmwareData,
      baseAddress: effectiveBaseAddress,  // Use detected base, not physical flash base
      size: flashSize,
      vectorTable,
      architecture: archInfo.architecture,
      memoryLayout: layout,
    };

    return dump;
  } catch (error) {
    console.error('[FirmwareExtractor] Dump failed:', error);
    return null;
  }
}
```

**Pros:**
- Automatic detection
- No changes to WASM analyzer
- Handles both aliased and non-aliased firmware
- Preserves correct behavior for non-STM32 chips

**Cons:**
- Requires vector table parsing before address determination

### Option 2: Relaxed Validation in WASM Analyzer

**File**: `packages/battlemagic-analyzer/src/analysis/vector_table.rs`

Allow handlers to point outside firmware range (with warnings):

```rust
fn validate_vector_entry(
    vector_num: u32,
    raw_value: u32,
    firmware_start: u32,
    firmware_end: u32,
) -> bool {
    // Check for unprogrammed flash or zero
    if raw_value == 0 || raw_value == 0xFFFFFFFF {
        return false;
    }

    // Vector 0 validation (stack pointer)
    if vector_num == 0 {
        return raw_value >= 0x20000000 || raw_value < firmware_start;
    }

    // Code vector validation
    if (raw_value & 1) == 0 {
        return false;  // Missing Thumb bit
    }

    let handler_addr = raw_value & !1;

    // Allow handlers outside firmware range if they look valid
    // This handles boot aliasing scenarios common in ARM Cortex-M
    if handler_addr < firmware_start || handler_addr >= firmware_end {
        // Check if handler would be valid if firmware was at 0x00000000
        let size = firmware_end - firmware_start;
        if handler_addr < size {
            // Handler points to valid offset within firmware size
            return true;  // Likely boot aliasing - accept it
        }
        return false;  // Genuinely out of bounds
    }

    true
}
```

**Pros:**
- Simple fix in one location
- Handles aliasing automatically

**Cons:**
- May allow some false positives
- Less explicit about the aliasing situation

### Option 3: Add Explicit Aliasing Support

Add memory aliasing information to chip database and handle it explicitly.

**Pros:**
- Most accurate and explicit
- Supports complex aliasing scenarios

**Cons:**
- Requires extensive chip database updates
- More complex implementation

## Recommended Implementation

**Use Option 1** (Firmware Extractor fix) because:

1. It's the most accurate (uses actual vector table data to detect aliasing)
2. It's automatic (no manual configuration needed)
3. It preserves correct behavior for all chip types
4. It keeps validation logic strict (no false positives)
5. It's transparent to the WASM analyzer (no API changes)

## Testing Plan

1. Test with current STM32 firmware (should show 59 valid vectors)
2. Test with non-aliased firmware (nRF52, SAM chips) - should still work
3. Test with empty/erased flash - should show 0-1 valid vectors
4. Test with corrupted vector table - validation should still catch issues

## Additional Improvements

Consider adding diagnostic output:
```
[FirmwareExtractor] Vector table analysis:
  ✓ Initial SP: 0x20000400 (20KB stack)
  ✓ Reset Handler: 0x000008E8
  ✓ Detected 59 valid interrupt handlers
  ℹ Boot memory aliasing detected (flash @ 0x08000000, vectors @ 0x00000000)
  ✓ Using base address 0x00000000 for analysis
```

## Files to Modify

1. `apps/web/src/app/tools/battlemagic/lib/firmware/FirmwareExtractor.ts`
   - Update `dumpFirmware()` function
   - Add boot aliasing detection
   - Adjust `baseAddress` in returned `FirmwareDump`

2. (Optional) `packages/battlemagic-analyzer/src/analysis/vector_table.rs`
   - Add debug logging for rejected vectors
   - Improve validation error messages

## References

- STM32 Reference Manual: Memory Organization and Boot Configuration
- ARM Cortex-M Programming Manual: Vector Table and Exception Handling
- GDB RSP Protocol: Memory Read Commands
