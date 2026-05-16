/**
 * useCanvasEvents Hook
 *
 * Consolidates all canvas-level event handlers:
 * - handleCanvasClick: Main click handler for canvas background
 * - handleMouseUp: Mouse up handler with wire snapping
 * - handlePanStart: Middle mouse button pan start
 */

import { useCallback, RefObject } from 'react';
import type { Block, Wire, ConnectionPoint, BendPoint, BlockShape } from '../../core/types';
import { snapToGrid } from '../../core/utils';
import { getRandomConnectionPointColor } from '../../core/constants';
import { createTJunction } from '../../wires/junctionUtils';
import { useInteraction } from '../../core/contexts/InteractionContext';

interface WireStart {
  blockId?: string;
  pointId?: string;
  wireId?: string;
  bendIndex?: number;
}

interface UseCanvasEventsProps {
  svgRef: RefObject<SVGSVGElement>;

  // Canvas transform
  isPanning: boolean;
  startPanning: (x: number, y: number) => void;
  stopPanning: () => void;
  screenToSVGCoords: (screenX: number, screenY: number) => { x: number; y: number };

  // Diagram data
  blocks: Block[];
  wires: Wire[];
  setBlocks: (blocks: Block[]) => void;
  setWires: (wires: Wire[]) => void;
  saveToHistory: () => void;

  // Selection
  setSelectedBlockId: (id: string | null) => void;
  setSelectedBlockLabelId: (id: string | null) => void;
  setSelectedPointId: (id: string | null) => void;
  setSelectedWireId: (id: string | null) => void;

  // Interaction state
  closeContextMenu: () => void;
  setEditingPoint: (point: ConnectionPoint | null) => void;
  setSidebarOpen: (open: boolean) => void;

  // Block creation
  addBlockMode: boolean;
  newBlockShape: BlockShape;
  setAddBlockMode: (enabled: boolean) => void;

  // Wire creation
  wireStart: WireStart | null;
  mousePos: { x: number; y: number } | null;
  wireBendPoints: BendPoint[];
  setWireStart: (start: WireStart | null) => void;
  setWireBendPoints: (points: BendPoint[] | ((prev: BendPoint[]) => BendPoint[])) => void;
  setMousePos: (pos: { x: number; y: number } | null) => void;

  // Wire operations
  findWireNearClick: (x: number, y: number) => { wire: Wire; point: { x: number; y: number; segmentIndex: number } } | null;

  // Drag state
  dragState: { type: string; blockId?: string };
  isDraggingAny: () => boolean;
  stopDragging: () => void;

  // Position helper
  getGlobalPosition: (blockId: string, pointId: string) => { x: number; y: number };

  GRID_SIZE: number;
}

interface UseCanvasEventsReturn {
  handleCanvasClick: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handlePanStart: (e: React.MouseEvent) => void;
}

export function useCanvasEvents({
  svgRef,
  isPanning,
  startPanning,
  stopPanning,
  screenToSVGCoords,
  blocks,
  wires,
  setBlocks,
  setWires,
  saveToHistory,
  setSelectedBlockId,
  setSelectedBlockLabelId,
  setSelectedPointId,
  setSelectedWireId,
  closeContextMenu,
  setEditingPoint,
  setSidebarOpen,
  addBlockMode,
  newBlockShape,
  setAddBlockMode,
  wireStart,
  mousePos,
  wireBendPoints,
  setWireStart,
  setWireBendPoints,
  setMousePos,
  findWireNearClick,
  dragState,
  isDraggingAny,
  stopDragging,
  getGlobalPosition,
  GRID_SIZE,
}: UseCanvasEventsProps): UseCanvasEventsReturn {

  const { placementMode, targetBlockId } = useInteraction();

  /**
   * Handle middle mouse button pan start
   */
  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      e.preventDefault();
      startPanning(e.clientX, e.clientY);
    }
  }, [startPanning]);

  /**
   * Handle canvas click - main click handler for canvas background
   * Handles:
   * - Connection point placement mode
   * - Block creation mode
   * - Wire T-junction creation
   * - Adding bend points to wires
   * - Clearing selection
   */
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!svgRef.current) return;

    // If we were panning, don't clear selection
    if (isPanning) return;

    // If we clicked a specific SVG element (like a block/wire/point) and it bubbled up, ignore it
    if (e.target !== svgRef.current) return;

    const svgP = screenToSVGCoords(e.clientX, e.clientY);

    // Close context menu
    closeContextMenu();

    // If in connection point placement mode
    if (placementMode && targetBlockId) {
      const targetBlock = blocks.find(b => b.id === targetBlockId);

      if (targetBlock) {
        // Check if click is within block bounds
        const isInBlock = (
          svgP.x >= targetBlock.x &&
          svgP.x <= targetBlock.x + targetBlock.width &&
          svgP.y >= targetBlock.y &&
          svgP.y <= targetBlock.y + targetBlock.height
        );

        if (isInBlock) {
          // Convert to block-relative coordinates
          const relativeX = svgP.x - targetBlock.x;
          const relativeY = svgP.y - targetBlock.y;

          // Add new connection point at clicked position
          const newPoint: ConnectionPoint = {
            id: `cp_${Date.now()}`,
            x: snapToGrid(relativeX, GRID_SIZE),
            y: snapToGrid(relativeY, GRID_SIZE),
            label: 'New',
            color: getRandomConnectionPointColor(),
            voltage: 12
          };

          setBlocks(blocks.map(b =>
            b.id === targetBlockId
              ? { ...b, connectionPoints: [...b.connectionPoints, newPoint] }
              : b
          ));
          saveToHistory();
          return;
        }
      }
    }

    // If adding a block
    if (addBlockMode) {
      const newBlock: Block = {
        id: `block_${Date.now()}`,
        x: snapToGrid(svgP.x - 50, GRID_SIZE),
        y: snapToGrid(svgP.y - 40, GRID_SIZE),
        width: newBlockShape === 'circle' ? 80 : 100,
        height: newBlockShape === 'circle' ? 80 : 80,
        label: 'New Block',
        color: '#2a4d69',
        shape: newBlockShape,
        connectionPoints: []
      };

      setBlocks([...blocks, newBlock]);
      setSelectedBlockId(newBlock.id);
      setAddBlockMode(false);
      saveToHistory();
      return;
    }

    // If creating a wire, check if clicking near an existing wire for T-junction
    if (wireStart && mousePos) {
      const wireNearClick = findWireNearClick(svgP.x, svgP.y);

      if (wireNearClick) {
        // Create T-junction using utility function
        const { wire: targetWire, point: junctionPoint } = wireNearClick;
        const { wireA, wireB, wireC } = createTJunction(
          targetWire,
          wireStart,
          junctionPoint.x,
          junctionPoint.y,
          blocks,
          GRID_SIZE,
          junctionPoint.segmentIndex,
          wireBendPoints
        );

        // Prepare list of new wires
        const newWires = [wireA, wireB, wireC];
        const wiresToRemove = [targetWire.id];

        // If we started from another wire (bridge), split the source wire too
        if (wireStart.wireId && wireStart.bendIndex !== undefined) {
          const sourceWire = wires.find(w => w.id === wireStart.wireId);
          // Ensure we don't try to split the same wire twice (loopback)
          if (sourceWire && sourceWire.id !== targetWire.id) {
            const bendPoint = sourceWire.bendPoints[wireStart.bendIndex];
            if (bendPoint) {
              const sourceA: Wire = {
                ...sourceWire,
                id: `wire_${Date.now()}_SourceA`,
                toBlockId: undefined,
                toPointId: undefined,
                toJunctionX: bendPoint.x,
                toJunctionY: bendPoint.y,
                bendPoints: sourceWire.bendPoints.slice(0, wireStart.bendIndex)
              };
              const sourceB: Wire = {
                ...sourceWire,
                id: `wire_${Date.now()}_SourceB`,
                fromBlockId: undefined,
                fromPointId: undefined,
                fromJunctionX: bendPoint.x,
                fromJunctionY: bendPoint.y,
                bendPoints: sourceWire.bendPoints.slice(wireStart.bendIndex + 1)
              };
              newWires.push(sourceA, sourceB);
              wiresToRemove.push(sourceWire.id);
            }
          }
        }

        // Remove original wire(s) and add new wires
        setWires(wires.filter(w => !wiresToRemove.includes(w.id)).concat(newWires));

        // Reset wire creation state
        setWireStart(null);
        setWireBendPoints([]);
        setMousePos(null);
        saveToHistory();
        return;
      }

      // No wire nearby, add a bend point
      const bendPoint = mousePos
        ? { x: mousePos.x, y: mousePos.y }
        : { x: snapToGrid(svgP.x, GRID_SIZE), y: snapToGrid(svgP.y, GRID_SIZE) };
      setWireBendPoints(prev => [...prev, bendPoint]);
      return;
    }

    // Deselect everything when clicking canvas background
    setSelectedBlockId(null);
    setSelectedBlockLabelId(null);
    setSelectedPointId(null);
    setEditingPoint(null);
    setSelectedWireId(null);
    setSidebarOpen(false);
  }, [
    svgRef,
    isPanning,
    screenToSVGCoords,
    closeContextMenu,
    placementMode,
    targetBlockId,
    blocks,
    setBlocks,
    saveToHistory,
    addBlockMode,
    newBlockShape,
    setAddBlockMode,
    setSelectedBlockId,
    wireStart,
    mousePos,
    wireBendPoints,
    findWireNearClick,
    wires,
    setWires,
    setWireStart,
    setWireBendPoints,
    setMousePos,
    setSelectedBlockLabelId,
    setSelectedPointId,
    setEditingPoint,
    setSelectedWireId,
    setSidebarOpen,
    GRID_SIZE,
  ]);

  /**
   * Handle mouse up - wire snapping and drag cleanup
   * When a block is dropped near loose wire ends, snap them to connection points
   */
  const handleMouseUp = useCallback(() => {
    // Check if we dropped a block near loose wires and snap them
    if (dragState.type === 'block' && dragState.blockId) {
      const blockId = dragState.blockId;
      const block = blocks.find(b => b.id === blockId);

      if (block) {
        // Calculate global positions for all points on this block
        const pointPositions = block.connectionPoints.map(cp => ({
          id: cp.id,
          pos: getGlobalPosition(blockId, cp.id)
        }));

        let wiresChanged = false;
        const newWires = wires.map(w => {
          const updated = { ...w };
          let changed = false;

          // Check Start Loose End
          if (w.fromLooseX !== undefined && w.fromLooseY !== undefined) {
            let closest: string | null = null;
            let minD = Infinity;

            for (const p of pointPositions) {
              const d = Math.hypot(w.fromLooseX - p.pos.x, w.fromLooseY - p.pos.y);
              if (d < 20 && d < minD) { // 20px snap radius
                minD = d;
                closest = p.id;
              }
            }

            if (closest) {
              delete updated.fromLooseX;
              delete updated.fromLooseY;
              updated.fromBlockId = blockId;
              updated.fromPointId = closest;
              changed = true;
            }
          }

          // Check End Loose End
          if (w.toLooseX !== undefined && w.toLooseY !== undefined) {
            let closest: string | null = null;
            let minD = Infinity;

            for (const p of pointPositions) {
              const d = Math.hypot(w.toLooseX - p.pos.x, w.toLooseY - p.pos.y);
              if (d < 20 && d < minD) {
                minD = d;
                closest = p.id;
              }
            }

            if (closest) {
              delete updated.toLooseX;
              delete updated.toLooseY;
              updated.toBlockId = blockId;
              updated.toPointId = closest;
              changed = true;
            }
          }

          if (changed) wiresChanged = true;
          return updated;
        });

        if (wiresChanged) {
          setWires(newWires);
        }
      }
    }

    // Save to history if we were dragging something
    if (isDraggingAny()) {
      saveToHistory();
    }
    stopDragging();
    stopPanning();
  }, [
    dragState,
    blocks,
    wires,
    setWires,
    getGlobalPosition,
    isDraggingAny,
    saveToHistory,
    stopDragging,
    stopPanning,
  ]);

  return {
    handleCanvasClick,
    handleMouseUp,
    handlePanStart,
  };
}
