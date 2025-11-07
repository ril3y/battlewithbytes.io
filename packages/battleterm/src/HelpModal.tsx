/**
 * Help Modal Component
 * Comprehensive modal showing features, about info, browser support, and usage tips
 */

'use client';

import React, { useEffect } from 'react';
import { VERSION, VERSION_DATE, CHANGELOG } from './version';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  {
    category: 'Core Features',
    items: [
      'Web Serial API - No drivers needed',
      'Full ANSI color support',
      'Multiple view modes (ASCII, Hex, Mixed)',
      'Custom baud rates up to 921600',
      'Unicode support (UTF-8)'
    ]
  },
  {
    category: 'Advanced Features',
    items: [
      'Quick send macros',
      'Command history',
      'Save/export logs',
      'Timestamps & statistics',
      'Save configuration profiles',
      'Context menu (copy/paste)',
      'TX/RX activity indicators',
      'Line numbers (optional)'
    ]
  }
];

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="help-modal-title"
    >
      <div
        className="relative w-full max-w-2xl bg-gray-900 border-2 border-green-500/50 rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-green-500/30">
          <div>
            <h2
              id="help-modal-title"
              className="text-2xl font-bold font-mono text-green-400"
            >
              <span className="text-green-500">?</span> Help & Information
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-1">
              BattleTerm v{VERSION} • {VERSION_DATE}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
            aria-label="Close help modal"
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
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-bold text-green-400 font-mono mb-3">
                About This Tool
              </h3>
              <div className="space-y-3 text-gray-300 text-sm font-mono">
                <p>
                  BattleTerm uses the Web Serial API to communicate directly with serial devices
                  from your browser. No drivers, no software installation - just connect and go.
                </p>
                <p>
                  Perfect for debugging embedded systems, communicating with microcontrollers (Arduino, ESP32, etc.),
                  testing serial protocols, and interacting with any device that speaks UART.
                </p>
              </div>
            </div>

            {/* Changelog Section */}
            <div>
              <h3 className="text-lg font-bold text-cyan-400 font-mono mb-3">
                📋 What&apos;s New in v{VERSION}
              </h3>
              <div className="space-y-2">
                {CHANGELOG[0].changes.map((change, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-gray-300 font-mono text-sm"
                  >
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>{change}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Section */}
            {features.map((section) => (
              <div key={section.category}>
                <h3 className="text-lg font-bold text-green-400 font-mono mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2 text-gray-300 font-mono text-sm"
                    >
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Browser Support Warning */}
            <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <div className="font-bold text-yellow-400 mb-2 font-mono">
                Browser Support
              </div>
              <div className="text-yellow-300/90 text-sm font-mono">
                This tool requires the Web Serial API, which is currently supported in
                Chrome, Edge, and Opera. Firefox and Safari do not yet support this feature.
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
              <div className="font-bold text-green-400 mb-2 font-mono">
                Quick Tips
              </div>
              <ul className="text-green-300/90 text-sm font-mono space-y-1 list-disc list-inside">
                <li>Right-click in terminal for copy/paste options</li>
                <li>Use gear icon to access configuration settings</li>
                <li>Watch TX/RX LEDs for data transmission activity</li>
                <li>Enable timestamps for debugging time-sensitive protocols</li>
                <li>Download logs for later analysis using the download button</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-green-500/30">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-mono text-sm rounded transition-colors shadow-lg"
          >
            Got it!
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
