'use client';

/**
 * Project Context - Global access to project management
 *
 * Provides centralized access to ProjectManager for saving/loading projects,
 * managing firmware cache, and tracking analysis metadata.
 */

import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { ProjectManager } from '../project/ProjectManager';

interface ProjectContextState {
  projectManager: ProjectManager;
}

const ProjectContext = createContext<ProjectContextState | undefined>(undefined);

/**
 * Project Context Provider
 */
export function ProjectProvider({
  children,
  projectManager,
}: {
  children: ReactNode;
  projectManager: ProjectManager;
}) {
  const projectManagerRef = useRef(projectManager);

  const value: ProjectContextState = {
    projectManager: projectManagerRef.current,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

/**
 * Hook to use project context
 */
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}

/**
 * Hook to check if project is available (without throwing)
 */
export function useProjectOptional() {
  return useContext(ProjectContext);
}
