import { useCallback } from 'react';
import type { Wire } from '../../core/types';
import { wiresHaveMatchingEndpoints } from '../busUtils';

/**
 * Bus groups metadata type
 */
export interface BusGroup {
  name: string;
  rotation?: number;
}

export type BusGroups = Record<string, BusGroup>;

/**
 * Dependencies required by the useBusOperations hook
 */
export interface UseBusOperationsDeps {
  /** Current list of wires */
  wires: Wire[];
  /** Setter function for wires */
  setWires: React.Dispatch<React.SetStateAction<Wire[]>>;
  /** Current bus groups metadata */
  busGroups: BusGroups;
  /** Setter function for bus groups */
  setBusGroups: React.Dispatch<React.SetStateAction<BusGroups>>;
  /** Currently selected wire IDs for bus grouping */
  selectedWireIds: string[];
  /** Setter for selected wire IDs */
  setSelectedWireIds: React.Dispatch<React.SetStateAction<string[]>>;
  /** Function to save current state to history for undo/redo */
  saveToHistory: () => void;
  /** Setter for bus group mode UI state */
  setBusGroupMode: (enabled: boolean) => void;
  /** Setter to clear the "adding to bus" wire ID */
  setAddingToBusWireId: (wireId: string | null) => void;
}

/**
 * Return type for the useBusOperations hook
 */
export interface UseBusOperationsReturn {
  /**
   * Check if two wires connect between the same blocks (in either direction).
   * Useful for validating bus grouping.
   */
  wiresHaveMatchingEndpoints: (wire1: Wire, wire2: Wire) => boolean;

  /**
   * Add a wire to a bus with another wire.
   * If target wire is already in a bus, adds source to that bus.
   * Otherwise creates a new bus group with both wires.
   * @param sourceWireId - The wire being added to a bus
   * @param targetWireId - The wire to join (may already be in a bus)
   */
  addWireToBus: (sourceWireId: string, targetWireId: string) => void;

  /**
   * Create a new bus group from the currently selected wires.
   * Requires at least 2 wires to be selected.
   * Prompts the user for a bus name.
   */
  createBusGroup: () => void;

  /**
   * Remove a bus grouping, returning all wires to individual state.
   * @param busGroupId - The ID of the bus group to ungroup
   */
  ungroupBus: (busGroupId: string) => void;
}

/**
 * Custom hook for bus-related operations in the wire wizard.
 *
 * Provides functions to:
 * - Add wires to existing buses or create new buses
 * - Create bus groups from selected wires
 * - Ungroup buses back to individual wires
 *
 * @example
 * ```tsx
 * const {
 *   addWireToBus,
 *   createBusGroup,
 *   ungroupBus
 * } = useBusOperations({
 *   wires,
 *   setWires,
 *   busGroups,
 *   setBusGroups,
 *   selectedWireIds,
 *   setSelectedWireIds,
 *   saveToHistory,
 *   setBusGroupMode,
 *   setAddingToBusWireId
 * });
 *
 * // Create a bus from selected wires
 * createBusGroup();
 *
 * // Add a wire to another wire's bus
 * addWireToBus('wire-1', 'wire-2');
 *
 * // Remove bus grouping
 * ungroupBus('bus_123456');
 * ```
 */
export function useBusOperations(deps: UseBusOperationsDeps): UseBusOperationsReturn {
  const {
    wires,
    setWires,
    busGroups,
    setBusGroups,
    selectedWireIds,
    setSelectedWireIds,
    saveToHistory,
    setBusGroupMode,
    setAddingToBusWireId
  } = deps;

  /**
   * Add wire to bus with another wire
   */
  const addWireToBus = useCallback((sourceWireId: string, targetWireId: string) => {
    const sourceWire = wires.find(w => w.id === sourceWireId);
    const targetWire = wires.find(w => w.id === targetWireId);

    if (!sourceWire || !targetWire) {
      alert('Wire not found');
      return;
    }

    // Validate that wires connect between the same blocks/nodes
    if (!wiresHaveMatchingEndpoints(sourceWire, targetWire)) {
      alert('Cannot add to bus: Wires must connect between the same blocks/nodes');
      return;
    }

    // If target wire is already in a bus, add source to that bus
    if (targetWire.busGroupId) {
      const busName = busGroups[targetWire.busGroupId]?.name || 'Unnamed Bus';
      // Count existing wires in the bus to determine the next number
      const wiresInBus = wires.filter(w => w.busGroupId === targetWire.busGroupId);
      const nextWireNumber = wiresInBus.length + 1;

      setWires(wires.map(w => {
        if (w.id === sourceWireId) {
          // Keep existing name if available, otherwise generate new one
          // We check if label is generic "Wire" or empty
          const hasCustomLabel = w.label && w.label !== 'Wire' && !w.label.startsWith('Unnamed Bus-');
          const hasCustomNetName = w.netName && !w.netName.startsWith('Unnamed Bus-');
          const wireName = hasCustomLabel ? w.label : (hasCustomNetName ? w.netName : `${busName}-${nextWireNumber}`);

          // Clear bend points - bus uses center path
          return {
            ...w,
            busGroupId: targetWire.busGroupId,
            label: wireName || w.label,  // Use calculated name or keep existing
            netName: wireName || w.netName, // Use calculated name or keep existing
            bendPoints: [],  // Empty - bus uses center of all endpoints
            busConvergeStart: targetWire.busConvergeStart || 0.08,
            busConvergeEnd: targetWire.busConvergeEnd || 0.92
          };
        }
        return w;
      }));
    } else {
      // Create new bus group with both wires
      const busGroupId = `bus_${Date.now()}`;
      const busName = prompt('Enter bus name:', 'Bus') || 'Unnamed Bus';

      // Add the new bus group to the metadata
      setBusGroups({
        ...busGroups,
        [busGroupId]: { name: busName }
      });

      let wireIndex = 0;
      setWires(wires.map(w => {
        if (w.id === sourceWireId || w.id === targetWireId) {
          wireIndex++;

          // Keep existing name logic
          const hasCustomLabel = w.label && w.label !== 'Wire' && !w.label.startsWith('Unnamed Bus-');
          const hasCustomNetName = w.netName && !w.netName.startsWith('Unnamed Bus-');
          const wireName = hasCustomLabel ? w.label : (hasCustomNetName ? w.netName : `${busName}-${wireIndex}`);

          // Clear all bend points - bus uses center path
          return {
            ...w,
            busGroupId,
            label: wireName || w.label,
            netName: wireName || w.netName,
            bendPoints: [],  // Empty - bus uses center of all endpoints
            busConvergeStart: 0.08,  // 8% - short fan-out near blocks
            busConvergeEnd: 0.92       // 92% - bundle dominates middle section
          };
        }
        return w;
      }));
    }

    setAddingToBusWireId(null);
    saveToHistory();
  }, [wires, setWires, busGroups, setBusGroups, setAddingToBusWireId, saveToHistory]);

  /**
   * Create bus group from selected wires
   */
  const createBusGroup = useCallback(() => {
    if (selectedWireIds.length < 2) {
      alert('Please select at least 2 wires to create a bus');
      return;
    }

    const busName = prompt('Enter bus name:', 'CAN Bus') || 'Unnamed Bus';
    const busGroupId = `bus_${Date.now()}`;

    setBusGroups({
      ...busGroups,
      [busGroupId]: { name: busName }
    });

    // Track wire index for numbering
    let wireIndex = 0;

    setWires(wires.map(wire => {
      if (selectedWireIds.includes(wire.id)) {
        wireIndex++;
        const wireName = `${busName}-${wireIndex}`;
        // Clear all bend points and junctions - bus will use center path
        return {
          ...wire,
          busGroupId,
          label: wireName,  // Set initial label with bus name (for sidebar)
          netName: wireName,  // Set initial netName with bus name (for canvas rendering)
          bendPoints: [],  // Empty - bus uses center of all endpoints
          busConvergeStart: 0.08,  // 8% - short fan-out near blocks
          busConvergeEnd: 0.92       // 92% - bundle dominates middle section
        };
      }
      return wire;
    }));

    setSelectedWireIds([]);
    setBusGroupMode(false);
    saveToHistory();
  }, [selectedWireIds, wires, setWires, busGroups, setBusGroups, setSelectedWireIds, setBusGroupMode, saveToHistory]);

  /**
   * Ungroup wires from bus
   */
  const ungroupBus = useCallback((busGroupId: string) => {
    setWires(wires.map(wire => {
      if (wire.busGroupId === busGroupId) {
        const wireWithoutBus = { ...wire };
        delete wireWithoutBus.busGroupId;
        return wireWithoutBus;
      }
      return wire;
    }));

    // Remove bus group metadata
    const newBusGroups = { ...busGroups };
    delete newBusGroups[busGroupId];
    setBusGroups(newBusGroups);

    saveToHistory();
  }, [wires, setWires, busGroups, setBusGroups, saveToHistory]);

  return {
    wiresHaveMatchingEndpoints,
    addWireToBus,
    createBusGroup,
    ungroupBus
  };
}
