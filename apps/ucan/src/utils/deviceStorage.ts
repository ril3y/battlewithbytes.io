/**
 * Device Storage Utility
 *
 * Manages localStorage for remembering the last connected uCAN device
 */

export interface StoredDeviceInfo {
  vendorId?: number;
  productId?: number;
  productName?: string;
  lastConnected: number; // timestamp
}

const STORAGE_KEY = "ucan_last_device";

/**
 * Save device info to localStorage
 */
export function saveLastDevice(deviceInfo: {
  vendorId?: number;
  productId?: number;
  productName?: string;
}): void {
  try {
    const stored: StoredDeviceInfo = {
      ...deviceInfo,
      lastConnected: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.warn("Failed to save last device:", error);
  }
}

/**
 * Load last device info from localStorage
 */
export function loadLastDevice(): StoredDeviceInfo | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as StoredDeviceInfo;
  } catch (error) {
    console.warn("Failed to load last device:", error);
    return null;
  }
}

/**
 * Clear last device from localStorage
 */
export function clearLastDevice(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear last device:", error);
  }
}

/**
 * Format device name for display
 */
export function formatDeviceName(deviceInfo: StoredDeviceInfo | null): string {
  if (!deviceInfo) return "Unknown Device";

  if (deviceInfo.productName) {
    return deviceInfo.productName;
  }

  if (deviceInfo.vendorId !== undefined && deviceInfo.productId !== undefined) {
    return `VID: 0x${deviceInfo.vendorId.toString(16).toUpperCase().padStart(4, "0")}, PID: 0x${deviceInfo.productId.toString(16).toUpperCase().padStart(4, "0")}`;
  }

  return "Unknown Device";
}

/**
 * Check if a port matches the stored device
 */
export function isMatchingDevice(
  port: SerialPort,
  storedDevice: StoredDeviceInfo,
): boolean {
  const info = port.getInfo();
  return (
    info.usbVendorId === storedDevice.vendorId &&
    info.usbProductId === storedDevice.productId
  );
}
