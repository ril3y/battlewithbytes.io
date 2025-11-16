use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Type of cross-reference
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum XrefType {
    /// Function call - bl, blx
    Call,
    /// Unconditional branch - b
    Branch,
    /// Conditional branch - b.eq, b.ne, etc.
    ConditionalBranch,
    /// Data read reference - ldr
    DataRead,
    /// Data write reference - str
    DataWrite,
}

/// Represents a single cross-reference between two addresses
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrossReference {
    /// Address where the reference originates
    pub from_addr: u32,

    /// Address being referenced (target)
    pub to_addr: u32,

    /// Type of cross-reference
    pub xref_type: XrefType,

    /// The instruction that creates this reference
    pub instruction: String,

    /// Disassembled operands for context
    pub operands: String,
}

impl CrossReference {
    pub fn new(from_addr: u32, to_addr: u32, xref_type: XrefType, instruction: String, operands: String) -> Self {
        Self {
            from_addr,
            to_addr,
            xref_type,
            instruction,
            operands,
        }
    }
}

/// Loop type classification
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum LoopType {
    /// While loop (pre-test)
    While,
    /// Do-while loop (post-test)
    DoWhile,
    /// For loop (counter-based)
    For,
    /// Infinite loop
    Infinite,
}

/// Detected loop structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Loop {
    /// Address of the loop header (entry point)
    pub header_addr: u32,

    /// Address of the back edge (instruction that branches back)
    pub back_edge_addr: u32,

    /// All addresses in the loop body
    pub body_addrs: Vec<u32>,

    /// Loop type classification
    pub loop_type: LoopType,

    /// Nesting depth (1 = outermost)
    pub nesting_level: u32,
}

impl Loop {
    pub fn new(
        header_addr: u32,
        back_edge_addr: u32,
        body_addrs: Vec<u32>,
        loop_type: LoopType,
        nesting_level: u32,
    ) -> Self {
        Self {
            header_addr,
            back_edge_addr,
            body_addrs,
            loop_type,
            nesting_level,
        }
    }
}

/// Complete analysis results returned to JavaScript
#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisResults {
    /// All cross-references found in the binary
    pub xrefs: Vec<CrossReference>,

    /// Detected loops in the code
    pub loops: Vec<Loop>,

    /// Detected functions with complete analysis
    pub functions: Vec<FunctionInfo>,

    /// Total number of instructions analyzed
    pub total_instructions: usize,

    /// Time taken for analysis in milliseconds
    pub analysis_time_ms: u64,

    /// Number of unique target addresses
    pub unique_targets: usize,

    /// Address range analyzed
    pub start_address: u32,
    pub end_address: u32,
}

impl AnalysisResults {
    pub fn new(
        xrefs: Vec<CrossReference>,
        loops: Vec<Loop>,
        functions: Vec<FunctionInfo>,
        total_instructions: usize,
        analysis_time_ms: u64,
        start_address: u32,
        end_address: u32,
    ) -> Self {
        let unique_targets = xrefs
            .iter()
            .map(|x| x.to_addr)
            .collect::<std::collections::HashSet<_>>()
            .len();

        Self {
            xrefs,
            loops,
            functions,
            total_instructions,
            analysis_time_ms,
            unique_targets,
            start_address,
            end_address,
        }
    }
}

/// Xref query results for specific address
#[derive(Debug, Serialize, Deserialize)]
pub struct XrefQueryResult {
    /// Target address that was queried
    pub address: u32,

    /// All cross-references found
    pub xrefs: Vec<CrossReference>,

    /// Number of references
    pub count: usize,
}

impl XrefQueryResult {
    pub fn new(address: u32, xrefs: Vec<CrossReference>) -> Self {
        let count = xrefs.len();
        Self {
            address,
            xrefs,
            count,
        }
    }
}

/// Parsed instruction from disassembler (for WASM API)
#[derive(Debug, Clone)]
pub struct Instruction {
    pub address: u32,
    pub bytes: Vec<u8>,
    pub mnemonic: String,
    pub operands: String,
}

impl Instruction {
    pub fn new(address: u32, bytes: Vec<u8>, mnemonic: String, operands: String) -> Self {
        Self {
            address,
            bytes,
            mnemonic,
            operands,
        }
    }
}

/// Stack access type for tracking reads and writes
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum StackAccessType {
    /// Stack variable is read from
    Read,
    /// Stack variable is written to
    Write,
    /// Stack variable is both read and written
    ReadWrite,
}

/// Represents a stack variable or saved register in a function's stack frame
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StackVariable {
    /// Address where the function starts
    pub function_start: u32,
    /// Offset from stack pointer (negative = above SP, positive = below SP)
    pub offset: i32,
    /// Size of the variable in bytes
    pub size: u8,
    /// Type of access (read, write, or both)
    pub access_type: StackAccessType,
}

impl StackVariable {
    pub fn new(function_start: u32, offset: i32, size: u8, access_type: StackAccessType) -> Self {
        Self {
            function_start,
            offset,
            size,
            access_type,
        }
    }

    /// Merge access type with another access (e.g., Read + Write = ReadWrite)
    pub fn merge_access(&mut self, other_access: StackAccessType) {
        use StackAccessType::*;
        self.access_type = match (self.access_type, other_access) {
            (Read, Write) | (Write, Read) | (ReadWrite, _) | (_, ReadWrite) => ReadWrite,
            (Read, Read) => Read,
            (Write, Write) => Write,
        };
    }
}

/// Argument annotation for a function call
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArgAnnotation {
    /// Address of the call instruction
    pub call_address: u32,
    /// Target function address being called
    pub function_target: u32,
    /// List of arguments with their locations (arg_number, location)
    /// Location can be "r0", "r1", "stack+4", etc.
    pub args: Vec<(u8, String)>,
}

impl ArgAnnotation {
    pub fn new(call_address: u32, function_target: u32, args: Vec<(u8, String)>) -> Self {
        Self {
            call_address,
            function_target,
            args,
        }
    }
}

/// Detailed function information with analysis results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionInfo {
    /// Function entry point address
    pub start_address: u32,
    /// Function end address (last instruction)
    pub end_address: Option<u32>,
    /// Function name (if known)
    pub name: Option<String>,
    /// Stack frame size in bytes
    pub stack_frame_size: u32,
    /// All stack variables in this function
    pub stack_vars: Vec<StackVariable>,
    /// All argument annotations for calls made by this function
    pub arg_annotations: Vec<ArgAnnotation>,
    /// List of addresses that call this function
    pub callers: Vec<u32>,
    /// List of addresses this function calls
    pub callees: Vec<u32>,
    /// Estimated complexity score
    pub complexity: u32,
}

impl FunctionInfo {
    pub fn new(start_address: u32) -> Self {
        Self {
            start_address,
            end_address: None,
            name: None,
            stack_frame_size: 0,
            stack_vars: Vec::new(),
            arg_annotations: Vec::new(),
            callers: Vec::new(),
            callees: Vec::new(),
            complexity: 0,
        }
    }

    /// Add a caller to this function
    pub fn add_caller(&mut self, caller_addr: u32) {
        if !self.callers.contains(&caller_addr) {
            self.callers.push(caller_addr);
        }
    }

    /// Add a callee from this function
    pub fn add_callee(&mut self, callee_addr: u32) {
        if !self.callees.contains(&callee_addr) {
            self.callees.push(callee_addr);
        }
    }
}
