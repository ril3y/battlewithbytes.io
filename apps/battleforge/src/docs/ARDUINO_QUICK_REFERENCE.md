# Arduino Framework Quick Reference

Quick reference for implementing Arduino framework support in BattleForge.

## Key Files Created

1. **Documentation:** `docs/ARDUINO_CORE_PACKAGING.md` (21 KB)
   - Complete packaging guide with file lists
   - Shell script to create core.tar.gz bundle
   - Size estimates and bundle configurations

2. **Framework Definition:** `public/platforms/stm32/f1/frameworks/arduino/framework.json` (9.7 KB)
   - Framework metadata and configuration
   - Compiler/linker flags
   - Feature descriptions and API reference
   - Pin mappings for Blue Pill

## Bundle Summary

### Minimal Core Bundle (~200-300 KB compressed)

**Contents:**

- `cores/arduino/` - Arduino API implementation (40+ files)
- `variants/BLUEPILL_F103C8/` - Blue Pill pin definitions
- `system/STM32F1xx/` - HAL configuration
- `system/Drivers/CMSIS/` - ARM Cortex-M3 definitions
- `system/Drivers/STM32F1xx_HAL_Driver/` - Essential HAL drivers

**Essential HAL Modules Included:**

- GPIO (digital I/O)
- RCC (clock control)
- UART (Serial)
- TIM (timers/PWM)
- ADC (analog input)
- DMA (direct memory access)
- FLASH (flash memory)
- CORTEX (core functions)

## Framework Specifications

### Compiler Flags

```bash
-std=gnu++14
-fno-rtti
-fno-exceptions
-fno-threadsafe-statics
-ffunction-sections
-fdata-sections
-Os
```

### Required Defines

```c
ARDUINO=10819
ARDUINO_BLUEPILL_F103C8
ARDUINO_ARCH_STM32
STM32F1xx
STM32F103xB
HAL_UART_MODULE_ENABLED
HAL_GPIO_MODULE_ENABLED
HAL_RCC_MODULE_ENABLED
HAL_CORTEX_MODULE_ENABLED
HAL_TIM_MODULE_ENABLED
HAL_ADC_MODULE_ENABLED
```

### Include Paths

```
cores/arduino
variants/BLUEPILL_F103C8
system/STM32F1xx
system/Drivers/STM32F1xx_HAL_Driver/Inc
system/Drivers/CMSIS/Device/ST/STM32F1xx/Include
system/Drivers/CMSIS/Include
```

### Linker Flags

```bash
-Wl,--gc-sections
-Wl,--print-memory-usage
-specs=nano.specs
-specs=nosys.specs
```

## Arduino .ino Preprocessing

Arduino sketches (`.ino` files) require preprocessing before compilation:

### Preprocessing Steps

1. **Scan for function declarations** - Find all function definitions
2. **Generate prototypes** - Create forward declarations
3. **Add Arduino.h** - Prepend `#include <Arduino.h>`
4. **Concatenate files** - Merge multiple .ino files if present

### Example Transformation

**Input (sketch.ino):**

```cpp
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  blink();
}

void blink() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
```

**Output (sketch.cpp):**

```cpp
#include <Arduino.h>

// Auto-generated prototypes
void setup();
void loop();
void blink();

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  blink();
}

void blink() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
```

## Build Process Workflow

```
1. User writes sketch.ino
2. BattleForge preprocesses .ino → .cpp
3. Compile core files (cores/arduino/*.cpp)
4. Compile variant files (variants/BLUEPILL_F103C8/*.c)
5. Compile HAL drivers (system/Drivers/**/*.c)
6. Compile preprocessed sketch
7. Link all object files with variant linker script
8. Generate .elf, .bin, .hex outputs
```

## Pin Definitions (Blue Pill)

### Special Pins

- `LED_BUILTIN` = PC13 (onboard LED, active low)
- `TX` = PA9 (Serial TX)
- `RX` = PA10 (Serial RX)
- `SDA` = PB7 (I2C data)
- `SCL` = PB6 (I2C clock)
- `MOSI` = PA7 (SPI MOSI)
- `MISO` = PA6 (SPI MISO)
- `SCK` = PA5 (SPI clock)
- `SS` = PA4 (SPI select)

### Digital Pins

- 37 total digital I/O pins
- PA0-PA15, PB0-PB15, PC13-PC15

### Analog Input Pins

- 10 ADC channels (12-bit resolution)
- PA0-PA7, PB0-PB1
- 3.3V reference voltage

### PWM Pins

- 12 PWM-capable pins
- PA0-PA3, PA6-PA7, PA8-PA10, PB0-PB1
- 16-bit resolution
- Default 1kHz frequency

## Core Arduino API

### Digital I/O

```cpp
pinMode(pin, mode);           // INPUT, OUTPUT, INPUT_PULLUP
digitalWrite(pin, value);     // HIGH, LOW
int digitalRead(pin);         // Returns HIGH or LOW
```

### Analog I/O

```cpp
int analogRead(pin);          // 0-4095 (12-bit ADC)
analogWrite(pin, value);      // 0-255 (PWM)
```

### Timing

```cpp
delay(ms);                    // Delay milliseconds
delayMicroseconds(us);        // Delay microseconds
unsigned long millis();       // Milliseconds since boot
unsigned long micros();       // Microseconds since boot
```

### Serial

```cpp
Serial.begin(baudrate);       // Initialize serial (default UART1)
Serial.print(data);           // Print without newline
Serial.println(data);         // Print with newline
int Serial.read();            // Read byte (-1 if none)
int Serial.available();       // Bytes available to read
```

### Interrupts

```cpp
attachInterrupt(digitalPinToInterrupt(pin), function, mode);
// mode: RISING, FALLING, CHANGE, LOW
detachInterrupt(digitalPinToInterrupt(pin));
```

### Advanced

```cpp
tone(pin, frequency);         // Generate tone
noTone(pin);                  // Stop tone
pulseIn(pin, value);          // Measure pulse width
shiftOut(dataPin, clockPin, bitOrder, value);
shiftIn(dataPin, clockPin, bitOrder);
```

## Memory Constraints

- **Flash:** 64 KB total, ~60 KB available after bootloader
- **RAM:** 20 KB total, ~18 KB available after stack/heap
- **Optimization:** Use `-Os` to minimize code size

## Common Pitfalls

1. **Voltage Levels:** STM32 uses 3.3V, not 5V like Arduino Uno
2. **Pin Numbers:** Not sequential - use port.pin notation (e.g., PA5)
3. **ADC Resolution:** 12-bit (0-4095) vs Arduino's 10-bit (0-1023)
4. **PWM Resolution:** 16-bit available vs Arduino's 8-bit
5. **Timing:** Clock speeds differ - timing-sensitive code may need adjustment

## Optional HAL Modules

Can be added later for extended functionality:

- **I2C/Wire** - hal_i2c (~45 KB)
- **SPI** - hal_spi (~38 KB)
- **USB** - hal_pcd, ll_usb (~72 KB)
- **RTC** - hal_rtc (~42 KB)
- **CAN** - hal_can (~35 KB)
- **DAC** - hal_dac (~28 KB)

## Next Steps

1. **Create core bundle** using packaging script from ARDUINO_CORE_PACKAGING.md
2. **Calculate checksum** and update framework.json
3. **Test compilation** with simple blink sketch
4. **Implement .ino preprocessor** in BattleForge
5. **Validate Arduino API** compatibility
6. **Add example sketches** for testing

## Resources

- **Documentation:** `ARDUINO_CORE_PACKAGING.md`
- **Framework Config:** `public/platforms/stm32/f1/frameworks/arduino/framework.json`
- **Upstream Repo:** https://github.com/stm32duino/Arduino_Core_STM32
- **Arduino API Ref:** https://www.arduino.cc/reference/en/
- **STM32duino Wiki:** https://github.com/stm32duino/wiki/wiki
