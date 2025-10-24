'use client';

/**
 * Serial Terminal - Main Component
 * A modern web-based serial terminal using the Web Serial API
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ConnectionPanel from './ConnectionPanel';
import ConfigurationPanel from './ConfigurationPanel';
import TerminalDisplay, { TerminalDisplayRef } from './TerminalDisplay';
import SendControls from './SendControls';
import StatusBar from './StatusBar';
import AdvancedControls from './AdvancedControls';
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
  bytesToHex,
  getPortInfo
} from './serialUtils';
import { downloadTerminalLog, formatWithTimestamp } from './terminalUtils';
import { saveLastConfig, loadLastConfig } from './configManager';

export default function SerialTerminal() {
  // Terminal reference
  const terminalRef = useRef<TerminalDisplayRef>(null);

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
  const [showHex, setShowHex] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('ascii');

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
        let output = parsed.text;

        if (showTimestamps) {
          output = formatWithTimestamp(output, parsed.timestamp);
        }

        if (showHex) {
          const hexStr = bytesToHex(value, { uppercase: true, separator: ' ' });
          output = `[HEX] ${hexStr}\n${output}`;
        }

        terminalRef.current?.write(output);

        if (autoScroll) {
          terminalRef.current?.scrollToBottom();
        }

        // Update byte count
        setTerminalState(prev => ({
          ...prev,
          bytesReceived: prev.bytesReceived + value.length
        }));
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'NetworkError') {
        console.error('Read error:', error);
        setTerminalState(prev => ({
          ...prev,
          error: `Read error: ${error.message}`
        }));
      }
    } finally {
      isReading.current = false;
    }
  }, [showTimestamps, showHex, autoScroll]);

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
      terminalRef.current?.writeln('\x1b[33mRequesting serial port...\x1b[0m');
      const port = await requestSerialPort();

      terminalRef.current?.writeln('\x1b[33mOpening port...\x1b[0m');
      await openSerialPort(port, serialConfig);

      const portInfo = getPortInfo(port);
      terminalRef.current?.writeln(`\x1b[32m✓ Connected to ${portInfo}\x1b[0m`);
      terminalRef.current?.writeln('');

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

      terminalRef.current?.writeln('');
      terminalRef.current?.writeln('\x1b[33m✓ Disconnected\x1b[0m');

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

  // Send data to serial port
  const handleSend = useCallback(async (data: string) => {
    if (!terminalState.writer || !terminalState.isConnected) {
      return;
    }

    try {
      const bytes = formatDataForSend(data, sendOptions.lineEnding, sendOptions.sendAsHex);
      await terminalState.writer.write(bytes);

      // Local echo
      if (sendOptions.localEcho) {
        const echoText = sendOptions.sendAsHex ? `[TX HEX] ${data}` : `[TX] ${data}`;
        terminalRef.current?.writeln(`\x1b[32m${echoText}\x1b[0m`);
      }

      // Update byte count
      setTerminalState(prev => ({
        ...prev,
        bytesSent: prev.bytesSent + bytes.length
      }));

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

  // Terminal controls
  const handleClear = useCallback(() => {
    terminalRef.current?.clear();
  }, []);

  const handleDownloadLog = useCallback(() => {
    const content = terminalRef.current?.getContent() || '';
    downloadTerminalLog(content);
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
    <div className="space-y-4">
      {/* Connection Panel */}
      <ConnectionPanel
        isConnected={terminalState.isConnected}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        error={terminalState.error}
      />

      {/* Configuration Panel */}
      <ConfigurationPanel
        config={serialConfig}
        onChange={setSerialConfig}
        disabled={terminalState.isConnected}
      />

      {/* Advanced Controls */}
      <AdvancedControls
        showTimestamps={showTimestamps}
        showHex={showHex}
        autoScroll={autoScroll}
        onToggleTimestamps={() => setShowTimestamps(prev => !prev)}
        onToggleHex={() => setShowHex(prev => !prev)}
        onToggleAutoScroll={() => setAutoScroll(prev => !prev)}
        onClear={handleClear}
        onDownloadLog={handleDownloadLog}
      />

      {/* Terminal Display */}
      <div className="border border-gray-800 rounded-lg overflow-hidden bg-black">
        <TerminalDisplay
          ref={terminalRef}
          options={terminalOptions}
        />
      </div>

      {/* Send Controls */}
      <SendControls
        onSend={handleSend}
        disabled={!terminalState.isConnected}
        sendOptions={sendOptions}
        onOptionsChange={setSendOptions}
      />

      {/* Status Bar */}
      <StatusBar
        stats={stats}
        isConnected={terminalState.isConnected}
        viewMode={viewMode}
      />
    </div>
  );
}
