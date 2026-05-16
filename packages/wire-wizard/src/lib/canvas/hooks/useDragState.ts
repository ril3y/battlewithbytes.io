import { useState, useCallback } from 'react';

/**
 * Discriminated union type for all possible drag states in the wiring diagram
 */
export type DragState =
  | { type: 'point'; blockId: string; pointId: string; offsetX: number; offsetY: number }
  | { type: 'bendPoint'; wireId: string; bendIndex: number }
  | { type: 'block'; blockId: string; offsetX: number; offsetY: number }
  | {
      type: 'multiBlock';
      blockIds: string[];
      origins: Record<string, { x: number; y: number }>;
      /** Bend-point snapshots for wires whose both endpoints sit on moving blocks. */
      wireBendOrigins: Record<string, Array<{ x: number; y: number }>>;
      startSvgX: number;
      startSvgY: number;
    }
  | { type: 'busConverge'; wireId: string; isStart: boolean }
  | { type: 'wireLabel'; wireId: string; startX: number; startY: number }
  | { type: 'connectionLabel'; blockId: string; pointId: string; startX: number; startY: number; originalOffsetX: number; originalOffsetY: number }
  | { type: 'blockLabel'; blockId: string; startX: number; startY: number; originalOffsetX: number; originalOffsetY: number }
  | { type: 'none' };

/**
 * Hook return interface
 */
export interface UseDragStateReturn {
  dragState: DragState;
  startDragging: (state: DragState) => void;
  stopDragging: () => void;
  isDraggingType: (type: DragState['type']) => boolean;
  isDraggingAny: () => boolean;
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
}

/**
 * Custom hook to manage all dragging state in the wiring diagram
 *
 * This consolidates 8 separate useState calls into a single discriminated union,
 * making the state management more type-safe and easier to reason about.
 *
 * @example
 * ```typescript
 * const { dragState, startDragging, stopDragging, isDraggingType } = useDragState();
 *
 * // Start dragging a connection point
 * startDragging({ type: 'point', blockId: 'block1', pointId: 'pt1' });
 *
 * // Check if dragging
 * if (isDraggingType('point')) {
 *   // Handle point drag
 * }
 *
 * // Stop dragging
 * stopDragging();
 * ```
 */
export function useDragState(): UseDragStateReturn {
  const [dragState, setDragState] = useState<DragState>({ type: 'none' });

  /**
   * Start dragging with the given state
   */
  const startDragging = useCallback((state: DragState) => {
    setDragState(state);
  }, []);

  /**
   * Stop all dragging
   */
  const stopDragging = useCallback(() => {
    setDragState({ type: 'none' });
  }, []);

  /**
   * Check if currently dragging a specific type
   */
  const isDraggingType = useCallback((type: DragState['type']): boolean => {
    return dragState.type === type;
  }, [dragState.type]);

  /**
   * Check if currently dragging anything
   */
  const isDraggingAny = useCallback((): boolean => {
    return dragState.type !== 'none';
  }, [dragState.type]);

  /**
   * Get dragging point data if currently dragging a point
   */
  const getDraggingPoint = useCallback((): { blockId: string; pointId: string; offsetX: number; offsetY: number } | null => {
    return dragState.type === 'point' ? dragState : null;
  }, [dragState]);

  /**
   * Get dragging bend point data if currently dragging a bend point
   */
  const getDraggingBendPoint = useCallback((): { wireId: string; bendIndex: number } | null => {
    return dragState.type === 'bendPoint' ? dragState : null;
  }, [dragState]);

  /**
   * Get dragging block data if currently dragging a block
   */
  const getDraggingBlock = useCallback((): { blockId: string; offsetX: number; offsetY: number } | null => {
    return dragState.type === 'block' ? dragState : null;
  }, [dragState]);

  /**
   * Get the in-progress multi-block drag, if any.
   */
  const getDraggingMultiBlock = useCallback(() => {
    return dragState.type === 'multiBlock' ? dragState : null;
  }, [dragState]);

  /**
   * Get dragging bus converge data if currently dragging a bus convergence handle
   */
  const getDraggingBusConverge = useCallback((): { wireId: string; isStart: boolean } | null => {
    return dragState.type === 'busConverge' ? dragState : null;
  }, [dragState]);

  /**
   * Get dragging wire label data if currently dragging a wire label
   */
  const getDraggingWireLabel = useCallback((): { wireId: string; startX: number; startY: number } | null => {
    return dragState.type === 'wireLabel' ? dragState : null;
  }, [dragState]);

  /**
   * Get dragging connection label data if currently dragging a connection label
   */
  const getDraggingConnectionLabel = useCallback((): { blockId: string; pointId: string; startX: number; startY: number; originalOffsetX: number; originalOffsetY: number } | null => {
    return dragState.type === 'connectionLabel' ? dragState : null;
  }, [dragState]);

  /**
   * Get dragging block label data if currently dragging a block label
   */
  const getDraggingBlockLabel = useCallback((): { blockId: string; startX: number; startY: number; originalOffsetX: number; originalOffsetY: number } | null => {
    return dragState.type === 'blockLabel' ? dragState : null;
  }, [dragState]);

  return {
    dragState,
    startDragging,
    stopDragging,
    isDraggingType,
    isDraggingAny,
    getDraggingPoint,
    getDraggingBendPoint,
    getDraggingBlock,
    getDraggingMultiBlock,
    getDraggingBusConverge,
    getDraggingWireLabel,
    getDraggingConnectionLabel,
    getDraggingBlockLabel,
  };
}
