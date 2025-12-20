/**
 * Tests for Arduino Package Index Parser
 */

import { ArduinoIndexParser, ARDUINO_INDEX_URLS } from "../ArduinoIndexParser";
import type { ArduinoPackageIndex } from "../types";
import { BoardsToFamilyTransformer } from "../BoardsToFamily";

// ============================================================================
// Mock Data
// ============================================================================

const mockESP32PackageIndex: ArduinoPackageIndex = {
  packages: [
    {
      name: "esp32",
      maintainer: "Espressif Systems",
      websiteURL: "https://github.com/espressif/arduino-esp32",
      platforms: [
        {
          name: "ESP32 Arduino",
          architecture: "esp32",
          version: "2.0.14",
          category: "ESP32",
          url: "https://github.com/espressif/arduino-esp32/releases/download/2.0.14/esp32-2.0.14.zip",
          archiveFileName: "esp32-2.0.14.zip",
          checksum: "SHA-256:abc123",
          size: 50000000,
          boards: [
            {
              id: "esp32",
              name: "ESP32 Dev Module",
              build: {
                mcu: "esp32",
                f_cpu: "240000000L",
                board: "ESP32_DEV",
                core: "esp32",
                variant: "esp32",
                extra_flags: "-DARDUINO_ESP32_DEV -DESP32",
                ldscript: "esp32.ld",
                flash_mode: "dio",
                flash_freq: "80m",
                flash_size: "4MB",
              },
              upload: {
                tool: "esptool_py",
                maximum_size: 4194304,
                maximum_data_size: 327680,
                speed: 921600,
              },
            },
            {
              id: "esp32s3",
              name: "ESP32-S3 Dev Module",
              build: {
                mcu: "esp32s3",
                f_cpu: "240000000L",
                board: "ESP32S3_DEV",
                core: "esp32",
                variant: "esp32s3",
                extra_flags: "-DARDUINO_ESP32S3_DEV -DESP32",
                ldscript: "esp32s3.ld",
              },
              upload: {
                tool: "esptool_py",
                maximum_size: 8388608,
                maximum_data_size: 524288,
              },
            },
          ],
          toolsDependencies: [
            {
              packager: "esp32",
              name: "xtensa-esp32-elf-gcc",
              version: "gcc8_4_0-esp-2021r2-patch3",
            },
            {
              packager: "esp32",
              name: "esptool_py",
              version: "4.5.1",
            },
          ],
        },
        {
          name: "ESP32 Arduino",
          architecture: "esp32",
          version: "2.0.13",
          category: "ESP32",
          url: "https://github.com/espressif/arduino-esp32/releases/download/2.0.13/esp32-2.0.13.zip",
          archiveFileName: "esp32-2.0.13.zip",
          checksum: "SHA-256:def456",
          size: 49000000,
          boards: [
            {
              id: "esp32",
              name: "ESP32 Dev Module",
              build: {
                mcu: "esp32",
                board: "ESP32_DEV",
                core: "esp32",
              },
              upload: {
                maximum_size: 4194304,
                maximum_data_size: 327680,
              },
            },
          ],
          toolsDependencies: [
            {
              packager: "esp32",
              name: "xtensa-esp32-elf-gcc",
              version: "gcc8_4_0-esp-2021r2-patch2",
            },
          ],
        },
      ],
    },
  ],
};

const mockRP2040PackageIndex: ArduinoPackageIndex = {
  packages: [
    {
      name: "rp2040",
      maintainer: "Earle F. Philhower, III",
      websiteURL: "https://github.com/earlephilhower/arduino-pico",
      platforms: [
        {
          name: "Raspberry Pi Pico/RP2040",
          architecture: "rp2040",
          version: "3.6.0",
          url: "https://github.com/earlephilhower/arduino-pico/releases/download/3.6.0/rp2040-3.6.0.zip",
          archiveFileName: "rp2040-3.6.0.zip",
          checksum: "SHA-256:xyz789",
          size: 20000000,
          boards: [
            {
              id: "rpipico",
              name: "Raspberry Pi Pico",
              build: {
                mcu: "rp2040",
                f_cpu: "133000000L",
                board: "RASPBERRY_PI_PICO",
                core: "rp2040",
                variant: "rpipico",
                ldscript: "memmap_default.ld",
              },
              upload: {
                maximum_size: 2097152,
                maximum_data_size: 262144,
              },
            },
          ],
          toolsDependencies: [
            {
              packager: "rp2040",
              name: "pqt-gcc",
              version: "1.5.1-b",
            },
          ],
        },
      ],
    },
  ],
};

// ============================================================================
// Parser Tests
// ============================================================================

describe("ArduinoIndexParser", () => {
  describe("parse", () => {
    it("should parse ESP32 package index", () => {
      const result = ArduinoIndexParser.parse(mockESP32PackageIndex);

      expect(result.platforms.length).toBe(2);
      expect(result.errors.length).toBe(0);
      expect(result.totalPlatforms).toBe(2);
      expect(result.parsedPlatforms).toBe(2);

      const platform = result.platforms[0];
      expect(platform.packageName).toBe("esp32");
      expect(platform.platformName).toBe("ESP32 Arduino");
      expect(platform.architecture).toBe("esp32");
      expect(platform.version).toBe("2.0.14");
      expect(platform.maintainer).toBe("Espressif Systems");
      expect(platform.boards.length).toBe(2);
      expect(platform.compilerToolchain).toBe("xtensa-esp32-elf-gcc");
    });

    it("should parse RP2040 package index", () => {
      const result = ArduinoIndexParser.parse(mockRP2040PackageIndex);

      expect(result.platforms.length).toBe(1);
      expect(result.errors.length).toBe(0);

      const platform = result.platforms[0];
      expect(platform.packageName).toBe("rp2040");
      expect(platform.architecture).toBe("rp2040");
      expect(platform.boards.length).toBe(1);
    });

    it("should detect CPU architecture for ESP32", () => {
      const result = ArduinoIndexParser.parse(mockESP32PackageIndex);
      const platform = result.platforms[0];

      expect(platform.cpuArchitecture).toBe("xtensa-lx6");
    });

    it("should detect CPU architecture for RP2040", () => {
      const result = ArduinoIndexParser.parse(mockRP2040PackageIndex);
      const platform = result.platforms[0];

      expect(platform.cpuArchitecture).toBe("cortex-m0+");
    });
  });

  describe("getLatestPlatforms", () => {
    it("should return only the latest version of each platform", () => {
      const result = ArduinoIndexParser.parse(mockESP32PackageIndex);
      const latest = ArduinoIndexParser.getLatestPlatforms(result.platforms);

      expect(latest.length).toBe(1);
      expect(latest[0].version).toBe("2.0.14");
    });
  });

  describe("filterByArchitecture", () => {
    it("should filter platforms by architecture", () => {
      const esp32Result = ArduinoIndexParser.parse(mockESP32PackageIndex);
      const rp2040Result = ArduinoIndexParser.parse(mockRP2040PackageIndex);
      const allPlatforms = [
        ...esp32Result.platforms,
        ...rp2040Result.platforms,
      ];

      const esp32Only = ArduinoIndexParser.filterByArchitecture(allPlatforms, [
        "esp32",
      ]);
      expect(esp32Only.length).toBe(2);

      const rp2040Only = ArduinoIndexParser.filterByArchitecture(allPlatforms, [
        "rp2040",
      ]);
      expect(rp2040Only.length).toBe(1);
    });
  });

  describe("search", () => {
    it("should search platforms by name", () => {
      const result = ArduinoIndexParser.parse(mockESP32PackageIndex);
      const found = ArduinoIndexParser.search(result.platforms, "ESP32");

      expect(found.length).toBe(2);
    });

    it("should search platforms by architecture", () => {
      const esp32Result = ArduinoIndexParser.parse(mockESP32PackageIndex);
      const rp2040Result = ArduinoIndexParser.parse(mockRP2040PackageIndex);
      const allPlatforms = [
        ...esp32Result.platforms,
        ...rp2040Result.platforms,
      ];

      const found = ArduinoIndexParser.search(allPlatforms, "rp2040");
      expect(found.length).toBe(1);
    });
  });
});

// ============================================================================
// Board Parsing Tests
// ============================================================================

describe("Board parsing", () => {
  it("should parse ESP32 board properties", () => {
    const result = ArduinoIndexParser.parse(mockESP32PackageIndex);
    const board = result.platforms[0].boards[0];

    expect(board.id).toBe("esp32");
    expect(board.name).toBe("ESP32 Dev Module");
    expect(board.build?.mcu).toBe("esp32");
    expect(board.build?.f_cpu).toBe("240000000L");
    expect(board.build?.board).toBe("ESP32_DEV");
    expect(board.build?.ldscript).toBe("esp32.ld");
    expect(board.upload?.maximum_size).toBe(4194304);
    expect(board.upload?.maximum_data_size).toBe(327680);
  });

  it("should parse ESP32-S3 board properties", () => {
    const result = ArduinoIndexParser.parse(mockESP32PackageIndex);
    const board = result.platforms[0].boards[1];

    expect(board.id).toBe("esp32s3");
    expect(board.name).toBe("ESP32-S3 Dev Module");
    expect(board.build?.mcu).toBe("esp32s3");
    expect(board.upload?.maximum_size).toBe(8388608);
    expect(board.upload?.maximum_data_size).toBe(524288);
  });
});

// ============================================================================
// BoardsToFamily Transformer Tests
// ============================================================================

describe("BoardsToFamilyTransformer", () => {
  describe("transform", () => {
    it("should transform ESP32 platform to PlatformFamily", () => {
      const result = ArduinoIndexParser.parse(mockESP32PackageIndex);
      const platform = result.platforms[0];
      const family = BoardsToFamilyTransformer.transform(platform);

      expect(family).not.toBeNull();
      expect(family!.id).toBe("esp32");
      expect(family!.name).toBe("ESP32 Arduino");
      expect(family!.architecture).toBe("xtensa-lx6");
      expect(family!.devices.length).toBe(2);
    });

    it("should transform RP2040 platform to PlatformFamily", () => {
      const result = ArduinoIndexParser.parse(mockRP2040PackageIndex);
      const platform = result.platforms[0];
      const family = BoardsToFamilyTransformer.transform(platform);

      expect(family).not.toBeNull();
      expect(family!.id).toBe("rp2040");
      expect(family!.architecture).toBe("cortex-m0+");
      expect(family!.devices.length).toBe(1);
    });

    it("should create valid device entries", () => {
      const result = ArduinoIndexParser.parse(mockESP32PackageIndex);
      const platform = result.platforms[0];
      const family = BoardsToFamilyTransformer.transform(platform);

      const device = family!.devices[0];
      expect(device.id).toBe("esp32");
      expect(device.name).toBe("ESP32 Dev Module");
      expect(device.flash).toBe(4194304);
      expect(device.ram).toBe(327680);
      expect(device.linkerScript).toBe("esp32.ld");
      expect(device.defines).toBeDefined();
      expect(device.defines).toContain("ARDUINO_ESP32_DEV");
    });

    it("should create Arduino framework support", () => {
      const result = ArduinoIndexParser.parse(mockESP32PackageIndex);
      const platform = result.platforms[0];
      const family = BoardsToFamilyTransformer.transform(platform);

      const arduinoFramework = family!.frameworks?.find(
        (f) => f.frameworkId === "arduino",
      );
      expect(arduinoFramework).toBeDefined();
      expect(arduinoFramework!.enabled).toBe(true);
      expect(arduinoFramework!.version).toBe("2.0.14");
      expect(arduinoFramework!.framework.defines).toContain(
        "ARDUINO_ARCH_ESP32",
      );
      expect(arduinoFramework!.framework.requiresPreprocessing).toBe(true);
      expect(arduinoFramework!.framework.fileExtension).toBe(".ino");
    });

    it("should create native framework support", () => {
      const result = ArduinoIndexParser.parse(mockESP32PackageIndex);
      const platform = result.platforms[0];
      const family = BoardsToFamilyTransformer.transform(platform);

      const nativeFramework = family!.frameworks?.find(
        (f) => f.frameworkId === "native",
      );
      expect(nativeFramework).toBeDefined();
      expect(nativeFramework!.enabled).toBe(true);
      expect(nativeFramework!.framework.compilerFlags).toContain("-nostdlib");
    });
  });

  describe("transformMany", () => {
    it("should transform multiple platforms", () => {
      const esp32Result = ArduinoIndexParser.parse(mockESP32PackageIndex);
      const rp2040Result = ArduinoIndexParser.parse(mockRP2040PackageIndex);
      const allPlatforms = [
        ...esp32Result.platforms,
        ...rp2040Result.platforms,
      ];

      const families = BoardsToFamilyTransformer.transformMany(allPlatforms);
      expect(families.length).toBe(3); // 2 ESP32 versions + 1 RP2040
    });
  });

  describe("groupAndMerge", () => {
    it("should merge platforms by family and use latest version", () => {
      const result = ArduinoIndexParser.parse(mockESP32PackageIndex);
      const families = BoardsToFamilyTransformer.groupAndMerge(
        result.platforms,
      );

      expect(families.length).toBe(1); // Should merge both ESP32 versions
      expect(families[0].name).toBe("ESP32 Arduino");
      expect(families[0].devices.length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ============================================================================
// Integration Tests (Optional - requires network)
// ============================================================================

describe("Integration tests", () => {
  // Skip these tests by default as they require network access
  // Remove .skip to run them
  describe.skip("fetchAndParse", () => {
    it("should fetch and parse ESP32 index", async () => {
      const result = await ArduinoIndexParser.fetchAndParse(
        ARDUINO_INDEX_URLS.esp32,
      );

      expect(result.platforms.length).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);
    }, 30000); // 30 second timeout

    it("should handle network errors gracefully", async () => {
      const result = await ArduinoIndexParser.fetchAndParse(
        "https://invalid-url-that-does-not-exist.com/package_index.json",
      );

      expect(result.platforms.length).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle 404 errors gracefully", async () => {
      const result = await ArduinoIndexParser.fetchAndParse(
        "https://github.com/404-not-found/package_index.json",
      );

      expect(result.platforms.length).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
