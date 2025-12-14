/**
 * BattleMagicMonitor Custom Hooks
 *
 * Extracted state management hooks from the main BattleMagicMonitor component
 * to improve modularity and testability.
 *
 * These hooks break down the 1648-line monolithic component into focused,
 * testable, and reusable state management modules.
 */

// Connection Management
export { useGdbConnection, type GdbConnectionState } from "./useGdbConnection";
export {
  useUartConnection,
  type UartConnectionState,
} from "./useUartConnection";

// UI State
export {
  usePanelLayout,
  type PanelLayoutState,
  type RightPanelType,
  type PanelVisibility,
} from "./usePanelLayout";

// Debug State
export { useDebugState, type DebugState } from "./useDebugState";

// Project Management
export {
  useProjectState,
  type ProjectState,
  type ProjectCallbacks,
} from "./useProjectState";

// Analysis State
export {
  useAnalysisState,
  type AnalysisState,
  type AnalysisProgress,
} from "./useAnalysisState";
