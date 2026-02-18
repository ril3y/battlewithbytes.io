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

import { CANMessage, ProtocolMessage, MessageType } from "../types";

// Counter to ensure unique IDs even when multiple messages arrive in the same millisecond
let messageCounter = 0;

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
  const parts = trimmed.split(";");

  if (parts.length < 2) {
    console.warn("Invalid protocol message:", line);
    return null;
  }

  const messageType = parts[0].trim() as MessageType;

  switch (messageType) {
    case "CAN_RX":
    case "CAN_TX":
      return parseCANMessage(parts, messageType);

    case "CAN_ERR":
      return parseErrorMessage(parts);

    case "STATUS":
      return parseStatusMessage(parts);

    case "STATS":
      return parseStatsMessage(parts);

    case "CAPS":
    case "ACTIONDEF":
    case "RULE":
    case "ACTION":
      // Return raw message for CAPS, ACTIONDEF, RULE, and ACTION - handled in UCANMonitor
      return { type: messageType, raw: line };

    default:
      console.warn("Unknown message type:", messageType);
      return { type: messageType, raw: line };
  }
}

/**
 * Parse CAN_RX or CAN_TX message
 * Protocol spec format: CAN_RX;<CAN_ID>;<DATA>[;<TIMESTAMP>]
 * Examples:
 *   CAN_RX;0x123;01,02,03,04,05,06,07,08
 *   CAN_RX;0x1FFFFFFF;AA,BB,CC,DD;1635360000000
 */
function parseCANMessage(
  parts: string[],
  type: "CAN_RX" | "CAN_TX",
): ProtocolMessage | null {
  if (parts.length < 3) {
    console.warn("Invalid CAN message format:", parts.join(";"));
    return null;
  }

  // Parse CAN ID (supports 0x prefix)
  const canIdStr = parts[1].trim();
  const canId = canIdStr.startsWith("0x")
    ? parseInt(canIdStr.substring(2), 16)
    : parseInt(canIdStr, 16);

  if (isNaN(canId)) {
    console.warn("Invalid CAN ID:", canIdStr);
    return null;
  }

  // Parse data bytes
  const dataStr = parts[2].trim();
  const data: number[] = [];

  if (dataStr) {
    const bytes = dataStr.split(",");
    for (const byte of bytes) {
      const trimmedByte = byte.trim();
      if (trimmedByte) {
        const value = parseInt(trimmedByte, 16);
        if (isNaN(value)) {
          console.warn("Invalid data byte:", trimmedByte);
          return null;
        }
        data.push(value);
      }
    }
  }

  // Parse optional timestamp (milliseconds since epoch)
  const timestamp = parts[3] ? parseInt(parts[3].trim(), 10) : undefined;

  return {
    type,
    canId,
    data,
    timestamp: timestamp && !isNaN(timestamp) ? timestamp : undefined,
    raw: parts.join(";"),
  };
}

/**
 * Parse CAN_ERR message
 * Format: CAN_ERR;BUS_OFF;Error description
 */
function parseErrorMessage(parts: string[]): ProtocolMessage {
  const errorCode = parts[1]?.trim() || "UNKNOWN";
  const errorMessage = parts[2]?.trim() || "";

  return {
    type: "CAN_ERR",
    error: errorCode,
    status: errorMessage,
    raw: parts.join(";"),
  };
}

/**
 * Parse STATUS message
 * Format: STATUS;CONNECTED;uCAN v1.0 Ready
 */
function parseStatusMessage(parts: string[]): ProtocolMessage {
  const statusCode = parts[1]?.trim() || "";
  const statusMessage = parts[2]?.trim() || "";

  return {
    type: "STATUS",
    status: `${statusCode}: ${statusMessage}`,
    raw: parts.join(";"),
  };
}

/**
 * Parse STATS message
 * Protocol spec format: STATS;<RX_COUNT>;<TX_COUNT>;<ERROR_COUNT>;<BUS_LOAD>[;<TIMESTAMP>]
 * Example: STATS;1523;847;12;45;1635360000000
 */
function parseStatsMessage(parts: string[]): ProtocolMessage {
  if (parts.length < 5) {
    console.warn(
      "Invalid STATS format (expected at least 5 fields):",
      parts.join(";"),
    );
    return {
      type: "STATS",
      raw: parts.join(";"),
    };
  }

  const rxCount = parseInt(parts[1]?.trim() || "0", 10);
  const txCount = parseInt(parts[2]?.trim() || "0", 10);
  const errorCount = parseInt(parts[3]?.trim() || "0", 10);
  const busLoad = parseFloat(parts[4]?.trim() || "0");
  const timestamp = parts[5] ? parseInt(parts[5].trim(), 10) : undefined;

  // Validate parsed values
  if (isNaN(rxCount) || isNaN(txCount) || isNaN(errorCount) || isNaN(busLoad)) {
    console.warn("Invalid STATS values:", {
      rxCount,
      txCount,
      errorCount,
      busLoad,
    });
    return {
      type: "STATS",
      raw: parts.join(";"),
    };
  }

  return {
    type: "STATS",
    stats: {
      rxCount,
      txCount,
      errorCount,
      busLoad,
      timestamp,
    },
    raw: parts.join(";"),
  };
}

/**
 * Convert protocol message to CANMessage
 */
export function protocolToCANMessage(
  protocol: ProtocolMessage,
): CANMessage | null {
  // Handle CAN messages (RX/TX)
  if (protocol.type === "CAN_RX" || protocol.type === "CAN_TX") {
    if (protocol.canId === undefined || !protocol.data) {
      return null;
    }

    const direction = protocol.type === "CAN_RX" ? "RX" : "TX";
    const data = new Uint8Array(protocol.data);

    // Determine if extended ID (29-bit vs 11-bit)
    const isExtended = protocol.canId > 0x7ff;

    // Use firmware timestamp if available, otherwise use current time
    const timestamp = protocol.timestamp
      ? new Date(protocol.timestamp)
      : new Date();

    return {
      id: `${direction}_${Date.now()}_${protocol.canId}_${messageCounter++}`,
      timestamp,
      direction,
      type: protocol.type,
      canId: protocol.canId,
      data,
      length: data.length,
      isExtended,
      success: true,
    };
  }

  // Handle STATUS messages as info messages (but NOT STATS - those are just heartbeats)
  if (protocol.type === "STATUS") {
    // Create a pseudo CAN message for display purposes
    const statusText = protocol.status || "";
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(statusText.substring(0, 8)); // Max 8 bytes for display
    const paddedData = new Uint8Array(8);
    paddedData.set(data);

    return {
      id: `INFO_${Date.now()}_${messageCounter++}`,
      timestamp: new Date(),
      direction: "RX", // Show as received
      type: protocol.type,
      canId: 0x7ff, // Use max standard ID for info messages
      data: paddedData,
      length: data.length,
      isExtended: false,
      success: true,
      error: statusText,
    };
  }

  // STATS messages are just heartbeats - don't convert to CAN messages
  // They should be handled separately for connection status
  if (protocol.type === "STATS") {
    return null; // Don't display as a message
  }

  // Handle error messages
  if (protocol.type === "CAN_ERR") {
    const errorText = protocol.error || "Unknown error";
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(errorText.substring(0, 8));
    const paddedData = new Uint8Array(8);
    paddedData.set(data);

    return {
      id: `ERR_${Date.now()}_${messageCounter++}`,
      timestamp: new Date(),
      direction: "RX",
      type: protocol.type,
      canId: 0x7fe, // Use 0x7FE for error messages
      data: paddedData,
      length: data.length,
      isExtended: false,
      success: false,
      error: errorText,
    };
  }

  return null;
}

/**
 * Format data bytes for display
 */
export function formatDataBytes(
  data: Uint8Array,
  separator: string = " ",
): string {
  return Array.from(data)
    .map((byte) => byte.toString(16).toUpperCase().padStart(2, "0"))
    .join(separator);
}

/**
 * Format message for sending to device
 * Format: send:0x123:01,02,03,04
 */
export function formatSendCommand(canId: number, data: Uint8Array): string {
  const idStr = canId.toString(16).toUpperCase();
  const dataStr = formatDataBytes(data, ",");
  return `send:0x${idStr}:${dataStr}`;
}

/**
 * Validate CAN ID
 */
export function isValidCANId(
  canId: number,
  allowExtended: boolean = true,
): boolean {
  if (canId < 0) {
    return false;
  }

  if (allowExtended) {
    // 29-bit extended ID
    return canId <= 0x1fffffff;
  } else {
    // 11-bit standard ID
    return canId <= 0x7ff;
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
  const cleaned = hexString.replace(/[\s,:-]/g, "").toUpperCase();

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

  return crc & 0xff;
}

/**
 * Batch parse multiple lines
 */
export function parseMultipleLines(lines: string): ProtocolMessage[] {
  return lines
    .split("\n")
    .map((line) => parseProtocolLine(line))
    .filter((msg): msg is ProtocolMessage => msg !== null);
}
