"use client";

/**
 * Configuration Modal Component
 *
 * Global application settings:
 * - Serial port configuration
 * - Message buffer limits
 * - Display options
 */

import React, { useState, useEffect } from "react";

// TODO: Move these to types.ts when this component is actually used
interface AppConfig {
  serial: {
    baudRate: number;
    dataBits: 7 | 8;
    stopBits: 1 | 2;
    parity: "none" | "even" | "odd";
  };
  maxMessages: number;
  autoScroll: boolean;
  showRawHex: boolean;
  showTimestamps: boolean;
}

const DEFAULT_APP_CONFIG: AppConfig = {
  serial: {
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: "none",
  },
  maxMessages: 1000,
  autoScroll: true,
  showRawHex: false,
  showTimestamps: true,
};

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

export default function ConfigModal({
  isOpen,
  onClose,
  config,
  onSave,
}: ConfigModalProps) {
  const [editedConfig, setEditedConfig] = useState<AppConfig>(config);

  // Update local state when config prop changes
  useEffect(() => {
    setEditedConfig(config);
  }, [config]);

  const handleSave = () => {
    onSave(editedConfig);
    onClose();
  };

  const handleReset = () => {
    setEditedConfig(DEFAULT_APP_CONFIG);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            ⚙️ Application Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Serial Configuration */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              🔌 Serial Port Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Baud Rate
                </label>
                <select
                  value={editedConfig.serial.baudRate}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      serial: {
                        ...editedConfig.serial,
                        baudRate: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-green-500 transition-colors"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Data Bits
                  </label>
                  <select
                    value={editedConfig.serial.dataBits}
                    onChange={(e) =>
                      setEditedConfig({
                        ...editedConfig,
                        serial: {
                          ...editedConfig.serial,
                          dataBits: parseInt(e.target.value) as 7 | 8,
                        },
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-green-500 transition-colors"
                  >
                    <option value={7}>7</option>
                    <option value={8}>8 (Default)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Stop Bits
                  </label>
                  <select
                    value={editedConfig.serial.stopBits}
                    onChange={(e) =>
                      setEditedConfig({
                        ...editedConfig,
                        serial: {
                          ...editedConfig.serial,
                          stopBits: parseInt(e.target.value) as 1 | 2,
                        },
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-green-500 transition-colors"
                  >
                    <option value={1}>1 (Default)</option>
                    <option value={2}>2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Parity
                </label>
                <select
                  value={editedConfig.serial.parity}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      serial: {
                        ...editedConfig.serial,
                        parity: e.target.value as "none" | "even" | "odd",
                      },
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-green-500 transition-colors"
                >
                  <option value="none">None (Default)</option>
                  <option value="even">Even</option>
                  <option value="odd">Odd</option>
                </select>
              </div>
            </div>
          </section>

          {/* Message Buffer Configuration */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              💾 Message Buffer
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Maximum Messages to Store
                </label>
                <input
                  type="number"
                  min={100}
                  max={50000}
                  step={100}
                  value={editedConfig.maxMessages}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      maxMessages: parseInt(e.target.value) || 2000,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-green-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 2,000 messages. Higher values use more memory.
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  <p>Approximate history at different bus loads:</p>
                  <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                    <li>
                      High traffic (1000 msg/s): ~
                      {Math.round(editedConfig.maxMessages / 1000)} seconds
                    </li>
                    <li>
                      Medium traffic (100 msg/s): ~
                      {Math.round(editedConfig.maxMessages / 100 / 60)} minutes
                    </li>
                    <li>
                      Low traffic (10 msg/s): ~
                      {Math.round(editedConfig.maxMessages / 10 / 60)} minutes
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Display Options */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              🖥️ Display Options
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={editedConfig.autoScroll}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      autoScroll: e.target.checked,
                    })
                  }
                  className="w-5 h-5 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div>
                  <span className="text-white group-hover:text-green-400 transition-colors">
                    Auto-scroll to new messages
                  </span>
                  <p className="text-xs text-gray-500">
                    Automatically scroll to the bottom when new messages arrive
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={editedConfig.showTimestamps}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      showTimestamps: e.target.checked,
                    })
                  }
                  className="w-5 h-5 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div>
                  <span className="text-white group-hover:text-green-400 transition-colors">
                    Show timestamps
                  </span>
                  <p className="text-xs text-gray-500">
                    Display timestamp for each message
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={editedConfig.showRawHex}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      showRawHex: e.target.checked,
                    })
                  }
                  className="w-5 h-5 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div>
                  <span className="text-white group-hover:text-green-400 transition-colors">
                    Show raw hex data
                  </span>
                  <p className="text-xs text-gray-500">
                    Display message data in hexadecimal format
                  </p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-900/50">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600 transition-colors"
          >
            Reset to Defaults
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
