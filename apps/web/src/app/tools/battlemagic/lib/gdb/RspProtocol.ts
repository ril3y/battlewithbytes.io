/**
 * GDB Remote Serial Protocol (RSP) Implementation
 *
 * Handles encoding and decoding of GDB RSP packets with proper checksums,
 * escaping, and binary data support.
 *
 * Packet format: $packet-data#checksum
 * - $ = start delimiter
 * - packet-data = command/response data with special chars escaped
 * - # = checksum delimiter
 * - checksum = two hex digits (sum of packet-data bytes mod 256)
 *
 * Special characters:
 * - + = ACK (positive acknowledgment)
 * - - = NAK (negative acknowledgment)
 * - 0x03 = Ctrl+C interrupt
 * - * = run-length encoding marker
 * - } = escape character (XOR next char with 0x20)
 */

import type { GdbPacket, GdbResponse } from './types';

export class RspProtocol {
  /**
   * ACK character sent by GDB to acknowledge packet receipt
   */
  static readonly ACK = '+';

  /**
   * NAK character sent by GDB to request retransmission
   */
  static readonly NAK = '-';

  /**
   * Ctrl+C interrupt character
   */
  static readonly INTERRUPT = '\x03';

  /**
   * Packet start delimiter
   */
  static readonly START = '$';

  /**
   * Checksum delimiter
   */
  static readonly CHECKSUM_DELIM = '#';

  /**
   * Escape character for binary data
   */
  static readonly ESCAPE = '}';

  /**
   * Run-length encoding marker
   */
  static readonly RLE_MARKER = '*';

  /**
   * XOR value for escaped characters
   */
  static readonly ESCAPE_XOR = 0x20;

  /**
   * Calculate checksum for packet data
   *
   * The checksum is calculated as the sum of all bytes in the packet data
   * modulo 256, then converted to a two-digit hex string.
   *
   * @param data - Packet data (without $ and # delimiters)
   * @returns Two-digit hex checksum
   */
  static calculateChecksum(data: string): string {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data.charCodeAt(i);
    }
    const checksum = (sum % 256).toString(16).padStart(2, '0');
    return checksum;
  }

  /**
   * Verify packet checksum
   *
   * @param data - Packet data
   * @param checksum - Expected checksum
   * @returns True if checksum is valid
   */
  static verifyChecksum(data: string, checksum: string): boolean {
    const calculated = this.calculateChecksum(data);
    return calculated.toLowerCase() === checksum.toLowerCase();
  }

  /**
   * Encode a GDB command into an RSP packet
   *
   * Format: $command#checksum
   *
   * @param command - Command string to encode
   * @returns Complete packet string ready to send
   */
  static encodePacket(command: string): string {
    const checksum = this.calculateChecksum(command);
    return `${this.START}${command}${this.CHECKSUM_DELIM}${checksum}`;
  }

  /**
   * Decode an RSP packet
   *
   * Extracts the command/response data and validates the checksum.
   *
   * @param packet - Raw packet string (including $ and #checksum)
   * @returns Parsed packet or null if invalid
   */
  static decodePacket(packet: string): GdbPacket | null {
    // Handle ACK/NAK
    if (packet === this.ACK || packet === this.NAK) {
      return { data: packet, checksum: '' };
    }

    // Must start with $
    if (!packet.startsWith(this.START)) {
      return null;
    }

    // Find checksum delimiter
    const checksumIndex = packet.indexOf(this.CHECKSUM_DELIM);
    if (checksumIndex === -1) {
      return null;
    }

    // Extract data and checksum
    const data = packet.substring(1, checksumIndex);
    const checksum = packet.substring(checksumIndex + 1, checksumIndex + 3);

    // Verify checksum
    if (!this.verifyChecksum(data, checksum)) {
      return null;
    }

    return { data, checksum };
  }

  /**
   * Parse a GDB response packet into a structured response
   *
   * @param packet - Decoded packet data
   * @returns Parsed response object
   */
  static parseResponse(packet: string): GdbResponse {
    // ACK/NAK
    if (packet === this.ACK) {
      return { type: 'ack' };
    }
    if (packet === this.NAK) {
      return { type: 'nak' };
    }

    // Empty packet
    if (packet === '') {
      return { type: 'empty' };
    }

    // OK response
    if (packet === 'OK') {
      return { type: 'ok' };
    }

    // Error response: Enn (where nn is exactly 2 hex digits)
    // Important: Memory data can start with 'E' (e.g., E8120020...), so check exact format
    if (packet.startsWith('E') && packet.length >= 3) {
      const errorCode = packet.substring(1, 3);
      // Check if it's a valid 2-digit hex error code followed by nothing or non-hex
      if (/^[0-9A-Fa-f]{2}$/.test(errorCode) && (packet.length === 3 || !/^[0-9A-Fa-f]/.test(packet[3]))) {
        return { type: 'error', code: errorCode };
      }
    }

    // Signal/stop reply: Snn or Tnn...
    if (packet.startsWith('S') || packet.startsWith('T')) {
      const signalHex = packet.substring(1, 3);
      const signal = parseInt(signalHex, 16);
      return { type: 'signal', signal };
    }

    // Data response
    return { type: 'data', data: packet };
  }

  /**
   * Escape binary data for transmission
   *
   * Characters that need escaping: $ # } *
   * Escaped by: } followed by (char XOR 0x20)
   *
   * @param data - Data to escape
   * @returns Escaped data string
   */
  static escapeBinaryData(data: string): string {
    let escaped = '';
    const specialChars = new Set(['$', '#', '}', '*']);

    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      if (specialChars.has(char)) {
        const code = char.charCodeAt(0);
        const escapedChar = String.fromCharCode(code ^ this.ESCAPE_XOR);
        escaped += this.ESCAPE + escapedChar;
      } else {
        escaped += char;
      }
    }

    return escaped;
  }

  /**
   * Unescape binary data from received packet
   *
   * @param data - Escaped data string
   * @returns Unescaped data
   */
  static unescapeBinaryData(data: string): string {
    let unescaped = '';
    let i = 0;

    while (i < data.length) {
      if (data[i] === this.ESCAPE) {
        // Next char is escaped
        i++;
        if (i < data.length) {
          const code = data.charCodeAt(i);
          unescaped += String.fromCharCode(code ^ this.ESCAPE_XOR);
        }
      } else {
        unescaped += data[i];
      }
      i++;
    }

    return unescaped;
  }

  /**
   * Convert hex string to bytes
   *
   * @param hex - Hex string (e.g., "48656c6c6f")
   * @returns Byte array
   */
  static hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  /**
   * Convert bytes to hex string
   *
   * @param bytes - Byte array
   * @returns Hex string
   */
  static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Encode memory write data
   *
   * Format: Maddr,length:XX... (hex bytes)
   *
   * @param address - Memory address (hex)
   * @param data - Data bytes
   * @returns Encoded command
   */
  static encodeMemoryWrite(address: string, data: Uint8Array): string {
    const hexData = this.bytesToHex(data);
    const length = data.length.toString(16);
    return `M${address},${length}:${hexData}`;
  }

  /**
   * Encode memory read command
   *
   * Format: Maddr,length
   *
   * @param address - Memory address (hex)
   * @param length - Number of bytes to read
   * @returns Encoded command
   */
  static encodeMemoryRead(address: string, length: number): string {
    const lengthHex = length.toString(16);
    return `m${address},${lengthHex}`;
  }

  /**
   * Parse memory read response
   *
   * @param response - Hex data from memory read
   * @returns Byte array
   */
  static parseMemoryData(response: string): Uint8Array {
    return this.hexToBytes(response);
  }

  /**
   * Extract packets from a buffer
   *
   * Handles partial packets and multiple packets in one buffer.
   *
   * @param buffer - Data buffer
   * @returns Array of complete packets and remaining buffer
   */
  static extractPackets(buffer: string): { packets: string[]; remaining: string } {
    const packets: string[] = [];
    let remaining = buffer;
    let i = 0;

    while (i < remaining.length) {
      const char = remaining[i];

      // Handle ACK/NAK
      if (char === this.ACK || char === this.NAK) {
        packets.push(char);
        remaining = remaining.substring(i + 1);
        i = 0;
        continue;
      }

      // Handle interrupt
      if (char === this.INTERRUPT) {
        packets.push(char);
        remaining = remaining.substring(i + 1);
        i = 0;
        continue;
      }

      // Handle packet
      if (char === this.START) {
        const checksumIndex = remaining.indexOf(this.CHECKSUM_DELIM, i);
        if (checksumIndex === -1) {
          // Incomplete packet
          break;
        }

        // Need at least 2 more chars for checksum
        if (checksumIndex + 2 >= remaining.length) {
          // Incomplete packet
          break;
        }

        // Extract complete packet
        const packet = remaining.substring(i, checksumIndex + 3);
        packets.push(packet);
        remaining = remaining.substring(checksumIndex + 3);
        i = 0;
        continue;
      }

      i++;
    }

    return { packets, remaining };
  }

  /**
   * Create an interrupt (Ctrl+C) command
   *
   * @returns Interrupt character
   */
  static createInterrupt(): string {
    return this.INTERRUPT;
  }

  /**
   * Parse stop reply packet (T response)
   *
   * Format: Tnn[key:value;]...
   * Where nn is signal number and key:value pairs provide additional info
   *
   * @param data - Packet data starting with T
   * @returns Parsed stop information
   */
  static parseStopReply(data: string): { signal: number; info: Record<string, string> } {
    const signal = parseInt(data.substring(1, 3), 16);
    const info: Record<string, string> = {};

    // Parse key:value pairs
    const remainder = data.substring(3);
    const pairs = remainder.split(';').filter(p => p.length > 0);

    for (const pair of pairs) {
      const [key, value] = pair.split(':');
      if (key && value) {
        info[key] = value;
      }
    }

    return { signal, info };
  }
}
