'use client';

import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { Tree, NodeRendererProps, TreeApi, NodeApi } from 'react-arborist';
import { useVFS } from '../lib/vfs/VFSContext';
import type { VFSNode } from '../lib/vfs/types';
import { isDirectory, isFile } from '../lib/vfs/types';

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
    case 'c': return { bg: '#649ad2', label: 'C' };
    case 'cpp': return { bg: '#9b4f96', label: 'C++' };
    case 'h': return { bg: '#00ff9d', label: 'H' };
    case 'makefile': return { bg: '#ff9800', label: 'M' };
    case 'ld': return { bg: '#795548', label: 'LD' };
    case 'asm': return { bg: '#607d8b', label: 'S' };
    case 'binary': return { bg: '#0088ff', label: 'B' };
    case 'o': return { bg: '#666', label: 'O' };
    case 'elf': return { bg: '#c084fc', label: 'ELF' };
    default: return { bg: '#444', label: 'T' };
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
      className={`tree-node ${node.isSelected ? 'selected' : ''} ${node.data.modified ? 'modified' : ''} ${isReadOnly ? 'readonly' : ''}`}
      onClick={() => node.isInternal ? node.toggle() : node.select()}
    >
      {node.data.isFolder ? (
        <>
          <span className="folder-arrow">{node.isOpen ? '▼' : '▶'}</span>
          <span className="folder-icon">{node.isOpen ? '📂' : '📁'}</span>
        </>
      ) : (
        <span className="file-icon" style={{ background: icon?.bg }}>{icon?.label}</span>
      )}
      <span className="node-name">{node.data.name}</span>
      {node.data.modified && <span className="modified-dot" />}
      {isReadOnly && <span className="readonly-badge">R</span>}

      <style jsx>{`
        .tree-node {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          cursor: pointer;
          color: var(--foreground, #ededed);
          font-size: 0.85rem;
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
          font-size: 0.9rem;
        }

        .file-icon {
          font-size: 0.65rem;
          font-weight: bold;
          padding: 1px 3px;
          border-radius: 2px;
          min-width: 18px;
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
  onDelete
}: {
  state: ContextMenuState;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
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

// Input dialog for naming files/folders
function NameInputDialog({
  isOpen,
  title,
  placeholder,
  initialValue,
  onSubmit,
  onCancel
}: {
  isOpen: boolean;
  title: string;
  placeholder: string;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue || '');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value.trim());
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="name-dialog-overlay" onClick={onCancel}>
      <div className="name-dialog" onClick={e => e.stopPropagation()}>
        <h3 className="dialog-title">{title}</h3>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="dialog-input"
        />
        <div className="dialog-buttons">
          <button className="dialog-btn cancel" onClick={onCancel}>Cancel</button>
          <button
            className="dialog-btn confirm"
            onClick={() => value.trim() && onSubmit(value.trim())}
            disabled={!value.trim()}
          >
            Create
          </button>
        </div>

        <style jsx>{`
          .name-dialog-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .name-dialog {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 20px;
            min-width: 300px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          }

          .dialog-title {
            margin: 0 0 16px 0;
            font-size: 1rem;
            color: #fff;
          }

          .dialog-input {
            width: 100%;
            background: #0a0a0a;
            border: 1px solid #444;
            border-radius: 4px;
            color: var(--foreground, #ededed);
            padding: 10px 12px;
            font-size: 0.9rem;
            outline: none;
            margin-bottom: 16px;
          }

          .dialog-input:focus {
            border-color: var(--accent-primary, #00ff9d);
          }

          .dialog-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }

          .dialog-btn {
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.15s;
          }

          .dialog-btn.cancel {
            background: transparent;
            border: 1px solid #444;
            color: #888;
          }

          .dialog-btn.cancel:hover {
            border-color: #666;
            color: #fff;
          }

          .dialog-btn.confirm {
            background: var(--accent-primary, #00ff9d);
            border: none;
            color: #000;
            font-weight: 600;
          }

          .dialog-btn.confirm:hover:not(:disabled) {
            filter: brightness(1.1);
          }

          .dialog-btn.confirm:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </div>
  );
}

// Rename input component (inline)
function RenameInput({
  initialValue,
  onSubmit,
  onCancel
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
    if (e.key === 'Enter') {
      onSubmit(value);
    } else if (e.key === 'Escape') {
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
        background: '#0a0a0a',
        border: '1px solid var(--accent-primary, #00ff9d)',
        borderRadius: '3px',
        color: 'var(--foreground, #ededed)',
        padding: '4px 8px',
        fontSize: '0.85rem',
        width: '100%',
        outline: 'none',
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
  } = useVFS();

  const treeRef = useRef<TreeApi<TreeNode>>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null,
    isFolder: false,
    isEditable: true,
  });
  const [renamingPath, setRenamingPath] = useState<string | null>(null);

  // Dialog state for new file/folder
  const [newFileDialog, setNewFileDialog] = useState<{ open: boolean; parentPath: string }>({
    open: false,
    parentPath: '/src'
  });
  const [newFolderDialog, setNewFolderDialog] = useState<{ open: boolean; parentPath: string }>({
    open: false,
    parentPath: '/'
  });

  // Convert VFS to tree data
  const treeData = useMemo(() => {
    return state.root.children.map(vfsToTreeData);
  }, [state.root]);

  const handleSelect = useCallback((nodes: NodeApi<TreeNode>[]) => {
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
  }, [selectFile, openFile, getFile, onFileSelect]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    // Find the node that was right-clicked
    const target = e.target as HTMLElement;
    const nodeElement = target.closest('.tree-node');
    const nodeId = nodeElement?.getAttribute('data-node-id') || state.selectedPath;

    // Get node info if we have a path
    let isFolder = false;
    let isEditable = true;

    if (nodeId) {
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
  }, [state.selectedPath, getFile]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const handleNewFile = useCallback(() => {
    const parentPath = contextMenu.nodeId && contextMenu.isFolder
      ? contextMenu.nodeId
      : '/src';
    setNewFileDialog({ open: true, parentPath });
    closeContextMenu();
  }, [contextMenu, closeContextMenu]);

  const handleNewFileCreate = useCallback((fileName: string) => {
    const { parentPath } = newFileDialog;
    // Add .c extension if no extension provided
    const finalName = fileName.includes('.') ? fileName : `${fileName}.c`;
    const path = `${parentPath}/${finalName}`;
    addFile(path, '', true);
    selectFile(path);
    openFile(path);
    setNewFileDialog({ open: false, parentPath: '/src' });
  }, [newFileDialog, addFile, selectFile, openFile]);

  const handleNewFolder = useCallback(() => {
    const parentPath = contextMenu.nodeId && contextMenu.isFolder
      ? contextMenu.nodeId
      : '/';
    setNewFolderDialog({ open: true, parentPath });
    closeContextMenu();
  }, [contextMenu, closeContextMenu]);

  const handleNewFolderCreate = useCallback((folderName: string) => {
    const { parentPath } = newFolderDialog;
    const path = parentPath === '/' ? `/${folderName}` : `${parentPath}/${folderName}`;
    addDirectory(path);
    setNewFolderDialog({ open: false, parentPath: '/' });
  }, [newFolderDialog, addDirectory]);

  const handleRename = useCallback(() => {
    if (contextMenu.nodeId) {
      setRenamingPath(contextMenu.nodeId);
    }
    closeContextMenu();
  }, [contextMenu.nodeId, closeContextMenu]);

  const handleDelete = useCallback(() => {
    if (contextMenu.nodeId) {
      deleteFile(contextMenu.nodeId);
    }
    closeContextMenu();
  }, [contextMenu.nodeId, deleteFile, closeContextMenu]);

  const handleRenameSubmit = useCallback((oldPath: string, newName: string) => {
    if (renameFile) {
      renameFile(oldPath, newName);
    }
    setRenamingPath(null);
  }, [renameFile]);

  return (
    <div className="file-explorer" onContextMenu={handleContextMenu}>
      <div className="explorer-header">
        <span className="explorer-title">Explorer</span>
        <div className="explorer-actions">
          <button
            className="explorer-action-btn"
            onClick={() => setNewFileDialog({ open: true, parentPath: '/src' })}
            title="New File"
          >
            +
          </button>
          <button
            className="explorer-action-btn"
            onClick={() => setNewFolderDialog({ open: true, parentPath: '/' })}
            title="New Folder"
          >
            +D
          </button>
        </div>
      </div>

      <div className="explorer-tree">
        <Tree<TreeNode>
          ref={treeRef}
          data={treeData}
          openByDefault={true}
          width="100%"
          height={600}
          indent={16}
          rowHeight={28}
          selection={state.selectedPath || undefined}
          onSelect={handleSelect}
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
      />

      {/* New File Dialog */}
      <NameInputDialog
        isOpen={newFileDialog.open}
        title="New File"
        placeholder="filename.c"
        onSubmit={handleNewFileCreate}
        onCancel={() => setNewFileDialog({ open: false, parentPath: '/src' })}
      />

      {/* New Folder Dialog */}
      <NameInputDialog
        isOpen={newFolderDialog.open}
        title="New Folder"
        placeholder="folder-name"
        onSubmit={handleNewFolderCreate}
        onCancel={() => setNewFolderDialog({ open: false, parentPath: '/' })}
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
