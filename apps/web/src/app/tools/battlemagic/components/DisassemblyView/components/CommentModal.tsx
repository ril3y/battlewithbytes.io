"use client";

/**
 * Add Comment Modal Component
 *
 * A reusable modal for adding/editing comments at a specific address in the disassembly view.
 * Comments are stored in the AnalysisContext and persist across sessions (when IndexedDB is added).
 */

import React from "react";

export interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  onDelete?: () => void;
  address: number;
  currentComment: string;
  setCurrentComment: (comment: string) => void;
}

export default function CommentModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  address,
  currentComment,
  setCurrentComment,
}: CommentModalProps) {
  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      onSubmit(currentComment);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const handleSubmitClick = () => {
    onSubmit(currentComment);
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-gray-900 border-2 border-green-500 rounded-lg shadow-2xl p-4 w-96">
        <h3 className="text-sm font-bold text-green-400 mb-3">
          Comment at 0x{address.toString(16).toUpperCase()}
        </h3>

        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">
            Enter comment:
          </label>
          <textarea
            value={currentComment}
            onChange={(e) => setCurrentComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add your comment here..."
            className="w-full px-2 py-1.5 text-sm bg-gray-900 border border-gray-600 rounded text-gray-300 font-mono focus:outline-none focus:border-green-500 resize-none"
            rows={4}
            autoFocus
          />
          <div className="text-xs text-gray-500 mt-1">
            Press Ctrl+Enter to save, Esc to cancel
          </div>
        </div>

        <div className="flex gap-2 justify-between">
          <div>
            {onDelete && currentComment && (
              <button
                onClick={handleDeleteClick}
                className="px-3 py-1.5 text-xs bg-red-900 text-red-300 rounded hover:bg-red-800 border border-red-700"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            >
              Cancel (Esc)
            </button>
            <button
              onClick={handleSubmitClick}
              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-500"
            >
              Save (Ctrl+Enter)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
