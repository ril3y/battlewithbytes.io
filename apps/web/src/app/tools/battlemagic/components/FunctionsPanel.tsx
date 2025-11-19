'use client';

/**
 * Functions Panel Component
 *
 * IDA Pro-inspired functions window showing all detected functions
 * Features:
 * - Sortable table with address, name, size, callers, complexity, stack size
 * - Click to jump to function in disassembly
 * - Inline name editing (double-click)
 * - Filter/search box
 * - Color-coded complexity indicators
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useAnalysis } from '../lib/context/AnalysisContext';
import type { FunctionInfo } from '../lib/context/AnalysisContext';
import { Search, Edit2, ArrowUp, ArrowDown } from 'lucide-react';

interface FunctionsPanelProps {
  onNavigateToAddress?: (address: number) => void;
}

type SortColumn = 'address' | 'name' | 'size' | 'callers' | 'complexity' | 'stack';
type SortDirection = 'asc' | 'desc';

/**
 * Format address as hex string
 */
function formatAddress(address: number): string {
  return `0x${address.toString(16).toUpperCase().padStart(8, '0')}`;
}

/**
 * Calculate function size from start and end addresses
 */
function getFunctionSize(func: FunctionInfo): number {
  if (func.end_address !== undefined) {
    return func.end_address - func.address;
  }
  return 0;
}

/**
 * Get complexity color based on value
 */
function getComplexityColor(complexity: number | undefined): string {
  if (complexity === undefined) return 'text-gray-500';
  if (complexity < 5) return 'text-green-400';
  if (complexity < 10) return 'text-yellow-400';
  if (complexity < 20) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Inline editable function name cell
 * Memoized to prevent unnecessary re-renders when other rows change
 */
const EditableNameCell = React.memo(function EditableNameCell({
  func,
  onRename,
}: {
  func: FunctionInfo;
  onRename: (address: number, newName: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(func.name);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(func.name);
  }, [func.name]);

  const handleSubmit = useCallback(() => {
    if (editValue.trim() && editValue !== func.name) {
      onRename(func.address, editValue.trim());
    }
    setIsEditing(false);
  }, [editValue, func.address, func.name, onRename]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(func.name);
    }
  }, [handleSubmit, func.name]);

  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        className="w-full px-1 py-0.5 bg-gray-800 border border-cyan-500 rounded text-cyan-400 font-mono text-xs focus:outline-none"
        autoFocus
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="flex items-center gap-1 group cursor-text"
      title="Double-click to rename"
    >
      <span className="text-cyan-400">{func.name}</span>
      <Edit2 className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
});

/**
 * Individual function row component
 * Memoized to prevent re-rendering when other rows change (PERFORMANCE OPTIMIZATION)
 */
const FunctionRow = React.memo(function FunctionRow({
  func,
  resetVectorAddress,
  onRowClick,
  onRename,
}: {
  func: FunctionInfo;
  resetVectorAddress: number | null;
  onRowClick: (func: FunctionInfo) => void;
  onRename: (address: number, newName: string) => void;
}) {
  const size = getFunctionSize(func);
  const complexityColor = getComplexityColor(func.complexity);
  const isResetVector = resetVectorAddress !== null && func.address === resetVectorAddress;

  return (
    <tr
      className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer ${
        isResetVector ? 'bg-gradient-to-r from-cyan-900/30 to-transparent' : ''
      }`}
      onClick={() => onRowClick(func)}
      title={isResetVector ? 'Reset Vector - Entry Point' : undefined}
    >
      <td className="px-3 py-2 text-blue-400 hover:underline">
        {isResetVector && (
          <span className="text-cyan-300 mr-1" title="Reset Vector - Entry Point">▶</span>
        )}
        {formatAddress(func.address)}
      </td>
      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
        <EditableNameCell func={func} onRename={onRename} />
        {isResetVector && (
          <span className="ml-2 text-xs text-cyan-400 font-bold" title="Entry point from vector table">
            [ENTRY]
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-gray-400">
        {size > 0 ? `${size}` : '-'}
      </td>
      <td className="px-3 py-2 text-gray-400">{func.callers.length}</td>
      <td className={`px-3 py-2 ${complexityColor} font-bold`}>
        {func.complexity !== undefined ? func.complexity : '-'}
      </td>
      <td className="px-3 py-2 text-gray-400">
        {func.stack_frame_size !== undefined ? func.stack_frame_size : '-'}
      </td>
    </tr>
  );
});

export default function FunctionsPanel({ onNavigateToAddress }: FunctionsPanelProps) {
  const { functions, renameFunction, isAnalyzed, getVectorTable } = useAnalysis();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('address');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Debounce search input - update debounced query after 200ms of no typing
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Get reset vector address from vector table (vector_number = 1)
  const resetVectorAddress = useMemo(() => {
    const vectorTable = getVectorTable();
    const resetVector = vectorTable.find(entry => entry.vector_number === 1);
    return resetVector?.handler_address ?? null;
  }, [getVectorTable]);

  // Convert functions Map to array
  const functionsArray = useMemo(() => {
    return Array.from(functions.values());
  }, [functions]);

  // Filter functions based on DEBOUNCED search query (prevents re-filtering on every keystroke)
  const filteredFunctions = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return functionsArray;

    const query = debouncedSearchQuery.toLowerCase();
    return functionsArray.filter((func) => {
      const addressStr = formatAddress(func.address).toLowerCase();
      const nameStr = func.name.toLowerCase();
      return addressStr.includes(query) || nameStr.includes(query);
    });
  }, [functionsArray, debouncedSearchQuery]);

  // Sort filtered functions
  const sortedFunctions = useMemo(() => {
    const sorted = [...filteredFunctions];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'address':
          comparison = a.address - b.address;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size': {
          const sizeA = getFunctionSize(a);
          const sizeB = getFunctionSize(b);
          comparison = sizeA - sizeB;
          break;
        }
        case 'callers':
          comparison = a.callers.length - b.callers.length;
          break;
        case 'complexity': {
          const complexityA = a.complexity ?? -1;
          const complexityB = b.complexity ?? -1;
          comparison = complexityA - complexityB;
          break;
        }
        case 'stack': {
          const stackA = a.stack_frame_size ?? -1;
          const stackB = b.stack_frame_size ?? -1;
          comparison = stackA - stackB;
          break;
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredFunctions, sortColumn, sortDirection]);

  // Handle column header click for sorting
  const handleSort = useCallback((column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  // Handle row click - navigate to function
  const handleRowClick = useCallback(
    (func: FunctionInfo) => {
      if (onNavigateToAddress) {
        onNavigateToAddress(func.address);
      }
    },
    [onNavigateToAddress]
  );

  // Column header component
  const ColumnHeader = ({
    column,
    label,
    width,
  }: {
    column: SortColumn;
    label: string;
    width?: string;
  }) => {
    const isActive = sortColumn === column;
    return (
      <th
        className={`px-3 py-2 text-left text-gray-400 font-bold cursor-pointer hover:text-cyan-400 transition-colors select-none ${width || ''}`}
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          {isActive && (
            <span className="text-cyan-400">
              {sortDirection === 'asc' ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
            </span>
          )}
        </div>
      </th>
    );
  };

  if (!isAnalyzed()) {
    return (
      <div className="h-full flex flex-col bg-gray-950 text-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 text-sm">
            <p>No analysis data available</p>
            <p className="text-xs mt-2">Run analysis to detect functions</p>
          </div>
        </div>
      </div>
    );
  }

  if (functionsArray.length === 0) {
    return (
      <div className="h-full flex flex-col bg-gray-950 text-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 text-sm">
            <p>No functions detected</p>
            <p className="text-xs mt-2">Functions not found in firmware</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-950 text-white">
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by address or name..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-gray-900 border border-gray-700 rounded font-mono text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Functions Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs font-mono">
          <thead className="bg-gray-900 sticky top-0 z-10 border-b border-gray-700">
            <tr>
              <ColumnHeader column="address" label="Address" width="w-28" />
              <ColumnHeader column="name" label="Name" />
              <ColumnHeader column="size" label="Size" width="w-20" />
              <ColumnHeader column="callers" label="Callers" width="w-20" />
              <ColumnHeader column="complexity" label="Cplx" width="w-16" />
              <ColumnHeader column="stack" label="Stack" width="w-20" />
            </tr>
          </thead>
          <tbody>
            {sortedFunctions.map((func) => (
              <FunctionRow
                key={func.address}
                func={func}
                resetVectorAddress={resetVectorAddress}
                onRowClick={handleRowClick}
                onRename={renameFunction}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <div className="px-3 py-2 border-t border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>
            {filteredFunctions.length} / {functionsArray.length} functions
          </span>
          <span>
            {sortedFunctions.reduce((sum, f) => sum + f.callers.length, 0)} total cross-references
          </span>
        </div>
      </div>
    </div>
  );
}
