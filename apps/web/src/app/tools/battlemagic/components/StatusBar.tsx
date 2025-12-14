"use client";

/**
 * StatusBar Component
 *
 * Bottom status bar showing connection state, target info, and execution state
 * IDA Pro-inspired design
 */

import React from "react";
import { ConnectionState, BmpVersion, Target } from "../lib/gdb/types";

interface StatusBarProps {
  gdbState: ConnectionState;
  uartConnected: boolean;
  bmpVersion?: BmpVersion | null;
  currentTarget?: Target | null;
  programCounter?: number;
  executionState?: "running" | "stopped" | "stepping";
  lastUpdate?: Date;
}

export default function StatusBar({
  gdbState,
  uartConnected,
  bmpVersion,
  currentTarget,
  programCounter,
  executionState = "stopped",
  lastUpdate,
}: StatusBarProps) {
  const gdbConnected =
    gdbState === ConnectionState.CONNECTED ||
    gdbState === ConnectionState.ATTACHED;
  const targetAttached = gdbState === ConnectionState.ATTACHED;

  const StatusItem = ({
    label,
    value,
    color = "text-gray-400",
  }: {
    label: string;
    value: string | React.ReactNode;
    color?: string;
  }) => (
    <div className="flex items-center gap-2 px-3 border-r border-gray-700 last:border-r-0">
      <span className="text-xs text-gray-500">{label}:</span>
      <span className={`text-xs font-mono ${color}`}>{value}</span>
    </div>
  );

  const ConnectionIndicator = ({
    connected,
    label,
  }: {
    connected: boolean;
    label: string;
  }) => (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full ${
          connected ? "bg-green-400" : "bg-gray-600"
        }`}
      />
      <span className="text-xs">{label}</span>
    </div>
  );

  return (
    <div className="bg-gray-900 border-t border-gray-700 px-2 py-1 flex items-center justify-between text-xs font-mono flex-shrink-0">
      {/* Left Side - Connection Status */}
      <div className="flex items-center gap-3">
        <StatusItem
          label="GDB"
          value={
            <ConnectionIndicator connected={gdbConnected} label={gdbState} />
          }
        />

        <StatusItem
          label="UART"
          value={
            <ConnectionIndicator
              connected={uartConnected}
              label={uartConnected ? "Connected" : "Disconnected"}
            />
          }
        />

        {bmpVersion && (
          <StatusItem
            label="BMP"
            value={bmpVersion.firmware}
            color="text-blue-400"
          />
        )}

        {currentTarget && (
          <StatusItem
            label="Target"
            value={currentTarget.description}
            color="text-purple-400"
          />
        )}
      </div>

      {/* Right Side - Execution State */}
      <div className="flex items-center gap-3">
        {targetAttached && (
          <>
            {programCounter !== undefined && (
              <StatusItem
                label="PC"
                value={`0x${programCounter.toString(16).toUpperCase().padStart(8, "0")}`}
                color="text-green-400"
              />
            )}

            <StatusItem
              label="State"
              value={
                <span
                  className={`
                  ${executionState === "running" ? "text-green-400" : ""}
                  ${executionState === "stopped" ? "text-yellow-400" : ""}
                  ${executionState === "stepping" ? "text-blue-400" : ""}
                `}
                >
                  {executionState === "running" && "▶ Running"}
                  {executionState === "stopped" && "⏸ Stopped"}
                  {executionState === "stepping" && "⏭ Stepping"}
                </span>
              }
            />
          </>
        )}

        {lastUpdate && (
          <StatusItem
            label="Updated"
            value={lastUpdate.toLocaleTimeString()}
            color="text-gray-500"
          />
        )}

        {/* Ready indicator */}
        <div className="px-3">
          <span
            className={`text-xs ${targetAttached ? "text-green-400" : "text-gray-500"}`}
          >
            {targetAttached ? "● Ready" : "○ Idle"}
          </span>
        </div>
      </div>
    </div>
  );
}
