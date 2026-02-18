"use client";

import React from "react";

interface FunctionRenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newName: string) => void;
  address: number;
  currentName: string;
}

export default function FunctionRenameModal({
  isOpen,
  onClose,
  onSubmit: _onSubmit,
  address: _address,
  currentName,
}: FunctionRenameModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white mb-2">Rename Function</h3>
        <p className="text-gray-400 text-sm">Current: {currentName}</p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-600 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
