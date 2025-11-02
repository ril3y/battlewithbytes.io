'use client';

/**
 * Memory Panel Component
 *
 * Displays memory contents in hex view format
 */

import React, { useState, useCallback, ReactElement } from 'react';

interface MemoryPanelProps {
  onReadMemory: (address: number, length: number) => Promise<Uint8Array | null>;
  isConnected: boolean;
}

export default function MemoryPanel({ onReadMemory, isConnected }: MemoryPanelProps) {
  const [address, setAddress] = useState('0x20000000'); // Default to RAM region
  const [length, setLength] = useState(256);
  const [memoryData, setMemoryData] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRead = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const addr = parseInt(address, 16);
      if (isNaN(addr)) {
        setError('Invalid address');
        return;
      }

      const data = await onReadMemory(addr, length);
      if (data) {
        setMemoryData(data);
      } else {
        setError('Failed to read memory');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [address, length, isConnected, onReadMemory]);

  const formatHexView = (data: Uint8Array, baseAddress: number): ReactElement[] => {
    const lines: ReactElement[] = [];
    const bytesPerLine = 16;

    for (let offset = 0; offset < data.length; offset += bytesPerLine) {
      const lineAddr = baseAddress + offset;
      const lineData = data.slice(offset, offset + bytesPerLine);

      // Create hex representation
      const hexBytes = Array.from(lineData)
        .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
        .join(' ');

      // Create ASCII representation
      const ascii = Array.from(lineData)
        .map(byte => (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.')
        .join('');

      lines.push(
        <div key={offset} className="flex font-mono text-xs hover:bg-gray-800 px-2 py-0.5">
          <span className="text-blue-400 mr-4">
            {lineAddr.toString(16).padStart(8, '0').toUpperCase()}
          </span>
          <span className="text-gray-300 mr-4 flex-1">
            {hexBytes}
          </span>
          <span className="text-yellow-400">
            {ascii}
          </span>
        </div>
      );
    }

    return lines;
  };

  // Common memory regions for ARM Cortex-M
  const memoryRegions = [
    { name: 'Flash', address: '0x08000000' },
    { name: 'RAM', address: '0x20000000' },
    { name: 'Peripherals', address: '0x40000000' },
    { name: 'System', address: '0xE0000000' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="text-sm font-bold text-green-400">MEMORY</h2>
        <div className="flex items-center gap-2">
          <select
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-green-500"
          >
            <option value={address}>{address}</option>
            {memoryRegions.map(region => (
              <option key={region.address} value={region.address}>
                {region.name} ({region.address})
              </option>
            ))}
          </select>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x20000000"
            className="w-24 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-green-500 font-mono"
          />
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value) || 256)}
            min="16"
            max="4096"
            step="16"
            className="w-16 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-green-500"
          />
          <button
            onClick={handleRead}
            disabled={!isConnected || loading}
            className="px-3 py-1 text-xs rounded border bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Reading...' : 'Read'}
          </button>
        </div>
      </div>

      {/* Memory Content */}
      <div className="flex-1 overflow-y-auto">
        {!isConnected ? (
          <div className="text-gray-500 text-xs text-center mt-4">
            Connect to target to view memory
          </div>
        ) : error ? (
          <div className="text-red-400 text-xs text-center mt-4">
            Error: {error}
          </div>
        ) : memoryData ? (
          <div className="py-2">
            {formatHexView(memoryData, parseInt(address, 16))}
          </div>
        ) : (
          <div className="text-gray-500 text-xs text-center mt-4">
            Enter address and click Read to view memory
          </div>
        )}
      </div>

      {/* Footer with info */}
      {memoryData && (
        <div className="p-2 border-t border-gray-700 text-xs text-gray-400">
          Showing {memoryData.length} bytes from {address}
        </div>
      )}
    </div>
  );
}