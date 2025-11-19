'use client';

/**
 * ArgumentAnnotation Component
 *
 * Displays inline argument annotations for function call instructions (bl/blx).
 * Shows argument values passed in registers and on the stack.
 *
 * Features:
 * - Compact inline display after call instructions
 * - Color-coded argument values (constants vs addresses)
 * - Tooltip with full argument details
 * - Copy to clipboard functionality
 */

import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import type { ArgAnnotation } from '../lib/context/AnalysisContext';

interface ArgumentAnnotationProps {
  annotation: ArgAnnotation;
  functionName?: string;
  compact?: boolean;
}

/**
 * Format argument value for display
 * - Numbers >= 0x1000 shown as hex addresses (yellow)
 * - Small numbers shown as decimal constants (cyan)
 * - Stack offsets shown as sp+N (purple)
 */
function formatArgValue(location: string): { text: string; color: string; isAddress: boolean } {
  // Check if it's a stack location (contains "sp")
  if (location.toLowerCase().includes('sp')) {
    return {
      text: location,
      color: 'text-purple-400',
      isAddress: false
    };
  }

  // Try to parse as number
  const value = parseInt(location, 16) || parseInt(location, 10);

  if (!isNaN(value)) {
    // Large values are likely addresses
    if (value >= 0x1000) {
      return {
        text: `0x${value.toString(16).toUpperCase()}`,
        color: 'text-yellow-400',
        isAddress: true
      };
    }
    // Small values are constants
    return {
      text: value.toString(),
      color: 'text-cyan-400',
      isAddress: false
    };
  }

  // Unknown format, return as-is
  return {
    text: location,
    color: 'text-gray-400',
    isAddress: false
  };
}

/**
 * Format register name (r0-r15)
 */
function formatRegisterName(argNum: number): string {
  return `r${argNum}`;
}

export function ArgumentAnnotation({
  annotation,
  functionName,
  compact = true
}: ArgumentAnnotationProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Build formatted argument string
  const argStrings = annotation.args.map(([argNum, location]) => {
    const regName = formatRegisterName(argNum);
    const { text, color } = formatArgValue(location);
    return { regName, value: text, color, argNum, location };
  });

  // Get target function name or format address
  const targetName = functionName || `sub_${annotation.function_target.toString(16).toUpperCase()}`;

  // Build display string for inline view
  const inlineDisplay = `${targetName}(${argStrings
    .map(arg => `${arg.regName}=${arg.value}`)
    .join(', ')})`;

  // Build detailed tooltip content
  const tooltipContent = (
    <div className="space-y-1">
      <div className="text-xs font-bold text-white border-b border-gray-600 pb-1">
        Function Call Arguments
      </div>
      <div className="text-xs">
        <span className="text-gray-400">Target:</span>{' '}
        <span className="text-green-400">{targetName}</span>
      </div>
      <div className="text-xs">
        <span className="text-gray-400">Address:</span>{' '}
        <span className="text-blue-400">0x{annotation.function_target.toString(16).toUpperCase()}</span>
      </div>
      <div className="text-xs border-t border-gray-700 pt-1 mt-1">
        <div className="text-gray-400 mb-1">Arguments:</div>
        {argStrings.map((arg, idx) => {
          const { color } = formatArgValue(arg.location);
          return (
            <div key={idx} className="ml-2">
              <span className="font-bold text-white">{arg.regName}</span>
              {' = '}
              <span className={color}>{arg.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Copy to clipboard
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(inlineDisplay).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  if (compact) {
    return (
      <span
        className="relative inline-flex items-center gap-1 ml-2 cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="text-xs text-gray-500">; </span>
        <span className="text-xs text-green-400">{targetName}</span>
        <span className="text-xs text-gray-500">(</span>
        {argStrings.map((arg, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-xs text-gray-500">, </span>}
            <span className="text-xs font-bold text-white">{arg.regName}</span>
            <span className="text-xs text-gray-500">=</span>
            <span className={`text-xs ${arg.color}`}>{arg.value}</span>
          </React.Fragment>
        ))}
        <span className="text-xs text-gray-500">)</span>

        <button
          onClick={handleCopy}
          className="ml-1 p-0.5 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Copy argument annotation"
        >
          <Copy className="w-3 h-3 text-gray-400 hover:text-white" />
        </button>

        {copySuccess && (
          <span className="text-xs text-green-400 ml-1">Copied!</span>
        )}

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute left-0 top-6 z-50 bg-gray-800 border border-gray-600 rounded-md px-3 py-2 shadow-lg min-w-[250px]">
            {tooltipContent}
          </div>
        )}
      </span>
    );
  }

  // Verbose mode (for future use)
  return (
    <div className="text-sm bg-gray-900 border border-gray-700 rounded p-2 mt-1">
      {tooltipContent}
    </div>
  );
}
