"use client";

/**
 * Xref Context
 *
 * Provides cross-reference analyzer instance to components
 * Enables sharing of WASM analyzer results across DisassemblyView, AnalysisPanel, and XrefPanel
 */

import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * Xref data structure returned from WASM analyzer
 */
export interface Xref {
  from_addr: number;
  to_addr: number;
  xref_type: "Call" | "Branch" | "ConditionalBranch" | "DataRead" | "DataWrite";
  instruction: string;
  operands: string;
}

/**
 * Analysis statistics
 */
export interface AnalysisStats {
  totalInstructions: number;
  xrefCount: number;
  uniqueTargets: number;
  xrefsByType: {
    Call: number;
    Branch: number;
    ConditionalBranch: number;
    DataRead: number;
    DataWrite: number;
  };
  addressRange: {
    start: number;
    end: number;
  };
  analysisTimeMs: number;
}

/**
 * WASM Analyzer interface (simplified from battlemagic-analyzer)
 * Note: WASM returns unknown[] which needs casting to Xref[] at usage site
 */
interface ArmAnalyzer {
  analyze_from_disasm(instructions: unknown): unknown;
  get_xrefs_to(address: number): unknown[];
  get_xrefs_from(address: number): unknown[];
  xref_count(): number;
  is_analyzed(): boolean;
  reset(): void;
}

interface XrefContextValue {
  analyzer: ArmAnalyzer | null;
  setAnalyzer: (analyzer: ArmAnalyzer | null) => void;
  analysisStats: AnalysisStats | null;
  setAnalysisStats: (stats: AnalysisStats | null) => void;
  getXrefsTo: (address: number) => Xref[];
  getXrefsFrom: (address: number) => Xref[];
  isAnalyzed: () => boolean;
  clearAnalysis: () => void;
}

const XrefContext = createContext<XrefContextValue | undefined>(undefined);

export function XrefProvider({ children }: { children: React.ReactNode }) {
  const [analyzer, setAnalyzerState] = useState<ArmAnalyzer | null>(null);
  const [analysisStats, setAnalysisStats] = useState<AnalysisStats | null>(
    null,
  );

  const setAnalyzer = useCallback((newAnalyzer: ArmAnalyzer | null) => {
    setAnalyzerState(newAnalyzer);
  }, []);

  const getXrefsTo = useCallback(
    (address: number): Xref[] => {
      if (!analyzer) return [];
      try {
        return analyzer.get_xrefs_to(address) as Xref[];
      } catch (error) {
        console.error("[XrefContext] Failed to get xrefs to address:", error);
        return [];
      }
    },
    [analyzer],
  );

  const getXrefsFrom = useCallback(
    (address: number): Xref[] => {
      if (!analyzer) return [];
      try {
        return analyzer.get_xrefs_from(address) as Xref[];
      } catch (error) {
        console.error("[XrefContext] Failed to get xrefs from address:", error);
        return [];
      }
    },
    [analyzer],
  );

  const isAnalyzed = useCallback((): boolean => {
    if (!analyzer) return false;
    try {
      return analyzer.is_analyzed();
    } catch (error) {
      console.error("[XrefContext] Failed to check analyzed status:", error);
      return false;
    }
  }, [analyzer]);

  const clearAnalysis = useCallback(() => {
    if (analyzer) {
      try {
        analyzer.reset();
      } catch (error) {
        console.error("[XrefContext] Failed to reset analyzer:", error);
      }
    }
    setAnalyzerState(null);
    setAnalysisStats(null);
  }, [analyzer]);

  const value: XrefContextValue = {
    analyzer,
    setAnalyzer,
    analysisStats,
    setAnalysisStats,
    getXrefsTo,
    getXrefsFrom,
    isAnalyzed,
    clearAnalysis,
  };

  return <XrefContext.Provider value={value}>{children}</XrefContext.Provider>;
}

export function useXref(): XrefContextValue {
  const context = useContext(XrefContext);
  if (context === undefined) {
    throw new Error("useXref must be used within an XrefProvider");
  }
  return context;
}
