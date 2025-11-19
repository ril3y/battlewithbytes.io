/**
 * Instruction analysis utilities
 *
 * Pure functions for analyzing ARM instruction properties
 * including color coding and function boundary detection.
 */

import type { DisassembledInstruction } from '../../../lib/arch/arm/disasm';

/**
 * Get color class for instruction based on type
 * @param inst - Disassembled instruction to analyze
 * @returns Tailwind color class string
 */
export function getInstructionColor(inst: DisassembledInstruction): string {
  const mnem = inst.mnemonic.toLowerCase();

  // Branches and jumps
  if (mnem === 'bx' && inst.operands?.toLowerCase() === 'lr') return 'text-orange-300'; // Return
  if (mnem.startsWith('bl')) return 'text-orange-400'; // Function calls
  if (mnem.startsWith('b')) return 'text-yellow-400'; // Branches

  // Memory operations
  if (mnem.includes('ldr') || mnem.includes('str')) return 'text-blue-400';

  // Stack operations
  if (mnem.includes('push') || mnem.includes('pop')) return 'text-purple-400';
  if (mnem.includes('stm') || mnem.includes('ldm')) return 'text-purple-300';

  // Arithmetic
  if (mnem.includes('add') || mnem.includes('sub') || mnem.includes('mul')) return 'text-cyan-400';

  // Comparisons
  if (mnem.includes('cmp') || mnem.includes('tst')) return 'text-pink-400';

  // Move operations
  if (mnem.includes('mov')) return 'text-green-400';

  // Data directives
  if (mnem.startsWith('.')) return 'text-gray-500';

  // System instructions
  if (mnem === 'svc' || mnem === 'bkpt' || mnem === 'udf') return 'text-red-400';

  return 'text-gray-300'; // Default
}

/**
 * Detect if instruction marks the end of a function (return instruction)
 * @param instruction - Disassembled instruction to check
 * @returns True if this is a function-ending instruction
 */
export function isFunctionEnd(instruction: DisassembledInstruction): boolean {
  const mnemonic = instruction.mnemonic.toLowerCase();
  const operands = instruction.operands?.toLowerCase() || '';

  return (
    (mnemonic === 'bx' && operands.includes('lr')) ||
    (mnemonic === 'pop' && operands.includes('pc')) ||
    mnemonic === 'ret'
  );
}
