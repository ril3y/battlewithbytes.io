/**
 * Board Selection Wizard Components
 *
 * A multi-step wizard for board-first project creation:
 * Platform → Board → Example → Details
 */

export { BoardSelectionWizard } from "./BoardSelectionWizard";
export { PlatformSelector } from "./PlatformSelector";
export { BoardBrowser } from "./BoardBrowser";
export { ExamplePicker } from "./ExamplePicker";
export { ProjectDetailsForm } from "./ProjectDetailsForm";

export type {
  WizardStep,
  WizardState,
  PlatformOption,
  BoardFilter,
  WizardProjectResult,
} from "./types";

export { WIZARD_STEPS } from "./types";
