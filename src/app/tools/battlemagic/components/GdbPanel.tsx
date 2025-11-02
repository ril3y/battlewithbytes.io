'use client';

/**
 * GDB Panel Component
 *
 * Provides GDB debugging interface for Black Magic Probe
 * Terminal-style interface for GDB commands and output
 */

import React, { useState, useRef, useEffect } from 'react';
import { GdbClient } from '../lib/gdb/GdbClient';
import { Target } from '../lib/gdb/types';

interface GdbPanelProps {
  gdbClient: GdbClient | null;
  output: string[];
  targets: Target[];
  onAttachTarget: (targetId: number) => void;
}

export default function GdbPanel({ gdbClient, output, targets, onAttachTarget }: GdbPanelProps) {
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);

  const isConnected = gdbClient?.isConnected() || false;

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleSendCommand = async () => {
    if (!gdbClient || !command.trim()) return;

    try {
      // Add to history
      setCommandHistory((prev) => [...prev, command]);
      setHistoryIndex(-1);

      // Send command
      await gdbClient.sendCommand(command);
      setCommand('');

      // Output is handled by the callbacks in BattleMagicMonitor
    } catch {
      // Error is handled by callbacks
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Panel Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono font-semibold">GDB</span>
          <span className="text-gray-500">|</span>
          <span className={`text-xs font-mono ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Quick Actions - Show when connected */}
      {isConnected && (
        <div className="bg-gray-900/50 border-b border-gray-700 p-2 flex gap-2 flex-wrap flex-shrink-0">
          <button
            onClick={() => gdbClient?.sendCommand('qRcmd,76657273696f6e')}
            className="px-2 py-1 text-xs rounded bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-colors font-mono"
            title="Get probe version"
          >
            Version
          </button>
          <button
            onClick={() => gdbClient?.sendCommand('qRcmd,7377645f7363616e')}
            className="px-2 py-1 text-xs rounded bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-colors font-mono"
            title="Scan for SWD targets"
          >
            Scan SWD
          </button>
          <button
            onClick={() => gdbClient?.sendCommand('qRcmd,6a7461675f7363616e')}
            className="px-2 py-1 text-xs rounded bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-colors font-mono"
            title="Scan for JTAG targets"
          >
            Scan JTAG
          </button>
          <button
            onClick={() => gdbClient?.sendCommand('g')}
            className="px-2 py-1 text-xs rounded bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-colors font-mono"
            title="Read all registers"
          >
            Read Regs
          </button>
        </div>
      )}

      {/* Target List - Show when targets are available */}
      {targets.length > 0 && (
        <div className="bg-gray-900/50 border-b border-gray-700 p-3 flex-shrink-0">
          <div className="text-xs text-gray-400 mb-2">Available Targets:</div>
          <div className="space-y-1">
            {targets.map((target) => (
              <button
                key={target.id}
                onClick={() => onAttachTarget(target.id)}
                className="w-full text-left px-3 py-2 text-xs rounded bg-green-600/10 border border-green-500/30 text-green-300 hover:bg-green-600/20 transition-colors font-mono"
              >
                <span className="text-green-400">{target.id}:</span> {target.description}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Terminal Output */}
      <div ref={outputRef} className="flex-1 overflow-auto p-4 font-mono text-sm bg-black">
        {output.length === 0 ? (
          <div className="text-gray-400">
            <div className="mb-4">
              <span className="text-green-400">BattleMagic GDB Interface</span>
            </div>
            <div className="mb-2 text-gray-500">
              # Connect using the connection bar above
            </div>
            <div className="mb-2 text-gray-500">
              # Use quick action buttons or enter raw GDB commands
            </div>
          </div>
        ) : (
          <div className="text-gray-300 space-y-1">
            {output.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap break-words">
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Command Input */}
      <div className="bg-gray-900 border-t border-gray-700 p-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono">(gdb)</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter GDB command..."
            disabled={!isConnected}
            className="flex-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendCommand}
            disabled={!isConnected || !command.trim()}
            className="px-4 py-2 text-sm bg-green-600/20 border border-green-500/30 text-green-300 hover:bg-green-600/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
          >
            Send
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Use ↑/↓ for command history
        </div>
      </div>
    </div>
  );
}
