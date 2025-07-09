import React from 'react';

interface OutputPanelProps {
  activeFile: { id: number; name: string; language: string; code: string };
  activeFileId: number;
  output: { [id: number]: string };
  outputType: { [id: number]: 'success' | 'error' | 'info' };
  handleClearOutput: () => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  activeFile,
  activeFileId,
  output,
  outputType,
  handleClearOutput,
}) => {
  const isConsoleLang = [
    'python', 'cpp', 'c', 'java', 'csharp', 'go', 'ruby', 'php', 'rust', 'swift', 'kotlin', 'bash', 'typescript'
  ].includes(activeFile.language);

  return (
    <section className="flex-1 min-w-[0] md:min-w-[350px] max-w-full md:max-w-[800px] h-full flex flex-col">
      <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] border border-[#30363d]/50 flex flex-col h-full relative overflow-hidden flex-1">
        <div className="rounded-t-2xl px-6 py-4 bg-gradient-to-r from-[#161b22] to-[#21262d] text-[#c9d1d9] font-bold text-sm tracking-wide border-b border-[#30363d]/50 shadow-lg flex items-center justify-between">
          <span className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#238636] animate-pulse"></span>
              <span className="font-extrabold">OUTPUT</span>
            </div>
            <span className="px-2 py-1 rounded-full bg-[#21262d] border border-[#30363d]/50 text-xs text-[#7d8590] font-mono">CONSOLE</span>
          </span>
          <button onClick={handleClearOutput} title="Clear Output" className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#21262d] to-[#30363d] hover:from-[#30363d] hover:to-[#484f58] text-[#7d8590] text-xs transition-all duration-300 font-bold hover:scale-105 active:scale-95">🗑️ Clear</button>
        </div>
        <div className="flex-1 p-6 overflow-auto min-h-[300px] md:min-h-[700px] bg-[#0d1117] border-t border-[#30363d]/50 transition-all duration-300">
          {isConsoleLang ? (
            <div className={`w-full h-full min-h-[200px] md:min-h-[650px] bg-[#0d1117] border border-[#30363d] rounded-md shadow-inner text-left ${outputType[activeFileId] === 'error' ? 'text-[#f85149]' : outputType[activeFileId] === 'success' ? 'text-[#238636]' : 'text-[#c9d1d9]'}`}
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>
              <div dangerouslySetInnerHTML={{ __html: output[activeFileId] || '' }} />
            </div>
          ) : (
            <iframe
              title="Output"
              srcDoc={`<html><body style='background:#0d1117;color:#c9d1d9;font-family:JetBrains Mono,monospace;padding:1.5rem;font-size:1.1rem;'>${output[activeFileId] || ''}</body></html>`}
              className="w-full h-full min-h-[200px] md:min-h-[650px] bg-[#0d1117] border border-[#30363d] rounded-md shadow-inner"
              sandbox="allow-scripts allow-same-origin"
            />
          )}
        </div>
      </div>
    </section>
  );
};