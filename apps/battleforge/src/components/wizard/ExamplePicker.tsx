"use client";

import { useState, useMemo } from "react";
import type { BoardManifest, BoardExample } from "../../lib/registry/types";

interface ExamplePickerProps {
  board: BoardManifest;
  selectedExample: BoardExample | null;
  onSelect: (example: BoardExample | null) => void;
}

export function ExamplePicker({
  board,
  selectedExample,
  onSelect,
}: ExamplePickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const examples = board.examples || [];

  // Extract unique categories
  const categories = useMemo(() => {
    const catSet = new Set<string>();
    examples.forEach((ex) => {
      if (ex.category) catSet.add(ex.category);
    });
    return Array.from(catSet).sort();
  }, [examples]);

  // Filter by category
  const filteredExamples = useMemo(() => {
    if (!selectedCategory) return examples;
    return examples.filter((ex) => ex.category === selectedCategory);
  }, [examples, selectedCategory]);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner":
        return "#00ff9d";
      case "intermediate":
        return "#ffaa00";
      case "advanced":
        return "#ff4444";
      default:
        return "#888";
    }
  };

  return (
    <div className="example-picker">
      <h3 className="step-title">Choose a Template</h3>
      <p className="step-subtitle">
        Start with an example or create a blank project
      </p>

      {/* Board info summary */}
      <div className="board-summary">
        <div className="board-thumb">
          {board.assets?.thumbnail ? (
            <img src={board.assets.thumbnail} alt={board.name} />
          ) : (
            <div className="board-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                <circle cx="16" cy="8" r="1.5" fill="currentColor" />
              </svg>
            </div>
          )}
        </div>
        <div className="board-details">
          <div className="board-name">{board.name}</div>
          <div className="board-meta">
            {board.chip.architecture} • {board.vendor}
          </div>
        </div>
        {board.documentation?.product && (
          <a
            href={board.documentation.product}
            target="_blank"
            rel="noopener noreferrer"
            className="docs-link"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15,3 21,3 21,9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Docs
          </a>
        )}
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="category-filter">
          <button
            className={`category-btn ${!selectedCategory ? "active" : ""}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Example grid */}
      <div className="example-grid">
        {/* Blank project option */}
        <button
          className={`example-card blank ${selectedExample === null ? "selected" : ""}`}
          onClick={() => onSelect(null)}
        >
          <div className="example-icon blank-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div className="example-name">Blank Project</div>
          <div className="example-desc">Start with an empty main.cpp file</div>
        </button>

        {filteredExamples.map((example) => (
          <button
            key={example.id}
            className={`example-card ${selectedExample?.id === example.id ? "selected" : ""}`}
            onClick={() => onSelect(example)}
          >
            <div className="example-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="example-header">
              <div className="example-name">{example.name}</div>
              {example.difficulty && (
                <span
                  className="difficulty-badge"
                  style={{ color: getDifficultyColor(example.difficulty) }}
                >
                  {example.difficulty}
                </span>
              )}
            </div>
            <div className="example-desc">{example.description}</div>
            {example.libraries && example.libraries.length > 0 && (
              <div className="example-libs">
                {example.libraries.map((lib) => (
                  <span key={lib} className="lib-tag">
                    {lib}
                  </span>
                ))}
              </div>
            )}
            {example.features && example.features.length > 0 && (
              <div className="example-features">
                {example.features.map((feat) => (
                  <span key={feat} className="feature-tag">
                    {feat}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {examples.length === 0 && (
        <div className="no-examples">
          <p>No examples available for this board yet.</p>
          <p className="hint">You can still create a blank project.</p>
        </div>
      )}

      <style jsx>{`
        .example-picker {
          padding: 20px 0;
        }

        .step-title {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
        }

        .step-subtitle {
          margin: 0 0 20px 0;
          font-size: 0.9rem;
          color: #888;
        }

        .board-summary {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #0a0a0a;
          border: 1px solid #222;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .board-thumb {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          background: #1a1a1a;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .board-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .board-icon {
          width: 32px;
          height: 32px;
          color: #444;
        }

        .board-details {
          flex: 1;
        }

        .board-name {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
        }

        .board-meta {
          font-size: 0.8rem;
          color: #666;
          margin-top: 2px;
        }

        .docs-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(0, 136, 255, 0.1);
          border: 1px solid rgba(0, 136, 255, 0.3);
          border-radius: 6px;
          color: #0088ff;
          font-size: 0.8rem;
          text-decoration: none;
          transition: all 0.2s;
        }

        .docs-link:hover {
          background: rgba(0, 136, 255, 0.2);
        }

        .docs-link svg {
          width: 14px;
          height: 14px;
        }

        .category-filter {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .category-btn {
          padding: 6px 14px;
          background: transparent;
          border: 1px solid #333;
          border-radius: 6px;
          color: #888;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-btn:hover {
          border-color: #555;
          color: #fff;
        }

        .category-btn.active {
          background: rgba(0, 255, 157, 0.1);
          border-color: #00ff9d;
          color: #00ff9d;
        }

        .example-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }

        .example-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 20px;
          background: linear-gradient(180deg, #1a1a1a 0%, #111 100%);
          border: 2px solid #2a2a2a;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .example-card:hover {
          border-color: #00ff9d;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 255, 157, 0.15);
        }

        .example-card.selected {
          border-color: #00ff9d;
          background: linear-gradient(
            180deg,
            rgba(0, 255, 157, 0.15) 0%,
            rgba(0, 255, 157, 0.05) 100%
          );
          box-shadow: 0 0 20px rgba(0, 255, 157, 0.2);
        }

        .example-card.blank {
          border-style: dashed;
        }

        .example-icon {
          width: 36px;
          height: 36px;
          color: #00ff9d;
        }

        .blank-icon {
          color: #666;
        }

        .example-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .example-name {
          font-size: 1rem;
          font-weight: 600;
          color: #e0e0e0;
        }

        .example-card.selected .example-name {
          color: #fff;
        }

        .difficulty-badge {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .example-desc {
          font-size: 0.8rem;
          color: #666;
          line-height: 1.4;
        }

        .example-libs,
        .example-features {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .lib-tag {
          font-size: 0.65rem;
          padding: 2px 8px;
          background: rgba(0, 136, 255, 0.1);
          color: #0088ff;
          border-radius: 4px;
        }

        .feature-tag {
          font-size: 0.65rem;
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #888;
          border-radius: 4px;
        }

        .no-examples {
          text-align: center;
          padding: 32px;
          color: #666;
        }

        .no-examples .hint {
          font-size: 0.85rem;
          color: #555;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
