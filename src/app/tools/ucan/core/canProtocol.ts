/**
 * uCAN Protocol Parser
 *
 * Parses text-based USART-to-CAN bridge protocol
 *
 * Protocol Format:
 * - CAN_RX;0x123;01,02,03,04,05,06,07,08
 * - CAN_TX;0x456;AA,BB,CC,DD
 * - CAN_ERR;BUS_OFF;Error description
 * - STATUS;CONNECTED;Device status message
 * - STATS;RX:1234,TX:567,ERR:2
 */

import { CANMessage, ProtocolMessage, MessageType } from '../types';

/**
 * Parse a line of protocol text into a structured message
 */
export function parseProtocolLine(line: string): ProtocolMessage | null {
  // Trim whitespace
  const trimmed = line.trim();

  // Ignore empty lines
  if (!trimmed) {
    return null;
  }

  // Split by semicolon
  const parts = trimmed.split(';');

  if (parts.length < 2) {
    console.warn('Invalid protocol message:', line);
    return null;
  }

  const messageType = parts[0].trim() as MessageType;

  switch (messageType) {
    case 'CAN_RX':
    case 'CAN_TX':
      return parseCANMessage(parts, messageType);

    case 'CAN_ERR':
      return parseErrorMessage(parts);

    case 'STATUS':
      return parseStatusMessage(parts);

    case 'STATS':
      return parseStatsMessage(parts);

    default:
      console.warn('Unknown message type:', messageType);
      return { type: messageType, raw: line };
  }
}

/**
 * Parse CAN_RX or CAN_TX message
 * Format: CAN_RX;0x123;01,02,03,04,05,06,07,08
 */
function parseCANMessage(parts: string[], type: 'CAN_RX' | 'CAN_TX'): ProtocolMessage | null {
  if (parts.length < 3) {
    console.warn('Invalid CAN message format:', parts.join(';'));
    return null;
  }

  // Parse CAN ID (supports 0x prefix)
  const canIdStr = parts[1].trim();
  const canId = canIdStr.startsWith('0x')
    ? parseInt(canIdStr.substring(2), 16)
    : parseInt(canIdStr, 16);

  if (isNaN(canId)) {
    console.warn('Invalid CAN ID:', canIdStr);
    return null;
  }

  // Parse data bytes
  const dataStr = parts[2].trim();
  const data: number[] = [];

  if (dataStr) {
    const bytes = dataStr.split(',');
    for (const byte of bytes) {
      const trimmedByte = byte.trim();
      if (trimmedByte) {
        const value = parseInt(trimmedByte, 16);
        if (isNaN(value)) {
          console.warn('Invalid data byte:', trimmedByte);
          return null;
        }
        data.push(value);
      }
    }
  }

  return {
    type,
    canId,
    data,
    raw: parts.join(';')
  };
}

/**
 * Parse CAN_ERR message
 * Format: CAN_ERR;BUS_OFF;Error description
 */
function parseErrorMessage(parts: string[]): ProtocolMessage {
  const errorCode = parts[1]?.trim() || 'UNKNOWN';
  const errorMessage = parts[2]?.trim() || '';

  return {
    type: 'CAN_ERR',
    error: errorCode,
    status: errorMessage,
    raw: parts.join(';')
  };
}

/**
 * Parse STATUS message
 * Format: STATUS;CONNECTED;uCAN v1.0 Ready
 */
function parseStatusMessage(parts: string[]): ProtocolMessage {
  const statusCode = parts[1]?.trim() || '';
  const statusMessage = parts[2]?.trim() || '';

  return {
    type: 'STATUS',
    status: `${statusCode}: ${statusMessage}`,
    raw: parts.join(';')
  };
}

/**
 * Parse STATS message
 * Format: STATS;RX:1234,TX:567,ERR:2
 */
function parseStatsMessage(parts: string[]): ProtocolMessage {
  const statsData = parts[1]?.trim() || '';

  return {
    type: 'STATS',
    status: statsData,
    raw: parts.join(';')
  };
}

/**
 * Convert protocol message to CANMessage
 */
export function protocolToCANMessage(protocol: ProtocolMessage): CANMessage | null {
  if (protocol.type !== 'CAN_RX' && protocol.type !== 'CAN_TX') {
    return null;
  }

  if (protocol.canId === undefined || !protocol.data) {
    return null;
  }

  const direction = protocol.type === 'CAN_RX' ? 'RX' : 'TX';
  const data = new Uint8Array(protocol.data);

  // Determine if extended ID (29-bit vs 11-bit)
  const isExtended = protocol.canId > 0x7FF;

  return {
    id: `${direction}_${Date.now()}_${protocol.canId}`,
    timestamp: new Date(),
    direction,
    type: protocol.type,
    canId: protocol.canId,
    data,
    length: data.length,
    isExtended,
    success: true
  };
}

/**
 * Format CAN ID for display
 */
export function formatCANId(canId: number, isExtended: boolean): string {
  if (isExtended) {
    // 29-bit extended ID (8 hex digits)
    return `0x${canId.toString(16).toUpperCase().padStart(8, '0')}`;
  } else {
    // 11-bit standard ID (3 hex digits)
    return `0x${canId.toString(16).toUpperCase().padStart(3, '0')}`;
  }
}

/**
 * Format data bytes for display
 */
export function formatDataBytes(data: Uint8Array, separator: string = ' '): string {
  return Array.from(data)
    .map(byte => byte.toString(16).toUpperCase().padStart(2, '0'))
    .join(separator);
}

/**
 * Format message for sending to device
 * Format: send:0x123:01,02,03,04
 */
export function formatSendCommand(canId: number, data: Uint8Array): string {
  const idStr = canId.toString(16).toUpperCase();
  const dataStr = formatDataBytes(data, ',');
  return `send:0x${idStr}:${dataStr}`;
}

/**
 * Validate CAN ID
 */
export function isValidCANId(canId: number, allowExtended: boolean = true): boolean {
  if (canId < 0) {
    return false;
  }

  if (allowExtended) {
    // 29-bit extended ID
    return canId <= 0x1FFFFFFF;
  } else {
    // 11-bit standard ID
    return canId <= 0x7FF;
  }
}

/**
 * Validate data length (standard CAN)
 */
export function isValidDataLength(length: number): boolean {
  return length >= 0 && length <= 8;
}

/**
 * Parse hex string to byte array
 * Supports: "DEADBEEF", "DE AD BE EF", "DE,AD,BE,EF"
 */
export function parseHexString(hexString: string): Uint8Array | null {
  // Remove common separators
  const cleaned = hexString
    .replace(/[\s,:-]/g, '')
    .toUpperCase();

  // Validate hex characters
  if (!/^[0-9A-F]*$/.test(cleaned)) {
    return null;
  }

  // Must be even length
  if (cleaned.length % 2 !== 0) {
    return null;
  }

  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    const byte = parseInt(cleaned.substring(i, i + 2), 16);
    bytes.push(byte);
  }

  return new Uint8Array(bytes);
}

/**
 * Calculate CRC8 (used in some CAN protocols)
 */
export function calculateCRC8(data: Uint8Array): number {
  let crc = 0;

  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];

    for (let j = 0; j < 8; j++) {
      if (crc & 0x80) {
        crc = (crc << 1) ^ 0x07;
      } else {
        crc = crc << 1;
      }
    }
  }

  return crc & 0xFF;
}

/**
 * Batch parse multiple lines
 */
export function parseMultipleLines(lines: string): ProtocolMessage[] {
  return lines
    .split('\n')
    .map(line => parseProtocolLine(line))
    .filter((msg): msg is ProtocolMessage => msg !== null);
}
