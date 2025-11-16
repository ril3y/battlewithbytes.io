# BattleMagic Database API Reference

**For Agent 2 (IndexedDB Layer) and Agent 3 (UI Integration)**

## Quick Start

### What Was Implemented

Agent 1 has completed the Rust WASM database layer with:
- Complete schema definitions (metadata, functions, xrefs, comments, symbols, segments, vector table)
- JSON serialization/deserialization using serde_json
- Schema versioning and migration framework
- WASM API for export/import operations
- Full test coverage (12 tests passing)

### Your Tasks

**Agent 2:** Implement IndexedDB storage layer in TypeScript
**Agent 3:** Build UI for project management (save/load/list projects)

---

## WASM API (Agent 1 → Agent 2/3)

### Database Export/Import

```typescript
// Export database to JSON string
const jsonString: string = wasmAnalyzer.export_database();

// Import database from JSON string
wasmAnalyzer.import_database(jsonString);

// Get database statistics
const stats = wasmAnalyzer.get_database_stats();
// Returns: { xref_count, function_count, symbol_count, comment_count, ... }
```

### Project Metadata

```typescript
// Initialize metadata (call after analysis)
wasmAnalyzer.init_metadata(
  "My STM32 Project",  // project_name
  "ARM Cortex-M3",     // architecture
  0x8000000,           // base_address
  65536                // firmware_size
);

// Get metadata
const metadata = wasmAnalyzer.get_metadata();

// Set metadata (for editing)
wasmAnalyzer.set_metadata(metadata);
```

### Function Operations

```typescript
// Get function at address
const func = wasmAnalyzer.get_function(0x8000100);

// Rename function
wasmAnalyzer.rename_function(0x8000100, "my_custom_function");

// Get all functions
const allFunctions = wasmAnalyzer.get_all_functions();
```

### Comment Operations

```typescript
// Add comment
wasmAnalyzer.add_comment(
  0x8000100,           // address
  "This is a comment", // text
  "standard"           // type: "standard" | "repeatable" | "anterior" | "block"
);

// Get comment
const comment = wasmAnalyzer.get_comment(0x8000100);

// Delete comment
wasmAnalyzer.delete_comment(0x8000100);
```

### Symbol Operations

```typescript
// Add symbol
wasmAnalyzer.add_symbol(
  0x8000000,      // address
  "Reset_Handler", // name
  "function"       // type: "code" | "data" | "function" | "vector" | "import" | "export"
);

// Get symbol
const symbol = wasmAnalyzer.get_symbol(0x8000000);
```

---

## TypeScript Type Definitions (Agent 2)

Create this file: `apps/web/src/app/tools/battlemagic/lib/database-types.ts`

```typescript
/**
 * Database schema types matching Rust definitions
 */

export interface ProjectMetadata {
  schema_version: number;
  project_name: string;
  created_at: number;        // Unix timestamp (milliseconds)
  modified_at: number;       // Unix timestamp (milliseconds)
  architecture: string;      // e.g., "ARM Cortex-M3"
  base_address: number;
  firmware_size: number;
  entry_point: number | null;
  chip_id: string | null;
  description: string | null;
}

export interface FunctionEntry {
  address: number;
  name: string;
  name_is_user_defined: boolean;
  callers: number[];
  callees: number[];
  xref_count: number;
  size: number | null;
  signature: string | null;
  attributes: string[];
}

export enum SymbolType {
  Code = 'Code',
  Data = 'Data',
  Function = 'Function',
  VectorTable = 'VectorTable',
  Import = 'Import',
  Export = 'Export',
}

export interface Symbol {
  address: number;
  name: string;
  symbol_type: SymbolType;
  is_user_defined: boolean;
}

export enum CommentType {
  Standard = 'Standard',
  Repeatable = 'Repeatable',
  Anterior = 'Anterior',
  Block = 'Block',
}

export interface Comment {
  address: number;
  text: string;
  comment_type: CommentType;
  created_at: number;
  modified_at: number;
}

export interface MemorySegment {
  name: string;
  start_address: number;
  end_address: number;
  segment_type: 'Code' | 'Data' | 'Bss' | 'Rodata' | 'Peripheral' | 'Unknown';
  permissions: {
    read: boolean;
    write: boolean;
    execute: boolean;
  };
}

export interface VectorTableEntry {
  vector_number: number;
  handler_address: number;
  handler_name: string;
  is_valid: boolean;
}

export interface CrossReference {
  from_addr: number;
  to_addr: number;
  xref_type: 'Call' | 'Branch' | 'ConditionalBranch' | 'DataRead' | 'DataWrite';
  instruction: string;
  operands: string;
}

export interface XrefDatabaseExport {
  xrefs: CrossReference[];
}

export interface AnalysisDatabase {
  metadata: ProjectMetadata;
  xrefs: XrefDatabaseExport;
  functions: FunctionEntry[];
  symbols: Symbol[];
  comments: Comment[];
  segments: MemorySegment[];
  vector_table: VectorTableEntry[];
}

export interface DatabaseStats {
  xref_count: number;
  function_count: number;
  symbol_count: number;
  comment_count: number;
  segment_count: number;
  vector_table_size: number;
  estimated_size_bytes: number;
}
```

---

## IndexedDB Schema (Agent 2)

Create this file: `apps/web/src/app/tools/battlemagic/lib/storage/AnalysisDB.ts`

### Database Structure

```typescript
const DB_NAME = 'battlemagic-analysis';
const DB_VERSION = 1;

// Object Stores:
// 1. "projects" - List of all projects (metadata only)
// 2. "analysis" - Full analysis data (one per project)
```

### Schema Definition

```typescript
interface ProjectEntry {
  id: string;              // UUID
  metadata: ProjectMetadata;
  lastAccessed: number;    // Unix timestamp
}

interface AnalysisEntry {
  projectId: string;       // Foreign key to projects.id
  database: AnalysisDatabase;
}
```

### IndexedDB API Implementation

```typescript
export class AnalysisDB {
  private db: IDBDatabase | null = null;

  /**
   * Open database connection
   */
  async open(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;

        // Create projects store
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('by-name', 'metadata.project_name');
        projectStore.createIndex('by-modified', 'metadata.modified_at');

        // Create analysis store
        const analysisStore = db.createObjectStore('analysis', { keyPath: 'projectId' });
        analysisStore.createIndex('by-project', 'projectId');
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save project to IndexedDB
   */
  async saveProject(projectId: string, database: AnalysisDatabase): Promise<void> {
    if (!this.db) throw new Error('Database not opened');

    const tx = this.db.transaction(['projects', 'analysis'], 'readwrite');

    // Save metadata to projects store
    const projectEntry: ProjectEntry = {
      id: projectId,
      metadata: database.metadata,
      lastAccessed: Date.now(),
    };
    tx.objectStore('projects').put(projectEntry);

    // Save full database to analysis store
    const analysisEntry: AnalysisEntry = {
      projectId,
      database,
    };
    tx.objectStore('analysis').put(analysisEntry);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Load project from IndexedDB
   */
  async loadProject(projectId: string): Promise<AnalysisDatabase | null> {
    if (!this.db) throw new Error('Database not opened');

    const tx = this.db.transaction('analysis', 'readonly');
    const request = tx.objectStore('analysis').get(projectId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const entry = request.result as AnalysisEntry | undefined;
        resolve(entry?.database || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * List all projects (metadata only, sorted by modified date)
   */
  async listProjects(): Promise<ProjectEntry[]> {
    if (!this.db) throw new Error('Database not opened');

    const tx = this.db.transaction('projects', 'readonly');
    const store = tx.objectStore('projects');
    const index = store.index('by-modified');
    const request = index.openCursor(null, 'prev'); // Newest first

    const projects: ProjectEntry[] = [];

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          projects.push(cursor.value);
          cursor.continue();
        } else {
          resolve(projects);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete project and all associated data
   */
  async deleteProject(projectId: string): Promise<void> {
    if (!this.db) throw new Error('Database not opened');

    const tx = this.db.transaction(['projects', 'analysis'], 'readwrite');
    tx.objectStore('projects').delete(projectId);
    tx.objectStore('analysis').delete(projectId);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Clear all data (for testing)
   */
  async clear(): Promise<void> {
    if (!this.db) throw new Error('Database not opened');

    const tx = this.db.transaction(['projects', 'analysis'], 'readwrite');
    tx.objectStore('projects').clear();
    tx.objectStore('analysis').clear();

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
```

---

## Usage Examples (Agent 3)

### Save Current Project

```typescript
import { AnalysisDB } from '../lib/storage/AnalysisDB';
import { v4 as uuidv4 } from 'uuid';

async function saveCurrentProject() {
  try {
    // Generate or use existing project ID
    const projectId = currentProjectId || uuidv4();

    // Export from WASM
    const jsonString = wasmAnalyzer.export_database();
    const database: AnalysisDatabase = JSON.parse(jsonString);

    // Save to IndexedDB
    const db = new AnalysisDB();
    await db.open();
    await db.saveProject(projectId, database);

    setCurrentProjectId(projectId);
    showNotification('Project saved successfully');
  } catch (error) {
    console.error('Failed to save project:', error);
    showError('Failed to save project');
  }
}
```

### Load Project

```typescript
async function loadProject(projectId: string) {
  try {
    const db = new AnalysisDB();
    await db.open();

    const database = await db.loadProject(projectId);
    if (!database) {
      showError('Project not found');
      return;
    }

    // Import into WASM
    const jsonString = JSON.stringify(database);
    wasmAnalyzer.import_database(jsonString);

    // Update UI
    setCurrentProjectId(projectId);
    setProjectName(database.metadata.project_name);
    showNotification('Project loaded successfully');
  } catch (error) {
    console.error('Failed to load project:', error);
    showError('Failed to load project');
  }
}
```

### List Projects (for Project Manager UI)

```typescript
async function refreshProjectList() {
  const db = new AnalysisDB();
  await db.open();

  const projects = await db.listProjects();

  setProjectList(projects.map(p => ({
    id: p.id,
    name: p.metadata.project_name,
    architecture: p.metadata.architecture,
    lastModified: new Date(p.metadata.modified_at),
    lastAccessed: new Date(p.lastAccessed),
  })));
}
```

### Auto-Save Every 5 Minutes

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    if (isAnalyzed() && currentProjectId) {
      saveCurrentProject().catch(console.error);
    }
  }, 5 * 60 * 1000); // 5 minutes

  return () => clearInterval(interval);
}, [currentProjectId]);
```

---

## Error Handling

### Common Errors

```typescript
try {
  await db.saveProject(projectId, database);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    showError('Storage quota exceeded. Please delete old projects.');
  } else if (error.name === 'VersionError') {
    showError('Database version conflict. Please refresh the page.');
  } else {
    showError('Failed to save project: ' + error.message);
  }
}
```

---

## Testing Strategy

### Unit Tests (Agent 2)

```typescript
describe('AnalysisDB', () => {
  let db: AnalysisDB;

  beforeEach(async () => {
    db = new AnalysisDB();
    await db.open();
    await db.clear();
  });

  test('save and load project', async () => {
    const projectId = 'test-project';
    const database: AnalysisDatabase = createTestDatabase();

    await db.saveProject(projectId, database);
    const loaded = await db.loadProject(projectId);

    expect(loaded).not.toBeNull();
    expect(loaded!.metadata.project_name).toBe(database.metadata.project_name);
  });

  test('list projects', async () => {
    await db.saveProject('proj1', createTestDatabase('Project 1'));
    await db.saveProject('proj2', createTestDatabase('Project 2'));

    const projects = await db.listProjects();
    expect(projects).toHaveLength(2);
  });

  test('delete project', async () => {
    const projectId = 'test-project';
    await db.saveProject(projectId, createTestDatabase());
    await db.deleteProject(projectId);

    const loaded = await db.loadProject(projectId);
    expect(loaded).toBeNull();
  });
});
```

---

## Performance Considerations

### Database Size Estimates

For a typical 64KB STM32 firmware:
- Uncompressed JSON: ~500-600 KB
- With gzip compression: ~100-150 KB
- IndexedDB quota: Usually 50MB+ (plenty of space)

### Optimization Tips

1. **Use transactions**: Batch multiple operations for better performance
2. **Index strategically**: Only index fields used in queries (we index by name and modified date)
3. **Compression (optional)**: For very large databases, apply gzip compression before storing
4. **Lazy loading**: Only load project list initially, load full database on demand

---

## Next Steps

### Agent 2 Checklist

- [ ] Create `database-types.ts` with TypeScript interfaces
- [ ] Implement `AnalysisDB` class with all methods
- [ ] Add error handling for quota exceeded, version conflicts
- [ ] Write unit tests for IndexedDB operations
- [ ] Document API for Agent 3

### Agent 3 Checklist

- [ ] Create Project Manager component (list, open, delete)
- [ ] Add "Save Project" button in toolbar
- [ ] Implement "Load Project" dialog
- [ ] Add auto-save every 5 minutes
- [ ] Add import/export features (download/upload .json)
- [ ] Show database statistics in UI

---

## Support

If you encounter issues:
1. Check browser console for detailed error messages
2. Verify WASM analyzer is loaded: `wasmAnalyzer !== null`
3. Test serialization round-trip: export → parse → stringify → import
4. Check IndexedDB in DevTools → Application → IndexedDB

**Reference Documentation:**
- Full design: `DATABASE_DESIGN.md`
- Rust source: `packages/battlemagic-analyzer/src/database.rs`
- WASM API: `packages/battlemagic-analyzer/src/lib.rs` (lines 155-453)
