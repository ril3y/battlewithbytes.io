"use client";

import { FileExplorer } from "./FileExplorer";
import type { ResizingType } from "../lib/hooks/useResizablePanels";

interface LeftSidebarProps {
  width: number;
  isResizing: ResizingType;
  onResizeStart: (type: ResizingType, e: React.MouseEvent) => void;
  onFileSelect: (path: string, content: string | Uint8Array) => void;
}

export function LeftSidebar({
  width,
  isResizing,
  onResizeStart,
  onFileSelect,
}: LeftSidebarProps) {
  return (
    <div className="sidebar-left" style={{ width }}>
      <FileExplorer onFileSelect={onFileSelect} />
      <div
        className={`resize-handle-h resize-handle-left ${isResizing === "left" ? "resizing" : ""}`}
        onMouseDown={(e) => onResizeStart("left", e)}
      />

      <style jsx>{`
        .sidebar-left {
          grid-area: sidebar-left;
          background: #111;
          overflow: hidden;
          position: relative;
        }

        .resize-handle-h {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 6px;
          background: transparent;
          cursor: ew-resize;
          z-index: 10;
          transition: background 0.15s ease;
        }

        .resize-handle-left {
          right: 0;
        }

        .resize-handle-h:hover {
          background: rgba(0, 136, 255, 0.3);
        }

        .resize-handle-h.resizing {
          background: rgba(0, 255, 157, 0.3);
        }
      `}</style>
    </div>
  );
}
