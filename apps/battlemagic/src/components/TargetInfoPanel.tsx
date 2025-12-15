"use client";

import React, { useEffect, useState } from "react";
import { TargetInfo, type TargetInformation } from "../lib/gdb/TargetInfo";
import type { GdbClient } from "../lib/gdb/GdbClient";

interface TargetInfoPanelProps {
  client: GdbClient | null;
  className?: string;
}

export function TargetInfoPanel({
  client,
  className = "",
}: TargetInfoPanelProps) {
  const [targetInfo, setTargetInfo] = useState<TargetInformation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Refresh target information
  const refreshInfo = React.useCallback(
    async (force = false) => {
      if (!client || loading) return;

      setLoading(true);
      setError(null);

      try {
        const targetInfoManager = new TargetInfo(client);
        const info = await targetInfoManager.getTargetInfo(force);
        setTargetInfo(info);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to get target info",
        );
        console.error("Target info error:", err);
      } finally {
        setLoading(false);
      }
    },
    [client, loading],
  );

  // Auto-refresh when client changes or connects
  useEffect(() => {
    if (client && client.isConnected()) {
      refreshInfo(true);
    } else {
      setTargetInfo(null);
    }
  }, [client, refreshInfo]);

  // Periodic refresh if enabled
  useEffect(() => {
    if (!autoRefresh || !client || !client.isConnected()) return;

    const interval = setInterval(() => {
      refreshInfo(false);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [client, autoRefresh, refreshInfo]);

  // Format voltage display
  const formatVoltage = (voltage: number | null): string => {
    if (voltage === null) return "N/A";
    return `${voltage.toFixed(1)}V`;
  };

  // Format memory display
  const formatMemory = (bytes: number): string => {
    return TargetInfo.formatMemorySize(bytes);
  };

  // Format address display
  const formatAddress = (addr: number): string => {
    return TargetInfo.formatAddress(addr);
  };

  // Get connection status color
  const getStatusColor = (state: string): string => {
    switch (state) {
      case "target_attached":
        return "text-green-500";
      case "probe_connected":
        return "text-yellow-500";
      default:
        return "text-red-500";
    }
  };

  // Get connection status text
  const getStatusText = (state: string): string => {
    switch (state) {
      case "target_attached":
        return "Target Attached";
      case "probe_connected":
        return "Probe Connected (No Target)";
      default:
        return "Disconnected";
    }
  };

  if (!client) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
        <h3 className="text-lg font-bold mb-3">Target Information</h3>
        <p className="text-gray-400">No debugger connected</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">Target Information</h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto
          </label>
          <button
            onClick={() => refreshInfo(true)}
            disabled={loading || !client.isConnected()}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700
                       disabled:text-gray-500 rounded text-sm transition-colors"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-900/30 border border-red-700 rounded text-sm text-red-400">
          {error}
        </div>
      )}

      {targetInfo ? (
        <div className="space-y-3">
          {/* Connection Status */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div className="text-gray-400">Status:</div>
            <div
              className={`font-mono ${getStatusColor(targetInfo.connectionState)}`}
            >
              {getStatusText(targetInfo.connectionState)}
            </div>

            <div className="text-gray-400">Interface:</div>
            <div className="font-mono">
              {targetInfo.interface
                ? targetInfo.interface.toUpperCase()
                : "N/A"}
            </div>

            <div className="text-gray-400">Target Voltage:</div>
            <div className="font-mono">
              {formatVoltage(targetInfo.voltage)}
              {targetInfo.voltage && targetInfo.voltage < 1.8 && (
                <span className="text-yellow-500 ml-1">(Low)</span>
              )}
            </div>
          </div>

          {/* Chip Information */}
          {targetInfo.chip && (
            <>
              <div className="border-t border-gray-700 pt-2">
                <h4 className="text-sm font-semibold mb-1 text-gray-300">
                  Target Chip
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div className="text-gray-400">Description:</div>
                  <div className="font-mono text-xs">
                    {targetInfo.chip.description}
                  </div>

                  {targetInfo.chip.id && (
                    <>
                      <div className="text-gray-400">Chip ID:</div>
                      <div className="font-mono text-xs">
                        {targetInfo.chip.id}
                      </div>
                    </>
                  )}

                  {targetInfo.chip.manufacturer && (
                    <>
                      <div className="text-gray-400">Manufacturer:</div>
                      <div className="font-mono text-xs">
                        {targetInfo.chip.manufacturer}
                      </div>
                    </>
                  )}

                  {targetInfo.chip.family && (
                    <>
                      <div className="text-gray-400">Family:</div>
                      <div className="font-mono text-xs">
                        {targetInfo.chip.family}
                      </div>
                    </>
                  )}

                  {targetInfo.chip.core && (
                    <>
                      <div className="text-gray-400">Core:</div>
                      <div className="font-mono text-xs">
                        {targetInfo.chip.core}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Memory Information */}
          {(targetInfo.memory.flash.length > 0 ||
            targetInfo.memory.ram.length > 0) && (
            <div className="border-t border-gray-700 pt-2">
              <h4 className="text-sm font-semibold mb-1 text-gray-300">
                Memory Regions
              </h4>
              <div className="space-y-1">
                {targetInfo.memory.flash.map((region, idx) => (
                  <div key={`flash-${idx}`} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Flash:</span>
                      <span className="font-mono text-xs">
                        {formatAddress(region.start)} (
                        {formatMemory(region.size)})
                      </span>
                    </div>
                  </div>
                ))}
                {targetInfo.memory.ram.map((region, idx) => (
                  <div key={`ram-${idx}`} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">RAM:</span>
                      <span className="font-mono text-xs">
                        {formatAddress(region.start)} (
                        {formatMemory(region.size)})
                      </span>
                    </div>
                  </div>
                ))}
                {targetInfo.memory.other.map((region, idx) => (
                  <div key={`other-${idx}`} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">{region.name}:</span>
                      <span className="font-mono text-xs">
                        {formatAddress(region.start)} (
                        {formatMemory(region.size)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Probe Information */}
          {targetInfo.probeVersion && (
            <div className="border-t border-gray-700 pt-2">
              <h4 className="text-sm font-semibold mb-1 text-gray-300">
                Black Magic Probe
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="text-gray-400">Firmware:</div>
                <div className="font-mono text-xs">
                  {targetInfo.probeVersion.firmware}
                </div>

                {targetInfo.probeVersion.hardware && (
                  <>
                    <div className="text-gray-400">Hardware:</div>
                    <div className="font-mono text-xs">
                      {targetInfo.probeVersion.hardware}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Supported Features */}
          {targetInfo.features.length > 0 && (
            <div className="border-t border-gray-700 pt-2">
              <h4 className="text-sm font-semibold mb-1 text-gray-300">
                Features
              </h4>
              <div className="flex flex-wrap gap-1">
                {targetInfo.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-0.5 bg-gray-700 rounded text-xs font-mono"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-400 text-sm">
          {loading
            ? "Loading target information..."
            : "No target information available"}
        </div>
      )}
    </div>
  );
}
