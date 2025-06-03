import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Moon, Sun, Play, Save, Zap } from 'lucide-react';
import '../styles/CodeEditor.css';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({ language, value, onChange }: CodeEditorProps) => {
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

  // Auto-save functionality
  useEffect(() => {
    if (isAutoSave) {
      localStorage.setItem(`code-${language}`, value);
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={18} className="text-gray-600" /> : <Sun size={18} className="text-yellow-400" />}
          </button>
          <button
            onClick={toggleAutoSave}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isAutoSave 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title={isAutoSave ? 'Auto-save Enabled' : 'Auto-save Disabled'}
          >
            <Save size={18} />
          </button>
          <button
            onClick={toggleLivePreview}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isLivePreview 
                ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title={isLivePreview ? 'Live Preview Enabled' : 'Live Preview Disabled'}
          >
            <Zap size={18} />
          </button>
        </div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {language.toUpperCase()}
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="200px"
          defaultLanguage={language}
          value={value}
          onChange={(value) => onChange(value || '')}
          theme={theme === 'light' ? 'light' : 'vs-dark'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
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
        />
      </div>
    </div>
  );
};
