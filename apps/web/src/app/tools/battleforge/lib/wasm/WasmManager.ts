/**
 * WASM Manager
 *
 * Singleton service for managing WASM compiler binaries.
 * Handles downloading, caching, version checking, and update notifications.
 */

import type { Architecture } from "../platform/types";
import type {
  CompilerId,
  CompilerInfo,
  CompilerState,
  DownloadProgress,
  WasmManifest,
  AvailableCompiler,
  InstalledCompiler,
  UpdateNotification,
  StorageStats,
  WasmManagerEvent,
  WasmManagerEventListener,
} from "./types";
import { ARCHITECTURE_COMPILER_MAP, getCompilerForArchitecture } from "./types";
import {
  loadManifest,
  downloadCompiler,
  getCachedCompiler,
  isCompilerCached,
  removeCompiler as removeCachedCompiler,
  getStorageStats as getCacheStorageStats,
  listInstalled,
  getCompilerDisplayInfo,
} from "./WasmLoader";

const MANIFEST_URL = "/tools/battleforge/wasm/manifest.json";
const MANIFEST_CACHE_TTL = 1000 * 60 * 30; // 30 minutes

class WasmManagerService {
  private manifest: WasmManifest | null = null;
  private manifestLoadedAt: number = 0;
  private manifestPromise: Promise<WasmManifest> | null = null;
  private downloadPromises: Map<CompilerId, Promise<Uint8Array>> = new Map();
  private downloadProgress: Map<CompilerId, DownloadProgress> = new Map();
  private listeners: Set<WasmManagerEventListener> = new Set();

  /**
   * Get the singleton instance
   */
  private static instance: WasmManagerService | null = null;

  static getInstance(): WasmManagerService {
    if (!WasmManagerService.instance) {
      WasmManagerService.instance = new WasmManagerService();
    }
    return WasmManagerService.instance;
  }

  /**
   * Subscribe to manager events
   */
  subscribe(listener: WasmManagerEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: WasmManagerEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (e) {
        console.error("[WasmManager] Event listener error:", e);
      }
    }
  }

  /**
   * Load the WASM manifest
   */
  async loadManifest(forceRefresh = false): Promise<WasmManifest> {
    // Return cached manifest if still valid
    if (
      this.manifest &&
      !forceRefresh &&
      Date.now() - this.manifestLoadedAt < MANIFEST_CACHE_TTL
    ) {
      return this.manifest;
    }

    // Deduplicate concurrent requests
    if (this.manifestPromise && !forceRefresh) {
      return this.manifestPromise;
    }

    this.manifestPromise = (async () => {
      try {
        this.manifest = await loadManifest(MANIFEST_URL);
        this.manifestLoadedAt = Date.now();
        this.emit({ type: "manifest_loaded", manifest: this.manifest });

        // Check for updates after loading manifest
        await this.checkForUpdates();

        return this.manifest;
      } catch (error) {
        console.error("[WasmManager] Failed to load manifest:", error);
        throw error;
      } finally {
        this.manifestPromise = null;
      }
    })();

    return this.manifestPromise;
  }

  /**
   * Get the manifest (load if needed)
   */
  async getManifest(): Promise<WasmManifest> {
    return this.loadManifest();
  }

  /**
   * Get all available compilers
   */
  async getAvailableCompilers(): Promise<AvailableCompiler[]> {
    const manifest = await this.getManifest();
    return manifest.compilers;
  }

  /**
   * Get compiler for a specific architecture
   */
  getCompilerIdForArchitecture(architecture: Architecture): CompilerId {
    return getCompilerForArchitecture(architecture);
  }

  /**
   * Get full compiler info including state
   */
  async getCompilerInfo(compilerId: CompilerId): Promise<CompilerInfo> {
    const manifest = await this.getManifest();
    const available = manifest.compilers.find((c) => c.id === compilerId);
    const installed = await this.getInstalledCompiler(compilerId);
    const displayInfo = getCompilerDisplayInfo(compilerId);

    let state: CompilerState = "not_installed";

    if (installed) {
      if (available && installed.hash !== available.hash) {
        state = "update_available";
      } else {
        state = "installed";
      }
    }

    if (this.downloadPromises.has(compilerId)) {
      state = "downloading";
    }

    return {
      id: compilerId,
      name: available?.name || displayInfo.name,
      description: available?.description || displayInfo.description,
      state,
      installed: installed ?? undefined,
      available,
      downloadProgress: this.downloadProgress.get(compilerId),
    };
  }

  /**
   * Get all compiler infos for UI display
   */
  async getAllCompilerInfos(): Promise<CompilerInfo[]> {
    const compilerIds: CompilerId[] = ["clang-arm", "clang-riscv", "clang-xtensa"];
    return Promise.all(compilerIds.map((id) => this.getCompilerInfo(id)));
  }

  /**
   * Get installed compiler metadata
   */
  async getInstalledCompiler(
    compilerId: CompilerId,
  ): Promise<InstalledCompiler | null> {
    const installed = await listInstalled();
    return installed.find((c) => c.id === compilerId) || null;
  }

  /**
   * Check if a compiler is ready (installed and valid)
   */
  async isCompilerReady(
    compilerId: CompilerId,
    requireLatest = false,
  ): Promise<boolean> {
    const manifest = await this.getManifest();
    const available = manifest.compilers.find((c) => c.id === compilerId);

    if (!available) {
      console.warn(`[WasmManager] Unknown compiler: ${compilerId}`);
      return false;
    }

    if (requireLatest) {
      return isCompilerCached(compilerId, available.hash);
    }

    return isCompilerCached(compilerId);
  }

  /**
   * Check if architecture is supported (compiler available)
   */
  async isArchitectureSupported(architecture: Architecture): Promise<boolean> {
    const compilerId = this.getCompilerIdForArchitecture(architecture);
    const manifest = await this.getManifest();
    return manifest.compilers.some((c) => c.id === compilerId);
  }

  /**
   * Ensure compiler is available for use
   * Downloads if not cached, returns cached version if available
   */
  async ensureCompiler(
    compilerId: CompilerId,
    onProgress?: (progress: DownloadProgress) => void,
  ): Promise<Uint8Array> {
    // Check if already downloading
    const existingPromise = this.downloadPromises.get(compilerId);
    if (existingPromise) {
      // Subscribe to progress updates
      if (onProgress) {
        const progress = this.downloadProgress.get(compilerId);
        if (progress) {
          onProgress(progress);
        }
      }
      return existingPromise;
    }

    // Check cache first
    const cached = await getCachedCompiler(compilerId);
    if (cached) {
      onProgress?.({
        stage: "ready",
        current: cached.length,
        total: cached.length,
        message: "Compiler loaded from cache",
        percentage: 100,
      });
      return cached;
    }

    // Download the compiler
    return this.downloadCompiler(compilerId, onProgress);
  }

  /**
   * Download a compiler (even if cached)
   */
  async downloadCompiler(
    compilerId: CompilerId,
    onProgress?: (progress: DownloadProgress) => void,
  ): Promise<Uint8Array> {
    const manifest = await this.getManifest();
    const compiler = manifest.compilers.find((c) => c.id === compilerId);

    if (!compiler) {
      throw new Error(`Unknown compiler: ${compilerId}`);
    }

    // Check if already downloading
    const existingPromise = this.downloadPromises.get(compilerId);
    if (existingPromise) {
      return existingPromise;
    }

    this.emit({ type: "download_started", compilerId });

    const progressHandler = (progress: DownloadProgress) => {
      this.downloadProgress.set(compilerId, progress);
      onProgress?.(progress);
      this.emit({ type: "download_progress", compilerId, progress });
    };

    const downloadPromise = (async () => {
      try {
        const wasm = await downloadCompiler(
          compiler,
          manifest.baseUrl,
          progressHandler,
        );
        this.emit({ type: "download_complete", compilerId });
        this.emit({ type: "storage_changed", stats: await this.getStorageStats() });
        return wasm;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.emit({ type: "download_error", compilerId, error: message });
        throw error;
      } finally {
        this.downloadPromises.delete(compilerId);
        this.downloadProgress.delete(compilerId);
      }
    })();

    this.downloadPromises.set(compilerId, downloadPromise);
    return downloadPromise;
  }

  /**
   * Remove an installed compiler
   */
  async removeCompiler(compilerId: CompilerId): Promise<void> {
    await removeCachedCompiler(compilerId);
    this.emit({ type: "compiler_removed", compilerId });
    this.emit({ type: "storage_changed", stats: await this.getStorageStats() });
  }

  /**
   * Check for available updates
   */
  async checkForUpdates(): Promise<UpdateNotification[]> {
    const manifest = await this.getManifest();
    const installed = await listInstalled();
    const notifications: UpdateNotification[] = [];

    for (const compiler of installed) {
      const available = manifest.compilers.find((c) => c.id === compiler.id);
      if (available && available.hash !== compiler.hash) {
        notifications.push({
          type: "compiler",
          id: compiler.id,
          currentVersion: compiler.version,
          availableVersion: available.version,
          size: available.size,
          message: `${available.name} update available`,
        });
      }
    }

    if (notifications.length > 0) {
      this.emit({ type: "update_available", notifications });
    }

    return notifications;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    return getCacheStorageStats();
  }

  /**
   * Get the required compiler for a platform architecture
   */
  async ensureCompilerForArchitecture(
    architecture: Architecture,
    onProgress?: (progress: DownloadProgress) => void,
  ): Promise<Uint8Array> {
    const compilerId = this.getCompilerIdForArchitecture(architecture);
    return this.ensureCompiler(compilerId, onProgress);
  }

  /**
   * Check if the required compiler for an architecture is installed
   */
  async hasCompilerForArchitecture(architecture: Architecture): Promise<boolean> {
    const compilerId = this.getCompilerIdForArchitecture(architecture);
    return this.isCompilerReady(compilerId);
  }

  /**
   * Get download progress for a compiler
   */
  getDownloadProgress(compilerId: CompilerId): DownloadProgress | undefined {
    return this.downloadProgress.get(compilerId);
  }

  /**
   * Check if compiler is currently downloading
   */
  isDownloading(compilerId: CompilerId): boolean {
    return this.downloadPromises.has(compilerId);
  }

  /**
   * Clear manifest cache
   */
  clearManifestCache(): void {
    this.manifest = null;
    this.manifestLoadedAt = 0;
    this.manifestPromise = null;
  }

  /**
   * Get base URL from manifest
   */
  async getBaseUrl(): Promise<string> {
    const manifest = await this.getManifest();
    return manifest.baseUrl;
  }
}

// Export singleton instance
export const WasmManager = WasmManagerService.getInstance();

// Also export the class for testing
export { WasmManagerService };
