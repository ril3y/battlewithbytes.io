/**
 * Mock SerialTransport for testing GdbClient
 * Simulates serial port communication without requiring actual hardware
 */

import type { SerialConfig } from "../../lib/gdb/types";

type DataHandler = (data: string) => void;
type ErrorHandler = (error: Error) => void;

export class MockSerialTransport {
  private port: SerialPort | null = null;
  private _connected = false;
  private isReading = false;
  private dataHandlers: DataHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private sentData: string[] = [];
  private responseQueue: string[] = [];

  constructor() {
    this.port = null;
    this._connected = false;
  }

  static isSupported(): boolean {
    return true;
  }

  async requestPort(): Promise<SerialPort | null> {
    return null;
  }

  async getPorts(): Promise<SerialPort[]> {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async connect(port: SerialPort, config: SerialConfig = {}): Promise<void> {
    this.port = port;
    this._connected = true;
    this.isReading = true;
    this.startReading();
  }

  async disconnect(): Promise<void> {
    this.isReading = false;
    this._connected = false;
    this.port = null;
  }

  isConnected(): boolean {
    return this._connected;
  }

  isConnectedStatus(): boolean {
    return this._connected;
  }

  async send(data: string): Promise<void> {
    if (!this._connected) {
      throw new Error("Not connected to a port");
    }
    this.sentData.push(data);
  }

  async sendBytes(data: Uint8Array): Promise<void> {
    if (!this._connected) {
      throw new Error("Not connected to a port");
    }
    const text = new TextDecoder().decode(data);
    this.sentData.push(text);
  }

  onData(handler: DataHandler): void {
    this.dataHandlers.push(handler);
  }

  offData(handler: DataHandler): void {
    this.dataHandlers = this.dataHandlers.filter((h) => h !== handler);
  }

  onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  offError(handler: ErrorHandler): void {
    this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
  }

  getPortInfo(): SerialPortInfo | null {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setSignals(signals: SerialOutputSignals): Promise<void> {
    // No-op for mock
  }

  async getSignals(): Promise<SerialInputSignals> {
    return { dsr: false, cts: false } as SerialInputSignals;
  }

  // Test helpers
  getSentData(): string[] {
    return [...this.sentData];
  }

  clearSentData(): void {
    this.sentData = [];
  }

  queueResponse(data: string): void {
    this.responseQueue.push(data);
  }

  private async startReading(): Promise<void> {
    // Simulate receiving queued responses
    while (this.isReading && this.responseQueue.length > 0) {
      const response = this.responseQueue.shift()!;
      this.notifyDataHandlers(response);
      // Small delay to allow processing
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  private notifyDataHandlers(data: string): void {
    for (const handler of this.dataHandlers) {
      try {
        handler(data);
      } catch (error) {
        console.error("Error in data handler:", error);
      }
    }
  }

  private notifyErrorHandlers(error: Error): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(error);
      } catch (err) {
        console.error("Error in error handler:", err);
      }
    }
  }
}
