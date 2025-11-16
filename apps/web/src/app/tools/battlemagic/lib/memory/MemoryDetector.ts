/**
 * Memory Detector
 *
 * Auto-detects MCU type, architecture, and memory layout from GDB
 * Intelligently determines the correct flash base address and memory regions
 */

import { GdbClient } from '../gdb/GdbClient';
import { McuFamily, Architecture, ProtectionStatus } from './types';
import type {
  McuInfo,
  MemoryRegion,
  MemoryDetectionResult,
  ProtectionInfo
} from './types';

/**
 * Known MCU flash base addresses
 */
const KNOWN_FLASH_BASES: Record<McuFamily, number> = {
  STM32: 0x08000000,
  NRF52: 0x00000000,
  NRF51: 0x00000000,
  ESP32: 0x40000000,
  RP2040: 0x10000000,
  Unknown: 0x08000000 // Default fallback
};

/**
 * MCU family detection patterns
 */
const MCU_PATTERNS = [
  { pattern: /STM32/i, family: 'STM32' as McuFamily },
  { pattern: /nRF52/i, family: 'NRF52' as McuFamily },
  { pattern: /nRF51/i, family: 'NRF51' as McuFamily },
  { pattern: /ESP32/i, family: 'ESP32' as McuFamily },
  { pattern: /RP2040/i, family: 'RP2040' as McuFamily }
];

export class MemoryDetector {
  private gdbClient: GdbClient;

  constructor(gdbClient: GdbClient) {
    this.gdbClient = gdbClient;
  }

  /**
   * Perform complete memory detection
   * Returns MCU info, protection status, and recommended settings
   */
  async detect(): Promise<MemoryDetectionResult> {
    try {
      // Step 1: Detect MCU type
      const mcu = await this.detectMcu();

      // Step 2: Test memory read at detected flash base
      const canRead = await this.testMemoryRead(mcu.flashBase);

      // Step 3: Build protection info
      const protection: ProtectionInfo = {
        status: canRead ? ProtectionStatus.NONE : ProtectionStatus.READ_PROTECTED,
        details: canRead ? 'Memory is readable' : 'Memory read failed - protection may be enabled',
        canRead,
        canWrite: false // We don't test writes during detection
      };

      // Step 4: Determine recommended settings
      const recommendedFlashBase = mcu.flashBase;
      const recommendedReadSize = this.getRecommendedReadSize(mcu.family);

      return {
        success: true,
        mcu,
        protection,
        recommendedFlashBase,
        recommendedReadSize
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      // Return fallback result on error
      return {
        success: false,
        mcu: this.getFallbackMcuInfo(),
        protection: {
          details: `Detection failed: ${errorMsg}`,
          status: ProtectionStatus.UNKNOWN,
          canRead: false,
          canWrite: false
        },
        recommendedFlashBase: 0x08000000,
        recommendedReadSize: 0x10000,
        error: errorMsg
      };
    }
  }

  /**
   * Detect MCU family and architecture
   */
  private async detectMcu(): Promise<McuInfo> {
    let detectionMethod = 'unknown';
    let family: McuFamily = 'Unknown' as McuFamily;
    let name = 'Unknown MCU';
    let architecture: Architecture = 'ARM Thumb' as Architecture;

    try {
      // Method 1: Try 'monitor version' command
      const versionOutput = await this.gdbClient.sendMonitorCommand('version');
      detectionMethod = 'monitor version';

      // Parse version output for MCU info
      const mcuMatch = MCU_PATTERNS.find(p => p.pattern.test(versionOutput));
      if (mcuMatch) {
        family = mcuMatch.family;
        name = this.extractMcuName(versionOutput, family);
      }

      // Detect if it's a Nordic chip from version string
      if (versionOutput.toLowerCase().includes('nordic')) {
        if (versionOutput.toLowerCase().includes('52')) {
          family = 'NRF52' as McuFamily;
          name = 'nRF52840'; // Default, could be refined
        } else if (versionOutput.toLowerCase().includes('51')) {
          family = 'NRF51' as McuFamily;
          name = 'nRF51822';
        }
      }
    } catch (error) {
      console.warn('[MemoryDetector] monitor version failed:', error);
    }

    // Method 2: Try reading from different base addresses to infer MCU
    if (family === 'Unknown') {
      detectionMethod = 'memory probing';
      family = await this.detectByMemoryProbe();
    }

    // Determine architecture based on family
    architecture = this.getArchitecture(family);

    // Get memory regions
    const regions = await this.detectMemoryRegions(family);

    return {
      family,
      architecture,
      name,
      flashBase: KNOWN_FLASH_BASES[family],
      regions,
      detectionMethod
    };
  }

  /**
   * Extract MCU name from version string
   */
  private extractMcuName(versionOutput: string, family: McuFamily): string {
    // Try to extract specific model name
    const lines = versionOutput.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('target')) {
        return line.trim();
      }
    }

    // Fallback to family name
    return family;
  }

  /**
   * Detect MCU by probing different flash base addresses
   */
  private async detectByMemoryProbe(): Promise<McuFamily> {
    const testAddresses = [
      { addr: 0x00000000, family: 'NRF52' as McuFamily },
      { addr: 0x08000000, family: 'STM32' as McuFamily },
      { addr: 0x10000000, family: 'RP2040' as McuFamily },
      { addr: 0x40000000, family: 'ESP32' as McuFamily }
    ];

    for (const { addr, family } of testAddresses) {
      try {
        // Try to read 4 bytes
        const canRead = await this.testMemoryRead(addr, 4);
        if (canRead) {
          return family;
        }
      } catch {
        // Continue to next address
      }
    }

    return 'Unknown' as McuFamily;
  }

  /**
   * Get architecture for MCU family
   */
  private getArchitecture(family: McuFamily): Architecture {
    switch (family) {
      case 'STM32':
      case 'NRF52':
      case 'NRF51':
      case 'RP2040':
        return 'ARM Thumb' as Architecture;
      case 'ESP32':
        return 'UNKNOWN' as Architecture; // ESP32 uses Xtensa, not ARM
      default:
        return 'ARM Thumb' as Architecture; // Most embedded chips are ARM
    }
  }

  /**
   * Test if memory at address is readable
   */
  private async testMemoryRead(address: number, length = 4): Promise<boolean> {
    try {
      const data = await this.gdbClient.readMemory(address, length);
      return data && data.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Detect memory regions using GDB commands
   */
  private async detectMemoryRegions(family: McuFamily): Promise<MemoryRegion[]> {
    const regions: MemoryRegion[] = [];

    // Add known regions based on MCU family
    switch (family) {
      case 'STM32':
        regions.push({
          name: 'Flash',
          start: 0x08000000,
          size: 0x10000, // 64KB default, varies by model
          type: 'flash',
          readable: true,
          writable: false,
          executable: true
        });
        regions.push({
          name: 'SRAM',
          start: 0x20000000,
          size: 0x5000, // 20KB default
          type: 'ram',
          readable: true,
          writable: true,
          executable: false
        });
        break;

      case 'NRF52':
        regions.push({
          name: 'Flash',
          start: 0x00000000,
          size: 0x100000, // 1MB for nRF52840
          type: 'flash',
          readable: true,
          writable: false,
          executable: true
        });
        regions.push({
          name: 'RAM',
          start: 0x20000000,
          size: 0x40000, // 256KB for nRF52840
          type: 'ram',
          readable: true,
          writable: true,
          executable: false
        });
        break;

      case 'RP2040':
        regions.push({
          name: 'Flash',
          start: 0x10000000,
          size: 0x200000, // 2MB
          type: 'flash',
          readable: true,
          writable: false,
          executable: true
        });
        regions.push({
          name: 'SRAM',
          start: 0x20000000,
          size: 0x42000, // 264KB
          type: 'ram',
          readable: true,
          writable: true,
          executable: false
        });
        break;

      default:
        // Generic regions
        regions.push({
          name: 'Flash',
          start: 0x08000000,
          size: 0x10000,
          type: 'flash',
          readable: true,
          writable: false,
          executable: true
        });
    }

    return regions;
  }

  /**
   * Get recommended read size for MCU family
   */
  private getRecommendedReadSize(family: McuFamily): number {
    switch (family) {
      case 'STM32':
        return 0x10000; // 64KB
      case 'NRF52':
        return 0x1000; // 4KB (enough to include vector table + code)
      case 'RP2040':
        return 0x10000; // 64KB (reduced for stability)
      case 'ESP32':
        return 0x10000; // 64KB
      default:
        return 0x10000; // 64KB default
    }
  }

  /**
   * Get fallback MCU info when detection fails
   */
  private getFallbackMcuInfo(): McuInfo {
    return {
      family: 'Unknown' as McuFamily,
      architecture: 'ARM Thumb' as Architecture,
      name: 'Unknown MCU',
      flashBase: 0x08000000,
      regions: [],
      detectionMethod: 'fallback'
    };
  }
}
