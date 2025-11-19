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
const DB_VERSION = 4; // Updated to fix comment storage (composite key: address + comment_type)

// Object store names
export const STORE_FUNCTIONS = 'functions';
export const STORE_COMMENTS = 'comments';
export const STORE_XREFS = 'xrefs';
export const STORE_METADATA = 'metadata';
export const STORE_VECTOR_TABLE = 'vector_table';

/**
 * Function entry in database
 */
export interface DbFunction {
  address: number;           // Primary key
  name: string;              // Function name (sub_1000 or user-renamed)
  callers: number[];         // Addresses that call this function
  callees: number[];         // Addresses this function calls
  xref_count: number;        // Total xrefs to this function
  is_user_renamed?: boolean; // True if user manually renamed this function
}

/**
 * Vector table entry in database
 */
export interface DbVectorTableEntry {
  vector_number: number;     // Primary key
  handler_address: number;   // Handler function address
  handler_name: string;      // Handler name (can be user-renamed)
  is_valid: boolean;         // Whether this vector is valid
}

/**
 * Comment type enum matching IDA Pro conventions
 */
export type CommentType = 'standard' | 'repeatable' | 'anterior' | 'block';

/**
 * Comment entry in database
 */
export interface DbComment {
  id: string;                // Primary key (composite: `${address}_${comment_type}`)
  address: number;           // Address of the comment
  text: string;              // Comment text
  comment_type: CommentType; // Comment type (standard, repeatable, anterior, block)
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
  vector_table?: DbVectorTableEntry[];
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
        const oldVersion = (event as IDBVersionChangeEvent).oldVersion;
        console.log('[AnalysisDB] Upgrading database schema from version', oldVersion, 'to', DB_VERSION);

        // Create object stores (for new databases)
        if (!db.objectStoreNames.contains(STORE_FUNCTIONS)) {
          const functionsStore = db.createObjectStore(STORE_FUNCTIONS, { keyPath: 'address' });
          functionsStore.createIndex('name', 'name', { unique: false });
          console.log('[AnalysisDB] Created functions store');
        }

        if (!db.objectStoreNames.contains(STORE_COMMENTS)) {
          const commentsStore = db.createObjectStore(STORE_COMMENTS, { keyPath: 'id' });
          commentsStore.createIndex('address', 'address', { unique: false });
          commentsStore.createIndex('timestamp', 'timestamp', { unique: false });
          commentsStore.createIndex('comment_type', 'comment_type', { unique: false });
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

        if (!db.objectStoreNames.contains(STORE_VECTOR_TABLE)) {
          const vectorTableStore = db.createObjectStore(STORE_VECTOR_TABLE, { keyPath: 'vector_number' });
          vectorTableStore.createIndex('handler_address', 'handler_address', { unique: false });
          vectorTableStore.createIndex('is_valid', 'is_valid', { unique: false });
          console.log('[AnalysisDB] Created vector_table store');
        }

        // Migration from v1 to v2: Add comment_type field to existing comments
        if (oldVersion < 2 && oldVersion >= 1) {
          console.log('[AnalysisDB] Migrating comments to v2 schema (adding comment_type)');
          const transaction = (event.target as IDBOpenDBRequest).transaction!;
          const commentsStore = transaction.objectStore(STORE_COMMENTS);

          // Add comment_type index if upgrading from v1
          if (!commentsStore.indexNames.contains('comment_type')) {
            commentsStore.createIndex('comment_type', 'comment_type', { unique: false });
          }

          // Migrate existing comments to have 'standard' type
          const cursorRequest = commentsStore.openCursor();
          cursorRequest.onsuccess = (e) => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
              const comment = cursor.value;
              if (!comment.comment_type) {
                comment.comment_type = 'standard';
                cursor.update(comment);
              }
              cursor.continue();
            }
          };
        }

        // Migration from v3 to v4: Recreate comments store with composite key
        if (oldVersion < 4 && oldVersion >= 1) {
          console.log('[AnalysisDB] Migrating comments to v4 schema (composite key: address + comment_type)');
          const transaction = (event.target as IDBOpenDBRequest).transaction!;

          // Read all existing comments before deleting the store
          const oldCommentsStore = transaction.objectStore(STORE_COMMENTS);
          const existingComments: Array<{address: number; text: string; comment_type: CommentType; timestamp: number}> = [];

          const readRequest = oldCommentsStore.openCursor();
          readRequest.onsuccess = (e) => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
              const comment = cursor.value;
              existingComments.push({
                address: comment.address,
                text: comment.text,
                comment_type: comment.comment_type || 'standard',
                timestamp: comment.timestamp || Date.now(),
              });
              cursor.continue();
            } else {
              // All comments read, now recreate the store
              console.log(`[AnalysisDB] Read ${existingComments.length} existing comments`);

              // Delete old comments store
              if (db.objectStoreNames.contains(STORE_COMMENTS)) {
                db.deleteObjectStore(STORE_COMMENTS);
              }

              // Create new comments store with composite key
              const commentsStore = db.createObjectStore(STORE_COMMENTS, { keyPath: 'id' });
              commentsStore.createIndex('address', 'address', { unique: false });
              commentsStore.createIndex('timestamp', 'timestamp', { unique: false });
              commentsStore.createIndex('comment_type', 'comment_type', { unique: false });

              // Migrate existing comments to new schema
              existingComments.forEach(comment => {
                const newComment: DbComment = {
                  id: `${comment.address}_${comment.comment_type}`,
                  address: comment.address,
                  text: comment.text,
                  comment_type: comment.comment_type,
                  timestamp: comment.timestamp,
                };
                commentsStore.add(newComment);
              });

              console.log(`[AnalysisDB] Migrated ${existingComments.length} comments to v4 schema`);
            }
          };
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
   * Get a comment by address and type
   */
  async getComment(address: number, commentType: CommentType = 'standard'): Promise<DbComment | null> {
    await this.init();
    const transaction = this.db!.transaction(STORE_COMMENTS, 'readonly');
    const store = transaction.objectStore(STORE_COMMENTS);
    const id = `${address}_${commentType}`;

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all comments at a specific address
   */
  async getCommentsAtAddress(address: number): Promise<DbComment[]> {
    await this.init();
    const transaction = this.db!.transaction(STORE_COMMENTS, 'readonly');
    const store = transaction.objectStore(STORE_COMMENTS);
    const index = store.index('address');

    return new Promise((resolve, reject) => {
      const request = index.getAll(address);
      request.onsuccess = () => resolve(request.result);
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
   * Delete a comment by address and type
   */
  async deleteComment(address: number, commentType: CommentType = 'standard'): Promise<void> {
    await this.init();
    const transaction = this.db!.transaction(STORE_COMMENTS, 'readwrite');
    const store = transaction.objectStore(STORE_COMMENTS);
    const id = `${address}_${commentType}`;

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
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
  // Vector Table Store Operations
  // ============================================================================

  /**
   * Save vector table entries (batch operation)
   */
  async saveVectorTable(entries: DbVectorTableEntry[]): Promise<void> {
    await this.init();
    const transaction = this.db!.transaction(STORE_VECTOR_TABLE, 'readwrite');
    const store = transaction.objectStore(STORE_VECTOR_TABLE);

    return new Promise((resolve, reject) => {
      let pending = entries.length;
      if (pending === 0) {
        resolve();
        return;
      }

      entries.forEach(entry => {
        const request = store.put(entry);
        request.onsuccess = () => {
          pending--;
          if (pending === 0) resolve();
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * Get all vector table entries
   */
  async getAllVectorTableEntries(): Promise<DbVectorTableEntry[]> {
    await this.init();
    const transaction = this.db!.transaction(STORE_VECTOR_TABLE, 'readonly');
    const store = transaction.objectStore(STORE_VECTOR_TABLE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get vector table entry by vector number
   */
  async getVectorTableEntry(vectorNum: number): Promise<DbVectorTableEntry | null> {
    await this.init();
    const transaction = this.db!.transaction(STORE_VECTOR_TABLE, 'readonly');
    const store = transaction.objectStore(STORE_VECTOR_TABLE);

    return new Promise((resolve, reject) => {
      const request = store.get(vectorNum);
      request.onsuccess = () => resolve(request.result || null);
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

  // ============================================================================
  // User Data Preservation (for re-analysis)
  // ============================================================================

  /**
   * Get all user-renamed functions
   * These should be preserved when re-analyzing firmware
   */
  async getUserRenamedFunctions(): Promise<Map<number, string>> {
    await this.init();
    const allFunctions = await this.getAllFunctions();
    const userRenamed = new Map<number, string>();

    allFunctions.forEach(func => {
      if (func.is_user_renamed) {
        userRenamed.set(func.address, func.name);
      }
    });

    return userRenamed;
  }

  /**
   * Clear auto-generated data (xrefs, loops, stack analysis)
   * Preserves user data (comments, function renames)
   */
  async clearAutoGeneratedData(): Promise<void> {
    await this.init();
    const transaction = this.db!.transaction(
      [STORE_XREFS, STORE_VECTOR_TABLE, STORE_FUNCTIONS],
      'readwrite'
    );

    await Promise.all([
      this.clearStore(transaction.objectStore(STORE_XREFS)),
      this.clearStore(transaction.objectStore(STORE_VECTOR_TABLE)),
      this.clearStore(transaction.objectStore(STORE_FUNCTIONS)),
    ]);

    console.log('[AnalysisDB] Cleared auto-generated data (xrefs, vector table, functions)');
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
