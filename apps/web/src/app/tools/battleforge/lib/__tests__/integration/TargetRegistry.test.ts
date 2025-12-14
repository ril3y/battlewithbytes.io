/**
 * Integration tests for TargetRegistry
 * Tests loading platform, board, and library manifests
 */

import { TargetRegistry } from "../../registry";

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Sample registry data
const mockRegistry = {
  version: "2.0.0",
  lastUpdated: "2025-01-15",
  schemas: {
    platform: "./schema/platform-v1.schema.json",
    board: "./schema/board-v1.schema.json",
    library: "./schema/library-v1.schema.json",
  },
  platforms: [
    {
      id: "stm32-f1",
      platform: "stm32",
      family: "f1",
      name: "STM32F1 Series",
      architecture: "cortex-m3",
      path: "platforms/stm32/f1/manifest.json",
    },
    {
      id: "nrf-nrf52",
      platform: "nrf",
      family: "nrf52",
      name: "Nordic nRF52 Series",
      architecture: "cortex-m4f",
      path: "platforms/nrf/nrf52/manifest.json",
    },
  ],
  boards: [
    {
      id: "bluepill_stm32f103c8",
      name: "STM32 Blue Pill (F103C8)",
      vendor: "generic",
      platform: "stm32",
      family: "f1",
      path: "boards/stm32/generic/bluepill_stm32f103c8.json",
    },
    {
      id: "feather_nrf52840_express",
      name: "Adafruit Feather nRF52840 Express",
      vendor: "adafruit",
      platform: "nrf",
      family: "nrf52",
      path: "boards/nrf/adafruit/feather_nrf52840_express.json",
    },
  ],
  libraries: [
    {
      id: "freertos",
      name: "FreeRTOS",
      version: "10.5.1",
      category: "rtos",
      path: "libraries/freertos/manifest.json",
    },
  ],
};

const mockPlatformManifest = {
  platform: "stm32",
  family: "f1",
  name: "STM32F1 Series",
  architecture: "cortex-m3",
  version: "1.0.0",
  headers: {
    url: "/platforms/stm32/f1/headers.tar.gz",
    hash: null,
    includes: ["cmsis", "device"],
  },
  devices: [
    {
      id: "stm32f103c8",
      name: "STM32F103C8",
      flash: 65536,
      ram: 20480,
      frequency: 72000000,
      defines: ["STM32F103xB", "STM32F1"],
      linkerScript: "STM32F103C8Tx_FLASH.ld",
    },
  ],
  build: {
    compilerFlags: ["-mcpu=cortex-m3", "-mthumb", "-mfloat-abi=soft"],
    defines: ["USE_HAL_DRIVER"],
  },
};

const mockBoardManifest = {
  id: "bluepill_stm32f103c8",
  name: "STM32 Blue Pill (F103C8)",
  vendor: "generic",
  version: "1.0.0",
  chip: {
    platform: "stm32",
    family: "f1",
    device: "stm32f103c8",
    architecture: "cortex-m3",
  },
  memory: {
    flash: 65536,
    ram: 20480,
  },
  build: {
    frequency: 72000000,
    defines: ["STM32F103xB", "BOARD_BLUEPILL"],
  },
  pins: {
    ledBuiltin: { pin: "PC13", arduino: 32, activeLow: true },
  },
};

const mockLibraryManifest = {
  id: "freertos",
  name: "FreeRTOS",
  version: "10.5.1",
  url: "/libs/freertos-10.5.1.tar.gz",
  hash: null,
  platforms: ["stm32", "nrf", "esp32", "rp2040"],
  includes: ["include"],
  sources: ["*.c"],
};

describe("TargetRegistry", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    TargetRegistry.clearCache();
  });

  describe("loadRegistry", () => {
    it("should load and cache the registry", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistry,
      });

      const registry = await TargetRegistry.loadRegistry();

      expect(registry.version).toBe("2.0.0");
      expect(registry.platforms).toHaveLength(2);
      expect(registry.boards).toHaveLength(2);
      expect(registry.libraries).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should return cached registry on subsequent calls", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistry,
      });

      await TargetRegistry.loadRegistry();
      await TargetRegistry.loadRegistry();
      await TargetRegistry.loadRegistry();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should throw on fetch error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(TargetRegistry.loadRegistry()).rejects.toThrow(
        "Failed to load registry: 404",
      );
    });
  });

  describe("getPlatforms", () => {
    it("should return all platforms", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistry,
      });

      const platforms = await TargetRegistry.getPlatforms();

      expect(platforms).toHaveLength(2);
      expect(platforms[0].platform).toBe("stm32");
      expect(platforms[1].platform).toBe("nrf");
    });
  });

  describe("getBoards", () => {
    it("should return all boards", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistry,
      });

      const boards = await TargetRegistry.getBoards();

      expect(boards).toHaveLength(2);
      expect(boards[0].id).toBe("bluepill_stm32f103c8");
      expect(boards[1].id).toBe("feather_nrf52840_express");
    });
  });

  describe("getBoardsForPlatform", () => {
    it("should filter boards by platform", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistry,
      });

      const stm32Boards = await TargetRegistry.getBoardsForPlatform("stm32");
      expect(stm32Boards).toHaveLength(1);
      expect(stm32Boards[0].id).toBe("bluepill_stm32f103c8");

      const nrfBoards = await TargetRegistry.getBoardsForPlatform("nrf");
      expect(nrfBoards).toHaveLength(1);
      expect(nrfBoards[0].id).toBe("feather_nrf52840_express");
    });

    it("should filter boards by platform and family", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistry,
      });

      const boards = await TargetRegistry.getBoardsForPlatform("stm32", "f1");
      expect(boards).toHaveLength(1);
      expect(boards[0].family).toBe("f1");
    });
  });

  describe("getPlatformManifest", () => {
    it("should load and cache platform manifest", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRegistry,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlatformManifest,
        });

      const manifest = await TargetRegistry.getPlatformManifest("stm32", "f1");

      expect(manifest).not.toBeNull();
      expect(manifest!.platform).toBe("stm32");
      expect(manifest!.family).toBe("f1");
      expect(manifest!.devices).toHaveLength(1);
      expect(manifest!.headers.url).toBe("/platforms/stm32/f1/headers.tar.gz");
    });

    it("should return null for unknown platform", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistry,
      });

      const manifest = await TargetRegistry.getPlatformManifest(
        "unknown",
        "platform",
      );
      expect(manifest).toBeNull();
    });
  });

  describe("getBoardManifest", () => {
    it("should load and cache board manifest", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRegistry,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBoardManifest,
        });

      const manifest = await TargetRegistry.getBoardManifest(
        "bluepill_stm32f103c8",
      );

      expect(manifest).not.toBeNull();
      expect(manifest!.id).toBe("bluepill_stm32f103c8");
      expect(manifest!.chip.platform).toBe("stm32");
      expect(manifest!.pins?.ledBuiltin?.pin).toBe("PC13");
    });
  });

  describe("getLibraryManifest", () => {
    it("should load and cache library manifest", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRegistry,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLibraryManifest,
        });

      const manifest = await TargetRegistry.getLibraryManifest("freertos");

      expect(manifest).not.toBeNull();
      expect(manifest!.id).toBe("freertos");
      expect(manifest!.version).toBe("10.5.1");
      expect(manifest!.platforms).toContain("stm32");
    });
  });

  describe("getHeaderUrl", () => {
    it("should return header URL from platform manifest", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRegistry,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlatformManifest,
        });

      const url = await TargetRegistry.getHeaderUrl("stm32", "f1");

      expect(url).toBe("/platforms/stm32/f1/headers.tar.gz");
    });

    it("should return null for unknown platform", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistry,
      });

      const url = await TargetRegistry.getHeaderUrl("unknown", "platform");
      expect(url).toBeNull();
    });
  });

  describe("getDevice", () => {
    it("should return device definition from platform", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRegistry,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlatformManifest,
        });

      const device = await TargetRegistry.getDevice(
        "stm32",
        "f1",
        "stm32f103c8",
      );

      expect(device).not.toBeNull();
      expect(device!.id).toBe("stm32f103c8");
      expect(device!.flash).toBe(65536);
      expect(device!.ram).toBe(20480);
      expect(device!.frequency).toBe(72000000);
    });

    it("should return null for unknown device", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRegistry,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlatformManifest,
        });

      const device = await TargetRegistry.getDevice(
        "stm32",
        "f1",
        "unknown_device",
      );
      expect(device).toBeNull();
    });
  });
});
