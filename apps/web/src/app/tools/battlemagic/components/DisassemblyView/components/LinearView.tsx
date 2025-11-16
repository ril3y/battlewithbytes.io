'use client';

/**
 * Linear View Component
 *
 * The main table with all disassembly lines.
 * Includes breakpoints, addresses, bytes, mnemonics, operands, comments, and jump arrows.
 * Provides interactive features like breakpoint toggling, address navigation, and branch following.
 * Enhanced with cross-reference indicators from WASM analyzer.
 */

import React, { useState } from 'react';
import type { DisassemblyLine, JumpInfo } from '../types';
import { formatAddress, formatBytes, getInstructionColor, isFunctionEnd, analyzeJumps } from '../utils';
import { ArrowRight, Target } from 'lucide-react';
import { useAnalysisOptional } from '../../../lib/context/AnalysisContext';

interface LinearViewProps {
  isConnected: boolean;
  lines: DisassemblyLine[];
  showBytes: boolean;
  symbols: Map<number, string>;
  registers?: Map<string, number>;
  selectedAddress: number | null;
  jumpedToAddress: number | null;
  programCounter?: number;
  onLineClick: (address: number) => void;
  onToggleBreakpoint: (address: number) => void;
  onAddressClick?: (address: number) => void;
  onNavigateToBranch: (address: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onLoadPrevious?: () => void;
  onLoadNext?: () => void;
  infiniteScrollEnabled?: boolean;
  topSentinelRef?: React.RefObject<HTMLDivElement>;
  bottomSentinelRef?: React.RefObject<HTMLDivElement>;
}

export function LinearView({
  isConnected,
  lines,
  showBytes,
  symbols,
  registers,
  selectedAddress,
  jumpedToAddress,
  programCounter,
  onLineClick,
  onToggleBreakpoint,
  onAddressClick,
  onNavigateToBranch,
  containerRef,
  onLoadPrevious,
  onLoadNext,
  infiniteScrollEnabled = false,
  topSentinelRef,
  bottomSentinelRef
}: LinearViewProps) {
  const [hoveredAddress, setHoveredAddress] = useState<number | null>(null);
  const analysisContext = useAnalysisOptional();

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
          <col style={{ width: '2rem' }} />
          <col style={{ width: '3rem' }} />
          <col style={{ width: '7rem' }} />
          {showBytes && <col style={{ width: '9rem' }} />}
          <col style={{ width: '5rem' }} />
          <col style={{ width: 'auto' }} />
          <col style={{ width: '12rem' }} />
          <col style={{ width: '4rem' }} />
        </colgroup>
        <tbody>
          {/* Top sentinel for infinite scroll */}
          {infiniteScrollEnabled && topSentinelRef && (
            <tr>
              <td colSpan={showBytes ? 8 : 7}>
                <div
                  ref={topSentinelRef}
                  className="h-1 w-full"
                  style={{ minHeight: '1px' }}
                />
              </td>
            </tr>
          )}
          {lines.map((line, index) => {
            const inst = line.instruction;
            const symbol = symbols.get(inst.address);

            // Get function info from analysis context
            const functionInfo = analysisContext?.getFunctionAt(inst.address);
            const xrefsTo = analysisContext?.getXrefsTo(inst.address) || [];
            const xrefsFrom = analysisContext?.getXrefsFrom(inst.address) || [];
            const userComment = analysisContext?.getComment(inst.address);

            return (
              <React.Fragment key={index}>
                {/* Function Header - if this address is a detected function */}
                {functionInfo && (
                  <tr>
                    <td></td>
                    <td></td>
                    <td colSpan={showBytes ? 6 : 5} className="border-t border-gray-700 pt-2">
                      <div className="text-cyan-400 font-bold font-mono text-xs">
                        ;---- {functionInfo.name} ({functionInfo.callers.length} caller{functionInfo.callers.length !== 1 ? 's' : ''}) ----
                      </div>
                    </td>
                  </tr>
                )}

                {/* Symbol/Function name (legacy support) */}
                {symbol && !functionInfo && (
                  <tr>
                    <td></td>
                    <td></td>
                    <td colSpan={showBytes ? 6 : 5} className="text-green-400 font-bold py-1">
                      {symbol}:
                    </td>
                  </tr>
                )}

                {/* Instruction line */}
                <tr
                  data-address={inst.address}
                  onClick={() => onLineClick(inst.address)}
                  className={`
                    cursor-pointer
                    hover:bg-gray-800
                    ${
                      // Priority order: jumpedTo > PC+Breakpoint > Breakpoint > PC > Selected
                      jumpedToAddress === inst.address
                        ? 'bg-orange-600 bg-opacity-30 animate-pulse'
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
                  `}
                >
                  {/* Breakpoint toggle */}
                  <td
                    className="text-center cursor-pointer hover:bg-gray-700"
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

                  {/* Xref indicators */}
                  <td
                    className="text-center relative"
                    onMouseEnter={() => setHoveredAddress(inst.address)}
                    onMouseLeave={() => setHoveredAddress(null)}
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      {/* Xrefs FROM this address (outgoing) */}
                      {line.xrefsFrom && line.xrefsFrom > 0 && (
                        <div className="relative group">
                          <ArrowRight className="w-3 h-3 text-blue-400" />
                          {hoveredAddress === inst.address && (
                            <div className="absolute left-0 top-4 z-50 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                              {line.xrefsFrom} ref{line.xrefsFrom > 1 ? 's' : ''} from here
                            </div>
                          )}
                        </div>
                      )}
                      {/* Xrefs TO this address (incoming) */}
                      {line.xrefsTo && line.xrefsTo > 0 && (
                        <div className="relative group">
                          <Target className="w-3 h-3 text-green-400" />
                          {hoveredAddress === inst.address && (
                            <div className="absolute left-0 top-4 z-50 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                              Called from {line.xrefsTo} location{line.xrefsTo > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Address */}
                  <td
                    className="text-gray-400 pr-2 cursor-pointer hover:text-green-400 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddressClick?.(inst.address);
                    }}
                    title="Jump to address in Memory view"
                  >
                    {formatAddress(inst.address)}:
                  </td>

                  {/* Bytes */}
                  {showBytes && (
                    <td className="text-gray-500 pr-4">
                      {formatBytes(inst.bytes).padEnd(12, ' ')}
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
                  <td className={`pl-4 whitespace-nowrap overflow-hidden text-ellipsis ${line.isCurrentPC ? 'text-gray-900' : 'text-gray-500'}`}>
                    {/* User comment - highest priority, always shown in green if present */}
                    {userComment && (
                      <span className={`text-xs ${line.isCurrentPC ? 'text-green-700 font-semibold' : 'text-green-400'} mr-2`}>
                        ; {userComment}
                      </span>
                    )}
                    {/* Show xrefs TO this address (callers) */}
                    {xrefsTo.length > 0 && (
                      <span className={`text-xs ${line.isCurrentPC ? 'text-gray-700 font-semibold' : 'text-gray-600'}`}>
                        ; {xrefsTo.length === 1 ? 'xref' : `${xrefsTo.length} xrefs`} from:{' '}
                        {xrefsTo.slice(0, 3).map((xref, idx) => (
                          <React.Fragment key={xref.from_addr}>
                            {idx > 0 && ', '}
                            <span
                              className={`cursor-pointer hover:underline ${
                                line.isCurrentPC ? 'hover:text-cyan-700' : 'hover:text-cyan-400'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToBranch(xref.from_addr);
                              }}
                              title={`${xref.instruction} ${xref.operands} from ${formatAddress(xref.from_addr)}`}
                            >
                              {formatAddress(xref.from_addr)}
                            </span>
                          </React.Fragment>
                        ))}
                        {xrefsTo.length > 3 && ` ... +${xrefsTo.length - 3} more`}
                        {' '}
                      </span>
                    )}
                    {/* Show xrefs FROM this address (targets) - for calls/branches */}
                    {xrefsFrom.length > 0 && xrefsFrom[0].to_addr && (
                      <span className={`text-xs ${line.isCurrentPC ? 'text-gray-700' : 'text-gray-600'}`}>
                        ; → {formatAddress(xrefsFrom[0].to_addr)}
                        {analysisContext?.getFunctionAt(xrefsFrom[0].to_addr) && (
                          <span className="text-green-400 ml-1">
                            ({analysisContext.getFunctionAt(xrefsFrom[0].to_addr)?.name})
                          </span>
                        )}
                        {' '}
                      </span>
                    )}
                    {/* Show legacy comment if available and no user comment */}
                    {inst.comment && !userComment && !xrefsTo.length && !xrefsFrom.length && `; ${inst.comment}`}
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

                {/* Function separator - dashed line after return instructions */}
                {isFunctionEnd(inst) && index < lines.length - 1 && (
                  <tr>
                    <td colSpan={showBytes ? 9 : 8}>
                      <div className="border-t border-dashed border-gray-600 my-2" />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}

          {/* Bottom sentinel for infinite scroll */}
          {infiniteScrollEnabled && bottomSentinelRef && (
            <tr>
              <td colSpan={showBytes ? 8 : 7}>
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
