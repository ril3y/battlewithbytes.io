"use client";

import { useState } from "react";
import type { LoadingProgress, ToolchainState } from "../lib/platform/types";

interface LoadingOverlayProps {
  isVisible: boolean;
  toolchainState: ToolchainState;
  onDismiss?: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function ProgressBar({ progress }: { progress: LoadingProgress }) {
  const percent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div className="loading-progress-item">
      <div className="loading-progress-header">
        <span className="loading-progress-label">{progress.message}</span>
        {progress.total > 0 && (
          <span className="loading-progress-size">
            {formatBytes(progress.current)} / {formatBytes(progress.total)}
          </span>
        )}
      </div>
      <div className="loading-progress-bar">
        <div
          className={`loading-progress-fill ${progress.stage}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function StatusIcon({ stage }: { stage: LoadingProgress["stage"] }) {
  switch (stage) {
    case "ready":
      return <span className="status-icon ready">&#10003;</span>;
    case "error":
      return <span className="status-icon error">&#10007;</span>;
    case "downloading":
    case "extracting":
      return <span className="status-icon loading">&#8635;</span>;
    default:
      return <span className="status-icon idle">&#9675;</span>;
  }
}

export function LoadingOverlay({
  isVisible,
  toolchainState,
  onDismiss,
}: LoadingOverlayProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Auto-dismiss when all components are ready
  const allReady =
    toolchainState.clang.stage === "ready" &&
    toolchainState.lld.stage === "ready";

  // Check if any component is loading
  const isLoading =
    toolchainState.clang.stage === "downloading" ||
    toolchainState.clang.stage === "extracting" ||
    toolchainState.lld.stage === "downloading" ||
    toolchainState.lld.stage === "extracting" ||
    toolchainState.headers.stage === "downloading" ||
    toolchainState.headers.stage === "extracting";

  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <div className="loading-header">
          <h2>Loading BattleForge Toolchain</h2>
          <p className="loading-subtitle">
            Initializing WASM-based ARM compiler and linker
          </p>
        </div>

        <div className="loading-status-grid">
          <div className={`loading-status-item ${toolchainState.clang.stage}`}>
            <StatusIcon stage={toolchainState.clang.stage} />
            <div className="loading-status-info">
              <span className="loading-status-name">Clang Compiler</span>
              <span className="loading-status-detail">
                {toolchainState.clang.stage === "ready"
                  ? "~42 MB loaded"
                  : toolchainState.clang.message}
              </span>
            </div>
          </div>

          <div className={`loading-status-item ${toolchainState.lld.stage}`}>
            <StatusIcon stage={toolchainState.lld.stage} />
            <div className="loading-status-info">
              <span className="loading-status-name">LLD Linker</span>
              <span className="loading-status-detail">
                {toolchainState.lld.stage === "ready"
                  ? "~33 MB loaded"
                  : toolchainState.lld.message}
              </span>
            </div>
          </div>

          {toolchainState.headers.stage !== "idle" && (
            <div
              className={`loading-status-item ${toolchainState.headers.stage}`}
            >
              <StatusIcon stage={toolchainState.headers.stage} />
              <div className="loading-status-info">
                <span className="loading-status-name">Platform Headers</span>
                <span className="loading-status-detail">
                  {toolchainState.headers.message}
                </span>
              </div>
            </div>
          )}

          {toolchainState.libs.stage !== "idle" && (
            <div className={`loading-status-item ${toolchainState.libs.stage}`}>
              <StatusIcon stage={toolchainState.libs.stage} />
              <div className="loading-status-info">
                <span className="loading-status-name">Libraries</span>
                <span className="loading-status-detail">
                  {toolchainState.libs.message}
                </span>
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="loading-progress-section">
            {toolchainState.clang.stage === "downloading" && (
              <ProgressBar progress={toolchainState.clang} />
            )}
            {toolchainState.lld.stage === "downloading" && (
              <ProgressBar progress={toolchainState.lld} />
            )}
            {toolchainState.headers.stage === "downloading" && (
              <ProgressBar progress={toolchainState.headers} />
            )}
          </div>
        )}

        <div className="loading-actions">
          {allReady && onDismiss && (
            <button className="loading-continue-btn" onClick={onDismiss}>
              Start Coding
            </button>
          )}
          {!allReady && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>Loading...</span>
            </div>
          )}
        </div>

        <button
          className="loading-details-toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>

        {showDetails && (
          <div className="loading-details">
            <p>
              BattleForge uses WebAssembly versions of LLVM Clang and LLD to
              compile and link ARM firmware directly in your browser.
            </p>
            <ul>
              <li>No server required - all processing happens locally</li>
              <li>Supports Cortex-M0, M3, M4, and M7 architectures</li>
              <li>Outputs standard ELF files for flashing</li>
              <li>Files are cached for faster subsequent loads</li>
            </ul>
          </div>
        )}
      </div>

      <style jsx>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .loading-overlay-content {
          background: #1a1a2e;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 32px;
          max-width: 500px;
          width: 90%;
          text-align: center;
        }

        .loading-header h2 {
          color: #fff;
          margin: 0 0 8px;
          font-size: 1.5rem;
        }

        .loading-subtitle {
          color: #888;
          margin: 0 0 24px;
          font-size: 0.9rem;
        }

        .loading-status-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .loading-status-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #252538;
          border-radius: 8px;
          border: 1px solid #333;
        }

        .loading-status-item.ready {
          border-color: #4ade80;
        }

        .loading-status-item.error {
          border-color: #f87171;
        }

        .loading-status-item.downloading,
        .loading-status-item.extracting {
          border-color: #60a5fa;
        }

        .status-icon {
          font-size: 1.25rem;
          width: 24px;
          text-align: center;
        }

        .status-icon.ready {
          color: #4ade80;
        }
        .status-icon.error {
          color: #f87171;
        }
        .status-icon.loading {
          color: #60a5fa;
          animation: spin 1s linear infinite;
        }
        .status-icon.idle {
          color: #666;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .loading-status-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
        }

        .loading-status-name {
          color: #fff;
          font-weight: 500;
        }

        .loading-status-detail {
          color: #888;
          font-size: 0.8rem;
        }

        .loading-progress-section {
          margin-bottom: 24px;
        }

        .loading-progress-item {
          margin-bottom: 12px;
        }

        .loading-progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 0.8rem;
          color: #888;
        }

        .loading-progress-bar {
          height: 6px;
          background: #333;
          border-radius: 3px;
          overflow: hidden;
        }

        .loading-progress-fill {
          height: 100%;
          background: #60a5fa;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .loading-progress-fill.ready {
          background: #4ade80;
        }
        .loading-progress-fill.error {
          background: #f87171;
        }

        .loading-actions {
          margin-bottom: 16px;
        }

        .loading-continue-btn {
          background: #4ade80;
          color: #000;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition:
            transform 0.1s,
            background 0.2s;
        }

        .loading-continue-btn:hover {
          background: #22c55e;
          transform: scale(1.02);
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #888;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #333;
          border-top-color: #60a5fa;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-details-toggle {
          background: none;
          border: none;
          color: #60a5fa;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 4px;
        }

        .loading-details-toggle:hover {
          text-decoration: underline;
        }

        .loading-details {
          margin-top: 16px;
          padding: 16px;
          background: #252538;
          border-radius: 8px;
          text-align: left;
        }

        .loading-details p {
          color: #aaa;
          margin: 0 0 12px;
          font-size: 0.85rem;
        }

        .loading-details ul {
          margin: 0;
          padding-left: 20px;
          color: #888;
          font-size: 0.8rem;
        }

        .loading-details li {
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
}
