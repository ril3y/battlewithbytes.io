/**
 * Bus Wire Utilities
 * Centralized calculations for bus wire groups and their center paths
 */

import type { Wire } from '../core/types';
import { snapToGrid } from '../core/utils';

/**
 * A point with x and y coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Analysis of a single wire's geometric orientation within a bus group.
 * Used to determine if the wire's from/to endpoints need to be reversed
 * to align with the primary wire's direction.
 */
export interface WireAnalysis {
  /** The wire being analyzed */
  wire: Wire;
  /** The geometric "from" point after direction normalization */
  geoFrom: Point;
  /** The geometric "to" point after direction normalization */
  geoTo: Point;
  /** Whether the wire's endpoints are reversed relative to the primary wire */
  isReversed: boolean;
}

/**
 * The calculated center path for a bus group.
 * Represents the virtual "bundle" path that all individual wires converge to.
 */
export interface BusCenterPath {
  /** The center point where all wires converge at the start */
  centerFrom: Point;
  /** The center point where all wires converge at the end */
  centerTo: Point;
  /** Analysis of each wire's orientation within the bus */
  wireAnalysis: WireAnalysis[];
}

/**
 * Function type for getting wire endpoint positions.
 * Abstracts away the logic of looking up block connection points or junction coordinates.
 */
export type GetEndpointFn = (wire: Wire, isFrom: boolean) => Point;

/**
 * Calculate the center path for a bus group.
 *
 * This function analyzes all wires in a bus group and determines:
 * 1. Which direction each wire is oriented relative to the primary wire
 * 2. The center convergence points where individual wires merge into the bundle
 *
 * The algorithm uses direction-aware logic to properly align wires that may
 * connect between the same blocks in opposite directions. It measures the
 * distance when endpoints are aligned vs crossed, and chooses the orientation
 * that minimizes total distance.
 *
 * @param busWires - Array of wires belonging to the same bus group
 * @param getEndpoint - Function to get the x,y position of a wire endpoint
 * @param gridSize - Grid size for snapping center points (default: 10)
 * @returns The calculated bus center path with convergence points and wire analysis
 *
 * @example
 * ```typescript
 * const busWires = wires.filter(w => w.busGroupId === 'bus-1');
 * const centerPath = calculateBusCenterPath(busWires, getWireEndpointPosition, 10);
 * console.log(centerPath.centerFrom); // { x: 100, y: 150 }
 * ```
 */
export function calculateBusCenterPath(
  busWires: Wire[],
  getEndpoint: GetEndpointFn,
  gridSize: number = 10
): BusCenterPath {
  if (busWires.length === 0) {
    return {
      centerFrom: { x: 0, y: 0 },
      centerTo: { x: 0, y: 0 },
      wireAnalysis: []
    };
  }

  // Use the first wire as the reference for direction
  const primaryWire = busWires[0];
  const pFrom = getEndpoint(primaryWire, true);
  const pTo = getEndpoint(primaryWire, false);

  // Analyze each wire to determine its orientation relative to the primary wire
  const wireAnalysis: WireAnalysis[] = busWires.map(wire => {
    const wFrom = getEndpoint(wire, true);
    const wTo = getEndpoint(wire, false);

    // Calculate distances to determine orientation
    // "Aligned" means wire's from->to matches primary's from->to
    const distAligned = Math.hypot(wFrom.x - pFrom.x, wFrom.y - pFrom.y) +
      Math.hypot(wTo.x - pTo.x, wTo.y - pTo.y);

    // "Crossed" means wire's from->to is opposite to primary's from->to
    const distCrossed = Math.hypot(wFrom.x - pTo.x, wFrom.y - pTo.y) +
      Math.hypot(wTo.x - pFrom.x, wTo.y - pFrom.y);

    // If crossed distance is smaller, the wire is oriented opposite to primary
    const isReversed = distCrossed < distAligned;

    return {
      wire,
      geoFrom: isReversed ? wTo : wFrom,
      geoTo: isReversed ? wFrom : wTo,
      isReversed
    };
  });

  // Collect all normalized "from" and "to" points
  const allFromPoints = wireAnalysis.map(wa => wa.geoFrom);
  const allToPoints = wireAnalysis.map(wa => wa.geoTo);

  // Calculate center points and snap to grid for clean parallel lines
  const centerFrom: Point = {
    x: snapToGrid(
      allFromPoints.reduce((sum, p) => sum + p.x, 0) / allFromPoints.length,
      gridSize
    ),
    y: snapToGrid(
      allFromPoints.reduce((sum, p) => sum + p.y, 0) / allFromPoints.length,
      gridSize
    )
  };

  const centerTo: Point = {
    x: snapToGrid(
      allToPoints.reduce((sum, p) => sum + p.x, 0) / allToPoints.length,
      gridSize
    ),
    y: snapToGrid(
      allToPoints.reduce((sum, p) => sum + p.y, 0) / allToPoints.length,
      gridSize
    )
  };

  return {
    centerFrom,
    centerTo,
    wireAnalysis
  };
}

/**
 * Get all wires belonging to a specific bus group.
 *
 * @param groupId - The bus group ID to filter by
 * @param wires - Array of all wires to search through
 * @returns Array of wires that belong to the specified bus group
 *
 * @example
 * ```typescript
 * const busWires = getBusWiresByGroupId('bus-power', allWires);
 * console.log(busWires.length); // 3 wires in the power bus
 * ```
 */
export function getBusWiresByGroupId(groupId: string, wires: Wire[]): Wire[] {
  return wires.filter(wire => wire.busGroupId === groupId);
}

/**
 * Check if two wires connect between the same blocks (in either direction).
 *
 * This is useful for determining if wires could potentially be grouped
 * into a bus, as bus wires typically connect the same pair of blocks.
 *
 * @param wire1 - First wire to compare
 * @param wire2 - Second wire to compare
 * @returns True if both wires connect between the same blocks (ignoring direction)
 *
 * @example
 * ```typescript
 * const canGroup = wiresHaveMatchingEndpoints(wire1, wire2);
 * if (canGroup) {
 *   // These wires could be grouped into a bus
 * }
 * ```
 */
export function wiresHaveMatchingEndpoints(wire1: Wire, wire2: Wire): boolean {
  // Get the block IDs for wire1
  const wire1From = wire1.fromBlockId;
  const wire1To = wire1.toBlockId;

  // Get the block IDs for wire2
  const wire2From = wire2.fromBlockId;
  const wire2To = wire2.toBlockId;

  // Check if wires connect same blocks (either direction)
  const sameDirection = wire1From === wire2From && wire1To === wire2To;
  const oppositeDirection = wire1From === wire2To && wire1To === wire2From;

  return sameDirection || oppositeDirection;
}

/**
 * Calculate the total path length for a bus bundle.
 *
 * @param centerFrom - Starting center point
 * @param centerTo - Ending center point
 * @param bendPoints - Array of bend points along the path
 * @returns Total length of the path
 */
export function calculateBusPathLength(
  centerFrom: Point,
  centerTo: Point,
  bendPoints: Point[]
): number {
  const pathPoints = [centerFrom, ...bendPoints, centerTo];

  let totalLength = 0;
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const dx = pathPoints[i + 1].x - pathPoints[i].x;
    const dy = pathPoints[i + 1].y - pathPoints[i].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  // Protect against zero-length bundles
  return totalLength < 0.1 ? 1 : totalLength;
}

/**
 * Project a point onto a path and return the percentage along the path.
 * Useful for dragging convergence points along the bus path.
 *
 * @param point - The point to project (e.g., mouse position)
 * @param centerFrom - Starting center point of the path
 * @param centerTo - Ending center point of the path
 * @param totalLength - Total length of the path
 * @param minPercent - Minimum allowed percentage (default: -2 for flexibility)
 * @param maxPercent - Maximum allowed percentage (default: 3 for flexibility)
 * @returns The percentage along the path where the point projects
 */
export function projectPointOntoPath(
  point: Point,
  centerFrom: Point,
  centerTo: Point,
  totalLength: number,
  minPercent: number = -2,
  maxPercent: number = 3
): number {
  // Path vector from start to end
  const pathVector = {
    x: centerTo.x - centerFrom.x,
    y: centerTo.y - centerFrom.y
  };
  const pathLength = Math.sqrt(pathVector.x ** 2 + pathVector.y ** 2);

  // Avoid division by zero
  if (pathLength < 0.1) {
    return 0;
  }

  // Normalized path direction
  const pathDir = {
    x: pathVector.x / pathLength,
    y: pathVector.y / pathLength
  };

  // Vector from path start to the point
  const pointVector = {
    x: point.x - centerFrom.x,
    y: point.y - centerFrom.y
  };

  // Project point onto path direction (dot product)
  const projectionDistance = pointVector.x * pathDir.x + pointVector.y * pathDir.y;

  // Convert to percentage
  let percent = projectionDistance / totalLength;

  // Clamp to allowed range
  return Math.max(minPercent, Math.min(maxPercent, percent));
}
