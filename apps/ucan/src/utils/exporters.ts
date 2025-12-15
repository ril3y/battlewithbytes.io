/**
 * uCAN Data Export Utilities
 *
 * Export CAN messages and statistics to various formats
 */

import { CANMessage, BusStatistics, ExportConfig } from "../types";
import { formatCANId, formatDataBytes } from "../core/canProtocol";

/**
 * Export messages to CSV format
 */
export function exportToCSV(
  messages: CANMessage[],
  includeTimestamps: boolean = true,
  includeRawData: boolean = true,
): string {
  const rows: string[] = [];

  // Header row
  const headers: string[] = ["Direction", "CAN ID"];

  if (includeTimestamps) {
    headers.unshift("Timestamp");
  }

  if (includeRawData) {
    headers.push("Length", "Data (Hex)", "Data (Decimal)");
  }

  headers.push("Extended", "Success", "Error");

  rows.push(headers.join(","));

  // Data rows
  for (const message of messages) {
    const row: string[] = [];

    if (includeTimestamps) {
      row.push(message.timestamp.toISOString());
    }

    row.push(message.direction);
    row.push(formatCANId(message.canId, message.isExtended));

    if (includeRawData) {
      row.push(message.length.toString());
      row.push(`"${formatDataBytes(message.data, " ")}"`);
      row.push(`"${Array.from(message.data).join(" ")}"`);
    }

    row.push(message.isExtended ? "Yes" : "No");
    row.push(
      message.success !== undefined ? (message.success ? "Yes" : "No") : "N/A",
    );
    row.push(message.error ? `"${message.error.replace(/"/g, '""')}"` : "");

    rows.push(row.join(","));
  }

  return rows.join("\n");
}

/**
 * Export messages to JSON format
 */
export function exportToJSON(
  messages: CANMessage[],
  includeTimestamps: boolean = true,
  includeStats: boolean = false,
  stats?: BusStatistics,
): string {
  const data: Record<string, unknown> = {
    exportDate: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages.map((msg) => ({
      ...(includeTimestamps && { timestamp: msg.timestamp.toISOString() }),
      direction: msg.direction,
      type: msg.type,
      canId: formatCANId(msg.canId, msg.isExtended),
      canIdDecimal: msg.canId,
      data: Array.from(msg.data),
      dataHex: formatDataBytes(msg.data, " "),
      length: msg.length,
      isExtended: msg.isExtended,
      ...(msg.success !== undefined && { success: msg.success }),
      ...(msg.error && { error: msg.error }),
    })),
  };

  if (includeStats && stats) {
    data.statistics = {
      rxCount: stats.rxCount,
      txCount: stats.txCount,
      errorCount: stats.errorCount,
      messagesPerSecond: stats.messagesPerSecond,
      busLoad: stats.busLoad,
      uptimeMs: stats.uptime,
      perIdStats: Array.from(stats.perIdStats.values()).map((idStat) => ({
        canId: formatCANId(idStat.canId, idStat.canId > 0x7ff),
        canIdDecimal: idStat.canId,
        count: idStat.count,
        lastSeen: idStat.lastSeen.toISOString(),
        frequency: idStat.frequency,
        averageIntervalMs: idStat.averageInterval,
      })),
    };
  }

  return JSON.stringify(data, null, 2);
}

/**
 * Export messages to plain text format
 */
export function exportToText(
  messages: CANMessage[],
  includeTimestamps: boolean = true,
): string {
  const lines: string[] = [];

  lines.push("=".repeat(80));
  lines.push("uCAN Message Log Export");
  lines.push(`Export Date: ${new Date().toISOString()}`);
  lines.push(`Total Messages: ${messages.length}`);
  lines.push("=".repeat(80));
  lines.push("");

  for (const message of messages) {
    const parts: string[] = [];

    if (includeTimestamps) {
      parts.push(`[${message.timestamp.toISOString()}]`);
    }

    parts.push(message.direction);
    parts.push(`ID=${formatCANId(message.canId, message.isExtended)}`);
    parts.push(`[${message.length}]`);
    parts.push(formatDataBytes(message.data, " "));

    if (message.error) {
      parts.push(`ERROR: ${message.error}`);
    }

    lines.push(parts.join(" "));
  }

  return lines.join("\n");
}

/**
 * Download file to browser
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Export messages with configuration
 */
export function exportMessages(
  messages: CANMessage[],
  config: ExportConfig,
  stats?: BusStatistics,
): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const baseFilename = config.filename || `ucan-log-${timestamp}`;

  let content: string;
  let mimeType: string;
  let extension: string;

  switch (config.format) {
    case "csv":
      content = exportToCSV(
        messages,
        config.includeTimestamps,
        config.includeRawData,
      );
      mimeType = "text/csv";
      extension = "csv";
      break;

    case "json":
      content = exportToJSON(
        messages,
        config.includeTimestamps,
        config.includeStats,
        stats,
      );
      mimeType = "application/json";
      extension = "json";
      break;

    case "txt":
      content = exportToText(messages, config.includeTimestamps);
      mimeType = "text/plain";
      extension = "txt";
      break;

    default:
      throw new Error(`Unsupported export format: ${config.format}`);
  }

  const filename = `${baseFilename}.${extension}`;
  downloadFile(content, filename, mimeType);
}

/**
 * Export statistics summary
 */
export function exportStatsSummary(stats: BusStatistics): void {
  const summary = {
    exportDate: new Date().toISOString(),
    statistics: {
      rxCount: stats.rxCount,
      txCount: stats.txCount,
      errorCount: stats.errorCount,
      totalMessages: stats.rxCount + stats.txCount,
      messagesPerSecond: stats.messagesPerSecond,
      busLoad: stats.busLoad,
      uptimeMs: stats.uptime,
      uptimeFormatted: formatUptime(stats.uptime),
    },
    perIdStatistics: Array.from(stats.perIdStats.values())
      .sort((a, b) => b.count - a.count)
      .map((idStat) => ({
        canId: formatCANId(idStat.canId, idStat.canId > 0x7ff),
        canIdDecimal: idStat.canId,
        count: idStat.count,
        percentage:
          ((idStat.count / (stats.rxCount + stats.txCount)) * 100).toFixed(2) +
          "%",
        lastSeen: idStat.lastSeen.toISOString(),
        frequency: idStat.frequency.toFixed(2) + " msg/s",
        averageIntervalMs: idStat.averageInterval.toFixed(2) + " ms",
      })),
  };

  const content = JSON.stringify(summary, null, 2);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `ucan-stats-${timestamp}.json`;

  downloadFile(content, filename, "application/json");
}

/**
 * Format uptime in human-readable format
 */
function formatUptime(uptimeMs: number): string {
  const seconds = Math.floor(uptimeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
  if (seconds % 60 > 0) parts.push(`${seconds % 60}s`);

  return parts.join(" ") || "0s";
}
