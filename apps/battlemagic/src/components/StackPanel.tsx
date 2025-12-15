"use client";

/**
 * Stack Panel Component
 *
 * Displays the call stack with unwound frames similar to GDB/IDA Pro.
 * Integrates with analysis context to show function names and provides
 * navigation to disassembly.
 *
 * Features:
 * - Multi-frame stack unwinding
 * - Function name resolution from analysis
 * - Current frame highlighting
 * - Click to navigate to address
 */

import React, { useCallback } from "react";
import { useAnalysisOptional } from "../lib/context/AnalysisContext";

export interface StackFrame {
  level: number;
  address: number;
  function?: string;
  file?: string;
  line?: number;
}

interface StackPanelProps {
  frames: StackFrame[];
  onSelectFrame?: (frame: StackFrame) => void;
  onRefresh: () => void;
  isConnected: boolean;
}

export default function StackPanel({
  frames,
  onSelectFrame,
  isConnected,
}: StackPanelProps) {
  const analysisContext = useAnalysisOptional();

  const formatAddress = (addr: number): string => {
    return "0x" + addr.toString(16).toUpperCase().padStart(8, "0");
  };

  /**
   * Resolve function name for an address
   * Tries to find the containing function from analysis results
   */
  const resolveFunctionName = useCallback(
    (address: number): string => {
      if (!analysisContext) {
        return "<unknown>";
      }

      // First, try exact match
      const exactFunc = analysisContext.getFunctionAt(address);
      if (exactFunc) {
        return exactFunc.name;
      }

      // If no exact match, search for a function that contains this address
      // This handles return addresses that are mid-function
      const allFunctions = Array.from(analysisContext.functions.values());

      for (const func of allFunctions) {
        // Check if address is within function bounds
        if (func.end_address !== undefined) {
          if (address >= func.address && address < func.end_address) {
            // Calculate offset within function for display
            const offset = address - func.address;
            return offset > 0
              ? `${func.name}+0x${offset.toString(16)}`
              : func.name;
          }
        } else {
          // No end address - just check if it's reasonably close (within 4KB)
          if (address >= func.address && address < func.address + 0x1000) {
            const offset = address - func.address;
            return offset > 0
              ? `${func.name}+0x${offset.toString(16)}`
              : func.name;
          }
        }
      }

      return "<unknown>";
    },
    [analysisContext],
  );

  /**
   * Get enriched frame info with function name from analysis
   */
  const getFrameInfo = useCallback(
    (frame: StackFrame) => {
      // Use provided function name if available, otherwise resolve from analysis
      const functionName = frame.function || resolveFunctionName(frame.address);

      return {
        ...frame,
        functionName,
        isCurrentFrame: frame.level === 0,
      };
    },
    [resolveFunctionName],
  );

  return (
    <div className="flex flex-col h-full bg-gray-950">
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
            {frames.map((frame) => {
              const frameInfo = getFrameInfo(frame);

              return (
                <div
                  key={frame.level}
                  onClick={() => onSelectFrame?.(frame)}
                  className={`px-3 py-2 hover:bg-gray-800 cursor-pointer transition-colors ${
                    frameInfo.isCurrentFrame
                      ? "bg-green-950 border-l-2 border-green-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Frame number */}
                    <span
                      className={`text-xs font-mono font-bold min-w-[2rem] ${
                        frameInfo.isCurrentFrame
                          ? "text-green-400"
                          : "text-gray-500"
                      }`}
                    >
                      #{frame.level}
                    </span>

                    {/* Frame details */}
                    <div className="flex-1 min-w-0">
                      {/* Address and "in" keyword (GDB-style) */}
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          className={`text-xs font-mono ${
                            frameInfo.isCurrentFrame
                              ? "text-green-300"
                              : "text-blue-400"
                          }`}
                        >
                          {formatAddress(frame.address)}
                        </span>
                        <span className="text-xs text-gray-600">in</span>
                        <span
                          className={`text-xs font-mono ${
                            frameInfo.isCurrentFrame
                              ? "text-green-200 font-semibold"
                              : "text-gray-300"
                          }`}
                        >
                          {frameInfo.functionName}
                        </span>
                      </div>

                      {/* Location info if available */}
                      {frame.file && frame.line && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          at {frame.file}:{frame.line}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer info */}
      {isConnected && frames.length > 0 && (
        <div className="border-t border-gray-800 bg-gray-900 px-3 py-1.5">
          <div className="text-xs text-gray-500 font-mono">
            {frames.length} frame{frames.length !== 1 ? "s" : ""} total
            {analysisContext?.isAnalyzed() && (
              <span className="ml-2 text-green-600">(with analysis)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
