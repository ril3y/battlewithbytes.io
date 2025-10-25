'use client';

/**
 * Message Log Component
 *
 * Wireshark-like display for CAN packets with filtering and search
 */

import React, { useRef, useEffect, useState } from 'react';
import { CANMessage } from '../types';
import { formatTimestamp, formatCANId, formatBytes, formatBinary, formatASCII } from '../utils/formatters';

interface MessageLogProps {
  messages: CANMessage[];
  onMessageSelect?: (messageId: string) => void;
  selectedMessageId?: string;
  autoScroll?: boolean;
  showTimestamps?: boolean;
  viewMode?: 'list' | 'hex' | 'detail';
}

export default function MessageLog({
  messages,
  onMessageSelect,
  selectedMessageId,
  autoScroll = true,
  showTimestamps = true,
  viewMode = 'list'
}: MessageLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleMessageClick = (message: CANMessage) => {
    if (onMessageSelect) {
      onMessageSelect(message.id);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">📭 No messages captured</p>
          <p className="text-sm">Connect to a uCAN device to start capturing CAN packets</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto bg-gray-950 font-mono text-sm"
      style={{ scrollBehavior: autoScroll ? 'smooth' : 'auto' }}
    >
      {viewMode === 'list' && (
        <div className="divide-y divide-gray-800">
          {messages.map((message) => (
            <MessageRow
              key={message.id}
              message={message}
              isSelected={message.id === selectedMessageId}
              isHovered={message.id === hoveredId}
              showTimestamps={showTimestamps}
              onClick={() => handleMessageClick(message)}
              onMouseEnter={() => setHoveredId(message.id)}
              onMouseLeave={() => setHoveredId(null)}
            />
          ))}
        </div>
      )}

      {viewMode === 'hex' && (
        <div className="p-4 space-y-2">
          {messages.map((message) => (
            <HexMessageRow
              key={message.id}
              message={message}
              showTimestamps={showTimestamps}
            />
          ))}
        </div>
      )}

      {viewMode === 'detail' && selectedMessageId && (
        <DetailedMessageView
          message={messages.find(m => m.id === selectedMessageId)}
        />
      )}
    </div>
  );
}

/**
 * Single message row (list view)
 */
interface MessageRowProps {
  message: CANMessage;
  isSelected: boolean;
  isHovered: boolean;
  showTimestamps: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function MessageRow({
  message,
  isSelected,
  isHovered,
  showTimestamps,
  onClick,
  onMouseEnter,
  onMouseLeave
}: MessageRowProps) {
  // Special styling for INFO messages (STATS/STATUS)
  const isInfoMessage = message.type === 'STATS' || message.type === 'STATUS';
  const isErrorMessage = message.type === 'CAN_ERR';

  const directionColor = isInfoMessage
    ? 'text-cyan-400'
    : isErrorMessage
    ? 'text-red-400'
    : message.direction === 'RX' ? 'text-green-400' : 'text-blue-400';

  const directionBg = isInfoMessage
    ? 'bg-cyan-600/5'
    : isErrorMessage
    ? 'bg-red-600/5'
    : message.direction === 'RX' ? 'bg-green-600/5' : 'bg-blue-600/5';

  const directionSymbol = isInfoMessage
    ? 'ℹ️'
    : isErrorMessage
    ? '❌'
    : message.direction === 'RX' ? '🟢' : '🔵';

  const rowBg = isSelected
    ? 'bg-yellow-600/20 border-l-4 border-yellow-500'
    : isHovered
    ? 'bg-gray-800/50'
    : directionBg;

  return (
    <div
      className={`px-4 py-2 cursor-pointer transition-colors ${rowBg} hover:bg-gray-800/70`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center gap-3">
        {/* Timestamp */}
        {showTimestamps && (
          <span className="text-gray-500 text-xs w-24 flex-shrink-0">
            {formatTimestamp(message.timestamp)}
          </span>
        )}

        {/* Direction / Type */}
        <span className={`${directionColor} w-16 flex-shrink-0 flex items-center gap-1`}>
          <span className="text-xs">{directionSymbol}</span>
          <span className="font-semibold">
            {isInfoMessage ? message.type.substring(0, 4) : message.direction}
          </span>
        </span>

        {/* CAN ID */}
        <span className={`${directionColor} font-bold w-28 flex-shrink-0`}>
          {formatCANId(message.canId, message.isExtended)}
        </span>

        {/* Length */}
        <span className="text-gray-400 w-12 flex-shrink-0">
          [{message.length}]
        </span>

        {/* Data bytes */}
        <div className="flex-1 min-w-0 max-w-md overflow-x-auto flex gap-1">
          {Array.from(message.data).map((byte, idx) => (
            <span
              key={idx}
              className={`flex-shrink-0 ${idx % 2 === 0 ? 'text-gray-300' : 'text-gray-400'}`}
            >
              {byte.toString(16).toUpperCase().padStart(2, '0')}
            </span>
          ))}
        </div>

        {/* Error indicator */}
        {message.error && (
          <span className="text-red-400 text-xs flex-shrink-0">
            ⚠️ {message.error}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Hex dump message row
 */
interface HexMessageRowProps {
  message: CANMessage;
  showTimestamps: boolean;
}

function HexMessageRow({ message, showTimestamps }: HexMessageRowProps) {
  const directionColor = message.direction === 'RX' ? 'text-green-400' : 'text-blue-400';

  return (
    <div className="border border-gray-800 rounded p-3 bg-gray-900/50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2 pb-2 border-b border-gray-800">
        {showTimestamps && (
          <span className="text-gray-500 text-xs">{formatTimestamp(message.timestamp)}</span>
        )}
        <span className={directionColor}>
          {message.direction} {formatCANId(message.canId, message.isExtended)} [{message.length}]
        </span>
      </div>

      {/* Hex dump */}
      <div className="grid grid-cols-2 gap-4">
        {/* Hex */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Hexadecimal</div>
          <div className="text-gray-300">{formatBytes(message.data, ' ')}</div>
        </div>

        {/* Binary */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Binary</div>
          <div className="text-gray-400 text-xs break-all">{formatBinary(message.data, ' ')}</div>
        </div>

        {/* Decimal */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Decimal</div>
          <div className="text-gray-300">{Array.from(message.data).join(' ')}</div>
        </div>

        {/* ASCII */}
        <div>
          <div className="text-xs text-gray-500 mb-1">ASCII</div>
          <div className="text-gray-300">{formatASCII(message.data)}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Detailed message view
 */
interface DetailedMessageViewProps {
  message?: CANMessage;
}

function DetailedMessageView({ message }: DetailedMessageViewProps) {
  if (!message) {
    return (
      <div className="p-8 text-center text-gray-500">
        Select a message to view details
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Message Header */}
      <div className="border-b border-gray-700 pb-4">
        <h3 className="text-xl font-bold text-white mb-2">Message Details</h3>
        <p className="text-sm text-gray-400">
          {formatTimestamp(message.timestamp, true)}
        </p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 border border-gray-700 rounded p-4">
          <div className="text-xs text-gray-500 mb-1">Direction</div>
          <div className={`text-lg font-bold ${message.direction === 'RX' ? 'text-green-400' : 'text-blue-400'}`}>
            {message.direction === 'RX' ? '🟢 Receive' : '🔵 Transmit'}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded p-4">
          <div className="text-xs text-gray-500 mb-1">CAN ID</div>
          <div className="text-lg font-bold text-white">
            {formatCANId(message.canId, message.isExtended)}
            <span className="text-sm text-gray-400 ml-2">
              ({message.canId}) {message.isExtended ? 'Extended' : 'Standard'}
            </span>
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded p-4">
          <div className="text-xs text-gray-500 mb-1">Data Length</div>
          <div className="text-lg font-bold text-white">{message.length} bytes</div>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded p-4">
          <div className="text-xs text-gray-500 mb-1">Message Type</div>
          <div className="text-lg font-bold text-white">{message.type}</div>
        </div>
      </div>

      {/* Data Breakdown */}
      <div className="bg-gray-900/50 border border-gray-700 rounded p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Data Breakdown</h4>
        <div className="space-y-4">
          {/* Hex */}
          <div>
            <div className="text-xs text-gray-500 mb-1">Hexadecimal</div>
            <div className="font-mono text-white bg-black/30 p-2 rounded">
              {formatBytes(message.data, ' ')}
            </div>
          </div>

          {/* Binary */}
          <div>
            <div className="text-xs text-gray-500 mb-1">Binary</div>
            <div className="font-mono text-white bg-black/30 p-2 rounded text-xs break-all">
              {formatBinary(message.data, ' ')}
            </div>
          </div>

          {/* Decimal */}
          <div>
            <div className="text-xs text-gray-500 mb-1">Decimal</div>
            <div className="font-mono text-white bg-black/30 p-2 rounded">
              {Array.from(message.data).join(' ')}
            </div>
          </div>

          {/* ASCII */}
          <div>
            <div className="text-xs text-gray-500 mb-1">ASCII (printable characters)</div>
            <div className="font-mono text-white bg-black/30 p-2 rounded">
              {formatASCII(message.data) || '(no printable characters)'}
            </div>
          </div>

          {/* Byte Table */}
          <div>
            <div className="text-xs text-gray-500 mb-2">Byte Breakdown</div>
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr className="text-gray-400">
                  <th className="text-left py-2">Byte</th>
                  <th className="text-left">Hex</th>
                  <th className="text-left">Decimal</th>
                  <th className="text-left">Binary</th>
                  <th className="text-left">ASCII</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {Array.from(message.data).map((byte, idx) => (
                  <tr key={idx} className="text-white">
                    <td className="py-2 text-gray-400">{idx}</td>
                    <td className="font-mono">{byte.toString(16).toUpperCase().padStart(2, '0')}</td>
                    <td>{byte}</td>
                    <td className="font-mono text-xs">{byte.toString(2).padStart(8, '0')}</td>
                    <td className="font-mono">
                      {byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Error Info */}
      {message.error && (
        <div className="bg-red-600/10 border border-red-500/30 rounded p-4">
          <div className="text-xs text-red-400 mb-1">Error</div>
          <div className="text-red-300">{message.error}</div>
        </div>
      )}
    </div>
  );
}
