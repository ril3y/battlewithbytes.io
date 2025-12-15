/**
 * Binary Info Panel Component
 *
 * Displays parsed binary information including architecture, vectors,
 * sections, and metadata. Provides interactive features like context menus
 * for setting breakpoints and navigating to addresses.
 */

"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  BinaryInfo,
  VectorInfo,
  Architecture,
  VectorType,
} from "../lib/binary/types";
import { ContextMenu } from "./ContextMenu";

/**
 * Props for BinaryInfoPanel
 */
interface BinaryInfoPanelProps {
  /** Parsed binary information */
  binaryInfo: BinaryInfo | null;

  /** Callback when user requests to set breakpoint */
  onSetBreakpoint?: (address: number) => void;

  /** Callback when user wants to jump to address */
  onJumpToAddress?: (address: number) => void;

  /** Callback when user wants to view memory at address */
  onViewMemory?: (address: number) => void;

  /** Optional CSS class name */
  className?: string;
}

/**
 * Binary Info Panel
 *
 * Features:
 * - Architecture and metadata display
 * - Vector table with interactive elements
 * - Section information
 * - Symbol table (if available)
 * - Memory map visualization
 * - Context menus for actions
 */
export const BinaryInfoPanel: React.FC<BinaryInfoPanelProps> = ({
  binaryInfo,
  onSetBreakpoint,
  onJumpToAddress,
  onViewMemory,
  className = "",
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["overview", "vectors"]),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVector, setSelectedVector] = useState<VectorInfo | null>(null);

  /**
   * Toggle section expansion
   */
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  /**
   * Format address as hex string
   */
  const formatAddress = useCallback((addr: number | undefined): string => {
    if (addr === undefined) return "N/A";
    return `0x${addr.toString(16).toUpperCase().padStart(8, "0")}`;
  }, []);

  /**
   * Format size in human-readable form
   */
  const formatSize = useCallback((size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }, []);

  /**
   * Get vector type color
   */
  const getVectorTypeColor = useCallback((type: VectorType): string => {
    switch (type) {
      case "reset":
        return "text-red-500";
      case "nmi":
        return "text-orange-500";
      case "hardfault":
        return "text-red-400";
      case "irq":
        return "text-blue-500";
      case "exception":
        return "text-yellow-500";
      case "trap":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  }, []);

  /**
   * Get architecture icon
   */
  const getArchitectureIcon = useCallback((arch: Architecture): string => {
    switch (arch) {
      case "ARM":
        return "🔧";
      case "MIPS":
        return "⚙️";
      case "RISCV":
        return "🚀";
      case "X86":
        return "💻";
      default:
        return "❓";
    }
  }, []);

  /**
   * Filter vectors based on search term
   */
  const filteredVectors = useMemo(() => {
    if (!binaryInfo || !searchTerm) return binaryInfo?.vectors || [];

    const term = searchTerm.toLowerCase();
    return binaryInfo.vectors.filter(
      (v) =>
        v.name.toLowerCase().includes(term) ||
        v.type.toLowerCase().includes(term) ||
        formatAddress(v.address).toLowerCase().includes(term) ||
        formatAddress(v.handlerAddress).toLowerCase().includes(term),
    );
  }, [binaryInfo, searchTerm, formatAddress]);

  if (!binaryInfo) {
    return (
      <div className={`bg-gray-800 text-gray-300 p-4 rounded ${className}`}>
        <p className="text-center text-gray-500">No binary loaded</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 text-gray-300 overflow-auto ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span>{getArchitectureIcon(binaryInfo.architecture)}</span>
          Binary Information
        </h2>
      </div>

      {/* Overview Section */}
      <div className="border-b border-gray-700">
        <button
          onClick={() => toggleSection("overview")}
          className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-700 transition-colors"
        >
          <span className="font-medium">Overview</span>
          <span>{expandedSections.has("overview") ? "▼" : "▶"}</span>
        </button>
        {expandedSections.has("overview") && (
          <div className="px-4 py-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Architecture:</span>
              <span className="font-mono">{binaryInfo.architecture}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Format:</span>
              <span className="font-mono">{binaryInfo.metadata.format}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Entry Point:</span>
              <span
                className="font-mono text-blue-400 cursor-pointer hover:underline"
                onClick={() => onJumpToAddress?.(binaryInfo.entryPoint)}
              >
                {formatAddress(binaryInfo.entryPoint)}
              </span>
            </div>
            {binaryInfo.stackPointer && (
              <div className="flex justify-between">
                <span className="text-gray-400">Stack Pointer:</span>
                <span className="font-mono">
                  {formatAddress(binaryInfo.stackPointer)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">File Size:</span>
              <span className="font-mono">
                {formatSize(binaryInfo.metadata.fileSize)}
              </span>
            </div>
            {binaryInfo.metadata.endianness && (
              <div className="flex justify-between">
                <span className="text-gray-400">Endianness:</span>
                <span className="font-mono">
                  {binaryInfo.metadata.endianness === "little"
                    ? "Little Endian"
                    : "Big Endian"}
                </span>
              </div>
            )}
            {binaryInfo.metadata.architectureMetadata?.arch === "ARM" && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">ARM Version:</span>
                  <span className="font-mono">
                    {
                      binaryInfo.metadata.architectureMetadata.specific
                        .archVersion
                    }
                  </span>
                </div>
                {binaryInfo.metadata.architectureMetadata.specific
                  .processorType && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processor:</span>
                    <span className="font-mono">
                      {
                        binaryInfo.metadata.architectureMetadata.specific
                          .processorType
                      }
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Vector Table Section */}
      <div className="border-b border-gray-700">
        <button
          onClick={() => toggleSection("vectors")}
          className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-700 transition-colors"
        >
          <span className="font-medium">
            Vector Table ({binaryInfo.vectors.length} entries)
          </span>
          <span>{expandedSections.has("vectors") ? "▼" : "▶"}</span>
        </button>
        {expandedSections.has("vectors") && (
          <div className="px-4 py-2">
            {/* Search bar */}
            <input
              type="text"
              placeholder="Search vectors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 mb-2 bg-gray-700 border border-gray-600 rounded text-sm"
            />

            {/* Vector list */}
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredVectors.length === 0 ? (
                <p className="text-gray-500 text-sm">No vectors found</p>
              ) : (
                filteredVectors.map((vector, idx) => (
                  <div
                    key={idx}
                    className="text-sm hover:bg-gray-700 px-2 py-1 rounded cursor-pointer"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedVector(vector);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-mono w-8">
                          {vector.index}:
                        </span>
                        <span
                          className={`font-medium ${getVectorTypeColor(vector.type)}`}
                        >
                          {vector.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="font-mono text-gray-400">
                          @{formatAddress(vector.address)}
                        </span>
                        <span className="font-mono text-blue-400">
                          →{formatAddress(vector.handlerAddress)}
                        </span>
                        {!vector.enabled && (
                          <span className="text-red-400">disabled</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="border-b border-gray-700">
        <button
          onClick={() => toggleSection("sections")}
          className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-700 transition-colors"
        >
          <span className="font-medium">
            Sections ({binaryInfo.sections.length})
          </span>
          <span>{expandedSections.has("sections") ? "▼" : "▶"}</span>
        </button>
        {expandedSections.has("sections") && (
          <div className="px-4 py-2">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {binaryInfo.sections.map((section, idx) => (
                <div
                  key={idx}
                  className="text-sm hover:bg-gray-700 px-2 py-1 rounded"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium">
                      {section.name}
                    </span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-400">{section.type}</span>
                      <span className="font-mono text-gray-400">
                        {formatAddress(section.address)}
                      </span>
                      <span className="text-gray-500">
                        {formatSize(section.size)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Memory Map */}
      {binaryInfo.memoryMap && binaryInfo.memoryMap.length > 0 && (
        <div className="border-b border-gray-700">
          <button
            onClick={() => toggleSection("memory")}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium">
              Memory Map ({binaryInfo.memoryMap.length} regions)
            </span>
            <span>{expandedSections.has("memory") ? "▼" : "▶"}</span>
          </button>
          {expandedSections.has("memory") && (
            <div className="px-4 py-2">
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {binaryInfo.memoryMap.map((region, idx) => (
                  <div
                    key={idx}
                    className="text-sm hover:bg-gray-700 px-2 py-1 rounded"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{region.name}</span>
                      <div className="flex items-center gap-4 text-xs">
                        <span
                          className={`px-1 rounded ${
                            region.type === "flash"
                              ? "bg-blue-800"
                              : region.type === "ram"
                                ? "bg-green-800"
                                : region.type === "peripheral"
                                  ? "bg-yellow-800"
                                  : "bg-gray-700"
                          }`}
                        >
                          {region.type}
                        </span>
                        <span className="font-mono text-gray-400">
                          {formatAddress(region.start)} -{" "}
                          {formatAddress(region.end)}
                        </span>
                        <span className="text-gray-500">
                          {formatSize(region.size)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Symbols (if available) */}
      {binaryInfo.symbols && binaryInfo.symbols.length > 0 && (
        <div className="border-b border-gray-700">
          <button
            onClick={() => toggleSection("symbols")}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium">
              Symbols ({binaryInfo.symbols.length})
            </span>
            <span>{expandedSections.has("symbols") ? "▼" : "▶"}</span>
          </button>
          {expandedSections.has("symbols") && (
            <div className="px-4 py-2">
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {binaryInfo.symbols.slice(0, 100).map((symbol, idx) => (
                  <div
                    key={idx}
                    className="text-sm hover:bg-gray-700 px-2 py-1 rounded"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono">{symbol.name}</span>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-gray-400">{symbol.type}</span>
                        <span
                          className="font-mono text-blue-400 cursor-pointer hover:underline"
                          onClick={() => onJumpToAddress?.(symbol.address)}
                        >
                          {formatAddress(symbol.address)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warnings */}
      {binaryInfo.warnings && binaryInfo.warnings.length > 0 && (
        <div className="border-b border-gray-700">
          <button
            onClick={() => toggleSection("warnings")}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-yellow-500">
              ⚠️ Warnings ({binaryInfo.warnings.length})
            </span>
            <span>{expandedSections.has("warnings") ? "▼" : "▶"}</span>
          </button>
          {expandedSections.has("warnings") && (
            <div className="px-4 py-2">
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {binaryInfo.warnings.map((warning, idx) => (
                  <div key={idx} className="text-sm text-yellow-400 px-2 py-1">
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Context menu for vectors */}
      {selectedVector && (
        <ContextMenu
          x={0}
          y={0}
          items={[
            {
              label: `Set breakpoint at ${formatAddress(selectedVector.handlerAddress)}`,
              onClick: () => {
                if (selectedVector.handlerAddress) {
                  onSetBreakpoint?.(selectedVector.handlerAddress);
                }
                setSelectedVector(null);
              },
              icon: "🔴",
            },
            {
              label: "Jump to handler",
              onClick: () => {
                if (selectedVector.handlerAddress) {
                  onJumpToAddress?.(selectedVector.handlerAddress);
                }
                setSelectedVector(null);
              },
              icon: "➡️",
            },
            {
              label: "View in memory",
              onClick: () => {
                if (selectedVector.handlerAddress) {
                  onViewMemory?.(selectedVector.handlerAddress);
                }
                setSelectedVector(null);
              },
              icon: "👁️",
            },
            {
              label: "Copy address",
              onClick: () => {
                if (selectedVector.handlerAddress) {
                  navigator.clipboard.writeText(
                    formatAddress(selectedVector.handlerAddress),
                  );
                }
                setSelectedVector(null);
              },
              icon: "📋",
            },
          ]}
          onClose={() => setSelectedVector(null)}
        />
      )}
    </div>
  );
};
