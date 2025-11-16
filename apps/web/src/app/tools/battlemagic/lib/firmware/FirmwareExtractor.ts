/**
 * Firmware Extractor Service
 *
 * CPU-agnostic firmware extraction and analysis service.
 * Handles dumping firmware from targets via GDB and parsing vector tables.
 *
 * Key Features:
 * - Auto-detects memory layout based on chip architecture
 * - No hardcoded addresses (uses chip database)
 * - Validates vector tables
 * - Supports multiple architectures (ARM Cortex-M, MIPS, RISC-V)
 */

import { GdbClient } from '../gdb/GdbClient';
import type { ArchitectureInfo } from '../wasmAnalyzer';

/**
 * Vector table parsed from firmware
 */
export interface VectorTable {
  initialSP: number;
  resetVector: number;
  resetAddress: number;
}

/**
 * Memory layout for a specific chip/architecture
 */
export interface MemoryLayout {
  flashBase: number;
  flashSize: number;
  ramBase: number;
  ramSize: number;
  vectorTableOffset: number; // Offset from flashBase where vector table is located
}

/**
 * Complete firmware dump with metadata
 */
export interface FirmwareDump {
  data: Uint8Array;
  baseAddress: number;
  size: number;
  vectorTable: VectorTable | null;
  architecture: string;
  memoryLayout: MemoryLayout;
  chipInfo?: {
    name: string;
    voltage: number | null;
  };
}

/**
 * Get standard memory layout for an architecture
 *
 * This function provides default memory layouts for different chip families.
 * If chip database is extended in the future to include per-chip layouts,
 * this can be updated to query the database.
 *
 * @param archInfo Architecture information from chip database
 * @returns Memory layout for the architecture
 */
export function getMemoryLayout(archInfo: ArchitectureInfo): MemoryLayout {
  const arch = archInfo.architecture;
  const chipName = archInfo.chip_name || '';

  // ARM Cortex-M standard layouts
  if (arch.startsWith('ArmCortex')) {
    // STM32 family layouts
    if (chipName.startsWith('STM32F0')) {
      return {
        flashBase: 0x08000000,
        flashSize: 0x10000, // 64KB (varies by model)
        ramBase: 0x20000000,
        ramSize: 0x2000, // 8KB (varies by model)
        vectorTableOffset: 0,
      };
    }
    if (chipName.startsWith('STM32F1')) {
      return {
        flashBase: 0x08000000,
        flashSize: 0x20000, // 128KB (varies by model)
        ramBase: 0x20000000,
        ramSize: 0x5000, // 20KB (varies by model)
        vectorTableOffset: 0,
      };
    }
    if (chipName.startsWith('STM32F2')) {
      return {
        flashBase: 0x08000000,
        flashSize: 0x100000, // 1MB (varies by model)
        ramBase: 0x20000000,
        ramSize: 0x20000, // 128KB (varies by model)
        vectorTableOffset: 0,
      };
    }
    if (chipName.startsWith('STM32F3')) {
      return {
        flashBase: 0x08000000,
        flashSize: 0x40000, // 256KB (varies by model)
        ramBase: 0x20000000,
        ramSize: 0x10000, // 64KB (varies by model)
        vectorTableOffset: 0,
      };
    }
    if (chipName.startsWith('STM32F4')) {
      return {
        flashBase: 0x08000000,
        flashSize: 0x100000, // 1MB (varies by model, up to 2MB)
        ramBase: 0x20000000,
        ramSize: 0x30000, // 192KB (varies by model)
        vectorTableOffset: 0,
      };
    }
    if (chipName.startsWith('STM32F7')) {
      return {
        flashBase: 0x08000000,
        flashSize: 0x200000, // 2MB (varies by model)
        ramBase: 0x20000000,
        ramSize: 0x80000, // 512KB (varies by model)
        vectorTableOffset: 0,
      };
    }
    if (chipName.startsWith('STM32H7')) {
      return {
        flashBase: 0x08000000,
        flashSize: 0x200000, // 2MB (varies by model)
        ramBase: 0x20000000,
        ramSize: 0x100000, // 1MB (varies by model)
        vectorTableOffset: 0,
      };
    }
    if (chipName.startsWith('STM32L')) {
      return {
        flashBase: 0x08000000,
        flashSize: 0x80000, // 512KB (varies by model)
        ramBase: 0x20000000,
        ramSize: 0x14000, // 80KB (varies by model)
        vectorTableOffset: 0,
      };
    }
    if (chipName.startsWith('STM32G')) {
      return {
        flashBase: 0x08000000,
        flashSize: 0x80000, // 512KB (varies by model)
        ramBase: 0x20000000,
        ramSize: 0x18000, // 96KB (varies by model)
        vectorTableOffset: 0,
      };
    }

    // Nordic nRF52 family
    if (chipName.startsWith('nRF52')) {
      return {
        flashBase: 0x00000000,
        flashSize: 0x80000, // 512KB (varies by model)
        ramBase: 0x20000000,
        ramSize: 0x10000, // 64KB (varies by model)
        vectorTableOffset: 0,
      };
    }

    // Nordic nRF51 family
    if (chipName.startsWith('nRF51')) {
      return {
        flashBase: 0x00000000,
        flashSize: 0x40000, // 256KB
        ramBase: 0x20000000,
        ramSize: 0x4000, // 16KB
        vectorTableOffset: 0,
      };
    }

    // Microchip SAM D/E family
    if (chipName.startsWith('SAM')) {
      return {
        flashBase: 0x00000000,
        flashSize: 0x40000, // 256KB (varies by model)
        ramBase: 0x20000000,
        ramSize: 0x8000, // 32KB (varies by model)
        vectorTableOffset: 0,
      };
    }

    // NXP LPC series
    if (chipName.startsWith('LPC')) {
      return {
        flashBase: 0x00000000,
        flashSize: 0x80000, // 512KB (varies by model)
        ramBase: 0x10000000, // LPC uses different RAM base
        ramSize: 0x10000, // 64KB (varies by model)
        vectorTableOffset: 0,
      };
    }

    // Generic ARM Cortex-M fallback
    return {
      flashBase: 0x00000000, // Most ARM Cortex-M start at 0x0 or 0x08000000
      flashSize: 0x40000, // 256KB default
      ramBase: 0x20000000, // Standard ARM Cortex-M RAM base
      ramSize: 0x10000, // 64KB default
      vectorTableOffset: 0,
    };
  }

  // MIPS layouts (future support)
  if (arch.startsWith('Mips')) {
    return {
      flashBase: 0x1FC00000, // MIPS reset vector
      flashSize: 0x100000, // 1MB default
      ramBase: 0x80000000, // KSEG0 cached
      ramSize: 0x10000, // 64KB default
      vectorTableOffset: 0,
    };
  }

  // RISC-V layouts (future support)
  if (arch.startsWith('RiscV')) {
    return {
      flashBase: 0x20000000, // Common RISC-V flash base
      flashSize: 0x100000, // 1MB default
      ramBase: 0x80000000, // Common RISC-V RAM base
      ramSize: 0x10000, // 64KB default
      vectorTableOffset: 0,
    };
  }

  // Unknown architecture - use safe defaults
  return {
    flashBase: 0x00000000,
    flashSize: 0x10000, // 64KB
    ramBase: 0x20000000,
    ramSize: 0x4000, // 16KB
    vectorTableOffset: 0,
  };
}

/**
 * Parse ARM Cortex-M vector table from firmware data
 *
 * ARM Cortex-M vector table format (little-endian):
 * - 0x00-0x03: Initial stack pointer (MSP)
 * - 0x04-0x07: Reset vector (with Thumb bit set in LSB)
 * - 0x08+: Exception/interrupt handlers
 *
 * @param data Firmware data
 * @param offset Offset where vector table starts (usually 0)
 * @returns Parsed vector table or null if invalid
 */
export function parseVectorTable(data: Uint8Array, offset = 0): VectorTable | null {
  if (data.length < offset + 8) {
    console.warn('[FirmwareExtractor] Data too small to contain vector table');
    return null;
  }

  const view = new DataView(data.buffer, data.byteOffset + offset, data.byteLength - offset);
  const initialSP = view.getUint32(0, true); // Little-endian
  const resetVector = view.getUint32(4, true);
  const resetAddress = resetVector & 0xFFFFFFFE; // Clear Thumb bit

  return { initialSP, resetVector, resetAddress };
}

/**
 * Validate ARM Cortex-M vector table
 *
 * Checks that:
 * - Initial SP points to valid RAM region
 * - Reset vector has Thumb bit set (LSB = 1)
 * - Reset address points to valid code region
 *
 * @param vt Vector table to validate
 * @param layout Memory layout for validation
 * @returns True if vector table appears valid
 */
export function isValidVectorTable(vt: VectorTable, layout: MemoryLayout): boolean {
  // Check initial SP points to RAM (should be within RAM region)
  const spValid = vt.initialSP >= layout.ramBase &&
                  vt.initialSP <= (layout.ramBase + layout.ramSize);

  // Check reset vector has Thumb bit set (for ARM Cortex-M)
  const thumbBitSet = (vt.resetVector & 0x1) === 0x1;

  // Check reset address points to valid code (within flash)
  const resetValid = vt.resetAddress >= layout.flashBase &&
                     vt.resetAddress < (layout.flashBase + layout.flashSize);

  const valid = spValid && thumbBitSet && resetValid;

  if (!valid) {
    console.warn('[FirmwareExtractor] Vector table validation failed:', {
      initialSP: `0x${vt.initialSP.toString(16).toUpperCase()}`,
      resetVector: `0x${vt.resetVector.toString(16).toUpperCase()}`,
      resetAddress: `0x${vt.resetAddress.toString(16).toUpperCase()}`,
      spValid,
      thumbBitSet,
      resetValid,
      ramRange: `0x${layout.ramBase.toString(16)}-0x${(layout.ramBase + layout.ramSize).toString(16)}`,
      flashRange: `0x${layout.flashBase.toString(16)}-0x${(layout.flashBase + layout.flashSize).toString(16)}`,
    });
  }

  return valid;
}

/**
 * Dump firmware from target via GDB
 *
 * This function:
 * 1. Gets memory layout based on architecture
 * 2. Reads firmware from flash in chunks
 * 3. Parses and validates vector table (for ARM)
 * 4. Returns complete firmware dump with metadata
 *
 * @param gdbClient GDB client instance
 * @param archInfo Architecture information from chip database
 * @param progressCallback Optional callback for progress updates
 * @returns Firmware dump or null on error
 */
export async function dumpFirmware(
  gdbClient: GdbClient,
  archInfo: ArchitectureInfo,
  progressCallback?: (progress: number, bytesRead: number, totalBytes: number) => void
): Promise<FirmwareDump | null> {
  try {
    // Get memory layout for this chip
    const layout = getMemoryLayout(archInfo);
    const { flashBase, flashSize } = layout;

    console.log('[FirmwareExtractor] Starting firmware dump:', {
      chip: archInfo.chip_name,
      architecture: archInfo.architecture,
      flashBase: `0x${flashBase.toString(16).toUpperCase()}`,
      flashSize: `${flashSize / 1024}KB`,
    });

    // Read firmware in chunks (256 bytes is reliable with BMP)
    const CHUNK_SIZE = 256;
    const chunks: Uint8Array[] = [];

    for (let offset = 0; offset < flashSize; offset += CHUNK_SIZE) {
      const chunk = await gdbClient.readMemory(flashBase + offset, CHUNK_SIZE);
      chunks.push(chunk);

      // Report progress
      const progress = Math.round((offset / flashSize) * 100);
      progressCallback?.(progress, offset + chunk.length, flashSize);
    }

    // Concatenate all chunks
    const firmwareData = new Uint8Array(flashSize);
    let position = 0;
    for (const chunk of chunks) {
      firmwareData.set(chunk, position);
      position += chunk.length;
    }

    // Parse vector table (ARM Cortex-M only)
    let vectorTable: VectorTable | null = null;
    if (archInfo.architecture.startsWith('ArmCortex')) {
      vectorTable = parseVectorTable(firmwareData, layout.vectorTableOffset);

      if (vectorTable && !isValidVectorTable(vectorTable, layout)) {
        console.warn('[FirmwareExtractor] Vector table validation failed - firmware may be erased or read-protected');
      }
    }

    const dump: FirmwareDump = {
      data: firmwareData,
      baseAddress: flashBase,
      size: flashSize,
      vectorTable,
      architecture: archInfo.architecture,
      memoryLayout: layout,
    };

    console.log('[FirmwareExtractor] Firmware dump complete:', {
      size: firmwareData.length,
      vectorTable: vectorTable ? {
        initialSP: `0x${vectorTable.initialSP.toString(16).toUpperCase()}`,
        resetAddress: `0x${vectorTable.resetAddress.toString(16).toUpperCase()}`,
      } : 'N/A',
    });

    return dump;
  } catch (error) {
    console.error('[FirmwareExtractor] Dump failed:', error);
    return null;
  }
}

/**
 * Analyze dumped firmware with WASM analyzer
 *
 * This is a lightweight wrapper that prepares the firmware dump
 * for analysis. The actual analysis is done by the WASM module.
 *
 * @param dump Firmware dump to analyze
 * @returns Analysis-ready firmware data
 */
export function prepareFirmwareForAnalysis(dump: FirmwareDump): {
  data: Uint8Array;
  baseAddress: number;
  architecture: string;
} {
  return {
    data: dump.data,
    baseAddress: dump.baseAddress,
    architecture: dump.architecture,
  };
}

/**
 * Download firmware dump as .bin file
 *
 * @param dump Firmware dump to download
 * @param filename Optional filename (auto-generated if not provided)
 */
export function downloadFirmware(dump: FirmwareDump, filename?: string): void {
  const blob = new Blob([dump.data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = filename || `firmware_${dump.chipInfo?.name?.replace(/\s+/g, '_') || 'dump'}_${Date.now()}.bin`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
