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
import FunctionsPanel from './FunctionsPanel';

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
  breakpoints?: Set<number>;
  onToggleBreakpoint?: (address: number) => Promise<void>;
  visiblePanels?: {
    registers: boolean;
    stack: boolean;
    memory: boolean;
  };
  jumpToPCTrigger?: number; // Increment this to trigger a jump to PC
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
  onOutput,
  breakpoints,
  onToggleBreakpoint,
  visiblePanels = { registers: true, stack: true, memory: true },
  jumpToPCTrigger
}: DebuggerViewProps) {
  const [maximizedPanel, setMaximizedPanel] = useState<MaximizedPanel>(null);
  const [stackPanelTab, setStackPanelTab] = useState<'stack' | 'functions'>('stack');

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

  // Disassembly jump state - address to jump to in disassembly view
  const [disassemblyJumpAddress, setDisassemblyJumpAddress] = useState<number | undefined>();

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-read memory around PC when it changes
  useEffect(() => {
    if (programCounter !== undefined) {
      setMemoryJumpAddress(programCounter);
    }
  }, [programCounter]);

  const toggleMaximize = useCallback((panel: MaximizedPanel) => {
    setMaximizedPanel(prev => prev === panel ? null : panel);
  }, []);

  // Handle address click from disassembly address column - jump to memory view
  const handleMemoryJump = useCallback((address: number) => {
    setMemoryJumpAddress(address);
  }, []);

  // Handle address click from registers - jump to disassembly
  const handleDisassemblyJump = useCallback((address: number) => {
    console.log('[DebuggerView] Jump request to:', address.toString(16));
    setDisassemblyJumpAddress(address);
  }, []);

  // Clear disassembly jump address after jump is complete
  const handleDisassemblyJumpComplete = useCallback(() => {
    setDisassemblyJumpAddress(undefined);
  }, []);

  // Jump to PC when trigger changes (e.g., after analysis completes)
  useEffect(() => {
    if (jumpToPCTrigger !== undefined && jumpToPCTrigger > 0 && programCounter !== undefined) {
      console.log('[DebuggerView] Jump to PC triggered:', programCounter.toString(16));
      setDisassemblyJumpAddress(programCounter);
    }
  }, [jumpToPCTrigger, programCounter]);

  // Cache container rect on drag start to avoid forced reflows during mousemove (60Hz!)
  const dragStartRectRef = React.useRef<DOMRect | null>(null);

  // Mouse handlers for horizontal divider (top/bottom split)
  const handleHorizontalMouseDown = useCallback(() => {
    // Cache bounding rect ONCE on drag start
    if (containerRef.current) {
      dragStartRectRef.current = containerRef.current.getBoundingClientRect();
    }
    setIsDraggingHorizontal(true);
  }, []);

  const handleHorizontalMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingHorizontal || !dragStartRectRef.current) return;
    // Use cached rect instead of calling getBoundingClientRect() at 60Hz
    const rect = dragStartRectRef.current;
    const offsetY = e.clientY - rect.top;
    const newSplit = (offsetY / rect.height) * 100;
    if (newSplit >= 20 && newSplit <= 80) {
      setHorizontalSplit(newSplit);
    }
  }, [isDraggingHorizontal]);

  // Mouse handlers for top row vertical divider (disasm/registers split)
  const handleTopVerticalMouseDown = useCallback(() => {
    // Cache bounding rect ONCE on drag start
    if (containerRef.current) {
      dragStartRectRef.current = containerRef.current.getBoundingClientRect();
    }
    setIsDraggingTopVertical(true);
  }, []);

  const handleTopVerticalMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingTopVertical || !dragStartRectRef.current) return;
    // Use cached rect instead of calling getBoundingClientRect() at 60Hz
    const rect = dragStartRectRef.current;
    const offsetX = e.clientX - rect.left;
    const newSplit = (offsetX / rect.width) * 100;
    if (newSplit >= 30 && newSplit <= 85) {
      setTopRowVerticalSplit(newSplit);
    }
  }, [isDraggingTopVertical]);

  // Mouse handlers for bottom row vertical divider (stack/memory split)
  const handleBottomVerticalMouseDown = useCallback(() => {
    // Cache bounding rect ONCE on drag start
    if (containerRef.current) {
      dragStartRectRef.current = containerRef.current.getBoundingClientRect();
    }
    setIsDraggingBottomVertical(true);
  }, []);

  const handleBottomVerticalMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingBottomVertical || !dragStartRectRef.current) return;
    // Use cached rect instead of calling getBoundingClientRect() at 60Hz
    const rect = dragStartRectRef.current;
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
              onAddressClick={handleMemoryJump}
              jumpToAddress={disassemblyJumpAddress}
              onJumpComplete={handleDisassemblyJumpComplete}
              breakpoints={breakpoints}
              onToggleBreakpoint={onToggleBreakpoint}
            />
          )}
          {maximizedPanel === 'registers' && visiblePanels.registers && (
            <RegistersPanel
              registers={registers}
              onRefresh={onRefreshRegisters}
              isConnected={isConnected}
              onAddressClick={handleDisassemblyJump}
            />
          )}
          {maximizedPanel === 'stack' && visiblePanels.stack && (
            <div className="flex flex-col h-full">
              {/* Tabs */}
              <div className="flex border-b border-gray-700 bg-gray-900">
                <button
                  onClick={() => setStackPanelTab('stack')}
                  className={`px-4 py-2 text-xs font-mono transition-colors ${
                    stackPanelTab === 'stack'
                      ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  STACK
                </button>
                <button
                  onClick={() => setStackPanelTab('functions')}
                  className={`px-4 py-2 text-xs font-mono transition-colors ${
                    stackPanelTab === 'functions'
                      ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  FUNCTIONS
                </button>
              </div>
              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {stackPanelTab === 'stack' && (
                  <StackPanel
                    frames={stackFrames}
                    onRefresh={onRefreshStack}
                    isConnected={isConnected}
                  />
                )}
                {stackPanelTab === 'functions' && (
                  <FunctionsPanel
                    onNavigateToAddress={handleDisassemblyJump}
                  />
                )}
              </div>
            </div>
          )}
          {maximizedPanel === 'memory' && visiblePanels.memory && (
            <MemoryPanel
              onReadMemory={onReadMemory}
              isConnected={isConnected}
              gdbClient={gdbClient}
              onOutput={onOutput}
              autoReadAddress={memoryJumpAddress}
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
        <div className="flex flex-col" style={{ width: visiblePanels.registers ? `${topRowVerticalSplit}%` : '100%' }}>
          <PanelHeader title="DISASSEMBLY" panelKey="disasm" />
          <div className="flex-1 overflow-hidden">
            <DisassemblyView
              onReadMemory={onReadMemory}
              programCounter={programCounter}
              isConnected={isConnected}
              registers={new Map(registers.map(r => [r.name, r.value]))}
              gdbClient={gdbClient}
              onOutput={onOutput}
              onAddressClick={handleMemoryJump}
              jumpToAddress={disassemblyJumpAddress}
              onJumpComplete={handleDisassemblyJumpComplete}
              breakpoints={breakpoints}
              onToggleBreakpoint={onToggleBreakpoint}
            />
          </div>
        </div>

        {/* Vertical Divider - only show if registers panel is visible */}
        {visiblePanels.registers && <VerticalDivider onMouseDown={handleTopVerticalMouseDown} />}

        {/* Registers Panel */}
        {visiblePanels.registers && (
          <div className="flex flex-col" style={{ width: `${100 - topRowVerticalSplit}%` }}>
            <PanelHeader title="REGISTERS" panelKey="registers" onRefresh={onRefreshRegisters} />
            <div className="flex-1 overflow-hidden">
              <RegistersPanel
                registers={registers}
                onRefresh={onRefreshRegisters}
                isConnected={isConnected}
                onAddressClick={handleDisassemblyJump}
              />
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Divider - only show if bottom row has any visible panels */}
      {(visiblePanels.stack || visiblePanels.memory) && (
        <HorizontalDivider onMouseDown={handleHorizontalMouseDown} />
      )}

      {/* Bottom Row: Stack | Memory */}
      {(visiblePanels.stack || visiblePanels.memory) && (
        <div className="flex" style={{ height: `${100 - horizontalSplit}%` }}>
          {/* Stack Panel with Tabs */}
          {visiblePanels.stack && (
            <div className="flex flex-col" style={{ width: visiblePanels.memory ? `${bottomRowVerticalSplit}%` : '100%' }}>
              <PanelHeader title="STACK / FUNCTIONS" panelKey="stack" onRefresh={stackPanelTab === 'stack' ? onRefreshStack : undefined} />
              {/* Tabs */}
              <div className="flex border-b border-gray-700 bg-gray-900">
                <button
                  onClick={() => setStackPanelTab('stack')}
                  className={`px-4 py-2 text-xs font-mono transition-colors ${
                    stackPanelTab === 'stack'
                      ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  STACK
                </button>
                <button
                  onClick={() => setStackPanelTab('functions')}
                  className={`px-4 py-2 text-xs font-mono transition-colors ${
                    stackPanelTab === 'functions'
                      ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  FUNCTIONS
                </button>
              </div>
              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {stackPanelTab === 'stack' && (
                  <StackPanel
                    frames={stackFrames}
                    onRefresh={onRefreshStack}
                    isConnected={isConnected}
                  />
                )}
                {stackPanelTab === 'functions' && (
                  <FunctionsPanel
                    onNavigateToAddress={handleDisassemblyJump}
                  />
                )}
              </div>
            </div>
          )}

          {/* Vertical Divider - only show if both stack and memory are visible */}
          {visiblePanels.stack && visiblePanels.memory && (
            <VerticalDivider onMouseDown={handleBottomVerticalMouseDown} />
          )}

          {/* Memory Panel */}
          {visiblePanels.memory && (
            <div className="flex flex-col" style={{ width: visiblePanels.stack ? `${100 - bottomRowVerticalSplit}%` : '100%' }}>
              <PanelHeader title="MEMORY" panelKey="memory" />
              <div className="flex-1 overflow-hidden">
                <MemoryPanel
                  onReadMemory={onReadMemory}
                  isConnected={isConnected}
                  gdbClient={gdbClient}
                  onOutput={onOutput}
                  autoReadAddress={memoryJumpAddress}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
