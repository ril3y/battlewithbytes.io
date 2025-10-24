/**
 * Status Bar Component
 * Displays connection statistics and status
 */

import React from 'react';
import type { StatusBarProps } from './serialTerminal.types';
import { formatBytes, formatTransferRate, formatDuration } from './terminalUtils';

export default function StatusBar({ stats, isConnected, viewMode }: StatusBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-2 bg-black/50 border-t border-gray-800 font-mono text-xs text-gray-400">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Status:</span>
        <span className={isConnected ? 'text-green-400' : 'text-gray-500'}>
          {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
        </span>
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-gray-700" />

      {/* RX Bytes */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500">RX:</span>
        <span className="text-blue-400">{formatBytes(stats.bytesReceived)}</span>
      </div>

      {/* TX Bytes */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500">TX:</span>
        <span className="text-green-400">{formatBytes(stats.bytesSent)}</span>
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-gray-700" />

      {/* RX Rate */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500">RX Rate:</span>
        <span className="text-blue-400">
          {formatTransferRate(stats.receiveRate)}
        </span>
      </div>

      {/* TX Rate */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500">TX Rate:</span>
        <span className="text-green-400">
          {formatTransferRate(stats.sendRate)}
        </span>
      </div>

      {/* Separator */}
      {isConnected && <div className="h-4 w-px bg-gray-700" />}

      {/* Connection Duration */}
      {isConnected && (
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Duration:</span>
          <span className="text-purple-400">
            {formatDuration(stats.connectionDuration)}
          </span>
        </div>
      )}

      {/* View Mode */}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-gray-500">View:</span>
        <span className="text-green-400 uppercase">{viewMode}</span>
      </div>
    </div>
  );
}
