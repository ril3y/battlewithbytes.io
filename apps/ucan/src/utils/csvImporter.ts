/**
 * CSV CAN Log Importer
 *
 * Parses CSV files containing CAN message logs and converts them to CANMessage format.
 * Supports the format output by the uCAN monitor.
 */

import type { CANMessage, MessageDirection, MessageType } from "../types";

/**
 * CSV row structure
 */
interface CSVRow {
  timestamp: string;
  direction: string;
  canId: string;
  length: string;
  dataHex: string;
  dataDecimal: string;
  extended: string;
  success: string;
  error: string;
}

/**
 * Parse a CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Parse hex data string "00 01 02 03" to Uint8Array
 */
function parseHexData(hexStr: string): Uint8Array {
  const hexBytes = hexStr.split(/\s+/).filter((s) => s.length > 0);
  const data = new Uint8Array(hexBytes.length);

  for (let i = 0; i < hexBytes.length; i++) {
    data[i] = parseInt(hexBytes[i], 16);
  }

  return data;
}

/**
 * Parse CAN ID from hex string (e.g., "0x500" -> 0x500)
 */
function parseCANId(canIdStr: string): number {
  if (canIdStr.startsWith("0x") || canIdStr.startsWith("0X")) {
    return parseInt(canIdStr.substring(2), 16);
  }
  return parseInt(canIdStr, 16);
}

/**
 * Convert CSV row to CANMessage
 */
function csvRowToCANMessage(row: CSVRow, index: number): CANMessage | null {
  try {
    const canId = parseCANId(row.canId);
    const data = parseHexData(row.dataHex);
    const timestamp = new Date(row.timestamp);

    // Validate data
    if (isNaN(canId)) {
      console.warn(`Invalid CAN ID at row ${index + 2}: ${row.canId}`);
      return null;
    }

    if (isNaN(timestamp.getTime())) {
      console.warn(`Invalid timestamp at row ${index + 2}: ${row.timestamp}`);
      return null;
    }

    const direction: MessageDirection = row.direction === "RX" ? "RX" : "TX";
    const isExtended = row.extended.toLowerCase() === "yes";
    const messageType: MessageType = direction === "RX" ? "CAN_RX" : "CAN_TX";

    return {
      id: `${Date.now()}-${index}`,
      timestamp,
      direction,
      type: messageType,
      canId,
      data,
      length: data.length,
      isExtended: isExtended,
      success: row.success.toLowerCase() === "yes",
      error: row.error && row.error.trim() !== "" ? row.error : undefined,
    };
  } catch (error) {
    console.error(`Error parsing row ${index + 2}:`, error);
    return null;
  }
}

/**
 * Parse CSV content and convert to CANMessage array
 *
 * Expected CSV format:
 * Timestamp,Direction,CAN ID,Length,Data (Hex),Data (Decimal),Extended,Success,Error
 *
 * @param csvContent - Raw CSV file content
 * @returns Array of parsed CAN messages
 */
export function parseCANLogCSV(csvContent: string): CANMessage[] {
  const lines = csvContent.split("\n").map((line) => line.trim());

  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  // Parse header
  const header = parseCSVLine(lines[0]);
  const expectedHeaders = [
    "Timestamp",
    "Direction",
    "CAN ID",
    "Length",
    "Data (Hex)",
    "Data (Decimal)",
    "Extended",
    "Success",
    "Error",
  ];

  // Validate header (case-insensitive)
  const normalizedHeader = header.map((h) => h.toLowerCase().trim());
  const normalizedExpected = expectedHeaders.map((h) => h.toLowerCase());

  let headerValid = true;
  for (
    let i = 0;
    i < Math.min(normalizedExpected.length, normalizedHeader.length);
    i++
  ) {
    if (
      !normalizedHeader[i].includes(
        normalizedExpected[i].toLowerCase().replace(/[()]/g, ""),
      )
    ) {
      headerValid = false;
      break;
    }
  }

  if (!headerValid) {
    console.warn(
      "CSV header does not match expected format, attempting to parse anyway...",
    );
  }

  // Parse data rows
  const messages: CANMessage[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue; // Skip empty lines

    const fields = parseCSVLine(line);
    if (fields.length < 9) {
      console.warn(
        `Row ${i + 1} has insufficient columns (${fields.length}), skipping`,
      );
      continue;
    }

    const row: CSVRow = {
      timestamp: fields[0],
      direction: fields[1],
      canId: fields[2],
      length: fields[3],
      dataHex: fields[4],
      dataDecimal: fields[5],
      extended: fields[6],
      success: fields[7],
      error: fields[8] || "",
    };

    const message = csvRowToCANMessage(row, i - 1);
    if (message) {
      messages.push(message);
    }
  }

  console.log(
    `Parsed ${messages.length} messages from CSV (${lines.length - 1} rows)`,
  );
  return messages;
}

/**
 * Import CSV file from File object
 */
export async function importCSVFile(file: File): Promise<CANMessage[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const messages = parseCANLogCSV(content);
        resolve(messages);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}
