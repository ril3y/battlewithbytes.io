/**
 * Arduino Boards to PlatformFamily Transformer
 *
 * Transforms Arduino board definitions from package_index.json
 * into our PlatformFamily format for BattleForge IDE.
 */

import type { ParsedArduinoPlatform, ArduinoBoard } from "./types";
import type {
  PlatformFamily,
  DeviceEntry,
  Architecture,
  FrameworkSupport,
} from "../platform/types";
import { parseArduinoBuildFlags } from "./ArduinoIndexParser";

// ============================================================================
// Architecture Mapping
// ============================================================================

/**
 * Map Arduino architecture strings to our Architecture type
 */
function mapArduinoArchitecture(
  arduinoArch: string | undefined,
  mcu: string | undefined,
): Architecture | null {
  const archLower = (arduinoArch || "").toLowerCase();
  const mcuLower = (mcu || "").toLowerCase();

  // ESP32 variants
  if (archLower.includes("esp32s3") || mcuLower.includes("esp32s3"))
    return "xtensa-lx7";
  if (archLower.includes("esp32s2") || mcuLower.includes("esp32s2"))
    return "xtensa-lx7";
  if (
    archLower.includes("esp32c3") ||
    archLower.includes("esp32c6") ||
    mcuLower.includes("esp32c")
  )
    return "riscv32";
  if (archLower.includes("esp32") || mcuLower.includes("esp32"))
    return "xtensa-lx6";

  // ARM Cortex-M
  if (mcuLower.includes("stm32f1")) return "cortex-m3";
  if (mcuLower.includes("stm32f4") || mcuLower.includes("stm32l4"))
    return "cortex-m4f";
  if (mcuLower.includes("stm32f7") || mcuLower.includes("stm32h7"))
    return "cortex-m7f";

  if (mcuLower.includes("nrf52")) return "cortex-m4f";
  if (mcuLower.includes("nrf53")) return "cortex-m33";

  if (mcuLower.includes("samd21")) return "cortex-m0+";
  if (mcuLower.includes("samd51")) return "cortex-m4f";

  if (mcuLower.includes("rp2040")) return "cortex-m0+";

  // Generic fallbacks
  if (archLower.includes("samd")) return "cortex-m0+";
  if (archLower.includes("nrf52")) return "cortex-m4f";
  if (archLower.includes("nrf53")) return "cortex-m33";
  if (archLower.includes("rp2040")) return "cortex-m0+";
  if (archLower.includes("stm32")) return "cortex-m4f"; // Generic guess

  return null;
}

/**
 * Extract family ID from Arduino platform
 */
function extractFamilyId(
  platform: ParsedArduinoPlatform,
  board?: ArduinoBoard,
): string {
  const archLower = platform.architecture.toLowerCase();
  const mcuLower = (board?.build?.mcu || "").toLowerCase();

  // ESP32 families
  if (archLower.includes("esp32s3") || mcuLower.includes("esp32s3"))
    return "s3";
  if (archLower.includes("esp32s2") || mcuLower.includes("esp32s2"))
    return "s2";
  if (archLower.includes("esp32c3") || mcuLower.includes("esp32c3"))
    return "c3";
  if (archLower.includes("esp32c6") || mcuLower.includes("esp32c6"))
    return "c6";
  if (archLower.includes("esp32")) return "esp32";

  // STM32 families
  if (mcuLower.includes("stm32f1")) return "f1";
  if (mcuLower.includes("stm32f4")) return "f4";
  if (mcuLower.includes("stm32f7")) return "f7";
  if (mcuLower.includes("stm32l4")) return "l4";
  if (mcuLower.includes("stm32h7")) return "h7";
  if (archLower.includes("stm32")) return "stm32";

  // nRF families
  if (archLower.includes("nrf52") || mcuLower.includes("nrf52")) return "nrf52";
  if (archLower.includes("nrf53") || mcuLower.includes("nrf53")) return "nrf53";

  // RP2040
  if (archLower.includes("rp2040") || mcuLower.includes("rp2040"))
    return "rp2040";

  // SAMD families
  if (mcuLower.includes("samd21") || archLower.includes("samd21"))
    return "samd21";
  if (mcuLower.includes("samd51") || archLower.includes("samd51"))
    return "samd51";
  if (archLower.includes("samd")) return "samd";

  // Generic fallback
  return platform.architecture.toLowerCase();
}

// ============================================================================
// Device Entry Transformation
// ============================================================================

/**
 * Transform Arduino board to DeviceEntry
 */
function transformBoard(board: ArduinoBoard): DeviceEntry | null {
  const { defines } = parseArduinoBuildFlags(board);

  // Extract memory sizes
  const flash = board.upload?.maximum_size || 0;
  const ram = board.upload?.maximum_data_size || 0;

  // Skip boards without memory information
  if (flash === 0 && ram === 0) {
    return null;
  }

  // Extract linker script
  const linkerScript = board.build?.ldscript || `${board.id}.ld`;

  return {
    id: board.id,
    name: board.name,
    description: `Arduino ${board.name}`,
    flash,
    ram,
    linkerScript,
    defines: defines.length > 0 ? defines : undefined,
  };
}

// ============================================================================
// Framework Support Transformation
// ============================================================================

/**
 * Create Arduino framework support for a platform
 */
function createArduinoFramework(
  platform: ParsedArduinoPlatform,
): FrameworkSupport {
  // Extract common compiler flags from first board
  const firstBoard = platform.boards[0];
  const { compilerFlags, defines } = firstBoard
    ? parseArduinoBuildFlags(firstBoard)
    : { compilerFlags: [], defines: [] };

  // Base Arduino defines
  const arduinoDefines = [
    "ARDUINO=10819", // Arduino IDE version
    `ARDUINO_ARCH_${platform.architecture.toUpperCase()}`,
    ...defines,
  ];

  // Determine core variant
  const coreVariant = firstBoard?.build?.variant || platform.architecture;

  return {
    frameworkId: "arduino",
    enabled: true,
    version: platform.version,
    framework: {
      id: "arduino",
      name: `Arduino (${platform.platformName})`,
      description: `Arduino framework for ${platform.platformName}`,
      version: platform.version,
      compilerFlags: [
        "-std=gnu++17",
        "-fno-rtti",
        "-fno-exceptions",
        ...compilerFlags,
      ],
      linkerFlags: ["--gc-sections"],
      defines: arduinoDefines,
      includePaths: [
        `/cores/${platform.architecture}`,
        `/variants/${coreVariant}`,
      ],
      coreUrl: `${platform.packageName}/${extractFamilyId(platform)}/frameworks/arduino/core.tar.gz`,
      coreChecksum: "sha256:pending",
      requiresPreprocessing: true,
      fileExtension: ".ino",
    },
  };
}

/**
 * Create native (bare-metal) framework support
 */
function createNativeFramework(
  platform: ParsedArduinoPlatform,
): FrameworkSupport {
  const familyId = extractFamilyId(platform);

  // Determine SDK-specific defines
  const defines: string[] = [];
  const includePaths: string[] = [];

  if (platform.architecture.toLowerCase().includes("esp32")) {
    defines.push("ESP_PLATFORM", 'IDF_VER="v5.1"');
    includePaths.push("/esp-idf/components", `/soc/${familyId}/include`);
  } else if (platform.architecture.toLowerCase().includes("nrf")) {
    defines.push("NRF_SDK");
    includePaths.push("/nrf-sdk", `/soc/${familyId}`);
  } else if (platform.architecture.toLowerCase().includes("rp2040")) {
    defines.push("PICO_SDK");
    includePaths.push("/pico-sdk");
  }

  return {
    frameworkId: "native",
    enabled: true,
    version: platform.version,
    framework: {
      id: "native",
      name: `Native (${platform.platformName})`,
      description: `Bare-metal development for ${platform.platformName}`,
      version: platform.version,
      compilerFlags: ["-nostdlib", "-ffreestanding"],
      linkerFlags: ["-nostdlib", "--gc-sections"],
      defines,
      includePaths,
    },
  };
}

// ============================================================================
// Main Transformation
// ============================================================================

export class BoardsToFamilyTransformer {
  /**
   * Transform a ParsedArduinoPlatform to PlatformFamily
   */
  static transform(platform: ParsedArduinoPlatform): PlatformFamily | null {
    // Determine architecture
    const firstBoard = platform.boards[0];
    const architecture = mapArduinoArchitecture(
      platform.cpuArchitecture,
      firstBoard?.build?.mcu,
    );

    if (!architecture) {
      console.warn(
        `Could not map architecture for ${platform.platformName} (${platform.architecture})`,
      );
      return null;
    }

    // Transform boards to devices
    const devices: DeviceEntry[] = [];
    for (const board of platform.boards) {
      const device = transformBoard(board);
      if (device) {
        devices.push(device);
      }
    }

    if (devices.length === 0) {
      console.warn(`No valid devices found for ${platform.platformName}`);
      return null;
    }

    // Extract family ID
    const familyId = extractFamilyId(platform, firstBoard);

    // Create framework support
    const frameworks: FrameworkSupport[] = [
      createNativeFramework(platform),
      createArduinoFramework(platform),
    ];

    // Extract compiler flags from platform
    const compilerFlags: string[] = [];
    if (firstBoard?.build?.extra_flags) {
      const { compilerFlags: flags } = parseArduinoBuildFlags(firstBoard);
      compilerFlags.push(...flags);
    }

    // Add architecture-specific flags
    if (architecture.startsWith("xtensa")) {
      compilerFlags.push("-mlongcalls");
    }

    return {
      id: familyId,
      name: platform.platformName,
      description: `${platform.platformName} by ${platform.maintainer}`,
      architecture,
      devices,
      headers: {
        url: `${platform.packageName}/${familyId}/headers.tar.gz`,
        size: platform.size || 0,
        checksum: platform.checksum || "sha256:pending",
        includes: ["/cores", "/variants", "/tools/sdk"],
      },
      libs: {
        architecture,
        required: ["libc.a", "libgcc.a"],
        optional: ["libm.a", "libstdc++.a"],
      },
      compilerFlags:
        compilerFlags.length > 0
          ? compilerFlags
          : [`--target=${architecture}`, "-nostdlib", "-ffreestanding"],
      linkerFlags: ["-nostdlib", "--gc-sections"],
      frameworks,
    };
  }

  /**
   * Transform multiple platforms to PlatformFamily array
   */
  static transformMany(platforms: ParsedArduinoPlatform[]): PlatformFamily[] {
    const families: PlatformFamily[] = [];

    for (const platform of platforms) {
      const family = this.transform(platform);
      if (family) {
        families.push(family);
      }
    }

    return families;
  }

  /**
   * Group platforms by family and merge boards
   */
  static groupAndMerge(platforms: ParsedArduinoPlatform[]): PlatformFamily[] {
    // Group by package + family
    const grouped = new Map<string, ParsedArduinoPlatform[]>();

    for (const platform of platforms) {
      const familyId = extractFamilyId(platform, platform.boards[0]);
      const key = `${platform.packageName}:${familyId}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(platform);
    }

    // Transform each group
    const families: PlatformFamily[] = [];

    for (const group of grouped.values()) {
      if (group.length === 0) continue;

      // Use the latest version as base
      const latest = group.reduce((prev, current) =>
        current.version > prev.version ? current : prev,
      );

      // Merge all boards from all versions
      const allBoards: ArduinoBoard[] = [];
      for (const platform of group) {
        allBoards.push(...platform.boards);
      }

      // Deduplicate boards by ID
      const uniqueBoards = new Map<string, ArduinoBoard>();
      for (const board of allBoards) {
        if (!uniqueBoards.has(board.id)) {
          uniqueBoards.set(board.id, board);
        }
      }

      // Create merged platform
      const merged: ParsedArduinoPlatform = {
        ...latest,
        boards: Array.from(uniqueBoards.values()),
      };

      const family = this.transform(merged);
      if (family) {
        families.push(family);
      }
    }

    return families;
  }
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Extract vendor name from package name
 */
export function extractVendorName(packageName: string): string {
  // Common vendor mappings
  const vendors: Record<string, string> = {
    esp32: "espressif",
    stm32: "stm32",
    adafruit: "adafruit",
    arduino: "arduino",
    rp2040: "raspberrypi",
    nrf: "nordic",
    nrf52: "nordic",
    nrf53: "nordic",
  };

  return vendors[packageName.toLowerCase()] || packageName;
}

/**
 * Suggest platform ID from Arduino package
 */
export function suggestPlatformId(platform: ParsedArduinoPlatform): string {
  return extractVendorName(platform.packageName);
}
