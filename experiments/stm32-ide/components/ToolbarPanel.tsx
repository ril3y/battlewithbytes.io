"use client";

interface ToolbarPanelProps {
  onCompile: () => void;
  onFlash: () => void;
}

export function ToolbarPanel({ onCompile, onFlash }: ToolbarPanelProps) {
  return (
    <div className="toolbar">
      <button onClick={onCompile}>🔧 Compile</button>
      <button onClick={onFlash}>⚡ Flash</button>
      <button disabled>📁 Save</button>
      <button disabled>📂 Load</button>
      <div style={{ flex: 1 }} />
      <select
        style={{
          background: "transparent",
          border: "1px solid var(--accent-primary)",
          color: "var(--accent-primary)",
          padding: "8px 16px",
          borderRadius: "4px",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
        }}
      >
        <option>STM32F103C8T6</option>
        <option disabled>STM32F401 (Coming Soon)</option>
        <option disabled>STM32G0 (Coming Soon)</option>
      </select>
    </div>
  );
}
