/**
 * uCAN Formatting Utilities
 *
 * Helper functions for formatting data for display
 */

import { CANMessage } from "../types";

/**
 * Format timestamp for display
 */
export function formatTimestamp(
  date: Date,
  includeMilliseconds: boolean = true,
): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  if (includeMilliseconds) {
    const milliseconds = date.getMilliseconds().toString().padStart(3, "0");
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format bytes as hex string
 */
export function formatHex(value: number, padLength: number = 2): string {
  return value.toString(16).toUpperCase().padStart(padLength, "0");
}

/**
 * Format byte array as hex string
 */
export function formatBytes(data: Uint8Array, separator: string = " "): string {
  return Array.from(data)
    .map((byte) => formatHex(byte, 2))
    .join(separator);
}

/**
 * Format byte array as binary string
 */
export function formatBinary(
  data: Uint8Array,
  separator: string = " ",
): string {
  return Array.from(data)
    .map((byte) => byte.toString(2).padStart(8, "0"))
    .join(separator);
}

/**
 * Format byte array as ASCII (printable chars only)
 */
export function formatASCII(data: Uint8Array): string {
  return Array.from(data)
    .map((byte) => {
      // Printable ASCII range
      if (byte >= 32 && byte <= 126) {
        return String.fromCharCode(byte);
      }
      return ".";
    })
    .join("");
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }

  if (seconds > 0) {
    return `${seconds}s`;
  }

  return `${milliseconds}ms`;
}

/**
 * Format number with thousands separators
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format rate (messages per second)
 */
export function formatRate(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)} msg/s`;
}

/**
 * Format CAN message for display
 */
export function formatCANMessage(
  message: CANMessage,
  showTimestamp: boolean = true,
): string {
  const parts: string[] = [];

  if (showTimestamp) {
    parts.push(`[${formatTimestamp(message.timestamp)}]`);
  }

  const directionSymbol = message.direction === "RX" ? "🟢" : "🔵";
  parts.push(directionSymbol);
  parts.push(message.direction);

  const canId = message.isExtended
    ? `0x${formatHex(message.canId, 8)}`
    : `0x${formatHex(message.canId, 3)}`;
  parts.push(`ID=${canId}`);

  parts.push(`[${message.length}]`);
  parts.push(formatBytes(message.data));

  if (message.error) {
    parts.push(`ERROR: ${message.error}`);
  }

  return parts.join(" ");
}

/**
 * Color code for message direction
 */
export function getDirectionColor(direction: "RX" | "TX"): string {
  return direction === "RX" ? "text-green-400" : "text-blue-400";
}

/**
 * Background color for message direction
 */
export function getDirectionBgColor(direction: "RX" | "TX"): string {
  return direction === "RX" ? "bg-green-600/20" : "bg-blue-600/20";
}

/**
 * Border color for message direction
 */
export function getDirectionBorderColor(direction: "RX" | "TX"): string {
  return direction === "RX" ? "border-green-500/30" : "border-blue-500/30";
}

/**
 * Format CAN ID with proper padding
 */
export function formatCANId(canId: number, isExtended: boolean): string {
  if (isExtended) {
    return `0x${formatHex(canId, 8)}`;
  }
  return `0x${formatHex(canId, 3)}`;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + "...";
}

/**
 * Format baud rate for display
 */
export function formatBaudRate(baudRate: number): string {
  if (baudRate >= 1000000) {
    return `${(baudRate / 1000000).toFixed(1)}M`;
  }
  if (baudRate >= 1000) {
    return `${(baudRate / 1000).toFixed(0)}K`;
  }
  return `${baudRate}`;
}
