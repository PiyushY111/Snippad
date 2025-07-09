import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Editor from '@monaco-editor/react';
import { Moon, Sun, Play, Save, Zap, Info } from 'lucide-react';
import '../styles/CodeEditor.css';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import * as monaco from 'monaco-editor';
// Add ESLint4b import
import LinterLib from 'eslint-linter-browserify';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  fontSize?: number;
  tabSize?: number;
  lineNumbers?: boolean;
  minimap?: boolean;
}

export const CodeEditor = forwardRef<any, CodeEditorProps>(({ language, value, onChange, fontSize = 14, tabSize = 2, lineNumbers = true, minimap = false }, ref) => {
  // Initialize theme state with a unique key for each language
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem(`editor-theme-${language}`);
    return (savedTheme as 'light' | 'dark') || 'light';
  });
  
  const [isAutoSave, setIsAutoSave] = useState(() => {
    const savedAutoSave = localStorage.getItem(`editor-autosave-${language}`);
    return savedAutoSave ? JSON.parse(savedAutoSave) : true;
  });
  
  const [isLivePreview, setIsLivePreview] = useState(() => {
    const savedLivePreview = localStorage.getItem(`editor-livepreview-${language}`);
    return savedLivePreview ? JSON.parse(savedLivePreview) : true;
  });

  const editorRef = useRef<any>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved'>('saved');
  const [editorHeight, setEditorHeight] = useState(300);
  const resizerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  // ESLint instance (singleton)
  const linterRef = useRef<any>(null);
  if (!linterRef.current && typeof window !== 'undefined') {
    try {
      linterRef.current = new LinterLib.Linter();
    } catch (e) {
      linterRef.current = null;
    }
  }

  // Add lint messages state
  const [lintMessages, setLintMessages] = useState<any[]>([]);

  // Apply keybindings
  function handleEditorDidMount(editor: any, monacoInstance: typeof monaco) {
    editorRef.current = editor;
    if (ref) {
      // @ts-ignore
      ref.current = {
        insertSnippet: (snippet: string) => {
          const selection = editor.getSelection();
          editor.executeEdits('snippet', [
            {
              range: selection,
              text: snippet,
              forceMoveMarkers: true,
            },
          ], [selection]);
          editor.focus();
        },
      };
    }
    // Run code (Ctrl+Enter)
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter, () => {
      document.querySelector('[title="Run the code (Ctrl+Enter)"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    // Format code (Ctrl+Shift+F)
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyF, () => {
      handleFormatCode();
    });
    // Undo (Ctrl+Z)
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyZ, () => {
      document.querySelector('[title="Undo (Ctrl+Z)"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    // Redo (Ctrl+Y)
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyY, () => {
      document.querySelector('[title="Redo (Ctrl+Y)"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    // Save (Ctrl+S)
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
      alert('File saved! (implement real save logic)');
    });
    // Toggle comment (Ctrl+/)
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Slash, () => {
      editor.trigger('keyboard', 'editor.action.commentLine', null);
    });
    // Prevent browser default for Ctrl+S
    editor.onKeyDown((e: any) => {
      if ((e.ctrlKey || e.metaKey) && e.keyCode === monacoInstance.KeyCode.KeyS) {
        e.preventDefault();
      }
    });
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPos({ line: e.position.lineNumber, column: e.position.column });
    });
    editor.onDidChangeModelContent(() => {
      setSaveStatus('unsaved');
    });
    // Register custom Monaco theme using the provided monaco instance
    if (monacoInstance && monacoInstance.editor && monacoInstance.editor.defineTheme) {
      monacoInstance.editor.defineTheme('snippad-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: '', foreground: 'e6e6e6', background: '181a20' },
          { token: 'comment', foreground: '7a7a7a' },
          { token: 'string', foreground: 'e6e6e6' },
          { token: 'number', foreground: 'BCDD19' },
          { token: 'keyword', foreground: 'BCDD19', fontStyle: 'bold' },
          { token: 'identifier', foreground: 'e6e6e6' },
          { token: 'delimiter', foreground: 'BCDD19' },
          { token: 'type', foreground: 'BCDD19' },
          { token: 'function', foreground: 'BCDD19' },
          { token: 'variable', foreground: 'BCDD19' },
          { token: 'operator', foreground: 'BCDD19' },
          { token: 'class', foreground: 'BCDD19' },
          { token: 'interface', foreground: 'BCDD19' },
          { token: 'constant', foreground: 'BCDD19' },
          { token: 'tag', foreground: 'BCDD19' },
          { token: 'attribute.name', foreground: 'BCDD19' },
          { token: 'attribute.value', foreground: 'e6e6e6' },
        ],
        colors: {
          'editor.background': '#181a20',
          'editor.foreground': '#e6e6e6',
          'editor.lineHighlightBackground': '#232336',
          'editorCursor.foreground': '#BCDD19',
          'editor.selectionBackground': '#BCDD1940',
          'editor.inactiveSelectionBackground': '#BCDD1915',
          'editorLineNumber.foreground': '#7a7a7a',
          'editorLineNumber.activeForeground': '#BCDD19',
          'editorIndentGuide.background': '#232336',
          'editorIndentGuide.activeBackground': '#BCDD19',
          'editorWidget.background': '#232336',
          'editorWidget.border': '#BCDD19',
          'editorBracketMatch.background': '#232336',
          'editorBracketMatch.border': '#BCDD19',
          'editorGutter.background': '#181a20',
          'editorGutter.modifiedBackground': '#BCDD19',
          'editorGutter.addedBackground': '#BCDD19',
          'editorGutter.deletedBackground': '#ff5252',
          'editorWhitespace.foreground': '#232336',
          'editor.selectionHighlightBackground': '#BCDD1920',
          'editor.findMatchBackground': '#BCDD1940',
          'editor.findMatchHighlightBackground': '#BCDD1920',
          'editor.wordHighlightBackground': '#BCDD1920',
          'editor.wordHighlightStrongBackground': '#BCDD1940',
          'editorError.foreground': '#ff5252',
          'editorWarning.foreground': '#facc15',
          'editorInfo.foreground': '#BCDD19',
        },
      });
    }
  }

  // Expose getLintMessages via ref
  useImperativeHandle(ref, () => ({
    insertSnippet: (snippet: string) => {
      if (editorRef.current && editorRef.current.insertSnippet) {
        editorRef.current.insertSnippet(snippet);
      }
    },
    getLintMessages: () => lintMessages,
  }));

  // Auto-save functionality
  useEffect(() => {
    if (isAutoSave) {
      localStorage.setItem(`code-${language}`, value);
      setSaveStatus('saved');
    }
    // Linting for JS/TS
    if ((language === 'javascript' || language === 'typescript') && linterRef.current) {
      const model = monaco.editor.getModels().find(m => m.getValue() === value);
      if (model) {
        monaco.editor.setModelMarkers(model, 'eslint', []); // Clear previous
        try {
          // Run ESLint
          const messages = linterRef.current.verify(value, {
            parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
            env: { browser: true, es6: true },
            rules: {
              semi: ['error', 'always'],
              'no-unused-vars': 'warn',
              'no-undef': 'warn',
              'no-console': 'off',
            },
          });
          setLintMessages(messages);
          const markers = messages.map((msg: any) => ({
            startLineNumber: msg.line || 1,
            startColumn: msg.column || 1,
            endLineNumber: msg.endLine || msg.line || 1,
            endColumn: msg.endColumn || msg.column + 1 || 2,
            message: msg.message,
            severity: msg.severity === 2 ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
            source: 'eslint',
          }));
          monaco.editor.setModelMarkers(model, 'eslint', markers);
        } catch (e) {
          setLintMessages([{ message: 'Linting error: ' + (e instanceof Error ? e.message : String(e)), severity: 2, line: 1, column: 1 }]);
          monaco.editor.setModelMarkers(model, 'eslint', [{
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1,
            message: 'Linting error: ' + (e instanceof Error ? e.message : String(e)),
            severity: monaco.MarkerSeverity.Error,
          }]);
        }
      } else {
        setLintMessages([]);
      }
    } else {
      setLintMessages([]);
    }
  }, [value, language, isAutoSave]);

  // Load saved code on mount
  useEffect(() => {
    const savedCode = localStorage.getItem(`code-${language}`);
    if (savedCode) {
      onChange(savedCode);
    }
  }, [language]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(`editor-theme-${language}`, newTheme);
  };

  const toggleAutoSave = () => {
    const newAutoSave = !isAutoSave;
    setIsAutoSave(newAutoSave);
    localStorage.setItem(`editor-autosave-${language}`, JSON.stringify(newAutoSave));
  };

  const toggleLivePreview = () => {
    const newLivePreview = !isLivePreview;
    setIsLivePreview(newLivePreview);
    localStorage.setItem(`editor-livepreview-${language}`, JSON.stringify(newLivePreview));
  };

  const handleFormatCode = async () => {
    if (language === 'javascript' || language === 'typescript') {
      try {
        const formatted = await prettier.format(value, {
          parser: language === 'javascript' ? 'babel' : 'babel-ts',
          plugins: [parserBabel],
        });
        onChange(formatted);
      } catch (e) {
        alert('Formatting error: ' + (e as Error).message);
      }
    } else {
      alert('Formatting is only supported for JavaScript and TypeScript.');
    }
  };

  // Resizer logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingRef.current && resizerRef.current) {
        const rect = resizerRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          let newHeight = e.clientY - rect.top;
          newHeight = Math.max(150, Math.min(newHeight, 700));
          setEditorHeight(newHeight);
        }
      }
    };
    const handleMouseUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="flex flex-col h-full rounded-lg shadow-lg border border-[#BCDD19] bg-[#181a20]" style={{ background: '#181a20' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#0a0d14] border-b border-[#BCDD19] shadow-sm">
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleTheme}
            className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-[#232336] transition-colors duration-150"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={16} className="text-gray-400" /> : <Sun size={16} className="text-yellow-400" />}
          </button>
          <button
            onClick={toggleAutoSave}
            className={`p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150 ${
              isAutoSave 
                ? 'bg-blue-900 text-blue-400' 
                : 'hover:bg-[#232336] text-gray-400'
            }`}
            title={isAutoSave ? 'Auto-save Enabled' : 'Auto-save Disabled'}
            aria-label="Toggle auto-save"
          >
            <Save size={16} />
          </button>
          <button
            onClick={handleFormatCode}
            className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-[#232336] transition-colors duration-150"
            title="Format Code"
            aria-label="Format code"
          >
            <span role="img" aria-label="Format">🧹</span>
          </button>
          <button
            onClick={toggleLivePreview}
            className={`p-1 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-150 ${
              isLivePreview
                ? 'bg-green-900 text-green-400'
                : 'hover:bg-[#232336] text-gray-400'
            }`}
            title={isLivePreview ? 'Live Preview Enabled' : 'Live Preview Disabled'}
            aria-label="Toggle live preview"
          >
            <Zap size={16} />
          </button>
        </div>
        <div className="text-xs font-mono text-gray-400 tracking-widest select-none">
          {language.toUpperCase()}
        </div>
      </div>
      {/* Editor Panel with Resizer */}
      <div className="relative flex-1 flex flex-col">
        <div style={{ height: editorHeight }} className="transition-all duration-200">
          <Editor
            height="100%"
            defaultLanguage={language}
            value={value}
            onChange={(value) => onChange(value || '')}
            theme={theme === 'light' ? 'light' : 'snippad-dark'}
            options={{
              minimap: { enabled: minimap },
              fontSize: fontSize,
              tabSize: tabSize,
              lineNumbers: lineNumbers ? 'on' : 'off',
              fontFamily: 'JetBrains Mono, monospace',
              lineHeight: 1.6,
              wordWrap: 'on',
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              renderWhitespace: 'selection',
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true },
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              mouseWheelScrollSensitivity: 1,
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: true,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
                verticalSliderSize: 6,
                horizontalSliderSize: 6,
              },
              matchBrackets: 'always',
              folding: true,
              foldingHighlight: true,
              foldingStrategy: 'indentation',
              showFoldingControls: 'always',
              unfoldOnClickAfterEndOfLine: true,
              contextmenu: true,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              tabCompletion: 'on',
              wordBasedSuggestions: 'currentDocument',
              parameterHints: {
                enabled: true,
                cycle: true,
              },
              hover: {
                enabled: true,
                delay: 300,
                sticky: true,
              },
              formatOnPaste: true,
              formatOnType: true,
              suggest: {
                preview: true,
                showMethods: true,
                showFunctions: true,
                showConstructors: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showStructs: true,
                showInterfaces: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showValues: true,
                showConstants: true,
                showEnums: true,
                showEnumMembers: true,
                showKeywords: true,
                showWords: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showFolders: true,
                showTypeParameters: true,
                showSnippets: true,
              },
            }}
            onMount={(editor, monacoInstance) => handleEditorDidMount(editor, monacoInstance)}
          />
        </div>
        {/* Resizer */}
        <div
          ref={resizerRef}
          className="h-2 cursor-row-resize bg-gray-100 dark:bg-gray-700 w-full flex items-center justify-center"
          onMouseDown={() => { draggingRef.current = true; }}
          aria-label="Resize editor vertically"
        >
          <div className="w-12 h-1 rounded bg-gray-400 dark:bg-gray-500" />
        </div>
      </div>
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 font-mono">
        <div>
          Ln {cursorPos.line}, Col {cursorPos.column}
        </div>
        <div>
          {saveStatus === 'saved' ? (
            <span className="text-green-600 dark:text-green-400">● Saved</span>
          ) : (
            <span className="text-yellow-600 dark:text-yellow-400">● Unsaved</span>
          )}
        </div>
        <div>
          {language.toUpperCase()}
        </div>
      </div>
    </div>
  );
});
