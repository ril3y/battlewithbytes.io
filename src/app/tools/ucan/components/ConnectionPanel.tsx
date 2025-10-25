'use client';

/**
 * Connection Panel Component
 *
 * Serial port connection controls and status display
 */

import React, { useState, useEffect } from 'react';
import { SerialConfig, DEFAULT_SERIAL_CONFIG, DeviceInfo } from '../types';
import { isSerialSupported, getAuthorizedPorts } from '../core/serialBridge';
import { formatBaudRate } from '../utils/formatters';

interface ConnectionPanelProps {
  isConnected: boolean;
  deviceInfo?: DeviceInfo;
  onConnect: (port?: SerialPort, config?: SerialConfig) => Promise<void>;
  onDisconnect: () => Promise<void>;
  config?: SerialConfig;
  onConfigChange?: (config: SerialConfig) => void;
  lastHeartbeat?: Date | null;
}

export default function ConnectionPanel({
  isConnected,
  deviceInfo,
  onConnect,
  onDisconnect,
  config = DEFAULT_SERIAL_CONFIG,
  onConfigChange,
  lastHeartbeat
}: ConnectionPanelProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [authorizedPorts, setAuthorizedPorts] = useState<SerialPort[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    setIsSupported(isSerialSupported());

    // Load authorized ports
    if (isSerialSupported()) {
      getAuthorizedPorts().then(setAuthorizedPorts);
    }
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect(undefined, config);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await onDisconnect();
  };

  const handleQuickConnect = async (port: SerialPort) => {
    setIsConnecting(true);
    try {
      await onConnect(port, config);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-red-600/20 border border-red-500/30 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-red-400">Web Serial API Not Supported</h3>
            <p className="text-sm text-gray-400 mt-1">
              Please use Chrome, Edge, or Opera browser (version 89+) to use this tool.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className={isConnected ? 'text-green-400' : 'text-gray-500'}>
            {isConnected ? '🟢' : '⚫'}
          </span>
          Connection
        </h2>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600 transition-colors"
        >
          ⚙️ Config
        </button>
      </div>

      {/* Connection Status */}
      <div className="mb-4">
        {isConnected ? (
          <div className="p-3 bg-green-600/10 border border-green-500/30 rounded space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-green-400 font-medium">Connected</p>
                {deviceInfo && (
                  <p className="text-sm text-gray-400 mt-1">
                    {deviceInfo.productName || `VID: 0x${deviceInfo.vendorId?.toString(16)}, PID: 0x${deviceInfo.productId?.toString(16)}`}
                  </p>
                )}
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
              >
                Disconnect
              </button>
            </div>

            {/* Heartbeat Indicator */}
            {lastHeartbeat && (
              <div className="pt-2 border-t border-green-500/20">
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <span className="text-red-500 animate-pulse">💓</span>
                  Last heartbeat: {new Date().getTime() - lastHeartbeat.getTime() < 5000
                    ? 'just now'
                    : `${Math.floor((new Date().getTime() - lastHeartbeat.getTime()) / 1000)}s ago`}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Connecting...
                </>
              ) : (
                <>
                  <span>🔌</span>
                  Connect to uCAN Device
                </>
              )}
            </button>

            {/* Quick connect to authorized ports */}
            {authorizedPorts.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Quick Connect:</p>
                <div className="space-y-1">
                  {authorizedPorts.map((port, index) => {
                    const info = port.getInfo();
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuickConnect(port)}
                        className="w-full px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600 transition-colors text-left"
                      >
                        Device {index + 1}: VID 0x{info.usbVendorId?.toString(16)}, PID 0x{info.usbProductId?.toString(16)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configuration Panel */}
      {showConfig && onConfigChange && (
        <div className="mt-4 p-4 bg-gray-800/50 border border-gray-600 rounded space-y-3">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Serial Configuration</h3>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Baud Rate</label>
            <select
              value={config.baudRate}
              onChange={(e) => onConfigChange({ ...config, baudRate: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
            >
              <option value={9600}>9600</option>
              <option value={19200}>19200</option>
              <option value={38400}>38400</option>
              <option value={57600}>57600</option>
              <option value={115200}>115200 (Default)</option>
              <option value={230400}>230400</option>
              <option value={460800}>460800</option>
              <option value={921600}>921600</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Data Bits</label>
              <select
                value={config.dataBits}
                onChange={(e) => onConfigChange({ ...config, dataBits: parseInt(e.target.value) as 7 | 8 })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
              >
                <option value={7}>7</option>
                <option value={8}>8</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Stop Bits</label>
              <select
                value={config.stopBits}
                onChange={(e) => onConfigChange({ ...config, stopBits: parseInt(e.target.value) as 1 | 2 })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Parity</label>
            <select
              value={config.parity}
              onChange={(e) => onConfigChange({ ...config, parity: e.target.value as 'none' | 'even' | 'odd' })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
            >
              <option value="none">None</option>
              <option value="even">Even</option>
              <option value="odd">Odd</option>
            </select>
          </div>
        </div>
      )}

      {/* Connection Info */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Current config: {formatBaudRate(config.baudRate)} baud, {config.dataBits}N{config.stopBits}
        </p>
      </div>
    </div>
  );
}
