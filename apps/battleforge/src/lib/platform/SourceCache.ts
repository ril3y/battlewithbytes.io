/**
 * Source Cache
 *
 * IndexedDB-based cache for platform source files.
 * Extends the header caching pattern to also cache device files (startup, linker, system).
 */

import { HeaderCache } from "./HeaderCache";

const DB_NAME = "battleforge-sources";
const DB_VERSION = 1;
const DEVICE_FILES_STORE = "device-files";

interface DeviceFilesRecord {
  id: string;
  platformId: string;
  familyId: string;
  deviceId: string;
  startup?: Uint8Array;
  linker?: string;
  system?: Uint8Array;
  header?: Uint8Array;
  timestamp: number;
  version: string;
}

/**
 * SourceCache extends HeaderCache with device file caching
 */
export class SourceCache extends HeaderCache {
  private deviceDb: IDBDatabase | null = null;
  private deviceInitPromise: Promise<void> | null = null;

  /**
   * Initialize the device files database
   */
  private async initDeviceDb(): Promise<void> {
    if (this.deviceDb) return;

    if (this.deviceInitPromise) {
      return this.deviceInitPromise;
    }

    this.deviceInitPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("[SourceCache] Failed to open database:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.deviceDb = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for device files
        if (!db.objectStoreNames.contains(DEVICE_FILES_STORE)) {
          const store = db.createObjectStore(DEVICE_FILES_STORE, {
            keyPath: "id",
          });
          store.createIndex("device", ["platformId", "familyId", "deviceId"], {
            unique: true,
          });
        }
      };
    });

    return this.deviceInitPromise;
  }

  /**
   * Get cached device files
   */
  async getDeviceFiles(
    platformId: string,
    familyId: string,
    deviceId: string
  ): Promise<DeviceFilesRecord | null> {
    await this.initDeviceDb();
    if (!this.deviceDb) return null;

    const key = `${platformId}/${familyId}/${deviceId}`;

    return new Promise((resolve) => {
      const tx = this.deviceDb!.transaction(DEVICE_FILES_STORE, "readonly");
      const store = tx.objectStore(DEVICE_FILES_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  /**
   * Cache device files
   */
  async setDeviceFiles(
    platformId: string,
    familyId: string,
    deviceId: string,
    files: {
      startup?: Uint8Array;
      linker?: string;
      system?: Uint8Array;
      header?: Uint8Array;
    },
    version: string
  ): Promise<void> {
    await this.initDeviceDb();
    if (!this.deviceDb) return;

    const key = `${platformId}/${familyId}/${deviceId}`;

    return new Promise((resolve, reject) => {
      const tx = this.deviceDb!.transaction(DEVICE_FILES_STORE, "readwrite");
      const store = tx.objectStore(DEVICE_FILES_STORE);

      const record: DeviceFilesRecord = {
        id: key,
        platformId,
        familyId,
        deviceId,
        ...files,
        timestamp: Date.now(),
        version,
      };

      store.put(record);

      tx.oncomplete = () => {
        console.log(`[SourceCache] Cached device files for ${key}`);
        resolve();
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  }

  /**
   * Check if device files are cached and valid
   */
  async isDeviceFilesValid(
    platformId: string,
    familyId: string,
    deviceId: string,
    expectedVersion: string
  ): Promise<boolean> {
    const cached = await this.getDeviceFiles(platformId, familyId, deviceId);
    if (!cached) return false;
    return cached.version === expectedVersion;
  }

  /**
   * Remove device files for a specific device
   */
  async removeDeviceFiles(
    platformId: string,
    familyId: string,
    deviceId: string
  ): Promise<void> {
    await this.initDeviceDb();
    if (!this.deviceDb) return;

    const key = `${platformId}/${familyId}/${deviceId}`;

    return new Promise((resolve, reject) => {
      const tx = this.deviceDb!.transaction(DEVICE_FILES_STORE, "readwrite");
      const store = tx.objectStore(DEVICE_FILES_STORE);
      store.delete(key);

      tx.oncomplete = () => {
        console.log(`[SourceCache] Removed device files for ${key}`);
        resolve();
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  }

  /**
   * Clear all device file caches
   */
  async clearDeviceFiles(): Promise<void> {
    await this.initDeviceDb();
    if (!this.deviceDb) return;

    return new Promise((resolve, reject) => {
      const tx = this.deviceDb!.transaction(DEVICE_FILES_STORE, "readwrite");
      tx.objectStore(DEVICE_FILES_STORE).clear();

      tx.oncomplete = () => {
        console.log("[SourceCache] Device files cache cleared");
        resolve();
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  }

  /**
   * Clear all caches (headers + device files)
   */
  override async clear(): Promise<void> {
    await super.clear();
    await this.clearDeviceFiles();
  }
}
