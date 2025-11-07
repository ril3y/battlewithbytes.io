/**
 * GDB Client Implementation
 *
 * Main GDB client class that orchestrates the GDB Remote Serial Protocol
 * communication. Manages connection state, command queueing, and event handling.
 *
 * Architecture:
 * - SerialTransport: Handles low-level serial communication
 * - RspProtocol: Encodes/decodes GDB packets
 * - BlackMagicCommands: High-level command builders
 * - GdbClient: Orchestrates everything with async command queue
 */

import { RspProtocol } from './RspProtocol';
import { SerialTransport } from './SerialTransport';
import { BlackMagicCommands } from './BlackMagicCommands';
import { ConnectionState } from './types';
import type {
  GdbResponse,
  GdbClientConfig,
  QueuedCommand,
  Target,
  BmpVersion,
  StopReply,
  SerialConfig
} from './types';

/**
 * Event callback types for GDB client
 */
export interface GdbClientCallbacks {
  onStateChange?: (state: ConnectionState) => void;
  onStopped?: (reply: StopReply) => void;
  onTargetOutput?: (output: string) => void;
  onError?: (error: Error) => void;
  onNotification?: (data: string) => void;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<GdbClientConfig> = {
  commandTimeout: 10000, // 10 seconds for monitor commands
  debug: false,
  maxQueueSize: 100,
  ackMode: false // Default to NoAckMode for faster communication
};

/**
 * Main GDB client class
 *
 * Provides high-level interface for GDB debugging operations with
 * Black Magic Probe specific extensions.
 */
export class GdbClient {
  private transport: SerialTransport;
  private config: Required<GdbClientConfig>;
  private callbacks: GdbClientCallbacks;
  private commandQueue: QueuedCommand[] = [];
  private currentCommand: QueuedCommand | null = null;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private receiveBuffer = '';
  private ackMode = true;
  private pendingAck = false;
  private accumulatedOutput = ''; // Accumulate O packets until OK/ERROR

  /**
   * Create a new GDB client instance
   *
   * @param config - Client configuration
   * @param callbacks - Event callbacks
   */
  constructor(config: GdbClientConfig = {}, callbacks: GdbClientCallbacks = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.callbacks = callbacks;
    this.transport = new SerialTransport();
    // ALWAYS start in ACK mode - GDB protocol requires it initially
    // Will be disabled during initializeConnection if config.ackMode is false
    this.ackMode = true;

    // Setup transport event handlers
    this.transport.onData((data) => this.handleReceivedData(data));
    this.transport.onError((error) => this.handleError(error));
  }

  /**
   * Check if Web Serial API is supported
   *
   * @returns True if supported in this browser
   */
  static isSupported(): boolean {
    return SerialTransport.isSupported();
  }

  /**
   * Request user to select a serial port
   *
   * Opens browser dialog for port selection.
   *
   * @returns Selected port or null if cancelled
   */
  async requestPort(): Promise<SerialPort | null> {
    return this.transport.requestPort();
  }

  /**
   * Get previously authorized ports
   *
   * @returns Array of authorized ports
   */
  async getPorts(): Promise<SerialPort[]> {
    return this.transport.getPorts();
  }

  /**
   * Connect to a serial port
   *
   * @param port - Serial port to connect to
   * @param serialConfig - Serial port configuration
   */
  async connect(port: SerialPort, serialConfig: SerialConfig = {}): Promise<void> {
    if (this.state !== ConnectionState.DISCONNECTED) {
      throw new Error('Already connected');
    }

    try {
      this.setState(ConnectionState.CONNECTING);

      // Connect transport
      await this.transport.connect(port, serialConfig);

      // Give the port a moment to stabilize before sending commands
      // This is especially important for ACK mode initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      // Send initial handshake
      await this.initializeConnection();

      this.setState(ConnectionState.CONNECTED);
    } catch (error) {
      this.setState(ConnectionState.ERROR);
      throw new Error(`Connection failed: ${(error as Error).message}`);
    }
  }

  /**
   * Disconnect from the serial port
   */
  async disconnect(): Promise<void> {
    // Cancel all pending commands
    for (const cmd of this.commandQueue) {
      cmd.reject(new Error('Connection closed'));
    }
    this.commandQueue = [];
    this.currentCommand = null;

    // Disconnect transport
    await this.transport.disconnect();

    this.setState(ConnectionState.DISCONNECTED);
  }

  /**
   * Get current connection state
   *
   * @returns Current state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   *
   * @returns True if connected
   */
  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED || this.state === ConnectionState.ATTACHED;
  }

  /**
   * Scan for SWD targets
   *
   * @returns Array of detected targets and target voltage
   */
  async scanSwd(): Promise<{ targets: Target[]; voltage: number | null }> {
    const cmd = BlackMagicCommands.buildSwdScan();
    const response = await this.sendCommand(cmd);

    if (response.type !== 'data') {
      throw new Error('Failed to scan for SWD targets');
    }

    // response.data is already decoded from O packets - don't decode again!
    const targets = BlackMagicCommands.parseScanResults(response.data);
    const voltage = BlackMagicCommands.parseTargetVoltage(response.data);

    return { targets, voltage };
  }

  /**
   * Scan for JTAG targets
   *
   * @returns Array of detected targets and target voltage
   */
  async scanJtag(): Promise<{ targets: Target[]; voltage: number | null }> {
    const cmd = BlackMagicCommands.buildJtagScan();
    const response = await this.sendCommand(cmd);

    if (response.type !== 'data') {
      throw new Error('Failed to scan for JTAG targets');
    }

    // response.data is already decoded from O packets - don't decode again!
    const targets = BlackMagicCommands.parseScanResults(response.data);
    const voltage = BlackMagicCommands.parseTargetVoltage(response.data);

    return { targets, voltage };
  }

  /**
   * Enable target power
   */
  async enableTargetPower(): Promise<void> {
    const cmd = BlackMagicCommands.buildPowerEnable();
    const response = await this.sendCommand(cmd);

    if (response.type === 'error') {
      throw new Error('Failed to enable target power');
    }
  }

  /**
   * Disable target power
   */
  async disableTargetPower(): Promise<void> {
    const cmd = BlackMagicCommands.buildPowerDisable();
    const response = await this.sendCommand(cmd);

    if (response.type === 'error') {
      throw new Error('Failed to disable target power');
    }
  }

  /**
   * Get Black Magic Probe version
   *
   * @returns Version information
   */
  async getVersion(): Promise<BmpVersion> {
    const cmd = BlackMagicCommands.buildVersionQuery();
    const response = await this.sendCommand(cmd);

    if (response.type !== 'data') {
      throw new Error('Failed to get version');
    }

    const decoded = BlackMagicCommands.decodeMonitorResponse(response.data);
    return BlackMagicCommands.parseVersion(decoded);
  }

  /**
   * Reset the target
   */
  async reset(): Promise<void> {
    const cmd = BlackMagicCommands.buildReset();
    const response = await this.sendCommand(cmd);

    if (response.type === 'error') {
      throw new Error('Failed to reset target');
    }
  }

  /**
   * Attach to a target
   *
   * @param targetId - Target ID from scan results
   */
  async attach(targetId: number): Promise<void> {
    const cmd = BlackMagicCommands.buildAttach(targetId);
    const response = await this.sendCommand(cmd);

    if (response.type === 'error') {
      throw new Error(`Failed to attach to target ${targetId}`);
    }

    this.setState(ConnectionState.ATTACHED);
  }

  /**
   * Detach from the current target
   */
  async detach(): Promise<void> {
    const cmd = BlackMagicCommands.buildDetach();
    const response = await this.sendCommand(cmd);

    if (response.type === 'error') {
      throw new Error('Failed to detach from target');
    }

    this.setState(ConnectionState.CONNECTED);
  }

  /**
   * Continue execution
   *
   * Resumes target execution. Will return when target stops.
   */
  async continue(): Promise<StopReply> {
    const cmd = BlackMagicCommands.buildContinue();
    const response = await this.sendCommand(cmd);

    if (response.type === 'signal') {
      const stopReply: StopReply = {
        signal: response.signal
      };
      this.notifyStopped(stopReply);
      return stopReply;
    }

    throw new Error('Unexpected response to continue command');
  }

  /**
   * Single step execution
   *
   * Executes one instruction and stops.
   */
  async step(): Promise<StopReply> {
    const cmd = BlackMagicCommands.buildStep();
    const response = await this.sendCommand(cmd);

    if (response.type === 'signal') {
      const stopReply: StopReply = {
        signal: response.signal
      };
      this.notifyStopped(stopReply);
      return stopReply;
    }

    throw new Error('Unexpected response to step command');
  }

  /**
   * Halt execution (send Ctrl+C)
   *
   * Interrupts the running target.
   */
  async halt(): Promise<void> {
    // Ctrl+C is sent directly, not as a packet
    await this.transport.send(RspProtocol.INTERRUPT);

    // Wait for stop reply
    // Note: The stop reply will come asynchronously
  }

  /**
   * Read memory from target
   *
   * @param address - Memory address (number or hex string)
   * @param length - Number of bytes to read
   * @returns Memory data as byte array
   */
  async readMemory(address: number | string, length: number): Promise<Uint8Array> {
    const cmd = BlackMagicCommands.buildMemoryRead(address, length);
    const response = await this.sendCommand(cmd);

    if (response.type !== 'data') {
      throw new Error('Failed to read memory');
    }

    return RspProtocol.parseMemoryData(response.data);
  }

  /**
   * Write memory to target
   *
   * @param address - Memory address (number or hex string)
   * @param data - Data bytes to write
   */
  async writeMemory(address: number | string, data: Uint8Array): Promise<void> {
    const cmd = BlackMagicCommands.buildMemoryWrite(address, data);
    const response = await this.sendCommand(cmd);

    if (response.type !== 'ok') {
      throw new Error('Failed to write memory');
    }
  }

  /**
   * Read all registers
   *
   * @returns Hex string of all register values
   */
  async readRegisters(): Promise<string> {
    const cmd = BlackMagicCommands.buildReadRegisters();
    const response = await this.sendCommand(cmd);

    if (response.type !== 'data') {
      throw new Error('Failed to read registers');
    }

    return response.data;
  }

  /**
   * Read a single register
   *
   * @param regNum - Register number
   * @returns Register value as hex string
   */
  async readRegister(regNum: number): Promise<string> {
    const cmd = BlackMagicCommands.buildReadRegister(regNum);
    const response = await this.sendCommand(cmd);

    if (response.type !== 'data') {
      throw new Error(`Failed to read register ${regNum}`);
    }

    return response.data;
  }

  /**
   * Write a single register
   *
   * @param regNum - Register number
   * @param value - Register value (hex string)
   */
  async writeRegister(regNum: number, value: string): Promise<void> {
    const cmd = BlackMagicCommands.buildWriteRegister(regNum, value);
    const response = await this.sendCommand(cmd);

    if (response.type !== 'ok') {
      throw new Error(`Failed to write register ${regNum}`);
    }
  }

  /**
   * Get formatted registers for display
   *
   * @returns Map of register names to values
   */
  async getFormattedRegisters(): Promise<Map<string, number>> {
    const response = await this.readRegisters();
    const registers = new Map<string, number>();

    if (this.config.debug) {
      console.log('[getFormattedRegisters] Raw response:', response);
      console.log('[getFormattedRegisters] Response length:', response.length);
    }

    // ARM Cortex-M register layout (each register is 8 hex chars = 32 bits)
    const regNames = [
      'r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7',
      'r8', 'r9', 'r10', 'r11', 'r12', 'sp', 'lr', 'pc',
      'xpsr', 'msp', 'psp', 'primask', 'basepri', 'faultmask', 'control'
    ];

    let offset = 0;
    for (const name of regNames) {
      if (offset + 8 <= response.length) {
        const hexValue = response.substring(offset, offset + 8);
        if (this.config.debug) {
          console.log(`[getFormattedRegisters] ${name}: hexValue="${hexValue}" (offset=${offset})`);
        }
        // Convert from little-endian hex string
        const bytes = hexValue.match(/.{2}/g);
        if (bytes) {
          const value = parseInt(bytes.reverse().join(''), 16);
          registers.set(name, value);
          if (this.config.debug) {
            console.log(`[getFormattedRegisters] ${name} = 0x${value.toString(16).padStart(8, '0')}`);
          }
        }
        offset += 8;
      }
    }

    return registers;
  }

  /**
   * Get stack backtrace
   *
   * @returns Stack frame information
   */
  async getBacktrace(): Promise<Array<{ level: number; address: number; function?: string }>> {
    // Try to get backtrace using monitor command
    // Note: qfThreadInfo is for thread listing, not backtrace
    // For now, we'll use register-based basic backtrace
    const frames: Array<{ level: number; address: number; function?: string }> = [];

    // For now, return basic frame with PC
    try {
      const regs = await this.getFormattedRegisters();
      const pc = regs.get('pc');
      const lr = regs.get('lr');
      // SP could be used for stack unwinding in future

      if (pc !== undefined) {
        frames.push({ level: 0, address: pc, function: '<current>' });
      }
      if (lr !== undefined) {
        frames.push({ level: 1, address: lr, function: '<return>' });
      }
    } catch {
      // Ignore errors, return empty frames
    }

    return frames;
  }

  /**
   * Insert a breakpoint
   *
   * @param address - Breakpoint address
   * @param hardware - Use hardware breakpoint (default: false)
   */
  async insertBreakpoint(address: number | string, hardware = false): Promise<void> {
    const cmd = BlackMagicCommands.buildInsertBreakpoint(address, hardware);

    if (this.config.debug) {
      console.log('[insertBreakpoint] Command:', cmd, 'Address:', address, 'Hardware:', hardware);
    }

    const response = await this.sendCommand(cmd);

    if (this.config.debug) {
      console.log('[insertBreakpoint] Response:', response);
    }

    if (response.type === 'error') {
      throw new Error(`Failed to insert breakpoint: ${response.code || 'unknown error'}`);
    }

    if (response.type !== 'ok') {
      throw new Error(`Unexpected response type: ${response.type}`);
    }
  }

  /**
   * Remove a breakpoint
   *
   * @param address - Breakpoint address
   * @param hardware - Hardware breakpoint (default: false)
   */
  async removeBreakpoint(address: number | string, hardware = false): Promise<void> {
    const cmd = BlackMagicCommands.buildRemoveBreakpoint(address, hardware);
    const response = await this.sendCommand(cmd);

    if (response.type !== 'ok') {
      throw new Error('Failed to remove breakpoint');
    }
  }

  /**
   * Send a monitor command to the target
   */
  async sendMonitorCommand(command: string): Promise<string> {
    // Convert command to hex for qRcmd
    const hexCmd = Array.from(new TextEncoder().encode(command))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const response = await this.sendCommand(`qRcmd,${hexCmd}`);

    if (response.type === 'ok') {
      return '';
    }

    if (response.type === 'data' && response.data.startsWith('O')) {
      // Output from monitor command
      const hexOutput = response.data.slice(1);
      const bytes = [];
      for (let i = 0; i < hexOutput.length; i += 2) {
        bytes.push(parseInt(hexOutput.substr(i, 2), 16));
      }
      return new TextDecoder().decode(new Uint8Array(bytes));
    }

    if (response.type === 'data') {
      return response.data;
    }

    return '';
  }

  /**
   * Flash operations for programming firmware
   */
  async flashErase(address: number, length: number): Promise<void> {
    // Try vFlashErase command first
    const response = await this.sendCommand(`vFlashErase:${address.toString(16)},${length.toString(16)}`);

    if (response.type === 'ok') {
      return;
    }

    // Fallback to monitor command for Black Magic Probe
    await this.sendMonitorCommand(`erase ${address.toString(16)} ${length.toString(16)}`);
  }

  async flashWrite(address: number, data: Uint8Array): Promise<void> {
    // For Black Magic Probe, we can use regular memory writes
    // BMP handles flash programming automatically
    await this.writeMemory(address, data);
  }

  async flashDone(): Promise<void> {
    // Send vFlashDone to complete flash operations
    const response = await this.sendCommand('vFlashDone');

    // BMP might not support this, which is OK
    if (response.type !== 'ok' && response.type !== 'error') {
      console.warn('vFlashDone not supported by target');
    }
  }

  /**
   * Send a raw GDB command
   *
   * For advanced use cases that aren't covered by high-level methods.
   *
   * @param command - Raw GDB command string (without packet framing)
   * @returns GDB response
   */
  async sendCommand(command: string): Promise<GdbResponse> {
    if (!this.transport.isConnected()) {
      throw new Error('Not connected');
    }

    if (this.commandQueue.length >= this.config.maxQueueSize) {
      throw new Error('Command queue full');
    }

    return new Promise((resolve, reject) => {
      const queuedCommand: QueuedCommand = {
        command,
        resolve,
        reject,
        timestamp: Date.now(),
        timeout: this.config.commandTimeout
      };

      this.commandQueue.push(queuedCommand);
      this.processQueue();
    });
  }

  /**
   * Initialize GDB connection
   *
   * Sends initial handshake and configuration commands.
   */
  private async initializeConnection(): Promise<void> {
    try {
      // Query supported features
      const cmd = BlackMagicCommands.buildQuerySupported();

      if (this.config.debug) {
        console.log('[GDB] Sending qSupported...');
      }

      const response = await this.sendCommand(cmd);

      if (this.config.debug) {
        console.log('[GDB] Supported features:', response);
      }

      // Optionally disable ACK mode for faster communication
      if (!this.config.ackMode) {
        if (this.config.debug) {
          console.log('[GDB] Negotiating NoAckMode...');
        }

        const noAckResponse = await this.sendCommand('QStartNoAckMode');

        if (this.config.debug) {
          console.log('[GDB] NoAckMode response:', noAckResponse);
        }

        // Give a moment for the final ACK to be sent before disabling ACK mode
        await new Promise(resolve => setTimeout(resolve, 50));

        // After successful negotiation, disable ACK mode
        this.ackMode = false;

        if (this.config.debug) {
          console.log('[GDB] NoAckMode enabled');
        }
      }
    } catch (error) {
      console.error('[GDB] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Process command queue
   *
   * Sends the next queued command if no command is currently active.
   */
  private processQueue(): void {
    // Already processing a command
    if (this.currentCommand !== null) {
      return;
    }

    // No commands to process
    if (this.commandQueue.length === 0) {
      return;
    }

    // Get next command
    this.currentCommand = this.commandQueue.shift()!;

    // Send the command
    this.sendPacket(this.currentCommand.command);

    // Setup timeout
    if (this.currentCommand.timeout) {
      this.currentCommand.timeoutHandle = setTimeout(() => {
        if (this.currentCommand) {
          const cmd = this.currentCommand;
          this.currentCommand = null;
          cmd.reject(new Error('Command timeout'));
          this.processQueue();
        }
      }, this.currentCommand.timeout);
    }
  }

  /**
   * Send a GDB packet
   *
   * Encodes the command and sends it over the transport.
   *
   * @param command - Command string to send
   */
  private async sendPacket(command: string): Promise<void> {
    const packet = RspProtocol.encodePacket(command);

    if (this.config.debug) {
      console.log('TX:', packet);
    }

    await this.transport.send(packet);
    this.pendingAck = this.ackMode;
  }

  /**
   * Handle received data from transport
   *
   * Accumulates data in buffer and extracts complete packets.
   *
   * @param data - Received data string
   */
  private handleReceivedData(data: string): void {
    if (this.config.debug && data.length > 0) {
      console.log('RX (raw):', data.split('').map(c =>
        c.charCodeAt(0) < 32 || c.charCodeAt(0) > 126
          ? `[${c.charCodeAt(0).toString(16)}]`
          : c
      ).join(''));
    }

    this.receiveBuffer += data;

    // Extract packets from buffer
    const { packets, remaining } = RspProtocol.extractPackets(this.receiveBuffer);
    this.receiveBuffer = remaining;

    // Process each packet
    for (const packet of packets) {
      this.handlePacket(packet);
    }
  }

  /**
   * Handle a complete packet
   *
   * @param packet - Packet string
   */
  private handlePacket(packet: string): void {
    if (this.config.debug) {
      console.log('RX:', packet);
    }

    // Handle ACK/NAK
    if (packet === RspProtocol.ACK) {
      this.pendingAck = false;
      return;
    }

    if (packet === RspProtocol.NAK) {
      // Retransmit last command
      if (this.currentCommand) {
        this.sendPacket(this.currentCommand.command);
      }
      return;
    }

    // Decode packet
    const decoded = RspProtocol.decodePacket(packet);
    if (!decoded) {
      console.error('Failed to decode packet:', packet);
      // Send NAK if in ACK mode
      if (this.ackMode) {
        this.transport.send(RspProtocol.NAK);
      }
      return;
    }

    // Send ACK if in ACK mode
    if (this.ackMode && packet !== RspProtocol.ACK && packet !== RspProtocol.NAK) {
      if (this.config.debug) {
        console.log('[GDB] Sending ACK');
      }
      // Don't await - send ACK asynchronously but immediately
      this.transport.send(RspProtocol.ACK).catch(err => {
        console.error('[GDB] Failed to send ACK:', err);
      });
    }

    // Parse response
    const response = RspProtocol.parseResponse(decoded.data);

    if (this.config.debug) {
      console.log('[GDB] Parsed response:', response, 'currentCommand:', !!this.currentCommand);
    }

    // Handle notifications (async stop events, etc.)
    if (decoded.data.startsWith('%')) {
      this.handleNotification(decoded.data);
      return;
    }

    // Handle stop replies (T packets)
    if (decoded.data.startsWith('T')) {
      const stopInfo = RspProtocol.parseStopReply(decoded.data);
      const stopReply: StopReply = {
        signal: stopInfo.signal,
        thread: stopInfo.info.thread ? parseInt(stopInfo.info.thread, 16) : undefined
      };

      // If this is a response to a command, resolve it
      if (this.currentCommand) {
        this.currentCommand.resolve(response);
        this.currentCommand = null;
        this.processQueue();
      }

      // Also notify callback
      this.notifyStopped(stopReply);
      return;
    }

    // Console output (O packets - hex-encoded console output)
    // Note: Must check for 'O' followed by hex, not just 'O' to avoid matching 'OK'
    if (decoded.data.startsWith('O') && decoded.data.length > 1 && decoded.data !== 'OK') {
      const hexOutput = decoded.data.substring(1);
      const output = BlackMagicCommands.decodeMonitorResponse(hexOutput);

      // Accumulate output - DON'T notify yet, wait for OK packet
      this.accumulatedOutput += output;

      // Return without notifying - will notify once when command completes
      return;
    }

    // Regular command response
    if (this.currentCommand) {
      // Cancel timeout if active
      if (this.currentCommand.timeoutHandle) {
        clearTimeout(this.currentCommand.timeoutHandle);
      }

      // If we accumulated any O packet output, notify and resolve with that
      if (this.accumulatedOutput.length > 0) {
        // Notify UI with complete accumulated output
        this.notifyTargetOutput(this.accumulatedOutput);

        this.currentCommand.resolve({
          type: 'data',
          data: this.accumulatedOutput
        });
        this.accumulatedOutput = ''; // Reset accumulator
      } else {
        this.currentCommand.resolve(response);
      }
      this.currentCommand = null;
      this.processQueue();
    }
  }

  /**
   * Handle notification packet
   *
   * @param data - Notification data
   */
  private handleNotification(data: string): void {
    if (this.callbacks.onNotification) {
      this.callbacks.onNotification(data);
    }
  }

  /**
   * Handle error
   *
   * @param error - Error object
   */
  private handleError(error: Error): void {
    this.setState(ConnectionState.ERROR);

    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
  }

  /**
   * Set connection state and notify callback
   *
   * @param newState - New state
   */
  private setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;

      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(newState);
      }
    }
  }

  /**
   * Notify stopped callback
   *
   * @param reply - Stop reply information
   */
  private notifyStopped(reply: StopReply): void {
    if (this.callbacks.onStopped) {
      this.callbacks.onStopped(reply);
    }
  }

  /**
   * Notify target output callback
   *
   * @param output - Output string
   */
  private notifyTargetOutput(output: string): void {
    if (this.callbacks.onTargetOutput) {
      this.callbacks.onTargetOutput(output);
    }
  }
}
