/**
 * TargetRegistry - Fetches and manages platform, board, and library definitions
 * from the remote battleforge_targets registry
 */

import type {
  RegistryIndex,
  PlatformIndexEntry,
  BoardIndexEntry,
  LibraryIndexEntry,
  PlatformManifest,
  BoardManifest,
  LibraryManifest,
} from "./types";
import { withBasePath } from "../utils/basePath";

// Registry base URL - uses basePath for production deployment
const getRegistryBaseUrl = () => withBasePath("/boards");

class TargetRegistryImpl {
  private registryIndex: RegistryIndex | null = null;
  private platformCache = new Map<string, PlatformManifest>();
  private boardCache = new Map<string, BoardManifest>();
  private libraryCache = new Map<string, LibraryManifest>();
  private loadPromise: Promise<RegistryIndex> | null = null;

  /**
   * Get the base URL for the registry
   */
  getBaseUrl(): string {
    return getRegistryBaseUrl();
  }

  /**
   * Load the registry index
   */
  async loadRegistry(): Promise<RegistryIndex> {
    // Return cached if available
    if (this.registryIndex) {
      return this.registryIndex;
    }

    // Avoid duplicate fetches
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      const url = `${getRegistryBaseUrl()}/registry.json`;
      console.log(`[TargetRegistry] Loading registry from ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load registry: ${response.status}`);
      }

      this.registryIndex = await response.json();
      console.log(
        `[TargetRegistry] Loaded registry v${this.registryIndex!.version}:`,
        {
          platforms: this.registryIndex!.platforms.length,
          boards: this.registryIndex!.boards.length,
          libraries: this.registryIndex!.libraries.length,
        },
      );

      return this.registryIndex!;
    })();

    return this.loadPromise;
  }

  /**
   * Get all platforms from the registry
   */
  async getPlatforms(): Promise<PlatformIndexEntry[]> {
    const registry = await this.loadRegistry();
    return registry.platforms;
  }

  /**
   * Get all boards from the registry
   */
  async getBoards(): Promise<BoardIndexEntry[]> {
    const registry = await this.loadRegistry();
    return registry.boards;
  }

  /**
   * Get boards for a specific platform/family
   */
  async getBoardsForPlatform(
    platform: string,
    family?: string,
  ): Promise<BoardIndexEntry[]> {
    const boards = await this.getBoards();
    return boards.filter(
      (b) => b.platform === platform && (!family || b.family === family),
    );
  }

  /**
   * Get all libraries from the registry
   */
  async getLibraries(): Promise<LibraryIndexEntry[]> {
    const registry = await this.loadRegistry();
    return registry.libraries;
  }

  /**
   * Load a platform manifest
   */
  async getPlatformManifest(
    platform: string,
    family: string,
  ): Promise<PlatformManifest | null> {
    const cacheKey = `${platform}-${family}`;

    // Check cache first
    if (this.platformCache.has(cacheKey)) {
      return this.platformCache.get(cacheKey)!;
    }

    // Find platform in registry
    const registry = await this.loadRegistry();
    const entry = registry.platforms.find(
      (p) => p.platform === platform && p.family === family,
    );

    if (!entry) {
      console.warn(
        `[TargetRegistry] Platform not found: ${platform}/${family}`,
      );
      return null;
    }

    // Fetch manifest
    const url = `${getRegistryBaseUrl()}/${entry.path}`;
    console.log(`[TargetRegistry] Loading platform manifest from ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to load platform manifest: ${response.status}`);
      return null;
    }

    const manifest: PlatformManifest = await response.json();
    this.platformCache.set(cacheKey, manifest);

    console.log(`[TargetRegistry] Loaded platform: ${manifest.name}`, {
      devices: manifest.devices.length,
      architecture: manifest.architecture,
    });

    return manifest;
  }

  /**
   * Load a board manifest
   */
  async getBoardManifest(boardId: string): Promise<BoardManifest | null> {
    // Check cache first
    if (this.boardCache.has(boardId)) {
      return this.boardCache.get(boardId)!;
    }

    // Find board in registry
    const registry = await this.loadRegistry();
    const entry = registry.boards.find((b) => b.id === boardId);

    if (!entry) {
      console.warn(`[TargetRegistry] Board not found: ${boardId}`);
      return null;
    }

    // Fetch manifest
    const url = `${getRegistryBaseUrl()}/${entry.path}`;
    console.log(`[TargetRegistry] Loading board manifest from ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to load board manifest: ${response.status}`);
      return null;
    }

    const manifest: BoardManifest = await response.json();
    this.boardCache.set(boardId, manifest);

    console.log(`[TargetRegistry] Loaded board: ${manifest.name}`);

    return manifest;
  }

  /**
   * Load a library manifest
   */
  async getLibraryManifest(libraryId: string): Promise<LibraryManifest | null> {
    // Check cache first
    if (this.libraryCache.has(libraryId)) {
      return this.libraryCache.get(libraryId)!;
    }

    // Find library in registry
    const registry = await this.loadRegistry();
    const entry = registry.libraries.find((l) => l.id === libraryId);

    if (!entry) {
      console.warn(`[TargetRegistry] Library not found: ${libraryId}`);
      return null;
    }

    // Fetch manifest
    const url = `${getRegistryBaseUrl()}/${entry.path}`;
    console.log(`[TargetRegistry] Loading library manifest from ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to load library manifest: ${response.status}`);
      return null;
    }

    const manifest: LibraryManifest = await response.json();
    this.libraryCache.set(libraryId, manifest);

    console.log(`[TargetRegistry] Loaded library: ${manifest.name}`);

    return manifest;
  }

  /**
   * Get the header URL for a platform
   */
  async getHeaderUrl(platform: string, family: string): Promise<string | null> {
    const manifest = await this.getPlatformManifest(platform, family);
    if (!manifest) {
      return null;
    }

    // If URL is relative, prepend base URL
    const headerUrl = manifest.headers.url;
    if (headerUrl.startsWith("/")) {
      return headerUrl;
    }

    return `${getRegistryBaseUrl()}/${headerUrl}`;
  }

  /**
   * Get library download URL
   */
  async getLibraryUrl(libraryId: string): Promise<string | null> {
    const manifest = await this.getLibraryManifest(libraryId);
    if (!manifest) {
      return null;
    }

    // If URL is relative, prepend base URL
    const libUrl = manifest.url;
    if (libUrl.startsWith("/")) {
      return libUrl;
    }

    return `${getRegistryBaseUrl()}/${libUrl}`;
  }

  /**
   * Get device definition from platform manifest
   */
  async getDevice(
    platform: string,
    family: string,
    deviceId: string,
  ): Promise<PlatformManifest["devices"][0] | null> {
    const manifest = await this.getPlatformManifest(platform, family);
    if (!manifest) {
      return null;
    }

    return manifest.devices.find((d) => d.id === deviceId) || null;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.registryIndex = null;
    this.loadPromise = null;
    this.platformCache.clear();
    this.boardCache.clear();
    this.libraryCache.clear();
    console.log("[TargetRegistry] Cache cleared");
  }
}

// Export singleton instance
export const TargetRegistry = new TargetRegistryImpl();
