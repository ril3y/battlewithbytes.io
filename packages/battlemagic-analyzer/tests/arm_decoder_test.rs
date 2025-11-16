//! Integration tests for ARM Thumb-2 decoder
//!
//! These tests verify the decoder works correctly with real ARM instruction encodings

use battlemagic_analyzer::arch::arm::ArmArchitecture;
use battlemagic_analyzer::traits::Architecture;

#[test]
fn test_decode_real_function_prologue() {
    let arch = ArmArchitecture;

    // Real nRF52 function prologue: push {r4, lr}
    // Bytes: 0x10 0xB5
    let bytes = [0x10, 0xB5];
    let inst = arch.decode(&bytes, 0x8000).unwrap();

    assert_eq!(inst.mnemonic, "push");
    assert!(inst.operands.contains("r4"));
    assert!(inst.operands.contains("lr"));
    assert_eq!(inst.address, 0x8000);
    assert_eq!(inst.size, 2);
}

#[test]
fn test_decode_real_function_epilogue() {
    let arch = ArmArchitecture;

    // Real epilogue: pop {r4, pc}
    // Bytes: 0x10 0xBD
    let bytes = [0x10, 0xBD];
    let inst = arch.decode(&bytes, 0x8000).unwrap();

    assert_eq!(inst.mnemonic, "pop");
    assert!(inst.operands.contains("r4"));
    assert!(inst.operands.contains("pc"));
}

#[test]
fn test_decode_branch_link() {
    let arch = ArmArchitecture;

    // 32-bit BL instruction
    // bl #0x100 (example encoding)
    let bytes = [0x00, 0xF0, 0x80, 0xF8];
    let inst = arch.decode(&bytes, 0x8000);

    assert!(inst.is_some());
    let inst = inst.unwrap();
    assert_eq!(inst.mnemonic, "bl");
    assert_eq!(inst.size, 4);
}

#[test]
fn test_decode_conditional_branch() {
    let arch = ArmArchitecture;

    // beq forward
    let bytes = [0x00, 0xD0]; // beq #0
    let inst = arch.decode(&bytes, 0x1000).unwrap();

    assert_eq!(inst.mnemonic, "b.eq");
    assert_eq!(inst.size, 2);

    // bne forward
    let bytes = [0x00, 0xD1]; // bne #0
    let inst = arch.decode(&bytes, 0x1000).unwrap();

    assert_eq!(inst.mnemonic, "b.ne");
}

#[test]
fn test_decode_load_pc_relative() {
    let arch = ArmArchitecture;

    // ldr r0, [pc, #0x10]
    let bytes = [0x04, 0x48]; // ldr r0, [pc, #16]
    let inst = arch.decode(&bytes, 0x1000).unwrap();

    assert_eq!(inst.mnemonic, "ldr");
    assert!(inst.operands.contains("r0"));
    assert!(inst.operands.contains("pc"));
}

#[test]
fn test_decode_load_store_immediate() {
    let arch = ArmArchitecture;

    // ldr r0, [r1, #4]
    let bytes = [0x48, 0x68];
    let inst = arch.decode(&bytes, 0x1000).unwrap();

    assert_eq!(inst.mnemonic, "ldr");
    assert!(inst.operands.contains("r0"));
    assert!(inst.operands.contains("r1"));

    // str r0, [r1, #4]
    let bytes = [0x48, 0x60];
    let inst = arch.decode(&bytes, 0x1000).unwrap();

    assert_eq!(inst.mnemonic, "str");
}

#[test]
fn test_decode_data_processing() {
    let arch = ArmArchitecture;

    // mov r0, #42
    let bytes = [0x2A, 0x20];
    let inst = arch.decode(&bytes, 0x1000).unwrap();

    assert_eq!(inst.mnemonic, "mov");
    assert!(inst.operands.contains("r0"));
    assert!(inst.operands.contains("42"));

    // cmp r0, #10
    let bytes = [0x0A, 0x28];
    let inst = arch.decode(&bytes, 0x1000).unwrap();

    assert_eq!(inst.mnemonic, "cmp");
}

#[test]
fn test_decode_add_sub() {
    let arch = ArmArchitecture;

    // add r0, r1, r2
    let bytes = [0x88, 0x18];
    let inst = arch.decode(&bytes, 0x1000).unwrap();

    assert_eq!(inst.mnemonic, "add");
    assert!(inst.operands.contains("r0"));
    assert!(inst.operands.contains("r1"));
    assert!(inst.operands.contains("r2"));

    // sub r0, r1, r2
    let bytes = [0x88, 0x1A];
    let inst = arch.decode(&bytes, 0x1000).unwrap();

    assert_eq!(inst.mnemonic, "sub");
}

#[test]
fn test_decode_branch_exchange() {
    let arch = ArmArchitecture;

    // bx lr (common return instruction)
    let bytes = [0x70, 0x47];
    let inst = arch.decode(&bytes, 0x1000).unwrap();

    assert_eq!(inst.mnemonic, "bx");
    // r14 is lr
    assert!(inst.operands.contains("14") || inst.operands.contains("lr"));
}

#[test]
fn test_decode_system_instructions() {
    let arch = ArmArchitecture;

    // svc #0
    let bytes = [0x00, 0xDF];
    let inst = arch.decode(&bytes, 0x1000).unwrap();

    assert_eq!(inst.mnemonic, "svc");
    assert!(inst.operands.contains("0"));

    // bkpt #0
    let bytes = [0x00, 0xBE];
    let inst = arch.decode(&bytes, 0x1000).unwrap();

    assert_eq!(inst.mnemonic, "bkpt");
}

#[test]
fn test_decode_sequence() {
    let arch = ArmArchitecture;

    // Realistic firmware sequence
    let firmware = [
        0x10, 0xB5, // push {r4, lr}
        0x00, 0x20, // mov r0, #0
        0x01, 0x21, // mov r1, #1
        0x88, 0x18, // add r0, r1, r2
        0x70, 0x47, // bx lr
    ];

    let mut addr = 0x8000;
    let mut offset = 0;

    // Decode each instruction
    while offset < firmware.len() {
        let inst = arch.decode(&firmware[offset..], addr);
        assert!(inst.is_some(), "Failed to decode at offset {}", offset);

        let inst = inst.unwrap();
        offset += inst.size;
        addr += inst.size as u32;
    }

    // Should have decoded all bytes
    assert_eq!(offset, firmware.len());
}

#[test]
fn test_decode_with_analyze() {
    use battlemagic_analyzer::analyzer::BinaryAnalyzer;

    // Create analyzer
    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, 0x8000);

    // Real firmware snippet with calls
    let firmware = [
        0x10, 0xB5, // push {r4, lr}
        0x00, 0xF0, 0x02, 0xF8, // bl (32-bit)
        0x10, 0xBD, // pop {r4, pc}
    ];

    // Analyze from bytes
    let results = analyzer.analyze_from_bytes(&firmware);

    // Should have decoded all instructions
    assert!(results.total_instructions > 0);
    assert_eq!(results.start_address, 0x8000);
}

#[test]
fn test_xref_extraction_from_decoded_bytes() {
    use battlemagic_analyzer::analyzer::BinaryAnalyzer;

    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, 0x8000);

    // Firmware with PC-relative load (creates data xref)
    let firmware = [
        0x04, 0x48, // ldr r0, [pc, #0x10]
        0x00, 0x20, // mov r0, #0
    ];

    let results = analyzer.analyze_from_bytes(&firmware);

    // Should extract the PC-relative data reference
    assert!(results.xrefs.len() > 0, "Expected xrefs from PC-relative load");
}

#[test]
fn test_invalid_bytes_graceful_handling() {
    let arch = ArmArchitecture;

    // Empty
    assert!(arch.decode(&[], 0x1000).is_none());

    // Single byte (incomplete)
    assert!(arch.decode(&[0x00], 0x1000).is_none());

    // 32-bit instruction marker but incomplete - should return unknown
    let inst = arch.decode(&[0x00, 0xF0], 0x1000);
    assert!(inst.is_some(), "Incomplete 32-bit should return unknown, not None");
    assert_eq!(inst.unwrap().mnemonic, "unknown");

    // Unknown/invalid opcode should still return something
    let inst = arch.decode(&[0xFF, 0xFF], 0x1000);
    assert!(inst.is_some(), "Should gracefully handle unknown opcodes");
}

#[test]
fn test_mixed_16bit_32bit_instructions() {
    let arch = ArmArchitecture;

    // 16-bit then 32-bit
    let bytes = [
        0x00, 0x20, // mov r0, #0 (16-bit)
        0x00, 0xF0, 0x00, 0xF8, // bl (32-bit)
    ];

    let inst1 = arch.decode(&bytes[0..], 0x1000).unwrap();
    assert_eq!(inst1.size, 2);
    assert_eq!(inst1.mnemonic, "mov");

    let inst2 = arch.decode(&bytes[2..], 0x1002).unwrap();
    assert_eq!(inst2.size, 4);
    assert_eq!(inst2.mnemonic, "bl");
}

#[test]
fn test_large_firmware_block() {
    use battlemagic_analyzer::analyzer::BinaryAnalyzer;

    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, 0x8000);

    // Create a larger firmware block (1KB)
    let mut firmware = Vec::new();
    for _ in 0..256 {
        firmware.extend_from_slice(&[0x00, 0x20]); // mov r0, #0
        firmware.extend_from_slice(&[0x01, 0x21]); // mov r1, #1
    }

    let results = analyzer.analyze_from_bytes(&firmware);

    // Should decode all instructions
    assert_eq!(results.total_instructions, 512);
}

#[test]
fn test_real_nrf52_snippet() {
    use battlemagic_analyzer::analyzer::BinaryAnalyzer;

    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, 0x1000);

    // Real nRF52 firmware pattern (simplified)
    let firmware = [
        0x10, 0xB5, // push {r4, lr}
        0x04, 0x48, // ldr r0, [pc, #16]
        0x05, 0x49, // ldr r1, [pc, #20]
        0x00, 0x68, // ldr r0, [r0]
        0x08, 0x60, // str r0, [r1]
        0x00, 0xF0, 0x10, 0xF8, // bl some_function
        0x10, 0xBD, // pop {r4, pc}
    ];

    let results = analyzer.analyze_from_bytes(&firmware);

    // Should have:
    // - Decoded all instructions
    // - Found PC-relative loads (2 data refs)
    // - Found branch-link (1 call ref)
    assert!(results.total_instructions >= 6);
    assert!(results.xrefs.len() >= 3, "Expected at least 3 xrefs (2 data, 1 call)");
}
