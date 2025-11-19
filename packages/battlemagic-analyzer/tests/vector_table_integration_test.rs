//! Comprehensive integration tests for ARM Cortex-M Vector Table Detection
//!
//! These tests verify that vector table detection works correctly with:
//! - Realistic ARM Cortex-M firmware patterns
//! - Various MCU configurations (STM32, nRF52, etc.)
//! - Edge cases and error conditions
//! - Architecture-specific behavior (ARM-only, not MIPS)

use battlemagic_analyzer::analysis::vector_table::VectorTableDetector;
use battlemagic_analyzer::analyzer::BinaryAnalyzer;
use battlemagic_analyzer::arch::arm::ArmArchitecture;

// ============================================================================
// Realistic Firmware Test Fixtures
// ============================================================================

/// Create realistic STM32F103C8T6 firmware (Blue Pill)
///
/// This simulates a real STM32F103 vector table with:
/// - 20KB RAM starting at 0x20000000
/// - Flash starting at 0x08000000
/// - Standard Cortex-M3 + STM32-specific IRQs
fn create_stm32f103_firmware() -> Vec<u8> {
    let mut firmware = vec![0xFFu8; 2048];

    // Vector 0: Initial SP = 0x20005000 (end of 20KB RAM)
    firmware[0..4].copy_from_slice(&0x20005000u32.to_le_bytes());

    // Vector 1: Reset_Handler = 0x080000C1 (Thumb mode)
    firmware[4..8].copy_from_slice(&0x080000C1u32.to_le_bytes());

    // Vector 2: NMI_Handler = 0x080001D1
    firmware[8..12].copy_from_slice(&0x080001D1u32.to_le_bytes());

    // Vector 3: HardFault_Handler = 0x080001D9
    firmware[12..16].copy_from_slice(&0x080001D9u32.to_le_bytes());

    // Vector 4: MemManage_Handler = 0x080001E1
    firmware[16..20].copy_from_slice(&0x080001E1u32.to_le_bytes());

    // Vector 5: BusFault_Handler = 0x080001E9
    firmware[20..24].copy_from_slice(&0x080001E9u32.to_le_bytes());

    // Vector 6: UsageFault_Handler = 0x080001F1
    firmware[24..28].copy_from_slice(&0x080001F1u32.to_le_bytes());

    // Vectors 7-10: Reserved (0x00000000)
    firmware[28..44].fill(0x00);

    // Vector 11: SVC_Handler = 0x080001F9
    firmware[44..48].copy_from_slice(&0x080001F9u32.to_le_bytes());

    // Vector 12: DebugMon_Handler = 0x08000201
    firmware[48..52].copy_from_slice(&0x08000201u32.to_le_bytes());

    // Vector 13: Reserved
    firmware[52..56].fill(0x00);

    // Vector 14: PendSV_Handler = 0x08000209
    firmware[56..60].copy_from_slice(&0x08000209u32.to_le_bytes());

    // Vector 15: SysTick_Handler = 0x08000211
    firmware[60..64].copy_from_slice(&0x08000211u32.to_le_bytes());

    // Vectors 16-30: STM32-specific IRQs (WWDG, PVD, TAMPER, etc.)
    for i in 16..31 {
        let offset = i * 4;
        let handler_addr = 0x08000220 + ((i - 16) as u32 * 8) + 1; // Thumb bit set
        firmware[offset..offset + 4].copy_from_slice(&handler_addr.to_le_bytes());
    }

    firmware
}

/// Create realistic nRF52832 firmware (Nordic BLE SoC)
///
/// nRF52832 characteristics:
/// - 64KB RAM at 0x20000000
/// - Flash at 0x00000000 (aliased to 0x00000000, not 0x08000000)
/// - Cortex-M4F with many peripheral interrupts
fn create_nrf52_firmware() -> Vec<u8> {
    let mut firmware = vec![0xFFu8; 4096];

    // Vector 0: Initial SP = 0x20010000 (end of 64KB RAM)
    firmware[0..4].copy_from_slice(&0x20010000u32.to_le_bytes());

    // Vector 1: Reset_Handler = 0x00000F01 (Thumb)
    firmware[4..8].copy_from_slice(&0x00000F01u32.to_le_bytes());

    // Vector 2-15: Standard Cortex-M handlers
    firmware[8..12].copy_from_slice(&0x00000F11u32.to_le_bytes());   // NMI
    firmware[12..16].copy_from_slice(&0x00000F19u32.to_le_bytes());  // HardFault
    firmware[16..20].copy_from_slice(&0x00000F21u32.to_le_bytes());  // MemManage
    firmware[20..24].copy_from_slice(&0x00000F29u32.to_le_bytes());  // BusFault
    firmware[24..28].copy_from_slice(&0x00000F31u32.to_le_bytes());  // UsageFault
    firmware[28..44].fill(0x00);                                      // Reserved
    firmware[44..48].copy_from_slice(&0x00000F39u32.to_le_bytes());  // SVCall
    firmware[48..52].copy_from_slice(&0x00000F41u32.to_le_bytes());  // DebugMon
    firmware[52..56].fill(0x00);                                      // Reserved
    firmware[56..60].copy_from_slice(&0x00000F49u32.to_le_bytes());  // PendSV
    firmware[60..64].copy_from_slice(&0x00000F51u32.to_le_bytes());  // SysTick

    // Vectors 16+: nRF52-specific IRQs (POWER, CLOCK, RADIO, etc.)
    // nRF52832 has 38 external interrupts
    for i in 16..54 {
        let offset = i * 4;
        let handler_addr = 0x00001000 + ((i - 16) as u32 * 16) + 1;
        firmware[offset..offset + 4].copy_from_slice(&handler_addr.to_le_bytes());
    }

    firmware
}

/// Create firmware with invalid/corrupted vector table
fn create_corrupted_firmware() -> Vec<u8> {
    let mut firmware = vec![0xFFu8; 1024];

    // Vector 0: Valid SP
    firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes());

    // Vector 1: INVALID - missing Thumb bit (0x08000100 even address)
    firmware[4..8].copy_from_slice(&0x08000100u32.to_le_bytes());

    // Vector 2: Valid (within 1024 byte firmware)
    firmware[8..12].copy_from_slice(&0x08000201u32.to_le_bytes());

    // Vector 3: INVALID - out of bounds (0x09000001, firmware only 1024 bytes)
    firmware[12..16].copy_from_slice(&0x09000001u32.to_le_bytes());

    // Vector 4: INVALID - 0x00000000
    firmware[16..20].fill(0x00);

    // Vector 5: INVALID - 0xFFFFFFFF (unprogrammed flash)
    // Already filled with 0xFF

    firmware
}

/// Create minimal valid firmware (just SP + Reset)
fn create_minimal_firmware() -> Vec<u8> {
    let mut firmware = vec![0xFFu8; 256];

    // Vector 0: Initial SP
    firmware[0..4].copy_from_slice(&0x20001000u32.to_le_bytes());

    // Vector 1: Reset_Handler
    firmware[4..8].copy_from_slice(&0x08000081u32.to_le_bytes());

    firmware
}

// ============================================================================
// Test: Vector Table Detection at Address 0x0
// ============================================================================

#[test]
fn test_detect_vector_table_at_address_zero() {
    let firmware = create_stm32f103_firmware();
    let base_addr = 0x08000000;

    let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

    // Should extract vector table starting at offset 0
    assert!(!entries.is_empty(), "Should detect vector table at start of firmware");

    // First entry should be at vector 0
    assert_eq!(entries[0].vector_number, 0);
    assert_eq!(entries[0].handler_name, "Initial_SP");
}

#[test]
fn test_vector_table_requires_minimum_size() {
    // Test with firmware too small (< 8 bytes)
    let tiny_firmware = vec![0u8; 4];
    let entries = VectorTableDetector::detect_vector_table(&tiny_firmware, 0x08000000);

    assert_eq!(entries.len(), 0, "Should return empty vector for firmware < 8 bytes");

    // Test with exactly 8 bytes (minimum: SP + Reset)
    let minimal = vec![
        0x00, 0x20, 0x00, 0x20,  // SP = 0x20002000
        0x01, 0x00, 0x00, 0x08,  // Reset = 0x08000001
    ];
    let entries = VectorTableDetector::detect_vector_table(&minimal, 0x08000000);

    assert_eq!(entries.len(), 2, "Should accept firmware with exactly 8 bytes");
    assert!(entries[0].is_valid);
    assert!(entries[1].is_valid);
}

// ============================================================================
// Test: Little-Endian Parsing
// ============================================================================

#[test]
fn test_little_endian_parsing() {
    let mut firmware = vec![0u8; 64];

    // Vector 0: 0x20005000 in little-endian
    firmware[0] = 0x00;
    firmware[1] = 0x50;
    firmware[2] = 0x00;
    firmware[3] = 0x20;

    // Vector 1: 0x080001C1 in little-endian
    firmware[4] = 0xC1;
    firmware[5] = 0x01;
    firmware[6] = 0x00;
    firmware[7] = 0x08;

    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);

    assert_eq!(entries[0].handler_address, 0x20005000, "Should parse little-endian SP correctly");
    assert_eq!(entries[1].handler_address, 0x080001C0, "Should parse little-endian Reset address (Thumb bit cleared)");
}

// ============================================================================
// Test: Reset_Handler as Entry Point
// ============================================================================

#[test]
fn test_reset_handler_is_entry_point() {
    let firmware = create_stm32f103_firmware();
    let base_addr = 0x08000000;

    let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

    // Vector 1 should be Reset_Handler
    let reset_handler = &entries[1];
    assert_eq!(reset_handler.vector_number, 1);
    assert_eq!(reset_handler.handler_name, "Reset_Handler");
    assert!(reset_handler.is_valid);
    assert_eq!(reset_handler.handler_address, 0x080000C0); // 0x080000C1 with Thumb bit cleared
}

#[test]
fn test_get_handler_symbols_includes_reset() {
    let firmware = create_stm32f103_firmware();
    let base_addr = 0x08000000;

    let symbols = VectorTableDetector::get_handler_symbols(&firmware, base_addr);

    // Should include Reset_Handler
    let reset_symbol = symbols.iter()
        .find(|(_, name)| name == "Reset_Handler");

    assert!(reset_symbol.is_some(), "Should include Reset_Handler in symbols");

    let (addr, name) = reset_symbol.unwrap();
    assert_eq!(*name, "Reset_Handler");
    assert_eq!(*addr, 0x080000C0); // Thumb bit cleared
}

#[test]
fn test_handler_symbols_excludes_initial_sp() {
    let firmware = create_stm32f103_firmware();
    let base_addr = 0x08000000;

    let symbols = VectorTableDetector::get_handler_symbols(&firmware, base_addr);

    // Should NOT include Initial_SP (vector 0)
    let has_sp = symbols.iter()
        .any(|(_, name)| name == "Initial_SP");

    assert!(!has_sp, "Handler symbols should not include Initial_SP");
}

// ============================================================================
// Test: Invalid Vector Handling
// ============================================================================

#[test]
fn test_invalid_vector_zero_address() {
    let mut firmware = vec![0xFFu8; 64];

    firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes()); // Valid SP
    firmware[4..8].fill(0x00); // Invalid Reset_Handler = 0x00000000

    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);

    assert!(entries[0].is_valid, "Vector 0 (SP) should be valid");
    assert!(!entries[1].is_valid, "Vector 1 with address 0x00000000 should be invalid");
}

#[test]
fn test_invalid_vector_unprogrammed_flash() {
    let mut firmware = vec![0xFFu8; 64];

    firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes()); // Valid SP
    // Vector 1 remains 0xFFFFFFFF (unprogrammed flash)

    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);

    assert!(entries[0].is_valid, "Vector 0 (SP) should be valid");
    assert!(!entries[1].is_valid, "Vector 1 with 0xFFFFFFFF should be invalid");
}

#[test]
fn test_invalid_vector_missing_thumb_bit() {
    let mut firmware = vec![0xFFu8; 64];

    firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes()); // Valid SP
    firmware[4..8].copy_from_slice(&0x08000100u32.to_le_bytes());  // Even address (no Thumb bit)

    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);

    assert!(entries[0].is_valid, "Vector 0 (SP) should be valid");
    assert!(!entries[1].is_valid, "Vector without Thumb bit should be invalid");
}

#[test]
fn test_invalid_vector_out_of_bounds_high() {
    let mut firmware = vec![0xFFu8; 64];

    firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes()); // Valid SP
    firmware[4..8].copy_from_slice(&0x09000001u32.to_le_bytes());  // Address beyond firmware

    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);

    assert!(!entries[1].is_valid, "Vector pointing beyond firmware should be invalid");
}

#[test]
fn test_invalid_vector_out_of_bounds_low() {
    let mut firmware = vec![0xFFu8; 64];

    firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes()); // Valid SP
    firmware[4..8].copy_from_slice(&0x07000001u32.to_le_bytes());  // Address before firmware start

    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);

    assert!(!entries[1].is_valid, "Vector pointing before firmware should be invalid");
}

#[test]
fn test_corrupted_firmware_mixed_valid_invalid() {
    let firmware = create_corrupted_firmware();
    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);

    // Check specific validity patterns
    assert!(entries[0].is_valid, "Vector 0 (SP) should be valid");
    assert!(!entries[1].is_valid, "Vector 1 (missing Thumb bit) should be invalid");
    assert!(entries[2].is_valid, "Vector 2 should be valid");
    assert!(!entries[3].is_valid, "Vector 3 (out of bounds) should be invalid");
    assert!(!entries[4].is_valid, "Vector 4 (0x00000000) should be invalid");

    // Verify we can filter to only valid entries
    let valid_only = VectorTableDetector::detect_valid_vectors(&firmware, 0x08000000);
    assert_eq!(valid_only.len(), 2, "Should have exactly 2 valid vectors (0 and 2)");
}

// ============================================================================
// Test: Reserved Vectors
// ============================================================================

#[test]
fn test_reserved_vectors_marked_correctly() {
    let firmware = create_stm32f103_firmware();
    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);

    // Vectors 7-10 should be marked as "Reserved" and invalid (we set them to 0x00)
    for i in 7..=10 {
        assert_eq!(entries[i].handler_name, "Reserved", "Vector {} should be named 'Reserved'", i);
        assert!(!entries[i].is_valid, "Vector {} should be invalid (reserved)", i);
    }

    // Vector 13 should also be reserved
    assert_eq!(entries[13].handler_name, "Reserved");
}

// ============================================================================
// Test: Standard Handler Names
// ============================================================================

#[test]
fn test_standard_cortex_m_handler_names() {
    let firmware = create_stm32f103_firmware();
    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);

    assert_eq!(entries[0].handler_name, "Initial_SP");
    assert_eq!(entries[1].handler_name, "Reset_Handler");
    assert_eq!(entries[2].handler_name, "NMI_Handler");
    assert_eq!(entries[3].handler_name, "HardFault_Handler");
    assert_eq!(entries[4].handler_name, "MemManage_Handler");
    assert_eq!(entries[5].handler_name, "BusFault_Handler");
    assert_eq!(entries[6].handler_name, "UsageFault_Handler");
    assert_eq!(entries[11].handler_name, "SVC_Handler");
    assert_eq!(entries[14].handler_name, "PendSV_Handler");
    assert_eq!(entries[15].handler_name, "SysTick_Handler");
}

#[test]
fn test_irq_handler_naming() {
    let firmware = create_stm32f103_firmware();
    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);

    // Vectors 16+ should be named "IRQHandler"
    for i in 16..30 {
        assert_eq!(entries[i].handler_name, "IRQHandler",
                   "Vector {} should be named 'IRQHandler'", i);
    }
}

// ============================================================================
// Test: Thumb Bit Clearing
// ============================================================================

#[test]
fn test_thumb_bit_cleared_in_addresses() {
    let mut firmware = vec![0xFFu8; 64];

    firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes()); // SP (no Thumb bit)
    firmware[4..8].copy_from_slice(&0x08000101u32.to_le_bytes());  // Reset with Thumb bit
    firmware[8..12].copy_from_slice(&0x08000203u32.to_le_bytes()); // NMI with Thumb bit

    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);

    // Vector 0 (SP) should preserve the exact value (no Thumb bit to clear)
    assert_eq!(entries[0].handler_address, 0x20002000);

    // Vectors 1+ should have Thumb bit (bit 0) cleared
    assert_eq!(entries[1].handler_address, 0x08000100, "Thumb bit should be cleared from 0x08000101");
    assert_eq!(entries[2].handler_address, 0x08000202, "Thumb bit should be cleared from 0x08000203");
}

// ============================================================================
// Test: Different Base Addresses
// ============================================================================

#[test]
fn test_stm32_base_address_0x08000000() {
    let firmware = create_stm32f103_firmware();
    let base_addr = 0x08000000;

    let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

    assert!(entries[1].is_valid);
    assert!(entries[1].handler_address >= base_addr);
    assert!(entries[1].handler_address < base_addr + firmware.len() as u32);
}

#[test]
fn test_nrf52_base_address_0x00000000() {
    let firmware = create_nrf52_firmware();
    let base_addr = 0x00000000;

    let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

    // Verify SP points to RAM
    assert_eq!(entries[0].handler_address, 0x20010000);
    assert!(entries[0].is_valid);

    // Verify Reset handler is within firmware bounds
    assert!(entries[1].is_valid);
    assert!(entries[1].handler_address >= base_addr);
    assert!(entries[1].handler_address < base_addr + firmware.len() as u32);
}

#[test]
fn test_alternate_flash_base_0x00000000_stm32() {
    // Some STM32s can remap flash to 0x00000000 via BOOT pins
    let mut firmware = vec![0xFFu8; 512];

    firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes());
    firmware[4..8].copy_from_slice(&0x00000101u32.to_le_bytes());  // Reset at 0x00000101

    let base_addr = 0x00000000;
    let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

    assert!(entries[1].is_valid, "Should accept handlers at base 0x00000000");
    assert_eq!(entries[1].handler_address, 0x00000100);
}

// ============================================================================
// Test: Stack Pointer Validation
// ============================================================================

#[test]
fn test_valid_stack_pointer_ram_range() {
    let mut firmware = vec![0xFFu8; 64];

    // Typical STM32 RAM addresses
    let valid_sp_values: Vec<u32> = vec![
        0x20000000, // Start of RAM
        0x20005000, // Middle of RAM
        0x20010000, // Larger RAM
        0x20020000, // Even larger RAM
    ];

    for sp in valid_sp_values {
        firmware[0..4].copy_from_slice(&sp.to_le_bytes());
        firmware[4..8].copy_from_slice(&0x08000101u32.to_le_bytes());

        let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);
        assert!(entries[0].is_valid, "SP value 0x{:08X} should be valid", sp);
    }
}

#[test]
fn test_invalid_stack_pointer_values() {
    let mut firmware = vec![0xFFu8; 64];

    firmware[4..8].copy_from_slice(&0x08000101u32.to_le_bytes()); // Valid Reset

    // Test 0x00000000 SP
    firmware[0..4].fill(0x00);
    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);
    assert!(!entries[0].is_valid, "SP = 0x00000000 should be invalid");

    // Test 0xFFFFFFFF SP
    firmware[0..4].fill(0xFF);
    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);
    assert!(!entries[0].is_valid, "SP = 0xFFFFFFFF should be invalid");
}

// ============================================================================
// Test: Boot Memory Aliasing (STM32-style)
// ============================================================================

#[test]
fn test_boot_memory_aliasing_stm32() {
    // Test the common STM32 scenario:
    // - Physical flash at 0x08000000
    // - Firmware dumped from 0x08000000 (contains 0x0800XXXX addresses)
    // - Analyzed at base=0x00000000 (boot alias)

    let mut firmware = vec![0xFFu8; 1024];

    // Vector 0: Initial SP = 0x20005000 (RAM)
    firmware[0..4].copy_from_slice(&0x20005000u32.to_le_bytes());

    // Vector 1: Reset_Handler = 0x080000C1 (PHYSICAL flash address with Thumb bit)
    firmware[4..8].copy_from_slice(&0x080000C1u32.to_le_bytes());

    // Vector 2: NMI_Handler = 0x080001D1
    firmware[8..12].copy_from_slice(&0x080001D1u32.to_le_bytes());

    // Vector 3: HardFault_Handler = 0x080001D9
    firmware[12..16].copy_from_slice(&0x080001D9u32.to_le_bytes());

    // Analyze with boot alias base address (0x00000000)
    let base_addr = 0x00000000;
    let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

    assert!(!entries.is_empty(), "Should detect vector table even with aliased addressing");

    // Vector 0 (SP) should be valid
    assert_eq!(entries[0].vector_number, 0);
    assert!(entries[0].is_valid, "Initial SP should be valid");
    assert_eq!(entries[0].handler_address, 0x20005000);

    // Vector 1 (Reset) should be valid despite pointing to 0x08000000 range
    assert_eq!(entries[1].vector_number, 1);
    assert!(entries[1].is_valid, "Reset handler should be valid with boot aliasing");
    assert_eq!(entries[1].handler_address, 0x080000C0, "Should clear Thumb bit");

    // Vector 2 (NMI) should be valid
    assert_eq!(entries[2].vector_number, 2);
    assert!(entries[2].is_valid, "NMI handler should be valid with boot aliasing");

    // Vector 3 (HardFault) should be valid
    assert_eq!(entries[3].vector_number, 3);
    assert!(entries[3].is_valid, "HardFault handler should be valid with boot aliasing");
}

#[test]
fn test_boot_aliasing_rejects_out_of_bounds() {
    // Verify that boot aliasing validation still rejects truly out-of-bounds addresses
    let mut firmware = vec![0xFFu8; 1024];

    // Vector 0: Valid SP
    firmware[0..4].copy_from_slice(&0x20005000u32.to_le_bytes());

    // Vector 1: Valid Reset within firmware bounds (0x080000C1)
    firmware[4..8].copy_from_slice(&0x080000C1u32.to_le_bytes());

    // Vector 2: INVALID - beyond firmware size (0x08001001 = offset 0x1001, but firmware only 1024 bytes)
    firmware[8..12].copy_from_slice(&0x08001001u32.to_le_bytes());

    let base_addr = 0x00000000;
    let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

    assert!(entries[0].is_valid, "SP should be valid");
    assert!(entries[1].is_valid, "Reset within bounds should be valid");
    assert!(!entries[2].is_valid, "Handler beyond firmware size should be invalid");
}

// ============================================================================
// Test: Architecture-Specific Behavior (ARM-only)
// ============================================================================

#[test]
fn test_vector_table_is_arm_specific_feature() {
    // Vector table detection is ARM Cortex-M specific
    // MIPS firmware should NOT trigger vector table detection

    // This is a conceptual test - in practice, vector table detection
    // is called explicitly for ARM firmware, not MIPS firmware.
    // The VectorTableDetector is in the analysis module, not arch-specific.

    // MIPS firmware bytes (big-endian, different instruction encoding)
    let mips_firmware = vec![
        0x27, 0xbd, 0xff, 0xe0,  // addiu sp, sp, -32
        0xaf, 0xbf, 0x00, 0x1c,  // sw ra, 28(sp)
        0x0c, 0x10, 0x00, 0x00,  // jal 0x401000
        0x8f, 0xbf, 0x00, 0x1c,  // lw ra, 28(sp)
    ];

    // If we try to detect vector table from MIPS firmware, it should fail
    // because the byte patterns won't match ARM vector table structure
    let entries = VectorTableDetector::detect_vector_table(&mips_firmware, 0x400000);

    // MIPS firmware interpreted as ARM will likely have invalid entries
    // The SP value from MIPS bytes would be: 0xE0FFBD27 (not in valid RAM range)
    if !entries.is_empty() {
        // Count valid entries - MIPS firmware typically won't produce many valid ARM vectors
        let valid_count = entries.iter().filter(|e| e.is_valid).count();
        assert!(valid_count <= 1,
                "MIPS firmware should not produce multiple valid ARM vector entries, got {}",
                valid_count);
    }
}

#[test]
fn test_mips_bytes_dont_look_like_vector_table() {
    // Real MIPS firmware won't have the pattern of ARM vector tables
    // MIPS uses jump tables at fixed addresses, not interrupt vectors at 0x0

    let mips_firmware = vec![
        // MIPS boot vector at 0xBFC00000 (not 0x0)
        0x3c, 0x08, 0xbf, 0xc0,  // lui t0, 0xbfc0
        0x35, 0x08, 0x00, 0x00,  // ori t0, t0, 0x0000
        0x01, 0x00, 0x00, 0x08,  // j 0x400000
        0x00, 0x00, 0x00, 0x00,  // nop (delay slot)
    ];

    let entries = VectorTableDetector::detect_vector_table(&mips_firmware, 0xBFC00000);

    // Even if we try to parse MIPS as ARM vector table:
    // - The "SP" would be 0xC0BF083C (not valid RAM - less than 0x20000000)
    // - The "Reset" would be 0x00000835 (odd bit, but likely out of range)

    if !entries.is_empty() && entries.len() >= 2 {
        // The patterns shouldn't produce many valid ARM vectors
        let valid_count = entries.iter().filter(|e| e.is_valid).count();
        assert!(valid_count <= 1,
                "MIPS firmware should not produce multiple valid ARM vector entries, got {}",
                valid_count);
    }
}

// ============================================================================
// Test: Integration with BinaryAnalyzer
// ============================================================================

#[test]
fn test_vector_table_integration_with_analyzer() {
    // Test that vector table detection can be used alongside binary analysis
    let firmware = create_stm32f103_firmware();
    let base_addr = 0x08000000;

    // Create analyzer
    let _analyzer = BinaryAnalyzer::new(ArmArchitecture, base_addr);

    // Detect vector table (analyzer doesn't do this automatically, but user code can)
    let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

    // Verify we can extract handler addresses for symbol creation
    let symbols = VectorTableDetector::get_handler_symbols(&firmware, base_addr);

    assert!(!entries.is_empty());
    assert!(!symbols.is_empty());

    // All symbol addresses should be analyzable
    for (addr, _name) in &symbols {
        assert!(*addr >= base_addr);
        assert!(*addr < base_addr + firmware.len() as u32);
    }
}

#[test]
fn test_vector_table_provides_entry_point() {
    // Common workflow: extract Reset_Handler as entry point for analysis
    let firmware = create_stm32f103_firmware();
    let base_addr = 0x08000000;

    let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

    // Find Reset_Handler (vector 1)
    let reset = entries.iter()
        .find(|e| e.handler_name == "Reset_Handler")
        .expect("Should find Reset_Handler");

    assert!(reset.is_valid);

    // This address would be used as entry_point for analysis
    let entry_point = reset.handler_address;

    // Verify it's a valid code address (within firmware, Thumb aligned)
    assert!(entry_point >= base_addr);
    assert!(entry_point < base_addr + firmware.len() as u32);
    assert_eq!(entry_point & 1, 0, "Entry point should have Thumb bit cleared for analysis");
}

// ============================================================================
// Test: Real-World Firmware Patterns
// ============================================================================

#[test]
fn test_stm32f103_realistic_pattern() {
    let firmware = create_stm32f103_firmware();
    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);

    // STM32F103C8T6 has:
    // - 16 Cortex-M3 system exceptions
    // - Up to 60 device-specific interrupts
    assert!(entries.len() >= 16, "Should parse at least system exceptions");

    // Verify key handlers are valid
    assert!(entries[0].is_valid, "Initial_SP should be valid");
    assert!(entries[1].is_valid, "Reset_Handler should be valid");
    assert!(entries[3].is_valid, "HardFault_Handler should be valid");
    assert!(entries[15].is_valid, "SysTick_Handler should be valid");

    // Reserved vectors should be invalid
    assert!(!entries[7].is_valid, "Reserved vector 7 should be invalid");
}

#[test]
fn test_nrf52_realistic_pattern() {
    let firmware = create_nrf52_firmware();
    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x00000000);

    // nRF52832 has 38 external interrupts + 16 system exceptions
    assert!(entries.len() >= 54, "Should parse nRF52 vector table (54+ entries)");

    // Verify SP points to 64KB RAM end
    assert_eq!(entries[0].handler_address, 0x20010000);

    // Verify handlers are at base 0x00000000
    assert!(entries[1].handler_address < 0x01000000,
            "nRF52 handlers should be in low address range");
}

#[test]
fn test_minimal_firmware_pattern() {
    let firmware = create_minimal_firmware();
    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);

    // Should successfully parse even minimal firmware
    assert!(entries.len() >= 2);
    assert!(entries[0].is_valid);
    assert!(entries[1].is_valid);
}

// ============================================================================
// Test: Maximum Vector Table Size
// ============================================================================

#[test]
fn test_maximum_vector_table_entries() {
    // Create very large firmware with 256 vector entries (1024 bytes)
    let mut firmware = vec![0xFFu8; 2048];

    // Vector 0: SP
    firmware[0..4].copy_from_slice(&0x20010000u32.to_le_bytes());

    // Vectors 1-255: Valid handlers
    for i in 1..256 {
        let offset = i * 4;
        let handler_addr = 0x08000400 + (i as u32 * 4) + 1; // Within 2KB firmware
        firmware[offset..offset + 4].copy_from_slice(&handler_addr.to_le_bytes());
    }

    let base_addr = 0x08000000;
    let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

    // Should cap at 256 entries (MAX_VECTOR_ENTRIES)
    assert_eq!(entries.len(), 256, "Should cap at 256 vector entries");

    // Most should be valid (except reserved ones)
    let valid_count = entries.iter().filter(|e| e.is_valid).count();
    assert!(valid_count >= 250, "Most entries should be valid");
}

// ============================================================================
// Test: Edge Cases
// ============================================================================

#[test]
fn test_firmware_not_multiple_of_4() {
    // Firmware size not aligned to 4 bytes
    let mut firmware = vec![0xFFu8; 67]; // 67 bytes = 16 full entries + 3 extra bytes

    firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes());
    firmware[4..8].copy_from_slice(&0x08000101u32.to_le_bytes());

    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);

    // Should parse 16 complete 4-byte entries, ignore the 3 extra bytes
    assert_eq!(entries.len(), 16, "Should parse only complete 4-byte entries");
}

#[test]
fn test_all_valid_vectors() {
    // Create firmware where ALL vectors are valid (need larger firmware to fit all handlers)
    // 512 bytes = 128 entries, giving us enough space for all handler addresses
    let mut firmware = vec![0xFFu8; 512];

    // Vector 0: Valid SP
    firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes());

    // Vectors 1-63: All valid, within bounds (512 byte firmware = 0x08000000 to 0x08000200)
    // Place all handlers in the middle of the firmware to ensure they're within bounds
    for i in 1..64 {
        let offset = i * 4;
        // Place handlers in middle section (0x08000100-0x08000180) - well within 512 byte range
        let handler_addr = 0x08000100 + (i as u32 * 2) + 1; // Thumb bit set, spaced by 2 bytes
        firmware[offset..offset + 4].copy_from_slice(&handler_addr.to_le_bytes());
    }

    let entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);
    let valid_count = entries.iter().filter(|e| e.is_valid).count();

    // Should have 128 entries total (512 bytes / 4), first 64 should all be valid
    assert_eq!(entries.len(), 128);
    assert!(valid_count >= 64, "At least first 64 entries should be valid, got {}", valid_count);

    // Check that first 64 entries are all valid
    for i in 0..64 {
        assert!(entries[i].is_valid, "Entry {} should be valid", i);
    }
}

#[test]
fn test_all_invalid_vectors_except_sp() {
    // Create firmware where only SP is valid
    let mut firmware = vec![0x00u8; 128]; // All zeros except SP

    firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes());

    let _entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);
    let valid_entries = VectorTableDetector::detect_valid_vectors(&firmware, 0x08000000);

    // Only vector 0 (SP) should be valid
    assert_eq!(valid_entries.len(), 1, "Only SP should be valid");
    assert_eq!(valid_entries[0].vector_number, 0);
}

// ============================================================================
// Test: VectorTableEntry Default Names
// ============================================================================

#[test]
fn test_vector_entry_default_names() {
    use battlemagic_analyzer::database::VectorTableEntry;

    assert_eq!(VectorTableEntry::default_name(0), "Initial_SP");
    assert_eq!(VectorTableEntry::default_name(1), "Reset_Handler");
    assert_eq!(VectorTableEntry::default_name(2), "NMI_Handler");
    assert_eq!(VectorTableEntry::default_name(3), "HardFault_Handler");
    assert_eq!(VectorTableEntry::default_name(4), "MemManage_Handler");
    assert_eq!(VectorTableEntry::default_name(5), "BusFault_Handler");
    assert_eq!(VectorTableEntry::default_name(6), "UsageFault_Handler");
    assert_eq!(VectorTableEntry::default_name(11), "SVC_Handler");
    assert_eq!(VectorTableEntry::default_name(14), "PendSV_Handler");
    assert_eq!(VectorTableEntry::default_name(15), "SysTick_Handler");
    assert_eq!(VectorTableEntry::default_name(16), "IRQHandler");
    assert_eq!(VectorTableEntry::default_name(100), "IRQHandler");

    // Reserved vectors
    assert_eq!(VectorTableEntry::default_name(7), "Reserved");
    assert_eq!(VectorTableEntry::default_name(8), "Reserved");
    assert_eq!(VectorTableEntry::default_name(9), "Reserved");
    assert_eq!(VectorTableEntry::default_name(10), "Reserved");
    assert_eq!(VectorTableEntry::default_name(13), "Reserved");
}

// ============================================================================
// Test: Performance
// ============================================================================

#[test]
fn test_performance_large_firmware() {
    use std::time::Instant;

    // Create 64KB firmware (typical flash size for small MCU)
    let mut firmware = vec![0xFFu8; 65536];

    // Setup valid vector table
    firmware[0..4].copy_from_slice(&0x20010000u32.to_le_bytes());
    for i in 1..256 {
        let offset = i * 4;
        let handler_addr = 0x08001000 + (i as u32 * 16) + 1;
        firmware[offset..offset + 4].copy_from_slice(&handler_addr.to_le_bytes());
    }

    let start = Instant::now();
    let _entries = VectorTableDetector::detect_vector_table(&firmware, 0x08000000);
    let elapsed = start.elapsed();

    println!("Parsed {} vector entries from 64KB firmware in {:?}",
             _entries.len(), elapsed);

    // Should parse 256 entries (cap)
    assert_eq!(_entries.len(), 256);

    // Should be very fast (< 1ms)
    assert!(elapsed.as_millis() < 10, "Vector table parsing should be fast");
}
