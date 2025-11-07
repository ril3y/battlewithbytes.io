'use client';

/**
 * Connection Bar Component
 *
 * Provides connection controls for both GDB and UART serial ports
 * Plus target control buttons for debugging operations
 */

import React from 'react';
import { ConnectionState, BmpVersion } from '../lib/gdb/types';
import { versionManager } from '../lib/version/VersionManager';

interface ConnectionBarProps {
  gdbState: ConnectionState;
  uartConnected: boolean;
  targetAttached: boolean;
  baudRate: number;
  bmpVersion?: BmpVersion | null;
  onBaudRateChange: (rate: number) => void;
  onConnectGdb: (event?: React.MouseEvent) => void;
  onDisconnectGdb: () => void;
  onConnectUart: () => void;
  onDisconnectUart: () => void;
  onScanTargets: () => void;
  onHalt: () => void;
  onRun: () => void;
  onReset: () => void;
  onStep: () => void;
  hasStoredGdbPort: boolean;
  hasStoredUartPort: boolean;
  onClearSavedPorts?: () => void;
  onCheckVersion?: () => void;
}

// Common baudrates for serial communication
// Note: Black Magic Probe over USB CDC ignores baudrate (runs at USB speed)
// These settings only matter for hardware UART connections
const BAUD_RATES = [
  115200,   // Standard - always works
  230400,   // 2x - widely supported
  460800,   // 4x - good performance
  921600,   // 8x - may not work on all hardware
  1000000,  // 1M - requires good signal quality
  2000000,  // 2M - rarely supported
];

export default function ConnectionBar({
  gdbState,
  uartConnected,
  targetAttached,
  baudRate,
  bmpVersion,
  onBaudRateChange,
  onConnectGdb,
  onDisconnectGdb,
  onConnectUart,
  onDisconnectUart,
  onScanTargets,
  onHalt,
  onRun,
  onReset,
  onStep,
  hasStoredGdbPort,
  hasStoredUartPort,
  onClearSavedPorts,
  onCheckVersion,
}: ConnectionBarProps) {
  const gdbConnected = gdbState === ConnectionState.CONNECTED || gdbState === ConnectionState.ATTACHED;
  const isConnecting = gdbState === ConnectionState.CONNECTING;

  // Update version manager when version changes
  React.useEffect(() => {
    if (bmpVersion) {
      versionManager.setVersion(bmpVersion);
    }
  }, [bmpVersion]);

  const getVersionBadge = () => {
    if (!bmpVersion) return null;

    const color = versionManager.getVersionBadgeColor();
    const display = versionManager.getDisplayVersion();

    const colorClasses = {
      green: 'bg-green-600/20 border-green-500/50 text-green-300',
      yellow: 'bg-yellow-600/20 border-yellow-500/50 text-yellow-300',
      red: 'bg-red-600/20 border-red-500/50 text-red-300'
    };

    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-gray-400">BMP:</span>
        <span className={`px-2 py-0.5 text-xs rounded border ${colorClasses[color]}`}>
          {display}
        </span>
        {color !== 'green' && onCheckVersion && (
          <button
            onClick={onCheckVersion}
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            Check
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-3 flex items-center justify-between flex-shrink-0">
      {/* Connection Controls */}
      <div className="flex items-center gap-4">
        {/* GDB Connection */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">GDB:</span>
          <div className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                gdbState === ConnectionState.CONNECTED
                  ? 'bg-green-400'
                  : gdbState === ConnectionState.ATTACHED
                  ? 'bg-blue-400'
                  : gdbState === ConnectionState.CONNECTING
                  ? 'bg-yellow-400 animate-pulse'
                  : gdbState === ConnectionState.ERROR
                  ? 'bg-red-400'
                  : 'bg-gray-600'
              }`}
              title={gdbState}
            />
            <button
              onClick={gdbConnected ? onDisconnectGdb : onConnectGdb}
              disabled={isConnecting}
              className={`px-3 py-1 text-xs rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                gdbConnected
                  ? 'bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-600/30'
                  : hasStoredGdbPort
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 hover:bg-blue-600/30'
                  : 'bg-green-600/20 border-green-500/50 text-green-300 hover:bg-green-600/30'
              }`}
              title={hasStoredGdbPort ? 'Quick connect to last used port (hold Shift to select new port)' : 'Select GDB port'}
            >
              {isConnecting ? 'Connecting...' : gdbConnected ? 'Disconnect' : hasStoredGdbPort ? 'Quick Connect' : 'Connect'}
            </button>
          </div>
        </div>

        <span className="text-gray-600">|</span>

        {/* UART Connection */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">UART:</span>
          <div className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                uartConnected ? 'bg-green-400' : 'bg-gray-600'
              }`}
            />
            <button
              onClick={uartConnected ? onDisconnectUart : onConnectUart}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                uartConnected
                  ? 'bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-600/30'
                  : hasStoredUartPort
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 hover:bg-blue-600/30'
                  : 'bg-green-600/20 border-green-500/50 text-green-300 hover:bg-green-600/30'
              }`}
              title={hasStoredUartPort ? 'Quick connect to last used port' : 'Select UART port'}
            >
              {uartConnected ? 'Disconnect' : hasStoredUartPort ? 'Quick Connect' : 'Connect'}
            </button>
          </div>
        </div>

        <span className="text-gray-600">|</span>

        {/* Baudrate Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">Baud:</span>
          <select
            value={baudRate}
            onChange={(e) => onBaudRateChange(Number(e.target.value))}
            className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-green-500"
          >
            {BAUD_RATES.map(rate => (
              <option key={rate} value={rate}>
                {rate.toLocaleString()} {rate === 230400 ? '(USB CDC)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Saved Ports Button */}
        {(hasStoredGdbPort || hasStoredUartPort) && onClearSavedPorts && (
          <>
            <span className="text-gray-600">|</span>
            <button
              onClick={onClearSavedPorts}
              className="px-2 py-1 text-xs rounded border bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 transition-colors"
              title="Clear saved port connections"
            >
              Clear Saved
            </button>
          </>
        )}

        {/* Version Badge */}
        {gdbConnected && (
          <>
            <span className="text-gray-600">|</span>
            {getVersionBadge()}
          </>
        )}

        {/* Scan Targets Button */}
        {gdbConnected && !targetAttached && (
          <>
            <span className="text-gray-600">|</span>
            <button
              onClick={onScanTargets}
              className="px-3 py-1 text-xs rounded border bg-blue-600/20 border-blue-500/50 text-blue-300 hover:bg-blue-600/30 transition-colors"
            >
              Scan Targets
            </button>
          </>
        )}
      </div>

      {/* Target Control Buttons */}
      {targetAttached && (
        <div className="flex items-center gap-2">
          <button
            onClick={onHalt}
            className="px-3 py-1 text-xs rounded border bg-yellow-600/20 border-yellow-500/50 text-yellow-300 hover:bg-yellow-600/30 transition-colors font-mono"
            title="Halt target execution (Ctrl+C)"
          >
            ⏸ Halt
          </button>
          <button
            onClick={onRun}
            className="px-3 py-1 text-xs rounded border bg-green-600/20 border-green-500/50 text-green-300 hover:bg-green-600/30 transition-colors font-mono"
            title="Resume target execution"
          >
            ▶ Run
          </button>
          <button
            onClick={onStep}
            className="px-3 py-1 text-xs rounded border bg-blue-600/20 border-blue-500/50 text-blue-300 hover:bg-blue-600/30 transition-colors font-mono"
            title="Step one instruction"
          >
            ⏭ Step
          </button>
          <button
            onClick={onReset}
            className="px-3 py-1 text-xs rounded border bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-600/30 transition-colors font-mono"
            title="Reset target device"
          >
            ↻ Reset
          </button>
        </div>
      )}
    </div>
  );
}
