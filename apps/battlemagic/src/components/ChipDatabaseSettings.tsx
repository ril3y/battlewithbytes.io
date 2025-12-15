"use client";

import React, { useState, useEffect } from "react";
import {
  getChipDatabase,
  type ChipDefinition,
} from "../lib/chips/ChipDatabase";

interface ChipDatabaseSettingsProps {
  onClose?: () => void;
}

export function ChipDatabaseSettings({ onClose }: ChipDatabaseSettingsProps) {
  const [chips, setChips] = useState<ChipDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  const [editingChip, setEditingChip] = useState<ChipDefinition | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importExportMode, setImportExportMode] = useState<
    "none" | "import" | "export"
  >("none");
  const [importJson, setImportJson] = useState("");
  const [exportJson, setExportJson] = useState("");
  const [selectedChip, setSelectedChip] = useState<ChipDefinition | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    chip: ChipDefinition;
  } | null>(null);

  useEffect(() => {
    loadChips();
  }, []);

  const loadChips = async () => {
    setLoading(true);
    try {
      const chipDb = getChipDatabase();
      await chipDb.ready();
      const allChips = chipDb.getAllChips();
      setChips(allChips);
    } catch (error) {
      console.error("[ChipDatabaseSettings] Failed to load chips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (family: string) => {
    if (!confirm(`Delete custom chip "${family}"?`)) return;

    try {
      const chipDb = getChipDatabase();
      await chipDb.deleteCustomChip(family);
      await loadChips();
    } catch (error) {
      alert(
        `Failed to delete chip: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleExport = async () => {
    try {
      const chipDb = getChipDatabase();
      const json = await chipDb.exportCustomChips();
      setExportJson(json);
      setImportExportMode("export");
    } catch (error) {
      alert(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleImport = async () => {
    try {
      const chipDb = getChipDatabase();
      const count = await chipDb.importCustomChips(importJson);
      alert(`Successfully imported ${count} chip(s)`);
      setImportJson("");
      setImportExportMode("none");
      await loadChips();
    } catch (error) {
      alert(
        `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleClone = async (chip: ChipDefinition) => {
    const newFamily = prompt(
      `Enter name for cloned chip (original: ${chip.family}):`,
    );
    if (!newFamily?.trim()) return;

    const clonedChip: ChipDefinition = {
      ...chip,
      family: newFamily.trim(),
      isCustom: undefined, // Will be set by addCustomChip
    };

    setEditingChip(clonedChip);
    setContextMenu(null);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [contextMenu]);

  const filteredChips = chips.filter((chip) => {
    if (showCustomOnly && !chip.isCustom) return false;
    if (!filter) return true;
    const searchTerm = filter.toLowerCase();
    return (
      chip.family.toLowerCase().includes(searchTerm) ||
      chip.manufacturer.toLowerCase().includes(searchTerm) ||
      chip.architecture.toLowerCase().includes(searchTerm) ||
      chip.description.toLowerCase().includes(searchTerm)
    );
  });

  const customCount = chips.filter((c) => c.isCustom).length;
  const builtInCount = chips.length - customCount;

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h2 className="text-xl font-bold">Chip Database Settings</h2>
          <p className="text-sm text-gray-400">
            {builtInCount} built-in, {customCount} custom
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
          >
            Add Custom Chip
          </button>
          <button
            onClick={() => setImportExportMode("import")}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
          >
            Import
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium transition-colors"
          >
            Export
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 p-4 border-b border-gray-700">
        <input
          type="text"
          placeholder="Search chips..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showCustomOnly}
            onChange={(e) => setShowCustomOnly(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Custom only</span>
        </label>
      </div>

      {/* Chip Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading chips...</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Family</th>
                <th className="px-4 py-2 text-left font-medium">
                  Manufacturer
                </th>
                <th className="px-4 py-2 text-left font-medium">
                  Architecture
                </th>
                <th className="px-4 py-2 text-left font-medium">Flash Base</th>
                <th className="px-4 py-2 text-left font-medium">RAM Base</th>
                <th className="px-4 py-2 text-left font-medium">Type</th>
                <th className="px-4 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChips.map((chip) => (
                <tr
                  key={chip.family}
                  onClick={() => setSelectedChip(chip)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, chip });
                  }}
                  className={`border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${
                    selectedChip?.family === chip.family
                      ? "bg-blue-600/10 border-blue-600/30"
                      : ""
                  }`}
                >
                  <td className="px-4 py-2 font-mono">{chip.family}</td>
                  <td className="px-4 py-2">{chip.manufacturer}</td>
                  <td className="px-4 py-2">{chip.architecture}</td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {chip.flashBase}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {chip.ramBase}
                  </td>
                  <td className="px-4 py-2">
                    {chip.isCustom ? (
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                        Custom
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                        Built-in
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {chip.isCustom ? (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChip(chip);
                          }}
                          className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(chip.family);
                          }}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">Read-only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingChip) && (
        <ChipEditorModal
          chip={editingChip}
          onClose={() => {
            setShowAddModal(false);
            setEditingChip(null);
          }}
          onSave={async () => {
            setShowAddModal(false);
            setEditingChip(null);
            await loadChips();
          }}
        />
      )}

      {/* Import/Export Modal */}
      {importExportMode !== "none" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-bold mb-4">
              {importExportMode === "import"
                ? "Import Custom Chips"
                : "Export Custom Chips"}
            </h3>
            <textarea
              value={importExportMode === "import" ? importJson : exportJson}
              onChange={(e) =>
                importExportMode === "import" && setImportJson(e.target.value)
              }
              readOnly={importExportMode === "export"}
              placeholder={
                importExportMode === "import" ? "Paste JSON here..." : ""
              }
              className="w-full h-64 px-3 py-2 bg-gray-900 border border-gray-600 rounded font-mono text-xs resize-none focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2 mt-4">
              {importExportMode === "import" ? (
                <button
                  onClick={handleImport}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
                >
                  Import
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(exportJson);
                    alert("Copied to clipboard!");
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                >
                  Copy to Clipboard
                </button>
              )}
              <button
                onClick={() => {
                  setImportExportMode("none");
                  setImportJson("");
                  setExportJson("");
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setSelectedChip(contextMenu.chip);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => handleClone(contextMenu.chip)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors"
          >
            Clone Chip
          </button>
          {contextMenu.chip.isCustom && (
            <>
              <div className="border-t border-gray-600 my-1" />
              <button
                onClick={() => {
                  setEditingChip(contextMenu.chip);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors"
              >
                Edit Chip
              </button>
              <button
                onClick={() => {
                  handleDelete(contextMenu.chip.family);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors"
              >
                Delete Chip
              </button>
            </>
          )}
        </div>
      )}

      {/* Chip Details Panel */}
      {selectedChip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{selectedChip.family}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedChip.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedChip(null)}
                className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
                  Basic Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Manufacturer:</span>
                    <span className="font-medium">
                      {selectedChip.manufacturer}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Architecture:</span>
                    <span className="font-medium">
                      {selectedChip.architecture}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Decoder Support:</span>
                    <span
                      className={
                        selectedChip.supported
                          ? "text-green-400"
                          : "text-yellow-400"
                      }
                    >
                      {selectedChip.supported ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    {selectedChip.isCustom ? (
                      <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs">
                        Custom
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded text-xs">
                        Built-in
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Memory Layout */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
                  Memory Layout
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Flash Base:</span>
                      <span className="font-mono">
                        {selectedChip.flashBase}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Decimal:</span>
                      <span>
                        {parseInt(selectedChip.flashBase, 16).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Flash Size:</span>
                      <span className="font-mono">
                        {selectedChip.flashSize}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Decimal:</span>
                      <span>
                        {(parseInt(selectedChip.flashSize, 16) / 1024).toFixed(
                          0,
                        )}{" "}
                        KB
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">RAM Base:</span>
                      <span className="font-mono">{selectedChip.ramBase}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Decimal:</span>
                      <span>
                        {parseInt(selectedChip.ramBase, 16).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">RAM Size:</span>
                      <span className="font-mono">{selectedChip.ramSize}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Decimal:</span>
                      <span>
                        {(parseInt(selectedChip.ramSize, 16) / 1024).toFixed(0)}{" "}
                        KB
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vector Table Offset:</span>
                    <span className="font-mono">
                      0x
                      {selectedChip.vectorTableOffset
                        .toString(16)
                        .padStart(4, "0")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detection Patterns */}
              <div className="col-span-2 space-y-3">
                <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
                  Detection Patterns
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedChip.patterns.map((pattern, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-mono"
                    >
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => handleClone(selectedChip)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
              >
                Clone Chip
              </button>
              {selectedChip.isCustom && (
                <button
                  onClick={() => {
                    setEditingChip(selectedChip);
                    setSelectedChip(null);
                  }}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium transition-colors"
                >
                  Edit Chip
                </button>
              )}
              <button
                onClick={() => setSelectedChip(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ChipEditorModalProps {
  chip: ChipDefinition | null;
  onClose: () => void;
  onSave: () => void;
}

function ChipEditorModal({ chip, onClose, onSave }: ChipEditorModalProps) {
  const [formData, setFormData] = useState<Omit<ChipDefinition, "isCustom">>({
    family: chip?.family || "",
    manufacturer: chip?.manufacturer || "",
    architecture: chip?.architecture || "ArmCortexM4",
    supported: chip?.supported ?? true,
    patterns: chip?.patterns || [],
    description: chip?.description || "",
    flashBase: chip?.flashBase || "0x00000000",
    flashSize: chip?.flashSize || "0x40000",
    ramBase: chip?.ramBase || "0x20000000",
    ramSize: chip?.ramSize || "0x10000",
    vectorTableOffset: chip?.vectorTableOffset || 0,
  });

  const [patternsText, setPatternsText] = useState(
    chip?.patterns.join(", ") || "",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const chipDb = getChipDatabase();
      const chipData = {
        ...formData,
        patterns: patternsText
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
      };

      if (chip) {
        await chipDb.updateCustomChip(chip.family, chipData);
      } else {
        await chipDb.addCustomChip(chipData);
      }

      onSave();
    } catch (error) {
      alert(
        `Failed to save chip: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">
          {chip ? "Edit Custom Chip" : "Add Custom Chip"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Family Name
              </label>
              <input
                type="text"
                required
                value={formData.family}
                onChange={(e) =>
                  setFormData({ ...formData, family: e.target.value })
                }
                disabled={!!chip}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                required
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Architecture
              </label>
              <select
                value={formData.architecture}
                onChange={(e) =>
                  setFormData({ ...formData, architecture: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="ArmCortexM0">ARM Cortex-M0</option>
                <option value="ArmCortexM0Plus">ARM Cortex-M0+</option>
                <option value="ArmCortexM3">ARM Cortex-M3</option>
                <option value="ArmCortexM4">ARM Cortex-M4</option>
                <option value="ArmCortexM7">ARM Cortex-M7</option>
                <option value="ArmCortexM23">ARM Cortex-M23</option>
                <option value="ArmCortexM33">ARM Cortex-M33</option>
                <option value="Mips32">MIPS32</option>
                <option value="RiscV32">RISC-V 32</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Flash Base (hex)
              </label>
              <input
                type="text"
                required
                value={formData.flashBase}
                onChange={(e) =>
                  setFormData({ ...formData, flashBase: e.target.value })
                }
                placeholder="0x00000000"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Flash Size (hex)
              </label>
              <input
                type="text"
                required
                value={formData.flashSize}
                onChange={(e) =>
                  setFormData({ ...formData, flashSize: e.target.value })
                }
                placeholder="0x40000"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                RAM Base (hex)
              </label>
              <input
                type="text"
                required
                value={formData.ramBase}
                onChange={(e) =>
                  setFormData({ ...formData, ramBase: e.target.value })
                }
                placeholder="0x20000000"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                RAM Size (hex)
              </label>
              <input
                type="text"
                required
                value={formData.ramSize}
                onChange={(e) =>
                  setFormData({ ...formData, ramSize: e.target.value })
                }
                placeholder="0x10000"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Detection Patterns (comma-separated)
            </label>
            <input
              type="text"
              required
              value={patternsText}
              onChange={(e) => setPatternsText(e.target.value)}
              placeholder="MyChip, mychip, MYCHIP"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm resize-none focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.supported}
              onChange={(e) =>
                setFormData({ ...formData, supported: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label className="text-sm">
              Decoder supported (ARM Cortex-M only)
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
            >
              {chip ? "Update" : "Add"} Chip
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
