"use client";

import { useState, useCallback, useEffect } from "react";
import {
  WasmManager,
  type DownloadProgress,
  getCompilerDisplayInfo,
} from "../lib/wasm";
import type { Architecture } from "../lib/platform/types";

interface CompilerDownloadModalProps {
  isOpen: boolean;
  architecture: Architecture;
  onClose: () => void;
  onDownloadComplete: () => void;
  onSkip?: () => void;
}

export function CompilerDownloadModal({
  isOpen,
  architecture,
  onClose,
  onDownloadComplete,
  onSkip,
}: CompilerDownloadModalProps) {
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const compilerId = WasmManager.getCompilerIdForArchitecture(architecture);
  const compilerInfo = getCompilerDisplayInfo(compilerId);

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setProgress(null);
      setError(null);
      setIsDownloading(false);
    }
  }, [isOpen]);

  const handleDownload = useCallback(async () => {
    try {
      setIsDownloading(true);
      setError(null);

      await WasmManager.ensureCompiler(compilerId, (p) => {
        setProgress(p);
      });

      onDownloadComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
      setIsDownloading(false);
    }
  }, [compilerId, onDownloadComplete]);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--bg-primary, #1e1e1e)",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "480px",
          width: "90%",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          border: "1px solid var(--border-color, #333)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: "16px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--text-primary, #d4d4d4)",
            }}
          >
            Compiler Required
          </h2>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: "13px",
              color: "var(--text-secondary, #888)",
            }}
          >
            The selected platform requires the{" "}
            <strong>{compilerInfo.name}</strong> compiler.
          </p>
        </div>

        {/* Compiler Info */}
        <div
          style={{
            padding: "12px",
            backgroundColor: "var(--bg-secondary, #252526)",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              marginBottom: "4px",
              color: "var(--text-primary, #d4d4d4)",
            }}
          >
            {compilerInfo.name}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary, #888)",
              marginBottom: "8px",
            }}
          >
            {compilerInfo.description}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
            }}
          >
            {compilerInfo.architectures.map((arch) => (
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
        </div>

        {/* Progress */}
        {progress && (
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                marginBottom: "4px",
                color: "var(--text-secondary, #888)",
              }}
            >
              <span>{progress.message}</span>
              <span>
                {progress.percentage}%
                {progress.total > 0 && ` (${formatBytes(progress.current)})`}
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "6px",
                backgroundColor: "var(--progress-bg, #333)",
                borderRadius: "3px",
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

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "8px 12px",
              backgroundColor: "var(--error-bg, #7f1d1d)",
              color: "var(--error-text, #fca5a5)",
              borderRadius: "4px",
              fontSize: "12px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          {onSkip && !isDownloading && (
            <button
              onClick={onSkip}
              style={{
                padding: "8px 16px",
                backgroundColor: "transparent",
                border: "1px solid var(--border-color, #444)",
                borderRadius: "4px",
                color: "var(--text-secondary, #888)",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Skip for now
            </button>
          )}
          <button
            onClick={onClose}
            disabled={isDownloading}
            style={{
              padding: "8px 16px",
              backgroundColor: "transparent",
              border: "1px solid var(--border-color, #444)",
              borderRadius: "4px",
              color: "var(--text-primary, #d4d4d4)",
              fontSize: "13px",
              cursor: isDownloading ? "not-allowed" : "pointer",
              opacity: isDownloading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--accent-color, #0ea5e9)",
              border: "none",
              borderRadius: "4px",
              color: "white",
              fontSize: "13px",
              fontWeight: 500,
              cursor: isDownloading ? "wait" : "pointer",
              opacity: isDownloading ? 0.8 : 1,
            }}
          >
            {isDownloading ? "Downloading..." : "Download Compiler"}
          </button>
        </div>
      </div>
    </div>
  );
}
