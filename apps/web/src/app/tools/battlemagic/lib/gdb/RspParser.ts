/**
 * GDB Remote Serial Protocol Response Parser
 *
 * Type-safe parsers for GDB RSP responses with ARM Cortex-M specific support.
 * Converts raw hex-encoded RSP responses into strongly-typed TypeScript objects.
 *
 * Protocol Reference:
 * - GDB Remote Serial Protocol Specification
 * - https://sourceware.org/gdb/onlinedocs/gdb/Remote-Protocol.html
 *
 * Architecture:
 * - RspParser: Main parser factory/utilities
 * - RegisterParser: ARM Cortex-M register parsing
 * - MemoryParser: Memory read/write response parsing
 * - StopReplyParser: Stop/signal response parsing
 * - BreakpointParser: Breakpoint operation responses
 * - MonitorParser: Monitor command output parsing
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * ARM Cortex-M register dump (from 'g' command)
 *
 * Register layout for ARM Cortex-M processors as returned by the 'g' command.
 * Each register is 32-bit (4 bytes), encoded as 8 hex characters in little-endian.
 *
 * Standard registers (0-15):
 * - r0-r12: General purpose registers
 * - r13 (sp): Stack pointer
 * - r14 (lr): Link register
 * - r15 (pc): Program counter
 *
 * Special registers (16+):
 * - xpsr: Combined program status register
 * - msp: Main stack pointer
 * - psp: Process stack pointer
 * - primask: Priority mask register
 * - basepri: Base priority register
 * - faultmask: Fault mask register
 * - control: Control register
 */
export interface ArmCortexMRegisters {
  // General purpose registers (R0-R12)
  r0: number;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  r5: number;
  r6: number;
  r7: number;
  r8: number;
  r9: number;
  r10: number;
  r11: number;
  r12: number;

  // Special registers (R13-R15)
  sp: number;  // R13 - Stack pointer
  lr: number;  // R14 - Link register
  pc: number;  // R15 - Program counter

  // Additional special registers
  xpsr?: number;      // Combined PSR
  msp?: number;       // Main stack pointer
  psp?: number;       // Process stack pointer
  primask?: number;   // Priority mask
  basepri?: number;   // Base priority
  faultmask?: number; // Fault mask
  control?: number;   // Control register
}

/**
 * Single register value (from 'p' command)
 */
export interface RegisterValue {
  /** Register number */
  regNum: number;
  /** Register value */
  value: number;
  /** Raw hex string */
  hex: string;
}

/**
 * Memory read result (from 'm' command)
 */
export interface MemoryReadResult {
  /** Starting address that was read */
  address: number;
  /** Number of bytes read */
  length: number;
  /** Raw data bytes */
  data: Uint8Array;
  /** Hex string representation */
  hex: string;
}

/**
 * Memory write confirmation (from 'M' command)
 */
export interface MemoryWriteResult {
  /** Address written to */
  address: number;
  /** Number of bytes written */
  length: number;
  /** Write succeeded */
  success: boolean;
}

/**
 * Stop reply types
 */
export enum StopReason {
  BREAKPOINT = 'breakpoint',
  WATCHPOINT = 'watchpoint',
  SINGLE_STEP = 'single-step',
  SIGNAL = 'signal',
  EXITED = 'exited',
  TERMINATED = 'terminated',
  UNKNOWN = 'unknown'
}

/**
 * Detailed stop reply information (from 'T' packets)
 *
 * Format: Txx[key:value;]...
 * - xx: Signal number (2 hex digits)
 * - key:value pairs provide additional context
 *
 * Common keys:
 * - thread: Thread ID that stopped
 * - core: Core number (for multi-core)
 * - watch/rwatch/awatch: Watchpoint address
 * - swbreak/hwbreak: Breakpoint indicator
 * - NN: Register values (NN is hex register number)
 */
export interface StopReplyDetailed {
  /** Signal number (5 = SIGTRAP for breakpoint, 2 = SIGINT for Ctrl+C) */
  signal: number;
  /** Stop reason if determinable */
  reason: StopReason;
  /** Thread ID if available */
  thread?: number;
  /** Core ID for multi-core systems */
  core?: number;
  /** Watchpoint address if applicable */
  watchAddr?: number;
  /** Register values included in stop reply */
  registers?: Map<number, number>;
  /** Raw key-value pairs from packet */
  rawInfo: Map<string, string>;
}

/**
 * Simple stop reply (from 'S' packets)
 *
 * Format: Sxx
 * - xx: Signal number only
 */
export interface StopReplySimple {
  /** Signal number */
  signal: number;
  /** Stop reason (inferred from signal) */
  reason: StopReason;
}

/**
 * Combined stop reply type
 */
export type StopReply = StopReplyDetailed | StopReplySimple;

/**
 * Breakpoint operation result
 */
export interface BreakpointResult {
  /** Operation succeeded */
  success: boolean;
  /** Breakpoint address */
  address: number;
  /** Breakpoint type (0=software, 1=hardware, 2-4=watchpoint) */
  type: number;
  /** Error message if failed */
  error?: string;
}

/**
 * Monitor command response
 *
 * Monitor commands return hex-encoded console output prefixed with 'O'.
 */
export interface MonitorResponse {
  /** Decoded output text */
  output: string;
  /** Raw hex-encoded response */
  hex: string;
}

/**
 * Error response (from 'E' packets)
 *
 * Format: Enn
 * - nn: Two-digit hex error code
 */
export interface ErrorResponse {
  /** Error code (hex) */
  code: string;
  /** Error code (decimal) */
  codeNum: number;
  /** Human-readable error message */
  message: string;
}

/**
 * Parse result wrapper for error handling
 */
export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; raw?: string };

// ============================================================================
// REGISTER PARSER
// ============================================================================

/**
 * Parser for ARM Cortex-M register responses
 *
 * Handles both full register dumps ('g' command) and single register reads ('p' command).
 */
export class RegisterParser {
  /**
   * Parse ARM Cortex-M register dump from 'g' command
   *
   * Algorithm:
   * 1. Validate hex string length (must be multiple of 8 for 32-bit registers)
   * 2. Split into 8-character chunks (one per register)
   * 3. Convert each chunk from little-endian hex to number
   * 4. Map to register names according to ARM Cortex-M layout
   *
   * @param hexResponse - Hex string from 'g' command response
   * @returns Parsed register structure or error
   *
   * @example
   * // Response: "00000000010000000200000003000000..." (r0=0, r1=1, r2=2, r3=3, ...)
   * const result = RegisterParser.parseArmCortexM(response);
   * if (result.success) {
   *   console.log(`PC: 0x${result.data.pc.toString(16)}`);
   * }
   */
  static parseArmCortexM(hexResponse: string): ParseResult<ArmCortexMRegisters> {
    try {
      // Step 1: Validate input
      if (!hexResponse || hexResponse.length === 0) {
        return { success: false, error: 'Empty register response', raw: hexResponse };
      }

      if (!/^[0-9a-fA-F]+$/.test(hexResponse)) {
        return { success: false, error: 'Invalid hex characters in response', raw: hexResponse };
      }

      if (hexResponse.length % 8 !== 0) {
        return { success: false, error: 'Register data length not multiple of 8', raw: hexResponse };
      }

      // Step 2: Parse registers
      const registers: Partial<ArmCortexMRegisters> = {};
      let offset = 0;

      // Helper to parse one little-endian 32-bit register
      const parseRegister = (): number => {
        if (offset + 8 > hexResponse.length) {
          throw new Error('Unexpected end of register data');
        }
        const hexValue = hexResponse.substring(offset, offset + 8);
        offset += 8;

        // Convert little-endian hex to number
        // "12345678" -> 0x78563412
        const bytes = hexValue.match(/.{2}/g);
        if (!bytes || bytes.length !== 4) {
          throw new Error(`Invalid register hex: ${hexValue}`);
        }
        const leValue = bytes.reverse().join('');
        return parseInt(leValue, 16);
      };

      // Step 3: Parse standard registers (R0-R15)
      registers.r0 = parseRegister();
      registers.r1 = parseRegister();
      registers.r2 = parseRegister();
      registers.r3 = parseRegister();
      registers.r4 = parseRegister();
      registers.r5 = parseRegister();
      registers.r6 = parseRegister();
      registers.r7 = parseRegister();
      registers.r8 = parseRegister();
      registers.r9 = parseRegister();
      registers.r10 = parseRegister();
      registers.r11 = parseRegister();
      registers.r12 = parseRegister();
      registers.sp = parseRegister();   // R13
      registers.lr = parseRegister();   // R14
      registers.pc = parseRegister();   // R15

      // Step 4: Parse additional special registers (if present)
      // Note: Not all targets include these, so we check length
      if (offset + 8 <= hexResponse.length) {
        registers.xpsr = parseRegister();
      }
      if (offset + 8 <= hexResponse.length) {
        registers.msp = parseRegister();
      }
      if (offset + 8 <= hexResponse.length) {
        registers.psp = parseRegister();
      }
      if (offset + 8 <= hexResponse.length) {
        registers.primask = parseRegister();
      }
      if (offset + 8 <= hexResponse.length) {
        registers.basepri = parseRegister();
      }
      if (offset + 8 <= hexResponse.length) {
        registers.faultmask = parseRegister();
      }
      if (offset + 8 <= hexResponse.length) {
        registers.control = parseRegister();
      }

      return { success: true, data: registers as ArmCortexMRegisters };
    } catch (error) {
      return {
        success: false,
        error: `Register parse error: ${(error as Error).message}`,
        raw: hexResponse
      };
    }
  }

  /**
   * Parse single register response from 'p' command
   *
   * Algorithm:
   * 1. Validate hex string
   * 2. Convert little-endian hex to number
   * 3. Return register value with metadata
   *
   * @param hexResponse - Hex string from 'p' command response
   * @param regNum - Register number being read
   * @returns Parsed register value or error
   *
   * @example
   * // Response: "12345678" (little-endian for 0x78563412)
   * const result = RegisterParser.parseSingleRegister(response, 15);
   * if (result.success) {
   *   console.log(`PC (r15): 0x${result.data.value.toString(16)}`);
   * }
   */
  static parseSingleRegister(hexResponse: string, regNum: number): ParseResult<RegisterValue> {
    try {
      // Step 1: Validate
      if (!hexResponse || hexResponse.length === 0) {
        return { success: false, error: 'Empty register response' };
      }

      if (!/^[0-9a-fA-F]+$/.test(hexResponse)) {
        return { success: false, error: 'Invalid hex characters', raw: hexResponse };
      }

      // Most registers are 32-bit (8 hex chars), but allow flexibility
      if (hexResponse.length % 2 !== 0) {
        return { success: false, error: 'Odd number of hex digits', raw: hexResponse };
      }

      // Step 2: Convert little-endian to number
      const bytes = hexResponse.match(/.{2}/g);
      if (!bytes) {
        return { success: false, error: 'Failed to parse hex bytes', raw: hexResponse };
      }

      const leValue = bytes.reverse().join('');
      const value = parseInt(leValue, 16);

      // Step 3: Return result
      return {
        success: true,
        data: {
          regNum,
          value,
          hex: hexResponse
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Register parse error: ${(error as Error).message}`,
        raw: hexResponse
      };
    }
  }

  /**
   * Get register name from number (ARM Cortex-M)
   *
   * @param regNum - Register number
   * @returns Register name or null if unknown
   */
  static getRegisterName(regNum: number): string | null {
    const names: Record<number, string> = {
      0: 'r0', 1: 'r1', 2: 'r2', 3: 'r3',
      4: 'r4', 5: 'r5', 6: 'r6', 7: 'r7',
      8: 'r8', 9: 'r9', 10: 'r10', 11: 'r11',
      12: 'r12', 13: 'sp', 14: 'lr', 15: 'pc',
      16: 'xpsr', 17: 'msp', 18: 'psp',
      19: 'primask', 20: 'basepri', 21: 'faultmask', 22: 'control'
    };
    return names[regNum] || null;
  }

  /**
   * Convert register value to little-endian hex string for writing
   *
   * @param value - Register value (32-bit number)
   * @returns Little-endian hex string (8 characters)
   */
  static toHex(value: number): string {
    // Convert to big-endian hex (8 chars)
    const hex = (value >>> 0).toString(16).padStart(8, '0');

    // Convert to little-endian
    const bytes = hex.match(/.{2}/g);
    if (!bytes || bytes.length !== 4) {
      throw new Error('Invalid register value');
    }

    return bytes.reverse().join('');
  }
}

// ============================================================================
// MEMORY PARSER
// ============================================================================

/**
 * Parser for memory operation responses
 */
export class MemoryParser {
  /**
   * Parse memory read response from 'm' command
   *
   * Algorithm:
   * 1. Validate hex string
   * 2. Convert hex pairs to bytes
   * 3. Return byte array with metadata
   *
   * Format: mAddr,Length
   * Response: XXXXXXXX... (hex bytes, NOT little-endian - raw memory order)
   *
   * @param hexResponse - Hex string from 'm' command response
   * @param address - Address that was read (for metadata)
   * @param length - Length that was requested (for validation)
   * @returns Parsed memory data or error
   *
   * @example
   * // Response: "48656c6c6f" (ASCII "Hello")
   * const result = MemoryParser.parseMemoryRead(response, 0x20000000, 5);
   * if (result.success) {
   *   console.log(new TextDecoder().decode(result.data.data)); // "Hello"
   * }
   */
  static parseMemoryRead(
    hexResponse: string,
    address: number,
    length: number
  ): ParseResult<MemoryReadResult> {
    try {
      // Step 1: Validate
      if (!hexResponse || hexResponse.length === 0) {
        return { success: false, error: 'Empty memory response' };
      }

      if (!/^[0-9a-fA-F]+$/.test(hexResponse)) {
        return { success: false, error: 'Invalid hex characters', raw: hexResponse };
      }

      if (hexResponse.length % 2 !== 0) {
        return { success: false, error: 'Odd number of hex digits', raw: hexResponse };
      }

      const actualLength = hexResponse.length / 2;
      if (actualLength !== length) {
        // Warning but not error - some targets may return less
        console.warn(`Memory read length mismatch: requested ${length}, got ${actualLength}`);
      }

      // Step 2: Convert hex to bytes
      const data = new Uint8Array(actualLength);
      for (let i = 0; i < actualLength; i++) {
        const byteHex = hexResponse.substring(i * 2, i * 2 + 2);
        data[i] = parseInt(byteHex, 16);
      }

      // Step 3: Return result
      return {
        success: true,
        data: {
          address,
          length: actualLength,
          data,
          hex: hexResponse
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Memory parse error: ${(error as Error).message}`,
        raw: hexResponse
      };
    }
  }

  /**
   * Parse memory write confirmation from 'M' command
   *
   * Response is typically 'OK' on success, 'E' on error.
   *
   * @param response - Response packet ('OK' or 'Enn')
   * @param address - Address written to
   * @param length - Number of bytes written
   * @returns Write result
   */
  static parseMemoryWrite(
    response: string,
    address: number,
    length: number
  ): ParseResult<MemoryWriteResult> {
    const success = response === 'OK';

    return {
      success: true,
      data: {
        address,
        length,
        success
      }
    };
  }

  /**
   * Convert bytes to hex string for memory write
   *
   * @param data - Bytes to convert
   * @returns Hex string (raw memory order, not little-endian)
   */
  static toHex(data: Uint8Array): string {
    return Array.from(data)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Read 32-bit word from memory data (little-endian)
   *
   * @param data - Memory data
   * @param offset - Byte offset
   * @returns 32-bit value
   */
  static readWord(data: Uint8Array, offset: number): number {
    if (offset + 4 > data.length) {
      throw new Error('Read past end of memory data');
    }

    return (
      data[offset] |
      (data[offset + 1] << 8) |
      (data[offset + 2] << 16) |
      (data[offset + 3] << 24)
    ) >>> 0; // Unsigned
  }

  /**
   * Read 16-bit halfword from memory data (little-endian)
   *
   * @param data - Memory data
   * @param offset - Byte offset
   * @returns 16-bit value
   */
  static readHalfword(data: Uint8Array, offset: number): number {
    if (offset + 2 > data.length) {
      throw new Error('Read past end of memory data');
    }

    return (data[offset] | (data[offset + 1] << 8)) & 0xFFFF;
  }
}

// ============================================================================
// STOP REPLY PARSER
// ============================================================================

/**
 * Parser for stop reply packets
 */
export class StopReplyParser {
  /**
   * Signal number to stop reason mapping
   */
  private static readonly SIGNAL_TO_REASON: Record<number, StopReason> = {
    2: StopReason.SIGNAL,        // SIGINT - Ctrl+C
    5: StopReason.BREAKPOINT,    // SIGTRAP - Breakpoint/watchpoint
    11: StopReason.SIGNAL,       // SIGSEGV - Memory fault
  };

  /**
   * Parse detailed stop reply from 'T' packet
   *
   * Format: Txx[key:value;]...
   * - xx: Signal number (2 hex digits)
   * - key:value pairs separated by semicolons
   *
   * Common keys:
   * - thread: Thread ID
   * - core: Core number
   * - watch/rwatch/awatch: Watchpoint address
   * - swbreak: Software breakpoint indicator
   * - hwbreak: Hardware breakpoint indicator
   * - NN: Register value (NN is hex register number)
   *
   * Algorithm:
   * 1. Extract signal number from first 2 hex digits
   * 2. Parse key:value pairs
   * 3. Determine stop reason from signal and keys
   * 4. Extract thread, core, watchpoint info
   * 5. Parse any included register values
   *
   * @param packet - Raw 'T' packet data
   * @returns Parsed stop reply or error
   *
   * @example
   * // T05thread:01;swbreak:;0f:12345678;
   * const result = StopReplyParser.parseDetailed('T05thread:01;swbreak:;');
   * if (result.success) {
   *   console.log(`Stopped: ${result.data.reason}, signal ${result.data.signal}`);
   * }
   */
  static parseDetailed(packet: string): ParseResult<StopReplyDetailed> {
    try {
      // Step 1: Validate packet format
      if (!packet.startsWith('T')) {
        return { success: false, error: 'Not a T packet', raw: packet };
      }

      if (packet.length < 3) {
        return { success: false, error: 'T packet too short', raw: packet };
      }

      // Step 2: Extract signal number
      const signalHex = packet.substring(1, 3);
      if (!/^[0-9a-fA-F]{2}$/.test(signalHex)) {
        return { success: false, error: 'Invalid signal hex', raw: packet };
      }

      const signal = parseInt(signalHex, 16);

      // Step 3: Parse key:value pairs
      const rawInfo = new Map<string, string>();
      const remainder = packet.substring(3);

      if (remainder.length > 0) {
        const pairs = remainder.split(';').filter(p => p.length > 0);

        for (const pair of pairs) {
          const colonIndex = pair.indexOf(':');
          if (colonIndex === -1) {
            // Key without value (e.g., "swbreak")
            rawInfo.set(pair, '');
          } else {
            const key = pair.substring(0, colonIndex);
            const value = pair.substring(colonIndex + 1);
            rawInfo.set(key, value);
          }
        }
      }

      // Step 4: Determine stop reason
      let reason = this.SIGNAL_TO_REASON[signal] || StopReason.UNKNOWN;

      if (rawInfo.has('swbreak') || rawInfo.has('hwbreak')) {
        reason = StopReason.BREAKPOINT;
      } else if (rawInfo.has('watch') || rawInfo.has('rwatch') || rawInfo.has('awatch')) {
        reason = StopReason.WATCHPOINT;
      }

      // Step 5: Extract structured data
      const result: StopReplyDetailed = {
        signal,
        reason,
        rawInfo
      };

      // Thread ID
      if (rawInfo.has('thread')) {
        const threadValue = rawInfo.get('thread')!;
        if (threadValue.length > 0) {
          result.thread = parseInt(threadValue, 16);
        }
      }

      // Core ID
      if (rawInfo.has('core')) {
        const coreValue = rawInfo.get('core')!;
        if (coreValue.length > 0) {
          result.core = parseInt(coreValue, 16);
        }
      }

      // Watchpoint address
      for (const key of ['watch', 'rwatch', 'awatch']) {
        if (rawInfo.has(key)) {
          const addrValue = rawInfo.get(key)!;
          if (addrValue.length > 0) {
            result.watchAddr = parseInt(addrValue, 16);
            break;
          }
        }
      }

      // Step 6: Parse register values
      // Register values have numeric keys (hex register number)
      const registers = new Map<number, number>();

      for (const [key, value] of rawInfo.entries()) {
        if (/^[0-9a-fA-F]+$/.test(key) && value.length > 0) {
          const regNum = parseInt(key, 16);

          // Parse register value (little-endian)
          const bytes = value.match(/.{2}/g);
          if (bytes) {
            const leValue = bytes.reverse().join('');
            const regValue = parseInt(leValue, 16);
            registers.set(regNum, regValue);
          }
        }
      }

      if (registers.size > 0) {
        result.registers = registers;
      }

      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: `Stop reply parse error: ${(error as Error).message}`,
        raw: packet
      };
    }
  }

  /**
   * Parse simple stop reply from 'S' packet
   *
   * Format: Sxx
   * - xx: Signal number only
   *
   * @param packet - Raw 'S' packet data
   * @returns Parsed stop reply or error
   *
   * @example
   * // S05 (SIGTRAP)
   * const result = StopReplyParser.parseSimple('S05');
   * if (result.success) {
   *   console.log(`Signal: ${result.data.signal}`);
   * }
   */
  static parseSimple(packet: string): ParseResult<StopReplySimple> {
    try {
      if (!packet.startsWith('S')) {
        return { success: false, error: 'Not an S packet', raw: packet };
      }

      if (packet.length !== 3) {
        return { success: false, error: 'S packet must be exactly 3 characters', raw: packet };
      }

      const signalHex = packet.substring(1, 3);
      if (!/^[0-9a-fA-F]{2}$/.test(signalHex)) {
        return { success: false, error: 'Invalid signal hex', raw: packet };
      }

      const signal = parseInt(signalHex, 16);
      const reason = this.SIGNAL_TO_REASON[signal] || StopReason.UNKNOWN;

      return {
        success: true,
        data: { signal, reason }
      };
    } catch (error) {
      return {
        success: false,
        error: `Stop reply parse error: ${(error as Error).message}`,
        raw: packet
      };
    }
  }

  /**
   * Parse any stop reply (auto-detects T or S packet)
   *
   * @param packet - Raw stop reply packet
   * @returns Parsed stop reply or error
   */
  static parse(packet: string): ParseResult<StopReply> {
    if (packet.startsWith('T')) {
      return this.parseDetailed(packet);
    } else if (packet.startsWith('S')) {
      return this.parseSimple(packet);
    } else {
      return { success: false, error: 'Not a stop reply packet (must start with T or S)', raw: packet };
    }
  }

  /**
   * Get human-readable signal name
   *
   * @param signal - Signal number
   * @returns Signal name
   */
  static getSignalName(signal: number): string {
    const names: Record<number, string> = {
      0: 'SIG0',
      2: 'SIGINT',
      5: 'SIGTRAP',
      11: 'SIGSEGV',
      15: 'SIGTERM',
    };
    return names[signal] || `SIG${signal}`;
  }
}

// ============================================================================
// BREAKPOINT PARSER
// ============================================================================

/**
 * Parser for breakpoint operation responses
 */
export class BreakpointParser {
  /**
   * Parse breakpoint insert response (Z command)
   *
   * Format: Z<type>,<addr>,<kind>
   * Response: OK (success) or E<nn> (error)
   *
   * @param response - Response packet
   * @param address - Breakpoint address
   * @param type - Breakpoint type (0-4)
   * @returns Breakpoint result
   *
   * @example
   * const result = BreakpointParser.parseInsert('OK', 0x08000000, 0);
   * console.log(`Breakpoint set: ${result.success}`);
   */
  static parseInsert(response: string, address: number, type: number): BreakpointResult {
    if (response === 'OK') {
      return {
        success: true,
        address,
        type
      };
    }

    // Parse error
    let error = 'Unknown error';
    if (response.startsWith('E')) {
      const code = response.substring(1);
      error = `Error code ${code}`;
    } else if (response === '') {
      error = 'Empty response (unsupported)';
    }

    return {
      success: false,
      address,
      type,
      error
    };
  }

  /**
   * Parse breakpoint remove response (z command)
   *
   * Format: z<type>,<addr>,<kind>
   * Response: OK (success) or E<nn> (error)
   *
   * @param response - Response packet
   * @param address - Breakpoint address
   * @param type - Breakpoint type (0-4)
   * @returns Breakpoint result
   */
  static parseRemove(response: string, address: number, type: number): BreakpointResult {
    // Same logic as insert
    return this.parseInsert(response, address, type);
  }

  /**
   * Get breakpoint type name
   *
   * @param type - Breakpoint type number
   * @returns Type name
   */
  static getTypeName(type: number): string {
    const names: Record<number, string> = {
      0: 'Software Breakpoint',
      1: 'Hardware Breakpoint',
      2: 'Write Watchpoint',
      3: 'Read Watchpoint',
      4: 'Access Watchpoint'
    };
    return names[type] || `Unknown (${type})`;
  }
}

// ============================================================================
// MONITOR PARSER
// ============================================================================

/**
 * Parser for monitor command responses
 */
export class MonitorParser {
  /**
   * Parse monitor command output
   *
   * Monitor commands return hex-encoded console output with 'O' prefix.
   * Multiple 'O' packets may be sent for long output.
   *
   * Format: OXXXXXXXX... (hex-encoded ASCII)
   *
   * Algorithm:
   * 1. Check for 'O' prefix
   * 2. Extract hex data after 'O'
   * 3. Decode hex pairs to ASCII characters
   *
   * @param packet - Response packet starting with 'O'
   * @returns Parsed monitor output or error
   *
   * @example
   * // O48656c6c6f (hex for "Hello")
   * const result = MonitorParser.parse('O48656c6c6f');
   * if (result.success) {
   *   console.log(result.data.output); // "Hello"
   * }
   */
  static parse(packet: string): ParseResult<MonitorResponse> {
    try {
      // Step 1: Validate prefix
      if (!packet.startsWith('O')) {
        return { success: false, error: 'Not a monitor output packet (must start with O)', raw: packet };
      }

      // Step 2: Extract hex data
      const hexData = packet.substring(1);

      if (hexData.length === 0) {
        return {
          success: true,
          data: { output: '', hex: '' }
        };
      }

      if (!/^[0-9a-fA-F]+$/.test(hexData)) {
        return { success: false, error: 'Invalid hex characters in monitor output', raw: packet };
      }

      if (hexData.length % 2 !== 0) {
        return { success: false, error: 'Odd number of hex digits in monitor output', raw: packet };
      }

      // Step 3: Decode hex to ASCII
      let output = '';
      for (let i = 0; i < hexData.length; i += 2) {
        const byte = parseInt(hexData.substring(i, i + 2), 16);
        output += String.fromCharCode(byte);
      }

      return {
        success: true,
        data: { output, hex: hexData }
      };
    } catch (error) {
      return {
        success: false,
        error: `Monitor output parse error: ${(error as Error).message}`,
        raw: packet
      };
    }
  }

  /**
   * Encode monitor command to hex for qRcmd
   *
   * @param command - ASCII command string
   * @returns Hex-encoded command
   */
  static encodeCommand(command: string): string {
    return Array.from(command)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }
}

// ============================================================================
// ERROR PARSER
// ============================================================================

/**
 * Parser for error responses
 */
export class ErrorParser {
  /**
   * Standard GDB error codes
   */
  private static readonly ERROR_MESSAGES: Record<number, string> = {
    0x00: 'No error',
    0x01: 'Generic error',
    0x02: 'Invalid memory address',
    0x03: 'Invalid register number',
    0x04: 'Not stopped',
    0x05: 'Not running',
    0x06: 'Invalid parameter',
    0x07: 'Permission denied',
    0x08: 'Not supported',
    0x09: 'Resource not available',
    0x0A: 'Invalid thread',
    0x0B: 'Invalid target',
  };

  /**
   * Parse error response
   *
   * Format: Enn
   * - nn: Two-digit hex error code
   *
   * @param packet - Error packet
   * @returns Parsed error or error
   *
   * @example
   * const result = ErrorParser.parse('E02');
   * if (result.success) {
   *   console.log(result.data.message); // "Invalid memory address"
   * }
   */
  static parse(packet: string): ParseResult<ErrorResponse> {
    try {
      if (!packet.startsWith('E')) {
        return { success: false, error: 'Not an error packet', raw: packet };
      }

      if (packet.length < 2) {
        return { success: false, error: 'Error packet too short', raw: packet };
      }

      const code = packet.substring(1);

      if (!/^[0-9a-fA-F]+$/.test(code)) {
        return { success: false, error: 'Invalid hex in error code', raw: packet };
      }

      const codeNum = parseInt(code, 16);
      const message = this.ERROR_MESSAGES[codeNum] || `Unknown error (code ${code})`;

      return {
        success: true,
        data: {
          code,
          codeNum,
          message
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Error parse error: ${(error as Error).message}`,
        raw: packet
      };
    }
  }
}

// ============================================================================
// MAIN PARSER UTILITY
// ============================================================================

/**
 * Main RSP parser utility
 *
 * Provides high-level parsing methods and response type detection.
 */
export class RspParser {
  /**
   * Auto-detect response type and parse accordingly
   *
   * @param response - Raw response string (packet data without $ and #checksum)
   * @returns Parsed response with type information
   */
  static parse(response: string): {
    type: 'ok' | 'error' | 'data' | 'stop' | 'monitor' | 'empty';
    data?: unknown;
    error?: string;
  } {
    // Empty response
    if (response === '') {
      return { type: 'empty' };
    }

    // OK response
    if (response === 'OK') {
      return { type: 'ok' };
    }

    // Error response
    if (response.startsWith('E')) {
      const result = ErrorParser.parse(response);
      if (result.success) {
        return { type: 'error', data: result.data };
      } else {
        return { type: 'error', error: result.error };
      }
    }

    // Stop reply
    if (response.startsWith('S') || response.startsWith('T')) {
      const result = StopReplyParser.parse(response);
      if (result.success) {
        return { type: 'stop', data: result.data };
      } else {
        return { type: 'stop', error: result.error };
      }
    }

    // Monitor output
    if (response.startsWith('O')) {
      const result = MonitorParser.parse(response);
      if (result.success) {
        return { type: 'monitor', data: result.data };
      } else {
        return { type: 'monitor', error: result.error };
      }
    }

    // Data response (default)
    return { type: 'data', data: response };
  }

  /**
   * Check if response indicates success
   *
   * @param response - Raw response string
   * @returns True if success (OK or valid data)
   */
  static isSuccess(response: string): boolean {
    if (response === 'OK') {
      return true;
    }

    if (response.startsWith('E') || response === '') {
      return false;
    }

    return true;
  }

  /**
   * Check if response indicates error
   *
   * @param response - Raw response string
   * @returns True if error
   */
  static isError(response: string): boolean {
    return response.startsWith('E') || response === '';
  }

  // Re-export sub-parsers for convenience
  static Register = RegisterParser;
  static Memory = MemoryParser;
  static StopReply = StopReplyParser;
  static Breakpoint = BreakpointParser;
  static Monitor = MonitorParser;
  static Error = ErrorParser;
}
