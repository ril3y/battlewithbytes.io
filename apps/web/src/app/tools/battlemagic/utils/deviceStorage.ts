/**
 * Device Storage Utility for BattleMagic
 *
 * Manages localStorage for remembering the last connected Black Magic Probe ports
 * Stores both GDB and UART port information separately for quick reconnect
 */

export interface StoredPortInfo {
  vendorId?: number;
  productId?: number;
  productName?: string;
  lastConnected: number; // timestamp
}

export interface StoredBMPInfo {
  gdbPort?: StoredPortInfo;
  uartPort?: StoredPortInfo;
}

const STORAGE_KEY = 'battlemagic_last_device';

/**
 * Save GDB port info to localStorage
 */
export function saveGdbPort(deviceInfo: {
  vendorId?: number;
  productId?: number;
  productName?: string;
}): void {
  try {
    const stored = loadBMPInfo() || {};
    stored.gdbPort = {
      ...deviceInfo,
      lastConnected: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.warn('Failed to save GDB port:', error);
  }
}

/**
 * Save UART port info to localStorage
 */
export function saveUartPort(deviceInfo: {
  vendorId?: number;
  productId?: number;
  productName?: string;
}): void {
  try {
    const stored = loadBMPInfo() || {};
    stored.uartPort = {
      ...deviceInfo,
      lastConnected: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.warn('Failed to save UART port:', error);
  }
}

/**
 * Load all BMP port info from localStorage
 */
export function loadBMPInfo(): StoredBMPInfo | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as StoredBMPInfo;
  } catch (error) {
    console.warn('Failed to load BMP info:', error);
    return null;
  }
}

/**
 * Clear all BMP port info from localStorage
 */
export function clearBMPInfo(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear BMP info:', error);
  }
}

/**
 * Clear just the GDB port info
 */
export function clearGdbPort(): void {
  try {
    const stored = loadBMPInfo();
    if (stored) {
      delete stored.gdbPort;
      if (Object.keys(stored).length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      }
    }
  } catch (error) {
    console.warn('Failed to clear GDB port:', error);
  }
}

/**
 * Clear just the UART port info
 */
export function clearUartPort(): void {
  try {
    const stored = loadBMPInfo();
    if (stored) {
      delete stored.uartPort;
      if (Object.keys(stored).length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      }
    }
  } catch (error) {
    console.warn('Failed to clear UART port:', error);
  }
}

/**
 * Format device name for display
 */
export function formatDeviceName(deviceInfo: StoredPortInfo | null | undefined): string {
  if (!deviceInfo) return 'Not connected';

  if (deviceInfo.productName) {
    return deviceInfo.productName;
  }

  if (deviceInfo.vendorId !== undefined && deviceInfo.productId !== undefined) {
    return `VID: 0x${deviceInfo.vendorId.toString(16).toUpperCase().padStart(4, '0')}, PID: 0x${deviceInfo.productId.toString(16).toUpperCase().padStart(4, '0')}`;
  }

  return 'Unknown Device';
}

/**
 * Check if a port matches the stored device
 */
export function isMatchingDevice(port: SerialPort, storedDevice: StoredPortInfo): boolean {
  const info = port.getInfo();
  return info.usbVendorId === storedDevice.vendorId &&
         info.usbProductId === storedDevice.productId;
}

/**
 * Find matching port from available ports
 */
export async function findMatchingPort(storedDevice: StoredPortInfo): Promise<SerialPort | null> {
  try {
    const ports = await navigator.serial.getPorts();
    for (const port of ports) {
      if (isMatchingDevice(port, storedDevice)) {
        // Check if port is already open/locked
        // A port with readable or writable streams is already open
        if (port.readable || port.writable) {
          console.warn('[findMatchingPort] Port is already open, attempting to close...');
          try {
            await port.close();
            // Give it time to fully close
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (closeError) {
            console.warn('[findMatchingPort] Failed to close port:', closeError);
            // Port is stuck, return null to force manual selection
            return null;
          }

          // Verify it actually closed
          if (port.readable || port.writable) {
            console.warn('[findMatchingPort] Port still locked after close attempt');
            return null;
          }
        }

        return port;
      }
    }
  } catch (error) {
    console.warn('Failed to find matching port:', error);
  }
  return null;
}