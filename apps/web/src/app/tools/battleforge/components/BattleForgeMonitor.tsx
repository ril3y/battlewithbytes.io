'use client';

import { useState, useCallback } from 'react';
import { EditorPanel } from './EditorPanel';
import { TerminalPanel } from './TerminalPanel';
import { ToolbarPanel } from './ToolbarPanel';
import { PlatformSelector } from './PlatformSelector';
import { ToolchainStatus } from './ToolchainStatus';
import { ProjectProvider } from '../lib/context/ProjectContext';
import { loadClangModule, executeClang, getClangVersion } from '../lib/compiler/EmscriptenClangLoader';
import type { LoadProgress } from '../lib/compiler/EmscriptenClangLoader';
import { executeLld, loadLldModule } from '../lib/compiler/EmscriptenLldLoader';
import type { SelectedPlatform, ToolchainState, LoadingProgress } from '../lib/platform/types';
import { getPlatformManager } from '../lib/platform/PlatformManager';
import { loadHeaders } from '../lib/platform/HeaderLoader';

export function BattleForgeMonitor() {
  const [sourceCode, setSourceCode] = useState(`/**
 * STM32F103C8T6 (Blue Pill) LED Blink Example
 * Uses CMSIS headers for proper register definitions.
 * The onboard LED is connected to PC13 (active low).
 *
 * Select STM32 > F1 > STM32F103C8T6 from the platform selector.
 */

#include "stm32f1xx.h"

/* Simple delay using a busy loop */
static void delay(volatile unsigned int count) {
    while (count--) {
        __asm__("nop");
    }
}

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
`);

  const [output, setOutput] = useState<Array<{message: string, type: 'info' | 'success' | 'error' | 'warning', timestamp?: string}>>([
    { message: 'BattleForge Ready - Compile firmware for embedded systems', type: 'info' },
    { message: 'Click "Load Compiler" to initialize ARM Clang WASM (~19MB download)', type: 'info' },
  ]);

  const [isCompiling, setIsCompiling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [compilerReady, setCompilerReady] = useState(false);
  const [showVFSConsole, setShowVFSConsole] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SelectedPlatform | null>(null);
  const [cachedHeaders, setCachedHeaders] = useState<Map<string, Uint8Array> | null>(null);

  // Toolchain state for status display
  const [toolchainState, setToolchainState] = useState<ToolchainState>({
    clang: { stage: 'idle', current: 0, total: 0, message: '' },
    lld: { stage: 'idle', current: 0, total: 0, message: '' },
    headers: { stage: 'idle', current: 0, total: 0, message: '' },
    libs: { stage: 'idle', current: 0, total: 0, message: '' },
  });

  const updateToolchainComponent = useCallback((
    component: keyof ToolchainState,
    update: Partial<LoadingProgress>
  ) => {
    setToolchainState(prev => ({
      ...prev,
      [component]: { ...prev[component], ...update }
    }));
  }, []);

  const log = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, { message, type, timestamp }]);
  };

  const handleLoadCompiler = async () => {
    if (compilerReady) {
      log('Compiler already loaded', 'warning');
      return;
    }

    if (isLoading) {
      log('Compiler load already in progress', 'warning');
      return;
    }

    setIsLoading(true);
    log('Starting compiler download...', 'info');
    updateToolchainComponent('clang', { stage: 'downloading', message: 'Starting download...' });

    try {
      await loadClangModule((progress: LoadProgress) => {
        if (progress.stage === 'downloading') {
          log(progress.message, 'info');
          updateToolchainComponent('clang', {
            stage: 'downloading',
            message: progress.message,
            current: progress.current || 0,
            total: progress.total || 0
          });
        } else if (progress.stage === 'instantiating') {
          log(progress.message, 'info');
          updateToolchainComponent('clang', { stage: 'extracting', message: 'Instantiating WASM...' });
        } else if (progress.stage === 'ready') {
          log('✓ ARM Clang compiler ready', 'success');
          updateToolchainComponent('clang', { stage: 'ready', message: 'Ready' });
          setCompilerReady(true);
        } else if (progress.stage === 'error') {
          log(`✗ Compiler load failed: ${progress.message}`, 'error');
          updateToolchainComponent('clang', { stage: 'error', message: progress.message });
        }
      });

      const version = await getClangVersion();
      log(`Compiler version: ${version}`, 'info');

      // Mark LLD as ready too (it's loaded with Clang)
      updateToolchainComponent('lld', { stage: 'ready', message: 'Ready' });
    } catch (error) {
      log(`Failed to load compiler: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      updateToolchainComponent('clang', { stage: 'error', message: 'Load failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlatformSelect = useCallback((platform: SelectedPlatform | null) => {
    setSelectedPlatform(platform);
    // Clear cached headers when platform changes
    setCachedHeaders(null);
    updateToolchainComponent('headers', { stage: 'idle', message: '' });
    if (platform) {
      log(`Platform selected: ${platform.device.name} (${platform.family.architecture})`, 'info');
    }
  }, [updateToolchainComponent]);

  // Fallback linker script for when no platform is selected
  const defaultLinkerScript = `
/* Generic ARM Cortex-M Memory Layout */
MEMORY
{
  FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 64K
  RAM (rwx)   : ORIGIN = 0x20000000, LENGTH = 20K
}

ENTRY(main)

SECTIONS
{
  .text : {
    *(.text*)
    *(.rodata*)
  } > FLASH

  .data : {
    *(.data*)
  } > RAM AT > FLASH

  .bss : {
    *(.bss*)
    *(COMMON)
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
        log(`Warning: Could not load linker script from ${linkerUrl}, using default`, 'warning');
        return defaultLinkerScript;
      }
      return await response.text();
    } catch (err) {
      log(`Warning: Failed to load linker script: ${err}`, 'warning');
      return defaultLinkerScript;
    }
  };

  const handleCompile = async () => {
    if (!compilerReady) {
      log('Compiler not ready yet. Please wait...', 'warning');
      return;
    }

    if (isCompiling) {
      log('Compilation already in progress', 'warning');
      return;
    }

    setIsCompiling(true);
    log('Starting compilation...', 'info');

    try {
      // Get platform-specific compiler flags or use defaults
      const defaultFlags = [
        '--target=thumbv7m-none-eabi',
        '-mcpu=cortex-m3',
        '-mthumb',
        '-nostdlib',
        '-ffreestanding',
      ];

      const platformFlags = selectedPlatform?.family.compilerFlags || defaultFlags;
      const archName = selectedPlatform?.family.architecture || 'cortex-m3';

      // Load headers if platform is selected
      let headers = cachedHeaders;
      if (selectedPlatform && !headers) {
        log('Loading platform headers...', 'info');
        updateToolchainComponent('headers', { stage: 'downloading', message: 'Loading headers...' });

        try {
          headers = await loadHeaders(
            selectedPlatform.platformId,
            selectedPlatform.familyId,
            selectedPlatform.family.headers.url,
            selectedPlatform.family.headers.checksum,
            (progress) => {
              updateToolchainComponent('headers', {
                stage: progress.stage === 'ready' ? 'ready' : progress.stage === 'error' ? 'error' : 'downloading',
                message: progress.message,
                current: progress.current || 0,
                total: progress.total || 0
              });
              log(progress.message, progress.stage === 'error' ? 'error' : 'info');
            }
          );
          setCachedHeaders(headers);
          updateToolchainComponent('headers', { stage: 'ready', message: `${headers.size} headers loaded` });
        } catch (err) {
          log(`Failed to load headers: ${err}`, 'error');
          updateToolchainComponent('headers', { stage: 'error', message: 'Failed to load' });
        }
      }

      // Build files map with source code and headers
      const files: Record<string, string | Uint8Array> = {
        '/main.c': sourceCode
      };

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
          const dir = path.substring(0, path.lastIndexOf('/'));
          if (dir) dirs.add(dir);
        }
        for (const dir of dirs) {
          includePaths.push(`-I${dir}`);
        }
      }

      // Add device define if available
      const defines: string[] = [];
      if (selectedPlatform?.device.defines) {
        for (const def of selectedPlatform.device.defines) {
          defines.push(`-D${def}`);
        }
      }

      // Step 1: Compile C to object file
      const compileArgs = [
        ...platformFlags,
        ...includePaths,
        ...defines,
        '-c',
        '/main.c',
        '-o', '/main.o'
      ];

      log(`Step 1: Compiling for ARM ${archName}...`, 'info');
      if (includePaths.length > 0) {
        log(`Include paths: ${includePaths.join(' ')}`, 'info');
      }
      if (defines.length > 0) {
        log(`Defines: ${defines.join(' ')}`, 'info');
      }

      const compileResult = await executeClang(
        compileArgs,
        files,
        (text) => { if (text.trim()) log(text.trim(), 'info'); },
        (text) => { if (text.trim()) log(text.trim(), 'warning'); }
      );

      if (!compileResult.success) {
        log(`✗ Compilation failed with exit code ${compileResult.exitCode}`, 'error');
        if (compileResult.stderr) {
          compileResult.stderr.split('\n').forEach(line => {
            if (line.trim()) log(line, 'error');
          });
        }
        return;
      }

      const objFile = compileResult.outputFiles?.get('/main.o');
      if (!objFile) {
        log('Compilation completed but no object file generated', 'error');
        log(`Available files: ${Array.from(compileResult.outputFiles?.keys() || []).join(', ') || 'none'}`, 'info');
        return;
      }

      log(`✓ Compilation successful! (${objFile.length} bytes)`, 'success');

      // Show object file info
      const magic = Array.from(objFile.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ');
      log(`Object file: /main.o (ELF magic: ${magic})`, 'info');

      // Step 2: Link with LLD
      log('Step 2: Linking with LLD...', 'info');

      // Load the platform-specific linker script
      const linkerScript = await loadPlatformLinkerScript();
      if (selectedPlatform) {
        log(`Using linker script: ${selectedPlatform.device.linkerScript}`, 'info');
      }

      const linkArgs = [
        '-flavor', 'gnu',
        '-nostdlib',
        '--gc-sections',
        '--script=/linker.ld',
        '/main.o',
        '-o', '/firmware.elf'
      ];

      const linkResult = await executeLld(
        linkArgs,
        {
          '/main.o': objFile,
          '/linker.ld': linkerScript
        },
        (text) => { if (text.trim()) log(text.trim(), 'info'); },
        (text) => { if (text.trim()) log(text.trim(), 'warning'); }
      );

      if (!linkResult.success) {
        log(`✗ Linking failed with exit code ${linkResult.exitCode}`, 'error');
        if (linkResult.stderr) {
          linkResult.stderr.split('\n').forEach(line => {
            if (line.trim()) log(line, 'error');
          });
        }
        return;
      }

      const elfFile = linkResult.outputFiles?.get('/firmware.elf');
      if (!elfFile) {
        log('Linking completed but no ELF file generated', 'error');
        log(`Available files: ${Array.from(linkResult.outputFiles?.keys() || []).join(', ') || 'none'}`, 'info');
        return;
      }

      log(`✓ Linking successful! (${elfFile.length} bytes)`, 'success');

      // Show ELF file info
      const elfMagic = Array.from(elfFile.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ');
      log(`Firmware ELF: /firmware.elf (ELF magic: ${elfMagic})`, 'info');
      log('Build complete! Ready for flashing.', 'success');
    } catch (error) {
      log(`Build error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleFlash = async () => {
    log('Flash operation not yet implemented', 'warning');
    log('Will support UART bootloader protocols for various MCUs', 'info');
  };

  return (
    <ProjectProvider>
      <div className="battleforge-container">
        <div className="ide-grid">
          <div className="toolbar-container">
            <ToolbarPanel
              onLoadCompiler={handleLoadCompiler}
              onCompile={handleCompile}
              onFlash={handleFlash}
              onToggleConsole={() => setShowVFSConsole(!showVFSConsole)}
              isLoading={isLoading}
              compilerReady={compilerReady}
              showConsole={showVFSConsole}
            />
          </div>

          {/* Sidebar with platform selector and toolchain status */}
          <div className="sidebar-container">
            <PlatformSelector
              onPlatformSelect={handlePlatformSelect}
              disabled={isCompiling}
            />
            <ToolchainStatus state={toolchainState} />
          </div>

          <EditorPanel
            sourceCode={sourceCode}
            onChange={setSourceCode}
          />

          {/* VFS Console disabled - iframe isolation prevents direct VFS access */}
          <TerminalPanel output={output} />
        </div>

        <style jsx>{`
          .sidebar-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            grid-column: 1;
            grid-row: 2;
            padding: 12px;
            overflow-y: auto;
            max-height: calc(100vh - 80px);
          }
        `}</style>
      </div>
    </ProjectProvider>
  );
}
