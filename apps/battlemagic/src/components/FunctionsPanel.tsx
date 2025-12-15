"use client";

import React from "react";

interface FunctionsPanelProps {
  className?: string;
  onNavigateToAddress?: (address: number) => void;
}

export default function FunctionsPanel({ className }: FunctionsPanelProps) {
  return (
    <div className={className}>
      <div className="p-4 text-gray-500">
        <h3 className="font-medium mb-2">Functions</h3>
        <p className="text-sm">No functions detected yet.</p>
        <p className="text-xs mt-2">
          Load a firmware binary to analyze functions.
        </p>
      </div>
    </div>
  );
}
