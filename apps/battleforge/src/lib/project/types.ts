import type { FrameworkId, Architecture } from "../platform/types";

export interface ProjectMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  templateId?: string;
}

export interface ProjectPlatform {
  platformId: string; // "stm32"
  familyId: string; // "f1"
  deviceId: string; // "stm32f103c8"
  architecture: string; // "cortex-m3"
  frameworkId?: FrameworkId; // "native" | "arduino" | "mbed" | "zephyr" (defaults to 'native')
  boardId?: string; // Optional board ID from boards registry (e.g., "feather_nrf52840_express")
}

export interface ProjectFile {
  path: string;
  content: string;
  editable: boolean;
}

// Build artifacts stored as base64 for IndexedDB compatibility
export interface BuildArtifact {
  path: string;
  contentBase64: string; // Base64-encoded binary data
  size: number;
  timestamp: number;
}

export interface Project {
  metadata: ProjectMetadata;
  platform: ProjectPlatform | null;
  files: ProjectFile[];
  libraries?: string[]; // Library IDs (e.g., ['freertos'])
  compilerFlags?: string; // Additional compiler flags
  buildArtifacts?: BuildArtifact[]; // Compiled output files
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;

  // Framework requirement (required for framework-first templates like Arduino)
  framework?: FrameworkId;

  // Architecture requirements (compatible CPU architectures)
  // If specified, template can work with any platform supporting these architectures
  architectureRequirements?: Architecture[];

  // Platform preset (optional - for platform-specific templates)
  // If null, user must select platform in wizard
  // If specified with architectureRequirements, serves as default/recommended platform
  platformPreset: {
    platformId: string;
    familyId: string;
    deviceId: string;
    frameworkId?: FrameworkId; // Optional, defaults to 'native'
  } | null;

  files: ProjectFile[];
}

export type ProjectListItem = Pick<
  ProjectMetadata,
  "id" | "name" | "updatedAt"
> & {
  platformId: string | null;
  deviceId: string | null;
};
