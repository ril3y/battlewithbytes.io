// Public API for @battlewithbytes/wire-wizard.
//
// Consumers (apps/web routes, MDX content) import from this barrel only:
//   import { WireWizardEditor, WireWizardViewer } from '@battlewithbytes/wire-wizard';
//   import diagram from './wiring.json';
//   <WireWizardViewer diagram={diagram} />

export { WireWizardEditor } from './Editor';
export type { WireWizardEditorProps } from './Editor';

export { WireWizardViewer } from './Viewer';
export type { WireWizardViewerProps } from './Viewer';

// Diagram data shape — useful for typing JSON imports in MDX pages.
export type {
  DiagramData,
  Block,
  Wire,
  ConnectionPoint,
  BendPoint,
  BlockShape,
  ConnectionPointShape,
  WireGauge,
  WireSegmentGauge,
} from './lib/core/types';

// Optional re-exports for consumers who want to introspect the component
// library (e.g. to render a custom picker outside Wire Wizard).
export {
  COMPONENT_REGISTRY,
  COMPONENT_CATEGORIES,
  getAllComponents,
  getComponent,
  getComponentsByCategory,
  generateComponent,
  searchComponents,
} from './lib/component-library';

export type {
  ComponentDefinition,
  ComponentMetadata,
  ComponentCategory,
  ConfigField,
  GeneratorResult,
  ConnectionPointDefinition,
} from './lib/component-library';
