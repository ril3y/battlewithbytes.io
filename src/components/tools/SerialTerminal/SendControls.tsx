/**
 * Send Controls Component
 * Input field and controls for sending data
 */

import React, { useState, useEffect, useRef } from 'react';
import type { SendControlsProps } from './serialTerminal.types';
import { getCommandHistory, saveCommandToHistory } from './terminalUtils';

export default function SendControls({
  onSend,
  disabled,
  sendOptions,
  onOptionsChange
}: SendControlsProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(getCommandHistory());
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      await onSend(input);
      saveCommandToHistory(input);
      setHistory(getCommandHistory());
      setInput('');
      setHistoryIndex(-1);
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="p-4 bg-black/30 border border-gray-800 rounded-lg space-y-3">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={sendOptions.sendAsHex ? "Enter hex (e.g., 48 65 6C 6C 6F)" : "Enter command..."}
          className="flex-1 px-3 py-2 bg-black border border-gray-700 rounded text-white font-mono text-sm focus:border-green-400 focus:outline-none"
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-mono text-sm rounded transition-colors"
        >
          Send
        </button>
      </div>

      {/* Send Options */}
      <div className="flex flex-wrap gap-4 text-sm">
        {/* Line Ending */}
        <div className="flex items-center gap-2">
          <label className="text-gray-400 font-mono">Line End:</label>
          <select
            value={sendOptions.lineEnding}
            onChange={(e) =>
              onOptionsChange({
                ...sendOptions,
                lineEnding: e.target.value as any
              })
            }
            className="px-2 py-1 bg-black border border-gray-700 rounded text-white font-mono text-xs"
            disabled={disabled}
          >
            <option value="none">None</option>
            <option value="cr">CR (\r)</option>
            <option value="lf">LF (\n)</option>
            <option value="crlf">CR+LF (\r\n)</option>
          </select>
        </div>

        {/* Local Echo */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sendOptions.localEcho}
            onChange={(e) =>
              onOptionsChange({
                ...sendOptions,
                localEcho: e.target.checked
              })
            }
            className="w-4 h-4 rounded border-gray-700 bg-black text-green-600 focus:ring-green-500"
            disabled={disabled}
          />
          <span className="text-gray-400 font-mono">Local Echo</span>
        </label>

        {/* Send as Hex */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sendOptions.sendAsHex}
            onChange={(e) =>
              onOptionsChange({
                ...sendOptions,
                sendAsHex: e.target.checked
              })
            }
            className="w-4 h-4 rounded border-gray-700 bg-black text-green-600 focus:ring-green-500"
            disabled={disabled}
          />
          <span className="text-gray-400 font-mono">Send as Hex</span>
        </label>
      </div>

      {/* Hint */}
      <div className="text-xs text-gray-500 font-mono">
        Press Enter to send • ↑/↓ for command history
      </div>
    </div>
  );
}
