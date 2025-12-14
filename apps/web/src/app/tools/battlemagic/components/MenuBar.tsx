"use client";

/**
 * MenuBar Component
 *
 * Professional menu bar with File, View, Debug, Tools, Help menus
 * IDA Pro / VS Code-inspired design with streamlined layout
 */

import React, { useState, useRef, useEffect } from "react";
import { ConnectionState } from "../lib/gdb/types";

interface MenuBarProps {
  onNewProject?: () => void;
  onSaveProject?: () => void;
  onExportProject?: () => void;
  onLoadProject?: (file: File) => void;
  onDisconnect?: () => void;
  onViewToggle?: (view: string) => void;
  onToolSelect?: (tool: string) => void;
  activeView?: string;
  isConnected?: boolean;
  isAttached?: boolean;
  visiblePanels?: {
    console: boolean;
    registers: boolean;
    stack: boolean;
    memory: boolean;
  };
  onPanelToggle?: (panel: "registers" | "stack" | "memory" | "console") => void;
  onExportDatabase?: () => void;
  onImportDatabase?: (file: File) => void;
  onReAnalyze?: () => void;
  gdbState?: ConnectionState;
  uartConnected?: boolean;
  onConnectGdb?: () => void;
  onDisconnectGdb?: () => void;
  onConnectUart?: () => void;
  onDisconnectUart?: () => void;
  hasCachedFirmware?: boolean;
}

type MenuKey = "file" | "view" | "debug" | "tools" | "help" | null;

export default function MenuBar({
  onNewProject,
  onSaveProject,
  onExportProject,
  onLoadProject,
  onDisconnect,
  onViewToggle,
  onToolSelect,
  activeView = "debugger",
  isConnected = false,
  isAttached = false,
  visiblePanels = { console: true, registers: true, stack: true, memory: true },
  onPanelToggle,
  onExportDatabase,
  onImportDatabase,
  onReAnalyze,
  gdbState = ConnectionState.DISCONNECTED,
  uartConnected = false,
  onConnectGdb,
  onDisconnectGdb,
  onConnectUart,
  onDisconnectUart,
  hasCachedFirmware = false,
}: MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  const handleMenuClick = (menu: MenuKey) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setOpenMenu(null);
  };

  const handleFileInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && onLoadProject) {
      onLoadProject(file);
    }
    setOpenMenu(null);
  };

  // Helper to get connection status indicator
  const getStatusColor = (state: ConnectionState) => {
    switch (state) {
      case ConnectionState.CONNECTED:
      case ConnectionState.ATTACHED:
        return "text-green-500";
      case ConnectionState.CONNECTING:
        return "text-amber-500";
      default:
        return "text-gray-500";
    }
  };

  const getUartStatusColor = () => {
    return uartConnected ? "text-green-500" : "text-gray-500";
  };

  return (
    <div
      ref={menuRef}
      className="bg-gray-900 border-b border-gray-700 flex items-center text-sm font-mono relative z-50 h-12 px-2"
    >
      {/* Title */}
      <div className="flex items-center mr-2">
        <span className="text-gray-200 font-semibold text-base">
          BattleMagic
        </span>
      </div>

      {/* Menu Items */}
      <div className="flex items-center">
        {/* File Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick("file")}
            className={`px-3 h-12 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-0 outline-none ${
              openMenu === "file" ? "bg-gray-800 text-white" : ""
            }`}
          >
            File
          </button>
          {openMenu === "file" && (
            <div className="absolute top-full left-0 bg-gray-800 border border-gray-700 shadow-lg min-w-[200px] py-1">
              <button
                onClick={() => handleMenuItemClick(() => onNewProject?.())}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 flex justify-between items-center"
              >
                <span>New Project</span>
                <span className="text-gray-500 text-xs">Ctrl+N</span>
              </button>
              <button
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".bmproj";
                  input.onchange = handleFileInputChange;
                  input.click();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 flex justify-between items-center"
              >
                <span>Load Project</span>
                <span className="text-gray-500 text-xs">Ctrl+O</span>
              </button>
              <button
                onClick={() => handleMenuItemClick(() => onSaveProject?.())}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 flex justify-between items-center"
              >
                <span>Save Project</span>
                <span className="text-gray-500 text-xs">Ctrl+S</span>
              </button>
              <button
                onClick={() => handleMenuItemClick(() => onExportProject?.())}
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Export Project (.bmproj)
              </button>
              <div className="border-t border-gray-700 my-1" />
              <button
                onClick={() => handleMenuItemClick(() => onExportDatabase?.())}
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Export Analysis (.mdb)
              </button>
              <button
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".mdb";
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    const file = target.files?.[0];
                    if (file && onImportDatabase) {
                      onImportDatabase(file);
                    }
                    setOpenMenu(null);
                  };
                  input.click();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Import Analysis (.mdb)
              </button>
              <div className="border-t border-gray-700 my-1" />
              <button
                onClick={() => handleMenuItemClick(() => onDisconnect?.())}
                disabled={!isConnected}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Disconnect
              </button>
              <div className="border-t border-gray-700 my-1" />
              <button
                onClick={() =>
                  handleMenuItemClick(() => (window.location.href = "/tools"))
                }
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Exit to Tools
              </button>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick("view")}
            className={`px-3 h-12 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-0 outline-none ${
              openMenu === "view" ? "bg-gray-800 text-white" : ""
            }`}
          >
            View
          </button>
          {openMenu === "view" && (
            <div className="absolute top-full left-0 bg-gray-800 border border-gray-700 shadow-lg min-w-[200px] py-1">
              <button
                onClick={() =>
                  handleMenuItemClick(() => onViewToggle?.("debugger"))
                }
                className={`w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 ${
                  activeView === "debugger" ? "text-green-400" : ""
                }`}
              >
                <span>{activeView === "debugger" ? "✓" : " "}</span>
                <span>Debugger View</span>
              </button>
              <button
                onClick={() =>
                  handleMenuItemClick(() => onViewToggle?.("memory"))
                }
                className={`w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 ${
                  activeView === "memory" ? "text-green-400" : ""
                }`}
              >
                <span>{activeView === "memory" ? "✓" : " "}</span>
                <span>Memory View</span>
              </button>
              <button
                onClick={() =>
                  handleMenuItemClick(() => onViewToggle?.("analysis"))
                }
                className={`w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 ${
                  activeView === "analysis" ? "text-green-400" : ""
                }`}
              >
                <span>{activeView === "analysis" ? "✓" : " "}</span>
                <span>Analysis</span>
              </button>
              <button
                onClick={() =>
                  handleMenuItemClick(() => onViewToggle?.("vector-table"))
                }
                className={`w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 ${
                  activeView === "vector-table" ? "text-green-400" : ""
                }`}
              >
                <span>{activeView === "vector-table" ? "✓" : " "}</span>
                <span>Vector Table</span>
              </button>
              <div className="border-t border-gray-700 my-1" />
              <div className="px-4 py-1 text-xs text-gray-500">Panels</div>
              <button
                onClick={() =>
                  handleMenuItemClick(() => onPanelToggle?.("console"))
                }
                className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
              >
                <span>{visiblePanels.console ? "☑" : "☐"}</span>
                <span>Console</span>
              </button>
              <button
                onClick={() =>
                  handleMenuItemClick(() => onPanelToggle?.("registers"))
                }
                className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
              >
                <span>{visiblePanels.registers ? "☑" : "☐"}</span>
                <span>Registers</span>
              </button>
              <button
                onClick={() =>
                  handleMenuItemClick(() => onPanelToggle?.("stack"))
                }
                className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
              >
                <span>{visiblePanels.stack ? "☑" : "☐"}</span>
                <span>Stack</span>
              </button>
              <button
                onClick={() =>
                  handleMenuItemClick(() => onPanelToggle?.("memory"))
                }
                className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
              >
                <span>{visiblePanels.memory ? "☑" : "☐"}</span>
                <span>Memory</span>
              </button>
            </div>
          )}
        </div>

        {/* Debug Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick("debug")}
            className={`px-3 h-12 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-0 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
              openMenu === "debug" ? "bg-gray-800 text-white" : ""
            }`}
            disabled={!isAttached}
          >
            Debug
          </button>
          {openMenu === "debug" && (
            <div className="absolute top-full left-0 bg-gray-800 border border-gray-700 shadow-lg min-w-[200px] py-1">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-700 flex justify-between items-center">
                <span>Continue</span>
                <span className="text-gray-500 text-xs">F5</span>
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-700 flex justify-between items-center">
                <span>Pause</span>
                <span className="text-gray-500 text-xs">F6</span>
              </button>
              <div className="border-t border-gray-700 my-1" />
              <button className="w-full text-left px-4 py-2 hover:bg-gray-700 flex justify-between items-center">
                <span>Step Into</span>
                <span className="text-gray-500 text-xs">F7</span>
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-700 flex justify-between items-center">
                <span>Step Over</span>
                <span className="text-gray-500 text-xs">F8</span>
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-700 flex justify-between items-center">
                <span>Step Out</span>
                <span className="text-gray-500 text-xs">F9</span>
              </button>
              <div className="border-t border-gray-700 my-1" />
              <button className="w-full text-left px-4 py-2 hover:bg-gray-700">
                Reset
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-700">
                Restart
              </button>
            </div>
          )}
        </div>

        {/* Tools Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick("tools")}
            className={`px-3 h-12 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-0 outline-none ${
              openMenu === "tools" ? "bg-gray-800 text-white" : ""
            }`}
          >
            Tools
          </button>
          {openMenu === "tools" && (
            <div className="absolute top-full left-0 bg-gray-800 border border-gray-700 shadow-lg min-w-[200px] py-1">
              <button
                onClick={() =>
                  handleMenuItemClick(() => onToolSelect?.("flash"))
                }
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Flash Programmer
              </button>
              <button
                onClick={() =>
                  handleMenuItemClick(() => onToolSelect?.("firmware-dump"))
                }
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Firmware Dump & Analysis
              </button>
              <button
                onClick={() =>
                  handleMenuItemClick(() => onToolSelect?.("memorymap"))
                }
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Memory Map Viewer
              </button>
              <div className="border-t border-gray-700 my-1" />
              <button
                onClick={() =>
                  handleMenuItemClick(() => onToolSelect?.("breakpoints"))
                }
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Breakpoints Manager
              </button>
              <button
                onClick={() => handleMenuItemClick(() => onToolSelect?.("swo"))}
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                SWO Viewer
              </button>
              <div className="border-t border-gray-700 my-1" />
              <button
                onClick={() =>
                  handleMenuItemClick(() => onToolSelect?.("analysis"))
                }
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Binary Analysis
              </button>
              <button
                onClick={() =>
                  handleMenuItemClick(() => onToolSelect?.("xrefs"))
                }
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Cross-References
              </button>
              <button
                onClick={() => handleMenuItemClick(() => onReAnalyze?.())}
                disabled={!hasCachedFirmware}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  hasCachedFirmware
                    ? "Re-analyze cached firmware (preserves comments and renames)"
                    : "No cached firmware available"
                }
              >
                Re-analyze Firmware
              </button>
              <div className="border-t border-gray-700 my-1" />
              <button
                onClick={() =>
                  handleMenuItemClick(() => onToolSelect?.("chip-settings"))
                }
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Chip Database
              </button>
            </div>
          )}
        </div>

        {/* Help Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick("help")}
            className={`px-3 h-12 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-0 outline-none ${
              openMenu === "help" ? "bg-gray-800 text-white" : ""
            }`}
          >
            Help
          </button>
          {openMenu === "help" && (
            <div className="absolute top-full left-0 bg-gray-800 border border-gray-700 shadow-lg min-w-[200px] py-1">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-700">
                Documentation
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-700">
                Keyboard Shortcuts
              </button>
              <div className="border-t border-gray-700 my-1" />
              <button className="w-full text-left px-4 py-2 hover:bg-gray-700">
                About BattleMagic
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Spacer - pushes connection controls to the right */}
      <div className="flex-1" />

      {/* Connection Controls */}
      <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
        {/* GDB Connection */}
        <button
          onClick={() => {
            if (gdbState === ConnectionState.DISCONNECTED) {
              onConnectGdb?.();
            } else {
              onDisconnectGdb?.();
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
          title={
            gdbState === ConnectionState.DISCONNECTED
              ? "Connect to GDB"
              : gdbState === ConnectionState.CONNECTING
                ? "Connecting to GDB..."
                : gdbState === ConnectionState.CONNECTED
                  ? "Connected to GDB"
                  : "Attached to target"
          }
        >
          <span className="text-gray-300 text-xs">GDB</span>
          <span className={`text-lg leading-none ${getStatusColor(gdbState)}`}>
            ●
          </span>
        </button>

        {/* UART Connection */}
        <button
          onClick={() => {
            if (uartConnected) {
              onDisconnectUart?.();
            } else {
              onConnectUart?.();
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
          title={uartConnected ? "UART Connected" : "Connect UART"}
        >
          <span className="text-gray-300 text-xs">UART</span>
          <span className={`text-lg leading-none ${getUartStatusColor()}`}>
            ●
          </span>
        </button>
      </div>
    </div>
  );
}
