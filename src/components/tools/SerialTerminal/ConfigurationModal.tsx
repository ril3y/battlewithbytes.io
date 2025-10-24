/**
 * Configuration Modal Component
 * Modal dialog for serial port configuration
 */

'use client';

import React, { useEffect } from 'react';
import ConfigurationPanel from './ConfigurationPanel';
import type { SerialConfig, SendOptions } from './serialTerminal.types';

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SerialConfig;
  onChange: (config: SerialConfig) => void;
  disabled: boolean;
  sendOptions: SendOptions;
  onSendOptionsChange: (options: SendOptions) => void;
  showTimestamps: boolean;
  onToggleTimestamps: () => void;
  showLineNumbers: boolean;
  onToggleLineNumbers: () => void;
}

export default function ConfigurationModal({
  isOpen,
  onClose,
  config,
  onChange,
  disabled,
  sendOptions,
  onSendOptionsChange,
  showTimestamps,
  onToggleTimestamps,
  showLineNumbers,
  onToggleLineNumbers
}: ConfigurationModalProps) {
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="config-modal-title"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 border-2 border-green-500/50 rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-gray-900 border-b border-green-500/30">
          <h2
            id="config-modal-title"
            className="text-2xl font-bold font-mono text-green-400"
          >
            <span className="text-green-500">&lt;</span> Configuration <span className="text-green-500">/&gt;</span>
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
            aria-label="Close configuration modal"
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
        <div className="p-6">
          <ConfigurationPanel
            config={config}
            onChange={onChange}
            disabled={disabled}
            sendOptions={sendOptions}
            onSendOptionsChange={onSendOptionsChange}
            showTimestamps={showTimestamps}
            onToggleTimestamps={onToggleTimestamps}
            showLineNumbers={showLineNumbers}
            onToggleLineNumbers={onToggleLineNumbers}
          />

          {disabled && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400 font-mono text-sm">
                <span>⚠</span>
                <span>Disconnect from the serial port to change configuration settings</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-3 p-4 bg-gray-900 border-t border-green-500/30">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-mono text-sm rounded transition-colors shadow-lg"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
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
