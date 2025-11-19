/**
 * @file Base SWO Decoder Class
 * @description Abstract base class for SWO protocol decoders
 *
 * Provides common functionality and interface for concrete decoder implementations.
 * Designed for testability with dependency injection and mockable interfaces.
 */

import {
  SwoPacket,
  PacketEvent,
  DecoderError,
  DecoderOptions,
  DecoderState,
  SwoStatistics,
  PacketType
} from './types';

/**
 * Packet Observer Interface
 * Allows decoupled event handling
 */
export interface IPacketObserver {
  onPacket(event: PacketEvent): void;
  onError?(error: DecoderError): void;
}

/**
 * Abstract Base Decoder
 *
 * Core decoder functionality with template method pattern
 * for protocol-specific implementations.
 */
export abstract class BaseDecoder {
  /** Current decoder state */
  protected state: DecoderState = DecoderState.SYNC_SEARCH;

  /** Input buffer for partial packets */
  protected buffer: Uint8Array;

  /** Current buffer write position */
  protected bufferPos: number = 0;

  /** Registered packet observers */
  protected observers: Set<IPacketObserver> = new Set();

  /** Decoder configuration */
  protected readonly options: Required<Omit<DecoderOptions, 'portFilter'>> & Pick<DecoderOptions, 'portFilter'>;

  /** Statistics tracking */
  protected stats: SwoStatistics;

  /** Sync pattern for protocol */
  protected abstract readonly SYNC_PATTERN: Uint8Array;

  /** Minimum sync bytes required */
  protected abstract readonly MIN_SYNC_BYTES: number;

  /**
   * Creates a new decoder instance
   * @param options Decoder configuration
   */
  constructor(options: DecoderOptions) {
    this.options = {
      encoding: options.encoding,
      autoSync: options.autoSync ?? true,
      maxBufferSize: options.maxBufferSize ?? 4096,
      collectStats: options.collectStats ?? true,
      ...(options.portFilter !== undefined && { portFilter: options.portFilter })
    } as Required<DecoderOptions>;

    this.buffer = new Uint8Array(this.options.maxBufferSize);

    this.stats = {
      packetsReceived: 0,
      packetsByType: new Map<PacketType, number>(),
      syncErrors: 0,
      overflowEvents: 0,
      bytesProcessed: 0,
      startTime: Date.now(),
      lastPacketTime: Date.now()
    };

    // Initialize packet type counters
    Object.values(PacketType).forEach(type => {
      this.stats.packetsByType.set(type as PacketType, 0);
    });
  }

  /**
   * Process incoming data stream
   * @param data Raw input bytes
   */
  public decode(data: Uint8Array): void {
    if (!data || data.length === 0) return;

    // Update statistics
    if (this.options.collectStats) {
      this.stats.bytesProcessed += data.length;
    }

    // Process each byte
    for (let i = 0; i < data.length; i++) {
      this.processByte(data[i]);
    }
  }

  /**
   * Process a single byte based on current state
   * @param byte Input byte
   */
  protected processByte(byte: number): void {
    switch (this.state) {
      case DecoderState.SYNC_SEARCH:
        this.handleSyncSearch(byte);
        break;

      case DecoderState.HEADER:
        this.handleHeader(byte);
        break;

      case DecoderState.PAYLOAD:
        this.handlePayload(byte);
        break;

      case DecoderState.ERROR:
        this.handleError(byte);
        break;
    }
  }

  /**
   * Handle sync pattern search
   * Template method - subclasses provide implementation
   */
  protected abstract handleSyncSearch(byte: number): void;

  /**
   * Handle packet header parsing
   * Template method - subclasses provide implementation
   */
  protected abstract handleHeader(byte: number): void;

  /**
   * Handle packet payload collection
   * Template method - subclasses provide implementation
   */
  protected abstract handlePayload(byte: number): void;

  /**
   * Handle error recovery
   * Default implementation, can be overridden
   */
  protected handleError(byte: number): void {
    // Default: return to sync search
    this.state = DecoderState.SYNC_SEARCH;
    this.resetBuffer();
    this.processByte(byte); // Reprocess byte in new state
  }

  /**
   * Emit a decoded packet to observers
   * @param packet Decoded packet
   */
  protected emitPacket(packet: SwoPacket): void {
    // Update statistics
    if (this.options.collectStats) {
      this.stats.packetsReceived++;
      const count = this.stats.packetsByType.get(packet.type) || 0;
      this.stats.packetsByType.set(packet.type, count + 1);
      this.stats.lastPacketTime = packet.timestamp;
    }

    // Apply port filter if configured
    if (this.shouldFilterPacket(packet)) {
      return;
    }

    // Create event
    const event: PacketEvent = {
      packet,
      timestamp: packet.timestamp,
      port: 'port' in packet ? packet.port : undefined
    };

    // Notify all observers
    this.observers.forEach(observer => {
      try {
        observer.onPacket(event);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }

  /**
   * Emit an error to observers
   * @param error Decoder error
   */
  protected emitError(error: DecoderError): void {
    // Update statistics
    if (this.options.collectStats) {
      if (error.type === 'sync') {
        this.stats.syncErrors++;
      } else if (error.type === 'overflow') {
        this.stats.overflowEvents++;
      }
    }

    // Notify observers with error handlers
    this.observers.forEach(observer => {
      if (observer.onError) {
        try {
          observer.onError(error);
        } catch (err) {
          console.error('Observer error handler failed:', err);
        }
      }
    });
  }

  /**
   * Check if packet should be filtered
   * @param packet Packet to check
   * @returns True if packet should be filtered out
   */
  protected shouldFilterPacket(packet: SwoPacket): boolean {
    const filter = this.options.portFilter;
    if (!filter) return false;

    // Only filter instrumentation packets with ports
    if (packet.type !== PacketType.INSTRUMENTATION) {
      return false;
    }

    const instPacket = packet as { port: number };
    const port = instPacket.port;

    // Convert filter to bitmask
    let enabledMask: number;
    if (Array.isArray(filter.enabledPorts)) {
      enabledMask = filter.enabledPorts.reduce((mask, p) => mask | (1 << p), 0);
    } else {
      enabledMask = filter.enabledPorts;
    }

    // Check if port is enabled
    const isEnabled = (enabledMask & (1 << port)) !== 0;

    // Apply invert logic
    return filter.invert ? isEnabled : !isEnabled;
  }

  /**
   * Reset internal buffer
   */
  protected resetBuffer(): void {
    this.bufferPos = 0;
    this.buffer.fill(0);
  }

  /**
   * Add data to internal buffer
   * @param byte Byte to add
   * @returns True if successful, false if overflow
   */
  protected addToBuffer(byte: number): boolean {
    if (this.bufferPos >= this.options.maxBufferSize) {
      this.emitError({
        type: 'overflow',
        message: 'Buffer overflow',
        context: { bufferSize: this.bufferPos },
        timestamp: Date.now()
      });
      this.resetBuffer();
      return false;
    }

    this.buffer[this.bufferPos++] = byte;
    return true;
  }

  /**
   * Get current buffer contents
   * @returns Buffer slice containing valid data
   */
  protected getBufferContents(): Uint8Array {
    return this.buffer.slice(0, this.bufferPos);
  }

  /**
   * Register a packet observer
   * @param observer Observer to register
   */
  public addObserver(observer: IPacketObserver): void {
    this.observers.add(observer);
  }

  /**
   * Unregister a packet observer
   * @param observer Observer to unregister
   */
  public removeObserver(observer: IPacketObserver): void {
    this.observers.delete(observer);
  }

  /**
   * Clear all observers
   */
  public clearObservers(): void {
    this.observers.clear();
  }

  /**
   * Get current statistics
   * @returns Statistics snapshot
   */
  public getStatistics(): Readonly<SwoStatistics> {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  public resetStatistics(): void {
    this.stats.packetsReceived = 0;
    this.stats.packetsByType.forEach((_, key) => {
      this.stats.packetsByType.set(key, 0);
    });
    this.stats.syncErrors = 0;
    this.stats.overflowEvents = 0;
    this.stats.bytesProcessed = 0;
    this.stats.startTime = Date.now();
    this.stats.lastPacketTime = Date.now();
  }

  /**
   * Reset decoder state
   */
  public reset(): void {
    this.state = DecoderState.SYNC_SEARCH;
    this.resetBuffer();
    this.resetStatistics();
  }

  /**
   * Get current decoder state
   * @returns Current state
   */
  public getState(): DecoderState {
    return this.state;
  }

  /**
   * Set decoder state (for testing)
   * @param state New state
   */
  protected setState(state: DecoderState): void {
    this.state = state;
  }
}