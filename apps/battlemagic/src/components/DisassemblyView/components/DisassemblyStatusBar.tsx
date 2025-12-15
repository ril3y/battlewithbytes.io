"use client";

/**
 * Disassembly Status Bar Components
 *
 * Shows loading/error/initializing messages and status information.
 * Provides visual feedback about the current state of the disassembler.
 */

import React from "react";
import type { DisassemblyLine } from "../types";
import { formatAddress } from "../utils/formatters";

interface DisassemblyStatusBarProps {
  disassemblerReady: boolean;
  isLoading: boolean;
  error: string | null;
}

interface DisassemblyStatusLineProps {
  programCounter: number | undefined;
  lines: DisassemblyLine[];
}

/**
 * Top status bar showing loading states and errors
 */
export function DisassemblyStatusBar({
  disassemblerReady,
  isLoading,
  error,
}: DisassemblyStatusBarProps) {
  // Only show status bar if there's something to display
  if (disassemblerReady && !isLoading && !error) {
    return null;
  }

  return (
    <div className="px-3 py-1 bg-gray-900 border-b border-gray-700">
      {!disassemblerReady && !error && (
        <span className="text-xs text-yellow-400">
          Initializing WASM disassembler...
        </span>
      )}
      {isLoading && disassemblerReady && (
        <span className="text-xs text-yellow-400">Loading disassembly...</span>
      )}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

/**
 * Bottom status line showing PC and address range
 */
export function DisassemblyStatusLine({
  programCounter,
  lines,
}: DisassemblyStatusLineProps) {
  return (
    <div className="px-3 py-1 bg-gray-900 border-t border-gray-700 text-xs text-gray-400">
      {programCounter !== undefined && (
        <span className="mr-4">PC: {formatAddress(programCounter)}</span>
      )}
      {lines.length > 0 && (
        <span>
          {lines.length} instructions | Range:{" "}
          {formatAddress(lines[0].instruction.address)} -
          {formatAddress(
            lines[lines.length - 1].instruction.address +
              lines[lines.length - 1].instruction.size,
          )}
        </span>
      )}
    </div>
  );
}
