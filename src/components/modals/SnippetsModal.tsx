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
      <div className="output-panel bg-[#181a20] border-2 border-[#BCDD19] rounded-2xl shadow-2xl p-6 min-w-[320px] max-w-[95vw] flex flex-col gap-5 relative animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#BCDD19] mb-1 tracking-tight">Code Snippets</h2>
          <button onClick={() => setShowSnippets(false)} className="text-[#BCDD19] hover:text-[#181a20] text-xl font-bold p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BCDD19] bg-[#181a20] border border-[#BCDD19] shadow-sm" title="Close">×</button>
        </div>
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
          {/* Built-in snippets */}
          {codeSnippets.filter(s => s.language === activeFile.language).length === 0 && userSnippets.filter(s => s.language === activeFile.language).length === 0 && (
            <div className="text-[#BCDD19] font-mono text-sm">No snippets available for this language.</div>
          )}
          {codeSnippets.filter(s => s.language === activeFile.language).map(snippet => (
            <button key={snippet.name} onClick={() => handleInsertSnippet(snippet.code)} className="text-left px-4 py-3 rounded-md bg-[#181a20] hover:bg-[#232336] border-2 border-[#BCDD19] font-mono text-sm text-[#BCDD19] shadow-sm transition-all duration-150">
              <span className="font-medium text-[#BCDD19]">{snippet.name}</span>
              <pre className="mt-2 text-xs text-[#e6e6e6] whitespace-pre-wrap">{snippet.code}</pre>
            </button>
          ))}
          {/* User-defined snippets */}
          {userSnippets.filter(s => s.language === activeFile.language).map((snippet, idx) => (
            <div key={snippet.name + idx} className="flex flex-col gap-2 bg-[#181a20] border-2 border-[#BCDD19] rounded-md p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <button onClick={() => handleInsertSnippet(snippet.code)} className="font-medium text-[#BCDD19] hover:underline text-left flex-1">{snippet.name}</button>
                <button onClick={() => handleEditSnippet(idx)} className="text-xs text-[#BCDD19] hover:underline">Edit</button>
                <button onClick={() => handleDeleteSnippet(idx)} className="text-xs text-[#f85149] hover:underline">Delete</button>
              </div>
              <pre className="mt-1 text-xs text-[#e6e6e6] whitespace-pre-wrap">{snippet.code}</pre>
            </div>
          ))}
        </div>
        {/* Add/Edit snippet form */}
        <div className="mt-4 bg-[#181a20] border-2 border-[#BCDD19] rounded-md p-4 flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={snippetForm.name}
              onChange={e => setSnippetForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Snippet name"
              className="flex-1 px-3 py-2 rounded-md border-2 border-[#BCDD19] focus:outline-none focus:ring-2 focus:ring-[#BCDD19] bg-[#181a20] text-[#BCDD19] text-sm font-mono"
            />
            <select
              value={snippetForm.language}
              onChange={e => setSnippetForm(f => ({ ...f, language: e.target.value }))}
              className="px-3 py-2 rounded-md border-2 border-[#BCDD19] focus:outline-none focus:ring-2 focus:ring-[#BCDD19] bg-[#181a20] text-[#BCDD19] text-sm font-mono"
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
            className="w-full px-3 py-2 rounded-md border-2 border-[#BCDD19] focus:outline-none focus:ring-2 focus:ring-[#BCDD19] bg-[#181a20] text-[#e6e6e6] text-sm font-mono min-h-[80px]"
          />
          <div className="flex gap-2 justify-end">
            {snippetForm.editIdx === null ? (
              <button onClick={handleAddSnippet} className="px-4 py-2 rounded-md bg-[#BCDD19] text-[#181a20] font-medium text-sm hover:bg-[#e6e6e6] border-2 border-[#BCDD19]">Add</button>
            ) : (
              <>
                <button onClick={handleUpdateSnippet} className="px-4 py-2 rounded-md bg-[#BCDD19] text-[#181a20] font-medium text-sm hover:bg-[#e6e6e6] border-2 border-[#BCDD19]">Update</button>
                <button onClick={() => setSnippetForm({ name: '', language: activeFile.language, code: '', editIdx: null })} className="px-4 py-2 rounded-md bg-[#181a20] text-[#BCDD19] font-medium text-sm hover:bg-[#232336] border-2 border-[#BCDD19]">Cancel</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 