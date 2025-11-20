'use client';

import { useState, useEffect } from 'react';
import { EditorPanel } from './EditorPanel';
import { TerminalPanel } from './TerminalPanel';
import { ToolbarPanel } from './ToolbarPanel';
import { ProjectProvider } from '../lib/context/ProjectContext';
import { getClangWasmLoader } from '../lib/compiler/ClangWasmLoader';
import type { LoadProgress } from '../lib/compiler/ClangWasmLoader';

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
    { message: 'Initializing ARM Clang compiler...', type: 'info' },
  ]);

  const [isCompiling, setIsCompiling] = useState(false);
  const [compilerReady, setCompilerReady] = useState(false);

  const log = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, { message, type, timestamp }]);
  };

  // Load compiler on mount
  useEffect(() => {
    const loadCompiler = async () => {
      try {
        const loader = getClangWasmLoader();

        await loader.load((progress: LoadProgress) => {
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

        const version = await loader.getVersion();
        log(`Compiler version: ${version}`, 'info');
      } catch (error) {
        log(`Failed to load compiler: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      }
    };

    loadCompiler();
  }, []);

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
      const loader = getClangWasmLoader();

      // Prepare compilation arguments for ARM Cortex-M3 (STM32F103)
      const args = [
        '-target', 'arm-none-eabi',
        '-mcpu=cortex-m3',
        '-mthumb',
        '-nostdlib',
        '-ffreestanding',
        '-c',
        '/main.c',
        '-o', '/main.o'
      ];

      log('Compiling for ARM Cortex-M3...', 'info');

      const result = await loader.execute({
        args,
        files: {
          '/main.c': sourceCode
        },
        onStdout: (data) => {
          if (data.trim()) log(data.trim(), 'info');
        },
        onStderr: (data) => {
          if (data.trim()) log(data.trim(), 'warning');
        }
      });

      if (result.success) {
        const objFile = result.files?.get('/main.o');
        if (objFile) {
          log(`✓ Compilation successful!`, 'success');
          log(`Generated ${objFile.length} bytes (object file)`, 'success');
          log('Output: /main.o', 'info');
        } else {
          log('Compilation completed but no output file generated', 'warning');
        }
      } else {
        log(`✗ Compilation failed with exit code ${result.exitCode}`, 'error');
        if (result.stderr) {
          log('Compiler errors:', 'error');
          result.stderr.split('\n').forEach(line => {
            if (line.trim()) log(line, 'error');
          });
        }
      }
    } catch (error) {
      log(`Compilation error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
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
              onCompile={handleCompile}
              onFlash={handleFlash}
            />
          </div>

          <EditorPanel
            sourceCode={sourceCode}
            onChange={setSourceCode}
          />

          <TerminalPanel output={output} />
        </div>
      </div>
    </ProjectProvider>
  );
}
