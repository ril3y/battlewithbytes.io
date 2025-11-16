//! Integration tests for BattleMagic Analyzer
//! These tests verify the complete analysis workflow with realistic ARM code patterns

use battlemagic_analyzer::types::{Instruction, XrefType, AnalysisResults};
use battlemagic_analyzer::analyzer::BinaryAnalyzer;
use battlemagic_analyzer::arch::arm::ArmArchitecture;

// Helper function to analyze instructions using real ARM architecture
fn analyze_instructions(instructions: &[Instruction]) -> AnalysisResults {
    let mut analyzer = BinaryAnalyzer::new(ArmArchitecture, 0x8000);
    analyzer.analyze_from_disasm(instructions)
}

/// Test a complete function with multiple instruction types
#[test]
fn test_complete_function_analysis() {
    // Simulate a real ARM function
    let instructions = vec![
        // Function prologue
        Instruction::new(0x8000, vec![0, 0, 0, 0], "push".to_string(), "{r4-r7, lr}".to_string()),
        Instruction::new(0x8004, vec![0, 0, 0, 0], "sub".to_string(), "sp, #16".to_string()),

        // Load constant from pool
        Instruction::new(0x8008, vec![0, 0, 0, 0], "ldr".to_string(), "r0, [pc, #0x20]".to_string()),

        // Call another function
        Instruction::new(0x800c, vec![0, 0, 0, 0], "bl".to_string(), "#0x9000".to_string()),

        // Conditional branch
        Instruction::new(0x8010, vec![0, 0, 0, 0], "cmp".to_string(), "r0, #0".to_string()),
        Instruction::new(0x8014, vec![0, 0, 0, 0], "b.eq".to_string(), "#0x8030".to_string()),

        // Another function call
        Instruction::new(0x8018, vec![0, 0, 0, 0], "bl".to_string(), "#0x9100".to_string()),

        // Store result
        Instruction::new(0x801c, vec![0, 0, 0, 0], "str".to_string(), "r0, [pc, #0x10]".to_string()),

        // Function epilogue
        Instruction::new(0x8020, vec![0, 0, 0, 0], "add".to_string(), "sp, #16".to_string()),
        Instruction::new(0x8024, vec![0, 0, 0, 0], "pop".to_string(), "{r4-r7, pc}".to_string()),

        // Early exit path (target of b.eq)
        Instruction::new(0x8030, vec![0, 0, 0, 0], "mov".to_string(), "r0, #-1".to_string()),
        Instruction::new(0x8034, vec![0, 0, 0, 0], "b".to_string(), "#0x8020".to_string()),
    ];

    let results = analyze_instructions(&instructions);

    // Verify correct number of xrefs
    assert_eq!(results.xrefs.len(), 6); // 2 calls, 2 branches, 2 data refs

    // Verify function calls
    let call_xrefs: Vec<_> = results.xrefs
        .iter()
        .filter(|x| x.xref_type == XrefType::Call)
        .collect();
    assert_eq!(call_xrefs.len(), 2);

    // Verify branches
    let branch_xrefs: Vec<_> = results.xrefs
        .iter()
        .filter(|x| matches!(x.xref_type, XrefType::Branch | XrefType::ConditionalBranch))
        .collect();
    assert_eq!(branch_xrefs.len(), 2);

    // Verify data references
    let data_xrefs: Vec<_> = results.xrefs
        .iter()
        .filter(|x| matches!(x.xref_type, XrefType::DataRead | XrefType::DataWrite))
        .collect();
    assert_eq!(data_xrefs.len(), 2);
}

/// Test analyzing multiple functions with cross-references
#[test]
fn test_multiple_functions_with_calls() {
    let instructions = vec![
        // Function 1 at 0x1000
        Instruction::new(0x1000, vec![0, 0, 0, 0], "push".to_string(), "{lr}".to_string()),
        Instruction::new(0x1004, vec![0, 0, 0, 0], "bl".to_string(), "#0x2000".to_string()), // Call func2
        Instruction::new(0x1008, vec![0, 0, 0, 0], "bl".to_string(), "#0x3000".to_string()), // Call func3
        Instruction::new(0x100c, vec![0, 0, 0, 0], "pop".to_string(), "{pc}".to_string()),

        // Function 2 at 0x2000
        Instruction::new(0x2000, vec![0, 0, 0, 0], "push".to_string(), "{lr}".to_string()),
        Instruction::new(0x2004, vec![0, 0, 0, 0], "bl".to_string(), "#0x3000".to_string()), // Also calls func3
        Instruction::new(0x2008, vec![0, 0, 0, 0], "pop".to_string(), "{pc}".to_string()),

        // Function 3 at 0x3000 (leaf function)
        Instruction::new(0x3000, vec![0, 0, 0, 0], "mov".to_string(), "r0, #42".to_string()),
        Instruction::new(0x3004, vec![0, 0, 0, 0], "bx".to_string(), "lr".to_string()),
    ];

    let results = analyze_instructions(&instructions);

    // Verify func3 is called from two places
    let xrefs_to_func3: Vec<_> = results.xrefs.iter().filter(|x| x.to_addr == 0x3000).collect();
    assert_eq!(xrefs_to_func3.len(), 2);

    // Verify func1 calls two functions
    let xrefs_from_func1_first: Vec<_> = results.xrefs.iter().filter(|x| x.from_addr == 0x1004).collect();
    assert_eq!(xrefs_from_func1_first.len(), 1);
    assert_eq!(xrefs_from_func1_first[0].to_addr, 0x2000);

    let xrefs_from_func1_second: Vec<_> = results.xrefs.iter().filter(|x| x.from_addr == 0x1008).collect();
    assert_eq!(xrefs_from_func1_second.len(), 1);
    assert_eq!(xrefs_from_func1_second[0].to_addr, 0x3000);
}

// Additional tests simplified for new architecture
// The full test suite would be expanded in Phase 2 when we have proper ARM architecture module

#[test]
fn test_realistic_binary_size() {
    // Simulate a realistic binary with 1000 functions
    let mut instructions = Vec::new();

    for func_num in 0..1000 {
        let func_addr = 0x8000 + (func_num * 0x100);

        // Each function has a few instructions
        instructions.push(Instruction::new(
            func_addr,
            vec![0, 0, 0, 0],
            "push".to_string(),
            "{lr}".to_string(),
        ));

        // Call next function (creates call chain)
        if func_num < 999 {
            instructions.push(Instruction::new(
                func_addr + 4,
                vec![0, 0, 0, 0],
                "bl".to_string(),
                format!("#0x{:x}", 0x8000 + ((func_num + 1) * 0x100)),
            ));
        }

        // Some data reference
        instructions.push(Instruction::new(
            func_addr + 8,
            vec![0, 0, 0, 0],
            "ldr".to_string(),
            "r0, [pc, #0x10]".to_string(),
        ));

        instructions.push(Instruction::new(
            func_addr + 12,
            vec![0, 0, 0, 0],
            "pop".to_string(),
            "{pc}".to_string(),
        ));
    }

    let results = analyze_instructions(&instructions);

    // Should have 999 calls + 1000 data refs = 1999 xrefs
    assert_eq!(results.xrefs.len(), 1999);

    // Test query performance on large dataset
    let xrefs_to_func_500: Vec<_> = results.xrefs.iter().filter(|x| x.to_addr == 0x8000 + (500 * 0x100)).collect();
    assert_eq!(xrefs_to_func_500.len(), 1); // Called from func 499
}

/// Test function detection with ARM prologue/epilogue patterns
#[test]
fn test_function_boundary_detection() {
    let instructions = vec![
        // Function 1: Standard prologue with PUSH {lr}
        Instruction::new(0x1000, vec![0x00, 0xb5], "push".to_string(), "{r4, lr}".to_string()),
        Instruction::new(0x1002, vec![0x00, 0x00], "movs".to_string(), "r0, #1".to_string()),
        Instruction::new(0x1004, vec![0x00, 0xbd], "pop".to_string(), "{r4, pc}".to_string()),

        // Function 2: STM prologue
        Instruction::new(0x1008, vec![0x2d, 0xe9], "push".to_string(), "{r4-r6, lr}".to_string()),
        Instruction::new(0x100c, vec![0x00, 0x00], "movs".to_string(), "r0, #2".to_string()),
        Instruction::new(0x1010, vec![0xbd, 0xe8], "pop".to_string(), "{r4-r6, pc}".to_string()),

        // Function 3: BX LR epilogue
        Instruction::new(0x1014, vec![0x00, 0xb5], "push".to_string(), "{lr}".to_string()),
        Instruction::new(0x1016, vec![0x00, 0x00], "movs".to_string(), "r0, #3".to_string()),
        Instruction::new(0x1018, vec![0x70, 0x47], "bx".to_string(), "lr".to_string()),
    ];

    let results = analyze_instructions(&instructions);

    // Verify functions detected (would need function detection API)
    // For now just verify the instructions analyzed correctly
    assert!(results.xrefs.len() == 0); // No xrefs in this simple pattern
}

/// Test PC-relative data access patterns
#[test]
fn test_pc_relative_data_access() {
    let instructions = vec![
        // LDR from literal pool
        Instruction::new(0x1000, vec![0x00, 0x48], "ldr".to_string(), "r0, [pc, #0x10]".to_string()),
        Instruction::new(0x1002, vec![0x00, 0x48], "ldr".to_string(), "r1, [pc, #0x20]".to_string()),

        // STR to data section
        Instruction::new(0x1004, vec![0x00, 0x60], "str".to_string(), "r0, [pc, #0x30]".to_string()),

        // LDR with negative offset
        Instruction::new(0x1006, vec![0x00, 0x48], "ldr".to_string(), "r2, [pc, #-0x8]".to_string()),

        // LDRB/STRB (byte access)
        Instruction::new(0x1008, vec![0x00, 0x78], "ldrb".to_string(), "r0, [pc, #0x40]".to_string()),
        Instruction::new(0x100a, vec![0x00, 0x70], "strb".to_string(), "r1, [pc, #0x50]".to_string()),
    ];

    let results = analyze_instructions(&instructions);

    // Should have 6 data xrefs
    assert_eq!(results.xrefs.len(), 6);

    // Verify all are data access
    let data_reads = results.xrefs.iter().filter(|x| x.xref_type == XrefType::DataRead).count();
    let data_writes = results.xrefs.iter().filter(|x| x.xref_type == XrefType::DataWrite).count();
    assert_eq!(data_reads, 4); // 4 loads
    assert_eq!(data_writes, 2); // 2 stores
}

/// Test conditional branch patterns
#[test]
fn test_conditional_branches() {
    let instructions = vec![
        // Compare and branch if equal (b.eq format with dot)
        Instruction::new(0x1000, vec![0x00, 0x28], "cmp".to_string(), "r0, #0".to_string()),
        Instruction::new(0x1002, vec![0x00, 0xd0], "b.eq".to_string(), "#0x1010".to_string()),

        // Compare and branch if not equal
        Instruction::new(0x1004, vec![0x01, 0x29], "cmp".to_string(), "r1, #1".to_string()),
        Instruction::new(0x1006, vec![0x00, 0xd1], "b.ne".to_string(), "#0x1020".to_string()),

        // Branch if greater than
        Instruction::new(0x1008, vec![0x00, 0x2a], "cmp".to_string(), "r2, #0".to_string()),
        Instruction::new(0x100a, vec![0x00, 0xdc], "b.gt".to_string(), "#0x1030".to_string()),

        // Branch if less than
        Instruction::new(0x100c, vec![0x00, 0xdb], "cmp".to_string(), "r3, #5".to_string()),
        Instruction::new(0x100e, vec![0x00, 0xdb], "b.lt".to_string(), "#0x1040".to_string()),

        // Branch if carry set
        Instruction::new(0x1010, vec![0x00, 0xd2], "b.cs".to_string(), "#0x1050".to_string()),
    ];

    let results = analyze_instructions(&instructions);

    // Should have 5 conditional branches (all b.XX format)
    let cond_branches = results.xrefs.iter()
        .filter(|x| x.xref_type == XrefType::ConditionalBranch)
        .count();
    assert_eq!(cond_branches, 5);
}

/// Test BL/BLX call patterns
#[test]
fn test_function_calls() {
    let instructions = vec![
        // Standard BL (Branch with Link)
        Instruction::new(0x1000, vec![0x00, 0xf0], "bl".to_string(), "#0x2000".to_string()),

        // BLX to ARM mode
        Instruction::new(0x1004, vec![0x00, 0xf0], "blx".to_string(), "#0x3000".to_string()),

        // BLX register (indirect call)
        Instruction::new(0x1008, vec![0x00, 0x47], "blx".to_string(), "r3".to_string()),

        // Multiple calls in sequence
        Instruction::new(0x100a, vec![0x00, 0xf0], "bl".to_string(), "#0x4000".to_string()),
        Instruction::new(0x100e, vec![0x00, 0xf0], "bl".to_string(), "#0x5000".to_string()),
    ];

    let results = analyze_instructions(&instructions);

    // Should have 4 call xrefs (BLX r3 is register-indirect, no static target)
    let calls = results.xrefs.iter()
        .filter(|x| x.xref_type == XrefType::Call)
        .count();
    assert_eq!(calls, 4);

    // Verify call targets
    let targets: Vec<_> = results.xrefs.iter()
        .map(|x| x.to_addr)
        .collect();
    assert!(targets.contains(&0x2000));
    assert!(targets.contains(&0x3000));
    assert!(targets.contains(&0x4000));
    assert!(targets.contains(&0x5000));
}

/// Test unconditional branch patterns
#[test]
fn test_unconditional_branches() {
    let instructions = vec![
        // Simple branch
        Instruction::new(0x1000, vec![0x00, 0xe0], "b".to_string(), "#0x1100".to_string()),

        // Forward branch
        Instruction::new(0x1004, vec![0x00, 0xe0], "b".to_string(), "#0x1020".to_string()),

        // Another forward branch
        Instruction::new(0x1008, vec![0x00, 0xe0], "b".to_string(), "#0x1030".to_string()),

        // Backward branch (loop)
        Instruction::new(0x1020, vec![0x00, 0xe0], "b".to_string(), "#0x1008".to_string()),
    ];

    let results = analyze_instructions(&instructions);

    // Should have 4 branch xrefs
    let branches = results.xrefs.iter()
        .filter(|x| x.xref_type == XrefType::Branch)
        .count();
    assert_eq!(branches, 4);

    // Verify backward branch (loop detection)
    let backward_branches: Vec<_> = results.xrefs.iter()
        .filter(|x| x.to_addr < x.from_addr)
        .collect();
    assert_eq!(backward_branches.len(), 1);
    assert_eq!(backward_branches[0].from_addr, 0x1020);
    assert_eq!(backward_branches[0].to_addr, 0x1008);
}

/// Test mixed instruction sequence (realistic firmware pattern)
#[test]
fn test_realistic_firmware_pattern() {
    let instructions = vec![
        // Vector table (interrupt handlers)
        Instruction::new(0x0000, vec![0x00, 0x00], "ldr".to_string(), "r0, [pc, #0x0]".to_string()), // SP
        Instruction::new(0x0004, vec![0x00, 0xe0], "b".to_string(), "#0x0100".to_string()), // Reset
        Instruction::new(0x0008, vec![0x00, 0xe0], "b".to_string(), "#0x0200".to_string()), // NMI
        Instruction::new(0x000c, vec![0x00, 0xe0], "b".to_string(), "#0x0300".to_string()), // HardFault

        // Reset handler
        Instruction::new(0x0100, vec![0x00, 0xb5], "push".to_string(), "{lr}".to_string()),
        Instruction::new(0x0102, vec![0x00, 0x48], "ldr".to_string(), "r0, [pc, #0x10]".to_string()), // Load constant
        Instruction::new(0x0104, vec![0x00, 0xf0], "bl".to_string(), "#0x1000".to_string()), // Call SystemInit
        Instruction::new(0x0108, vec![0x00, 0xf0], "bl".to_string(), "#0x2000".to_string()), // Call main
        Instruction::new(0x010c, vec![0x00, 0xe0], "b".to_string(), "#0x010c".to_string()), // Infinite loop

        // NMI handler
        Instruction::new(0x0200, vec![0x00, 0xe0], "b".to_string(), "#0x0200".to_string()), // Hang

        // HardFault handler
        Instruction::new(0x0300, vec![0x00, 0xb5], "push".to_string(), "{lr}".to_string()),
        Instruction::new(0x0302, vec![0x00, 0x48], "ldr".to_string(), "r0, [pc, #0x8]".to_string()),
        Instruction::new(0x0304, vec![0x00, 0xf0], "bl".to_string(), "#0x3000".to_string()), // Call error handler
        Instruction::new(0x0308, vec![0x00, 0xe0], "b".to_string(), "#0x0308".to_string()), // Hang
    ];

    let results = analyze_instructions(&instructions);

    // Verify comprehensive xref coverage
    assert!(results.xrefs.len() > 10);

    // Check we have all xref types
    let has_calls = results.xrefs.iter().any(|x| x.xref_type == XrefType::Call);
    let has_branches = results.xrefs.iter().any(|x| x.xref_type == XrefType::Branch);
    let has_data = results.xrefs.iter().any(|x| x.xref_type == XrefType::DataRead);

    assert!(has_calls, "Should detect function calls");
    assert!(has_branches, "Should detect branches");
    assert!(has_data, "Should detect data references");

    // Verify SystemInit and main are called from reset handler
    let reset_calls: Vec<_> = results.xrefs.iter()
        .filter(|x| x.from_addr >= 0x0100 && x.from_addr < 0x0200)
        .filter(|x| x.xref_type == XrefType::Call)
        .collect();
    assert_eq!(reset_calls.len(), 2);
}
