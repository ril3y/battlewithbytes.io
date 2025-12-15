/**
 * Debug State Hook
 *
 * Manages debugging state: registers, stack frames, breakpoints, program counter
 */

import {
  useState,
  useCallback,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";
import { RegisterValue } from "../../RegistersPanel";
import { StackFrame } from "../../StackPanel";
import { Breakpoint } from "../../BreakpointsManager";

export interface DebugState {
  // State
  registers: RegisterValue[];
  stackFrames: StackFrame[];
  breakpoints: Breakpoint[];
  programCounter: number | undefined;
  selectedDisassemblyAddress: number | null;
  jumpToPCTrigger: number;
  breakpointAddresses: Set<number>;
  executionState: "running" | "stopped" | "stepping";

  // Setters
  setRegisters: (registers: RegisterValue[]) => void;
  setStackFrames: (frames: StackFrame[]) => void;
  setBreakpoints: Dispatch<SetStateAction<Breakpoint[]>>;
  setProgramCounter: (pc: number | undefined) => void;
  setExecutionState: (state: "running" | "stopped" | "stepping") => void;

  // Actions
  triggerJumpToPC: () => void;
}

export function useDebugState(): DebugState {
  const [registers, setRegisters] = useState<RegisterValue[]>([]);
  const [stackFrames, setStackFrames] = useState<StackFrame[]>([]);
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [programCounter, setProgramCounter] = useState<number | undefined>();
  const [selectedDisassemblyAddress] = useState<number | null>(null);
  const [jumpToPCTrigger, setJumpToPCTrigger] = useState<number>(0);
  const [executionState, setExecutionState] = useState<
    "running" | "stopped" | "stepping"
  >("stopped");

  // Convert breakpoints to Set<number> for efficient lookups
  const breakpointAddresses = useMemo(() => {
    return new Set<number>(
      breakpoints
        .filter((bp) => bp.enabled)
        .map((bp) => {
          const addr =
            bp.address.startsWith("0x") || bp.address.startsWith("0X")
              ? parseInt(bp.address, 16)
              : parseInt(bp.address, 10);
          return isNaN(addr) ? 0 : addr;
        })
        .filter((addr) => addr !== 0),
    );
  }, [breakpoints]);

  const triggerJumpToPC = useCallback(() => {
    setJumpToPCTrigger((prev) => prev + 1);
  }, []);

  return {
    // State
    registers,
    stackFrames,
    breakpoints,
    programCounter,
    selectedDisassemblyAddress,
    jumpToPCTrigger,
    breakpointAddresses,
    executionState,

    // Setters
    setRegisters,
    setStackFrames,
    setBreakpoints,
    setProgramCounter,
    setExecutionState,

    // Actions
    triggerJumpToPC,
  };
}
