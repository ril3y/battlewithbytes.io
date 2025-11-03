'use client';

/**
 * BattleMagic Monitor - Main Application Component
 *
 * Provides a full-screen interface for Black Magic Probe debugging
 * with side-by-side GDB and UART panels
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../battlemagic.css';
import Image from 'next/image';
import Link from 'next/link';
import { GdbClient, GdbClientCallbacks } from '../lib/gdb/GdbClient';
import { ConnectionState, Target, StopReply, BmpVersion } from '../lib/gdb/types';
import ConnectionBar from './ConnectionBar';
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
import {
  saveGdbPort,
  saveUartPort,
  loadBMPInfo,
  findMatchingPort,
  clearBMPInfo
} from '../utils/deviceStorage';
import { BinaryInfo } from '../lib/binary/types';
import { MemoryRegion } from '../lib/memory/MemoryMapParser';
import { ProjectManager } from '../lib/project/ProjectManager';

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
  const [gdbClient, setGdbClient] = useState<GdbClient | null>(null);
  const [gdbState, setGdbState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [uartConnected, setUartConnected] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const [gdbOutput, setGdbOutput] = useState<string[]>([]);
  const [uartPort, setUartPort] = useState<SerialPort | null>(null);
  const [uartReader, setUartReader] = useState<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const [uartOutput, setUartOutput] = useState<string[]>([]);
  const [baudRate, setBaudRate] = useState(230400); // Default to 230400 (safe for USB CDC)
  const [hasStoredGdbPort, setHasStoredGdbPort] = useState(false);
  const [hasStoredUartPort, setHasStoredUartPort] = useState(false);
  const [bmpVersion, setBmpVersion] = useState<BmpVersion | null>(null);
  const lastOutputRef = useRef<{text: string; timestamp: number} | null>(null);

  // Debug panels state
  const [registers, setRegisters] = useState<RegisterValue[]>([]);
  const [stackFrames, setStackFrames] = useState<StackFrame[]>([]);
  const [activeRightPanel, setActiveRightPanel] = useState<'debugger' | 'target' | 'flash' | 'extract' | 'breakpoints' | 'memorymap' | 'uart' | 'swo'>('debugger');
  const [programCounter, setProgramCounter] = useState<number | undefined>();
  const [loadedBinary, setLoadedBinary] = useState<BinaryInfo | null>(null);
  const [customMemoryRegions, setCustomMemoryRegions] = useState<MemoryRegion[]>([]);
  const [selectedMemoryMapCpu, setSelectedMemoryMapCpu] = useState<string>('generic-cortex-m4');
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);

  // Panel resize state
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Project management state
  const projectManagerRef = useRef<ProjectManager | null>(null);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Ensure we're on the client side before rendering serial-dependent components
  useEffect(() => {
    setIsClient(true);

    // Check for stored port info
    const storedInfo = loadBMPInfo();
    if (storedInfo?.gdbPort) {
      setHasStoredGdbPort(true);
      console.log('Found stored GDB port:', storedInfo.gdbPort);
    }
    if (storedInfo?.uartPort) {
      setHasStoredUartPort(true);
      console.log('Found stored UART port:', storedInfo.uartPort);
    }

    // Initialize project manager
    const projectManager = new ProjectManager({
      onProjectLoaded: (project) => {
        console.log('Project loaded:', project.metadata.name);
        setProjectName(project.metadata.name);
        setBaudRate(project.gdbSettings.baudRate);
        setSelectedMemoryMapCpu(project.memoryMap.selectedCpu);
        setCustomMemoryRegions(project.memoryMap.customRegions);
        setBreakpoints(project.breakpoints);
        setHasUnsavedChanges(false);
        addGdbOutput(`[Project loaded: ${project.metadata.name}]`);
      },
      onProjectSaved: (project) => {
        console.log('Project saved:', project.metadata.name);
        setHasUnsavedChanges(false);
        addGdbOutput(`[Project saved: ${project.metadata.name}]`);
      },
      onAutoSaveToggled: (enabled) => {
        setAutoSaveEnabled(enabled);
        addGdbOutput(`[Auto-save ${enabled ? 'enabled' : 'disabled'}]`);
      },
      onError: (message) => {
        addGdbOutput(`[Project Error] ${message}`);
      }
    });

    projectManagerRef.current = projectManager;

    // Try to load saved project from localStorage
    const loaded = projectManager.loadFromLocalStorage();
    if (loaded) {
      const project = projectManager.getCurrentProject();
      setProjectName(project.metadata.name);
      setBaudRate(project.gdbSettings.baudRate);
      setSelectedMemoryMapCpu(project.memoryMap.selectedCpu);
      setCustomMemoryRegions(project.memoryMap.customRegions);
      setBreakpoints(project.breakpoints);
    }

    // Start auto-save if enabled
    if (projectManager.isAutoSaveEnabled()) {
      projectManager.startAutoSave();
    }

    return () => {
      projectManager.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize GDB client
  useEffect(() => {
    if (!isClient) return;

    const callbacks: GdbClientCallbacks = {
      onStateChange: (state) => {
        setGdbState(state);
        addGdbOutput(`[State] ${state}`);
      },
      onStopped: async (reply: StopReply) => {
        addGdbOutput(`[Target stopped] Signal: ${reply.signal}`);

        // Auto-refresh registers and stack after target stops (e.g., after stepping)
        try {
          // Refresh registers
          const regs = await client.getFormattedRegisters();
          const regValues: RegisterValue[] = Array.from(regs.entries()).map(([name, value]) => ({
            name,
            value,
            size: 32
          }));
          setRegisters(regValues);

          // Update PC
          const pc = regs.get('pc');
          if (pc !== undefined) {
            setProgramCounter(pc);
          }

          // Refresh stack
          const frames = await client.getBacktrace();
          const stackData: StackFrame[] = frames.map((frame) => ({
            level: frame.level,
            address: frame.address,
            function: frame.function
          }));
          setStackFrames(stackData);

          addGdbOutput('[Auto-refreshed registers and stack]');
        } catch (error) {
          // Silently ignore errors during auto-refresh
          console.error('Auto-refresh after stop failed:', error);
        }
      },
      onTargetOutput: (output) => {
        addGdbOutput(`[Target] ${output}`);
      },
      onError: (error) => {
        addGdbOutput(`[Error] ${error.message}`);
      },
      onNotification: (data) => {
        addGdbOutput(`[Notification] ${data}`);
      },
    };

    const client = new GdbClient({
      debug: true,
      commandTimeout: 30000 // Increase timeout to 30 seconds for scan commands
    }, callbacks);
    setGdbClient(client);

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

  // Helper to add GDB output (with deduplication)
  const addGdbOutput = useCallback((text: string) => {
    const now = Date.now();
    const last = lastOutputRef.current;

    // Prevent duplicate outputs within 100ms
    if (last && last.text === text && (now - last.timestamp) < 100) {
      return;
    }

    lastOutputRef.current = { text, timestamp: now };
    setGdbOutput((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
  }, []);

  // Helper to clear GDB output
  const clearGdbOutput = useCallback(() => {
    setGdbOutput([]);
  }, []);

  // Helper to add UART output
  const addUartOutput = useCallback((text: string) => {
    setUartOutput((prev) => [...prev, text]);
  }, []);

  // GDB Connection handlers
  const handleConnectGdb = useCallback(async (event?: React.MouseEvent) => {
    if (!gdbClient || !isClient) return;

    // If already connected or connecting, disconnect first
    if (gdbState !== ConnectionState.DISCONNECTED) {
      addGdbOutput('[Disconnecting existing connection...]');
      try {
        await gdbClient.disconnect();
      } catch (error) {
        addGdbOutput(`[Disconnect failed: ${error}]`);
      }
      // Give it a moment to fully disconnect
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const storedInfo = loadBMPInfo();
    let isUsingStoredPort = false;
    const forceNewPort = event?.shiftKey || false;

    try {
      let port: SerialPort | null = null;

      // Try quick connect first if we have a stored port and not forcing new port
      if (!forceNewPort && storedInfo?.gdbPort && hasStoredGdbPort) {
        // Give any pending disconnects from hot-reload time to complete
        // This prevents "port already open" errors during development
        await new Promise(resolve => setTimeout(resolve, 100));

        port = await findMatchingPort(storedInfo.gdbPort);
        if (port) {
          addGdbOutput('[Using last connected GDB port]');
          addGdbOutput(`[Port info: VID=${storedInfo.gdbPort.vendorId?.toString(16)}, PID=${storedInfo.gdbPort.productId?.toString(16)}]`);
          isUsingStoredPort = true;

          // Check if port seems stuck/unresponsive by trying to get info
          try {
            const info = port.getInfo();
            if (!info.usbVendorId) {
              addGdbOutput('[Stored port appears disconnected, clearing...]');
              setHasStoredGdbPort(false);
              port = null;
              isUsingStoredPort = false;
            }
          } catch {
            addGdbOutput('[Stored port invalid, clearing...]');
            setHasStoredGdbPort(false);
            port = null;
            isUsingStoredPort = false;
          }
        } else {
          addGdbOutput('[Previously used port not found, select a new one]');
          setHasStoredGdbPort(false);
        }
      } else if (forceNewPort) {
        addGdbOutput('[Manual port selection requested]');
      }

      // If no stored port or it wasn't found, request a new one
      if (!port) {
        addGdbOutput('[Select Black Magic GDB port from the dialog]');
        port = await navigator.serial.requestPort({
          filters: [{ usbVendorId: 0x1d50, usbProductId: 0x6018 }]
        });

        if (!port) {
          addGdbOutput('[Connection cancelled]');
          return;
        }
      }

      addGdbOutput('[Connecting to GDB port...]');
      await gdbClient.connect(port, { baudRate });
      addGdbOutput('[GDB Connected successfully]');

      // Save the port info for quick connect
      const portInfo = port.getInfo();
      saveGdbPort({
        vendorId: portInfo.usbVendorId,
        productId: portInfo.usbProductId
      });
      setHasStoredGdbPort(true);

      // Get version info
      try {
        const version = await gdbClient.getVersion();
        setBmpVersion(version);
        addGdbOutput(`[BMP Version] ${version.firmware}`);
      } catch (error) {
        addGdbOutput(`[Version query failed: ${error}]`);
      }
    } catch (error) {
      const errorMsg = String(error);
      addGdbOutput(`[Connection failed: ${error}]`);

      // If port is locked or we were using a stored port and it failed, clear it
      if ((isUsingStoredPort && storedInfo?.gdbPort) || errorMsg.includes('locked') || errorMsg.includes('unavailable')) {
        addGdbOutput('[Clearing saved port due to connection failure]');
        import('../utils/deviceStorage').then(({ clearGdbPort }) => {
          clearGdbPort();
          setHasStoredGdbPort(false);
        });
      }

      // If port was locked, suggest trying again
      if (errorMsg.includes('locked') || errorMsg.includes('unavailable')) {
        setTimeout(() => {
          addGdbOutput('[Port cleared. You can now click Connect again.]');
        }, 100);
      }
    }
  }, [gdbClient, isClient, baudRate, addGdbOutput, hasStoredGdbPort, gdbState]);

  const handleDisconnectGdb = useCallback(async () => {
    if (!gdbClient || !gdbClient.isConnected()) return;

    try {
      await gdbClient.disconnect();
      setTargets([]);
      addGdbOutput('[GDB Disconnected]');
    } catch (error) {
      addGdbOutput(`[GDB Disconnect failed: ${error}]`);
    }
  }, [gdbClient, addGdbOutput]);

  // UART Connection handlers
  const handleConnectUart = useCallback(async () => {
    if (!isClient) return;

    const storedInfo = loadBMPInfo();
    let isUsingStoredPort = false;

    try {
      let port: SerialPort | null = null;

      // Try quick connect first if we have a stored port
      if (storedInfo?.uartPort) {
        port = await findMatchingPort(storedInfo.uartPort);
        if (port) {
          addUartOutput('[Using last connected UART port]');
          isUsingStoredPort = true;
        } else {
          addUartOutput('[Previously used port not found, select a new one]');
        }
      }

      // If no stored port or it wasn't found, request a new one
      if (!port) {
        port = await navigator.serial.requestPort({
          filters: [{ usbVendorId: 0x1d50, usbProductId: 0x6018 }]
        });

        if (!port) {
          addUartOutput('[Connection cancelled]');
          return;
        }
      }

      // UART connection - baudrate matters for actual UART, not for USB CDC
      await port.open({ baudRate });

      const reader = port.readable?.getReader();
      if (!reader) {
        throw new Error('Failed to get reader');
      }

      setUartPort(port);
      setUartReader(reader);
      setUartConnected(true);
      addUartOutput('[UART Connected]');

      // Save the port info for quick connect
      const portInfo = port.getInfo();
      saveUartPort({
        vendorId: portInfo.usbVendorId,
        productId: portInfo.usbProductId
      });
      setHasStoredUartPort(true);

      // Switch to UART tab when connected
      setActiveRightPanel('uart');

      // Start reading
      (async () => {
        try {
          while (port.readable && reader) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              const text = new TextDecoder().decode(value);
              addUartOutput(text);
            }
          }
        } catch (error) {
          addUartOutput(`[Read error: ${error}]`);
        }
      })();
    } catch (error) {
      addUartOutput(`[Connection failed: ${error}]`);

      // If we were using a stored port and it failed, clear it
      if (isUsingStoredPort && storedInfo?.uartPort) {
        addUartOutput('[Clearing saved port due to connection failure]');
        import('../utils/deviceStorage').then(({ clearUartPort }) => {
          clearUartPort();
          setHasStoredUartPort(false);
        });
      }
    }
  }, [isClient, baudRate, addUartOutput]);

  const handleDisconnectUart = useCallback(async () => {
    try {
      if (uartReader) {
        await uartReader.cancel();
        uartReader.releaseLock();
      }
      if (uartPort) {
        await uartPort.close();
      }
      setUartPort(null);
      setUartReader(null);
      setUartConnected(false);
      addUartOutput('[UART Disconnected]');
    } catch (error) {
      addUartOutput(`[UART Disconnect failed: ${error}]`);
    }
  }, [uartPort, uartReader, addUartOutput]);


  // Debug panel handlers - Define these first before they're used in other handlers
  const handleRefreshRegisters = useCallback(async () => {
    if (!gdbClient || gdbState !== ConnectionState.ATTACHED) return;

    try {
      const regs = await gdbClient.getFormattedRegisters();
      const regValues: RegisterValue[] = Array.from(regs.entries()).map(([name, value]) => ({
        name,
        value,
        size: 32 // ARM registers are 32-bit
      }));

      console.log('[handleRefreshRegisters] Setting registers:', regValues.slice(0, 5).map(r => `${r.name}=0x${r.value.toString(16)}`));
      setRegisters(regValues);

      // Update PC for disassembly view
      const pc = regs.get('pc');
      if (pc !== undefined) {
        setProgramCounter(pc);
      }

      addGdbOutput('[Registers refreshed]');
    } catch (error) {
      const errorMsg = String(error);
      if (errorMsg.includes('EFF') || errorMsg.includes('Failed to read registers')) {
        addGdbOutput('[Cannot read registers - target may be running. Try halting first.]');
      } else {
        addGdbOutput(`[Failed to read registers: ${error}]`);
      }
    }
  }, [gdbClient, gdbState, addGdbOutput]);

  const handleRefreshStack = useCallback(async () => {
    if (!gdbClient || gdbState !== ConnectionState.ATTACHED) return;

    try {
      const frames = await gdbClient.getBacktrace();
      const stackData: StackFrame[] = frames.map((frame) => ({
        level: frame.level,
        address: frame.address,
        function: frame.function
      }));
      setStackFrames(stackData);
      addGdbOutput('[Stack refreshed]');
    } catch (error) {
      addGdbOutput(`[Failed to read stack: ${error}]`);
    }
  }, [gdbClient, gdbState, addGdbOutput]);

  const handleReadMemory = useCallback(async (address: number, length: number): Promise<Uint8Array | null> => {
    if (!gdbClient || gdbState !== ConnectionState.ATTACHED) return null;

    try {
      const data = await gdbClient.readMemory(address, length);
      addGdbOutput(`[Read ${length} bytes from 0x${address.toString(16).toUpperCase()}]`);
      return data;
    } catch (error) {
      addGdbOutput(`[Memory read failed: ${error}]`);
      return null;
    }
  }, [gdbClient, gdbState, addGdbOutput]);

  // Target control handlers
  const handleScanTargets = useCallback(async () => {
    if (!gdbClient) return;

    try {
      addGdbOutput('> monitor swdp_scan');
      const result = await gdbClient.scanSwd();
      setTargets(result.targets);
      addGdbOutput(`[Found ${result.targets.length} target(s)]`);
      if (result.voltage !== null) {
        addGdbOutput(`[Target voltage: ${result.voltage.toFixed(2)}V]`);
      }
      result.targets.forEach((t) => {
        addGdbOutput(`  ${t.id}: ${t.description}`);
      });
    } catch (error) {
      addGdbOutput(`[Scan failed: ${error}]`);
    }
  }, [gdbClient, addGdbOutput]);

  const handleHalt = useCallback(async () => {
    if (!gdbClient || gdbState !== ConnectionState.ATTACHED) return;
    try {
      addGdbOutput('> Ctrl+C (interrupt)');
      await gdbClient.halt();
      addGdbOutput('[Target halted]');

      // Auto-refresh panels after halt
      try {
        const regs = await gdbClient.getFormattedRegisters();
        const regValues: RegisterValue[] = Array.from(regs.entries()).map(([name, value]) => ({
          name,
          value,
          size: 32
        }));
        setRegisters(regValues);
        const pc = regs.get('pc');
        if (pc !== undefined) setProgramCounter(pc);
      } catch (error) {
        addGdbOutput(`[Failed to refresh registers: ${error}]`);
      }

      try {
        const frames = await gdbClient.getBacktrace();
        const stackData: StackFrame[] = frames.map((frame) => ({
          level: frame.level,
          address: frame.address,
          function: frame.function
        }));
        setStackFrames(stackData);
      } catch (error) {
        addGdbOutput(`[Failed to refresh stack: ${error}]`);
      }
    } catch (error) {
      addGdbOutput(`[Halt failed: ${error}]`);
    }
  }, [gdbClient, gdbState, addGdbOutput]);

  const handleRun = useCallback(async () => {
    if (!gdbClient) return;
    try {
      addGdbOutput('> continue');
      addGdbOutput('[Target running...]');
      gdbClient.continue();
    } catch (error) {
      addGdbOutput(`[Run failed: ${error}]`);
    }
  }, [gdbClient, addGdbOutput]);

  const handleReset = useCallback(async () => {
    if (!gdbClient || gdbState !== ConnectionState.ATTACHED) return;
    try {
      addGdbOutput('> monitor reset');
      await gdbClient.reset();
      addGdbOutput('[Target reset]');

      // Auto-refresh panels after reset
      try {
        const regs = await gdbClient.getFormattedRegisters();
        const regValues: RegisterValue[] = Array.from(regs.entries()).map(([name, value]) => ({
          name,
          value,
          size: 32
        }));
        setRegisters(regValues);
        const pc = regs.get('pc');
        if (pc !== undefined) setProgramCounter(pc);
      } catch (error) {
        addGdbOutput(`[Failed to refresh registers: ${error}]`);
      }

      try {
        const frames = await gdbClient.getBacktrace();
        const stackData: StackFrame[] = frames.map((frame) => ({
          level: frame.level,
          address: frame.address,
          function: frame.function
        }));
        setStackFrames(stackData);
      } catch (error) {
        addGdbOutput(`[Failed to refresh stack: ${error}]`);
      }
    } catch (error) {
      addGdbOutput(`[Reset failed: ${error}]`);
    }
  }, [gdbClient, gdbState, addGdbOutput]);

  const handleStep = useCallback(async () => {
    if (!gdbClient || gdbState !== ConnectionState.ATTACHED) return;
    try {
      addGdbOutput('> stepi');
      await gdbClient.step();
      addGdbOutput('[Stepped one instruction]');

      // Auto-refresh panels after step
      try {
        const regs = await gdbClient.getFormattedRegisters();
        const regValues: RegisterValue[] = Array.from(regs.entries()).map(([name, value]) => ({
          name,
          value,
          size: 32
        }));
        setRegisters(regValues);
        const pc = regs.get('pc');
        if (pc !== undefined) setProgramCounter(pc);
      } catch (error) {
        addGdbOutput(`[Failed to refresh registers: ${error}]`);
      }

      try {
        const frames = await gdbClient.getBacktrace();
        const stackData: StackFrame[] = frames.map((frame) => ({
          level: frame.level,
          address: frame.address,
          function: frame.function
        }));
        setStackFrames(stackData);
      } catch (error) {
        addGdbOutput(`[Failed to refresh stack: ${error}]`);
      }
    } catch (error) {
      addGdbOutput(`[Step failed: ${error}]`);
    }
  }, [gdbClient, gdbState, addGdbOutput]);

  // Clear saved ports handler
  const handleClearSavedPorts = useCallback(() => {
    clearBMPInfo();
    setHasStoredGdbPort(false);
    setHasStoredUartPort(false);
    addGdbOutput('[Cleared saved port connections]');
    addUartOutput('[Cleared saved port connections]');
  }, [addGdbOutput, addUartOutput]);

  // Check version handler
  const handleCheckVersion = useCallback(async () => {
    if (!gdbClient || !gdbClient.isConnected()) return;

    try {
      const version = await gdbClient.getVersion();
      setBmpVersion(version);
      addGdbOutput(`[BMP Version Updated] ${version.firmware}`);
    } catch (error) {
      addGdbOutput(`[Version check failed: ${error}]`);
    }
  }, [gdbClient, addGdbOutput]);

  // Project management handlers
  const updateProjectState = useCallback(() => {
    const projectManager = projectManagerRef.current;
    if (!projectManager) return;

    projectManager.updateProject({
      gdbSettings: {
        baudRate,
        commandTimeout: 15000
      },
      memoryMap: {
        zoom: 1.5, // Default zoom
        offset: { x: 0, y: 0 }, // Default offset
        selectedCpu: selectedMemoryMapCpu,
        customRegions: customMemoryRegions
      },
      breakpoints,
      activePanel: activeRightPanel
    });

    setHasUnsavedChanges(projectManager.hasChanges());
  }, [baudRate, selectedMemoryMapCpu, customMemoryRegions, breakpoints, activeRightPanel]);

  // Sync state changes to project manager
  useEffect(() => {
    updateProjectState();
  }, [updateProjectState]);

  const handleNewProject = useCallback(() => {
    const projectManager = projectManagerRef.current;
    if (!projectManager) return;

    const project = projectManager.newProject();
    setProjectName(project.metadata.name);
    setBaudRate(project.gdbSettings.baudRate);
    setSelectedMemoryMapCpu(project.memoryMap.selectedCpu);
    setCustomMemoryRegions(project.memoryMap.customRegions);
    setBreakpoints(project.breakpoints);
    setHasUnsavedChanges(false);
    addGdbOutput('[New project created]');
  }, [addGdbOutput]);

  const handleSaveProject = useCallback(() => {
    const projectManager = projectManagerRef.current;
    if (!projectManager) return;

    updateProjectState();
    projectManager.saveToFile();
  }, [updateProjectState]);

  const handleLoadProject = useCallback(async (file: File) => {
    const projectManager = projectManagerRef.current;
    if (!projectManager) return;

    try {
      await projectManager.loadFromFile(file);
      // State will be updated by the onProjectLoaded callback
    } catch (error) {
      addGdbOutput(`[Failed to load project: ${error}]`);
    }
  }, [addGdbOutput]);

  const handleAutoSaveToggle = useCallback((enabled: boolean) => {
    const projectManager = projectManagerRef.current;
    if (!projectManager) return;

    projectManager.setAutoSave(enabled);
  }, []);

  const handleEditMetadata = useCallback((name: string, description: string) => {
    const projectManager = projectManagerRef.current;
    if (!projectManager) return;

    projectManager.updateMetadata(name, description);
    setProjectName(name);
    setHasUnsavedChanges(true);
    addGdbOutput(`[Project renamed: ${name}]`);
  }, [addGdbOutput]);

  // Auto-refresh registers when attached to target
  useEffect(() => {
    if (gdbState === ConnectionState.ATTACHED) {
      handleRefreshRegisters();
      handleRefreshStack();
    }
  }, [gdbState, handleRefreshRegisters, handleRefreshStack]);

  // Panel resize handlers
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left;
      const newLeftWidth = (offsetX / containerRect.width) * 100;
      if (newLeftWidth >= 20 && newLeftWidth <= 80) {
        setLeftWidth(newLeftWidth);
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const targetAttached = gdbState === ConnectionState.ATTACHED;

  return (
    <div className="battlemagic-container flex flex-col bg-gray-950 text-white">
      {/* Header - Always shown with logo */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/battlemagiclogo.png"
              alt="BattleMagic Logo"
              width={100}
              height={100}
              className="rounded"
            />
            <div>
              <h1 className="text-2xl font-bold font-mono">
                <span className="text-green-400">Battle</span>Magic
              </h1>
              <p className="text-sm text-gray-400">Black Magic Probe Debugger</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isClient && (
              <ProjectMenu
                projectName={projectName}
                hasUnsavedChanges={hasUnsavedChanges}
                autoSaveEnabled={autoSaveEnabled}
                onNew={handleNewProject}
                onSave={handleSaveProject}
                onLoad={handleLoadProject}
                onAutoSaveToggle={handleAutoSaveToggle}
                onEditMetadata={handleEditMetadata}
              />
            )}
            <Link
              href="/tools"
              className="text-gray-300 hover:text-green-400 transition-colors font-mono text-sm flex items-center gap-2"
            >
              <span>← Back to Tools</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Connection Bar */}
      {isClient && (
        <ConnectionBar
          gdbState={gdbState}
          uartConnected={uartConnected}
          targetAttached={targetAttached}
          baudRate={baudRate}
          bmpVersion={bmpVersion}
          onBaudRateChange={setBaudRate}
          onConnectGdb={handleConnectGdb}
          onDisconnectGdb={handleDisconnectGdb}
          onConnectUart={handleConnectUart}
          onDisconnectUart={handleDisconnectUart}
          onScanTargets={handleScanTargets}
          onHalt={handleHalt}
          onRun={handleRun}
          onReset={handleReset}
          onStep={handleStep}
          hasStoredGdbPort={hasStoredGdbPort}
          onCheckVersion={handleCheckVersion}
          hasStoredUartPort={hasStoredUartPort}
          onClearSavedPorts={handleClearSavedPorts}
        />
      )}

      {/* Main Content - Resizable Panels */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {isClient ? (
          <>
            {/* GDB Panel */}
            <div className="h-full overflow-hidden" style={{ width: `${leftWidth}%` }}>
              <GdbPanel
                gdbClient={gdbClient}
                output={gdbOutput}
                targets={targets}
                onAttachTarget={async (targetId) => {
                  if (!gdbClient) return;
                  try {
                    await gdbClient.attach(targetId);
                    addGdbOutput(`[Attached to target ${targetId}]`);

                    // Auto-halt target after attach so registers can be read
                    addGdbOutput('> Ctrl+C (interrupt)');
                    await gdbClient.halt();
                    addGdbOutput('[Target halted]');

                    // Auto-switch to debugger view when target attached
                    setActiveRightPanel('debugger');
                  } catch (error) {
                    addGdbOutput(`[Attach failed: ${error}]`);
                  }
                }}
                onScanSwd={handleScanTargets}
                onClearOutput={clearGdbOutput}
              />
            </div>

            {/* Divider */}
            <ResizableDivider onMouseDown={handleMouseDown} />

            {/* Right Panel - Debugger or Utility Views */}
            <div className="h-full overflow-hidden flex flex-col" style={{ width: `${100 - leftWidth}%` }}>
              {/* Tab Bar - Only show when NOT in debugger view or target not attached */}
              {(!targetAttached || activeRightPanel !== 'debugger') && (
                <div className="flex items-center gap-1 bg-gray-900 border-b border-gray-700 px-3 py-1">
                  {targetAttached && (
                    <button
                      onClick={() => setActiveRightPanel('debugger')}
                      className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                        activeRightPanel === 'debugger'
                          ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }`}
                    >
                      Debug View
                    </button>
                  )}
                  <button
                    onClick={() => setActiveRightPanel('target')}
                    className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                      activeRightPanel === 'target'
                        ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    Target Info
                  </button>
                  <button
                    onClick={() => setActiveRightPanel('flash')}
                    className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                      activeRightPanel === 'flash'
                        ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    Flash
                  </button>
                  <button
                    onClick={() => setActiveRightPanel('extract')}
                    className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                      activeRightPanel === 'extract'
                        ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    Extract
                  </button>
                  <button
                    onClick={() => setActiveRightPanel('breakpoints')}
                    className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                      activeRightPanel === 'breakpoints'
                        ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    Breakpoints
                  </button>
                  <button
                    onClick={() => setActiveRightPanel('memorymap')}
                    className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                      activeRightPanel === 'memorymap'
                        ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    Memory Map
                  </button>
                  {uartConnected && (
                    <button
                      onClick={() => setActiveRightPanel('uart')}
                      className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                        activeRightPanel === 'uart'
                          ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }`}
                    >
                      UART
                    </button>
                  )}
                  <button
                    onClick={() => setActiveRightPanel('swo')}
                    className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                      activeRightPanel === 'swo'
                        ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    SWO
                  </button>
                </div>
              )}

              {/* Main Content Area */}
              <div className="flex-1 overflow-hidden">
                {/* Show DebuggerView by default when target is attached */}
                {targetAttached && activeRightPanel === 'debugger' && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between bg-gray-900 border-b border-gray-700 px-3 py-1.5">
                      <h3 className="text-xs font-mono text-green-400 font-bold">DEBUG VIEW</h3>
                      <button
                        onClick={() => setActiveRightPanel('target')}
                        className="text-xs px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                        title="Switch to utilities"
                      >
                        Utilities →
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <DebuggerView
                        gdbClient={gdbClient}
                        isConnected={targetAttached}
                        registers={registers}
                        stackFrames={stackFrames}
                        programCounter={programCounter}
                        onRefreshRegisters={handleRefreshRegisters}
                        onRefreshStack={handleRefreshStack}
                        onReadMemory={handleReadMemory}
                        onOutput={addGdbOutput}
                      />
                    </div>
                  </div>
                )}
                {activeRightPanel === 'target' && (
                  <TargetInfoPanel
                    client={gdbClient}
                  />
                )}
                {activeRightPanel === 'flash' && (
                  <FlashProgrammer
                    gdbClient={gdbClient}
                    isConnected={targetAttached}
                    onBinaryLoaded={(binaryInfo) => {
                      setLoadedBinary(binaryInfo);
                      addGdbOutput(`[Binary loaded: ${binaryInfo.architecture}]`);
                    }}
                  />
                )}
                {activeRightPanel === 'extract' && (
                  <FirmwareExtractor
                    gdbClient={gdbClient}
                    isConnected={targetAttached}
                  />
                )}
                {activeRightPanel === 'breakpoints' && (
                  <BreakpointsManager
                    gdbClient={gdbClient}
                    isConnected={targetAttached}
                    onOutput={addGdbOutput}
                    breakpoints={breakpoints}
                    onBreakpointsChange={setBreakpoints}
                  />
                )}
                {activeRightPanel === 'memorymap' && (
                  <MemoryMapView
                    gdbClient={gdbClient}
                    loadedBinary={loadedBinary}
                    customRegions={customMemoryRegions}
                    onCustomRegionsChange={setCustomMemoryRegions}
                    selectedCpu={selectedMemoryMapCpu}
                    onSelectedCpuChange={setSelectedMemoryMapCpu}
                    onRegionSelect={(region) => {
                      addGdbOutput(`[Selected memory region: ${region.name} at 0x${region.start.toString(16).toUpperCase()}]`);
                    }}
                  />
                )}
                {activeRightPanel === 'uart' && (
                  <UartPanel
                    isConnected={uartConnected}
                    output={uartOutput}
                    onSendData={async (data: string) => {
                      if (!uartPort?.writable) return;
                      try {
                        const writer = uartPort.writable.getWriter();
                        await writer.write(new TextEncoder().encode(data + '\n'));
                        writer.releaseLock();
                      } catch (error) {
                        addUartOutput(`[Send failed: ${error}]`);
                      }
                    }}
                  />
                )}
                {activeRightPanel === 'swo' && (
                  <SwoViewer
                    gdbClient={gdbClient}
                    isConnected={targetAttached}
                    onOutput={addGdbOutput}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-gray-400 font-mono">Initializing...</div>
          </div>
        )}
      </div>
    </div>
  );
}
