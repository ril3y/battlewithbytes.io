"use client";

/**
 * Graph View Wrapper Component
 *
 * Wraps ControlFlowGraphView with empty state handling.
 * Shows instructions to load disassembly first if no instructions are available.
 */

import React from "react";
import type { DisassembledInstruction } from "../../../lib/arch/arm/disasm";
import { ControlFlowGraphView } from "../../ControlFlowGraphView";

interface GraphViewWrapperProps {
  isConnected: boolean;
  rawInstructions: DisassembledInstruction[];
  programCounter?: number;
  onAddressClick?: (address: number) => void;
}

export function GraphViewWrapper({
  isConnected,
  rawInstructions,
  programCounter,
  onAddressClick,
}: GraphViewWrapperProps) {
  return (
    <div className="flex-1 overflow-hidden">
      {!isConnected ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          Connect to target to view control flow graph
        </div>
      ) : rawInstructions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="text-lg mb-4">No Control Flow Graph</div>
          <div className="text-sm text-center mb-4 max-w-md">
            Load disassembly first:
            <ul className="mt-2 text-left list-disc list-inside">
              <li>
                Switch to{" "}
                <span className="text-blue-400 font-bold">Linear</span> view
              </li>
              <li>
                Click <span className="text-green-400 font-bold">Go to PC</span>{" "}
                to load instructions
              </li>
              <li>
                Return to <span className="text-blue-400 font-bold">Graph</span>{" "}
                view
              </li>
            </ul>
          </div>
          <div className="text-xs text-gray-500">
            {programCounter !== undefined &&
              `PC is at 0x${programCounter.toString(16).toUpperCase()}`}
          </div>
        </div>
      ) : (
        <ControlFlowGraphView
          instructions={rawInstructions}
          selectedAddress={programCounter}
          onAddressClick={onAddressClick}
        />
      )}
    </div>
  );
}
