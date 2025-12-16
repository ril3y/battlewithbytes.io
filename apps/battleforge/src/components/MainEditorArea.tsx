"use client";

import { useState, useMemo } from "react";
import { EditorPanel } from "./EditorPanel";
import { FileTabs } from "./FileTabs";
import { HexViewer } from "./HexViewer";
import { DisassemblyPanel } from "./DisassemblyPanel";
import { WelcomePlaceholder } from "./WelcomePlaceholder";

interface MainEditorAreaProps {
  activeFile: string | null;
  editorContent: string;
  isActiveFileBinary: boolean;
  binaryContent: Uint8Array | null;
  onEditorChange: (content: string) => void;
  onGetStarted: () => void;
  getVFSFiles: () => Map<
    string,
    { content: string | Uint8Array; readOnly?: boolean }
  >;
}

type BinaryViewMode = "hex" | "disasm";

export function MainEditorArea({
  activeFile,
  editorContent,
  isActiveFileBinary,
  binaryContent,
  onEditorChange,
  onGetStarted,
  getVFSFiles,
}: MainEditorAreaProps) {
  const [binaryViewMode, setBinaryViewMode] = useState<BinaryViewMode>("hex");

  // Check if the file is an ELF (can be disassembled)
  const isElfFile = activeFile?.endsWith(".elf") || (
    binaryContent &&
    binaryContent[0] === 0x7f &&
    binaryContent[1] === 0x45 &&
    binaryContent[2] === 0x4c &&
    binaryContent[3] === 0x46
  );

  // Generate a unique key for binary content to force DisassemblyPanel re-render
  // Uses size + first/last bytes as a simple hash
  const binaryContentKey = useMemo(() => {
    if (!binaryContent || binaryContent.length === 0) return "empty";
    const len = binaryContent.length;
    const first = binaryContent.slice(0, Math.min(8, len));
    const last = binaryContent.slice(Math.max(0, len - 8));
    const hash = Array.from(first).concat(Array.from(last))
      .reduce((acc, b) => (acc * 31 + b) >>> 0, len);
    return `${len}-${hash}`;
  }, [binaryContent]);

  return (
    <div className="editor-area">
      <FileTabs />
      {activeFile ? (
        isActiveFileBinary && binaryContent ? (
          <div className="binary-viewer">
            {/* View mode tabs for ELF files */}
            {isElfFile && (
              <div className="view-tabs">
                <button
                  className={`view-tab ${binaryViewMode === "hex" ? "active" : ""}`}
                  onClick={() => setBinaryViewMode("hex")}
                >
                  Hex
                </button>
                <button
                  className={`view-tab ${binaryViewMode === "disasm" ? "active" : ""}`}
                  onClick={() => setBinaryViewMode("disasm")}
                >
                  Disassembly
                </button>
              </div>
            )}
            {/* Content */}
            <div className="viewer-content">
              {binaryViewMode === "disasm" && isElfFile ? (
                <DisassemblyPanel key={binaryContentKey} data={binaryContent} filename={activeFile} />
              ) : (
                <HexViewer data={binaryContent} filename={activeFile} />
              )}
            </div>
          </div>
        ) : (
          <EditorPanel
            sourceCode={editorContent}
            onChange={onEditorChange}
            getVFSFiles={getVFSFiles}
          />
        )
      ) : (
        <WelcomePlaceholder onGetStarted={onGetStarted} />
      )}

      <style jsx>{`
        .editor-area {
          grid-area: editor;
          background: #1e1e1e;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .binary-viewer {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .view-tabs {
          display: flex;
          gap: 0;
          padding: 0 8px;
          background: #111;
          border-bottom: 1px solid #333;
          flex-shrink: 0;
        }
        .view-tab {
          padding: 6px 16px;
          font-size: 12px;
          color: #888;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
        }
        .view-tab:hover {
          color: #ccc;
          background: rgba(255,255,255,0.05);
        }
        .view-tab.active {
          color: #00ff9d;
          border-bottom-color: #00ff9d;
        }
        .viewer-content {
          flex: 1;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
