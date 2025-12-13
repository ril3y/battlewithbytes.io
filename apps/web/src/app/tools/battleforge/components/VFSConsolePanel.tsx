'use client';

import { useState, useRef, useEffect } from 'react';
import { VFSCommands } from '../lib/vfs/VFSCommands';
import { VirtualFileSystem } from '../lib/wasi/wasiBindings';

interface ConsoleLine {
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp?: number;
}

interface VFSConsolePanelProps {
  fs: VirtualFileSystem;
  onClose?: () => void;
}

export function VFSConsolePanel({ fs, onClose }: VFSConsolePanelProps) {
  const [lines, setLines] = useState<ConsoleLine[]>([
    { type: 'output', content: 'BattleForge Virtual File System Console', timestamp: Date.now() },
    { type: 'output', content: 'Type "help" for available commands\n', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const commandsRef = useRef(new VFSCommands(fs));

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCommand = (command: string) => {
    if (!command.trim()) return;

    // Add command to lines
    setLines(prev => [...prev, { type: 'command', content: `$ ${command}`, timestamp: Date.now() }]);

    // Add to history
    setHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Execute command
    const result = commandsRef.current.execute(command);

    // Add output to lines
    if (result.output) {
      setLines(prev => [
        ...prev,
        {
          type: result.exitCode === 0 ? 'output' : 'error',
          content: result.output,
          timestamp: Date.now()
        }
      ]);
    }

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = Math.min(history.length - 1, historyIndex + 1);
        if (newIndex === history.length - 1 && historyIndex === history.length - 1) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([
        { type: 'output', content: 'BattleForge Virtual File System Console', timestamp: Date.now() },
        { type: 'output', content: 'Type "help" for available commands\n', timestamp: Date.now() }
      ]);
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setInput('');
    }
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="vfs-console-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
      fontFamily: 'var(--font-mono)',
      fontSize: '13px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid var(--accent-primary)',
        backgroundColor: '#252525'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-primary)' }}>$</span>
          <span>VFS Console</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0 4px'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Terminal Output */}
      <div
        ref={outputRef}
        onClick={handleTerminalClick}
        style={{
          flex: 1,
          padding: '12px',
          overflowY: 'auto',
          cursor: 'text',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {lines.map((line, index) => (
          <div
            key={index}
            style={{
              color: line.type === 'command'
                ? 'var(--accent-primary)'
                : line.type === 'error'
                  ? '#f48771'
                  : '#d4d4d4',
              marginBottom: line.content.endsWith('\n\n') ? '8px' : '0'
            }}
          >
            {line.content}
          </div>
        ))}

        {/* Input Line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-primary)' }}>$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#d4d4d4',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              padding: 0
            }}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Status Bar */}
      <div style={{
        padding: '4px 12px',
        borderTop: '1px solid var(--accent-primary)',
        backgroundColor: '#252525',
        fontSize: '11px',
        color: '#888'
      }}>
        <span>Press Ctrl+L to clear, Ctrl+C to cancel, ↑↓ for history</span>
      </div>
    </div>
  );
}
