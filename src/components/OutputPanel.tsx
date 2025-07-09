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
      <div className="rounded-2xl shadow-2xl bg-[#181a20] border border-[#BCDD19] flex flex-col h-full relative overflow-hidden flex-1">
        <div className="rounded-t-2xl px-6 py-4 bg-[#0a0d14] text-[#BCDD19] font-bold text-sm tracking-wide border-b border-[#BCDD19] shadow-lg flex items-center justify-between">
          <span className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#BCDD19] animate-pulse"></span>
              <span className="font-extrabold">OUTPUT</span>
            </div>
            <span className="px-2 py-1 rounded-full bg-[#181a20] border border-[#BCDD19] text-xs text-[#BCDD19] font-mono">CONSOLE</span>
          </span>
          <button onClick={handleClearOutput} title="Clear Output" className="px-4 py-2 rounded-xl bg-[#181a20] hover:bg-[#BCDD19] hover:text-[#181a20] text-[#BCDD19] text-xs transition-all duration-300 font-bold hover:scale-105 active:scale-95 border border-[#BCDD19]">🗑️ Clear</button>
        </div>
        <div className="flex-1 p-6 overflow-auto min-h-[300px] md:min-h-[700px] bg-[#0a0d14] border-t border-[#BCDD19] transition-all duration-300">
          {isConsoleLang ? (
            <div className={`w-full h-full min-h-[200px] md:min-h-[650px] bg-[#0a0d14] border border-[#BCDD19] rounded-md shadow-inner text-left ${outputType[activeFileId] === 'error' ? 'text-[#f85149]' : outputType[activeFileId] === 'success' ? 'text-[#BCDD19]' : 'text-[#e6e6e6]'}`}
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>
              <div dangerouslySetInnerHTML={{ __html: output[activeFileId] || '' }} />
            </div>
          ) : (
            <iframe
              title="Output"
              srcDoc={`<html><body style='background:#0a0d14;color:#e6e6e6;font-family:JetBrains Mono,monospace;padding:1.5rem;font-size:1.1rem;'>${output[activeFileId] || ''}</body></html>`}
              className="w-full h-full min-h-[200px] md:min-h-[650px] bg-[#0a0d14] border border-[#BCDD19] rounded-md shadow-inner"
              sandbox="allow-scripts allow-same-origin"
            />
          )}
        </div>
      </div>
    </section>
  );
};