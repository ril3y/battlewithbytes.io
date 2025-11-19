'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MemoryMapParser, MemoryRegion, MemoryType, MemoryStatistics } from '../lib/memory/MemoryMapParser';
import { GdbClient } from '../lib/gdb/GdbClient';

interface MemoryMapViewProps {
  gdbClient: GdbClient | null;
  onRegionSelect?: (region: MemoryRegion) => void;
}

interface ViewState {
  zoom: number;
  offset: { x: number; y: number };
  selectedRegion: MemoryRegion | null;
  hoveredRegion: MemoryRegion | null;
}

const MEMORY_TYPE_COLORS: Record<MemoryType, string> = {
  [MemoryType.FLASH]: '#3b82f6',      // Blue
  [MemoryType.RAM]: '#10b981',        // Green
  [MemoryType.SRAM]: '#22c55e',       // Light green
  [MemoryType.PERIPHERAL]: '#f59e0b', // Orange
  [MemoryType.EXTERNAL_RAM]: '#8b5cf6', // Purple
  [MemoryType.EXTERNAL_DEVICE]: '#ec4899', // Pink
  [MemoryType.SYSTEM]: '#ef4444',     // Red
  [MemoryType.RESERVED]: '#6b7280',   // Gray
  [MemoryType.UNKNOWN]: '#374151'     // Dark gray
};

export const MemoryMapView: React.FC<MemoryMapViewProps> = ({ gdbClient, onRegionSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [parser] = useState(() => new MemoryMapParser());
  const [regions, setRegions] = useState<MemoryRegion[]>([]);
  const [statistics, setStatistics] = useState<MemoryStatistics | null>(null);
  const [viewState, setViewState] = useState<ViewState>({
    zoom: 1,
    offset: { x: 0, y: 0 },
    selectedRegion: null,
    hoveredRegion: null
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showMinimap, setShowMinimap] = useState(true);
  const [showStatistics, setShowStatistics] = useState(true);

  // Load memory regions
  useEffect(() => {
    loadMemoryRegions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gdbClient]);

  const loadMemoryRegions = async () => {
    if (!gdbClient?.isConnected()) {
      // Use default ARM regions when not connected
      const defaultRegions = parser.detectMemoryRegions();
      setRegions(defaultRegions);
      setStatistics(parser.calculateStatistics(defaultRegions));
      return;
    }

    try {
      // Try to get memory info from target
      const memInfo = await gdbClient.sendCommand('info mem');
      if (memInfo.type === 'data' && memInfo.data) {
        const parsedRegions = parser.parseGdbMemoryInfo(memInfo.data);
        if (parsedRegions.length > 0) {
          setRegions(parsedRegions);
          setStatistics(parser.calculateStatistics(parsedRegions));
          return;
        }
      }

      // Fallback to detected regions
      const detectedRegions = parser.detectMemoryRegions();
      setRegions(detectedRegions);

      // Try to update with runtime info
      const registers = await gdbClient.getFormattedRegisters();
      const sp = registers.get('sp');
      if (typeof sp === 'number') {
        parser.updateMemoryUsage(new Map(), sp);
        setStatistics(parser.getStatistics());
      }
    } catch (error) {
      console.error('Failed to load memory regions:', error);
      // Use default regions on error
      const defaultRegions = parser.detectMemoryRegions();
      setRegions(defaultRegions);
      setStatistics(parser.calculateStatistics(defaultRegions));
    }
  };

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawMemoryMap(ctx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regions, viewState]);

  const drawMemoryMap = (ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    if (regions.length === 0) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No memory regions loaded', width / 2, height / 2);
      return;
    }

    // Calculate layout
    const padding = 40;
    const regionHeight = 60;
    const regionSpacing = 10;

    // Apply zoom and offset
    ctx.save();
    ctx.translate(viewState.offset.x, viewState.offset.y);
    ctx.scale(viewState.zoom, viewState.zoom);

    // Find min and max addresses for scaling
    const minAddr = Math.min(...regions.map(r => r.start));
    const maxAddr = Math.max(...regions.map(r => r.end));
    const addrRange = maxAddr - minAddr;

    // Draw each memory region
    regions.forEach((region, index) => {
      const y = padding + index * (regionHeight + regionSpacing);
      const x = padding;
      const availableWidth = (width - 2 * padding) / viewState.zoom;

      // Calculate region width based on size relative to address space
      const regionWidth = Math.max(100, (region.size / addrRange) * availableWidth * 4);

      // Draw region background
      ctx.fillStyle = MEMORY_TYPE_COLORS[region.type] + '40'; // 25% opacity
      ctx.strokeStyle = MEMORY_TYPE_COLORS[region.type];
      ctx.lineWidth = 2;

      if (region === viewState.hoveredRegion) {
        ctx.fillStyle = MEMORY_TYPE_COLORS[region.type] + '60'; // Highlight on hover
      }
      if (region === viewState.selectedRegion) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fbbf24'; // Yellow border for selection
      }

      ctx.fillRect(x, y, regionWidth, regionHeight);
      ctx.strokeRect(x, y, regionWidth, regionHeight);

      // Draw usage bar if available
      if (region.used && region.size > 0) {
        const usageWidth = (region.used / region.size) * regionWidth;
        ctx.fillStyle = MEMORY_TYPE_COLORS[region.type] + '80';
        ctx.fillRect(x, y, usageWidth, regionHeight);
      }

      // Draw text
      ctx.fillStyle = '#f3f4f6';
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      // Region name
      ctx.fillText(region.name, x + 10, y + 20);

      // Address range
      ctx.font = '10px monospace';
      ctx.fillStyle = '#9ca3af';
      const startAddr = MemoryMapParser.formatAddress(region.start);
      const endAddr = MemoryMapParser.formatAddress(region.end);
      ctx.fillText(`${startAddr} - ${endAddr}`, x + 10, y + 35);

      // Size
      ctx.fillText(MemoryMapParser.formatSize(region.size), x + 10, y + 48);

      // Permissions
      if (region.permissions) {
        const perms = [
          region.permissions.read ? 'R' : '-',
          region.permissions.write ? 'W' : '-',
          region.permissions.execute ? 'X' : '-'
        ].join('');
        ctx.fillText(perms, x + regionWidth - 30, y + 20);
      }

      // Usage percentage
      if (region.used && region.size > 0) {
        const percentage = ((region.used / region.size) * 100).toFixed(1);
        ctx.fillStyle = '#10b981';
        ctx.fillText(`${percentage}%`, x + regionWidth - 50, y + 48);
      }
    });

    ctx.restore();

    // Draw minimap
    if (showMinimap) {
      drawMinimap(ctx);
    }
  };

  const drawMinimap = (ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    const minimapWidth = 150;
    const minimapHeight = 100;
    const x = canvas.width - minimapWidth - 10;
    const y = 10;

    // Background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, minimapWidth, minimapHeight);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(x, y, minimapWidth, minimapHeight);

    // Draw tiny regions
    const scale = minimapHeight / (regions.length * 70);
    regions.forEach((region, index) => {
      const regionY = y + index * 70 * scale;
      const regionHeight = 60 * scale;
      ctx.fillStyle = MEMORY_TYPE_COLORS[region.type] + '60';
      ctx.fillRect(x + 5, regionY, minimapWidth - 10, regionHeight);
    });

    // Viewport indicator
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    const viewportHeight = (canvas.height / viewState.zoom) * scale;
    const viewportY = y - (viewState.offset.y / viewState.zoom) * scale;
    ctx.strokeRect(x + 2, viewportY, minimapWidth - 4, viewportHeight);
  };

  // Mouse event handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewState.offset.x) / viewState.zoom;
    const y = (e.clientY - rect.top - viewState.offset.y) / viewState.zoom;

    if (isDragging) {
      setViewState(prev => ({
        ...prev,
        offset: {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        }
      }));
    } else {
      // Check if hovering over a region
      const padding = 40;
      const regionHeight = 60;
      const regionSpacing = 10;

      let hoveredRegion: MemoryRegion | null = null;
      regions.forEach((region, index) => {
        const regionY = padding + index * (regionHeight + regionSpacing);
        const regionX = padding;
        const availableWidth = (canvas.width - 2 * padding) / viewState.zoom;
        const addrRange = Math.max(...regions.map(r => r.end)) - Math.min(...regions.map(r => r.start));
        const regionWidth = Math.max(100, (region.size / addrRange) * availableWidth * 4);

        if (x >= regionX && x <= regionX + regionWidth && y >= regionY && y <= regionY + regionHeight) {
          hoveredRegion = region;
        }
      });

      if (hoveredRegion !== viewState.hoveredRegion) {
        setViewState(prev => ({ ...prev, hoveredRegion }));
      }
    }
  }, [isDragging, dragStart, regions, viewState.zoom, viewState.offset, viewState.hoveredRegion]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - viewState.offset.x,
      y: e.clientY - viewState.offset.y
    });
  }, [viewState.offset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (viewState.hoveredRegion) {
      setViewState(prev => ({ ...prev, selectedRegion: viewState.hoveredRegion }));
      onRegionSelect?.(viewState.hoveredRegion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRegionSelect]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewState(prev => ({
      ...prev,
      zoom: Math.min(Math.max(prev.zoom * delta, 0.5), 3)
    }));
  }, []);

  // Controls
  const resetView = () => {
    setViewState({
      zoom: 1,
      offset: { x: 0, y: 0 },
      selectedRegion: null,
      hoveredRegion: null
    });
  };

  const zoomIn = () => {
    setViewState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3) }));
  };

  const zoomOut = () => {
    setViewState(prev => ({ ...prev, zoom: Math.max(prev.zoom * 0.8, 0.5) }));
  };

  const exportAsImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'memory-map.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-gray-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={loadMemoryRegions}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
            title="Refresh memory map"
          >
            Refresh
          </button>
          <button
            onClick={zoomIn}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={zoomOut}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors"
            title="Zoom out"
          >
            −
          </button>
          <button
            onClick={resetView}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors"
            title="Reset view"
          >
            Reset
          </button>
          <span className="text-sm text-gray-400 ml-2">
            Zoom: {(viewState.zoom * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showMinimap}
              onChange={(e) => setShowMinimap(e.target.checked)}
              className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
            />
            Minimap
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showStatistics}
              onChange={(e) => setShowStatistics(e.target.checked)}
              className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
            />
            Statistics
          </label>
          <button
            onClick={exportAsImage}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors"
            title="Export as image"
          >
            Export
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas container */}
        <div ref={containerRef} className="flex-1 relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="cursor-move"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
            onWheel={handleWheel}
            style={{ width: '100%', height: '100%' }}
          />

          {/* Tooltip */}
          {viewState.hoveredRegion && (
            <div className="absolute top-4 left-4 bg-slate-800 border border-slate-600 rounded-lg p-3 pointer-events-none shadow-xl">
              <div className="font-semibold text-sm mb-2">{viewState.hoveredRegion.name}</div>
              <div className="text-xs space-y-1 text-gray-400">
                <div>Type: {viewState.hoveredRegion.type}</div>
                <div>Start: {MemoryMapParser.formatAddress(viewState.hoveredRegion.start)}</div>
                <div>End: {MemoryMapParser.formatAddress(viewState.hoveredRegion.end)}</div>
                <div>Size: {MemoryMapParser.formatSize(viewState.hoveredRegion.size)}</div>
                {viewState.hoveredRegion.used && (
                  <div>Used: {MemoryMapParser.formatSize(viewState.hoveredRegion.used)} ({((viewState.hoveredRegion.used / viewState.hoveredRegion.size) * 100).toFixed(1)}%)</div>
                )}
                {viewState.hoveredRegion.description && (
                  <div className="mt-2 text-gray-300">{viewState.hoveredRegion.description}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Statistics panel */}
        {showStatistics && statistics && (
          <div className="w-64 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Memory Statistics</h3>

            <div className="space-y-4">
              {/* Flash statistics */}
              <div>
                <div className="text-sm text-gray-400 mb-1">Flash Memory</div>
                <div className="bg-slate-900 rounded p-2">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span>{MemoryMapParser.formatSize(statistics.totalFlash)}</span>
                  </div>
                  {statistics.usedFlash > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Used:</span>
                        <span>{MemoryMapParser.formatSize(statistics.usedFlash)}</span>
                      </div>
                      <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${(statistics.usedFlash / statistics.totalFlash) * 100}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* RAM statistics */}
              <div>
                <div className="text-sm text-gray-400 mb-1">RAM</div>
                <div className="bg-slate-900 rounded p-2">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span>{MemoryMapParser.formatSize(statistics.totalRam)}</span>
                  </div>
                  {statistics.usedRam > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Used:</span>
                        <span>{MemoryMapParser.formatSize(statistics.usedRam)}</span>
                      </div>
                      <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${(statistics.usedRam / statistics.totalRam) * 100}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Runtime info */}
              {(statistics.stackPointer || statistics.heapStart || statistics.vectorTableAddress) && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Runtime Info</div>
                  <div className="bg-slate-900 rounded p-2 space-y-1">
                    {statistics.stackPointer && (
                      <div className="flex justify-between text-sm">
                        <span>Stack Pointer:</span>
                        <span className="font-mono text-xs">{MemoryMapParser.formatAddress(statistics.stackPointer)}</span>
                      </div>
                    )}
                    {statistics.heapStart && (
                      <div className="flex justify-between text-sm">
                        <span>Heap Start:</span>
                        <span className="font-mono text-xs">{MemoryMapParser.formatAddress(statistics.heapStart)}</span>
                      </div>
                    )}
                    {statistics.heapEnd && (
                      <div className="flex justify-between text-sm">
                        <span>Heap End:</span>
                        <span className="font-mono text-xs">{MemoryMapParser.formatAddress(statistics.heapEnd)}</span>
                      </div>
                    )}
                    {statistics.vectorTableAddress && (
                      <div className="flex justify-between text-sm">
                        <span>Vector Table:</span>
                        <span className="font-mono text-xs">{MemoryMapParser.formatAddress(statistics.vectorTableAddress)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div>
                <div className="text-sm text-gray-400 mb-2">Memory Types</div>
                <div className="space-y-1">
                  {Object.entries(MEMORY_TYPE_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs capitalize">{type.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-t border-slate-700 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>{regions.length} regions</span>
          {viewState.selectedRegion && (
            <span>Selected: {viewState.selectedRegion.name}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Click to inspect region • Scroll to zoom • Drag to pan</span>
        </div>
      </div>
    </div>
  );
};