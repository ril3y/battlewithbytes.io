'use client';

import { useRef, useCallback, useEffect } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import type * as Monaco from 'monaco-editor';
import { registerCHeaderCompletion } from '../lib/editor';

interface VFSFile {
  content: string | Uint8Array;
  readOnly?: boolean;
}

interface EditorPanelProps {
  sourceCode: string;
  onChange: (code: string) => void;
  language?: string;
  readOnly?: boolean;
  /** Function to get all VFS files for intellisense */
  getVFSFiles?: () => Map<string, VFSFile>;
}

/**
 * Map VFS language types to Monaco editor language IDs
 */
function getMonacoLanguage(language: string): string {
  switch (language) {
    case 'c':
      return 'c';
    case 'cpp':
      return 'cpp';
    case 'h':
      return 'cpp';  // Headers use C++ mode
    case 'ino':
      return 'cpp';  // Arduino sketches are essentially C++
    case 'makefile':
      return 'makefile';
    case 'ld':
      return 'plaintext';  // Linker scripts
    case 'asm':
      return 'plaintext';  // Assembly
    default:
      return 'plaintext';
  }
}

export function EditorPanel({
  sourceCode,
  onChange,
  language = 'c',
  readOnly = false,
  getVFSFiles
}: EditorPanelProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const completionDisposableRef = useRef<Monaco.IDisposable | null>(null);

  // Map language to Monaco-compatible language ID
  const monacoLanguage = getMonacoLanguage(language);

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    // Store Monaco reference for completion provider
    monacoRef.current = monaco;

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
      // Enable suggestions inside strings for #include autocomplete
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,  // This enables suggestions inside "..." strings
      },
      suggestOnTriggerCharacters: true,
    });
  }, []);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  }, [onChange]);

  // Register C header completion provider when Monaco and VFS files getter are available
  useEffect(() => {
    if (!monacoRef.current || !getVFSFiles) {
      return;
    }

    // Dispose previous registration if any
    if (completionDisposableRef.current) {
      completionDisposableRef.current.dispose();
    }

    // Register the completion provider
    completionDisposableRef.current = registerCHeaderCompletion(
      monacoRef.current,
      getVFSFiles
    );

    // Cleanup on unmount
    return () => {
      if (completionDisposableRef.current) {
        completionDisposableRef.current.dispose();
        completionDisposableRef.current = null;
      }
    };
  }, [getVFSFiles]);

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
        language={monacoLanguage}
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
