'use client';

/**
 * Terminal Input Component
 * A distinct, fixed input area at the bottom of the terminal
 * Handles command input, history, and auto-completion
 */

import React, { useState, useRef, useCallback, useEffect, KeyboardEvent, ChangeEvent } from 'react';

export interface TerminalInputProps {
  isConnected: boolean;
  onCommand: (command: string) => void;
  placeholder?: string;
}

export default function TerminalInput({
  isConnected,
  onCommand,
  placeholder = 'Type a command and press Enter...'
}: TerminalInputProps) {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle input change
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setHistoryIndex(-1); // Reset history navigation when typing
  }, []);

  // Handle key down for command history and submission
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    // Arrow Up - previous command
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    }
    // Arrow Down - next command
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
    // Enter - send command
    else if (e.key === 'Enter') {
      e.preventDefault();
      const command = input.trim();

      if (command && isConnected) {
        // Add to history (most recent first)
        setCommandHistory(prev => {
          const newHistory = [command, ...prev.filter(cmd => cmd !== command)];
          return newHistory.slice(0, 50); // Keep last 50 commands
        });

        // Send command
        onCommand(command);

        // Clear input
        setInput('');
        setHistoryIndex(-1);
      }
    }
  }, [input, commandHistory, historyIndex, isConnected, onCommand]);

  // Focus input when connected
  const handleFocus = useCallback(() => {
    if (isConnected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isConnected]);

  return (
    <div
      className="terminal-input-container bg-gray-800/90 border-t border-green-500/30 px-4 py-3 flex items-center gap-3 shadow-[0_-2px_10px_rgba(34,197,94,0.1)]"
      onClick={handleFocus}
    >
      {/* Prompt indicator */}
      <div className="flex-shrink-0">
        <span className="text-green-400 font-bold text-lg select-none">
          &gt;
        </span>
      </div>

      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={!isConnected}
        placeholder={isConnected ? placeholder : 'Connect to a serial port to begin...'}
        className={`
          flex-1 bg-transparent border-none outline-none text-white font-mono text-sm
          placeholder:text-gray-500
          disabled:cursor-not-allowed disabled:opacity-50
          ${isConnected ? 'cursor-text' : ''}
        `}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
}
