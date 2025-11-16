'use client';

/**
 * Disassembly View Component
 *
 * Provides disassembled view of ARM/Thumb instructions for debugging.
 * Shows instruction addresses, bytes, mnemonics, and control flow.
 * Supports breakpoint management and symbol resolution.
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useDisassemblyNavigation } from '../../lib/hooks/useDisassemblyNavigation';
import { useAnalysis } from '../../lib/context/AnalysisContext';
import type {
  DisassemblyViewProps,
  DisassemblyLine,
  ViewMode
} from './types';
import type { DisassembledInstruction } from '../../lib/disasm/ArmDisassembler';

// Import hooks
import {
  useDisassembler,
  useDisassemblyState,
  useBreakpoints,
  useKeyboardShortcuts,
  useMemoryChunks,
  useEnrichedDisassembly,
  useInfiniteScroll
} from './hooks';

// Import components
import {
  DisassemblyHeader,
  DisassemblyStatusBar,
  DisassemblyStatusLine,
  GraphViewWrapper,
  LinearView,
  GoToModal
} from './components';
import CommentModal from './components/CommentModal';

export default function DisassemblyView({
  onReadMemory,
  programCounter,
  isConnected,
  registers,
  gdbClient,
  onOutput,
  onAddressClick,
  jumpToAddress,
  onJumpComplete,
  breakpoints: breakpointsProp,
  onToggleBreakpoint
}: DisassemblyViewProps) {
  // Initialize hooks
  const { disassembler, disassemblerReady, isLoading, error, setError } = useDisassembler(onOutput);
  const { getComment, setComment, deleteComment } = useAnalysis();
  const memoryChunks = useMemoryChunks(5); // Keep max 5 chunks in memory
  const enrichedDisassembly = useEnrichedDisassembly();
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = React.useState(false);

  const state = useDisassemblyState();
  const {
    lines,
    setLines,
    rawInstructions,
    setRawInstructions,
    baseAddress,
    setBaseAddress,
    addressInput,
    setAddressInput,
    selectedAddress,
    setSelectedAddress,
    jumpedToAddress,
    setJumpedToAddress,
    bytesToRead,
    setBytesToRead,
    showBytes,
    setShowBytes,
    viewMode,
    setViewMode,
    showGoToModal,
    setShowGoToModal,
    goToAddress,
    setGoToAddress,
    goToError,
    setGoToError,
    showCommentModal,
    setShowCommentModal,
    commentText,
    setCommentText,
    isMouseOverPanel,
    setIsMouseOverPanel,
    symbols
  } = state;

  // Use breakpoints from props if provided, otherwise use local hook
  const localBreakpointsHook = useBreakpoints(
    gdbClient,
    isConnected,
    onOutput,
    setError
  );

  const breakpoints = breakpointsProp || localBreakpointsHook.breakpoints;
  const toggleBreakpoint = onToggleBreakpoint || localBreakpointsHook.toggleBreakpoint;

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const jumpHighlightTimeout = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedOnMount = useRef<boolean>(false);
  const followPC = useRef<boolean>(true); // Track if we should auto-follow PC

  // Load disassembly - defined before navigation hook to avoid hoisting issues
  const loadDisassembly = useCallback(async (address: number, length: number, append: 'none' | 'top' | 'bottom' = 'none') => {
    if (!isConnected || !onReadMemory) {
      setError('Not connected to target');
      return;
    }

    if (!disassemblerReady || !disassembler.current) {
      setError('Disassembler not ready');
      return;
    }

    // Check if this range is already loaded (for infinite scroll)
    if (memoryChunks.isRangeLoaded(address, address + length)) {
      return;
    }

    // Track this memory chunk IMMEDIATELY to prevent race conditions
    // (before async operations start)
    memoryChunks.addChunk(address, address + length);

    setError(null);

    try {
      const data = await onReadMemory(address, length);
      if (!data) {
        // Remove chunk on failure to allow retry
        memoryChunks.removeChunk(address);
        setError('Failed to read memory');
        console.error('[DisassemblyView] Memory read returned null');
        return;
      }

      // Disassemble the data (supports both Capstone async and ArmDisassembler sync)
      const disasmResult = disassembler.current.disassemble(data, address, true);
      const instructions = disasmResult instanceof Promise ? await disasmResult : disasmResult;

      // Analyze control flow
      const flowMap = disassembler.current.analyzeControlFlow(instructions);

      // Build cross-reference map (only for branches, not sequential flow)
      const crossRefs = new Map<number, number[]>();
      const instructionAddresses = new Set(instructions.map((i: DisassembledInstruction) => i.address));

      for (const [source, targets] of flowMap.entries()) {
        for (const target of targets) {
          // Only add cross-reference if target is in our instruction list
          // This prevents showing xrefs for every instruction
          if (instructionAddresses.has(target)) {
            if (!crossRefs.has(target)) {
              crossRefs.set(target, []);
            }
            crossRefs.get(target)!.push(source);
          }
        }
      }

      // Use enriched disassembly hook to merge database + UART data
      const displayLines = enrichedDisassembly.enrichInstructions(
        instructions,
        programCounter,
        breakpoints,
        crossRefs,
        (insts: DisassembledInstruction[], idx: number) =>
          disassembler.current?.isFunctionEntry(insts, idx) ?? false
      );

      // Append or replace lines based on mode
      if (append === 'top') {
        // Prepend to existing lines
        setLines((prevLines: DisassemblyLine[]) => [...displayLines, ...prevLines]);
        setRawInstructions((prevInstructions: DisassembledInstruction[]) => [...instructions, ...prevInstructions]);
      } else if (append === 'bottom') {
        // Append to existing lines
        setLines((prevLines: DisassemblyLine[]) => [...prevLines, ...displayLines]);
        setRawInstructions((prevInstructions: DisassembledInstruction[]) => [...prevInstructions, ...instructions]);
      } else {
        // Replace all lines (normal load)
        setLines(displayLines);
        setRawInstructions(instructions);
      }

      // Enable infinite scroll after first successful load
      if (!infiniteScrollEnabled) {
        setInfiniteScrollEnabled(true);
      }
    } catch (err) {
      // Remove chunk on error to allow retry
      memoryChunks.removeChunk(address);
      setError(`Error: ${err}`);
      console.error('[DisassemblyView] Load error:', err);
    }
  }, [isConnected, onReadMemory, breakpoints, disassemblerReady, programCounter, disassembler, setError, setLines, setRawInstructions, memoryChunks, enrichedDisassembly, infiniteScrollEnabled]);

  // Navigation history hook - placed after loadDisassembly to avoid hoisting issues
  const navigation = useDisassemblyNavigation({
    onNavigate: useCallback((address: number, mode: ViewMode) => {
      setViewMode(mode);
      setBaseAddress(address);
      setAddressInput(`0x${address.toString(16)}`);
      loadDisassembly(address, bytesToRead);
    }, [bytesToRead, loadDisassembly, setViewMode, setBaseAddress, setAddressInput]),
    onFollowPCChange: useCallback((enabled: boolean) => {
      followPC.current = enabled;
    }, [])
  });

  // Load previous chunk (scrolling up)
  const loadPreviousChunk = useCallback(async () => {
    if (lines.length === 0) return;

    // Disable follow PC when user manually scrolls
    followPC.current = false;

    const firstAddress = lines[0].instruction.address;
    const chunkSize = 512; // Load 512 bytes at a time
    const previousAddress = Math.max(0, firstAddress - chunkSize);

    await loadDisassembly(previousAddress, chunkSize, 'top');

    // Prune distant chunks to keep memory usage under control
    const currentCenter = firstAddress;
    memoryChunks.pruneDistantChunks(currentCenter, chunkSize * 3); // Keep 3 chunks worth
  }, [lines, loadDisassembly, memoryChunks]);

  // Load next chunk (scrolling down)
  const loadNextChunk = useCallback(async () => {
    if (lines.length === 0) return;

    // Disable follow PC when user manually scrolls
    followPC.current = false;

    const lastAddress = lines[lines.length - 1].instruction.address;
    const chunkSize = 512; // Load 512 bytes at a time
    const nextAddress = lastAddress + 4; // Start after last instruction (ARM is 2-4 bytes)

    await loadDisassembly(nextAddress, chunkSize, 'bottom');

    // Prune distant chunks to keep memory usage under control
    const currentCenter = lastAddress;
    memoryChunks.pruneDistantChunks(currentCenter, chunkSize * 3); // Keep 3 chunks worth
  }, [lines, loadDisassembly, memoryChunks]);

  // Refresh button handler
  const handleRefresh = useCallback(() => {
    // Clear chunks and reload from base address
    memoryChunks.clearChunks();
    setInfiniteScrollEnabled(false);
    loadDisassembly(baseAddress, bytesToRead);
  }, [loadDisassembly, baseAddress, bytesToRead, memoryChunks]);

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

      // Disable follow PC when manually navigating
      followPC.current = false;

      setBaseAddress(addr);
      loadDisassembly(addr, bytesToRead);
    } catch (err) {
      console.error('Address parsing error:', err);
      setError('Invalid address format');
    }
  }, [addressInput, bytesToRead, loadDisassembly, setError, setBaseAddress]);

  // Go to PC handler
  const handleGoToPC = useCallback(() => {
    if (programCounter !== undefined) {
      // Re-enable follow PC when user explicitly goes to PC
      followPC.current = true;

      // Check if PC is already in the current view - don't reload if it is
      const pcInView = lines.some((line: DisassemblyLine) => line.instruction.address === programCounter);
      if (pcInView) {
        // Just scroll to PC
        const pcElement = containerRef.current?.querySelector(`[data-address="${programCounter}"]`);
        if (pcElement) {
          pcElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Align to 16-byte boundary before PC
      const alignedAddr = (programCounter & ~0xF) - 32;
      setBaseAddress(alignedAddr);
      setAddressInput(`0x${alignedAddr.toString(16)}`);
      loadDisassembly(alignedAddr, bytesToRead);
    }
  }, [programCounter, bytesToRead, loadDisassembly, setBaseAddress, setAddressInput, lines, containerRef]);

  // Navigate to a branch target
  const handleNavigateToBranch = useCallback((targetAddress: number) => {
    // Prevent concurrent loads
    if (isLoading) {
      return;
    }

    const alignedAddress = targetAddress & ~0xF;
    // Add to history (this also disables Follow PC)
    navigation.addToHistory(alignedAddress, viewMode);
    // Navigate
    setBaseAddress(alignedAddress);
    setAddressInput(`0x${alignedAddress.toString(16)}`);
    loadDisassembly(alignedAddress, bytesToRead);

    // Set jumped-to address for temporary highlighting
    setJumpedToAddress(targetAddress);

    // Clear any existing highlight timeout
    if (jumpHighlightTimeout.current) {
      clearTimeout(jumpHighlightTimeout.current);
    }

    // Clear highlight after 2 seconds
    jumpHighlightTimeout.current = setTimeout(() => {
      setJumpedToAddress(null);
    }, 2000);
  }, [bytesToRead, loadDisassembly, viewMode, navigation, isLoading, setBaseAddress, setAddressInput, setJumpedToAddress]);

  // Handle Go To address submission
  const handleGoToSubmit = useCallback(async () => {
    setGoToError(null);

    try {
      // Parse address
      let addr = 0;
      const input = goToAddress.trim();

      if (!input) {
        setGoToError('Please enter an address');
        return;
      }

      // Handle $pc syntax
      if (input.includes('$pc')) {
        if (programCounter === undefined) {
          setGoToError('PC not available - not connected or no program running');
          return;
        }

        // Replace $pc with actual PC value
        // Support: $pc, $pc+0x10, $pc-0x20, $pc+100, $pc-50
        const pcMatch = input.match(/\$pc\s*([+\-])\s*(0x[0-9a-fA-F]+|[0-9]+)/);

        if (pcMatch) {
          // Has offset: $pc+offset or $pc-offset
          const operator = pcMatch[1];
          const offsetStr = pcMatch[2];
          const offset = offsetStr.startsWith('0x')
            ? parseInt(offsetStr, 16)
            : parseInt(offsetStr, 10);

          if (isNaN(offset)) {
            setGoToError('Invalid offset value');
            return;
          }

          addr = operator === '+' ? programCounter + offset : programCounter - offset;
        } else if (input === '$pc') {
          // Just $pc
          addr = programCounter;
        } else {
          setGoToError('Invalid $pc syntax. Use: $pc, $pc+0x10, or $pc-0x20');
          return;
        }
      } else {
        // Regular address parsing
        if (input.startsWith('0x') || input.startsWith('0X')) {
          addr = parseInt(input, 16);
        } else {
          addr = parseInt(input, 10);
        }
      }

      if (isNaN(addr) || addr < 0) {
        setGoToError('Invalid address format');
        return;
      }

      // Validate address range (ARM address space)
      if (addr > 0xFFFFFFFF) {
        setGoToError('Address out of range (max: 0xFFFFFFFF)');
        return;
      }

      // Try to read a small amount of memory to validate the address
      if (isConnected && onReadMemory) {
        const testData = await onReadMemory(addr, 4);
        if (!testData) {
          setGoToError('Cannot read from this address - may be invalid or inaccessible');
          return;
        }
      }

      // Address is valid, navigate to it
      setShowGoToModal(false);
      setGoToAddress(''); // Clear input for next time
      handleNavigateToBranch(addr);
    } catch (err) {
      setGoToError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [goToAddress, programCounter, isConnected, onReadMemory, handleNavigateToBranch, setGoToError, setShowGoToModal, setGoToAddress]);

  // Handle comment submission
  const handleCommentSubmit = useCallback(() => {
    if (selectedAddress !== null && commentText.trim()) {
      setComment(selectedAddress, commentText.trim());
      setShowCommentModal(false);
      setCommentText('');
    }
  }, [selectedAddress, commentText, setComment, setShowCommentModal, setCommentText]);

  // Handle comment deletion
  const handleCommentDelete = useCallback(() => {
    if (selectedAddress !== null) {
      deleteComment(selectedAddress);
      setShowCommentModal(false);
      setCommentText('');
    }
  }, [selectedAddress, deleteComment, setShowCommentModal, setCommentText]);

  // Handle line selection on click
  const handleLineClick = useCallback((address: number) => {
    setSelectedAddress(address);
  }, [setSelectedAddress]);

  // Track previous PC to detect actual changes
  const prevProgramCounter = useRef<number | undefined>(undefined);

  // Auto-scroll to PC and reload if PC goes out of range (only if following PC and PC actually changed)
  useEffect(() => {
    // Only react to actual PC changes, not re-renders
    if (programCounter === prevProgramCounter.current) {
      return;
    }

    prevProgramCounter.current = programCounter;

    if (programCounter !== undefined && followPC.current) {
      // Check if PC is in the current instruction list
      const pcInView = lines.some((line: DisassemblyLine) => line.instruction.address === programCounter);

      if (!pcInView && lines.length > 0) {
        // PC is outside visible range, reload disassembly centered on PC
        handleGoToPC();
      } else if (pcInView && containerRef.current) {
        // PC is in view, just scroll to it
        const pcElement = containerRef.current.querySelector(`[data-address="${programCounter}"]`);
        if (pcElement) {
          pcElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
    // Intentionally not including lines and handleGoToPC to prevent re-running on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programCounter]);

  // Update PC highlight when programCounter changes (without reloading disassembly)
  useEffect(() => {
    if (programCounter === undefined) return;

    setLines((prevLines: DisassemblyLine[]) => {
      const updated = prevLines.map((line: DisassemblyLine) => ({
        ...line,
        isCurrentPC: line.instruction.address === programCounter
      }));
      return updated;
    });
  }, [programCounter, setLines]);

  // Update breakpoint indicators when breakpoints change (without reloading disassembly)
  useEffect(() => {
    setLines((prevLines: DisassemblyLine[]) => {
      const updated = prevLines.map((line: DisassemblyLine) => ({
        ...line,
        isBreakpoint: breakpoints.has(line.instruction.address)
      }));
      return updated;
    });
  }, [breakpoints, setLines]);

  // Enable follow PC when connection is established
  useEffect(() => {
    if (isConnected) {
      followPC.current = true;
    }
  }, [isConnected]);

  // Auto-load when connected (only on initial connect, not on every PC change)
  // This effect ensures disassembly reloads when:
  // 1. Component mounts for the first time
  // 2. Component remounts after switching views (e.g., from Breakpoints Manager back to Debugger)
  // 3. User connects to a new target
  //
  // Key insight: When switching views, the component unmounts/remounts but programCounter prop
  // doesn't change. We use hasLoadedOnMount ref to detect this case and trigger reload.
  // CRITICAL: Reset the ref on unmount so it works correctly on remount.
  useEffect(() => {
    if (isConnected && programCounter !== undefined && disassemblerReady && !hasLoadedOnMount.current) {
      // Enable followPC when auto-loading on mount so PC tracking works
      followPC.current = true;
      handleGoToPC();
      hasLoadedOnMount.current = true;
    }

    // Reset flags and clear chunks on unmount
    return () => {
      memoryChunks.clearChunks();
      hasLoadedOnMount.current = false;
      // Also reset followPC so next mount starts fresh
      followPC.current = true;
    };
    // Note: lines.length is intentionally NOT in dependency array to prevent re-running after load
    // handleGoToPC is intentionally NOT in dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, programCounter, disassemblerReady]);

  // Clear jump highlight when PC changes (step/continue)
  useEffect(() => {
    if (programCounter !== undefined && jumpedToAddress !== null) {
      setJumpedToAddress(null);
      if (jumpHighlightTimeout.current) {
        clearTimeout(jumpHighlightTimeout.current);
      }
    }
  }, [programCounter, jumpedToAddress, setJumpedToAddress]);

  // Handle external jump requests (e.g., from clicking PC register)
  useEffect(() => {
    if (jumpToAddress !== undefined && !isLoading) {
      // If jumping to PC, use handleGoToPC which enables Follow PC
      // Otherwise use handleNavigateToBranch which disables Follow PC
      if (jumpToAddress === programCounter) {
        handleGoToPC();
      } else {
        handleNavigateToBranch(jumpToAddress);
      }

      // Clear the jump request after processing
      onJumpComplete?.();
    }
  }, [jumpToAddress, handleNavigateToBranch, handleGoToPC, programCounter, isLoading, onJumpComplete]);

  // Keyboard shortcuts
  useKeyboardShortcuts(
    isMouseOverPanel,
    showGoToModal,
    setShowGoToModal,
    setGoToAddress,
    setGoToError,
    showCommentModal,
    setShowCommentModal,
    selectedAddress
  );

  // Load existing comment when modal opens
  useEffect(() => {
    if (showCommentModal && selectedAddress !== null) {
      const existingComment = getComment(selectedAddress);
      setCommentText(existingComment || '');
    }
  }, [showCommentModal, selectedAddress, getComment, setCommentText]);

  // Infinite scroll hook
  const { topSentinelRef, bottomSentinelRef } = useInfiniteScroll({
    onLoadPrevious: loadPreviousChunk,
    onLoadNext: loadNextChunk,
    threshold: 0.1,
    rootMargin: '200px',
    enabled: infiniteScrollEnabled && isConnected
  });

  return (
    <div
      className="h-full flex flex-col bg-gray-950"
      onMouseEnter={() => setIsMouseOverPanel(true)}
      onMouseLeave={() => setIsMouseOverPanel(false)}
    >
      {/* Toolbar */}
      <DisassemblyHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        addressInput={addressInput}
        setAddressInput={setAddressInput}
        handleGoTo={handleGoToAddress}
        handleGoToPC={handleGoToPC}
        handleRefresh={handleRefresh}
        navigation={navigation}
        showBytes={showBytes}
        setShowBytes={setShowBytes}
        bytesToRead={bytesToRead}
        setBytesToRead={setBytesToRead}
        isConnected={isConnected}
        programCounter={programCounter}
        isLoading={isLoading}
      />

      {/* Status bar */}
      <DisassemblyStatusBar
        disassemblerReady={disassemblerReady}
        isLoading={isLoading}
        error={error}
      />

      {/* Disassembly display */}
      {viewMode === 'graph' ? (
        <GraphViewWrapper
          isConnected={isConnected}
          rawInstructions={rawInstructions}
          programCounter={programCounter}
          onAddressClick={onAddressClick}
        />
      ) : (
        <LinearView
          isConnected={isConnected}
          lines={lines}
          programCounter={programCounter}
          showBytes={showBytes}
          symbols={symbols}
          registers={registers}
          selectedAddress={selectedAddress}
          jumpedToAddress={jumpedToAddress}
          containerRef={containerRef}
          onLineClick={handleLineClick}
          onToggleBreakpoint={toggleBreakpoint}
          onAddressClick={onAddressClick}
          onNavigateToBranch={handleNavigateToBranch}
          onLoadPrevious={loadPreviousChunk}
          onLoadNext={loadNextChunk}
          infiniteScrollEnabled={infiniteScrollEnabled}
          topSentinelRef={topSentinelRef}
          bottomSentinelRef={bottomSentinelRef}
        />
      )}

      {/* Status line */}
      <DisassemblyStatusLine programCounter={programCounter} lines={lines} />

      {/* Go To Address Modal */}
      <GoToModal
        isOpen={showGoToModal}
        onClose={() => setShowGoToModal(false)}
        onSubmit={handleGoToSubmit}
        goToAddress={goToAddress}
        setGoToAddress={setGoToAddress}
        goToError={goToError}
        programCounter={programCounter}
      />

      {/* Comment Modal */}
      {selectedAddress !== null && (
        <CommentModal
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          onSubmit={handleCommentSubmit}
          onDelete={handleCommentDelete}
          address={selectedAddress}
          currentComment={commentText}
          setCurrentComment={setCommentText}
        />
      )}
    </div>
  );
}
