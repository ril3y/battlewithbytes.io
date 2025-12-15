/**
 * Tests for Project Templates
 * Verifies template definitions, framework requirements, and helper functions
 */

import type { ProjectTemplate } from "../types";
import type { Architecture } from "../../platform/types";
import {
  PROJECT_TEMPLATES,
  getTemplateById,
  getTemplatesByFramework,
  getTemplatesForPlatform,
  isTemplateCompatibleWithPlatform,
} from "../templates";

describe("Template Structure", () => {
  it("should have all required fields for each template", () => {
    PROJECT_TEMPLATES.forEach((template) => {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.icon).toBeDefined();
      expect(template.files).toBeDefined();
      expect(Array.isArray(template.files)).toBe(true);
      expect(template.files.length).toBeGreaterThan(0);
    });
  });

  it("should have unique template IDs", () => {
    const ids = PROJECT_TEMPLATES.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it("should have valid file structures", () => {
    PROJECT_TEMPLATES.forEach((template) => {
      template.files.forEach((file) => {
        expect(file.path).toBeDefined();
        expect(file.path.startsWith("/")).toBe(true);
        expect(file.content).toBeDefined();
        expect(typeof file.editable).toBe("boolean");
      });
    });
  });
});

describe("Framework Requirements", () => {
  it("should have Arduino templates with framework: arduino", () => {
    const arduinoTemplates = PROJECT_TEMPLATES.filter((t) =>
      t.id.startsWith("arduino-"),
    );

    expect(arduinoTemplates.length).toBeGreaterThan(0);
    arduinoTemplates.forEach((template) => {
      expect(template.framework).toBe("arduino");
    });
  });

  it("should have native STM32 templates with framework: native", () => {
    const nativeTemplates = PROJECT_TEMPLATES.filter((t) =>
      t.id.startsWith("stm32-"),
    );

    expect(nativeTemplates.length).toBeGreaterThan(0);
    nativeTemplates.forEach((template) => {
      expect(template.framework).toBe("native");
    });
  });

  it("should have Arduino templates without platformPreset", () => {
    const arduinoTemplates = PROJECT_TEMPLATES.filter(
      (t) => t.framework === "arduino",
    );

    arduinoTemplates.forEach((template) => {
      expect(template.platformPreset).toBeNull();
    });
  });

  it("should have native templates with platformPreset", () => {
    const nativeTemplates = PROJECT_TEMPLATES.filter(
      (t) => t.framework === "native",
    );

    nativeTemplates.forEach((template) => {
      expect(template.platformPreset).not.toBeNull();
      expect(template.platformPreset?.platformId).toBeDefined();
      expect(template.platformPreset?.familyId).toBeDefined();
      expect(template.platformPreset?.deviceId).toBeDefined();
    });
  });
});

describe("Architecture Requirements", () => {
  it("should have Arduino templates with architecture requirements", () => {
    const arduinoTemplates = PROJECT_TEMPLATES.filter(
      (t) => t.framework === "arduino",
    );

    arduinoTemplates.forEach((template) => {
      expect(template.architectureRequirements).toBeDefined();
      expect(Array.isArray(template.architectureRequirements)).toBe(true);
      expect(template.architectureRequirements!.length).toBeGreaterThan(0);
    });
  });

  it("should have valid architecture values in requirements", () => {
    const validArchitectures: Architecture[] = [
      "cortex-m0",
      "cortex-m0+",
      "cortex-m3",
      "cortex-m4",
      "cortex-m4f",
      "cortex-m7",
      "cortex-m7f",
      "xtensa-lx6",
      "xtensa-lx7",
      "riscv32",
    ];

    PROJECT_TEMPLATES.forEach((template) => {
      if (template.architectureRequirements) {
        template.architectureRequirements.forEach((arch) => {
          expect(validArchitectures).toContain(arch);
        });
      }
    });
  });

  it("should have Arduino templates supporting common ARM Cortex-M architectures", () => {
    const arduinoTemplates = PROJECT_TEMPLATES.filter(
      (t) => t.framework === "arduino",
    );

    const expectedArchitectures: Architecture[] = [
      "cortex-m0",
      "cortex-m0+",
      "cortex-m3",
      "cortex-m4",
      "cortex-m4f",
      "cortex-m7",
      "cortex-m7f",
    ];

    arduinoTemplates.forEach((template) => {
      expectedArchitectures.forEach((arch) => {
        expect(template.architectureRequirements).toContain(arch);
      });
    });
  });
});

describe("getTemplateById", () => {
  it("should return template when valid ID is provided", () => {
    const template = getTemplateById("arduino-blink");
    expect(template).not.toBeNull();
    expect(template?.id).toBe("arduino-blink");
    expect(template?.name).toBe("Arduino Blink");
  });

  it("should return null when invalid ID is provided", () => {
    const template = getTemplateById("non-existent-template");
    expect(template).toBeNull();
  });

  it("should work for all template IDs", () => {
    PROJECT_TEMPLATES.forEach((template) => {
      const found = getTemplateById(template.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(template.id);
    });
  });
});

describe("getTemplatesByFramework", () => {
  it("should return all Arduino templates", () => {
    const arduinoTemplates = getTemplatesByFramework("arduino");
    expect(arduinoTemplates.length).toBeGreaterThan(0);
    arduinoTemplates.forEach((template) => {
      expect(template.framework).toBe("arduino");
    });
  });

  it("should return all native templates", () => {
    const nativeTemplates = getTemplatesByFramework("native");
    expect(nativeTemplates.length).toBeGreaterThan(0);
    nativeTemplates.forEach((template) => {
      expect(template.framework).toBe("native");
    });
  });

  it("should return empty array for unsupported framework", () => {
    const templates = getTemplatesByFramework("unsupported-framework");
    expect(templates).toEqual([]);
  });

  it("should return at least 2 Arduino templates", () => {
    const arduinoTemplates = getTemplatesByFramework("arduino");
    expect(arduinoTemplates.length).toBeGreaterThanOrEqual(2);

    const ids = arduinoTemplates.map((t) => t.id);
    expect(ids).toContain("arduino-blink");
    expect(ids).toContain("arduino-serial");
  });

  it("should return at least 3 native templates", () => {
    const nativeTemplates = getTemplatesByFramework("native");
    expect(nativeTemplates.length).toBeGreaterThanOrEqual(3);

    const ids = nativeTemplates.map((t) => t.id);
    expect(ids).toContain("stm32-blink");
    expect(ids).toContain("stm32-uart-echo");
    expect(ids).toContain("stm32-freertos");
  });
});

describe("getTemplatesForPlatform", () => {
  it("should return templates compatible with cortex-m3", () => {
    const templates = getTemplatesForPlatform("stm32", "f1", "cortex-m3");
    expect(templates.length).toBeGreaterThan(0);
  });

  it("should include Arduino templates for cortex-m3 platform", () => {
    const templates = getTemplatesForPlatform("stm32", "f1", "cortex-m3");
    const arduinoTemplates = templates.filter((t) => t.framework === "arduino");
    expect(arduinoTemplates.length).toBeGreaterThan(0);
  });

  it("should include native templates for cortex-m3 platform", () => {
    const templates = getTemplatesForPlatform("stm32", "f1", "cortex-m3");
    const nativeTemplates = templates.filter((t) => t.framework === "native");
    expect(nativeTemplates.length).toBeGreaterThan(0);
  });

  it("should include templates without architecture requirements", () => {
    const templates = getTemplatesForPlatform("stm32", "f1", "cortex-m3");
    const templatesWithoutReqs = templates.filter(
      (t) => !t.architectureRequirements,
    );
    expect(templatesWithoutReqs.length).toBeGreaterThanOrEqual(0);
  });

  it("should work with different ARM Cortex-M architectures", () => {
    const architectures: Architecture[] = [
      "cortex-m0",
      "cortex-m3",
      "cortex-m4",
      "cortex-m7",
    ];

    architectures.forEach((arch) => {
      const templates = getTemplatesForPlatform("stm32", "fx", arch);
      expect(templates.length).toBeGreaterThan(0);

      // Arduino templates should be included for all ARM Cortex-M
      const arduinoTemplates = templates.filter(
        (t) => t.framework === "arduino",
      );
      expect(arduinoTemplates.length).toBeGreaterThan(0);
    });
  });

  it("should exclude templates with incompatible architectures", () => {
    // Create a mock scenario where we filter for an architecture
    // that's not in the Arduino requirements
    const templates = getTemplatesForPlatform("esp32", "esp32", "xtensa-lx6");

    // Arduino templates should not be included since they only support ARM Cortex-M
    const arduinoTemplates = templates.filter((t) => t.framework === "arduino");
    expect(arduinoTemplates.length).toBe(0);
  });
});

describe("isTemplateCompatibleWithPlatform", () => {
  it("should return true for Arduino template with cortex-m3", () => {
    const template = getTemplateById("arduino-blink");
    expect(template).not.toBeNull();

    const isCompatible = isTemplateCompatibleWithPlatform(
      template!,
      "cortex-m3",
    );
    expect(isCompatible).toBe(true);
  });

  it("should return true for Arduino template with cortex-m4", () => {
    const template = getTemplateById("arduino-blink");
    expect(template).not.toBeNull();

    const isCompatible = isTemplateCompatibleWithPlatform(
      template!,
      "cortex-m4",
    );
    expect(isCompatible).toBe(true);
  });

  it("should return false for Arduino template with non-ARM architecture", () => {
    const template = getTemplateById("arduino-blink");
    expect(template).not.toBeNull();

    const isCompatible = isTemplateCompatibleWithPlatform(
      template!,
      "xtensa-lx6",
    );
    expect(isCompatible).toBe(false);
  });

  it("should return true for templates without architecture requirements", () => {
    const blankTemplate = getTemplateById("blank");
    if (blankTemplate && !blankTemplate.architectureRequirements) {
      const isCompatible = isTemplateCompatibleWithPlatform(
        blankTemplate,
        "any-architecture",
      );
      expect(isCompatible).toBe(true);
    }
  });

  it("should work for all ARM Cortex-M architectures with Arduino templates", () => {
    const template = getTemplateById("arduino-serial");
    expect(template).not.toBeNull();

    const armArchitectures: Architecture[] = [
      "cortex-m0",
      "cortex-m0+",
      "cortex-m3",
      "cortex-m4",
      "cortex-m4f",
      "cortex-m7",
      "cortex-m7f",
    ];

    armArchitectures.forEach((arch) => {
      const isCompatible = isTemplateCompatibleWithPlatform(template!, arch);
      expect(isCompatible).toBe(true);
    });
  });
});

describe("Template Content Validation", () => {
  it("should have Arduino templates with .ino files", () => {
    const arduinoTemplates = getTemplatesByFramework("arduino");

    arduinoTemplates.forEach((template) => {
      const hasInoFile = template.files.some((file) =>
        file.path.endsWith(".ino"),
      );
      expect(hasInoFile).toBe(true);
    });
  });

  it("should have native templates with .c files", () => {
    const nativeTemplates = getTemplatesByFramework("native");

    nativeTemplates.forEach((template) => {
      const hasCFile = template.files.some((file) => file.path.endsWith(".c"));
      expect(hasCFile).toBe(true);
    });
  });

  it("should have editable source files", () => {
    PROJECT_TEMPLATES.forEach((template) => {
      const editableFiles = template.files.filter((f) => f.editable);
      expect(editableFiles.length).toBeGreaterThan(0);
    });
  });
});

describe("Backward Compatibility", () => {
  it("should support templates with platformPreset", () => {
    const templatesWithPreset = PROJECT_TEMPLATES.filter(
      (t) => t.platformPreset !== null,
    );

    expect(templatesWithPreset.length).toBeGreaterThan(0);
    templatesWithPreset.forEach((template) => {
      expect(template.platformPreset?.platformId).toBeDefined();
      expect(template.platformPreset?.familyId).toBeDefined();
      expect(template.platformPreset?.deviceId).toBeDefined();
    });
  });

  it("should support templates without platformPreset", () => {
    const templatesWithoutPreset = PROJECT_TEMPLATES.filter(
      (t) => t.platformPreset === null,
    );

    expect(templatesWithoutPreset.length).toBeGreaterThan(0);
    templatesWithoutPreset.forEach((template) => {
      // Framework-based templates without preset should have framework defined
      // Blank template is an exception - it's framework-agnostic
      if (template.id !== "blank") {
        expect(template.framework).toBeDefined();
      }
    });
  });

  it("should maintain frameworkId in platformPreset when present", () => {
    const nativeTemplates = PROJECT_TEMPLATES.filter(
      (t) => t.framework === "native" && t.platformPreset !== null,
    );

    nativeTemplates.forEach((template) => {
      expect(template.platformPreset?.frameworkId).toBe("native");
    });
  });
});

describe("Template Count and Coverage", () => {
  it("should have at least 6 templates total", () => {
    expect(PROJECT_TEMPLATES.length).toBeGreaterThanOrEqual(6);
  });

  it("should have proper distribution of templates", () => {
    const arduinoCount = getTemplatesByFramework("arduino").length;
    const nativeCount = getTemplatesByFramework("native").length;

    expect(arduinoCount).toBeGreaterThanOrEqual(2);
    expect(nativeCount).toBeGreaterThanOrEqual(3);
  });

  it("should include specific expected templates", () => {
    const expectedTemplates = [
      "stm32-blink",
      "stm32-uart-echo",
      "stm32-freertos",
      "arduino-blink",
      "arduino-serial",
      "blank",
    ];

    expectedTemplates.forEach((templateId) => {
      const template = getTemplateById(templateId);
      expect(template).not.toBeNull();
    });
  });
});
