/**
 * Binary Parser Factory
 *
 * Factory pattern implementation for automatic architecture detection
 * and parser instantiation. Provides a single entry point for binary parsing.
 */

import { BinaryParser } from './BinaryParser';
import { ArmBinaryParser } from '../arch/arm/binary';
import { MipsBinaryParser } from './parsers/MipsBinaryParser';
import { RiscVBinaryParser } from './parsers/RiscVBinaryParser';
import {
  Architecture,
  BinaryFormat,
  BinaryParseOptions,
  ParseResult,
  ElfMachine
} from './types';

/**
 * Architecture detection result
 */
interface DetectionResult {
  architecture: Architecture;
  confidence: number; // 0.0 to 1.0
  format: BinaryFormat;
  hints: string[];
}

/**
 * Binary Parser Factory
 *
 * Responsibilities:
 * - Auto-detect architecture from binary content
 * - Instantiate appropriate parser
 * - Provide fallback mechanisms
 * - Support forced architecture selection
 */
export class BinaryParserFactory {
  /**
   * Create a parser for the given binary data
   *
   * @param data Binary data to parse
   * @param options Parsing options
   * @returns Appropriate parser instance
   */
  static async createParser(
    data: Uint8Array,
    options: BinaryParseOptions = {}
  ): Promise<BinaryParser> {
    // If architecture is forced, use it
    if (options.forceArchitecture) {
      return this.createParserForArchitecture(
        options.forceArchitecture,
        data,
        options
      );
    }

    // Auto-detect architecture
    const detection = await this.detectArchitecture(data, options);

    // Log detection result for debugging
    console.log(`Detected architecture: ${detection.architecture} ` +
                `(confidence: ${(detection.confidence * 100).toFixed(1)}%)`);
    if (detection.hints.length > 0) {
      console.log('Detection hints:', detection.hints);
    }

    // Create appropriate parser
    return this.createParserForArchitecture(
      detection.architecture,
      data,
      options
    );
  }

  /**
   * Parse binary file with auto-detection
   *
   * @param data Binary data to parse
   * @param options Parsing options
   * @returns Parse result
   */
  static async parse(
    data: Uint8Array,
    options: BinaryParseOptions = {}
  ): Promise<ParseResult> {
    const parser = await this.createParser(data, options);
    return parser.parse();
  }

  /**
   * Detect architecture from binary content
   */
  private static async detectArchitecture(
    data: Uint8Array,
    options: BinaryParseOptions
  ): Promise<DetectionResult> {
    const hints: string[] = [];
    let format: BinaryFormat = 'RAW';

    // First check for ELF format which contains explicit architecture info
    if (this.isElf(data)) {
      format = 'ELF';
      const elfArch = this.detectElfArchitecture(data);
      if (elfArch !== 'UNKNOWN') {
        hints.push(`ELF header indicates ${elfArch}`);
        return {
          architecture: elfArch,
          confidence: 0.95,
          format,
          hints
        };
      }
    }

    // Check for other formats that might have architecture markers
    const peArch = this.detectPeArchitecture(data);
    if (peArch !== 'UNKNOWN') {
      hints.push(`PE header indicates ${peArch}`);
      return {
        architecture: peArch,
        confidence: 0.95,
        format: 'PE',
        hints
      };
    }

    // For raw binaries, use heuristics
    const scores: Map<Architecture, number> = new Map();

    // Check for ARM patterns
    const armScore = await this.scoreArmPatterns(data, hints);
    scores.set('ARM', armScore);

    // Check for MIPS patterns
    const mipsScore = await this.scoreMipsPatterns(data, hints);
    scores.set('MIPS', mipsScore);

    // Check for RISC-V patterns
    const riscvScore = await this.scoreRiscVPatterns(data, hints);
    scores.set('RISCV', riscvScore);

    // Find highest scoring architecture
    let bestArch: Architecture = 'UNKNOWN';
    let bestScore = 0;

    for (const [arch, score] of scores) {
      if (score > bestScore) {
        bestScore = score;
        bestArch = arch;
      }
    }

    // If we have a base address hint, use it to improve detection
    if (options.baseAddress) {
      if (options.baseAddress >= 0x08000000 && options.baseAddress < 0x10000000) {
        hints.push('Base address suggests ARM STM32 (0x08xxxxxx)');
        if (bestArch === 'UNKNOWN' || bestScore < 0.3) {
          bestArch = 'ARM';
          bestScore = Math.max(bestScore, 0.4);
        }
      } else if (options.baseAddress >= 0xBFC00000) {
        hints.push('Base address suggests MIPS boot ROM (0xBFCxxxxx)');
        if (bestArch === 'UNKNOWN' || bestScore < 0.3) {
          bestArch = 'MIPS';
          bestScore = Math.max(bestScore, 0.4);
        }
      }
    }

    return {
      architecture: bestArch,
      confidence: bestScore,
      format,
      hints
    };
  }

  /**
   * Check if data is ELF format
   */
  private static isElf(data: Uint8Array): boolean {
    return data.length >= 4 &&
           data[0] === 0x7F &&
           data[1] === 0x45 &&
           data[2] === 0x4C &&
           data[3] === 0x46;
  }

  /**
   * Detect architecture from ELF header
   */
  private static detectElfArchitecture(data: Uint8Array): Architecture {
    if (!this.isElf(data)) return 'UNKNOWN';

    // Read e_machine field (offset 0x12, 2 bytes)
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const isLittleEndian = data[5] === 1;
    const machine = view.getUint16(0x12, isLittleEndian);

    switch (machine) {
      case ElfMachine.EM_ARM:
      case ElfMachine.EM_AARCH64:
        return 'ARM';
      case ElfMachine.EM_MIPS:
        return 'MIPS';
      case ElfMachine.EM_RISCV:
        return 'RISCV';
      case ElfMachine.EM_386:
      case ElfMachine.EM_X86_64:
        return 'X86';
      case ElfMachine.EM_AVR:
        return 'AVR';
      case ElfMachine.EM_PIC:
        return 'PIC';
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * Detect architecture from PE header
   */
  private static detectPeArchitecture(data: Uint8Array): Architecture {
    // Check for MZ header
    if (data.length < 2 || data[0] !== 0x4D || data[1] !== 0x5A) {
      return 'UNKNOWN';
    }

    // Would need to parse PE header to get machine type
    // Simplified for now
    return 'UNKNOWN';
  }

  /**
   * Score ARM patterns in binary
   */
  private static async scoreArmPatterns(
    data: Uint8Array,
    hints: string[]
  ): Promise<number> {
    let score = 0;
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

    // Check for valid ARM Cortex-M vector table
    if (data.length >= 8) {
      const stackPointer = view.getUint32(0, true);
      const resetHandler = view.getUint32(4, true);

      // Check if first word looks like a stack pointer (RAM address)
      if (this.isLikelyStackPointer(stackPointer)) {
        score += 0.3;
        hints.push('First word looks like ARM stack pointer');
      }

      // Check if second word has Thumb bit set
      if ((resetHandler & 1) === 1 && resetHandler > 0x100 && resetHandler < 0x20000000) {
        score += 0.3;
        hints.push('Second word has Thumb bit set');
      }

      // Check for more vector entries
      let validVectors = 0;
      for (let i = 8; i < Math.min(64 * 4, data.length); i += 4) {
        const vector = view.getUint32(i, true);
        if (vector !== 0 && vector !== 0xFFFFFFFF && (vector & 1) === 1) {
          validVectors++;
        }
      }

      if (validVectors > 5) {
        score += 0.2;
        hints.push(`Found ${validVectors} valid ARM vector entries`);
      }
    }

    // Look for Thumb-2 instruction patterns
    let thumbPatterns = 0;
    for (let i = 0; i < Math.min(10000, data.length - 4); i += 2) {
      const inst16 = view.getUint16(i, true);

      // Check for common Thumb instructions
      if ((inst16 & 0xF800) === 0x4800) thumbPatterns++; // LDR (literal)
      if ((inst16 & 0xFF00) === 0xB500) thumbPatterns++; // PUSH {lr}
      if ((inst16 & 0xFF00) === 0xBD00) thumbPatterns++; // POP {pc}
      if ((inst16 & 0xF800) === 0xF000) {
        // 32-bit Thumb-2 instruction prefix
        const inst32 = view.getUint32(i, true);
        if ((inst32 & 0xF800D000) === 0xF000D000) {
          thumbPatterns++; // BL instruction
        }
      }
    }

    if (thumbPatterns > 20) {
      score += 0.1;
      hints.push(`Found ${thumbPatterns} Thumb instruction patterns`);
    }

    return Math.min(score, 1.0);
  }

  /**
   * Score MIPS patterns in binary
   */
  private static async scoreMipsPatterns(
    data: Uint8Array,
    hints: string[]
  ): Promise<number> {
    let score = 0;
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

    // Try both endiannesses
    for (const littleEndian of [false, true]) {
      let mipsPatterns = 0;

      for (let i = 0; i < Math.min(10000, data.length - 4); i += 4) {
        const inst = view.getUint32(i, littleEndian);
        const opcode = (inst >> 26) & 0x3F;

        // Check for common MIPS opcodes
        if (opcode === 0x00) mipsPatterns++; // R-type
        if (opcode === 0x02 || opcode === 0x03) mipsPatterns++; // J, JAL
        if (opcode === 0x08 || opcode === 0x09) mipsPatterns++; // ADDI, ADDIU
        if (opcode === 0x0F) mipsPatterns++; // LUI
        if (opcode === 0x23 || opcode === 0x2B) mipsPatterns++; // LW, SW
        if (opcode === 0x24 || opcode === 0x25) mipsPatterns++; // LBU, LHU

        // NOP instruction (0x00000000)
        if (inst === 0x00000000) mipsPatterns++;
      }

      if (mipsPatterns > 50) {
        score = Math.max(score, 0.5);
        hints.push(`Found ${mipsPatterns} MIPS patterns (${littleEndian ? 'LE' : 'BE'})`);
      }
    }

    // Check for MIPS boot vector location patterns
    if (data.length >= 16) {
      // Look for jump at beginning (common in MIPS boot code)
      const inst0 = view.getUint32(0, false);
      const opcode0 = (inst0 >> 26) & 0x3F;
      if (opcode0 === 0x02 || opcode0 === 0x03) {
        score += 0.2;
        hints.push('First instruction is MIPS J/JAL');
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Score RISC-V patterns in binary
   */
  private static async scoreRiscVPatterns(
    data: Uint8Array,
    hints: string[]
  ): Promise<number> {
    let score = 0;
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

    let riscvPatterns = 0;
    let compressedInsts = 0;

    for (let i = 0; i < Math.min(10000, data.length - 4); i += 2) {
      const inst16 = view.getUint16(i, true);

      // Check for compressed instructions
      if ((inst16 & 0x3) !== 0x3) {
        compressedInsts++;
        continue;
      }

      if (i + 2 < data.length) {
        const inst32 = view.getUint32(i, true);
        const opcode = inst32 & 0x7F;

        // Check for common RISC-V opcodes
        if (opcode === 0x37) riscvPatterns++; // LUI
        if (opcode === 0x17) riscvPatterns++; // AUIPC
        if (opcode === 0x6F) riscvPatterns++; // JAL
        if (opcode === 0x67) riscvPatterns++; // JALR
        if (opcode === 0x63) riscvPatterns++; // Branch
        if (opcode === 0x03) riscvPatterns++; // Load
        if (opcode === 0x23) riscvPatterns++; // Store
        if (opcode === 0x13) riscvPatterns++; // OP-IMM
        if (opcode === 0x33) riscvPatterns++; // OP
      }
    }

    if (riscvPatterns > 30) {
      score += 0.4;
      hints.push(`Found ${riscvPatterns} RISC-V instruction patterns`);
    }

    if (compressedInsts > 10) {
      score += 0.3;
      hints.push(`Found ${compressedInsts} RISC-V compressed instructions`);
    }

    // Check for RISC-V jump at start
    if (data.length >= 4) {
      const firstInst = view.getUint32(0, true);
      const opcode = firstInst & 0x7F;
      if (opcode === 0x6F) {
        score += 0.2;
        hints.push('First instruction is RISC-V JAL');
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Check if value looks like a stack pointer
   */
  private static isLikelyStackPointer(value: number): boolean {
    // Common RAM ranges
    const ramRanges = [
      { start: 0x20000000, end: 0x30000000 }, // ARM SRAM
      { start: 0x10000000, end: 0x10100000 }, // ARM CCM
      { start: 0x00000000, end: 0x00100000 }, // Low RAM
    ];

    // Check if in RAM range and word-aligned
    const inRam = ramRanges.some(r => value >= r.start && value <= r.end);
    const aligned = (value & 0x3) === 0;

    return inRam && aligned && value !== 0 && value !== 0xFFFFFFFF;
  }

  /**
   * Create parser for specific architecture
   */
  private static createParserForArchitecture(
    architecture: Architecture,
    data: Uint8Array,
    options: BinaryParseOptions
  ): BinaryParser {
    switch (architecture) {
      case 'ARM':
        return new ArmBinaryParser(data, options);
      case 'MIPS':
        return new MipsBinaryParser(data, options);
      case 'RISCV':
        return new RiscVBinaryParser(data, options);
      default:
        // Default to ARM parser with warning
        console.warn(`Unknown architecture '${architecture}', defaulting to ARM parser`);
        return new ArmBinaryParser(data, options);
    }
  }

  /**
   * Get list of supported architectures
   */
  static getSupportedArchitectures(): Architecture[] {
    return ['ARM', 'MIPS', 'RISCV'];
  }

  /**
   * Detect architecture from file extension/name
   */
  static detectFromFilename(filename: string): Architecture | undefined {
    const lower = filename.toLowerCase();

    // Check for architecture hints in filename
    if (lower.includes('arm') || lower.includes('cortex') || lower.includes('stm32')) {
      return 'ARM';
    }
    if (lower.includes('mips')) {
      return 'MIPS';
    }
    if (lower.includes('riscv') || lower.includes('risc-v')) {
      return 'RISCV';
    }

    return undefined;
  }
}