/**
 * Firmware Dump & Analysis Workflow
 *
 * Simplified UI component for firmware extraction and analysis.
 * All business logic moved to FirmwareExtractor service.
 *
 * Workflow:
 * 1. Connect to Black Magic Probe via Web Serial
 * 2. Scan for targets and detect architecture
 * 3. Dump firmware using CPU-agnostic service
 * 4. Parse vector table and validate
 * 5. Analyze with WASM decoder
 * 6. Display results in UI
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { GdbClient } from '../lib/gdb/GdbClient';
import { ConnectionState } from '../lib/gdb/types';
import {
  createAnalyzer,
  detectArchitecture,
  type AnalysisResults as WasmAnalysisResults,
  type XrefResult,
  type ArchitectureInfo
} from '../lib/wasmAnalyzer';
import { useAnalysis } from '../lib/context/AnalysisContext';
import {
  dumpFirmware,
  downloadFirmware,
  type FirmwareDump,
} from '../lib/firmware/FirmwareExtractor';

interface DumpProgress {
  stage: 'idle' | 'connecting' | 'scanning' | 'attaching' | 'dumping' | 'parsing' | 'analyzing' | 'complete' | 'error';
  message: string;
  progress?: number; // 0-100
  bytesRead?: number;
  totalBytes?: number;
}

interface FirmwareDumpWorkflowProps {
  gdbClient?: GdbClient;
  autoStart?: boolean;
  onOutput?: (message: string) => void;
  detectedArchInfo?: ArchitectureInfo;
  onAnalysisComplete?: () => void;
}

export function FirmwareDumpWorkflow({
  gdbClient: externalGdbClient,
  autoStart = false,
  onOutput,
  detectedArchInfo: externalArchInfo,
  onAnalysisComplete
}: FirmwareDumpWorkflowProps = {}) {
  // Use provided gdbClient or create a new one
  const [internalGdbClient] = useState(() => new GdbClient({ debug: true }));
  const gdbClient = externalGdbClient || internalGdbClient;

  // Get analysis context
  const analysisContext = useAnalysis();

  const [progress, setProgress] = useState<DumpProgress>({ stage: 'idle', message: 'Ready to start' });
  const [dump, setDump] = useState<FirmwareDump | null>(null);
  const [analysisResults, setAnalysisResults] = useState<WasmAnalysisResults | null>(null);
  const [archInfo, setArchInfo] = useState<ArchitectureInfo | null>(null);
  const [lastTarget, setLastTarget] = useState<{ description: string; voltage: number | null } | null>(null);
  const [autoStartTriggered, setAutoStartTriggered] = useState(false);
  const [shouldAutoAnalyze, setShouldAutoAnalyze] = useState(false);

  /**
   * Main workflow: Dump firmware from target
   */
  const handleDumpFirmware = useCallback(async () => {
    try {
      const currentState = gdbClient.getState();

      console.log('[FirmwareDump] Starting dump, current state:', currentState);
      onOutput?.('[Firmware Dump] Starting firmware dump...');

      // Stage 1: Connect to Black Magic Probe (if needed)
      if (currentState === ConnectionState.DISCONNECTED || currentState === ConnectionState.ERROR) {
        console.log('[FirmwareDump] Requesting port...');
        onOutput?.('[Firmware Dump] Connecting to Black Magic Probe...');
        setProgress({ stage: 'connecting', message: 'Connecting to Black Magic Probe...' });

        const port = await gdbClient.requestPort();
        if (!port) {
          throw new Error('No serial port selected');
        }

        await gdbClient.connect(port, { baudRate: 115200 });
      } else {
        setProgress({ stage: 'connecting', message: 'Using existing connection...' });
      }

      // Stage 2: Scan for targets (if needed)
      let target;
      let voltage = null;

      if (currentState !== ConnectionState.ATTACHED) {
        setProgress({ stage: 'scanning', message: 'Scanning for targets...' });
        const scanResult = await gdbClient.scanSwd();

        if (scanResult.targets.length === 0) {
          throw new Error('No targets found. Check SWD connection.');
        }

        console.log('Found targets:', scanResult.targets);
        target = scanResult.targets[0];
        voltage = scanResult.voltage;
        setLastTarget({ description: target.description, voltage });
      } else {
        setProgress({ stage: 'scanning', message: 'Using already-attached target...' });
        // Use detected arch info if available, otherwise use stored target
        if (externalArchInfo) {
          target = { id: 1, description: externalArchInfo.chip_name, type: 'unknown' };
          voltage = lastTarget?.voltage || null;
        } else if (lastTarget) {
          target = { id: 1, description: lastTarget.description, type: 'unknown' };
          voltage = lastTarget.voltage;
        } else if (archInfo) {
          // Use previously detected architecture
          target = { id: 1, description: archInfo.chip_name, type: 'unknown' };
          voltage = null;
        } else {
          target = { id: 1, description: 'Unknown (already attached)', type: 'unknown' };
        }
      }

      // Detect or use pre-detected architecture
      let detectedArch: ArchitectureInfo;
      if (externalArchInfo) {
        detectedArch = externalArchInfo;
        setArchInfo(detectedArch);
        onOutput?.(`[Firmware Dump] Using pre-detected: ${detectedArch.chip_name} (${detectedArch.architecture})`);
      } else if (archInfo) {
        // Reuse previously detected architecture
        detectedArch = archInfo;
        onOutput?.(`[Firmware Dump] Using cached: ${detectedArch.chip_name} (${detectedArch.architecture})`);
      } else {
        setProgress({ stage: 'scanning', message: 'Detecting target architecture...' });
        detectedArch = await detectArchitecture(target.description);
        setArchInfo(detectedArch);

        onOutput?.(`[Firmware Dump] Detected: ${detectedArch.chip_name} (${detectedArch.architecture})`);
        onOutput?.(`[Firmware Dump] Manufacturer: ${detectedArch.manufacturer}`);
        onOutput?.(`[Firmware Dump] Analysis Support: ${detectedArch.supported ? '✅ Supported' : '❌ Not Supported'}`);
        onOutput?.(`[Firmware Dump] Confidence: ${(detectedArch.confidence * 100).toFixed(1)}%`);
      }

      // Check architecture support
      if (!detectedArch.supported) {
        console.warn(`Architecture ${detectedArch.architecture} not yet supported for analysis`);
        onOutput?.(`[Firmware Dump] ⚠️ Architecture ${detectedArch.architecture} not yet supported`);
      }

      // Stage 3: Attach to target (if needed)
      if (currentState !== ConnectionState.ATTACHED) {
        setProgress({ stage: 'attaching', message: `Attaching to ${target.description}...` });
        await gdbClient.attach(target.id);
      }

      // Halt target
      try {
        setProgress({ stage: 'attaching', message: 'Halting target for memory read...' });
        await gdbClient.halt();
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch {
        console.log('[FirmwareDump] Halt command completed');
      }

      // Stage 4: Dump firmware using service
      setProgress({
        stage: 'dumping',
        message: 'Dumping firmware from flash memory...',
        progress: 0,
      });

      const firmwareDump = await dumpFirmware(
        gdbClient,
        detectedArch,
        (progressPercent, bytesRead, totalBytes) => {
          setProgress({
            stage: 'dumping',
            message: `Dumping firmware... 0x${(detectedArch as ArchitectureInfo).chip_name}`,
            progress: progressPercent,
            bytesRead,
            totalBytes,
          });
        }
      );

      if (!firmwareDump) {
        throw new Error('Firmware dump failed');
      }

      // Add chip info
      firmwareDump.chipInfo = {
        name: target.description,
        voltage,
      };

      setDump(firmwareDump);
      setProgress({
        stage: 'complete',
        message: `Successfully dumped ${firmwareDump.size} bytes from ${target.description}`,
        progress: 100,
      });

      console.log('Firmware dump complete:', {
        size: firmwareDump.size,
        baseAddress: `0x${firmwareDump.baseAddress.toString(16).toUpperCase()}`,
        vectorTable: firmwareDump.vectorTable,
      });

      onOutput?.(`[Firmware Dump] ✅ Dump complete: ${firmwareDump.size} bytes`);
      if (firmwareDump.vectorTable) {
        onOutput?.(`[Firmware Dump] Reset Vector: 0x${firmwareDump.vectorTable.resetAddress.toString(16).toUpperCase()}`);
      }

      // Auto-trigger analysis if architecture is supported
      if (autoStart && detectedArch?.supported) {
        onOutput?.(`[Firmware Analysis] Starting WASM analysis...`);
        setShouldAutoAnalyze(true);
      }

    } catch (error) {
      console.error('Firmware dump error:', error);
      onOutput?.(`[Firmware Dump] ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProgress({
        stage: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }, [gdbClient, onOutput, autoStart, externalArchInfo, lastTarget, archInfo]);

  /**
   * Analyze dumped firmware with WASM analyzer
   */
  const handleAnalyzeFirmware = useCallback(async () => {
    if (!dump) {
      console.warn('No firmware dump to analyze');
      return;
    }

    // Check architecture support
    if (archInfo && !archInfo.supported) {
      setProgress({
        stage: 'error',
        message: `❌ ${archInfo.architecture} architecture not yet supported for analysis`,
      });
      console.error(`Cannot analyze ${archInfo.chip_name}: ${archInfo.architecture} decoder not implemented`);
      return;
    }

    try {
      setProgress({ stage: 'analyzing', message: 'Loading WASM analyzer...' });
      onOutput?.(`[Firmware Analysis] Loading WASM analyzer module...`);

      console.log('[FirmwareDump] Creating analyzer with base address:', `0x${dump.baseAddress.toString(16)}`);
      console.log('[FirmwareDump] Firmware size:', dump.data.length, 'bytes');

      // Create analyzer instance
      const analyzer = await createAnalyzer(dump.baseAddress);
      console.log('[FirmwareDump] Analyzer created successfully');
      onOutput?.(`[Firmware Analysis] WASM module loaded successfully`);

      setProgress({ stage: 'analyzing', message: 'Analyzing firmware binary...' });
      onOutput?.(`[Firmware Analysis] Decoding ${dump.data.length} bytes of ${archInfo?.architecture} code...`);

      // Analyze firmware
      const startTime = performance.now();
      const results = analyzer.analyze_from_bytes(dump.data);
      const endTime = performance.now();
      const actualTimeMs = Math.round(endTime - startTime);
      const displayTimeMs = results.analysis_time_ms > 0 ? results.analysis_time_ms : actualTimeMs;

      console.log('[FirmwareDump] WASM analysis complete:', {
        totalInstructions: results.total_instructions,
        xrefCount: results.xrefs?.length || 0,
        uniqueTargets: results.unique_targets,
        timeMs: displayTimeMs,
      });

      // Output results
      onOutput?.(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      onOutput?.(`🎉 FIRMWARE ANALYSIS COMPLETE!`);
      onOutput?.(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      onOutput?.(`   ✓ Decoded ${results.total_instructions.toLocaleString()} instructions`);
      onOutput?.(`   ✓ Found ${results.xrefs.length.toLocaleString()} cross-references`);
      onOutput?.(`   ✓ Detected ${results.unique_targets.toLocaleString()} unique targets`);
      onOutput?.(`   ✓ Analysis time: ${displayTimeMs}ms`);
      onOutput?.(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      setAnalysisResults(results);

      // Populate analysis context
      analysisContext.setAnalysisResults(results, dump.baseAddress, dump.size);

      setProgress({
        stage: 'complete',
        message: `Analysis complete: Found ${results.xrefs.length} cross-references`,
        progress: 100,
      });

      // Notify parent
      onAnalysisComplete?.();

      // Clean up analyzer
      analyzer.free();

    } catch (error) {
      console.error('[FirmwareDump] Analysis error:', error);
      onOutput?.(`[Firmware Analysis] ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error && error.stack) {
        console.error('[FirmwareDump] Stack trace:', error.stack);
      }
      setProgress({
        stage: 'error',
        message: `Analysis error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }, [dump, archInfo, onOutput, analysisContext, onAnalysisComplete]);

  /**
   * Download dumped firmware as .bin file
   */
  const handleDownloadDump = useCallback(() => {
    if (!dump) return;
    downloadFirmware(dump);
  }, [dump]);

  // Auto-start dump & analysis when autoStart prop is true
  useEffect(() => {
    if (autoStart && !autoStartTriggered && progress.stage === 'idle') {
      console.log('[FirmwareDumpWorkflow] Auto-starting dump & analysis...');
      setAutoStartTriggered(true);
      handleDumpFirmware();
    }
  }, [autoStart, autoStartTriggered, progress.stage, handleDumpFirmware]);

  // Auto-trigger analysis after dump completes
  useEffect(() => {
    if (shouldAutoAnalyze && dump && !analysisResults) {
      console.log('[FirmwareDumpWorkflow] Auto-triggering analysis...');
      setShouldAutoAnalyze(false);
      handleAnalyzeFirmware();
    }
  }, [shouldAutoAnalyze, dump, analysisResults, handleAnalyzeFirmware]);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Firmware Dump & Analysis</h2>
        <div className="text-sm text-gray-400">
          {gdbClient.getState() === ConnectionState.CONNECTED && (
            <span className="text-green-500">● Connected</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Progress Section */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold mb-3">Workflow Progress</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={progress.stage === 'error' ? 'text-red-400' : 'text-gray-300'}>
                {progress.message}
              </span>
              {progress.stage !== 'idle' && progress.stage !== 'error' && (
                <span className="text-xs text-gray-500">
                  {progress.stage}
                </span>
              )}
            </div>

            {progress.progress !== undefined && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            )}

            {progress.bytesRead !== undefined && progress.totalBytes !== undefined && (
              <div className="text-xs text-gray-500">
                {progress.bytesRead.toLocaleString()} / {progress.totalBytes.toLocaleString()} bytes
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDumpFirmware}
            disabled={progress.stage === 'dumping' || progress.stage === 'analyzing'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
          >
            Dump Firmware
          </button>

          {dump && (
            <>
              <button
                onClick={handleAnalyzeFirmware}
                disabled={progress.stage === 'analyzing' || (archInfo !== null && !archInfo.supported)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
                title={archInfo && !archInfo.supported ? `${archInfo.architecture} not supported` : 'Analyze firmware with WASM decoder'}
              >
                Analyze with WASM
              </button>

              <button
                onClick={handleDownloadDump}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium transition-colors"
              >
                Download .bin
              </button>
            </>
          )}
        </div>

        {/* Dump Info */}
        {dump && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold mb-3">Firmware Information</h3>

            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">Target:</span>
                <span className="text-blue-400">{dump.chipInfo?.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Voltage:</span>
                <span className="text-green-400">
                  {dump.chipInfo?.voltage ? `${dump.chipInfo.voltage.toFixed(2)}V` : 'N/A'}
                </span>
              </div>

              {archInfo && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Architecture:</span>
                    <span className={archInfo.supported ? "text-green-400" : "text-yellow-400"}>
                      {archInfo.architecture}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Manufacturer:</span>
                    <span className="text-blue-400">{archInfo.manufacturer}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Analysis Support:</span>
                    <span className={archInfo.supported ? "text-green-400" : "text-red-400"}>
                      {archInfo.supported ? '✅ Supported' : '❌ Not Supported'}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between">
                <span className="text-gray-400">Size:</span>
                <span>{dump.size.toLocaleString()} bytes ({(dump.size / 1024).toFixed(1)} KB)</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Base Address:</span>
                <span>0x{dump.baseAddress.toString(16).toUpperCase().padStart(8, '0')}</span>
              </div>

              {dump.vectorTable && (
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="text-gray-400 mb-1">Vector Table:</div>

                  <div className="flex justify-between ml-4">
                    <span className="text-gray-400">Initial SP:</span>
                    <span>0x{dump.vectorTable.initialSP.toString(16).toUpperCase().padStart(8, '0')}</span>
                  </div>

                  <div className="flex justify-between ml-4">
                    <span className="text-gray-400">Reset Vector:</span>
                    <span>0x{dump.vectorTable.resetVector.toString(16).toUpperCase().padStart(8, '0')}</span>
                  </div>

                  <div className="flex justify-between ml-4">
                    <span className="text-gray-400">Reset Address:</span>
                    <span className="text-yellow-400">
                      0x{dump.vectorTable.resetAddress.toString(16).toUpperCase().padStart(8, '0')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResults && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold mb-3">Analysis Results</h3>

            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Cross-References:</span>
                  <span className="font-mono text-green-400">{analysisResults.xrefs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Instructions:</span>
                  <span className="font-mono text-green-400">{analysisResults.total_instructions}</span>
                </div>
              </div>

              {/* Cross-References Table */}
              {analysisResults.xrefs && analysisResults.xrefs.length > 0 && (
                <div className="border-t border-gray-700 pt-3">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">Cross-References (showing first 20)</h4>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-xs font-mono">
                      <thead className="sticky top-0 bg-gray-800">
                        <tr className="text-gray-400 border-b border-gray-700">
                          <th className="text-left py-1 px-2">From</th>
                          <th className="text-left py-1 px-2">To</th>
                          <th className="text-left py-1 px-2">Type</th>
                          <th className="text-left py-1 px-2">Instruction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResults.xrefs.slice(0, 20).map((xref: XrefResult, idx: number) => (
                          <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                            <td className="py-1 px-2 text-blue-400">
                              0x{xref.from_addr.toString(16).toUpperCase().padStart(8, '0')}
                            </td>
                            <td className="py-1 px-2 text-green-400">
                              0x{xref.to_addr.toString(16).toUpperCase().padStart(8, '0')}
                            </td>
                            <td className="py-1 px-2 text-yellow-400">
                              {['Call', 'Branch', 'CondBranch', 'DataRead', 'DataWrite'][xref.xref_type] || 'Unknown'}
                            </td>
                            <td className="py-1 px-2 text-gray-300 truncate max-w-xs">
                              {xref.instruction || ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {analysisResults.xrefs.length > 20 && (
                      <div className="text-center text-xs text-gray-500 py-2">
                        ... and {analysisResults.xrefs.length - 20} more cross-references
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
