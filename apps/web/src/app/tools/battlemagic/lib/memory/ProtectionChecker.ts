/**
 * Protection Checker
 *
 * Detects and analyzes memory protection mechanisms across different MCU families
 * Provides helpful guidance for unlocking protected devices
 */

import { GdbClient } from "../gdb/GdbClient";
import type {
  ProtectionInfo,
  ProtectionStatus,
  RdpLevel,
  McuFamily,
} from "./types";

export class ProtectionChecker {
  private gdbClient: GdbClient;

  constructor(gdbClient: GdbClient) {
    this.gdbClient = gdbClient;
  }

  /**
   * Check protection status for a specific MCU family
   */
  async check(family: McuFamily, flashBase: number): Promise<ProtectionInfo> {
    switch (family) {
      case "STM32":
        return this.checkStm32Protection();
      case "NRF52":
      case "NRF51":
        return this.checkNrfProtection(flashBase);
      case "ESP32":
        return this.checkEsp32Protection(flashBase);
      default:
        return this.checkGenericProtection(flashBase);
    }
  }

  /**
   * Check STM32 RDP (Read Protection) level
   */
  private async checkStm32Protection(): Promise<ProtectionInfo> {
    try {
      // Try to read option bytes to determine RDP level
      const optionOutput = await this.gdbClient.sendMonitorCommand("option");

      let rdpLevel: RdpLevel = "Unknown" as RdpLevel;
      let status: ProtectionStatus = "Unknown" as ProtectionStatus;

      // Parse RDP level from output
      if (
        optionOutput.toLowerCase().includes("rdp level 0") ||
        optionOutput.toLowerCase().includes("level: aa")
      ) {
        rdpLevel = "Level 0 (No Protection)" as RdpLevel;
        status = "None" as ProtectionStatus;
      } else if (
        optionOutput.toLowerCase().includes("rdp level 1") ||
        optionOutput.toLowerCase().includes("level: any value except aa")
      ) {
        rdpLevel = "Level 1 (Read Protection)" as RdpLevel;
        status = "Read Protected" as ProtectionStatus;
      } else if (
        optionOutput.toLowerCase().includes("rdp level 2") ||
        optionOutput.toLowerCase().includes("level: cc")
      ) {
        rdpLevel = "Level 2 (Permanent Protection)" as RdpLevel;
        status = "Fully Protected" as ProtectionStatus;
      }

      // Test if we can actually read flash
      const canRead = await this.testRead(0x08000000);

      return {
        status: canRead ? ("None" as ProtectionStatus) : status,
        details: this.getStm32ProtectionDetails(rdpLevel, canRead),
        canRead,
        canWrite: false,
        rdpLevel,
        unlockInstructions: this.getStm32UnlockInstructions(rdpLevel),
        alternativeMethods: [
          "Upload binary file directly for analysis",
          "Use STM32CubeProgrammer to unlock (WARNING: erases flash!)",
          "Check if SWD is disabled in option bytes",
        ],
      };
    } catch {
      // Fallback: test read (ignore error, we're in fallback mode)
      const canRead = await this.testRead(0x08000000);

      return {
        status: canRead
          ? ("None" as ProtectionStatus)
          : ("Unknown" as ProtectionStatus),
        details: canRead
          ? "Flash is readable (RDP likely disabled)"
          : "Cannot read flash - protection may be enabled or device not responding",
        canRead,
        canWrite: false,
        alternativeMethods: [
          "Upload binary file for offline analysis",
          "Verify target power and connections",
          "Check if device is halted",
        ],
      };
    }
  }

  /**
   * Check Nordic nRF APPROTECT status
   */
  private async checkNrfProtection(flashBase: number): Promise<ProtectionInfo> {
    try {
      // APPROTECT register addresses
      // nRF52: 0x10001208 (APPROTECT)
      // nRF51: 0x40000208 (RBPCONF)

      const approtectAddr = 0x10001208; // nRF52
      let approtectEnabled = false;

      try {
        // Try to read APPROTECT register
        const data = await this.gdbClient.readMemory(approtectAddr, 4);
        const value = new DataView(data.buffer).getUint32(0, true);

        // 0xFFFFFFFF = disabled, anything else = enabled
        approtectEnabled = value !== 0xffffffff;
      } catch {
        // Cannot read APPROTECT register, test flash instead
      }

      // Test flash read
      const canRead = await this.testRead(flashBase);

      const status: ProtectionStatus =
        !canRead || approtectEnabled
          ? ("Read Protected" as ProtectionStatus)
          : ("None" as ProtectionStatus);

      return {
        status,
        details: this.getNrfProtectionDetails(approtectEnabled, canRead),
        canRead,
        canWrite: false,
        approtect: approtectEnabled,
        unlockInstructions: this.getNrfUnlockInstructions(),
        alternativeMethods: [
          "Upload .hex or .bin file for offline analysis",
          "Use nrfjprog to disable APPROTECT (WARNING: erases flash!)",
          "Check if debugger is properly connected",
        ],
      };
    } catch {
      // Fallback: test flash read (ignore error)
      const canRead = await this.testRead(flashBase);

      return {
        status: canRead
          ? ("None" as ProtectionStatus)
          : ("Unknown" as ProtectionStatus),
        details: canRead
          ? "Flash is readable"
          : "Cannot read flash - APPROTECT may be enabled",
        canRead,
        canWrite: false,
        alternativeMethods: [
          "Upload firmware file for analysis",
          "Verify SWD connections",
          "Try power cycling the target",
        ],
      };
    }
  }

  /**
   * Check ESP32 flash encryption
   */
  private async checkEsp32Protection(
    flashBase: number,
  ): Promise<ProtectionInfo> {
    const canRead = await this.testRead(flashBase);

    return {
      status: canRead
        ? ("None" as ProtectionStatus)
        : ("Read Protected" as ProtectionStatus),
      details: canRead
        ? "Flash is readable (encryption likely disabled)"
        : "Cannot read flash - encryption may be enabled",
      canRead,
      canWrite: false,
      flashEncrypted: !canRead,
      unlockInstructions: [
        "Flash encryption cannot be disabled once enabled",
        "Analyze unencrypted firmware file instead",
      ],
      alternativeMethods: [
        "Upload unencrypted .bin file for analysis",
        "Extract firmware before encryption is enabled",
        "Use espefuse.py to check encryption status",
      ],
    };
  }

  /**
   * Generic protection check (fallback)
   */
  private async checkGenericProtection(
    flashBase: number,
  ): Promise<ProtectionInfo> {
    const canRead = await this.testRead(flashBase);

    return {
      status: canRead
        ? ("None" as ProtectionStatus)
        : ("Unknown" as ProtectionStatus),
      details: canRead
        ? "Flash is readable"
        : "Cannot read flash - protection may be enabled or address incorrect",
      canRead,
      canWrite: false,
      alternativeMethods: [
        "Upload binary file for offline analysis",
        "Verify flash base address is correct",
        "Check target power and debugger connection",
        "Ensure target is halted",
      ],
    };
  }

  /**
   * Test if memory at address is readable
   */
  private async testRead(address: number): Promise<boolean> {
    try {
      const data = await this.gdbClient.readMemory(address, 16);
      return data && data.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get STM32 protection details
   */
  private getStm32ProtectionDetails(
    rdpLevel: RdpLevel,
    canRead: boolean,
  ): string {
    if (rdpLevel === "Level 0 (No Protection)") {
      return "No read protection - flash is fully accessible";
    }
    if (rdpLevel === "Level 1 (Read Protection)") {
      return "RDP Level 1: Debug access disabled, flash cannot be read via SWD";
    }
    if (rdpLevel === "Level 2 (Permanent Protection)") {
      return "RDP Level 2: PERMANENT protection - cannot be unlocked without destroying device";
    }
    return canRead
      ? "Flash is readable"
      : "Flash read failed - RDP may be enabled";
  }

  /**
   * Get STM32 unlock instructions
   */
  private getStm32UnlockInstructions(rdpLevel: RdpLevel): string[] {
    if (rdpLevel === "Level 2 (Permanent Protection)") {
      return [
        "WARNING: RDP Level 2 is PERMANENT and cannot be removed",
        "Any attempt to unlock will destroy the device",
        "Firmware cannot be extracted from this device",
      ];
    }

    return [
      "WARNING: Unlocking RDP will ERASE ALL FLASH MEMORY",
      "1. Use STM32CubeProgrammer or OpenOCD",
      "2. Connect via SWD",
      "3. Read option bytes",
      "4. Change RDP level to 0xAA (Level 0)",
      "5. Flash will be erased automatically",
      "",
      "Alternative: Analyze unprotected firmware backup",
    ];
  }

  /**
   * Get nRF protection details
   */
  private getNrfProtectionDetails(
    approtectEnabled: boolean,
    canRead: boolean,
  ): string {
    if (!approtectEnabled && canRead) {
      return "APPROTECT disabled - flash is fully accessible";
    }
    if (approtectEnabled) {
      return "APPROTECT enabled - debug access disabled, flash cannot be read";
    }
    return canRead
      ? "Flash is readable"
      : "Flash read failed - APPROTECT may be enabled";
  }

  /**
   * Get nRF unlock instructions
   */
  private getNrfUnlockInstructions(): string[] {
    return [
      "WARNING: Disabling APPROTECT will ERASE ALL FLASH and UICR",
      "1. Use nrfjprog: nrfjprog --recover",
      "2. Or use JLink: J-Link Commander -> erase",
      "3. This will perform a full chip erase",
      "4. All data will be lost",
      "",
      "Alternative: Analyze firmware file instead of live target",
    ];
  }
}
