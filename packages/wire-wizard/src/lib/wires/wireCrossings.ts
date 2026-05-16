/**
 * Wire Crossing Detection Utilities
 *
 * Provides functions to detect line segment intersections and calculate
 * crossing points for visual wire crossing indicators (gaps/bridges).
 */

export interface Point {
  x: number;
  y: number;
}

export interface LineSegment {
  start: Point;
  end: Point;
}

export interface Crossing {
  point: Point;
  segmentIndex: number;  // Which segment on the current wire has the crossing
  distance: number;      // Distance along the segment to the crossing point (0-1)
}

/**
 * Checks if two line segments intersect and returns the intersection point
 * Uses parametric line equation: P = P1 + t*(P2-P1)
 *
 * @param seg1 First line segment
 * @param seg2 Second line segment
 * @returns Intersection point if segments intersect, null otherwise
 */
export function getLineIntersection(
  seg1: LineSegment,
  seg2: LineSegment,
  excludeEndpoints: boolean = false
): Point | null {
  const x1 = seg1.start.x;
  const y1 = seg1.start.y;
  const x2 = seg1.end.x;
  const y2 = seg1.end.y;
  const x3 = seg2.start.x;
  const y3 = seg2.start.y;
  const x4 = seg2.end.x;
  const y4 = seg2.end.y;

  // Calculate denominators
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  // Lines are parallel if denominator is 0
  if (Math.abs(denom) < 1e-10) {
    return null;
  }

  // Calculate intersection parameters
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  // Check if intersection is within both line segments
  const EPSILON = excludeEndpoints ? 1e-6 : 0;
  if (t >= EPSILON && t <= 1 - EPSILON && u >= EPSILON && u <= 1 - EPSILON) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    };
  }

  return null;
}

/**
 * Finds all crossing points on a wire path where it intersects with another wire path
 *
 * @param currentPath Array of points defining the current wire path
 * @param otherPath Array of points defining another wire path
 * @returns Array of crossing points with segment information
 */
export function findCrossingsOnPath(
  currentPath: Point[],
  otherPath: Point[]
): Crossing[] {
  const crossings: Crossing[] = [];

  // Check each segment of current path against each segment of other path
  for (let i = 0; i < currentPath.length - 1; i++) {
    const currentSeg: LineSegment = {
      start: currentPath[i],
      end: currentPath[i + 1]
    };

    for (let j = 0; j < otherPath.length - 1; j++) {
      const otherSeg: LineSegment = {
        start: otherPath[j],
        end: otherPath[j + 1]
      };

      const intersection = getLineIntersection(currentSeg, otherSeg, true);

      if (intersection) {
        // Calculate distance along the segment (0-1)
        const dx = currentSeg.end.x - currentSeg.start.x;
        const dy = currentSeg.end.y - currentSeg.start.y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);

        const toDx = intersection.x - currentSeg.start.x;
        const toDy = intersection.y - currentSeg.start.y;
        const distanceToIntersection = Math.sqrt(toDx * toDx + toDy * toDy);

        const t = segmentLength > 0 ? distanceToIntersection / segmentLength : 0;

        crossings.push({
          point: intersection,
          segmentIndex: i,
          distance: t
        });
      }
    }
  }

  return crossings;
}

/**
 * Builds an SVG path with gaps at crossing points
 * The "current" wire appears to go under "other" wires by breaking at crossings
 *
 * @param pathPoints Array of points defining the wire path
 * @param crossings Array of crossing points on this path
 * @param gapSize Size of the gap in pixels (total gap, split evenly on both sides)
 * @returns SVG path string with gaps at crossings
 */
export function buildPathWithGaps(
  pathPoints: Point[],
  crossings: Crossing[],
  gapSize: number = 8
): string {
  if (crossings.length === 0) {
    // No crossings - return simple path
    let path = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
    for (let i = 1; i < pathPoints.length; i++) {
      path += ` L ${pathPoints[i].x} ${pathPoints[i].y}`;
    }
    return path;
  }

  // Sort crossings by segment index and distance
  const sortedCrossings = [...crossings].sort((a, b) => {
    if (a.segmentIndex !== b.segmentIndex) {
      return a.segmentIndex - b.segmentIndex;
    }
    return a.distance - b.distance;
  });

  // Build path with gaps
  let path = '';
  let currentPoint = pathPoints[0];
  let isFirstMove = true;

  for (let segIdx = 0; segIdx < pathPoints.length - 1; segIdx++) {
    const segStart = pathPoints[segIdx];
    const segEnd = pathPoints[segIdx + 1];

    // Get all crossings on this segment
    const segmentCrossings = sortedCrossings.filter(c => c.segmentIndex === segIdx);

    if (segmentCrossings.length === 0) {
      // No crossings on this segment - draw normally
      if (isFirstMove) {
        path += `M ${segStart.x} ${segStart.y}`;
        isFirstMove = false;
      }
      path += ` L ${segEnd.x} ${segEnd.y}`;
      currentPoint = segEnd;
    } else {
      // Draw segment with gaps at crossings
      const dx = segEnd.x - segStart.x;
      const dy = segEnd.y - segStart.y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      const unitX = segmentLength > 0 ? dx / segmentLength : 0;
      const unitY = segmentLength > 0 ? dy / segmentLength : 0;

      let lastT = 0;

      for (const crossing of segmentCrossings) {
        const gapHalf = gapSize / 2;

        // Calculate gap start and end in parametric distance (0-1)
        const gapStartDist = Math.max(0, (crossing.distance * segmentLength - gapHalf) / segmentLength);
        const gapEndDist = Math.min(1, (crossing.distance * segmentLength + gapHalf) / segmentLength);

        // Draw from last position to gap start
        if (gapStartDist > lastT) {
          const gapStartPoint = {
            x: segStart.x + dx * gapStartDist,
            y: segStart.y + dy * gapStartDist
          };

          if (isFirstMove) {
            path += `M ${segStart.x + dx * lastT} ${segStart.y + dy * lastT}`;
            isFirstMove = false;
          }
          path += ` L ${gapStartPoint.x} ${gapStartPoint.y}`;
        }

        // Skip the gap (move to gap end)
        const gapEndPoint = {
          x: segStart.x + dx * gapEndDist,
          y: segStart.y + dy * gapEndDist
        };
        path += ` M ${gapEndPoint.x} ${gapEndPoint.y}`;

        lastT = gapEndDist;
      }

      // Draw remaining part of segment after last gap
      if (lastT < 1) {
        const endPoint = {
          x: segStart.x + dx,
          y: segStart.y + dy
        };
        path += ` L ${endPoint.x} ${endPoint.y}`;
      }

      currentPoint = segEnd;
    }
  }

  return path;
}

/**
 * Helper function to build a wire path from endpoints and bend points
 *
 * @param from Starting point
 * @param bendPoints Array of bend points
 * @param to Ending point
 * @returns Array of all points in order
 */
export function buildWirePath(
  from: Point,
  bendPoints: Point[],
  to: Point
): Point[] {
  return [from, ...bendPoints, to];
}
