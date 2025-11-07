'use client';

/**
 * DebuggerView - Multi-panel debugger layout (x64dbg-style)
 *
 * Displays disassembly, registers, stack, and memory panels simultaneously
 * with resizable panels and maximize functionality
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GdbClient } from '../lib/gdb/GdbClient';
import RegistersPanel, { RegisterValue } from './RegistersPanel';
import MemoryPanel from './MemoryPanel';
import StackPanel, { StackFrame } from './StackPanel';
import DisassemblyView from './DisassemblyView';

interface DebuggerViewProps {
  gdbClient: GdbClient | null;
  isConnected: boolean;
  registers: RegisterValue[];
  stackFrames: StackFrame[];
  programCounter: number | undefined;
  onRefreshRegisters: () => Promise<void>;
  onRefreshStack: () => Promise<void>;
  onReadMemory: (address: number, length: number) => Promise<Uint8Array | null>;
  onOutput: (text: string) => void;
}

type MaximizedPanel = 'disasm' | 'registers' | 'stack' | 'memory' | null;

export default function DebuggerView({
  gdbClient,
  isConnected,
  registers,
  stackFrames,
  programCounter,
  onRefreshRegisters,
  onRefreshStack,
  onReadMemory,
  onOutput
}: DebuggerViewProps) {
  const [maximizedPanel, setMaximizedPanel] = useState<MaximizedPanel>(null);

  // Panel sizing state - horizontal split (top/bottom), vertical split (left/right)
  const [horizontalSplit, setHorizontalSplit] = useState(50); // Top row height percentage
  const [topRowVerticalSplit, setTopRowVerticalSplit] = useState(70); // Disasm width percentage in top row
  const [bottomRowVerticalSplit, setBottomRowVerticalSplit] = useState(50); // Stack width percentage in bottom row

  // Drag state
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
  const [isDraggingTopVertical, setIsDraggingTopVertical] = useState(false);
  const [isDraggingBottomVertical, setIsDraggingBottomVertical] = useState(false);

  // Memory jump state - address to jump to in memory view
  const [memoryJumpAddress, setMemoryJumpAddress] = useState<number | undefined>();

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleMaximize = useCallback((panel: MaximizedPanel) => {
    setMaximizedPanel(prev => prev === panel ? null : panel);
  }, []);

  // Handle address click from disassembly - jump to memory view
  const handleAddressClick = useCallback((address: number) => {
    setMemoryJumpAddress(address);
  }, []);

  // Mouse handlers for horizontal divider (top/bottom split)
  const handleHorizontalMouseDown = useCallback(() => {
    setIsDraggingHorizontal(true);
  }, []);

  const handleHorizontalMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingHorizontal || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const newSplit = (offsetY / rect.height) * 100;
    if (newSplit >= 20 && newSplit <= 80) {
      setHorizontalSplit(newSplit);
    }
  }, [isDraggingHorizontal]);

  // Mouse handlers for top row vertical divider (disasm/registers split)
  const handleTopVerticalMouseDown = useCallback(() => {
    setIsDraggingTopVertical(true);
  }, []);

  const handleTopVerticalMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingTopVertical || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newSplit = (offsetX / rect.width) * 100;
    if (newSplit >= 30 && newSplit <= 85) {
      setTopRowVerticalSplit(newSplit);
    }
  }, [isDraggingTopVertical]);

  // Mouse handlers for bottom row vertical divider (stack/memory split)
  const handleBottomVerticalMouseDown = useCallback(() => {
    setIsDraggingBottomVertical(true);
  }, []);

  const handleBottomVerticalMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingBottomVertical || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newSplit = (offsetX / rect.width) * 100;
    if (newSplit >= 20 && newSplit <= 80) {
      setBottomRowVerticalSplit(newSplit);
    }
  }, [isDraggingBottomVertical]);

  // Setup event listeners for all drag operations
  useEffect(() => {
    const isDragging = isDraggingHorizontal || isDraggingTopVertical || isDraggingBottomVertical;

    if (isDragging) {
      let moveHandler: (e: MouseEvent) => void;

      if (isDraggingHorizontal) {
        moveHandler = handleHorizontalMouseMove;
      } else if (isDraggingTopVertical) {
        moveHandler = handleTopVerticalMouseMove;
      } else {
        moveHandler = handleBottomVerticalMouseMove;
      }

      const upHandler = () => {
        setIsDraggingHorizontal(false);
        setIsDraggingTopVertical(false);
        setIsDraggingBottomVertical(false);
      };

      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', upHandler);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isDraggingHorizontal ? 'row-resize' : 'col-resize';

      return () => {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', upHandler);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [
    isDraggingHorizontal,
    isDraggingTopVertical,
    isDraggingBottomVertical,
    handleHorizontalMouseMove,
    handleTopVerticalMouseMove,
    handleBottomVerticalMouseMove
  ]);

  // Panel header component
  const PanelHeader = ({
    title,
    panelKey,
    onRefresh
  }: {
    title: string;
    panelKey: MaximizedPanel;
    onRefresh?: () => void;
  }) => (
    <div className="flex items-center justify-between bg-gray-900 border-b border-gray-700 px-3 py-1.5">
      <h3 className="text-xs font-mono text-green-400 font-bold">{title}</h3>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={!isConnected}
            className="text-xs px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh"
          >
            ⟳
          </button>
        )}
        <button
          onClick={() => toggleMaximize(panelKey)}
          className="text-xs px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
          title="Maximize"
        >
          ⛶
        </button>
      </div>
    </div>
  );

  // Divider component
  const HorizontalDivider = ({ onMouseDown }: { onMouseDown: () => void }) => (
    <div
      className="h-1 w-full bg-gray-700 hover:bg-green-500 cursor-row-resize transition-colors flex-shrink-0"
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation="horizontal"
    />
  );

  const VerticalDivider = ({ onMouseDown }: { onMouseDown: () => void }) => (
    <div
      className="w-1 h-full bg-gray-700 hover:bg-green-500 cursor-col-resize transition-colors flex-shrink-0"
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation="vertical"
    />
  );

  // If a panel is maximized, show only that panel
  if (maximizedPanel) {
    return (
      <div className="flex flex-col h-full bg-gray-950">
        <PanelHeader
          title={maximizedPanel.toUpperCase()}
          panelKey={maximizedPanel}
          onRefresh={
            maximizedPanel === 'registers'
              ? onRefreshRegisters
              : maximizedPanel === 'stack'
              ? onRefreshStack
              : undefined
          }
        />
        <div className="flex-1 overflow-hidden">
          {maximizedPanel === 'disasm' && (
            <DisassemblyView
              onReadMemory={onReadMemory}
              programCounter={programCounter}
              isConnected={isConnected}
              registers={new Map(registers.map(r => [r.name, r.value]))}
              gdbClient={gdbClient}
              onOutput={onOutput}
              onAddressClick={handleAddressClick}
            />
          )}
          {maximizedPanel === 'registers' && (
            <RegistersPanel
              registers={registers}
              onRefresh={onRefreshRegisters}
              isConnected={isConnected}
            />
          )}
          {maximizedPanel === 'stack' && (
            <StackPanel
              frames={stackFrames}
              onRefresh={onRefreshStack}
              isConnected={isConnected}
            />
          )}
          {maximizedPanel === 'memory' && (
            <MemoryPanel
              onReadMemory={onReadMemory}
              isConnected={isConnected}
            />
          )}
        </div>
      </div>
    );
  }

  // Default multi-panel layout with resizable dividers
  return (
    <div ref={containerRef} className="flex flex-col h-full bg-gray-950">
      {/* Top Row: Disassembly | Registers */}
      <div className="flex" style={{ height: `${horizontalSplit}%` }}>
        {/* Disassembly Panel */}
        <div className="flex flex-col" style={{ width: `${topRowVerticalSplit}%` }}>
          <PanelHeader title="DISASSEMBLY" panelKey="disasm" />
          <div className="flex-1 overflow-hidden">
            <DisassemblyView
              onReadMemory={onReadMemory}
              programCounter={programCounter}
              isConnected={isConnected}
              registers={new Map(registers.map(r => [r.name, r.value]))}
              gdbClient={gdbClient}
              onOutput={onOutput}
              onAddressClick={handleAddressClick}
            />
          </div>
        </div>

        {/* Vertical Divider */}
        <VerticalDivider onMouseDown={handleTopVerticalMouseDown} />

        {/* Registers Panel */}
        <div className="flex flex-col" style={{ width: `${100 - topRowVerticalSplit}%` }}>
          <PanelHeader title="REGISTERS" panelKey="registers" onRefresh={onRefreshRegisters} />
          <div className="flex-1 overflow-hidden">
            <RegistersPanel
              registers={registers}
              onRefresh={onRefreshRegisters}
              isConnected={isConnected}
            />
          </div>
        </div>
      </div>

      {/* Horizontal Divider */}
      <HorizontalDivider onMouseDown={handleHorizontalMouseDown} />

      {/* Bottom Row: Stack | Memory */}
      <div className="flex" style={{ height: `${100 - horizontalSplit}%` }}>
        {/* Stack Panel */}
        <div className="flex flex-col" style={{ width: `${bottomRowVerticalSplit}%` }}>
          <PanelHeader title="STACK" panelKey="stack" onRefresh={onRefreshStack} />
          <div className="flex-1 overflow-hidden">
            <StackPanel
              frames={stackFrames}
              onRefresh={onRefreshStack}
              isConnected={isConnected}
            />
          </div>
        </div>

        {/* Vertical Divider */}
        <VerticalDivider onMouseDown={handleBottomVerticalMouseDown} />

        {/* Memory Panel */}
        <div className="flex flex-col" style={{ width: `${100 - bottomRowVerticalSplit}%` }}>
          <PanelHeader title="MEMORY" panelKey="memory" />
          <div className="flex-1 overflow-hidden">
            <MemoryPanel
              onReadMemory={onReadMemory}
              isConnected={isConnected}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
