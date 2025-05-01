import React from 'react';
import { useCodeContext } from '../context/CodeContext';
import '../styles/OutputPanel.css';

const OutputPanel: React.FC = () => {
  const { code, iframeKey } = useCodeContext();
  const { html, css, javascript } = code;

  const sanitizeJavascript = (js: string) => {
    let sanitized = js;
    if (js.includes('alert')) {
      sanitized = sanitized.replace(/alert\(/g, 'console.log(\'[Alerted Output] \'+');
    }
    if (js.includes('console.log')) {
      sanitized = sanitized.replace(/console.log\(/g, 'console.log(\'[Console Output] \'+');
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

  return (
    <div className="output-panel">
      <div className="output-label">Output</div>
      <iframe
        key={iframeKey}
        className="output-iframe"
        title="Code Output"
        srcDoc={getOutputContent()}
        sandbox="allow-scripts allow-modals"
      />
    </div>
  );
};

export default OutputPanel;