//! Chip Database and Architecture Detection
//!
//! This module provides a comprehensive, compile-time validated chip database
//! with fuzzy matching for architecture detection. It replaces fragile string
//! matching in TypeScript with type-safe Rust patterns.
//!
//! # Architecture
//!
//! The system uses a const array for zero runtime cost, combined with
//! sophisticated pattern matching to detect chip families and architectures
//! from target descriptions.
//!
//! # Example
//!
//! ```rust
//! use battlemagic_analyzer::chips::detect_architecture;
//!
//! let info = detect_architecture("STM32F407VG");
//! assert_eq!(info.architecture, Architecture::ArmCortexM4);
//! assert_eq!(info.manufacturer, "STMicroelectronics");
//! assert!(info.confidence > 0.9);
//! ```

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// CPU Architecture enumeration
///
/// Represents supported and planned CPU architectures.
/// ARM variants are fully supported, others marked as future expansion.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub enum Architecture {
    /// ARM Cortex-M0 (ARMv6-M)
    ArmCortexM0,
    /// ARM Cortex-M0+ (ARMv6-M with optimizations)
    ArmCortexM0Plus,
    /// ARM Cortex-M3 (ARMv7-M)
    ArmCortexM3,
    /// ARM Cortex-M4 (ARMv7E-M with DSP)
    ArmCortexM4,
    /// ARM Cortex-M7 (ARMv7E-M with cache)
    ArmCortexM7,
    /// ARM Cortex-M23 (ARMv8-M Baseline with TrustZone)
    ArmCortexM23,
    /// ARM Cortex-M33 (ARMv8-M Mainline with TrustZone)
    ArmCortexM33,
    /// MIPS32 (Future support)
    Mips32,
    /// MIPS32r2 (Future support)
    Mips32r2,
    /// RISC-V 32-bit (Future support)
    RiscV32,
    /// RISC-V 32-bit with compressed instructions (Future support)
    RiscV32C,
    /// Unknown or unsupported architecture
    Unknown,
}

impl Architecture {
    /// Get human-readable name
    pub fn name(&self) -> &'static str {
        match self {
            Architecture::ArmCortexM0 => "ARM Cortex-M0",
            Architecture::ArmCortexM0Plus => "ARM Cortex-M0+",
            Architecture::ArmCortexM3 => "ARM Cortex-M3",
            Architecture::ArmCortexM4 => "ARM Cortex-M4",
            Architecture::ArmCortexM7 => "ARM Cortex-M7",
            Architecture::ArmCortexM23 => "ARM Cortex-M23",
            Architecture::ArmCortexM33 => "ARM Cortex-M33",
            Architecture::Mips32 => "MIPS32",
            Architecture::Mips32r2 => "MIPS32r2",
            Architecture::RiscV32 => "RISC-V 32",
            Architecture::RiscV32C => "RISC-V 32 Compressed",
            Architecture::Unknown => "Unknown",
        }
    }

    /// Check if architecture has a working decoder
    pub fn is_supported(&self) -> bool {
        matches!(
            self,
            Architecture::ArmCortexM0
                | Architecture::ArmCortexM0Plus
                | Architecture::ArmCortexM3
                | Architecture::ArmCortexM4
                | Architecture::ArmCortexM7
                | Architecture::ArmCortexM23
                | Architecture::ArmCortexM33
        )
    }

    /// Get instruction set architecture family
    pub fn isa_family(&self) -> &'static str {
        match self {
            Architecture::ArmCortexM0
            | Architecture::ArmCortexM0Plus
            | Architecture::ArmCortexM3
            | Architecture::ArmCortexM4
            | Architecture::ArmCortexM7
            | Architecture::ArmCortexM23
            | Architecture::ArmCortexM33 => "ARM",
            Architecture::Mips32 | Architecture::Mips32r2 => "MIPS",
            Architecture::RiscV32 | Architecture::RiscV32C => "RISC-V",
            Architecture::Unknown => "Unknown",
        }
    }
}

/// Chip family information
///
/// Represents a specific microcontroller family (e.g., STM32F4, nRF52).
/// Used for compile-time database construction.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ChipFamily {
    /// Family identifier (e.g., "STM32F4", "nRF52")
    pub family: &'static str,
    /// Manufacturer name
    pub manufacturer: &'static str,
    /// CPU core architecture
    pub architecture: Architecture,
    /// Whether this chip is fully supported
    pub supported: bool,
    /// Pattern matching rules for detection
    pub patterns: &'static [&'static str],
    /// Human-readable description
    pub description: &'static str,
}

/// Architecture detection result
///
/// Contains comprehensive information about detected architecture
/// with confidence scoring for UI feedback.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchitectureInfo {
    /// Detected architecture
    pub architecture: Architecture,
    /// Matched chip family name
    pub chip_name: String,
    /// Manufacturer name
    pub manufacturer: String,
    /// Whether decoder is available
    pub supported: bool,
    /// Match confidence (0.0-1.0)
    pub confidence: f32,
    /// Human-readable architecture name
    pub architecture_name: String,
    /// ISA family (ARM/MIPS/RISC-V)
    pub isa_family: String,
}

impl Default for ArchitectureInfo {
    fn default() -> Self {
        Self {
            architecture: Architecture::Unknown,
            chip_name: "Unknown".to_string(),
            manufacturer: "Unknown".to_string(),
            supported: false,
            confidence: 0.0,
            architecture_name: "Unknown".to_string(),
            isa_family: "Unknown".to_string(),
        }
    }
}

/// Compile-time chip database
///
/// This const array is embedded in the binary at compile time, providing
/// zero-cost runtime lookups. Adding new chips is as simple as adding
/// entries to this array.
pub const CHIP_DATABASE: &[ChipFamily] = &[
    // STM32 F-Series (Performance line)
    ChipFamily {
        family: "STM32F0",
        manufacturer: "STMicroelectronics",
        architecture: Architecture::ArmCortexM0,
        supported: true,
        patterns: &["STM32F0", "stm32f0"],
        description: "STM32F0 series - Entry-level ARM Cortex-M0",
    },
    ChipFamily {
        family: "STM32F1",
        manufacturer: "STMicroelectronics",
        architecture: Architecture::ArmCortexM3,
        supported: true,
        patterns: &["STM32F1", "stm32f1"],
        description: "STM32F1 series - Mainstream ARM Cortex-M3",
    },
    ChipFamily {
        family: "STM32F2",
        manufacturer: "STMicroelectronics",
        architecture: Architecture::ArmCortexM3,
        supported: true,
        patterns: &["STM32F2", "stm32f2"],
        description: "STM32F2 series - High-performance ARM Cortex-M3",
    },
    ChipFamily {
        family: "STM32F3",
        manufacturer: "STMicroelectronics",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["STM32F3", "stm32f3"],
        description: "STM32F3 series - Mixed-signal ARM Cortex-M4",
    },
    ChipFamily {
        family: "STM32F4",
        manufacturer: "STMicroelectronics",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["STM32F4", "stm32f4"],
        description: "STM32F4 series - High-performance ARM Cortex-M4 with DSP and FPU",
    },
    ChipFamily {
        family: "STM32F7",
        manufacturer: "STMicroelectronics",
        architecture: Architecture::ArmCortexM7,
        supported: true,
        patterns: &["STM32F7", "stm32f7"],
        description: "STM32F7 series - Very high-performance ARM Cortex-M7",
    },
    // STM32 L-Series (Ultra-low-power)
    ChipFamily {
        family: "STM32L0",
        manufacturer: "STMicroelectronics",
        architecture: Architecture::ArmCortexM0Plus,
        supported: true,
        patterns: &["STM32L0", "stm32l0"],
        description: "STM32L0 series - Ultra-low-power ARM Cortex-M0+",
    },
    ChipFamily {
        family: "STM32L1",
        manufacturer: "STMicroelectronics",
        architecture: Architecture::ArmCortexM3,
        supported: true,
        patterns: &["STM32L1", "stm32l1"],
        description: "STM32L1 series - Ultra-low-power ARM Cortex-M3",
    },
    ChipFamily {
        family: "STM32L4",
        manufacturer: "STMicroelectronics",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["STM32L4", "stm32l4"],
        description: "STM32L4 series - Ultra-low-power ARM Cortex-M4",
    },
    ChipFamily {
        family: "STM32L5",
        manufacturer: "STMicroelectronics",
        architecture: Architecture::ArmCortexM33,
        supported: true,
        patterns: &["STM32L5", "stm32l5"],
        description: "STM32L5 series - Ultra-low-power ARM Cortex-M33 with TrustZone",
    },
    // STM32 G-Series (Mainstream)
    ChipFamily {
        family: "STM32G0",
        manufacturer: "STMicroelectronics",
        architecture: Architecture::ArmCortexM0Plus,
        supported: true,
        patterns: &["STM32G0", "stm32g0"],
        description: "STM32G0 series - Mainstream ARM Cortex-M0+",
    },
    ChipFamily {
        family: "STM32G4",
        manufacturer: "STMicroelectronics",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["STM32G4", "stm32g4"],
        description: "STM32G4 series - Mainstream ARM Cortex-M4 for motor control",
    },
    // STM32 H-Series (High-performance)
    ChipFamily {
        family: "STM32H7",
        manufacturer: "STMicroelectronics",
        architecture: Architecture::ArmCortexM7,
        supported: true,
        patterns: &["STM32H7", "stm32h7"],
        description: "STM32H7 series - Highest-performance ARM Cortex-M7 with dual core",
    },
    // Nordic Semiconductor
    ChipFamily {
        family: "nRF51",
        manufacturer: "Nordic Semiconductor",
        architecture: Architecture::ArmCortexM0,
        supported: true,
        patterns: &["nRF51", "nrf51", "NRF51"],
        description: "nRF51 series - Bluetooth Low Energy SoC with ARM Cortex-M0",
    },
    ChipFamily {
        family: "nRF52805",
        manufacturer: "Nordic Semiconductor",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["nRF52805", "nrf52805"],
        description: "nRF52805 - Low-cost Bluetooth 5.1 SoC",
    },
    ChipFamily {
        family: "nRF52810",
        manufacturer: "Nordic Semiconductor",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["nRF52810", "nrf52810"],
        description: "nRF52810 - Bluetooth 5 SoC",
    },
    ChipFamily {
        family: "nRF52811",
        manufacturer: "Nordic Semiconductor",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["nRF52811", "nrf52811"],
        description: "nRF52811 - Multiprotocol Bluetooth 5.1 SoC",
    },
    ChipFamily {
        family: "nRF52820",
        manufacturer: "Nordic Semiconductor",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["nRF52820", "nrf52820"],
        description: "nRF52820 - Multiprotocol Bluetooth 5.1 SoC",
    },
    ChipFamily {
        family: "nRF52832",
        manufacturer: "Nordic Semiconductor",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["nRF52832", "nrf52832", "nRF52", "nrf52"],
        description: "nRF52832 - Advanced multiprotocol SoC",
    },
    ChipFamily {
        family: "nRF52833",
        manufacturer: "Nordic Semiconductor",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["nRF52833", "nrf52833"],
        description: "nRF52833 - Multiprotocol Bluetooth 5.1 SoC with Thread",
    },
    ChipFamily {
        family: "nRF52840",
        manufacturer: "Nordic Semiconductor",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["nRF52840", "nrf52840"],
        description: "nRF52840 - Advanced multiprotocol SoC with USB",
    },
    // Microchip/Atmel SAM D-Series
    ChipFamily {
        family: "SAMD20",
        manufacturer: "Microchip",
        architecture: Architecture::ArmCortexM0Plus,
        supported: true,
        patterns: &["SAMD20", "samd20"],
        description: "SAM D20 - Low-power ARM Cortex-M0+ MCU",
    },
    ChipFamily {
        family: "SAMD21",
        manufacturer: "Microchip",
        architecture: Architecture::ArmCortexM0Plus,
        supported: true,
        patterns: &["SAMD21", "samd21"],
        description: "SAM D21 - Low-power ARM Cortex-M0+ MCU (Arduino Zero)",
    },
    ChipFamily {
        family: "SAMD51",
        manufacturer: "Microchip",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["SAMD51", "samd51"],
        description: "SAM D51 - High-performance ARM Cortex-M4 MCU",
    },
    ChipFamily {
        family: "SAME51",
        manufacturer: "Microchip",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["SAME51", "same51"],
        description: "SAM E51 - Ethernet-enabled ARM Cortex-M4 MCU",
    },
    ChipFamily {
        family: "SAME53",
        manufacturer: "Microchip",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["SAME53", "same53"],
        description: "SAM E53 - Ethernet-enabled ARM Cortex-M4 MCU",
    },
    ChipFamily {
        family: "SAME54",
        manufacturer: "Microchip",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["SAME54", "same54"],
        description: "SAM E54 - Ethernet-enabled ARM Cortex-M4 MCU",
    },
    // NXP LPC Series
    ChipFamily {
        family: "LPC11xx",
        manufacturer: "NXP",
        architecture: Architecture::ArmCortexM0,
        supported: true,
        patterns: &["LPC11", "lpc11"],
        description: "LPC11xx - Entry-level ARM Cortex-M0",
    },
    ChipFamily {
        family: "LPC13xx",
        manufacturer: "NXP",
        architecture: Architecture::ArmCortexM3,
        supported: true,
        patterns: &["LPC13", "lpc13"],
        description: "LPC13xx - ARM Cortex-M3 with USB",
    },
    ChipFamily {
        family: "LPC15xx",
        manufacturer: "NXP",
        architecture: Architecture::ArmCortexM3,
        supported: true,
        patterns: &["LPC15", "lpc15"],
        description: "LPC15xx - High-performance ARM Cortex-M3",
    },
    ChipFamily {
        family: "LPC17xx",
        manufacturer: "NXP",
        architecture: Architecture::ArmCortexM3,
        supported: true,
        patterns: &["LPC17", "lpc17", "LPC1768", "lpc1768"],
        description: "LPC17xx - ARM Cortex-M3 with Ethernet (popular LPC1768)",
    },
    ChipFamily {
        family: "LPC18xx",
        manufacturer: "NXP",
        architecture: Architecture::ArmCortexM3,
        supported: true,
        patterns: &["LPC18", "lpc18"],
        description: "LPC18xx - Dual-core ARM Cortex-M3/M0",
    },
    ChipFamily {
        family: "LPC40xx",
        manufacturer: "NXP",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["LPC40", "lpc40", "LPC4088", "lpc4088"],
        description: "LPC40xx - High-performance ARM Cortex-M4",
    },
    ChipFamily {
        family: "LPC43xx",
        manufacturer: "NXP",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["LPC43", "lpc43"],
        description: "LPC43xx - Dual-core ARM Cortex-M4/M0",
    },
    ChipFamily {
        family: "LPC54xxx",
        manufacturer: "NXP",
        architecture: Architecture::ArmCortexM4,
        supported: true,
        patterns: &["LPC54", "lpc54"],
        description: "LPC54xxx - High-performance ARM Cortex-M4",
    },
    ChipFamily {
        family: "LPC55xx",
        manufacturer: "NXP",
        architecture: Architecture::ArmCortexM33,
        supported: true,
        patterns: &["LPC55", "lpc55"],
        description: "LPC55xx - ARM Cortex-M33 with TrustZone",
    },
    // Raspberry Pi
    ChipFamily {
        family: "RP2040",
        manufacturer: "Raspberry Pi",
        architecture: Architecture::ArmCortexM0Plus,
        supported: true,
        patterns: &["RP2040", "rp2040"],
        description: "RP2040 - Dual-core ARM Cortex-M0+ with PIO",
    },
    // Future: MIPS (marked as unsupported)
    ChipFamily {
        family: "PIC32MX",
        manufacturer: "Microchip",
        architecture: Architecture::Mips32,
        supported: false,
        patterns: &["PIC32MX", "pic32mx"],
        description: "PIC32MX - MIPS32 microcontroller (future support)",
    },
    ChipFamily {
        family: "PIC32MZ",
        manufacturer: "Microchip",
        architecture: Architecture::Mips32,
        supported: false,
        patterns: &["PIC32MZ", "pic32mz"],
        description: "PIC32MZ - MIPS32 microcontroller (future support)",
    },
    // Future: RISC-V (marked as unsupported)
    ChipFamily {
        family: "GD32VF103",
        manufacturer: "GigaDevice",
        architecture: Architecture::RiscV32,
        supported: false,
        patterns: &["GD32VF103", "gd32vf103"],
        description: "GD32VF103 - RISC-V RV32IMAC (future support)",
    },
    ChipFamily {
        family: "ESP32-C3",
        manufacturer: "Espressif",
        architecture: Architecture::RiscV32C,
        supported: false,
        patterns: &["ESP32-C3", "esp32-c3", "ESP32C3"],
        description: "ESP32-C3 - RISC-V with WiFi/BLE (future support)",
    },
    ChipFamily {
        family: "ESP32-C6",
        manufacturer: "Espressif",
        architecture: Architecture::RiscV32C,
        supported: false,
        patterns: &["ESP32-C6", "esp32-c6", "ESP32C6"],
        description: "ESP32-C6 - RISC-V with WiFi 6/BLE (future support)",
    },
];

/// Pattern matching confidence levels
#[derive(Debug, Clone, Copy, PartialEq)]
enum MatchQuality {
    /// Exact pattern match
    Exact,
    /// Case-insensitive exact match
    CaseInsensitive,
    /// Substring match with correct case
    Substring,
    /// Substring match with different case
    SubstringCaseInsensitive,
    /// Fuzzy match (Levenshtein distance)
    Fuzzy,
}

impl MatchQuality {
    /// Convert match quality to confidence score (0.0-1.0)
    fn confidence(&self) -> f32 {
        match self {
            MatchQuality::Exact => 1.0,
            MatchQuality::CaseInsensitive => 0.95,
            MatchQuality::Substring => 0.85,
            MatchQuality::SubstringCaseInsensitive => 0.8,
            MatchQuality::Fuzzy => 0.6,
        }
    }
}

/// Calculate Levenshtein distance between two strings
///
/// Used for fuzzy matching when exact patterns don't match.
/// O(nm) time complexity, but strings are typically short.
fn levenshtein_distance(s1: &str, s2: &str) -> usize {
    let len1 = s1.chars().count();
    let len2 = s2.chars().count();

    if len1 == 0 {
        return len2;
    }
    if len2 == 0 {
        return len1;
    }

    let mut prev_row: Vec<usize> = (0..=len2).collect();
    let mut curr_row = vec![0; len2 + 1];

    for (i, c1) in s1.chars().enumerate() {
        curr_row[0] = i + 1;

        for (j, c2) in s2.chars().enumerate() {
            let cost = if c1 == c2 { 0 } else { 1 };
            curr_row[j + 1] = (curr_row[j] + 1)
                .min(prev_row[j + 1] + 1)
                .min(prev_row[j] + cost);
        }

        std::mem::swap(&mut prev_row, &mut curr_row);
    }

    prev_row[len2]
}

/// Match input against a pattern with quality scoring
fn match_pattern(input: &str, pattern: &str) -> Option<MatchQuality> {
    // Exact match
    if input == pattern {
        return Some(MatchQuality::Exact);
    }

    // Case-insensitive exact match
    if input.eq_ignore_ascii_case(pattern) {
        return Some(MatchQuality::CaseInsensitive);
    }

    // Substring match (input contains pattern)
    if input.contains(pattern) {
        return Some(MatchQuality::Substring);
    }

    // Case-insensitive substring match
    let input_lower = input.to_lowercase();
    let pattern_lower = pattern.to_lowercase();
    if input_lower.contains(&pattern_lower) {
        return Some(MatchQuality::SubstringCaseInsensitive);
    }

    // Fuzzy match (Levenshtein distance < 3)
    let distance = levenshtein_distance(&input_lower, &pattern_lower);
    let max_len = input.len().max(pattern.len());
    if max_len > 0 && distance <= 2 && (distance as f32 / max_len as f32) < 0.3 {
        return Some(MatchQuality::Fuzzy);
    }

    None
}

/// Detect architecture from target description string
///
/// Uses sophisticated pattern matching with confidence scoring.
/// Returns best match or Unknown with 0 confidence if no match found.
///
/// # Arguments
/// * `target_description` - Target string from GDB/BMP (e.g., "STM32F407VG")
///
/// # Returns
/// Architecture information with confidence score
///
/// # Example
/// ```
/// let info = detect_architecture("nRF52840");
/// assert_eq!(info.architecture, Architecture::ArmCortexM4);
/// assert_eq!(info.manufacturer, "Nordic Semiconductor");
/// assert!(info.confidence > 0.8);
/// ```
pub fn detect_architecture(target_description: &str) -> ArchitectureInfo {
    if target_description.trim().is_empty() {
        return ArchitectureInfo::default();
    }

    let mut best_match: Option<(ChipFamily, MatchQuality)> = None;
    let mut best_confidence = 0.0f32;

    // Scan all chip families for matches
    for family in CHIP_DATABASE.iter() {
        for pattern in family.patterns.iter() {
            if let Some(quality) = match_pattern(target_description, pattern) {
                let confidence = quality.confidence();

                // Prioritize exact matches and longer patterns
                let pattern_bonus = pattern.len() as f32 / 20.0; // Up to +0.5 bonus
                let adjusted_confidence = confidence + pattern_bonus.min(0.1);

                if adjusted_confidence > best_confidence {
                    best_confidence = adjusted_confidence;
                    best_match = Some((family.clone(), quality));
                }
            }
        }
    }

    if let Some((family, _quality)) = best_match {
        ArchitectureInfo {
            architecture: family.architecture,
            chip_name: family.family.to_string(),
            manufacturer: family.manufacturer.to_string(),
            supported: family.supported,
            confidence: best_confidence.min(1.0), // Cap at 1.0
            architecture_name: family.architecture.name().to_string(),
            isa_family: family.architecture.isa_family().to_string(),
        }
    } else {
        ArchitectureInfo::default()
    }
}

/// Get list of all supported chip families
pub fn get_supported_chips() -> Vec<ArchitectureInfo> {
    CHIP_DATABASE
        .iter()
        .filter(|chip| chip.supported)
        .map(|chip| ArchitectureInfo {
            architecture: chip.architecture,
            chip_name: chip.family.to_string(),
            manufacturer: chip.manufacturer.to_string(),
            supported: chip.supported,
            confidence: 1.0,
            architecture_name: chip.architecture.name().to_string(),
            isa_family: chip.architecture.isa_family().to_string(),
        })
        .collect()
}

/// Check if a specific architecture is supported
pub fn is_architecture_supported(architecture: Architecture) -> bool {
    architecture.is_supported()
}

// ============================================================================
// WASM Exports
// ============================================================================

/// Detect architecture from target description (WASM export)
///
/// JavaScript-compatible wrapper for detect_architecture().
///
/// # Arguments
/// * `target_description` - Target string from GDB/BMP
///
/// # Returns
/// JsValue containing ArchitectureInfo serialized to JavaScript object
///
/// # Example (JavaScript)
/// ```javascript
/// import { detect_architecture } from './battlemagic_analyzer';
///
/// const info = detect_architecture("STM32F407VG");
/// console.log(info.architecture); // "ArmCortexM4"
/// console.log(info.manufacturer); // "STMicroelectronics"
/// console.log(info.confidence);   // 0.95
/// ```
#[wasm_bindgen]
pub fn detect_architecture_wasm(target_description: &str) -> JsValue {
    let info = detect_architecture(target_description);
    serde_wasm_bindgen::to_value(&info).unwrap_or(JsValue::NULL)
}

/// Get list of all supported chips (WASM export)
///
/// Returns array of all chip families with working decoders.
///
/// # Returns
/// JsValue containing array of ArchitectureInfo objects
///
/// # Example (JavaScript)
/// ```javascript
/// import { get_supported_chips } from './battlemagic_analyzer';
///
/// const chips = get_supported_chips();
/// console.log(`Supported chips: ${chips.length}`);
/// chips.forEach(chip => {
///   console.log(`${chip.chipName} - ${chip.manufacturer}`);
/// });
/// ```
#[wasm_bindgen]
pub fn get_supported_chips_wasm() -> JsValue {
    let chips = get_supported_chips();
    serde_wasm_bindgen::to_value(&chips).unwrap_or(JsValue::NULL)
}

/// Check if architecture name is supported (WASM export)
///
/// Case-insensitive check against architecture names.
///
/// # Arguments
/// * `arch_name` - Architecture name (e.g., "ArmCortexM4", "MIPS32")
///
/// # Returns
/// true if architecture has a working decoder
///
/// # Example (JavaScript)
/// ```javascript
/// import { is_architecture_supported } from './battlemagic_analyzer';
///
/// console.log(is_architecture_supported("ArmCortexM4")); // true
/// console.log(is_architecture_supported("MIPS32"));      // false
/// ```
#[wasm_bindgen]
pub fn is_architecture_supported_wasm(arch_name: &str) -> bool {
    let arch_lower = arch_name.to_lowercase();

    // Try to match against all architecture variants
    for family in CHIP_DATABASE.iter() {
        if family.architecture.name().to_lowercase() == arch_lower {
            return family.architecture.is_supported();
        }
    }

    false
}

// ============================================================================
// Unit Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_exact_match() {
        let info = detect_architecture("STM32F4");
        assert_eq!(info.architecture, Architecture::ArmCortexM4);
        assert_eq!(info.manufacturer, "STMicroelectronics");
        assert!(info.confidence >= 0.95);
        assert!(info.supported);
    }

    #[test]
    fn test_case_insensitive_match() {
        let info = detect_architecture("stm32f407vg");
        assert_eq!(info.architecture, Architecture::ArmCortexM4);
        assert!(info.confidence >= 0.8);
    }

    #[test]
    fn test_substring_match() {
        let info = detect_architecture("STM32F407VGT6");
        assert_eq!(info.architecture, Architecture::ArmCortexM4);
        assert_eq!(info.chip_name, "STM32F4");
    }

    #[test]
    fn test_nordic_detection() {
        let info = detect_architecture("nRF52840");
        assert_eq!(info.architecture, Architecture::ArmCortexM4);
        assert_eq!(info.manufacturer, "Nordic Semiconductor");
        assert!(info.supported);
    }

    #[test]
    fn test_rp2040_detection() {
        let info = detect_architecture("RP2040");
        assert_eq!(info.architecture, Architecture::ArmCortexM0Plus);
        assert_eq!(info.manufacturer, "Raspberry Pi");
    }

    #[test]
    fn test_lpc_detection() {
        let info = detect_architecture("LPC1768");
        assert_eq!(info.architecture, Architecture::ArmCortexM3);
        assert_eq!(info.manufacturer, "NXP");
    }

    #[test]
    fn test_samd21_detection() {
        let info = detect_architecture("SAMD21G18");
        assert_eq!(info.architecture, Architecture::ArmCortexM0Plus);
        assert_eq!(info.manufacturer, "Microchip");
    }

    #[test]
    fn test_unsupported_chip() {
        let info = detect_architecture("PIC32MX");
        assert_eq!(info.architecture, Architecture::Mips32);
        assert!(!info.supported);
        assert_eq!(info.isa_family, "MIPS");
    }

    #[test]
    fn test_unknown_chip() {
        let info = detect_architecture("UnknownChip123");
        assert_eq!(info.architecture, Architecture::Unknown);
        assert_eq!(info.confidence, 0.0);
        assert!(!info.supported);
    }

    #[test]
    fn test_empty_input() {
        let info = detect_architecture("");
        assert_eq!(info.architecture, Architecture::Unknown);
        assert_eq!(info.confidence, 0.0);
    }

    #[test]
    fn test_ambiguous_input() {
        // "STM32" without family should still match something
        let info = detect_architecture("STM32");
        assert_eq!(info.manufacturer, "STMicroelectronics");
        assert!(info.confidence > 0.0);
    }

    #[test]
    fn test_fuzzy_match() {
        // Should match even with typos
        let info = detect_architecture("nRF528");
        assert_eq!(info.manufacturer, "Nordic Semiconductor");
    }

    #[test]
    fn test_get_supported_chips() {
        let chips = get_supported_chips();
        assert!(chips.len() > 30); // We have 30+ supported chips

        // All should be marked as supported
        for chip in chips.iter() {
            assert!(chip.supported);
        }
    }

    #[test]
    fn test_is_architecture_supported() {
        assert!(Architecture::ArmCortexM4.is_supported());
        assert!(Architecture::ArmCortexM0.is_supported());
        assert!(!Architecture::Mips32.is_supported());
        assert!(!Architecture::RiscV32.is_supported());
    }

    #[test]
    fn test_architecture_names() {
        assert_eq!(Architecture::ArmCortexM4.name(), "ARM Cortex-M4");
        assert_eq!(Architecture::ArmCortexM0Plus.name(), "ARM Cortex-M0+");
        assert_eq!(Architecture::RiscV32.name(), "RISC-V 32");
    }

    #[test]
    fn test_isa_family() {
        assert_eq!(Architecture::ArmCortexM4.isa_family(), "ARM");
        assert_eq!(Architecture::Mips32.isa_family(), "MIPS");
        assert_eq!(Architecture::RiscV32.isa_family(), "RISC-V");
    }

    #[test]
    fn test_levenshtein_distance() {
        assert_eq!(levenshtein_distance("kitten", "sitting"), 3);
        assert_eq!(levenshtein_distance("Saturday", "Sunday"), 3);
        assert_eq!(levenshtein_distance("", "test"), 4);
        assert_eq!(levenshtein_distance("test", "test"), 0);
    }

    #[test]
    fn test_pattern_matching() {
        assert_eq!(match_pattern("STM32F4", "STM32F4"), Some(MatchQuality::Exact));
        assert_eq!(
            match_pattern("stm32f4", "STM32F4"),
            Some(MatchQuality::CaseInsensitive)
        );
        assert_eq!(
            match_pattern("STM32F407VG", "STM32F4"),
            Some(MatchQuality::Substring)
        );
    }

    #[test]
    fn test_confidence_ordering() {
        // More specific patterns should have higher confidence
        let info1 = detect_architecture("STM32F407VGT6");
        let info2 = detect_architecture("STM32");

        assert!(info1.confidence >= info2.confidence);
    }

    #[test]
    fn test_real_world_targets() {
        // Test against real Black Magic Probe target descriptions
        let test_cases = vec![
            ("STM32F407VG", Architecture::ArmCortexM4, "STMicroelectronics"),
            ("STM32F103C8", Architecture::ArmCortexM3, "STMicroelectronics"),
            ("STM32L476RG", Architecture::ArmCortexM4, "STMicroelectronics"),
            ("nRF52840_xxAA", Architecture::ArmCortexM4, "Nordic Semiconductor"),
            ("SAMD21G18A", Architecture::ArmCortexM0Plus, "Microchip"),
            ("LPC1768FBD100", Architecture::ArmCortexM3, "NXP"),
        ];

        for (target, expected_arch, expected_mfg) in test_cases {
            let info = detect_architecture(target);
            assert_eq!(
                info.architecture, expected_arch,
                "Failed for target: {}",
                target
            );
            assert_eq!(
                info.manufacturer, expected_mfg,
                "Failed for target: {}",
                target
            );
            assert!(info.supported, "Failed for target: {}", target);
            assert!(info.confidence > 0.8, "Failed for target: {}", target);
        }
    }

    #[test]
    fn test_multiple_pattern_matching() {
        // nRF52 should match both "nRF52" and "nrf52" patterns
        let info1 = detect_architecture("nRF52");
        let info2 = detect_architecture("NRF52");
        let info3 = detect_architecture("nrf52");

        assert_eq!(info1.chip_name, "nRF52832");
        assert_eq!(info2.chip_name, "nRF52832");
        assert_eq!(info3.chip_name, "nRF52832");
    }

    #[test]
    fn test_specific_variant_precedence() {
        // Specific variants should be detected over generic families
        let info = detect_architecture("nRF52840");
        assert_eq!(info.chip_name, "nRF52840"); // Not "nRF52832"
    }
}
