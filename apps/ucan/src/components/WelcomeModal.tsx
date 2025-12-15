"use client";

/**
 * Welcome Modal Component
 *
 * Displays information about the uCAN application to new users
 */

import React, { useState, useEffect, useCallback } from "react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WELCOME_MODAL_STORAGE_KEY = "ucan-welcome-dismissed";

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Handle ESC key
  const handleClose = useCallback(() => {
    if (dontShowAgain && typeof window !== "undefined") {
      localStorage.setItem(WELCOME_MODAL_STORAGE_KEY, "true");
    }
    onClose();
  }, [dontShowAgain, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative bg-gray-900 border-2 border-green-500 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 border-b border-gray-700 p-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <span className="text-green-400">u</span>CAN Monitor
          </h2>
          <p className="text-gray-200 mt-2">Universal CAN Packet Analyzer</p>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* What is uCAN */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">
              What is uCAN?
            </h3>
            <p className="text-gray-300 leading-relaxed">
              uCAN is a browser-based CAN bus packet analyzer that works with
              USB-to-CAN hardware adapters. It provides a Wireshark-like
              interface for monitoring, analyzing, and transmitting CAN messages
              directly from your web browser using the Web Serial API.
            </p>
          </div>

          {/* Demo Mode Notice */}
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-blue-400 mb-2">
              Demo Mode Active
            </h4>
            <p className="text-gray-300 text-sm">
              You&apos;re currently viewing demo data. To use uCAN with real
              hardware:
            </p>
            <ol className="text-gray-300 text-sm mt-2 ml-4 space-y-1 list-decimal">
              <li>Connect a USB-to-CAN adapter (e.g., SLCAN, CANable, etc.)</li>
              <li>Click the &quot;Connect to uCAN Device&quot; button</li>
              <li>Select your serial port from the browser prompt</li>
              <li>Start capturing CAN traffic!</li>
            </ol>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Key Features
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  <strong>Real-time Monitoring:</strong> Capture and display CAN
                  packets as they arrive
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  <strong>Filtering & Search:</strong> Filter by CAN ID,
                  direction, and more
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  <strong>Packet Transmission:</strong> Send CAN messages to the
                  bus
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  <strong>Multiple Views:</strong> List, hex dump, and
                  statistics views
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  <strong>Export Data:</strong> Export captures as CSV or JSON
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  <strong>No Installation:</strong> Runs entirely in your
                  browser
                </span>
              </li>
            </ul>
          </div>

          {/* Browser Support */}
          <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-yellow-400 mb-2">
              Browser Compatibility
            </h4>
            <p className="text-gray-300 text-sm">
              uCAN requires the Web Serial API, which is supported in:
            </p>
            <ul className="text-gray-300 text-sm mt-2 ml-4 space-y-1">
              <li>Chrome / Chromium 89+</li>
              <li>Microsoft Edge 89+</li>
              <li>Opera 76+</li>
            </ul>
            <p className="text-gray-400 text-xs mt-2">
              Firefox and Safari do not currently support the Web Serial API.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Don&apos;t show this again
              </span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              Press{" "}
              <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-300">
                ESC
              </kbd>{" "}
              to close
            </div>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
