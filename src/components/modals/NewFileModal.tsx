import React from 'react';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onKeyDown={e => {
      if (e.key === 'Escape') setShowAddFile(false);
      if (e.key === 'Enter') handleCreateFile();
    }}>
      <div className="bg-[#161b22]/95 backdrop-blur-lg rounded-lg shadow-2xl p-6 min-w-[320px] max-w-[95vw] flex flex-col gap-5 border border-[#30363d] relative animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#c9d1d9] mb-1 tracking-tight">Create New File</h2>
          <button onClick={() => setShowAddFile(false)} className="text-[#7d8590] hover:text-[#c9d1d9] text-xl font-bold p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#58a6ff] bg-[#21262d]/50 shadow-sm" title="Close">×</button>
        </div>
        <label className="flex flex-col gap-2 font-mono text-sm text-[#c9d1d9]">
          File Name
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. myfile.js"
            className="p-3 rounded-md border-2 border-[#30363d] focus:border-[#58a6ff] focus:ring-2 focus:ring-[#58a6ff] bg-[#0d1117] text-[#c9d1d9] font-mono text-sm transition-all outline-none shadow-sm"
            autoFocus
            spellCheck={false}
            maxLength={40}
          />
        </label>
        <label className="flex flex-col gap-2 font-mono text-sm text-[#c9d1d9]">
          Language
          <select
            value={newLang}
            onChange={e => setNewLang(e.target.value)}
            className="p-3 rounded-md border-2 border-[#30363d] focus:border-[#58a6ff] focus:ring-2 focus:ring-[#58a6ff] bg-[#0d1117] text-[#c9d1d9] font-mono text-sm transition-all outline-none shadow-sm cursor-pointer"
          >
            {languageOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        {/* Error message for empty or duplicate file name */}
        {(!newName.trim() || files.some(f => f.name === newName.trim())) && (
          <div className="text-[#f85149] font-mono text-sm -mt-3">
            { !newName.trim() ? 'File name cannot be empty.' : 'A file with this name already exists.' }
          </div>
        )}
        <div className="flex gap-4 mt-2 justify-end">
          <button
            onClick={() => setShowAddFile(false)}
            className="px-5 py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] font-medium shadow-sm transition-all border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateFile}
            className="px-5 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white font-medium shadow-md transition-all border border-[#238636] focus:outline-none focus:ring-2 focus:ring-[#238636] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newName.trim() || files.some(f => f.name === newName.trim())}
            type="button"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}; 