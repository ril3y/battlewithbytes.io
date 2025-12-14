"use client";

import { useVFS } from "../lib/vfs/VFSContext";
import { getLanguageFromPath } from "../lib/vfs/types";

interface FileTabsProps {
  onTabSelect?: (path: string) => void;
}

export function FileTabs({ onTabSelect }: FileTabsProps) {
  const { state, setActiveFile, closeFile, getFile } = useVFS();

  const handleTabClick = (path: string) => {
    setActiveFile(path);
    onTabSelect?.(path);
  };

  const handleCloseClick = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    closeFile(path);
  };

  const getTabIcon = (path: string) => {
    const lang = getLanguageFromPath(path);
    switch (lang) {
      case "c":
        return "C";
      case "cpp":
        return "C++";
      case "h":
        return "H";
      case "makefile":
        return "M";
      case "ld":
        return "LD";
      case "asm":
        return "S";
      case "binary":
        return "B";
      default:
        return "T";
    }
  };

  const getFileName = (path: string) => {
    return path.split("/").pop() || path;
  };

  if (state.openFiles.length === 0) {
    return null;
  }

  return (
    <div className="file-tabs">
      {state.openFiles.map((path) => {
        const file = getFile(path);
        const isActive = state.activeFile === path;
        const isModified = file?.modified || false;
        const lang = getLanguageFromPath(path);

        return (
          <div
            key={path}
            className={`file-tab ${isActive ? "active" : ""}`}
            onClick={() => handleTabClick(path)}
          >
            <span className={`tab-icon lang-${lang}`}>{getTabIcon(path)}</span>
            <span className="tab-name">
              {getFileName(path)}
              {isModified && " *"}
            </span>
            <button
              className="tab-close"
              onClick={(e) => handleCloseClick(e, path)}
              title="Close"
            >
              x
            </button>
          </div>
        );
      })}

      <style jsx>{`
        .file-tabs {
          display: flex;
          background: #1a1a1a;
          border-bottom: 1px solid #333;
          overflow-x: auto;
          min-height: 32px;
        }

        .file-tabs::-webkit-scrollbar {
          height: 4px;
        }

        .file-tabs::-webkit-scrollbar-track {
          background: #1a1a1a;
        }

        .file-tabs::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 2px;
        }

        .file-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #111;
          border-right: 1px solid #333;
          cursor: pointer;
          color: #888;
          font-size: 0.85rem;
          white-space: nowrap;
          transition: background 0.1s;
        }

        .file-tab:hover {
          background: #1a1a1a;
          color: #ccc;
        }

        .file-tab.active {
          background: #1e1e1e;
          color: #ededed;
          border-bottom: 2px solid #0088ff;
          margin-bottom: -1px;
        }

        .tab-icon {
          font-size: 0.6rem;
          font-weight: bold;
          padding: 1px 3px;
          border-radius: 2px;
          min-width: 16px;
          text-align: center;
        }

        .tab-icon.lang-c {
          background: #649ad2;
          color: #fff;
        }

        .tab-icon.lang-cpp {
          background: #9b4f96;
          color: #fff;
        }

        .tab-icon.lang-h {
          background: #4caf50;
          color: #fff;
        }

        .tab-icon.lang-makefile {
          background: #ff9800;
          color: #fff;
        }

        .tab-icon.lang-ld {
          background: #795548;
          color: #fff;
        }

        .tab-icon.lang-asm {
          background: #607d8b;
          color: #fff;
        }

        .tab-icon.lang-binary {
          background: #333;
          color: #888;
        }

        .tab-icon.lang-text {
          background: #555;
          color: #ccc;
        }

        .tab-name {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tab-close {
          background: transparent;
          border: none;
          color: #666;
          padding: 0 2px;
          cursor: pointer;
          font-size: 0.75rem;
          border-radius: 3px;
          line-height: 1;
        }

        .tab-close:hover {
          background: rgba(255, 100, 100, 0.3);
          color: #ff6b6b;
        }
      `}</style>
    </div>
  );
}
