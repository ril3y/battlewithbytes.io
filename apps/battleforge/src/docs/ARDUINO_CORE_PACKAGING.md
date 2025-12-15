# STM32duino Arduino Core Packaging Guide

This document describes how to package the minimal STM32duino Arduino core files needed for compiling Arduino sketches for STM32F1 (Blue Pill) in the BattleForge IDE.

## Overview

The STM32duino project provides Arduino framework support for STM32 microcontrollers. For BattleForge, we need to extract and package only the essential files required for STM32F103C8 (Blue Pill) compilation.

**Repository:** https://github.com/stm32duino/Arduino_Core_STM32
**Version:** 2.7.1
**Target Board:** STM32F103C8T6 (Blue Pill)
**Architecture:** ARM Cortex-M3

## Minimum Required Files

### 1. Core Arduino Files (`cores/arduino/`)

The cores directory contains the Arduino API implementation. All files are needed for full Arduino compatibility:

**Essential Core Files (~40 files):**

- `Arduino.h` - Main Arduino API header (REQUIRED)
- `main.cpp` - Entry point with setup()/loop() structure (REQUIRED)
- `HardwareSerial.h/cpp` - Serial communication
- `Print.h/cpp` - Print functionality base class
- `Stream.h/cpp` - Stream base class
- `WString.h/cpp` - Arduino String class
- `wiring_digital.h/c` - digitalWrite(), digitalRead()
- `wiring_analog.h/c` - analogRead(), analogWrite()
- `wiring_time.h/c` - delay(), millis(), micros()
- `wiring_pulse.h/cpp` - pulseIn()
- `wiring_shift.h/c` - shiftOut(), shiftIn()
- `WInterrupts.h/cpp` - attachInterrupt()
- `Tone.h/cpp` - tone() function
- `WMath.h/cpp` - Math utilities (min, max, map, etc.)
- `WCharacter.h` - Character utilities
- `binary.h` - Binary literal macros
- `pins_arduino.h` - Pin definitions interface
- `board.h/c` - Board configuration
- `variant.h` - Board variant configuration
- `abi.cpp` - C++ ABI support for new/delete
- `hooks.c` - Weak symbol hooks (optional overrides)
- `itoa.h/c` - Integer to ASCII conversion
- `RingBuffer.h/cpp` - Circular buffer for Serial
- `Printable.h` - Interface for printable objects
- `IPAddress.h/cpp` - IP address handling
- `Client.h`, `Server.h`, `Udp.h` - Network interfaces

**Optional/Advanced Files:**

- `core_debug.h/c` - Debug utilities
- `wiring_constants.h` - Arduino constants (HIGH, LOW, etc.)
- `wiring_private.h` - Internal functions
- `utils.h` - Utility macros

**Estimated Size:** ~200-300 KB (source files)

### 2. Variant Files (`variants/STM32F1xx/F103C8T_F103CB(T-U)/`)

Board-specific pin mappings and configurations. For Blue Pill, we need:

**Required Variant Files:**

- `variant_PILL_F103Cx.cpp` - Blue Pill pin definitions (REQUIRED)
- `variant_PILL_F103Cx.h` - Blue Pill header (REQUIRED)
- `PeripheralPins.c` - Peripheral to pin mapping (REQUIRED)
- `PinNamesVar.h` - Pin name enumerations (REQUIRED)
- `ldscript.ld` - Linker script for memory layout (REQUIRED)
- `generic_clock.c` - Clock initialization (REQUIRED)

**Alternative Variants (Optional):**

- `variant_generic.cpp/.h` - Generic STM32F103 support
- `variant_MAPLEMINI_F103CB.cpp/.h` - Maple Mini board
- Other board variants can be omitted for minimal bundle

**Estimated Size:** ~50-100 KB

### 3. System Files (`system/STM32F1xx/`)

HAL configuration and system initialization:

**Required System Files:**

- `stm32f1xx_hal_conf.h` - HAL configuration (REQUIRED)
- `system_stm32f1xx.c` - System clock and init (REQUIRED)

**Estimated Size:** ~20-30 KB

### 4. CMSIS Device Files (`system/Drivers/CMSIS/Device/ST/STM32F1xx/`)

ARM CMSIS standard device definitions:

**Include Directory Files:**

- `stm32f103xb.h` - STM32F103C8 device definitions (REQUIRED for Blue Pill)
- `stm32f1xx.h` - Main CMSIS header (REQUIRED)
- `system_stm32f1xx.h` - System header (REQUIRED)

**Optional Device Headers (for other variants):**

- `stm32f100xb.h`, `stm32f100xe.h` - Value line
- `stm32f101x*.h` - Access line
- `stm32f102x*.h` - USB access line
- `stm32f103x6.h`, `stm32f103xe.h`, `stm32f103xg.h` - Other performance variants
- `stm32f105xc.h`, `stm32f107xc.h` - Connectivity line

**Source/Templates:**

- `system_stm32f1xx.c` - System initialization template

**Estimated Size:** ~100-150 KB (minimal), ~400-500 KB (all variants)

### 5. CMSIS Core Files (`system/Drivers/CMSIS/Include/`)

ARM Cortex-M core definitions (architecture-specific, not device-specific):

**Required CMSIS Core Files:**

- `core_cm3.h` - Cortex-M3 core definitions (REQUIRED)
- `cmsis_compiler.h` - Compiler abstraction (REQUIRED)
- `cmsis_version.h` - CMSIS version info (REQUIRED)
- `cmsis_gcc.h` - GCC-specific macros (REQUIRED for Clang/GCC)

**Optional Core Files:**

- `core_cm0.h`, `core_cm4.h`, etc. - Other Cortex-M cores
- `mpu_armv7.h` - Memory Protection Unit (not used on F103C8)

**Estimated Size:** ~50-100 KB

### 6. HAL Driver Files (`system/Drivers/STM32F1xx_HAL_Driver/`)

Hardware Abstraction Layer for peripherals. For minimal Arduino support:

**Essential HAL Headers (Inc/):**

- `stm32f1xx_hal.h` - Main HAL header (REQUIRED)
- `stm32f1xx_hal_def.h` - HAL common definitions (REQUIRED)
- `stm32f1xx_hal_gpio.h` - GPIO control (REQUIRED)
- `stm32f1xx_hal_rcc.h` - Reset and Clock Control (REQUIRED)
- `stm32f1xx_hal_cortex.h` - Cortex-M3 HAL (REQUIRED)
- `stm32f1xx_hal_uart.h` - UART for Serial (REQUIRED)
- `stm32f1xx_hal_tim.h` - Timers for PWM/timing (REQUIRED)
- `stm32f1xx_hal_adc.h` - ADC for analogRead()
- `stm32f1xx_hal_dma.h` - DMA support
- `stm32f1xx_hal_flash.h` - Flash memory access

**Optional HAL Headers:**

- `stm32f1xx_hal_i2c.h` - I2C/Wire library
- `stm32f1xx_hal_spi.h` - SPI library
- `stm32f1xx_hal_can.h` - CAN bus
- `stm32f1xx_hal_dac.h` - DAC output
- `stm32f1xx_hal_rtc.h` - Real-time clock
- `stm32f1xx_hal_pwr.h` - Power management
- `stm32f1xx_hal_usb.h` - USB support
- ~50+ additional peripheral headers

**HAL Source Files (Src/):**

- Corresponding `.c` files for each header
- Each peripheral has implementation (~10-50 KB per module)

**LL (Low-Level) Drivers:**

- Alternative register-level API (optional, can be omitted)

**Estimated Size:**

- Minimal HAL (GPIO, RCC, UART, TIM): ~200-300 KB
- Full HAL (all peripherals): ~2-3 MB

### 7. SrcWrapper Files (Optional)

The `libraries/SrcWrapper/` directory contains Arduino-style wrappers but is typically NOT needed in the core bundle. The cores/arduino already provides the Arduino API.

## Directory Structure for Bundle

```
core.tar.gz
├── cores/
│   └── arduino/
│       ├── Arduino.h
│       ├── main.cpp
│       ├── HardwareSerial.h/cpp
│       ├── Print.h/cpp
│       ├── Stream.h/cpp
│       ├── WString.h/cpp
│       ├── wiring_*.h/c
│       ├── WInterrupts.h/cpp
│       ├── Tone.h/cpp
│       ├── WMath.h/cpp
│       ├── board.h/c
│       └── [all other core files]
│
├── variants/
│   └── BLUEPILL_F103C8/      # Renamed for clarity
│       ├── variant_PILL_F103Cx.cpp
│       ├── variant_PILL_F103Cx.h
│       ├── PeripheralPins.c
│       ├── PinNamesVar.h
│       ├── ldscript.ld
│       └── generic_clock.c
│
└── system/
    ├── STM32F1xx/
    │   ├── stm32f1xx_hal_conf.h
    │   └── system_stm32f1xx.c
    │
    └── Drivers/
        ├── CMSIS/
        │   ├── Include/           # Core CMSIS headers
        │   │   ├── core_cm3.h
        │   │   ├── cmsis_compiler.h
        │   │   ├── cmsis_version.h
        │   │   └── cmsis_gcc.h
        │   │
        │   └── Device/ST/STM32F1xx/
        │       ├── Include/
        │       │   ├── stm32f103xb.h
        │       │   ├── stm32f1xx.h
        │       │   └── system_stm32f1xx.h
        │       │
        │       └── Source/Templates/
        │           └── system_stm32f1xx.c
        │
        └── STM32F1xx_HAL_Driver/
            ├── Inc/
            │   ├── stm32f1xx_hal.h
            │   ├── stm32f1xx_hal_def.h
            │   ├── stm32f1xx_hal_gpio.h
            │   ├── stm32f1xx_hal_rcc.h
            │   ├── stm32f1xx_hal_cortex.h
            │   ├── stm32f1xx_hal_uart.h
            │   ├── stm32f1xx_hal_tim.h
            │   └── [other HAL headers as needed]
            │
            └── Src/
                ├── stm32f1xx_hal.c
                ├── stm32f1xx_hal_gpio.c
                ├── stm32f1xx_hal_rcc.c
                ├── stm32f1xx_hal_cortex.c
                ├── stm32f1xx_hal_uart.c
                ├── stm32f1xx_hal_tim.c
                └── [corresponding source files]
```

## File Sizes and Bundle Estimates

### Minimal Bundle (Basic Arduino Support)

**Includes:** Core files, Blue Pill variant, essential HAL (GPIO, RCC, UART, TIM), CMSIS

| Component                     | Size Estimate   |
| ----------------------------- | --------------- |
| cores/arduino/                | ~300 KB         |
| variants/BLUEPILL_F103C8/     | ~100 KB         |
| system/STM32F1xx/             | ~30 KB          |
| CMSIS Core + Device           | ~150 KB         |
| HAL Driver (minimal)          | ~300 KB         |
| **Total (uncompressed)**      | **~880 KB**     |
| **Total (tar.gz compressed)** | **~200-300 KB** |

### Standard Bundle (Common Peripherals)

**Adds:** I2C, SPI, ADC, DMA, Flash

| Component                     | Additional Size |
| ----------------------------- | --------------- |
| Additional HAL modules        | ~400 KB         |
| **Total (uncompressed)**      | **~1.3 MB**     |
| **Total (tar.gz compressed)** | **~350-450 KB** |

### Full Bundle (All Peripherals)

**Includes:** All HAL drivers, multiple variants, all device headers

| Component                     | Size Estimate        |
| ----------------------------- | -------------------- |
| Complete HAL Driver           | ~3 MB                |
| All device variants           | ~500 KB              |
| Multiple board variants       | ~300 KB              |
| **Total (uncompressed)**      | **~4.5 MB**          |
| **Total (tar.gz compressed)** | **~800 KB - 1.2 MB** |

## Recommended Approach

**Start with Minimal Bundle** (~200-300 KB compressed)

- Fastest download and initialization
- Covers basic Arduino functionality
- Can be expanded later with modular HAL components

## Script Commands to Create the Bundle

### 1. Clone the Repository

```bash
# Clone the STM32duino core repository
git clone --depth 1 --branch 2.7.1 https://github.com/stm32duino/Arduino_Core_STM32.git
cd Arduino_Core_STM32
```

### 2. Create Working Directory

```bash
# Create temporary packaging directory
mkdir -p arduino_core_package
cd arduino_core_package
```

### 3. Copy Core Files

```bash
# Copy all core Arduino files
mkdir -p cores/arduino
cp -r ../cores/arduino/* cores/arduino/

# Optional: Remove non-essential files to reduce size
# rm cores/arduino/CMakeLists.txt
# rm cores/arduino/README.md
```

### 4. Copy Blue Pill Variant

```bash
# Copy Blue Pill variant files
mkdir -p variants/BLUEPILL_F103C8
cp ../variants/STM32F1xx/F103C8T_F103CB\(T-U\)/variant_PILL_F103Cx.* variants/BLUEPILL_F103C8/
cp ../variants/STM32F1xx/F103C8T_F103CB\(T-U\)/PeripheralPins.c variants/BLUEPILL_F103C8/
cp ../variants/STM32F1xx/F103C8T_F103CB\(T-U\)/PinNamesVar.h variants/BLUEPILL_F103C8/
cp ../variants/STM32F1xx/F103C8T_F103CB\(T-U\)/ldscript.ld variants/BLUEPILL_F103C8/
cp ../variants/STM32F1xx/F103C8T_F103CB\(T-U\)/generic_clock.c variants/BLUEPILL_F103C8/
```

### 5. Copy System Files

```bash
# Copy STM32F1 system files
mkdir -p system/STM32F1xx
cp ../system/STM32F1xx/stm32f1xx_hal_conf.h system/STM32F1xx/
cp ../system/STM32F1xx/system_stm32f1xx.c system/STM32F1xx/
```

### 6. Copy CMSIS Files

```bash
# Copy CMSIS Core headers
mkdir -p system/Drivers/CMSIS/Include
cp ../system/Drivers/CMSIS/Include/core_cm3.h system/Drivers/CMSIS/Include/
cp ../system/Drivers/CMSIS/Include/cmsis_compiler.h system/Drivers/CMSIS/Include/
cp ../system/Drivers/CMSIS/Include/cmsis_version.h system/Drivers/CMSIS/Include/
cp ../system/Drivers/CMSIS/Include/cmsis_gcc.h system/Drivers/CMSIS/Include/

# Copy CMSIS Device files for STM32F1
mkdir -p system/Drivers/CMSIS/Device/ST/STM32F1xx/Include
cp ../system/Drivers/CMSIS/Device/ST/STM32F1xx/Include/stm32f103xb.h system/Drivers/CMSIS/Device/ST/STM32F1xx/Include/
cp ../system/Drivers/CMSIS/Device/ST/STM32F1xx/Include/stm32f1xx.h system/Drivers/CMSIS/Device/ST/STM32F1xx/Include/
cp ../system/Drivers/CMSIS/Device/ST/STM32F1xx/Include/system_stm32f1xx.h system/Drivers/CMSIS/Device/ST/STM32F1xx/Include/

# Copy system template
mkdir -p system/Drivers/CMSIS/Device/ST/STM32F1xx/Source/Templates
cp ../system/Drivers/CMSIS/Device/ST/STM32F1xx/Source/Templates/system_stm32f1xx.c system/Drivers/CMSIS/Device/ST/STM32F1xx/Source/Templates/
```

### 7. Copy HAL Driver Files (Minimal Set)

```bash
# Create HAL directories
mkdir -p system/Drivers/STM32F1xx_HAL_Driver/Inc
mkdir -p system/Drivers/STM32F1xx_HAL_Driver/Src

# Copy essential HAL headers
for module in hal hal_def hal_gpio hal_rcc hal_cortex hal_uart hal_tim hal_adc hal_dma hal_flash; do
  cp ../system/Drivers/STM32F1xx_HAL_Driver/Inc/stm32f1xx_${module}.h system/Drivers/STM32F1xx_HAL_Driver/Inc/
done

# Copy corresponding source files
for module in hal gpio rcc cortex uart tim adc dma flash; do
  cp ../system/Drivers/STM32F1xx_HAL_Driver/Src/stm32f1xx_hal_${module}.c system/Drivers/STM32F1xx_HAL_Driver/Src/
done

# Copy extended variants if they exist
for module in gpio_ex rcc_ex tim_ex uart_ex adc_ex flash_ex; do
  if [ -f "../system/Drivers/STM32F1xx_HAL_Driver/Inc/stm32f1xx_hal_${module}.h" ]; then
    cp ../system/Drivers/STM32F1xx_HAL_Driver/Inc/stm32f1xx_hal_${module}.h system/Drivers/STM32F1xx_HAL_Driver/Inc/
  fi
  if [ -f "../system/Drivers/STM32F1xx_HAL_Driver/Src/stm32f1xx_hal_${module}.c" ]; then
    cp ../system/Drivers/STM32F1xx_HAL_Driver/Src/stm32f1xx_hal_${module}.c system/Drivers/STM32F1xx_HAL_Driver/Src/
  fi
done
```

### 8. Create Tarball

```bash
# Create compressed tarball
tar -czf core.tar.gz cores/ variants/ system/

# Verify contents
tar -tzf core.tar.gz | head -20
```

### 9. Generate Checksums

```bash
# Generate SHA256 checksum
sha256sum core.tar.gz > core.tar.gz.sha256

# Display checksum
cat core.tar.gz.sha256

# Get file size
ls -lh core.tar.gz
```

### 10. Complete Packaging Script

Save as `package_arduino_core.sh`:

```bash
#!/bin/bash
set -e

REPO_URL="https://github.com/stm32duino/Arduino_Core_STM32.git"
VERSION="2.7.1"
OUTPUT_DIR="arduino_core_stm32f1_${VERSION}"

echo "Packaging STM32duino Arduino Core for STM32F1 (Blue Pill)..."

# Clone repository
if [ ! -d "Arduino_Core_STM32" ]; then
  echo "Cloning repository..."
  git clone --depth 1 --branch ${VERSION} ${REPO_URL}
fi

# Create output directory
rm -rf ${OUTPUT_DIR}
mkdir -p ${OUTPUT_DIR}
cd ${OUTPUT_DIR}

echo "Copying core files..."
mkdir -p cores/arduino
cp -r ../Arduino_Core_STM32/cores/arduino/* cores/arduino/

echo "Copying Blue Pill variant..."
mkdir -p variants/BLUEPILL_F103C8
VARIANT_SRC="../Arduino_Core_STM32/variants/STM32F1xx/F103C8T_F103CB(T-U)"
cp ${VARIANT_SRC}/variant_PILL_F103Cx.* variants/BLUEPILL_F103C8/
cp ${VARIANT_SRC}/PeripheralPins.c variants/BLUEPILL_F103C8/
cp ${VARIANT_SRC}/PinNamesVar.h variants/BLUEPILL_F103C8/
cp ${VARIANT_SRC}/ldscript.ld variants/BLUEPILL_F103C8/
cp ${VARIANT_SRC}/generic_clock.c variants/BLUEPILL_F103C8/

echo "Copying system files..."
mkdir -p system/STM32F1xx
cp ../Arduino_Core_STM32/system/STM32F1xx/stm32f1xx_hal_conf.h system/STM32F1xx/
cp ../Arduino_Core_STM32/system/STM32F1xx/system_stm32f1xx.c system/STM32F1xx/

echo "Copying CMSIS files..."
mkdir -p system/Drivers/CMSIS/Include
CMSIS_SRC="../Arduino_Core_STM32/system/Drivers/CMSIS"
cp ${CMSIS_SRC}/Include/core_cm3.h system/Drivers/CMSIS/Include/
cp ${CMSIS_SRC}/Include/cmsis_compiler.h system/Drivers/CMSIS/Include/
cp ${CMSIS_SRC}/Include/cmsis_version.h system/Drivers/CMSIS/Include/
cp ${CMSIS_SRC}/Include/cmsis_gcc.h system/Drivers/CMSIS/Include/

mkdir -p system/Drivers/CMSIS/Device/ST/STM32F1xx/Include
DEVICE_SRC="${CMSIS_SRC}/Device/ST/STM32F1xx"
cp ${DEVICE_SRC}/Include/stm32f103xb.h system/Drivers/CMSIS/Device/ST/STM32F1xx/Include/
cp ${DEVICE_SRC}/Include/stm32f1xx.h system/Drivers/CMSIS/Device/ST/STM32F1xx/Include/
cp ${DEVICE_SRC}/Include/system_stm32f1xx.h system/Drivers/CMSIS/Device/ST/STM32F1xx/Include/

mkdir -p system/Drivers/CMSIS/Device/ST/STM32F1xx/Source/Templates
cp ${DEVICE_SRC}/Source/Templates/system_stm32f1xx.c system/Drivers/CMSIS/Device/ST/STM32F1xx/Source/Templates/

echo "Copying HAL driver files..."
mkdir -p system/Drivers/STM32F1xx_HAL_Driver/{Inc,Src}
HAL_SRC="../Arduino_Core_STM32/system/Drivers/STM32F1xx_HAL_Driver"

# Essential HAL modules
MODULES="hal hal_def hal_gpio hal_rcc hal_cortex hal_uart hal_tim hal_adc hal_dma hal_flash"
for module in ${MODULES}; do
  cp ${HAL_SRC}/Inc/stm32f1xx_${module}.h system/Drivers/STM32F1xx_HAL_Driver/Inc/ 2>/dev/null || true
done

MODULES_SRC="hal gpio rcc cortex uart tim adc dma flash"
for module in ${MODULES_SRC}; do
  cp ${HAL_SRC}/Src/stm32f1xx_hal_${module}.c system/Drivers/STM32F1xx_HAL_Driver/Src/ 2>/dev/null || true
done

# Extended variants
MODULES_EX="gpio_ex rcc_ex tim_ex uart_ex adc_ex flash_ex dma_ex"
for module in ${MODULES_EX}; do
  cp ${HAL_SRC}/Inc/stm32f1xx_hal_${module}.h system/Drivers/STM32F1xx_HAL_Driver/Inc/ 2>/dev/null || true
  cp ${HAL_SRC}/Src/stm32f1xx_hal_${module}.c system/Drivers/STM32F1xx_HAL_Driver/Src/ 2>/dev/null || true
done

echo "Creating tarball..."
tar -czf core.tar.gz cores/ variants/ system/

echo "Generating checksum..."
sha256sum core.tar.gz > core.tar.gz.sha256

echo ""
echo "Package created successfully!"
echo "File: core.tar.gz"
echo "Size: $(ls -lh core.tar.gz | awk '{print $5}')"
echo "SHA256: $(cat core.tar.gz.sha256)"
echo ""
echo "Contents preview:"
tar -tzf core.tar.gz | head -20
```

### 11. Run the Script

```bash
chmod +x package_arduino_core.sh
./package_arduino_core.sh
```

## Checksum Generation Command

```bash
# Generate SHA256 checksum
sha256sum core.tar.gz

# Or for verification
sha256sum -c core.tar.gz.sha256
```

## Verification Steps

After creating the bundle:

1. **Check file size:**

   ```bash
   ls -lh core.tar.gz
   # Should be ~200-400 KB for minimal bundle
   ```

2. **List contents:**

   ```bash
   tar -tzf core.tar.gz
   ```

3. **Test extraction:**

   ```bash
   mkdir test_extract
   tar -xzf core.tar.gz -C test_extract
   tree test_extract
   ```

4. **Verify key files exist:**
   ```bash
   # Check for essential files
   tar -tzf core.tar.gz | grep -E "(Arduino.h|main.cpp|variant_PILL|stm32f103xb.h|stm32f1xx_hal.h)"
   ```

## Integration with BattleForge

The packaged `core.tar.gz` should be placed in:

```
public/platforms/stm32/f1/frameworks/arduino/core.tar.gz
```

The framework.json file will reference this bundle and specify how BattleForge should use it during compilation.

## Additional Considerations

### .ino File Preprocessing

Arduino `.ino` files need preprocessing:

1. Function prototypes must be auto-generated
2. File must be wrapped with `#include <Arduino.h>`
3. Multiple .ino files are concatenated

BattleForge will need to implement this preprocessing before passing to the compiler.

### Library Dependencies

Some Arduino libraries may require additional HAL modules. Consider:

- Wire (I2C): needs `stm32f1xx_hal_i2c.h/c`
- SPI: needs `stm32f1xx_hal_spi.h/c`
- Servo: needs advanced timer features

### Alternative: Modular Approach

Instead of one large bundle, consider:

- `core_minimal.tar.gz` - Basic Arduino + GPIO + Serial
- `hal_i2c.tar.gz` - I2C HAL module
- `hal_spi.tar.gz` - SPI HAL module
- `hal_usb.tar.gz` - USB HAL module

This allows on-demand loading of peripheral support.

## References

- **STM32duino Core:** https://github.com/stm32duino/Arduino_Core_STM32
- **STM32F1 HAL:** https://github.com/STMicroelectronics/STM32CubeF1
- **CMSIS:** https://github.com/ARM-software/CMSIS_5
- **Arduino API Reference:** https://www.arduino.cc/reference/en/
- **STM32F103 Datasheet:** https://www.st.com/resource/en/datasheet/stm32f103c8.pdf

## License Notes

STM32duino is released under LGPL 2.1 and BSD-3-Clause licenses. Ensure compliance when redistributing the packaged core files. Include LICENSE files from the original repository in the bundle.
