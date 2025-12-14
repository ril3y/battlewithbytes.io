/**
 * Header Cache
 *
 * IndexedDB-based cache for platform header files.
 * Stores decompressed headers with checksum validation.
 */

const DB_NAME = "battleforge-headers";
const DB_VERSION = 1;
const STORE_NAME = "headers";
const META_STORE = "metadata";

interface CacheMetadata {
  platformId: string;
  familyId: string;
  checksum: string;
  timestamp: number;
  fileCount: number;
  totalSize: number;
}

export class HeaderCache {
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
        console.error("[HeaderCache] Failed to open database:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for header file contents
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("family", ["platformId", "familyId"], {
            unique: false,
          });
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
   * Get cached headers for a platform family
   */
  async getHeaders(
    platformId: string,
    familyId: string,
  ): Promise<Map<string, Uint8Array> | null> {
    await this.init();
    if (!this.db) return null;

    const metaKey = `${platformId}/${familyId}`;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, STORE_NAME], "readonly");
      const metaStore = tx.objectStore(META_STORE);
      const headerStore = tx.objectStore(STORE_NAME);

      // First check if we have metadata
      const metaRequest = metaStore.get(metaKey);

      metaRequest.onsuccess = () => {
        const meta = metaRequest.result as CacheMetadata | undefined;
        if (!meta) {
          resolve(null);
          return;
        }

        // Get all headers for this family
        const index = headerStore.index("family");
        const range = IDBKeyRange.only([platformId, familyId]);
        const cursorRequest = index.openCursor(range);

        const headers = new Map<string, Uint8Array>();

        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (cursor) {
            const record = cursor.value as {
              path: string;
              content: Uint8Array;
            };
            headers.set(record.path, record.content);
            cursor.continue();
          } else {
            // All records processed
            if (headers.size === meta.fileCount) {
              console.log(
                `[HeaderCache] Loaded ${headers.size} cached headers for ${metaKey}`,
              );
              resolve(headers);
            } else {
              console.warn(
                `[HeaderCache] Cache incomplete: ${headers.size}/${meta.fileCount}`,
              );
              resolve(null);
            }
          }
        };

        cursorRequest.onerror = () => {
          console.error("[HeaderCache] Cursor error:", cursorRequest.error);
          reject(cursorRequest.error);
        };
      };

      metaRequest.onerror = () => {
        console.error("[HeaderCache] Meta read error:", metaRequest.error);
        reject(metaRequest.error);
      };
    });
  }

  /**
   * Store headers in cache
   */
  async setHeaders(
    platformId: string,
    familyId: string,
    headers: Map<string, Uint8Array>,
    checksum: string,
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    const metaKey = `${platformId}/${familyId}`;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, STORE_NAME], "readwrite");
      const metaStore = tx.objectStore(META_STORE);
      const headerStore = tx.objectStore(STORE_NAME);

      // Clear existing headers for this family
      const index = headerStore.index("family");
      const range = IDBKeyRange.only([platformId, familyId]);
      const deleteRequest = index.openCursor(range);

      deleteRequest.onsuccess = () => {
        const cursor = deleteRequest.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // Calculate total size
      let totalSize = 0;
      for (const content of headers.values()) {
        totalSize += content.length;
      }

      // Store metadata
      const meta: CacheMetadata = {
        platformId,
        familyId,
        checksum,
        timestamp: Date.now(),
        fileCount: headers.size,
        totalSize,
      };
      metaStore.put({ id: metaKey, ...meta });

      // Store each header file
      let stored = 0;
      for (const [path, content] of headers) {
        const record = {
          id: `${platformId}/${familyId}${path}`,
          platformId,
          familyId,
          path,
          content,
        };
        headerStore.put(record);
        stored++;
      }

      tx.oncomplete = () => {
        console.log(
          `[HeaderCache] Cached ${stored} headers for ${metaKey} (${(totalSize / 1024).toFixed(1)} KB)`,
        );
        resolve();
      };

      tx.onerror = () => {
        console.error("[HeaderCache] Transaction error:", tx.error);
        reject(tx.error);
      };
    });
  }

  /**
   * Check if headers are cached and valid
   */
  async isValid(
    platformId: string,
    familyId: string,
    expectedChecksum: string,
  ): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    const metaKey = `${platformId}/${familyId}`;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const request = store.get(metaKey);

      request.onsuccess = () => {
        const meta = request.result as CacheMetadata | undefined;
        if (!meta) {
          resolve(false);
          return;
        }

        // Check checksum match
        if (meta.checksum !== expectedChecksum) {
          console.log(`[HeaderCache] Checksum mismatch for ${metaKey}`);
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
   * Get cache metadata
   */
  async getMetadata(
    platformId: string,
    familyId: string,
  ): Promise<CacheMetadata | null> {
    await this.init();
    if (!this.db) return null;

    const metaKey = `${platformId}/${familyId}`;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const request = store.get(metaKey);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  /**
   * Remove headers for a specific family
   */
  async removeFamily(platformId: string, familyId: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    const metaKey = `${platformId}/${familyId}`;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, STORE_NAME], "readwrite");
      const metaStore = tx.objectStore(META_STORE);
      const headerStore = tx.objectStore(STORE_NAME);

      // Delete metadata
      metaStore.delete(metaKey);

      // Delete all headers for this family
      const index = headerStore.index("family");
      const range = IDBKeyRange.only([platformId, familyId]);
      const cursorRequest = index.openCursor(range);

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      tx.oncomplete = () => {
        console.log(`[HeaderCache] Removed cache for ${metaKey}`);
        resolve();
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, STORE_NAME], "readwrite");

      tx.objectStore(META_STORE).clear();
      tx.objectStore(STORE_NAME).clear();

      tx.oncomplete = () => {
        console.log("[HeaderCache] Cache cleared");
        resolve();
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  }

  /**
   * Get total cache size in bytes
   */
  async getTotalSize(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const metas = request.result as CacheMetadata[];
        const total = metas.reduce((sum, meta) => sum + meta.totalSize, 0);
        resolve(total);
      };

      request.onerror = () => {
        resolve(0);
      };
    });
  }

  /**
   * List all cached families
   */
  async listCached(): Promise<
    Array<{
      platformId: string;
      familyId: string;
      size: number;
      timestamp: number;
    }>
  > {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const metas = request.result as CacheMetadata[];
        resolve(
          metas.map((m) => ({
            platformId: m.platformId,
            familyId: m.familyId,
            size: m.totalSize,
            timestamp: m.timestamp,
          })),
        );
      };

      request.onerror = () => {
        resolve([]);
      };
    });
  }
}
