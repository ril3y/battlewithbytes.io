# Arduino Package Index Parser

This module provides utilities for parsing Arduino `package_index.json` files and converting Arduino board definitions to BattleForge's `PlatformFamily` format.

## Overview

Arduino packages are distributed via JSON indices that contain platform definitions, board configurations, and toolchain information. This parser allows BattleForge to:

1. Fetch and parse Arduino package indices
2. Extract board and platform information
3. Transform Arduino definitions to our platform database format
4. Extend platform support dynamically

## Components

### Types (`types.ts`)

Type definitions for Arduino package index structure:
- `ArduinoPackageIndex` - Root structure of package_index.json
- `ArduinoPackage` - Hardware platform provider (e.g., Espressif, Adafruit)
- `ArduinoPlatform` - Specific version of a hardware platform
- `ArduinoBoard` - Board definition with build properties
- `ArduinoTool` - Compiler, uploader, or build tool
- `ParsedArduinoPlatform` - Extracted platform information
- `ParseOptions` - Configuration for parsing

### ArduinoIndexParser (`ArduinoIndexParser.ts`)

Main parser class for Arduino package indices:
- Fetch remote indices with graceful error handling
- Parse package structures and extract metadata
- Detect CPU architectures from Arduino names
- Filter platforms by architecture or version
- Search platforms by name/package

### BoardsToFamilyTransformer (`BoardsToFamily.ts`)

Transforms Arduino board definitions to PlatformFamily format:
- Map Arduino architecture names to BattleForge Architecture types
- Generate DeviceEntry from Arduino boards
- Create framework support (Arduino + Native)
- Extract compiler flags and defines
- Merge multiple platform versions

## Usage

### Basic Parsing

```typescript
import { ArduinoIndexParser, ARDUINO_INDEX_URLS } from './arduino';

// Fetch and parse ESP32 index
const result = await ArduinoIndexParser.fetchAndParse(
  ARDUINO_INDEX_URLS.esp32
);

console.log(`Parsed ${result.parsedPlatforms} platforms`);
console.log(`Errors: ${result.errors.length}`);

// Get platform info
for (const platform of result.platforms) {
  console.log(`${platform.platformName} v${platform.version}`);
  console.log(`  Architecture: ${platform.cpuArchitecture}`);
  console.log(`  Boards: ${platform.boards.length}`);
}
```

### Filtering and Searching

```typescript
// Get latest version of each platform
const latest = ArduinoIndexParser.getLatestPlatforms(result.platforms);

// Filter by architecture
const esp32Only = ArduinoIndexParser.filterByArchitecture(
  result.platforms,
  ['esp32']
);

// Search platforms
const found = ArduinoIndexParser.search(result.platforms, 'ESP32-S3');
```

### Transform to PlatformFamily

```typescript
import { BoardsToFamilyTransformer } from './arduino';

// Transform single platform
const platform = result.platforms[0];
const family = BoardsToFamilyTransformer.transform(platform);

if (family) {
  console.log(`Family: ${family.name}`);
  console.log(`Architecture: ${family.architecture}`);
  console.log(`Devices: ${family.devices.length}`);
  console.log(`Frameworks: ${family.frameworks?.map(f => f.frameworkId)}`);
}

// Transform multiple platforms
const families = BoardsToFamilyTransformer.transformMany(result.platforms);

// Group and merge by family
const merged = BoardsToFamilyTransformer.groupAndMerge(result.platforms);
```

### Parse Options

```typescript
const result = await ArduinoIndexParser.fetchAndParse(
  ARDUINO_INDEX_URLS.esp32,
  {
    // Only parse specific architectures
    architectureFilter: ['esp32', 'esp32s3'],

    // Get latest version only
    versionFilter: 'latest',

    // Include deprecated platforms
    includeDeprecated: true,

    // Parse boards.txt (requires downloading packages)
    parseBoardsDefinitions: false,
  }
);
```

## Architecture Mapping

The parser automatically maps Arduino architecture strings to our Architecture types:

| Arduino Arch | CPU Arch | Family | Core |
|-------------|----------|--------|------|
| esp32 | xtensa-lx6 | esp32 | esp32 |
| esp32s3 | xtensa-lx7 | s3 | esp32 |
| esp32c3 | riscv32 | c3 | esp32 |
| samd | cortex-m0+ | samd21 | arduino |
| nrf52 | cortex-m4f | nrf52 | nrf5 |
| rp2040 | cortex-m0+ | rp2040 | rp2040 |
| stm32 | cortex-m4f* | stm32 | stm32 |

*STM32 architecture is refined based on MCU name (F1→M3, F4→M4F, F7→M7F, etc.)

## Known Package Indices

Pre-configured URLs for common Arduino package indices:

```typescript
import { ARDUINO_INDEX_URLS } from './arduino';

ARDUINO_INDEX_URLS.esp32      // Espressif ESP32
ARDUINO_INDEX_URLS.adafruit   // Adafruit boards
ARDUINO_INDEX_URLS.stm32      // STM32duino
ARDUINO_INDEX_URLS.rp2040     // Raspberry Pi Pico
ARDUINO_INDEX_URLS.arduino    // Official Arduino boards
```

## Error Handling

The parser handles errors gracefully:

```typescript
const result = await ArduinoIndexParser.fetchAndParse(url);

if (result.errors.length > 0) {
  console.error('Parsing errors:');
  for (const error of result.errors) {
    console.error(`  ${error.message}`);
    if (error.packageName) {
      console.error(`    Package: ${error.packageName}`);
    }
  }
}

// Partial results are still available
console.log(`Successfully parsed: ${result.parsedPlatforms} platforms`);
```

## Testing

Run tests with Jest:

```bash
npm test -- arduino
```

The test suite includes:
- Mock data for ESP32 and RP2040 platforms
- Parser validation tests
- Architecture detection tests
- Transformation tests
- Integration tests (optional, requires network)

## Examples

### Extract ESP32-S3 Boards

```typescript
const result = await ArduinoIndexParser.fetchAndParse(
  ARDUINO_INDEX_URLS.esp32
);

const s3Platforms = result.platforms.filter(p =>
  p.architecture.toLowerCase().includes('esp32s3')
);

const families = BoardsToFamilyTransformer.transformMany(s3Platforms);

// Use in BattleForge
for (const family of families) {
  console.log(`\nFamily: ${family.name}`);
  for (const device of family.devices) {
    console.log(`  - ${device.name}`);
    console.log(`    Flash: ${device.flash / 1024}KB`);
    console.log(`    RAM: ${device.ram / 1024}KB`);
  }
}
```

### Compare Platform Versions

```typescript
const result = await ArduinoIndexParser.fetchAndParse(
  ARDUINO_INDEX_URLS.esp32
);

// Group by architecture
const grouped = new Map();
for (const platform of result.platforms) {
  const arch = platform.architecture;
  if (!grouped.has(arch)) {
    grouped.set(arch, []);
  }
  grouped.get(arch).push(platform);
}

// Show versions
for (const [arch, platforms] of grouped) {
  console.log(`\n${arch}:`);
  const sorted = platforms.sort((a, b) =>
    ArduinoIndexParser.compareVersions(b.version, a.version)
  );
  for (const p of sorted) {
    console.log(`  v${p.version} - ${p.boards.length} boards`);
  }
}
```

## Future Enhancements

Potential improvements:
- [ ] Parse boards.txt from downloaded platform packages
- [ ] Extract menu options (clock speed, flash size variants)
- [ ] Parse platform.txt for additional compiler flags
- [ ] Support for custom board definitions
- [ ] Cache downloaded package indices
- [ ] Validate platform compatibility with BattleForge toolchain
- [ ] Auto-generate linker scripts from Arduino definitions
- [ ] Extract library dependencies from package indices

## References

- [Arduino Package Index Specification](https://arduino.github.io/arduino-cli/latest/package_index_json-specification/)
- [Arduino Platform Specification](https://arduino.github.io/arduino-cli/latest/platform-specification/)
- [ESP32 Arduino Core](https://github.com/espressif/arduino-esp32)
- [RP2040 Arduino Core](https://github.com/earlephilhower/arduino-pico)
