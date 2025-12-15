"use client";

import React, { useState } from "react";
import { CommentType } from "../lib/db/AnalysisDatabase";

interface CommentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, type: CommentType) => void;
  onDelete: (type: CommentType) => void;
  address: number;
  existingComments: Map<CommentType, string>;
  initialType: CommentType;
}

export default function CommentEditor({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  address,
  existingComments,
  initialType,
}: CommentEditorProps) {
  const [comment, setComment] = useState(
    existingComments.get(initialType) || "",
  );
  const [commentType, setCommentType] = useState<CommentType>(initialType);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(comment, commentType);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="p-4 bg-gray-800 rounded-lg w-96">
        <div className="text-sm text-gray-400 mb-2">
          Comment at 0x{address.toString(16)}
        </div>
        <select
          value={commentType}
          onChange={(e) => setCommentType(e.target.value as CommentType)}
          className="w-full px-2 py-1 mb-2 bg-gray-700 text-white text-sm rounded"
        >
          <option value="standard">Standard</option>
          <option value="repeatable">Repeatable</option>
          <option value="anterior">Anterior</option>
          <option value="block">Block</option>
        </select>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-2 py-1 bg-gray-700 text-white text-sm rounded h-24"
          placeholder="Enter comment..."
          autoFocus
        />
        <div className="flex gap-2 mt-3 justify-end">
          <button
            type="button"
            onClick={() => onDelete(commentType)}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
