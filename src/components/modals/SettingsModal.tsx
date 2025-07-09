import React from 'react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#181a20] rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#BCDD19]">
        <h2 className="text-xl font-bold mb-6 text-[#BCDD19]">Editor Settings</h2>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-[#BCDD19]">
            Font Size: <span className="font-mono">{settings.fontSize}px</span>
            <input
              type="range"
              min={12}
              max={24}
              value={settings.fontSize}
              onChange={e => setSettings(s => ({ ...s, fontSize: Number(e.target.value) }))}
              className="w-full accent-[#BCDD19] bg-[#181a20] slider-dark"
            />
          </label>
          <label className="flex flex-col gap-1 text-[#BCDD19]">
            Tab Size:
            <select
              value={settings.tabSize}
              onChange={e => setSettings(s => ({ ...s, tabSize: Number(e.target.value) }))}
              className="rounded bg-[#0a0d14] border border-[#BCDD19] px-2 py-1 mt-1 text-[#BCDD19]"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-[#BCDD19]">
            <input
              type="checkbox"
              checked={settings.lineNumbers}
              onChange={e => setSettings(s => ({ ...s, lineNumbers: e.target.checked }))}
              className="accent-[#BCDD19]"
            />
            Show Line Numbers
          </label>
          <label className="flex items-center gap-2 text-[#BCDD19]">
            <input
              type="checkbox"
              checked={settings.minimap}
              onChange={e => setSettings(s => ({ ...s, minimap: e.target.checked }))}
              className="accent-[#BCDD19]"
            />
            Show Minimap
          </label>
        </div>
        <div className="flex justify-end mt-8">
          <button
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#BCDD19] to-[#e6e6e6] text-[#181a20] font-bold shadow-lg hover:from-[#e6e6e6] hover:to-[#BCDD19] transition-all border border-[#BCDD19]"
            onClick={() => setShow(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 