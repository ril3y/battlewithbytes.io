/**
 * Mock Serial Port Implementation
 *
 * Test implementation of ISerialPort for unit testing
 * without requiring browser APIs or actual hardware.
 */

import { ISerialPort, ISerialPortProvider, SerialPortInfo, SerialConfig } from './ISerialPort';

/**
 * Mock serial port for testing
 */
export class MockSerialPort implements ISerialPort {
  private connected = false;
  private dataHandlers: Array<(data: Uint8Array) => void> = [];
  private errorHandlers: Array<(error: Error) => void> = [];
  private mockResponses: Uint8Array[] = [];
  private writeHistory: Uint8Array[] = [];
  private info: SerialPortInfo;
  private config?: SerialConfig;

  constructor(info: SerialPortInfo = { vendorId: 0x1d50, productId: 0x6018 }) {
    this.info = info;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async connect(config: SerialConfig): Promise<void> {
    if (this.connected) {
      throw new Error('Port is already connected');
    }

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 10));

    this.connected = true;
    this.config = config;
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    // Simulate disconnection delay
    await new Promise(resolve => setTimeout(resolve, 10));

    this.connected = false;
    this.config = undefined;
  }

  async write(data: Uint8Array): Promise<void> {
    if (!this.connected) {
      throw new Error('Port is not connected');
    }

    // Store write history for verification in tests
    this.writeHistory.push(new Uint8Array(data));

    // Simulate write delay
    await new Promise(resolve => setTimeout(resolve, 1));
  }

  async read(): Promise<Uint8Array | null> {
    if (!this.connected) {
      throw new Error('Port is not connected');
    }

    // Return mocked response if available
    if (this.mockResponses.length > 0) {
      const response = this.mockResponses.shift()!;

      // Notify data handlers
      for (const handler of this.dataHandlers) {
        handler(response);
      }

      return response;
    }

    // Simulate no data available
    await new Promise(resolve => setTimeout(resolve, 10));
    return null;
  }

  getInfo(): SerialPortInfo {
    return { ...this.info };
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

  // Test helper methods

  /**
   * Queue a mock response to be returned by read()
   */
  mockResponse(data: Uint8Array): void {
    this.mockResponses.push(data);
  }

  /**
   * Queue multiple mock responses
   */
  mockResponses(responses: Uint8Array[]): void {
    this.mockResponses.push(...responses);
  }

  /**
   * Simulate an error
   */
  simulateError(error: Error): void {
    for (const handler of this.errorHandlers) {
      handler(error);
    }
  }

  /**
   * Simulate incoming data
   */
  simulateData(data: Uint8Array): void {
    for (const handler of this.dataHandlers) {
      handler(data);
    }
  }

  /**
   * Get write history for test assertions
   */
  getWriteHistory(): Uint8Array[] {
    return [...this.writeHistory];
  }

  /**
   * Clear write history
   */
  clearWriteHistory(): void {
    this.writeHistory = [];
  }

  /**
   * Get the last configuration used to connect
   */
  getConfig(): SerialConfig | undefined {
    return this.config;
  }
}

/**
 * Mock serial provider for testing
 */
export class MockSerialProvider implements ISerialPortProvider {
  private availablePorts: MockSerialPort[] = [];
  private requestPortResult: MockSerialPort | null = null;
  private requestPortShouldFail = false;

  isSupported(): boolean {
    return true;
  }

  async requestPort(filters?: Array<{ usbVendorId?: number; usbProductId?: number }>): Promise<ISerialPort | null> {
    if (this.requestPortShouldFail) {
      return null;
    }

    if (this.requestPortResult) {
      return this.requestPortResult;
    }

    // Create a new mock port matching the filter
    const vendorId = filters?.[0]?.usbVendorId || 0x1d50;
    const productId = filters?.[0]?.usbProductId || 0x6018;

    const port = new MockSerialPort({ vendorId, productId });
    this.availablePorts.push(port);
    return port;
  }

  async getPorts(): Promise<ISerialPort[]> {
    return [...this.availablePorts];
  }

  async findPort(info: SerialPortInfo): Promise<ISerialPort | null> {
    return this.availablePorts.find(port => {
      const portInfo = port.getInfo();
      return portInfo.vendorId === info.vendorId &&
             portInfo.productId === info.productId;
    }) || null;
  }

  // Test helper methods

  /**
   * Set the port to return when requestPort is called
   */
  setRequestPortResult(port: MockSerialPort | null): void {
    this.requestPortResult = port;
  }

  /**
   * Make requestPort return null (simulate user cancel)
   */
  simulateUserCancel(): void {
    this.requestPortShouldFail = true;
  }

  /**
   * Reset the provider state
   */
  reset(): void {
    this.availablePorts = [];
    this.requestPortResult = null;
    this.requestPortShouldFail = false;
  }

  /**
   * Add a port to available ports
   */
  addAvailablePort(port: MockSerialPort): void {
    this.availablePorts.push(port);
  }
}