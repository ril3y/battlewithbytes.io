//! Example demonstrating the high-level analysis module
//!
//! This example shows how to use the function detector, stack analyzer,
//! and calling convention analyzer together to perform comprehensive
//! binary analysis.

use battlemagic_analyzer::analysis::{
    ArmCallingConvention, CallingConvention, FunctionDetector, StackAnalyzer,
};
use battlemagic_analyzer::arch::arm::ArmArchitecture;
use battlemagic_analyzer::traits::Instruction;
use battlemagic_analyzer::types::{CrossReference, XrefType};

fn main() {
    println!("BattleMagic Analysis Module Example\n");

    // Example 1: Detect functions
    example_function_detection();

    // Example 2: Analyze stack usage
    example_stack_analysis();

    // Example 3: Detect function arguments
    example_calling_convention();
}

fn example_function_detection() {
    println!("=== Function Detection Example ===\n");

    let arch = ArmArchitecture;
    let detector = FunctionDetector::new(&arch);

    // Create sample instructions
    let instructions = vec![
        // Function 1
        Instruction::new(0x1000, vec![0, 0], "push".to_string(), "{r7, lr}".to_string()),
        Instruction::new(0x1004, vec![0, 0], "mov".to_string(), "r0, #1".to_string()),
        Instruction::new(0x1008, vec![0, 0], "bl".to_string(), "#0x2000".to_string()),
        Instruction::new(0x100c, vec![0, 0], "pop".to_string(), "{r7, pc}".to_string()),
        // Function 2
        Instruction::new(0x2000, vec![0, 0], "push".to_string(), "{r7, lr}".to_string()),
        Instruction::new(0x2004, vec![0, 0], "mov".to_string(), "r0, #42".to_string()),
        Instruction::new(0x2008, vec![0, 0], "bx".to_string(), "lr".to_string()),
    ];

    // Create cross-references
    let xrefs = vec![CrossReference {
        from_addr: 0x1008,
        to_addr: 0x2000,
        xref_type: XrefType::Call,
        instruction: "bl".to_string(),
        operands: "#0x2000".to_string(),
    }];

    // Detect functions
    let functions = detector.detect_functions(&instructions, &xrefs);

    println!("Detected {} functions:", functions.len());
    for (addr, func) in &functions {
        println!("  Function at 0x{:04X}", addr);
        if let Some(end) = func.end_address {
            println!("    End: 0x{:04X}", end);
        }
        println!("    Callers: {:?}", func.callers);
        println!("    Callees: {:?}", func.callees);
    }
    println!();
}

fn example_stack_analysis() {
    println!("=== Stack Analysis Example ===\n");

    let analyzer = StackAnalyzer::new();

    // Sample function with stack operations
    let instructions = vec![
        Instruction::new(0x1000, vec![0, 0], "push".to_string(), "{r7, lr}".to_string()),
        Instruction::new(0x1004, vec![0, 0], "sub".to_string(), "sp, sp, #16".to_string()),
        Instruction::new(0x1008, vec![0, 0], "str".to_string(), "r0, [sp, #0]".to_string()),
        Instruction::new(0x100c, vec![0, 0], "str".to_string(), "r1, [sp, #4]".to_string()),
        Instruction::new(0x1010, vec![0, 0], "ldr".to_string(), "r2, [sp, #0]".to_string()),
        Instruction::new(0x1014, vec![0, 0], "add".to_string(), "sp, sp, #16".to_string()),
        Instruction::new(0x1018, vec![0, 0], "pop".to_string(), "{r7, pc}".to_string()),
    ];

    let mut function = battlemagic_analyzer::types::FunctionInfo::new(0x1000);
    analyzer.analyze_function(&mut function, &instructions);

    println!("Stack frame size: {} bytes", function.stack_frame_size);
    println!("Stack variables: {}", function.stack_vars.len());
    for var in &function.stack_vars {
        println!(
            "  Offset: {:+3}, Size: {} bytes, Access: {:?}",
            var.offset, var.size, var.access_type
        );
    }
    println!();
}

fn example_calling_convention() {
    println!("=== Calling Convention Example ===\n");

    let cc = ArmCallingConvention;

    // Instructions before a function call
    let preceding = vec![
        Instruction::new(0x1000, vec![0, 0], "mov".to_string(), "r0, #10".to_string()),
        Instruction::new(0x1004, vec![0, 0], "ldr".to_string(), "r1, [pc, #8]".to_string()),
        Instruction::new(0x1008, vec![0, 0], "movw".to_string(), "r2, #0x1234".to_string()),
    ];

    let call = Instruction::new(0x100c, vec![0, 0], "bl".to_string(), "#0x2000".to_string());

    let args = cc.detect_args(&call, &preceding);

    println!("Detected arguments for call at 0x{:04X}:", call.address);
    println!("  Argument registers: {:?}", cc.arg_registers());
    println!("  Return register: {}", cc.return_register());
    println!("\nArguments passed:");
    for (arg_num, location) in &args {
        println!("  arg{}: {}", arg_num, location);
    }
    println!();
}
