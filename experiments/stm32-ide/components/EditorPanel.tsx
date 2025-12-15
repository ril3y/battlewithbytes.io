"use client";

interface EditorPanelProps {
  sourceCode: string;
  onChange: (code: string) => void;
}

export function EditorPanel({ sourceCode, onChange }: EditorPanelProps) {
  return (
    <div className="editor-panel">
      <div
        style={{
          padding: "10px 15px",
          background: "rgba(0, 0, 0, 0.5)",
          borderBottom: "1px solid rgba(0, 255, 157, 0.2)",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          color: "var(--accent-secondary)",
        }}
      >
        main.c
      </div>
      <textarea
        value={sourceCode}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="Write your STM32 C code here..."
      />
    </div>
  );
}
