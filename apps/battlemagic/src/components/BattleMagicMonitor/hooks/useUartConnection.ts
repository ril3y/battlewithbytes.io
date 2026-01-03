/**
 * UART Connection Hook
 *
 * Manages UART serial port connection and output
 */

import { useState, useCallback } from "react";
import { useLogStore } from "../../../lib/stores/LogStore";

export interface UartConnectionState {
  // State
  uartConnected: boolean;
  uartPort: SerialPort | null;
  uartReader: ReadableStreamDefaultReader<Uint8Array> | null;
  uartOutput: string[];
  baudRate: number;

  // Setters
  setUartConnected: (connected: boolean) => void;
  setUartPort: (port: SerialPort | null) => void;
  setUartReader: (
    reader: ReadableStreamDefaultReader<Uint8Array> | null,
  ) => void;
  setBaudRate: (rate: number) => void;

  // Actions
  addUartOutput: (message: string) => void;
  clearUartOutput: () => void;
}

export function useUartConnection(
  initialBaudRate: number = 230400,
): UartConnectionState {
  const [uartConnected, setUartConnected] = useState(false);
  const [uartPort, setUartPort] = useState<SerialPort | null>(null);
  const [uartReader, setUartReader] =
    useState<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const [baudRate, setBaudRate] = useState(initialBaudRate);

  const { addUartLog, clearUartLogs } = useLogStore.getState();

  const addUartOutput = useCallback((message: string) => {
    addUartLog(message);
  }, []);

  const clearUartOutput = useCallback(() => {
    clearUartLogs();
  }, []);

  return {
    // State
    uartConnected,
    uartPort,
    uartReader,
    uartOutput: [], // Logs are managed by LogStore
    baudRate,

    // Setters
    setUartConnected,
    setUartPort,
    setUartReader,
    setBaudRate,

    // Actions
    addUartOutput,
    clearUartOutput,
  };
}
