'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectState {
  chip: string;
  sourceCode: string;
  compiledBinary: Uint8Array | null;
}

interface ProjectContextType {
  project: ProjectState;
  setChip: (chip: string) => void;
  setSourceCode: (code: string) => void;
  setCompiledBinary: (binary: Uint8Array | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<ProjectState>({
    chip: 'STM32F103C8T6',
    sourceCode: '',
    compiledBinary: null,
  });

  const setChip = (chip: string) => {
    setProject(prev => ({ ...prev, chip }));
  };

  const setSourceCode = (code: string) => {
    setProject(prev => ({ ...prev, sourceCode: code }));
  };

  const setCompiledBinary = (binary: Uint8Array | null) => {
    setProject(prev => ({ ...prev, compiledBinary: binary }));
  };

  return (
    <ProjectContext.Provider value={{ project, setChip, setSourceCode, setCompiledBinary }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
