'use client';

/**
 * uCAN Monitor - Main Application Component
 *
 * Orchestrates the entire CAN packet analyzer application
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ConnectionPanel from './ConnectionPanel';
import MessageLog from './MessageLog';
import FilterPanel from './FilterPanel';
import StatsPanel from './StatsPanel';
import SendPanel from './SendPanel';
import PacketDetailModal from './PacketDetailModal';
import {
  CANMessage,
  SerialConfig,
  DEFAULT_SERIAL_CONFIG,
  DEFAULT_DISPLAY_OPTIONS,
  DisplayOptions,
  MessageFilter,
  MessageDirection,
  BusStatistics,
  ViewMode,
  ExportConfig
} from '../types';
import { SerialBridge } from '../core/serialBridge';
import { protocolToCANMessage, ProtocolMessage } from '../core/canProtocol';
import { MessageBuffer, StatisticsEngine } from '../core/messageBuffer';
import { exportMessages, exportStatsSummary } from '../utils/exporters';

interface UCANMonitorProps {
  isStandalone?: boolean;
}

export default function UCANMonitor({ isStandalone = false }: UCANMonitorProps) {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{ vendorId?: number; productId?: number } | undefined>(undefined);
  const [serialConfig, setSerialConfig] = useState<SerialConfig>(DEFAULT_SERIAL_CONFIG);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);

  // Display state
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>(DEFAULT_DISPLAY_OPTIONS);
  const [selectedMessageId, setSelectedMessageId] = useState<string | undefined>(undefined);

  // Messages and filtering
  const [messages, setMessages] = useState<CANMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<CANMessage[]>([]);
  const [stats, setStats] = useState<BusStatistics>({
    rxCount: 0,
    txCount: 0,
    errorCount: 0,
    messagesPerSecond: 0,
    busLoad: 0,
    uptime: 0,
    perIdStats: new Map()
  });

  // Refs for core services
  const serialBridgeRef = useRef<SerialBridge | null>(null);
  const messageBufferRef = useRef<MessageBuffer | null>(null);
  const statsEngineRef = useRef<StatisticsEngine | null>(null);

  // Initialize core services
  useEffect(() => {
    serialBridgeRef.current = new SerialBridge();
    messageBufferRef.current = new MessageBuffer(displayOptions.maxMessages);
    statsEngineRef.current = new StatisticsEngine();

    // Set up message callback
    serialBridgeRef.current.setMessageCallback(handleProtocolMessage);

    // Set up connection callback
    serialBridgeRef.current.setConnectionCallback((connected, error) => {
      setIsConnected(connected);
      if (error) {
        console.error('Connection error:', error);
      }
    });

    // Set up message buffer update callback
    messageBufferRef.current.setUpdateCallback(() => {
      updateMessagesAndStats();
    });

    return () => {
      // Cleanup
      if (serialBridgeRef.current?.isConnected()) {
        serialBridgeRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (statsEngineRef.current) {
        setStats(statsEngineRef.current.getStatistics());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Handle incoming protocol message from serial port
   */
  const handleProtocolMessage = useCallback((protocolMsg: ProtocolMessage) => {
    // Track heartbeat from STATS messages
    if (protocolMsg.type === 'STATS') {
      setLastHeartbeat(new Date());
    }

    const canMessage = protocolToCANMessage(protocolMsg);

    if (canMessage) {
      // Add to buffer
      messageBufferRef.current?.addMessage(canMessage);

      // Update statistics
      statsEngineRef.current?.updateMessage(canMessage);
    }
  }, []);

  /**
   * Update messages and statistics from buffer
   */
  const updateMessagesAndStats = useCallback(() => {
    if (!messageBufferRef.current) return;

    const allMessages = messageBufferRef.current.getAllMessages();
    const filtered = messageBufferRef.current.getFilteredMessages();

    setMessages(allMessages);
    setFilteredMessages(filtered);

    if (statsEngineRef.current) {
      setStats(statsEngineRef.current.getStatistics());
    }
  }, []);

  /**
   * Connect to serial port
   */
  const handleConnect = async (port?: SerialPort, config?: SerialConfig) => {
    if (!serialBridgeRef.current) return;

    const success = await serialBridgeRef.current.connect(port, config || serialConfig);

    if (success) {
      const connectedPort = serialBridgeRef.current.getPort();
      if (connectedPort) {
        const info = connectedPort.getInfo();
        setDeviceInfo({
          vendorId: info.usbVendorId,
          productId: info.usbProductId
        });
      }
    }
  };

  /**
   * Disconnect from serial port
   */
  const handleDisconnect = async () => {
    if (!serialBridgeRef.current) return;
    await serialBridgeRef.current.disconnect();
    setDeviceInfo(undefined);
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((newFilter: Partial<MessageFilter>) => {
    if (!messageBufferRef.current) return;

    const currentFilter = messageBufferRef.current.getFilter();
    messageBufferRef.current.setFilter({ ...currentFilter, ...newFilter });
    updateMessagesAndStats();
  }, [updateMessagesAndStats]);

  /**
   * Clear all messages
   */
  const handleClearMessages = () => {
    messageBufferRef.current?.clear();
    statsEngineRef.current?.reset();
    setMessages([]);
    setFilteredMessages([]);
    setSelectedMessageId(undefined);
  };

  /**
   * Export messages
   */
  const handleExport = (format: 'csv' | 'json' | 'txt') => {
    const exportConfig: ExportConfig = {
      format,
      includeTimestamps: displayOptions.showTimestamps,
      includeRawData: displayOptions.showRawHex,
      includeStats: true
    };

    exportMessages(filteredMessages, exportConfig, stats);
  };

  /**
   * Export statistics
   */
  const handleExportStats = () => {
    exportStatsSummary(stats);
  };

  /**
   * Send CAN message
   */
  const handleSendMessage = async (command: string) => {
    if (!serialBridgeRef.current) {
      throw new Error('Not connected');
    }

    await serialBridgeRef.current.sendCommand(command);
  };

  /**
   * Toggle pause
   */
  const togglePause = () => {
    setDisplayOptions((prev) => ({ ...prev, paused: !prev.paused }));
  };

  /**
   * Change view mode
   */
  const setViewMode = (mode: ViewMode) => {
    setDisplayOptions((prev) => ({ ...prev, viewMode: mode }));
  };

  // Get current filter
  const currentFilter = messageBufferRef.current?.getFilter() || {
    directions: new Set<MessageDirection>(['RX', 'TX']),
    canIds: new Set<number>(),
    errorsOnly: false
  };

  // Get all seen CAN IDs
  const allCANIds = statsEngineRef.current?.getAllCANIds() || [];

  // Calculate navigation state for modal
  const selectedMessageIndex = selectedMessageId
    ? filteredMessages.findIndex(m => m.id === selectedMessageId)
    : -1;
  const hasPrevMessage = selectedMessageIndex > 0;
  const hasNextMessage = selectedMessageIndex >= 0 && selectedMessageIndex < filteredMessages.length - 1;

  /**
   * Navigate between messages in modal
   */
  const handleNavigateMessage = useCallback((direction: 'prev' | 'next') => {
    if (selectedMessageIndex < 0) return;

    const newIndex = direction === 'prev'
      ? selectedMessageIndex - 1
      : selectedMessageIndex + 1;

    if (newIndex >= 0 && newIndex < filteredMessages.length) {
      setSelectedMessageId(filteredMessages[newIndex].id);
    }
  }, [selectedMessageIndex, filteredMessages]);

  return (
    <div className={`flex flex-col h-screen bg-gray-950 text-white`}>
      {/* Header */}
      {!isStandalone && (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 border-b border-gray-700">
          <div className="max-w-[1920px] mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-green-400">u</span>CAN <span className="text-gray-400">|</span>{' '}
              <span className="text-gray-300">Universal CAN Monitor</span>
            </h1>
            <p className="text-gray-200">Browser-based CAN packet analyzer for USB-to-CAN hardware</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-gray-900 border-b border-gray-700 p-3">
        <div className="max-w-[1920px] mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-gray-950 border border-gray-700 rounded p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  displayOptions.viewMode === 'list'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📋 List
              </button>
              <button
                onClick={() => setViewMode('hex')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  displayOptions.viewMode === 'hex'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🔢 Hex
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  displayOptions.viewMode === 'stats'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📊 Stats
              </button>
            </div>

            {/* Pause/Resume */}
            <button
              onClick={togglePause}
              className={`px-4 py-1 text-sm rounded border transition-colors ${
                displayOptions.paused
                  ? 'bg-yellow-600/20 border-yellow-500/50 text-yellow-300'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {displayOptions.paused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Export */}
            <div className="flex gap-1 bg-gray-950 border border-gray-700 rounded p-1">
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                title="Export as CSV"
              >
                📄 CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                title="Export as JSON"
              >
                📋 JSON
              </button>
            </div>

            {/* Clear */}
            <button
              onClick={handleClearMessages}
              className="px-4 py-1 text-sm bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30 rounded transition-colors"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-[1920px] mx-auto h-full p-4 px-4 flex gap-4">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto h-full">
            <ConnectionPanel
              isConnected={isConnected}
              deviceInfo={deviceInfo}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              config={serialConfig}
              onConfigChange={setSerialConfig}
              lastHeartbeat={lastHeartbeat}
            />

            <SendPanel
              isConnected={isConnected}
              onSend={handleSendMessage}
            />

            <FilterPanel
              filter={currentFilter}
              onFilterChange={handleFilterChange}
              totalMessages={messages.length}
              filteredMessages={filteredMessages.length}
              allCANIds={allCANIds}
            />
          </div>

          {/* Center - Message Log (Full Width) */}
          <div className="flex-1 h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <MessageLog
              messages={filteredMessages}
              onMessageSelect={setSelectedMessageId}
              selectedMessageId={selectedMessageId}
              autoScroll={displayOptions.autoScroll && !displayOptions.paused}
              showTimestamps={displayOptions.showTimestamps}
              viewMode={displayOptions.viewMode}
            />
          </div>

          {/* Right Sidebar */}
          <div className="w-80 flex-shrink-0 overflow-y-auto h-full">
            <StatsPanel stats={stats} onExport={handleExportStats} />
          </div>
        </div>
      </div>

      {/* Packet Detail Modal */}
      <PacketDetailModal
        message={filteredMessages.find(m => m.id === selectedMessageId)}
        isOpen={!!selectedMessageId}
        onClose={() => setSelectedMessageId(undefined)}
        onNavigate={handleNavigateMessage}
        hasPrev={hasPrevMessage}
        hasNext={hasNextMessage}
      />

      {/* Status Bar */}
      <div className="bg-gray-900 border-t border-gray-700 p-2 text-xs text-gray-400">
        <div className="max-w-[1920px] mx-auto px-4 flex items-center justify-between">
          <span>
            {isConnected ? '🟢 Connected' : '⚫ Disconnected'} | {filteredMessages.length} messages shown
            {displayOptions.paused && ' | ⏸️ PAUSED'}
          </span>
          <span>uCAN Monitor v1.0 | {serialConfig.baudRate} baud</span>
        </div>
      </div>
    </div>
  );
}
