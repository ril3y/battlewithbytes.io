//! Chip Detection Example
//!
//! This example demonstrates the chip database API with various
//! target descriptions and shows confidence scoring.

use battlemagic_analyzer::chips::{
    detect_architecture, get_supported_chips, is_architecture_supported, Architecture,
};

fn main() {
    println!("BattleMagic Chip Database Example\n");
    println!("==================================\n");

    // Example 1: Exact match
    println!("Example 1: Exact Match");
    println!("----------------------");
    let info = detect_architecture("STM32F4");
    print_detection_result("STM32F4", &info);

    // Example 2: Full part number
    println!("\nExample 2: Full Part Number");
    println!("---------------------------");
    let info = detect_architecture("STM32F407VGT6");
    print_detection_result("STM32F407VGT6", &info);

    // Example 3: Case-insensitive
    println!("\nExample 3: Case-Insensitive");
    println!("---------------------------");
    let info = detect_architecture("nrf52840");
    print_detection_result("nrf52840", &info);

    // Example 4: Nordic variants
    println!("\nExample 4: Nordic Variants");
    println!("-------------------------");
    for target in &["nRF52832", "nRF52840", "nRF51822"] {
        let info = detect_architecture(target);
        println!(
            "{:12} → {} ({})",
            target, info.chip_name, info.architecture_name
        );
    }

    // Example 5: Microchip SAM
    println!("\nExample 5: Microchip SAM Family");
    println!("-------------------------------");
    for target in &["SAMD21G18A", "SAMD51", "SAME54"] {
        let info = detect_architecture(target);
        println!(
            "{:12} → {} - {} (conf: {:.2})",
            target, info.chip_name, info.architecture_name, info.confidence
        );
    }

    // Example 6: NXP LPC variants
    println!("\nExample 6: NXP LPC Family");
    println!("------------------------");
    for target in &["LPC1768", "LPC4088", "LPC11U24"] {
        let info = detect_architecture(target);
        println!(
            "{:12} → {} - {} ({})",
            target, info.chip_name, info.architecture_name, info.manufacturer
        );
    }

    // Example 7: Unsupported architectures
    println!("\nExample 7: Future/Unsupported Architectures");
    println!("-------------------------------------------");
    for target in &["PIC32MX", "ESP32-C3", "GD32VF103"] {
        let info = detect_architecture(target);
        println!(
            "{:12} → {} - {} (supported: {})",
            target, info.chip_name, info.isa_family, info.supported
        );
    }

    // Example 8: Unknown chip
    println!("\nExample 8: Unknown Chip");
    println!("----------------------");
    let info = detect_architecture("UnknownChip123");
    print_detection_result("UnknownChip123", &info);

    // Example 9: Ambiguous input
    println!("\nExample 9: Ambiguous Input");
    println!("-------------------------");
    let info = detect_architecture("STM32");
    println!("Input: 'STM32' (no specific family)");
    println!("  Best match: {}", info.chip_name);
    println!("  Confidence: {:.2} ({})", info.confidence, confidence_level(info.confidence));

    // Example 10: Fuzzy matching
    println!("\nExample 10: Fuzzy Matching (with typos)");
    println!("---------------------------------------");
    for target in &["nRF528", "STM32F40", "SAMD2"] {
        let info = detect_architecture(target);
        if info.confidence > 0.0 {
            println!(
                "{:12} → {} (fuzzy match, conf: {:.2})",
                target, info.chip_name, info.confidence
            );
        } else {
            println!("{:12} → No match", target);
        }
    }

    // Example 11: List all supported chips
    println!("\nExample 11: Supported Chips Summary");
    println!("-----------------------------------");
    let chips = get_supported_chips();
    println!("Total supported chip families: {}", chips.len());

    // Group by manufacturer
    let mut by_manufacturer: std::collections::HashMap<String, Vec<String>> =
        std::collections::HashMap::new();

    for chip in chips.iter() {
        by_manufacturer
            .entry(chip.manufacturer.clone())
            .or_insert_with(Vec::new)
            .push(chip.chip_name.clone());
    }

    println!("\nBy Manufacturer:");
    for (mfg, mut chip_list) in by_manufacturer {
        chip_list.sort();
        println!("  {} ({}):", mfg, chip_list.len());
        for chip in chip_list.chunks(5) {
            println!("    {}", chip.join(", "));
        }
    }

    // Example 12: Architecture support check
    println!("\nExample 12: Architecture Support Check");
    println!("--------------------------------------");
    let architectures = vec![
        Architecture::ArmCortexM4,
        Architecture::ArmCortexM0Plus,
        Architecture::Mips32,
        Architecture::RiscV32,
    ];

    for arch in architectures {
        let supported = is_architecture_supported(arch);
        println!(
            "{:20} → {}",
            arch.name(),
            if supported {
                "✓ Decoder available"
            } else {
                "✗ Not yet implemented"
            }
        );
    }

    // Example 13: Real-world BMP target descriptions
    println!("\nExample 13: Real Black Magic Probe Output");
    println!("-----------------------------------------");
    let bmp_targets = vec![
        "STM32F407VG",
        "STM32F103C8T6",
        "STM32L476RG",
        "nRF52840_xxAA",
        "ATSAMD21G18A",
        "LPC1768FBD100",
    ];

    for target in bmp_targets {
        let info = detect_architecture(target);
        println!("\nTarget: {}", target);
        println!("  Chip Family:   {}", info.chip_name);
        println!("  Manufacturer:  {}", info.manufacturer);
        println!("  Architecture:  {}", info.architecture_name);
        println!("  ISA Family:    {}", info.isa_family);
        println!("  Supported:     {}", if info.supported { "Yes" } else { "No" });
        println!(
            "  Confidence:    {:.0}% ({})",
            info.confidence * 100.0,
            confidence_level(info.confidence)
        );
    }

    // Example 14: Confidence scoring demonstration
    println!("\nExample 14: Confidence Levels");
    println!("----------------------------");
    println!("Target                    | Confidence | Level");
    println!("------------------------- | ---------- | --------");

    let test_cases = vec![
        ("STM32F4", "Exact match"),
        ("stm32f4", "Case-insensitive"),
        ("STM32F407VG", "Substring match"),
        ("stm32f407vg", "Substring case-insensitive"),
        ("nRF528", "Fuzzy match"),
        ("UnknownChip", "No match"),
    ];

    for (target, expected) in test_cases {
        let info = detect_architecture(target);
        println!(
            "{:25} | {:>6.0}%    | {} ({})",
            target,
            info.confidence * 100.0,
            confidence_level(info.confidence),
            expected
        );
    }
}

/// Helper function to print detection results
fn print_detection_result(input: &str, info: &battlemagic_analyzer::chips::ArchitectureInfo) {
    println!("Input: '{}'", input);
    println!("  Chip Name:     {}", info.chip_name);
    println!("  Manufacturer:  {}", info.manufacturer);
    println!("  Architecture:  {} ({})", info.architecture_name, info.isa_family);
    println!("  Supported:     {}", if info.supported { "Yes" } else { "No" });
    println!(
        "  Confidence:    {:.2} ({})",
        info.confidence,
        confidence_level(info.confidence)
    );
}

/// Helper function to categorize confidence levels
fn confidence_level(conf: f32) -> &'static str {
    if conf >= 1.0 {
        "Perfect"
    } else if conf >= 0.95 {
        "Excellent"
    } else if conf >= 0.85 {
        "Good"
    } else if conf >= 0.70 {
        "Fair"
    } else if conf > 0.0 {
        "Weak"
    } else {
        "None"
    }
}
