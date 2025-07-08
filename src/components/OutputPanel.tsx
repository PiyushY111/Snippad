import React, { useState } from 'react';
import { useCodeContext } from '../context/CodeContext';
import '../styles/OutputPanel.css';

const OutputPanel: React.FC = () => {
  const { code, iframeKey } = useCodeContext();
  const { html, css, javascript } = code;
  const [status, setStatus] = useState<'live' | 'refreshed'>('live');
  const [refreshKey, setRefreshKey] = useState(0);

  const sanitizeJavascript = (js: string) => {
    let sanitized = js;
    if (js.includes('alert')) {
      sanitized = sanitized.replace(/alert\(/g, "console.log('[Alerted Output] '+");
    }
    if (js.includes('console.log')) {
      sanitized = sanitized.replace(/console.log\(/g, "console.log('[Console Output] '+");
    }
    return sanitized;
  };

  const getOutputContent = () => {
    const jsCode = sanitizeJavascript(javascript);
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SNIPPAD Output</title>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${jsCode}</script>
        </body>
      </html>
    `;
  };

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    setStatus('refreshed');
    setTimeout(() => setStatus('live'), 1000);
  };

  const handlePopout = () => {
    const win = window.open();
    if (win) {
      win.document.write(getOutputContent());
      win.document.close();
    }
  };

  return (
    <div className="output-panel enhanced-output-panel">
      {/* Toolbar/Header */}
      <div className="output-toolbar">
        <span className="output-title" aria-label="Output Panel">Output</span>
        <div className="output-toolbar-actions">
          <button
            className="output-btn"
            onClick={handleRefresh}
            title="Refresh Output"
            aria-label="Refresh Output"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0114.13-3.36L23 10M1 14l5.36 5.36A9 9 0 0020.49 15"></path></svg>
          </button>
          <button
            className="output-btn"
            onClick={handlePopout}
            title="Open Output in New Tab"
            aria-label="Open Output in New Tab"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </button>
        </div>
      </div>
      {/* Output Area */}
      <div className="output-iframe-wrapper">
        <iframe
          key={iframeKey + '-' + refreshKey}
          className="output-iframe"
          title="Code Output"
          srcDoc={getOutputContent()}
          sandbox="allow-scripts allow-modals"
        />
      </div>
      {/* Status Bar */}
      <div className="output-status-bar">
        <span className={status === 'live' ? 'status-live' : 'status-refreshed'}>
          {status === 'live' ? '● Live' : '● Refreshed'}
        </span>
      </div>
    </div>
  );
};

export default OutputPanel;