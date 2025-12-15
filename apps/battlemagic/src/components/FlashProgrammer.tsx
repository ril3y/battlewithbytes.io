"use client";

/**
 * Flash Programmer Component
 *
 * Provides drag & drop interface for programming firmware to target device
 */

import React, { useState, useCallback, useRef } from "react";
import { FileParser, FirmwareData } from "../lib/flash/FileParser";
import type { GdbClient } from "../lib/gdb/GdbClient";

interface FlashProgrammerProps {
  gdbClient: GdbClient | null;
  isConnected: boolean;
  className?: string;
}

interface FlashProgress {
  stage: "idle" | "erasing" | "writing" | "verifying" | "complete" | "error";
  progress: number; // 0-100
  message: string;
  bytesWritten?: number;
  totalBytes?: number;
}

export default function FlashProgrammer({
  gdbClient,
  isConnected,
  className = "",
}: FlashProgrammerProps) {
  const [firmware, setFirmware] = useState<FirmwareData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [flashProgress, setFlashProgress] = useState<FlashProgress>({
    stage: "idle",
    progress: 0,
    message: "Ready to program",
  });
  const [verifyAfterWrite, setVerifyAfterWrite] = useState(true);
  const [eraseAll, setEraseAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setFlashProgress({
        stage: "idle",
        progress: 0,
        message: `Loading ${file.name}...`,
      });

      const firmwareData = await FileParser.parseFile(file);
      setFirmware(firmwareData);

      // Calculate total size
      const totalSize = firmwareData.segments.reduce(
        (sum, seg) => sum + seg.data.length,
        0,
      );

      setFlashProgress({
        stage: "idle",
        progress: 0,
        message: `Loaded ${file.name} (${formatBytes(totalSize)})`,
        totalBytes: totalSize,
      });
    } catch (error) {
      setFlashProgress({
        stage: "error",
        progress: 0,
        message: `Failed to load file: ${error}`,
      });
    }
  }, []);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const file = files[0];
        if (file.name.match(/\.(hex|bin|elf)$/i)) {
          handleFileSelect(file);
        } else {
          setFlashProgress({
            stage: "error",
            progress: 0,
            message: "Please drop a .hex, .bin, or .elf file",
          });
        }
      }
    },
    [handleFileSelect],
  );

  // File input handler
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect],
  );

  // Flash programming
  const handleFlash = useCallback(async () => {
    if (!gdbClient || !firmware) return;

    try {
      setFlashProgress({
        stage: "erasing",
        progress: 0,
        message: "Erasing flash memory...",
      });

      // Send monitor commands for flash operations
      if (eraseAll) {
        await gdbClient.sendMonitorCommand("erase_mass");
      }

      setFlashProgress({
        stage: "writing",
        progress: 0,
        message: "Writing firmware...",
        bytesWritten: 0,
        totalBytes: firmware.metadata?.size,
      });

      // Write each segment
      let totalWritten = 0;
      for (const segment of firmware.segments) {
        // Use GDB's memory write command
        await gdbClient.writeMemory(segment.address, segment.data);

        totalWritten += segment.data.length;
        const progress = (totalWritten / (firmware.metadata?.size || 1)) * 100;

        setFlashProgress({
          stage: "writing",
          progress,
          message: `Writing... ${formatBytes(totalWritten)} / ${formatBytes(firmware.metadata?.size || 0)}`,
          bytesWritten: totalWritten,
          totalBytes: firmware.metadata?.size,
        });
      }

      // Verify if requested
      if (verifyAfterWrite) {
        setFlashProgress({
          stage: "verifying",
          progress: 0,
          message: "Verifying firmware...",
        });

        let verified = 0;
        for (const segment of firmware.segments) {
          const readData = await gdbClient.readMemory(
            segment.address,
            segment.data.length,
          );

          // Compare data
          for (let i = 0; i < segment.data.length; i++) {
            if (readData[i] !== segment.data[i]) {
              throw new Error(
                `Verification failed at address 0x${(segment.address + i).toString(16)}`,
              );
            }
          }

          verified += segment.data.length;
          const progress = (verified / (firmware.metadata?.size || 1)) * 100;

          setFlashProgress({
            stage: "verifying",
            progress,
            message: `Verifying... ${formatBytes(verified)} / ${formatBytes(firmware.metadata?.size || 0)}`,
          });
        }
      }

      setFlashProgress({
        stage: "complete",
        progress: 100,
        message: "Programming complete!",
      });

      // Reset the target after programming
      setTimeout(async () => {
        try {
          await gdbClient.reset();
        } catch (error) {
          console.error("Failed to reset target:", error);
        }
      }, 1000);
    } catch (error) {
      setFlashProgress({
        stage: "error",
        progress: 0,
        message: `Flash programming failed: ${error}`,
      });
    }
  }, [gdbClient, firmware, eraseAll, verifyAfterWrite]);

  // Helper function to format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper function to format address
  const formatAddress = (addr: number): string => {
    return "0x" + addr.toString(16).toUpperCase().padStart(8, "0");
  };

  return (
    <div className={`flex flex-col h-full bg-gray-950 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="text-sm font-bold text-green-400">FLASH PROGRAMMER</h2>
        {firmware && (
          <button
            onClick={() => {
              setFirmware(null);
              setFlashProgress({
                stage: "idle",
                progress: 0,
                message: "Ready to program",
              });
            }}
            className="px-3 py-1 text-xs rounded border bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Drop Zone */}
        {!firmware && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-green-400 bg-green-900/20"
                : "border-gray-700 hover:border-gray-600"
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-gray-400">
              <div className="text-2xl mb-2">📁</div>
              <div className="text-sm font-mono mb-2">
                Drop firmware file here
              </div>
              <div className="text-xs text-gray-500">
                Supports .hex, .bin, and .elf files
              </div>
              <button className="mt-4 px-4 py-2 text-xs rounded border bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors">
                Browse Files
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".hex,.bin,.elf"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}

        {/* Firmware Info */}
        {firmware && (
          <div className="space-y-4">
            {/* File Info */}
            <div className="bg-gray-900 rounded p-3">
              <h3 className="text-xs font-bold text-gray-400 mb-2">
                FILE INFO
              </h3>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="text-gray-300">
                    {firmware.metadata?.filename}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Format:</span>
                  <span className="text-gray-300">
                    {firmware.format.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Size:</span>
                  <span className="text-gray-300">
                    {formatBytes(firmware.metadata?.size || 0)}
                  </span>
                </div>
                {firmware.entryPoint !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Entry:</span>
                    <span className="text-gray-300">
                      {formatAddress(firmware.entryPoint)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Memory Segments */}
            <div className="bg-gray-900 rounded p-3">
              <h3 className="text-xs font-bold text-gray-400 mb-2">
                MEMORY SEGMENTS
              </h3>
              <div className="space-y-1">
                {firmware.segments.map((segment, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-xs font-mono"
                  >
                    <span className="text-gray-500">
                      {formatAddress(segment.address)}
                    </span>
                    <span className="text-gray-300">
                      {formatBytes(segment.data.length)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Flash Options */}
            <div className="bg-gray-900 rounded p-3">
              <h3 className="text-xs font-bold text-gray-400 mb-2">OPTIONS</h3>
              <div className="space-y-2">
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={verifyAfterWrite}
                    onChange={(e) => setVerifyAfterWrite(e.target.checked)}
                    className="mr-2 rounded border-gray-700 bg-gray-800"
                  />
                  <span className="text-gray-300">Verify after write</span>
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={eraseAll}
                    onChange={(e) => setEraseAll(e.target.checked)}
                    className="mr-2 rounded border-gray-700 bg-gray-800"
                  />
                  <span className="text-gray-300">Erase entire flash</span>
                </label>
              </div>
            </div>

            {/* Progress Bar */}
            {flashProgress.stage !== "idle" && (
              <div className="bg-gray-900 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400">
                    {flashProgress.stage.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-gray-300">
                    {flashProgress.progress.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      flashProgress.stage === "error"
                        ? "bg-red-500"
                        : flashProgress.stage === "complete"
                          ? "bg-green-500"
                          : "bg-blue-500"
                    }`}
                    style={{ width: `${flashProgress.progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400">
                  {flashProgress.message}
                </div>
              </div>
            )}

            {/* Flash Button */}
            <button
              onClick={handleFlash}
              disabled={
                !isConnected ||
                (flashProgress.stage !== "idle" &&
                  flashProgress.stage !== "complete" &&
                  flashProgress.stage !== "error")
              }
              className={`w-full py-2 text-xs font-bold rounded border transition-colors ${
                !isConnected
                  ? "bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed"
                  : flashProgress.stage === "complete"
                    ? "bg-green-600/20 border-green-500/50 text-green-300 hover:bg-green-600/30"
                    : flashProgress.stage === "error"
                      ? "bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-600/30"
                      : "bg-blue-600/20 border-blue-500/50 text-blue-300 hover:bg-blue-600/30"
              }`}
            >
              {!isConnected
                ? "Connect to Target"
                : flashProgress.stage === "complete"
                  ? "✓ Programming Complete"
                  : flashProgress.stage === "error"
                    ? "Retry Programming"
                    : flashProgress.stage !== "idle"
                      ? "Programming..."
                      : "Flash Target"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
