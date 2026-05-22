import type { ConnectionPoint, PinNumberingMode, PinoutLayout } from '../core/types';

export interface PinPosition {
  pinId: string;
  x: number;
  y: number;
}

export interface PinoutLayoutResult {
  positions: PinPosition[];
  width: number;
  height: number;
}

const PIN_SPACING = 40;
const PADDING = 30;

/**
 * Order pins for the pinout view: prefer Block.connectionPoints[i].pinNumber,
 * fall back to the array order.
 */
function orderPins(points: ConnectionPoint[]): ConnectionPoint[] {
  return [...points].sort((a, b) => {
    const an = a.pinNumber ?? Number.POSITIVE_INFINITY;
    const bn = b.pinNumber ?? Number.POSITIVE_INFINITY;
    if (an !== bn) return an - bn;
    return 0;
  });
}

/**
 * Lay out pins in a rectangular grid. The first `rows*cols` pins from the
 * ordered list are placed; any extras stack into additional rows.
 */
export function layoutRectangle(
  points: ConnectionPoint[],
  rows: number,
  cols: number
): PinoutLayoutResult {
  const ordered = orderPins(points);
  const effectiveCols = Math.max(1, cols);
  const effectiveRows = Math.max(1, Math.max(rows, Math.ceil(ordered.length / effectiveCols)));
  const width = PADDING * 2 + (effectiveCols - 1) * PIN_SPACING;
  const height = PADDING * 2 + (effectiveRows - 1) * PIN_SPACING;
  const positions: PinPosition[] = ordered.map((pin, i) => {
    const r = Math.floor(i / effectiveCols);
    const c = i % effectiveCols;
    return {
      pinId: pin.id,
      x: PADDING + c * PIN_SPACING,
      y: PADDING + r * PIN_SPACING,
    };
  });
  return { positions, width, height };
}

/**
 * Lay out pins evenly around a circle. Pin 1 starts at the top (12 o'clock)
 * and pins proceed clockwise.
 */
export function layoutCircle(
  points: ConnectionPoint[],
  ringRadius?: number
): PinoutLayoutResult {
  const ordered = orderPins(points);
  const count = ordered.length;
  const radius = ringRadius ?? Math.max(60, count * 8);
  const cx = radius + PADDING;
  const cy = radius + PADDING;
  const width = (radius + PADDING) * 2;
  const height = (radius + PADDING) * 2;
  const positions: PinPosition[] = ordered.map((pin, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(1, count);
    return {
      pinId: pin.id,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
  return { positions, width, height };
}

/**
 * Use the pins' existing block-local coordinates. Normalizes to a viewBox
 * with padding so the result looks reasonable in the modal.
 */
export function layoutAuto(points: ConnectionPoint[]): PinoutLayoutResult {
  if (points.length === 0) {
    return { positions: [], width: PADDING * 2, height: PADDING * 2 };
  }
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const positions: PinPosition[] = points.map((pin) => ({
    pinId: pin.id,
    x: pin.x - minX + PADDING,
    y: pin.y - minY + PADDING,
  }));
  return {
    positions,
    width: maxX - minX + PADDING * 2,
    height: maxY - minY + PADDING * 2,
  };
}

/**
 * Dispatch to the right layout based on a `Block.pinout` value.
 * Falls back to `layoutAuto` when no pinout is configured.
 */
export function layoutPinout(
  points: ConnectionPoint[],
  pinout?: PinoutLayout
): PinoutLayoutResult {
  if (!pinout || pinout.shape === 'auto') return layoutAuto(points);
  if (pinout.shape === 'rectangle') {
    const cols = pinout.cols ?? Math.ceil(Math.sqrt(points.length));
    const rows = pinout.rows ?? Math.ceil(points.length / cols);
    return layoutRectangle(points, rows, cols);
  }
  if (pinout.shape === 'circle') {
    return layoutCircle(points, pinout.ringRadius);
  }
  return layoutAuto(points);
}

/**
 * Compute a display pin number for each pin based on the numbering mode.
 *  - 'manual'     → use pin.pinNumber (or empty if not set)
 *  - 'sequential' → 1..N in pin-number / array order
 *  - 'row-col'    → R{row}C{col} derived from layout rows/cols
 *  - 'col-row'    → C{col}R{row}
 * Returns a Map<pinId, displayString>.
 */
export function applyNumberingMode(
  points: ConnectionPoint[],
  pinout?: PinoutLayout
): Map<string, string> {
  const mode: PinNumberingMode = pinout?.numberingMode ?? 'manual';
  const ordered = orderPins(points);
  const result = new Map<string, string>();
  if (mode === 'manual') {
    points.forEach((p) => {
      if (p.pinNumber !== undefined) result.set(p.id, String(p.pinNumber));
    });
    return result;
  }
  if (mode === 'sequential') {
    ordered.forEach((p, i) => result.set(p.id, String(i + 1)));
    return result;
  }
  // Grid-based modes need rows/cols. Fall back to sqrt heuristic if not set.
  const cols = pinout?.cols ?? Math.ceil(Math.sqrt(ordered.length));
  ordered.forEach((p, i) => {
    const r = Math.floor(i / cols) + 1;
    const c = (i % cols) + 1;
    result.set(p.id, mode === 'row-col' ? `R${r}C${c}` : `C${c}R${r}`);
  });
  return result;
}
