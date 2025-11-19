'use client';

/**
 * Function Rename Modal Component
 *
 * IDA-style function renaming modal.
 * Triggered by pressing 'n' key on a function header.
 * Allows users to rename functions from "sub_XXXXX" to custom names.
 */

import React, { useState, useEffect } from 'react';

export interface FunctionRenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newName: string) => void;
  address: number;
  currentName: string;
}

export default function FunctionRenameModal({
  isOpen,
  onClose,
  onSubmit,
  address,
  currentName,
}: FunctionRenameModalProps) {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize with current name when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setError(null);
    }
  }, [isOpen, currentName]);

  if (!isOpen) {
    return null;
  }

  const validateFunctionName = (name: string): boolean => {
    // Must not be empty
    if (!name.trim()) {
      setError('Function name cannot be empty');
      return false;
    }

    // Must start with letter or underscore
    if (!/^[a-zA-Z_]/.test(name)) {
      setError('Function name must start with a letter or underscore');
      return false;
    }

    // Must contain only alphanumeric characters and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setError('Function name can only contain letters, numbers, and underscores');
      return false;
    }

    setError(null);
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSubmit = () => {
    const trimmedName = newName.trim();
    if (validateFunctionName(trimmedName)) {
      onSubmit(trimmedName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 border-2 border-green-500 rounded-lg shadow-2xl p-5 w-[450px]">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-green-400 mb-1">
            Rename Function at 0x{address.toString(16).toUpperCase()}
          </h3>
          <p className="text-xs text-gray-500">
            Enter a new name for this function
          </p>
        </div>

        {/* Current Name Display */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1 font-semibold">
            Current Name:
          </label>
          <div className="px-3 py-2 bg-gray-850 border border-gray-700 rounded text-cyan-400 font-mono text-sm">
            {currentName}
          </div>
        </div>

        {/* New Name Input */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1 font-semibold">
            New Name:
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter function name..."
            className={`
              w-full px-3 py-2 text-sm bg-gray-900 border rounded
              text-cyan-400 font-mono
              focus:outline-none focus:border-green-500
              ${error ? 'border-red-500' : 'border-gray-600'}
            `}
            autoFocus
          />
          <div className="text-xs text-gray-500 mt-1">
            Press <kbd className="px-1 py-0.5 bg-gray-800 rounded border border-gray-700">Enter</kbd> to save,
            <kbd className="px-1 py-0.5 bg-gray-800 rounded border border-gray-700 ml-1">Esc</kbd> to cancel
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 px-3 py-2 bg-red-900 bg-opacity-30 border border-red-500 rounded text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Naming Guidelines */}
        <div className="mb-4 p-3 bg-gray-850 rounded border border-gray-700">
          <div className="text-xs text-gray-500 mb-1 font-semibold">Naming Guidelines:</div>
          <ul className="text-xs text-gray-500 list-disc list-inside space-y-0.5">
            <li>Must start with a letter or underscore</li>
            <li>Can contain letters, numbers, and underscores</li>
            <li>Common conventions: snake_case, camelCase, PascalCase</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!newName.trim()}
            className={`
              px-4 py-2 text-xs rounded font-semibold
              ${newName.trim()
                ? 'bg-green-600 text-white hover:bg-green-500'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Rename Function
          </button>
        </div>
      </div>
    </div>
  );
}
