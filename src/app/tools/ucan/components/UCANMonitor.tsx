'use client';

/**
 * uCAN Monitor - Main Application Component
 *
 * Orchestrates the entire CAN packet analyzer application
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MessageLog from './MessageLog';
import FilterPanel from './FilterPanel';
import BoardInfoPanel from './BoardInfoPanel';
import ConnectionPanel from './ConnectionPanel';
import SendPanel from './SendPanel';
import RulesPanel from './RulesPanel';
import PacketDetailModal from './PacketDetailModal';
import SettingsModal from './SettingsModal';
import ContextMenu from './ContextMenu';
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
  ExportConfig,
  BoardCapabilities,
  ActionDefinition,
  ActionRule
} from '../types';
import { SerialBridge } from '../core/serialBridge';
import { protocolToCANMessage, ProtocolMessage } from '../core/canProtocol';
import { MessageBuffer, StatisticsEngine } from '../core/messageBuffer';
import { exportMessages, exportStatsSummary } from '../utils/exporters';

interface UCANMonitorProps {
  isStandalone?: boolean;
}

export default function UCANMonitor({ }: UCANMonitorProps) {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{ vendorId?: number; productId?: number } | undefined>(undefined);
  const [serialConfig, setSerialConfig] = useState<SerialConfig>(DEFAULT_SERIAL_CONFIG);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);

  // Display state
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>(DEFAULT_DISPLAY_OPTIONS);
  const [selectedMessageId, setSelectedMessageId] = useState<string | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSendPanelOpen, setIsSendPanelOpen] = useState(false);
  const [activePanelTab, setActivePanelTab] = useState<'send' | 'rules'>('send');

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    message: CANMessage;
  } | null>(null);

  // Board capabilities and rules
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [capabilities, setCapabilities] = useState<BoardCapabilities | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [actionDefinitions, setActionDefinitions] = useState<ActionDefinition[]>([]);
  const [actionRules, setActionRules] = useState<ActionRule[]>([]);
  const [prefilledRuleMessage, setPrefilledRuleMessage] = useState<CANMessage | null>(null);

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

    // Handle page unload/reload - disconnect serial port
    const handleBeforeUnload = () => {
      if (serialBridgeRef.current?.isConnected()) {
        // Synchronous disconnect for beforeunload
        serialBridgeRef.current.disconnect();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Cleanup on unmount
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
    // Handle STATS messages from firmware
    if (protocolMsg.type === 'STATS') {
      setLastHeartbeat(new Date());

      // Update stats from firmware if available
      if (protocolMsg.stats) {
        setStats((prevStats) => ({
          ...prevStats,
          rxCount: protocolMsg.stats!.rxCount,
          txCount: protocolMsg.stats!.txCount,
          errorCount: protocolMsg.stats!.errorCount,
          busLoad: protocolMsg.stats!.busLoad
        }));
      }
    }

    // Handle CAPS response (capabilities)
    if (protocolMsg.raw.startsWith('CAPS;')) {
      try {
        const jsonStr = protocolMsg.raw.substring(5);
        const caps = JSON.parse(jsonStr) as BoardCapabilities;
        setCapabilities(caps);
      } catch (error) {
        console.error('Failed to parse capabilities:', error);
      }
    }

    // Handle ACTIONDEF response (action definitions)
    if (protocolMsg.raw.startsWith('ACTIONDEF;')) {
      try {
        const jsonStr = protocolMsg.raw.substring(10);
        const actionDef = JSON.parse(jsonStr) as ActionDefinition;
        console.log('📋 Action Definition received:', {
          id: actionDef.i,
          name: actionDef.n,
          description: actionDef.d,
          category: actionDef.c,
          trigger: actionDef.trig,
          paramCount: actionDef.p?.length || 0
        });
        setActionDefinitions((prev) => {
          const exists = prev.find(a => a.i === actionDef.i);
          if (exists) {
            console.log('♻️ Updating existing action definition:', actionDef.n);
            return prev.map(a => a.i === actionDef.i ? actionDef : a);
          }
          console.log('✨ Adding new action definition:', actionDef.n);
          return [...prev, actionDef];
        });
      } catch (error) {
        console.error('❌ Failed to parse action definition:', error, protocolMsg.raw);
      }
    }

    const canMessage = protocolToCANMessage(protocolMsg);

    if (canMessage) {
      // Add to buffer
      messageBufferRef.current?.addMessage(canMessage);

      // Update statistics (client-side per-ID stats)
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
      setIsConnected(true);

      // Query device capabilities after connection
      await queryCapabilities();
    }
  };

  /**
   * Disconnect from serial port
   */
  const handleDisconnect = async () => {
    if (!serialBridgeRef.current) return;
    await serialBridgeRef.current.disconnect();
    setIsConnected(false);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
   * Toggle auto-scroll
   */
  const toggleAutoScroll = () => {
    setDisplayOptions((prev) => ({ ...prev, autoScroll: !prev.autoScroll }));
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

  /**
   * Query board capabilities on connect
   */
  const queryCapabilities = useCallback(async () => {
    console.log('🔍 UCANMonitor: Querying device capabilities...');
    if (!serialBridgeRef.current) {
      console.warn('⚠️ UCANMonitor: No serial bridge available');
      return;
    }

    try {
      console.log('📡 UCANMonitor: Sending get:capabilities');
      await serialBridgeRef.current.sendCommand('get:capabilities');

      console.log('📡 UCANMonitor: Sending get:actiondefs');
      await serialBridgeRef.current.sendCommand('get:actiondefs');

      console.log('✅ UCANMonitor: Device queries sent (CAN starts automatically)');

      // Wait a bit for responses to arrive, then log summary
      setTimeout(() => {
        console.log('📊 Device Configuration Summary:');
        console.log('  Capabilities:', capabilities ? 'Loaded' : 'Not yet loaded');
        console.log('  Action Definitions:', actionDefinitions.length, 'loaded');
        if (actionDefinitions.length > 0) {
          console.table(actionDefinitions.map(a => ({
            ID: a.i,
            Name: a.n,
            Category: a.c,
            Trigger: a.trig,
            Params: a.p?.length || 0
          })));
        }
      }, 1000);
    } catch (error) {
      console.error('❌ Failed to query capabilities:', error);
    }
  }, [capabilities, actionDefinitions]);

  /**
   * Handle context menu on message
   */
  const handleMessageContextMenu = useCallback((message: CANMessage, x: number, y: number) => {
    setContextMenu({ x, y, message });
  }, []);

  /**
   * Handle context menu close
   */
  const handleContextMenuClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  /**
   * Handle filter by CAN ID from context menu
   */
  const handleFilterByCANId = useCallback((message: CANMessage) => {
    if (!messageBufferRef.current) return;

    const currentFilter = messageBufferRef.current.getFilter();
    const newCanIds = new Set(currentFilter.canIds);
    newCanIds.add(message.canId);

    messageBufferRef.current.setFilter({ ...currentFilter, canIds: newCanIds });
    updateMessagesAndStats();
    setContextMenu(null);
  }, [updateMessagesAndStats]);

  /**
   * Handle build rule from packet
   */
  const handleBuildRuleFromPacket = useCallback((message: CANMessage) => {
    setPrefilledRuleMessage(message);
    setActivePanelTab('rules');
    setIsSendPanelOpen(true);
    setContextMenu(null);
  }, []);

  /**
   * Handle copy message as JSON
   */
  const handleCopyAsJSON = useCallback((message: CANMessage) => {
    const json = JSON.stringify(message, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      console.log('Copied to clipboard:', json);
    }).catch((err) => {
      console.error('Failed to copy to clipboard:', err);
    });
    setContextMenu(null);
  }, []);

  /**
   * Rule management functions
   */
  const handleAddRule = useCallback(() => {
    // Placeholder - will be implemented with full rule builder
    console.log('Add rule clicked', prefilledRuleMessage);
  }, [prefilledRuleMessage]);

  const handleDeleteRule = useCallback((ruleId: number) => {
    setActionRules((prev) => prev.filter(r => r.id !== ruleId));
  }, []);

  const handleToggleRule = useCallback((ruleId: number) => {
    setActionRules((prev) => prev.map(r =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
  }, []);

  return (
    <div className={`flex flex-col h-screen bg-gray-950 text-white`}>
      {/* Header - Always shown with logo */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-[1920px] mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/uCAN/ucanlogo.png"
              alt="uCAN Logo"
              width={64}
              height={64}
              className="rounded"
            />
            <div>
              <h1 className="text-2xl font-bold font-mono">
                <span className="text-green-400">u</span>CAN Monitor
              </h1>
              <p className="text-sm text-gray-400">Universal CAN Bus Analyzer</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-gray-300 hover:text-green-400 transition-colors font-mono text-sm flex items-center gap-2"
          >
            <span>← Back to Home</span>
          </Link>
        </div>
      </div>

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

            {/* Auto-Scroll Toggle */}
            <button
              onClick={toggleAutoScroll}
              className={`px-4 py-1 text-sm rounded border transition-colors ${
                displayOptions.autoScroll
                  ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'bg-blue-600/20 border-blue-500/50 text-blue-300'
              }`}
              title={displayOptions.autoScroll ? 'Disable auto-scroll to browse older packets' : 'Enable auto-scroll to follow newest packets'}
            >
              {displayOptions.autoScroll ? '📜 Auto-Scroll' : '🔒 Scroll Locked'}
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

            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-300 hover:text-green-400 transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-[1920px] mx-auto h-full p-4 px-4 flex gap-4">
          {/* Center - Message Log with integrated Send Panel */}
          <div className="flex-1 h-full flex flex-col bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <MessageLog
                messages={filteredMessages}
                onMessageSelect={setSelectedMessageId}
                selectedMessageId={selectedMessageId}
                autoScroll={displayOptions.autoScroll && !displayOptions.paused}
                showTimestamps={displayOptions.showTimestamps}
                viewMode={displayOptions.viewMode}
                onContextMenu={handleMessageContextMenu}
              />
            </div>
            {/* Send/Rules Panel at bottom - Collapsible with Tabs */}
            <div className="border-t border-purple-500/20">
              {/* Toggle Button */}
              <button
                onClick={() => setIsSendPanelOpen(!isSendPanelOpen)}
                className="w-full px-4 py-2 bg-black hover:bg-purple-950/30 text-purple-300 text-sm font-mono flex items-center justify-between transition-colors border-b border-purple-500/20"
              >
                <span>{activePanelTab === 'send' ? 'Send CAN Message' : 'Action Rules'}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isSendPanelOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Animated Panel Container */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isSendPanelOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {/* Tab Bar */}
                <div className="flex gap-1 bg-black border-b border-purple-500/20 px-2 pt-2">
                  <button
                    onClick={() => setActivePanelTab('send')}
                    className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                      activePanelTab === 'send'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
                    }`}
                  >
                    Send Message
                  </button>
                  <button
                    onClick={() => setActivePanelTab('rules')}
                    className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                      activePanelTab === 'rules'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
                    }`}
                  >
                    Rules
                    {actionRules.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-purple-400/20 rounded">
                        {actionRules.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Tab Content */}
                <div className="bg-black">
                  {activePanelTab === 'send' && (
                    <SendPanel
                      isConnected={isConnected}
                      onSend={handleSendMessage}
                    />
                  )}
                  {activePanelTab === 'rules' && (
                    <RulesPanel
                      isConnected={isConnected}
                      rules={actionRules}
                      onAddRule={handleAddRule}
                      onDeleteRule={handleDeleteRule}
                      onToggleRule={handleToggleRule}
                      prefilledMessage={prefilledRuleMessage}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Board Info & Filters */}
          <div className="w-80 flex-shrink-0 overflow-y-auto h-full p-4 space-y-4">
            {/* Board Information */}
            <BoardInfoPanel
              capabilities={capabilities}
              isConnected={isConnected}
              onSendCommand={async (command: string) => {
                if (serialBridgeRef.current) {
                  await serialBridgeRef.current.sendCommand(command);
                }
              }}
            />

            {/* Filters */}
            <FilterPanel
              filter={currentFilter}
              onFilterChange={handleFilterChange}
              totalMessages={messages.length}
              filteredMessages={filteredMessages.length}
              allCANIds={allCANIds}
            />
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

      {/* Status Bar with Statistics */}
      <div className="bg-gray-900 border-t border-gray-700 p-2 text-xs font-mono">
        <div className="max-w-[1920px] mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={isConnected ? 'text-green-400' : 'text-gray-500'}>
              {isConnected ? '🟢 Connected' : '⚫ Disconnected'}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">
              RX: <span className="text-blue-400">{stats.rxCount}</span>
            </span>
            <span className="text-gray-300">
              TX: <span className="text-yellow-400">{stats.txCount}</span>
            </span>
            <span className="text-gray-300">
              ERR: <span className="text-red-400">{stats.errorCount}</span>
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">
              {stats.messagesPerSecond.toFixed(1)} msg/s
            </span>
            <span className="text-gray-300">
              {stats.busLoad.toFixed(1)}% load
            </span>
            {displayOptions.paused && (
              <>
                <span className="text-gray-400">|</span>
                <span className="text-yellow-400">⏸️ PAUSED</span>
              </>
            )}
            {!displayOptions.autoScroll && (
              <>
                <span className="text-gray-400">|</span>
                <span className="text-blue-400">🔒 SCROLL LOCKED</span>
              </>
            )}
          </div>
          <span className="text-gray-400">
            {serialConfig.baudRate} baud | {filteredMessages.length} shown
          </span>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={serialConfig}
        onConfigChange={setSerialConfig}
        deviceInfo={deviceInfo}
        isConnected={isConnected}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={[
            {
              label: 'Copy as JSON',
              icon: '📋',
              onClick: () => handleCopyAsJSON(contextMenu.message)
            },
            {
              label: 'Filter by CAN ID',
              icon: '🔍',
              onClick: () => handleFilterByCANId(contextMenu.message)
            },
            {
              label: 'Build Rule from Packet',
              icon: '⚡',
              onClick: () => handleBuildRuleFromPacket(contextMenu.message)
            }
          ]}
          onClose={handleContextMenuClose}
        />
      )}
    </div>
  );
}
