"use client";

import { useState, useCallback, useEffect } from "react";
import { useLibraryManager } from "../lib/hooks/useLibraryManager";
import type {
  LibraryRegistryEntry,
  PlatformId,
  Architecture,
} from "../lib/library";

interface LibraryPanelProps {
  platformId?: PlatformId;
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

  // Load registry libraries on mount and when platform changes
  useEffect(() => {
    loadRegistryLibraries(platformId);
  }, [platformId, loadRegistryLibraries]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      loadRegistryLibraries(platformId);
    } else {
      await searchRegistryLibraries(searchQuery);
    }
  }, [searchQuery, platformId, loadRegistryLibraries, searchRegistryLibraries]);

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
          {/* Search Input */}
          <div style={{ padding: "8px", display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search libraries..."
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
              disabled={isLoadingRegistry}
              style={{
                padding: "6px 12px",
                backgroundColor: "var(--button-bg, #0ea5e9)",
                border: "none",
                borderRadius: "4px",
                color: "white",
                cursor: isLoadingRegistry ? "wait" : "pointer",
                opacity: isLoadingRegistry ? 0.5 : 1,
              }}
            >
              {isLoadingRegistry ? "Loading..." : "Search"}
            </button>
          </div>

          {/* Platform Info */}
          {platformId && (
            <div
              style={{
                padding: "4px 8px",
                fontSize: "11px",
                color: "var(--text-secondary, #888)",
                borderBottom: "1px solid var(--border-color, #333)",
              }}
            >
              Showing libraries compatible with <strong>{platformId}</strong>
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
