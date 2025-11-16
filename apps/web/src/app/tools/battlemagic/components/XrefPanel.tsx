'use client';

/**
 * Xref Panel Component
 *
 * Displays detailed cross-reference information for the selected instruction
 * Shows both incoming (TO) and outgoing (FROM) references with clickable navigation
 */

import React, { useMemo } from 'react';
import { useXref, type Xref } from '../lib/context/XrefContext';
import { ArrowRight, ArrowLeft, Target, Activity } from 'lucide-react';

interface XrefPanelProps {
  selectedAddress: number | null;
  onNavigateToAddress?: (address: number) => void;
}

/**
 * Format address as hex string
 */
function formatAddress(address: number): string {
  return `0x${address.toString(16).toUpperCase().padStart(8, '0')}`;
}

/**
 * Get color for xref type
 */
function getXrefTypeColor(type: Xref['xref_type']): string {
  switch (type) {
    case 'Call':
      return 'text-blue-400';
    case 'Branch':
      return 'text-green-400';
    case 'ConditionalBranch':
      return 'text-yellow-400';
    case 'DataRead':
      return 'text-purple-400';
    case 'DataWrite':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get label for xref type
 */
function getXrefTypeLabel(type: Xref['xref_type']): string {
  switch (type) {
    case 'Call':
      return 'CALL';
    case 'Branch':
      return 'BRANCH';
    case 'ConditionalBranch':
      return 'COND';
    case 'DataRead':
      return 'READ';
    case 'DataWrite':
      return 'WRITE';
    default:
      return 'UNKNOWN';
  }
}

export default function XrefPanel({ selectedAddress, onNavigateToAddress }: XrefPanelProps) {
  const { getXrefsTo, getXrefsFrom, isAnalyzed } = useXref();

  // Get xrefs for selected address
  const xrefsTo = useMemo(() => {
    if (!selectedAddress || !isAnalyzed()) return [];
    try {
      return getXrefsTo(selectedAddress);
    } catch (error) {
      console.error('[XrefPanel] Failed to get xrefs to:', error);
      return [];
    }
  }, [selectedAddress, isAnalyzed, getXrefsTo]);

  const xrefsFrom = useMemo(() => {
    if (!selectedAddress || !isAnalyzed()) return [];
    try {
      return getXrefsFrom(selectedAddress);
    } catch (error) {
      console.error('[XrefPanel] Failed to get xrefs from:', error);
      return [];
    }
  }, [selectedAddress, isAnalyzed, getXrefsFrom]);

  if (!isAnalyzed()) {
    return (
      <div className="h-full flex flex-col bg-gray-950 text-white">
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <h2 className="text-sm font-bold text-blue-400">CROSS-REFERENCES</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 text-sm">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No analysis data available</p>
            <p className="text-xs mt-2">Run Auto Analyze in the Analysis Panel</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedAddress) {
    return (
      <div className="h-full flex flex-col bg-gray-950 text-white">
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <h2 className="text-sm font-bold text-blue-400">CROSS-REFERENCES</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 text-sm">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>Select an instruction to view cross-references</p>
          </div>
        </div>
      </div>
    );
  }

  const hasXrefs = xrefsTo.length > 0 || xrefsFrom.length > 0;

  return (
    <div className="h-full flex flex-col bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="text-sm font-bold text-blue-400">CROSS-REFERENCES</h2>
        <div className="text-xs text-gray-400 font-mono">
          {formatAddress(selectedAddress)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        {!hasXrefs ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            <p>No cross-references found</p>
            <p className="text-xs mt-2">This instruction is not referenced by others</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* References TO this address (incoming) */}
            {xrefsTo.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded p-3">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowLeft className="w-4 h-4 text-green-400" />
                  <h3 className="text-xs font-bold text-green-400">
                    REFERENCES TO THIS ADDRESS ({xrefsTo.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {xrefsTo.map((xref, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded p-2 cursor-pointer transition-colors"
                      onClick={() => onNavigateToAddress?.(xref.from_addr)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-blue-400 hover:underline">
                          {formatAddress(xref.from_addr)}
                        </span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getXrefTypeColor(xref.xref_type)}`}>
                          {getXrefTypeLabel(xref.xref_type)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {xref.instruction} {xref.operands}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References FROM this address (outgoing) */}
            {xrefsFrom.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded p-3">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-blue-400">
                    REFERENCES FROM THIS ADDRESS ({xrefsFrom.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {xrefsFrom.map((xref, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded p-2 cursor-pointer transition-colors"
                      onClick={() => onNavigateToAddress?.(xref.to_addr)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-blue-400 hover:underline">
                          {formatAddress(xref.to_addr)}
                        </span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getXrefTypeColor(xref.xref_type)}`}>
                          {getXrefTypeLabel(xref.xref_type)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {xref.instruction} {xref.operands}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>
            {hasXrefs
              ? `${xrefsTo.length} incoming, ${xrefsFrom.length} outgoing`
              : 'No references'
            }
          </span>
          <span className="text-blue-400">Click to navigate</span>
        </div>
      </div>
    </div>
  );
}
