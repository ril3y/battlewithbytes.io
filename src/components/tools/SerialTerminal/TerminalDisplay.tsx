'use client';

/**
 * Terminal Display Component
 * xterm.js integration for terminal emulation
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { Terminal } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';
import type { TerminalOptions } from './serialTerminal.types';
import { getXtermOptions } from './terminalUtils';
import { VERSION, formatChangelogForTerminal, getLatestChangelog } from './version';
import '@xterm/xterm/css/xterm.css';

// Extended Terminal type with scroll interval
interface TerminalWithAnimation extends Terminal {
  __scrollInterval?: NodeJS.Timeout;
}

export interface TerminalDisplayRef {
  write: (data: string) => void;
  writeln: (data: string) => void;
  clear: () => void;
  getContent: () => string;
  getSelection: () => string;
  scrollToBottom: () => void;
  focus: () => void;
  stopAnimation: () => void;
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

      let mounted = true;

      // Dynamically import xterm modules (client-side only)
      const initTerminal = async () => {
        const { Terminal } = await import('@xterm/xterm');
        const { FitAddon } = await import('@xterm/addon-fit');
        const { WebLinksAddon } = await import('@xterm/addon-web-links');

        if (!mounted || !containerRef.current) return;

        // Create terminal instance
        const terminal = new Terminal(getXtermOptions(options));
        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();

        terminal.loadAddon(fitAddon);
        terminal.loadAddon(webLinksAddon);

        terminal.open(containerRef.current);
        fitAddon.fit();

        // Handle user input (for raw data mode if needed)
        if (onData) {
          terminal.onData((data) => {
            onData(data);
          });
        }

        // Store refs
        terminalRef.current = terminal;
        fitAddonRef.current = fitAddon;

        // Scrolling animation for banner - no box, just clean text
        const bannerLines = [
          '',
          '   \x1b[1;32m███████╗  ██████╗  ████████╗ ████████╗ ██╗     ███████╗\x1b[0m',
          '   \x1b[1;32m██╔══██╗ ██╔══██╗ ╚══██╔══╝ ╚══██╔══╝ ██║     ██╔════╝\x1b[0m',
          '   \x1b[1;32m██████╦╝ ███████║    ██║       ██║    ██║     █████╗\x1b[0m',
          '   \x1b[1;32m██╔══██╗ ██╔══██║    ██║       ██║    ██║     ██╔══╝\x1b[0m',
          '   \x1b[1;32m███████║ ██║  ██║    ██║       ██║    ███████╗███████╗\x1b[0m',
          '   \x1b[1;32m╚══════╝ ╚═╝  ╚═╝    ╚═╝       ╚═╝    ╚══════╝╚══════╝\x1b[0m',
          '',
          '              \x1b[1;35m████████╗ ███████╗ ██████╗  ███╗   ███╗\x1b[0m',
          '              \x1b[1;35m╚══██╔══╝ ██╔════╝ ██╔══██╗ ████╗ ████║\x1b[0m',
          '                 \x1b[1;35m██║    █████╗   ██████╔╝ ██╔████╔██║\x1b[0m',
          '                 \x1b[1;35m██║    ██╔══╝   ██╔══██╗ ██║╚██╔╝██║\x1b[0m',
          '                 \x1b[1;35m██║    ███████╗ ██║  ██║ ██║ ╚═╝ ██║\x1b[0m',
          '                 \x1b[1;35m╚═╝    ╚══════╝ ╚═╝  ╚═╝ ╚═╝     ╚═╝\x1b[0m',
          '',
          '                    \x1b[1;33mBrowser-Based Serial Terminal\x1b[0m',
          `                       \x1b[0;37mVersion ${VERSION} • 2025\x1b[0m`,
          '                    \x1b[0;36mhttps://battlewithbytes.io\x1b[0m',
          '',
          '\x1b[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m',
          ''
        ];

        // Get changelog for display
        const changelog = getLatestChangelog();
        const changelogLines = formatChangelogForTerminal(changelog, 5);

        // Typewriter text with delays and varied colors
        const typewriterText = [
          { text: '\x1b[1;33m  Getting Started:\x1b[0m', delay: 500 },
          { text: '\x1b[0;36m  • Click the \x1b[1;32mConnect\x1b[0;36m button above to select your serial port\x1b[0m', delay: 80 },
          { text: '\x1b[0;36m  • Configure baud rate and settings via the \x1b[1;35m⚙\x1b[0;36m icon\x1b[0m', delay: 80 },
          { text: '\x1b[0;36m  • Use \x1b[1;33m↑/↓\x1b[0;36m arrows for command history\x1b[0m', delay: 80 },
          { text: '', delay: 50 },
          ...changelogLines.map((line, idx) => ({
            text: line,
            delay: idx === 0 ? 300 : 80
          })),
          { text: '', delay: 50 },
          { text: '\x1b[1;32m  Quick Features:\x1b[0m', delay: 200 },
          { text: '\x1b[0;35m  ◆ \x1b[0;37mANSI colors\x1b[0;90m  ◆ \x1b[0;37mHex view\x1b[0;90m  ◆ \x1b[0;37mCommand history\x1b[0;90m  ◆ \x1b[0;37mCopy/paste\x1b[0m', delay: 80 },
          { text: '\x1b[0;35m  ◆ \x1b[0;37mDownload logs\x1b[0;90m  ◆ \x1b[0;37mTimestamps\x1b[0;90m  ◆ \x1b[0;37mTX/RX indicators\x1b[0m', delay: 80 },
          { text: '', delay: 50 },
          { text: '\x1b[2;32m  ► Ready. Click \x1b[1;32mConnect\x1b[2;32m to begin...\x1b[0m', delay: 80 }
        ];

        let bannerIndex = 0;

        // Scroll in banner
        const scrollInterval = setInterval(() => {
          if (bannerIndex < bannerLines.length) {
            terminal.writeln(bannerLines[bannerIndex]);
            bannerIndex++;
          } else {
            // Banner complete, start typewriter
            clearInterval(scrollInterval);

            // Typewriter effect - write line by line with delays
            let typewriterIndex = 0;
            const writeNextLine = () => {
              if (typewriterIndex < typewriterText.length) {
                const current = typewriterText[typewriterIndex];
                terminal.writeln(current.text);
                typewriterIndex++;

                // Schedule next line with delay
                const timeout = setTimeout(writeNextLine, current.delay);
                (terminal as TerminalWithAnimation).__scrollInterval = timeout;
              }
            };

            // Start typewriter with initial delay
            const initialTimeout = setTimeout(writeNextLine, 300);
            (terminal as TerminalWithAnimation).__scrollInterval = initialTimeout;
          }
        }, 80);

        // Handle window resize
        const handleResize = () => {
          if (fitAddonRef.current) {
            fitAddonRef.current.fit();
          }
        };

        window.addEventListener('resize', handleResize);

        // Store cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          clearInterval(scrollInterval);
          const terminalWithAnim = terminal as TerminalWithAnimation;
          if (terminalWithAnim.__scrollInterval) {
            clearTimeout(terminalWithAnim.__scrollInterval);
          }
          terminal.dispose();
        };
      };

      let cleanup: (() => void) | undefined;
      initTerminal().then(fn => { cleanup = fn; });

      // Cleanup
      return () => {
        mounted = false;
        if (cleanup) cleanup();
        terminalRef.current = null;
        fitAddonRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      getSelection: () => {
        if (terminalRef.current) {
          return terminalRef.current.getSelection();
        }
        return '';
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
      },
      stopAnimation: () => {
        if (terminalRef.current) {
          const terminal = terminalRef.current as TerminalWithAnimation;
          if (terminal.__scrollInterval) {
            clearTimeout(terminal.__scrollInterval);
            terminal.__scrollInterval = undefined;
          }
          terminalRef.current.clear();
          contentBuffer.current = '';
        }
      }
    }), []);

    return (
      <div
        ref={containerRef}
        className="terminal-container h-full min-h-[40vh] md:min-h-[50vh] lg:min-h-[55vh] rounded bg-black"
        style={{ padding: '8px' }}
      />
    );
  }
);

TerminalDisplay.displayName = 'TerminalDisplay';

export default TerminalDisplay;
