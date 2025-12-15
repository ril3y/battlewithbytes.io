/**
 * GDB Client Library for Black Magic Probe
 *
 * Main exports for the GDB Remote Serial Protocol implementation.
 */

export { GdbClient } from "./GdbClient";
export { RspProtocol } from "./RspProtocol";
export { SerialTransport } from "./SerialTransport";
export { BlackMagicCommands } from "./BlackMagicCommands";
export { TargetInfo } from "./TargetInfo";

// Export enums as values
export {
  ConnectionState,
  PowerState,
  DebugInterface,
  BreakpointType,
  ExecutionState,
} from "./types";

// Export types
export type {
  GdbPacket,
  GdbResponse,
  Target,
  BmpVersion,
  StopReply,
  MemoryData,
  QueuedCommand,
  GdbClientEvents,
  SerialConfig,
  GdbClientConfig,
  RegisterInfo,
  Breakpoint,
  ThreadInfo,
} from "./types";

// Export TargetInfo types
export type { ChipInfo, MemoryRegion, TargetInformation } from "./TargetInfo";
