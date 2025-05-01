import React from 'react';
import CodeEditor from './CodeEditor';
import { useCodeContext } from '../context/CodeContext';
import '../styles/EditorPanel.css';

const EditorPanel: React.FC = () => {
  const { code, updateCode } = useCodeContext();

  return (
    <div className="editor-panel">
      <div className="editor-container">
        <div className="editor-label">HTML</div>
        <CodeEditor 
          language="html"
          value={code.html}
          onChange={value => updateCode('html', value)}
        />
      </div>
      
      <div className="editor-container">
        <div className="editor-label">CSS</div>
        <CodeEditor 
          language="css"
          value={code.css}
          onChange={value => updateCode('css', value)}
        />
      </div>
      
      <div className="editor-container">
        <div className="editor-label">JavaScript</div>
        <CodeEditor 
          language="javascript"
          value={code.javascript}
          onChange={value => updateCode('javascript', value)}
        />
      </div>
    </div>
  );
};

export default EditorPanel;