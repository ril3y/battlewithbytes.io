//! ARM Cortex-M Vector Table Detection
//!
//! This module provides automatic detection and parsing of ARM Cortex-M vector tables.
//! The vector table is a critical data structure that defines interrupt handlers and
//! the initial stack pointer for the microcontroller.
//!
//! # ARM Cortex-M Vector Table Structure
//!
//! The vector table begins at the flash base address (typically 0x08000000 or 0x00000000)
//! and consists of 32-bit entries in little-endian format:
//!
//! | Offset | Vector # | Handler Name          | Description                    |
//! |--------|----------|-----------------------|--------------------------------|
//! | 0x00   | 0        | Initial_SP            | Initial stack pointer value    |
//! | 0x04   | 1        | Reset_Handler         | Reset handler (entry point)    |
//! | 0x08   | 2        | NMI_Handler           | Non-maskable interrupt         |
//! | 0x0C   | 3        | HardFault_Handler     | Hard fault handler             |
//! | 0x10   | 4        | MemManage_Handler     | Memory management fault        |
//! | 0x14   | 5        | BusFault_Handler      | Bus fault handler              |
//! | 0x18   | 6        | UsageFault_Handler    | Usage fault handler            |
//! | 0x1C-0x28 | 7-10  | Reserved              | Reserved (should be 0)         |
//! | 0x2C   | 11       | SVC_Handler           | Supervisor call handler        |
//! | 0x30   | 12       | DebugMon_Handler      | Debug monitor handler          |
//! | 0x34   | 13       | Reserved              | Reserved                       |
//! | 0x38   | 14       | PendSV_Handler        | PendSV handler                 |
//! | 0x3C   | 15       | SysTick_Handler       | SysTick timer handler          |
//! | 0x40+  | 16+      | IRQHandler_N          | External interrupt handlers    |
//!
//! # Address Validation
//!
//! Each handler address must satisfy these criteria to be considered valid:
//! - Non-zero and not 0xFFFFFFFF (unprogrammed flash)
//! - Bit 0 must be set (Thumb mode indicator)
//! - Address with Thumb bit cleared must be within firmware bounds
//!
//! # Example Usage
//!
//! ```rust
//! use battlemagic_analyzer::analysis::vector_table::VectorTableDetector;
//!
//! let firmware = &[0x00, 0x20, 0x00, 0x20,  // Initial SP = 0x20002000
//!                  0x09, 0x00, 0x00, 0x08,  // Reset_Handler = 0x08000009 (Thumb)
//!                  0x11, 0x00, 0x00, 0x08]; // NMI_Handler = 0x08000011
//!
//! let entries = VectorTableDetector::detect_vector_table(firmware, 0x08000000);
//! assert_eq!(entries[1].handler_name, "Reset_Handler");
//! assert_eq!(entries[1].handler_address, 0x08000008); // Thumb bit cleared
//! ```

use crate::database::VectorTableEntry;

/// Maximum number of vector table entries to extract
///
/// Standard Cortex-M vector tables have 16 system exceptions + device-specific IRQs.
/// We limit to 256 total entries (240 IRQs) which covers even heavily-featured MCUs.
const MAX_VECTOR_ENTRIES: usize = 256;

/// Minimum number of vectors required for a valid table
///
/// At minimum we need: Initial SP (0) and Reset_Handler (1)
const MIN_VECTOR_ENTRIES: usize = 2;

/// Vector table detector for ARM Cortex-M firmware
pub struct VectorTableDetector;

impl VectorTableDetector {
    /// Detect and parse ARM Cortex-M vector table from firmware bytes
    ///
    /// This function extracts the interrupt vector table from firmware, validates
    /// each entry, and returns a vector of parsed entries with metadata.
    ///
    /// # Arguments
    /// * `firmware_bytes` - Raw firmware binary data
    /// * `base_address` - Flash base address where firmware is loaded (e.g., 0x08000000)
    ///
    /// # Returns
    /// Vector of `VectorTableEntry` structures, one per valid or invalid entry found.
    /// Entries are marked as `is_valid: false` if they don't meet validation criteria.
    ///
    /// # Algorithm
    /// 1. Read 32-bit little-endian values from firmware start
    /// 2. For each entry, check if it's a valid Thumb function pointer
    /// 3. Validate address is within firmware bounds
    /// 4. Create entry with appropriate handler name
    ///
    /// # Example
    /// ```rust
    /// use battlemagic_analyzer::analysis::vector_table::VectorTableDetector;
    ///
    /// let firmware = vec![0u8; 1024];
    /// let base_addr = 0x08000000;
    /// let table = VectorTableDetector::detect_vector_table(&firmware, base_addr);
    ///
    /// for entry in &table {
    ///     if entry.is_valid {
    ///         println!("{}: 0x{:08X}", entry.handler_name, entry.handler_address);
    ///     }
    /// }
    /// ```
    pub fn detect_vector_table(
        firmware_bytes: &[u8],
        base_address: u32,
    ) -> Vec<VectorTableEntry> {
        let mut entries = Vec::new();

        // Need at least 8 bytes for initial SP + Reset_Handler
        if firmware_bytes.len() < MIN_VECTOR_ENTRIES * 4 {
            return entries;
        }

        // Calculate firmware address range for validation
        let firmware_start = base_address;
        let firmware_end = base_address + firmware_bytes.len() as u32;

        // Extract vector table entries
        let max_entries = std::cmp::min(
            firmware_bytes.len() / 4,
            MAX_VECTOR_ENTRIES,
        );

        let mut consecutive_invalid = 0;
        const MAX_CONSECUTIVE_INVALID: usize = 4; // Stop after 4 consecutive invalid entries

        for vector_num in 0..max_entries {
            let offset = vector_num * 4;

            // Read 32-bit little-endian value
            let raw_value = u32::from_le_bytes([
                firmware_bytes[offset],
                firmware_bytes[offset + 1],
                firmware_bytes[offset + 2],
                firmware_bytes[offset + 3],
            ]);

            // Validate the entry
            let is_valid = Self::validate_vector_entry(
                vector_num as u32,
                raw_value,
                firmware_start,
                firmware_end,
            );

            // Track consecutive invalid entries (but skip reserved vectors 7-10, 13)
            let is_reserved = (vector_num >= 7 && vector_num <= 10) || vector_num == 13;
            if !is_valid && !is_reserved {
                consecutive_invalid += 1;
            } else {
                consecutive_invalid = 0;
            }

            // Stop if we hit too many consecutive invalid entries
            // This indicates we've reached the end of the vector table
            if consecutive_invalid >= MAX_CONSECUTIVE_INVALID && vector_num >= 16 {
                break;
            }

            // For vector 0 (initial SP), store the raw value
            // For all others, clear the Thumb bit (bit 0)
            let handler_address = if vector_num == 0 {
                raw_value
            } else {
                raw_value & !1
            };

            // Create entry manually to use our validation result
            let handler_name = VectorTableEntry::default_name(vector_num as u32).to_string();
            entries.push(VectorTableEntry {
                vector_number: vector_num as u32,
                handler_address,
                handler_name,
                is_valid,
            });
        }

        entries
    }

    /// Validate a vector table entry
    ///
    /// # Arguments
    /// * `vector_num` - Vector number (0 = SP, 1 = Reset, etc.)
    /// * `raw_value` - Raw 32-bit value from vector table
    /// * `firmware_start` - Start address of firmware
    /// * `firmware_end` - End address of firmware
    ///
    /// # Returns
    /// `true` if entry is valid, `false` otherwise
    ///
    /// # Validation Rules
    /// - Vector 0 (Initial SP): Must be non-zero and not 0xFFFFFFFF, should point to RAM
    /// - Other vectors: Must have Thumb bit set, non-zero, not 0xFFFFFFFF, within firmware bounds
    fn validate_vector_entry(
        vector_num: u32,
        raw_value: u32,
        firmware_start: u32,
        firmware_end: u32,
    ) -> bool {
        // Check for unprogrammed flash or zero
        if raw_value == 0 || raw_value == 0xFFFFFFFF {
            return false;
        }

        // Vector 0 is the initial stack pointer, not a code address
        if vector_num == 0 {
            // Stack pointer should be in RAM range (typically 0x20000000 or higher)
            // For STM32, RAM typically starts at 0x20000000
            // We accept any value that looks like a valid 32-bit address
            return raw_value >= 0x20000000 || raw_value < firmware_start;
        }

        // For code vectors, check Thumb bit (bit 0 must be set)
        if (raw_value & 1) == 0 {
            return false;
        }

        // Clear Thumb bit for address validation
        let handler_addr = raw_value & !1;

        // Check if address is within firmware bounds
        // IMPORTANT: Handle boot memory aliasing for STM32 and similar chips.
        // When firmware is dumped from physical flash (0x08000000) but analyzed
        // at boot alias (0x00000000), vector table entries will still contain
        // physical addresses (0x0800XXXX). We need to accept both:
        // 1. Direct match: handler_addr in [firmware_start, firmware_end)
        // 2. Aliased match: handler_addr in typical STM32 flash range (0x08000000-0x08100000)
        //    when firmware_start is 0x00000000
        let in_direct_range = handler_addr >= firmware_start && handler_addr < firmware_end;

        // Check for STM32-style aliasing: base=0x0 but handler points to 0x0800XXXX
        let stm32_flash_base = 0x08000000;
        let stm32_flash_end = stm32_flash_base + 0x00100000; // Up to 1MB flash
        let in_aliased_range = firmware_start == 0x00000000
            && handler_addr >= stm32_flash_base
            && handler_addr < stm32_flash_end
            && (handler_addr - stm32_flash_base) < (firmware_end - firmware_start);

        if !in_direct_range && !in_aliased_range {
            return false;
        }

        true
    }

    /// Extract only valid vector table entries
    ///
    /// Convenience method that filters out invalid entries from the full table.
    ///
    /// # Arguments
    /// * `firmware_bytes` - Raw firmware binary data
    /// * `base_address` - Flash base address
    ///
    /// # Returns
    /// Vector containing only entries where `is_valid == true`
    pub fn detect_valid_vectors(
        firmware_bytes: &[u8],
        base_address: u32,
    ) -> Vec<VectorTableEntry> {
        Self::detect_vector_table(firmware_bytes, base_address)
            .into_iter()
            .filter(|entry| entry.is_valid)
            .collect()
    }

    /// Get handler addresses for automatic symbol creation
    ///
    /// Returns a vector of (address, name) tuples for all valid non-SP handlers.
    /// This is useful for automatically creating symbols in the disassembler.
    ///
    /// # Arguments
    /// * `firmware_bytes` - Raw firmware binary data
    /// * `base_address` - Flash base address
    ///
    /// # Returns
    /// Vector of (handler_address, handler_name) tuples, excluding vector 0 (Initial_SP)
    pub fn get_handler_symbols(
        firmware_bytes: &[u8],
        base_address: u32,
    ) -> Vec<(u32, String)> {
        Self::detect_valid_vectors(firmware_bytes, base_address)
            .into_iter()
            .filter(|entry| entry.vector_number != 0) // Skip Initial_SP
            .map(|entry| (entry.handler_address, entry.handler_name.clone()))
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Create test firmware with valid vector table
    fn create_test_firmware() -> Vec<u8> {
        let mut firmware = vec![0xFFu8; 1024];

        // Vector 0: Initial SP = 0x20002000 (STM32 typical stack)
        firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes());

        // Vector 1: Reset_Handler = 0x08000101 (Thumb bit set)
        firmware[4..8].copy_from_slice(&0x08000101u32.to_le_bytes());

        // Vector 2: NMI_Handler = 0x08000201
        firmware[8..12].copy_from_slice(&0x08000201u32.to_le_bytes());

        // Vector 3: HardFault_Handler = 0x08000301
        firmware[12..16].copy_from_slice(&0x08000301u32.to_le_bytes());

        // Vector 4-6: Other fault handlers
        firmware[16..20].copy_from_slice(&0x08000401u32.to_le_bytes());
        firmware[20..24].copy_from_slice(&0x08000501u32.to_le_bytes());
        firmware[24..28].copy_from_slice(&0x08000601u32.to_le_bytes());

        // Vector 7-10: Reserved (0x00000000)
        firmware[28..44].fill(0x00);

        // Vector 11: SVC_Handler = 0x08000B01
        firmware[44..48].copy_from_slice(&0x08000B01u32.to_le_bytes());

        // Vector 14: PendSV_Handler = 0x08000E01
        firmware[56..60].copy_from_slice(&0x08000E01u32.to_le_bytes());

        // Vector 15: SysTick_Handler = 0x08000F01
        firmware[60..64].copy_from_slice(&0x08000F01u32.to_le_bytes());

        // Vector 16+: External IRQs
        firmware[64..68].copy_from_slice(&0x08001001u32.to_le_bytes()); // IRQ0
        firmware[68..72].copy_from_slice(&0x08001101u32.to_le_bytes()); // IRQ1

        firmware
    }

    #[test]
    fn test_detect_vector_table_basic() {
        let firmware = create_test_firmware();
        let base_addr = 0x08000000;

        let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

        // Should have extracted many entries
        assert!(entries.len() >= 18);

        // Check vector 0 (Initial SP)
        assert_eq!(entries[0].vector_number, 0);
        assert_eq!(entries[0].handler_address, 0x20002000);
        assert_eq!(entries[0].handler_name, "Initial_SP");
        assert!(entries[0].is_valid);

        // Check vector 1 (Reset_Handler)
        assert_eq!(entries[1].vector_number, 1);
        assert_eq!(entries[1].handler_address, 0x08000100); // Thumb bit cleared
        assert_eq!(entries[1].handler_name, "Reset_Handler");
        assert!(entries[1].is_valid);

        // Check vector 3 (HardFault_Handler)
        assert_eq!(entries[3].vector_number, 3);
        assert_eq!(entries[3].handler_address, 0x08000300);
        assert_eq!(entries[3].handler_name, "HardFault_Handler");
        assert!(entries[3].is_valid);
    }

    #[test]
    fn test_detect_vector_table_invalid_entries() {
        let firmware = create_test_firmware();
        let base_addr = 0x08000000;

        let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

        // Reserved vectors (7-10) should be invalid (we set them to 0x00)
        assert!(!entries[7].is_valid);
        assert!(!entries[8].is_valid);
        assert!(!entries[9].is_valid);
        assert!(!entries[10].is_valid);
    }

    #[test]
    fn test_detect_vector_table_thumb_bit_validation() {
        let mut firmware = vec![0xFFu8; 64];

        // Vector 0: Valid SP
        firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes());

        // Vector 1: Invalid - missing Thumb bit (even address, within bounds)
        firmware[4..8].copy_from_slice(&0x08000020u32.to_le_bytes());

        // Vector 2: Valid - has Thumb bit and within bounds
        firmware[8..12].copy_from_slice(&0x08000021u32.to_le_bytes());

        let base_addr = 0x08000000;
        let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

        assert!(entries[0].is_valid); // Initial SP - valid
        assert!(!entries[1].is_valid); // Missing Thumb bit - invalid
        assert!(entries[2].is_valid); // Has Thumb bit - valid
    }

    #[test]
    fn test_detect_vector_table_address_bounds() {
        let mut firmware = vec![0xFFu8; 64];

        // Vector 0: Valid SP
        firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes());

        // Vector 1: Valid - within bounds
        firmware[4..8].copy_from_slice(&0x08000021u32.to_le_bytes());

        // Vector 2: Invalid - outside firmware range (address too high)
        firmware[8..12].copy_from_slice(&0x09000001u32.to_le_bytes());

        // Vector 3: Invalid - outside firmware range (address too low)
        firmware[12..16].copy_from_slice(&0x07000001u32.to_le_bytes());

        let base_addr = 0x08000000;
        let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

        assert!(entries[0].is_valid); // Initial SP
        assert!(entries[1].is_valid); // Within bounds
        assert!(!entries[2].is_valid); // Address too high
        assert!(!entries[3].is_valid); // Address too low
    }

    #[test]
    fn test_detect_vector_table_unprogrammed_flash() {
        let mut firmware = vec![0xFFu8; 64];

        // Vector 0: Valid SP
        firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes());

        // Vector 1: Valid - handler at start of firmware (within 64 byte bounds)
        firmware[4..8].copy_from_slice(&0x08000021u32.to_le_bytes());

        // Vector 2: 0xFFFFFFFF (unprogrammed flash) - should be invalid
        // Already filled with 0xFF

        // Vector 3: 0x00000000 - should be invalid
        firmware[12..16].fill(0x00);

        let base_addr = 0x08000000;
        let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

        assert!(entries[0].is_valid);
        assert!(entries[1].is_valid);
        assert!(!entries[2].is_valid); // 0xFFFFFFFF
        assert!(!entries[3].is_valid); // 0x00000000
    }

    #[test]
    fn test_detect_valid_vectors_only() {
        let firmware = create_test_firmware();
        let base_addr = 0x08000000;

        let valid_entries = VectorTableDetector::detect_valid_vectors(&firmware, base_addr);

        // Should only contain valid entries
        assert!(valid_entries.iter().all(|e| e.is_valid));

        // Should have fewer entries than full table (reserved vectors excluded)
        let all_entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);
        assert!(valid_entries.len() < all_entries.len());
    }

    #[test]
    fn test_get_handler_symbols() {
        let firmware = create_test_firmware();
        let base_addr = 0x08000000;

        let symbols = VectorTableDetector::get_handler_symbols(&firmware, base_addr);

        // Should not include vector 0 (Initial_SP)
        assert!(!symbols.iter().any(|(_, name)| name == "Initial_SP"));

        // Should include Reset_Handler
        assert!(symbols.iter().any(|(addr, name)| {
            *addr == 0x08000100 && name == "Reset_Handler"
        }));

        // Should include HardFault_Handler
        assert!(symbols.iter().any(|(addr, name)| {
            *addr == 0x08000300 && name == "HardFault_Handler"
        }));

        // All symbols should have valid addresses
        for (addr, _) in &symbols {
            assert!(*addr >= base_addr);
            assert!(*addr < base_addr + firmware.len() as u32);
        }
    }

    #[test]
    fn test_empty_firmware() {
        let firmware: Vec<u8> = vec![];
        let base_addr = 0x08000000;

        let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);
        assert_eq!(entries.len(), 0);
    }

    #[test]
    fn test_minimal_firmware() {
        let mut firmware = vec![0u8; 256];  // Larger firmware to contain handler addresses

        // Just Initial SP and Reset_Handler
        firmware[0..4].copy_from_slice(&0x20002000u32.to_le_bytes());
        // Handler at 0x08000020 (within 256-byte firmware)
        firmware[4..8].copy_from_slice(&0x08000021u32.to_le_bytes());

        let base_addr = 0x08000000;
        let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

        assert_eq!(entries.len(), 64);  // 256 bytes / 4 bytes per entry
        assert!(entries[0].is_valid);
        assert!(entries[1].is_valid);
        assert_eq!(entries[1].handler_address, 0x08000020);
    }

    #[test]
    fn test_real_world_stm32_pattern() {
        // Simulate real STM32F103 vector table pattern
        let mut firmware = vec![0xFFu8; 512];

        // Initial SP at end of RAM (STM32F103C8 has 20KB RAM)
        firmware[0..4].copy_from_slice(&0x20005000u32.to_le_bytes());

        // Reset handler pointing to startup code (within firmware bounds)
        firmware[4..8].copy_from_slice(&0x08000101u32.to_le_bytes());

        // NMI, HardFault handlers (within firmware bounds)
        firmware[8..12].copy_from_slice(&0x08000111u32.to_le_bytes());
        firmware[12..16].copy_from_slice(&0x08000121u32.to_le_bytes());

        // Some reserved vectors = 0
        firmware[28..44].fill(0x00);

        // SysTick handler (within 512 byte firmware = 0x08000000 to 0x08000200)
        firmware[60..64].copy_from_slice(&0x08000131u32.to_le_bytes());

        // External interrupts (within bounds)
        for i in 16..32 {  // Reduced to ensure addresses stay in range
            let offset = 64 + (i - 16) * 4;
            let handler_addr = 0x08000140 + (i as u32 * 2) + 1; // Thumb bit set, within 512 bytes
            firmware[offset..offset + 4].copy_from_slice(&handler_addr.to_le_bytes());
        }

        let base_addr = 0x08000000;
        let entries = VectorTableDetector::detect_vector_table(&firmware, base_addr);

        // Verify key handlers
        assert!(entries[0].is_valid);
        assert_eq!(entries[0].handler_address, 0x20005000);

        assert!(entries[1].is_valid);
        assert_eq!(entries[1].handler_address, 0x08000100);
        assert_eq!(entries[1].handler_name, "Reset_Handler");

        assert!(entries[15].is_valid); // SysTick
        assert_eq!(entries[15].handler_name, "SysTick_Handler");
    }
}
