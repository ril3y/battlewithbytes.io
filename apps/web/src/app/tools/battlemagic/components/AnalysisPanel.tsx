'use client';

/**
 * Analysis Panel Component
 *
 * Professional IDA Pro-inspired binary analysis panel
 * Provides interface for triggering full binary analysis and viewing results
 * Integrates with battlemagic-analyzer WASM module for cross-reference tracking
 */

import React, { useState, useCallback, useEffect } from 'react';
import { GdbClient } from '../lib/gdb/GdbClient';
import { WasmDisassembler } from '../lib/disasm/WasmDisassembler';
import { useXref, type AnalysisStats, type Xref } from '../lib/context/XrefContext';
import { Activity, CheckCircle, Loader2, Cpu, Shield, AlertTriangle, Settings } from 'lucide-react';
import { loadWasmAnalyzer, type WasmAnalyzerModule } from '../lib/loadWasmAnalyzer';
import { MemoryDetector } from '../lib/memory/MemoryDetector';
import type {
  MemoryDetectionResult,
  ManualMemoryConfig,
  Architecture
} from '../lib/memory/types';

export interface AnalysisResults {
  totalInstructions: number;
  functionsDetected: number;
  xrefsBuilt: number;
  analysisTimeMs: number;
}

interface AnalysisState {
  analyzing: boolean;
  progress: number;
  status: string;
  results: AnalysisResults | null;
  error: string | null;
}

interface AnalysisPanelProps {
  gdbClient: GdbClient | null;
  isConnected: boolean;
  onAnalysisComplete?: (results: AnalysisResults) => void;
  onOutput?: (message: string) => void;
}


export default function AnalysisPanel({
  gdbClient,
  isConnected,
  onAnalysisComplete,
  onOutput
}: AnalysisPanelProps) {
  const { setAnalyzer, setAnalysisStats, analysisStats, clearAnalysis } = useXref();
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    analyzing: false,
    progress: 0,
    status: 'Ready',
    results: null,
    error: null
  });
  const [wasmModule, setWasmModule] = useState<WasmAnalyzerModule | null>(null);
  const [wasmLoading, setWasmLoading] = useState(false);

  // Memory detection state
  const [detectionResult, setDetectionResult] = useState<MemoryDetectionResult | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [showManualConfig, setShowManualConfig] = useState(false);
  const [manualConfig, setManualConfig] = useState<ManualMemoryConfig>({
    flashBase: 0x08000000,
    readSize: 0x10000,
    architecture: 'ARM Thumb' as Architecture,
    force: false
  });

  // Load WASM module on mount
  useEffect(() => {
    let mounted = true;

    const loadWasm = async () => {
      if (wasmModule || wasmLoading) return;

      setWasmLoading(true);
      onOutput?.('[Analysis] Loading WASM analyzer module...');

      try {
        // Dynamic import of the WASM module
        const wasmMod = await loadWasmAnalyzer();

        if (mounted) {
          setWasmModule(wasmMod);
          onOutput?.('[Analysis] WASM analyzer loaded successfully');
        }
      } catch (error) {
        if (mounted) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          onOutput?.(`[Analysis Error] Failed to load WASM module: ${errorMsg}`);
          setAnalysisState(prev => ({
            ...prev,
            error: `Failed to load WASM module: ${errorMsg}`
          }));
        }
      } finally {
        if (mounted) {
          setWasmLoading(false);
        }
      }
    };

    loadWasm();

    return () => {
      mounted = false;
    };
  }, [wasmModule, wasmLoading, onOutput]);

  // Auto-detect memory configuration
  const handleAutoDetect = useCallback(async () => {
    if (!gdbClient || !isConnected) {
      onOutput?.('[Detection] Not connected to target');
      return;
    }

    setDetecting(true);
    onOutput?.('[Detection] Starting auto-detection...');

    try {
      const detector = new MemoryDetector(gdbClient);
      const result = await detector.detect();

      setDetectionResult(result);

      if (result.success) {
        onOutput?.(`[Detection] MCU detected: ${result.mcu.name} (${result.mcu.family})`);
        onOutput?.(`[Detection] Flash base: 0x${result.recommendedFlashBase.toString(16).toUpperCase()}`);
        onOutput?.(`[Detection] Architecture: ${result.mcu.architecture}`);
        onOutput?.(`[Detection] Protection: ${result.protection.status}`);

        // Update manual config with detected values
        setManualConfig({
          flashBase: result.recommendedFlashBase,
          readSize: result.recommendedReadSize,
          architecture: result.mcu.architecture,
          force: false
        });
      } else {
        onOutput?.(`[Detection] Auto-detection failed: ${result.error}`);
        onOutput?.('[Detection] Using fallback configuration');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onOutput?.(`[Detection Error] ${errorMsg}`);
      setDetectionResult(null);
    } finally {
      setDetecting(false);
    }
  }, [gdbClient, isConnected, onOutput]);

  // Perform binary analysis using WASM
  const handleAnalyzeBinary = useCallback(async () => {
    if (!gdbClient || !isConnected) {
      setAnalysisState(prev => ({
        ...prev,
        error: 'Not connected to target',
        status: 'Error: Not connected'
      }));
      onOutput?.('[Analysis Error] Not connected to target');
      return;
    }

    if (!wasmModule) {
      setAnalysisState(prev => ({
        ...prev,
        error: 'WASM module not loaded',
        status: 'Error: WASM not ready'
      }));
      onOutput?.('[Analysis Error] WASM analyzer not loaded');
      return;
    }

    // Reset state
    setAnalysisState({
      analyzing: true,
      progress: 0,
      status: 'Initializing...',
      results: null,
      error: null
    });

    onOutput?.('[Analysis] Starting binary analysis...');

    try {
      // If no detection has been run and not forcing manual config, run detection first
      let currentDetectionResult = detectionResult;
      if (!manualConfig.force && !currentDetectionResult) {
        onOutput?.('[Analysis] No configuration detected - running auto-detection first...');
        try {
          const detector = new MemoryDetector(gdbClient);
          const result = await detector.detect();
          setDetectionResult(result);
          currentDetectionResult = result;

          if (result.success) {
            onOutput?.(`[Detection] MCU detected: ${result.mcu.name} (${result.mcu.family})`);
            onOutput?.(`[Detection] Flash base: 0x${result.recommendedFlashBase.toString(16).toUpperCase()}`);
            onOutput?.(`[Detection] Architecture: ${result.mcu.architecture}`);
            onOutput?.(`[Detection] Protection: ${result.protection.status}`);

            // Update manual config with detected values
            setManualConfig({
              flashBase: result.recommendedFlashBase,
              readSize: result.recommendedReadSize,
              architecture: result.mcu.architecture,
              force: false
            });
          }
        } catch (error) {
          onOutput?.('[Analysis] Auto-detection failed, using fallback configuration');
          currentDetectionResult = null;
        }
      }

      // Step 1: Determine memory configuration
      let baseAddr: number;
      let length: number;
      let useThumb: boolean;

      if (manualConfig.force || !currentDetectionResult) {
        // Use manual configuration
        baseAddr = manualConfig.flashBase;
        length = manualConfig.readSize;
        useThumb = manualConfig.architecture === 'ARM Thumb';
        onOutput?.('[Analysis] Using manual configuration');
      } else if (currentDetectionResult && currentDetectionResult.success) {
        // Use detected configuration
        baseAddr = currentDetectionResult.recommendedFlashBase;
        length = currentDetectionResult.recommendedReadSize;
        useThumb = currentDetectionResult.mcu.architecture === 'ARM Thumb';
        onOutput?.('[Analysis] Using auto-detected configuration');
      } else {
        // Fallback to defaults
        baseAddr = 0x08000000;
        length = 0x10000;
        useThumb = true;
        onOutput?.('[Analysis] Using default configuration');
      }

      // Step 2: Read memory from target
      setAnalysisState(prev => ({
        ...prev,
        progress: 10,
        status: 'Reading target memory...'
      }));

      // Halt target before reading memory
      onOutput?.('[Analysis] Halting target...');
      await gdbClient.sendMonitorCommand('halt');

      onOutput?.(`[Analysis] Reading ${length} (0x${length.toString(16)}) bytes from address 0x${baseAddr.toString(16).toUpperCase()}...`);

      const memory = await gdbClient.readMemory(baseAddr, length);

      if (!memory || memory.length === 0) {
        throw new Error('Failed to read memory from target - GDB returned no data');
      }

      onOutput?.(`[Analysis] Successfully read ${memory.length} bytes from 0x${baseAddr.toString(16).toUpperCase()}`);

      // Debug: Show first 16 bytes
      const firstBytes = Array.from(memory.slice(0, 16))
        .map(b => b.toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
      onOutput?.(`[Analysis Debug] First 16 bytes: ${firstBytes}`);

      // Check if memory is all 0xFF (erased flash) or 0x00 (blank)
      const isAllFF = memory.every(b => b === 0xFF);
      const isAllZero = memory.every(b => b === 0x00);
      if (isAllFF) {
        throw new Error('Memory appears to be erased (all 0xFF) - flash may be blank or protected');
      }
      if (isAllZero) {
        throw new Error('Memory appears to be blank (all 0x00) - device may not be programmed');
      }

      // For ARM Cortex-M at address 0x0, parse vector table to find reset vector
      let disasmStartAddr = baseAddr;
      let disasmMemory = memory;

      if (baseAddr === 0x0 && memory.length >= 8) {
        // Parse vector table (little-endian)
        const initialSP = new DataView(memory.buffer, memory.byteOffset, 4).getUint32(0, true);
        const resetVector = new DataView(memory.buffer, memory.byteOffset + 4, 4).getUint32(0, true);

        onOutput?.(`[Analysis] Vector Table: Initial SP=0x${initialSP.toString(16).toUpperCase()}, Reset=0x${resetVector.toString(16).toUpperCase()}`);

        // Clear Thumb bit (LSB) to get actual address
        const resetAddr = resetVector & 0xFFFFFFFE;

        // Check if reset vector is within our read range
        if (resetAddr >= baseAddr && resetAddr < (baseAddr + memory.length - 16)) {
          const offset = resetAddr - baseAddr;
          disasmStartAddr = resetAddr;
          disasmMemory = memory.slice(offset);
          onOutput?.(`[Analysis] Starting disassembly at reset vector: 0x${resetAddr.toString(16).toUpperCase()}`);
        } else {
          // Reset vector is outside our read range - need to read from that address
          onOutput?.(`[Analysis] Reset vector 0x${resetAddr.toString(16).toUpperCase()} is outside initial read range`);
          onOutput?.(`[Analysis] Reading from reset vector at 0x${resetAddr.toString(16).toUpperCase()}...`);

          try {
            // Read smaller chunks for better GDB compatibility
            const resetMemory = await gdbClient.readMemory(resetAddr, 0x400); // Read 1KB from reset vector
            disasmStartAddr = resetAddr;
            disasmMemory = resetMemory;
            onOutput?.(`[Analysis] Successfully read ${resetMemory.length} bytes from reset vector`);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            onOutput?.(`[Analysis] Failed to read from reset vector: ${errorMsg}`);
            onOutput?.(`[Analysis] Falling back to using read memory from 0x0`);

            // ARM Cortex-M vector table is typically 256 bytes (64 vectors)
            // If reset vector read failed, try to disassemble from the reset vector address
            // but use the memory we already read from 0x0
            if (resetAddr < (baseAddr + memory.length)) {
              const offset = resetAddr - baseAddr;
              disasmStartAddr = resetAddr;
              disasmMemory = memory.slice(offset);
              onOutput?.(`[Analysis] Using offset ${offset} bytes from initial read`);
            } else {
              // Last resort: skip standard 256-byte vector table
              onOutput?.(`[Analysis] Reset vector too far, skipping 256-byte vector table`);
              if (memory.length > 256) {
                disasmStartAddr = baseAddr + 256;
                disasmMemory = memory.slice(256);
              } else {
                // Not enough memory read, just skip 8 bytes
                disasmStartAddr = baseAddr + 8;
                disasmMemory = memory.slice(8);
              }
            }
          }
        }
      }

      // Step 3: Disassemble code
      setAnalysisState(prev => ({
        ...prev,
        progress: 30,
        status: 'Disassembling code...'
      }));

      const disassembler = new WasmDisassembler(useThumb);
      await disassembler.initialize();

      // Debug logging
      onOutput?.(`[Analysis] Disassembler config: addr=0x${disasmStartAddr.toString(16)}, length=${disasmMemory.length}, thumb=${useThumb}`);
      const first16 = Array.from(disasmMemory.slice(0, 16))
        .map(b => b.toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
      onOutput?.(`[Analysis] First 16 bytes at disasm start: ${first16}`);

      // Disassemble with a reasonable limit to stop at erased flash
      // The WASM disassembler's error handling should skip invalid bytes
      const instructions = await disassembler.disassemble(disasmMemory, disasmStartAddr, useThumb);
      onOutput?.(`[Analysis] Disassembled ${instructions.length} instructions`);

      // Step 3: Build cross-references using WASM analyzer
      setAnalysisState(prev => ({
        ...prev,
        progress: 60,
        status: 'Building cross-references...'
      }));

      const startTime = performance.now();

      // Create analyzer instance
      const analyzer = new wasmModule.ArmAnalyzer(baseAddr);

      // Convert instructions to format expected by WASM
      const wasmInstructions = instructions.map(inst => ({
        address: inst.address,
        bytes: Array.from(inst.bytes),
        mnemonic: inst.mnemonic,
        operands: inst.operands || ''
      }));

      // Run analysis
      analyzer.analyze_from_disasm(wasmInstructions);

      const xrefCount = analyzer.xref_count();
      const endTime = performance.now();
      const analysisTimeMs = Math.floor(endTime - startTime);

      // Step 4: Calculate statistics
      setAnalysisState(prev => ({
        ...prev,
        progress: 80,
        status: 'Computing statistics...'
      }));

      // Count xrefs by type
      const xrefsByType = {
        Call: 0,
        Branch: 0,
        ConditionalBranch: 0,
        DataRead: 0,
        DataWrite: 0
      };

      const uniqueTargets = new Set<number>();

      // Sample xrefs to count types (iterate through all instructions)
      instructions.forEach(inst => {
        const xrefs = analyzer.get_xrefs_from(inst.address);
        xrefs.forEach((xref) => {
          xrefsByType[(xref as Xref).xref_type]++;
          uniqueTargets.add((xref as Xref).to_addr);
        });
      });

      // Create analysis stats
      const stats: AnalysisStats = {
        totalInstructions: instructions.length,
        xrefCount,
        uniqueTargets: uniqueTargets.size,
        xrefsByType,
        addressRange: {
          start: baseAddr,
          end: baseAddr + memory.length
        },
        analysisTimeMs
      };

      // Store analyzer in context for other components
      setAnalyzer(analyzer);
      setAnalysisStats(stats);

      // Step 5: Complete
      const results: AnalysisResults = {
        totalInstructions: instructions.length,
        functionsDetected: uniqueTargets.size, // Approximate functions as unique targets
        xrefsBuilt: xrefCount,
        analysisTimeMs
      };

      setAnalysisState({
        analyzing: false,
        progress: 100,
        status: 'Analysis complete',
        results,
        error: null
      });

      onOutput?.('[Analysis] Complete!');
      onOutput?.(`[Analysis] Found ${results.totalInstructions} instructions, ${results.functionsDetected} functions, ${results.xrefsBuilt} cross-references`);
      onOutput?.(`[Analysis] Time: ${results.analysisTimeMs}ms`);

      onAnalysisComplete?.(results);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      // Provide helpful error guidance
      let enhancedError = errorMsg;
      if (errorMsg.includes('Failed to read memory')) {
        enhancedError = 'Cannot read flash memory. Possible causes:\n';
        enhancedError += '  - Read protection enabled (RDP/APPROTECT)\n';
        enhancedError += '  - Incorrect flash address\n';
        enhancedError += '  - Target not halted\n\n';
        enhancedError += 'Try: Auto-detect or manually configure flash address';

        // If we have detection result with protection info
        if (detectionResult?.protection) {
          enhancedError += `\n\nProtection Status: ${detectionResult.protection.status}`;
          if (detectionResult.protection.details) {
            enhancedError += `\n${detectionResult.protection.details}`;
          }
        }
      }

      setAnalysisState({
        analyzing: false,
        progress: 0,
        status: 'Analysis failed',
        results: null,
        error: enhancedError
      });
      onOutput?.(`[Analysis Error] ${errorMsg}`);
    }
  }, [gdbClient, isConnected, wasmModule, onAnalysisComplete, onOutput, setAnalyzer, setAnalysisStats, manualConfig, detectionResult]);

  // Clear analysis results
  const handleClearAnalysis = useCallback(() => {
    clearAnalysis();
    setAnalysisState({
      analyzing: false,
      progress: 0,
      status: 'Ready',
      results: null,
      error: null
    });
    onOutput?.('[Analysis] Results cleared');
  }, [onOutput, clearAnalysis]);

  return (
    <div className="h-full flex flex-col bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="text-sm font-bold text-green-400">BINARY ANALYSIS</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyzeBinary}
            disabled={!isConnected || analysisState.analyzing}
            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors font-mono"
          >
            {analysisState.analyzing ? 'Analyzing...' : 'Analyze Binary'}
          </button>
          <button
            onClick={handleClearAnalysis}
            disabled={!analysisState.results}
            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors font-mono"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {!isConnected ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            Connect to target to analyze binary
          </div>
        ) : (
          <div className="space-y-4">
            {/* Memory Detection Controls */}
            <div className="p-3 bg-gray-900 border border-gray-700 rounded">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-400">Target Configuration</span>
                </div>
                <button
                  onClick={handleAutoDetect}
                  disabled={detecting || analysisState.analyzing}
                  className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors font-mono"
                >
                  {detecting ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Detecting...
                    </span>
                  ) : 'Auto-Detect'}
                </button>
              </div>

              {/* Detection Results */}
              {detectionResult && (
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between py-1 border-b border-gray-800">
                    <span className="text-xs text-gray-400">MCU:</span>
                    <span className="text-xs text-cyan-400 font-mono">
                      {detectionResult.mcu.name} ({detectionResult.mcu.family})
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-800">
                    <span className="text-xs text-gray-400">Flash Base:</span>
                    <span className="text-xs text-cyan-400 font-mono">
                      0x{detectionResult.recommendedFlashBase.toString(16).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-800">
                    <span className="text-xs text-gray-400">Architecture:</span>
                    <span className="text-xs text-cyan-400 font-mono">
                      {detectionResult.mcu.architecture}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-400">Protection:</span>
                    <span className={`text-xs font-mono flex items-center gap-1 ${
                      detectionResult.protection.status === 'None' ? 'text-green-400' :
                      detectionResult.protection.status === 'Unknown' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {detectionResult.protection.status === 'None' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : detectionResult.protection.status === 'Unknown' ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      {detectionResult.protection.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Protection Warning */}
              {detectionResult && !detectionResult.protection.canRead && (
                <div className="p-2 bg-red-900/20 border border-red-700 rounded mb-3">
                  <div className="flex items-start gap-2">
                    <Shield className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-red-400 mb-1">Read Protection Enabled</div>
                      <div className="text-xs text-red-300">{detectionResult.protection.details}</div>
                      {detectionResult.protection.unlockInstructions && (
                        <details className="mt-2">
                          <summary className="text-xs text-yellow-400 cursor-pointer">How to unlock</summary>
                          <div className="mt-1 text-xs text-gray-300 whitespace-pre-line">
                            {detectionResult.protection.unlockInstructions.join('\n')}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Configuration Toggle */}
              <button
                onClick={() => setShowManualConfig(!showManualConfig)}
                className="w-full px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded transition-colors font-mono flex items-center justify-between"
              >
                <span className="flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Manual Configuration
                </span>
                <span>{showManualConfig ? '▼' : '▶'}</span>
              </button>

              {/* Manual Configuration Panel */}
              {showManualConfig && (
                <div className="mt-2 p-2 bg-gray-800 rounded space-y-2">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Flash Base Address:</label>
                    <input
                      type="text"
                      value={`0x${manualConfig.flashBase.toString(16).toUpperCase()}`}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0x/i, '');
                        const num = parseInt(val, 16);
                        if (!isNaN(num)) {
                          setManualConfig({ ...manualConfig, flashBase: num });
                        }
                      }}
                      className="w-full px-2 py-1 text-xs bg-gray-900 border border-gray-700 rounded font-mono text-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Read Size:</label>
                    <select
                      value={manualConfig.readSize}
                      onChange={(e) => setManualConfig({ ...manualConfig, readSize: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 text-xs bg-gray-900 border border-gray-700 rounded font-mono text-cyan-400"
                    >
                      <option value={0x4000}>16 KB</option>
                      <option value={0x8000}>32 KB</option>
                      <option value={0x10000}>64 KB</option>
                      <option value={0x20000}>128 KB</option>
                      <option value={0x40000}>256 KB</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Architecture:</label>
                    <select
                      value={manualConfig.architecture}
                      onChange={(e) => setManualConfig({ ...manualConfig, architecture: e.target.value as Architecture })}
                      className="w-full px-2 py-1 text-xs bg-gray-900 border border-gray-700 rounded font-mono text-cyan-400"
                    >
                      <option value="ARM Thumb">ARM Thumb</option>
                      <option value="ARM">ARM</option>
                      <option value="RISC-V">RISC-V</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="force-manual"
                      checked={manualConfig.force}
                      onChange={(e) => setManualConfig({ ...manualConfig, force: e.target.checked })}
                      className="w-3 h-3"
                    />
                    <label htmlFor="force-manual" className="text-xs text-gray-400">
                      Force manual config (ignore auto-detect)
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="p-3 bg-gray-900 border border-gray-700 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Status:</span>
                <span className={`text-xs font-mono ${
                  analysisState.error ? 'text-red-400' :
                  analysisState.analyzing ? 'text-yellow-400' :
                  analysisState.results ? 'text-green-400' :
                  'text-gray-400'
                }`}>
                  {analysisState.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-4 bg-gray-800 rounded overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${analysisState.progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-mono text-white font-bold drop-shadow-md">
                    {analysisState.progress}%
                  </span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {analysisState.error && (
              <div className="p-3 bg-red-900/20 border border-red-700 rounded">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-red-400 mb-1">Analysis Error</div>
                    <div className="text-xs text-red-300 font-mono">{analysisState.error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {analysisState.results && analysisStats && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-900 border border-gray-700 rounded">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <div className="text-xs font-bold text-green-400">Analysis Results</div>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-gray-800">
                      <span className="text-gray-400">Instructions:</span>
                      <span className="text-green-400 font-bold">
                        {analysisState.results.totalInstructions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-800">
                      <span className="text-gray-400">Cross-refs:</span>
                      <span className="text-green-400 font-bold">
                        {analysisState.results.xrefsBuilt.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-800">
                      <span className="text-gray-400">Unique Targets:</span>
                      <span className="text-green-400 font-bold">
                        {analysisStats.uniqueTargets.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-400">Time:</span>
                      <span className="text-green-400 font-bold">
                        {analysisState.results.analysisTimeMs}ms
                      </span>
                    </div>
                  </div>
                </div>

                {/* Xref Breakdown by Type */}
                <div className="p-3 bg-gray-900 border border-gray-700 rounded">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <div className="text-xs font-bold text-blue-400">Cross-Reference Breakdown</div>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-gray-800">
                      <span className="text-gray-400">Calls (bl/blx):</span>
                      <span className="text-blue-400 font-bold">
                        {analysisStats.xrefsByType.Call.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-800">
                      <span className="text-gray-400">Branches (b):</span>
                      <span className="text-blue-400 font-bold">
                        {analysisStats.xrefsByType.Branch.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-800">
                      <span className="text-gray-400">Conditional (b.eq/ne):</span>
                      <span className="text-blue-400 font-bold">
                        {analysisStats.xrefsByType.ConditionalBranch.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-800">
                      <span className="text-gray-400">Data Reads (ldr):</span>
                      <span className="text-blue-400 font-bold">
                        {analysisStats.xrefsByType.DataRead.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-400">Data Writes (str):</span>
                      <span className="text-blue-400 font-bold">
                        {analysisStats.xrefsByType.DataWrite.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address Range */}
                <div className="p-3 bg-gray-900 border border-gray-700 rounded">
                  <div className="text-xs font-bold text-yellow-400 mb-2">Address Range</div>
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Start:</span>
                      <span className="text-yellow-400">
                        0x{analysisStats.addressRange.start.toString(16).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">End:</span>
                      <span className="text-yellow-400">
                        0x{analysisStats.addressRange.end.toString(16).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Export Database (Future Feature) */}
            <div className="p-3 bg-gray-900 border border-gray-700 rounded opacity-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-400 mb-1">Export Database</div>
                  <div className="text-xs text-gray-500">
                    Save analysis results to database file
                  </div>
                </div>
                <button
                  disabled
                  className="px-3 py-1 text-xs bg-gray-600 rounded cursor-not-allowed font-mono"
                >
                  Export
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-3 bg-blue-900/20 border border-blue-700 rounded">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <div className="text-xs font-bold text-blue-400 mb-1">Analysis Information</div>
                  <div className="text-xs text-blue-300 space-y-1">
                    <p>• Auto-detects MCU type and memory layout</p>
                    <p>• Supports STM32, nRF52, ESP32, RP2040</p>
                    <p>• Detects read protection (RDP/APPROTECT)</p>
                    <p>• Disassembles ARM Thumb/ARM/RISC-V code</p>
                    <p>• Builds cross-reference database with Rust/WASM</p>
                    <p className="text-green-400 mt-2">
                      {wasmModule ? '✓ WASM analyzer loaded' : wasmLoading ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Loading analyzer...
                        </span>
                      ) : '⚠ WASM analyzer not loaded'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-2 border-t border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>
            {analysisState.results
              ? 'Analysis complete - Results available'
              : analysisState.analyzing
              ? 'Analysis in progress...'
              : 'Ready to analyze'
            }
          </span>
          <span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
}
