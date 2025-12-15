"use client";

import { useEffect, useRef, useCallback } from "react";
import { WasmManager } from "../wasm";
import type { UpdateNotification } from "../wasm/types";

/**
 * Hook to show a toast when compiler updates are available
 * @param showToast - Function to show a toast notification
 * @param onOpenWasmManager - Optional callback to open the WASM manager
 */
export function useCompilerUpdateToast(
  showToast: (toast: {
    type: "info" | "success" | "warning" | "error";
    title: string;
    message?: string;
    duration?: number;
    action?: { label: string; onClick: () => void };
  }) => void,
  onOpenWasmManager?: () => void,
) {
  const hasShownToast = useRef(false);
  const lastNotificationCount = useRef(0);

  const showUpdateToast = useCallback((updates: UpdateNotification[]) => {
    const compilerUpdates = updates.filter((u) => u.type === "compiler");

    if (compilerUpdates.length === 0) return;

    if (compilerUpdates.length === 1) {
      const update = compilerUpdates[0];
      showToast({
        type: "warning",
        title: "Compiler Update Available",
        message: `${update.id}: v${update.currentVersion} → v${update.availableVersion}`,
        duration: 10000,
        action: onOpenWasmManager
          ? { label: "Update Now", onClick: onOpenWasmManager }
          : undefined,
      });
    } else {
      showToast({
        type: "warning",
        title: `${compilerUpdates.length} Compiler Updates Available`,
        message: compilerUpdates.map((u) => u.id).join(", "),
        duration: 10000,
        action: onOpenWasmManager
          ? { label: "View Updates", onClick: onOpenWasmManager }
          : undefined,
      });
    }
  }, [showToast, onOpenWasmManager]);

  useEffect(() => {
    // Check for updates on mount
    const checkAndNotify = async () => {
      try {
        const updates = await WasmManager.checkForUpdates();
        if (updates.length > 0 && !hasShownToast.current) {
          showUpdateToast(updates);
          hasShownToast.current = true;
          lastNotificationCount.current = updates.length;
        }
      } catch (e) {
        console.error("[useCompilerUpdateToast] Failed to check updates:", e);
      }
    };

    // Check on mount (with slight delay to not block initial render)
    const timeoutId = setTimeout(checkAndNotify, 2000);

    // Subscribe to update events
    const unsubscribe = WasmManager.subscribe((event) => {
      if (event.type === "update_available") {
        // Only show toast if we have new notifications
        if (event.notifications.length > lastNotificationCount.current) {
          showUpdateToast(event.notifications);
          lastNotificationCount.current = event.notifications.length;
        }
      } else if (event.type === "download_complete") {
        // Reset when user updates
        lastNotificationCount.current = Math.max(0, lastNotificationCount.current - 1);
      }
    });

    // Periodic check (every 30 minutes)
    const intervalId = setInterval(checkAndNotify, 30 * 60 * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [showUpdateToast]);
}
