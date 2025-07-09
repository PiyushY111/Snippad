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
      <div className="bg-[#161b22]/95 backdrop-blur-lg rounded-lg shadow-2xl p-4 min-w-[320px] max-w-[90vw] max-h-[80vh] flex flex-col gap-3 border border-[#30363d]">
        <input autoFocus value={paletteQuery} onChange={e => setPaletteQuery(e.target.value)} placeholder="Type a command..." className="p-3 rounded-md border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-[#58a6ff] bg-[#0d1117] text-[#c9d1d9] font-mono text-sm" />
        <div className="flex flex-col gap-1 overflow-auto max-h-60">
          {filteredPalette.length === 0 && <div className="text-[#7d8590] text-xs p-2">No commands found.</div>}
          {filteredPalette.map((a, i) => (
            <button key={a.label} onClick={() => { a.action(); setShowPalette(false); setPaletteQuery(''); }} className="text-left px-3 py-2 rounded-md hover:bg-[#21262d] text-sm font-mono transition-all duration-150 text-[#c9d1d9]" style={{ color: 'var(--accent-color)' }}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}; 