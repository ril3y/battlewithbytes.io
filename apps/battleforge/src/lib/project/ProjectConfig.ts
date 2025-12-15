/**
 * Project Configuration Manager
 *
 * Handles loading, saving, and managing the battleforge.json project config file.
 * This file stores project metadata, dependencies, and build settings.
 */

import type {
  BattleForgeProjectConfig,
  ProjectDependency,
  PlatformId,
} from "../library/types";

// Default config file path in VFS
const CONFIG_FILE_PATH = "/battleforge.json";

/**
 * Create a default project configuration
 */
export function createDefaultConfig(
  name: string = "my-project",
  platformId?: PlatformId,
  device?: string,
): BattleForgeProjectConfig {
  return {
    name,
    platform: platformId,
    device,
    dependencies: [],
    build: {
      defines: [],
      optimization: "-Os",
      compilerFlags: [],
    },
  };
}

/**
 * Load project configuration from VFS
 *
 * @param vfs - VFS operations object with readFile method
 * @returns The project config, or null if not found
 */
export async function loadProjectConfig(vfs: {
  readFile: (path: string) => Promise<Uint8Array | null>;
}): Promise<BattleForgeProjectConfig | null> {
  try {
    const data = await vfs.readFile(CONFIG_FILE_PATH);
    if (!data) {
      console.log("[ProjectConfig] No config file found");
      return null;
    }

    const text = new TextDecoder().decode(data);
    const config: BattleForgeProjectConfig = JSON.parse(text);

    console.log(`[ProjectConfig] Loaded config for project: ${config.name}`);
    return config;
  } catch (error) {
    console.error("[ProjectConfig] Failed to load config:", error);
    return null;
  }
}

/**
 * Save project configuration to VFS
 *
 * @param vfs - VFS operations object with writeFile method
 * @param config - The config to save
 */
export async function saveProjectConfig(
  vfs: { writeFile: (path: string, data: Uint8Array) => Promise<void> },
  config: BattleForgeProjectConfig,
): Promise<boolean> {
  try {
    const json = JSON.stringify(config, null, 2);
    const data = new TextEncoder().encode(json);
    await vfs.writeFile(CONFIG_FILE_PATH, data);

    console.log(`[ProjectConfig] Saved config for project: ${config.name}`);
    return true;
  } catch (error) {
    console.error("[ProjectConfig] Failed to save config:", error);
    return false;
  }
}

/**
 * Add a dependency to the project config
 *
 * @param config - The current project config
 * @param name - Library name/id
 * @param version - Library version
 * @returns Updated config with new dependency
 */
export function addDependency(
  config: BattleForgeProjectConfig,
  name: string,
  version: string,
): BattleForgeProjectConfig {
  // Check if dependency already exists
  const existingIndex = config.dependencies.findIndex((d) => d.name === name);

  if (existingIndex >= 0) {
    // Update version of existing dependency
    const updatedDeps = [...config.dependencies];
    updatedDeps[existingIndex] = { name, version };
    return { ...config, dependencies: updatedDeps };
  }

  // Add new dependency
  return {
    ...config,
    dependencies: [...config.dependencies, { name, version }],
  };
}

/**
 * Remove a dependency from the project config
 *
 * @param config - The current project config
 * @param name - Library name/id to remove
 * @returns Updated config without the dependency
 */
export function removeDependency(
  config: BattleForgeProjectConfig,
  name: string,
): BattleForgeProjectConfig {
  return {
    ...config,
    dependencies: config.dependencies.filter((d) => d.name !== name),
  };
}

/**
 * Check if a dependency is in the project config
 */
export function hasDependency(
  config: BattleForgeProjectConfig,
  name: string,
): boolean {
  return config.dependencies.some((d) => d.name === name);
}

/**
 * Get all dependency names from config
 */
export function getDependencyNames(config: BattleForgeProjectConfig): string[] {
  return config.dependencies.map((d) => d.name);
}

/**
 * Update build defines in config
 */
export function updateDefines(
  config: BattleForgeProjectConfig,
  defines: string[],
): BattleForgeProjectConfig {
  return {
    ...config,
    build: {
      ...config.build,
      defines,
    },
  };
}

/**
 * Update optimization level in config
 */
export function updateOptimization(
  config: BattleForgeProjectConfig,
  optimization: string,
): BattleForgeProjectConfig {
  return {
    ...config,
    build: {
      ...config.build,
      optimization,
    },
  };
}

/**
 * Update platform in config
 */
export function updatePlatform(
  config: BattleForgeProjectConfig,
  platform: PlatformId,
  device?: string,
): BattleForgeProjectConfig {
  return {
    ...config,
    platform,
    device,
  };
}

/**
 * Validate project config structure
 */
export function validateConfig(
  config: unknown,
): config is BattleForgeProjectConfig {
  if (!config || typeof config !== "object") {
    return false;
  }

  const c = config as Record<string, unknown>;

  // Required: name must be string
  if (typeof c.name !== "string") {
    return false;
  }

  // Optional: platform must be valid if present
  if (
    c.platform !== undefined &&
    !["stm32", "esp32", "nrf", "rp2040"].includes(c.platform as string)
  ) {
    return false;
  }

  // Required: dependencies must be array
  if (!Array.isArray(c.dependencies)) {
    return false;
  }

  // Validate each dependency
  for (const dep of c.dependencies) {
    if (!dep || typeof dep !== "object") {
      return false;
    }
    if (typeof (dep as ProjectDependency).name !== "string") {
      return false;
    }
    if (typeof (dep as ProjectDependency).version !== "string") {
      return false;
    }
  }

  return true;
}

/**
 * Export config path constant
 */
export const PROJECT_CONFIG_PATH = CONFIG_FILE_PATH;
