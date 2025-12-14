"use client";

/**
 * Memory Panel Component
 *
 * Displays memory contents in hex view format with tabs for Memory and Threads
 */

import React, { useState, useCallback, ReactElement, useEffect } from "react";
import ThreadsPanel from "./ThreadsPanel";
import { GdbClient } from "../lib/gdb/GdbClient";

type TabType = "memory" | "threads";

interface MemoryPanelProps {
  onReadMemory: (address: number, length: number) => Promise<Uint8Array | null>;
  isConnected: boolean;
  gdbClient?: GdbClient | null;
  onOutput?: (message: string) => void;
  autoReadAddress?: number; // External trigger to read memory at this address
}

type DataWidth = 8 | 16 | 32;

export default function MemoryPanel({
  onReadMemory,
  isConnected,
  gdbClient,
  onOutput,
  autoReadAddress,
}: MemoryPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("memory");
  const [address, setAddress] = useState("0x20000000"); // Default to RAM region
  const [length, setLength] = useState(256);
  const [memoryData, setMemoryData] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoToModal, setShowGoToModal] = useState(false);
  const [goToAddress, setGoToAddress] = useState("");
  const [goToError, setGoToError] = useState<string | null>(null);
  const [isMouseOverPanel, setIsMouseOverPanel] = useState(false);
  const [followPC, setFollowPC] = useState(true); // Follow PC by default
  const [dataWidth, setDataWidth] = useState<DataWidth>(8); // 8-bit bytes by default

  // Auto-read memory when external trigger changes (only if followPC is enabled)
  useEffect(() => {
    if (autoReadAddress !== undefined && isConnected && followPC) {
      const readAddr = autoReadAddress;
      setAddress(`0x${readAddr.toString(16).toUpperCase()}`);

      // Auto-read memory at the new address
      (async () => {
        try {
          setLoading(true);
          const data = await onReadMemory(readAddr, length);
          if (data) {
            setMemoryData(data);
            setError(null);
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to read memory",
          );
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [autoReadAddress, isConnected, onReadMemory, length, followPC]);

  const handleRead = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const addr = parseInt(address, 16);
      if (isNaN(addr)) {
        setError("Invalid address");
        return;
      }

      const data = await onReadMemory(addr, length);
      if (data) {
        setMemoryData(data);
      } else {
        setError("Failed to read memory");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [address, length, isConnected, onReadMemory]);

  // Keyboard handler for "G" key to open Go To modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Only handle G key when mouse is over this panel and modal is not already open
      if (
        (e.key === "g" || e.key === "G") &&
        isMouseOverPanel &&
        !showGoToModal &&
        activeTab === "memory"
      ) {
        e.preventDefault();
        setShowGoToModal(true);
        setGoToAddress("");
        setGoToError(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMouseOverPanel, showGoToModal, activeTab]);

  // Handle Go To address submission
  const handleGoToSubmit = useCallback(async () => {
    setGoToError(null);

    // Prevent rapid submissions while already loading
    if (loading) {
      return;
    }

    try {
      const input = goToAddress.trim();

      if (!input) {
        setGoToError("Please enter an address");
        return;
      }

      // Parse address (hex or decimal)
      let addr = 0;
      if (input.startsWith("0x") || input.startsWith("0X")) {
        addr = parseInt(input, 16);
      } else {
        addr = parseInt(input, 10);
      }

      if (isNaN(addr) || addr < 0) {
        setGoToError("Invalid address format");
        return;
      }

      // Validate address range
      if (addr > 0xffffffff) {
        setGoToError("Address out of range (max: 0xFFFFFFFF)");
        return;
      }

      // Set address and close modal
      setAddress(`0x${addr.toString(16)}`);
      setShowGoToModal(false);
      setGoToAddress("");
      setLoading(true);

      // Auto-read memory at new address
      if (isConnected) {
        try {
          const data = await onReadMemory(addr, length);
          if (data) {
            setMemoryData(data);
            setError(null);
          } else {
            setError("Failed to read memory");
          }
        } catch (readErr) {
          setError(
            readErr instanceof Error
              ? readErr.message
              : "Failed to read memory",
          );
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      setGoToError(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setLoading(false);
    }
  }, [goToAddress, isConnected, onReadMemory, length, loading]);

  const formatHexView = (
    data: Uint8Array,
    baseAddress: number,
    width: DataWidth,
  ): ReactElement[] => {
    const lines: ReactElement[] = [];
    const bytesPerLine = 16;

    for (let offset = 0; offset < data.length; offset += bytesPerLine) {
      const lineAddr = baseAddress + offset;
      const lineData = data.slice(offset, offset + bytesPerLine);

      // Create hex representation based on data width
      let hexBytes: string;
      if (width === 8) {
        // 8-bit bytes
        hexBytes = Array.from(lineData)
          .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
          .join(" ");
      } else if (width === 16) {
        // 16-bit words (little-endian)
        const words: string[] = [];
        for (let i = 0; i < lineData.length; i += 2) {
          if (i + 1 < lineData.length) {
            const word = (lineData[i + 1] << 8) | lineData[i];
            words.push(word.toString(16).padStart(4, "0").toUpperCase());
          } else {
            words.push(
              lineData[i].toString(16).padStart(2, "0").toUpperCase() + "  ",
            );
          }
        }
        hexBytes = words.join(" ");
      } else {
        // 32-bit dwords (little-endian)
        const dwords: string[] = [];
        for (let i = 0; i < lineData.length; i += 4) {
          if (i + 3 < lineData.length) {
            const dword =
              (lineData[i + 3] << 24) |
              (lineData[i + 2] << 16) |
              (lineData[i + 1] << 8) |
              lineData[i];
            dwords.push(dword.toString(16).padStart(8, "0").toUpperCase());
          } else {
            // Partial dword
            let partial = "";
            for (let j = i; j < lineData.length && j < i + 4; j++) {
              partial =
                lineData[j].toString(16).padStart(2, "0").toUpperCase() +
                partial;
            }
            dwords.push(partial.padStart(8, " "));
          }
        }
        hexBytes = dwords.join(" ");
      }

      // Create ASCII representation
      const ascii = Array.from(lineData)
        .map((byte) =>
          byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".",
        )
        .join("");

      lines.push(
        <div
          key={offset}
          className="font-mono text-xs hover:bg-gray-800 px-2 py-0.5"
          style={{
            display: "flex",
            fontFamily: 'Monaco, "Courier New", Courier, monospace',
          }}
        >
          <span
            className="text-blue-400"
            style={{ width: "72px", flexShrink: 0 }}
          >
            {lineAddr.toString(16).padStart(8, "0").toUpperCase()}
          </span>
          <span
            className="text-gray-300"
            style={{ width: "400px", flexShrink: 0, marginLeft: "16px" }}
          >
            {hexBytes.padEnd(47, " ")}
          </span>
          <span className="text-yellow-400" style={{ marginLeft: "16px" }}>
            {ascii}
          </span>
        </div>,
      );
    }

    return lines;
  };

  // Common memory regions for ARM Cortex-M
  const memoryRegions = [
    { name: "Flash", address: "0x08000000" },
    { name: "RAM", address: "0x20000000" },
    { name: "Peripherals", address: "0x40000000" },
    { name: "System", address: "0xE0000000" },
  ];

  return (
    <div
      className="flex flex-col h-full bg-gray-950 relative"
      onMouseEnter={() => setIsMouseOverPanel(true)}
      onMouseLeave={() => setIsMouseOverPanel(false)}
    >
      {/* Header with Tabs */}
      <div className="flex items-center justify-between border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab("memory")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "memory"
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Memory
          </button>
          <button
            onClick={() => setActiveTab("threads")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "threads"
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Threads
          </button>
        </div>
        {activeTab === "memory" && (
          <div className="flex items-center gap-2 pr-3">
            <select
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-green-500"
            >
              <option value={address}>{address}</option>
              {memoryRegions.map((region) => (
                <option key={region.address} value={region.address}>
                  {region.name} ({region.address})
                </option>
              ))}
            </select>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x20000000"
              className="w-24 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-green-500 font-mono"
            />
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value) || 256)}
              min="16"
              max="4096"
              step="16"
              className="w-16 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-green-500"
            />
            <select
              value={dataWidth}
              onChange={(e) =>
                setDataWidth(parseInt(e.target.value) as DataWidth)
              }
              className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-green-500"
              title="Data width"
            >
              <option value={8}>8-bit</option>
              <option value={16}>16-bit</option>
              <option value={32}>32-bit</option>
            </select>
            <label
              className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer"
              title="Auto-follow program counter"
            >
              <input
                type="checkbox"
                checked={followPC}
                onChange={(e) => setFollowPC(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500 focus:ring-offset-gray-900"
              />
              <span>Follow PC</span>
            </label>
            <button
              onClick={handleRead}
              disabled={!isConnected || loading}
              className="px-3 py-1 text-xs rounded border bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Reading..." : "Read"}
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "memory" ? (
        <>
          {/* Memory Content */}
          <div className="flex-1 overflow-y-auto">
            {!isConnected ? (
              <div className="text-gray-500 text-xs text-center mt-4">
                Connect to target to view memory
              </div>
            ) : error ? (
              <div className="text-red-400 text-xs text-center mt-4">
                Error: {error}
              </div>
            ) : memoryData ? (
              <div className="py-2">
                {formatHexView(memoryData, parseInt(address, 16), dataWidth)}
              </div>
            ) : (
              <div className="text-gray-500 text-xs text-center mt-4">
                Enter address and click Read to view memory
              </div>
            )}
          </div>

          {/* Footer with info */}
          {memoryData && (
            <div className="p-2 border-t border-gray-700 text-xs text-gray-400">
              Showing {memoryData.length} bytes from {address}
            </div>
          )}
        </>
      ) : (
        <ThreadsPanel
          gdbClient={gdbClient}
          isConnected={isConnected}
          onOutput={onOutput}
        />
      )}

      {/* Go To Address Modal */}
      {showGoToModal && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-gray-900 border-2 border-green-500 rounded-lg shadow-2xl p-4 w-96">
            <h3 className="text-sm font-bold text-green-400 mb-3">
              Go To Memory Address
            </h3>

            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">
                Enter address (hex or decimal):
              </label>
              <input
                type="text"
                value={goToAddress}
                onChange={(e) => setGoToAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleGoToSubmit();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    setShowGoToModal(false);
                  }
                }}
                placeholder="0x20000000 or 536870912"
                className="w-full px-2 py-1.5 text-sm bg-gray-900 border border-gray-600 rounded text-gray-300 font-mono focus:outline-none focus:border-green-500"
                autoFocus
              />
            </div>

            {goToError && (
              <div className="mb-3 px-2 py-1.5 bg-red-900 bg-opacity-30 border border-red-500 rounded text-red-400 text-xs">
                {goToError}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowGoToModal(false)}
                className="px-3 py-1.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              >
                Cancel (Esc)
              </button>
              <button
                onClick={handleGoToSubmit}
                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-500"
              >
                Go (Enter)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
