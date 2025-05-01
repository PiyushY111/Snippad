import React from 'react';
import { Code2 } from 'lucide-react';
import '../styles/Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="logo">
        <Code2 size={32} />
        <h1>SNIPPAD</h1>
      </div>
      <div className="tagline">
        <p>Your modern code playground</p>
      </div>
    </header>
  );
};

export default Header;