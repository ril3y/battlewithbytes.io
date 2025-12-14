/**
 * GDB Protocol Type Definitions
 *
 * Type definitions for the GDB Remote Serial Protocol (RSP)
 * and Black Magic Probe specific extensions.
 */

/**
 * GDB packet structure
 */
export interface GdbPacket {
  /** Raw packet data without $ and #checksum */
  data: string;
  /** Two-digit hex checksum */
  checksum: string;
}

/**
 * GDB response types
 */
export type GdbResponse =
  | { type: "ok" }
  | { type: "error"; code?: string }
  | { type: "data"; data: string }
  | { type: "signal"; signal: number }
  | { type: "ack" }
  | { type: "nak" }
  | { type: "empty" };

/**
 * Stop reply packet information
 */
export interface StopReply {
  /** Signal number */
  signal: number;
  /** Thread ID if available */
  thread?: number;
  /** Register values if included */
  registers?: Record<number, string>;
  /** Stop reason if available */
  reason?: string;
}

/**
 * Memory read result
 */
export interface MemoryData {
  /** Starting address */
  address: number;
  /** Raw hex data */
  data: string;
}

/**
 * Target information from scan
 */
export interface Target {
  /** Target number for attach command */
  id: number;
  /** Target description/name */
  description: string;
  /** Target type (e.g., 'Cortex-M4', 'STM32') */
  type?: string;
}

/**
 * Black Magic Probe version info
 */
export interface BmpVersion {
  /** Firmware version string */
  firmware: string;
  /** Hardware version */
  hardware?: string;
  /** Git hash if available */
  git?: string;
}

/**
 * Connection state
 */
export enum ConnectionState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  ATTACHED = "attached",
  ERROR = "error",
}

/**
 * Target power state
 */
export enum PowerState {
  ENABLED = "enabled",
  DISABLED = "disabled",
  UNKNOWN = "unknown",
}

/**
 * Debug interface type
 */
export enum DebugInterface {
  SWD = "swd",
  JTAG = "jtag",
}

/**
 * GDB command queue item
 */
export interface QueuedCommand {
  /** Command string to send */
  command: string;
  /** Promise resolver for response */
  resolve: (response: GdbResponse) => void;
  /** Promise rejecter for errors */
  reject: (error: Error) => void;
  /** Timestamp when queued */
  timestamp: number;
  /** Optional timeout in ms */
  timeout?: number;
  /** Timeout handle for cancellation */
  timeoutHandle?: ReturnType<typeof setTimeout>;
}

/**
 * GDB client events
 */
export interface GdbClientEvents {
  /** Connection state changed */
  stateChange: (state: ConnectionState) => void;
  /** Raw data received */
  rawData: (data: string) => void;
  /** Target output received */
  targetOutput: (output: string) => void;
  /** Error occurred */
  error: (error: Error) => void;
  /** Target stopped */
  stopped: (reply: StopReply) => void;
  /** Notification received */
  notification: (data: string) => void;
}

/**
 * Serial port configuration
 */
export interface SerialConfig {
  /** Baud rate (typically ignored for USB CDC) */
  baudRate?: number;
  /** Data bits */
  dataBits?: 7 | 8;
  /** Stop bits */
  stopBits?: 1 | 2;
  /** Parity */
  parity?: "none" | "even" | "odd";
  /** Flow control */
  flowControl?: "none" | "hardware";
}

/**
 * GDB client configuration
 */
export interface GdbClientConfig {
  /** Command timeout in ms */
  commandTimeout?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Maximum command queue size */
  maxQueueSize?: number;
  /** ACK mode (noack mode for faster communication) */
  ackMode?: boolean;
}

/**
 * Register information
 */
export interface RegisterInfo {
  /** Register number */
  number: number;
  /** Register name */
  name: string;
  /** Register size in bytes */
  size: number;
  /** Register value (hex string) */
  value?: string;
}

/**
 * Breakpoint type
 */
export enum BreakpointType {
  SOFTWARE = 0,
  HARDWARE = 1,
  WRITE_WATCHPOINT = 2,
  READ_WATCHPOINT = 3,
  ACCESS_WATCHPOINT = 4,
}

/**
 * Breakpoint information
 */
export interface Breakpoint {
  /** Breakpoint type */
  type: BreakpointType;
  /** Address */
  address: number;
  /** Kind (typically instruction size) */
  kind: number;
}

/**
 * Thread information
 */
export interface ThreadInfo {
  /** Thread ID */
  id: number;
  /** Thread name if available */
  name?: string;
  /** Is currently active thread */
  active?: boolean;
}

/**
 * Execution state
 */
export enum ExecutionState {
  STOPPED = "stopped",
  RUNNING = "running",
  STEPPING = "stepping",
  UNKNOWN = "unknown",
}
