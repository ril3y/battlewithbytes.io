/**
 * Terminal Context Menu Component
 * Right-click context menu for copy/paste/clear operations
 */

'use client';

import React, { useEffect } from 'react';

interface MenuPosition {
  x: number;
  y: number;
}

interface TerminalContextMenuProps {
  position: MenuPosition | null;
  onClose: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onClear: () => void;
  hasSelection: boolean;
}

export default function TerminalContextMenu({
  position,
  onClose,
  onCopy,
  onPaste,
  onClear,
  hasSelection
}: TerminalContextMenuProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      onClose();
    };

    if (position) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [position, onClose]);

  if (!position) return null;

  const handleMenuClick = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      className="fixed z-50 min-w-[180px] bg-gray-900 border-2 border-green-500/50 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] overflow-hidden animate-fadeIn"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="py-1">
        {/* Copy */}
        <button
          onClick={() => handleMenuClick(onCopy)}
          disabled={!hasSelection}
          className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm font-mono text-gray-300 hover:bg-green-500/10 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>Copy</span>
          {hasSelection && (
            <span className="ml-auto text-xs text-gray-500">Ctrl+C</span>
          )}
        </button>

        {/* Paste */}
        <button
          onClick={() => handleMenuClick(onPaste)}
          className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm font-mono text-gray-300 hover:bg-green-500/10 hover:text-green-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span>Paste</span>
          <span className="ml-auto text-xs text-gray-500">Ctrl+V</span>
        </button>

        {/* Separator */}
        <div className="my-1 h-px bg-gray-700" />

        {/* Clear */}
        <button
          onClick={() => handleMenuClick(onClear)}
          className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm font-mono text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span>Clear Terminal</span>
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}
