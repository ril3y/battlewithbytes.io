/**
 * Hook for managing platform selection and header loading
 *
 * Handles platform selection, header loading, and setup modal state.
 */

import { useState, useCallback } from "react";
import type {
  SelectedPlatform,
  ToolchainState,
  LoadingProgress,
} from "../platform/types";
import { getPlatformManager } from "../platform/PlatformManager";

interface UsePlatformOptions {
  onLog?: (message: string, type: "info" | "success" | "error" | "warning") => void;
  onToolchainUpdate?: (
    component: keyof ToolchainState,
    update: Partial<LoadingProgress>
  ) => void;
  onHeadersLoaded?: (headers: Map<string, Uint8Array>) => void;
}

interface UsePlatformReturn {
  // State
  selectedPlatform: SelectedPlatform | null;
  cachedHeaders: Map<string, Uint8Array> | null;
  headersReady: boolean;
  pendingPlatform: SelectedPlatform | null;
  isSetupModalOpen: boolean;

  // Actions
  handlePlatformSelect: (
    platform: SelectedPlatform | null,
    compilerReady: boolean
  ) => Promise<void>;
  loadPlatformHeaders: (platform: SelectedPlatform) => Promise<void>;
  loadPlatformFromProject: (
    platformId: string,
    familyId: string,
    deviceId: string
  ) => Promise<void>;
  handleSetupComplete: () => void;
  handleSetupCancel: () => void;
  handleLoadHeadersFromSetup: () => Promise<void>;
  setSelectedPlatform: React.Dispatch<React.SetStateAction<SelectedPlatform | null>>;
}

export function usePlatform(options: UsePlatformOptions = {}): UsePlatformReturn {
  const { onLog, onToolchainUpdate, onHeadersLoaded } = options;

  const [selectedPlatform, setSelectedPlatform] = useState<SelectedPlatform | null>(
    null
  );
  const [cachedHeaders, setCachedHeaders] = useState<Map<string, Uint8Array> | null>(
    null
  );
  const [headersReady, setHeadersReady] = useState(false);
  const [pendingPlatform, setPendingPlatform] = useState<SelectedPlatform | null>(
    null
  );
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

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

  // Load headers for a platform
  const loadPlatformHeaders = useCallback(
    async (platform: SelectedPlatform) => {
      setSelectedPlatform(platform);
      setCachedHeaders(null);
      setHeadersReady(false);
      updateToolchain("headers", { stage: "idle", message: "" });

      log("Loading platform headers...", "info");
      updateToolchain("headers", {
        stage: "downloading",
        message: "Loading headers...",
      });

      try {
        const platformManager = getPlatformManager();
        const headers = await platformManager.loadHeaders(
          platform.platformId,
          platform.familyId,
          (progress) => {
            updateToolchain("headers", {
              stage: progress.stage,
              message: progress.message,
              current: progress.current || 0,
              total: progress.total || 0,
            });
            if (progress.stage !== "ready") {
              log(
                progress.message,
                progress.stage === "error"
                  ? "error"
                  : progress.stage === "warning"
                    ? "warning"
                    : "info"
              );
            }
          }
        );

        setCachedHeaders(headers);
        setHeadersReady(true);

        if (headers.size === 0) {
          updateToolchain("headers", {
            stage: "warning",
            message: "No headers available",
          });
        } else {
          updateToolchain("headers", {
            stage: "ready",
            message: `${headers.size} headers loaded`,
          });
        }

        // Notify parent about loaded headers
        onHeadersLoaded?.(headers);
        log(`Added ${headers.size} headers to filesystem`, "success");
      } catch (err) {
        log(`Failed to load headers: ${err}`, "error");
        updateToolchain("headers", {
          stage: "error",
          message: "Failed to load",
        });
      }
    },
    [log, updateToolchain, onHeadersLoaded]
  );

  // Handle platform selection
  const handlePlatformSelect = useCallback(
    async (platform: SelectedPlatform | null, compilerReady: boolean) => {
      if (!platform) {
        setSelectedPlatform(null);
        setCachedHeaders(null);
        setHeadersReady(false);
        updateToolchain("headers", { stage: "idle", message: "" });
        return;
      }

      log(
        `Platform selected: ${platform.device.name} (${platform.family.architecture})`,
        "info"
      );

      // If compiler isn't ready, show setup modal first
      if (!compilerReady) {
        setPendingPlatform(platform);
        setIsSetupModalOpen(true);
        return;
      }

      // Compiler is ready, proceed with headers loading
      await loadPlatformHeaders(platform);
    },
    [log, updateToolchain, loadPlatformHeaders]
  );

  // Load platform from project data
  const loadPlatformFromProject = useCallback(
    async (platformId: string, familyId: string, deviceId: string) => {
      try {
        log("Loading platform configuration...", "info");
        const platformManager = getPlatformManager();
        const fullPlatform = await platformManager.selectPlatform(
          platformId,
          familyId,
          deviceId
        );
        setSelectedPlatform(fullPlatform);
        await loadPlatformHeaders(fullPlatform);
      } catch (err) {
        log(`Failed to load platform: ${err}`, "error");
      }
    },
    [log, loadPlatformHeaders]
  );

  // Setup modal handlers
  const handleSetupComplete = useCallback(() => {
    setIsSetupModalOpen(false);
    if (pendingPlatform) {
      loadPlatformHeaders(pendingPlatform);
      setPendingPlatform(null);
    }
  }, [pendingPlatform, loadPlatformHeaders]);

  const handleSetupCancel = useCallback(() => {
    setIsSetupModalOpen(false);
    setPendingPlatform(null);
  }, []);

  // Wrapper for loading headers from setup modal
  const handleLoadHeadersFromSetup = useCallback(async () => {
    if (!pendingPlatform) return;

    updateToolchain("headers", {
      stage: "downloading",
      message: "Loading headers...",
    });

    try {
      const headers = await loadHeadersFromRegistry(
        pendingPlatform.platformId,
        pendingPlatform.familyId,
        (progress) => {
          updateToolchain("headers", {
            stage:
              progress.stage === "ready"
                ? "ready"
                : progress.stage === "error"
                  ? "error"
                  : "downloading",
            message: progress.message,
            current: progress.current || 0,
            total: progress.total || 0,
          });
        }
      );

      setCachedHeaders(headers);
      setHeadersReady(true);
      updateToolchain("headers", {
        stage: "ready",
        message: `${headers.size} headers loaded`,
      });

      // Notify parent about loaded headers
      onHeadersLoaded?.(headers);
    } catch (err) {
      updateToolchain("headers", {
        stage: "error",
        message: "Failed to load",
      });
      throw err;
    }
  }, [pendingPlatform, updateToolchain, onHeadersLoaded]);

  return {
    selectedPlatform,
    cachedHeaders,
    headersReady,
    pendingPlatform,
    isSetupModalOpen,
    handlePlatformSelect,
    loadPlatformHeaders,
    loadPlatformFromProject,
    handleSetupComplete,
    handleSetupCancel,
    handleLoadHeadersFromSetup,
    setSelectedPlatform,
  };
}
