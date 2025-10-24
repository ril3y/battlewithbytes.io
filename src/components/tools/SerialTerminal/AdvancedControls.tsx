/**
 * Advanced Controls Component
 * Additional features like timestamps, hex view, auto-scroll, etc.
 */

import React from 'react';
import type { AdvancedControlsProps } from './serialTerminal.types';

export default function AdvancedControls({
  showTimestamps,
  showHex,
  autoScroll,
  onToggleTimestamps,
  onToggleHex,
  onToggleAutoScroll,
  onClear,
  onDownloadLog
}: AdvancedControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-black/30 border border-gray-800 rounded-lg">
      {/* View Options */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showTimestamps}
            onChange={onToggleTimestamps}
            className="w-4 h-4 rounded border-gray-700 bg-black text-green-600 focus:ring-green-500"
          />
          <span className="text-gray-400 font-mono text-sm">Timestamps</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showHex}
            onChange={onToggleHex}
            className="w-4 h-4 rounded border-gray-700 bg-black text-green-600 focus:ring-green-500"
          />
          <span className="text-gray-400 font-mono text-sm">Hex View</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={onToggleAutoScroll}
            className="w-4 h-4 rounded border-gray-700 bg-black text-green-600 focus:ring-green-500"
          />
          <span className="text-gray-400 font-mono text-sm">Auto-scroll</span>
        </label>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-700" />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onClear}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white font-mono text-sm rounded transition-colors"
          title="Clear terminal"
        >
          Clear
        </button>

        <button
          onClick={onDownloadLog}
          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-mono text-sm rounded transition-colors"
          title="Download log file"
        >
          Download Log
        </button>
      </div>
    </div>
  );
}
