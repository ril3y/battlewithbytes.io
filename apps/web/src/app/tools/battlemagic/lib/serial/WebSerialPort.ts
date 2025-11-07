/**
 * Web Serial API Implementation
 *
 * Concrete implementation of ISerialPort using the Web Serial API.
 * This class wraps the browser's native SerialPort for testability.
 */

import { ISerialPort, ISerialPortProvider, SerialPortInfo, SerialConfig } from './ISerialPort';

/**
 * Wrapper for browser's SerialPort
 */
export class WebSerialPort implements ISerialPort {
  private port: SerialPort;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private dataHandlers: Array<(data: Uint8Array) => void> = [];
  private errorHandlers: Array<(error: Error) => void> = [];
  private readingTask: Promise<void> | null = null;
  private connected = false;

  constructor(port: SerialPort) {
    this.port = port;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async connect(config: SerialConfig): Promise<void> {
    if (this.connected) {
      throw new Error('Port is already connected');
    }

    try {
      await this.port.open({
        baudRate: config.baudRate,
        dataBits: config.dataBits || 8,
        stopBits: config.stopBits || 1,
        parity: config.parity || 'none',
        flowControl: config.flowControl || 'none'
      });

      if (!this.port.readable || !this.port.writable) {
        throw new Error('Port is not readable/writable');
      }

      this.reader = this.port.readable.getReader();
      this.writer = this.port.writable.getWriter();
      this.connected = true;

      // Start reading loop
      this.readingTask = this.startReading();
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      // Cancel reading
      if (this.reader) {
        await this.reader.cancel();
        this.reader.releaseLock();
        this.reader = null;
      }

      // Close writer
      if (this.writer) {
        await this.writer.close();
        this.writer.releaseLock();
        this.writer = null;
      }

      // Close port
      await this.port.close();
      this.connected = false;

      // Wait for reading task to complete
      if (this.readingTask) {
        await this.readingTask;
        this.readingTask = null;
      }
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async write(data: Uint8Array): Promise<void> {
    if (!this.connected || !this.writer) {
      throw new Error('Port is not connected');
    }

    try {
      await this.writer.write(data);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async read(): Promise<Uint8Array | null> {
    if (!this.connected || !this.reader) {
      throw new Error('Port is not connected');
    }

    try {
      const { value, done } = await this.reader.read();
      if (done) return null;
      return value || null;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  getInfo(): SerialPortInfo {
    const info = this.port.getInfo();
    return {
      vendorId: info.usbVendorId,
      productId: info.usbProductId
    };
  }

  onData(handler: (data: Uint8Array) => void): void {
    this.dataHandlers.push(handler);
  }

  onError(handler: (error: Error) => void): void {
    this.errorHandlers.push(handler);
  }

  removeAllListeners(): void {
    this.dataHandlers = [];
    this.errorHandlers = [];
  }

  private async startReading(): Promise<void> {
    while (this.connected && this.reader) {
      try {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          this.handleData(value);
        }
      } catch (error) {
        // Check if error is due to disconnection
        if (this.connected) {
          this.handleError(error as Error);
        }
        break;
      }
    }
  }

  private handleData(data: Uint8Array): void {
    for (const handler of this.dataHandlers) {
      try {
        handler(data);
      } catch (error) {
        console.error('Data handler error:', error);
      }
    }
  }

  private handleError(error: Error): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(error);
      } catch (err) {
        console.error('Error handler error:', err);
      }
    }
  }
}

/**
 * Web Serial API Provider
 */
export class WebSerialProvider implements ISerialPortProvider {
  isSupported(): boolean {
    return 'serial' in navigator;
  }

  async requestPort(filters?: Array<{ usbVendorId?: number; usbProductId?: number }>): Promise<ISerialPort | null> {
    if (!this.isSupported()) {
      throw new Error('Web Serial API is not supported in this browser');
    }

    try {
      const port = await navigator.serial.requestPort({ filters: filters || [] });
      return new WebSerialPort(port);
    } catch (error) {
      if ((error as Error).name === 'NotFoundError') {
        // User cancelled
        return null;
      }
      throw error;
    }
  }

  async getPorts(): Promise<ISerialPort[]> {
    if (!this.isSupported()) {
      return [];
    }

    const ports = await navigator.serial.getPorts();
    return ports.map(port => new WebSerialPort(port));
  }

  async findPort(info: SerialPortInfo): Promise<ISerialPort | null> {
    const ports = await this.getPorts();

    for (const port of ports) {
      const portInfo = port.getInfo();
      if (portInfo.vendorId === info.vendorId &&
          portInfo.productId === info.productId) {
        return port;
      }
    }

    return null;
  }
}