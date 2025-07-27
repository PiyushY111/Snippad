import React from 'react';
import { Search, Command } from 'lucide-react';

interface CommandPaletteModalProps {
  showPalette: boolean;
  setShowPalette: (val: boolean) => void;
  paletteQuery: string;
  setPaletteQuery: (val: string) => void;
  filteredPalette: { label: string; action: () => void }[];
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  showPalette,
  setShowPalette,
  paletteQuery,
  setPaletteQuery,
  filteredPalette,
}) => {
  if (!showPalette) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
          <Command size={20} className="text-blue-600" />
          <div className="flex-1">
            <input 
              autoFocus 
              value={paletteQuery} 
              onChange={e => setPaletteQuery(e.target.value)} 
              placeholder="Type a command or search..." 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
        
        {/* Commands List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredPalette.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No commands found</p>
              <p className="text-sm">Try typing something else</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredPalette.map((command, i) => (
                <button 
                  key={command.label} 
                  onClick={() => { 
                    command.action(); 
                    setShowPalette(false); 
                    setPaletteQuery(''); 
                  }} 
                  className="w-full text-left px-4 py-3 rounded-md hover:bg-gray-50 text-sm transition-colors border border-transparent hover:border-gray-200"
                >
                  <div className="font-medium text-gray-900">{command.label}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Use ↑↓ to navigate, Enter to select</span>
            <span>Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 