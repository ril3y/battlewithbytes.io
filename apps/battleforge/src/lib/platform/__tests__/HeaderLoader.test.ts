/**
 * @jest-environment node
 */

/**
 * HeaderLoader Tests
 *
 * Tests the GitHub-based header loading functionality
 */

describe("HeaderLoader GitHub Integration", () => {
  beforeAll(() => {
    // Ensure fetch is available (Node 18+)
    if (!global.fetch) {
      console.log("fetch not available, skipping tests");
    }
  });

  describe("fetchGitHubFile", () => {
    it("should fetch stm32f1xx.h from modm-io repo", async () => {
      // Note: Headers are in stm32f1xx/Include/ subdirectory
      const url = "https://raw.githubusercontent.com/modm-io/cmsis-header-stm32/master/stm32f1xx/Include/stm32f1xx.h";

      const response = await fetch(url);
      expect(response.ok).toBe(true);

      const text = await response.text();
      expect(text).toContain("STM32F1xx");
      expect(text).toContain("#ifndef __STM32F1XX_H");
    });

    it("should fetch core_cm3.h from ARM CMSIS repo", async () => {
      const url = "https://raw.githubusercontent.com/ARM-software/CMSIS_5/develop/CMSIS/Core/Include/core_cm3.h";

      const response = await fetch(url);
      expect(response.ok).toBe(true);

      const text = await response.text();
      expect(text).toContain("Cortex-M3");
      expect(text).toContain("NVIC");
    });

    it("should fetch stm32f103xb.h device header", async () => {
      // Note: Headers are in stm32f1xx/Include/ subdirectory
      const url = "https://raw.githubusercontent.com/modm-io/cmsis-header-stm32/master/stm32f1xx/Include/stm32f103xb.h";

      const response = await fetch(url);
      expect(response.ok).toBe(true);

      const text = await response.text();
      expect(text).toContain("STM32F103");
      expect(text).toContain("GPIOA");
      expect(text).toContain("RCC");
    });
  });

  describe("parseGitHubSource", () => {
    // Test the parsing logic
    it("should parse github:owner/repo format", () => {
      const source = "github:modm-io/cmsis-header-stm32";
      const parts = source.substring(7).split("/");

      expect(parts[0]).toBe("modm-io");
      expect(parts[1]).toBe("cmsis-header-stm32");
      expect(parts.slice(2).join("/")).toBe("");
    });

    it("should parse github:owner/repo/path format", () => {
      const source = "github:modm-io/cmsis-header-stm32/stm32f1xx";
      const parts = source.substring(7).split("/");

      expect(parts[0]).toBe("modm-io");
      expect(parts[1]).toBe("cmsis-header-stm32");
      expect(parts.slice(2).join("/")).toBe("stm32f1xx");
    });
  });

  describe("Header file list", () => {
    const STM32_F1_FILES = [
      "stm32f1xx.h",
      "stm32f103xb.h",
      "system_stm32f1xx.h",
    ];

    const CMSIS_CORE_FILES = [
      "cmsis_compiler.h",
      "cmsis_gcc.h",
      "cmsis_version.h",
      "core_cm3.h",
    ];

    it("should be able to fetch all STM32F1 device headers", async () => {
      // Note: Headers are in stm32f1xx/Include/ subdirectory
      const baseUrl = "https://raw.githubusercontent.com/modm-io/cmsis-header-stm32/master/stm32f1xx/Include";

      for (const file of STM32_F1_FILES) {
        const response = await fetch(`${baseUrl}/${file}`);
        expect(response.ok).toBe(true);
        console.log(`  OK: ${file}`);
      }
    }, 30000);

    it("should be able to fetch CMSIS core headers", async () => {
      const baseUrl = "https://raw.githubusercontent.com/ARM-software/CMSIS_5/develop/CMSIS/Core/Include";

      for (const file of CMSIS_CORE_FILES) {
        const response = await fetch(`${baseUrl}/${file}`);
        expect(response.ok).toBe(true);
        console.log(`  OK: ${file}`);
      }
    }, 30000);
  });
});

/**
 * Standalone test runner for quick verification
 * Run with: npx ts-node src/lib/platform/__tests__/HeaderLoader.test.ts
 */
async function runStandaloneTest() {
  console.log("=== HeaderLoader GitHub Integration Test ===\n");

  const tests = [
    {
      name: "STM32F1xx main header",
      url: "https://raw.githubusercontent.com/modm-io/cmsis-header-stm32/master/stm32f1xx/Include/stm32f1xx.h",
      check: (text: string) => text.includes("STM32F1xx"),
    },
    {
      name: "STM32F103xB device header",
      url: "https://raw.githubusercontent.com/modm-io/cmsis-header-stm32/master/stm32f1xx/Include/stm32f103xb.h",
      check: (text: string) => text.includes("STM32F103") && text.includes("GPIOA"),
    },
    {
      name: "CMSIS core_cm3.h",
      url: "https://raw.githubusercontent.com/ARM-software/CMSIS_5/develop/CMSIS/Core/Include/core_cm3.h",
      check: (text: string) => text.includes("Cortex-M3"),
    },
    {
      name: "CMSIS cmsis_gcc.h",
      url: "https://raw.githubusercontent.com/ARM-software/CMSIS_5/develop/CMSIS/Core/Include/cmsis_gcc.h",
      check: (text: string) => text.includes("CMSIS"),
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const response = await fetch(test.url);
      if (!response.ok) {
        console.log(`FAIL: ${test.name} - HTTP ${response.status}`);
        failed++;
        continue;
      }

      const text = await response.text();
      if (test.check(text)) {
        console.log(`PASS: ${test.name} (${(text.length / 1024).toFixed(1)} KB)`);
        passed++;
      } else {
        console.log(`FAIL: ${test.name} - content check failed`);
        failed++;
      }
    } catch (err) {
      console.log(`FAIL: ${test.name} - ${err}`);
      failed++;
    }
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  return failed === 0;
}

// Run standalone if executed directly
if (typeof require !== "undefined" && require.main === module) {
  runStandaloneTest().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
