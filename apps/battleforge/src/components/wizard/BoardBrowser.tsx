"use client";

import { useState, useMemo } from "react";
import type { BoardIndexEntry } from "../../lib/registry/types";
import { withBasePath } from "@battlewithbytes/utils";

interface BoardBrowserProps {
  boards: BoardIndexEntry[];
  onSelect: (board: BoardIndexEntry) => void;
}

export function BoardBrowser({ boards, onSelect }: BoardBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // Extract unique vendors and features
  const vendors = useMemo(() => {
    const vendorSet = new Set(boards.map((b) => b.vendor));
    return Array.from(vendorSet).sort();
  }, [boards]);

  const features = useMemo(() => {
    const featureSet = new Set<string>();
    boards.forEach((b) => b.features?.forEach((f) => featureSet.add(f)));
    return Array.from(featureSet).sort();
  }, [boards]);

  // Filter boards
  const filteredBoards = useMemo(() => {
    return boards.filter((board) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = board.name.toLowerCase().includes(query);
        const matchesVendor = board.vendor.toLowerCase().includes(query);
        const matchesTags = board.tags?.some((t) =>
          t.toLowerCase().includes(query),
        );
        if (!matchesName && !matchesVendor && !matchesTags) return false;
      }

      // Vendor filter
      if (selectedVendor && board.vendor !== selectedVendor) return false;

      // Feature filter
      if (selectedFeature && !board.features?.includes(selectedFeature))
        return false;

      return true;
    });
  }, [boards, searchQuery, selectedVendor, selectedFeature]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedVendor(null);
    setSelectedFeature(null);
  };

  const hasActiveFilters = searchQuery || selectedVendor || selectedFeature;

  return (
    <div className="board-browser">
      <h3 className="step-title">Select Your Board</h3>
      <p className="step-subtitle">
        Choose the specific development board you&apos;re using
      </p>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search boards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={selectedVendor || ""}
          onChange={(e) => setSelectedVendor(e.target.value || null)}
          className="filter-select"
        >
          <option value="">All Vendors</option>
          {vendors.map((vendor) => (
            <option key={vendor} value={vendor}>
              {vendor.charAt(0).toUpperCase() + vendor.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={selectedFeature || ""}
          onChange={(e) => setSelectedFeature(e.target.value || null)}
          className="filter-select"
        >
          <option value="">All Features</option>
          {features.map((feature) => (
            <option key={feature} value={feature}>
              {feature}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button className="clear-filters" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="results-count">
        {filteredBoards.length} board{filteredBoards.length !== 1 ? "s" : ""}{" "}
        found
      </div>

      {/* Board Grid */}
      <div className="board-grid">
        {filteredBoards.length === 0 ? (
          <div className="no-results">
            <p>No boards match your filters</p>
            {hasActiveFilters && (
              <button onClick={clearFilters}>Clear all filters</button>
            )}
          </div>
        ) : (
          filteredBoards.map((board) => (
            <button
              key={board.id}
              className="board-card"
              onClick={() => onSelect(board)}
            >
              <div className="board-thumbnail">
                {board.thumbnail ? (
                  <img
                    src={board.thumbnail.startsWith('/') ? withBasePath(board.thumbnail) : board.thumbnail}
                    alt={board.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="placeholder-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                      <circle cx="16" cy="8" r="1.5" fill="currentColor" />
                      <circle cx="8" cy="16" r="1.5" fill="currentColor" />
                      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
                      <rect x="10" y="10" width="4" height="4" rx="0.5" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="board-info">
                <div className="board-name">{board.name}</div>
                <div className="board-vendor">{board.vendor}</div>
                {board.features && board.features.length > 0 && (
                  <div className="board-features">
                    {board.features.slice(0, 3).map((feature) => (
                      <span key={feature} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                    {board.features.length > 3 && (
                      <span className="feature-more">
                        +{board.features.length - 3}
                      </span>
                    )}
                  </div>
                )}
                {board.exampleCount !== undefined && board.exampleCount > 0 && (
                  <div className="board-examples">
                    {board.exampleCount} example
                    {board.exampleCount !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <style jsx>{`
        .board-browser {
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

        .filter-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 200px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #666;
        }

        .search-input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 0.9rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #00ff9d;
        }

        .filter-select {
          padding: 10px 12px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 0.9rem;
          cursor: pointer;
          min-width: 140px;
        }

        .filter-select:focus {
          outline: none;
          border-color: #00ff9d;
        }

        .clear-filters {
          padding: 10px 16px;
          background: transparent;
          border: 1px solid #555;
          border-radius: 8px;
          color: #888;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters:hover {
          border-color: #888;
          color: #fff;
        }

        .results-count {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 16px;
        }

        .board-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 48px 24px;
          color: #666;
        }

        .no-results button {
          margin-top: 12px;
          padding: 8px 16px;
          background: transparent;
          border: 1px solid #444;
          border-radius: 6px;
          color: #888;
          cursor: pointer;
        }

        .board-card {
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #1a1a1a 0%, #111 100%);
          border: 2px solid #2a2a2a;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .board-card:hover {
          border-color: #00ff9d;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 255, 157, 0.15);
        }

        .board-thumbnail {
          height: 140px;
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .board-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 12px;
        }

        .placeholder-icon {
          width: 64px;
          height: 64px;
          color: #333;
        }

        .board-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .board-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #e0e0e0;
          line-height: 1.3;
        }

        .board-vendor {
          font-size: 0.8rem;
          color: #666;
          text-transform: capitalize;
        }

        .board-features {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .feature-tag {
          font-size: 0.65rem;
          padding: 3px 8px;
          background: rgba(0, 255, 157, 0.1);
          color: #00ff9d;
          border-radius: 4px;
        }

        .feature-more {
          font-size: 0.65rem;
          padding: 3px 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #666;
          border-radius: 4px;
        }

        .board-examples {
          font-size: 0.75rem;
          color: #0088ff;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
