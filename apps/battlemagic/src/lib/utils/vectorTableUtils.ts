/**
 * Vector Table Utilities - Stub implementation
 * TODO: Implement full vector table analysis
 */

export interface VectorTableEntry {
  address: number;
  name: string;
  handler: number;
}

export function parseVectorTable(
  data: Uint8Array,
  baseAddress: number,
): VectorTableEntry[] {
  // TODO: Implement vector table parsing
  return [];
}

export function getVectorName(index: number): string {
  const vectors: Record<number, string> = {
    0: "Initial SP",
    1: "Reset",
    2: "NMI",
    3: "HardFault",
    4: "MemManage",
    5: "BusFault",
    6: "UsageFault",
    11: "SVCall",
    12: "DebugMon",
    14: "PendSV",
    15: "SysTick",
  };
  return vectors[index] || `IRQ${index - 16}`;
}

export function isValidVectorTable(data: Uint8Array): boolean {
  // TODO: Implement validation
  return data.length >= 64;
}

export function isInVectorTable(
  address: number,
  vectorTableBase: number,
  vectorCount?: number,
): boolean {
  // Vector table size defaults to 64 vectors (256 bytes)
  const size = (vectorCount || 64) * 4;
  return address >= vectorTableBase && address < vectorTableBase + size;
}

export function getVectorNumber(
  address: number,
  vectorTableBase: number,
): number {
  return Math.floor((address - vectorTableBase) / 4);
}

export function getStandardVectorName(vectorNumber: number): string {
  return getVectorName(vectorNumber);
}
