"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProjectManager = any;

interface ProjectContextType {
  projectName: string | null;
  setProjectName: (name: string | null) => void;
  projectManager: ProjectManager | null;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

interface ProjectProviderProps {
  children: ReactNode;
  projectManager?: ProjectManager | null;
}

export function ProjectProvider({ children, projectManager = null }: ProjectProviderProps) {
  const [projectName, setProjectName] = useState<string | null>(null);

  return (
    <ProjectContext.Provider value={{ projectName, setProjectName, projectManager }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

export function useProjectOptional() {
  return useContext(ProjectContext);
}
