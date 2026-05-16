/**
 * Wire Operations Hook
 *
 * Handles wire finding, T-junction detection, and wire utility operations
 */

import { useCallback } from 'react';
import type { Wire, Block } from '../../core/types';
import { findNearestPointOnWire } from '../../canvas/pathUtils';

interface UseWireOperationsProps {
  wires: Wire[];
  blocks: Block[];
  getWireEndpointPosition: (wire: Wire, isFrom: boolean) => { x: number; y: number };
  GRID_SIZE: number;
}

interface WireNearClickResult {
  wire: Wire;
  point: {
    x: number;
    y: number;
    segmentIndex: number;
  };
}

export function useWireOperations({
  wires,
  blocks,
  getWireEndpointPosition,
  GRID_SIZE,
}: UseWireOperationsProps) {

  /**
   * Find a wire near the given click coordinates
   * Used for T-junction creation when clicking near existing wires
   */
  const findWireNearClick = useCallback((
    clickX: number,
    clickY: number
  ): WireNearClickResult | null => {
    let closestWire = null;
    let closestPoint = null;
    let minDistance = Infinity;

    for (const wire of wires) {
      // Skip bus wires and wires in bus groups - they have special rendering
      if (wire.busGroupId) continue;

      const result = findNearestPointOnWire(
        wire,
        clickX,
        clickY,
        getWireEndpointPosition,
        GRID_SIZE
      );

      if (result && result.distance < minDistance) {
        minDistance = result.distance;
        closestWire = wire;
        closestPoint = {
          x: result.x,
          y: result.y,
          segmentIndex: result.segmentIndex
        };
      }
    }

    if (closestWire && closestPoint) {
      return { wire: closestWire, point: closestPoint };
    }

    return null;
  }, [wires, getWireEndpointPosition, GRID_SIZE]);

  /**
   * Get the position for a wire endpoint
   * Handles block connections, junction coordinates, and loose ends
   */
  const getEndpointPosition = useCallback((
    wire: Wire,
    isFrom: boolean
  ): { x: number; y: number } => {
    return getWireEndpointPosition(wire, isFrom);
  }, [getWireEndpointPosition]);

  /**
   * Check if a wire is connected to a given block
   */
  const isWireConnectedToBlock = useCallback((
    wire: Wire,
    blockId: string
  ): boolean => {
    return wire.fromBlockId === blockId || wire.toBlockId === blockId;
  }, []);

  /**
   * Get all wires connected to a block
   */
  const getWiresForBlock = useCallback((blockId: string): Wire[] => {
    return wires.filter(w => isWireConnectedToBlock(w, blockId));
  }, [wires, isWireConnectedToBlock]);

  /**
   * Get all wires connected to a specific connection point
   */
  const getWiresForPoint = useCallback((
    blockId: string,
    pointId: string
  ): Wire[] => {
    return wires.filter(w =>
      (w.fromBlockId === blockId && w.fromPointId === pointId) ||
      (w.toBlockId === blockId && w.toPointId === pointId)
    );
  }, [wires]);

  return {
    findWireNearClick,
    getEndpointPosition,
    isWireConnectedToBlock,
    getWiresForBlock,
    getWiresForPoint,
  };
}
