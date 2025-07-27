import React from 'react';
import { Trash2, Monitor, Play, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface OutputPanelProps {
  activeFile: { id: number; name: string; language: string; code: string };
  activeFileId: number;
  output: { [id: number]: string };
  outputType: { [id: number]: 'success' | 'error' | 'info' };
  handleClearOutput: () => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  activeFile,
  activeFileId,
  output,
  outputType,
  handleClearOutput,
}) => {
  const isConsoleLang = [
    'python', 'cpp', 'c', 'java', 'csharp', 'go', 'ruby', 'php', 'rust', 'swift', 'kotlin', 'bash', 'typescript'
  ].includes(activeFile.language);

  const getOutputIcon = () => {
    const type = outputType[activeFileId];
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'info':
        return <Info size={16} className="text-blue-600" />;
      default:
        return <Monitor size={16} className="text-gray-500" />;
    }
  };

  const getOutputStatus = () => {
    const type = outputType[activeFileId];
    switch (type) {
      case 'success':
        return { text: 'Success', class: 'text-green-700 bg-green-50' };
      case 'error':
        return { text: 'Error', class: 'text-red-700 bg-red-50' };
      case 'info':
        return { text: 'Info', class: 'text-blue-700 bg-blue-50' };
      default:
        return { text: 'Ready', class: 'text-gray-700 bg-gray-50' };
    }
  };

  const status = getOutputStatus();

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Monitor size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Output</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-md">
                  {isConsoleLang ? 'Console' : 'Preview'}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-md ${status.class}`}>
                  {status.text}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleClearOutput} 
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Clear Output"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isConsoleLang ? (
          <div className={`p-4 font-mono text-sm ${
            outputType[activeFileId] === 'error' 
              ? 'text-red-700 bg-red-50' 
              : outputType[activeFileId] === 'success' 
                ? 'text-green-700 bg-green-50' 
                : 'text-gray-700 bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2 mb-3">
              {getOutputIcon()}
              <span className="font-medium">
                {outputType[activeFileId] === 'error' ? 'Error Output' : 
                 outputType[activeFileId] === 'success' ? 'Success Output' : 'Console Output'}
              </span>
            </div>
            <div 
              dangerouslySetInnerHTML={{ __html: output[activeFileId] || 'No output yet. Run your code to see results.' }} 
              className="whitespace-pre-wrap leading-relaxed"
            />
          </div>
        ) : (
          <div className="h-full relative">
            <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm">
              <Play size={14} className="text-green-600" />
              <span className="text-xs font-medium text-gray-700">Live Preview</span>
            </div>
            <iframe
              title="Output"
              srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { 
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      margin: 0; 
                      padding: 1rem; 
                      background: white; 
                      color: #1e293b;
                      line-height: 1.6;
                    }
                  </style>
                </head>
                <body>${output[activeFileId] || '<p>No content to preview.</p>'}</body>
                </html>
              `}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </div>
    </div>
  );
};