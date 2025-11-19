'use client';

/**
 * Vector Table Panel Component
 *
 * Professional IDA Pro-inspired vector table visualization
 * Displays ARM Cortex-M vector table with interrupt handlers
 *
 * Features:
 * - Table view with vector number, handler name, address, and validity
 * - Color-coded validity status
 * - Click handler to jump to disassembly
 * - Right-click context menu for renaming handlers
 * - CSV/JSON export functionality
 * - Statistics summary
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAnalysis } from '../lib/context/AnalysisContext';
import type { VectorTableEntry } from '../lib/wasmAnalyzer';
import { getStandardVectorName } from '../lib/utils/vectorTableUtils';
import {
  Table,
  CheckCircle,
  XCircle,
  MinusCircle,
  Download,
  Edit2,
  ExternalLink,
  BarChart3,
  FileText,
} from 'lucide-react';

interface VectorTablePanelProps {
  onNavigateToAddress?: (address: number) => void;
}

/**
 * Format address as hex string
 */
function formatAddress(address: number): string {
  return `0x${address.toString(16).toUpperCase().padStart(8, '0')}`;
}

/**
 * Get validity status icon and color
 */
function getValidityDisplay(entry: VectorTableEntry): {
  icon: React.ReactNode;
  color: string;
  label: string;
} {
  // Check for invalid patterns
  if (entry.handler_address === 0x00000000) {
    return {
      icon: <MinusCircle className="w-3 h-3" />,
      color: 'text-gray-500',
      label: 'NULL',
    };
  }
  if (entry.handler_address === 0xFFFFFFFF) {
    return {
      icon: <XCircle className="w-3 h-3" />,
      color: 'text-red-400',
      label: 'ERASED',
    };
  }
  if (entry.is_valid) {
    return {
      icon: <CheckCircle className="w-3 h-3" />,
      color: 'text-green-400',
      label: 'VALID',
    };
  }
  return {
    icon: <XCircle className="w-3 h-3" />,
    color: 'text-yellow-400',
    label: 'INVALID',
  };
}

// getStandardVectorName is now imported from vectorTableUtils

/**
 * Rename Handler Modal Component
 */
function RenameHandlerModal({
  entry,
  onClose,
  onRename,
}: {
  entry: VectorTableEntry;
  onClose: () => void;
  onRename: (vectorNum: number, newName: string) => void;
}) {
  const [newName, setNewName] = useState(entry.handler_name);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newName.trim()) {
        onRename(entry.vector_number, newName.trim());
        onClose();
      }
    },
    [newName, entry.vector_number, onRename, onClose]
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-96">
        <h3 className="text-sm font-bold text-cyan-400 mb-4">Rename Vector Handler</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-xs text-gray-400 block mb-1">
              Vector #{entry.vector_number} - {formatAddress(entry.handler_address)}
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded font-mono text-white focus:outline-none focus:border-cyan-500"
              placeholder="Handler name"
              autoFocus
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 rounded transition-colors"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VectorTablePanel({ onNavigateToAddress }: VectorTablePanelProps) {
  const { getVectorTable, renameVectorHandler, isAnalyzed } = useAnalysis();
  const [renameModalEntry, setRenameModalEntry] = useState<VectorTableEntry | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    entry: VectorTableEntry;
  } | null>(null);

  // Get vector table from context
  const vectorTable = useMemo(() => getVectorTable(), [getVectorTable]);

  // Calculate statistics
  const stats = useMemo(() => {
    const validEntries = vectorTable.filter((e) => e.is_valid && e.handler_address !== 0);
    const invalidNull = vectorTable.filter((e) => e.handler_address === 0x00000000).length;
    const invalidErased = vectorTable.filter((e) => e.handler_address === 0xFFFFFFFF).length;
    const customNames = vectorTable.filter(
      (e) => e.handler_name !== getStandardVectorName(e.vector_number)
    ).length;

    return {
      total: vectorTable.length,
      valid: validEntries.length,
      invalidNull,
      invalidErased,
      customNames,
    };
  }, [vectorTable]);

  // Handle row click - navigate to handler
  const handleRowClick = useCallback(
    (entry: VectorTableEntry) => {
      if (entry.is_valid && entry.handler_address !== 0 && onNavigateToAddress) {
        // Clear Thumb bit (LSB) for ARM addresses
        const address = entry.handler_address & 0xFFFFFFFE;
        onNavigateToAddress(address);
      }
    },
    [onNavigateToAddress]
  );

  // Handle right-click - show context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, entry: VectorTableEntry) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      entry,
    });
  }, []);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Handle rename
  const handleRename = useCallback(
    (vectorNum: number, newName: string) => {
      renameVectorHandler(vectorNum, newName);
    },
    [renameVectorHandler]
  );

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['Vector #', 'Handler Name', 'Address', 'Valid'];
    const rows = vectorTable.map((entry) => [
      entry.vector_number.toString(),
      entry.handler_name,
      formatAddress(entry.handler_address),
      entry.is_valid ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vector_table.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [vectorTable]);

  // Export to JSON
  const handleExportJSON = useCallback(() => {
    const json = JSON.stringify(vectorTable, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vector_table.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [vectorTable]);

  // Close context menu on click outside
  useEffect(() => {
    if (contextMenu) {
      const handleClick = () => closeContextMenu();
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu, closeContextMenu]);

  if (!isAnalyzed()) {
    return (
      <div className="h-full flex flex-col bg-gray-950 text-white">
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <h2 className="text-sm font-bold text-cyan-400">VECTOR TABLE</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 text-sm">
            <Table className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No analysis data available</p>
            <p className="text-xs mt-2">Run analysis to detect vector table</p>
          </div>
        </div>
      </div>
    );
  }

  if (vectorTable.length === 0) {
    return (
      <div className="h-full flex flex-col bg-gray-950 text-white">
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <h2 className="text-sm font-bold text-cyan-400">VECTOR TABLE</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 text-sm">
            <Table className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No vector table detected</p>
            <p className="text-xs mt-2">Vector table not found in firmware</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="text-sm font-bold text-cyan-400">VECTOR TABLE</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded transition-colors flex items-center gap-1"
            title="Export to CSV"
          >
            <FileText className="w-3 h-3" />
            CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-500 rounded transition-colors flex items-center gap-1"
            title="Export to JSON"
          >
            <Download className="w-3 h-3" />
            JSON
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="p-3 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-cyan-400">Vector Table Summary</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-gray-400">Total entries:</span>
            <span className="text-cyan-400">{stats.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Valid handlers:</span>
            <span className="text-green-400">
              {stats.valid}/{stats.total}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">NULL (0x00):</span>
            <span className="text-gray-500">{stats.invalidNull}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Erased (0xFF):</span>
            <span className="text-red-400">{stats.invalidErased}</span>
          </div>
          <div className="flex justify-between col-span-2">
            <span className="text-gray-400">Custom names:</span>
            <span className="text-yellow-400">{stats.customNames}</span>
          </div>
        </div>
      </div>

      {/* Vector Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs font-mono">
          <thead className="bg-gray-900 sticky top-0 z-10 border-b border-gray-700">
            <tr>
              <th className="px-3 py-2 text-left text-gray-400 font-bold">Vec#</th>
              <th className="px-3 py-2 text-left text-gray-400 font-bold">Handler Name</th>
              <th className="px-3 py-2 text-left text-gray-400 font-bold">Address</th>
              <th className="px-3 py-2 text-center text-gray-400 font-bold">Valid</th>
            </tr>
          </thead>
          <tbody>
            {vectorTable.map((entry) => {
              const validity = getValidityDisplay(entry);
              const isClickable = entry.is_valid && entry.handler_address !== 0;
              const isResetVector = entry.vector_number === 1;

              return (
                <tr
                  key={entry.vector_number}
                  className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                    isClickable ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    isResetVector ? 'bg-gradient-to-r from-cyan-900/30 to-transparent' : ''
                  }`}
                  onClick={() => handleRowClick(entry)}
                  onContextMenu={(e) => handleContextMenu(e, entry)}
                  title={isResetVector ? 'Reset Vector - Entry Point' : undefined}
                >
                  <td className="px-3 py-2 text-gray-400">
                    {isResetVector && (
                      <span className="text-cyan-300 mr-1" title="Reset Vector - Entry Point">▶ </span>
                    )}
                    {entry.vector_number}
                  </td>
                  <td className="px-3 py-2 text-cyan-400">
                    {entry.handler_name}
                    {isResetVector && (
                      <span className="ml-2 text-xs text-cyan-400 font-bold" title="Entry point from vector table">
                        [ENTRY]
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-3 py-2 ${
                      isClickable ? 'text-blue-400 hover:underline' : 'text-gray-500'
                    }`}
                  >
                    {formatAddress(entry.handler_address)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className={`flex items-center justify-center gap-1 ${validity.color}`}>
                      {validity.icon}
                      <span className="text-xs">{validity.label}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <div className="px-3 py-2 border-t border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>{stats.total} vector entries</span>
          <span>
            {stats.valid} valid, {stats.invalidNull + stats.invalidErased} invalid
          </span>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-900 border border-gray-700 rounded shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              handleRowClick(contextMenu.entry);
              closeContextMenu();
            }}
            disabled={!contextMenu.entry.is_valid || contextMenu.entry.handler_address === 0}
            className="w-full px-4 py-2 text-xs text-left hover:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ExternalLink className="w-3 h-3" />
            Go to handler
          </button>
          <button
            onClick={() => {
              setRenameModalEntry(contextMenu.entry);
              closeContextMenu();
            }}
            className="w-full px-4 py-2 text-xs text-left hover:bg-gray-800 flex items-center gap-2"
          >
            <Edit2 className="w-3 h-3" />
            Rename handler
          </button>
        </div>
      )}

      {/* Rename Modal */}
      {renameModalEntry && (
        <RenameHandlerModal
          entry={renameModalEntry}
          onClose={() => setRenameModalEntry(null)}
          onRename={handleRename}
        />
      )}
    </div>
  );
}
