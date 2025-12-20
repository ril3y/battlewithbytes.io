/**
 * Architecture Loader
 *
 * Loads architecture configurations from data/boards/architectures.json.
 * Provides backwards-compatible access to ARCHITECTURE_CONFIGS.
 */

import { withBasePath } from "../utils/basePath";
import type { Architecture, ArchitectureConfig } from "./types";

/**
 * Cached architecture configurations
 */
let architectureCache: Record<string, ArchitectureConfig> | null = null;
let loadingPromise: Promise<Record<string, ArchitectureConfig>> | null = null;

/**
 * Load architecture configurations from data/boards/architectures.json
 */
async function loadArchitectures(): Promise<
  Record<string, ArchitectureConfig>
> {
  if (architectureCache) {
    return architectureCache;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async (): Promise<Record<string, ArchitectureConfig>> => {
    try {
      const response = await fetch(
        withBasePath("/data/boards/architectures.json")
      );
      if (!response.ok) {
        throw new Error(
          `Failed to load architectures: ${response.statusText}`
        );
      }

      const data = await response.json();
      const configs: Record<string, ArchitectureConfig> = data.architectures || {};
      architectureCache = configs;
      return configs;
    } catch (error) {
      console.error("Error loading architecture configurations:", error);
      // Fall back to empty object - will cause errors if configs are needed
      const fallback: Record<string, ArchitectureConfig> = {};
      architectureCache = fallback;
      return fallback;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise as Promise<Record<string, ArchitectureConfig>>;
}

/**
 * Get configuration for a specific architecture
 */
export async function getArchitectureConfig(
  arch: Architecture
): Promise<ArchitectureConfig | null> {
  const configs = await loadArchitectures();
  return configs[arch] || null;
}

/**
 * Get all architecture configurations
 */
export async function getAllArchitectureConfigs(): Promise<
  Record<string, ArchitectureConfig>
> {
  return loadArchitectures();
}

/**
 * Check if an architecture is supported
 */
export async function isArchitectureSupported(
  arch: string
): Promise<boolean> {
  const configs = await loadArchitectures();
  return arch in configs;
}

/**
 * Get list of all supported architecture IDs
 */
export async function getSupportedArchitectures(): Promise<Architecture[]> {
  const configs = await loadArchitectures();
  return Object.keys(configs) as Architecture[];
}

/**
 * Preload architecture configurations (call early to avoid latency)
 */
export async function preloadArchitectures(): Promise<void> {
  await loadArchitectures();
}

/**
 * Clear the architecture cache (useful for testing)
 */
export function clearArchitectureCache(): void {
  architectureCache = null;
  loadingPromise = null;
}

/**
 * Synchronous access to ARCHITECTURE_CONFIGS for backwards compatibility.
 * IMPORTANT: This only works after preloadArchitectures() has been called!
 * Returns empty object if not yet loaded.
 *
 * @deprecated Use getArchitectureConfig() or getAllArchitectureConfigs() instead
 */
export function getArchitectureConfigsSync(): Record<
  string,
  ArchitectureConfig
> {
  if (!architectureCache) {
    console.warn(
      "ARCHITECTURE_CONFIGS accessed before preloadArchitectures() was called. " +
        "This may cause issues. Call preloadArchitectures() early in app initialization."
    );
    return {};
  }
  return architectureCache;
}
