/**
 * Template Loader
 *
 * Loads project templates from the data/boards/templates directory.
 * Templates are defined in manifest.json files with source files referenced by sourcePath.
 */

import { withBasePath } from "../utils/basePath";
import type { ProjectTemplate, ProjectFile } from "./types";
import type { Architecture, FrameworkId } from "../platform/types";

/**
 * Template manifest as stored in manifest.json files
 */
interface TemplateManifest {
  $schema?: string;
  id: string;
  name: string;
  description: string;
  icon?: string;
  framework?: FrameworkId;
  platformPreset: {
    platformId: string;
    familyId: string;
    deviceId: string;
    frameworkId?: FrameworkId;
  } | null;
  architectureRequirements?: Architecture[];
  files: Array<{
    path: string;
    sourcePath: string;
    editable: boolean;
  }>;
  categories?: string[];
  keywords?: string[];
}

/**
 * Registry entry for a template
 */
interface TemplateRegistryEntry {
  id: string;
  name: string;
  path: string;
  framework: FrameworkId | null;
  platforms: string[] | null;
}

/**
 * Cache for loaded templates
 */
const templateCache = new Map<string, ProjectTemplate>();
let registryCache: TemplateRegistryEntry[] | null = null;

/**
 * Base path for templates in the data/boards directory
 */
const TEMPLATES_BASE = "/data/boards/templates";

/**
 * Load the template registry from registry.json
 */
async function loadRegistry(): Promise<TemplateRegistryEntry[]> {
  if (registryCache) {
    return registryCache;
  }

  const response = await fetch(withBasePath("/data/boards/registry.json"));
  if (!response.ok) {
    throw new Error(`Failed to load registry: ${response.statusText}`);
  }

  const registry = await response.json();
  const templates: TemplateRegistryEntry[] = registry.templates || [];
  registryCache = templates;
  return templates;
}

/**
 * Load a template manifest from its path
 */
async function loadManifest(manifestPath: string): Promise<TemplateManifest> {
  const url = withBasePath(`/data/boards/${manifestPath}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load template manifest: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Load a source file from a template
 */
async function loadSourceFile(
  templateId: string,
  sourcePath: string
): Promise<string> {
  const url = withBasePath(`${TEMPLATES_BASE}/${templateId}/${sourcePath}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to load template file ${sourcePath}: ${response.statusText}`
    );
  }
  return response.text();
}

/**
 * Load a complete template by ID
 */
export async function loadTemplate(
  templateId: string
): Promise<ProjectTemplate | null> {
  // Check cache first
  if (templateCache.has(templateId)) {
    return templateCache.get(templateId)!;
  }

  try {
    // Load registry to find template path
    const registry = await loadRegistry();
    const entry = registry.find((t) => t.id === templateId);
    if (!entry) {
      console.warn(`Template not found in registry: ${templateId}`);
      return null;
    }

    // Load manifest
    const manifest = await loadManifest(entry.path);

    // Load all source files
    const files: ProjectFile[] = await Promise.all(
      manifest.files.map(async (fileSpec) => {
        const content = await loadSourceFile(templateId, fileSpec.sourcePath);
        return {
          path: fileSpec.path,
          content,
          editable: fileSpec.editable,
        };
      })
    );

    // Build ProjectTemplate
    const template: ProjectTemplate = {
      id: manifest.id,
      name: manifest.name,
      description: manifest.description,
      icon: manifest.icon || "📄",
      framework: manifest.framework,
      architectureRequirements: manifest.architectureRequirements,
      platformPreset: manifest.platformPreset,
      files,
    };

    // Cache it
    templateCache.set(templateId, template);
    return template;
  } catch (error) {
    console.error(`Error loading template ${templateId}:`, error);
    return null;
  }
}

/**
 * Get all available templates (loads registry only, not full templates)
 */
export async function getAvailableTemplates(): Promise<TemplateRegistryEntry[]> {
  return loadRegistry();
}

/**
 * Get a template by ID (alias for loadTemplate for API compatibility)
 */
export async function getTemplateById(
  id: string
): Promise<ProjectTemplate | null> {
  return loadTemplate(id);
}

/**
 * Get all templates compatible with a specific framework
 */
export async function getTemplatesByFramework(
  framework: FrameworkId
): Promise<ProjectTemplate[]> {
  const registry = await loadRegistry();
  const matching = registry.filter((t) => t.framework === framework);

  const templates = await Promise.all(
    matching.map((entry) => loadTemplate(entry.id))
  );

  return templates.filter((t): t is ProjectTemplate => t !== null);
}

/**
 * Get all templates compatible with a specific platform/architecture
 */
export async function getTemplatesForPlatform(
  platformId: string,
  _familyId: string,
  architecture: string
): Promise<ProjectTemplate[]> {
  const registry = await loadRegistry();

  // Filter by platform compatibility
  const matching = registry.filter((t) => {
    // Templates with no platform restriction are compatible with all
    if (!t.platforms) return true;
    return t.platforms.includes(platformId);
  });

  // Load full templates to check architecture requirements
  const templates = await Promise.all(
    matching.map((entry) => loadTemplate(entry.id))
  );

  // Filter by architecture compatibility
  return templates.filter((t): t is ProjectTemplate => {
    if (!t) return false;
    // Templates without architecture requirements are compatible with all
    if (!t.architectureRequirements) return true;
    return t.architectureRequirements.includes(architecture as Architecture);
  });
}

/**
 * Check if a template is compatible with a specific architecture
 */
export function isTemplateCompatibleWithPlatform(
  template: ProjectTemplate,
  architecture: string
): boolean {
  if (!template.architectureRequirements) return true;
  return template.architectureRequirements.includes(architecture as Architecture);
}

/**
 * Clear the template cache (useful for development/testing)
 */
export function clearTemplateCache(): void {
  templateCache.clear();
  registryCache = null;
}

/**
 * Preload all templates into cache
 */
export async function preloadAllTemplates(): Promise<ProjectTemplate[]> {
  const registry = await loadRegistry();
  const templates = await Promise.all(
    registry.map((entry) => loadTemplate(entry.id))
  );
  return templates.filter((t): t is ProjectTemplate => t !== null);
}
