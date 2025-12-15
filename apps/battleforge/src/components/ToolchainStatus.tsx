"use client";

import type { ToolchainState } from "../lib/platform/types";

interface ToolchainStatusProps {
  state: ToolchainState;
  compact?: boolean;
}

function _formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function StatusIndicator({ stage }: { stage: string }) {
  const getColor = () => {
    switch (stage) {
      case "ready":
        return "#00ff9d";
      case "error":
        return "#f87171";
      case "warning":
        return "#fbbf24"; // Yellow/amber for warning
      case "downloading":
      case "extracting":
        return "#0088ff";
      default:
        return "#444";
    }
  };

  return (
    <span className="status-indicator" style={{ backgroundColor: getColor() }}>
      <style jsx>{`
        .status-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: ${stage === "downloading" || stage === "extracting"
            ? "pulse 1.5s infinite"
            : "none"};
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </span>
  );
}

export function ToolchainStatus({
  state,
  compact = false,
}: ToolchainStatusProps) {
  const items = [
    { name: "Clang", state: state.clang, size: "~42 MB" },
    { name: "LLD", state: state.lld, size: "~33 MB" },
  ];

  // Only show headers/libs if not idle
  if (state.headers.stage !== "idle") {
    items.push({ name: "Headers", state: state.headers, size: "varies" });
  }
  if (state.libs.stage !== "idle") {
    items.push({ name: "Libs", state: state.libs, size: "varies" });
  }

  const allReady = items.every(
    (item) => item.state.stage === "ready" || item.state.stage === "warning",
  );
  const hasError = items.some((item) => item.state.stage === "error");
  const hasWarning = items.some((item) => item.state.stage === "warning");
  const isLoading = items.some(
    (item) =>
      item.state.stage === "downloading" || item.state.stage === "extracting",
  );

  if (compact) {
    return (
      <div className="toolchain-status-compact">
        <div className="status-summary">
          <StatusIndicator
            stage={
              hasError
                ? "error"
                : hasWarning
                  ? "warning"
                  : allReady
                    ? "ready"
                    : isLoading
                      ? "downloading"
                      : "idle"
            }
          />
          <span className="status-text">
            {hasError
              ? "ERROR"
              : hasWarning
                ? "Warning"
                : allReady
                  ? "Ready"
                  : isLoading
                    ? "Loading..."
                    : "Not loaded"}
          </span>
        </div>
        <style jsx>{`
          .toolchain-status-compact {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 8px;
            background: #1a1a1a;
            border-radius: 4px;
          }
          .status-summary {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .status-text {
            font-size: 0.8rem;
            color: #aaa;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="toolchain-status">
      <div className="status-header">
        <span className="status-title">Toolchain Status</span>
        <span
          className={`status-badge ${hasError ? "error" : hasWarning ? "warning" : allReady ? "ready" : "loading"}`}
        >
          {hasError
            ? "ERROR"
            : hasWarning
              ? "Warning"
              : allReady
                ? "Ready"
                : "Loading"}
        </span>
      </div>

      <div className="status-items">
        {items.map((item) => (
          <div key={item.name} className="status-item">
            <div className="item-header">
              <StatusIndicator stage={item.state.stage} />
              <span className="item-name">{item.name}</span>
              <span className="item-size">{item.size}</span>
            </div>
            {(item.state.stage === "downloading" ||
              item.state.stage === "extracting") &&
              item.state.total > 0 && (
                <div className="item-progress">
                  <div
                    className="item-progress-bar"
                    style={{
                      width: `${(item.state.current / item.state.total) * 100}%`,
                    }}
                  />
                </div>
              )}
            <div className="item-message">
              {item.state.message ||
                (item.state.stage === "ready" ? "Loaded" : "Waiting...")}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .toolchain-status {
          background: #111;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 12px;
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .status-title {
          font-weight: 600;
          color: #ededed;
          font-size: 0.9rem;
        }

        .status-badge {
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-badge.ready {
          background: rgba(0, 255, 157, 0.15);
          color: #00ff9d;
        }

        .status-badge.error {
          background: rgba(248, 113, 113, 0.15);
          color: #f87171;
        }

        .status-badge.loading {
          background: rgba(0, 136, 255, 0.15);
          color: #0088ff;
        }

        .status-badge.warning {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
        }

        .status-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-item {
          background: #1a1a1a;
          border-radius: 6px;
          padding: 8px;
        }

        .item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .item-name {
          color: #ededed;
          font-weight: 500;
          font-size: 0.85rem;
          flex: 1;
        }

        .item-size {
          color: #666;
          font-size: 0.75rem;
          font-family: monospace;
        }

        .item-progress {
          height: 3px;
          background: #333;
          border-radius: 2px;
          overflow: hidden;
          margin: 4px 0;
        }

        .item-progress-bar {
          height: 100%;
          background: #0088ff;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .item-message {
          color: #888;
          font-size: 0.75rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
