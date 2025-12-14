import { useState, useCallback } from "react";
import type { GdbClient } from "../../../lib/gdb/GdbClient";

/**
 * Hook for managing breakpoints
 *
 * Handles breakpoint state and provides functionality to toggle breakpoints
 * through the GDB client. Displays status messages on success/failure.
 *
 * @param gdbClient - GDB client instance for breakpoint operations
 * @param isConnected - Whether connected to target
 * @param onOutput - Optional callback for status messages
 * @param setError - Error setter from parent component
 * @returns Breakpoints set and toggle function
 */
export function useBreakpoints(
  gdbClient: GdbClient | null | undefined,
  isConnected: boolean,
  onOutput?: (message: string) => void,
  setError?: (error: string | null) => void,
) {
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());

  const toggleBreakpoint = useCallback(
    async (address: number) => {
      if (!gdbClient || !isConnected) return;

      const isSet = breakpoints.has(address);

      try {
        if (isSet) {
          // Remove breakpoint
          await gdbClient.removeBreakpoint(address);
          setBreakpoints((prev) => {
            const next = new Set(prev);
            next.delete(address);
            return next;
          });
          onOutput?.(
            `[Breakpoint removed at 0x${address.toString(16).toUpperCase()}]`,
          );
        } else {
          // Add breakpoint
          await gdbClient.insertBreakpoint(address);
          setBreakpoints((prev) => new Set(prev).add(address));
          onOutput?.(
            `[Breakpoint set at 0x${address.toString(16).toUpperCase()}]`,
          );
        }
      } catch (err) {
        setError?.(`Failed to ${isSet ? "remove" : "set"} breakpoint: ${err}`);
      }
    },
    [gdbClient, isConnected, breakpoints, onOutput, setError],
  );

  return {
    breakpoints,
    toggleBreakpoint,
  };
}
