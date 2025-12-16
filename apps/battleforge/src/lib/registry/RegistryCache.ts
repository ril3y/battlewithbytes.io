/**
 * Registry Cache
 *
 * IndexedDB-based cache for registry data fetched from GitHub.
 * Stores registry index, platform manifests, and board manifests with TTL validation.
 */

import type {
  RegistryIndex,
  PlatformManifest,
  BoardManifest,
  LibraryManifest,
} from "./types";

const DB_NAME = "battleforge-registry";
const DB_VERSION = 1;

// Store names
const REGISTRY_STORE = "registry";
const PLATFORMS_STORE = "platforms";
const BOARDS_STORE = "boards";
const LIBRARIES_STORE = "libraries";
const META_STORE = "metadata";

export interface RegistryCacheMetadata {
  id: string;
  version: string;
  timestamp: number;
  etag?: string;
}

export class RegistryCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the database
   */
  private async init(): Promise<void> {
    if (this.db) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("[RegistryCache] Failed to open database:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for registry index
        if (!db.objectStoreNames.contains(REGISTRY_STORE)) {
          db.createObjectStore(REGISTRY_STORE, { keyPath: "id" });
        }

        // Store for platform manifests
        if (!db.objectStoreNames.contains(PLATFORMS_STORE)) {
          db.createObjectStore(PLATFORMS_STORE, { keyPath: "id" });
        }

        // Store for board manifests
        if (!db.objectStoreNames.contains(BOARDS_STORE)) {
          db.createObjectStore(BOARDS_STORE, { keyPath: "id" });
        }

        // Store for library manifests
        if (!db.objectStoreNames.contains(LIBRARIES_STORE)) {
          db.createObjectStore(LIBRARIES_STORE, { keyPath: "id" });
        }

        // Store for cache metadata
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: "id" });
        }
      };
    });

    return this.initPromise;
  }

  // ============================================================================
  // Registry Index
  // ============================================================================

  /**
   * Get cached registry index
   */
  async getRegistry(): Promise<RegistryIndex | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(REGISTRY_STORE, "readonly");
      const store = tx.objectStore(REGISTRY_STORE);
      const request = store.get("main");

      request.onsuccess = () => {
        const record = request.result;
        if (record) {
          resolve(record.data as RegistryIndex);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error("[RegistryCache] Failed to get registry:", request.error);
        resolve(null);
      };
    });
  }

  /**
   * Store registry index in cache
   */
  async setRegistry(
    data: RegistryIndex,
    meta: Omit<RegistryCacheMetadata, "id">
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([REGISTRY_STORE, META_STORE], "readwrite");
      const registryStore = tx.objectStore(REGISTRY_STORE);
      const metaStore = tx.objectStore(META_STORE);

      // Store registry data
      registryStore.put({ id: "main", data });

      // Store metadata
      metaStore.put({ id: "registry", ...meta });

      tx.oncomplete = () => {
        console.log(
          `[RegistryCache] Cached registry v${data.version} (${data.boards.length} boards)`
        );
        resolve();
      };

      tx.onerror = () => {
        console.error("[RegistryCache] Transaction error:", tx.error);
        reject(tx.error);
      };
    });
  }

  /**
   * Get registry cache metadata
   */
  async getRegistryMetadata(): Promise<RegistryCacheMetadata | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const request = store.get("registry");

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  // ============================================================================
  // Platform Manifests
  // ============================================================================

  /**
   * Get cached platform manifest
   */
  async getPlatformManifest(
    platform: string,
    family: string
  ): Promise<PlatformManifest | null> {
    await this.init();
    if (!this.db) return null;

    const key = `${platform}/${family}`;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(PLATFORMS_STORE, "readonly");
      const store = tx.objectStore(PLATFORMS_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        const record = request.result;
        if (record) {
          resolve(record.data as PlatformManifest);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  /**
   * Store platform manifest in cache
   */
  async setPlatformManifest(
    platform: string,
    family: string,
    data: PlatformManifest
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    const key = `${platform}/${family}`;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(PLATFORMS_STORE, "readwrite");
      const store = tx.objectStore(PLATFORMS_STORE);

      store.put({ id: key, data, timestamp: Date.now() });

      tx.oncomplete = () => {
        console.log(`[RegistryCache] Cached platform manifest: ${key}`);
        resolve();
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  }

  // ============================================================================
  // Board Manifests
  // ============================================================================

  /**
   * Get cached board manifest
   */
  async getBoardManifest(boardId: string): Promise<BoardManifest | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(BOARDS_STORE, "readonly");
      const store = tx.objectStore(BOARDS_STORE);
      const request = store.get(boardId);

      request.onsuccess = () => {
        const record = request.result;
        if (record) {
          resolve(record.data as BoardManifest);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  /**
   * Store board manifest in cache
   */
  async setBoardManifest(boardId: string, data: BoardManifest): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(BOARDS_STORE, "readwrite");
      const store = tx.objectStore(BOARDS_STORE);

      store.put({ id: boardId, data, timestamp: Date.now() });

      tx.oncomplete = () => {
        console.log(`[RegistryCache] Cached board manifest: ${boardId}`);
        resolve();
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  }

  // ============================================================================
  // Library Manifests
  // ============================================================================

  /**
   * Get cached library manifest
   */
  async getLibraryManifest(libraryId: string): Promise<LibraryManifest | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(LIBRARIES_STORE, "readonly");
      const store = tx.objectStore(LIBRARIES_STORE);
      const request = store.get(libraryId);

      request.onsuccess = () => {
        const record = request.result;
        if (record) {
          resolve(record.data as LibraryManifest);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  /**
   * Store library manifest in cache
   */
  async setLibraryManifest(
    libraryId: string,
    data: LibraryManifest
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(LIBRARIES_STORE, "readwrite");
      const store = tx.objectStore(LIBRARIES_STORE);

      store.put({ id: libraryId, data, timestamp: Date.now() });

      tx.oncomplete = () => {
        console.log(`[RegistryCache] Cached library manifest: ${libraryId}`);
        resolve();
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(
        [REGISTRY_STORE, PLATFORMS_STORE, BOARDS_STORE, LIBRARIES_STORE, META_STORE],
        "readwrite"
      );

      tx.objectStore(REGISTRY_STORE).clear();
      tx.objectStore(PLATFORMS_STORE).clear();
      tx.objectStore(BOARDS_STORE).clear();
      tx.objectStore(LIBRARIES_STORE).clear();
      tx.objectStore(META_STORE).clear();

      tx.oncomplete = () => {
        console.log("[RegistryCache] Cache cleared");
        resolve();
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  }

  /**
   * Check if registry cache is fresh (within TTL)
   */
  async isRegistryFresh(ttlMs: number): Promise<boolean> {
    const meta = await this.getRegistryMetadata();
    if (!meta) return false;

    return Date.now() - meta.timestamp < ttlMs;
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    hasRegistry: boolean;
    registryVersion: string | null;
    registryAge: number | null;
    platformCount: number;
    boardCount: number;
    libraryCount: number;
  }> {
    await this.init();
    if (!this.db) {
      return {
        hasRegistry: false,
        registryVersion: null,
        registryAge: null,
        platformCount: 0,
        boardCount: 0,
        libraryCount: 0,
      };
    }

    const meta = await this.getRegistryMetadata();

    return new Promise((resolve) => {
      const tx = this.db!.transaction(
        [PLATFORMS_STORE, BOARDS_STORE, LIBRARIES_STORE],
        "readonly"
      );

      let platformCount = 0;
      let boardCount = 0;
      let libraryCount = 0;

      const platformReq = tx.objectStore(PLATFORMS_STORE).count();
      platformReq.onsuccess = () => {
        platformCount = platformReq.result;
      };

      const boardReq = tx.objectStore(BOARDS_STORE).count();
      boardReq.onsuccess = () => {
        boardCount = boardReq.result;
      };

      const libraryReq = tx.objectStore(LIBRARIES_STORE).count();
      libraryReq.onsuccess = () => {
        libraryCount = libraryReq.result;
      };

      tx.oncomplete = () => {
        resolve({
          hasRegistry: !!meta,
          registryVersion: meta?.version || null,
          registryAge: meta ? Date.now() - meta.timestamp : null,
          platformCount,
          boardCount,
          libraryCount,
        });
      };

      tx.onerror = () => {
        resolve({
          hasRegistry: false,
          registryVersion: null,
          registryAge: null,
          platformCount: 0,
          boardCount: 0,
          libraryCount: 0,
        });
      };
    });
  }
}
