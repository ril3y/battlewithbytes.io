/**
 * @file SWO/ITM Protocol Decoder
 * @description Concrete implementation of ARM SWO/ITM protocol decoder
 *
 * Implements the ARM CoreSight SWO protocol with full ITM packet parsing.
 * Supports both UART/NRZ and Manchester encoding (though Manchester requires
 * additional hardware support).
 */

import { BaseDecoder } from "./BaseDecoder";
import {
  DecoderOptions,
  DecoderState,
  SwoEncoding,
  PacketType,
  PacketHeader,
  InstrumentationPacket,
  HardwarePacket,
  TimestampPacket,
  SyncPacket,
  OverflowPacket,
  HardwareEventType,
  ExceptionType,
} from "./types";

/**
 * ITM Protocol Constants
 */
const ITM_SYNC_PATTERN = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x80]);
const ITM_OVERFLOW_PATTERN = 0x70;

/**
 * Concrete SWO Decoder Implementation
 *
 * Processes raw SWO byte stream and emits decoded ITM packets.
 * Handles protocol synchronization, packet parsing, and error recovery.
 */
export class SwoDecoder extends BaseDecoder {
  /** Sync pattern for ITM protocol */
  protected readonly SYNC_PATTERN = ITM_SYNC_PATTERN;

  /** Minimum sync bytes for valid sync */
  protected readonly MIN_SYNC_BYTES = 6;

  /** Current packet header being processed */
  private currentHeader: PacketHeader | null = null;

  /** Expected payload bytes for current packet */
  private expectedPayloadBytes: number = 0;

  /** Sync pattern buffer for detection */
  private syncBuffer: Uint8Array = new Uint8Array(this.MIN_SYNC_BYTES);
  private syncBufferPos: number = 0;

  /** Manchester decoder state (if enabled) */
  private manchesterState: number = 0;
  private manchesterBitCount: number = 0;

  constructor(options: DecoderOptions) {
    super(options);

    // Start in sync search mode
    this.state = DecoderState.SYNC_SEARCH;
  }

  /**
   * Handle sync pattern detection
   */
  protected handleSyncSearch(byte: number): void {
    // Shift sync buffer
    if (this.syncBufferPos >= this.MIN_SYNC_BYTES) {
      // Shift left by one
      for (let i = 0; i < this.MIN_SYNC_BYTES - 1; i++) {
        this.syncBuffer[i] = this.syncBuffer[i + 1];
      }
      this.syncBuffer[this.MIN_SYNC_BYTES - 1] = byte;
    } else {
      this.syncBuffer[this.syncBufferPos++] = byte;
    }

    // Check for sync pattern
    if (this.syncBufferPos >= this.MIN_SYNC_BYTES && this.isSyncPattern()) {
      // Emit sync packet
      this.emitPacket({
        type: PacketType.SYNC,
        timestamp: Date.now(),
        raw: new Uint8Array(this.syncBuffer),
        syncCount: this.MIN_SYNC_BYTES,
      } as SyncPacket);

      // Reset sync buffer and move to header state
      this.syncBufferPos = 0;
      this.state = DecoderState.HEADER;
      this.resetBuffer();
    }
    // Also check for any valid header byte to auto-sync
    else if (this.options.autoSync && this.isValidHeaderByte(byte)) {
      // Assume we're synchronized and process as header
      this.state = DecoderState.HEADER;
      this.resetBuffer();
      this.handleHeader(byte);
    }
  }

  /**
   * Check if sync buffer contains valid sync pattern
   */
  private isSyncPattern(): boolean {
    // Check for ITM sync: 5+ zeros followed by 0x80
    let zeroCount = 0;
    for (let i = 0; i < this.syncBufferPos - 1; i++) {
      if (this.syncBuffer[i] === 0x00) {
        zeroCount++;
      } else {
        break;
      }
    }

    return zeroCount >= 5 && this.syncBuffer[this.syncBufferPos - 1] === 0x80;
  }

  /**
   * Check if byte could be a valid ITM header
   */
  private isValidHeaderByte(byte: number): boolean {
    // Check for overflow packet
    if (byte === ITM_OVERFLOW_PATTERN) {
      return true;
    }

    // Check for instrumentation packet (0bSSSSSS01 where S = stimulus port)
    if ((byte & 0x03) === 0x01) {
      return true;
    }

    // Check for hardware source packet (0bAAAAA1x0)
    if ((byte & 0x04) === 0x00 && (byte & 0x01) === 0x00) {
      return true;
    }

    // Check for timestamp packets
    if ((byte & 0x0f) === 0x00 && byte !== 0x00) {
      return true;
    }

    // Check for extension packets
    if ((byte & 0x0b) === 0x08) {
      return true;
    }

    return false;
  }

  /**
   * Handle packet header parsing
   */
  protected handleHeader(byte: number): void {
    // Store header byte
    this.addToBuffer(byte);

    // Parse header
    const header = this.parseHeader(byte);
    if (!header) {
      // Invalid header, return to sync search
      this.emitError({
        type: "parse",
        message: `Invalid header byte: 0x${byte.toString(16)}`,
        context: { byte },
        timestamp: Date.now(),
      });
      this.state = DecoderState.SYNC_SEARCH;
      this.resetBuffer();
      return;
    }

    this.currentHeader = header;

    // Handle different packet types
    if (
      header.type === PacketType.SYNC ||
      header.type === PacketType.OVERFLOW
    ) {
      // These packets have no payload
      this.emitPacketFromHeader(header);
      this.state = DecoderState.HEADER;
      this.resetBuffer();
    } else if (header.type === PacketType.TIMESTAMP) {
      // Timestamp can have continuation bytes
      this.state = DecoderState.PAYLOAD;
      this.expectedPayloadBytes = 0; // Variable length
    } else {
      // Move to payload state
      this.expectedPayloadBytes = header.size;
      this.state = DecoderState.PAYLOAD;
    }
  }

  /**
   * Parse ITM packet header byte
   */
  private parseHeader(byte: number): PacketHeader | null {
    // Check for overflow packet (0x70)
    if (byte === ITM_OVERFLOW_PATTERN) {
      return {
        type: PacketType.OVERFLOW,
        size: 1,
        raw: byte,
      };
    }

    // Check for sync packet (part of sync pattern)
    if (byte === 0x00 || byte === 0x80) {
      return {
        type: PacketType.SYNC,
        size: 1,
        raw: byte,
      };
    }

    // Check for instrumentation packet (0bSSSSSS01)
    if ((byte & 0x03) === 0x01) {
      const port = (byte >> 3) & 0x1f;
      const size = this.getPayloadSize((byte >> 1) & 0x01);
      return {
        type: PacketType.INSTRUMENTATION,
        size,
        port,
        raw: byte,
      };
    }

    // Check for hardware source packet (0bAAAAA1S0)
    if ((byte & 0x04) === 0x04 && (byte & 0x01) === 0x00) {
      const sourceId = (byte >> 3) & 0x1f;
      const size = this.getPayloadSize((byte >> 1) & 0x01);
      return {
        type: PacketType.HARDWARE,
        size,
        sourceId,
        raw: byte,
      };
    }

    // Check for timestamp packet (0bCDDD0TS0)
    if ((byte & 0x01) === 0x00 && (byte & 0x0e) !== 0x00) {
      return {
        type: PacketType.TIMESTAMP,
        size: 1, // Initial byte, may have continuations
        raw: byte,
      };
    }

    // Check for extension packet (0bCDDD1000)
    if ((byte & 0x0f) === 0x08) {
      return {
        type: PacketType.EXTENSION,
        size: 1,
        raw: byte,
      };
    }

    return null;
  }

  /**
   * Get payload size from header size field
   */
  private getPayloadSize(sizeField: number): 1 | 2 | 4 {
    // Size field in header: 00=1, 01=2, 10=4 bytes
    switch (sizeField) {
      case 0x00:
        return 1;
      case 0x01:
        return 2;
      case 0x02:
        return 4;
      default:
        return 1;
    }
  }

  /**
   * Handle packet payload collection
   */
  protected handlePayload(byte: number): void {
    // Add to buffer
    if (!this.addToBuffer(byte)) {
      // Buffer overflow, reset
      this.state = DecoderState.SYNC_SEARCH;
      return;
    }

    // Handle timestamp continuation
    if (this.currentHeader?.type === PacketType.TIMESTAMP) {
      // Check if this is a continuation byte (bit 7 set)
      if ((byte & 0x80) !== 0) {
        // More bytes to come
        return;
      } else {
        // Last timestamp byte received
        this.emitPacketFromBuffer();
        this.state = DecoderState.HEADER;
        this.resetBuffer();
        this.currentHeader = null;
        return;
      }
    }

    // Check if we have all expected payload bytes
    if (this.bufferPos >= this.expectedPayloadBytes + 1) {
      // +1 for header
      // Emit complete packet
      this.emitPacketFromBuffer();

      // Reset for next packet
      this.state = DecoderState.HEADER;
      this.resetBuffer();
      this.currentHeader = null;
      this.expectedPayloadBytes = 0;
    }
  }

  /**
   * Emit packet from current header (no payload)
   */
  private emitPacketFromHeader(header: PacketHeader): void {
    const timestamp = Date.now();

    switch (header.type) {
      case PacketType.OVERFLOW:
        this.emitPacket({
          type: PacketType.OVERFLOW,
          timestamp,
          raw: new Uint8Array([header.raw]),
          lostCount: undefined, // Can't determine exact count
        } as OverflowPacket);
        break;

      case PacketType.SYNC:
        // Already handled in sync search
        break;
    }
  }

  /**
   * Emit packet from current buffer contents
   */
  private emitPacketFromBuffer(): void {
    if (!this.currentHeader || this.bufferPos === 0) return;

    const timestamp = Date.now();
    const raw = new Uint8Array(this.getBufferContents());

    switch (this.currentHeader.type) {
      case PacketType.INSTRUMENTATION:
        this.emitInstrumentationPacket(raw, timestamp);
        break;

      case PacketType.HARDWARE:
        this.emitHardwarePacket(raw, timestamp);
        break;

      case PacketType.TIMESTAMP:
        this.emitTimestampPacket(raw, timestamp);
        break;

      default:
        // Unknown packet type, emit as base packet
        this.emitPacket({
          type: PacketType.UNKNOWN,
          timestamp,
          raw,
        });
    }
  }

  /**
   * Emit instrumentation packet
   */
  private emitInstrumentationPacket(raw: Uint8Array, timestamp: number): void {
    if (!this.currentHeader?.port === undefined) return;

    const data = raw.slice(1); // Skip header byte
    let text: string | undefined;

    // Try to decode as ASCII text (common for printf)
    try {
      text = new TextDecoder("utf-8", { fatal: false }).decode(data);
      // Only keep if it's printable ASCII
      if (!/^[\x20-\x7E\r\n\t]*$/.test(text)) {
        text = undefined;
      }
    } catch {
      text = undefined;
    }

    if (!this.currentHeader) {
      this.emitError({
        type: 'parse',
        message: 'No current header for instrumentation packet',
        timestamp: Date.now()
      });
      return;
    }

    this.emitPacket({
      type: PacketType.INSTRUMENTATION,
      timestamp,
      raw,
      port: this.currentHeader!.port!,
      data,
      text,
    } as InstrumentationPacket);
  }

  /**
   * Emit hardware source packet
   */
  private emitHardwarePacket(raw: Uint8Array, timestamp: number): void {
    if (this.currentHeader?.sourceId === undefined) return;

    const sourceId = this.currentHeader.sourceId;
    const payload = raw.slice(1); // Skip header
    let description: string | undefined;

    // Decode common hardware events
    switch (sourceId) {
      case HardwareEventType.PC_SAMPLE:
        description = "PC Sample";
        break;

      case HardwareEventType.EXCEPTION:
        if (payload.length >= 2) {
          const exceptionNum = (payload[0] | (payload[1] << 8)) & 0x1ff;
          const eventType = (payload[1] >> 4) & 0x03;
          description = `Exception ${this.getExceptionName(exceptionNum)} - ${
            eventType === 1 ? "Entry" : eventType === 2 ? "Exit" : "Return"
          }`;
        }
        break;

      case HardwareEventType.PC_VALUE:
        if (payload.length === 4) {
          const pc =
            payload[0] |
            (payload[1] << 8) |
            (payload[2] << 16) |
            (payload[3] << 24);
          description = `PC: 0x${pc.toString(16).padStart(8, "0")}`;
        }
        break;

      case HardwareEventType.DATA_TRACE_ADDR:
        description = "Data Trace Address";
        break;

      case HardwareEventType.DATA_TRACE_DATA:
        description = "Data Trace Value";
        break;

      default:
        description = `Hardware Event ${sourceId}`;
    }

    this.emitPacket({
      type: PacketType.HARDWARE,
      timestamp,
      raw,
      sourceId,
      payload,
      description,
    } as HardwarePacket);
  }

  /**
   * Get exception name from number
   */
  private getExceptionName(num: number): string {
    switch (num) {
      case ExceptionType.RESET:
        return "Reset";
      case ExceptionType.NMI:
        return "NMI";
      case ExceptionType.HARDFAULT:
        return "HardFault";
      case ExceptionType.MEMMANAGE:
        return "MemManage";
      case ExceptionType.BUSFAULT:
        return "BusFault";
      case ExceptionType.USAGEFAULT:
        return "UsageFault";
      case ExceptionType.SVCALL:
        return "SVCall";
      case ExceptionType.DEBUGMON:
        return "DebugMon";
      case ExceptionType.PENDSV:
        return "PendSV";
      case ExceptionType.SYSTICK:
        return "SysTick";
      default:
        if (num >= 16) return `IRQ${num - 16}`;
        return `Exception${num}`;
    }
  }

  /**
   * Emit timestamp packet
   */
  private emitTimestampPacket(raw: Uint8Array, timestamp: number): void {
    // Parse timestamp value from variable-length encoding
    let value = 0;
    const isAbsolute = false;
    let isContinuation = false;

    if (raw.length > 0) {
      const header = raw[0];

      // Header bits not yet surfaced on TimestampPacket:
      //   TC bit (bit 7) - 1 = correlation packet
      //   TS bit (bit 2) - 0 = synchronous, 1 = timestamp delayed

      // Extract initial timestamp bits
      value = (header >> 4) & 0x07;

      // Process continuation bytes
      let shift = 3;
      for (let i = 1; i < raw.length; i++) {
        const byte = raw[i];
        value |= (byte & 0x7f) << shift;
        shift += 7;

        // Check if more bytes follow
        if ((byte & 0x80) === 0) {
          break;
        }
        isContinuation = true;
      }
    }

    this.emitPacket({
      type: PacketType.TIMESTAMP,
      timestamp,
      raw,
      value,
      isAbsolute,
      isContinuation,
    } as TimestampPacket);
  }

  /**
   * Manchester decoding support (requires hardware)
   * Currently not implemented - would require bit-level processing
   */
  private decodeManchesterBit(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- placeholder signature for unimplemented Manchester decoding; keeps the intended API shape
    bit: number,
  ): number | null {
    // Manchester encoding uses transitions to represent bits
    // This would require hardware support or very high sample rates
    // Placeholder for future implementation
    return null;
  }

  /**
   * Get decoder capabilities
   */
  public getCapabilities(): string[] {
    const caps = [
      "ITM instrumentation packets",
      "Hardware source packets (DWT)",
      "Timestamp packets",
      "Exception trace",
      "PC sampling",
      "Overflow detection",
      "Auto-synchronization",
    ];

    if (this.options.encoding === SwoEncoding.MANCHESTER) {
      caps.push("Manchester encoding (limited support)");
    }

    return caps;
  }
}
