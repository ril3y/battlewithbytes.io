/**
 * Serial Transport Layer for GDB Protocol
 *
 * Wraps the Web Serial API to provide a clean interface for GDB communication.
 * Handles connection management, data transmission, and reception.
 */

import type { SerialConfig } from './types';

// Web Serial API types are defined globally in src/types/web-serial.d.ts

/**
 * Event handler type for received data
 */
type DataHandler = (data: string) => void;

/**
 * Event handler type for errors
 */
type ErrorHandler = (error: Error) => void;

/**
 * Default serial port configuration for Black Magic Probe
 */
const DEFAULT_SERIAL_CONFIG: Required<SerialConfig> = {
  baudRate: 115200, // Ignored for USB CDC but good default
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  flowControl: 'none'
};

/**
 * Serial transport implementation using Web Serial API
 */
export class SerialTransport {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private isReading = false;
  private dataHandlers: DataHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private decoder = new TextDecoder();
  private encoder = new TextEncoder();

  /**
   * Check if Web Serial API is available
   *
   * @returns True if Web Serial API is supported
   */
  static isSupported(): boolean {
    return 'serial' in navigator;
  }

  /**
   * Request user to select a serial port
   *
   * Opens browser dialog for port selection. Requires user gesture.
   *
   * @returns Selected port or null if cancelled
   */
  async requestPort(): Promise<SerialPort | null> {
    try {
      // Filter for Black Magic Probe (VID 0x1d50, PID 0x6018)
      const port = await navigator.serial.requestPort({
        filters: [
          { usbVendorId: 0x1d50, usbProductId: 0x6018 } // Black Magic Probe
        ]
      });
      return port;
    } catch (error) {
      if ((error as Error).name === 'NotFoundError') {
        // User cancelled
        return null;
      }
      throw error;
    }
  }

  /**
   * Get list of previously authorized ports
   *
   * @returns Array of authorized ports
   */
  async getPorts(): Promise<SerialPort[]> {
    return await navigator.serial.getPorts();
  }

  /**
   * Open and connect to a serial port
   *
   * @param port - Serial port to connect to
   * @param config - Serial port configuration
   */
  async connect(port: SerialPort, config: SerialConfig = {}): Promise<void> {
    if (this.port) {
      throw new Error('Already connected to a port');
    }

    const fullConfig = { ...DEFAULT_SERIAL_CONFIG, ...config };

    try {
      await port.open({
        baudRate: fullConfig.baudRate,
        dataBits: fullConfig.dataBits,
        stopBits: fullConfig.stopBits,
        parity: fullConfig.parity,
        flowControl: fullConfig.flowControl
      });

      this.port = port;
      this.startReading();
    } catch (error) {
      throw new Error(`Failed to open serial port: ${(error as Error).message}`);
    }
  }

  /**
   * Disconnect from the serial port
   */
  async disconnect(): Promise<void> {
    this.isReading = false;

    // Cancel reader
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch {
        // Ignore errors during cancel
      }
      this.reader = null;
    }

    // Close writer
    if (this.writer) {
      try {
        await this.writer.close();
      } catch {
        // Ignore errors during close
      }
      this.writer = null;
    }

    // Close port
    if (this.port) {
      try {
        await this.port.close();
      } catch {
        // Ignore errors during close
      }
      this.port = null;
    }
  }

  /**
   * Check if currently connected
   *
   * @returns True if connected to a port
   */
  isConnected(): boolean {
    return this.port !== null;
  }

  /**
   * Send data to the serial port
   *
   * @param data - String data to send
   */
  async send(data: string): Promise<void> {
    if (!this.port) {
      throw new Error('Not connected to a port');
    }

    if (!this.writer) {
      if (!this.port.writable) {
        throw new Error('Port is not writable');
      }
      this.writer = this.port.writable.getWriter();
    }

    const bytes = this.encoder.encode(data);
    await this.writer.write(bytes);
  }

  /**
   * Send raw bytes to the serial port
   *
   * @param data - Byte array to send
   */
  async sendBytes(data: Uint8Array): Promise<void> {
    if (!this.port) {
      throw new Error('Not connected to a port');
    }

    if (!this.writer) {
      if (!this.port.writable) {
        throw new Error('Port is not writable');
      }
      this.writer = this.port.writable.getWriter();
    }

    await this.writer.write(data);
  }

  /**
   * Register a handler for received data
   *
   * @param handler - Callback function for data
   */
  onData(handler: DataHandler): void {
    this.dataHandlers.push(handler);
  }

  /**
   * Remove a data handler
   *
   * @param handler - Handler to remove
   */
  offData(handler: DataHandler): void {
    this.dataHandlers = this.dataHandlers.filter(h => h !== handler);
  }

  /**
   * Register a handler for errors
   *
   * @param handler - Callback function for errors
   */
  onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Remove an error handler
   *
   * @param handler - Handler to remove
   */
  offError(handler: ErrorHandler): void {
    this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
  }

  /**
   * Start reading from the serial port
   *
   * Runs continuously until disconnected.
   */
  private async startReading(): Promise<void> {
    if (!this.port || !this.port.readable) {
      return;
    }

    this.isReading = true;
    this.reader = this.port.readable.getReader();

    try {
      while (this.isReading) {
        const { value, done } = await this.reader.read();

        if (done) {
          break;
        }

        if (value) {
          const text = this.decoder.decode(value, { stream: true });
          this.notifyDataHandlers(text);
        }
      }
    } catch (error) {
      if (this.isReading) {
        // Only report error if we're still supposed to be reading
        this.notifyErrorHandlers(error as Error);
      }
    } finally {
      if (this.reader) {
        this.reader.releaseLock();
        this.reader = null;
      }
    }
  }

  /**
   * Notify all registered data handlers
   *
   * @param data - Data to send to handlers
   */
  private notifyDataHandlers(data: string): void {
    for (const handler of this.dataHandlers) {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in data handler:', error);
      }
    }
  }

  /**
   * Notify all registered error handlers
   *
   * @param error - Error to send to handlers
   */
  private notifyErrorHandlers(error: Error): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(error);
      } catch (err) {
        console.error('Error in error handler:', err);
      }
    }
  }

  /**
   * Get information about the connected port
   *
   * @returns Port info or null if not connected
   */
  getPortInfo(): SerialPortInfo | null {
    return this.port?.getInfo() ?? null;
  }

  /**
   * Set control signals (DTR, RTS)
   *
   * @param signals - Signals to set
   */
  async setSignals(signals: SerialOutputSignals): Promise<void> {
    if (!this.port) {
      throw new Error('Not connected to a port');
    }
    await this.port.setSignals(signals);
  }

  /**
   * Get current control signals
   *
   * @returns Current signal states
   */
  async getSignals(): Promise<SerialInputSignals> {
    if (!this.port) {
      throw new Error('Not connected to a port');
    }
    return await this.port.getSignals();
  }
}
