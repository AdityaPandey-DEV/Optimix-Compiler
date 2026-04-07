import { useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  source: string;
  onChange: (val: string) => void;
  onCompile: () => void;
  isCompiling: boolean;
  error?: string;
  examples: { name: string; description: string; code: string }[];
  onExampleChange: (code: string) => void;
}

export default function CodeEditor({
  source, onChange, onCompile, isCompiling, error, examples, onExampleChange
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register .optx language
    monaco.languages.register({ id: 'optx' });
    monaco.languages.setMonarchTokensProvider('optx', {
      keywords: ['int', 'void', 'return', 'if', 'else', 'while', 'print'],
      operators: ['+', '-', '*', '/', '=', '==', '!=', '<', '>'],
      tokenizer: {
        root: [
          [/\/\/.*$/, 'comment'],
          [/[a-zA-Z_]\w*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier',
            },
          }],
          [/\d+/, 'number'],
          [/[{}()\[\];,]/, 'delimiter'],
          [/[+\-*/=<>!]+/, 'operator'],
        ],
      },
    });

    // Define dark theme for optx
    monaco.editor.defineTheme('optimix-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'b388ff', fontStyle: 'bold' },
        { token: 'identifier', foreground: '4dd0e1' },
        { token: 'number', foreground: 'ffb74d' },
        { token: 'operator', foreground: 'f06292' },
        { token: 'delimiter', foreground: '90a4ae' },
        { token: 'comment', foreground: '546e7a', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#131829',
        'editor.foreground': '#e8eaed',
        'editor.lineHighlightBackground': '#1a2040',
        'editorCursor.foreground': '#b388ff',
        'editor.selectionBackground': '#3a3070',
        'editorLineNumber.foreground': '#3a3f5c',
        'editorLineNumber.activeForeground': '#7c86b2',
      },
    });
    monaco.editor.setTheme('optimix-dark');

    // Ctrl+Enter to compile
    editor.addAction({
      id: 'compile',
      label: 'Compile',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => onCompile(),
    });
  };

  // Set error markers
  useEffect(() => {
    if (!editorRef.current) return;
    const monaco = (window as any).monaco;
    if (!monaco) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    if (error) {
      // Try to parse line number from error
      const lineMatch = error.match(/Line (\d+)/);
      const line = lineMatch ? parseInt(lineMatch[1]) : 1;
      monaco.editor.setModelMarkers(model, 'optimix', [{
        startLineNumber: line,
        startColumn: 1,
        endLineNumber: line,
        endColumn: 1000,
        message: error,
        severity: monaco.MarkerSeverity.Error,
      }]);
    } else {
      monaco.editor.setModelMarkers(model, 'optimix', []);
    }
  }, [error]);

  return (
    <>
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-icon">📝</span>
          Source Code (.optx)
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            className="example-select"
            onChange={(e) => {
              const idx = parseInt(e.target.value);
              if (idx >= 0) onExampleChange(examples[idx].code);
            }}
            defaultValue="-1"
          >
            <option value="-1" disabled>Load Example...</option>
            {examples.map((ex, i) => (
              <option key={i} value={i}>{ex.name} — {ex.description}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={onCompile} disabled={isCompiling}>
            {isCompiling ? (
              <><span className="loading-spinner" /> Compiling...</>
            ) : (
              <>▶ Compile</>
            )}
          </button>
        </div>
      </div>

      <div className="editor-wrapper">
        <Editor
          height="100%"
          language="optx"
          theme="optimix-dark"
          value={source}
          onChange={(val) => onChange(val || '')}
          onMount={handleMount}
          options={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 13,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            renderLineHighlight: 'line',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            bracketPairColorization: { enabled: true },
            automaticLayout: true,
          }}
        />
      </div>
    </>
  );
}
