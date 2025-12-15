"use client";

/**
 * Analysis Progress Modal
 *
 * Visual progress indicator for firmware analysis
 * Shows current stage and progress percentage
 */

import React from "react";
import { createPortal } from "react-dom";

interface AnalysisProgressModalProps {
  isVisible: boolean;
  stage: string;
  progress: number;
  message?: string;
  title?: string;
  onDismiss?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

export default function AnalysisProgressModal({
  isVisible,
  stage,
  progress,
  message,
  title = "Processing",
  onDismiss,
  onCancel,
  showCancelButton = false,
}: AnalysisProgressModalProps) {
  if (!isVisible) return null;

  // Use portal to render at document.body level (bypasses any parent container issues)
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-6 min-w-[400px] max-w-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{stage}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        {/* Message */}
        {message && onDismiss && (
          <div
            className="text-sm text-blue-400 mt-3 p-3 bg-gray-800/50 rounded border border-gray-700 hover:bg-gray-800 hover:border-blue-500 transition-colors cursor-pointer text-center"
            onClick={onDismiss}
          >
            {message}
          </div>
        )}

        {/* Cancel Button */}
        {showCancelButton && onCancel && (
          <button
            onClick={onCancel}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded font-mono transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
