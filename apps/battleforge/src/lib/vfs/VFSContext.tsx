"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { VFSState, VFSNode, VFSFile, VFSDirectory } from "./types";
import { createFile, createDirectory, isDirectory, isFile } from "./types";

interface VFSContextType {
  state: VFSState;
  // File operations
  addFile: (
    path: string,
    content: string | Uint8Array,
    editable?: boolean,
  ) => void;
  updateFile: (path: string, content: string | Uint8Array) => void;
  markFileSaved: (path: string) => void;
  deleteFile: (path: string) => void;
  getFile: (path: string) => VFSFile | null;
  renameFile: (oldPath: string, newName: string) => void;
  moveFile: (sourcePath: string, targetDirPath: string) => void;
  // Directory operations
  addDirectory: (path: string) => void;
  deleteDirectory: (path: string) => void;
  toggleDirectory: (path: string) => void;
  // Selection
  selectFile: (path: string | null) => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  // Bulk operations
  addFilesFromMap: (
    files: Map<string, string | Uint8Array>,
    editable?: boolean,
  ) => void;
  clearProject: () => void;
  // Build files for compiler
  getFilesForCompiler: () => Record<string, string | Uint8Array>;
  // Check for unsaved changes
  hasUnsavedChanges: () => boolean;
  // Check if directory exists and has files
  hasDirectory: (path: string) => boolean;
  // Get all editable files for project save
  getEditableFiles: () => Array<{ path: string; content: string }>;
}

const VFSContext = createContext<VFSContextType | undefined>(undefined);

const defaultMakefile = `# BattleForge Makefile
# Auto-generated for STM32 ARM Cortex-M

CC = clang
LD = lld
OBJCOPY = llvm-objcopy

# Target settings (auto-configured by platform selector)
TARGET = --target=thumbv7m-none-eabi
CPU = -mcpu=cortex-m3
THUMB = -mthumb

# Compiler flags
CFLAGS = $(TARGET) $(CPU) $(THUMB) -nostdlib -ffreestanding
CFLAGS += -Os -g -Wall -Wextra

# Include paths (auto-added from platform headers)
INCLUDES = -I/cmsis -I/device -I/libc

# Linker flags
LDFLAGS = -flavor gnu -nostdlib --gc-sections

# Source files
SOURCES = main.c
OBJECTS = $(SOURCES:.c=.o)

# Output
OUTPUT = firmware

.PHONY: all clean

all: $(OUTPUT).elf

%.o: %.c
\t$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

$(OUTPUT).elf: $(OBJECTS) linker.ld
\t$(LD) $(LDFLAGS) --script=linker.ld $(OBJECTS) -o $@

clean:
\trm -f $(OBJECTS) $(OUTPUT).elf
`;

function createInitialState(): VFSState {
  // Start with empty state - files are added when platform is selected
  return {
    root: createDirectory("/", [], true),
    selectedPath: null,
    openFiles: [],
    activeFile: null,
  };
}

export function VFSProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VFSState>(createInitialState);

  const findNode = useCallback(
    (root: VFSDirectory, path: string): VFSNode | null => {
      if (path === "/" || path === "") return root;

      const parts = path.split("/").filter(Boolean);
      let current: VFSNode = root;

      for (const part of parts) {
        if (!isDirectory(current)) return null;
        const child: VFSNode | undefined = current.children.find(
          (c) => c.name === part,
        );
        if (!child) return null;
        current = child;
      }

      return current;
    },
    [],
  );

  const findParentDirectory = useCallback(
    (root: VFSDirectory, path: string): VFSDirectory | null => {
      const parentPath = path.substring(0, path.lastIndexOf("/")) || "/";
      const parent = findNode(root, parentPath);
      return parent && isDirectory(parent) ? parent : null;
    },
    [findNode],
  );

  const updateNodeInTree = useCallback(
    (
      root: VFSDirectory,
      path: string,
      updater: (node: VFSNode) => VFSNode | null,
    ): VFSDirectory => {
      if (path === "/" || path === "") {
        const result = updater(root);
        return result && isDirectory(result) ? result : root;
      }

      const parts = path.split("/").filter(Boolean);
      const fileName = parts.pop()!;

      const updateChildren = (
        dir: VFSDirectory,
        remainingParts: string[],
      ): VFSDirectory => {
        if (remainingParts.length === 0) {
          // We're at the parent directory
          const newChildren = dir.children
            .map((child) => {
              if (child.name === fileName) {
                return updater(child);
              }
              return child;
            })
            .filter((c): c is VFSNode => c !== null);

          return { ...dir, children: newChildren };
        }

        const nextPart = remainingParts[0];
        return {
          ...dir,
          children: dir.children.map((child) => {
            if (child.name === nextPart && isDirectory(child)) {
              return updateChildren(child, remainingParts.slice(1));
            }
            return child;
          }),
        };
      };

      return updateChildren(root, parts);
    },
    [],
  );

  const addFile = useCallback(
    (path: string, content: string | Uint8Array, editable = true) => {
      setState((prev) => {
        const newFile = createFile(path, content, editable);
        const parts = path.split("/").filter(Boolean);

        // Recursively ensure directories exist and add the file
        const addFileRecursive = (
          dir: VFSDirectory,
          pathParts: string[],
          currentPath: string,
        ): VFSDirectory => {
          if (pathParts.length === 0) return dir;

          const part = pathParts[0];
          const fullPath = currentPath + "/" + part;
          const isLastPart = pathParts.length === 1;

          if (isLastPart) {
            // This is the file - add or replace it
            const existingIdx = dir.children.findIndex((c) => c.name === part);
            if (existingIdx >= 0) {
              const newChildren = [...dir.children];
              newChildren[existingIdx] = newFile;
              return { ...dir, children: newChildren };
            }
            return { ...dir, children: [...dir.children, newFile] };
          }

          // This is a directory part - find or create it
          const existingDir = dir.children.find(
            (c) => c.name === part && isDirectory(c),
          );

          if (existingDir && isDirectory(existingDir)) {
            // Directory exists, recurse into it
            return {
              ...dir,
              children: dir.children.map((child) => {
                if (child === existingDir) {
                  return addFileRecursive(
                    existingDir,
                    pathParts.slice(1),
                    fullPath,
                  );
                }
                return child;
              }),
            };
          }

          // Directory doesn't exist, create it and recurse
          const newDir = createDirectory(fullPath, [], false); // Collapsed by default for headers
          const populatedDir = addFileRecursive(
            newDir,
            pathParts.slice(1),
            fullPath,
          );
          return { ...dir, children: [...dir.children, populatedDir] };
        };

        const newRoot = addFileRecursive(prev.root, parts, "");
        return { ...prev, root: newRoot };
      });
    },
    [],
  );

  const updateFile = useCallback(
    (path: string, content: string | Uint8Array) => {
      setState((prev) => {
        const newRoot = updateNodeInTree(prev.root, path, (node) => {
          if (isFile(node)) {
            return { ...node, content, modified: true };
          }
          return node;
        });
        return { ...prev, root: newRoot };
      });
    },
    [updateNodeInTree],
  );

  const markFileSaved = useCallback(
    (path: string) => {
      setState((prev) => {
        const newRoot = updateNodeInTree(prev.root, path, (node) => {
          if (isFile(node)) {
            return { ...node, modified: false };
          }
          return node;
        });
        return { ...prev, root: newRoot };
      });
    },
    [updateNodeInTree],
  );

  const deleteFile = useCallback(
    (path: string) => {
      setState((prev) => {
        const newRoot = updateNodeInTree(prev.root, path, () => null);
        // Close any open files that match or are nested inside the deleted path
        const newOpenFiles = prev.openFiles.filter(
          (f) => f !== path && !f.startsWith(path + "/"),
        );
        const newActiveFile =
          prev.activeFile === path || prev.activeFile?.startsWith(path + "/")
            ? newOpenFiles[0] || null
            : prev.activeFile;
        const newSelectedPath =
          prev.selectedPath === path ||
          prev.selectedPath?.startsWith(path + "/")
            ? null
            : prev.selectedPath;

        return {
          ...prev,
          root: newRoot,
          openFiles: newOpenFiles,
          activeFile: newActiveFile,
          selectedPath: newSelectedPath,
        };
      });
    },
    [updateNodeInTree],
  );

  const getFile = useCallback(
    (path: string): VFSFile | null => {
      const node = findNode(state.root, path);
      return node && isFile(node) ? node : null;
    },
    [state.root, findNode],
  );

  const renameFile = useCallback(
    (oldPath: string, newName: string) => {
      setState((prev) => {
        const node = findNode(prev.root, oldPath);
        if (!node) return prev;

        // Get parent path and build new path
        const parentPath =
          oldPath.substring(0, oldPath.lastIndexOf("/")) || "/";
        const newPath =
          parentPath === "/" ? `/${newName}` : `${parentPath}/${newName}`;

        // Update the node with new name and path
        const newRoot = updateNodeInTree(prev.root, oldPath, (n) => {
          if (isFile(n)) {
            return { ...n, name: newName, path: newPath };
          } else if (isDirectory(n)) {
            return { ...n, name: newName, path: newPath };
          }
          return n;
        });

        // Update openFiles and activeFile if needed
        const newOpenFiles = prev.openFiles.map((f) =>
          f === oldPath ? newPath : f,
        );
        const newActiveFile =
          prev.activeFile === oldPath ? newPath : prev.activeFile;
        const newSelectedPath =
          prev.selectedPath === oldPath ? newPath : prev.selectedPath;

        return {
          ...prev,
          root: newRoot,
          openFiles: newOpenFiles,
          activeFile: newActiveFile,
          selectedPath: newSelectedPath,
        };
      });
    },
    [findNode, updateNodeInTree],
  );

  const moveFile = useCallback(
    (sourcePath: string, targetDirPath: string) => {
      setState((prev) => {
        const sourceNode = findNode(prev.root, sourcePath);
        if (!sourceNode) return prev;

        // Get the target directory
        const targetDir = findNode(prev.root, targetDirPath);
        if (!targetDir || !isDirectory(targetDir)) return prev;

        // Don't move to same location
        const sourceParentPath =
          sourcePath.substring(0, sourcePath.lastIndexOf("/")) || "/";
        if (sourceParentPath === targetDirPath) return prev;

        // Don't move a directory into itself
        if (
          isDirectory(sourceNode) &&
          targetDirPath.startsWith(sourcePath + "/")
        )
          return prev;

        // Build new path
        const newPath =
          targetDirPath === "/"
            ? `/${sourceNode.name}`
            : `${targetDirPath}/${sourceNode.name}`;

        // Helper to recursively update paths in a node
        const updatePaths = (
          node: VFSNode,
          oldBasePath: string,
          newBasePath: string,
        ): VFSNode => {
          const updatedPath = node.path.replace(oldBasePath, newBasePath);
          if (isFile(node)) {
            return { ...node, path: updatedPath };
          } else if (isDirectory(node)) {
            return {
              ...node,
              path: updatedPath,
              children: node.children.map((child) =>
                updatePaths(child, oldBasePath, newBasePath),
              ),
            };
          }
          return node;
        };

        // Update the node with new paths
        const movedNode = updatePaths(sourceNode, sourcePath, newPath);

        // Remove from old location
        const rootAfterRemove = updateNodeInTree(
          prev.root,
          sourcePath,
          () => null,
        );

        // Add to new location
        const addToTarget = (
          dir: VFSDirectory,
          targetPath: string,
        ): VFSDirectory => {
          if (dir.path === targetPath) {
            return { ...dir, children: [...dir.children, movedNode] };
          }
          return {
            ...dir,
            children: dir.children.map((child) => {
              if (isDirectory(child) && targetPath.startsWith(child.path)) {
                return addToTarget(child, targetPath);
              }
              return child;
            }),
          };
        };

        const newRoot = addToTarget(rootAfterRemove, targetDirPath);

        // Update open files and active file paths
        const updatePathRef = (p: string) => {
          if (p === sourcePath || p.startsWith(sourcePath + "/")) {
            return p.replace(sourcePath, newPath);
          }
          return p;
        };

        const newOpenFiles = prev.openFiles.map(updatePathRef);
        const newActiveFile = prev.activeFile
          ? updatePathRef(prev.activeFile)
          : null;
        const newSelectedPath = prev.selectedPath
          ? updatePathRef(prev.selectedPath)
          : null;

        return {
          ...prev,
          root: newRoot,
          openFiles: newOpenFiles,
          activeFile: newActiveFile,
          selectedPath: newSelectedPath,
        };
      });
    },
    [findNode, updateNodeInTree],
  );

  const addDirectory = useCallback((path: string) => {
    setState((prev) => {
      const parts = path.split("/").filter(Boolean);

      const addDirToParent = (
        dir: VFSDirectory,
        pathParts: string[],
        currentPath: string,
      ): VFSDirectory => {
        if (pathParts.length === 0) return dir;

        const part = pathParts[0];
        const fullPath = currentPath + "/" + part;
        const existing = dir.children.find((c) => c.name === part);

        if (existing && isDirectory(existing)) {
          // Continue into existing directory
          return {
            ...dir,
            children: dir.children.map((child) => {
              if (child === existing) {
                return addDirToParent(existing, pathParts.slice(1), fullPath);
              }
              return child;
            }),
          };
        }

        if (!existing) {
          // Create new directory
          const newDir = createDirectory(fullPath, [], true);
          const finalDir = addDirToParent(newDir, pathParts.slice(1), fullPath);
          return { ...dir, children: [...dir.children, finalDir] };
        }

        return dir;
      };

      return { ...prev, root: addDirToParent(prev.root, parts, "") };
    });
  }, []);

  const toggleDirectory = useCallback(
    (path: string) => {
      setState((prev) => {
        const newRoot = updateNodeInTree(prev.root, path, (node) => {
          if (isDirectory(node)) {
            return { ...node, expanded: !node.expanded };
          }
          return node;
        });
        return { ...prev, root: newRoot };
      });
    },
    [updateNodeInTree],
  );

  const deleteDirectory = useCallback(
    (path: string) => {
      setState((prev) => {
        // Remove the directory from the tree
        const newRoot = updateNodeInTree(prev.root, path, () => null);

        // Close any open files that were in the deleted directory
        const newOpenFiles = prev.openFiles.filter(
          (f) => !f.startsWith(path + "/") && f !== path,
        );
        const newActiveFile =
          prev.activeFile &&
          (prev.activeFile.startsWith(path + "/") || prev.activeFile === path)
            ? newOpenFiles[0] || null
            : prev.activeFile;
        const newSelectedPath =
          prev.selectedPath &&
          (prev.selectedPath.startsWith(path + "/") ||
            prev.selectedPath === path)
            ? null
            : prev.selectedPath;

        return {
          ...prev,
          root: newRoot,
          openFiles: newOpenFiles,
          activeFile: newActiveFile,
          selectedPath: newSelectedPath,
        };
      });
    },
    [updateNodeInTree],
  );

  const hasDirectory = useCallback(
    (path: string): boolean => {
      const node = findNode(state.root, path);
      return node !== null && isDirectory(node) && node.children.length > 0;
    },
    [state.root, findNode],
  );

  const selectFile = useCallback((path: string | null) => {
    setState((prev) => ({ ...prev, selectedPath: path }));
  }, []);

  const openFile = useCallback((path: string) => {
    setState((prev) => {
      const newOpenFiles = prev.openFiles.includes(path)
        ? prev.openFiles
        : [...prev.openFiles, path];
      return {
        ...prev,
        openFiles: newOpenFiles,
        activeFile: path,
        selectedPath: path,
      };
    });
  }, []);

  const closeFile = useCallback((path: string) => {
    setState((prev) => {
      const newOpenFiles = prev.openFiles.filter((f) => f !== path);
      const newActiveFile =
        prev.activeFile === path
          ? newOpenFiles[newOpenFiles.length - 1] || null
          : prev.activeFile;
      return { ...prev, openFiles: newOpenFiles, activeFile: newActiveFile };
    });
  }, []);

  const setActiveFile = useCallback((path: string | null) => {
    setState((prev) => ({ ...prev, activeFile: path }));
  }, []);

  const addFilesFromMap = useCallback(
    (files: Map<string, string | Uint8Array>, editable = false) => {
      for (const [path, content] of files) {
        addFile(path, content, editable);
      }
    },
    [addFile],
  );

  const clearProject = useCallback(() => {
    setState(createInitialState());
  }, []);

  const getFilesForCompiler = useCallback((): Record<
    string,
    string | Uint8Array
  > => {
    const files: Record<string, string | Uint8Array> = {};

    const collectFiles = (node: VFSNode) => {
      if (isFile(node)) {
        files[node.path] = node.content;
      } else if (isDirectory(node)) {
        node.children.forEach(collectFiles);
      }
    };

    collectFiles(state.root);
    return files;
  }, [state.root]);

  const hasUnsavedChanges = useCallback((): boolean => {
    const checkModified = (node: VFSNode): boolean => {
      if (isFile(node)) {
        return node.modified === true;
      } else if (isDirectory(node)) {
        return node.children.some(checkModified);
      }
      return false;
    };

    return checkModified(state.root);
  }, [state.root]);

  const getEditableFiles = useCallback((): Array<{ path: string; content: string }> => {
    const editableFiles: Array<{ path: string; content: string }> = [];

    const collectEditableFiles = (node: VFSNode) => {
      if (isFile(node) && node.editable) {
        // Convert Uint8Array to string if needed
        const content = typeof node.content === "string"
          ? node.content
          : new TextDecoder().decode(node.content);
        editableFiles.push({ path: node.path, content });
      } else if (isDirectory(node)) {
        node.children.forEach(collectEditableFiles);
      }
    };

    collectEditableFiles(state.root);
    return editableFiles;
  }, [state.root]);

  return (
    <VFSContext.Provider
      value={{
        state,
        addFile,
        updateFile,
        markFileSaved,
        deleteFile,
        getFile,
        renameFile,
        moveFile,
        addDirectory,
        deleteDirectory,
        toggleDirectory,
        selectFile,
        openFile,
        closeFile,
        setActiveFile,
        addFilesFromMap,
        clearProject,
        getFilesForCompiler,
        hasUnsavedChanges,
        hasDirectory,
        getEditableFiles,
      }}
    >
      {children}
    </VFSContext.Provider>
  );
}

export function useVFS() {
  const context = useContext(VFSContext);
  if (!context) {
    throw new Error("useVFS must be used within VFSProvider");
  }
  return context;
}
