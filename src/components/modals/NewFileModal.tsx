import React from 'react';
import { X } from 'lucide-react';

interface NewFileModalProps {
  showAddFile: boolean;
  setShowAddFile: (val: boolean) => void;
  newName: string;
  setNewName: (val: string) => void;
  newLang: string;
  setNewLang: (val: string) => void;
  handleCreateFile: () => void;
  languageOptions: { label: string; value: string }[];
  files: { name: string }[];
}

export const NewFileModal: React.FC<NewFileModalProps> = ({
  showAddFile,
  setShowAddFile,
  newName,
  setNewName,
  newLang,
  setNewLang,
  handleCreateFile,
  languageOptions,
  files,
}) => {
  if (!showAddFile) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
         onKeyDown={e => {
           if (e.key === 'Escape') setShowAddFile(false);
           if (e.key === 'Enter') handleCreateFile();
         }}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New File</h2>
          <button 
            onClick={() => setShowAddFile(false)} 
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. myfile.js"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              autoFocus
              spellCheck={false}
              maxLength={40}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={newLang}
              onChange={e => setNewLang(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
            >
              {languageOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          {/* Error message */}
          {(!newName.trim() || files.some(f => f.name === newName.trim())) && (
            <div className="text-red-600 text-sm">
              {!newName.trim() ? 'File name cannot be empty.' : 'A file with this name already exists.'}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={() => setShowAddFile(false)}
            className="btn btn-secondary"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateFile}
            className="btn btn-primary"
            disabled={!newName.trim() || files.some(f => f.name === newName.trim())}
            type="button"
          >
            Create File
          </button>
        </div>
      </div>
    </div>
  );
}; 