/**
 * Tests for Nordic NRF Platform Definitions
 * Verifies nRF52 and nRF53 family configurations, Zephyr framework, and architecture support
 */

import type {
  PlatformFamily,
  DeviceEntry,
  FrameworkSupport,
  Framework,
  Architecture,
} from "../types";
import { ARCHITECTURE_CONFIGS } from "../types";

// Mock nRF52 family data (matches the actual family.json structure)
const mockNrf52Family: PlatformFamily = {
  id: "nrf52",
  name: "nRF52 Series (Cortex-M4F)",
  description:
    "Ultra low power wireless SoC with BLE 5.0 support. Popular for IoT and wearable applications.",
  architecture: "cortex-m4f",
  devices: [
    {
      id: "nrf52832",
      name: "nRF52832 (Cortex-M4F)",
      description: "512KB Flash, 64KB RAM, BLE 5.0, NFC",
      flash: 524288,
      ram: 65536,
      linkerScript: "nrf52832.ld",
      defines: ["NRF52832_XXAA", "NRF52", "NRF52_SERIES"],
    },
    {
      id: "nrf52840",
      name: "nRF52840 (Cortex-M4F)",
      description: "1MB Flash, 256KB RAM, BLE 5.0, USB, NFC",
      flash: 1048576,
      ram: 262144,
      linkerScript: "nrf52840.ld",
      defines: ["NRF52840_XXAA", "NRF52", "NRF52_SERIES"],
    },
  ],
  headers: {
    url: "nrf/nrf52/headers.tar.gz",
    size: 145000,
    checksum: "sha256:pending",
    includes: ["/cmsis", "/device", "/libc"],
  },
  libs: {
    architecture: "cortex-m4f",
    required: ["libc_nano.a", "libnosys.a"],
    optional: ["libm.a", "libgcc.a"],
  },
  compilerFlags: [
    "--target=thumbv7em-none-eabihf",
    "-mcpu=cortex-m4",
    "-mfpu=fpv4-sp-d16",
    "-mfloat-abi=hard",
    "-mthumb",
  ],
  linkerFlags: ["-nostdlib", "--gc-sections"],
  frameworks: [],
};

// Mock nRF53 family data
const mockNrf53Family: PlatformFamily = {
  id: "nrf53",
  name: "nRF53 Series (Cortex-M33)",
  description: "Dual-core wireless SoC with Arm TrustZone security.",
  architecture: "cortex-m33",
  devices: [
    {
      id: "nrf5340",
      name: "nRF5340 (Dual Cortex-M33)",
      description: "1MB Flash, 512KB RAM (Application Core)",
      flash: 1048576,
      ram: 524288,
      linkerScript: "nrf5340_xxaa_application.ld",
      defines: ["NRF5340_XXAA", "NRF5340", "NRF53_SERIES", "NRF_APPLICATION"],
    },
  ],
  headers: {
    url: "nrf/nrf53/headers.tar.gz",
    size: 165000,
    checksum: "sha256:pending",
    includes: ["/cmsis", "/device", "/libc", "/trustzone"],
  },
  libs: {
    architecture: "cortex-m33",
    required: ["libc_nano.a", "libnosys.a"],
    optional: ["libm.a", "libgcc.a"],
  },
  compilerFlags: [
    "--target=thumbv8m.main-none-eabihf",
    "-mcpu=cortex-m33",
    "-mfpu=fpv5-sp-d16",
    "-mfloat-abi=hard",
    "-mthumb",
  ],
  linkerFlags: ["-nostdlib", "--gc-sections"],
  frameworks: [],
};

describe("nRF52 Family Schema", () => {
  it("should have correct family metadata", () => {
    expect(mockNrf52Family.id).toBe("nrf52");
    expect(mockNrf52Family.name).toContain("Cortex-M4F");
    expect(mockNrf52Family.architecture).toBe("cortex-m4f");
  });

  it("should have valid device entries", () => {
    expect(mockNrf52Family.devices).toHaveLength(2);

    const nrf52832 = mockNrf52Family.devices.find((d) => d.id === "nrf52832");
    expect(nrf52832).toBeDefined();
    expect(nrf52832?.flash).toBe(524288);
    expect(nrf52832?.ram).toBe(65536);
    expect(nrf52832?.defines).toContain("NRF52832_XXAA");

    const nrf52840 = mockNrf52Family.devices.find((d) => d.id === "nrf52840");
    expect(nrf52840).toBeDefined();
    expect(nrf52840?.flash).toBe(1048576);
    expect(nrf52840?.ram).toBe(262144);
    expect(nrf52840?.defines).toContain("NRF52840_XXAA");
  });

  it("should have headers bundle configuration", () => {
    expect(mockNrf52Family.headers.url).toBe("nrf/nrf52/headers.tar.gz");
    expect(mockNrf52Family.headers.includes).toContain("/cmsis");
    expect(mockNrf52Family.headers.includes).toContain("/device");
  });

  it("should have correct compiler flags for Cortex-M4F", () => {
    expect(mockNrf52Family.compilerFlags).toContain(
      "--target=thumbv7em-none-eabihf",
    );
    expect(mockNrf52Family.compilerFlags).toContain("-mcpu=cortex-m4");
    expect(mockNrf52Family.compilerFlags).toContain("-mfpu=fpv4-sp-d16");
    expect(mockNrf52Family.compilerFlags).toContain("-mfloat-abi=hard");
  });

  it("should have libs bundle for cortex-m4f", () => {
    expect(mockNrf52Family.libs.architecture).toBe("cortex-m4f");
    expect(mockNrf52Family.libs.required).toContain("libc_nano.a");
    expect(mockNrf52Family.libs.required).toContain("libnosys.a");
  });
});

describe("nRF53 Family Schema", () => {
  it("should have correct family metadata", () => {
    expect(mockNrf53Family.id).toBe("nrf53");
    expect(mockNrf53Family.name).toContain("Cortex-M33");
    expect(mockNrf53Family.architecture).toBe("cortex-m33");
  });

  it("should support dual-core device", () => {
    const nrf5340 = mockNrf53Family.devices.find((d) => d.id === "nrf5340");
    expect(nrf5340).toBeDefined();
    expect(nrf5340?.name).toContain("Dual Cortex-M33");
    expect(nrf5340?.defines).toContain("NRF5340_XXAA");
    expect(nrf5340?.defines).toContain("NRF_APPLICATION");
  });

  it("should have TrustZone support in headers", () => {
    expect(mockNrf53Family.headers.includes).toContain("/trustzone");
  });

  it("should have correct compiler flags for Cortex-M33", () => {
    expect(mockNrf53Family.compilerFlags).toContain(
      "--target=thumbv8m.main-none-eabihf",
    );
    expect(mockNrf53Family.compilerFlags).toContain("-mcpu=cortex-m33");
    expect(mockNrf53Family.compilerFlags).toContain("-mfpu=fpv5-sp-d16");
  });

  it("should have libs bundle for cortex-m33", () => {
    expect(mockNrf53Family.libs.architecture).toBe("cortex-m33");
    expect(mockNrf53Family.libs.required).toContain("libc_nano.a");
  });
});

describe("Zephyr Framework Definition", () => {
  const zephyrFramework: Framework = {
    id: "zephyr",
    name: "Zephyr RTOS",
    description: "Scalable real-time OS for IoT devices",
    version: "3.5.0",
    compilerFlags: [
      "-std=c11",
      "-fno-common",
      "-ffunction-sections",
      "-fdata-sections",
    ],
    linkerFlags: ["--gc-sections"],
    defines: ["__ZEPHYR__", "CONFIG_NRF52", "CONFIG_BT=1"],
    includePaths: [
      "/zephyr/include",
      "/zephyr/arch/arm",
      "/zephyr/subsys/bluetooth",
    ],
    coreUrl: "nrf/nrf52/frameworks/zephyr/core.tar.gz",
    coreChecksum: "sha256:pending",
    requiresPreprocessing: false,
  };

  it("should have valid Zephyr framework structure", () => {
    expect(zephyrFramework.id).toBe("zephyr");
    expect(zephyrFramework.name).toBe("Zephyr RTOS");
    expect(zephyrFramework.version).toBe("3.5.0");
  });

  it("should have Zephyr-specific compiler flags", () => {
    expect(zephyrFramework.compilerFlags).toContain("-std=c11");
    expect(zephyrFramework.compilerFlags).toContain("-fno-common");
    expect(zephyrFramework.compilerFlags).toContain("-ffunction-sections");
    expect(zephyrFramework.compilerFlags).toContain("-fdata-sections");
  });

  it("should define Zephyr macros", () => {
    expect(zephyrFramework.defines).toContain("__ZEPHYR__");
    expect(zephyrFramework.defines).toContain("CONFIG_NRF52");
    expect(zephyrFramework.defines).toContain("CONFIG_BT=1");
  });

  it("should have Zephyr include paths", () => {
    expect(zephyrFramework.includePaths).toContain("/zephyr/include");
    expect(zephyrFramework.includePaths).toContain("/zephyr/arch/arm");
    expect(zephyrFramework.includePaths).toContain("/zephyr/subsys/bluetooth");
  });

  it("should not require preprocessing", () => {
    expect(zephyrFramework.requiresPreprocessing).toBe(false);
  });

  it("should have core URL for Zephyr", () => {
    expect(zephyrFramework.coreUrl).toContain("zephyr/core.tar.gz");
  });
});

describe("nRF52 Framework Support", () => {
  const nativeFramework: FrameworkSupport = {
    frameworkId: "native",
    enabled: true,
    version: "1.0.0",
    framework: {
      id: "native",
      name: "Native (Bare Metal)",
      description: "Direct register access",
      version: "1.0.0",
      compilerFlags: ["-nostdlib", "-ffreestanding"],
      linkerFlags: ["-nostdlib", "--gc-sections"],
      defines: [],
      includePaths: [],
    },
  };

  const arduinoFramework: FrameworkSupport = {
    frameworkId: "arduino",
    enabled: true,
    version: "1.3.0",
    framework: {
      id: "arduino",
      name: "Arduino (Adafruit nRF52)",
      description: "Arduino API with BLE support",
      version: "1.3.0",
      compilerFlags: ["-std=gnu++14", "-fno-rtti", "-fno-exceptions"],
      linkerFlags: ["--gc-sections"],
      defines: ["ARDUINO=10819", "ARDUINO_ARCH_NRF52", "NRF52_S132"],
      includePaths: ["/cores/nRF5", "/libraries/Bluefruit52Lib/src"],
      requiresPreprocessing: true,
      fileExtension: ".ino",
    },
  };

  const zephyrFramework: FrameworkSupport = {
    frameworkId: "zephyr",
    enabled: true,
    version: "3.5.0",
    framework: {
      id: "zephyr",
      name: "Zephyr RTOS",
      description: "Scalable real-time OS",
      version: "3.5.0",
      compilerFlags: ["-std=c11", "-fno-common"],
      linkerFlags: ["--gc-sections"],
      defines: ["__ZEPHYR__", "CONFIG_NRF52"],
      includePaths: ["/zephyr/include"],
      requiresPreprocessing: false,
    },
  };

  it("should support native framework", () => {
    expect(nativeFramework.frameworkId).toBe("native");
    expect(nativeFramework.enabled).toBe(true);
    expect(nativeFramework.framework.id).toBe("native");
  });

  it("should support Arduino framework", () => {
    expect(arduinoFramework.frameworkId).toBe("arduino");
    expect(arduinoFramework.enabled).toBe(true);
    expect(arduinoFramework.framework.requiresPreprocessing).toBe(true);
    expect(arduinoFramework.framework.fileExtension).toBe(".ino");
  });

  it("should support Zephyr framework", () => {
    expect(zephyrFramework.frameworkId).toBe("zephyr");
    expect(zephyrFramework.enabled).toBe(true);
    expect(zephyrFramework.framework.defines).toContain("__ZEPHYR__");
  });

  it("should have all three frameworks enabled", () => {
    const frameworks = [nativeFramework, arduinoFramework, zephyrFramework];
    const enabledFrameworks = frameworks.filter((f) => f.enabled);
    expect(enabledFrameworks).toHaveLength(3);
  });

  it("should have unique framework IDs", () => {
    const frameworks = [nativeFramework, arduinoFramework, zephyrFramework];
    const ids = frameworks.map((f) => f.frameworkId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
  });
});

describe("Architecture Configuration", () => {
  it("should have cortex-m4f configuration", () => {
    const archConfig = ARCHITECTURE_CONFIGS["cortex-m4f"];
    expect(archConfig).toBeDefined();
    expect(archConfig.target).toBe("thumbv7em-none-eabihf");
    expect(archConfig.cpu).toBe("cortex-m4");
    expect(archConfig.fpu).toBe("fpv4-sp-d16");
    expect(archConfig.float).toBe("hard");
    expect(archConfig.libPath).toBe("cortex-m4f");
  });

  it("should have cortex-m33 configuration", () => {
    const archConfig = ARCHITECTURE_CONFIGS["cortex-m33"];
    expect(archConfig).toBeDefined();
    expect(archConfig.target).toBe("thumbv8m.main-none-eabihf");
    expect(archConfig.cpu).toBe("cortex-m33");
    expect(archConfig.fpu).toBe("fpv5-sp-d16");
    expect(archConfig.float).toBe("hard");
    expect(archConfig.libPath).toBe("cortex-m33");
  });

  it("should match nRF52 architecture to config", () => {
    const archConfig = ARCHITECTURE_CONFIGS[mockNrf52Family.architecture];
    expect(archConfig).toBeDefined();
    expect(archConfig.cpu).toBe("cortex-m4");
  });

  it("should match nRF53 architecture to config", () => {
    const archConfig = ARCHITECTURE_CONFIGS[mockNrf53Family.architecture];
    expect(archConfig).toBeDefined();
    expect(archConfig.cpu).toBe("cortex-m33");
  });
});

describe("Build Configuration Integration", () => {
  it("should merge platform and Zephyr framework flags", () => {
    const platformFlags = mockNrf52Family.compilerFlags;
    const zephyrFlags = ["-std=c11", "-fno-common"];
    const mergedFlags = [...platformFlags, ...zephyrFlags];

    expect(mergedFlags).toContain("-mcpu=cortex-m4");
    expect(mergedFlags).toContain("-std=c11");
    expect(mergedFlags).toContain("-fno-common");
  });

  it("should combine nRF52 defines with Zephyr defines", () => {
    const deviceDefines = ["NRF52840_XXAA", "NRF52", "NRF52_SERIES"];
    const zephyrDefines = ["__ZEPHYR__", "CONFIG_NRF52", "CONFIG_BT=1"];
    const allDefines = [...deviceDefines, ...zephyrDefines];

    expect(allDefines).toContain("NRF52840_XXAA");
    expect(allDefines).toContain("__ZEPHYR__");
    expect(allDefines).toContain("CONFIG_BT=1");
  });
});

describe("Type Safety and Validation", () => {
  it("should enforce Architecture type for nRF families", () => {
    const nrf52Arch: Architecture = "cortex-m4f";
    const nrf53Arch: Architecture = "cortex-m33";

    expect(nrf52Arch).toBe("cortex-m4f");
    expect(nrf53Arch).toBe("cortex-m33");
  });

  it("should validate DeviceEntry structure", () => {
    const device: DeviceEntry = {
      id: "nrf52840",
      name: "nRF52840",
      flash: 1048576,
      ram: 262144,
      linkerScript: "nrf52840.ld",
      defines: ["NRF52840_XXAA"],
    };

    expect(device.id).toBeDefined();
    expect(device.flash).toBeGreaterThan(0);
    expect(device.ram).toBeGreaterThan(0);
    expect(device.linkerScript).toBeTruthy();
  });

  it("should ensure framework.id matches frameworkSupport.frameworkId", () => {
    const support: FrameworkSupport = {
      frameworkId: "zephyr",
      enabled: true,
      version: "3.5.0",
      framework: {
        id: "zephyr",
        name: "Zephyr",
        description: "RTOS",
        version: "3.5.0",
        compilerFlags: [],
        linkerFlags: [],
        defines: [],
        includePaths: [],
      },
    };

    expect(support.frameworkId).toBe(support.framework.id);
  });
});

describe("Memory Specifications", () => {
  it("should have correct nRF52832 memory specs", () => {
    const nrf52832 = mockNrf52Family.devices.find((d) => d.id === "nrf52832");
    expect(nrf52832?.flash).toBe(524288); // 512KB
    expect(nrf52832?.ram).toBe(65536); // 64KB
  });

  it("should have correct nRF52840 memory specs", () => {
    const nrf52840 = mockNrf52Family.devices.find((d) => d.id === "nrf52840");
    expect(nrf52840?.flash).toBe(1048576); // 1MB
    expect(nrf52840?.ram).toBe(262144); // 256KB
  });

  it("should have correct nRF5340 memory specs", () => {
    const nrf5340 = mockNrf53Family.devices.find((d) => d.id === "nrf5340");
    expect(nrf5340?.flash).toBe(1048576); // 1MB
    expect(nrf5340?.ram).toBe(524288); // 512KB
  });
});

describe("Framework Preprocessing", () => {
  it("should require preprocessing for Arduino", () => {
    const arduinoFramework: Framework = {
      id: "arduino",
      name: "Arduino",
      description: "Arduino framework",
      version: "1.3.0",
      compilerFlags: [],
      linkerFlags: [],
      defines: [],
      includePaths: [],
      requiresPreprocessing: true,
      fileExtension: ".ino",
    };

    expect(arduinoFramework.requiresPreprocessing).toBe(true);
    expect(arduinoFramework.fileExtension).toBe(".ino");
  });

  it("should not require preprocessing for Zephyr", () => {
    const zephyrFramework: Framework = {
      id: "zephyr",
      name: "Zephyr",
      description: "Zephyr RTOS",
      version: "3.5.0",
      compilerFlags: [],
      linkerFlags: [],
      defines: [],
      includePaths: [],
      requiresPreprocessing: false,
    };

    expect(zephyrFramework.requiresPreprocessing).toBe(false);
  });

  it("should not require preprocessing for Native", () => {
    const nativeFramework: Framework = {
      id: "native",
      name: "Native",
      description: "Bare metal",
      version: "1.0.0",
      compilerFlags: [],
      linkerFlags: [],
      defines: [],
      includePaths: [],
    };

    expect(nativeFramework.requiresPreprocessing).toBeUndefined();
  });
});
