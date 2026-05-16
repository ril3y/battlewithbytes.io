import { useEffect, useCallback } from 'react';
import type { Block, Wire } from '../core/types';

interface KeyboardShortcutsConfig {
  // Selection state
  selectedBlockId: string | null;
  selectedBlockIds: string[];
  selectedPointId: string | null;
  selectedBlockLabelId: string | null;
  selectedWireId: string | null;
  selectedWireIds: string[];
  selectedWireLabelId: string | null;

  // Data
  blocks: Block[];
  wires: Wire[];

  // Actions
  setBlocks: (blocks: Block[]) => void;
  setWires: (wires: Wire[]) => void;
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Cancel/close actions
  onEscape: () => void;
  clearSelection: () => void;
}

/**
 * Custom hook for handling keyboard shortcuts in the wiring diagram editor.
 *
 * Shortcuts:
 * - ESC: Cancel current operation, close modals
 * - R: Rotate selected element (wire label, connection point, block label, or block)
 * - Ctrl+Z: Undo
 * - Ctrl+Shift+Z / Ctrl+Y: Redo
 */
export function useKeyboardShortcuts({
  selectedBlockId,
  selectedBlockIds,
  selectedPointId,
  selectedBlockLabelId,
  selectedWireId,
  selectedWireIds,
  selectedWireLabelId,
  blocks,
  wires,
  setBlocks,
  setWires,
  saveToHistory,
  undo,
  redo,
  onEscape,
  clearSelection,
}: KeyboardShortcutsConfig): void {

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // ESC to close/cancel
    if (e.key === 'Escape') {
      onEscape();
      return;
    }

    // Only ignore shortcuts when cursor is actually in a text field
    const target = e.target as HTMLElement;
    const isEditingText = (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
      target === document.activeElement &&
      (target as HTMLInputElement).selectionStart !== null;

    if (isEditingText) {
      return;
    }

    // R key: Rotate selected wire label by 90 degrees
    if ((e.key === 'r' || e.key === 'R') && selectedWireLabelId && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      setWires(wires.map(w =>
        w.id === selectedWireLabelId
          ? { ...w, netNameRotation: ((w.netNameRotation || 0) + 90) % 360 }
          : w
      ));
      saveToHistory();
      return;
    }

    // R key: Rotate selected connection point label by 90 degrees
    if ((e.key === 'r' || e.key === 'R') && selectedPointId && selectedBlockId && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      setBlocks(blocks.map(b =>
        b.id === selectedBlockId
          ? {
            ...b,
            connectionPoints: b.connectionPoints.map(p =>
              p.id === selectedPointId
                ? { ...p, labelRotation: ((p.labelRotation || 0) + 90) % 360 }
                : p
            )
          }
          : b
      ));
      saveToHistory();
      return;
    }

    // R key: Rotate selected block label by 90 degrees
    if ((e.key === 'r' || e.key === 'R') && selectedBlockLabelId && !selectedPointId && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      setBlocks(blocks.map(b =>
        b.id === selectedBlockLabelId
          ? { ...b, labelRotation: ((b.labelRotation || 0) + 90) % 360 }
          : b
      ));
      saveToHistory();
      return;
    }

    // R key: Rotate selected BLOCK by 90 degrees
    if ((e.key === 'r' || e.key === 'R') && selectedBlockId && !selectedPointId && !selectedBlockLabelId && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      setBlocks(blocks.map(b =>
        b.id === selectedBlockId
          ? { ...b, rotation: ((b.rotation || 0) + 90) % 360 }
          : b
      ));
      saveToHistory();
      return;
    }

    // Delete / Backspace: remove the current selection (blocks and/or wires).
    // Selecting a block also removes wires connected to it, otherwise the
    // diagram would have orphaned dangling endpoints.
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const blockIdsToDelete = new Set<string>();
      if (selectedBlockIds.length > 0) {
        selectedBlockIds.forEach((id) => blockIdsToDelete.add(id));
      } else if (selectedBlockId) {
        blockIdsToDelete.add(selectedBlockId);
      }

      const wireIdsToDelete = new Set<string>();
      if (selectedWireIds.length > 0) {
        selectedWireIds.forEach((id) => wireIdsToDelete.add(id));
      } else if (selectedWireId) {
        wireIdsToDelete.add(selectedWireId);
      }

      if (blockIdsToDelete.size === 0 && wireIdsToDelete.size === 0) return;

      e.preventDefault();

      // Cascade: any wire touching a deleted block also gets deleted.
      if (blockIdsToDelete.size > 0) {
        for (const w of wires) {
          if ((w.fromBlockId && blockIdsToDelete.has(w.fromBlockId)) ||
              (w.toBlockId && blockIdsToDelete.has(w.toBlockId))) {
            wireIdsToDelete.add(w.id);
          }
        }
      }

      setWires(wires.filter((w) => !wireIdsToDelete.has(w.id)));
      if (blockIdsToDelete.size > 0) {
        setBlocks(blocks.filter((b) => !blockIdsToDelete.has(b.id)));
      }
      clearSelection();
      saveToHistory();
      return;
    }

    // Undo: Ctrl+Z
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }

    // Redo: Ctrl+Shift+Z or Ctrl+Y
    if ((e.ctrlKey && e.shiftKey && e.key === 'Z') || (e.ctrlKey && e.key === 'y')) {
      e.preventDefault();
      redo();
      return;
    }
  }, [
    selectedBlockId,
    selectedBlockIds,
    selectedPointId,
    selectedBlockLabelId,
    selectedWireId,
    selectedWireIds,
    selectedWireLabelId,
    blocks,
    wires,
    setBlocks,
    setWires,
    saveToHistory,
    undo,
    redo,
    onEscape,
    clearSelection,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
