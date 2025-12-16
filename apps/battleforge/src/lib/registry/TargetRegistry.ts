/**
 * TargetRegistry - Fetches and manages platform, board, and library definitions
 * from the battleforge_boards GitHub repository with IndexedDB caching.
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
import { RegistryCache } from "./RegistryCache";
import { GitHubRegistryFetcher } from "./GitHubRegistryFetcher";

// Cache TTL: 30 minutes
const CACHE_TTL_MS = 1000 * 60 * 30;

class TargetRegistryImpl {
  private cache = new RegistryCache();
  private fetcher = new GitHubRegistryFetcher();

  // In-memory caches for current session
  private registryIndex: RegistryIndex | null = null;
  private platformCache = new Map<string, PlatformManifest>();
  private boardCache = new Map<string, BoardManifest>();
  private libraryCache = new Map<string, LibraryManifest>();

  // Prevent concurrent fetches
  private loadPromise: Promise<RegistryIndex> | null = null;

  /**
   * Get the GitHub base URL for the registry
   */
  getBaseUrl(): string {
    return this.fetcher.getBaseUrl();
  }

  /**
   * Load the registry index with caching
   */
  async loadRegistry(): Promise<RegistryIndex> {
    // Return in-memory cache if available
    if (this.registryIndex) {
      return this.registryIndex;
    }

    // Avoid duplicate fetches
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this._loadRegistryWithCache();
    return this.loadPromise;
  }

  private async _loadRegistryWithCache(): Promise<RegistryIndex> {
    try {
      // 1. Check IndexedDB cache
      const cached = await this.cache.getRegistry();
      const meta = await this.cache.getRegistryMetadata();

      // 2. If cache is fresh, use it
      if (cached && meta && Date.now() - meta.timestamp < CACHE_TTL_MS) {
        console.log(
          `[TargetRegistry] Using cached registry v${cached.version} (${Math.round((Date.now() - meta.timestamp) / 1000 / 60)}min old)`
        );
        this.registryIndex = cached;
        return cached;
      }

      // 3. Try to fetch from GitHub (with ETag if we have it)
      try {
        const result = await this.fetcher.fetchRegistryIfModified(meta?.etag);

        if (result === null && cached) {
          // 304 Not Modified - update timestamp and use cache
          console.log("[TargetRegistry] Registry unchanged (304), using cache");
          await this.cache.setRegistry(cached, {
            version: cached.version,
            timestamp: Date.now(),
            etag: meta?.etag,
          });
          this.registryIndex = cached;
          return cached;
        }

        if (result) {
          // New data - cache it
          console.log(
            `[TargetRegistry] Fetched registry v${result.data.version}:`,
            {
              platforms: result.data.platforms.length,
              boards: result.data.boards.length,
              libraries: result.data.libraries.length,
            }
          );

          await this.cache.setRegistry(result.data, {
            version: result.data.version,
            timestamp: Date.now(),
            etag: result.etag,
          });

          this.registryIndex = result.data;
          return result.data;
        }
      } catch (fetchError) {
        // Network error - try to use stale cache
        if (cached) {
          console.warn(
            "[TargetRegistry] Network error, using stale cache:",
            fetchError
          );
          this.registryIndex = cached;
          return cached;
        }
        throw fetchError;
      }

      throw new Error("Failed to load registry: no data available");
    } finally {
      this.loadPromise = null;
    }
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
    family?: string
  ): Promise<BoardIndexEntry[]> {
    const boards = await this.getBoards();
    return boards.filter(
      (b) => b.platform === platform && (!family || b.family === family)
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
   * Load a platform manifest with caching
   */
  async getPlatformManifest(
    platform: string,
    family: string
  ): Promise<PlatformManifest | null> {
    const cacheKey = `${platform}-${family}`;

    // Check in-memory cache first
    if (this.platformCache.has(cacheKey)) {
      return this.platformCache.get(cacheKey)!;
    }

    // Check IndexedDB cache
    const cached = await this.cache.getPlatformManifest(platform, family);
    if (cached) {
      console.log(`[TargetRegistry] Using cached platform: ${platform}/${family}`);
      this.platformCache.set(cacheKey, cached);
      return cached;
    }

    // Find platform in registry
    const registry = await this.loadRegistry();
    const entry = registry.platforms.find(
      (p) => p.platform === platform && p.family === family
    );

    if (!entry) {
      console.warn(
        `[TargetRegistry] Platform not found: ${platform}/${family}`
      );
      return null;
    }

    // Fetch from GitHub
    try {
      console.log(`[TargetRegistry] Fetching platform manifest: ${entry.path}`);
      const manifest = await this.fetcher.fetchPlatformManifest(entry.path);

      // Cache it
      await this.cache.setPlatformManifest(platform, family, manifest);
      this.platformCache.set(cacheKey, manifest);

      console.log(`[TargetRegistry] Loaded platform: ${manifest.name}`, {
        devices: manifest.devices.length,
        architecture: manifest.architecture,
      });

      return manifest;
    } catch (error) {
      console.error(
        `[TargetRegistry] Failed to load platform manifest:`,
        error
      );
      return null;
    }
  }

  /**
   * Load a board manifest with caching
   */
  async getBoardManifest(boardId: string): Promise<BoardManifest | null> {
    // Check in-memory cache first
    if (this.boardCache.has(boardId)) {
      return this.boardCache.get(boardId)!;
    }

    // Check IndexedDB cache
    const cached = await this.cache.getBoardManifest(boardId);
    if (cached) {
      console.log(`[TargetRegistry] Using cached board: ${boardId}`);
      this.boardCache.set(boardId, cached);
      return cached;
    }

    // Find board in registry
    const registry = await this.loadRegistry();
    const entry = registry.boards.find((b) => b.id === boardId);

    if (!entry) {
      console.warn(`[TargetRegistry] Board not found: ${boardId}`);
      return null;
    }

    // Fetch from GitHub
    try {
      console.log(`[TargetRegistry] Fetching board manifest: ${entry.path}`);
      const manifest = await this.fetcher.fetchBoardManifest(entry.path);

      // Cache it
      await this.cache.setBoardManifest(boardId, manifest);
      this.boardCache.set(boardId, manifest);

      console.log(`[TargetRegistry] Loaded board: ${manifest.name}`);

      return manifest;
    } catch (error) {
      console.error(`[TargetRegistry] Failed to load board manifest:`, error);
      return null;
    }
  }

  /**
   * Load a library manifest with caching
   */
  async getLibraryManifest(libraryId: string): Promise<LibraryManifest | null> {
    // Check in-memory cache first
    if (this.libraryCache.has(libraryId)) {
      return this.libraryCache.get(libraryId)!;
    }

    // Check IndexedDB cache
    const cached = await this.cache.getLibraryManifest(libraryId);
    if (cached) {
      console.log(`[TargetRegistry] Using cached library: ${libraryId}`);
      this.libraryCache.set(libraryId, cached);
      return cached;
    }

    // Find library in registry
    const registry = await this.loadRegistry();
    const entry = registry.libraries.find((l) => l.id === libraryId);

    if (!entry) {
      console.warn(`[TargetRegistry] Library not found: ${libraryId}`);
      return null;
    }

    // Fetch from GitHub
    try {
      console.log(`[TargetRegistry] Fetching library manifest: ${entry.path}`);
      const manifest = await this.fetcher.fetchLibraryManifest(entry.path);

      // Cache it
      await this.cache.setLibraryManifest(libraryId, manifest);
      this.libraryCache.set(libraryId, manifest);

      console.log(`[TargetRegistry] Loaded library: ${manifest.name}`);

      return manifest;
    } catch (error) {
      console.error(`[TargetRegistry] Failed to load library manifest:`, error);
      return null;
    }
  }

  /**
   * Get the header URL for a platform
   */
  async getHeaderUrl(platform: string, family: string): Promise<string | null> {
    const manifest = await this.getPlatformManifest(platform, family);
    if (!manifest) {
      return null;
    }

    // Headers are now fetched via SourceFetcher from GitHub
    // Return the headers.url if it's a full URL, otherwise construct GitHub URL
    const headerUrl = manifest.headers.url;
    if (headerUrl.startsWith("http")) {
      return headerUrl;
    }

    // For relative URLs, they're fetched via SourceFetcher
    return `${this.fetcher.getBaseUrl()}/${headerUrl}`;
  }

  /**
   * Get library download URL
   */
  async getLibraryUrl(libraryId: string): Promise<string | null> {
    const manifest = await this.getLibraryManifest(libraryId);
    if (!manifest) {
      return null;
    }

    const libUrl = manifest.url;
    if (libUrl.startsWith("http")) {
      return libUrl;
    }

    return `${this.fetcher.getBaseUrl()}/${libUrl}`;
  }

  /**
   * Get device definition from platform manifest
   */
  async getDevice(
    platform: string,
    family: string,
    deviceId: string
  ): Promise<PlatformManifest["devices"][0] | null> {
    const manifest = await this.getPlatformManifest(platform, family);
    if (!manifest) {
      return null;
    }

    return manifest.devices.find((d) => d.id === deviceId) || null;
  }

  /**
   * Clear all caches (in-memory and IndexedDB)
   */
  async clearCache(): Promise<void> {
    this.registryIndex = null;
    this.loadPromise = null;
    this.platformCache.clear();
    this.boardCache.clear();
    this.libraryCache.clear();
    await this.cache.clear();
    console.log("[TargetRegistry] All caches cleared");
  }

  /**
   * Clear only in-memory caches (keep IndexedDB)
   */
  clearMemoryCache(): void {
    this.registryIndex = null;
    this.loadPromise = null;
    this.platformCache.clear();
    this.boardCache.clear();
    this.libraryCache.clear();
    console.log("[TargetRegistry] Memory cache cleared");
  }

  /**
   * Force refresh from GitHub
   */
  async refresh(): Promise<RegistryIndex> {
    this.clearMemoryCache();
    // Clear registry metadata to force re-fetch
    await this.cache.clear();
    return this.loadRegistry();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Check if GitHub is reachable
   */
  async isOnline(): Promise<boolean> {
    return this.fetcher.isReachable();
  }
}

// Export singleton instance
export const TargetRegistry = new TargetRegistryImpl();
