/**
 * Utilities for working with wire paths and geometry
 */

import { Wire } from '../core/types';
import { snapToGrid } from '../core/utils';

export interface Point {
  x: number;
  y: number;
}

export interface NearestPointResult {
  x: number;
  y: number;
  segmentIndex: number;
  distance: number;
}

/**
 * Calculate the distance from a point to a line segment
 */
export function distanceToLineSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  const param = lenSq !== 0 ? dot / lenSq : -1;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find the nearest point on a wire's path to a given position
 */
export function findNearestPointOnWire(
  wire: Wire,
  clickX: number,
  clickY: number,
  getEndpointFn: (wire: Wire, isFrom: boolean) => Point,
  gridSize: number = 10,
  tolerance: number = 15
): NearestPointResult | null {
  const from = getEndpointFn(wire, true);
  const to = getEndpointFn(wire, false);

  // Build array of all points in the wire path
  const pathPoints = [from, ...wire.bendPoints, to];

  let minDistance = Infinity;
  let nearestPoint: Point | null = null;
  let nearestSegmentIndex = -1;

  // Check each segment
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const p1 = pathPoints[i];
    const p2 = pathPoints[i + 1];

    const distance = distanceToLineSegment(clickX, clickY, p1.x, p1.y, p2.x, p2.y);

    if (distance < minDistance) {
      minDistance = distance;
      nearestSegmentIndex = i;

      // Calculate the exact point on the segment
      const A = clickX - p1.x;
      const B = clickY - p1.y;
      const C = p2.x - p1.x;
      const D = p2.y - p1.y;
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      const param = lenSq !== 0 ? Math.max(0, Math.min(1, dot / lenSq)) : 0;

      // Calculate projected point
      const projX = p1.x + param * C;
      const projY = p1.y + param * D;

      const isVertical = Math.abs(C) < 0.001;
      const isHorizontal = Math.abs(D) < 0.001;

      if (isVertical) {
        nearestPoint = {
          x: p1.x, // Force exact X of the vertical wire
          y: snapToGrid(projY, gridSize) // Snap Y to grid to ensure orthogonal connection
        };
      } else if (isHorizontal) {
        nearestPoint = {
          x: snapToGrid(projX, gridSize), // Snap X to grid to ensure orthogonal connection
          y: p1.y // Force exact Y of the horizontal wire
        };
      } else {
        // Diagonal - Use exact projected point
        nearestPoint = {
          x: projX,
          y: projY
        };
      }
    }
  }

  if (nearestPoint && minDistance < tolerance) {
    return {
      x: nearestPoint.x,
      y: nearestPoint.y,
      segmentIndex: nearestSegmentIndex,
      distance: minDistance
    };
  }

  return null;
}

/**
 * Calculate total length of a path
 */
export function calculatePathLength(points: Point[]): number {
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }
  return totalLength;
}

/**
 * Get a point at a specific distance along a path
 */
export function getPointAtDistanceAlongPath(
  points: Point[],
  targetDistance: number
): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  // Handle negative distance (extrapolate before start)
  if (targetDistance < 0) {
    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);
    const ratio = targetDistance / segmentLength;
    return {
      x: points[0].x + dx * ratio,
      y: points[0].y + dy * ratio
    };
  }

  let currentDist = 0;

  // Find the segment containing the target distance
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);

    if (currentDist + segmentLength >= targetDistance) {
      const ratio = (targetDistance - currentDist) / segmentLength;
      return {
        x: points[i].x + dx * ratio,
        y: points[i].y + dy * ratio
      };
    }
    currentDist += segmentLength;
  }

  // Handle distance beyond end (extrapolate after end)
  const lastIdx = points.length - 1;
  const dx = points[lastIdx].x - points[lastIdx - 1].x;
  const dy = points[lastIdx].y - points[lastIdx - 1].y;
  const segmentLength = Math.sqrt(dx * dx + dy * dy);
  const excessDist = targetDistance - currentDist;
  const ratio = excessDist / segmentLength;
  return {
    x: points[lastIdx].x + dx * ratio,
    y: points[lastIdx].y + dy * ratio
  };
}

/**
 * Get a point at a percentage along a path (0.0 to 1.0)
 */
export function getPointAtPercentage(points: Point[], percentage: number): Point {
  const totalLength = calculatePathLength(points);
  const targetDistance = totalLength * percentage;
  return getPointAtDistanceAlongPath(points, targetDistance);
}

/**
 * Calculate center points of bus wire endpoints
 */
export function calculateBusCenterPoints(
  busWires: Wire[],
  getEndpointFn: (wire: Wire, isFrom: boolean) => Point,
  gridSize: number = 10
): { centerFrom: Point; centerTo: Point } {
  const allFromPoints = busWires.map(w => getEndpointFn(w, true));
  const allToPoints = busWires.map(w => getEndpointFn(w, false));

  return {
    centerFrom: {
      x: snapToGrid(allFromPoints.reduce((sum, p) => sum + p.x, 0) / allFromPoints.length, gridSize),
      y: snapToGrid(allFromPoints.reduce((sum, p) => sum + p.y, 0) / allFromPoints.length, gridSize)
    },
    centerTo: {
      x: snapToGrid(allToPoints.reduce((sum, p) => sum + p.x, 0) / allToPoints.length, gridSize),
      y: snapToGrid(allToPoints.reduce((sum, p) => sum + p.y, 0) / allToPoints.length, gridSize)
    }
  };
}
