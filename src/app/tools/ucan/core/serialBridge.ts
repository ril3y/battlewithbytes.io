/**
 * uCAN Serial Bridge
 *
 * Manages Web Serial API communication with uCAN hardware
 * Adapted from BattleTerm serialUtils.ts
 */

import { SerialConfig, DEFAULT_SERIAL_CONFIG, ConnectionCallback, DeviceInfo } from '../types';
import { parseProtocolLine, ProtocolMessage } from './canProtocol';

/**
 * Check if Web Serial API is supported
 */
export function isSerialSupported(): boolean {
  return 'serial' in navigator;
}

/**
 * Request serial port from user
 */
export async function requestSerialPort(): Promise<SerialPort | null> {
  if (!isSerialSupported()) {
    throw new Error('Web Serial API not supported in this browser');
  }

  try {
    const port = await navigator.serial.requestPort();
    return port;
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') {
      // User cancelled the selection
      return null;
    }
    throw error;
  }
}

/**
 * Get list of already authorized serial ports
 */
export async function getAuthorizedPorts(): Promise<SerialPort[]> {
  if (!isSerialSupported()) {
    return [];
  }

  try {
    return await navigator.serial.getPorts();
  } catch (error) {
    console.error('Error getting authorized ports:', error);
    return [];
  }
}

/**
 * Open serial port with configuration
 */
export async function openSerialPort(
  port: SerialPort,
  config: SerialConfig = DEFAULT_SERIAL_CONFIG
): Promise<void> {
  try {
    await port.open({
      baudRate: config.baudRate,
      dataBits: config.dataBits,
      stopBits: config.stopBits,
      parity: config.parity,
      flowControl: config.flowControl
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to open serial port: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Close serial port
 */
export async function closeSerialPort(port: SerialPort): Promise<void> {
  try {
    if (port.readable) {
      await port.readable.cancel();
    }
    if (port.writable) {
      await port.writable.abort();
    }
    await port.close();
  } catch (error) {
    console.error('Error closing serial port:', error);
    // Don't throw - port may already be closed
  }
}

/**
 * Get device information from port
 */
export function getDeviceInfo(port: SerialPort): DeviceInfo {
  const info = port.getInfo();

  return {
    vendorId: info.usbVendorId,
    productId: info.usbProductId
  };
}

/**
 * Write data to serial port
 */
export async function writeToPort(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: string
): Promise<void> {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(data + '\n'); // Add newline for protocol
  await writer.write(bytes);
}

/**
 * Read from serial port with line buffering
 */
export class SerialReader {
  private lineBuffer: string = '';
  private decoder: TextDecoder = new TextDecoder();
  private onLine: ((line: string) => void) | null = null;
  private onMessage: ((message: ProtocolMessage) => void) | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private isReading: boolean = false;

  constructor(
    onLine?: (line: string) => void,
    onMessage?: (message: ProtocolMessage) => void
  ) {
    this.onLine = onLine || null;
    this.onMessage = onMessage || null;
  }

  /**
   * Start reading from port
   */
  async start(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<void> {
    this.reader = reader;
    this.isReading = true;
    this.lineBuffer = '';

    try {
      while (this.isReading && this.reader) {
        const { value, done } = await this.reader.read();

        if (done) {
          break;
        }

        if (value) {
          this.processData(value);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'NetworkError') {
        // Port disconnected
        console.log('Serial port disconnected');
      } else {
        console.error('Error reading from serial port:', error);
      }
    } finally {
      this.isReading = false;
    }
  }

  /**
   * Stop reading
   */
  stop(): void {
    this.isReading = false;
  }

  /**
   * Process incoming data
   */
  private processData(data: Uint8Array): void {
    const text = this.decoder.decode(data, { stream: true });
    this.lineBuffer += text;

    // Split into lines
    const lines = this.lineBuffer.split('\n');

    // Keep last incomplete line in buffer
    this.lineBuffer = lines.pop() || '';

    // Process complete lines
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        this.handleLine(trimmed);
      }
    }
  }

  /**
   * Handle a complete line
   */
  private handleLine(line: string): void {
    // Call raw line callback
    if (this.onLine) {
      this.onLine(line);
    }

    // Parse protocol message
    const message = parseProtocolLine(line);
    if (message && this.onMessage) {
      this.onMessage(message);
    }
  }
}

/**
 * Serial Bridge Manager
 * High-level interface for managing serial connection
 */
export class SerialBridge {
  private port: SerialPort | null = null;
  private reader: SerialReader | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private readerStream: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private onConnectionChange: ConnectionCallback | null = null;
  private onMessage: ((message: ProtocolMessage) => void) | null = null;

  constructor() {}

  /**
   * Set connection change callback
   */
  setConnectionCallback(callback: ConnectionCallback): void {
    this.onConnectionChange = callback;
  }

  /**
   * Set message callback
   */
  setMessageCallback(callback: (message: ProtocolMessage) => void): void {
    this.onMessage = callback;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.port !== null && this.writer !== null;
  }

  /**
   * Get current port
   */
  getPort(): SerialPort | null {
    return this.port;
  }

  /**
   * Connect to serial port
   */
  async connect(
    port?: SerialPort,
    config: SerialConfig = DEFAULT_SERIAL_CONFIG
  ): Promise<boolean> {
    try {
      // Request port if not provided
      if (!port) {
        const requestedPort = await requestSerialPort();
        if (!requestedPort) {
          return false;
        }
        port = requestedPort;
      }

      // Open port
      await openSerialPort(port, config);

      // Set up reader
      if (port.readable) {
        this.readerStream = port.readable.getReader();
        this.reader = new SerialReader(undefined, (message) => {
          if (this.onMessage) {
            this.onMessage(message);
          }
        });
        this.reader.start(this.readerStream);
      }

      // Set up writer
      if (port.writable) {
        this.writer = port.writable.getWriter();
      }

      this.port = port;

      if (this.onConnectionChange) {
        this.onConnectionChange(true);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Connection error:', errorMessage);

      if (this.onConnectionChange) {
        this.onConnectionChange(false, errorMessage);
      }

      return false;
    }
  }

  /**
   * Disconnect from serial port
   * Must release locks before closing port
   */
  async disconnect(): Promise<void> {
    if (!this.port) {
      console.log('Already disconnected');
      return;
    }

    console.log('Disconnecting...');

    // Stop reader loop first
    if (this.reader) {
      this.reader.stop();
      // Give the reader a moment to finish its current read() operation
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Release reader lock - CRITICAL: must do this before cancel()
    if (this.readerStream) {
      try {
        this.readerStream.releaseLock();
      } catch (error) {
        console.warn('Error releasing reader lock:', error);
      }
    }

    // Release writer lock
    if (this.writer) {
      try {
        this.writer.releaseLock();
      } catch (error) {
        console.warn('Error releasing writer lock:', error);
      }
    }

    // Store port reference and clear state
    const portToClose = this.port;
    this.port = null;
    this.reader = null;
    this.readerStream = null;
    this.writer = null;

    // Now closeSerialPort can cancel/abort the unlocked streams
    try {
      await closeSerialPort(portToClose);
      console.log('✅ Disconnected successfully');
    } catch (error) {
      console.error('Error during disconnect:', error);
    }

    if (this.onConnectionChange) {
      this.onConnectionChange(false);
    }
  }

  /**
   * Send command to device
   */
  async sendCommand(command: string): Promise<void> {
    if (!this.writer) {
      throw new Error('Not connected');
    }

    await writeToPort(this.writer, command);
  }

  /**
   * Send raw bytes to device
   */
  async sendBytes(data: Uint8Array): Promise<void> {
    if (!this.writer) {
      throw new Error('Not connected');
    }

    await this.writer.write(data);
  }
}
