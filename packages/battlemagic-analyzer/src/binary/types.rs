use serde::{Deserialize, Serialize};

/// Supported processor architectures
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Architecture {
    ARM,
    MIPS,
    RISCV,
    X86,
    AVR,
    PIC,
    UNKNOWN,
}

impl Architecture {
    /// Convert architecture to string representation
    pub fn as_str(&self) -> &'static str {
        match self {
            Architecture::ARM => "ARM",
            Architecture::MIPS => "MIPS",
            Architecture::RISCV => "RISCV",
            Architecture::X86 => "X86",
            Architecture::AVR => "AVR",
            Architecture::PIC => "PIC",
            Architecture::UNKNOWN => "UNKNOWN",
        }
    }
}

/// Binary file formats
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BinaryFormat {
    RAW,
    ELF,
    PE,
    AXF,
    COFF,
    MACHO,
    SREC,
    HEX,
}

impl BinaryFormat {
    pub fn as_str(&self) -> &'static str {
        match self {
            BinaryFormat::RAW => "RAW",
            BinaryFormat::ELF => "ELF",
            BinaryFormat::PE => "PE",
            BinaryFormat::AXF => "AXF",
            BinaryFormat::COFF => "COFF",
            BinaryFormat::MACHO => "MACHO",
            BinaryFormat::SREC => "SREC",
            BinaryFormat::HEX => "HEX",
        }
    }
}

/// Architecture detection result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionResult {
    /// Detected architecture
    pub architecture: Architecture,

    /// Confidence score (0.0 to 1.0)
    pub confidence: f32,

    /// Detected binary format
    pub format: BinaryFormat,

    /// Detection hints (reasons for the decision)
    pub hints: Vec<String>,
}

impl DetectionResult {
    /// Create a new detection result
    pub fn new(architecture: Architecture, confidence: f32, format: BinaryFormat) -> Self {
        Self {
            architecture,
            confidence,
            format,
            hints: Vec::new(),
        }
    }

    /// Add a detection hint
    pub fn add_hint(&mut self, hint: String) {
        self.hints.push(hint);
    }
}

/// ELF machine types (e_machine field)
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u16)]
pub enum ElfMachine {
    None = 0,
    ARM = 40,
    AArch64 = 183,
    MIPS = 8,
    RISCV = 243,
    I386 = 3,
    X86_64 = 62,
    AVR = 83,
    PIC = 204,
}

impl ElfMachine {
    /// Convert from raw u16 value
    pub fn from_u16(value: u16) -> Option<Self> {
        match value {
            0 => Some(ElfMachine::None),
            40 => Some(ElfMachine::ARM),
            183 => Some(ElfMachine::AArch64),
            8 => Some(ElfMachine::MIPS),
            243 => Some(ElfMachine::RISCV),
            3 => Some(ElfMachine::I386),
            62 => Some(ElfMachine::X86_64),
            83 => Some(ElfMachine::AVR),
            204 => Some(ElfMachine::PIC),
            _ => None,
        }
    }

    /// Convert to architecture
    pub fn to_architecture(&self) -> Architecture {
        match self {
            ElfMachine::ARM | ElfMachine::AArch64 => Architecture::ARM,
            ElfMachine::MIPS => Architecture::MIPS,
            ElfMachine::RISCV => Architecture::RISCV,
            ElfMachine::I386 | ElfMachine::X86_64 => Architecture::X86,
            ElfMachine::AVR => Architecture::AVR,
            ElfMachine::PIC => Architecture::PIC,
            ElfMachine::None => Architecture::UNKNOWN,
        }
    }
}
