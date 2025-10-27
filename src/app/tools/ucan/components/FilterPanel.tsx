'use client';

/**
 * Filter Panel Component
 *
 * Controls for filtering CAN messages by ID, direction, and pattern
 */

import React, { useState } from 'react';
import { MessageFilter, MessageDirection } from '../types';

interface FilterPanelProps {
  filter: MessageFilter;
  onFilterChange: (filter: Partial<MessageFilter>) => void;
  totalMessages: number;
  filteredMessages: number;
  allCANIds?: number[];
}

export default function FilterPanel({
  filter,
  onFilterChange,
  totalMessages,
  filteredMessages,
  allCANIds = []
}: FilterPanelProps) {
  const [canIdInput, setCanIdInput] = useState('');
  const [rangeMin, setRangeMin] = useState('');
  const [rangeMax, setRangeMax] = useState('');

  const handleDirectionToggle = (direction: MessageDirection) => {
    const newDirections = new Set(filter.directions);
    if (newDirections.has(direction)) {
      newDirections.delete(direction);
    } else {
      newDirections.add(direction);
    }
    onFilterChange({ directions: newDirections });
  };

  const handleAddCANId = () => {
    if (!canIdInput.trim()) return;

    try {
      const id = canIdInput.startsWith('0x')
        ? parseInt(canIdInput.substring(2), 16)
        : parseInt(canIdInput, 16);

      if (!isNaN(id)) {
        const newIds = new Set(filter.canIds);
        newIds.add(id);
        onFilterChange({ canIds: newIds });
        setCanIdInput('');
      }
    } catch {
      console.error('Invalid CAN ID:', canIdInput);
    }
  };

  const handleRemoveCANId = (id: number) => {
    const newIds = new Set(filter.canIds);
    newIds.delete(id);
    onFilterChange({ canIds: newIds });
  };

  const handleSetRange = () => {
    try {
      const min = rangeMin.startsWith('0x')
        ? parseInt(rangeMin.substring(2), 16)
        : parseInt(rangeMin, 16);

      const max = rangeMax.startsWith('0x')
        ? parseInt(rangeMax.substring(2), 16)
        : parseInt(rangeMax, 16);

      if (!isNaN(min) && !isNaN(max) && min <= max) {
        onFilterChange({ canIdRange: { min, max } });
      }
    } catch {
      console.error('Invalid range:', rangeMin, rangeMax);
    }
  };

  const handleClearRange = () => {
    onFilterChange({ canIdRange: undefined });
    setRangeMin('');
    setRangeMax('');
  };

  const handleClearAllFilters = () => {
    onFilterChange({
      directions: new Set<MessageDirection>(['RX', 'TX']),
      canIds: new Set<number>(),
      canIdRange: undefined,
      dataPattern: undefined,
      searchText: undefined,
      errorsOnly: false
    });
    setCanIdInput('');
    setRangeMin('');
    setRangeMax('');
  };

  return (
    <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white">🔍 Filters</h2>
        <button
          onClick={handleClearAllFilters}
          className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Filter Summary */}
      <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded text-sm">
        <p className="text-blue-300">
          Showing <span className="font-bold">{filteredMessages}</span> of{' '}
          <span className="font-bold">{totalMessages}</span> messages
        </p>
      </div>

      {/* Direction Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Direction</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleDirectionToggle('RX')}
            className={`flex-1 px-3 py-2 rounded border transition-colors ${
              filter.directions.has('RX')
                ? 'bg-green-600/20 border-green-500/50 text-green-300'
                : 'bg-gray-800 border-gray-600 text-gray-500'
            }`}
          >
            🟢 RX
          </button>
          <button
            onClick={() => handleDirectionToggle('TX')}
            className={`flex-1 px-3 py-2 rounded border transition-colors ${
              filter.directions.has('TX')
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                : 'bg-gray-800 border-gray-600 text-gray-500'
            }`}
          >
            🔵 TX
          </button>
        </div>
      </div>

      {/* CAN ID Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">CAN ID Filter</h3>

        {/* Add CAN ID */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={canIdInput}
            onChange={(e) => setCanIdInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCANId()}
            placeholder="0x123 or 123"
            className="flex-1 px-3 py-2 bg-gray-950 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
          />
          <button
            onClick={handleAddCANId}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
          >
            Add
          </button>
        </div>

        {/* Active CAN ID filters */}
        {filter.canIds.size > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {Array.from(filter.canIds).map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-600/20 border border-green-500/30 rounded text-green-300 text-xs"
              >
                0x{id.toString(16).toUpperCase().padStart(3, '0')}
                <button
                  onClick={() => handleRemoveCANId(id)}
                  className="hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Quick select from seen IDs */}
        {allCANIds.length > 0 && (
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-400 hover:text-gray-300 mb-2">
              Quick Select ({allCANIds.length} IDs seen)
            </summary>
            <div className="max-h-32 overflow-y-auto flex flex-wrap gap-1 p-2 bg-gray-950 rounded border border-gray-700">
              {allCANIds.slice(0, 20).map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    const newIds = new Set(filter.canIds);
                    newIds.add(id);
                    onFilterChange({ canIds: newIds });
                  }}
                  disabled={filter.canIds.has(id)}
                  className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-gray-300 rounded border border-gray-600 transition-colors"
                >
                  0x{id.toString(16).toUpperCase().padStart(3, '0')}
                </button>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* CAN ID Range Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">CAN ID Range</h3>
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={rangeMin}
              onChange={(e) => setRangeMin(e.target.value)}
              placeholder="0x100"
              className="w-20 px-2 py-1 bg-gray-950 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
            />
            <span className="text-gray-500 text-sm">to</span>
            <input
              type="text"
              value={rangeMax}
              onChange={(e) => setRangeMax(e.target.value)}
              placeholder="0x1FF"
              className="w-20 px-2 py-1 bg-gray-950 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSetRange}
              className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
            >
              Set Range
            </button>
            {filter.canIdRange && (
              <button
                onClick={handleClearRange}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {filter.canIdRange && (
            <p className="text-xs text-green-400">
              Active: 0x{filter.canIdRange.min.toString(16).toUpperCase()} - 0x
              {filter.canIdRange.max.toString(16).toUpperCase()}
            </p>
          )}
        </div>
      </div>

      {/* Data Pattern Search */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Data Pattern</h3>
        <input
          type="text"
          value={filter.dataPattern || ''}
          onChange={(e) => onFilterChange({ dataPattern: e.target.value || undefined })}
          placeholder="Hex pattern (e.g., DEAD, DE AD)"
          className="w-full px-3 py-2 bg-gray-950 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
        />
        {filter.dataPattern && (
          <p className="text-xs text-gray-400 mt-1">
            Searching for: {filter.dataPattern.toUpperCase()}
          </p>
        )}
      </div>

      {/* Text Search */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Text Search</h3>
        <input
          type="text"
          value={filter.searchText || ''}
          onChange={(e) => onFilterChange({ searchText: e.target.value || undefined })}
          placeholder="Search in messages..."
          className="w-full px-3 py-2 bg-gray-950 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
        />
      </div>

      {/* Errors Only */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filter.errorsOnly}
            onChange={(e) => onFilterChange({ errorsOnly: e.target.checked })}
            className="w-4 h-4 bg-gray-950 border-gray-600 rounded focus:ring-2 focus:ring-green-500"
          />
          <span className="text-sm text-gray-300">Show errors only</span>
        </label>
      </div>
    </div>
  );
}
