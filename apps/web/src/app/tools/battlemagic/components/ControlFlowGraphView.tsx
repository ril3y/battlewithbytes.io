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
  BasicBlock
} from '../lib/cfg/types';
import { drawGraphBlockNode } from './ControlFlowGraphView/GraphBlockNode';
import { useXref } from '../lib/context/XrefContext';

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

interface BlockXrefInfo {
  incomingCalls: number;
  outgoingCalls: number;
  incomingBranches: number;
  outgoingBranches: number;
  instructionsWithXrefs: number;
  isEntryPoint: boolean;
  isBranchTarget: boolean;
}

interface ContextMenuState {
  blockId: string;
  x: number;
  y: number;
}

export const ControlFlowGraphView: React.FC<ControlFlowGraphViewProps> = ({
  instructions,
  selectedAddress,
  onAddressClick,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Xref context
  const { getXrefsTo, getXrefsFrom, isAnalyzed } = useXref();

  const [cfg, setCfg] = useState<ControlFlowGraph | null>(null);
  const [layout, setLayout] = useState<CFGLayout | null>(null);
  const [transform, setTransform] = useState<ViewTransform>({ offsetX: 50, offsetY: 50, scale: 1.0 });
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{ block: BasicBlock; x: number; y: number } | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState<{ x: number; y: number } | null>(null);
  const [breakpoints] = useState<Set<number>>(new Set()); // TODO: Add breakpoint toggle handler
  const [showOpcodes, setShowOpcodes] = useState(false);
  const [useXrefLayout, setUseXrefLayout] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [blockXrefInfo, setBlockXrefInfo] = useState<Map<string, BlockXrefInfo>>(new Map());

  // Compute xref information for a block
  const computeBlockXrefInfo = useCallback((block: BasicBlock): BlockXrefInfo => {
    if (!isAnalyzed()) {
      return {
        incomingCalls: 0,
        outgoingCalls: 0,
        incomingBranches: 0,
        outgoingBranches: 0,
        instructionsWithXrefs: 0,
        isEntryPoint: false,
        isBranchTarget: false
      };
    }

    let incomingCalls = 0;
    let outgoingCalls = 0;
    let incomingBranches = 0;
    let outgoingBranches = 0;
    let instructionsWithXrefs = 0;

    // Check each instruction in the block
    for (const inst of block.instructions) {
      const xrefsTo = getXrefsTo(inst.address);
      const xrefsFrom = getXrefsFrom(inst.address);

      if (xrefsTo.length > 0 || xrefsFrom.length > 0) {
        instructionsWithXrefs++;
      }

      // Count incoming xrefs
      for (const xref of xrefsTo) {
        if (xref.xref_type === 'Call') incomingCalls++;
        else if (xref.xref_type === 'Branch' || xref.xref_type === 'ConditionalBranch') incomingBranches++;
      }

      // Count outgoing xrefs
      for (const xref of xrefsFrom) {
        if (xref.xref_type === 'Call') outgoingCalls++;
        else if (xref.xref_type === 'Branch' || xref.xref_type === 'ConditionalBranch') outgoingBranches++;
      }
    }

    // Entry point heuristic: first block or has many incoming calls
    const isEntryPoint = block.type === 'entry' || incomingCalls >= 3;
    const isBranchTarget = incomingBranches > 0;

    return {
      incomingCalls,
      outgoingCalls,
      incomingBranches,
      outgoingBranches,
      instructionsWithXrefs,
      isEntryPoint,
      isBranchTarget
    };
  }, [isAnalyzed, getXrefsTo, getXrefsFrom]);

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

      // Step 3: Compute layout with dynamic block heights
      const layoutEngine = new CFGLayoutEngine({
        algorithm: 'hierarchical',
        blockWidth: 280,
        blockHeight: 120, // Base height, will be adjusted per block
        horizontalSpacing: 60,
        verticalSpacing: 80,
        compactLayout: false
      });
      const computedLayout = layoutEngine.computeLayout(result.cfg);

      // Adjust block heights based on instruction count
      for (const [blockId, blockLayout] of computedLayout.blocks) {
        const block = result.cfg.blocks.get(blockId);
        if (block) {
          // Calculate required height: header (48px) + instructions (12px each) + padding (16px)
          const instructionHeight = block.instructions.length * 12;
          const requiredHeight = 48 + instructionHeight + 16;
          blockLayout.height = Math.max(120, requiredHeight);
        }
      }

      // Recalculate bounds after height adjustments
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [, layout] of computedLayout.blocks) {
        minX = Math.min(minX, layout.x);
        minY = Math.min(minY, layout.y);
        maxX = Math.max(maxX, layout.x + layout.width);
        maxY = Math.max(maxY, layout.y + layout.height);
      }
      const padding = 50;
      computedLayout.bounds = {
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2,
        minX,
        minY
      };

      setCfg(result.cfg);
      setLayout(computedLayout);

      // Compute xref info for all blocks
      const xrefInfo = new Map<string, BlockXrefInfo>();
      for (const [blockId, block] of result.cfg.blocks) {
        xrefInfo.set(blockId, computeBlockXrefInfo(block));
      }
      setBlockXrefInfo(xrefInfo);

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
  }, [instructions, computeBlockXrefInfo]);

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


  // Draw arrowhead at end of edge
  const drawArrowhead = useCallback((
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
    color: string
  ) => {
    const headLength = 14; // Increased from 10 to 14 for better visibility
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    // Add shadow for glow effect
    ctx.shadowBlur = 3;
    ctx.shadowColor = color;

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

    // Reset shadow
    ctx.shadowBlur = 0;
  }, []);

  // Draw a basic block using the new GraphBlockNode renderer
  const drawBlock = useCallback((
    ctx: CanvasRenderingContext2D,
    block: BasicBlock,
    blockLayout: BlockLayout,
    isSelected: boolean,
    isHovered: boolean
  ) => {
    const xrefInfo = blockXrefInfo.get(block.id);
    drawGraphBlockNode(ctx, block, blockLayout, {
      programCounter: selectedAddress,
      breakpoints,
      showOpcodes,
      sectionName: undefined, // Could be enhanced to detect section from address
      isSelected,
      isHovered,
      xrefInfo,
      showXrefIndicators: isAnalyzed()
    });
  }, [selectedAddress, breakpoints, showOpcodes, blockXrefInfo, isAnalyzed]);

  // Get edge color and style based on xref type
  const getEdgeStyleForXref = useCallback((edge: EdgeLayout): { color: string; dash: number[]; width: number; label?: string } => {
    if (!isAnalyzed() || !useXrefLayout || !cfg) {
      return { color: edge.color, dash: edge.isBackEdge ? [5, 5] : [], width: 3 };
    }

    // Try to find xrefs between source and target blocks
    const sourceBlock = cfg.blocks.get(edge.from);
    const targetBlock = cfg.blocks.get(edge.to);

    if (!sourceBlock || !targetBlock) {
      return { color: edge.color, dash: edge.isBackEdge ? [5, 5] : [], width: 3 };
    }

    // Check for xrefs from any instruction in source block to target block
    for (const inst of sourceBlock.instructions) {
      const xrefs = getXrefsFrom(inst.address);
      for (const xref of xrefs) {
        // Check if xref points to any instruction in target block
        if (xref.to_addr >= targetBlock.startAddress && xref.to_addr <= targetBlock.endAddress) {
          switch (xref.xref_type) {
            case 'Call':
              return { color: '#60a5fa', dash: [8, 4], width: 3, label: 'call' }; // Blue dashed
            case 'Branch':
              return { color: '#4ade80', dash: [], width: 3, label: 'branch' }; // Green solid
            case 'ConditionalBranch':
              return { color: '#fbbf24', dash: [], width: 3, label: 'cond' }; // Yellow solid
            default:
              break;
          }
        }
      }
    }

    // Fall-through edge (no xref found)
    return { color: '#6b7280', dash: [2, 2], width: 2, label: 'fallthrough' }; // Gray dotted
  }, [isAnalyzed, useXrefLayout, cfg, getXrefsFrom]);

  // Draw an edge
  const drawEdge = useCallback((
    ctx: CanvasRenderingContext2D,
    edge: EdgeLayout
  ) => {
    const { points, isBackEdge } = edge;

    if (points.length < 2) return;

    // Get edge style based on xrefs
    const style = getEdgeStyleForXref(edge);

    // Add glow effect for better visibility
    ctx.shadowBlur = 3;
    ctx.shadowColor = style.color;

    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;

    if (isBackEdge) {
      ctx.setLineDash([5, 5]); // Dashed line for back edges
    } else {
      ctx.setLineDash(style.dash);
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

    // Reset shadow for arrowhead (arrowhead has its own shadow)
    ctx.shadowBlur = 0;

    // Draw arrowhead
    const lastPoint = points[points.length - 1];
    const secondLastPoint = points[points.length - 2];
    drawArrowhead(ctx, secondLastPoint, lastPoint, style.color);

    // Draw edge label if present
    if (style.label && isAnalyzed() && useXrefLayout) {
      const midIdx = Math.floor(points.length / 2);
      const midPoint = points[midIdx];
      ctx.fillStyle = style.color;
      ctx.font = 'bold 9px "Courier New", monospace';
      ctx.fillText(style.label, midPoint.x + 5, midPoint.y - 5);
    }

    ctx.setLineDash([]); // Reset dash
  }, [drawArrowhead, getEdgeStyleForXref, isAnalyzed, useXrefLayout]);

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

    // Close context menu on any click
    setContextMenu(null);

    if (e.button === 0) { // Left click
      const blockId = getBlockAtPosition(x, y);

      if (blockId && cfg) {
        const block = cfg.blocks.get(blockId);
        if (block && onAddressClick) {
          onAddressClick(block.startAddress);
        }
      }
    } else if (e.button === 2) { // Right click
      e.preventDefault();
      const blockId = getBlockAtPosition(x, y);

      if (blockId && isAnalyzed()) {
        // Show context menu for the block
        setContextMenu({
          blockId,
          x: e.clientX,
          y: e.clientY
        });
      } else {
        // Start panning if not on a block
        setIsPanning(true);
        setLastPanPos({ x, y });
      }
    }
  }, [getBlockAtPosition, cfg, onAddressClick, isAnalyzed]);

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

      {/* Analysis Status Banner */}
      {isAnalyzed() ? (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-green-900/90 text-green-200 text-xs px-4 py-2 rounded border border-green-600 font-mono">
          Analysis data available - showing xref-enhanced graph
        </div>
      ) : (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-yellow-900/90 text-yellow-200 text-xs px-4 py-2 rounded border border-yellow-600 font-mono">
          No analysis data - run &apos;Tools → Binary Analysis&apos; for enhanced features
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute top-14 left-2 bg-slate-800/90 text-slate-200 text-xs px-3 py-2 rounded border border-slate-600 font-mono">
        <div>Blocks: {cfg?.blocks.size || 0}</div>
        <div>Complexity: {cfg?.metadata.cyclomaticComplexity || 0}</div>
        <div>Loops: {cfg?.loops?.length || 0}</div>
        <div className="mt-2">
          <label className="flex items-center gap-2 cursor-pointer hover:text-blue-400">
            <input
              type="checkbox"
              checked={showOpcodes}
              onChange={(e) => setShowOpcodes(e.target.checked)}
              className="cursor-pointer"
            />
            <span>Show Opcodes</span>
          </label>
        </div>
        {isAnalyzed() && (
          <div className="mt-2">
            <label className="flex items-center gap-2 cursor-pointer hover:text-blue-400">
              <input
                type="checkbox"
                checked={useXrefLayout}
                onChange={(e) => setUseXrefLayout(e.target.checked)}
                className="cursor-pointer"
              />
              <span>Xref Colors</span>
            </label>
          </div>
        )}
        <div className="mt-2 text-slate-400">
          <div>Left Click: Select</div>
          <div>Right Click: Menu</div>
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
      <div className="absolute bottom-2 left-2 bg-slate-800/90 text-slate-200 text-xs px-3 py-2 rounded border border-slate-600 font-mono max-w-xs">
        <div className="font-bold mb-2">Block Types:</div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-900 border border-blue-500"></div>
            <span className="text-[10px]">Entry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-900 border border-amber-500"></div>
            <span className="text-[10px]">Branch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-900 border border-purple-500"></div>
            <span className="text-[10px]">Call</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-900 border border-pink-500"></div>
            <span className="text-[10px]">Return</span>
          </div>
        </div>

        {isAnalyzed() && useXrefLayout && (
          <>
            <div className="font-bold mb-2 mt-3 pt-2 border-t border-slate-600">Edge Types:</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-blue-400" style={{ borderTop: '2px dashed' }}></div>
                <span className="text-[10px]">Call</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-green-400"></div>
                <span className="text-[10px]">Branch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-yellow-400"></div>
                <span className="text-[10px]">Cond Branch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gray-400" style={{ borderTop: '1px dotted' }}></div>
                <span className="text-[10px]">Fall-through</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && cfg && (
        <div
          className="fixed z-[10000] bg-slate-800 text-slate-200 text-xs rounded border border-slate-600 shadow-lg overflow-hidden font-mono"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
        >
          <div className="px-3 py-2 bg-slate-700 font-bold border-b border-slate-600">
            {contextMenu.blockId}
          </div>
          <button
            onClick={() => {
              const block = cfg.blocks.get(contextMenu.blockId);
              if (block) {
                const xrefInfo = blockXrefInfo.get(contextMenu.blockId);
                if (xrefInfo) {
                  console.log(`[CFG] Callers to ${contextMenu.blockId}:`, xrefInfo.incomingCalls);
                  // Show all xrefs to this block
                  for (const inst of block.instructions) {
                    const xrefs = getXrefsTo(inst.address);
                    if (xrefs.length > 0) {
                      console.log(`  0x${inst.address.toString(16)}: ${xrefs.length} xrefs`);
                      xrefs.forEach(xref => console.log(`    from 0x${xref.from_addr.toString(16)} (${xref.xref_type})`));
                    }
                  }
                }
              }
              setContextMenu(null);
            }}
            className="w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors"
          >
            Show Callers
          </button>
          <button
            onClick={() => {
              const block = cfg.blocks.get(contextMenu.blockId);
              if (block) {
                const xrefInfo = blockXrefInfo.get(contextMenu.blockId);
                if (xrefInfo) {
                  console.log(`[CFG] Callees from ${contextMenu.blockId}:`, xrefInfo.outgoingCalls);
                  // Show all xrefs from this block
                  for (const inst of block.instructions) {
                    const xrefs = getXrefsFrom(inst.address);
                    if (xrefs.length > 0) {
                      console.log(`  0x${inst.address.toString(16)}: ${xrefs.length} xrefs`);
                      xrefs.forEach(xref => console.log(`    to 0x${xref.to_addr.toString(16)} (${xref.xref_type})`));
                    }
                  }
                }
              }
              setContextMenu(null);
            }}
            className="w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors"
          >
            Show Callees
          </button>
          <button
            onClick={() => {
              const block = cfg.blocks.get(contextMenu.blockId);
              if (block && layout) {
                const blockLayout = layout.blocks.get(contextMenu.blockId);
                if (blockLayout) {
                  // Center on this block
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const centerX = blockLayout.x + blockLayout.width / 2;
                    const centerY = blockLayout.y + blockLayout.height / 2;
                    const offsetX = canvas.width / 2 - centerX * transform.scale;
                    const offsetY = canvas.height / 2 - centerY * transform.scale;
                    setTransform(prev => ({ ...prev, offsetX, offsetY }));
                  }
                }
              }
              setContextMenu(null);
            }}
            className="w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors border-t border-slate-600"
          >
            Focus on Block
          </button>
        </div>
      )}
    </div>
  );
};
