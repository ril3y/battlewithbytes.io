/**
 * Target Information Module
 *
 * Handles querying and parsing target information from Black Magic Probe
 * including chip identification, memory layout, and connection status.
 */

import { BlackMagicCommands } from './BlackMagicCommands';
import type { GdbClient } from './GdbClient';
import type { Target, BmpVersion } from './types';

/**
 * Target chip information
 */
export interface ChipInfo {
  /** Chip ID/IDCODE */
  id: string;
  /** Chip description/name */
  description: string;
  /** Manufacturer */
  manufacturer?: string;
  /** Device family */
  family?: string;
  /** CPU core type */
  core?: string;
}

/**
 * Memory region information
 */
export interface MemoryRegion {
  /** Region name */
  name: string;
  /** Start address */
  start: number;
  /** Size in bytes */
  size: number;
  /** Access permissions */
  access: 'r' | 'w' | 'rw' | 'rx' | 'rwx';
}

/**
 * Complete target information
 */
export interface TargetInformation {
  /** Connection state */
  connectionState: 'disconnected' | 'probe_connected' | 'target_attached';
  /** Target voltage in volts */
  voltage: number | null;
  /** Chip information */
  chip: ChipInfo | null;
  /** Memory regions */
  memory: {
    flash: MemoryRegion[];
    ram: MemoryRegion[];
    other: MemoryRegion[];
  };
  /** Debug interface in use */
  interface: 'swd' | 'jtag' | null;
  /** Probe version */
  probeVersion: BmpVersion | null;
  /** Supported features */
  features: string[];
  /** Raw target description */
  rawDescription?: string;
}

/**
 * Target Information Manager
 */
export class TargetInfo {
  private client: GdbClient;
  private cachedInfo: Partial<TargetInformation> = {};

  constructor(client: GdbClient) {
    this.client = client;
  }

  /**
   * Get complete target information
   *
   * @param forceRefresh - Force refresh of cached information
   * @returns Target information
   */
  async getTargetInfo(forceRefresh = false): Promise<TargetInformation> {
    if (forceRefresh) {
      this.cachedInfo = {};
    }

    const info: TargetInformation = {
      connectionState: this.getConnectionState(),
      voltage: null,
      chip: null,
      memory: { flash: [], ram: [], other: [] },
      interface: null,
      probeVersion: null,
      features: [],
      rawDescription: undefined
    };

    // Get probe version (always available if connected)
    if (this.client.isConnected()) {
      try {
        info.probeVersion = await this.getProbeVersion();
      } catch (e) {
        console.warn('Failed to get probe version:', e);
      }

      // Get supported features
      try {
        info.features = await this.getSupportedFeatures();
      } catch (e) {
        console.warn('Failed to get supported features:', e);
      }
    }

    // Try to scan for targets and get voltage
    const scanResult = await this.scanForTargets();
    if (scanResult) {
      info.voltage = scanResult.voltage;
      info.interface = scanResult.interface;

      if (scanResult.targets.length > 0) {
        // Parse chip info from target description
        info.chip = this.parseChipInfo(scanResult.targets[0]);
        info.rawDescription = scanResult.targets[0].description;
      }
    }

    // If attached, get memory map
    if (info.connectionState === 'target_attached') {
      try {
        const memoryMap = await this.getMemoryMap();
        info.memory = memoryMap;
      } catch (e) {
        console.warn('Failed to get memory map:', e);
      }

      // Try to get chip ID via direct register read
      try {
        const chipId = await this.readChipId();
        if (chipId && info.chip) {
          info.chip.id = chipId;
        }
      } catch (e) {
        console.warn('Failed to read chip ID:', e);
      }
    }

    return info;
  }

  /**
   * Get connection state
   */
  private getConnectionState(): TargetInformation['connectionState'] {
    const state = this.client.getState();
    switch (state) {
      case 'attached':
        return 'target_attached';
      case 'connected':
        return 'probe_connected';
      default:
        return 'disconnected';
    }
  }

  /**
   * Get probe version
   */
  private async getProbeVersion(): Promise<BmpVersion> {
    return await this.client.getVersion();
  }

  /**
   * Scan for targets using both SWD and JTAG
   */
  private async scanForTargets(): Promise<{
    targets: Target[];
    voltage: number | null;
    interface: 'swd' | 'jtag' | null;
  } | null> {
    // Try SWD first (most common for ARM Cortex-M)
    try {
      const swdResult = await this.client.scanSwd();
      if (swdResult.targets.length > 0) {
        return {
          targets: swdResult.targets,
          voltage: swdResult.voltage,
          interface: 'swd'
        };
      }
    } catch (e) {
      console.debug('SWD scan failed:', e);
    }

    // Try JTAG if SWD failed
    try {
      const jtagResult = await this.client.scanJtag();
      if (jtagResult.targets.length > 0) {
        return {
          targets: jtagResult.targets,
          voltage: jtagResult.voltage,
          interface: 'jtag'
        };
      }
    } catch (e) {
      console.debug('JTAG scan failed:', e);
    }

    return null;
  }

  /**
   * Parse chip information from target description
   */
  private parseChipInfo(target: Target): ChipInfo {
    const desc = target.description;
    const info: ChipInfo = {
      id: '',
      description: desc
    };

    // Common patterns in Black Magic Probe target descriptions
    // Examples: "STM32F407VG", "STM32L4xx", "nRF52840", "SAMD21", "LPC1768"

    // STM32 family
    if (desc.includes('STM32')) {
      info.manufacturer = 'STMicroelectronics';
      info.core = this.detectCortexCore(desc);

      if (desc.match(/STM32F[0-4]/)) {
        info.family = 'STM32F' + desc.match(/STM32F([0-4])/)?.[1];
      } else if (desc.match(/STM32L[0-4]/)) {
        info.family = 'STM32L' + desc.match(/STM32L([0-4])/)?.[1];
      } else if (desc.match(/STM32G[0-4]/)) {
        info.family = 'STM32G' + desc.match(/STM32G([0-4])/)?.[1];
      } else if (desc.match(/STM32H7/)) {
        info.family = 'STM32H7';
        info.core = 'Cortex-M7';
      }
    }
    // Nordic nRF
    else if (desc.includes('nRF')) {
      info.manufacturer = 'Nordic Semiconductor';
      info.family = desc.match(/nRF\d+/)?.[0] || 'nRF';
      info.core = 'Cortex-M4';
    }
    // Atmel/Microchip SAMD
    else if (desc.includes('SAMD') || desc.includes('SAME')) {
      info.manufacturer = 'Microchip';
      info.family = desc.match(/SAM[DE]\d+/)?.[0] || 'SAM';
      info.core = desc.includes('SAMD5') || desc.includes('SAME5') ? 'Cortex-M4' : 'Cortex-M0+';
    }
    // NXP LPC
    else if (desc.includes('LPC')) {
      info.manufacturer = 'NXP';
      info.family = desc.match(/LPC\d+/)?.[0] || 'LPC';
      info.core = this.detectCortexCore(desc);
    }
    // RP2040
    else if (desc.includes('RP2040')) {
      info.manufacturer = 'Raspberry Pi';
      info.family = 'RP2040';
      info.core = 'Cortex-M0+';
    }

    return info;
  }

  /**
   * Detect Cortex core type from description
   */
  private detectCortexCore(desc: string): string {
    if (desc.includes('Cortex-M0')) return 'Cortex-M0+';
    if (desc.includes('Cortex-M3')) return 'Cortex-M3';
    if (desc.includes('Cortex-M4')) return 'Cortex-M4';
    if (desc.includes('Cortex-M7')) return 'Cortex-M7';
    if (desc.includes('Cortex-M23')) return 'Cortex-M23';
    if (desc.includes('Cortex-M33')) return 'Cortex-M33';

    // Guess based on STM32 family
    if (desc.includes('STM32F0')) return 'Cortex-M0';
    if (desc.includes('STM32F1') || desc.includes('STM32F2')) return 'Cortex-M3';
    if (desc.includes('STM32F3') || desc.includes('STM32F4')) return 'Cortex-M4';
    if (desc.includes('STM32F7')) return 'Cortex-M7';
    if (desc.includes('STM32L0')) return 'Cortex-M0+';
    if (desc.includes('STM32L1')) return 'Cortex-M3';
    if (desc.includes('STM32L4')) return 'Cortex-M4';

    return 'Cortex-M';
  }

  /**
   * Get memory map from target
   *
   * Uses 'monitor memory_map' command or XML target description
   */
  private async getMemoryMap(): Promise<TargetInformation['memory']> {
    const memory: TargetInformation['memory'] = {
      flash: [],
      ram: [],
      other: []
    };

    try {
      // Try monitor command first
      const cmd = BlackMagicCommands.buildMonitorCommand('memory_map');
      const response = await this.client.sendCommand(cmd);

      if (response.type === 'data') {
        const decoded = BlackMagicCommands.decodeMonitorResponse(response.data);
        const regions = this.parseMemoryMap(decoded);

        for (const region of regions) {
          if (region.name.toLowerCase().includes('flash')) {
            memory.flash.push(region);
          } else if (region.name.toLowerCase().includes('ram') ||
                     region.name.toLowerCase().includes('sram')) {
            memory.ram.push(region);
          } else {
            memory.other.push(region);
          }
        }
      }
    } catch {
      // Fallback: Try qXfer:memory-map:read
      try {
        const xmlResponse = await this.client.sendCommand('qXfer:memory-map:read::0,1000');
        if (xmlResponse.type === 'data') {
          // Parse XML memory map (simplified)
          const regions = this.parseXmlMemoryMap(xmlResponse.data);
          memory.flash = regions.filter(r => r.name.includes('flash'));
          memory.ram = regions.filter(r => r.name.includes('ram'));
          memory.other = regions.filter(r => !r.name.includes('flash') && !r.name.includes('ram'));
        }
      } catch {
        // If all else fails, use typical Cortex-M memory layout
        memory.flash.push({
          name: 'Flash',
          start: 0x08000000,
          size: 0x100000, // 1MB assumed
          access: 'rx'
        });
        memory.ram.push({
          name: 'SRAM',
          start: 0x20000000,
          size: 0x20000, // 128KB assumed
          access: 'rwx'
        });
      }
    }

    return memory;
  }

  /**
   * Parse memory map from monitor command output
   */
  private parseMemoryMap(output: string): MemoryRegion[] {
    const regions: MemoryRegion[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Expected format: "Flash: 0x08000000 - 0x08100000 (1024K)"
      // Or: "RAM: 0x20000000 - 0x20020000 (128K)"
      const match = line.match(/(\w+):\s*0x([0-9a-fA-F]+)\s*-\s*0x([0-9a-fA-F]+)\s*\((\d+)K?\)/);
      if (match) {
        const name = match[1];
        const start = parseInt(match[2], 16);
        const end = parseInt(match[3], 16);
        const size = end - start;

        regions.push({
          name,
          start,
          size,
          access: name.toLowerCase().includes('flash') ? 'rx' : 'rwx'
        });
      }
    }

    return regions;
  }

  /**
   * Parse XML memory map (simplified parser)
   */
  private parseXmlMemoryMap(xml: string): MemoryRegion[] {
    const regions: MemoryRegion[] = [];

    // Very simple XML parsing for memory regions
    const memoryRegex = /<memory\s+type="(\w+)"\s+start="(0x[0-9a-fA-F]+)"\s+length="(0x[0-9a-fA-F]+)"/g;
    let match;

    while ((match = memoryRegex.exec(xml)) !== null) {
      regions.push({
        name: match[1],
        start: parseInt(match[2], 16),
        size: parseInt(match[3], 16),
        access: match[1].toLowerCase().includes('flash') ? 'rx' : 'rwx'
      });
    }

    return regions;
  }

  /**
   * Read chip ID from known register locations
   */
  private async readChipId(): Promise<string | null> {
    try {
      // STM32 DBGMCU_IDCODE register
      const stm32IdAddr = 0xE0042000;
      const idData = await this.client.readMemory(stm32IdAddr, 4);
      const idValue = new DataView(idData.buffer).getUint32(0, true);

      if (idValue !== 0 && idValue !== 0xFFFFFFFF) {
        const devId = (idValue & 0xFFF);
        const revId = (idValue >> 16) & 0xFFFF;
        return `DEV:0x${devId.toString(16).toUpperCase()} REV:0x${revId.toString(16).toUpperCase()}`;
      }
    } catch {
      // Not an STM32 or couldn't read
    }

    try {
      // ARM Cortex-M CPUID register
      const cpuidAddr = 0xE000ED00;
      const cpuidData = await this.client.readMemory(cpuidAddr, 4);
      const cpuidValue = new DataView(cpuidData.buffer).getUint32(0, true);

      if (cpuidValue !== 0 && cpuidValue !== 0xFFFFFFFF) {
        // CPUID register format: [31:24]Implementer [23:20]Variant [19:16]Architecture [15:4]PartNo [3:0]Revision
        // We'll just return the full CPUID value for now
        return `CPUID:0x${cpuidValue.toString(16).toUpperCase()}`;
      }
    } catch {
      // Couldn't read CPUID
    }

    return null;
  }

  /**
   * Get supported features from probe
   */
  private async getSupportedFeatures(): Promise<string[]> {
    const features: string[] = [];

    try {
      const response = await this.client.sendCommand('qSupported');
      if (response.type === 'data') {
        // Parse supported features
        const items = response.data.split(';');
        for (const item of items) {
          if (item.includes('+') || item.includes('=')) {
            const feature = item.split(/[+=]/)[0];
            if (feature) features.push(feature);
          }
        }
      }
    } catch {
      // Ignore errors
    }

    // Check for Black Magic specific features
    const bmpFeatures = [
      'swdp_scan',
      'jtag_scan',
      'tpwr',
      'monitor',
      'hard_reset'
    ];

    for (const feature of bmpFeatures) {
      try {
        const cmd = BlackMagicCommands.buildMonitorCommand(`help ${feature}`);
        const response = await this.client.sendCommand(cmd);
        if (response.type === 'data') {
          features.push(feature);
        }
      } catch {
        // Feature not supported
      }
    }

    return features;
  }

  /**
   * Format memory size for display
   */
  static formatMemorySize(bytes: number): string {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(0)}KB`;
    } else {
      return `${bytes}B`;
    }
  }

  /**
   * Format address for display
   */
  static formatAddress(addr: number): string {
    return '0x' + addr.toString(16).toUpperCase().padStart(8, '0');
  }
}

/**
 * GDB RSP Commands Reference for Black Magic Probe
 *
 * ## Monitor Commands (qRcmd)
 * Monitor commands are sent as: qRcmd,<hex-encoded-command>
 * Response: hex-encoded output or 'OK'
 *
 * ### Scanning and Target Detection
 * - `monitor swdp_scan` - Scan for SWD targets
 *   Response: "Target voltage: X.XV\nAvailable Targets:\nNo. Att Driver\n 1      STM32F4xx\n"
 *
 * - `monitor jtag_scan` - Scan for JTAG targets
 *   Response: Similar format with JTAG chain info
 *
 * ### Power Control
 * - `monitor tpwr enable` - Enable target power
 * - `monitor tpwr disable` - Disable target power
 *
 * ### Version and Info
 * - `monitor version` - Get BMP firmware version
 *   Response: "Black Magic Probe (Firmware v1.7.1) (Hardware Version 3)\n"
 *
 * - `monitor help` - List available monitor commands
 *
 * ### Memory Information
 * - `monitor memory_map` - Get target memory map (if supported)
 *   Response: Memory regions with addresses and sizes
 *
 * ## Standard RSP Commands
 *
 * ### Connection and Features
 * - `qSupported` - Query supported features
 *   Response: "PacketSize=400;qXfer:memory-map:read+;..."
 *
 * ### Target Information
 * - `qXfer:memory-map:read::offset,length` - Read XML memory map
 *   Response: XML document with memory regions
 *
 * - `qXfer:features:read:target.xml:offset,length` - Read target description
 *   Response: XML with architecture and register info
 *
 * ### Attachment
 * - `vAttach;1` - Attach to target 1 (from scan)
 *   Response: 'T05' (stop reply) or 'E' (error)
 *
 * ### Memory Access (when attached)
 * - `m<addr>,<length>` - Read memory
 *   Response: Hex encoded bytes or 'E' for error
 *
 * ### Special Addresses for Chip ID
 * - STM32: Read from 0xE0042000 (DBGMCU_IDCODE)
 * - Cortex-M: Read from 0xE000ED00 (CPUID)
 *
 * ## Response Parsing
 *
 * ### Target Voltage
 * Extract from scan output: /Target voltage:\s*([\d.]+)\s*V/
 *
 * ### Target List
 * Parse lines matching: /^\s*(\d+)\s+(.+)$/
 * Where $1 is target number and $2 is description
 *
 * ### Connection States
 * 1. Disconnected - No serial connection
 * 2. Probe Connected - Serial connected, no target
 * 3. Target Attached - Attached to specific target
 *
 * ## Error Handling
 * - 'E01' - General error
 * - '' (empty) - Unsupported command
 * - No response - Timeout (target may be in invalid state)
 */