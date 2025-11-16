//! Integration test with real nRF52 firmware patterns
//!
//! This test uses realistic ARM Cortex-M4 instruction sequences
//! commonly found in Nordic nRF52 microcontroller firmware.

use battlemagic_analyzer::analyzer::BinaryAnalyzer;
use battlemagic_analyzer::arch::arm::ArmArchitecture;
use battlemagic_analyzer::types::XrefType;

/// Real nRF52 initialization function pattern
#[test]
fn test_nrf52_init_function() {
    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, 0x1000);

    // Typical nRF52 peripheral initialization function
    // Based on real Nordic SDK patterns
    #[rustfmt::skip]
    let firmware: &[u8] = &[
        // Function prologue
        0x10, 0xB5,             // push {r4, lr}

        // Load peripheral base address
        0x04, 0x48,             // ldr r0, [pc, #16]  ; Load GPIO base

        // Configure GPIO
        0x01, 0x21,             // mov r1, #1
        0x01, 0x61,             // str r1, [r0, #16]  ; Set PIN_CNF

        // Call another function
        0x00, 0xF0, 0x04, 0xF8, // bl delay_ms

        // Restore and return
        0x10, 0xBD,             // pop {r4, pc}

        // Padding to align constant pool
        0x00, 0xBF,             // nop

        // Constant pool (GPIO base address: 0x50000000)
        0x00, 0x00, 0x00, 0x50,
    ];

    let results = analyzer.analyze_from_bytes(firmware);

    // Verify analysis results
    assert!(results.total_instructions >= 7, "Should decode at least 7 instructions");

    // Should find xrefs:
    // 1. PC-relative load (data reference to constant pool)
    // 2. Branch-link (call to delay_ms)
    assert!(results.xrefs.len() >= 2, "Expected at least 2 xrefs");

    // Verify we found the call
    let calls: Vec<_> = results.xrefs.iter()
        .filter(|x| x.xref_type == XrefType::Call)
        .collect();
    assert_eq!(calls.len(), 1, "Should find exactly one function call");

    // Verify we found the data reference
    let data_refs: Vec<_> = results.xrefs.iter()
        .filter(|x| x.xref_type == XrefType::DataRead)
        .collect();
    assert!(data_refs.len() >= 1, "Should find at least one data reference");
}

/// Test interrupt handler pattern
#[test]
fn test_nrf52_interrupt_handler() {
    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, 0x2000);

    // Typical interrupt handler with state machine
    #[rustfmt::skip]
    let firmware: &[u8] = &[
        // Save context
        0x2D, 0xE9, 0xF0, 0x47, // push.w {r4-r10, lr}

        // Load state variable
        0x04, 0x48,             // ldr r0, [pc, #16]
        0x00, 0x68,             // ldr r0, [r0]

        // Compare state
        0x00, 0x28,             // cmp r0, #0
        0x02, 0xD0,             // beq state_0

        // State 1 handler
        0x00, 0xF0, 0x10, 0xF8, // bl handle_state_1
        0x01, 0xE0,             // b exit

        // State 0 handler (state_0:)
        0x00, 0xF0, 0x14, 0xF8, // bl handle_state_0

        // Exit (exit:)
        0xBD, 0xE8, 0xF0, 0x87, // pop.w {r4-r10, pc}

        // State variable address
        0x00, 0x20, 0x00, 0x20,
    ];

    let results = analyzer.analyze_from_bytes(firmware);

    // Should decode multiple instructions
    assert!(results.total_instructions >= 8);

    // Should find:
    // - 2 function calls (bl instructions)
    // - 2 branches (beq, b)
    // - 1 data reference (ldr from pc)
    let calls = results.xrefs.iter()
        .filter(|x| x.xref_type == XrefType::Call)
        .count();
    let branches = results.xrefs.iter()
        .filter(|x| matches!(x.xref_type, XrefType::Branch | XrefType::ConditionalBranch))
        .count();
    let data_refs = results.xrefs.iter()
        .filter(|x| x.xref_type == XrefType::DataRead)
        .count();

    assert_eq!(calls, 2, "Should find 2 function calls");
    assert!(branches >= 2, "Should find at least 2 branches");
    assert!(data_refs >= 1, "Should find at least 1 data reference");
}

/// Test loop with multiple branches
#[test]
fn test_nrf52_loop_structure() {
    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, 0x3000);

    // Simple for-loop structure
    #[rustfmt::skip]
    let firmware: &[u8] = &[
        // Initialize counter
        0x00, 0x24,             // mov r4, #0

        // Loop start (loop:)
        0x0A, 0x2C,             // cmp r4, #10
        0x04, 0xDA,             // bge loop_end

        // Loop body
        0x00, 0xF0, 0x08, 0xF8, // bl process_item

        // Increment
        0x01, 0x34,             // add r4, #1

        // Branch back
        0xF8, 0xE7,             // b loop

        // Loop end (loop_end:)
        0x70, 0x47,             // bx lr
    ];

    let results = analyzer.analyze_from_bytes(firmware);

    // Verify loop structure detected
    let branches = results.xrefs.iter()
        .filter(|x| matches!(x.xref_type, XrefType::Branch | XrefType::ConditionalBranch))
        .count();

    assert!(branches >= 2, "Should detect loop branches");

    // Verify function call in loop body
    let calls = results.xrefs.iter()
        .filter(|x| x.xref_type == XrefType::Call)
        .count();

    assert_eq!(calls, 1, "Should find function call in loop");
}

/// Test switch/case jump table pattern
#[test]
fn test_nrf52_switch_case() {
    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, 0x4000);

    // Switch statement with jump table
    #[rustfmt::skip]
    let firmware: &[u8] = &[
        // Load switch value
        0x00, 0x68,             // ldr r0, [r0]

        // Compare range
        0x03, 0x28,             // cmp r0, #3
        0x08, 0xD8,             // bhi default_case

        // TBB (table branch byte) - simplified
        // Just showing linear dispatch instead

        // Case 0
        0x00, 0x28,             // cmp r0, #0
        0x01, 0xD0,             // beq case_0

        // Case 1
        0x01, 0x28,             // cmp r0, #1
        0x01, 0xD0,             // beq case_1

        // Default
        0x03, 0xE0,             // b default_case

        // case_0:
        0x00, 0x20,             // mov r0, #0
        0x70, 0x47,             // bx lr

        // case_1:
        0x01, 0x20,             // mov r0, #1
        0x70, 0x47,             // bx lr

        // default_case:
        0xFF, 0x20,             // mov r0, #255
        0x70, 0x47,             // bx lr
    ];

    let results = analyzer.analyze_from_bytes(firmware);

    // Should detect multiple conditional branches (switch cases)
    let cond_branches = results.xrefs.iter()
        .filter(|x| x.xref_type == XrefType::ConditionalBranch)
        .count();

    assert!(cond_branches >= 2, "Should detect multiple switch branches");
}

/// Test data structure access pattern
#[test]
fn test_nrf52_struct_access() {
    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, 0x5000);

    // Access fields in a structure
    #[rustfmt::skip]
    let firmware: &[u8] = &[
        // Load structure pointer
        0x04, 0x48,             // ldr r0, [pc, #16]  ; struct pointer

        // Read field at offset 0
        0x00, 0x68,             // ldr r0, [r0, #0]

        // Read field at offset 4
        0x41, 0x68,             // ldr r1, [r0, #4]

        // Read field at offset 8
        0x82, 0x68,             // ldr r2, [r0, #8]

        // Store to field at offset 12
        0xC3, 0x60,             // str r3, [r0, #12]

        // Return
        0x70, 0x47,             // bx lr

        // Padding
        0x00, 0xBF,             // nop

        // Struct pointer
        0x00, 0x20, 0x00, 0x20,
    ];

    let results = analyzer.analyze_from_bytes(firmware);

    // Should find PC-relative struct pointer load
    let data_refs = results.xrefs.iter()
        .filter(|x| x.xref_type == XrefType::DataRead)
        .count();

    assert!(data_refs >= 1, "Should find struct pointer reference");
}

/// Test complete function with complex control flow
#[test]
fn test_nrf52_complex_function() {
    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, 0x6000);

    // Function with multiple calls, loops, and branches
    #[rustfmt::skip]
    let firmware: &[u8] = &[
        // Prologue
        0x2D, 0xE9, 0xF0, 0x41, // push.w {r4-r8, lr}

        // Validate parameter
        0x00, 0x28,             // cmp r0, #0
        0x01, 0xD0,             // beq error_exit
        0x02, 0xE0,             // b continue

        // error_exit:
        0xFF, 0x20,             // mov r0, #255
        0x08, 0xE0,             // b cleanup

        // continue:
        // Call initialization
        0x00, 0xF0, 0x10, 0xF8, // bl init_hardware

        // Loop
        0x00, 0x24,             // mov r4, #0
        // loop:
        0x0A, 0x2C,             // cmp r4, #10
        0x02, 0xDA,             // bge loop_end
        0x00, 0xF0, 0x14, 0xF8, // bl process_iteration
        0x01, 0x34,             // add r4, #1
        0xFA, 0xE7,             // b loop

        // loop_end:
        0x00, 0x20,             // mov r0, #0

        // cleanup:
        0xBD, 0xE8, 0xF0, 0x81, // pop.w {r4-r8, pc}
    ];

    let results = analyzer.analyze_from_bytes(firmware);

    // Complex function should have:
    // - Multiple calls (at least 2)
    // - Multiple branches (error handling, loop)
    let calls = results.xrefs.iter()
        .filter(|x| x.xref_type == XrefType::Call)
        .count();
    let branches = results.xrefs.iter()
        .filter(|x| matches!(x.xref_type, XrefType::Branch | XrefType::ConditionalBranch))
        .count();

    assert!(calls >= 2, "Should find at least 2 function calls");
    assert!(branches >= 4, "Should find multiple branches");
    assert!(results.total_instructions >= 15, "Should decode complex function");
}

/// Verify xref query functionality after byte analysis
#[test]
fn test_xref_queries_after_byte_analysis() {
    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, 0x8000);

    #[rustfmt::skip]
    let firmware: &[u8] = &[
        // Two calls to same function
        0x00, 0xF0, 0x04, 0xF8, // bl target_func  @ 0x8000
        0x00, 0xF0, 0x04, 0xF8, // bl target_func  @ 0x8004

        // target_func:
        0x70, 0x47,             // bx lr           @ 0x8008
    ];

    let results = analyzer.analyze_from_bytes(firmware);

    // Both calls should target approximately the same address
    // (actual target depends on BL encoding calculation)

    // Verify we can query xrefs
    assert!(analyzer.is_analyzed());

    // Query xrefs from first instruction
    let xrefs_from = analyzer.get_xrefs_from(0x8000);
    assert_eq!(xrefs_from.len(), 1, "Should have one xref from first instruction");

    // Query xrefs from second instruction
    let xrefs_from = analyzer.get_xrefs_from(0x8004);
    assert_eq!(xrefs_from.len(), 1, "Should have one xref from second instruction");
}

/// Performance test with larger firmware block
#[test]
fn test_performance_large_firmware() {
    use std::time::Instant;

    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, 0x8000);

    // Create 10KB of realistic firmware (mix of instructions)
    let mut firmware = Vec::new();
    for i in 0..1000 {
        firmware.extend_from_slice(&[0x10, 0xB5]); // push {r4, lr}
        firmware.extend_from_slice(&[0x00, 0x20]); // mov r0, #0
        firmware.extend_from_slice(&[0x01, 0x21]); // mov r1, #1
        firmware.extend_from_slice(&[0x88, 0x18]); // add r0, r1, r2

        if i % 10 == 0 {
            firmware.extend_from_slice(&[0x00, 0xF0, 0x04, 0xF8]); // bl (call)
        }

        firmware.extend_from_slice(&[0x10, 0xBD]); // pop {r4, pc}
    }

    let start = Instant::now();
    let results = analyzer.analyze_from_bytes(&firmware);
    let elapsed = start.elapsed();

    println!("Decoded {} instructions from {} bytes in {:?}",
             results.total_instructions, firmware.len(), elapsed);
    println!("Found {} cross-references", results.xrefs.len());

    // Should decode all instructions
    assert!(results.total_instructions > 1000);

    // Should complete in reasonable time (< 1 second)
    assert!(elapsed.as_secs() < 1, "Decoding should be fast");
}
