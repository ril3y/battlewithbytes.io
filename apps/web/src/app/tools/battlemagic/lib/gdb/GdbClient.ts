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

import { RspProtocol } from "./RspProtocol";
import { SerialTransport } from "./SerialTransport";
import { BlackMagicCommands } from "./BlackMagicCommands";
import { ConnectionState } from "./types";
import type {
  GdbResponse,
  GdbClientConfig,
  QueuedCommand,
  Target,
  BmpVersion,
  StopReply,
  SerialConfig,
} from "./types";

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
  ackMode: false, // Default to NoAckMode for faster communication
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
  private receiveBuffer = "";
  private ackMode = true;
  private pendingAck = false;
  private accumulatedOutput = ""; // Accumulate O packets until OK/ERROR

  /**
   * Create a new GDB client instance
   *
   * @param config - Client configuration
   * @param callbacks - Event callbacks
   */
  constructor(
    config: GdbClientConfig = {},
    callbacks: GdbClientCallbacks = {},
  ) {
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
  async connect(
    port: SerialPort,
    serialConfig: SerialConfig = {},
  ): Promise<void> {
    if (this.state !== ConnectionState.DISCONNECTED) {
      throw new Error("Already connected");
    }

    try {
      this.setState(ConnectionState.CONNECTING);

      // Connect transport
      await this.transport.connect(port, serialConfig);

      // Give the port a moment to stabilize before sending commands
      // This is especially important for ACK mode initialization
      await new Promise((resolve) => setTimeout(resolve, 100));

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
      cmd.reject(new Error("Connection closed"));
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
    return (
      this.state === ConnectionState.CONNECTED ||
      this.state === ConnectionState.ATTACHED
    );
  }

  /**
   * Scan for SWD targets
   *
   * @returns Array of detected targets and target voltage
   */
  async scanSwd(): Promise<{ targets: Target[]; voltage: number | null }> {
    const cmd = BlackMagicCommands.buildSwdScan();
    const response = await this.sendCommand(cmd);

    if (response.type !== "data") {
      throw new Error("Failed to scan for SWD targets");
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

    if (response.type !== "data") {
      throw new Error("Failed to scan for JTAG targets");
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

    if (response.type === "error") {
      throw new Error("Failed to enable target power");
    }
  }

  /**
   * Disable target power
   */
  async disableTargetPower(): Promise<void> {
    const cmd = BlackMagicCommands.buildPowerDisable();
    const response = await this.sendCommand(cmd);

    if (response.type === "error") {
      throw new Error("Failed to disable target power");
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

    if (response.type !== "data") {
      throw new Error("Failed to get version");
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

    if (response.type === "error") {
      throw new Error("Failed to reset target");
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

    if (response.type === "error") {
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

    if (response.type === "error") {
      throw new Error("Failed to detach from target");
    }

    this.setState(ConnectionState.CONNECTED);
  }

  /**
   * Continue execution (non-blocking)
   *
   * Resumes target execution. The target will run until it hits a breakpoint,
   * receives a signal, or is halted. The stop notification will be sent via
   * the stopped callback when execution stops.
   *
   * NOTE: This method returns immediately after sending the continue command.
   * It does NOT wait for the target to stop. Use the onStopped callback to
   * be notified when execution stops.
   */
  async continue(): Promise<void> {
    if (!this.transport.isConnected()) {
      throw new Error("Not connected");
    }

    // Wait for any pending commands to complete
    while (this.currentCommand !== null || this.commandQueue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    const cmd = BlackMagicCommands.buildContinue();
    console.log("[GdbClient] Sending continue command (non-blocking)");

    // Encode the command as a proper GDB packet ($cmd#checksum)
    const packet = RspProtocol.encodePacket(cmd);

    // Send the command directly without waiting for response
    // The stop reply (T packet) will come asynchronously and be handled
    // by handleReceivedData() which will call notifyStopped()
    await this.transport.send(packet);

    console.log("[GdbClient] Continue command sent, target is now running");
  }

  /**
   * Single step execution
   *
   * Executes one instruction and stops.
   */
  async step(): Promise<StopReply> {
    const cmd = BlackMagicCommands.buildStep();
    const response = await this.sendCommand(cmd);

    if (response.type === "signal") {
      const stopReply: StopReply = {
        signal: response.signal,
      };
      this.notifyStopped(stopReply);
      return stopReply;
    }

    throw new Error("Unexpected response to step command");
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
  async readMemory(
    address: number | string,
    length: number,
  ): Promise<Uint8Array> {
    // Black Magic Probe has GDB packet size limitations
    // Read in chunks to avoid E02 errors
    const CHUNK_SIZE = 256; // Safe size that works reliably

    if (length <= CHUNK_SIZE) {
      // Small read - do it in one go
      const cmd = BlackMagicCommands.buildMemoryRead(address, length);
      const response = await this.sendCommand(cmd);

      if (response.type !== "data") {
        const addrStr =
          typeof address === "number" ? `0x${address.toString(16)}` : address;
        if (this.config.debug) {
          console.error(
            `[GdbClient] Memory read failed at ${addrStr}, response type: ${response.type}`,
          );
        }
        throw new Error(
          `Failed to read memory at ${addrStr} (response: ${response.type})`,
        );
      }

      return RspProtocol.parseMemoryData(response.data);
    }

    // Large read - split into chunks
    const baseAddr =
      typeof address === "number" ? address : parseInt(address, 16);
    const result = new Uint8Array(length);
    let offset = 0;

    while (offset < length) {
      const chunkSize = Math.min(CHUNK_SIZE, length - offset);
      const chunkAddr = baseAddr + offset;

      const cmd = BlackMagicCommands.buildMemoryRead(chunkAddr, chunkSize);
      const response = await this.sendCommand(cmd);

      if (response.type !== "data") {
        if (this.config.debug) {
          console.error(
            `[GdbClient] Memory read failed at 0x${chunkAddr.toString(16)}, response type: ${response.type}`,
          );
        }
        throw new Error(
          `Failed to read memory at 0x${chunkAddr.toString(16)} (response: ${response.type})`,
        );
      }

      const chunkData = RspProtocol.parseMemoryData(response.data);
      result.set(chunkData, offset);
      offset += chunkData.length;
    }

    return result;
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

    if (response.type !== "ok") {
      throw new Error("Failed to write memory");
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

    if (response.type !== "data") {
      throw new Error("Failed to read registers");
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

    if (response.type !== "data") {
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

    if (response.type !== "ok") {
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
      console.log("[getFormattedRegisters] Raw response:", response);
      console.log("[getFormattedRegisters] Response length:", response.length);
    }

    // ARM Cortex-M register layout (each register is 8 hex chars = 32 bits)
    const regNames = [
      "r0",
      "r1",
      "r2",
      "r3",
      "r4",
      "r5",
      "r6",
      "r7",
      "r8",
      "r9",
      "r10",
      "r11",
      "r12",
      "sp",
      "lr",
      "pc",
      "xpsr",
      "msp",
      "psp",
      "primask",
      "basepri",
      "faultmask",
      "control",
    ];

    let offset = 0;
    for (const name of regNames) {
      if (offset + 8 <= response.length) {
        const hexValue = response.substring(offset, offset + 8);
        if (this.config.debug) {
          console.log(
            `[getFormattedRegisters] ${name}: hexValue="${hexValue}" (offset=${offset})`,
          );
        }
        // Convert from little-endian hex string
        const bytes = hexValue.match(/.{2}/g);
        if (bytes) {
          const value = parseInt(bytes.reverse().join(""), 16);
          registers.set(name, value);
          if (this.config.debug) {
            console.log(
              `[getFormattedRegisters] ${name} = 0x${value.toString(16).padStart(8, "0")}`,
            );
          }
        }
        offset += 8;
      }
    }

    return registers;
  }

  /**
   * Get stack backtrace with ARM Thumb-2 unwinding
   *
   * This performs basic stack unwinding using the Link Register (LR) chain.
   * For ARM Cortex-M without full DWARF debug info, we use a heuristic approach:
   *
   * 1. Frame 0: Current PC (where we stopped)
   * 2. Frame 1+: Use LR to find return addresses
   *
   * Note: Without complete stack frame info, this is best-effort unwinding.
   * It works well for typical ARM calling conventions where LR is pushed/popped.
   *
   * @returns Stack frame information with addresses
   */
  async getBacktrace(): Promise<
    Array<{ level: number; address: number; function?: string }>
  > {
    const frames: Array<{ level: number; address: number; function?: string }> =
      [];

    try {
      const regs = await this.getFormattedRegisters();
      const pc = regs.get("pc");
      const lr = regs.get("lr");
      const sp = regs.get("sp");

      if (pc === undefined || sp === undefined) {
        return frames;
      }

      // Frame 0: Current execution point
      frames.push({
        level: 0,
        address: pc & ~1, // Clear Thumb bit for display
      });

      // Frame 1: Immediate caller (from LR)
      if (lr !== undefined && lr !== 0 && lr !== 0xffffffff) {
        // Check if LR looks like a valid code address
        const lrAddr = lr & ~1; // Clear Thumb bit
        if (this.isValidCodeAddress(lrAddr)) {
          frames.push({
            level: 1,
            address: lrAddr,
          });
        }
      }

      // Frames 2+: Walk the stack to find pushed LR values
      // This is heuristic-based since we don't have full unwind info
      try {
        const stackFrames = await this.walkStack(sp, 10); // Max 10 frames
        stackFrames.forEach((addr) => {
          frames.push({
            level: frames.length,
            address: addr & ~1, // Clear Thumb bit
          });
        });
      } catch {
        // Stack walking failed, but we still have PC and LR
        // This is expected in some cases, so we silently continue
      }
    } catch (error) {
      // Critical failure - return empty frames
      if (this.config.debug) {
        console.error("[getBacktrace] Failed to get backtrace:", error);
      }
    }

    return frames;
  }

  /**
   * Walk the stack to find return addresses
   *
   * This scans the stack memory looking for values that look like return addresses.
   * For ARM Cortex-M, we look for values in the code region (typically 0x08000000+)
   * with the Thumb bit set.
   *
   * @param sp - Current stack pointer
   * @param maxFrames - Maximum number of frames to find
   * @returns Array of return addresses found on stack
   */
  private async walkStack(sp: number, maxFrames: number): Promise<number[]> {
    const returnAddresses: number[] = [];

    // Read a reasonable chunk of stack (256 bytes = 64 words)
    // This should cover most typical call depths
    const STACK_READ_SIZE = 256;

    try {
      const stackData = await this.readMemory(sp, STACK_READ_SIZE);

      // Scan for potential return addresses (word-aligned, 4 bytes each)
      for (let offset = 0; offset < stackData.length - 3; offset += 4) {
        if (returnAddresses.length >= maxFrames) {
          break;
        }

        // Read little-endian 32-bit value
        const value =
          (stackData[offset] |
            (stackData[offset + 1] << 8) |
            (stackData[offset + 2] << 16) |
            (stackData[offset + 3] << 24)) >>>
          0;

        // Check if this looks like a return address:
        // 1. Must have Thumb bit set (bit 0 = 1)
        // 2. Must be in valid code region
        // 3. Should be odd (Thumb mode)
        if ((value & 1) === 1) {
          const addr = value & ~1;
          if (this.isValidCodeAddress(addr)) {
            returnAddresses.push(value);
          }
        }
      }
    } catch (error) {
      if (this.config.debug) {
        console.log("[walkStack] Failed to read stack memory:", error);
      }
    }

    return returnAddresses;
  }

  /**
   * Check if an address looks like valid code
   *
   * For ARM Cortex-M, code is typically in:
   * - 0x00000000 - 0x00100000 (aliased flash)
   * - 0x08000000 - 0x08100000 (physical flash)
   * - 0x20000000 - 0x20100000 (SRAM - for code in RAM)
   *
   * @param address - Address to check
   * @returns True if address looks like valid code
   */
  private isValidCodeAddress(address: number): boolean {
    // Aliased flash region
    if (address >= 0x00000000 && address < 0x00100000) {
      return true;
    }

    // Physical flash region (most common for STM32)
    if (address >= 0x08000000 && address < 0x08100000) {
      return true;
    }

    // SRAM region (code in RAM)
    if (address >= 0x20000000 && address < 0x20100000) {
      return true;
    }

    return false;
  }

  /**
   * Insert a breakpoint
   *
   * @param address - Breakpoint address
   * @param hardware - Use hardware breakpoint (default: false)
   */
  async insertBreakpoint(
    address: number | string,
    hardware = false,
  ): Promise<void> {
    const cmd = BlackMagicCommands.buildInsertBreakpoint(address, hardware);

    console.log(
      "[insertBreakpoint] Command:",
      cmd,
      "Address:",
      address,
      "Hardware:",
      hardware,
    );

    const response = await this.sendCommand(cmd);

    console.log("[insertBreakpoint] Response:", response);

    if (response.type === "error") {
      const errorCode = response.code || "unknown";

      // Provide specific error messages based on GDB error codes
      if (errorCode === "E01" || errorCode === "01") {
        // E01 is often "no more resources" (e.g., out of hardware breakpoint units)
        throw new Error(
          `E01 - No more hardware breakpoint units available (ARM Cortex-M limit: 4-6)`,
        );
      } else if (errorCode === "E02" || errorCode === "02") {
        throw new Error(`E02 - Invalid breakpoint command format`);
      } else {
        throw new Error(`Failed to insert breakpoint: ${errorCode}`);
      }
    }

    // Check for unsupported command (empty response might mean not supported)
    if (response.type === "empty") {
      console.warn(
        "[insertBreakpoint] Got empty response - command may not be supported",
      );
      console.warn(
        "[insertBreakpoint] This usually means the breakpoint was NOT set",
      );
      throw new Error(
        "Breakpoint command returned empty response (likely not supported by target)",
      );
    }

    // Only accept 'ok' as true success
    if (response.type !== "ok") {
      throw new Error(`Unexpected response type: ${response.type}`);
    }
  }

  /**
   * Remove a breakpoint
   *
   * @param address - Breakpoint address
   * @param hardware - Hardware breakpoint (default: false)
   */
  async removeBreakpoint(
    address: number | string,
    hardware = false,
  ): Promise<void> {
    const cmd = BlackMagicCommands.buildRemoveBreakpoint(address, hardware);

    if (this.config.debug) {
      console.log(
        "[removeBreakpoint] Command:",
        cmd,
        "Address:",
        address,
        "Hardware:",
        hardware,
      );
    }

    const response = await this.sendCommand(cmd);

    if (this.config.debug) {
      console.log("[removeBreakpoint] Response:", response);
    }

    // Accept both 'ok' and 'empty' as success
    if (response.type === "ok" || response.type === "empty") {
      return;
    }

    // Provide detailed error message
    if (response.type === "error") {
      throw new Error(
        `Failed to remove breakpoint: ${response.code || "unknown error"}`,
      );
    }

    throw new Error(`Unexpected response type: ${response.type}`);
  }

  /**
   * Send a monitor command to the target
   */
  async sendMonitorCommand(command: string): Promise<string> {
    // Convert command to hex for qRcmd
    const hexCmd = Array.from(new TextEncoder().encode(command))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const response = await this.sendCommand(`qRcmd,${hexCmd}`);

    if (response.type === "ok") {
      return "";
    }

    if (response.type === "data" && response.data.startsWith("O")) {
      // Output from monitor command
      const hexOutput = response.data.slice(1);
      const bytes = [];
      for (let i = 0; i < hexOutput.length; i += 2) {
        bytes.push(parseInt(hexOutput.substr(i, 2), 16));
      }
      return new TextDecoder().decode(new Uint8Array(bytes));
    }

    if (response.type === "data") {
      return response.data;
    }

    return "";
  }

  /**
   * Get target information (for MCU detection)
   */
  async getTargetInfo(): Promise<string> {
    try {
      // Try multiple methods to get target info
      const methods = [
        async () => await this.sendMonitorCommand("version"),
        async () => {
          const response = await this.sendCommand("qAttached");
          return typeof response === "string" ? response : "";
        },
        async () => {
          const response = await this.sendCommand("qSupported");
          return response.type === "data" ? response.data : "";
        },
      ];

      for (const method of methods) {
        try {
          const info = await method();
          if (info) return info;
        } catch {
          continue;
        }
      }

      return "";
    } catch {
      return "";
    }
  }

  /**
   * Query memory regions from target
   */
  async queryMemoryRegions(): Promise<string> {
    try {
      // Try 'info mem' via monitor command
      return await this.sendMonitorCommand("info mem");
    } catch {
      return "";
    }
  }

  /**
   * Test if memory address is readable
   */
  async testMemoryAccess(address: number, length = 4): Promise<boolean> {
    try {
      const data = await this.readMemory(address, length);
      return data && data.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Reset target and halt at entry point
   *
   * This ensures the CPU is at the actual reset vector, not a random execution point.
   * Essential for accurate firmware dumping and vector table detection.
   *
   * Note: Black Magic Probe detaches during reset, so we need to track the target ID
   * and re-attach after the reset completes.
   */
  async resetAndHalt(): Promise<void> {
    try {
      // Black Magic Probe detaches during reset, but we can use 'monitor reset halt'
      // which will reset and halt without requiring a re-attach
      // However, we need to handle the case where the state changes

      const currentState = this.getState();
      if (this.config.debug) {
        console.log("[GdbClient] Current state before reset:", currentState);
      }

      // Send monitor reset halt command
      // Note: BMP may report detach, but the target remains halted
      await this.sendMonitorCommand("reset halt");

      // Give the target time to settle after reset
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Update state to ATTACHED since reset halt keeps us attached
      this.state = ConnectionState.ATTACHED;

      if (this.config.debug) {
        console.log("[GdbClient] Target reset and halted at entry point");
      }
    } catch (error) {
      throw new Error(
        `Failed to reset and halt: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get reset vector information from target's vector table
   *
   * Reads the first two vectors (Initial SP and Reset Handler) to determine:
   * - Stack pointer initialization value
   * - Reset handler address (entry point)
   * - Correct base address from architecture detection
   *
   * Uses the architecture-specific flash base address from the memory layout database.
   * Falls back to common addresses (0x00000000, 0x08000000) if architecture is not provided.
   *
   * @param archInfo Optional architecture information with flash_base property
   * @returns Vector table information including detected base address
   */
  async getResetVector(archInfo?: { flash_base?: number }): Promise<{
    sp: number;
    resetHandler: number;
    baseAddress: number;
  }> {
    // ARM Cortex-M vector table layout:
    // Offset 0x00: Initial Stack Pointer (should point to RAM, e.g., 0x2000XXXX)
    // Offset 0x04: Reset Handler address (with Thumb bit set, e.g., 0x080000XX)

    // Use architecture-specific flash base if provided, otherwise try common addresses
    const addressesToTry =
      archInfo?.flash_base !== undefined
        ? [archInfo.flash_base]
        : [0x00000000, 0x08000000]; // Try common Cortex-M addresses

    let baseAddress: number | undefined;
    let vector0Data: Uint8Array | undefined;
    let vector1Data: Uint8Array | undefined;

    // Try each address until we find valid vector table data
    for (const addr of addressesToTry) {
      try {
        const v0 = await this.readMemory(addr, 4);
        const v1 = await this.readMemory(addr + 4, 4);

        if (this.config.debug) {
          console.log(
            `[getResetVector] Successfully read from 0x${addr.toString(16).toUpperCase()}`,
          );
        }

        vector0Data = v0;
        vector1Data = v1;
        baseAddress = addr;
        break;
      } catch {
        if (this.config.debug) {
          console.log(
            `[getResetVector] Failed to read from 0x${addr.toString(16).toUpperCase()}, trying next address...`,
          );
        }
        continue;
      }
    }

    if (!vector0Data || !vector1Data || baseAddress === undefined) {
      const triedAddrs = addressesToTry
        .map((a) => `0x${a.toString(16).toUpperCase()}`)
        .join(", ");
      throw new Error(
        `Failed to read vector table from addresses: ${triedAddrs}`,
      );
    }

    // Parse Initial SP (Vector 0) - should point to end of RAM
    const sp =
      (vector0Data[0] |
        (vector0Data[1] << 8) |
        (vector0Data[2] << 16) |
        (vector0Data[3] << 24)) >>>
      0; // Unsigned 32-bit

    // Parse Reset Handler (Vector 1) - should point to flash code
    const resetHandler =
      ((vector1Data[0] |
        (vector1Data[1] << 8) |
        (vector1Data[2] << 16) |
        (vector1Data[3] << 24)) &
        ~1) >>> // Clear Thumb bit (LSB)
      0; // Unsigned 32-bit

    // Validate that Initial SP looks like a RAM address
    // ARM Cortex-M typically has RAM at 0x20000000 or 0x10000000
    const isValidSP = sp >= 0x10000000 && sp < 0x30000000;

    // Validate that Reset Handler looks like a flash address
    const isValidResetHandler =
      (resetHandler >= 0x00000000 && resetHandler < 0x00100000) || // Aliased
      (resetHandler >= 0x08000000 && resetHandler < 0x08100000); // Physical

    if (!isValidSP) {
      console.warn(
        `[getResetVector] Suspicious Initial SP: 0x${sp.toString(16).toUpperCase()}`,
      );
      console.warn(
        "[getResetVector] Expected RAM address (0x10000000-0x30000000)",
      );
    }

    if (!isValidResetHandler) {
      console.warn(
        `[getResetVector] Suspicious Reset Handler: 0x${resetHandler.toString(16).toUpperCase()}`,
      );
      console.warn(
        "[getResetVector] Expected flash address (0x00000000 or 0x08000000 range)",
      );
    }

    if (this.config.debug) {
      console.log("[getResetVector] Vector table analysis:");
      console.log(
        `  Base Address:   0x${baseAddress.toString(16).toUpperCase().padStart(8, "0")}`,
      );
      console.log(
        `  Initial SP:     0x${sp.toString(16).toUpperCase().padStart(8, "0")}`,
      );
      console.log(
        `  Reset Handler:  0x${resetHandler.toString(16).toUpperCase().padStart(8, "0")}`,
      );
      console.log(`  Valid SP:       ${isValidSP}`);
      console.log(`  Valid Handler:  ${isValidResetHandler}`);
    }

    return {
      sp,
      resetHandler,
      baseAddress,
    };
  }

  /**
   * Flash operations for programming firmware
   */
  async flashErase(address: number, length: number): Promise<void> {
    // Try vFlashErase command first
    const response = await this.sendCommand(
      `vFlashErase:${address.toString(16)},${length.toString(16)}`,
    );

    if (response.type === "ok") {
      return;
    }

    // Fallback to monitor command for Black Magic Probe
    await this.sendMonitorCommand(
      `erase ${address.toString(16)} ${length.toString(16)}`,
    );
  }

  async flashWrite(address: number, data: Uint8Array): Promise<void> {
    // For Black Magic Probe, we can use regular memory writes
    // BMP handles flash programming automatically
    await this.writeMemory(address, data);
  }

  async flashDone(): Promise<void> {
    // Send vFlashDone to complete flash operations
    const response = await this.sendCommand("vFlashDone");

    // BMP might not support this, which is OK
    if (response.type !== "ok" && response.type !== "error") {
      console.warn("vFlashDone not supported by target");
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
      throw new Error("Not connected");
    }

    if (this.commandQueue.length >= this.config.maxQueueSize) {
      throw new Error("Command queue full");
    }

    return new Promise((resolve, reject) => {
      const queuedCommand: QueuedCommand = {
        command,
        resolve,
        reject,
        timestamp: Date.now(),
        timeout: this.config.commandTimeout,
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
        console.log("[GDB] Sending qSupported...");
      }

      const response = await this.sendCommand(cmd);

      if (this.config.debug) {
        console.log("[GDB] Supported features:", response);
      }

      // Optionally disable ACK mode for faster communication
      if (!this.config.ackMode) {
        if (this.config.debug) {
          console.log("[GDB] Negotiating NoAckMode...");
        }

        const noAckResponse = await this.sendCommand("QStartNoAckMode");

        if (this.config.debug) {
          console.log("[GDB] NoAckMode response:", noAckResponse);
        }

        // Give a moment for the final ACK to be sent before disabling ACK mode
        await new Promise((resolve) => setTimeout(resolve, 50));

        // After successful negotiation, disable ACK mode
        this.ackMode = false;

        if (this.config.debug) {
          console.log("[GDB] NoAckMode enabled");
        }
      }
    } catch (error) {
      console.error("[GDB] Initialization failed:", error);
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
          cmd.reject(new Error("Command timeout"));
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
    this.receiveBuffer += data;

    // Extract packets from buffer
    const { packets, remaining } = RspProtocol.extractPackets(
      this.receiveBuffer,
    );
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
      console.error("Failed to decode packet:", packet);
      // Send NAK if in ACK mode
      if (this.ackMode) {
        this.transport.send(RspProtocol.NAK);
      }
      return;
    }

    // Send ACK if in ACK mode
    if (
      this.ackMode &&
      packet !== RspProtocol.ACK &&
      packet !== RspProtocol.NAK
    ) {
      if (this.config.debug) {
        console.log("[GDB] Sending ACK");
      }
      // Don't await - send ACK asynchronously but immediately
      this.transport.send(RspProtocol.ACK).catch((err) => {
        console.error("[GDB] Failed to send ACK:", err);
      });
    }

    // Parse response
    const response = RspProtocol.parseResponse(decoded.data);

    // Handle notifications (async stop events, etc.)
    if (decoded.data.startsWith("%")) {
      this.handleNotification(decoded.data);
      return;
    }

    // Handle stop replies (T packets)
    if (decoded.data.startsWith("T")) {
      const stopInfo = RspProtocol.parseStopReply(decoded.data);
      const stopReply: StopReply = {
        signal: stopInfo.signal,
        thread: stopInfo.info.thread
          ? parseInt(stopInfo.info.thread, 16)
          : undefined,
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
    if (
      decoded.data.startsWith("O") &&
      decoded.data.length > 1 &&
      decoded.data !== "OK"
    ) {
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
          type: "data",
          data: this.accumulatedOutput,
        });
        this.accumulatedOutput = ""; // Reset accumulator
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
