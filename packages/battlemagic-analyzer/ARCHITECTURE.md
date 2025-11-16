# BattleMagic Analyzer Architecture

## Quick Reference

### Current State (v0.1.0)

```
Simple, ARM-only architecture:

JavaScript → WASM → XrefBuilder → Types
                         ↓
                    ARM parsing
```

### Target State (v0.2.0)

```
Modular, multi-architecture design:

JavaScript → WASM API → BinaryAnalyzer<Arch> → Architecture Trait
                              ↓                        ↓
                        XrefDatabase          ARM/MIPS/x86/RISC-V
                              ↓
                        CFG Builder
                              ↓
                      Function Detector
```

## Component Responsibilities

| Component | Responsibility | Architecture-Specific? |
|-----------|---------------|------------------------|
| `lib.rs` | WASM bindings | No |
| `analyzer.rs` | Core analysis engine | No |
| `xref.rs` | Xref database | No |
| `traits.rs` | Architecture contract | No |
| `types.rs` | Shared types | No |
| `arch/arm/` | ARM implementation | Yes |
| `arch/mips/` | MIPS implementation | Yes |
| `arch/riscv/` | RISC-V implementation | Yes |
| `arch/x86/` | x86 implementation | Yes |
| `function/` | Function detection | No (uses trait) |
| `cfg/` | Control flow graph | No (uses trait) |

## Data Flow

### Analysis Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     JavaScript Frontend                      │
│  (Passes disassembled instructions from Capstone/Unicorn)   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ JsValue (JSON)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      WASM Boundary                           │
│         ArmAnalyzer / MipsAnalyzer / X86Analyzer            │
│      (Architecture-specific WASM-exported structs)          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Vec<Instruction>
                      ▼
┌─────────────────────────────────────────────────────────────┐
│           BinaryAnalyzer<A: Architecture>                    │
│        (Generic analyzer parameterized by arch)             │
│                                                              │
│  1. Convert Instruction → DecodedInstruction                │
│  2. Call arch.extract_xrefs() for each instruction          │
│  3. Populate XrefDatabase                                   │
│  4. Build indices                                           │
│  5. Return AnalysisResults                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐
│ XrefDatabase │ │ CFG      │ │ Function │
│              │ │ Builder  │ │ Detector │
│ - add_xref() │ │          │ │          │
│ - get_to()   │ │          │ │          │
│ - get_from() │ │          │ │          │
└──────────────┘ └──────────┘ └──────────┘
        │
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│              Architecture Implementations                    │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ ArmArch     │  │ MipsArch    │  │ X86Arch     │        │
│  │             │  │             │  │             │        │
│  │ extract_    │  │ extract_    │  │ extract_    │        │
│  │   xrefs()   │  │   xrefs()   │  │   xrefs()   │        │
│  │             │  │             │  │             │        │
│  │ is_func_    │  │ is_func_    │  │ is_func_    │        │
│  │   start()   │  │   start()   │  │   start()   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
│  Each implements the Architecture trait                     │
└─────────────────────────────────────────────────────────────┘
        │
        │ Vec<XrefInfo>
        ▼
┌─────────────────────────────────────────────────────────────┐
│                     Results                                  │
│                                                              │
│  - Cross-references (from/to, type)                         │
│  - Function boundaries                                      │
│  - Control flow graph                                       │
│  - Analysis statistics                                      │
└─────────────────────────────────────────────────────────────┘
        │
        │ JsValue (JSON)
        ▼
┌─────────────────────────────────────────────────────────────┐
│                  JavaScript Frontend                         │
│         (Displays xrefs, functions, CFG)                    │
└─────────────────────────────────────────────────────────────┘
```

### Query Flow

```
JavaScript Query:
  analyzer.get_xrefs_to(0x1000)

        │
        ▼
ArmAnalyzer::get_xrefs_to(0x1000)
        │
        ▼
BinaryAnalyzer::get_xrefs_to(0x1000)
        │
        ▼
XrefDatabase::get_xrefs_to(0x1000)
        │
        ├─ Lookup in to_index HashMap: O(1)
        ├─ Retrieve xref indices
        └─ Return Vec<CrossReference>
        │
        ▼
Serialize to JsValue

        │
        ▼
JavaScript receives results
```

## Type System

### Core Types

```rust
// Generic instruction (from JavaScript)
pub struct Instruction {
    address: u32,
    bytes: Vec<u8>,
    mnemonic: String,
    operands: String,
}

// Architecture-decoded instruction
pub struct DecodedInstruction {
    address: u32,
    bytes: Vec<u8>,
    mnemonic: String,
    operands: String,
    metadata: InstructionMetadata,  // <-- Architecture-specific
}

// Xref information extracted by architecture
pub struct XrefInfo {
    target: u32,
    xref_type: XrefType,
    is_direct: bool,
}

// Stored cross-reference
pub struct CrossReference {
    from_addr: u32,
    to_addr: u32,
    xref_type: XrefType,
    instruction: String,
    operands: String,
}
```

### Type Conversion Flow

```
Instruction (JS) → Instruction (Rust) → DecodedInstruction → XrefInfo → CrossReference
     │                                          ↑
     │                                          │
     └──────────────────────────────────────────┘
              Architecture::extract_xrefs()
```

## Architecture Trait Contract

The `Architecture` trait is the heart of the extensibility:

```rust
pub trait Architecture: Send + Sync {
    // Identity
    fn name(&self) -> &'static str;
    fn instruction_alignment(&self) -> usize;

    // Decoding (optional, for raw bytes)
    fn decode(&self, bytes: &[u8], address: u32) -> Option<DecodedInstruction>;

    // Cross-reference extraction (required)
    fn extract_xrefs(&self, instr: &DecodedInstruction) -> Vec<XrefInfo>;

    // Function detection
    fn is_function_start(&self, instr: &DecodedInstruction) -> bool;
    fn is_function_end(&self, instr: &DecodedInstruction) -> bool;

    // Control flow
    fn is_block_terminator(&self, instr: &DecodedInstruction) -> bool;

    // Address calculation
    fn effective_pc(&self, address: u32, instr_len: usize) -> u32;
}
```

### Implementation Strategy

Each architecture implements this trait differently:

| Method | ARM | MIPS | x86 |
|--------|-----|------|-----|
| `name()` | "ARM" | "MIPS32" | "x86-64" |
| `instruction_alignment()` | 4 | 4 | 1 |
| `effective_pc()` | addr + 8 | addr + 4 | addr + len |
| `extract_xrefs()` | Parse bl/b/ldr | Parse jal/beq/lw | Parse call/jmp/mov |
| `is_function_start()` | push {..., lr} | addiu sp, sp, -N | push rbp |
| `is_function_end()` | pop {..., pc} | jr ra | ret |

## Module Dependencies

```
┌────────────────┐
│    lib.rs      │  (WASM exports)
└───────┬────────┘
        │
        ├─────────────┬─────────────┬─────────────┐
        │             │             │             │
        ▼             ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│analyzer.rs│  │ types.rs │  │ traits.rs│  │  arch/   │
└─────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
      │            │              │             │
      ├────────────┴──────────────┴─────────────┤
      │                                          │
      ▼                                          ▼
┌──────────┐                              ┌──────────┐
│ xref.rs  │                              │ arm/     │
│          │                              │ mips/    │
│          │                              │ riscv/   │
│          │                              │ x86/     │
└──────────┘                              └──────────┘
      │                                          │
      ▼                                          ▼
┌──────────┐                              ┌──────────┐
│function/ │                              │  xref.rs │
│  cfg/    │                              │ patterns.rs
└──────────┘                              └──────────┘
```

**Dependency Rules:**

1. `lib.rs` depends on everything (WASM facade)
2. `analyzer.rs` depends on traits, xref, types
3. `arch/*` depends on traits, types (NOT analyzer)
4. `xref.rs` depends only on types (NO arch)
5. `traits.rs` depends only on types
6. `types.rs` has no dependencies (foundation)

## Comparison: Before vs After

### Before (v0.1.0)

**Pros:**
- Simple, straightforward code
- Fast to write initially
- Low cognitive overhead

**Cons:**
- Hard-coded ARM assumptions
- Cannot add new architectures
- Violates open/closed principle
- Difficult to test components in isolation

**Code Sample:**
```rust
// xref.rs - ARM assumptions baked in
fn parse_pc_relative_ref(&self, operands: &str, addr: u32) -> Option<u32> {
    // ARM PC is always +8 from current instruction
    let pc_val = addr + 8;  // <-- Can't change for other archs!
    // ...
}
```

### After (v0.2.0)

**Pros:**
- Clean separation of concerns
- Easy to add new architectures
- Testable components
- Open/closed principle respected
- Type-safe polymorphism

**Cons:**
- More code (but better organized)
- Slightly larger binary
- Higher initial complexity

**Code Sample:**
```rust
// traits.rs - Generic contract
trait Architecture {
    fn effective_pc(&self, address: u32, instr_len: usize) -> u32;
}

// arch/arm/mod.rs - ARM-specific
impl Architecture for ArmArchitecture {
    fn effective_pc(&self, address: u32, _len: usize) -> u32 {
        address + 8  // ARM pipeline
    }
}

// arch/mips/mod.rs - MIPS-specific
impl Architecture for MipsArchitecture {
    fn effective_pc(&self, address: u32, len: usize) -> u32 {
        address + len as u32  // MIPS is different!
    }
}
```

## Performance Characteristics

### Time Complexity

| Operation | Before | After | Notes |
|-----------|--------|-------|-------|
| Analyze N instructions | O(N) | O(N) | Same |
| Build xref index | O(N) | O(N) | Same |
| Lookup xref by address | O(1) | O(1) | HashMap |
| Get all xrefs | O(N) | O(N) | Same |

### Space Complexity

| Structure | Before | After | Notes |
|-----------|--------|-------|-------|
| XrefBuilder | O(N) | O(N) | Same (now XrefDatabase) |
| Indices | O(N) | O(N) | Same (HashMap) |
| Architecture | 0 | O(1) | Stateless struct |

### Monomorphization Impact

Static dispatch via generics means:

```rust
// This code:
BinaryAnalyzer<ArmArchitecture>
BinaryAnalyzer<MipsArchitecture>

// Becomes this in compiled output:
BinaryAnalyzer_ArmArchitecture
BinaryAnalyzer_MipsArchitecture

// Two separate implementations, fully optimized
// No runtime overhead, but larger binary
```

**Binary Size:**
- Before: 45KB WASM
- After: ~60-70KB WASM (includes ARM + MIPS)
- Per-architecture: ~30-35KB WASM (if built separately)

## Testing Architecture

### Unit Tests (Per Module)

```
src/traits.rs
  └── tests/ (trait contract validation)

src/analyzer.rs
  └── tests/ (use mock architecture)

src/xref.rs
  └── tests/ (pure data structure tests)

src/arch/arm/xref.rs
  └── tests/ (ARM-specific parsing)

src/arch/mips/xref.rs
  └── tests/ (MIPS-specific parsing)
```

### Integration Tests (Cross-Module)

```
tests/integration_test.rs
  └── Generic analyzer tests

tests/arm_tests.rs
  └── ARM-specific scenarios

tests/mips_tests.rs
  └── MIPS-specific scenarios
```

### Benchmark Tests

```
benches/analyzer_bench.rs
  ├── ARM analysis (10K, 50K, 100K instructions)
  ├── MIPS analysis
  ├── Xref lookup performance
  └── Memory overhead
```

## Future Extensions

### Easy Additions

1. **New Architectures**
   - Create `src/arch/riscv/`
   - Implement `Architecture` trait
   - Add WASM binding
   - ~500 LOC per architecture

2. **Function Detection**
   - Use `is_function_start()`/`is_function_end()` from trait
   - Generic algorithm in `function/detector.rs`
   - Works for all architectures

3. **Control Flow Graph**
   - Use xrefs to build graph
   - Use `is_block_terminator()` from trait
   - Generic algorithm in `cfg/builder.rs`

4. **Dead Code Detection**
   - Build CFG
   - Find unreachable blocks
   - Works for all architectures

### Hard Additions (Require Trait Extension)

1. **Register Analysis**
   - Need architecture-specific register mappings
   - Extend trait with `register_info()`

2. **Calling Conventions**
   - Different per arch/OS
   - Extend trait with `calling_convention()`

3. **Instruction Semantics**
   - Full semantic representation
   - Would need major trait redesign

## Migration Timeline

### Week 1: Foundation
- Create trait system
- Refactor xref.rs → xref database
- Create generic analyzer
- All existing tests pass

### Week 2: ARM Extraction
- Move ARM code to arch/arm/
- Implement Architecture trait for ARM
- Update WASM API
- All tests pass, benchmarks match

### Week 3: MIPS Implementation
- Create arch/mips/
- Implement MIPS support
- Demonstrate extensibility
- Add MIPS tests

### Week 4: Enhanced Features
- Function detection
- CFG builder
- Update WASM API
- Integration tests

### Week 5: Documentation & Polish
- Write guides
- Create examples
- Performance tuning
- Release v0.2.0

## Key Design Decisions

### 1. Static vs Dynamic Dispatch

**Decision:** Static dispatch (generics)

**Rationale:**
- Zero runtime overhead
- Better compiler optimization
- Type safety at compile time
- WASM size increase is acceptable

### 2. Trait Design

**Decision:** Single Architecture trait

**Rationale:**
- Simple contract
- Easy to implement
- Covers 80% of use cases
- Can be extended later if needed

### 3. WASM API

**Decision:** One struct per architecture

**Rationale:**
- Clear API for JavaScript
- Type-safe
- Easy to document
- User chooses architecture explicitly

### 4. Xref Database

**Decision:** Generic, architecture-agnostic

**Rationale:**
- Pure data structure
- Easy to test
- Reusable across all architectures
- No duplication

## Conclusion

This architecture provides:

1. **Clean Separation**: Generic logic separated from arch-specific
2. **Extensibility**: Add new architectures in ~500 LOC
3. **Performance**: Zero runtime overhead from abstractions
4. **Maintainability**: Each component has single responsibility
5. **Type Safety**: Rust trait system ensures correctness

The modular design makes BattleMagic Analyzer a **true multi-architecture binary analysis platform** while maintaining the performance and simplicity of the original ARM-only implementation.
