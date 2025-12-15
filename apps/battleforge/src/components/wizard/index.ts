/**
 * Board Selection Wizard Components
 *
 * A multi-step wizard for board-first project creation:
 * Platform → Board → Framework → Example → Details
 */

export { BoardSelectionWizard } from "./BoardSelectionWizard";
export { PlatformSelector } from "./PlatformSelector";
export { BoardBrowser } from "./BoardBrowser";
export { FrameworkSelector } from "./FrameworkSelector";
export { ExamplePicker } from "./ExamplePicker";
export { ProjectDetailsForm } from "./ProjectDetailsForm";

export type {
  WizardStep,
  WizardState,
  PlatformOption,
  FrameworkOption,
  BoardFilter,
  WizardProjectResult,
} from "./types";

export { WIZARD_STEPS } from "./types";
