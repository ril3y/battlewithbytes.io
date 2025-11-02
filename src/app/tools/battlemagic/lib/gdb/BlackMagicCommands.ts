/**
 * Black Magic Probe Specific Commands
 *
 * High-level command wrappers for Black Magic Probe monitor commands
 * and GDB operations. These methods build on the GDB client to provide
 * probe-specific functionality.
 */

import { PowerState } from './types';
import type { Target, BmpVersion } from './types';

/**
 * Black Magic Probe command builder and parser
 */
export class BlackMagicCommands {
  /**
   * Build a monitor command
   *
   * Monitor commands are sent to the debug probe itself, not the target.
   * Format: qRcmd,<hex-encoded-command>
   *
   * @param command - Monitor command string
   * @returns GDB command string
   */
  static buildMonitorCommand(command: string): string {
    // Convert command to hex
    const hexCommand = Array.from(command)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
    return `qRcmd,${hexCommand}`;
  }

  /**
   * Decode hex-encoded monitor response
   *
   * Monitor command responses are hex-encoded strings.
   *
   * @param hexData - Hex-encoded response
   * @returns Decoded string
   */
  static decodeMonitorResponse(hexData: string): string {
    let result = '';
    for (let i = 0; i < hexData.length; i += 2) {
      const byte = parseInt(hexData.substring(i, i + 2), 16);
      result += String.fromCharCode(byte);
    }
    return result;
  }

  /**
   * Build SWD scan command
   *
   * Scans for targets using Serial Wire Debug interface.
   *
   * @returns Monitor command
   */
  static buildSwdScan(): string {
    return this.buildMonitorCommand('swdp_scan');
  }

  /**
   * Build JTAG scan command
   *
   * Scans for targets using JTAG interface.
   *
   * @returns Monitor command
   */
  static buildJtagScan(): string {
    return this.buildMonitorCommand('jtag_scan');
  }

  /**
   * Build target power enable command
   *
   * @returns Monitor command
   */
  static buildPowerEnable(): string {
    return this.buildMonitorCommand('tpwr enable');
  }

  /**
   * Build target power disable command
   *
   * @returns Monitor command
   */
  static buildPowerDisable(): string {
    return this.buildMonitorCommand('tpwr disable');
  }

  /**
   * Build version query command
   *
   * @returns Monitor command
   */
  static buildVersionQuery(): string {
    return this.buildMonitorCommand('version');
  }

  /**
   * Build target reset command
   *
   * @returns Monitor command
   */
  static buildReset(): string {
    return this.buildMonitorCommand('reset');
  }

  /**
   * Build hard reset command
   *
   * Some targets support hard reset which performs a full system reset.
   *
   * @returns Monitor command
   */
  static buildHardReset(): string {
    return this.buildMonitorCommand('hard_reset');
  }

  /**
   * Build attach command
   *
   * Format: vAttach;N (where N is hex target ID)
   *
   * @param targetId - Target ID from scan
   * @returns Attach command
   */
  static buildAttach(targetId: number): string {
    const hexId = targetId.toString(16);
    return `vAttach;${hexId}`;
  }

  /**
   * Build detach command
   *
   * @returns Detach command
   */
  static buildDetach(): string {
    return 'D';
  }

  /**
   * Build continue command
   *
   * Resumes execution of the target.
   *
   * @returns Continue command
   */
  static buildContinue(): string {
    return 'c';
  }

  /**
   * Build step command
   *
   * Single-steps the target.
   *
   * @returns Step command
   */
  static buildStep(): string {
    return 's';
  }

  /**
   * Build halt command (Ctrl+C)
   *
   * @returns Interrupt character
   */
  static buildHalt(): string {
    return '\x03';
  }

  /**
   * Build memory read command
   *
   * Format: maddr,length
   *
   * @param address - Memory address (number or hex string)
   * @param length - Number of bytes to read
   * @returns Memory read command
   */
  static buildMemoryRead(address: number | string, length: number): string {
    const addrHex = typeof address === 'number'
      ? address.toString(16)
      : address;
    const lengthHex = length.toString(16);
    return `m${addrHex},${lengthHex}`;
  }

  /**
   * Build memory write command
   *
   * Format: Maddr,length:XX... (hex bytes)
   *
   * @param address - Memory address (number or hex string)
   * @param data - Data bytes to write
   * @returns Memory write command
   */
  static buildMemoryWrite(address: number | string, data: Uint8Array): string {
    const addrHex = typeof address === 'number'
      ? address.toString(16)
      : address;
    const lengthHex = data.length.toString(16);
    const hexData = Array.from(data)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `M${addrHex},${lengthHex}:${hexData}`;
  }

  /**
   * Build register read command
   *
   * Format: g (reads all registers)
   *
   * @returns Register read command
   */
  static buildReadRegisters(): string {
    return 'g';
  }

  /**
   * Build single register read command
   *
   * Format: pn (where n is hex register number)
   *
   * @param regNum - Register number
   * @returns Register read command
   */
  static buildReadRegister(regNum: number): string {
    return `p${regNum.toString(16)}`;
  }

  /**
   * Build register write command
   *
   * Format: Pn=value (where n is hex register number, value is hex)
   *
   * @param regNum - Register number
   * @param value - Register value (hex string)
   * @returns Register write command
   */
  static buildWriteRegister(regNum: number, value: string): string {
    return `P${regNum.toString(16)}=${value}`;
  }

  /**
   * Build breakpoint insert command
   *
   * Format: Z0,addr,kind (software breakpoint)
   * Format: Z1,addr,kind (hardware breakpoint)
   *
   * @param address - Breakpoint address
   * @param hardware - Use hardware breakpoint (default: false)
   * @param kind - Breakpoint kind (typically instruction size, default: 2)
   * @returns Breakpoint insert command
   */
  static buildInsertBreakpoint(
    address: number | string,
    hardware = false,
    kind = 2
  ): string {
    const type = hardware ? '1' : '0';
    const addrHex = typeof address === 'number'
      ? address.toString(16)
      : address;
    return `Z${type},${addrHex},${kind}`;
  }

  /**
   * Build breakpoint remove command
   *
   * Format: z0,addr,kind (software breakpoint)
   * Format: z1,addr,kind (hardware breakpoint)
   *
   * @param address - Breakpoint address
   * @param hardware - Hardware breakpoint (default: false)
   * @param kind - Breakpoint kind (default: 2)
   * @returns Breakpoint remove command
   */
  static buildRemoveBreakpoint(
    address: number | string,
    hardware = false,
    kind = 2
  ): string {
    const type = hardware ? '1' : '0';
    const addrHex = typeof address === 'number'
      ? address.toString(16)
      : address;
    return `z${type},${addrHex},${kind}`;
  }

  /**
   * Parse scan results to extract target information
   *
   * Black Magic Probe scan output format varies, but typically includes:
   * - "Target voltage: X.XV"
   * - "Available Targets:"
   * - "No. Att Driver"
   * - " 1      STM32F4xx"
   *
   * @param scanOutput - Decoded monitor command response
   * @returns Array of detected targets
   */
  static parseScanResults(scanOutput: string): Target[] {
    const targets: Target[] = [];
    const lines = scanOutput.split('\n');

    // Look for target lines (format: " N      Description")
    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(/^(\d+)\s+(.+)$/);

      if (match) {
        const id = parseInt(match[1]);
        const description = match[2].trim();

        targets.push({
          id,
          description,
          type: description // Use description as type for now
        });
      }
    }

    return targets;
  }

  /**
   * Parse version information
   *
   * Expected format:
   * "Black Magic Probe (Firmware vX.Y.Z) (Hardware Version X)"
   *
   * @param versionOutput - Decoded version response
   * @returns Parsed version info
   */
  static parseVersion(versionOutput: string): BmpVersion {
    const version: BmpVersion = {
      firmware: 'unknown'
    };

    // Extract firmware version
    const firmwareMatch = versionOutput.match(/Firmware\s+v?([\d.]+[^\)]*)/i);
    if (firmwareMatch) {
      version.firmware = firmwareMatch[1];
    }

    // Extract hardware version
    const hardwareMatch = versionOutput.match(/Hardware\s+Version\s+([\d.]+)/i);
    if (hardwareMatch) {
      version.hardware = hardwareMatch[1];
    }

    // Extract git hash if present
    const gitMatch = versionOutput.match(/\(([a-f0-9]{7,})\)/i);
    if (gitMatch) {
      version.git = gitMatch[1];
    }

    return version;
  }

  /**
   * Parse target voltage from scan output
   *
   * @param scanOutput - Decoded scan response
   * @returns Voltage in volts or null if not found
   */
  static parseTargetVoltage(scanOutput: string): number | null {
    const match = scanOutput.match(/Target voltage:\s*([\d.]+)\s*V/i);
    return match ? parseFloat(match[1]) : null;
  }

  /**
   * Check if target power is enabled from scan output
   *
   * @param scanOutput - Decoded scan response
   * @returns Power state
   */
  static parseTargetPower(scanOutput: string): PowerState {
    const voltage = this.parseTargetVoltage(scanOutput);

    if (voltage === null) {
      return PowerState.UNKNOWN;
    }

    // Typically > 1.8V means powered
    return voltage > 1.8 ? PowerState.ENABLED : PowerState.DISABLED;
  }

  /**
   * Build supported features query
   *
   * Queries what features the GDB server supports.
   *
   * @returns Supported query command
   */
  static buildQuerySupported(): string {
    return 'qSupported:multiprocess+;swbreak+;hwbreak+;qRelocInsn+';
  }

  /**
   * Build thread info query
   *
   * @returns Thread info query command
   */
  static buildQueryThreadInfo(): string {
    return 'qfThreadInfo';
  }

  /**
   * Build current thread query
   *
   * @returns Current thread query
   */
  static buildQueryCurrentThread(): string {
    return 'qC';
  }

  /**
   * Build set thread command
   *
   * Format: Hg<thread-id> (for general operations)
   * Format: Hc<thread-id> (for continue/step operations)
   *
   * @param threadId - Thread ID (0 for all threads, -1 for any thread)
   * @param forContinue - Set for continue operations (default: false)
   * @returns Set thread command
   */
  static buildSetThread(threadId: number, forContinue = false): string {
    const op = forContinue ? 'c' : 'g';
    const id = threadId.toString(16);
    return `H${op}${id}`;
  }

  /**
   * Build auto scan command
   *
   * Automatically scan all chain types for devices.
   *
   * @returns Monitor command
   */
  static buildAutoScan(): string {
    return this.buildMonitorCommand('auto_scan');
  }

  /**
   * Build targets list command
   *
   * @returns Monitor command
   */
  static buildTargetsList(): string {
    return this.buildMonitorCommand('targets');
  }

  /**
   * Build frequency set command
   *
   * @param frequency - Frequency in Hz (optional)
   * @returns Monitor command
   */
  static buildSetFrequency(frequency?: number): string {
    const cmd = frequency ? `frequency ${frequency}` : 'frequency';
    return this.buildMonitorCommand(cmd);
  }

  /**
   * Build halt timeout command
   *
   * @param timeout - Timeout in ms (default 2000)
   * @returns Monitor command
   */
  static buildHaltTimeout(timeout = 2000): string {
    return this.buildMonitorCommand(`halt_timeout ${timeout}`);
  }

  /**
   * Build connect under reset command
   *
   * @param enable - Enable or disable
   * @returns Monitor command
   */
  static buildConnectReset(enable: boolean): string {
    return this.buildMonitorCommand(`connect_srst ${enable ? 'enable' : 'disable'}`);
  }

  /**
   * Build hard system reset command
   *
   * @returns Monitor command
   */
  static buildHardSystemReset(): string {
    return this.buildMonitorCommand('hard_srst');
  }

  /**
   * Build TDI low reset command (for LPC82x)
   *
   * @returns Monitor command
   */
  static buildTdiLowReset(): string {
    return this.buildMonitorCommand('tdi_low_reset');
  }

  /**
   * Build morse command
   *
   * Display morse error message.
   *
   * @returns Monitor command
   */
  static buildMorse(): string {
    return this.buildMonitorCommand('morse');
  }

  /**
   * Build traceswo command
   *
   * Start trace capture in NRZ mode.
   *
   * @param baudrate - Baudrate for trace capture
   * @param decode - Whether to decode
   * @param channels - Channel numbers to decode
   * @returns Monitor command
   */
  static buildTraceSwo(baudrate?: number, decode?: boolean, channels?: number[]): string {
    let cmd = 'traceswo';
    if (baudrate) {
      cmd += ` ${baudrate}`;
      if (decode) {
        cmd += ' decode';
        if (channels && channels.length > 0) {
          cmd += ` ${channels.join(' ')}`;
        }
      }
    }
    return this.buildMonitorCommand(cmd);
  }

  /**
   * Build heapinfo command
   *
   * Set stack/heap information.
   *
   * @param heap - Heap info string
   * @returns Monitor command
   */
  static buildHeapInfo(heap?: string): string {
    const cmd = heap ? `heapinfo ${heap}` : 'heapinfo';
    return this.buildMonitorCommand(cmd);
  }

  /**
   * Build mass erase command
   *
   * Mass erase flash memory (target specific).
   *
   * @returns Monitor command
   */
  static buildMassErase(): string {
    return this.buildMonitorCommand('mass_erase');
  }

  /**
   * Build vector catch command
   *
   * Configure exception vector catching.
   *
   * @param vectors - Vector configuration
   * @returns Monitor command
   */
  static buildVectorCatch(vectors?: string): string {
    const cmd = vectors ? `vector_catch ${vectors}` : 'vector_catch';
    return this.buildMonitorCommand(cmd);
  }

  /**
   * Build RTT command
   *
   * SEGGER RTT support for high-speed communication.
   *
   * @param command - RTT subcommand
   * @returns Monitor command
   */
  static buildRtt(command?: string): string {
    const cmd = command ? `rtt ${command}` : 'rtt';
    return this.buildMonitorCommand(cmd);
  }

  /**
   * Build semihosting command
   *
   * Enable ARM semihosting for I/O operations.
   *
   * @param enable - Enable or disable
   * @returns Monitor command
   */
  static buildSemihosting(enable?: boolean): string {
    const cmd = enable !== undefined
      ? `semihosting ${enable ? 'enable' : 'disable'}`
      : 'semihosting';
    return this.buildMonitorCommand(cmd);
  }

  /**
   * Build help command
   *
   * @param topic - Specific help topic (optional)
   * @returns Monitor command
   */
  static buildHelp(topic?: string): string {
    const cmd = topic ? `help ${topic}` : 'help';
    return this.buildMonitorCommand(cmd);
  }

  /**
   * Parse frequency response
   *
   * @param response - Decoded response
   * @returns Frequency in Hz or null
   */
  static parseFrequency(response: string): number | null {
    const match = response.match(/frequency:\s*(\d+)\s*Hz/i);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Parse trace SWO configuration
   *
   * @param response - Decoded response
   * @returns SWO configuration or null
   */
  static parseSwoConfig(response: string): { baudrate?: number; channels?: number[] } | null {
    const baudrateMatch = response.match(/baudrate:\s*(\d+)/i);
    const channelsMatch = response.match(/channels:\s*([\d\s]+)/i);

    const config: { baudrate?: number; channels?: number[] } = {};

    if (baudrateMatch) {
      config.baudrate = parseInt(baudrateMatch[1]);
    }

    if (channelsMatch) {
      config.channels = channelsMatch[1].split(/\s+/).map(c => parseInt(c));
    }

    return Object.keys(config).length > 0 ? config : null;
  }

  /**
   * Parse target power state with more detail
   *
   * @param response - Decoded response
   * @returns Detailed power information
   */
  static parseDetailedPowerState(response: string): {
    enabled: boolean;
    voltage?: number;
    current?: number;
    source?: string;
  } {
    const result: any = {
      enabled: false
    };

    // Check for voltage
    const voltageMatch = response.match(/voltage:\s*([\d.]+)\s*V/i);
    if (voltageMatch) {
      result.voltage = parseFloat(voltageMatch[1]);
      result.enabled = result.voltage > 1.8;
    }

    // Check for current (if supported)
    const currentMatch = response.match(/current:\s*([\d.]+)\s*mA/i);
    if (currentMatch) {
      result.current = parseFloat(currentMatch[1]);
    }

    // Check for power source
    if (response.includes('external')) {
      result.source = 'external';
    } else if (response.includes('internal') || response.includes('onboard')) {
      result.source = 'internal';
    }

    // Check explicit enable/disable state
    if (response.includes('enabled')) {
      result.enabled = true;
    } else if (response.includes('disabled')) {
      result.enabled = false;
    }

    return result;
  }
}
