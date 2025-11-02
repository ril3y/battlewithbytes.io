/**
 * @file SWO/ITM Type Definitions
 * @description Core type definitions for ARM SWO/ITM protocol implementation
 *
 * This module provides type-safe definitions for the Serial Wire Output protocol,
 * including ITM (Instrumentation Trace Macrocell) packet structures.
 */

/**
 * ITM Stimulus Port Range
 * ARM Cortex-M supports 32 stimulus ports (0-31)
 */
export const ITM_PORT_COUNT = 32;

/**
 * SWO Protocol Encoding Types
 */
export enum SwoEncoding {
  /** UART/NRZ encoding - most common, simpler */
  UART_NRZ = 'uart',
  /** Manchester encoding - more robust, requires 2x bandwidth */
  MANCHESTER = 'manchester'
}

/**
 * ITM Packet Types
 * Based on ARM CoreSight Architecture
 */
export enum PacketType {
  /** Instrumentation packet - printf-style output */
  INSTRUMENTATION = 'instrumentation',
  /** Hardware source packet - DWT, ITM events */
  HARDWARE = 'hardware',
  /** Timestamp packet - relative or absolute timing */
  TIMESTAMP = 'timestamp',
  /** Synchronization packet - protocol sync */
  SYNC = 'sync',
  /** Extension packet - future use */
  EXTENSION = 'extension',
  /** Overflow packet - data loss indicator */
  OVERFLOW = 'overflow',
  /** Unknown/malformed packet */
  UNKNOWN = 'unknown'
}

/**
 * ITM Packet Header Structure
 * First byte determines packet type and properties
 */
export interface PacketHeader {
  /** Packet type classification */
  type: PacketType;
  /** Payload size in bytes (1, 2, or 4) */
  size: 1 | 2 | 4;
  /** ITM stimulus port number (0-31) */
  port?: number;
  /** Hardware source ID for HW packets */
  sourceId?: number;
  /** Raw header byte */
  raw: number;
}

/**
 * Base Packet Interface
 * All packet types extend this interface
 */
export interface BasePacket {
  /** Packet classification */
  type: PacketType;
  /** Reception timestamp (milliseconds) */
  timestamp: number;
  /** Raw packet bytes */
  raw: Uint8Array;
}

/**
 * Instrumentation Packet
 * Carries application printf/debug output
 */
export interface InstrumentationPacket extends BasePacket {
  type: PacketType.INSTRUMENTATION;
  /** ITM stimulus port (0-31) */
  port: number;
  /** Payload data */
  data: Uint8Array;
  /** Decoded text if ASCII */
  text?: string;
}

/**
 * Hardware Source Packet
 * DWT (Data Watchpoint and Trace) events
 */
export interface HardwarePacket extends BasePacket {
  type: PacketType.HARDWARE;
  /** Hardware source identifier */
  sourceId: number;
  /** Event-specific payload */
  payload: Uint8Array;
  /** Decoded event description */
  description?: string;
}

/**
 * Timestamp Packet
 * Provides timing information for trace
 */
export interface TimestampPacket extends BasePacket {
  type: PacketType.TIMESTAMP;
  /** Timestamp value (ticks) */
  value: number;
  /** True if absolute time, false if delta */
  isAbsolute: boolean;
  /** Continuation of previous timestamp */
  isContinuation: boolean;
}

/**
 * Synchronization Packet
 * Protocol synchronization marker
 */
export interface SyncPacket extends BasePacket {
  type: PacketType.SYNC;
  /** Number of sync bytes */
  syncCount: number;
}

/**
 * Overflow Packet
 * Indicates trace data loss
 */
export interface OverflowPacket extends BasePacket {
  type: PacketType.OVERFLOW;
  /** Estimated lost packets */
  lostCount?: number;
}

/**
 * Union type for all packet types
 */
export type SwoPacket =
  | InstrumentationPacket
  | HardwarePacket
  | TimestampPacket
  | SyncPacket
  | OverflowPacket
  | BasePacket;

/**
 * SWO Configuration Parameters
 */
export interface SwoConfig {
  /** Protocol encoding type */
  encoding: SwoEncoding;
  /** SWO baud rate */
  baudRate: number;
  /** CPU core frequency in Hz */
  cpuFrequency: number;
  /** Enable timestamp generation */
  timestampEnable: boolean;
  /** Timestamp prescaler (0-3) */
  timestampPrescale: 0 | 1 | 2 | 3;
  /** Enabled ITM ports bitmask */
  enabledPorts: number;
}

/**
 * SWO Statistics
 */
export interface SwoStatistics {
  /** Total packets received */
  packetsReceived: number;
  /** Packets by type */
  packetsByType: Map<PacketType, number>;
  /** Sync errors detected */
  syncErrors: number;
  /** Overflow events */
  overflowEvents: number;
  /** Bytes processed */
  bytesProcessed: number;
  /** Start time */
  startTime: number;
  /** Last packet time */
  lastPacketTime: number;
}

/**
 * Hardware Event Types (DWT)
 */
export enum HardwareEventType {
  /** PC sampling event */
  PC_SAMPLE = 0,
  /** Exception trace */
  EXCEPTION = 1,
  /** PC value packet */
  PC_VALUE = 2,
  /** Data trace - address offset */
  DATA_TRACE_ADDR = 8,
  /** Data trace - data value */
  DATA_TRACE_DATA = 10
}

/**
 * Exception Types
 */
export enum ExceptionType {
  /** Thread mode */
  THREAD = 0,
  /** Reset */
  RESET = 1,
  /** Non-maskable interrupt */
  NMI = 2,
  /** Hard fault */
  HARDFAULT = 3,
  /** Memory management fault */
  MEMMANAGE = 4,
  /** Bus fault */
  BUSFAULT = 5,
  /** Usage fault */
  USAGEFAULT = 6,
  /** SVCall */
  SVCALL = 11,
  /** Debug monitor */
  DEBUGMON = 12,
  /** PendSV */
  PENDSV = 14,
  /** SysTick */
  SYSTICK = 15
}

/**
 * Decoder State Machine States
 */
export enum DecoderState {
  /** Waiting for sync pattern */
  SYNC_SEARCH = 'sync_search',
  /** Reading packet header */
  HEADER = 'header',
  /** Reading packet payload */
  PAYLOAD = 'payload',
  /** Error recovery */
  ERROR = 'error'
}

/**
 * Port Filter Configuration
 */
export interface PortFilter {
  /** Enabled ports (bitmask or array) */
  enabledPorts: number | number[];
  /** Invert filter (exclude instead of include) */
  invert?: boolean;
}

/**
 * Decoder Options
 */
export interface DecoderOptions {
  /** Protocol encoding */
  encoding: SwoEncoding;
  /** Enable auto-sync detection */
  autoSync?: boolean;
  /** Port filtering */
  portFilter?: PortFilter;
  /** Maximum buffer size */
  maxBufferSize?: number;
  /** Enable statistics collection */
  collectStats?: boolean;
}

/**
 * Packet Event for Observer Pattern
 */
export interface PacketEvent {
  /** Decoded packet */
  packet: SwoPacket;
  /** Port number if applicable */
  port?: number;
  /** Event timestamp */
  timestamp: number;
}

/**
 * Decoder Error Event
 */
export interface DecoderError {
  /** Error type */
  type: 'sync' | 'parse' | 'overflow' | 'unknown';
  /** Error message */
  message: string;
  /** Context data */
  context?: unknown;
  /** Error timestamp */
  timestamp: number;
}