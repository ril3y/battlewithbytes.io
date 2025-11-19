'use client';

/**
 * Linear View Component
 *
 * The main table with all disassembly lines.
 * Includes breakpoints, addresses, bytes, mnemonics, operands, comments, and jump arrows.
 * Provides interactive features like breakpoint toggling, address navigation, and branch following.
 * Enhanced with cross-reference indicators from WASM analyzer.
 */

import React, { useState, useMemo, useEffect } from 'react';
import type { DisassemblyLine, JumpInfo } from '../types';
import { formatAddress, formatBytes, getInstructionColor, analyzeJumps } from '../utils';
import { ArrowRight, Target } from 'lucide-react';
import { useAnalysisOptional } from '../../../lib/context/AnalysisContext';
import { LoopColumn, injectLoopStyles, generateLoopVisualization } from '../utils/loopRenderer';
import { ArgumentAnnotation } from '../../ArgumentAnnotation';
import { getVectorNumber, getStandardVectorName, isInVectorTable } from '../../../lib/utils/vectorTableUtils';

interface LinearViewProps {
  isConnected: boolean;
  lines: DisassemblyLine[];
  showBytes: boolean;
  showArgAnnotations?: boolean;
  symbols: Map<number, string>;
  registers?: Map<string, number>;
  selectedAddress: number | null;
  jumpedToAddress: number | null;
  programCounter?: number;
  onLineClick: (address: number) => void;
  onToggleBreakpoint: (address: number) => void;
  onAddressClick?: (address: number) => void;
  onNavigateToBranch: (address: number) => void;
  onFunctionHeaderClick?: (address: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onLoadPrevious?: () => void;
  onLoadNext?: () => void;
  infiniteScrollEnabled?: boolean;
  topSentinelRef?: React.RefObject<HTMLDivElement | null>;
  bottomSentinelRef?: React.RefObject<HTMLDivElement | null>;
}

export function LinearView({
  isConnected,
  lines,
  showBytes,
  showArgAnnotations = true,
  symbols,
  registers,
  selectedAddress,
  jumpedToAddress,
  programCounter,
  onLineClick,
  onToggleBreakpoint,
  onAddressClick,
  onNavigateToBranch,
  onFunctionHeaderClick,
  containerRef,
  infiniteScrollEnabled = false,
  topSentinelRef,
  bottomSentinelRef
}: LinearViewProps) {
  const [hoveredAddress, setHoveredAddress] = useState<number | null>(null);
  const [hoveredLoop, setHoveredLoop] = useState<number | null>(null);
  const analysisContext = useAnalysisOptional();
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Inject loop visualization styles on mount
  useEffect(() => {
    injectLoopStyles();
  }, []);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Debounced hover handler for xrefs
  const handleXrefHoverEnter = React.useCallback((address: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredAddress(address);
    }, 300);
  }, []);

  const handleXrefHoverLeave = React.useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredAddress(null);
  }, []);

  // Check if ANY loops exist in the entire analysis (for column rendering)
  const hasLoopsGlobally = useMemo(() => {
    if (!analysisContext) return false;
    return analysisContext.loops.length > 0;
  }, [analysisContext]);

  // Calculate global max nesting depth for consistent column width
  const maxLoopDepth = useMemo(() => {
    if (!analysisContext || !hasLoopsGlobally) return 0;
    return analysisContext.loops.reduce((max, loop) => Math.max(max, loop.nesting_level), 0);
  }, [analysisContext, hasLoopsGlobally]);

  // Get loops from database that overlap with visible range
  const loopsInRange = useMemo(() => {
    if (!analysisContext || lines.length === 0) return [];

    const startAddr = lines[0].instruction.address;
    const endAddr = lines[lines.length - 1].instruction.address;
    return analysisContext.getLoopsInRange(startAddr, endAddr);
  }, [analysisContext, lines]);

  // Generate loop visualization for visible lines
  const loopLines = useMemo(() => {
    if (loopsInRange.length === 0 || lines.length === 0) {
      return new Map();
    }

    const addresses = lines.map(line => line.instruction.address);
    return generateLoopVisualization(addresses, loopsInRange);
  }, [lines, loopsInRange]);

  // Get reset vector address from vector table (vector_number = 1)
  const resetVectorAddress = useMemo(() => {
    if (!analysisContext) return null;
    const vectorTable = analysisContext.getVectorTable();
    const resetVector = vectorTable.find(entry => entry.vector_number === 1);
    return resetVector?.handler_address ?? null;
  }, [analysisContext]);

  // Pre-compute all enriched data for each line (optimization: prevents re-lookup on every render)
  const enrichedLines = useMemo(() => {
    if (!lines.length) return [];

    return lines.map(line => {
      const inst = line.instruction;
      const functionInfo = analysisContext?.getFunctionAt(inst.address);
      const xrefsTo = analysisContext?.getXrefsTo(inst.address) || [];
      const xrefsFrom = analysisContext?.getXrefsFrom(inst.address) || [];
      const commentsAtAddress = analysisContext?.getCommentsAt(inst.address) || new Map();

      // Pre-compute argument annotations for bl/blx instructions
      let argAnnotation = undefined;
      let targetFunc = undefined;
      if ((inst.mnemonic === 'bl' || inst.mnemonic === 'blx') && analysisContext) {
        argAnnotation = analysisContext.getArgAnnotation(inst.address);
        if (argAnnotation) {
          targetFunc = analysisContext.getFunctionAt(argAnnotation.function_target);
        }
      }

      // Check if any xref targets have repeatable comments
      let targetRepeatableComment = undefined;
      if (xrefsFrom.length > 0 && analysisContext) {
        for (const xref of xrefsFrom) {
          const targetComments = analysisContext.getCommentsAt(xref.to_addr);
          const repeatable = targetComments?.get('repeatable');
          if (repeatable) {
            targetRepeatableComment = repeatable;
            break; // Use first repeatable comment found
          }
        }
      }

      // Check if this is the reset vector entry point
      const isResetVector = resetVectorAddress !== null && inst.address === resetVectorAddress;

      // Check if this address is in the vector table region (ARM Cortex-M only)
      // MIPS uses fixed exception vectors, not a table, so skip this for MIPS
      const vectorTable = analysisContext?.getVectorTable() || [];
      const baseAddress = analysisContext?.baseAddress || 0;

      const maxVectorAddr = vectorTable.length > 0 ? Math.max(...vectorTable.map(v => v.vector_number)) * 4 + 4 : 192;
      const isVectorTableEntry = vectorTable.length > 0 && isInVectorTable(inst.address, baseAddress, maxVectorAddr / 4);
      const vectorNum = isVectorTableEntry ? getVectorNumber(inst.address, baseAddress) : null;

      // Get vector table entry details if this is a vector
      let vectorInfo = null;
      if (vectorNum !== null) {
        const vectorEntry = vectorTable.find(v => v.vector_number === vectorNum);
        vectorInfo = {
          vectorNumber: vectorNum,
          standardName: getStandardVectorName(vectorNum),
          customName: vectorEntry?.handler_name,
          handlerAddress: vectorEntry?.handler_address,
          isValid: vectorEntry?.is_valid ?? false,
        };
      }

      return {
        line,
        inst,
        functionInfo,
        xrefsTo,
        xrefsFrom,
        commentsAtAddress,
        argAnnotation,
        targetFunc,
        isResetVector,
        targetRepeatableComment,
        isVectorTableEntry,
        vectorInfo
      };
    });
  }, [lines, analysisContext, resetVectorAddress]);

  // Debug log vector table detection
  useEffect(() => {
    const vectorTable = analysisContext?.getVectorTable() || [];
    const baseAddress = analysisContext?.baseAddress || 0;
    if (vectorTable.length > 0) {
      console.log('[LinearView] Vector table detected:', vectorTable.length, 'entries, base:', `0x${baseAddress.toString(16)}`);
    }
  }, [analysisContext]);

  if (!isConnected) {
    return (
      <div className="text-gray-500 text-center mt-4">
        Connect to target to view disassembly
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="text-lg mb-4">No Disassembly Loaded</div>
        <div className="text-sm text-center mb-4 max-w-md">
          To view disassembly:
          <ul className="mt-2 text-left list-disc list-inside">
            <li>Click <span className="text-green-400 font-bold">Go to PC</span> to view code at program counter</li>
            <li>Enter an address and click <span className="text-green-400 font-bold">Go</span></li>
            <li>Or click <span className="text-green-400 font-bold">Refresh</span> to reload current view</li>
          </ul>
        </div>
        <div className="text-xs text-gray-500">
          {programCounter !== undefined && `PC is at 0x${programCounter.toString(16).toUpperCase()}`}
        </div>
      </div>
    );
  }

  const jumps = analyzeJumps(lines);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto font-mono text-xs p-2"
      style={{ lineHeight: '1.4' }}
    >
      <table className="w-full table-fixed">
        {/* Jump arrows column is the last col */}
        <colgroup>
          {/* Loop visualization column - leftmost, dynamic width based on nesting */}
          {maxLoopDepth > 0 && (
            <col style={{ width: `${maxLoopDepth * 16 + 8}px` }} />
          )}
          <col style={{ width: '2rem' }} />
          <col style={{ width: '7rem' }} />
          {showBytes && <col style={{ width: '9rem' }} />}
          <col style={{ width: '5rem' }} />
          <col style={{ width: 'auto' }} />
          <col style={{ width: '12rem' }} />
          <col style={{ width: '4rem' }} />
        </colgroup>
        <thead className="sticky top-0 bg-gray-900 z-10">
          <tr className="text-gray-500 text-xs border-b border-gray-700">
            {maxLoopDepth > 0 && (
              <th className="text-center pb-1 bg-gray-900" title="Loop visualization"></th>
            )}
            <th className="text-center pb-1 bg-gray-900" title="Breakpoint">BP</th>
            <th className="text-left pb-1 bg-gray-900">Address</th>
            {showBytes && <th className="text-left pb-1 bg-gray-900">Bytes</th>}
            <th className="text-left pb-1 bg-gray-900">Mnem</th>
            <th className="text-left pb-1 bg-gray-900">Operands</th>
            <th className="text-left pb-1 bg-gray-900">Comment</th>
            <th className="text-left pb-1 bg-gray-900" title="Jump visualization">Jumps</th>
          </tr>
        </thead>
        <tbody>
          {/* Top sentinel for infinite scroll */}
          {infiniteScrollEnabled && topSentinelRef && (
            <tr>
              <td colSpan={showBytes ? (maxLoopDepth > 0 ? 8 : 7) : (maxLoopDepth > 0 ? 7 : 6)}>
                <div
                  ref={topSentinelRef}
                  className="h-1 w-full"
                  style={{ minHeight: '1px' }}
                />
              </td>
            </tr>
          )}
          {enrichedLines.map((enriched, index) => {
            const { line, inst, functionInfo, xrefsTo, xrefsFrom, commentsAtAddress, argAnnotation, targetFunc, isResetVector, targetRepeatableComment, isVectorTableEntry, vectorInfo } = enriched;
            const symbol = symbols.get(inst.address);

            // Extract specific comment types from pre-computed data
            const standardComment = commentsAtAddress.get('standard');
            const repeatableComment = commentsAtAddress.get('repeatable');
            const anteriorComment = commentsAtAddress.get('anterior');
            const blockComment = commentsAtAddress.get('block');

            // Get loop visualization for this line
            const loopLineInfo = loopLines.get(index);
            const isLoopActive = hoveredLoop !== null && loopLineInfo?.activeLoops.includes(hoveredLoop);

            // Check if this line is a loop header or back edge based on address
            const isLoopHeader = loopsInRange.some(loop =>
              loop.header_addr === inst.address && loop.nesting_level === hoveredLoop
            );
            const isLoopBackEdge = loopsInRange.some(loop =>
              loop.back_edge_addr === inst.address && loop.nesting_level === hoveredLoop
            );

            return (
              <React.Fragment key={index}>
                {/* Vector Table Entry - render as data, not instructions */}
                {isVectorTableEntry && vectorInfo ? (
                  <tr
                    className={`font-mono text-xs select-text ${
                      line.isCurrentPC ? 'bg-yellow-900/30' : ''
                    } ${
                      selectedAddress === inst.address
                        ? 'bg-blue-900/40'
                        : line.isBreakpoint
                        ? 'bg-red-900/20 hover:bg-red-900/30'
                        : 'hover:bg-gray-800'
                    }`}
                    onClick={() => onLineClick(inst.address)}
                    data-address={inst.address}
                  >
                    {/* Loop visualization column - empty for vector table */}
                    {maxLoopDepth > 0 && <td></td>}

                    {/* BP */}
                    <td
                      className="text-center w-6 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBreakpoint(inst.address);
                      }}
                      title={line.isBreakpoint ? 'Remove breakpoint' : 'Set breakpoint'}
                    >
                      {line.isBreakpoint ? (
                        <span className="text-red-500">●</span>
                      ) : (
                        <span className="text-gray-700 hover:text-red-400">○</span>
                      )}
                    </td>

                    {/* Address */}
                    <td className="text-gray-400 pr-2">
                      {formatAddress(inst.address)}:
                    </td>

                    {/* Bytes - show raw 32-bit value */}
                    {showBytes && (
                      <td className="text-gray-500 pr-4 font-mono">
                        {inst.bytes && inst.bytes.length > 0 ? formatBytes(inst.bytes) : '\u00A0'}
                      </td>
                    )}

                    {/* Vector type instead of mnemonic */}
                    <td className="pr-2 text-purple-400" colSpan={2}>
                      <span className="text-gray-500">dword</span>
                      <span className="ml-2 text-purple-300">{vectorInfo.customName || vectorInfo.standardName}</span>
                      {vectorInfo.handlerAddress !== undefined && (
                        <>
                          {vectorInfo.vectorNumber === 0 ? (
                            <span className="ml-2 text-cyan-400">
                              {formatAddress(vectorInfo.handlerAddress)}
                              <span className="text-gray-500 ml-1">(Initial_SP)</span>
                            </span>
                          ) : (
                            <span
                              className="ml-2 text-cyan-400 cursor-pointer underline hover:text-green-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Don't navigate if user is selecting text
                                const selection = window.getSelection();
                                if (selection && selection.toString().length > 0) {
                                  return;
                                }
                                onNavigateToBranch(vectorInfo.handlerAddress!);
                              }}
                              title={`Jump to handler at ${formatAddress(vectorInfo.handlerAddress)}`}
                            >
                              {formatAddress(vectorInfo.handlerAddress)}
                            </span>
                          )}
                        </>
                      )}
                    </td>

                    {/* Comment */}
                    <td className="text-gray-500 pl-2">
                      {vectorInfo.vectorNumber === 0 && 'Initial stack pointer value'}
                      {vectorInfo.vectorNumber === 1 && 'Reset handler (entry point)'}
                      {vectorInfo.vectorNumber > 1 && `Vector ${vectorInfo.vectorNumber}`}
                    </td>

                    {/* Jumps - hide for vector table */}
                    <td className="text-gray-600 text-sm w-32"></td>
                  </tr>
                ) : null}

                {/* Normal instruction rendering - skip if this is a vector table entry */}
                {!isVectorTableEntry && (
                  <>
                    {/* Reset Vector Header - prominently mark the entry point */}
                    {isResetVector && (
                      <tr>
                        {maxLoopDepth > 0 && <td></td>}
                        <td></td>
                        <td colSpan={showBytes ? 6 : 5} className="border-t-2 border-cyan-500 pt-3">
                          <div className="bg-gradient-to-r from-cyan-900/40 to-transparent p-2 rounded border border-cyan-500/50">
                            <div className="text-cyan-400 font-bold font-mono text-sm flex items-center gap-2">
                              <span className="text-cyan-300 text-lg">▶</span>
                              <span>RESET VECTOR (Entry Point)</span>
                            </div>
                            <div className="text-cyan-500 text-xs mt-1 ml-6">
                              Address: {formatAddress(inst.address)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                {/* Function Header - if this address is a detected function */}
                {functionInfo && (
                  <>
                    <tr>
                      {maxLoopDepth > 0 && <td></td>}
                      <td></td>
                      <td
                        colSpan={showBytes ? 6 : 5}
                        className="border-t border-gray-700 pt-2 cursor-pointer hover:bg-gray-800"
                        onClick={() => {
                          // Don't navigate if user is selecting text
                          const selection = window.getSelection();
                          if (selection && selection.toString().length > 0) {
                            return;
                          }
                          onFunctionHeaderClick?.(inst.address);
                        }}
                        title="Press 'n' to rename this function"
                      >
                        <div className="text-cyan-400 font-bold font-mono text-xs">
                          ; {functionInfo.name} ({functionInfo.callers.length} caller{functionInfo.callers.length !== 1 ? 's' : ''})
                        </div>
                      </td>
                    </tr>

                    {/* Function metadata - stack frame, complexity */}
                    {(functionInfo.stack_frame_size !== undefined || functionInfo.complexity !== undefined) && (
                      <tr>
                        {maxLoopDepth > 0 && <td></td>}
                        <td></td>
                        <td colSpan={showBytes ? 6 : 5}>
                          <div className="text-gray-500 text-xs">
                            ;{' '}
                            {functionInfo.stack_frame_size !== undefined && (
                              <span>Stack: {functionInfo.stack_frame_size} bytes</span>
                            )}
                            {functionInfo.stack_frame_size !== undefined && functionInfo.complexity !== undefined && ' | '}
                            {functionInfo.complexity !== undefined && (
                              <span>Complexity: {functionInfo.complexity}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Stack variables */}
                    {functionInfo.stack_vars && functionInfo.stack_vars.length > 0 && (
                      <tr>
                        {maxLoopDepth > 0 && <td></td>}
                        <td></td>
                        <td colSpan={showBytes ? 6 : 5}>
                          <div className="text-gray-500 text-xs">
                            ; stack vars: {functionInfo.stack_vars.map((v, idx) => (
                              <span key={idx}>
                                {idx > 0 && ', '}
                                [sp{v.offset >= 0 ? '+' : ''}{v.offset}]
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )}

                {/* Symbol/Function name (legacy support) */}
                {symbol && !functionInfo && (
                  <tr>
                    {maxLoopDepth > 0 && <td></td>}
                    <td></td>
                    <td colSpan={showBytes ? 6 : 5} className="text-green-400 font-bold py-1">
                      {symbol}:
                    </td>
                  </tr>
                )}

                {/* Block Comment - Multi-line box above instruction */}
                {blockComment && (
                  <tr>
                    {maxLoopDepth > 0 && <td></td>}
                    <td></td>
                    <td colSpan={showBytes ? 6 : 5}>
                      <div className="my-1 p-2 bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded">
                        <pre className="text-xs font-mono text-yellow-400 whitespace-pre-wrap">; {blockComment.text}</pre>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Anterior Comment - Single line above instruction */}
                {anteriorComment && (
                  <tr>
                    {maxLoopDepth > 0 && <td></td>}
                    <td></td>
                    <td colSpan={showBytes ? 6 : 5} className="text-gray-400 text-xs font-mono">
                      ; {anteriorComment.text}
                    </td>
                  </tr>
                )}

                {/* Instruction line */}
                <tr
                  data-address={inst.address}
                  onClick={() => {
                    // Don't navigate if user is selecting text
                    const selection = window.getSelection();
                    if (selection && selection.toString().length > 0) {
                      return;
                    }
                    onLineClick(inst.address);
                  }}
                  className={`
                    cursor-pointer
                    hover:bg-gray-800
                    transition-colors duration-200
                    ${
                      // Priority order: jumpedTo > PC+Breakpoint > Breakpoint > PC > Selected
                      jumpedToAddress === inst.address
                        ? 'bg-orange-500/40 border-l-4 border-r-4 border-orange-400 animate-pulse ring-2 ring-orange-500/50'
                        : line.isCurrentPC && line.isBreakpoint
                        ? 'bg-gradient-to-r from-red-900/30 to-green-900/30 border-l-4 border-red-500'
                        : line.isBreakpoint
                        ? 'bg-red-900/30 border-l-4 border-red-500'
                        : line.isCurrentPC
                        ? 'bg-green-900 bg-opacity-20'
                        : selectedAddress === inst.address
                        ? 'bg-blue-900 bg-opacity-20'
                        : ''
                    }
                    ${isLoopActive ? 'loop-active' : ''}
                    ${isLoopHeader ? 'loop-header' : ''}
                    ${isLoopBackEdge ? 'loop-backedge' : ''}
                  `}
                >
                  {/* Loop visualization column - leftmost */}
                  {maxLoopDepth > 0 && (
                    <td style={{ padding: 0, verticalAlign: 'middle' }}>
                      <LoopColumn
                        lineInfo={loopLineInfo}
                        isHovered={isLoopActive}
                        onLoopHover={setHoveredLoop}
                      />
                    </td>
                  )}

                  {/* Breakpoint toggle (with xref info in tooltip) */}
                  <td
                    className="text-center cursor-pointer hover:bg-gray-700 relative"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBreakpoint(inst.address);
                    }}
                    onMouseEnter={() => handleXrefHoverEnter(inst.address)}
                    onMouseLeave={handleXrefHoverLeave}
                    title={
                      line.isBreakpoint
                        ? 'Remove breakpoint'
                        : line.xrefsTo || line.xrefsFrom
                        ? `Set breakpoint | ${line.xrefsTo || 0} xrefs in, ${line.xrefsFrom || 0} out`
                        : 'Set breakpoint'
                    }
                  >
                    {line.isBreakpoint ? (
                      <span className="text-red-500">●</span>
                    ) : (
                      <span className="text-gray-700 hover:text-red-400">○</span>
                    )}
                    {/* Show xref indicator badges on hover */}
                    {hoveredAddress === inst.address && (line.xrefsTo || line.xrefsFrom) && (
                      <div className="absolute left-full top-0 ml-1 z-50 bg-gray-800 border border-gray-600 rounded px-1.5 py-0.5 text-xs whitespace-nowrap shadow-lg flex items-center gap-1">
                        {line.xrefsFrom && line.xrefsFrom > 0 && (
                          <span className="text-blue-400 flex items-center gap-0.5">
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-[10px]">{line.xrefsFrom}</span>
                          </span>
                        )}
                        {line.xrefsTo && line.xrefsTo > 0 && (
                          <span className="text-green-400 flex items-center gap-0.5">
                            <Target className="w-3 h-3" />
                            <span className="text-[10px]">{line.xrefsTo}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Address */}
                  <td
                    className="text-gray-400 pr-2 cursor-pointer hover:text-green-400 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Don't navigate if user is selecting text
                      const selection = window.getSelection();
                      if (selection && selection.toString().length > 0) {
                        return;
                      }
                      onAddressClick?.(inst.address);
                    }}
                    title="Jump to address in Memory view"
                  >
                    {formatAddress(inst.address)}:
                  </td>

                  {/* Bytes */}
                  {showBytes && (
                    <td className="text-gray-500 pr-4 font-mono">
                      {inst.bytes && inst.bytes.length > 0 ? formatBytes(inst.bytes) : '\u00A0'}
                    </td>
                  )}

                  {/* Mnemonic */}
                  <td className={`pr-2 ${getInstructionColor(inst)}`}>
                    {inst.mnemonic}
                  </td>

                  {/* Operands */}
                  <td className={getInstructionColor(inst)}>
                    {/* Make branch targets clickable */}
                    {inst.isBranch && inst.branchTarget !== undefined ? (
                      <span
                        className="cursor-pointer underline hover:text-green-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Don't navigate if user is selecting text
                          const selection = window.getSelection();
                          if (selection && selection.toString().length > 0) {
                            return;
                          }
                          onNavigateToBranch(inst.branchTarget!);
                        }}
                        title={`Jump to ${formatAddress(inst.branchTarget)}`}
                      >
                        {inst.operands}
                      </span>
                    ) : (
                      inst.operands
                    )}
                    {/* Show branch target symbol if available */}
                    {inst.branchTarget && symbols.has(inst.branchTarget) && (
                      <span className="ml-2 text-green-400">
                        {'<'}{symbols.get(inst.branchTarget)}{'>'}
                      </span>
                    )}
                  </td>

                  {/* Comments */}
                  <td className={`pl-4 ${line.isCurrentPC ? 'text-gray-900' : 'text-gray-500'}`}>
                    {/* Standard comment - green */}
                    {standardComment && (
                      <span className={`text-xs ${line.isCurrentPC ? 'text-green-700 font-semibold' : 'text-green-400'} mr-2`}>
                        ; {standardComment.text}
                      </span>
                    )}
                    {/* Repeatable comment - blue with icon */}
                    {repeatableComment && (
                      <span className={`text-xs ${line.isCurrentPC ? 'text-blue-700 font-semibold' : 'text-blue-400'} mr-2`}>
                        <span className="mr-1">🔄</span>; {repeatableComment.text}
                      </span>
                    )}
                    {/* Repeatable comment from xref target - blue with icon + arrow */}
                    {!repeatableComment && targetRepeatableComment && (
                      <span className={`text-xs ${line.isCurrentPC ? 'text-blue-700 font-semibold' : 'text-blue-400'} mr-2`}>
                        <span className="mr-1">🔄→</span>; {targetRepeatableComment.text}
                      </span>
                    )}
                    {/* Argument annotations for bl/blx instructions (pre-computed) */}
                    {showArgAnnotations && argAnnotation && (
                      <ArgumentAnnotation
                        annotation={argAnnotation}
                        functionName={targetFunc?.name}
                        compact={true}
                      />
                    )}
                    {/* Show xrefs TO this address (callers) */}
                    {xrefsTo.length > 0 && (
                      <div className={`text-xs ${line.isCurrentPC ? 'text-gray-700 font-semibold' : 'text-gray-600'}`}>
                        ; {xrefsTo.length === 1 ? 'xref' : `${xrefsTo.length} xrefs`} from:{' '}
                        {xrefsTo.slice(0, 5).map((xref, idx) => (
                          <React.Fragment key={xref.from_addr}>
                            <span
                              className={`cursor-pointer hover:underline ${
                                line.isCurrentPC ? 'hover:text-cyan-700' : 'hover:text-cyan-400'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Don't navigate if user is selecting text
                                const selection = window.getSelection();
                                if (selection && selection.toString().length > 0) {
                                  return;
                                }
                                onNavigateToBranch(xref.from_addr);
                              }}
                              title={`${xref.instruction} ${xref.operands} from ${formatAddress(xref.from_addr)}`}
                            >
                              {formatAddress(xref.from_addr)}
                            </span>
                            {idx < Math.min(4, xrefsTo.length - 1) && ', '}
                          </React.Fragment>
                        ))}
                        {xrefsTo.length > 5 && (
                          <span className="ml-1">
                            ... +{xrefsTo.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                    {/* Show xrefs FROM this address (targets) - for calls/branches */}
                    {xrefsFrom.length > 0 && xrefsFrom[0].to_addr && (
                      <span className={`text-xs ${line.isCurrentPC ? 'text-gray-700' : 'text-gray-600'}`}>
                        ; → {' '}
                        <span
                          className={`cursor-pointer hover:underline ${
                            line.isCurrentPC ? 'hover:text-cyan-700' : 'hover:text-cyan-400'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Don't navigate if user is selecting text
                            const selection = window.getSelection();
                            if (selection && selection.toString().length > 0) {
                              return;
                            }
                            onNavigateToBranch(xrefsFrom[0].to_addr);
                          }}
                          title={`Jump to ${formatAddress(xrefsFrom[0].to_addr)}`}
                        >
                          {formatAddress(xrefsFrom[0].to_addr)}
                        </span>
                        {analysisContext?.getFunctionAt(xrefsFrom[0].to_addr) && (
                          <span className="text-green-400 ml-1">
                            ({analysisContext.getFunctionAt(xrefsFrom[0].to_addr)?.name})
                          </span>
                        )}
                        {' '}
                      </span>
                    )}
                    {/* Show legacy comment if available and no user comments */}
                    {inst.comment && !standardComment && !repeatableComment && !xrefsTo.length && !xrefsFrom.length && `; ${inst.comment}`}
                    {/* Show register values for register-based branches */}
                    {inst.mnemonic === 'bx' && registers && inst.operands && (
                      <span>
                        {(() => {
                          const regName = inst.operands.toLowerCase();
                          const regValue = registers.get(regName);
                          if (regValue !== undefined) {
                            return ` ; =${formatAddress(regValue)}`;
                          }
                          return '';
                        })()}
                      </span>
                    )}
                  </td>

                  {/* Jump arrows column */}
                  <td className="relative">
                    {jumps
                      .filter((j: JumpInfo) => j.fromLine === index || j.toLine === index)
                      .map((jump: JumpInfo, jIdx: number) => {
                        const isSource = jump.fromLine === index;
                        const isTarget = jump.toLine === index;
                        const color = jump.type === 'forward' ? '#3b82f6' : '#f59e0b'; // blue for forward, amber for backward
                        const xOffset = jump.column * 8 + 4;

                        return (
                          <svg
                            key={jIdx}
                            className="absolute top-0 left-0 pointer-events-none"
                            style={{
                              width: '100%',
                              height: '100%',
                              overflow: 'visible'
                            }}
                          >
                            {/* Vertical line */}
                            {!isSource && !isTarget && (
                              <line
                                x1={xOffset}
                                y1={0}
                                x2={xOffset}
                                y2="100%"
                                stroke={color}
                                strokeWidth="1.5"
                              />
                            )}

                            {/* Arrow from source */}
                            {isSource && (
                              <>
                                <line
                                  x1={2}
                                  y1="50%"
                                  x2={xOffset}
                                  y2="50%"
                                  stroke={color}
                                  strokeWidth="1.5"
                                />
                                <line
                                  x1={xOffset}
                                  y1="50%"
                                  x2={xOffset}
                                  y2={jump.type === 'forward' ? '100%' : '0%'}
                                  stroke={color}
                                  strokeWidth="1.5"
                                />
                              </>
                            )}

                            {/* Arrow to target */}
                            {isTarget && (
                              <>
                                <line
                                  x1={xOffset}
                                  y1={jump.type === 'forward' ? '0%' : '100%'}
                                  x2={xOffset}
                                  y2="50%"
                                  stroke={color}
                                  strokeWidth="1.5"
                                />
                                <line
                                  x1={xOffset}
                                  y1="50%"
                                  x2={2}
                                  y2="50%"
                                  stroke={color}
                                  strokeWidth="1.5"
                                />
                                {/* Arrow head */}
                                <polygon
                                  points={`2,${12} 6,${16} 6,${8}`}
                                  fill={color}
                                />
                              </>
                            )}
                          </svg>
                        );
                      })}
                  </td>
                </tr>
                  </>
                )}
              </React.Fragment>
            );
          })}

          {/* Bottom sentinel for infinite scroll */}
          {infiniteScrollEnabled && bottomSentinelRef && (
            <tr>
              <td colSpan={showBytes ? (maxLoopDepth > 0 ? 8 : 7) : (maxLoopDepth > 0 ? 7 : 6)}>
                <div
                  ref={bottomSentinelRef}
                  className="h-1 w-full"
                  style={{ minHeight: '1px' }}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
