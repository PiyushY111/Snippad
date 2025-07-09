import React from 'react';
import { CodeEditor } from './CodeEditor';
import { useCodeContext } from '../context/CodeContext';
import '../styles/EditorPanel.css';

const EditorPanel: React.FC = () => {
  const { code, updateCode } = useCodeContext();

  return (
    <div className="rounded-2xl shadow-2xl bg-[#181a20] border border-[#BCDD19] p-0 mb-6 flex flex-col h-full relative overflow-hidden">
      <div className="editor-panel">
        <div className="editor-container">
          <div className="editor-label">HTML</div>
          <CodeEditor 
            language="html"
            value={code.html}
            onChange={(value: string) => updateCode('html', value)}
          />
        </div>
        
        <div className="editor-container">
          <div className="editor-label">CSS</div>
          <CodeEditor 
            language="css"
            value={code.css}
            onChange={(value: string) => updateCode('css', value)}
          />
        </div>
        
        <div className="editor-container">
          <div className="editor-label">JavaScript</div>
          <CodeEditor 
            language="javascript"
            value={code.javascript}
            onChange={(value: string) => updateCode('javascript', value)}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;