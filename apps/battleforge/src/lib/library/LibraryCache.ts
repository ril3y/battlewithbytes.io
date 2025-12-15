/**
 * Library Cache
 *
 * IndexedDB-based cache for third-party libraries.
 * Stores downloaded libraries with manifest and file contents.
 */

import type {
  LibraryManifest,
  LibraryCacheMetadata,
  CachedLibrary,
} from "./types";

const DB_NAME = "battleforge-libraries";
const DB_VERSION = 1;
const STORE_NAME = "libraries";
const META_STORE = "metadata";

export class LibraryCache {
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
        console.error("[LibraryCache] Failed to open database:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for library file contents
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("library", ["name", "version"], { unique: false });
          store.createIndex("name", "name", { unique: false });
        }

        // Store for cache metadata
        if (!db.objectStoreNames.contains(META_STORE)) {
          const metaStore = db.createObjectStore(META_STORE, { keyPath: "id" });
          metaStore.createIndex("name", "name", { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get cached library
   */
  async getLibrary(
    name: string,
    version: string,
  ): Promise<CachedLibrary | null> {
    await this.init();
    if (!this.db) return null;

    const libraryKey = `${name}@${version}`;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, STORE_NAME], "readonly");
      const metaStore = tx.objectStore(META_STORE);
      const fileStore = tx.objectStore(STORE_NAME);

      const metaRequest = metaStore.get(libraryKey);

      metaRequest.onsuccess = () => {
        const meta = metaRequest.result as
          | (LibraryCacheMetadata & { manifest: LibraryManifest })
          | undefined;
        if (!meta) {
          resolve(null);
          return;
        }

        // Get all files for this library
        const index = fileStore.index("library");
        const range = IDBKeyRange.only([name, version]);
        const cursorRequest = index.openCursor(range);

        const files = new Map<string, Uint8Array>();

        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (cursor) {
            const record = cursor.value as {
              path: string;
              content: Uint8Array;
            };
            files.set(record.path, record.content);
            cursor.continue();
          } else {
            if (files.size === meta.fileCount) {
              console.log(
                `[LibraryCache] Loaded ${files.size} files for ${libraryKey}`,
              );
              resolve({
                id: libraryKey,
                name,
                version,
                manifest: meta.manifest,
                files,
                checksum: meta.checksum,
                downloadedAt: meta.timestamp,
                size: meta.totalSize,
              });
            } else {
              console.warn(
                `[LibraryCache] Cache incomplete: ${files.size}/${meta.fileCount}`,
              );
              resolve(null);
            }
          }
        };

        cursorRequest.onerror = () => {
          console.error("[LibraryCache] Cursor error:", cursorRequest.error);
          reject(cursorRequest.error);
        };
      };

      metaRequest.onerror = () => {
        console.error("[LibraryCache] Meta read error:", metaRequest.error);
        reject(metaRequest.error);
      };
    });
  }

  /**
   * Store library in cache
   */
  async setLibrary(
    name: string,
    version: string,
    manifest: LibraryManifest,
    files: Map<string, Uint8Array>,
    checksum: string,
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    const libraryKey = `${name}@${version}`;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, STORE_NAME], "readwrite");
      const metaStore = tx.objectStore(META_STORE);
      const fileStore = tx.objectStore(STORE_NAME);

      // Clear existing files for this library
      const index = fileStore.index("library");
      const range = IDBKeyRange.only([name, version]);
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
      for (const content of files.values()) {
        totalSize += content.length;
      }

      // Store metadata with manifest
      const meta: LibraryCacheMetadata & { manifest: LibraryManifest } = {
        id: libraryKey,
        name,
        version,
        manifest,
        checksum,
        timestamp: Date.now(),
        fileCount: files.size,
        totalSize,
        frameworks: manifest.frameworks || [],
        platforms: manifest.platforms || [],
      };
      metaStore.put(meta);

      // Store each file
      let stored = 0;
      for (const [path, content] of files) {
        const record = {
          id: `${name}@${version}:${path}`,
          name,
          version,
          path,
          content,
        };
        fileStore.put(record);
        stored++;
      }

      tx.oncomplete = () => {
        console.log(
          `[LibraryCache] Cached ${stored} files for ${libraryKey} (${(totalSize / 1024).toFixed(1)} KB)`,
        );
        resolve();
      };

      tx.onerror = () => {
        console.error("[LibraryCache] Transaction error:", tx.error);
        reject(tx.error);
      };
    });
  }

  /**
   * Check if library is cached
   */
  async has(name: string, version: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    const libraryKey = `${name}@${version}`;

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const request = store.get(libraryKey);

      request.onsuccess = () => {
        resolve(!!request.result);
      };

      request.onerror = () => {
        resolve(false);
      };
    });
  }

  /**
   * Get all versions of a library
   */
  async getVersions(name: string): Promise<string[]> {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const index = store.index("name");
      const range = IDBKeyRange.only(name);
      const request = index.getAll(range);

      request.onsuccess = () => {
        const metas = request.result as LibraryCacheMetadata[];
        resolve(metas.map((m) => m.version).sort());
      };

      request.onerror = () => {
        resolve([]);
      };
    });
  }

  /**
   * Remove a specific library version
   */
  async removeLibrary(name: string, version: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    const libraryKey = `${name}@${version}`;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, STORE_NAME], "readwrite");
      const metaStore = tx.objectStore(META_STORE);
      const fileStore = tx.objectStore(STORE_NAME);

      // Delete metadata
      metaStore.delete(libraryKey);

      // Delete all files for this library
      const index = fileStore.index("library");
      const range = IDBKeyRange.only([name, version]);
      const cursorRequest = index.openCursor(range);

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      tx.oncomplete = () => {
        console.log(`[LibraryCache] Removed ${libraryKey}`);
        resolve();
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  }

  /**
   * List all cached libraries
   */
  async listCached(): Promise<LibraryCacheMetadata[]> {
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
        const metas = request.result as LibraryCacheMetadata[];
        const total = metas.reduce((sum, meta) => sum + meta.totalSize, 0);
        resolve(total);
      };

      request.onerror = () => {
        resolve(0);
      };
    });
  }

  /**
   * Clear all cached libraries
   */
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([META_STORE, STORE_NAME], "readwrite");

      tx.objectStore(META_STORE).clear();
      tx.objectStore(STORE_NAME).clear();

      tx.oncomplete = () => {
        console.log("[LibraryCache] Cache cleared");
        resolve();
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  }
}
