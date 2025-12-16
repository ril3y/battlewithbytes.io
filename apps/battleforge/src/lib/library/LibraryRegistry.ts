/**
 * Library Registry
 *
 * Loads and manages the BattleForge curated library registry.
 * Fetches library data from GitHub with IndexedDB caching.
 */

import type {
  LibraryRegistry,
  LibraryRegistryEntry,
  BattleForgeLibraryManifest,
  PlatformId,
  FrameworkId,
  Architecture,
} from "./types";
import { GitHubRegistryFetcher } from "../registry/GitHubRegistryFetcher";
import { RegistryCache } from "../registry/RegistryCache";

// GitHub fetcher for libraries
const fetcher = new GitHubRegistryFetcher();
const cache = new RegistryCache();

/**
 * In-memory cache for registry and manifests
 */
let registryCache: LibraryRegistry | null = null;
const manifestCache = new Map<string, BattleForgeLibraryManifest>();

/**
 * Main registry structure (from registry.json)
 */
interface MainRegistry {
  version: string;
  libraries: Array<{
    id: string;
    name: string;
    version: string;
    category: string;
    path: string;
  }>;
}

/**
 * Load the library registry index from main registry.json
 */
export async function loadRegistry(
  forceRefresh = false
): Promise<LibraryRegistry> {
  if (registryCache && !forceRefresh) {
    return registryCache;
  }

  try {
    // Fetch main registry.json which contains libraries array
    const mainRegistry = await fetcher.fetchJson<MainRegistry>("registry.json");

    // Transform to LibraryRegistry format
    const libraryEntries: LibraryRegistryEntry[] = mainRegistry.libraries.map((lib) => ({
      id: lib.id,
      name: lib.name,
      version: lib.version,
      description: `${lib.name} library`,
      category: lib.category as LibraryRegistryEntry["category"],
      platforms: ["stm32", "esp32", "nrf", "rp2040"] as PlatformId[], // All platforms for now
      tags: [lib.category],
      author: "BattleForge",
      license: "MIT",
      manifestPath: lib.path,
    }));

    registryCache = {
      version: mainRegistry.version,
      libraries: libraryEntries,
    };

    console.log(
      `[LibraryRegistry] Loaded ${registryCache.libraries.length} libraries from main registry`
    );
    return registryCache;
  } catch (error) {
    console.error("[LibraryRegistry] Failed to load registry:", error);
    // Return empty registry on error
    return { version: "0.0.0", libraries: [] };
  }
}

/**
 * Load a specific library's manifest
 */
export async function loadLibraryManifest(
  libraryId: string,
  forceRefresh = false
): Promise<BattleForgeLibraryManifest | null> {
  if (manifestCache.has(libraryId) && !forceRefresh) {
    return manifestCache.get(libraryId)!;
  }

  // Check IndexedDB cache first (reuse registry cache for library manifests)
  if (!forceRefresh) {
    const cached = await cache.getLibraryManifest(libraryId);
    if (cached) {
      // Cast since the types are compatible
      const manifest = cached as unknown as BattleForgeLibraryManifest;
      manifestCache.set(libraryId, manifest);
      console.log(`[LibraryRegistry] Using cached manifest for ${libraryId}`);
      return manifest;
    }
  }

  try {
    // Fetch from GitHub
    const manifest = await fetcher.fetchJson<BattleForgeLibraryManifest>(
      `libraries/${libraryId}/library.json`
    );
    manifestCache.set(libraryId, manifest);

    // Cache in IndexedDB
    await cache.setLibraryManifest(
      libraryId,
      manifest as unknown as Parameters<typeof cache.setLibraryManifest>[1]
    );

    console.log(
      `[LibraryRegistry] Loaded manifest for ${manifest.name} v${manifest.version}`
    );
    return manifest;
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      console.warn(`[LibraryRegistry] Library not found: ${libraryId}`);
      return null;
    }
    console.error(
      `[LibraryRegistry] Failed to load manifest for ${libraryId}:`,
      error
    );
    return null;
  }
}

/**
 * Get all libraries from the registry
 */
export async function getLibraries(): Promise<LibraryRegistryEntry[]> {
  const registry = await loadRegistry();
  return registry.libraries;
}

/**
 * Filter libraries by platform compatibility
 */
export async function getLibrariesForPlatform(
  platformId: PlatformId,
  frameworkId?: FrameworkId
): Promise<LibraryRegistryEntry[]> {
  const registry = await loadRegistry();

  return registry.libraries.filter((lib) => {
    // Check platform compatibility
    const platformMatch =
      lib.platforms.includes(platformId) ||
      lib.platforms.includes("*" as PlatformId);

    if (!platformMatch) return false;

    // Check framework compatibility if specified
    if (frameworkId) {
      // If library has no frameworks specified, assume it works with all
      if (!lib.frameworks || lib.frameworks.length === 0) return true;
      return lib.frameworks.includes(frameworkId);
    }

    return true;
  });
}

/**
 * Filter libraries by framework compatibility
 */
export async function getLibrariesForFramework(
  frameworkId: FrameworkId
): Promise<LibraryRegistryEntry[]> {
  const registry = await loadRegistry();

  return registry.libraries.filter((lib) => {
    // If library has no frameworks specified, assume it works with all
    if (!lib.frameworks || lib.frameworks.length === 0) return true;
    return lib.frameworks.includes(frameworkId);
  });
}

/**
 * Filter libraries by platform and architecture
 */
export async function getCompatibleLibraries(
  platformId: PlatformId,
  architecture: Architecture
): Promise<LibraryRegistryEntry[]> {
  const registry = await loadRegistry();

  const compatibleLibraries: LibraryRegistryEntry[] = [];

  for (const entry of registry.libraries) {
    // Check platform compatibility
    if (!entry.platforms.includes(platformId)) {
      continue;
    }

    // Load full manifest to check architecture
    const manifest = await loadLibraryManifest(entry.id);
    if (!manifest) {
      continue;
    }

    // Check architecture compatibility
    if (manifest.architectures.includes(architecture)) {
      compatibleLibraries.push(entry);
    }
  }

  return compatibleLibraries;
}

/**
 * Search libraries by name or tags
 */
export async function searchLibraries(
  query: string
): Promise<LibraryRegistryEntry[]> {
  const registry = await loadRegistry();
  const queryLower = query.toLowerCase();

  return registry.libraries.filter((lib) => {
    // Match name
    if (lib.name.toLowerCase().includes(queryLower)) {
      return true;
    }

    // Match description
    if (lib.description.toLowerCase().includes(queryLower)) {
      return true;
    }

    // Match tags
    if (lib.tags?.some((tag) => tag.toLowerCase().includes(queryLower))) {
      return true;
    }

    return false;
  });
}

/**
 * Get a library by ID
 */
export async function getLibraryById(
  libraryId: string
): Promise<LibraryRegistryEntry | null> {
  const registry = await loadRegistry();
  return registry.libraries.find((lib) => lib.id === libraryId) || null;
}

/**
 * Clear the registry cache (in-memory only)
 */
export function clearRegistryCache(): void {
  registryCache = null;
  manifestCache.clear();
  console.log("[LibraryRegistry] Memory cache cleared");
}

/**
 * Clear all caches (in-memory and IndexedDB)
 */
export async function clearAllCaches(): Promise<void> {
  registryCache = null;
  manifestCache.clear();
  await cache.clear();
  console.log("[LibraryRegistry] All caches cleared");
}

/**
 * Map architecture name to portable path segment
 * Used for architecture-specific files (e.g., FreeRTOS portable layer)
 */
export function getArchPortablePath(arch: Architecture): string {
  const archMap: Record<Architecture, string> = {
    "cortex-m0": "ARM_CM0",
    "cortex-m0+": "ARM_CM0",
    "cortex-m3": "ARM_CM3",
    "cortex-m4": "ARM_CM4F",
    "cortex-m4f": "ARM_CM4F",
    "cortex-m7": "ARM_CM7",
    "cortex-m7f": "ARM_CM7",
    "cortex-m23": "ARM_CM23",
    "cortex-m33": "ARM_CM33",
    "cortex-m55": "ARM_CM55",
    "xtensa-lx6": "XTENSA_LX6",
    "xtensa-lx7": "XTENSA_LX7",
    riscv32: "RISCV32",
    riscv32imc: "RISCV32",
    riscv32imac: "RISCV32",
  };

  return archMap[arch] || arch;
}

/**
 * Resolve include path variables
 * Replaces ${arch} with the appropriate path segment
 */
export function resolveIncludePath(path: string, arch: Architecture): string {
  return path.replace(/\$\{arch\}/g, getArchPortablePath(arch));
}
