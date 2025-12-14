/**
 * React hook for WasmManager
 *
 * Provides reactive state for WASM compiler management.
 */

import { useState, useEffect, useCallback } from "react";
import {
  WasmManager,
  type CompilerInfo,
  type CompilerId,
  type StorageStats,
  type DownloadProgress,
  type UpdateNotification,
} from "../wasm";
import type { Architecture } from "../platform/types";

interface UseWasmManagerReturn {
  // State
  compilers: CompilerInfo[];
  storageStats: StorageStats | null;
  isLoading: boolean;
  error: string | null;
  updates: UpdateNotification[];

  // Actions
  downloadCompiler: (
    compilerId: CompilerId,
    onProgress?: (progress: DownloadProgress) => void,
  ) => Promise<void>;
  removeCompiler: (compilerId: CompilerId) => Promise<void>;
  ensureCompilerForArchitecture: (
    architecture: Architecture,
    onProgress?: (progress: DownloadProgress) => void,
  ) => Promise<Uint8Array>;
  checkForUpdates: () => Promise<UpdateNotification[]>;
  refresh: () => Promise<void>;

  // Queries
  isCompilerReady: (compilerId: CompilerId) => Promise<boolean>;
  hasCompilerForArchitecture: (architecture: Architecture) => Promise<boolean>;
  getCompilerForArchitecture: (architecture: Architecture) => CompilerId;
  getDownloadProgress: (compilerId: CompilerId) => DownloadProgress | undefined;
  isDownloading: (compilerId: CompilerId) => boolean;
}

export function useWasmManager(): UseWasmManagerReturn {
  const [compilers, setCompilers] = useState<CompilerInfo[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updates, setUpdates] = useState<UpdateNotification[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<
    Map<CompilerId, DownloadProgress>
  >(new Map());
  const [activeDownloads, setActiveDownloads] = useState<Set<CompilerId>>(
    new Set(),
  );

  // Load initial data
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [compilerInfos, stats] = await Promise.all([
        WasmManager.getAllCompilerInfos(),
        WasmManager.getStorageStats(),
      ]);

      setCompilers(compilerInfos);
      setStorageStats(stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load compiler info");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to manager events
  useEffect(() => {
    const unsubscribe = WasmManager.subscribe((event) => {
      switch (event.type) {
        case "manifest_loaded":
          refresh();
          break;

        case "download_started":
          setActiveDownloads((prev) => new Set([...prev, event.compilerId]));
          break;

        case "download_progress":
          setDownloadProgress((prev) => {
            const next = new Map(prev);
            next.set(event.compilerId, event.progress);
            return next;
          });
          break;

        case "download_complete":
          setActiveDownloads((prev) => {
            const next = new Set(prev);
            next.delete(event.compilerId);
            return next;
          });
          setDownloadProgress((prev) => {
            const next = new Map(prev);
            next.delete(event.compilerId);
            return next;
          });
          refresh();
          break;

        case "download_error":
          setActiveDownloads((prev) => {
            const next = new Set(prev);
            next.delete(event.compilerId);
            return next;
          });
          setDownloadProgress((prev) => {
            const next = new Map(prev);
            next.delete(event.compilerId);
            return next;
          });
          setError(`Download failed for ${event.compilerId}: ${event.error}`);
          break;

        case "compiler_removed":
          refresh();
          break;

        case "storage_changed":
          setStorageStats(event.stats);
          break;

        case "update_available":
          setUpdates(event.notifications);
          break;
      }
    });

    // Initial load
    refresh();

    return () => unsubscribe();
  }, [refresh]);

  // Download a compiler
  const downloadCompiler = useCallback(
    async (
      compilerId: CompilerId,
      onProgress?: (progress: DownloadProgress) => void,
    ) => {
      try {
        await WasmManager.downloadCompiler(compilerId, onProgress);
      } catch (e) {
        throw e;
      }
    },
    [],
  );

  // Remove a compiler
  const removeCompiler = useCallback(async (compilerId: CompilerId) => {
    await WasmManager.removeCompiler(compilerId);
  }, []);

  // Ensure compiler for architecture
  const ensureCompilerForArchitecture = useCallback(
    async (
      architecture: Architecture,
      onProgress?: (progress: DownloadProgress) => void,
    ) => {
      return WasmManager.ensureCompilerForArchitecture(architecture, onProgress);
    },
    [],
  );

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    WasmManager.clearManifestCache();
    const notifications = await WasmManager.checkForUpdates();
    setUpdates(notifications);
    await refresh();
    return notifications;
  }, [refresh]);

  // Check if compiler is ready
  const isCompilerReady = useCallback(async (compilerId: CompilerId) => {
    return WasmManager.isCompilerReady(compilerId);
  }, []);

  // Check if architecture has compiler
  const hasCompilerForArchitecture = useCallback(
    async (architecture: Architecture) => {
      return WasmManager.hasCompilerForArchitecture(architecture);
    },
    [],
  );

  // Get compiler for architecture
  const getCompilerForArchitecture = useCallback(
    (architecture: Architecture) => {
      return WasmManager.getCompilerIdForArchitecture(architecture);
    },
    [],
  );

  // Get download progress
  const getDownloadProgress = useCallback(
    (compilerId: CompilerId) => {
      return downloadProgress.get(compilerId);
    },
    [downloadProgress],
  );

  // Check if downloading
  const isDownloading = useCallback(
    (compilerId: CompilerId) => {
      return activeDownloads.has(compilerId);
    },
    [activeDownloads],
  );

  return {
    // State
    compilers,
    storageStats,
    isLoading,
    error,
    updates,

    // Actions
    downloadCompiler,
    removeCompiler,
    ensureCompilerForArchitecture,
    checkForUpdates,
    refresh,

    // Queries
    isCompilerReady,
    hasCompilerForArchitecture,
    getCompilerForArchitecture,
    getDownloadProgress,
    isDownloading,
  };
}
