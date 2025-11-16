'use client';

/**
 * MenuBar Component
 *
 * Professional menu bar with File, View, Debug, Tools, Help menus
 * IDA Pro-inspired design
 */

import React, { useState, useRef, useEffect } from 'react';

interface MenuBarProps {
  onNewProject?: () => void;
  onSaveProject?: () => void;
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
  onPanelToggle?: (panel: 'registers' | 'stack' | 'memory' | 'console') => void;
}

type MenuKey = 'file' | 'view' | 'debug' | 'tools' | 'help' | null;

export default function MenuBar({
  onNewProject,
  onSaveProject,
  onLoadProject,
  onDisconnect,
  onViewToggle,
  onToolSelect,
  activeView = 'debugger',
  isConnected = false,
  isAttached = false,
  visiblePanels = { console: true, registers: true, stack: true, memory: true },
  onPanelToggle,
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
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  return (
    <div ref={menuRef} className="bg-gray-900 border-b border-gray-700 flex items-center text-sm font-mono relative z-50 h-8">
      {/* File Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('file')}
          className={`px-3 h-8 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-0 outline-none ${
            openMenu === 'file' ? 'bg-gray-800 text-white' : ''
          }`}
        >
          File
        </button>
        {openMenu === 'file' && (
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
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.bmproj';
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
              onClick={() => handleMenuItemClick(() => window.location.href = '/tools')}
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
          onClick={() => handleMenuClick('view')}
          className={`px-3 h-8 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-0 outline-none ${
            openMenu === 'view' ? 'bg-gray-800 text-white' : ''
          }`}
        >
          View
        </button>
        {openMenu === 'view' && (
          <div className="absolute top-full left-0 bg-gray-800 border border-gray-700 shadow-lg min-w-[200px] py-1">
            <button
              onClick={() => handleMenuItemClick(() => onViewToggle?.('debugger'))}
              className={`w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 ${
                activeView === 'debugger' ? 'text-green-400' : ''
              }`}
            >
              <span>{activeView === 'debugger' ? '✓' : ' '}</span>
              <span>Debugger View</span>
            </button>
            <button
              onClick={() => handleMenuItemClick(() => onViewToggle?.('memory'))}
              className={`w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 ${
                activeView === 'memory' ? 'text-green-400' : ''
              }`}
            >
              <span>{activeView === 'memory' ? '✓' : ' '}</span>
              <span>Memory View</span>
            </button>
            <button
              onClick={() => handleMenuItemClick(() => onViewToggle?.('analysis'))}
              className={`w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 ${
                activeView === 'analysis' ? 'text-green-400' : ''
              }`}
            >
              <span>{activeView === 'analysis' ? '✓' : ' '}</span>
              <span>Analysis</span>
            </button>
            <div className="border-t border-gray-700 my-1" />
            <div className="px-4 py-1 text-xs text-gray-500">Panels</div>
            <button
              onClick={() => handleMenuItemClick(() => onPanelToggle?.('console'))}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
            >
              <span>{visiblePanels.console ? '☑' : '☐'}</span>
              <span>Console</span>
            </button>
            <button
              onClick={() => handleMenuItemClick(() => onPanelToggle?.('registers'))}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
            >
              <span>{visiblePanels.registers ? '☑' : '☐'}</span>
              <span>Registers</span>
            </button>
            <button
              onClick={() => handleMenuItemClick(() => onPanelToggle?.('stack'))}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
            >
              <span>{visiblePanels.stack ? '☑' : '☐'}</span>
              <span>Stack</span>
            </button>
            <button
              onClick={() => handleMenuItemClick(() => onPanelToggle?.('memory'))}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
            >
              <span>{visiblePanels.memory ? '☑' : '☐'}</span>
              <span>Memory</span>
            </button>
          </div>
        )}
      </div>

      {/* Debug Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('debug')}
          className={`px-3 h-8 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-0 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
            openMenu === 'debug' ? 'bg-gray-800 text-white' : ''
          }`}
          disabled={!isAttached}
        >
          Debug
        </button>
        {openMenu === 'debug' && (
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
          onClick={() => handleMenuClick('tools')}
          className={`px-3 h-8 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-0 outline-none ${
            openMenu === 'tools' ? 'bg-gray-800 text-white' : ''
          }`}
        >
          Tools
        </button>
        {openMenu === 'tools' && (
          <div className="absolute top-full left-0 bg-gray-800 border border-gray-700 shadow-lg min-w-[200px] py-1">
            <button
              onClick={() => handleMenuItemClick(() => onToolSelect?.('flash'))}
              className="w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Flash Programmer
            </button>
            <button
              onClick={() => handleMenuItemClick(() => onToolSelect?.('extract'))}
              className="w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Firmware Extractor
            </button>
            <button
              onClick={() => handleMenuItemClick(() => onToolSelect?.('firmware-dump'))}
              className="w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Firmware Dump & Analysis
            </button>
            <button
              onClick={() => handleMenuItemClick(() => onToolSelect?.('memorymap'))}
              className="w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Memory Map Viewer
            </button>
            <div className="border-t border-gray-700 my-1" />
            <button
              onClick={() => handleMenuItemClick(() => onToolSelect?.('breakpoints'))}
              className="w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Breakpoints Manager
            </button>
            <button
              onClick={() => handleMenuItemClick(() => onToolSelect?.('swo'))}
              className="w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              SWO Viewer
            </button>
            <div className="border-t border-gray-700 my-1" />
            <button
              onClick={() => handleMenuItemClick(() => onToolSelect?.('analysis'))}
              className="w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Binary Analysis
            </button>
            <button
              onClick={() => handleMenuItemClick(() => onToolSelect?.('xrefs'))}
              className="w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Cross-References
            </button>
          </div>
        )}
      </div>

      {/* Help Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('help')}
          className={`px-3 h-8 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-0 outline-none ${
            openMenu === 'help' ? 'bg-gray-800 text-white' : ''
          }`}
        >
          Help
        </button>
        {openMenu === 'help' && (
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
  );
}
