'use client';

/**
 * Comment Editor Component
 *
 * A comprehensive comment editor supporting all IDA Pro comment types:
 * - Standard: Regular inline comments (green)
 * - Repeatable: Shown at all xrefs (blue with icon)
 * - Anterior: Above the line (gray)
 * - Block: Multi-line boxed comments (yellow background)
 *
 * Keyboard shortcuts:
 * - ; : Add standard comment
 * - Shift+; : Add repeatable comment
 * - Ins : Add anterior comment
 * - Ctrl+Enter : Save comment
 * - Esc : Cancel
 */

import React, { useState, useEffect } from 'react';
import type { CommentType } from '../lib/db/AnalysisDatabase';
import type { Comment } from '../lib/context/AnalysisContext';

export interface CommentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, type: CommentType) => void;
  onDelete?: (type: CommentType) => void;
  address: number;
  existingComments: Map<CommentType, Comment>;
  initialType?: CommentType;
}

const COMMENT_TYPE_INFO: Record<CommentType, { label: string; icon: string; color: string; description: string }> = {
  standard: {
    label: 'Standard',
    icon: ';',
    color: 'text-green-400',
    description: 'Regular inline comment after instruction',
  },
  repeatable: {
    label: 'Repeatable',
    icon: '🔄',
    color: 'text-blue-400',
    description: 'Shown at all cross-references to this address',
  },
  anterior: {
    label: 'Anterior',
    icon: '↑',
    color: 'text-gray-400',
    description: 'Displayed above the instruction',
  },
  block: {
    label: 'Block',
    icon: '▭',
    color: 'text-yellow-400',
    description: 'Multi-line boxed comment',
  },
};

export default function CommentEditor({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  address,
  existingComments,
  initialType = 'standard',
}: CommentEditorProps) {
  const [selectedType, setSelectedType] = useState<CommentType>(initialType);
  const [text, setText] = useState('');

  // Load existing comment when type changes
  useEffect(() => {
    const existingComment = existingComments.get(selectedType);
    setText(existingComment?.text || '');
  }, [selectedType, existingComments]);

  // Reset to initial type when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedType(initialType);
    }
  }, [isOpen, initialType]);

  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text, selectedType);
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(selectedType);
      setText('');
      onClose();
    }
  };

  const hasExistingComment = existingComments.has(selectedType);
  const typeInfo = COMMENT_TYPE_INFO[selectedType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 border-2 border-green-500 rounded-lg shadow-2xl p-5 w-[500px]">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-green-400 mb-1">
            Edit Comment at 0x{address.toString(16).toUpperCase()}
          </h3>
          <p className="text-xs text-gray-500">
            Select comment type and enter your comment below
          </p>
        </div>

        {/* Comment Type Selection */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-2 font-semibold">
            Comment Type:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(COMMENT_TYPE_INFO) as [CommentType, typeof COMMENT_TYPE_INFO[CommentType]][]).map(([type, info]) => {
              const isSelected = selectedType === type;
              const hasComment = existingComments.has(type);

              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`
                    relative px-3 py-2 text-left rounded border transition-all
                    ${isSelected
                      ? 'border-green-500 bg-gray-800'
                      : 'border-gray-600 bg-gray-850 hover:bg-gray-800'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{info.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${info.color}`}>
                          {info.label}
                        </span>
                        {hasComment && (
                          <span className="text-xs bg-green-900 text-green-300 px-1.5 py-0.5 rounded">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment Text Area */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1 font-semibold">
            Comment Text:
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Enter ${typeInfo.label.toLowerCase()} comment here...`}
            className={`
              w-full px-3 py-2 text-sm bg-gray-900 border border-gray-600 rounded
              ${typeInfo.color} font-mono
              focus:outline-none focus:border-green-500 resize-none
            `}
            rows={selectedType === 'block' ? 6 : 4}
            autoFocus
          />
          <div className="text-xs text-gray-500 mt-1">
            Press <kbd className="px-1 py-0.5 bg-gray-800 rounded border border-gray-700">Ctrl+Enter</kbd> to save,
            <kbd className="px-1 py-0.5 bg-gray-800 rounded border border-gray-700 ml-1">Esc</kbd> to cancel
          </div>
        </div>

        {/* Preview */}
        {text.trim() && (
          <div className="mb-4 p-3 bg-gray-850 rounded border border-gray-700">
            <div className="text-xs text-gray-500 mb-1">Preview:</div>
            <div className={`text-sm font-mono ${typeInfo.color}`}>
              {selectedType === 'anterior' && <div className="mb-1">; {text}</div>}
              {selectedType === 'standard' && <span>; {text}</span>}
              {selectedType === 'repeatable' && (
                <span>
                  <span className="mr-1">🔄</span>; {text}
                </span>
              )}
              {selectedType === 'block' && (
                <div className="p-2 bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded">
                  <pre className="whitespace-pre-wrap text-yellow-400">; {text}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-between">
          <div>
            {onDelete && hasExistingComment && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-xs bg-red-900 text-red-300 rounded hover:bg-red-800 border border-red-700 font-semibold"
              >
                Delete {typeInfo.label}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className={`
                px-4 py-2 text-xs rounded font-semibold
                ${text.trim()
                  ? 'bg-green-600 text-white hover:bg-green-500'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Save {typeInfo.label}
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-500">
            <span className="font-semibold">Quick shortcuts:</span>
            <span className="ml-2"><kbd className="px-1 bg-gray-800 rounded">;</kbd> Standard</span>
            <span className="ml-2"><kbd className="px-1 bg-gray-800 rounded">Shift+;</kbd> Repeatable</span>
            <span className="ml-2"><kbd className="px-1 bg-gray-800 rounded">Ins</kbd> Anterior</span>
          </div>
        </div>
      </div>
    </div>
  );
}
