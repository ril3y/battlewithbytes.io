#!/usr/bin/env node
/**
 * Automated firmware dump and analysis test
 *
 * Uses the working TypeScript GdbClient to:
 * 1. Connect to Black Magic Probe via serial
 * 2. Dump firmware from target
 * 3. Save to .bin file
 * 4. Analyze with Rust WASM module
 *
 * Run: node test-firmware-dump.mjs
 */

import { SerialPort } from 'serialport';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SERIAL_PORT = 'COM31'; // GDB port
const BAUD_RATE = 115200;
const FLASH_BASE = 0x0;
const READ_SIZE = 0x1000; // 4KB

/**
 * Simple GDB RSP client
 */
class GdbRspClient {
  constructor(port) {
    this.port = port;
    this.buffer = '';
  }

  /**
   * Calculate RSP checksum
   */
  static calculateChecksum(data) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum = (sum + data.charCodeAt(i)) & 0xff;
    }
    return sum;
  }

  /**
   * Build RSP packet: $data#checksum
   */
  static buildPacket(data) {
    const checksum = GdbRspClient.calculateChecksum(data);
    return `$${data}#${checksum.toString(16).padStart(2, '0')}`;
  }

  /**
   * Send command and wait for response
   */
  async sendCommand(cmd, waitForStopReply = false) {
    return new Promise((resolve, reject) => {
      const packet = GdbRspClient.buildPacket(cmd);
      console.log(`[TX] ${packet}`);

      // Clear buffer
      this.buffer = '';
      let lastDataTime = Date.now();
      let dataSettled = false;

      // Set up one-time data handler
      const timeout = setTimeout(() => {
        this.port.removeListener('data', dataHandler);
        if (this.buffer) {
          resolve(this.buffer); // Return what we got
        } else {
          reject(new Error('Command timeout'));
        }
      }, 5000);

      const dataHandler = (data) => {
        this.buffer += data.toString();
        console.log(`[RX] ${data.toString()}`);
        lastDataTime = Date.now();

        // Send ACK for received packets (GDB protocol requires this)
        if (data.toString().includes('$') && data.toString().includes('#')) {
          this.port.write('+');
        }

        // Wait for data to settle (no more data for 100ms means command is complete)
        if (!dataSettled) {
          dataSettled = true;
          const checkComplete = () => {
            const timeSinceLastData = Date.now() - lastDataTime;
            if (timeSinceLastData >= 100) {
              // No data for 100ms, command is complete
              clearTimeout(timeout);
              this.port.removeListener('data', dataHandler);
              resolve(this.buffer);
            } else {
              // Keep checking
              setTimeout(checkComplete, 50);
            }
          };
          setTimeout(checkComplete, 100);
        }
      };

      this.port.on('data', dataHandler);

      // Send packet
      this.port.write(packet, (err) => {
        if (err) {
          clearTimeout(timeout);
          this.port.removeListener('data', dataHandler);
          reject(err);
        }
      });
    });
  }

  /**
   * Parse different response types
   */
  static parseResponse(response) {
    // Extract all packets from response
    const packets = response.match(/\$[^$]*#[0-9a-fA-F]{2}/g) || [];

    let consoleOutput = '';
    let finalResponse = null;

    for (const packet of packets) {
      const match = packet.match(/\$([^#]*)#/);
      if (!match) continue;

      const data = match[1];

      // Console output packet: $O<hexdata>#
      if (data.startsWith('O') && data.length > 1 && data !== 'OK') {
        const hexData = data.substring(1);
        const bytes = [];
        for (let i = 0; i < hexData.length; i += 2) {
          bytes.push(parseInt(hexData.substr(i, 2), 16));
        }
        consoleOutput += Buffer.from(bytes).toString();
      }
      // OK response
      else if (data === 'OK') {
        finalResponse = { type: 'ok', consoleOutput };
      }
      // Stop reply: $T##...#
      else if (data.startsWith('T')) {
        finalResponse = { type: 'stop', signal: data, consoleOutput };
      }
      // Error: $ENN#
      else if (data.startsWith('E') && data.length <= 3) {
        const errorCode = parseInt(data.substring(1), 16);
        finalResponse = { type: 'error', code: errorCode, consoleOutput };
      }
      // Memory data (hex string that's not error or OK)
      else if (data.length > 0 && data !== 'OK' && !data.startsWith('O')) {
        finalResponse = { type: 'data', data, consoleOutput };
      }
    }

    return finalResponse || { type: 'unknown', consoleOutput, raw: response };
  }

  /**
   * Parse memory response specifically
   */
  static parseMemoryData(hexData) {
    // Check for error response: $ENN# where NN is error code
    if (hexData.startsWith('E')) {
      const errorCode = parseInt(hexData.substring(1), 16);
      throw new Error(`GDB error ${errorCode}: Cannot access memory (error code 0x${errorCode.toString(16)})`);
    }

    const bytes = [];
    for (let i = 0; i < hexData.length; i += 2) {
      bytes.push(parseInt(hexData.substr(i, 2), 16));
    }

    return Buffer.from(bytes);
  }

  /**
   * Read memory from target
   */
  async readMemory(address, length) {
    const cmd = `m${address.toString(16)},${length.toString(16)}`;
    const response = await this.sendCommand(cmd);
    const parsed = GdbRspClient.parseResponse(response);

    if (parsed.type === 'error') {
      throw new Error(`Memory read failed: error code ${parsed.code}`);
    }

    if (parsed.type !== 'data') {
      throw new Error(`Unexpected response type: ${parsed.type}`);
    }

    return GdbRspClient.parseMemoryData(parsed.data);
  }

  /**
   * Halt target (send Ctrl-C) and wait for stop reply
   */
  async halt() {
    return new Promise((resolve, reject) => {
      // Clear buffer
      this.buffer = '';

      const timeout = setTimeout(() => {
        this.port.removeListener('data', dataHandler);
        // Even if no stop reply, resolve anyway
        resolve({ type: 'timeout' });
      }, 2000);

      const dataHandler = (data) => {
        this.buffer += data.toString();
        console.log(`[RX] ${data.toString()}`);

        // Wait for stop reply (T packet)
        if (this.buffer.includes('$T')) {
          clearTimeout(timeout);
          this.port.removeListener('data', dataHandler);
          const parsed = GdbRspClient.parseResponse(this.buffer);
          console.log(`   Stop reply: ${parsed.type} ${parsed.signal || ''}`);
          resolve(parsed);
        }
      };

      this.port.on('data', dataHandler);

      // Send Ctrl-C
      this.port.write(Buffer.from([0x03]), (err) => {
        if (err) {
          clearTimeout(timeout);
          this.port.removeListener('data', dataHandler);
          reject(err);
        }
      });
    });
  }

  /**
   * Send monitor command
   */
  async monitorCommand(cmd) {
    // Monitor commands use qRcmd packet
    const hexCmd = Buffer.from(cmd).toString('hex');
    const packet = `qRcmd,${hexCmd}`;
    return await this.sendCommand(packet);
  }

  /**
   * Scan for targets
   */
  async scanTargets() {
    console.log('   Scanning for targets...');
    const response = await this.monitorCommand('swdp_scan');
    const parsed = GdbRspClient.parseResponse(response);

    if (parsed.consoleOutput) {
      console.log(`   Scan output:\n${parsed.consoleOutput}`);
    }

    return parsed;
  }

  /**
   * Attach to target
   */
  async attach(targetNum = 1) {
    console.log(`   Attaching to target ${targetNum}...`);
    // PID must be in hex format
    const pidHex = targetNum.toString(16);
    const response = await this.sendCommand(`vAttach;${pidHex}`, false); // Don't wait for stop reply
    const parsed = GdbRspClient.parseResponse(response);

    if (parsed.consoleOutput && parsed.consoleOutput.trim()) {
      // Only show unique lines (filter out duplicates)
      const lines = parsed.consoleOutput.split('\n');
      const uniqueLines = [...new Set(lines)];
      console.log(`   ${uniqueLines.join('\n   ').trim()}`);
    }

    if (parsed.type === 'error') {
      throw new Error(`Attach failed with error code ${parsed.code}`);
    }

    return parsed;
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('=== Firmware Dump and Analysis Test ===\n');

  // Step 1: Connect to serial port
  console.log(`[1] Connecting to Black Magic Probe on ${SERIAL_PORT}...`);
  const port = new SerialPort({
    path: SERIAL_PORT,
    baudRate: BAUD_RATE,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
  });

  await new Promise((resolve, reject) => {
    port.on('open', resolve);
    port.on('error', reject);
  });

  console.log('✓ Connected\n');

  const gdb = new GdbRspClient(port);

  try {
    // Step 2: Scan for targets
    console.log('[2] Scanning for targets...');
    await gdb.scanTargets();
    console.log('✓ Target scan complete\n');

    // Step 3: Attach to target
    console.log('[3] Attaching to target...');
    await gdb.attach(1);
    console.log('✓ Target attached\n');

    // Step 4: Halt target so we can read memory
    console.log('[4] Halting target...');
    const haltResult = await gdb.halt();
    console.log(`✓ Target halted (${haltResult.type})\n`);

    // Step 4.5: Test if we can read registers
    console.log('[4.5] Testing register read...');
    try {
      const regResponse = await gdb.sendCommand('g'); // Read all registers
      const regParsed = GdbRspClient.parseResponse(regResponse);
      console.log(`   Register read result: ${regParsed.type}`);
      if (regParsed.type === 'data') {
        console.log(`   Got ${regParsed.data.length} bytes of register data`);
      } else {
        console.log(`   Unexpected result, trying memory read from 0x20000000 (RAM)...`);
        const ramResponse = await gdb.sendCommand('m20000000,10');
        const ramParsed = GdbRspClient.parseResponse(ramResponse);
        console.log(`   RAM read result: ${ramParsed.type}`);
      }
    } catch (e) {
      console.log(`   Test failed: ${e.message}`);
    }
    console.log('');

    // Step 5: Read firmware in chunks
    console.log(`[5] Reading ${READ_SIZE} bytes from 0x${FLASH_BASE.toString(16)}...`);
    const chunks = [];
    const CHUNK_SIZE = 256;

    for (let offset = 0; offset < READ_SIZE; offset += CHUNK_SIZE) {
      process.stdout.write(`   Reading 0x${(FLASH_BASE + offset).toString(16).padStart(4, '0')}... `);
      const chunk = await gdb.readMemory(FLASH_BASE + offset, CHUNK_SIZE);
      chunks.push(chunk);
      console.log(`✓ (${chunk.length} bytes)`);
    }

    const firmware = Buffer.concat(chunks);
    console.log(`✓ Read ${firmware.length} bytes total\n`);

    // Step 6: Parse vector table
    console.log('[6] Parsing ARM Cortex-M vector table...');
    const initialSP = firmware.readUInt32LE(0);
    const resetVector = firmware.readUInt32LE(4);
    const resetAddr = resetVector & 0xFFFFFFFE;

    console.log(`   Initial SP: 0x${initialSP.toString(16).toUpperCase()}`);
    console.log(`   Reset Vector: 0x${resetVector.toString(16).toUpperCase()}`);
    console.log(`   Reset Address: 0x${resetAddr.toString(16).toUpperCase()}`);
    console.log('✓ Vector table parsed\n');

    // Step 7: Save firmware
    const outputPath = join(__dirname, 'test-data', 'nrf52_firmware.bin');
    console.log(`[7] Saving firmware to ${outputPath}...`);
    await fs.writeFile(outputPath, firmware);
    console.log(`✓ Saved ${firmware.length} bytes\n`);

    // Step 8: Save metadata
    const metadata = {
      initial_sp: `0x${initialSP.toString(16).toUpperCase()}`,
      reset_vector: `0x${resetVector.toString(16).toUpperCase()}`,
      reset_address: `0x${resetAddr.toString(16).toUpperCase()}`,
      firmware_size: firmware.length,
      architecture: 'ARM Thumb',
      mcu: 'NRF52',
      flash_base: `0x${FLASH_BASE.toString(16).toUpperCase()}`,
    };

    const metadataPath = join(__dirname, 'test-data', 'nrf52_firmware.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`✓ Saved metadata to ${metadataPath}\n`);

    // Step 9: Next steps
    console.log('[9] Next: Test WASM disassembly');
    console.log('   Run: node test-elf.mjs test-data/nrf52_firmware.bin');
    console.log('   (or open test-browser.html and drag the .bin file)');

    console.log('\n=== Test Complete ===');
    console.log('\nFirmware successfully dumped via serial!');
    console.log('Next: Test WASM analyzer with the dumped firmware');

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  } finally {
    port.close();
  }
}

// Run test
main().catch(console.error);
