import React from 'react';
import { Settings } from 'lucide-react';

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
  setShowSettings?: (val: boolean) => void;
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
  setShowSettings,
}) => {
  const [draggedFileId, setDraggedFileId] = React.useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(fileSearch.toLowerCase()));

  return (
    <aside className={`fixed top-0 left-0 h-full flex flex-col z-40 transition-all duration-300 ease-in-out ${showSidebar ? 'w-[273px] min-w-[217px]' : 'w-16 min-w-[56px]'} group bg-[#181a20] border-r border-[#BCDD19]`}>
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-4 border-b border-[#BCDD19]">
        <span className="font-black text-lg tracking-tight text-[#BCDD19] flex items-center gap-2 cursor-pointer select-none">
          <span className="">⚡</span>
          {showSidebar && <span className="font-extrabold">FILE EXPLORER</span>}
        </span>
      </div>
      {/* File Search */}
      {showSidebar && (
        <div className="px-4 py-3 border-b border-[#BCDD19]">
          <input
            type="text"
            value={fileSearch}
            onChange={e => setFileSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full px-3 py-2 rounded-md bg-[#0a0d14] text-[#BCDD19] border border-[#BCDD19] focus:outline-none focus:ring-2 focus:ring-[#BCDD19] focus:border-[#BCDD19] text-sm font-mono"
            spellCheck={false}
          />
        </div>
      )}
      {/* File List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-2">
        {filteredFiles.map((file, idx) => (
          <div
            key={file.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-base font-mono transition-all duration-200 border border-transparent ${file.id === activeFileId ? 'bg-[#0a0d14] text-[#BCDD19] border-[#BCDD19] font-bold' : 'bg-[#181a20] text-[#e6e6e6] hover:bg-[#0a0d14] hover:text-[#BCDD19]'} group`}
            onClick={() => setActiveFileId(file.id)}
            style={{ minHeight: 44 }}
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
            <span className="transition-all duration-200 group-hover:scale-110 group-active:scale-95 text-[#BCDD19]">
              {getFileIcon(file)}
            </span>
            {showSidebar && <span className="truncate transition-all duration-200">{file.name}</span>}
            {file.id === activeFileId && showSidebar && <span className="ml-auto text-xs text-[#BCDD19] font-black">●</span>}
          </div>
        ))}
      </div>
      {/* Bottom Actions: New File button as a bar above the drawer */}
      <div className="relative z-30 flex flex-col items-center w-full pb-2 bg-[#181a20]">
        {showSidebar && (
          <button
            onClick={handleAddFile}
            className="mb-3 w-11/12 max-w-[220px] py-4 rounded-full bg-[#0a0d14] border-2 border-[#BCDD19] flex items-center justify-center gap-3 text-[#BCDD19] text-lg font-black hover:scale-105 active:scale-95 transition-all duration-200"
            title="New File"
            style={{}}
          >
            <span className="text-2xl leading-none">＋</span>
            <span className="font-bold tracking-wide">New File</span>
          </button>
        )}
        {/* Collapsible Drawer for Actions */}
        <div className={`w-full transition-all duration-200 ${drawerOpen ? 'h-56' : 'h-16'}`}>
          <div className="relative w-full h-full flex flex-col items-center justify-end bg-[#0a0d14] rounded-t-2xl border-t border-[#BCDD19]">
            <button
              onClick={() => setDrawerOpen(d => !d)}
              className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#0a0d14] border-2 border-[#BCDD19] flex items-center justify-center text-[#BCDD19] text-xl font-black transition-all duration-200"
              title={drawerOpen ? 'Hide Actions' : 'Show Actions'}
            >
              {drawerOpen ? '▼' : '▲'}
            </button>
            {drawerOpen && (
              <div className="w-full flex flex-col gap-3 px-6 py-6">
                <button onClick={() => setShowSnippets && setShowSnippets(true)} className="w-full py-3 px-4 rounded-xl bg-[#181a20] text-[#BCDD19] font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#BCDD19] border border-[#BCDD19] hover:bg-[#0a0d14] hover:text-[#e6e6e6]" title="Snippets">
                  <span>⧉</span><span>Snippets</span>
                </button>
                <button onClick={() => setShowLanguageSupport && setShowLanguageSupport(true)} className="w-full py-3 px-4 rounded-xl bg-[#0a0d14] text-[#BCDD19] font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#BCDD19] border border-[#BCDD19] hover:bg-[#181a20] hover:text-[#e6e6e6]" title="Language Support & Features">
                  <span>⚙️</span><span>Languages</span>
                </button>
                {setShowSettings && (
                  <button onClick={() => setShowSettings(true)} className="w-full py-3 px-4 rounded-xl bg-[#0a0d14] text-[#BCDD19] font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#BCDD19] border border-[#BCDD19] hover:bg-[#181a20] hover:text-[#e6e6e6]" title="Editor Settings">
                    <Settings size={22} />
                    <span>Settings</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}; 