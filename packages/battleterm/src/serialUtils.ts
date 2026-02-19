/**
 * Serial Utilities
 * Helper functions for Web Serial API operations
 */

import type {
  SerialConfig,
  LineEnding,
  ParsedSerialData,
} from "./serialTerminal.types";

// Web Serial API only supports these hardware flow control options
type FlowControlType = "none" | "hardware";

// Control characters
export const ESC = 0x1b; // Escape character
export const XON = 0x11; // DC1 - resume transmission
export const XOFF = 0x13; // DC3 - pause transmission

/**
 * Check if Web Serial API is supported in the browser
 */
export function isSerialSupported(): boolean {
  return "serial" in navigator;
}

/**
 * Request a serial port from the user
 */
export async function requestSerialPort(): Promise<SerialPort> {
  if (!isSerialSupported()) {
    throw new Error(
      "Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.",
    );
  }

  try {
    const port = await navigator.serial.requestPort();
    return port;
  } catch (error) {
    if (error instanceof Error && error.name === "NotFoundError") {
      throw new Error("No port selected");
    }
    throw error;
  }
}

/**
 * Open a serial port with the specified configuration
 */
export async function openSerialPort(
  port: SerialPort,
  config: SerialConfig,
): Promise<void> {
  try {
    // XON/XOFF is software flow control - use "none" for Web Serial API
    // The actual XON/XOFF handling is done in BattleTerm.tsx
    const hwFlowControl: FlowControlType =
      config.flowControl === "hardware" ? "hardware" : "none";

    await port.open({
      baudRate: config.baudRate,
      dataBits: config.dataBits,
      stopBits: config.stopBits,
      parity: config.parity,
      flowControl: hwFlowControl,
      bufferSize: config.bufferSize,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to open port: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Close a serial port
 */
export async function closeSerialPort(port: SerialPort): Promise<void> {
  try {
    if (port.readable) {
      await port.readable.cancel();
    }
    if (port.writable) {
      await port.writable.abort();
    }
    await port.close();
  } catch (error) {
    console.error("Error closing port:", error);
  }
}

/**
 * Convert line ending type to actual characters
 */
function getLineEndingChars(lineEnding: LineEnding): string {
  switch (lineEnding) {
    case "cr":
      return "\r";
    case "lf":
      return "\n";
    case "crlf":
      return "\r\n";
    case "none":
    default:
      return "";
  }
}

/**
 * Format data for sending with line endings
 */
export function formatDataForSend(
  data: string,
  lineEnding: LineEnding,
  asHex: boolean = false,
): Uint8Array {
  const encoder = new TextEncoder();

  if (asHex) {
    // Parse hex string (e.g., "48 65 6C 6C 6F" or "48656C6C6F")
    const hexString = data.replace(/\s+/g, "");
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return bytes;
  }

  const textWithEnding = data + getLineEndingChars(lineEnding);
  return encoder.encode(textWithEnding);
}

/**
 * Parse received serial data
 */
export function parseSerialData(
  data: Uint8Array,
  timestamp?: Date,
): ParsedSerialData {
  const decoder = new TextDecoder("utf-8");
  const text = decoder.decode(data);
  const hex = Array.from(data)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(" ");

  const time = timestamp || new Date();
  const timestampStr = time.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });

  return {
    raw: data,
    text,
    hex,
    timestamp: timestampStr,
  };
}

/**
 * Convert bytes to hex string with optional formatting
 */
export function bytesToHex(
  bytes: Uint8Array,
  options: {
    uppercase?: boolean;
    separator?: string;
    bytesPerLine?: number;
  } = {},
): string {
  const { uppercase = true, separator = " ", bytesPerLine = 16 } = options;

  const hex = Array.from(bytes).map((byte) => {
    const hexByte = byte.toString(16).padStart(2, "0");
    return uppercase ? hexByte.toUpperCase() : hexByte;
  });

  if (bytesPerLine && bytesPerLine > 0) {
    const lines: string[] = [];
    for (let i = 0; i < hex.length; i += bytesPerLine) {
      lines.push(hex.slice(i, i + bytesPerLine).join(separator));
    }
    return lines.join("\n");
  }

  return hex.join(separator);
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Format transfer rate to human-readable string
 */
export function formatTransferRate(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`;
}

