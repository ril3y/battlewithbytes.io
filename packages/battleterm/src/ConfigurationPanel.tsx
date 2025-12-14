/**
 * Configuration Panel Component
 * Serial port configuration and terminal display settings
 */

import React, { useState } from "react";
import type {
  ConfigurationPanelProps,
  LineEnding,
} from "./serialTerminal.types";
import { BAUD_RATES } from "./serialTerminal.types";

export default function ConfigurationPanel({
  config,
  onChange,
  disabled,
  sendOptions,
  onSendOptionsChange,
  showTimestamps,
  onToggleTimestamps,
  showLineNumbers,
  onToggleLineNumbers,
}: ConfigurationPanelProps) {
  const [customBaudRate, setCustomBaudRate] = useState("");
  const [showCustomBaud, setShowCustomBaud] = useState(false);

  const handleBaudRateChange = (value: string) => {
    if (value === "custom") {
      setShowCustomBaud(true);
    } else {
      setShowCustomBaud(false);
      onChange({ ...config, baudRate: parseInt(value, 10) });
    }
  };

  const handleCustomBaudRate = () => {
    const rate = parseInt(customBaudRate, 10);
    if (!isNaN(rate) && rate > 0) {
      onChange({ ...config, baudRate: rate });
      setShowCustomBaud(false);
      setCustomBaudRate("");
    }
  };

  const currentBaudInPresets = (BAUD_RATES as readonly number[]).includes(
    config.baudRate,
  );

  return (
    <div className="p-4 bg-black/30 border border-gray-800 rounded-lg space-y-6">
      {/* Serial Port Configuration Section */}
      <div>
        <h3 className="text-lg font-bold text-green-400 font-mono mb-4">
          Serial Port Configuration
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Baud Rate */}
          <div>
            <label className="block text-sm font-mono text-gray-400 mb-2">
              Baud Rate
            </label>
            {showCustomBaud ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customBaudRate}
                  onChange={(e) => setCustomBaudRate(e.target.value)}
                  className="flex-1 px-3 py-2 bg-black border border-gray-700 rounded text-white font-mono text-sm"
                  placeholder="115200"
                  disabled={disabled}
                />
                <button
                  onClick={handleCustomBaudRate}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                  disabled={disabled}
                >
                  ✓
                </button>
                <button
                  onClick={() => setShowCustomBaud(false)}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
                  disabled={disabled}
                >
                  ✕
                </button>
              </div>
            ) : (
              <select
                value={currentBaudInPresets ? config.baudRate : "custom"}
                onChange={(e) => handleBaudRateChange(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded text-white font-mono text-sm"
                disabled={disabled}
              >
                {BAUD_RATES.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}
                  </option>
                ))}
                <option value="custom">
                  {currentBaudInPresets
                    ? "Custom..."
                    : `${config.baudRate} (Custom)`}
                </option>
              </select>
            )}
          </div>

          {/* Data Bits */}
          <div>
            <label className="block text-sm font-mono text-gray-400 mb-2">
              Data Bits
            </label>
            <select
              value={config.dataBits}
              onChange={(e) =>
                onChange({
                  ...config,
                  dataBits: parseInt(e.target.value) as 7 | 8,
                })
              }
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded text-white font-mono text-sm"
              disabled={disabled}
            >
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>
          </div>

          {/* Parity */}
          <div>
            <label className="block text-sm font-mono text-gray-400 mb-2">
              Parity
            </label>
            <select
              value={config.parity}
              onChange={(e) =>
                onChange({
                  ...config,
                  parity: e.target.value as "none" | "even" | "odd",
                })
              }
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded text-white font-mono text-sm"
              disabled={disabled}
            >
              <option value="none">None</option>
              <option value="even">Even</option>
              <option value="odd">Odd</option>
            </select>
          </div>

          {/* Stop Bits */}
          <div>
            <label className="block text-sm font-mono text-gray-400 mb-2">
              Stop Bits
            </label>
            <select
              value={config.stopBits}
              onChange={(e) =>
                onChange({
                  ...config,
                  stopBits: parseInt(e.target.value) as 1 | 2,
                })
              }
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded text-white font-mono text-sm"
              disabled={disabled}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </div>

          {/* Flow Control */}
          <div>
            <label className="block text-sm font-mono text-gray-400 mb-2">
              Flow Control
            </label>
            <select
              value={config.flowControl}
              onChange={(e) =>
                onChange({
                  ...config,
                  flowControl: e.target.value as "none" | "hardware",
                })
              }
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded text-white font-mono text-sm"
              disabled={disabled}
            >
              <option value="none">None</option>
              <option value="hardware">Hardware (RTS/CTS)</option>
            </select>
          </div>

          {/* Buffer Size */}
          <div>
            <label className="block text-sm font-mono text-gray-400 mb-2">
              Buffer Size
            </label>
            <input
              type="number"
              value={config.bufferSize}
              onChange={(e) =>
                onChange({
                  ...config,
                  bufferSize: parseInt(e.target.value) || 8192,
                })
              }
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded text-white font-mono text-sm"
              disabled={disabled}
              min={256}
              step={256}
            />
          </div>
        </div>

        {disabled && (
          <div className="text-sm text-yellow-400 font-mono mt-4">
            Disconnect to change serial port configuration
          </div>
        )}
      </div>

      {/* Send Settings Section */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-lg font-bold text-green-400 font-mono mb-4">
          Send Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Line Ending */}
          <div>
            <label className="block text-sm font-mono text-gray-400 mb-2">
              Line Ending
            </label>
            <select
              value={sendOptions.lineEnding}
              onChange={(e) =>
                onSendOptionsChange({
                  ...sendOptions,
                  lineEnding: e.target.value as LineEnding,
                })
              }
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded text-white font-mono text-sm"
            >
              <option value="none">None</option>
              <option value="cr">CR (\r)</option>
              <option value="lf">LF (\n)</option>
              <option value="crlf">CR+LF (\r\n)</option>
            </select>
          </div>

          {/* Local Echo */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-800/50 rounded">
              <input
                type="checkbox"
                checked={sendOptions.localEcho}
                onChange={(e) =>
                  onSendOptionsChange({
                    ...sendOptions,
                    localEcho: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded border-gray-700 bg-black text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-300 font-mono text-sm">
                Local Echo
              </span>
            </label>
          </div>

          {/* Send as Hex */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-800/50 rounded">
              <input
                type="checkbox"
                checked={sendOptions.sendAsHex}
                onChange={(e) =>
                  onSendOptionsChange({
                    ...sendOptions,
                    sendAsHex: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded border-gray-700 bg-black text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-300 font-mono text-sm">
                Send as Hex
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Display Settings Section */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-lg font-bold text-green-400 font-mono mb-4">
          Display Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Timestamps */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-800/50 rounded">
              <input
                type="checkbox"
                checked={showTimestamps}
                onChange={onToggleTimestamps}
                className="w-4 h-4 rounded border-gray-700 bg-black text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-300 font-mono text-sm">
                Show Timestamps
              </span>
            </label>
          </div>

          {/* Line Numbers */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-800/50 rounded">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={onToggleLineNumbers}
                className="w-4 h-4 rounded border-gray-700 bg-black text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-300 font-mono text-sm">
                Show Line Numbers
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
