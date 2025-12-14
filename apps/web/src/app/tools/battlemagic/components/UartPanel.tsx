"use client";

/**
 * UART Panel Component
 *
 * Provides UART serial monitoring interface for Black Magic Probe
 * Terminal-style interface for serial communication
 */

import React, { useState, useRef, useEffect } from "react";

interface UartPanelProps {
  isConnected: boolean;
  output: string[];
  onSendData: (data: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export default function UartPanel({
  isConnected,
  output,
  onSendData,
  onConnect,
  onDisconnect,
}: UartPanelProps) {
  const [autoscroll, setAutoscroll] = useState(true);
  const [inputData, setInputData] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll output
  useEffect(() => {
    if (autoscroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, autoscroll]);

  const handleSend = () => {
    if (!inputData.trim()) return;
    onSendData(inputData);
    setInputData("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Panel Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono font-semibold">UART</span>
          <span className="text-gray-500">|</span>
          <span
            className={`text-xs font-mono ${isConnected ? "text-green-400" : "text-red-400"}`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isConnected ? (
            <button
              onClick={onConnect}
              className="px-3 py-1 text-xs rounded border bg-green-600/20 border-green-500/50 text-green-300 hover:bg-green-600/30 transition-colors font-mono"
              title="Connect to UART port"
            >
              Connect
            </button>
          ) : (
            <button
              onClick={onDisconnect}
              className="px-3 py-1 text-xs rounded border bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-600/30 transition-colors font-mono"
              title="Disconnect from UART port"
            >
              Disconnect
            </button>
          )}
          <button
            onClick={() => setAutoscroll(!autoscroll)}
            className={`px-3 py-1 text-xs rounded border transition-colors ${
              autoscroll
                ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            }`}
            title={autoscroll ? "Disable auto-scroll" : "Enable auto-scroll"}
          >
            {autoscroll ? "Auto-scroll" : "Locked"}
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm bg-black"
      >
        {output.length === 0 ? (
          <div className="text-gray-400">
            <div className="mb-4">
              <span className="text-green-400">BattleMagic UART Monitor</span>
            </div>
            <div className="mb-2 text-gray-500">
              # Connect using the connection bar above
            </div>
            <div className="mb-2 text-gray-500">
              # Monitor serial output from your target device
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Note: Black Magic Probe exposes two serial ports:
            </div>
            <div className="text-xs text-gray-500">
              - One for GDB debugging (connect in GDB panel)
            </div>
            <div className="text-xs text-gray-500">
              - One for UART/target serial output (connect here)
            </div>
          </div>
        ) : (
          <div className="text-gray-300 space-y-0">
            {output.map((line, index) => (
              <div
                key={index}
                className="whitespace-pre-wrap break-words font-mono"
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Command Input */}
      <div className="bg-gray-900 border-t border-gray-700 p-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono">TX:</span>
          <input
            type="text"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type to send data..."
            disabled={!isConnected}
            className="flex-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !inputData.trim()}
            className="px-4 py-2 text-sm bg-green-600/20 border border-green-500/30 text-green-300 hover:bg-green-600/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
          >
            Send
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">Press Enter to send</div>
      </div>
    </div>
  );
}
