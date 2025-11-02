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
import RegistersPanel, { RegisterValue } from './RegistersPanel';
import MemoryPanel from './MemoryPanel';
import StackPanel, { StackFrame } from './StackPanel';
import { TargetInfoPanel } from './TargetInfoPanel';
import FlashProgrammer from './FlashProgrammer';
import BreakpointsManager from './BreakpointsManager';
import FirmwareExtractor from './FirmwareExtractor';
import DisassemblyView from './DisassemblyView';
import { MemoryMapView } from './MemoryMapView';
import SwoViewer from './SwoViewer';
import {
  saveGdbPort,
  saveUartPort,
  loadBMPInfo,
  findMatchingPort,
  clearBMPInfo
} from '../utils/deviceStorage';

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

  // Debug panels state
  const [registers, setRegisters] = useState<RegisterValue[]>([]);
  const [stackFrames, setStackFrames] = useState<StackFrame[]>([]);
  const [activeRightPanel, setActiveRightPanel] = useState<'target' | 'flash' | 'extract' | 'breakpoints' | 'disasm' | 'registers' | 'memory' | 'memorymap' | 'stack' | 'uart' | 'swo'>('target');
  const [programCounter, setProgramCounter] = useState<number | undefined>();

  // Panel resize state
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, []);

  // Initialize GDB client
  useEffect(() => {
    if (!isClient) return;

    const callbacks: GdbClientCallbacks = {
      onStateChange: (state) => {
        setGdbState(state);
        addGdbOutput(`[State] ${state}`);
      },
      onStopped: (reply: StopReply) => {
        addGdbOutput(`[Target stopped] Signal: ${reply.signal}`);
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
      commandTimeout: 15000 // Increase timeout to 15 seconds for initial connection
    }, callbacks);
    setGdbClient(client);

    return () => {
      if (client.isConnected()) {
        client.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  // Helper to add GDB output
  const addGdbOutput = useCallback((text: string) => {
    setGdbOutput((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
  }, []);

  // Helper to add UART output
  const addUartOutput = useCallback((text: string) => {
    setUartOutput((prev) => [...prev, text]);
  }, []);

  // GDB Connection handlers
  const handleConnectGdb = useCallback(async (event?: React.MouseEvent) => {
    if (!gdbClient || !isClient) return;

    const storedInfo = loadBMPInfo();
    let isUsingStoredPort = false;
    const forceNewPort = event?.shiftKey || false;

    try {
      let port: SerialPort | null = null;

      // Try quick connect first if we have a stored port and not forcing new port
      if (!forceNewPort && storedInfo?.gdbPort && hasStoredGdbPort) {
        port = await findMatchingPort(storedInfo.gdbPort);
        if (port) {
          addGdbOutput('[Using last connected GDB port]');
          addGdbOutput(`[Port info: VID=${storedInfo.gdbPort.vendorId?.toString(16)}, PID=${storedInfo.gdbPort.productId?.toString(16)}]`);
          isUsingStoredPort = true;
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
      addGdbOutput(`[Connection failed: ${error}]`);

      // If we were using a stored port and it failed, clear it
      if (isUsingStoredPort && storedInfo?.gdbPort) {
        addGdbOutput('[Clearing saved port due to connection failure]');
        import('../utils/deviceStorage').then(({ clearGdbPort }) => {
          clearGdbPort();
          setHasStoredGdbPort(false);
        });
      }
    }
  }, [gdbClient, isClient, baudRate, addGdbOutput, hasStoredGdbPort]);

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


  // Target control handlers
  const handleScanTargets = useCallback(async () => {
    if (!gdbClient) return;

    try {
      addGdbOutput('[Scanning for SWD targets...]');
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
    if (!gdbClient) return;
    try {
      await gdbClient.halt();
      addGdbOutput('[Target halted]');
    } catch (error) {
      addGdbOutput(`[Halt failed: ${error}]`);
    }
  }, [gdbClient, addGdbOutput]);

  const handleRun = useCallback(async () => {
    if (!gdbClient) return;
    try {
      addGdbOutput('[Target running...]');
      gdbClient.continue();
    } catch (error) {
      addGdbOutput(`[Run failed: ${error}]`);
    }
  }, [gdbClient, addGdbOutput]);

  const handleReset = useCallback(async () => {
    if (!gdbClient) return;
    try {
      await gdbClient.reset();
      addGdbOutput('[Target reset]');
    } catch (error) {
      addGdbOutput(`[Reset failed: ${error}]`);
    }
  }, [gdbClient, addGdbOutput]);

  const handleStep = useCallback(async () => {
    if (!gdbClient) return;
    try {
      await gdbClient.step();
      addGdbOutput('[Stepped one instruction]');
    } catch (error) {
      addGdbOutput(`[Step failed: ${error}]`);
    }
  }, [gdbClient, addGdbOutput]);

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

  // Debug panel handlers
  const handleRefreshRegisters = useCallback(async () => {
    if (!gdbClient || gdbState !== ConnectionState.ATTACHED) return;

    try {
      const regs = await gdbClient.getFormattedRegisters();
      const regValues: RegisterValue[] = Array.from(regs.entries()).map(([name, value]) => ({
        name,
        value,
        size: 32 // ARM registers are 32-bit
      }));
      setRegisters(regValues);

      // Update PC for disassembly view
      const pc = regs.get('pc');
      if (pc !== undefined) {
        setProgramCounter(pc);
      }

      addGdbOutput('[Registers refreshed]');
    } catch (error) {
      addGdbOutput(`[Failed to read registers: ${error}]`);
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
        <div className="max-w-[1920px] mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/battlemagiclogo.png"
              alt="BattleMagic Logo"
              width={80}
              height={80}
              className="rounded"
            />
            <div>
              <h1 className="text-2xl font-bold font-mono">
                <span className="text-green-400">Battle</span>Magic
              </h1>
              <p className="text-sm text-gray-400">Black Magic Probe Debugger</p>
            </div>
          </div>
          <Link
            href="/tools"
            className="text-gray-300 hover:text-green-400 transition-colors font-mono text-sm flex items-center gap-2"
          >
            <span>← Back to Tools</span>
          </Link>
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
                  } catch (error) {
                    addGdbOutput(`[Attach failed: ${error}]`);
                  }
                }}
              />
            </div>

            {/* Divider */}
            <ResizableDivider onMouseDown={handleMouseDown} />

            {/* Right Panel - Debug Views */}
            <div className="h-full overflow-hidden flex flex-col" style={{ width: `${100 - leftWidth}%` }}>
              {/* Tab Bar */}
              <div className="flex items-center gap-1 bg-gray-900 border-b border-gray-700 px-3 py-1">
                <button
                  onClick={() => setActiveRightPanel('target')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                    activeRightPanel === 'target'
                      ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  Target
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
                  onClick={() => setActiveRightPanel('disasm')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                    activeRightPanel === 'disasm'
                      ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  Disasm
                </button>
                <button
                  onClick={() => setActiveRightPanel('registers')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                    activeRightPanel === 'registers'
                      ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  Registers
                </button>
                <button
                  onClick={() => setActiveRightPanel('memory')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                    activeRightPanel === 'memory'
                      ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  Memory
                </button>
                <button
                  onClick={() => setActiveRightPanel('memorymap')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                    activeRightPanel === 'memorymap'
                      ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  Map
                </button>
                <button
                  onClick={() => setActiveRightPanel('stack')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                    activeRightPanel === 'stack'
                      ? 'bg-gray-950 text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  Stack
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

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
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
                  />
                )}
                {activeRightPanel === 'disasm' && (
                  <DisassemblyView
                    onReadMemory={handleReadMemory}
                    programCounter={programCounter}
                    isConnected={targetAttached}
                    registers={new Map(registers.map(r => [r.name, r.value]))}
                    gdbClient={gdbClient}
                    onOutput={addGdbOutput}
                  />
                )}
                {activeRightPanel === 'registers' && (
                  <RegistersPanel
                    registers={registers}
                    onRefresh={handleRefreshRegisters}
                    isConnected={targetAttached}
                  />
                )}
                {activeRightPanel === 'memory' && (
                  <MemoryPanel
                    onReadMemory={handleReadMemory}
                    isConnected={targetAttached}
                  />
                )}
                {activeRightPanel === 'memorymap' && (
                  <MemoryMapView
                    gdbClient={gdbClient}
                    onRegionSelect={(region) => {
                      // Switch to memory panel and inspect the selected region
                      setActiveRightPanel('memory');
                      addGdbOutput(`[Selected memory region: ${region.name} at 0x${region.start.toString(16).toUpperCase()}]`);
                    }}
                  />
                )}
                {activeRightPanel === 'stack' && (
                  <StackPanel
                    frames={stackFrames}
                    onRefresh={handleRefreshStack}
                    isConnected={targetAttached}
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
