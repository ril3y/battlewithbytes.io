'use client';

/**
 * BattleTerm - Main Component
 * A professional browser-based serial terminal using the Web Serial API
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ConnectionPanel from './ConnectionPanel';
import ConfigurationModal from './ConfigurationModal';
import HelpModal from './HelpModal';
import TerminalDisplay, { TerminalDisplayRef } from './TerminalDisplay';
import TerminalInput from './TerminalInput';
import TerminalContextMenu from './TerminalContextMenu';
import StatusBar from './StatusBar';
import VersionChecker from './VersionChecker';
import type {
  SerialConfig,
  TerminalOptions,
  SendOptions,
  TerminalState,
  ConnectionStats,
  ViewMode
} from './serialTerminal.types';
import {
  DEFAULT_SERIAL_CONFIG,
  DEFAULT_TERMINAL_OPTIONS,
  DEFAULT_SEND_OPTIONS
} from './serialTerminal.types';
import {
  isSerialSupported,
  requestSerialPort,
  openSerialPort,
  closeSerialPort,
  formatDataForSend,
  parseSerialData,
  bytesToHex
} from './serialUtils';
import { downloadTerminalLog, formatWithTimestamp } from './terminalUtils';
import { saveLastConfig, loadLastConfig } from './configManager';

interface SerialTerminalProps {
  isStandalone?: boolean;
}

export default function SerialTerminal({ isStandalone = false }: SerialTerminalProps) {
  // Terminal reference
  const terminalRef = useRef<TerminalDisplayRef>(null);

  // Line number counter
  const lineNumberRef = useRef<number>(1);

  // Buffer for incomplete lines
  const lineBufferRef = useRef<string>('');

  // View mode ref for real-time access in read loop
  const viewModeRef = useRef<ViewMode>('ascii');

  // Configuration state
  const [serialConfig, setSerialConfig] = useState<SerialConfig>(DEFAULT_SERIAL_CONFIG);
  const [terminalOptions, setTerminalOptions] = useState<TerminalOptions>(DEFAULT_TERMINAL_OPTIONS);
  const [sendOptions, setSendOptions] = useState<SendOptions>(DEFAULT_SEND_OPTIONS);

  // Connection state
  const [terminalState, setTerminalState] = useState<TerminalState>({
    isConnected: false,
    port: null,
    reader: null,
    writer: null,
    bytesReceived: 0,
    bytesSent: 0,
    connectionTime: 0,
    error: null
  });

  // UI state
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [autoScroll] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('ascii');

  // Modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Activity state for TX/RX LEDs
  const [rxActive, setRxActive] = useState(false);
  const [txActive, setTxActive] = useState(false);

  // Context menu state
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [hasSelection, setHasSelection] = useState(false);

  // Stats state
  const [stats, setStats] = useState<ConnectionStats>({
    bytesReceived: 0,
    bytesSent: 0,
    connectionDuration: 0,
    receiveRate: 0,
    sendRate: 0
  });

  // Reading flag to prevent multiple read loops
  const isReading = useRef(false);
  const connectionStartTime = useRef<number>(0);
  const statsInterval = useRef<NodeJS.Timeout | null>(null);
  const rxLedTimeout = useRef<NodeJS.Timeout | null>(null);
  const txLedTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load last config on mount
  useEffect(() => {
    const lastConfig = loadLastConfig();
    if (lastConfig) {
      setSerialConfig(lastConfig.serialConfig);
      setTerminalOptions(lastConfig.terminalOptions);
      setSendOptions(lastConfig.sendOptions);
    }
  }, []);

  // Save config when changed
  useEffect(() => {
    if (terminalState.isConnected || serialConfig !== DEFAULT_SERIAL_CONFIG) {
      saveLastConfig(serialConfig, terminalOptions, sendOptions);
    }
  }, [serialConfig, terminalOptions, sendOptions, terminalState.isConnected]);

  // Keep viewModeRef in sync with viewMode state for real-time switching
  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  // Update stats periodically
  useEffect(() => {
    if (terminalState.isConnected) {
      statsInterval.current = setInterval(() => {
        const duration = Date.now() - connectionStartTime.current;
        const rxRate = Math.round((terminalState.bytesReceived / duration) * 1000);
        const txRate = Math.round((terminalState.bytesSent / duration) * 1000);

        setStats({
          bytesReceived: terminalState.bytesReceived,
          bytesSent: terminalState.bytesSent,
          connectionDuration: duration,
          receiveRate: rxRate || 0,
          sendRate: txRate || 0
        });
      }, 1000);
    } else {
      if (statsInterval.current) {
        clearInterval(statsInterval.current);
        statsInterval.current = null;
      }
    }

    return () => {
      if (statsInterval.current) {
        clearInterval(statsInterval.current);
      }
    };
  }, [terminalState.isConnected, terminalState.bytesReceived, terminalState.bytesSent]);

  // Send data to serial port (used by inline terminal command input)
  const handleCommand = useCallback(async (command: string) => {
    if (!terminalState.writer || !terminalState.isConnected) {
      return;
    }

    try {
      const bytes = formatDataForSend(command, sendOptions.lineEnding, sendOptions.sendAsHex);
      await terminalState.writer.write(bytes);

      // Local echo
      if (sendOptions.localEcho) {
        const echoText = sendOptions.sendAsHex ? `[TX HEX] ${command}` : `> ${command}`;
        terminalRef.current?.writeln(`\x1b[36m${echoText}\x1b[0m`);
      }

      // Update byte count and trigger TX LED
      setTerminalState(prev => ({
        ...prev,
        bytesSent: prev.bytesSent + bytes.length
      }));

      // Blink TX LED - clear any existing timeout first
      if (txLedTimeout.current) {
        clearTimeout(txLedTimeout.current);
      }
      setTxActive(true);
      txLedTimeout.current = setTimeout(() => {
        setTxActive(false);
        txLedTimeout.current = null;
      }, 100);

      if (autoScroll) {
        terminalRef.current?.scrollToBottom();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      terminalRef.current?.writeln(`\x1b[31m✗ Send error: ${message}\x1b[0m`);
      setTerminalState(prev => ({
        ...prev,
        error: `Send error: ${message}`
      }));
    }
  }, [terminalState, sendOptions, autoScroll]);

  // Keyboard shortcuts (Ctrl+C to copy, Ctrl+V to paste)
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ctrl+C - Copy selection
      if (e.ctrlKey && e.key === 'c' && !e.shiftKey) {
        const selection = terminalRef.current?.getSelection() || '';
        if (selection) {
          e.preventDefault();
          try {
            await navigator.clipboard.writeText(selection);
          } catch (error) {
            console.error('Copy failed:', error);
          }
        }
      }
      // Ctrl+V - Paste
      else if (e.ctrlKey && e.key === 'v' && !e.shiftKey) {
        if (terminalState.isConnected) {
          e.preventDefault();
          try {
            const text = await navigator.clipboard.readText();
            if (text) {
              await handleCommand(text);
            }
          } catch (error) {
            console.error('Paste failed:', error);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [terminalState.isConnected, handleCommand]);

  // Read from serial port
  const readFromPort = useCallback(async (port: SerialPort, reader: ReadableStreamDefaultReader<Uint8Array>) => {
    if (isReading.current) return;
    isReading.current = true;

    try {
      while (port.readable && isReading.current) {
        const { value, done } = await reader.read();

        if (done || !value) {
          break;
        }

        // Parse and display data
        const parsed = parseSerialData(value);

        // In hex mode, show only raw hex bytes (no text processing)
        // Use ref instead of state for real-time mode switching
        if (viewModeRef.current === 'hex') {
          const hexStr = bytesToHex(value, { uppercase: true, separator: ' ', bytesPerLine: 0 });
          terminalRef.current?.write(hexStr + ' ');
        } else {
          // ASCII mode: process text with line buffering
          // Add to buffer
          lineBufferRef.current += parsed.text;

          // Split into lines
          const lines = lineBufferRef.current.split('\n');

          // Keep last incomplete line in buffer
          lineBufferRef.current = lines.pop() || '';

          // Process complete lines
          if (lines.length > 0) {
            const output = lines.map(line => {
              let processedLine = line;

              // Add timestamp to each complete line
              if (showTimestamps) {
                processedLine = formatWithTimestamp(processedLine, parsed.timestamp);
              }

              // Add line number to each complete line
              if (showLineNumbers) {
                const lineNum = lineNumberRef.current++;
                processedLine = `\x1b[2;90m${String(lineNum).padStart(4, ' ')}|\x1b[0m ${processedLine}`;
              }

              return processedLine;
            }).join('\n') + '\n'; // Add back the newline

            terminalRef.current?.write(output);
          }
        }

        if (autoScroll) {
          terminalRef.current?.scrollToBottom();
        }

        // Update byte count and trigger RX LED
        setTerminalState(prev => ({
          ...prev,
          bytesReceived: prev.bytesReceived + value.length
        }));

        // Blink RX LED - clear any existing timeout first
        if (rxLedTimeout.current) {
          clearTimeout(rxLedTimeout.current);
        }
        setRxActive(true);
        rxLedTimeout.current = setTimeout(() => {
          setRxActive(false);
          rxLedTimeout.current = null;
        }, 100);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'NetworkError') {
        console.error('Read error:', error);
        const errorMessage = error.message;
        setTerminalState(prev => ({
          ...prev,
          error: `Read error: ${errorMessage}`
        }));
      }
    } finally {
      isReading.current = false;
    }
  }, [showTimestamps, autoScroll, showLineNumbers]);

  // Connect to serial port
  const handleConnect = useCallback(async () => {
    if (!isSerialSupported()) {
      setTerminalState(prev => ({
        ...prev,
        error: 'Web Serial API not supported in this browser'
      }));
      terminalRef.current?.writeln('\x1b[31mError: Web Serial API not supported\x1b[0m');
      return;
    }

    try {
      // Stop animation and clear terminal
      terminalRef.current?.stopAnimation();
      lineNumberRef.current = 1; // Reset line counter for new connection
      lineBufferRef.current = ''; // Clear line buffer for new connection

      const port = await requestSerialPort();
      await openSerialPort(port, serialConfig);

      const reader = port.readable?.getReader();
      const writer = port.writable?.getWriter();

      if (!reader || !writer) {
        throw new Error('Failed to get port streams');
      }

      connectionStartTime.current = Date.now();

      setTerminalState({
        isConnected: true,
        port,
        reader,
        writer,
        bytesReceived: 0,
        bytesSent: 0,
        connectionTime: Date.now(),
        error: null
      });

      // Start reading
      readFromPort(port, reader);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setTerminalState(prev => ({
        ...prev,
        error: message
      }));
      terminalRef.current?.writeln(`\x1b[31m✗ Connection failed: ${message}\x1b[0m`);
    }
  }, [serialConfig, readFromPort]);

  // Disconnect from serial port
  const handleDisconnect = useCallback(async () => {
    try {
      isReading.current = false;

      if (terminalState.reader) {
        await terminalState.reader.cancel();
      }

      if (terminalState.writer) {
        terminalState.writer.releaseLock();
      }

      if (terminalState.port) {
        await closeSerialPort(terminalState.port);
      }

      // Clear LED timeouts
      if (rxLedTimeout.current) {
        clearTimeout(rxLedTimeout.current);
        rxLedTimeout.current = null;
      }
      if (txLedTimeout.current) {
        clearTimeout(txLedTimeout.current);
        txLedTimeout.current = null;
      }
      setRxActive(false);
      setTxActive(false);

      setTerminalState({
        isConnected: false,
        port: null,
        reader: null,
        writer: null,
        bytesReceived: 0,
        bytesSent: 0,
        connectionTime: 0,
        error: null
      });
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, [terminalState]);

  // Terminal controls
  const handleClear = useCallback(() => {
    terminalRef.current?.clear();
    lineNumberRef.current = 1; // Reset line counter
    lineBufferRef.current = ''; // Clear line buffer
  }, []);

  const handleDownloadLog = useCallback(() => {
    const content = terminalRef.current?.getContent() || '';
    downloadTerminalLog(content);
  }, []);

  // Context menu handlers
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });

    // Check if there's a selection in the terminal
    const selection = terminalRef.current?.getSelection() || '';
    setHasSelection(selection.length > 0);
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenuPosition(null);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      const selection = terminalRef.current?.getSelection();
      if (selection) {
        await navigator.clipboard.writeText(selection);
      }
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, []);

  const handlePaste = useCallback(async () => {
    if (!terminalState.isConnected) return;

    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        await handleCommand(text);
      }
    } catch (error) {
      console.error('Paste failed:', error);
    }
  }, [terminalState.isConnected, handleCommand]);

  // Toggle view mode
  const handleViewModeToggle = useCallback(() => {
    // Clear line buffer when switching modes to prevent data mixing
    lineBufferRef.current = '';
    setViewMode(prev => {
      const newMode = prev === 'ascii' ? 'hex' : 'ascii';
      viewModeRef.current = newMode; // Update ref for real-time switching
      return newMode;
    });
  }, []);

  // Browser support check
  if (!isSerialSupported()) {
    return (
      <div className="p-8 bg-red-900/20 border border-red-600/50 rounded-lg">
        <h3 className="text-xl font-bold text-red-400 mb-4">Browser Not Supported</h3>
        <p className="text-red-300 mb-4">
          This tool requires the Web Serial API, which is not supported in your current browser.
        </p>
        <p className="text-red-300">
          Please use <strong>Chrome</strong>, <strong>Edge</strong>, or <strong>Opera</strong> to access this feature.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border-2 border-green-500/30 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.15)] overflow-hidden">
      {/* Connection Panel with Toolbar */}
      <div className="border-b border-green-500/20">
        <ConnectionPanel
          isConnected={terminalState.isConnected}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          error={terminalState.error}
          onConfigClick={() => setShowConfigModal(true)}
          onHelpClick={() => setShowHelpModal(true)}
          onClear={handleClear}
          onDownloadLog={handleDownloadLog}
        />
      </div>

      {/* Terminal Display with Context Menu */}
      <div
        className="bg-black"
        onContextMenu={handleContextMenu}
      >
        <TerminalDisplay
          ref={terminalRef}
          options={terminalOptions}
          isConnected={terminalState.isConnected}
        />
      </div>

      {/* Terminal Input Area - Fixed at Bottom */}
      <TerminalInput
        isConnected={terminalState.isConnected}
        onCommand={handleCommand}
      />

      {/* Status Bar */}
      <div className="border-t border-green-500/20">
        <StatusBar
          stats={stats}
          isConnected={terminalState.isConnected}
          viewMode={viewMode}
          onViewModeToggle={handleViewModeToggle}
          rxActive={rxActive}
          txActive={txActive}
          isStandalone={isStandalone}
        />
      </div>

      {/* Configuration Modal */}
      <ConfigurationModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        config={serialConfig}
        onChange={setSerialConfig}
        disabled={terminalState.isConnected}
        sendOptions={sendOptions}
        onSendOptionsChange={setSendOptions}
        showTimestamps={showTimestamps}
        onToggleTimestamps={() => setShowTimestamps(prev => !prev)}
        showLineNumbers={showLineNumbers}
        onToggleLineNumbers={() => setShowLineNumbers(prev => !prev)}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Terminal Context Menu */}
      <TerminalContextMenu
        position={contextMenuPosition}
        onClose={handleCloseContextMenu}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onClear={handleClear}
        hasSelection={hasSelection}
      />

      {/* Version Update Checker for PWA */}
      <VersionChecker />
    </div>
  );
}
