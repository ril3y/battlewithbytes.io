/// ELF header parsing for architecture detection
///
/// This module provides efficient ELF header parsing to extract architecture
/// information directly from ELF binaries.

use super::types::{Architecture, ElfMachine};

const ELF_MAGIC: &[u8] = &[0x7F, 0x45, 0x4C, 0x46]; // "\x7FELF"

/// Check if data starts with ELF magic number
#[inline]
pub fn is_elf(data: &[u8]) -> bool {
    data.len() >= 4 && &data[0..4] == ELF_MAGIC
}

/// Detect architecture from ELF header
///
/// Reads the e_machine field from ELF header to determine architecture.
/// Returns Architecture::UNKNOWN if not a valid ELF file or unsupported machine type.
pub fn detect_elf_architecture(data: &[u8]) -> Architecture {
    if !is_elf(data) || data.len() < 20 {
        return Architecture::UNKNOWN;
    }

    // Read EI_DATA (offset 5) to determine endianness
    // 1 = little endian, 2 = big endian
    let is_little_endian = data[5] == 1;

    // Read e_machine field at offset 0x12 (2 bytes)
    if data.len() < 0x14 {
        return Architecture::UNKNOWN;
    }

    let machine_value = if is_little_endian {
        u16::from_le_bytes([data[0x12], data[0x13]])
    } else {
        u16::from_be_bytes([data[0x12], data[0x13]])
    };

    // Convert to ElfMachine enum and then to Architecture
    ElfMachine::from_u16(machine_value)
        .map(|m| m.to_architecture())
        .unwrap_or(Architecture::UNKNOWN)
}

/// Detect architecture from PE (Portable Executable) header
///
/// Checks for MZ header and attempts to parse machine type.
/// Currently simplified - returns UNKNOWN as PE is less common in embedded.
pub fn detect_pe_architecture(data: &[u8]) -> Architecture {
    // Check for MZ header
    if data.len() < 2 || data[0] != 0x4D || data[1] != 0x5A {
        return Architecture::UNKNOWN;
    }

    // PE header parsing would go here
    // For now, return UNKNOWN as PE is primarily x86/x64 and less relevant for embedded
    Architecture::UNKNOWN
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_elf() {
        let elf_header = vec![0x7F, 0x45, 0x4C, 0x46, 0x01, 0x01];
        assert!(is_elf(&elf_header));

        let not_elf = vec![0x00, 0x00, 0x00, 0x00];
        assert!(!is_elf(&not_elf));

        let too_short = vec![0x7F, 0x45];
        assert!(!is_elf(&too_short));
    }

    #[test]
    fn test_detect_elf_arm() {
        // Minimal ELF header for ARM (little endian)
        let mut data = vec![0u8; 0x14];
        data[0..4].copy_from_slice(&[0x7F, 0x45, 0x4C, 0x46]); // ELF magic
        data[5] = 1; // Little endian
        data[0x12] = 40; // EM_ARM (little endian)
        data[0x13] = 0;

        assert_eq!(detect_elf_architecture(&data), Architecture::ARM);
    }

    #[test]
    fn test_detect_elf_riscv() {
        // Minimal ELF header for RISC-V (little endian)
        let mut data = vec![0u8; 0x14];
        data[0..4].copy_from_slice(&[0x7F, 0x45, 0x4C, 0x46]);
        data[5] = 1; // Little endian
        data[0x12] = 243; // EM_RISCV (little endian)
        data[0x13] = 0;

        assert_eq!(detect_elf_architecture(&data), Architecture::RISCV);
    }

    #[test]
    fn test_detect_elf_mips_big_endian() {
        // Minimal ELF header for MIPS (big endian)
        let mut data = vec![0u8; 0x14];
        data[0..4].copy_from_slice(&[0x7F, 0x45, 0x4C, 0x46]);
        data[5] = 2; // Big endian
        data[0x12] = 0; // EM_MIPS (big endian)
        data[0x13] = 8;

        assert_eq!(detect_elf_architecture(&data), Architecture::MIPS);
    }
}
