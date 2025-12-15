"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import type {
  Project,
  ProjectListItem,
  ProjectTemplate,
  ProjectPlatform,
} from "./types";
import { ProjectStorage } from "./ProjectStorage";

interface ProjectContextType {
  // Current project
  currentProject: Project | null;
  isLoading: boolean;

  // Project operations
  createProject: (
    template: ProjectTemplate,
    name: string,
    platform: ProjectPlatform | null,
  ) => Promise<Project>;
  openProject: (id: string) => Promise<void>;
  saveProject: (updates?: Partial<Project>) => Promise<void>;
  closeProject: () => void;

  // Project list
  projects: ProjectListItem[];
  refreshProjects: () => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storage] = useState(() => new ProjectStorage());

  /**
   * Refresh the project list from storage
   */
  const refreshProjects = useCallback(async () => {
    try {
      const projectList = await storage.listProjects();
      setProjects(projectList);
    } catch (error) {
      console.error("Failed to refresh projects:", error);
      throw error;
    }
  }, [storage]);

  // Initialize storage and load project list on mount
  useEffect(() => {
    const initStorage = async () => {
      try {
        setIsLoading(true);
        await storage.init();
        await refreshProjects();
      } catch (error) {
        console.error("Failed to initialize project storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initStorage();

    // Cleanup on unmount
    return () => {
      storage.close();
    };
  }, [storage, refreshProjects]);

  /**
   * Create a new project from a template
   */
  const createProject = useCallback(
    async (
      template: ProjectTemplate,
      name: string,
      platform: ProjectPlatform | null,
    ): Promise<Project> => {
      try {
        setIsLoading(true);

        // Use template platform preset if no platform specified
        const projectPlatform =
          platform ||
          (template.platformPreset
            ? {
                platformId: template.platformPreset.platformId,
                familyId: template.platformPreset.familyId,
                deviceId: template.platformPreset.deviceId,
                architecture: "", // Will be filled in by platform selector
              }
            : null);

        // Create project in storage
        const project = await storage.createProject(
          name,
          template.files,
          projectPlatform,
        );

        // Log project creation details
        const platformInfo = projectPlatform
          ? `${projectPlatform.platformId}/${projectPlatform.familyId}/${projectPlatform.deviceId}`
          : "none";
        const boardInfo = projectPlatform?.boardId || "generic";

        console.log(`[BattleForge] Project created: "${name}"`, {
          id: project.metadata.id,
          template: template.id,
          platform: platformInfo,
          board: boardInfo,
          architecture: projectPlatform?.architecture || "unknown",
          files: project.files.length,
        });

        // Set as current project
        setCurrentProject(project);

        // Refresh project list
        await refreshProjects();

        return project;
      } catch (error) {
        console.error("Failed to create project:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [storage, refreshProjects],
  );

  /**
   * Open an existing project
   */
  const openProject = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        const project = await storage.getProject(id);

        if (!project) {
          throw new Error(`Project ${id} not found`);
        }

        setCurrentProject(project);
      } catch (error) {
        console.error("Failed to open project:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [storage],
  );

  /**
   * Save the current project with optional updates
   */
  const saveProject = useCallback(
    async (updates?: Partial<Project>) => {
      if (!currentProject) {
        throw new Error("No project is currently open");
      }

      try {
        const updatedProject = updates
          ? { ...currentProject, ...updates }
          : currentProject;

        await storage.saveProject(updatedProject);
        setCurrentProject(updatedProject);

        // Refresh project list to update metadata
        await refreshProjects();
      } catch (error) {
        console.error("Failed to save project:", error);
        throw error;
      }
    },
    [currentProject, storage, refreshProjects],
  );

  /**
   * Close the current project
   */
  const closeProject = useCallback(() => {
    setCurrentProject(null);
  }, []);

  /**
   * Delete a project
   */
  const deleteProject = useCallback(
    async (id: string) => {
      try {
        await storage.deleteProject(id);

        // If this is the current project, close it
        if (currentProject?.metadata.id === id) {
          setCurrentProject(null);
        }

        // Refresh project list
        await refreshProjects();
      } catch (error) {
        console.error("Failed to delete project:", error);
        throw error;
      }
    },
    [storage, currentProject, refreshProjects],
  );

  const value: ProjectContextType = {
    currentProject,
    isLoading,
    createProject,
    openProject,
    saveProject,
    closeProject,
    projects,
    refreshProjects,
    deleteProject,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

/**
 * Hook to access project context
 */
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within ProjectProvider");
  }
  return context;
}
