/**
 * Block Operations Hook
 *
 * Handles block and connection point CRUD operations
 */

import { useCallback } from 'react';
import type { Block, ConnectionPoint, Wire } from '../../core/types';
import { snapToGrid } from '../../core/utils';
import { getRandomConnectionPointColor } from '../../core/constants';

interface UseBlockOperationsProps {
  blocks: Block[];
  wires: Wire[];
  setBlocks: (blocks: Block[]) => void;
  setWires: (wires: Wire[]) => void;
  selectedBlockId: string | null;
  selectedPointId: string | null;
  editingPoint: ConnectionPoint | null;
  setSelectedBlockId: (id: string | null) => void;
  setSelectedPointId: (id: string | null) => void;
  setEditingPoint: (point: ConnectionPoint | null) => void;
  saveToHistory: () => void;
  contextRemoveBlock: (blockId: string) => void;
  GRID_SIZE: number;
}

export function useBlockOperations({
  blocks,
  wires,
  setBlocks,
  setWires,
  selectedBlockId,
  selectedPointId,
  editingPoint,
  setSelectedBlockId,
  setSelectedPointId,
  setEditingPoint,
  saveToHistory,
  contextRemoveBlock,
  GRID_SIZE,
}: UseBlockOperationsProps) {

  // Add connection point to selected block
  const addConnectionPoint = useCallback(() => {
    if (!selectedBlockId) return;

    setBlocks(blocks.map(block => {
      if (block.id === selectedBlockId) {
        // Distribute new points around the edges (left, top, right, bottom)
        const numPoints = block.connectionPoints.length;
        const side = numPoints % 4; // 0=left, 1=top, 2=right, 3=bottom
        const position = Math.floor(numPoints / 4) + 1; // Position along that side

        let x: number, y: number;
        const spacing = 30; // spacing between points

        switch (side) {
          case 0: // Left edge
            x = 0;
            y = snapToGrid(position * spacing, GRID_SIZE);
            break;
          case 1: // Top edge
            x = snapToGrid(position * spacing, GRID_SIZE);
            y = 0;
            break;
          case 2: // Right edge
            x = block.width;
            y = snapToGrid(position * spacing, GRID_SIZE);
            break;
          case 3: // Bottom edge
            x = snapToGrid(position * spacing, GRID_SIZE);
            y = block.height;
            break;
          default:
            x = block.width / 2;
            y = block.height / 2;
        }

        const newPoint: ConnectionPoint = {
          id: `cp_${Date.now()}`,
          x: snapToGrid(x, GRID_SIZE),
          y: snapToGrid(y, GRID_SIZE),
          label: 'New',
          color: getRandomConnectionPointColor(),
          voltage: 12
        };

        return {
          ...block,
          connectionPoints: [...block.connectionPoints, newPoint]
        };
      }
      return block;
    }));

    saveToHistory();
  }, [blocks, selectedBlockId, setBlocks, saveToHistory, GRID_SIZE]);

  // Update connection point
  const updateConnectionPoint = useCallback((
    blockId: string,
    pointId: string,
    updates: Partial<ConnectionPoint>
  ) => {
    // Snap x and y coordinates to grid if they're being updated
    const snappedUpdates = { ...updates };
    if (updates.x !== undefined) {
      snappedUpdates.x = snapToGrid(updates.x, GRID_SIZE);
    }
    if (updates.y !== undefined) {
      snappedUpdates.y = snapToGrid(updates.y, GRID_SIZE);
    }

    setBlocks(blocks.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          connectionPoints: block.connectionPoints.map(p =>
            p.id === pointId ? { ...p, ...snappedUpdates } : p
          )
        };
      }
      return block;
    }));

    if (editingPoint && pointId === selectedPointId) {
      setEditingPoint({ ...editingPoint, ...snappedUpdates });
    }
  }, [blocks, setBlocks, editingPoint, selectedPointId, setEditingPoint, GRID_SIZE]);

  // Remove connection point from selected block
  const removeConnectionPoint = useCallback((pointId: string) => {
    if (!selectedBlockId) return;

    // Remove any wires connected to this point
    setWires(wires.filter(w =>
      !(w.fromBlockId === selectedBlockId && w.fromPointId === pointId) &&
      !(w.toBlockId === selectedBlockId && w.toPointId === pointId)
    ));

    // Remove the point from the block
    setBlocks(blocks.map(block => {
      if (block.id === selectedBlockId) {
        return {
          ...block,
          connectionPoints: block.connectionPoints.filter(p => p.id !== pointId)
        };
      }
      return block;
    }));

    setSelectedPointId(null);
    setEditingPoint(null);
    saveToHistory();
  }, [blocks, wires, selectedBlockId, setBlocks, setWires, setSelectedPointId, setEditingPoint, saveToHistory]);

  // Remove block
  const removeBlock = useCallback((blockId: string) => {
    // Check if we are deleting the selected block to clear selection state
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
      setSelectedPointId(null);
      setEditingPoint(null);
    }

    // Use the context's removeBlock which handles wire preservation (dangling wires)
    contextRemoveBlock(blockId);

    saveToHistory();
  }, [selectedBlockId, setSelectedBlockId, setSelectedPointId, setEditingPoint, contextRemoveBlock, saveToHistory]);

  // Duplicate block (creates a copy with new IDs, no wires connected)
  const duplicateBlock = useCallback((blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Generate new unique ID
    const newBlockId = `block_${Date.now()}`;

    // Build an old-id → new-id map so we can remap any bus port's
    // `internalPinIds` array to point at the duplicate's pins.
    const idMap = new Map<string, string>();
    block.connectionPoints.forEach((point, index) => {
      idMap.set(point.id, `${newBlockId}_pt_${index}`);
    });

    // Create new connection points with new IDs + remapped bus-port references.
    const newConnectionPoints = block.connectionPoints.map((point) => ({
      ...point,
      id: idMap.get(point.id)!,
      internalPinIds: point.internalPinIds?.map((id) => idMap.get(id) ?? id),
    }));

    // Create duplicated block offset by 20px
    const newBlock: Block = {
      ...block,
      id: newBlockId,
      x: block.x + 20,
      y: block.y + 20,
      connectionPoints: newConnectionPoints,
      label: `${block.label} (copy)`
    };

    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlockId);
    saveToHistory();
  }, [blocks, setBlocks, setSelectedBlockId, saveToHistory]);

  // Update block
  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, ...updates } : b));
  }, [blocks, setBlocks]);

  return {
    addConnectionPoint,
    updateConnectionPoint,
    removeConnectionPoint,
    removeBlock,
    duplicateBlock,
    updateBlock,
  };
}
