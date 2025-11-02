'use client';

/**
 * Stack Panel Component
 *
 * Displays the call stack and stack memory
 */

import React from 'react';

export interface StackFrame {
  level: number;
  address: number;
  function?: string;
  file?: string;
  line?: number;
}

interface StackPanelProps {
  frames: StackFrame[];
  stackPointer?: number;
  onSelectFrame?: (frame: StackFrame) => void;
  onRefresh: () => void;
  isConnected: boolean;
}

export default function StackPanel({
  frames,
  stackPointer,
  onSelectFrame,
  onRefresh,
  isConnected
}: StackPanelProps) {
  const formatAddress = (addr: number): string => {
    return '0x' + addr.toString(16).toUpperCase().padStart(8, '0');
  };

  const formatLocation = (frame: StackFrame): string => {
    if (frame.file && frame.line) {
      return `${frame.file}:${frame.line}`;
    }
    return formatAddress(frame.address);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold text-green-400">STACK</h2>
          {stackPointer !== undefined && (
            <span className="text-xs text-gray-400 font-mono">
              SP: {formatAddress(stackPointer)}
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={!isConnected}
          className="px-3 py-1 text-xs rounded border bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stack Frames */}
      <div className="flex-1 overflow-y-auto">
        {!isConnected ? (
          <div className="text-gray-500 text-xs text-center mt-4">
            Connect to target to view stack
          </div>
        ) : frames.length === 0 ? (
          <div className="text-gray-500 text-xs text-center mt-4">
            No stack data available
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {frames.map((frame) => (
              <div
                key={frame.level}
                onClick={() => onSelectFrame?.(frame)}
                className="px-3 py-2 hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-mono">
                      #{frame.level}
                    </span>
                    <div>
                      <div className="text-xs font-mono text-gray-300">
                        {frame.function || '<unknown>'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatLocation(frame)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-gray-600">
                    {formatAddress(frame.address)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}