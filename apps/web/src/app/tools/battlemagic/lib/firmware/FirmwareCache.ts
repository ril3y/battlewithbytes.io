/**
 * Firmware Cache - Utility functions for caching and restoring firmware dumps
 */

import { type CachedFirmware } from "../project/types";
import {
  type FirmwareDump,
  type MemoryLayout,
  type VectorTable,
} from "./FirmwareExtractor";

/**
 * Convert Uint8Array to base64 string for JSON serialization
 */
function uint8ArrayToBase64(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string back to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const data = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    data[i] = binary.charCodeAt(i);
  }
  return data;
}

/**
 * Compute SHA-256 hash of firmware data
 */
async function computeHash(data: Uint8Array): Promise<string> {
  // Create a new ArrayBuffer copy to satisfy TypeScript's BufferSource type requirements
  const buffer = new ArrayBuffer(data.length);
  new Uint8Array(buffer).set(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Create a cached firmware entry from a firmware dump
 */
export async function createCachedFirmware(
  firmwareDump: FirmwareDump
): Promise<CachedFirmware> {
  const hash = await computeHash(firmwareDump.data);
  return {
    data: uint8ArrayToBase64(firmwareDump.data),
    hash,
    baseAddress: firmwareDump.baseAddress,
    size: firmwareDump.size,
    dumpedAt: new Date().toISOString(),
    chipName: firmwareDump.chipInfo?.name,
    architecture: firmwareDump.architecture,
  };
}

/**
 * Restore a firmware dump from cached data
 */
export function restoreFirmwareDump(cachedFirmware: CachedFirmware): FirmwareDump {
  const data = base64ToUint8Array(cachedFirmware.data);

  // Create a default memory layout based on cached info
  const defaultMemoryLayout: MemoryLayout = {
    flashBase: cachedFirmware.baseAddress,
    flashSize: cachedFirmware.size,
    ramBase: 0x20000000, // Default ARM Cortex-M RAM base
    ramSize: 0x10000, // Default 64KB
    vectorTableOffset: 0,
  };

  // Try to parse vector table from the data
  let vectorTable: VectorTable | null = null;
  if (data.length >= 8) {
    const view = new DataView(data.buffer, data.byteOffset, data.length);
    const initialSP = view.getUint32(0, true);
    const resetVector = view.getUint32(4, true);
    // Clear thumb bit for actual address
    const resetAddress = resetVector & ~1;
    vectorTable = {
      initialSP,
      resetVector,
      resetAddress,
    };
  }

  return {
    data,
    baseAddress: cachedFirmware.baseAddress,
    size: cachedFirmware.size,
    vectorTable,
    architecture: cachedFirmware.architecture || "Unknown",
    memoryLayout: defaultMemoryLayout,
    chipInfo: cachedFirmware.chipName
      ? { name: cachedFirmware.chipName, voltage: null }
      : undefined,
  };
}
