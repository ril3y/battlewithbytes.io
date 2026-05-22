import type { Conductor, ConnectionPoint, Wire } from '../core/types';

/**
 * Net propagation helpers.
 *
 * The diagram has two layers of "electrical connection":
 *   1. Top-level wires share a `netName` → all wires + their endpoint pins
 *      are in the same electrical net.
 *   2. Inside a bus-port wire, individual `Conductor`s with a `netName` also
 *      define electrical nets, but scoped to the conductor's two pins.
 *
 * When the user changes a netName or color on one wire / conductor, this
 * helper finds every wire / conductor that shares the net and returns a set
 * of writes the caller applies via setWires.
 */

export interface NetPropagationUpdates {
  netName?: string;
  color?: string;
}

/** Find all wires that share a netName (case-sensitive). Empty / undefined names do not propagate. */
export function findWiresInNet(wires: Wire[], netName: string | undefined): Wire[] {
  if (!netName) return [];
  return wires.filter((w) => w.netName === netName);
}

/** Find all conductors across all wires that share a netName. */
export function findConductorsInNet(
  wires: Wire[],
  netName: string | undefined
): { wire: Wire; conductor: Conductor }[] {
  if (!netName) return [];
  const out: { wire: Wire; conductor: Conductor }[] = [];
  for (const w of wires) {
    for (const c of w.conductors ?? []) {
      if (c.netName === netName) out.push({ wire: w, conductor: c });
    }
  }
  return out;
}

/**
 * Apply a net-level update across all wires + conductors sharing the seed's
 * netName. Returns a new `wires` array.
 *
 * Behavior:
 *   - If `seed.netName` is set, finds peer wires/conductors and applies
 *     `updates.color` (and forces them to share `updates.netName ?? seed.netName`).
 *   - If the seed has no net, no propagation happens — the change stays local.
 */
export function propagateAcrossNet(
  wires: Wire[],
  seed: { wireId: string; conductorId?: string },
  updates: NetPropagationUpdates
): Wire[] {
  const seedWire = wires.find((w) => w.id === seed.wireId);
  if (!seedWire) return wires;
  const seedConductor = seed.conductorId
    ? (seedWire.conductors ?? []).find((c) => c.id === seed.conductorId)
    : null;
  const sourceNet = seedConductor ? seedConductor.netName : seedWire.netName;
  const targetNet = updates.netName ?? sourceNet;
  if (!sourceNet && !updates.netName) {
    // Nothing to propagate against.
    return applyLocal(wires, seed, updates);
  }
  return wires.map((w) => {
    let updatedConductors = w.conductors;
    if (updatedConductors) {
      updatedConductors = updatedConductors.map((c) => {
        const matchesSeed = w.id === seed.wireId && c.id === seed.conductorId;
        const matchesNet = !!sourceNet && c.netName === sourceNet;
        if (!matchesSeed && !matchesNet) return c;
        return {
          ...c,
          ...(updates.netName !== undefined ? { netName: targetNet } : {}),
          ...(updates.color !== undefined ? { color: updates.color } : {}),
        };
      });
    }
    const wireIsSeed = w.id === seed.wireId && !seed.conductorId;
    const wireIsInNet = !seed.conductorId && !!sourceNet && w.netName === sourceNet;
    if (wireIsSeed || wireIsInNet) {
      return {
        ...w,
        ...(updates.netName !== undefined ? { netName: targetNet } : {}),
        ...(updates.color !== undefined ? { color: updates.color } : {}),
        conductors: updatedConductors,
      };
    }
    return updatedConductors === w.conductors ? w : { ...w, conductors: updatedConductors };
  });
}

/** Apply the update only to the seed itself — no net cascade. */
function applyLocal(wires: Wire[], seed: { wireId: string; conductorId?: string }, updates: NetPropagationUpdates): Wire[] {
  return wires.map((w) => {
    if (w.id !== seed.wireId) return w;
    if (seed.conductorId) {
      const nextConductors = (w.conductors ?? []).map((c) =>
        c.id === seed.conductorId ? { ...c, ...updates } : c
      );
      return { ...w, conductors: nextConductors };
    }
    return { ...w, ...updates };
  });
}

export type { Conductor, ConnectionPoint, Wire };
