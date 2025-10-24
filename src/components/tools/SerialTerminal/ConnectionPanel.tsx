/**
 * Connection Panel Component
 * Handles serial port connection/disconnection
 */

import React from 'react';
import type { ConnectionPanelProps } from './serialTerminal.types';

export default function ConnectionPanel({
  isConnected,
  onConnect,
  onDisconnect,
  error
}: ConnectionPanelProps) {
  const handleConnect = async () => {
    try {
      await onConnect();
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await onDisconnect();
    } catch (err) {
      console.error('Disconnection error:', err);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-black/30 border border-gray-800 rounded-lg">
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full transition-colors ${
            isConnected
              ? 'bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
              : 'bg-gray-600'
          }`}
          aria-label={isConnected ? 'Connected' : 'Disconnected'}
        />
        <span className="font-mono text-sm text-gray-300">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="flex gap-2">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-mono text-sm rounded transition-colors"
          >
            Connect
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-sm rounded transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>

      {error && (
        <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-600/50 rounded text-red-400 text-sm font-mono">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
