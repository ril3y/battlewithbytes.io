/**
 * SourceFetcher Tests
 *
 * Tests for fetching platform source files from GitHub repositories
 * as defined in v2 platform manifests.
 *
 * Note: These tests make real network requests to GitHub.
 * Use --testTimeout=30000 for longer timeout if needed.
 *
 * @jest-environment node
 */

/* Jest globals: describe, it, expect, beforeAll */
import { SourceFetcher, createSourceFetcher } from "../SourceFetcher";
import type { PlatformManifestV2, DeviceDefinitionV2 } from "../types";

// Mock STM32F1 v2 manifest
const mockSTM32F1ManifestV2: PlatformManifestV2 = {
  schemaVersion: "2.0.0",
  platform: "stm32",
  family: "f1",
  name: "STM32F1 Series",
  description: "STM32F1 Cortex-M3 microcontrollers",
  architecture: "cortex-m3",
  version: "2.0.0",
  sources: {
    cmsis: {
      repo: "github:STMicroelectronics/cmsis_device_f1",
      ref: "master",
      paths: {
        headers: "Include",
        startup: "Source/Templates/gcc",
        linker: "Source/Templates/gcc/linker",
        system: "Source/Templates",
      },
      files: {
        headers: [
          "stm32f1xx.h",
          "stm32f103xb.h",
          "system_stm32f1xx.h",
        ],
        system: ["system_stm32f1xx.c"],
      },
    },
    cmsis_core: {
      repo: "github:STMicroelectronics/cmsis_core",
      ref: "master",
      paths: {
        headers: "Include",
      },
      files: {
        headers: ["cmsis_compiler.h", "cmsis_gcc.h", "core_cm3.h"],
      },
    },
  },
  devices: [
    {
      id: "stm32f103c8",
      name: "STM32F103C8",
      flash: 65536,
      ram: 20480,
      frequency: 72000000,
      defines: ["STM32F103xB", "STM32F1"],
      fpu: "none",
      files: {
        startup: "startup_stm32f103xb.s",
        linker: "STM32F103XB_FLASH.ld",
        header: "stm32f103xb.h",
      },
    },
  ],
  build: {
    compilerFlags: [
      "--target=thumbv7m-none-eabi",
      "-mcpu=cortex-m3",
      "-mthumb",
    ],
  },
};

describe("SourceFetcher", () => {
  let fetcher: SourceFetcher;
  let device: DeviceDefinitionV2;

  beforeAll(() => {
    fetcher = createSourceFetcher(mockSTM32F1ManifestV2);
    device = mockSTM32F1ManifestV2.devices[0];
  });

  describe("fetchStartupFile", () => {
    it("should fetch startup file from GitHub", async () => {
      const startup = await fetcher.fetchStartupFile(device);

      expect(startup).not.toBeNull();
      expect(startup).toBeInstanceOf(Uint8Array);
      expect(startup!.length).toBeGreaterThan(1000); // Startup files are typically several KB

      // Decode and verify content
      const content = new TextDecoder().decode(startup!);

      // Check for key ARM startup file components
      expect(content).toContain("Reset_Handler");
      expect(content).toContain(".syntax unified");
      expect(content).toContain("cortex-m3");
    }, 30000);

    it("should return null for device without startup file", async () => {
      const deviceNoStartup: DeviceDefinitionV2 = {
        id: "test",
        name: "Test Device",
        flash: 64 * 1024,
        ram: 20 * 1024,
        defines: [],
        // No files property
      };

      const startup = await fetcher.fetchStartupFile(deviceNoStartup);
      expect(startup).toBeNull();
    });

    it("startup file should contain vector table", async () => {
      const startup = await fetcher.fetchStartupFile(device);
      expect(startup).not.toBeNull();

      const content = new TextDecoder().decode(startup!);

      // Should have vector table (g_pfnVectors)
      expect(content).toContain("g_pfnVectors");

      // Should have stack pointer reference
      expect(content).toMatch(/_estack|__stack/);
    }, 30000);

    it("startup file should contain interrupt handlers", async () => {
      const startup = await fetcher.fetchStartupFile(device);
      expect(startup).not.toBeNull();

      const content = new TextDecoder().decode(startup!);

      // Should have NMI_Handler
      expect(content).toContain("NMI_Handler");

      // Should have HardFault_Handler
      expect(content).toContain("HardFault_Handler");

      // Should have SysTick_Handler (common in Cortex-M)
      expect(content).toContain("SysTick_Handler");
    }, 30000);
  });

  describe("fetchLinkerScript", () => {
    it("should fetch linker script from GitHub", async () => {
      const linker = await fetcher.fetchLinkerScript(device);

      expect(linker).not.toBeNull();
      expect(typeof linker).toBe("string");
      expect(linker!.length).toBeGreaterThan(500);

      // Check for key linker script components
      expect(linker).toContain("MEMORY");
      expect(linker).toContain("FLASH");
      expect(linker).toContain("RAM");
      expect(linker).toContain("SECTIONS");
    }, 30000);

    it("linker script should define entry point", async () => {
      const linker = await fetcher.fetchLinkerScript(device);
      expect(linker).not.toBeNull();

      // Should reference Reset_Handler as entry
      expect(linker).toContain("Reset_Handler");
    }, 30000);

    it("linker script should have correct memory regions for STM32F103xB", async () => {
      const linker = await fetcher.fetchLinkerScript(device);
      expect(linker).not.toBeNull();

      // STM32F103xB: 128K FLASH at 0x08000000
      expect(linker).toMatch(/0x0?8000000/i); // Flash origin

      // STM32F103xB: 20K RAM at 0x20000000
      expect(linker).toMatch(/0x20000000/i); // RAM origin
    }, 30000);
  });

  describe("fetchDeviceFiles", () => {
    it("should fetch all device files at once", async () => {
      const files = await fetcher.fetchDeviceFiles(device);

      // Should have startup file
      expect(files.startup).toBeDefined();
      expect(files.startup).toBeInstanceOf(Uint8Array);

      // Should have linker script
      expect(files.linker).toBeDefined();
      expect(typeof files.linker).toBe("string");

      // Verify startup content
      const startupContent = new TextDecoder().decode(files.startup!);
      expect(startupContent).toContain("Reset_Handler");

      // Verify linker content
      expect(files.linker).toContain("MEMORY");
    }, 60000);
  });

  // Note: fetchHeaders tests are skipped in node environment
  // because they require IndexedDB which is only available in browsers.
  // These tests pass when run in the browser environment.
  describe.skip("fetchHeaders (requires IndexedDB)", () => {
    it("should fetch header files from GitHub", async () => {
      const headers = await fetcher.fetchHeaders();

      // Should have fetched headers
      expect(headers.size).toBeGreaterThan(0);

      // Check for specific device header
      const hasDeviceHeader =
        headers.has("/device/stm32f1xx.h") ||
        headers.has("/device/stm32f103xb.h");
      expect(hasDeviceHeader).toBe(true);

      // Check for CMSIS core header
      const hasCmsisCore =
        headers.has("/cmsis/core_cm3.h") ||
        headers.has("/cmsis/cmsis_gcc.h");
      expect(hasCmsisCore).toBe(true);
    }, 60000);

    it("should fetch freestanding C headers", async () => {
      const headers = await fetcher.fetchHeaders();

      // Should have standard C freestanding headers
      expect(headers.has("/include/stdint.h")).toBe(true);
      expect(headers.has("/include/stddef.h")).toBe(true);
      expect(headers.has("/include/stdbool.h")).toBe(true);
    }, 60000);
  });
});

describe("SourceFetcher - Error Handling", () => {
  it("should handle invalid repo format gracefully", async () => {
    const invalidManifest: PlatformManifestV2 = {
      schemaVersion: "2.0.0",
      platform: "test",
      family: "test",
      name: "Test",
      architecture: "cortex-m3",
      version: "1.0.0",
      sources: {
        cmsis: {
          repo: "invalid:repo/format", // Not github: prefix
          paths: {
            startup: "startup",
          },
        },
      },
      devices: [
        {
          id: "test",
          name: "Test",
          flash: 64 * 1024,
          ram: 20 * 1024,
          defines: [],
          files: {
            startup: "startup.s",
          },
        },
      ],
    };

    const fetcher = createSourceFetcher(invalidManifest);
    const startup = await fetcher.fetchStartupFile(invalidManifest.devices[0]);

    // Should return null for invalid repo, not throw
    expect(startup).toBeNull();
  });

  it("should handle non-existent file gracefully", async () => {
    const manifestWithBadFile: PlatformManifestV2 = {
      schemaVersion: "2.0.0",
      platform: "test",
      family: "test",
      name: "Test",
      architecture: "cortex-m3",
      version: "1.0.0",
      sources: {
        cmsis: {
          repo: "github:STMicroelectronics/cmsis_device_f1",
          ref: "master",
          paths: {
            startup: "Source/Templates/gcc",
          },
        },
      },
      devices: [
        {
          id: "test",
          name: "Test",
          flash: 64 * 1024,
          ram: 20 * 1024,
          defines: [],
          files: {
            startup: "nonexistent_startup_file.s",
          },
        },
      ],
    };

    const fetcher = createSourceFetcher(manifestWithBadFile);
    const startup = await fetcher.fetchStartupFile(manifestWithBadFile.devices[0]);

    // Should return null for missing file, not throw
    expect(startup).toBeNull();
  }, 30000);
});
