import React, { useState, useEffect, useRef } from 'react';
import { CodeEditor } from './CodeEditor';
import { Play, Trash2, Download, Code2, Plus, X, Edit2, FileText, FileCode2, FileJson, FileType, FileTerminal, User, Settings } from 'lucide-react';
import axios from 'axios';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useCallback } from 'react';

const languageOptions = [
  { label: 'JavaScript', value: 'javascript', ext: 'js', icon: <FileCode2 size={16} /> },
  { label: 'TypeScript', value: 'typescript', ext: 'ts', icon: <FileCode2 size={16} /> },
  { label: 'Python', value: 'python', ext: 'py', icon: <FileTerminal size={16} /> },
  { label: 'C++', value: 'cpp', ext: 'cpp', icon: <FileTerminal size={16} /> },
  { label: 'C', value: 'c', ext: 'c', icon: <FileTerminal size={16} /> },
  { label: 'Java', value: 'java', ext: 'java', icon: <FileTerminal size={16} /> },
  { label: 'C#', value: 'csharp', ext: 'cs', icon: <FileTerminal size={16} /> },
  { label: 'Go', value: 'go', ext: 'go', icon: <FileTerminal size={16} /> },
  { label: 'Ruby', value: 'ruby', ext: 'rb', icon: <FileTerminal size={16} /> },
  { label: 'PHP', value: 'php', ext: 'php', icon: <FileTerminal size={16} /> },
  { label: 'Rust', value: 'rust', ext: 'rs', icon: <FileTerminal size={16} /> },
  { label: 'Swift', value: 'swift', ext: 'swift', icon: <FileTerminal size={16} /> },
  { label: 'Kotlin', value: 'kotlin', ext: 'kt', icon: <FileTerminal size={16} /> },
  { label: 'Bash', value: 'bash', ext: 'sh', icon: <FileTerminal size={16} /> },
  { label: 'HTML', value: 'html', ext: 'html', icon: <FileText size={16} /> },
  { label: 'CSS', value: 'css', ext: 'css', icon: <FileText size={16} /> },
  { label: 'JSON', value: 'json', ext: 'json', icon: <FileJson size={16} /> },
];

const defaultFiles = [
  { id: 1, name: 'index.html', language: 'html', code: `<h1>Hello!</h1>\n<p>Write HTML, CSS or JavaScript code here and click 'Run Code'.</p>` },
  { id: 2, name: 'style.css', language: 'css', code: '/* CSS goes here */' },
  { id: 3, name: 'script.js', language: 'javascript', code: 'console.log("Hello from Node.js!");\nconsole.log("Current time:", new Date().toLocaleString());\n\n// Simple calculation\na = 5;\nb = 3;\nconsole.log(`${a} + ${b} = ${a + b}`);\n\n// Array example\nconst fruits = ["apple", "banana", "orange"];\nconsole.log("Fruits:", fruits);\nconsole.log("First fruit:", fruits[0]);' },
];

export const EditorLayout = () => {
  const [runtimes, setRuntimes] = useState<any[]>([]); // <-- Move this to the very top
  const [files, setFiles] = useState(defaultFiles);
  const [activeFileId, setActiveFileId] = useState(1);
  const [output, setOutput] = useState<{ [id: number]: string }>({});
  const [outputType, setOutputType] = useState<{ [id: number]: 'success' | 'error' | 'info' }>({});
  const [renamingId, setRenamingId] = useState<number|null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showAddFile, setShowAddFile] = useState(false);
  const [newLang, setNewLang] = useState(languageOptions[0].value);
  const [newName, setNewName] = useState('');

  // Version history state
  const [history, setHistory] = useState<{ [id: number]: string[] }>({});
  const [historyIndex, setHistoryIndex] = useState<{ [id: number]: number }>({});

  // Drag-and-drop file upload
  const [dragActive, setDragActive] = useState(false);

  // Code snippets
  const [showSnippets, setShowSnippets] = useState(false);
  const codeSnippets = [
    { name: 'For Loop (JS)', language: 'javascript', code: 'for (let i = 0; i < 10; i++) {\n  console.log(i);\n}' },
    { name: 'Function (Python)', language: 'python', code: 'def greet(name):\n    print(f"Hello, {name}!")' },
    { name: 'Hello World (C++)', language: 'cpp', code: '#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}' },
    { name: 'HTML Boilerplate', language: 'html', code: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Document</title>\n</head>\n<body>\n\n</body>\n</html>' },
    { name: 'CSS Center', language: 'css', code: '.center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}' },
    { name: 'FizzBuzz (Python)', language: 'python', code: 'for i in range(1, 101):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)' },
  ];
  // Insert snippet at cursor using CodeEditor ref
  const codeEditorRef = useRef<any>(null);
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
      alert('Shareable link copied to clipboard!\n' + url);
    } catch (e) {
      alert('Failed to share code.');
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

  // Integrated Terminal
  const [showTerminal, setShowTerminal] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  


  useEffect(() => {
    if (showTerminal && terminalRef.current && !xtermRef.current) {
      const term = new Terminal({
        fontFamily: 'Fira Mono, monospace',
        fontSize: 14,
        theme: { background: '#1a1a1a', foreground: '#fafafa' },
        cursorBlink: true,
        rows: 12,
        scrollback: 1000,
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();
      term.writeln('\x1b[36mNode.js Terminal\x1b[0m');
      term.writeln('\x1b[90mType "node filename.js" to run JavaScript files, or "help" for commands.\x1b[0m');
      term.writeln('');
      
      let currentLine = '';
      let cursorPosition = 0;
      
      const writePrompt = () => {
        term.write('\r\n\x1b[32m$\x1b[0m ');
        currentLine = '';
        cursorPosition = 0;
      };
      
      const executeCommand = async (command: string) => {
        const args = command.trim().split(' ');
        const cmd = args[0];
        
        if (cmd === 'help') {
          term.writeln('\x1b[33mAvailable commands:\x1b[0m');
          term.writeln('  node <filename>  - Run a JavaScript file');
          term.writeln('  ls              - List files in editor');
          term.writeln('  clear           - Clear terminal');
          term.writeln('  help            - Show this help');
          term.writeln('');
        } else if (cmd === 'clear') {
          term.clear();
          term.writeln('\x1b[36mNode.js Terminal\x1b[0m');
          term.writeln('\x1b[90mType "node filename.js" to run JavaScript files, or "help" for commands.\x1b[0m');
          term.writeln('');
        } else if (cmd === 'ls') {
          term.writeln('\x1b[33mFiles in editor:\x1b[0m');
          files.forEach(file => {
            const icon = file.id === activeFileId ? '\x1b[32m▶\x1b[0m' : ' ';
            term.writeln(`  ${icon} ${file.name} (${file.language})`);
          });
          term.writeln('');
        } else if (cmd === 'node' && args[1]) {
          const filename = args[1];
          const file = files.find(f => f.name === filename);
          
          if (!file) {
            term.writeln(`\x1b[31mError: File "${filename}" not found.\x1b[0m`);
            term.writeln('');
            return;
          }
          
          if (file.language !== 'javascript') {
            term.writeln(`\x1b[31mError: "${filename}" is not a JavaScript file.\x1b[0m`);
            term.writeln('');
            return;
          }
          
          term.writeln(`\x1b[36mRunning ${filename}...\x1b[0m`);
          
          try {
            // Use Piston API to run JavaScript
            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                language: 'javascript',
                version: '18.15.0',
                files: [{ content: file.code }],
              }),
            });
            
            const data = await response.json();
            
            if (data.run && data.run.stderr) {
              term.writeln(`\x1b[31mError:\x1b[0m`);
              term.writeln(data.run.stderr);
            }
            
            if (data.run && data.run.stdout) {
              term.writeln(`\x1b[32mOutput:\x1b[0m`);
              term.writeln(data.run.stdout);
            }
            
            if (!data.run.stdout && !data.run.stderr) {
              term.writeln('\x1b[90m(No output)\x1b[0m');
            }
            
          } catch (err) {
            term.writeln(`\x1b[31mError: ${err instanceof Error ? err.message : String(err)}\x1b[0m`);
          }
          
          term.writeln('');
        } else if (cmd) {
          term.writeln(`\x1b[31mCommand not found: ${cmd}\x1b[0m`);
          term.writeln('Type "help" for available commands.');
          term.writeln('');
        }
      };
      
      writePrompt();
      
      term.onKey(e => {
        const ev = e.domEvent;
        
        if (ev.key === 'Enter') {
          term.writeln('');
          executeCommand(currentLine);
          writePrompt();
        } else if (ev.key === 'Backspace') {
          if (cursorPosition > 0) {
            currentLine = currentLine.slice(0, cursorPosition - 1) + currentLine.slice(cursorPosition);
            cursorPosition--;
            term.write('\b \b');
          }
        } else if (ev.key === 'ArrowLeft') {
          if (cursorPosition > 0) {
            cursorPosition--;
            term.write('\x1b[D');
          }
        } else if (ev.key === 'ArrowRight') {
          if (cursorPosition < currentLine.length) {
            cursorPosition++;
            term.write('\x1b[C');
          }
        } else if (ev.key === 'Home') {
          term.write('\x1b[' + cursorPosition + 'D');
          cursorPosition = 0;
        } else if (ev.key === 'End') {
          term.write('\x1b[' + (currentLine.length - cursorPosition) + 'C');
          cursorPosition = currentLine.length;
        } else if (ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey) {
          currentLine = currentLine.slice(0, cursorPosition) + ev.key + currentLine.slice(cursorPosition);
          cursorPosition++;
          term.write(ev.key);
        }
      });
      
      xtermRef.current = term;
    }
    return () => {
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
      }
    };
  }, [showTerminal, files, activeFileId]);

  // Status bar state
  const [status, setStatus] = useState('Ready');
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  // Easter egg state
  const [showEgg, setShowEgg] = useState(false);

  // Sidebar state
  const [showSidebar, setShowSidebar] = useState(true);

  // Accent color state
  const [accent, setAccent] = useState(localStorage.getItem('accent-color') || '#a78bfa');
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accent);
    localStorage.setItem('accent-color', accent);
  }, [accent]);

  // Command palette state
  const [showPalette, setShowPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const handleRunCode = async () => {
    if ([
      'python', 'cpp', 'c', 'java', 'csharp', 'go', 'ruby', 'php', 'rust', 'swift', 'kotlin', 'bash', 'typescript'
    ].includes(activeFile.language)) {
      setOutput(o => ({ ...o, [activeFileId]: 'Running...' }));
      setOutputType(t => ({ ...t, [activeFileId]: 'info' }));
      try {
        // Find the correct runtime for the selected language, considering aliases
        const runtime = runtimes.find((r: any) =>
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
    { label: 'Toggle Node.js Terminal', action: () => setShowTerminal(t => !t) },
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

  // File icon helper
  const getFileIcon = (file: any) => {
    const ext = file.name.split('.').pop();
    switch (ext) {
      case 'js': return <FileCode2 size={16} className="text-yellow-400" />;
      case 'ts': return <FileCode2 size={16} className="text-blue-400" />;
      case 'html': return <FileCode2 size={16} className="text-orange-400" />;
      case 'css': return <FileCode2 size={16} className="text-sky-400" />;
      case 'py': return <FileTerminal size={16} className="text-yellow-300" />;
      case 'sh': return <FileTerminal size={16} className="text-green-400" />;
      case 'json': return <FileJson size={16} className="text-lime-400" />;
      case 'cpp': return <FileCode2 size={16} className="text-blue-300" />;
      default: return <FileType size={16} className="text-gray-400" />;
    }
  };

  // File search/filter state
  const [fileSearch, setFileSearch] = useState('');
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
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
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

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-row font-mono text-gray-100"
      style={{ minHeight: '100dvh', position: 'relative' }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full flex flex-col bg-gradient-to-b from-gray-950/80 via-gray-900/70 to-gray-800/80 border-r border-purple-900/40 shadow-2xl backdrop-blur-xl ${showSidebar ? 'w-48 min-w-[140px] translate-x-0' : 'w-14 min-w-[48px] -translate-x-2'} z-30 ${showSidebar ? 'sidebar-open' : 'sidebar-collapsed'} transition-all duration-500 ease-in-out`} style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
        <div className="flex items-center justify-between px-3 py-4 border-b border-purple-900/30">
          <span className="font-bold text-lg tracking-wide text-purple-300 flex items-center gap-2 cursor-pointer select-none" onClick={() => setShowEgg(e => !e)}>
            <span className="transition-transform duration-300 hover:rotate-12">🦄</span>
            {'Files'}
          </span>
        </div>
        {/* File search/filter input */}
        <div className="px-2 py-1">
          <input
            type="text"
            value={fileSearch}
            onChange={e => setFileSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full px-2 py-1 rounded bg-gray-800 text-purple-100 border border-purple-900/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] text-xs font-mono"
            spellCheck={false}
          />
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-1 flex flex-col gap-2">
          {filteredFiles.map((file, idx) => (
            <div
              key={file.id}
              className={`flex items-center justify-center ${showSidebar ? 'gap-2 px-2' : 'px-0'} py-2 rounded-lg cursor-pointer text-sm transition-all duration-200 ${file.id === activeFileId ? 'bg-gradient-to-r from-purple-900/60 to-purple-700/40 text-purple-200 font-bold shadow-lg scale-105' : 'hover:bg-gray-800/70 text-gray-200'} group`}
              onClick={() => setActiveFileId(file.id)}
              style={{ minHeight: 40 }}
              draggable
              onDragStart={() => setDraggedFileId(file.id)}
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => {
                e.preventDefault();
                if (draggedFileId !== null && draggedFileId !== file.id) {
                  const fromIdx = files.findIndex(f => f.id === draggedFileId);
                  const toIdx = files.findIndex(f => f.id === file.id);
                  reorderFiles(fromIdx, toIdx);
                }
                setDraggedFileId(null);
              }}
              onDragEnd={() => setDraggedFileId(null)}
            >
              <span className="transition-transform duration-200 group-hover:scale-125 group-active:scale-95">
                {getFileIcon(file)}
              </span>
              {showSidebar && <span className="truncate transition-all duration-200">{file.name}</span>}
              {file.id === activeFileId && showSidebar && <span className="ml-auto text-xs text-purple-400 animate-pulse">●</span>}
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-purple-900/30 flex flex-col gap-3">
          {showSidebar && (
            <>
              <button onClick={handleAddFile} className="w-full py-2 rounded-xl bg-gradient-to-r from-[var(--accent-color)] to-purple-700 hover:from-purple-700 hover:to-purple-900 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]" title="New File">
                <Plus size={18} /><span>New File</span>
              </button>
              <button onClick={() => setShowSnippets(true)} className="w-full py-2 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 hover:from-purple-800 hover:to-purple-900 text-purple-200 font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-400" title="Snippets">
                <Code2 size={18} /><span>Snippets</span>
              </button>
            </>
          )}
          <div className="flex flex-col gap-1 mt-2 items-center">
            <label className="text-xs text-purple-200 font-semibold mb-1">Accent</label>
            <input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="w-8 h-8 rounded-full border-2 border-purple-300 bg-transparent cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all" title="Pick accent color" />
          </div>
        </div>
        {/* Removed settings and user buttons for a cleaner sidebar */}
      </aside>
      {/* Floating action buttons for collapsed sidebar */}
      {!showSidebar && (
        <div className="fixed left-5 bottom-28 flex flex-col gap-4 z-50">
          <button onClick={handleAddFile} className="p-4 rounded-full bg-gradient-to-br from-[var(--accent-color)] to-purple-700 text-white shadow-2xl hover:scale-110 hover:rotate-6 transition-all duration-200 border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]" title="New File">
            <Plus size={24} />
          </button>
          <button onClick={() => setShowSnippets(true)} className="p-4 rounded-full bg-gradient-to-br from-gray-700 to-purple-900 text-purple-200 shadow-2xl hover:scale-110 hover:-rotate-6 transition-all duration-200 border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400" title="Snippets">
            <Code2 size={24} />
          </button>
        </div>
      )}
      {/* Main Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${showSidebar ? 'ml-48' : 'ml-14'}`}>
        {/* Header */}
        <header className="w-full py-3 md:py-4 flex flex-row items-center justify-between bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 shadow-xl border-b border-gray-800 px-4">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-color)] to-purple-900 shadow-lg animate-spin-slow" style={{ animationPlayState: showEgg ? 'running' : 'paused' }}>🦄</span>
            <span className="text-lg md:text-2xl font-extrabold" style={{ color: 'var(--accent-color)' }}>SNIPPAD</span>
          </div>
          <span className="hidden md:block text-base text-purple-100 tracking-wide font-medium drop-shadow">Your modern code playground</span>
        </header>
        {/* Language Carousel */}
        <div
          className="relative w-full bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 border-b border-gray-800 py-2 flex items-center"
          style={{ height: 60 }}
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
        >
          {/* Carousel Content */}
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-hidden px-10 w-full select-none scrollbar-none"
            style={{ scrollBehavior: 'smooth' }}
          >
            {[...languageOptions, ...languageOptions].map((lang, idx) => (
              <div
                key={lang.value + '-' + idx}
                className="flex flex-col items-center justify-center px-2 py-2 rounded-lg w-[90px] min-w-[90px] max-w-[90px] transition-all duration-200 select-none shadow-sm border-2 bg-gray-900 border-gray-800 text-purple-200 text-center"
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}
                title={lang.label}
              >
                <span className="mb-1">{lang.icon}</span>
                <span className="font-bold tracking-wide uppercase">{lang.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* File Tabs (horizontal, VS Code style) */}
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-900 border-b border-gray-800 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent transition-all duration-300">
          {files.map(file => {
            const langObj = languageOptions.find(l => l.value === file.language);
            return (
              <div key={file.id} className={`flex items-center px-3 py-1 rounded-t border-b-2 cursor-pointer whitespace-nowrap font-mono text-sm transition-all duration-200 ${file.id === activeFileId ? 'bg-gray-800 border-purple-500 text-purple-200 font-bold scale-105 shadow-lg' : 'bg-gray-900 border-transparent text-gray-300 hover:bg-gray-800'}`} onClick={() => setActiveFileId(file.id)}>
                {getFileIcon(file)}
                <span className="mr-1 truncate max-w-[100px]">{file.name}</span>
                {files.length > 1 && (
                  <button onClick={e => { e.stopPropagation(); handleDeleteFile(file.id); }} className="ml-1 text-xs text-gray-400 hover:text-red-500"><X size={14} /></button>
                )}
              </div>
            );
          })}
            </div>
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col md:flex-row justify-center items-start gap-4 md:gap-8 px-2 md:px-8 py-3 md:py-6 max-w-[1600px] w-full mx-auto transition-all duration-300">
          <section className="flex flex-col gap-2 w-full md:w-[40%] min-w-[0] max-w-full md:max-w-[500px] h-full">
            {/* Active File Editor */}
            <div className="rounded-2xl shadow-2xl bg-gray-900 border border-gray-800 hover:shadow-purple-900/60 transition-shadow duration-300 group flex-1 min-h-[180px] md:min-h-[220px] max-h-[60vh] md:max-h-none overflow-auto">
              <div className="rounded-t-2xl px-4 py-2 bg-gradient-to-r from-purple-900 to-purple-700 text-white font-semibold text-sm tracking-wide border-b border-purple-800/40 shadow group-hover:shadow-md">{activeFile.name}</div>
              <div className="p-2 min-h-[180px] md:min-h-[220px] h-full">
                <CodeEditor ref={codeEditorRef} language={activeFile.language} value={activeFile.code} onChange={handleCodeChange} />
              </div>
            </div>
          </section>
          {/* Output Panel */}
          <section className="flex-1 min-w-[0] md:min-w-[320px] max-w-full md:max-w-[700px] h-full flex flex-col">
            <div className="rounded-2xl shadow-2xl bg-gray-900 border border-purple-900/60 flex flex-col h-full relative overflow-hidden flex-1">
              <div className="rounded-t-2xl px-4 py-2 bg-gradient-to-r from-purple-900 to-purple-700 text-white font-semibold text-sm tracking-wide border-b border-purple-800/40 shadow flex items-center justify-between">
                <span>Output</span>
                <button onClick={handleClearOutput} title="Clear Output" className="ml-2 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs">Clear</button>
              </div>
              <div className="flex-1 p-2 md:p-4 overflow-auto min-h-[300px] md:min-h-[660px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-t border-purple-900/40 transition-all duration-300">
                {[
                  'python', 'cpp', 'c', 'java', 'csharp', 'go', 'ruby', 'php', 'rust', 'swift', 'kotlin', 'bash', 'typescript'
                ].includes(activeFile.language) ? (
                  <div className={`w-full h-full min-h-[200px] md:min-h-[650px] bg-white border-none rounded-xl shadow-inner text-left ${outputType[activeFileId] === 'error' ? 'text-red-400' : outputType[activeFileId] === 'success' ? 'text-green-400' : 'text-gray-900'}`}
                    style={{ fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
                    <div dangerouslySetInnerHTML={{ __html: output[activeFileId] || '' }} />
                  </div>
                ) : (
                <iframe
                  title="Output"
                  srcDoc={`<html><body style='background:#fff;color:#222;font-family:JetBrains Mono,monospace;padding:1.5rem;font-size:1.1rem;'>${output[activeFileId] || ''}</body></html>`}
                  className="w-full h-full min-h-[200px] md:min-h-[650px] bg-white border-none rounded-xl shadow-inner"
                  sandbox="allow-scripts allow-same-origin"
                />
                )}
              </div>
            </div>
          </section>
      </main>
        {/* Status Bar */}
      {/* Bottom Bar */}
        <footer className="w-full flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 py-4 md:py-6 bg-transparent mt-2">
        <button
            className="flex items-center gap-2 px-7 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-700 active:scale-95"
            onClick={handleRunCode}
            title="Run the code (Ctrl+Enter)"
        >
          <Play size={20} /> Run Code
        </button>
        <button
            className="flex items-center gap-2 px-7 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-700 active:scale-95"
          onClick={clearCode}
            title="Clear all code in all files"
        >
          <Trash2 size={20} /> Clear Code
        </button>
        <button
            className="flex items-center gap-2 px-7 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-700 active:scale-95"
          onClick={exportCode}
            title="Export as HTML file"
          >
            <Download size={20} /> Export
          </button>
          <button
            className="flex items-center gap-2 px-7 py-2 rounded-xl bg-gradient-to-r from-green-700 to-green-900 hover:from-green-800 hover:to-green-950 text-white font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-700 active:scale-95"
            onClick={handleShare}
            title="Share code via Hastebin (link copied to clipboard)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 12l-6-6m0 0l-6 6m6-6v12" /></svg>
            Share
          </button>
        </footer>
        {/* Toggle Terminal Button */}
        <button
          className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-full bg-gray-900 text-purple-200 shadow-lg hover:bg-gray-800 transition-all border border-purple-900"
          onClick={() => setShowTerminal(t => !t)}
          title="Toggle Node.js Terminal"
        >
          {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
        </button>
        {/* Node.js Terminal Panel */}
        {showTerminal && (
          <div className="fixed bottom-0 left-0 w-full bg-gray-950 border-t border-purple-900 z-40 transition-all duration-300" style={{ height: '35vh', minHeight: 180, maxHeight: 320 }}>
            <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
          </div>
        )}
      </div>
      {/* Command Palette Modal */}
      {showPalette && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-4 min-w-[320px] max-w-[90vw] max-h-[80vh] flex flex-col gap-2 border border-purple-200">
            <input autoFocus value={paletteQuery} onChange={e => setPaletteQuery(e.target.value)} placeholder="Type a command..." className="p-2 rounded border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono text-sm" />
            <div className="flex flex-col gap-1 overflow-auto max-h-60">
              {filteredPalette.length === 0 && <div className="text-gray-400 text-xs p-2">No commands found.</div>}
              {filteredPalette.map((a, i) => (
                <button key={a.label} onClick={() => { a.action(); setShowPalette(false); setPaletteQuery(''); }} className="text-left px-3 py-2 rounded hover:bg-purple-100/60 text-sm font-mono transition-all duration-150" style={{ color: 'var(--accent-color)' }}>{a.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Code Snippets Modal */}
      {showSnippets && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-100 via-white to-purple-50/80 backdrop-blur-lg rounded-2xl shadow-2xl p-7 min-w-[320px] max-w-[95vw] flex flex-col gap-5 border border-purple-300 relative animate-fade-in">
            <h2 className="text-2xl font-extrabold text-purple-700 mb-1 tracking-tight">Insert Code Snippet</h2>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {/* Built-in snippets */}
              {codeSnippets.filter(s => s.language === activeFile.language).length === 0 && userSnippets.filter(s => s.language === activeFile.language).length === 0 && (
                <div className="text-gray-500 font-mono text-base">No snippets available for this language.</div>
              )}
              {codeSnippets.filter(s => s.language === activeFile.language).map(snippet => (
                <button key={snippet.name} onClick={() => handleInsertSnippet(snippet.code)} className="text-left px-4 py-3 rounded-lg bg-white hover:bg-purple-100 border border-purple-200 font-mono text-base text-gray-800 shadow-sm transition-all duration-150">
                  <span className="font-bold text-purple-700">{snippet.name}</span>
                  <pre className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">{snippet.code}</pre>
                </button>
              ))}
              {/* User-defined snippets */}
              {userSnippets.filter(s => s.language === activeFile.language).map((snippet, idx) => (
                <div key={snippet.name + idx} className="flex flex-col gap-1 bg-white border border-purple-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleInsertSnippet(snippet.code)} className="font-bold text-purple-700 hover:underline text-left flex-1">{snippet.name}</button>
                    <button onClick={() => handleEditSnippet(idx)} className="text-xs text-blue-500 hover:underline">Edit</button>
                    <button onClick={() => handleDeleteSnippet(idx)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                  <pre className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">{snippet.code}</pre>
                </div>
              ))}
            </div>
            {/* Add/Edit snippet form */}
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={snippetForm.name}
                  onChange={e => setSnippetForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Snippet name"
                  className="flex-1 px-2 py-1 rounded border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-mono"
                />
                <select
                  value={snippetForm.language}
                  onChange={e => setSnippetForm(f => ({ ...f, language: e.target.value }))}
                  className="px-2 py-1 rounded border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-mono"
                >
                  {languageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={snippetForm.code}
                onChange={e => setSnippetForm(f => ({ ...f, code: e.target.value }))}
                placeholder="Snippet code..."
                className="w-full px-2 py-1 rounded border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-mono min-h-[60px]"
              />
              <div className="flex gap-2 justify-end">
                {snippetForm.editIdx === null ? (
                  <button onClick={handleAddSnippet} className="px-4 py-1 rounded bg-purple-600 text-white font-bold text-sm hover:bg-purple-700">Add</button>
                ) : (
                  <>
                    <button onClick={handleUpdateSnippet} className="px-4 py-1 rounded bg-blue-600 text-white font-bold text-sm hover:bg-blue-700">Update</button>
                    <button onClick={() => setSnippetForm({ name: '', language: activeFile.language, code: '', editIdx: null })} className="px-4 py-1 rounded bg-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-400">Cancel</button>
                  </>
                )}
              </div>
            </div>
            <button onClick={() => setShowSnippets(false)} className="absolute top-3 right-3 text-purple-400 hover:text-purple-700 text-xl font-bold p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/70 shadow-sm" title="Close">×</button>
          </div>
        </div>
      )}
      {/* New File Modal */}
      {showAddFile && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onKeyDown={e => {
          if (e.key === 'Escape') setShowAddFile(false);
          if (e.key === 'Enter') handleCreateFile();
        }}>
          <div className="bg-gradient-to-br from-gray-100 via-white to-purple-50/80 backdrop-blur-lg rounded-2xl shadow-2xl p-7 min-w-[320px] max-w-[95vw] flex flex-col gap-5 border border-purple-300 relative animate-fade-in">
            <h2 className="text-2xl font-extrabold text-purple-700 mb-1 tracking-tight">Create New File</h2>
            <label className="flex flex-col gap-1 font-mono text-base text-gray-800">
              File Name
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. myfile.js"
                className="p-3 rounded-lg border-2 border-purple-200 focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)] bg-white text-gray-900 font-mono text-base transition-all outline-none shadow-sm"
                autoFocus
                spellCheck={false}
                maxLength={40}
              />
            </label>
            <label className="flex flex-col gap-1 font-mono text-base text-gray-800">
              Language
              <select
                value={newLang}
                onChange={e => setNewLang(e.target.value)}
                className="p-3 rounded-lg border-2 border-purple-200 focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)] bg-white text-gray-900 font-mono text-base transition-all outline-none shadow-sm cursor-pointer"
              >
                {languageOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            {/* Error message for empty or duplicate file name */}
            {(!newName.trim() || files.some(f => f.name === newName.trim())) && (
              <div className="text-red-500 font-mono text-sm -mt-3">
                { !newName.trim() ? 'File name cannot be empty.' : 'A file with this name already exists.' }
              </div>
            )}
            <div className="flex gap-4 mt-2 justify-end">
              <button
                onClick={() => setShowAddFile(false)}
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold shadow-sm transition-all border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                className="px-5 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-purple-700 text-white font-bold shadow-md transition-all border border-purple-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newName.trim() || files.some(f => f.name === newName.trim())}
                type="button"
              >
                Create
              </button>
            </div>
            <button onClick={() => setShowAddFile(false)} className="absolute top-3 right-3 text-purple-400 hover:text-purple-700 text-xl font-bold p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/70 shadow-sm" title="Close">×</button>
          </div>
        </div>
      )}
    </div>
  );
}; 

/* Add slow spin animation for logo */
<style>{`
@keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.animate-spin-slow { animation: spin-slow 6s linear infinite; }
`}</style> 