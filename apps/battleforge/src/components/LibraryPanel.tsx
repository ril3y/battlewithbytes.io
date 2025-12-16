"use client";

import { useState, useCallback, useEffect } from "react";
import { useLibraryManager } from "../lib/hooks/useLibraryManager";
import {
  searchPlatformIO,
  type PlatformIOLibrary,
} from "../lib/library/adapters/PlatformIOAdapter";
import type {
  LibraryRegistryEntry,
  PlatformId,
  FrameworkId,
  Architecture,
} from "../lib/library";

type LibrarySource = "curated" | "platformio";

interface LibraryPanelProps {
  platformId?: PlatformId;
  frameworkId?: FrameworkId;
  architecture?: Architecture;
  onLog?: (
    message: string,
    type?: "info" | "success" | "error" | "warning",
  ) => void;
  onLibraryFilesChanged?: (files: Map<string, Uint8Array>) => void;
  onLibraryUninstalled?: (name: string) => void;
}

export function LibraryPanel({
  platformId,
  frameworkId,
  architecture,
  onLog,
  onLibraryFilesChanged,
  onLibraryUninstalled,
}: LibraryPanelProps) {
  const {
    registryLibraries,
    getAllLibraryFiles,
    installedLibraries,
    isLoadingRegistry,
    isInstalling,
    error,
    progress,
    loadRegistryLibraries,
    searchRegistryLibraries,
    installFromRegistry,
    uninstallLibrary,
  } = useLibraryManager();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "installed">("browse");
  const [librarySource, setLibrarySource] = useState<LibrarySource>("curated");
  const [platformIOLibraries, setPlatformIOLibraries] = useState<PlatformIOLibrary[]>([]);
  const [isSearchingPlatformIO, setIsSearchingPlatformIO] = useState(false);

  // Load registry libraries on mount and when platform/framework changes
  useEffect(() => {
    loadRegistryLibraries(platformId, frameworkId);
  }, [platformId, frameworkId, loadRegistryLibraries]);

  const handleSearch = useCallback(async () => {
    if (librarySource === "curated") {
      if (!searchQuery.trim()) {
        loadRegistryLibraries(platformId, frameworkId);
      } else {
        await searchRegistryLibraries(searchQuery);
      }
    } else {
      // PlatformIO search
      if (!searchQuery.trim()) {
        setPlatformIOLibraries([]);
        return;
      }
      setIsSearchingPlatformIO(true);
      try {
        const results = await searchPlatformIO({
          query: searchQuery,
          platformId,
          frameworkId,
          limit: 25,
          sortBy: "relevance",
        });
        setPlatformIOLibraries(results);
      } catch (err) {
        console.error("[LibraryPanel] PlatformIO search error:", err);
        setPlatformIOLibraries([]);
      } finally {
        setIsSearchingPlatformIO(false);
      }
    }
  }, [searchQuery, platformId, frameworkId, librarySource, loadRegistryLibraries, searchRegistryLibraries]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch],
  );

  const handleInstall = useCallback(
    async (lib: LibraryRegistryEntry) => {
      if (!architecture) {
        onLog?.("Please select a platform first", "warning");
        return;
      }

      onLog?.(`Installing ${lib.name}...`, "info");
      const result = await installFromRegistry(lib.id, architecture);
      if (result) {
        onLog?.(`${lib.name}@${lib.version} installed successfully`, "success");
        // Notify parent to add library files to VFS
        if (onLibraryFilesChanged) {
          const allFiles = await getAllLibraryFiles();
          onLibraryFilesChanged(allFiles);
        }
      } else {
        onLog?.(`Failed to install ${lib.name}`, "error");
      }
    },
    [
      installFromRegistry,
      architecture,
      onLog,
      onLibraryFilesChanged,
      getAllLibraryFiles,
    ],
  );

  const handleUninstall = useCallback(
    async (name: string) => {
      onLog?.(`Uninstalling ${name}...`, "info");
      await uninstallLibrary(name);
      // Notify parent to remove library files from VFS
      onLibraryUninstalled?.(name);
      onLog?.(`${name} uninstalled`, "success");
    },
    [uninstallLibrary, onLog, onLibraryUninstalled],
  );

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Check if a library is installed
  const isLibraryInstalled = useCallback(
    (libId: string) => {
      return installedLibraries.some(
        (i) =>
          i.name.toLowerCase() === libId.toLowerCase() ||
          i.name.toLowerCase() === libId.replace(/-/g, "").toLowerCase(),
      );
    },
    [installedLibraries],
  );

  return (
    <div
      className="library-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "var(--bg-secondary, #1e1e1e)",
        color: "var(--text-primary, #d4d4d4)",
        fontSize: "13px",
      }}
    >
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border-color, #333)",
          padding: "0 8px",
        }}
      >
        <button
          onClick={() => setActiveTab("browse")}
          style={{
            padding: "8px 16px",
            background: "none",
            border: "none",
            color:
              activeTab === "browse"
                ? "var(--accent-color, #0ea5e9)"
                : "inherit",
            borderBottom:
              activeTab === "browse"
                ? "2px solid var(--accent-color, #0ea5e9)"
                : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Browse Libraries
        </button>
        <button
          onClick={() => setActiveTab("installed")}
          style={{
            padding: "8px 16px",
            background: "none",
            border: "none",
            color:
              activeTab === "installed"
                ? "var(--accent-color, #0ea5e9)"
                : "inherit",
            borderBottom:
              activeTab === "installed"
                ? "2px solid var(--accent-color, #0ea5e9)"
                : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Installed ({installedLibraries.length})
        </button>
      </div>

      {/* Browse Tab */}
      {activeTab === "browse" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Source Toggle */}
          <div
            style={{
              display: "flex",
              padding: "8px",
              gap: "4px",
              borderBottom: "1px solid var(--border-color, #333)",
            }}
          >
            <button
              onClick={() => setLibrarySource("curated")}
              style={{
                flex: 1,
                padding: "6px 12px",
                backgroundColor:
                  librarySource === "curated" ? "#0369a1" : "transparent",
                border:
                  librarySource === "curated"
                    ? "1px solid #0ea5e9"
                    : "1px solid var(--border-color, #444)",
                borderRadius: "4px",
                color: librarySource === "curated" ? "white" : "inherit",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              BattleForge Curated
            </button>
            <button
              onClick={() => setLibrarySource("platformio")}
              style={{
                flex: 1,
                padding: "6px 12px",
                backgroundColor:
                  librarySource === "platformio" ? "#7c3aed" : "transparent",
                border:
                  librarySource === "platformio"
                    ? "1px solid #a78bfa"
                    : "1px solid var(--border-color, #444)",
                borderRadius: "4px",
                color: librarySource === "platformio" ? "white" : "inherit",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              PlatformIO Community
            </button>
          </div>

          {/* Search Input */}
          <div style={{ padding: "8px", display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                librarySource === "curated"
                  ? "Search curated libraries..."
                  : "Search PlatformIO (14k+ libraries)..."
              }
              style={{
                flex: 1,
                padding: "6px 10px",
                backgroundColor: "var(--input-bg, #2d2d2d)",
                border: "1px solid var(--border-color, #444)",
                borderRadius: "4px",
                color: "inherit",
                fontSize: "13px",
              }}
            />
            <button
              onClick={handleSearch}
              disabled={isLoadingRegistry || isSearchingPlatformIO}
              style={{
                padding: "6px 12px",
                backgroundColor:
                  librarySource === "platformio" ? "#7c3aed" : "var(--button-bg, #0ea5e9)",
                border: "none",
                borderRadius: "4px",
                color: "white",
                cursor: isLoadingRegistry || isSearchingPlatformIO ? "wait" : "pointer",
                opacity: isLoadingRegistry || isSearchingPlatformIO ? 0.5 : 1,
              }}
            >
              {isLoadingRegistry || isSearchingPlatformIO ? "Loading..." : "Search"}
            </button>
          </div>

          {/* Platform/Framework Info */}
          {(platformId || frameworkId) && (
            <div
              style={{
                padding: "4px 8px",
                fontSize: "11px",
                color: "var(--text-secondary, #888)",
                borderBottom: "1px solid var(--border-color, #333)",
              }}
            >
              Showing libraries compatible with{" "}
              {platformId && <strong>{platformId}</strong>}
              {platformId && frameworkId && " + "}
              {frameworkId && (
                <strong style={{ color: "#10b981" }}>{frameworkId}</strong>
              )}
              {architecture && <> ({architecture})</>}
            </div>
          )}

          {/* Progress / Error */}
          {progress && (
            <div
              style={{
                padding: "4px 8px",
                color: "var(--text-secondary, #888)",
                fontSize: "12px",
              }}
            >
              {progress}
            </div>
          )}
          {error && (
            <div
              style={{
                padding: "4px 8px",
                color: "var(--error-color, #f87171)",
                fontSize: "12px",
              }}
            >
              {error}
            </div>
          )}

          {/* Results */}
          <div style={{ flex: 1, overflow: "auto", padding: "8px" }}>
            {/* Curated Libraries */}
            {librarySource === "curated" && (
              <>
                {registryLibraries.length === 0 && !isLoadingRegistry && (
                  <div
                    style={{
                      color: "var(--text-secondary, #888)",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    {searchQuery ? "No libraries found" : "No libraries available"}
                  </div>
                )}
                {registryLibraries.map((lib) => (
                  <RegistryLibraryCard
                    key={lib.id}
                    library={lib}
                    isInstalled={isLibraryInstalled(lib.id)}
                    onInstall={() => handleInstall(lib)}
                    isInstalling={isInstalling}
                    hasArchitecture={!!architecture}
                  />
                ))}
              </>
            )}

            {/* PlatformIO Libraries */}
            {librarySource === "platformio" && (
              <>
                {platformIOLibraries.length === 0 && !isSearchingPlatformIO && (
                  <div
                    style={{
                      color: "var(--text-secondary, #888)",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    {searchQuery
                      ? "No libraries found. Try different keywords."
                      : "Enter a search term to find libraries on PlatformIO."}
                  </div>
                )}
                {platformIOLibraries.map((lib) => (
                  <PlatformIOLibraryCard
                    key={lib.id}
                    library={lib}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Installed Tab */}
      {activeTab === "installed" && (
        <div style={{ flex: 1, overflow: "auto", padding: "8px" }}>
          {installedLibraries.length === 0 && (
            <div
              style={{
                color: "var(--text-secondary, #888)",
                textAlign: "center",
                padding: "20px",
              }}
            >
              No libraries installed yet
            </div>
          )}
          {installedLibraries.map((lib) => (
            <div
              key={`${lib.name}@${lib.version}`}
              style={{
                padding: "12px",
                marginBottom: "8px",
                backgroundColor: "var(--card-bg, #252526)",
                borderRadius: "4px",
                border: "1px solid var(--border-color, #333)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold" }}>{lib.name}</div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary, #888)",
                    }}
                  >
                    v{lib.version} - {formatSize(lib.size)}
                  </div>
                </div>
                <button
                  onClick={() => handleUninstall(lib.name)}
                  style={{
                    padding: "4px 8px",
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Library card for our curated registry
function RegistryLibraryCard({
  library,
  isInstalled,
  onInstall,
  isInstalling,
  hasArchitecture,
}: {
  library: LibraryRegistryEntry;
  isInstalled: boolean;
  onInstall: () => void;
  isInstalling: boolean;
  hasArchitecture: boolean;
}) {
  return (
    <div
      style={{
        padding: "12px",
        marginBottom: "8px",
        backgroundColor: "var(--card-bg, #252526)",
        borderRadius: "4px",
        border: "1px solid var(--border-color, #333)",
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
          <div style={{ fontWeight: "bold" }}>{library.name}</div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary, #888)",
              margin: "4px 0",
            }}
          >
            v{library.version}
          </div>
          <div
            style={{ fontSize: "12px", lineHeight: "1.4", marginTop: "4px" }}
          >
            {library.description}
          </div>
          {/* Tags */}
          {library.tags && library.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                marginTop: "8px",
              }}
            >
              {library.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "2px 6px",
                    backgroundColor: "var(--tag-bg, #333)",
                    borderRadius: "3px",
                    fontSize: "10px",
                    color: "var(--text-secondary, #888)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {/* Platform badges */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              marginTop: "6px",
            }}
          >
            {library.platforms.map((platform) => (
              <span
                key={platform}
                style={{
                  padding: "2px 6px",
                  backgroundColor: "var(--platform-bg, #1e3a5f)",
                  borderRadius: "3px",
                  fontSize: "10px",
                  color: "var(--accent-color, #0ea5e9)",
                }}
              >
                {platform}
              </span>
            ))}
          </div>
          {/* Framework badges */}
          {library.frameworks && library.frameworks.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                marginTop: "4px",
              }}
            >
              {library.frameworks.map((framework) => (
                <span
                  key={framework}
                  style={{
                    padding: "2px 6px",
                    backgroundColor: "#064e3b",
                    borderRadius: "3px",
                    fontSize: "10px",
                    color: "#10b981",
                  }}
                >
                  {framework}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onInstall}
          disabled={isInstalled || isInstalling || !hasArchitecture}
          title={!hasArchitecture ? "Select a platform first" : undefined}
          style={{
            padding: "6px 12px",
            backgroundColor: isInstalled
              ? "var(--success-bg, #166534)"
              : !hasArchitecture
                ? "var(--disabled-bg, #444)"
                : "var(--button-bg, #0ea5e9)",
            border: "none",
            borderRadius: "4px",
            color: "white",
            fontSize: "12px",
            cursor:
              isInstalled || !hasArchitecture
                ? "default"
                : isInstalling
                  ? "wait"
                  : "pointer",
            opacity: isInstalling || !hasArchitecture ? 0.5 : 1,
            marginLeft: "12px",
            flexShrink: 0,
          }}
        >
          {isInstalled
            ? "Installed"
            : isInstalling
              ? "Installing..."
              : "Install"}
        </button>
      </div>
    </div>
  );
}

// Library card for PlatformIO community libraries (read-only/info display)
function PlatformIOLibraryCard({ library }: { library: PlatformIOLibrary }) {
  const formatDownloads = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div
      style={{
        padding: "12px",
        marginBottom: "8px",
        backgroundColor: "var(--card-bg, #252526)",
        borderRadius: "4px",
        border: "1px solid #5b21b6",
        borderLeft: "3px solid #7c3aed",
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
            <span style={{ fontWeight: "bold" }}>{library.name}</span>
            <span
              style={{
                fontSize: "10px",
                padding: "1px 4px",
                backgroundColor: "#5b21b6",
                color: "#c4b5fd",
                borderRadius: "2px",
              }}
            >
              PlatformIO
            </span>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary, #888)",
              margin: "4px 0",
              display: "flex",
              gap: "12px",
            }}
          >
            <span>v{library.version}</span>
            <span>by {library.author}</span>
            <span title="Monthly downloads">
              {formatDownloads(library.downloads)} downloads
            </span>
          </div>
          <div
            style={{ fontSize: "12px", lineHeight: "1.4", marginTop: "4px" }}
          >
            {library.description}
          </div>
          {/* Keywords */}
          {library.keywords.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                marginTop: "8px",
              }}
            >
              {library.keywords.slice(0, 4).map((keyword) => (
                <span
                  key={keyword}
                  style={{
                    padding: "2px 6px",
                    backgroundColor: "var(--tag-bg, #333)",
                    borderRadius: "3px",
                    fontSize: "10px",
                    color: "var(--text-secondary, #888)",
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
          {/* Platform badges */}
          {library.platforms.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                marginTop: "6px",
              }}
            >
              {library.platforms.map((platform) => (
                <span
                  key={platform}
                  style={{
                    padding: "2px 6px",
                    backgroundColor: "var(--platform-bg, #1e3a5f)",
                    borderRadius: "3px",
                    fontSize: "10px",
                    color: "var(--accent-color, #0ea5e9)",
                  }}
                >
                  {platform}
                </span>
              ))}
            </div>
          )}
          {/* Framework badges */}
          {library.frameworks.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                marginTop: "4px",
              }}
            >
              {library.frameworks.map((framework) => (
                <span
                  key={framework}
                  style={{
                    padding: "2px 6px",
                    backgroundColor: "#064e3b",
                    borderRadius: "3px",
                    fontSize: "10px",
                    color: "#10b981",
                  }}
                >
                  {framework}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Info button linking to PlatformIO */}
        {library.homepage && (
          <a
            href={library.homepage}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "6px 12px",
              backgroundColor: "#5b21b6",
              border: "none",
              borderRadius: "4px",
              color: "white",
              fontSize: "12px",
              textDecoration: "none",
              marginLeft: "12px",
              flexShrink: 0,
            }}
          >
            View
          </a>
        )}
      </div>
    </div>
  );
}
