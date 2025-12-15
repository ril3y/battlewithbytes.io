/**
 * Tests for Platform Type Definitions
 * Verifies framework types, interfaces, and type safety
 */

import type {
  Framework,
  FrameworkId,
  FrameworkSupport,
  PlatformFamily,
  DeviceEntry,
  HeaderBundle,
  LibBundle,
  Architecture,
} from "../types";

describe("Framework Types", () => {
  it("should accept valid FrameworkId values", () => {
    const validIds: FrameworkId[] = ["native", "arduino", "mbed", "zephyr"];

    validIds.forEach((id) => {
      expect(["native", "arduino", "mbed", "zephyr"]).toContain(id);
    });
  });

  it("should create a valid Framework object", () => {
    const framework: Framework = {
      id: "native",
      name: "Native STM32Cube HAL",
      description: "Native STM32Cube Hardware Abstraction Layer",
      version: "1.0.0",
      compilerFlags: ["-DUSE_HAL_DRIVER"],
      linkerFlags: [],
      defines: ["STM32F1", "USE_HAL_DRIVER"],
      includePaths: ["/hal/include", "/cmsis/include"],
    };

    expect(framework.id).toBe("native");
    expect(framework.name).toBe("Native STM32Cube HAL");
    expect(framework.compilerFlags).toHaveLength(1);
    expect(framework.defines).toContain("USE_HAL_DRIVER");
  });

  it("should create a Framework with optional fields", () => {
    const arduinoFramework: Framework = {
      id: "arduino",
      name: "Arduino Framework",
      description: "Arduino API for embedded systems",
      version: "1.8.19",
      compilerFlags: ["-DARDUINO=10819"],
      linkerFlags: ["-lm"],
      defines: ["ARDUINO"],
      includePaths: ["/cores/arduino", "/variants/standard"],
      coreUrl: "https://example.com/arduino-core.tar.gz",
      coreChecksum: "sha256:abc123...",
      variantsUrl: "https://example.com/arduino-variants.tar.gz",
      requiresPreprocessing: true,
      fileExtension: ".ino",
    };

    expect(arduinoFramework.requiresPreprocessing).toBe(true);
    expect(arduinoFramework.fileExtension).toBe(".ino");
    expect(arduinoFramework.coreUrl).toBeDefined();
    expect(arduinoFramework.variantsUrl).toBeDefined();
  });

  it("should create a valid FrameworkSupport object", () => {
    const framework: Framework = {
      id: "arduino",
      name: "Arduino Framework",
      description: "Arduino API for STM32",
      version: "2.0.0",
      compilerFlags: [],
      linkerFlags: [],
      defines: [],
      includePaths: [],
    };

    const frameworkSupport: FrameworkSupport = {
      frameworkId: "arduino",
      enabled: true,
      version: "2.0.0",
      framework: framework,
    };

    expect(frameworkSupport.frameworkId).toBe("arduino");
    expect(frameworkSupport.enabled).toBe(true);
    expect(frameworkSupport.framework.id).toBe("arduino");
  });
});

describe("PlatformFamily with Frameworks", () => {
  it("should create a PlatformFamily without frameworks", () => {
    const devices: DeviceEntry[] = [
      {
        id: "stm32f103c8",
        name: "STM32F103C8T6",
        flash: 65536,
        ram: 20480,
        linkerScript: "stm32f103c8.ld",
      },
    ];

    const headers: HeaderBundle = {
      url: "stm32/f1/headers.tar.gz",
      size: 1024000,
      checksum: "sha256:def456...",
      includes: ["/cmsis", "/device"],
    };

    const libs: LibBundle = {
      architecture: "cortex-m3" as Architecture,
      required: ["libc_nano.a", "libnosys.a"],
      optional: ["libm.a"],
    };

    const family: PlatformFamily = {
      id: "f1",
      name: "STM32F1 Series",
      architecture: "cortex-m3",
      devices: devices,
      headers: headers,
      libs: libs,
      compilerFlags: ["-mcpu=cortex-m3", "-mthumb"],
      linkerFlags: ["-nostdlib"],
    };

    expect(family.id).toBe("f1");
    expect(family.frameworks).toBeUndefined();
  });

  it("should create a PlatformFamily with frameworks array", () => {
    const nativeFramework: Framework = {
      id: "native",
      name: "Native HAL",
      description: "Native hardware abstraction",
      version: "1.0.0",
      compilerFlags: [],
      linkerFlags: [],
      defines: [],
      includePaths: [],
    };

    const arduinoFramework: Framework = {
      id: "arduino",
      name: "Arduino",
      description: "Arduino framework",
      version: "2.0.0",
      compilerFlags: [],
      linkerFlags: [],
      defines: [],
      includePaths: [],
      requiresPreprocessing: true,
      fileExtension: ".ino",
    };

    const frameworks: FrameworkSupport[] = [
      {
        frameworkId: "native",
        enabled: true,
        version: "1.0.0",
        framework: nativeFramework,
      },
      {
        frameworkId: "arduino",
        enabled: true,
        version: "2.0.0",
        framework: arduinoFramework,
      },
    ];

    const family: PlatformFamily = {
      id: "f1",
      name: "STM32F1 Series",
      architecture: "cortex-m3",
      devices: [],
      headers: {
        url: "headers.tar.gz",
        size: 1024,
        checksum: "sha256:123",
        includes: [],
      },
      libs: {
        architecture: "cortex-m3",
        required: [],
        optional: [],
      },
      compilerFlags: [],
      frameworks: frameworks,
    };

    expect(family.frameworks).toBeDefined();
    expect(family.frameworks).toHaveLength(2);
    expect(family.frameworks?.[0].frameworkId).toBe("native");
    expect(family.frameworks?.[1].frameworkId).toBe("arduino");
    expect(family.frameworks?.[1].framework.requiresPreprocessing).toBe(true);
  });

  it("should filter enabled frameworks", () => {
    const frameworks: FrameworkSupport[] = [
      {
        frameworkId: "native",
        enabled: true,
        version: "1.0.0",
        framework: {
          id: "native",
          name: "Native",
          description: "Native",
          version: "1.0.0",
          compilerFlags: [],
          linkerFlags: [],
          defines: [],
          includePaths: [],
        },
      },
      {
        frameworkId: "arduino",
        enabled: false,
        version: "2.0.0",
        framework: {
          id: "arduino",
          name: "Arduino",
          description: "Arduino",
          version: "2.0.0",
          compilerFlags: [],
          linkerFlags: [],
          defines: [],
          includePaths: [],
        },
      },
    ];

    const enabledFrameworks = frameworks.filter((f) => f.enabled);

    expect(enabledFrameworks).toHaveLength(1);
    expect(enabledFrameworks[0].frameworkId).toBe("native");
  });
});

describe("Framework Build Configuration", () => {
  it("should merge framework flags with platform flags", () => {
    const platformFlags = ["-mcpu=cortex-m3", "-mthumb"];

    const framework: Framework = {
      id: "arduino",
      name: "Arduino",
      description: "Arduino framework",
      version: "1.0.0",
      compilerFlags: ["-DARDUINO=10819", "-DF_CPU=72000000L"],
      linkerFlags: ["-lm"],
      defines: ["ARDUINO", "ARDUINO_ARCH_STM32"],
      includePaths: ["/cores/arduino", "/variants/bluepill"],
    };

    const mergedFlags = [...platformFlags, ...framework.compilerFlags];

    expect(mergedFlags).toHaveLength(4);
    expect(mergedFlags).toContain("-mcpu=cortex-m3");
    expect(mergedFlags).toContain("-DARDUINO=10819");
  });

  it("should handle framework-specific preprocessing", () => {
    const arduinoFramework: Framework = {
      id: "arduino",
      name: "Arduino",
      description: "Arduino framework",
      version: "1.0.0",
      compilerFlags: [],
      linkerFlags: [],
      defines: [],
      includePaths: [],
      requiresPreprocessing: true,
      fileExtension: ".ino",
    };

    const nativeFramework: Framework = {
      id: "native",
      name: "Native",
      description: "Native framework",
      version: "1.0.0",
      compilerFlags: [],
      linkerFlags: [],
      defines: [],
      includePaths: [],
    };

    expect(arduinoFramework.requiresPreprocessing).toBe(true);
    expect(arduinoFramework.fileExtension).toBe(".ino");
    expect(nativeFramework.requiresPreprocessing).toBeUndefined();
    expect(nativeFramework.fileExtension).toBeUndefined();
  });
});

describe("Type Safety", () => {
  it("should enforce FrameworkId type constraints", () => {
    // This test verifies compile-time type safety
    const validId: FrameworkId = "native";
    const anotherValidId: FrameworkId = "arduino";

    // TypeScript would catch invalid values at compile time
    // For example: const invalidId: FrameworkId = 'invalid'; // TS Error

    expect(validId).toBe("native");
    expect(anotherValidId).toBe("arduino");
  });

  it("should ensure Framework.id matches FrameworkSupport.frameworkId", () => {
    const framework: Framework = {
      id: "mbed",
      name: "Mbed OS",
      description: "ARM Mbed OS",
      version: "6.0.0",
      compilerFlags: [],
      linkerFlags: [],
      defines: [],
      includePaths: [],
    };

    const support: FrameworkSupport = {
      frameworkId: "mbed",
      enabled: true,
      version: "6.0.0",
      framework: framework,
    };

    // In a real application, this should be validated
    expect(support.frameworkId).toBe(support.framework.id);
  });
});
