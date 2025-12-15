/**
 * Hook for managing terminal output messages
 *
 * Provides a structured way to log messages to the terminal panel.
 */

import { useState, useCallback } from "react";

export type OutputMessageType = "info" | "success" | "error" | "warning";

export interface OutputMessage {
  message: string;
  type: OutputMessageType;
  timestamp?: string;
}

interface UseTerminalOutputOptions {
  initialMessage?: string;
}

interface UseTerminalOutputReturn {
  output: OutputMessage[];
  log: (message: string, type?: OutputMessageType) => void;
  clear: () => void;
  setOutput: React.Dispatch<React.SetStateAction<OutputMessage[]>>;
}

export function useTerminalOutput(
  options: UseTerminalOutputOptions = {}
): UseTerminalOutputReturn {
  const { initialMessage = "BattleForge Ready - Compile firmware for embedded systems" } = options;

  const [output, setOutput] = useState<OutputMessage[]>([
    {
      message: initialMessage,
      type: "info",
    },
  ]);

  const log = useCallback(
    (message: string, type: OutputMessageType = "info") => {
      const timestamp = new Date().toLocaleTimeString();
      setOutput((prev) => [...prev, { message, type, timestamp }]);
    },
    []
  );

  const clear = useCallback(() => {
    setOutput([]);
  }, []);

  return {
    output,
    log,
    clear,
    setOutput,
  };
}
