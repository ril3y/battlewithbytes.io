"use client";

import { EditorPanel } from "./EditorPanel";
import { FileTabs } from "./FileTabs";
import { HexViewer } from "./HexViewer";
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

export function MainEditorArea({
  activeFile,
  editorContent,
  isActiveFileBinary,
  binaryContent,
  onEditorChange,
  onGetStarted,
  getVFSFiles,
}: MainEditorAreaProps) {
  return (
    <div className="editor-area">
      <FileTabs />
      {activeFile ? (
        isActiveFileBinary && binaryContent ? (
          <HexViewer data={binaryContent} filename={activeFile} />
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
      `}</style>
    </div>
  );
}
