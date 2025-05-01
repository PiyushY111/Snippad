import React, { useEffect } from 'react';
import EditorPanel from './components/EditorPanel';
import OutputPanel from './components/OutputPanel';
import Header from './components/Header';
import ActionButtons from './components/ActionButtons';
import { CodeProvider } from './context/CodeContext';
import './styles/App.css';

function App() {
  return (
    <CodeProvider>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <EditorPanel />
          <OutputPanel />
        </main>
        <ActionButtons />
      </div>
    </CodeProvider>
  );
}

export default App;