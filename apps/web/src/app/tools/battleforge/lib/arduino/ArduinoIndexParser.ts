/**
 * Arduino Package Index Parser
 *
 * Parses Arduino package_index.json files to extract platform and board information.
 * Supports both online and offline parsing with graceful error handling.
 */

import type {
  ArduinoPackageIndex,
  ArduinoPackage,
  ArduinoPlatform,
  ArduinoBoard,
  ParsedArduinoPlatform,
  ParseOptions,
  ParseResult,
  ParseError,
  ArchitectureMapping,
} from "./types";

// ============================================================================
// Architecture Detection
// ============================================================================

/**
 * Map Arduino architecture names to our Architecture types
 */
const ARCHITECTURE_MAPPINGS: Record<string, ArchitectureMapping> = {
  // ESP32 variants
  esp32: {
    arduinoArch: "esp32",
    cpuArch: "xtensa-lx6",
    family: "esp32",
    core: "esp32",
  },
  esp32s2: {
    arduinoArch: "esp32s2",
    cpuArch: "xtensa-lx7",
    family: "s2",
    core: "esp32",
  },
  esp32s3: {
    arduinoArch: "esp32s3",
    cpuArch: "xtensa-lx7",
    family: "s3",
    core: "esp32",
  },
  esp32c3: {
    arduinoArch: "esp32c3",
    cpuArch: "riscv32",
    family: "c3",
    core: "esp32",
  },
  esp32c6: {
    arduinoArch: "esp32c6",
    cpuArch: "riscv32",
    family: "c6",
    core: "esp32",
  },

  // ARM Cortex-M
  samd: {
    arduinoArch: "samd",
    cpuArch: "cortex-m0+",
    family: "samd21",
    core: "arduino",
  },
  nrf52: {
    arduinoArch: "nrf52",
    cpuArch: "cortex-m4f",
    family: "nrf52",
    core: "nrf5",
  },
  nrf53: {
    arduinoArch: "nrf53",
    cpuArch: "cortex-m33",
    family: "nrf53",
    core: "nrf5",
  },
  stm32: {
    arduinoArch: "stm32",
    cpuArch: "cortex-m4f", // Generic, varies by board
    family: "stm32",
    core: "stm32",
  },

  // RP2040
  rp2040: {
    arduinoArch: "rp2040",
    cpuArch: "cortex-m0+",
    family: "rp2040",
    core: "rp2040",
  },

  // AVR (8-bit)
  avr: {
    arduinoArch: "avr",
    family: "avr",
    core: "arduino",
  },

  // ARM Cortex-A
  linux_arm: {
    arduinoArch: "linux_arm",
    cpuArch: "cortex-m3", // Generic
    family: "linux",
    core: "linux",
  },
};

/**
 * Detect CPU architecture from Arduino platform architecture string
 */
function detectArchitecture(arduinoArch: string): ArchitectureMapping | null {
  const normalized = arduinoArch.toLowerCase().trim();

  // Direct match
  if (ARCHITECTURE_MAPPINGS[normalized]) {
    return ARCHITECTURE_MAPPINGS[normalized];
  }

  // Partial match (e.g., "esp32" in "esp32-arduino")
  for (const [key, mapping] of Object.entries(ARCHITECTURE_MAPPINGS)) {
    if (normalized.includes(key)) {
      return mapping;
    }
  }

  return null;
}

/**
 * Extract MCU type from build properties to refine architecture detection
 */
function refineMcuArchitecture(
  mcu: string | undefined,
  baseMapping: ArchitectureMapping | null
): string | undefined {
  if (!mcu) return baseMapping?.cpuArch;

  const mcuLower = mcu.toLowerCase();

  // STM32 specific refinement
  if (mcuLower.startsWith("stm32")) {
    if (mcuLower.includes("f1")) return "cortex-m3";
    if (mcuLower.includes("f4")) return "cortex-m4f";
    if (mcuLower.includes("f7")) return "cortex-m7f";
    if (mcuLower.includes("l4")) return "cortex-m4f";
    if (mcuLower.includes("h7")) return "cortex-m7f";
  }

  // nRF specific refinement
  if (mcuLower.includes("nrf52")) return "cortex-m4f";
  if (mcuLower.includes("nrf53")) return "cortex-m33";

  // SAMD specific refinement
  if (mcuLower.includes("samd21")) return "cortex-m0+";
  if (mcuLower.includes("samd51")) return "cortex-m4f";

  // ESP32 specific refinement
  if (mcuLower.includes("esp32s3")) return "xtensa-lx7";
  if (mcuLower.includes("esp32s2")) return "xtensa-lx7";
  if (mcuLower.includes("esp32c3") || mcuLower.includes("esp32c6"))
    return "riscv32";
  if (mcuLower.includes("esp32")) return "xtensa-lx6";

  // RP2040
  if (mcuLower.includes("rp2040")) return "cortex-m0+";

  return baseMapping?.cpuArch;
}

// ============================================================================
// Board Parsing Utilities
// ============================================================================

/**
 * Parse compiler flags from Arduino build.extra_flags
 */
function parseCompilerFlags(extraFlags: string | undefined): string[] {
  if (!extraFlags) return [];

  // Split by whitespace, respecting quotes
  const flags: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < extraFlags.length; i++) {
    const char = extraFlags[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === " " || char === "\t") && !inQuotes) {
      if (current) {
        flags.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }

  if (current) {
    flags.push(current);
  }

  return flags.filter((f) => f.trim().length > 0);
}

/**
 * Extract defines from compiler flags
 */
function extractDefines(flags: string[]): string[] {
  const defines: string[] = [];

  for (const flag of flags) {
    if (flag.startsWith("-D")) {
      defines.push(flag.substring(2));
    }
  }

  return defines;
}

/**
 * Normalize board ID to be filesystem-safe
 */
function normalizeBoardId(id: string): string {
  return id
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_");
}

// ============================================================================
// Main Parser Class
// ============================================================================

export class ArduinoIndexParser {
  /**
   * Fetch and parse an Arduino package index from a URL
   */
  static async fetchAndParse(
    url: string,
    options: ParseOptions = {}
  ): Promise<ParseResult> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        return {
          platforms: [],
          errors: [
            {
              message: `Failed to fetch package index: ${response.status} ${response.statusText}`,
            },
          ],
          totalPlatforms: 0,
          parsedPlatforms: 0,
        };
      }

      const data = (await response.json()) as ArduinoPackageIndex;
      return this.parse(data, options);
    } catch (error) {
      return {
        platforms: [],
        errors: [
          {
            message: `Error fetching package index: ${error instanceof Error ? error.message : String(error)}`,
            cause: error instanceof Error ? error : undefined,
          },
        ],
        totalPlatforms: 0,
        parsedPlatforms: 0,
      };
    }
  }

  /**
   * Parse an Arduino package index object
   */
  static parse(
    index: ArduinoPackageIndex,
    options: ParseOptions = {}
  ): ParseResult {
    const platforms: ParsedArduinoPlatform[] = [];
    const errors: ParseError[] = [];
    let totalPlatforms = 0;

    for (const pkg of index.packages) {
      try {
        const parsedPlatforms = this.parsePackage(pkg, options);
        platforms.push(...parsedPlatforms);
        totalPlatforms += pkg.platforms.length;
      } catch (error) {
        errors.push({
          message: `Error parsing package ${pkg.name}`,
          packageName: pkg.name,
          cause: error instanceof Error ? error : undefined,
        });
      }
    }

    return {
      platforms,
      errors,
      totalPlatforms,
      parsedPlatforms: platforms.length,
    };
  }

  /**
   * Parse a single Arduino package
   */
  private static parsePackage(
    pkg: ArduinoPackage,
    options: ParseOptions
  ): ParsedArduinoPlatform[] {
    const platforms: ParsedArduinoPlatform[] = [];

    for (const platform of pkg.platforms) {
      // Apply architecture filter
      if (
        options.architectureFilter &&
        !options.architectureFilter.includes(platform.architecture)
      ) {
        continue;
      }

      // Apply version filter
      if (options.versionFilter && options.versionFilter !== "all") {
        if (options.versionFilter === "latest") {
          // For 'latest', we'd need to group by architecture and pick the newest
          // For now, skip older versions (this is a simplified approach)
          // A proper implementation would track versions per architecture
        } else if (platform.version !== options.versionFilter) {
          continue;
        }
      }

      try {
        const parsed = this.parsePlatform(pkg, platform);
        platforms.push(parsed);
      } catch (error) {
        // Skip platforms that fail to parse
        console.warn(
          `Failed to parse platform ${platform.name} v${platform.version}:`,
          error
        );
      }
    }

    return platforms;
  }

  /**
   * Parse a single Arduino platform
   */
  private static parsePlatform(
    pkg: ArduinoPackage,
    platform: ArduinoPlatform
  ): ParsedArduinoPlatform {
    // Detect architecture
    const archMapping = detectArchitecture(platform.architecture);

    // Parse boards if available
    const boards = platform.boards || [];

    // Refine architecture based on first board's MCU if available
    let cpuArchitecture = archMapping?.cpuArch;
    if (boards.length > 0 && boards[0].build?.mcu) {
      cpuArchitecture = refineMcuArchitecture(
        boards[0].build.mcu,
        archMapping
      );
    }

    // Extract compiler toolchain from tool dependencies
    const compilerToolchain = platform.toolsDependencies?.find((dep) =>
      dep.name.toLowerCase().includes("gcc")
    )?.name;

    return {
      packageName: pkg.name,
      platformName: platform.name,
      architecture: platform.architecture,
      version: platform.version,
      maintainer: pkg.maintainer,
      cpuArchitecture,
      boards,
      compilerToolchain,
      requiredTools: platform.toolsDependencies || [],
      downloadUrl: platform.url,
      archiveFileName: platform.archiveFileName,
      checksum: platform.checksum,
      size: platform.size,
    };
  }

  /**
   * Get latest version of each platform by architecture
   */
  static getLatestPlatforms(
    platforms: ParsedArduinoPlatform[]
  ): ParsedArduinoPlatform[] {
    const latest = new Map<string, ParsedArduinoPlatform>();

    for (const platform of platforms) {
      const key = `${platform.packageName}:${platform.architecture}`;
      const existing = latest.get(key);

      if (
        !existing ||
        this.compareVersions(platform.version, existing.version) > 0
      ) {
        latest.set(key, platform);
      }
    }

    return Array.from(latest.values());
  }

  /**
   * Compare semantic versions (simplified)
   */
  private static compareVersions(a: string, b: string): number {
    const aParts = a.split(".").map((n) => parseInt(n, 10));
    const bParts = b.split(".").map((n) => parseInt(n, 10));

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aNum = aParts[i] || 0;
      const bNum = bParts[i] || 0;

      if (aNum > bNum) return 1;
      if (aNum < bNum) return -1;
    }

    return 0;
  }

  /**
   * Filter platforms by architecture
   */
  static filterByArchitecture(
    platforms: ParsedArduinoPlatform[],
    architectures: string[]
  ): ParsedArduinoPlatform[] {
    const archSet = new Set(architectures.map((a) => a.toLowerCase()));
    return platforms.filter((p) =>
      archSet.has(p.architecture.toLowerCase())
    );
  }

  /**
   * Search for platforms by name or package
   */
  static search(
    platforms: ParsedArduinoPlatform[],
    query: string
  ): ParsedArduinoPlatform[] {
    const lowerQuery = query.toLowerCase();
    return platforms.filter(
      (p) =>
        p.platformName.toLowerCase().includes(lowerQuery) ||
        p.packageName.toLowerCase().includes(lowerQuery) ||
        p.architecture.toLowerCase().includes(lowerQuery)
    );
  }
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Common Arduino package index URLs
 */
export const ARDUINO_INDEX_URLS = {
  esp32: "https://espressif.github.io/arduino-esp32/package_esp32_index.json",
  adafruit:
    "https://adafruit.github.io/arduino-board-index/package_adafruit_index.json",
  stm32:
    "https://github.com/stm32duino/BoardManagerFiles/raw/main/package_stmicroelectronics_index.json",
  rp2040:
    "https://github.com/earlephilhower/arduino-pico/releases/download/global/package_rp2040_index.json",
  arduino: "https://downloads.arduino.cc/packages/package_index.json",
};

/**
 * Parse compiler flags and extract defines
 */
export function parseArduinoBuildFlags(
  board: ArduinoBoard
): { compilerFlags: string[]; defines: string[] } {
  const extraFlags = board.build?.extra_flags || "";
  const compilerFlags = parseCompilerFlags(extraFlags);
  const defines = extractDefines(compilerFlags);

  // Add board-specific define
  if (board.build?.board) {
    defines.push(`ARDUINO_${board.build.board}`);
  }

  return { compilerFlags, defines };
}

/**
 * Normalize a board ID
 */
export { normalizeBoardId };
