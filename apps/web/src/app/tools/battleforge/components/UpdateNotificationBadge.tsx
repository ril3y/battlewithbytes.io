"use client";

import { useState, useEffect, useCallback } from "react";
import {
  WasmManager,
  type UpdateNotification,
  type CompilerId,
} from "../lib/wasm";

interface UpdateNotificationBadgeProps {
  onOpenWasmManager?: () => void;
}

export function UpdateNotificationBadge({
  onOpenWasmManager,
}: UpdateNotificationBadgeProps) {
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check for updates on mount
    checkForUpdates();

    // Subscribe to update events
    const unsubscribe = WasmManager.subscribe((event) => {
      if (event.type === "update_available") {
        setNotifications(event.notifications);
      } else if (event.type === "download_complete") {
        // Remove notification for downloaded compiler
        setNotifications((prev) =>
          prev.filter((n) => n.id !== event.compilerId)
        );
        setIsUpdating((prev) => {
          const next = new Set(prev);
          next.delete(event.compilerId);
          return next;
        });
      }
    });

    // Check for updates periodically (every 30 minutes)
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const checkForUpdates = useCallback(async () => {
    try {
      const updates = await WasmManager.checkForUpdates();
      setNotifications(updates);
    } catch (e) {
      console.error("[UpdateNotificationBadge] Failed to check updates:", e);
    }
  }, []);

  const handleUpdateOne = useCallback(async (notification: UpdateNotification) => {
    if (notification.type !== "compiler") return;

    const compilerId = notification.id as CompilerId;
    setIsUpdating((prev) => new Set(prev).add(compilerId));

    try {
      await WasmManager.downloadCompiler(compilerId);
    } catch (e) {
      console.error("[UpdateNotificationBadge] Update failed:", e);
      setIsUpdating((prev) => {
        const next = new Set(prev);
        next.delete(compilerId);
        return next;
      });
    }
  }, []);

  const handleUpdateAll = useCallback(async () => {
    for (const notification of notifications) {
      if (notification.type === "compiler") {
        await handleUpdateOne(notification);
      }
    }
  }, [notifications, handleUpdateOne]);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Badge Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          backgroundColor: "var(--warning-bg, #854d0e)",
          border: "1px solid var(--warning-color, #f59e0b)",
          borderRadius: "4px",
          color: "var(--warning-text, #fde047)",
          fontSize: "12px",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "18px",
            height: "18px",
            backgroundColor: "var(--warning-color, #f59e0b)",
            color: "black",
            borderRadius: "50%",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        >
          {notifications.length}
        </span>
        <span>
          Update{notifications.length > 1 ? "s" : ""} Available
        </span>
        <span
          style={{
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsExpanded(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99,
            }}
          />

          {/* Dropdown Content */}
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "320px",
              backgroundColor: "var(--bg-primary, #1e1e1e)",
              border: "1px solid var(--border-color, #333)",
              borderRadius: "8px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              zIndex: 100,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-color, #333)",
                backgroundColor: "var(--bg-secondary, #252526)",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "var(--text-primary, #d4d4d4)",
                }}
              >
                Available Updates
              </span>
              {notifications.length > 1 && (
                <button
                  onClick={handleUpdateAll}
                  disabled={isUpdating.size > 0}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "var(--accent-color, #0ea5e9)",
                    border: "none",
                    borderRadius: "4px",
                    color: "white",
                    fontSize: "11px",
                    cursor: isUpdating.size > 0 ? "wait" : "pointer",
                    opacity: isUpdating.size > 0 ? 0.6 : 1,
                  }}
                >
                  Update All
                </button>
              )}
            </div>

            {/* Notification List */}
            <div style={{ maxHeight: "300px", overflow: "auto" }}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border-color, #2a2a2a)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 6px",
                          backgroundColor:
                            notification.type === "compiler"
                              ? "var(--compiler-bg, #1e3a5f)"
                              : "var(--header-bg, #1e401e)",
                          borderRadius: "3px",
                          fontSize: "10px",
                          color:
                            notification.type === "compiler"
                              ? "var(--accent-color, #0ea5e9)"
                              : "var(--success-color, #22c55e)",
                          textTransform: "uppercase",
                        }}
                      >
                        {notification.type}
                      </span>
                      <span
                        style={{
                          fontWeight: 500,
                          color: "var(--text-primary, #d4d4d4)",
                          fontSize: "13px",
                        }}
                      >
                        {notification.id}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary, #888)",
                      }}
                    >
                      v{notification.currentVersion} → v
                      {notification.availableVersion}
                    </div>

                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-tertiary, #666)",
                        marginTop: "4px",
                      }}
                    >
                      Download size: {formatBytes(notification.size)}
                    </div>

                    {notification.message && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary, #888)",
                          marginTop: "4px",
                          fontStyle: "italic",
                        }}
                      >
                        {notification.message}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpdateOne(notification)}
                    disabled={isUpdating.has(notification.id)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: isUpdating.has(notification.id)
                        ? "var(--disabled-bg, #333)"
                        : "var(--accent-color, #0ea5e9)",
                      border: "none",
                      borderRadius: "4px",
                      color: "white",
                      fontSize: "11px",
                      cursor: isUpdating.has(notification.id)
                        ? "wait"
                        : "pointer",
                      marginLeft: "12px",
                      flexShrink: 0,
                    }}
                  >
                    {isUpdating.has(notification.id) ? "Updating..." : "Update"}
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            {onOpenWasmManager && (
              <div
                style={{
                  padding: "8px 16px",
                  borderTop: "1px solid var(--border-color, #333)",
                  backgroundColor: "var(--bg-secondary, #252526)",
                  textAlign: "center",
                }}
              >
                <button
                  onClick={() => {
                    setIsExpanded(false);
                    onOpenWasmManager();
                  }}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "transparent",
                    border: "1px solid var(--border-color, #444)",
                    borderRadius: "4px",
                    color: "var(--text-secondary, #888)",
                    fontSize: "12px",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Open WASM Manager
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
