/**
 * Loop Analysis for Linear Disassembly View
 *
 * Detects loops in visible instruction range and provides data for ASCII art rendering.
 * Uses backward branch detection algorithm - branches where target address < source address.
 */

import type { DisassembledInstruction } from '../../../lib/disasm/ArmDisassembler';

/**
 * Loop types based on structure
 */
export type LoopType = 'while' | 'do-while' | 'for' | 'infinite';

/**
 * Information about a detected loop
 */
export interface LoopInfo {
  /** Address of the loop header (target of back edge) */
  headerAddress: number;

  /** Address where loop entry occurs (may be before header for pre-test loops) */
  entryAddress: number;

  /** Address of the instruction that branches back (back edge source) */
  backEdgeAddress: number;

  /** Target address of the back edge (should equal headerAddress) */
  backEdgeTarget: number;

  /** Loop classification */
  type: LoopType;

  /** Line index of loop header in visible instructions */
  headerLine: number;

  /** Line index of back edge instruction in visible instructions */
  backEdgeLine: number;

  /** Nesting depth (1 = outermost) */
  nestingLevel: number;

  /** Set of all instruction addresses in loop body */
  loopBody: Set<number>;
}

/**
 * Rendering information for a single line in the loop visualization
 */
export interface LoopLineInfo {
  /** Character type for each nesting level */
  columns: LoopCharType[];

  /** Loops that this line participates in (for hover/highlighting) */
  activeLoops: number[];
}

/**
 * Types of characters in loop visualization
 */
export type LoopCharType =
  | 'empty'      // ' '
  | 'vertical'   // '│'
  | 'top'        // '┌'
  | 'bottom'     // '└'
  | 'branch';    // '├'

/**
 * Detect loops in a range of instructions
 *
 * Algorithm:
 * 1. Find backward branches (target address < source address)
 * 2. Classify loop type based on structure
 * 3. Calculate nesting depth based on containment
 * 4. Identify all instructions in loop body
 *
 * @param instructions - Array of disassembled instructions
 * @returns Array of detected loops, sorted by nesting depth (outermost first)
 */
export function detectLoops(instructions: DisassembledInstruction[]): LoopInfo[] {
  const loops: LoopInfo[] = [];

  // Build address-to-line index map
  const addressToLine = new Map<number, number>();
  instructions.forEach((inst, idx) => {
    addressToLine.set(inst.address, idx);
  });

  // Find backward branches (back edges)
  for (let i = 0; i < instructions.length; i++) {
    const inst = instructions[i];

    // Only consider branch instructions with valid targets
    if (!inst.isBranch || inst.branchTarget === undefined) {
      continue;
    }

    // Exclude BL/BLX (branch-and-link) - these are function calls, not loops!
    const mnem = inst.mnemonic.toLowerCase();
    if (mnem === 'bl' || mnem === 'bl.w' || mnem === 'blx' || mnem === 'blx.w') {
      continue;
    }

    // Only detect loops from CONDITIONAL backward branches
    // Unconditional backward branches (b) are usually function tails, not loops
    const isConditional = mnem.startsWith('b') && mnem !== 'b' && mnem !== 'b.w';
    if (!isConditional) {
      continue;
    }

    // Back edge: target address < source address
    if (inst.branchTarget < inst.address) {
      const headerAddress = inst.branchTarget;
      const backEdgeAddress = inst.address;
      const headerLine = addressToLine.get(headerAddress);

      // Header must be in visible range
      if (headerLine === undefined) {
        continue;
      }

      // Skip if loop is too small (less than 3 instructions) - probably false positive
      // Real loops have at least: [header] [body] [back-edge]
      if (i - headerLine < 3) {
        continue;
      }

      // Validate loop structure: look for comparison before conditional branch
      // Real loops usually have CMP/TST/CBZ/CBNZ near the back edge
      let hasComparison = false;
      for (let j = Math.max(headerLine, i - 3); j < i; j++) {
        const checkMnem = instructions[j].mnemonic.toLowerCase();
        if (checkMnem === 'cmp' || checkMnem === 'tst' ||
            checkMnem === 'cbz' || checkMnem === 'cbnz' ||
            checkMnem === 'subs' || checkMnem === 'adds') {
          hasComparison = true;
          break;
        }
      }

      if (!hasComparison) {
        console.log(`[Loop Detection] Skipping potential loop at 0x${headerAddress.toString(16)} - no comparison found`);
        continue;
      }

      // Classify loop type
      const loopType = classifyLoopType(instructions, i, headerLine);

      // Find loop entry point (may be before header for while loops)
      const entryAddress = findLoopEntry(instructions, headerLine, i);

      // Identify all instructions in loop body
      const loopBody = identifyLoopBody(instructions, headerLine, i);

      console.log(`[Loop Detection] Found loop: header=0x${headerAddress.toString(16)} backEdge=0x${backEdgeAddress.toString(16)} size=${loopBody.size} type=${loopType}`);

      loops.push({
        headerAddress,
        entryAddress,
        backEdgeAddress,
        backEdgeTarget: inst.branchTarget,
        type: loopType,
        headerLine,
        backEdgeLine: i,
        nestingLevel: 0, // Will be calculated later
        loopBody,
      });
    }
  }

  // Calculate nesting depth
  calculateNestingDepth(loops);

  // Sort by nesting depth (outermost first) for rendering
  loops.sort((a, b) => a.nestingLevel - b.nestingLevel);

  return loops;
}

/**
 * Classify loop type based on instruction structure
 */
function classifyLoopType(
  instructions: DisassembledInstruction[],
  backEdgeLine: number,
  headerLine: number
): LoopType {
  const backEdgeInst = instructions[backEdgeLine];
  const headerInst = instructions[headerLine];

  // Check if back edge is unconditional branch
  const isUnconditional = backEdgeInst.mnemonic.toLowerCase() === 'b';

  // Infinite loop: unconditional branch to self or very close address
  if (isUnconditional && Math.abs(backEdgeLine - headerLine) <= 2) {
    return 'infinite';
  }

  // Do-while: conditional branch at end, no comparison at header
  if (!isUnconditional) {
    const headerMnem = headerInst.mnemonic.toLowerCase();
    const isHeaderComparison = headerMnem === 'cmp' || headerMnem === 'tst' ||
                                headerMnem === 'cbz' || headerMnem === 'cbnz';

    if (!isHeaderComparison) {
      return 'do-while';
    }
  }

  // While: comparison at header, conditional branch at end
  const headerMnem = headerInst.mnemonic.toLowerCase();
  if (headerMnem === 'cmp' || headerMnem === 'tst' ||
      headerMnem === 'cbz' || headerMnem === 'cbnz') {
    return 'while';
  }

  // For: complex loop with counter variable (heuristic)
  // Look for patterns like: ADD/SUB followed by CMP in loop
  for (let i = headerLine; i <= backEdgeLine; i++) {
    const inst = instructions[i];
    const mnem = inst.mnemonic.toLowerCase();
    if ((mnem === 'add' || mnem === 'sub') && i + 1 <= backEdgeLine) {
      const nextMnem = instructions[i + 1].mnemonic.toLowerCase();
      if (nextMnem === 'cmp') {
        return 'for';
      }
    }
  }

  // Default to while loop
  return 'while';
}

/**
 * Find the entry point of the loop (may be before header for pre-test loops)
 */
function findLoopEntry(
  instructions: DisassembledInstruction[],
  headerLine: number,
  backEdgeLine: number
): number {
  // For while loops, entry might be a branch before the header
  if (headerLine > 0) {
    const prevInst = instructions[headerLine - 1];
    if (prevInst.isBranch && prevInst.branchTarget !== undefined) {
      // Check if this branches into the loop
      if (prevInst.branchTarget > instructions[headerLine].address &&
          prevInst.branchTarget <= instructions[backEdgeLine].address) {
        return prevInst.address;
      }
    }
  }

  // Default to header address
  return instructions[headerLine].address;
}

/**
 * Identify all instructions in the loop body
 */
function identifyLoopBody(
  instructions: DisassembledInstruction[],
  headerLine: number,
  backEdgeLine: number
): Set<number> {
  const loopBody = new Set<number>();

  // All instructions from header to back edge are in the loop
  for (let i = headerLine; i <= backEdgeLine; i++) {
    loopBody.add(instructions[i].address);
  }

  return loopBody;
}

/**
 * Calculate nesting depth for all loops
 *
 * A loop is nested inside another if its body is a subset of the outer loop's body.
 */
function calculateNestingDepth(loops: LoopInfo[]): void {
  // Sort by loop size (larger loops first - these are outer loops)
  const sortedLoops = [...loops].sort((a, b) => b.loopBody.size - a.loopBody.size);

  for (const loop of sortedLoops) {
    let maxOuterDepth = 0;

    // Find the deepest loop that contains this loop
    for (const otherLoop of sortedLoops) {
      if (otherLoop === loop) continue;

      // Check if this loop is contained in otherLoop
      const isContained = isSubset(loop.loopBody, otherLoop.loopBody);
      if (isContained) {
        maxOuterDepth = Math.max(maxOuterDepth, otherLoop.nestingLevel);
      }
    }

    loop.nestingLevel = maxOuterDepth + 1;
  }
}

/**
 * Check if set A is a subset of set B
 */
function isSubset<T>(setA: Set<T>, setB: Set<T>): boolean {
  for (const elem of setA) {
    if (!setB.has(elem)) {
      return false;
    }
  }
  return true;
}

/**
 * Generate rendering information for each line
 *
 * @param instructions - Array of disassembled instructions
 * @param loops - Array of detected loops
 * @returns Map of line index to rendering information
 */
export function generateLoopLines(
  instructions: DisassembledInstruction[],
  loops: LoopInfo[]
): Map<number, LoopLineInfo> {
  const lineInfo = new Map<number, LoopLineInfo>();

  // Determine maximum nesting depth for column allocation
  const maxDepth = loops.reduce((max, loop) => Math.max(max, loop.nestingLevel), 0);

  // Initialize all lines with empty columns
  for (let i = 0; i < instructions.length; i++) {
    lineInfo.set(i, {
      columns: Array(maxDepth).fill('empty' as LoopCharType),
      activeLoops: [],
    });
  }

  // For each loop, render its contribution to each line
  for (const loop of loops) {
    const columnIndex = loop.nestingLevel - 1; // 0-indexed

    for (let i = 0; i < instructions.length; i++) {
      const address = instructions[i].address;
      const info = lineInfo.get(i)!;

      // Determine character for this position
      let charType: LoopCharType = 'empty';

      if (i === loop.headerLine) {
        // Loop header - show entry point
        charType = 'top';
        info.activeLoops.push(loop.nestingLevel);
      } else if (i === loop.backEdgeLine) {
        // Back edge - show loop back
        charType = 'bottom';
        info.activeLoops.push(loop.nestingLevel);
      } else if (loop.loopBody.has(address)) {
        // Inside loop body - check if there's a branch out
        const inst = instructions[i];
        if (inst.isBranch && inst.branchTarget !== undefined) {
          // Branch inside loop
          if (!loop.loopBody.has(inst.branchTarget)) {
            // Branch exits loop
            charType = 'branch';
          } else {
            // Internal branch within loop
            charType = 'vertical';
          }
        } else {
          // Regular instruction in loop
          charType = 'vertical';
        }
        info.activeLoops.push(loop.nestingLevel);
      }

      // Set character in appropriate column
      if (charType !== 'empty') {
        info.columns[columnIndex] = charType;
      }
    }
  }

  return lineInfo;
}
