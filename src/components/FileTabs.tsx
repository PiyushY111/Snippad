import React from 'react';
import { X } from 'lucide-react';

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
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center overflow-x-auto scrollbar-hide">
        {files.map((file) => (
          <div
            key={file.id}
            className={`tab-item flex-shrink-0 group relative ${
              activeFileId === file.id ? 'active' : ''
            }`}
            onClick={() => setActiveFileId(file.id)}
          >
            <div className="flex items-center space-x-2 px-4 py-3">
              <span className="text-gray-500 group-hover:text-blue-600 transition-colors">
                {getFileIcon(file)}
              </span>
              <span className="text-sm font-medium truncate max-w-32">
                {file.name}
              </span>
              <div className="flex items-center space-x-1">
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-md group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                  {file.language}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Close tab"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            
            {/* Active indicator */}
            {activeFileId === file.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </div>
        ))}
        
        {files.length === 0 && (
          <div className="flex items-center px-6 py-4 text-gray-500">
            <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
            <span className="text-sm">No files open</span>
          </div>
        )}
      </div>
    </div>
  );
}; 