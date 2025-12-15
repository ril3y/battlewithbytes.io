/**
 * Hook for managing resizable panel dimensions
 *
 * Handles drag-to-resize functionality for terminal height and sidebar widths.
 */

import { useState, useCallback, useEffect, useRef, useMemo } from "react";

export type ResizingType = "terminal" | "left" | "right" | null;

interface PanelDimensions {
  terminalHeight: number;
  leftSidebarWidth: number;
  rightSidebarWidth: number;
}

interface ResizeConstraints {
  terminal: { min: number; max: number };
  left: { min: number; max: number };
  right: { min: number; max: number };
}

interface UseResizablePanelsOptions {
  initialDimensions?: Partial<PanelDimensions>;
  constraints?: Partial<ResizeConstraints>;
}

interface UseResizablePanelsReturn extends PanelDimensions {
  isResizing: ResizingType;
  handleResizeStart: (type: ResizingType, e: React.MouseEvent) => void;
}

const DEFAULT_DIMENSIONS: PanelDimensions = {
  terminalHeight: 200,
  leftSidebarWidth: 220,
  rightSidebarWidth: 280,
};

const DEFAULT_CONSTRAINTS: ResizeConstraints = {
  terminal: { min: 100, max: 600 },
  left: { min: 150, max: 400 },
  right: { min: 200, max: 450 },
};

export function useResizablePanels(
  options: UseResizablePanelsOptions = {}
): UseResizablePanelsReturn {
  const { initialDimensions = {}, constraints: customConstraints = {} } =
    options;

  const constraints: ResizeConstraints = useMemo(
    () => ({
      terminal: {
        ...DEFAULT_CONSTRAINTS.terminal,
        ...customConstraints.terminal,
      },
      left: { ...DEFAULT_CONSTRAINTS.left, ...customConstraints.left },
      right: { ...DEFAULT_CONSTRAINTS.right, ...customConstraints.right },
    }),
    [
      customConstraints.terminal,
      customConstraints.left,
      customConstraints.right,
    ]
  );

  const [terminalHeight, setTerminalHeight] = useState(
    initialDimensions.terminalHeight ?? DEFAULT_DIMENSIONS.terminalHeight
  );
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(
    initialDimensions.leftSidebarWidth ?? DEFAULT_DIMENSIONS.leftSidebarWidth
  );
  const [rightSidebarWidth, setRightSidebarWidth] = useState(
    initialDimensions.rightSidebarWidth ?? DEFAULT_DIMENSIONS.rightSidebarWidth
  );
  const [isResizing, setIsResizing] = useState<ResizingType>(null);

  const resizeStartPos = useRef(0);
  const resizeStartSize = useRef(0);

  const handleResizeStart = useCallback(
    (type: ResizingType, e: React.MouseEvent) => {
      if (!type) return;
      e.preventDefault();
      setIsResizing(type);

      if (type === "terminal") {
        resizeStartPos.current = e.clientY;
        resizeStartSize.current = terminalHeight;
      } else if (type === "left") {
        resizeStartPos.current = e.clientX;
        resizeStartSize.current = leftSidebarWidth;
      } else {
        resizeStartPos.current = e.clientX;
        resizeStartSize.current = rightSidebarWidth;
      }
    },
    [terminalHeight, leftSidebarWidth, rightSidebarWidth]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing === "terminal") {
        const deltaY = resizeStartPos.current - e.clientY;
        const newHeight = Math.max(
          constraints.terminal.min,
          Math.min(constraints.terminal.max, resizeStartSize.current + deltaY)
        );
        setTerminalHeight(newHeight);
      } else if (isResizing === "left") {
        const deltaX = e.clientX - resizeStartPos.current;
        const newWidth = Math.max(
          constraints.left.min,
          Math.min(constraints.left.max, resizeStartSize.current + deltaX)
        );
        setLeftSidebarWidth(newWidth);
      } else if (isResizing === "right") {
        const deltaX = resizeStartPos.current - e.clientX;
        const newWidth = Math.max(
          constraints.right.min,
          Math.min(constraints.right.max, resizeStartSize.current + deltaX)
        );
        setRightSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, constraints]);

  return {
    terminalHeight,
    leftSidebarWidth,
    rightSidebarWidth,
    isResizing,
    handleResizeStart,
  };
}
