/**
 * Configuration Panel Component
 * Serial port configuration (baud rate, parity, etc.)
 */

import React, { useState } from 'react';
import type { ConfigurationPanelProps } from './serialTerminal.types';
import { BAUD_RATES } from './serialTerminal.types';

export default function ConfigurationPanel({
  config,
  onChange,
  disabled
}: ConfigurationPanelProps) {
  const [customBaudRate, setCustomBaudRate] = useState('');
  const [showCustomBaud, setShowCustomBaud] = useState(false);

  const handleBaudRateChange = (value: string) => {
    if (value === 'custom') {
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
      setCustomBaudRate('');
    }
  };

  const currentBaudInPresets = BAUD_RATES.includes(config.baudRate as any);

  return (
    <div className="p-4 bg-black/30 border border-gray-800 rounded-lg space-y-4">
      <h3 className="text-lg font-bold text-green-400 font-mono">Configuration</h3>

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
              value={currentBaudInPresets ? config.baudRate : 'custom'}
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
                {currentBaudInPresets ? 'Custom...' : `${config.baudRate} (Custom)`}
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
              onChange({ ...config, dataBits: parseInt(e.target.value) as 7 | 8 })
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
                parity: e.target.value as 'none' | 'even' | 'odd'
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
                stopBits: parseInt(e.target.value) as 1 | 2
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
                flowControl: e.target.value as 'none' | 'hardware'
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
                bufferSize: parseInt(e.target.value) || 8192
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
        <div className="text-sm text-yellow-400 font-mono">
          Disconnect to change configuration
        </div>
      )}
    </div>
  );
}
