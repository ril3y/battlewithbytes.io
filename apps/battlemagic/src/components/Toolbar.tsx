"use client";

/**
 * Toolbar Component
 *
 * Icon-based quick action toolbar for common debugging operations
 * IDA Pro-inspired design with tooltips
 */

import React from "react";
import { ConnectionState } from "../lib/gdb/types";

interface ToolbarProps {
  gdbState: ConnectionState;
  targetAttached: boolean;
  uartConnected?: boolean;
  onConnectGdb?: () => void;
  onDisconnectGdb?: () => void;
  onConnectUart?: () => void;
  onDisconnectUart?: () => void;
  onScanTargets?: () => void;
  onHalt?: () => void;
  onRun?: () => void;
  onStep?: () => void;
  onReset?: () => void;
  onRefreshRegisters?: () => void;
  onRefreshMemory?: () => void;
}

export default function Toolbar({
  gdbState,
  targetAttached,
  uartConnected: _uartConnected = false,
  onConnectGdb: _onConnectGdb,
  onDisconnectGdb: _onDisconnectGdb,
  onConnectUart: _onConnectUart,
  onDisconnectUart: _onDisconnectUart,
  onScanTargets,
  onHalt,
  onRun,
  onStep,
  onReset,
  onRefreshRegisters,
  onRefreshMemory,
}: ToolbarProps) {
  const gdbConnected =
    gdbState === ConnectionState.CONNECTED ||
    gdbState === ConnectionState.ATTACHED;
  const _isConnecting = gdbState === ConnectionState.CONNECTING;

  const ToolbarButton = ({
    icon,
    label,
    onClick,
    disabled = false,
    variant = "default",
  }: {
    icon: string;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    variant?: "default" | "danger" | "success" | "warning" | "primary";
  }) => {
    const variantClasses = {
      default: "hover:bg-gray-700 text-gray-300",
      danger: "hover:bg-red-600/20 text-red-400 border-red-500/30",
      success: "hover:bg-green-600/20 text-green-400 border-green-500/30",
      warning: "hover:bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
      primary: "hover:bg-blue-600/20 text-blue-400 border-blue-500/30",
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`px-3 py-2 flex flex-col items-center justify-center gap-1 border border-transparent transition-colors disabled:opacity-30 disabled:cursor-not-allowed group relative ${variantClasses[variant]}`}
        title={label}
      >
        <span className="text-lg leading-none">{icon}</span>
        <span className="text-[10px] leading-none opacity-70">
          {label.split(" ")[0]}
        </span>

        {/* Tooltip */}
        <span className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-gray-700 z-50">
          {label}
        </span>
      </button>
    );
  };

  const Separator = () => <div className="w-px h-8 bg-gray-700 mx-1" />;

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-2 py-1 flex items-center gap-1 flex-shrink-0">
      {/* Target Scan */}
      {gdbConnected && !targetAttached && (
        <>
          <ToolbarButton
            icon="🔍"
            label="Scan Targets"
            onClick={onScanTargets}
            variant="primary"
          />
          <Separator />
        </>
      )}

      {/* Debug Controls */}
      {targetAttached && (
        <>
          <ToolbarButton
            icon="▶"
            label="Continue (F5)"
            onClick={onRun}
            variant="success"
          />

          <ToolbarButton
            icon="⏸"
            label="Pause (F6)"
            onClick={onHalt}
            variant="warning"
          />

          <ToolbarButton
            icon="⏭"
            label="Step Into (F7)"
            onClick={onStep}
            variant="primary"
          />

          <ToolbarButton
            icon="↻"
            label="Reset"
            onClick={onReset}
            variant="danger"
          />

          <Separator />

          {/* Refresh Controls */}
          <ToolbarButton
            icon="🔄"
            label="Refresh Registers"
            onClick={onRefreshRegisters}
            variant="default"
          />

          <ToolbarButton
            icon="💾"
            label="Refresh Memory"
            onClick={onRefreshMemory}
            variant="default"
          />
        </>
      )}
    </div>
  );
}
