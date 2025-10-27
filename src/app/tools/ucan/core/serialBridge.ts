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

    // CRITICAL: Set DTR/RTS to false to prevent board reset and slow transmission
    // Many Arduino-compatible boards (like Feather M4 CAN) reset when DTR goes HIGH
    console.log('🔧 Setting DTR/RTS signals to false...');
    try {
      await port.setSignals({
        dataTerminalReady: false,
        requestToSend: false
      });
      console.log('✅ DTR/RTS signals set successfully');
    } catch (signalError) {
      console.warn('⚠️ Could not set DTR/RTS signals:', signalError);
      // Don't throw - some platforms may not support this
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to open serial port: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Close serial port
 * Note: reader.cancel() and writer.close() should be called BEFORE this
 * and locks should be released. This just closes the underlying port.
 */
export async function closeSerialPort(port: SerialPort): Promise<void> {
  try {
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
  console.log('📤 SENDING:', data);
  const encoder = new TextEncoder();
  const bytes = encoder.encode(data + '\n'); // Add newline for protocol
  console.log('📤 RAW BYTES:', bytes.length, 'bytes:', Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
  await writer.write(bytes);
  console.log('✅ SENT successfully');
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

    console.log('🚀 SerialReader: Starting read loop...');

    try {
      while (this.isReading && this.reader) {
        console.log('🔄 SerialReader: Waiting for data...');
        const { value, done } = await this.reader.read();

        if (done) {
          console.log('✅ SerialReader: Read loop done');
          break;
        }

        if (value) {
          console.log('📦 SerialReader: Received data chunk');
          this.processData(value);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'NetworkError') {
        // Port disconnected
        console.log('🔌 Serial port disconnected');
      } else {
        console.error('❌ Error reading from serial port:', error);
      }
    } finally {
      console.log('🛑 SerialReader: Read loop exiting, isReading:', this.isReading);
      this.isReading = false;
    }
  }

  /**
   * Stop reading and cancel pending reads
   */
  async stop(): Promise<void> {
    this.isReading = false;

    // Cancel any pending read operation to force read() to resolve immediately
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (error) {
        // Ignore cancel errors (might already be cancelled)
        console.log('Reader cancel (expected):', error instanceof Error ? error.message : error);
      }
    }
  }

  /**
   * Process incoming data
   */
  private processData(data: Uint8Array): void {
    console.log('📥 RAW DATA:', data.length, 'bytes');
    const text = this.decoder.decode(data, { stream: true });
    console.log('📥 DECODED:', text);
    this.lineBuffer += text;

    // Split into lines
    const lines = this.lineBuffer.split('\n');

    // Keep last incomplete line in buffer
    this.lineBuffer = lines.pop() || '';

    // Process complete lines
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        console.log('📥 LINE:', trimmed);
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
      console.log('📨 PARSED MESSAGE:', message.type);
      this.onMessage(message);
    } else {
      console.warn('⚠️ Failed to parse line:', line);
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
    console.log('🔌 SerialBridge: Starting connection...');

    try {
      // Request port if not provided
      if (!port) {
        console.log('📍 SerialBridge: Requesting port from user...');
        const requestedPort = await requestSerialPort();
        if (!requestedPort) {
          console.log('❌ SerialBridge: User cancelled port selection');
          return false;
        }
        port = requestedPort;
      }

      // Open port
      console.log('🔓 SerialBridge: Opening port with config:', config);
      await openSerialPort(port, config);
      console.log('✅ SerialBridge: Port opened successfully');

      // Set up reader
      if (port.readable) {
        console.log('📖 SerialBridge: Setting up reader...');
        this.readerStream = port.readable.getReader();
        this.reader = new SerialReader(undefined, (message) => {
          if (this.onMessage) {
            this.onMessage(message);
          }
        });
        this.reader.start(this.readerStream);
        console.log('✅ SerialBridge: Reader started');
      } else {
        console.warn('⚠️ SerialBridge: Port not readable!');
      }

      // Set up writer
      if (port.writable) {
        console.log('✍️ SerialBridge: Setting up writer...');
        this.writer = port.writable.getWriter();
        console.log('✅ SerialBridge: Writer ready');
      } else {
        console.warn('⚠️ SerialBridge: Port not writable!');
      }

      this.port = port;

      if (this.onConnectionChange) {
        this.onConnectionChange(true);
      }

      console.log('🎉 SerialBridge: Connection complete!');
      return true;
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if port is already open (common after hot reload)
      if (errorMessage.includes('Failed to open serial port')) {
        errorMessage = 'Port already open. Please refresh the page or unplug/replug the device.';
      }

      console.error('❌ SerialBridge: Connection error:', errorMessage);

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

    // Store port reference before clearing state
    const portToClose = this.port;

    // Stop reader loop first - this calls reader.cancel() internally
    if (this.reader) {
      console.log('Stopping reader...');
      await this.reader.stop();
      console.log('Reader stopped, waiting for exit...');
      // Give additional time for the read loop to fully exit
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Release reader lock - safe now because cancel() has completed
    if (this.readerStream) {
      try {
        this.readerStream.releaseLock();
        console.log('✅ Reader lock released');
      } catch (error) {
        console.warn('Error releasing reader lock:', error);
      }
      this.readerStream = null;
    }

    // Close writer gracefully
    if (this.writer) {
      try {
        console.log('Closing writer...');
        await this.writer.close();
        console.log('✅ Writer closed');
      } catch (error) {
        console.warn('Error closing writer:', error);
      }
      this.writer = null;
    }

    // Clear state
    this.port = null;
    this.reader = null;

    // Close the port
    try {
      console.log('Closing port...');
      await closeSerialPort(portToClose);
      console.log('✅ Disconnected successfully');
    } catch (error) {
      console.error('Error during port close:', error);
    }

    // Always notify disconnection, even if close failed
    if (this.onConnectionChange) {
      this.onConnectionChange(false);
    }
  }

  /**
   * Send command to device
   */
  async sendCommand(command: string): Promise<void> {
    console.log('💬 SerialBridge.sendCommand:', command);
    if (!this.writer) {
      console.error('❌ SerialBridge.sendCommand: Not connected!');
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
