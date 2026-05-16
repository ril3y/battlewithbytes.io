/**
 * Utility functions for wire operations
 */

import { Wire, Block } from '../core/types';

/**
 * Type definition for the getGlobalPosition callback
 */
type GlobalPositionGetter = (blockId: string, pointId: string) => { x: number; y: number };

/**
 * Update wire color and both connection point colors
 * Returns updated wires and blocks arrays
 */
export function updateWireAndConnectionColors(
  wireId: string,
  newColor: string,
  wires: Wire[],
  blocks: Block[]
): { updatedWires: Wire[]; updatedBlocks: Block[] } {
  // Find the wire to get connection point references
  const wire = wires.find(w => w.id === wireId);
  if (!wire) {
    return { updatedWires: wires, updatedBlocks: blocks };
  }

  // Update wire color
  const updatedWires = wires.map(w =>
    w.id === wireId ? { ...w, color: newColor } : w
  );

  // Update connection point colors at both ends
  const updatedBlocks = blocks.map(b => {
    // Update 'from' connection point
    if (b.id === wire.fromBlockId) {
      return {
        ...b,
        connectionPoints: b.connectionPoints.map(cp =>
          cp.id === wire.fromPointId ? { ...cp, color: newColor } : cp
        )
      };
    }
    // Update 'to' connection point
    if (b.id === wire.toBlockId) {
      return {
        ...b,
        connectionPoints: b.connectionPoints.map(cp =>
          cp.id === wire.toPointId ? { ...cp, color: newColor } : cp
        )
      };
    }
    return b;
  });

  return { updatedWires, updatedBlocks };
}

/**
 * Find all wires that are electrically connected to the seed wire — i.e.
 * wires sharing a junction point or a block-connection point with it,
 * transitively. Used when a net/color change should propagate through the
 * whole electrically-connected set rather than just the clicked wire.
 *
 * Returns the set of wire IDs (including the seed).
 */
export function findElectricallyConnectedWires(seedWireId: string, wires: Wire[]): Set<string> {
  const seed = wires.find((w) => w.id === seedWireId);
  if (!seed) return new Set();

  const result = new Set<string>([seedWireId]);
  const queue: Wire[] = [seed];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.pop()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    for (const w of wires) {
      if (visited.has(w.id)) continue;

      const sharesJunction =
        (current.fromJunctionX !== undefined && current.fromJunctionY !== undefined &&
          ((w.fromJunctionX === current.fromJunctionX && w.fromJunctionY === current.fromJunctionY) ||
           (w.toJunctionX === current.fromJunctionX && w.toJunctionY === current.fromJunctionY))) ||
        (current.toJunctionX !== undefined && current.toJunctionY !== undefined &&
          ((w.fromJunctionX === current.toJunctionX && w.fromJunctionY === current.toJunctionY) ||
           (w.toJunctionX === current.toJunctionX && w.toJunctionY === current.toJunctionY)));

      const sharesBlockPoint =
        (current.fromBlockId && current.fromPointId &&
          ((w.fromBlockId === current.fromBlockId && w.fromPointId === current.fromPointId) ||
           (w.toBlockId === current.fromBlockId && w.toPointId === current.fromPointId))) ||
        (current.toBlockId && current.toPointId &&
          ((w.fromBlockId === current.toBlockId && w.fromPointId === current.toPointId) ||
           (w.toBlockId === current.toBlockId && w.toPointId === current.toPointId)));

      if (sharesJunction || sharesBlockPoint) {
        result.add(w.id);
        queue.push(w);
      }
    }
  }

  return result;
}

/**
 * Build the list of unique nets present in the diagram, with a representative
 * color (the first wire that names the net). Used by the wire context menu's
 * "Net" dropdown.
 */
export function getNetsFromWires(wires: Wire[]): Array<{ name: string; color: string }> {
  const seen = new Map<string, string>();
  for (const w of wires) {
    if (w.netName && !seen.has(w.netName)) {
      seen.set(w.netName, w.color);
    }
  }
  return Array.from(seen.entries()).map(([name, color]) => ({ name, color }));
}

/**
 * Get position for wire endpoint (handles block connections, loose ends, and junction coordinates)
 */
export function getWireEndpointPosition(
  wire: Wire,
  isFrom: boolean,
  getGlobalPosition: GlobalPositionGetter
): { x: number; y: number } {
  if (isFrom) {
    // Check for junction coordinates
    if (wire.fromJunctionX !== undefined && wire.fromJunctionY !== undefined) {
      return { x: wire.fromJunctionX, y: wire.fromJunctionY };
    }
    // Check for block connection point
    if (wire.fromBlockId && wire.fromPointId) {
      return getGlobalPosition(wire.fromBlockId, wire.fromPointId);
    }
    // Check for loose coordinates (detached wire)
    if (wire.fromLooseX !== undefined && wire.fromLooseY !== undefined) {
      return { x: wire.fromLooseX, y: wire.fromLooseY };
    }
  } else {
    // Check for junction coordinates
    if (wire.toJunctionX !== undefined && wire.toJunctionY !== undefined) {
      return { x: wire.toJunctionX, y: wire.toJunctionY };
    }
    // Check for block connection point
    if (wire.toBlockId && wire.toPointId) {
      return getGlobalPosition(wire.toBlockId, wire.toPointId);
    }
    // Check for loose coordinates (detached wire)
    if (wire.toLooseX !== undefined && wire.toLooseY !== undefined) {
      return { x: wire.toLooseX, y: wire.toLooseY };
    }
  }
  return { x: 0, y: 0 };
}
