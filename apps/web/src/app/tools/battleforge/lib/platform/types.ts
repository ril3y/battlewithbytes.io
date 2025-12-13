/**
 * BattleForge Platform System Types
 *
 * Standardized JSON schema for embedded platform definitions.
 * All platform data is served as static files from /public/platforms/
 */

// ============================================================================
// Registry Types
// ============================================================================

/**
 * Master platform registry - fetched from /platforms/registry.json
 */
export interface PlatformRegistry {
  version: string;
  platforms: PlatformEntry[];
  libraries?: LibraryRegistry;
}

/**
 * Top-level platform entry (e.g., STM32, ESP32, NXP)
 */
export interface PlatformEntry {
  id: string;           // "stm32"
  name: string;         // "STMicroelectronics STM32"
  description?: string;
  manufacturer?: string; // "STMicroelectronics"
  icon?: string;        // "stm32.svg"
  color?: string;       // Brand color "#03234B"
  website?: string;     // Official website
  github?: string;      // GitHub organization URL
  families: string[];   // ["f1", "f4", "l4"]
  tags?: string[];      // ["arm", "cortex-m", "industrial"]
  supported: boolean;   // true if we have toolchain support
  comingSoon?: boolean; // true if planned for future
}

/**
 * Library entry for core/community libraries
 */
export interface LibraryEntry {
  id: string;
  name: string;
  description: string;
  version: string;
  github: string;
  required: boolean;
  architectures?: Architecture[];
  tags?: string[];
}

/**
 * Libraries section in registry
 */
export interface LibraryRegistry {
  core: LibraryEntry[];
  community: LibraryEntry[];
}

// ============================================================================
// Family Types
// ============================================================================

/**
 * Platform family definition - fetched from /platforms/{platform}/{family}/family.json
 */
export interface PlatformFamily {
  id: string;                     // "f1"
  name: string;                   // "STM32F1 Series (Cortex-M3)"
  description?: string;
  architecture: Architecture;      // "cortex-m3"
  devices: DeviceEntry[];
  headers: HeaderBundle;
  libs: LibBundle;
  compilerFlags: string[];
  linkerFlags?: string[];
}

/**
 * Device entry within a family
 */
export interface DeviceEntry {
  id: string;           // "stm32f103c8"
  name: string;         // "STM32F103C8T6 (Blue Pill)"
  description?: string;
  flash: number;        // 65536 (bytes)
  ram: number;          // 20480 (bytes)
  linkerScript: string; // "stm32f103c8.ld"
  defines?: string[];   // ["STM32F103xB"]
}

// ============================================================================
// Resource Bundle Types
// ============================================================================

/**
 * Header files bundle
 */
export interface HeaderBundle {
  url: string;          // Relative to /platforms/ - e.g., "stm32/f1/headers.tar.gz"
  size: number;         // Compressed size in bytes
  checksum: string;     // "sha256:abc123..."
  includes: string[];   // Include paths relative to extracted root ["/cmsis", "/device"]
}

/**
 * Library files bundle
 */
export interface LibBundle {
  architecture: Architecture;
  required: string[];   // ["libc_nano.a", "libnosys.a"]
  optional: string[];   // ["libm.a", "libgcc.a"]
}

// ============================================================================
// Architecture Types
// ============================================================================

/**
 * Supported CPU architectures
 */
export type Architecture =
  | 'cortex-m0'
  | 'cortex-m0+'
  | 'cortex-m3'
  | 'cortex-m4'
  | 'cortex-m4f'
  | 'cortex-m7'
  | 'cortex-m7f'
  | 'xtensa-lx6'   // ESP32
  | 'xtensa-lx7'   // ESP32-S2/S3
  | 'riscv32';     // ESP32-C3

/**
 * Architecture-specific configuration
 */
export interface ArchitectureConfig {
  target: string;       // Clang target triple - "thumbv7m-none-eabi"
  cpu: string;          // "-mcpu=cortex-m3"
  fpu?: string;         // "-mfpu=fpv4-sp-d16"
  float?: string;       // "-mfloat-abi=hard"
  libPath: string;      // Path under /libs/ - "cortex-m3"
}

/**
 * Map of architecture to configuration
 */
export const ARCHITECTURE_CONFIGS: Record<Architecture, ArchitectureConfig> = {
  'cortex-m0': {
    target: 'thumbv6m-none-eabi',
    cpu: 'cortex-m0',
    libPath: 'cortex-m0'
  },
  'cortex-m0+': {
    target: 'thumbv6m-none-eabi',
    cpu: 'cortex-m0plus',
    libPath: 'cortex-m0'
  },
  'cortex-m3': {
    target: 'thumbv7m-none-eabi',
    cpu: 'cortex-m3',
    libPath: 'cortex-m3'
  },
  'cortex-m4': {
    target: 'thumbv7em-none-eabi',
    cpu: 'cortex-m4',
    libPath: 'cortex-m4'
  },
  'cortex-m4f': {
    target: 'thumbv7em-none-eabihf',
    cpu: 'cortex-m4',
    fpu: 'fpv4-sp-d16',
    float: 'hard',
    libPath: 'cortex-m4f'
  },
  'cortex-m7': {
    target: 'thumbv7em-none-eabi',
    cpu: 'cortex-m7',
    libPath: 'cortex-m7'
  },
  'cortex-m7f': {
    target: 'thumbv7em-none-eabihf',
    cpu: 'cortex-m7',
    fpu: 'fpv5-d16',
    float: 'hard',
    libPath: 'cortex-m7f'
  },
  'xtensa-lx6': {
    target: 'xtensa-esp32-elf',
    cpu: 'esp32',
    libPath: 'esp32'
  },
  'xtensa-lx7': {
    target: 'xtensa-esp32s3-elf',
    cpu: 'esp32s3',
    libPath: 'esp32s3'
  },
  'riscv32': {
    target: 'riscv32-unknown-elf',
    cpu: 'generic-rv32',
    libPath: 'riscv32'
  }
};

// ============================================================================
// Loading State Types
// ============================================================================

/**
 * Loading progress for WASM/platform assets
 */
export interface LoadingProgress {
  stage: 'idle' | 'downloading' | 'extracting' | 'ready' | 'error';
  current: number;      // Bytes loaded
  total: number;        // Total bytes
  message: string;
}

/**
 * Component loading state
 */
export type ComponentState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Toolchain state
 */
export interface ToolchainState {
  clang: LoadingProgress;
  lld: LoadingProgress;
  headers: LoadingProgress;
  libs: LoadingProgress;
}

/**
 * Selected platform configuration
 */
export interface SelectedPlatform {
  platformId: string;
  familyId: string;
  deviceId: string;
  family: PlatformFamily;
  device: DeviceEntry;
  archConfig: ArchitectureConfig;
}

// ============================================================================
// Build Configuration Types
// ============================================================================

/**
 * Complete build configuration derived from selected platform
 */
export interface BuildConfig {
  compilerArgs: string[];
  linkerArgs: string[];
  includePaths: string[];
  libPaths: string[];
  libs: string[];
  linkerScript: string;
  defines: string[];
}

/**
 * Build output files
 */
export interface BuildOutput {
  objectFiles: Map<string, Uint8Array>;
  elfFile?: Uint8Array;
  binFile?: Uint8Array;
  hexFile?: Uint8Array;
  mapFile?: string;
}
