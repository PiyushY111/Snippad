import React from 'react';
import { useCodeContext } from '../context/CodeContext';
import { Play, Trash2, Download } from 'lucide-react';
import '../styles/ActionButtons.css';

const ActionButtons: React.FC = () => {
  const { runCode, clearCode, code } = useCodeContext();

  const exportCode = () => {
    const { html, css, javascript } = code;
    const outputContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SNIPPAD Output</title>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${javascript}</script>
        </body>
      </html>
    `;
    
    const blob = new Blob([outputContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `SNIPPAD-output-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="action-buttons">
      <button onClick={runCode} className="btn run-btn">
        <Play size={18} />
        <span>Run Code</span>
      </button>
      
      <button onClick={clearCode} className="btn clear-btn">
        <Trash2 size={18} />
        <span>Clear Code</span>
      </button>
      
      <button onClick={exportCode} className="btn export-btn">
        <Download size={18} />
        <span>Export</span>
      </button>
    </div>
  );
};

export default ActionButtons;