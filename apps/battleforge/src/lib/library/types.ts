/**
 * Library Management Types
 *
 * Types for managing third-party libraries.
 * Supports both PlatformIO format and BattleForge's curated registry.
 */

// =============================================================================
// BattleForge Curated Library System Types
// =============================================================================

/**
 * Architecture identifiers used in BattleForge
 */
export type Architecture =
  | "cortex-m0"
  | "cortex-m0+"
  | "cortex-m3"
  | "cortex-m4"
  | "cortex-m4f"
  | "cortex-m7"
  | "cortex-m7f"
  | "cortex-m23"
  | "cortex-m33"
  | "cortex-m55"
  | "xtensa-lx6"
  | "xtensa-lx7"
  | "riscv32"
  | "riscv32imc"
  | "riscv32imac";

/**
 * Platform identifiers used in BattleForge
 */
export type PlatformId = "stm32" | "esp32" | "nrf" | "rp2040" | "samd" | "avr" | "ch32" | "gd32";

/**
 * Framework identifiers used in BattleForge
 */
export type FrameworkId = "arduino" | "native" | "espidf" | "zephyr" | "mbed";

/**
 * A file mapping in a library source definition
 */
export interface LibrarySourceFile {
  /** Source path in the repository (supports wildcards: *.c, **\/*.h) */
  path: string;
  /** Destination directory in the library (e.g., "src/", "include/") */
  dest: string;
  /** Only include this file for specific architecture */
  arch?: Architecture;
  /** Only include this file for specific platform */
  platform?: PlatformId;
}

/**
 * Library source configuration - how to fetch files
 */
export interface LibrarySource {
  /** Source type (currently only github supported) */
  type: "github";
  /** GitHub repository owner */
  owner: string;
  /** GitHub repository name */
  repo: string;
  /** Git ref (tag, branch, or commit) */
  ref: string;
  /** Files to download */
  files: LibrarySourceFile[];
}

/**
 * Library build configuration
 */
export interface LibraryBuild {
  /** Include paths relative to library root (supports ${arch} variable) */
  includePaths: string[];
  /** Preprocessor defines */
  defines?: string[];
  /** Additional compiler flags */
  compilerFlags?: string[];
  /** Source files to compile (if not specified, all .c files are compiled) */
  sources?: string[];
}

/**
 * BattleForge library manifest format
 * Stored in src/app/data/libraries/{id}/library.json
 */
export interface BattleForgeLibraryManifest {
  /** Library name */
  name: string;
  /** Semantic version */
  version: string;
  /** Short description */
  description: string;
  /** Homepage URL */
  homepage?: string;
  /** License identifier (SPDX) */
  license?: string;
  /** Compatible platform IDs */
  platforms: PlatformId[];
  /** Compatible architectures */
  architectures: Architecture[];
  /** Source file configuration */
  source: LibrarySource;
  /** Build configuration */
  build: LibraryBuild;
  /** Library dependencies (name -> version) */
  dependencies?: Record<string, string>;
  /** Template file that user should customize (e.g., "FreeRTOSConfig.h") */
  configTemplate?: string;
  /** Tags for categorization */
  tags?: string[];
}

/**
 * Library entry in the registry index
 */
export interface LibraryRegistryEntry {
  /** Unique library ID (folder name) */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Current version */
  version: string;
  /** Compatible platforms */
  platforms: PlatformId[];
  /** Compatible frameworks (arduino, native, espidf, etc.) */
  frameworks?: FrameworkId[];
  /** Tags for filtering */
  tags?: string[];
  /** Library category */
  category?: "rtos" | "communication" | "display" | "sensor" | "storage" | "network" | "core" | "other";
  /** Library author */
  author?: string;
  /** License identifier */
  license?: string;
  /** Path to manifest file (for internal use) */
  manifestPath?: string;
}

/**
 * Library registry index format
 * Stored in src/app/data/libraries/registry.json
 */
export interface LibraryRegistry {
  /** Registry format version */
  version: string;
  /** Available libraries */
  libraries: LibraryRegistryEntry[];
}

/**
 * Project dependency entry
 */
export interface ProjectDependency {
  /** Library name/id */
  name: string;
  /** Version constraint */
  version: string;
}

/**
 * BattleForge project configuration
 * Stored in VFS as /battleforge.json
 */
export interface BattleForgeProjectConfig {
  /** Project name */
  name: string;
  /** Selected platform ID */
  platform?: PlatformId;
  /** Selected device ID */
  device?: string;
  /** Library dependencies */
  dependencies: ProjectDependency[];
  /** Build configuration overrides */
  build?: {
    defines?: string[];
    optimization?: string;
    compilerFlags?: string[];
  };
}

// =============================================================================
// PlatformIO Compatibility Types (kept for reference/future use)
// =============================================================================

/**
 * Library author information
 */
export interface LibraryAuthor {
  name: string;
  email?: string;
  url?: string;
  maintainer?: boolean;
}

/**
 * Library repository information
 */
export interface LibraryRepository {
  type: "git" | "hg" | "svn";
  url: string;
  branch?: string;
}

/**
 * Library export configuration
 */
export interface LibraryExport {
  include?: string[];
  exclude?: string[];
}

/**
 * Library manifest (library.json format)
 * Based on PlatformIO's specification
 */
export interface LibraryManifest {
  name: string;
  version: string;
  description?: string;
  keywords?: string | string[];
  authors?: LibraryAuthor[];
  repository?: LibraryRepository;
  homepage?: string;
  license?: string;
  frameworks?: string[]; // e.g., ['arduino', 'espidf', 'mbed']
  platforms?: string[]; // e.g., ['*', 'ststm32', 'espressif32']
  dependencies?: Record<string, string>; // name -> version constraint
  export?: LibraryExport;
}

/**
 * Cached library data
 */
export interface CachedLibrary {
  id: string; // "name@version"
  name: string;
  version: string;
  manifest: LibraryManifest;
  files: Map<string, Uint8Array>; // path -> content
  checksum: string;
  downloadedAt: number;
  size: number;
}

/**
 * Library search result from PlatformIO registry
 */
export interface LibrarySearchResult {
  id: number;
  name: string;
  description: string;
  keywords: string[];
  homepage?: string;
  repository?: LibraryRepository;
  authors: LibraryAuthor[];
  version: {
    name: string;
    released: string;
  };
  frameworks: string[];
  platforms: string[];
  downloads: number;
  examples?: number;
}

/**
 * Library cache metadata
 */
export interface LibraryCacheMetadata {
  id: string;
  name: string;
  version: string;
  checksum: string;
  timestamp: number;
  fileCount: number;
  totalSize: number;
  frameworks: string[];
  platforms: string[];
}

/**
 * Library dependency resolution result
 */
export interface ResolvedDependency {
  name: string;
  version: string;
  source: "cache" | "remote";
  dependencies: ResolvedDependency[];
}

/**
 * Library installation status
 */
export type LibraryStatus =
  | "not_installed"
  | "installing"
  | "installed"
  | "update_available"
  | "error";

/**
 * Installed library info for UI
 */
export interface InstalledLibrary {
  name: string;
  version: string;
  status: LibraryStatus;
  manifest: LibraryManifest;
  size: number;
  installedAt: number;
}
