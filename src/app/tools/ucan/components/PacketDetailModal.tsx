'use client';

/**
 * Packet Detail Modal Component
 *
 * Full-screen overlay modal for detailed packet inspection
 */

import React, { useEffect } from 'react';
import { CANMessage } from '../types';
import { formatTimestamp, formatCANId, formatBytes, formatBinary, formatASCII } from '../utils/formatters';

interface PacketDetailModalProps {
  message: CANMessage | undefined;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function PacketDetailModal({
  message,
  isOpen,
  onClose,
  onNavigate,
  hasPrev = false,
  hasNext = false
}: PacketDetailModalProps) {
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrev && onNavigate) {
            e.preventDefault();
            onNavigate('prev');
          }
          break;
        case 'ArrowRight':
          if (hasNext && onNavigate) {
            e.preventDefault();
            onNavigate('next');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate, hasPrev, hasNext]);

  if (!isOpen || !message) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
        {/* Previous Button */}
        {hasPrev && onNavigate && (
          <button
            onClick={() => onNavigate('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800/90 hover:bg-gray-700 border-2 border-gray-600 rounded-full flex items-center justify-center text-white text-2xl transition-all hover:scale-110 z-50"
            title="Previous packet (←)"
          >
            ‹
          </button>
        )}

        {/* Next Button */}
        {hasNext && onNavigate && (
          <button
            onClick={() => onNavigate('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800/90 hover:bg-gray-700 border-2 border-gray-600 rounded-full flex items-center justify-center text-white text-2xl transition-all hover:scale-110 z-50"
            title="Next packet (→)"
          >
            ›
          </button>
        )}

        <div
          className="bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              📋 Packet Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-800"
            >
              ✕
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Message Header */}
            <div className="border-b border-gray-700 pb-4">
              <p className="text-sm text-gray-400">
                {formatTimestamp(message.timestamp, true)}
              </p>
            </div>

            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-950 border border-gray-700 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-2">Direction</div>
                <div className={`text-xl font-bold ${message.direction === 'RX' ? 'text-green-400' : 'text-blue-400'}`}>
                  {message.direction === 'RX' ? '🟢 Receive (RX)' : '🔵 Transmit (TX)'}
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-700 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-2">CAN ID</div>
                <div className="text-xl font-bold text-white font-mono">
                  {formatCANId(message.canId, message.isExtended)}
                  <div className="text-sm text-gray-400 mt-1 font-normal">
                    Decimal: {message.canId} • {message.isExtended ? 'Extended (29-bit)' : 'Standard (11-bit)'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-700 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-2">Data Length</div>
                <div className="text-xl font-bold text-white">
                  {message.length} {message.length === 1 ? 'byte' : 'bytes'}
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-700 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-2">Message Type</div>
                <div className="text-xl font-bold text-white">{message.type}</div>
              </div>
            </div>

            {/* Data Breakdown */}
            <div className="bg-gray-950 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Data Breakdown</h3>
              <div className="space-y-4">
                {/* Hex */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">Hexadecimal</div>
                  <div className="font-mono text-lg text-white bg-black/40 p-3 rounded border border-gray-800">
                    {formatBytes(message.data, ' ')}
                  </div>
                </div>

                {/* Binary */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">Binary</div>
                  <div className="font-mono text-sm text-white bg-black/40 p-3 rounded border border-gray-800 break-all">
                    {formatBinary(message.data, ' ')}
                  </div>
                </div>

                {/* Decimal */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">Decimal</div>
                  <div className="font-mono text-lg text-white bg-black/40 p-3 rounded border border-gray-800">
                    {Array.from(message.data).join(' ')}
                  </div>
                </div>

                {/* ASCII */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">ASCII (printable characters)</div>
                  <div className="font-mono text-lg text-white bg-black/40 p-3 rounded border border-gray-800">
                    {formatASCII(message.data) || '(no printable characters)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Byte Table */}
            <div className="bg-gray-950 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Byte-by-Byte Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b-2 border-gray-700">
                    <tr className="text-gray-400">
                      <th className="text-left py-3 px-2 font-semibold">Byte #</th>
                      <th className="text-left py-3 px-2 font-semibold">Hex</th>
                      <th className="text-left py-3 px-2 font-semibold">Decimal</th>
                      <th className="text-left py-3 px-2 font-semibold">Binary</th>
                      <th className="text-left py-3 px-2 font-semibold">ASCII</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {Array.from(message.data).map((byte, idx) => (
                      <tr key={idx} className="text-white hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-2 text-gray-400 font-semibold">{idx}</td>
                        <td className="py-3 px-2 font-mono text-green-400">
                          0x{byte.toString(16).toUpperCase().padStart(2, '0')}
                        </td>
                        <td className="py-3 px-2 font-mono">{byte}</td>
                        <td className="py-3 px-2 font-mono text-xs text-blue-400">
                          {byte.toString(2).padStart(8, '0')}
                        </td>
                        <td className="py-3 px-2 font-mono text-purple-400">
                          {byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '·'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Error Info */}
            {message.error && (
              <div className="bg-red-600/10 border-2 border-red-500/50 rounded-lg p-4">
                <div className="text-sm text-red-400 mb-1 font-semibold">⚠️ Error</div>
                <div className="text-red-300">{message.error}</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-800 border-t border-gray-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>
                Press <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-300">ESC</kbd> to close
              </span>
              {onNavigate && (hasPrev || hasNext) && (
                <span>
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-300">←</kbd>
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-300 ml-1">→</kbd> to navigate
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
