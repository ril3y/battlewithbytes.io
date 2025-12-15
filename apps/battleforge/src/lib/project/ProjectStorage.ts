/**
 * ProjectStorage - IndexedDB storage for BattleForge projects
 */

import type {
  Project,
  ProjectFile,
  ProjectListItem,
  ProjectPlatform,
} from "./types";

const DB_NAME = "battleforge_projects";
const DB_VERSION = 1;
const STORE_NAME = "projects";

export class ProjectStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB connection
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create projects store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "metadata.id",
          });
          store.createIndex("updatedAt", "metadata.updatedAt", {
            unique: false,
          });
          store.createIndex("name", "metadata.name", { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Ensure DB is initialized
   */
  private async ensureInit(): Promise<IDBDatabase> {
    await this.init();
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db;
  }

  /**
   * List all projects
   */
  async listProjects(): Promise<ProjectListItem[]> {
    const db = await this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const projects: Project[] = request.result || [];
        const items: ProjectListItem[] = projects.map((project) => ({
          id: project.metadata.id,
          name: project.metadata.name,
          updatedAt: project.metadata.updatedAt,
          platformId: project.platform?.platformId || null,
          deviceId: project.platform?.deviceId || null,
        }));

        // Sort by most recently updated
        items.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(items);
      };

      request.onerror = () => {
        reject(new Error("Failed to list projects"));
      };
    });
  }

  /**
   * Get a project by ID
   */
  async getProject(id: string): Promise<Project | null> {
    const db = await this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get project ${id}`));
      };
    });
  }

  /**
   * Save or update a project
   */
  async saveProject(project: Project): Promise<void> {
    const db = await this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      // Update timestamp
      project.metadata.updatedAt = Date.now();

      const request = store.put(project);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to save project ${project.metadata.id}`));
      };
    });
  }

  /**
   * Update an existing project
   */
  async updateProject(project: Project): Promise<void> {
    return this.saveProject(project);
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    const db = await this.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete project ${id}`));
      };
    });
  }

  /**
   * Create a new project with default structure
   */
  async createProject(
    name: string,
    templateFiles: ProjectFile[],
    platform: ProjectPlatform | null,
  ): Promise<Project> {
    const now = Date.now();
    const id = `project_${now}_${Math.random().toString(36).substr(2, 9)}`;

    const project: Project = {
      metadata: {
        id,
        name,
        createdAt: now,
        updatedAt: now,
      },
      platform,
      files: templateFiles,
    };

    await this.saveProject(project);
    return project;
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

// Singleton instance
let storageInstance: ProjectStorage | null = null;

/**
 * Get the singleton ProjectStorage instance
 */
export function getProjectStorage(): ProjectStorage {
  if (!storageInstance) {
    storageInstance = new ProjectStorage();
  }
  return storageInstance;
}
