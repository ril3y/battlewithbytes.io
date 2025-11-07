/**
 * CPU Definition Types
 *
 * Defines the structure for MCU/SoC memory maps and configurations
 */

export interface MemoryRegionDefinition {
  name: string;
  type: 'flash' | 'ram' | 'sram' | 'peripheral' | 'external_ram' | 'external_device' | 'system' | 'reserved' | 'rom';
  start: number;
  end: number;
  size: number;
  permissions?: {
    read: boolean;
    write: boolean;
    execute: boolean;
  };
  description?: string;
  subregions?: MemoryRegionDefinition[];
}

export interface BreakpointCapabilities {
  hardwareBreakpoints: number;  // Max number of HW breakpoints
  watchpoints: number;           // Max number of watchpoints
  supportsConditional: boolean;
  supportsDataBreakpoints: boolean;
}

export interface VectorTable {
  address: number;
  entries: {
    offset: number;
    name: string;
    description?: string;
  }[];
}

export interface ProtectionRegister {
  name: string;
  address: number;
  description: string;
  readOnly: boolean;
  size: number;  // Size in bytes (typically 4 for 32-bit registers)
  protectedValues?: number[];    // Values that indicate protection is enabled
  unprotectedValues?: number[];  // Values that indicate protection is disabled
  interpretation?: {             // Human-readable interpretation of register values
    [key: string]: string;
  };
  disableCommand?: string;       // Command to disable protection (e.g., "monitor erase_mass")
  disableWarning?: string;       // Warning message before disabling protection
}

export interface CpuDefinition {
  id: string;                    // Unique identifier (e.g., "mt7697", "stm32f407")
  name: string;                  // Display name
  family: string;                // CPU family (e.g., "ARM Cortex-M4", "RISC-V", "MIPS")
  vendor: string;                // Manufacturer
  architecture: string;          // Architecture (e.g., "ARMv7-M", "RISC-V RV32IMAC")
  coreFrequency?: number;        // Max core frequency in Hz
  flashSize?: number;            // Total flash in bytes
  ramSize?: number;              // Total RAM in bytes
  memoryRegions: MemoryRegionDefinition[];
  vectorTable?: VectorTable;
  breakpointCaps?: BreakpointCapabilities;
  protectionRegisters?: ProtectionRegister[];  // Security/protection registers for reverse engineering
  peripherals?: {
    name: string;
    baseAddress: number;
    size: number;
    description?: string;
    registers?: {
      offset: number;
      name: string;
      description?: string;
      resetValue?: number;
    }[];
  }[];
  debugInterface?: string[];     // Supported debug interfaces (SWD, JTAG, etc.)
  notes?: string;
  url?: string;                  // URL to CPU/product page
  datasheet?: string;            // URL or path to datasheet
}

/**
 * User-created custom CPU definition
 */
export interface CustomCpuDefinition extends CpuDefinition {
  custom: true;
  createdAt: string;
  modifiedAt: string;
}

/**
 * CPU definition index for quick lookup
 */
export interface CpuDefinitionIndex {
  [key: string]: {
    id: string;
    name: string;
    family: string;
    vendor: string;
    path: string;
  };
}
