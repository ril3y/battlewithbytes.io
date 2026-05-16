/**
 * Wire Wizard Utilities
 * Helper functions for coordinate transforms and grid snapping
 */

import { Block } from './types';

/**
 * Snap a value to the grid
 */
export function snapToGrid(value: number, gridSize: number = 10): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snap a point to the grid, but prefer aligning to a start point's axis if close enough.
 * This helps drawing straight lines even if the start point is off-grid.
 */
export function smartSnapToGrid(
  x: number,
  y: number,
  startX: number,
  startY: number,
  gridSize: number = 10,
  threshold: number = 10
): { x: number; y: number } {
  let snappedX = snapToGrid(x, gridSize);
  let snappedY = snapToGrid(y, gridSize);

  // Check axis alignment with start point
  // If we are close to the vertical axis of the start point
  if (Math.abs(x - startX) <= threshold) {
    snappedX = startX;
  }

  // If we are close to the horizontal axis of the start point
  if (Math.abs(y - startY) <= threshold) {
    snappedY = startY;
  }

  return { x: snappedX, y: snappedY };
}

/**
 * Convert screen coordinates to SVG coordinates accounting for zoom and pan
 */
export function screenToSVG(
  svgElement: SVGSVGElement,
  screenX: number,
  screenY: number,
  zoom: number,
  pan: { x: number; y: number }
): { x: number; y: number } {
  const pt = svgElement.createSVGPoint();
  pt.x = screenX;
  pt.y = screenY;
  const transformed = pt.matrixTransform(svgElement.getScreenCTM()?.inverse());

  // Apply inverse of our zoom and pan transform
  const x = (transformed.x - pan.x) / zoom;
  const y = (transformed.y - pan.y) / zoom;

  return { x, y };
}

/**
 * Get global position of a connection point
 */
export function getGlobalPos(
  blocks: Block[],
  blockId: string,
  pointId: string
): { x: number; y: number } {
  const block = blocks.find(b => b.id === blockId);
  const point = block?.connectionPoints.find(p => p.id === pointId);
  if (!block || !point) return { x: 0, y: 0 };

  const rotation = block.rotation || 0;
  if (rotation === 0) {
    return { x: block.x + point.x, y: block.y + point.y };
  }

  // Calculate center of block
  const cx = block.width / 2;
  const cy = block.height / 2;

  // Calculate point position relative to center (unrotated)
  const dx = point.x - cx;
  const dy = point.y - cy;

  // Rotate point
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const rx = dx * cos - dy * sin;
  const ry = dx * sin + dy * cos;

  // Add center offset and block position
  return {
    x: block.x + cx + rx,
    y: block.y + cy + ry
  };
}
