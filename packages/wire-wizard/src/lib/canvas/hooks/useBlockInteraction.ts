/**
 * useBlockInteraction Hook
 *
 * Block-level mousedown / context-menu / label-drag handlers, including
 * multi-select support: shift-click toggles a block in/out of the multi-set,
 * and dragging any member of the multi-set drags every block in the set.
 */

import { useCallback } from 'react';
import type { Block, Wire } from '../../core/types';

interface UseBlockInteractionProps {
  blocks: Block[];
  wires: Wire[];

  // Selection
  setSelectedBlockId: (id: string | null) => void;
  setSelectedBlockLabelId: (id: string | null) => void;
  selectedBlockIds: string[];
  isBlockInMultiSelect: (blockId: string) => boolean;
  toggleBlockInMulti: (blockId: string) => void;

  // Context menu
  openContextMenu: (menu: { x: number; y: number; blockId?: string; wireId?: string; isConfigurable?: boolean }) => void;

  // Drag state
  startDragging: (state: import('./useDragState').DragState) => void;

  // Position helper
  screenToSVGCoords: (screenX: number, screenY: number) => { x: number; y: number };
}

interface UseBlockInteractionReturn {
  handleBlockMouseDown: (blockId: string, e: React.MouseEvent) => void;
  handleBlockLabelClick: (blockId: string, e: React.MouseEvent) => void;
  handleBlockLabelDrag: (blockId: string, startX: number, startY: number) => void;
  handleConnectionLabelDrag: (blockId: string, pointId: string, startX: number, startY: number) => void;
}

export function useBlockInteraction({
  blocks,
  wires,
  setSelectedBlockId,
  setSelectedBlockLabelId,
  selectedBlockIds,
  isBlockInMultiSelect,
  toggleBlockInMulti,
  openContextMenu,
  startDragging,
  screenToSVGCoords,
}: UseBlockInteractionProps): UseBlockInteractionReturn {

  /**
   * Handle block mousedown
   * - Right click: open context menu
   * - Shift+left click: toggle membership in multi-select
   * - Left click on a block already in multi-select: start dragging the whole set
   * - Left click otherwise: select just this block and start dragging it
   */
  const handleBlockMouseDown = useCallback((blockId: string, e: React.MouseEvent) => {
    if (e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
      const block = blocks.find(b => b.id === blockId);
      openContextMenu({
        x: e.clientX,
        y: e.clientY,
        blockId,
        isConfigurable: !!(block?.componentConfig),
      });
      return;
    }
    if (e.button !== 0) return;
    e.stopPropagation();

    if (e.shiftKey) {
      toggleBlockInMulti(blockId);
      return;
    }

    const svgP = screenToSVGCoords(e.clientX, e.clientY);

    // Multi-block drag: clicked block is part of an active multi-selection.
    if (isBlockInMultiSelect(blockId) && selectedBlockIds.length > 1) {
      const movableIds: string[] = [];
      const origins: Record<string, { x: number; y: number }> = {};
      for (const id of selectedBlockIds) {
        const b = blocks.find((bl) => bl.id === id);
        if (!b || b.locked) continue;
        movableIds.push(id);
        origins[id] = { x: b.x, y: b.y };
      }
      if (movableIds.length === 0) return;

      // Snapshot bend points for wires fully captured by the selection (both
      // endpoints terminate on a moving block). Their bend points will be
      // translated by the same delta so the wire moves rigidly with the group.
      const movingSet = new Set(movableIds);
      const wireBendOrigins: Record<string, Array<{ x: number; y: number }>> = {};
      for (const w of wires) {
        const fromInside = !!(w.fromBlockId && movingSet.has(w.fromBlockId));
        const toInside = !!(w.toBlockId && movingSet.has(w.toBlockId));
        if (fromInside && toInside && w.bendPoints.length > 0) {
          wireBendOrigins[w.id] = w.bendPoints.map((bp) => ({ x: bp.x, y: bp.y }));
        }
      }

      startDragging({
        type: 'multiBlock',
        blockIds: movableIds,
        origins,
        wireBendOrigins,
        startSvgX: svgP.x,
        startSvgY: svgP.y,
      });
      return;
    }

    // Single-block drag.
    setSelectedBlockId(blockId);
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      if (block.locked) return;
      startDragging({
        type: 'block',
        blockId,
        offsetX: svgP.x - block.x,
        offsetY: svgP.y - block.y,
      });
    }
  }, [blocks, wires, openContextMenu, setSelectedBlockId, screenToSVGCoords, startDragging, isBlockInMultiSelect, selectedBlockIds, toggleBlockInMulti]);

  /**
   * Handle block label click (selection)
   */
  const handleBlockLabelClick = useCallback((blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBlockLabelId(blockId);
    setSelectedBlockId(blockId);
  }, [setSelectedBlockLabelId, setSelectedBlockId]);

  const handleBlockLabelDrag = useCallback((blockId: string, startX: number, startY: number) => {
    const block = blocks.find(b => b.id === blockId);
    startDragging({
      type: 'blockLabel',
      blockId,
      startX,
      startY,
      originalOffsetX: block?.labelOffsetX || 0,
      originalOffsetY: block?.labelOffsetY || 0,
    });
  }, [startDragging, blocks]);

  const handleConnectionLabelDrag = useCallback((blockId: string, pointId: string, startX: number, startY: number) => {
    const block = blocks.find(b => b.id === blockId);
    const cp = block?.connectionPoints.find(p => p.id === pointId);
    startDragging({
      type: 'connectionLabel',
      blockId,
      pointId,
      startX,
      startY,
      originalOffsetX: cp?.labelOffsetX || 0,
      originalOffsetY: cp?.labelOffsetY || 0,
    });
  }, [startDragging, blocks]);

  return {
    handleBlockMouseDown,
    handleBlockLabelClick,
    handleBlockLabelDrag,
    handleConnectionLabelDrag,
  };
}
