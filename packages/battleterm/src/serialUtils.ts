/**
 * Serial Utilities
 * Helper functions for Web Serial API operations
 */

import type {
  SerialConfig,
  LineEnding,
  ParsedSerialData,
} from "./serialTerminal.types";

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
    await port.open({
      baudRate: config.baudRate,
      dataBits: config.dataBits,
      stopBits: config.stopBits,
      parity: config.parity,
      flowControl: config.flowControl,
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
 * Write data to a serial port
 */
export async function writeToPort(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: string | Uint8Array,
): Promise<void> {
  const encoder = new TextEncoder();
  const bytes = typeof data === "string" ? encoder.encode(data) : data;
  await writer.write(bytes);
}

/**
 * Convert line ending type to actual characters
 */
export function getLineEndingChars(lineEnding: LineEnding): string {
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
 * Convert hex string to bytes
 */
export function hexToBytes(hexString: string): Uint8Array {
  const cleaned = hexString.replace(/[^0-9a-fA-F]/g, "");
  if (cleaned.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }

  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Format bytes as ASCII with non-printable characters replaced
 */
export function bytesToAscii(
  bytes: Uint8Array,
  placeholder: string = ".",
): string {
  return Array.from(bytes)
    .map((byte) => {
      // Printable ASCII range
      if (byte >= 32 && byte <= 126) {
        return String.fromCharCode(byte);
      }
      return placeholder;
    })
    .join("");
}

/**
 * Calculate transfer rate in bytes per second
 */
export function calculateTransferRate(
  bytes: number,
  startTime: number,
  endTime: number = Date.now(),
): number {
  const durationSeconds = (endTime - startTime) / 1000;
  if (durationSeconds <= 0) return 0;
  return Math.round(bytes / durationSeconds);
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

/**
 * Validate serial configuration
 */
export function validateSerialConfig(config: Partial<SerialConfig>): string[] {
  const errors: string[] = [];

  if (config.baudRate !== undefined) {
    if (config.baudRate <= 0 || !Number.isInteger(config.baudRate)) {
      errors.push("Baud rate must be a positive integer");
    }
  }

  if (config.dataBits !== undefined) {
    if (config.dataBits !== 7 && config.dataBits !== 8) {
      errors.push("Data bits must be 7 or 8");
    }
  }

  if (config.stopBits !== undefined) {
    if (config.stopBits !== 1 && config.stopBits !== 2) {
      errors.push("Stop bits must be 1 or 2");
    }
  }

  if (config.parity !== undefined) {
    if (!["none", "even", "odd"].includes(config.parity)) {
      errors.push("Parity must be none, even, or odd");
    }
  }

  if (config.flowControl !== undefined) {
    if (!["none", "hardware"].includes(config.flowControl)) {
      errors.push("Flow control must be none or hardware");
    }
  }

  return errors;
}

/**
 * Get port info as a readable string
 */
export function getPortInfo(port: SerialPort): string {
  const info = port.getInfo();
  const parts: string[] = [];

  if (info.usbVendorId) {
    parts.push(`VID: 0x${info.usbVendorId.toString(16).padStart(4, "0")}`);
  }
  if (info.usbProductId) {
    parts.push(`PID: 0x${info.usbProductId.toString(16).padStart(4, "0")}`);
  }

  return parts.length > 0 ? parts.join(", ") : "Unknown device";
}
