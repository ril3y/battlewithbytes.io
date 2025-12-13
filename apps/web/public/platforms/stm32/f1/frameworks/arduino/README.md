# Arduino Framework for STM32F1

Arduino framework support for STM32F103 (Blue Pill) in BattleForge IDE.

## Overview

This directory contains the Arduino framework definition and examples for STM32F1 microcontrollers. It enables Arduino-style programming with familiar functions like `digitalWrite()`, `analogRead()`, and `Serial.print()`.

**Based on:** STM32duino 2.7.1
**Repository:** https://github.com/stm32duino/Arduino_Core_STM32
**License:** LGPL-2.1 / BSD-3-Clause

## Directory Contents

```
arduino/
├── framework.json         - Framework configuration and metadata
├── core.tar.gz           - Arduino core bundle (to be created)
├── examples/             - Example Arduino sketches
│   ├── arduino_blink.ino
│   ├── arduino_serial.ino
│   ├── arduino_analog.ino
│   └── arduino_pwm.ino
└── README.md            - This file
```

## Framework Configuration

The `framework.json` file defines:

- **Core Bundle:** Location and contents of Arduino core files
- **Compiler Flags:** `-std=gnu++14`, `-fno-rtti`, `-fno-exceptions`, `-Os`
- **Defines:** `ARDUINO=10819`, `STM32F103xB`, HAL module enables
- **Include Paths:** cores, variants, HAL, CMSIS directories
- **Features:** Digital I/O, Analog I/O, Serial, PWM, Timers, Interrupts
- **Pin Mappings:** Blue Pill pin definitions

## Core Bundle (core.tar.gz)

**Status:** Not yet created - see packaging documentation

The core bundle will contain:
- Arduino API implementation (`cores/arduino/`)
- Blue Pill variant files (`variants/BLUEPILL_F103C8/`)
- STM32F1 HAL drivers (`system/Drivers/STM32F1xx_HAL_Driver/`)
- CMSIS headers (`system/Drivers/CMSIS/`)

**Estimated Size:** 200-300 KB (compressed)

### Creating the Bundle

See complete instructions in:
- `battlewithbytes.io/apps/web/src/app/tools/battleforge/docs/ARDUINO_CORE_PACKAGING.md`

Quick steps:
```bash
# Clone STM32duino repository
git clone --depth 1 --branch 2.7.1 https://github.com/stm32duino/Arduino_Core_STM32.git

# Run packaging script (see ARDUINO_CORE_PACKAGING.md)
./package_arduino_core.sh

# Copy to this directory
cp arduino_core_stm32f1_2.7.1/core.tar.gz ./core.tar.gz

# Generate checksum
sha256sum core.tar.gz

# Update framework.json with checksum
```

## Example Sketches

### arduino_blink.ino
Classic LED blink using the onboard LED (PC13). Perfect for testing basic Arduino functionality.

### arduino_serial.ino
Serial communication example. Prints messages to serial monitor demonstrating `Serial.print()` and `millis()`.

### arduino_analog.ino
Reads analog voltage from PA0 using the 12-bit ADC. Shows voltage calculation and percentage conversion.

### arduino_pwm.ino
Fades an LED using PWM on PA0. Demonstrates `analogWrite()` for smooth brightness control.

## Supported Arduino API

### Core Functions
- `setup()`, `loop()` - Standard Arduino sketch structure
- `pinMode()`, `digitalWrite()`, `digitalRead()` - Digital I/O
- `analogRead()`, `analogWrite()` - Analog I/O (12-bit ADC, 16-bit PWM)
- `delay()`, `delayMicroseconds()` - Timing
- `millis()`, `micros()` - Uptime counters

### Serial Communication
- `Serial.begin()`, `Serial.end()`
- `Serial.print()`, `Serial.println()`
- `Serial.read()`, `Serial.available()`

### Advanced Functions
- `attachInterrupt()`, `detachInterrupt()` - External interrupts
- `tone()`, `noTone()` - Tone generation
- `pulseIn()` - Pulse width measurement
- `shiftOut()`, `shiftIn()` - Bit shifting

### String and Math
- `String` class - Arduino string handling
- `map()`, `constrain()` - Math utilities
- `min()`, `max()`, `abs()` - Basic math

## Pin Definitions (Blue Pill)

### Digital Pins
37 GPIO pins: PA0-PA15, PB0-PB15, PC13-PC15

### Analog Input Pins
10 ADC channels (12-bit): PA0-PA7, PB0-PB1

### PWM Pins
12 PWM outputs (16-bit): PA0-PA3, PA6-PA10, PB0-PB1

### Special Pins
- `LED_BUILTIN` = PC13 (onboard LED, active LOW)
- `TX` = PA9, `RX` = PA10 (Serial)
- `SDA` = PB7, `SCL` = PB6 (I2C)
- `MOSI` = PA7, `MISO` = PA6, `SCK` = PA5, `SS` = PA4 (SPI)

## Important Differences from Arduino Uno

### Voltage Levels
- **STM32:** 3.3V logic (NOT 5V tolerant on most pins!)
- **Arduino Uno:** 5V logic
- Always use 3.3V for sensors and peripherals

### ADC Resolution
- **STM32:** 12-bit (0-4095)
- **Arduino Uno:** 10-bit (0-1023)
- Use `analogRead()` normally - just expect higher values

### PWM Resolution
- **STM32:** 16-bit available (0-65535)
- **Arduino Uno:** 8-bit (0-255)
- `analogWrite()` accepts 0-255 for compatibility

### Clock Speed
- **STM32F103:** 72 MHz
- **Arduino Uno:** 16 MHz
- Faster execution but timing-sensitive code may need adjustment

## Compilation Requirements

### Preprocessor
Arduino `.ino` files require preprocessing:
1. Generate function prototypes
2. Add `#include <Arduino.h>`
3. Concatenate multiple .ino files

See `ARDUINO_QUICK_REFERENCE.md` for implementation details.

### Compiler Flags
```bash
--target=thumbv7m-none-eabi
-mcpu=cortex-m3
-mthumb
-std=gnu++14
-fno-rtti
-fno-exceptions
-Os
```

### Linker Settings
```bash
-Wl,--gc-sections
-specs=nano.specs
-specs=nosys.specs
-T STM32F103XB_FLASH.ld
```

## Memory Constraints

- **Flash:** 64 KB total (~60 KB available)
- **RAM:** 20 KB total (~18 KB available)
- Use `-Os` optimization to minimize code size
- Large sketches may need optimization or external flash

## Extending Functionality

The minimal bundle includes basic peripherals. Additional HAL modules can be added:

- **I2C/Wire:** `hal_i2c` module (~45 KB)
- **SPI:** `hal_spi` module (~38 KB)
- **USB:** `hal_pcd`, `ll_usb` modules (~72 KB)
- **RTC:** `hal_rtc` module (~42 KB)
- **CAN:** `hal_can` module (~35 KB)

Add module defines to `framework.json` and include HAL files in bundle.

## Documentation

### Full Documentation
- **Packaging Guide:** `apps/web/src/app/tools/battleforge/docs/ARDUINO_CORE_PACKAGING.md`
- **Quick Reference:** `apps/web/src/app/tools/battleforge/docs/ARDUINO_QUICK_REFERENCE.md`

### External Resources
- **Arduino API:** https://www.arduino.cc/reference/en/
- **STM32duino Wiki:** https://github.com/stm32duino/wiki/wiki
- **STM32duino GitHub:** https://github.com/stm32duino/Arduino_Core_STM32
- **STM32F103 Datasheet:** https://www.st.com/resource/en/datasheet/stm32f103c8.pdf

## License

STM32duino Arduino Core is licensed under:
- **LGPL 2.1** - Core library files
- **BSD-3-Clause** - HAL driver files

Include appropriate LICENSE files when distributing the core bundle.

## Next Steps

1. Create `core.tar.gz` bundle using packaging script
2. Update `framework.json` with actual checksum
3. Implement .ino preprocessor in BattleForge
4. Test compilation with example sketches
5. Validate Arduino API compatibility
6. Add support for Arduino libraries

---

**Created:** 2025-12-13
**Version:** 2.7.1
**Maintainer:** BattleForge IDE Team
