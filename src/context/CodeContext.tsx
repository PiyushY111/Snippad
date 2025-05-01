import React, { createContext, useContext, useState, useEffect } from 'react';

interface CodeState {
  html: string;
  css: string;
  javascript: string;
}

interface CodeContextType {
  code: CodeState;
  setCode: (code: CodeState) => void;
  updateCode: (type: 'html' | 'css' | 'javascript', value: string) => void;
  runCode: () => void;
  clearCode: () => void;
  iframeKey: number;
}

const defaultCode = {
  html: `<h1>Hello!</h1>
<p>Write HTML, CSS or JavaScript code here and click 'Run Code'.</p>`,
  css: '/* CSS goes here */',
  javascript: '// JS code here'
};

const CodeContext = createContext<CodeContextType | null>(null);

export const useCodeContext = () => {
  const context = useContext(CodeContext);
  if (!context) {
    throw new Error('useCodeContext must be used within a CodeProvider');
  }
  return context;
};

export const CodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [code, setCode] = useState<CodeState>(defaultCode);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedCode = localStorage.getItem('savedCode');
    if (savedCode) {
      setCode(JSON.parse(savedCode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedCode', JSON.stringify(code));
  }, [code]);

  const updateCode = (type: 'html' | 'css' | 'javascript', value: string) => {
    setCode(prev => ({ ...prev, [type]: value }));
    
    if (timer) {
      clearTimeout(timer);
    }
    
    const newTimer = setTimeout(() => {
      runCode();
    }, 450);
    
    setTimer(newTimer);
  };

  const runCode = () => {
    setIframeKey(prev => prev + 1);
  };

  const clearCode = () => {
    setCode(defaultCode);
    runCode();
  };

  return (
    <CodeContext.Provider value={{ code, setCode, updateCode, runCode, clearCode, iframeKey }}>
      {children}
    </CodeContext.Provider>
  );
};