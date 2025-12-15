'use client';

/**
 * FunctionCallGraph Component
 *
 * Visualizes function call relationships with argument annotations.
 * Shows a directed graph where:
 * - Nodes are functions
 * - Edges are function calls
 * - Edge labels show argument values at each call site
 *
 * Features:
 * - Interactive graph visualization
 * - Click edges to see argument details
 * - Filter by function name
 * - Zoom and pan controls
 */

import React, { useMemo, useState } from 'react';
import { useAnalysis, type FunctionInfo } from '../lib/context/AnalysisContext';

interface CallEdge {
  from: number;
  to: number;
  fromName: string;
  toName: string;
  callAddress: number;
  argAnnotation?: NonNullable<FunctionInfo['arg_annotations']>[number];
}

interface FunctionCallGraphProps {
  focusFunction?: number; // Optional function address to focus on
  maxDepth?: number; // Maximum depth of call tree to display
  onFunctionClick?: (address: number) => void;
}

export function FunctionCallGraph({
  focusFunction,
  maxDepth = 3,
  onFunctionClick
}: FunctionCallGraphProps) {
  const { functions } = useAnalysis();
  const [selectedEdge, setSelectedEdge] = useState<CallEdge | null>(null);
  const [filterText, setFilterText] = useState('');

  // Build call graph edges with argument annotations
  const callEdges = useMemo(() => {
    const edges: CallEdge[] = [];

    for (const func of functions.values()) {
      // Skip if we're filtering and this function doesn't match
      if (filterText && !func.name.toLowerCase().includes(filterText.toLowerCase())) {
        continue;
      }

      // For each callee, create an edge
      for (const calleeAddr of func.callees) {
        const calleeFunc = functions.get(calleeAddr);
        if (!calleeFunc) continue;

        // Find the call address by looking at arg_annotations
        let argAnnotation: CallEdge['argAnnotation'] = undefined;
        let callAddress = 0;

        if (func.arg_annotations) {
          const annotation = func.arg_annotations.find(ann => ann.function_target === calleeAddr);
          if (annotation) {
            argAnnotation = annotation;
            callAddress = annotation.call_address;
          }
        }

        edges.push({
          from: func.address,
          to: calleeAddr,
          fromName: func.name,
          toName: calleeFunc.name,
          callAddress,
          argAnnotation
        });
      }
    }

    return edges;
  }, [functions, filterText]);

  // Filter edges based on focus function and max depth
  const visibleEdges = useMemo(() => {
    if (!focusFunction) return callEdges;

    // BFS to find all functions within maxDepth
    const visited = new Set<number>();
    const queue: Array<{ addr: number; depth: number }> = [{ addr: focusFunction, depth: 0 }];
    visited.add(focusFunction);

    while (queue.length > 0) {
      const { addr, depth } = queue.shift()!;

      if (depth >= maxDepth) continue;

      // Add callees
      const func = functions.get(addr);
      if (func) {
        for (const callee of func.callees) {
          if (!visited.has(callee)) {
            visited.add(callee);
            queue.push({ addr: callee, depth: depth + 1 });
          }
        }

        // Add callers
        for (const caller of func.callers) {
          if (!visited.has(caller)) {
            visited.add(caller);
            queue.push({ addr: caller, depth: depth + 1 });
          }
        }
      }
    }

    // Filter edges to only include visited functions
    return callEdges.filter(edge => visited.has(edge.from) && visited.has(edge.to));
  }, [callEdges, focusFunction, maxDepth, functions]);

  // Get unique functions from visible edges
  const visibleFunctions = useMemo(() => {
    const funcSet = new Set<number>();
    visibleEdges.forEach(edge => {
      funcSet.add(edge.from);
      funcSet.add(edge.to);
    });
    return Array.from(funcSet).map(addr => functions.get(addr)!).filter(Boolean);
  }, [visibleEdges, functions]);

  if (functions.size === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-lg mb-2">No Analysis Data</div>
          <div className="text-sm">Run firmware analysis to see function call graph</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-300">
      {/* Header */}
      <div className="p-3 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-white">Function Call Graph</h2>
          <input
            type="text"
            placeholder="Filter functions..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="px-2 py-1 text-xs bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 outline-none"
          />
          <div className="ml-auto text-xs text-gray-500">
            {visibleFunctions.length} functions, {visibleEdges.length} calls
          </div>
        </div>
      </div>

      {/* Graph visualization area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {/* Simple list view for now - can be replaced with actual graph rendering */}
          {visibleFunctions.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              No functions match filter
            </div>
          ) : (
            visibleFunctions.map(func => {
              const outgoingCalls = visibleEdges.filter(e => e.from === func.address);
              const incomingCalls = visibleEdges.filter(e => e.to === func.address);

              return (
                <div
                  key={func.address}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-3 hover:border-blue-500 transition-colors"
                >
                  <div
                    className="font-mono text-sm font-bold text-cyan-400 mb-2 cursor-pointer hover:text-cyan-300"
                    onClick={() => onFunctionClick?.(func.address)}
                  >
                    {func.name}
                    <span className="text-gray-500 ml-2 text-xs">
                      @ 0x{func.address.toString(16).toUpperCase()}
                    </span>
                  </div>

                  {/* Incoming calls */}
                  {incomingCalls.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 mb-1">Called by:</div>
                      <div className="ml-2 space-y-1">
                        {incomingCalls.map((edge, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-gray-400 hover:text-white cursor-pointer"
                            onClick={() => setSelectedEdge(edge)}
                          >
                            ← {edge.fromName}
                            {edge.argAnnotation && (
                              <span className="ml-2 text-green-400">
                                ({edge.argAnnotation.args.length} args)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outgoing calls */}
                  {outgoingCalls.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Calls:</div>
                      <div className="ml-2 space-y-1">
                        {outgoingCalls.map((edge, idx) => (
                          <div
                            key={idx}
                            className="text-xs hover:bg-gray-800 rounded px-1 cursor-pointer"
                            onClick={() => setSelectedEdge(edge)}
                          >
                            <span className="text-gray-400">→ </span>
                            <span className="text-blue-400">{edge.toName}</span>
                            {edge.argAnnotation && (
                              <div className="ml-4 mt-1 text-gray-500">
                                {edge.argAnnotation.args.map(([argNum, location]) => (
                                  <div key={argNum}>
                                    <span className="text-white font-mono">r{argNum}</span>
                                    <span> = </span>
                                    <span className="text-cyan-400">{location}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected edge details panel */}
      {selectedEdge && (
        <div className="border-t border-gray-700 bg-gray-900 p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm font-bold text-white">Call Details</div>
            <button
              onClick={() => setSelectedEdge(null)}
              className="text-gray-500 hover:text-white text-xs"
            >
              Close
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-gray-500">From:</span>{' '}
              <span className="text-cyan-400 font-mono">{selectedEdge.fromName}</span>
            </div>
            <div>
              <span className="text-gray-500">To:</span>{' '}
              <span className="text-blue-400 font-mono">{selectedEdge.toName}</span>
            </div>
            {selectedEdge.callAddress > 0 && (
              <div>
                <span className="text-gray-500">Call Address:</span>{' '}
                <span className="text-yellow-400 font-mono">
                  0x{selectedEdge.callAddress.toString(16).toUpperCase()}
                </span>
              </div>
            )}

            {selectedEdge.argAnnotation && (
              <div>
                <div className="text-gray-500 mb-1">Arguments:</div>
                <div className="ml-2 space-y-1 bg-gray-950 rounded p-2 font-mono">
                  {selectedEdge.argAnnotation.args.map(([argNum, location]) => (
                    <div key={argNum}>
                      <span className="text-white font-bold">r{argNum}</span>
                      <span className="text-gray-500"> = </span>
                      <span className="text-cyan-400">{location}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
