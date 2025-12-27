/**
 * BattleTerm Version and Changelog
 */

export const VERSION = "1.3.0";
export const VERSION_DATE = "2025-12-26";
export const VERSION_NAME = "Flow Control & UX Improvements";

export interface ChangelogEntry {
  version: string;
  date: string;
  name: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.3.0",
    date: "2025-12-26",
    name: "Flow Control & UX Improvements",
    changes: [
      "✨  Added XON/XOFF software flow control support",
      "🔧  Fixed line ending display (no more staircase effect)",
      "🖼️  Larger logo and proper favicon for browser tab",
      "🎯  Click terminal to focus input - no more cursor stealing",
      "⚡  Faster startup animation",
      "🔒  Terminal display is now read-only (input in command box only)",
    ],
  },
  {
    version: "1.2.2",
    date: "2025-10-24",
    name: "Serial Connection Fix",
    changes: [
      "🐛  Fixed application error when connecting to serial port",
      "🔧  Removed deprecated rendererType property for xterm.js v5+ compatibility",
      "✨  Serial port connections now work reliably",
    ],
  },
  {
    version: "1.2.1",
    date: "2025-10-24",
    name: "Auto-Focus on Connect",
    changes: [
      "✨  Input box automatically focuses when connected to serial port",
      "⌨️  Start typing immediately after connecting",
      "🎯  Better workflow - no need to click input box",
    ],
  },
  {
    version: "1.2.0",
    date: "2025-10-24",
    name: "ESC Key & Cursor Fixes",
    changes: [
      "🐛  Fixed ESC key not working in fullscreen when terminal focused",
      "🐛  Disabled cursor blink when not connected to port",
      "✨  ESC now uses event capture to bypass xterm interception",
      "⌨️  Cleaner terminal state - no blinking cursor until connected",
    ],
  },
  {
    version: "1.1.9",
    date: "2025-10-24",
    name: "ESC to Exit Fullscreen",
    changes: [
      "⌨️  Press ESC key to exit fullscreen mode",
      "💡  Brief hint message shows when entering fullscreen",
      "🔧  Removed persistent exit button that overlapped with controls",
      "✨  Cleaner fullscreen experience",
    ],
  },
  {
    version: "1.1.8",
    date: "2025-10-24",
    name: "Fullscreen Height Fix",
    changes: [
      "📐  Fullscreen mode now uses full viewport height",
      "⬇️  Status bar pinned to bottom of window in fullscreen",
      "✨  Better use of screen space in fullscreen mode",
    ],
  },
  {
    version: "1.1.7",
    date: "2025-10-24",
    name: "Auto-Focus Input",
    changes: [
      "⌨️  Terminal input automatically focuses on page load",
      "✨  Start typing immediately without clicking",
      "🎯  Better user experience - ready to use right away",
    ],
  },
  {
    version: "1.1.6",
    date: "2025-10-24",
    name: "Fullscreen Toggle",
    changes: [
      "✨  Added fullscreen toggle button in browser mode",
      "🎯  PWA mode automatically hides header for app experience",
      "📱  Browser mode shows header with fullscreen button",
      "🔄  Easy toggle between normal and fullscreen views",
      "✕  Exit fullscreen button when in fullscreen mode",
    ],
  },
  {
    version: "1.1.5",
    date: "2025-10-24",
    name: "Full-Screen Terminal",
    changes: [
      "🎯  Removed header - terminal now full-screen always",
      "🔗  battlewithbytes.io attribution always visible in status bar",
      "✨  Cleaner, more professional terminal-only interface",
    ],
  },
  {
    version: "1.1.4",
    date: "2025-10-24",
    name: "PWA Enhancements & UI Fixes",
    changes: [
      "✨  Real-time hex/ASCII mode switching without reconnecting",
      "📐  Dynamic terminal height based on viewport (better laptop support)",
      "🎯  Hide header in PWA mode for full-screen terminal experience",
      "🔗  Show battlewithbytes.io attribution in status bar when in PWA mode",
      "🐛  Fixed TypeScript strict mode issues for better reliability",
    ],
  },
  {
    version: "1.1.3",
    date: "2025-10-24",
    name: "Hex View Fix",
    changes: [
      "🐛  Fixed hex view showing both hex AND text (now shows only hex)",
      "🐛  Fixed hex view executing newlines (now shows 0A instead of \\n)",
      "🐛  Removed annoying [HEX] prefix from hex output",
      "✨  Hex view now works instantly without reconnecting",
      "🔧  Cleared line buffer when switching between ASCII/hex modes",
    ],
  },
  {
    version: "1.1.2",
    date: "2025-10-24",
    name: "ANSI Color Support",
    changes: [
      "🎨  Fixed ANSI color codes not displaying from serial devices",
      "🔧  Disabled EOL conversion to preserve raw ANSI escape sequences",
      "✨  Colors from devices now display correctly (tested with colored log output)",
    ],
  },
  {
    version: "1.1.1",
    date: "2025-10-24",
    name: "Bug Fixes",
    changes: [
      "🐛  Fixed timestamps appearing in middle of lines",
      "🐛  Fixed line numbers counting data fragments instead of complete lines",
      "✨  Implemented proper line buffering for serial data",
      "🔧  Timestamps and line numbers now apply to complete lines only",
    ],
  },
  {
    version: "1.1.0",
    date: "2025-10-24",
    name: "PWA Update",
    changes: [
      "📱  Installable as standalone PWA app",
      "🎯  Fullscreen mode when installed - no navigation clutter",
      "📐  Minimum window size constraints (800x600)",
      "✨  Professional app experience on desktop and mobile",
      "🔧  Improved viewport configuration for PWA",
    ],
  },
  {
    version: "1.0.0",
    date: "2025-10-24",
    name: "Initial Release",
    changes: [
      "🎉  First public release of BattleTerm",
      "✨  Web Serial API integration for browser-based serial communication",
      "🎨  Full ANSI color support with xterm.js",
      "⚙️  Configurable baud rates (up to 921600)",
      "📝  Command history with up/down arrows",
      "💾  Download terminal logs",
      "📊  Real-time TX/RX indicators",
      "🔍  ASCII and Hex view modes",
      "📋  Copy/paste support (Ctrl+C/Ctrl+V)",
      "⏱️  Optional timestamps",
      "🌐  No installation required - runs in Chrome, Edge, Opera",
    ],
  },
];

/**
 * Get the latest changelog entry
 */
export function getLatestChangelog(): ChangelogEntry {
  return CHANGELOG[0];
}

/**
 * Get changelog formatted for terminal display with colorful ANSI codes
 */
export function formatChangelogForTerminal(
  entry: ChangelogEntry,
  maxItems: number = 5,
): string[] {
  const lines: string[] = [];

  // Header with bright yellow
  lines.push(`\x1b[1;33m  What's New in v${entry.version}:\x1b[0m`);

  // Show up to maxItems changes with varied bright colors
  const displayChanges = entry.changes.slice(0, maxItems);
  displayChanges.forEach((change, idx) => {
    // Split emoji from text
    const parts = change.split("  "); // Split on double space
    if (parts.length >= 2) {
      const emoji = parts[0];
      const text = parts.slice(1).join("  ");

      // Alternate bright/vivid colors for variety (using 38;5;N for 256-color mode)
      const colors = [
        "\x1b[38;5;51m", // bright cyan
        "\x1b[38;5;213m", // bright pink/magenta
        "\x1b[38;5;118m", // bright green
        "\x1b[38;5;226m", // bright yellow
        "\x1b[38;5;141m", // bright purple
      ];
      const color = colors[idx % colors.length];

      lines.push(`  ${emoji}  ${color}${text}\x1b[0m`);
    } else {
      // Fallback if format is different
      lines.push(`\x1b[38;5;51m  ${change}\x1b[0m`);
    }
  });

  // If there are more changes, show count
  if (entry.changes.length > maxItems) {
    const remaining = entry.changes.length - maxItems;
    lines.push(
      `\x1b[2;90m  ...and ${remaining} more features (see Help for full changelog)\x1b[0m`,
    );
  }

  return lines;
}
