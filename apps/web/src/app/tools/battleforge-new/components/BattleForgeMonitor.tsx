'use client';

import { useState } from 'react';
import { EditorPanel } from './EditorPanel';
import { TerminalPanel } from './TerminalPanel';
import { ToolbarPanel } from './ToolbarPanel';
import { ProjectProvider } from '../lib/context/ProjectContext';
import { loadClangModule, executeClang, getClangVersion } from '../lib/compiler/EmscriptenClangLoader';
import type { LoadProgress } from '../lib/compiler/EmscriptenClangLoader';
import { executeLld } from '../lib/compiler/EmscriptenLldLoader';

export function BattleForgeMonitor() {
  const [sourceCode, setSourceCode] = useState(`// LED Blink Example - Generic Embedded C
// Select your target chip from the toolbar above
// Supports: STM32, ESP32, and more!

// Example for STM32F103C8T6
#define RCC_APB2ENR  (*(volatile unsigned int*)0x40021018)
#define GPIOC_CRH    (*(volatile unsigned int*)0x40011004)
#define GPIOC_ODR    (*(volatile unsigned int*)0x4001100C)

void delay(int count) {
    for(int i = 0; i < count; i++) {
        __asm__("nop");
    }
}

void main(void) {
    // Enable GPIO clock
    RCC_APB2ENR |= (1 << 4);

    // Configure as output
    GPIOC_CRH &= ~(0xF << 20);
    GPIOC_CRH |= (0x3 << 20);

    // Blink loop
    while(1) {
        GPIOC_ODR ^= (1 << 13);
        delay(100000);
    }
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

    try {
      await loadClangModule((progress: LoadProgress) => {
        if (progress.stage === 'downloading') {
          log(progress.message, 'info');
        } else if (progress.stage === 'instantiating') {
          log(progress.message, 'info');
        } else if (progress.stage === 'ready') {
          log('✓ ARM Clang compiler ready', 'success');
          setCompilerReady(true);
        } else if (progress.stage === 'error') {
          log(`✗ Compiler load failed: ${progress.message}`, 'error');
        }
      });

      const version = await getClangVersion();
      log(`Compiler version: ${version}`, 'info');
    } catch (error) {
      log(`Failed to load compiler: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Minimal linker script for STM32F103C8T6 (64KB Flash, 20KB RAM)
  const linkerScript = `
/* STM32F103C8T6 Memory Layout */
MEMORY
{
  FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 64K
  RAM (rwx)   : ORIGIN = 0x20000000, LENGTH = 20K
}

/* Entry point */
ENTRY(main)

SECTIONS
{
  /* Code goes in FLASH */
  .text : {
    *(.text*)
    *(.rodata*)
  } > FLASH

  /* Initialized data */
  .data : {
    *(.data*)
  } > RAM AT > FLASH

  /* Uninitialized data */
  .bss : {
    *(.bss*)
    *(COMMON)
  } > RAM
}
`;

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
      // Step 1: Compile C to object file
      const compileArgs = [
        '--target=thumbv7m-none-eabi',
        '-mcpu=cortex-m3',
        '-mthumb',
        '-nostdlib',
        '-ffreestanding',
        '-c',
        '/main.c',
        '-o', '/main.o'
      ];

      log('Step 1: Compiling for ARM Cortex-M3...', 'info');

      const compileResult = await executeClang(
        compileArgs,
        { '/main.c': sourceCode },
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

      const linkArgs = [
        '-flavor', 'gnu',
        '-nostdlib',
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

          <EditorPanel
            sourceCode={sourceCode}
            onChange={setSourceCode}
          />

          {/* VFS Console disabled - iframe isolation prevents direct VFS access */}
          <TerminalPanel output={output} />
        </div>
      </div>
    </ProjectProvider>
  );
}
