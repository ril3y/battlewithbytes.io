"use client";

import type { SelectedPlatform } from "../lib/platform/types";

interface ProjectPlatform {
  platformId: string;
  familyId: string;
  deviceId: string;
  architecture?: string;
}

interface PlatformCardProps {
  selectedPlatform: SelectedPlatform | null;
  projectPlatform?: ProjectPlatform | null;
  onClick: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PlatformCard({
  selectedPlatform,
  projectPlatform,
  onClick,
}: PlatformCardProps) {
  return (
    <div className="platform-card" onClick={onClick}>
      <div className="platform-card-header">
        <span className="platform-label">Target Platform</span>
        <button className="platform-change-btn">Change</button>
      </div>
      {selectedPlatform ? (
        <div className="platform-selected">
          <div className="platform-name">{selectedPlatform.device.name}</div>
          <div className="platform-details">
            <span>{selectedPlatform.family.architecture}</span>
            <span>{formatBytes(selectedPlatform.device.flash)} Flash</span>
            <span>{formatBytes(selectedPlatform.device.ram)} RAM</span>
          </div>
        </div>
      ) : projectPlatform ? (
        <div className="platform-selected platform-pending">
          <div className="platform-name">
            {projectPlatform.deviceId.toUpperCase()}
          </div>
          <div className="platform-details">
            <span>{projectPlatform.architecture}</span>
            <span className="platform-pending-text">
              Click to configure platform
            </span>
          </div>
        </div>
      ) : (
        <div className="platform-empty">
          <span className="platform-empty-icon">+</span>
          <span className="platform-empty-text">
            Select a target platform to begin
          </span>
        </div>
      )}

      <style jsx>{`
        .platform-card {
          background: #0a0a0a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .platform-card:hover {
          border-color: var(--accent-primary, #00ff9d);
        }

        .platform-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .platform-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #888;
        }

        .platform-change-btn {
          font-size: 0.7rem;
          padding: 3px 8px;
          background: rgba(0, 255, 157, 0.1);
          border: 1px solid rgba(0, 255, 157, 0.3);
          color: var(--accent-primary, #00ff9d);
          border-radius: 4px;
          cursor: pointer;
        }

        .platform-change-btn:hover {
          background: rgba(0, 255, 157, 0.2);
        }

        .platform-selected .platform-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 8px;
        }

        .platform-details {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 0.75rem;
        }

        .platform-details span {
          padding: 2px 8px;
          background: #1a1a1a;
          border-radius: 4px;
          color: #888;
        }

        .platform-pending-text {
          color: var(--accent-primary) !important;
          font-style: italic;
        }

        .platform-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          color: #666;
        }

        .platform-empty-icon {
          width: 36px;
          height: 36px;
          border: 2px dashed #444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #555;
        }

        .platform-empty-text {
          font-size: 0.8rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
