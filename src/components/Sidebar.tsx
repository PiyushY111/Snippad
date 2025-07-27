import React from 'react';
import { Plus, FolderOpen, Code2, X, Edit2, Trash2, Search, FileText, FileCode2, FileJson, FileType, User } from 'lucide-react';

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
  setFileSearch: (search: string) => void;
  handleAddFile: () => void;
  setShowSnippets: (show: boolean) => void;
  setShowLanguageSupport: (show: boolean) => void;
  getFileIcon: (file: File) => React.ReactNode;
  showSidebar: boolean;
  reorderFiles: (startIdx: number, endIdx: number) => void;
  setShowSettings: (show: boolean) => void;
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
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex !== dropIndex) {
      reorderFiles(dragIndex, dropIndex);
    }
  };

  return (
    <aside className={`${showSidebar ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <FolderOpen size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Files</h2>
              <p className="text-xs text-gray-500">{files.length} files</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={fileSearch}
            onChange={(e) => setFileSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {files
          .filter(file => file.name.toLowerCase().includes(fileSearch.toLowerCase()))
          .map((file, index) => (
            <div
              key={file.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`sidebar-item cursor-pointer group ${
                activeFileId === file.id ? 'active' : ''
              }`}
              onClick={() => setActiveFileId(file.id)}
            >
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-gray-500 group-hover:text-blue-600 transition-colors">
                  {getFileIcon(file)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {file.language}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle edit
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle delete
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        
        {files.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={20} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No files yet</p>
            <p className="text-gray-400 text-xs mt-1">Create your first file to get started</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {showSidebar && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleAddFile}
              className="btn btn-primary text-xs py-2"
            >
              <Plus size={14} className="mr-1" />
              New File
            </button>
            <button
              onClick={() => setShowSnippets(true)}
              className="btn btn-secondary text-xs py-2"
            >
              <Code2 size={14} className="mr-1" />
              Snippets
            </button>
            <button
              onClick={() => setShowLanguageSupport(true)}
              className="btn btn-secondary text-xs py-2"
            >
              <FileCode2 size={14} className="mr-1" />
              Languages
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}; 