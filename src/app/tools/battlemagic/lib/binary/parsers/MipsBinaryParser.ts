/**
 * MIPS Binary Parser
 *
 * Specialized parser for MIPS architectures.
 * Handles exception vectors, boot vectors, and MIPS-specific binary formats.
 */

import { BinaryParser } from '../BinaryParser';
import {
  Architecture,
  ParserCapabilities,
  VectorInfo,
  MipsMetadata,
  BinaryInfo,
  Endianness,
  ElfMachine
} from '../types';

/**
 * MIPS exception vector addresses
 */
const MIPS_EXCEPTION_VECTORS = {
  RESET: 0xBFC00000,      // Reset/NMI vector
  TLB_REFILL: 0x80000000, // TLB refill
  CACHE_ERROR: 0xBFC00300, // Cache error
  GENERAL: 0x80000180,     // General exception
  INTERRUPT: 0x80000200,   // Interrupt (if vectored interrupts)
  DEBUG: 0xBFC00480,       // EJTAG Debug
} as const;

/**
 * MIPS Binary Parser Implementation
 *
 * Features:
 * - Exception vector parsing
 * - Boot vector handling
 * - Big/little endian support
 * - MIPS32/MIPS64 detection
 * - Coprocessor detection
 */
export class MipsBinaryParser extends BinaryParser {
  private mipsMetadata: MipsMetadata = {
    archVersion: 'MIPS32',
    abi: 'o32'
  };

  getArchitecture(): Architecture {
    return 'MIPS';
  }

  getCapabilities(): ParserCapabilities {
    return {
      formats: ['RAW', 'ELF'],
      canParseSymbols: true,
      canParseDebugInfo: false,
      canDetectEntryPoint: true,
      canParseVectorTable: true,
      supportsStreaming: false
    };
  }

  /**
   * Parse MIPS exception vectors
   */
  protected async parseVectorTable(baseAddress: number): Promise<VectorInfo[]> {
    const vectors: VectorInfo[] = [];

    // MIPS doesn't have a traditional vector table like ARM
    // Instead, it has fixed exception vector addresses

    // Check if we have boot ROM area (0xBFC00000)
    const bootRomOffset = this.findOffsetForAddress(MIPS_EXCEPTION_VECTORS.RESET, baseAddress);

    if (bootRomOffset !== undefined) {
      // Parse reset vector
      vectors.push({
        name: 'Reset_Vector',
        address: MIPS_EXCEPTION_VECTORS.RESET,
        handlerAddress: await this.getHandlerAddress(bootRomOffset),
        type: 'reset',
        index: 0,
        enabled: true,
        metadata: {
          isBootVector: true
        }
      });

      // Parse cache error vector
      const cacheErrorOffset = this.findOffsetForAddress(
        MIPS_EXCEPTION_VECTORS.CACHE_ERROR,
        baseAddress
      );
      if (cacheErrorOffset !== undefined) {
        vectors.push({
          name: 'Cache_Error',
          address: MIPS_EXCEPTION_VECTORS.CACHE_ERROR,
          handlerAddress: await this.getHandlerAddress(cacheErrorOffset),
          type: 'exception',
          index: 1,
          enabled: true
        });
      }

      // Parse debug vector
      const debugOffset = this.findOffsetForAddress(
        MIPS_EXCEPTION_VECTORS.DEBUG,
        baseAddress
      );
      if (debugOffset !== undefined) {
        vectors.push({
          name: 'Debug_Exception',
          address: MIPS_EXCEPTION_VECTORS.DEBUG,
          handlerAddress: await this.getHandlerAddress(debugOffset),
          type: 'exception',
          index: 2,
          enabled: true
        });
      }
    }

    // Check for general exception vectors (in KSEG0)
    const generalOffset = this.findOffsetForAddress(
      MIPS_EXCEPTION_VECTORS.GENERAL,
      baseAddress
    );

    if (generalOffset !== undefined) {
      vectors.push({
        name: 'General_Exception',
        address: MIPS_EXCEPTION_VECTORS.GENERAL,
        handlerAddress: await this.getHandlerAddress(generalOffset),
        type: 'exception',
        index: 3,
        enabled: true
      });
    }

    // Check for TLB refill vector
    const tlbOffset = this.findOffsetForAddress(
      MIPS_EXCEPTION_VECTORS.TLB_REFILL,
      baseAddress
    );

    if (tlbOffset !== undefined) {
      vectors.push({
        name: 'TLB_Refill',
        address: MIPS_EXCEPTION_VECTORS.TLB_REFILL,
        handlerAddress: await this.getHandlerAddress(tlbOffset),
        type: 'exception',
        index: 4,
        enabled: true
      });
    }

    // Parse interrupt vectors if vectored interrupts are enabled
    if (await this.hasVectoredInterrupts()) {
      const intOffset = this.findOffsetForAddress(
        MIPS_EXCEPTION_VECTORS.INTERRUPT,
        baseAddress
      );

      if (intOffset !== undefined) {
        // Parse vectored interrupt table
        for (let i = 0; i < 8; i++) {
          const vecOffset = intOffset + (i * 0x20); // 32-byte spacing
          if (vecOffset + 4 <= this.data.length) {
            vectors.push({
              name: `Interrupt_${i}`,
              address: MIPS_EXCEPTION_VECTORS.INTERRUPT + (i * 0x20),
              handlerAddress: await this.getHandlerAddress(vecOffset),
              type: 'irq',
              index: 10 + i,
              priority: i,
              enabled: true
            });
          }
        }
      }
    }

    return vectors;
  }

  /**
   * Detect entry point for MIPS
   */
  protected async detectEntryPoint(): Promise<number | undefined> {
    // For MIPS, entry point is typically the reset vector
    const bootVector = this.options.architectureOptions?.mips?.bootVector;
    if (bootVector) {
      return bootVector;
    }

    // Check for reset vector at standard location
    const resetOffset = this.findOffsetForAddress(
      MIPS_EXCEPTION_VECTORS.RESET,
      this.options.baseAddress || 0
    );

    if (resetOffset !== undefined) {
      // Read the first instruction at reset vector
      // It's often a jump to the actual entry point
      const instruction = this.readU32(resetOffset);
      const entryPoint = this.decodeJumpTarget(instruction);
      if (entryPoint) {
        return entryPoint;
      }
    }

    // Default to reset vector address
    return MIPS_EXCEPTION_VECTORS.RESET;
  }

  /**
   * Extract MIPS-specific metadata
   */
  protected async extractArchitectureMetadata(): Promise<{ arch: 'MIPS'; specific: MipsMetadata }> {
    // Detect architecture version
    this.mipsMetadata.archVersion = await this.detectMipsVersion();

    // Detect instruction set
    this.mipsMetadata.instructionSet = await this.detectInstructionSet();

    // Detect ABI
    this.mipsMetadata.abi = await this.detectAbi();

    // Detect coprocessors
    this.mipsMetadata.coprocessors = await this.detectCoprocessors();

    // Set exception base
    this.mipsMetadata.exceptionBase = this.options.architectureOptions?.mips?.bootVector ||
      MIPS_EXCEPTION_VECTORS.RESET;

    return {
      arch: 'MIPS',
      specific: this.mipsMetadata
    };
  }

  /**
   * Detect endianness for MIPS
   */
  protected async detectEndianness(): Promise<Endianness> {
    if (this.options.forceEndianness) {
      return this.options.forceEndianness;
    }

    // Try to detect from instruction patterns
    // MIPS instructions have recognizable patterns

    // Look for common MIPS instructions
    for (let i = 0; i < Math.min(this.data.length - 4, 1000); i += 4) {
      const wordLE = this.view.getUint32(i, true);
      const wordBE = this.view.getUint32(i, false);

      // Check for NOP instruction (0x00000000) - works for both
      if (wordLE === 0x00000000) continue;

      // Check for common instruction patterns
      // LUI instruction: 0x3C00xxxx (big endian)
      if ((wordBE & 0xFC000000) === 0x3C000000) {
        return 'big';
      }
      if ((wordLE & 0xFC000000) === 0x3C000000) {
        return 'little';
      }

      // ADDIU instruction: 0x24xxxxxx
      if ((wordBE & 0xFC000000) === 0x24000000) {
        return 'big';
      }
      if ((wordLE & 0xFC000000) === 0x24000000) {
        return 'little';
      }
    }

    // Default to big endian (traditional for MIPS)
    return 'big';
  }

  /**
   * Find offset in binary for a given address
   */
  private findOffsetForAddress(
    targetAddress: number,
    baseAddress: number
  ): number | undefined {
    // Convert virtual address to file offset
    const offset = targetAddress - baseAddress;
    if (offset >= 0 && offset < this.data.length) {
      return offset;
    }

    // Check if address is in KSEG0/KSEG1 and map accordingly
    const kseg0Base = 0x80000000;
    const kseg1Base = 0xA0000000;
    const physMask = 0x1FFFFFFF;

    if (targetAddress >= kseg0Base && targetAddress < kseg1Base) {
      // KSEG0 address - cached
      const physAddr = targetAddress & physMask;
      const mappedOffset = physAddr - (baseAddress & physMask);
      if (mappedOffset >= 0 && mappedOffset < this.data.length) {
        return mappedOffset;
      }
    } else if (targetAddress >= kseg1Base && targetAddress < 0xC0000000) {
      // KSEG1 address - uncached
      const physAddr = targetAddress & physMask;
      const mappedOffset = physAddr - (baseAddress & physMask);
      if (mappedOffset >= 0 && mappedOffset < this.data.length) {
        return mappedOffset;
      }
    }

    return undefined;
  }

  /**
   * Get handler address from a vector location
   */
  private async getHandlerAddress(offset: number): Promise<number> {
    if (offset + 4 > this.data.length) {
      return 0;
    }

    // Read first instruction at vector
    const instruction = this.readU32(offset);

    // Check if it's a jump instruction
    const jumpTarget = this.decodeJumpTarget(instruction);
    if (jumpTarget) {
      return jumpTarget;
    }

    // Otherwise, the handler starts at this address
    return this.options.baseAddress || 0 + offset;
  }

  /**
   * Decode jump target from MIPS instruction
   */
  private decodeJumpTarget(instruction: number): number | undefined {
    const opcode = (instruction >> 26) & 0x3F;

    // J (jump) instruction - opcode 0x02
    if (opcode === 0x02) {
      const target = instruction & 0x03FFFFFF;
      // Jump target is formed by shifting left 2 bits
      // and combining with upper 4 bits of PC
      return (target << 2) | 0xBFC00000; // Assume boot ROM region
    }

    // JAL (jump and link) instruction - opcode 0x03
    if (opcode === 0x03) {
      const target = instruction & 0x03FFFFFF;
      return (target << 2) | 0xBFC00000;
    }

    // JR (jump register) - can't determine statically
    // Branch instructions - would need to follow execution

    return undefined;
  }

  /**
   * Check if vectored interrupts are enabled
   */
  private async hasVectoredInterrupts(): Promise<boolean> {
    // Would need to analyze configuration registers or code
    // For now, assume false
    return false;
  }

  /**
   * Detect MIPS architecture version
   */
  private async detectMipsVersion(): Promise<string> {
    // Look for MIPS64-specific instructions
    if (await this.hasMips64Instructions()) {
      return 'MIPS64';
    }

    // Check for MIPS32 Release 2/6 features
    if (await this.hasMips32R2Instructions()) {
      return 'MIPS32r2';
    }

    return 'MIPS32';
  }

  /**
   * Detect instruction set variant
   */
  private async detectInstructionSet(): Promise<string | undefined> {
    const version = this.mipsMetadata.archVersion;
    if (version === 'MIPS32r2') {
      return 'mips32r2';
    } else if (version === 'MIPS64') {
      return 'mips64';
    }
    return 'mips32';
  }

  /**
   * Detect ABI type
   */
  private async detectAbi(): Promise<'o32' | 'n32' | 'n64' | 'eabi'> {
    // Would need to analyze calling conventions
    // Default based on architecture
    if (this.mipsMetadata.archVersion === 'MIPS64') {
      return 'n64';
    }
    return 'o32';
  }

  /**
   * Detect available coprocessors
   */
  private async detectCoprocessors(): Promise<number[]> {
    const coprocessors: number[] = [];

    // CP0 is always present (system control)
    coprocessors.push(0);

    // Check for FPU (CP1)
    if (await this.hasFpuInstructions()) {
      coprocessors.push(1);
    }

    // Check for CP2 (implementation specific)
    if (await this.hasCp2Instructions()) {
      coprocessors.push(2);
    }

    return coprocessors;
  }

  /**
   * Check for MIPS64 instructions
   */
  private async hasMips64Instructions(): Promise<boolean> {
    // Look for 64-bit specific instructions
    // Simplified check
    return false;
  }

  /**
   * Check for MIPS32 Release 2 instructions
   */
  private async hasMips32R2Instructions(): Promise<boolean> {
    // Look for R2-specific instructions like EXT, INS, etc.
    for (let i = 0; i < Math.min(this.data.length - 4, 10000); i += 4) {
      const inst = this.readU32(i);
      const opcode = (inst >> 26) & 0x3F;

      // SPECIAL3 opcode (0x1F) indicates R2+ instructions
      if (opcode === 0x1F) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check for FPU instructions
   */
  private async hasFpuInstructions(): Promise<boolean> {
    // Look for COP1 (FPU) instructions
    for (let i = 0; i < Math.min(this.data.length - 4, 10000); i += 4) {
      const inst = this.readU32(i);
      const opcode = (inst >> 26) & 0x3F;

      // COP1 opcode is 0x11
      if (opcode === 0x11) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check for Coprocessor 2 instructions
   */
  private async hasCp2Instructions(): Promise<boolean> {
    // Look for COP2 instructions
    for (let i = 0; i < Math.min(this.data.length - 4, 10000); i += 4) {
      const inst = this.readU32(i);
      const opcode = (inst >> 26) & 0x3F;

      // COP2 opcode is 0x12
      if (opcode === 0x12) {
        return true;
      }
    }
    return false;
  }

  /**
   * Override ELF parsing to handle MIPS-specific features
   */
  protected async parseElf(): Promise<BinaryInfo> {
    const info = await super.parseElf();

    // Check if this is a MIPS ELF
    const elfHeader = this.parseElfHeader();
    if (elfHeader.machine !== ElfMachine.EM_MIPS) {
      this.addWarning(`ELF machine type ${elfHeader.machine} is not MIPS`);
    }

    // Extract MIPS-specific ELF flags
    await this.parseMipsElfFlags(elfHeader.flags);

    return info;
  }

  /**
   * Parse MIPS-specific ELF flags
   */
  private async parseMipsElfFlags(flags: number): Promise<void> {
    // MIPS ELF flags contain ABI and architecture info
    const abi = flags & 0x0000F000;
    switch (abi) {
      case 0x00000000:
        this.mipsMetadata.abi = 'o32';
        break;
      case 0x00001000:
        this.mipsMetadata.abi = 'o32';
        break;
      case 0x00002000:
        this.mipsMetadata.abi = 'n32';
        break;
      case 0x00003000:
        this.mipsMetadata.abi = 'eabi';
        break;
    }

    // Check architecture level
    const arch = flags & 0xF0000000;
    if (arch === 0x60000000) {
      this.mipsMetadata.archVersion = 'MIPS32';
    } else if (arch === 0x70000000) {
      this.mipsMetadata.archVersion = 'MIPS64';
    }
  }
}