/**
 * Project Manager
 *
 * Handles saving, loading, and managing BattleMagic debugging projects
 */

import {
  BattleMagicProject,
  createNewProject,
  isValidProject,
  migrateProject,
  PROJECT_FORMAT_VERSION
} from './types';

const LOCALSTORAGE_KEY = 'battlemagic_current_project';
const AUTOSAVE_LOCALSTORAGE_KEY = 'battlemagic_autosave_enabled';

export interface ProjectManagerCallbacks {
  onProjectLoaded?: (project: BattleMagicProject) => void;
  onProjectSaved?: (project: BattleMagicProject) => void;
  onAutoSaveToggled?: (enabled: boolean) => void;
  onError?: (message: string) => void;
}

export class ProjectManager {
  private currentProject: BattleMagicProject;
  private callbacks: ProjectManagerCallbacks;
  private autoSaveEnabled: boolean = true;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private hasUnsavedChanges: boolean = false;

  constructor(callbacks: ProjectManagerCallbacks = {}) {
    this.callbacks = callbacks;
    this.currentProject = createNewProject();

    // Load autosave preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(AUTOSAVE_LOCALSTORAGE_KEY);
      this.autoSaveEnabled = saved === null ? true : saved === 'true';
    }
  }

  /**
   * Get the current project
   */
  getCurrentProject(): BattleMagicProject {
    return this.currentProject;
  }

  /**
   * Update the current project
   */
  updateProject(updates: Partial<BattleMagicProject>): void {
    this.currentProject = {
      ...this.currentProject,
      ...updates,
      metadata: {
        ...this.currentProject.metadata,
        ...updates.metadata,
        lastModified: new Date().toISOString()
      }
    };
    this.hasUnsavedChanges = true;
  }

  /**
   * Update project metadata
   */
  updateMetadata(name?: string, description?: string): void {
    this.currentProject.metadata = {
      ...this.currentProject.metadata,
      name: name ?? this.currentProject.metadata.name,
      description: description ?? this.currentProject.metadata.description,
      lastModified: new Date().toISOString()
    };
    this.hasUnsavedChanges = true;
  }

  /**
   * Check if there are unsaved changes
   */
  hasChanges(): boolean {
    return this.hasUnsavedChanges;
  }

  /**
   * Mark changes as saved
   */
  markAsSaved(): void {
    this.hasUnsavedChanges = false;
  }

  /**
   * Create a new project
   */
  newProject(name: string = 'Untitled Project'): BattleMagicProject {
    this.currentProject = createNewProject(name);
    this.hasUnsavedChanges = false;

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCALSTORAGE_KEY);
    }

    return this.currentProject;
  }

  /**
   * Save project to file (download)
   */
  saveToFile(): void {
    try {
      const json = JSON.stringify(this.currentProject, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.sanitizeFilename(this.currentProject.metadata.name)}.bmproj`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.hasUnsavedChanges = false;
      this.callbacks.onProjectSaved?.(this.currentProject);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.callbacks.onError?.(`Failed to save project: ${message}`);
    }
  }

  /**
   * Load project from file
   */
  async loadFromFile(file: File): Promise<void> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!isValidProject(data)) {
        throw new Error('Invalid project file format');
      }

      // Migrate if needed
      let project = data;
      if (project.metadata.version < PROJECT_FORMAT_VERSION) {
        project = migrateProject(project);
      }

      this.currentProject = project;
      this.hasUnsavedChanges = false;
      this.callbacks.onProjectLoaded?.(this.currentProject);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.callbacks.onError?.(`Failed to load project: ${message}`);
      throw error;
    }
  }

  /**
   * Save project to localStorage
   */
  saveToLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const json = JSON.stringify(this.currentProject);
      localStorage.setItem(LOCALSTORAGE_KEY, json);
      this.hasUnsavedChanges = false;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.callbacks.onError?.(`Failed to save to localStorage: ${message}`);
    }
  }

  /**
   * Load project from localStorage
   */
  loadFromLocalStorage(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const json = localStorage.getItem(LOCALSTORAGE_KEY);
      if (!json) return false;

      const data = JSON.parse(json);
      if (!isValidProject(data)) {
        console.warn('Invalid project in localStorage, clearing...');
        localStorage.removeItem(LOCALSTORAGE_KEY);
        return false;
      }

      // Migrate if needed
      let project = data;
      if (project.metadata.version < PROJECT_FORMAT_VERSION) {
        project = migrateProject(project);
      }

      this.currentProject = project;
      this.hasUnsavedChanges = false;
      this.callbacks.onProjectLoaded?.(this.currentProject);
      return true;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      localStorage.removeItem(LOCALSTORAGE_KEY);
      return false;
    }
  }

  /**
   * Enable or disable auto-save
   */
  setAutoSave(enabled: boolean): void {
    this.autoSaveEnabled = enabled;

    // Save preference
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTOSAVE_LOCALSTORAGE_KEY, String(enabled));
    }

    // Start or stop auto-save interval
    if (enabled) {
      this.startAutoSave();
    } else {
      this.stopAutoSave();
    }

    this.callbacks.onAutoSaveToggled?.(enabled);
  }

  /**
   * Check if auto-save is enabled
   */
  isAutoSaveEnabled(): boolean {
    return this.autoSaveEnabled;
  }

  /**
   * Start auto-save interval (30 seconds)
   */
  startAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      if (this.hasUnsavedChanges) {
        this.saveToLocalStorage();
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop auto-save interval
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Export project data as JSON string
   */
  exportAsJson(): string {
    return JSON.stringify(this.currentProject, null, 2);
  }

  /**
   * Import project from JSON string
   */
  importFromJson(json: string): void {
    try {
      const data = JSON.parse(json);

      if (!isValidProject(data)) {
        throw new Error('Invalid project format');
      }

      // Migrate if needed
      let project = data;
      if (project.metadata.version < PROJECT_FORMAT_VERSION) {
        project = migrateProject(project);
      }

      this.currentProject = project;
      this.hasUnsavedChanges = false;
      this.callbacks.onProjectLoaded?.(this.currentProject);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.callbacks.onError?.(`Failed to import project: ${message}`);
      throw error;
    }
  }

  /**
   * Sanitize filename for safe file download
   */
  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-z0-9_\-]/gi, '_')
      .replace(/_+/g, '_')
      .substring(0, 50) || 'project';
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopAutoSave();
  }
}
