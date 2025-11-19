/**
 * GDB Connection Hook
 *
 * Manages GDB client connection state and output
 */

import { useState, useRef, useCallback } from 'react';
import { GdbClient } from '../../../lib/gdb/GdbClient';
import { ConnectionState, Target, BmpVersion } from '../../../lib/gdb/types';

export interface GdbConnectionState {
  // State
  gdbClient: GdbClient | null;
  gdbState: ConnectionState;
  targets: Target[];
  gdbOutput: string[];
  bmpVersion: BmpVersion | null;
  currentTarget: Target | null;

  // Setters
  setGdbClient: (client: GdbClient | null) => void;
  setGdbState: (state: ConnectionState) => void;
  setTargets: (targets: Target[]) => void;
  setBmpVersion: (version: BmpVersion | null) => void;
  setCurrentTarget: (target: Target | null) => void;

  // Actions
  addGdbOutput: (message: string) => void;
  clearGdbOutput: () => void;
}

export function useGdbConnection(): GdbConnectionState {
  const [gdbClient, setGdbClient] = useState<GdbClient | null>(null);
  const [gdbState, setGdbState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [targets, setTargets] = useState<Target[]>([]);
  const [gdbOutput, setGdbOutput] = useState<string[]>([]);
  const [bmpVersion, setBmpVersion] = useState<BmpVersion | null>(null);
  const [currentTarget, setCurrentTarget] = useState<Target | null>(null);

  const lastOutputRef = useRef<{text: string; timestamp: number} | null>(null);

  const addGdbOutput = useCallback((message: string) => {
    const now = Date.now();

    // Deduplicate: Skip if same message within 100ms
    if (lastOutputRef.current &&
        lastOutputRef.current.text === message &&
        now - lastOutputRef.current.timestamp < 100) {
      return;
    }

    lastOutputRef.current = { text: message, timestamp: now };
    setGdbOutput(prev => [...prev, message]);
  }, []);

  const clearGdbOutput = useCallback(() => {
    setGdbOutput([]);
    lastOutputRef.current = null;
  }, []);

  return {
    // State
    gdbClient,
    gdbState,
    targets,
    gdbOutput,
    bmpVersion,
    currentTarget,

    // Setters
    setGdbClient,
    setGdbState,
    setTargets,
    setBmpVersion,
    setCurrentTarget,

    // Actions
    addGdbOutput,
    clearGdbOutput,
  };
}
