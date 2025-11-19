/**
 * ARM/Thumb Instruction Disassembler
 *
 * Provides disassembly for ARM Cortex-M instructions (Thumb and Thumb-2).
 * This is a simplified disassembler focused on the most common instructions
 * found in embedded ARM Cortex-M code.
 */

/**
 * Represents a single disassembled instruction
 */
export interface DisassembledInstruction {
  address: number;
  bytes: Uint8Array;
  mnemonic: string;
  operands: string;
  size: number; // 2 or 4 bytes
  isBranch: boolean;
  branchTarget?: number;
  comment?: string;
}

/**
 * ARM Register names for Cortex-M
 */
const REGISTER_NAMES = [
  'r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7',
  'r8', 'r9', 'r10', 'r11', 'r12', 'sp', 'lr', 'pc'
];

/**
 * Condition codes for ARM instructions
 */
const CONDITIONS = [
  'eq', 'ne', 'cs', 'cc', 'mi', 'pl', 'vs', 'vc',
  'hi', 'ls', 'ge', 'lt', 'gt', 'le', '', 'nv'
];

/**
 * ARM/Thumb Disassembler
 *
 * This class provides disassembly for ARM Cortex-M processors which
 * primarily use Thumb and Thumb-2 instruction sets.
 */
export class ArmDisassembler {
  private littleEndian: boolean = true;

  constructor(littleEndian: boolean = true) {
    this.littleEndian = littleEndian;
  }

  /**
   * Disassemble a block of memory
   *
   * @param data Memory data to disassemble
   * @param baseAddress Starting address of the memory block
   * @param isThumb Whether to interpret as Thumb instructions (usually true for Cortex-M)
   * @returns Array of disassembled instructions
   */
  disassemble(
    data: Uint8Array,
    baseAddress: number,
    isThumb: boolean = true
  ): DisassembledInstruction[] {
    const instructions: DisassembledInstruction[] = [];
    let offset = 0;

    while (offset < data.length) {
      if (isThumb) {
        const inst = this.disassembleThumb(data, offset, baseAddress + offset);
        instructions.push(inst);
        offset += inst.size;
      } else {
        // ARM mode (not typically used in Cortex-M)
        const inst = this.disassembleArm(data, offset, baseAddress + offset);
        instructions.push(inst);
        offset += 4; // ARM instructions are always 4 bytes
      }
    }

    return instructions;
  }

  /**
   * Read a 16-bit value from memory
   */
  private read16(data: Uint8Array, offset: number): number {
    if (offset + 1 >= data.length) return 0;

    if (this.littleEndian) {
      return data[offset] | (data[offset + 1] << 8);
    } else {
      return (data[offset] << 8) | data[offset + 1];
    }
  }

  /**
   * Read a 32-bit value from memory
   */
  private read32(data: Uint8Array, offset: number): number {
    if (offset + 3 >= data.length) return 0;

    if (this.littleEndian) {
      return data[offset] |
             (data[offset + 1] << 8) |
             (data[offset + 2] << 16) |
             (data[offset + 3] << 24);
    } else {
      return (data[offset] << 24) |
             (data[offset + 1] << 16) |
             (data[offset + 2] << 8) |
             data[offset + 3];
    }
  }

  /**
   * Disassemble a single Thumb/Thumb-2 instruction
   */
  private disassembleThumb(data: Uint8Array, offset: number, address: number): DisassembledInstruction {
    const firstHalf = this.read16(data, offset);

    // Check if this is a 32-bit Thumb-2 instruction
    const isThumb2 = ((firstHalf & 0xF800) >= 0xE800);

    if (isThumb2 && offset + 3 < data.length) {
      const secondHalf = this.read16(data, offset + 2);
      const inst32 = (firstHalf << 16) | secondHalf;
      return this.decodeThumb32(inst32, address, data.slice(offset, offset + 4));
    } else {
      return this.decodeThumb16(firstHalf, address, data.slice(offset, offset + 2));
    }
  }

  /**
   * Decode a 16-bit Thumb instruction
   */
  private decodeThumb16(inst: number, address: number, bytes: Uint8Array): DisassembledInstruction {
    let mnemonic = '';
    let operands = '';
    let isBranch = false;
    let branchTarget: number | undefined;

    // Extract common fields
    const rd = inst & 0x7;
    const rn = (inst >> 3) & 0x7;
    const rm = (inst >> 6) & 0x7;
    const imm3 = (inst >> 6) & 0x7;
    const imm5 = (inst >> 6) & 0x1F;
    const imm8 = inst & 0xFF;

    // Decode based on instruction pattern
    if ((inst & 0xF800) === 0x0000) {
      // LSL immediate
      if (imm5 === 0) {
        mnemonic = 'movs';
        operands = `${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rn]}`;
      } else {
        mnemonic = 'lsls';
        operands = `${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rn]}, #${imm5}`;
      }
    } else if ((inst & 0xF800) === 0x0800) {
      // LSR immediate
      mnemonic = 'lsrs';
      operands = `${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rn]}, #${imm5 || 32}`;
    } else if ((inst & 0xF800) === 0x1000) {
      // ASR immediate
      mnemonic = 'asrs';
      operands = `${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rn]}, #${imm5 || 32}`;
    } else if ((inst & 0xFE00) === 0x1800) {
      // ADD register
      mnemonic = 'adds';
      operands = `${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rn]}, ${REGISTER_NAMES[rm]}`;
    } else if ((inst & 0xFE00) === 0x1A00) {
      // SUB register
      mnemonic = 'subs';
      operands = `${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rn]}, ${REGISTER_NAMES[rm]}`;
    } else if ((inst & 0xFE00) === 0x1C00) {
      // ADD immediate 3-bit
      mnemonic = 'adds';
      operands = `${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rn]}, #${imm3}`;
    } else if ((inst & 0xFE00) === 0x1E00) {
      // SUB immediate 3-bit
      mnemonic = 'subs';
      operands = `${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rn]}, #${imm3}`;
    } else if ((inst & 0xF800) === 0x2000) {
      // MOV immediate
      const rd8 = (inst >> 8) & 0x7;
      mnemonic = 'movs';
      operands = `${REGISTER_NAMES[rd8]}, #${imm8}`;
    } else if ((inst & 0xF800) === 0x2800) {
      // CMP immediate
      const rn8 = (inst >> 8) & 0x7;
      mnemonic = 'cmp';
      operands = `${REGISTER_NAMES[rn8]}, #${imm8}`;
    } else if ((inst & 0xF800) === 0x3000) {
      // ADD immediate 8-bit
      const rd8 = (inst >> 8) & 0x7;
      mnemonic = 'adds';
      operands = `${REGISTER_NAMES[rd8]}, #${imm8}`;
    } else if ((inst & 0xF800) === 0x3800) {
      // SUB immediate 8-bit
      const rd8 = (inst >> 8) & 0x7;
      mnemonic = 'subs';
      operands = `${REGISTER_NAMES[rd8]}, #${imm8}`;
    } else if ((inst & 0xFFC0) === 0x4140) {
      // ADC register
      mnemonic = 'adcs';
      operands = `${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rm]}`;
    } else if ((inst & 0xFF00) === 0x4600) {
      // MOV high register
      const rdHi = ((inst >> 4) & 0x8) | (inst & 0x7);
      const rmHi = (inst >> 3) & 0xF;
      mnemonic = 'mov';
      operands = `${REGISTER_NAMES[rdHi]}, ${REGISTER_NAMES[rmHi]}`;
    } else if ((inst & 0xFF00) === 0x4700) {
      // BX
      const rm = (inst >> 3) & 0xF;
      mnemonic = 'bx';
      operands = REGISTER_NAMES[rm];
      isBranch = true;
    } else if ((inst & 0xF800) === 0x4800) {
      // LDR literal
      const rt = (inst >> 8) & 0x7;
      const imm = (imm8 << 2);
      const target = (address & ~3) + 4 + imm;
      mnemonic = 'ldr';
      operands = `${REGISTER_NAMES[rt]}, [pc, #${imm}]`;
      branchTarget = target;
    } else if ((inst & 0xF800) === 0x6000) {
      // STR immediate
      const imm = imm5 << 2;
      mnemonic = 'str';
      operands = `${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rn]}, #${imm}]`;
    } else if ((inst & 0xF800) === 0x6800) {
      // LDR immediate
      const imm = imm5 << 2;
      mnemonic = 'ldr';
      operands = `${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rn]}, #${imm}]`;
    } else if ((inst & 0xF800) === 0x7000) {
      // STRB immediate
      mnemonic = 'strb';
      operands = `${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rn]}, #${imm5}]`;
    } else if ((inst & 0xF800) === 0x7800) {
      // LDRB immediate
      mnemonic = 'ldrb';
      operands = `${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rn]}, #${imm5}]`;
    } else if ((inst & 0xF800) === 0x8000) {
      // STRH immediate
      const imm = imm5 << 1;
      mnemonic = 'strh';
      operands = `${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rn]}, #${imm}]`;
    } else if ((inst & 0xF800) === 0x8800) {
      // LDRH immediate
      const imm = imm5 << 1;
      mnemonic = 'ldrh';
      operands = `${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rn]}, #${imm}]`;
    } else if ((inst & 0xF800) === 0x9000) {
      // STR SP-relative
      const rt = (inst >> 8) & 0x7;
      const imm = imm8 << 2;
      mnemonic = 'str';
      operands = `${REGISTER_NAMES[rt]}, [sp, #${imm}]`;
    } else if ((inst & 0xF800) === 0x9800) {
      // LDR SP-relative
      const rt = (inst >> 8) & 0x7;
      const imm = imm8 << 2;
      mnemonic = 'ldr';
      operands = `${REGISTER_NAMES[rt]}, [sp, #${imm}]`;
    } else if ((inst & 0xF800) === 0xA000) {
      // ADD PC-relative
      const rd8 = (inst >> 8) & 0x7;
      const imm = imm8 << 2;
      mnemonic = 'add';
      operands = `${REGISTER_NAMES[rd8]}, pc, #${imm}`;
    } else if ((inst & 0xF800) === 0xA800) {
      // ADD SP-relative
      const rd8 = (inst >> 8) & 0x7;
      const imm = imm8 << 2;
      mnemonic = 'add';
      operands = `${REGISTER_NAMES[rd8]}, sp, #${imm}`;
    } else if ((inst & 0xFF00) === 0xB000) {
      // ADD/SUB SP immediate
      const imm = (imm8 & 0x7F) << 2;
      if (inst & 0x80) {
        mnemonic = 'sub';
      } else {
        mnemonic = 'add';
      }
      operands = `sp, sp, #${imm}`;
    } else if ((inst & 0xFF00) === 0xB200) {
      // SXTH, SXTB, UXTH, UXTB
      const op = (inst >> 6) & 0x3;
      const mnemonics = ['sxth', 'sxtb', 'uxth', 'uxtb'];
      mnemonic = mnemonics[op];
      operands = `${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rm]}`;
    } else if ((inst & 0xF800) === 0xB800) {
      // POP
      mnemonic = 'pop';
      const regs = this.getRegisterList(imm8 | ((inst & 0x100) ? 0x8000 : 0));
      operands = `{${regs}}`;
    } else if ((inst & 0xF800) === 0xB000 && (inst & 0x0600) === 0x400) {
      // PUSH
      mnemonic = 'push';
      const regs = this.getRegisterList(imm8 | ((inst & 0x100) ? 0x4000 : 0));
      operands = `{${regs}}`;
    } else if ((inst & 0xF000) === 0xD000) {
      // Conditional branch
      const cond = (inst >> 8) & 0xF;
      if (cond < 14) {
        const offset = this.signExtend8(imm8) << 1;
        mnemonic = `b${CONDITIONS[cond]}`;
        branchTarget = address + 4 + offset;
        operands = `#0x${branchTarget.toString(16)}`;
        isBranch = true;
      } else if (cond === 14) {
        // UDF (Undefined)
        mnemonic = 'udf';
        operands = `#${imm8}`;
      } else {
        // SVC
        mnemonic = 'svc';
        operands = `#${imm8}`;
      }
    } else if ((inst & 0xF800) === 0xE000) {
      // Unconditional branch
      const offset = this.signExtend11(inst & 0x7FF) << 1;
      mnemonic = 'b';
      branchTarget = address + 4 + offset;
      operands = `#0x${branchTarget.toString(16)}`;
      isBranch = true;
    } else {
      // Unknown instruction
      mnemonic = '.word';
      operands = `0x${inst.toString(16).padStart(4, '0')}`;
    }

    return {
      address,
      bytes,
      mnemonic,
      operands,
      size: 2,
      isBranch,
      branchTarget,
    };
  }

  /**
   * Decode a 32-bit Thumb-2 instruction
   */
  private decodeThumb32(inst: number, address: number, bytes: Uint8Array): DisassembledInstruction {
    let mnemonic = '';
    let operands = '';
    let isBranch = false;
    let branchTarget: number | undefined;

    const op1 = (inst >> 27) & 0x3;
    const op2 = (inst >> 20) & 0x7F;
    // const op = (inst >> 15) & 0x1;  // Currently unused

    // Common field extractions
    const rn = (inst >> 16) & 0xF;
    const rd = (inst >> 8) & 0xF;
    // const rm = inst & 0xF;  // Currently unused
    const imm12 = inst & 0xFFF;
    const imm8 = inst & 0xFF;

    if (op1 === 2) {
      if ((op2 & 0x64) === 0x20) {
        // BL/BLX
        const s = (inst >> 26) & 1;
        const j1 = (inst >> 13) & 1;
        const j2 = (inst >> 11) & 1;
        const i1 = (j1 ^ s) ^ 1;
        const i2 = (j2 ^ s) ^ 1;
        const imm10 = (inst >> 16) & 0x3FF;
        const imm11 = inst & 0x7FF;

        let offset = (s ? -1 << 24 : 0) |
                     (i1 << 23) | (i2 << 22) |
                     (imm10 << 12) | (imm11 << 1);

        // Sign extend if necessary
        if (s) {
          offset |= 0xFF000000;
        }

        mnemonic = 'bl';
        branchTarget = address + 4 + offset;
        operands = `#0x${branchTarget.toString(16)}`;
        isBranch = true;
      } else if ((inst & 0xFFD02000) === 0xE8900000) {
        // LDMIA/LDMDB
        const w = (inst >> 21) & 1;
        const reglist = inst & 0xFFFF;
        mnemonic = w ? 'ldmia!' : 'ldmia';
        operands = `${REGISTER_NAMES[rn]}, {${this.getRegisterList(reglist)}}`;
      } else if ((inst & 0xFFD02000) === 0xE8800000) {
        // STMIA/STMDB
        const w = (inst >> 21) & 1;
        const reglist = inst & 0xFFFF;
        mnemonic = w ? 'stmia!' : 'stmia';
        operands = `${REGISTER_NAMES[rn]}, {${this.getRegisterList(reglist)}}`;
      } else if ((inst & 0xFFF00000) === 0xF8500000) {
        // LDR immediate
        const imm = imm12;
        const u = (inst >> 23) & 1;
        const index = (inst >> 10) & 1;
        const wback = (inst >> 8) & 1;

        if (index) {
          if (wback) {
            mnemonic = 'ldr';
            operands = `${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rn]}, #${u ? '' : '-'}${imm}]!`;
          } else {
            mnemonic = 'ldr';
            operands = `${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rn]}, #${u ? '' : '-'}${imm}]`;
          }
        } else {
          mnemonic = 'ldr';
          operands = `${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rn]}], #${u ? '' : '-'}${imm}`;
        }
      } else if ((inst & 0xFFF00000) === 0xF8400000) {
        // STR immediate
        const imm = imm12;
        const u = (inst >> 23) & 1;
        const index = (inst >> 10) & 1;
        const wback = (inst >> 8) & 1;

        if (index) {
          if (wback) {
            mnemonic = 'str';
            operands = `${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rn]}, #${u ? '' : '-'}${imm}]!`;
          } else {
            mnemonic = 'str';
            operands = `${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rn]}, #${u ? '' : '-'}${imm}]`;
          }
        } else {
          mnemonic = 'str';
          operands = `${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rn]}], #${u ? '' : '-'}${imm}`;
        }
      }
    } else if (op1 === 3) {
      if ((op2 & 0x71) === 0x00) {
        // Data processing (modified immediate)
        const op = (inst >> 21) & 0xF;
        const s = (inst >> 20) & 1;
        const i = (inst >> 26) & 1;
        const imm3 = (inst >> 12) & 0x7;
        const imm = this.expandImmediate((i << 11) | (imm3 << 8) | imm8);

        const ops = ['and', 'bic', 'orr', 'orn', 'eor', '', '', '',
                     'add', '', 'adc', 'sbc', '', '', 'sub', 'rsb'];
        const opNames = ['tst', '', '', '', 'teq', '', '', '',
                        'cmn', '', '', '', '', '', 'cmp', ''];

        if (rd === 15 && s) {
          // Test instructions
          mnemonic = opNames[op];
          operands = `${REGISTER_NAMES[rn]}, #${imm}`;
        } else {
          mnemonic = ops[op] + (s ? 's' : '');
          if (op === 0x0D || op === 0x0F) {
            // CMP/CMN
            operands = `${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rn]}, #${imm}`;
          } else if (op === 0x04 || op === 0x08) {
            // MOV/ADD with no Rn
            operands = `${REGISTER_NAMES[rd]}, #${imm}`;
          } else {
            operands = `${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rn]}, #${imm}`;
          }
        }
      } else if ((op2 & 0x78) === 0x30) {
        // MOV immediate
        const i = (inst >> 26) & 1;
        const imm4 = (inst >> 16) & 0xF;
        const imm3 = (inst >> 12) & 0x7;
        const imm = (imm4 << 12) | (i << 11) | (imm3 << 8) | imm8;

        if ((inst & 0xFBF08000) === 0xF2400000) {
          mnemonic = 'movw';
        } else if ((inst & 0xFBF08000) === 0xF2C00000) {
          mnemonic = 'movt';
        } else {
          mnemonic = 'mov';
        }
        operands = `${REGISTER_NAMES[rd]}, #${imm}`;
      }
    }

    // If we couldn't decode it, mark as data
    if (!mnemonic) {
      mnemonic = '.dword';
      operands = `0x${inst.toString(16).padStart(8, '0')}`;
    }

    return {
      address,
      bytes,
      mnemonic,
      operands,
      size: 4,
      isBranch,
      branchTarget,
    };
  }

  /**
   * Disassemble ARM instruction (32-bit, not typically used in Cortex-M)
   */
  private disassembleArm(data: Uint8Array, offset: number, address: number): DisassembledInstruction {
    const inst = this.read32(data, offset);

    // For now, just return as data word
    return {
      address,
      bytes: data.slice(offset, offset + 4),
      mnemonic: '.word',
      operands: `0x${inst.toString(16).padStart(8, '0')}`,
      size: 4,
      isBranch: false,
    };
  }

  /**
   * Sign extend an 8-bit value
   */
  private signExtend8(value: number): number {
    if (value & 0x80) {
      return value | 0xFFFFFF00;
    }
    return value;
  }

  /**
   * Sign extend an 11-bit value
   */
  private signExtend11(value: number): number {
    if (value & 0x400) {
      return value | 0xFFFFF800;
    }
    return value;
  }

  /**
   * Expand a Thumb-2 modified immediate
   */
  private expandImmediate(imm12: number): number {
    const rot = (imm12 >> 7) & 0x1F;
    const imm = imm12 & 0x7F;

    if (rot === 0) {
      return imm;
    }

    // Rotate
    const expanded = imm | 0x80;
    return (expanded >> rot) | (expanded << (32 - rot));
  }

  /**
   * Convert register list bitmap to string
   */
  private getRegisterList(bitmap: number): string {
    const regs: string[] = [];
    let rangeStart = -1;

    for (let i = 0; i < 16; i++) {
      if (bitmap & (1 << i)) {
        if (rangeStart === -1) {
          rangeStart = i;
        }
      } else if (rangeStart !== -1) {
        if (rangeStart === i - 1) {
          regs.push(REGISTER_NAMES[rangeStart]);
        } else if (rangeStart === i - 2) {
          regs.push(REGISTER_NAMES[rangeStart]);
          regs.push(REGISTER_NAMES[i - 1]);
        } else {
          regs.push(`${REGISTER_NAMES[rangeStart]}-${REGISTER_NAMES[i - 1]}`);
        }
        rangeStart = -1;
      }
    }

    // Handle the last range
    if (rangeStart !== -1) {
      if (rangeStart === 15) {
        regs.push(REGISTER_NAMES[rangeStart]);
      } else if (rangeStart === 14) {
        regs.push(REGISTER_NAMES[rangeStart]);
        regs.push(REGISTER_NAMES[15]);
      } else {
        regs.push(`${REGISTER_NAMES[rangeStart]}-${REGISTER_NAMES[15]}`);
      }
    }

    return regs.join(', ');
  }

  /**
   * Format an instruction for display
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
   * Check if an address is likely a function entry point
   * (heuristic based on common patterns)
   */
  isFunctionEntry(instructions: DisassembledInstruction[], index: number): boolean {
    if (index >= instructions.length) return false;

    const inst = instructions[index];

    // Check if this instruction is targeted by branches
    for (let i = Math.max(0, index - 20); i < Math.min(instructions.length, index + 20); i++) {
      if (i === index) continue;
      const other = instructions[i];
      if (other.isBranch && other.branchTarget === inst.address) {
        // Check if it's a BL (function call)
        if (other.mnemonic === 'bl' || other.mnemonic === 'blx') {
          return true;
        }
      }
    }

    // Check for common function prologue patterns
    if (inst.mnemonic === 'push' && inst.operands.includes('lr')) {
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
   * Analyze control flow and find branch targets
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
}