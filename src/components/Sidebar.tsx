import React from 'react';

interface File {
  id: number;
  name: string;
  language: string;
  code: string;
}

interface SidebarProps {
  files: File[];
  activeFileId: number;
  setActiveFileId: (id: number) => void;
  fileSearch: string;
  setFileSearch: (val: string) => void;
  handleAddFile: () => void;
  setShowSnippets: (val: boolean) => void;
  setShowLanguageSupport: (val: boolean) => void;
  getFileIcon: (file: File) => React.ReactNode;
  showSidebar: boolean;
  reorderFiles: (startIdx: number, endIdx: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  files,
  activeFileId,
  setActiveFileId,
  fileSearch,
  setFileSearch,
  handleAddFile,
  setShowSnippets,
  setShowLanguageSupport,
  getFileIcon,
  showSidebar,
  reorderFiles,
}) => {
  const [draggedFileId, setDraggedFileId] = React.useState<number | null>(null);
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(fileSearch.toLowerCase()));

  return (
    <aside className={`fixed top-0 left-0 h-full flex flex-col bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#21262d] border-r border-[#30363d]/50 backdrop-blur-sm ${showSidebar ? 'w-64 min-w-[200px] translate-x-0' : 'w-16 min-w-[56px] -translate-x-2'} z-30 transition-all duration-300 ease-in-out shadow-2xl`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]/50 bg-gradient-to-r from-[#0d1117] to-[#161b22]">
        <span className="font-bold text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#58a6ff] to-[#a371f7] flex items-center gap-2 cursor-pointer select-none">
          <span className="transition-all duration-300 hover:rotate-12 hover:scale-110 text-[#58a6ff]">⚡</span>
          {showSidebar && <span className="font-extrabold">FILE EXPLORER</span>}
        </span>
      </div>
      {showSidebar && (
        <div className="px-3 py-2 border-b border-[#30363d]">
          <input
            type="text"
            value={fileSearch}
            onChange={e => setFileSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full px-3 py-2 rounded-md bg-[#0d1117] text-[#c9d1d9] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-[#58a6ff] focus:border-[#58a6ff] text-sm font-mono"
            spellCheck={false}
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-1">
        {filteredFiles.map((file, idx) => (
          <div
            key={file.id}
            className={`flex items-center ${showSidebar ? 'gap-3 px-3' : 'justify-center px-0'} py-2 rounded-lg cursor-pointer text-sm transition-all duration-300 ${file.id === activeFileId ? 'bg-gradient-to-r from-[#1f6feb] to-[#388bfd] text-white font-medium shadow-lg scale-105' : 'hover:bg-gradient-to-r hover:from-[#21262d] hover:to-[#30363d] text-[#c9d1d9] hover:scale-102'} group relative overflow-hidden`}
            onClick={() => setActiveFileId(file.id)}
            style={{ minHeight: 36 }}
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
            {file.id === activeFileId && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#1f6feb]/20 to-[#388bfd]/20 blur-sm"></div>
            )}
            <span className="transition-all duration-300 group-hover:scale-125 group-active:scale-95 text-[#7d8590] group-hover:text-[#58a6ff] relative z-10">
              {getFileIcon(file)}
            </span>
            {showSidebar && <span className="truncate transition-all duration-200 relative z-10">{file.name}</span>}
            {file.id === activeFileId && showSidebar && <span className="ml-auto text-xs text-[#58a6ff] animate-pulse relative z-10">●</span>}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-[#30363d]/50 flex flex-col gap-3 bg-gradient-to-t from-[#0d1117] to-[#161b22]">
        {showSidebar && (
          <>
            <button onClick={handleAddFile} className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#3fb950] text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#238636] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95" title="New File">
              <span>＋</span><span> New File</span>
            </button>
            <button onClick={() => setShowSnippets(true)} className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#21262d] to-[#30363d] hover:from-[#30363d] hover:to-[#484f58] text-[#c9d1d9] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#58a6ff] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95" title="Snippets">
              <span>⧉</span><span>Snippets</span>
            </button>
            <button onClick={() => setShowLanguageSupport(true)} className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1f6feb] to-[#388bfd] hover:from-[#388bfd] hover:to-[#58a6ff] text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#1f6feb] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95" title="Language Support & Features">
              <span>⚙️</span><span>Languages</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}; 