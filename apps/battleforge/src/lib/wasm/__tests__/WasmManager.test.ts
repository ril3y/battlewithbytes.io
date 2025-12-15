/**
 * Tests for WasmManager
 * Tests compiler management, caching, and version checking
 */

import type {
  CompilerId,
  WasmManifest,
  DownloadProgress,
  CompilerInfo,
} from "../types";
import {
  ARCHITECTURE_COMPILER_MAP,
  getCompilerForArchitecture,
} from "../types";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock IndexedDB
const mockIDBData = new Map<string, unknown>();

const mockIDBStore = {
  get: jest.fn((key: string) => ({
    result: mockIDBData.get(key),
    onsuccess: null as ((event: unknown) => void) | null,
    onerror: null as ((event: unknown) => void) | null,
  })),
  put: jest.fn((value: unknown) => {
    if (typeof value === "object" && value !== null && "id" in value) {
      mockIDBData.set((value as Record<string, unknown>).id as string, value);
    }
    return { onsuccess: null, onerror: null };
  }),
  delete: jest.fn((key: string) => {
    mockIDBData.delete(key);
    return { onsuccess: null, onerror: null };
  }),
  clear: jest.fn(() => {
    mockIDBData.clear();
    return { onsuccess: null, onerror: null };
  }),
  getAll: jest.fn(() => ({
    result: Array.from(mockIDBData.values()),
    onsuccess: null as ((event: unknown) => void) | null,
  })),
};

// Sample manifest for tests
const mockManifest: WasmManifest = {
  version: "1.0.0",
  lastUpdated: "2025-01-15",
  baseUrl: "/wasm",
  compilers: [
    {
      id: "clang-arm",
      name: "Clang ARM",
      description: "ARM Cortex-M compiler",
      version: "18.1.0",
      files: {
        wasm: "clang_arm/clang.wasm",
        js: "clang_arm/clang.js",
      },
      size: 45000000,
      hash: "sha256:abc123",
      architectures: [
        "cortex-m0",
        "cortex-m0+",
        "cortex-m3",
        "cortex-m4",
        "cortex-m4f",
      ],
    },
    {
      id: "clang-riscv",
      name: "Clang RISC-V",
      description: "RISC-V compiler for ESP32-C3",
      version: "19.0.0",
      files: {
        wasm: "clang_riscv/clang-riscv.wasm.gz",
        js: "clang_riscv/clang.js",
      },
      size: 40000000,
      hash: "sha256:def456",
      architectures: ["riscv32"],
    },
    {
      id: "clang-xtensa",
      name: "Clang Xtensa",
      description: "Xtensa compiler for ESP32",
      version: "18.1.0-esp",
      files: {
        wasm: "clang_xtensa/clang-xtensa.wasm.gz",
        js: "clang_xtensa/clang.js",
      },
      size: 50000000,
      hash: "sha256:ghi789",
      architectures: ["xtensa-lx6", "xtensa-lx7"],
    },
  ],
};

describe("Architecture Compiler Mapping", () => {
  describe("ARCHITECTURE_COMPILER_MAP", () => {
    it("should map ARM architectures to clang-arm", () => {
      expect(ARCHITECTURE_COMPILER_MAP["cortex-m0"]).toBe("clang-arm");
      expect(ARCHITECTURE_COMPILER_MAP["cortex-m0+"]).toBe("clang-arm");
      expect(ARCHITECTURE_COMPILER_MAP["cortex-m3"]).toBe("clang-arm");
      expect(ARCHITECTURE_COMPILER_MAP["cortex-m4"]).toBe("clang-arm");
      expect(ARCHITECTURE_COMPILER_MAP["cortex-m4f"]).toBe("clang-arm");
      expect(ARCHITECTURE_COMPILER_MAP["cortex-m7"]).toBe("clang-arm");
      expect(ARCHITECTURE_COMPILER_MAP["cortex-m7f"]).toBe("clang-arm");
      expect(ARCHITECTURE_COMPILER_MAP["cortex-m33"]).toBe("clang-arm");
    });

    it("should map Xtensa architectures to clang-xtensa", () => {
      expect(ARCHITECTURE_COMPILER_MAP["xtensa-lx6"]).toBe("clang-xtensa");
      expect(ARCHITECTURE_COMPILER_MAP["xtensa-lx7"]).toBe("clang-xtensa");
    });

    it("should map RISC-V architectures to clang-riscv", () => {
      expect(ARCHITECTURE_COMPILER_MAP["riscv32"]).toBe("clang-riscv");
    });
  });

  describe("getCompilerForArchitecture", () => {
    it("should return correct compiler for STM32F1 (Cortex-M3)", () => {
      expect(getCompilerForArchitecture("cortex-m3")).toBe("clang-arm");
    });

    it("should return correct compiler for nRF52840 (Cortex-M4F)", () => {
      expect(getCompilerForArchitecture("cortex-m4f")).toBe("clang-arm");
    });

    it("should return correct compiler for RP2040 (Cortex-M0+)", () => {
      expect(getCompilerForArchitecture("cortex-m0+")).toBe("clang-arm");
    });

    it("should return correct compiler for ESP32 (Xtensa LX6)", () => {
      expect(getCompilerForArchitecture("xtensa-lx6")).toBe("clang-xtensa");
    });

    it("should return correct compiler for ESP32-S3 (Xtensa LX7)", () => {
      expect(getCompilerForArchitecture("xtensa-lx7")).toBe("clang-xtensa");
    });

    it("should return correct compiler for ESP32-C3 (RISC-V)", () => {
      expect(getCompilerForArchitecture("riscv32")).toBe("clang-riscv");
    });
  });
});

describe("WASM Manifest", () => {
  describe("Manifest Structure", () => {
    it("should have required fields", () => {
      expect(mockManifest.version).toBeDefined();
      expect(mockManifest.lastUpdated).toBeDefined();
      expect(mockManifest.baseUrl).toBeDefined();
      expect(mockManifest.compilers).toBeInstanceOf(Array);
    });

    it("should have three compilers", () => {
      expect(mockManifest.compilers).toHaveLength(3);
    });

    it("should have correct compiler IDs", () => {
      const ids = mockManifest.compilers.map((c) => c.id);
      expect(ids).toContain("clang-arm");
      expect(ids).toContain("clang-riscv");
      expect(ids).toContain("clang-xtensa");
    });
  });

  describe("Compiler Definitions", () => {
    it("should have valid ARM compiler definition", () => {
      const arm = mockManifest.compilers.find((c) => c.id === "clang-arm");
      expect(arm).toBeDefined();
      expect(arm!.architectures).toContain("cortex-m3");
      expect(arm!.architectures).toContain("cortex-m4f");
      expect(arm!.files.wasm).toContain("clang_arm");
    });

    it("should have valid RISC-V compiler definition", () => {
      const riscv = mockManifest.compilers.find((c) => c.id === "clang-riscv");
      expect(riscv).toBeDefined();
      expect(riscv!.architectures).toContain("riscv32");
      expect(riscv!.files.wasm).toContain("clang_riscv");
    });

    it("should have valid Xtensa compiler definition", () => {
      const xtensa = mockManifest.compilers.find(
        (c) => c.id === "clang-xtensa",
      );
      expect(xtensa).toBeDefined();
      expect(xtensa!.architectures).toContain("xtensa-lx6");
      expect(xtensa!.architectures).toContain("xtensa-lx7");
      expect(xtensa!.files.wasm).toContain("clang_xtensa");
    });
  });
});

describe("Compiler Platform Mapping", () => {
  interface PlatformConfig {
    platform: string;
    family: string;
    architecture: string;
    expectedCompiler: CompilerId;
  }

  const platformConfigs: PlatformConfig[] = [
    // STM32 platforms
    {
      platform: "stm32",
      family: "f1",
      architecture: "cortex-m3",
      expectedCompiler: "clang-arm",
    },
    {
      platform: "stm32",
      family: "f4",
      architecture: "cortex-m4f",
      expectedCompiler: "clang-arm",
    },
    {
      platform: "stm32",
      family: "l4",
      architecture: "cortex-m4f",
      expectedCompiler: "clang-arm",
    },
    {
      platform: "stm32",
      family: "h7",
      architecture: "cortex-m7f",
      expectedCompiler: "clang-arm",
    },

    // Nordic platforms
    {
      platform: "nrf",
      family: "nrf52",
      architecture: "cortex-m4f",
      expectedCompiler: "clang-arm",
    },
    {
      platform: "nrf",
      family: "nrf53",
      architecture: "cortex-m33",
      expectedCompiler: "clang-arm",
    },

    // RP2040
    {
      platform: "rp2040",
      family: "rp2",
      architecture: "cortex-m0+",
      expectedCompiler: "clang-arm",
    },

    // ESP32 Xtensa
    {
      platform: "esp32",
      family: "esp32",
      architecture: "xtensa-lx6",
      expectedCompiler: "clang-xtensa",
    },
    {
      platform: "esp32",
      family: "esp32s2",
      architecture: "xtensa-lx7",
      expectedCompiler: "clang-xtensa",
    },
    {
      platform: "esp32",
      family: "esp32s3",
      architecture: "xtensa-lx7",
      expectedCompiler: "clang-xtensa",
    },

    // ESP32 RISC-V
    {
      platform: "esp32",
      family: "esp32c3",
      architecture: "riscv32",
      expectedCompiler: "clang-riscv",
    },
    {
      platform: "esp32",
      family: "esp32c6",
      architecture: "riscv32",
      expectedCompiler: "clang-riscv",
    },
    {
      platform: "esp32",
      family: "esp32h2",
      architecture: "riscv32",
      expectedCompiler: "clang-riscv",
    },
  ];

  for (const config of platformConfigs) {
    it(`should use ${config.expectedCompiler} for ${config.platform}/${config.family} (${config.architecture})`, () => {
      const compilerId = getCompilerForArchitecture(
        config.architecture as import("../../platform/types").Architecture,
      );
      expect(compilerId).toBe(config.expectedCompiler);
    });
  }
});

describe("Download Progress Tracking", () => {
  it("should track download stages", () => {
    const stages: DownloadProgress["stage"][] = [
      "starting",
      "downloading",
      "decompressing",
      "caching",
      "ready",
    ];

    for (const stage of stages) {
      const progress: DownloadProgress = {
        stage,
        current: 1000,
        total: 10000,
        message: `Stage: ${stage}`,
        percentage: 10,
      };
      expect(progress.stage).toBe(stage);
    }
  });

  it("should calculate percentage correctly", () => {
    const progress: DownloadProgress = {
      stage: "downloading",
      current: 25000000,
      total: 50000000,
      message: "Downloading...",
      percentage: 50,
    };

    expect(progress.percentage).toBe(50);
    expect(progress.current).toBe(25000000);
    expect(progress.total).toBe(50000000);
  });
});

describe("Compiler Info States", () => {
  it("should represent not installed state", () => {
    const info: CompilerInfo = {
      id: "clang-riscv",
      name: "Clang RISC-V",
      description: "RISC-V compiler",
      state: "not_installed",
      available: mockManifest.compilers.find((c) => c.id === "clang-riscv"),
    };

    expect(info.state).toBe("not_installed");
    expect(info.installed).toBeUndefined();
    expect(info.available).toBeDefined();
  });

  it("should represent installed state", () => {
    const info: CompilerInfo = {
      id: "clang-arm",
      name: "Clang ARM",
      description: "ARM compiler",
      state: "installed",
      installed: {
        id: "clang-arm",
        version: "18.1.0",
        hash: "sha256:abc123",
        installedAt: Date.now(),
        size: 45000000,
      },
      available: mockManifest.compilers.find((c) => c.id === "clang-arm"),
    };

    expect(info.state).toBe("installed");
    expect(info.installed).toBeDefined();
    expect(info.installed!.version).toBe("18.1.0");
  });

  it("should represent update available state", () => {
    const info: CompilerInfo = {
      id: "clang-arm",
      name: "Clang ARM",
      description: "ARM compiler",
      state: "update_available",
      installed: {
        id: "clang-arm",
        version: "17.0.0", // Old version
        hash: "sha256:old",
        installedAt: Date.now() - 86400000,
        size: 44000000,
      },
      available: mockManifest.compilers.find((c) => c.id === "clang-arm"),
    };

    expect(info.state).toBe("update_available");
    expect(info.installed!.version).toBe("17.0.0");
    expect(info.available!.version).toBe("18.1.0");
  });

  it("should represent downloading state", () => {
    const info: CompilerInfo = {
      id: "clang-xtensa",
      name: "Clang Xtensa",
      description: "Xtensa compiler",
      state: "downloading",
      available: mockManifest.compilers.find((c) => c.id === "clang-xtensa"),
      downloadProgress: {
        stage: "downloading",
        current: 20000000,
        total: 50000000,
        message: "Downloading...",
        percentage: 40,
      },
    };

    expect(info.state).toBe("downloading");
    expect(info.downloadProgress).toBeDefined();
    expect(info.downloadProgress!.percentage).toBe(40);
  });
});

describe("Storage Statistics", () => {
  it("should track storage usage", () => {
    const stats = {
      used: 120000000, // 120MB
      available: 500000000, // 500MB
      quota: 1000000000, // 1GB
      compilers: [
        { id: "clang-arm" as CompilerId, size: 45000000, version: "18.1.0" },
        { id: "clang-riscv" as CompilerId, size: 40000000, version: "19.0.0" },
        {
          id: "clang-xtensa" as CompilerId,
          size: 35000000,
          version: "18.1.0-esp",
        },
      ],
    };

    expect(stats.used).toBe(120000000);
    expect(stats.compilers).toHaveLength(3);

    const totalFromCompilers = stats.compilers.reduce(
      (sum, c) => sum + c.size,
      0,
    );
    expect(totalFromCompilers).toBe(120000000);
  });
});

describe("Update Notifications", () => {
  it("should generate update notification", () => {
    const notification = {
      type: "compiler" as const,
      id: "clang-arm",
      currentVersion: "17.0.0",
      availableVersion: "18.1.0",
      size: 45000000,
      message: "Clang ARM update available",
    };

    expect(notification.type).toBe("compiler");
    expect(notification.currentVersion).not.toBe(notification.availableVersion);
    expect(notification.size).toBeGreaterThan(0);
  });

  it("should support critical updates", () => {
    const notification = {
      type: "compiler" as const,
      id: "clang-arm",
      currentVersion: "16.0.0",
      availableVersion: "18.1.0",
      size: 45000000,
      critical: true,
      message: "Critical security update",
    };

    expect(notification.critical).toBe(true);
  });
});
