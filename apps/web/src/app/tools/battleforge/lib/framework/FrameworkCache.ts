/**
 * Framework Cache
 *
 * IndexedDB-based cache for framework core files.
 * Stores decompressed framework files with checksum validation.
 */

import type { FrameworkId } from '../platform/types';

const DB_NAME = 'battleforge-frameworks';
const DB_VERSION = 1;
const STORE_NAME = 'frameworks';
const META_STORE = 'metadata';

interface CacheMetadata {
  frameworkId: FrameworkId;
  platformId: string;
  familyId: string;
  checksum: string;
  timestamp: number;
  fileCount: number;
  totalSize: number;
}

export class FrameworkCache {
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
        console.error('[FrameworkCache] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for framework file contents
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('framework', ['frameworkId', 'platformId', 'familyId'], { unique: false });
        }

        // Store for cache metadata
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: 'id' });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get cached framework files
   */
  async getCoreFiles(
    frameworkId: FrameworkId,
    platformId: string,
    familyId: string
  ): Promise<Map<string, Uint8Array> | null> {
    await this.init();
    if (!this.db) return null;

    const metaKey = `${frameworkId}/${platformId}/${familyId}`;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, STORE_NAME], 'readonly');
      const metaStore = tx.objectStore(META_STORE);
      const frameworkStore = tx.objectStore(STORE_NAME);

      // First check if we have metadata
      const metaRequest = metaStore.get(metaKey);

      metaRequest.onsuccess = () => {
        const meta = metaRequest.result as CacheMetadata | undefined;
        if (!meta) {
          resolve(null);
          return;
        }

        // Get all files for this framework
        const index = frameworkStore.index('framework');
        const range = IDBKeyRange.only([frameworkId, platformId, familyId]);
        const cursorRequest = index.openCursor(range);

        const files = new Map<string, Uint8Array>();

        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (cursor) {
            const record = cursor.value as { path: string; content: Uint8Array };
            files.set(record.path, record.content);
            cursor.continue();
          } else {
            // All records processed
            if (files.size === meta.fileCount) {
              console.log(`[FrameworkCache] Loaded ${files.size} cached files for ${metaKey}`);
              resolve(files);
            } else {
              console.warn(`[FrameworkCache] Cache incomplete: ${files.size}/${meta.fileCount}`);
              resolve(null);
            }
          }
        };

        cursorRequest.onerror = () => {
          console.error('[FrameworkCache] Cursor error:', cursorRequest.error);
          reject(cursorRequest.error);
        };
      };

      metaRequest.onerror = () => {
        console.error('[FrameworkCache] Meta read error:', metaRequest.error);
        reject(metaRequest.error);
      };
    });
  }

  /**
   * Store framework files in cache
   */
  async setCoreFiles(
    frameworkId: FrameworkId,
    platformId: string,
    familyId: string,
    files: Map<string, Uint8Array>,
    checksum: string
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    const metaKey = `${frameworkId}/${platformId}/${familyId}`;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, STORE_NAME], 'readwrite');
      const metaStore = tx.objectStore(META_STORE);
      const frameworkStore = tx.objectStore(STORE_NAME);

      // Clear existing files for this framework
      const index = frameworkStore.index('framework');
      const range = IDBKeyRange.only([frameworkId, platformId, familyId]);
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
      const filesArray = Array.from(files.values());
      for (let i = 0; i < filesArray.length; i++) {
        totalSize += filesArray[i].length;
      }

      // Store metadata
      const meta: CacheMetadata = {
        frameworkId,
        platformId,
        familyId,
        checksum,
        timestamp: Date.now(),
        fileCount: files.size,
        totalSize
      };
      metaStore.put({ id: metaKey, ...meta });

      // Store each framework file
      let stored = 0;
      const filesEntries = Array.from(files.entries());
      for (let i = 0; i < filesEntries.length; i++) {
        const [path, content] = filesEntries[i];
        const record = {
          id: `${frameworkId}/${platformId}/${familyId}${path}`,
          frameworkId,
          platformId,
          familyId,
          path,
          content
        };
        frameworkStore.put(record);
        stored++;
      }

      tx.oncomplete = () => {
        console.log(`[FrameworkCache] Cached ${stored} files for ${metaKey} (${(totalSize / 1024).toFixed(1)} KB)`);
        resolve();
      };

      tx.onerror = () => {
        console.error('[FrameworkCache] Transaction error:', tx.error);
        reject(tx.error);
      };
    });
  }

  /**
   * Check if framework files are cached and valid
   */
  async isValid(
    frameworkId: FrameworkId,
    platformId: string,
    familyId: string,
    expectedChecksum: string
  ): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    const metaKey = `${frameworkId}/${platformId}/${familyId}`;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, 'readonly');
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
          console.log(`[FrameworkCache] Checksum mismatch for ${metaKey}`);
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
    frameworkId: FrameworkId,
    platformId: string,
    familyId: string
  ): Promise<CacheMetadata | null> {
    await this.init();
    if (!this.db) return null;

    const metaKey = `${frameworkId}/${platformId}/${familyId}`;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, 'readonly');
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
   * Remove framework cache for a specific framework
   */
  async removeFramework(
    frameworkId: FrameworkId,
    platformId: string,
    familyId: string
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    const metaKey = `${frameworkId}/${platformId}/${familyId}`;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, STORE_NAME], 'readwrite');
      const metaStore = tx.objectStore(META_STORE);
      const frameworkStore = tx.objectStore(STORE_NAME);

      // Delete metadata
      metaStore.delete(metaKey);

      // Delete all files for this framework
      const index = frameworkStore.index('framework');
      const range = IDBKeyRange.only([frameworkId, platformId, familyId]);
      const cursorRequest = index.openCursor(range);

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      tx.oncomplete = () => {
        console.log(`[FrameworkCache] Removed cache for ${metaKey}`);
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
      const tx = this.db!.transaction([META_STORE, STORE_NAME], 'readwrite');

      tx.objectStore(META_STORE).clear();
      tx.objectStore(STORE_NAME).clear();

      tx.oncomplete = () => {
        console.log('[FrameworkCache] Cache cleared');
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
      const tx = this.db!.transaction(META_STORE, 'readonly');
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
   * Get cache size for a specific framework
   */
  async getCacheSize(
    frameworkId: FrameworkId,
    platformId: string,
    familyId: string
  ): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    const metaKey = `${frameworkId}/${platformId}/${familyId}`;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, 'readonly');
      const store = tx.objectStore(META_STORE);
      const request = store.get(metaKey);

      request.onsuccess = () => {
        const meta = request.result as CacheMetadata | undefined;
        resolve(meta?.totalSize || 0);
      };

      request.onerror = () => {
        resolve(0);
      };
    });
  }

  /**
   * List all cached frameworks
   */
  async listCached(): Promise<Array<{
    frameworkId: FrameworkId;
    platformId: string;
    familyId: string;
    size: number;
    timestamp: number;
  }>> {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, 'readonly');
      const store = tx.objectStore(META_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const metas = request.result as CacheMetadata[];
        resolve(metas.map(m => ({
          frameworkId: m.frameworkId,
          platformId: m.platformId,
          familyId: m.familyId,
          size: m.totalSize,
          timestamp: m.timestamp
        })));
      };

      request.onerror = () => {
        resolve([]);
      };
    });
  }
}
