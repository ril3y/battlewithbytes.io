"use client";

import { useState, useCallback } from "react";
import { PlatformCard } from "./PlatformCard";
import { ToolchainStatus } from "./ToolchainStatus";
import { LibraryPanel } from "./LibraryPanel";
import { WasmManagerPanel } from "./WasmManagerPanel";
import type { SelectedPlatform, ToolchainState } from "../lib/platform/types";
import type { ResizingType } from "../lib/hooks/useResizablePanels";

export type RightSidebarTab = "platform" | "libraries" | "toolchains";

interface ProjectPlatform {
  platformId: string;
  familyId: string;
  deviceId: string;
  architecture?: string;
}

interface RightSidebarProps {
  width: number;
  isResizing: ResizingType;
  onResizeStart: (type: ResizingType, e: React.MouseEvent) => void;

  // Platform tab
  selectedPlatform: SelectedPlatform | null;
  projectPlatform?: ProjectPlatform | null;
  toolchainState: ToolchainState;
  onPlatformClick: () => void;

  // Libraries tab
  onLog: (message: string, type?: "info" | "success" | "error" | "warning") => void;
  onLibraryFilesChanged: (files: Map<string, Uint8Array>) => void;
  onLibraryUninstalled: (name: string) => void;

  // External tab control (optional)
  activeTab?: RightSidebarTab;
  onTabChange?: (tab: RightSidebarTab) => void;
}

export function RightSidebar({
  width,
  isResizing,
  onResizeStart,
  selectedPlatform,
  projectPlatform,
  toolchainState,
  onPlatformClick,
  onLog,
  onLibraryFilesChanged,
  onLibraryUninstalled,
  activeTab: externalActiveTab,
  onTabChange,
}: RightSidebarProps) {
  const [internalTab, setInternalTab] = useState<RightSidebarTab>("platform");

  // Use external control if provided, otherwise use internal state
  const activeTab = externalActiveTab ?? internalTab;
  const handleTabChange = useCallback(
    (tab: RightSidebarTab) => {
      if (onTabChange) {
        onTabChange(tab);
      } else {
        setInternalTab(tab);
      }
    },
    [onTabChange]
  );

  return (
    <div className="sidebar-right" style={{ width }}>
      <div
        className={`resize-handle-h resize-handle-right ${isResizing === "right" ? "resizing" : ""}`}
        onMouseDown={(e) => onResizeStart("right", e)}
      />

      {/* Sidebar Tabs */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === "platform" ? "active" : ""}`}
          onClick={() => handleTabChange("platform")}
        >
          Platform
        </button>
        <button
          className={`sidebar-tab ${activeTab === "libraries" ? "active" : ""}`}
          onClick={() => handleTabChange("libraries")}
        >
          Libraries
        </button>
        <button
          className={`sidebar-tab ${activeTab === "toolchains" ? "active" : ""}`}
          onClick={() => handleTabChange("toolchains")}
        >
          Toolchains
        </button>
      </div>

      {/* Platform Tab Content */}
      {activeTab === "platform" && (
        <>
          <PlatformCard
            selectedPlatform={selectedPlatform}
            projectPlatform={projectPlatform}
            onClick={onPlatformClick}
          />
          <ToolchainStatus state={toolchainState} />
        </>
      )}

      {/* Libraries Tab Content */}
      {activeTab === "libraries" && (
        <div className="library-panel-container">
          <LibraryPanel
            platformId={
              selectedPlatform?.platformId as
                | "stm32"
                | "esp32"
                | "nrf"
                | "rp2040"
                | undefined
            }
            architecture={
              selectedPlatform?.family.architecture as
                | "cortex-m0"
                | "cortex-m0+"
                | "cortex-m3"
                | "cortex-m4"
                | "cortex-m4f"
                | "cortex-m7"
                | "cortex-m7f"
                | undefined
            }
            onLog={onLog}
            onLibraryFilesChanged={onLibraryFilesChanged}
            onLibraryUninstalled={onLibraryUninstalled}
          />
        </div>
      )}

      {/* Toolchains Tab Content */}
      {activeTab === "toolchains" && (
        <div className="library-panel-container">
          <WasmManagerPanel onLog={onLog} />
        </div>
      )}

      <style jsx>{`
        .sidebar-right {
          grid-area: sidebar-right;
          background: #111;
          padding: 12px;
          padding-top: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
        }

        .sidebar-tabs {
          display: flex;
          gap: 4px;
          padding: 8px 0;
          border-bottom: 1px solid #333;
          margin-bottom: 4px;
          position: sticky;
          top: 0;
          background: #111;
          z-index: 5;
        }

        .sidebar-tab {
          flex: 1;
          padding: 8px 12px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 4px;
          color: #888;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sidebar-tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ccc;
        }

        .sidebar-tab.active {
          background: rgba(0, 255, 157, 0.1);
          border-color: rgba(0, 255, 157, 0.3);
          color: #00ff9d;
        }

        .library-panel-container {
          flex: 1;
          min-height: 0;
          margin: -12px;
          margin-top: 0;
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

        .resize-handle-right {
          left: 0;
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
