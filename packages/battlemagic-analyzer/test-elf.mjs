#!/usr/bin/env node
/**
 * Test script for analyzing an ELF binary with the battlemagic-analyzer WASM module
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ArmAnalyzer } from './pkg/battlemagic_analyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the ELF file
const elfPath = path.join(__dirname, '..', '..', 'b94203ea530de4ec07eaa010cfa1466cf3cc2f72052fa7320b645ce3b305683a.elf');

console.log('Loading ELF file:', elfPath);

// Read the ELF file
const elfData = fs.readFileSync(elfPath);
console.log(`ELF file size: ${elfData.length} bytes\n`);

// For this test, we'll extract and analyze a section of the .text segment
// In a real implementation, you'd parse the ELF headers to find the .text section
// For now, let's manually extract some code from the beginning

// Skip ELF header and find executable code
// Based on the file output, this is an ARM binary
// Let's start analyzing from a typical code offset

const CODE_OFFSET = 0x1000; // Typical code start for Android shared objects
const CODE_SIZE = 0x1000;   // Analyze 4KB of code

if (CODE_OFFSET + CODE_SIZE > elfData.length) {
    console.error('Code offset exceeds file size');
    process.exit(1);
}

// Extract code bytes
const codeBytes = elfData.slice(CODE_OFFSET, CODE_OFFSET + CODE_SIZE);
console.log(`Analyzing ${codeBytes.length} bytes from offset 0x${CODE_OFFSET.toString(16)}`);

// Create simple disassembly (this would normally come from a disassembler like Capstone)
// For testing, we'll create mock instructions based on the binary patterns we see
const mockDisassembly = [];

// Parse ARM Thumb instructions (2-byte and 4-byte)
let addr = CODE_OFFSET;
let i = 0;

while (i < Math.min(codeBytes.length, 512)) { // Analyze first 512 bytes
    const byte1 = codeBytes[i];
    const byte2 = codeBytes[i + 1] || 0;
    const word = byte1 | (byte2 << 8);

    // Detect common ARM Thumb patterns
    let mnemonic = 'unknown';
    let operands = '';
    let size = 2;

    // PUSH instruction (b4xx, b5xx)
    if ((word & 0xfe00) === 0xb400) {
        mnemonic = 'push';
        const reglist = word & 0x1ff;
        operands = `{r${reglist.toString(2)}}`;
    }
    // POP instruction (bcxx, bdxx)
    else if ((word & 0xfe00) === 0xbc00) {
        mnemonic = 'pop';
        const reglist = word & 0x1ff;
        operands = `{r${reglist.toString(2)}}`;
    }
    // BL instruction (f000 f800 range - 4 bytes)
    else if ((word & 0xf800) === 0xf000) {
        const byte3 = codeBytes[i + 2] || 0;
        const byte4 = codeBytes[i + 3] || 0;
        const word2 = byte3 | (byte4 << 8);

        if ((word2 & 0xd000) === 0xd000) {
            mnemonic = 'bl';
            // Simplified offset calculation
            const offset = ((word & 0x7ff) << 12) | ((word2 & 0x7ff) << 1);
            const target = addr + 4 + offset;
            operands = `#0x${target.toString(16)}`;
            size = 4;
        }
    }
    // B instruction (e0xx)
    else if ((word & 0xf800) === 0xe000) {
        mnemonic = 'b';
        const offset = (word & 0x7ff) << 1;
        const target = addr + 4 + offset;
        operands = `#0x${target.toString(16)}`;
    }
    // LDR PC-relative
    else if ((word & 0xf800) === 0x4800) {
        mnemonic = 'ldr';
        const rt = (word >> 8) & 0x7;
        const imm = (word & 0xff) << 2;
        operands = `r${rt}, [pc, #0x${imm.toString(16)}]`;
    }
    // MOV instruction
    else if ((word & 0xff00) === 0x2000) {
        mnemonic = 'movs';
        const rd = (word >> 8) & 0x7;
        const imm = word & 0xff;
        operands = `r${rd}, #${imm}`;
    }

    mockDisassembly.push({
        address: addr,
        bytes: Array.from(codeBytes.slice(i, i + size)),
        mnemonic: mnemonic,
        operands: operands
    });

    addr += size;
    i += size;
}

console.log(`Created ${mockDisassembly.length} mock instructions\n`);

// Show first 10 instructions
console.log('First 10 instructions:');
mockDisassembly.slice(0, 10).forEach(inst => {
    const bytesHex = inst.bytes.map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log(`  0x${inst.address.toString(16).padStart(8, '0')}: ${bytesHex.padEnd(12)} ${inst.mnemonic} ${inst.operands}`);
});
console.log('');

// Create analyzer instance
console.log('Creating ARM analyzer...');
const analyzer = new ArmAnalyzer(CODE_OFFSET);

// Analyze the disassembly
console.log('Analyzing binary...');
try {
    const results = analyzer.analyze_from_disasm(mockDisassembly);

    console.log('\n=== Analysis Results ===');
    console.log(`Total instructions analyzed: ${results.total_instructions}`);
    console.log(`Cross-references found: ${results.xrefs.length}`);
    console.log(`Unique targets: ${results.unique_targets}`);
    console.log(`Address range: 0x${results.start_address.toString(16)} - 0x${results.end_address.toString(16)}`);
    console.log(`Analysis time: ${results.analysis_time_ms}ms\n`);

    // Group xrefs by type
    const xrefsByType = {};
    results.xrefs.forEach(xref => {
        if (!xrefsByType[xref.xref_type]) {
            xrefsByType[xref.xref_type] = [];
        }
        xrefsByType[xref.xref_type].push(xref);
    });

    console.log('Cross-references by type:');
    Object.keys(xrefsByType).forEach(type => {
        console.log(`  ${type}: ${xrefsByType[type].length}`);
    });
    console.log('');

    // Show first 20 xrefs
    console.log('First 20 cross-references:');
    results.xrefs.slice(0, 20).forEach(xref => {
        console.log(`  0x${xref.from_addr.toString(16).padStart(8, '0')} -> 0x${xref.to_addr.toString(16).padStart(8, '0')} [${xref.xref_type.padEnd(18)}] ${xref.instruction} ${xref.operands}`);
    });

    // Test xref queries
    if (results.xrefs.length > 0) {
        const firstTarget = results.xrefs[0].to_addr;
        console.log(`\nQuerying xrefs to 0x${firstTarget.toString(16)}:`);
        const xrefsTo = analyzer.get_xrefs_to(firstTarget);
        console.log(`  Found ${xrefsTo.count} reference(s)`);
    }

    console.log('\n✅ Test completed successfully!');
} catch (error) {
    console.error('Error during analysis:', error);
    process.exit(1);
}
