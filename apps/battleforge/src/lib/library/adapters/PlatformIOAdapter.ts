/**
 * PlatformIO Registry Adapter
 *
 * Provides a clean interface for searching the PlatformIO library registry
 * with platform/framework ID translation between BattleForge and PlatformIO.
 */

import type {
  PlatformId,
  FrameworkId,
  LibraryRepository,
  LibraryAuthor,
} from "../types";

// PlatformIO Registry API
const PLATFORMIO_API = "https://api.registry.platformio.org/v3";

/**
 * Map BattleForge platform IDs to PlatformIO platform IDs
 */
const PLATFORM_ID_MAP: Record<PlatformId, string> = {
  stm32: "ststm32",
  esp32: "espressif32",
  nrf: "nordicnrf52",
  rp2040: "raspberrypi",
};

/**
 * Reverse map for PlatformIO platform IDs to BattleForge IDs
 */
const PLATFORM_ID_REVERSE_MAP: Record<string, PlatformId> = {
  ststm32: "stm32",
  espressif32: "esp32",
  nordicnrf52: "nrf",
  raspberrypi: "rp2040",
  // Additional mappings for edge cases
  espressif8266: "esp32", // Map ESP8266 to ESP32 category
};

/**
 * Map BattleForge framework IDs to PlatformIO framework names
 */
const FRAMEWORK_ID_MAP: Record<FrameworkId, string> = {
  arduino: "arduino",
  native: "cmsis", // Native maps closest to CMSIS
  espidf: "espidf",
  zephyr: "zephyr",
  mbed: "mbed",
};

/**
 * PlatformIO search options
 */
export interface PlatformIOSearchOptions {
  query: string;
  platformId?: PlatformId;
  frameworkId?: FrameworkId;
  limit?: number;
  sortBy?: "relevance" | "popularity" | "trending";
}

/**
 * PlatformIO library result (transformed to BattleForge format)
 */
export interface PlatformIOLibrary {
  id: number;
  name: string;
  description: string;
  author: string;
  version: string;
  license?: string;
  homepage?: string;
  repository?: LibraryRepository;
  downloads: number;
  frameworks: FrameworkId[];
  platforms: PlatformId[];
  keywords: string[];
  isPlatformIO: true; // Flag to distinguish from curated libraries
}

/**
 * Convert PlatformIO frameworks to BattleForge FrameworkIds
 */
function translateFrameworks(pioFrameworks: string[]): FrameworkId[] {
  const result: FrameworkId[] = [];
  const frameworkMap: Record<string, FrameworkId> = {
    arduino: "arduino",
    espidf: "espidf",
    zephyr: "zephyr",
    mbed: "mbed",
    cmsis: "native",
    stm32cube: "native",
    libopencm3: "native",
    spl: "native",
  };

  for (const fw of pioFrameworks) {
    const mapped = frameworkMap[fw.toLowerCase()];
    if (mapped && !result.includes(mapped)) {
      result.push(mapped);
    }
  }

  // Default to arduino if no framework specified
  if (result.length === 0) {
    result.push("arduino");
  }

  return result;
}

/**
 * Convert PlatformIO platforms to BattleForge PlatformIds
 */
function translatePlatforms(pioPlatforms: string[]): PlatformId[] {
  const result: PlatformId[] = [];

  for (const platform of pioPlatforms) {
    // Handle wildcard - library works on all platforms
    if (platform === "*") {
      return ["stm32", "esp32", "nrf", "rp2040"];
    }

    const mapped = PLATFORM_ID_REVERSE_MAP[platform.toLowerCase()];
    if (mapped && !result.includes(mapped)) {
      result.push(mapped);
    }
  }

  return result;
}

/**
 * Search PlatformIO registry for libraries
 */
export async function searchPlatformIO(
  options: PlatformIOSearchOptions
): Promise<PlatformIOLibrary[]> {
  try {
    // Build search query parts
    const queryParts: string[] = [`type:"library"`, options.query];

    // Add platform filter if specified
    if (options.platformId) {
      const pioPlatform = PLATFORM_ID_MAP[options.platformId];
      if (pioPlatform) {
        queryParts.push(`platforms:${pioPlatform}`);
      }
    }

    // Add framework filter if specified
    if (options.frameworkId) {
      const pioFramework = FRAMEWORK_ID_MAP[options.frameworkId];
      if (pioFramework) {
        queryParts.push(`frameworks:${pioFramework}`);
      }
    }

    const searchQuery = queryParts.join(" ");
    const limit = options.limit || 20;

    // Build URL with sorting
    let url = `${PLATFORMIO_API}/search?query=${encodeURIComponent(searchQuery)}&limit=${limit}`;

    // Add sorting parameter
    if (options.sortBy === "popularity") {
      url += "&sort=dlmonth:desc";
    } else if (options.sortBy === "trending") {
      url += "&sort=dlweek:desc";
    }
    // Default is relevance (no sort param needed)

    console.log(`[PlatformIOAdapter] Searching: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `[PlatformIOAdapter] Search failed: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const data = await response.json();
    const items = data.items || [];

    // Transform to BattleForge format
    return items.map(
      (item: {
        id: number;
        name: string;
        description?: string;
        keywords?: string[];
        homepage?: string;
        repository?: LibraryRepository;
        authors?: LibraryAuthor[];
        version?: { name: string };
        frameworks?: string[];
        platforms?: string[];
        dlstats?: { month?: number };
        license?: string;
      }) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        author: item.authors?.[0]?.name || "Unknown",
        version: item.version?.name || "0.0.0",
        license: item.license,
        homepage: item.homepage,
        repository: item.repository,
        downloads: item.dlstats?.month || 0,
        frameworks: translateFrameworks(item.frameworks || []),
        platforms: translatePlatforms(item.platforms || []),
        keywords: item.keywords || [],
        isPlatformIO: true as const,
      })
    );
  } catch (error) {
    console.error("[PlatformIOAdapter] Search error:", error);
    return [];
  }
}

/**
 * Get detailed library info from PlatformIO
 */
export async function getPlatformIOLibrary(
  name: string,
  version?: string
): Promise<PlatformIOLibrary | null> {
  try {
    const versionPath = version ? `/${version}` : "";
    const url = `${PLATFORMIO_API}/libraries/${encodeURIComponent(name)}${versionPath}`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to get library info: ${response.status}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      description: data.description || "",
      author: data.authors?.[0]?.name || "Unknown",
      version: data.version?.name || version || "0.0.0",
      license: data.license,
      homepage: data.homepage,
      repository: data.repository,
      downloads: data.dlstats?.month || 0,
      frameworks: translateFrameworks(data.frameworks || []),
      platforms: translatePlatforms(data.platforms || []),
      keywords: data.keywords || [],
      isPlatformIO: true,
    };
  } catch (error) {
    console.error("[PlatformIOAdapter] Get library error:", error);
    return null;
  }
}

/**
 * Check if a library is compatible with BattleForge's current platform/framework
 */
export function isLibraryCompatible(
  library: PlatformIOLibrary,
  platformId?: PlatformId,
  frameworkId?: FrameworkId
): boolean {
  // Check platform compatibility
  if (platformId && library.platforms.length > 0) {
    if (!library.platforms.includes(platformId)) {
      return false;
    }
  }

  // Check framework compatibility
  if (frameworkId && library.frameworks.length > 0) {
    if (!library.frameworks.includes(frameworkId)) {
      return false;
    }
  }

  return true;
}

/**
 * Get the PlatformIO platform ID for a BattleForge platform
 */
export function toPlatformIOPlatform(platformId: PlatformId): string {
  return PLATFORM_ID_MAP[platformId] || platformId;
}

/**
 * Get the BattleForge platform ID from a PlatformIO platform
 */
export function fromPlatformIOPlatform(pioPlatform: string): PlatformId | null {
  return PLATFORM_ID_REVERSE_MAP[pioPlatform.toLowerCase()] || null;
}
