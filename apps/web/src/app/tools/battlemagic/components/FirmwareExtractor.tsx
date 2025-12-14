/**
 * Firmware Extractor Component
 *
 * Advanced firmware extraction tool for Black Magic Probe debugger.
 * Supports full flash dumps, region-specific extraction, multiple export formats,
 * and automatic chip detection with memory layout discovery.
 *
 * Architecture:
 * - FirmwareExtractor: Main component handling UI and orchestration
 * - ExtractionEngine: Core extraction logic (testable, hardware-independent)
 * - MemoryLayoutDetector: Automatic chip and memory detection
 * - FormatExporter: Handles different export formats (bin, hex, elf metadata)
 */

"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { GdbClient } from "../lib/gdb/GdbClient";
import { TargetInfo, MemoryRegion, ChipInfo } from "../lib/gdb/TargetInfo";
import { FileParser } from "../lib/flash/FileParser";

/**
 * Extraction configuration
 */
interface ExtractionConfig {
  startAddress: number;
  endAddress: number;
  chunkSize: number;
  verifyAfterRead: boolean;
  exportFormat: "bin" | "hex" | "srec" | "all";
  autoDetectSize: boolean;
}

/**
 * Extraction progress state
 */
interface ExtractionProgress {
  isExtracting: boolean;
  bytesRead: number;
  totalBytes: number;
  currentAddress: number;
  percentComplete: number;
  estimatedTimeRemaining: number;
  errors: string[];
}

/**
 * Memory region preset for common MCUs
 */
interface MemoryPreset {
  name: string;
  family: string;
  flash: { start: number; size: number };
  ram?: { start: number; size: number };
  eeprom?: { start: number; size: number };
}

/**
 * Common MCU memory presets
 */
const MEMORY_PRESETS: MemoryPreset[] = [
  {
    name: "STM32F103C8T6 (BluePill)",
    family: "STM32F1",
    flash: { start: 0x08000000, size: 0x10000 }, // 64KB
    ram: { start: 0x20000000, size: 0x5000 }, // 20KB
  },
  {
    name: "STM32F103RCT6",
    family: "STM32F1",
    flash: { start: 0x08000000, size: 0x40000 }, // 256KB
    ram: { start: 0x20000000, size: 0xc000 }, // 48KB
  },
  {
    name: "STM32F407VG (Discovery)",
    family: "STM32F4",
    flash: { start: 0x08000000, size: 0x100000 }, // 1MB
    ram: { start: 0x20000000, size: 0x20000 }, // 128KB
  },
  {
    name: "STM32F429ZI",
    family: "STM32F4",
    flash: { start: 0x08000000, size: 0x200000 }, // 2MB
    ram: { start: 0x20000000, size: 0x30000 }, // 192KB
  },
  {
    name: "STM32F746NG (Discovery)",
    family: "STM32F7",
    flash: { start: 0x08000000, size: 0x100000 }, // 1MB
    ram: { start: 0x20000000, size: 0x50000 }, // 320KB
  },
  {
    name: "STM32H743ZI (Nucleo)",
    family: "STM32H7",
    flash: { start: 0x08000000, size: 0x200000 }, // 2MB
    ram: { start: 0x20000000, size: 0x20000 }, // 128KB DTCM
  },
  {
    name: "STM32L476RG (Nucleo)",
    family: "STM32L4",
    flash: { start: 0x08000000, size: 0x100000 }, // 1MB
    ram: { start: 0x20000000, size: 0x18000 }, // 96KB
  },
  {
    name: "STM32G474RE (Nucleo)",
    family: "STM32G4",
    flash: { start: 0x08000000, size: 0x80000 }, // 512KB
    ram: { start: 0x20000000, size: 0x20000 }, // 128KB
  },
  {
    name: "nRF52840",
    family: "nRF52",
    flash: { start: 0x00000000, size: 0x100000 }, // 1MB
    ram: { start: 0x20000000, size: 0x40000 }, // 256KB
  },
  {
    name: "nRF52832",
    family: "nRF52",
    flash: { start: 0x00000000, size: 0x80000 }, // 512KB
    ram: { start: 0x20000000, size: 0x10000 }, // 64KB
  },
  {
    name: "RP2040",
    family: "RP2040",
    flash: { start: 0x10000000, size: 0x200000 }, // 2MB external
    ram: { start: 0x20000000, size: 0x42000 }, // 264KB
  },
  {
    name: "SAMD21G18 (Arduino Zero)",
    family: "SAMD",
    flash: { start: 0x00000000, size: 0x40000 }, // 256KB
    ram: { start: 0x20000000, size: 0x8000 }, // 32KB
  },
  {
    name: "ESP32-C3",
    family: "ESP32",
    flash: { start: 0x00000000, size: 0x400000 }, // 4MB external
    ram: { start: 0x3fc80000, size: 0x60000 }, // 384KB
  },
];

/**
 * Format exporter utility class
 */
class FormatExporter {
  /**
   * Export data as raw binary
   */
  static exportBinary(data: Uint8Array, filename: string): void {
    const blob = new Blob([data as BlobPart], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export data as Intel HEX format
   */
  static exportIntelHex(
    data: Uint8Array,
    baseAddress: number,
    filename: string,
  ): void {
    const hexString = FileParser.toIntelHex(data, baseAddress);
    const blob = new Blob([hexString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export data as Motorola S-record format
   */
  static exportSRecord(
    data: Uint8Array,
    baseAddress: number,
    filename: string,
  ): void {
    const srecString = FileParser.toSRecord(data, baseAddress);
    const blob = new Blob([srecString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Generate metadata file with extraction information
   */
  static exportMetadata(
    config: ExtractionConfig,
    chipInfo: ChipInfo | null,
    extractedData: Uint8Array,
    filename: string,
  ): void {
    const metadata = {
      timestamp: new Date().toISOString(),
      chip: chipInfo,
      extraction: {
        startAddress: `0x${config.startAddress.toString(16).toUpperCase()}`,
        endAddress: `0x${config.endAddress.toString(16).toUpperCase()}`,
        size: extractedData.length,
        checksum: FileParser.calculateChecksum(extractedData),
        format: config.exportFormat,
      },
      tool: "BattleMagic Firmware Extractor",
      version: "1.0.0",
    };

    const blob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

/**
 * Main Firmware Extractor Component
 */
interface FirmwareExtractorProps {
  gdbClient: GdbClient | null;
  isConnected: boolean;
}

export default function FirmwareExtractor({
  gdbClient,
  isConnected,
}: FirmwareExtractorProps) {
  // State management
  const [config, setConfig] = useState<ExtractionConfig>({
    startAddress: 0x08000000,
    endAddress: 0x08010000,
    chunkSize: 1024,
    verifyAfterRead: true,
    exportFormat: "all",
    autoDetectSize: true,
  });

  const [progress, setProgress] = useState<ExtractionProgress>({
    isExtracting: false,
    bytesRead: 0,
    totalBytes: 0,
    currentAddress: 0,
    percentComplete: 0,
    estimatedTimeRemaining: 0,
    errors: [],
  });

  const [detectedChip, setDetectedChip] = useState<ChipInfo | null>(null);
  const [memoryRegions, setMemoryRegions] = useState<MemoryRegion[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [extractedData, setExtractedData] = useState<Uint8Array | null>(null);
  const [customStartAddress, setCustomStartAddress] = useState("0x08000000");
  const [customEndAddress, setCustomEndAddress] = useState("0x08010000");

  // Refs for extraction control
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  /**
   * Detect target chip and memory layout
   */
  const detectChipAndMemory = useCallback(async () => {
    if (!gdbClient || !isConnected) return;

    try {
      const targetInfo = new TargetInfo(gdbClient);
      const info = await targetInfo.getTargetInfo(true);

      if (info.chip) {
        setDetectedChip(info.chip);

        // Set memory regions
        const allRegions = [
          ...info.memory.flash,
          ...info.memory.ram,
          ...info.memory.other,
        ];
        setMemoryRegions(allRegions);

        // Auto-configure flash region if detected
        if (info.memory.flash.length > 0) {
          const flashRegion = info.memory.flash[0];
          setConfig((prev) => ({
            ...prev,
            startAddress: flashRegion.start,
            endAddress: flashRegion.start + flashRegion.size,
          }));
          setCustomStartAddress(
            `0x${flashRegion.start.toString(16).toUpperCase()}`,
          );
          setCustomEndAddress(
            `0x${(flashRegion.start + flashRegion.size).toString(16).toUpperCase()}`,
          );
        }
      }
    } catch (error) {
      console.error("Failed to detect chip:", error);
      setProgress((prev) => ({
        ...prev,
        errors: [...prev.errors, `Chip detection failed: ${error}`],
      }));
    }
  }, [gdbClient, isConnected]);

  /**
   * Apply memory preset
   */
  const applyPreset = useCallback((presetName: string) => {
    const preset = MEMORY_PRESETS.find((p) => p.name === presetName);
    if (!preset) return;

    setSelectedPreset(presetName);
    setConfig((prev) => ({
      ...prev,
      startAddress: preset.flash.start,
      endAddress: preset.flash.start + preset.flash.size,
    }));
    setCustomStartAddress(`0x${preset.flash.start.toString(16).toUpperCase()}`);
    setCustomEndAddress(
      `0x${(preset.flash.start + preset.flash.size).toString(16).toUpperCase()}`,
    );
  }, []);

  /**
   * Export extracted firmware
   */
  const exportFirmware = useCallback(
    (data?: Uint8Array) => {
      const exportData = data || extractedData;
      if (!exportData) return;

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const chipName =
        detectedChip?.description.replace(/[^a-zA-Z0-9]/g, "_") || "unknown";
      const baseFilename = `firmware_${chipName}_${timestamp}`;

      // Export based on format selection
      if (config.exportFormat === "bin" || config.exportFormat === "all") {
        FormatExporter.exportBinary(exportData, `${baseFilename}.bin`);
      }

      if (config.exportFormat === "hex" || config.exportFormat === "all") {
        FormatExporter.exportIntelHex(
          exportData,
          config.startAddress,
          `${baseFilename}.hex`,
        );
      }

      if (config.exportFormat === "srec" || config.exportFormat === "all") {
        FormatExporter.exportSRecord(
          exportData,
          config.startAddress,
          `${baseFilename}.srec`,
        );
      }

      // Always export metadata
      FormatExporter.exportMetadata(
        config,
        detectedChip,
        exportData,
        `${baseFilename}_info.json`,
      );
    },
    [extractedData, config, detectedChip],
  );

  /**
   * Start firmware extraction
   */
  const startExtraction = useCallback(async () => {
    if (!gdbClient || !isConnected || progress.isExtracting) return;

    // Reset state
    setExtractedData(null);
    setProgress({
      isExtracting: true,
      bytesRead: 0,
      totalBytes: config.endAddress - config.startAddress,
      currentAddress: config.startAddress,
      percentComplete: 0,
      estimatedTimeRemaining: 0,
      errors: [],
    });

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    startTimeRef.current = Date.now();

    try {
      const totalBytes = config.endAddress - config.startAddress;
      const data = new Uint8Array(totalBytes);
      let bytesRead = 0;

      // Extract in chunks
      while (bytesRead < totalBytes) {
        // Check for abort
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Extraction aborted by user");
        }

        const currentAddress = config.startAddress + bytesRead;
        const remainingBytes = totalBytes - bytesRead;
        const chunkSize = Math.min(config.chunkSize, remainingBytes);

        // Read memory chunk
        try {
          const chunk = await gdbClient.readMemory(currentAddress, chunkSize);
          data.set(chunk, bytesRead);
          bytesRead += chunk.length;

          // Verify if enabled
          if (config.verifyAfterRead) {
            const verifyChunk = await gdbClient.readMemory(
              currentAddress,
              chunkSize,
            );
            if (!arraysEqual(chunk, verifyChunk)) {
              throw new Error(
                `Verification failed at 0x${currentAddress.toString(16)}`,
              );
            }
          }

          // Update progress
          const percentComplete = (bytesRead / totalBytes) * 100;
          const elapsedTime = Date.now() - startTimeRef.current;
          const bytesPerMs = bytesRead / elapsedTime;
          const remainingMs = remainingBytes / bytesPerMs;

          setProgress((prev) => ({
            ...prev,
            bytesRead,
            currentAddress,
            percentComplete,
            estimatedTimeRemaining: Math.round(remainingMs / 1000),
          }));
        } catch (error) {
          console.error(
            `Failed to read at 0x${currentAddress.toString(16)}:`,
            error,
          );
          setProgress((prev) => ({
            ...prev,
            errors: [
              ...prev.errors,
              `Read error at 0x${currentAddress.toString(16)}: ${error}`,
            ],
          }));

          // Try to continue with zeros for this chunk
          data.fill(0xff, bytesRead, bytesRead + chunkSize);
          bytesRead += chunkSize;
        }

        // Small delay to prevent overwhelming the target
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Extraction complete
      setExtractedData(data);
      setProgress((prev) => ({
        ...prev,
        isExtracting: false,
        percentComplete: 100,
      }));

      // Auto-export if data was successfully extracted
      if (data.length > 0) {
        exportFirmware(data);
      }
    } catch (error) {
      console.error("Extraction failed:", error);
      setProgress((prev) => ({
        ...prev,
        isExtracting: false,
        errors: [...prev.errors, `Extraction failed: ${error}`],
      }));
    } finally {
      abortControllerRef.current = null;
    }
  }, [gdbClient, isConnected, config, progress.isExtracting, exportFirmware]);

  /**
   * Stop extraction
   */
  const stopExtraction = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Helper: Compare two arrays
   */
  const arraysEqual = (a: Uint8Array, b: Uint8Array): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  /**
   * Parse address input
   */
  const parseAddress = (input: string): number => {
    const cleaned = input.trim().replace(/^0x/i, "");
    return parseInt(cleaned, 16);
  };

  /**
   * Auto-detect on connection
   */
  useEffect(() => {
    if (isConnected && config.autoDetectSize) {
      detectChipAndMemory();
    }
  }, [isConnected, config.autoDetectSize, detectChipAndMemory]);

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-green-400 mb-2">
          Firmware Extractor
        </h2>
        <p className="text-sm text-gray-400">
          Extract firmware from target MCU with automatic chip detection and
          multiple export formats
        </p>
      </div>

      {/* Connection Status */}
      <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm">Connection Status:</span>
          <span
            className={`text-sm font-mono ${isConnected ? "text-green-400" : "text-red-400"}`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        {detectedChip && (
          <div className="mt-2">
            <span className="text-sm text-gray-400">Detected Chip: </span>
            <span className="text-sm font-mono text-green-400">
              {detectedChip.description}
            </span>
            {detectedChip.family && (
              <span className="text-sm text-gray-500 ml-2">
                ({detectedChip.family})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Memory Configuration */}
      <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
        <h3 className="text-sm font-bold text-green-400 mb-2">
          Memory Configuration
        </h3>

        {/* Preset Selection */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">
            Chip Preset:
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => applyPreset(e.target.value)}
            className="w-full px-2 py-1 bg-gray-800 text-white text-sm rounded border border-gray-600 focus:border-green-400 focus:outline-none"
            disabled={!isConnected || progress.isExtracting}
          >
            <option value="">Custom</option>
            {MEMORY_PRESETS.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Address Range */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Start Address:
            </label>
            <input
              type="text"
              value={customStartAddress}
              onChange={(e) => {
                setCustomStartAddress(e.target.value);
                try {
                  const addr = parseAddress(e.target.value);
                  setConfig((prev) => ({ ...prev, startAddress: addr }));
                } catch {}
              }}
              className="w-full px-2 py-1 bg-gray-800 text-white text-sm font-mono rounded border border-gray-600 focus:border-green-400 focus:outline-none"
              placeholder="0x08000000"
              disabled={!isConnected || progress.isExtracting}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              End Address:
            </label>
            <input
              type="text"
              value={customEndAddress}
              onChange={(e) => {
                setCustomEndAddress(e.target.value);
                try {
                  const addr = parseAddress(e.target.value);
                  setConfig((prev) => ({ ...prev, endAddress: addr }));
                } catch {}
              }}
              className="w-full px-2 py-1 bg-gray-800 text-white text-sm font-mono rounded border border-gray-600 focus:border-green-400 focus:outline-none"
              placeholder="0x08010000"
              disabled={!isConnected || progress.isExtracting}
            />
          </div>
        </div>

        {/* Size Display */}
        <div className="text-xs text-gray-400">
          Size: {((config.endAddress - config.startAddress) / 1024).toFixed(1)}{" "}
          KB ({(config.endAddress - config.startAddress).toLocaleString()}{" "}
          bytes)
        </div>
      </div>

      {/* Extraction Options */}
      <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
        <h3 className="text-sm font-bold text-green-400 mb-2">
          Extraction Options
        </h3>

        <div className="space-y-2">
          {/* Chunk Size */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Chunk Size:</label>
            <select
              value={config.chunkSize}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  chunkSize: parseInt(e.target.value),
                }))
              }
              className="px-2 py-1 bg-gray-800 text-white text-sm rounded border border-gray-600 focus:border-green-400 focus:outline-none"
              disabled={!isConnected || progress.isExtracting}
            >
              <option value="256">256 bytes</option>
              <option value="512">512 bytes</option>
              <option value="1024">1024 bytes</option>
              <option value="2048">2048 bytes</option>
              <option value="4096">4096 bytes</option>
            </select>
          </div>

          {/* Export Format */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Export Format:</label>
            <select
              value={config.exportFormat}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  exportFormat: e.target.value as
                    | "bin"
                    | "hex"
                    | "srec"
                    | "all",
                }))
              }
              className="px-2 py-1 bg-gray-800 text-white text-sm rounded border border-gray-600 focus:border-green-400 focus:outline-none"
              disabled={!isConnected || progress.isExtracting}
            >
              <option value="bin">Binary (.bin)</option>
              <option value="hex">Intel HEX (.hex)</option>
              <option value="srec">S-Record (.srec)</option>
              <option value="all">All formats</option>
            </select>
          </div>

          {/* Verification */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="verify"
              checked={config.verifyAfterRead}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  verifyAfterRead: e.target.checked,
                }))
              }
              className="mr-2"
              disabled={!isConnected || progress.isExtracting}
            />
            <label htmlFor="verify" className="text-xs text-gray-400">
              Verify after read (slower but safer)
            </label>
          </div>

          {/* Auto-detect */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autodetect"
              checked={config.autoDetectSize}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  autoDetectSize: e.target.checked,
                }))
              }
              className="mr-2"
              disabled={!isConnected || progress.isExtracting}
            />
            <label htmlFor="autodetect" className="text-xs text-gray-400">
              Auto-detect chip and memory size
            </label>
          </div>
        </div>
      </div>

      {/* Progress Display */}
      {progress.isExtracting && (
        <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
          <h3 className="text-sm font-bold text-green-400 mb-2">
            Extraction Progress
          </h3>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="w-full bg-gray-800 rounded-full h-4 relative overflow-hidden">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentComplete}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-mono">
                {progress.percentComplete.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400">Current Address: </span>
              <span className="font-mono text-green-400">
                0x
                {progress.currentAddress
                  .toString(16)
                  .toUpperCase()
                  .padStart(8, "0")}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Bytes Read: </span>
              <span className="font-mono text-green-400">
                {progress.bytesRead.toLocaleString()} /{" "}
                {progress.totalBytes.toLocaleString()}
              </span>
            </div>
            {progress.estimatedTimeRemaining > 0 && (
              <div className="col-span-2">
                <span className="text-gray-400">Time Remaining: </span>
                <span className="font-mono text-green-400">
                  ~{progress.estimatedTimeRemaining}s
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Errors */}
      {progress.errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-900/20 rounded border border-red-700">
          <h3 className="text-sm font-bold text-red-400 mb-2">Errors</h3>
          <div className="text-xs text-red-300 space-y-1 max-h-32 overflow-y-auto">
            {progress.errors.map((error, index) => (
              <div key={index} className="font-mono">
                {error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {extractedData && !progress.isExtracting && (
        <div className="mb-4 p-3 bg-green-900/20 rounded border border-green-700">
          <h3 className="text-sm font-bold text-green-400 mb-2">
            Extraction Complete
          </h3>
          <div className="text-xs text-green-300">
            Successfully extracted {extractedData.length.toLocaleString()} bytes
            ({(extractedData.length / 1024).toFixed(1)} KB)
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Checksum: 0x
            {FileParser.calculateChecksum(extractedData)
              .toString(16)
              .toUpperCase()}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-auto">
        {!progress.isExtracting ? (
          <>
            <button
              onClick={startExtraction}
              disabled={!isConnected}
              className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors ${
                isConnected
                  ? "bg-green-600 hover:bg-green-500 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Start Extraction
            </button>
            {extractedData && (
              <button
                onClick={() => exportFirmware()}
                className="px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
              >
                Re-export
              </button>
            )}
          </>
        ) : (
          <button
            onClick={stopExtraction}
            className="flex-1 px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
          >
            Stop Extraction
          </button>
        )}
      </div>

      {/* Detected Memory Regions */}
      {memoryRegions.length > 0 && (
        <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-700">
          <h3 className="text-sm font-bold text-green-400 mb-2">
            Detected Memory Regions
          </h3>
          <div className="space-y-1 text-xs">
            {memoryRegions.map((region, index) => (
              <div key={index} className="flex justify-between font-mono">
                <span className="text-gray-400">{region.name}:</span>
                <span className="text-green-400">
                  0x{region.start.toString(16).toUpperCase().padStart(8, "0")} -
                  0x
                  {(region.start + region.size)
                    .toString(16)
                    .toUpperCase()
                    .padStart(8, "0")}
                  <span className="text-gray-500 ml-2">
                    ({(region.size / 1024).toFixed(0)}KB)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
