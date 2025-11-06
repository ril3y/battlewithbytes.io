/**
 * Capstone-based ARM/Thumb Disassembler
 *
 * Provides robust disassembly using the Capstone disassembly engine.
 * This is a drop-in replacement for ArmDisassembler with superior instruction coverage.
 *
 * Architecture:
 * - Uses Capstone.js v3.0.5 (WebAssembly-based disassembly engine)
 * - Implements same interface as ArmDisassembler for compatibility
 * - Handles ARM Cortex-M Thumb/Thumb-2 instruction sets
 * - Detects all branch instructions and calculates PC-relative targets
 * - Lazy initialization to avoid blocking initial page load
 *
 * Usage:
 *   const disasm = new CapstoneDisassembler();
 *   await disasm.initialize();
 *   const instructions = await disasm.disassemble(data, baseAddress);
 *
 * Branch Detection:
 *   All branch instructions (B, BL, BX, BNE, BEQ, CBZ, etc.) are marked as isBranch=true
 *   PC-relative branches have their branchTarget calculated automatically
 */

import type { DisassembledInstruction } from './ArmDisassembler';

// Capstone types (dynamic import - typing not available)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Capstone = any; // Will be loaded dynamically
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CapstoneInstruction = any;

/**
 * ARM branch instruction mnemonics
 * Used to classify instructions as branches
 */
const ARM_BRANCH_MNEMONICS = new Set([
  'b', 'bl', 'bx', 'blx', 'bxj',
  'beq', 'bne', 'bcs', 'bhs', 'bcc', 'blo',
  'bmi', 'bpl', 'bvs', 'bvc', 'bhi', 'bls',
  'bge', 'blt', 'bgt', 'ble', 'bal',
  'b.w', 'bl.w',
  'cbz', 'cbnz', 'tbb', 'tbh'
]);

/**
 * ARM return instruction patterns
 * BX LR, POP {..., PC}, MOV PC, LR
 */
const isReturnInstruction = (mnemonic: string, operands: string): boolean => {
  const mnLower = mnemonic.toLowerCase();
  const opLower = operands.toLowerCase();

  // BX LR or BLX LR
  if ((mnLower === 'bx' || mnLower === 'blx') && opLower.includes('lr')) {
    return true;
  }

  // POP with PC in register list
  if (mnLower === 'pop' && opLower.includes('pc')) {
    return true;
  }

  // MOV PC, LR
  if (mnLower === 'mov' && opLower.includes('pc') && opLower.includes('lr')) {
    return true;
  }

  return false;
};

/**
 * CapstoneDisassembler - Capstone-based ARM disassembler
 *
 * Provides high-quality ARM/Thumb disassembly using the Capstone engine.
 * Must be initialized asynchronously before use.
 */
export class CapstoneDisassembler {
  private capstone: Capstone | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cs: any = null; // Capstone API object
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private littleEndian: boolean;

  constructor(littleEndian: boolean = true) {
    this.littleEndian = littleEndian;
  }

  /**
   * Initialize the Capstone engine
   *
   * This must be called before disassembly can occur.
   * Uses dynamic import to avoid bloating the main bundle.
   * Safe to call multiple times - will reuse existing initialization.
   *
   * @returns Promise that resolves when initialization is complete
   * @throws Error if Capstone fails to load or initialize
   */
  async initialize(): Promise<void> {
    // Return existing initialization if in progress or complete
    if (this.initPromise) {
      return this.initPromise;
    }

    if (this.isInitialized) {
      return Promise.resolve();
    }

    this.initPromise = (async () => {
      try {
        // Dynamic import to avoid bundle bloat
        // Capstone.js exports MCapstone, and we need to initialize it first
        const capstoneModule = await import('@alexaltea/capstone-js/dist/capstone.min.js');

        // The module exports MCapstone which needs to be initialized
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const MCapstone = (capstoneModule as any).default || capstoneModule;

        // MCapstone is a promise that resolves when WASM is ready
        console.log('[CapstoneDisassembler] Waiting for WebAssembly to initialize...');
        const cs = await MCapstone;

        if (!cs || !cs.Capstone) {
          throw new Error('Capstone module did not initialize properly');
        }

        console.log('[CapstoneDisassembler] WebAssembly module initialized');
        this.cs = cs;

        // Create ARM Thumb disassembler instance
        // ARCH_ARM + MODE_THUMB for ARM Cortex-M processors
        // MODE_MCLASS adds Cortex-M specific instructions
        const mode = cs.MODE_THUMB | cs.MODE_MCLASS | (this.littleEndian ? 0 : cs.MODE_BIG_ENDIAN);
        this.capstone = new cs.Capstone(cs.ARCH_ARM, mode);

        // Enable detailed instruction information
        this.capstone.detail(true);

        this.isInitialized = true;
        console.log('[CapstoneDisassembler] Initialized successfully');
      } catch (err) {
        this.initPromise = null; // Allow retry
        console.error('[CapstoneDisassembler] Initialization failed:', err);
        throw new Error(`Failed to initialize Capstone: ${err}`);
      }
    })();

    return this.initPromise;
  }

  /**
   * Check if the disassembler is ready to use
   */
  isReady(): boolean {
    return this.isInitialized && this.capstone !== null;
  }

  /**
   * Disassemble a block of ARM Thumb code
   *
   * @param data Memory data to disassemble (Uint8Array)
   * @param baseAddress Starting address of the memory block
   * @param isThumb Whether to interpret as Thumb (true) or ARM mode (false)
   * @returns Array of disassembled instructions
   * @throws Error if not initialized or disassembly fails
   */
  async disassemble(
    data: Uint8Array,
    baseAddress: number,
    isThumb: boolean = true
  ): Promise<DisassembledInstruction[]> {
    // Ensure initialized
    if (!this.isReady()) {
      await this.initialize();
    }

    if (!this.capstone) {
      throw new Error('Capstone not initialized');
    }

    // Handle empty data
    if (data.length === 0) {
      return [];
    }

    try {
      // Note: Mode switching is not typically needed for Cortex-M as it's always Thumb
      // If ARM mode is needed, create a new Capstone instance with different mode
      if (!isThumb) {
        console.warn('[CapstoneDisassembler] ARM mode requested but instance is Thumb mode');
        // For ARM mode, we would need to create a new instance with MODE_ARM
        // This is rarely needed for Cortex-M processors
      }

      // Disassemble using Capstone
      const instructions: CapstoneInstruction[] = this.capstone.disasm(data, baseAddress);

      // Convert to our interface
      return this.convertInstructions(instructions, data, baseAddress);
    } catch (err) {
      console.error('[CapstoneDisassembler] Disassembly failed:', err);

      // Graceful fallback: return single instruction showing error
      return [{
        address: baseAddress,
        bytes: data.slice(0, Math.min(4, data.length)),
        mnemonic: '.invalid',
        operands: `; error: ${err}`,
        size: Math.min(4, data.length),
        isBranch: false,
        comment: 'Capstone disassembly failed'
      }];
    }
  }

  /**
   * Convert Capstone instructions to our DisassembledInstruction format
   *
   * @param csInstructions Instructions from Capstone
   * @param originalData Original memory data for byte extraction
   * @param baseAddress Base address for offset calculation
   * @returns Array of DisassembledInstruction objects
   */
  private convertInstructions(
    csInstructions: CapstoneInstruction[],
    originalData: Uint8Array,
    baseAddress: number
  ): DisassembledInstruction[] {
    const results: DisassembledInstruction[] = [];

    for (const csInst of csInstructions) {
      try {
        // Extract instruction bytes
        const offset = csInst.address - baseAddress;
        const size = csInst.size;
        const bytes = originalData.slice(offset, offset + size);

        // Get mnemonic and operands
        const mnemonic = csInst.mnemonic || '.unknown';
        const operands = csInst.op_str || '';

        // Detect if this is a branch instruction
        const isBranch = this.isBranchInstruction(mnemonic, operands);

        // Calculate branch target for PC-relative branches
        let branchTarget: number | undefined = undefined;
        if (isBranch) {
          branchTarget = this.calculateBranchTarget(
            csInst,
            mnemonic,
            operands,
            csInst.address,
            size
          );
        }

        // Add comment for return instructions
        let comment: string | undefined = undefined;
        if (isReturnInstruction(mnemonic, operands)) {
          comment = 'return';
        }

        results.push({
          address: csInst.address,
          bytes,
          mnemonic,
          operands,
          size,
          isBranch,
          branchTarget,
          comment
        });
      } catch (err) {
        console.warn('[CapstoneDisassembler] Error converting instruction:', err);
        // Add placeholder instruction
        results.push({
          address: csInst.address || baseAddress,
          bytes: new Uint8Array([0]),
          mnemonic: '.error',
          operands: '',
          size: 2,
          isBranch: false,
          comment: 'conversion error'
        });
      }
    }

    return results;
  }

  /**
   * Determine if an instruction is a branch
   *
   * @param mnemonic Instruction mnemonic
   * @param _operands Instruction operands (reserved for future use)
   * @returns True if instruction is a branch
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private isBranchInstruction(mnemonic: string, _operands: string): boolean {
    const mnLower = mnemonic.toLowerCase();

    // Check against known branch mnemonics
    if (ARM_BRANCH_MNEMONICS.has(mnLower)) {
      return true;
    }

    // Check for conditional suffixes (e.g., "b.n", "beq.w")
    const mnBase = mnLower.split('.')[0];
    if (ARM_BRANCH_MNEMONICS.has(mnBase)) {
      return true;
    }

    return false;
  }

  /**
   * Calculate branch target address for PC-relative branches
   *
   * For ARM Thumb:
   * - Branch targets are typically provided in operands as immediate values
   * - Capstone may provide absolute or relative offsets
   * - PC is address + 4 for Thumb (instruction + 2 for PC pipeline)
   *
   * @param _csInst Capstone instruction object (reserved for future use)
   * @param _mnemonic Instruction mnemonic (reserved for future use)
   * @param operands Instruction operands string
   * @param address Instruction address
   * @param _size Instruction size (reserved for future use)
   * @returns Branch target address or undefined if cannot be determined
   */
  private calculateBranchTarget(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _csInst: any,
     
    _mnemonic: string,
    operands: string,
    address: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _size: number
  ): number | undefined {
    try {
      // Try to extract target from operands
      // Capstone typically formats branch targets as:
      // - "#0x1234" for absolute addresses
      // - "#0x1234" with relative offset already calculated

      // Look for hex immediate in operands
      const hexMatch = operands.match(/#(?:0x)?([0-9a-fA-F]+)/);
      if (hexMatch) {
        const value = parseInt(hexMatch[1], 16);

        // Check if value looks like an absolute address (>= base address range)
        // Typical ARM flash starts at 0x08000000, RAM at 0x20000000
        if (value >= 0x08000000 || value >= 0x20000000) {
          return value;
        }

        // Otherwise, treat as offset from PC
        // PC for Thumb = current instruction address + 4
        const pc = address + 4;
        return pc + value;
      }

      // For register-based branches (BX, BLX with register), no static target
      if (operands.match(/^r\d+|lr|pc/i)) {
        return undefined;
      }

      // Could not determine target
      return undefined;
    } catch (err) {
      console.warn('[CapstoneDisassembler] Error calculating branch target:', err);
      return undefined;
    }
  }

  /**
   * Format an instruction for display
   *
   * @param inst Disassembled instruction
   * @param showBytes Whether to show instruction bytes
   * @returns Formatted string
   */
  formatInstruction(inst: DisassembledInstruction, showBytes: boolean = true): string {
    const addr = `0x${inst.address.toString(16).padStart(8, '0')}`;
    const bytes = showBytes
      ? Array.from(inst.bytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join(' ')
          .padEnd(12, ' ')
      : '';

    const mnem = inst.mnemonic.padEnd(8, ' ');
    let line = showBytes
      ? `${addr}: ${bytes} ${mnem} ${inst.operands}`
      : `${addr}: ${mnem} ${inst.operands}`;

    if (inst.comment) {
      line += ` ; ${inst.comment}`;
    }

    return line;
  }

  /**
   * Analyze control flow and find branch targets
   *
   * Compatible with ArmDisassembler interface
   *
   * @param instructions Array of disassembled instructions
   * @returns Map of source address to set of target addresses
   */
  analyzeControlFlow(instructions: DisassembledInstruction[]): Map<number, Set<number>> {
    const flowMap = new Map<number, Set<number>>();

    for (const inst of instructions) {
      if (inst.isBranch && inst.branchTarget !== undefined) {
        if (!flowMap.has(inst.address)) {
          flowMap.set(inst.address, new Set());
        }
        flowMap.get(inst.address)!.add(inst.branchTarget);
      }
    }

    return flowMap;
  }

  /**
   * Check if an address is likely a function entry point
   *
   * Compatible with ArmDisassembler interface
   *
   * @param instructions Array of disassembled instructions
   * @param index Index of instruction to check
   * @returns True if instruction appears to be a function entry
   */
  isFunctionEntry(instructions: DisassembledInstruction[], index: number): boolean {
    if (index >= instructions.length) return false;

    const inst = instructions[index];

    // Check if this instruction is targeted by BL (function call)
    for (let i = Math.max(0, index - 20); i < Math.min(instructions.length, index + 20); i++) {
      if (i === index) continue;
      const other = instructions[i];
      if (other.isBranch && other.branchTarget === inst.address) {
        // Check if it's a BL (function call)
        const mnem = other.mnemonic.toLowerCase();
        if (mnem === 'bl' || mnem === 'blx' || mnem === 'bl.w') {
          return true;
        }
      }
    }

    // Check for common function prologue patterns
    const mnem = inst.mnemonic.toLowerCase();
    if (mnem === 'push' && inst.operands.includes('lr')) {
      return true;
    }

    // Check if preceded by alignment padding or data
    if (index > 0) {
      const prev = instructions[index - 1];
      if (prev.mnemonic === '.word' || prev.mnemonic === '.dword') {
        return true;
      }
    }

    return false;
  }

  /**
   * Clean up resources
   *
   * Call this when done with the disassembler to free memory
   */
  dispose(): void {
    if (this.capstone) {
      try {
        this.capstone.close();
      } catch (err) {
        console.warn('[CapstoneDisassembler] Error disposing:', err);
      }
      this.capstone = null;
    }
    this.cs = null;
    this.isInitialized = false;
    this.initPromise = null;
  }
}

/**
 * Create and initialize a Capstone disassembler
 *
 * Convenience function for quick initialization
 *
 * @param littleEndian Whether to use little-endian mode (default true)
 * @returns Initialized CapstoneDisassembler instance
 */
export async function createCapstoneDisassembler(
  littleEndian: boolean = true
): Promise<CapstoneDisassembler> {
  const disasm = new CapstoneDisassembler(littleEndian);
  await disasm.initialize();
  return disasm;
}
