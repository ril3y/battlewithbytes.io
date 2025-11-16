#!/usr/bin/env node

/**
 * Automated test script for BattleMagic binary analysis
 * Tests the complete analysis pipeline via serial GDB connection
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Configuration
const SERIAL_PORT = 'COM3'; // Adjust to your Black Magic Probe port
const BAUD_RATE = 115200;

class GDBTestClient {
  constructor(portPath) {
    this.port = new SerialPort({
      path: portPath,
      baudRate: BAUD_RATE,
    });

    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    this.responseBuffer = [];
    this.waitingForResponse = false;

    this.parser.on('data', (line) => {
      console.log('[RX]', line);
      this.responseBuffer.push(line);
    });

    this.port.on('error', (err) => {
      console.error('[ERROR]', err.message);
    });
  }

  async sendCommand(cmd) {
    return new Promise((resolve) => {
      this.responseBuffer = [];
      this.port.write(cmd + '\r\n', () => {
        console.log('[TX]', cmd);
        setTimeout(() => {
          resolve(this.responseBuffer.join('\n'));
        }, 200);
      });
    });
  }

  async readMemory(address, length) {
    const hexAddr = address.toString(16);
    const hexLen = length.toString(16);
    const response = await this.sendCommand(`x/${length}xb 0x${hexAddr}`);

    // Parse memory dump from GDB
    const bytes = [];
    const lines = response.split('\n');
    for (const line of lines) {
      const match = line.match(/0x[0-9a-f]+:\s+(.+)/i);
      if (match) {
        const hexBytes = match[1].trim().split(/\s+/);
        for (const hexByte of hexBytes) {
          if (hexByte.startsWith('0x')) {
            bytes.push(parseInt(hexByte, 16));
          }
        }
      }
    }

    return new Uint8Array(bytes);
  }

  async close() {
    this.port.close();
  }
}

async function testAnalysis() {
  console.log('=== BattleMagic Analysis Test ===\n');

  const gdb = new GDBTestClient(SERIAL_PORT);

  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for connection

  try {
    // Step 1: Halt target
    console.log('\n[TEST] Halting target...');
    await gdb.sendCommand('monitor halt');

    // Step 2: Read vector table
    console.log('\n[TEST] Reading vector table from 0x0...');
    const vectorTable = await gdb.readMemory(0x0, 8);

    if (vectorTable.length >= 8) {
      const initialSP = new DataView(vectorTable.buffer).getUint32(0, true);
      const resetVector = new DataView(vectorTable.buffer).getUint32(4, true);
      const resetAddr = resetVector & 0xFFFFFFFE;

      console.log('[TEST] Vector Table:');
      console.log(`  Initial SP: 0x${initialSP.toString(16).toUpperCase()}`);
      console.log(`  Reset Vector: 0x${resetVector.toString(16).toUpperCase()}`);
      console.log(`  Reset Address: 0x${resetAddr.toString(16).toUpperCase()}`);

      // Step 3: Read code from reset vector
      console.log(`\n[TEST] Reading 256 bytes from reset vector at 0x${resetAddr.toString(16)}...`);
      const code = await gdb.readMemory(resetAddr, 256);

      if (code.length > 0) {
        console.log(`[TEST] Successfully read ${code.length} bytes`);
        console.log('[TEST] First 16 bytes:',
          Array.from(code.slice(0, 16))
            .map(b => b.toString(16).padStart(2, '0').toUpperCase())
            .join(' ')
        );

        // Check if it's erased flash
        const isErased = code.every(b => b === 0xFF);
        const isBlank = code.every(b => b === 0x00);

        if (isErased) {
          console.log('[TEST] ❌ Memory is erased (all 0xFF)');
        } else if (isBlank) {
          console.log('[TEST] ❌ Memory is blank (all 0x00)');
        } else {
          console.log('[TEST] ✅ Memory contains valid data');
        }
      } else {
        console.log('[TEST] ❌ Failed to read memory');
      }

      // Step 4: Try reading larger chunk
      console.log('\n[TEST] Reading 4KB from 0x0 in 256-byte chunks...');
      const chunks = [];
      for (let offset = 0; offset < 0x1000; offset += 256) {
        process.stdout.write(`  Reading chunk at 0x${offset.toString(16).padStart(3, '0')}... `);
        const chunk = await gdb.readMemory(offset, 256);
        if (chunk.length === 256) {
          chunks.push(chunk);
          console.log('✓');
        } else {
          console.log(`✗ (got ${chunk.length} bytes)`);
          break;
        }
      }

      if (chunks.length > 0) {
        console.log(`[TEST] Successfully read ${chunks.length * 256} bytes total`);

        // Find where firmware ends (look for erased flash)
        const fullMemory = new Uint8Array(chunks.length * 256);
        chunks.forEach((chunk, i) => fullMemory.set(chunk, i * 256));

        let lastValidByte = 0;
        let consecutiveFF = 0;
        for (let i = 0; i < fullMemory.length; i++) {
          if (fullMemory[i] === 0xFF) {
            consecutiveFF++;
            if (consecutiveFF === 64) {
              lastValidByte = i - 64;
              break;
            }
          } else {
            consecutiveFF = 0;
            lastValidByte = i;
          }
        }

        console.log(`[TEST] Firmware appears to end at: 0x${lastValidByte.toString(16).toUpperCase()}`);
      }

    } else {
      console.log('[TEST] ❌ Failed to read vector table');
    }

  } catch (error) {
    console.error('[TEST] Error:', error.message);
  } finally {
    await gdb.close();
    console.log('\n[TEST] Test complete');
  }
}

// Run the test
testAnalysis().catch(console.error);
