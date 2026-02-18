/**
 * useOutputBuffer Hook
 *
 * React hook for managing output logs with circular buffer
 * to prevent memory leaks during long debugging sessions.
 */

import { useState, useCallback, useMemo } from "react";
import { CircularBuffer } from "../utils/CircularBuffer";

export interface OutputEntry {
  timestamp: Date;
  text: string;
  type?: "info" | "error" | "warning" | "success";
}

interface UseOutputBufferOptions {
  maxSize?: number;
  includeTimestamp?: boolean;
}

const DEFAULT_OPTIONS: Required<UseOutputBufferOptions> = {
  maxSize: 1000,
  includeTimestamp: true,
};

/**
 * Custom hook for managing output with circular buffer
 *
 * @param options - Configuration options
 * @returns Output management functions and state
 */
export function useOutputBuffer(options: UseOutputBufferOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Use useState to trigger re-renders when buffer changes
  const [buffer] = useState(
    () => new CircularBuffer<OutputEntry>(config.maxSize),
  );
  const [version, setVersion] = useState(0); // Force re-render on buffer change

  /**
   * Add a single output entry
   */
  const addOutput = useCallback(
    (text: string, type?: OutputEntry["type"]) => {
      const entry: OutputEntry = {
        timestamp: new Date(),
        text,
        type,
      };

      buffer.push(entry);
      setVersion((v) => v + 1); // Trigger re-render
    },
    [buffer],
  );

  /**
   * Add multiple output entries
   */
  const addOutputBatch = useCallback(
    (entries: Array<{ text: string; type?: OutputEntry["type"] }>) => {
      const outputEntries: OutputEntry[] = entries.map((e) => ({
        timestamp: new Date(),
        text: e.text,
        type: e.type,
      }));

      buffer.pushMany(outputEntries);
      setVersion((v) => v + 1); // Trigger re-render
    },
    [buffer],
  );

  /**
   * Clear all output
   */
  const clearOutput = useCallback(() => {
    buffer.clear();
    setVersion((v) => v + 1); // Trigger re-render
  }, [buffer]);

  /**
   * Get formatted output strings
   */
  const getFormattedOutput = useMemo(() => {
    const _ = version; // Depend on version to recalculate

    return buffer.toArray().map((entry) => {
      if (config.includeTimestamp) {
        const timeStr = entry.timestamp.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3,
        });
        return `[${timeStr}] ${entry.text}`;
      }
      return entry.text;
    });
  }, [buffer, version, config.includeTimestamp]);

  /**
   * Get raw output entries
   */
  const getOutputEntries = useMemo(() => {
    const _ = version; // Depend on version to recalculate
    return buffer.toArray();
  }, [buffer, version]);

  return {
    addOutput,
    addOutputBatch,
    clearOutput,
    output: getFormattedOutput,
    entries: getOutputEntries,
    size: buffer.getSize(),
    isFull: buffer.isFull(),
  };
}
