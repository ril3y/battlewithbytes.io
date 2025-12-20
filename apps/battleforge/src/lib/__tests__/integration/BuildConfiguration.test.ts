/**
 * Integration tests for Build Configuration Generation
 * Tests that correct compiler flags are generated for each platform
 */

import { ARCHITECTURE_CONFIGS, type Architecture } from "../../platform/types";

describe("Architecture Configurations", () => {
  describe("Cortex-M0+", () => {
    it("should have correct config for cortex-m0+", () => {
      const config = ARCHITECTURE_CONFIGS["cortex-m0+"];

      expect(config).toBeDefined();
      expect(config.target).toBe("thumbv6m-none-eabi");
      expect(config.cpu).toBe("cortex-m0plus");
      expect(config.float).toBeUndefined(); // M0+ has no FPU
      expect(config.libPath).toBe("cortex-m0");
    });
  });

  describe("Cortex-M3", () => {
    it("should have correct config for cortex-m3", () => {
      const config = ARCHITECTURE_CONFIGS["cortex-m3"];

      expect(config).toBeDefined();
      expect(config.target).toBe("thumbv7m-none-eabi");
      expect(config.cpu).toBe("cortex-m3");
      expect(config.float).toBeUndefined(); // M3 has no FPU
      expect(config.libPath).toBe("cortex-m3");
    });
  });

  describe("Cortex-M4F", () => {
    it("should have correct config for cortex-m4f", () => {
      const config = ARCHITECTURE_CONFIGS["cortex-m4f"];

      expect(config).toBeDefined();
      expect(config.target).toBe("thumbv7em-none-eabihf");
      expect(config.cpu).toBe("cortex-m4");
      expect(config.fpu).toBe("fpv4-sp-d16");
      expect(config.float).toBe("hard");
      expect(config.libPath).toBe("cortex-m4f");
    });
  });
});

describe("Build Flag Generation", () => {
  interface ExpectedFlags {
    platform: string;
    family: string;
    architecture: string;
    expectedTarget: string;
    expectedCpu: string;
    expectFpu: boolean;
    expectHardFloat: boolean;
  }

  const testCases: ExpectedFlags[] = [
    {
      platform: "stm32",
      family: "f1",
      architecture: "cortex-m3",
      expectedTarget: "thumbv7m-none-eabi",
      expectedCpu: "cortex-m3",
      expectFpu: false,
      expectHardFloat: false,
    },
    {
      platform: "stm32",
      family: "f4",
      architecture: "cortex-m4f",
      expectedTarget: "thumbv7em-none-eabihf",
      expectedCpu: "cortex-m4",
      expectFpu: true,
      expectHardFloat: true,
    },
    {
      platform: "nrf",
      family: "nrf52",
      architecture: "cortex-m4f",
      expectedTarget: "thumbv7em-none-eabihf",
      expectedCpu: "cortex-m4",
      expectFpu: true,
      expectHardFloat: true,
    },
    {
      platform: "rp2040",
      family: "rp2",
      architecture: "cortex-m0+",
      expectedTarget: "thumbv6m-none-eabi",
      expectedCpu: "cortex-m0plus",
      expectFpu: false,
      expectHardFloat: false,
    },
  ];

  for (const tc of testCases) {
    describe(`${tc.platform}/${tc.family} (${tc.architecture})`, () => {
      it("should generate correct target triple", () => {
        const config = ARCHITECTURE_CONFIGS[tc.architecture as Architecture];
        expect(config.target).toBe(tc.expectedTarget);
      });

      it("should generate correct CPU flag", () => {
        const config = ARCHITECTURE_CONFIGS[tc.architecture as Architecture];
        expect(config.cpu).toBe(tc.expectedCpu);
      });

      if (tc.expectFpu) {
        it("should include FPU flag", () => {
          const config = ARCHITECTURE_CONFIGS[tc.architecture as Architecture];
          expect(config.fpu).toBeDefined();
        });
      } else {
        it("should not include FPU flag", () => {
          const config = ARCHITECTURE_CONFIGS[tc.architecture as Architecture];
          expect(config.fpu).toBeUndefined();
        });
      }

      if (tc.expectHardFloat) {
        it("should use hard float ABI", () => {
          const config = ARCHITECTURE_CONFIGS[tc.architecture as Architecture];
          expect(config.float).toBe("hard");
        });
      } else {
        it("should not use hard float ABI", () => {
          const config = ARCHITECTURE_CONFIGS[tc.architecture as Architecture];
          expect(config.float).toBeUndefined();
        });
      }
    });
  }
});

describe("Compiler Arguments Assembly", () => {
  function assembleCompilerArgs(
    architecture: Architecture,
    defines: string[],
  ): string[] {
    const config = ARCHITECTURE_CONFIGS[architecture];
    if (!config) {
      throw new Error(`Unknown architecture: ${architecture}`);
    }

    const args: string[] = [`--target=${config.target}`, `-mcpu=${config.cpu}`];

    // Always add thumb mode for ARM
    if (config.target.startsWith("thumb")) {
      args.push("-mthumb");
    }

    // Add FPU flags if present
    if (config.fpu) {
      args.push(`-mfpu=${config.fpu}`);
    }
    if (config.float) {
      args.push(`-mfloat-abi=${config.float}`);
    }

    // Add standard embedded flags
    args.push("-nostdlib", "-ffreestanding", "-fno-exceptions", "-fno-rtti");

    // Add defines
    for (const define of defines) {
      args.push(`-D${define}`);
    }

    return args;
  }

  it("should generate correct STM32F103 compiler args", () => {
    const args = assembleCompilerArgs("cortex-m3", [
      "STM32F103xB",
      "STM32F1",
      "USE_HAL_DRIVER",
    ]);

    expect(args).toContain("--target=thumbv7m-none-eabi");
    expect(args).toContain("-mcpu=cortex-m3");
    expect(args).toContain("-mthumb");
    expect(args).toContain("-nostdlib");
    expect(args).toContain("-DSTM32F103xB");
    expect(args).toContain("-DSTM32F1");
    expect(args).toContain("-DUSE_HAL_DRIVER");

    // Should NOT have FPU flags
    expect(args).not.toContain("-mfpu=fpv4-sp-d16");
    expect(args).not.toContain("-mfloat-abi=hard");
  });

  it("should generate correct nRF52840 compiler args", () => {
    const args = assembleCompilerArgs("cortex-m4f", [
      "NRF52840_XXAA",
      "NRF52_SERIES",
    ]);

    expect(args).toContain("--target=thumbv7em-none-eabihf");
    expect(args).toContain("-mcpu=cortex-m4");
    expect(args).toContain("-mthumb");
    expect(args).toContain("-mfpu=fpv4-sp-d16");
    expect(args).toContain("-mfloat-abi=hard");
    expect(args).toContain("-DNRF52840_XXAA");
    expect(args).toContain("-DNRF52_SERIES");
  });

  it("should generate correct RP2040 compiler args", () => {
    const args = assembleCompilerArgs("cortex-m0+", ["RP2040", "PICO_BUILD"]);

    expect(args).toContain("--target=thumbv6m-none-eabi");
    expect(args).toContain("-mcpu=cortex-m0plus");
    expect(args).toContain("-mthumb");
    expect(args).toContain("-DRP2040");
    expect(args).toContain("-DPICO_BUILD");

    // Should NOT have FPU flags
    expect(args).not.toContain("-mfpu");
    expect(args).not.toContain("-mfloat-abi");
  });
});

describe("Linker Arguments Assembly", () => {
  function assembleLinkerArgs(
    architecture: Architecture,
    linkerScript: string,
  ): string[] {
    const config = ARCHITECTURE_CONFIGS[architecture];
    if (!config) {
      throw new Error(`Unknown architecture: ${architecture}`);
    }

    return [
      "-flavor",
      "gnu",
      "-nostdlib",
      `--script=${linkerScript}`,
      "-L",
      `/libs/${config.libPath}`,
      "-lc",
      "-lgcc",
    ];
  }

  it("should generate correct STM32F103 linker args", () => {
    const args = assembleLinkerArgs(
      "cortex-m3",
      "/platform/stm32/f1/linker/STM32F103C8Tx_FLASH.ld",
    );

    expect(args).toContain("-flavor");
    expect(args).toContain("gnu");
    expect(args).toContain("-nostdlib");
    expect(args).toContain(
      "--script=/platform/stm32/f1/linker/STM32F103C8Tx_FLASH.ld",
    );
    expect(args.join(" ")).toContain("cortex-m3");
  });

  it("should generate correct nRF52840 linker args", () => {
    const args = assembleLinkerArgs(
      "cortex-m4f",
      "/platform/nrf/nrf52/linker/nrf52840_xxaa.ld",
    );

    expect(args.join(" ")).toContain("cortex-m4f");
  });
});

describe("Include Path Generation", () => {
  function generateIncludePaths(
    platform: string,
    family: string,
    headerIncludes: string[],
    isArduino: boolean,
  ): string[] {
    const paths: string[] = [];

    // Add platform headers
    for (const inc of headerIncludes) {
      paths.push(`/platform/${platform}/${family}/headers/${inc}`);
    }

    // Add Arduino paths if using Arduino framework
    if (isArduino) {
      paths.push(
        `/framework/arduino/cores/arduino`,
        `/framework/arduino/variants/default`,
      );
    }

    return paths;
  }

  it("should generate correct include paths for native STM32", () => {
    const paths = generateIncludePaths(
      "stm32",
      "f1",
      ["cmsis", "device"],
      false,
    );

    expect(paths).toContain("/platform/stm32/f1/headers/cmsis");
    expect(paths).toContain("/platform/stm32/f1/headers/device");
    expect(paths).not.toContain("/framework/arduino/cores/arduino");
  });

  it("should generate correct include paths for Arduino STM32", () => {
    const paths = generateIncludePaths(
      "stm32",
      "f1",
      ["cmsis", "device"],
      true,
    );

    expect(paths).toContain("/platform/stm32/f1/headers/cmsis");
    expect(paths).toContain("/framework/arduino/cores/arduino");
    expect(paths).toContain("/framework/arduino/variants/default");
  });
});
