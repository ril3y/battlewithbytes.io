/**
 * Arduino Package Index Types
 *
 * Type definitions for parsing Arduino package_index.json files.
 * Based on the Arduino package index specification:
 * https://arduino.github.io/arduino-cli/latest/package_index_json-specification/
 */

// ============================================================================
// Root Package Index Types
// ============================================================================

/**
 * Root structure of an Arduino package index JSON file
 */
export interface ArduinoPackageIndex {
  packages: ArduinoPackage[];
}

/**
 * Arduino package - represents a hardware platform provider (e.g., Espressif, Adafruit)
 */
export interface ArduinoPackage {
  name: string; // "esp32"
  maintainer: string; // "Espressif Systems"
  websiteURL?: string; // "https://github.com/espressif/arduino-esp32"
  email?: string;
  platforms: ArduinoPlatform[];
  tools?: ArduinoTool[];
}

// ============================================================================
// Platform Types
// ============================================================================

/**
 * Arduino platform - a specific version of a hardware platform
 */
export interface ArduinoPlatform {
  name: string; // "ESP32 Arduino"
  architecture: string; // "esp32"
  version: string; // "2.0.14"
  category?: string; // "ESP32"
  url: string; // URL to download platform package
  archiveFileName: string; // "esp32-2.0.14.zip"
  checksum?: string; // "SHA-256:..."
  size?: number; // Size in bytes
  boards?: ArduinoBoard[]; // List of supported boards
  toolsDependencies?: ArduinoToolDependency[];
  discoveryDependencies?: ArduinoDiscoveryDependency[];
  help?: {
    online?: string;
  };
}

/**
 * Arduino board definition (parsed from boards.txt)
 */
export interface ArduinoBoard {
  id: string; // "esp32"
  name: string; // "ESP32 Dev Module"

  // Build properties (from boards.txt)
  build?: {
    mcu?: string; // "esp32"
    f_cpu?: string; // "240000000L"
    board?: string; // "ESP32_DEV"
    core?: string; // "esp32"
    variant?: string; // "esp32"
    extra_flags?: string; // Compiler flags
    ldscript?: string; // Linker script
    flash_mode?: string; // "dio"
    flash_freq?: string; // "80m"
    flash_size?: string; // "4MB"
    partitions?: string; // Partition scheme
    defines?: string; // Preprocessor defines
  };

  // Upload properties
  upload?: {
    tool?: string; // "esptool_py"
    protocol?: string;
    maximum_size?: number; // Flash size
    maximum_data_size?: number; // RAM size
    speed?: number; // Upload speed
  };

  // Menu options (variants for the same board)
  menu?: Record<string, Record<string, string>>;
}

// ============================================================================
// Tool Types
// ============================================================================

/**
 * Arduino tool - compiler, uploader, or other build tool
 */
export interface ArduinoTool {
  name: string; // "xtensa-esp32-elf-gcc"
  version: string; // "gcc8_4_0-esp-2021r2-patch3"
  systems: ArduinoToolSystem[];
}

/**
 * Platform-specific tool download
 */
export interface ArduinoToolSystem {
  host?: string; // "x86_64-linux-gnu" | "i686-mingw32" | "x86_64-apple-darwin" | etc.
  url: string; // Download URL
  archiveFileName: string; // "xtensa-esp32-elf-gcc8_4_0-esp-2021r2-patch3-linux-amd64.tar.gz"
  checksum?: string; // "SHA-256:..."
  size?: number; // Size in bytes
}

/**
 * Tool dependency for a platform
 */
export interface ArduinoToolDependency {
  packager: string; // "esp32"
  name: string; // "xtensa-esp32-elf-gcc"
  version?: string; // "gcc8_4_0-esp-2021r2-patch3"
}

/**
 * Discovery dependency for a platform
 */
export interface ArduinoDiscoveryDependency {
  packager: string; // "builtin"
  name: string; // "serial-discovery"
  version?: string;
}

// ============================================================================
// Parsing Result Types
// ============================================================================

/**
 * Parsed platform information from Arduino package index
 */
export interface ParsedArduinoPlatform {
  // Platform metadata
  packageName: string; // "esp32"
  platformName: string; // "ESP32 Arduino"
  architecture: string; // "esp32"
  version: string; // "2.0.14"
  maintainer: string; // "Espressif Systems"

  // Detected architecture mapping
  cpuArchitecture?: string; // "xtensa-lx6" | "riscv32" | "cortex-m4f"

  // Boards
  boards: ArduinoBoard[];

  // Build tools
  compilerToolchain?: string; // "xtensa-esp32-elf-gcc"
  requiredTools: ArduinoToolDependency[];

  // Download info
  downloadUrl: string;
  archiveFileName: string;
  checksum?: string;
  size?: number;
}

/**
 * Architecture mapping result
 */
export interface ArchitectureMapping {
  arduinoArch: string; // "esp32" | "samd" | "stm32" | "rp2040"
  cpuArch?: string; // "xtensa-lx6" | "cortex-m4f" | "cortex-m0+" | "riscv32"
  family?: string; // "esp32" | "samd21" | "stm32f4" | "rp2040"
  core?: string; // "esp32" | "arduino" | "stm32"
}

/**
 * Options for parsing Arduino package index
 */
export interface ParseOptions {
  // Filter by architecture
  architectureFilter?: string[];

  // Filter by version (get latest, specific version, etc.)
  versionFilter?: "latest" | "all" | string;

  // Include deprecated platforms
  includeDeprecated?: boolean;

  // Parse boards.txt from platform packages (requires downloading)
  parseBoardsDefinitions?: boolean;
}

/**
 * Error during parsing
 */
export interface ParseError {
  message: string;
  packageName?: string;
  platformName?: string;
  cause?: Error;
}

/**
 * Parse result
 */
export interface ParseResult {
  platforms: ParsedArduinoPlatform[];
  errors: ParseError[];
  totalPlatforms: number;
  parsedPlatforms: number;
}
