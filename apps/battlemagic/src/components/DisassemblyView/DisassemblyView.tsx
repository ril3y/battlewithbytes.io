"use client";

/**
 * Disassembly View Component
 *
 * Provides disassembled view of ARM/Thumb instructions for debugging.
 * Shows instruction addresses, bytes, mnemonics, and control flow.
 * Supports breakpoint management and symbol resolution.
 */

import React, { useEffect, useCallback, useRef } from "react";
import { useDisassemblyNavigation } from "../../lib/hooks/useDisassemblyNavigation";
import { useAnalysis } from "../../lib/context/AnalysisContext";
import { useFirmwareOptional } from "../../lib/context/FirmwareContext";
import type { DisassemblyViewProps, DisassemblyLine, ViewMode } from "./types";
import type { DisassembledInstruction } from "../../lib/arch/arm/disasm";

// Import hooks
import {
  useDisassembler,
  useDisassemblyState,
  useBreakpoints,
  useKeyboardShortcuts,
  useMemoryChunks,
  useEnrichedDisassembly,
  useInfiniteScroll,
} from "./hooks";

// Import components
import {
  DisassemblyHeader,
  DisassemblyStatusBar,
  DisassemblyStatusLine,
  GraphViewWrapper,
  LinearView,
  GoToModal,
} from "./components";
import CommentEditor from "../CommentEditor";
import FunctionRenameModal from "../FunctionRenameModal";
import type { CommentType } from "../../lib/db/AnalysisDatabase";

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
  onToggleBreakpoint,
}: DisassemblyViewProps) {
  // Initialize hooks
  const { disassembler, disassemblerReady, isLoading, error, setError } =
    useDisassembler(onOutput);
  const {
    getCommentsAt,
    setComment,
    deleteComment,
    getFunctionAt,
    renameFunction,
  } = useAnalysis();
  const firmwareContext = useFirmwareOptional();
  const memoryChunks = useMemoryChunks(5); // Keep max 5 chunks in memory
  const enrichedDisassembly = useEnrichedDisassembly();
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] =
    React.useState(false);
  const [showArgAnnotations, setShowArgAnnotations] = React.useState(true);
  const [commentType, setCommentType] = React.useState<CommentType>("standard");

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
    showRenameModal,
    setShowRenameModal,
    selectedFunctionAddress,
    setSelectedFunctionAddress,
    isMouseOverPanel,
    setIsMouseOverPanel,
    symbols,
  } = state;

  // Use breakpoints from props if provided, otherwise use local hook
  const localBreakpointsHook = useBreakpoints(
    gdbClient,
    isConnected,
    onOutput,
    setError,
  );

  const breakpoints = breakpointsProp || localBreakpointsHook.breakpoints;
  const toggleBreakpoint =
    onToggleBreakpoint || localBreakpointsHook.toggleBreakpoint;

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const jumpHighlightTimeout = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedOnMount = useRef<boolean>(false);
  const followPC = useRef<boolean>(true); // Track if we should auto-follow PC

  // Load disassembly - defined before navigation hook to avoid hoisting issues
  const loadDisassembly = useCallback(
    async (
      address: number,
      length: number,
      append: "none" | "top" | "bottom" = "none",
    ) => {
      const hasFirmware = firmwareContext?.hasFirmware() ?? false;
      if ((!isConnected && !hasFirmware) || !onReadMemory) {
        setError("Not connected to target and no cached firmware available");
        return;
      }

      if (!disassemblerReady || !disassembler.current) {
        setError("Disassembler not ready");
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
          // Suppress error logging during connection state changes (detach/reattach)
          // These are expected and harmless race conditions
          if (isConnected) {
            setError("Failed to read memory");
            console.warn(
              "[DisassemblyView] Memory read returned null (target may be detaching)",
            );
          }
          return;
        }

        // Disassemble the data (supports both Capstone async and ArmDisassembler sync)
        let instructions: DisassembledInstruction[];
        try {
          const disasmResult = disassembler.current.disassemble(
            data,
            address,
            true,
          );
          instructions =
            disasmResult instanceof Promise ? await disasmResult : disasmResult;
        } catch (error) {
          // Remove chunk on failure to allow retry
          memoryChunks.removeChunk(address);
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          console.error(
            `[DisassemblyView] Disassembly failed at 0x${address.toString(16)}:`,
            errorMsg,
          );
          setError(
            `Failed to disassemble at 0x${address.toString(16)}: ${errorMsg}`,
          );
          return;
        }

        // Analyze control flow
        const flowMap = disassembler.current.analyzeControlFlow(instructions);

        // Build cross-reference map (only for branches, not sequential flow)
        const crossRefs = new Map<number, number[]>();
        const instructionAddresses = new Set(
          instructions.map((i: DisassembledInstruction) => i.address),
        );

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
            disassembler.current?.isFunctionEntry(insts, idx) ?? false,
        );

        // Append or replace lines based on mode
        if (append === "top") {
          // Prepend to existing lines
          setLines((prevLines: DisassemblyLine[]) => [
            ...displayLines,
            ...prevLines,
          ]);
          setRawInstructions((prevInstructions: DisassembledInstruction[]) => [
            ...instructions,
            ...prevInstructions,
          ]);
        } else if (append === "bottom") {
          // Append to existing lines
          setLines((prevLines: DisassemblyLine[]) => [
            ...prevLines,
            ...displayLines,
          ]);
          setRawInstructions((prevInstructions: DisassembledInstruction[]) => [
            ...prevInstructions,
            ...instructions,
          ]);
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
        console.error("[DisassemblyView] Load error:", err);
      }
    },
    [
      isConnected,
      onReadMemory,
      breakpoints,
      disassemblerReady,
      programCounter,
      disassembler,
      setError,
      setLines,
      setRawInstructions,
      memoryChunks,
      enrichedDisassembly,
      infiniteScrollEnabled,
      firmwareContext,
    ],
  );

  // Navigation history hook - placed after loadDisassembly to avoid hoisting issues
  const navigation = useDisassemblyNavigation({
    onNavigate: useCallback(
      (address: number, mode: ViewMode) => {
        setViewMode(mode);
        setBaseAddress(address);
        setAddressInput(`0x${address.toString(16)}`);
        loadDisassembly(address, bytesToRead);
      },
      [
        bytesToRead,
        loadDisassembly,
        setViewMode,
        setBaseAddress,
        setAddressInput,
      ],
    ),
    onFollowPCChange: useCallback((enabled: boolean) => {
      followPC.current = enabled;
    }, []),
  });

  // Load previous chunk (scrolling up)
  const loadPreviousChunk = useCallback(async () => {
    if (lines.length === 0) return;

    // Disable follow PC when user manually scrolls
    followPC.current = false;

    const firstAddress = lines[0].instruction.address;
    // Use larger chunk size for cached firmware (4KB), smaller for GDB/UART (512 bytes)
    const chunkSize = firmwareContext?.hasFirmware() ? 4096 : 512;
    const previousAddress = Math.max(0, firstAddress - chunkSize);

    await loadDisassembly(previousAddress, chunkSize, "top");

    // Prune distant chunks to keep memory usage under control
    const currentCenter = firstAddress;
    memoryChunks.pruneDistantChunks(currentCenter, chunkSize * 3); // Keep 3 chunks worth
  }, [lines, loadDisassembly, memoryChunks, firmwareContext]);

  // Load next chunk (scrolling down)
  const loadNextChunk = useCallback(async () => {
    if (lines.length === 0) return;

    // Disable follow PC when user manually scrolls
    followPC.current = false;

    const lastAddress = lines[lines.length - 1].instruction.address;
    // Use larger chunk size for cached firmware (4KB), smaller for GDB/UART (512 bytes)
    const chunkSize = firmwareContext?.hasFirmware() ? 4096 : 512;
    const nextAddress = lastAddress + 4; // Start after last instruction (ARM is 2-4 bytes)

    await loadDisassembly(nextAddress, chunkSize, "bottom");

    // Prune distant chunks to keep memory usage under control
    const currentCenter = lastAddress;
    memoryChunks.pruneDistantChunks(currentCenter, chunkSize * 3); // Keep 3 chunks worth
  }, [lines, loadDisassembly, memoryChunks, firmwareContext]);

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
      // Always parse as hexadecimal (with or without 0x prefix)
      // Remove 0x/0X prefix if present
      const cleanAddress = addressInput.replace(/^0x/i, "");
      addr = parseInt(cleanAddress, 16);

      if (isNaN(addr) || addr < 0) {
        setError("Invalid address");
        return;
      }

      // Add to navigation history
      navigation.addToHistory(addr, viewMode);

      // Disable follow PC when manually navigating
      followPC.current = false;

      setBaseAddress(addr);
      loadDisassembly(addr, bytesToRead);
    } catch (err) {
      console.error("Address parsing error:", err);
      setError("Invalid address format");
    }
  }, [
    addressInput,
    bytesToRead,
    loadDisassembly,
    setError,
    setBaseAddress,
    navigation,
    viewMode,
  ]);

  // Go to PC handler
  const handleGoToPC = useCallback(() => {
    if (programCounter !== undefined) {
      // Re-enable follow PC when user explicitly goes to PC
      followPC.current = true;

      // Check if PC is already in the current view - don't reload if it is
      const pcInView = lines.some(
        (line: DisassemblyLine) => line.instruction.address === programCounter,
      );
      if (pcInView) {
        // Just scroll to PC - use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          const pcElement = containerRef.current?.querySelector(
            `[data-address="${programCounter}"]`,
          );
          if (pcElement) {
            pcElement.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            // Fallback: If element not found immediately, try again after a short delay
            setTimeout(() => {
              const retryElement = containerRef.current?.querySelector(
                `[data-address="${programCounter}"]`,
              );
              if (retryElement) {
                retryElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }, 50);
          }
        });
        return;
      }

      // Check if PC is within firmware bounds (if firmware context is available)
      if (firmwareContext) {
        const firmwareBase = firmwareContext.baseAddress;
        const firmwareSize = firmwareContext.size;
        if (
          programCounter < firmwareBase ||
          programCounter >= firmwareBase + firmwareSize
        ) {
          console.warn(
            `[DisassemblyView] PC 0x${programCounter.toString(16)} is outside firmware bounds (0x${firmwareBase.toString(16)} - 0x${(firmwareBase + firmwareSize).toString(16)})`,
          );
          // Still try to load from GDB if available
        }
      }

      // Align to 16-byte boundary before PC
      const alignedAddr = (programCounter & ~0xf) - 32;
      setBaseAddress(alignedAddr);
      setAddressInput(`0x${alignedAddr.toString(16)}`);
      loadDisassembly(alignedAddr, bytesToRead);
    }
  }, [
    programCounter,
    bytesToRead,
    loadDisassembly,
    setBaseAddress,
    setAddressInput,
    lines,
    containerRef,
    firmwareContext,
  ]);

  // Navigate to a branch target
  const handleNavigateToBranch = useCallback(
    async (targetAddress: number) => {
      // Prevent concurrent loads
      if (isLoading) {
        return;
      }

      // Check if target is already in view - if so, just scroll to it
      const targetInView = lines.some(
        (line: DisassemblyLine) => line.instruction.address === targetAddress,
      );
      if (targetInView) {
        // Target already loaded, just scroll and highlight
        setJumpedToAddress(targetAddress);
        setSelectedAddress(targetAddress);

        // Scroll to target with slight delay to ensure state updates
        // Performance: Separate scrolling from clicking to prevent forced reflow
        requestAnimationFrame(() => {
          const targetElement = containerRef.current?.querySelector(
            `[data-address="${targetAddress}"]`,
          );
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            // Delay click until after scroll completes to prevent forced reflow
            setTimeout(() => {
              (targetElement as HTMLElement).click();
            }, 50);
          }
        });

        // Clear any existing highlight timeout
        if (jumpHighlightTimeout.current) {
          clearTimeout(jumpHighlightTimeout.current);
        }

        // Clear highlight after 3 seconds
        jumpHighlightTimeout.current = setTimeout(() => {
          setJumpedToAddress(null);
        }, 3000);

        return;
      }

      // Target not in view, need to load new memory range
      // Align to 16-byte boundary and subtract offset to center target in view
      const alignedAddress = (targetAddress & ~0xf) - 64; // Load 64 bytes before target

      // Add to history (this also disables Follow PC)
      navigation.addToHistory(targetAddress, viewMode);

      // Navigate
      setBaseAddress(alignedAddress);
      setAddressInput(`0x${alignedAddress.toString(16)}`);

      // Set jumped-to address for temporary highlighting BEFORE loading
      setJumpedToAddress(targetAddress);
      setSelectedAddress(targetAddress);

      // Load disassembly and wait for it to complete
      await loadDisassembly(alignedAddress, bytesToRead);

      // After load completes, scroll to the target address
      // Use setTimeout to ensure DOM has updated with new instructions
      setTimeout(() => {
        const targetElement = containerRef.current?.querySelector(
          `[data-address="${targetAddress}"]`,
        );
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
          // Performance: Delay click until after scroll to prevent forced reflow
          setTimeout(() => {
            (targetElement as HTMLElement).click();
          }, 50);
        } else {
          console.warn(
            `[Navigation] Target address ${targetAddress.toString(16)} not found in loaded range`,
          );
        }
      }, 100);

      // Clear any existing highlight timeout
      if (jumpHighlightTimeout.current) {
        clearTimeout(jumpHighlightTimeout.current);
      }

      // Clear highlight after 3 seconds
      jumpHighlightTimeout.current = setTimeout(() => {
        setJumpedToAddress(null);
      }, 3000);
    },
    [
      bytesToRead,
      loadDisassembly,
      viewMode,
      navigation,
      isLoading,
      setBaseAddress,
      setAddressInput,
      setJumpedToAddress,
      setSelectedAddress,
      lines,
      containerRef,
    ],
  );

  // Handle Go To address submission
  const handleGoToSubmit = useCallback(async () => {
    setGoToError(null);

    try {
      // Parse address
      let addr = 0;
      const input = goToAddress.trim();

      if (!input) {
        setGoToError("Please enter an address");
        return;
      }

      // Handle $pc syntax
      if (input.includes("$pc")) {
        if (programCounter === undefined) {
          setGoToError(
            "PC not available - not connected or no program running",
          );
          return;
        }

        // Replace $pc with actual PC value
        // Support: $pc, $pc+0x10, $pc-0x20, $pc+100, $pc-50
        const pcMatch = input.match(/\$pc\s*([+\-])\s*(0x[0-9a-fA-F]+|[0-9]+)/);

        if (pcMatch) {
          // Has offset: $pc+offset or $pc-offset
          const operator = pcMatch[1];
          const offsetStr = pcMatch[2];
          const offset = offsetStr.startsWith("0x")
            ? parseInt(offsetStr, 16)
            : parseInt(offsetStr, 10);

          if (isNaN(offset)) {
            setGoToError("Invalid offset value");
            return;
          }

          addr =
            operator === "+"
              ? programCounter + offset
              : programCounter - offset;
        } else if (input === "$pc") {
          // Just $pc
          addr = programCounter;
        } else {
          setGoToError("Invalid $pc syntax. Use: $pc, $pc+0x10, or $pc-0x20");
          return;
        }
      } else {
        // Regular address parsing - always treat as hexadecimal (with or without 0x prefix)
        const cleanInput = input.replace(/^0x/i, "");
        addr = parseInt(cleanInput, 16);
      }

      if (isNaN(addr) || addr < 0) {
        setGoToError("Invalid address format");
        return;
      }

      // Validate address range (ARM address space)
      if (addr > 0xffffffff) {
        setGoToError("Address out of range (max: 0xFFFFFFFF)");
        return;
      }

      // Try to read a small amount of memory to validate the address
      if (isConnected && onReadMemory) {
        const testData = await onReadMemory(addr, 4);
        if (!testData) {
          setGoToError(
            "Cannot read from this address - may be invalid or inaccessible",
          );
          return;
        }
      }

      // Address is valid, navigate to it
      setShowGoToModal(false);
      setGoToAddress(""); // Clear input for next time
      handleNavigateToBranch(addr);
    } catch (err) {
      setGoToError(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }, [
    goToAddress,
    programCounter,
    isConnected,
    onReadMemory,
    handleNavigateToBranch,
    setGoToError,
    setShowGoToModal,
    setGoToAddress,
  ]);

  // Handle comment submission
  const handleCommentSubmit = useCallback(
    (text: string, type: CommentType) => {
      if (selectedAddress !== null && text.trim()) {
        setComment(selectedAddress, text.trim(), type);
      }
    },
    [selectedAddress, setComment],
  );

  // Handle comment deletion
  const handleCommentDelete = useCallback(
    (type: CommentType) => {
      if (selectedAddress !== null) {
        deleteComment(selectedAddress, type);
      }
    },
    [selectedAddress, deleteComment],
  );

  // Handle line selection on click
  // Performance: Debounce to prevent multiple rapid state updates
  const lineClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleLineClick = useCallback(
    (address: number) => {
      // Cancel pending click if user clicks rapidly
      if (lineClickTimeoutRef.current) {
        clearTimeout(lineClickTimeoutRef.current);
      }

      // Debounce click handling to batch state updates (reduces re-renders)
      lineClickTimeoutRef.current = setTimeout(() => {
        setSelectedAddress(address);

        // Clear jump highlight when clicking on a different line
        if (jumpedToAddress !== null && jumpedToAddress !== address) {
          setJumpedToAddress(null);
          if (jumpHighlightTimeout.current) {
            clearTimeout(jumpHighlightTimeout.current);
          }
        }

        // Check if this line is a function entry
        const line = lines.find((l) => l.instruction.address === address);
        if (line?.isFunctionEntry) {
          setSelectedFunctionAddress(address);
        } else {
          setSelectedFunctionAddress(null);
        }
      }, 0); // 0ms debounce - just batches synchronous clicks into next tick
    },
    [
      setSelectedAddress,
      setSelectedFunctionAddress,
      lines,
      jumpedToAddress,
      setJumpedToAddress,
    ],
  );

  // Handle function header click - sets the function address for renaming
  const handleFunctionHeaderClick = useCallback(
    (address: number) => {
      setSelectedFunctionAddress(address);
      setSelectedAddress(address);
    },
    [setSelectedFunctionAddress, setSelectedAddress],
  );

  // Handle function rename submission
  const handleFunctionRename = useCallback(
    (newName: string) => {
      if (selectedFunctionAddress !== null) {
        renameFunction(selectedFunctionAddress, newName);
      }
    },
    [selectedFunctionAddress, renameFunction],
  );

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
      const pcInView = lines.some(
        (line: DisassemblyLine) => line.instruction.address === programCounter,
      );

      if (!pcInView && lines.length > 0) {
        // PC is outside visible range, reload disassembly centered on PC
        handleGoToPC();
      } else if (pcInView && containerRef.current) {
        // PC is in view, just scroll to it - use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          const pcElement = containerRef.current?.querySelector(
            `[data-address="${programCounter}"]`,
          );
          if (pcElement) {
            pcElement.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            // Fallback: If element not found immediately, try again after a short delay
            setTimeout(() => {
              const retryElement = containerRef.current?.querySelector(
                `[data-address="${programCounter}"]`,
              );
              if (retryElement) {
                retryElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }, 50);
          }
        });
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
        isCurrentPC: line.instruction.address === programCounter,
      }));
      return updated;
    });
  }, [programCounter, setLines]);

  // Update breakpoint indicators when breakpoints change (without reloading disassembly)
  useEffect(() => {
    setLines((prevLines: DisassemblyLine[]) => {
      const updated = prevLines.map((line: DisassemblyLine) => ({
        ...line,
        isBreakpoint: breakpoints.has(line.instruction.address),
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

  // Auto-load when connected OR when firmware is cached (offline analysis mode)
  // This effect ensures disassembly reloads when:
  // 1. Component mounts for the first time
  // 2. Component remounts after switching views (e.g., from Breakpoints Manager back to Debugger)
  // 3. User connects to a new target
  // 4. User loads analysis from database with cached firmware
  //
  // Key insight: When switching views, the component unmounts/remounts but programCounter prop
  // doesn't change. We use hasLoadedOnMount ref to detect this case and trigger reload.
  // CRITICAL: Reset the ref on unmount so it works correctly on remount.
  useEffect(() => {
    const hasFirmware = firmwareContext?.hasFirmware() ?? false;
    const shouldLoad =
      (isConnected || hasFirmware) &&
      programCounter !== undefined &&
      disassemblerReady &&
      !hasLoadedOnMount.current;

    if (shouldLoad) {
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
  }, [isConnected, programCounter, disassemblerReady, firmwareContext]);

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
  }, [
    jumpToAddress,
    handleNavigateToBranch,
    handleGoToPC,
    programCounter,
    isLoading,
    onJumpComplete,
  ]);

  // Keyboard shortcuts
  useKeyboardShortcuts(
    isMouseOverPanel,
    showGoToModal,
    setShowGoToModal,
    setGoToAddress,
    setGoToError,
    showCommentModal,
    setShowCommentModal,
    selectedAddress,
    setCommentType,
    showRenameModal,
    setShowRenameModal,
    selectedFunctionAddress,
  );

  // Note: Comment loading is now handled by CommentEditor component

  // Infinite scroll hook
  const { topSentinelRef, bottomSentinelRef } = useInfiniteScroll({
    onLoadPrevious: loadPreviousChunk,
    onLoadNext: loadNextChunk,
    threshold: 0.1,
    rootMargin: "50px", // Use same default as hook
    enabled:
      infiniteScrollEnabled &&
      (isConnected || (firmwareContext?.hasFirmware() ?? false)),
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
        showArgAnnotations={showArgAnnotations}
        setShowArgAnnotations={setShowArgAnnotations}
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
      {viewMode === "graph" ? (
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
          showArgAnnotations={showArgAnnotations}
          symbols={symbols}
          registers={registers}
          selectedAddress={selectedAddress}
          jumpedToAddress={jumpedToAddress}
          containerRef={containerRef}
          onLineClick={handleLineClick}
          onToggleBreakpoint={toggleBreakpoint}
          onAddressClick={onAddressClick}
          onNavigateToBranch={handleNavigateToBranch}
          onFunctionHeaderClick={handleFunctionHeaderClick}
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
        <CommentEditor
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          onSubmit={handleCommentSubmit}
          onDelete={handleCommentDelete}
          address={selectedAddress || 0}
          existingComments={
            selectedAddress ? getCommentsAt(selectedAddress) : new Map()
          }
          initialType={commentType}
        />
      )}

      {/* Function Rename Modal */}
      {selectedFunctionAddress !== null && (
        <FunctionRenameModal
          isOpen={showRenameModal}
          onClose={() => setShowRenameModal(false)}
          onSubmit={handleFunctionRename}
          address={selectedFunctionAddress}
          currentName={
            getFunctionAt(selectedFunctionAddress)?.name ||
            `sub_${selectedFunctionAddress.toString(16).toUpperCase()}`
          }
        />
      )}
    </div>
  );
}
