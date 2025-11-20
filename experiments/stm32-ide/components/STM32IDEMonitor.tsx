'use client';

import { useState } from 'react';
import { EditorPanel } from './EditorPanel';
import { TerminalPanel } from './TerminalPanel';
import { ToolbarPanel } from './ToolbarPanel';
import { ProjectProvider } from '../lib/context/ProjectContext';

export function STM32IDEMonitor() {
  const [sourceCode, setSourceCode] = useState(`// STM32F103C8T6 Blink Example
#define RCC_APB2ENR  (*(volatile unsigned int*)0x40021018)
#define GPIOC_CRH    (*(volatile unsigned int*)0x40011004)
#define GPIOC_ODR    (*(volatile unsigned int*)0x4001100C)

void delay(int count) {
    for(int i = 0; i < count; i++) {
        __asm__("nop");
    }
}

void main(void) {
    // Enable GPIOC clock
    RCC_APB2ENR |= (1 << 4);

    // Configure PC13 as output
    GPIOC_CRH &= ~(0xF << 20);
    GPIOC_CRH |= (0x3 << 20);

    // Blink loop
    while(1) {
        GPIOC_ODR ^= (1 << 13);
        delay(100000);
    }
}
`);

  const [output, setOutput] = useState<Array<{message: string, type: 'info' | 'success' | 'error' | 'warning'}>>([
    { message: 'STM32 IDE Ready', type: 'info' },
    { message: 'Waiting for compilation...', type: 'info' },
  ]);

  const log = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setOutput(prev => [...prev, { message, type }]);
  };

  const handleCompile = async () => {
    log('Starting compilation...', 'info');
    log('=== MOCK MODE ===', 'warning');
    log('Real compiler integration pending', 'warning');

    setTimeout(() => {
      log('Parsing C source...', 'info');
    }, 100);

    setTimeout(() => {
      log('Generating ARM Thumb-2 code...', 'info');
    }, 300);

    setTimeout(() => {
      log('Compilation successful!', 'success');
      log('Generated 8 bytes of ARM code', 'success');
    }, 600);
  };

  const handleFlash = async () => {
    log('Flash operation not yet implemented', 'warning');
    log('Will integrate STM32 UART bootloader protocol', 'info');
  };

  return (
    <ProjectProvider>
      <div className="stm32-ide-container">
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
