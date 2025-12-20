/**
 * FrameworkManager Tests
 *
 * Tests for framework loading, caching, and core files management
 */

/* Jest globals: describe, it, expect, beforeEach, afterEach */
import { FrameworkManager } from "../FrameworkManager";
import type { Framework, FrameworkId } from "../../platform/types";

// Mock IndexedDB for testing
class MockIDBDatabase {
  objectStoreNames = {
    contains: () => false,
  };
}

class MockIDBRequest {
  result: any = null;
  error: any = null;
  onsuccess: (() => void) | null = null;
  onerror: (() => void) | null = null;
}

// Mock global indexedDB if not available
if (typeof indexedDB === "undefined") {
  (global as any).indexedDB = {
    open: () => {
      const request = new MockIDBRequest();
      setTimeout(() => {
        request.result = new MockIDBDatabase();
        request.onsuccess?.();
      }, 0);
      return request;
    },
  };
}

// Mock DecompressionStream if not available
if (typeof DecompressionStream === "undefined") {
  (global as any).DecompressionStream = class {
    constructor() {}
  };
}

describe("FrameworkManager", () => {
  let frameworkManager: FrameworkManager;
  let fetchMock: any;

  const mockFramework: Framework = {
    id: "arduino",
    name: "Arduino Core for STM32",
    description: "Arduino framework for STM32 microcontrollers",
    version: "2.7.1",
    compilerFlags: ["-std=gnu++14", "-fno-rtti", "-fno-exceptions"],
    linkerFlags: ["--gc-sections"],
    defines: ["ARDUINO=10819", "ARDUINO_ARCH_STM32"],
    includePaths: ["/cores/arduino", "/variants/STM32F1"],
    coreUrl: "stm32/f1/frameworks/arduino-core.tar.gz",
    coreChecksum: "sha256:abc123def456",
  };

  beforeEach(() => {
    frameworkManager = new FrameworkManager();

    // Mock fetch
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("loadFramework", () => {
    it("should load framework definition from server", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFramework,
      });

      const framework = await frameworkManager.loadFramework(
        "arduino",
        "stm32",
        "f1",
      );

      expect(framework).not.toBeNull();
      expect(framework?.id).toBe("arduino");
      expect(framework?.name).toBe("Arduino Core for STM32");
      expect(framework?.version).toBe("2.7.1");
      expect(fetchMock).toHaveBeenCalledWith(
        "/platforms/stm32/f1/frameworks/arduino.json",
      );
    });

    it("should cache framework definition in memory", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFramework,
      });

      // First load
      const framework1 = await frameworkManager.loadFramework(
        "arduino",
        "stm32",
        "f1",
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Second load - should use cache
      const framework2 = await frameworkManager.loadFramework(
        "arduino",
        "stm32",
        "f1",
      );
      expect(fetchMock).toHaveBeenCalledTimes(1); // Still only called once
      expect(framework1).toBe(framework2);
    });

    it("should return null if framework not found", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const framework = await frameworkManager.loadFramework(
        "mbed",
        "stm32",
        "f1",
      );

      expect(framework).toBeNull();
    });

    it("should handle fetch errors gracefully", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"));

      const framework = await frameworkManager.loadFramework(
        "arduino",
        "stm32",
        "f1",
      );

      expect(framework).toBeNull();
    });

    it("should load different frameworks for different platforms", async () => {
      const arduinoFramework = {
        ...mockFramework,
        id: "arduino" as FrameworkId,
      };
      const mbedFramework = {
        ...mockFramework,
        id: "mbed" as FrameworkId,
        name: "Mbed OS",
      };

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => arduinoFramework,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mbedFramework,
        });

      const framework1 = await frameworkManager.loadFramework(
        "arduino",
        "stm32",
        "f1",
      );
      const framework2 = await frameworkManager.loadFramework(
        "mbed",
        "stm32",
        "f1",
      );

      expect(framework1?.id).toBe("arduino");
      expect(framework2?.id).toBe("mbed");
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("loadCoreFiles", () => {
    it("should throw error if framework has no core files", async () => {
      const frameworkWithoutCore = {
        ...mockFramework,
        coreUrl: undefined,
        coreChecksum: undefined,
      };

      await expect(
        frameworkManager.loadCoreFiles(frameworkWithoutCore, "stm32", "f1"),
      ).rejects.toThrow("does not have core files defined");
    });

    it("should download and extract core files", async () => {
      // Create a simple tar.gz mock (just the gzip header)
      const mockTarGz = new Uint8Array([0x1f, 0x8b, 0x08, 0x00]);

      // Mock fetch response with readable stream
      const mockStream = {
        getReader: () => ({
          read: jest
            .fn()
            .mockResolvedValueOnce({ done: false, value: mockTarGz })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => (name === "content-length" ? "4" : null),
        },
        body: mockStream,
      });

      // Mock DecompressionStream
      const mockDecompressedStream = {
        getReader: () => ({
          read: jest
            .fn()
            .mockResolvedValueOnce({
              done: false,
              value: new Uint8Array(512).fill(0),
            })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      };

      const originalDecompressionStream = (global as any).DecompressionStream;
      (global as any).DecompressionStream = class {
        constructor() {
          return mockDecompressedStream;
        }
      };

      // Mock Blob
      global.Blob = class {
        constructor(public parts: any[]) {}
        stream() {
          return {
            pipeThrough: () => mockDecompressedStream,
          };
        }
      } as any;

      try {
        const progressCallbacks: any[] = [];
        const onProgress = jest.fn((progress) =>
          progressCallbacks.push(progress),
        );

        const files = await frameworkManager.loadCoreFiles(
          mockFramework,
          "stm32",
          "f1",
          onProgress,
        );

        expect(fetchMock).toHaveBeenCalledWith(
          "/platforms/stm32/f1/frameworks/arduino-core.tar.gz",
        );
        expect(onProgress).toHaveBeenCalled();

        // Check progress stages
        const stages = progressCallbacks.map((p) => p.stage);
        expect(stages).toContain("checking");
        expect(stages).toContain("downloading");
        expect(stages).toContain("extracting");
        expect(stages).toContain("caching");
        expect(stages).toContain("ready");
      } finally {
        (global as any).DecompressionStream = originalDecompressionStream;
      }
    });

    it("should report download progress", async () => {
      const mockTarGz = new Uint8Array([0x1f, 0x8b, 0x08, 0x00]);

      const mockStream = {
        getReader: () => ({
          read: jest
            .fn()
            .mockResolvedValueOnce({ done: false, value: mockTarGz })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => (name === "content-length" ? "1000" : null),
        },
        body: mockStream,
      });

      const mockDecompressedStream = {
        getReader: () => ({
          read: jest
            .fn()
            .mockResolvedValueOnce({
              done: false,
              value: new Uint8Array(512).fill(0),
            })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      };

      (global as any).DecompressionStream = class {
        constructor() {
          return mockDecompressedStream;
        }
      };

      global.Blob = class {
        constructor(public parts: any[]) {}
        stream() {
          return {
            pipeThrough: () => mockDecompressedStream,
          };
        }
      } as any;

      const progressUpdates: any[] = [];
      const onProgress = jest.fn((progress) => {
        progressUpdates.push(progress);
      });

      await frameworkManager.loadCoreFiles(
        mockFramework,
        "stm32",
        "f1",
        onProgress,
      );

      // Should have received multiple progress updates
      expect(progressUpdates.length).toBeGreaterThan(0);

      // Should have downloading stage with current/total
      const downloadProgress = progressUpdates.find(
        (p) => p.stage === "downloading" && p.current,
      );
      expect(downloadProgress).toBeDefined();
      if (downloadProgress) {
        expect(downloadProgress.current).toBeDefined();
        expect(downloadProgress.total).toBe(1000);
      }
    });

    it("should handle download errors", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(
        frameworkManager.loadCoreFiles(mockFramework, "stm32", "f1"),
      ).rejects.toThrow("Failed to download framework core files");
    });
  });

  describe("isFrameworkCached", () => {
    it("should check if framework is cached", async () => {
      const isCached = await frameworkManager.isFrameworkCached(
        "arduino",
        "stm32",
        "f1",
        "sha256:abc123",
      );

      // Should return false for uncached framework
      expect(typeof isCached).toBe("boolean");
    });
  });

  describe("clearCache", () => {
    it("should clear specific framework cache", async () => {
      // Load a framework first
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFramework,
      });

      await frameworkManager.loadFramework("arduino", "stm32", "f1");

      // Clear the cache
      await frameworkManager.clearCache("arduino", "stm32", "f1");

      // Load again - should fetch from server
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFramework,
      });

      await frameworkManager.loadFramework("arduino", "stm32", "f1");

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("should clear all caches when no parameters provided", async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockFramework,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockFramework, id: "mbed" as FrameworkId }),
        });

      await frameworkManager.loadFramework("arduino", "stm32", "f1");
      await frameworkManager.loadFramework("mbed", "stm32", "f1");

      await frameworkManager.clearCache();

      // Both should be cleared from memory
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockFramework,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockFramework, id: "mbed" as FrameworkId }),
        });

      await frameworkManager.loadFramework("arduino", "stm32", "f1");
      await frameworkManager.loadFramework("mbed", "stm32", "f1");

      expect(fetchMock).toHaveBeenCalledTimes(4);
    });
  });

  describe("getCacheSize", () => {
    it("should return cache size for framework", async () => {
      const size = await frameworkManager.getCacheSize(
        "arduino",
        "stm32",
        "f1",
      );

      expect(typeof size).toBe("number");
      expect(size).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getTotalCacheSize", () => {
    it("should return total cache size", async () => {
      const size = await frameworkManager.getTotalCacheSize();

      expect(typeof size).toBe("number");
      expect(size).toBeGreaterThanOrEqual(0);
    });
  });

  describe("listCached", () => {
    it("should list all cached frameworks", async () => {
      const cached = await frameworkManager.listCached();

      expect(Array.isArray(cached)).toBe(true);
    });

    it("should return framework metadata for each cached item", async () => {
      const cached = await frameworkManager.listCached();

      if (cached.length > 0) {
        const item = cached[0];
        expect(item).toHaveProperty("frameworkId");
        expect(item).toHaveProperty("platformId");
        expect(item).toHaveProperty("familyId");
        expect(item).toHaveProperty("size");
        expect(item).toHaveProperty("timestamp");
      }
    });
  });

  describe("Memory Management", () => {
    it("should handle multiple framework loads efficiently", async () => {
      const frameworks = ["arduino", "mbed", "zephyr"] as FrameworkId[];

      for (const fw of frameworks) {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockFramework, id: fw }),
        });
      }

      const results = await Promise.all(
        frameworks.map((fw) =>
          frameworkManager.loadFramework(fw, "stm32", "f1"),
        ),
      );

      expect(results.every((r) => r !== null)).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("should not leak memory on repeated loads", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockFramework,
      });

      // Load same framework multiple times
      for (let i = 0; i < 10; i++) {
        await frameworkManager.loadFramework("arduino", "stm32", "f1");
      }

      // Should only fetch once due to caching
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
