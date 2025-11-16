//! ARM Thumb-2 architecture implementation

mod xref;
mod patterns;
mod decoder;

use crate::traits::{Architecture, Instruction, CrossReference};

pub use xref::extract_arm_xrefs;
pub use patterns::{is_arm_function_start, is_arm_function_end};

/// ARM Thumb-2 architecture
pub struct ArmArchitecture;

impl Architecture for ArmArchitecture {
    fn decode(&self, bytes: &[u8], addr: u32) -> Option<Instruction> {
        decoder::decode_arm_instruction(bytes, addr)
    }

    fn extract_xrefs(&self, inst: &Instruction) -> Vec<CrossReference> {
        extract_arm_xrefs(inst)
    }

    fn is_function_start(&self, inst: &Instruction) -> bool {
        is_arm_function_start(inst)
    }

    fn is_function_end(&self, inst: &Instruction) -> bool {
        is_arm_function_end(inst)
    }

    fn name(&self) -> &'static str {
        "ARM Thumb-2"
    }

    fn instruction_alignment(&self) -> usize {
        2  // Thumb mode uses 2-byte alignment
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_arm_architecture_creation() {
        let arch = ArmArchitecture;
        assert_eq!(arch.name(), "ARM Thumb-2");
        assert_eq!(arch.instruction_alignment(), 2);
    }
}
