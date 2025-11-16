# Visual Architecture Guide

## Current Architecture (v0.1.0)

```
┌─────────────────────────────────────────────────────────────────┐
│                        JavaScript Layer                         │
│  (Sends disassembled ARM instructions via WASM boundary)       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ JsValue
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WASM API (lib.rs)                            │
│                                                                  │
│   pub struct BinaryAnalyzer {                                   │
│       xref_builder: XrefBuilder,  // <-- Has ARM logic inside   │
│       base_address: u32,                                        │
│   }                                                             │
│                                                                  │
│   PROBLEM: ARM assumptions baked in                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Vec<Instruction>
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  XrefBuilder (xref.rs)                          │
│                                                                  │
│   fn analyze_call(&mut self, instr: &Instruction) {            │
│       if instr.mnemonic == "bl" || instr.mnemonic == "blx" {   │
│           // ARM-specific! ^^                                   │
│       }                                                         │
│   }                                                             │
│                                                                  │
│   fn parse_pc_relative_ref(...) -> Option<u32> {               │
│       let pc_val = addr + 8;  // ARM pipeline! <--             │
│   }                                                             │
│                                                                  │
│   PROBLEM: Cannot work with MIPS/x86 instructions              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Vec<CrossReference>
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Results (types.rs)                            │
│                                                                  │
│   pub struct AnalysisResults {                                  │
│       xrefs: Vec<CrossReference>,                               │
│       total_instructions: usize,                                │
│       // ...                                                    │
│   }                                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Problems Visualized

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ MIPS Binary  │     │ x86 Binary   │     │ RISC-V Binary│
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                     │
       └────────────────────┼─────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  BinaryAnalyzer  │
                  │                  │
                  │  Only knows ARM! │
                  │       ❌         │
                  └──────────────────┘
```

---

## Target Architecture (v0.2.0)

```
┌─────────────────────────────────────────────────────────────────┐
│                        JavaScript Layer                         │
│  (Sends disassembled instructions, chooses architecture)       │
└───────────────┬──────────────────────┬──────────────────────────┘
                │                      │
        For ARM │              For MIPS│
                ▼                      ▼
    ┌───────────────────┐  ┌───────────────────┐
    │   ArmAnalyzer     │  │  MipsAnalyzer     │
    │   (WASM export)   │  │  (WASM export)    │
    └─────────┬─────────┘  └─────────┬─────────┘
              │                      │
              │ Wraps                │ Wraps
              ▼                      ▼
    ┌──────────────────────────────────────────┐
    │  BinaryAnalyzer<ArmArchitecture>  │
    │  BinaryAnalyzer<MipsArchitecture> │
    │                                          │
    │  Generic analyzer parameterized by arch  │
    └────────────────┬─────────────────────────┘
                     │
                     │ Delegates to
                     ▼
    ┌────────────────────────────────────────────┐
    │        Architecture Trait                   │
    │                                             │
    │  trait Architecture {                       │
    │      fn extract_xrefs(...) -> Vec<XrefInfo>;│
    │      fn is_function_start(...) -> bool;     │
    │      fn effective_pc(...) -> u32;           │
    │  }                                          │
    └────────────┬────────────────┬───────────────┘
                 │                │
        ARM impl │        MIPS impl│
                 ▼                ▼
    ┌─────────────────┐  ┌─────────────────┐
    │ ArmArchitecture │  │MipsArchitecture │
    │                 │  │                 │
    │ extract_xrefs() │  │ extract_xrefs() │
    │   → Parse ARM   │  │   → Parse MIPS  │
    │      bl, b, ldr │  │      jal, beq   │
    │                 │  │                 │
    │ effective_pc()  │  │ effective_pc()  │
    │   → addr + 8    │  │   → addr + 4    │
    └─────────────────┘  └─────────────────┘
```

### Solutions Visualized

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ ARM Binary   │     │ MIPS Binary  │     │ x86 Binary   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                     │
       ▼                    ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ArmAnalyzer   │     │MipsAnalyzer  │     │X86Analyzer   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                     │
       └────────────────────┼─────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ BinaryAnalyzer<A>│
                  │                  │
                  │ Works with all!  │
                  │       ✓          │
                  └──────────────────┘
```

---

## Data Flow Comparison

### Before: Tightly Coupled

```
JavaScript
    │
    │ disasm data
    ▼
BinaryAnalyzer
    │
    │ calls
    ▼
XrefBuilder ◄────────┐
    │                │ ARM-specific
    ├─ analyze_call()│ logic baked in
    ├─ analyze_branch()
    └─ parse_pc_relative()  // addr + 8 hardcoded
    │
    ▼
CrossReferences
```

### After: Loosely Coupled

```
JavaScript
    │
    │ disasm data
    ▼
ArmAnalyzer / MipsAnalyzer
    │
    │ delegates to
    ▼
BinaryAnalyzer<Arch>
    │
    ├─ for each instruction:
    │     │
    │     │ asks architecture
    │     ▼
    │  Architecture::extract_xrefs()
    │     │
    │     ├─ ARM impl: parse bl, b, ldr
    │     └─ MIPS impl: parse jal, beq, lw
    │     │
    │     ▼
    │  Vec<XrefInfo>
    │
    │ stores in
    ▼
XrefDatabase (pure data structure)
    │
    │ no ARM knowledge!
    ▼
CrossReferences
```

---

## Module Dependency Graph

### Before (Tangled)

```
         ┌────────┐
         │lib.rs  │
         └───┬────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌────────┐       ┌────────┐
│xref.rs │◄──────┤types.rs│
└────────┘       └────────┘
    │
    └─────► Has ARM logic
```

**Problem:** xref.rs knows about ARM

### After (Layered)

```
                    ┌────────┐
                    │lib.rs  │
                    └───┬────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    ┌────────┐     ┌─────────┐    ┌────────┐
    │analyzer│     │traits.rs│    │ arch/  │
    └───┬────┘     └────┬────┘    └───┬────┘
        │               │             │
        │               │             │
        └───────┬───────┴─────────────┘
                │
                ▼
         ┌──────────┐        ┌────────┐
         │ xref.rs  │        │types.rs│
         └──────────┘        └────────┘
               │                  │
               └──────────────────┘
                       │
                No ARM knowledge!
```

**Solution:** Clean layers, architecture isolated

---

## Type Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Type Transformations                     │
└─────────────────────────────────────────────────────────────┘

JavaScript Side:
┌──────────────────────┐
│ {                    │
│   address: 0x1000,   │
│   bytes: [0,0,0,0],  │
│   mnemonic: "bl",    │
│   operands: "#0x2000"│
│ }                    │
└──────────┬───────────┘
           │ Serialized via serde-wasm-bindgen
           ▼
Rust Side (WASM Boundary):
┌──────────────────────┐
│ JsInstruction        │
│ (deserialized)       │
└──────────┬───────────┘
           │ Convert to
           ▼
┌──────────────────────┐
│ Instruction          │
│ (types.rs)           │
└──────────┬───────────┘
           │ BinaryAnalyzer converts to
           ▼
┌──────────────────────┐
│ DecodedInstruction   │
│ (traits.rs)          │
│ + metadata           │
└──────────┬───────────┘
           │ Architecture::extract_xrefs()
           ▼
┌──────────────────────┐
│ Vec<XrefInfo>        │
│ (traits.rs)          │
└──────────┬───────────┘
           │ Converted to
           ▼
┌──────────────────────┐
│ CrossReference       │
│ (types.rs)           │
└──────────┬───────────┘
           │ Stored in
           ▼
┌──────────────────────┐
│ XrefDatabase         │
└──────────┬───────────┘
           │ Returned in
           ▼
┌──────────────────────┐
│ AnalysisResults      │
│ (types.rs)           │
└──────────┬───────────┘
           │ Serialized back
           ▼
JavaScript Side:
┌──────────────────────┐
│ {                    │
│   xrefs: [...],      │
│   total_instructions,│
│   analysis_time_ms   │
│ }                    │
└──────────────────────┘
```

---

## Control Flow: Analyzing an Instruction

### Before (Monolithic)

```
BinaryAnalyzer::analyze_from_disasm()
    │
    ├─ for each instruction:
    │     │
    │     ├─ XrefBuilder::analyze_call()
    │     │     │
    │     │     ├─ if mnemonic == "bl" or "blx"  // ARM specific!
    │     │     │     │
    │     │     │     └─ parse_branch_target()
    │     │     │           │
    │     │     │           └─ Extract #0x... from operands
    │     │     │
    │     │     └─ Create CrossReference
    │     │
    │     ├─ XrefBuilder::analyze_branch()
    │     │     │
    │     │     └─ Similar ARM-specific logic
    │     │
    │     └─ XrefBuilder::analyze_data_ref()
    │           │
    │           └─ parse_pc_relative_ref()
    │                 │
    │                 └─ addr + 8  // ARM pipeline!
    │
    └─ return results
```

### After (Modular)

```
BinaryAnalyzer<A>::analyze_from_disasm()
    │
    ├─ for each instruction:
    │     │
    │     ├─ Convert to DecodedInstruction
    │     │
    │     ├─ Architecture::extract_xrefs()  // Polymorphic!
    │     │     │
    │     │     ├─ If A = ArmArchitecture:
    │     │     │     │
    │     │     │     └─ ArmXrefExtractor::extract()
    │     │     │           │
    │     │     │           ├─ if is_call() → parse bl/blx
    │     │     │           ├─ if is_branch() → parse b/b.eq
    │     │     │           └─ if is_data_ref() → parse ldr/str
    │     │     │                 │
    │     │     │                 └─ addr + 8  // ARM-specific
    │     │     │
    │     │     └─ If A = MipsArchitecture:
    │     │           │
    │     │           └─ MipsXrefExtractor::extract()
    │     │                 │
    │     │                 ├─ if is_call() → parse jal/jalr
    │     │                 ├─ if is_branch() → parse beq/bne
    │     │                 └─ if is_load() → parse lw/sw
    │     │                       │
    │     │                       └─ addr + 4  // MIPS-specific
    │     │
    │     ├─ XrefDatabase::add_xref()  // Pure data structure
    │     │
    │     └─ Continue...
    │
    └─ XrefDatabase::build_indices()
    │
    └─ return results
```

---

## Adding a New Architecture: Visual Guide

```
Step 1: Create module
┌─────────────────────┐
│ src/arch/riscv/     │
│   ├── mod.rs        │
│   └── xref.rs       │
└─────────────────────┘
         │
         │ Implements
         ▼
Step 2: Implement trait
┌───────────────────────────────┐
│ impl Architecture for RiscV   │
│                               │
│ fn extract_xrefs() {          │
│   // Parse jal, jalr, beq     │
│ }                             │
│                               │
│ fn effective_pc() {           │
│   addr + 4  // RISC-V         │
│ }                             │
└───────────────────────────────┘
         │
         │ Used by
         ▼
Step 3: Create WASM binding
┌───────────────────────────────┐
│ #[wasm_bindgen]               │
│ pub struct RiscVAnalyzer {    │
│   inner: BinaryAnalyzer<      │
│            RiscVArchitecture> │
│ }                             │
└───────────────────────────────┘
         │
         │ Exports to
         ▼
Step 4: Use in JavaScript
┌───────────────────────────────┐
│ import { RiscVAnalyzer }      │
│                               │
│ const analyzer =              │
│   new RiscVAnalyzer(0x1000);  │
│                               │
│ const results =               │
│   analyzer.analyze(...);      │
└───────────────────────────────┘
```

---

## Performance: Static vs Dynamic Dispatch

### Dynamic Dispatch (NOT used)

```
┌─────────────────────┐
│ BinaryAnalyzer      │
│                     │
│ arch: Box<dyn       │
│       Architecture> │───────┐
└─────────────────────┘       │
                              │ Runtime lookup
                              │ via vtable
                              ▼
                    ┌──────────────────┐
                    │ Architecture     │
                    │ (trait object)   │
                    └──────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │ ArmArch      │    │ MipsArch     │
            └──────────────┘    └──────────────┘

COST: Virtual method call (~5-10ns overhead)
      Prevents inlining
```

### Static Dispatch (USED)

```
┌──────────────────────────────┐
│ BinaryAnalyzer<ArmArch>      │
│                              │
│ arch: ArmArchitecture        │──► Direct call
└──────────────────────────────┘   No vtable
                                   Can inline!

┌──────────────────────────────┐
│ BinaryAnalyzer<MipsArch>     │
│                              │
│ arch: MipsArchitecture       │──► Direct call
└──────────────────────────────┘   No vtable
                                   Can inline!

Compiler creates two separate types:
- BinaryAnalyzer_ArmArch  (fully optimized)
- BinaryAnalyzer_MipsArch (fully optimized)

BENEFIT: Zero overhead
         Perfect inlining
         Same speed as hand-written
```

---

## Memory Layout

### Before

```
BinaryAnalyzer:
┌─────────────────────────────┐
│ base_address: u32   (4B)    │
│ memory_size: usize  (8B)    │
│ is_analyzed: bool   (1B)    │
│ padding             (7B)    │
│ xref_builder:              │
│   ├─ xrefs: Vec<...>        │
│   ├─ to_index: HashMap      │
│   └─ from_index: HashMap    │
└─────────────────────────────┘
Total: ~24B + Vec + 2*HashMap
```

### After

```
ArmAnalyzer (WASM export):
┌─────────────────────────────┐
│ inner: BinaryAnalyzer<Arm>  │
│   ├─ arch: ArmArchitecture  │ (0B, zero-sized type!)
│   ├─ base_address: u32      │ (4B)
│   ├─ is_analyzed: bool      │ (1B)
│   ├─ padding                │ (3B)
│   └─ xref_db:               │
│       ├─ xrefs: Vec<...>    │
│       ├─ to_index: HashMap  │
│       ├─ from_index: HashMap│
│       └─ indices_built: bool│ (1B)
└─────────────────────────────┘
Total: ~8B + Vec + 2*HashMap + 1B

BENEFIT: Actually smaller (no memory_size field)
         Architecture is zero-sized type (no overhead)
```

---

## Timeline Visualization

```
Week 1: Foundation
┌─────────────────────────────────┐
│ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │trait│ │xref │ │anal │        │
│ │ .rs │ │ .rs │ │yzer │        │
│ └─────┘ └─────┘ └─────┘        │
│  Create  Refac  Create          │
└─────────────────────────────────┘
         ▼
Week 2: ARM Extraction
┌─────────────────────────────────┐
│     ┌─────────────┐             │
│     │  arch/arm/  │             │
│     │  ├─ mod.rs  │             │
│     │  ├─ xref.rs │             │
│     │  └─ patterns│             │
│     └─────────────┘             │
└─────────────────────────────────┘
         ▼
Week 3: MIPS
┌─────────────────────────────────┐
│     ┌─────────────┐             │
│     │ arch/mips/  │             │
│     │  ├─ mod.rs  │             │
│     │  └─ xref.rs │             │
│     └─────────────┘             │
└─────────────────────────────────┘
         ▼
Week 4: Features
┌─────────────────────────────────┐
│ ┌─────────┐    ┌─────────┐     │
│ │function/│    │   cfg/  │     │
│ │detector │    │ builder │     │
│ └─────────┘    └─────────┘     │
└─────────────────────────────────┘
         ▼
Week 5: Docs
┌─────────────────────────────────┐
│  Documentation                  │
│  Examples                       │
│  Performance tuning             │
│  Release!                       │
└─────────────────────────────────┘
```

---

## Success Metrics Dashboard

```
┌─────────────────────────────────────────┐
│         Performance Metrics             │
├─────────────────────────────────────────┤
│ Analysis Speed:  2.5ms ───────► 2.5ms  │
│                  ✓ No regression        │
│                                         │
│ Xref Lookup:     120ns ───────► 120ns  │
│                  ✓ Same speed           │
│                                         │
│ WASM Size:       45KB ────────► 60KB   │
│                  ✓ Acceptable (+33%)    │
│                                         │
│ Memory Usage:    Same ─────────► Same  │
│                  ✓ No increase          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           Feature Metrics               │
├─────────────────────────────────────────┤
│ Architectures:   1 (ARM) ──────► 3+     │
│                  ✓ ARM, MIPS, more      │
│                                         │
│ Test Coverage:   20 tests ─────► 50+   │
│                  ✓ Comprehensive        │
│                                         │
│ Lines of Code:   600 ──────────► 3100  │
│                  ✓ Better organized     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          Quality Metrics                │
├─────────────────────────────────────────┤
│ Modularity:      Low ──────────► High   │
│                  ✓ Clear separation     │
│                                         │
│ Extensibility:   Hard ─────────► Easy   │
│                  ✓ ~500 LOC per arch    │
│                                         │
│ Type Safety:     Good ─────────► Excellent│
│                  ✓ Trait system         │
└─────────────────────────────────────────┘
```

---

This visual guide should help understand the architecture transformation at a glance. Refer to the detailed documents for implementation specifics.
