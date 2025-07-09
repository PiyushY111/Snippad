import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CodeEditor } from './CodeEditor';
import { Play, Trash2, Download, Code2, Plus, X, Edit2, FileText, FileCode2, FileJson, FileType, User, Settings } from 'lucide-react';
import axios from 'axios';
import { Sidebar } from './Sidebar';
import { FileTabs } from './FileTabs';
import { OutputPanel } from './OutputPanel';
import { SnippetsModal } from './modals/SnippetsModal';
import { NewFileModal } from './modals/NewFileModal';
import { LanguageSupportModal } from './modals/LanguageSupportModal';
import { CommandPaletteModal } from './modals/CommandPaletteModal';
import { SettingsModal } from './modals/SettingsModal';
import type { File, Snippet, Runtime, LanguageOption } from '../types';
import toast, { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './ErrorBoundary';

const languageOptions: LanguageOption[] = [
  { label: 'JavaScript', value: 'javascript', ext: 'js', icon: <FileCode2 size={16} /> },
  { label: 'TypeScript', value: 'typescript', ext: 'ts', icon: <FileCode2 size={16} /> },
  { label: 'Python', value: 'python', ext: 'py', icon: <FileType size={16} /> },
  { label: 'C++', value: 'cpp', ext: 'cpp', icon: <FileType size={16} /> },
  { label: 'C', value: 'c', ext: 'c', icon: <FileType size={16} /> },
  { label: 'Java', value: 'java', ext: 'java', icon: <FileType size={16} /> },
  { label: 'C#', value: 'csharp', ext: 'cs', icon: <FileType size={16} /> },
  { label: 'Go', value: 'go', ext: 'go', icon: <FileType size={16} /> },
  { label: 'Ruby', value: 'ruby', ext: 'rb', icon: <FileType size={16} /> },
  { label: 'PHP', value: 'php', ext: 'php', icon: <FileType size={16} /> },
  { label: 'Rust', value: 'rust', ext: 'rs', icon: <FileType size={16} /> },
  { label: 'Swift', value: 'swift', ext: 'swift', icon: <FileType size={16} /> },
  { label: 'Kotlin', value: 'kotlin', ext: 'kt', icon: <FileType size={16} /> },
  { label: 'Bash', value: 'bash', ext: 'sh', icon: <FileType size={16} /> },
  { label: 'HTML', value: 'html', ext: 'html', icon: <FileText size={16} /> },
  { label: 'CSS', value: 'css', ext: 'css', icon: <FileText size={16} /> },
  { label: 'JSON', value: 'json', ext: 'json', icon: <FileJson size={16} /> },
];

const defaultFiles: File[] = [
  { id: 1, name: 'index.html', language: 'html', code: `<h1>Hello!</h1>\n<p>Write HTML, CSS, JavaScript and  more languages code here and click 'Run Code'.</p>` },
  { id: 2, name: 'style.css', language: 'css', code: '/* CSS goes here */' },
  { id: 3, name: 'script.js', language: 'javascript', code: 'console.log("Hello from Node.js!");\nconsole.log("Current time:", new Date().toLocaleString());\n\n// Simple calculation\na = 5;\nb = 3;\nconsole.log(`${a} + ${b} = ${a + b}`);\n\n// Array example\nconst fruits = ["apple", "banana", "orange"];\nconsole.log("Fruits:", fruits);\nconsole.log("First fruit:", fruits[0]);' },
];

const getFileIcon = (file: File) => {
  const ext = file.name.split('.').pop();
  switch (ext) {
    case 'js': return <FileCode2 size={16} className="text-yellow-400" />;
    case 'ts': return <FileCode2 size={16} className="text-blue-400" />;
    case 'html': return <FileCode2 size={16} className="text-orange-400" />;
    case 'css': return <FileCode2 size={16} className="text-sky-400" />;
    case 'py': return <FileType size={16} className="text-yellow-300" />;
    case 'sh': return <FileType size={16} className="text-green-400" />;
    case 'json': return <FileJson size={16} className="text-lime-400" />;
    case 'cpp': return <FileCode2 size={16} className="text-blue-300" />;
    default: return <FileType size={16} className="text-gray-400" />;
  }
};

// Add a simple LintErrorPanel component
interface LintMessage {
  message: string;
  severity: number;
  line?: number;
  column?: number;
}
function LintErrorPanel({ lintMessages }: { lintMessages: LintMessage[] }) {
  if (!lintMessages || lintMessages.length === 0) return null;
  return (
    <div className="mt-2 p-2 rounded bg-[#2d2d2d] border border-[#f85149]/40 text-sm text-[#f85149] font-mono max-h-40 overflow-auto">
      <div className="font-bold text-[#f85149] mb-1">Lint Errors/Warnings:</div>
      <ul>
        {lintMessages.map((msg: LintMessage, i: number) => (
          <li key={i} className="mb-1">
            <span className={msg.severity === 2 ? 'font-bold' : 'text-yellow-400'}>
              [{msg.severity === 2 ? 'Error' : 'Warning'}]
            </span>{' '}
            {msg.message}
            {msg.line && (
              <span className="ml-2 text-xs text-[#7d8590]">(Line {msg.line}, Col {msg.column})</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const EditorLayout = () => {
  const [runtimes, setRuntimes] = useState<Runtime[]>([]);
  const [files, setFiles] = useState<File[]>(defaultFiles);
  const [activeFileId, setActiveFileId] = useState<number>(1);
  const [output, setOutput] = useState<{ [id: number]: string }>({});
  const [outputType, setOutputType] = useState<{ [id: number]: 'success' | 'error' | 'info' }>({});
  const [renamingId, setRenamingId] = useState<number|null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const [showAddFile, setShowAddFile] = useState<boolean>(false);
  const [newLang, setNewLang] = useState<string>(languageOptions[0].value);
  const [newName, setNewName] = useState<string>('');

  // Version history state
  const [history, setHistory] = useState<{ [id: number]: string[] }>({});
  const [historyIndex, setHistoryIndex] = useState<{ [id: number]: number }>({});

  // Drag-and-drop file upload
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Code snippets
  const [showSnippets, setShowSnippets] = useState<boolean>(false);
  const codeSnippets: Snippet[] = [
    { name: 'For Loop (JS)', language: 'javascript', code: 'for (let i = 0; i < 10; i++) {\n  console.log(i);\n}' },
    { name: 'Function (Python)', language: 'python', code: 'def greet(name):\n    print(f"Hello, {name}!")' },
    { name: 'Hello World (C++)', language: 'cpp', code: '#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}' },
    { name: 'HTML Boilerplate', language: 'html', code: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Document</title>\n</head>\n<body>\n\n</body>\n</html>' },
    { name: 'CSS Center', language: 'css', code: '.center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}' },
    { name: 'FizzBuzz (Python)', language: 'python', code: 'for i in range(1, 101):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)' },
  ];
  // Insert snippet at cursor using CodeEditor ref
  const codeEditorRef = useRef<any>(null); // TODO: type this ref properly
  const handleInsertSnippet = (snippet: string) => {
    if (codeEditorRef.current && codeEditorRef.current.insertSnippet) {
      codeEditorRef.current.insertSnippet(snippet);
    }
    setShowSnippets(false);
  };

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  // Update code for the active file, with version history
  const handleCodeChange = (newCode: string) => {
    setFiles(files => files.map(f => f.id === activeFileId ? { ...f, code: newCode } : f));
    setHistory(h => {
      const prev = h[activeFileId] || [];
      const idx = (historyIndex[activeFileId] ?? prev.length - 1) + 1;
      const newHist = prev.slice(0, idx);
      newHist.push(newCode);
      return { ...h, [activeFileId]: newHist };
    });
    setHistoryIndex(idx => ({ ...idx, [activeFileId]: (idx[activeFileId] ?? (history[activeFileId]?.length ?? 1) - 1) + 1 }));
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    const idx = (historyIndex[activeFileId] ?? (history[activeFileId]?.length ?? 1) - 1) - 1;
    if (history[activeFileId] && idx >= 0) {
      setFiles(files => files.map(f => f.id === activeFileId ? { ...f, code: history[activeFileId][idx] } : f));
      setHistoryIndex(i => ({ ...i, [activeFileId]: idx }));
    }
  };
  const handleRedo = () => {
    const idx = (historyIndex[activeFileId] ?? (history[activeFileId]?.length ?? 1) - 1) + 1;
    if (history[activeFileId] && idx < history[activeFileId].length) {
      setFiles(files => files.map(f => f.id === activeFileId ? { ...f, code: history[activeFileId][idx] } : f));
      setHistoryIndex(i => ({ ...i, [activeFileId]: idx }));
    }
  };

  // Add new file (with dropdown UI)
  const handleAddFile = () => setShowAddFile(true);
  const handleCreateFile = () => {
    const langObj = languageOptions.find(l => l.value === newLang);
    if (!langObj) return;
    const ext = langObj.ext;
    let name = newName.trim() || `untitled.${ext}`;
    // Ensure the filename ends with the correct extension
    if (!name.endsWith(`.${ext}`)) {
      // Remove any existing extension
      name = name.replace(/\.[^.]+$/, '');
      name = `${name}.${ext}`;
    }
    const newId = files.length ? Math.max(...files.map(f => f.id)) + 1 : 1;
    const newFile = { id: newId, name, language: newLang, code: '' };
    setFiles([...files, newFile]);
    setActiveFileId(newId);
    setShowAddFile(false);
    setNewName('');
    setNewLang(languageOptions[0].value);
  };

  // Delete file
  const handleDeleteFile = (id: number) => {
    if (files.length === 1) return;
    const idx = files.findIndex(f => f.id === id);
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) {
      setActiveFileId(newFiles[Math.max(0, idx - 1)].id);
    }
  };

  // Rename file
  const handleRenameFile = (id: number) => {
    setRenamingId(id);
    setRenameValue(files.find(f => f.id === id)?.name || '');
  };
  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => setRenameValue(e.target.value);
  const handleRenameSubmit = (id: number) => {
    setFiles(files => files.map(f => f.id === id ? { ...f, name: renameValue } : f));
    setRenamingId(null);
  };

  // Output for HTML/CSS/JS
  const html = files.find(f => f.language === 'html')?.code || '';
  const css = files.find(f => f.language === 'css')?.code || '';
  const js = files.find(f => f.language === 'javascript')?.code || '';

  // Live preview: update output automatically as code changes (for HTML/CSS/JS)
  React.useEffect(() => {
    const runCodeAsync = async () => {
      const htmlFile = files.find(f => f.language === 'html');
      const cssFile = files.find(f => f.language === 'css');
      const jsFile = files.find(f => f.language === 'javascript');
      if ([
        'python', 'cpp', 'c', 'java', 'csharp', 'go', 'ruby', 'php', 'rust', 'swift', 'kotlin', 'bash', 'typescript'
      ].includes(activeFile.language)) {
        setOutput(o => ({ ...o, [activeFileId]: 'Running...' }));
        setOutputType(t => ({ ...t, [activeFileId]: 'info' }));
        try {
          // Find the correct runtime for the selected language, considering aliases
          const runtime = runtimes.find(r =>
            r.language === activeFile.language ||
            (r.aliases && r.aliases.includes(activeFile.language))
          );
          const languageKey = runtime ? runtime.language : activeFile.language;
          const version = runtime ? runtime.version : undefined;
          if (!version) {
            setOutput(o => ({ ...o, [activeFileId]: `<pre>Could not determine version for language: ${activeFile.language}</pre>` }));
            setOutputType(t => ({ ...t, [activeFileId]: 'error' }));
            return;
          }
          const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              language: languageKey,
              version: version,
              files: [{ content: activeFile.code }],
            }),
          });
          const data = await response.json();
          if (data.run && data.run.stderr) {
            setOutput(o => ({ ...o, [activeFileId]: `<pre>${data.run.stderr}</pre>` }));
            setOutputType(t => ({ ...t, [activeFileId]: 'error' }));
          } else if (data.run && data.run.stdout) {
            setOutput(o => ({ ...o, [activeFileId]: `<pre>${data.run.stdout}</pre>` }));
            setOutputType(t => ({ ...t, [activeFileId]: 'success' }));
          } else {
            setOutput(o => ({ ...o, [activeFileId]: `<pre>No output</pre>` }));
            setOutputType(t => ({ ...t, [activeFileId]: 'info' }));
          }
        } catch (err) {
          setOutput(o => ({ ...o, [activeFileId]: `<pre>Error: ${err instanceof Error ? err.message : String(err)}</pre>` }));
          setOutputType(t => ({ ...t, [activeFileId]: 'error' }));
        }
      } else {
        // HTML/CSS/JS: update output as before
        const htmlFile = files.find(f => f.language === 'html');
        const cssFile = files.find(f => f.language === 'css');
        const jsFile = files.find(f => f.language === 'javascript');
        setOutput(o => ({ ...o, [activeFileId]: `<!DOCTYPE html>\n<html>\n<head>\n<style>${cssFile?.code || ''}</style>\n</head>\n<body>\n${htmlFile?.code || ''}\n<script>${jsFile?.code || ''}<\/script>\n</body>\n</html>` }));
        setOutputType(t => ({ ...t, [activeFileId]: 'info' }));
      }
    };
    runCodeAsync();
  }, [files, activeFile, activeFileId, runtimes]);

  const handleClearOutput = () => setOutput(o => ({ ...o, [activeFileId]: '' }));

  // Share code to Hastebin
  const handleShare = async () => {
    try {
      const res = await axios.post('https://hastebin.com/documents', activeFile.code, {
        headers: { 'Content-Type': 'text/plain' },
      });
      const key = res.data.key;
      const url = `https://hastebin.com/${key}.${languageOptions.find(l => l.value === activeFile.language)?.ext || 'txt'}`;
      await navigator.clipboard.writeText(url);
      toast.success('Shareable link copied to clipboard!\n' + url);
    } catch (e) {
      toast.error('Failed to share code.');
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const filesList = Array.from(e.dataTransfer.files);
    for (const file of filesList) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
      const langObj = languageOptions.find(l => l.ext === ext) || languageOptions.find(l => l.ext === 'txt');
      const text = await file.text();
      const newId = files.length ? Math.max(...files.map(f => f.id)) + 1 : 1;
      setFiles(f => [...f, { id: newId, name: file.name, language: langObj?.value || 'plaintext', code: text }]);
      setActiveFileId(newId);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  // Status bar state
  const [status, setStatus] = useState<string>('Ready');
  const [cursor, setCursor] = useState<{ line: number; col: number }>({ line: 1, col: 1 });
  // Easter egg state
  const [showEgg, setShowEgg] = useState<boolean>(false);

  // Sidebar state
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  // Accent color state
  const [accent, setAccent] = useState<string>(localStorage.getItem('accent-color') || '#a78bfa');
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accent);
    localStorage.setItem('accent-color', accent);
  }, [accent]);

  // Command palette state
  const [showPalette, setShowPalette] = useState<boolean>(false);
  const [paletteQuery, setPaletteQuery] = useState<string>('');
  const handleRunCode = async () => {
    if ([
      'python', 'cpp', 'c', 'java', 'csharp', 'go', 'ruby', 'php', 'rust', 'swift', 'kotlin', 'bash', 'typescript'
    ].includes(activeFile.language)) {
      setOutput(o => ({ ...o, [activeFileId]: 'Running...' }));
      setOutputType(t => ({ ...t, [activeFileId]: 'info' }));
      try {
        // Find the correct runtime for the selected language, considering aliases
        const runtime = runtimes.find((r: Runtime) =>
          r.language === activeFile.language ||
          (r.aliases && r.aliases.includes(activeFile.language))
        );
        const languageKey = runtime ? runtime.language : activeFile.language;
        const version = runtime ? runtime.version : undefined;
        if (!version) {
          setOutput(o => ({ ...o, [activeFileId]: `<pre>Could not determine version for language: ${activeFile.language}</pre>` }));
          setOutputType(t => ({ ...t, [activeFileId]: 'error' }));
          return;
        }
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: languageKey,
            version: version,
            files: [{ content: activeFile.code }],
          }),
        });
        const data = await response.json();
        if (data.run && data.run.stderr) {
          setOutput(o => ({ ...o, [activeFileId]: `<pre>${data.run.stderr}</pre>` }));
          setOutputType(t => ({ ...t, [activeFileId]: 'error' }));
        } else if (data.run && data.run.stdout) {
          setOutput(o => ({ ...o, [activeFileId]: `<pre>${data.run.stdout}</pre>` }));
          setOutputType(t => ({ ...t, [activeFileId]: 'success' }));
        } else {
          setOutput(o => ({ ...o, [activeFileId]: `<pre>No output</pre>` }));
          setOutputType(t => ({ ...t, [activeFileId]: 'info' }));
        }
      } catch (err) {
        setOutput(o => ({ ...o, [activeFileId]: `<pre>Error: ${err instanceof Error ? err.message : String(err)}</pre>` }));
        setOutputType(t => ({ ...t, [activeFileId]: 'error' }));
      }
    } else {
      // HTML/CSS/JS: update output as before
      const htmlFile = files.find(f => f.language === 'html');
      const cssFile = files.find(f => f.language === 'css');
      const jsFile = files.find(f => f.language === 'javascript');
      setOutput(o => ({ ...o, [activeFileId]: `<!DOCTYPE html>\n<html>\n<head>\n<style>${cssFile?.code || ''}</style>\n</head>\n<body>\n${htmlFile?.code || ''}\n<script>${jsFile?.code || ''}<\/script>\n</body>\n</html>` }));
      setOutputType(t => ({ ...t, [activeFileId]: 'info' }));
    }
  };

  const clearCode = () => {
    setFiles(files => files.map(f => ({ ...f, code: '' })));
    setOutput({});
    setOutputType({});
  };

  const exportCode = () => {
    const blob = new Blob([
      `<!DOCTYPE html>\n<html>\n<head>\n<style>${css}</style>\n</head>\n<body>\n${html}\n<script>${js}<\/script>\n</body>\n</html>`
    ], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snippad.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const paletteActions = [
    { label: 'Run Code', action: handleRunCode },
    { label: 'Format Code', action: () => document.querySelector('[title="Format Code"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })) },
    { label: 'New File', action: handleAddFile },
    { label: 'Open Snippets', action: () => setShowSnippets(true) },
    { label: 'Share Code', action: handleShare },
    { label: 'Export Code', action: exportCode },
    { label: 'Clear Code', action: clearCode },
    ...files.map(f => ({ label: `Open File: ${f.name}`, action: () => setActiveFileId(f.id) })),
  ];
  const filteredPalette = paletteActions.filter(a => a.label.toLowerCase().includes(paletteQuery.toLowerCase()));
  // Keyboard shortcut for palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowPalette(true);
      }
      if (e.key === 'Escape') setShowPalette(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // File search/filter state
  const [fileSearch, setFileSearch] = useState<string>('');
  // Drag-and-drop state
  const [draggedFileId, setDraggedFileId] = useState<number|null>(null);

  // Helper to reorder files array
  const reorderFiles = (startIdx: number, endIdx: number) => {
    const updated = Array.from(files);
    const [removed] = updated.splice(startIdx, 1);
    updated.splice(endIdx, 0, removed);
    setFiles(updated);
  };

  // Filtered files for display
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(fileSearch.toLowerCase()));

  // Snippet type
  type Snippet = { name: string; language: string; code: string };
  // User-defined snippets (persisted in localStorage)
  const [userSnippets, setUserSnippets] = useState<Snippet[]>(() => {
    const saved = localStorage.getItem('user-snippets');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('user-snippets', JSON.stringify(userSnippets));
  }, [userSnippets]);

  // Add/edit/delete snippet logic
  const [snippetForm, setSnippetForm] = useState<{ name: string; language: string; code: string; editIdx: number | null }>({ name: '', language: activeFile.language, code: '', editIdx: null });
  const handleAddSnippet = () => {
    if (!snippetForm.name.trim() || !snippetForm.code.trim()) return;
    setUserSnippets((snips: Snippet[]) => [...snips, { name: snippetForm.name, language: snippetForm.language, code: snippetForm.code }]);
    setSnippetForm({ name: '', language: activeFile.language, code: '', editIdx: null });
  };
  const handleEditSnippet = (idx: number) => {
    const snip = userSnippets[idx];
    setSnippetForm({ name: snip.name, language: snip.language, code: snip.code, editIdx: idx });
  };
  const handleUpdateSnippet = () => {
    if (snippetForm.editIdx === null) return;
    setUserSnippets((snips: Snippet[]) => snips.map((s: Snippet, i: number) => i === snippetForm.editIdx ? { name: snippetForm.name, language: snippetForm.language, code: snippetForm.code } : s));
    setSnippetForm({ name: '', language: activeFile.language, code: '', editIdx: null });
  };
  const handleDeleteSnippet = (idx: number) => {
    setUserSnippets((snips: Snippet[]) => snips.filter((_: Snippet, i: number) => i !== idx));
    setSnippetForm({ name: '', language: activeFile.language, code: '', editIdx: null });
  };

  // Language-specific templates (for new files)
  const languageTemplates = {
    javascript: '// JavaScript file\n',
    python: '# Python file\n',
    html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Document</title>\n</head>\n<body>\n\n</body>\n</html>',
    css: '/* CSS file */\n',
    typescript: '// TypeScript file\n',
    cpp: '#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}',
    // ...add more as needed
  };

  // Carousel auto-scroll state
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselHovered, setIsCarouselHovered] = useState<boolean>(false);
  
  // Language support state
  const [showLanguageSupport, setShowLanguageSupport] = useState<boolean>(false);
  
  // Handle language selection from carousel
  const handleLanguageSelect = (lang: LanguageOption) => {
    // Create a new file with the selected language
    const newId = files.length ? Math.max(...files.map(f => f.id)) + 1 : 1;
    const template = languageTemplates[lang.value as keyof typeof languageTemplates] || `// ${lang.label} file\n`;
    setFiles(f => [...f, { id: newId, name: `new.${lang.ext}`, language: lang.value, code: template }]);
    setActiveFileId(newId);
  };
  
  // Infinite auto-scroll effect
  useEffect(() => {
    if (!carouselRef.current || isCarouselHovered) return;
    const el = carouselRef.current;
    let frame: number;
    const itemCount = languageOptions.length;
    const itemWidth = 98; // 90px + 2*4px gap
    const totalWidth = itemCount * itemWidth;
    const step = () => {
      if (!isCarouselHovered) {
        el.scrollLeft += 0.5;
        if (el.scrollLeft >= totalWidth) {
          el.scrollLeft -= totalWidth;
        }
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isCarouselHovered, languageOptions.length]);
  // Drag-to-scroll logic (with infinite loop)
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0 });
  const handleMouseDown = (e: React.MouseEvent) => {
    dragState.current.isDown = true;
    dragState.current.startX = e.pageX - (carouselRef.current?.offsetLeft || 0);
    dragState.current.scrollLeft = carouselRef.current?.scrollLeft || 0;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current.isDown || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.5;
    let newScroll = dragState.current.scrollLeft - walk;
    const itemCount = languageOptions.length;
    const itemWidth = 98;
    const totalWidth = itemCount * itemWidth;
    if (newScroll < 0) newScroll += totalWidth;
    if (newScroll >= totalWidth) newScroll -= totalWidth;
    carouselRef.current.scrollLeft = newScroll;
  };
  const handleMouseUp = () => { dragState.current.isDown = false; };
  // Touch events (with infinite loop)
  const handleTouchStart = (e: React.TouchEvent) => {
    dragState.current.isDown = true;
    dragState.current.startX = e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0);
    dragState.current.scrollLeft = carouselRef.current?.scrollLeft || 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.current.isDown || !carouselRef.current) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.5;
    let newScroll = dragState.current.scrollLeft - walk;
    const itemCount = languageOptions.length;
    const itemWidth = 98;
    const totalWidth = itemCount * itemWidth;
    if (newScroll < 0) newScroll += totalWidth;
    if (newScroll >= totalWidth) newScroll -= totalWidth;
    carouselRef.current.scrollLeft = newScroll;
  };
  const handleTouchEnd = () => { dragState.current.isDown = false; };
  // Arrow navigation (with infinite loop)
  const scrollBy = (delta: number) => {
    if (carouselRef.current) {
      let newScroll = carouselRef.current.scrollLeft + delta;
      const itemCount = languageOptions.length;
      const itemWidth = 98;
      const totalWidth = itemCount * itemWidth;
      if (newScroll < 0) newScroll += totalWidth;
      if (newScroll >= totalWidth) newScroll -= totalWidth;
      carouselRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
    }
  };

  // Fetch runtimes on mount
  useEffect(() => {
    fetch('https://emkc.org/api/v2/piston/runtimes')
      .then(res => res.json())
      .then(setRuntimes)
      .catch(() => setRuntimes([]));
  }, []);

  // Memoized getFileIcon
  const getFileIcon = useCallback((file: File) => {
    const ext = file.name.split('.').pop();
    switch (ext) {
      case 'js': return <FileCode2 size={16} className="text-yellow-400" />;
      case 'ts': return <FileCode2 size={16} className="text-blue-400" />;
      case 'html': return <FileCode2 size={16} className="text-orange-400" />;
      case 'css': return <FileCode2 size={16} className="text-sky-400" />;
      case 'py': return <FileType size={16} className="text-yellow-300" />;
      case 'sh': return <FileType size={16} className="text-green-400" />;
      case 'json': return <FileJson size={16} className="text-lime-400" />;
      case 'cpp': return <FileCode2 size={16} className="text-blue-300" />;
      default: return <FileType size={16} className="text-gray-400" />;
    }
  }, []);

  // Memoized activeFile
  const memoizedActiveFile = useMemo(() => files.find(f => f.id === activeFileId) || files[0], [files, activeFileId]);

  // Memoized filteredFiles for Sidebar
  const memoizedFilteredFiles = useMemo(() => files.filter(f => f.name.toLowerCase().includes(fileSearch.toLowerCase())), [files, fileSearch]);

  // Memoize handler functions passed as props
  const memoizedSetActiveFileId = useCallback(setActiveFileId, []);
  const memoizedSetFileSearch = useCallback(setFileSearch, []);
  const memoizedHandleAddFile = useCallback(handleAddFile, []);
  const memoizedSetShowSnippets = useCallback(setShowSnippets, []);
  const memoizedSetShowLanguageSupport = useCallback(setShowLanguageSupport, []);
  const memoizedReorderFiles = useCallback(reorderFiles, [files]);

  // Editor settings state
  const [showSettings, setShowSettings] = useState(false);
  const [editorSettings, setEditorSettings] = useState(() => {
    const saved = localStorage.getItem('editor-settings');
    return saved ? JSON.parse(saved) : {
      fontSize: 16,
      tabSize: 2,
      lineNumbers: true,
      minimap: true,
    };
  });
  useEffect(() => {
    localStorage.setItem('editor-settings', JSON.stringify(editorSettings));
  }, [editorSettings]);

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen bg-gradient-to-br from-[#0a0d14] via-[#0d1117] to-[#161b22] flex flex-row font-['JetBrains_Mono',_monospace] text-[#c9d1d9] relative overflow-hidden"
        style={{ minHeight: '100dvh', position: 'relative' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Toaster position="top-right" />
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #58a6ff 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        {/* Sidebar */}
        <Sidebar
          files={files}
          activeFileId={activeFileId}
          setActiveFileId={memoizedSetActiveFileId}
          fileSearch={fileSearch}
          setFileSearch={memoizedSetFileSearch}
          handleAddFile={memoizedHandleAddFile}
          setShowSnippets={memoizedSetShowSnippets}
          setShowLanguageSupport={memoizedSetShowLanguageSupport}
          getFileIcon={getFileIcon}
          showSidebar={showSidebar}
          reorderFiles={memoizedReorderFiles}
          setShowSettings={setShowSettings}
        />
        
        {/* Main Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${showSidebar ? 'ml-64' : 'ml-16'}`}>
          {/* Header */}
          <header className="header-bar w-full flex flex-row items-center justify-between bg-[#181a20] border-b-2 border-[#BCDD19] rounded-2xl mt-4 mb-2 px-6 py-4 shadow-[0_2px_10px_0_#BCDD1933]">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#181a20] border-2 border-[#BCDD19] text-[#BCDD19] font-bold">⚡</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#BCDD19] tracking-tight">SNIPPAD</span>
                <span className="text-xs text-[#BCDD19] font-mono uppercase tracking-widest">PRO</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#181a20] border border-[#BCDD19]">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
                <span className="text-xs text-[#BCDD19] font-mono">LIVE</span>
              </div>
              <span className="hidden lg:block text-sm text-[#BCDD19] tracking-wide font-medium">Next-Gen Code Editor</span>
            </div>
          </header>
          
          {/* File Tabs (horizontal, VS Code style) */}
          <FileTabs
            files={files}
            activeFileId={activeFileId}
            setActiveFileId={setActiveFileId}
            handleDeleteFile={handleDeleteFile}
            getFileIcon={getFileIcon}
            showSidebar={showSidebar}
          />
          
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col md:flex-row justify-center items-start gap-6 md:gap-8 px-6 md:px-8 py-6 max-w-[1600px] w-full mx-auto transition-all duration-300">
            <section className="flex flex-col gap-4 w-full md:w-[45%] min-w-[0] max-w-full md:max-w-[600px] h-full">
              {/* Active File Editor */}
              <div className="rounded-2xl shadow-2xl bg-[#181a20] border-2 border-[#BCDD19] flex flex-col h-full relative overflow-hidden flex-1">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl border-2 border-[#BCDD19] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[0_0_24px_2px_#BCDD1933]"></div>
                <div className="rounded-t-2xl px-6 py-4 bg-[#0a0d14] text-[#BCDD19] font-bold text-sm tracking-wide border-b-2 border-[#BCDD19] shadow-lg flex items-center justify-between relative z-10">
                  <span className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-[#181a20] border border-[#BCDD19]">
                      {getFileIcon(activeFile)}
                    </span>
                    <span className="font-extrabold">{activeFile.name}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#181a20] border border-[#BCDD19] text-xs text-[#BCDD19] uppercase font-mono font-bold">{activeFile.language}</span>
                    <span className="w-2 h-2 rounded-full bg-[#BCDD19] animate-pulse"></span>
                  </div>
                </div>
                <div className="p-4 min-h-[200px] md:min-h-[250px] h-full relative z-10">
                  <CodeEditor ref={codeEditorRef} language={activeFile.language} value={activeFile.code} onChange={handleCodeChange}
                    fontSize={editorSettings.fontSize}
                    tabSize={editorSettings.tabSize}
                    lineNumbers={editorSettings.lineNumbers}
                    minimap={editorSettings.minimap}
                  />
                  <LintErrorPanel lintMessages={codeEditorRef.current?.getLintMessages ? codeEditorRef.current.getLintMessages() : []} />
                </div>
              </div>
            </section>
            {/* Output Panel */}
            <OutputPanel
              activeFile={activeFile}
              activeFileId={activeFileId}
              output={output}
              outputType={outputType}
              handleClearOutput={handleClearOutput}
            />
          </main>
          
          {/* Bottom Bar */}
          <footer className="footer-bar w-full flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 py-6 md:py-8 bg-[#181a20] border-t-2 border-[#BCDD19] mt-4 relative shadow-[0_2px_10px_0_#BCDD1933]">
            <div className="footer-btn-boundary border-2 border-[#BCDD19] rounded-2xl p-1 flex items-center justify-center">
              <button
                className="output-btn run-btn flex items-center gap-3 px-8 py-4 text-base font-bold relative z-10"
                onClick={handleRunCode}
                title="Run the code (Ctrl+Enter)"
              >
                <Play size={20} />  Run Code
              </button>
            </div>
            <div className="footer-btn-boundary border-2 border-[#BCDD19] rounded-2xl p-1 flex items-center justify-center">
              <button
                className="output-btn clear-btn flex items-center gap-3 px-8 py-4 text-base font-bold relative z-10"
                onClick={clearCode}
                title="Clear all code in all files"
              >
                <Trash2 size={20} />  Clear Code
              </button>
            </div>
            <div className="footer-btn-boundary border-2 border-[#BCDD19] rounded-2xl p-1 flex items-center justify-center">
              <button
                className="output-btn export-btn flex items-center gap-3 px-8 py-4 text-base font-bold relative z-10"
                onClick={exportCode}
                title="Export as HTML file"
              >
                <Download size={20} />  Export
              </button>
            </div>
          </footer>
          
          {/* Toggle Terminal Button */}
          {/*
          <button
            className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-lg bg-[#21262d] text-[#c9d1d9] shadow-lg hover:bg-[#30363d] transition-all border border-[#30363d] font-medium"
            onClick={() => setShowTerminal(t => !t)}
            title="Toggle Node.js Terminal"
          >
            {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
          </button>
          */}
          {/* Node.js Terminal Panel */}
          {/*
          <TerminalPanel
            showTerminal={showTerminal}
            setShowTerminal={setShowTerminal}
            terminalRef={terminalRef}
          />
          */}
        </div>
        
        <CommandPaletteModal
          showPalette={showPalette}
          setShowPalette={setShowPalette}
          paletteQuery={paletteQuery}
          setPaletteQuery={setPaletteQuery}
          filteredPalette={filteredPalette}
        />
        
        <SnippetsModal
          showSnippets={showSnippets}
          setShowSnippets={setShowSnippets}
          codeSnippets={codeSnippets}
          userSnippets={userSnippets}
          setUserSnippets={setUserSnippets}
          snippetForm={snippetForm}
          setSnippetForm={setSnippetForm}
          handleInsertSnippet={handleInsertSnippet}
          handleAddSnippet={handleAddSnippet}
          handleEditSnippet={handleEditSnippet}
          handleUpdateSnippet={handleUpdateSnippet}
          handleDeleteSnippet={handleDeleteSnippet}
          activeFile={activeFile}
          languageOptions={languageOptions}
        />
        
        <NewFileModal
          showAddFile={showAddFile}
          setShowAddFile={setShowAddFile}
          newName={newName}
          setNewName={setNewName}
          newLang={newLang}
          setNewLang={setNewLang}
          handleCreateFile={handleCreateFile}
          languageOptions={languageOptions}
          files={files}
        />
        
        <LanguageSupportModal
          showLanguageSupport={showLanguageSupport}
          setShowLanguageSupport={setShowLanguageSupport}
          languageOptions={languageOptions}
          runtimes={runtimes}
          handleLanguageSelect={handleLanguageSelect}
        />

        <SettingsModal
          show={showSettings}
          setShow={setShowSettings}
          settings={editorSettings}
          setSettings={setEditorSettings}
        />
      </div>
    </ErrorBoundary>
  );
};

{/* Add slow spin animation for logo */}
<style>{`
@keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.animate-spin-slow { animation: spin-slow 6s linear infinite; }
`}</style>