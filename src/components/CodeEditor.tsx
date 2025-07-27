import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Zap, Info, Settings } from 'lucide-react';
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
      document.querySelector('[title="Run Code (Ctrl+Enter)"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
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
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAutoSave}
            className={`p-1.5 rounded text-sm transition-colors ${
              isAutoSave 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title={isAutoSave ? 'Auto-save Enabled' : 'Auto-save Disabled'}
          >
            <Save size={14} />
          </button>
          <button
            onClick={handleFormatCode}
            className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Format Code (Ctrl+Shift+F)"
          >
            <span className="text-sm">⚡</span>
          </button>
          <button
            onClick={toggleLivePreview}
            className={`p-1.5 rounded text-sm transition-colors ${
              isLivePreview
                ? 'bg-green-100 text-green-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title={isLivePreview ? 'Live Preview Enabled' : 'Live Preview Disabled'}
          >
            <Zap size={14} />
          </button>
        </div>
        <div className="text-xs font-medium text-gray-500">
          {language.toUpperCase()}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage={language}
          value={value}
          onChange={(value) => onChange(value || '')}
          theme="light"
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

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 font-mono">
        <div>
          Ln {cursorPos.line}, Col {cursorPos.column}
        </div>
        <div>
          {saveStatus === 'saved' ? (
            <span className="text-green-600">● Saved</span>
          ) : (
            <span className="text-yellow-600">● Unsaved</span>
          )}
        </div>
        <div>
          {language.toUpperCase()}
        </div>
      </div>
    </div>
  );
});
