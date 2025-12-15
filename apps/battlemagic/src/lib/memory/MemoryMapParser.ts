export interface MemoryRegion {
  name: string;
  start: number;
  end: number;
  size: number;
  type: MemoryType;
  permissions: MemoryPermissions;
  used?: number;
  description?: string;
  attributes?: Record<string, string>;
}

export enum MemoryType {
  FLASH = "flash",
  RAM = "ram",
  SRAM = "sram",
  PERIPHERAL = "peripheral",
  EXTERNAL_RAM = "external_ram",
  EXTERNAL_DEVICE = "external_device",
  SYSTEM = "system",
  RESERVED = "reserved",
  UNKNOWN = "unknown",
}

export interface MemoryPermissions {
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface MemoryStatistics {
  totalFlash: number;
  usedFlash: number;
  totalRam: number;
  usedRam: number;
  stackPointer?: number;
  heapStart?: number;
  heapEnd?: number;
  vectorTableAddress?: number;
}

// Standard ARM Cortex-M memory map regions
const ARM_MEMORY_MAP = {
  CODE: {
    start: 0x00000000,
    end: 0x1fffffff,
    name: "Code",
    type: MemoryType.FLASH,
  },
  SRAM: {
    start: 0x20000000,
    end: 0x3fffffff,
    name: "SRAM",
    type: MemoryType.SRAM,
  },
  PERIPHERAL: {
    start: 0x40000000,
    end: 0x5fffffff,
    name: "Peripheral",
    type: MemoryType.PERIPHERAL,
  },
  EXTERNAL_RAM: {
    start: 0x60000000,
    end: 0x9fffffff,
    name: "External RAM",
    type: MemoryType.EXTERNAL_RAM,
  },
  EXTERNAL_DEVICE: {
    start: 0xa0000000,
    end: 0xdfffffff,
    name: "External Device",
    type: MemoryType.EXTERNAL_DEVICE,
  },
  SYSTEM: {
    start: 0xe0000000,
    end: 0xffffffff,
    name: "System",
    type: MemoryType.SYSTEM,
  },
};

export class MemoryMapParser {
  private regions: MemoryRegion[] = [];
  private statistics: MemoryStatistics = {
    totalFlash: 0,
    usedFlash: 0,
    totalRam: 0,
    usedRam: 0,
  };

  /**
   * Parse GDB memory info output
   * Example format: "Memory region 0x08000000-0x08100000, flash, rwx"
   */
  parseGdbMemoryInfo(output: string): MemoryRegion[] {
    const lines = output.split("\n");
    const regions: MemoryRegion[] = [];

    for (const line of lines) {
      const match = line.match(
        /Memory region\s+(0x[0-9a-fA-F]+)-(0x[0-9a-fA-F]+),?\s*(\w+)?,?\s*([rwx-]+)?/,
      );
      if (match) {
        const start = parseInt(match[1], 16);
        const end = parseInt(match[2], 16);
        const typeName = match[3] || "unknown";
        const permissions = match[4] || "rwx";

        regions.push({
          name: this.getRegionName(start, typeName),
          start,
          end,
          size: end - start,
          type: this.parseMemoryType(typeName, start),
          permissions: this.parsePermissions(permissions),
        });
      }
    }

    this.regions = regions;
    return regions;
  }

  /**
   * Parse target description XML for memory regions
   */
  parseTargetDescription(xml: string): MemoryRegion[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const memoryNodes = doc.querySelectorAll("memory");
    const regions: MemoryRegion[] = [];

    memoryNodes.forEach((node) => {
      const start = parseInt(node.getAttribute("start") || "0", 16);
      const length = parseInt(node.getAttribute("length") || "0", 16);
      const type = node.getAttribute("type") || "ram";
      const name = node.getAttribute("name") || this.getRegionName(start, type);

      if (length > 0) {
        regions.push({
          name,
          start,
          end: start + length,
          size: length,
          type: this.parseMemoryType(type, start),
          permissions: {
            read: true,
            write: type !== "rom" && type !== "flash",
            execute: type === "rom" || type === "flash",
          },
        });
      }
    });

    this.regions = regions;
    return regions;
  }

  /**
   * Get standard ARM memory regions
   */
  getStandardArmRegions(): MemoryRegion[] {
    return Object.values(ARM_MEMORY_MAP).map((region) => ({
      name: region.name,
      start: region.start,
      end: region.end,
      size: region.end - region.start + 1,
      type: region.type,
      permissions: this.getDefaultPermissions(region.type),
      description: this.getRegionDescription(region.type),
    }));
  }

  /**
   * Detect actual memory regions within ARM standard regions
   */
  detectMemoryRegions(): MemoryRegion[] {
    // We'll use detected regions rather than base regions for now

    // Add common MCU-specific regions
    const detectedRegions: MemoryRegion[] = [];

    // Common flash region for STM32/ARM MCUs
    detectedRegions.push({
      name: "Main Flash",
      start: 0x08000000,
      end: 0x08100000, // 1MB flash (adjust based on target)
      size: 0x100000,
      type: MemoryType.FLASH,
      permissions: { read: true, write: false, execute: true },
      description: "Main program flash memory",
    });

    // Common SRAM region
    detectedRegions.push({
      name: "Main SRAM",
      start: 0x20000000,
      end: 0x20020000, // 128KB SRAM (adjust based on target)
      size: 0x20000,
      type: MemoryType.SRAM,
      permissions: { read: true, write: true, execute: false },
      description: "Main data RAM",
    });

    // Backup SRAM (if present)
    detectedRegions.push({
      name: "Backup SRAM",
      start: 0x40024000,
      end: 0x40024fff,
      size: 0x1000,
      type: MemoryType.SRAM,
      permissions: { read: true, write: true, execute: false },
      description: "Battery-backed SRAM",
    });

    // Core peripherals
    detectedRegions.push({
      name: "Core Peripherals",
      start: 0xe0000000,
      end: 0xe00fffff,
      size: 0x100000,
      type: MemoryType.SYSTEM,
      permissions: { read: true, write: true, execute: false },
      description: "Cortex-M core peripherals (NVIC, SysTick, etc.)",
    });

    this.regions = detectedRegions;
    return detectedRegions;
  }

  /**
   * Calculate memory statistics from regions
   */
  calculateStatistics(regions?: MemoryRegion[]): MemoryStatistics {
    const regs = regions || this.regions;

    let totalFlash = 0;
    let usedFlash = 0;
    let totalRam = 0;
    let usedRam = 0;

    for (const region of regs) {
      if (region.type === MemoryType.FLASH) {
        totalFlash += region.size;
        usedFlash += region.used || 0;
      } else if (
        region.type === MemoryType.RAM ||
        region.type === MemoryType.SRAM
      ) {
        totalRam += region.size;
        usedRam += region.used || 0;
      }
    }

    this.statistics = {
      totalFlash,
      usedFlash,
      totalRam,
      usedRam,
    };

    return this.statistics;
  }

  /**
   * Update memory usage from GDB data
   */
  updateMemoryUsage(
    symbolData: Map<string, number>,
    stackPointer?: number,
    heapInfo?: { start: number; end: number },
  ) {
    // Update statistics with runtime data
    if (stackPointer) {
      this.statistics.stackPointer = stackPointer;
    }

    if (heapInfo) {
      this.statistics.heapStart = heapInfo.start;
      this.statistics.heapEnd = heapInfo.end;
    }

    // Find vector table
    const vectorTable =
      symbolData.get("g_pfnVectors") || symbolData.get("__isr_vector");
    if (vectorTable) {
      this.statistics.vectorTableAddress = vectorTable;
    }

    // Update region usage based on symbols
    for (const region of this.regions) {
      if (region.type === MemoryType.FLASH) {
        // Calculate flash usage from symbols in flash range
        let used = 0;
        symbolData.forEach((addr) => {
          if (addr >= region.start && addr <= region.end) {
            used = Math.max(used, addr - region.start);
          }
        });
        region.used = used;
      } else if (
        region.type === MemoryType.RAM ||
        region.type === MemoryType.SRAM
      ) {
        // Calculate RAM usage from stack and heap
        if (
          stackPointer &&
          stackPointer >= region.start &&
          stackPointer <= region.end
        ) {
          region.used = region.end - stackPointer;
        }
        if (
          heapInfo &&
          heapInfo.start >= region.start &&
          heapInfo.end <= region.end
        ) {
          region.used = (region.used || 0) + (heapInfo.end - heapInfo.start);
        }
      }
    }

    this.calculateStatistics();
  }

  /**
   * Get memory region at address
   */
  getRegionAtAddress(address: number): MemoryRegion | undefined {
    return this.regions.find((r) => address >= r.start && address <= r.end);
  }

  /**
   * Format size for display
   */
  static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  /**
   * Format address as hex string
   */
  static formatAddress(address: number): string {
    return "0x" + address.toString(16).toUpperCase().padStart(8, "0");
  }

  private parseMemoryType(typeName: string, address: number): MemoryType {
    const type = typeName.toLowerCase();

    if (type.includes("flash") || type.includes("rom")) return MemoryType.FLASH;
    if (type.includes("ram") || type.includes("sram")) return MemoryType.SRAM;
    if (type.includes("peripheral")) return MemoryType.PERIPHERAL;
    if (type.includes("external")) return MemoryType.EXTERNAL_RAM;
    if (type.includes("system")) return MemoryType.SYSTEM;

    // Fallback to address-based detection
    return this.getMemoryTypeFromAddress(address);
  }

  private getMemoryTypeFromAddress(address: number): MemoryType {
    for (const region of Object.values(ARM_MEMORY_MAP)) {
      if (address >= region.start && address <= region.end) {
        return region.type;
      }
    }
    return MemoryType.UNKNOWN;
  }

  private parsePermissions(perms: string): MemoryPermissions {
    return {
      read: perms.includes("r"),
      write: perms.includes("w"),
      execute: perms.includes("x"),
    };
  }

  private getDefaultPermissions(type: MemoryType): MemoryPermissions {
    switch (type) {
      case MemoryType.FLASH:
        return { read: true, write: false, execute: true };
      case MemoryType.RAM:
      case MemoryType.SRAM:
        return { read: true, write: true, execute: false };
      case MemoryType.PERIPHERAL:
      case MemoryType.SYSTEM:
        return { read: true, write: true, execute: false };
      default:
        return { read: true, write: false, execute: false };
    }
  }

  private getRegionName(address: number, typeName?: string): string {
    if (typeName && typeName !== "unknown") {
      return typeName.charAt(0).toUpperCase() + typeName.slice(1);
    }

    for (const region of Object.values(ARM_MEMORY_MAP)) {
      if (address >= region.start && address <= region.end) {
        return region.name;
      }
    }

    return "Unknown";
  }

  private getRegionDescription(type: MemoryType): string {
    const descriptions: Record<MemoryType, string> = {
      [MemoryType.FLASH]: "Non-volatile program memory",
      [MemoryType.RAM]: "Random access memory for data",
      [MemoryType.SRAM]: "Static RAM for data and stack",
      [MemoryType.PERIPHERAL]: "Memory-mapped peripheral registers",
      [MemoryType.EXTERNAL_RAM]: "External RAM interface",
      [MemoryType.EXTERNAL_DEVICE]: "External device memory space",
      [MemoryType.SYSTEM]: "System control and debug registers",
      [MemoryType.RESERVED]: "Reserved memory region",
      [MemoryType.UNKNOWN]: "Unknown memory type",
    };
    return descriptions[type];
  }

  getRegions(): MemoryRegion[] {
    return this.regions;
  }

  getStatistics(): MemoryStatistics {
    return this.statistics;
  }
}
