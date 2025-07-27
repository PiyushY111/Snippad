import React from 'react';
import { X, Settings as SettingsIcon, Type, Indent, Hash, Eye } from 'lucide-react';

interface EditorSettings {
  fontSize: number;
  tabSize: number;
  lineNumbers: boolean;
  minimap: boolean;
}

interface SettingsModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  settings: EditorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EditorSettings>>;
}

export function SettingsModal({ show, setShow, settings, setSettings }: SettingsModalProps) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <SettingsIcon size={24} className="text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Editor Settings</h2>
              <p className="text-sm text-gray-500">Customize your coding experience</p>
            </div>
          </div>
          <button 
            onClick={() => setShow(false)} 
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Font Size */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Type size={16} className="text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Font Size</label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min={12}
                max={24}
                value={settings.fontSize}
                onChange={e => setSettings(s => ({ ...s, fontSize: Number(e.target.value) }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm font-mono text-gray-600 min-w-[3rem]">{settings.fontSize}px</span>
            </div>
          </div>
          
          {/* Tab Size */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Indent size={16} className="text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Tab Size</label>
            </div>
            <select
              value={settings.tabSize}
              onChange={e => setSettings(s => ({ ...s, tabSize: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
            </select>
          </div>
          
          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Hash size={16} className="text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Show Line Numbers</label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.lineNumbers}
                  onChange={e => setSettings(s => ({ ...s, lineNumbers: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye size={16} className="text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Show Minimap</label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.minimap}
                  onChange={e => setSettings(s => ({ ...s, minimap: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            className="btn btn-primary"
            onClick={() => setShow(false)}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
} 