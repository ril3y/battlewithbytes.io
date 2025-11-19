/**
 * Firmware Dump & Analysis Workflow
 *
 * Simplified UI component for firmware extraction and analysis.
 * All business logic moved to FirmwareExtractor service.
 *
 * Workflow:
 * 1. Connect to Black Magic Probe via Web Serial
 * 2. Scan for targets and detect architecture
 * 3. Attach to target
 * 4. [OPTIONAL] Reset target and halt at entry point (recommended)
 *    - Ensures CPU is at actual reset vector, not random execution point
 *    - Reads vector table (Initial SP + Reset Handler) to detect correct base address
 *    - Handles STM32 boot aliasing (0x00000000 vs 0x08000000) automatically
 *    - Validates vector table contents for sanity
 * 5. Dump firmware from detected base address using CPU-agnostic service
 * 6. Parse vector table and validate
 * 7. Analyze with WASM decoder
 * 8. Display results in UI
 *
 * GDB Protocol Details:
 * - `monitor reset halt` - Reset CPU and halt at reset vector
 * - Read from 0x08000000 (physical) or 0x00000000 (aliased) for vector table
 * - Vector 0 (offset 0x00): Initial Stack Pointer (should point to RAM)
 * - Vector 1 (offset 0x04): Reset Handler address (with Thumb bit set)
 * - Base address detection prevents firmware dumps from wrong memory regions
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { GdbClient } from '../lib/gdb/GdbClient';
import { ConnectionState } from '../lib/gdb/types';
import {
  detectArchitecture,
  type AnalysisResults as WasmAnalysisResults,
  type XrefResult,
  type ArchitectureInfo,
  type VectorTableEntry,
  type FunctionInfo
} from '../lib/wasmAnalyzer';
import { useAnalysis } from '../lib/context/AnalysisContext';
import { useFirmwareOptional } from '../lib/context/FirmwareContext';
import { useProjectOptional } from '../lib/context/ProjectContext';
import { AnalysisStateManager } from '../lib/analysis/AnalysisStateManager';
import { getAnalysisDatabase } from '../lib/db/AnalysisDatabase';
import {
  dumpFirmware,
  downloadFirmware,
  type FirmwareDump,
} from '../lib/firmware/FirmwareExtractor';
import {
  createCachedFirmware,
  restoreFirmwareDump,
} from '../lib/firmware/FirmwareCache';
import { type CachedFirmware } from '../lib/project/types';
import AnalysisProgressModal from './AnalysisProgressModal';

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
  cachedFirmware?: CachedFirmware | null;
  onFirmwareCached?: (cached: CachedFirmware) => void;
}

export function FirmwareDumpWorkflow({
  gdbClient: externalGdbClient,
  autoStart = false,
  onOutput,
  detectedArchInfo: externalArchInfo,
  onAnalysisComplete,
  cachedFirmware,
  onFirmwareCached
}: FirmwareDumpWorkflowProps = {}) {
  // Use provided gdbClient or create a new one
  const [internalGdbClient] = useState(() => new GdbClient({ debug: true }));
  const gdbClient = externalGdbClient || internalGdbClient;

  // Get analysis context
  const analysisContext = useAnalysis();
  // Get firmware context for caching raw firmware bytes
  const firmwareContext = useFirmwareOptional();
  // Get project context for analysis metadata
  const projectContext = useProjectOptional();

  const [progress, setProgress] = useState<DumpProgress>({ stage: 'idle', message: 'Ready to start' });
  const [dump, setDump] = useState<FirmwareDump | null>(null);
  const [analysisResults, setAnalysisResults] = useState<WasmAnalysisResults | null>(null);
  const [archInfo, setArchInfo] = useState<ArchitectureInfo | null>(null);
  const [lastTarget, setLastTarget] = useState<{ description: string; voltage: number | null } | null>(null);
  const [autoStartTriggered, setAutoStartTriggered] = useState(false);
  const [shouldAutoAnalyze, setShouldAutoAnalyze] = useState(false);
  const [shouldResetBeforeDump, setShouldResetBeforeDump] = useState(true); // Default to enabled
  const [detectedBaseAddress, setDetectedBaseAddress] = useState<number | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ stage: '', progress: 0, title: 'Processing' });
  const [analysisStateMessage, setAnalysisStateMessage] = useState<string>('');
  const [hasExistingAnalysis, setHasExistingAnalysis] = useState(false);

  /**
   * Use cached firmware instead of dumping
   */
  const handleUseCachedFirmware = useCallback(async () => {
    if (!cachedFirmware) {
      onOutput?.('[Firmware] No cached firmware available');
      return;
    }

    try {
      setProgress({ stage: 'dumping', message: 'Loading cached firmware...', progress: 50 });
      onOutput?.('[Firmware] Loading cached firmware from project...');

      // Restore firmware dump from cached data
      const firmwareDump = restoreFirmwareDump(cachedFirmware);

      setDump(firmwareDump);
      setProgress({
        stage: 'complete',
        message: `Loaded cached firmware (${cachedFirmware.size} bytes, cached at ${new Date(cachedFirmware.dumpedAt).toLocaleString()})`,
        progress: 100,
      });

      onOutput?.(`[Firmware] Loaded cached firmware: ${cachedFirmware.size} bytes`);
      onOutput?.(`[Firmware] Hash: ${cachedFirmware.hash.substring(0, 16)}...`);
      onOutput?.(`[Firmware] Cached: ${new Date(cachedFirmware.dumpedAt).toLocaleString()}`);

      // Store firmware in context to prevent unwanted GDB reads
      if (firmwareContext) {
        firmwareContext.setFirmwareData(firmwareDump.data, firmwareDump.baseAddress);
        onOutput?.(`[Firmware] Firmware cached in memory for offline analysis`);
      }

      // Set architecture info if available
      if (cachedFirmware.architecture && cachedFirmware.chipName) {
        setArchInfo({
          architecture: cachedFirmware.architecture,
          chip_name: cachedFirmware.chipName,
          manufacturer: 'Unknown',
          supported: true,
          confidence: 1.0,
          flash_base: cachedFirmware.baseAddress,
        });
      }

      // Auto-trigger analysis if requested
      if (autoStart) {
        onOutput?.(`[Firmware Analysis] Starting WASM analysis on cached firmware...`);
        setShouldAutoAnalyze(true);
      }
    } catch (error) {
      console.error('Failed to load cached firmware:', error);
      onOutput?.(`[Firmware] Error loading cached firmware: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProgress({
        stage: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }, [cachedFirmware, onOutput, autoStart, firmwareContext]);

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

      // Reset and halt target (if enabled)
      if (shouldResetBeforeDump) {
        try {
          setProgress({ stage: 'attaching', message: 'Resetting target to entry point...' });
          onOutput?.('[Firmware Dump] Resetting target and halting at entry point...');
          await gdbClient.resetAndHalt();

          // Black Magic Probe detaches during reset - need to re-scan and re-attach
          setProgress({ stage: 'scanning', message: 'Re-scanning targets after reset...' });
          onOutput?.('[Firmware Dump] Re-scanning for targets after reset...');

          const rescanResult = await gdbClient.scanSwd();
          if (rescanResult.targets.length === 0) {
            throw new Error('No targets found after reset');
          }

          const resetTarget = rescanResult.targets[0];

          setProgress({ stage: 'attaching', message: 'Re-attaching after reset...' });
          onOutput?.('[Firmware Dump] Re-attaching to target after reset...');
          await gdbClient.attach(resetTarget.id);

          // Give extra time for attachment to stabilize (critical for reliable memory access)
          await new Promise(resolve => setTimeout(resolve, 500));

          // Detect base address from vector table using architecture-specific flash base
          setProgress({ stage: 'attaching', message: 'Reading vector table for base address...' });
          onOutput?.('[Firmware Dump] Reading vector table to detect correct base address...');

          const vectorInfo = await gdbClient.getResetVector(detectedArch);
          setDetectedBaseAddress(vectorInfo.baseAddress);

          onOutput?.(`[Firmware Dump] Vector Table Analysis:`);
          onOutput?.(`   Base Address:   0x${vectorInfo.baseAddress.toString(16).toUpperCase().padStart(8, '0')}`);
          onOutput?.(`   Initial SP:     0x${vectorInfo.sp.toString(16).toUpperCase().padStart(8, '0')}`);
          onOutput?.(`   Reset Handler:  0x${vectorInfo.resetHandler.toString(16).toUpperCase().padStart(8, '0')}`);

          // Update detected architecture with correct base address
          if (detectedArch) {
            detectedArch.flash_base = vectorInfo.baseAddress;
            console.log('[FirmwareDump] Updated flash base to:', `0x${vectorInfo.baseAddress.toString(16)}`);
          }
        } catch (error) {
          console.warn('[FirmwareDump] Reset and vector detection failed:', error);
          onOutput?.(`[Firmware Dump] Warning: Reset failed, using default base address`);
          // Continue anyway - will use default base address from architecture detection
        }
      } else {
        // Just halt without reset
        try {
          setProgress({ stage: 'attaching', message: 'Halting target for memory read...' });
          await gdbClient.halt();
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch {
          console.log('[FirmwareDump] Halt command completed');
        }
      }

      // Stage 4: Dump firmware using service
      setProgress({
        stage: 'dumping',
        message: 'Dumping firmware from flash memory...',
        progress: 0,
      });

      // Show dump progress modal
      setShowAnalysisModal(true);
      setAnalysisProgress({ stage: 'Starting dump...', progress: 0, title: 'Dumping Firmware' });

      // Throttle ALL updates to reduce re-renders (only update every 5%)
      let lastUpdate = -10;

      const firmwareDump = await dumpFirmware(
        gdbClient,
        detectedArch,
        (progressPercent, bytesRead, totalBytes) => {
          // Throttle ALL state updates to prevent UI lockup
          if (progressPercent - lastUpdate >= 5 || progressPercent === 100 || progressPercent === 0) {
            setProgress({
              stage: 'dumping',
              message: `Dumping firmware... 0x${(detectedArch as ArchitectureInfo).chip_name}`,
              progress: progressPercent,
              bytesRead,
              totalBytes,
            });

            setAnalysisProgress({
              stage: `Reading ${(bytesRead / 1024).toFixed(1)}KB / ${(totalBytes / 1024).toFixed(1)}KB`,
              progress: progressPercent,
              title: 'Dumping Firmware'
            });

            lastUpdate = progressPercent;
          }
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

      // Store firmware in context to prevent unwanted GDB reads during analysis
      if (firmwareContext) {
        firmwareContext.setFirmwareData(firmwareDump.data, firmwareDump.baseAddress);
        onOutput?.(`[Firmware Dump] Firmware cached in memory for offline analysis`);
      }

      // Cache the firmware for future use
      try {
        const cached = await createCachedFirmware(firmwareDump);
        onFirmwareCached?.(cached);
        onOutput?.(`[Firmware Dump] Firmware cached (hash: ${cached.hash.substring(0, 16)}...)`);
      } catch (error) {
        console.error('[FirmwareDump] Failed to cache firmware:', error);
        onOutput?.(`[Firmware Dump] Warning: Failed to cache firmware`);
      }

      // Hide modal if not auto-analyzing (will be shown again by analysis if needed)
      if (!autoStart || !detectedArch?.supported) {
        setShowAnalysisModal(false);
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
  }, [gdbClient, onOutput, autoStart, externalArchInfo, lastTarget, archInfo, shouldResetBeforeDump, onFirmwareCached, firmwareContext]);

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
      // If re-analyzing, clear old auto-generated data (preserve user data)
      if (analysisResults) {
        onOutput?.(`[Firmware Analysis] Re-analyzing firmware (preserving comments and renames)...`);
        await analysisContext.clearAutoGeneratedData();
      }

      setProgress({ stage: 'analyzing', message: 'Starting background analysis...' });
      onOutput?.(`[Firmware Analysis] Initializing Web Worker...`);

      console.log('[FirmwareDump] Creating analyzer with base address:', `0x${dump.baseAddress.toString(16)}`);
      console.log('[FirmwareDump] Firmware size:', dump.data.length, 'bytes');

      // Show analysis modal
      setShowAnalysisModal(true);
      setAnalysisProgress({ stage: 'Initializing...', progress: 0, title: 'Analyzing Firmware' });

      // Create Web Worker for background analysis
      const worker = new Worker(
        new URL('../workers/analysisWorker.ts', import.meta.url),
        { type: 'module' }
      );

      setProgress({ stage: 'analyzing', message: 'Analyzing firmware in background...' });
      onOutput?.(`[Firmware Analysis] Decoding ${dump.data.length} bytes of ${archInfo?.architecture} code...`);

      // Run analysis in worker (prevents UI freezing)
      // Throttle ALL updates to reduce re-renders
      let lastAnalysisUpdate = -10;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results: any = await new Promise((resolve, reject) => {
        worker.onmessage = (event) => {
          const message = event.data;

          if (message.type === 'progress') {
            // Handle progress updates (throttled to prevent UI lockup)
            const progressPercent = Math.round(message.progress);

            if (progressPercent - lastAnalysisUpdate >= 5 || progressPercent === 100 || progressPercent === 0) {
              setProgress({
                stage: 'analyzing',
                message: `${message.stage}...`,
                progress: progressPercent
              });

              setAnalysisProgress({
                stage: message.stage,
                progress: progressPercent,
                title: 'Analyzing Firmware'
              });

              lastAnalysisUpdate = progressPercent;
            }

            // Log detailed progress to console
            if (progressPercent % 10 === 0 || message.stage !== 'Decoding instructions') {
              onOutput?.(`[Firmware Analysis] ${message.stage}: ${progressPercent}%`);
            }
          } else if (message.type === 'result') {
            // Analysis complete
            resolve(message);
          } else if (message.type === 'error') {
            // Analysis failed
            reject(new Error(message.error));
          }
        };

        worker.onerror = (error) => {
          reject(error);
        };

        // Send firmware data to worker
        worker.postMessage({
          type: 'analyze',
          firmwareData: dump.data,
          baseAddress: dump.baseAddress
        });
      });

      // Clean up worker
      worker.terminate();

      const displayTimeMs = results.analysisTimeMs;
      const vectorTable = results.vectorTable;

      console.log('[FirmwareDump] Vector table detected:', vectorTable?.length || 0, 'entries');

      // Log valid handlers
      if (vectorTable && vectorTable.length > 0) {
        const validHandlers = vectorTable.filter((e: VectorTableEntry) => e.is_valid && e.vector_number > 0);
        if (validHandlers.length > 0) {
          onOutput?.(`   ✓ Detected ${validHandlers.length} vector table handlers`);
          validHandlers.slice(0, 5).forEach((entry: VectorTableEntry) => {
            onOutput?.(`     - ${entry.handler_name}: 0x${entry.handler_address.toString(16).toUpperCase()}`);
          });
          if (validHandlers.length > 5) {
            onOutput?.(`     ... and ${validHandlers.length - 5} more handlers`);
          }
        }
      }

      // Extract actual results from worker response
      const wasmResults = results.results;

      console.log('[FirmwareDump] WASM analysis complete:', {
        totalInstructions: wasmResults.total_instructions,
        xrefCount: wasmResults.xrefs?.length || 0,
        uniqueTargets: wasmResults.unique_targets,
        loopsCount: wasmResults.loops?.length || 0,
        functionsCount: wasmResults.functions?.length || 0,
        vectorTableCount: vectorTable?.length || 0,
        timeMs: displayTimeMs,
      });

      // Count functions with argument annotations
      const functionsWithArgs = wasmResults.functions?.filter((f: FunctionInfo) => f.arg_annotations && f.arg_annotations.length > 0).length || 0;
      const totalArgAnnotations = wasmResults.functions?.reduce((sum: number, f: FunctionInfo) => sum + (f.arg_annotations?.length || 0), 0) || 0;

      // Output results
      onOutput?.(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      onOutput?.(`🎉 FIRMWARE ANALYSIS COMPLETE!`);
      onOutput?.(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      onOutput?.(`   ✓ Decoded ${wasmResults.total_instructions.toLocaleString()} instructions`);
      onOutput?.(`   ✓ Found ${wasmResults.xrefs.length.toLocaleString()} cross-references`);
      onOutput?.(`   ✓ Detected ${wasmResults.unique_targets.toLocaleString()} unique targets`);
      onOutput?.(`   ✓ Detected ${(wasmResults.loops?.length || 0).toLocaleString()} loops`);
      onOutput?.(`   ✓ Detected ${(wasmResults.functions?.length || 0).toLocaleString()} functions`);

      // Show vector table stats if available
      if (vectorTable && vectorTable.length > 0) {
        const validCount = vectorTable.filter((e: VectorTableEntry) => e.is_valid && e.vector_number > 0).length;
        onOutput?.(`   ✓ Detected ${validCount} vector handlers`);
      }

      // Show argument annotation stats if available
      if (functionsWithArgs > 0) {
        onOutput?.(`   ✓ ${functionsWithArgs} function${functionsWithArgs !== 1 ? 's' : ''} with ${totalArgAnnotations} argument annotation${totalArgAnnotations !== 1 ? 's' : ''}`);
      }

      onOutput?.(`   ✓ Analysis time: ${displayTimeMs}ms`);
      onOutput?.(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      // Add vector table to results before saving
      const completeResults = {
        ...wasmResults,
        vector_table: vectorTable || []
      };

      setAnalysisResults(completeResults);

      // Populate analysis context
      analysisContext.setAnalysisResults(completeResults, dump.baseAddress, dump.size);

      // IMPORTANT: Immediately save to database to ensure metadata is persisted
      // This must happen before user reloads the page
      try {
        onOutput?.('[Analysis] Saving analysis to database...');
        await analysisContext.saveToDatabase();
        onOutput?.('[Analysis] Analysis saved successfully');

        // Update analysis state detection
        if (projectContext) {
          const stateManager = new AnalysisStateManager();
          const project = projectContext.projectManager.getCurrentProject();
          const analysisDb = getAnalysisDatabase();
          const stateDetails = await stateManager.checkAnalysisState(project, analysisDb);
          setHasExistingAnalysis(stateDetails.state === 'current' || stateDetails.state === 'outdated');
          setAnalysisStateMessage(stateDetails.statusMessage);
        }
      } catch (error) {
        console.error('[FirmwareDumpWorkflow] Failed to save analysis:', error);
        onOutput?.(`[Analysis] Warning: Failed to save analysis: ${error instanceof Error ? error.message : String(error)}`);
      }

      setProgress({
        stage: 'complete',
        message: `Analysis complete: Found ${wasmResults.xrefs.length} cross-references`,
        progress: 100,
      });

      // Hide analysis modal
      setShowAnalysisModal(false);

      // Notify parent
      onAnalysisComplete?.();

    } catch (error) {
      console.error('[FirmwareDump] Analysis error:', error);

      // Hide analysis modal on error
      setShowAnalysisModal(false);
      onOutput?.(`[Firmware Analysis] ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error && error.stack) {
        console.error('[FirmwareDump] Stack trace:', error.stack);
      }
      setProgress({
        stage: 'error',
        message: `Analysis error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }, [dump, archInfo, onOutput, analysisContext, onAnalysisComplete, analysisResults]);

  /**
   * Load existing analysis from database
   */
  const handleLoadAnalysis = useCallback(async () => {
    try {
      onOutput?.('[Analysis] Loading existing analysis from database...');
      setProgress({ stage: 'analyzing', message: 'Loading analysis from MDB...' });

      const loaded = await analysisContext.loadFromDatabase();

      if (loaded) {
        onOutput?.('[Analysis] Successfully loaded existing analysis');
        setProgress({
          stage: 'complete',
          message: 'Analysis loaded from database',
          progress: 100
        });

        // Populate analysis results state (needed for UI display)
        if (analysisContext.results) {
          setAnalysisResults(analysisContext.results);
        }

        // Notify parent
        onAnalysisComplete?.();
      } else {
        onOutput?.('[Analysis] No existing analysis found in database');
        setProgress({
          stage: 'error',
          message: 'No analysis data found - please re-analyze'
        });
      }
    } catch (error) {
      console.error('[FirmwareDumpWorkflow] Load analysis error:', error);
      onOutput?.(`[Analysis] Failed to load: ${error instanceof Error ? error.message : String(error)}`);
      setProgress({
        stage: 'error',
        message: `Load failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }, [analysisContext, onOutput, onAnalysisComplete]);

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

  // Check for existing analysis on component mount
  useEffect(() => {
    const checkAnalysisState = async () => {
      if (!projectContext) return;

      const stateManager = new AnalysisStateManager();
      const project = projectContext.projectManager.getCurrentProject();
      const analysisDb = getAnalysisDatabase();

      const stateDetails = await stateManager.checkAnalysisState(project, analysisDb);

      setHasExistingAnalysis(stateDetails.state === 'current' || stateDetails.state === 'outdated');
      setAnalysisStateMessage(stateDetails.statusMessage);

      console.log('[FirmwareDumpWorkflow] Analysis state:', stateDetails);
    };

    checkAnalysisState();
  }, [projectContext]);

  return (
    <>
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

        {/* Reset Before Dump Option */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={shouldResetBeforeDump}
              onChange={(e) => setShouldResetBeforeDump(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-200">
                Reset target before dump (recommended)
              </span>
              <span className="text-xs text-gray-400">
                Ensures accurate vector table detection and base address identification
              </span>
            </div>
          </label>
          {detectedBaseAddress !== null && (
            <div className="mt-2 text-xs text-green-400 ml-7">
              Detected base address: 0x{detectedBaseAddress.toString(16).toUpperCase().padStart(8, '0')}
            </div>
          )}
        </div>

        {/* Existing Analysis Option */}
        {hasExistingAnalysis && !analysisResults && (
          <div className="bg-gray-800 rounded-lg p-4 border border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-blue-400">Existing Analysis Found</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {analysisStateMessage}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleLoadAnalysis}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                  title="Load analysis from database (fast)"
                >
                  Load Analysis
                </button>
                {dump && (
                  <button
                    onClick={handleAnalyzeFirmware}
                    disabled={archInfo !== null && !archInfo.supported}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
                    title="Re-analyze firmware (slower)"
                  >
                    Re-analyze
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cached Firmware Option */}
        {cachedFirmware && !dump && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-gray-200">Cached Firmware Available</h3>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Size: {cachedFirmware.size.toLocaleString()} bytes ({(cachedFirmware.size / 1024).toFixed(1)} KB)</div>
                  <div>Chip: {cachedFirmware.chipName || 'Unknown'}</div>
                  <div>Cached: {new Date(cachedFirmware.dumpedAt).toLocaleString()}</div>
                  <div>Hash: {cachedFirmware.hash.substring(0, 16)}...</div>
                </div>
              </div>
              <button
                onClick={handleUseCachedFirmware}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded text-sm font-medium transition-colors"
              >
                Use Cached
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDumpFirmware}
            disabled={progress.stage === 'dumping' || progress.stage === 'analyzing'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
          >
            {cachedFirmware ? 'Re-dump Firmware' : 'Dump Firmware'}
          </button>

          {/* Only show "Analyze" button if no existing analysis OR if already showing results */}
          {dump && (!hasExistingAnalysis || analysisResults) && (
            <>
              <button
                onClick={handleAnalyzeFirmware}
                disabled={progress.stage === 'analyzing' || (archInfo !== null && !archInfo.supported)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
                title={archInfo && !archInfo.supported ? `${archInfo.architecture} not supported` : 'Re-run WASM analysis (preserves comments and renames)'}
              >
                {analysisResults ? 'Re-analyze' : 'Analyze with WASM'}
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
    {/* Progress Modal - Outside main container for proper fixed positioning */}
    <AnalysisProgressModal
      isVisible={showAnalysisModal}
      stage={analysisProgress.stage}
      progress={analysisProgress.progress}
      title={analysisProgress.title}
      showCancelButton={true}
      onCancel={() => {
        // Hide modal and let process finish in background
        // (Safer than trying to abort mid-dump/analysis)
        setShowAnalysisModal(false);
        onOutput?.('[Analysis] Running in background...');
      }}
    />
    </>
  );
}
