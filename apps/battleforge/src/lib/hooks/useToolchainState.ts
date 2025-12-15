/**
 * Hook for managing toolchain state
 *
 * Tracks the loading/ready state of various toolchain components
 * (Clang, LLD, headers, libraries).
 */

import { useState, useCallback } from "react";
import type { ToolchainState, LoadingProgress } from "../platform/types";

const INITIAL_STATE: ToolchainState = {
  clang: { stage: "idle", current: 0, total: 0, message: "" },
  lld: { stage: "idle", current: 0, total: 0, message: "" },
  headers: { stage: "idle", current: 0, total: 0, message: "" },
  libs: { stage: "idle", current: 0, total: 0, message: "" },
};

interface UseToolchainStateReturn {
  toolchainState: ToolchainState;
  updateToolchainComponent: (
    component: keyof ToolchainState,
    update: Partial<LoadingProgress>
  ) => void;
  resetToolchainState: () => void;
}

export function useToolchainState(): UseToolchainStateReturn {
  const [toolchainState, setToolchainState] =
    useState<ToolchainState>(INITIAL_STATE);

  const updateToolchainComponent = useCallback(
    (component: keyof ToolchainState, update: Partial<LoadingProgress>) => {
      setToolchainState((prev) => ({
        ...prev,
        [component]: { ...prev[component], ...update },
      }));
    },
    []
  );

  const resetToolchainState = useCallback(() => {
    setToolchainState(INITIAL_STATE);
  }, []);

  return {
    toolchainState,
    updateToolchainComponent,
    resetToolchainState,
  };
}
