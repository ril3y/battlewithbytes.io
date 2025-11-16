'use client';

/**
 * Analysis Context - Global state for firmware analysis results
 *
 * Provides indexed access to analysis data from WASM decoder.
 * All heavy lifting (decoding, xref extraction) is done in Rust.
 * This is just a thin indexing layer for fast lookups in the UI.
 *
 * Persistence:
 * - Analysis results are automatically saved to IndexedDB
 * - Results are loaded on startup if available
 * - User comments and function renames are persisted
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { AnalysisResults, XrefResult } from '../wasmAnalyzer';
import { XrefType } from '../wasmAnalyzer';
import { getAnalysisDatabase, type DbFunction, type DbComment, type DbXref } from '../db/AnalysisDatabase';

/**
 * Function information derived from call xrefs
 */
interface FunctionInfo {
  address: number;
  name: string;              // "sub_1000" or user-renamed
  callers: number[];         // Addresses that call this function
  callees: number[];         // Addresses this function calls
  xref_count: number;        // Total xrefs to this function
}

/**
 * Analysis context state
 */
interface AnalysisContextState {
  // Raw analysis results from WASM
  results: AnalysisResults | null;

  // Firmware info
  baseAddress: number;
  firmwareSize: number;

  // Indexed lookups (built from results)
  xrefsTo: Map<number, XrefResult[]>;      // address → xrefs pointing TO this address
  xrefsFrom: Map<number, XrefResult[]>;    // address → xrefs FROM this address
  functions: Map<number, FunctionInfo>;     // address → function info
  comments: Map<number, string>;            // address → user comment

  // Methods
  setAnalysisResults: (results: AnalysisResults, baseAddr: number, size: number) => void;
  clearAnalysis: () => void;
  getXrefsTo: (address: number) => XrefResult[];
  getXrefsFrom: (address: number) => XrefResult[];
  getFunctionAt: (address: number) => FunctionInfo | null;
  renameFunction: (address: number, newName: string) => void;
  getComment: (address: number) => string | null;
  setComment: (address: number, comment: string) => void;
  deleteComment: (address: number) => void;
  isAnalyzed: () => boolean;

  // Database operations
  saveToDatabase: () => Promise<void>;
  loadFromDatabase: () => Promise<boolean>;
  exportDatabase: () => Promise<void>;
  importDatabase: (file: File) => Promise<void>;
  clearDatabase: () => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextState | undefined>(undefined);

/**
 * Build lookup indexes from analysis results
 *
 * This is the only place we process the raw WASM results.
 * We build fast lookup tables for the UI.
 */
function buildIndexes(results: AnalysisResults) {
  const xrefsTo = new Map<number, XrefResult[]>();
  const xrefsFrom = new Map<number, XrefResult[]>();
  const functions = new Map<number, FunctionInfo>();

  // Index all xrefs
  results.xrefs.forEach(xref => {
    // Index by from_addr (who calls/references this)
    if (!xrefsFrom.has(xref.from_addr)) {
      xrefsFrom.set(xref.from_addr, []);
    }
    xrefsFrom.get(xref.from_addr)!.push(xref);

    // Index by to_addr (what this references)
    if (!xrefsTo.has(xref.to_addr)) {
      xrefsTo.set(xref.to_addr, []);
    }
    xrefsTo.get(xref.to_addr)!.push(xref);

    // Detect functions from call targets
    // Any address that is called is likely a function
    if (xref.xref_type === XrefType.Call) {
      if (!functions.has(xref.to_addr)) {
        functions.set(xref.to_addr, {
          address: xref.to_addr,
          name: `sub_${xref.to_addr.toString(16).toUpperCase()}`,
          callers: [],
          callees: [],
          xref_count: 0,
        });
      }

      const func = functions.get(xref.to_addr)!;
      if (!func.callers.includes(xref.from_addr)) {
        func.callers.push(xref.from_addr);
      }
      func.xref_count++;
    }
  });

  // Build callees list for each function
  functions.forEach((func, funcAddr) => {
    const callsFrom = xrefsFrom.get(funcAddr) || [];
    func.callees = callsFrom
      .filter(xref => xref.xref_type === XrefType.Call)
      .map(xref => xref.to_addr);
  });

  console.log('[AnalysisContext] Built indexes:', {
    xrefs: results.xrefs.length,
    functions: functions.size,
    totalInstructions: results.total_instructions,
  });

  return { xrefsTo, xrefsFrom, functions };
}

/**
 * Analysis Context Provider
 */
export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [baseAddress, setBaseAddress] = useState(0);
  const [firmwareSize, setFirmwareSize] = useState(0);
  const [comments, setComments] = useState<Map<number, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Database instance
  const dbRef = useRef(getAnalysisDatabase());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Build indexes when results change
  const { xrefsTo, xrefsFrom, functions } = useMemo(() => {
    if (!results) {
      return {
        xrefsTo: new Map(),
        xrefsFrom: new Map(),
        functions: new Map(),
      };
    }

    return buildIndexes(results);
  }, [results]);

  const setAnalysisResults = useCallback((
    newResults: AnalysisResults,
    baseAddr: number,
    size: number
  ) => {
    console.log('[AnalysisContext] Setting analysis results:', {
      xrefs: newResults.xrefs.length,
      instructions: newResults.total_instructions,
      baseAddress: `0x${baseAddr.toString(16)}`,
      size,
    });

    setResults(newResults);
    setBaseAddress(baseAddr);
    setFirmwareSize(size);
  }, []);

  const clearAnalysis = useCallback(() => {
    console.log('[AnalysisContext] Clearing analysis');
    setResults(null);
    setBaseAddress(0);
    setFirmwareSize(0);
    setComments(new Map());
  }, []);

  const getXrefsTo = useCallback((address: number): XrefResult[] => {
    return xrefsTo.get(address) || [];
  }, [xrefsTo]);

  const getXrefsFrom = useCallback((address: number): XrefResult[] => {
    return xrefsFrom.get(address) || [];
  }, [xrefsFrom]);

  const getFunctionAt = useCallback((address: number): FunctionInfo | null => {
    return functions.get(address) || null;
  }, [functions]);

  const renameFunction = useCallback((address: number, newName: string) => {
    const func = functions.get(address);
    if (func) {
      func.name = newName;
      console.log(`[AnalysisContext] Renamed function at 0x${address.toString(16)} to ${newName}`);
    }
  }, [functions]);

  const getComment = useCallback((address: number): string | null => {
    return comments.get(address) || null;
  }, [comments]);

  const setComment = useCallback((address: number, comment: string) => {
    setComments(prev => {
      const newComments = new Map(prev);
      newComments.set(address, comment);
      console.log(`[AnalysisContext] Added comment at 0x${address.toString(16)}: ${comment}`);
      return newComments;
    });
  }, []);

  const deleteComment = useCallback((address: number) => {
    setComments(prev => {
      const newComments = new Map(prev);
      newComments.delete(address);
      console.log(`[AnalysisContext] Deleted comment at 0x${address.toString(16)}`);
      return newComments;
    });
  }, []);

  const isAnalyzed = useCallback(() => {
    return results !== null;
  }, [results]);

  // ============================================================================
  // Database Operations
  // ============================================================================

  /**
   * Save analysis data to IndexedDB
   */
  const saveToDatabase = useCallback(async () => {
    if (!results) {
      console.log('[AnalysisContext] No analysis to save');
      return;
    }

    try {
      const db = dbRef.current;

      console.log('[AnalysisContext] Saving analysis to database...');

      // Convert functions Map to array of DbFunction
      const dbFunctions: DbFunction[] = Array.from(functions.values()).map(func => ({
        address: func.address,
        name: func.name,
        callers: func.callers,
        callees: func.callees,
        xref_count: func.xref_count,
      }));

      // Convert comments Map to array of DbComment
      const dbComments: DbComment[] = Array.from(comments.entries()).map(([address, text]) => ({
        address,
        text,
        timestamp: Date.now(),
      }));

      // Convert xrefs to array of DbXref
      const dbXrefs: DbXref[] = results.xrefs.map(xref => ({
        id: `${xref.from_addr}_${xref.to_addr}_${xref.xref_type}`,
        from_addr: xref.from_addr,
        to_addr: xref.to_addr,
        xref_type: xref.xref_type,
        instruction: xref.instruction,
        operands: xref.operands,
      }));

      // Save all data to database
      await Promise.all([
        db.saveFunctions(dbFunctions),
        db.saveComments(dbComments),
        db.saveXrefs(dbXrefs),
        db.setMetadata('baseAddress', baseAddress),
        db.setMetadata('firmwareSize', firmwareSize),
        db.setMetadata('totalInstructions', results.total_instructions),
        db.setMetadata('analysisTime', results.analysis_time_ms),
        db.setMetadata('lastModified', Date.now()),
      ]);

      console.log('[AnalysisContext] Analysis saved to database:', {
        functions: dbFunctions.length,
        comments: dbComments.length,
        xrefs: dbXrefs.length,
      });
    } catch (error) {
      console.error('[AnalysisContext] Failed to save to database:', error);
      throw error;
    }
  }, [results, functions, comments, baseAddress, firmwareSize]);

  /**
   * Load analysis data from IndexedDB
   */
  const loadFromDatabase = useCallback(async (): Promise<boolean> => {
    try {
      const db = dbRef.current;

      // Check if database has any data
      const hasData = await db.hasAnalysis();
      if (!hasData) {
        console.log('[AnalysisContext] No saved analysis found in database');
        setIsLoading(false);
        return false;
      }

      console.log('[AnalysisContext] Loading analysis from database...');

      // Load all data from database
      const [dbFunctions, dbComments, dbXrefs, dbBaseAddress, dbFirmwareSize, dbTotalInstructions, dbAnalysisTime] = await Promise.all([
        db.getAllFunctions(),
        db.getAllComments(),
        db.getAllXrefs(),
        db.getMetadata<number>('baseAddress'),
        db.getMetadata<number>('firmwareSize'),
        db.getMetadata<number>('totalInstructions'),
        db.getMetadata<number>('analysisTime'),
      ]);

      // Convert DbXref[] to XrefResult[]
      const xrefs: XrefResult[] = dbXrefs.map(xref => ({
        from_addr: xref.from_addr,
        to_addr: xref.to_addr,
        xref_type: xref.xref_type,
        instruction: xref.instruction,
        operands: xref.operands,
      }));

      // Calculate unique targets from xrefs
      const uniqueTargets = new Set(xrefs.map(x => x.to_addr)).size;

      // Find address range
      const addresses = xrefs.flatMap(x => [x.from_addr, x.to_addr]);
      const startAddress = addresses.length > 0 ? Math.min(...addresses) : dbBaseAddress || 0;
      const endAddress = addresses.length > 0 ? Math.max(...addresses) : dbBaseAddress || 0;

      // Reconstruct AnalysisResults
      const analysisResults: AnalysisResults = {
        xrefs,
        total_instructions: dbTotalInstructions || 0,
        analysis_time_ms: dbAnalysisTime || 0,
        unique_targets: uniqueTargets,
        start_address: startAddress,
        end_address: endAddress,
      };

      // Convert comments to Map
      const commentsMap = new Map<number, string>();
      dbComments.forEach(comment => {
        commentsMap.set(comment.address, comment.text);
      });

      // Set state
      setResults(analysisResults);
      setBaseAddress(dbBaseAddress || 0);
      setFirmwareSize(dbFirmwareSize || 0);
      setComments(commentsMap);

      console.log('[AnalysisContext] Analysis loaded from database:', {
        functions: dbFunctions.length,
        comments: dbComments.length,
        xrefs: xrefs.length,
        baseAddress: `0x${(dbBaseAddress || 0).toString(16)}`,
      });

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('[AnalysisContext] Failed to load from database:', error);
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Export database to .mdb file
   */
  const exportDatabase = useCallback(async () => {
    try {
      const db = dbRef.current;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `battlemagic_${timestamp}.mdb`;
      await db.downloadMdb(filename);
      console.log(`[AnalysisContext] Database exported to ${filename}`);
    } catch (error) {
      console.error('[AnalysisContext] Failed to export database:', error);
      throw error;
    }
  }, []);

  /**
   * Import database from .mdb file
   */
  const importDatabase = useCallback(async (file: File) => {
    try {
      const db = dbRef.current;
      await db.uploadMdb(file);
      console.log('[AnalysisContext] Database imported, reloading...');

      // Reload data from database
      await loadFromDatabase();
    } catch (error) {
      console.error('[AnalysisContext] Failed to import database:', error);
      throw error;
    }
  }, [loadFromDatabase]);

  /**
   * Clear database
   */
  const clearDatabase = useCallback(async () => {
    try {
      const db = dbRef.current;
      await db.clear();
      console.log('[AnalysisContext] Database cleared');
    } catch (error) {
      console.error('[AnalysisContext] Failed to clear database:', error);
      throw error;
    }
  }, []);

  /**
   * Debounced auto-save to database
   */
  const scheduleSave = useCallback(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule new save after 2 seconds of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      saveToDatabase().catch(error => {
        console.error('[AnalysisContext] Auto-save failed:', error);
      });
    }, 2000);
  }, [saveToDatabase]);

  // ============================================================================
  // Effects
  // ============================================================================

  // Load from database on mount
  useEffect(() => {
    loadFromDatabase().catch(error => {
      console.error('[AnalysisContext] Failed to load from database:', error);
    });
  }, [loadFromDatabase]);

  // Auto-save when data changes
  useEffect(() => {
    if (!isLoading && results) {
      scheduleSave();
    }
  }, [results, comments, functions, isLoading, scheduleSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const value: AnalysisContextState = {
    results,
    baseAddress,
    firmwareSize,
    xrefsTo,
    xrefsFrom,
    functions,
    comments,
    setAnalysisResults,
    clearAnalysis,
    getXrefsTo,
    getXrefsFrom,
    getFunctionAt,
    renameFunction,
    getComment,
    setComment,
    deleteComment,
    isAnalyzed,
    saveToDatabase,
    loadFromDatabase,
    exportDatabase,
    importDatabase,
    clearDatabase,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

/**
 * Hook to use analysis context
 */
export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
}

/**
 * Hook to check if analysis is available (without throwing)
 */
export function useAnalysisOptional() {
  return useContext(AnalysisContext);
}
