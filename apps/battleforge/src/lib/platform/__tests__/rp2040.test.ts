/**
 * RP2040 Platform Tests
 *
 * Tests for Raspberry Pi RP2040 platform configuration and validation
 */

import * as fs from "fs";
import * as path from "path";
import type { PlatformFamily, DeviceEntry, Framework } from "../types";

// Load the actual RP2040 family.json
const familyJsonPath = path.join(
  __dirname,
  "../../../../../../../public/platforms/rp2040/rp2/family.json",
);
const RP2_FAMILY_JSON = JSON.parse(
  fs.readFileSync(familyJsonPath, "utf-8"),
) as PlatformFamily;

describe("RP2040 Platform", () => {
  describe("Family Configuration", () => {
    it("should have correct family metadata", () => {
      expect(RP2_FAMILY_JSON.id).toBe("rp2");
      expect(RP2_FAMILY_JSON.name).toBe("RP2040 (Dual Cortex-M0+)");
      expect(RP2_FAMILY_JSON.architecture).toBe("cortex-m0+");
      expect(RP2_FAMILY_JSON.status).toBe("active");
      expect(RP2_FAMILY_JSON.releaseYear).toBe(2021);
    });

    it("should have correct feature flags", () => {
      expect(RP2_FAMILY_JSON.features).toBeDefined();
      expect(RP2_FAMILY_JSON.features.maxFrequency).toBe(133);
      expect(RP2_FAMILY_JSON.features.cores).toBe(2);
      expect(RP2_FAMILY_JSON.features.fpu).toBe(false);
      expect(RP2_FAMILY_JSON.features.pio).toBe(true);
      expect(RP2_FAMILY_JSON.features.pioStateMachines).toBe(8);
    });

    it("should have correct compiler flags for Cortex-M0+", () => {
      expect(RP2_FAMILY_JSON.compilerFlags).toContain(
        "--target=thumbv6m-none-eabi",
      );
      expect(RP2_FAMILY_JSON.compilerFlags).toContain("-mcpu=cortex-m0plus");
      expect(RP2_FAMILY_JSON.compilerFlags).toContain("-mthumb");
      expect(RP2_FAMILY_JSON.compilerFlags).toContain("-nostdlib");
      expect(RP2_FAMILY_JSON.compilerFlags).toContain("-ffreestanding");
    });

    it("should have correct linker flags", () => {
      expect(RP2_FAMILY_JSON.linkerFlags).toContain("-nostdlib");
      expect(RP2_FAMILY_JSON.linkerFlags).toContain("--gc-sections");
    });

    it("should have proper documentation links", () => {
      expect(RP2_FAMILY_JSON.documentation).toBeDefined();
      expect(RP2_FAMILY_JSON.documentation.datasheet).toContain(
        "raspberrypi.com",
      );
      expect(RP2_FAMILY_JSON.documentation.reference).toContain(
        "raspberrypi.com",
      );
      expect(RP2_FAMILY_JSON.documentation.programming).toContain(
        "raspberrypi.com",
      );
    });

    it("should have headers configuration", () => {
      expect(RP2_FAMILY_JSON.headers).toBeDefined();
      expect(RP2_FAMILY_JSON.headers.url).toBe("rp2040/rp2/headers.tar.gz");
      expect(RP2_FAMILY_JSON.headers.includes).toContain("/cmsis");
      expect(RP2_FAMILY_JSON.headers.includes).toContain("/pico_sdk");
      expect(RP2_FAMILY_JSON.headers.includes).toContain("/hardware");
    });

    it("should have correct library configuration", () => {
      expect(RP2_FAMILY_JSON.libs).toBeDefined();
      expect(RP2_FAMILY_JSON.libs.architecture).toBe("cortex-m0plus");
      expect(RP2_FAMILY_JSON.libs.required).toContain("libc_nano.a");
      expect(RP2_FAMILY_JSON.libs.required).toContain("libnosys.a");
      expect(RP2_FAMILY_JSON.libs.optional).toContain("libm.a");
      expect(RP2_FAMILY_JSON.libs.optional).toContain("libgcc.a");
    });
  });

  describe("Device Definitions", () => {
    it("should have at least 2 devices defined", () => {
      expect(RP2_FAMILY_JSON.devices).toBeDefined();
      expect(RP2_FAMILY_JSON.devices.length).toBeGreaterThanOrEqual(2);
    });

    it("should have valid Raspberry Pi Pico device", () => {
      const pico = RP2_FAMILY_JSON.devices.find(
        (d: DeviceEntry) => d.id === "pico",
      );
      expect(pico).toBeDefined();
      expect(pico?.name).toBe("Raspberry Pi Pico");
      expect(pico?.flash).toBe(2097152); // 2MB
      expect(pico?.ram).toBe(270336); // 264KB
      expect(pico?.linkerScript).toBe("pico.ld");
      expect(pico?.defines).toContain("PICO_BOARD=pico");
      expect(pico?.defines).toContain("PICO_RP2040");
    });

    it("should have valid Raspberry Pi Pico W device", () => {
      const picoW = RP2_FAMILY_JSON.devices.find(
        (d: DeviceEntry) => d.id === "pico_w",
      );
      expect(picoW).toBeDefined();
      expect(picoW?.name).toBe("Raspberry Pi Pico W");
      expect(picoW?.flash).toBe(2097152); // 2MB
      expect(picoW?.ram).toBe(270336); // 264KB
      expect(picoW?.linkerScript).toBe("pico_w.ld");
      expect(picoW?.defines).toContain("PICO_BOARD=pico_w");
      expect(picoW?.defines).toContain("PICO_RP2040");
      expect(picoW?.defines).toContain("CYW43_LWIP"); // WiFi chip
    });

    it("should have board information for each device", () => {
      RP2_FAMILY_JSON.devices.forEach((device: DeviceEntry) => {
        expect(device.boards).toBeDefined();
        expect(device.boards.length).toBeGreaterThan(0);

        device.boards.forEach((board) => {
          expect(board.name).toBeDefined();
          expect(board.led).toBeDefined();
          expect(board.crystal).toBe(12000000); // 12MHz
          expect(board.buy).toContain("raspberrypi.com");
        });
      });
    });

    it("should have different LED pins for Pico and Pico W", () => {
      const pico = RP2_FAMILY_JSON.devices.find(
        (d: DeviceEntry) => d.id === "pico",
      );
      const picoW = RP2_FAMILY_JSON.devices.find(
        (d: DeviceEntry) => d.id === "pico_w",
      );

      expect(pico?.boards[0].led).toBe("GP25"); // Onboard LED
      expect(picoW?.boards[0].led).toBe("WL_GPIO0"); // WiFi chip LED
    });
  });

  describe("Framework Definitions", () => {
    it("should have both native and Arduino frameworks", () => {
      expect(RP2_FAMILY_JSON.frameworks).toBeDefined();
      expect(RP2_FAMILY_JSON.frameworks.length).toBe(2);

      const frameworkIds = RP2_FAMILY_JSON.frameworks.map((f) => f.frameworkId);
      expect(frameworkIds).toContain("native");
      expect(frameworkIds).toContain("arduino");
    });

    describe("Native Framework (Pico SDK)", () => {
      let nativeFramework: Framework;

      it("should have valid native framework configuration", () => {
        const native = RP2_FAMILY_JSON.frameworks.find(
          (f) => f.frameworkId === "native",
        );
        expect(native).toBeDefined();
        nativeFramework = native?.framework as Framework;

        expect(nativeFramework.id).toBe("native");
        expect(nativeFramework.name).toBe("Native (Pico SDK)");
        expect(nativeFramework.version).toBe("1.5.1");
        expect(nativeFramework.description).toContain("Pico SDK");
      });

      it("should have correct compiler flags", () => {
        const native = RP2_FAMILY_JSON.frameworks.find(
          (f) => f.frameworkId === "native",
        );
        const fw = native?.framework as Framework;

        expect(fw.compilerFlags).toContain("-nostdlib");
        expect(fw.compilerFlags).toContain("-ffreestanding");
      });

      it("should have correct linker flags", () => {
        const native = RP2_FAMILY_JSON.frameworks.find(
          (f) => f.frameworkId === "native",
        );
        const fw = native?.framework as Framework;

        expect(fw.linkerFlags).toContain("-nostdlib");
        expect(fw.linkerFlags).toContain("--gc-sections");
      });

      it("should have PICO_SDK define", () => {
        const native = RP2_FAMILY_JSON.frameworks.find(
          (f) => f.frameworkId === "native",
        );
        const fw = native?.framework as Framework;

        expect(fw.defines).toContain("PICO_SDK");
      });
    });

    describe("Arduino Framework", () => {
      let arduinoFramework: Framework;

      it("should have valid Arduino framework configuration", () => {
        const arduino = RP2_FAMILY_JSON.frameworks.find(
          (f) => f.frameworkId === "arduino",
        );
        expect(arduino).toBeDefined();
        arduinoFramework = arduino?.framework as Framework;

        expect(arduinoFramework.id).toBe("arduino");
        expect(arduinoFramework.name).toBe("Arduino-Pico");
        expect(arduinoFramework.version).toBe("3.6.0");
        expect(arduinoFramework.description).toContain("Arduino");
        expect(arduinoFramework.description).toContain("Pico SDK");
      });

      it("should have C++17 standard", () => {
        const arduino = RP2_FAMILY_JSON.frameworks.find(
          (f) => f.frameworkId === "arduino",
        );
        const fw = arduino?.framework as Framework;

        expect(fw.compilerFlags).toContain("-std=gnu++17");
      });

      it("should have Arduino-specific compiler flags", () => {
        const arduino = RP2_FAMILY_JSON.frameworks.find(
          (f) => f.frameworkId === "arduino",
        );
        const fw = arduino?.framework as Framework;

        expect(fw.compilerFlags).toContain("-fno-rtti");
        expect(fw.compilerFlags).toContain("-fno-exceptions");
        expect(fw.compilerFlags).toContain("-fno-threadsafe-statics");
        expect(fw.compilerFlags).toContain("-ffunction-sections");
        expect(fw.compilerFlags).toContain("-fdata-sections");
        expect(fw.compilerFlags).toContain("-Os"); // Optimize for size
      });

      it("should have Arduino-specific defines", () => {
        const arduino = RP2_FAMILY_JSON.frameworks.find(
          (f) => f.frameworkId === "arduino",
        );
        const fw = arduino?.framework as Framework;

        expect(fw.defines).toContain("ARDUINO=10819");
        expect(fw.defines).toContain("ARDUINO_ARCH_RP2040");
        expect(fw.defines).toContain("ARDUINO_RASPBERRY_PI_PICO");
        expect(fw.defines).toContain("PICO_RP2040");
      });

      it("should have correct include paths", () => {
        const arduino = RP2_FAMILY_JSON.frameworks.find(
          (f) => f.frameworkId === "arduino",
        );
        const fw = arduino?.framework as Framework;

        expect(fw.includePaths).toContain("/cores/rp2040");
        expect(fw.includePaths).toContain("/variants/rpipico");
      });

      it("should require preprocessing for .ino files", () => {
        const arduino = RP2_FAMILY_JSON.frameworks.find(
          (f) => f.frameworkId === "arduino",
        );
        const fw = arduino?.framework as Framework;

        expect(fw.requiresPreprocessing).toBe(true);
        expect(fw.fileExtension).toBe(".ino");
      });

      it("should have core download URL", () => {
        const arduino = RP2_FAMILY_JSON.frameworks.find(
          (f) => f.frameworkId === "arduino",
        );
        const fw = arduino?.framework as Framework;

        expect(fw.coreUrl).toBe("rp2040/rp2/frameworks/arduino/core.tar.gz");
        expect(fw.coreChecksum).toBeDefined();
      });

      it("should have linker flags", () => {
        const arduino = RP2_FAMILY_JSON.frameworks.find(
          (f) => f.frameworkId === "arduino",
        );
        const fw = arduino?.framework as Framework;

        expect(fw.linkerFlags).toContain("--gc-sections");
        expect(fw.linkerFlags).toContain("--print-memory-usage");
      });
    });
  });

  describe("Examples", () => {
    it("should have example projects", () => {
      expect(RP2_FAMILY_JSON.examples).toBeDefined();
      expect(RP2_FAMILY_JSON.examples.length).toBeGreaterThan(0);
    });

    it("should have beginner-friendly blink example", () => {
      const blink = RP2_FAMILY_JSON.examples.find((e) => e.id === "blink");
      expect(blink).toBeDefined();
      expect(blink?.name).toBe("LED Blink");
      expect(blink?.difficulty).toBe("beginner");
    });

    it("should have UART example", () => {
      const uart = RP2_FAMILY_JSON.examples.find((e) => e.id === "uart");
      expect(uart).toBeDefined();
      expect(uart?.name).toBe("UART Hello");
      expect(uart?.difficulty).toBe("beginner");
    });

    it("should have PIO example showcasing unique feature", () => {
      const pioBlink = RP2_FAMILY_JSON.examples.find(
        (e) => e.id === "pio_blink",
      );
      expect(pioBlink).toBeDefined();
      expect(pioBlink?.name).toBe("PIO Blink");
      expect(pioBlink?.description).toContain("PIO");
      expect(pioBlink?.difficulty).toBe("intermediate");
    });

    it("should have multicore example for dual-core feature", () => {
      const multicore = RP2_FAMILY_JSON.examples.find(
        (e) => e.id === "multicore",
      );
      expect(multicore).toBeDefined();
      expect(multicore?.name).toBe("Dual Core");
      expect(multicore?.description).toContain("both cores");
      expect(multicore?.difficulty).toBe("advanced");
    });

    it("should have valid file paths for all examples", () => {
      RP2_FAMILY_JSON.examples.forEach((example) => {
        expect(example.file).toBeDefined();
        expect(example.file).toMatch(/^examples\/.+\.(c|cpp|ino)$/);
      });
    });
  });

  describe("Schema Validation", () => {
    it("should have all required top-level fields", () => {
      expect(RP2_FAMILY_JSON.id).toBeDefined();
      expect(RP2_FAMILY_JSON.name).toBeDefined();
      expect(RP2_FAMILY_JSON.architecture).toBeDefined();
      expect(RP2_FAMILY_JSON.devices).toBeDefined();
      expect(RP2_FAMILY_JSON.headers).toBeDefined();
      expect(RP2_FAMILY_JSON.libs).toBeDefined();
      expect(RP2_FAMILY_JSON.compilerFlags).toBeDefined();
      expect(RP2_FAMILY_JSON.linkerFlags).toBeDefined();
      expect(RP2_FAMILY_JSON.frameworks).toBeDefined();
    });

    it("should have valid device schema", () => {
      RP2_FAMILY_JSON.devices.forEach((device: DeviceEntry) => {
        expect(device.id).toBeDefined();
        expect(device.name).toBeDefined();
        expect(device.flash).toBeGreaterThan(0);
        expect(device.ram).toBeGreaterThan(0);
        expect(device.linkerScript).toBeDefined();
        expect(device.defines).toBeDefined();
        expect(Array.isArray(device.defines)).toBe(true);
      });
    });

    it("should have valid framework schema", () => {
      RP2_FAMILY_JSON.frameworks.forEach((fw) => {
        expect(fw.frameworkId).toBeDefined();
        expect(fw.enabled).toBeDefined();
        expect(fw.version).toBeDefined();
        expect(fw.framework).toBeDefined();
        expect(fw.framework.id).toBe(fw.frameworkId);
        expect(fw.framework.name).toBeDefined();
        expect(fw.framework.compilerFlags).toBeDefined();
        expect(Array.isArray(fw.framework.compilerFlags)).toBe(true);
      });
    });
  });

  describe("RP2040-Specific Features", () => {
    it("should list PIO as a peripheral", () => {
      expect(RP2_FAMILY_JSON.features.peripherals).toContain("PIO");
    });

    it("should have correct peripheral list", () => {
      const expectedPeripherals = [
        "USB",
        "I2C",
        "SPI",
        "UART",
        "ADC",
        "PWM",
        "Timer",
        "DMA",
        "GPIO",
        "PIO",
        "RTC",
      ];
      expectedPeripherals.forEach((peripheral) => {
        expect(RP2_FAMILY_JSON.features.peripherals).toContain(peripheral);
      });
    });

    it("should correctly indicate no FPU support", () => {
      expect(RP2_FAMILY_JSON.features.fpu).toBe(false);
      expect(RP2_FAMILY_JSON.features.dsp).toBe(false);
    });

    it("should indicate dual-core capability", () => {
      expect(RP2_FAMILY_JSON.features.cores).toBe(2);
    });

    it("should indicate 8 PIO state machines", () => {
      expect(RP2_FAMILY_JSON.features.pioStateMachines).toBe(8);
    });
  });
});
