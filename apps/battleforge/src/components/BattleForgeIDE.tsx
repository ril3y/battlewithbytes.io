"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
import { WasmPackageManager } from "./WasmPackageManager";
import { isBinaryContent } from "./HexViewer";

// Compiler/linker
import { executeClang, getCompilerArchForPlatform, type CompilerArch } from "../lib/compiler/EmscriptenClangLoader";
import { executeLld } from "../lib/compiler/EmscriptenLldLoader";
import { getLibraryManager } from "../lib/library";

// Types
import type { SelectedPlatform } from "../lib/platform/types";
import { getPlatformManager } from "../lib/platform/PlatformManager";

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
    getEditableFiles,
  } = useVFS();
  const {
    currentProject,
    saveProject: saveProjectToStorage,
    closeProject,
  } = useProject();

  // Editor state
  const [editorContent, setEditorContent] = useState("");
  const [projectInitialized, setProjectInitialized] = useState(false);

  // Track previous active file to save content when switching files
  const previousActiveFileRef = useRef<string | null>(null);
  const editorContentRef = useRef<string>("");

  // Modal states
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isWasmToolsOpen, setIsWasmToolsOpen] = useState(false);

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
  // Also save previous file's content before loading new file
  useEffect(() => {
    // Save previous file's content to VFS before switching
    const prevFile = previousActiveFileRef.current;
    if (prevFile && editorContentRef.current) {
      const prevFileData = getFile(prevFile);
      // Only save if the file is editable (user files, not headers)
      if (prevFileData?.editable) {
        const prevContent = typeof prevFileData.content === "string"
          ? prevFileData.content
          : new TextDecoder().decode(prevFileData.content);
        // Only update if content actually changed
        if (editorContentRef.current !== prevContent) {
          updateFile(prevFile, editorContentRef.current);
        }
      }
    }

    // Load new file's content
    if (state.activeFile) {
      const file = getFile(state.activeFile);
      if (file) {
        let content: string;
        if (typeof file.content === "string") {
          content = file.content;
        } else {
          content = new TextDecoder().decode(file.content);
        }
        setEditorContent(content);
        editorContentRef.current = content;
      }
    }

    // Update the ref to current active file
    previousActiveFileRef.current = state.activeFile;
  }, [state.activeFile, getFile, updateFile]);

  // Editor change handler - also updates ref for access in effects
  const handleEditorChange = useCallback((newContent: string) => {
    setEditorContent(newContent);
    editorContentRef.current = newContent;
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

  // Load platform linker script (generated from memory/linker config)
  const loadPlatformLinkerScript = async (): Promise<string> => {
    if (!selectedPlatform) {
      return DEFAULT_LINKER_SCRIPT;
    }

    try {
      const { family, device } = selectedPlatform;
      const platformManager = getPlatformManager();

      // Load linker script through PlatformManager
      // This will generate from memory/linker config if available,
      // or fall back to fetching from GitHub sources, or generate a default
      const linkerScript = await platformManager.loadLinkerScript(
        selectedPlatform.platformId,
        family.id,
        device.linkerScript || "",
        device.id
      );
      log(`Loaded linker script for ${device.name}`, "info");
      return linkerScript;
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

    // Auto-save current editor content to VFS before compiling
    if (state.activeFile && editorContentRef.current) {
      const currentFile = getFile(state.activeFile);
      if (currentFile?.editable) {
        const currentContent = typeof currentFile.content === "string"
          ? currentFile.content
          : new TextDecoder().decode(currentFile.content);
        if (editorContentRef.current !== currentContent) {
          updateFile(state.activeFile, editorContentRef.current);
          log(`Auto-saved ${state.activeFile}`, "info");
        }
      }
    }

    try {
      const defaultFlags = [
        "--target=thumbv7m-none-eabi",
        "-mcpu=cortex-m3",
        "-mthumb",
        "-nostdlib",
        "-nostdinc",  // Don't search Clang's built-in include paths (not available in WASM)
        "-ffreestanding",
      ];

      // Detect if this is an Arduino project
      const isArduino = currentProject?.platform?.frameworkId === "arduino";

      // Determine compiler architecture based on platform
      const compilerArch: CompilerArch = currentProject?.platform?.platformId
        ? getCompilerArchForPlatform(currentProject.platform.platformId)
        : "arm";

      let platformFlags =
        selectedPlatform?.family.compilerFlags || defaultFlags;

      // For Arduino projects, remove -nostdinc to allow Clang's built-in headers (stdint.h, etc.)
      if (isArduino) {
        platformFlags = platformFlags.filter(flag => flag !== "-nostdinc");
        // Suppress C++17 register keyword warnings from STM32 HAL driver files
        // Suppress macro redefined warnings (cached framework config may have __GNUC__ defines)
        // Override NULL to 0 for C++ (Clang's built-in stddef.h defines NULL as (void*)0 which doesn't
        // implicitly convert to other pointer types in C++, unlike literal 0 which is a null pointer constant)
        platformFlags = [...platformFlags, "-Wno-register", "-Wno-macro-redefined", "-DNULL=0"];
      }

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
#include <stddef.h>

/* Called by startup code to initialize C++ global constructors */
void __libc_init_array(void) {}

/* Optional: newlib/libc may need this */
void _init(void) {}
void _fini(void) {}

/* Memory allocation stubs - simple bump allocator */
static char _heap[8192];
static size_t _heap_ptr = 0;

void *malloc(size_t size) {
    size = (size + 7) & ~7;  /* Align to 8 bytes */
    if (_heap_ptr + size > sizeof(_heap)) return (void*)0;
    void *p = &_heap[_heap_ptr];
    _heap_ptr += size;
    return p;
}

void *calloc(size_t n, size_t size) {
    size_t total = n * size;
    void *p = malloc(total);
    if (p) {
        char *c = (char*)p;
        for (size_t i = 0; i < total; i++) c[i] = 0;
    }
    return p;
}

void *realloc(void *ptr, size_t size) {
    void *p = malloc(size);
    /* Note: Simple allocator doesn't support true realloc */
    return p;
}

void free(void *ptr) {
    /* Simple bump allocator doesn't free */
    (void)ptr;
}

/* Exception handling stubs - required when C++ exceptions are disabled */
void *__gxx_personality_v0;
void *__cxa_begin_catch(void *e) { (void)e; return (void*)0; }
void __cxa_end_catch(void) {}

/* C++ terminate handler */
void _ZSt9terminatev(void) { while(1); }  /* std::terminate() mangled name */

/* Standard I/O stubs */
typedef struct { int dummy; } FILE;
static FILE _stderr_file = {0};
FILE *stderr = &_stderr_file;

int vfprintf(FILE *f, const char *fmt, __builtin_va_list ap) {
    (void)f; (void)fmt; (void)ap;
    return 0;
}

int fprintf(FILE *f, const char *fmt, ...) {
    (void)f; (void)fmt;
    return 0;
}

/* ARM EABI helper functions */
void __aeabi_memclr4(void *dest, size_t n) {
    char *d = (char*)dest;
    while (n--) *d++ = 0;
}

void __aeabi_memclr8(void *dest, size_t n) {
    char *d = (char*)dest;
    while (n--) *d++ = 0;
}

void __aeabi_memclr(void *dest, size_t n) {
    char *d = (char*)dest;
    while (n--) *d++ = 0;
}

void __aeabi_memset4(void *dest, size_t n, int c) {
    char *d = (char*)dest;
    while (n--) *d++ = (char)c;
}

void __aeabi_memset8(void *dest, size_t n, int c) {
    char *d = (char*)dest;
    while (n--) *d++ = (char)c;
}

void __aeabi_memset(void *dest, size_t n, int c) {
    char *d = (char*)dest;
    while (n--) *d++ = (char)c;
}

void *__aeabi_memcpy4(void *dest, const void *src, size_t n) {
    char *d = (char*)dest;
    const char *s = (const char*)src;
    while (n--) *d++ = *s++;
    return dest;
}

void *__aeabi_memcpy8(void *dest, const void *src, size_t n) {
    char *d = (char*)dest;
    const char *s = (const char*)src;
    while (n--) *d++ = *s++;
    return dest;
}

void *__aeabi_memcpy(void *dest, const void *src, size_t n) {
    char *d = (char*)dest;
    const char *s = (const char*)src;
    while (n--) *d++ = *s++;
    return dest;
}
`;
      files["/crt_stubs.c"] = crtStubs;

      // C++ ABI stubs for RTTI (required when using C++ with -fno-rtti)
      // Even with -fno-rtti, some code may reference typeinfo symbols
      // Note: Arduino core provides __cxa_pure_virtual and operator delete in abi.cpp/new.cpp
      // Key: Destructors must be OUT-OF-LINE to emit vtables (key function requirement)
      const cxxabiStubs = `
/* C++ ABI stubs for bare-metal ARM builds */
/* These provide minimal RTTI implementations when RTTI is disabled */
/* Note: Arduino core already provides __cxa_pure_virtual and operator delete */
/* IMPORTANT: Destructors defined out-of-line to force vtable emission */

namespace __cxxabiv1 {
    // Base class type info
    class __class_type_info {
    public:
        virtual ~__class_type_info();
    };
    // Out-of-line destructor to force vtable emission
    __class_type_info::~__class_type_info() {}

    // Single inheritance class type info
    class __si_class_type_info : public __class_type_info {
    public:
        virtual ~__si_class_type_info();
    };
    __si_class_type_info::~__si_class_type_info() {}

    // Virtual multiple inheritance class type info
    class __vmi_class_type_info : public __class_type_info {
    public:
        virtual ~__vmi_class_type_info();
    };
    __vmi_class_type_info::~__vmi_class_type_info() {}

    // Fundamental type info
    class __fundamental_type_info : public __class_type_info {
    public:
        virtual ~__fundamental_type_info();
    };
    __fundamental_type_info::~__fundamental_type_info() {}

    // Pointer type info
    class __pointer_type_info : public __class_type_info {
    public:
        virtual ~__pointer_type_info();
    };
    __pointer_type_info::~__pointer_type_info() {}
}
`;
      files["/cxxabi_stubs.cpp"] = cxxabiStubs;

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
      const inoFiles: string[] = [];

      for (const path of Object.keys(vfsFiles)) {
        // Skip platform/SDK directories
        if (
          path.startsWith("/cmsis") ||
          path.startsWith("/device") ||
          path.startsWith("/libc")
        ) {
          continue;
        }

        // Detect source files by extension
        if (path.endsWith(".c") || path.endsWith(".cpp") || path.endsWith(".cc")) {
          userSourceFiles.push(path);
        } else if (path.endsWith(".ino")) {
          inoFiles.push(path);
        }
      }

      // Arduino preprocessing: convert .ino files to .cpp
      if (isArduino && inoFiles.length > 0) {
        const { ArduinoPreprocessor } = await import("../lib/compiler/ArduinoPreprocessor");
        const preprocessor = new ArduinoPreprocessor();

        // Collect .ino file contents
        const inoContents = new Map<string, string>();
        for (const inoPath of inoFiles) {
          const fileName = inoPath.substring(inoPath.lastIndexOf("/") + 1);
          const fileData = vfsFiles[inoPath];
          const content = typeof fileData === "string"
            ? fileData
            : new TextDecoder().decode(fileData as Uint8Array);
          inoContents.set(fileName, content);
        }

        // Combine and preprocess .ino files
        const combinedIno = preprocessor.combineSketchFiles(inoContents);
        const result = preprocessor.preprocess(combinedIno);

        // Add preprocessed files to build
        files["/build/sketch.cpp"] = result.code;
        files["/build/main.cpp"] = result.mainFile;
        userSourceFiles.push("/build/sketch.cpp", "/build/main.cpp");

        // Log preprocessing results
        log(`Preprocessed ${inoFiles.length} .ino file(s) to sketch.cpp + main.cpp`, "info");
        if (result.warnings.length > 0) {
          for (const warning of result.warnings) {
            log(`Arduino warning: ${warning}`, "warning");
          }
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
      // Arduino projects use the Arduino core for startup, not platform startup files
      const platformSourceFiles: string[] = [];
      if (!isArduino) {
        if (startupFile) {
          platformSourceFiles.push("/startup.s");
        }
        if (systemFile) {
          platformSourceFiles.push("/system.c");
        }
        // Always add CRT stubs for -nostdlib builds
        platformSourceFiles.push("/crt_stubs.c");
      } else {
        log("Arduino project: using Arduino core instead of platform startup files", "info");
        // Arduino still needs CRT and C++ ABI stubs for some symbols
        platformSourceFiles.push("/crt_stubs.c");
        platformSourceFiles.push("/cxxabi_stubs.cpp");
      }

      // Load Arduino framework core files if this is an Arduino project
      const arduinoCoreSourceFiles: string[] = [];
      if (isArduino && currentProject?.platform) {
        const { platformId, familyId, deviceId } = currentProject.platform;

        try {
          const { frameworkManager } = await import("../lib/framework/FrameworkManager");

          // Try to load Arduino framework definition
          const framework = await frameworkManager.loadFramework("arduino", platformId, familyId);

          if (framework && framework.coreUrl && framework.coreChecksum) {
            log("Loading Arduino core files...", "info");

            // Download and cache Arduino core files
            const coreFiles = await frameworkManager.loadCoreFiles(
              framework,
              platformId,
              familyId,
              (progress) => {
                log(`Arduino core: ${progress.message}`, "info");
              }
            );

            // Add core files to VFS
            // The tar.gz contains files with a root directory like "arduino-stm32f1-2.8.1/" or "arduino-esp32-3.3.5/"
            // We need to strip this to get paths like "/cores/arduino/Arduino.h"
            for (const [corePath, content] of coreFiles) {
              // Strip root directory (e.g., "/arduino-stm32f1-2.8.1/cores/..." -> "/cores/...")
              // Pattern matches: arduino-{platform}-{version}/ or arduino-{platform}/
              let normalizedPath = corePath;
              const pathMatch = corePath.match(/^\/arduino-[^/]+\/(.*)/);
              if (pathMatch) {
                normalizedPath = "/" + pathMatch[1];
              }
              const vfsPath = `/framework/arduino${normalizedPath}`;
              files[vfsPath] = content;

              // Add source files to compilation
              // IMPORTANT: Exclude source files that are included via #include by SrcWrapper files
              // These should NOT be compiled directly as separate object files:
              // - system/Drivers/.../Src/ - HAL/LL driver sources (included by SrcWrapper/src/HAL/*.c)
              // - system/STM32F1xx/ - system init sources (included by SrcWrapper/src/stm32/system_stm32yyxx.c)
              const isSystemSource = corePath.includes("/system/");
              if ((corePath.endsWith(".c") || corePath.endsWith(".cpp") || corePath.endsWith(".cc")) && !isSystemSource) {
                arduinoCoreSourceFiles.push(vfsPath);
              }
            }

            log(`Loaded ${coreFiles.size} Arduino core files (${arduinoCoreSourceFiles.length} source files)`, "info");

            // Add Arduino include paths (from framework definition)
            if (framework.includePaths) {
              for (const path of framework.includePaths) {
                // Replace ${DEVICE} with actual device ID
                const resolvedPath = path.replace("${DEVICE}", deviceId.toUpperCase());
                includePaths.push(`-I/framework/arduino${resolvedPath}`);
              }
            }

            // Ensure SrcWrapper inc directory is included (for clock.h, dwt.h)
            // This is a fallback until arduino.json is updated on GitHub
            if (
              !includePaths.some((p) =>
                p.includes("/libraries/SrcWrapper/inc")
              )
            ) {
              includePaths.push("-I/framework/arduino/libraries/SrcWrapper/inc");
            }

            // Ensure system/STM32F1xx is included (for stm32f1xx_hal_conf.h)
            if (
              !includePaths.some((p) =>
                p.includes("/system/STM32F1xx")
              )
            ) {
              includePaths.push("-I/framework/arduino/system/STM32F1xx");
            }

            // Ensure HAL source directory is included (SrcWrapper uses #include "stm32f1xx_hal.c")
            if (
              !includePaths.some((p) =>
                p.includes("STM32F1xx_HAL_Driver/Src")
              )
            ) {
              includePaths.push("-I/framework/arduino/system/Drivers/STM32F1xx_HAL_Driver/Src");
            }

            // Ensure SrcWrapper/inc/LL directory is included (lock_resource.h includes stm32yyxx_ll_hsem.h)
            if (
              !includePaths.some((p) =>
                p.includes("SrcWrapper/inc/LL")
              )
            ) {
              includePaths.push("-I/framework/arduino/libraries/SrcWrapper/inc/LL");
            }

            // Ensure variant folder with correct path (T-U suffix) is included
            if (
              !includePaths.some((p) =>
                p.includes("F103C8T_F103CB(T-U)")
              )
            ) {
              // Replace old variant path with correct one
              const idx = includePaths.findIndex((p) =>
                p.includes("F103C8T_F103CB") && !p.includes("(T-U)")
              );
              if (idx >= 0) {
                includePaths[idx] = "-I/framework/arduino/variants/STM32F1xx/F103C8T_F103CB(T-U)";
              } else {
                includePaths.push("-I/framework/arduino/variants/STM32F1xx/F103C8T_F103CB(T-U)");
              }
            }

            // Add Arduino defines
            if (framework.defines) {
              for (const def of framework.defines) {
                defines.push(`-D${def}`);
              }
            }

            // Override platform compiler flags with framework-specific flags
            // This is critical for ESP32 which needs Xtensa-specific flags instead of ARM flags
            if (framework.compilerFlags && framework.compilerFlags.length > 0) {
              platformFlags = framework.compilerFlags;
              // Still add warning suppressions for Arduino
              platformFlags = [...platformFlags, "-Wno-register", "-Wno-macro-redefined", "-DNULL=0"];
              log(`Using framework compiler flags: ${framework.compilerFlags.join(" ")}`, "info");
            }

            // Ensure the board-specific define is present for generic_clock.c to compile SystemClock_Config
            // This matches the #if guard in variants/STM32F1xx/F103C8T_F103CB(T-U)/generic_clock.c
            if (!defines.some((d) => d.includes("ARDUINO_GENERIC_F103C8TX"))) {
              defines.push("-DARDUINO_GENERIC_F103C8TX");
            }

            // Ensure VARIANT_H is defined (for variant.h to include correct file)
            if (!defines.some((d) => d.includes("VARIANT_H"))) {
              defines.push('-DVARIANT_H="variant_generic.h"');
            }
          } else {
            log("Arduino framework not available for this platform - building without core", "warning");
          }
        } catch (frameworkError) {
          log(`Warning: Could not load Arduino framework: ${frameworkError}`, "warning");
          log("Building without Arduino core files - sketch may fail to link", "warning");
        }

        // Add minimal libc headers for Arduino builds
        // Arduino core expects full libc (newlib), but we provide minimal stubs
        const minimalLibcHeaders: Record<string, string> = {
          "/libc/stddef.h": `#ifndef _STDDEF_H
#define _STDDEF_H
typedef __SIZE_TYPE__ size_t;
typedef __PTRDIFF_TYPE__ ptrdiff_t;
#ifdef __cplusplus
typedef decltype(nullptr) nullptr_t;
#define NULL nullptr
#else
#define NULL ((void *)0)
typedef __WCHAR_TYPE__ wchar_t;
#endif
#define offsetof(type, member) __builtin_offsetof(type, member)
#endif
`,
          "/libc/avr/dtostrf.h": `#ifndef _AVR_DTOSTRF_H
#define _AVR_DTOSTRF_H
#ifdef __cplusplus
extern "C" {
#endif
char *dtostrf(double val, signed char width, unsigned char prec, char *sout);
#ifdef __cplusplus
}
#endif
#endif
`,
          "/libc/avr/pgmspace.h": `#ifndef _AVR_PGMSPACE_H_
#define _AVR_PGMSPACE_H_
/* AVR pgmspace compatibility for ARM - all memory is directly accessible */
#include <stdint.h>
#include <stddef.h>

#define PROGMEM
#define PGM_P const char *
#define PGM_VOID_P const void *
#define PSTR(s) (s)

#define pgm_read_byte(addr)   (*(const uint8_t *)(addr))
#define pgm_read_word(addr)   (*(const uint16_t *)(addr))
#define pgm_read_dword(addr)  (*(const uint32_t *)(addr))
#define pgm_read_float(addr)  (*(const float *)(addr))
#define pgm_read_ptr(addr)    (*(const void * const *)(addr))

#define pgm_read_byte_near(addr)  pgm_read_byte(addr)
#define pgm_read_word_near(addr)  pgm_read_word(addr)
#define pgm_read_dword_near(addr) pgm_read_dword(addr)
#define pgm_read_float_near(addr) pgm_read_float(addr)
#define pgm_read_ptr_near(addr)   pgm_read_ptr(addr)

#define pgm_read_byte_far(addr)   pgm_read_byte(addr)
#define pgm_read_word_far(addr)   pgm_read_word(addr)
#define pgm_read_dword_far(addr)  pgm_read_dword(addr)
#define pgm_read_float_far(addr)  pgm_read_float(addr)
#define pgm_read_ptr_far(addr)    pgm_read_ptr(addr)

#define memcpy_P(dest, src, n) memcpy(dest, src, n)
#define strcpy_P(dest, src) strcpy(dest, src)
#define strncpy_P(dest, src, n) strncpy(dest, src, n)
#define strcat_P(dest, src) strcat(dest, src)
#define strncat_P(dest, src, n) strncat(dest, src, n)
#define strcmp_P(s1, s2) strcmp(s1, s2)
#define strncmp_P(s1, s2, n) strncmp(s1, s2, n)
#define strcasecmp_P(s1, s2) strcasecmp(s1, s2)
#define strncasecmp_P(s1, s2, n) strncasecmp(s1, s2, n)
#define strlen_P(s) strlen(s)
#define strnlen_P(s, n) strnlen(s, n)
#define strstr_P(s1, s2) strstr(s1, s2)
#define sprintf_P(s, fmt, ...) sprintf(s, fmt, ##__VA_ARGS__)
#define snprintf_P(s, n, fmt, ...) snprintf(s, n, fmt, ##__VA_ARGS__)
#define vsnprintf_P(s, n, fmt, ap) vsnprintf(s, n, fmt, ap)
#endif
`,
          "/libc/stdarg.h": `#ifndef _STDARG_H
#define _STDARG_H
typedef __builtin_va_list va_list;
#define va_start(ap, param) __builtin_va_start(ap, param)
#define va_end(ap) __builtin_va_end(ap)
#define va_arg(ap, type) __builtin_va_arg(ap, type)
#define va_copy(dest, src) __builtin_va_copy(dest, src)
#endif
`,
          "/libc/inttypes.h": `#ifndef _INTTYPES_H
#define _INTTYPES_H
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
/* Format specifiers for printf/scanf - these work on 32-bit ARM */
#define PRId8  "d"
#define PRId16 "d"
#define PRId32 "d"
#define PRId64 "lld"
#define PRIi8  "i"
#define PRIi16 "i"
#define PRIi32 "i"
#define PRIi64 "lli"
#define PRIu8  "u"
#define PRIu16 "u"
#define PRIu32 "u"
#define PRIu64 "llu"
#define PRIx8  "x"
#define PRIx16 "x"
#define PRIx32 "x"
#define PRIx64 "llx"
#define PRIX8  "X"
#define PRIX16 "X"
#define PRIX32 "X"
#define PRIX64 "llX"
#define PRIo8  "o"
#define PRIo16 "o"
#define PRIo32 "o"
#define PRIo64 "llo"
/* Scan format specifiers */
#define SCNd8  "hhd"
#define SCNd16 "hd"
#define SCNd32 "d"
#define SCNd64 "lld"
#define SCNu8  "hhu"
#define SCNu16 "hu"
#define SCNu32 "u"
#define SCNu64 "llu"
#define SCNx8  "hhx"
#define SCNx16 "hx"
#define SCNx32 "x"
#define SCNx64 "llx"
/* intmax_t and uintmax_t */
typedef long long intmax_t;
typedef unsigned long long uintmax_t;
intmax_t imaxabs(intmax_t j);
typedef struct { intmax_t quot; intmax_t rem; } imaxdiv_t;
imaxdiv_t imaxdiv(intmax_t numer, intmax_t denom);
intmax_t strtoimax(const char *nptr, char **endptr, int base);
uintmax_t strtoumax(const char *nptr, char **endptr, int base);
#ifdef __cplusplus
}
#endif
#endif
`,
          "/libc/stdlib.h": `#ifndef _STDLIB_H
#define _STDLIB_H
#include "stddef.h"
#ifdef __cplusplus
extern "C" {
#endif
void *malloc(size_t size);
void *calloc(size_t nmemb, size_t size);
void *realloc(void *ptr, size_t size);
void free(void *ptr);
int atoi(const char *nptr);
long atol(const char *nptr);
long long atoll(const char *nptr);
double atof(const char *nptr);
long strtol(const char *nptr, char **endptr, int base);
unsigned long strtoul(const char *nptr, char **endptr, int base);
long long strtoll(const char *nptr, char **endptr, int base);
unsigned long long strtoull(const char *nptr, char **endptr, int base);
double strtod(const char *nptr, char **endptr);
int abs(int j);
long labs(long j);
void abort(void);
void exit(int status);
int rand(void);
void srand(unsigned int seed);
void qsort(void *base, size_t nmemb, size_t size, int (*compar)(const void *, const void *));
void *bsearch(const void *key, const void *base, size_t nmemb, size_t size, int (*compar)(const void *, const void *));
#define RAND_MAX 2147483647
#define EXIT_SUCCESS 0
#define EXIT_FAILURE 1
#ifdef __cplusplus
}
#endif
#endif
`,
          "/libc/string.h": `#ifndef _STRING_H
#define _STRING_H
#include "stddef.h"
#ifdef __cplusplus
extern "C" {
#endif
void *memcpy(void *dest, const void *src, size_t n);
void *memmove(void *dest, const void *src, size_t n);
void *memset(void *s, int c, size_t n);
int memcmp(const void *s1, const void *s2, size_t n);
void *memchr(const void *s, int c, size_t n);
char *strcpy(char *dest, const char *src);
char *strncpy(char *dest, const char *src, size_t n);
char *strcat(char *dest, const char *src);
char *strncat(char *dest, const char *src, size_t n);
int strcmp(const char *s1, const char *s2);
int strncmp(const char *s1, const char *s2, size_t n);
int strcasecmp(const char *s1, const char *s2);
int strncasecmp(const char *s1, const char *s2, size_t n);
size_t strlen(const char *s);
size_t strnlen(const char *s, size_t maxlen);
char *strchr(const char *s, int c);
char *strrchr(const char *s, int c);
char *strstr(const char *haystack, const char *needle);
char *strdup(const char *s);
char *strtok(char *str, const char *delim);
char *strerror(int errnum);
// Inline implementations for embedded systems
static inline size_t __strlen(const char *s) {
  const char *p = s;
  while (*p) p++;
  return p - s;
}
#define strlen(s) __strlen(s)
static inline void *__memcpy(void *dest, const void *src, size_t n) {
  char *d = (char *)dest;
  const char *s = (const char *)src;
  while (n--) *d++ = *s++;
  return dest;
}
#define memcpy(d, s, n) __memcpy(d, s, n)
static inline void *__memset(void *s, int c, size_t n) {
  char *p = (char *)s;
  while (n--) *p++ = (char)c;
  return s;
}
#define memset(s, c, n) __memset(s, c, n)
static inline int __memcmp(const void *s1, const void *s2, size_t n) {
  const unsigned char *p1 = (const unsigned char *)s1;
  const unsigned char *p2 = (const unsigned char *)s2;
  while (n--) {
    if (*p1 != *p2) return *p1 - *p2;
    p1++; p2++;
  }
  return 0;
}
#define memcmp(s1, s2, n) __memcmp(s1, s2, n)
static inline int __strcmp(const char *s1, const char *s2) {
  while (*s1 && *s1 == *s2) { s1++; s2++; }
  return *(unsigned char *)s1 - *(unsigned char *)s2;
}
#define strcmp(s1, s2) __strcmp(s1, s2)
static inline int __strncmp(const char *s1, const char *s2, size_t n) {
  while (n && *s1 && *s1 == *s2) { s1++; s2++; n--; }
  return n ? *(unsigned char *)s1 - *(unsigned char *)s2 : 0;
}
#define strncmp(s1, s2, n) __strncmp(s1, s2, n)
static inline char *__strcpy(char *dest, const char *src) {
  char *d = dest;
  while ((*d++ = *src++));
  return dest;
}
#define strcpy(d, s) __strcpy(d, s)
static inline char *__strncpy(char *dest, const char *src, size_t n) {
  char *d = dest;
  while (n && (*d++ = *src++)) n--;
  while (n--) *d++ = 0;
  return dest;
}
#define strncpy(d, s, n) __strncpy(d, s, n)
#ifdef __cplusplus
}
#endif
#endif
`,
          "/libc/stdio.h": `#ifndef _STDIO_H
#define _STDIO_H
#include "stddef.h"
#include "stdarg.h"
#ifdef __cplusplus
extern "C" {
#endif
typedef struct _FILE FILE;
extern FILE *stdin;
extern FILE *stdout;
extern FILE *stderr;
#define EOF (-1)
int printf(const char *format, ...);
int sprintf(char *str, const char *format, ...);
int snprintf(char *str, size_t size, const char *format, ...);
int vprintf(const char *format, va_list ap);
int vsprintf(char *str, const char *format, va_list ap);
int vsnprintf(char *str, size_t size, const char *format, va_list ap);
int fprintf(FILE *stream, const char *format, ...);
int vfprintf(FILE *stream, const char *format, va_list ap);
int sscanf(const char *str, const char *format, ...);
int puts(const char *s);
int putchar(int c);
int getchar(void);
int fflush(FILE *stream);
int dprintf(int fd, const char *format, ...);
int vdprintf(int fd, const char *format, va_list ap);
#ifdef __cplusplus
}
#endif
#endif
`,
          "/libc/unistd.h": `#ifndef _UNISTD_H
#define _UNISTD_H
#include "stddef.h"
#ifdef __cplusplus
extern "C" {
#endif
typedef int ssize_t;
typedef int pid_t;
typedef unsigned int uid_t;
typedef unsigned int gid_t;
typedef int off_t;

ssize_t read(int fd, void *buf, size_t count);
ssize_t write(int fd, const void *buf, size_t count);
int close(int fd);
off_t lseek(int fd, off_t offset, int whence);
int usleep(unsigned int usec);
unsigned int sleep(unsigned int seconds);
pid_t getpid(void);
int isatty(int fd);

#define STDIN_FILENO  0
#define STDOUT_FILENO 1
#define STDERR_FILENO 2
#define SEEK_SET 0
#define SEEK_CUR 1
#define SEEK_END 2
#ifdef __cplusplus
}
#endif
#endif
`,
          "/libc/ctype.h": `#ifndef _CTYPE_H
#define _CTYPE_H
#ifdef __cplusplus
extern "C" {
#endif
int isalnum(int c);
int isalpha(int c);
int isblank(int c);
int iscntrl(int c);
int isdigit(int c);
int isgraph(int c);
int islower(int c);
int isprint(int c);
int ispunct(int c);
int isspace(int c);
int isupper(int c);
int isxdigit(int c);
int tolower(int c);
int toupper(int c);
#ifdef __cplusplus
}
#endif
#endif
`,
          "/libc/math.h": `#ifndef _MATH_H
#define _MATH_H
#ifdef __cplusplus
extern "C" {
#endif
#define M_PI 3.14159265358979323846
#define M_E 2.71828182845904523536
#define INFINITY (__builtin_inff())
#define NAN (__builtin_nanf(""))
double sin(double x);
double cos(double x);
double tan(double x);
double asin(double x);
double acos(double x);
double atan(double x);
double atan2(double y, double x);
double sinh(double x);
double cosh(double x);
double tanh(double x);
double exp(double x);
double log(double x);
double log10(double x);
double pow(double x, double y);
double sqrt(double x);
double ceil(double x);
double floor(double x);
double fabs(double x);
double fmod(double x, double y);
double round(double x);
double trunc(double x);
float sinf(float x);
float cosf(float x);
float tanf(float x);
float sqrtf(float x);
float fabsf(float x);
float powf(float x, float y);
float floorf(float x);
float ceilf(float x);
float roundf(float x);
float truncf(float x);
int isnan(double x);
int isinf(double x);
int isfinite(double x);
#ifdef __cplusplus
}
#endif
#endif
`,
          "/libc/errno.h": `#ifndef _ERRNO_H
#define _ERRNO_H
#ifdef __cplusplus
extern "C" {
#endif
extern int errno;
#define EPERM 1
#define ENOENT 2
#define ESRCH 3
#define EINTR 4
#define EIO 5
#define ENXIO 6
#define ENOEXEC 8
#define EBADF 9
#define ENOMEM 12
#define EACCES 13
#define EFAULT 14
#define EBUSY 16
#define EEXIST 17
#define ENODEV 19
#define ENOTDIR 20
#define EISDIR 21
#define EINVAL 22
#define ENFILE 23
#define EMFILE 24
#define ENOTTY 25
#define EFBIG 27
#define ENOSPC 28
#define ESPIPE 29
#define EROFS 30
#define EPIPE 32
#define EDOM 33
#define ERANGE 34
#define EAGAIN 35
#define EWOULDBLOCK EAGAIN
#define ETIMEDOUT 110
#ifdef __cplusplus
}
#endif
#endif
`,
          "/libc/time.h": `#ifndef _TIME_H
#define _TIME_H
#include "stddef.h"
#ifdef __cplusplus
extern "C" {
#endif
typedef long time_t;
typedef long clock_t;
struct tm {
  int tm_sec;
  int tm_min;
  int tm_hour;
  int tm_mday;
  int tm_mon;
  int tm_year;
  int tm_wday;
  int tm_yday;
  int tm_isdst;
};
time_t time(time_t *tloc);
clock_t clock(void);
double difftime(time_t time1, time_t time0);
struct tm *gmtime(const time_t *timep);
struct tm *localtime(const time_t *timep);
time_t mktime(struct tm *tm);
size_t strftime(char *s, size_t max, const char *format, const struct tm *tm);
#define CLOCKS_PER_SEC 1000000L
#ifdef __cplusplus
}
#endif
#endif
`,
          // C++ STL minimal stubs for Arduino
          "/libc/algorithm": `#ifndef _ALGORITHM_
#define _ALGORITHM_
namespace std {
  template<class T> const T& min(const T& a, const T& b) { return (b < a) ? b : a; }
  template<class T> const T& max(const T& a, const T& b) { return (a < b) ? b : a; }
  template<class T> T&& move(T& t) { return static_cast<T&&>(t); }
  template<class T> T&& forward(T& t) { return static_cast<T&&>(t); }
  template<class T> void swap(T& a, T& b) { T tmp = a; a = b; b = tmp; }
  template<class T> T* addressof(T& arg) { return &arg; }
}
#endif
`,
          "/libc/type_traits": `#ifndef _TYPE_TRAITS_
#define _TYPE_TRAITS_
namespace std {
  template<class T, T v> struct integral_constant { static constexpr T value = v; typedef T value_type; };
  typedef integral_constant<bool, true> true_type;
  typedef integral_constant<bool, false> false_type;
  template<class T> struct remove_reference { typedef T type; };
  template<class T> struct remove_reference<T&> { typedef T type; };
  template<class T> struct remove_reference<T&&> { typedef T type; };
  template<class T> struct remove_const { typedef T type; };
  template<class T> struct remove_const<const T> { typedef T type; };
  template<class T> struct remove_volatile { typedef T type; };
  template<class T> struct remove_volatile<volatile T> { typedef T type; };
  template<class T> struct remove_cv { typedef typename remove_volatile<typename remove_const<T>::type>::type type; };
  template<class T> struct is_integral : false_type {};
  template<> struct is_integral<bool> : true_type {};
  template<> struct is_integral<char> : true_type {};
  template<> struct is_integral<signed char> : true_type {};
  template<> struct is_integral<unsigned char> : true_type {};
  template<> struct is_integral<short> : true_type {};
  template<> struct is_integral<unsigned short> : true_type {};
  template<> struct is_integral<int> : true_type {};
  template<> struct is_integral<unsigned int> : true_type {};
  template<> struct is_integral<long> : true_type {};
  template<> struct is_integral<unsigned long> : true_type {};
  template<> struct is_integral<long long> : true_type {};
  template<> struct is_integral<unsigned long long> : true_type {};
  template<class T> struct is_floating_point : false_type {};
  template<> struct is_floating_point<float> : true_type {};
  template<> struct is_floating_point<double> : true_type {};
  template<> struct is_floating_point<long double> : true_type {};
  template<class T> struct is_arithmetic : integral_constant<bool, is_integral<T>::value || is_floating_point<T>::value> {};
  template<bool B, class T = void> struct enable_if {};
  template<class T> struct enable_if<true, T> { typedef T type; };
  template<bool B, class T, class F> struct conditional { typedef T type; };
  template<class T, class F> struct conditional<false, T, F> { typedef F type; };
  template<class T> struct is_void : false_type {};
  template<> struct is_void<void> : true_type {};
  template<class T> struct is_pointer : false_type {};
  template<class T> struct is_pointer<T*> : true_type {};
  template<class T> struct is_array : false_type {};
  template<class T> struct is_array<T[]> : true_type {};
  template<class T, size_t N> struct is_array<T[N]> : true_type {};
  template<class T> struct is_reference : false_type {};
  template<class T> struct is_reference<T&> : true_type {};
  template<class T> struct is_reference<T&&> : true_type {};
  template<class T> struct is_lvalue_reference : false_type {};
  template<class T> struct is_lvalue_reference<T&> : true_type {};
  template<class T> struct is_rvalue_reference : false_type {};
  template<class T> struct is_rvalue_reference<T&&> : true_type {};
  template<class T, class U> struct is_same : false_type {};
  template<class T> struct is_same<T, T> : true_type {};
  template<class T> using remove_reference_t = typename remove_reference<T>::type;
  template<class T> using remove_cv_t = typename remove_cv<T>::type;
  template<bool B, class T = void> using enable_if_t = typename enable_if<B, T>::type;
}
#endif
`,
          "/libc/utility": `#ifndef _UTILITY_
#define _UTILITY_
namespace std {
  template<class T1, class T2> struct pair {
    T1 first;
    T2 second;
    pair() : first(), second() {}
    pair(const T1& a, const T2& b) : first(a), second(b) {}
  };
  template<class T1, class T2> pair<T1, T2> make_pair(T1 a, T2 b) { return pair<T1, T2>(a, b); }
  template<class T> T&& move(T& t) { return static_cast<T&&>(t); }
  template<class T> T&& forward(T& t) { return static_cast<T&&>(t); }
}
#endif
`,
          "/libc/cstddef": `#ifndef _CSTDDEF_
#define _CSTDDEF_
#include "stddef.h"
namespace std {
  using ::size_t;
  using ::ptrdiff_t;
  typedef decltype(nullptr) nullptr_t;
}
#endif
`,
          "/libc/cstdint": `#ifndef _CSTDINT_
#define _CSTDINT_
#include "stdint.h"
namespace std {
  using ::int8_t;
  using ::int16_t;
  using ::int32_t;
  using ::int64_t;
  using ::uint8_t;
  using ::uint16_t;
  using ::uint32_t;
  using ::uint64_t;
  using ::intptr_t;
  using ::uintptr_t;
}
#endif
`,
          "/libc/cstring": `#ifndef _CSTRING_
#define _CSTRING_
#include "string.h"
namespace std {
  using ::memcpy;
  using ::memmove;
  using ::memset;
  using ::memcmp;
  using ::memchr;
  using ::strcpy;
  using ::strncpy;
  using ::strcat;
  using ::strncat;
  using ::strcmp;
  using ::strncmp;
  using ::strlen;
  using ::strchr;
  using ::strrchr;
  using ::strstr;
}
#endif
`,
          "/libc/cstdlib": `#ifndef _CSTDLIB_
#define _CSTDLIB_
#include "stdlib.h"
namespace std {
  using ::malloc;
  using ::calloc;
  using ::realloc;
  using ::free;
  using ::atoi;
  using ::atol;
  using ::atof;
  using ::strtol;
  using ::strtoul;
  using ::abs;
  using ::labs;
  using ::abort;
  using ::exit;
  using ::rand;
  using ::srand;
}
#endif
`,
          "/libc/limits": `#ifndef _LIMITS_
#define _LIMITS_
namespace std {
  template<class T> class numeric_limits;
  template<> class numeric_limits<bool> { public: static constexpr bool min() { return false; } static constexpr bool max() { return true; } };
  template<> class numeric_limits<char> { public: static constexpr char min() { return -128; } static constexpr char max() { return 127; } };
  template<> class numeric_limits<signed char> { public: static constexpr signed char min() { return -128; } static constexpr signed char max() { return 127; } };
  template<> class numeric_limits<unsigned char> { public: static constexpr unsigned char min() { return 0; } static constexpr unsigned char max() { return 255; } };
  template<> class numeric_limits<short> { public: static constexpr short min() { return -32768; } static constexpr short max() { return 32767; } };
  template<> class numeric_limits<unsigned short> { public: static constexpr unsigned short min() { return 0; } static constexpr unsigned short max() { return 65535; } };
  template<> class numeric_limits<int> { public: static constexpr int min() { return -2147483648; } static constexpr int max() { return 2147483647; } };
  template<> class numeric_limits<unsigned int> { public: static constexpr unsigned int min() { return 0; } static constexpr unsigned int max() { return 4294967295U; } };
  template<> class numeric_limits<long> { public: static constexpr long min() { return -2147483648L; } static constexpr long max() { return 2147483647L; } };
  template<> class numeric_limits<unsigned long> { public: static constexpr unsigned long min() { return 0; } static constexpr unsigned long max() { return 4294967295UL; } };
  template<> class numeric_limits<long long> { public: static constexpr long long min() { return -9223372036854775807LL - 1; } static constexpr long long max() { return 9223372036854775807LL; } };
  template<> class numeric_limits<unsigned long long> { public: static constexpr unsigned long long min() { return 0; } static constexpr unsigned long long max() { return 18446744073709551615ULL; } };
}
#endif
`,
          "/libc/new": `#ifndef _NEW_
#define _NEW_
#include "stddef.h"
inline void* operator new(size_t, void* p) { return p; }
inline void* operator new[](size_t, void* p) { return p; }
namespace std {
  struct nothrow_t {};
  extern const nothrow_t nothrow;
}
#endif
`,
          "/libc/initializer_list": `#ifndef _INITIALIZER_LIST_
#define _INITIALIZER_LIST_
namespace std {
  template<class T> class initializer_list {
    const T* _begin;
    size_t _size;
    constexpr initializer_list(const T* b, size_t s) : _begin(b), _size(s) {}
  public:
    typedef T value_type;
    typedef const T& reference;
    typedef const T& const_reference;
    typedef size_t size_type;
    typedef const T* iterator;
    typedef const T* const_iterator;
    constexpr initializer_list() : _begin(nullptr), _size(0) {}
    constexpr size_t size() const { return _size; }
    constexpr const T* begin() const { return _begin; }
    constexpr const T* end() const { return _begin + _size; }
  };
  template<class T> constexpr const T* begin(initializer_list<T> il) { return il.begin(); }
  template<class T> constexpr const T* end(initializer_list<T> il) { return il.end(); }
}
#endif
`,
          "/libc/sys/time.h": `#ifndef _SYS_TIME_H_
#define _SYS_TIME_H_
#include "stdint.h"
typedef long time_t;
typedef long suseconds_t;
struct timeval {
  time_t tv_sec;
  suseconds_t tv_usec;
};
struct timezone {
  int tz_minuteswest;
  int tz_dsttime;
};
#endif
`,
          "/libc/sys/stat.h": `#ifndef _SYS_STAT_H
#define _SYS_STAT_H
#include "stdint.h"
typedef uint32_t mode_t;
typedef uint32_t dev_t;
typedef uint32_t ino_t;
typedef uint32_t nlink_t;
typedef uint32_t uid_t;
typedef uint32_t gid_t;
typedef int32_t off_t;
typedef int32_t blksize_t;
typedef int32_t blkcnt_t;
typedef long time_t;
typedef char *caddr_t;
struct stat {
  dev_t st_dev;
  ino_t st_ino;
  mode_t st_mode;
  nlink_t st_nlink;
  uid_t st_uid;
  gid_t st_gid;
  dev_t st_rdev;
  off_t st_size;
  blksize_t st_blksize;
  blkcnt_t st_blkcnt;
  time_t st_atime;
  time_t st_mtime;
  time_t st_ctime;
};
#define S_IFMT   0170000
#define S_IFDIR  0040000
#define S_IFCHR  0020000
#define S_IFBLK  0060000
#define S_IFREG  0100000
#define S_IFIFO  0010000
#define S_IFLNK  0120000
#define S_IFSOCK 0140000
#define S_ISDIR(m)  (((m) & S_IFMT) == S_IFDIR)
#define S_ISCHR(m)  (((m) & S_IFMT) == S_IFCHR)
#define S_ISBLK(m)  (((m) & S_IFMT) == S_IFBLK)
#define S_ISREG(m)  (((m) & S_IFMT) == S_IFREG)
#define S_ISFIFO(m) (((m) & S_IFMT) == S_IFIFO)
#define S_ISLNK(m)  (((m) & S_IFMT) == S_IFLNK)
#define S_ISSOCK(m) (((m) & S_IFMT) == S_IFSOCK)
int fstat(int fd, struct stat *buf);
int stat(const char *path, struct stat *buf);
#endif
`,
          "/libc/functional": `#ifndef _FUNCTIONAL_
#define _FUNCTIONAL_
#include "stddef.h"
namespace std {
  // Minimal std::function for void(void) callbacks used by Arduino
  template<typename T> class function;
  template<typename R, typename... Args>
  class function<R(Args...)> {
    using fn_ptr = R(*)(Args...);
    fn_ptr _fn;
  public:
    function() : _fn(nullptr) {}
    function(fn_ptr f) : _fn(f) {}
    function(decltype(nullptr)) : _fn(nullptr) {}
    R operator()(Args... args) const { return _fn(args...); }
    explicit operator bool() const { return _fn != nullptr; }
    bool operator==(decltype(nullptr)) const { return _fn == nullptr; }
    bool operator!=(decltype(nullptr)) const { return _fn != nullptr; }
  };
}
#endif
`,
        };

        // STM32 LL redirect stubs - these map stm32yyxx_* to stm32f1xx_* for STM32F1
        const stm32LLStubs: Record<string, string> = {
          "/framework/arduino/stm32yyxx_ll_tim.h": `#ifndef STM32YYXX_LL_TIM_H
#define STM32YYXX_LL_TIM_H
#include "stm32f1xx_ll_tim.h"
#endif
`,
          "/framework/arduino/stm32yyxx_ll_gpio.h": `#ifndef STM32YYXX_LL_GPIO_H
#define STM32YYXX_LL_GPIO_H
#include "stm32f1xx_ll_gpio.h"
#endif
`,
          "/framework/arduino/stm32yyxx_ll_exti.h": `#ifndef STM32YYXX_LL_EXTI_H
#define STM32YYXX_LL_EXTI_H
#include "stm32f1xx_ll_exti.h"
#endif
`,
          "/framework/arduino/stm32yyxx_ll_adc.h": `#ifndef STM32YYXX_LL_ADC_H
#define STM32YYXX_LL_ADC_H
#include "stm32f1xx_ll_adc.h"
#endif
`,
          "/framework/arduino/stm32yyxx_ll_dac.h": `#ifndef STM32YYXX_LL_DAC_H
#define STM32YYXX_LL_DAC_H
// DAC not available on all STM32F1 devices
#endif
`,
          "/framework/arduino/stm32yyxx_ll_dma.h": `#ifndef STM32YYXX_LL_DMA_H
#define STM32YYXX_LL_DMA_H
#include "stm32f1xx_ll_dma.h"
#endif
`,
          "/framework/arduino/stm32yyxx_ll_rcc.h": `#ifndef STM32YYXX_LL_RCC_H
#define STM32YYXX_LL_RCC_H
#include "stm32f1xx_ll_rcc.h"
#endif
`,
          "/framework/arduino/stm32yyxx_ll_bus.h": `#ifndef STM32YYXX_LL_BUS_H
#define STM32YYXX_LL_BUS_H
#include "stm32f1xx_ll_bus.h"
#endif
`,
          "/framework/arduino/stm32yyxx_ll_rtc.h": `#ifndef STM32YYXX_LL_RTC_H
#define STM32YYXX_LL_RTC_H
#include "stm32f1xx_ll_rtc.h"
#endif
`,
          "/framework/arduino/stm32yyxx_ll_pwr.h": `#ifndef STM32YYXX_LL_PWR_H
#define STM32YYXX_LL_PWR_H
#include "stm32f1xx_ll_pwr.h"
#endif
`,
          "/framework/arduino/stm32yyxx_ll_usart.h": `#ifndef STM32YYXX_LL_USART_H
#define STM32YYXX_LL_USART_H
#include "stm32f1xx_ll_usart.h"
#endif
`,
          "/framework/arduino/stm32yyxx_ll_i2c.h": `#ifndef STM32YYXX_LL_I2C_H
#define STM32YYXX_LL_I2C_H
#include "stm32f1xx_ll_i2c.h"
#endif
`,
          "/framework/arduino/stm32yyxx_ll_spi.h": `#ifndef STM32YYXX_LL_SPI_H
#define STM32YYXX_LL_SPI_H
#include "stm32f1xx_ll_spi.h"
#endif
`,
          "/framework/arduino/stm32yyxx_ll_system.h": `#ifndef STM32YYXX_LL_SYSTEM_H
#define STM32YYXX_LL_SYSTEM_H
#include "stm32f1xx_ll_system.h"
#endif
`,
          "/framework/arduino/stm32yyxx_ll_cortex.h": `#ifndef STM32YYXX_LL_CORTEX_H
#define STM32YYXX_LL_CORTEX_H
#include "stm32f1xx_ll_cortex.h"
#endif
`,
          "/framework/arduino/stm32yyxx_ll_utils.h": `#ifndef STM32YYXX_LL_UTILS_H
#define STM32YYXX_LL_UTILS_H
#include "stm32f1xx_ll_utils.h"
#endif
`,
        };

        // Add libc headers to VFS
        for (const [path, content] of Object.entries(minimalLibcHeaders)) {
          files[path] = content;
        }

        // Add STM32 LL redirect stubs
        if (isArduino) {
          for (const [path, content] of Object.entries(stm32LLStubs)) {
            files[path] = content;
          }
          // Add include path for the stubs
          includePaths.push("-I/framework/arduino");
        }

        // Add /libc at the START of include paths so our stubs are found first
        // (before platform/CMSIS stddef.h etc which may include Clang internals)
        includePaths.unshift("-I/libc");
      }

      const allSourceFiles = [...userSourceFiles, ...arduinoCoreSourceFiles, ...librarySourceFiles, ...platformSourceFiles];

      const coreCount = arduinoCoreSourceFiles.length;
      log(
        `Step 1: Compiling ${userSourceFiles.length} user + ${coreCount > 0 ? coreCount + " arduino core + " : ""}${librarySourceFiles.length} library + ${platformSourceFiles.length} platform source file(s) for ARM ${archName}...`,
        "info"
      );
      if (includePaths.length > 0) {
        log(`Include paths: ${includePaths.join(" ")}`, "info");
      }
      if (defines.length > 0) {
        log(`Defines: ${defines.join(" ")}`, "info");
      }

      const objectFiles: Map<string, Uint8Array> = new Map();

      // Flags that are only relevant for C/C++ compilation, not assembly
      const cOnlyFlags = new Set([
        "-ffreestanding",
        "-ffunction-sections",
        "-fdata-sections",
        "-fno-exceptions",
        "-fno-rtti",
        "-fno-threadsafe-statics",
        "-nostdlib",
      ]);

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

        // Check if this is an assembly file
        const isAssembly = srcPath.endsWith(".s") || srcPath.endsWith(".S");

        // Filter flags for assembly files (remove C-only flags and defines)
        const filteredPlatformFlags = isAssembly
          ? platformFlags.filter((flag) => !cOnlyFlags.has(flag) && !flag.startsWith("-std="))
          : platformFlags;
        const filteredDefines = isAssembly ? [] : defines;

        const compileArgs = [
          ...filteredPlatformFlags,
          ...includePaths,
          ...filteredDefines,
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
          },
          compilerArch
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

  // Save handler - saves ALL editable files from VFS to project storage
  const handleSave = useCallback(async () => {
    if (!currentProject) {
      log("No project open to save", "warning");
      return;
    }

    // First, sync current editor content to VFS
    if (state.activeFile && editorContentRef.current) {
      const activeFileData = getFile(state.activeFile);
      if (activeFileData?.editable) {
        updateFile(state.activeFile, editorContentRef.current);
      }
    }

    // Get all editable files from VFS
    const editableFiles = getEditableFiles();

    // Convert to ProjectFile format
    const updatedFiles = editableFiles.map((f) => ({
      path: f.path,
      content: f.content,
      editable: true,
    }));

    // Mark all files as saved in VFS
    for (const file of editableFiles) {
      markFileSaved(file.path);
    }

    try {
      await saveProjectToStorage({ files: updatedFiles });
      log(`Saved ${updatedFiles.length} file(s)`, "success");
    } catch (error) {
      log(`Failed to save: ${error}`, "error");
    }
  }, [
    state.activeFile,
    getFile,
    updateFile,
    markFileSaved,
    log,
    currentProject,
    saveProjectToStorage,
    getEditableFiles,
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
          onOpenWasmTools={() => setIsWasmToolsOpen(true)}
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
        onOpenWasmTools={() => setIsWasmToolsOpen(true)}
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

      {/* WASM Package Manager */}
      <WasmPackageManager
        isOpen={isWasmToolsOpen}
        onClose={() => setIsWasmToolsOpen(false)}
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
