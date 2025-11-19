'use client';

/**
 * Project Menu Component
 *
 * Provides UI for project management: New, Save, Load, Auto-save toggle
 */

import React, { useState, useRef, useEffect } from 'react';

interface ProjectMenuProps {
  projectName: string;
  hasUnsavedChanges: boolean;
  autoSaveEnabled: boolean;
  onNew: () => void;
  onSave: () => void;
  onLoad: (file: File) => void;
  onAutoSaveToggle: (enabled: boolean) => void;
  onEditMetadata: (name: string, description: string) => void;
}

export default function ProjectMenu({
  projectName,
  hasUnsavedChanges,
  autoSaveEnabled,
  onNew,
  onSave,
  onLoad,
  onAutoSaveToggle,
  onEditMetadata
}: ProjectMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoad(file);
      setIsOpen(false);

      // Clear the input so the same file can be loaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleNew = () => {
    if (hasUnsavedChanges) {
      setShowNewDialog(true);
    } else {
      // Show dialog to get project name/description
      setShowNewProjectDialog(true);
      setIsOpen(false);
    }
  };

  const confirmNew = () => {
    // Show dialog to get project name/description for new project
    setShowNewProjectDialog(true);
    setShowNewDialog(false);
    setIsOpen(false);
  };

  const handleSave = () => {
    // If project is still "Untitled Project", show Save As dialog
    if (projectName === 'Untitled Project' || projectName.startsWith('Untitled')) {
      setShowEditDialog(true);
      setIsOpen(false);
    } else {
      onSave();
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Project Name and Menu Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-sm transition-colors"
            title="Project menu"
          >
            <span className="font-medium text-green-400">Project:</span>
            <span className="text-gray-200">{projectName}</span>
            {hasUnsavedChanges && (
              <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full" title="Unsaved changes" />
            )}
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Auto-save indicator */}
          {autoSaveEnabled && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Auto-save</span>
            </div>
          )}
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-[60]">
            <div className="p-2 space-y-1">
              {/* New Project */}
              <button
                onClick={handleNew}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded text-sm text-left transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>New Project</span>
              </button>

              {/* Save Project */}
              <button
                onClick={handleSave}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded text-sm text-left transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>{projectName === 'Untitled Project' || projectName.startsWith('Untitled') ? 'Save As...' : 'Save Project'}</span>
                {hasUnsavedChanges && (
                  <span className="ml-auto text-xs text-yellow-400">*</span>
                )}
              </button>

              {/* Load Project */}
              <label className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded text-sm cursor-pointer transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Load Project</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".bmproj,.json"
                  onChange={handleLoad}
                  className="hidden"
                />
              </label>

              <div className="border-t border-gray-700 my-1" />

              {/* Edit Project Info */}
              <button
                onClick={() => {
                  setShowEditDialog(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded text-sm text-left transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Project Info</span>
              </button>

              {/* Auto-save Toggle */}
              <button
                onClick={() => {
                  onAutoSaveToggle(!autoSaveEnabled);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded text-sm text-left transition-colors"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {autoSaveEnabled ? (
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  ) : (
                    <div className="w-3 h-3 border-2 border-gray-600 rounded" />
                  )}
                </div>
                <span>Auto-save (30s)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Project Dialog (for editing existing project or Save As) */}
      {showEditDialog && (
        <EditProjectDialog
          currentName={projectName}
          title={projectName === 'Untitled Project' || projectName.startsWith('Untitled') ? 'Save Project As' : 'Edit Project Info'}
          onSave={(name, description) => {
            // Update metadata first
            onEditMetadata(name, description);
            // If this was a Save As, also trigger save (synchronously)
            if (projectName === 'Untitled Project' || projectName.startsWith('Untitled')) {
              onSave();
            }
            setShowEditDialog(false);
          }}
          onCancel={() => setShowEditDialog(false)}
        />
      )}

      {/* New Project Dialog (get name/description for new project) */}
      {showNewProjectDialog && (
        <EditProjectDialog
          currentName=""
          title="New Project"
          onSave={(name, description) => {
            // Create new project first
            onNew();
            // Immediately set metadata (must be synchronous)
            onEditMetadata(name, description);
            // Close dialog
            setShowNewProjectDialog(false);
          }}
          onCancel={() => setShowNewProjectDialog(false)}
        />
      )}

      {/* New Project Confirmation Dialog (when unsaved changes exist) */}
      {showNewDialog && (
        <ConfirmDialog
          title="Unsaved Changes"
          message="You have unsaved changes. Creating a new project will discard them. Continue?"
          confirmLabel="Create New"
          onConfirm={confirmNew}
          onCancel={() => setShowNewDialog(false)}
        />
      )}
    </>
  );
}

/**
 * Edit Project Metadata Dialog
 */
interface EditProjectDialogProps {
  currentName: string;
  title?: string;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
}

function EditProjectDialog({ currentName, title = 'Edit Project Info', onSave, onCancel }: EditProjectDialogProps) {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && name.trim()) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70]">
      <div className="bg-gray-900 border border-green-400 rounded-lg p-6 w-[500px] max-w-[90vw]">
        <h2 className="text-lg font-bold text-green-400 mb-4">{title}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-green-400"
              placeholder="My Debug Session"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-green-400"
              placeholder="Add notes about this debugging session..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded text-white font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Confirmation Dialog
 */
interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70]">
      <div className="bg-gray-900 border border-yellow-400 rounded-lg p-6 w-[400px] max-w-[90vw]">
        <h2 className="text-lg font-bold text-yellow-400 mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded text-white font-medium transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
