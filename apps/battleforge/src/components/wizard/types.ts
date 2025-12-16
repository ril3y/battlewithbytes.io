/**
 * Wizard Component Types
 *
 * Types for the board-first project creation wizard.
 */

import type {
  BoardManifest,
  BoardExample,
} from "../../lib/registry/types";
import type { ProjectTemplate } from "../../lib/project/types";

export type WizardStep = "platform" | "board" | "framework" | "example" | "details";

export interface FrameworkOption {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface WizardState {
  currentStep: WizardStep;
  selectedPlatformId: string | null;
  selectedBoard: BoardManifest | null;
  selectedFramework: string | null;
  selectedExample: BoardExample | ProjectTemplate | null;
  projectName: string;
  projectDescription: string;
}

export interface PlatformOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  supported: boolean;
  comingSoon?: boolean;
  boardCount?: number;
  indexPath?: string;
}

export interface BoardFilter {
  vendor?: string;
  features?: string[];
  searchQuery?: string;
}

export interface WizardProjectResult {
  name: string;
  description: string;
  platformId: string;
  familyId: string;
  deviceId: string;
  architecture: string;
  boardId: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  libraries?: string[];
  framework?: string;
}

export const WIZARD_STEPS: {
  key: WizardStep;
  label: string;
  number: number;
}[] = [
  { key: "platform", label: "Platform", number: 1 },
  { key: "board", label: "Board", number: 2 },
  { key: "framework", label: "Framework", number: 3 },
  { key: "example", label: "Template", number: 4 },
  { key: "details", label: "Details", number: 5 },
];
