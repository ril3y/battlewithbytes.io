"use client";

/**
 * Global WASM Provider - loads the analyzer once at app startup
 * This prevents race conditions with component unmounting
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { loadWasmAnalyzer, type WasmAnalyzerModule } from "../lib/wasmAnalyzer";

interface WasmContextType {
  wasmModule: WasmAnalyzerModule | null;
  isLoading: boolean;
  error: string | null;
}

const WasmContext = createContext<WasmContextType>({
  wasmModule: null,
  isLoading: true,
  error: null,
});

export function WasmProvider({ children }: { children: React.ReactNode }) {
  const [wasmModule, setWasmModule] = useState<WasmAnalyzerModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      console.log("[WasmProvider] Starting WASM load...");
      try {
        const wasmAnalyzer = await loadWasmAnalyzer();

        if (!cancelled) {
          console.log("[WasmProvider] WASM loaded successfully");
          setWasmModule(wasmAnalyzer);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error("[WasmProvider] Failed to load WASM:", errorMsg);
          setError(errorMsg);
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []); // Load once on mount

  return (
    <WasmContext.Provider value={{ wasmModule, isLoading, error }}>
      {children}
    </WasmContext.Provider>
  );
}

export function useWasm() {
  const context = useContext(WasmContext);
  if (!context) {
    throw new Error("useWasm must be used within WasmProvider");
  }
  return context;
}
