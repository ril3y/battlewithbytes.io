"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { EditorPanel } from "./EditorPanel";
import { TerminalPanel } from "./TerminalPanel";
import { ToolbarPanel } from "./ToolbarPanel";
import { ToolchainStatus } from "./ToolchainStatus";
import { PlatformSelectorModal } from "./PlatformSelectorModal";
import { FileExplorer } from "./FileExplorer";
import { FileTabs } from "./FileTabs";
import { VFSProvider, useVFS } from "../lib/vfs/VFSContext";
import { useProject } from "../lib/project/ProjectContext";
import {
  loadClangModule,
  executeClang,
  getClangVersion,
} from "../lib/compiler/EmscriptenClangLoader";
import type { LoadProgress } from "../lib/compiler/EmscriptenClangLoader";
import { executeLld } from "../lib/compiler/EmscriptenLldLoader";
import type {
  SelectedPlatform,
  ToolchainState,
  LoadingProgress,
} from "../lib/platform/types";
import { loadHeaders } from "../lib/platform/HeaderLoader";
import { getPlatformManager } from "../lib/platform/PlatformManager";
import { LibraryPanel } from "./LibraryPanel";
import { FirstTimeSetupModal } from "./FirstTimeSetupModal";
import { EditProjectModal } from "./EditProjectModal";
import { HexViewer, isBinaryContent } from "./HexViewer";
import { getLibraryManager } from "../lib/library";

const defaultSourceCode = `/**
 * STM32F103C8T6 (Blue Pill) LED Blink Example
 * Uses CMSIS headers for proper register definitions.
 * The onboard LED is connected to PC13 (active low).
 *
 * Select STM32 > F1 > STM32F103C8T6 from the platform selector.
 */

#include "stm32f1xx.h"
#include <stdint.h>

/*===========================================================================
 * Linker symbols (defined in linker script)
 *===========================================================================*/
extern uint32_t _sidata;    /* Start of .data in FLASH */
extern uint32_t _sdata;     /* Start of .data in RAM */
extern uint32_t _edata;     /* End of .data in RAM */
extern uint32_t _sbss;      /* Start of .bss */
extern uint32_t _ebss;      /* End of .bss */
extern uint32_t _estack;    /* Top of stack */

/*===========================================================================
 * Function prototypes
 *===========================================================================*/
void Reset_Handler(void);
void Default_Handler(void);
void NMI_Handler(void) __attribute__((weak, alias("Default_Handler")));
void HardFault_Handler(void) __attribute__((weak, alias("Default_Handler")));
void MemManage_Handler(void) __attribute__((weak, alias("Default_Handler")));
void BusFault_Handler(void) __attribute__((weak, alias("Default_Handler")));
void UsageFault_Handler(void) __attribute__((weak, alias("Default_Handler")));
void SVC_Handler(void) __attribute__((weak, alias("Default_Handler")));
void DebugMon_Handler(void) __attribute__((weak, alias("Default_Handler")));
void PendSV_Handler(void) __attribute__((weak, alias("Default_Handler")));
void SysTick_Handler(void) __attribute__((weak, alias("Default_Handler")));

extern int main(void);

/*===========================================================================
 * Vector Table - placed at start of FLASH (0x08000000)
 *===========================================================================*/
__attribute__((section(".isr_vector")))
const uint32_t vector_table[] = {
    (uint32_t)&_estack,           /* Initial stack pointer */
    (uint32_t)Reset_Handler,      /* Reset handler */
    (uint32_t)NMI_Handler,        /* NMI handler */
    (uint32_t)HardFault_Handler,  /* Hard fault handler */
    (uint32_t)MemManage_Handler,  /* MPU fault handler */
    (uint32_t)BusFault_Handler,   /* Bus fault handler */
    (uint32_t)UsageFault_Handler, /* Usage fault handler */
    0, 0, 0, 0,                   /* Reserved */
    (uint32_t)SVC_Handler,        /* SVCall handler */
    (uint32_t)DebugMon_Handler,   /* Debug monitor handler */
    0,                            /* Reserved */
    (uint32_t)PendSV_Handler,     /* PendSV handler */
    (uint32_t)SysTick_Handler,    /* SysTick handler */
    /* External interrupts would follow here... */
};

/*===========================================================================
 * Reset Handler - Entry point after reset
 *===========================================================================*/
void Reset_Handler(void) {
    uint32_t *src, *dst;

    /* Copy .data section from FLASH to RAM */
    src = &_sidata;
    dst = &_sdata;
    while (dst < &_edata) {
        *dst++ = *src++;
    }

    /* Zero-fill .bss section */
    dst = &_sbss;
    while (dst < &_ebss) {
        *dst++ = 0;
    }

    /* Call main() */
    main();

    /* Hang if main returns */
    while (1) {}
}

/*===========================================================================
 * Default Handler - Catches unhandled interrupts
 *===========================================================================*/
void Default_Handler(void) {
    while (1) {}
}

/*===========================================================================
 * Simple delay using a busy loop
 *===========================================================================*/
static void delay(volatile unsigned int count) {
    while (count--) {
        __asm__("nop");
    }
}

/*===========================================================================
 * Main Application
 *===========================================================================*/
int main(void) {
    /* Enable GPIOC clock (bit 4 of RCC_APB2ENR) */
    RCC->APB2ENR |= RCC_APB2ENR_IOPCEN;

    /* Configure PC13 as output push-pull, max speed 2MHz
     * PC13 is configured in CRH (high register, pins 8-15)
     * Each pin uses 4 bits: CNF[1:0] MODE[1:0]
     * MODE = 0b10 (2MHz output)
     * CNF  = 0b00 (push-pull)
     * PC13 is at bits 20-23 of CRH
     */
    GPIOC->CRH &= ~(0xF << 20);  /* Clear PC13 config bits */
    GPIOC->CRH |= (0x2 << 20);   /* Set MODE=0b10, CNF=0b00 */

    /* Main loop - blink LED */
    while (1) {
        /* Toggle PC13 using ODR (Output Data Register) */
        GPIOC->ODR ^= GPIO_ODR_ODR13;

        /* Delay - adjust count for different blink rates */
        delay(100000);
    }

    return 0;
}
`;

function BattleForgeIDEContent() {
  const {
    state,
    addFile,
    updateFile,
    markFileSaved,
    getFile,
    addFilesFromMap,
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

  // Editor state - empty until platform selected
  const [editorContent, setEditorContent] = useState("");

  const [output, setOutput] = useState<
    Array<{
      message: string;
      type: "info" | "success" | "error" | "warning";
      timestamp?: string;
    }>
  >([
    {
      message: "BattleForge Ready - Compile firmware for embedded systems",
      type: "info",
    },
  ]);

  const [isCompiling, setIsCompiling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [compilerReady, setCompilerReady] = useState(false);
  const [selectedPlatform, setSelectedPlatform] =
    useState<SelectedPlatform | null>(null);
  const [cachedHeaders, setCachedHeaders] = useState<Map<
    string,
    Uint8Array
  > | null>(null);
  const [projectInitialized, setProjectInitialized] = useState(false);

  // Toolchain state for status display
  const [toolchainState, setToolchainState] = useState<ToolchainState>({
    clang: { stage: "idle", current: 0, total: 0, message: "" },
    lld: { stage: "idle", current: 0, total: 0, message: "" },
    headers: { stage: "idle", current: 0, total: 0, message: "" },
    libs: { stage: "idle", current: 0, total: 0, message: "" },
  });

  // Platform modal state - only open if no project platform
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);

  // Edit project modal state
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

  // Track if we should auto-load compiler
  const [shouldAutoLoadCompiler, setShouldAutoLoadCompiler] = useState(false);

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
        // Helper to convert base64 to Uint8Array
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

      // Log project loaded with platform/board details
      const platform = currentProject.platform;
      const platformInfo = platform
        ? `${platform.platformId}/${platform.familyId}/${platform.deviceId}`
        : "none";
      const boardInfo = platform?.boardId || "generic";

      console.log(
        `[BattleForge] Project loaded: "${currentProject.metadata.name}"`,
        {
          id: currentProject.metadata.id,
          platform: platformInfo,
          board: boardInfo,
          architecture: platform?.architecture || "unknown",
          files: currentProject.files.length,
          libraries: currentProject.libraries?.length || 0,
        },
      );

      setOutput((prev) => [
        ...prev,
        {
          message: `Project "${currentProject.metadata.name}" loaded`,
          type: "success",
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          message: `  Platform: ${platformInfo} | Board: ${boardInfo} | Arch: ${platform?.architecture || "unknown"}`,
          type: "info",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      // Trigger auto-load of compiler if project has platform
      if (currentProject.platform) {
        setShouldAutoLoadCompiler(true);
      }

      setProjectInitialized(true);
    }
  }, [currentProject, projectInitialized, addFile, openFile]);

  // First-time setup modal state
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [pendingPlatform, setPendingPlatform] =
    useState<SelectedPlatform | null>(null);
  const [headersReady, setHeadersReady] = useState(false);

  // Right sidebar tab state
  const [rightSidebarTab, setRightSidebarTab] = useState<
    "platform" | "libraries"
  >("platform");

  // Resizable panel state
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(220);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState<
    "terminal" | "left" | "right" | null
  >(null);
  const resizeStartPos = useRef(0);
  const resizeStartSize = useRef(0);

  // Legacy refs for backwards compat
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);

  // Panel resize handlers
  const handleResizeStart = useCallback(
    (type: "terminal" | "left" | "right", e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(type);
      if (type === "terminal") {
        resizeStartPos.current = e.clientY;
        resizeStartSize.current = terminalHeight;
      } else if (type === "left") {
        resizeStartPos.current = e.clientX;
        resizeStartSize.current = leftSidebarWidth;
      } else {
        resizeStartPos.current = e.clientX;
        resizeStartSize.current = rightSidebarWidth;
      }
    },
    [terminalHeight, leftSidebarWidth, rightSidebarWidth],
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing === "terminal") {
        const deltaY = resizeStartPos.current - e.clientY;
        const newHeight = Math.max(
          100,
          Math.min(600, resizeStartSize.current + deltaY),
        );
        setTerminalHeight(newHeight);
      } else if (isResizing === "left") {
        const deltaX = e.clientX - resizeStartPos.current;
        const newWidth = Math.max(
          150,
          Math.min(400, resizeStartSize.current + deltaX),
        );
        setLeftSidebarWidth(newWidth);
      } else if (isResizing === "right") {
        const deltaX = resizeStartPos.current - e.clientX;
        const newWidth = Math.max(
          200,
          Math.min(450, resizeStartSize.current + deltaX),
        );
        setRightSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Default Makefile content
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

  // Initialize VFS with default files only if no project loaded (legacy fallback)
  useEffect(() => {
    if (selectedPlatform && !currentProject) {
      // Only add the default files if they don't exist yet
      if (!getFile("/src/main.c")) {
        addFile("/src/main.c", defaultSourceCode, true);
      }
      if (!getFile("/Makefile")) {
        addFile("/Makefile", defaultMakefile, true);
      }
    }
  }, [selectedPlatform, currentProject, addFile, getFile]);

  // Sync editor content with VFS when active file changes
  useEffect(() => {
    if (state.activeFile) {
      const file = getFile(state.activeFile);
      if (file) {
        // Convert Uint8Array to string if needed (for header files)
        if (typeof file.content === "string") {
          setEditorContent(file.content);
        } else if (file.content instanceof Uint8Array) {
          const textContent = new TextDecoder().decode(file.content);
          setEditorContent(textContent);
        }
      }
    }
  }, [state.activeFile, getFile]);

  const updateToolchainComponent = useCallback(
    (component: keyof ToolchainState, update: Partial<LoadingProgress>) => {
      setToolchainState((prev) => ({
        ...prev,
        [component]: { ...prev[component], ...update },
      }));
    },
    [],
  );

  const log = useCallback(
    (
      message: string,
      type: "info" | "success" | "error" | "warning" = "info",
    ) => {
      const timestamp = new Date().toLocaleTimeString();
      setOutput((prev) => [...prev, { message, type, timestamp }]);
    },
    [],
  );

  const handleLoadCompiler = async () => {
    if (compilerReady) {
      log("Compiler already loaded", "warning");
      return;
    }

    if (isLoading) {
      log("Compiler load already in progress", "warning");
      return;
    }

    setIsLoading(true);
    log("Starting compiler download...", "info");
    updateToolchainComponent("clang", {
      stage: "downloading",
      message: "Starting download...",
    });

    try {
      await loadClangModule((progress: LoadProgress) => {
        if (progress.stage === "downloading") {
          log(progress.message, "info");
          updateToolchainComponent("clang", {
            stage: "downloading",
            message: progress.message,
            current: progress.current || 0,
            total: progress.total || 0,
          });
        } else if (progress.stage === "instantiating") {
          log(progress.message, "info");
          updateToolchainComponent("clang", {
            stage: "extracting",
            message: "Instantiating WASM...",
          });
        } else if (progress.stage === "ready") {
          log("ARM Clang compiler ready", "success");
          updateToolchainComponent("clang", {
            stage: "ready",
            message: "Ready",
          });
          setCompilerReady(true);
        } else if (progress.stage === "error") {
          log(`Compiler load failed: ${progress.message}`, "error");
          updateToolchainComponent("clang", {
            stage: "error",
            message: progress.message,
          });
        }
      });

      const version = await getClangVersion();
      log(`Compiler version: ${version}`, "info");

      // Mark LLD as ready too (it's loaded with Clang)
      updateToolchainComponent("lld", { stage: "ready", message: "Ready" });
    } catch (error) {
      log(
        `Failed to load compiler: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
      updateToolchainComponent("clang", {
        stage: "error",
        message: "Load failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load compiler when project loads
  useEffect(() => {
    if (shouldAutoLoadCompiler && !compilerReady && !isLoading) {
      setShouldAutoLoadCompiler(false);
      handleLoadCompiler();
    }
  }, [shouldAutoLoadCompiler, compilerReady, isLoading]);

  // Auto-load headers when compiler is ready and project has a platform
  useEffect(() => {
    async function loadProjectPlatformHeaders() {
      // Only proceed if compiler is ready, project has platform, headers not loaded, and not already loading
      if (
        !compilerReady ||
        !currentProject?.platform ||
        cachedHeaders ||
        headersReady
      ) {
        return;
      }

      // Skip if we already have a selectedPlatform (user manually selected)
      if (selectedPlatform) {
        return;
      }

      const { platformId, familyId, deviceId } = currentProject.platform;

      try {
        log("Loading platform configuration...", "info");

        // Use PlatformManager to get full platform data
        const platformManager = getPlatformManager();
        const fullPlatform = await platformManager.selectPlatform(
          platformId,
          familyId,
          deviceId,
        );

        // Set the platform and load headers
        setSelectedPlatform(fullPlatform);
        await loadPlatformHeaders(fullPlatform);
      } catch (err) {
        log(`Failed to load platform: ${err}`, "error");
      }
    }

    loadProjectPlatformHeaders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    compilerReady,
    currentProject?.platform,
    cachedHeaders,
    headersReady,
    selectedPlatform,
  ]);

  // Load project-specific library files into VFS
  useEffect(() => {
    async function loadProjectLibraries() {
      // Only load libraries if project has them defined
      const projectLibraries = currentProject?.libraries;
      if (!projectLibraries || projectLibraries.length === 0) {
        return;
      }

      try {
        const libraryManager = getLibraryManager();
        // Only load libraries that are part of this project
        const libraryFiles =
          await libraryManager.getLibraryFilesFor(projectLibraries);

        if (libraryFiles.size > 0) {
          let configTemplatesCopied = 0;
          for (const [path, content] of libraryFiles) {
            addFile(path, content, false); // false = read-only

            // Check for config templates and copy them to /src/ for user customization
            const configMatch = path.match(/^\/libs\/[^/]+\/config\/(.+)$/);
            if (configMatch) {
              const configFileName = configMatch[1];
              const userConfigPath = `/src/${configFileName}`;
              // Only copy if file doesn't already exist in src
              if (!files.get(userConfigPath)) {
                addFile(userConfigPath, content, true); // true = editable
                configTemplatesCopied++;
              }
            }
          }
          log(
            `Loaded ${libraryFiles.size} files for ${projectLibraries.length} project libraries`,
            "info",
          );
          if (configTemplatesCopied > 0) {
            log(
              `Copied ${configTemplatesCopied} config template(s) to /src`,
              "info",
            );
          }
        }
      } catch (err) {
        console.error("[BattleForgeIDE] Failed to load library files:", err);
      }
    }

    loadProjectLibraries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.libraries]); // Reload when project libraries change

  const handlePlatformSelect = useCallback(
    async (platform: SelectedPlatform | null) => {
      if (!platform) {
        setSelectedPlatform(null);
        setCachedHeaders(null);
        setHeadersReady(false);
        updateToolchainComponent("headers", { stage: "idle", message: "" });
        return;
      }

      log(
        `Platform selected: ${platform.device.name} (${platform.family.architecture})`,
        "info",
      );

      // If compiler isn't ready, show setup modal first
      if (!compilerReady) {
        setPendingPlatform(platform);
        setIsSetupModalOpen(true);
        return;
      }

      // Compiler is ready, proceed with headers loading
      await loadPlatformHeaders(platform);
    },
    [compilerReady, log],
  );

  // Load headers for a platform (called after setup or directly if compiler ready)
  const loadPlatformHeaders = useCallback(
    async (platform: SelectedPlatform) => {
      setSelectedPlatform(platform);
      setCachedHeaders(null);
      setHeadersReady(false);
      updateToolchainComponent("headers", { stage: "idle", message: "" });

      log("Loading platform headers...", "info");
      updateToolchainComponent("headers", {
        stage: "downloading",
        message: "Loading headers...",
      });

      try {
        const headers = await loadHeaders(
          platform.platformId,
          platform.familyId,
          platform.family.headers.url,
          platform.family.headers.checksum,
          (progress) => {
            // Map header loader stages to toolchain stages
            let stage: "ready" | "error" | "downloading" | "warning" =
              "downloading";
            if (progress.stage === "ready") stage = "ready";
            else if (progress.stage === "error") stage = "error";
            else if (progress.stage === "warning") stage = "warning";

            updateToolchainComponent("headers", {
              stage,
              message: progress.message,
              current: progress.current || 0,
              total: progress.total || 0,
            });
            if (progress.stage !== "ready") {
              log(
                progress.message,
                progress.stage === "error"
                  ? "error"
                  : progress.stage === "warning"
                    ? "warn"
                    : "info",
              );
            }
          },
        );
        setCachedHeaders(headers);
        setHeadersReady(true);

        // Handle case where headers weren't available (warning stage)
        if (headers.size === 0) {
          updateToolchainComponent("headers", {
            stage: "warning",
            message: "No headers available",
          });
        } else {
          updateToolchainComponent("headers", {
            stage: "ready",
            message: `${headers.size} headers loaded`,
          });
        }

        // Add headers to VFS for visibility in file explorer
        for (const [headerPath, content] of headers) {
          addFile(headerPath, content, false);
        }
        log(`Added ${headers.size} headers to filesystem`, "success");
      } catch (err) {
        log(`Failed to load headers: ${err}`, "error");
        updateToolchainComponent("headers", {
          stage: "error",
          message: "Failed to load",
        });
      }
    },
    [updateToolchainComponent, log, addFile],
  );

  // Setup modal handlers
  const handleSetupComplete = useCallback(() => {
    setIsSetupModalOpen(false);
    if (pendingPlatform) {
      loadPlatformHeaders(pendingPlatform);
      setPendingPlatform(null);
    }
  }, [pendingPlatform, loadPlatformHeaders]);

  const handleSetupCancel = useCallback(() => {
    setIsSetupModalOpen(false);
    setPendingPlatform(null);
  }, []);

  // Wrapper for loading headers from setup modal
  const handleLoadHeadersFromSetup = useCallback(async () => {
    if (!pendingPlatform) return;

    updateToolchainComponent("headers", {
      stage: "downloading",
      message: "Loading headers...",
    });

    try {
      const headers = await loadHeaders(
        pendingPlatform.platformId,
        pendingPlatform.familyId,
        pendingPlatform.family.headers.url,
        pendingPlatform.family.headers.checksum,
        (progress) => {
          updateToolchainComponent("headers", {
            stage:
              progress.stage === "ready"
                ? "ready"
                : progress.stage === "error"
                  ? "error"
                  : "downloading",
            message: progress.message,
            current: progress.current || 0,
            total: progress.total || 0,
          });
        },
      );
      setCachedHeaders(headers);
      setHeadersReady(true);
      updateToolchainComponent("headers", {
        stage: "ready",
        message: `${headers.size} headers loaded`,
      });

      // Add headers to VFS
      for (const [headerPath, content] of headers) {
        addFile(headerPath, content, false);
      }
    } catch (err) {
      updateToolchainComponent("headers", {
        stage: "error",
        message: "Failed to load",
      });
      throw err;
    }
  }, [pendingPlatform, updateToolchainComponent, addFile]);

  // Fallback linker script for when no platform is selected
  const defaultLinkerScript = `
/* Generic ARM Cortex-M Memory Layout */
MEMORY
{
  FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 64K
  RAM (rwx)   : ORIGIN = 0x20000000, LENGTH = 20K
}

/* Entry point - Reset_Handler for ARM Cortex-M */
ENTRY(Reset_Handler)

/* Stack pointer - top of RAM */
_estack = ORIGIN(RAM) + LENGTH(RAM);

/* Linker symbols for startup code */
_sidata = LOADADDR(.data);

SECTIONS
{
  /* Vector table must be at start of FLASH */
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

  const loadPlatformLinkerScript = async (): Promise<string> => {
    if (!selectedPlatform) {
      return defaultLinkerScript;
    }

    try {
      const { family, device } = selectedPlatform;
      const linkerUrl = `/platforms/stm32/${family.id}/linker/${device.linkerScript}`;
      const response = await fetch(linkerUrl);
      if (!response.ok) {
        log(
          `Warning: Could not load linker script from ${linkerUrl}, using default`,
          "warning",
        );
        return defaultLinkerScript;
      }
      return await response.text();
    } catch (err) {
      log(`Warning: Failed to load linker script: ${err}`, "warning");
      return defaultLinkerScript;
    }
  };

  const handleEditorChange = useCallback((newContent: string) => {
    setEditorContent(newContent);
    // Don't auto-save - let user explicitly save with Ctrl+S or Save button
  }, []);

  // Get files for intellisense - traverses VFS and returns Map with content and readOnly
  const getFilesForIntellisense = useCallback(() => {
    const files = new Map<
      string,
      { content: string | Uint8Array; readOnly?: boolean }
    >();

    function traverse(
      node: typeof state.root | (typeof state.root.children)[0],
    ) {
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
  }, [state.root]);

  const handleFileSelect = useCallback(
    (path: string, content: string | Uint8Array) => {
      // Convert Uint8Array to string if needed (for header files)
      if (typeof content === "string") {
        setEditorContent(content);
      } else if (content instanceof Uint8Array) {
        const textContent = new TextDecoder().decode(content);
        setEditorContent(textContent);
      }
    },
    [],
  );

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
      // Get platform-specific compiler flags or use defaults
      const defaultFlags = [
        "--target=thumbv7m-none-eabi",
        "-mcpu=cortex-m3",
        "-mthumb",
        "-nostdlib",
        "-ffreestanding",
      ];

      const platformFlags =
        selectedPlatform?.family.compilerFlags || defaultFlags;
      const archName = selectedPlatform?.family.architecture || "cortex-m3";

      // Use cached headers (loaded when platform was selected)
      const headers = cachedHeaders;

      // Build files map from VFS + headers
      const vfsFiles = getFilesForCompiler();
      const files: Record<string, string | Uint8Array> = { ...vfsFiles };

      // For now, use editor content for main.c
      files["/main.c"] = editorContent;

      // Add headers to files
      if (headers) {
        for (const [path, content] of headers) {
          files[path] = content;
        }
      }

      // Build include paths from header directories
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

      // Add user source directories to include paths (for user headers)
      // Always include /src for user configuration files (like FreeRTOSConfig.h)
      includePaths.push("-I/src");
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

      // Add library files and include paths
      const libraryManager = getLibraryManager();
      const libraryFiles = await libraryManager.getAllLibraryFiles();
      const libraryIncludePaths = await libraryManager.getIncludePaths();

      // Add library files to compilation files
      for (const [path, content] of libraryFiles) {
        files[path] = content;
      }

      // Add library include paths
      for (const libPath of libraryIncludePaths) {
        includePaths.push(libPath);
      }

      // Log library info if any are installed
      if (libraryFiles.size > 0) {
        log(`Including ${libraryFiles.size} library files`, "info");
      }

      // Add device define if available
      const defines: string[] = [];
      if (selectedPlatform?.device.defines) {
        for (const def of selectedPlatform.device.defines) {
          defines.push(`-D${def}`);
        }
      }

      // Find all user .c files to compile
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

      // Find library source files to compile
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

      // Combine user and library sources
      const allSourceFiles = [...userSourceFiles, ...librarySourceFiles];

      log(
        `Step 1: Compiling ${userSourceFiles.length} user + ${librarySourceFiles.length} library source file(s) for ARM ${archName}...`,
        "info",
      );
      if (includePaths.length > 0) {
        log(`Include paths: ${includePaths.join(" ")}`, "info");
      }
      if (defines.length > 0) {
        log(`Defines: ${defines.join(" ")}`, "info");
      }

      // Compile each source file to object file
      const objectFiles: Map<string, Uint8Array> = new Map();

      for (const srcPath of allSourceFiles) {
        // For the active file, use editor content
        const srcFileName = srcPath.substring(srcPath.lastIndexOf("/") + 1);
        const objFileName = srcFileName.replace(/\.(c|cpp|cc)$/, ".o");
        // Use a unique path to avoid collisions between user and library files
        const objPath = srcPath.startsWith("/libs/")
          ? `/build/libs_${srcFileName.replace(/\.(c|cpp|cc)$/, ".o")}`
          : `/build/${objFileName}`;

        // Use editor content for active file
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
          },
        );

        if (!compileResult.success) {
          log(
            `Compilation of ${srcPath} failed with exit code ${compileResult.exitCode}`,
            "error",
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
            "error",
          );
          log(
            `Available files: ${Array.from(compileResult.outputFiles?.keys() || []).join(", ") || "none"}`,
            "info",
          );
          return;
        }

        objectFiles.set(objPath, objFile);
        log(
          `Compiled ${srcPath} -> ${objPath} (${objFile.length} bytes)`,
          "success",
        );

        // Add object file to VFS
        addFile(objPath, objFile, false);
      }

      if (objectFiles.size === 0) {
        log("No source files compiled", "error");
        return;
      }

      log(
        `Compilation successful! ${objectFiles.size} object file(s)`,
        "success",
      );

      // Step 2: Link with LLD
      log("Step 2: Linking with LLD...", "info");

      // Load the platform-specific linker script
      const linkerScript = await loadPlatformLinkerScript();
      if (selectedPlatform) {
        log(
          `Using linker script: ${selectedPlatform.device.linkerScript}`,
          "info",
        );
      }

      // Build linker arguments with all object files
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

      // Build link files map with all object files
      const linkFiles: Record<string, string | Uint8Array> = {
        "/linker.ld": linkerScript,
      };
      for (const [objPath, objData] of objectFiles) {
        linkFiles[objPath] = objData;
      }

      log(
        `Linking ${objPaths.length} object file(s): ${objPaths.join(", ")}`,
        "info",
      );

      const linkResult = await executeLld(
        linkArgs,
        linkFiles,
        (text) => {
          if (text.trim()) log(text.trim(), "info");
        },
        (text) => {
          if (text.trim()) log(text.trim(), "warning");
        },
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
        log(
          `Available files: ${Array.from(linkResult.outputFiles?.keys() || []).join(", ") || "none"}`,
          "info",
        );
        return;
      }

      log(`Linking successful! (${elfFile.length} bytes)`, "success");

      // Add ELF file to VFS
      addFile("/build/firmware.elf", elfFile, false);

      // Show ELF file info
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

          // Helper to convert Uint8Array to base64
          const toBase64 = (data: Uint8Array): string => {
            let binary = "";
            for (let i = 0; i < data.length; i++) {
              binary += String.fromCharCode(data[i]);
            }
            return btoa(binary);
          };

          // Add all object files
          for (const [objPath, objData] of objectFiles) {
            buildArtifacts.push({
              path: objPath,
              contentBase64: toBase64(objData),
              size: objData.length,
              timestamp,
            });
          }

          // Add ELF file
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
        "error",
      );
    } finally {
      setIsCompiling(false);
    }
  };

  const handleFlash = async () => {
    log("Flash operation not yet implemented", "warning");
    log("Will support UART bootloader protocols for various MCUs", "info");
  };

  const handleSave = useCallback(async () => {
    if (state.activeFile && currentProject) {
      const file = getFile(state.activeFile);
      if (file) {
        // Update the VFS with the current editor content
        updateFile(state.activeFile, editorContent);
        // Clear the modified flag
        markFileSaved(state.activeFile);

        // Update the project files and persist to IndexedDB
        const updatedFiles = currentProject.files.map((f) => {
          if (f.path === state.activeFile) {
            return { ...f, content: editorContent };
          }
          return f;
        });

        // Check if this is a new file not in project yet
        const fileExists = currentProject.files.some(
          (f) => f.path === state.activeFile,
        );
        if (!fileExists && file.editable) {
          // Convert Uint8Array to string if needed
          const content =
            typeof file.content === "string" ? editorContent : editorContent;
          updatedFiles.push({
            path: state.activeFile,
            content,
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

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Check if current file has unsaved modifications
  const canSave = useMemo(() => {
    if (!state.activeFile) return false;
    const file = getFile(state.activeFile);
    if (!file || !file.editable) return false;

    // Compare current editor content with VFS content
    const vfsContent =
      typeof file.content === "string"
        ? file.content
        : new TextDecoder().decode(file.content);

    return editorContent !== vfsContent;
  }, [state.activeFile, editorContent, getFile]);

  // Check if active file is binary (should show hex viewer)
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

    // Also clear build artifacts from project storage
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
    // Convert string to Uint8Array
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
      // Check VFS for modified files OR if current editor has unsaved content
      if (hasUnsavedChanges() || canSave) {
        e.preventDefault();
        // Modern browsers ignore custom messages but still show a generic warning
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, canSave]);

  return (
    <div className="battleforge-ide">
      <div
        className="ide-layout"
        style={{
          gridTemplateColumns: `${leftSidebarWidth}px 1fr ${rightSidebarWidth}px`,
        }}
      >
        {/* Toolbar */}
        <div className="toolbar-area">
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
        </div>

        {/* Left sidebar - File Explorer */}
        <div className="sidebar-left" style={{ width: leftSidebarWidth }}>
          <FileExplorer onFileSelect={handleFileSelect} />
          <div
            className={`resize-handle-h resize-handle-left ${isResizing === "left" ? "resizing" : ""}`}
            onMouseDown={(e) => handleResizeStart("left", e)}
          />
        </div>

        {/* Right sidebar - Platform & Status / Libraries */}
        <div className="sidebar-right" style={{ width: rightSidebarWidth }}>
          <div
            className={`resize-handle-h resize-handle-right ${isResizing === "right" ? "resizing" : ""}`}
            onMouseDown={(e) => handleResizeStart("right", e)}
          />
          {/* Sidebar Tabs */}
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${rightSidebarTab === "platform" ? "active" : ""}`}
              onClick={() => setRightSidebarTab("platform")}
            >
              Platform
            </button>
            <button
              className={`sidebar-tab ${rightSidebarTab === "libraries" ? "active" : ""}`}
              onClick={() => setRightSidebarTab("libraries")}
            >
              Libraries
            </button>
          </div>

          {/* Platform Tab Content */}
          {rightSidebarTab === "platform" && (
            <>
              {/* Platform Selection Button */}
              <div
                className="platform-card"
                onClick={() => setIsPlatformModalOpen(true)}
              >
                <div className="platform-card-header">
                  <span className="platform-label">Target Platform</span>
                  <button className="platform-change-btn">Change</button>
                </div>
                {selectedPlatform ? (
                  <div className="platform-selected">
                    <div className="platform-name">
                      {selectedPlatform.device.name}
                    </div>
                    <div className="platform-details">
                      <span>{selectedPlatform.family.architecture}</span>
                      <span>
                        {formatBytes(selectedPlatform.device.flash)} Flash
                      </span>
                      <span>
                        {formatBytes(selectedPlatform.device.ram)} RAM
                      </span>
                    </div>
                  </div>
                ) : currentProject?.platform ? (
                  <div className="platform-selected platform-pending">
                    <div className="platform-name">
                      {currentProject.platform.deviceId.toUpperCase()}
                    </div>
                    <div className="platform-details">
                      <span>{currentProject.platform.architecture}</span>
                      <span className="platform-pending-text">
                        Tap to configure headers
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="platform-empty">
                    <span className="platform-empty-icon">+</span>
                    <span className="platform-empty-text">
                      Select a target platform to begin
                    </span>
                  </div>
                )}
              </div>
              <ToolchainStatus state={toolchainState} />
            </>
          )}

          {/* Libraries Tab Content */}
          {rightSidebarTab === "libraries" && (
            <div className="library-panel-container">
              <LibraryPanel
                platformId={
                  selectedPlatform?.platformId as
                    | "stm32"
                    | "esp32"
                    | "nrf"
                    | "rp2040"
                    | undefined
                }
                architecture={
                  selectedPlatform?.family.architecture as
                    | "cortex-m0"
                    | "cortex-m0+"
                    | "cortex-m3"
                    | "cortex-m4"
                    | "cortex-m4f"
                    | "cortex-m7"
                    | "cortex-m7f"
                    | undefined
                }
                onLog={log}
                onLibraryFilesChanged={(files) => {
                  // Add library files to VFS as read-only
                  let configTemplatesCopied = 0;
                  for (const [path, content] of files) {
                    addFile(path, content, false); // false = read-only

                    // Check for config templates and copy them to /src/ for user customization
                    const configMatch = path.match(
                      /^\/libs\/[^/]+\/config\/(.+)$/,
                    );
                    if (configMatch) {
                      const configFileName = configMatch[1];
                      const userConfigPath = `/src/${configFileName}`;
                      // Add as editable file in user's src directory
                      addFile(userConfigPath, content, true); // true = editable
                      configTemplatesCopied++;
                    }
                  }
                  log(`Added ${files.size} library files to /libs`, "success");
                  if (configTemplatesCopied > 0) {
                    log(
                      `Copied ${configTemplatesCopied} config template(s) to /src - customize as needed`,
                      "info",
                    );
                  }
                }}
                onLibraryUninstalled={(name) => {
                  // Remove library folder from VFS
                  const libPath = `/libs/${name}`;
                  deleteDirectory(libPath);
                  log(`Removed ${name} from /libs`, "info");
                }}
              />
            </div>
          )}
        </div>

        {/* Main editor area */}
        <div className="editor-area">
          <FileTabs />
          {state.activeFile ? (
            activeFileIsBinary && binaryContent ? (
              <HexViewer data={binaryContent} filename={state.activeFile} />
            ) : (
              <EditorPanel
                sourceCode={editorContent}
                onChange={handleEditorChange}
                getVFSFiles={getFilesForIntellisense}
              />
            )
          ) : (
            <div className="welcome-placeholder">
              <div className="welcome-content">
                <div className="welcome-icon">⚡</div>
                <h2>Welcome to BattleForge</h2>
                <p>Browser-based embedded firmware development</p>
                <div className="welcome-steps">
                  <div className="welcome-step">
                    <span className="step-number">1</span>
                    <span className="step-text">Select a target platform</span>
                  </div>
                  <div className="welcome-step">
                    <span className="step-number">2</span>
                    <span className="step-text">Write your C code</span>
                  </div>
                  <div className="welcome-step">
                    <span className="step-number">3</span>
                    <span className="step-text">Compile to ARM firmware</span>
                  </div>
                </div>
                <button
                  className="welcome-start-btn"
                  onClick={() => setIsPlatformModalOpen(true)}
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Terminal with resize handle */}
        <div className="terminal-area" style={{ height: terminalHeight }}>
          <div
            className={`resize-handle resize-handle-terminal ${isResizing === "terminal" ? "resizing" : ""}`}
            onMouseDown={(e) => handleResizeStart("terminal", e)}
          />
          <TerminalPanel output={output} />
        </div>
      </div>

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

      <style jsx>{`
        .battleforge-ide {
          height: 100vh;
          background: #0a0a0a;
          color: #ededed;
          overflow: hidden;
        }

        .ide-layout {
          display: grid;
          grid-template-columns: 220px 1fr 280px;
          grid-template-rows: auto 1fr auto;
          grid-template-areas:
            "toolbar toolbar toolbar"
            "sidebar-left editor sidebar-right"
            "sidebar-left terminal sidebar-right";
          height: 100%;
          gap: 1px;
          background: #333;
        }

        .toolbar-area {
          grid-area: toolbar;
          background: #111;
        }

        .sidebar-left {
          grid-area: sidebar-left;
          background: #111;
          overflow: hidden;
          position: relative;
        }

        .sidebar-right {
          grid-area: sidebar-right;
          background: #111;
          padding: 12px;
          padding-top: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
        }

        .sidebar-tabs {
          display: flex;
          gap: 4px;
          padding: 8px 0;
          border-bottom: 1px solid #333;
          margin-bottom: 4px;
          position: sticky;
          top: 0;
          background: #111;
          z-index: 5;
        }

        .sidebar-tab {
          flex: 1;
          padding: 8px 12px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 4px;
          color: #888;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sidebar-tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ccc;
        }

        .sidebar-tab.active {
          background: rgba(0, 255, 157, 0.1);
          border-color: rgba(0, 255, 157, 0.3);
          color: #00ff9d;
        }

        .library-panel-container {
          flex: 1;
          min-height: 0;
          margin: -12px;
          margin-top: 0;
        }

        /* Horizontal resize handles for sidebars */
        .resize-handle-h {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 6px;
          background: transparent;
          cursor: ew-resize;
          z-index: 10;
          transition: background 0.15s ease;
        }

        .resize-handle-left {
          right: 0;
        }

        .resize-handle-right {
          left: 0;
        }

        .resize-handle-h:hover {
          background: rgba(0, 136, 255, 0.3);
        }

        .resize-handle-h.resizing {
          background: rgba(0, 255, 157, 0.3);
        }

        /* Platform Card */
        .platform-card {
          background: #0a0a0a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .platform-card:hover {
          border-color: var(--accent-primary, #00ff9d);
        }

        .platform-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .platform-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #888;
        }

        .platform-change-btn {
          font-size: 0.7rem;
          padding: 3px 8px;
          background: rgba(0, 255, 157, 0.1);
          border: 1px solid rgba(0, 255, 157, 0.3);
          color: var(--accent-primary, #00ff9d);
          border-radius: 4px;
          cursor: pointer;
        }

        .platform-change-btn:hover {
          background: rgba(0, 255, 157, 0.2);
        }

        .platform-selected .platform-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 8px;
        }

        .platform-details {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 0.75rem;
        }

        .platform-details span {
          padding: 2px 8px;
          background: #1a1a1a;
          border-radius: 4px;
          color: #888;
        }

        .platform-pending-text {
          color: var(--accent-primary) !important;
          font-style: italic;
        }

        .platform-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          color: #666;
        }

        .platform-empty-icon {
          width: 36px;
          height: 36px;
          border: 2px dashed #444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #555;
        }

        .platform-empty-text {
          font-size: 0.8rem;
          text-align: center;
        }

        .editor-area {
          grid-area: editor;
          background: #1e1e1e;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .welcome-placeholder {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #0a0a0a 0%, #111 100%);
        }

        .welcome-content {
          text-align: center;
          max-width: 400px;
          padding: 40px;
        }

        .welcome-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .welcome-content h2 {
          margin: 0 0 8px 0;
          font-size: 1.8rem;
          font-weight: 600;
          color: #fff;
        }

        .welcome-content p {
          margin: 0 0 32px 0;
          font-size: 1rem;
          color: #888;
        }

        .welcome-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }

        .welcome-step {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #222;
          border-radius: 8px;
          text-align: left;
        }

        .step-number {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(0, 255, 157, 0.15);
          border: 1px solid rgba(0, 255, 157, 0.3);
          color: #00ff9d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .step-text {
          color: #ccc;
          font-size: 0.9rem;
        }

        .welcome-start-btn {
          padding: 14px 32px;
          background: linear-gradient(135deg, #00ff9d 0%, #00cc7d 100%);
          border: none;
          border-radius: 8px;
          color: #000;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .welcome-start-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
        }

        .terminal-area {
          grid-area: terminal;
          background: #111;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .resize-handle {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: transparent;
          cursor: ns-resize;
          z-index: 10;
          transition: background 0.15s ease;
        }

        .resize-handle::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 3px;
          background: #444;
          border-radius: 2px;
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .resize-handle:hover {
          background: rgba(0, 136, 255, 0.2);
        }

        .resize-handle:hover::after {
          opacity: 1;
          background: #00ff9d;
        }

        .resize-handle.resizing {
          background: rgba(0, 255, 157, 0.2);
        }

        .resize-handle.resizing::after {
          opacity: 1;
          background: #00ff9d;
        }

        /* Responsive adjustments */
        @media (max-width: 1200px) {
          .ide-layout {
            grid-template-columns: 180px 1fr 240px;
          }
        }

        @media (max-width: 900px) {
          .ide-layout {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr 200px;
            grid-template-areas:
              "toolbar"
              "sidebar-right"
              "editor"
              "terminal";
          }

          .sidebar-left {
            display: none;
          }

          .sidebar-right {
            flex-direction: row;
            padding: 8px;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}

export function BattleForgeIDE() {
  return (
    <VFSProvider>
      <BattleForgeIDEContent />
    </VFSProvider>
  );
}
