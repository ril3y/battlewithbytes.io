/**
 * @battlewithbytes/battleterm
 * Web-based serial terminal with ANSI support and PWA capabilities
 */

// Main component
export { default as BattleTerm } from "./BattleTerm";
export { default } from "./BattleTerm";

// Types
export type {
  SerialConfig,
  TerminalOptions,
  SendOptions,
  TerminalState,
  ConnectionStats,
  ViewMode,
  LineEnding,
} from "./serialTerminal.types";

export {
  DEFAULT_SERIAL_CONFIG,
  DEFAULT_TERMINAL_OPTIONS,
  DEFAULT_SEND_OPTIONS,
  BAUD_RATES,
} from "./serialTerminal.types";

// Utilities
export {
  isSerialSupported,
  requestSerialPort,
  openSerialPort,
  closeSerialPort,
  formatDataForSend,
  parseSerialData,
  bytesToHex,
} from "./serialUtils";

export { downloadTerminalLog, formatWithTimestamp } from "./terminalUtils";

// Config management
export { saveLastConfig, loadLastConfig } from "./configManager";

// Version info
export {
  VERSION,
  VERSION_DATE,
  VERSION_NAME,
  CHANGELOG,
  getLatestChangelog,
  formatChangelogForTerminal,
} from "./version";

export type { ChangelogEntry } from "./version";
