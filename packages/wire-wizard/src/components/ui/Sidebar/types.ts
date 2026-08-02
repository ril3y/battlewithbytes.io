/**
 * Type definitions for Sidebar components
 *
 * Refactored to use contexts for most state/actions.
 * Only props that are local to pages/index.tsx are passed as props.
 */

import type { Block, Wire, BlockShape, ConnectionPoint } from '../../../lib/core/types';

/**
 * Props that must be passed to Sidebar because they are NOT available from contexts:
 * - Local page state (editingPoint, addBlockMode, etc.)
 * - Functions defined in the page (saveToHistory, createBusGroup, etc.)
 */
export interface SidebarProps {
  // Local state - editing
  editingPoint: ConnectionPoint | null;
  setEditingPoint: (point: ConnectionPoint | null) => void;

  // Local state - add block mode (not used in Sidebar currently, but kept for future)
  addBlockMode?: boolean;
  newBlockShape?: BlockShape;
  setAddBlockMode?: (mode: boolean) => void;
  setNewBlockShape?: (shape: BlockShape) => void;

  // Page-level functions
  // saveToHistory, createBusGroup, etc. have been moved to context

}

/**
 * Props for BlockEditor - uses contexts for most state
 */
export interface BlockEditorProps {
  // Local state from page
  editingPoint: ConnectionPoint | null;
  setEditingPoint: (point: ConnectionPoint | null) => void;
}

/**
 * Props for WiresList - uses contexts for all state, so no props today.
 */
export type WiresListProps = Record<string, never>;
