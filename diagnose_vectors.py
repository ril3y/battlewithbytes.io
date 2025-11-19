#!/usr/bin/env python3
"""
Vector Table Validation Diagnostic Tool

This script analyzes why the Rust vector table detector is rejecting entries.
"""

def diagnose_firmware(filename, base_address=0x08000000):
    with open(filename, 'rb') as f:
        firmware = f.read()

    print(f"Firmware File: {filename}")
    print(f"File Size: {len(firmware):,} bytes ({len(firmware) // 1024} KB)")
    print(f"Base Address: 0x{base_address:08X}")
    print(f"Firmware Range: 0x{base_address:08X} - 0x{base_address + len(firmware):08X}")
    print("=" * 80)

    # Calculate expected ranges
    firmware_start = base_address
    firmware_end = base_address + len(firmware)

    print("\n=== VECTOR TABLE ANALYSIS ===\n")

    valid_count = 0
    invalid_count = 0
    rejection_reasons = {
        'zero_or_unprogrammed': [],
        'missing_thumb_bit': [],
        'out_of_bounds': [],
        'valid': []
    }

    # Analyze first 64 vectors (256 bytes)
    for vector_num in range(min(64, len(firmware) // 4)):
        offset = vector_num * 4
        raw_value = int.from_bytes(firmware[offset:offset+4], 'little')

        # Determine vector name
        names = {
            0: "Initial_SP",
            1: "Reset_Handler",
            2: "NMI_Handler",
            3: "HardFault_Handler",
            4: "MemManage_Handler",
            5: "BusFault_Handler",
            6: "UsageFault_Handler",
            11: "SVC_Handler",
            12: "DebugMon_Handler",
            14: "PendSV_Handler",
            15: "SysTick_Handler"
        }
        name = names.get(vector_num, f"IRQHandler_{vector_num-16}" if vector_num >= 16 else f"Reserved_{vector_num}")

        # Validate according to Rust logic
        is_valid = True
        reason = ""

        # Check for unprogrammed flash or zero
        if raw_value == 0 or raw_value == 0xFFFFFFFF:
            is_valid = False
            reason = "Zero or unprogrammed flash (0xFFFFFFFF)"
            rejection_reasons['zero_or_unprogrammed'].append(vector_num)

        # Vector 0 validation
        elif vector_num == 0:
            # Stack pointer should be in RAM (0x20000000+) or less than firmware start
            if raw_value >= 0x20000000 or raw_value < firmware_start:
                reason = "Valid stack pointer"
                rejection_reasons['valid'].append(vector_num)
            else:
                is_valid = False
                reason = f"Invalid SP range (not RAM, in flash range)"
                rejection_reasons['out_of_bounds'].append(vector_num)

        # Code vector validation
        else:
            # Check Thumb bit
            if (raw_value & 1) == 0:
                is_valid = False
                reason = "Missing Thumb bit (bit 0 not set)"
                rejection_reasons['missing_thumb_bit'].append(vector_num)
            else:
                # Clear Thumb bit for address validation
                handler_addr = raw_value & ~1

                # Check if address is within firmware bounds
                if handler_addr < firmware_start or handler_addr >= firmware_end:
                    is_valid = False
                    if handler_addr < firmware_start:
                        reason = f"Address 0x{handler_addr:08X} < firmware_start 0x{firmware_start:08X}"
                    else:
                        reason = f"Address 0x{handler_addr:08X} >= firmware_end 0x{firmware_end:08X}"
                    rejection_reasons['out_of_bounds'].append(vector_num)
                else:
                    reason = "Valid"
                    rejection_reasons['valid'].append(vector_num)

        if is_valid:
            valid_count += 1
        else:
            invalid_count += 1

        # Show first 20 entries in detail
        if vector_num < 20:
            status = "VALID  " if is_valid else "INVALID"
            handler_addr = raw_value & ~1 if vector_num > 0 else raw_value
            thumb_marker = "(T)" if (raw_value & 1) and vector_num > 0 else "   "
            print(f"Vector {vector_num:3d} @ 0x{offset:04X}: 0x{raw_value:08X} -> 0x{handler_addr:08X} {thumb_marker} [{status}] {name}")
            if not is_valid:
                print(f"              Reason: {reason}")

    print(f"\n{'=' * 80}")
    print(f"Summary: {valid_count} valid, {invalid_count} invalid out of {valid_count + invalid_count} total")
    print(f"\nRejection Breakdown:")
    print(f"  - Zero/Unprogrammed: {len(rejection_reasons['zero_or_unprogrammed'])} vectors")
    print(f"  - Missing Thumb Bit: {len(rejection_reasons['missing_thumb_bit'])} vectors")
    print(f"  - Out of Bounds:     {len(rejection_reasons['out_of_bounds'])} vectors")
    print(f"  - Valid:             {len(rejection_reasons['valid'])} vectors")

    # Detailed analysis of out-of-bounds issues
    if rejection_reasons['out_of_bounds']:
        print(f"\n{'=' * 80}")
        print("DETAILED OUT-OF-BOUNDS ANALYSIS:")
        print(f"  Firmware loaded at: 0x{base_address:08X}")
        print(f"  Firmware size:      {len(firmware):,} bytes (0x{len(firmware):X})")
        print(f"  Valid range:        0x{firmware_start:08X} - 0x{firmware_end:08X}")
        print(f"\n  Out-of-bounds vectors:")

        for vec_num in rejection_reasons['out_of_bounds']:
            if vec_num == 0:
                continue  # Skip SP
            offset = vec_num * 4
            raw_value = int.from_bytes(firmware[offset:offset+4], 'little')
            handler_addr = raw_value & ~1
            print(f"    Vector {vec_num:3d}: 0x{handler_addr:08X} (too {'low' if handler_addr < firmware_start else 'high'})")

    # Check if this looks like a firmware dump from a different address
    print(f"\n{'=' * 80}")
    print("DIAGNOSIS:")

    # Get handler addresses from valid entries
    handler_addrs = []
    for vec_num in rejection_reasons['out_of_bounds']:
        if vec_num == 0:
            continue
        offset = vec_num * 4
        raw_value = int.from_bytes(firmware[offset:offset+4], 'little')
        if raw_value != 0 and raw_value != 0xFFFFFFFF and (raw_value & 1):
            handler_addrs.append(raw_value & ~1)

    if handler_addrs:
        min_addr = min(handler_addrs)
        max_addr = max(handler_addrs)
        print(f"\n  Handler address range: 0x{min_addr:08X} - 0x{max_addr:08X}")
        print(f"  Current base address:  0x{base_address:08X}")
        print(f"  Firmware end address:  0x{firmware_end:08X}")

        # Check if firmware was dumped from address 0x00000000 instead of 0x08000000
        if min_addr < 0x08000000:
            print(f"\n  WARNING - ISSUE DETECTED:")
            print(f"      Vector table handlers point to addresses below 0x08000000")
            print(f"      This firmware was likely dumped from address 0x00000000, not 0x08000000")
            print(f"\n  SOLUTION:")
            print(f"      Use base_address = 0x00000000 when calling the analyzer")
            print(f"      Example: new ArmAnalyzer(0x00000000)")

if __name__ == '__main__':
    print("\n" + "=" * 80)
    print("TESTING WITH BASE ADDRESS 0x08000000 (WRONG)")
    print("=" * 80)
    diagnose_firmware('firmware_Unknown_(already_attached)_1763317348910.bin', 0x08000000)

    print("\n\n" + "=" * 80)
    print("TESTING WITH BASE ADDRESS 0x00000000 (CORRECT)")
    print("=" * 80)
    diagnose_firmware('firmware_Unknown_(already_attached)_1763317348910.bin', 0x00000000)
