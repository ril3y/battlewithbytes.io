/**
 * Wire Wizard Core Module
 *
 * Exports all core utilities, contexts, and types
 */

// Contexts
export * from './contexts';

// Types
export type {
  Block,
  Wire,
  ConnectionPoint,
  BendPoint,
  BlockShape,
  WireGauge,
  WireSegmentGauge,
  ConnectionPointShape,
  DiagramData
} from './types';

// Utils
export { snapToGrid, screenToSVG, getGlobalPos, smartSnapToGrid } from './utils';

// Styles
export {
  MODAL_OVERLAY_STYLE,
  MODAL_CONTAINER_STYLE,
  MODAL_HEADER_STYLE,
  MODAL_INPUT_STYLE,
  MODAL_LABEL_STYLE,
  MODAL_FIELD_STYLE,
  MODAL_BUTTON_STYLE,
  MODAL_BUTTON_PRIMARY_STYLE,
  MODAL_BUTTON_ROW_STYLE,
  createCancelButtonHoverHandlers,
  createPrimaryButtonHoverHandlers,
} from './styles';
