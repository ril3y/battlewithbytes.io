/**
 * Tests for WASM Dual Versioning System
 * Tests manifest normalization, version parsing, and backward compatibility
 */

import type {
  WasmManifest,
  AvailableCompiler,
  AvailableLinker,
} from "../types";

// Test data - v1 (legacy) manifest format
const legacyManifest = {
  version: "1.0.0",
  lastUpdated: "2025-01-15",
  baseUrl: "/wasm",
  compilers: [
    {
      id: "clang-arm",
      name: "Clang ARM",
      description: "ARM Cortex-M compiler",
      version: "21.1.4", // Legacy: single version field
      files: {
        wasm: "clang_arm/clang.wasm.gz",
        js: "clang_arm/clang.js",
      },
      size: 21633425,
      hash: "sha256:abc123", // Legacy: single hash field
      architectures: ["cortex-m0", "cortex-m3", "cortex-m4"],
    },
  ],
  linkers: [
    {
      id: "lld-universal",
      name: "LLD Universal",
      version: "18.1.2-esp",
      files: {
        wasm: "lld.wasm.gz",
        js: "lld.js",
      },
      size: 10251176,
      hash: "sha256:def456",
    },
  ],
};

// Test data - v2 (dual versioning) manifest format
const v2Manifest: WasmManifest = {
  schemaVersion: "2.0.0",
  lastUpdated: "2025-12-15T15:00:00Z",
  releaseChannel: "stable",
  compilers: [
    {
      id: "clang-arm",
      name: "Clang ARM",
      description: "ARM Cortex-M compiler",
      status: "stable",
      softwareVersion: "21.1.4",
      releaseVersion: "1.0.3",
      fullVersion: "21.1.4-r1.0.3",
      releaseNotes: "Fixed FPU codegen for Cortex-M4F",
      releaseDate: "2025-12-15",
      files: {
        wasm: "clang_arm/clang.wasm.gz",
        js: "clang_arm/clang.js",
      },
      size: 21633425,
      sizeUncompressed: 52428800,
      hashes: {
        compressed: "sha256:abc123def456",
        uncompressed: "sha256:xyz789",
      },
      architectures: ["cortex-m0", "cortex-m3", "cortex-m4", "cortex-m4f"],
      buildInfo: {
        llvmCommit: "abc123",
        buildDate: "2025-12-15T10:00:00Z",
        buildScript: "build-clang-arm.sh",
        buildHost: "buildbox-192.168.1.62",
      },
      minAppVersion: "1.0.0",
    },
  ],
  linkers: [
    {
      id: "lld-universal",
      name: "LLD Universal",
      description: "Universal linker",
      status: "stable",
      softwareVersion: "18.1.2-esp",
      releaseVersion: "1.0.0",
      fullVersion: "18.1.2-esp-r1.0.0",
      files: {
        wasm: "lld.wasm.gz",
        js: "lld.js",
      },
      size: 10251176,
      hashes: {
        compressed: "sha256:def456ghi789",
      },
      architectures: ["arm", "riscv32", "xtensa"],
    },
  ],
  meta: {
    cdnBaseUrl: "https://cdn.battlewithbytes.com/wasm",
    fallbackBaseUrl: "/wasm",
    checksumAlgorithm: "sha256",
  },
};

describe("WASM Dual Versioning System", () => {
  describe("V2 Manifest Structure", () => {
    it("should have schemaVersion field", () => {
      expect(v2Manifest.schemaVersion).toBe("2.0.0");
    });

    it("should have releaseChannel field", () => {
      expect(v2Manifest.releaseChannel).toBe("stable");
    });

    it("should have ISO 8601 timestamp", () => {
      expect(v2Manifest.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should have meta configuration", () => {
      expect(v2Manifest.meta).toBeDefined();
      expect(v2Manifest.meta?.cdnBaseUrl).toBe("https://cdn.battlewithbytes.com/wasm");
      expect(v2Manifest.meta?.fallbackBaseUrl).toBe("/wasm");
    });
  });

  describe("Dual Versioning Fields", () => {
    const compiler = v2Manifest.compilers[0];

    it("should have softwareVersion (upstream)", () => {
      expect(compiler.softwareVersion).toBe("21.1.4");
    });

    it("should have releaseVersion (BattleForge build)", () => {
      expect(compiler.releaseVersion).toBe("1.0.3");
    });

    it("should have fullVersion (combined)", () => {
      expect(compiler.fullVersion).toBe("21.1.4-r1.0.3");
    });

    it("should have correct fullVersion format", () => {
      expect(compiler.fullVersion).toMatch(/^[\d.]+-r[\d.]+$/);
    });

    it("fullVersion should contain softwareVersion", () => {
      expect(compiler.fullVersion).toContain(compiler.softwareVersion);
    });

    it("fullVersion should contain releaseVersion", () => {
      expect(compiler.fullVersion).toContain(compiler.releaseVersion);
    });
  });

  describe("Hash Structure", () => {
    const compiler = v2Manifest.compilers[0];

    it("should have hashes object", () => {
      expect(compiler.hashes).toBeDefined();
    });

    it("should have compressed hash", () => {
      expect(compiler.hashes.compressed).toBeDefined();
      expect(compiler.hashes.compressed).toMatch(/^sha256:/);
    });

    it("should support uncompressed hash", () => {
      expect(compiler.hashes.uncompressed).toBeDefined();
    });
  });

  describe("Build Info", () => {
    const compiler = v2Manifest.compilers[0];

    it("should have buildInfo", () => {
      expect(compiler.buildInfo).toBeDefined();
    });

    it("should have llvmCommit", () => {
      expect(compiler.buildInfo?.llvmCommit).toBe("abc123");
    });

    it("should have buildDate", () => {
      expect(compiler.buildInfo?.buildDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should have buildScript", () => {
      expect(compiler.buildInfo?.buildScript).toBe("build-clang-arm.sh");
    });

    it("should have buildHost", () => {
      expect(compiler.buildInfo?.buildHost).toBe("buildbox-192.168.1.62");
    });
  });

  describe("Release Metadata", () => {
    const compiler = v2Manifest.compilers[0];

    it("should have releaseNotes", () => {
      expect(compiler.releaseNotes).toBeDefined();
      expect(compiler.releaseNotes).toContain("FPU");
    });

    it("should have releaseDate", () => {
      expect(compiler.releaseDate).toBe("2025-12-15");
    });

    it("should have status", () => {
      expect(compiler.status).toBe("stable");
    });

    it("should have minAppVersion", () => {
      expect(compiler.minAppVersion).toBe("1.0.0");
    });
  });

  describe("Linker Dual Versioning", () => {
    const linker = v2Manifest.linkers![0];

    it("should have softwareVersion", () => {
      expect(linker.softwareVersion).toBe("18.1.2-esp");
    });

    it("should have releaseVersion", () => {
      expect(linker.releaseVersion).toBe("1.0.0");
    });

    it("should have fullVersion", () => {
      expect(linker.fullVersion).toBe("18.1.2-esp-r1.0.0");
    });

    it("should have hashes object", () => {
      expect(linker.hashes).toBeDefined();
      expect(linker.hashes.compressed).toMatch(/^sha256:/);
    });
  });
});

describe("Manifest Normalization (Backward Compatibility)", () => {
  // Helper to normalize compiler (simulating WasmLoader behavior)
  function normalizeCompiler(compiler: Record<string, unknown>): AvailableCompiler {
    if (!compiler.softwareVersion && compiler.version) {
      compiler.softwareVersion = compiler.version as string;
    }
    if (!compiler.releaseVersion) {
      compiler.releaseVersion = "1.0.0";
    }
    if (!compiler.fullVersion) {
      compiler.fullVersion = `${compiler.softwareVersion}-r${compiler.releaseVersion}`;
    }
    if (!compiler.version) {
      compiler.version = compiler.fullVersion;
    }
    if (!compiler.hashes && compiler.hash) {
      compiler.hashes = { compressed: compiler.hash as string };
    }
    if (compiler.hashes && !compiler.hash) {
      compiler.hash = (compiler.hashes as { compressed: string }).compressed;
    }
    return compiler as unknown as AvailableCompiler;
  }

  describe("Legacy Manifest Normalization", () => {
    it("should add softwareVersion from version field", () => {
      const legacyCompiler = { ...legacyManifest.compilers[0] };
      const normalized = normalizeCompiler(legacyCompiler as Record<string, unknown>);

      expect(normalized.softwareVersion).toBe("21.1.4");
    });

    it("should add default releaseVersion", () => {
      const legacyCompiler = { ...legacyManifest.compilers[0] };
      const normalized = normalizeCompiler(legacyCompiler as Record<string, unknown>);

      expect(normalized.releaseVersion).toBe("1.0.0");
    });

    it("should generate fullVersion from components", () => {
      const legacyCompiler = { ...legacyManifest.compilers[0] };
      const normalized = normalizeCompiler(legacyCompiler as Record<string, unknown>);

      expect(normalized.fullVersion).toBe("21.1.4-r1.0.0");
    });

    it("should convert hash to hashes object", () => {
      const legacyCompiler = { ...legacyManifest.compilers[0] };
      const normalized = normalizeCompiler(legacyCompiler as Record<string, unknown>);

      expect(normalized.hashes).toBeDefined();
      expect(normalized.hashes.compressed).toBe("sha256:abc123");
    });

    it("should preserve version alias for backward compat", () => {
      const legacyCompiler = { ...legacyManifest.compilers[0] };
      const normalized = normalizeCompiler(legacyCompiler as Record<string, unknown>);

      expect(normalized.version).toBeDefined();
    });

    it("should preserve hash alias for backward compat", () => {
      const legacyCompiler = { ...legacyManifest.compilers[0] };
      const normalized = normalizeCompiler(legacyCompiler as Record<string, unknown>);

      expect(normalized.hash).toBe("sha256:abc123");
    });
  });

  describe("V2 Manifest Preservation", () => {
    it("should not modify softwareVersion if present", () => {
      const v2Compiler = { ...v2Manifest.compilers[0] } as Record<string, unknown>;
      const normalized = normalizeCompiler(v2Compiler);

      expect(normalized.softwareVersion).toBe("21.1.4");
    });

    it("should not modify releaseVersion if present", () => {
      const v2Compiler = { ...v2Manifest.compilers[0] } as Record<string, unknown>;
      const normalized = normalizeCompiler(v2Compiler);

      expect(normalized.releaseVersion).toBe("1.0.3");
    });

    it("should not modify fullVersion if present", () => {
      const v2Compiler = { ...v2Manifest.compilers[0] } as Record<string, unknown>;
      const normalized = normalizeCompiler(v2Compiler);

      expect(normalized.fullVersion).toBe("21.1.4-r1.0.3");
    });
  });
});

describe("Version Comparison", () => {
  interface Version {
    major: number;
    minor: number;
    patch: number;
  }

  function parseVersion(version: string): Version {
    const parts = version.split(".").map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
    };
  }

  function compareVersions(a: Version, b: Version): number {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    return a.patch - b.patch;
  }

  describe("parseVersion", () => {
    it("should parse semver correctly", () => {
      const v = parseVersion("1.2.3");
      expect(v.major).toBe(1);
      expect(v.minor).toBe(2);
      expect(v.patch).toBe(3);
    });

    it("should handle partial versions", () => {
      const v = parseVersion("1.2");
      expect(v.major).toBe(1);
      expect(v.minor).toBe(2);
      expect(v.patch).toBe(0);
    });
  });

  describe("compareVersions", () => {
    it("should detect major version bump", () => {
      const installed = parseVersion("1.0.0");
      const available = parseVersion("2.0.0");
      expect(compareVersions(available, installed)).toBeGreaterThan(0);
    });

    it("should detect minor version bump", () => {
      const installed = parseVersion("1.0.0");
      const available = parseVersion("1.1.0");
      expect(compareVersions(available, installed)).toBeGreaterThan(0);
    });

    it("should detect patch version bump", () => {
      const installed = parseVersion("1.0.0");
      const available = parseVersion("1.0.3");
      expect(compareVersions(available, installed)).toBeGreaterThan(0);
    });

    it("should return 0 for equal versions", () => {
      const installed = parseVersion("1.0.3");
      const available = parseVersion("1.0.3");
      expect(compareVersions(available, installed)).toBe(0);
    });

    it("should return negative for older version", () => {
      const installed = parseVersion("2.0.0");
      const available = parseVersion("1.0.0");
      expect(compareVersions(available, installed)).toBeLessThan(0);
    });
  });

  describe("Update Detection", () => {
    it("should detect when releaseVersion update is available", () => {
      const installedRelease = parseVersion("1.0.0");
      const availableRelease = parseVersion("1.0.3");
      expect(compareVersions(availableRelease, installedRelease)).toBeGreaterThan(0);
    });

    it("should identify major updates as critical", () => {
      const installed = parseVersion("1.0.0");
      const available = parseVersion("2.0.0");
      const isMajor = available.major > installed.major;
      expect(isMajor).toBe(true);
    });

    it("should identify minor updates as feature updates", () => {
      const installed = parseVersion("1.0.0");
      const available = parseVersion("1.1.0");
      const isMinor = available.major === installed.major && available.minor > installed.minor;
      expect(isMinor).toBe(true);
    });

    it("should identify patch updates as bugfixes", () => {
      const installed = parseVersion("1.0.0");
      const available = parseVersion("1.0.1");
      const isPatch = available.major === installed.major &&
                       available.minor === installed.minor &&
                       available.patch > installed.patch;
      expect(isPatch).toBe(true);
    });
  });
});

describe("Full Version String Parsing", () => {
  function parseFullVersion(fullVersion: string): { software: string; release: string } | null {
    const match = fullVersion.match(/^(.+)-r(\d+\.\d+\.\d+)$/);
    if (!match) return null;
    return {
      software: match[1],
      release: match[2],
    };
  }

  it("should parse standard full version", () => {
    const result = parseFullVersion("21.1.4-r1.0.3");
    expect(result).not.toBeNull();
    expect(result!.software).toBe("21.1.4");
    expect(result!.release).toBe("1.0.3");
  });

  it("should parse version with suffix", () => {
    const result = parseFullVersion("18.1.2-esp-r1.0.0");
    expect(result).not.toBeNull();
    expect(result!.software).toBe("18.1.2-esp");
    expect(result!.release).toBe("1.0.0");
  });

  it("should return null for invalid format", () => {
    const result = parseFullVersion("21.1.4");
    expect(result).toBeNull();
  });
});
