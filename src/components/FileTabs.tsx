import React from 'react';

interface File {
  id: number;
  name: string;
  language: string;
  code: string;
}

interface FileTabsProps {
  files: File[];
  activeFileId: number;
  setActiveFileId: (id: number) => void;
  handleDeleteFile: (id: number) => void;
  getFileIcon: (file: File) => React.ReactNode;
  showSidebar: boolean;
}

export const FileTabs: React.FC<FileTabsProps> = ({
  files,
  activeFileId,
  setActiveFileId,
  handleDeleteFile,
  getFileIcon,
  showSidebar,
}) => {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-[#161b22] to-[#21262d] border-b border-[#30363d]/50 overflow-x-auto scrollbar-thin scrollbar-thumb-[#30363d] scrollbar-track-transparent transition-all duration-300">
      {files.map(file => (
        <div key={file.id} className={`flex items-center px-4 py-3 rounded-t-xl border-b-2 cursor-pointer whitespace-nowrap font-mono text-sm transition-all duration-300 relative group ${file.id === activeFileId ? 'bg-gradient-to-b from-[#0d1117] to-[#161b22] border-[#58a6ff] text-[#58a6ff] font-bold shadow-lg' : 'bg-[#161b22]/50 border-transparent text-[#7d8590] hover:bg-gradient-to-b hover:from-[#21262d] hover:to-[#30363d] hover:text-[#c9d1d9] hover:border-[#30363d]'}`} onClick={() => setActiveFileId(file.id)}>
          {file.id === activeFileId && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#58a6ff]/10 to-[#a371f7]/10 rounded-t-xl blur-sm"></div>
          )}
          <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
            {getFileIcon(file)}
          </span>
          <span className="mr-2 truncate max-w-[120px] relative z-10 font-medium">{file.name}</span>
          {files.length > 1 && (
            <button onClick={e => { e.stopPropagation(); handleDeleteFile(file.id); }} className="ml-1 text-xs text-[#7d8590] hover:text-[#f85149] transition-colors relative z-10 hover:scale-125">×</button>
          )}
        </div>
      ))}
    </div>
  );
}; 