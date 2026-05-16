/**
 * Wire Wizard Library
 *
 * A wiring diagram editor library, organized into feature modules:
 * - core/              - Types, utilities, and React contexts
 * - canvas/            - Canvas hooks and path math
 * - blocks/            - Block hooks
 * - component-library/ - SVG generators + metadata for every component
 * - wires/             - Wire utilities (gauge, crossings, junctions)
 * - bus/               - Bus group utilities
 * - persistence/       - localStorage + JSON file save/load
 * - keyboard/          - Keyboard shortcuts
 */

// ============================================
// Core contexts and providers
// ============================================
export {
  // Providers
  WireWizardProvider,
  DiagramProvider,
  SelectionProvider,
  DisplayProvider,

  // Hooks
  useDiagram,
  useBlocks,
  useWires,
  useBusGroups,
  useSelection,
  useDisplay,
  useDisplaySettings,

  // Types
  type SelectionState,
  type BusGroupData,
} from './core/contexts';

// ============================================
// Types (from core)
// ============================================
export type {
  Block,
  Wire,
  ConnectionPoint,
  BendPoint,
  BlockShape,
  WireGauge,
  WireSegmentGauge,
  ConnectionPointShape,
  DiagramData,
} from './core/types';

// ============================================
// Core Utilities
// ============================================
export { snapToGrid, screenToSVG, getGlobalPos, smartSnapToGrid } from './core/utils';

// ============================================
// Canvas Module
// ============================================
export { useCanvasTransform } from './canvas/hooks/useCanvasTransform';
export { useDragState, type DragState, type UseDragStateReturn } from './canvas/hooks/useDragState';
export {
  distanceToLineSegment,
  findNearestPointOnWire,
  calculateBusCenterPoints,
  getPointAtDistanceAlongPath,
  calculatePathLength,
  getPointAtPercentage,
} from './canvas/pathUtils';

// ============================================
// Component Library
// ============================================
export {
  COMPONENT_REGISTRY,
  COMPONENT_CATEGORIES,
  getAllComponents,
  getComponentsByCategory,
  getComponent,
  generateComponent,
  getComponentDimensions,
  searchComponents,
  type ComponentDefinition,
  type ComponentMetadata,
  type ComponentCategory,
  type ConfigField,
  type GeneratorResult,
  type ConnectionPointDefinition,
} from './component-library';

// ============================================
// Wires Module
// ============================================
export { useInlineEditing, type InlineEditState, type UseInlineEditingReturn } from './wires/hooks/useInlineEditing';
export { updateWireAndConnectionColors } from './wires/wireUtils';
export {
  AWG_DIAMETER_MAP,
  AWG_CURRENT_CAPACITY,
  gaugeToStrokeWidth,
  getSegmentGauge,
  getAllSegmentGauges,
  setSegmentGauge,
  getAvailableGauges,
  getWireSegments,
} from './wires/wireGaugeUtils';
export {
  getLineIntersection,
  findCrossingsOnPath,
  buildPathWithGaps,
  buildWirePath,
} from './wires/wireCrossings';
export { createTJunction, type TJunctionResult, type WireStart } from './wires/junctionUtils';

// ============================================
// Persistence Module
// ============================================
export { useHistory } from './persistence/useHistory';
export {
  loadFromLocalStorage,
  saveToLocalStorage,
  exportToFile,
  importFromFile,
  clearAllData,
} from './persistence/fileOperations';
