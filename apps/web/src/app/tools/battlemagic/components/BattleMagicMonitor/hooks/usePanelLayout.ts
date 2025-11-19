/**
 * Panel Layout Hook
 *
 * Manages UI panel layout, visibility, and resize state
 */

import { useState, useRef, useCallback } from 'react';

export type RightPanelType =
  | 'debugger'
  | 'target'
  | 'flash'
  | 'extract'
  | 'breakpoints'
  | 'memorymap'
  | 'uart'
  | 'swo'
  | 'analysis'
  | 'xrefs'
  | 'firmware-dump'
  | 'vector-table'
  | 'chip-settings';

export interface PanelVisibility {
  console: boolean;
  registers: boolean;
  stack: boolean;
  memory: boolean;
}

export interface PanelLayoutState {
  // State
  activeRightPanel: RightPanelType;
  consoleWidth: number;
  isDragging: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  visiblePanels: PanelVisibility;

  // Setters
  setActiveRightPanel: (panel: RightPanelType) => void;
  setConsoleWidth: (width: number) => void;
  setIsDragging: (dragging: boolean) => void;
  setVisiblePanels: (panels: PanelVisibility | ((prev: PanelVisibility) => PanelVisibility)) => void;

  // Actions
  togglePanel: (panelName: keyof PanelVisibility) => void;
}

export function usePanelLayout(initialConsoleWidth: number = 25): PanelLayoutState {
  const [activeRightPanel, setActiveRightPanel] = useState<RightPanelType>('debugger');
  const [consoleWidth, setConsoleWidth] = useState(initialConsoleWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [visiblePanels, setVisiblePanels] = useState<PanelVisibility>({
    console: true,
    registers: true,
    stack: true,
    memory: true,
  });

  const togglePanel = useCallback((panelName: keyof PanelVisibility) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
  }, []);

  return {
    // State
    activeRightPanel,
    consoleWidth,
    isDragging,
    containerRef,
    visiblePanels,

    // Setters
    setActiveRightPanel,
    setConsoleWidth,
    setIsDragging,
    setVisiblePanels,

    // Actions
    togglePanel,
  };
}
