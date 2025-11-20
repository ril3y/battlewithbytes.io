# STM32 IDE Tool

Browser-based C compiler and flasher for STM32 microcontrollers.

## Structure

This tool follows the BattleWithBytes tool pattern:

```
stm32-ide/
├── page.tsx                    # Route entry point
├── layout.tsx                  # Empty layout for fullscreen
├── stm32-ide.css              # Tool-specific styles
├── components/
│   ├── STM32IDEMonitor.tsx    # Main component
│   ├── EditorPanel.tsx        # Code editor
│   ├── TerminalPanel.tsx      # Output/logs
│   └── ToolbarPanel.tsx       # Actions toolbar
├── lib/
│   ├── compiler/              # WASM compiler integration
│   └── context/               # React contexts
│       └── ProjectContext.tsx
└── hooks/                     # Custom hooks
```

## Development

### In experiments (current):

```bash
# Copy to apps/web/src/app/tools/ to test with Turborepo
cp -r experiments/stm32-ide apps/web/src/app/tools/

# Run dev server
pnpm dev

# Navigate to: http://localhost:3000/tools/stm32-ide
```

### Features

- ✅ Editor panel with syntax highlighting (basic)
- ✅ Terminal/output panel
- ✅ Toolbar with compile/flash buttons
- ✅ BattleWithBytes design system
- ⏳ WASM compiler integration (next)
- ⏳ STM32 UART flasher integration
- ⏳ Project save/load
- ⏳ Multiple file support

## Next Steps

1. Integrate TinyCC WASM compiler
2. Add STM32 UART bootloader flasher
3. Implement Monaco editor for better syntax highlighting
4. Add project templates
5. Implement firmware verification
