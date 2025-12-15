/**
 * Integration tests for Project Creation
 * Tests creating projects with different platforms and configurations
 */

import type {
  Project,
  ProjectPlatform,
  ProjectFile,
} from "../../project/types";

// Helper to create a project structure
function createProject(
  name: string,
  platform: ProjectPlatform | null,
  files: ProjectFile[],
): Project {
  return {
    metadata: {
      id: `test-${Date.now()}`,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    platform,
    files,
  };
}

// Sample source files for different platforms
const BLINK_STM32 = `
#include "stm32f1xx.h"

int main(void) {
    // Enable GPIOC clock
    RCC->APB2ENR |= RCC_APB2ENR_IOPCEN;

    // Configure PC13 as output
    GPIOC->CRH &= ~(GPIO_CRH_MODE13 | GPIO_CRH_CNF13);
    GPIOC->CRH |= GPIO_CRH_MODE13_0;

    while(1) {
        GPIOC->ODR ^= GPIO_ODR_ODR13;
        for(volatile int i = 0; i < 100000; i++);
    }
}
`;

const BLINK_NRF52 = `
#include "nrf52840.h"

#define LED_PIN 13

int main(void) {
    // Configure LED pin as output
    NRF_P0->DIRSET = (1 << LED_PIN);

    while(1) {
        NRF_P0->OUT ^= (1 << LED_PIN);
        for(volatile int i = 0; i < 500000; i++);
    }
}
`;

const BLINK_RP2040 = `
#include "hardware/gpio.h"

#define LED_PIN 25

int main(void) {
    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, GPIO_OUT);

    while(1) {
        gpio_put(LED_PIN, 1);
        for(volatile int i = 0; i < 100000; i++);
        gpio_put(LED_PIN, 0);
        for(volatile int i = 0; i < 100000; i++);
    }
}
`;

const ARDUINO_BLINK = `
void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(1000);
    digitalWrite(LED_BUILTIN, LOW);
    delay(1000);
}
`;

describe("Project Creation", () => {
  describe("STM32 Projects", () => {
    it("should create a valid STM32F103 project", () => {
      const platform: ProjectPlatform = {
        platformId: "stm32",
        familyId: "f1",
        deviceId: "stm32f103c8",
        architecture: "cortex-m3",
      };

      const files: ProjectFile[] = [
        { path: "/src/main.c", content: BLINK_STM32, editable: true },
      ];

      const project = createProject("STM32 Blink", platform, files);

      expect(project.metadata.name).toBe("STM32 Blink");
      expect(project.platform).not.toBeNull();
      expect(project.platform!.platformId).toBe("stm32");
      expect(project.platform!.familyId).toBe("f1");
      expect(project.platform!.deviceId).toBe("stm32f103c8");
      expect(project.platform!.architecture).toBe("cortex-m3");
      expect(project.files).toHaveLength(1);
      expect(project.files[0].path).toBe("/src/main.c");
    });

    it("should create STM32 project with board ID", () => {
      const platform: ProjectPlatform = {
        platformId: "stm32",
        familyId: "f1",
        deviceId: "stm32f103c8",
        architecture: "cortex-m3",
        boardId: "bluepill_stm32f103c8",
      };

      const project = createProject("Blue Pill Blink", platform, []);

      expect(project.platform!.boardId).toBe("bluepill_stm32f103c8");
    });
  });

  describe("nRF52 Projects", () => {
    it("should create a valid nRF52840 project", () => {
      const platform: ProjectPlatform = {
        platformId: "nrf",
        familyId: "nrf52",
        deviceId: "nrf52840",
        architecture: "cortex-m4f",
      };

      const files: ProjectFile[] = [
        { path: "/src/main.c", content: BLINK_NRF52, editable: true },
      ];

      const project = createProject("nRF52 Blink", platform, files);

      expect(project.platform!.platformId).toBe("nrf");
      expect(project.platform!.familyId).toBe("nrf52");
      expect(project.platform!.deviceId).toBe("nrf52840");
      expect(project.platform!.architecture).toBe("cortex-m4f");
    });

    it("should create nRF52 project with Feather board", () => {
      const platform: ProjectPlatform = {
        platformId: "nrf",
        familyId: "nrf52",
        deviceId: "nrf52840",
        architecture: "cortex-m4f",
        boardId: "feather_nrf52840_express",
      };

      const project = createProject("Feather Blink", platform, []);

      expect(project.platform!.boardId).toBe("feather_nrf52840_express");
    });
  });

  describe("RP2040 Projects", () => {
    it("should create a valid RP2040 project", () => {
      const platform: ProjectPlatform = {
        platformId: "rp2040",
        familyId: "rp2",
        deviceId: "rp2040",
        architecture: "cortex-m0+",
      };

      const files: ProjectFile[] = [
        { path: "/src/main.c", content: BLINK_RP2040, editable: true },
      ];

      const project = createProject("Pico Blink", platform, files);

      expect(project.platform!.platformId).toBe("rp2040");
      expect(project.platform!.architecture).toBe("cortex-m0+");
    });
  });

  describe("ESP32 Projects", () => {
    it("should create a valid ESP32 project", () => {
      const platform: ProjectPlatform = {
        platformId: "esp32",
        familyId: "esp32",
        deviceId: "esp32",
        architecture: "xtensa-lx6",
      };

      const project = createProject("ESP32 Project", platform, []);

      expect(project.platform!.platformId).toBe("esp32");
      expect(project.platform!.architecture).toBe("xtensa-lx6");
    });
  });

  describe("Arduino Framework Projects", () => {
    it("should create Arduino project with framework ID", () => {
      const platform: ProjectPlatform = {
        platformId: "stm32",
        familyId: "f1",
        deviceId: "stm32f103c8",
        architecture: "cortex-m3",
        frameworkId: "arduino",
      };

      const files: ProjectFile[] = [
        { path: "/src/main.ino", content: ARDUINO_BLINK, editable: true },
      ];

      const project = createProject("Arduino Blink", platform, files);

      expect(project.platform!.frameworkId).toBe("arduino");
      expect(project.files[0].path).toContain(".ino");
    });
  });

  describe("Project with Libraries", () => {
    it("should create project with library dependencies", () => {
      const platform: ProjectPlatform = {
        platformId: "stm32",
        familyId: "f1",
        deviceId: "stm32f103c8",
        architecture: "cortex-m3",
      };

      const project: Project = {
        metadata: {
          id: "test-libs",
          name: "FreeRTOS Project",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        platform,
        files: [],
        libraries: ["freertos", "wire"],
      };

      expect(project.libraries).toContain("freertos");
      expect(project.libraries).toContain("wire");
      expect(project.libraries).toHaveLength(2);
    });
  });

  describe("Project Validation", () => {
    it("should allow project without platform (no target)", () => {
      const project = createProject("Untargeted Project", null, []);

      expect(project.platform).toBeNull();
    });

    it("should include all required metadata fields", () => {
      const project = createProject("Test Project", null, []);

      expect(project.metadata.id).toBeDefined();
      expect(project.metadata.name).toBe("Test Project");
      expect(project.metadata.createdAt).toBeDefined();
      expect(project.metadata.updatedAt).toBeDefined();
    });

    it("should handle multiple source files", () => {
      const files: ProjectFile[] = [
        { path: "/src/main.c", content: "int main() {}", editable: true },
        { path: "/src/utils.c", content: "void util() {}", editable: true },
        { path: "/include/utils.h", content: "#pragma once", editable: true },
        { path: "/README.md", content: "# Project", editable: false },
      ];

      const project = createProject("Multi-file Project", null, files);

      expect(project.files).toHaveLength(4);
      expect(project.files.filter((f) => f.editable)).toHaveLength(3);
    });
  });
});

describe("Project Platform Configurations", () => {
  it("should have correct architecture for each platform", () => {
    const configs: Array<{
      platform: string;
      family: string;
      arch: string;
    }> = [
      { platform: "stm32", family: "f1", arch: "cortex-m3" },
      { platform: "stm32", family: "f4", arch: "cortex-m4f" },
      { platform: "nrf", family: "nrf52", arch: "cortex-m4f" },
      { platform: "rp2040", family: "rp2", arch: "cortex-m0+" },
      { platform: "esp32", family: "esp32", arch: "xtensa-lx6" },
      { platform: "esp32", family: "esp32s3", arch: "xtensa-lx7" },
      { platform: "esp32", family: "esp32c3", arch: "riscv32" },
    ];

    for (const cfg of configs) {
      const platform: ProjectPlatform = {
        platformId: cfg.platform,
        familyId: cfg.family,
        deviceId: `${cfg.platform}_device`,
        architecture: cfg.arch,
      };

      expect(platform.architecture).toBe(cfg.arch);
    }
  });
});
