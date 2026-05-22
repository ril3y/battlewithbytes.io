/**
 * Wire Gauge Utilities
 * Helpers for converting AWG wire gauges to visual stroke widths
 */

import type { Wire, WireGauge, WireSegmentGauge } from '../core/types';

/**
 * AWG to diameter mapping (in mm)
 * Based on standard AWG wire sizes
 */
export const AWG_DIAMETER_MAP: Record<WireGauge, number> = {
  '4/0 AWG': 11.68,
  '3/0 AWG': 10.40,
  '2/0 AWG': 9.27,
  '1/0 AWG': 8.25,
  '1 AWG': 7.35,
  '2 AWG': 6.54,
  '4 AWG': 5.19,
  '6 AWG': 4.11,
  '8 AWG': 3.26,
  '10 AWG': 2.59,
  '12 AWG': 2.05,
  '14 AWG': 1.63,
  '16 AWG': 1.29,
  '18 AWG': 1.02,
  '20 AWG': 0.81,
  '22 AWG': 0.64,
};

/**
 * Current capacity mapping (approximate, for reference in UI)
 * Based on typical automotive applications
 */
export const AWG_CURRENT_CAPACITY: Record<WireGauge, number> = {
  '4/0 AWG': 500,
  '3/0 AWG': 400,
  '2/0 AWG': 325,
  '1/0 AWG': 260,
  '1 AWG': 210,
  '2 AWG': 170,
  '4 AWG': 130,
  '6 AWG': 100,
  '8 AWG': 70,
  '10 AWG': 50,
  '12 AWG': 35,
  '14 AWG': 25,
  '16 AWG': 18,
  '18 AWG': 14,
  '20 AWG': 10,
  '22 AWG': 7,
};

/**
 * Convert AWG gauge to SVG stroke width (in pixels)
 * Uses logarithmic scaling to make visual differences more apparent
 *
 * @param gauge - AWG wire gauge
 * @param selected - Whether wire is selected (adds extra width)
 * @returns Stroke width in pixels
 */
export function gaugeToStrokeWidth(gauge: WireGauge, selected: boolean = false): number {
  const diameter = AWG_DIAMETER_MAP[gauge];

  // Map diameter to stroke width using logarithmic scale
  // This makes smaller wires still visible while showing clear differences
  // Range: 22 AWG (0.64mm) -> 2px, 4/0 AWG (11.68mm) -> 12px
  const baseWidth = 1.5 + (Math.log(diameter / 0.64) / Math.log(11.68 / 0.64)) * 10.5;

  // Add 1px if selected for highlight effect
  return selected ? baseWidth + 1 : baseWidth;
}

/**
 * Get the gauge for a specific segment of a wire
 *
 * @param wire - Wire object
 * @param segmentIndex - Segment index (0 = start to first bend, 1 = first bend to second bend, etc.)
 * @returns Wire gauge for that segment, or null if no gauge specified
 */
export function getSegmentGauge(wire: Wire, segmentIndex: number): WireGauge | null {
  // Check if there's a segment-specific override
  if (wire.segmentGauges) {
    const segmentGauge = wire.segmentGauges.find(sg => sg.segmentIndex === segmentIndex);
    if (segmentGauge) {
      return segmentGauge.gauge;
    }
  }

  if (wire.wireGauge) return wire.wireGauge;

  // For bus-port cables: fall back to the fattest gauge declared by any
  // conductor inside the cable.
  if (wire.conductors && wire.conductors.length > 0) {
    const gauges = wire.conductors
      .map((c) => c.gauge)
      .filter((g): g is WireGauge => !!g);
    if (gauges.length > 0) {
      // AWG order — smaller string = fatter wire (4/0 > 1/0 > 1 AWG > 22 AWG)
      const order: WireGauge[] = [
        '4/0 AWG', '3/0 AWG', '2/0 AWG', '1/0 AWG',
        '1 AWG', '2 AWG', '4 AWG', '6 AWG', '8 AWG',
        '10 AWG', '12 AWG', '14 AWG', '16 AWG', '18 AWG', '20 AWG', '22 AWG',
      ];
      const idx = (g: WireGauge) => order.indexOf(g);
      return gauges.reduce((fattest, g) => (idx(g) < idx(fattest) ? g : fattest));
    }
  }

  return null;
}

/**
 * Get all segment gauges for a wire as an array
 * Automatically fills in default gauge for segments without overrides
 *
 * @param wire - Wire object
 * @returns Array of gauges, one per segment
 */
export function getAllSegmentGauges(wire: Wire): (WireGauge | null)[] {
  // Wire has N+1 segments where N is number of bend points
  // Segment 0: start -> bendPoint[0] (or end if no bends)
  // Segment 1: bendPoint[0] -> bendPoint[1]
  // ...
  // Segment N: bendPoint[N-1] -> end
  const segmentCount = wire.bendPoints.length + 1;
  const gauges: (WireGauge | null)[] = [];

  for (let i = 0; i < segmentCount; i++) {
    gauges.push(getSegmentGauge(wire, i));
  }

  return gauges;
}

/**
 * Update or add a segment gauge override
 *
 * @param wire - Wire object
 * @param segmentIndex - Segment to update
 * @param gauge - New gauge value (or null to remove override)
 * @returns Updated wire object
 */
export function setSegmentGauge(
  wire: Wire,
  segmentIndex: number,
  gauge: WireGauge | null
): Wire {
  if (gauge === null) {
    // Remove segment override
    if (!wire.segmentGauges) return wire;

    return {
      ...wire,
      segmentGauges: wire.segmentGauges.filter(sg => sg.segmentIndex !== segmentIndex)
    };
  }

  // Add or update segment override
  const segmentGauges = wire.segmentGauges || [];
  const existingIndex = segmentGauges.findIndex(sg => sg.segmentIndex === segmentIndex);

  if (existingIndex >= 0) {
    // Update existing override
    const updated = [...segmentGauges];
    updated[existingIndex] = { segmentIndex, gauge };
    return { ...wire, segmentGauges: updated };
  } else {
    // Add new override
    return {
      ...wire,
      segmentGauges: [...segmentGauges, { segmentIndex, gauge }]
    };
  }
}

/**
 * Get a list of all available wire gauges
 */
export function getAvailableGauges(): WireGauge[] {
  return [
    '4/0 AWG', '3/0 AWG', '2/0 AWG', '1/0 AWG',
    '1 AWG', '2 AWG', '4 AWG', '6 AWG', '8 AWG',
    '10 AWG', '12 AWG', '14 AWG', '16 AWG', '18 AWG', '20 AWG', '22 AWG'
  ];
}

/**
 * Get wire segments with their start/end points
 * Useful for rendering
 *
 * @param wire - Wire object
 * @param getWireEndpointPosition - Function to get actual endpoint positions
 * @returns Array of segments with positions and gauges
 */
export function getWireSegments(
  wire: Wire,
  getWireEndpointPosition: (wire: Wire, isFrom: boolean) => { x: number; y: number }
): Array<{
  index: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  gauge: WireGauge | null;
  strokeWidth: number;
}> {
  const from = getWireEndpointPosition(wire, true);
  const to = getWireEndpointPosition(wire, false);
  const points = [from, ...wire.bendPoints, to];
  const segments: Array<{
    index: number;
    from: { x: number; y: number };
    to: { x: number; y: number };
    gauge: WireGauge | null;
    strokeWidth: number;
  }> = [];

  for (let i = 0; i < points.length - 1; i++) {
    const gauge = getSegmentGauge(wire, i);
    const strokeWidth = gauge ? gaugeToStrokeWidth(gauge, false) : 2; // Default to 2px if no gauge

    segments.push({
      index: i,
      from: points[i],
      to: points[i + 1],
      gauge,
      strokeWidth
    });
  }

  return segments;
}
