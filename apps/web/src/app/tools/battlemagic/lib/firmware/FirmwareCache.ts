/**
 * Firmware Caching Utilities
 *
 * Handles firmware caching, hash generation, and comparison
 * to avoid unnecessary firmware dumps when reconnecting to the same target.
 */

import { CachedFirmware } from '../project/types';
import type { FirmwareDump } from './FirmwareExtractor';

/**
 * Generate SHA-256 hash of firmware data
 *
 * @param data Firmware data as Uint8Array
 * @returns SHA-256 hash as hex string
 */
export async function generateFirmwareHash(data: Uint8Array): Promise<string> {
  // Use Web Crypto API for SHA-256 hashing
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as Uint8Array<ArrayBuffer>);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Convert Uint8Array to base64 string for JSON serialization
 *
 * @param data Firmware data
 * @returns Base64-encoded string
 */
export function firmwareToBase64(data: Uint8Array): string {
  let binary = '';
  const len = data.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string back to Uint8Array
 *
 * @param base64 Base64-encoded string
 * @returns Firmware data
 */
export function base64ToFirmware(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Create cached firmware from a firmware dump
 *
 * @param dump Firmware dump to cache
 * @returns Cached firmware object
 */
export async function createCachedFirmware(dump: FirmwareDump): Promise<CachedFirmware> {
  const hash = await generateFirmwareHash(dump.data);
  const data = firmwareToBase64(dump.data);

  return {
    data,
    hash,
    baseAddress: dump.baseAddress,
    size: dump.size,
    dumpedAt: new Date().toISOString(),
    chipName: dump.chipInfo?.name,
    architecture: dump.architecture,
  };
}

/**
 * Restore firmware dump from cached firmware
 *
 * @param cached Cached firmware object
 * @returns Firmware dump
 */
export function restoreFirmwareDump(cached: CachedFirmware): FirmwareDump {
  const data = base64ToFirmware(cached.data);

  return {
    data,
    baseAddress: cached.baseAddress,
    size: cached.size,
    vectorTable: null, // Vector table will be re-parsed if needed
    architecture: cached.architecture || 'Unknown',
    memoryLayout: {
      flashBase: cached.baseAddress,
      flashSize: cached.size,
      ramBase: 0x20000000, // Default ARM Cortex-M RAM
      ramSize: 0x10000, // Default 64KB
      vectorTableOffset: 0,
    },
    chipInfo: cached.chipName ? {
      name: cached.chipName,
      voltage: null,
    } : undefined,
  };
}

/**
 * Compare firmware hash with cached firmware
 *
 * @param newData New firmware data to compare
 * @param cached Cached firmware to compare against
 * @returns True if hashes match
 */
export async function compareFirmwareHash(
  newData: Uint8Array,
  cached: CachedFirmware
): Promise<boolean> {
  const newHash = await generateFirmwareHash(newData);
  return newHash === cached.hash;
}

/**
 * Verify cached firmware integrity
 *
 * @param cached Cached firmware to verify
 * @returns True if cached firmware is valid
 */
export async function verifyCachedFirmware(cached: CachedFirmware): Promise<boolean> {
  try {
    const data = base64ToFirmware(cached.data);
    const hash = await generateFirmwareHash(data);
    return hash === cached.hash;
  } catch (error) {
    console.error('[FirmwareCache] Verification failed:', error);
    return false;
  }
}
