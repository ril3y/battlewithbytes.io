/**
 * Project State Hook
 *
 * Manages project metadata, save state, and auto-save settings
 */

import { useState, useRef, useEffect } from "react";
import { ProjectManager } from "../../../lib/project/ProjectManager";
import { MemoryRegion } from "../../../lib/memory/MemoryMapParser";
import { Breakpoint } from "../../BreakpointsManager";

export interface ProjectCallbacks {
  onProjectLoaded?: (
    name: string,
    baudRate: number,
    cpu: string,
    regions: MemoryRegion[],
    breakpoints: Breakpoint[],
  ) => void;
  onProjectSaved?: (name: string) => void;
  onAutoSaveToggled?: (enabled: boolean) => void;
  addGdbOutput?: (message: string) => void;
}

export interface ProjectState {
  // State
  projectManager: ProjectManager | null;
  projectName: string;
  hasUnsavedChanges: boolean;
  autoSaveEnabled: boolean;
  lastUpdate: Date;

  // Setters
  setProjectName: (name: string) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setLastUpdate: (date: Date) => void;
}

export function useProjectState(
  callbacks: ProjectCallbacks = {},
): ProjectState {
  const [projectName, setProjectName] = useState("Untitled Project");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const projectManagerRef = useRef<ProjectManager | null>(null);
  const callbacksRef = useRef(callbacks);

  // Keep callbacks ref up to date without triggering re-initialization
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Initialize project manager on mount (only once)
  useEffect(() => {
    const projectManager = new ProjectManager({
      onProjectLoaded: (project) => {
        console.log("Project loaded:", project.metadata.name);
        setProjectName(project.metadata.name);
        setHasUnsavedChanges(false);

        callbacksRef.current.addGdbOutput?.(
          `[Project loaded: ${project.metadata.name}]`,
        );
        callbacksRef.current.onProjectLoaded?.(
          project.metadata.name,
          project.gdbSettings.baudRate,
          project.memoryMap.selectedCpu,
          project.memoryMap.customRegions,
          project.breakpoints,
        );
      },
      onProjectSaved: (project) => {
        console.log("Project saved:", project.metadata.name);
        setHasUnsavedChanges(false);
        callbacksRef.current.addGdbOutput?.(
          `[Project saved: ${project.metadata.name}]`,
        );
        callbacksRef.current.onProjectSaved?.(project.metadata.name);
      },
      onAutoSaveToggled: (enabled) => {
        setAutoSaveEnabled(enabled);
        callbacksRef.current.onAutoSaveToggled?.(enabled);
      },
    });

    projectManagerRef.current = projectManager;

    // Load project from localStorage if it exists
    const loaded = projectManager.loadFromLocalStorage();
    if (loaded) {
      console.log("[ProjectState] Loaded project from localStorage");
    } else {
      console.log(
        "[ProjectState] No saved project found, starting with new project",
      );
    }

    // Start auto-save if enabled
    if (projectManager.isAutoSaveEnabled()) {
      projectManager.startAutoSave();
      console.log("[ProjectState] Auto-save started");
    }

    // Cleanup on unmount
    return () => {
      projectManager.stopAutoSave();
      projectManager.destroy();
      projectManagerRef.current = null;
    };
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // State
    projectManager: projectManagerRef.current,
    projectName,
    hasUnsavedChanges,
    autoSaveEnabled,
    lastUpdate,

    // Setters
    setProjectName,
    setHasUnsavedChanges,
    setAutoSaveEnabled,
    setLastUpdate,
  };
}
