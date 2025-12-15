"use client";

/**
 * Go To Address Modal Component
 *
 * A reusable modal for jumping to a specific address in the disassembly view.
 * Supports hex addresses, decimal values, and $pc relative syntax.
 */

import React from "react";

export interface GoToModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (address: string) => void;
  goToAddress: string;
  setGoToAddress: (addr: string) => void;
  goToError: string | null;
  programCounter?: number;
}

export default function GoToModal({
  isOpen,
  onClose,
  onSubmit,
  goToAddress,
  setGoToAddress,
  goToError,
}: GoToModalProps) {
  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(goToAddress);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const handleSubmitClick = () => {
    onSubmit(goToAddress);
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-gray-900 border-2 border-green-500 rounded-lg shadow-2xl p-4 w-96">
        <h3 className="text-sm font-bold text-green-400 mb-3">Go To Address</h3>

        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">
            Enter address (hex, decimal, or $pc±offset):
          </label>
          <input
            type="text"
            value={goToAddress}
            onChange={(e) => setGoToAddress(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0x20000000, $pc, $pc-0x10"
            className="w-full px-2 py-1.5 text-sm bg-gray-900 border border-gray-600 rounded text-gray-300 font-mono focus:outline-none focus:border-green-500"
            autoFocus
          />
        </div>

        {goToError && (
          <div className="mb-3 px-2 py-1.5 bg-red-900 bg-opacity-30 border border-red-500 rounded text-red-400 text-xs">
            {goToError}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
          >
            Cancel (Esc)
          </button>
          <button
            onClick={handleSubmitClick}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-500"
          >
            Go (Enter)
          </button>
        </div>
      </div>
    </div>
  );
}
