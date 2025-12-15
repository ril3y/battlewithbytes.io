/**
 * Chip Database
 *
 * Manages the microcontroller chip database with support for:
 * - Built-in chips (loaded from chips.json)
 * - Custom user-added chips (persisted to IndexedDB)
 * - Pattern matching for architecture detection
 * - Memory layout information
 */

// Import built-in chip database
import chipsJson from './chips.json';

export interface ChipDefinition {
  family: string;
  manufacturer: string;
  architecture: string;
  supported: boolean;
  patterns: string[];
  description: string;
  flashBase: string;  // Hex string like "0x08000000"
  flashSize: string;  // Hex string like "0x100000"
  ramBase: string;    // Hex string like "0x20000000"
  ramSize: string;    // Hex string like "0x10000"
  vectorTableOffset: number;
  isCustom?: boolean; // Marks custom chips added by user
}

export interface ArchitectureInfo {
  architecture: string;
  chip_name: string;
  manufacturer: string;
  supported: boolean;
  confidence: number;
  architecture_name: string;
  isa_family: string;
  flash_base: number;  // Numeric for use in code
  flash_size: number;
  ram_base: number;
  ram_size: number;
  vector_table_offset: number;
}

export interface ChipDatabaseSchema {
  version: string;
  lastUpdated: string;
  description: string;
  chips: ChipDefinition[];
}

enum MatchQuality {
  Exact = 1.0,
  CaseInsensitive = 0.9,
  Prefix = 0.8,
  Contains = 0.6,
}

export class ChipDatabase {
  private builtInChips: ChipDefinition[];
  private customChips: ChipDefinition[] = [];
  private db: IDBDatabase | null = null;
  private dbReady: Promise<void>;

  constructor() {
    // Load built-in chips from JSON
    this.builtInChips = (chipsJson as ChipDatabaseSchema).chips;

    // Initialize IndexedDB for custom chips
    this.dbReady = this.initDB();
  }

  /**
   * Initialize IndexedDB for custom chip storage
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BattleMagicChips', 1);

      request.onerror = () => {
        console.error('[ChipDatabase] Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.loadCustomChips().then(resolve).catch(reject);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create custom_chips store
        if (!db.objectStoreNames.contains('custom_chips')) {
          db.createObjectStore('custom_chips', { keyPath: 'family' });
        }
      };
    });
  }

  /**
   * Load custom chips from IndexedDB
   */
  private async loadCustomChips(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['custom_chips'], 'readonly');
      const store = transaction.objectStore('custom_chips');
      const request = store.getAll();

      request.onsuccess = () => {
        this.customChips = request.result.map(chip => ({ ...chip, isCustom: true }));
        console.log(`[ChipDatabase] Loaded ${this.customChips.length} custom chips`);
        resolve();
      };

      request.onerror = () => {
        console.error('[ChipDatabase] Failed to load custom chips:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Wait for database to be ready
   */
  async ready(): Promise<void> {
    await this.dbReady;
  }

  /**
   * Get all chips (built-in + custom)
   */
  getAllChips(): ChipDefinition[] {
    return [...this.builtInChips, ...this.customChips];
  }

  /**
   * Get only built-in chips
   */
  getBuiltInChips(): ChipDefinition[] {
    return [...this.builtInChips];
  }

  /**
   * Get only custom chips
   */
  getCustomChips(): ChipDefinition[] {
    return [...this.customChips];
  }

  /**
   * Add a custom chip
   */
  async addCustomChip(chip: Omit<ChipDefinition, 'isCustom'>): Promise<void> {
    await this.ready();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Check if family already exists
    if (this.getAllChips().some(c => c.family === chip.family)) {
      throw new Error(`Chip family '${chip.family}' already exists`);
    }

    const customChip: ChipDefinition = { ...chip, isCustom: true };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['custom_chips'], 'readwrite');
      const store = transaction.objectStore('custom_chips');
      const request = store.add(customChip);

      request.onsuccess = () => {
        this.customChips.push(customChip);
        console.log(`[ChipDatabase] Added custom chip: ${chip.family}`);
        resolve();
      };

      request.onerror = () => {
        console.error('[ChipDatabase] Failed to add custom chip:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Update a custom chip
   */
  async updateCustomChip(family: string, updates: Partial<ChipDefinition>): Promise<void> {
    await this.ready();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const chipIndex = this.customChips.findIndex(c => c.family === family);
    if (chipIndex === -1) {
      throw new Error(`Custom chip '${family}' not found`);
    }

    const updatedChip = { ...this.customChips[chipIndex], ...updates, isCustom: true };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['custom_chips'], 'readwrite');
      const store = transaction.objectStore('custom_chips');
      const request = store.put(updatedChip);

      request.onsuccess = () => {
        this.customChips[chipIndex] = updatedChip;
        console.log(`[ChipDatabase] Updated custom chip: ${family}`);
        resolve();
      };

      request.onerror = () => {
        console.error('[ChipDatabase] Failed to update custom chip:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete a custom chip
   */
  async deleteCustomChip(family: string): Promise<void> {
    await this.ready();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const chipIndex = this.customChips.findIndex(c => c.family === family);
    if (chipIndex === -1) {
      throw new Error(`Custom chip '${family}' not found`);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['custom_chips'], 'readwrite');
      const store = transaction.objectStore('custom_chips');
      const request = store.delete(family);

      request.onsuccess = () => {
        this.customChips.splice(chipIndex, 1);
        console.log(`[ChipDatabase] Deleted custom chip: ${family}`);
        resolve();
      };

      request.onerror = () => {
        console.error('[ChipDatabase] Failed to delete custom chip:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Match a pattern against target description
   */
  private matchPattern(targetDesc: string, pattern: string): MatchQuality | null {
    const target = targetDesc.toLowerCase();
    const pat = pattern.toLowerCase();

    // Exact match (case-insensitive)
    if (target === pat) {
      return pattern === targetDesc ? MatchQuality.Exact : MatchQuality.CaseInsensitive;
    }

    // Prefix match
    if (target.startsWith(pat)) {
      return MatchQuality.Prefix;
    }

    // Contains match
    if (target.includes(pat)) {
      return MatchQuality.Contains;
    }

    return null;
  }

  /**
   * Detect architecture from target description
   */
  async detectArchitecture(targetDescription: string): Promise<ArchitectureInfo> {
    await this.ready();

    if (!targetDescription || targetDescription.trim().length === 0) {
      return this.getDefaultArchInfo();
    }

    let bestMatch: ChipDefinition | null = null;
    let bestConfidence = 0.0;

    // Search all chips (custom chips checked first for priority)
    const chips = this.getAllChips();

    for (const chip of chips) {
      for (const pattern of chip.patterns) {
        const quality = this.matchPattern(targetDescription, pattern);

        if (quality !== null) {
          // Add pattern length bonus (longer patterns are more specific)
          const patternBonus = Math.min(pattern.length / 20, 0.1);
          const confidence = quality + patternBonus;

          if (confidence > bestConfidence) {
            bestConfidence = confidence;
            bestMatch = chip;
          }
        }
      }
    }

    if (bestMatch) {
      return this.chipToArchInfo(bestMatch, Math.min(bestConfidence, 1.0));
    }

    return this.getDefaultArchInfo();
  }

  /**
   * Convert chip definition to ArchitectureInfo
   */
  private chipToArchInfo(chip: ChipDefinition, confidence: number): ArchitectureInfo {
    return {
      architecture: chip.architecture,
      chip_name: chip.family,
      manufacturer: chip.manufacturer,
      supported: chip.supported,
      confidence,
      architecture_name: this.getArchitectureName(chip.architecture),
      isa_family: this.getISAFamily(chip.architecture),
      flash_base: parseInt(chip.flashBase, 16),
      flash_size: parseInt(chip.flashSize, 16),
      ram_base: parseInt(chip.ramBase, 16),
      ram_size: parseInt(chip.ramSize, 16),
      vector_table_offset: chip.vectorTableOffset,
    };
  }

  /**
   * Get human-readable architecture name
   */
  private getArchitectureName(arch: string): string {
    const names: Record<string, string> = {
      ArmCortexM0: 'ARM Cortex-M0',
      ArmCortexM0Plus: 'ARM Cortex-M0+',
      ArmCortexM3: 'ARM Cortex-M3',
      ArmCortexM4: 'ARM Cortex-M4',
      ArmCortexM7: 'ARM Cortex-M7',
      ArmCortexM23: 'ARM Cortex-M23',
      ArmCortexM33: 'ARM Cortex-M33',
      Mips32: 'MIPS32',
      Mips32r2: 'MIPS32r2',
      RiscV32: 'RISC-V 32',
      RiscV32C: 'RISC-V 32 Compressed',
    };
    return names[arch] || 'Unknown';
  }

  /**
   * Get ISA family
   */
  private getISAFamily(arch: string): string {
    if (arch.startsWith('ArmCortex')) return 'ARM';
    if (arch.startsWith('Mips')) return 'MIPS';
    if (arch.startsWith('RiscV')) return 'RISC-V';
    return 'Unknown';
  }

  /**
   * Get default/unknown architecture info
   */
  private getDefaultArchInfo(): ArchitectureInfo {
    return {
      architecture: 'Unknown',
      chip_name: 'Unknown',
      manufacturer: 'Unknown',
      supported: false,
      confidence: 0.0,
      architecture_name: 'Unknown',
      isa_family: 'Unknown',
      flash_base: 0x00000000,
      flash_size: 0x10000,
      ram_base: 0x20000000,
      ram_size: 0x4000,
      vector_table_offset: 0,
    };
  }

  /**
   * Export custom chips to JSON
   */
  async exportCustomChips(): Promise<string> {
    await this.ready();
    return JSON.stringify({
      version: '1.0.0',
      exported: new Date().toISOString(),
      chips: this.customChips,
    }, null, 2);
  }

  /**
   * Import custom chips from JSON
   */
  async importCustomChips(jsonString: string): Promise<number> {
    await this.ready();

    try {
      const data = JSON.parse(jsonString);
      const chips = data.chips || [];
      let imported = 0;

      for (const chip of chips) {
        try {
          await this.addCustomChip(chip);
          imported++;
        } catch (error) {
          console.warn(`[ChipDatabase] Skipping chip ${chip.family}:`, error);
        }
      }

      return imported;
    } catch (error) {
      throw new Error(`Failed to import chips: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Global singleton instance
let chipDatabaseInstance: ChipDatabase | null = null;

/**
 * Get the global chip database instance
 */
export function getChipDatabase(): ChipDatabase {
  if (!chipDatabaseInstance) {
    chipDatabaseInstance = new ChipDatabase();
  }
  return chipDatabaseInstance;
}
