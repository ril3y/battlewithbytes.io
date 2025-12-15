"use client";

import { useEffect, useRef } from "react";

interface TerminalPanelProps {
  output: Array<{
    message: string;
    type: "info" | "success" | "error" | "warning";
  }>;
}

export function TerminalPanel({ output }: TerminalPanelProps) {
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="terminal-panel">
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
        Output
      </div>
      <div className="terminal-output" ref={outputRef}>
        {output.map((line, index) => (
          <div key={index} className={line.type}>
            [{new Date().toLocaleTimeString()}] {line.message}
          </div>
        ))}
      </div>
    </div>
  );
}
