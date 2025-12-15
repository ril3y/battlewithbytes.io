"use client";

import { useState, useCallback, useEffect } from "react";
import {
  WasmManager,
  type CompilerInfo,
  type StorageStats,
  type DownloadProgress,
  type CompilerId,
} from "../lib/wasm";
import { HeaderCache } from "../lib/platform/HeaderCache";

interface WasmManagerPanelProps {
  onLog?: (
    message: string,
    type?: "info" | "success" | "error" | "warning",
  ) => void;
}

// Singleton header cache instance
const headerCache = new HeaderCache();

export function WasmManagerPanel({ onLog }: WasmManagerPanelProps) {
  const [compilers, setCompilers] = useState<CompilerInfo[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [headerCacheSize, setHeaderCacheSize] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<
    Map<CompilerId, DownloadProgress>
  >(new Map());

  // Load compiler info on mount
  useEffect(() => {
    loadCompilerInfo();

    // Subscribe to manager events
    const unsubscribe = WasmManager.subscribe((event) => {
      switch (event.type) {
        case "download_progress":
          setDownloadProgress((prev) => {
            const next = new Map(prev);
            next.set(event.compilerId, event.progress);
            return next;
          });
          break;
        case "download_complete":
        case "download_error":
        case "compiler_removed":
          setDownloadProgress((prev) => {
            const next = new Map(prev);
            next.delete(event.compilerId);
            return next;
          });
          loadCompilerInfo();
          break;
        case "storage_changed":
          setStorageStats(event.stats);
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  const loadCompilerInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [compilerInfos, stats, headerSize] = await Promise.all([
        WasmManager.getAllCompilerInfos(),
        WasmManager.getStorageStats(),
        headerCache.getTotalSize(),
      ]);

      setCompilers(compilerInfos);
      setStorageStats(stats);
      setHeaderCacheSize(headerSize);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load compilers";
      setError(message);
      onLog?.(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [onLog]);

  const handleDownload = useCallback(
    async (compilerId: CompilerId) => {
      try {
        onLog?.(`Downloading ${compilerId}...`, "info");
        await WasmManager.downloadCompiler(compilerId);
        onLog?.(`${compilerId} downloaded successfully`, "success");
      } catch (e) {
        const message = e instanceof Error ? e.message : "Download failed";
        onLog?.(message, "error");
      }
    },
    [onLog],
  );

  const handleRemove = useCallback(
    async (compilerId: CompilerId) => {
      try {
        onLog?.(`Removing ${compilerId}...`, "info");
        await WasmManager.removeCompiler(compilerId);
        onLog?.(`${compilerId} removed`, "success");
      } catch (e) {
        const message = e instanceof Error ? e.message : "Remove failed";
        onLog?.(message, "error");
      }
    },
    [onLog],
  );

  const handleCheckUpdates = useCallback(async () => {
    try {
      WasmManager.clearManifestCache();
      await loadCompilerInfo();
      onLog?.("Checked for updates", "info");
    } catch (_e) {
      onLog?.("Failed to check for updates", "error");
    }
  }, [loadCompilerInfo, onLog]);

  const handleClearHeaderCache = useCallback(async () => {
    try {
      onLog?.("Clearing header cache...", "info");
      await headerCache.clear();
      setHeaderCacheSize(0);
      onLog?.("Header cache cleared. Headers will be re-downloaded on next compile.", "success");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to clear header cache";
      onLog?.(message, "error");
    }
  }, [onLog]);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div
      className="wasm-manager-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "var(--bg-secondary, #1e1e1e)",
        color: "var(--text-primary, #d4d4d4)",
        fontSize: "13px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px",
          borderBottom: "1px solid var(--border-color, #333)",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>
            Compiler Toolchains
          </h3>
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-secondary, #888)",
              marginTop: "4px",
            }}
          >
            Manage WASM compiler downloads
          </div>
        </div>
        <button
          onClick={handleCheckUpdates}
          disabled={isLoading}
          style={{
            padding: "6px 12px",
            backgroundColor: "var(--button-bg, #0ea5e9)",
            border: "none",
            borderRadius: "4px",
            color: "white",
            fontSize: "12px",
            cursor: isLoading ? "wait" : "pointer",
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          Check for Updates
        </button>
      </div>

      {/* Storage Stats */}
      {storageStats && (
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "var(--bg-tertiary, #252526)",
            borderBottom: "1px solid var(--border-color, #333)",
            fontSize: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
            <span>
              <strong>Compiler Storage:</strong> {formatBytes(storageStats.used)}
            </span>
            {storageStats.quota > 0 && (
              <span style={{ color: "var(--text-secondary, #888)" }}>
                / {formatBytes(storageStats.quota)} available
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>
              <strong>Header Cache:</strong> {formatBytes(headerCacheSize)}
            </span>
            {headerCacheSize > 0 && (
              <button
                onClick={handleClearHeaderCache}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "var(--warning-bg, #854d0e)",
                  border: "none",
                  borderRadius: "4px",
                  color: "var(--warning-text, #fde047)",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                Clear Headers
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "var(--error-bg, #7f1d1d)",
            color: "var(--error-text, #fca5a5)",
            fontSize: "12px",
          }}
        >
          {error}
        </div>
      )}

      {/* Compiler List */}
      <div style={{ flex: 1, overflow: "auto", padding: "12px" }}>
        {isLoading && compilers.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: "var(--text-secondary, #888)",
            }}
          >
            Loading compilers...
          </div>
        )}

        {compilers.map((compiler) => (
          <CompilerCard
            key={compiler.id}
            compiler={compiler}
            progress={downloadProgress.get(compiler.id)}
            onDownload={() => handleDownload(compiler.id)}
            onRemove={() => handleRemove(compiler.id)}
            formatBytes={formatBytes}
          />
        ))}
      </div>
    </div>
  );
}

// Compiler card component
function CompilerCard({
  compiler,
  progress,
  onDownload,
  onRemove,
  formatBytes,
}: {
  compiler: CompilerInfo;
  progress?: DownloadProgress;
  onDownload: () => void;
  onRemove: () => void;
  formatBytes: (bytes: number) => string;
}) {
  const isDownloading = compiler.state === "downloading" || !!progress;
  const isInstalled =
    compiler.state === "installed" || compiler.state === "update_available";
  const hasUpdate = compiler.state === "update_available";
  const isComingSoon =
    (compiler.available as Record<string, unknown> | undefined)?.status ===
    "coming_soon";

  return (
    <div
      style={{
        padding: "12px",
        marginBottom: "8px",
        backgroundColor: "var(--card-bg, #252526)",
        borderRadius: "4px",
        border: `1px solid ${hasUpdate ? "var(--warning-color, #f59e0b)" : "var(--border-color, #333)"}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: "bold" }}>{compiler.name}</span>
            <StatusBadge state={compiler.state} hasUpdate={hasUpdate} />
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary, #888)",
              margin: "4px 0",
            }}
          >
            {compiler.description}
          </div>

          {/* Version info */}
          <div style={{ fontSize: "11px", marginTop: "6px" }}>
            {compiler.installed && (
              <span>
                Installed: v{compiler.installed.version} (
                {formatBytes(compiler.installed.size)})
              </span>
            )}
            {hasUpdate && compiler.available && (
              <span
                style={{
                  color: "var(--warning-color, #f59e0b)",
                  marginLeft: "8px",
                }}
              >
                → v{compiler.available.version} available
              </span>
            )}
            {!compiler.installed && compiler.available && !isComingSoon && (
              <span style={{ color: "var(--text-secondary, #888)" }}>
                v{compiler.available.version} (
                {formatBytes(compiler.available.size)})
              </span>
            )}
          </div>

          {/* Supported architectures */}
          {compiler.available && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                marginTop: "8px",
              }}
            >
              {compiler.available.architectures.map((arch) => (
                <span
                  key={arch}
                  style={{
                    padding: "2px 6px",
                    backgroundColor: "var(--platform-bg, #1e3a5f)",
                    borderRadius: "3px",
                    fontSize: "10px",
                    color: "var(--accent-color, #0ea5e9)",
                  }}
                >
                  {arch}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            marginLeft: "12px",
          }}
        >
          {!isInstalled && !isDownloading && !isComingSoon && (
            <button
              onClick={onDownload}
              style={{
                padding: "6px 12px",
                backgroundColor: "var(--button-bg, #0ea5e9)",
                border: "none",
                borderRadius: "4px",
                color: "white",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Download
            </button>
          )}

          {isComingSoon && (
            <span
              style={{
                padding: "6px 12px",
                backgroundColor: "var(--disabled-bg, #333)",
                borderRadius: "4px",
                color: "var(--text-secondary, #888)",
                fontSize: "12px",
              }}
            >
              Coming Soon
            </span>
          )}

          {hasUpdate && !isDownloading && (
            <button
              onClick={onDownload}
              style={{
                padding: "6px 12px",
                backgroundColor: "var(--warning-color, #f59e0b)",
                border: "none",
                borderRadius: "4px",
                color: "black",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Update
            </button>
          )}

          {isInstalled && (
            <button
              onClick={onRemove}
              style={{
                padding: "6px 12px",
                backgroundColor: "var(--error-bg, #7f1d1d)",
                border: "none",
                borderRadius: "4px",
                color: "white",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Download Progress */}
      {isDownloading && progress && (
        <div style={{ marginTop: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
              marginBottom: "4px",
            }}
          >
            <span>{progress.message}</span>
            <span>{progress.percentage}%</span>
          </div>
          <div
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "var(--progress-bg, #333)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress.percentage}%`,
                height: "100%",
                backgroundColor: "var(--accent-color, #0ea5e9)",
                transition: "width 0.2s ease",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Status badge component
function StatusBadge({
  state,
  hasUpdate: _hasUpdate,
}: {
  state: string;
  hasUpdate: boolean;
}) {
  let bgColor: string;
  let textColor: string;
  let label: string;

  switch (state) {
    case "installed":
      bgColor = "var(--success-bg, #166534)";
      textColor = "var(--success-text, #86efac)";
      label = "Installed";
      break;
    case "update_available":
      bgColor = "var(--warning-bg, #854d0e)";
      textColor = "var(--warning-text, #fde047)";
      label = "Update Available";
      break;
    case "downloading":
      bgColor = "var(--info-bg, #1e3a5f)";
      textColor = "var(--accent-color, #0ea5e9)";
      label = "Downloading";
      break;
    case "error":
      bgColor = "var(--error-bg, #7f1d1d)";
      textColor = "var(--error-text, #fca5a5)";
      label = "Error";
      break;
    default:
      bgColor = "var(--neutral-bg, #333)";
      textColor = "var(--text-secondary, #888)";
      label = "Not Installed";
  }

  return (
    <span
      style={{
        padding: "2px 6px",
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: "3px",
        fontSize: "10px",
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}
