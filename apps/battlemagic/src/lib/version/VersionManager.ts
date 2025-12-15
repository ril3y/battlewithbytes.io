/**
 * Black Magic Probe Version Manager
 *
 * Handles version parsing, compatibility checking, and feature availability
 * based on Black Magic Probe firmware version.
 */

import { BmpVersion } from "../gdb/types";

/**
 * Feature compatibility status
 */
export enum FeatureStatus {
  SUPPORTED = "supported",
  NOT_SUPPORTED = "not_supported",
  EXPERIMENTAL = "experimental",
  DEPRECATED = "deprecated",
}

/**
 * Feature definition
 */
export interface BmpFeature {
  /** Feature identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Minimum version required */
  minVersion?: string;
  /** Maximum version supported (for deprecated features) */
  maxVersion?: string;
  /** Monitor command associated with this feature */
  command?: string;
  /** Feature category */
  category: "debug" | "power" | "trace" | "memory" | "target" | "config";
}

/**
 * Version comparison result
 */
export enum VersionComparison {
  OLDER = -1,
  EQUAL = 0,
  NEWER = 1,
}

/**
 * Black Magic Probe feature definitions
 */
export const BMP_FEATURES: BmpFeature[] = [
  // Debug Commands
  {
    id: "version",
    name: "Version Query",
    description: "Display firmware version information",
    command: "version",
    category: "debug",
    minVersion: "1.0.0",
  },
  {
    id: "help",
    name: "Help",
    description: "Display help for monitor commands",
    command: "help",
    category: "debug",
    minVersion: "1.0.0",
  },

  // Target Scanning
  {
    id: "swdp_scan",
    name: "SWD Scan",
    description: "Scan for targets using Serial Wire Debug interface",
    command: "swdp_scan",
    category: "target",
    minVersion: "1.0.0",
  },
  {
    id: "jtag_scan",
    name: "JTAG Scan",
    description: "Scan JTAG chain for devices",
    command: "jtag_scan",
    category: "target",
    minVersion: "1.0.0",
  },
  {
    id: "auto_scan",
    name: "Auto Scan",
    description: "Automatically scan all chain types for devices",
    command: "auto_scan",
    category: "target",
    minVersion: "1.7.0",
  },
  {
    id: "targets",
    name: "Target List",
    description: "Display list of available targets",
    command: "targets",
    category: "target",
    minVersion: "1.0.0",
  },

  // Power Control
  {
    id: "tpwr",
    name: "Target Power",
    description: "Control target power (BMP v2+ only)",
    command: "tpwr",
    category: "power",
    minVersion: "1.6.0",
  },

  // Reset Control
  {
    id: "reset",
    name: "Target Reset",
    description: "Pulse the nRST line",
    command: "reset",
    category: "debug",
    minVersion: "1.0.0",
  },
  {
    id: "hard_srst",
    name: "Hard System Reset",
    description: "Perform hard system reset",
    command: "hard_srst",
    category: "debug",
    minVersion: "1.7.0",
  },
  {
    id: "connect_srst",
    name: "Connect Under Reset",
    description: "Configure connect under reset",
    command: "connect_srst",
    category: "config",
    minVersion: "1.7.0",
  },
  {
    id: "tdi_low_reset",
    name: "TDI Low Reset",
    description: "Pulse nRST with TDI low (for LPC82x)",
    command: "tdi_low_reset",
    category: "debug",
    minVersion: "1.7.0",
  },

  // Configuration
  {
    id: "frequency",
    name: "Clock Frequency",
    description: "Set minimum high and low times",
    command: "frequency",
    category: "config",
    minVersion: "1.7.0",
  },
  {
    id: "halt_timeout",
    name: "Halt Timeout",
    description: "Set timeout to wait until Cortex-M is halted",
    command: "halt_timeout",
    category: "config",
    minVersion: "1.7.0",
  },
  {
    id: "morse",
    name: "Morse Code",
    description: "Display morse error message",
    command: "morse",
    category: "debug",
    minVersion: "1.0.0",
  },

  // Trace Features
  {
    id: "traceswo",
    name: "Trace SWO",
    description: "Start trace capture in NRZ mode",
    command: "traceswo",
    category: "trace",
    minVersion: "1.7.0",
  },

  // Memory Features
  {
    id: "heapinfo",
    name: "Heap Info",
    description: "Set stack/heap information",
    command: "heapinfo",
    category: "memory",
    minVersion: "1.7.0",
  },
  {
    id: "mass_erase",
    name: "Mass Erase",
    description: "Mass erase flash memory (target specific)",
    command: "mass_erase",
    category: "memory",
    minVersion: "1.0.0",
  },

  // Advanced Features
  {
    id: "vector_catch",
    name: "Vector Catch",
    description: "Configure exception vector catching",
    command: "vector_catch",
    category: "debug",
    minVersion: "1.7.0",
  },
  {
    id: "rtt",
    name: "Real-Time Transfer",
    description: "SEGGER RTT support for high-speed communication",
    command: "rtt",
    category: "trace",
    minVersion: "1.8.0",
  },
  {
    id: "semihosting",
    name: "Semihosting",
    description: "Enable ARM semihosting for I/O operations",
    command: "semihosting",
    category: "debug",
    minVersion: "1.7.0",
  },
];

/**
 * Version Manager for Black Magic Probe
 */
export class VersionManager {
  private version: BmpVersion | null = null;
  private parsedVersion: {
    major: number;
    minor: number;
    patch: number;
  } | null = null;

  /** Minimum required version for full feature support */
  static readonly MIN_REQUIRED_VERSION = "1.7.1";

  /** Latest known stable version */
  static readonly LATEST_STABLE_VERSION = "1.9.3";

  /**
   * Set the current BMP version
   */
  setVersion(version: BmpVersion): void {
    this.version = version;
    this.parsedVersion = this.parseVersionString(version.firmware);
  }

  /**
   * Get the current version
   */
  getVersion(): BmpVersion | null {
    return this.version;
  }

  /**
   * Parse version string to components
   */
  private parseVersionString(
    versionStr: string,
  ): { major: number; minor: number; patch: number } | null {
    // Handle various version formats: "1.7.1", "v1.7.1", "1.7.1-123-gabcdef"
    const match = versionStr.match(/v?(\d+)\.(\d+)(?:\.(\d+))?/);
    if (!match) return null;

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: match[3] ? parseInt(match[3], 10) : 0,
    };
  }

  /**
   * Compare two version strings
   */
  compareVersions(v1: string, v2: string): VersionComparison {
    const parsed1 = this.parseVersionString(v1);
    const parsed2 = this.parseVersionString(v2);

    if (!parsed1 || !parsed2) return VersionComparison.EQUAL;

    // Compare major
    if (parsed1.major < parsed2.major) return VersionComparison.OLDER;
    if (parsed1.major > parsed2.major) return VersionComparison.NEWER;

    // Compare minor
    if (parsed1.minor < parsed2.minor) return VersionComparison.OLDER;
    if (parsed1.minor > parsed2.minor) return VersionComparison.NEWER;

    // Compare patch
    if (parsed1.patch < parsed2.patch) return VersionComparison.OLDER;
    if (parsed1.patch > parsed2.patch) return VersionComparison.NEWER;

    return VersionComparison.EQUAL;
  }

  /**
   * Check if current version meets minimum requirement
   */
  isVersionSupported(): boolean {
    if (!this.version) return false;
    return (
      this.compareVersions(
        this.version.firmware,
        VersionManager.MIN_REQUIRED_VERSION,
      ) >= 0
    );
  }

  /**
   * Check if a specific feature is available
   */
  isFeatureAvailable(featureId: string): FeatureStatus {
    const feature = BMP_FEATURES.find((f) => f.id === featureId);
    if (!feature) return FeatureStatus.NOT_SUPPORTED;

    if (!this.version) return FeatureStatus.NOT_SUPPORTED;

    // Check minimum version
    if (feature.minVersion) {
      if (this.compareVersions(this.version.firmware, feature.minVersion) < 0) {
        return FeatureStatus.NOT_SUPPORTED;
      }
    }

    // Check maximum version (for deprecated features)
    if (feature.maxVersion) {
      if (this.compareVersions(this.version.firmware, feature.maxVersion) > 0) {
        return FeatureStatus.DEPRECATED;
      }
    }

    // Check for experimental features (version contains git hash or pre-release)
    if (
      this.version.firmware.includes("-") ||
      this.version.firmware.includes("git")
    ) {
      return FeatureStatus.EXPERIMENTAL;
    }

    return FeatureStatus.SUPPORTED;
  }

  /**
   * Get all available features for current version
   */
  getAvailableFeatures(): BmpFeature[] {
    if (!this.version) return [];

    return BMP_FEATURES.filter((feature) => {
      const status = this.isFeatureAvailable(feature.id);
      return (
        status === FeatureStatus.SUPPORTED ||
        status === FeatureStatus.EXPERIMENTAL
      );
    });
  }

  /**
   * Get features by category
   */
  getFeaturesByCategory(category: BmpFeature["category"]): BmpFeature[] {
    return this.getAvailableFeatures().filter((f) => f.category === category);
  }

  /**
   * Get version compatibility report
   */
  getCompatibilityReport(): {
    version: string;
    isSupported: boolean;
    isLatest: boolean;
    supportedFeatures: number;
    totalFeatures: number;
    missingFeatures: BmpFeature[];
    deprecatedFeatures: BmpFeature[];
    recommendation?: string;
  } {
    if (!this.version) {
      return {
        version: "unknown",
        isSupported: false,
        isLatest: false,
        supportedFeatures: 0,
        totalFeatures: BMP_FEATURES.length,
        missingFeatures: BMP_FEATURES,
        deprecatedFeatures: [],
        recommendation: "Unable to detect Black Magic Probe version",
      };
    }

    const isSupported = this.isVersionSupported();
    const isLatest =
      this.compareVersions(
        this.version.firmware,
        VersionManager.LATEST_STABLE_VERSION,
      ) >= 0;

    const missingFeatures: BmpFeature[] = [];
    const deprecatedFeatures: BmpFeature[] = [];
    let supportedCount = 0;

    BMP_FEATURES.forEach((feature) => {
      const status = this.isFeatureAvailable(feature.id);
      switch (status) {
        case FeatureStatus.SUPPORTED:
        case FeatureStatus.EXPERIMENTAL:
          supportedCount++;
          break;
        case FeatureStatus.NOT_SUPPORTED:
          missingFeatures.push(feature);
          break;
        case FeatureStatus.DEPRECATED:
          deprecatedFeatures.push(feature);
          break;
      }
    });

    let recommendation: string | undefined;
    if (!isSupported) {
      recommendation = `Your BMP firmware (${this.version.firmware}) is older than the minimum required version (${VersionManager.MIN_REQUIRED_VERSION}). Please update to ensure full compatibility.`;
    } else if (!isLatest) {
      recommendation = `A newer version (${VersionManager.LATEST_STABLE_VERSION}) is available. Consider updating for the latest features and bug fixes.`;
    }

    return {
      version: this.version.firmware,
      isSupported,
      isLatest,
      supportedFeatures: supportedCount,
      totalFeatures: BMP_FEATURES.length,
      missingFeatures,
      deprecatedFeatures,
      recommendation,
    };
  }

  /**
   * Format version string for display
   */
  getDisplayVersion(): string {
    if (!this.version) return "Unknown";

    let display = `v${this.version.firmware}`;
    if (this.version.hardware) {
      display += ` (HW: ${this.version.hardware})`;
    }
    if (this.version.git) {
      display += ` [${this.version.git}]`;
    }

    return display;
  }

  /**
   * Get version badge color based on support status
   */
  getVersionBadgeColor(): "green" | "yellow" | "red" {
    if (!this.version) return "red";

    const isSupported = this.isVersionSupported();
    const isLatest =
      this.compareVersions(
        this.version.firmware,
        VersionManager.LATEST_STABLE_VERSION,
      ) >= 0;

    if (isLatest) return "green";
    if (isSupported) return "yellow";
    return "red";
  }
}

// Singleton instance
export const versionManager = new VersionManager();
