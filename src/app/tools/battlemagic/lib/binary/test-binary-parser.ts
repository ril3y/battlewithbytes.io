/**
 * Test Binary Parser
 *
 * Example usage and testing of the binary parser architecture.
 * This file demonstrates how to use the parser system.
 */

import { BinaryParserFactory } from './BinaryParserFactory';
import { BinaryParseOptions } from './types';

/**
 * Create a sample ARM Cortex-M binary with vector table
 */
function createSampleArmBinary(): Uint8Array {
  const buffer = new ArrayBuffer(1024);
  const view = new DataView(buffer);

  // Initial stack pointer (pointing to end of RAM)
  view.setUint32(0x00, 0x20020000, true); // 128KB RAM end

  // Reset handler (with thumb bit set)
  view.setUint32(0x04, 0x08000101, true); // Flash start + offset + thumb bit

  // NMI handler
  view.setUint32(0x08, 0x08000201, true);

  // HardFault handler
  view.setUint32(0x0C, 0x08000301, true);

  // MemManage handler
  view.setUint32(0x10, 0x08000401, true);

  // BusFault handler
  view.setUint32(0x14, 0x08000501, true);

  // UsageFault handler
  view.setUint32(0x18, 0x08000601, true);

  // Reserved entries (7-10)
  view.setUint32(0x1C, 0x00000000, true);
  view.setUint32(0x20, 0x00000000, true);
  view.setUint32(0x24, 0x00000000, true);
  view.setUint32(0x28, 0x00000000, true);

  // SVCall handler
  view.setUint32(0x2C, 0x08000701, true);

  // DebugMonitor handler
  view.setUint32(0x30, 0x08000801, true);

  // Reserved
  view.setUint32(0x34, 0x00000000, true);

  // PendSV handler
  view.setUint32(0x38, 0x08000901, true);

  // SysTick handler
  view.setUint32(0x3C, 0x08000A01, true);

  // External interrupts (16+)
  for (let i = 0; i < 32; i++) {
    view.setUint32(0x40 + i * 4, 0x08001001 + i * 0x100, true);
  }

  // Add some Thumb-2 instructions after the vector table
  // PUSH {r4-r7, lr}
  view.setUint16(0x100, 0xB5F0, true);
  // MOV r0, #0
  view.setUint16(0x102, 0x2000, true);
  // BL somewhere
  view.setUint32(0x104, 0xF000F800, true);
  // POP {r4-r7, pc}
  view.setUint16(0x108, 0xBDF0, true);

  return new Uint8Array(buffer);
}

/**
 * Create a sample MIPS binary
 */
function createSampleMipsBinary(): Uint8Array {
  const buffer = new ArrayBuffer(512);
  const view = new DataView(buffer);

  // Jump to main entry point (J instruction)
  view.setUint32(0x00, 0x08000100, false); // J 0x08000400 (simplified)

  // NOP
  view.setUint32(0x04, 0x00000000, false);

  // Some MIPS instructions
  // LUI $t0, 0x1234
  view.setUint32(0x08, 0x3C081234, false);

  // ADDIU $t0, $t0, 0x5678
  view.setUint32(0x0C, 0x25085678, false);

  // SW $t0, 0($sp)
  view.setUint32(0x10, 0xAFA80000, false);

  return new Uint8Array(buffer);
}

/**
 * Create a sample RISC-V binary
 */
function createSampleRiscVBinary(): Uint8Array {
  const buffer = new ArrayBuffer(512);
  const view = new DataView(buffer);

  // JAL to main (jump and link)
  view.setUint32(0x00, 0x0100006F, true); // JAL x0, +256

  // Some RISC-V instructions
  // LUI x1, 0x12345
  view.setUint32(0x04, 0x123450B7, true);

  // ADDI x2, x1, 0x678
  view.setUint32(0x08, 0x67808113, true);

  // SW x2, 0(sp)
  view.setUint32(0x0C, 0x00212023, true);

  // Compressed instruction (C.NOP)
  view.setUint16(0x10, 0x0001, true);

  return new Uint8Array(buffer);
}

/**
 * Test the binary parser with different architectures
 */
export async function testBinaryParser() {
  console.log('Testing Binary Parser Architecture\n');
  console.log('=' .repeat(50));

  // Test ARM binary
  console.log('\n1. Testing ARM Cortex-M Binary:');
  console.log('-'.repeat(30));

  const armBinary = createSampleArmBinary();
  const armOptions: BinaryParseOptions = {
    baseAddress: 0x08000000,
    forceArchitecture: 'ARM',
    architectureOptions: {
      arm: {
        assumeCortexM: true
      }
    }
  };

  const armResult = await BinaryParserFactory.parse(armBinary, armOptions);

  if (armResult.success && armResult.info) {
    console.log(`✓ Architecture: ${armResult.info.architecture}`);
    console.log(`✓ Entry Point: 0x${armResult.info.entryPoint.toString(16)}`);
    console.log(`✓ Stack Pointer: 0x${armResult.info.stackPointer?.toString(16)}`);
    console.log(`✓ Vectors Found: ${armResult.info.vectors.length}`);

    // Display first few vectors
    console.log('\nVector Table:');
    armResult.info.vectors.slice(0, 5).forEach(v => {
      console.log(`  [${v.index}] ${v.name}: 0x${v.handlerAddress?.toString(16)} (${v.type})`);
    });
  } else {
    console.log(`✗ Parse failed: ${armResult.error}`);
  }

  // Test MIPS binary
  console.log('\n2. Testing MIPS Binary:');
  console.log('-'.repeat(30));

  const mipsBinary = createSampleMipsBinary();
  const mipsOptions: BinaryParseOptions = {
    baseAddress: 0xBFC00000,
    forceArchitecture: 'MIPS'
  };

  const mipsResult = await BinaryParserFactory.parse(mipsBinary, mipsOptions);

  if (mipsResult.success && mipsResult.info) {
    console.log(`✓ Architecture: ${mipsResult.info.architecture}`);
    console.log(`✓ Entry Point: 0x${mipsResult.info.entryPoint.toString(16)}`);
    console.log(`✓ Endianness: ${mipsResult.info.metadata.endianness}`);
    console.log(`✓ Vectors Found: ${mipsResult.info.vectors.length}`);
  } else {
    console.log(`✗ Parse failed: ${mipsResult.error}`);
  }

  // Test RISC-V binary
  console.log('\n3. Testing RISC-V Binary:');
  console.log('-'.repeat(30));

  const riscvBinary = createSampleRiscVBinary();
  const riscvOptions: BinaryParseOptions = {
    baseAddress: 0x80000000,
    forceArchitecture: 'RISCV',
    architectureOptions: {
      riscv: {
        assumeEmbedded: true
      }
    }
  };

  const riscvResult = await BinaryParserFactory.parse(riscvBinary, riscvOptions);

  if (riscvResult.success && riscvResult.info) {
    console.log(`✓ Architecture: ${riscvResult.info.architecture}`);
    console.log(`✓ Entry Point: 0x${riscvResult.info.entryPoint.toString(16)}`);

    if (riscvResult.info.metadata.architectureMetadata?.arch === 'RISCV') {
      const riscvMeta = riscvResult.info.metadata.architectureMetadata.specific;
      console.log(`✓ Base ISA: ${riscvMeta.baseIsa}`);
      console.log(`✓ Extensions: ${riscvMeta.extensions.join(', ') || 'none'}`);
    }
  } else {
    console.log(`✗ Parse failed: ${riscvResult.error}`);
  }

  // Test auto-detection
  console.log('\n4. Testing Auto-Detection:');
  console.log('-'.repeat(30));

  const autoResult = await BinaryParserFactory.parse(armBinary, {
    baseAddress: 0x08000000
    // No forceArchitecture - let it auto-detect
  });

  if (autoResult.success && autoResult.info) {
    console.log(`✓ Detected Architecture: ${autoResult.info.architecture}`);
    console.log(`✓ Confidence: See console logs above`);
  } else {
    console.log(`✗ Auto-detection failed: ${autoResult.error}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Test Complete!\n');

  return {
    arm: armResult,
    mips: mipsResult,
    riscv: riscvResult,
    auto: autoResult
  };
}

// Export for use in browser console or test runner
if (typeof window !== 'undefined') {
  (window as { testBinaryParser?: typeof testBinaryParser }).testBinaryParser = testBinaryParser;
}