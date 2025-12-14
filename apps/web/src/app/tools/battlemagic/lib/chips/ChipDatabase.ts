/**
 * Chip Database - Stub implementation
 * TODO: Implement full chip database
 */

export interface ChipInfo {
  id: string;
  name: string;
  manufacturer: string;
  architecture: string;
  flashSize: number;
  ramSize: number;
}

export interface ChipDefinition {
  id?: string;
  name?: string;
  family: string;
  manufacturer: string;
  architecture: string;
  flash?: number;
  ram?: number;
  package?: string;
  features?: string[];
  isCustom?: boolean;
  description: string;
  core?: string;
  frequency?: number;
  svdPath?: string;
  flashBase: string;
  ramBase: string;
  flashSize: string;
  ramSize: string;
  supported: boolean;
  vectorTableOffset: number;
  patterns: string[];
}

export interface ChipDatabaseEntry {
  chip: ChipInfo;
  svdFile?: string;
}

class ChipDatabaseImpl {
  private chips: Map<string, ChipDatabaseEntry> = new Map();
  private isLoaded = false;

  async loadDatabase(): Promise<void> {
    // TODO: Load chip database from server
    this.isLoaded = true;
  }

  async ready(): Promise<void> {
    if (!this.isLoaded) {
      await this.loadDatabase();
    }
  }

  getChip(id: string): ChipDatabaseEntry | undefined {
    return this.chips.get(id);
  }

  searchChips(query: string): ChipDatabaseEntry[] {
    const results: ChipDatabaseEntry[] = [];
    this.chips.forEach((entry) => {
      if (
        entry.chip.name.toLowerCase().includes(query.toLowerCase()) ||
        entry.chip.id.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push(entry);
      }
    });
    return results;
  }

  getAllChips(): ChipDefinition[] {
    // Convert entries to definitions
    return Array.from(this.chips.values()).map((entry) => ({
      id: entry.chip.id,
      name: entry.chip.name,
      family: entry.chip.manufacturer,
      manufacturer: entry.chip.manufacturer,
      architecture: entry.chip.architecture,
      flash: entry.chip.flashSize,
      ram: entry.chip.ramSize,
      description: `${entry.chip.name} - ${entry.chip.manufacturer}`,
      flashBase: "0x08000000",
      ramBase: "0x20000000",
      flashSize: entry.chip.flashSize.toString(16),
      ramSize: entry.chip.ramSize.toString(16),
      supported: true,
      vectorTableOffset: 0,
      patterns: [],
    }));
  }

  async deleteCustomChip(family: string): Promise<void> {
    // TODO: Implement custom chip deletion
    this.chips.delete(family);
  }

  async exportCustomChips(): Promise<string> {
    // TODO: Implement export
    return JSON.stringify([]);
  }

  async importCustomChips(json: string): Promise<number> {
    // TODO: Implement import
    const chips = JSON.parse(json) as ChipDefinition[];
    return chips.length;
  }

  async updateCustomChip(family: string, chip: ChipDefinition): Promise<void> {
    // TODO: Implement update
    console.log("Update chip:", family, chip);
  }

  async addCustomChip(chip: ChipDefinition): Promise<void> {
    // TODO: Implement add
    console.log("Add chip:", chip);
  }

  detectArchitecture(targetDescription: string): ArchitectureInfo {
    // Simple pattern matching for chip detection
    const upperDesc = targetDescription.toUpperCase();

    if (upperDesc.includes("STM32F4") || upperDesc.includes("STM32F407")) {
      return {
        architecture: "ArmCortexM4",
        chip_name: "STM32F407",
        manufacturer: "STMicroelectronics",
        supported: true,
        confidence: 0.9,
        flash_base: 0x08000000,
      };
    }

    if (upperDesc.includes("STM32F1") || upperDesc.includes("STM32F103")) {
      return {
        architecture: "ArmCortexM3",
        chip_name: "STM32F103",
        manufacturer: "STMicroelectronics",
        supported: true,
        confidence: 0.9,
        flash_base: 0x08000000,
      };
    }

    if (upperDesc.includes("STM32")) {
      return {
        architecture: "ArmCortexM",
        chip_name: targetDescription,
        manufacturer: "STMicroelectronics",
        supported: true,
        confidence: 0.7,
        flash_base: 0x08000000,
      };
    }

    // Default unknown architecture
    return {
      architecture: "Unknown",
      chip_name: targetDescription,
      manufacturer: "Unknown",
      supported: false,
      confidence: 0.1,
    };
  }

  getSupportedChips(): ArchitectureInfo[] {
    // Return list of known supported chips
    return [
      {
        architecture: "ArmCortexM4",
        chip_name: "STM32F407",
        manufacturer: "STMicroelectronics",
        supported: true,
        confidence: 1.0,
        flash_base: 0x08000000,
      },
      {
        architecture: "ArmCortexM3",
        chip_name: "STM32F103",
        manufacturer: "STMicroelectronics",
        supported: true,
        confidence: 1.0,
        flash_base: 0x08000000,
      },
    ];
  }

  isArchitectureSupported(archName: string): boolean {
    const supported = ["ArmCortexM", "ArmCortexM3", "ArmCortexM4", "ArmCortexM7"];
    return supported.some((s) => archName.includes(s));
  }
}

interface ArchitectureInfo {
  architecture: string;
  chip_name: string;
  manufacturer: string;
  supported: boolean;
  confidence: number;
  flash_base?: number;
}

export const ChipDatabase = new ChipDatabaseImpl();

export function useChipDatabase() {
  return ChipDatabase;
}

export function getChipDatabase() {
  return ChipDatabase;
}
