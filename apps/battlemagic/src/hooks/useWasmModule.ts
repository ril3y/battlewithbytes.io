"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface WasmModuleState<T> {
  module: T | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: Error | null;
  progress: number;
}

export interface UseWasmModuleOptions {
  trackProgress?: boolean;
  retries?: number;
  retryDelay?: number;
  debug?: boolean;
  preload?: boolean;
}

export function useWasmModule<T>(
  loader: () => Promise<T>,
  options: UseWasmModuleOptions = {},
) {
  const {
    trackProgress = false,
    retries = 3,
    retryDelay = 1000,
    debug = false,
    preload = false,
  } = options;

  const [state, setState] = useState<WasmModuleState<T>>({
    module: null,
    isLoading: false,
    isInitialized: false,
    error: null,
    progress: 0,
  });

  const mountedRef = useRef(true);
  const attemptRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const log = useCallback(
    (...args: unknown[]) => {
      if (debug) console.log("[useWasmModule]", ...args);
    },
    [debug],
  );

  const loadModule = useCallback(
    async (isRetry = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      if (!isRetry) {
        attemptRef.current = 0;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        progress: trackProgress ? 0 : prev.progress,
      }));

      log("Loading WASM module...", { attempt: attemptRef.current + 1 });

      try {
        if (trackProgress && mountedRef.current && !signal.aborted) {
          setState((prev) => ({ ...prev, progress: 10 }));
        }

        const wasmModule = await loader();

        if (signal.aborted) {
          log("Load aborted");
          return;
        }

        if (trackProgress && mountedRef.current && !signal.aborted) {
          setState((prev) => ({ ...prev, progress: 90 }));
        }

        await new Promise((resolve) => setTimeout(resolve, 50));

        if (!mountedRef.current || signal.aborted) {
          log("Component unmounted during initialization");
          return;
        }

        setState({
          module: wasmModule,
          isLoading: false,
          isInitialized: true,
          error: null,
          progress: 100,
        });

        log("WASM module loaded successfully");
      } catch (error) {
        if (signal.aborted) {
          log("Load aborted during error handling");
          return;
        }

        const err = error instanceof Error ? error : new Error(String(error));
        log("WASM module load failed:", err);

        attemptRef.current += 1;

        if (attemptRef.current < retries && mountedRef.current) {
          log(`Retrying... (${attemptRef.current}/${retries})`);

          await new Promise((resolve) => setTimeout(resolve, retryDelay));

          if (!mountedRef.current || signal.aborted) {
            return;
          }

          loadModule(true);
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: err,
            progress: 0,
          }));
        }
      }
    },
    [loader, retries, retryDelay, trackProgress, log],
  );

  const reset = useCallback(() => {
    log("Resetting WASM module");

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      module: null,
      isLoading: false,
      isInitialized: false,
      error: null,
      progress: 0,
    });

    attemptRef.current = 0;
  }, [log]);

  const reload = useCallback(() => {
    log("Reloading WASM module");
    reset();
    loadModule();
  }, [reset, loadModule, log]);

  useEffect(() => {
    if (preload && !state.isInitialized && !state.isLoading && !state.error) {
      loadModule();
    }
  }, [preload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      log("Cleaning up WASM module");
    };
  }, [log]);

  return {
    ...state,
    load: loadModule,
    reload,
    reset,
  };
}
