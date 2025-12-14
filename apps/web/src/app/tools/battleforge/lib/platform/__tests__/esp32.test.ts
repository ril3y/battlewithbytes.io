/**
 * Tests for ESP32 Platform Families
 * Verifies ESP32-S3 and ESP32-C3 family.json schema validity and framework support
 */

import type {
  PlatformFamily,
  FrameworkSupport,
  Framework,
  DeviceEntry,
  Architecture,
} from "../types";
import { ARCHITECTURE_CONFIGS } from "../types";

// Mock ESP32-S3 family data based on the created family.json
const esp32s3Family: PlatformFamily = {
  id: "s3",
  name: "ESP32-S3 Series (Xtensa LX7)",
  description:
    "Dual-core Xtensa LX7 MCU with WiFi, BLE, and AI acceleration. Ideal for IoT and edge AI applications.",
  architecture: "xtensa-lx7",
  devices: [
    {
      id: "esp32s3_wroom1",
      name: "ESP32-S3-WROOM-1",
      description: "8MB Flash, 512KB SRAM, WiFi+BLE - Standard module",
      flash: 8388608,
      ram: 524288,
      linkerScript: "esp32s3.ld",
      defines: ["CONFIG_IDF_TARGET_ESP32S3", "ESP32S3"],
    },
    {
      id: "esp32s3_devkitc",
      name: "ESP32-S3-DevKitC-1",
      description: "8MB Flash, 512KB SRAM, WiFi+BLE - Development board",
      flash: 8388608,
      ram: 524288,
      linkerScript: "esp32s3.ld",
      defines: ["CONFIG_IDF_TARGET_ESP32S3", "ESP32S3", "ARDUINO_ESP32S3_DEV"],
    },
  ],
  headers: {
    url: "esp32/s3/headers.tar.gz",
    size: 250000,
    checksum: "sha256:pending",
    includes: ["/esp-idf", "/xtensa", "/soc"],
  },
  libs: {
    architecture: "xtensa-lx7",
    required: ["libc.a", "libgcc.a", "libhal.a"],
    optional: ["libm.a", "libstdc++.a"],
  },
  compilerFlags: [
    "--target=xtensa-esp32s3-elf",
    "-mlongcalls",
    "-nostdlib",
    "-ffreestanding",
    "-fno-exceptions",
    "-fno-rtti",
  ],
  linkerFlags: ["-nostdlib", "--gc-sections"],
  frameworks: [
    {
      frameworkId: "native",
      enabled: true,
      version: "5.1.0",
      framework: {
        id: "native",
        name: "Native (ESP-IDF)",
        description:
          "ESP-IDF bare metal development with direct register access and FreeRTOS support.",
        version: "5.1.0",
        compilerFlags: ["-nostdlib", "-ffreestanding", "-mlongcalls"],
        linkerFlags: ["-nostdlib", "--gc-sections"],
        defines: ["ESP_PLATFORM", 'IDF_VER="v5.1"'],
        includePaths: ["/esp-idf/components", "/soc/esp32s3/include"],
      },
    },
    {
      frameworkId: "arduino",
      enabled: true,
      version: "3.0.0",
      framework: {
        id: "arduino",
        name: "Arduino-ESP32",
        description:
          "Arduino framework for ESP32 with WiFi, BLE, and extensive library support.",
        version: "3.0.0",
        compilerFlags: [
          "-std=gnu++17",
          "-fno-rtti",
          "-fno-exceptions",
          "-mlongcalls",
          "-Os",
        ],
        linkerFlags: ["--gc-sections"],
        defines: [
          "ARDUINO=10819",
          "ARDUINO_ARCH_ESP32",
          "ARDUINO_ESP32S3_DEV",
          "ESP32",
        ],
        includePaths: ["/cores/esp32", "/variants/esp32s3"],
        coreUrl: "esp32/s3/frameworks/arduino/core.tar.gz",
        coreChecksum: "sha256:pending",
        requiresPreprocessing: true,
        fileExtension: ".ino",
      },
    },
  ],
};

// Mock ESP32-C3 family data based on the created family.json
const esp32c3Family: PlatformFamily = {
  id: "c3",
  name: "ESP32-C3 Series (RISC-V)",
  description:
    "Single-core RISC-V MCU with WiFi and BLE. Cost-effective solution for IoT applications.",
  architecture: "riscv32",
  devices: [
    {
      id: "esp32c3_wroom02",
      name: "ESP32-C3-WROOM-02",
      description: "4MB Flash, 400KB SRAM, WiFi+BLE - Standard module",
      flash: 4194304,
      ram: 409600,
      linkerScript: "esp32c3.ld",
      defines: ["CONFIG_IDF_TARGET_ESP32C3", "ESP32C3"],
    },
    {
      id: "esp32c3_devkitm",
      name: "ESP32-C3-DevKitM-1",
      description: "4MB Flash, 400KB SRAM, WiFi+BLE - Development board",
      flash: 4194304,
      ram: 409600,
      linkerScript: "esp32c3.ld",
      defines: ["CONFIG_IDF_TARGET_ESP32C3", "ESP32C3", "ARDUINO_ESP32C3_DEV"],
    },
  ],
  headers: {
    url: "esp32/c3/headers.tar.gz",
    size: 200000,
    checksum: "sha256:pending",
    includes: ["/esp-idf", "/riscv", "/soc"],
  },
  libs: {
    architecture: "riscv32",
    required: ["libc.a", "libgcc.a", "libhal.a"],
    optional: ["libm.a", "libstdc++.a"],
  },
  compilerFlags: [
    "--target=riscv32-unknown-elf",
    "-march=rv32imc",
    "-mabi=ilp32",
    "-nostdlib",
    "-ffreestanding",
    "-fno-exceptions",
    "-fno-rtti",
  ],
  linkerFlags: ["-nostdlib", "--gc-sections"],
  frameworks: [
    {
      frameworkId: "native",
      enabled: true,
      version: "5.1.0",
      framework: {
        id: "native",
        name: "Native (ESP-IDF)",
        description:
          "ESP-IDF bare metal development with direct register access and FreeRTOS support.",
        version: "5.1.0",
        compilerFlags: [
          "-nostdlib",
          "-ffreestanding",
          "-march=rv32imc",
          "-mabi=ilp32",
        ],
        linkerFlags: ["-nostdlib", "--gc-sections"],
        defines: ["ESP_PLATFORM", 'IDF_VER="v5.1"'],
        includePaths: ["/esp-idf/components", "/soc/esp32c3/include"],
      },
    },
    {
      frameworkId: "arduino",
      enabled: true,
      version: "3.0.0",
      framework: {
        id: "arduino",
        name: "Arduino-ESP32",
        description:
          "Arduino framework for ESP32-C3 with WiFi, BLE, and extensive library support.",
        version: "3.0.0",
        compilerFlags: [
          "-std=gnu++17",
          "-fno-rtti",
          "-fno-exceptions",
          "-march=rv32imc",
          "-mabi=ilp32",
          "-Os",
        ],
        linkerFlags: ["--gc-sections"],
        defines: [
          "ARDUINO=10819",
          "ARDUINO_ARCH_ESP32",
          "ARDUINO_ESP32C3_DEV",
          "ESP32",
        ],
        includePaths: ["/cores/esp32", "/variants/esp32c3"],
        coreUrl: "esp32/c3/frameworks/arduino/core.tar.gz",
        coreChecksum: "sha256:pending",
        requiresPreprocessing: true,
        fileExtension: ".ino",
      },
    },
  ],
};

describe("ESP32-S3 Family Schema", () => {
  it("should have valid family metadata", () => {
    expect(esp32s3Family.id).toBe("s3");
    expect(esp32s3Family.name).toBe("ESP32-S3 Series (Xtensa LX7)");
    expect(esp32s3Family.architecture).toBe("xtensa-lx7");
    expect(esp32s3Family.description).toBeDefined();
  });

  it("should have at least one device defined", () => {
    expect(esp32s3Family.devices).toBeDefined();
    expect(esp32s3Family.devices.length).toBeGreaterThan(0);
  });

  it("should have valid device definitions", () => {
    const device = esp32s3Family.devices[0];
    expect(device.id).toBe("esp32s3_wroom1");
    expect(device.name).toBeDefined();
    expect(device.flash).toBe(8388608); // 8MB
    expect(device.ram).toBe(524288); // 512KB
    expect(device.linkerScript).toBe("esp32s3.ld");
    expect(device.defines).toContain("CONFIG_IDF_TARGET_ESP32S3");
  });

  it("should have valid header bundle configuration", () => {
    expect(esp32s3Family.headers).toBeDefined();
    expect(esp32s3Family.headers.url).toBe("esp32/s3/headers.tar.gz");
    expect(esp32s3Family.headers.size).toBeGreaterThan(0);
    expect(esp32s3Family.headers.checksum).toBeDefined();
    expect(esp32s3Family.headers.includes).toContain("/esp-idf");
  });

  it("should have valid library bundle configuration", () => {
    expect(esp32s3Family.libs).toBeDefined();
    expect(esp32s3Family.libs.architecture).toBe("xtensa-lx7");
    expect(esp32s3Family.libs.required).toContain("libc.a");
    expect(esp32s3Family.libs.required).toContain("libgcc.a");
  });

  it("should have valid compiler flags for Xtensa LX7", () => {
    expect(esp32s3Family.compilerFlags).toBeDefined();
    expect(esp32s3Family.compilerFlags).toContain(
      "--target=xtensa-esp32s3-elf",
    );
    expect(esp32s3Family.compilerFlags).toContain("-mlongcalls");
    expect(esp32s3Family.compilerFlags).toContain("-nostdlib");
  });
});

describe("ESP32-C3 Family Schema", () => {
  it("should have valid family metadata", () => {
    expect(esp32c3Family.id).toBe("c3");
    expect(esp32c3Family.name).toBe("ESP32-C3 Series (RISC-V)");
    expect(esp32c3Family.architecture).toBe("riscv32");
    expect(esp32c3Family.description).toBeDefined();
  });

  it("should have at least one device defined", () => {
    expect(esp32c3Family.devices).toBeDefined();
    expect(esp32c3Family.devices.length).toBeGreaterThan(0);
  });

  it("should have valid device definitions", () => {
    const device = esp32c3Family.devices[0];
    expect(device.id).toBe("esp32c3_wroom02");
    expect(device.name).toBeDefined();
    expect(device.flash).toBe(4194304); // 4MB
    expect(device.ram).toBe(409600); // 400KB
    expect(device.linkerScript).toBe("esp32c3.ld");
    expect(device.defines).toContain("CONFIG_IDF_TARGET_ESP32C3");
  });

  it("should have valid header bundle configuration", () => {
    expect(esp32c3Family.headers).toBeDefined();
    expect(esp32c3Family.headers.url).toBe("esp32/c3/headers.tar.gz");
    expect(esp32c3Family.headers.size).toBeGreaterThan(0);
    expect(esp32c3Family.headers.checksum).toBeDefined();
    expect(esp32c3Family.headers.includes).toContain("/esp-idf");
  });

  it("should have valid library bundle configuration", () => {
    expect(esp32c3Family.libs).toBeDefined();
    expect(esp32c3Family.libs.architecture).toBe("riscv32");
    expect(esp32c3Family.libs.required).toContain("libc.a");
    expect(esp32c3Family.libs.required).toContain("libgcc.a");
  });

  it("should have valid compiler flags for RISC-V", () => {
    expect(esp32c3Family.compilerFlags).toBeDefined();
    expect(esp32c3Family.compilerFlags).toContain(
      "--target=riscv32-unknown-elf",
    );
    expect(esp32c3Family.compilerFlags).toContain("-march=rv32imc");
    expect(esp32c3Family.compilerFlags).toContain("-mabi=ilp32");
    expect(esp32c3Family.compilerFlags).toContain("-nostdlib");
  });
});

describe("ESP32-S3 Framework Support", () => {
  it("should have frameworks defined", () => {
    expect(esp32s3Family.frameworks).toBeDefined();
    expect(esp32s3Family.frameworks).toHaveLength(2);
  });

  it("should have native (ESP-IDF) framework", () => {
    const nativeFramework = esp32s3Family.frameworks?.find(
      (f) => f.frameworkId === "native",
    );
    expect(nativeFramework).toBeDefined();
    expect(nativeFramework?.enabled).toBe(true);
    expect(nativeFramework?.framework.id).toBe("native");
    expect(nativeFramework?.framework.name).toBe("Native (ESP-IDF)");
    expect(nativeFramework?.framework.version).toBe("5.1.0");
  });

  it("should have Arduino framework", () => {
    const arduinoFramework = esp32s3Family.frameworks?.find(
      (f) => f.frameworkId === "arduino",
    );
    expect(arduinoFramework).toBeDefined();
    expect(arduinoFramework?.enabled).toBe(true);
    expect(arduinoFramework?.framework.id).toBe("arduino");
    expect(arduinoFramework?.framework.name).toBe("Arduino-ESP32");
    expect(arduinoFramework?.framework.requiresPreprocessing).toBe(true);
    expect(arduinoFramework?.framework.fileExtension).toBe(".ino");
  });

  it("should have complete native framework configuration", () => {
    const nativeFramework = esp32s3Family.frameworks?.find(
      (f) => f.frameworkId === "native",
    )?.framework;
    expect(nativeFramework?.compilerFlags).toBeDefined();
    expect(nativeFramework?.compilerFlags).toContain("-mlongcalls");
    expect(nativeFramework?.defines).toContain("ESP_PLATFORM");
    expect(nativeFramework?.includePaths).toContain("/esp-idf/components");
  });

  it("should have complete Arduino framework configuration", () => {
    const arduinoFramework = esp32s3Family.frameworks?.find(
      (f) => f.frameworkId === "arduino",
    )?.framework;
    expect(arduinoFramework?.compilerFlags).toBeDefined();
    expect(arduinoFramework?.compilerFlags).toContain("-std=gnu++17");
    expect(arduinoFramework?.compilerFlags).toContain("-mlongcalls");
    expect(arduinoFramework?.defines).toContain("ARDUINO=10819");
    expect(arduinoFramework?.defines).toContain("ARDUINO_ARCH_ESP32");
    expect(arduinoFramework?.includePaths).toContain("/cores/esp32");
    expect(arduinoFramework?.includePaths).toContain("/variants/esp32s3");
    expect(arduinoFramework?.coreUrl).toBe(
      "esp32/s3/frameworks/arduino/core.tar.gz",
    );
  });
});

describe("ESP32-C3 Framework Support", () => {
  it("should have frameworks defined", () => {
    expect(esp32c3Family.frameworks).toBeDefined();
    expect(esp32c3Family.frameworks).toHaveLength(2);
  });

  it("should have native (ESP-IDF) framework", () => {
    const nativeFramework = esp32c3Family.frameworks?.find(
      (f) => f.frameworkId === "native",
    );
    expect(nativeFramework).toBeDefined();
    expect(nativeFramework?.enabled).toBe(true);
    expect(nativeFramework?.framework.id).toBe("native");
    expect(nativeFramework?.framework.name).toBe("Native (ESP-IDF)");
    expect(nativeFramework?.framework.version).toBe("5.1.0");
  });

  it("should have Arduino framework", () => {
    const arduinoFramework = esp32c3Family.frameworks?.find(
      (f) => f.frameworkId === "arduino",
    );
    expect(arduinoFramework).toBeDefined();
    expect(arduinoFramework?.enabled).toBe(true);
    expect(arduinoFramework?.framework.id).toBe("arduino");
    expect(arduinoFramework?.framework.name).toBe("Arduino-ESP32");
    expect(arduinoFramework?.framework.requiresPreprocessing).toBe(true);
    expect(arduinoFramework?.framework.fileExtension).toBe(".ino");
  });

  it("should have complete native framework configuration", () => {
    const nativeFramework = esp32c3Family.frameworks?.find(
      (f) => f.frameworkId === "native",
    )?.framework;
    expect(nativeFramework?.compilerFlags).toBeDefined();
    expect(nativeFramework?.compilerFlags).toContain("-march=rv32imc");
    expect(nativeFramework?.compilerFlags).toContain("-mabi=ilp32");
    expect(nativeFramework?.defines).toContain("ESP_PLATFORM");
    expect(nativeFramework?.includePaths).toContain("/esp-idf/components");
  });

  it("should have complete Arduino framework configuration", () => {
    const arduinoFramework = esp32c3Family.frameworks?.find(
      (f) => f.frameworkId === "arduino",
    )?.framework;
    expect(arduinoFramework?.compilerFlags).toBeDefined();
    expect(arduinoFramework?.compilerFlags).toContain("-std=gnu++17");
    expect(arduinoFramework?.compilerFlags).toContain("-march=rv32imc");
    expect(arduinoFramework?.compilerFlags).toContain("-mabi=ilp32");
    expect(arduinoFramework?.defines).toContain("ARDUINO=10819");
    expect(arduinoFramework?.defines).toContain("ARDUINO_ARCH_ESP32");
    expect(arduinoFramework?.includePaths).toContain("/cores/esp32");
    expect(arduinoFramework?.includePaths).toContain("/variants/esp32c3");
    expect(arduinoFramework?.coreUrl).toBe(
      "esp32/c3/frameworks/arduino/core.tar.gz",
    );
  });
});

describe("Architecture Configuration", () => {
  it("should have xtensa-lx7 architecture config", () => {
    const archConfig = ARCHITECTURE_CONFIGS["xtensa-lx7"];
    expect(archConfig).toBeDefined();
    expect(archConfig.target).toBe("xtensa-esp32s3-elf");
    expect(archConfig.cpu).toBe("esp32s3");
    expect(archConfig.libPath).toBe("esp32s3");
  });

  it("should have riscv32 architecture config", () => {
    const archConfig = ARCHITECTURE_CONFIGS["riscv32"];
    expect(archConfig).toBeDefined();
    expect(archConfig.target).toBe("riscv32-unknown-elf");
    expect(archConfig.cpu).toBe("generic-rv32");
    expect(archConfig.libPath).toBe("riscv32");
  });

  it("should match ESP32-S3 family architecture to config", () => {
    const archConfig = ARCHITECTURE_CONFIGS[esp32s3Family.architecture];
    expect(archConfig).toBeDefined();
    expect(archConfig.target).toBe("xtensa-esp32s3-elf");
  });

  it("should match ESP32-C3 family architecture to config", () => {
    const archConfig = ARCHITECTURE_CONFIGS[esp32c3Family.architecture];
    expect(archConfig).toBeDefined();
    expect(archConfig.target).toBe("riscv32-unknown-elf");
  });
});

describe("ESP32 Framework Compatibility", () => {
  it("should have matching framework versions across ESP32-S3 frameworks", () => {
    const nativeFramework = esp32s3Family.frameworks?.find(
      (f) => f.frameworkId === "native",
    );
    const arduinoFramework = esp32s3Family.frameworks?.find(
      (f) => f.frameworkId === "arduino",
    );

    expect(nativeFramework?.version).toBe("5.1.0");
    expect(arduinoFramework?.version).toBe("3.0.0");
  });

  it("should have matching framework versions across ESP32-C3 frameworks", () => {
    const nativeFramework = esp32c3Family.frameworks?.find(
      (f) => f.frameworkId === "native",
    );
    const arduinoFramework = esp32c3Family.frameworks?.find(
      (f) => f.frameworkId === "arduino",
    );

    expect(nativeFramework?.version).toBe("5.1.0");
    expect(arduinoFramework?.version).toBe("3.0.0");
  });

  it("should have ESP32-specific defines in Arduino framework", () => {
    const s3Arduino = esp32s3Family.frameworks?.find(
      (f) => f.frameworkId === "arduino",
    )?.framework;
    const c3Arduino = esp32c3Family.frameworks?.find(
      (f) => f.frameworkId === "arduino",
    )?.framework;

    expect(s3Arduino?.defines).toContain("ARDUINO_ARCH_ESP32");
    expect(s3Arduino?.defines).toContain("ESP32");
    expect(c3Arduino?.defines).toContain("ARDUINO_ARCH_ESP32");
    expect(c3Arduino?.defines).toContain("ESP32");
  });

  it("should have ESP-IDF defines in native framework", () => {
    const s3Native = esp32s3Family.frameworks?.find(
      (f) => f.frameworkId === "native",
    )?.framework;
    const c3Native = esp32c3Family.frameworks?.find(
      (f) => f.frameworkId === "native",
    )?.framework;

    expect(s3Native?.defines).toContain("ESP_PLATFORM");
    expect(c3Native?.defines).toContain("ESP_PLATFORM");
  });
});

describe("Device Memory Specifications", () => {
  it("should have realistic ESP32-S3 memory sizes", () => {
    const devices = esp32s3Family.devices;
    devices.forEach((device) => {
      expect(device.flash).toBeGreaterThanOrEqual(4194304); // At least 4MB
      expect(device.ram).toBeGreaterThanOrEqual(524288); // At least 512KB
    });
  });

  it("should have realistic ESP32-C3 memory sizes", () => {
    const devices = esp32c3Family.devices;
    devices.forEach((device) => {
      expect(device.flash).toBeGreaterThanOrEqual(4194304); // At least 4MB
      expect(device.ram).toBeGreaterThanOrEqual(409600); // At least 400KB
    });
  });

  it("should have proper linker scripts defined", () => {
    const s3Device = esp32s3Family.devices[0];
    const c3Device = esp32c3Family.devices[0];

    expect(s3Device.linkerScript).toBe("esp32s3.ld");
    expect(c3Device.linkerScript).toBe("esp32c3.ld");
  });
});
