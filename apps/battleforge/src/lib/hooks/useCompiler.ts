/**
 * Hook for managing compiler state and operations
 *
 * Handles loading the Clang WASM compiler and tracking its ready state.
 */

import { useState, useCallback } from "react";
import {
  loadClangModule,
  getClangVersion,
} from "../compiler/EmscriptenClangLoader";
import type { LoadProgress } from "../compiler/EmscriptenClangLoader";
import type { ToolchainState, LoadingProgress } from "../platform/types";

interface UseCompilerOptions {
  onLog?: (message: string, type: "info" | "success" | "error" | "warning") => void;
  onToolchainUpdate?: (
    component: keyof ToolchainState,
    update: Partial<LoadingProgress>
  ) => void;
}

interface UseCompilerReturn {
  compilerReady: boolean;
  isLoading: boolean;
  handleLoadCompiler: () => Promise<void>;
}

export function useCompiler(options: UseCompilerOptions = {}): UseCompilerReturn {
  const { onLog, onToolchainUpdate } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [compilerReady, setCompilerReady] = useState(false);

  const log = useCallback(
    (message: string, type: "info" | "success" | "error" | "warning" = "info") => {
      onLog?.(message, type);
    },
    [onLog]
  );

  const updateToolchain = useCallback(
    (component: keyof ToolchainState, update: Partial<LoadingProgress>) => {
      onToolchainUpdate?.(component, update);
    },
    [onToolchainUpdate]
  );

  const handleLoadCompiler = useCallback(async () => {
    if (compilerReady) {
      log("Compiler already loaded", "warning");
      return;
    }

    if (isLoading) {
      log("Compiler load already in progress", "warning");
      return;
    }

    setIsLoading(true);
    log("Starting compiler download...", "info");
    updateToolchain("clang", {
      stage: "downloading",
      message: "Starting download...",
    });

    try {
      await loadClangModule((progress: LoadProgress) => {
        if (progress.stage === "downloading") {
          log(progress.message, "info");
          updateToolchain("clang", {
            stage: "downloading",
            message: progress.message,
            current: progress.current || 0,
            total: progress.total || 0,
          });
        } else if (progress.stage === "instantiating") {
          log(progress.message, "info");
          updateToolchain("clang", {
            stage: "extracting",
            message: "Instantiating WASM...",
          });
        } else if (progress.stage === "ready") {
          log("ARM Clang compiler ready", "success");
          updateToolchain("clang", {
            stage: "ready",
            message: "Ready",
          });
          setCompilerReady(true);
        } else if (progress.stage === "error") {
          log(`Compiler load failed: ${progress.message}`, "error");
          updateToolchain("clang", {
            stage: "error",
            message: progress.message,
          });
        }
      });

      const version = await getClangVersion();
      log(`Compiler version: ${version}`, "info");

      // Mark LLD as ready too (it's loaded with Clang)
      updateToolchain("lld", { stage: "ready", message: "Ready" });
    } catch (error) {
      log(
        `Failed to load compiler: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
      updateToolchain("clang", {
        stage: "error",
        message: "Load failed",
      });
    } finally {
      setIsLoading(false);
    }
  }, [compilerReady, isLoading, log, updateToolchain]);

  return {
    compilerReady,
    isLoading,
    handleLoadCompiler,
  };
}
