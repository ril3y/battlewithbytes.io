import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * SelectionContext - Manages selection state using discriminated union
 *
 * Replaces 6 individual useState calls:
 * - selectedBlockId
 * - selectedBlockLabelId
 * - selectedPointId
 * - selectedWireId
 * - selectedWireIds (multi-select)
 * - selectedWireLabelId
 */

// Discriminated union for type-safe selection state
export type SelectionState =
  | { type: 'none' }
  | { type: 'block'; blockId: string }
  | { type: 'blockLabel'; blockId: string }
  | { type: 'point'; blockId: string; pointId: string }
  | { type: 'wire'; wireId: string }
  | { type: 'wires'; wireIds: string[] }  // Multi-select for bus creation
  | { type: 'wireLabel'; wireId: string }
  | { type: 'multi'; blockIds: string[]; wireIds: string[] };  // Marquee multi-select

interface SelectionContextValue {
  selection: SelectionState;

  // Selection actions
  selectBlock: (blockId: string) => void;
  selectBlockLabel: (blockId: string) => void;
  selectPoint: (blockId: string, pointId: string) => void;
  selectWire: (wireId: string) => void;
  selectWireLabel: (wireId: string) => void;
  clearSelection: () => void;

  // Multi-select for bus creation
  toggleWireSelection: (wireId: string) => void;
  setSelectedWireIds: (wireIds: string[]) => void;

  // Marquee multi-select (blocks + wires together)
  selectMulti: (blockIds: string[], wireIds?: string[]) => void;
  toggleBlockInMulti: (blockId: string) => void;

  // Type guards for convenience
  isBlockSelected: (blockId: string) => boolean;
  isPointSelected: (blockId: string, pointId: string) => boolean;
  isWireSelected: (wireId: string) => boolean;
  isWireInMultiSelect: (wireId: string) => boolean;
  isBlockInMultiSelect: (blockId: string) => boolean;

  // Legacy getters for backward compatibility during migration
  selectedBlockId: string | null;
  selectedBlockLabelId: string | null;
  selectedPointId: string | null;
  selectedWireId: string | null;
  selectedWireIds: string[];
  selectedBlockIds: string[];
  selectedWireLabelId: string | null;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

interface SelectionProviderProps {
  children: ReactNode;
}

export function SelectionProvider({ children }: SelectionProviderProps) {
  const [selection, setSelection] = useState<SelectionState>({ type: 'none' });

  // Selection actions
  const selectBlock = useCallback((blockId: string) => {
    setSelection({ type: 'block', blockId });
  }, []);

  const selectBlockLabel = useCallback((blockId: string) => {
    setSelection({ type: 'blockLabel', blockId });
  }, []);

  const selectPoint = useCallback((blockId: string, pointId: string) => {
    setSelection({ type: 'point', blockId, pointId });
  }, []);

  const selectWire = useCallback((wireId: string) => {
    setSelection({ type: 'wire', wireId });
  }, []);

  const selectWireLabel = useCallback((wireId: string) => {
    setSelection({ type: 'wireLabel', wireId });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({ type: 'none' });
  }, []);

  // Multi-select for bus creation
  const toggleWireSelection = useCallback((wireId: string) => {
    setSelection(prev => {
      if (prev.type === 'wires') {
        const wireIds = prev.wireIds.includes(wireId)
          ? prev.wireIds.filter(id => id !== wireId)
          : [...prev.wireIds, wireId];
        return wireIds.length > 0
          ? { type: 'wires', wireIds }
          : { type: 'none' };
      }
      // Start multi-select from scratch
      return { type: 'wires', wireIds: [wireId] };
    });
  }, []);

  const setSelectedWireIds = useCallback((wireIds: string[]) => {
    if (wireIds.length === 0) {
      setSelection({ type: 'none' });
    } else {
      setSelection({ type: 'wires', wireIds });
    }
  }, []);

  // Marquee multi-select (blocks + wires)
  const selectMulti = useCallback((blockIds: string[], wireIds: string[] = []) => {
    if (blockIds.length === 0 && wireIds.length === 0) {
      setSelection({ type: 'none' });
    } else if (blockIds.length === 1 && wireIds.length === 0) {
      setSelection({ type: 'block', blockId: blockIds[0] });
    } else if (blockIds.length === 0 && wireIds.length === 1) {
      setSelection({ type: 'wire', wireId: wireIds[0] });
    } else {
      setSelection({ type: 'multi', blockIds, wireIds });
    }
  }, []);

  const toggleBlockInMulti = useCallback((blockId: string) => {
    setSelection((prev) => {
      // Promote a single-block selection to multi when toggled.
      if (prev.type === 'block') {
        return prev.blockId === blockId
          ? { type: 'none' }
          : { type: 'multi', blockIds: [prev.blockId, blockId], wireIds: [] };
      }
      if (prev.type === 'multi') {
        const has = prev.blockIds.includes(blockId);
        const blockIds = has ? prev.blockIds.filter((id) => id !== blockId) : [...prev.blockIds, blockId];
        if (blockIds.length === 0 && prev.wireIds.length === 0) return { type: 'none' };
        if (blockIds.length === 1 && prev.wireIds.length === 0) return { type: 'block', blockId: blockIds[0] };
        return { type: 'multi', blockIds, wireIds: prev.wireIds };
      }
      // No prior block selection — start with this one.
      return { type: 'block', blockId };
    });
  }, []);

  // Type guards
  const isBlockSelected = useCallback((blockId: string): boolean => {
    return (
      (selection.type === 'block' && selection.blockId === blockId) ||
      (selection.type === 'blockLabel' && selection.blockId === blockId) ||
      (selection.type === 'point' && selection.blockId === blockId) ||
      (selection.type === 'multi' && selection.blockIds.includes(blockId))
    );
  }, [selection]);

  const isBlockInMultiSelect = useCallback((blockId: string): boolean => {
    return selection.type === 'multi' && selection.blockIds.includes(blockId);
  }, [selection]);

  const isPointSelected = useCallback((blockId: string, pointId: string): boolean => {
    return selection.type === 'point' &&
      selection.blockId === blockId &&
      selection.pointId === pointId;
  }, [selection]);

  const isWireSelected = useCallback((wireId: string): boolean => {
    return (
      (selection.type === 'wire' && selection.wireId === wireId) ||
      (selection.type === 'wireLabel' && selection.wireId === wireId)
    );
  }, [selection]);

  const isWireInMultiSelect = useCallback((wireId: string): boolean => {
    return (
      (selection.type === 'wires' && selection.wireIds.includes(wireId)) ||
      (selection.type === 'multi' && selection.wireIds.includes(wireId))
    );
  }, [selection]);

  // Legacy getters for backward compatibility
  const selectedBlockId = (selection.type === 'block' || selection.type === 'blockLabel' || selection.type === 'point')
    ? selection.blockId
    : null;

  const selectedBlockLabelId = selection.type === 'blockLabel'
    ? selection.blockId
    : null;

  const selectedPointId = selection.type === 'point'
    ? selection.pointId
    : null;

  const selectedWireId = (selection.type === 'wire' || selection.type === 'wireLabel')
    ? selection.wireId
    : null;

  const selectedWireIds = selection.type === 'wires'
    ? selection.wireIds
    : selection.type === 'multi'
      ? selection.wireIds
      : [];

  const selectedBlockIds = selection.type === 'multi'
    ? selection.blockIds
    : selection.type === 'block' || selection.type === 'blockLabel' || selection.type === 'point'
      ? [selection.blockId]
      : [];

  const selectedWireLabelId = selection.type === 'wireLabel'
    ? selection.wireId
    : null;

  const value: SelectionContextValue = {
    selection,
    selectBlock,
    selectBlockLabel,
    selectPoint,
    selectWire,
    selectWireLabel,
    clearSelection,
    toggleWireSelection,
    setSelectedWireIds,
    selectMulti,
    toggleBlockInMulti,
    isBlockSelected,
    isPointSelected,
    isWireSelected,
    isWireInMultiSelect,
    isBlockInMultiSelect,
    // Legacy getters
    selectedBlockId,
    selectedBlockLabelId,
    selectedPointId,
    selectedWireId,
    selectedWireIds,
    selectedBlockIds,
    selectedWireLabelId,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextValue {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}
