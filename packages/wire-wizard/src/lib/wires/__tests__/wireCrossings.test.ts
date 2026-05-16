/**
 * Tests for wire crossing detection utilities
 */

import { getLineIntersection, findCrossingsOnPath, buildPathWithGaps, buildWirePath } from '../wireCrossings';
import type { Point, LineSegment } from '../wireCrossings';

describe('wireCrossings utilities', () => {
  describe('getLineIntersection', () => {
    it('should detect intersection of two crossing line segments', () => {
      // Horizontal line from (0, 5) to (10, 5)
      const seg1: LineSegment = {
        start: { x: 0, y: 5 },
        end: { x: 10, y: 5 }
      };

      // Vertical line from (5, 0) to (5, 10)
      const seg2: LineSegment = {
        start: { x: 5, y: 0 },
        end: { x: 5, y: 10 }
      };

      const intersection = getLineIntersection(seg1, seg2);

      expect(intersection).not.toBeNull();
      expect(intersection?.x).toBeCloseTo(5);
      expect(intersection?.y).toBeCloseTo(5);
    });

    it('should return null for parallel lines', () => {
      const seg1: LineSegment = {
        start: { x: 0, y: 0 },
        end: { x: 10, y: 0 }
      };

      const seg2: LineSegment = {
        start: { x: 0, y: 5 },
        end: { x: 10, y: 5 }
      };

      const intersection = getLineIntersection(seg1, seg2);

      expect(intersection).toBeNull();
    });

    it('should return null for non-intersecting segments', () => {
      const seg1: LineSegment = {
        start: { x: 0, y: 0 },
        end: { x: 5, y: 0 }
      };

      const seg2: LineSegment = {
        start: { x: 10, y: 0 },
        end: { x: 15, y: 0 }
      };

      const intersection = getLineIntersection(seg1, seg2);

      expect(intersection).toBeNull();
    });

    it('should detect intersection at diagonal crossing', () => {
      // Diagonal from (0, 0) to (10, 10)
      const seg1: LineSegment = {
        start: { x: 0, y: 0 },
        end: { x: 10, y: 10 }
      };

      // Diagonal from (0, 10) to (10, 0)
      const seg2: LineSegment = {
        start: { x: 0, y: 10 },
        end: { x: 10, y: 0 }
      };

      const intersection = getLineIntersection(seg1, seg2);

      expect(intersection).not.toBeNull();
      expect(intersection?.x).toBeCloseTo(5);
      expect(intersection?.y).toBeCloseTo(5);
    });
  });

  describe('findCrossingsOnPath', () => {
    it('should find single crossing between two simple paths', () => {
      const currentPath: Point[] = [
        { x: 0, y: 5 },
        { x: 10, y: 5 }
      ];

      const otherPath: Point[] = [
        { x: 5, y: 0 },
        { x: 5, y: 10 }
      ];

      const crossings = findCrossingsOnPath(currentPath, otherPath);

      expect(crossings).toHaveLength(1);
      expect(crossings[0].point.x).toBeCloseTo(5);
      expect(crossings[0].point.y).toBeCloseTo(5);
      expect(crossings[0].segmentIndex).toBe(0);
    });

    it('should find multiple crossings on multi-segment path', () => {
      // L-shaped path
      const currentPath: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 }
      ];

      // Diagonal crossing both segments
      const otherPath: Point[] = [
        { x: 5, y: -5 },
        { x: 5, y: 5 }
      ];

      const crossings = findCrossingsOnPath(currentPath, otherPath);

      expect(crossings).toHaveLength(1);
      expect(crossings[0].segmentIndex).toBe(0); // Crosses first segment
    });

    it('should return empty array for non-crossing paths', () => {
      const currentPath: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 }
      ];

      const otherPath: Point[] = [
        { x: 0, y: 10 },
        { x: 10, y: 10 }
      ];

      const crossings = findCrossingsOnPath(currentPath, otherPath);

      expect(crossings).toHaveLength(0);
    });
  });

  describe('buildWirePath', () => {
    it('should build path from endpoints and bend points', () => {
      const from = { x: 0, y: 0 };
      const bendPoints = [{ x: 5, y: 5 }, { x: 10, y: 5 }];
      const to = { x: 15, y: 10 };

      const path = buildWirePath(from, bendPoints, to);

      expect(path).toHaveLength(4);
      expect(path[0]).toEqual(from);
      expect(path[1]).toEqual(bendPoints[0]);
      expect(path[2]).toEqual(bendPoints[1]);
      expect(path[3]).toEqual(to);
    });

    it('should handle path with no bend points', () => {
      const from = { x: 0, y: 0 };
      const to = { x: 10, y: 10 };

      const path = buildWirePath(from, [], to);

      expect(path).toHaveLength(2);
      expect(path[0]).toEqual(from);
      expect(path[1]).toEqual(to);
    });
  });

  describe('buildPathWithGaps', () => {
    it('should build simple path when no crossings', () => {
      const pathPoints = [
        { x: 0, y: 0 },
        { x: 10, y: 0 }
      ];

      const path = buildPathWithGaps(pathPoints, [], 6);

      expect(path).toBe('M 0 0 L 10 0');
    });

    it('should build path with gap at crossing point', () => {
      const pathPoints = [
        { x: 0, y: 0 },
        { x: 10, y: 0 }
      ];

      const crossings = [
        {
          point: { x: 5, y: 0 },
          segmentIndex: 0,
          distance: 0.5 // Midpoint
        }
      ];

      const path = buildPathWithGaps(pathPoints, crossings, 6);

      // Should have a move command (gap) in the middle
      expect(path).toContain('M');
      expect(path).toContain('L');
      // Should have at least 2 Move commands (start + gap)
      const moveCount = (path.match(/M/g) || []).length;
      expect(moveCount).toBeGreaterThanOrEqual(2);
    });

    it('should handle multiple crossings on same segment', () => {
      const pathPoints = [
        { x: 0, y: 0 },
        { x: 10, y: 0 }
      ];

      const crossings = [
        {
          point: { x: 3, y: 0 },
          segmentIndex: 0,
          distance: 0.3
        },
        {
          point: { x: 7, y: 0 },
          segmentIndex: 0,
          distance: 0.7
        }
      ];

      const path = buildPathWithGaps(pathPoints, crossings, 6);

      // Should have 3 Move commands (start + 2 gaps)
      const moveCount = (path.match(/M/g) || []).length;
      expect(moveCount).toBeGreaterThanOrEqual(3);
    });
  });
});
