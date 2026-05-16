/**
 * Wire Wizard Context Providers
 *
 * These contexts eliminate prop drilling by providing state management
 * accessible from any component in the tree.
 */

export {
  DisplayProvider,
  useDisplay,
  useDisplaySettings,
} from './DisplayContext';

export {
  SelectionProvider,
  useSelection,
  type SelectionState,
} from './SelectionContext';

export {
  DiagramProvider,
  useDiagram,
  useBlocks,
  useWires,
  useBusGroups,
  type BusGroupData,
} from './DiagramContext';

export {
  InteractionProvider,
  useInteraction,
  useContextMenu,
  useBusInteraction,
  useBlockCreation,
  type ContextMenuState,
  type EditingBusNameState,
} from './InteractionContext';

// Combined provider for convenience
export { WireWizardProvider } from './WireWizardProvider';
