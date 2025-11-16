# Chip Database Documentation

## Overview

The chip database provides compile-time validated chip detection with fuzzy pattern matching for identifying microcontroller architectures from target descriptions. This replaces fragile string-based detection in TypeScript with a robust, type-safe Rust implementation.

## Architecture

### Design Principles

1. **Zero Runtime Cost**: Uses const arrays embedded at compile time
2. **Type Safety**: Architecture enum prevents invalid architecture values
3. **Extensibility**: Adding new chips is as simple as adding to the const array
4. **Fuzzy Matching**: Sophisticated pattern matching with confidence scoring
5. **WASM Integration**: First-class JavaScript interop

### Core Types

#### `Architecture` Enum

Represents CPU architectures with support status:

```rust
pub enum Architecture {
    // ARM Cortex-M (Supported)
    ArmCortexM0,
    ArmCortexM0Plus,
    ArmCortexM3,
    ArmCortexM4,
    ArmCortexM7,
    ArmCortexM23,
    ArmCortexM33,

    // MIPS (Future)
    Mips32,
    Mips32r2,

    // RISC-V (Future)
    RiscV32,
    RiscV32C,

    // Fallback
    Unknown,
}
```

**Methods**:
- `name() -> &str`: Human-readable name ("ARM Cortex-M4")
- `is_supported() -> bool`: Whether decoder exists
- `isa_family() -> &str`: ISA family ("ARM", "MIPS", "RISC-V")

#### `ChipFamily` Struct

Compile-time chip definition:

```rust
pub struct ChipFamily {
    pub family: &'static str,        // "STM32F4"
    pub manufacturer: &'static str,  // "STMicroelectronics"
    pub architecture: Architecture,  // ArmCortexM4
    pub supported: bool,             // true if decoder exists
    pub patterns: &'static [&'static str], // ["STM32F4", "stm32f4"]
    pub description: &'static str,   // Human-readable description
}
```

#### `ArchitectureInfo` Struct

Detection result with confidence scoring:

```rust
pub struct ArchitectureInfo {
    pub architecture: Architecture,      // Detected architecture
    pub chip_name: String,               // Matched family ("STM32F4")
    pub manufacturer: String,            // Manufacturer name
    pub supported: bool,                 // Decoder availability
    pub confidence: f32,                 // 0.0-1.0 match quality
    pub architecture_name: String,       // Human-readable name
    pub isa_family: String,              // ISA family
}
```

## Pattern Matching

### Match Quality Levels

The system uses a sophisticated 5-level matching hierarchy:

1. **Exact** (confidence: 1.0)
   - Input exactly matches pattern
   - Example: "STM32F4" matches "STM32F4"

2. **Case-Insensitive** (confidence: 0.95)
   - Input matches pattern ignoring case
   - Example: "stm32f4" matches "STM32F4"

3. **Substring** (confidence: 0.85)
   - Input contains pattern with correct case
   - Example: "STM32F407VG" contains "STM32F4"

4. **Substring Case-Insensitive** (confidence: 0.8)
   - Input contains pattern, case-insensitive
   - Example: "stm32f407vg" contains "STM32F4"

5. **Fuzzy** (confidence: 0.6)
   - Levenshtein distance ≤ 2 and < 30% of string length
   - Example: "nRF528" fuzzy matches "nRF52"

### Pattern Bonus

Longer patterns receive a small bonus (up to +0.1) to prefer specific matches:
- "nRF52840" pattern preferred over "nRF52" pattern

### Algorithm

```rust
pub fn detect_architecture(target_description: &str) -> ArchitectureInfo {
    // 1. Normalize input
    // 2. Scan all chip families and patterns
    // 3. Calculate match quality and confidence
    // 4. Apply pattern length bonus
    // 5. Return best match or Unknown
}
```

## Supported Chips

### STM32 (STMicroelectronics)

#### F-Series (Performance Line)
- **STM32F0** - Cortex-M0 (Entry-level)
- **STM32F1** - Cortex-M3 (Mainstream)
- **STM32F2** - Cortex-M3 (High-performance)
- **STM32F3** - Cortex-M4 (Mixed-signal)
- **STM32F4** - Cortex-M4 (High-performance with DSP/FPU)
- **STM32F7** - Cortex-M7 (Very high-performance)

#### L-Series (Ultra-Low-Power)
- **STM32L0** - Cortex-M0+
- **STM32L1** - Cortex-M3
- **STM32L4** - Cortex-M4
- **STM32L5** - Cortex-M33 (with TrustZone)

#### G-Series (Mainstream)
- **STM32G0** - Cortex-M0+
- **STM32G4** - Cortex-M4 (Motor control)

#### H-Series (Highest Performance)
- **STM32H7** - Cortex-M7 (Dual core)

### Nordic Semiconductor

- **nRF51** - Cortex-M0 (BLE)
- **nRF52805** - Cortex-M4 (BLE 5.1)
- **nRF52810** - Cortex-M4 (BLE 5)
- **nRF52811** - Cortex-M4 (Multiprotocol)
- **nRF52820** - Cortex-M4 (Multiprotocol)
- **nRF52832** - Cortex-M4 (Advanced multiprotocol)
- **nRF52833** - Cortex-M4 (BLE 5.1 + Thread)
- **nRF52840** - Cortex-M4 (Multiprotocol + USB)

### Microchip (Atmel SAM)

#### SAM D-Series
- **SAMD20** - Cortex-M0+
- **SAMD21** - Cortex-M0+ (Arduino Zero)
- **SAMD51** - Cortex-M4

#### SAM E-Series (Ethernet)
- **SAME51** - Cortex-M4
- **SAME53** - Cortex-M4
- **SAME54** - Cortex-M4

### NXP LPC Series

- **LPC11xx** - Cortex-M0 (Entry-level)
- **LPC13xx** - Cortex-M3 (with USB)
- **LPC15xx** - Cortex-M3 (High-performance)
- **LPC17xx** - Cortex-M3 (with Ethernet, includes LPC1768)
- **LPC18xx** - Cortex-M3 (Dual-core M3/M0)
- **LPC40xx** - Cortex-M4 (includes LPC4088)
- **LPC43xx** - Cortex-M4 (Dual-core M4/M0)
- **LPC54xxx** - Cortex-M4 (High-performance)
- **LPC55xx** - Cortex-M33 (with TrustZone)

### Raspberry Pi

- **RP2040** - Cortex-M0+ (Dual-core with PIO)

### Future Support (Unsupported)

#### MIPS (Microchip)
- **PIC32MX** - MIPS32 (marked `supported: false`)
- **PIC32MZ** - MIPS32 (marked `supported: false`)

#### RISC-V
- **GD32VF103** - RV32IMAC (marked `supported: false`)
- **ESP32-C3** - RV32 with WiFi/BLE (marked `supported: false`)
- **ESP32-C6** - RV32 with WiFi 6 (marked `supported: false`)

## API Reference

### Rust API

#### Core Functions

```rust
// Detect architecture from target description
pub fn detect_architecture(target_description: &str) -> ArchitectureInfo;

// Get all supported chip families
pub fn get_supported_chips() -> Vec<ArchitectureInfo>;

// Check if architecture has decoder
pub fn is_architecture_supported(architecture: Architecture) -> bool;
```

#### Example Usage

```rust
use battlemagic_analyzer::chips::{detect_architecture, Architecture};

// Basic detection
let info = detect_architecture("STM32F407VG");
assert_eq!(info.architecture, Architecture::ArmCortexM4);
assert_eq!(info.manufacturer, "STMicroelectronics");
assert_eq!(info.chip_name, "STM32F4");
assert!(info.confidence > 0.95);

// Check support
if info.supported {
    println!("Decoder available for {}", info.architecture_name);
} else {
    println!("Decoder not yet implemented");
}

// Handle low confidence
if info.confidence < 0.7 {
    println!("Warning: Low confidence match");
}
```

### WASM API

#### Exported Functions

```javascript
/**
 * Detect architecture from target description
 * @param {string} target_description - Target string from GDB/BMP
 * @returns {ArchitectureInfo} Detection result with confidence
 */
export function detect_architecture_wasm(target_description: string): ArchitectureInfo;

/**
 * Get list of all supported chips
 * @returns {ArchitectureInfo[]} Array of supported chip families
 */
export function get_supported_chips_wasm(): ArchitectureInfo[];

/**
 * Check if architecture is supported
 * @param {string} arch_name - Architecture name (case-insensitive)
 * @returns {boolean} true if decoder available
 */
export function is_architecture_supported_wasm(arch_name: string): boolean;
```

#### TypeScript Interface

```typescript
interface ArchitectureInfo {
  architecture: string;      // "ArmCortexM4"
  chipName: string;          // "STM32F4"
  manufacturer: string;      // "STMicroelectronics"
  supported: boolean;        // true if decoder available
  confidence: number;        // 0.0-1.0 match confidence
  architectureName: string;  // "ARM Cortex-M4"
  isaFamily: string;         // "ARM"
}
```

#### JavaScript Example

```javascript
import init, {
  detect_architecture_wasm,
  get_supported_chips_wasm,
  is_architecture_supported_wasm
} from './battlemagic_analyzer';

await init();

// Detect from GDB target description
const target = "STM32F407VG";
const info = detect_architecture_wasm(target);

console.log(`Architecture: ${info.architectureName}`);
console.log(`Manufacturer: ${info.manufacturer}`);
console.log(`Chip: ${info.chipName}`);
console.log(`Confidence: ${(info.confidence * 100).toFixed(0)}%`);

if (!info.supported) {
  console.warn('This architecture is not yet supported');
}

// List all supported chips
const chips = get_supported_chips_wasm();
console.log(`${chips.length} chip families supported:`);
chips.forEach(chip => {
  console.log(`  ${chip.chipName} (${chip.manufacturer})`);
});

// Check specific architecture
const hasM4Decoder = is_architecture_supported_wasm("ArmCortexM4");
console.log(`Cortex-M4 supported: ${hasM4Decoder}`);
```

## Adding New Chips

### Step 1: Add to Database

Edit `src/chips.rs` and add entry to `CHIP_DATABASE`:

```rust
pub const CHIP_DATABASE: &[ChipFamily] = &[
    // ... existing entries ...

    // Your new chip
    ChipFamily {
        family: "ESP32-H2",
        manufacturer: "Espressif",
        architecture: Architecture::RiscV32,
        supported: false,  // Set to true when decoder ready
        patterns: &["ESP32-H2", "esp32-h2", "ESP32H2"],
        description: "ESP32-H2 - RISC-V with BLE/Zigbee",
    },
];
```

### Step 2: Add Test Cases

Add to test suite:

```rust
#[test]
fn test_esp32h2_detection() {
    let info = detect_architecture("ESP32-H2");
    assert_eq!(info.architecture, Architecture::RiscV32);
    assert_eq!(info.manufacturer, "Espressif");
    assert_eq!(info.chip_name, "ESP32-H2");
}
```

### Step 3: Run Tests

```bash
cd packages/battlemagic-analyzer
cargo test chips::
```

### Guidelines

1. **Patterns**: Include common variants (case, spaces, dashes)
2. **Supported Flag**: Only set `true` if decoder exists
3. **Description**: Brief but informative
4. **Architecture**: Choose most specific Cortex-M variant
5. **Testing**: Add real-world target description tests

## Migration from TypeScript

### Old Code (TypeScript)

```typescript
// TargetInfo.ts - fragile string matching
private parseChipInfo(target: Target): ChipInfo {
  const desc = target.description;

  if (desc.includes('STM32')) {
    info.manufacturer = 'STMicroelectronics';
    if (desc.match(/STM32F[0-4]/)) {
      info.family = 'STM32F' + desc.match(/STM32F([0-4])/)?.[1];
    }
    // More fragile regex...
  }
  // Many more if-else chains...
}
```

### New Code (Rust via WASM)

```typescript
// Just call Rust function
import { detect_architecture_wasm } from './battlemagic_analyzer';

const info = detect_architecture_wasm(target.description);
// info.manufacturer, info.chipName, etc. already populated
```

### Benefits

1. **Type Safety**: No more typos in string matching
2. **Compile-Time Validation**: Catch errors before runtime
3. **Maintainability**: Single source of truth in const array
4. **Performance**: Zero-cost abstractions
5. **Testability**: Comprehensive Rust test suite
6. **Extensibility**: Community can easily add chips

### Migration Steps

1. **Deploy WASM Module**: Ensure `battlemagic_analyzer.wasm` is loaded
2. **Replace Detection Logic**: Use `detect_architecture_wasm()`
3. **Update UI**: Show confidence warnings for low matches
4. **Remove Old Code**: Delete TypeScript chip detection
5. **Add Tests**: Verify WASM integration

## Performance Characteristics

### Time Complexity

- **Detection**: O(n*m) where n = database size (~50), m = patterns per chip (~2-3)
- **Fuzzy Match**: O(len(input) * len(pattern)) Levenshtein distance
- **Typical**: < 1ms for detection on modern hardware

### Space Complexity

- **Database Size**: ~5KB compiled (embedded in WASM)
- **Runtime**: Zero heap allocation for detection
- **Result**: ~200 bytes per `ArchitectureInfo` (heap allocated)

### Optimization Notes

1. **Const Array**: Database lives in `.rodata` section
2. **Early Exit**: Returns immediately on exact match
3. **Pattern Order**: Place common chips first for faster detection
4. **No Regex**: Pure string operations, no regex engine overhead

## Confidence Score Interpretation

| Confidence | Meaning | Action |
|------------|---------|--------|
| 1.0 | Perfect match | Use with full confidence |
| 0.95-0.99 | Excellent match | Use normally |
| 0.85-0.94 | Good match | Use, no warning needed |
| 0.7-0.84 | Fair match | Show info notice to user |
| 0.5-0.69 | Weak match | Show warning to user |
| 0.0-0.49 | Very weak/no match | Show error, manual override |

### UI Recommendations

```typescript
function showConfidenceStatus(info: ArchitectureInfo) {
  if (info.confidence >= 0.95) {
    // Green check, no message
  } else if (info.confidence >= 0.7) {
    // Yellow info icon
    showInfo(`Detected ${info.chipName}, confidence: ${info.confidence.toFixed(2)}`);
  } else if (info.confidence > 0) {
    // Orange warning
    showWarning(`Weak match for ${info.chipName}, confidence: ${info.confidence.toFixed(2)}`);
  } else {
    // Red error
    showError('Unknown chip - manual architecture selection required');
  }
}
```

## Testing

### Run All Tests

```bash
cd packages/battlemagic-analyzer
cargo test chips::
```

### Run Specific Test

```bash
cargo test chips::tests::test_real_world_targets
```

### Test Coverage

- Exact matching
- Case-insensitive matching
- Substring matching
- Fuzzy matching
- Edge cases (empty, unknown, ambiguous)
- Real-world target descriptions
- Confidence scoring
- Pattern precedence

## Future Enhancements

### Planned Features

1. **MIPS Decoder**: Implement MIPS32/r2 disassembly
2. **RISC-V Decoder**: Implement RV32I/C disassembly
3. **Memory Layout DB**: Add typical flash/RAM layouts per chip
4. **Register Definitions**: SVD-like register database
5. **Peripheral Detection**: Identify peripherals from memory map
6. **Version Detection**: Detect specific chip revisions

### Community Contributions

The database is designed for easy community expansion:

1. Fork repository
2. Add chip to `CHIP_DATABASE` const array
3. Add test case
4. Submit PR with real-world target description

**Template**:
```rust
ChipFamily {
    family: "YOUR_CHIP",
    manufacturer: "MANUFACTURER",
    architecture: Architecture::ArmCortexM4, // Choose appropriate
    supported: true,  // Only if decoder exists
    patterns: &["PATTERN1", "pattern2"],
    description: "Brief description",
},
```

## Troubleshooting

### "Unknown chip" with 0 confidence

**Cause**: No pattern matches target description

**Solution**: Add chip to database or check spelling

### Low confidence (< 0.7)

**Cause**: Only fuzzy match or substring match

**Solution**: Add more specific pattern for this chip variant

### Wrong architecture detected

**Cause**: Ambiguous patterns or pattern order

**Solution**: Add more specific pattern with higher precedence

### WASM function not found

**Cause**: WASM module not initialized

**Solution**: Ensure `await init()` called before using functions

## License

MIT License - Same as battlemagic-analyzer package
