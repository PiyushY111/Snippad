import React from 'react';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="output-panel bg-[#181a20] border-2 border-[#BCDD19] rounded-2xl shadow-2xl p-4 min-w-[320px] max-w-[90vw] max-h-[80vh] flex flex-col gap-3 relative animate-fade-in">
        <input autoFocus value={paletteQuery} onChange={e => setPaletteQuery(e.target.value)} placeholder="Type a command..." className="p-3 rounded-md border-2 border-[#BCDD19] focus:outline-none focus:ring-2 focus:ring-[#BCDD19] bg-[#181a20] text-[#BCDD19] font-mono text-sm" />
        <div className="flex flex-col gap-1 overflow-auto max-h-60">
          {filteredPalette.length === 0 && <div className="text-[#BCDD19] text-xs p-2">No commands found.</div>}
          {filteredPalette.map((a, i) => (
            <button key={a.label} onClick={() => { a.action(); setShowPalette(false); setPaletteQuery(''); }} className="text-left px-3 py-2 rounded-md hover:bg-[#232336] text-sm font-mono transition-all duration-150 text-[#BCDD19] border-2 border-[#BCDD19]" style={{ color: '#BCDD19' }}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}; 