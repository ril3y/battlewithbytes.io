/**
 * Test Firmware Fixture
 *
 * Creates a minimal ARM Cortex-M firmware binary for testing.
 * This simulates a real firmware with:
 * - Vector table at 0x00000000
 * - ARM Thumb instructions
 * - Function calls and branches
 * - Data references
 */

/**
 * Generate a test firmware binary with ARM Cortex-M pattern
 *
 * Memory layout:
 * 0x00000000: Initial SP (0x20001000)
 * 0x00000004: Reset_Handler (0x08000101) - Thumb bit set
 * 0x00000008: NMI_Handler (0x08000201)
 * 0x0000000C: HardFault_Handler (0x08000301)
 * 0x00000010: MemManage_Handler (0x08000401)
 * 0x00000014: BusFault_Handler (0x08000501)
 * 0x00000018: UsageFault_Handler (0x08000601)
 * ... followed by ARM Thumb instructions starting at 0x00000100
 */
export function generateTestFirmware(): Uint8Array {
  const firmware = new Uint8Array(2048); // 2KB test firmware

  // Helper to write little-endian 32-bit value
  const writeLE32 = (offset: number, value: number) => {
    firmware[offset] = value & 0xff;
    firmware[offset + 1] = (value >> 8) & 0xff;
    firmware[offset + 2] = (value >> 16) & 0xff;
    firmware[offset + 3] = (value >> 24) & 0xff;
  };

  // Helper to write little-endian 16-bit value (ARM Thumb instructions)
  const writeLE16 = (offset: number, value: number) => {
    firmware[offset] = value & 0xff;
    firmware[offset + 1] = (value >> 8) & 0xff;
  };

  // ============================================================================
  // Vector Table (Standard ARM Cortex-M)
  // ============================================================================

  // 0x00: Initial Stack Pointer
  writeLE32(0x00, 0x20001000);

  // 0x04: Reset_Handler (Thumb bit set at 0x101)
  writeLE32(0x04, 0x08000101);

  // 0x08: NMI_Handler
  writeLE32(0x08, 0x08000201);

  // 0x0C: HardFault_Handler
  writeLE32(0x0c, 0x08000301);

  // 0x10: MemManage_Handler
  writeLE32(0x10, 0x08000401);

  // 0x14: BusFault_Handler
  writeLE32(0x14, 0x08000501);

  // 0x18: UsageFault_Handler
  writeLE32(0x18, 0x08000601);

  // 0x1C-0x28: Reserved (NULL)
  writeLE32(0x1c, 0x00000000);
  writeLE32(0x20, 0x00000000);
  writeLE32(0x24, 0x00000000);
  writeLE32(0x28, 0x00000000);

  // 0x2C: SVC_Handler
  writeLE32(0x2c, 0x08000701);

  // 0x30: DebugMon_Handler
  writeLE32(0x30, 0x08000801);

  // 0x34: Reserved (NULL)
  writeLE32(0x34, 0x00000000);

  // 0x38: PendSV_Handler
  writeLE32(0x38, 0x08000901);

  // 0x3C: SysTick_Handler
  writeLE32(0x3c, 0x08000a01);

  // 0x40+: External Interrupts (IRQ0-15)
  for (let i = 0; i < 16; i++) {
    writeLE32(0x40 + i * 4, 0x08000b01 + i * 0x100);
  }

  // ============================================================================
  // Code Section - ARM Thumb Instructions
  // ============================================================================

  let codeOffset = 0x100; // Start code at 0x100 (Reset_Handler - 1 for Thumb)

  // Reset_Handler at 0x100 (entry point)
  // PUSH {r4-r7, lr}
  writeLE16(codeOffset, 0xb5f0);
  codeOffset += 2;

  // MOVS r0, #0
  writeLE16(codeOffset, 0x2000);
  codeOffset += 2;

  // MOVS r1, #42 (0x2A)
  writeLE16(codeOffset, 0x212a);
  codeOffset += 2;

  // MOVS r2, #0xFF
  writeLE16(codeOffset, 0x22ff);
  codeOffset += 2;

  // BL main (call to 0x200)
  // BL instruction: 11110 S imm10 11 J1 1 J2 imm11
  // Target offset: 0x200 - (0x108 + 4) = 0xF4 bytes = 0x7A halfwords
  writeLE16(codeOffset, 0xf000);
  writeLE16(codeOffset + 2, 0xf83d); // Calls function at ~0x200
  codeOffset += 4;

  // B infinite_loop (unconditional branch to self)
  writeLE16(codeOffset, 0xe7fe);
  codeOffset += 2;

  // NMI_Handler at 0x200
  codeOffset = 0x200;
  // PUSH {r4, lr}
  writeLE16(codeOffset, 0xb510);
  codeOffset += 2;

  // MOVS r0, #1
  writeLE16(codeOffset, 0x2001);
  codeOffset += 2;

  // BL helper_function (call to 0x300)
  writeLE16(codeOffset, 0xf000);
  writeLE16(codeOffset + 2, 0xf877); // Calls helper at ~0x300
  codeOffset += 4;

  // POP {r4, pc}
  writeLE16(codeOffset, 0xbd10);
  codeOffset += 2;

  // HardFault_Handler at 0x300 - helper_function
  codeOffset = 0x300;
  // PUSH {r4-r6, lr}
  writeLE16(codeOffset, 0xb570);
  codeOffset += 2;

  // LDR r3, [pc, #8] (load constant from pool)
  writeLE16(codeOffset, 0x4b02);
  codeOffset += 2;

  // ADDS r0, r0, r1
  writeLE16(codeOffset, 0x1840);
  codeOffset += 2;

  // ADDS r0, r0, r3
  writeLE16(codeOffset, 0x18c0);
  codeOffset += 2;

  // POP {r4-r6, pc}
  writeLE16(codeOffset, 0xbd70);
  codeOffset += 2;

  // NOP (alignment)
  writeLE16(codeOffset, 0xbf00);
  codeOffset += 2;

  // Literal pool: constant value 0x12345678
  writeLE32(codeOffset, 0x12345678);
  codeOffset += 4;

  // MemManage_Handler at 0x400
  codeOffset = 0x400;
  // MOVS r0, #0
  writeLE16(codeOffset, 0x2000);
  codeOffset += 2;

  // MOVS r1, #1
  writeLE16(codeOffset, 0x2101);
  codeOffset += 2;

  // MOVS r2, #2
  writeLE16(codeOffset, 0x2202);
  codeOffset += 2;

  // MOVS r3, #3
  writeLE16(codeOffset, 0x2303);
  codeOffset += 2;

  // BL function_with_args (call to 0x500)
  writeLE16(codeOffset, 0xf000);
  writeLE16(codeOffset + 2, 0xf877); // Calls function at ~0x500
  codeOffset += 4;

  // BX lr (return)
  writeLE16(codeOffset, 0x4770);
  codeOffset += 2;

  // function_with_args at 0x500
  codeOffset = 0x500;
  // PUSH {r4-r7, lr}
  writeLE16(codeOffset, 0xb5f0);
  codeOffset += 2;

  // SUB sp, #16 (allocate stack frame)
  writeLE16(codeOffset, 0xb084);
  codeOffset += 2;

  // STR r0, [sp, #0] (store arg0 to stack)
  writeLE16(codeOffset, 0x9000);
  codeOffset += 2;

  // STR r1, [sp, #4] (store arg1 to stack)
  writeLE16(codeOffset, 0x9101);
  codeOffset += 2;

  // STR r2, [sp, #8] (store arg2 to stack)
  writeLE16(codeOffset, 0x9202);
  codeOffset += 2;

  // STR r3, [sp, #12] (store arg3 to stack)
  writeLE16(codeOffset, 0x9303);
  codeOffset += 2;

  // LDR r0, [sp, #0]
  writeLE16(codeOffset, 0x9800);
  codeOffset += 2;

  // LDR r1, [sp, #4]
  writeLE16(codeOffset, 0x9901);
  codeOffset += 2;

  // ADDS r0, r0, r1
  writeLE16(codeOffset, 0x1840);
  codeOffset += 2;

  // ADD sp, #16 (deallocate stack frame)
  writeLE16(codeOffset, 0xb004);
  codeOffset += 2;

  // POP {r4-r7, pc}
  writeLE16(codeOffset, 0xbdf0);
  codeOffset += 2;

  return firmware;
}

/**
 * Expected analysis results for the test firmware
 */
export const EXPECTED_ANALYSIS = {
  // Vector table entries
  vectorTableEntries: 24, // 16 standard + 8 external IRQs

  // Expected function detections
  functions: [
    { name: 'Reset_Handler', address: 0x08000100 },
    { name: 'NMI_Handler', address: 0x08000200 },
    { name: 'HardFault_Handler', address: 0x08000300 },
    { name: 'MemManage_Handler', address: 0x08000400 },
    { name: 'function_with_args', address: 0x08000500 },
  ],

  // Expected cross-references
  xrefs: {
    calls: 3, // BL instructions (Reset->main, NMI->helper, MemManage->function_with_args)
    branches: 1, // B infinite_loop
    dataReads: 1, // LDR from literal pool
  },

  // Expected argument annotations
  argAnnotations: {
    // Call to function_with_args should have 4 args (r0-r3)
    expectedCallsWithArgs: 1,
    maxArgCount: 4,
  },

  // Base address for analysis
  baseAddress: 0x08000000,
};

/**
 * Minimal firmware with just vector table and one function
 */
export function generateMinimalFirmware(): Uint8Array {
  const firmware = new Uint8Array(256);

  const writeLE32 = (offset: number, value: number) => {
    firmware[offset] = value & 0xff;
    firmware[offset + 1] = (value >> 8) & 0xff;
    firmware[offset + 2] = (value >> 16) & 0xff;
    firmware[offset + 3] = (value >> 24) & 0xff;
  };

  const writeLE16 = (offset: number, value: number) => {
    firmware[offset] = value & 0xff;
    firmware[offset + 1] = (value >> 8) & 0xff;
  };

  // Initial SP
  writeLE32(0x00, 0x20001000);

  // Reset_Handler at 0x101
  writeLE32(0x04, 0x08000101);

  // Simple function at 0x100
  let offset = 0x100;

  // MOVS r0, #0
  writeLE16(offset, 0x2000);
  offset += 2;

  // BX lr
  writeLE16(offset, 0x4770);

  return firmware;
}
