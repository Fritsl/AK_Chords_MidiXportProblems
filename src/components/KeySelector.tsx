import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface KeySelectorProps {
  value: string;
  onChange: (key: string) => void;
}

const MAJOR_KEYS = [
  ['C', 'G', 'D', 'A'],
  ['E', 'B', 'F♯', 'C♯'],
  ['F', 'B♭', 'E♭', 'A♭'],
  ['D♭', 'G♭', 'C♭']
];

const MINOR_KEYS = [
  ['Am', 'Em', 'Bm', 'F♯m'],
  ['C♯m', 'G♯m', 'D♯m', 'A♯m'],
  ['Dm', 'Gm', 'Cm', 'Fm'],
  ['B♭m', 'E♭m', 'A♭m']
];

const KeySelector: React.FC<KeySelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'major' | 'minor'>(value.includes('m') ? 'minor' : 'major');

  const handleKeyClick = (key: string) => {
    onChange(key);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 surface-tertiary text-[#E0E0E0] px-3 py-1.5 min-w-[100px] justify-between hover:bg-[#1F1F1F] transition-colors"
      >
        <span className="font-medium">{value}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 surface-tertiary z-50 min-w-[280px]">
            <div className="flex border-b border-[#1F1F1F]">
              <button
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  mode === 'major' 
                    ? 'text-[#FFC107] bg-[#1F1F1F]' 
                    : 'text-secondary hover:text-[#E0E0E0] hover:bg-[#1F1F1F]'
                }`}
                onClick={() => setMode('major')}
              >
                Major
              </button>
              <button
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  mode === 'minor' 
                    ? 'text-[#FFC107] bg-[#1F1F1F]' 
                    : 'text-secondary hover:text-[#E0E0E0] hover:bg-[#1F1F1F]'
                }`}
                onClick={() => setMode('minor')}
              >
                Minor
              </button>
            </div>
            
            <div className="p-2">
              <div className="grid grid-cols-4 gap-1">
                {(mode === 'major' ? MAJOR_KEYS : MINOR_KEYS).map((row, i) => (
                  <React.Fragment key={i}>
                    {row.map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeyClick(key)}
                        className={`
                          px-3 py-2 text-sm transition-colors
                          ${value === key 
                            ? 'bg-[#03A9F4] text-white' 
                            : 'text-secondary hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
                          }
                        `}
                      >
                        {key}
                      </button>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default KeySelector;