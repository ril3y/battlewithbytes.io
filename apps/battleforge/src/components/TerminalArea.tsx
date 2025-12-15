"use client";

import { TerminalPanel } from "./TerminalPanel";
import type { OutputMessage } from "../lib/hooks/useTerminalOutput";
import type { ResizingType } from "../lib/hooks/useResizablePanels";

interface TerminalAreaProps {
  height: number;
  isResizing: ResizingType;
  onResizeStart: (type: ResizingType, e: React.MouseEvent) => void;
  output: OutputMessage[];
}

export function TerminalArea({
  height,
  isResizing,
  onResizeStart,
  output,
}: TerminalAreaProps) {
  return (
    <div className="terminal-area" style={{ height }}>
      <div
        className={`resize-handle resize-handle-terminal ${isResizing === "terminal" ? "resizing" : ""}`}
        onMouseDown={(e) => onResizeStart("terminal", e)}
      />
      <TerminalPanel output={output} />

      <style jsx>{`
        .terminal-area {
          grid-area: terminal;
          background: #111;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .resize-handle {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: transparent;
          cursor: ns-resize;
          z-index: 10;
          transition: background 0.15s ease;
        }

        .resize-handle::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 3px;
          background: #444;
          border-radius: 2px;
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .resize-handle:hover {
          background: rgba(0, 136, 255, 0.2);
        }

        .resize-handle:hover::after {
          opacity: 1;
          background: #00ff9d;
        }

        .resize-handle.resizing {
          background: rgba(0, 255, 157, 0.2);
        }

        .resize-handle.resizing::after {
          opacity: 1;
          background: #00ff9d;
        }
      `}</style>
    </div>
  );
}
