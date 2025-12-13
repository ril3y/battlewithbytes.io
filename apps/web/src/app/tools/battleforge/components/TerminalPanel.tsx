'use client';

import { useEffect, useRef } from 'react';

interface TerminalPanelProps {
  output: Array<{
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
    timestamp?: string;
  }>;
}

export function TerminalPanel({ output }: TerminalPanelProps) {
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const getTypePrefix = (type: string) => {
    switch (type) {
      case 'error':
        return '[ERR]';
      case 'warning':
        return '[WRN]';
      case 'success':
        return '[OK]';
      default:
        return '[INF]';
    }
  };

  return (
    <div className="terminal-panel">
      <div className="terminal-header">
        <span className="terminal-title">Output</span>
        <span className="terminal-count">{output.length} lines</span>
      </div>
      <div className="terminal-output" ref={outputRef}>
        {output.map((line, index) => (
          <div key={index} className={`terminal-line ${line.type}`}>
            <span className="line-number">{(index + 1).toString().padStart(3, ' ')}</span>
            <span className={`line-prefix ${line.type}`}>{getTypePrefix(line.type)}</span>
            {line.timestamp && <span className="line-timestamp">[{line.timestamp}]</span>}
            <span className="line-message">{line.message}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .terminal-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #0a0a0a;
          border-top: 1px solid #333;
        }

        .terminal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #111;
          border-bottom: 1px solid #333;
          flex-shrink: 0;
        }

        .terminal-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          font-weight: 600;
          color: #ededed;
        }

        .terminal-count {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: #666;
        }

        .terminal-output {
          flex: 1;
          overflow-y: auto;
          overflow-x: auto;
          padding: 8px 0;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 12px;
          line-height: 1.5;
        }

        .terminal-output::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .terminal-output::-webkit-scrollbar-track {
          background: #111;
        }

        .terminal-output::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }

        .terminal-output::-webkit-scrollbar-thumb:hover {
          background: #00ff9d;
        }

        .terminal-line {
          display: flex;
          gap: 8px;
          padding: 2px 12px;
          white-space: nowrap;
        }

        .terminal-line:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .line-number {
          color: #444;
          min-width: 3ch;
          text-align: right;
          user-select: none;
        }

        .line-prefix {
          min-width: 5ch;
          font-weight: 600;
        }

        .line-prefix.info {
          color: #0088ff;
        }

        .line-prefix.success {
          color: #10b981;
        }

        .line-prefix.error {
          color: #ef4444;
        }

        .line-prefix.warning {
          color: #f59e0b;
        }

        .line-timestamp {
          color: #555;
        }

        .line-message {
          color: #ccc;
        }

        .terminal-line.success .line-message {
          color: #10b981;
        }

        .terminal-line.error .line-message {
          color: #ef4444;
        }

        .terminal-line.warning .line-message {
          color: #f59e0b;
        }

        .terminal-line.info .line-message {
          color: #ccc;
        }
      `}</style>
    </div>
  );
}
