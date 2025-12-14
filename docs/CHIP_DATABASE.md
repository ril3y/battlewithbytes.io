# Chip Database

High-performance, compile-time validated chip detection for embedded systems.

## Quick Start

### Rust

```rust
use battlemagic_analyzer::chips::detect_architecture;

let info = detect_architecture("STM32F407VG");
println!("Chip: {} by {}", info.chip_name, info.manufacturer);
println!("Architecture: {} (confidence: {:.0}%)",
         info.architecture_name, info.confidence * 100.0);

if !info.supported {
    eprintln!("Warning: This architecture is not yet supported");
}
```

### JavaScript/TypeScript (via WASM)

```typescript
import init, { detect_architecture_wasm } from "./battlemagic_analyzer";

await init();

const info = detect_architecture_wasm("STM32F407VG");
console.log(`Chip: ${info.chipName} by ${info.manufacturer}`);
console.log(`Architecture: ${info.architectureName}`);
console.log(`Confidence: ${(info.confidence * 100).toFixed(0)}%`);
```

## Features

- **37+ supported chip families** across ARM Cortex-M, MIPS, and RISC-V
- **Fuzzy matching** with confidence scoring (0.0-1.0)
- **Zero runtime cost** - const array database embedded at compile time
- **Type-safe** - Architecture enum prevents invalid values
- **Extensible** - Add new chips in minutes
- **WASM ready** - First-class JavaScript interop

## Supported Chips

### ARM Cortex-M (Fully Supported)

- **STMicroelectronics**: STM32F0/F1/F2/F3/F4/F7, L0/L1/L4/L5, G0/G4, H7
- **Nordic Semiconductor**: nRF51, nRF52 variants (805/810/811/820/832/833/840)
- **Microchip**: SAMD20/21/51, SAME51/53/54
- **NXP**: LPC11xx/13xx/15xx/17xx/18xx/40xx/43xx/54xxx/55xx
- **Raspberry Pi**: RP2040

### MIPS (Future Support)

- **Microchip**: PIC32MX, PIC32MZ

### RISC-V (Future Support)

- **GigaDevice**: GD32VF103
- **Espressif**: ESP32-C3, ESP32-C6

## Pattern Matching

The system uses sophisticated 5-level matching:

1. **Exact** (1.0) - "STM32F4" → "STM32F4"
2. **Case-insensitive** (0.95) - "stm32f4" → "STM32F4"
3. **Substring** (0.85) - "STM32F407VG" → "STM32F4"
4. **Substring case-insensitive** (0.80) - "stm32f407vg" → "STM32F4"
5. **Fuzzy** (0.60) - "nRF528" → "nRF52832" (Levenshtein distance)

## Examples

Run comprehensive examples:

```bash
cd packages/battlemagic-analyzer
cargo run --example chip_detection
```

## Testing

```bash
# Run all chip detection tests
cargo test chips::

# Run specific test
cargo test chips::tests::test_real_world_targets

# All 22 tests should pass
```

## Adding New Chips

1. Edit `src/chips.rs` and add to `CHIP_DATABASE`:

```rust
ChipFamily {
    family: "STM32U5",
    manufacturer: "STMicroelectronics",
    architecture: Architecture::ArmCortexM33,
    supported: true,
    patterns: &["STM32U5", "stm32u5"],
    description: "STM32U5 - Ultra-low-power ARM Cortex-M33",
},
```

2. Add test case:

```rust
#[test]
fn test_stm32u5_detection() {
    let info = detect_architecture("STM32U575");
    assert_eq!(info.chip_name, "STM32U5");
    assert_eq!(info.architecture, Architecture::ArmCortexM33);
}
```

3. Run tests: `cargo test chips::`

## Documentation

- **[Full Documentation](docs/CHIPS.md)** - Complete API reference
- **[Migration Guide](docs/MIGRATION_TYPESCRIPT_TO_RUST.md)** - Replacing TypeScript detection
- **[Examples](examples/chip_detection.rs)** - Comprehensive usage examples

## Performance

- **Detection time**: < 1ms typical
- **Database size**: ~5KB compiled
- **Memory**: Zero heap allocation for detection
- **WASM overhead**: ~50KB added to bundle

## Architecture

```
src/chips.rs
├── Architecture enum          (CPU architectures)
├── ChipFamily struct          (Database entries)
├── ArchitectureInfo struct    (Detection results)
├── CHIP_DATABASE              (Const array of all chips)
├── detect_architecture()      (Main detection function)
├── get_supported_chips()      (List all supported)
└── WASM exports               (JavaScript bindings)
```

## API Summary

### Rust Functions

```rust
// Detect chip from target description
pub fn detect_architecture(target_description: &str) -> ArchitectureInfo;

// Get all supported chip families
pub fn get_supported_chips() -> Vec<ArchitectureInfo>;

// Check if architecture has decoder
pub fn is_architecture_supported(architecture: Architecture) -> bool;
```

### WASM Functions (JavaScript)

```javascript
// Detect chip (async)
detect_architecture_wasm(target_description: string): ArchitectureInfo

// Get supported chips list
get_supported_chips_wasm(): ArchitectureInfo[]

// Check architecture support
is_architecture_supported_wasm(arch_name: string): boolean
```

## License

MIT - Same as battlemagic-analyzer package

## Contributing

Contributions welcome! To add a new chip:

1. Fork repository
2. Add chip to `CHIP_DATABASE` in `src/chips.rs`
3. Add test case with real-world target description
4. Ensure `cargo test chips::` passes
5. Submit PR

See [CHIPS.md](docs/CHIPS.md#adding-new-chips) for detailed guidelines.
