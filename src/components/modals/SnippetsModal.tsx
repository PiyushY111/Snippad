import React from 'react';
import { X, Plus, Edit2, Trash2, Code2 } from 'lucide-react';

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
  
  const filteredSnippets = [
    ...codeSnippets.filter(s => s.language === activeFile.language),
    ...userSnippets.filter(s => s.language === activeFile.language)
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Code2 size={24} className="text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Code Snippets</h2>
              <p className="text-sm text-gray-500">Manage and insert code snippets for {activeFile.language}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSnippets(false)} 
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Snippets List */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <h3 className="font-medium text-gray-900 mb-4">Available Snippets</h3>
            
            {filteredSnippets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Code2 size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No snippets available for {activeFile.language}</p>
                <p className="text-sm">Create your first snippet below</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Built-in snippets */}
                {codeSnippets.filter(s => s.language === activeFile.language).map(snippet => (
                  <div key={snippet.name} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleInsertSnippet(snippet.code)}>
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{snippet.name}</h4>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded">Built-in</span>
                      </div>
                      <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono overflow-x-auto">{snippet.code}</pre>
                    </div>
                  </div>
                ))}
                
                {/* User-defined snippets */}
                {userSnippets.filter(s => s.language === activeFile.language).map((snippet, idx) => (
                  <div key={snippet.name + idx} className="card hover:shadow-md transition-shadow">
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{snippet.name}</h4>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleInsertSnippet(snippet.code)}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="Insert snippet"
                          >
                            <Plus size={14} />
                          </button>
                          <button 
                            onClick={() => handleEditSnippet(idx)}
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            title="Edit snippet"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteSnippet(idx)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete snippet"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono overflow-x-auto">{snippet.code}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Add/Edit Form */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="font-medium text-gray-900 mb-4">
              {snippetForm.editIdx === null ? 'Create New Snippet' : 'Edit Snippet'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Snippet Name
                </label>
                <input
                  type="text"
                  value={snippetForm.name}
                  onChange={e => setSnippetForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. For Loop, Function Template"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={snippetForm.language}
                  onChange={e => setSnippetForm(f => ({ ...f, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
                >
                  {languageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code
                </label>
                <textarea
                  value={snippetForm.code}
                  onChange={e => setSnippetForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="Enter your code snippet here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono min-h-[120px] resize-y"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                {snippetForm.editIdx !== null && (
                  <button 
                    onClick={() => setSnippetForm({ name: '', language: activeFile.language, code: '', editIdx: null })}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={snippetForm.editIdx === null ? handleAddSnippet : handleUpdateSnippet}
                  disabled={!snippetForm.name.trim() || !snippetForm.code.trim()}
                  className="btn btn-primary"
                >
                  {snippetForm.editIdx === null ? 'Create Snippet' : 'Update Snippet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 