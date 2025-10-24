/**
 * Terminal Display Component
 * xterm.js integration for terminal emulation
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import type { TerminalOptions } from './serialTerminal.types';
import { getXtermOptions } from './terminalUtils';
import '@xterm/xterm/css/xterm.css';

export interface TerminalDisplayRef {
  write: (data: string) => void;
  writeln: (data: string) => void;
  clear: () => void;
  getContent: () => string;
  scrollToBottom: () => void;
  focus: () => void;
}

interface TerminalDisplayProps {
  options: TerminalOptions;
  onData?: (data: string) => void;
}

const TerminalDisplay = forwardRef<TerminalDisplayRef, TerminalDisplayProps>(
  ({ options, onData }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const contentBuffer = useRef<string>('');

    // Initialize terminal
    useEffect(() => {
      if (!containerRef.current) return;

      // Create terminal instance
      const terminal = new Terminal(getXtermOptions(options));
      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      terminal.loadAddon(fitAddon);
      terminal.loadAddon(webLinksAddon);

      terminal.open(containerRef.current);
      fitAddon.fit();

      // Handle user input (if onData callback is provided)
      if (onData) {
        terminal.onData(onData);
      }

      // Store refs
      terminalRef.current = terminal;
      fitAddonRef.current = fitAddon;

      // Welcome message
      terminal.writeln('\x1b[1;32m╔════════════════════════════════════════════════════════════╗\x1b[0m');
      terminal.writeln('\x1b[1;32m║         Serial Terminal - Battle With Bytes               ║\x1b[0m');
      terminal.writeln('\x1b[1;32m╚════════════════════════════════════════════════════════════╝\x1b[0m');
      terminal.writeln('');
      terminal.writeln('\x1b[33mConnect to a serial port to begin...\x1b[0m');
      terminal.writeln('');

      // Handle window resize
      const handleResize = () => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit();
        }
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        terminal.dispose();
        terminalRef.current = null;
        fitAddonRef.current = null;
      };
    }, []);

    // Update terminal options when they change
    useEffect(() => {
      if (!terminalRef.current) return;

      const terminal = terminalRef.current;
      const xtermOptions = getXtermOptions(options);

      terminal.options = {
        ...terminal.options,
        ...xtermOptions
      };

      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    }, [options]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      write: (data: string) => {
        if (terminalRef.current) {
          terminalRef.current.write(data);
          contentBuffer.current += data;
        }
      },
      writeln: (data: string) => {
        if (terminalRef.current) {
          terminalRef.current.writeln(data);
          contentBuffer.current += data + '\n';
        }
      },
      clear: () => {
        if (terminalRef.current) {
          terminalRef.current.clear();
          contentBuffer.current = '';
        }
      },
      getContent: () => {
        return contentBuffer.current;
      },
      scrollToBottom: () => {
        if (terminalRef.current) {
          terminalRef.current.scrollToBottom();
        }
      },
      focus: () => {
        if (terminalRef.current) {
          terminalRef.current.focus();
        }
      }
    }));

    return (
      <div
        ref={containerRef}
        className="terminal-container h-full min-h-[400px] rounded bg-black"
        style={{ padding: '8px' }}
      />
    );
  }
);

TerminalDisplay.displayName = 'TerminalDisplay';

export default TerminalDisplay;
