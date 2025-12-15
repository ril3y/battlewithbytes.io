/**
 * SerialTerminal Types
 * All TypeScript interfaces and types for the Serial Terminal tool
 */

// Serial Port Configuration
export interface SerialConfig {
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: "none" | "even" | "odd";
  flowControl: "none" | "hardware";
  bufferSize?: number;
}

// Terminal Display Options
export interface TerminalOptions {
  fontSize: number;
  fontFamily: string;
  theme: "default" | "green" | "amber" | "blue";
  cursorBlink: boolean;
  cursorStyle: "block" | "underline" | "bar";
  scrollback: number;
}

// View Mode Options
export type ViewMode = "ascii" | "hex" | "mixed";

// Line Ending Options
export type LineEnding = "none" | "cr" | "lf" | "crlf";

// Send Options
export interface SendOptions {
  lineEnding: LineEnding;
  localEcho: boolean;
  sendAsHex: boolean;
}

// Terminal State
export interface TerminalState {
  isConnected: boolean;
  port: SerialPort | null;
  reader: ReadableStreamDefaultReader<Uint8Array> | null;
  writer: WritableStreamDefaultWriter<Uint8Array> | null;
  bytesReceived: number;
  bytesSent: number;
  connectionTime: number;
  error: string | null;
}

// Quick Send Macro
export interface QuickMacro {
  id: string;
  label: string;
  command: string;
  shortcut?: string;
}

// Saved Configuration Profile
export interface ConfigProfile {
  id: string;
  name: string;
  serialConfig: SerialConfig;
  terminalOptions: TerminalOptions;
  sendOptions: SendOptions;
  macros: QuickMacro[];
  createdAt: string;
  updatedAt: string;
}

// Terminal Control Actions
export interface TerminalControls {
  clear: () => void;
  scrollToBottom: () => void;
  downloadLog: () => void;
  toggleAutoScroll: () => void;
  changeViewMode: (mode: ViewMode) => void;
  changeFontSize: (size: number) => void;
}

// Serial Connection Actions
export interface SerialActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  send: (data: string | Uint8Array) => Promise<void>;
  updateConfig: (config: Partial<SerialConfig>) => Promise<void>;
}

// Statistics
export interface ConnectionStats {
  bytesReceived: number;
  bytesSent: number;
  connectionDuration: number;
  receiveRate: number;
  sendRate: number;
}

// Component Props
export interface ConnectionPanelProps {
  isConnected: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  error: string | null;
  onConfigClick: () => void;
  onHelpClick: () => void;
  onClear: () => void;
  onDownloadLog: () => void;
  logo?: string;
}

export interface ConfigurationPanelProps {
  config: SerialConfig;
  onChange: (config: SerialConfig) => void;
  disabled: boolean;
  sendOptions: SendOptions;
  onSendOptionsChange: (options: SendOptions) => void;
  showTimestamps: boolean;
  onToggleTimestamps: () => void;
  showLineNumbers: boolean;
  onToggleLineNumbers: () => void;
}

export interface MacroPanelProps {
  macros: QuickMacro[];
  onSendMacro: (command: string) => Promise<void>;
  onAddMacro: (macro: Omit<QuickMacro, "id">) => void;
  onEditMacro: (id: string, macro: Partial<QuickMacro>) => void;
  onDeleteMacro: (id: string) => void;
  disabled: boolean;
}

export interface StatusBarProps {
  stats: ConnectionStats;
  isConnected: boolean;
  viewMode: ViewMode;
  onViewModeToggle: () => void;
  rxActive?: boolean;
  txActive?: boolean;
  isStandalone?: boolean;
}

export interface AdvancedControlsProps {
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
  onClear: () => void;
  onDownloadLog: () => void;
}

// Utility Types
export interface ParsedSerialData {
  raw: Uint8Array;
  text: string;
  hex: string;
  timestamp: string;
}

// Baud Rate Presets
export const BAUD_RATES = [
  300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200, 230400,
  460800, 921600,
] as const;

export type BaudRate = (typeof BAUD_RATES)[number] | number;

// Default Configurations
export const DEFAULT_SERIAL_CONFIG: SerialConfig = {
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
  flowControl: "none",
  bufferSize: 8192,
};

export const DEFAULT_TERMINAL_OPTIONS: TerminalOptions = {
  fontSize: 14,
  fontFamily: "monospace",
  theme: "default", // Use default theme to support all ANSI colors
  cursorBlink: true,
  cursorStyle: "block",
  scrollback: 1000,
};

export const DEFAULT_SEND_OPTIONS: SendOptions = {
  lineEnding: "crlf",
  localEcho: true,
  sendAsHex: false,
};
