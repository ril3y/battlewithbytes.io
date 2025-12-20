"use client";

import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Tree, NodeRendererProps, TreeApi, NodeApi } from "react-arborist";
import { useVFS } from "../lib/vfs/VFSContext";
import type { VFSNode } from "../lib/vfs/types";
import { isDirectory } from "../lib/vfs/types";

interface FileExplorerProps {
  onFileSelect?: (path: string, content: string | Uint8Array) => void;
}

interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  isFolder: boolean;
  language?: string;
  modified?: boolean;
  editable?: boolean;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
  isFolder: boolean;
  isEditable: boolean;
}

// LocalStorage key for persisting expanded state
const EXPANDED_STATE_KEY = "battleforge-explorer-expanded";

// Load expanded state from localStorage
function loadExpandedState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(EXPANDED_STATE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

// Save expanded state to localStorage
function saveExpandedState(state: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EXPANDED_STATE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

// Convert VFS structure to react-arborist format
function vfsToTreeData(node: VFSNode): TreeNode {
  if (isDirectory(node)) {
    return {
      id: node.path,
      name: node.name,
      isFolder: true,
      children: node.children.map(vfsToTreeData),
    };
  }
  return {
    id: node.path,
    name: node.name,
    isFolder: false,
    language: node.language,
    modified: node.modified,
    editable: node.editable,
  };
}

// File icon based on language
function getFileIcon(language?: string) {
  switch (language) {
    case "c":
      return { bg: "#649ad2", label: "C" };
    case "cpp":
      return { bg: "#9b4f96", label: "C++" };
    case "h":
      return { bg: "#00ff9d", label: "H" };
    case "makefile":
      return { bg: "#ff9800", label: "M" };
    case "ld":
      return { bg: "#795548", label: "LD" };
    case "asm":
      return { bg: "#607d8b", label: "S" };
    case "binary":
      return { bg: "#0088ff", label: "B" };
    case "o":
      return { bg: "#666", label: "O" };
    case "elf":
      return { bg: "#c084fc", label: "ELF" };
    default:
      return { bg: "#444", label: "T" };
  }
}

// Custom node renderer with site theming
function Node({ node, style, dragHandle }: NodeRendererProps<TreeNode>) {
  const icon = node.data.isFolder ? null : getFileIcon(node.data.language);
  const isReadOnly = node.data.editable === false;

  return (
    <div
      ref={dragHandle}
      style={style}
      className={`tree-node ${node.isSelected ? "selected" : ""} ${node.data.modified ? "modified" : ""} ${isReadOnly ? "readonly" : ""}`}
      onClick={() => (node.isInternal ? node.toggle() : node.select())}
    >
      {node.data.isFolder ? (
        <>
          <span className="folder-arrow">{node.isOpen ? "▼" : "▶"}</span>
          <span className="folder-icon">{node.isOpen ? "📂" : "📁"}</span>
        </>
      ) : (
        <span className="file-icon" style={{ background: icon?.bg }}>
          {icon?.label}
        </span>
      )}
      <span className="node-name">{node.data.name}</span>
      {node.data.modified && <span className="modified-dot" />}
      {isReadOnly && <span className="readonly-badge">R</span>}

      <style jsx>{`
        .tree-node {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 6px;
          cursor: pointer;
          color: var(--foreground, #ededed);
          font-size: 0.8rem;
          user-select: none;
          border-radius: 3px;
          margin: 1px 4px;
          transition: background 0.15s;
        }

        .tree-node:hover {
          background: rgba(0, 255, 157, 0.08);
        }

        .tree-node.selected {
          background: rgba(0, 136, 255, 0.25);
          color: #fff;
        }

        .tree-node.modified .node-name {
          font-style: italic;
        }

        .tree-node.readonly {
          opacity: 0.7;
        }

        .folder-arrow {
          font-size: 0.6rem;
          color: var(--accent-primary, #00ff9d);
          width: 10px;
          text-align: center;
        }

        .folder-icon {
          font-size: 0.8rem;
        }

        .file-icon {
          font-size: 0.55rem;
          font-weight: bold;
          padding: 1px 2px;
          border-radius: 2px;
          min-width: 14px;
          text-align: center;
          color: #fff;
          margin-left: 16px;
        }

        .node-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .modified-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-primary, #00ff9d);
          border-radius: 50%;
        }

        .readonly-badge {
          font-size: 0.6rem;
          padding: 1px 3px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          color: #888;
        }
      `}</style>
    </div>
  );
}

// Context Menu component
function ContextMenu({
  state,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
  onDownload,
}: {
  state: ContextMenuState;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
  onDownload: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!state.visible) return null;

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: state.x, top: state.y }}
    >
      <button className="menu-item" onClick={onNewFile}>
        <span className="menu-icon">+</span> New File
      </button>
      <button className="menu-item" onClick={onNewFolder}>
        <span className="menu-icon">📁</span> New Folder
      </button>
      {state.nodeId && (
        <>
          <div className="menu-divider" />
          {!state.isFolder && (
            <button className="menu-item" onClick={onDownload}>
              <span className="menu-icon">⬇️</span> Download
            </button>
          )}
          <button
            className="menu-item"
            onClick={onRename}
            disabled={!state.isEditable}
          >
            <span className="menu-icon">✏️</span> Rename
          </button>
          <button
            className="menu-item danger"
            onClick={onDelete}
            disabled={!state.isEditable}
          >
            <span className="menu-icon">🗑️</span> Delete
          </button>
        </>
      )}

      <style jsx>{`
        .context-menu {
          position: fixed;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 4px;
          min-width: 160px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          color: var(--foreground, #ededed);
          font-size: 0.85rem;
          cursor: pointer;
          border-radius: 4px;
          text-align: left;
          transition: background 0.15s;
        }

        .menu-item:hover:not(:disabled) {
          background: rgba(0, 255, 157, 0.15);
        }

        .menu-item:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .menu-item.danger:hover:not(:disabled) {
          background: rgba(255, 100, 100, 0.2);
          color: #ff6b6b;
        }

        .menu-icon {
          width: 16px;
          text-align: center;
          font-size: 0.8rem;
        }

        .menu-divider {
          height: 1px;
          background: #333;
          margin: 4px 0;
        }
      `}</style>
    </div>
  );
}

// Input dialog for naming files/folders - uses portal to render at body level
function NameInputDialog({
  isOpen,
  title,
  placeholder,
  initialValue,
  onSubmit,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  placeholder: string;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue || "");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue || "");
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit(value.trim());
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  if (!isOpen || !mounted) return null;

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };

  const dialogStyle: React.CSSProperties = {
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "20px",
    width: "350px",
    maxWidth: "90vw",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
  };

  const titleStyle: React.CSSProperties = {
    margin: "0 0 16px 0",
    fontSize: "1rem",
    color: "#fff",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0a0a0a",
    border: "1px solid #444",
    borderRadius: "4px",
    color: "#ededed",
    padding: "10px 12px",
    fontSize: "0.9rem",
    outline: "none",
    marginBottom: "16px",
    boxSizing: "border-box",
  };

  const buttonsStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  };

  const cancelBtnStyle: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    cursor: "pointer",
    background: "transparent",
    border: "1px solid #444",
    color: "#888",
  };

  const confirmBtnStyle: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    cursor: value.trim() ? "pointer" : "not-allowed",
    background: "#00ff9d",
    border: "none",
    color: "#000",
    fontWeight: 600,
    opacity: value.trim() ? 1 : 0.5,
  };

  const dialogContent = (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={titleStyle}>{title}</h3>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={inputStyle}
        />
        <div style={buttonsStyle}>
          <button style={cancelBtnStyle} onClick={onCancel}>
            Cancel
          </button>
          <button
            style={confirmBtnStyle}
            onClick={() => value.trim() && onSubmit(value.trim())}
            disabled={!value.trim()}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal to render at body level, avoiding parent container constraints
  return createPortal(dialogContent, document.body);
}

// Rename input component (inline) - Reserved for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RenameInput({
  initialValue,
  onSubmit,
  onCancel,
}: {
  initialValue: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit(value);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onSubmit(value)}
      className="rename-input"
      style={{
        background: "#0a0a0a",
        border: "1px solid var(--accent-primary, #00ff9d)",
        borderRadius: "3px",
        color: "var(--foreground, #ededed)",
        padding: "4px 8px",
        fontSize: "0.85rem",
        width: "100%",
        outline: "none",
      }}
    />
  );
}

export function FileExplorer({ onFileSelect }: FileExplorerProps) {
  const {
    state,
    openFile,
    selectFile,
    deleteFile,
    addFile,
    addDirectory,
    getFile,
    renameFile,
    moveFile,
  } = useVFS();

  const treeRef = useRef<TreeApi<TreeNode>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [treeHeight, setTreeHeight] = useState(400);
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>(
    () => loadExpandedState(),
  );

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null,
    isFolder: false,
    isEditable: true,
  });
  const [_renamingPath, _setRenamingPath] = useState<string | null>(null);

  // Dialog state for new file/folder
  const [newFileDialog, setNewFileDialog] = useState<{
    open: boolean;
    parentPath: string;
  }>({
    open: false,
    parentPath: "/src",
  });
  const [newFolderDialog, setNewFolderDialog] = useState<{
    open: boolean;
    parentPath: string;
  }>({
    open: false,
    parentPath: "/",
  });

  // Measure container height dynamically
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      const rect = container.getBoundingClientRect();
      // Subtract header height (approx 45px)
      setTreeHeight(Math.max(200, rect.height - 45));
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Handle folder toggle and persist state
  const handleToggle = useCallback((id: string) => {
    setExpandedState((prev) => {
      const newState = { ...prev, [id]: !prev[id] };
      saveExpandedState(newState);
      return newState;
    });
  }, []);

  // Convert VFS to tree data
  const treeData = useMemo(() => {
    return state.root.children.map(vfsToTreeData);
  }, [state.root]);

  const handleSelect = useCallback(
    (nodes: NodeApi<TreeNode>[]) => {
      if (nodes.length === 0) return;
      const node = nodes[0];

      if (!node.data.isFolder) {
        selectFile(node.id);
        openFile(node.id);
        const file = getFile(node.id);
        if (file) {
          onFileSelect?.(node.id, file.content);
        }
      }
    },
    [selectFile, openFile, getFile, onFileSelect],
  );

  // Helper to find a node in the tree by path
  const findNodeInTree = useCallback(
    (nodes: TreeNode[], path: string): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === path) return node;
        if (node.children) {
          const found = findNodeInTree(node.children, path);
          if (found) return found;
        }
      }
      return null;
    },
    [],
  );

  // Get parent directory of a path
  const getParentPath = useCallback((path: string): string => {
    const lastSlash = path.lastIndexOf("/");
    if (lastSlash <= 0) return "/";
    return path.substring(0, lastSlash);
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      // Find the node that was right-clicked
      const target = e.target as HTMLElement;
      const nodeElement = target.closest(".tree-node");
      const nodeId =
        nodeElement?.getAttribute("data-node-id") || state.selectedPath;

      // Get node info if we have a path
      let isFolder = false;
      let isEditable = true;

      if (nodeId) {
        // Use findNodeInTree to properly detect if it's a folder
        const treeNode = findNodeInTree(treeData, nodeId);
        isFolder = treeNode?.isFolder ?? false;
        const file = getFile(nodeId);
        isEditable = file?.editable !== false;
      }

      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        nodeId,
        isFolder,
        isEditable,
      });
    },
    [state.selectedPath, getFile, treeData, findNodeInTree],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleNewFile = useCallback(() => {
    let parentPath = "/src";
    if (contextMenu.nodeId) {
      parentPath = contextMenu.isFolder
        ? contextMenu.nodeId
        : getParentPath(contextMenu.nodeId);
    }
    setNewFileDialog({ open: true, parentPath });
    closeContextMenu();
  }, [contextMenu, closeContextMenu, getParentPath]);

  const handleNewFileCreate = useCallback(
    (fileName: string) => {
      const { parentPath } = newFileDialog;
      // Add .c extension if no extension provided
      const finalName = fileName.includes(".") ? fileName : `${fileName}.c`;
      const path = `${parentPath}/${finalName}`;
      addFile(path, "", true);
      selectFile(path);
      openFile(path);
      setNewFileDialog({ open: false, parentPath: "/src" });
    },
    [newFileDialog, addFile, selectFile, openFile],
  );

  const handleNewFolder = useCallback(() => {
    let parentPath = "/";
    if (contextMenu.nodeId) {
      parentPath = contextMenu.isFolder
        ? contextMenu.nodeId
        : getParentPath(contextMenu.nodeId);
    }
    setNewFolderDialog({ open: true, parentPath });
    closeContextMenu();
  }, [contextMenu, closeContextMenu, getParentPath]);

  const handleNewFolderCreate = useCallback(
    (folderName: string) => {
      const { parentPath } = newFolderDialog;
      const path =
        parentPath === "/" ? `/${folderName}` : `${parentPath}/${folderName}`;
      addDirectory(path);
      setNewFolderDialog({ open: false, parentPath: "/" });
    },
    [newFolderDialog, addDirectory],
  );

  const handleRename = useCallback(() => {
    if (contextMenu.nodeId) {
      _setRenamingPath(contextMenu.nodeId);
    }
    closeContextMenu();
  }, [contextMenu.nodeId, closeContextMenu]);

  const handleDelete = useCallback(() => {
    if (contextMenu.nodeId) {
      deleteFile(contextMenu.nodeId);
    }
    closeContextMenu();
  }, [contextMenu.nodeId, deleteFile, closeContextMenu]);

  const handleDownload = useCallback(() => {
    if (contextMenu.nodeId && !contextMenu.isFolder) {
      const file = getFile(contextMenu.nodeId);
      if (file) {
        const content = file.content;
        const blob = content instanceof Uint8Array
          ? new Blob([content], { type: "application/octet-stream" })
          : new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
    closeContextMenu();
  }, [contextMenu.nodeId, contextMenu.isFolder, getFile, closeContextMenu]);

  const _handleRenameSubmit = useCallback(
    (oldPath: string, newName: string) => {
      if (renameFile) {
        renameFile(oldPath, newName);
      }
      _setRenamingPath(null);
    },
    [renameFile],
  );

  // Handle drag and drop move
  const handleMove = useCallback(
    (args: { dragIds: string[]; parentId: string | null; index: number }) => {
      const { dragIds, parentId } = args;
      // Move each dragged node to the new parent
      const targetDir = parentId || "/";
      for (const dragId of dragIds) {
        moveFile(dragId, targetDir);
      }
    },
    [moveFile],
  );

  return (
    <div
      className="file-explorer"
      ref={containerRef}
      onContextMenu={handleContextMenu}
    >
      <div className="explorer-header">
        <span className="explorer-title">Explorer</span>
        <div className="explorer-actions">
          <button
            className="explorer-action-btn"
            onClick={() => {
              const parentPath = state.selectedPath
                ? findNodeInTree(treeData, state.selectedPath)?.isFolder
                  ? state.selectedPath
                  : getParentPath(state.selectedPath)
                : "/src";
              setNewFileDialog({ open: true, parentPath });
            }}
            title={`New File in ${newFileDialog.parentPath}`}
          >
            +
          </button>
          <button
            className="explorer-action-btn"
            onClick={() => {
              const parentPath = state.selectedPath
                ? findNodeInTree(treeData, state.selectedPath)?.isFolder
                  ? state.selectedPath
                  : getParentPath(state.selectedPath)
                : "/";
              setNewFolderDialog({ open: true, parentPath });
            }}
            title={`New Folder in ${newFolderDialog.parentPath}`}
          >
            +D
          </button>
        </div>
      </div>

      <div className="explorer-tree">
        <Tree<TreeNode>
          ref={treeRef}
          data={treeData}
          openByDefault={false}
          initialOpenState={expandedState}
          onToggle={(id) => handleToggle(id)}
          width="100%"
          height={treeHeight}
          indent={16}
          rowHeight={26}
          selection={state.selectedPath || undefined}
          onSelect={handleSelect}
          onMove={handleMove}
          disableDrag={false}
          disableDrop={(args) => {
            // Only allow dropping on folders
            return args.parentNode !== null && !args.parentNode.data.isFolder;
          }}
        >
          {Node}
        </Tree>
      </div>

      <ContextMenu
        state={contextMenu}
        onClose={closeContextMenu}
        onNewFile={handleNewFile}
        onNewFolder={handleNewFolder}
        onRename={handleRename}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />

      {/* New File Dialog */}
      <NameInputDialog
        isOpen={newFileDialog.open}
        title={`New File in ${newFileDialog.parentPath}`}
        placeholder="filename.c"
        onSubmit={handleNewFileCreate}
        onCancel={() => setNewFileDialog({ open: false, parentPath: "/src" })}
      />

      {/* New Folder Dialog */}
      <NameInputDialog
        isOpen={newFolderDialog.open}
        title={`New Folder in ${newFolderDialog.parentPath}`}
        placeholder="folder-name"
        onSubmit={handleNewFolderCreate}
        onCancel={() => setNewFolderDialog({ open: false, parentPath: "/" })}
      />

      <style jsx>{`
        .file-explorer {
          background: var(--background, #0a0a0a);
          border: 1px solid #333;
          border-radius: 8px;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .explorer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          border-bottom: 1px solid #333;
          background: #111;
        }

        .explorer-title {
          font-weight: 600;
          color: var(--foreground, #ededed);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .explorer-actions {
          display: flex;
          gap: 4px;
        }

        .explorer-action-btn {
          background: transparent;
          border: 1px solid #444;
          color: #888;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          font-family: monospace;
          transition: all 0.15s;
        }

        .explorer-action-btn:hover {
          background: rgba(0, 255, 157, 0.1);
          color: var(--accent-primary, #00ff9d);
          border-color: var(--accent-primary, #00ff9d);
        }

        .explorer-tree {
          flex: 1;
          overflow: auto;
          padding: 4px 0;
        }
      `}</style>
    </div>
  );
}
