/**
 * Memory Detection Type Definitions
 *
 * Interfaces for MCU detection, memory layout, and protection status
 */

/**
 * Supported MCU architectures
 */
export enum Architecture {
  ARM_THUMB = "ARM Thumb",
  ARM = "ARM",
  RISCV = "RISC-V",
  UNKNOWN = "Unknown",
}

/**
 * MCU vendor/family
 */
export enum McuFamily {
  STM32 = "STM32",
  NRF52 = "NRF52",
  NRF51 = "NRF51",
  ESP32 = "ESP32",
  RP2040 = "RP2040",
  UNKNOWN = "Unknown",
}

/**
 * Memory protection status
 */
export enum ProtectionStatus {
  NONE = "None",
  READ_PROTECTED = "Read Protected",
  WRITE_PROTECTED = "Write Protected",
  FULL_PROTECTED = "Fully Protected",
  UNKNOWN = "Unknown",
}

/**
 * STM32 RDP (Read Protection) levels
 */
export enum RdpLevel {
  LEVEL_0 = "Level 0 (No Protection)",
  LEVEL_1 = "Level 1 (Read Protection)",
  LEVEL_2 = "Level 2 (Permanent Protection)",
  UNKNOWN = "Unknown",
}

/**
 * Memory region information
 */
export interface MemoryRegion {
  name: string;
  start: number;
  size: number;
  type: "flash" | "ram" | "peripheral" | "other";
  readable: boolean;
  writable: boolean;
  executable: boolean;
}

/**
 * MCU detection result
 */
export interface McuInfo {
  family: McuFamily;
  architecture: Architecture;
  name: string;
  flashBase: number;
  flashSize?: number;
  ramBase?: number;
  ramSize?: number;
  regions: MemoryRegion[];
  detectionMethod: string;
}

/**
 * Memory protection information
 */
export interface ProtectionInfo {
  status: ProtectionStatus;
  details: string;
  canRead: boolean;
  canWrite: boolean;
  rdpLevel?: RdpLevel; // STM32 specific
  approtect?: boolean; // NRF52 specific
  flashEncrypted?: boolean; // ESP32 specific
  unlockInstructions?: string[];
  alternativeMethods?: string[];
}

/**
 * Complete memory detection result
 */
export interface MemoryDetectionResult {
  success: boolean;
  mcu: McuInfo;
  protection: ProtectionInfo;
  recommendedFlashBase: number;
  recommendedReadSize: number;
  error?: string;
}

/**
 * Manual memory configuration (user override)
 */
export interface ManualMemoryConfig {
  flashBase: number;
  readSize: number;
  architecture: Architecture;
  force: boolean; // Force use even if auto-detection available
}

/**
 * Saved memory configuration (localStorage)
 */
export interface SavedMemoryConfig {
  targetSignature: string; // Hash/signature of target for identification
  config: ManualMemoryConfig;
  timestamp: number;
}
