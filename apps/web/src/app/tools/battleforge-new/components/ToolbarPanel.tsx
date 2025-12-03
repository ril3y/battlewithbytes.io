'use client';

interface ToolbarPanelProps {
  onLoadCompiler: () => void;
  onCompile: () => void;
  onFlash: () => void;
  onToggleConsole?: () => void;
  isLoading?: boolean;
  compilerReady?: boolean;
  showConsole?: boolean;
}

export function ToolbarPanel({ onLoadCompiler, onCompile, onFlash, onToggleConsole, isLoading, compilerReady, showConsole }: ToolbarPanelProps) {
  return (
    <div className="toolbar">
      <button
        onClick={onLoadCompiler}
        disabled={isLoading || compilerReady}
        style={{ opacity: compilerReady ? 0.5 : 1 }}
      >
        {isLoading ? '⏳ Loading...' : compilerReady ? '✓ Loaded' : '📥 Load Compiler'}
      </button>
      <button
        onClick={onCompile}
        disabled={!compilerReady}
        style={{ opacity: compilerReady ? 1 : 0.5 }}
      >
        🔧 Compile Code
      </button>
      <button onClick={onFlash}>
        ⚡ Flash
      </button>
      <button disabled>
        📁 Save
      </button>
      <button disabled>
        📂 Load
      </button>
      <div style={{ flex: 1 }} />
      <button
        onClick={onToggleConsole}
        style={{
          background: showConsole ? 'var(--accent-primary)' : 'transparent',
          color: showConsole ? '#000' : 'var(--accent-primary)'
        }}
      >
        {showConsole ? '📊 Output' : '💻 VFS Console'}
      </button>
      <select
        style={{
          background: 'transparent',
          border: '1px solid var(--accent-primary)',
          color: 'var(--accent-primary)',
          padding: '8px 16px',
          borderRadius: '4px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
        }}
      >
        <option>STM32F103C8T6</option>
        <option disabled>STM32F401 (Coming Soon)</option>
        <option disabled>STM32G0 (Coming Soon)</option>
      </select>
    </div>
  );
}
