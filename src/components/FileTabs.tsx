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
    <div className="flex items-center gap-1 px-3 py-2 bg-[#181a20] border-b border-[#BCDD19] overflow-x-auto scrollbar-thin scrollbar-thumb-[#BCDD19] scrollbar-track-transparent transition-all duration-300">
      {files.map(file => (
        <div key={file.id} className={`flex items-center px-4 py-3 rounded-t-xl border-b-2 cursor-pointer whitespace-nowrap font-mono text-sm transition-all duration-300 relative group ${file.id === activeFileId ? 'bg-[#0a0d14] border-[#BCDD19] text-[#BCDD19] font-bold shadow-lg' : 'bg-[#181a20] border-transparent text-[#e6e6e6] hover:bg-[#0a0d14] hover:text-[#BCDD19] hover:border-[#BCDD19]'}`} onClick={() => setActiveFileId(file.id)}>
          {file.id === activeFileId && (
            <div className="absolute inset-0 bg-[#BCDD19] opacity-5 rounded-t-xl blur-sm"></div>
          )}
          <span className="relative z-10 transition-transform duration-300 group-hover:scale-110 text-[#BCDD19]">
            {getFileIcon(file)}
          </span>
          <span className="mr-2 truncate max-w-[120px] relative z-10 font-medium">{file.name}</span>
          {files.length > 1 && (
            <button onClick={e => { e.stopPropagation(); handleDeleteFile(file.id); }} className="ml-1 text-xs text-[#e6e6e6] hover:text-[#f85149] transition-colors relative z-10 hover:scale-125">×</button>
          )}
        </div>
      ))}
    </div>
  );
}; 