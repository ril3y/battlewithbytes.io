//! Test case to verify function boundary detection with instructions after pop {pc}
//!
//! This simulates the scenario from the screenshot:
//! ```
//! 0x00024B92: pop {r4, r5, r6, pc}  <- function end
//! 0x00024B94: str r2, [r0, 0x4]     <- should this be part of function or new function?
//! 0x00024B96: movs r0, 0x0
//! 0x00024B98: push {r4, lr}         <- clear function start
//! ```

use battlemagic_analyzer::arch::arm::ArmArchitecture;
use battlemagic_analyzer::traits::{Architecture, Instruction};
use battlemagic_analyzer::analysis::functions::FunctionDetector;

#[test]
fn test_function_boundary_after_pop_pc() {
    let arch = ArmArchitecture;

    // Simulate the exact scenario from the screenshot
    let instructions = vec![
        // Some earlier function
        Instruction::new(0x00024B88, vec![0x10, 0xB5], "push".to_string(), "{r4, lr}".to_string()),
        Instruction::new(0x00024B8A, vec![0x00, 0x20], "movs".to_string(), "r0, #0".to_string()),
        Instruction::new(0x00024B8C, vec![0x01, 0x21], "movs".to_string(), "r1, #1".to_string()),
        Instruction::new(0x00024B8E, vec![0x02, 0x22], "movs".to_string(), "r2, #2".to_string()),
        Instruction::new(0x00024B90, vec![0x00, 0xF0, 0x00, 0xF8], "bl".to_string(), "#0x25000".to_string()),

        // THE CRITICAL SEQUENCE
        Instruction::new(0x00024B92, vec![0x70, 0xBD], "pop".to_string(), "{r4, r5, r6, pc}".to_string()), // FUNCTION END
        Instruction::new(0x00024B94, vec![0x42, 0x60], "str".to_string(), "r2, [r0, #4]".to_string()),    // After return!
        Instruction::new(0x00024B96, vec![0x00, 0x20], "movs".to_string(), "r0, #0".to_string()),         // After return!

        // New function starts here
        Instruction::new(0x00024B98, vec![0x10, 0xB5], "push".to_string(), "{r4, lr}".to_string()),       // FUNCTION START
        Instruction::new(0x00024B9A, vec![0x01, 0x20], "movs".to_string(), "r0, #1".to_string()),
        Instruction::new(0x00024B9C, vec![0x70, 0x47], "bx".to_string(), "lr".to_string()),
    ];

    let xrefs = vec![]; // No cross-references for this test

    // Detect functions
    let detector = FunctionDetector::new(&arch);
    let functions = detector.detect_functions(&instructions, &xrefs);

    println!("\n=== FUNCTION BOUNDARY DETECTION TEST ===\n");
    println!("Testing scenario from screenshot:");
    println!("0x00024B92: pop {{r4, r5, r6, pc}}  <- function return");
    println!("0x00024B94: str r2, [r0, #4]       <- code after return");
    println!("0x00024B96: movs r0, #0            <- code after return");
    println!("0x00024B98: push {{r4, lr}}         <- new function start\n");

    // Check what was detected
    for (addr, func) in functions.iter() {
        println!("Function at 0x{:08X}:", addr);
        println!("  Start: 0x{:08X}", func.start_address);
        println!("  End:   {:?}", func.end_address.map(|e| format!("0x{:08X}", e)));

        // Get instructions in this function
        let func_instrs = detector.get_function_instructions(func, &instructions);
        println!("  Instructions ({} total):", func_instrs.len());
        for instr in func_instrs {
            let is_end = arch.is_function_end(instr);
            let marker = if is_end { " <- FUNCTION END" } else { "" };
            println!("    0x{:08X}: {} {}{}", instr.address, instr.mnemonic, instr.operands, marker);
        }
        println!();
    }

    // ANALYSIS
    println!("\n=== ANALYSIS ===\n");

    // Check if function at 0x00024B88 includes the instructions after pop {pc}
    if let Some(func) = functions.get(&0x00024B88) {
        println!("Function starting at 0x00024B88:");
        if let Some(end) = func.end_address {
            println!("  End address: 0x{:08X}", end);

            if end == 0x00024B92 {
                println!("  ✓ CORRECT: Function ends at pop {{pc}} (0x00024B92)");
                println!("  ✓ Instructions at 0x00024B94 and 0x00024B96 are NOT included");
            } else if end >= 0x00024B94 {
                println!("  ✗ BUG DETECTED: Function extends past pop {{pc}}!");
                println!("  ✗ Instructions after return are incorrectly included in function");
                panic!("Function boundary detection bug: function extends past pop {{pc}}");
            }
        }

        // Verify the instructions after the return are NOT in this function
        let func_instrs = detector.get_function_instructions(func, &instructions);
        let includes_0x24B94 = func_instrs.iter().any(|i| i.address == 0x00024B94);
        let includes_0x24B96 = func_instrs.iter().any(|i| i.address == 0x00024B96);

        assert!(!includes_0x24B94, "Function incorrectly includes instruction at 0x00024B94 after pop {{pc}}");
        assert!(!includes_0x24B96, "Function incorrectly includes instruction at 0x00024B96 after pop {{pc}}");
    } else {
        panic!("Function at 0x00024B88 not detected!");
    }

    // Check if function at 0x00024B98 is correctly detected
    assert!(functions.contains_key(&0x00024B98), "Function at 0x00024B98 not detected!");

    println!("\n=== TEST PASSED ===");
    println!("✓ Function boundaries are correctly detected");
    println!("✓ Instructions after pop {{pc}} are not included in the function");
    println!("✓ New function at push {{lr}} is correctly detected");
}

#[test]
fn test_is_function_end_detection() {
    let arch = ArmArchitecture;

    // Test that pop {pc} is recognized as function end
    let pop_pc = Instruction::new(0x1000, vec![0x70, 0xBD], "pop".to_string(), "{r4, r5, r6, pc}".to_string());
    assert!(arch.is_function_end(&pop_pc), "pop {{pc}} should be recognized as function end");

    // Test that bx lr is recognized as function end
    let bx_lr = Instruction::new(0x1000, vec![0x70, 0x47], "bx".to_string(), "lr".to_string());
    assert!(arch.is_function_end(&bx_lr), "bx lr should be recognized as function end");

    // Test that regular instructions are NOT function ends
    let str_instr = Instruction::new(0x1000, vec![0x42, 0x60], "str".to_string(), "r2, [r0, #4]".to_string());
    assert!(!arch.is_function_end(&str_instr), "str should NOT be recognized as function end");

    let movs = Instruction::new(0x1000, vec![0x00, 0x20], "movs".to_string(), "r0, #0".to_string());
    assert!(!arch.is_function_end(&movs), "movs should NOT be recognized as function end");
}
