"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { VFSProvider, useVFS } from "../lib/vfs/VFSContext";
import { useProject } from "../lib/project/ProjectContext";
import { ToastProvider, useToast } from "./Toast";

// Hooks
import {
  useResizablePanels,
  useTerminalOutput,
  useToolchainState,
  useCompilerUpdateToast,
} from "../lib/hooks";
import { usePlatform } from "../lib/hooks/usePlatform";
import { useCompiler } from "../lib/hooks/useCompiler";

// Components
import { IDELayout, ToolbarArea } from "./IDELayout";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar, type RightSidebarTab } from "./RightSidebar";
import { MainEditorArea } from "./MainEditorArea";
import { TerminalArea } from "./TerminalArea";
import { ToolbarPanel } from "./ToolbarPanel";
import { PlatformSelectorModal } from "./PlatformSelectorModal";
import { FirstTimeSetupModal } from "./FirstTimeSetupModal";
import { EditProjectModal } from "./EditProjectModal";
import { isBinaryContent } from "./HexViewer";

// Compiler/linker
import { executeClang } from "../lib/compiler/EmscriptenClangLoader";
import { executeLld } from "../lib/compiler/EmscriptenLldLoader";
import { getLibraryManager } from "../lib/library";

// Types
import type { SelectedPlatform } from "../lib/platform/types";
import { getPlatformManager } from "../lib/platform/PlatformManager";
import { withBasePath } from "../lib/utils/basePath";

// Default linker script
const DEFAULT_LINKER_SCRIPT = `
/* Generic ARM Cortex-M Memory Layout */
MEMORY
{
  FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 64K
  RAM (rwx)   : ORIGIN = 0x20000000, LENGTH = 20K
}

ENTRY(Reset_Handler)
_estack = ORIGIN(RAM) + LENGTH(RAM);
_sidata = LOADADDR(.data);

SECTIONS
{
  .isr_vector : {
    . = ALIGN(4);
    KEEP(*(.isr_vector))
    . = ALIGN(4);
  } > FLASH

  .text : {
    . = ALIGN(4);
    *(.text*)
    *(.rodata*)
    . = ALIGN(4);
    _etext = .;
  } > FLASH

  .data : {
    . = ALIGN(4);
    _sdata = .;
    *(.data*)
    . = ALIGN(4);
    _edata = .;
  } > RAM AT > FLASH

  .bss : {
    . = ALIGN(4);
    _sbss = .;
    *(.bss*)
    *(COMMON)
    . = ALIGN(4);
    _ebss = .;
  } > RAM
}
`;

function BattleForgeIDEContent() {
  // VFS and Project context
  const {
    state,
    addFile,
    updateFile,
    markFileSaved,
    getFile,
    getFilesForCompiler,
    openFile,
    hasUnsavedChanges,
    deleteDirectory,
    hasDirectory,
  } = useVFS();
  const {
    currentProject,
    saveProject: saveProjectToStorage,
    closeProject,
  } = useProject();

  // Editor state
  const [editorContent, setEditorContent] = useState("");
  const [projectInitialized, setProjectInitialized] = useState(false);

  // Modal states
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

  // Sidebar tab state
  const [rightSidebarTab, setRightSidebarTab] =
    useState<RightSidebarTab>("platform");

  // Compilation state
  const [isCompiling, setIsCompiling] = useState(false);

  // Auto-load compiler trigger
  const [shouldAutoLoadCompiler, setShouldAutoLoadCompiler] = useState(false);

  // Custom hooks
  const { output, log, setOutput } = useTerminalOutput();
  const { toolchainState, updateToolchainComponent } = useToolchainState();
  const {
    terminalHeight,
    leftSidebarWidth,
    rightSidebarWidth,
    isResizing,
    handleResizeStart,
  } = useResizablePanels();

  // Toast and compiler update notification
  const { showToast } = useToast();
  const openToolchainTab = useCallback(() => {
    setRightSidebarTab("toolchains");
  }, []);
  useCompilerUpdateToast(showToast, openToolchainTab);

  // Compiler hook
  const { compilerReady, isLoading, handleLoadCompiler } = useCompiler({
    onLog: log,
    onToolchainUpdate: updateToolchainComponent,
  });

  // Platform hook - headers loaded callback
  const handleHeadersLoaded = useCallback(
    (headers: Map<string, Uint8Array>) => {
      for (const [headerPath, content] of headers) {
        addFile(headerPath, content, false);
      }
    },
    [addFile]
  );

  const {
    selectedPlatform,
    cachedHeaders,
    headersReady,
    pendingPlatform,
    isSetupModalOpen,
    handlePlatformSelect: platformSelect,
    loadPlatformFromProject,
    handleSetupComplete,
    handleSetupCancel,
    handleLoadHeadersFromSetup,
  } = usePlatform({
    onLog: log,
    onToolchainUpdate: updateToolchainComponent,
    onHeadersLoaded: handleHeadersLoaded,
  });

  // Wrapper for platform select that passes compilerReady
  const handlePlatformSelect = useCallback(
    async (platform: SelectedPlatform | null) => {
      await platformSelect(platform, compilerReady);
    },
    [platformSelect, compilerReady]
  );

  // Initialize from project when it loads
  useEffect(() => {
    if (currentProject && !projectInitialized) {
      // Load project files into VFS
      for (const file of currentProject.files) {
        addFile(file.path, file.content, file.editable);
      }

      // Load build artifacts if present
      if (
        currentProject.buildArtifacts &&
        currentProject.buildArtifacts.length > 0
      ) {
        const fromBase64 = (base64: string): Uint8Array => {
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          return bytes;
        };

        for (const artifact of currentProject.buildArtifacts) {
          const content = fromBase64(artifact.contentBase64);
          addFile(artifact.path, content, false);
        }

        setOutput((prev) => [
          ...prev,
          {
            message: `Loaded ${currentProject.buildArtifacts!.length} build artifact(s)`,
            type: "info",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }

      // Open the first editable file
      const firstEditableFile = currentProject.files.find((f) => f.editable);
      if (firstEditableFile) {
        openFile(firstEditableFile.path);
      }

      // Log project loaded
      const platform = currentProject.platform;
      const platformInfo = platform
        ? `${platform.platformId}/${platform.familyId}/${platform.deviceId}`
        : "none";
      const boardInfo = platform?.boardId || "generic";

      log(
        `Project "${currentProject.metadata.name}" loaded`,
        "success"
      );
      log(
        `  Platform: ${platformInfo} | Board: ${boardInfo} | Arch: ${platform?.architecture || "unknown"}`,
        "info"
      );

      // Trigger auto-load of compiler if project has platform
      if (currentProject.platform) {
        setShouldAutoLoadCompiler(true);
      }

      setProjectInitialized(true);
    }
  }, [currentProject, projectInitialized, addFile, openFile, log, setOutput]);

  // Auto-load compiler when project loads
  useEffect(() => {
    if (shouldAutoLoadCompiler && !compilerReady && !isLoading) {
      setShouldAutoLoadCompiler(false);
      handleLoadCompiler();
    }
  }, [shouldAutoLoadCompiler, compilerReady, isLoading, handleLoadCompiler]);

  // Auto-load headers when compiler is ready and project has a platform
  useEffect(() => {
    if (
      !compilerReady ||
      !currentProject?.platform ||
      cachedHeaders ||
      headersReady ||
      selectedPlatform
    ) {
      return;
    }

    const { platformId, familyId, deviceId } = currentProject.platform;
    loadPlatformFromProject(platformId, familyId, deviceId);
  }, [
    compilerReady,
    currentProject?.platform,
    cachedHeaders,
    headersReady,
    selectedPlatform,
    loadPlatformFromProject,
  ]);

  // Load project-specific library files into VFS
  useEffect(() => {
    async function loadProjectLibraries() {
      const projectLibraries = currentProject?.libraries;
      if (!projectLibraries || projectLibraries.length === 0) {
        return;
      }

      try {
        const libraryManager = getLibraryManager();
        const libraryFiles =
          await libraryManager.getLibraryFilesFor(projectLibraries);

        if (libraryFiles.size > 0) {
          let configTemplatesCopied = 0;
          for (const [path, content] of libraryFiles) {
            addFile(path, content, false);

            const configMatch = path.match(/^\/libs\/[^/]+\/config\/(.+)$/);
            if (configMatch) {
              const configFileName = configMatch[1];
              const userConfigPath = `/src/${configFileName}`;
              if (!getFile(userConfigPath)) {
                addFile(userConfigPath, content, true);
                configTemplatesCopied++;
              }
            }
          }
          log(
            `Loaded ${libraryFiles.size} files for ${projectLibraries.length} project libraries`,
            "info"
          );
          if (configTemplatesCopied > 0) {
            log(
              `Copied ${configTemplatesCopied} config template(s) to /src`,
              "info"
            );
          }
        }
      } catch (err) {
        console.error("[BattleForgeIDE] Failed to load library files:", err);
      }
    }

    loadProjectLibraries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.libraries]);

  // Sync editor content with VFS when active file changes
  useEffect(() => {
    if (state.activeFile) {
      const file = getFile(state.activeFile);
      if (file) {
        if (typeof file.content === "string") {
          setEditorContent(file.content);
        } else if (file.content instanceof Uint8Array) {
          const textContent = new TextDecoder().decode(file.content);
          setEditorContent(textContent);
        }
      }
    }
  }, [state.activeFile, getFile]);

  // Editor change handler
  const handleEditorChange = useCallback((newContent: string) => {
    setEditorContent(newContent);
  }, []);

  // File select handler
  const handleFileSelect = useCallback(
    (_path: string, content: string | Uint8Array) => {
      if (typeof content === "string") {
        setEditorContent(content);
      } else if (content instanceof Uint8Array) {
        const textContent = new TextDecoder().decode(content);
        setEditorContent(textContent);
      }
    },
    []
  );

  // Get files for intellisense
  const getFilesForIntellisense = useCallback(() => {
    const files = new Map<
      string,
      { content: string | Uint8Array; readOnly?: boolean }
    >();

    type VFSNode = typeof state.root | (typeof state.root.children)[0];

    function traverse(node: VFSNode) {
      if (node.type === "file") {
        files.set(node.path, {
          content: node.content,
          readOnly: !node.editable,
        });
      } else if (node.type === "directory") {
        for (const child of node.children) {
          traverse(child);
        }
      }
    }

    traverse(state.root);
    return files;
  }, [state]);

  // Load startup file for v2 platforms
  const loadStartupFile = async (): Promise<Uint8Array | null> => {
    if (!selectedPlatform) {
      return null;
    }

    try {
      const platformManager = getPlatformManager();
      const startupFile = await platformManager.loadStartupFile(
        selectedPlatform.platformId,
        selectedPlatform.family.id,
        selectedPlatform.device.id
      );
      if (startupFile) {
        log(`Loaded startup file from platform sources`, "info");
      }
      return startupFile;
    } catch (err) {
      console.warn("[BattleForge] Failed to load startup file:", err);
      return null;
    }
  };

  // Load system file for v2 platforms (e.g., system_stm32f1xx.c)
  const loadSystemFile = async (): Promise<Uint8Array | null> => {
    if (!selectedPlatform) {
      return null;
    }

    try {
      const platformManager = getPlatformManager();
      const systemFile = await platformManager.loadSystemFile(
        selectedPlatform.platformId,
        selectedPlatform.family.id,
        selectedPlatform.device.id
      );
      if (systemFile) {
        log(`Loaded system file from platform sources`, "info");
      }
      return systemFile;
    } catch (err) {
      console.warn("[BattleForge] Failed to load system file:", err);
      return null;
    }
  };

  // Load platform linker script (supports v2 GitHub sources)
  const loadPlatformLinkerScript = async (): Promise<string> => {
    if (!selectedPlatform) {
      return DEFAULT_LINKER_SCRIPT;
    }

    try {
      const { family, device } = selectedPlatform;
      const platformManager = getPlatformManager();

      // Try v2-aware loading through PlatformManager (fetches from GitHub for v2 manifests)
      try {
        const linkerScript = await platformManager.loadLinkerScript(
          selectedPlatform.platformId,
          family.id,
          device.linkerScript,
          device.id
        );
        log(`Loaded linker script from platform sources`, "info");
        return linkerScript;
      } catch (v2Error) {
        console.warn("[BattleForge] V2 linker script load failed:", v2Error);
      }

      // Fallback: try direct URL fetch
      const linkerUrl = withBasePath(`/boards/platforms/${selectedPlatform.platformId}/${family.id}/linker/${device.linkerScript}`);
      const response = await fetch(linkerUrl);
      if (!response.ok) {
        log(
          `Warning: Could not load linker script from ${linkerUrl}, using default`,
          "warning"
        );
        return DEFAULT_LINKER_SCRIPT;
      }
      return await response.text();
    } catch (err) {
      log(`Warning: Failed to load linker script: ${err}`, "warning");
      return DEFAULT_LINKER_SCRIPT;
    }
  };

  // Compile handler
  const handleCompile = async () => {
    if (!compilerReady) {
      log("Compiler not ready yet. Please wait...", "warning");
      return;
    }

    if (isCompiling) {
      log("Compilation already in progress", "warning");
      return;
    }

    setIsCompiling(true);
    log("Starting compilation...", "info");

    try {
      const defaultFlags = [
        "--target=thumbv7m-none-eabi",
        "-mcpu=cortex-m3",
        "-mthumb",
        "-nostdlib",
        "-nostdinc",  // Don't search Clang's built-in include paths (not available in WASM)
        "-ffreestanding",
      ];

      const platformFlags =
        selectedPlatform?.family.compilerFlags || defaultFlags;
      const archName = selectedPlatform?.family.architecture || "cortex-m3";

      const headers = cachedHeaders;
      const vfsFiles = getFilesForCompiler();
      const files: Record<string, string | Uint8Array> = { ...vfsFiles };

      files["/main.c"] = editorContent;

      if (headers) {
        for (const [path, content] of headers) {
          files[path] = content;
        }
      }

      // Load startup file for v2 platforms
      const startupFile = await loadStartupFile();
      if (startupFile) {
        files["/startup.s"] = startupFile;
        log(`Loaded startup file (${startupFile.length} bytes)`, "info");
      }

      // Load system file for v2 platforms (e.g., system_stm32f1xx.c)
      const systemFile = await loadSystemFile();
      if (systemFile) {
        files["/system.c"] = systemFile;
        log(`Loaded system file (${systemFile.length} bytes)`, "info");
      }

      // Add minimal C runtime stubs for -nostdlib
      // These are required by the startup code but not provided by -nostdlib
      const crtStubs = `
/* Minimal C runtime stubs for bare-metal ARM */

/* Called by startup code to initialize C++ global constructors */
/* We provide an empty implementation since we're not using C++ globals */
void __libc_init_array(void) {
    /* Empty - no C++ constructors to call in pure C code */
}

/* Optional: newlib/libc may need this */
void _init(void) {
    /* Empty */
}

void _fini(void) {
    /* Empty */
}
`;
      files["/crt_stubs.c"] = crtStubs;

      const includePaths: string[] = [];
      if (headers) {
        const dirs = new Set<string>();
        for (const path of headers.keys()) {
          const dir = path.substring(0, path.lastIndexOf("/"));
          if (dir) dirs.add(dir);
        }
        for (const dir of dirs) {
          includePaths.push(`-I${dir}`);
        }
      }

      includePaths.push("-I/src");
      includePaths.push("-I/include"); // Freestanding libc headers (stdint.h, etc)
      const userDirs = new Set<string>();
      for (const path of Object.keys(vfsFiles)) {
        if (path.endsWith(".h")) {
          const dir = path.substring(0, path.lastIndexOf("/"));
          if (
            dir &&
            dir !== "/src" &&
            !dir.startsWith("/cmsis") &&
            !dir.startsWith("/device") &&
            !dir.startsWith("/libc")
          ) {
            userDirs.add(dir);
          }
        }
      }
      for (const dir of userDirs) {
        includePaths.push(`-I${dir}`);
      }

      const libraryManager = getLibraryManager();
      const libraryFiles = await libraryManager.getAllLibraryFiles();
      const libraryIncludePaths = await libraryManager.getIncludePaths();

      for (const [path, content] of libraryFiles) {
        files[path] = content;
      }

      for (const libPath of libraryIncludePaths) {
        includePaths.push(libPath);
      }

      if (libraryFiles.size > 0) {
        log(`Including ${libraryFiles.size} library files`, "info");
      }

      const defines: string[] = [];
      if (selectedPlatform?.device.defines) {
        for (const def of selectedPlatform.device.defines) {
          defines.push(`-D${def}`);
        }
      }

      const userSourceFiles: string[] = [];
      for (const path of Object.keys(vfsFiles)) {
        if (
          path.endsWith(".c") &&
          !path.startsWith("/cmsis") &&
          !path.startsWith("/device") &&
          !path.startsWith("/libc")
        ) {
          userSourceFiles.push(path);
        }
      }

      const librarySourceFiles: string[] = [];
      for (const path of libraryFiles.keys()) {
        if (
          path.endsWith(".c") ||
          path.endsWith(".cpp") ||
          path.endsWith(".cc")
        ) {
          librarySourceFiles.push(path);
        }
      }

      // Add platform source files (startup, system, crt stubs)
      const platformSourceFiles: string[] = [];
      if (startupFile) {
        platformSourceFiles.push("/startup.s");
      }
      if (systemFile) {
        platformSourceFiles.push("/system.c");
      }
      // Always add CRT stubs for -nostdlib builds
      platformSourceFiles.push("/crt_stubs.c");

      const allSourceFiles = [...userSourceFiles, ...librarySourceFiles, ...platformSourceFiles];

      log(
        `Step 1: Compiling ${userSourceFiles.length} user + ${librarySourceFiles.length} library + ${platformSourceFiles.length} platform source file(s) for ARM ${archName}...`,
        "info"
      );
      if (includePaths.length > 0) {
        log(`Include paths: ${includePaths.join(" ")}`, "info");
      }
      if (defines.length > 0) {
        log(`Defines: ${defines.join(" ")}`, "info");
      }

      const objectFiles: Map<string, Uint8Array> = new Map();

      for (const srcPath of allSourceFiles) {
        const srcFileName = srcPath.substring(srcPath.lastIndexOf("/") + 1);
        const objFileName = srcFileName.replace(/\.(c|cpp|cc|s|S)$/, ".o");
        const objPath = srcPath.startsWith("/libs/")
          ? `/build/libs_${srcFileName.replace(/\.(c|cpp|cc|s|S)$/, ".o")}`
          : `/build/${objFileName}`;

        const compileFiles = { ...files };
        if (srcPath === state.activeFile || srcPath === "/src/main.c") {
          compileFiles[srcPath] = editorContent;
        }

        const compileArgs = [
          ...platformFlags,
          ...includePaths,
          ...defines,
          "-c",
          srcPath,
          "-o",
          objPath,
        ];

        log(`Compiling ${srcPath}...`, "info");

        const compileResult = await executeClang(
          compileArgs,
          compileFiles,
          (text) => {
            if (text.trim()) log(text.trim(), "info");
          },
          (text) => {
            if (text.trim()) log(text.trim(), "warning");
          }
        );

        if (!compileResult.success) {
          log(
            `Compilation of ${srcPath} failed with exit code ${compileResult.exitCode}`,
            "error"
          );
          if (compileResult.stderr) {
            compileResult.stderr.split("\n").forEach((line) => {
              if (line.trim()) log(line, "error");
            });
          }
          return;
        }

        const objFile = compileResult.outputFiles?.get(objPath);
        if (!objFile) {
          log(
            `Compilation of ${srcPath} completed but no object file generated`,
            "error"
          );
          return;
        }

        objectFiles.set(objPath, objFile);
        log(
          `Compiled ${srcPath} -> ${objPath} (${objFile.length} bytes)`,
          "success"
        );

        addFile(objPath, objFile, false);
      }

      if (objectFiles.size === 0) {
        log("No source files compiled", "error");
        return;
      }

      log(
        `Compilation successful! ${objectFiles.size} object file(s)`,
        "success"
      );

      log("Step 2: Linking with LLD...", "info");

      const linkerScript = await loadPlatformLinkerScript();
      if (selectedPlatform) {
        log(
          `Using linker script: ${selectedPlatform.device.linkerScript}`,
          "info"
        );
      }

      const objPaths = Array.from(objectFiles.keys());
      const linkArgs = [
        "-flavor",
        "gnu",
        "-nostdlib",
        "--gc-sections",
        "--script=/linker.ld",
        ...objPaths,
        "-o",
        "/firmware.elf",
      ];

      const linkFiles: Record<string, string | Uint8Array> = {
        "/linker.ld": linkerScript,
      };
      for (const [objPath, objData] of objectFiles) {
        linkFiles[objPath] = objData;
      }

      log(
        `Linking ${objPaths.length} object file(s): ${objPaths.join(", ")}`,
        "info"
      );

      const linkResult = await executeLld(
        linkArgs,
        linkFiles,
        (text) => {
          if (text.trim()) log(text.trim(), "info");
        },
        (text) => {
          if (text.trim()) log(text.trim(), "warning");
        }
      );

      if (!linkResult.success) {
        log(`Linking failed with exit code ${linkResult.exitCode}`, "error");
        if (linkResult.stderr) {
          linkResult.stderr.split("\n").forEach((line) => {
            if (line.trim()) log(line, "error");
          });
        }
        return;
      }

      const elfFile = linkResult.outputFiles?.get("/firmware.elf");
      if (!elfFile) {
        log("Linking completed but no ELF file generated", "error");
        return;
      }

      log(`Linking successful! (${elfFile.length} bytes)`, "success");

      addFile("/build/firmware.elf", elfFile, false);

      const elfMagic = Array.from(elfFile.slice(0, 4))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");
      log(`Firmware ELF: /firmware.elf (ELF magic: ${elfMagic})`, "info");
      log("Build complete! Ready for flashing.", "success");

      // Save build artifacts to project storage
      if (currentProject) {
        try {
          const buildArtifacts: Array<{
            path: string;
            contentBase64: string;
            size: number;
            timestamp: number;
          }> = [];
          const timestamp = Date.now();

          const toBase64 = (data: Uint8Array): string => {
            let binary = "";
            for (let i = 0; i < data.length; i++) {
              binary += String.fromCharCode(data[i]);
            }
            return btoa(binary);
          };

          for (const [objPath, objData] of objectFiles) {
            buildArtifacts.push({
              path: objPath,
              contentBase64: toBase64(objData),
              size: objData.length,
              timestamp,
            });
          }

          buildArtifacts.push({
            path: "/build/firmware.elf",
            contentBase64: toBase64(elfFile),
            size: elfFile.length,
            timestamp,
          });

          await saveProjectToStorage({ buildArtifacts });
          log("Build artifacts saved to project", "info");
        } catch (error) {
          console.error("Failed to save build artifacts:", error);
        }
      }
    } catch (error) {
      log(
        `Build error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
    } finally {
      setIsCompiling(false);
    }
  };

  // Flash handler (placeholder)
  const handleFlash = async () => {
    log("Flash operation not yet implemented", "warning");
    log("Will support UART bootloader protocols for various MCUs", "info");
  };

  // Save handler
  const handleSave = useCallback(async () => {
    if (state.activeFile && currentProject) {
      const file = getFile(state.activeFile);
      if (file) {
        updateFile(state.activeFile, editorContent);
        markFileSaved(state.activeFile);

        const updatedFiles = currentProject.files.map((f) => {
          if (f.path === state.activeFile) {
            return { ...f, content: editorContent };
          }
          return f;
        });

        const fileExists = currentProject.files.some(
          (f) => f.path === state.activeFile
        );
        if (!fileExists && file.editable) {
          updatedFiles.push({
            path: state.activeFile,
            content: editorContent,
            editable: true,
          });
        }

        try {
          await saveProjectToStorage({ files: updatedFiles });
          log(`Saved ${state.activeFile}`, "success");
        } catch (error) {
          log(`Failed to save: ${error}`, "error");
        }
      }
    }
  }, [
    state.activeFile,
    editorContent,
    getFile,
    updateFile,
    markFileSaved,
    log,
    currentProject,
    saveProjectToStorage,
  ]);

  // Check if current file has unsaved modifications
  const canSave = useMemo(() => {
    if (!state.activeFile) return false;
    const file = getFile(state.activeFile);
    if (!file || !file.editable) return false;

    const vfsContent =
      typeof file.content === "string"
        ? file.content
        : new TextDecoder().decode(file.content);

    return editorContent !== vfsContent;
  }, [state.activeFile, editorContent, getFile]);

  // Check if active file is binary
  const activeFileIsBinary = useMemo(() => {
    if (!state.activeFile) return false;
    const file = getFile(state.activeFile);
    if (!file) return false;
    return isBinaryContent(file.content, state.activeFile);
  }, [state.activeFile, getFile]);

  // Check if there are build artifacts
  const hasBuildArtifacts = useMemo(() => {
    return hasDirectory("/build");
  }, [hasDirectory]);

  // Clean build artifacts
  const handleClean = useCallback(async () => {
    if (!hasDirectory("/build")) {
      log("No build artifacts to clean", "info");
      return;
    }

    deleteDirectory("/build");

    if (currentProject) {
      try {
        await saveProjectToStorage({ buildArtifacts: [] });
      } catch (error) {
        console.error("Failed to clear build artifacts from storage:", error);
      }
    }

    log("Build cleaned", "success");
  }, [
    hasDirectory,
    deleteDirectory,
    currentProject,
    saveProjectToStorage,
    log,
  ]);

  // Get binary content for hex viewer
  const binaryContent = useMemo(() => {
    if (!activeFileIsBinary || !state.activeFile) return null;
    const file = getFile(state.activeFile);
    if (!file) return null;

    if (file.content instanceof Uint8Array) {
      return file.content;
    }
    return new TextEncoder().encode(file.content);
  }, [activeFileIsBinary, state.activeFile, getFile]);

  // Handle Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (canSave) {
          handleSave();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canSave, handleSave]);

  // Warn when leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges() || canSave) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, canSave]);

  // Library files changed handler
  const handleLibraryFilesChanged = useCallback(
    (files: Map<string, Uint8Array>) => {
      let configTemplatesCopied = 0;
      for (const [path, content] of files) {
        addFile(path, content, false);

        const configMatch = path.match(/^\/libs\/[^/]+\/config\/(.+)$/);
        if (configMatch) {
          const configFileName = configMatch[1];
          const userConfigPath = `/src/${configFileName}`;
          addFile(userConfigPath, content, true);
          configTemplatesCopied++;
        }
      }
      log(`Added ${files.size} library files to /libs`, "success");
      if (configTemplatesCopied > 0) {
        log(
          `Copied ${configTemplatesCopied} config template(s) to /src - customize as needed`,
          "info"
        );
      }
    },
    [addFile, log]
  );

  // Library uninstalled handler
  const handleLibraryUninstalled = useCallback(
    (name: string) => {
      const libPath = `/libs/${name}`;
      deleteDirectory(libPath);
      log(`Removed ${name} from /libs`, "info");
    },
    [deleteDirectory, log]
  );

  return (
    <IDELayout
      leftSidebarWidth={leftSidebarWidth}
      rightSidebarWidth={rightSidebarWidth}
    >
      {/* Toolbar */}
      <ToolbarArea>
        <ToolbarPanel
          onLoadCompiler={handleLoadCompiler}
          onCompile={handleCompile}
          onClean={handleClean}
          onFlash={handleFlash}
          onSave={handleSave}
          onCloseProject={closeProject}
          onEditProject={() => setIsEditProjectModalOpen(true)}
          isLoading={isLoading}
          compilerReady={compilerReady}
          canSave={canSave}
          hasBuildArtifacts={hasBuildArtifacts}
        />
      </ToolbarArea>

      {/* Left sidebar - File Explorer */}
      <LeftSidebar
        width={leftSidebarWidth}
        isResizing={isResizing}
        onResizeStart={handleResizeStart}
        onFileSelect={handleFileSelect}
      />

      {/* Right sidebar - Platform, Libraries, Toolchains */}
      <RightSidebar
        width={rightSidebarWidth}
        isResizing={isResizing}
        onResizeStart={handleResizeStart}
        selectedPlatform={selectedPlatform}
        projectPlatform={currentProject?.platform}
        toolchainState={toolchainState}
        onPlatformClick={() => setIsPlatformModalOpen(true)}
        onLog={log}
        onLibraryFilesChanged={handleLibraryFilesChanged}
        onLibraryUninstalled={handleLibraryUninstalled}
        activeTab={rightSidebarTab}
        onTabChange={setRightSidebarTab}
      />

      {/* Main editor area */}
      <MainEditorArea
        activeFile={state.activeFile}
        editorContent={editorContent}
        isActiveFileBinary={activeFileIsBinary}
        binaryContent={binaryContent}
        onEditorChange={handleEditorChange}
        onGetStarted={() => setIsPlatformModalOpen(true)}
        getVFSFiles={getFilesForIntellisense}
      />

      {/* Terminal */}
      <TerminalArea
        height={terminalHeight}
        isResizing={isResizing}
        onResizeStart={handleResizeStart}
        output={output}
      />

      {/* Platform Selector Modal */}
      <PlatformSelectorModal
        isOpen={isPlatformModalOpen}
        onClose={() => setIsPlatformModalOpen(false)}
        onSelect={handlePlatformSelect}
        currentSelection={selectedPlatform}
      />

      {/* First Time Setup Modal */}
      {pendingPlatform && (
        <FirstTimeSetupModal
          isOpen={isSetupModalOpen}
          platform={pendingPlatform}
          onComplete={handleSetupComplete}
          onCancel={handleSetupCancel}
          onLoadCompiler={handleLoadCompiler}
          onLoadHeaders={handleLoadHeadersFromSetup}
          compilerReady={compilerReady}
          headersReady={headersReady}
          compilerProgress={toolchainState.clang}
          headersProgress={toolchainState.headers}
        />
      )}

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
      />
    </IDELayout>
  );
}

export function BattleForgeIDE() {
  return (
    <ToastProvider>
      <VFSProvider>
        <BattleForgeIDEContent />
      </VFSProvider>
    </ToastProvider>
  );
}
