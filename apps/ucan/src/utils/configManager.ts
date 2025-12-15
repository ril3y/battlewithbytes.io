/**
 * Configuration Manager
 *
 * Handles loading, saving, and validating application configuration
 * Persists settings to localStorage
 */

import { AppConfig, DEFAULT_APP_CONFIG } from "../types";

const CONFIG_STORAGE_KEY = "ucan-config";

/**
 * Load configuration from localStorage
 * Returns default config if not found or invalid
 */
export function loadConfig(): AppConfig {
  if (typeof window === "undefined") {
    return DEFAULT_APP_CONFIG;
  }

  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_APP_CONFIG;
    }

    const parsed = JSON.parse(stored);

    // Validate and merge with defaults to handle missing fields
    return {
      serial: {
        baudRate: parsed.serial?.baudRate ?? DEFAULT_APP_CONFIG.serial.baudRate,
        dataBits: parsed.serial?.dataBits ?? DEFAULT_APP_CONFIG.serial.dataBits,
        stopBits: parsed.serial?.stopBits ?? DEFAULT_APP_CONFIG.serial.stopBits,
        parity: parsed.serial?.parity ?? DEFAULT_APP_CONFIG.serial.parity,
        flowControl:
          parsed.serial?.flowControl ?? DEFAULT_APP_CONFIG.serial.flowControl,
      },
      maxMessages: parsed.maxMessages ?? DEFAULT_APP_CONFIG.maxMessages,
      autoScroll: parsed.autoScroll ?? DEFAULT_APP_CONFIG.autoScroll,
      showTimestamps:
        parsed.showTimestamps ?? DEFAULT_APP_CONFIG.showTimestamps,
      showRawHex: parsed.showRawHex ?? DEFAULT_APP_CONFIG.showRawHex,
    };
  } catch (error) {
    console.error("Failed to load config from localStorage:", error);
    return DEFAULT_APP_CONFIG;
  }
}

/**
 * Save configuration to localStorage
 */
export function saveConfig(config: AppConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    console.log("Configuration saved:", config);
  } catch (error) {
    console.error("Failed to save config to localStorage:", error);
  }
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): AppConfig {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  }
  return DEFAULT_APP_CONFIG;
}

/**
 * Validate configuration values
 */
export function validateConfig(config: AppConfig): string[] {
  const errors: string[] = [];

  // Validate baud rate
  const validBaudRates = [
    9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600,
  ];
  if (!validBaudRates.includes(config.serial.baudRate)) {
    errors.push(`Invalid baud rate: ${config.serial.baudRate}`);
  }

  // Validate data bits
  if (config.serial.dataBits !== 7 && config.serial.dataBits !== 8) {
    errors.push(`Invalid data bits: ${config.serial.dataBits}`);
  }

  // Validate stop bits
  if (config.serial.stopBits !== 1 && config.serial.stopBits !== 2) {
    errors.push(`Invalid stop bits: ${config.serial.stopBits}`);
  }

  // Validate parity
  if (!["none", "even", "odd"].includes(config.serial.parity)) {
    errors.push(`Invalid parity: ${config.serial.parity}`);
  }

  // Validate max messages
  if (config.maxMessages < 100 || config.maxMessages > 50000) {
    errors.push(`Max messages must be between 100 and 50,000`);
  }

  return errors;
}
