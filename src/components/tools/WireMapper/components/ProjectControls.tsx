'use client';

import React from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { WireMapperProject } from '../types';
import { openPrintView } from '../utils/printUtils';

interface ProjectControlsProps {
  onNewConnector: () => void;
}

export const ProjectControls: React.FC<ProjectControlsProps> = ({ onNewConnector }) => {
  const { projectName, setProjectName, saveProject, loadProject, clearProject, connectors, mappings } = useWireMapperStore();

  const handleExport = () => {
    const projectData = saveProject();
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_wiremapper.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const projectData = JSON.parse(content) as WireMapperProject;
        loadProject(projectData);
      } catch (error) {
        console.error('Failed to parse JSON file:', error);
        alert('Invalid project file format');
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    e.target.value = '';
  };

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  const handleClearProject = () => {
    if (confirm('Are you sure you want to clear the current project? This action cannot be undone.')) {
      clearProject();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          value={projectName}
          onChange={handleProjectNameChange}
          placeholder="Project Name"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onNewConnector}
          className="px-3 py-2 bg-gray-800 text-green-400 rounded hover:bg-gray-700 transition"
        >
          Add Connector
        </button>
        
        <button
          onClick={handleExport}
          className="px-3 py-2 bg-gray-800 text-blue-400 rounded hover:bg-gray-700 transition"
        >
          Export
        </button>
        
        <label className="px-3 py-2 bg-gray-800 text-purple-400 rounded hover:bg-gray-700 transition cursor-pointer">
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
        
        <button
          onClick={() => openPrintView(connectors, mappings)}
          className="px-3 py-2 bg-gray-800 text-green-400 rounded hover:bg-gray-700 transition"
        >
          Print
        </button>
        
        <button
          onClick={handleClearProject}
          className="px-3 py-2 bg-gray-800 text-red-400 rounded hover:bg-gray-700 transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
