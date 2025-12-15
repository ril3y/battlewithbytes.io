"use client";

/**
 * uCAN Monitor - Main Application Component
 *
 * Orchestrates the entire CAN packet analyzer application
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import MessageLog from "./MessageLog";
import FilterPanel from "./FilterPanel";
import BoardInfoPanel from "./BoardInfoPanel";
import SendPanel from "./SendPanel";
import PacketDetailModal from "./PacketDetailModal";
import SettingsModal from "./SettingsModal";
import RuleBuilderModal from "./RuleBuilderModal";
import ContextMenu from "./ContextMenu";
import CollapsiblePanel from "./CollapsiblePanel";
import { DefinitionManagerModal } from "./DefinitionManagerModal";
import { OverlayCanvas } from "./OverlayCanvas";
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
  ActionRule,
  ProtocolMessage,
} from "../types";
import { SerialBridge } from "../core/serialBridge";
import { protocolToCANMessage } from "../core/canProtocol";
import { MessageBuffer, StatisticsEngine } from "../core/messageBuffer";
import { exportMessages, exportStatsSummary } from "../utils/exporters";
import { saveLastDevice } from "../utils/deviceStorage";
import { importCSVFile } from "../utils/csvImporter";
import { DefinitionManager } from "../overlays/decoder/definitionManager";
import {
  decodeMessage,
  matchesDefinition,
  normalizeCANId,
} from "../overlays/decoder/messageDecoder";
import type { DecodedMessage } from "../overlays/types";

interface UCANMonitorProps {
  isStandalone?: boolean;
}

export default function UCANMonitor({}: UCANMonitorProps) {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [serialConfig, setSerialConfig] = useState<SerialConfig>(
    DEFAULT_SERIAL_CONFIG,
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);

  // Display state
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>(
    DEFAULT_DISPLAY_OPTIONS,
  );
  const [selectedMessageId, setSelectedMessageId] = useState<
    string | undefined
  >(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRuleBuilderOpen, setIsRuleBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ActionRule | null>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    message: CANMessage;
  } | null>(null);

  // Board capabilities and rules
  const [capabilities, setCapabilities] = useState<BoardCapabilities | null>(
    null,
  );
  const [actionDefinitions, setActionDefinitions] = useState<
    ActionDefinition[]
  >([]);
  const [actionRules, setActionRules] = useState<ActionRule[]>([]);
  const [prefilledRuleMessage, setPrefilledRuleMessage] =
    useState<CANMessage | null>(null);

  // Track recently fired rules (ruleId -> timestamp) - short blink duration
  const [recentlyFiredRules, setRecentlyFiredRules] = useState<
    Map<number, number>
  >(new Map());

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
    perIdStats: new Map(),
  });

  // Refs for core services
  const serialBridgeRef = useRef<SerialBridge | null>(null);
  const messageBufferRef = useRef<MessageBuffer | null>(null);
  const statsEngineRef = useRef<StatisticsEngine | null>(null);
  const definitionManagerRef = useRef<DefinitionManager | null>(null);

  // Decoder state
  const [activeDefinitionId, setActiveDefinitionId] = useState<
    string | undefined
  >(undefined);
  const [decodedMessages, setDecodedMessages] = useState<
    Map<string, DecodedMessage>
  >(new Map());

  // Overlay UI state
  const [isDefinitionModalOpen, setIsDefinitionModalOpen] = useState(false);
  const [isOverlayPanelVisible, setIsOverlayPanelVisible] = useState(false);
  const [activeLayoutId, setActiveLayoutId] = useState<string | undefined>(
    undefined,
  );
  const [isOverlayExpanded, setIsOverlayExpanded] = useState(false);

  // Definition mismatch tracking
  const [definitionMismatchWarning, setDefinitionMismatchWarning] = useState<{
    show: boolean;
    message: string;
    suggestedDefinitionId?: string;
  }>({ show: false, message: "" });

  // Ref to track paused state for message callback (avoids stale closure)
  const isPausedRef = useRef(displayOptions.paused);

  // Update paused ref when displayOptions changes
  useEffect(() => {
    isPausedRef.current = displayOptions.paused;
  }, [displayOptions.paused]);

  // Initialize core services
  useEffect(() => {
    serialBridgeRef.current = new SerialBridge();
    messageBufferRef.current = new MessageBuffer(displayOptions.maxMessages);
    statsEngineRef.current = new StatisticsEngine();
    definitionManagerRef.current = new DefinitionManager();

    // Set up connection callback
    serialBridgeRef.current.setConnectionCallback((connected, error) => {
      setIsConnected(connected);
      if (error) {
        console.error("Connection error:", error);
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

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Cleanup on unmount
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (serialBridgeRef.current?.isConnected()) {
        serialBridgeRef.current.disconnect();
      }
      // Cleanup message buffer batch timer
      if (messageBufferRef.current) {
        messageBufferRef.current.destroy();
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
    if (protocolMsg.type === "STATS") {
      setLastHeartbeat(new Date());

      // Update stats from firmware if available
      if (protocolMsg.stats) {
        setStats((prevStats) => ({
          ...prevStats,
          rxCount: protocolMsg.stats!.rxCount,
          txCount: protocolMsg.stats!.txCount,
          errorCount: protocolMsg.stats!.errorCount,
          busLoad: protocolMsg.stats!.busLoad,
        }));
      }
    }

    // Handle CAPS response (capabilities)
    if (protocolMsg.raw.startsWith("CAPS;")) {
      try {
        const jsonStr = protocolMsg.raw.substring(5);
        const caps = JSON.parse(jsonStr) as BoardCapabilities;
        setCapabilities(caps);
      } catch (error) {
        console.error("Failed to parse capabilities:", error);
      }
    }

    // Handle ACTIONDEF response (action definitions)
    if (protocolMsg.raw.startsWith("ACTIONDEF;")) {
      try {
        const jsonStr = protocolMsg.raw.substring(10);
        const actionDef = JSON.parse(jsonStr) as ActionDefinition;
        console.log("📋 Action Definition received:", {
          id: actionDef.i,
          name: actionDef.n,
          description: actionDef.d,
          category: actionDef.c,
          trigger: actionDef.trig,
          paramCount: actionDef.p?.length || 0,
        });
        setActionDefinitions((prev) => {
          const exists = prev.find((a) => a.i === actionDef.i);
          if (exists) {
            console.log("♻️ Updating existing action definition:", actionDef.n);
            return prev.map((a) => (a.i === actionDef.i ? actionDef : a));
          }
          console.log("✨ Adding new action definition:", actionDef.n);
          return [...prev, actionDef];
        });
      } catch (error) {
        console.error(
          "❌ Failed to parse action definition:",
          error,
          protocolMsg.raw,
        );
      }
    }

    // Handle ACTION messages - can be either:
    // 1. Execution report: ACTION;{RULE_ID};{ACTION_TYPE};{TRIGGER_CAN_ID};{STATUS}
    //    Example: ACTION;1;GPIO_SET;0x100;OK
    // 2. Rule listing (from action:list): ACTION;{RULE_ID};{ENABLED};{CAN_ID};{ACTION_TYPE};{PARAMS...}
    //    Example: ACTION;1;true;0x100;GPIO_SET;Pin:13
    if (protocolMsg.raw.startsWith("ACTION;")) {
      try {
        const parts = protocolMsg.raw.split(";");

        // Distinguish between execution report and rule listing
        // Execution report: parts[4] is "OK" or "FAIL"
        // Rule listing: parts[2] is "true" or "false" (enabled status)
        const isRuleListing =
          parts.length >= 5 && (parts[2] === "true" || parts[2] === "false");

        if (isRuleListing) {
          // This is a rule listing from action:list (firmware doesn't use RULE format yet)
          console.log("📥 ACTION rule listing:", protocolMsg.raw);

          const ruleId = parseInt(parts[1]);
          const enabled = parts[2] === "true";
          const canIdStr = parts[3];
          const actionType = parts[4];
          const params = parts.length > 5 ? parts.slice(5) : undefined;

          // Parse CAN ID
          const canId = canIdStr.startsWith("0x")
            ? parseInt(canIdStr.substring(2), 16)
            : parseInt(canIdStr, 16);

          const rule: ActionRule = {
            id: ruleId,
            name: `Rule ${ruleId}: ${actionType}`,
            canId,
            canMask: 0xffffffff, // Not provided in ACTION format, assume exact match
            actionType,
            paramSource: params && params.length > 0 ? "fixed" : "candata",
            params,
            enabled,
            dataLength: 0,
          };

          console.log("📜 Rule parsed from ACTION:", rule);

          setActionRules((prev) => {
            const exists = prev.find((r) => r.id === rule.id);
            if (exists) {
              console.log(`♻️ Updating existing rule ${rule.id}`);
              return prev.map((r) => (r.id === rule.id ? rule : r));
            }
            console.log(`✨ Adding new rule ${rule.id}`);
            return [...prev, rule];
          });
        } else if (
          parts.length >= 5 &&
          (parts[4] === "OK" || parts[4] === "FAIL")
        ) {
          // This is an execution report
          const ruleId = parseInt(parts[1]);
          const actionType = parts[2];
          const triggerCanId = parts[3];
          const status = parts[4];

          console.log(
            `⚡ Rule ${ruleId} executed: ${actionType} triggered by ${triggerCanId} - ${status}`,
          );

          // Track this rule execution for visual feedback
          setRecentlyFiredRules((prev) => {
            const updated = new Map(prev);
            updated.set(ruleId, Date.now());
            return updated;
          });
        }
      } catch (error) {
        console.error(
          "❌ Failed to parse ACTION message:",
          error,
          protocolMsg.raw,
        );
      }
    }

    // Log ALL non-CAN messages for debugging rule loading issues
    if (
      !protocolMsg.raw.startsWith("CAN_RX") &&
      !protocolMsg.raw.startsWith("CAN_TX") &&
      !protocolMsg.raw.startsWith("STATS")
    ) {
      console.log("🔍 Non-CAN message received:", protocolMsg.raw);
    }

    // Handle RULE response (from action:list command - Protocol v2.0)
    // Format: RULE;{ID};{CAN_ID};{CAN_MASK};{DATA};{DATA_MASK};{DATA_LEN};{ACTION};{PARAM_SOURCE};{PARAMS...}
    // Example: RULE;1;0x500;0xFFFFFFFF;;;0;NEOPIXEL;candata
    // Example: RULE;2;0x100;0xFFFFFFFF;;;0;GPIO_SET;fixed;13
    // Example: RULE;3;0x200;0xFFFFFFFF;FF;FF;1;GPIO_TOGGLE;fixed;14
    if (protocolMsg.raw.startsWith("RULE;")) {
      try {
        console.log("📥 Raw RULE message:", protocolMsg.raw);
        const parts = protocolMsg.raw.split(";");
        console.log("📋 Parsed RULE parts:", parts);

        if (parts.length >= 9) {
          // Parse CAN ID (handle hex format)
          const canIdStr = parts[2];
          const canId = canIdStr.startsWith("0x")
            ? parseInt(canIdStr.substring(2), 16)
            : parseInt(canIdStr, 16);

          // Parse CAN mask (handle hex format)
          const canMaskStr = parts[3];
          const canMask = canMaskStr.startsWith("0x")
            ? parseInt(canMaskStr.substring(2), 16)
            : parseInt(canMaskStr, 16);

          // Parse data pattern and mask (positions 4 and 5)
          const dataPattern = parts[4]?.trim() || undefined;
          const dataMask = parts[5]?.trim() || undefined;

          // Parse data length requirement (position 6)
          const dataLength = parts[6] ? parseInt(parts[6], 10) : 0;

          const rule: ActionRule = {
            id: parseInt(parts[1]),
            name: `Rule ${parts[1]}: ${parts[7]}`,
            canId,
            canMask,
            dataPattern,
            dataMask,
            dataLength,
            actionType: parts[7],
            paramSource: parts[8] as "fixed" | "candata",
            params: parts.length > 9 ? parts.slice(9) : undefined,
            enabled: true,
          };

          console.log("📜 Rule parsed successfully:", rule);

          setActionRules((prev) => {
            const exists = prev.find((r) => r.id === rule.id);
            if (exists) {
              console.log(`♻️ Updating existing rule ${rule.id}`);
              return prev.map((r) => (r.id === rule.id ? rule : r));
            }
            console.log(`✨ Adding new rule ${rule.id}`);
            return [...prev, rule];
          });
        } else {
          console.warn(
            `⚠️ RULE message has insufficient fields (${parts.length} < 9):`,
            protocolMsg.raw,
          );
        }
      } catch (error) {
        console.error("❌ Failed to parse RULE:", error, protocolMsg.raw);
      }
    }

    const canMessage = protocolToCANMessage(protocolMsg);

    // Use ref to check paused state (avoids stale closure)
    if (canMessage && !isPausedRef.current) {
      // Add to buffer (only if not paused)
      messageBufferRef.current?.addMessage(canMessage);

      // Update statistics (client-side per-ID stats)
      statsEngineRef.current?.updateMessage(canMessage);
    }
  }, []);

  // Register message callback after handleProtocolMessage is defined
  useEffect(() => {
    if (serialBridgeRef.current) {
      serialBridgeRef.current.setMessageCallback(handleProtocolMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once after initial render when handleProtocolMessage exists

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

    // Decode messages if a definition is active AND overlay is visible
    // This optimization prevents decoding when the overlay panel is closed
    if (
      activeDefinitionId &&
      isOverlayPanelVisible &&
      definitionManagerRef.current
    ) {
      const definition =
        definitionManagerRef.current.getDefinition(activeDefinitionId);
      if (definition) {
        const newDecodedMessages = new Map<string, DecodedMessage>();

        // Only decode last 20 messages for better performance (was 100)
        // We only need the latest value for each CAN ID to display in widgets
        const recentMessages = allMessages.slice(-20);

        for (const canMsg of recentMessages) {
          const canIdStr = normalizeCANId(canMsg.canId);

          // Skip if already decoded (keep most recent)
          if (newDecodedMessages.has(canIdStr)) continue;

          // Find message definition
          const messageDef = definition.messages.find((m) =>
            matchesDefinition(canIdStr, m),
          );
          if (messageDef) {
            try {
              const decoded = decodeMessage(
                canIdStr,
                Array.from(canMsg.data),
                messageDef,
                canMsg.timestamp.getTime(),
              );
              newDecodedMessages.set(canIdStr, decoded);
            } catch (error) {
              console.error(
                `[Decoder] Failed to decode message ${canIdStr}:`,
                error,
              );
            }
          }
        }

        setDecodedMessages(newDecodedMessages);
      }
    } else if (!isOverlayPanelVisible && decodedMessages.size > 0) {
      // Clear decoded messages when panel is closed to free memory
      setDecodedMessages(new Map());
    }
  }, [activeDefinitionId, isOverlayPanelVisible, decodedMessages.size]);

  /**
   * Check for definition mismatch - compares incoming CAN IDs with active definition
   */
  useEffect(() => {
    if (
      !activeDefinitionId ||
      !definitionManagerRef.current ||
      !isOverlayPanelVisible
    ) {
      setDefinitionMismatchWarning({ show: false, message: "" });
      return;
    }

    // Get unique CAN IDs from recent messages (last 50)
    const recentMessages = messages.slice(-50);
    const incomingCanIds = new Set(
      recentMessages.map((m) => normalizeCANId(m.canId)),
    );

    if (incomingCanIds.size === 0) {
      // No messages yet, no warning
      setDefinitionMismatchWarning({ show: false, message: "" });
      return;
    }

    // Get CAN IDs from active definition
    const activeDefinition =
      definitionManagerRef.current.getDefinition(activeDefinitionId);
    if (!activeDefinition) {
      setDefinitionMismatchWarning({ show: false, message: "" });
      return;
    }

    const definitionCanIds = new Set(
      activeDefinition.messages.map((m) => m.id),
    );

    // Calculate match percentage
    let matchCount = 0;
    incomingCanIds.forEach((canId) => {
      if (definitionCanIds.has(canId)) {
        matchCount++;
      }
    });

    const matchPercentage = (matchCount / incomingCanIds.size) * 100;

    // Show warning if less than 50% match
    if (matchPercentage < 50) {
      // Try to find a better matching definition
      const allDefinitions =
        definitionManagerRef.current.getDefinitionMetadata();
      let bestMatch: { id: string; score: number; name: string } | null = null;

      for (const defMeta of allDefinitions) {
        if (defMeta.id === activeDefinitionId) continue; // Skip current

        const def = definitionManagerRef.current.getDefinition(defMeta.id);
        if (!def) continue;

        const defCanIds = new Set(def.messages.map((m) => m.id));
        let defMatchCount = 0;
        incomingCanIds.forEach((canId) => {
          if (defCanIds.has(canId)) {
            defMatchCount++;
          }
        });

        const defMatchPercentage = (defMatchCount / incomingCanIds.size) * 100;

        if (!bestMatch || defMatchPercentage > bestMatch.score) {
          bestMatch = {
            id: defMeta.id,
            score: defMatchPercentage,
            name: defMeta.name,
          };
        }
      }

      if (bestMatch && bestMatch.score > matchPercentage) {
        setDefinitionMismatchWarning({
          show: true,
          message: `Active definition '${activeDefinition.name}' only matches ${matchPercentage.toFixed(0)}% of incoming messages. Try '${bestMatch.name}' (${bestMatch.score.toFixed(0)}% match)?`,
          suggestedDefinitionId: bestMatch.id,
        });
      } else {
        setDefinitionMismatchWarning({
          show: true,
          message: `Active definition '${activeDefinition.name}' only matches ${matchPercentage.toFixed(0)}% of incoming messages. You may need a different definition.`,
          suggestedDefinitionId: undefined,
        });
      }
    } else {
      // Good match, clear warning
      setDefinitionMismatchWarning({ show: false, message: "" });
    }
  }, [messages, activeDefinitionId, isOverlayPanelVisible]);

  /**
   * Connect to serial port
   */
  const handleConnect = async (port?: SerialPort, config?: SerialConfig) => {
    if (!serialBridgeRef.current) return;

    const success = await serialBridgeRef.current.connect(
      port,
      config || serialConfig,
    );

    if (success) {
      setIsConnected(true);

      // Save device info to localStorage for quick reconnect
      const connectedPort = serialBridgeRef.current.getPort();
      if (connectedPort) {
        const info = connectedPort.getInfo();
        saveLastDevice({
          vendorId: info.usbVendorId,
          productId: info.usbProductId,
        });
      }

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
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback(
    (newFilter: Partial<MessageFilter>) => {
      if (!messageBufferRef.current) return;

      const currentFilter = messageBufferRef.current.getFilter();
      messageBufferRef.current.setFilter({ ...currentFilter, ...newFilter });
      updateMessagesAndStats();
    },
    [updateMessagesAndStats],
  );

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
  const handleExport = (format: "csv" | "json" | "txt") => {
    const exportConfig: ExportConfig = {
      format,
      includeTimestamps: displayOptions.showTimestamps,
      includeRawData: displayOptions.showRawHex,
      includeStats: true,
    };

    exportMessages(filteredMessages, exportConfig, stats);
  };

  /**
   * Import CSV file
   */
  const handleImportCSV = useCallback(async () => {
    // Create file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        console.log("[CSV Import] Loading file:", file.name);
        const messages = await importCSVFile(file);
        console.log("[CSV Import] Parsed", messages.length, "messages");

        // Add messages to buffer
        if (messageBufferRef.current) {
          // Pause if not already paused
          const wasPaused = displayOptions.paused;
          if (!wasPaused) {
            setDisplayOptions((prev) => ({ ...prev, paused: true }));
          }

          // Add all messages
          for (const msg of messages) {
            messageBufferRef.current.addMessage(msg);
            statsEngineRef.current?.updateMessage(msg);
          }

          // Trigger update
          updateMessagesAndStats();

          console.log("[CSV Import] Import complete");
          alert(
            `Successfully imported ${messages.length} CAN messages from ${file.name}`,
          );
        }
      } catch (error) {
        console.error("[CSV Import] Error:", error);
        alert(
          `Failed to import CSV: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    input.click();
  }, [displayOptions.paused, updateMessagesAndStats]);

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
      throw new Error("Not connected");
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
    directions: new Set<MessageDirection>(["RX", "TX"]),
    canIds: new Set<number>(),
    errorsOnly: false,
  };

  // Get all seen CAN IDs
  const allCANIds = statsEngineRef.current?.getAllCANIds() || [];

  // Calculate navigation state for modal
  const selectedMessageIndex = selectedMessageId
    ? filteredMessages.findIndex((m) => m.id === selectedMessageId)
    : -1;
  const hasPrevMessage = selectedMessageIndex > 0;
  const hasNextMessage =
    selectedMessageIndex >= 0 &&
    selectedMessageIndex < filteredMessages.length - 1;

  /**
   * Navigate between messages in modal
   */
  const handleNavigateMessage = useCallback(
    (direction: "prev" | "next") => {
      if (selectedMessageIndex < 0) return;

      const newIndex =
        direction === "prev"
          ? selectedMessageIndex - 1
          : selectedMessageIndex + 1;

      if (newIndex >= 0 && newIndex < filteredMessages.length) {
        setSelectedMessageId(filteredMessages[newIndex].id);
      }
    },
    [selectedMessageIndex, filteredMessages],
  );

  /**
   * Query board capabilities on connect
   */
  const queryCapabilities = useCallback(async () => {
    console.log("🔍 UCANMonitor: Querying device capabilities...");
    if (!serialBridgeRef.current) {
      console.warn("⚠️ UCANMonitor: No serial bridge available");
      return;
    }

    try {
      console.log("📡 UCANMonitor: Sending get:capabilities");
      await serialBridgeRef.current.sendCommand("get:capabilities");

      console.log("📡 UCANMonitor: Sending get:actiondefs");
      await serialBridgeRef.current.sendCommand("get:actiondefs");

      console.log("📡 UCANMonitor: Sending action:list");
      await serialBridgeRef.current.sendCommand("action:list");

      // Also try get:rules as fallback (some firmware versions use this)
      setTimeout(async () => {
        if (serialBridgeRef.current && actionRules.length === 0) {
          console.log("📡 UCANMonitor: No rules received, trying get:rules");
          await serialBridgeRef.current.sendCommand("get:rules");
        }
      }, 500);

      console.log(
        "✅ UCANMonitor: Device queries sent (CAN starts automatically)",
      );

      // Wait a bit for responses to arrive, then log summary
      setTimeout(() => {
        console.log("📊 Device Configuration Summary:");
        console.log(
          "  Capabilities:",
          capabilities ? "Loaded" : "Not yet loaded",
        );
        console.log(
          "  Action Definitions:",
          actionDefinitions.length,
          "loaded",
        );
        console.log("  Active Rules:", actionRules.length, "loaded");

        if (actionDefinitions.length > 0) {
          console.log("\n📋 Available Actions:");
          console.table(
            actionDefinitions.map((a) => ({
              ID: a.i,
              Name: a.n,
              Category: a.c,
              Trigger: a.trig,
              Params: a.p?.length || 0,
            })),
          );
        }

        if (actionRules.length > 0) {
          console.log("\n⚡ Active Rules:");
          console.table(
            actionRules.map((r) => ({
              ID: r.id,
              Name: r.name,
              "CAN ID": `0x${r.canId.toString(16).toUpperCase()}`,
              Action: r.actionType,
              Source: r.paramSource,
            })),
          );
        }
      }, 1000);
    } catch (error) {
      console.error("❌ Failed to query capabilities:", error);
    }
  }, [capabilities, actionDefinitions, actionRules]);

  /**
   * Handle context menu on message
   */
  const handleMessageContextMenu = useCallback(
    (message: CANMessage, x: number, y: number) => {
      setContextMenu({ x, y, message });
    },
    [],
  );

  /**
   * Handle context menu close
   */
  const handleContextMenuClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  /**
   * Handle filter by CAN ID from context menu
   */
  const handleFilterByCANId = useCallback(
    (message: CANMessage) => {
      if (!messageBufferRef.current) return;

      const currentFilter = messageBufferRef.current.getFilter();
      const newCanIds = new Set(currentFilter.canIds);
      newCanIds.add(message.canId);

      messageBufferRef.current.setFilter({
        ...currentFilter,
        canIds: newCanIds,
      });
      updateMessagesAndStats();
      setContextMenu(null);
    },
    [updateMessagesAndStats],
  );

  /**
   * Handle build rule from packet
   */
  const handleBuildRuleFromPacket = useCallback((message: CANMessage) => {
    setPrefilledRuleMessage(message);
    setEditingRule(null); // Not editing, just prefilling
    setIsRuleBuilderOpen(true);
    setContextMenu(null);
  }, []);

  /**
   * Handle copy message as JSON
   */
  const handleCopyAsJSON = useCallback((message: CANMessage) => {
    const json = JSON.stringify(message, null, 2);
    navigator.clipboard
      .writeText(json)
      .then(() => {
        console.log("Copied to clipboard:", json);
      })
      .catch((err) => {
        console.error("Failed to copy to clipboard:", err);
      });
    setContextMenu(null);
  }, []);

  /**
   * Rule management functions
   */
  const handleAddRule = useCallback(async (command: string) => {
    if (!serialBridgeRef.current) return;

    console.log("➕ Adding rule:", command);
    await serialBridgeRef.current.sendCommand(command);

    // Refresh rules list after adding (increased timeout for firmware processing)
    setTimeout(() => {
      if (serialBridgeRef.current) {
        console.log("🔄 Refreshing rules list after add");
        serialBridgeRef.current.sendCommand("action:list");
      }
    }, 300);
  }, []);

  const handleDeleteRule = useCallback(async (ruleId: number) => {
    if (!serialBridgeRef.current) return;
    console.log("🗑️ Deleting rule:", ruleId);
    await serialBridgeRef.current.sendCommand(`action:remove:${ruleId}`);

    // Refresh rules list after deleting (query firmware instead of manual state update)
    setTimeout(() => {
      if (serialBridgeRef.current) {
        console.log("🔄 Refreshing rules list after delete");
        serialBridgeRef.current.sendCommand("action:list");
      }
    }, 300);
  }, []);

  const handleClearAllRules = useCallback(async () => {
    if (!serialBridgeRef.current) return;
    console.log("🧹 Clearing all rules");
    await serialBridgeRef.current.sendCommand("action:clear");

    // Refresh rules list after clearing (query firmware instead of manual state update)
    setTimeout(() => {
      if (serialBridgeRef.current) {
        console.log("🔄 Refreshing rules list after clear");
        serialBridgeRef.current.sendCommand("action:list");
      }
    }, 300);
  }, []);

  /**
   * Definition management handlers
   */
  const handleSelectDefinition = useCallback((id: string) => {
    setActiveDefinitionId(id);
    setIsDefinitionModalOpen(false);
    setIsOverlayPanelVisible(true);

    // Auto-select first layout if available
    if (definitionManagerRef.current) {
      const definition = definitionManagerRef.current.getDefinition(id);
      if (definition && definition.layouts.length > 0) {
        setActiveLayoutId(definition.layouts[0].id);
      }
    }
  }, []);

  const handleUploadDefinition = useCallback(
    async (file: File): Promise<{ success: boolean; error?: string }> => {
      if (!definitionManagerRef.current) {
        return { success: false, error: "Definition manager not initialized" };
      }

      try {
        const content = await file.text();
        const parsed = JSON.parse(content);
        const result = definitionManagerRef.current.addDefinition(parsed);

        if (result.valid) {
          return { success: true };
        } else {
          return { success: false, error: result.errors.join(", ") };
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Upload failed",
        };
      }
    },
    [],
  );

  return (
    <div className={`flex flex-col h-screen bg-gray-950 text-white`}>
      {/* Header - Always shown with logo */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-[1920px] mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/ucanlogo.png"
              alt="uCAN Logo"
              width={92}
              height={92}
              className="rounded"
            />
            <div>
              <h1 className="text-2xl font-bold font-mono">
                <span className="text-green-400">u</span>CAN Monitor
              </h1>
              <p className="text-sm text-gray-400">
                Universal CAN Bus Analyzer
              </p>
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
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  displayOptions.viewMode === "list"
                    ? "bg-green-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                📋 List
              </button>
              <button
                onClick={() => setViewMode("hex")}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  displayOptions.viewMode === "hex"
                    ? "bg-green-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🔢 Hex
              </button>
              <button
                onClick={() => setViewMode("stats")}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  displayOptions.viewMode === "stats"
                    ? "bg-green-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                📊 Stats
              </button>
              <button
                onClick={() => setViewMode("decoded")}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  displayOptions.viewMode === "decoded"
                    ? "bg-green-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                disabled={!activeDefinitionId}
                title={
                  !activeDefinitionId
                    ? "Load a definition to enable decoded view"
                    : "Show decoded messages"
                }
              >
                🔍 Decoded
              </button>
            </div>

            {/* Pause/Resume */}
            <button
              onClick={togglePause}
              className={`px-4 py-1 text-sm rounded border transition-colors ${
                displayOptions.paused
                  ? "bg-yellow-600/20 border-yellow-500/50 text-yellow-300"
                  : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {displayOptions.paused ? "▶️ Resume" : "⏸️ Pause"}
            </button>

            {/* Auto-Scroll Toggle */}
            <button
              onClick={toggleAutoScroll}
              className={`px-4 py-1 text-sm rounded border transition-colors ${
                displayOptions.autoScroll
                  ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                  : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
              }`}
              title={
                displayOptions.autoScroll
                  ? "Disable auto-scroll to browse older packets"
                  : "Enable auto-scroll to follow newest packets"
              }
            >
              {displayOptions.autoScroll
                ? "📜 Auto-Scroll"
                : "🔒 Scroll Locked"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Import CSV */}
            <button
              onClick={handleImportCSV}
              className="px-4 py-1 text-sm bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 rounded transition-colors"
              title="Import CAN messages from CSV file"
            >
              📥 Import CSV
            </button>

            {/* Export */}
            <div className="flex gap-1 bg-gray-950 border border-gray-700 rounded p-1">
              <button
                onClick={() => handleExport("csv")}
                className="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                title="Export as CSV"
              >
                📄 CSV
              </button>
              <button
                onClick={() => handleExport("json")}
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

            {/* Overlays Button */}
            <button
              onClick={() => setIsDefinitionModalOpen(true)}
              className={`px-4 py-1 text-sm rounded border transition-colors ${
                activeDefinitionId
                  ? "bg-green-600/20 border-green-500/50 text-green-300 hover:bg-green-600/30"
                  : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
              }`}
              title="Manage CAN overlay definitions"
            >
              🎨 Overlays
            </button>

            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-300 hover:text-green-400 transition-colors"
              title="Settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
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
            {/* Message Log - hidden when overlay is expanded */}
            {!isOverlayExpanded && (
              <div className="flex-1 overflow-hidden">
                <MessageLog
                  messages={filteredMessages}
                  onMessageSelect={setSelectedMessageId}
                  selectedMessageId={selectedMessageId}
                  autoScroll={
                    displayOptions.autoScroll && !displayOptions.paused
                  }
                  showTimestamps={displayOptions.showTimestamps}
                  viewMode={
                    displayOptions.viewMode === "stats" ||
                    displayOptions.viewMode === "timeline"
                      ? "list"
                      : displayOptions.viewMode
                  }
                  onContextMenu={handleMessageContextMenu}
                  decodedMessages={decodedMessages}
                  isOverlayActive={
                    isOverlayPanelVisible && !!activeDefinitionId
                  }
                />
              </div>
            )}
            {/* Send Panel - Collapsible (hidden when overlay is expanded) */}
            {!isOverlayExpanded && (
              <div className="border-t border-gray-700">
                <CollapsiblePanel
                  title="Send CAN Message"
                  icon="📤"
                  defaultCollapsed={false}
                >
                  <SendPanel
                    isConnected={isConnected}
                    onSend={handleSendMessage}
                  />
                </CollapsiblePanel>
              </div>
            )}

            {/* Overlay Panel - Collapsible or Full-Screen */}
            {isOverlayPanelVisible &&
              activeDefinitionId &&
              definitionManagerRef.current && (
                <div
                  className={`border-t border-gray-700 ${isOverlayExpanded ? "flex-1" : ""}`}
                >
                  {!isOverlayExpanded ? (
                    <CollapsiblePanel
                      title="CAN Overlay"
                      icon="🎨"
                      defaultCollapsed={false}
                    >
                      <div className="flex flex-col h-[400px]">
                        {/* Layout Selector & Controls */}
                        <div className="flex items-center gap-2 mb-2 p-2 bg-gray-800 border-b border-gray-700">
                          <label className="text-sm text-gray-300">
                            Layout:
                          </label>
                          <select
                            value={activeLayoutId || ""}
                            onChange={(e) => setActiveLayoutId(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm bg-gray-900 border border-gray-700 rounded text-white"
                          >
                            {definitionManagerRef.current
                              .getDefinition(activeDefinitionId)
                              ?.layouts.map((layout) => (
                                <option key={layout.id} value={layout.id}>
                                  {layout.name}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => setIsOverlayExpanded(true)}
                            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded"
                            title="Expand overlay to full-screen"
                          >
                            ⛶ Expand
                          </button>
                          <button
                            onClick={() => setIsOverlayPanelVisible(false)}
                            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded"
                          >
                            Close
                          </button>
                        </div>

                        {/* Definition Mismatch Warning */}
                        {definitionMismatchWarning.show && (
                          <div className="bg-yellow-900/30 border-b border-yellow-600/50 p-2 flex items-center gap-2 mb-2">
                            <span className="text-yellow-400">⚠️</span>
                            <p className="text-xs text-yellow-200 flex-1">
                              {definitionMismatchWarning.message}
                            </p>
                            {definitionMismatchWarning.suggestedDefinitionId && (
                              <button
                                onClick={() => {
                                  handleSelectDefinition(
                                    definitionMismatchWarning.suggestedDefinitionId!,
                                  );
                                  setDefinitionMismatchWarning({
                                    show: false,
                                    message: "",
                                  });
                                }}
                                className="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-500 text-white rounded"
                              >
                                Switch
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setDefinitionMismatchWarning({
                                  show: false,
                                  message: "",
                                })
                              }
                              className="px-1 text-xs text-yellow-400 hover:text-yellow-200"
                              title="Dismiss"
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        {/* Overlay Canvas */}
                        <div className="flex-1 overflow-auto">
                          {activeLayoutId &&
                            (() => {
                              const definition =
                                definitionManagerRef.current?.getDefinition(
                                  activeDefinitionId,
                                );
                              const layout = definition?.layouts.find(
                                (l) => l.id === activeLayoutId,
                              );
                              if (layout && definition) {
                                return (
                                  <OverlayCanvas
                                    layout={layout}
                                    widgets={definition.widgets}
                                    decodedMessages={decodedMessages}
                                    selectedMessageId={selectedMessageId}
                                    isFullScreen={false}
                                  />
                                );
                              }
                              return (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                  Select a layout to display
                                </div>
                              );
                            })()}
                        </div>
                      </div>
                    </CollapsiblePanel>
                  ) : (
                    /* Full-Screen Overlay Mode */
                    <div className="flex flex-col h-full">
                      {/* Full-Screen Header */}
                      <div className="flex items-center gap-2 p-3 bg-gray-800 border-b border-gray-700">
                        <span className="text-lg font-semibold text-green-400">
                          🎨 CAN Overlay
                        </span>
                        <span className="text-gray-500 mx-2">|</span>
                        <label className="text-sm text-gray-300">Layout:</label>
                        <select
                          value={activeLayoutId || ""}
                          onChange={(e) => setActiveLayoutId(e.target.value)}
                          className="px-3 py-1 text-sm bg-gray-900 border border-gray-700 rounded text-white"
                        >
                          {definitionManagerRef.current
                            .getDefinition(activeDefinitionId)
                            ?.layouts.map((layout) => (
                              <option key={layout.id} value={layout.id}>
                                {layout.name}
                              </option>
                            ))}
                        </select>
                        <div className="flex-1"></div>
                        <button
                          onClick={() => setIsOverlayExpanded(false)}
                          className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-500 text-white rounded"
                          title="Collapse to split view"
                        >
                          ⛶ Collapse
                        </button>
                        <button
                          onClick={() => setIsOverlayPanelVisible(false)}
                          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
                        >
                          Close
                        </button>
                      </div>

                      {/* Definition Mismatch Warning */}
                      {definitionMismatchWarning.show && (
                        <div className="bg-yellow-900/30 border-b border-yellow-600/50 p-3 flex items-center gap-3">
                          <span className="text-yellow-400 text-lg">⚠️</span>
                          <p className="text-sm text-yellow-200 flex-1">
                            {definitionMismatchWarning.message}
                          </p>
                          {definitionMismatchWarning.suggestedDefinitionId && (
                            <button
                              onClick={() => {
                                handleSelectDefinition(
                                  definitionMismatchWarning.suggestedDefinitionId!,
                                );
                                setDefinitionMismatchWarning({
                                  show: false,
                                  message: "",
                                });
                              }}
                              className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-500 text-white rounded"
                            >
                              Switch Definition
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setDefinitionMismatchWarning({
                                show: false,
                                message: "",
                              })
                            }
                            className="px-2 py-1 text-xs text-yellow-400 hover:text-yellow-200"
                            title="Dismiss warning"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Full-Screen Overlay Canvas */}
                      <div className="flex-1 overflow-auto">
                        {activeLayoutId &&
                          (() => {
                            const definition =
                              definitionManagerRef.current?.getDefinition(
                                activeDefinitionId,
                              );
                            const layout = definition?.layouts.find(
                              (l) => l.id === activeLayoutId,
                            );
                            if (layout && definition) {
                              return (
                                <OverlayCanvas
                                  layout={layout}
                                  widgets={definition.widgets}
                                  decodedMessages={decodedMessages}
                                  selectedMessageId={selectedMessageId}
                                  isFullScreen={true}
                                />
                              );
                            }
                            return (
                              <div className="flex items-center justify-center h-full text-gray-500 text-lg">
                                Select a layout to display
                              </div>
                            );
                          })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Right Sidebar - Board Info & Filters (200% wider: was 320px, now 640px) */}
          <div className="w-[40rem] flex-shrink-0 overflow-y-auto h-full p-4 space-y-4">
            {/* Board Information */}
            <BoardInfoPanel
              capabilities={capabilities || undefined}
              isConnected={isConnected}
              onSendCommand={async (command: string) => {
                if (serialBridgeRef.current) {
                  await serialBridgeRef.current.sendCommand(command);
                }
              }}
              onDisconnect={handleDisconnect}
              onConnect={handleConnect}
              rules={actionRules}
              onCreateRule={() => {
                setEditingRule(null);
                setIsRuleBuilderOpen(true);
              }}
              onEditRule={(rule) => {
                setEditingRule(rule);
                setIsRuleBuilderOpen(true);
              }}
              onDeleteRule={handleDeleteRule}
              onClearAllRules={handleClearAllRules}
              recentlyFiredRules={recentlyFiredRules}
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
        message={filteredMessages.find((m) => m.id === selectedMessageId)}
        isOpen={!!selectedMessageId}
        onClose={() => setSelectedMessageId(undefined)}
        onNavigate={handleNavigateMessage}
        hasPrev={hasPrevMessage}
        hasNext={hasNextMessage}
        isOverlayActive={isOverlayPanelVisible && !!activeDefinitionId}
        decodedMessages={decodedMessages}
      />

      {/* Status Bar with Statistics */}
      <div className="bg-gray-900 border-t border-gray-700 p-2 text-xs font-mono">
        <div className="max-w-[1920px] mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className={isConnected ? "text-green-400" : "text-gray-500"}>
              {isConnected ? "🟢 Connected" : "⚫ Disconnected"}
            </span>
            <span className="text-gray-400">|</span>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">
                RX:{" "}
                <span className="text-blue-400 font-semibold">
                  {stats.rxCount}
                </span>
              </span>
              <span className="text-gray-300">
                TX:{" "}
                <span className="text-yellow-400 font-semibold">
                  {stats.txCount}
                </span>
              </span>
              <span className="text-gray-300">
                ERR:{" "}
                <span className="text-red-400 font-semibold">
                  {stats.errorCount}
                </span>
              </span>
            </div>
            <span className="text-gray-400">|</span>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">
                {stats.messagesPerSecond.toFixed(1)}{" "}
                <span className="text-gray-500">msg/s</span>
              </span>
              <span className="text-gray-300">
                {stats.busLoad.toFixed(1)}
                <span className="text-gray-500">% load</span>
              </span>
            </div>
            {displayOptions.paused && (
              <>
                <span className="text-gray-400">|</span>
                <span className="text-yellow-400 font-semibold">⏸️ PAUSED</span>
              </>
            )}
            {!displayOptions.autoScroll && (
              <>
                <span className="text-gray-400">|</span>
                <span className="text-blue-400 font-semibold">
                  🔒 SCROLL LOCKED
                </span>
              </>
            )}
          </div>
          <span className="text-gray-400">
            {serialConfig.baudRate} baud{" "}
            <span className="text-gray-500">|</span> {filteredMessages.length}{" "}
            shown
          </span>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={serialConfig}
        onConfigChange={setSerialConfig}
        isConnected={isConnected}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Rule Builder Modal */}
      <RuleBuilderModal
        isOpen={isRuleBuilderOpen}
        onClose={() => {
          setIsRuleBuilderOpen(false);
          setEditingRule(null);
          setPrefilledRuleMessage(null);
        }}
        actionDefinitions={actionDefinitions}
        onAddRule={handleAddRule}
        isConnected={isConnected}
        editingRule={editingRule}
        prefilledMessage={prefilledRuleMessage}
      />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={[
            {
              label: "Copy as JSON",
              icon: "📋",
              onClick: () => handleCopyAsJSON(contextMenu.message),
            },
            {
              label: "Filter by CAN ID",
              icon: "🔍",
              onClick: () => handleFilterByCANId(contextMenu.message),
            },
            {
              label: "Build Rule from Packet",
              icon: "⚡",
              onClick: () => handleBuildRuleFromPacket(contextMenu.message),
            },
          ]}
          onClose={handleContextMenuClose}
        />
      )}

      {/* Definition Manager Modal */}
      {definitionManagerRef.current && (
        <DefinitionManagerModal
          isOpen={isDefinitionModalOpen}
          onClose={() => setIsDefinitionModalOpen(false)}
          definitions={definitionManagerRef.current.getDefinitionMetadata()}
          activeDefinitionId={activeDefinitionId}
          onSelectDefinition={handleSelectDefinition}
          onUploadDefinition={handleUploadDefinition}
        />
      )}
    </div>
  );
}
