/**
 * Status Bar Component
 * Displays connection statistics and status
 */

import React from "react";
import type { StatusBarProps } from "./serialTerminal.types";
import { formatBytes, formatTransferRate } from "./serialUtils";
import { formatDuration } from "./terminalUtils";
import ActivityIndicator from "./ActivityIndicator";

export default function StatusBar({
  stats,
  isConnected,
  viewMode,
  onViewModeToggle,
  rxActive = false,
  txActive = false,
  isStandalone = false,
  autoScroll = true,
  onAutoScrollToggle,
}: StatusBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-2 bg-black/50 border-t border-gray-800 font-mono text-xs text-gray-400">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Status:</span>
        <span className={isConnected ? "text-green-400" : "text-gray-500"}>
          {isConnected ? "CONNECTED" : "DISCONNECTED"}
        </span>
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-gray-700" />

      {/* RX Bytes */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500">RX:</span>
        <span className="text-blue-400">
          {formatBytes(stats.bytesReceived)}
        </span>
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

      {/* Auto-scroll checkbox */}
      <div className="ml-auto flex items-center gap-2">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={onAutoScrollToggle}
            className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-gray-400 hover:text-gray-300">Auto-scroll</span>
        </label>
      </div>

      {/* Activity Indicator (TX/RX LEDs) */}
      <div>
        {isConnected && (
          <ActivityIndicator rxActive={rxActive} txActive={txActive} />
        )}
      </div>

      {/* View Mode - Clickable Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500">View:</span>
        <button
          onClick={onViewModeToggle}
          className="px-2 py-1 rounded bg-green-600/20 hover:bg-green-600/40 text-green-400 uppercase transition-colors cursor-pointer border border-green-500/30 hover:border-green-500/60"
          title="Click to toggle between ASCII and HEX view"
        >
          {viewMode}
        </button>
      </div>

      {/* Show battlewithbytes.io in PWA mode */}
      {isStandalone && (
        <>
          <div className="h-4 w-px bg-gray-700" />
          <a
            href="https://battlewithbytes.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-green-400 transition-colors"
            title="Visit Battle With Bytes"
          >
            battlewithbytes.io
          </a>
        </>
      )}
    </div>
  );
}
