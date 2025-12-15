# Analysis Module

High-level binary analysis module for battlemagic-analyzer.

## Overview

The analysis module provides architecture-aware capabilities for reverse engineering binaries:

- **Function Detection** - Identifies function boundaries using prologue/epilogue patterns and call graph analysis
- **Stack Analysis** - Tracks stack frame allocation and local variables
- **Calling Convention** - Detects function arguments and calling conventions

## Architecture

All analysis algorithms are architecture-agnostic and query architecture-specific information via the `Architecture` trait. This ensures portability across ARM, MIPS, x86, RISC-V, and other instruction sets.

## Modules

### `functions.rs`

Function boundary detection and call graph construction.

**Key Type:** `FunctionDetector<A: Architecture>`

**Features:**

- Detects function entry points from prologue patterns (push {lr})
- Identifies function exits from epilogue patterns (pop {pc}, bx lr)
- Finds call targets from cross-references
- Builds caller/callee relationships
- Assigns function end addresses

**Example:**

```rust
use battlemagic_analyzer::analysis::FunctionDetector;
use battlemagic_analyzer::arch::arm::ArmArchitecture;

let detector = FunctionDetector::new(ArmArchitecture);
let functions = detector.detect_functions(&instructions, &xrefs);

for (addr, func) in &functions {
    println!("Function at 0x{:X}", addr);
    println!("  Calls: {:?}", func.callees);
    println!("  Called by: {:?}", func.callers);
}
```

### `stack_analysis.rs`

Stack frame analysis and local variable tracking.

**Key Type:** `StackAnalyzer`

**Features:**

- Detects stack allocation (sub sp, sp, #N)
- Tracks stack stores/loads (str/ldr with [sp, #offset])
- Identifies saved registers vs local variables
- Calculates stack frame size
- Tracks read/write access patterns

**Example:**

```rust
use battlemagic_analyzer::analysis::StackAnalyzer;

let analyzer = StackAnalyzer::new();
let mut function = FunctionInfo::new(0x1000);
analyzer.analyze_function(&mut function, &instructions);

println!("Stack frame: {} bytes", function.stack_frame_size);
for var in &function.stack_vars {
    println!("  [sp+{}]: {} bytes, {:?}", var.offset, var.size, var.access_type);
}
```

### `calling_convention.rs`

Calling convention detection and argument tracking.

**Key Type:** `CallingConvention` trait

**Implementations:**

- `ArmCallingConvention` - ARM AAPCS (r0-r3 for args, r0 for return)

**Features:**

- Detects arguments passed to function calls
- Tracks register assignments before calls
- Identifies stack-passed arguments
- Architecture-specific calling conventions

**Example:**

```rust
use battlemagic_analyzer::analysis::{ArmCallingConvention, CallingConvention};

let cc = ArmCallingConvention;
let args = cc.detect_args(&call_instr, &preceding_instrs);

for (arg_num, location) in &args {
    println!("arg{}: {}", arg_num, location);
}
```

## Types Added to `types.rs`

### `StackAccessType`

```rust
pub enum StackAccessType {
    Read,      // Variable is read from
    Write,     // Variable is written to
    ReadWrite, // Variable is both read and written
}
```

### `StackVariable`

```rust
pub struct StackVariable {
    pub function_start: u32,  // Function containing this variable
    pub offset: i32,           // Offset from stack pointer
    pub size: u8,              // Size in bytes (1, 2, or 4)
    pub access_type: StackAccessType,
}
```

### `ArgAnnotation`

```rust
pub struct ArgAnnotation {
    pub call_address: u32,     // Address of the call instruction
    pub function_target: u32,  // Target function being called
    pub args: Vec<(u8, String)>, // (arg_number, location)
}
```

### `FunctionInfo`

```rust
pub struct FunctionInfo {
    pub start_address: u32,
    pub end_address: Option<u32>,
    pub name: Option<String>,
    pub stack_frame_size: u32,
    pub stack_vars: Vec<StackVariable>,
    pub arg_annotations: Vec<ArgAnnotation>,
    pub callers: Vec<u32>,     // Functions that call this one
    pub callees: Vec<u32>,     // Functions this one calls
    pub complexity: u32,       // Estimated complexity score
}
```

## Design Principles

### 1. Modularity

Each analysis component is independent with clear interfaces:

- `FunctionDetector` - Finds function boundaries
- `StackAnalyzer` - Analyzes stack usage
- `CallingConvention` - Detects calling patterns

### 2. Testability

All components can be tested in isolation with mock architectures:

```rust
struct MockArch;
impl Architecture for MockArch { ... }

let detector = FunctionDetector::new(MockArch);
```

### 3. Architecture Independence

All algorithms query arch-specific info via trait methods:

```rust
if arch.is_function_start(inst) { ... }
if arch.is_function_end(inst) { ... }
```

### 4. Efficiency

- O(n) algorithms where possible
- Single-pass analysis for most operations
- Minimal memory allocations

## Testing

Comprehensive unit tests are included for each module:

```bash
cargo test analysis::calling_convention
cargo test analysis::functions
cargo test analysis::stack_analysis
```

All tests use mock architectures to verify behavior independently of actual instruction decoders.

## Future Enhancements

1. **Control Flow Graph Integration** - Use CFG analysis for more accurate function boundaries
2. **Type Inference** - Infer variable types from usage patterns
3. **Register Tracking** - Full dataflow analysis for register values
4. **Indirect Call Resolution** - Resolve function pointers and virtual calls
5. **Additional Calling Conventions** - x86-64, RISC-V, MIPS calling conventions

## Integration with Other Modules

The analysis module works alongside:

- **cfg/** (Agent 1) - Uses CFG for advanced control flow analysis
- **traits.rs** (Agent 3) - Implements Architecture trait methods
- **arch/** (Agent 4) - Provides ARM/MIPS-specific implementations
- **analyzer.rs** (Agent 5) - Main analyzer orchestrates all analysis passes

## Notes

- All custom code follows embedded systems best practices
- No heap allocation in critical paths
- Designed for resource-constrained environments
- Clean separation between architecture-specific and generic code
