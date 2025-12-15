"use client";

import { useState, useEffect } from "react";
import type { BoardManifest } from "../../lib/registry/types";
import type { FrameworkOption } from "./types";
import { withBasePath } from "../../lib/utils/basePath";

interface FrameworkSelectorProps {
  board: BoardManifest;
  selectedFramework: string | null;
  onSelect: (frameworkId: string) => void;
}

interface FrameworkConfig {
  name: string;
  description: string;
  supported: boolean;
  comingSoon?: boolean;
  note?: string;
}

interface FrameworksData {
  frameworks: Record<string, FrameworkConfig>;
}

// Cache for frameworks data
let frameworksCache: FrameworksData | null = null;

export function FrameworkSelector({
  board,
  selectedFramework,
  onSelect,
}: FrameworkSelectorProps) {
  const [frameworksData, setFrameworksData] = useState<FrameworksData | null>(frameworksCache);
  const [loading, setLoading] = useState(!frameworksCache);

  // Load frameworks.json from submodule
  useEffect(() => {
    if (frameworksCache) {
      setFrameworksData(frameworksCache);
      return;
    }

    const loadFrameworks = async () => {
      try {
        const response = await fetch(withBasePath("/boards/frameworks.json"));
        if (response.ok) {
          const data = await response.json();
          frameworksCache = data;
          setFrameworksData(data);
        }
      } catch (err) {
        console.warn("Failed to load frameworks.json:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFrameworks();
  }, []);

  // Extract available frameworks from board manifest
  const boardFrameworks = board.frameworks || {};
  const boardFrameworkIds = Object.keys(boardFrameworks);

  // Build framework options from board data + frameworks.json metadata
  const frameworkOptions: FrameworkOption[] = boardFrameworkIds
    .filter((id) => {
      const globalConfig = frameworksData?.frameworks?.[id];
      // Skip if explicitly not supported in frameworks.json
      return !(globalConfig && !globalConfig.supported);
    })
    .map((id) => {
      const globalConfig = frameworksData?.frameworks?.[id];
      return {
        id,
        name: globalConfig?.name || id.charAt(0).toUpperCase() + id.slice(1),
        description: globalConfig?.description || `${id} framework`,
        icon: id === "arduino" ? "🔧" : id === "native" ? "⚡" : "📦",
      };
    });

  if (loading) {
    return (
      <div className="framework-selector">
        <div className="loading-state">
          <p>Loading frameworks...</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (frameworkOptions.length === 0) {
    return (
      <div className="framework-selector">
        <div className="empty-state">
          <p>No frameworks available for this board.</p>
          <p className="hint">Using native/bare-metal by default.</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="framework-selector">
      <div className="section-header">
        <h3>Select Framework</h3>
        <p className="hint">Choose how you want to develop for {board.name}</p>
      </div>

      <div className="framework-grid">
        {frameworkOptions.map((fw) => (
          <button
            key={fw.id}
            className={`framework-card ${selectedFramework === fw.id ? "selected" : ""}`}
            onClick={() => onSelect(fw.id)}
          >
            <span className="framework-icon">{fw.icon}</span>
            <div className="framework-info">
              <span className="framework-name">{fw.name}</span>
              <span className="framework-desc">{fw.description}</span>
            </div>
            {selectedFramework === fw.id && (
              <span className="check-mark">✓</span>
            )}
          </button>
        ))}
      </div>

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .framework-selector {
    padding: 8px 0;
  }

  .section-header {
    margin-bottom: 20px;
  }

  .section-header h3 {
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
  }

  .hint {
    margin: 0;
    font-size: 0.85rem;
    color: #888;
  }

  .framework-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .framework-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .framework-card:hover {
    border-color: #555;
    background: #222;
  }

  .framework-card.selected {
    border-color: #00ff9d;
    background: rgba(0, 255, 157, 0.08);
  }

  .framework-icon {
    font-size: 2rem;
    width: 48px;
    text-align: center;
  }

  .framework-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .framework-name {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
  }

  .framework-desc {
    font-size: 0.85rem;
    color: #888;
  }

  .check-mark {
    font-size: 1.2rem;
    color: #00ff9d;
    font-weight: bold;
  }

  .empty-state,
  .loading-state {
    text-align: center;
    padding: 40px 20px;
    color: #888;
  }

  .empty-state p,
  .loading-state p {
    margin: 0 0 8px 0;
  }
`;
