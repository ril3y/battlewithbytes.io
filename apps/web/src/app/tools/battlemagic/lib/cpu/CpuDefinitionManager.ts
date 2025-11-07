/**
 * CPU Definition Manager
 *
 * Manages loading, caching, and working with CPU definitions
 */

import { CpuDefinition, CustomCpuDefinition, MemoryRegionDefinition } from './CpuDefinition';

// Import built-in CPU definitions
import mt7697 from '../../data/cpu-definitions/mt7697.json';
import stm32f407 from '../../data/cpu-definitions/stm32f407.json';
import nrf52832 from '../../data/cpu-definitions/nrf52832.json';
import genericCortexM4 from '../../data/cpu-definitions/generic-cortex-m4.json';

const BUILTIN_DEFINITIONS: CpuDefinition[] = [
  mt7697 as unknown as CpuDefinition,
  stm32f407 as unknown as CpuDefinition,
  nrf52832 as unknown as CpuDefinition,
  genericCortexM4 as unknown as CpuDefinition,
];

const CUSTOM_DEFINITIONS_KEY = 'battlemagic_custom_cpu_definitions';

export class CpuDefinitionManager {
  private definitions: Map<string, CpuDefinition>;
  private customDefinitions: Map<string, CustomCpuDefinition>;

  constructor() {
    this.definitions = new Map();
    this.customDefinitions = new Map();
    this.loadDefinitions();
  }

  /**
   * Load all CPU definitions (built-in and custom)
   */
  private loadDefinitions(): void {
    // Load built-in definitions
    for (const def of BUILTIN_DEFINITIONS) {
      this.definitions.set(def.id, def);
    }

    // Load custom definitions from localStorage
    this.loadCustomDefinitions();
  }

  /**
   * Load custom user-created definitions from localStorage
   */
  private loadCustomDefinitions(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(CUSTOM_DEFINITIONS_KEY);
      if (stored) {
        const customDefs = JSON.parse(stored) as CustomCpuDefinition[];
        for (const def of customDefs) {
          this.customDefinitions.set(def.id, def);
        }
      }
    } catch (error) {
      console.error('Failed to load custom CPU definitions:', error);
    }
  }

  /**
   * Save custom definitions to localStorage
   */
  private saveCustomDefinitions(): void {
    if (typeof window === 'undefined') return;

    try {
      const customDefs = Array.from(this.customDefinitions.values());
      localStorage.setItem(CUSTOM_DEFINITIONS_KEY, JSON.stringify(customDefs));
    } catch (error) {
      console.error('Failed to save custom CPU definitions:', error);
    }
  }

  /**
   * Get all available CPU definitions
   */
  getAllDefinitions(): CpuDefinition[] {
    const builtIn = Array.from(this.definitions.values());
    const custom = Array.from(this.customDefinitions.values());
    return [...builtIn, ...custom];
  }

  /**
   * Get definitions grouped by family
   */
  getDefinitionsByFamily(): Record<string, CpuDefinition[]> {
    const allDefs = this.getAllDefinitions();
    const grouped: Record<string, CpuDefinition[]> = {};

    for (const def of allDefs) {
      if (!grouped[def.family]) {
        grouped[def.family] = [];
      }
      grouped[def.family].push(def);
    }

    return grouped;
  }

  /**
   * Get definitions grouped by vendor
   */
  getDefinitionsByVendor(): Record<string, CpuDefinition[]> {
    const allDefs = this.getAllDefinitions();
    const grouped: Record<string, CpuDefinition[]> = {};

    for (const def of allDefs) {
      if (!grouped[def.vendor]) {
        grouped[def.vendor] = [];
      }
      grouped[def.vendor].push(def);
    }

    return grouped;
  }

  /**
   * Get a specific CPU definition by ID
   */
  getDefinition(id: string): CpuDefinition | undefined {
    return this.definitions.get(id) || this.customDefinitions.get(id);
  }

  /**
   * Add or update a custom CPU definition
   */
  saveCustomDefinition(definition: Omit<CustomCpuDefinition, 'custom' | 'createdAt' | 'modifiedAt'>): void {
    const now = new Date().toISOString();
    const existing = this.customDefinitions.get(definition.id);

    const customDef: CustomCpuDefinition = {
      ...definition,
      custom: true,
      createdAt: existing?.createdAt || now,
      modifiedAt: now,
    };

    this.customDefinitions.set(definition.id, customDef);
    this.saveCustomDefinitions();
  }

  /**
   * Delete a custom CPU definition
   */
  deleteCustomDefinition(id: string): boolean {
    const deleted = this.customDefinitions.delete(id);
    if (deleted) {
      this.saveCustomDefinitions();
    }
    return deleted;
  }

  /**
   * Check if a definition is custom (user-created)
   */
  isCustomDefinition(id: string): boolean {
    return this.customDefinitions.has(id);
  }

  /**
   * Create a blank CPU definition template for users to fill in
   */
  createBlankDefinition(): Omit<CustomCpuDefinition, 'custom' | 'createdAt' | 'modifiedAt'> {
    return {
      id: `custom-${Date.now()}`,
      name: 'New CPU',
      family: 'Unknown',
      vendor: 'Custom',
      architecture: 'Unknown',
      memoryRegions: [
        {
          name: 'Flash',
          type: 'flash',
          start: 0x08000000,
          end: 0x080FFFFF,
          size: 0x100000,
          permissions: { read: true, write: false, execute: true },
        },
        {
          name: 'RAM',
          type: 'sram',
          start: 0x20000000,
          end: 0x2001FFFF,
          size: 0x20000,
          permissions: { read: true, write: true, execute: true },
        },
      ],
    };
  }

  /**
   * Export a CPU definition as JSON string
   */
  exportDefinition(id: string): string | null {
    const def = this.getDefinition(id);
    if (!def) return null;
    return JSON.stringify(def, null, 2);
  }

  /**
   * Import a CPU definition from JSON string
   */
  importDefinition(jsonString: string): CpuDefinition | null {
    try {
      const def = JSON.parse(jsonString) as CpuDefinition;

      // Validate required fields
      if (!def.id || !def.name || !def.family || !def.memoryRegions) {
        throw new Error('Invalid CPU definition: missing required fields');
      }

      // Convert to custom definition
      this.saveCustomDefinition(def);
      return def;
    } catch (error) {
      console.error('Failed to import CPU definition:', error);
      return null;
    }
  }

  /**
   * Find memory region containing an address
   */
  findRegionForAddress(definition: CpuDefinition, address: number): MemoryRegionDefinition | null {
    for (const region of definition.memoryRegions) {
      if (address >= region.start && address <= region.end) {
        // Check subregions first
        if (region.subregions) {
          for (const subregion of region.subregions) {
            if (address >= subregion.start && address <= subregion.end) {
              return subregion;
            }
          }
        }
        return region;
      }
    }
    return null;
  }

  /**
   * Get all unique families
   */
  getFamilies(): string[] {
    const families = new Set<string>();
    for (const def of this.getAllDefinitions()) {
      families.add(def.family);
    }
    return Array.from(families).sort();
  }

  /**
   * Get all unique vendors
   */
  getVendors(): string[] {
    const vendors = new Set<string>();
    for (const def of this.getAllDefinitions()) {
      vendors.add(def.vendor);
    }
    return Array.from(vendors).sort();
  }
}

// Singleton instance
let managerInstance: CpuDefinitionManager | null = null;

export function getCpuDefinitionManager(): CpuDefinitionManager {
  if (!managerInstance) {
    managerInstance = new CpuDefinitionManager();
  }
  return managerInstance;
}
