import { useState, useCallback, useMemo } from 'react';

/**
 * A point where a wire changes direction.
 * Matches the BendPoint interface from core/types.
 */
export interface BendPoint {
  x: number;
  y: number;
}

/**
 * Minimal wire structure returned by completeWire.
 * Contains only the fields needed for wire creation.
 * The consumer should cast or merge this with the full Wire type.
 */
export interface WireCreationResult {
  id: string;
  fromBlockId?: string;
  fromPointId?: string;
  toBlockId: string;
  toPointId: string;
  color: string;
  bendPoints: BendPoint[];
}

/**
 * Snap a value to the grid.
 * Duplicate of the utility from core/utils to avoid import issues.
 */
function snapToGrid(value: number, gridSize: number = 10): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Represents the starting point of a wire being created.
 * Can start from a block connection point or from an existing wire junction.
 */
export interface WireStart {
  blockId?: string;
  pointId?: string;
  wireId?: string;      // For starting from junction
  bendIndex?: number;   // For starting from bend point
}

/**
 * Internal state for wire creation.
 */
export interface WireCreationState {
  isActive: boolean;
  start: WireStart | null;
  bendPoints: BendPoint[];
  mousePos: { x: number; y: number } | null;
}

/**
 * Return type for the useWireCreation hook.
 */
export interface UseWireCreationReturn {
  /** Current wire creation state */
  state: WireCreationState;

  /**
   * Start creating a new wire from a given starting point.
   * @param start - The starting point (block/point or junction)
   */
  startWire: (start: WireStart) => void;

  /**
   * Add a bend point to the wire being created.
   * @param point - The bend point coordinates (will be snapped to grid)
   */
  addBendPoint: (point: BendPoint) => void;

  /**
   * Update the current mouse position for the wire preview.
   * @param pos - The current mouse position or null to clear
   */
  updateMousePos: (pos: { x: number; y: number } | null) => void;

  /**
   * Complete the wire creation by connecting to an endpoint.
   * Returns the completed wire data or null if creation was invalid.
   * @param end - The endpoint to connect to (blockId and pointId)
   * @param wireColor - The color for the new wire
   */
  completeWire: (
    end: { blockId: string; pointId: string },
    wireColor: string
  ) => WireCreationResult | null;

  /**
   * Cancel wire creation and reset state.
   */
  cancelWire: () => void;

  /** Convenience getter for whether a wire is being created */
  isCreating: boolean;
}

/**
 * Custom hook for managing wire creation state machine.
 *
 * This hook encapsulates the KiCad-style wire creation flow:
 * 1. Start wire from a connection point (shift+click) or junction
 * 2. Add bend points by clicking on the canvas
 * 3. Complete wire by clicking on a destination connection point
 * 4. Cancel with ESC
 *
 * @param gridSize - The grid size for snapping (default: 10)
 * @returns Wire creation state and control functions
 *
 * @example
 * ```tsx
 * const { state, startWire, addBendPoint, completeWire, cancelWire, isCreating } = useWireCreation(5);
 *
 * // Start wire creation on shift+click
 * const handlePointClick = (blockId, pointId, e) => {
 *   if (e.shiftKey && !isCreating) {
 *     startWire({ blockId, pointId });
 *   } else if (isCreating) {
 *     const newWire = completeWire({ blockId, pointId }, '#FFFFFF');
 *     if (newWire) {
 *       setWires([...wires, newWire]);
 *     }
 *   }
 * };
 *
 * // Add bend points on canvas click
 * const handleCanvasClick = (e) => {
 *   if (isCreating && state.mousePos) {
 *     addBendPoint({ x: state.mousePos.x, y: state.mousePos.y });
 *   }
 * };
 *
 * // Cancel on ESC
 * useEffect(() => {
 *   const handleKeyDown = (e) => {
 *     if (e.key === 'Escape') cancelWire();
 *   };
 *   window.addEventListener('keydown', handleKeyDown);
 *   return () => window.removeEventListener('keydown', handleKeyDown);
 * }, [cancelWire]);
 * ```
 */
export function useWireCreation(gridSize: number = 10): UseWireCreationReturn {
  const [wireStart, setWireStart] = useState<WireStart | null>(null);
  const [bendPoints, setBendPoints] = useState<BendPoint[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  /**
   * Start creating a new wire.
   */
  const startWire = useCallback((start: WireStart) => {
    setWireStart(start);
    setBendPoints([]);
    setMousePos(null);
  }, []);

  /**
   * Add a bend point to the wire.
   * The point is snapped to the grid.
   */
  const addBendPoint = useCallback((point: BendPoint) => {
    const snappedPoint: BendPoint = {
      x: snapToGrid(point.x, gridSize),
      y: snapToGrid(point.y, gridSize),
    };
    setBendPoints((prev) => [...prev, snappedPoint]);
  }, [gridSize]);

  /**
   * Update the mouse position for wire preview.
   */
  const updateMousePos = useCallback((pos: { x: number; y: number } | null) => {
    setMousePos(pos);
  }, []);

  /**
   * Complete the wire creation.
   * Returns the new wire object or null if invalid.
   */
  const completeWire = useCallback((
    end: { blockId: string; pointId: string },
    wireColor: string
  ): WireCreationResult | null => {
    if (!wireStart) {
      return null;
    }

    // Don't create a wire to the same point
    if (wireStart.blockId === end.blockId && wireStart.pointId === end.pointId) {
      return null;
    }

    const newWire: WireCreationResult = {
      id: `wire_${Date.now()}`,
      fromBlockId: wireStart.blockId,
      fromPointId: wireStart.pointId,
      toBlockId: end.blockId,
      toPointId: end.pointId,
      color: wireColor,
      bendPoints: [...bendPoints],
    };

    // Reset state after completion
    setWireStart(null);
    setBendPoints([]);
    setMousePos(null);

    return newWire;
  }, [wireStart, bendPoints]);

  /**
   * Cancel wire creation and reset all state.
   */
  const cancelWire = useCallback(() => {
    setWireStart(null);
    setBendPoints([]);
    setMousePos(null);
  }, []);

  /**
   * Compute the current state object.
   */
  const state = useMemo((): WireCreationState => ({
    isActive: wireStart !== null,
    start: wireStart,
    bendPoints,
    mousePos,
  }), [wireStart, bendPoints, mousePos]);

  /**
   * Convenience getter for whether a wire is being created.
   */
  const isCreating = wireStart !== null;

  return {
    state,
    startWire,
    addBendPoint,
    updateMousePos,
    completeWire,
    cancelWire,
    isCreating,
  };
}
