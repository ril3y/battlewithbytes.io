"use client";

import React from "react";
import { useWireMapperStore } from "../store/useWireMapperStore";
import { WireMapperProject } from "../types";
import { openPrintView } from "../utils/printUtils";

interface ProjectControlsProps {
  onNewConnector: () => void;
}

export const ProjectControls: React.FC<ProjectControlsProps> = ({
  onNewConnector,
}) => {
  const {
    projectName,
    setProjectName,
    saveProject,
    loadProject,
    clearProject,
    connectors,
    mappings,
  } = useWireMapperStore();

  const handleExport = () => {
    const projectData = saveProject();
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "_")}_wiremapper.json`;
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
        console.error("Failed to parse JSON file:", error);
        alert("Invalid project file format");
      }
    };
    reader.readAsText(file);

    // Reset the file input
    e.target.value = "";
  };

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  const handleClearProject = () => {
    if (
      confirm(
        "Are you sure you want to clear the current project? This action cannot be undone.",
      )
    ) {
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

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onNewConnector}
          className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-800 text-green-400 rounded hover:bg-gray-700 transition text-xs sm:text-base whitespace-nowrap"
        >
          <span className="hidden sm:inline">Add Connector</span>
          <span className="sm:hidden">Add</span>
        </button>

        <button
          onClick={handleExport}
          className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-800 text-blue-400 rounded hover:bg-gray-700 transition text-xs sm:text-base whitespace-nowrap"
        >
          Export
        </button>

        <label className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-800 text-purple-400 rounded hover:bg-gray-700 transition cursor-pointer text-xs sm:text-base whitespace-nowrap">
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        <button
          onClick={() => {
            // Try to capture the wiring diagram if it's currently displayed
            const diagramElement = document.querySelector(
              "[data-wiring-diagram]",
            );
            let diagramHTML: string | undefined;

            if (diagramElement) {
              // Clone the element to avoid modifying the original
              const clone = diagramElement.cloneNode(true) as HTMLElement;

              // Convert dark theme to printer-friendly colors
              clone.style.background = "white";
              clone.style.color = "#333";

              // Update all text elements to dark color
              clone.querySelectorAll("text, span, div").forEach((el) => {
                (el as HTMLElement).style.color = "#333";
              });

              // Update connector boxes to white background
              clone.querySelectorAll('[style*="background"]').forEach((el) => {
                const element = el as HTMLElement;
                if (
                  element.style.backgroundColor &&
                  (element.style.backgroundColor.includes("rgb(15") ||
                    element.style.backgroundColor.includes("#0F") ||
                    element.style.backgroundColor.includes("#1"))
                ) {
                  element.style.backgroundColor = "white";
                  element.style.border = "1px solid #ccc";
                }
              });

              diagramHTML = clone.outerHTML;
            }

            openPrintView(connectors, mappings, diagramHTML);
          }}
          className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-800 text-green-400 rounded hover:bg-gray-700 transition text-xs sm:text-base whitespace-nowrap"
        >
          Print
        </button>

        <button
          onClick={handleClearProject}
          className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-800 text-red-400 rounded hover:bg-gray-700 transition text-xs sm:text-base whitespace-nowrap"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
