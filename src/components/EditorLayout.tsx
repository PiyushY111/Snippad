import { useState, useEffect } from 'react';
import { CodeEditor } from './CodeEditor';
import { Play, Trash2, Download, Code2 } from 'lucide-react';

const defaultHTML = `<h1>Hello!</h1>\n<p>Write HTML, CSS or JavaScript code here and click 'Run Code'.</p>`;
const defaultCSS = `/* CSS goes here */`;
const defaultJS = `// JS code here`;

export const EditorLayout = () => {
  const [html, setHtml] = useState(defaultHTML);
  const [css, setCss] = useState(defaultCSS);
  const [js, setJs] = useState(defaultJS);
  const [output, setOutput] = useState('');

  // Live preview: update output automatically as code changes
  useEffect(() => {
    setOutput(`<!DOCTYPE html>\n<html>\n<head>\n<style>${css}</style>\n</head>\n<body>\n${html}\n<script>${js}<\/script>\n</body>\n</html>`);
  }, [html, css, js]);

  const clearCode = () => {
    setHtml('');
    setCss('');
    setJs('');
    setOutput('');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-purple-200 to-white flex flex-col font-sans">
      {/* Header */}
      <header className="w-full py-8 flex flex-col items-center justify-center bg-gradient-to-r from-purple-600/80 to-purple-400/80 shadow-xl backdrop-blur-md relative z-10">
        <div className="flex items-center space-x-3">
          <Code2 size={38} className="text-white drop-shadow-lg" />
          <span className="text-4xl font-extrabold text-white tracking-wide drop-shadow">SNIPPAD</span>
        </div>
        <span className="mt-2 text-lg text-purple-100 tracking-wide font-medium drop-shadow">Your modern code playground</span>
        <div className="absolute left-0 bottom-0 w-full h-[2px] bg-gradient-to-r from-purple-300/0 via-white/60 to-purple-300/0 blur-sm" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row justify-center items-start gap-8 px-4 md:px-8 py-6 max-w-[1600px] w-full mx-auto">
        {/* Code Panels and Output side by side, both full height */}
        <div className="flex flex-1 w-full h-full gap-8">
          {/* Code Panels */}
          <section className="flex flex-col gap-6 w-full md:w-[40%] min-w-[320px] max-w-[500px] h-full">
            {/* HTML Panel */}
            <div className="rounded-2xl shadow-2xl bg-white/80 border border-purple-200 hover:shadow-purple-200/60 transition-shadow duration-300 group flex-1 min-h-[220px]">
              <div className="rounded-t-2xl px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-400 text-white font-semibold text-sm tracking-wide border-b border-purple-300/40 shadow group-hover:shadow-md">HTML</div>
              <div className="p-2 min-h-[220px] h-full">
                <CodeEditor language="html" value={html} onChange={setHtml} />
              </div>
            </div>
            {/* CSS Panel */}
            <div className="rounded-2xl shadow-2xl bg-white/80 border border-purple-200 hover:shadow-purple-200/60 transition-shadow duration-300 group flex-1 min-h-[220px]">
              <div className="rounded-t-2xl px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-400 text-white font-semibold text-sm tracking-wide border-b border-purple-300/40 shadow group-hover:shadow-md">CSS</div>
              <div className="p-2 min-h-[220px] h-full">
                <CodeEditor language="css" value={css} onChange={setCss} />
              </div>
            </div>
            {/* JS Panel */}
            <div className="rounded-2xl shadow-2xl bg-white/80 border border-purple-200 hover:shadow-purple-200/60 transition-shadow duration-300 group flex-1 min-h-[220px]">
              <div className="rounded-t-2xl px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-400 text-white font-semibold text-sm tracking-wide border-b border-purple-300/40 shadow group-hover:shadow-md">JavaScript</div>
              <div className="p-2 min-h-[220px] h-full">
                <CodeEditor language="javascript" value={js} onChange={setJs} />
              </div>
            </div>
          </section>
          {/* Output Panel */}
          <section className="flex-1 min-w-[320px] max-w-[700px] h-full flex flex-col">
            <div className="rounded-2xl shadow-2xl bg-white/90 border border-purple-200/60 flex flex-col h-full relative overflow-hidden flex-1">
              <div className="rounded-t-2xl px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-400 text-white font-semibold text-sm tracking-wide border-b border-purple-300/40 shadow">Output</div>
              <div className="flex-1 p-4 overflow-auto min-h-[660px] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-50 via-white to-white border-t border-purple-100/40">
                <iframe
                  title="Output"
                  srcDoc={output}
                  className="w-full h-full min-h-[650px] bg-white/80 border-none rounded-xl shadow-inner"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="w-full flex flex-col md:flex-row justify-center items-center gap-4 py-6 bg-transparent mt-2">
        <button
          className="flex items-center gap-2 px-7 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 active:scale-95"
          onClick={() => setOutput(`<!DOCTYPE html>\n<html>\n<head>\n<style>${css}</style>\n</head>\n<body>\n${html}\n<script>${js}<\/script>\n</body>\n</html>`)}
        >
          <Play size={20} /> Run Code
        </button>
        <button
          className="flex items-center gap-2 px-7 py-2 rounded-xl bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200 active:scale-95"
          onClick={clearCode}
        >
          <Trash2 size={20} /> Clear Code
        </button>
        <button
          className="flex items-center gap-2 px-7 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 active:scale-95"
          onClick={exportCode}
        >
          <Download size={20} /> Export
        </button>
      </footer>
    </div>
  );
}; 