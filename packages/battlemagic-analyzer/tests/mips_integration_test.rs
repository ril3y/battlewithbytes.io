//! MIPS architecture integration tests
//!
//! These tests verify the MIPS architecture skeleton works correctly
//! and can be used with the generic analyzer

use battlemagic_analyzer::types::Instruction;
use battlemagic_analyzer::analyzer::BinaryAnalyzer;
use battlemagic_analyzer::arch::mips::MipsArchitecture;
use battlemagic_analyzer::traits::Architecture;

// Helper function to analyze MIPS instructions
fn analyze_mips_instructions(instructions: &[Instruction]) -> battlemagic_analyzer::types::AnalysisResults {
    let mut analyzer = BinaryAnalyzer::new(MipsArchitecture, 0x400000);
    analyzer.analyze_from_disasm(instructions)
}

#[test]
fn test_mips_analyzer_creation() {
    let analyzer = BinaryAnalyzer::new(MipsArchitecture, 0x400000);
    assert!(!analyzer.is_analyzed());
}

#[test]
fn test_mips_function_with_jal() {
    let instructions = vec![
        // Function prologue
        Instruction::new(
            0x400000,
            vec![0x27, 0xbd, 0xff, 0xe0],
            "addiu".to_string(),
            "sp, sp, -32".to_string(),
        ),
        Instruction::new(
            0x400004,
            vec![0xaf, 0xbf, 0x00, 0x1c],
            "sw".to_string(),
            "ra, 28(sp)".to_string(),
        ),
        // Function call
        Instruction::new(
            0x400008,
            vec![0x0c, 0x10, 0x00, 0x00],
            "jal".to_string(),
            "0x401000".to_string(),
        ),
        // Return
        Instruction::new(
            0x40000c,
            vec![0x8f, 0xbf, 0x00, 0x1c],
            "lw".to_string(),
            "ra, 28(sp)".to_string(),
        ),
        Instruction::new(
            0x400010,
            vec![0x27, 0xbd, 0x00, 0x20],
            "addiu".to_string(),
            "sp, sp, 32".to_string(),
        ),
        Instruction::new(
            0x400014,
            vec![0x03, 0xe0, 0x00, 0x08],
            "jr".to_string(),
            "ra".to_string(),
        ),
    ];

    let results = analyze_mips_instructions(&instructions);

    // Should detect the JAL as a function call
    assert_eq!(results.xrefs.len(), 1);
    assert_eq!(results.xrefs[0].to_addr, 0x401000);
}

#[test]
fn test_mips_conditional_branches() {
    let instructions = vec![
        Instruction::new(
            0x400000,
            vec![0x10, 0x40, 0x00, 0x10],
            "beq".to_string(),
            "$v0, $zero, 0x400040".to_string(),
        ),
        Instruction::new(
            0x400004,
            vec![0x14, 0x40, 0x00, 0x08],
            "bne".to_string(),
            "$v0, $zero, 0x400020".to_string(),
        ),
        Instruction::new(
            0x400008,
            vec![0x1c, 0x40, 0x00, 0x04],
            "bgtz".to_string(),
            "$v0, 0x400010".to_string(),
        ),
    ];

    let results = analyze_mips_instructions(&instructions);

    // Should detect 3 conditional branches
    assert_eq!(results.xrefs.len(), 3);
}

#[test]
fn test_mips_jumps() {
    let instructions = vec![
        // Unconditional jump
        Instruction::new(
            0x400000,
            vec![0x08, 0x10, 0x00, 0x00],
            "j".to_string(),
            "0x401000".to_string(),
        ),
        // Jump and link (call)
        Instruction::new(
            0x400004,
            vec![0x0c, 0x10, 0x00, 0x40],
            "jal".to_string(),
            "0x401100".to_string(),
        ),
    ];

    let results = analyze_mips_instructions(&instructions);

    // Should have 1 branch (j) and 1 call (jal)
    assert_eq!(results.xrefs.len(), 2);
}

#[test]
fn test_mips_architecture_name() {
    let arch = MipsArchitecture;
    assert_eq!(arch.name(), "MIPS");
    assert_eq!(arch.instruction_alignment(), 4);
}
