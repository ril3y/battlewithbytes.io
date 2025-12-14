/**
 * Formatting utilities for disassembly display
 *
 * Pure functions for formatting addresses and byte arrays
 * in a consistent, readable manner for debugging.
 */

/**
 * Format address for display with 8-digit hex uppercase
 * @param addr - Memory address to format
 * @returns Formatted address string (e.g., "0x08000000")
 */
export function formatAddress(addr: number): string {
  return `0x${addr.toString(16).toUpperCase().padStart(8, "0")}`;
}

/**
 * Format byte array for display as space-separated hex values
 * Limits to first 5 bytes for readability
 * @param bytes - Byte array to format
 * @returns Formatted byte string (e.g., "48 65 6C 6C 6F")
 */
export function formatBytes(bytes: Uint8Array | undefined): string {
  // Defensive: Handle undefined or null bytes
  if (!bytes || bytes.length === 0) {
    return "";
  }

  const maxBytes = Math.min(bytes.length, 5);
  return Array.from(bytes.slice(0, maxBytes))
    .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");
}
