/**
 * WASM Cache
 *
 * IndexedDB-based cache for WASM compiler binaries.
 * Stores decompressed WASM files with version and hash validation.
 */

import type {
  CompilerId,
  WasmCacheMetadata,
  InstalledCompiler,
  StorageStats,
} from "./types";

const DB_NAME = "battleforge-wasm";
const DB_VERSION = 1;
const WASM_STORE = "wasm";
const META_STORE = "metadata";

export class WasmCache {
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
        console.error("[WasmCache] Failed to open database:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for WASM binary content
        if (!db.objectStoreNames.contains(WASM_STORE)) {
          db.createObjectStore(WASM_STORE, { keyPath: "id" });
        }

        // Store for cache metadata
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: "id" });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Check if a compiler is cached and valid
   */
  async isValid(
    compilerId: CompilerId,
    expectedHash: string,
  ): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const request = store.get(compilerId);

      request.onsuccess = () => {
        const meta = request.result as WasmCacheMetadata | undefined;
        if (!meta) {
          resolve(false);
          return;
        }

        // Check hash match
        if (meta.hash !== expectedHash) {
          console.log(`[WasmCache] Hash mismatch for ${compilerId}`);
          resolve(false);
          return;
        }

        resolve(true);
      };

      request.onerror = () => {
        resolve(false);
      };
    });
  }

  /**
   * Get cached WASM binary
   */
  async getWasm(compilerId: CompilerId): Promise<Uint8Array | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, WASM_STORE], "readonly");
      const metaStore = tx.objectStore(META_STORE);
      const wasmStore = tx.objectStore(WASM_STORE);

      // First check metadata
      const metaRequest = metaStore.get(compilerId);

      metaRequest.onsuccess = () => {
        const meta = metaRequest.result as WasmCacheMetadata | undefined;
        if (!meta) {
          resolve(null);
          return;
        }

        // Get WASM binary
        const wasmRequest = wasmStore.get(compilerId);

        wasmRequest.onsuccess = () => {
          const record = wasmRequest.result as
            | { id: string; wasm: Uint8Array }
            | undefined;
          if (record) {
            console.log(
              `[WasmCache] Loaded ${compilerId} from cache (${(record.wasm.length / 1024 / 1024).toFixed(1)} MB)`,
            );
            resolve(record.wasm);
          } else {
            resolve(null);
          }
        };

        wasmRequest.onerror = () => {
          console.error("[WasmCache] WASM read error:", wasmRequest.error);
          reject(wasmRequest.error);
        };
      };

      metaRequest.onerror = () => {
        console.error("[WasmCache] Meta read error:", metaRequest.error);
        reject(metaRequest.error);
      };
    });
  }

  /**
   * Store WASM binary in cache
   */
  async setWasm(
    compilerId: CompilerId,
    wasm: Uint8Array,
    version: string,
    hash: string,
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, WASM_STORE], "readwrite");
      const metaStore = tx.objectStore(META_STORE);
      const wasmStore = tx.objectStore(WASM_STORE);

      // Store metadata
      const meta: WasmCacheMetadata = {
        id: compilerId,
        version,
        hash,
        size: wasm.length,
        timestamp: Date.now(),
      };
      metaStore.put(meta);

      // Store WASM binary
      wasmStore.put({ id: compilerId, wasm });

      tx.oncomplete = () => {
        console.log(
          `[WasmCache] Cached ${compilerId} v${version} (${(wasm.length / 1024 / 1024).toFixed(1)} MB)`,
        );
        resolve();
      };

      tx.onerror = () => {
        console.error("[WasmCache] Transaction error:", tx.error);
        reject(tx.error);
      };
    });
  }

  /**
   * Get metadata for an installed compiler
   */
  async getMetadata(compilerId: CompilerId): Promise<InstalledCompiler | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const request = store.get(compilerId);

      request.onsuccess = () => {
        const meta = request.result as WasmCacheMetadata | undefined;
        if (meta) {
          resolve({
            id: meta.id,
            version: meta.version,
            hash: meta.hash,
            installedAt: meta.timestamp,
            size: meta.size,
          });
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
   * Update last used timestamp for a compiler
   */
  async updateLastUsed(compilerId: CompilerId): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, "readwrite");
      const store = tx.objectStore(META_STORE);
      const request = store.get(compilerId);

      request.onsuccess = () => {
        const meta = request.result as WasmCacheMetadata | undefined;
        if (meta) {
          store.put({ ...meta, lastUsed: Date.now() });
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  /**
   * Remove a cached compiler
   */
  async remove(compilerId: CompilerId): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, WASM_STORE], "readwrite");
      const metaStore = tx.objectStore(META_STORE);
      const wasmStore = tx.objectStore(WASM_STORE);

      metaStore.delete(compilerId);
      wasmStore.delete(compilerId);

      tx.oncomplete = () => {
        console.log(`[WasmCache] Removed ${compilerId}`);
        resolve();
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  }

  /**
   * Clear all cached WASM binaries
   */
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, WASM_STORE], "readwrite");

      tx.objectStore(META_STORE).clear();
      tx.objectStore(WASM_STORE).clear();

      tx.oncomplete = () => {
        console.log("[WasmCache] Cache cleared");
        resolve();
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    await this.init();

    const compilers: StorageStats["compilers"] = [];
    let totalUsed = 0;

    if (this.db) {
      const metas = await this.getAllMetadata();
      for (const meta of metas) {
        compilers.push({
          id: meta.id,
          size: meta.size,
          version: meta.version,
        });
        totalUsed += meta.size;
      }
    }

    // Try to get storage quota
    let quota = 0;
    let available = 0;

    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        quota = estimate.quota || 0;
        available = (estimate.quota || 0) - (estimate.usage || 0);
      } catch {
        // Storage API not available
      }
    }

    return {
      used: totalUsed,
      available,
      quota,
      compilers,
    };
  }

  /**
   * Get all metadata entries
   */
  private async getAllMetadata(): Promise<WasmCacheMetadata[]> {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        resolve([]);
      };
    });
  }

  /**
   * List all installed compilers
   */
  async listInstalled(): Promise<InstalledCompiler[]> {
    const metas = await this.getAllMetadata();
    return metas.map((meta) => ({
      id: meta.id,
      version: meta.version,
      hash: meta.hash,
      installedAt: meta.timestamp,
      size: meta.size,
    }));
  }

  /**
   * Register a compiler as installed via HTTP loading (without storing binary)
   * Used by EmscriptenClangLoader to record successful HTTP-based loads
   */
  async setMetadataOnly(
    compilerId: CompilerId,
    version: string,
    hash: string,
    size: number,
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(META_STORE, "readwrite");
      const metaStore = tx.objectStore(META_STORE);

      // Store metadata only (no binary in WASM_STORE)
      const meta: WasmCacheMetadata = {
        id: compilerId,
        version,
        hash,
        size,
        timestamp: Date.now(),
      };
      metaStore.put(meta);

      tx.oncomplete = () => {
        console.log(
          `[WasmCache] Registered ${compilerId} v${version} (HTTP-loaded, ${(size / 1024 / 1024).toFixed(1)} MB)`,
        );
        resolve();
      };

      tx.onerror = () => {
        console.error("[WasmCache] Transaction error:", tx.error);
        reject(tx.error);
      };
    });
  }
}
