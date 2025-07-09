import React from 'react';

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
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#161b22]/95 backdrop-blur-lg rounded-lg shadow-2xl p-6 min-w-[320px] max-w-[95vw] max-h-[90vh] flex flex-col gap-5 border border-[#30363d] relative animate-fade-in overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#c9d1d9] mb-1 tracking-tight">Language Support & Features</h2>
          <button
            onClick={() => setShowLanguageSupport(false)}
            className="text-[#7d8590] hover:text-[#c9d1d9] text-xl font-bold p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#58a6ff] bg-[#21262d]/50 shadow-sm"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languageOptions.map((lang) => {
              const runtime = runtimes.find(r =>
                r.language === lang.value ||
                (r.aliases && r.aliases.includes(lang.value))
              );
              const isExecutable = [
                'python', 'cpp', 'c', 'java', 'csharp', 'go', 'ruby', 'php', 'rust', 'swift', 'kotlin', 'bash', 'typescript'
              ].includes(lang.value);
              return (
                <div key={lang.value} className="bg-[#21262d] border border-[#30363d] rounded-md p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#58a6ff]">{lang.icon}</span>
                    <h3 className="font-medium text-[#c9d1d9]">{lang.label}</h3>
                  </div>
                  <div className="space-y-2 text-sm text-[#7d8590]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#238636]"></span>
                      <span>Syntax Highlighting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#238636]"></span>
                      <span>Auto-completion</span>
                    </div>
                    {isExecutable && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#1f6feb]"></span>
                        <span>Code Execution</span>
                      </div>
                    )}
                    {runtime && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#a371f7]"></span>
                        <span>Runtime: {runtime.version}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#f0883e]"></span>
                      <span>File Extension: .{lang.ext}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLanguageSelect(lang);
                      setShowLanguageSupport(false);
                    }}
                    className="mt-3 w-full py-2 px-3 bg-[#238636] hover:bg-[#2ea043] text-white font-medium text-sm rounded-md transition-all duration-200"
                  >
                    Create {lang.label} File
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-6 p-4 bg-[#0d1117] border border-[#30363d] rounded-md">
            <h4 className="font-medium text-[#58a6ff] mb-3">Features Legend</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#238636]"></span>
                <span className="text-[#7d8590]">Basic Support (Syntax Highlighting, Auto-completion)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#1f6feb]"></span>
                <span className="text-[#7d8590]">Code Execution (Run & Test)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#a371f7]"></span>
                <span className="text-[#7d8590]">Runtime Information</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#f0883e]"></span>
                <span className="text-[#7d8590]">File Extension Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 