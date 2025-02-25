import React, { useState } from 'react';
import { X, LogOut, Piano, Music2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { synth } from '../utils/synth';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  showColors: boolean;
  onShowColorsChange: (show: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, showColors, onShowColorsChange }) => {
  const [playbackMode, setPlaybackMode] = useState(synth.playbackMode);
  
  if (!isOpen) return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  const handlePlaybackModeChange = () => {
    const modes = ['chord', 'both', 'arpeggio'] as const;
    const currentIndex = modes.indexOf(playbackMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];
    synth.playbackMode = newMode;
    setPlaybackMode(newMode);
  };

  const getPlaybackModeLabel = () => {
    switch (playbackMode) {
      case 'chord':
        return 'Chord Only';
      case 'both':
        return 'Chord + Arpeggio';
      case 'arpeggio':
        return 'Arpeggio Only';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="surface-secondary max-w-2xl mx-auto">
          <div className="p-4 border-b border-[#1F1F1F] flex items-center justify-between">
            <h2 className="text-2xl font-bold">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1F1F1F] rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 surface-tertiary">
                <span className="text-secondary">Color coded buildings</span>
                <div 
                  className={`w-12 h-6 rounded p-1 transition-colors cursor-pointer ${showColors ? 'bg-[#03A9F4]' : 'bg-[#2A2A2A]'}`}
                  onClick={() => onShowColorsChange(!showColors)}
                >
                  <div 
                    className={`w-4 h-4 rounded bg-white transition-transform ${showColors ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </div>
              </label>

              <label className="flex items-center justify-between p-2 surface-tertiary">
                <div className="flex items-center gap-2 text-secondary">
                  <span>Preview audio:</span>
                  <div className="flex items-center gap-1">
                    <Piano className="w-4 h-4" />
                    <span>/</span>
                    <Music2 className="w-4 h-4" />
                  </div>
                </div>
                <div 
                  className={`w-12 h-6 rounded p-1 transition-colors cursor-pointer ${
                    synth.currentInstrument === 'strings' ? 'bg-[#03A9F4]' : 'bg-[#2A2A2A]'
                  }`}
                  onClick={() => synth.toggleInstrument()}
                >
                  <div 
                    className={`w-4 h-4 rounded bg-white transition-transform ${
                      synth.currentInstrument === 'strings' ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
              </label>

              <label className="flex items-center justify-between p-2 surface-tertiary">
                <span className="text-secondary">Playback mode:</span>
                <button
                  onClick={handlePlaybackModeChange}
                  className="px-3 py-1 bg-[#2A2A2A] hover:bg-[#1F1F1F] transition-colors text-sm"
                >
                  {getPlaybackModeLabel()}
                </button>
              </label>
            </div>

            <div className="pt-4 border-t border-[#1F1F1F]">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 p-2 text-[#FF5252] hover:bg-[#1F1F1F] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;