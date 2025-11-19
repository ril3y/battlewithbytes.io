# Vector Table Detection Fix - Summary

## Issue
The WASM firmware analyzer was only detecting 1 valid vector table entry (Initial_SP) out of 256, marking all interrupt handlers as invalid.

## Root Cause
**STM32 Boot Memory Aliasing**

STM32 microcontrollers have flash memory at physical address `0x08000000`, but this same memory is ALSO aliased to `0x00000000` at boot time. The firmware is compiled/linked to run from `0x00000000`, so:

- Vector table entries point to addresses like `0x000008E8` (Reset_Handler)
- Firmware was dumped from physical address `0x08000000`
- WASM analyzer was told baseAddress = `0x08000000`
- Validation failed: `0x000008E8 < 0x08000000` → INVALID

## Solution
Implemented automatic boot aliasing detection in `FirmwareExtractor.ts`:

1. After dumping firmware, parse the vector table
2. Check if Reset_Handler address < physical flash base
3. If yes, use `0x00000000` as the effective base address for analysis
4. Pass corrected base address to WASM analyzer

## Results

### Before Fix
```
Summary: 1 valid, 63 invalid
- Only Initial_SP detected
- All interrupt handlers marked invalid
- Analysis essentially useless
```

### After Fix
```
Summary: 59 valid, 5 invalid
- Initial_SP: 0x20000400 ✓
- Reset_Handler: 0x000008E8 ✓
- NMI_Handler: 0x0000057C ✓
- HardFault_Handler: 0x000008C8 ✓
- ... 55 more handlers ✓
- Reserved vectors (0x00000000): Invalid (expected) ✓
```

## Files Modified

### 1. `apps/web/src/app/tools/battlemagic/lib/firmware/FirmwareExtractor.ts`
- Added boot aliasing detection logic
- Automatically adjusts `baseAddress` when aliasing is detected
- Logs diagnostic information for debugging

### 2. `diagnose_vectors.py` (diagnostic tool)
- Created Python script to analyze vector table validation
- Shows hex dump and validation results
- Compares different base addresses

### 3. `VECTOR_TABLE_FIX_REPORT.md`
- Comprehensive investigation report
- Detailed technical analysis
- Multiple solution options evaluated

## Technical Details

### Memory Layout
```
Physical Flash:  0x08000000 - 0x08040000 (256KB)
Boot Alias:      0x00000000 - 0x00040000 (same memory, different address)
RAM:             0x20000000 - 0x20005000 (20KB)
```

### Vector Table Structure (ARM Cortex-M)
```
Offset  | Vector        | Value      | Handler Addr | Notes
--------|---------------|------------|--------------|------------------
0x0000  | Initial_SP    | 0x20000400 | N/A          | Stack pointer
0x0004  | Reset         | 0x000008E9 | 0x000008E8   | Thumb bit set
0x0008  | NMI           | 0x0000057D | 0x0000057C   | Thumb bit set
0x000C  | HardFault     | 0x000008C9 | 0x000008C8   | Thumb bit set
...
```

### Validation Logic (Rust WASM)
```rust
// From packages/battlemagic-analyzer/src/analysis/vector_table.rs

fn validate_vector_entry(
    vector_num: u32,
    raw_value: u32,
    firmware_start: u32,  // Now correctly set to 0x00000000
    firmware_end: u32,
) -> bool {
    // ... validation checks ...

    // This now passes: 0x000008E8 >= 0x00000000 && 0x000008E8 < 0x00040000
    if handler_addr < firmware_start || handler_addr >= firmware_end {
        return false;
    }

    true
}
```

## Testing

### Test 1: Current Firmware
```bash
python diagnose_vectors.py
```
Result: 59 valid vectors detected ✓

### Test 2: Non-Aliased Chips
Should still work correctly for chips that don't use aliasing (nRF52, SAM, etc.) because:
- Their vector tables already point to addresses >= flashBase
- Detection logic only activates when resetAddress < flashBase
- No behavior change for non-aliased scenarios

### Test 3: Empty Flash
Should correctly detect 0 valid vectors (all 0xFFFFFFFF)

## Console Output Example

With the fix, you should see:
```
[FirmwareExtractor] Detected boot memory aliasing:
  Reset vector points to: 0x000008E8
  Physical flash base:    0x08000000
  Using effective base:   0x00000000
  This is normal for STM32 and similar chips with boot aliasing.

[FirmwareExtractor] Firmware dump complete:
  size: 262144
  physicalFlashBase: 0x08000000
  effectiveBaseAddress: 0x00000000
  vectorTable: {
    initialSP: 0x20000400,
    resetAddress: 0x000008E8
  }
```

## Future Improvements

1. **Chip Database Enhancement**: Add explicit aliasing information to chip database
2. **Validation Diagnostics**: Add detailed logging in WASM analyzer for rejected vectors
3. **UI Display**: Show both physical and effective addresses in the UI
4. **Documentation**: Update developer docs with memory aliasing information

## References

- STM32F1xx Reference Manual - Section 4: Memory Organization
- ARM Cortex-M3 Programming Manual - Section 2.1.3: Vector Table
- GDB RSP Protocol Documentation
- battlemagic-analyzer vector_table.rs implementation
