import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Copy, Trash2 } from 'lucide-react';
import '../styles/Terminal.css';

interface ConsoleMessage {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}

interface TerminalProps {
  isVisible: boolean;
  onToggle: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ isVisible, onToggle }) => {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'console') {
        const { level, message } = event.data;
        const newMessage: ConsoleMessage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: level,
          message: typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const clearTerminal = () => {
    setMessages([]);
  };

  const copyToClipboard = () => {
    const allMessages = messages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.type.toUpperCase()}: ${msg.message}`
    ).join('\n');
    
    navigator.clipboard.writeText(allMessages).then(() => {
      // Show a brief success indicator
      const tempMessage: ConsoleMessage = {
        id: 'copy-success',
        type: 'info',
        message: 'Terminal output copied to clipboard!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, tempMessage]);
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== 'copy-success'));
      }, 2000);
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  const getMessageClass = (type: string) => {
    switch (type) {
      case 'error':
        return 'terminal-message-error';
      case 'warn':
        return 'terminal-message-warn';
      case 'info':
        return 'terminal-message-info';
      default:
        return 'terminal-message-log';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`terminal-container ${isMinimized ? 'terminal-minimized' : ''}`}>
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="terminal-header-left">
          <TerminalIcon size={16} className="terminal-icon" />
          <span className="terminal-title">Terminal</span>
          <span className="terminal-status">
            {messages.length > 0 ? `${messages.length} messages` : 'Ready'}
          </span>
        </div>
        <div className="terminal-header-right">
          <button
            className="terminal-btn"
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            <Copy size={14} />
          </button>
          <button
            className="terminal-btn"
            onClick={clearTerminal}
            title="Clear terminal"
          >
            <Trash2 size={14} />
          </button>
          <button
            className="terminal-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {isMinimized ? (
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              ) : (
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              )}
            </svg>
          </button>
          <button
            className="terminal-btn terminal-close-btn"
            onClick={onToggle}
            title="Close terminal"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      {!isMinimized && (
        <div className="terminal-content">
          {messages.length === 0 ? (
            <div className="terminal-empty">
              <TerminalIcon size={24} className="terminal-empty-icon" />
              <p>Console output will appear here</p>
              <p className="terminal-empty-hint">Run your code to see console.log, console.error, etc.</p>
            </div>
          ) : (
            <div className="terminal-messages">
              {messages.map((message) => (
                <div key={message.id} className={`terminal-message ${getMessageClass(message.type)}`}>
                  <span className="terminal-message-icon">{getMessageIcon(message.type)}</span>
                  <span className="terminal-message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="terminal-message-text">{message.message}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Terminal; 