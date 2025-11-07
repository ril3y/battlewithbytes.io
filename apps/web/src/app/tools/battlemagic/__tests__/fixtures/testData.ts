/**
 * Test Data Fixtures
 * Common test data used across multiple test suites
 */

/**
 * Sample memory data for testing
 */
export const SAMPLE_MEMORY = {
  // Simple pattern: 0x00, 0x01, 0x02, ..., 0x0F
  simple: new Uint8Array([
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
  ]),

  // ARM instruction: MOVS r0, #0
  armInstruction: new Uint8Array([0x00, 0x20]),

  // Mixed data with special characters
  withSpecialChars: new Uint8Array([0x24, 0x23, 0x7d, 0x2a]),
};

/**
 * Sample Intel HEX records for testing
 */
export const INTEL_HEX_SAMPLES = {
  // Simple data record at address 0x0000
  simpleDataRecord: ':10000000000102030405060708090A0B0C0D0EF',

  // Extended linear address record
  extendedAddress: ':020000040000FA',

  // Complete hex file with multiple records
  completeFile: `:10000000000102030405060708090A0B0C0D0E7B
:10001000101112131415161718191A1B1C1D1E6B
:00000001FF`,

  // Hex with extended linear address
  withExtendedAddr: `:020000040008F2
:10000000000102030405060708090A0B0C0D0E7B
:00000001FF`,
};

/**
 * Sample Motorola S-Record records for testing
 */
export const S_RECORD_SAMPLES = {
  // Header record
  headerRecord: 'S00F000068747470733A2F2F7777772E61',

  // Data record with 16-bit address
  dataRecord16: 'S1137AF00011223344556677889900112233443398',

  // Data record with 24-bit address
  dataRecord24: 'S2157AF00011223344556677889900112233443397',

  // Data record with 32-bit address
  dataRecord32: 'S3177AF00011223344556677889900112233443396',

  // Start address record
  startAddress: 'S7057AF00000F8',

  // Complete S-record file
  completeFile: `S00F000068747470733A2F2F7777772E61
S1137AF00011223344556677889900112233443398
S5030001FB
S7057AF00000F8`,
};

/**
 * Sample GDB RSP packets for testing
 */
export const GDB_PACKETS = {
  // Simple OK response
  ok: '$OK#9a',

  // Error response
  error: '$E01#a6',

  // Signal response (SIGTRAP = 0x05)
  signal: '$S05#b8',

  // Data response
  data: '$abcdef#21',

  // Stop reply (SIGTRAP with thread info)
  stopReply: '$T0501:6465636f64696e673b#12',

  // ACK
  ack: '+',

  // NAK
  nak: '-',

  // Interrupt
  interrupt: '\x03',
};

/**
 * Sample register values
 */
export const REGISTER_DATA = {
  // Hex representation of ARM registers (little-endian)
  // R0-R15, XPSR, MSP, PSP, etc.
  armRegisters:
    '000000000100000002000000030000000400000005000000060000000700000008000000' +
    '09000000' +
    '0a000000' +
    '0b000000' +
    '0c000000' +
    '0d000000' +
    '0e000000' +
    '0f000000' +
    '01000000' +
    '01000000' +
    '01000000' +
    '00000000' +
    '00000000' +
    '02000000',
};

/**
 * Sample Intel HEX file content
 */
export const HEX_FILE_CONTENT = `
:10000000214601360121470136007EFE09D219012F
:100010004E17C20768C20768C20768C20768C20739
:00000001FF
`;

/**
 * Sample binary firmware data
 */
export const BINARY_FIRMWARE = new Uint8Array([
  0x48, 0x00, 0x00, 0x20, 0xC9, 0x00, 0x00, 0x00,
  0x7D, 0x00, 0x00, 0x00, 0x7D, 0x00, 0x00, 0x00,
]);

/**
 * ARM Thumb instruction samples
 */
export const THUMB_INSTRUCTIONS = {
  // MOVS r0, #0 (little-endian: 00 20)
  movs_r0_0: new Uint8Array([0x00, 0x20]),

  // ADD r1, r2, r3 (little-endian)
  add_r1_r2_r3: new Uint8Array([0x11, 0x44]),

  // BL #1024 (branch and link - 4 byte Thumb-2 instruction)
  bl_1024: new Uint8Array([0x00, 0xf0, 0x00, 0xd0]),

  // Invalid instruction
  invalid: new Uint8Array([0xff, 0xff]),
};

/**
 * Black Magic Probe version string
 */
export const BMP_VERSION_STRING =
  'Black Magic Probe version 1.7.1\ngit version 3f4b4b84ae';

/**
 * Target scan results
 */
export const TARGET_SCAN_RESULT = `Available Targets:
 No. Att Driver
  0      Cortex M3  m4 (Cortex-M3) part ID 0x4ba00477`;

/**
 * Memory access test patterns
 */
export const MEMORY_PATTERNS = {
  // Incrementing pattern
  incrementing: (size: number): Uint8Array => {
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = i & 0xff;
    }
    return data;
  },

  // All zeros
  zeros: (size: number): Uint8Array => new Uint8Array(size),

  // All ones
  ones: (size: number): Uint8Array => {
    const data = new Uint8Array(size);
    data.fill(0xff);
    return data;
  },

  // Alternating pattern
  alternating: (size: number): Uint8Array => {
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = i % 2 === 0 ? 0xaa : 0x55;
    }
    return data;
  },
};
