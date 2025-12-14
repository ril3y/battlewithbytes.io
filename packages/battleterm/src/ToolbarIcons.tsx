/**
 * Toolbar Icons Component
 * Gear (config) and Help (?) icon buttons for opening modals
 */

"use client";

import React from "react";

interface ToolbarIconsProps {
  onConfigClick: () => void;
  onHelpClick: () => void;
  disabled?: boolean;
}

export default function ToolbarIcons({
  onConfigClick,
  onHelpClick,
  disabled = false,
}: ToolbarIconsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Configuration (Gear) Button */}
      <button
        onClick={onConfigClick}
        disabled={disabled}
        className="group relative w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 rounded transition-colors"
        aria-label="Open configuration"
        title="Configuration"
      >
        <span className="text-lg text-gray-400 group-hover:text-green-400 transition-colors">
          ⚙
        </span>
        {disabled && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-gray-900" />
        )}
      </button>

      {/* Help (?) Button */}
      <button
        onClick={onHelpClick}
        className="group w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors"
        aria-label="Show features and help"
        title="Features & Help"
      >
        <span className="text-lg font-bold text-gray-400 group-hover:text-green-400 transition-colors">
          ?
        </span>
      </button>
    </div>
  );
}
