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
  AvailableDisassembler,
  AvailableEmulator,
  InstalledCompiler,
  UpdateNotification,
  StorageStats,
  WasmManagerEvent,
  WasmManagerEventListener,
  ToolInfo,
  ToolCategory,
} from "./types";
import { getCompilerForArchitecture } from "./types";
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

const MANIFEST_URL = "/wasm/manifest.json";
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
      // Compare hashes - use hashes.compressed for v2 format, hash for v1
      const availableHash = available?.hashes?.compressed || available?.hash;
      if (available && availableHash && installed.hash !== availableHash) {
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
    const compilerIds: CompilerId[] = [
      "clang-arm",
      "clang-riscv",
      "clang-xtensa",
    ];
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
        // Use baseUrl (v1) or meta.fallbackBaseUrl (v2) or default
        const baseUrl = manifest.baseUrl || manifest.meta?.fallbackBaseUrl || "/wasm";
        const wasm = await downloadCompiler(
          compiler,
          baseUrl,
          progressHandler,
        );
        // Clean up BEFORE emitting events so state is correct when listeners query
        this.downloadPromises.delete(compilerId);
        this.downloadProgress.delete(compilerId);
        this.emit({ type: "download_complete", compilerId });
        this.emit({
          type: "storage_changed",
          stats: await this.getStorageStats(),
        });
        return wasm;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Clean up on error too
        this.downloadPromises.delete(compilerId);
        this.downloadProgress.delete(compilerId);
        this.emit({ type: "download_error", compilerId, error: message });
        throw error;
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
      // Use hash from hashes object (v2) or hash field (v1)
      const availableHash = available?.hashes?.compressed || available?.hash;
      if (available && availableHash !== compiler.hash) {
        notifications.push({
          type: "compiler",
          id: compiler.id,
          currentVersion: compiler.version || compiler.fullVersion || "older",
          availableVersion: available.fullVersion || available.version || available.softwareVersion,
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
  async hasCompilerForArchitecture(
    architecture: Architecture,
  ): Promise<boolean> {
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
    return manifest.baseUrl || manifest.meta?.fallbackBaseUrl || "/wasm";
  }

  // ============================================================================
  // Disassembler Methods
  // ============================================================================

  /**
   * Get all available disassemblers
   */
  async getAvailableDisassemblers(): Promise<AvailableDisassembler[]> {
    const manifest = await this.getManifest();
    return manifest.disassemblers || [];
  }

  // ============================================================================
  // Emulator Methods
  // ============================================================================

  /**
   * Get all available emulators
   */
  async getAvailableEmulators(): Promise<AvailableEmulator[]> {
    const manifest = await this.getManifest();
    return manifest.emulators || [];
  }

  // ============================================================================
  // Generic Tool Download Methods (for Package Manager)
  // ============================================================================

  /**
   * Ensure a disassembler is available
   */
  async ensureDisassembler(
    id: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<Uint8Array> {
    const manifest = await this.getManifest();
    const disasm = manifest.disassemblers?.find((d) => d.id === id);

    if (!disasm) {
      throw new Error(`Unknown disassembler: ${id}`);
    }

    // Check cache first
    const cached = await getCachedCompiler(id as CompilerId);
    if (cached) {
      onProgress?.({
        stage: "ready",
        current: cached.length,
        total: cached.length,
        message: "Disassembler loaded from cache",
        percentage: 100,
      });
      return cached;
    }

    // Download
    const baseUrl = manifest.baseUrl || manifest.meta?.fallbackBaseUrl || "/wasm";
    const wasmFile = disasm.files.wasmGz || disasm.files.wasm;
    const url = `${baseUrl}/${wasmFile}`;

    onProgress?.({
      stage: "downloading",
      current: 0,
      total: disasm.sizeCompressed || disasm.size,
      message: `Downloading ${disasm.name}...`,
      percentage: 0,
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download ${disasm.name}: ${response.statusText}`);
    }

    let data: Uint8Array;
    if (wasmFile.endsWith(".gz")) {
      const compressed = await response.arrayBuffer();
      const decompressedStream = new Response(compressed).body!.pipeThrough(
        new DecompressionStream("gzip")
      );
      data = new Uint8Array(await new Response(decompressedStream).arrayBuffer());
    } else {
      data = new Uint8Array(await response.arrayBuffer());
    }

    // Cache with the disassembler's hash
    const hash = disasm.hashes?.compressed || "unknown";
    const { wasmCache } = await import("./WasmLoader");
    await wasmCache.setWasm(id as CompilerId, data, disasm.fullVersion, hash);

    onProgress?.({
      stage: "ready",
      current: data.length,
      total: data.length,
      message: `${disasm.name} ready`,
      percentage: 100,
    });

    return data;
  }

  /**
   * Ensure an emulator is available
   * Handles both separate WASM files and embedded WASM (JS-only)
   */
  async ensureEmulator(
    id: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<Uint8Array> {
    const manifest = await this.getManifest();
    const emu = manifest.emulators?.find((e) => e.id === id);

    if (!emu) {
      throw new Error(`Unknown emulator: ${id}`);
    }

    // Check cache first
    const cached = await getCachedCompiler(id as CompilerId);
    if (cached) {
      onProgress?.({
        stage: "ready",
        current: cached.length,
        total: cached.length,
        message: "Emulator loaded from cache",
        percentage: 100,
      });
      return cached;
    }

    // Download - handle embedded WASM (JS-only) vs separate WASM files
    const baseUrl = manifest.baseUrl || manifest.meta?.fallbackBaseUrl || "/wasm";
    const isEmbedded = (emu as { embeddedWasm?: boolean }).embeddedWasm;
    const targetFile = isEmbedded
      ? emu.files.js
      : (emu.files.wasmGz || emu.files.wasm);

    if (!targetFile) {
      throw new Error(`No download file specified for ${emu.name}`);
    }

    const url = `${baseUrl}/${targetFile}`;

    onProgress?.({
      stage: "downloading",
      current: 0,
      total: emu.sizeCompressed || emu.size,
      message: `Downloading ${emu.name}...`,
      percentage: 0,
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download ${emu.name}: ${response.statusText}`);
    }

    let data: Uint8Array;
    if (targetFile.endsWith(".gz")) {
      const compressed = await response.arrayBuffer();
      const decompressedStream = new Response(compressed).body!.pipeThrough(
        new DecompressionStream("gzip")
      );
      data = new Uint8Array(await new Response(decompressedStream).arrayBuffer());
    } else {
      data = new Uint8Array(await response.arrayBuffer());
    }

    // Cache with the emulator's hash
    const hash = emu.hashes?.compressed || "unknown";
    const { wasmCache } = await import("./WasmLoader");
    await wasmCache.setWasm(id as CompilerId, data, emu.fullVersion, hash);

    onProgress?.({
      stage: "ready",
      current: data.length,
      total: data.length,
      message: `${emu.name} ready`,
      percentage: 100,
    });

    return data;
  }

  /**
   * Remove an installed tool (disassembler or emulator)
   */
  async removeTool(id: string): Promise<void> {
    await removeCachedCompiler(id as CompilerId);
    this.emit({ type: "storage_changed", stats: await this.getStorageStats() });
  }

  // ============================================================================
  // Unified Tool Methods (for Package Manager UI)
  // ============================================================================

  /**
   * Get all tools (compilers, linkers, disassemblers, emulators) as unified ToolInfo
   * Used by the WASM Package Manager UI
   */
  async getAllToolInfos(): Promise<ToolInfo[]> {
    const manifest = await this.getManifest();
    const installed = await listInstalled();
    const tools: ToolInfo[] = [];

    // Add compilers
    for (const compiler of manifest.compilers) {
      const installedCompiler = installed.find((c) => c.id === compiler.id);
      const availableHash = compiler.hashes?.compressed || compiler.hash;

      let state: ToolInfo["state"] = "not_installed";
      if (installedCompiler) {
        state =
          availableHash && installedCompiler.hash !== availableHash
            ? "update_available"
            : "installed";
      }
      if (this.downloadPromises.has(compiler.id as CompilerId)) {
        state = "downloading";
      }

      tools.push({
        id: compiler.id,
        category: "compiler" as ToolCategory,
        name: compiler.name,
        description: compiler.description || "",
        state,
        available: {
          fullVersion: compiler.fullVersion,
          softwareVersion: compiler.softwareVersion,
          releaseVersion: compiler.releaseVersion,
          size: compiler.size,
          sizeCompressed: compiler.size,
          architectures: compiler.architectures,
        },
        installed: installedCompiler
          ? {
              version:
                installedCompiler.version || installedCompiler.fullVersion || "",
              hash: installedCompiler.hash,
              installedAt: installedCompiler.installedAt,
              size: installedCompiler.size,
              lastUsed: installedCompiler.lastUsed,
            }
          : undefined,
        downloadProgress: this.downloadProgress.get(compiler.id as CompilerId),
      });
    }

    // Add linkers - LLD is bundled with the app, always available
    for (const linker of manifest.linkers || []) {
      tools.push({
        id: linker.id,
        category: "linker" as ToolCategory,
        name: linker.name,
        description: linker.description || "Bundled with app",
        state: "installed", // LLD is bundled and always available
        available: {
          fullVersion: linker.fullVersion,
          softwareVersion: linker.softwareVersion,
          releaseVersion: linker.releaseVersion,
          size: linker.size,
          architectures: linker.architectures,
        },
        installed: {
          version: linker.fullVersion,
          hash: linker.hashes?.compressed || "",
          installedAt: 0, // Bundled
          size: linker.size,
        },
      });
    }

    // Add disassemblers - check cache for installation state
    for (const disasm of manifest.disassemblers || []) {
      const installedDisasm = installed.find((i) => i.id === disasm.id);
      const availableHash = disasm.hashes?.compressed;

      let disasmState: ToolInfo["state"] = "not_installed";
      if (installedDisasm) {
        disasmState =
          availableHash && installedDisasm.hash !== availableHash
            ? "update_available"
            : "installed";
      }

      tools.push({
        id: disasm.id,
        category: "disassembler" as ToolCategory,
        name: disasm.name,
        description: disasm.description || "",
        state: disasmState,
        available: {
          fullVersion: disasm.fullVersion,
          softwareVersion: disasm.softwareVersion,
          releaseVersion: disasm.releaseVersion,
          size: disasm.size,
          sizeCompressed: disasm.sizeCompressed,
          architectures: disasm.architectures,
          features: disasm.features,
        },
        installed: installedDisasm
          ? {
              version: installedDisasm.version || installedDisasm.fullVersion || "",
              hash: installedDisasm.hash,
              installedAt: installedDisasm.installedAt,
              size: installedDisasm.size,
            }
          : undefined,
      });
    }

    // Add emulators - check cache for installation state
    for (const emu of manifest.emulators || []) {
      const installedEmu = installed.find((i) => i.id === emu.id);
      const availableHash = emu.hashes?.compressed;

      let emuState: ToolInfo["state"] = "not_installed";
      if (installedEmu) {
        emuState =
          availableHash && installedEmu.hash !== availableHash
            ? "update_available"
            : "installed";
      }

      tools.push({
        id: emu.id,
        category: "emulator" as ToolCategory,
        name: emu.name,
        description: emu.description || "",
        state: emuState,
        available: {
          fullVersion: emu.fullVersion,
          softwareVersion: emu.softwareVersion,
          releaseVersion: emu.releaseVersion,
          size: emu.size,
          sizeCompressed: emu.sizeCompressed,
          architectures: emu.supportedCpus,
        },
        installed: installedEmu
          ? {
              version: installedEmu.version || installedEmu.fullVersion || "",
              hash: installedEmu.hash,
              installedAt: installedEmu.installedAt,
              size: installedEmu.size,
            }
          : undefined,
      });
    }

    return tools;
  }

  /**
   * Get tools filtered by category
   */
  async getToolsByCategory(category: ToolCategory): Promise<ToolInfo[]> {
    const tools = await this.getAllToolInfos();
    return tools.filter((t) => t.category === category);
  }
}

// Export singleton instance
export const WasmManager = WasmManagerService.getInstance();

// Also export the class for testing
export { WasmManagerService };
