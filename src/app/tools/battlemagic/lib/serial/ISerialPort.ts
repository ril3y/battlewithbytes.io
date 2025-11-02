/**
 * Serial Port Interface
 *
 * Abstract interface for serial communication to enable
 * dependency injection and testing without browser APIs.
 */

export interface SerialPortInfo {
  vendorId?: number;
  productId?: number;
}

export interface SerialConfig {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  flowControl?: 'none' | 'hardware';
}

/**
 * Abstract serial port interface
 */
export interface ISerialPort {
  /**
   * Check if the port is currently connected
   */
  isConnected(): boolean;

  /**
   * Open the serial port with given configuration
   */
  connect(config: SerialConfig): Promise<void>;

  /**
   * Close the serial port
   */
  disconnect(): Promise<void>;

  /**
   * Write data to the serial port
   */
  write(data: Uint8Array): Promise<void>;

  /**
   * Read data from the serial port
   * Returns null when stream ends
   */
  read(): Promise<Uint8Array | null>;

  /**
   * Get port information
   */
  getInfo(): SerialPortInfo;

  /**
   * Set up a data handler for incoming data
   */
  onData(handler: (data: Uint8Array) => void): void;

  /**
   * Set up an error handler
   */
  onError(handler: (error: Error) => void): void;

  /**
   * Remove all event handlers
   */
  removeAllListeners(): void;
}

/**
 * Serial port provider interface
 */
export interface ISerialPortProvider {
  /**
   * Check if serial is supported in this environment
   */
  isSupported(): boolean;

  /**
   * Request user to select a port
   */
  requestPort(filters?: Array<{ usbVendorId?: number; usbProductId?: number }>): Promise<ISerialPort | null>;

  /**
   * Get all previously granted ports
   */
  getPorts(): Promise<ISerialPort[]>;

  /**
   * Find a port matching the given info
   */
  findPort(info: SerialPortInfo): Promise<ISerialPort | null>;
}