'use client';

/**
 * BattleMagic Monitor - Main Application Component
 *
 * Professional IDA Pro-inspired debugger interface for Black Magic Probe
 * with menu bar, toolbar, and organized panels
 *
 * Refactored to use custom hooks for state management
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../battlemagic.css';
import Image from 'next/image';
import Link from 'next/link';
import { GdbClient, GdbClientCallbacks } from '../lib/gdb/GdbClient';
import { ConnectionState, Target, StopReply } from '../lib/gdb/types';
import { XrefProvider } from '../lib/context/XrefContext';
import { useAnalysisOptional } from '../lib/context/AnalysisContext';
import { useFirmwareOptional } from '../lib/context/FirmwareContext';
import MenuBar from './MenuBar';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';
import GdbPanel from './GdbPanel';
import UartPanel from './UartPanel';
import { RegisterValue } from './RegistersPanel';
import { StackFrame } from './StackPanel';
import { TargetInfoPanel } from './TargetInfoPanel';
import FlashProgrammer from './FlashProgrammer';
import BreakpointsManager, { Breakpoint } from './BreakpointsManager';
import FirmwareExtractor from './FirmwareExtractor';
import { MemoryMapView } from './MemoryMapView';
import SwoViewer from './SwoViewer';
import ProjectMenu from './ProjectMenu';
import DebuggerView from './DebuggerView';
import AnalysisPanel, { AnalysisResults } from './AnalysisPanel';
import XrefPanel from './XrefPanel';
import VectorTablePanel from './VectorTablePanel';
import { FirmwareDumpWorkflow } from './FirmwareDumpWorkflow';
import { ChipDatabaseSettings } from './ChipDatabaseSettings';
import AnalysisProgressModal from './AnalysisProgressModal';
import {
  saveGdbPort,
  saveUartPort
} from '../utils/deviceStorage';
import { MemoryRegion } from '../lib/memory/MemoryMapParser';
import { ProjectProvider } from '../lib/context/ProjectContext';
import { detectArchitecture } from '../lib/wasmAnalyzer';
import { AnalysisStateManager } from '../lib/analysis/AnalysisStateManager';
import { getAnalysisDatabase } from '../lib/db/AnalysisDatabase';

// Custom hooks
import { useGdbConnection } from './BattleMagicMonitor/hooks/useGdbConnection';
import { useUartConnection } from './BattleMagicMonitor/hooks/useUartConnection';
import { usePanelLayout } from './BattleMagicMonitor/hooks/usePanelLayout';
import { useDebugState } from './BattleMagicMonitor/hooks/useDebugState';
import { useProjectState } from './BattleMagicMonitor/hooks/useProjectState';
import { useAnalysisState } from './BattleMagicMonitor/hooks/useAnalysisState';

// Resizable divider component
function ResizableDivider({ onMouseDown }: { onMouseDown: () => void }) {
  return (
    <div
      className="w-1 h-full bg-gray-700 hover:bg-green-500 cursor-col-resize transition-colors flex-shrink-0"
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation="vertical"
    />
  );
}

export default function BattleMagicMonitor() {
  const [isClient, setIsClient] = useState(false);
  const [selectedMemoryMapCpu, setSelectedMemoryMapCpu] = useState<string>('generic-cortex-m4');
  const [customMemoryRegions, setCustomMemoryRegions] = useState<MemoryRegion[]>([]);

  // Analysis context for database operations
  const analysisContext = useAnalysisOptional();
  // Firmware context for cached firmware access (prevents unwanted GDB reads)
  const firmwareContext = useFirmwareOptional();

  // Custom hooks for state management
  const gdb = useGdbConnection();
  const uart = useUartConnection(230400);
  const panels = usePanelLayout(25);
  const debug = useDebugState();
  const project = useProjectState({
    onProjectLoaded: (name, baudRate, cpu, regions, breakpoints) => {
      gdb.addGdbOutput(`[Project loaded: ${name}]`);
      uart.setBaudRate(baudRate);
      setSelectedMemoryMapCpu(cpu);
      setCustomMemoryRegions(regions);
      debug.setBreakpoints(breakpoints);

      // Restore cached firmware when project loads
      if (project.projectManager && firmwareContext) {
        const proj = project.projectManager.getCurrentProject();
        if (proj.firmware) {
          try {
            const binaryString = atob(proj.firmware.data);
            const firmwareData = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              firmwareData[i] = binaryString.charCodeAt(i);
            }
            firmwareContext.setFirmwareData(firmwareData, proj.firmware.baseAddress);
            gdb.addGdbOutput(`[Project] Restored firmware: ${firmwareData.length} bytes at 0x${proj.firmware.baseAddress.toString(16).toUpperCase()}`);
          } catch (firmwareError) {
            console.error('[BattleMagic] Failed to restore cached firmware:', firmwareError);
            gdb.addGdbOutput('[Warning: Failed to restore cached firmware from project]');
          }
        }
      }
    },
    onProjectSaved: (name) => {
      gdb.addGdbOutput(`[Project saved: ${name}]`);
    },
    onAutoSaveToggled: (enabled) => {
      gdb.addGdbOutput(`[Auto-save ${enabled ? 'enabled' : 'disabled'}]`);
    },
    addGdbOutput: gdb.addGdbOutput,
  });
  const analysis = useAnalysisState();

  // Ensure we're on the client side before rendering serial-dependent components
  // Run only once on mount
  useEffect(() => {
    setIsClient(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize GDB client
  useEffect(() => {
    if (!isClient) return;

    const callbacks: GdbClientCallbacks = {
      onStateChange: (state) => {
        gdb.setGdbState(state);
        gdb.addGdbOutput(`[State] ${state}`);
      },
      onStopped: async (reply: StopReply) => {
        // Auto-refresh debug.registers and stack after target stops (e.g., after stepping)
        try {
          // Refresh debug.registers first to get PC
          const regs = await client.getFormattedRegisters();
          const regValues: RegisterValue[] = Array.from(regs.entries()).map(([name, value]) => ({
            name,
            value,
            size: 32
          }));
          debug.setRegisters(regValues);

          // Update PC
          const pc = regs.get('pc');
          if (pc !== undefined) {
            debug.setProgramCounter(pc);
          }

          // Check if this was a breakpoint hit
          // Signal 5 = SIGTRAP (breakpoint or single-step)
          if (reply.signal === 5 && pc !== undefined) {
            // Check if PC matches a breakpoint
            // Normalize addresses for comparison (remove 0x prefix, uppercase)
            const normalizeAddress = (addr: string | number): string => {
              const addrStr = typeof addr === 'number' ? addr.toString(16) : addr;
              return addrStr.replace(/^0x/i, '').toUpperCase();
            };

            const pcHex = pc.toString(16).toUpperCase();
            const pcNormalized = normalizeAddress(pc);

            // Debug logging for breakpoint detection
            console.log('[Breakpoint Detection] PC:', `0x${pcHex}`, 'Normalized:', pcNormalized);
            console.log('[Breakpoint Detection] Breakpoints in state:', debug.breakpoints.map(bp => ({
              address: bp.address,
              normalized: normalizeAddress(bp.address),
              enabled: bp.enabled,
              type: bp.type
            })));

            const hitBreakpoint = debug.breakpoints.find(bp =>
              bp.enabled && normalizeAddress(bp.address) === pcNormalized
            );

            if (hitBreakpoint) {
              // Find the breakpoint number (1-based index)
              const bpIndex = debug.breakpoints.indexOf(hitBreakpoint);

              // Log to GDB output console (in the UI)
              gdb.addGdbOutput(`[Target stopped] Signal: ${reply.signal}`);
              gdb.addGdbOutput(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
              gdb.addGdbOutput(`🎯 BREAKPOINT #${bpIndex + 1} HIT!`);
              gdb.addGdbOutput(`   Address: 0x${pcHex}`);
              gdb.addGdbOutput(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            } else {
              // SIGTRAP but not at a breakpoint (show PC to help debug)
              gdb.addGdbOutput(`[Target stopped] Signal: ${reply.signal} (PC: 0x${pcHex})`);
              if (debug.breakpoints.length > 0) {
                gdb.addGdbOutput(`[Debug] Active breakpoints: ${debug.breakpoints.filter(bp => bp.enabled).map(bp => bp.address).join(', ')}`);
              }
            }
          } else {
            // Other signal (or no PC available)
            const pcInfo = pc !== undefined ? ` (PC: 0x${pc.toString(16).toUpperCase()})` : '';
            gdb.addGdbOutput(`[Target stopped] Signal: ${reply.signal}${pcInfo}`);
          }

          // Refresh stack
          const frames = await client.getBacktrace();
          const stackData: StackFrame[] = frames.map((frame) => ({
            level: frame.level,
            address: frame.address,
            function: frame.function
          }));
          debug.setStackFrames(stackData);

          gdb.addGdbOutput('[Auto-refreshed debug.registers and stack]');
        } catch (error) {
          // Silently ignore errors during auto-refresh
          console.error('Auto-refresh after stop failed:', error);
        }
      },
      onTargetOutput: (output) => {
        gdb.addGdbOutput(`[Target] ${output}`);
      },
      onError: (error) => {
        gdb.addGdbOutput(`[Error] ${error.message}`);
      },
      onNotification: (data) => {
        gdb.addGdbOutput(`[Notification] ${data}`);
      },
    };

    const client = new GdbClient({
      debug: false,
      commandTimeout: 30000 // Increase timeout to 30 seconds for scan commands
    }, callbacks);
    gdb.setGdbClient(client);

    return () => {
      // Cleanup on unmount or hot reload
      // Note: cleanup functions must be synchronous, but we can start async cleanup
      if (client.isConnected()) {
        console.log('[BattleMagicMonitor] Cleaning up connection on unmount/reload');
        client.disconnect().catch((error) => {
          console.error('[BattleMagicMonitor] Cleanup disconnect error:', error);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);


  // GDB Connection handlers
  const handleConnectGdb = useCallback(async () => {
    if (!gdb.gdbClient || !isClient) return;

    // If already connected or connecting, disconnect first
    if (gdb.gdbState !== ConnectionState.DISCONNECTED) {
      gdb.addGdbOutput('[Disconnecting existing connection...]');
      try {
        await gdb.gdbClient.disconnect();
      } catch (error) {
        gdb.addGdbOutput(`[Disconnect failed: ${error}]`);
      }
      // Give it a moment to fully disconnect
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      // Always show port selection dialog
      gdb.addGdbOutput('[Select Black Magic GDB port from the dialog]');
      const port = await navigator.serial.requestPort({
        filters: [{ usbVendorId: 0x1d50, usbProductId: 0x6018 }]
      });

      if (!port) {
        gdb.addGdbOutput('[Connection cancelled]');
        return;
      }

      gdb.addGdbOutput('[Connecting to GDB port...]');
      await gdb.gdbClient.connect(port, { baudRate: uart.baudRate });
      gdb.addGdbOutput('[GDB Connected successfully]');

      // Save the port info for reference
      const portInfo = port.getInfo();
      saveGdbPort({
        vendorId: portInfo.usbVendorId,
        productId: portInfo.usbProductId
      });

      // Get version info
      try {
        const version = await gdb.gdbClient.getVersion();
        gdb.setBmpVersion(version);
        gdb.addGdbOutput(`[BMP Version] ${version.firmware}`);
      } catch (error) {
        gdb.addGdbOutput(`[Version query failed: ${error}]`);
      }
    } catch (error) {
      gdb.addGdbOutput(`[Connection failed: ${error}]`);
    }
  }, [gdb, isClient, uart.baudRate]);

  const handleDisconnectGdb = useCallback(async () => {
    if (!gdb.gdbClient || !gdb.gdbClient.isConnected()) return;

    try {
      await gdb.gdbClient.disconnect();
      gdb.setTargets([]);
      gdb.addGdbOutput('[GDB Disconnected]');
    } catch (error) {
      gdb.addGdbOutput(`[GDB Disconnect failed: ${error}]`);
    }
  }, [gdb]);

  // UART data reader
  const readUartData = useCallback(async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Decode and add to UART output
        const text = new TextDecoder().decode(value);
        uart.addUartOutput(text);
      }
    } catch (error) {
      console.error('UART read error:', error);
      uart.addUartOutput(`[UART read error: ${error}]`);
    } finally {
      reader.releaseLock();
    }
  }, [uart]);

  // UART Connection handlers
  const handleConnectUart = useCallback(async () => {
    if (!isClient) return;

    try {
      gdb.addGdbOutput('[Select Black Magic UART port from the dialog]');
      const port = await navigator.serial.requestPort({
        filters: [{ usbVendorId: 0x1d50, usbProductId: 0x6018 }]
      });

      if (!port) {
        gdb.addGdbOutput('[UART connection cancelled]');
        return;
      }

      // Open the port (default 115200 baud for UART)
      await port.open({ baudRate: 115200 });
      uart.setUartPort(port);
      uart.setUartConnected(true);
      gdb.addGdbOutput('[UART Connected]');
      uart.addUartOutput('[UART Connected - Ready to receive data]');

      // Save the port info for reference
      const portInfo = port.getInfo();
      saveUartPort({
        vendorId: portInfo.usbVendorId,
        productId: portInfo.usbProductId
      });

      // Set up reader for UART data
      if (port.readable) {
        const reader = port.readable.getReader();
        uart.setUartReader(reader);
        readUartData(reader);
      }
    } catch (error) {
      gdb.addGdbOutput(`[UART connection failed: ${error}]`);
      uart.addUartOutput(`[UART connection failed: ${error}]`);
    }
  }, [isClient, gdb, uart, readUartData]);

  const handleDisconnectUart = useCallback(async () => {
    if (!uart.uartPort) return;

    try {
      // Close the reader first
      if (uart.uartReader) {
        try {
          await uart.uartReader.cancel();
          uart.uartReader.releaseLock();
        } catch (error) {
          console.error('Error releasing reader:', error);
        }
        uart.setUartReader(null);
      }

      // Close the port
      await uart.uartPort.close();
      uart.setUartPort(null);
      uart.setUartConnected(false);
      gdb.addGdbOutput('[UART Disconnected]');
      uart.addUartOutput('[UART Disconnected]');
    } catch (error) {
      gdb.addGdbOutput(`[UART disconnect failed: ${error}]`);
      uart.addUartOutput(`[UART disconnect failed: ${error}]`);
    }
  }, [uart, gdb]);


  // Debug panel handlers - Define these first before they're used in other handlers
  const handleRefreshRegisters = useCallback(async () => {
    if (!gdb.gdbClient || gdb.gdbState !== ConnectionState.ATTACHED) return;

    try {
      const regs = await gdb.gdbClient.getFormattedRegisters();
      const regValues: RegisterValue[] = Array.from(regs.entries()).map(([name, value]) => ({
        name,
        value,
        size: 32 // ARM debug.registers are 32-bit
      }));

      debug.setRegisters(regValues);

      // Update PC for disassembly view
      const pc = regs.get('pc');
      if (pc !== undefined) {
        debug.setProgramCounter(pc);
      }

      gdb.addGdbOutput('[Registers refreshed]');
    } catch (error) {
      const errorMsg = String(error);
      if (errorMsg.includes('EFF') || errorMsg.includes('Failed to read debug.registers')) {
        gdb.addGdbOutput('[Cannot read debug.registers - target may be running. Try halting first.]');
      } else {
        gdb.addGdbOutput(`[Failed to read registers: ${error}]`);
      }
    }
  }, [gdb, debug]);

  const handleRefreshStack = useCallback(async () => {
    if (!gdb.gdbClient || gdb.gdbState !== ConnectionState.ATTACHED) return;

    try {
      const frames = await gdb.gdbClient.getBacktrace();
      const stackData: StackFrame[] = frames.map((frame) => ({
        level: frame.level,
        address: frame.address,
        function: frame.function
      }));
      debug.setStackFrames(stackData);
      gdb.addGdbOutput('[Stack refreshed]');
    } catch (error) {
      gdb.addGdbOutput(`[Failed to read stack: ${error}]`);
    }
  }, [gdb, debug]);

  const handleReadMemory = useCallback(async (address: number, length: number): Promise<Uint8Array | null> => {
    // FIRST: Try to read from cached firmware (offline analysis mode)
    if (firmwareContext) {
      const cachedData = firmwareContext.readMemory(address, length);
      if (cachedData) {
        console.log(`[Monitor] Reading from firmware cache: 0x${address.toString(16)} (${length} bytes)`);
        return cachedData;
      }
    }

    // FALLBACK: Read from GDB (live debugging mode)
    if (!gdb.gdbClient || gdb.gdbState !== ConnectionState.ATTACHED) return null;

    try {
      console.log(`[Monitor] Reading from GDB: 0x${address.toString(16)} (${length} bytes)`);
      const data = await gdb.gdbClient.readMemory(address, length);
      gdb.addGdbOutput(`[Read ${length} bytes from 0x${address.toString(16).toUpperCase()}]`);
      return data;
    } catch (error) {
      gdb.addGdbOutput(`[Memory read failed: ${error}]`);
      return null;
    }
  }, [gdb.gdbClient, gdb.gdbState, gdb.addGdbOutput, firmwareContext]);

  // Target control handlers
  const handleScanTargets = useCallback(async () => {
    if (!gdb.gdbClient) return;

    try {
      gdb.addGdbOutput('> monitor swdp_scan');
      const result = await gdb.gdbClient.scanSwd();
      gdb.setTargets(result.targets);
      gdb.addGdbOutput(`[Found ${result.targets.length} target(s)]`);
      if (result.voltage !== null) {
        gdb.addGdbOutput(`[Target voltage: ${result.voltage.toFixed(2)}V]`);
      }
      result.targets.forEach((t) => {
        gdb.addGdbOutput(`  ${t.id}: ${t.description}`);
      });
      project.setLastUpdate(new Date());
    } catch (error) {
      gdb.addGdbOutput(`[Scan failed: ${error}]`);
    }
  }, [gdb.gdbClient, gdb.addGdbOutput]);

  const handleHalt = useCallback(async () => {
    if (!gdb.gdbClient || gdb.gdbState !== ConnectionState.ATTACHED) return;
    try {
      gdb.addGdbOutput('> Ctrl+C (interrupt)');
      await gdb.gdbClient.halt();
      gdb.addGdbOutput('[Target halted]');
      debug.setExecutionState('stopped');
      project.setLastUpdate(new Date());

      // Auto-refresh panels after halt
      try {
        const regs = await gdb.gdbClient.getFormattedRegisters();
        const regValues: RegisterValue[] = Array.from(regs.entries()).map(([name, value]) => ({
          name,
          value,
          size: 32
        }));
        debug.setRegisters(regValues);
        const pc = regs.get('pc');
        if (pc !== undefined) debug.setProgramCounter(pc);
      } catch (error) {
        gdb.addGdbOutput(`[Failed to refresh registers: ${error}]`);
      }

      try {
        const frames = await gdb.gdbClient.getBacktrace();
        const stackData: StackFrame[] = frames.map((frame) => ({
          level: frame.level,
          address: frame.address,
          function: frame.function
        }));
        debug.setStackFrames(stackData);
      } catch (error) {
        gdb.addGdbOutput(`[Failed to refresh stack: ${error}]`);
      }
    } catch (error) {
      gdb.addGdbOutput(`[Halt failed: ${error}]`);
    }
  }, [gdb.gdbClient, gdb.gdbState, gdb.addGdbOutput]);

  const handleRun = useCallback(async () => {
    if (!gdb.gdbClient) return;
    try {
      gdb.addGdbOutput('> continue');
      gdb.addGdbOutput('[Target running...]');
      debug.setExecutionState('running');
      project.setLastUpdate(new Date());
      gdb.gdbClient.continue();
    } catch (error) {
      gdb.addGdbOutput(`[Run failed: ${error}]`);
    }
  }, [gdb.gdbClient, gdb.addGdbOutput]);

  const handleReset = useCallback(async () => {
    if (!gdb.gdbClient || gdb.gdbState !== ConnectionState.ATTACHED) return;
    try {
      gdb.addGdbOutput('> monitor reset');
      await gdb.gdbClient.reset();
      gdb.addGdbOutput('[Target reset]');

      // Auto-refresh panels after reset
      try {
        const regs = await gdb.gdbClient.getFormattedRegisters();
        const regValues: RegisterValue[] = Array.from(regs.entries()).map(([name, value]) => ({
          name,
          value,
          size: 32
        }));
        debug.setRegisters(regValues);
        const pc = regs.get('pc');
        if (pc !== undefined) debug.setProgramCounter(pc);
      } catch (error) {
        gdb.addGdbOutput(`[Failed to refresh registers: ${error}]`);
      }

      try {
        const frames = await gdb.gdbClient.getBacktrace();
        const stackData: StackFrame[] = frames.map((frame) => ({
          level: frame.level,
          address: frame.address,
          function: frame.function
        }));
        debug.setStackFrames(stackData);
      } catch (error) {
        gdb.addGdbOutput(`[Failed to refresh stack: ${error}]`);
      }
    } catch (error) {
      gdb.addGdbOutput(`[Reset failed: ${error}]`);
    }
  }, [gdb.gdbClient, gdb.gdbState, gdb.addGdbOutput]);

  const handleStep = useCallback(async () => {
    if (!gdb.gdbClient || gdb.gdbState !== ConnectionState.ATTACHED) return;
    try {
      gdb.addGdbOutput('> stepi');
      debug.setExecutionState('stepping');
      await gdb.gdbClient.step();
      gdb.addGdbOutput('[Stepped one instruction]');
      debug.setExecutionState('stopped');
      project.setLastUpdate(new Date());

      // Auto-refresh panels after step
      try {
        const regs = await gdb.gdbClient.getFormattedRegisters();
        const regValues: RegisterValue[] = Array.from(regs.entries()).map(([name, value]) => ({
          name,
          value,
          size: 32
        }));
        debug.setRegisters(regValues);
        const pc = regs.get('pc');
        if (pc !== undefined) debug.setProgramCounter(pc);
      } catch (error) {
        gdb.addGdbOutput(`[Failed to refresh registers: ${error}]`);
      }

      try {
        const frames = await gdb.gdbClient.getBacktrace();
        const stackData: StackFrame[] = frames.map((frame) => ({
          level: frame.level,
          address: frame.address,
          function: frame.function
        }));
        debug.setStackFrames(stackData);
      } catch (error) {
        gdb.addGdbOutput(`[Failed to refresh stack: ${error}]`);
      }
    } catch (error) {
      gdb.addGdbOutput(`[Step failed: ${error}]`);
      debug.setExecutionState('stopped');
    }
  }, [gdb.gdbClient, gdb.gdbState, gdb.addGdbOutput]);

  // Note: Version check and port management now handled by menu/toolbar

  // Breakpoint management - unified handler for both DisassemblyView and BreakpointsManager
  const handleToggleBreakpoint = useCallback(async (address: number) => {
    if (!gdb.gdbClient || gdb.gdbState !== ConnectionState.ATTACHED) {
      gdb.addGdbOutput('[Error] Not connected to target');
      return;
    }

    // Warn if target is running (software debug.breakpoints require target to be halted)
    if (debug.executionState === 'running') {
      gdb.addGdbOutput('[Warning] Target is running - halt it first before setting debug.breakpoints');
      gdb.addGdbOutput('[Tip] Click the Pause (⏸) button to halt the target');
      return;
    }

    const addressStr = `0x${address.toString(16).toUpperCase()}`;
    const existingBp = debug.breakpoints.find(bp => {
      const bpAddr = bp.address.startsWith('0x') || bp.address.startsWith('0X')
        ? parseInt(bp.address, 16)
        : parseInt(bp.address, 10);
      return bpAddr === address;
    });

    try {
      if (existingBp) {
        // Remove breakpoint from GDB first
        await gdb.gdbClient.removeBreakpoint(address);
        // Only remove from UI state if GDB command succeeded
        debug.setBreakpoints(prev => prev.filter(bp => bp.id !== existingBp.id));
        gdb.addGdbOutput(`[Breakpoint removed at ${addressStr}]`);
      } else {
        // Insert breakpoint in GDB first
        // Use hardware debug.breakpoints for ARM Cortex-M (software debug.breakpoints don't work with Flash)

        // Warn if approaching hardware breakpoint limit (ARM Cortex-M typically has 4-6 HW breakpoints)
        const currentHwBpCount = debug.breakpoints.filter(bp => bp.type === 'hardware').length;
        if (currentHwBpCount >= 4) {
          gdb.addGdbOutput(`[⚠️ Warning] Already have ${currentHwBpCount} hardware debug.breakpoints set`);
          gdb.addGdbOutput(`[⚠️ Warning] ARM Cortex-M typically supports 4-6 hardware debug.breakpoints max`);
        }

        gdb.addGdbOutput(`[Debug] Attempting to set hardware breakpoint at ${addressStr}...`);
        gdb.addGdbOutput(`[Debug] Current hardware breakpoints: ${currentHwBpCount}/~6`);

        try {
          await gdb.gdbClient.insertBreakpoint(address, true); // true = hardware breakpoint
          gdb.addGdbOutput(`[Debug] GDB insertBreakpoint command completed`);
        } catch (insertError) {
          // Re-throw to be caught by outer catch
          gdb.addGdbOutput(`[Debug] GDB insertBreakpoint threw error: ${insertError}`);
          throw insertError;
        }
        // Only add to UI state if GDB command succeeded
        const newBreakpoint: Breakpoint = {
          id: `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          address: addressStr,
          type: 'hardware',
          enabled: true,
          description: `Address: ${addressStr}`,
          hitCount: 0
        };
        debug.setBreakpoints(prev => [...prev, newBreakpoint]);
        gdb.addGdbOutput(`[✓ Breakpoint set at ${addressStr}] (HW #${currentHwBpCount + 1})`);
        project.setHasUnsavedChanges(true);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      // Provide more specific error messages
      if (errorMsg.includes('empty response')) {
        gdb.addGdbOutput(`[❌ Failed to ${existingBp ? 'remove' : 'set'} breakpoint]`);
        gdb.addGdbOutput(`   Hardware breakpoint command not supported by target`);
      } else if (errorMsg.includes('E01') || errorMsg.toLowerCase().includes('no more')) {
        gdb.addGdbOutput(`[❌ Failed to set breakpoint - out of hardware breakpoint units]`);
        gdb.addGdbOutput(`   ARM Cortex-M has limited hardware debug.breakpoints (typically 4-6)`);
        gdb.addGdbOutput(`   Current debug.breakpoints set: ${debug.breakpoints.length}`);
        gdb.addGdbOutput(`   Tip: Remove unused debug.breakpoints to free up hardware units`);
      } else {
        gdb.addGdbOutput(`[❌ Failed to ${existingBp ? 'remove' : 'set'} breakpoint: ${errorMsg}]`);
      }
      // Don't modify state if GDB command failed
    }
  }, [gdb, debug]);

  // Clear all debug.breakpoints from both GDB and UI state
  const handleClearAllBreakpoints = useCallback(async () => {
    if (!gdb.gdbClient) {
      // No GDB client, just clear UI state
      debug.setBreakpoints([]);
      project.setHasUnsavedChanges(true);
      return;
    }

    const totalCount = debug.breakpoints.length;
    let removedCount = 0;
    let failedCount = 0;

    gdb.addGdbOutput(`[Breakpoint] Clearing ${totalCount} breakpoint(s)...`);

    // Try to remove each breakpoint from GDB
    for (const bp of debug.breakpoints) {
      try {
        const address = bp.address.startsWith('0x') || bp.address.startsWith('0X')
          ? parseInt(bp.address, 16)
          : parseInt(bp.address, 10);

        const isHardware = bp.type === 'hardware';
        await gdb.gdbClient.removeBreakpoint(address, isHardware);
        removedCount++;
      } catch {
        // Breakpoint might not actually exist in GDB (ghost breakpoint)
        failedCount++;
      }
    }

    // Clear UI state
    debug.setBreakpoints([]);
    project.setHasUnsavedChanges(true);

    // Show summary
    gdb.addGdbOutput(`[Breakpoint] Cleared: ${removedCount} removed from GDB, ${failedCount} were ghost debug.breakpoints`);
    gdb.addGdbOutput(`[Breakpoint] UI state cleared: ${totalCount} breakpoint(s)`);
  }, [gdb, debug, project]);

  // Analysis handler
  const handleAnalysisComplete = useCallback((results: AnalysisResults) => {
    gdb.addGdbOutput('[Analysis] Binary analysis completed successfully');
    gdb.addGdbOutput(`[Analysis] Results: ${results.totalInstructions} instructions, ${results.functionsDetected} functions`);
  }, [gdb.addGdbOutput]);

  // Vector table navigation handler
  const handleNavigateToAddress = useCallback((address: number) => {
    // Switch to debugger view
    panels.setActiveRightPanel('debugger');
    // Set the program counter to the target address for navigation
    debug.setProgramCounter(address);
    gdb.addGdbOutput(`[Navigation] Jumping to address 0x${address.toString(16).toUpperCase()}`);
  }, [gdb.addGdbOutput]);

  // Project management handlers
  const updateProjectState = useCallback(() => {
    const projectManager = project.projectManager;
    if (!projectManager) return;

    projectManager.updateProject({
      gdbSettings: {
        baudRate: uart.baudRate,
        commandTimeout: 15000
      },
      memoryMap: {
        zoom: 1.5, // Default zoom
        offset: { x: 0, y: 0 }, // Default offset
        selectedCpu: selectedMemoryMapCpu,
        customRegions: customMemoryRegions
      },
      breakpoints: debug.breakpoints,
      activePanel: panels.activeRightPanel
    });

    project.setHasUnsavedChanges(projectManager.hasChanges());
  }, [uart.baudRate, selectedMemoryMapCpu, customMemoryRegions, debug.breakpoints, panels.activeRightPanel, project]);

  // Sync state changes to project manager
  useEffect(() => {
    updateProjectState();
  }, [updateProjectState]);

  const handleNewProject = useCallback(() => {
    const projectManager = project.projectManager;
    if (!projectManager) return;

    const newProjectData = projectManager.newProject();
    project.setProjectName(newProjectData.metadata.name);
    uart.setBaudRate(newProjectData.gdbSettings.baudRate);
    setSelectedMemoryMapCpu(newProjectData.memoryMap.selectedCpu);
    setCustomMemoryRegions(newProjectData.memoryMap.customRegions);
    debug.setBreakpoints(newProjectData.breakpoints);
    project.setHasUnsavedChanges(false);
    gdb.addGdbOutput('[New project created]');
  }, [project, uart, debug, gdb]);

  const handleSaveProject = useCallback(async () => {
    const projectManager = project.projectManager;
    if (!projectManager) return;

    try {
      // Update project state with current values
      updateProjectState();

      // Save project (localStorage + auto-save MDB via AnalysisContext)
      await projectManager.saveProject();

      // Also trigger MDB save if analysis context is available
      if (analysisContext) {
        await analysisContext.saveToDatabase();
        gdb.addGdbOutput('[Save] Analysis data saved to database');
      }

      gdb.addGdbOutput('[Save] Project saved successfully');
    } catch (error) {
      gdb.addGdbOutput(`[Save] Failed to save project: ${error}`);
    }
  }, [updateProjectState, analysisContext, gdb.addGdbOutput]);

  const handleExportProject = useCallback(() => {
    const projectManager = project.projectManager;
    if (!projectManager) return;

    try {
      // Update project state before export
      updateProjectState();

      // Export project file (download)
      projectManager.exportProject();

      gdb.addGdbOutput('[Export] Project file downloaded');
    } catch (error) {
      gdb.addGdbOutput(`[Export] Failed to export project: ${error}`);
    }
  }, [updateProjectState, gdb.addGdbOutput]);

  const handleLoadProject = useCallback(async (file: File) => {
    const projectManager = project.projectManager;
    if (!projectManager) return;

    try {
      await projectManager.loadFromFile(file);
      // State will be updated by the onProjectLoaded callback
    } catch (error) {
      gdb.addGdbOutput(`[Failed to load project: ${error}]`);
    }
  }, [project, gdb]);

  const handleAutoSaveToggle = useCallback((enabled: boolean) => {
    const projectManager = project.projectManager;
    if (!projectManager) return;

    projectManager.setAutoSave(enabled);
  }, [project]);

  const handleEditMetadata = useCallback((name: string, description: string) => {
    const projectManager = project.projectManager;
    if (!projectManager) return;

    projectManager.updateMetadata(name, description);
    project.setProjectName(name);
    project.setHasUnsavedChanges(true);
    gdb.addGdbOutput(`[Project renamed: ${name}]`);
  }, [project, gdb]);

  // Database operation handlers
  const handleExportDatabase = useCallback(async () => {
    if (!analysisContext) return;

    try {
      gdb.addGdbOutput('[Exporting analysis database...]');
      await analysisContext.exportDatabase();
      gdb.addGdbOutput('[Database exported successfully]');
    } catch (error) {
      gdb.addGdbOutput(`[Database export failed: ${error}]`);
    }
  }, [analysisContext, gdb.addGdbOutput]);

  const handleImportDatabase = useCallback(async (file: File) => {
    if (!analysisContext) return;

    try {
      gdb.addGdbOutput(`[Importing analysis database: ${file.name}]`);
      await analysisContext.importDatabase(file);
      gdb.addGdbOutput('[Database imported successfully]');
    } catch (error) {
      gdb.addGdbOutput(`[Database import failed: ${error}]`);
    }
  }, [analysisContext, gdb.addGdbOutput]);

  // Auto-refresh registers when attached to target (only once per attach)
  const hasAutoRefreshedRef = useRef(false);
  useEffect(() => {
    if (gdb.gdbState === ConnectionState.ATTACHED && !hasAutoRefreshedRef.current) {
      hasAutoRefreshedRef.current = true;
      handleRefreshRegisters();
      handleRefreshStack();
    } else if (gdb.gdbState !== ConnectionState.ATTACHED) {
      // Reset flag when disconnected
      hasAutoRefreshedRef.current = false;
    }
  }, [gdb.gdbState]); // Only depend on state, not the callback functions

  // Auto-load analysis on startup if available
  useEffect(() => {
    const autoLoadAnalysis = async () => {
      // Prevent multiple executions
      if (analysis.hasAutoLoaded) return;
      if (!analysisContext || !project.projectManager) return;

      analysis.setHasAutoLoaded(true);

      const stateManager = new AnalysisStateManager();
      const currentProject = project.projectManager.getCurrentProject();
      const analysisDb = getAnalysisDatabase();

      // Check if analysis exists in MDB
      const hasMdbData = await analysisDb.hasAnalysis();

      // Check analysis state
      const stateDetails = await stateManager.checkAnalysisState(currentProject, analysisDb);

      // Auto-load if:
      // 1. MDB data exists, AND
      // 2. Analysis is current OR recent (< 24 hours old)
      if (hasMdbData && (stateDetails.state === 'current' || stateManager.shouldAutoLoad(currentProject))) {
        try {
          gdb.addGdbOutput('[Startup] Auto-loading analysis from database...');
          const loaded = await analysisContext.loadFromDatabase();

          if (loaded) {
            gdb.addGdbOutput('[Startup] Analysis loaded successfully');
            gdb.addGdbOutput(`[Startup] ${stateDetails.statusMessage}`);
          } else {
            gdb.addGdbOutput('[Startup] No analysis data found in database');
          }
        } catch (error) {
          console.error('[Startup] Failed to auto-load analysis:', error);
          gdb.addGdbOutput('[Startup] Failed to auto-load analysis');
        }
      } else if (stateDetails.state !== 'none') {
        // Analysis exists but wasn't auto-loaded (outdated or old)
        gdb.addGdbOutput(`[Startup] Analysis available: ${stateDetails.statusMessage}`);
        gdb.addGdbOutput('[Startup] Go to Tools → Firmware Dump to load or re-analyze');
      }
    };

    // Only run once on startup (when analysisContext becomes available)
    if (analysisContext && isClient) {
      autoLoadAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisContext, isClient]); // Run only once when context is available

  // Panel visibility handlers
  const handlePanelToggle = useCallback((panel: keyof typeof panels.visiblePanels) => {
    panels.setVisiblePanels(prev => ({
      ...prev,
      [panel]: !prev[panel],
    }));
  }, []);

  const handleViewToggle = useCallback((view: string) => {
    panels.setActiveRightPanel(view as typeof panels.activeRightPanel);
  }, []);

  const handleToolSelect = useCallback((tool: string) => {
    panels.setActiveRightPanel(tool as typeof panels.activeRightPanel);
  }, []);

  // Panel resize handlers
  const handleMouseDown = useCallback(() => {
    panels.setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!panels.isDragging || !panels.containerRef.current) return;
      const containerRect = panels.containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left;
      // Calculate console width from the right side
      const newConsoleWidth = ((containerRect.width - offsetX) / containerRect.width) * 100;
      // Console can be 15-40% of screen width
      if (newConsoleWidth >= 15 && newConsoleWidth <= 40) {
        panels.setConsoleWidth(newConsoleWidth);
      }
    },
    [panels.isDragging]
  );

  const handleMouseUp = useCallback(() => {
    panels.setIsDragging(false);
  }, []);

  useEffect(() => {
    if (panels.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [panels.isDragging, handleMouseMove, handleMouseUp]);

  const gdbConnected = gdb.gdbState === ConnectionState.CONNECTED || gdb.gdbState === ConnectionState.ATTACHED;
  const targetAttached = gdb.gdbState === ConnectionState.ATTACHED;

  // Don't render until projectManager is initialized
  if (!project.projectManager) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-950">
        <div className="text-gray-400 font-mono">Initializing project manager...</div>
      </div>
    );
  }

  return (
    <ProjectProvider projectManager={project.projectManager}>
      <XrefProvider>
        <div className="battlemagic-container flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      {/* Header - Compact with logo and project menu */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Image
            src="/battlemagiclogo.png"
            alt="BattleMagic Logo"
            width={60}
            height={60}
            className="rounded"
          />
          <div>
            <h1 className="text-2xl font-bold font-mono leading-tight">
              <span className="text-green-400">Battle</span>Magic
            </h1>
            <p className="text-xs text-gray-400">Black Magic Probe Debugger</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isClient && (
            <ProjectMenu
              projectName={project.projectName}
              hasUnsavedChanges={project.hasUnsavedChanges}
              autoSaveEnabled={project.autoSaveEnabled}
              onNew={handleNewProject}
              onSave={handleSaveProject}
              onLoad={handleLoadProject}
              onAutoSaveToggle={handleAutoSaveToggle}
              onEditMetadata={handleEditMetadata}
            />
          )}
          <Link
            href="/tools"
            className="text-gray-300 hover:text-green-400 transition-colors font-mono text-xs flex items-center gap-1"
          >
            <span>← Tools</span>
          </Link>
        </div>
      </div>

      {/* Menu Bar - IDA Pro style with integrated connection controls */}
      {isClient && (
        <MenuBar
          onNewProject={handleNewProject}
          onSaveProject={handleSaveProject}
          onExportProject={handleExportProject}
          onLoadProject={handleLoadProject}
          onDisconnect={handleDisconnectGdb}
          onViewToggle={handleViewToggle}
          onToolSelect={handleToolSelect}
          activeView={panels.activeRightPanel}
          isConnected={gdbConnected}
          isAttached={targetAttached}
          visiblePanels={panels.visiblePanels}
          onPanelToggle={handlePanelToggle}
          onExportDatabase={handleExportDatabase}
          onImportDatabase={handleImportDatabase}
          gdbState={gdb.gdbState}
          uartConnected={uart.uartConnected}
          onConnectGdb={handleConnectGdb}
          onDisconnectGdb={handleDisconnectGdb}
          onConnectUart={handleConnectUart}
          onDisconnectUart={handleDisconnectUart}
        />
      )}

      {/* Toolbar - Quick actions */}
      {isClient && (
        <Toolbar
          gdbState={gdb.gdbState}
          targetAttached={targetAttached}
          uartConnected={uart.uartConnected}
          onConnectGdb={handleConnectGdb}
          onDisconnectGdb={handleDisconnectGdb}
          onConnectUart={handleConnectUart}
          onDisconnectUart={handleDisconnectUart}
          onScanTargets={handleScanTargets}
          onHalt={handleHalt}
          onRun={handleRun}
          onStep={handleStep}
          onReset={handleReset}
          onRefreshRegisters={handleRefreshRegisters}
          onRefreshMemory={async () => {
            project.setLastUpdate(new Date());
          }}
        />
      )}

      {/* Main Content - IDA Pro-like Layout */}
      <div ref={panels.containerRef} className="flex-1 flex flex-col overflow-hidden">
        {isClient ? (
          <>
            {/* Main Horizontal Split: Content (70-85%) | Console (15-30%) */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Side - Main Content (70-85% when console visible, 100% when hidden) */}
              <div className="flex flex-col overflow-hidden" style={{ width: panels.visiblePanels.console ? `${100 - panels.consoleWidth}%` : '100%' }}>
                {/* Show DebuggerView by default when target is attached */}
                {targetAttached && panels.activeRightPanel === 'debugger' && (
                  <DebuggerView
                    gdbClient={gdb.gdbClient}
                    isConnected={targetAttached}
                    registers={debug.registers}
                    stackFrames={debug.stackFrames}
                    programCounter={debug.programCounter}
                    onRefreshRegisters={handleRefreshRegisters}
                    onRefreshStack={handleRefreshStack}
                    onReadMemory={handleReadMemory}
                    onOutput={gdb.addGdbOutput}
                    breakpoints={debug.breakpointAddresses}
                    onToggleBreakpoint={handleToggleBreakpoint}
                    visiblePanels={{
                      registers: panels.visiblePanels.registers,
                      stack: panels.visiblePanels.stack,
                      memory: panels.visiblePanels.memory
                    }}
                    jumpToPCTrigger={debug.jumpToPCTrigger}
                  />
                )}
                {panels.activeRightPanel === 'target' && (
                  <TargetInfoPanel
                    client={gdb.gdbClient}
                  />
                )}
                {panels.activeRightPanel === 'flash' && (
                  <FlashProgrammer
                    gdbClient={gdb.gdbClient}
                    isConnected={targetAttached}
                  />
                )}
                {panels.activeRightPanel === 'extract' && (
                  <FirmwareExtractor
                    gdbClient={gdb.gdbClient}
                    isConnected={targetAttached}
                  />
                )}
                {panels.activeRightPanel === 'breakpoints' && (
                  <BreakpointsManager
                    gdbClient={gdb.gdbClient}
                    isConnected={targetAttached}
                    onOutput={gdb.addGdbOutput}
                    breakpoints={debug.breakpoints}
                    setBreakpoints={debug.setBreakpoints}
                  />
                )}
                {panels.activeRightPanel === 'memorymap' && (
                  <MemoryMapView
                    gdbClient={gdb.gdbClient}
                    onRegionSelect={(region) => {
                      gdb.addGdbOutput(`[Selected memory region: ${region.name}]`);
                    }}
                  />
                )}
                {panels.activeRightPanel === 'uart' && (
                  <UartPanel
                    isConnected={uart.uartConnected}
                    output={uart.uartOutput}
                    onConnect={handleConnectUart}
                    onDisconnect={handleDisconnectUart}
                    onSendData={async (data: string) => {
                      if (!uart.uartPort?.writable) return;
                      try {
                        const writer = uart.uartPort.writable.getWriter();
                        await writer.write(new TextEncoder().encode(data + '\n'));
                        writer.releaseLock();
                      } catch (error) {
                        uart.addUartOutput(`[Send failed: ${error}]`);
                      }
                    }}
                  />
                )}
                {panels.activeRightPanel === 'swo' && (
                  <SwoViewer
                    gdbClient={gdb.gdbClient}
                    isConnected={targetAttached}
                    onOutput={gdb.addGdbOutput}
                  />
                )}
                {panels.activeRightPanel === 'analysis' && (
                  <AnalysisPanel
                    gdbClient={gdb.gdbClient}
                    isConnected={targetAttached}
                    onAnalysisComplete={handleAnalysisComplete}
                    onOutput={gdb.addGdbOutput}
                  />
                )}
                {panels.activeRightPanel === 'xrefs' && (
                  <XrefPanel
                    selectedAddress={selectedDisassemblyAddress}
                    onNavigateToAddress={() => {
                      // Switch to debugger view and navigate
                      panels.setActiveRightPanel('debugger');
                      // The navigation will be handled by DisassemblyView internally
                      // We just need to ensure we're on the debugger view
                    }}
                  />
                )}
                {panels.activeRightPanel === 'vector-table' && (
                  <VectorTablePanel
                    onNavigateToAddress={handleNavigateToAddress}
                  />
                )}
                {panels.activeRightPanel === 'chip-settings' && (
                  <ChipDatabaseSettings
                    onClose={() => panels.setActiveRightPanel('debugger')}
                  />
                )}
                {/* Firmware dump workflow - rendered in background for auto-analysis */}
                {gdb.gdbClient && (
                  <div style={{ display: panels.activeRightPanel === 'firmware-dump' ? 'block' : 'none' }}>
                    <FirmwareDumpWorkflow
                      gdbClient={gdb.gdbClient}
                      autoStart={analysis.shouldAutoStartAnalysis}
                      onOutput={gdb.addGdbOutput}
                      detectedArchInfo={analysis.detectedArchInfo || undefined}
                      onFirmwareCached={(cachedFirmware) => {
                        // Save firmware to project when dumped
                        if (project.projectManager) {
                          project.projectManager.updateFirmware(cachedFirmware);
                          gdb.addGdbOutput('[Project] Firmware saved to project file');
                        }
                      }}
                      onAnalysisComplete={() => {
                        // Switch to debugger view when analysis completes
                        // This will show the disassembly and auto-scroll to PC
                        panels.setActiveRightPanel('debugger');
                        gdb.addGdbOutput('[Analysis] 🎯 Switching to debugger view and jumping to PC...');
                        // Trigger jump to PC by incrementing the trigger
                        debug.triggerJumpToPC();
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Console Panel - Right side (15-30%), collapsible */}
              {panels.visiblePanels.console && (
                <>
                  <ResizableDivider onMouseDown={handleMouseDown} />
                  <div className="h-full overflow-hidden flex flex-col bg-black" style={{ width: `${panels.consoleWidth}%` }}>
                    <div className="bg-gray-900 border-b border-gray-700 px-3 py-1.5 flex items-center justify-between">
                      <h3 className="text-xs font-mono text-green-400 font-bold">CONSOLE</h3>
                      <button
                        onClick={() => panels.togglePanel('console')}
                        className="text-xs px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                        title="Close console"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <GdbPanel
                        gdbClient={gdb.gdbClient}
                        output={gdb.gdbOutput}
                        targets={gdb.targets}
                        onAttachTarget={async (targetId) => {
                          if (!gdb.gdbClient) return;
                          try {
                            await gdb.gdbClient.attach(targetId);
                            gdb.addGdbOutput(`[Attached to target ${targetId}]`);
                            const target = gdb.targets.find(t => t.id === targetId);
                            if (target) gdb.setCurrentTarget(target);

                            // Auto-halt target after attach so debug.registers can be read
                            gdb.addGdbOutput('> Ctrl+C (interrupt)');
                            await gdb.gdbClient.halt();
                            gdb.addGdbOutput('[Target halted]');
                            debug.setExecutionState('stopped');

                            // Detect architecture and prompt for analysis if supported
                            if (target) {
                              try {
                                const archInfo = await detectArchitecture(target.description);
                                analysis.setDetectedArchInfo(archInfo);

                                gdb.addGdbOutput(`[Architecture: ${archInfo.architecture}]`);
                                gdb.addGdbOutput(`[Manufacturer: ${archInfo.manufacturer}]`);
                                gdb.addGdbOutput(`[Analysis Support: ${archInfo.supported ? '✅ Supported' : '❌ Not Supported'}]`);
                                gdb.addGdbOutput(`[Match Confidence: ${(archInfo.confidence * 100).toFixed(1)}%]`);

                                // If architecture is supported, check for existing analysis and show prompt
                                if (archInfo.supported && analysisContext) {
                                  const analysisDb = getAnalysisDatabase();
                                  const hasMdbData = await analysisDb.hasAnalysis();
                                  const hasCachedFirmware = project.projectManager?.getCachedFirmware() !== undefined;

                                  // Only show "Load Previous Analysis" if BOTH analysis data AND cached firmware exist
                                  // Otherwise, firmware won't be available for disassembly
                                  analysis.setExistingAnalysisDetected(hasMdbData && hasCachedFirmware);
                                  analysis.setShowAnalysisPrompt(true);
                                }
                              } catch (error) {
                                gdb.addGdbOutput(`[Architecture detection failed: ${error}]`);
                              }
                            }

                            // Auto-switch to debugger view when target attached
                            panels.setActiveRightPanel('debugger');
                          } catch (error) {
                            gdb.addGdbOutput(`[Attach failed: ${error}]`);
                          }
                        }}
                        onScanSwd={handleScanTargets}
                        onClearOutput={gdb.clearGdbOutput}
                        onOutput={gdb.addGdbOutput}
                        onClearAllBreakpoints={handleClearAllBreakpoints}
                        breakpoints={debug.breakpoints}
                        registers={debug.registers}
                        programCounter={debug.programCounter}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-gray-400 font-mono">Initializing...</div>
          </div>
        )}
      </div>

      {/* Auto-Analysis Prompt Dialog */}
      {analysis.showAnalysisPrompt && analysis.detectedArchInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
          <div className="bg-gray-900 border-2 border-green-500 rounded-lg p-6 max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-green-400 mb-4 font-mono">
              {analysis.existingAnalysisDetected ? 'Analysis Found' : 'Firmware Analysis Available'}
            </h2>
            <div className="space-y-3 mb-4 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Architecture:</span>
                <span className="text-green-400">{analysis.detectedArchInfo.architecture}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Manufacturer:</span>
                <span className="text-white">{analysis.detectedArchInfo.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Chip:</span>
                <span className="text-white">{analysis.detectedArchInfo.chip_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Confidence:</span>
                <span className="text-green-400">{(analysis.detectedArchInfo.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            {analysis.existingAnalysisDetected ? (
              <>
                <div className="bg-blue-900/30 border border-blue-600 rounded p-3 mb-4">
                  <p className="text-blue-400 text-sm font-mono">
                    ℹ️ Previous analysis found in database
                  </p>
                </div>
                <p className="text-gray-300 mb-6 text-sm">
                  You can load the existing analysis (fast) or re-analyze the firmware (will reset chip to capture at interrupt vector).
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={async () => {
                      analysis.setShowAnalysisPrompt(false);
                      if (analysisContext && firmwareContext && project.projectManager) {
                        try {
                          // Show loading modal
                          analysis.setShowLoadingModal(true);
                          analysis.setLoadingProgress({ stage: 'Loading analysis from database...', progress: 10 });
                          gdb.addGdbOutput('[Loading analysis from database...]');

                          // Load analysis data from IndexedDB
                          analysis.setLoadingProgress({ stage: 'Loading functions, xrefs, and comments...', progress: 30 });
                          const loaded = await analysisContext.loadFromDatabase();
                          if (!loaded) {
                            analysis.setShowLoadingModal(false);
                            gdb.addGdbOutput('[No analysis data found in database]');
                            return;
                          }

                          // Restore cached firmware into FirmwareContext
                          analysis.setLoadingProgress({ stage: 'Restoring firmware binary...', progress: 60 });
                          const cachedFirmware = project.projectManager.getCachedFirmware();
                          if (cachedFirmware) {
                            try {
                              // Decode base64 firmware data to Uint8Array
                              const binaryString = atob(cachedFirmware.data);
                              const firmwareData = new Uint8Array(binaryString.length);
                              for (let i = 0; i < binaryString.length; i++) {
                                firmwareData[i] = binaryString.charCodeAt(i);
                              }

                              // Restore firmware into FirmwareContext
                              firmwareContext.setFirmwareData(firmwareData, cachedFirmware.baseAddress);
                              gdb.addGdbOutput(`[Restored cached firmware: ${firmwareData.length} bytes at 0x${cachedFirmware.baseAddress.toString(16).toUpperCase()}]`);
                            } catch (firmwareError) {
                              console.error('[BattleMagic] Failed to restore cached firmware:', firmwareError);
                              gdb.addGdbOutput('[Warning: Failed to restore cached firmware, disassembly may not work]');
                            }
                          } else {
                            gdb.addGdbOutput('[Warning: No cached firmware found, disassembly may not work]');
                          }

                          // Set PC to reset vector (entry point)
                          const vectorTable = analysisContext.getVectorTable();
                          const resetVector = vectorTable.find(entry => entry.vector_number === 1);
                          if (resetVector && resetVector.handler_address) {
                            debug.setProgramCounter(resetVector.handler_address);
                            gdb.addGdbOutput(`[PC set to reset vector: 0x${resetVector.handler_address.toString(16).toUpperCase()}]`);

                            // Rename reset handler to "entrypoint" if it has a default name
                            const resetHandlerFunc = analysisContext.getFunctionAt(resetVector.handler_address);
                            if (resetHandlerFunc && resetHandlerFunc.name.startsWith('sub_')) {
                              analysisContext.renameFunction(resetVector.handler_address, 'entrypoint');
                              gdb.addGdbOutput('[Renamed reset handler to "entrypoint"]');
                            }
                          } else {
                            gdb.addGdbOutput('[Warning: Reset vector not found in vector table]');
                          }

                          analysis.setLoadingProgress({ stage: 'Complete!', progress: 100 });
                          gdb.addGdbOutput('[Analysis loaded successfully!]');
                          gdb.addGdbOutput('[Switch to Debugger view to see disassembly]');

                          // Hide modal after a brief delay to show completion
                          setTimeout(() => {
                            analysis.setShowLoadingModal(false);
                            panels.setActiveRightPanel('debugger');
                          }, 500);
                        } catch (error) {
                          analysis.setShowLoadingModal(false);
                          gdb.addGdbOutput(`[Failed to load analysis: ${error}]`);
                        }
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded font-mono transition-colors"
                  >
                    Load Previous Analysis (Fast)
                  </button>
                  <button
                    onClick={() => {
                      analysis.setShowAnalysisPrompt(false);
                      analysis.setShouldAutoStartAnalysis(true);
                      gdb.addGdbOutput('[Re-analyzing] Will reset chip to capture firmware at interrupt vector');
                      gdb.addGdbOutput('[Re-analyzing] Starting firmware dump & analysis...');
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded font-mono transition-colors"
                  >
                    Re-analyze Firmware (Will Reset Chip)
                  </button>
                  <button
                    onClick={() => {
                      analysis.setShowAnalysisPrompt(false);
                      gdb.addGdbOutput('[Analysis prompt dismissed]');
                    }}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded font-mono transition-colors"
                  >
                    Not Now
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-amber-900/30 border border-amber-600 rounded p-3 mb-4">
                  <p className="text-amber-400 text-sm font-mono">
                    ⚠️ Will reset chip to capture firmware at interrupt vector
                  </p>
                </div>
                <p className="text-gray-300 mb-6 text-sm">
                  This chip is supported for firmware analysis. The chip will be reset to capture the firmware starting at the interrupt vector table.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      analysis.setShowAnalysisPrompt(false);
                      analysis.setShouldAutoStartAnalysis(true);
                      gdb.addGdbOutput('[Firmware Dump] Will reset chip to capture at interrupt vector');
                      gdb.addGdbOutput('[Firmware Dump] Starting dump & analysis...');
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded font-mono transition-colors"
                  >
                    Dump & Analyze
                  </button>
                  <button
                    onClick={() => {
                      analysis.setShowAnalysisPrompt(false);
                      gdb.addGdbOutput('[Analysis prompt dismissed - you can manually analyze later via Tools → Firmware Dump]');
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded font-mono transition-colors"
                  >
                    Not Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Status Bar - IDA Pro style */}
      {isClient && (
        <StatusBar
          gdbState={gdb.gdbState}
          uartConnected={uart.uartConnected}
          bmpVersion={gdb.bmpVersion}
          currentTarget={gdb.currentTarget}
          programCounter={debug.programCounter}
          executionState={debug.executionState}
          lastUpdate={project.lastUpdate}
        />
      )}

      {/* Loading from database progress modal */}
      <AnalysisProgressModal
        isVisible={analysis.showLoadingModal}
        stage={analysis.loadingProgress.stage}
        progress={analysis.loadingProgress.progress}
        title="Loading Analysis"
      />
        </div>
      </XrefProvider>
    </ProjectProvider>
  );
}
