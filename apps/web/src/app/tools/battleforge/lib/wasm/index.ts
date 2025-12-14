/**
 * WASM Manager Module
 *
 * Multi-compiler WASM management system for BattleForge IDE.
 * Supports clang-arm, clang-riscv, and clang-xtensa compilers.
 */

// Types
export type {
  CompilerId,
  CompilerState,
  InstalledCompiler,
  AvailableCompiler,
  CompilerInfo,
  DownloadProgress,
  WasmManifest,
  AvailableLinker,
  WasmCacheMetadata,
  StorageStats,
  UpdateNotification,
  WasmManagerEvent,
  WasmManagerEventListener,
} from "./types";

// Type utilities
export {
  ARCHITECTURE_COMPILER_MAP,
  getCompilerForArchitecture,
} from "./types";

// Cache
export { WasmCache } from "./WasmCache";

// Loader
export {
  loadManifest,
  downloadCompiler,
  getCachedCompiler,
  isCompilerCached,
  removeCompiler,
  getStorageStats,
  listInstalled,
  clearCache,
  getCompilerDisplayInfo,
} from "./WasmLoader";

// Manager (singleton)
export { WasmManager, WasmManagerService } from "./WasmManager";
