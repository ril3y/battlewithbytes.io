'use client';

/**
 * Disassembly View Component
 *
 * Provides disassembled view of ARM/Thumb instructions for debugging.
 * Shows instruction addresses, bytes, mnemonics, and control flow.
 * Supports breakpoint management and symbol resolution.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArmDisassembler, DisassembledInstruction } from '../lib/disasm/ArmDisassembler';
import { GdbClient } from '../lib/gdb/GdbClient';
import { ControlFlowGraphView } from './ControlFlowGraphView';

interface DisassemblyViewProps {
  onReadMemory: (address: number, length: number) => Promise<Uint8Array | null>;
  programCounter?: number;
  isConnected: boolean;
  registers?: Map<string, number>;
  gdbClient?: GdbClient | null;
  onOutput?: (message: string) => void;
  onAddressClick?: (address: number) => void; // Callback when address is clicked
}

interface DisassemblyLine {
  instruction: DisassembledInstruction;
  isCurrentPC: boolean;
  isBreakpoint: boolean;
  isFunctionEntry: boolean;
  crossRefs: number[];
}

type ViewMode = 'linear' | 'graph';

export default function DisassemblyView({
  onReadMemory,
  programCounter,
  isConnected,
  registers,
  gdbClient,
  onOutput,
  onAddressClick
}: DisassemblyViewProps) {
  const [lines, setLines] = useState<DisassemblyLine[]>([]);
  const [baseAddress, setBaseAddress] = useState<number>(0x08000000); // Default flash base
  const [addressInput, setAddressInput] = useState<string>('0x08000000');
  const [bytesToRead, setBytesToRead] = useState<number>(512); // Increased default for better initial view
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followPC, setFollowPC] = useState(true);
  const [showBytes, setShowBytes] = useState(true);
  const [symbols] = useState<Map<number, string>>(new Map());  // TODO: Implement symbol loading
  const [viewMode, setViewMode] = useState<ViewMode>('linear');
  const [rawInstructions, setRawInstructions] = useState<DisassembledInstruction[]>([]);
  // const [symbols, setSymbols] = useState<Map<number, string>>(new Map());
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());

  const disassembler = useRef(new ArmDisassembler());
  const containerRef = useRef<HTMLDivElement>(null);

  // Load disassembly
  const loadDisassembly = useCallback(async (address: number, length: number) => {
    if (!isConnected || !onReadMemory) {
      setError('Not connected to target');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[DisassemblyView] Reading ${length} bytes from 0x${address.toString(16)}`);
      const data = await onReadMemory(address, length);
      if (!data) {
        setError('Failed to read memory');
        console.error('[DisassemblyView] Memory read returned null');
        return;
      }

      console.log(`[DisassemblyView] Read ${data.length} bytes, disassembling...`);
      // Disassemble the data
      const instructions = disassembler.current.disassemble(data, address, true);
      console.log(`[DisassemblyView] Disassembled ${instructions.length} instructions`);

      // Save raw instructions for CFG view
      setRawInstructions(instructions);

      // Analyze control flow
      const flowMap = disassembler.current.analyzeControlFlow(instructions);

      // Build cross-reference map
      const crossRefs = new Map<number, number[]>();
      for (const [source, targets] of flowMap.entries()) {
        for (const target of targets) {
          if (!crossRefs.has(target)) {
            crossRefs.set(target, []);
          }
          crossRefs.get(target)!.push(source);
        }
      }

      // Create display lines (don't include programCounter in this logic)
      const displayLines: DisassemblyLine[] = instructions.map((inst, index) => ({
        instruction: inst,
        isCurrentPC: false, // Will be updated separately when PC changes
        isBreakpoint: breakpoints.has(inst.address),
        isFunctionEntry: disassembler.current.isFunctionEntry(instructions, index),
        crossRefs: crossRefs.get(inst.address) || []
      }));

      setLines(displayLines);
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, onReadMemory, breakpoints]); // Removed programCounter from dependencies

  // Refresh button handler
  const handleRefresh = useCallback(() => {
    loadDisassembly(baseAddress, bytesToRead);
  }, [loadDisassembly, baseAddress, bytesToRead]);

  // Go to address handler
  const handleGoToAddress = useCallback(() => {
    let addr = 0;
    try {
      if (addressInput.startsWith('0x') || addressInput.startsWith('0X')) {
        addr = parseInt(addressInput, 16);
      } else {
        addr = parseInt(addressInput, 10);
      }

      if (isNaN(addr) || addr < 0) {
        setError('Invalid address');
        return;
      }

      setBaseAddress(addr);
      loadDisassembly(addr, bytesToRead);
    } catch (err) {
      console.error('Address parsing error:', err);
      setError('Invalid address format');
    }
  }, [addressInput, bytesToRead, loadDisassembly]);

  // Go to PC handler
  const handleGoToPC = useCallback(() => {
    if (programCounter !== undefined) {
      // Align to 16-byte boundary before PC
      const alignedAddr = (programCounter & ~0xF) - 32;
      setBaseAddress(alignedAddr);
      setAddressInput(`0x${alignedAddr.toString(16)}`);
      loadDisassembly(alignedAddr, bytesToRead);
    }
  }, [programCounter, bytesToRead, loadDisassembly]);

  // Auto-scroll to PC and reload if PC goes out of range
  useEffect(() => {
    if (followPC && programCounter !== undefined) {
      // Check if PC is in the current instruction list
      const pcInView = lines.some(line => line.instruction.address === programCounter);

      if (!pcInView && lines.length > 0) {
        // PC is outside visible range, reload disassembly centered on PC
        console.log('[DisassemblyView] PC out of range, reloading at', programCounter.toString(16));
        handleGoToPC();
      } else if (pcInView && containerRef.current) {
        // PC is in view, just scroll to it
        const pcElement = containerRef.current.querySelector(`[data-address="${programCounter}"]`);
        if (pcElement) {
          pcElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [programCounter, followPC, lines, handleGoToPC]);

  // Toggle breakpoint at address
  const handleToggleBreakpoint = useCallback(async (address: number) => {
    if (!gdbClient || !isConnected) return;

    const isSet = breakpoints.has(address);

    try {
      if (isSet) {
        // Remove breakpoint
        await gdbClient.removeBreakpoint(address);
        setBreakpoints(prev => {
          const next = new Set(prev);
          next.delete(address);
          return next;
        });
        onOutput?.(`[Breakpoint removed at 0x${address.toString(16).toUpperCase()}]`);
      } else {
        // Add breakpoint
        await gdbClient.insertBreakpoint(address);
        setBreakpoints(prev => new Set(prev).add(address));
        onOutput?.(`[Breakpoint set at 0x${address.toString(16).toUpperCase()}]`);
      }
    } catch (err) {
      setError(`Failed to ${isSet ? 'remove' : 'set'} breakpoint: ${err}`);
    }
  }, [gdbClient, isConnected, breakpoints, onOutput]);

  // Load symbols (could be enhanced to load from ELF file)
  // TODO: Implement symbol loading from ELF files
  // const handleLoadSymbols = useCallback(async () => {
  //   // This is a placeholder - in a real implementation, you would:
  //   // 1. Load ELF file or symbol table
  //   // 2. Parse function names and addresses
  //   // 3. Update the symbols map

  //   // For now, we'll just add some common STM32 symbols as an example
  //   const commonSymbols = new Map<number, string>([
  //     [0x08000000, '_start'],
  //     [0x08000004, 'Reset_Handler'],
  //     [0x08000008, 'NMI_Handler'],
  //     [0x0800000C, 'HardFault_Handler'],
  //   ]);

  //   setSymbols(commonSymbols);
  //   onOutput?.('[Symbols loaded]');
  // }, [onOutput]);

  // Navigate to a branch target
  const handleNavigateToBranch = useCallback((targetAddress: number) => {
    setBaseAddress(targetAddress & ~0xF);
    setAddressInput(`0x${(targetAddress & ~0xF).toString(16)}`);
    loadDisassembly(targetAddress & ~0xF, bytesToRead);
  }, [bytesToRead, loadDisassembly]);

  // Format address for display
  const formatAddress = (addr: number): string => {
    return `0x${addr.toString(16).toUpperCase().padStart(8, '0')}`;
  };

  // Format bytes for display
  const formatBytes = (bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
      .join(' ');
  };

  // Get instruction color based on type
  const getInstructionColor = (inst: DisassembledInstruction): string => {
    const mnem = inst.mnemonic.toLowerCase();

    // Branches and jumps
    if (mnem === 'bx' && inst.operands?.toLowerCase() === 'lr') return 'text-orange-300'; // Return
    if (mnem.startsWith('bl')) return 'text-orange-400'; // Function calls
    if (mnem.startsWith('b')) return 'text-yellow-400'; // Branches

    // Memory operations
    if (mnem.includes('ldr') || mnem.includes('str')) return 'text-blue-400';

    // Stack operations
    if (mnem.includes('push') || mnem.includes('pop')) return 'text-purple-400';
    if (mnem.includes('stm') || mnem.includes('ldm')) return 'text-purple-300';

    // Arithmetic
    if (mnem.includes('add') || mnem.includes('sub') || mnem.includes('mul')) return 'text-cyan-400';

    // Comparisons
    if (mnem.includes('cmp') || mnem.includes('tst')) return 'text-pink-400';

    // Move operations
    if (mnem.includes('mov')) return 'text-green-400';

    // Data directives
    if (mnem.startsWith('.')) return 'text-gray-500';

    // System instructions
    if (mnem === 'svc' || mnem === 'bkpt' || mnem === 'udf') return 'text-red-400';

    return 'text-gray-300'; // Default
  };

  // Update PC highlight when programCounter changes (without reloading disassembly)
  useEffect(() => {
    if (programCounter === undefined) return;

    setLines(prevLines => prevLines.map(line => ({
      ...line,
      isCurrentPC: line.instruction.address === programCounter
    })));
  }, [programCounter]);

  // Auto-load when connected (only on initial connect, not on every PC change)
  useEffect(() => {
    if (isConnected && programCounter !== undefined && followPC && lines.length === 0) {
      console.log('[DisassemblyView] Auto-loading disassembly at PC:', programCounter.toString(16));
      handleGoToPC();
    }
  }, [isConnected, programCounter, followPC, handleGoToPC, lines.length]);

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-900 border-b border-gray-700">
        <button
          onClick={handleRefresh}
          disabled={!isConnected || isLoading}
          className="px-3 py-1 text-xs font-mono bg-gray-800 text-green-400 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Refresh
        </button>

        <div className="flex items-center gap-1">
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleGoToAddress();
              }
            }}
            placeholder="Address"
            className="px-2 py-1 text-xs font-mono bg-gray-800 text-gray-300 rounded w-24"
          />
          <button
            onClick={handleGoToAddress}
            disabled={!isConnected || isLoading}
            className="px-2 py-1 text-xs font-mono bg-gray-800 text-green-400 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Go
          </button>
        </div>

        <button
          onClick={handleGoToPC}
          disabled={!isConnected || !programCounter || isLoading}
          className="px-3 py-1 text-xs font-mono bg-gray-800 text-green-400 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          Go to PC
        </button>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => setViewMode('linear')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              viewMode === 'linear'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Linear
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1 text-xs font-mono rounded ${
              viewMode === 'graph'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Graph
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <label className="flex items-center gap-1 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={followPC}
              onChange={(e) => setFollowPC(e.target.checked)}
              className="rounded"
            />
            Follow PC
          </label>

          {viewMode === 'linear' && (
            <label className="flex items-center gap-1 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={showBytes}
                onChange={(e) => setShowBytes(e.target.checked)}
                className="rounded"
              />
              Show Bytes
            </label>
          )}

          <select
            value={bytesToRead}
            onChange={(e) => setBytesToRead(parseInt(e.target.value))}
            className="px-2 py-1 text-xs font-mono bg-gray-800 text-gray-300 rounded"
          >
            <option value="128">128 bytes</option>
            <option value="256">256 bytes</option>
            <option value="512">512 bytes</option>
            <option value="1024">1KB</option>
            <option value="2048">2KB</option>
          </select>
        </div>
      </div>

      {/* Status bar */}
      {(error || isLoading) && (
        <div className="px-3 py-1 bg-gray-900 border-b border-gray-700">
          {isLoading && <span className="text-xs text-yellow-400">Loading...</span>}
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
      )}

      {/* Disassembly display */}
      {viewMode === 'graph' ? (
        /* Graph View */
        <div className="flex-1 overflow-hidden">
          {!isConnected ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Connect to target to view control flow graph
            </div>
          ) : rawInstructions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-lg mb-4">🔀 No Control Flow Graph</div>
              <div className="text-sm text-center mb-4 max-w-md">
                Load disassembly first:
                <ul className="mt-2 text-left list-disc list-inside">
                  <li>Switch to <span className="text-blue-400 font-bold">Linear</span> view</li>
                  <li>Click <span className="text-green-400 font-bold">Go to PC</span> to load instructions</li>
                  <li>Return to <span className="text-blue-400 font-bold">Graph</span> view</li>
                </ul>
              </div>
              <div className="text-xs text-gray-500">
                {programCounter !== undefined && `PC is at 0x${programCounter.toString(16).toUpperCase()}`}
              </div>
            </div>
          ) : (
            <ControlFlowGraphView
              instructions={rawInstructions}
              selectedAddress={programCounter}
              onAddressClick={onAddressClick}
            />
          )}
        </div>
      ) : (
        /* Linear View */
        <div
          ref={containerRef}
          className="flex-1 overflow-auto font-mono text-xs p-2"
          style={{ lineHeight: '1.4' }}
        >
          {!isConnected ? (
            <div className="text-gray-500 text-center mt-4">
              Connect to target to view disassembly
            </div>
          ) : lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-lg mb-4">📋 No Disassembly Loaded</div>
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
          ) : (
            <table className="w-full">
            <colgroup>
              <col className="w-4" />
              <col className="w-24" />
              {showBytes && <col className="w-32" />}
              <col className="w-20" />
              <col />
              <col className="w-32" />
            </colgroup>
            <tbody>
              {lines.map((line, index) => {
                const inst = line.instruction;
                const symbol = symbols.get(inst.address);

                return (
                  <React.Fragment key={index}>
                    {/* Function entry separator */}
                    {line.isFunctionEntry && (
                      <tr>
                        <td colSpan={showBytes ? 6 : 5} className="py-1">
                          <div className="border-t border-gray-700"></div>
                        </td>
                      </tr>
                    )}

                    {/* Symbol/Function name */}
                    {symbol && (
                      <tr>
                        <td></td>
                        <td colSpan={showBytes ? 5 : 4} className="text-green-400 font-bold py-1">
                          {symbol}:
                        </td>
                      </tr>
                    )}

                    {/* Cross-references */}
                    {line.crossRefs.length > 0 && (
                      <tr>
                        <td></td>
                        <td colSpan={showBytes ? 5 : 4} className="text-gray-500 text-xs">
                          ; xref: {line.crossRefs.map(addr => formatAddress(addr)).join(', ')}
                        </td>
                      </tr>
                    )}

                    {/* Instruction line */}
                    <tr
                      data-address={inst.address}
                      className={`
                        hover:bg-gray-800
                        ${line.isCurrentPC ? 'bg-green-900 bg-opacity-20' : ''}
                        ${line.isBreakpoint ? 'bg-red-900 bg-opacity-20' : ''}
                      `}
                    >
                      {/* PC indicator / Breakpoint toggle */}
                      <td
                        className="text-center cursor-pointer hover:bg-gray-700"
                        onClick={() => handleToggleBreakpoint(inst.address)}
                        title={line.isBreakpoint ? 'Remove breakpoint' : 'Set breakpoint'}
                      >
                        {line.isCurrentPC && (
                          <span className="text-green-400">▶</span>
                        )}
                        {line.isBreakpoint && (
                          <span className="text-red-400">●</span>
                        )}
                        {!line.isCurrentPC && !line.isBreakpoint && (
                          <span className="text-gray-600 hover:text-red-400">○</span>
                        )}
                      </td>

                      {/* Address */}
                      <td
                        className="text-gray-400 pr-2 cursor-pointer hover:text-green-400 hover:underline"
                        onClick={() => onAddressClick?.(inst.address)}
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
                            onClick={() => handleNavigateToBranch(inst.branchTarget!)}
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
                      <td className="text-gray-500 pl-4">
                        {inst.comment && `; ${inst.comment}`}
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
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
        </div>
      )}

      {/* Status line */}
      <div className="px-3 py-1 bg-gray-900 border-t border-gray-700 text-xs text-gray-400">
        {programCounter !== undefined && (
          <span className="mr-4">
            PC: {formatAddress(programCounter)}
          </span>
        )}
        {lines.length > 0 && (
          <span>
            {lines.length} instructions |
            Range: {formatAddress(lines[0].instruction.address)} -
            {formatAddress(lines[lines.length - 1].instruction.address + lines[lines.length - 1].instruction.size)}
          </span>
        )}
      </div>
    </div>
  );
}