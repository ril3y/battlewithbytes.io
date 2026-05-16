/**
 * useWireManipulation Hook
 *
 * Consolidates wire manipulation operations:
 * - removeWire: Wire removal with junction cleanup and wire merging
 * - addBendPointToWireAtPosition: Add bend point at clicked position
 */

import { useCallback } from 'react';
import type { Wire } from '../../core/types';
import { snapToGrid } from '../../core/utils';
import { findNearestPointOnWire } from '../../canvas/pathUtils';

interface BusGroups {
  [key: string]: {
    name: string;
    rotation?: number;
  };
}

interface UseWireManipulationProps {
  wires: Wire[];
  setWires: (wires: Wire[]) => void;
  busGroups: BusGroups;
  setBusGroups: (groups: BusGroups) => void;
  selectedWireId: string | null;
  setSelectedWireId: (id: string | null) => void;
  saveToHistory: () => void;
  getWireEndpointPosition: (wire: Wire, isFrom: boolean) => { x: number; y: number };
  GRID_SIZE: number;
}

interface UseWireManipulationReturn {
  removeWire: (wireId: string) => void;
  addBendPointToWireAtPosition: (wireId: string, x: number, y: number) => void;
}

export function useWireManipulation({
  wires,
  setWires,
  busGroups,
  setBusGroups,
  selectedWireId,
  setSelectedWireId,
  saveToHistory,
  getWireEndpointPosition,
  GRID_SIZE,
}: UseWireManipulationProps): UseWireManipulationReturn {

  /**
   * Remove wire with junction cleanup and wire merging
   */
  const removeWire = useCallback((wireId: string) => {
    const wireToRemove = wires.find(w => w.id === wireId);
    let updatedWires = wires.filter(w => w.id !== wireId);

    // Clean up orphaned junction points
    // If the wire was connected to a junction, check if any other wires use that junction
    if (wireToRemove) {
      const junctionsToCheck: Array<{ x: number, y: number }> = [];

      // Check if wire started at a junction
      if (wireToRemove.fromJunctionX !== undefined && wireToRemove.fromJunctionY !== undefined) {
        junctionsToCheck.push({ x: wireToRemove.fromJunctionX, y: wireToRemove.fromJunctionY });
      }

      // Check if wire ended at a junction
      if (wireToRemove.toJunctionX !== undefined && wireToRemove.toJunctionY !== undefined) {
        junctionsToCheck.push({ x: wireToRemove.toJunctionX, y: wireToRemove.toJunctionY });
      }

      // For each junction, check if any other wire uses it
      junctionsToCheck.forEach(junction => {
        const otherWiresUsingJunction = updatedWires.filter(w =>
          (w.fromJunctionX === junction.x && w.fromJunctionY === junction.y) ||
          (w.toJunctionX === junction.x && w.toJunctionY === junction.y)
        );

        // If only one wire uses this junction, that wire should be reconnected without the junction
        if (otherWiresUsingJunction.length === 1) {
          const orphanedWire = otherWiresUsingJunction[0];

          // Remove the junction connection from this wire
          updatedWires = updatedWires.map(w => {
            if (w.id === orphanedWire.id) {
              const updated = { ...w };

              // If the wire starts at this junction, remove the junction endpoint
              if (w.fromJunctionX === junction.x && w.fromJunctionY === junction.y) {
                delete updated.fromJunctionX;
                delete updated.fromJunctionY;
              }

              // If the wire ends at this junction, remove the junction endpoint
              if (w.toJunctionX === junction.x && w.toJunctionY === junction.y) {
                delete updated.toJunctionX;
                delete updated.toJunctionY;
              }

              return updated;
            }
            return w;
          });

          // If the wire now has no valid endpoints, remove it
          updatedWires = updatedWires.filter(w => {
            if (w.id === orphanedWire.id) {
              const hasValidFrom = w.fromBlockId || (w.fromJunctionX !== undefined && w.fromJunctionY !== undefined);
              const hasValidTo = w.toBlockId || (w.toJunctionX !== undefined && w.toJunctionY !== undefined);
              return hasValidFrom && hasValidTo;
            }
            return true;
          });
        }
        // If EXACTLY two wires remain at this junction, try to merge them
        else if (otherWiresUsingJunction.length === 2) {
          const w1 = otherWiresUsingJunction[0];
          const w2 = otherWiresUsingJunction[1];

          // Check if properties match (basic heuristic for "same wire")
          if (w1.color === w2.color && w1.wireGauge === w2.wireGauge && w1.netName === w2.netName) {
            let startWire: Wire | null = null;
            let endWire: Wire | null = null;

            // Check connectivity at the junction
            // Case 1: w1 ends at junction, w2 starts at junction (Ideal)
            if (w1.toJunctionX === junction.x && w1.toJunctionY === junction.y &&
              w2.fromJunctionX === junction.x && w2.fromJunctionY === junction.y) {
              startWire = w1;
              endWire = w2;
            }
            // Case 2: w2 ends at junction, w1 starts at junction (Swap)
            else if (w2.toJunctionX === junction.x && w2.toJunctionY === junction.y &&
              w1.fromJunctionX === junction.x && w1.fromJunctionY === junction.y) {
              startWire = w2;
              endWire = w1;
            }
            // Case 3 & 4: Both start or both end at junction - complex topology, skip

            if (startWire && endWire) {
              // Merge Logic:
              // New Wire = Start of startWire ... bendPoints of startWire ... bendPoints of endWire ... End of endWire
              const combinedBendPoints = [
                ...startWire.bendPoints,
                { x: junction.x, y: junction.y }, // The junction itself becomes a bend point
                ...endWire.bendPoints
              ];

              const mergedWire: Wire = {
                ...startWire,
                id: startWire.id, // Keep ID of start wire
                toBlockId: endWire.toBlockId, // Take destination from end wire
                toPointId: endWire.toPointId,
                toJunctionX: endWire.toJunctionX, // Take junction dest from end wire
                toJunctionY: endWire.toJunctionY,
                bendPoints: combinedBendPoints,
                label: startWire.label || endWire.label // Keep label if exists
              };

              // Remove endWire and replace startWire with mergedWire
              updatedWires = updatedWires.filter(w => w.id !== endWire!.id).map(w => {
                if (w.id === startWire!.id) {
                  return mergedWire;
                }
                return w;
              });
            }
          }
        }
      });
    }

    setWires(updatedWires);

    // Clean up empty bus groups
    if (wireToRemove?.busGroupId) {
      const remainingWiresInBus = updatedWires.filter(w => w.busGroupId === wireToRemove.busGroupId);

      // If this was the last wire in the bus, remove the bus group
      if (remainingWiresInBus.length === 0) {
        const { [wireToRemove.busGroupId]: removed, ...remainingBusGroups } = busGroups;
        setBusGroups(remainingBusGroups);
      }
    }

    if (selectedWireId === wireId) {
      setSelectedWireId(null);
    }
    saveToHistory();
  }, [wires, setWires, busGroups, setBusGroups, selectedWireId, setSelectedWireId, saveToHistory]);

  /**
   * Add bend point to wire at a specific position
   */
  const addBendPointToWireAtPosition = useCallback((wireId: string, x: number, y: number) => {
    const targetWire = wires.find(w => w.id === wireId);
    if (!targetWire) return;

    // Determine the bus group ID if any
    const busGroupId = targetWire.busGroupId;

    const newBendPoint = {
      x: snapToGrid(x, GRID_SIZE),
      y: snapToGrid(y, GRID_SIZE)
    };

    setWires(wires.map(wire => {
      // Logic for bus wires: find correct insertion index based on geometry
      if (busGroupId && wire.busGroupId === busGroupId) {
        const busWires = wires.filter(w => w.busGroupId === busGroupId);

        // Use the robust direction-aware logic from the renderer/drag handler
        const primaryWire = busWires[0];
        const pFrom = getWireEndpointPosition(primaryWire, true);
        const pTo = getWireEndpointPosition(primaryWire, false);

        const wireAnalysis = busWires.map(w => {
          const wFrom = getWireEndpointPosition(w, true);
          const wTo = getWireEndpointPosition(w, false);
          const distAligned = Math.hypot(wFrom.x - pFrom.x, wFrom.y - pFrom.y) + Math.hypot(wTo.x - pTo.x, wTo.y - pTo.y);
          const distCrossed = Math.hypot(wFrom.x - pTo.x, wFrom.y - pTo.y) + Math.hypot(wTo.x - pFrom.x, wTo.y - pFrom.y);
          const isReversed = distCrossed < distAligned;
          return { geoFrom: isReversed ? wTo : wFrom, geoTo: isReversed ? wFrom : wTo };
        });

        const allFromPoints = wireAnalysis.map(wa => wa.geoFrom);
        const allToPoints = wireAnalysis.map(wa => wa.geoTo);

        const centerFrom = {
          x: snapToGrid(allFromPoints.reduce((sum, p) => sum + p.x, 0) / allFromPoints.length, GRID_SIZE),
          y: snapToGrid(allFromPoints.reduce((sum, p) => sum + p.y, 0) / allFromPoints.length, GRID_SIZE)
        };
        const centerTo = {
          x: snapToGrid(allToPoints.reduce((sum, p) => sum + p.x, 0) / allToPoints.length, GRID_SIZE),
          y: snapToGrid(allToPoints.reduce((sum, p) => sum + p.y, 0) / allToPoints.length, GRID_SIZE)
        };

        // Construct a virtual wire object that follows the bus path
        const virtualWire: Wire = {
          ...wire,
          id: 'virtual_bus_path',
        };

        // Custom getter for our virtual wire
        const virtualGetEndpoint = (w: Wire, isFrom: boolean) => isFrom ? centerFrom : centerTo;

        // Find the nearest segment on this center path
        const result = findNearestPointOnWire(
          virtualWire,
          x,
          y,
          virtualGetEndpoint,
          GRID_SIZE,
          1000 // Large tolerance since we know the click was on the wire
        );

        let newBendPoints = [...wire.bendPoints];
        if (result && result.segmentIndex !== -1) {
          newBendPoints.splice(result.segmentIndex, 0, newBendPoint);
        } else {
          newBendPoints.push(newBendPoint);
        }

        return { ...wire, bendPoints: newBendPoints };
      }
      // Logic for regular wires
      else if (wire.id === wireId) {
        const result = findNearestPointOnWire(
          wire,
          x,
          y,
          getWireEndpointPosition,
          GRID_SIZE,
          1000
        );

        let newBendPoints = [...wire.bendPoints];
        if (result && result.segmentIndex !== -1) {
          newBendPoints.splice(result.segmentIndex, 0, newBendPoint);
        } else {
          newBendPoints.push(newBendPoint);
        }

        return { ...wire, bendPoints: newBendPoints };
      }
      return wire;
    }));
    saveToHistory();
  }, [wires, setWires, getWireEndpointPosition, GRID_SIZE, saveToHistory]);

  return {
    removeWire,
    addBendPointToWireAtPosition,
  };
}
