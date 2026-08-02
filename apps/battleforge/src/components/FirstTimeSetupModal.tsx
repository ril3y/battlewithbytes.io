"use client";

import { useState, useEffect, useCallback } from "react";
import type { SelectedPlatform, LoadingProgress } from "../lib/platform/types";

interface FirstTimeSetupModalProps {
  isOpen: boolean;
  platform: SelectedPlatform;
  onComplete: () => void;
  onCancel: () => void;
  onLoadCompiler: () => Promise<void>;
  onLoadHeaders: () => Promise<void>;
  compilerReady: boolean;
  headersReady: boolean;
  compilerProgress?: LoadingProgress;
  headersProgress?: LoadingProgress;
}

export function FirstTimeSetupModal({
  isOpen,
  platform,
  onComplete,
  onCancel,
  onLoadCompiler,
  onLoadHeaders,
  compilerReady,
  headersReady,
  compilerProgress,
  headersProgress,
}: FirstTimeSetupModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if everything is ready
  useEffect(() => {
    if (compilerReady && headersReady && isLoading) {
      setIsLoading(false);
      // Small delay before closing to show completion state
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  }, [compilerReady, headersReady, isLoading, onComplete]);

  const handleStartSetup = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load compiler first (if not already loaded)
      if (!compilerReady) {
        await onLoadCompiler();
      }
      // Then load headers (if not already loaded)
      if (!headersReady) {
        await onLoadHeaders();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
      setIsLoading(false);
    }
  }, [compilerReady, headersReady, onLoadCompiler, onLoadHeaders]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return "✓";
      case "downloading":
        return "↓";
      case "error":
        return "✗";
      default:
        return "○";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "ready":
        return "status-ready";
      case "downloading":
        return "status-loading";
      case "error":
        return "status-error";
      default:
        return "status-pending";
    }
  };

  if (!isOpen) return null;

  const compilerStatus = compilerReady
    ? "ready"
    : compilerProgress?.stage === "downloading"
      ? "downloading"
      : "pending";
  const headersStatus = headersReady
    ? "ready"
    : headersProgress?.stage === "downloading"
      ? "downloading"
      : "pending";

  return (
    <div className="setup-overlay">
      <div className="setup-modal">
        <div className="setup-header">
          <div className="setup-icon">⚡</div>
          <h2>First Time Setup</h2>
          <p>
            Download required toolchain components for {platform.device.name}
          </p>
        </div>

        <div className="setup-items">
          {/* Compiler */}
          <div className={`setup-item ${getStatusClass(compilerStatus)}`}>
            <div className="item-icon">{getStatusIcon(compilerStatus)}</div>
            <div className="item-info">
              <div className="item-name">ARM Clang Compiler</div>
              <div className="item-desc">
                {compilerStatus === "downloading" && compilerProgress?.message
                  ? compilerProgress.message
                  : "WebAssembly-based ARM compiler"}
              </div>
              {compilerStatus === "downloading" &&
                compilerProgress &&
                compilerProgress.total > 0 && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(compilerProgress.current / compilerProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                )}
            </div>
            <div className="item-size">~19 MB</div>
          </div>

          {/* LLD Linker */}
          <div className={`setup-item ${getStatusClass(compilerStatus)}`}>
            <div className="item-icon">{getStatusIcon(compilerStatus)}</div>
            <div className="item-info">
              <div className="item-name">LLD Linker</div>
              <div className="item-desc">
                Links object files into firmware binaries
              </div>
            </div>
            <div className="item-size">~33 MB</div>
          </div>

          {/* Platform Headers */}
          <div className={`setup-item ${getStatusClass(headersStatus)}`}>
            <div className="item-icon">{getStatusIcon(headersStatus)}</div>
            <div className="item-info">
              <div className="item-name">{platform.family.name} Headers</div>
              <div className="item-desc">
                {headersStatus === "downloading" && headersProgress?.message
                  ? headersProgress.message
                  : `CMSIS and device headers for ${platform.device.name}`}
              </div>
              {headersStatus === "downloading" &&
                headersProgress &&
                headersProgress.total > 0 && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(headersProgress.current / headersProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                )}
            </div>
            <div className="item-size">
              {formatBytes(platform.family.headers.size)}
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠</span> {error}
          </div>
        )}

        <div className="setup-footer">
          <div className="total-size">
            Total download: ~52 MB + {formatBytes(platform.family.headers.size)}
          </div>
          <div className="setup-actions">
            <button
              className="cancel-btn"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="start-btn"
              onClick={handleStartSetup}
              disabled={isLoading || (compilerReady && headersReady)}
            >
              {isLoading
                ? "Downloading..."
                : compilerReady && headersReady
                  ? "Ready!"
                  : "Download & Setup"}
            </button>
          </div>
        </div>

        <style jsx global>{`
          .setup-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1100;
            backdrop-filter: blur(8px);
          }

          .setup-modal {
            background: linear-gradient(180deg, #111 0%, #0a0a0a 100%);
            border: 1px solid #333;
            border-radius: 16px;
            width: 90%;
            max-width: 500px;
            overflow: hidden;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
          }

          .setup-header {
            text-align: center;
            padding: 28px 24px 20px;
            border-bottom: 1px solid #222;
          }

          .setup-icon {
            font-size: 2.5rem;
            margin-bottom: 12px;
          }

          .setup-header h2 {
            margin: 0 0 8px 0;
            font-size: 1.3rem;
            font-weight: 600;
            color: #fff;
          }

          .setup-header p {
            margin: 0;
            font-size: 0.9rem;
            color: #888;
          }

          .setup-items {
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .setup-item {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            padding: 14px 16px;
            background: #0a0a0a;
            border: 1px solid #222;
            border-radius: 10px;
            transition: all 0.2s;
          }

          .setup-item.status-ready {
            border-color: rgba(0, 255, 157, 0.3);
            background: rgba(0, 255, 157, 0.05);
          }

          .setup-item.status-loading {
            border-color: rgba(0, 136, 255, 0.3);
            background: rgba(0, 136, 255, 0.05);
          }

          .setup-item.status-error {
            border-color: rgba(239, 68, 68, 0.3);
            background: rgba(239, 68, 68, 0.05);
          }

          .item-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #222;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .status-ready .item-icon {
            background: rgba(0, 255, 157, 0.2);
            color: #00ff9d;
          }

          .status-loading .item-icon {
            background: rgba(0, 136, 255, 0.2);
            color: #0088ff;
            animation: pulse 1s ease-in-out infinite;
          }

          .status-error .item-icon {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          .item-info {
            flex: 1;
            min-width: 0;
          }

          .item-name {
            font-size: 0.9rem;
            font-weight: 600;
            color: #fff;
            margin-bottom: 4px;
          }

          .item-desc {
            font-size: 0.75rem;
            color: #666;
            line-height: 1.4;
          }

          .item-size {
            font-size: 0.75rem;
            color: #555;
            white-space: nowrap;
          }

          .progress-bar {
            height: 3px;
            background: #222;
            border-radius: 2px;
            margin-top: 8px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #0088ff, #00ff9d);
            border-radius: 2px;
            transition: width 0.3s ease;
          }

          .error-message {
            margin: 0 20px;
            padding: 12px 16px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            color: #ef4444;
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .setup-footer {
            padding: 16px 20px 20px;
            border-top: 1px solid #222;
          }

          .total-size {
            text-align: center;
            font-size: 0.75rem;
            color: #555;
            margin-bottom: 16px;
          }

          .setup-actions {
            display: flex;
            gap: 12px;
          }

          .cancel-btn,
          .start-btn {
            flex: 1;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
          }

          .cancel-btn {
            background: transparent;
            border: 1px solid #444;
            color: #888;
          }

          .cancel-btn:hover:not(:disabled) {
            border-color: #666;
            color: #fff;
          }

          .cancel-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .start-btn {
            background: linear-gradient(135deg, #00ff9d 0%, #00cc7d 100%);
            border: none;
            color: #000;
          }

          .start-btn:hover:not(:disabled) {
            filter: brightness(1.1);
            transform: translateY(-1px);
          }

          .start-btn:disabled {
            background: #333;
            color: #666;
            cursor: not-allowed;
            transform: none;
          }
        `}</style>
      </div>
    </div>
  );
}
