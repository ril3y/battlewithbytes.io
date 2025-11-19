/// Main architecture detection logic
///
/// This module provides the core architecture detection functionality,
/// coordinating ELF parsing and pattern matching to identify the target
/// architecture with high confidence.

use wasm_bindgen::prelude::*;
use super::elf::{is_elf, detect_elf_architecture, detect_pe_architecture};
use super::types::{Architecture, BinaryFormat, DetectionResult};
use crate::arch::arm::binary_patterns::score_arm_patterns;
use crate::arch::mips::binary_patterns::score_mips_patterns;
use crate::arch::riscv::binary_patterns::score_riscv_patterns;
use std::collections::HashMap;

/// Architecture detector with configuration options
pub struct ArchitectureDetector {
    /// Base address hint for improving detection
    base_address: Option<u32>,
}

impl Default for ArchitectureDetector {
    fn default() -> Self {
        Self::new()
    }
}

impl ArchitectureDetector {
    /// Create a new architecture detector
    pub fn new() -> Self {
        Self {
            base_address: None,
        }
    }

    /// Set base address hint
    pub fn with_base_address(mut self, base_address: u32) -> Self {
        self.base_address = Some(base_address);
        self
    }

    /// Detect architecture from binary data
    ///
    /// This is the main entry point for architecture detection.
    /// It uses a multi-stage approach:
    /// 1. Check ELF header for explicit architecture
    /// 2. Check PE header for explicit architecture
    /// 3. Use heuristic pattern matching for raw binaries
    /// 4. Apply base address hints if available
    pub fn detect(&self, data: &[u8]) -> DetectionResult {
        let mut hints = Vec::new();
        let mut format = BinaryFormat::RAW;

        // Stage 1: Check for ELF format
        if is_elf(data) {
            format = BinaryFormat::ELF;
            let elf_arch = detect_elf_architecture(data);
            if elf_arch != Architecture::UNKNOWN {
                hints.push(format!("ELF header indicates {}", elf_arch.as_str()));
                let mut result = DetectionResult::new(elf_arch, 0.95, format);
                result.hints = hints;
                return result;
            }
        }

        // Stage 2: Check for PE format
        let pe_arch = detect_pe_architecture(data);
        if pe_arch != Architecture::UNKNOWN {
            hints.push(format!("PE header indicates {}", pe_arch.as_str()));
            let mut result = DetectionResult::new(pe_arch, 0.95, BinaryFormat::PE);
            result.hints = hints;
            return result;
        }

        // Stage 3: Use heuristic pattern matching for raw binaries
        let mut scores: HashMap<Architecture, f32> = HashMap::new();

        // Score ARM patterns
        let mut arm_hints = Vec::new();
        let arm_score = score_arm_patterns(data, &mut arm_hints);
        scores.insert(Architecture::ARM, arm_score);
        hints.extend(arm_hints);

        // Score MIPS patterns
        let mut mips_hints = Vec::new();
        let mips_score = score_mips_patterns(data, &mut mips_hints);
        scores.insert(Architecture::MIPS, mips_score);
        hints.extend(mips_hints);

        // Score RISC-V patterns
        let mut riscv_hints = Vec::new();
        let riscv_score = score_riscv_patterns(data, &mut riscv_hints);
        scores.insert(Architecture::RISCV, riscv_score);
        hints.extend(riscv_hints);

        // Find highest scoring architecture
        let mut best_arch = Architecture::UNKNOWN;
        let mut best_score = 0.0f32;

        for (&arch, &score) in &scores {
            if score > best_score {
                best_score = score;
                best_arch = arch;
            }
        }

        // Stage 4: Apply base address hints if available
        if let Some(base_addr) = self.base_address {
            let (addr_arch, addr_score, addr_hint) = self.score_base_address(base_addr);

            if let Some(hint) = addr_hint {
                hints.push(hint);
            }

            // Use base address hint if current detection is weak OR
            // if base address gives higher confidence
            if addr_arch != Architecture::UNKNOWN {
                if best_score < 0.5 || addr_score > best_score {
                    best_arch = addr_arch;
                    best_score = addr_score;
                }
            }
        }

        let mut result = DetectionResult::new(best_arch, best_score, format);
        result.hints = hints;
        result
    }

    /// Score architecture based on base address patterns
    fn score_base_address(&self, base_addr: u32) -> (Architecture, f32, Option<String>) {
        // ARM STM32 flash addresses - very confident indicator
        if base_addr >= 0x0800_0000 && base_addr < 0x1000_0000 {
            return (
                Architecture::ARM,
                0.7,
                Some(format!("Base address suggests ARM STM32 (0x{:08X})", base_addr)),
            );
        }

        // MIPS boot ROM addresses - very confident indicator
        if base_addr >= 0xBFC0_0000 {
            return (
                Architecture::MIPS,
                0.7,
                Some(format!("Base address suggests MIPS boot ROM (0x{:08X})", base_addr)),
            );
        }

        (Architecture::UNKNOWN, 0.0, None)
    }
}

/// WASM-exported function for architecture detection
///
/// This is the main entry point called from JavaScript.
/// Takes a Uint8Array and optional base address, returns DetectionResult as JSON.
#[wasm_bindgen(js_name = detectArchitecture)]
pub fn detect_architecture(data: &[u8], base_address: Option<u32>) -> JsValue {
    let mut detector = ArchitectureDetector::new();

    if let Some(addr) = base_address {
        detector = detector.with_base_address(addr);
    }

    let result = detector.detect(data);

    // Serialize to JsValue for JavaScript consumption
    serde_wasm_bindgen::to_value(&result).unwrap_or_else(|_| JsValue::NULL)
}

/// WASM-exported function for quick ELF architecture detection
///
/// Faster path for ELF files that don't need pattern matching.
#[wasm_bindgen(js_name = detectElfArchitecture)]
pub fn detect_elf_architecture_wasm(data: &[u8]) -> String {
    detect_elf_architecture(data).as_str().to_string()
}

/// WASM-exported helper to check if data is ELF
#[wasm_bindgen(js_name = isElf)]
pub fn is_elf_wasm(data: &[u8]) -> bool {
    is_elf(data)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detector_with_arm_vector_table() {
        // Simulate ARM Cortex-M vector table
        let mut data = vec![0u8; 512];

        // Stack pointer: 0x20001000 (valid ARM SRAM)
        data[0..4].copy_from_slice(&0x2000_1000u32.to_le_bytes());

        // Reset handler: 0x080001C1 (Thumb bit set)
        data[4..8].copy_from_slice(&0x0800_01C1u32.to_le_bytes());

        // More vectors with Thumb bit
        for i in (8..64).step_by(4) {
            data[i..i+4].copy_from_slice(&0x0800_0101u32.to_le_bytes());
        }

        let detector = ArchitectureDetector::new();
        let result = detector.detect(&data);

        assert_eq!(result.architecture, Architecture::ARM);
        assert!(result.confidence > 0.5);
    }

    #[test]
    fn test_detector_with_elf_header() {
        // Minimal ELF header for ARM
        let mut data = vec![0u8; 0x14];
        data[0..4].copy_from_slice(&[0x7F, 0x45, 0x4C, 0x46]); // ELF magic
        data[5] = 1; // Little endian
        data[0x12] = 40; // EM_ARM
        data[0x13] = 0;

        let detector = ArchitectureDetector::new();
        let result = detector.detect(&data);

        assert_eq!(result.architecture, Architecture::ARM);
        assert_eq!(result.confidence, 0.95);
        assert_eq!(result.format, BinaryFormat::ELF);
    }

    #[test]
    fn test_base_address_hint_arm() {
        let data = vec![0u8; 256];

        let detector = ArchitectureDetector::new()
            .with_base_address(0x0800_0000);

        let result = detector.detect(&data);

        // Should detect ARM based on base address hint
        assert_eq!(result.architecture, Architecture::ARM);
        assert!(result.hints.iter().any(|h| h.contains("STM32")));
    }

    #[test]
    fn test_base_address_hint_mips() {
        let data = vec![0u8; 256];

        let detector = ArchitectureDetector::new()
            .with_base_address(0xBFC0_0000);

        let result = detector.detect(&data);

        // Should detect MIPS based on base address hint
        assert_eq!(result.architecture, Architecture::MIPS);
        assert!(result.hints.iter().any(|h| h.contains("boot ROM")));
    }

    #[test]
    fn test_unknown_architecture() {
        // Random data that doesn't match any pattern
        let data = vec![0x42u8; 256];

        let detector = ArchitectureDetector::new();
        let result = detector.detect(&data);

        // May detect as UNKNOWN or have very low confidence
        assert!(result.confidence < 0.5);
    }
}
