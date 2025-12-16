"use client";

import { useState, useEffect, useCallback } from "react";
import { WasmManager } from "../lib/wasm";
import type { ToolInfo, ToolCategory, DownloadProgress } from "../lib/wasm/types";

interface WasmPackageManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<ToolCategory | "all", string> = {
  all: "All Tools",
  compiler: "Compilers",
  linker: "Linkers",
  disassembler: "Disassemblers",
  emulator: "Emulators",
};

const CATEGORY_ICONS: Record<ToolCategory, string> = {
  compiler: "⚙️",
  linker: "🔗",
  disassembler: "🔍",
  emulator: "📟",
};

export function WasmPackageManager({ isOpen, onClose }: WasmPackageManagerProps) {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingTools, setDownloadingTools] = useState<Set<string>>(new Set());
  const [downloadProgress, setDownloadProgress] = useState<Map<string, DownloadProgress>>(new Map());

  // Load tools when opened
  useEffect(() => {
    if (!isOpen) return;

    const loadTools = async () => {
      try {
        setLoading(true);
        setError(null);
        const allTools = await WasmManager.getAllToolInfos();
        setTools(allTools);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load tools");
      } finally {
        setLoading(false);
      }
    };

    loadTools();
  }, [isOpen]);

  // Filter tools by category and search
  const filteredTools = tools.filter((tool) => {
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate storage usage by category
  const storageByCategory = tools.reduce(
    (acc, tool) => {
      if (tool.installed) {
        acc[tool.category] = (acc[tool.category] || 0) + tool.installed.size;
        acc.total = (acc.total || 0) + tool.installed.size;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const handleInstall = useCallback(async (tool: ToolInfo) => {
    setDownloadingTools((prev) => new Set(prev).add(tool.id));

    try {
      const progressHandler = (progress: DownloadProgress) => {
        setDownloadProgress((prev) => new Map(prev).set(tool.id, progress));
      };

      // Route to appropriate install method based on category
      switch (tool.category) {
        case "compiler":
          await WasmManager.ensureCompiler(
            tool.id as "clang-arm" | "clang-riscv" | "clang-xtensa",
            progressHandler
          );
          break;
        case "disassembler":
          await WasmManager.ensureDisassembler(tool.id, progressHandler);
          break;
        case "emulator":
          await WasmManager.ensureEmulator(tool.id, progressHandler);
          break;
        case "linker":
          // Linkers are bundled with compilers, no separate install needed
          alert("Linkers are installed automatically with compilers.");
          return;
        default:
          alert(`Unknown tool category: ${tool.category}`);
          return;
      }

      // Refresh tools list
      const allTools = await WasmManager.getAllToolInfos();
      setTools(allTools);
    } catch (e) {
      console.error("Install failed:", e);
      alert(`Install failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setDownloadingTools((prev) => {
        const next = new Set(prev);
        next.delete(tool.id);
        return next;
      });
      setDownloadProgress((prev) => {
        const next = new Map(prev);
        next.delete(tool.id);
        return next;
      });
    }
  }, []);

  const handleUninstall = useCallback(async (tool: ToolInfo) => {
    if (tool.category === "linker") {
      alert("Linkers cannot be uninstalled separately from compilers.");
      return;
    }

    if (!confirm(`Remove ${tool.name}?`)) return;

    try {
      if (tool.category === "compiler") {
        await WasmManager.removeCompiler(tool.id as "clang-arm" | "clang-riscv" | "clang-xtensa");
      } else {
        await WasmManager.removeTool(tool.id);
      }
      const allTools = await WasmManager.getAllToolInfos();
      setTools(allTools);
    } catch (e) {
      console.error("Uninstall failed:", e);
      alert(`Uninstall failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--bg-primary, #1e1e1e)",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "900px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          border: "1px solid var(--border-color, #333)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-color, #333)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--text-primary, #d4d4d4)",
              }}
            >
              WASM Tools
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "12px",
                color: "var(--text-secondary, #888)",
              }}
            >
              Manage compilers, disassemblers, and emulators
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              color: "var(--text-secondary, #888)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Search and Categories */}
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid var(--border-color, #333)",
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "8px 12px",
              backgroundColor: "var(--bg-secondary, #252526)",
              border: "1px solid var(--border-color, #444)",
              borderRadius: "4px",
              color: "var(--text-primary, #d4d4d4)",
              fontSize: "13px",
              width: "200px",
            }}
          />

          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "4px" }}>
            {(Object.keys(CATEGORY_LABELS) as Array<ToolCategory | "all">).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 12px",
                  backgroundColor:
                    selectedCategory === cat
                      ? "var(--accent-color, #0ea5e9)"
                      : "var(--bg-secondary, #252526)",
                  border: "none",
                  borderRadius: "4px",
                  color:
                    selectedCategory === cat ? "white" : "var(--text-primary, #d4d4d4)",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Storage Summary */}
        {storageByCategory.total > 0 && (
          <div
            style={{
              padding: "12px 20px",
              backgroundColor: "var(--bg-secondary, #252526)",
              borderBottom: "1px solid var(--border-color, #333)",
              display: "flex",
              gap: "16px",
              fontSize: "12px",
              color: "var(--text-secondary, #888)",
            }}
          >
            <span>
              <strong>Total:</strong> {formatBytes(storageByCategory.total)}
            </span>
            {Object.entries(storageByCategory)
              .filter(([key]) => key !== "total")
              .map(([cat, size]) => (
                <span key={cat}>
                  {CATEGORY_LABELS[cat as ToolCategory]}: {formatBytes(size)}
                </span>
              ))}
          </div>
        )}

        {/* Tools Grid */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "16px 20px",
          }}
        >
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-secondary, #888)",
              }}
            >
              Loading tools...
            </div>
          ) : error ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--error-text, #fca5a5)",
              }}
            >
              {error}
            </div>
          ) : filteredTools.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-secondary, #888)",
              }}
            >
              No tools found
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "12px",
              }}
            >
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isDownloading={downloadingTools.has(tool.id)}
                  progress={downloadProgress.get(tool.id)}
                  onInstall={() => handleInstall(tool)}
                  onUninstall={() => handleUninstall(tool)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Tool Card Component
interface ToolCardProps {
  tool: ToolInfo;
  isDownloading: boolean;
  progress?: DownloadProgress;
  onInstall: () => void;
  onUninstall: () => void;
}

function ToolCard({ tool, isDownloading, progress, onInstall, onUninstall }: ToolCardProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const stateColors: Record<ToolInfo["state"], string> = {
    installed: "#22c55e",
    update_available: "#f59e0b",
    downloading: "#0ea5e9",
    not_installed: "#888",
    error: "#ef4444",
  };

  const stateLabels: Record<ToolInfo["state"], string> = {
    installed: "Installed",
    update_available: "Update Available",
    downloading: "Downloading",
    not_installed: "Not Installed",
    error: "Error",
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-secondary, #252526)",
        borderRadius: "6px",
        padding: "14px",
        border: "1px solid var(--border-color, #333)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>{CATEGORY_ICONS[tool.category]}</span>
          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: "14px",
                color: "var(--text-primary, #d4d4d4)",
              }}
            >
              {tool.name}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-secondary, #888)",
              }}
            >
              v{tool.available?.fullVersion || "unknown"}
            </div>
          </div>
        </div>
        <span
          style={{
            padding: "2px 8px",
            backgroundColor: `${stateColors[tool.state]}22`,
            color: stateColors[tool.state],
            borderRadius: "10px",
            fontSize: "10px",
            fontWeight: 500,
          }}
        >
          {stateLabels[tool.state]}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          margin: "0 0 10px",
          fontSize: "12px",
          color: "var(--text-secondary, #888)",
          lineHeight: 1.4,
        }}
      >
        {tool.description || `${tool.category} for embedded development`}
      </p>

      {/* Meta Info */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          fontSize: "11px",
          color: "var(--text-secondary, #888)",
          marginBottom: "10px",
        }}
      >
        <span>Size: {formatBytes(tool.available?.sizeCompressed || tool.available?.size || 0)}</span>
        {tool.available?.architectures && tool.available.architectures.length > 0 && (
          <span>Archs: {tool.available.architectures.slice(0, 3).join(", ")}</span>
        )}
      </div>

      {/* Progress Bar */}
      {isDownloading && progress && (
        <div style={{ marginBottom: "10px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "10px",
              marginBottom: "4px",
              color: "var(--text-secondary, #888)",
            }}
          >
            <span>{progress.message}</span>
            <span>{progress.percentage}%</span>
          </div>
          <div
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "var(--progress-bg, #333)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress.percentage}%`,
                height: "100%",
                backgroundColor: "var(--accent-color, #0ea5e9)",
                transition: "width 0.2s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        {tool.state === "installed" || tool.state === "update_available" ? (
          <>
            {tool.state === "update_available" && (
              <button
                onClick={onInstall}
                disabled={isDownloading}
                style={{
                  flex: 1,
                  padding: "6px 12px",
                  backgroundColor: "var(--accent-color, #0ea5e9)",
                  border: "none",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "12px",
                  cursor: isDownloading ? "wait" : "pointer",
                  opacity: isDownloading ? 0.7 : 1,
                }}
              >
                Update
              </button>
            )}
            <button
              onClick={onUninstall}
              disabled={isDownloading}
              style={{
                flex: tool.state === "installed" ? 1 : undefined,
                padding: "6px 12px",
                backgroundColor: "transparent",
                border: "1px solid var(--border-color, #444)",
                borderRadius: "4px",
                color: "var(--text-secondary, #888)",
                fontSize: "12px",
                cursor: isDownloading ? "not-allowed" : "pointer",
              }}
            >
              Remove
            </button>
          </>
        ) : (
          <button
            onClick={onInstall}
            disabled={isDownloading || tool.state === "downloading"}
            style={{
              flex: 1,
              padding: "6px 12px",
              backgroundColor: "var(--accent-color, #0ea5e9)",
              border: "none",
              borderRadius: "4px",
              color: "white",
              fontSize: "12px",
              cursor: isDownloading ? "wait" : "pointer",
              opacity: isDownloading ? 0.7 : 1,
            }}
          >
            {isDownloading ? "Installing..." : "Install"}
          </button>
        )}
      </div>
    </div>
  );
}
