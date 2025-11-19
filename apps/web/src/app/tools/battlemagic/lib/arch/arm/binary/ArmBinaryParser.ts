/**
 * ARM Binary Parser
 *
 * Specialized parser for ARM architectures, particularly Cortex-M series.
 * Handles vector table parsing, Thumb mode, and ARM-specific binary formats.
 */

import { BinaryParser } from '../../../binary/BinaryParser';
import {
  Architecture,
  ParserCapabilities,
  VectorInfo,
  VectorType,
  ArmMetadata,
  CORTEX_M_VECTORS,
  CortexMException,
  BinaryInfo,
  ElfMachine,
  MemoryRegion
} from '../types';

/**
 * ARM Binary Parser Implementation
 *
 * Features:
 * - Cortex-M vector table parsing
 * - Thumb bit handling
 * - Stack pointer detection
 * - Exception and interrupt vector extraction
 * - Support for various ARM architectures (v6-M, v7-M, v8-M)
 */
export class ArmBinaryParser extends BinaryParser {
  private armMetadata: ArmMetadata = {
    archVersion: 'v7-M',
    thumbMode: true,
    fpuSupport: 'none'
  };

  getArchitecture(): Architecture {
    return 'ARM';
  }

  getCapabilities(): ParserCapabilities {
    return {
      formats: ['RAW', 'ELF', 'AXF'],
      canParseSymbols: true,
      canParseDebugInfo: false,
      canDetectEntryPoint: true,
      canParseVectorTable: true,
      supportsStreaming: false
    };
  }

  /**
   * Parse ARM Cortex-M vector table
   *
   * The vector table starts at the base address and contains:
   * - First word: Initial stack pointer value
   * - Second word: Reset handler address
   * - Following words: Exception and interrupt handlers
   */
  protected async parseVectorTable(baseAddress: number): Promise<VectorInfo[]> {
    const vectors: VectorInfo[] = [];
    const vtorOffset = this.options.architectureOptions?.arm?.vtorOffset || 0;
    const tableAddress = baseAddress + vtorOffset;

    // Calculate offset in the binary data
    const dataOffset = tableAddress - baseAddress;
    if (dataOffset < 0 || dataOffset >= this.data.length) {
      this.addWarning(`Vector table at 0x${tableAddress.toString(16)} is outside binary range`);
      return vectors;
    }

    // First entry is the initial stack pointer
    const stackPointer = this.readU32(dataOffset);
    if (this.isValidStackPointer(stackPointer)) {
      vectors.push({
        name: 'Initial_SP',
        address: tableAddress,
        handlerAddress: stackPointer,
        type: 'reset',
        index: 0,
        metadata: { isStackPointer: true }
      });

      // Store for later use
      this.armMetadata.vtorOffset = vtorOffset;
    }

    // Parse system exception vectors (1-15)
    for (let i = 1; i < 16; i++) {
      const offset = dataOffset + (i * 4);
      if (offset + 4 > this.data.length) break;

      const handlerAddress = this.readU32(offset);
      const vectorName = i < CORTEX_M_VECTORS.length ?
        CORTEX_M_VECTORS[i] : `Exception_${i}`;

      // Clear thumb bit for actual address
      const cleanAddress = handlerAddress & ~1;

      vectors.push({
        name: vectorName,
        address: tableAddress + (i * 4),
        handlerAddress: cleanAddress,
        type: this.getVectorType(i),
        index: i,
        enabled: handlerAddress !== 0 && handlerAddress !== 0xFFFFFFFF,
        metadata: {
          thumbBit: (handlerAddress & 1) !== 0,
          isSystemException: true
        }
      });
    }

    // Parse external interrupt vectors (16+)
    const numExternalInterrupts = await this.detectNumExternalInterrupts(dataOffset);
    this.armMetadata.numExternalInterrupts = numExternalInterrupts;

    for (let i = 16; i < 16 + numExternalInterrupts; i++) {
      const offset = dataOffset + (i * 4);
      if (offset + 4 > this.data.length) break;

      const handlerAddress = this.readU32(offset);
      const cleanAddress = handlerAddress & ~1;

      // Skip invalid entries
      if (handlerAddress === 0 || handlerAddress === 0xFFFFFFFF) {
        continue;
      }

      vectors.push({
        name: `IRQ_${i - 16}`,
        address: tableAddress + (i * 4),
        handlerAddress: cleanAddress,
        type: 'irq',
        index: i,
        priority: 0, // Default priority, would need NVIC registers to get actual
        enabled: true,
        metadata: {
          thumbBit: (handlerAddress & 1) !== 0,
          irqNumber: i - 16
        }
      });
    }

    return vectors;
  }

  /**
   * Detect entry point from vector table
   */
  protected async detectEntryPoint(): Promise<number | undefined> {
    // For ARM Cortex-M, the entry point is the reset handler (second word)
    const resetHandlerOffset = 4;
    if (this.data.length >= 8) {
      const resetHandler = this.readU32(resetHandlerOffset);
      // Clear thumb bit
      return resetHandler & ~1;
    }
    return undefined;
  }

  /**
   * Extract ARM-specific metadata
   */
  protected async extractArchitectureMetadata(): Promise<{ arch: 'ARM'; specific: ArmMetadata }> {
    // Detect processor type from patterns in the binary
    this.armMetadata.processorType = await this.detectProcessorType();

    // Detect architecture version
    this.armMetadata.archVersion = await this.detectArchVersion();

    // Detect FPU support
    this.armMetadata.fpuSupport = await this.detectFpuSupport();

    // Check for security extensions (TrustZone)
    this.armMetadata.securityExtension = await this.detectSecurityExtension();

    // Detect MPU regions if available
    this.armMetadata.mpuRegions = await this.detectMpuRegions();

    return {
      arch: 'ARM',
      specific: this.armMetadata
    };
  }

  /**
   * ARM-specific post-processing
   */
  protected architectureSpecificPostProcess(info: BinaryInfo): BinaryInfo {
    // Extract stack pointer from first vector
    if (info.vectors.length > 0 && info.vectors[0].metadata?.isStackPointer) {
      info.stackPointer = info.vectors[0].handlerAddress;
    }

    // Ensure all handler addresses have thumb bit cleared in the address field
    // but preserved in metadata
    info.vectors = info.vectors.map(v => ({
      ...v,
      handlerAddress: v.handlerAddress ? (v.handlerAddress & ~1) : v.handlerAddress
    }));

    // Add memory regions based on typical ARM Cortex-M layout
    if (!info.memoryMap || info.memoryMap.length === 0) {
      info.memoryMap = this.generateArmMemoryMap();
    }

    return info;
  }

  /**
   * Check if a value is a valid stack pointer
   * Stack pointer should point to RAM and be word-aligned
   */
  private isValidStackPointer(value: number): boolean {
    // Common RAM ranges for ARM Cortex-M
    const ramRanges = [
      { start: 0x20000000, end: 0x30000000 }, // Standard SRAM region
      { start: 0x10000000, end: 0x10010000 }, // CCM RAM (some STM32)
      { start: 0x00000000, end: 0x00100000 }, // Some devices map RAM here
    ];

    // Check if value is in a RAM range and is word-aligned
    const isInRam = ramRanges.some(range =>
      value >= range.start && value <= range.end
    );
    const isAligned = (value & 0x3) === 0;

    return isInRam && isAligned;
  }

  /**
   * Get vector type based on exception number
   */
  private getVectorType(exceptionNum: number): VectorType {
    switch (exceptionNum) {
      case CortexMException.Reset:
        return 'reset';
      case CortexMException.NMI:
        return 'nmi';
      case CortexMException.HardFault:
        return 'hardfault';
      case CortexMException.MemManage:
        return 'memfault';
      case CortexMException.BusFault:
        return 'busfault';
      case CortexMException.UsageFault:
        return 'usagefault';
      case CortexMException.SVCall:
        return 'svc';
      case CortexMException.PendSV:
        return 'pendsv';
      case CortexMException.SysTick:
        return 'systick';
      default:
        return exceptionNum >= 16 ? 'irq' : 'exception';
    }
  }

  /**
   * Detect number of external interrupts by analyzing the vector table
   */
  private async detectNumExternalInterrupts(vtorOffset: number): Promise<number> {
    let count = 0;
    const maxInterrupts = 240; // Maximum for Cortex-M

    for (let i = 16; i < 16 + maxInterrupts; i++) {
      const offset = vtorOffset + (i * 4);
      if (offset + 4 > this.data.length) break;

      const handler = this.readU32(offset);

      // Stop counting when we hit invalid entries
      // Some devices fill unused vectors with 0, others with 0xFFFFFFFF
      if (handler === 0 || handler === 0xFFFFFFFF) {
        // Check if this is just a gap
        let hasMoreValid = false;
        for (let j = i + 1; j < Math.min(i + 10, 16 + maxInterrupts); j++) {
          const nextOffset = vtorOffset + (j * 4);
          if (nextOffset + 4 > this.data.length) break;
          const nextHandler = this.readU32(nextOffset);
          if (nextHandler !== 0 && nextHandler !== 0xFFFFFFFF) {
            hasMoreValid = true;
            break;
          }
        }
        if (!hasMoreValid) break;
      }

      count++;
    }

    return count;
  }

  /**
   * Detect processor type from binary patterns
   */
  private async detectProcessorType(): Promise<string | undefined> {
    // Look for processor-specific patterns or markers
    // This is simplified - real detection would be more complex

    if (this.options.architectureOptions?.arm?.assumeCortexM) {
      // Try to determine which Cortex-M variant
      const numInterrupts = this.armMetadata.numExternalInterrupts || 0;

      if (numInterrupts <= 32) {
        return 'Cortex-M0';
      } else if (numInterrupts <= 240) {
        // Check for FPU instructions to distinguish M4F from M3
        if (await this.hasFpuInstructions()) {
          return 'Cortex-M4F';
        }
        return 'Cortex-M3';
      } else {
        return 'Cortex-M7';
      }
    }

    return undefined;
  }

  /**
   * Detect ARM architecture version
   */
  private async detectArchVersion(): Promise<string> {
    // Simplified detection based on instruction patterns
    // Real implementation would analyze actual instruction encodings

    const processorType = this.armMetadata.processorType;
    if (processorType) {
      if (processorType.includes('M0')) return 'v6-M';
      if (processorType.includes('M3') || processorType.includes('M4')) return 'v7-M';
      if (processorType.includes('M7')) return 'v7E-M';
      if (processorType.includes('M33')) return 'v8-M';
    }

    return 'v7-M'; // Default
  }

  /**
   * Detect FPU support by looking for FPU instructions
   */
  private async detectFpuSupport(): Promise<'none' | 'single' | 'double'> {
    if (await this.hasFpuInstructions()) {
      // Check for double precision instructions
      if (await this.hasDoublePrecisionFpu()) {
        return 'double';
      }
      return 'single';
    }
    return 'none';
  }

  /**
   * Check for FPU instructions in the binary
   */
  private async hasFpuInstructions(): Promise<boolean> {
    // Look for common FPU instruction patterns in Thumb-2
    // VADD.F32, VMUL.F32, etc.
    // This is simplified - real detection would be more thorough

    for (let i = 0; i < Math.min(this.data.length - 4, 10000); i += 2) {
      const inst = this.readU16(i);
      // Check for VFP/NEON instruction encoding
      if ((inst & 0xEF00) === 0xEE00) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check for double precision FPU support
   */
  private async hasDoublePrecisionFpu(): Promise<boolean> {
    // Look for double precision instruction patterns
    // This is a simplified check
    return false;
  }

  /**
   * Detect security extension (TrustZone)
   */
  private async detectSecurityExtension(): Promise<boolean> {
    // Look for secure gateway instruction (SG) or other TrustZone markers
    // Simplified implementation
    return false;
  }

  /**
   * Detect number of MPU regions
   */
  private async detectMpuRegions(): Promise<number | undefined> {
    // Would need to analyze MPU configuration code
    // Simplified implementation returns undefined
    return undefined;
  }

  /**
   * Generate ARM-specific memory map
   */
  private generateArmMemoryMap(): MemoryRegion[] {
    const regions: MemoryRegion[] = [];

    // Typical STM32 memory layout
    regions.push({
      name: 'FLASH',
      start: 0x08000000,
      end: 0x08100000,
      size: 0x100000,
      type: 'flash',
      permissions: ['read', 'execute'],
      cacheable: true
    });

    regions.push({
      name: 'SRAM',
      start: 0x20000000,
      end: 0x20020000,
      size: 0x20000,
      type: 'ram',
      permissions: ['read', 'write', 'execute'],
      cacheable: true
    });

    regions.push({
      name: 'PERIPHERALS',
      start: 0x40000000,
      end: 0x60000000,
      size: 0x20000000,
      type: 'peripheral',
      permissions: ['read', 'write'],
      cacheable: false
    });

    regions.push({
      name: 'SYSTEM',
      start: 0xE0000000,
      end: 0xFFFFFFFF,
      size: 0x1FFFFFFF,
      type: 'peripheral',
      permissions: ['read', 'write'],
      cacheable: false
    });

    return regions;
  }

  /**
   * Override ELF parsing to handle ARM-specific features
   */
  protected async parseElf(): Promise<BinaryInfo> {
    const info = await super.parseElf();

    // Check if this is an ARM ELF
    const elfHeader = this.parseElfHeader();
    if (elfHeader.machine !== ElfMachine.EM_ARM) {
      this.addWarning(`ELF machine type ${elfHeader.machine} is not ARM`);
    }

    // Extract ARM-specific ELF attributes
    await this.parseArmElfAttributes();

    return info;
  }

  /**
   * Parse ARM-specific ELF attributes
   */
  private async parseArmElfAttributes(): Promise<void> {
    // ARM ELF files contain .ARM.attributes section with build attributes
    // This would parse those attributes to determine exact ARM variant
    // Simplified implementation
  }
}