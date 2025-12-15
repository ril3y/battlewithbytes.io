/**
 * @file SWO Viewer Component
 * @description React component for real-time SWO/ITM trace data visualization
 *
 * Provides a user interface for viewing, filtering, and exporting SWO trace data
 * with channel-based color coding and search capabilities.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { GdbClient } from "../lib/gdb/GdbClient";
import { SwoDecoder } from "../lib/swo/SwoDecoder";
import { IPacketObserver } from "../lib/swo/BaseDecoder";
import {
  PacketEvent,
  DecoderError,
  DecoderOptions,
  SwoEncoding,
  PacketType,
  InstrumentationPacket,
  HardwarePacket,
  TimestampPacket,
  SwoStatistics,
} from "../lib/swo/types";

/**
 * Trace entry displayed in the viewer
 */
interface TraceEntry {
  /** Unique entry ID */
  id: number;
  /** Entry timestamp */
  timestamp: number;
  /** ITM port number (if applicable) */
  port?: number;
  /** Entry type */
  type: PacketType;
  /** Display text */
  text: string;
  /** Raw data (hex) */
  rawHex: string;
  /** Color class for display */
  colorClass: string;
}

/**
 * Component Props
 */
interface SwoViewerProps {
  /** GDB client for SWO configuration */
  gdbClient: GdbClient | null;
  /** Connection status */
  isConnected: boolean;
  /** Callback for status messages */
  onOutput?: (message: string) => void;
}

/**
 * Port color mapping for visual distinction
 */
const PORT_COLORS: string[] = [
  "text-green-400", // Port 0 - Primary printf
  "text-blue-400", // Port 1
  "text-yellow-400", // Port 2
  "text-purple-400", // Port 3
  "text-pink-400", // Port 4
  "text-indigo-400", // Port 5
  "text-orange-400", // Port 6
  "text-teal-400", // Port 7
  "text-red-400", // Port 8
  "text-cyan-400", // Port 9
  "text-lime-400", // Port 10
  "text-amber-400", // Port 11
  "text-emerald-400", // Port 12
  "text-violet-400", // Port 13
  "text-fuchsia-400", // Port 14
  "text-rose-400", // Port 15
];

/**
 * Get color class for port
 */
function getPortColor(port: number): string {
  return PORT_COLORS[port % PORT_COLORS.length];
}

/**
 * SWO Viewer Component
 *
 * Provides real-time visualization of SWO trace data with filtering,
 * search, and export capabilities.
 */
export default function SwoViewer({
  gdbClient,
  isConnected,
  onOutput,
}: SwoViewerProps) {
  // State
  const [isCapturing, setIsCapturing] = useState(false);
  const [entries, setEntries] = useState<TraceEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [enabledPorts, setEnabledPorts] = useState<Set<number>>(
    new Set(Array.from({ length: 32 }, (_, i) => i)),
  );
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showRawData, setShowRawData] = useState(false);
  const [statistics, setStatistics] = useState<SwoStatistics | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Refs
  const decoderRef = useRef<SwoDecoder | null>(null);
  const entryIdRef = useRef(0);
  const outputRef = useRef<HTMLDivElement>(null);
  const pausedEntriesRef = useRef<TraceEntry[]>([]);

  /**
   * Create packet observer for decoder
   */
  const packetObserver = useMemo<IPacketObserver>(
    () => ({
      onPacket: (event: PacketEvent) => {
        const entry = createTraceEntry(event);
        if (!entry) return;

        if (isPaused) {
          pausedEntriesRef.current.push(entry);
        } else {
          setEntries((prev) => {
            const newEntries = [...prev, entry];
            // Limit to last 10000 entries
            return newEntries.slice(-10000);
          });
        }
      },
      onError: (error: DecoderError) => {
        if (onOutput) {
          onOutput(`[SWO Error] ${error.message}`);
        }
      },
    }),
    [isPaused, onOutput],
  );

  /**
   * Create trace entry from packet event
   */
  const createTraceEntry = useCallback(
    (event: PacketEvent): TraceEntry | null => {
      const packet = event.packet;
      const id = ++entryIdRef.current;
      const timestamp = event.timestamp;

      // Filter by port if instrumentation packet
      if (packet.type === PacketType.INSTRUMENTATION) {
        const instPacket = packet as InstrumentationPacket;
        if (!enabledPorts.has(instPacket.port)) {
          return null;
        }
      }

      // Create base entry
      const entry: TraceEntry = {
        id,
        timestamp,
        type: packet.type,
        text: "",
        rawHex: Array.from(packet.raw)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" "),
        colorClass: "text-gray-400",
      };

      // Format based on packet type
      switch (packet.type) {
        case PacketType.INSTRUMENTATION: {
          const inst = packet as InstrumentationPacket;
          entry.port = inst.port;
          entry.text =
            inst.text || `[Port ${inst.port}] ${formatHexData(inst.data)}`;
          entry.colorClass = getPortColor(inst.port);
          break;
        }

        case PacketType.HARDWARE: {
          const hw = packet as HardwarePacket;
          entry.text = hw.description || `Hardware Event ${hw.sourceId}`;
          entry.colorClass = "text-yellow-400";
          break;
        }

        case PacketType.TIMESTAMP: {
          const ts = packet as TimestampPacket;
          entry.text = `Timestamp: ${ts.value} ${ts.isAbsolute ? "(absolute)" : "(relative)"}`;
          entry.colorClass = "text-gray-500";
          break;
        }

        case PacketType.SYNC:
          entry.text = "Protocol Sync";
          entry.colorClass = "text-blue-300";
          break;

        case PacketType.OVERFLOW:
          entry.text = "OVERFLOW - Data Lost!";
          entry.colorClass = "text-red-500 font-bold";
          break;

        default:
          entry.text = `Unknown packet type: ${packet.type}`;
          entry.colorClass = "text-gray-500";
      }

      return entry;
    },
    [enabledPorts],
  );

  /**
   * Format hex data for display
   */
  const formatHexData = (data: Uint8Array): string => {
    return Array.from(data)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");
  };

  /**
   * Start SWO capture
   */
  const handleStart = useCallback(async () => {
    if (!gdbClient || !isConnected) {
      onOutput?.("[SWO] Not connected to target");
      return;
    }

    try {
      onOutput?.("[SWO] Configuring SWO output...");

      // Configure SWO via monitor commands
      // Note: Black Magic Probe has limited SWO support
      await gdbClient.sendMonitorCommand("traceswo 2000000"); // 2MHz SWO

      // Create decoder
      const options: DecoderOptions = {
        encoding: SwoEncoding.UART_NRZ,
        autoSync: true,
        collectStats: true,
        portFilter: {
          enabledPorts: Array.from(enabledPorts),
        },
      };

      const decoder = new SwoDecoder(options);
      decoder.addObserver(packetObserver);
      decoderRef.current = decoder;

      setIsCapturing(true);
      onOutput?.("[SWO] Capture started");

      // Start polling for SWO data
      // Note: This would need actual SWO data source integration
      // For now, this is a placeholder for the data reception loop
      startDataReception();
    } catch (error) {
      onOutput?.(`[SWO] Failed to start: ${error}`);
      setIsCapturing(false);
    }
  }, [gdbClient, isConnected, enabledPorts, packetObserver, onOutput]);

  /**
   * Stop SWO capture
   */
  const handleStop = useCallback(() => {
    if (decoderRef.current) {
      decoderRef.current.clearObservers();
      decoderRef.current = null;
    }

    setIsCapturing(false);
    onOutput?.("[SWO] Capture stopped");
  }, [onOutput]);

  /**
   * Start data reception (placeholder)
   */
  const startDataReception = () => {
    // This would normally connect to the actual SWO data source
    // For Black Magic Probe, this might involve reading from a specific endpoint
    // or monitoring command output

    // Placeholder: simulate some data for testing
    if (decoderRef.current && process.env.NODE_ENV === "development") {
      // Test data simulation
      setTimeout(() => {
        if (decoderRef.current) {
          // Simulate sync packet
          const syncData = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x80]);
          decoderRef.current.decode(syncData);

          // Simulate printf on port 0
          const printfHeader = 0x01 | (0 << 3); // Port 0, 1 byte payload
          const printfData = new Uint8Array([printfHeader, 0x48]); // 'H'
          decoderRef.current.decode(printfData);
        }
      }, 100);
    }
  };

  /**
   * Clear trace entries
   */
  const handleClear = useCallback(() => {
    setEntries([]);
    pausedEntriesRef.current = [];
    entryIdRef.current = 0;
    if (decoderRef.current) {
      decoderRef.current.resetStatistics();
    }
  }, []);

  /**
   * Toggle pause
   */
  const handleTogglePause = useCallback(() => {
    if (isPaused && pausedEntriesRef.current.length > 0) {
      // Resume and add paused entries
      setEntries((prev) => {
        const combined = [...prev, ...pausedEntriesRef.current];
        pausedEntriesRef.current = [];
        return combined.slice(-10000);
      });
    }
    setIsPaused(!isPaused);
  }, [isPaused]);

  /**
   * Export trace to file
   */
  const handleExport = useCallback(() => {
    const filtered = filterEntries(entries);
    const content = filtered
      .map((entry) => {
        const timestamp = new Date(entry.timestamp).toISOString();
        const port = entry.port !== undefined ? `[Port ${entry.port}]` : "";
        return `${timestamp} ${port} ${entry.text}`;
      })
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swo_trace_${new Date().toISOString().replace(/:/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  /**
   * Toggle port enable/disable
   */
  const handleTogglePort = useCallback(
    (port: number) => {
      setEnabledPorts((prev) => {
        const next = new Set(prev);
        if (next.has(port)) {
          next.delete(port);
        } else {
          next.add(port);
        }

        // Update decoder filter
        if (decoderRef.current) {
          decoderRef.current.removeObserver(packetObserver);
          const options: DecoderOptions = {
            encoding: SwoEncoding.UART_NRZ,
            autoSync: true,
            collectStats: true,
            portFilter: {
              enabledPorts: Array.from(next),
            },
          };
          const newDecoder = new SwoDecoder(options);
          newDecoder.addObserver(packetObserver);
          decoderRef.current = newDecoder;
        }

        return next;
      });
    },
    [packetObserver],
  );

  /**
   * Filter entries by search query
   */
  const filterEntries = useCallback(
    (entries: TraceEntry[]): TraceEntry[] => {
      if (!searchQuery) return entries;

      const query = searchQuery.toLowerCase();
      return entries.filter(
        (entry) =>
          entry.text.toLowerCase().includes(query) ||
          entry.rawHex.toLowerCase().includes(query) ||
          (entry.port !== undefined && `port ${entry.port}`.includes(query)),
      );
    },
    [searchQuery],
  );

  /**
   * Update statistics periodically
   */
  useEffect(() => {
    if (!isCapturing || !decoderRef.current) return;

    const interval = setInterval(() => {
      if (decoderRef.current) {
        setStatistics(decoderRef.current.getStatistics());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCapturing]);

  /**
   * Auto-scroll to bottom
   */
  useEffect(() => {
    if (autoScroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [entries, autoScroll]);

  // Filtered entries
  const filteredEntries = useMemo(
    () => filterEntries(entries),
    [entries, filterEntries],
  );

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-green-400">
            SWO Trace Viewer
          </h3>
          <div className="flex items-center gap-2">
            {!isCapturing ? (
              <button
                onClick={handleStart}
                disabled={!isConnected}
                className="px-3 py-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded text-sm font-mono transition-colors"
              >
                Start
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-mono transition-colors"
              >
                Stop
              </button>
            )}
            <button
              onClick={handleTogglePause}
              disabled={!isCapturing}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded text-sm font-mono transition-colors"
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm font-mono transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleExport}
              disabled={entries.length === 0}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded text-sm font-mono transition-colors"
            >
              Export
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 text-sm">
          {/* Search */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Search:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter trace..."
              className="px-2 py-1 bg-gray-800 text-gray-200 rounded border border-gray-700 focus:border-green-400 focus:outline-none font-mono text-xs"
            />
          </div>

          {/* Options */}
          <label className="flex items-center gap-1 text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showTimestamps}
              onChange={(e) => setShowTimestamps(e.target.checked)}
              className="cursor-pointer"
            />
            <span>Timestamps</span>
          </label>

          <label className="flex items-center gap-1 text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showRawData}
              onChange={(e) => setShowRawData(e.target.checked)}
              className="cursor-pointer"
            />
            <span>Raw Data</span>
          </label>

          <label className="flex items-center gap-1 text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="cursor-pointer"
            />
            <span>Auto-scroll</span>
          </label>

          {/* Statistics */}
          {statistics && (
            <div className="ml-auto text-xs text-gray-500">
              Packets: {statistics.packetsReceived} | Errors:{" "}
              {statistics.syncErrors} | Overflows: {statistics.overflowEvents}
            </div>
          )}
        </div>

        {/* Port Filter */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-gray-400 text-sm">Ports:</span>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 16 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleTogglePort(i)}
                className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                  enabledPorts.has(i)
                    ? `${getPortColor(i)} bg-gray-800 hover:bg-gray-700`
                    : "text-gray-600 bg-gray-900 hover:bg-gray-800"
                }`}
              >
                {i}
              </button>
            ))}
            <button
              onClick={() => {
                const allPorts = Array.from({ length: 32 }, (_, i) => i);
                setEnabledPorts(
                  new Set(enabledPorts.size === 32 ? [] : allPorts),
                );
              }}
              className="px-2 py-0.5 text-xs font-mono rounded bg-gray-800 hover:bg-gray-700 text-gray-400"
            >
              {enabledPorts.size === 32 ? "None" : "All"}
            </button>
          </div>
        </div>
      </div>

      {/* Trace Output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto bg-gray-950 p-2 font-mono text-xs"
      >
        {filteredEntries.length === 0 ? (
          <div className="text-gray-600 text-center py-8">
            {isCapturing
              ? "Waiting for SWO data..."
              : "No trace data. Start capture to begin."}
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-2 hover:bg-gray-900 px-1 py-0.5"
              >
                {showTimestamps && (
                  <span className="text-gray-600 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleTimeString("en-US", {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      fractionalSecondDigits: 3,
                    })}
                  </span>
                )}
                {entry.port !== undefined && (
                  <span className={`${entry.colorClass} whitespace-nowrap`}>
                    [{entry.port.toString().padStart(2, " ")}]
                  </span>
                )}
                <span className={entry.colorClass + " flex-1 break-all"}>
                  {entry.text}
                </span>
                {showRawData && (
                  <span className="text-gray-600 text-xs whitespace-nowrap font-mono">
                    {entry.rawHex}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
