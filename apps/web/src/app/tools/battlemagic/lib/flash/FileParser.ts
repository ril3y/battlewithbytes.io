/**
 * File Parser Library
 *
 * Handles parsing of various firmware file formats:
 * - Intel HEX (.hex)
 * - Binary (.bin)
 * - ELF (.elf) - requires additional processing
 */

export interface FirmwareData {
  format: "hex" | "bin" | "elf";
  data: Uint8Array;
  segments: MemorySegment[];
  entryPoint?: number;
  metadata?: {
    filename: string;
    size: number;
    checksum?: number;
  };
}

export interface MemorySegment {
  address: number;
  data: Uint8Array;
  type?: "code" | "data" | "bss";
}

export class FileParser {
  /**
   * Parse a firmware file based on its extension
   */
  static async parseFile(file: File): Promise<FirmwareData> {
    const filename = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    if (filename.endsWith(".hex")) {
      return this.parseIntelHex(data, file.name);
    } else if (filename.endsWith(".bin")) {
      return this.parseBinary(data, file.name);
    } else if (filename.endsWith(".elf")) {
      return this.parseElf(data);
    } else if (
      filename.endsWith(".s19") ||
      filename.endsWith(".srec") ||
      filename.endsWith(".s37")
    ) {
      return this.parseSRecord(data, file.name);
    } else {
      throw new Error(`Unsupported file format: ${file.name}`);
    }
  }

  /**
   * Parse Intel HEX format
   */
  private static parseIntelHex(
    data: Uint8Array,
    filename: string,
  ): FirmwareData {
    const text = new TextDecoder().decode(data);
    const lines = text.split(/\r?\n/);
    const segments: MemorySegment[] = [];
    let currentSegment: MemorySegment | null = null;
    let extendedAddress = 0;
    let entryPoint: number | undefined;

    for (const line of lines) {
      if (!line.startsWith(":")) continue;

      const recordLength = parseInt(line.substr(1, 2), 16);
      const address = parseInt(line.substr(3, 4), 16);
      const recordType = parseInt(line.substr(7, 2), 16);
      const dataStart = 9;
      const recordData = line.substr(dataStart, recordLength * 2);

      switch (recordType) {
        case 0x00: // Data record
          const fullAddress = (extendedAddress << 16) | address;
          const bytes = new Uint8Array(recordLength);
          for (let i = 0; i < recordLength; i++) {
            bytes[i] = parseInt(recordData.substr(i * 2, 2), 16);
          }

          if (
            !currentSegment ||
            currentSegment.address + currentSegment.data.length !== fullAddress
          ) {
            if (currentSegment) {
              segments.push(currentSegment);
            }
            currentSegment = {
              address: fullAddress,
              data: bytes,
            };
          } else {
            // Append to current segment
            const newData = new Uint8Array(
              currentSegment.data.length + bytes.length,
            );
            newData.set(currentSegment.data);
            newData.set(bytes, currentSegment.data.length);
            currentSegment.data = newData;
          }
          break;

        case 0x01: // End of file
          if (currentSegment) {
            segments.push(currentSegment);
            currentSegment = null;
          }
          break;

        case 0x02: // Extended segment address
          extendedAddress = parseInt(recordData, 16) << 4;
          break;

        case 0x04: // Extended linear address
          extendedAddress = parseInt(recordData, 16);
          break;

        case 0x05: // Start linear address (entry point)
          entryPoint = parseInt(recordData, 16);
          break;
      }
    }

    if (currentSegment) {
      segments.push(currentSegment);
    }

    // Combine all segments into single data array for verification
    const totalSize = segments.reduce((sum, seg) => sum + seg.data.length, 0);
    const combinedData = new Uint8Array(totalSize);
    let offset = 0;
    for (const segment of segments) {
      combinedData.set(segment.data, offset);
      offset += segment.data.length;
    }

    return {
      format: "hex",
      data: combinedData,
      segments,
      entryPoint,
      metadata: {
        filename,
        size: totalSize,
      },
    };
  }

  /**
   * Parse binary format (raw binary with assumed base address)
   */
  private static parseBinary(
    data: Uint8Array,
    filename: string,
    baseAddress = 0x08000000,
  ): FirmwareData {
    return {
      format: "bin",
      data,
      segments: [
        {
          address: baseAddress,
          data,
          type: "code",
        },
      ],
      metadata: {
        filename,
        size: data.length,
      },
    };
  }

  /**
   * Parse ELF format (simplified - full ELF parsing would be much more complex)
   */
  private static parseElf(data: Uint8Array): FirmwareData {
    // Check ELF magic number
    if (
      data[0] !== 0x7f ||
      data[1] !== 0x45 ||
      data[2] !== 0x4c ||
      data[3] !== 0x46
    ) {
      throw new Error("Invalid ELF file");
    }

    // For now, we'll throw an error as full ELF parsing requires significant work
    // In production, we'd either implement full ELF parsing or use GDB's load command
    throw new Error(
      "ELF file support requires GDB load command. Please use .hex or .bin format, or use GDB console to load ELF directly.",
    );
  }

  /**
   * Calculate checksum for verification
   */
  static calculateChecksum(data: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum = (sum + data[i]) & 0xffffffff;
    }
    return sum;
  }

  /**
   * Parse Motorola S-record format
   */
  private static parseSRecord(
    data: Uint8Array,
    filename: string,
  ): FirmwareData {
    const text = new TextDecoder().decode(data);
    const lines = text.split(/\r?\n/);
    const segments: MemorySegment[] = [];
    let currentSegment: MemorySegment | null = null;
    let entryPoint: number | undefined;

    for (const line of lines) {
      if (!line.startsWith("S")) continue;

      const recordType = line.charAt(1);
      const countStr = line.substr(2, 2);
      const count = parseInt(countStr, 16);

      switch (recordType) {
        case "0": // Header record - skip
          break;

        case "1": // Data record with 16-bit address
        case "2": // Data record with 24-bit address
        case "3": // Data record with 32-bit address
          const addrBytes = recordType === "1" ? 2 : recordType === "2" ? 3 : 4;
          const addrStr = line.substr(4, addrBytes * 2);
          const address = parseInt(addrStr, 16);
          const dataStart = 4 + addrBytes * 2;
          const dataLength = count - addrBytes - 1; // minus address and checksum
          const recordData = line.substr(dataStart, dataLength * 2);

          const bytes = new Uint8Array(dataLength);
          for (let i = 0; i < dataLength; i++) {
            bytes[i] = parseInt(recordData.substr(i * 2, 2), 16);
          }

          if (
            !currentSegment ||
            currentSegment.address + currentSegment.data.length !== address
          ) {
            if (currentSegment) {
              segments.push(currentSegment);
            }
            currentSegment = {
              address,
              data: bytes,
            };
          } else {
            // Append to current segment
            const newData = new Uint8Array(
              currentSegment.data.length + bytes.length,
            );
            newData.set(currentSegment.data);
            newData.set(bytes, currentSegment.data.length);
            currentSegment.data = newData;
          }
          break;

        case "5": // Count record - skip
        case "6": // Count record - skip
          break;

        case "7": // Start address record (32-bit)
        case "8": // Start address record (24-bit)
        case "9": // Start address record (16-bit)
          const startAddrBytes =
            recordType === "9" ? 2 : recordType === "8" ? 3 : 4;
          const startAddrStr = line.substr(4, startAddrBytes * 2);
          entryPoint = parseInt(startAddrStr, 16);
          if (currentSegment) {
            segments.push(currentSegment);
            currentSegment = null;
          }
          break;
      }
    }

    if (currentSegment) {
      segments.push(currentSegment);
    }

    // Combine all segments into single data array for verification
    const totalSize = segments.reduce((sum, seg) => sum + seg.data.length, 0);
    const combinedData = new Uint8Array(totalSize);
    let offset = 0;
    for (const segment of segments) {
      combinedData.set(segment.data, offset);
      offset += segment.data.length;
    }

    return {
      format: "hex", // S-records are similar to hex format
      data: combinedData,
      segments,
      entryPoint,
      metadata: {
        filename,
        size: totalSize,
      },
    };
  }

  /**
   * Convert binary data to Intel HEX format string
   */
  static toIntelHex(data: Uint8Array, baseAddress: number = 0): string {
    const lines: string[] = [];
    const recordSize = 16; // 16 bytes per record
    let extendedAddress = 0;

    for (let offset = 0; offset < data.length; offset += recordSize) {
      const address = baseAddress + offset;
      const currentExtended = (address >> 16) & 0xffff;

      // Write extended linear address record if needed
      if (currentExtended !== extendedAddress) {
        extendedAddress = currentExtended;
        const addrData = [
          (extendedAddress >> 8) & 0xff,
          extendedAddress & 0xff,
        ];
        lines.push(this.formatIntelHexRecord(0, 0x04, addrData));
      }

      // Write data record
      const length = Math.min(recordSize, data.length - offset);
      const recordAddr = address & 0xffff;
      const recordData = Array.from(data.slice(offset, offset + length));
      lines.push(this.formatIntelHexRecord(recordAddr, 0x00, recordData));
    }

    // End of file record
    lines.push(":00000001FF");

    return lines.join("\r\n");
  }

  /**
   * Format a single Intel HEX record
   */
  private static formatIntelHexRecord(
    address: number,
    type: number,
    data: number[],
  ): string {
    const length = data.length;
    let checksum = length + (address >> 8) + (address & 0xff) + type;

    let record = ":";
    record += length.toString(16).padStart(2, "0").toUpperCase();
    record += address.toString(16).padStart(4, "0").toUpperCase();
    record += type.toString(16).padStart(2, "0").toUpperCase();

    for (const byte of data) {
      record += byte.toString(16).padStart(2, "0").toUpperCase();
      checksum += byte;
    }

    checksum = (~checksum + 1) & 0xff;
    record += checksum.toString(16).padStart(2, "0").toUpperCase();

    return record;
  }

  /**
   * Convert binary data to Motorola S-record format string
   */
  static toSRecord(
    data: Uint8Array,
    baseAddress: number = 0,
    use32bit: boolean = true,
  ): string {
    const lines: string[] = [];
    const recordSize = 32; // 32 bytes per record

    // Header record
    lines.push(this.formatSRecord("S0", 0, [0x48, 0x44, 0x52])); // "HDR"

    // Data records
    for (let offset = 0; offset < data.length; offset += recordSize) {
      const address = baseAddress + offset;
      const length = Math.min(recordSize, data.length - offset);
      const recordData = Array.from(data.slice(offset, offset + length));

      // Choose record type based on address size
      let recordType: string;
      if (use32bit || address > 0xffffff) {
        recordType = "S3"; // 32-bit address
      } else if (address > 0xffff) {
        recordType = "S2"; // 24-bit address
      } else {
        recordType = "S1"; // 16-bit address
      }

      lines.push(this.formatSRecord(recordType, address, recordData));
    }

    // Count record (optional, we'll use S5 for 16-bit count)
    const recordCount = Math.floor(data.length / recordSize) + 1;
    if (recordCount <= 0xffff) {
      lines.push(this.formatSRecord("S5", recordCount, []));
    }

    // Termination record with start address
    if (use32bit) {
      lines.push(this.formatSRecord("S7", baseAddress, []));
    } else if (baseAddress > 0xffff) {
      lines.push(this.formatSRecord("S8", baseAddress, []));
    } else {
      lines.push(this.formatSRecord("S9", baseAddress, []));
    }

    return lines.join("\r\n");
  }

  /**
   * Format a single S-record
   */
  private static formatSRecord(
    type: string,
    address: number,
    data: number[],
  ): string {
    let addrBytes: number;
    switch (type) {
      case "S0":
      case "S1":
      case "S5":
      case "S9":
        addrBytes = 2;
        break;
      case "S2":
      case "S8":
        addrBytes = 3;
        break;
      case "S3":
      case "S7":
        addrBytes = 4;
        break;
      default:
        throw new Error(`Invalid S-record type: ${type}`);
    }

    const count = addrBytes + data.length + 1; // address + data + checksum
    let checksum = count;

    let record = type;
    record += count.toString(16).padStart(2, "0").toUpperCase();

    // Add address bytes
    for (let i = addrBytes - 1; i >= 0; i--) {
      const byte = (address >> (i * 8)) & 0xff;
      record += byte.toString(16).padStart(2, "0").toUpperCase();
      checksum += byte;
    }

    // Add data bytes
    for (const byte of data) {
      record += byte.toString(16).padStart(2, "0").toUpperCase();
      checksum += byte;
    }

    // Add checksum (one's complement)
    checksum = ~checksum & 0xff;
    record += checksum.toString(16).padStart(2, "0").toUpperCase();

    return record;
  }

  /**
   * Convert segments to GDB vFlash commands
   */
  static segmentsToFlashCommands(segments: MemorySegment[]): string[] {
    const commands: string[] = [];

    for (const segment of segments) {
      // Convert to hex string for GDB
      const hexData = Array.from(segment.data)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      commands.push(`vFlashWrite:${segment.address.toString(16)}:${hexData}`);
    }

    return commands;
  }
}
