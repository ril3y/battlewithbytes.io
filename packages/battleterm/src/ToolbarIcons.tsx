/**
 * Toolbar Icons Component
 * Gear (config) and Help (?) icon buttons for opening modals
 */

"use client";

import React, { useState } from "react";

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
  const [showConfigTooltip, setShowConfigTooltip] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {/* Configuration (Gear) Button */}
      <div className="relative">
        <button
          onClick={onConfigClick}
          onMouseEnter={() => setShowConfigTooltip(true)}
          onMouseLeave={() => setShowConfigTooltip(false)}
          disabled={disabled}
          className="group relative w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 rounded transition-colors"
          aria-label="Open configuration"
        >
          <span className="text-lg text-gray-400 group-hover:text-green-400 transition-colors">
            ⚙
          </span>
          {disabled && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-gray-900" />
          )}
        </button>
        {showConfigTooltip && (
          <div className="absolute top-full right-0 mt-2 z-10 w-52 p-3 bg-gray-900 border border-gray-700 rounded shadow-lg text-xs text-gray-300 font-mono">
            <div className="text-green-400 font-bold mb-1">[i] Configuration</div>
            <div>
              {disabled
                ? "Disconnect first to change settings like baud rate and line ending."
                : "Configure serial port settings: baud rate, data bits, parity, and line ending."}
            </div>
          </div>
        )}
      </div>

      {/* Help (?) Button */}
      <div className="relative">
        <button
          onClick={onHelpClick}
          onMouseEnter={() => setShowHelpTooltip(true)}
          onMouseLeave={() => setShowHelpTooltip(false)}
          className="group w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors"
          aria-label="Show features and help"
        >
          <span className="text-lg font-bold text-gray-400 group-hover:text-green-400 transition-colors">
            ?
          </span>
        </button>
        {showHelpTooltip && (
          <div className="absolute top-full right-0 mt-2 z-10 w-52 p-3 bg-gray-900 border border-gray-700 rounded shadow-lg text-xs text-gray-300 font-mono">
            <div className="text-green-400 font-bold mb-1">[i] Help</div>
            <div>View features, keyboard shortcuts, and usage tips for BattleTerm.</div>
          </div>
        )}
      </div>
    </div>
  );
}
