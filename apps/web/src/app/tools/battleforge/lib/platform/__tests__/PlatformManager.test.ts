/**
 * PlatformManager Tests
 *
 * Tests for platform management and build configuration generation
 */

/* Jest globals: describe, it, expect, beforeEach */
import { PlatformManager } from "../PlatformManager";
import type {
  SelectedPlatform,
  PlatformFamily,
  DeviceEntry,
  ArchitectureConfig,
} from "../types";

describe("PlatformManager", () => {
  let platformManager: PlatformManager;

  beforeEach(() => {
    platformManager = new PlatformManager();
  });

  // Mock data for tests
  const mockArchConfig: ArchitectureConfig = {
    target: "thumbv7m-none-eabi",
    cpu: "cortex-m3",
    libPath: "cortex-m3",
  };

  const mockDevice: DeviceEntry = {
    id: "stm32f103c8",
    name: "STM32F103C8T6 (Blue Pill)",
    flash: 65536,
    ram: 20480,
    linkerScript: "stm32f103c8.ld",
    defines: ["STM32F103xB"],
  };

  const mockFamily: PlatformFamily = {
    id: "f1",
    name: "STM32F1 Series",
    architecture: "cortex-m3",
    devices: [mockDevice],
    headers: {
      url: "stm32/f1/headers.tar.gz",
      size: 1024000,
      checksum: "sha256:abc123",
      includes: ["/cmsis", "/device"],
    },
    libs: {
      architecture: "cortex-m3",
      required: ["libc_nano.a", "libnosys.a"],
      optional: ["libm.a"],
    },
    compilerFlags: ["-Wall", "-Wextra"],
    linkerFlags: ["--gc-sections"],
  };

  describe("generateBuildConfig", () => {
    describe("Native Framework", () => {
      it("should generate correct compiler flags for native framework", async () => {
        const selected: SelectedPlatform = {
          platformId: "stm32",
          familyId: "f1",
          deviceId: "stm32f103c8",
          family: mockFamily,
          device: mockDevice,
          archConfig: mockArchConfig,
          frameworkId: "native",
        };

        const config = await platformManager.generateBuildConfig(selected);

        // Should include native-specific flags
        expect(config.compilerArgs).toContain("-nostdlib");
        expect(config.compilerArgs).toContain("-ffreestanding");
        expect(config.compilerArgs).toContain("-fno-exceptions");
        expect(config.compilerArgs).toContain("-fno-rtti");

        // Should NOT include Arduino flags
        expect(config.compilerArgs).not.toContain("-std=gnu++14");
        expect(config.compilerArgs).not.toContain("-fno-threadsafe-statics");
        expect(config.compilerArgs).not.toContain("-Os");
      });

      it("should include architecture-specific flags", async () => {
        const selected: SelectedPlatform = {
          platformId: "stm32",
          familyId: "f1",
          deviceId: "stm32f103c8",
          family: mockFamily,
          device: mockDevice,
          archConfig: mockArchConfig,
          frameworkId: "native",
        };

        const config = await platformManager.generateBuildConfig(selected);

        expect(config.compilerArgs).toContain("--target=thumbv7m-none-eabi");
        expect(config.compilerArgs).toContain("-mcpu=cortex-m3");
        expect(config.compilerArgs).toContain("-mthumb");
      });

      it("should include FPU flags when present", async () => {
        const archWithFpu: ArchitectureConfig = {
          target: "thumbv7em-none-eabihf",
          cpu: "cortex-m4",
          fpu: "fpv4-sp-d16",
          float: "hard",
          libPath: "cortex-m4f",
        };

        const selected: SelectedPlatform = {
          platformId: "stm32",
          familyId: "f4",
          deviceId: "stm32f407vg",
          family: mockFamily,
          device: mockDevice,
          archConfig: archWithFpu,
          frameworkId: "native",
        };

        const config = await platformManager.generateBuildConfig(selected);

        expect(config.compilerArgs).toContain("-mfpu=fpv4-sp-d16");
        expect(config.compilerArgs).toContain("-mfloat-abi=hard");
      });

      it("should include device defines", async () => {
        const selected: SelectedPlatform = {
          platformId: "stm32",
          familyId: "f1",
          deviceId: "stm32f103c8",
          family: mockFamily,
          device: mockDevice,
          archConfig: mockArchConfig,
          frameworkId: "native",
        };

        const config = await platformManager.generateBuildConfig(selected);

        expect(config.defines).toContain("STM32F103xB");
        expect(config.compilerArgs).toContain("-DSTM32F103xB");
      });

      it("should include platform header paths", async () => {
        const selected: SelectedPlatform = {
          platformId: "stm32",
          familyId: "f1",
          deviceId: "stm32f103c8",
          family: mockFamily,
          device: mockDevice,
          archConfig: mockArchConfig,
          frameworkId: "native",
        };

        const config = await platformManager.generateBuildConfig(selected);

        expect(config.includePaths).toContain(
          "/platform/stm32/f1/headers/cmsis",
        );
        expect(config.includePaths).toContain(
          "/platform/stm32/f1/headers/device",
        );

        // Should NOT include Arduino paths
        expect(config.includePaths).not.toContain(
          "/framework/arduino/cores/arduino",
        );
      });

      it("should default to native framework when frameworkId is undefined", async () => {
        const selected: SelectedPlatform = {
          platformId: "stm32",
          familyId: "f1",
          deviceId: "stm32f103c8",
          family: mockFamily,
          device: mockDevice,
          archConfig: mockArchConfig,
          // No frameworkId specified
        };

        const config = await platformManager.generateBuildConfig(selected);

        // Should behave like native framework
        expect(config.compilerArgs).toContain("-nostdlib");
        expect(config.compilerArgs).toContain("-ffreestanding");
      });
    });

    describe("Arduino Framework", () => {
      it("should generate correct compiler flags for Arduino framework", async () => {
        const selected: SelectedPlatform = {
          platformId: "stm32",
          familyId: "f1",
          deviceId: "stm32f103c8",
          family: mockFamily,
          device: mockDevice,
          archConfig: mockArchConfig,
          frameworkId: "arduino",
        };

        const config = await platformManager.generateBuildConfig(selected);

        // Should include Arduino-specific flags
        expect(config.compilerArgs).toContain("-std=gnu++14");
        expect(config.compilerArgs).toContain("-fno-rtti");
        expect(config.compilerArgs).toContain("-fno-exceptions");
        expect(config.compilerArgs).toContain("-fno-threadsafe-statics");
        expect(config.compilerArgs).toContain("-ffunction-sections");
        expect(config.compilerArgs).toContain("-fdata-sections");
        expect(config.compilerArgs).toContain("-Os");

        // Should NOT include native-specific flags
        expect(config.compilerArgs).not.toContain("-nostdlib");
        expect(config.compilerArgs).not.toContain("-ffreestanding");
      });

      it("should add Arduino-specific defines", async () => {
        const selected: SelectedPlatform = {
          platformId: "stm32",
          familyId: "f1",
          deviceId: "stm32f103c8",
          family: mockFamily,
          device: mockDevice,
          archConfig: mockArchConfig,
          frameworkId: "arduino",
        };

        const config = await platformManager.generateBuildConfig(selected);

        expect(config.defines).toContain("ARDUINO=10819");
        expect(config.defines).toContain("ARDUINO_STM32F103C8");
        expect(config.defines).toContain("ARDUINO_ARCH_STM32");

        // Should also include device defines
        expect(config.defines).toContain("STM32F103xB");
      });

      it("should include Arduino framework include paths", async () => {
        const selected: SelectedPlatform = {
          platformId: "stm32",
          familyId: "f1",
          deviceId: "stm32f103c8",
          family: mockFamily,
          device: mockDevice,
          archConfig: mockArchConfig,
          frameworkId: "arduino",
        };

        const config = await platformManager.generateBuildConfig(selected);

        // Should include Arduino paths
        expect(config.includePaths).toContain(
          "/framework/arduino/cores/arduino",
        );
        expect(config.includePaths).toContain(
          "/framework/arduino/variants/STM32F103C8",
        );

        // Should also include platform headers
        expect(config.includePaths).toContain(
          "/platform/stm32/f1/headers/cmsis",
        );
        expect(config.includePaths).toContain(
          "/platform/stm32/f1/headers/device",
        );
      });

      it("should include family-specific compiler flags", async () => {
        const selected: SelectedPlatform = {
          platformId: "stm32",
          familyId: "f1",
          deviceId: "stm32f103c8",
          family: mockFamily,
          device: mockDevice,
          archConfig: mockArchConfig,
          frameworkId: "arduino",
        };

        const config = await platformManager.generateBuildConfig(selected);

        // Should include flags from family
        expect(config.compilerArgs).toContain("-Wall");
        expect(config.compilerArgs).toContain("-Wextra");
      });
    });

    describe("Common Build Configuration", () => {
      it("should generate correct linker arguments", async () => {
        const selected: SelectedPlatform = {
          platformId: "stm32",
          familyId: "f1",
          deviceId: "stm32f103c8",
          family: mockFamily,
          device: mockDevice,
          archConfig: mockArchConfig,
          frameworkId: "native",
        };

        const config = await platformManager.generateBuildConfig(selected);

        expect(config.linkerArgs).toContain("-flavor");
        expect(config.linkerArgs).toContain("gnu");
        expect(config.linkerArgs).toContain("-nostdlib");
        expect(config.linkerArgs).toContain(
          "--script=/platform/stm32/f1/linker/stm32f103c8.ld",
        );
        expect(config.linkerArgs).toContain("--gc-sections");
      });

      it("should set correct library paths", async () => {
        const selected: SelectedPlatform = {
          platformId: "stm32",
          familyId: "f1",
          deviceId: "stm32f103c8",
          family: mockFamily,
          device: mockDevice,
          archConfig: mockArchConfig,
          frameworkId: "native",
        };

        const config = await platformManager.generateBuildConfig(selected);

        expect(config.libPaths).toContain("/libs/cortex-m3");
      });

      it("should include required libraries", async () => {
        const selected: SelectedPlatform = {
          platformId: "stm32",
          familyId: "f1",
          deviceId: "stm32f103c8",
          family: mockFamily,
          device: mockDevice,
          archConfig: mockArchConfig,
          frameworkId: "native",
        };

        const config = await platformManager.generateBuildConfig(selected);

        expect(config.libs).toContain("libc_nano.a");
        expect(config.libs).toContain("libnosys.a");
      });

      it("should set correct linker script path", async () => {
        const selected: SelectedPlatform = {
          platformId: "stm32",
          familyId: "f1",
          deviceId: "stm32f103c8",
          family: mockFamily,
          device: mockDevice,
          archConfig: mockArchConfig,
          frameworkId: "native",
        };

        const config = await platformManager.generateBuildConfig(selected);

        expect(config.linkerScript).toBe(
          "/platform/stm32/f1/linker/stm32f103c8.ld",
        );
      });
    });

    describe("Framework Comparison", () => {
      it("should generate different configs for native vs Arduino", async () => {
        const baseSelected = {
          platformId: "stm32",
          familyId: "f1",
          deviceId: "stm32f103c8",
          family: mockFamily,
          device: mockDevice,
          archConfig: mockArchConfig,
        };

        const nativeConfig = await platformManager.generateBuildConfig({
          ...baseSelected,
          frameworkId: "native",
        });

        const arduinoConfig = await platformManager.generateBuildConfig({
          ...baseSelected,
          frameworkId: "arduino",
        });

        // Compiler args should differ
        expect(nativeConfig.compilerArgs).not.toEqual(
          arduinoConfig.compilerArgs,
        );

        // Include paths should differ
        expect(nativeConfig.includePaths).not.toEqual(
          arduinoConfig.includePaths,
        );

        // Defines should differ
        expect(nativeConfig.defines).not.toEqual(arduinoConfig.defines);

        // Linker config should be the same (for now)
        expect(nativeConfig.linkerArgs).toEqual(arduinoConfig.linkerArgs);
        expect(nativeConfig.linkerScript).toEqual(arduinoConfig.linkerScript);
      });
    });
  });
});
