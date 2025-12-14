/**
 * WASM Manager Types
 *
 * Type definitions for the multi-compiler WASM management system.
 * Supports clang-arm, clang-riscv, and clang-xtensa compilers.
 */

import type { Architecture } from "../platform/types";

// ============================================================================
// Compiler Identifiers
// ============================================================================

/**
 * Available compiler identifiers
 * - clang-arm: ARM Cortex-M (STM32, nRF52, RP2040)
 * - clang-riscv: RISC-V (ESP32-C3, ESP32-C6, ESP32-H2)
 * - clang-xtensa: Xtensa (ESP32, ESP32-S2, ESP32-S3)
 */
export type CompilerId = "clang-arm" | "clang-riscv" | "clang-xtensa";

/**
 * Maps architecture to the required compiler
 */
export const ARCHITECTURE_COMPILER_MAP: Record<Architecture, CompilerId> = {
  "cortex-m0": "clang-arm",
  "cortex-m0+": "clang-arm",
  "cortex-m3": "clang-arm",
  "cortex-m4": "clang-arm",
  "cortex-m4f": "clang-arm",
  "cortex-m7": "clang-arm",
  "cortex-m7f": "clang-arm",
  "cortex-m33": "clang-arm",
  "xtensa-lx6": "clang-xtensa",
  "xtensa-lx7": "clang-xtensa",
  riscv32: "clang-riscv",
};

/**
 * Get the required compiler for an architecture
 */
export function getCompilerForArchitecture(
  architecture: Architecture,
): CompilerId {
  return ARCHITECTURE_COMPILER_MAP[architecture];
}

// ============================================================================
// Compiler State
// ============================================================================

/**
 * State of a single compiler
 */
export type CompilerState =
  | "not_installed"
  | "downloading"
  | "installed"
  | "update_available"
  | "error";

/**
 * Full status of an installed compiler
 */
export interface InstalledCompiler {
  id: CompilerId;
  version: string;
  hash: string;
  installedAt: number;
  size: number;
  lastUsed?: number;
}

/**
 * Available compiler from manifest
 */
export interface AvailableCompiler {
  id: CompilerId;
  name: string;
  description: string;
  version: string;
  files: {
    wasm: string; // e.g., "clang_arm/clang-arm.wasm.gz"
    js: string; // e.g., "clang_arm/clang.js"
  };
  size: number; // Compressed size in bytes
  hash: string; // SHA-256 hash
  architectures: Architecture[]; // Supported architectures
}

/**
 * Combined compiler info for UI display
 */
export interface CompilerInfo {
  id: CompilerId;
  name: string;
  description: string;
  state: CompilerState;
  installed?: InstalledCompiler;
  available?: AvailableCompiler;
  downloadProgress?: DownloadProgress;
}

// ============================================================================
// Download Progress
// ============================================================================

/**
 * Download progress for a compiler
 */
export interface DownloadProgress {
  stage:
    | "starting"
    | "downloading"
    | "decompressing"
    | "caching"
    | "ready"
    | "error";
  current: number; // Bytes downloaded
  total: number; // Total bytes
  message: string;
  percentage: number; // 0-100
}

// ============================================================================
// Version Manifest
// ============================================================================

/**
 * WASM Version Manifest - served from /wasm/manifest.json
 */
export interface WasmManifest {
  version: string; // Manifest version "1.0.0"
  lastUpdated: string; // ISO date
  baseUrl: string; // Base URL for WASM files "/wasm"
  compilers: AvailableCompiler[];
  linkers?: AvailableLinker[];
}

/**
 * Available linker from manifest
 */
export interface AvailableLinker {
  id: string;
  name: string;
  version: string;
  files: {
    wasm: string;
    js: string;
  };
  size: number;
  hash: string;
}

// ============================================================================
// Storage & Cache
// ============================================================================

/**
 * Cached WASM binary metadata
 */
export interface WasmCacheMetadata {
  id: CompilerId;
  version: string;
  hash: string;
  size: number;
  timestamp: number;
}

/**
 * Storage statistics
 */
export interface StorageStats {
  used: number; // Bytes used by WASM cache
  available: number; // Estimated available storage
  quota: number; // Total quota if available
  compilers: Array<{
    id: CompilerId;
    size: number;
    version: string;
  }>;
}

// ============================================================================
// Update Notification
// ============================================================================

/**
 * Update notification for UI
 */
export interface UpdateNotification {
  type: "compiler" | "headers" | "libs";
  id: string;
  currentVersion: string;
  availableVersion: string;
  size: number;
  critical?: boolean;
  message?: string;
}

// ============================================================================
// Manager Events
// ============================================================================

/**
 * Events emitted by WasmManager
 */
export type WasmManagerEvent =
  | { type: "manifest_loaded"; manifest: WasmManifest }
  | { type: "download_started"; compilerId: CompilerId }
  | { type: "download_progress"; compilerId: CompilerId; progress: DownloadProgress }
  | { type: "download_complete"; compilerId: CompilerId }
  | { type: "download_error"; compilerId: CompilerId; error: string }
  | { type: "compiler_removed"; compilerId: CompilerId }
  | { type: "update_available"; notifications: UpdateNotification[] }
  | { type: "storage_changed"; stats: StorageStats };

/**
 * Event listener callback
 */
export type WasmManagerEventListener = (event: WasmManagerEvent) => void;
