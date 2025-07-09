import React from 'react';

interface Snippet {
  name: string;
  language: string;
  code: string;
}

interface SnippetForm {
  name: string;
  language: string;
  code: string;
  editIdx: number | null;
}

interface SnippetsModalProps {
  showSnippets: boolean;
  setShowSnippets: (val: boolean) => void;
  codeSnippets: Snippet[];
  userSnippets: Snippet[];
  setUserSnippets: React.Dispatch<React.SetStateAction<Snippet[]>>;
  snippetForm: SnippetForm;
  setSnippetForm: React.Dispatch<React.SetStateAction<SnippetForm>>;
  handleInsertSnippet: (snippet: string) => void;
  handleAddSnippet: () => void;
  handleEditSnippet: (idx: number) => void;
  handleUpdateSnippet: () => void;
  handleDeleteSnippet: (idx: number) => void;
  activeFile: { language: string };
  languageOptions: { label: string; value: string }[];
}

export const SnippetsModal: React.FC<SnippetsModalProps> = ({
  showSnippets,
  setShowSnippets,
  codeSnippets,
  userSnippets,
  setUserSnippets,
  snippetForm,
  setSnippetForm,
  handleInsertSnippet,
  handleAddSnippet,
  handleEditSnippet,
  handleUpdateSnippet,
  handleDeleteSnippet,
  activeFile,
  languageOptions,
}) => {
  if (!showSnippets) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#161b22]/95 backdrop-blur-lg rounded-lg shadow-2xl p-6 min-w-[320px] max-w-[95vw] flex flex-col gap-5 border border-[#30363d] relative animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#c9d1d9] mb-1 tracking-tight">Code Snippets</h2>
          <button onClick={() => setShowSnippets(false)} className="text-[#7d8590] hover:text-[#c9d1d9] text-xl font-bold p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#58a6ff] bg-[#21262d]/50 shadow-sm" title="Close">×</button>
        </div>
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
          {/* Built-in snippets */}
          {codeSnippets.filter(s => s.language === activeFile.language).length === 0 && userSnippets.filter(s => s.language === activeFile.language).length === 0 && (
            <div className="text-[#7d8590] font-mono text-sm">No snippets available for this language.</div>
          )}
          {codeSnippets.filter(s => s.language === activeFile.language).map(snippet => (
            <button key={snippet.name} onClick={() => handleInsertSnippet(snippet.code)} className="text-left px-4 py-3 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] font-mono text-sm text-[#c9d1d9] shadow-sm transition-all duration-150">
              <span className="font-medium text-[#58a6ff]">{snippet.name}</span>
              <pre className="mt-2 text-xs text-[#7d8590] whitespace-pre-wrap">{snippet.code}</pre>
            </button>
          ))}
          {/* User-defined snippets */}
          {userSnippets.filter(s => s.language === activeFile.language).map((snippet, idx) => (
            <div key={snippet.name + idx} className="flex flex-col gap-2 bg-[#21262d] border border-[#30363d] rounded-md p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <button onClick={() => handleInsertSnippet(snippet.code)} className="font-medium text-[#58a6ff] hover:underline text-left flex-1">{snippet.name}</button>
                <button onClick={() => handleEditSnippet(idx)} className="text-xs text-[#58a6ff] hover:underline">Edit</button>
                <button onClick={() => handleDeleteSnippet(idx)} className="text-xs text-[#f85149] hover:underline">Delete</button>
              </div>
              <pre className="mt-1 text-xs text-[#7d8590] whitespace-pre-wrap">{snippet.code}</pre>
            </div>
          ))}
        </div>
        {/* Add/Edit snippet form */}
        <div className="mt-4 bg-[#0d1117] border border-[#30363d] rounded-md p-4 flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={snippetForm.name}
              onChange={e => setSnippetForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Snippet name"
              className="flex-1 px-3 py-2 rounded-md border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-[#58a6ff] bg-[#161b22] text-[#c9d1d9] text-sm font-mono"
            />
            <select
              value={snippetForm.language}
              onChange={e => setSnippetForm(f => ({ ...f, language: e.target.value }))}
              className="px-3 py-2 rounded-md border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-[#58a6ff] bg-[#161b22] text-[#c9d1d9] text-sm font-mono"
            >
              {languageOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <textarea
            value={snippetForm.code}
            onChange={e => setSnippetForm(f => ({ ...f, code: e.target.value }))}
            placeholder="Snippet code..."
            className="w-full px-3 py-2 rounded-md border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-[#58a6ff] bg-[#161b22] text-[#c9d1d9] text-sm font-mono min-h-[80px]"
          />
          <div className="flex gap-2 justify-end">
            {snippetForm.editIdx === null ? (
              <button onClick={handleAddSnippet} className="px-4 py-2 rounded-md bg-[#238636] text-white font-medium text-sm hover:bg-[#2ea043]">Add</button>
            ) : (
              <>
                <button onClick={handleUpdateSnippet} className="px-4 py-2 rounded-md bg-[#1f6feb] text-white font-medium text-sm hover:bg-[#388bfd]">Update</button>
                <button onClick={() => setSnippetForm({ name: '', language: activeFile.language, code: '', editIdx: null })} className="px-4 py-2 rounded-md bg-[#21262d] text-[#c9d1d9] font-medium text-sm hover:bg-[#30363d]">Cancel</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 