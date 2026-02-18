/**
 * Terminal Utilities
 * Helper functions for terminal display and formatting
 */

import type { TerminalOptions } from "./serialTerminal.types";

/**
 * Terminal theme configurations
 */
const TERMINAL_THEMES = {
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
  const baseTheme = TERMINAL_THEMES[options.theme] || TERMINAL_THEMES.default;

  // Override cursor to be invisible (display-only terminal)
  const theme = {
    ...baseTheme,
    cursor: "transparent",
    cursorAccent: "transparent",
  };

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

