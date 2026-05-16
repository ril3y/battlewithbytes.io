/**
 * usePointInteraction Hook
 *
 * Consolidates all connection point and bend point interaction handlers:
 * - handlePointClick: Point click handler (wire completion + selection)
 * - handlePointMouseDown: Point drag start handler
 * - handleBendPointMouseDown: Bend point drag/wire branch handler
 */

import { useCallback } from 'react';
import type { Block, Wire, ConnectionPoint, BendPoint } from '../../core/types';
import { getComponent } from '../../component-library';

interface WireStart {
  blockId?: string;
  pointId?: string;
  wireId?: string;
  bendIndex?: number;
}

interface UsePointInteractionProps {
  // Diagram data
  blocks: Block[];
  wires: Wire[];
  setWires: (wires: Wire[]) => void;
  saveToHistory: () => void;

  // Selection
  selectPoint: (blockId: string, pointId: string) => void;
  setSelectedWireId: (id: string | null) => void;
  setEditingPoint: (point: ConnectionPoint | null) => void;

  // Wire creation state
  wireStart: WireStart | null;
  wireBendPoints: BendPoint[];
  setWireStart: (start: WireStart | null) => void;
  setWireBendPoints: (points: BendPoint[] | ((prev: BendPoint[]) => BendPoint[])) => void;
  setMousePos: (pos: { x: number; y: number } | null) => void;

  // Drag state
  isDraggingType: (type: string) => boolean;
  startDragging: (state: { type: string; blockId?: string; pointId?: string; wireId?: string; bendIndex?: number; offsetX?: number; offsetY?: number }) => void;

  // Position helper
  screenToSVGCoords: (screenX: number, screenY: number) => { x: number; y: number };
}

interface UsePointInteractionReturn {
  handlePointClick: (blockId: string, pointId: string, e: React.MouseEvent) => void;
  handlePointMouseDown: (blockId: string, pointId: string, e: React.MouseEvent) => void;
  handleBendPointMouseDown: (wireId: string, bendIndex: number, e: React.MouseEvent) => void;
}

export function usePointInteraction({
  blocks,
  wires,
  setWires,
  saveToHistory,
  selectPoint,
  setSelectedWireId,
  setEditingPoint,
  wireStart,
  wireBendPoints,
  setWireStart,
  setWireBendPoints,
  setMousePos,
  isDraggingType,
  startDragging,
  screenToSVGCoords,
}: UsePointInteractionProps): UsePointInteractionReturn {

  /**
   * Handle connection point click
   * - If wire creation in progress: complete the wire
   * - If Shift+Click: start wire creation
   * - Otherwise: select the point for editing
   */
  const handlePointClick = useCallback((blockId: string, pointId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Don't start wire if we just dragged a point
    if (isDraggingType('point')) {
      return;
    }

    // If we're in wire creation mode
    if (wireStart) {
      // Complete the wire
      if (wireStart.blockId !== blockId || wireStart.pointId !== pointId) {
        const fromBlock = blocks.find(b => b.id === wireStart.blockId);
        const fromPoint = fromBlock?.connectionPoints.find(p => p.id === wireStart.pointId);

        let fromJunctionX: number | undefined;
        let fromJunctionY: number | undefined;
        let startColor = fromPoint?.color || '#FFFFFF';
        let netName: string | undefined;
        let wiresToUpdate: Wire[] | undefined;

        if (wireStart.wireId !== undefined && wireStart.bendIndex !== undefined) {
          const sourceWire = wires.find(w => w.id === wireStart.wireId);
          if (sourceWire) {
            const bendPoint = sourceWire.bendPoints[wireStart.bendIndex];
            if (bendPoint) {
              fromJunctionX = bendPoint.x;
              fromJunctionY = bendPoint.y;
              startColor = sourceWire.color;
              netName = sourceWire.netName;

              // Split the source wire into two segments (A and B) meeting at this point
              // Wire A: Start -> BendPoint
              const wireA: Wire = {
                ...sourceWire,
                id: `wire_${Date.now()}_A`,
                toBlockId: undefined,
                toPointId: undefined,
                toJunctionX: bendPoint.x,
                toJunctionY: bendPoint.y,
                bendPoints: sourceWire.bendPoints.slice(0, wireStart.bendIndex)
              };

              // Wire B: BendPoint -> End
              const wireB: Wire = {
                ...sourceWire,
                id: `wire_${Date.now()}_B`,
                fromBlockId: undefined,
                fromPointId: undefined,
                fromJunctionX: bendPoint.x,
                fromJunctionY: bendPoint.y,
                bendPoints: sourceWire.bendPoints.slice(wireStart.bendIndex + 1)
              };

              wiresToUpdate = wires.filter(w => w.id !== sourceWire.id).concat([wireA, wireB]);
            }
          }
        }

        // Use wiresToUpdate if we modified the list (split), otherwise use current wires
        const baseWires = wiresToUpdate || wires;

        const newWire: Wire = {
          id: `wire_${Date.now()}`,
          fromBlockId: wireStart.blockId,
          fromPointId: wireStart.pointId,
          fromJunctionX,
          fromJunctionY,
          toBlockId: blockId,
          toPointId: pointId,
          color: startColor,
          bendPoints: wireBendPoints,
          netName // Initial net name candidate
        };

        const toBlock = blocks.find(b => b.id === blockId);

        // Helper to find existing net at a connection
        const getNetAtConnection = (b: Block | undefined, pId: string | undefined) => {
          if (!b || !pId) return null;
          // Check if block is a common bus
          const comp = b.componentType ? getComponent(b.componentType) : null;
          const isBus = comp?.metadata?.isCommonBus;

          // If bus, check matching blockId. If not, check matching blockId AND pointId
          const matchingWires = baseWires.filter(w => {
            const connectsToBlock = w.fromBlockId === b.id || w.toBlockId === b.id;
            if (!connectsToBlock) return false;
            if (isBus) return true; // Any connection to bus counts

            // For regular blocks, must match specific point
            if (w.fromBlockId === b.id && w.fromPointId === pId) return true;
            if (w.toBlockId === b.id && w.toPointId === pId) return true;
            return false;
          });

          const foundWithNet = matchingWires.find(w => w.netName);
          return foundWithNet ? { netName: foundWithNet.netName, color: foundWithNet.color } : null;
        };

        const netFrom = getNetAtConnection(fromBlock, wireStart.pointId);
        const netTo = getNetAtConnection(toBlock, pointId);

        const inheritedNet = netFrom || netTo;

        if (inheritedNet) {
          newWire.netName = inheritedNet.netName;
          newWire.color = inheritedNet.color;
        }

        setWires([...baseWires, newWire]);
        saveToHistory();
      }
      // Reset wire creation state
      setWireStart(null);
      setWireBendPoints([]);
      setMousePos(null);
      return;
    }

    // Shift+Click: Start wire creation
    // Regular Click: Select the connection point for editing
    if (e.shiftKey) {
      setWireStart({ blockId, pointId });
      setWireBendPoints([]);
    } else {
      // Select the connection point (and its parent block)
      selectPoint(blockId, pointId);

      // Set editingPoint so sidebar shows edit UI
      const block = blocks.find(b => b.id === blockId);
      const point = block?.connectionPoints.find(p => p.id === pointId);
      if (point) {
        setEditingPoint({ ...point });
      }
    }
    setMousePos(null);
  }, [
    blocks,
    wires,
    setWires,
    saveToHistory,
    wireStart,
    wireBendPoints,
    setWireStart,
    setWireBendPoints,
    setMousePos,
    isDraggingType,
    selectPoint,
    setEditingPoint,
  ]);

  /**
   * Handle connection point mousedown (for dragging)
   */
  const handlePointMouseDown = useCallback((blockId: string, pointId: string, e: React.MouseEvent) => {
    // Don't allow dragging if we're creating a wire
    if (wireStart) return;

    // Right click - old quick wire creation (fallback)
    if (e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    e.stopPropagation();

    // Select the connection point (and its parent block)
    selectPoint(blockId, pointId);

    // Set editingPoint so sidebar shows edit UI
    const blockForEdit = blocks.find(b => b.id === blockId);
    const pointForEdit = blockForEdit?.connectionPoints.find(p => p.id === pointId);
    if (pointForEdit) {
      setEditingPoint({ ...pointForEdit });
    }

    // Drag logic follows...
    const block = blocks.find(b => b.id === blockId);
    const point = block?.connectionPoints.find(p => p.id === pointId);

    // Only allow connection point repositioning with Alt key
    // Otherwise, let the event propagate to block drag handler
    if (e.altKey && block && point) {
      e.stopPropagation();
      const svgP = screenToSVGCoords(e.clientX, e.clientY);

      // Calculate offset in the transformed coordinate space
      const offsetX = svgP.x - (block.x + point.x);
      const offsetY = svgP.y - (block.y + point.y);
      startDragging({ type: 'point', blockId, pointId, offsetX, offsetY });
    }
  }, [
    wireStart,
    blocks,
    selectPoint,
    setEditingPoint,
    screenToSVGCoords,
    startDragging,
  ]);

  /**
   * Handle bend point mousedown
   * - Shift+Click: Start a new wire from this junction point
   * - Regular click: Start dragging the bend point
   */
  const handleBendPointMouseDown = useCallback((wireId: string, bendIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();

    // If Shift is pressed and it's a bend point (not an endpoint handle), start a new wire
    if (e.shiftKey && bendIndex >= 0) {
      setWireStart({ wireId, bendIndex });
      return;
    }

    startDragging({ type: 'bendPoint', wireId, bendIndex });
    setSelectedWireId(wireId);
  }, [setWireStart, startDragging, setSelectedWireId]);

  return {
    handlePointClick,
    handlePointMouseDown,
    handleBendPointMouseDown,
  };
}
