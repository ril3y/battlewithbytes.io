'use client';

/**
 * DisassemblyHeader Component
 *
 * Toolbar/header for the disassembly view containing:
 * - View mode toggle (Linear/Graph buttons)
 * - Address navigation controls (input, Go button, Go to PC)
 * - Refresh button
 * - Back/Forward navigation buttons
 * - Follow PC checkbox
 * - Show Bytes checkbox (linear view only)
 * - Bytes to Read dropdown
 */

import React from 'react';
import type { ViewMode } from '../types';
import type { UseDisassemblyNavigationReturn } from '../../../lib/hooks/useDisassemblyNavigation';

export interface DisassemblyHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  addressInput: string;
  setAddressInput: (value: string) => void;
  handleGoTo: () => void;
  handleGoToPC: () => void;
  handleRefresh: () => void;
  navigation: UseDisassemblyNavigationReturn;
  showBytes: boolean;
  setShowBytes: (value: boolean) => void;
  bytesToRead: number;
  setBytesToRead: (value: number) => void;
  isConnected: boolean;
  programCounter?: number;
  isLoading: boolean;
}

export function DisassemblyHeader({
  viewMode,
  setViewMode,
  addressInput,
  setAddressInput,
  handleGoTo,
  handleGoToPC,
  handleRefresh,
  navigation,
  showBytes,
  setShowBytes,
  bytesToRead,
  setBytesToRead,
  isConnected,
  programCounter,
  isLoading
}: DisassemblyHeaderProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-900 border-b border-gray-700">
      <button
        onClick={handleRefresh}
        disabled={!isConnected || isLoading}
        className="px-3 py-1 text-xs font-mono bg-gray-800 text-green-400 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Refresh
      </button>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={navigation.navigateBack}
          disabled={!navigation.canGoBack}
          className="px-2 py-1 text-xs font-mono bg-gray-800 text-green-400 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Back (Backspace or Left Arrow)"
        >
          ←
        </button>
        <button
          onClick={navigation.navigateForward}
          disabled={!navigation.canGoForward}
          className="px-2 py-1 text-xs font-mono bg-gray-800 text-green-400 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Forward (Right Arrow)"
        >
          →
        </button>
      </div>

      <div className="flex items-center gap-1">
        <input
          type="text"
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleGoTo();
            }
          }}
          placeholder="Address"
          className="px-2 py-1 text-xs font-mono bg-gray-800 text-gray-300 rounded w-24"
        />
        <button
          onClick={handleGoTo}
          disabled={!isConnected || isLoading}
          className="px-2 py-1 text-xs font-mono bg-gray-800 text-green-400 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          Go
        </button>
      </div>

      <button
        onClick={handleGoToPC}
        disabled={!isConnected || !programCounter || isLoading}
        className="px-3 py-1 text-xs font-mono bg-gray-800 text-green-400 rounded hover:bg-gray-700 disabled:opacity-50"
      >
        Go to PC
      </button>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-1 ml-4">
        <button
          onClick={() => setViewMode('linear')}
          className={`px-3 py-1 text-xs font-mono rounded ${
            viewMode === 'linear'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Linear
        </button>
        <button
          onClick={() => setViewMode('graph')}
          className={`px-3 py-1 text-xs font-mono rounded ${
            viewMode === 'graph'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Graph
        </button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {viewMode === 'linear' && (
          <label className="flex items-center gap-1 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={showBytes}
              onChange={(e) => setShowBytes(e.target.checked)}
              className="rounded"
            />
            Show Bytes
          </label>
        )}

        <select
          value={bytesToRead}
          onChange={(e) => setBytesToRead(parseInt(e.target.value))}
          className="px-2 py-1 text-xs font-mono bg-gray-800 text-gray-300 rounded"
        >
          <option value="128">128 bytes</option>
          <option value="256">256 bytes</option>
          <option value="512">512 bytes</option>
          <option value="1024">1KB</option>
          <option value="2048">2KB</option>
        </select>
      </div>
    </div>
  );
}
