/**
 * Vector Table Utilities
 *
 * Shared utilities for working with ARM Cortex-M vector tables
 */

/**
 * Get standard ARM Cortex-M vector name for a given vector number
 *
 * @param vectorNum - Vector number (0-47+)
 * @returns Standard vector name (e.g., "Reset_Handler", "SysTick_Handler")
 */
export function getStandardVectorName(vectorNum: number): string {
  const standardNames: Record<number, string> = {
    0: 'Initial_SP',
    1: 'Reset_Handler',
    2: 'NMI_Handler',
    3: 'HardFault_Handler',
    4: 'MemManage_Handler',
    5: 'BusFault_Handler',
    6: 'UsageFault_Handler',
    7: 'Reserved',
    8: 'Reserved',
    9: 'Reserved',
    10: 'Reserved',
    11: 'SVC_Handler',
    12: 'DebugMon_Handler',
    13: 'Reserved',
    14: 'PendSV_Handler',
    15: 'SysTick_Handler',
  };

  if (vectorNum in standardNames) {
    return standardNames[vectorNum];
  }

  // IRQ handlers start at vector 16
  if (vectorNum >= 16) {
    return `IRQ${vectorNum - 16}_Handler`;
  }

  return `Vector_${vectorNum}`;
}

/**
 * Check if an address is within the vector table region
 *
 * @param address - Memory address to check
 * @param baseAddress - Firmware base address (usually 0x0 or 0x08000000)
 * @param vectorCount - Number of vectors in table (default 48)
 * @returns true if address is in vector table
 */
export function isInVectorTable(address: number, baseAddress: number = 0, vectorCount: number = 48): boolean {
  const vectorTableEnd = baseAddress + (vectorCount * 4); // Each vector is 4 bytes
  return address >= baseAddress && address < vectorTableEnd;
}

/**
 * Get vector number from address
 *
 * @param address - Memory address
 * @param baseAddress - Firmware base address (usually 0x0 or 0x08000000)
 * @returns Vector number (0-based), or null if not in vector table
 */
export function getVectorNumber(address: number, baseAddress: number = 0): number | null {
  const offset = address - baseAddress;
  if (offset < 0 || offset % 4 !== 0) {
    return null;
  }
  const vectorNum = offset / 4;
  return vectorNum >= 0 && vectorNum < 256 ? vectorNum : null; // Max 256 vectors
}

/**
 * Format vector table entry for display
 *
 * @param vectorNum - Vector number
 * @param handlerAddress - Handler address
 * @param customName - Custom name from user (optional)
 * @returns Formatted display string
 */
export function formatVectorEntry(vectorNum: number, handlerAddress: number, customName?: string): string {
  const name = customName || getStandardVectorName(vectorNum);
  const addr = `0x${handlerAddress.toString(16).toUpperCase().padStart(8, '0')}`;

  if (vectorNum === 0) {
    // Initial SP is a value, not an address
    return `${name}: ${addr}`;
  }

  return `${name} @ ${addr}`;
}
