/**
 * BattleMagic Project File Format
 *
 * Defines the structure for saving and loading debugging sessions.
 * Uses JSON format with versioning for future compatibility.
 */

import { MemoryRegion } from '../memory/MemoryMapParser';
import { Breakpoint } from '../../components/BreakpointsManager';

/**
 * Project file format version
 * Increment when making breaking changes to the format
 */
export const PROJECT_FORMAT_VERSION = 1;

/**
 * Project metadata
 */
export interface ProjectMetadata {
  /** Project name/title */
  name: string;
  /** Optional description */
  description?: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last modification timestamp */
  lastModified: string;
  /** Project format version */
  version: number;
}

/**
 * GDB connection settings
 */
export interface GdbConnectionSettings {
  /** Baud rate for GDB connection */
  baudRate: number;
  /** Command timeout in milliseconds */
  commandTimeout?: number;
}

/**
 * Memory map view state
 */
export interface MemoryMapViewState {
  /** Zoom level */
  zoom: number;
  /** Pan offset */
  offset: { x: number; y: number };
  /** Selected CPU/MCU ID */
  selectedCpu: string;
  /** Custom board-specific memory regions */
  customRegions: MemoryRegion[];
}

/**
 * Session notes/comments
 */
export interface SessionNotes {
  /** General session notes */
  general?: string;
  /** Notes organized by timestamp */
  entries?: Array<{
    timestamp: string;
    note: string;
  }>;
}

/**
 * Cached firmware dump data
 */
export interface CachedFirmware {
  /** Firmware data as base64-encoded string (for JSON serialization) */
  data: string;
  /** SHA-256 hash of firmware data */
  hash: string;
  /** Base address where firmware is located */
  baseAddress: number;
  /** Size of firmware in bytes */
  size: number;
  /** When firmware was dumped */
  dumpedAt: string;
  /** Target chip name */
  chipName?: string;
  /** Architecture (e.g., "ArmCortexM4") */
  architecture?: string;
}

/**
 * Analysis metadata - tracks MDB (Analysis Database) state
 */
export interface AnalysisMetadata {
  /** When firmware was last analyzed */
  analyzedAt?: string;
  /** Analysis format version (for future migrations) */
  analysisVersion?: number;
  /** MDB database name (for IndexedDB lookup) */
  mdbDatabaseName?: string;
  /** Statistics from last analysis */
  stats?: {
    totalInstructions: number;
    functionCount: number;
    xrefCount: number;
    analysisTimeMs: number;
  };
  /** Firmware hash when analyzed (detect if firmware changed) */
  firmwareHashAtAnalysis?: string;
}

/**
 * Complete project data structure
 */
export interface BattleMagicProject {
  /** Project metadata */
  metadata: ProjectMetadata;

  /** GDB connection settings */
  gdbSettings: GdbConnectionSettings;

  /** Memory map configuration */
  memoryMap: MemoryMapViewState;

  /** Breakpoints and watchpoints */
  breakpoints: Breakpoint[];

  /** Session notes */
  notes?: SessionNotes;

  /** Last active panel/view */
  activePanel?: string;

  /** Cached firmware dump (to avoid re-dumping on every connect) */
  firmware?: CachedFirmware;

  /** Analysis metadata (tracks MDB state) */
  analysis?: AnalysisMetadata;

  /** Additional custom data for future extensions */
  customData?: Record<string, unknown>;
}

/**
 * Helper to create a new project with defaults
 */
export function createNewProject(name: string = 'Untitled Project'): BattleMagicProject {
  const now = new Date().toISOString();

  return {
    metadata: {
      name,
      description: '',
      createdAt: now,
      lastModified: now,
      version: PROJECT_FORMAT_VERSION
    },
    gdbSettings: {
      baudRate: 230400,
      commandTimeout: 15000
    },
    memoryMap: {
      zoom: 1.5,
      offset: { x: 0, y: 0 },
      selectedCpu: 'generic-cortex-m4',
      customRegions: []
    },
    breakpoints: [],
    notes: {
      general: '',
      entries: []
    }
  };
}

/**
 * Validate project structure
 */
export function isValidProject(data: unknown): data is BattleMagicProject {
  if (!data || typeof data !== 'object') return false;

  const project = data as BattleMagicProject;

  // Check required top-level properties
  if (!project.metadata || !project.gdbSettings || !project.memoryMap || !project.breakpoints) {
    return false;
  }

  // Check metadata
  if (!project.metadata.name || !project.metadata.createdAt || !project.metadata.lastModified) {
    return false;
  }

  // Check version
  if (typeof project.metadata.version !== 'number') {
    return false;
  }

  // Check gdbSettings
  if (typeof project.gdbSettings.baudRate !== 'number') {
    return false;
  }

  // Check memoryMap
  if (typeof project.memoryMap.zoom !== 'number' ||
      !project.memoryMap.offset ||
      !project.memoryMap.selectedCpu ||
      !Array.isArray(project.memoryMap.customRegions)) {
    return false;
  }

  // Check breakpoints
  if (!Array.isArray(project.breakpoints)) {
    return false;
  }

  return true;
}

/**
 * Migrate old project format to current version
 */
export function migrateProject(project: BattleMagicProject): BattleMagicProject {
  // Future: handle migration from older versions
  // For now, just ensure all required fields exist

  const migrated = { ...project };

  // Ensure version is set
  if (!migrated.metadata.version) {
    migrated.metadata.version = PROJECT_FORMAT_VERSION;
  }

  // Ensure notes structure exists
  if (!migrated.notes) {
    migrated.notes = { general: '', entries: [] };
  }

  // Ensure custom regions exist
  if (!migrated.memoryMap.customRegions) {
    migrated.memoryMap.customRegions = [];
  }

  return migrated;
}
