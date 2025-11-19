#!/usr/bin/env python3
import sys

def hexdump(filename, count=256):
    with open(filename, 'rb') as f:
        data = f.read(count)

    for i in range(0, len(data), 16):
        chunk = data[i:i+16]
        hex_str = ' '.join(f'{b:02X}' for b in chunk)
        ascii_str = ''.join(chr(b) if 32 <= b < 127 else '.' for b in chunk)
        print(f'{i:08X}: {hex_str:<48} {ascii_str}')

    # Also parse first 64 bytes as vector table
    print("\n=== Vector Table Analysis (first 16 entries) ===")
    for i in range(0, min(64, len(data)), 4):
        if i + 4 <= len(data):
            value = int.from_bytes(data[i:i+4], 'little')
            vector_num = i // 4

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

            # Check Thumb bit for code vectors
            has_thumb = (value & 1) == 1
            handler_addr = value & ~1

            print(f"Vector {vector_num:3d} @ 0x{i:04X}: 0x{value:08X} -> 0x{handler_addr:08X} {'(T)' if has_thumb and vector_num > 0 else '    '} {name}")

if __name__ == '__main__':
    hexdump('firmware_Unknown_(already_attached)_1763317348910.bin', 256)
