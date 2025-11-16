/**
 * Analysis Database - IndexedDB wrapper for persisting analysis results
 *
 * Similar to IDA Pro's .idb file, this provides a client-side database (MDB - Magic Database)
 * that persists binary analysis data across page reloads.
 *
 * Database Schema:
 * - functions: Detected functions with names, callers, callees
 * - comments: User comments at specific addresses
 * - xrefs: Cross-references (calls, branches, data access)
 * - metadata: Analysis metadata (base address, firmware size, timestamps)
 */

const DB_NAME = 'battlemagic-analysis';
const DB_VERSION = 1;

// Object store names
export const STORE_FUNCTIONS = 'functions';
export const STORE_COMMENTS = 'comments';
export const STORE_XREFS = 'xrefs';
export const STORE_METADATA = 'metadata';

/**
 * Function entry in database
 */
export interface DbFunction {
  address: number;           // Primary key
  name: string;              // Function name (sub_1000 or user-renamed)
  callers: number[];         // Addresses that call this function
  callees: number[];         // Addresses this function calls
  xref_count: number;        // Total xrefs to this function
}

/**
 * Comment entry in database
 */
export interface DbComment {
  address: number;           // Primary key
  text: string;              // Comment text
  timestamp: number;         // When comment was created/modified
}

/**
 * Cross-reference entry in database
 */
export interface DbXref {
  id: string;                // Primary key (composite: `${from}_${to}_${type}`)
  from_addr: number;         // Source address
  to_addr: number;           // Target address
  xref_type: number;         // XrefType enum value
  instruction: string;       // Instruction mnemonic
  operands: string;          // Instruction operands
}

/**
 * Metadata entry in database
 */
export interface DbMetadata {
  key: string;               // Primary key
  value: unknown;            // Stored value (JSON-serializable)
}

/**
 * Complete database export format (.mdb file)
 */
export interface MdbExport {
  version: number;
  timestamp: number;
  metadata: Record<string, unknown>;
  functions: DbFunction[];
  comments: DbComment[];
  xrefs: DbXref[];
}

/**
 * Analysis Database Manager
 *
 * Handles all IndexedDB operations for persisting analysis data.
 */
export class AnalysisDatabase {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialize and open the database
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.dbPromise) {
      await this.dbPromise;
      return;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[AnalysisDB] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[AnalysisDB] Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('[AnalysisDB] Upgrading database schema...');

        // Create object stores
        if (!db.objectStoreNames.contains(STORE_FUNCTIONS)) {
          const functionsStore = db.createObjectStore(STORE_FUNCTIONS, { keyPath: 'address' });
          functionsStore.createIndex('name', 'name', { unique: false });
          console.log('[AnalysisDB] Created functions store');
        }

        if (!db.objectStoreNames.contains(STORE_COMMENTS)) {
          const commentsStore = db.createObjectStore(STORE_COMMENTS, { keyPath: 'address' });
          commentsStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('[AnalysisDB] Created comments store');
        }

        if (!db.objectStoreNames.contains(STORE_XREFS)) {
          const xrefsStore = db.createObjectStore(STORE_XREFS, { keyPath: 'id' });
          xrefsStore.createIndex('from_addr', 'from_addr', { unique: false });
          xrefsStore.createIndex('to_addr', 'to_addr', { unique: false });
          xrefsStore.createIndex('xref_type', 'xref_type', { unique: false });
          console.log('[AnalysisDB] Created xrefs store');
        }

        if (!db.objectStoreNames.contains(STORE_METADATA)) {
          db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
          console.log('[AnalysisDB] Created metadata store');
        }
      };
    });

    await this.dbPromise;
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
      console.log('[AnalysisDB] Database closed');
    }
  }

  /**
   * Clear all data from the database
   */
  async clear(): Promise<void> {
    await this.init();
    const transaction = this.db!.transaction(
      [STORE_FUNCTIONS, STORE_COMMENTS, STORE_XREFS, STORE_METADATA],
      'readwrite'
    );

    await Promise.all([
      this.clearStore(transaction.objectStore(STORE_FUNCTIONS)),
      this.clearStore(transaction.objectStore(STORE_COMMENTS)),
      this.clearStore(transaction.objectStore(STORE_XREFS)),
      this.clearStore(transaction.objectStore(STORE_METADATA)),
    ]);

    console.log('[AnalysisDB] Database cleared');
  }

  private clearStore(store: IDBObjectStore): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================================
  // Functions Store Operations
  // ============================================================================

  /**
   * Save a single function to the database
   */
  async saveFunction(func: DbFunction): Promise<void> {
    await this.init();
    const transaction = this.db!.transaction(STORE_FUNCTIONS, 'readwrite');
    const store = transaction.objectStore(STORE_FUNCTIONS);

    return new Promise((resolve, reject) => {
      const request = store.put(func);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save multiple functions to the database (batch operation)
   */
  async saveFunctions(functions: DbFunction[]): Promise<void> {
    await this.init();
    const transaction = this.db!.transaction(STORE_FUNCTIONS, 'readwrite');
    const store = transaction.objectStore(STORE_FUNCTIONS);

    return new Promise((resolve, reject) => {
      let pending = functions.length;
      if (pending === 0) {
        resolve();
        return;
      }

      functions.forEach(func => {
        const request = store.put(func);
        request.onsuccess = () => {
          pending--;
          if (pending === 0) resolve();
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * Get a function by address
   */
  async getFunction(address: number): Promise<DbFunction | null> {
    await this.init();
    const transaction = this.db!.transaction(STORE_FUNCTIONS, 'readonly');
    const store = transaction.objectStore(STORE_FUNCTIONS);

    return new Promise((resolve, reject) => {
      const request = store.get(address);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all functions
   */
  async getAllFunctions(): Promise<DbFunction[]> {
    await this.init();
    const transaction = this.db!.transaction(STORE_FUNCTIONS, 'readonly');
    const store = transaction.objectStore(STORE_FUNCTIONS);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a function by address
   */
  async deleteFunction(address: number): Promise<void> {
    await this.init();
    const transaction = this.db!.transaction(STORE_FUNCTIONS, 'readwrite');
    const store = transaction.objectStore(STORE_FUNCTIONS);

    return new Promise((resolve, reject) => {
      const request = store.delete(address);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================================
  // Comments Store Operations
  // ============================================================================

  /**
   * Save a comment to the database
   */
  async saveComment(comment: DbComment): Promise<void> {
    await this.init();
    const transaction = this.db!.transaction(STORE_COMMENTS, 'readwrite');
    const store = transaction.objectStore(STORE_COMMENTS);

    return new Promise((resolve, reject) => {
      const request = store.put(comment);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save multiple comments (batch operation)
   */
  async saveComments(comments: DbComment[]): Promise<void> {
    await this.init();
    const transaction = this.db!.transaction(STORE_COMMENTS, 'readwrite');
    const store = transaction.objectStore(STORE_COMMENTS);

    return new Promise((resolve, reject) => {
      let pending = comments.length;
      if (pending === 0) {
        resolve();
        return;
      }

      comments.forEach(comment => {
        const request = store.put(comment);
        request.onsuccess = () => {
          pending--;
          if (pending === 0) resolve();
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * Get a comment by address
   */
  async getComment(address: number): Promise<DbComment | null> {
    await this.init();
    const transaction = this.db!.transaction(STORE_COMMENTS, 'readonly');
    const store = transaction.objectStore(STORE_COMMENTS);

    return new Promise((resolve, reject) => {
      const request = store.get(address);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all comments
   */
  async getAllComments(): Promise<DbComment[]> {
    await this.init();
    const transaction = this.db!.transaction(STORE_COMMENTS, 'readonly');
    const store = transaction.objectStore(STORE_COMMENTS);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a comment by address
   */
  async deleteComment(address: number): Promise<void> {
    await this.init();
    const transaction = this.db!.transaction(STORE_COMMENTS, 'readwrite');
    const store = transaction.objectStore(STORE_COMMENTS);

    return new Promise((resolve, reject) => {
      const request = store.delete(address);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================================
  // Xrefs Store Operations
  // ============================================================================

  /**
   * Save a single xref to the database
   */
  async saveXref(xref: DbXref): Promise<void> {
    await this.init();
    const transaction = this.db!.transaction(STORE_XREFS, 'readwrite');
    const store = transaction.objectStore(STORE_XREFS);

    return new Promise((resolve, reject) => {
      const request = store.put(xref);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save multiple xrefs (batch operation)
   */
  async saveXrefs(xrefs: DbXref[]): Promise<void> {
    await this.init();
    const transaction = this.db!.transaction(STORE_XREFS, 'readwrite');
    const store = transaction.objectStore(STORE_XREFS);

    return new Promise((resolve, reject) => {
      let pending = xrefs.length;
      if (pending === 0) {
        resolve();
        return;
      }

      xrefs.forEach(xref => {
        const request = store.put(xref);
        request.onsuccess = () => {
          pending--;
          if (pending === 0) resolve();
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * Get all xrefs
   */
  async getAllXrefs(): Promise<DbXref[]> {
    await this.init();
    const transaction = this.db!.transaction(STORE_XREFS, 'readonly');
    const store = transaction.objectStore(STORE_XREFS);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get xrefs by source address
   */
  async getXrefsFrom(fromAddr: number): Promise<DbXref[]> {
    await this.init();
    const transaction = this.db!.transaction(STORE_XREFS, 'readonly');
    const store = transaction.objectStore(STORE_XREFS);
    const index = store.index('from_addr');

    return new Promise((resolve, reject) => {
      const request = index.getAll(fromAddr);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get xrefs by target address
   */
  async getXrefsTo(toAddr: number): Promise<DbXref[]> {
    await this.init();
    const transaction = this.db!.transaction(STORE_XREFS, 'readonly');
    const store = transaction.objectStore(STORE_XREFS);
    const index = store.index('to_addr');

    return new Promise((resolve, reject) => {
      const request = index.getAll(toAddr);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================================
  // Metadata Store Operations
  // ============================================================================

  /**
   * Save metadata value
   */
  async setMetadata(key: string, value: unknown): Promise<void> {
    await this.init();
    const transaction = this.db!.transaction(STORE_METADATA, 'readwrite');
    const store = transaction.objectStore(STORE_METADATA);

    return new Promise((resolve, reject) => {
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get metadata value
   */
  async getMetadata<T = unknown>(key: string): Promise<T | null> {
    await this.init();
    const transaction = this.db!.transaction(STORE_METADATA, 'readonly');
    const store = transaction.objectStore(STORE_METADATA);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result as DbMetadata | undefined;
        resolve(result ? (result.value as T) : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all metadata
   */
  async getAllMetadata(): Promise<Record<string, unknown>> {
    await this.init();
    const transaction = this.db!.transaction(STORE_METADATA, 'readonly');
    const store = transaction.objectStore(STORE_METADATA);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const entries = request.result as DbMetadata[];
        const metadata: Record<string, unknown> = {};
        entries.forEach(entry => {
          metadata[entry.key] = entry.value;
        });
        resolve(metadata);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================================
  // Export/Import Operations (.mdb file format)
  // ============================================================================

  /**
   * Export entire database to .mdb file (JSON blob)
   */
  async exportToMdb(): Promise<Blob> {
    await this.init();

    // Gather all data from all stores
    const [functions, comments, xrefs, metadata] = await Promise.all([
      this.getAllFunctions(),
      this.getAllComments(),
      this.getAllXrefs(),
      this.getAllMetadata(),
    ]);

    const exportData: MdbExport = {
      version: DB_VERSION,
      timestamp: Date.now(),
      metadata,
      functions,
      comments,
      xrefs,
    };

    // Convert to JSON blob
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    console.log('[AnalysisDB] Exported database:', {
      functions: functions.length,
      comments: comments.length,
      xrefs: xrefs.length,
      size: `${(blob.size / 1024).toFixed(2)} KB`,
    });

    return blob;
  }

  /**
   * Download database as .mdb file
   */
  async downloadMdb(filename: string = 'analysis.mdb'): Promise<void> {
    const blob = await this.exportToMdb();

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`[AnalysisDB] Downloaded database as ${filename}`);
  }

  /**
   * Import database from .mdb file (JSON blob)
   */
  async importFromMdb(blob: Blob): Promise<void> {
    await this.init();

    // Read and parse JSON
    const text = await blob.text();
    const data: MdbExport = JSON.parse(text);

    // Validate format
    if (!data.version || !data.functions || !data.comments || !data.xrefs || !data.metadata) {
      throw new Error('Invalid .mdb file format');
    }

    console.log('[AnalysisDB] Importing database:', {
      version: data.version,
      functions: data.functions.length,
      comments: data.comments.length,
      xrefs: data.xrefs.length,
    });

    // Clear existing data
    await this.clear();

    // Import all data
    await Promise.all([
      this.saveFunctions(data.functions),
      this.saveComments(data.comments),
      this.saveXrefs(data.xrefs),
      ...Object.entries(data.metadata).map(([key, value]) => this.setMetadata(key, value)),
    ]);

    console.log('[AnalysisDB] Database imported successfully');
  }

  /**
   * Upload and import .mdb file
   */
  async uploadMdb(file: File): Promise<void> {
    if (!file.name.endsWith('.mdb')) {
      throw new Error('File must have .mdb extension');
    }

    await this.importFromMdb(file);
  }

  /**
   * Check if database has any analysis data
   */
  async hasAnalysis(): Promise<boolean> {
    await this.init();
    const functions = await this.getAllFunctions();
    const xrefs = await this.getAllXrefs();
    return functions.length > 0 || xrefs.length > 0;
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    functions: number;
    comments: number;
    xrefs: number;
    lastModified: number | null;
  }> {
    await this.init();

    const [functions, comments, xrefs, lastModified] = await Promise.all([
      this.getAllFunctions(),
      this.getAllComments(),
      this.getAllXrefs(),
      this.getMetadata<number>('lastModified'),
    ]);

    return {
      functions: functions.length,
      comments: comments.length,
      xrefs: xrefs.length,
      lastModified,
    };
  }
}

/**
 * Global singleton instance
 */
let globalDb: AnalysisDatabase | null = null;

/**
 * Get or create the global database instance
 */
export function getAnalysisDatabase(): AnalysisDatabase {
  if (!globalDb) {
    globalDb = new AnalysisDatabase();
  }
  return globalDb;
}
