'use client';

/**
 * BattleMagic Monitor - Main Application Component
 *
 * Professional IDA Pro-inspired debugger interface for Black Magic Probe
 * with menu bar, toolbar, and organized panels
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../battlemagic.css';
import Image from 'next/image';
import Link from 'next/link';
import { GdbClient, GdbClientCallbacks } from '../lib/gdb/GdbClient';
import { ConnectionState, Target, StopReply, BmpVersion } from '../lib/gdb/types';
import { XrefProvider } from '../lib/context/XrefContext';
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
import { FirmwareDumpWorkflow } from './FirmwareDumpWorkflow';
import {
  saveGdbPort,
  saveUartPort
} from '../utils/deviceStorage';
import { MemoryRegion } from '../lib/memory/MemoryMapParser';
import { ProjectManager } from '../lib/project/ProjectManager';
import { detectArchitecture, ArchitectureInfo } from '../lib/wasmAnalyzer';

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
  const [bmpVersion, setBmpVersion] = useState<BmpVersion | null>(null);
  const lastOutputRef = useRef<{text: string; timestamp: number} | null>(null);

  // Debug panels state
  const [registers, setRegisters] = useState<RegisterValue[]>([]);
  const [stackFrames, setStackFrames] = useState<StackFrame[]>([]);
  const [activeRightPanel, setActiveRightPanel] = useState<'debugger' | 'target' | 'flash' | 'extract' | 'breakpoints' | 'memorymap' | 'uart' | 'swo' | 'analysis' | 'xrefs' | 'firmware-dump'>('debugger');
  const [programCounter, setProgramCounter] = useState<number | undefined>();
  const [customMemoryRegions, setCustomMemoryRegions] = useState<MemoryRegion[]>([]);
  const [selectedMemoryMapCpu, setSelectedMemoryMapCpu] = useState<string>('generic-cortex-m4');
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [selectedDisassemblyAddress] = useState<number | null>(null);

  // Convert breakpoints to Set<number> for DisassemblyView
  const breakpointAddresses = new Set<number>(
    breakpoints
      .filter(bp => bp.enabled)
      .map(bp => {
        const addr = bp.address.startsWith('0x') || bp.address.startsWith('0X')
          ? parseInt(bp.address, 16)
          : parseInt(bp.address, 10);
        return isNaN(addr) ? 0 : addr;
      })
      .filter(addr => addr !== 0)
  );

  // Panel resize state
  const [consoleWidth, setConsoleWidth] = useState(25); // Console is now on the right, 25% width
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Panel visibility state
  const [visiblePanels, setVisiblePanels] = useState({
    console: true,
    registers: true,
    stack: true,
    memory: true,
  });

  // Project management state
  const projectManagerRef = useRef<ProjectManager | null>(null);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Execution state for status bar
  const [executionState, setExecutionState] = useState<'running' | 'stopped' | 'stepping'>('stopped');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [currentTarget, setCurrentTarget] = useState<Target | null>(null);

  // Auto-analysis prompt state
  const [showAnalysisPrompt, setShowAnalysisPrompt] = useState(false);
  const [detectedArchInfo, setDetectedArchInfo] = useState<ArchitectureInfo | null>(null);

  // Ensure we're on the client side before rendering serial-dependent components
  useEffect(() => {
    setIsClient(true);

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
  const handleConnectGdb = useCallback(async () => {
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

    try {
      // Always show port selection dialog
      addGdbOutput('[Select Black Magic GDB port from the dialog]');
      const port = await navigator.serial.requestPort({
        filters: [{ usbVendorId: 0x1d50, usbProductId: 0x6018 }]
      });

      if (!port) {
        addGdbOutput('[Connection cancelled]');
        return;
      }

      addGdbOutput('[Connecting to GDB port...]');
      await gdbClient.connect(port, { baudRate });
      addGdbOutput('[GDB Connected successfully]');

      // Save the port info for reference
      const portInfo = port.getInfo();
      saveGdbPort({
        vendorId: portInfo.usbVendorId,
        productId: portInfo.usbProductId
      });

      // Get version info
      try {
        const version = await gdbClient.getVersion();
        setBmpVersion(version);
        addGdbOutput(`[BMP Version] ${version.firmware}`);
      } catch (error) {
        addGdbOutput(`[Version query failed: ${error}]`);
      }
    } catch (error) {
      addGdbOutput(`[Connection failed: ${error}]`);
    }
  }, [gdbClient, isClient, baudRate, addGdbOutput, gdbState]);

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

  // UART data reader
  const readUartData = useCallback(async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Decode and add to UART output
        const text = new TextDecoder().decode(value);
        addUartOutput(text);
      }
    } catch (error) {
      console.error('UART read error:', error);
      addUartOutput(`[UART read error: ${error}]`);
    } finally {
      reader.releaseLock();
    }
  }, [addUartOutput]);

  // UART Connection handlers
  const handleConnectUart = useCallback(async () => {
    if (!isClient) return;

    try {
      addGdbOutput('[Select Black Magic UART port from the dialog]');
      const port = await navigator.serial.requestPort({
        filters: [{ usbVendorId: 0x1d50, usbProductId: 0x6018 }]
      });

      if (!port) {
        addGdbOutput('[UART connection cancelled]');
        return;
      }

      // Open the port (default 115200 baud for UART)
      await port.open({ baudRate: 115200 });
      setUartPort(port);
      setUartConnected(true);
      addGdbOutput('[UART Connected]');
      addUartOutput('[UART Connected - Ready to receive data]');

      // Save the port info for reference
      const portInfo = port.getInfo();
      saveUartPort({
        vendorId: portInfo.usbVendorId,
        productId: portInfo.usbProductId
      });

      // Set up reader for UART data
      if (port.readable) {
        const reader = port.readable.getReader();
        setUartReader(reader);
        readUartData(reader);
      }
    } catch (error) {
      addGdbOutput(`[UART connection failed: ${error}]`);
      addUartOutput(`[UART connection failed: ${error}]`);
    }
  }, [isClient, addGdbOutput, addUartOutput, readUartData]);

  const handleDisconnectUart = useCallback(async () => {
    if (!uartPort) return;

    try {
      // Close the reader first
      if (uartReader) {
        try {
          await uartReader.cancel();
          uartReader.releaseLock();
        } catch (error) {
          console.error('Error releasing reader:', error);
        }
        setUartReader(null);
      }

      // Close the port
      await uartPort.close();
      setUartPort(null);
      setUartConnected(false);
      addGdbOutput('[UART Disconnected]');
      addUartOutput('[UART Disconnected]');
    } catch (error) {
      addGdbOutput(`[UART disconnect failed: ${error}]`);
      addUartOutput(`[UART disconnect failed: ${error}]`);
    }
  }, [uartPort, uartReader, addGdbOutput, addUartOutput]);


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
      setLastUpdate(new Date());

      // Detect architecture and prompt for analysis if supported
      if (result.targets.length > 0) {
        const target = result.targets[0];
        try {
          const archInfo = await detectArchitecture(target.description);
          setDetectedArchInfo(archInfo);

          addGdbOutput(`[Architecture: ${archInfo.architecture}]`);
          addGdbOutput(`[Manufacturer: ${archInfo.manufacturer}]`);
          addGdbOutput(`[Analysis Support: ${archInfo.supported ? '✅ Supported' : '❌ Not Supported'}]`);
          addGdbOutput(`[Match Confidence: ${(archInfo.confidence * 100).toFixed(1)}%]`);

          // If architecture is supported, prompt user for auto-analysis
          if (archInfo.supported) {
            setShowAnalysisPrompt(true);
          }
        } catch (error) {
          addGdbOutput(`[Architecture detection failed: ${error}]`);
        }
      }
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
      setExecutionState('stopped');
      setLastUpdate(new Date());

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
      setExecutionState('running');
      setLastUpdate(new Date());
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
      setExecutionState('stepping');
      await gdbClient.step();
      addGdbOutput('[Stepped one instruction]');
      setExecutionState('stopped');
      setLastUpdate(new Date());

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
      setExecutionState('stopped');
    }
  }, [gdbClient, gdbState, addGdbOutput]);

  // Note: Version check and port management now handled by menu/toolbar

  // Breakpoint management - unified handler for both DisassemblyView and BreakpointsManager
  const handleToggleBreakpoint = useCallback(async (address: number) => {
    if (!gdbClient || gdbState !== ConnectionState.ATTACHED) {
      addGdbOutput('[Error] Not connected to target');
      return;
    }

    const addressStr = `0x${address.toString(16).toUpperCase()}`;
    const existingBp = breakpoints.find(bp => {
      const bpAddr = bp.address.startsWith('0x') || bp.address.startsWith('0X')
        ? parseInt(bp.address, 16)
        : parseInt(bp.address, 10);
      return bpAddr === address;
    });

    try {
      if (existingBp) {
        // Remove breakpoint
        await gdbClient.removeBreakpoint(address);
        setBreakpoints(prev => prev.filter(bp => bp.id !== existingBp.id));
        addGdbOutput(`[Breakpoint removed at ${addressStr}]`);
      } else {
        // Add breakpoint
        await gdbClient.insertBreakpoint(address);
        const newBreakpoint: Breakpoint = {
          id: `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          address: addressStr,
          type: 'software',
          enabled: true,
          description: `Address: ${addressStr}`,
          hitCount: 0
        };
        setBreakpoints(prev => [...prev, newBreakpoint]);
        addGdbOutput(`[Breakpoint set at ${addressStr}]`);
      }
    } catch (error) {
      addGdbOutput(`[Failed to ${existingBp ? 'remove' : 'set'} breakpoint: ${error}]`);
    }
  }, [gdbClient, gdbState, breakpoints, addGdbOutput]);

  // Analysis handler
  const handleAnalysisComplete = useCallback((results: AnalysisResults) => {
    addGdbOutput('[Analysis] Binary analysis completed successfully');
    addGdbOutput(`[Analysis] Results: ${results.totalInstructions} instructions, ${results.functionsDetected} functions`);
  }, [addGdbOutput]);

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

  // Panel visibility handlers
  const handlePanelToggle = useCallback((panel: keyof typeof visiblePanels) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panel]: !prev[panel],
    }));
  }, []);

  const handleViewToggle = useCallback((view: string) => {
    setActiveRightPanel(view as typeof activeRightPanel);
  }, []);

  const handleToolSelect = useCallback((tool: string) => {
    setActiveRightPanel(tool as typeof activeRightPanel);
  }, []);

  // Panel resize handlers
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left;
      // Calculate console width from the right side
      const newConsoleWidth = ((containerRect.width - offsetX) / containerRect.width) * 100;
      // Console can be 15-40% of screen width
      if (newConsoleWidth >= 15 && newConsoleWidth <= 40) {
        setConsoleWidth(newConsoleWidth);
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
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const gdbConnected = gdbState === ConnectionState.CONNECTED || gdbState === ConnectionState.ATTACHED;
  const targetAttached = gdbState === ConnectionState.ATTACHED;

  return (
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
            className="text-gray-300 hover:text-green-400 transition-colors font-mono text-xs flex items-center gap-1"
          >
            <span>← Tools</span>
          </Link>
        </div>
      </div>

      {/* Menu Bar - IDA Pro style */}
      {isClient && (
        <MenuBar
          onNewProject={handleNewProject}
          onSaveProject={handleSaveProject}
          onLoadProject={handleLoadProject}
          onDisconnect={handleDisconnectGdb}
          onViewToggle={handleViewToggle}
          onToolSelect={handleToolSelect}
          activeView={activeRightPanel}
          isConnected={gdbConnected}
          isAttached={targetAttached}
          visiblePanels={visiblePanels}
          onPanelToggle={handlePanelToggle}
        />
      )}

      {/* Toolbar - Quick actions */}
      {isClient && (
        <Toolbar
          gdbState={gdbState}
          targetAttached={targetAttached}
          uartConnected={uartConnected}
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
            setLastUpdate(new Date());
          }}
        />
      )}

      {/* Main Content - IDA Pro-like Layout */}
      <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
        {isClient ? (
          <>
            {/* Main Horizontal Split: Content (70-85%) | Console (15-30%) */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Side - Main Content (70-85% when console visible, 100% when hidden) */}
              <div className="flex flex-col overflow-hidden" style={{ width: visiblePanels.console ? `${100 - consoleWidth}%` : '100%' }}>
                {/* Show DebuggerView by default when target is attached */}
                {targetAttached && activeRightPanel === 'debugger' && (
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
                    breakpoints={breakpointAddresses}
                    onToggleBreakpoint={handleToggleBreakpoint}
                    visiblePanels={{
                      registers: visiblePanels.registers,
                      stack: visiblePanels.stack,
                      memory: visiblePanels.memory
                    }}
                  />
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
                    setBreakpoints={setBreakpoints}
                  />
                )}
                {activeRightPanel === 'memorymap' && (
                  <MemoryMapView
                    gdbClient={gdbClient}
                    onRegionSelect={(region) => {
                      addGdbOutput(`[Selected memory region: ${region.name}]`);
                    }}
                  />
                )}
                {activeRightPanel === 'uart' && (
                  <UartPanel
                    isConnected={uartConnected}
                    output={uartOutput}
                    onConnect={handleConnectUart}
                    onDisconnect={handleDisconnectUart}
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
                {activeRightPanel === 'analysis' && (
                  <AnalysisPanel
                    gdbClient={gdbClient}
                    isConnected={targetAttached}
                    onAnalysisComplete={handleAnalysisComplete}
                    onOutput={addGdbOutput}
                  />
                )}
                {activeRightPanel === 'xrefs' && (
                  <XrefPanel
                    selectedAddress={selectedDisassemblyAddress}
                    onNavigateToAddress={() => {
                      // Switch to debugger view and navigate
                      setActiveRightPanel('debugger');
                      // The navigation will be handled by DisassemblyView internally
                      // We just need to ensure we're on the debugger view
                    }}
                  />
                )}
                {activeRightPanel === 'firmware-dump' && gdbClient && (
                  <FirmwareDumpWorkflow gdbClient={gdbClient} />
                )}
              </div>

              {/* Console Panel - Right side (15-30%), collapsible */}
              {visiblePanels.console && (
                <>
                  <ResizableDivider onMouseDown={handleMouseDown} />
                  <div className="h-full overflow-hidden flex flex-col bg-black" style={{ width: `${consoleWidth}%` }}>
                    <div className="bg-gray-900 border-b border-gray-700 px-3 py-1.5 flex items-center justify-between">
                      <h3 className="text-xs font-mono text-green-400 font-bold">CONSOLE</h3>
                      <button
                        onClick={() => handlePanelToggle('console')}
                        className="text-xs px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                        title="Close console"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <GdbPanel
                        gdbClient={gdbClient}
                        output={gdbOutput}
                        targets={targets}
                        onAttachTarget={async (targetId) => {
                          if (!gdbClient) return;
                          try {
                            await gdbClient.attach(targetId);
                            addGdbOutput(`[Attached to target ${targetId}]`);
                            const target = targets.find(t => t.id === targetId);
                            if (target) setCurrentTarget(target);

                            // Auto-halt target after attach so registers can be read
                            addGdbOutput('> Ctrl+C (interrupt)');
                            await gdbClient.halt();
                            addGdbOutput('[Target halted]');
                            setExecutionState('stopped');

                            // Auto-switch to debugger view when target attached
                            setActiveRightPanel('debugger');
                          } catch (error) {
                            addGdbOutput(`[Attach failed: ${error}]`);
                          }
                        }}
                        onScanSwd={handleScanTargets}
                        onClearOutput={clearGdbOutput}
                        onOutput={addGdbOutput}
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
      {showAnalysisPrompt && detectedArchInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-green-500 rounded-lg p-6 max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-green-400 mb-4 font-mono">
              Firmware Analysis Available
            </h2>
            <div className="space-y-3 mb-6 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Architecture:</span>
                <span className="text-green-400">{detectedArchInfo.architecture}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Manufacturer:</span>
                <span className="text-white">{detectedArchInfo.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Chip:</span>
                <span className="text-white">{detectedArchInfo.chip_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Confidence:</span>
                <span className="text-green-400">{(detectedArchInfo.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-gray-300 mb-6 text-sm">
              This chip is supported for firmware analysis. Would you like to dump and analyze the firmware now?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAnalysisPrompt(false);
                  setActiveRightPanel('firmware-dump');
                  addGdbOutput('[Auto-analysis starting...]');
                  addGdbOutput('[Opening firmware dump workflow - analysis will begin automatically]');
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded font-mono transition-colors"
              >
                Yes, Analyze
              </button>
              <button
                onClick={() => {
                  setShowAnalysisPrompt(false);
                  addGdbOutput('[Analysis prompt dismissed - you can manually analyze later via Tools → Firmware Dump]');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded font-mono transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar - IDA Pro style */}
      {isClient && (
        <StatusBar
          gdbState={gdbState}
          uartConnected={uartConnected}
          bmpVersion={bmpVersion}
          currentTarget={currentTarget}
          programCounter={programCounter}
          executionState={executionState}
          lastUpdate={lastUpdate}
        />
      )}
    </div>
    </XrefProvider>
  );
}
