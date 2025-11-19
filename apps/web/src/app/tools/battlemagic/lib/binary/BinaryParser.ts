/**
 * Abstract Binary Parser Base Class
 *
 * Provides base functionality and interface for architecture-specific binary parsers.
 * Follows SOLID principles with emphasis on testability and modularity.
 */

import {
  Architecture,
  ArchitectureMetadata,
  BinaryFormat,
  BinaryInfo,
  BinaryParseOptions,
  BinaryMetadata,
  Endianness,
  ParseResult,
  ParserCapabilities,
  SectionInfo,
  VectorInfo,
  SymbolInfo,
  MemoryRegion,
  ElfMachine
} from './types';

/**
 * ELF Header structure
 */
interface ElfHeader {
  is64Bit: boolean;
  endianness: Endianness;
  type: number;
  machine: number;
  version: number;
  entryPoint: number;
  phOffset: number;
  shOffset: number;
  flags: number;
  ehSize: number;
  phEntSize: number;
  phNum: number;
  shEntSize: number;
  shNum: number;
  shStrNdx: number;
}

/**
 * ELF Program Header structure
 */
interface ProgramHeader {
  type: number;
  flags: number;
  offset: number;
  vaddr: number;
  paddr: number;
  filesz: number;
  memsz: number;
  align: number;
}

/**
 * ELF Section Header structure
 */
interface SectionHeader {
  nameOffset: number;
  type: number;
  flags: number;
  addr: number;
  offset: number;
  size: number;
  link: number;
  info: number;
  addralign: number;
  entsize: number;
}

/**
 * Abstract base class for binary file parsers
 *
 * Design principles:
 * - Template Method pattern for common parsing flow
 * - Strategy pattern for architecture-specific logic
 * - Dependency injection ready for testing
 */
export abstract class BinaryParser {
  protected readonly data: Uint8Array;
  protected readonly view: DataView;
  protected readonly options: BinaryParseOptions;
  protected endianness: Endianness = 'little';
  protected warnings: string[] = [];

  /**
   * Constructor
   * @param data Raw binary data to parse
   * @param options Parsing options
   */
  constructor(data: Uint8Array, options: BinaryParseOptions = {}) {
    this.data = data;
    this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    this.options = this.mergeWithDefaults(options);

    // Validate file size
    if (this.options.maxFileSize && data.length > this.options.maxFileSize) {
      throw new Error(`File size ${data.length} exceeds maximum ${this.options.maxFileSize}`);
    }
  }

  /**
   * Get parser capabilities
   */
  abstract getCapabilities(): ParserCapabilities;

  /**
   * Get supported architecture
   */
  abstract getArchitecture(): Architecture;

  /**
   * Parse the binary file
   * Template method that orchestrates the parsing flow
   */
  async parse(): Promise<ParseResult> {
    const startTime = performance.now();

    try {
      // Detect format and validate
      const format = await this.detectFormat();
      if (!this.validateFormat(format)) {
        throw new Error(`Unsupported format: ${format}`);
      }

      // Detect endianness
      this.endianness = this.options.forceEndianness || await this.detectEndianness();

      // Parse based on format
      let info: BinaryInfo;
      switch (format) {
        case 'ELF':
          info = await this.parseElf();
          break;
        case 'RAW':
          info = await this.parseRawBinary();
          break;
        case 'AXF':
          info = await this.parseAxf();
          break;
        default:
          info = await this.parseGeneric(format);
      }

      // Post-process and validate
      info = await this.postProcess(info);
      this.validateParsedInfo(info);

      return {
        success: true,
        info,
        warnings: this.warnings,
        duration: performance.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        warnings: this.warnings,
        duration: performance.now() - startTime
      };
    }
  }

  /**
   * Architecture-specific vector table parsing
   */
  protected abstract parseVectorTable(baseAddress: number): Promise<VectorInfo[]>;

  /**
   * Architecture-specific entry point detection
   */
  protected abstract detectEntryPoint(): Promise<number | undefined>;

  /**
   * Architecture-specific metadata extraction
   */
  protected abstract extractArchitectureMetadata(): Promise<ArchitectureMetadata>;

  /**
   * Detect binary format from magic numbers and headers
   */
  protected async detectFormat(): Promise<BinaryFormat> {
    if (this.data.length < 4) {
      return 'RAW';
    }

    // Check ELF magic (0x7F 'E' 'L' 'F')
    if (this.data[0] === 0x7F && this.data[1] === 0x45 &&
        this.data[2] === 0x4C && this.data[3] === 0x46) {
      return 'ELF';
    }

    // Check for ARM AXF format (variant of ELF)
    if (this.data[0] === 0x7F && this.data[1] === 0x45 &&
        this.data[2] === 0x4C && this.data[3] === 0x46) {
      // Additional checks for ARM-specific ELF
      const machine = this.readU16(0x12);
      if (machine === ElfMachine.EM_ARM) {
        return 'AXF';
      }
    }

    // Check for PE format (MZ header)
    if (this.data[0] === 0x4D && this.data[1] === 0x5A) {
      return 'PE';
    }

    // Check for Mach-O format
    const magic32 = this.readU32(0);
    if (magic32 === 0xFEEDFACE || magic32 === 0xFEEDFACF ||
        magic32 === 0xCEFAEDFE || magic32 === 0xCFFAEDFE) {
      return 'MACHO';
    }

    // Check for S-record format
    if (this.data[0] === 0x53) { // 'S'
      const text = new TextDecoder().decode(this.data.slice(0, 100));
      if (/^S[0-9][0-9A-Fa-f]+/m.test(text)) {
        return 'SREC';
      }
    }

    // Check for Intel HEX format
    if (this.data[0] === 0x3A) { // ':'
      const text = new TextDecoder().decode(this.data.slice(0, 100));
      if (/^:[0-9A-Fa-f]+/m.test(text)) {
        return 'HEX';
      }
    }

    // Default to raw binary
    return 'RAW';
  }

  /**
   * Detect endianness from binary content
   */
  protected async detectEndianness(): Promise<Endianness> {
    // Check ELF header for endianness
    if (this.isElf()) {
      return this.data[5] === 1 ? 'little' : 'big';
    }

    // For ARM, assume little endian by default
    if (this.getArchitecture() === 'ARM') {
      return 'little';
    }

    // For MIPS, try to detect from content patterns
    if (this.getArchitecture() === 'MIPS') {
      // MIPS can be either, try to detect from known patterns
      return this.detectMipsEndianness();
    }

    // Default to little endian
    return 'little';
  }

  /**
   * Parse ELF format
   */
  protected async parseElf(): Promise<BinaryInfo> {
    const elfHeader = this.parseElfHeader();
    this.parseProgramHeaders(elfHeader);
    const sectionHeaders = this.parseSectionHeaders(elfHeader);

    const sections = await this.extractSections(sectionHeaders);
    const entryPoint = elfHeader.entryPoint;
    const vectors = await this.parseVectorTable(this.options.baseAddress || 0);

    let symbols: SymbolInfo[] | undefined;
    if (this.options.parseSymbols) {
      symbols = await this.parseSymbolTable(sectionHeaders);
    }

    const metadata: BinaryMetadata = {
      format: 'ELF',
      architecture: this.getArchitecture(),
      endianness: this.endianness,
      entryPoint,
      fileSize: this.data.length,
      hasSymbols: symbols && symbols.length > 0,
      architectureMetadata: (await this.extractArchitectureMetadata()) as unknown as ArchitectureMetadata | undefined
    };

    return {
      architecture: this.getArchitecture(),
      entryPoint: entryPoint || 0,
      vectors,
      sections,
      symbols,
      metadata,
      rawData: this.data,
      warnings: this.warnings
    };
  }

  /**
   * Parse raw binary format
   */
  protected async parseRawBinary(): Promise<BinaryInfo> {
    const baseAddress = this.options.baseAddress || 0x08000000; // Default to STM32 flash

    // For raw binaries, create a single .text section
    const sections: SectionInfo[] = [{
      name: '.text',
      address: baseAddress,
      size: this.data.length,
      type: 'code',
      flags: ['readable', 'executable', 'allocated'],
      data: this.data
    }];

    // Parse vector table at the beginning of the binary
    const vectors = await this.parseVectorTable(baseAddress);

    // Detect entry point
    const entryPoint = await this.detectEntryPoint() || baseAddress;

    const metadata: BinaryMetadata = {
      format: 'RAW',
      architecture: this.getArchitecture(),
      endianness: this.endianness,
      entryPoint,
      fileSize: this.data.length,
      loadSize: this.data.length,
      architectureMetadata: (await this.extractArchitectureMetadata()) as unknown as ArchitectureMetadata | undefined
    };

    return {
      architecture: this.getArchitecture(),
      entryPoint,
      vectors,
      sections,
      metadata,
      rawData: this.data,
      warnings: this.warnings
    };
  }

  /**
   * Parse AXF format (ARM variant of ELF)
   */
  protected async parseAxf(): Promise<BinaryInfo> {
    // AXF is essentially ELF with ARM-specific extensions
    const info = await this.parseElf();
    info.metadata.format = 'AXF';
    return info;
  }

  /**
   * Generic parser for other formats
   */
  protected async parseGeneric(format: BinaryFormat): Promise<BinaryInfo> {
    throw new Error(`Parser for format ${format} not implemented`);
  }

  /**
   * Post-process parsed information
   */
  protected async postProcess(info: BinaryInfo): Promise<BinaryInfo> {
    // Calculate memory map if not present
    if (!info.memoryMap) {
      info.memoryMap = this.generateMemoryMap(info.sections);
    }

    // Sort vectors by index
    info.vectors.sort((a, b) => a.index - b.index);

    // Sort sections by address
    info.sections.sort((a, b) => a.address - b.address);

    // Add any architecture-specific post-processing
    return this.architectureSpecificPostProcess(info);
  }

  /**
   * Architecture-specific post-processing
   */
  protected architectureSpecificPostProcess(info: BinaryInfo): BinaryInfo {
    // Override in derived classes if needed
    return info;
  }

  /**
   * Validate parsed information
   */
  protected validateParsedInfo(info: BinaryInfo): void {
    // Check for overlapping sections
    for (let i = 0; i < info.sections.length - 1; i++) {
      const current = info.sections[i];
      const next = info.sections[i + 1];
      if (current.address + current.size > next.address) {
        this.warnings.push(
          `Warning: Sections overlap: ${current.name} ends at 0x${(current.address + current.size).toString(16)}, ` +
          `${next.name} starts at 0x${next.address.toString(16)}`
        );
      }
    }

    // Validate entry point is within a code section
    if (info.entryPoint) {
      const containingSection = info.sections.find(s =>
        s.address <= info.entryPoint &&
        s.address + s.size > info.entryPoint &&
        s.type === 'code'
      );
      if (!containingSection) {
        this.warnings.push(
          `Warning: Entry point 0x${info.entryPoint.toString(16)} is not within a code section`
        );
      }
    }
  }

  // Helper methods for reading different data types

  protected readU8(offset: number): number {
    return this.view.getUint8(offset);
  }

  protected readU16(offset: number): number {
    return this.view.getUint16(offset, this.endianness === 'little');
  }

  protected readU32(offset: number): number {
    return this.view.getUint32(offset, this.endianness === 'little');
  }

  protected readU64(offset: number): bigint {
    return this.view.getBigUint64(offset, this.endianness === 'little');
  }

  protected readI8(offset: number): number {
    return this.view.getInt8(offset);
  }

  protected readI16(offset: number): number {
    return this.view.getInt16(offset, this.endianness === 'little');
  }

  protected readI32(offset: number): number {
    return this.view.getInt32(offset, this.endianness === 'little');
  }

  protected readString(offset: number, maxLength: number = 256): string {
    const bytes: number[] = [];
    for (let i = 0; i < maxLength && offset + i < this.data.length; i++) {
      const byte = this.data[offset + i];
      if (byte === 0) break;
      bytes.push(byte);
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  }

  // ELF parsing helpers

  protected isElf(): boolean {
    return this.data.length >= 4 &&
           this.data[0] === 0x7F &&
           this.data[1] === 0x45 &&
           this.data[2] === 0x4C &&
           this.data[3] === 0x46;
  }

  protected parseElfHeader(): ElfHeader {
    if (!this.isElf()) {
      throw new Error('Not an ELF file');
    }

    const is64Bit = this.data[4] === 2;
    const endianness = this.data[5] === 1 ? 'little' : 'big';
    this.endianness = endianness;

    return {
      is64Bit,
      endianness,
      type: this.readU16(0x10),
      machine: this.readU16(0x12),
      version: this.readU32(0x14),
      entryPoint: is64Bit ? Number(this.readU64(0x18)) : this.readU32(0x18),
      phOffset: is64Bit ? Number(this.readU64(0x20)) : this.readU32(0x1C),
      shOffset: is64Bit ? Number(this.readU64(0x28)) : this.readU32(0x20),
      flags: this.readU32(is64Bit ? 0x30 : 0x24),
      ehSize: this.readU16(is64Bit ? 0x34 : 0x28),
      phEntSize: this.readU16(is64Bit ? 0x36 : 0x2A),
      phNum: this.readU16(is64Bit ? 0x38 : 0x2C),
      shEntSize: this.readU16(is64Bit ? 0x3A : 0x2E),
      shNum: this.readU16(is64Bit ? 0x3C : 0x30),
      shStrNdx: this.readU16(is64Bit ? 0x3E : 0x32)
    };
  }

  protected parseProgramHeaders(elfHeader: ElfHeader): ProgramHeader[] {
    const headers = [];
    const { phOffset, phEntSize, phNum, is64Bit } = elfHeader;

    for (let i = 0; i < phNum; i++) {
      const offset = phOffset + (i * phEntSize);
      headers.push({
        type: this.readU32(offset),
        flags: is64Bit ? this.readU32(offset + 4) : this.readU32(offset + 0x18),
        offset: is64Bit ? Number(this.readU64(offset + 8)) : this.readU32(offset + 4),
        vaddr: is64Bit ? Number(this.readU64(offset + 0x10)) : this.readU32(offset + 8),
        paddr: is64Bit ? Number(this.readU64(offset + 0x18)) : this.readU32(offset + 0xC),
        filesz: is64Bit ? Number(this.readU64(offset + 0x20)) : this.readU32(offset + 0x10),
        memsz: is64Bit ? Number(this.readU64(offset + 0x28)) : this.readU32(offset + 0x14),
        align: is64Bit ? Number(this.readU64(offset + 0x30)) : this.readU32(offset + 0x1C)
      });
    }

    return headers;
  }

  protected parseSectionHeaders(elfHeader: ElfHeader): SectionHeader[] {
    const headers = [];
    const { shOffset, shEntSize, shNum, is64Bit } = elfHeader;

    for (let i = 0; i < shNum; i++) {
      const offset = shOffset + (i * shEntSize);
      headers.push({
        nameOffset: this.readU32(offset),
        type: this.readU32(offset + 4),
        flags: is64Bit ? Number(this.readU64(offset + 8)) : this.readU32(offset + 8),
        addr: is64Bit ? Number(this.readU64(offset + 0x10)) : this.readU32(offset + 0xC),
        offset: is64Bit ? Number(this.readU64(offset + 0x18)) : this.readU32(offset + 0x10),
        size: is64Bit ? Number(this.readU64(offset + 0x20)) : this.readU32(offset + 0x14),
        link: this.readU32(is64Bit ? offset + 0x28 : offset + 0x18),
        info: this.readU32(is64Bit ? offset + 0x2C : offset + 0x1C),
        addralign: is64Bit ? Number(this.readU64(offset + 0x30)) : this.readU32(offset + 0x20),
        entsize: is64Bit ? Number(this.readU64(offset + 0x38)) : this.readU32(offset + 0x24)
      });
    }

    return headers;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async extractSections(_sectionHeaders: SectionHeader[]): Promise<SectionInfo[]> {
    // Implementation would extract section data
    // This is a simplified version
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async parseSymbolTable(_sectionHeaders: SectionHeader[]): Promise<SymbolInfo[]> {
    // Implementation would parse symbol table
    // This is a simplified version
    return [];
  }

  protected generateMemoryMap(sections: SectionInfo[]): MemoryRegion[] {
    const regions: MemoryRegion[] = [];

    // Group sections by memory type
    const flashSections = sections.filter(s => s.type === 'code' || s.type === 'rodata');
    const ramSections = sections.filter(s => s.type === 'data' || s.type === 'bss');

    if (flashSections.length > 0) {
      const start = Math.min(...flashSections.map(s => s.address));
      const end = Math.max(...flashSections.map(s => s.address + s.size));
      regions.push({
        name: 'FLASH',
        start,
        end,
        size: end - start,
        type: 'flash',
        permissions: ['read', 'execute']
      });
    }

    if (ramSections.length > 0) {
      const start = Math.min(...ramSections.map(s => s.address));
      const end = Math.max(...ramSections.map(s => s.address + s.size));
      regions.push({
        name: 'RAM',
        start,
        end,
        size: end - start,
        type: 'ram',
        permissions: ['read', 'write']
      });
    }

    return regions;
  }

  protected validateFormat(format: BinaryFormat): boolean {
    const capabilities = this.getCapabilities();
    return capabilities.formats.includes(format);
  }

  protected detectMipsEndianness(): Endianness {
    // MIPS-specific endianness detection logic
    // Look for known instruction patterns
    return 'big'; // Default to big endian for MIPS
  }

  protected mergeWithDefaults(options: BinaryParseOptions): BinaryParseOptions {
    return {
      baseAddress: 0x08000000,
      parseSymbols: true,
      parseDebugInfo: false,
      validateChecksums: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB default
      ...options
    };
  }

  protected addWarning(warning: string): void {
    this.warnings.push(warning);
  }
}