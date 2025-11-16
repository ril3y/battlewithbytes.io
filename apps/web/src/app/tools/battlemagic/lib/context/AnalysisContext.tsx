'use client';

/**
 * Analysis Context - Global state for firmware analysis results
 *
 * Provides indexed access to analysis data from WASM decoder.
 * All heavy lifting (decoding, xref extraction) is done in Rust.
 * This is just a thin indexing layer for fast lookups in the UI.
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { AnalysisResults, XrefResult } from '../wasmAnalyzer';
import { XrefType } from '../wasmAnalyzer';

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

  // Methods
  setAnalysisResults: (results: AnalysisResults, baseAddr: number, size: number) => void;
  clearAnalysis: () => void;
  getXrefsTo: (address: number) => XrefResult[];
  getXrefsFrom: (address: number) => XrefResult[];
  getFunctionAt: (address: number) => FunctionInfo | null;
  renameFunction: (address: number, newName: string) => void;
  isAnalyzed: () => boolean;
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

  const isAnalyzed = useCallback(() => {
    return results !== null;
  }, [results]);

  const value: AnalysisContextState = {
    results,
    baseAddress,
    firmwareSize,
    xrefsTo,
    xrefsFrom,
    functions,
    setAnalysisResults,
    clearAnalysis,
    getXrefsTo,
    getXrefsFrom,
    getFunctionAt,
    renameFunction,
    isAnalyzed,
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
