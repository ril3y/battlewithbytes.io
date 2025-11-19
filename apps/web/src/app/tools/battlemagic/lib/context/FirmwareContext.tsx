'use client';

/**
 * Firmware Context - Global cache for raw firmware bytes
 *
 * Stores dumped firmware in memory to avoid unnecessary GDB reads during analysis mode.
 * When clicking functions in the Functions panel, DisassemblyView should read from
 * this cache instead of triggering GDB memory reads.
 *
 * This solves the problem where offline firmware analysis was triggering unwanted
 * GDB reads because DisassemblyView was designed for live debugging.
 *
 * Usage:
 * - After firmware dump: firmwareContext.setFirmwareData(data, baseAddress)
 * - When reading memory: firmwareContext.readMemory(address, size)
 * - If cache miss: fall back to GDB read (live debugging mode)
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Firmware Context State
 */
interface FirmwareContextState {
  // Firmware data
  firmwareData: Uint8Array | null;
  baseAddress: number;
  size: number;

  // Methods
  setFirmwareData: (data: Uint8Array, baseAddress: number) => void;
  readMemory: (address: number, size: number) => Uint8Array | null;
  hasFirmware: () => boolean;
  clearFirmware: () => void;
}

const FirmwareContext = createContext<FirmwareContextState | undefined>(undefined);

/**
 * Firmware Context Provider
 */
export function FirmwareProvider({ children }: { children: React.ReactNode }) {
  const [firmwareData, setFirmwareDataState] = useState<Uint8Array | null>(null);
  const [baseAddress, setBaseAddress] = useState(0);
  const [size, setSize] = useState(0);

  /**
   * Store firmware data in cache
   * Creates a copy to prevent issues with detached ArrayBuffers
   */
  const setFirmwareData = useCallback((data: Uint8Array, baseAddr: number) => {
    console.log(`[FirmwareContext] Caching firmware: ${data.length} bytes at 0x${baseAddr.toString(16).toUpperCase()}`);
    // Create a true copy to prevent ArrayBuffer detachment issues
    const firmwareCopy = new Uint8Array(data);
    setFirmwareDataState(firmwareCopy);
    setBaseAddress(baseAddr);
    setSize(data.length);
  }, []);

  /**
   * Read memory from cached firmware
   * Returns null if address is out of range or no firmware is loaded
   * Always returns a NEW Uint8Array copy to prevent ArrayBuffer detachment issues
   */
  const readMemory = useCallback((address: number, readSize: number): Uint8Array | null => {
    if (!firmwareData) {
      return null;
    }

    // Calculate offset from base address
    const offset = address - baseAddress;

    // Check bounds
    if (offset < 0 || offset + readSize > size) {
      console.warn(
        `[FirmwareContext] Address 0x${address.toString(16)} (offset ${offset}) is out of firmware range [0x${baseAddress.toString(16)} - 0x${(baseAddress + size).toString(16)}]`
      );
      return null;
    }

    // Return a NEW copy to prevent WASM DataView issues with detached ArrayBuffers
    // slice() creates a new TypedArray with a new ArrayBuffer containing a copy
    return new Uint8Array(firmwareData.slice(offset, offset + readSize));
  }, [firmwareData, baseAddress, size]);

  /**
   * Check if firmware is loaded
   */
  const hasFirmware = useCallback(() => {
    return firmwareData !== null;
  }, [firmwareData]);

  /**
   * Clear firmware cache
   */
  const clearFirmware = useCallback(() => {
    console.log('[FirmwareContext] Clearing firmware cache');
    setFirmwareDataState(null);
    setBaseAddress(0);
    setSize(0);
  }, []);

  // Debug logging to track firmware size changes
  useEffect(() => {
    console.log(`[FirmwareContext] State updated - size: ${size}, baseAddress: 0x${baseAddress.toString(16)}, hasFirmware: ${firmwareData !== null}`);
  }, [size, baseAddress, firmwareData]);

  // Debug logging for component lifecycle
  useEffect(() => {
    console.log('[FirmwareContext] Provider mounted');
    return () => {
      console.log('[FirmwareContext] Provider unmounting');
    };
  }, []);

  const value: FirmwareContextState = useMemo(
    () => ({
      firmwareData,
      baseAddress,
      size,
      setFirmwareData,
      readMemory,
      hasFirmware,
      clearFirmware,
    }),
    [firmwareData, baseAddress, size, setFirmwareData, readMemory, hasFirmware, clearFirmware]
  );

  return (
    <FirmwareContext.Provider value={value}>
      {children}
    </FirmwareContext.Provider>
  );
}

/**
 * Hook to use firmware context
 */
export function useFirmware() {
  const context = useContext(FirmwareContext);
  if (!context) {
    throw new Error('useFirmware must be used within FirmwareProvider');
  }
  return context;
}

/**
 * Hook to check if firmware is available (without throwing)
 */
export function useFirmwareOptional() {
  return useContext(FirmwareContext);
}
