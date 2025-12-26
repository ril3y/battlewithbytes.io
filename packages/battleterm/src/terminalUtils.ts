/**
 * Terminal Utilities
 * Helper functions for terminal display and formatting
 */

import type { TerminalOptions } from "./serialTerminal.types";

/**
 * ANSI color codes
 */
export const ANSI_COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  // Foreground colors
  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m",
  },

  // Background colors
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
  },
};

/**
 * Terminal theme configurations
 */
export const TERMINAL_THEMES = {
  default: {
    background: "#000000",
    foreground: "#ffffff",
    cursor: "#ffffff",
    cursorAccent: "#000000",
    selection: "rgba(255, 255, 255, 0.3)",
    black: "#000000",
    red: "#cd3131",
    green: "#0dbc79",
    yellow: "#e5e510",
    blue: "#2472c8",
    magenta: "#bc3fbc",
    cyan: "#11a8cd",
    white: "#e5e5e5",
    brightBlack: "#666666",
    brightRed: "#f14c4c",
    brightGreen: "#23d18b",
    brightYellow: "#f5f543",
    brightBlue: "#3b8eea",
    brightMagenta: "#d670d6",
    brightCyan: "#29b8db",
    brightWhite: "#ffffff",
  },
  green: {
    background: "#000000",
    foreground: "#00ff00",
    cursor: "#00ff00",
    cursorAccent: "#000000",
    selection: "rgba(0, 255, 0, 0.3)",
    black: "#000000",
    red: "#00ff00",
    green: "#00ff00",
    yellow: "#00ff00",
    blue: "#00ff00",
    magenta: "#00ff00",
    cyan: "#00ff00",
    white: "#00ff00",
    brightBlack: "#008800",
    brightRed: "#00ff00",
    brightGreen: "#00ff00",
    brightYellow: "#00ff00",
    brightBlue: "#00ff00",
    brightMagenta: "#00ff00",
    brightCyan: "#00ff00",
    brightWhite: "#00ff00",
  },
  amber: {
    background: "#000000",
    foreground: "#ffb000",
    cursor: "#ffb000",
    cursorAccent: "#000000",
    selection: "rgba(255, 176, 0, 0.3)",
    black: "#000000",
    red: "#ffb000",
    green: "#ffb000",
    yellow: "#ffb000",
    blue: "#ffb000",
    magenta: "#ffb000",
    cyan: "#ffb000",
    white: "#ffb000",
    brightBlack: "#cc8800",
    brightRed: "#ffb000",
    brightGreen: "#ffb000",
    brightYellow: "#ffb000",
    brightBlue: "#ffb000",
    brightMagenta: "#ffb000",
    brightCyan: "#ffb000",
    brightWhite: "#ffb000",
  },
  blue: {
    background: "#000000",
    foreground: "#00d4ff",
    cursor: "#00d4ff",
    cursorAccent: "#000000",
    selection: "rgba(0, 212, 255, 0.3)",
    black: "#000000",
    red: "#00d4ff",
    green: "#00d4ff",
    yellow: "#00d4ff",
    blue: "#00d4ff",
    magenta: "#00d4ff",
    cyan: "#00d4ff",
    white: "#00d4ff",
    brightBlack: "#0088aa",
    brightRed: "#00d4ff",
    brightGreen: "#00d4ff",
    brightYellow: "#00d4ff",
    brightBlue: "#00d4ff",
    brightMagenta: "#00d4ff",
    brightCyan: "#00d4ff",
    brightWhite: "#00d4ff",
  },
};

/**
 * Get xterm.js terminal options from our TerminalOptions
 */
export function getXtermOptions(options: TerminalOptions) {
  const theme = TERMINAL_THEMES[options.theme] || TERMINAL_THEMES.default;

  return {
    fontFamily: options.fontFamily,
    fontSize: options.fontSize,
    cursorBlink: false, // No cursor in display-only terminal
    cursorStyle: options.cursorStyle,
    scrollback: options.scrollback,
    theme,
    allowTransparency: true,
    convertEol: true, // Convert \n to \r\n for proper line handling
    disableStdin: true, // Display only - input handled by TerminalInput
    // rendererType removed - deprecated in xterm.js v5+
  };
}

/**
 * Format text with timestamp prefix
 */
export function formatWithTimestamp(text: string, timestamp: string): string {
  return `[${timestamp}] ${text}`;
}

/**
 * Format hex data with ASCII sidebar (like hex editors)
 */
export function formatHexWithAscii(
  bytes: Uint8Array,
  bytesPerLine: number = 16,
): string {
  const lines: string[] = [];

  for (let i = 0; i < bytes.length; i += bytesPerLine) {
    const lineBytes = bytes.slice(i, i + bytesPerLine);
    const offset = i.toString(16).padStart(8, "0");

    // Hex representation
    const hex = Array.from(lineBytes)
      .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
      .join(" ");
    const hexPadded = hex.padEnd(bytesPerLine * 3 - 1, " ");

    // ASCII representation
    const ascii = Array.from(lineBytes)
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "."))
      .join("");

    lines.push(`${offset}  ${hexPadded}  |${ascii}|`);
  }

  return lines.join("\n");
}

/**
 * Escape HTML special characters for safe display
 */
export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Detect if data contains ANSI escape codes
 */
export function containsAnsiCodes(text: string): boolean {
  return /\x1b\[[0-9;]*m/.test(text);
}

/**
 * Strip ANSI escape codes from text
 */
export function stripAnsiCodes(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

/**
 * Generate a downloadable text file from terminal content
 */
export function downloadTerminalLog(content: string, filename?: string): void {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download =
    filename ||
    `serial-log-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse command history from localStorage
 */
export function getCommandHistory(maxItems: number = 50): string[] {
  try {
    const history = localStorage.getItem("serial-terminal-history");
    if (!history) return [];

    const parsed = JSON.parse(history);
    return Array.isArray(parsed) ? parsed.slice(0, maxItems) : [];
  } catch {
    return [];
  }
}

/**
 * Save command to history
 */
export function saveCommandToHistory(
  command: string,
  maxItems: number = 50,
): void {
  try {
    const history = getCommandHistory(maxItems);

    // Remove duplicate if exists
    const filtered = history.filter((cmd) => cmd !== command);

    // Add to beginning
    const updated = [command, ...filtered].slice(0, maxItems);

    localStorage.setItem("serial-terminal-history", JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save command history:", error);
  }
}

/**
 * Clear command history
 */
export function clearCommandHistory(): void {
  try {
    localStorage.removeItem("serial-terminal-history");
  } catch (error) {
    console.error("Failed to clear command history:", error);
  }
}

/**
 * Check if character is a control character
 */
export function isControlCharacter(charCode: number): boolean {
  return (charCode >= 0 && charCode <= 31) || charCode === 127;
}

/**
 * Get printable representation of control character
 */
export function getControlCharName(charCode: number): string {
  const controlChars: { [key: number]: string } = {
    0: "NUL",
    1: "SOH",
    2: "STX",
    3: "ETX",
    4: "EOT",
    5: "ENQ",
    6: "ACK",
    7: "BEL",
    8: "BS",
    9: "TAB",
    10: "LF",
    11: "VT",
    12: "FF",
    13: "CR",
    14: "SO",
    15: "SI",
    16: "DLE",
    17: "DC1",
    18: "DC2",
    19: "DC3",
    20: "DC4",
    21: "NAK",
    22: "SYN",
    23: "ETB",
    24: "CAN",
    25: "EM",
    26: "SUB",
    27: "ESC",
    28: "FS",
    29: "GS",
    30: "RS",
    31: "US",
    127: "DEL",
  };

  return controlChars[charCode] || `[${charCode}]`;
}
