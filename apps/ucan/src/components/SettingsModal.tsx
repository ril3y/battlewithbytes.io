"use client";

/**
 * Settings Modal Component
 *
 * Consolidated settings for serial connection configuration
 */

import React, { useState, useEffect } from "react";
import { SerialConfig } from "../types";
import { isSerialSupported, getAuthorizedPorts } from "../core/serialBridge";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SerialConfig;
  onConfigChange: (config: SerialConfig) => void;
  isConnected: boolean;
  onConnect: (port?: SerialPort, config?: SerialConfig) => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export default function SettingsModal({
  isOpen,
  onClose,
  config,
  onConfigChange,
  isConnected,
  onConnect,
  onDisconnect,
}: SettingsModalProps) {
  const [authorizedPorts, setAuthorizedPorts] = useState<SerialPort[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (isOpen && isSerialSupported()) {
      getAuthorizedPorts().then(setAuthorizedPorts);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBaudRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onConfigChange({ ...config, baudRate: parseInt(e.target.value) });
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect(undefined, config);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleQuickConnect = async (port: SerialPort) => {
    setIsConnecting(true);
    try {
      await onConnect(port, config);
      onClose();
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white font-mono">
            <span className="text-green-400">⚙️</span> Settings
          </h2>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors border border-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Serial Configuration */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            Serial Configuration
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Baud Rate
              </label>
              <select
                value={config.baudRate}
                onChange={handleBaudRateChange}
                disabled={isConnected}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value={9600}>9600</option>
                <option value={19200}>19200</option>
                <option value={38400}>38400</option>
                <option value={57600}>57600</option>
                <option value={115200}>115200</option>
                <option value={230400}>230400</option>
                <option value={460800}>460800</option>
                <option value={921600}>921600</option>
              </select>
            </div>
          </div>
          {isConnected && (
            <p className="text-xs text-yellow-500 mt-2">
              ⚠️ Disconnect to change serial settings
            </p>
          )}
        </div>

        {/* Port Selection */}
        {!isConnected && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Select Port
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Connecting...
                  </>
                ) : (
                  <>
                    <span>🔌</span>
                    Connect to New Device
                  </>
                )}
              </button>

              {/* Quick connect to authorized ports */}
              {authorizedPorts.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">
                    Previously Connected:
                  </p>
                  <div className="space-y-2">
                    {authorizedPorts.map((port, index) => {
                      const info = port.getInfo();
                      return (
                        <button
                          key={index}
                          onClick={() => handleQuickConnect(port)}
                          disabled={isConnecting}
                          className="w-full px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-300 rounded border border-gray-600 transition-colors text-left font-mono"
                        >
                          Device {index + 1}: VID 0x
                          {info.usbVendorId?.toString(16)}, PID 0x
                          {info.usbProductId?.toString(16)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connection Actions */}
        <div className="flex gap-3">
          {isConnected && (
            <button
              onClick={async () => {
                await onDisconnect();
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              Disconnect
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
