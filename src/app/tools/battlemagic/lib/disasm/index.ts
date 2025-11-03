/**
 * ARM/Thumb Disassembler Module
 *
 * Exports both ArmDisassembler and CapstoneDisassembler implementations.
 * Use CapstoneDisassembler for production-quality disassembly.
 * Use ArmDisassembler for quick prototyping or educational purposes.
 */

// Export the shared interface
export type { DisassembledInstruction } from './ArmDisassembler';

// Export the lightweight custom disassembler
export { ArmDisassembler } from './ArmDisassembler';

// Export the Capstone-based disassembler (recommended for production)
export { CapstoneDisassembler, createCapstoneDisassembler } from './CapstoneDisassembler';

/**
 * Quick reference:
 *
 * ArmDisassembler:
 *   - Lightweight (~20KB)
 *   - Instant initialization
 *   - Synchronous API
 *   - ~30 common instructions
 *   - Good for prototyping
 *
 * CapstoneDisassembler:
 *   - Industry-standard disassembly
 *   - Complete Thumb/Thumb-2 coverage
 *   - Async initialization (~150ms)
 *   - Asynchronous API
 *   - Production-quality
 *
 * Example Usage:
 *
 * // ArmDisassembler (simple)
 * import { ArmDisassembler } from './lib/disasm';
 * const disasm = new ArmDisassembler();
 * const instructions = disasm.disassemble(data, 0x08000000);
 *
 * // CapstoneDisassembler (recommended)
 * import { createCapstoneDisassembler } from './lib/disasm';
 * const disasm = await createCapstoneDisassembler();
 * const instructions = await disasm.disassemble(data, 0x08000000);
 * disasm.dispose(); // cleanup when done
 */
