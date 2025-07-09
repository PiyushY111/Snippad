import React from 'react';

interface TerminalPanelProps {
  showTerminal: boolean;
  setShowTerminal: React.Dispatch<React.SetStateAction<boolean>>;
  terminalRef: React.RefObject<HTMLDivElement>;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  showTerminal,
  setShowTerminal,
  terminalRef,
}) => {
  return (
    <>
      {/* Toggle Terminal Button */}
      <button
        className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-lg bg-[#21262d] text-[#c9d1d9] shadow-lg hover:bg-[#30363d] transition-all border border-[#30363d] font-medium"
        onClick={() => setShowTerminal(t => !t)}
        title="Toggle Node.js Terminal"
      >
        {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
      </button>
      {/* Node.js Terminal Panel */}
      {showTerminal && (
        <div className="fixed bottom-0 left-0 w-full bg-[#0d1117] border-t border-[#30363d] z-40 transition-all duration-300" style={{ height: '35vh', minHeight: 200, maxHeight: 350 }}>
          <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </>
  );
}; 