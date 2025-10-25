'use client';

/**
 * Send Panel Component
 *
 * UI for transmitting CAN messages to the bus
 */

import React, { useState } from 'react';
import { parseHexString, isValidCANId, isValidDataLength, formatSendCommand } from '../core/canProtocol';

interface SendPanelProps {
  isConnected: boolean;
  onSend: (command: string) => Promise<void>;
}

export default function SendPanel({ isConnected, onSend }: SendPanelProps) {
  const [canId, setCanId] = useState('');
  const [dataInput, setDataInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick data presets
  const presets = [
    { label: 'Empty', data: '' },
    { label: 'All Zeros', data: '00 00 00 00 00 00 00 00' },
    { label: 'All FFs', data: 'FF FF FF FF FF FF FF FF' },
    { label: 'Counter', data: '00 01 02 03 04 05 06 07' },
    { label: 'Deadbeef', data: 'DE AD BE EF' }
  ];

  const handleSend = async () => {
    setError(null);

    // Validate CAN ID
    if (!canId.trim()) {
      setError('CAN ID is required');
      return;
    }

    let parsedId: number;
    try {
      const idStr = canId.trim();
      parsedId = idStr.startsWith('0x')
        ? parseInt(idStr.substring(2), 16)
        : parseInt(idStr, 16);

      if (isNaN(parsedId)) {
        setError('Invalid CAN ID format');
        return;
      }

      if (!isValidCANId(parsedId)) {
        setError('CAN ID out of range (max 0x1FFFFFFF)');
        return;
      }
    } catch {
      setError('Invalid CAN ID');
      return;
    }

    // Parse data bytes
    let data: Uint8Array;
    try {
      const parsed = parseHexString(dataInput.trim());
      if (parsed === null) {
        setError('Invalid data format (use hex: 01 02 03 or 010203)');
        return;
      }
      data = parsed;
    } catch {
      setError('Invalid data bytes');
      return;
    }

    // Validate data length
    if (!isValidDataLength(data.length)) {
      setError('Data length must be 0-8 bytes');
      return;
    }

    // Format and send command
    try {
      setIsSending(true);
      const command = formatSendCommand(parsedId, data);
      await onSend(command);
      setLastSent(command);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setIsSending(false);
    }
  };

  const handlePreset = (presetData: string) => {
    setDataInput(presetData);
  };

  const handleClear = () => {
    setCanId('');
    setDataInput('');
    setError(null);
  };

  return (
    <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📤</span>
          Send Message
        </h2>
        {!isConnected && (
          <span className="text-xs text-red-400">⚠️ Not connected</span>
        )}
      </div>

      {/* CAN ID Input */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          CAN ID <span className="text-gray-600">(hex)</span>
        </label>
        <input
          type="text"
          value={canId}
          onChange={(e) => setCanId(e.target.value)}
          placeholder="0x123 or 123"
          disabled={!isConnected}
          className="w-full px-3 py-2 bg-gray-950 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-green-500 disabled:bg-gray-900 disabled:text-gray-600"
        />
      </div>

      {/* Data Input */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Data Bytes <span className="text-gray-600">(0-8 bytes, hex)</span>
        </label>
        <textarea
          value={dataInput}
          onChange={(e) => setDataInput(e.target.value)}
          placeholder="01 02 03 04&#10;or&#10;01020304"
          rows={3}
          disabled={!isConnected}
          className="w-full px-3 py-2 bg-gray-950 border border-gray-600 rounded text-white text-sm font-mono focus:outline-none focus:border-green-500 disabled:bg-gray-900 disabled:text-gray-600 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Current: {parseHexString(dataInput.trim())?.length || 0} bytes
        </p>
      </div>

      {/* Quick Presets */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Quick Presets</label>
        <div className="flex flex-wrap gap-1">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset.data)}
              disabled={!isConnected}
              className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-gray-300 rounded border border-gray-600 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-2 bg-red-600/10 border border-red-500/30 rounded text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* Last Sent */}
      {lastSent && !error && (
        <div className="p-2 bg-green-600/10 border border-green-500/30 rounded text-sm text-green-400 font-mono">
          ✓ Sent: {lastSent}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSend}
          disabled={!isConnected || isSending}
          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isSending ? (
            <>
              <span className="animate-spin">⏳</span>
              Sending...
            </>
          ) : (
            <>
              <span>📤</span>
              Send Message
            </>
          )}
        </button>
        <button
          onClick={handleClear}
          disabled={!isConnected}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-gray-300 rounded border border-gray-600 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Info */}
      <div className="pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          💡 Tip: Hex bytes can be separated by spaces, commas, or colons
        </p>
      </div>
    </div>
  );
}
