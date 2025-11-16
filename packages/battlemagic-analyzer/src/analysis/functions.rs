//! Function boundary detection and analysis
//!
//! This module identifies function entry and exit points using
//! architecture-specific prologue/epilogue patterns and cross-references.

use crate::traits::{Architecture, Instruction};
use crate::types::{CrossReference, FunctionInfo, XrefType};
use std::collections::{HashMap, HashSet};

/// Function boundary detector
///
/// Uses multiple heuristics to identify function boundaries:
/// 1. Prologue patterns (push {lr}, sub sp)
/// 2. Epilogue patterns (pop {pc}, bx lr)
/// 3. Call targets (addresses called via bl/blx)
/// 4. Cross-reference analysis
pub struct FunctionDetector<'a, A: Architecture> {
    arch: &'a A,
}

impl<'a, A: Architecture> FunctionDetector<'a, A> {
    /// Create a new function detector for the given architecture
    pub fn new(arch: &'a A) -> Self {
        Self { arch }
    }

    /// Detect all functions in a sequence of instructions
    ///
    /// # Arguments
    /// * `instructions` - All instructions in the binary
    /// * `xrefs` - Cross-references (for identifying call targets)
    ///
    /// # Returns
    /// HashMap of function start addresses to FunctionInfo
    pub fn detect_functions(
        &self,
        instructions: &[Instruction],
        xrefs: &[CrossReference],
    ) -> HashMap<u32, FunctionInfo> {
        let mut functions = HashMap::new();

        // Strategy 1: Find function prologues
        let prologue_addrs = self.find_prologues(instructions);
        for addr in prologue_addrs {
            functions.insert(addr, FunctionInfo::new(addr));
        }

        // Strategy 2: Find call targets
        let call_targets = self.find_call_targets(xrefs);
        for addr in call_targets {
            functions.entry(addr).or_insert_with(|| FunctionInfo::new(addr));
        }

        // Strategy 3: Find function epilogues and set end addresses
        self.assign_function_ends(&mut functions, instructions);

        // Strategy 4: Build caller/callee relationships
        self.build_call_graph(&mut functions, xrefs);

        functions
    }

    /// Find all function prologues in the instruction stream
    fn find_prologues(&self, instructions: &[Instruction]) -> HashSet<u32> {
        let mut prologues = HashSet::new();

        for instr in instructions {
            if self.arch.is_function_start(instr) {
                prologues.insert(instr.address);
            }
        }

        prologues
    }

    /// Find all call targets from cross-references
    fn find_call_targets(&self, xrefs: &[CrossReference]) -> HashSet<u32> {
        let mut targets = HashSet::new();

        for xref in xrefs {
            if xref.xref_type == XrefType::Call {
                targets.insert(xref.to_addr);
            }
        }

        targets
    }

    /// Assign end addresses to functions by finding epilogues
    fn assign_function_ends(
        &self,
        functions: &mut HashMap<u32, FunctionInfo>,
        instructions: &[Instruction],
    ) {
        // Build a sorted list of function starts for boundary detection
        let mut func_starts: Vec<u32> = functions.keys().copied().collect();
        func_starts.sort_unstable();

        // Create address-to-instruction map for fast lookup (reserved for future use)
        let _inst_map: HashMap<u32, &Instruction> = instructions
            .iter()
            .map(|i| (i.address, i))
            .collect();

        for (i, &start_addr) in func_starts.iter().enumerate() {
            let func = functions.get_mut(&start_addr).unwrap();

            // Determine the search boundary (up to next function or end of code)
            let next_func_addr = func_starts.get(i + 1).copied().unwrap_or(u32::MAX);

            // Find the last epilogue before the next function
            let mut last_epilogue = None;
            for instr in instructions {
                if instr.address >= start_addr && instr.address < next_func_addr {
                    if self.arch.is_function_end(instr) {
                        last_epilogue = Some(instr.address);
                    }
                } else if instr.address >= next_func_addr {
                    break;
                }
            }

            func.end_address = last_epilogue;
        }
    }

    /// Build caller/callee relationships from cross-references
    fn build_call_graph(&self, functions: &mut HashMap<u32, FunctionInfo>, xrefs: &[CrossReference]) {
        for xref in xrefs {
            if xref.xref_type != XrefType::Call {
                continue;
            }

            let caller_addr = xref.from_addr;
            let callee_addr = xref.to_addr;

            // Find the function that contains the caller
            if let Some(caller_func_addr) = self.find_containing_function(functions, caller_addr) {
                // Add callee to caller's callees list
                if let Some(caller_func) = functions.get_mut(&caller_func_addr) {
                    caller_func.add_callee(callee_addr);
                }

                // Add caller to callee's callers list
                if let Some(callee_func) = functions.get_mut(&callee_addr) {
                    callee_func.add_caller(caller_func_addr);
                }
            }
        }
    }

    /// Find the function that contains the given address
    fn find_containing_function(
        &self,
        functions: &HashMap<u32, FunctionInfo>,
        addr: u32,
    ) -> Option<u32> {
        for (start_addr, func) in functions {
            if addr >= *start_addr {
                if let Some(end_addr) = func.end_address {
                    if addr <= end_addr {
                        return Some(*start_addr);
                    }
                } else {
                    // No end address known, assume it could be in this function
                    return Some(*start_addr);
                }
            }
        }
        None
    }

    /// Get instructions belonging to a specific function
    ///
    /// # Arguments
    /// * `function` - The function info
    /// * `instructions` - All instructions in the binary
    ///
    /// # Returns
    /// Vector of instructions in this function
    pub fn get_function_instructions<'b>(
        &self,
        function: &FunctionInfo,
        instructions: &'b [Instruction],
    ) -> Vec<&'b Instruction> {
        let end_addr = function.end_address.unwrap_or(u32::MAX);

        instructions
            .iter()
            .filter(|i| i.address >= function.start_address && i.address <= end_addr)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::XrefType;

    // Mock architecture for testing
    struct MockArch;

    impl Architecture for MockArch {
        fn name(&self) -> &'static str {
            "Mock"
        }

        fn instruction_alignment(&self) -> usize {
            4
        }

        fn decode(&self, _bytes: &[u8], _addr: u32) -> Option<Instruction> {
            None
        }

        fn extract_xrefs(&self, _inst: &Instruction) -> Vec<crate::traits::CrossReference> {
            vec![]
        }

        fn is_function_start(&self, inst: &Instruction) -> bool {
            // Treat "push" with "lr" as function start
            inst.mnemonic.to_lowercase() == "push" && inst.operands.to_lowercase().contains("lr")
        }

        fn is_function_end(&self, inst: &Instruction) -> bool {
            // Treat "bx lr" or "pop pc" as function end
            let mnemonic = inst.mnemonic.to_lowercase();
            (mnemonic == "bx" && inst.operands.to_lowercase().contains("lr"))
                || (mnemonic == "pop" && inst.operands.to_lowercase().contains("pc"))
        }

        fn is_conditional_branch(&self, _inst: &Instruction) -> bool {
            false
        }

        fn is_unconditional_branch(&self, _inst: &Instruction) -> bool {
            false
        }

        fn is_call(&self, _inst: &Instruction) -> bool {
            false
        }

        fn is_comparison(&self, _inst: &Instruction) -> bool {
            false
        }

        fn get_branch_target(&self, _inst: &Instruction) -> Option<u32> {
            None
        }

        fn arg_registers(&self) -> &[&str] {
            &["r0", "r1", "r2", "r3"]
        }

        fn return_register(&self) -> &str {
            "r0"
        }

        fn link_register(&self) -> &str {
            "lr"
        }

        fn stack_pointer(&self) -> &str {
            "sp"
        }
    }

    fn make_inst(addr: u32, mnemonic: &str, operands: &str) -> Instruction {
        Instruction::new(
            addr,
            vec![],
            mnemonic.to_string(),
            operands.to_string(),
        )
    }

    fn make_xref(from: u32, to: u32, xref_type: XrefType) -> CrossReference {
        CrossReference {
            from_addr: from,
            to_addr: to,
            xref_type,
            instruction: "bl".to_string(),
            operands: format!("#{:#x}", to),
        }
    }

    #[test]
    fn test_detect_prologue() {
        let detector = FunctionDetector::new(&MockArch);
        let instructions = vec![
            make_inst(0x1000, "push", "{r7, lr}"),
            make_inst(0x1004, "sub", "sp, sp, #8"),
            make_inst(0x1008, "mov", "r0, #1"),
        ];

        let prologues = detector.find_prologues(&instructions);
        assert_eq!(prologues.len(), 1);
        assert!(prologues.contains(&0x1000));
    }

    #[test]
    fn test_detect_call_targets() {
        let detector = FunctionDetector::new(&MockArch);
        let xrefs = vec![
            make_xref(0x1000, 0x2000, XrefType::Call),
            make_xref(0x1004, 0x2000, XrefType::Call),
            make_xref(0x1008, 0x3000, XrefType::Call),
            make_xref(0x100c, 0x4000, XrefType::Branch),
        ];

        let targets = detector.find_call_targets(&xrefs);
        assert_eq!(targets.len(), 2);
        assert!(targets.contains(&0x2000));
        assert!(targets.contains(&0x3000));
        assert!(!targets.contains(&0x4000)); // Branch, not call
    }

    #[test]
    fn test_detect_functions_with_prologue() {
        let detector = FunctionDetector::new(&MockArch);
        let instructions = vec![
            make_inst(0x1000, "push", "{r7, lr}"),
            make_inst(0x1004, "mov", "r0, #1"),
            make_inst(0x1008, "bx", "lr"),
            make_inst(0x2000, "push", "{r7, lr}"),
            make_inst(0x2004, "bl", "#0x3000"),
            make_inst(0x2008, "pop", "{r7, pc}"),
        ];
        let xrefs = vec![
            make_xref(0x2004, 0x3000, XrefType::Call),
        ];

        let functions = detector.detect_functions(&instructions, &xrefs);

        // Should detect 3 functions: 0x1000, 0x2000 (prologues), 0x3000 (call target)
        assert_eq!(functions.len(), 3);
        assert!(functions.contains_key(&0x1000));
        assert!(functions.contains_key(&0x2000));
        assert!(functions.contains_key(&0x3000));
    }

    #[test]
    fn test_assign_function_ends() {
        let detector = FunctionDetector::new(&MockArch);
        let instructions = vec![
            make_inst(0x1000, "push", "{r7, lr}"),
            make_inst(0x1004, "mov", "r0, #1"),
            make_inst(0x1008, "bx", "lr"),
            make_inst(0x2000, "push", "{r7, lr}"),
            make_inst(0x2004, "mov", "r0, #2"),
            make_inst(0x2008, "pop", "{r7, pc}"),
        ];
        let xrefs = vec![];

        let functions = detector.detect_functions(&instructions, &xrefs);

        let func1 = functions.get(&0x1000).unwrap();
        assert_eq!(func1.end_address, Some(0x1008));

        let func2 = functions.get(&0x2000).unwrap();
        assert_eq!(func2.end_address, Some(0x2008));
    }

    #[test]
    fn test_build_call_graph() {
        let detector = FunctionDetector::new(&MockArch);
        let instructions = vec![
            make_inst(0x1000, "push", "{r7, lr}"),
            make_inst(0x1004, "bl", "#0x2000"),
            make_inst(0x1008, "bx", "lr"),
            make_inst(0x2000, "push", "{r7, lr}"),
            make_inst(0x2004, "bx", "lr"),
        ];
        let xrefs = vec![
            make_xref(0x1004, 0x2000, XrefType::Call),
        ];

        let functions = detector.detect_functions(&instructions, &xrefs);

        // Function at 0x1000 should have 0x2000 as callee
        let func1 = functions.get(&0x1000).unwrap();
        assert_eq!(func1.callees.len(), 1);
        assert!(func1.callees.contains(&0x2000));

        // Function at 0x2000 should have 0x1000 as caller
        let func2 = functions.get(&0x2000).unwrap();
        assert_eq!(func2.callers.len(), 1);
        assert!(func2.callers.contains(&0x1000));
    }

    #[test]
    fn test_get_function_instructions() {
        let detector = FunctionDetector::new(&MockArch);
        let instructions = vec![
            make_inst(0x1000, "push", "{r7, lr}"),
            make_inst(0x1004, "mov", "r0, #1"),
            make_inst(0x1008, "bx", "lr"),
            make_inst(0x2000, "push", "{r7, lr}"),
            make_inst(0x2004, "mov", "r0, #2"),
        ];

        let mut func = FunctionInfo::new(0x1000);
        func.end_address = Some(0x1008);

        let func_instrs = detector.get_function_instructions(&func, &instructions);
        assert_eq!(func_instrs.len(), 3);
        assert_eq!(func_instrs[0].address, 0x1000);
        assert_eq!(func_instrs[1].address, 0x1004);
        assert_eq!(func_instrs[2].address, 0x1008);
    }

    #[test]
    fn test_find_containing_function() {
        let detector = FunctionDetector::new(&MockArch);
        let mut functions = HashMap::new();

        let mut func1 = FunctionInfo::new(0x1000);
        func1.end_address = Some(0x1010);
        functions.insert(0x1000, func1);

        let mut func2 = FunctionInfo::new(0x2000);
        func2.end_address = Some(0x2020);
        functions.insert(0x2000, func2);

        assert_eq!(detector.find_containing_function(&functions, 0x1004), Some(0x1000));
        assert_eq!(detector.find_containing_function(&functions, 0x2010), Some(0x2000));
        assert_eq!(detector.find_containing_function(&functions, 0x3000), None);
    }

    #[test]
    fn test_multiple_callers() {
        let detector = FunctionDetector::new(&MockArch);
        let instructions = vec![
            make_inst(0x1000, "push", "{r7, lr}"),
            make_inst(0x1004, "bl", "#0x3000"),
            make_inst(0x2000, "push", "{r7, lr}"),
            make_inst(0x2004, "bl", "#0x3000"),
            make_inst(0x3000, "push", "{r7, lr}"),
        ];
        let xrefs = vec![
            make_xref(0x1004, 0x3000, XrefType::Call),
            make_xref(0x2004, 0x3000, XrefType::Call),
        ];

        let functions = detector.detect_functions(&instructions, &xrefs);

        let func3 = functions.get(&0x3000).unwrap();
        assert_eq!(func3.callers.len(), 2);
        assert!(func3.callers.contains(&0x1000));
        assert!(func3.callers.contains(&0x2000));
    }
}
