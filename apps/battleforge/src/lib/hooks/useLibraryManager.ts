/**
 * useLibraryManager Hook
 *
 * React hook for managing third-party libraries in BattleForge.
 * Provides search, install, and uninstall functionality.
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  getLibraryManager,
  type LibrarySearchResult,
  type InstalledLibrary,
  type CachedLibrary,
  type LibraryRegistryEntry,
  type PlatformId,
  type Architecture,
  loadRegistry,
  loadLibraryManifest,
  getLibrariesForPlatform,
  searchLibraries as searchRegistryLibraries,
} from "../library";

interface UseLibraryManagerReturn {
  // State
  searchResults: LibrarySearchResult[];
  installedLibraries: InstalledLibrary[];
  registryLibraries: LibraryRegistryEntry[];
  isSearching: boolean;
  isInstalling: boolean;
  isLoadingRegistry: boolean;
  error: string | null;
  progress: string | null;

  // PlatformIO Actions (legacy)
  searchLibraries: (query: string, options?: SearchOptions) => Promise<void>;
  installLibrary: (
    name: string,
    version?: string,
  ) => Promise<CachedLibrary | null>;

  // Registry Actions
  loadRegistryLibraries: (platformId?: PlatformId) => Promise<void>;
  searchRegistryLibraries: (query: string) => Promise<void>;
  installFromRegistry: (
    libraryId: string,
    architecture: Architecture,
  ) => Promise<CachedLibrary | null>;

  // Common Actions
  uninstallLibrary: (name: string) => Promise<void>;
  refreshInstalled: () => Promise<void>;
  clearCache: () => Promise<void>;

  // Helpers
  getIncludePaths: () => Promise<string[]>;
  getLibraryHeaders: () => Promise<Map<string, Uint8Array>>;
  getLibrarySources: () => Promise<Map<string, Uint8Array>>;
  getAllLibraryFiles: () => Promise<Map<string, Uint8Array>>;
}

interface SearchOptions {
  frameworks?: string[];
  platforms?: string[];
  limit?: number;
}

export function useLibraryManager(): UseLibraryManagerReturn {
  const managerRef = useRef(getLibraryManager());

  const [searchResults, setSearchResults] = useState<LibrarySearchResult[]>([]);
  const [installedLibraries, setInstalledLibraries] = useState<
    InstalledLibrary[]
  >([]);
  const [registryLibraries, setRegistryLibraries] = useState<
    LibraryRegistryEntry[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isLoadingRegistry, setIsLoadingRegistry] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  // Load installed libraries on mount
  useEffect(() => {
    refreshInstalled();
  }, []);

  const searchLibraries = useCallback(
    async (query: string, options?: SearchOptions) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const results = await managerRef.current.searchLibraries(
          query,
          options,
        );
        setSearchResults(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [],
  );

  const installLibrary = useCallback(
    async (name: string, version?: string): Promise<CachedLibrary | null> => {
      setIsInstalling(true);
      setError(null);
      setProgress(null);

      try {
        const result = await managerRef.current.installLibrary(
          name,
          version,
          (msg) => {
            setProgress(msg);
          },
        );

        if (result) {
          await refreshInstalled();
        }

        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Install failed");
        return null;
      } finally {
        setIsInstalling(false);
        setProgress(null);
      }
    },
    [],
  );

  // Load curated libraries from our registry
  const loadRegistryLibrariesFn = useCallback(
    async (platformId?: PlatformId) => {
      setIsLoadingRegistry(true);
      setError(null);

      try {
        let libraries: LibraryRegistryEntry[];
        if (platformId) {
          libraries = await getLibrariesForPlatform(platformId);
        } else {
          const registry = await loadRegistry();
          libraries = registry.libraries;
        }
        setRegistryLibraries(libraries);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load registry",
        );
        setRegistryLibraries([]);
      } finally {
        setIsLoadingRegistry(false);
      }
    },
    [],
  );

  // Search within our registry
  const searchRegistryLibrariesFn = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        // If empty query, reload all registry libraries
        await loadRegistryLibrariesFn();
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const results = await searchRegistryLibraries(query);
        setRegistryLibraries(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setIsSearching(false);
      }
    },
    [loadRegistryLibrariesFn],
  );

  // Install from our curated registry
  const installFromRegistry = useCallback(
    async (
      libraryId: string,
      architecture: Architecture,
    ): Promise<CachedLibrary | null> => {
      setIsInstalling(true);
      setError(null);
      setProgress(null);

      try {
        const result = await managerRef.current.installFromRegistry(
          libraryId,
          architecture,
          (msg) => {
            setProgress(msg);
          },
        );

        if (result) {
          await refreshInstalled();
        }

        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Install failed");
        return null;
      } finally {
        setIsInstalling(false);
        setProgress(null);
      }
    },
    [],
  );

  const uninstallLibrary = useCallback(async (name: string) => {
    setError(null);

    try {
      await managerRef.current.uninstallLibrary(name);
      await refreshInstalled();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uninstall failed");
    }
  }, []);

  const refreshInstalled = useCallback(async () => {
    try {
      const installed = await managerRef.current.getInstalledLibraries();
      setInstalledLibraries(installed);
    } catch (err) {
      console.error("[useLibraryManager] Failed to refresh installed:", err);
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await managerRef.current.clearCache();
      setInstalledLibraries([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clear cache failed");
    }
  }, []);

  const getIncludePaths = useCallback(async () => {
    return managerRef.current.getIncludePaths();
  }, []);

  const getLibraryHeaders = useCallback(async () => {
    return managerRef.current.getLibraryHeaders();
  }, []);

  const getLibrarySources = useCallback(async () => {
    return managerRef.current.getLibrarySources();
  }, []);

  const getAllLibraryFiles = useCallback(async () => {
    return managerRef.current.getAllLibraryFiles();
  }, []);

  return {
    searchResults,
    installedLibraries,
    registryLibraries,
    isSearching,
    isInstalling,
    isLoadingRegistry,
    error,
    progress,
    searchLibraries,
    installLibrary,
    loadRegistryLibraries: loadRegistryLibrariesFn,
    searchRegistryLibraries: searchRegistryLibrariesFn,
    installFromRegistry,
    uninstallLibrary,
    refreshInstalled,
    clearCache,
    getIncludePaths,
    getLibraryHeaders,
    getLibrarySources,
    getAllLibraryFiles,
  };
}
