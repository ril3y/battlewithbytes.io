/**
 * Connection Panel Component
 * Handles serial port connection/disconnection
 */

import React, { useState } from "react";
import type { ConnectionPanelProps } from "./serialTerminal.types";
import ToolbarIcons from "./ToolbarIcons";

export default function ConnectionPanel({
  isConnected,
  onConnect,
  onDisconnect,
  error,
  onConfigClick,
  onHelpClick,
  onClear,
  onDownloadLog,
  logo,
}: ConnectionPanelProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleConnect = async () => {
    try {
      await onConnect();
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await onDisconnect();
    } catch (err) {
      console.error("Disconnection error:", err);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-black/30">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Logo */}
        {logo && (
          <img src={logo} alt="BattleTerm" className="h-12 w-12" />
        )}
        <div className="flex gap-3 items-center">
          {!isConnected ? (
            <>
              <div className="text-gray-500 text-sm font-mono hidden sm:block">
                Click to select COM port
              </div>
              <div className="relative">
                <button
                  onClick={handleConnect}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50 hover:border-green-400 font-mono text-sm rounded transition-colors"
                >
                  Connect
                </button>
                {showTooltip && (
                  <div className="absolute top-full left-0 mt-2 z-10 w-64 p-3 bg-gray-900 border border-gray-700 rounded shadow-lg text-xs text-gray-300 font-mono">
                    <div className="text-green-400 font-bold mb-1">
                      [i] Browser Dialog
                    </div>
                    <div>
                      Clicking Connect will open your browser&apos;s serial port
                      selection dialog. Choose your COM port from the list to
                      establish connection.
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 hover:border-red-400 font-mono text-sm rounded transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Toolbar Icons */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onClear}
            className="group w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors"
            aria-label="Clear terminal"
            title="Clear terminal"
          >
            <span className="text-sm font-mono text-gray-400 group-hover:text-green-400 transition-colors">
              CLR
            </span>
          </button>
          <button
            onClick={onDownloadLog}
            className="group w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors"
            aria-label="Download terminal log"
            title="Download terminal log"
          >
            <span className="text-lg text-gray-400 group-hover:text-green-400 transition-colors">
              ⤓
            </span>
          </button>
          <ToolbarIcons
            onConfigClick={onConfigClick}
            onHelpClick={onHelpClick}
            disabled={isConnected}
          />
        </div>

        {error && (
          <div className="w-full flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-600/50 rounded text-red-400 text-sm font-mono">
            <span>[!]</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
