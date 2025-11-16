/**
 * Jump analysis utilities for control flow visualization
 *
 * Analyzes branch instructions and assigns visual columns
 * to avoid overlapping jump arrows in the disassembly view.
 */

import type { DisassemblyLine, JumpInfo } from '../types';

/**
 * Analyze jumps for visualization in disassembly view
 *
 * This function:
 * 1. Identifies all branch instructions within the visible range
 * 2. Calculates their source and target line numbers
 * 3. Assigns columns to avoid visual overlaps
 * 4. Classifies jumps as forward or backward
 *
 * @param lines - Array of disassembly lines to analyze
 * @returns Array of jump information with assigned columns
 */
export function analyzeJumps(lines: DisassemblyLine[]): JumpInfo[] {
  const jumps: JumpInfo[] = [];
  const addressToLine = new Map<number, number>();

  // Build address-to-line mapping
  lines.forEach((line, idx) => {
    addressToLine.set(line.instruction.address, idx);
  });

  // Analyze each instruction for jumps
  lines.forEach((line, fromLine) => {
    const inst = line.instruction;
    const mnem = inst.mnemonic.toLowerCase();

    // Skip non-branch instructions
    if (!mnem.startsWith('b') || mnem === 'bkpt') return;

    // Skip function calls and returns
    if (mnem.startsWith('bl') || (mnem === 'bx' && inst.operands?.toLowerCase().includes('lr'))) return;

    // Try to parse target address from operands
    const operands = inst.operands || '';
    const match = operands.match(/0x([0-9a-fA-F]+)/);
    if (!match) return;

    const toAddress = parseInt(match[1], 16);
    const toLine = addressToLine.get(toAddress);

    // Only show jumps within visible range
    if (toLine === undefined) return;

    jumps.push({
      fromAddress: inst.address,
      toAddress,
      type: toLine > fromLine ? 'forward' : 'backward',
      fromLine,
      toLine,
      column: 0 // Will be assigned later to avoid overlaps
    });
  });

  // Assign columns to avoid overlaps
  jumps.sort((a, b) => {
    const aSpan = Math.abs(a.toLine - a.fromLine);
    const bSpan = Math.abs(b.toLine - b.fromLine);
    return bSpan - aSpan; // Longer jumps get inner columns
  });

  const usedColumns: Set<number>[] = [];
  jumps.forEach(jump => {
    const minLine = Math.min(jump.fromLine, jump.toLine);
    const maxLine = Math.max(jump.fromLine, jump.toLine);

    // Find first available column
    let column = 0;
    while (true) {
      if (!usedColumns[column]) {
        usedColumns[column] = new Set();
      }

      // Check if this column is free for this line range
      let isFree = true;
      for (let line = minLine; line <= maxLine; line++) {
        if (usedColumns[column].has(line)) {
          isFree = false;
          break;
        }
      }

      if (isFree) {
        // Mark this column as used for this line range
        for (let line = minLine; line <= maxLine; line++) {
          usedColumns[column].add(line);
        }
        jump.column = column;
        break;
      }

      column++;
    }
  });

  return jumps;
}
