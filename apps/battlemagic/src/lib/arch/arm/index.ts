/**
 * ARM Cortex-M Register Definitions
 *
 * This module provides comprehensive TypeScript type definitions and utilities
 * for ARM Cortex-M microcontrollers. It covers all core registers, system control
 * registers, debugging interfaces, and peripheral control registers.
 *
 * @module arm
 */

// Export all types
export * from "./types";

// Export all utility functions
export * from "./utils";

// Re-export commonly used types for convenience
export type {
  ArmCortexMRegisters,
  GeneralPurposeRegisters,
  StackPointers,
  SpecialRegisters,
  FpuRegisters,
  ProgramStatusRegister,
  SystemControlBlock,
  DebugRegisters,
  RegisterName,
  CoreRegisterName,
  FpuRegisterName,
  RegisterMetadata,
  RegisterValue,
  RegisterSnapshot,
  CpuFeatures,
} from "./types";

export {
  decodePsr,
  decodeControl,
  decodeCpuid,
  decodeIcsr,
  decodeCfsr,
  decodeHfsr,
  decodeDfsr,
  decodeDhcsr,
  encodeDhcsr,
  decodeDemcr,
  formatConditionFlags,
  getCpuName,
  getArchitecture,
  describeCfsr,
  formatRegisterValue,
  formatExceptionNumber,
  getRegisterMetadata,
} from "./utils";
