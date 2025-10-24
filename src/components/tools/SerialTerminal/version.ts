/**
 * BattleTerm Version and Changelog
 */

export const VERSION = '1.0.0';
export const VERSION_DATE = '2025-10-24';
export const VERSION_NAME = 'Initial Release';

export interface ChangelogEntry {
  version: string;
  date: string;
  name: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0.0',
    date: '2025-10-24',
    name: 'Initial Release',
    changes: [
      '🎉  First public release of BattleTerm',
      '✨  Web Serial API integration for browser-based serial communication',
      '🎨  Full ANSI color support with xterm.js',
      '⚙️  Configurable baud rates (up to 921600)',
      '📝  Command history with up/down arrows',
      '💾  Download terminal logs',
      '📊  Real-time TX/RX indicators',
      '🔍  ASCII and Hex view modes',
      '📋  Copy/paste support (Ctrl+C/Ctrl+V)',
      '⏱️  Optional timestamps',
      '🌐  No installation required - runs in Chrome, Edge, Opera'
    ]
  }
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
export function formatChangelogForTerminal(entry: ChangelogEntry, maxItems: number = 5): string[] {
  const lines: string[] = [];

  // Header with bright yellow
  lines.push(`\x1b[1;33m  What's New in v${entry.version}:\x1b[0m`);

  // Show up to maxItems changes with varied bright colors
  const displayChanges = entry.changes.slice(0, maxItems);
  displayChanges.forEach((change, idx) => {
    // Split emoji from text
    const parts = change.split('  '); // Split on double space
    if (parts.length >= 2) {
      const emoji = parts[0];
      const text = parts.slice(1).join('  ');

      // Alternate bright/vivid colors for variety (using 38;5;N for 256-color mode)
      const colors = [
        '\x1b[38;5;51m',  // bright cyan
        '\x1b[38;5;213m', // bright pink/magenta
        '\x1b[38;5;118m', // bright green
        '\x1b[38;5;226m', // bright yellow
        '\x1b[38;5;141m'  // bright purple
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
    lines.push(`\x1b[2;90m  ...and ${remaining} more features (see Help for full changelog)\x1b[0m`);
  }

  return lines;
}
