/**
 * Wires Module
 * Wire management utilities and hooks for the Wire Wizard
 */

// Hooks
export {
  useInlineEditing,
  type InlineEditState,
  type UseInlineEditingReturn,
} from './hooks/useInlineEditing';

// Wire Utils
export { updateWireAndConnectionColors } from './wireUtils';

// Wire Gauge Utils
export {
  AWG_DIAMETER_MAP,
  AWG_CURRENT_CAPACITY,
  gaugeToStrokeWidth,
  getSegmentGauge,
  getAllSegmentGauges,
  setSegmentGauge,
  getAvailableGauges,
  getWireSegments,
} from './wireGaugeUtils';

// Wire Crossings
export {
  getLineIntersection,
  findCrossingsOnPath,
  buildPathWithGaps,
  buildWirePath,
  type Point,
  type LineSegment,
  type Crossing,
} from './wireCrossings';

// Junction Utils
export {
  createTJunction,
  type TJunctionResult,
  type WireStart,
} from './junctionUtils';
