/**
 * Enriched Disassembly Hook
 *
 * Merges database enrichment (function names, comments, xrefs) with live UART disassembly.
 * When loading disassembly:
 * 1. Check if address is in AnalysisContext (database)
 * 2. If yes: Use stored name/comment instead of raw data
 * 3. If no: Disassemble from UART and add to view
 * 4. Merge both sources into single enriched view
 */

import { useCallback } from 'react';
import type { DisassembledInstruction } from '../../../lib/arch/arm/disasm';
import type { DisassemblyLine } from '../types';
import { useAnalysisOptional } from '../../../lib/context/AnalysisContext';
import { useXref } from '../../../lib/context/XrefContext';

interface EnrichmentResult {
  functionName?: string;
  comment?: string;
  xrefsTo: number;
  xrefsFrom: number;
  isFunctionEntry: boolean;
}

interface UseEnrichedDisassemblyReturn {
  enrichInstruction: (inst: DisassembledInstruction) => EnrichmentResult;
  enrichInstructions: (
    instructions: DisassembledInstruction[],
    programCounter: number | undefined,
    breakpoints: Set<number>,
    crossRefs: Map<number, number[]>,
    isFunctionEntry: (instructions: DisassembledInstruction[], index: number) => boolean
  ) => DisassemblyLine[];
}

/**
 * Hook for enriching disassembly with database information
 *
 * Provides function to merge UART disassembly with stored analysis data.
 */
export function useEnrichedDisassembly(): UseEnrichedDisassemblyReturn {
  const analysisContext = useAnalysisOptional();
  const { getXrefsTo, getXrefsFrom, isAnalyzed } = useXref();

  /**
   * Enrich a single instruction with database information
   */
  const enrichInstruction = useCallback((
    inst: DisassembledInstruction
  ): EnrichmentResult => {
    const result: EnrichmentResult = {
      xrefsTo: 0,
      xrefsFrom: 0,
      isFunctionEntry: false
    };

    // Get function name from analysis context
    const functionInfo = analysisContext?.getFunctionAt(inst.address);
    if (functionInfo) {
      result.functionName = functionInfo.name;
      result.isFunctionEntry = true;
    }

    // Get standard comment from analysis context (for backwards compatibility)
    const standardComment = analysisContext?.getComment(inst.address, 'standard');
    if (standardComment) {
      result.comment = standardComment.text;
    }

    // Get xref counts from analyzer if available
    if (isAnalyzed()) {
      try {
        const refsTo = getXrefsTo(inst.address);
        const refsFrom = getXrefsFrom(inst.address);
        result.xrefsTo = refsTo.length;
        result.xrefsFrom = refsFrom.length;
      } catch {
        // Silently ignore - analysis might not cover this address
      }
    }

    return result;
  }, [analysisContext, getXrefsTo, getXrefsFrom, isAnalyzed]);

  /**
   * Enrich all instructions with database information and create display lines
   */
  const enrichInstructions = useCallback((
    instructions: DisassembledInstruction[],
    programCounter: number | undefined,
    breakpoints: Set<number>,
    crossRefs: Map<number, number[]>,
    isFunctionEntry: (instructions: DisassembledInstruction[], index: number) => boolean
  ): DisassemblyLine[] => {
    return instructions.map((inst, index) => {
      const enrichment = enrichInstruction(inst);

      // Apply function name enrichment to instruction
      if (enrichment.functionName && inst.isBranch && inst.branchTarget !== undefined) {
        const targetFunction = analysisContext?.getFunctionAt(inst.branchTarget);
        if (targetFunction) {
          // Add function name to comment if not already present
          if (!inst.comment) {
            inst.comment = targetFunction.name;
          } else if (!inst.comment.includes(targetFunction.name)) {
            inst.comment += ` (${targetFunction.name})`;
          }
        }
      }

      return {
        instruction: inst,
        isCurrentPC: programCounter !== undefined && inst.address === programCounter,
        isBreakpoint: breakpoints.has(inst.address),
        isFunctionEntry: enrichment.isFunctionEntry || isFunctionEntry(instructions, index),
        crossRefs: crossRefs.get(inst.address) || [],
        xrefsTo: enrichment.xrefsTo,
        xrefsFrom: enrichment.xrefsFrom
      };
    });
  }, [enrichInstruction, analysisContext]);

  return {
    enrichInstruction,
    enrichInstructions
  };
}
