'use client';

/**
 * GDB Panel Component
 *
 * Provides GDB debugging interface for Black Magic Probe
 * Terminal-style interface for GDB commands and output with debug controls
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GdbClient } from '../lib/gdb/GdbClient';
import { Target, ConnectionState } from '../lib/gdb/types';
import DebugControlToolbar, { ExecutionState } from './DebugControlToolbar';

interface GdbPanelProps {
  gdbClient: GdbClient | null;
  output: string[];
  targets: Target[];
  onAttachTarget: (targetId: number) => void;
  onScanSwd?: () => void;
  onClearOutput?: () => void;
}

export default function GdbPanel({ gdbClient, output, targets, onAttachTarget, onScanSwd, onClearOutput }: GdbPanelProps) {
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [executionState, setExecutionState] = useState<ExecutionState>(ExecutionState.STOPPED);
  const [currentPC, setCurrentPC] = useState<number | undefined>();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);

  const isConnected = gdbClient?.isConnected() || false;
  const isAttached = gdbClient?.getState() === ConnectionState.ATTACHED;

  // Track execution state based on output
  useEffect(() => {
    if (output.length === 0) return;

    const lastLine = output[output.length - 1].toLowerCase();

    // Detect execution state changes from output
    if (lastLine.includes('[target stopped]') || lastLine.includes('stopped at') || lastLine.includes('signal')) {
      setExecutionState(ExecutionState.STOPPED);

      // Extract PC from stop reply if available
      try {
        const pcMatch = lastLine.match(/pc[:\s]+0x([0-9a-f]+)/i);
        if (pcMatch) {
          setCurrentPC(parseInt(pcMatch[1], 16));
        }
      } catch {
        // Ignore parsing errors
      }
    } else if (lastLine.includes('[state] running') || lastLine.includes('continuing')) {
      setExecutionState(ExecutionState.RUNNING);
    }
  }, [output]);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleCommandExecuted = useCallback((command: string) => {
    // Map command execution to state changes
    switch (command) {
      case 'continue':
        setExecutionState(ExecutionState.RUNNING);
        break;
      case 'halt':
        setExecutionState(ExecutionState.STOPPED);
        break;
      case 'step_over':
      case 'step_into':
        setExecutionState(ExecutionState.STEPPING);
        break;
    }
  }, []);

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
          {isAttached && (
            <>
              <span className="text-gray-500">|</span>
              <span className="text-xs font-mono text-blue-400">Attached</span>
            </>
          )}
          {currentPC !== undefined && (
            <>
              <span className="text-gray-500">|</span>
              <span className="text-xs font-mono text-purple-400">PC: 0x{currentPC.toString(16).toUpperCase().padStart(8, '0')}</span>
            </>
          )}
        </div>
      </div>

      {/* Debug Control Toolbar - Show when connected */}
      {isConnected && (
        <DebugControlToolbar
          gdbClient={gdbClient}
          executionState={executionState}
          onCommandExecuted={handleCommandExecuted}
          isAttached={isAttached}
        />
      )}

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
            onClick={() => onScanSwd?.()}
            disabled={!isConnected}
            className="px-2 py-1 text-xs rounded bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 disabled:bg-gray-700 disabled:text-gray-500 disabled:border-gray-600 transition-colors font-mono"
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
      <div
        ref={outputRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm bg-black relative"
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();

          // Get selected text BEFORE showing menu
          const selection = window.getSelection();
          const selected = selection?.toString() || '';
          setSelectedText(selected);

          setContextMenuPos({ x: e.clientX, y: e.clientY });
          setShowContextMenu(true);
        }}
        onClick={(e) => {
          // Only close menu if clicking outside, not on text
          if (!e.defaultPrevented) {
            setShowContextMenu(false);
          }
        }}
      >
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

        {/* Context Menu */}
        {showContextMenu && (
          <div
            className="fixed bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-50"
            style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedText && (
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    await navigator.clipboard.writeText(selectedText);
                    setShowContextMenu(false);
                  } catch (err) {
                    console.error('Failed to copy:', err);
                    // Fallback: try using execCommand
                    try {
                      const textArea = document.createElement('textarea');
                      textArea.value = selectedText;
                      textArea.style.position = 'fixed';
                      textArea.style.opacity = '0';
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      setShowContextMenu(false);
                    } catch (fallbackErr) {
                      console.error('Fallback copy also failed:', fallbackErr);
                    }
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 font-mono border-b border-gray-700"
              >
                Copy ({selectedText.length} chars)
              </button>
            )}
            <button
              onClick={async () => {
                try {
                  const allText = output.join('\n');
                  await navigator.clipboard.writeText(allText);
                  setShowContextMenu(false);
                } catch (err) {
                  console.error('Failed to copy all:', err);
                }
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 font-mono border-b border-gray-700"
            >
              Copy All
            </button>
            <button
              onClick={() => {
                onClearOutput?.();
                setShowContextMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 font-mono"
            >
              Clear Console
            </button>
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
