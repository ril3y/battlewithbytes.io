import { useState, useCallback } from 'react';

/**
 * Discriminated union type for inline editing state.
 * Uses a type discriminator to ensure type safety and prevent invalid state combinations.
 */
export type InlineEditState =
  | { type: 'wire'; wireId: string; label: string }
  | { type: 'connection'; blockId: string; pointId: string; label: string }
  | { type: 'block'; blockId: string; label: string }
  | { type: 'none' };

/**
 * Hook return interface with state and control functions.
 */
export interface UseInlineEditingReturn {
  // Current editing state
  editState: InlineEditState;

  // Start editing functions
  startEditingWire: (wireId: string, label: string) => void;
  startEditingConnection: (blockId: string, pointId: string, label: string) => void;
  startEditingBlock: (blockId: string, label: string) => void;

  // Update and stop functions
  updateLabel: (newLabel: string) => void;
  stopEditing: () => void;

  // Getter functions for checking edit state
  isEditingWire: (wireId: string) => boolean;
  isEditingConnection: (blockId: string, pointId: string) => boolean;
  isEditingBlock: (blockId: string) => boolean;
}

/**
 * Custom hook for managing inline editing state across wires, connection points, and blocks.
 *
 * Consolidates 6 separate state variables into a single discriminated union for:
 * - Type safety: Impossible to have multiple edit modes active simultaneously
 * - Simpler state management: One setState call instead of multiple
 * - Better code organization: All editing logic in one place
 *
 * @example
 * ```tsx
 * const {
 *   editState,
 *   startEditingWire,
 *   updateLabel,
 *   stopEditing,
 *   isEditingWire
 * } = useInlineEditing();
 *
 * // Start editing a wire
 * const handleDoubleClick = () => {
 *   startEditingWire('wire-1', 'Current Label');
 * };
 *
 * // Check if a specific wire is being edited
 * if (isEditingWire('wire-1')) {
 *   // Render inline editor
 * }
 * ```
 */
export function useInlineEditing(): UseInlineEditingReturn {
  const [editState, setEditState] = useState<InlineEditState>({ type: 'none' });

  /**
   * Start editing a wire label.
   * @param wireId - The ID of the wire to edit
   * @param label - The current label value
   */
  const startEditingWire = useCallback((wireId: string, label: string) => {
    setEditState({ type: 'wire', wireId, label });
  }, []);

  /**
   * Start editing a connection point label.
   * @param blockId - The ID of the block containing the connection point
   * @param pointId - The ID of the connection point to edit
   * @param label - The current label value
   */
  const startEditingConnection = useCallback((blockId: string, pointId: string, label: string) => {
    setEditState({ type: 'connection', blockId, pointId, label });
  }, []);

  /**
   * Start editing a block label.
   * @param blockId - The ID of the block to edit
   * @param label - The current label value
   */
  const startEditingBlock = useCallback((blockId: string, label: string) => {
    setEditState({ type: 'block', blockId, label });
  }, []);

  /**
   * Update the label being edited.
   * Only updates if currently in an editing state (not 'none').
   * @param newLabel - The new label value
   */
  const updateLabel = useCallback((newLabel: string) => {
    setEditState((current) => {
      if (current.type === 'none') return current;
      return { ...current, label: newLabel };
    });
  }, []);

  /**
   * Stop editing and return to 'none' state.
   */
  const stopEditing = useCallback(() => {
    setEditState({ type: 'none' });
  }, []);

  /**
   * Check if a specific wire is currently being edited.
   * @param wireId - The wire ID to check
   * @returns true if this wire is being edited
   */
  const isEditingWire = useCallback((wireId: string): boolean => {
    return editState.type === 'wire' && editState.wireId === wireId;
  }, [editState]);

  /**
   * Check if a specific connection point is currently being edited.
   * @param blockId - The block ID to check
   * @param pointId - The connection point ID to check
   * @returns true if this connection point is being edited
   */
  const isEditingConnection = useCallback((blockId: string, pointId: string): boolean => {
    return (
      editState.type === 'connection' &&
      editState.blockId === blockId &&
      editState.pointId === pointId
    );
  }, [editState]);

  /**
   * Check if a specific block is currently being edited.
   * @param blockId - The block ID to check
   * @returns true if this block is being edited
   */
  const isEditingBlock = useCallback((blockId: string): boolean => {
    return editState.type === 'block' && editState.blockId === blockId;
  }, [editState]);

  return {
    editState,
    startEditingWire,
    startEditingConnection,
    startEditingBlock,
    updateLabel,
    stopEditing,
    isEditingWire,
    isEditingConnection,
    isEditingBlock
  };
}
