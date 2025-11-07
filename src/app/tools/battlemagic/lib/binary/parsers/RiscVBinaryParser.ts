/**
 * RISC-V Binary Parser
 *
 * Specialized parser for RISC-V architectures.
 * Handles trap vectors, privilege levels, and RISC-V specific binary formats.
 */

import { BinaryParser } from '../BinaryParser';
import {
  Architecture,
  ParserCapabilities,
  VectorInfo,
  RiscVMetadata,
  BinaryInfo,
  ElfMachine
} from '../types';

/**
 * RISC-V trap causes
 * Currently unused but kept for reference
 */
// enum _RiscVTrapCause {
//   // Interrupts (MSB = 1)
//   UserSoftwareInterrupt = 0x8000000000000000n,
//   SupervisorSoftwareInterrupt = 0x8000000000000001n,
//   MachineSoftwareInterrupt = 0x8000000000000003n,
//   UserTimerInterrupt = 0x8000000000000004n,
//   SupervisorTimerInterrupt = 0x8000000000000005n,
//   MachineTimerInterrupt = 0x8000000000000007n,
//   UserExternalInterrupt = 0x8000000000000008n,
//   SupervisorExternalInterrupt = 0x8000000000000009n,
//   MachineExternalInterrupt = 0x800000000000000Bn,
//
//   // Exceptions (MSB = 0)
//   InstructionAddressMisaligned = 0,
//   InstructionAccessFault = 1,
//   IllegalInstruction = 2,
//   Breakpoint = 3,
//   LoadAddressMisaligned = 4,
//   LoadAccessFault = 5,
//   StoreAddressMisaligned = 6,
//   StoreAccessFault = 7,
//   EnvironmentCallFromU = 8,
//   EnvironmentCallFromS = 9,
//   EnvironmentCallFromM = 11,
//   InstructionPageFault = 12,
//   LoadPageFault = 13,
//   StorePageFault = 15,
// }

/**
 * RISC-V standard CSR addresses
 * Currently unused but kept for reference
 */
// const _RISCV_CSR = {
//   // Machine trap setup
//   MSTATUS: 0x300,
//   MISA: 0x301,
//   MIE: 0x304,
//   MTVEC: 0x305,
//
//   // Supervisor trap setup
//   SSTATUS: 0x100,
//   SIE: 0x104,
//   STVEC: 0x105,
//
//   // Machine trap handling
//   MSCRATCH: 0x340,
//   MEPC: 0x341,
//   MCAUSE: 0x342,
//   MTVAL: 0x343,
//   MIP: 0x344,
//
//   // Supervisor trap handling
//   SSCRATCH: 0x140,
//   SEPC: 0x141,
//   SCAUSE: 0x142,
//   STVAL: 0x143,
//   SIP: 0x144,
// } as const;

/**
 * RISC-V Binary Parser Implementation
 *
 * Features:
 * - Trap vector parsing (mtvec, stvec)
 * - ISA extension detection
 * - Privilege level support (M, S, U modes)
 * - RV32/RV64/RV128 detection
 * - Vectored vs direct trap handling
 */
export class RiscVBinaryParser extends BinaryParser {
  private riscvMetadata: RiscVMetadata = {
    archString: 'rv32i',
    baseIsa: 'RV32I',
    extensions: []
  };

  getArchitecture(): Architecture {
    return 'RISCV';
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
   * Parse RISC-V trap vectors
   *
   * RISC-V uses trap vector registers (mtvec, stvec) instead of
   * a traditional vector table
   */
  protected async parseVectorTable(baseAddress: number): Promise<VectorInfo[]> {
    const vectors: VectorInfo[] = [];

    // Try to find trap vector setup code
    const mtvecAddress = await this.findMtvecValue();
    const stvecAddress = await this.findStvecValue();

    if (mtvecAddress !== undefined) {
      const mtvecMode = mtvecAddress & 0x3;
      const mtvecBase = mtvecAddress & ~0x3;

      this.riscvMetadata.mtvec = mtvecAddress;

      if (mtvecMode === 0) {
        // Direct mode - all traps jump to BASE
        vectors.push({
          name: 'Machine_Trap_Vector',
          address: mtvecBase,
          handlerAddress: mtvecBase,
          type: 'trap',
          index: 0,
          enabled: true,
          metadata: {
            mode: 'direct',
            privilegeLevel: 'machine'
          }
        });
      } else if (mtvecMode === 1) {
        // Vectored mode - exceptions go to BASE, interrupts to BASE+4*cause
        vectors.push({
          name: 'Machine_Exception_Vector',
          address: mtvecBase,
          handlerAddress: mtvecBase,
          type: 'exception',
          index: 0,
          enabled: true,
          metadata: {
            mode: 'vectored',
            privilegeLevel: 'machine'
          }
        });

        // Add interrupt vectors
        const interruptCauses = [
          { cause: 3, name: 'Machine_Software_Interrupt' },
          { cause: 7, name: 'Machine_Timer_Interrupt' },
          { cause: 11, name: 'Machine_External_Interrupt' },
        ];

        for (const int of interruptCauses) {
          vectors.push({
            name: int.name,
            address: mtvecBase + (int.cause * 4),
            handlerAddress: mtvecBase + (int.cause * 4),
            type: 'irq',
            index: int.cause,
            enabled: true,
            metadata: {
              cause: int.cause,
              privilegeLevel: 'machine'
            }
          });
        }
      }
    }

    if (stvecAddress !== undefined) {
      const stvecMode = stvecAddress & 0x3;
      const stvecBase = stvecAddress & ~0x3;

      this.riscvMetadata.stvec = stvecAddress;

      if (stvecMode === 0) {
        // Direct mode
        vectors.push({
          name: 'Supervisor_Trap_Vector',
          address: stvecBase,
          handlerAddress: stvecBase,
          type: 'trap',
          index: 100, // Offset to distinguish from machine mode
          enabled: true,
          metadata: {
            mode: 'direct',
            privilegeLevel: 'supervisor'
          }
        });
      } else if (stvecMode === 1) {
        // Vectored mode
        vectors.push({
          name: 'Supervisor_Exception_Vector',
          address: stvecBase,
          handlerAddress: stvecBase,
          type: 'exception',
          index: 100,
          enabled: true,
          metadata: {
            mode: 'vectored',
            privilegeLevel: 'supervisor'
          }
        });

        // Add supervisor interrupt vectors
        const supervisorInts = [
          { cause: 1, name: 'Supervisor_Software_Interrupt' },
          { cause: 5, name: 'Supervisor_Timer_Interrupt' },
          { cause: 9, name: 'Supervisor_External_Interrupt' },
        ];

        for (const int of supervisorInts) {
          vectors.push({
            name: int.name,
            address: stvecBase + (int.cause * 4),
            handlerAddress: stvecBase + (int.cause * 4),
            type: 'irq',
            index: 100 + int.cause,
            enabled: true,
            metadata: {
              cause: int.cause,
              privilegeLevel: 'supervisor'
            }
          });
        }
      }
    }

    // If no trap vectors found, check for standard reset vector
    if (vectors.length === 0) {
      const resetVector = await this.findResetVector(baseAddress);
      if (resetVector) {
        vectors.push({
          name: 'Reset_Vector',
          address: baseAddress,
          handlerAddress: resetVector,
          type: 'reset',
          index: 0,
          enabled: true
        });
      }
    }

    return vectors;
  }

  /**
   * Detect entry point for RISC-V
   */
  protected async detectEntryPoint(): Promise<number | undefined> {
    // For embedded RISC-V, entry point is typically at the base address
    const baseAddress = this.options.baseAddress || 0x80000000;

    // Check if there's a jump instruction at the reset vector
    if (this.data.length >= 4) {
      const firstInst = this.readU32(0);
      const jumpTarget = this.decodeJumpTarget(firstInst, baseAddress);
      if (jumpTarget) {
        return jumpTarget;
      }
    }

    // Return base address as entry point
    return baseAddress;
  }

  /**
   * Extract RISC-V-specific metadata
   */
  protected async extractArchitectureMetadata(): Promise<{ arch: 'RISCV'; specific: RiscVMetadata }> {
    // Detect base ISA
    this.riscvMetadata.baseIsa = await this.detectBaseIsa();

    // Detect extensions
    this.riscvMetadata.extensions = await this.detectExtensions();

    // Build architecture string
    this.riscvMetadata.archString = this.buildArchString();

    // Detect ABI
    this.riscvMetadata.abi = await this.detectAbi();

    return {
      arch: 'RISCV',
      specific: this.riscvMetadata
    };
  }

  /**
   * Find mtvec value by analyzing code
   */
  private async findMtvecValue(): Promise<number | undefined> {
    // Look for CSRW mtvec instruction pattern
    for (let i = 0; i < Math.min(this.data.length - 4, 10000); i += 2) {
      const inst = this.readU32(i);

      // Check for CSRW mtvec (0x30529073 with register variations)
      if ((inst & 0xFFF00FFF) === 0x30500073) {
        // This is a CSRW to mtvec, try to find the value being written
        const rs1 = (inst >> 15) & 0x1F;
        const value = await this.trackRegisterValue(i, rs1);
        if (value !== undefined) {
          return value;
        }
      }

      // Check for compressed instructions if C extension is present
      if (this.hasCompressedInstructions()) {
        // const cInst = this.readU16(i);
        // Check for C.LI or C.LUI that might load trap vector address
        // This is simplified - real implementation would be more complex
      }
    }

    return undefined;
  }

  /**
   * Find stvec value by analyzing code
   */
  private async findStvecValue(): Promise<number | undefined> {
    // Look for CSRW stvec instruction pattern
    for (let i = 0; i < Math.min(this.data.length - 4, 10000); i += 2) {
      const inst = this.readU32(i);

      // Check for CSRW stvec (0x10529073 with register variations)
      if ((inst & 0xFFF00FFF) === 0x10500073) {
        // This is a CSRW to stvec
        const rs1 = (inst >> 15) & 0x1F;
        const value = await this.trackRegisterValue(i, rs1);
        if (value !== undefined) {
          return value;
        }
      }
    }

    return undefined;
  }

  /**
   * Find reset vector location
   */
  private async findResetVector(baseAddress: number): Promise<number | undefined> {
    // Check first instruction for jump
    if (this.data.length >= 4) {
      const inst = this.readU32(0);
      return this.decodeJumpTarget(inst, baseAddress);
    }
    return undefined;
  }

  /**
   * Track register value backwards from an instruction
   */
  private async trackRegisterValue(offset: number, reg: number): Promise<number | undefined> {
    // Simplified register tracking - would need full dataflow analysis for accuracy
    // Look backwards for LUI/ADDI or LA pseudo-instruction loading this register

    for (let i = offset - 4; i >= 0 && i > offset - 100; i -= 4) {
      const inst = this.readU32(i);
      const opcode = inst & 0x7F;
      const rd = (inst >> 7) & 0x1F;

      if (rd !== reg) continue;

      // LUI instruction
      if (opcode === 0x37) {
        const imm = inst & 0xFFFFF000;
        // Check if next instruction is ADDI to complete LA
        if (i + 4 < this.data.length) {
          const nextInst = this.readU32(i + 4);
          const nextOpcode = nextInst & 0x7F;
          const nextRd = (nextInst >> 7) & 0x1F;
          const nextRs1 = (nextInst >> 15) & 0x1F;

          if (nextOpcode === 0x13 && nextRd === reg && nextRs1 === reg) {
            // ADDI to same register
            const addImm = (nextInst >> 20) & 0xFFF;
            const signExtAddImm = (addImm & 0x800) ? (addImm | 0xFFFFF000) : addImm;
            return imm + signExtAddImm;
          }
        }
        return imm;
      }

      // LI pseudo-instruction (ADDI with x0)
      if (opcode === 0x13) {
        const rs1 = (inst >> 15) & 0x1F;
        if (rs1 === 0) {
          const imm = (inst >> 20) & 0xFFF;
          const signExtImm = (imm & 0x800) ? (imm | 0xFFFFF000) : imm;
          return signExtImm;
        }
      }
    }

    return undefined;
  }

  /**
   * Decode jump target from RISC-V instruction
   */
  private decodeJumpTarget(instruction: number, pc: number): number | undefined {
    const opcode = instruction & 0x7F;

    // JAL instruction
    if (opcode === 0x6F) {
      // Extract immediate: imm[20|10:1|11|19:12]
      const imm20 = (instruction >> 31) & 0x1;
      const imm10_1 = (instruction >> 21) & 0x3FF;
      const imm11 = (instruction >> 20) & 0x1;
      const imm19_12 = (instruction >> 12) & 0xFF;

      let imm = (imm20 << 20) | (imm19_12 << 12) | (imm11 << 11) | (imm10_1 << 1);
      // Sign extend
      if (imm20) {
        imm |= 0xFFE00000;
      }
      return pc + imm;
    }

    // J pseudo-instruction (JAL x0, offset)
    if (opcode === 0x6F && ((instruction >> 7) & 0x1F) === 0) {
      // Same as JAL but confirm rd=x0
      const imm20 = (instruction >> 31) & 0x1;
      const imm10_1 = (instruction >> 21) & 0x3FF;
      const imm11 = (instruction >> 20) & 0x1;
      const imm19_12 = (instruction >> 12) & 0xFF;

      let imm = (imm20 << 20) | (imm19_12 << 12) | (imm11 << 11) | (imm10_1 << 1);
      if (imm20) {
        imm |= 0xFFE00000;
      }
      return pc + imm;
    }

    // JALR - can't determine statically
    // Branch instructions - would need execution context

    return undefined;
  }

  /**
   * Detect base ISA (RV32I, RV64I, etc.)
   */
  private async detectBaseIsa(): Promise<'RV32I' | 'RV32E' | 'RV64I' | 'RV128I'> {
    // Check for 64-bit instructions
    if (await this.has64BitInstructions()) {
      return 'RV64I';
    }

    // Check for embedded profile (RV32E - 16 registers)
    if (this.options.architectureOptions?.riscv?.assumeEmbedded) {
      if (await this.isEmbeddedProfile()) {
        return 'RV32E';
      }
    }

    // Default to RV32I
    return 'RV32I';
  }

  /**
   * Detect ISA extensions
   */
  private async detectExtensions(): Promise<string[]> {
    const extensions: string[] = [];

    // M - Integer multiply/divide
    if (await this.hasMExtension()) {
      extensions.push('M');
    }

    // A - Atomic operations
    if (await this.hasAExtension()) {
      extensions.push('A');
    }

    // F - Single-precision floating-point
    if (await this.hasFExtension()) {
      extensions.push('F');
    }

    // D - Double-precision floating-point
    if (await this.hasDExtension()) {
      extensions.push('D');
    }

    // C - Compressed instructions
    if (this.hasCompressedInstructions()) {
      extensions.push('C');
    }

    // B - Bit manipulation
    if (await this.hasBExtension()) {
      extensions.push('B');
    }

    // V - Vector operations
    if (await this.hasVExtension()) {
      extensions.push('V');
    }

    return extensions;
  }

  /**
   * Build architecture string from base ISA and extensions
   */
  private buildArchString(): string {
    const base = this.riscvMetadata.baseIsa.toLowerCase();
    const extensions = this.riscvMetadata.extensions.map(e => e.toLowerCase()).join('');
    return base.replace('i', 'i' + extensions);
  }

  /**
   * Detect ABI based on ISA
   */
  private async detectAbi(): Promise<string | undefined> {
    const baseIsa = this.riscvMetadata.baseIsa;
    const hasF = this.riscvMetadata.extensions.includes('F');
    const hasD = this.riscvMetadata.extensions.includes('D');

    if (baseIsa === 'RV32I' || baseIsa === 'RV32E') {
      if (hasD) return 'ilp32d';
      if (hasF) return 'ilp32f';
      return 'ilp32';
    } else if (baseIsa === 'RV64I') {
      if (hasD) return 'lp64d';
      if (hasF) return 'lp64f';
      return 'lp64';
    }

    return undefined;
  }

  /**
   * Check for 64-bit instructions
   */
  private async has64BitInstructions(): Promise<boolean> {
    // Look for 64-bit specific instructions (LD, SD, etc.)
    for (let i = 0; i < Math.min(this.data.length - 4, 10000); i += 4) {
      const inst = this.readU32(i);
      const opcode = inst & 0x7F;
      const funct3 = (inst >> 12) & 0x7;

      // Check for 64-bit load/store
      if (opcode === 0x03 && funct3 === 0x3) return true; // LD
      if (opcode === 0x23 && funct3 === 0x3) return true; // SD

      // Check for 64-bit arithmetic
      if (opcode === 0x1B) return true; // ADDIW, SLLIW, etc.
      if (opcode === 0x3B) return true; // ADDW, SUBW, etc.
    }

    return false;
  }

  /**
   * Check if this is embedded profile (RV32E)
   */
  private async isEmbeddedProfile(): Promise<boolean> {
    // RV32E only uses registers x0-x15
    // Check if any instructions use x16-x31
    for (let i = 0; i < Math.min(this.data.length - 4, 10000); i += 4) {
      const inst = this.readU32(i);
      const rd = (inst >> 7) & 0x1F;
      const rs1 = (inst >> 15) & 0x1F;
      const rs2 = (inst >> 20) & 0x1F;

      if (rd >= 16 || rs1 >= 16 || rs2 >= 16) {
        return false;
      }
    }

    // If we only see low registers, might be RV32E
    return true;
  }

  /**
   * Check for compressed instructions
   */
  private hasCompressedInstructions(): boolean {
    // Compressed instructions are 16-bit and have specific patterns
    for (let i = 0; i < Math.min(this.data.length - 2, 10000); i += 2) {
      const inst = this.readU16(i);
      // Compressed instructions have low 2 bits != 11
      if ((inst & 0x3) !== 0x3) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check for M extension (multiply/divide)
   */
  private async hasMExtension(): Promise<boolean> {
    for (let i = 0; i < Math.min(this.data.length - 4, 10000); i += 4) {
      const inst = this.readU32(i);
      const opcode = inst & 0x7F;
      const funct7 = (inst >> 25) & 0x7F;

      // MUL, DIV, REM instructions
      if (opcode === 0x33 && funct7 === 0x01) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check for A extension (atomic)
   */
  private async hasAExtension(): Promise<boolean> {
    for (let i = 0; i < Math.min(this.data.length - 4, 10000); i += 4) {
      const inst = this.readU32(i);
      const opcode = inst & 0x7F;

      // AMO instructions
      if (opcode === 0x2F) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check for F extension (single-precision float)
   */
  private async hasFExtension(): Promise<boolean> {
    for (let i = 0; i < Math.min(this.data.length - 4, 10000); i += 4) {
      const inst = this.readU32(i);
      const opcode = inst & 0x7F;

      // F instructions
      if (opcode === 0x07 || opcode === 0x27 || opcode === 0x53 || opcode === 0x43) {
        const funct7 = (inst >> 25) & 0x7F;
        // Check for single-precision encoding
        if ((funct7 & 0x3) === 0x0) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check for D extension (double-precision float)
   */
  private async hasDExtension(): Promise<boolean> {
    for (let i = 0; i < Math.min(this.data.length - 4, 10000); i += 4) {
      const inst = this.readU32(i);
      const opcode = inst & 0x7F;

      // D instructions
      if (opcode === 0x07 || opcode === 0x27 || opcode === 0x53 || opcode === 0x43) {
        const funct7 = (inst >> 25) & 0x7F;
        // Check for double-precision encoding
        if ((funct7 & 0x3) === 0x1) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check for B extension (bit manipulation)
   */
  private async hasBExtension(): Promise<boolean> {
    // B extension has many sub-extensions
    // Look for common bit manipulation patterns
    // Simplified check
    return false;
  }

  /**
   * Check for V extension (vector)
   */
  private async hasVExtension(): Promise<boolean> {
    for (let i = 0; i < Math.min(this.data.length - 4, 10000); i += 4) {
      const inst = this.readU32(i);
      const opcode = inst & 0x7F;

      // Vector instructions
      if (opcode === 0x57) {
        return true;
      }
    }
    return false;
  }

  /**
   * Override ELF parsing to handle RISC-V-specific features
   */
  protected async parseElf(): Promise<BinaryInfo> {
    const info = await super.parseElf();

    // Check if this is a RISC-V ELF
    const elfHeader = this.parseElfHeader();
    if (elfHeader.machine !== ElfMachine.EM_RISCV) {
      this.addWarning(`ELF machine type ${elfHeader.machine} is not RISC-V`);
    }

    // Extract RISC-V-specific ELF attributes
    await this.parseRiscVElfAttributes(elfHeader);

    return info;
  }

  /**
   * Parse RISC-V-specific ELF attributes
   */
  private async parseRiscVElfAttributes(elfHeader: { flags: number }): Promise<void> {
    // RISC-V ELF files may contain .riscv.attributes section
    // This would parse those attributes to determine exact ISA string
    // Simplified implementation

    // The ELF flags field contains float ABI info
    const flags = elfHeader.flags;
    const floatAbi = flags & 0x6;

    if (floatAbi === 0x2) {
      // Single-precision float ABI
      if (!this.riscvMetadata.extensions.includes('F')) {
        this.riscvMetadata.extensions.push('F');
      }
    } else if (floatAbi === 0x4) {
      // Double-precision float ABI
      if (!this.riscvMetadata.extensions.includes('D')) {
        this.riscvMetadata.extensions.push('D');
      }
    }
  }
}