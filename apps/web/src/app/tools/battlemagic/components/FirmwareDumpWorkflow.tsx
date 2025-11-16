/**
 * Firmware Dump & Analysis Workflow
 *
 * Integrates two independent subsystems:
 * 1. GDB UART Firmware Dumper - Uses GdbClient to dump firmware via serial
 * 2. WASM Binary Analyzer - Analyzes dumped firmware for xrefs, functions, CFG
 *
 * Workflow:
 * 1. Connect to Black Magic Probe via Web Serial
 * 2. Scan for targets (nRF52, STM32, etc.)
 * 3. Attach and halt target
 * 4. Dump firmware from flash memory
 * 5. Parse ARM Cortex-M vector table
 * 6. Disassemble binary
 * 7. Analyze with WASM (cross-references, control flow)
 * 8. Display results in UI
 */

'use client';

import React, { useState, useCallback } from 'react';
import { GdbClient } from '../lib/gdb/GdbClient';
import { ConnectionState } from '../lib/gdb/types';
import { createAnalyzer, type AnalysisResults as WasmAnalysisResults, type XrefResult } from '../lib/wasmAnalyzer';

interface DumpProgress {
  stage: 'idle' | 'connecting' | 'scanning' | 'attaching' | 'dumping' | 'parsing' | 'analyzing' | 'complete' | 'error';
  message: string;
  progress?: number; // 0-100
  bytesRead?: number;
  totalBytes?: number;
}

interface VectorTable {
  initialSP: number;
  resetVector: number;
  resetAddress: number;
}

interface FirmwareDump {
  data: Uint8Array;
  baseAddress: number;
  size: number;
  vectorTable: VectorTable;
  architecture: 'ARM Thumb' | 'ARM' | 'Unknown';
  chipInfo?: {
    name: string;
    voltage: number | null;
  };
}

export function FirmwareDumpWorkflow() {
  const [gdbClient] = useState(() => new GdbClient({ debug: true }));
  const [progress, setProgress] = useState<DumpProgress>({ stage: 'idle', message: 'Ready to start' });
  const [dump, setDump] = useState<FirmwareDump | null>(null);
  const [analysisResults, setAnalysisResults] = useState<WasmAnalysisResults | null>(null);

  /**
   * Parse ARM Cortex-M vector table from dumped firmware
   */
  const parseVectorTable = useCallback((data: Uint8Array): VectorTable => {
    if (data.length < 8) {
      throw new Error('Firmware too small to parse vector table');
    }

    // ARM Cortex-M vector table (little-endian):
    // 0x00-0x03: Initial stack pointer
    // 0x04-0x07: Reset vector (with Thumb bit in LSB)
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const initialSP = view.getUint32(0, true); // Little-endian
    const resetVector = view.getUint32(4, true);
    const resetAddress = resetVector & 0xFFFFFFFE; // Clear Thumb bit

    return { initialSP, resetVector, resetAddress };
  }, []);

  /**
   * Validate ARM Cortex-M vector table
   */
  const isValidVectorTable = useCallback((vt: VectorTable): boolean => {
    // Initial SP should point to valid RAM (typically 0x20000000-0x20040000 for Cortex-M)
    const spValid = vt.initialSP >= 0x20000000 && vt.initialSP <= 0x30000000;

    // Reset vector should point to flash (0x00000000-0x10000000) and have Thumb bit set
    const resetValid = (vt.resetVector & 0x1) === 0x1 && vt.resetAddress < 0x10000000;

    return spValid && resetValid;
  }, []);

  /**
   * Main workflow: Dump firmware from target
   */
  const handleDumpFirmware = useCallback(async () => {
    try {
      // Stage 1: Connect to Black Magic Probe (if not already connected)
      if (gdbClient.getState() !== ConnectionState.CONNECTED) {
        setProgress({ stage: 'connecting', message: 'Connecting to Black Magic Probe...' });

        const port = await gdbClient.requestPort();
        if (!port) {
          throw new Error('No serial port selected');
        }

        await gdbClient.connect(port, { baudRate: 115200 });
      } else {
        setProgress({ stage: 'connecting', message: 'Using existing connection...' });
      }

      // Stage 2: Scan for targets
      setProgress({ stage: 'scanning', message: 'Scanning for targets...' });
      const { targets, voltage } = await gdbClient.scanSwd();

      if (targets.length === 0) {
        throw new Error('No targets found. Check SWD connection.');
      }

      console.log('Found targets:', targets);
      const target = targets[0]; // Use first target

      // Stage 3: Attach to target
      setProgress({ stage: 'attaching', message: `Attaching to ${target.description}...` });
      await gdbClient.attach(target.id);

      // Halt target so we can read memory
      await gdbClient.halt();

      // Wait for target to stop
      await new Promise(resolve => setTimeout(resolve, 200));

      // Stage 4: Dump firmware from flash
      setProgress({
        stage: 'dumping',
        message: 'Dumping firmware from flash memory...',
        progress: 0,
        bytesRead: 0,
        totalBytes: 0x10000 // 64KB default
      });

      const FLASH_BASE = 0x0;
      const DUMP_SIZE = 0x10000; // 64KB - adjust based on target
      const CHUNK_SIZE = 256; // Read in 256-byte chunks (reliable with BMP)

      const chunks: Uint8Array[] = [];
      for (let offset = 0; offset < DUMP_SIZE; offset += CHUNK_SIZE) {
        const chunk = await gdbClient.readMemory(FLASH_BASE + offset, CHUNK_SIZE);
        chunks.push(chunk);

        const progressPercent = Math.round((offset / DUMP_SIZE) * 100);
        setProgress({
          stage: 'dumping',
          message: `Dumping firmware... 0x${(FLASH_BASE + offset).toString(16).toUpperCase()}`,
          progress: progressPercent,
          bytesRead: offset + chunk.length,
          totalBytes: DUMP_SIZE
        });
      }

      // Concatenate all chunks
      const firmwareData = new Uint8Array(DUMP_SIZE);
      let position = 0;
      for (const chunk of chunks) {
        firmwareData.set(chunk, position);
        position += chunk.length;
      }

      // Stage 5: Parse vector table
      setProgress({ stage: 'parsing', message: 'Parsing ARM Cortex-M vector table...' });
      const vectorTable = parseVectorTable(firmwareData);

      if (!isValidVectorTable(vectorTable)) {
        console.warn('Vector table validation failed:', vectorTable);
        console.warn('Firmware may be erased, read-protected, or not ARM Cortex-M');
      }

      const firmwareDump: FirmwareDump = {
        data: firmwareData,
        baseAddress: FLASH_BASE,
        size: DUMP_SIZE,
        vectorTable,
        architecture: 'ARM Thumb',
        chipInfo: {
          name: target.description,
          voltage
        }
      };

      setDump(firmwareDump);
      setProgress({
        stage: 'complete',
        message: `Successfully dumped ${DUMP_SIZE} bytes from ${target.description}`,
        progress: 100
      });

      console.log('Firmware dump complete:', {
        size: firmwareDump.size,
        vectorTable: {
          initialSP: `0x${vectorTable.initialSP.toString(16).toUpperCase()}`,
          resetVector: `0x${vectorTable.resetVector.toString(16).toUpperCase()}`,
          resetAddress: `0x${vectorTable.resetAddress.toString(16).toUpperCase()}`
        }
      });

    } catch (error) {
      console.error('Firmware dump error:', error);
      setProgress({
        stage: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }, [gdbClient, parseVectorTable, isValidVectorTable]);

  /**
   * Analyze dumped firmware with WASM analyzer
   *
   * Uses the battlemagic-analyzer WASM module to perform:
   * 1. ARM Thumb-2 instruction decoding
   * 2. Cross-reference analysis (calls, branches, data refs)
   * 3. Function detection
   */
  const handleAnalyzeFirmware = useCallback(async () => {
    if (!dump) {
      console.warn('No firmware dump to analyze');
      return;
    }

    try {
      setProgress({ stage: 'analyzing', message: 'Loading WASM analyzer...' });

      console.log('[FirmwareDump] Creating analyzer with base address:', `0x${dump.baseAddress.toString(16)}`);
      console.log('[FirmwareDump] Firmware size:', dump.data.length, 'bytes');

      // Create analyzer instance with base address
      const analyzer = await createAnalyzer(dump.baseAddress);

      console.log('[FirmwareDump] Analyzer created successfully');

      setProgress({ stage: 'analyzing', message: 'Analyzing firmware binary...' });

      // Analyze firmware directly from bytes (no Capstone needed!)
      // The WASM module includes a complete ARM Thumb-2 decoder
      console.log('[FirmwareDump] Calling analyze_from_bytes...');
      const results = analyzer.analyze_from_bytes(dump.data);

      console.log('[FirmwareDump] WASM analysis complete:', {
        totalXrefs: results.total_xrefs,
        xrefCount: results.xrefs?.length || 0,
        analyzed: results.analyzed
      });

      setAnalysisResults(results);

      setProgress({
        stage: 'complete',
        message: `Analysis complete: Found ${results.total_xrefs} cross-references`,
        progress: 100
      });

      // Clean up analyzer
      console.log('[FirmwareDump] Cleaning up analyzer...');
      analyzer.free();

    } catch (error) {
      console.error('[FirmwareDump] Analysis error:', error);
      // Log stack trace if available
      if (error instanceof Error && error.stack) {
        console.error('[FirmwareDump] Stack trace:', error.stack);
      }
      setProgress({
        stage: 'error',
        message: `Analysis error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }, [dump]);

  /**
   * Download dumped firmware as .bin file
   */
  const handleDownloadDump = useCallback(() => {
    if (!dump) return;

    const blob = new Blob([dump.data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firmware_${dump.chipInfo?.name.replace(/\s+/g, '_')}_${Date.now()}.bin`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [dump]);

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
                disabled={progress.stage === 'analyzing'}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
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

              <div className="flex justify-between">
                <span className="text-gray-400">Size:</span>
                <span>{dump.size.toLocaleString()} bytes</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Base Address:</span>
                <span>0x{dump.baseAddress.toString(16).toUpperCase().padStart(8, '0')}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Architecture:</span>
                <span>{dump.architecture}</span>
              </div>

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
                  <span className="font-mono text-green-400">{analysisResults.total_xrefs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Analysis Status:</span>
                  <span className={analysisResults.analyzed ? 'text-green-400' : 'text-yellow-400'}>
                    {analysisResults.analyzed ? 'Complete' : 'Incomplete'}
                  </span>
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
                              0x{xref.from.toString(16).toUpperCase().padStart(8, '0')}
                            </td>
                            <td className="py-1 px-2 text-green-400">
                              0x{xref.to.toString(16).toUpperCase().padStart(8, '0')}
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
