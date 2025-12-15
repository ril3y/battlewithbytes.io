import type { DisassembledInstruction } from "../../lib/arch/arm/disasm";
import { GdbClient } from "../../lib/gdb/GdbClient";

/**
 * Props for the DisassemblyView component
 *
 * Provides disassembled view of ARM/Thumb instructions for debugging.
 * Shows instruction addresses, bytes, mnemonics, and control flow.
 * Supports breakpoint management and symbol resolution.
 */
export interface DisassemblyViewProps {
  onReadMemory: (address: number, length: number) => Promise<Uint8Array | null>;
  programCounter?: number;
  isConnected: boolean;
  registers?: Map<string, number>;
  gdbClient?: GdbClient | null;
  onOutput?: (message: string) => void;
  onAddressClick?: (address: number) => void; // Callback when address is clicked
  jumpToAddress?: number; // External request to jump to an address
  onJumpComplete?: () => void; // Callback when jump is complete
  breakpoints?: Set<number>; // Breakpoint addresses from parent
  onToggleBreakpoint?: (address: number) => Promise<void>; // Callback to toggle breakpoint
}

/**
 * Represents a single line in the disassembly view
 *
 * Contains the instruction along with metadata about its state
 * and relationships to other instructions.
 */
export interface DisassemblyLine {
  instruction: DisassembledInstruction;
  isCurrentPC: boolean;
  isBreakpoint: boolean;
  isFunctionEntry: boolean;
  crossRefs: number[];
  xrefsTo?: number; // Count of xrefs pointing TO this address
  xrefsFrom?: number; // Count of xrefs pointing FROM this address
}

/**
 * View mode for the disassembly display
 *
 * - linear: Traditional sequential disassembly view
 * - graph: Control flow graph visualization
 */
export type ViewMode = "linear" | "graph";

/**
 * Information about a jump/branch instruction for visualization
 *
 * Used to draw visual arrows showing control flow between instructions
 * in the linear disassembly view.
 */
export interface JumpInfo {
  fromAddress: number;
  toAddress: number;
  type: "forward" | "backward" | "conditional";
  fromLine: number;
  toLine: number;
  column: number;
}
