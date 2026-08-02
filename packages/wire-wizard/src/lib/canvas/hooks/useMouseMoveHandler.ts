import { useCallback, RefObject, MutableRefObject } from 'react';
import type { Block, Wire, BendPoint } from '../../core/types';
import type { WireStart } from './useWireCreation';

/**
 * Configuration object for the useMouseMoveHandler hook
 */
export interface UseMouseMoveHandlerConfig {
  // Refs
  svgRef: RefObject<SVGSVGElement>;
  hasDraggedRef: MutableRefObject<boolean>;

  // Canvas transform state
  isPanning: boolean;
  updatePan: (clientX: number, clientY: number) => void;

  // Wire creation state
  wireStart: WireStart | null;
  wireBendPoints: BendPoint[];
  placementMode: boolean;
  setMousePos: (pos: { x: number; y: number } | null) => void;

  // Coordinate helpers
  screenToSVGCoords: (screenX: number, screenY: number) => { x: number; y: number };
  getGlobalPosition: (blockId: string, pointId: string) => { x: number; y: number };

  // Drag state getters
  getDraggingPoint: () => { blockId: string; pointId: string; offsetX: number; offsetY: number } | null;
  getDraggingBendPoint: () => { wireId: string; bendIndex: number } | null;
  getDraggingBlock: () => { blockId: string; offsetX: number; offsetY: number } | null;
  getDraggingMultiBlock: () => {
    blockIds: string[];
    origins: Record<string, { x: number; y: number }>;
    wireBendOrigins: Record<string, Array<{ x: number; y: number }>>;
    startSvgX: number;
    startSvgY: number;
  } | null;
  getDraggingBusConverge: () => { wireId: string; isStart: boolean } | null;
  getDraggingWireLabel: () => { wireId: string; startX: number; startY: number } | null;
  getDraggingConnectionLabel: () => { blockId: string; pointId: string; startX: number; startY: number; originalOffsetX: number; originalOffsetY: number } | null;
  getDraggingBlockLabel: () => { blockId: string; startX: number; startY: number; originalOffsetX: number; originalOffsetY: number } | null;

  // Data
  blocks: Block[];
  wires: Wire[];

  // State setters
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setWires: React.Dispatch<React.SetStateAction<Wire[]>>;

  // Update functions
  updateConnectionPoint: (blockId: string, pointId: string, updates: { x?: number; y?: number }) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;

  // Grid utilities
  snapToGrid: (value: number, gridSize: number) => number;
  smartSnapToGrid: (x: number, y: number, startX: number, startY: number, gridSize: number) => { x: number; y: number };
  GRID_SIZE: number;

  // Wire endpoint helper
  getWireEndpointPosition: (wire: Wire, isFrom: boolean) => { x: number; y: number };
}

/**
 * Return type for the useMouseMoveHandler hook
 */
export interface UseMouseMoveHandlerReturn {
  handleMouseMove: (e: React.MouseEvent) => void;
  calculateAlignmentGuides: (
    currentPos: { x: number; y: number },
    options?: { excludeBlockId?: string; excludePointId?: string }
  ) => import('../../core/types').AlignmentGuide[];
}

/**
 * Custom hook that handles all mouse move logic for the wiring diagram canvas.
 *
 * Responsibilities:
 * - Panning updates when middle mouse is held
 * - Mouse position updates for wire preview and placement mode
 * - Dragging: connection points, bend points, blocks, wire labels,
 *   connection labels, block labels, and bus convergence points
 *
 * @param config - Configuration object with all required dependencies
 * @returns Object containing the handleMouseMove callback
 *
 * @example
 * ```tsx
 * const { handleMouseMove } = useMouseMoveHandler({
 *   svgRef,
 *   hasDraggedRef,
 *   isPanning,
 *   updatePan,
 *   wireStart,
 *   wireBendPoints,
 *   placementMode,
 *   setMousePos,
 *   screenToSVGCoords,
 *   getGlobalPosition,
 *   getDraggingPoint,
 *   getDraggingBendPoint,
 *   getDraggingBlock,
 *   getDraggingBusConverge,
 *   getDraggingWireLabel,
 *   getDraggingConnectionLabel,
 *   getDraggingBlockLabel,
 *   blocks,
 *   wires,
 *   setBlocks,
 *   setWires,
 *   updateConnectionPoint,
 *   updateBlock,
 *   snapToGrid,
 *   smartSnapToGrid,
 *   GRID_SIZE,
 *   getWireEndpointPosition,
 * });
 *
 * // Use in SVG element
 * <svg onMouseMove={handleMouseMove} ... />
 * ```
 */
export function useMouseMoveHandler(config: UseMouseMoveHandlerConfig): UseMouseMoveHandlerReturn {
  const {
    svgRef,
    hasDraggedRef,
    isPanning,
    updatePan,
    wireStart,
    wireBendPoints,
    placementMode,
    setMousePos,
    screenToSVGCoords,
    getGlobalPosition,
    getDraggingPoint,
    getDraggingBendPoint,
    getDraggingBlock,
    getDraggingMultiBlock,
    getDraggingBusConverge,
    getDraggingWireLabel,
    getDraggingConnectionLabel,
    getDraggingBlockLabel,
    blocks,
    wires,
    setBlocks,
    setWires,
    updateConnectionPoint,
    updateBlock,
    snapToGrid,
    smartSnapToGrid,
    GRID_SIZE,
    getWireEndpointPosition,
  } = config;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!svgRef.current) return;

    // Handle panning
    if (isPanning) {
      updatePan(e.clientX, e.clientY);
      return;
    }

    const svgP = screenToSVGCoords(e.clientX, e.clientY);

    // Update mouse position for wire preview and placement mode
    if (wireStart || placementMode) {
      if (wireStart && !placementMode) {
        // Smart snapping for wire creation
        let startX = 0;
        let startY = 0;

        if (wireBendPoints.length > 0) {
          const lastBend = wireBendPoints[wireBendPoints.length - 1];
          startX = lastBend.x;
          startY = lastBend.y;
        } else if (wireStart.blockId && wireStart.pointId) {
          const pos = getGlobalPosition(wireStart.blockId, wireStart.pointId);
          startX = pos.x;
          startY = pos.y;
        }

        setMousePos(smartSnapToGrid(svgP.x, svgP.y, startX, startY, GRID_SIZE));
      } else {
        // Regular snapping for placement mode
        setMousePos({ x: snapToGrid(svgP.x, GRID_SIZE), y: snapToGrid(svgP.y, GRID_SIZE) });
      }
    }

    // Drag connection point
    const draggingPoint = getDraggingPoint();
    if (draggingPoint) {
      hasDraggedRef.current = true;
      const block = blocks.find(b => b.id === draggingPoint.blockId);
      if (block) {
        const newX = Math.max(0, Math.min(block.width, svgP.x - block.x - draggingPoint.offsetX));
        const newY = Math.max(0, Math.min(block.height, svgP.y - block.y - draggingPoint.offsetY));
        updateConnectionPoint(draggingPoint.blockId, draggingPoint.pointId, { x: newX, y: newY });
      }
    }

    // Drag bend point or wire endpoint
    const draggingBendPoint = getDraggingBendPoint();
    if (draggingBendPoint) {
      hasDraggedRef.current = true;
      const draggedWire = wires.find(w => w.id === draggingBendPoint.wireId);

      if (draggedWire) {
        // Handle Endpoint Drag (Junctions)
        if (draggingBendPoint.bendIndex < 0) {
          const isStart = draggingBendPoint.bendIndex === -1;
          const newX = snapToGrid(svgP.x, GRID_SIZE);
          const newY = snapToGrid(svgP.y, GRID_SIZE);

          // Determine the old coordinates of the junction being dragged
          // We use the dragged wire as the reference
          let oldX: number | undefined;
          let oldY: number | undefined;

          if (isStart) {
            oldX = draggedWire.fromJunctionX;
            oldY = draggedWire.fromJunctionY;
            // Fallback if not explicitly set (e.g. legacy or first move)
            if (oldX === undefined || oldY === undefined) {
              const pos = getWireEndpointPosition(draggedWire, true);
              oldX = pos.x;
              oldY = pos.y;
            }
          } else {
            oldX = draggedWire.toJunctionX;
            oldY = draggedWire.toJunctionY;
            if (oldX === undefined || oldY === undefined) {
              const pos = getWireEndpointPosition(draggedWire, false);
              oldX = pos.x;
              oldY = pos.y;
            }
          }

          // Update ALL wires that share this junction point
          setWires(wires.map(wire => {
            const updated = { ...wire };
            let modified = false;

            // Check if wire's start point matches the dragged junction
            if (!wire.fromBlockId) {
              const startX = wire.fromJunctionX !== undefined ? wire.fromJunctionX : getWireEndpointPosition(wire, true).x;
              const startY = wire.fromJunctionY !== undefined ? wire.fromJunctionY : getWireEndpointPosition(wire, true).y;

              if (Math.abs(startX - oldX!) < 0.1 && Math.abs(startY - oldY!) < 0.1) {
                updated.fromJunctionX = newX;
                updated.fromJunctionY = newY;
                modified = true;
              }
            }

            // Check if wire's end point matches the dragged junction
            if (!wire.toBlockId) {
              const endX = wire.toJunctionX !== undefined ? wire.toJunctionX : getWireEndpointPosition(wire, false).x;
              const endY = wire.toJunctionY !== undefined ? wire.toJunctionY : getWireEndpointPosition(wire, false).y;

              if (Math.abs(endX - oldX!) < 0.1 && Math.abs(endY - oldY!) < 0.1) {
                updated.toJunctionX = newX;
                updated.toJunctionY = newY;
                modified = true;
              }
            }

            // Force update for the dragged wire itself (in case it drifted or was undefined)
            if (wire.id === draggedWire.id) {
              if (isStart) {
                updated.fromJunctionX = newX;
                updated.fromJunctionY = newY;
              } else {
                updated.toJunctionX = newX;
                updated.toJunctionY = newY;
              }
              return updated;
            }

            return modified ? updated : wire;
          }));

        } else {
          // Regular Bend Point Drag
          const busGroupId = draggedWire.busGroupId;

          setWires(wires.map(wire => {
            // If this wire is in a bus, update the bend point for ALL wires in that bus
            const shouldUpdate = busGroupId
              ? wire.busGroupId === busGroupId
              : wire.id === draggingBendPoint.wireId;

            if (shouldUpdate) {
              const newBendPoints = [...wire.bendPoints];
              // Ensure array is large enough (should be)
              if (newBendPoints[draggingBendPoint.bendIndex]) {
                newBendPoints[draggingBendPoint.bendIndex] = {
                  x: snapToGrid(svgP.x, GRID_SIZE),
                  y: snapToGrid(svgP.y, GRID_SIZE)
                };
                return { ...wire, bendPoints: newBendPoints };
              }
            }
            return wire;
          }));
        }
      }
    }

    // Drag block
    const draggingBlock = getDraggingBlock();
    if (draggingBlock) {
      hasDraggedRef.current = true;
      const newX = snapToGrid(svgP.x - draggingBlock.offsetX, GRID_SIZE);
      const newY = snapToGrid(svgP.y - draggingBlock.offsetY, GRID_SIZE);
      updateBlock(draggingBlock.blockId, { x: newX, y: newY });
    }

    // Drag a multi-block selection — apply the same delta to every block in
    // the set so they move together as a rigid group. Bend points of wires
    // fully captured by the group also translate, so wires move rigidly too.
    const draggingMulti = getDraggingMultiBlock();
    if (draggingMulti) {
      hasDraggedRef.current = true;
      const dx = snapToGrid(svgP.x - draggingMulti.startSvgX, GRID_SIZE);
      const dy = snapToGrid(svgP.y - draggingMulti.startSvgY, GRID_SIZE);
      const idSet = new Set(draggingMulti.blockIds);
      setBlocks(prev => prev.map(b => {
        if (!idSet.has(b.id)) return b;
        const origin = draggingMulti.origins[b.id];
        if (!origin) return b;
        return { ...b, x: origin.x + dx, y: origin.y + dy };
      }));

      const wireOrigins = draggingMulti.wireBendOrigins;
      if (wireOrigins && Object.keys(wireOrigins).length > 0) {
        setWires(prev => prev.map(w => {
          const origins = wireOrigins[w.id];
          if (!origins) return w;
          return {
            ...w,
            bendPoints: origins.map((bp) => ({ x: bp.x + dx, y: bp.y + dy })),
          };
        }));
      }
    }

    // Drag label
    const draggingLabel = getDraggingWireLabel();
    if (draggingLabel) {
      const offsetX = snapToGrid(svgP.x - draggingLabel.startX, GRID_SIZE);
      const offsetY = snapToGrid(svgP.y - draggingLabel.startY, GRID_SIZE);
      setWires(wires.map(w => {
        if (w.id === draggingLabel.wireId) {
          return { ...w, labelOffsetX: offsetX, labelOffsetY: offsetY };
        }
        return w;
      }));
    }

    // Drag connection point label — labels live inside the block's rotated
    // group, so we inverse-rotate the cursor delta into the block's local
    // frame before applying it as the new offset.
    const draggingConnectionLabel = getDraggingConnectionLabel();
    if (draggingConnectionLabel) {
      const block = blocks.find(b => b.id === draggingConnectionLabel.blockId);
      const angleDeg = block?.rotation || 0;
      const a = (angleDeg * Math.PI) / 180;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const dx = svgP.x - draggingConnectionLabel.startX;
      const dy = svgP.y - draggingConnectionLabel.startY;
      const localDx = dx * cos + dy * sin;
      const localDy = -dx * sin + dy * cos;
      const offsetX = draggingConnectionLabel.originalOffsetX + localDx;
      const offsetY = draggingConnectionLabel.originalOffsetY + localDy;

      setBlocks(blocks.map(b =>
        b.id === draggingConnectionLabel.blockId
          ? {
            ...b,
            connectionPoints: b.connectionPoints.map(p =>
              p.id === draggingConnectionLabel.pointId
                ? { ...p, labelOffsetX: offsetX, labelOffsetY: offsetY }
                : p
            )
          }
          : b
      ));
      return;
    }

    // Drag block label — same inverse-rotation rule.
    const draggingBlockLabel = getDraggingBlockLabel();
    if (draggingBlockLabel) {
      const block = blocks.find(b => b.id === draggingBlockLabel.blockId);
      const angleDeg = block?.rotation || 0;
      const a = (angleDeg * Math.PI) / 180;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const dx = svgP.x - draggingBlockLabel.startX;
      const dy = svgP.y - draggingBlockLabel.startY;
      const localDx = dx * cos + dy * sin;
      const localDy = -dx * sin + dy * cos;
      const offsetX = draggingBlockLabel.originalOffsetX + localDx;
      const offsetY = draggingBlockLabel.originalOffsetY + localDy;

      setBlocks(blocks.map(b =>
        b.id === draggingBlockLabel.blockId
          ? { ...b, labelOffsetX: offsetX, labelOffsetY: offsetY }
          : b
      ));
      return;
    }

    // Drag bus convergence point
    const draggingBusConverge = getDraggingBusConverge();
    if (draggingBusConverge) {
      const wire = wires.find(w => w.id === draggingBusConverge.wireId);
      if (wire && wire.busGroupId) {
        // Get all wires in the bus group
        const busWires = wires.filter(w => w.busGroupId === wire.busGroupId);

        // Calculate center points (improved direction-aware logic matching BusWireRenderer)
        const primaryWire = busWires[0];
        const pFrom = getWireEndpointPosition(primaryWire, true);
        const pTo = getWireEndpointPosition(primaryWire, false);

        const wireAnalysis = busWires.map(w => {
          const wFrom = getWireEndpointPosition(w, true);
          const wTo = getWireEndpointPosition(w, false);

          // Calculate distances to determine orientation
          const distAligned = Math.hypot(wFrom.x - pFrom.x, wFrom.y - pFrom.y) +
            Math.hypot(wTo.x - pTo.x, wTo.y - pTo.y);

          const distCrossed = Math.hypot(wFrom.x - pTo.x, wFrom.y - pTo.y) +
            Math.hypot(wTo.x - pFrom.x, wTo.y - pFrom.y);

          const isReversed = distCrossed < distAligned;
          return {
            geoFrom: isReversed ? wTo : wFrom,
            geoTo: isReversed ? wFrom : wTo
          };
        });

        const allFromPoints = wireAnalysis.map(wa => wa.geoFrom);
        const allToPoints = wireAnalysis.map(wa => wa.geoTo);

        // Calculate center points and snap to grid for clean parallel lines
        const centerFrom = {
          x: snapToGrid(allFromPoints.reduce((sum, p) => sum + p.x, 0) / allFromPoints.length, GRID_SIZE),
          y: snapToGrid(allFromPoints.reduce((sum, p) => sum + p.y, 0) / allFromPoints.length, GRID_SIZE)
        };

        const centerTo = {
          x: snapToGrid(allToPoints.reduce((sum, p) => sum + p.x, 0) / allToPoints.length, GRID_SIZE),
          y: snapToGrid(allToPoints.reduce((sum, p) => sum + p.y, 0) / allToPoints.length, GRID_SIZE)
        };

        // Use center-based path (same as rendering)
        const pathPoints = [centerFrom, ...primaryWire.bendPoints, centerTo];

        let totalLength = 0;
        for (let i = 0; i < pathPoints.length - 1; i++) {
          const dx = pathPoints[i + 1].x - pathPoints[i].x;
          const dy = pathPoints[i + 1].y - pathPoints[i].y;
          totalLength += Math.sqrt(dx * dx + dy * dy);
        }

        // Protect against zero-length bundles
        if (totalLength < 0.1) totalLength = 1;

        // Project mouse position onto the path direction to allow free dragging
        const pathVector = {
          x: centerTo.x - centerFrom.x,
          y: centerTo.y - centerFrom.y
        };
        const pathLength = Math.sqrt(pathVector.x ** 2 + pathVector.y ** 2);

        // Normalized path direction
        const pathDir = {
          x: pathVector.x / pathLength,
          y: pathVector.y / pathLength
        };

        // Vector from path start to mouse
        const mouseVector = {
          x: svgP.x - centerFrom.x,
          y: svgP.y - centerFrom.y
        };

        // Project mouse onto path direction (dot product)
        const projectionDistance = mouseVector.x * pathDir.x + mouseVector.y * pathDir.y;

        // Convert to percentage (-200% to 300% range for flexibility)
        let closestPct = projectionDistance / totalLength;
        closestPct = Math.max(-2, Math.min(3, closestPct));

        // Update the wire's convergence percentage
        setWires(wires.map(w => {
          if (w.id === draggingBusConverge.wireId) {
            if (draggingBusConverge.isStart) {
              return { ...w, busConvergeStart: closestPct };
            } else {
              return { ...w, busConvergeEnd: closestPct };
            }
          }
          return w;
        }));
      }
    }
  }, [
    svgRef,
    isPanning,
    updatePan,
    wireStart,
    wireBendPoints,
    placementMode,
    setMousePos,
    screenToSVGCoords,
    getGlobalPosition,
    getDraggingPoint,
    getDraggingBendPoint,
    getDraggingBlock,
    getDraggingMultiBlock,
    getDraggingBusConverge,
    getDraggingWireLabel,
    getDraggingConnectionLabel,
    getDraggingBlockLabel,
    blocks,
    wires,
    setBlocks,
    setWires,
    updateConnectionPoint,
    updateBlock,
    snapToGrid,
    smartSnapToGrid,
    GRID_SIZE,
    getWireEndpointPosition,
    hasDraggedRef,
  ]);

  /**
   * Calculate alignment guides
   * Returns nearby alignment lines when drawing wires or moving points
   */
  const calculateAlignmentGuides = (
    currentPos: { x: number; y: number },
    options: {
      excludeBlockId?: string,
      excludePointId?: string
    } = {}
  ): import('../../core/types').AlignmentGuide[] => {
    const guides: import('../../core/types').AlignmentGuide[] = [];
    const THRESHOLD = 5; // Distance in svg units to snap

    // Collect all relevant target points (connection points of all blocks)
    blocks.forEach(block => {
      // proper skip logic
      if (options.excludeBlockId && block.id === options.excludeBlockId) return;

      block.connectionPoints.forEach(cp => {
        if (options.excludePointId && cp.id === options.excludePointId) return;

        const pos = getGlobalPosition(block.id, cp.id);

        // Check Horizontal Match (Y is same)
        if (Math.abs(currentPos.y - pos.y) < THRESHOLD) {
          guides.push({ type: 'horizontal', x: pos.x, y: pos.y });
        }

        // Check Vertical Match (X is same)
        if (Math.abs(currentPos.x - pos.x) < THRESHOLD) {
          guides.push({ type: 'vertical', x: pos.x, y: pos.y });
        }
      });
    });

    return guides;
  };

  return { handleMouseMove, calculateAlignmentGuides };
}
