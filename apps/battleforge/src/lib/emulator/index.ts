/**
 * Emulator Module
 *
 * Provides CPU emulation functionality using WASM-compiled Unicorn.
 */

export * from "./types";
export {
  loadUnicornModule,
  createUnicornInstance,
  createCortexMEmulator,
  runEmulation,
  isUnicornLoaded,
  unloadUnicorn,
  UnicornArch,
  UnicornArmMode,
  UnicornPerm,
  UnicornHookType,
  ArmReg,
} from "./UnicornLoader";
