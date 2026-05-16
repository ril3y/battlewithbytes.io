/**
 * Canvas Module
 * Canvas-related utilities and hooks for the Wire Wizard
 */

// Hooks
export { useCanvasTransform } from './hooks/useCanvasTransform';
export { useDragState, type DragState, type UseDragStateReturn } from './hooks/useDragState';

// Utils
export {
  distanceToLineSegment,
  findNearestPointOnWire,
  calculateBusCenterPoints,
  getPointAtDistanceAlongPath,
  calculatePathLength,
  getPointAtPercentage,
  type Point,
  type NearestPointResult,
} from './pathUtils';
