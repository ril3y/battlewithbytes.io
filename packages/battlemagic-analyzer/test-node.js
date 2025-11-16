#!/usr/bin/env node

/**
 * Node.js Test Suite for BattleMagic Analyzer WASM Module
 *
 * This script tests the WASM module in a Node.js environment to verify
 * it works correctly outside of the browser.
 */

const fs = require('fs');
const path = require('path');

// Track test results
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function log(message, type = 'info') {
    const colors = {
        info: '\x1b[36m',
        success: '\x1b[32m',
        error: '\x1b[31m',
        warning: '\x1b[33m',
        reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
}

function assert(condition, message) {
    testsRun++;
    if (condition) {
        testsPassed++;
        log(`  ✓ ${message}`, 'success');
        return true;
    } else {
        testsFailed++;
        log(`  ✗ ${message}`, 'error');
        return false;
    }
}

function assertEqual(actual, expected, message) {
    return assert(actual === expected, `${message} (expected: ${expected}, got: ${actual})`);
}

function assertGreaterThan(actual, threshold, message) {
    return assert(actual > threshold, `${message} (expected > ${threshold}, got: ${actual})`);
}

function assertArrayLength(array, length, message) {
    return assertEqual(array.length, length, message);
}

async function runTests() {
    log('\n=== BattleMagic Analyzer WASM Test Suite ===\n', 'info');
    log('Loading WASM module...\n', 'info');

    try {
        // Load the WASM module
        const wasmModule = require('./pkg');
        const { BinaryAnalyzer } = wasmModule;

        log('WASM module loaded successfully!\n', 'success');

        // Test 1: Basic analyzer creation
        log('Test 1: Analyzer Creation', 'info');
        try {
            const analyzer = new BinaryAnalyzer(0x8000);
            assert(analyzer !== null, 'Analyzer instance created');
            assertEqual(analyzer.is_analyzed(), false, 'Analyzer not analyzed initially');
            assertEqual(analyzer.xref_count(), 0, 'Initial xref count is zero');
            log('');
        } catch (error) {
            log(`Test 1 failed: ${error.message}`, 'error');
        }

        // Test 2: Analyze simple ARM code
        log('Test 2: Simple ARM Analysis', 'info');
        try {
            const analyzer = new BinaryAnalyzer(0x8000);

            const disasm = [
                { address: 0x8000, bytes: [0, 0, 0, 0], mnemonic: 'bl', operands: '#0x9000' },
                { address: 0x8004, bytes: [0, 0, 0, 0], mnemonic: 'b.eq', operands: '#0x9004' },
                { address: 0x8008, bytes: [0, 0, 0, 0], mnemonic: 'ldr', operands: 'r0, [pc, #0x10]' },
            ];

            const results = analyzer.analyze_from_disasm(disasm);

            assert(results !== null, 'Analysis results returned');
            assertEqual(results.total_instructions, 3, 'Correct instruction count');
            assertEqual(results.xrefs.length, 3, 'Detected 3 cross-references');
            assertEqual(analyzer.is_analyzed(), true, 'Analyzer marked as analyzed');
            assertGreaterThan(results.analysis_time_ms, -1, 'Analysis time recorded');
            log('');
        } catch (error) {
            log(`Test 2 failed: ${error.message}`, 'error');
        }

        // Test 3: Branch detection
        log('Test 3: Branch Detection', 'info');
        try {
            const analyzer = new BinaryAnalyzer(0x1000);

            const disasm = [
                { address: 0x1000, bytes: [0, 0, 0, 0], mnemonic: 'b', operands: '#0x2000' },
                { address: 0x1004, bytes: [0, 0, 0, 0], mnemonic: 'b.eq', operands: '#0x2004' },
                { address: 0x1008, bytes: [0, 0, 0, 0], mnemonic: 'b.ne', operands: '#0x2008' },
                { address: 0x100c, bytes: [0, 0, 0, 0], mnemonic: 'bic', operands: 'r0, r1' }, // Not a branch
            ];

            const results = analyzer.analyze_from_disasm(disasm);
            assertEqual(results.xrefs.length, 3, 'Detected 3 branches (excluding bic)');
            log('');
        } catch (error) {
            log(`Test 3 failed: ${error.message}`, 'error');
        }

        // Test 4: Call detection
        log('Test 4: Call Detection', 'info');
        try {
            const analyzer = new BinaryAnalyzer(0x1000);

            const disasm = [
                { address: 0x1000, bytes: [0, 0, 0, 0], mnemonic: 'bl', operands: '#0x2000' },
                { address: 0x1004, bytes: [0, 0, 0, 0], mnemonic: 'blx', operands: '#0x2100' },
                { address: 0x1008, bytes: [0, 0, 0, 0], mnemonic: 'mov', operands: 'r0, r1' }, // Not a call
            ];

            const results = analyzer.analyze_from_disasm(disasm);
            assertEqual(results.xrefs.length, 2, 'Detected 2 function calls');

            const calls = results.xrefs.filter(x => x.xref_type === 'Call');
            assertEqual(calls.length, 2, 'Both xrefs are Call type');
            log('');
        } catch (error) {
            log(`Test 4 failed: ${error.message}`, 'error');
        }

        // Test 5: Data reference parsing
        log('Test 5: Data Reference Parsing', 'info');
        try {
            const analyzer = new BinaryAnalyzer(0x1000);

            const disasm = [
                { address: 0x1000, bytes: [0, 0, 0, 0], mnemonic: 'ldr', operands: 'r0, [pc, #0x10]' },
                { address: 0x1004, bytes: [0, 0, 0, 0], mnemonic: 'str', operands: 'r1, [pc, #0x20]' },
                { address: 0x1008, bytes: [0, 0, 0, 0], mnemonic: 'ldr', operands: 'r2, [r3, #0x4]' }, // Not PC-relative
            ];

            const results = analyzer.analyze_from_disasm(disasm);
            assertEqual(results.xrefs.length, 2, 'Detected 2 PC-relative data refs');

            const dataReads = results.xrefs.filter(x => x.xref_type === 'DataRead');
            const dataWrites = results.xrefs.filter(x => x.xref_type === 'DataWrite');
            assertEqual(dataReads.length, 1, 'One data read detected');
            assertEqual(dataWrites.length, 1, 'One data write detected');
            log('');
        } catch (error) {
            log(`Test 5 failed: ${error.message}`, 'error');
        }

        // Test 6: PC-relative calculation
        log('Test 6: PC-Relative Address Calculation', 'info');
        try {
            const analyzer = new BinaryAnalyzer(0x1000);

            const disasm = [
                { address: 0x1000, bytes: [0, 0, 0, 0], mnemonic: 'ldr', operands: 'r0, [pc, #0x100]' },
                { address: 0x2000, bytes: [0, 0, 0, 0], mnemonic: 'ldr', operands: 'r1, [pc, #-0x8]' },
            ];

            const results = analyzer.analyze_from_disasm(disasm);

            // PC = addr + 8 for ARM
            // First: 0x1000 + 8 + 0x100 = 0x1108
            // Second: 0x2000 + 8 - 0x8 = 0x2000
            assertEqual(results.xrefs[0].to_addr, 0x1108, 'Positive offset calculated correctly');
            assertEqual(results.xrefs[1].to_addr, 0x2000, 'Negative offset calculated correctly');
            log('');
        } catch (error) {
            log(`Test 6 failed: ${error.message}`, 'error');
        }

        // Test 7: Xref queries
        log('Test 7: Cross-Reference Queries', 'info');
        try {
            const analyzer = new BinaryAnalyzer(0x1000);

            const disasm = [
                { address: 0x1000, bytes: [0, 0, 0, 0], mnemonic: 'bl', operands: '#0x2000' },
                { address: 0x1010, bytes: [0, 0, 0, 0], mnemonic: 'bl', operands: '#0x2000' },
                { address: 0x1020, bytes: [0, 0, 0, 0], mnemonic: 'b', operands: '#0x2000' },
            ];

            analyzer.analyze_from_disasm(disasm);

            // Query xrefs TO 0x2000
            const xrefsTo = analyzer.get_xrefs_to(0x2000);
            assertEqual(xrefsTo.count, 3, 'Found 3 xrefs to 0x2000');
            assertEqual(xrefsTo.xrefs.length, 3, 'Returned 3 xref objects');

            // Query xrefs FROM 0x1000
            const xrefsFrom = analyzer.get_xrefs_from(0x1000);
            assertEqual(xrefsFrom.count, 1, 'Found 1 xref from 0x1000');

            // Query non-existent address
            const xrefsNone = analyzer.get_xrefs_to(0x9999);
            assertEqual(xrefsNone.count, 0, 'No xrefs to non-existent address');
            log('');
        } catch (error) {
            log(`Test 7 failed: ${error.message}`, 'error');
        }

        // Test 8: Empty input
        log('Test 8: Empty Input Handling', 'info');
        try {
            const analyzer = new BinaryAnalyzer(0x8000);
            const results = analyzer.analyze_from_disasm([]);

            assertEqual(results.total_instructions, 0, 'Zero instructions');
            assertEqual(results.xrefs.length, 0, 'Zero xrefs');
            log('');
        } catch (error) {
            log(`Test 8 failed: ${error.message}`, 'error');
        }

        // Test 9: Invalid input handling
        log('Test 9: Invalid Input Handling', 'info');
        try {
            const analyzer = new BinaryAnalyzer(0x1000);

            const disasm = [
                { address: 0x1000, bytes: [0, 0, 0, 0], mnemonic: 'bl', operands: 'invalid' },
                { address: 0x1004, bytes: [0, 0, 0, 0], mnemonic: 'b', operands: '#' },
                { address: 0x1008, bytes: [0, 0, 0, 0], mnemonic: 'b', operands: '' },
            ];

            const results = analyzer.analyze_from_disasm(disasm);
            assertEqual(results.xrefs.length, 0, 'No xrefs from invalid addresses');
            log('');
        } catch (error) {
            log(`Test 9 failed: ${error.message}`, 'error');
        }

        // Test 10: Analyzer reset
        log('Test 10: Analyzer Reset', 'info');
        try {
            const analyzer = new BinaryAnalyzer(0x1000);

            const disasm = [
                { address: 0x1000, bytes: [0, 0, 0, 0], mnemonic: 'bl', operands: '#0x2000' },
            ];

            analyzer.analyze_from_disasm(disasm);
            assertEqual(analyzer.xref_count(), 1, 'Xref count is 1 after analysis');

            analyzer.reset();
            assertEqual(analyzer.is_analyzed(), false, 'Analyzer reset clears analyzed flag');
            assertEqual(analyzer.xref_count(), 0, 'Xref count is 0 after reset');
            log('');
        } catch (error) {
            log(`Test 10 failed: ${error.message}`, 'error');
        }

        // Test 11: Large binary stress test
        log('Test 11: Large Binary Stress Test', 'info');
        try {
            const analyzer = new BinaryAnalyzer(0x8000);

            // Generate 10000 instructions
            const disasm = [];
            for (let i = 0; i < 10000; i++) {
                disasm.push({
                    address: 0x8000 + (i * 4),
                    bytes: [0, 0, 0, 0],
                    mnemonic: 'bl',
                    operands: `#0x${(0x10000 + i * 4).toString(16)}`
                });
            }

            const startTime = Date.now();
            const results = analyzer.analyze_from_disasm(disasm);
            const endTime = Date.now();

            assertEqual(results.xrefs.length, 10000, 'Analyzed 10000 instructions');
            assertGreaterThan(results.analysis_time_ms, -1, 'Analysis time recorded');
            log(`  ℹ Analysis took ${endTime - startTime}ms (wall clock)`, 'info');
            log('');
        } catch (error) {
            log(`Test 11 failed: ${error.message}`, 'error');
        }

        // Test 12: Complex function analysis
        log('Test 12: Complete Function Analysis', 'info');
        try {
            const analyzer = new BinaryAnalyzer(0x8000);

            const disasm = [
                // Function prologue
                { address: 0x8000, bytes: [0, 0, 0, 0], mnemonic: 'push', operands: '{r4-r7, lr}' },
                { address: 0x8004, bytes: [0, 0, 0, 0], mnemonic: 'sub', operands: 'sp, #16' },

                // Load constant
                { address: 0x8008, bytes: [0, 0, 0, 0], mnemonic: 'ldr', operands: 'r0, [pc, #0x20]' },

                // Call function
                { address: 0x800c, bytes: [0, 0, 0, 0], mnemonic: 'bl', operands: '#0x9000' },

                // Conditional branch
                { address: 0x8010, bytes: [0, 0, 0, 0], mnemonic: 'cmp', operands: 'r0, #0' },
                { address: 0x8014, bytes: [0, 0, 0, 0], mnemonic: 'b.eq', operands: '#0x8030' },

                // Another call
                { address: 0x8018, bytes: [0, 0, 0, 0], mnemonic: 'bl', operands: '#0x9100' },

                // Function epilogue
                { address: 0x801c, bytes: [0, 0, 0, 0], mnemonic: 'add', operands: 'sp, #16' },
                { address: 0x8020, bytes: [0, 0, 0, 0], mnemonic: 'pop', operands: '{r4-r7, pc}' },

                // Early exit
                { address: 0x8030, bytes: [0, 0, 0, 0], mnemonic: 'mov', operands: 'r0, #-1' },
                { address: 0x8034, bytes: [0, 0, 0, 0], mnemonic: 'b', operands: '#0x8020' },
            ];

            const results = analyzer.analyze_from_disasm(disasm);

            assertEqual(results.total_instructions, 11, 'Analyzed complete function');
            assertEqual(results.xrefs.length, 5, 'Detected 5 cross-references');

            const calls = results.xrefs.filter(x => x.xref_type === 'Call');
            const branches = results.xrefs.filter(x =>
                x.xref_type === 'Branch' || x.xref_type === 'ConditionalBranch'
            );
            const dataRefs = results.xrefs.filter(x =>
                x.xref_type === 'DataRead' || x.xref_type === 'DataWrite'
            );

            assertEqual(calls.length, 2, 'Found 2 function calls');
            assertEqual(branches.length, 2, 'Found 2 branches');
            assertEqual(dataRefs.length, 1, 'Found 1 data reference');
            log('');
        } catch (error) {
            log(`Test 12 failed: ${error.message}`, 'error');
        }

        // Test 13: Error before analysis
        log('Test 13: Query Before Analysis Error Handling', 'info');
        try {
            const analyzer = new BinaryAnalyzer(0x1000);

            try {
                analyzer.get_xrefs_to(0x2000);
                assert(false, 'Should throw error when querying before analysis');
            } catch (error) {
                assert(error.message.includes('not analyzed'), 'Correct error message');
            }
            log('');
        } catch (error) {
            log(`Test 13 failed: ${error.message}`, 'error');
        }

        // Print summary
        log('\n=== Test Summary ===\n', 'info');
        log(`Total tests run: ${testsRun}`, 'info');
        log(`Tests passed: ${testsPassed}`, 'success');
        if (testsFailed > 0) {
            log(`Tests failed: ${testsFailed}`, 'error');
        }

        const passRate = ((testsPassed / testsRun) * 100).toFixed(1);
        log(`\nPass rate: ${passRate}%`, passRate === '100.0' ? 'success' : 'warning');

        if (testsFailed === 0) {
            log('\n✓ All tests passed!\n', 'success');
            process.exit(0);
        } else {
            log('\n✗ Some tests failed\n', 'error');
            process.exit(1);
        }

    } catch (error) {
        log(`\nFailed to load WASM module: ${error.message}`, 'error');
        log('\nMake sure to build the WASM module first:', 'warning');
        log('  cd packages/battlemagic-analyzer', 'info');
        log('  ./build.bat (Windows) or ./build.sh (Unix)\n', 'info');
        process.exit(1);
    }
}

// Run tests
runTests();
