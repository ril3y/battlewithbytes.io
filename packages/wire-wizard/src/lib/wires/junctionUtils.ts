/**
 * Utilities for creating T-junctions on wires
 */

import { Wire, Block, BendPoint } from '../core/types';

export interface TJunctionResult {
  wireA: Wire;
  wireB: Wire;
  wireC: Wire;
}

export interface WireStart {
  blockId?: string;
  pointId?: string;
  wireId?: string;
  bendIndex?: number;
}

/**
 * Create a T-junction by splitting a wire at a point and connecting a new wire
 * Returns three wires: wireA (from start to junction), wireB (from junction to end), wireC (new wire to junction)
 */
export function createTJunction(
  targetWire: Wire,
  wireStart: WireStart,
  junctionX: number,
  junctionY: number,
  blocks: Block[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- positional slot kept: callers pass the grid size here, but snapping is already done by the caller (see below), so this function ignores it
  gridSize: number = 10,
  segmentIndex: number = 0,
  newWireBendPoints: BendPoint[] = [],
  wires?: Wire[] // Optional list of all wires to resolve start coordinates
): TJunctionResult {
  const junctionNetName = targetWire.netName || `NET_${Date.now()}`;

  // Use provided coordinates directly (caller handles smart snapping)
  const snappedX = junctionX;
  const snappedY = junctionY;

  // Determine wire color
  // Rule: If connection to a named net (targetWire has netName), new segment takes net color.
  // Otherwise, if connecting from a point with color, use that color.
  let wireColor = targetWire.color;

  if (wireStart.blockId && wireStart.pointId) {
    const fromBlock = blocks.find(b => b.id === wireStart.blockId);
    const fromPoint = fromBlock?.connectionPoints.find(p => p.id === wireStart.pointId);

    if (targetWire.netName && targetWire.netName.trim().length > 0) {
      wireColor = targetWire.color;
    } else {
      wireColor = fromPoint?.color || targetWire.color;
    }
  } else if (wireStart.wireId && wireStart.bendIndex !== undefined && wires) {
    const sourceWire = wires.find(w => w.id === wireStart.wireId);
    if (sourceWire) {
      const pt = sourceWire.bendPoints[wireStart.bendIndex];
      if (pt && targetWire.netName && targetWire.netName.trim().length > 0) {
        wireColor = targetWire.color;
      } else if (sourceWire) {
        wireColor = sourceWire.color;
      }
    }
  }

  // Split bend points
  const bendPointsSegment1 = targetWire.bendPoints.slice(0, segmentIndex);
  const bendPointsSegment2 = targetWire.bendPoints.slice(segmentIndex);

  // Create wire A: from original start to junction
  const wireA: Wire = {
    id: `wire_${Date.now()}_A`,
    fromBlockId: targetWire.fromBlockId,
    fromPointId: targetWire.fromPointId,
    fromJunctionX: targetWire.fromJunctionX,
    fromJunctionY: targetWire.fromJunctionY,
    toJunctionX: snappedX,
    toJunctionY: snappedY,
    color: targetWire.color,
    bendPoints: bendPointsSegment1,
    netName: junctionNetName,
    label: targetWire.label,
    wireGauge: targetWire.wireGauge // Preserve gauge
  };

  // Create wire B: from junction to original end
  const wireB: Wire = {
    id: `wire_${Date.now()}_B`,
    fromJunctionX: snappedX,
    fromJunctionY: snappedY,
    toBlockId: targetWire.toBlockId,
    toPointId: targetWire.toPointId,
    toJunctionX: targetWire.toJunctionX,
    toJunctionY: targetWire.toJunctionY,
    color: targetWire.color,
    bendPoints: bendPointsSegment2,
    netName: junctionNetName,
    label: targetWire.label,
    wireGauge: targetWire.wireGauge // Preserve gauge
  };

  // Determine start point for Wire C
  let wireCFromJunctionX: number | undefined;
  let wireCFromJunctionY: number | undefined;

  if (wireStart.wireId && wireStart.bendIndex !== undefined && wires) {
    const sourceWire = wires.find(w => w.id === wireStart.wireId);
    if (sourceWire) {
      const pt = sourceWire.bendPoints[wireStart.bendIndex];
      if (pt) {
        wireCFromJunctionX = pt.x;
        wireCFromJunctionY = pt.y;
      }
    }
  }

  // Create wire C: new wire connecting to junction
  const wireC: Wire = {
    id: `wire_${Date.now()}_C`,
    fromBlockId: wireStart.blockId,
    fromPointId: wireStart.pointId,
    fromJunctionX: wireCFromJunctionX,
    fromJunctionY: wireCFromJunctionY,
    toJunctionX: snappedX,
    toJunctionY: snappedY,
    color: wireColor,
    bendPoints: newWireBendPoints,
    netName: junctionNetName
  };

  return { wireA, wireB, wireC };
}
