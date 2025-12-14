/**
 * Configuration Manager
 * Handles saving and loading of terminal configurations to/from localStorage
 */

import type {
  ConfigProfile,
  SerialConfig,
  TerminalOptions,
  SendOptions,
  QuickMacro,
} from "./serialTerminal.types";
import {
  DEFAULT_SERIAL_CONFIG,
  DEFAULT_TERMINAL_OPTIONS,
  DEFAULT_SEND_OPTIONS,
} from "./serialTerminal.types";

const STORAGE_KEY_PREFIX = "serial-terminal";
const PROFILES_KEY = `${STORAGE_KEY_PREFIX}-profiles`;
const CURRENT_PROFILE_KEY = `${STORAGE_KEY_PREFIX}-current-profile`;
const LAST_CONFIG_KEY = `${STORAGE_KEY_PREFIX}-last-config`;

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save a configuration profile
 */
export function saveProfile(
  name: string,
  serialConfig: SerialConfig,
  terminalOptions: TerminalOptions,
  sendOptions: SendOptions,
  macros: QuickMacro[],
): ConfigProfile {
  try {
    const profiles = getAllProfiles();

    const profile: ConfigProfile = {
      id: generateId(),
      name,
      serialConfig,
      terminalOptions,
      sendOptions,
      macros,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    profiles.push(profile);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

    return profile;
  } catch (error) {
    console.error("Failed to save profile:", error);
    throw new Error("Failed to save configuration profile");
  }
}

/**
 * Update an existing profile
 */
export function updateProfile(
  id: string,
  updates: Partial<Omit<ConfigProfile, "id" | "createdAt" | "updatedAt">>,
): ConfigProfile | null {
  try {
    const profiles = getAllProfiles();
    const index = profiles.findIndex((p) => p.id === id);

    if (index === -1) {
      return null;
    }

    const updatedProfile: ConfigProfile = {
      ...profiles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    profiles[index] = updatedProfile;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

    return updatedProfile;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw new Error("Failed to update configuration profile");
  }
}

/**
 * Delete a profile
 */
export function deleteProfile(id: string): boolean {
  try {
    const profiles = getAllProfiles();
    const filtered = profiles.filter((p) => p.id !== id);

    if (filtered.length === profiles.length) {
      return false; // Profile not found
    }

    localStorage.setItem(PROFILES_KEY, JSON.stringify(filtered));

    // If this was the current profile, clear the current profile
    const currentProfileId = getCurrentProfileId();
    if (currentProfileId === id) {
      localStorage.removeItem(CURRENT_PROFILE_KEY);
    }

    return true;
  } catch (error) {
    console.error("Failed to delete profile:", error);
    throw new Error("Failed to delete configuration profile");
  }
}

/**
 * Get all saved profiles
 */
export function getAllProfiles(): ConfigProfile[] {
  try {
    const data = localStorage.getItem(PROFILES_KEY);
    if (!data) return [];

    const profiles = JSON.parse(data);
    return Array.isArray(profiles) ? profiles : [];
  } catch (error) {
    console.error("Failed to load profiles:", error);
    return [];
  }
}

/**
 * Get a profile by ID
 */
export function getProfile(id: string): ConfigProfile | null {
  const profiles = getAllProfiles();
  return profiles.find((p) => p.id === id) || null;
}

/**
 * Set the current active profile
 */
export function setCurrentProfile(id: string): void {
  try {
    localStorage.setItem(CURRENT_PROFILE_KEY, id);
  } catch (error) {
    console.error("Failed to set current profile:", error);
  }
}

/**
 * Get the current active profile ID
 */
export function getCurrentProfileId(): string | null {
  try {
    return localStorage.getItem(CURRENT_PROFILE_KEY);
  } catch (error) {
    console.error("Failed to get current profile:", error);
    return null;
  }
}

/**
 * Get the current active profile
 */
export function getCurrentProfile(): ConfigProfile | null {
  const id = getCurrentProfileId();
  return id ? getProfile(id) : null;
}

/**
 * Save the last used configuration (not a named profile)
 */
export function saveLastConfig(
  serialConfig: SerialConfig,
  terminalOptions: TerminalOptions,
  sendOptions: SendOptions,
): void {
  try {
    const config = {
      serialConfig,
      terminalOptions,
      sendOptions,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(LAST_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save last config:", error);
  }
}

/**
 * Load the last used configuration
 */
export function loadLastConfig(): {
  serialConfig: SerialConfig;
  terminalOptions: TerminalOptions;
  sendOptions: SendOptions;
} | null {
  try {
    const data = localStorage.getItem(LAST_CONFIG_KEY);
    if (!data) return null;

    const config = JSON.parse(data);

    // Validate that the config has the required properties
    if (config.serialConfig && config.terminalOptions && config.sendOptions) {
      return {
        serialConfig: { ...DEFAULT_SERIAL_CONFIG, ...config.serialConfig },
        terminalOptions: {
          ...DEFAULT_TERMINAL_OPTIONS,
          ...config.terminalOptions,
        },
        sendOptions: { ...DEFAULT_SEND_OPTIONS, ...config.sendOptions },
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to load last config:", error);
    return null;
  }
}

/**
 * Export all profiles as JSON
 */
export function exportProfiles(): string {
  const profiles = getAllProfiles();
  return JSON.stringify(profiles, null, 2);
}

/**
 * Import profiles from JSON
 */
export function importProfiles(jsonString: string): number {
  try {
    const imported = JSON.parse(jsonString);

    if (!Array.isArray(imported)) {
      throw new Error("Invalid format: expected an array of profiles");
    }

    const existingProfiles = getAllProfiles();

    // Merge imported profiles with existing ones
    // Generate new IDs for imported profiles to avoid conflicts
    const newProfiles = imported.map((profile) => ({
      ...profile,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const allProfiles = [...existingProfiles, ...newProfiles];
    localStorage.setItem(PROFILES_KEY, JSON.stringify(allProfiles));

    return newProfiles.length;
  } catch (error) {
    console.error("Failed to import profiles:", error);
    throw new Error(
      "Failed to import profiles: " +
        (error instanceof Error ? error.message : "Unknown error"),
    );
  }
}

/**
 * Clear all saved data
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(PROFILES_KEY);
    localStorage.removeItem(CURRENT_PROFILE_KEY);
    localStorage.removeItem(LAST_CONFIG_KEY);
  } catch (error) {
    console.error("Failed to clear data:", error);
  }
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): {
  profileCount: number;
  hasLastConfig: boolean;
  currentProfileName: string | null;
} {
  const profiles = getAllProfiles();
  const lastConfig = loadLastConfig();
  const currentProfile = getCurrentProfile();

  return {
    profileCount: profiles.length,
    hasLastConfig: lastConfig !== null,
    currentProfileName: currentProfile?.name || null,
  };
}
