"use client";

import { ReactNode } from "react";

interface IDELayoutProps {
  leftSidebarWidth: number;
  rightSidebarWidth: number;
  children: ReactNode;
}

export function IDELayout({
  leftSidebarWidth,
  rightSidebarWidth,
  children,
}: IDELayoutProps) {
  return (
    <div className="battleforge-ide">
      <div
        className="ide-layout"
        style={{
          gridTemplateColumns: `${leftSidebarWidth}px 1fr ${rightSidebarWidth}px`,
        }}
      >
        {children}
      </div>

      <style jsx>{`
        .battleforge-ide {
          height: 100vh;
          background: #0a0a0a;
          color: #ededed;
          overflow: hidden;
        }

        .ide-layout {
          display: grid;
          grid-template-columns: 220px 1fr 280px;
          grid-template-rows: auto 1fr auto;
          grid-template-areas:
            "toolbar toolbar toolbar"
            "sidebar-left editor sidebar-right"
            "sidebar-left terminal sidebar-right";
          height: 100%;
          gap: 1px;
          background: #333;
        }

        /* Responsive adjustments */
        @media (max-width: 1200px) {
          .ide-layout {
            grid-template-columns: 180px 1fr 240px;
          }
        }

        @media (max-width: 900px) {
          .ide-layout {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr 200px;
            grid-template-areas:
              "toolbar"
              "sidebar-right"
              "editor"
              "terminal";
          }
        }
      `}</style>
    </div>
  );
}

// Toolbar wrapper component
export function ToolbarArea({ children }: { children: ReactNode }) {
  return (
    <div className="toolbar-area">
      {children}
      <style jsx>{`
        .toolbar-area {
          grid-area: toolbar;
          background: #111;
        }
      `}</style>
    </div>
  );
}
