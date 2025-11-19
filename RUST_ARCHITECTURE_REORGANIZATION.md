# Rust Code Architecture Reorganization Plan

## Current Issues

The Rust codebase mixes architecture-specific and generic code:

### 1. `parsing/registers.rs`
- **Issue:** ARM Cortex-M specific register parsing
- **Should be:** `arch/arm/gdb_registers.rs`

### 2. `binary/patterns.rs`
- **Issue:** Contains ARM, MIPS, and RISC-V pattern matching in one file
- **Should be:** Split into arch-specific files

## Proposed Reorganization

```
packages/battlemagic-analyzer/src/
├── arch/
│   ├── common/              # Shared architecture utilities
│   │   ├── mod.rs
│   │   └── registers.rs     # Generic register trait
│   ├── arm/
│   │   ├── mod.rs
│   │   ├── decoder.rs       # ✅ Already here
│   │   ├── patterns.rs      # ✅ Already here (instruction patterns)
│   │   ├── xref.rs          # ✅ Already here
│   │   ├── gdb_registers.rs # NEW: ARM GDB register parsing
│   │   └── binary_patterns.rs # NEW: ARM binary detection patterns
│   ├── mips/
│   │   ├── mod.rs
│   │   ├── patterns.rs      # ✅ Already here
│   │   ├── xref.rs          # ✅ Already here
│   │   └── binary_patterns.rs # NEW: MIPS binary detection patterns
│   └── riscv/               # NEW directory
│       ├── mod.rs
│       ├── patterns.rs      # NEW: RISC-V instruction patterns
│       └── binary_patterns.rs # NEW: RISC-V binary detection
│
├── binary/                  # Generic binary format handling
│   ├── mod.rs
│   ├── types.rs             # ✅ Generic types
│   ├── elf.rs               # ✅ Generic ELF parser
│   └── detector.rs          # ✅ Generic detector (calls arch-specific)
│
├── parsing/                 # Generic GDB protocol parsing
│   ├── mod.rs
│   ├── hex_decode.rs        # ✅ Generic hex decoding
│   ├── memory.rs            # ✅ Generic memory parsing
│   ├── stop_reply.rs        # ✅ Generic stop reply
│   ├── breakpoint.rs        # ✅ Generic breakpoint
│   ├── monitor.rs           # ✅ Generic monitor
│   ├── error.rs             # ✅ Generic error
│   ├── rsp.rs               # ✅ Generic RSP
│   └── wasm_bindings.rs     # ✅ Generic WASM exports
│
├── analysis/                # Generic analysis (arch-agnostic)
├── cfg/                     # Generic CFG (arch-agnostic)
└── lib.rs
```

## Migration Steps

### Step 1: Create RISC-V Directory Structure
```bash
mkdir -p src/arch/riscv
mkdir -p src/arch/common
```

### Step 2: Split binary/patterns.rs

**Extract to `arch/arm/binary_patterns.rs`:**
- `score_arm_patterns()`
- `is_likely_stack_pointer()`
- ARM-specific constants

**Extract to `arch/mips/binary_patterns.rs`:**
- `score_mips_patterns()`
- MIPS-specific constants

**Extract to `arch/riscv/binary_patterns.rs`:**
- `score_riscv_patterns()`
- RISC-V-specific constants

### Step 3: Move parsing/registers.rs

**Move to `arch/arm/gdb_registers.rs`:**
- ARM Cortex-M register structures
- Register parsing functions
- ARM-specific register layouts

**Create `arch/common/registers.rs`:**
- Generic `RegisterSet` trait
- Common register types

### Step 4: Update Imports

Update `binary/detector.rs`:
```rust
use crate::arch::arm::binary_patterns::score_arm_patterns;
use crate::arch::mips::binary_patterns::score_mips_patterns;
use crate::arch::riscv::binary_patterns::score_riscv_patterns;
```

Update `parsing/mod.rs`:
```rust
// Re-export ARM registers for backward compatibility
pub use crate::arch::arm::gdb_registers::*;
```

### Step 5: Update Module Exports

`arch/arm/mod.rs`:
```rust
pub mod decoder;
pub mod patterns;         // Instruction patterns
pub mod xref;
pub mod gdb_registers;    // NEW
pub mod binary_patterns;  // NEW
```

`arch/mips/mod.rs`:
```rust
pub mod patterns;
pub mod xref;
pub mod binary_patterns;  // NEW
```

`arch/riscv/mod.rs` (NEW):
```rust
pub mod patterns;
pub mod binary_patterns;
```

## Benefits

1. **Consistency with TypeScript:** Same arch/arm/, arch/mips/ structure
2. **Clear separation:** Architecture-specific vs generic code
3. **Easier maintenance:** Find ARM code in arch/arm/, not scattered
4. **Future-proof:** Easy to add new architectures (x86, AVR, etc.)
5. **Better testing:** Test arch-specific code independently

## Timeline

- [ ] Create directory structure (5 min)
- [ ] Split binary/patterns.rs into 3 files (30 min)
- [ ] Move parsing/registers.rs to arch/arm/ (15 min)
- [ ] Update all imports (20 min)
- [ ] Run tests to verify (10 min)
- [ ] Commit changes (5 min)

**Total:** ~1.5 hours

## Testing

After reorganization, verify:
```bash
cd packages/battlemagic-analyzer
cargo test --all
cargo build --release
wasm-pack build --target web
```

All tests should pass without changes (just file moves).
