"use client";

import type { PlatformOption } from "./types";

interface PlatformSelectorProps {
  platforms: PlatformOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function PlatformSelector({
  platforms,
  selectedId,
  onSelect,
}: PlatformSelectorProps) {
  return (
    <div className="platform-selector">
      <h3 className="step-title">Select Your Platform</h3>
      <p className="step-subtitle">
        Choose the microcontroller platform for your project
      </p>

      <div className="platform-grid">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            className={`platform-card ${selectedId === platform.id ? "selected" : ""} ${!platform.supported ? "disabled" : ""}`}
            onClick={() => platform.supported && onSelect(platform.id)}
            disabled={!platform.supported}
          >
            <div
              className="platform-icon"
              style={{ backgroundColor: `${platform.color}20` }}
            >
              <img
                src={platform.icon}
                alt={platform.name}
                width={48}
                height={48}
                style={{ objectFit: "contain" }}
                onError={(e) => {
                  // Fallback to text if image fails
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="platform-name">{platform.name}</div>
            <div className="platform-desc">{platform.description}</div>
            {platform.boardCount !== undefined && platform.boardCount > 0 && (
              <div className="platform-boards">
                {platform.boardCount} board
                {platform.boardCount !== 1 ? "s" : ""} available
              </div>
            )}
            {platform.comingSoon && (
              <span className="coming-soon-badge">Coming Soon</span>
            )}
          </button>
        ))}
      </div>

      <style jsx>{`
        .platform-selector {
          padding: 20px 0;
        }

        .step-title {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
        }

        .step-subtitle {
          margin: 0 0 24px 0;
          font-size: 0.9rem;
          color: #888;
        }

        .platform-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .platform-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px 16px;
          background: linear-gradient(180deg, #1a1a1a 0%, #111 100%);
          border: 2px solid #2a2a2a;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          position: relative;
          min-height: 180px;
        }

        .platform-card:hover:not(.disabled) {
          border-color: #00ff9d;
          background: linear-gradient(180deg, #1f1f1f 0%, #151515 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 255, 157, 0.15);
        }

        .platform-card.selected {
          border-color: #00ff9d;
          background: linear-gradient(
            180deg,
            rgba(0, 255, 157, 0.15) 0%,
            rgba(0, 255, 157, 0.05) 100%
          );
          box-shadow: 0 0 20px rgba(0, 255, 157, 0.2);
        }

        .platform-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .platform-icon {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .platform-name {
          font-size: 1rem;
          font-weight: 600;
          color: #e0e0e0;
        }

        .platform-card.selected .platform-name {
          color: #fff;
        }

        .platform-desc {
          font-size: 0.75rem;
          color: #666;
          line-height: 1.4;
          flex: 1;
        }

        .platform-boards {
          font-size: 0.7rem;
          color: #00ff9d;
          padding: 4px 8px;
          background: rgba(0, 255, 157, 0.1);
          border-radius: 4px;
        }

        .coming-soon-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 3px 8px;
          background: rgba(255, 170, 0, 0.2);
          color: #ffaa00;
          border-radius: 4px;
          border: 1px solid rgba(255, 170, 0, 0.3);
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
