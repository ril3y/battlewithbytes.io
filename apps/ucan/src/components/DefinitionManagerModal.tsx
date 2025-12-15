"use client";

/**
 * DefinitionManagerModal - Manage CAN Overlay Definitions
 *
 * Allows users to:
 * - View and select available definitions
 * - Upload custom definitions
 * - View definition metadata
 */

import React, { useState } from "react";
import type { DefinitionMetadata } from "../overlays/decoder/definitionManager";

interface DefinitionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  definitions: DefinitionMetadata[];
  activeDefinitionId?: string;
  onSelectDefinition: (id: string) => void;
  onUploadDefinition: (
    file: File,
  ) => Promise<{ success: boolean; error?: string }>;
}

export const DefinitionManagerModal: React.FC<DefinitionManagerModalProps> = ({
  isOpen,
  onClose,
  definitions,
  activeDefinitionId,
  onSelectDefinition,
  onUploadDefinition,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const result = await onUploadDefinition(file);
      if (!result.success) {
        setUploadError(result.error || "Upload failed");
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = ""; // Reset input
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[80vh] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">
              CAN Overlay Definitions
            </h2>
            <p className="text-sm text-gray-400">
              Select or upload a definition to decode messages
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Upload Section */}
          <div className="bg-gray-800 border border-gray-700 rounded p-4">
            <h3 className="text-sm font-semibold text-white mb-2">
              Upload Custom Definition
            </h3>
            <div className="flex items-center gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <div
                  className={`px-4 py-2 text-sm border border-gray-600 rounded cursor-pointer text-center transition-colors ${
                    uploading
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {uploading ? "Uploading..." : "Choose JSON file"}
                </div>
              </label>
            </div>
            {uploadError && (
              <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-300 text-xs">
                {uploadError}
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Upload a custom CAN definition file (JSON format)
            </p>
          </div>

          {/* Definitions List */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">
              Available Definitions
            </h3>
            {definitions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No definitions available
              </div>
            ) : (
              <div className="space-y-2">
                {definitions.map((def) => {
                  const isActive = def.id === activeDefinitionId;
                  const isBuiltin = def.source === "builtin";

                  return (
                    <div
                      key={def.id}
                      className={`p-4 border rounded transition-colors ${
                        isActive
                          ? "bg-green-900/20 border-green-500/50"
                          : "bg-gray-800 border-gray-700 hover:bg-gray-750"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-white">
                              {def.name}
                            </h4>
                            <span
                              className={`px-2 py-0.5 text-[10px] rounded ${
                                isBuiltin
                                  ? "bg-blue-600/20 text-blue-300"
                                  : "bg-purple-600/20 text-purple-300"
                              }`}
                            >
                              {isBuiltin ? "BUILT-IN" : "CUSTOM"}
                            </span>
                            {isActive && (
                              <span className="px-2 py-0.5 text-[10px] bg-green-600/20 text-green-300 rounded">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          {def.description && (
                            <p className="text-xs text-gray-400 mb-2">
                              {def.description}
                            </p>
                          )}
                          {def.author && (
                            <p className="text-xs text-gray-500">
                              Author: {def.author}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{def.messageCount} messages</span>
                            <span>{def.widgetCount} widgets</span>
                            <span>{def.layoutCount} layouts</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isActive && (
                            <button
                              onClick={() => onSelectDefinition(def.id)}
                              className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
