/**
 * Control Flow Graph View
 *
 * Canvas-based visualization of control flow graphs from disassembled code.
 * Similar to IDA Pro's graph view with hierarchical block layout.
 */

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { DisassembledInstruction } from '../lib/disasm/ArmDisassembler';
import {
  BasicBlockAnalyzer,
  ControlFlowAnalyzer,
  CFGLayoutEngine
} from '../lib/cfg';
import type {
  ControlFlowGraph,
  CFGLayout,
  BlockLayout,
  EdgeLayout,
  BasicBlock,
  BlockType
} from '../lib/cfg/types';

interface ControlFlowGraphViewProps {
  instructions: DisassembledInstruction[];
  selectedAddress?: number;
  onAddressClick?: (address: number) => void;
  className?: string;
}

interface ViewTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export const ControlFlowGraphView: React.FC<ControlFlowGraphViewProps> = ({
  instructions,
  selectedAddress,
  onAddressClick,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [cfg, setCfg] = useState<ControlFlowGraph | null>(null);
  const [layout, setLayout] = useState<CFGLayout | null>(null);
  const [transform, setTransform] = useState<ViewTransform>({ offsetX: 50, offsetY: 50, scale: 1.0 });
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{ block: BasicBlock; x: number; y: number } | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState<{ x: number; y: number } | null>(null);

  // Build CFG from instructions
  useEffect(() => {
    if (instructions.length === 0) {
      setCfg(null);
      setLayout(null);
      return;
    }

    try {
      // Step 1: Identify basic blocks
      const blockAnalyzer = new BasicBlockAnalyzer({
        architecture: 'ARM',
        startAddress: instructions[0].address,
        detectLoops: true,
        detectUnreachable: true
      });
      const blocks = blockAnalyzer.identifyBasicBlocks(instructions);

      // Step 2: Build CFG
      const cfgAnalyzer = new ControlFlowAnalyzer({
        architecture: 'ARM',
        startAddress: instructions[0].address,
        detectLoops: true,
        detectUnreachable: true
      });
      const result = cfgAnalyzer.buildCFG(blocks);

      // Step 3: Compute layout
      const layoutEngine = new CFGLayoutEngine({
        algorithm: 'hierarchical',
        blockWidth: 200,
        blockHeight: 120,
        horizontalSpacing: 60,
        verticalSpacing: 80,
        compactLayout: false
      });
      const computedLayout = layoutEngine.computeLayout(result.cfg);

      setCfg(result.cfg);
      setLayout(computedLayout);

      // Auto-fit the graph in the viewport
      if (containerRef.current && computedLayout) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { bounds } = computedLayout;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // Calculate scale to fit with padding
        const padding = 100; // pixels of padding
        const scaleX = (canvasWidth - padding * 2) / bounds.width;
        const scaleY = (canvasHeight - padding * 2) / bounds.height;
        const fitScale = Math.min(scaleX, scaleY, 1.5); // Cap at 1.5x zoom

        // Center the graph
        const offsetX = (canvasWidth - bounds.width * fitScale) / 2 - bounds.minX * fitScale;
        const offsetY = (canvasHeight - bounds.height * fitScale) / 2 - bounds.minY * fitScale;

        setTransform({ offsetX, offsetY, scale: fitScale });
        console.log('[CFG] Auto-fit:', { scale: fitScale, offsetX, offsetY, bounds });
      }
    } catch (err) {
      console.error('[CFG] Error building control flow graph:', err);
      setCfg(null);
      setLayout(null);
    }
  }, [instructions]);

  // Find block containing selected address
  useEffect(() => {
    if (!cfg || !selectedAddress) {
      setSelectedBlock(null);
      return;
    }

    for (const [blockId, block] of cfg.blocks) {
      if (selectedAddress >= block.startAddress && selectedAddress <= block.endAddress) {
        setSelectedBlock(blockId);
        return;
      }
    }
    setSelectedBlock(null);
  }, [cfg, selectedAddress]);

  // Get block color based on type
  const getBlockColor = useCallback((blockType: BlockType, isSelected: boolean, isHovered: boolean): string => {
    const colors = {
      entry: { bg: '#1e3a8a', border: '#3b82f6', text: '#93c5fd' },      // Blue
      normal: { bg: '#1e293b', border: '#475569', text: '#cbd5e1' },     // Gray
      conditional: { bg: '#713f12', border: '#f59e0b', text: '#fbbf24' }, // Amber
      call: { bg: '#581c87', border: '#a855f7', text: '#c084fc' },        // Purple
      return: { bg: '#831843', border: '#ec4899', text: '#f9a8d4' },      // Pink
      exit: { bg: '#7f1d1d', border: '#ef4444', text: '#fca5a5' },        // Red
      unreachable: { bg: '#171717', border: '#404040', text: '#737373' }  // Dark gray
    };

    const color = colors[blockType] || colors.normal;

    if (isSelected) {
      return color.border; // Highlighted border
    }
    if (isHovered) {
      return color.text; // Lighter on hover
    }
    return color.bg;
  }, []);

  const getBlockBorderColor = useCallback((blockType: BlockType, isSelected: boolean): string => {
    const colors = {
      entry: '#3b82f6',
      normal: '#475569',
      conditional: '#f59e0b',
      call: '#a855f7',
      return: '#ec4899',
      exit: '#ef4444',
      unreachable: '#404040'
    };

    return isSelected ? '#10b981' : colors[blockType] || colors.normal; // Green when selected
  }, []);

  const getBlockTextColor = useCallback((blockType: BlockType): string => {
    const colors = {
      entry: '#93c5fd',
      normal: '#cbd5e1',
      conditional: '#fbbf24',
      call: '#c084fc',
      return: '#f9a8d4',
      exit: '#fca5a5',
      unreachable: '#737373'
    };

    return colors[blockType] || colors.normal;
  }, []);

  // Draw arrowhead at end of edge
  const drawArrowhead = useCallback((
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
    color: string
  ) => {
    const headLength = 10;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLength * Math.cos(angle - Math.PI / 6),
      to.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      to.x - headLength * Math.cos(angle + Math.PI / 6),
      to.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }, []);

  // Draw a basic block
  const drawBlock = useCallback((
    ctx: CanvasRenderingContext2D,
    block: BasicBlock,
    blockLayout: BlockLayout,
    isSelected: boolean,
    isHovered: boolean
  ) => {
    const { x, y, width, height } = blockLayout;

    // Draw block background
    ctx.fillStyle = getBlockColor(block.type, isSelected, isHovered);
    ctx.fillRect(x, y, width, height);

    // Draw border
    ctx.strokeStyle = getBlockBorderColor(block.type, isSelected);
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.strokeRect(x, y, width, height);

    // Draw block header
    ctx.fillStyle = getBlockTextColor(block.type);
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText(block.id, x + 8, y + 18);

    // Draw block type badge
    ctx.font = '10px "Courier New", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`[${block.type.toUpperCase()}]`, x + 8, y + 32);

    // Draw instructions (truncated)
    ctx.font = '10px "Courier New", monospace';
    ctx.fillStyle = '#cbd5e1';

    const maxInstructions = 5;
    const instructions = block.instructions.slice(0, maxInstructions);

    let lineY = y + 48;
    for (const inst of instructions) {
      const addrStr = `0x${inst.address.toString(16).toUpperCase().padStart(8, '0')}`;
      const instText = `${inst.mnemonic} ${inst.operands}`.substring(0, 25);
      ctx.fillText(`${addrStr}: ${instText}`, x + 8, lineY);
      lineY += 12;
    }

    if (block.instructions.length > maxInstructions) {
      ctx.fillStyle = '#64748b';
      ctx.fillText(`... (${block.instructions.length - maxInstructions} more)`, x + 8, lineY);
    }
  }, [getBlockColor, getBlockBorderColor, getBlockTextColor]);

  // Draw an edge
  const drawEdge = useCallback((
    ctx: CanvasRenderingContext2D,
    edge: EdgeLayout
  ) => {
    const { points, color, isBackEdge } = edge;

    if (points.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    if (isBackEdge) {
      ctx.setLineDash([5, 5]); // Dashed line for back edges
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    if (points.length === 2) {
      // Straight line
      ctx.lineTo(points[1].x, points[1].y);
    } else if (points.length === 4) {
      // Bezier curve
      ctx.bezierCurveTo(
        points[1].x, points[1].y,
        points[2].x, points[2].y,
        points[3].x, points[3].y
      );
    }

    ctx.stroke();

    // Draw arrowhead
    const lastPoint = points[points.length - 1];
    const secondLastPoint = points[points.length - 2];
    drawArrowhead(ctx, secondLastPoint, lastPoint, color);

    ctx.setLineDash([]); // Reset dash
  }, [drawArrowhead]);

  // Draw CFG on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout || !cfg) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f172a'; // Dark blue background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(transform.offsetX, transform.offsetY);
    ctx.scale(transform.scale, transform.scale);

    // Draw edges first (behind blocks)
    for (const edge of layout.edges) {
      drawEdge(ctx, edge);
    }

    // Draw blocks
    for (const [blockId, blockLayout] of layout.blocks) {
      const block = cfg.blocks.get(blockId);
      if (!block) continue;

      const isSelected = blockId === selectedBlock;
      const isHovered = blockId === hoveredBlock;

      drawBlock(ctx, block, blockLayout, isSelected, isHovered);
    }

    ctx.restore();
  }, [layout, cfg, transform, selectedBlock, hoveredBlock, drawBlock, drawEdge]);

  // Get block at canvas coordinates
  const getBlockAtPosition = useCallback((canvasX: number, canvasY: number): string | null => {
    if (!layout) return null;

    // Transform canvas coordinates to graph coordinates
    const graphX = (canvasX - transform.offsetX) / transform.scale;
    const graphY = (canvasY - transform.offsetY) / transform.scale;

    for (const [blockId, blockLayout] of layout.blocks) {
      const { x, y, width, height } = blockLayout;
      if (graphX >= x && graphX <= x + width && graphY >= y && graphY <= y + height) {
        return blockId;
      }
    }

    return null;
  }, [layout, transform]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isPanning && lastPanPos) {
      const dx = x - lastPanPos.x;
      const dy = y - lastPanPos.y;
      setTransform(prev => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy
      }));
      setLastPanPos({ x, y });
      setTooltipInfo(null); // Hide tooltip while panning
      return;
    }

    const blockId = getBlockAtPosition(x, y);
    setHoveredBlock(blockId);

    // Update tooltip info
    if (blockId && cfg) {
      const block = cfg.blocks.get(blockId);
      if (block) {
        setTooltipInfo({
          block,
          x: e.clientX,
          y: e.clientY
        });
      } else {
        setTooltipInfo(null);
      }
    } else {
      setTooltipInfo(null);
    }
  }, [isPanning, lastPanPos, getBlockAtPosition, cfg]);

  // Handle mouse down (start panning)
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (e.button === 0) { // Left click
      const blockId = getBlockAtPosition(x, y);

      if (blockId && cfg) {
        const block = cfg.blocks.get(blockId);
        if (block && onAddressClick) {
          onAddressClick(block.startAddress);
        }
      }
    } else if (e.button === 2) { // Right click - start panning
      e.preventDefault();
      setIsPanning(true);
      setLastPanPos({ x, y });
    }
  }, [getBlockAtPosition, cfg, onAddressClick]);

  // Handle mouse up (stop panning)
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setLastPanPos(null);
  }, []);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    setLastPanPos(null);
    setHoveredBlock(null);
    setTooltipInfo(null);
  }, []);

  // Handle mouse wheel (zoom)
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;

    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.2, Math.min(3.0, prev.scale + delta))
    }));
  }, []);

  // Handle context menu (prevent default)
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  }, []);

  // Redraw on changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Resize canvas to container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [draw]);

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-slate-900 ${className}`}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        className="cursor-crosshair"
      />

      {/* Tooltip - displayed when hovering over a block */}
      {tooltipInfo && (
        <div
          className="fixed z-[9999] p-3 text-xs font-mono bg-[#0a0a0a] text-[#ededed] rounded-md max-w-md backdrop-blur-sm pointer-events-none"
          style={{
            left: `${tooltipInfo.x + 15}px`,
            top: `${tooltipInfo.y + 15}px`,
            boxShadow: '0 0 10px rgba(0, 136, 255, 0.4), 0 0 20px rgba(0, 255, 157, 0.2)',
            border: '1px solid #0088ff',
            borderLeft: '3px solid #00ff9d',
            backgroundImage: 'linear-gradient(135deg, rgba(0, 136, 255, 0.05) 25%, transparent 25%, transparent 50%, rgba(0, 136, 255, 0.05) 50%, rgba(0, 136, 255, 0.05) 75%, transparent 75%, transparent)',
            backgroundSize: '20px 20px'
          }}
        >
          <div className="font-bold text-blue-400 mb-2">{tooltipInfo.block.id}</div>
          <div className="text-gray-400 mb-1">Type: <span className="text-amber-400">{tooltipInfo.block.type.toUpperCase()}</span></div>
          <div className="text-gray-400 mb-1">
            Range: <span className="text-green-400">0x{tooltipInfo.block.startAddress.toString(16).toUpperCase()}</span>
            {' - '}
            <span className="text-green-400">0x{tooltipInfo.block.endAddress.toString(16).toUpperCase()}</span>
          </div>
          <div className="text-gray-400 mb-2">Instructions: <span className="text-cyan-400">{tooltipInfo.block.instructions.length}</span></div>

          {tooltipInfo.block.successors.length > 0 && (
            <div className="text-gray-400 text-[10px] mt-2">
              <div className="text-purple-400">Successors:</div>
              {tooltipInfo.block.successors.map(succ => (
                <div key={succ} className="ml-2">→ {succ}</div>
              ))}
            </div>
          )}

          {tooltipInfo.block.predecessors.length > 0 && (
            <div className="text-gray-400 text-[10px] mt-1">
              <div className="text-pink-400">Predecessors:</div>
              {tooltipInfo.block.predecessors.map(pred => (
                <div key={pred} className="ml-2">← {pred}</div>
              ))}
            </div>
          )}

          <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-[#00ff9d]" style={{ clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)' }}></div>
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute top-2 left-2 bg-slate-800/90 text-slate-200 text-xs px-3 py-2 rounded border border-slate-600 font-mono">
        <div>Blocks: {cfg?.blocks.size || 0}</div>
        <div>Complexity: {cfg?.metadata.cyclomaticComplexity || 0}</div>
        <div>Loops: {cfg?.loops?.length || 0}</div>
        <div className="mt-2 text-slate-400">
          <div>Left Click: Select</div>
          <div>Right Drag: Pan</div>
          <div>Scroll: Zoom</div>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(3.0, prev.scale + 0.2) }))}
          className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded border border-slate-600 text-sm"
        >
          +
        </button>
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(0.2, prev.scale - 0.2) }))}
          className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded border border-slate-600 text-sm"
        >
          −
        </button>
        <button
          onClick={() => setTransform({ offsetX: 50, offsetY: 50, scale: 1.0 })}
          className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded border border-slate-600 text-xs"
        >
          Reset
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-slate-800/90 text-slate-200 text-xs px-3 py-2 rounded border border-slate-600">
        <div className="font-bold mb-1">Block Types:</div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-900 border border-blue-500"></div>
          <span>Entry</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-900 border border-amber-500"></div>
          <span>Branch</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-900 border border-purple-500"></div>
          <span>Call</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-900 border border-pink-500"></div>
          <span>Return</span>
        </div>
      </div>
    </div>
  );
};
