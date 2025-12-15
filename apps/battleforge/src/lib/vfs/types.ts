/**
 * Virtual Filesystem Types
 * Represents files and directories in the WASM VFS
 */

export interface VFSFile {
  path: string;
  name: string;
  content: string | Uint8Array;
  type: "file";
  editable: boolean;
  modified: boolean;
  language?:
    | "c"
    | "cpp"
    | "h"
    | "ino"
    | "makefile"
    | "ld"
    | "asm"
    | "text"
    | "binary";
}

export interface VFSDirectory {
  path: string;
  name: string;
  type: "directory";
  expanded: boolean;
  children: (VFSFile | VFSDirectory)[];
}

export type VFSNode = VFSFile | VFSDirectory;

export interface VFSState {
  root: VFSDirectory;
  selectedPath: string | null;
  openFiles: string[];
  activeFile: string | null;
}

export function isDirectory(node: VFSNode): node is VFSDirectory {
  return node.type === "directory";
}

export function isFile(node: VFSNode): node is VFSFile {
  return node.type === "file";
}

export function getLanguageFromPath(path: string): VFSFile["language"] {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "c":
      return "c";
    case "cpp":
    case "cc":
    case "cxx":
      return "cpp";
    case "ino":
    case "pde": // Legacy Arduino extension
      return "ino";
    case "h":
    case "hpp":
      return "h";
    case "mk":
      return "makefile";
    case "ld":
      return "ld";
    case "s":
    case "asm":
      return "asm";
    case "o":
    case "elf":
    case "bin":
    case "hex":
      return "binary";
    default:
      if (path.toLowerCase().includes("makefile")) {
        return "makefile";
      }
      return "text";
  }
}

export function createFile(
  path: string,
  content: string | Uint8Array,
  editable = true,
): VFSFile {
  const name = path.split("/").pop() || path;
  return {
    path,
    name,
    content,
    type: "file",
    editable,
    modified: false,
    language: getLanguageFromPath(path),
  };
}

export function createDirectory(
  path: string,
  children: VFSNode[] = [],
  expanded = false,
): VFSDirectory {
  const name = path.split("/").filter(Boolean).pop() || "/";
  return {
    path,
    name,
    type: "directory",
    expanded,
    children,
  };
}
