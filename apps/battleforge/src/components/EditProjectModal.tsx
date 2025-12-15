"use client";

import { useState, useEffect } from "react";
import { useProject } from "../lib/project/ProjectContext";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_LIBRARIES = [
  {
    id: "freertos",
    name: "FreeRTOS",
    description: "Real-time operating system kernel",
  },
];

export function EditProjectModal({ isOpen, onClose }: EditProjectModalProps) {
  const { currentProject, saveProject } = useProject();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLibraries, setSelectedLibraries] = useState<string[]>([]);
  const [compilerFlags, setCompilerFlags] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentProject && isOpen) {
      setName(currentProject.metadata.name || "");
      setDescription(currentProject.metadata.description || "");
      setSelectedLibraries(currentProject.libraries || []);
      setCompilerFlags(currentProject.compilerFlags || "");
    }
  }, [currentProject, isOpen]);

  const handleSave = async () => {
    if (!currentProject) return;

    setIsSaving(true);
    try {
      await saveProject({
        metadata: {
          ...currentProject.metadata,
          name,
          description,
        },
        libraries: selectedLibraries,
        compilerFlags,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save project settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLibrary = (libId: string) => {
    setSelectedLibraries((prev) =>
      prev.includes(libId)
        ? prev.filter((id) => id !== libId)
        : [...prev, libId],
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Project</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="project-name">Project Name</label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Project"
            />
          </div>

          <div className="form-group">
            <label htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your project..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Libraries</label>
            <div className="library-list">
              {AVAILABLE_LIBRARIES.map((lib) => (
                <label key={lib.id} className="library-item">
                  <input
                    type="checkbox"
                    checked={selectedLibraries.includes(lib.id)}
                    onChange={() => toggleLibrary(lib.id)}
                  />
                  <div className="library-info">
                    <span className="library-name">{lib.name}</span>
                    <span className="library-desc">{lib.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="compiler-flags">Custom Compiler Flags</label>
            <input
              id="compiler-flags"
              type="text"
              value={compilerFlags}
              onChange={(e) => setCompilerFlags(e.target.value)}
              placeholder="-O2 -Wall"
            />
            <span className="form-hint">
              Additional flags passed to the compiler
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
