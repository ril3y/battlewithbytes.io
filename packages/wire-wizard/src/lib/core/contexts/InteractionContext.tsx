import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { ConnectionPoint, BlockShape } from '../types';

/**
 * InteractionContext - Manages transient UI interaction state
 *
 * Consolidates scattered useState calls for:
 * - Context menu state
 * - Bus operations UI state
 * - Block creation UI state
 * - Modal visibility
 * - Connection point editing
 * - Expanded bus wires
 */

// Context menu state
export interface ContextMenuState {
  x: number;
  y: number;
  wireId?: string;
  blockId?: string;
  isConfigurable?: boolean;
}

// Bus name editing state
export interface EditingBusNameState {
  busGroupId: string;
  currentName: string;
}

interface InteractionContextValue {
  // Context menu
  contextMenu: ContextMenuState | null;
  openContextMenu: (state: ContextMenuState) => void;
  closeContextMenu: () => void;

  // Bus operations UI
  isBusGroupMode: boolean;
  setBusGroupMode: (enabled: boolean) => void;
  addingToBusWireId: string | null;
  setAddingToBusWireId: (wireId: string | null) => void;
  editingBusName: EditingBusNameState | null;
  startEditingBusName: (busGroupId: string, currentName: string) => void;
  updateEditingBusName: (name: string) => void;
  stopEditingBusName: () => void;

  // Block creation UI
  addBlockMode: boolean;
  setAddBlockMode: (enabled: boolean) => void;
  newBlockShape: BlockShape;
  setNewBlockShape: (shape: BlockShape) => void;
  showBlockModal: boolean;
  openBlockModal: () => void;
  closeBlockModal: () => void;

  // Display settings modal
  showDisplaySettings: boolean;
  openDisplaySettings: () => void;
  closeDisplaySettings: () => void;

  // Component picker modal
  showComponentPicker: boolean;
  openComponentPicker: () => void;
  closeComponentPicker: () => void;

  // Bus-port pinout drill-in modal — keyed by the wire whose endpoint is a bus port
  pinoutWireId: string | null;
  openPinoutForWire: (wireId: string) => void;
  closePinout: () => void;

  // Connection point editing
  editingPoint: ConnectionPoint | null;
  setEditingPoint: (point: ConnectionPoint | null) => void;

  // Expanded bus wires (for showing individual wires in a bus)
  expandedBusWires: Set<string>;
  setExpandedBusWires: (wires: Set<string>) => void;
  toggleBusWireExpanded: (wireId: string) => void;
  setBusWireExpanded: (wireId: string, expanded: boolean) => void;

  // Connection point placement
  placementMode: boolean;
  targetBlockId: string | null;
  startPlacement: (blockId: string) => void;
  stopPlacement: () => void;

  // Reset all interaction state (e.g., on verify)
  resetAllInteractions: () => void;
}

const InteractionContext = createContext<InteractionContextValue | null>(null);

interface InteractionProviderProps {
  children: ReactNode;
}

export function InteractionProvider({ children }: InteractionProviderProps) {
  // Context menu
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Bus operations
  const [isBusGroupMode, setIsBusGroupMode] = useState(false);
  const [addingToBusWireId, setAddingToBusWireId] = useState<string | null>(null);
  const [editingBusName, setEditingBusName] = useState<EditingBusNameState | null>(null);

  // Block creation
  const [addBlockMode, setAddBlockMode] = useState(false);
  const [newBlockShape, setNewBlockShape] = useState<BlockShape>('rounded');
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Display settings
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);

  // Component picker
  const [showComponentPicker, setShowComponentPicker] = useState(false);

  // Bus-port pinout modal
  const [pinoutWireId, setPinoutWireId] = useState<string | null>(null);

  // Connection point editing
  const [editingPoint, setEditingPoint] = useState<ConnectionPoint | null>(null);

  // Connection point placement
  const [placementMode, setPlacementMode] = useState(false);
  const [targetBlockId, setTargetBlockId] = useState<string | null>(null);

  // Expanded bus wires
  const [expandedBusWires, setExpandedBusWiresState] = useState<Set<string>>(new Set());

  // Context menu actions
  const openContextMenu = useCallback((state: ContextMenuState) => {
    setContextMenu(state);
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Bus group mode
  const setBusGroupMode = useCallback((enabled: boolean) => {
    setIsBusGroupMode(enabled);
  }, []);

  // Bus name editing
  const startEditingBusName = useCallback((busGroupId: string, currentName: string) => {
    setEditingBusName({ busGroupId, currentName });
  }, []);

  const updateEditingBusName = useCallback((name: string) => {
    setEditingBusName(prev => prev ? { ...prev, currentName: name } : null);
  }, []);

  const stopEditingBusName = useCallback(() => {
    setEditingBusName(null);
  }, []);

  // Block modal
  const openBlockModal = useCallback(() => {
    setShowBlockModal(true);
  }, []);

  const closeBlockModal = useCallback(() => {
    setShowBlockModal(false);
  }, []);

  // Display settings modal
  const openDisplaySettings = useCallback(() => {
    setShowDisplaySettings(true);
  }, []);

  const closeDisplaySettings = useCallback(() => {
    setShowDisplaySettings(false);
  }, []);

  // Component picker modal
  const openComponentPicker = useCallback(() => {
    setShowComponentPicker(true);
  }, []);

  const closeComponentPicker = useCallback(() => {
    setShowComponentPicker(false);
  }, []);

  // Bus-port pinout modal
  const openPinoutForWire = useCallback((wireId: string) => {
    setPinoutWireId(wireId);
  }, []);
  const closePinout = useCallback(() => {
    setPinoutWireId(null);
  }, []);

  // Expanded bus wires
  const setExpandedBusWires = useCallback((wires: Set<string>) => {
    setExpandedBusWiresState(wires);
  }, []);

  const toggleBusWireExpanded = useCallback((wireId: string) => {
    setExpandedBusWiresState(prev => {
      const next = new Set(prev);
      if (next.has(wireId)) {
        next.delete(wireId);
      } else {
        next.add(wireId);
      }
      return next;
    });
  }, []);

  const setBusWireExpanded = useCallback((wireId: string, expanded: boolean) => {
    setExpandedBusWiresState(prev => {
      const next = new Set(prev);
      if (expanded) {
        next.add(wireId);
      } else {
        next.delete(wireId);
      }
      return next;
    });
  }, []);

  // Connection point placement
  const startPlacement = useCallback((blockId: string) => {
    setPlacementMode(true);
    setTargetBlockId(blockId);
  }, []);

  const stopPlacement = useCallback(() => {
    setPlacementMode(false);
    setTargetBlockId(null);
  }, []);

  // Reset all interactions (for Escape key, etc.)
  const resetAllInteractions = useCallback(() => {
    setContextMenu(null);
    setIsBusGroupMode(false);
    setAddingToBusWireId(null);
    setEditingBusName(null);
    setAddBlockMode(false);
    setShowBlockModal(false);
    setShowDisplaySettings(false);
    setShowComponentPicker(false);
    setEditingPoint(null);
    setPlacementMode(false);
    setTargetBlockId(null);
    setPinoutWireId(null);
    // Note: expandedBusWires is intentionally NOT reset - it's a persistent UI preference
  }, []);

  const value: InteractionContextValue = {
    // Context menu
    contextMenu,
    openContextMenu,
    closeContextMenu,

    // Bus operations
    isBusGroupMode,
    setBusGroupMode,
    addingToBusWireId,
    setAddingToBusWireId,
    editingBusName,
    startEditingBusName,
    updateEditingBusName,
    stopEditingBusName,

    // Block creation
    addBlockMode,
    setAddBlockMode,
    newBlockShape,
    setNewBlockShape,
    showBlockModal,
    openBlockModal,
    closeBlockModal,

    // Display settings
    showDisplaySettings,
    openDisplaySettings,
    closeDisplaySettings,

    // Component picker
    showComponentPicker,
    openComponentPicker,
    closeComponentPicker,

    // Bus-port pinout modal
    pinoutWireId,
    openPinoutForWire,
    closePinout,

    // Connection point editing
    editingPoint,
    setEditingPoint,

    // Expanded bus wires
    expandedBusWires,
    setExpandedBusWires,
    toggleBusWireExpanded,
    setBusWireExpanded,

    // Connection point placement
    placementMode,
    targetBlockId,
    startPlacement,
    stopPlacement,

    // Reset
    resetAllInteractions,
  };

  return (
    <InteractionContext.Provider value={value}>
      {children}
    </InteractionContext.Provider>
  );
}

export function useInteraction(): InteractionContextValue {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error('useInteraction must be used within an InteractionProvider');
  }
  return context;
}

// Convenience hooks for specific interaction domains
export function useContextMenu() {
  const { contextMenu, openContextMenu, closeContextMenu } = useInteraction();
  return { contextMenu, openContextMenu, closeContextMenu };
}

export function useBusInteraction() {
  const {
    isBusGroupMode,
    setBusGroupMode,
    addingToBusWireId,
    setAddingToBusWireId,
    editingBusName,
    startEditingBusName,
    updateEditingBusName,
    stopEditingBusName,
    expandedBusWires,
    setExpandedBusWires,
    toggleBusWireExpanded,
    setBusWireExpanded,
  } = useInteraction();
  return {
    isBusGroupMode,
    setBusGroupMode,
    addingToBusWireId,
    setAddingToBusWireId,
    editingBusName,
    startEditingBusName,
    updateEditingBusName,
    stopEditingBusName,
    expandedBusWires,
    setExpandedBusWires,
    toggleBusWireExpanded,
    setBusWireExpanded,
  };
}

export function useBlockCreation() {
  const {
    addBlockMode,
    setAddBlockMode,
    newBlockShape,
    setNewBlockShape,
    showBlockModal,
    openBlockModal,
    closeBlockModal,
  } = useInteraction();
  return {
    addBlockMode,
    setAddBlockMode,
    newBlockShape,
    setNewBlockShape,
    showBlockModal,
    openBlockModal,
    closeBlockModal,
  };
}
