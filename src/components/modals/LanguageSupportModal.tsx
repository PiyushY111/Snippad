import React from 'react';
import { X, CheckCircle, Play, FileCode2, Settings } from 'lucide-react';

interface LanguageOption {
  label: string;
  value: string;
  ext: string;
  icon: React.ReactNode;
}

interface Runtime {
  language: string;
  version: string;
  aliases?: string[];
}

interface LanguageSupportModalProps {
  showLanguageSupport: boolean;
  setShowLanguageSupport: (val: boolean) => void;
  languageOptions: LanguageOption[];
  runtimes: Runtime[];
  handleLanguageSelect: (lang: LanguageOption) => void;
}

export const LanguageSupportModal: React.FC<LanguageSupportModalProps> = ({
  showLanguageSupport,
  setShowLanguageSupport,
  languageOptions,
  runtimes,
  handleLanguageSelect,
}) => {
  if (!showLanguageSupport) return null;
  
  const executableLanguages = [
    'python', 'cpp', 'c', 'java', 'csharp', 'go', 'ruby', 'php', 'rust', 'swift', 'kotlin', 'bash', 'typescript'
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Settings size={24} className="text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Language Support & Features</h2>
              <p className="text-sm text-gray-500">Explore supported programming languages and their capabilities</p>
            </div>
          </div>
          <button
            onClick={() => setShowLanguageSupport(false)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Language Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {languageOptions.map((lang) => {
              const runtime = runtimes.find(r =>
                r.language === lang.value ||
                (r.aliases && r.aliases.includes(lang.value))
              );
              const isExecutable = executableLanguages.includes(lang.value);
              
              return (
                <div key={lang.value} className="card hover:shadow-md transition-all duration-200 border border-gray-200">
                  <div className="card-body p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">{lang.icon}</span>
                        <h3 className="font-medium text-gray-900">{lang.label}</h3>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                        .{lang.ext}
                      </span>
                    </div>
                    
                    {/* Features */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-green-500" />
                        <span>Syntax Highlighting</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-green-500" />
                        <span>Auto-completion</span>
                      </div>
                      {isExecutable && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Play size={14} className="text-blue-500" />
                          <span>Code Execution</span>
                        </div>
                      )}
                      {runtime && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FileCode2 size={14} className="text-purple-500" />
                          <span>Runtime: {runtime.version}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    <button
                      onClick={() => {
                        handleLanguageSelect(lang);
                        setShowLanguageSupport(false);
                      }}
                      className="w-full btn btn-primary text-sm"
                    >
                      Create {lang.label} File
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Features Legend */}
          <div className="card">
            <div className="card-header">
              <h4 className="font-medium text-gray-900">Features Legend</h4>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <CheckCircle size={16} className="text-green-500" />
                  <div>
                    <span className="font-medium text-gray-900">Basic Support</span>
                    <p className="text-gray-500">Syntax highlighting and auto-completion</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Play size={16} className="text-blue-500" />
                  <div>
                    <span className="font-medium text-gray-900">Code Execution</span>
                    <p className="text-gray-500">Run and test your code directly</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileCode2 size={16} className="text-purple-500" />
                  <div>
                    <span className="font-medium text-gray-900">Runtime Information</span>
                    <p className="text-gray-500">Specific version and runtime details</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-4 h-4 bg-gray-100 text-gray-600 rounded text-xs flex items-center justify-center font-mono">.ext</span>
                  <div>
                    <span className="font-medium text-gray-900">File Extension</span>
                    <p className="text-gray-500">Supported file extensions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 