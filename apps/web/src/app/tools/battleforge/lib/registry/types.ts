/**
 * Types for the BattleForge target registry
 * Defines platforms, boards, and libraries from the remote registry
 */

// ============================================================================
// Registry Index Types
// ============================================================================

export interface RegistryIndex {
  version: string;
  lastUpdated: string;
  schemas: {
    platform: string;
    board: string;
    library: string;
  };
  platforms: PlatformIndexEntry[];
  boards: BoardIndexEntry[];
  libraries: LibraryIndexEntry[];
}

export interface PlatformIndexEntry {
  id: string;
  platform: string;
  family: string;
  name: string;
  architecture: string;
  path: string;
}

export interface BoardIndexEntry {
  id: string;
  name: string;
  vendor: string;
  platform: string;
  family: string;
  path: string;
  /** Thumbnail image for grid view */
  thumbnail?: string;
  /** Key features for filtering */
  features?: string[];
  /** Tags for search */
  tags?: string[];
  /** Number of examples available */
  exampleCount?: number;
}

export interface LibraryIndexEntry {
  id: string;
  name: string;
  version: string;
  category: string;
  path: string;
}

// ============================================================================
// Platform Manifest Types
// ============================================================================

export interface PlatformManifest {
  platform: string;
  family: string;
  name: string;
  description?: string;
  architecture: string;
  version: string;

  headers: {
    url: string;
    hash: string | null;
    includes?: string[];
  };

  devices: DeviceDefinition[];

  softdevices?: SoftDeviceDefinition[];

  build?: {
    compilerFlags?: string[];
    linkerFlags?: string[];
    defines?: string[];
  };

  frameworks?: {
    arduino?: {
      core: string;
      coreUrl: string;
      packageIndex?: string;
    };
    zephyr?: {
      board: string;
    };
    native?: {
      sdk: string;
      sdkVersion: string;
    };
  };
}

export interface DeviceDefinition {
  id: string;
  name: string;
  flash: number;
  ram: number;
  psram?: number;
  frequency: number;
  defines?: string[];
  linkerScript?: string;
}

export interface SoftDeviceDefinition {
  id: string;
  name: string;
  version: string;
  devices: string[];
  flashUsed: number;
  ramUsed: number;
  linkerScript: string;
}

// ============================================================================
// Board Manifest Types
// ============================================================================

export interface BoardManifest {
  id: string;
  name: string;
  vendor: string;
  version: string;
  description?: string;
  image?: string;

  // Enhanced assets for UI display
  assets?: BoardAssets;

  // Board-specific examples
  examples?: BoardExample[];

  chip: {
    platform: string;
    family: string;
    device: string;
    architecture: string;
  };

  memory: {
    flash: number;
    flashAvailable?: number;
    flashNote?: string;
    ram: number;
    ramAvailable?: number;
  };

  build: {
    frequency: number;
    defines?: string[];
    compilerFlags?: string[];
    linkerFlags?: string[];
    linkerScript?: string;
  };

  pins?: {
    ledBuiltin?: PinDefinition;
    neopixel?: PinDefinition & { count?: number };
    serial?: { rx: string; tx: string };
    i2c?: { sda: string; scl: string };
    spi?: { mosi: string; miso: string; sck: string; ss?: string };
    adc?: string[];
    pwm?: string[];
    [key: string]: unknown;
  };

  frameworks?: {
    arduino?: {
      core: string;
      variant: string;
      coreUrl?: string;
      softdevice?: string;
      defines?: string[];
    };
    zephyr?: {
      board: string;
    };
    platformio?: {
      board: string;
      framework?: string;
    };
    native?: {
      sdk: string;
      sdkVersion?: string;
    };
  };

  upload?: {
    methods?: string[];
    default?: string;
    bootloader?: {
      type: string;
      familyId?: string;
      driveLabel?: string;
      vid?: string;
      pid?: string;
    };
  };

  documentation?: BoardDocumentation;

  /** Named pins with GPIO mappings (e.g., LED_BUILTIN, NEOPIXEL, I2C_SDA) */
  namedPins?: NamedPinMap;

  features?: string[];
  tags?: string[];
}

export interface PinDefinition {
  pin: string;
  gpio?: number;
  arduino?: number;
  activeLow?: boolean;
  features?: string[];
  notes?: string;
}

// ============================================================================
// Board Assets Types
// ============================================================================

export interface BoardAssets {
  /** URL to board product image */
  image: string;
  /** URL to pinout diagram */
  pinout?: string;
  /** Small image for grid view */
  thumbnail?: string;
}

// ============================================================================
// Board Example Types
// ============================================================================

export interface BoardExample {
  /** Unique example identifier */
  id: string;
  /** Display name */
  name: string;
  /** Brief description */
  description: string;
  /** Category for grouping */
  category?: "Getting Started" | "WiFi" | "BLE" | "Sensors" | "Display" | "Power" | "Communication" | string;
  /** Difficulty level */
  difficulty?: "beginner" | "intermediate" | "advanced";
  /** Target framework */
  framework?: "native" | "arduino" | "zephyr";
  /** Template files with board-specific content */
  files: BoardExampleFile[];
  /** Required board features for this example */
  features?: string[];
  /** Required libraries */
  libraries?: string[];
}

export interface BoardExampleFile {
  /** File path in project (e.g., "/src/main.cpp") */
  path: string;
  /** File content with correct GPIO pins for the board */
  content: string;
}

// ============================================================================
// Named Pins Map
// ============================================================================

export interface NamedPinMap {
  [name: string]: {
    gpio: number;
    arduino?: number;
    features?: string[];
    notes?: string;
  };
}

// ============================================================================
// Board Documentation Links
// ============================================================================

export interface BoardDocumentation {
  /** Chip datasheet URL */
  datasheet?: string;
  /** Board schematic PDF URL */
  schematic?: string;
  /** Vendor product page */
  productPage?: string;
  /** Pinout diagram URL */
  pinout?: string;
  /** Additional guides/tutorials */
  guides?: string[];
}

// ============================================================================
// Library Manifest Types
// ============================================================================

export interface LibraryManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  repository?: string;

  url: string;
  hash: string | null;

  platforms?: string[];
  architectures?: string[];
  frameworks?: string[];

  includes?: string[];
  sources?: string[];

  dependencies?: string[];

  configTemplate?: string;

  categories?: string[];
  keywords?: string[];
}
