/**
 * Test Helper Functions
 * Utility functions for common test operations
 */

import { RspProtocol } from '../../lib/gdb/RspProtocol';

/**
 * Create a mock GDB packet for testing
 */
export function createMockPacket(data: string): string {
  return RspProtocol.encodePacket(data);
}

/**
 * Create a mock memory read response
 */
export function createMemoryReadResponse(data: Uint8Array): string {
  const hex = RspProtocol.bytesToHex(data);
  return createMockPacket(hex);
}

/**
 * Create a mock register read response
 */
export function createRegisterResponse(registerData: string): string {
  return createMockPacket(registerData);
}

/**
 * Create a mock stop reply packet
 */
export function createStopReplyPacket(
  signal: number = 5,
  info: Record<string, string> = {}
): string {
  const signalHex = signal.toString(16).padStart(2, '0');
  let packet = `T${signalHex}`;

  for (const [key, value] of Object.entries(info)) {
    packet += `${key}:${value};`;
  }

  return createMockPacket(packet);
}

/**
 * Parse hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  return RspProtocol.hexToBytes(hex);
}

/**
 * Convert Uint8Array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return RspProtocol.bytesToHex(bytes);
}

/**
 * Create a mock memory segment for testing
 */
export function createMemorySegment(
  address: number,
  data: Uint8Array,
  type: 'code' | 'data' | 'bss' = 'code'
) {
  return {
    address,
    data,
    type,
  };
}

/**
 * Compare two Uint8Arrays for equality
 */
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Create an Intel HEX line
 */
export function createIntelHexLine(
  address: number,
  type: number,
  data: number[]
): string {
  const length = data.length;
  let checksum = length + (address >> 8) + (address & 0xff) + type;

  let line = ':';
  line += length.toString(16).padStart(2, '0').toUpperCase();
  line += address.toString(16).padStart(4, '0').toUpperCase();
  line += type.toString(16).padStart(2, '0').toUpperCase();

  for (const byte of data) {
    line += byte.toString(16).padStart(2, '0').toUpperCase();
    checksum += byte;
  }

  checksum = (~checksum + 1) & 0xff;
  line += checksum.toString(16).padStart(2, '0').toUpperCase();

  return line;
}

/**
 * Wait for a condition to be true (for async testing)
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 1000,
  checkInterval: number = 10
): Promise<void> {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
}

/**
 * Create a promise that resolves after a delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock implementation for timing out a promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Create a test Firmware Data object
 */
export function createTestFirmwareData(
  format: 'hex' | 'bin' | 'elf',
  segments = []
) {
  return {
    format,
    data: new Uint8Array(),
    segments,
    entryPoint: 0x08000000,
    metadata: {
      filename: 'test.hex',
      size: 1024,
      checksum: 0xdeadbeef,
    },
  };
}
