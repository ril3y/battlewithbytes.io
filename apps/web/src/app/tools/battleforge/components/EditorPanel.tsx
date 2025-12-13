'use client';

import { useRef, useCallback } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface EditorPanelProps {
  sourceCode: string;
  onChange: (code: string) => void;
  language?: string;
  readOnly?: boolean;
}

export function EditorPanel({
  sourceCode,
  onChange,
  language = 'c',
  readOnly = false
}: EditorPanelProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    // Define custom dark theme matching site colors
    monaco.editor.defineTheme('battleforge-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569cd6' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'type', foreground: '4ec9b0' },
        { token: 'function', foreground: 'dcdcaa' },
        { token: 'variable', foreground: '9cdcfe' },
        { token: 'constant', foreground: '4fc1ff' },
        { token: 'operator', foreground: 'd4d4d4' },
        { token: 'delimiter', foreground: 'd4d4d4' },
        { token: 'preprocessor', foreground: 'c586c0' },
      ],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.foreground': '#ededed',
        'editor.lineHighlightBackground': '#1a1a1a',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editorLineNumber.foreground': '#555555',
        'editorLineNumber.activeForeground': '#00ff9d',
        'editorCursor.foreground': '#00ff9d',
        'editor.selectionHighlightBackground': '#add6ff26',
        'editorIndentGuide.background': '#333333',
        'editorIndentGuide.activeBackground': '#555555',
        'editorGutter.background': '#0a0a0a',
        'scrollbarSlider.background': '#33333380',
        'scrollbarSlider.hoverBackground': '#44444480',
        'scrollbarSlider.activeBackground': '#55555580',
      },
    });
  }, []);

  const handleEditorMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;

    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontLigatures: true,
      lineHeight: 1.6,
      renderLineHighlight: 'line',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      padding: { top: 12, bottom: 12 },
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
    });
  }, []);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  }, [onChange]);

  return (
    <div className="editor-panel" style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: '#0a0a0a',
    }}>
      <Editor
        height="100%"
        language={language}
        value={sourceCode}
        onChange={handleEditorChange}
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
        theme="battleforge-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
        loading={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#888',
            fontFamily: 'monospace',
          }}>
            Loading editor...
          </div>
        }
      />
    </div>
  );
}
