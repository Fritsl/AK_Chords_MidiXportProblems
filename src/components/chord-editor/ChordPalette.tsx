import React from 'react';
import { CHORD_COLORS } from './constants';

interface ChordPaletteProps {
  visibleChords: string[];
  activeChord: string | null;
  onChordSelect: (chord: string) => void;
}

// Function to determine if a color is light
function isLightColor(hexColor: string): boolean {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate relative luminance
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return brightness > 0.7;
}

const ChordPalette: React.FC<ChordPaletteProps> = ({
  visibleChords,
  activeChord,
  onChordSelect
}) => {
  return (
    <div className="w-16">
      {visibleChords.map((chord, index) => {
        const bgColor = CHORD_COLORS[chord] || '#808080';
        const isLight = isLightColor(bgColor);
        
        return (
          <div 
            key={`palette-chord-${chord}-${index}`}
            className={`
              h-10 flex items-center justify-center cursor-pointer select-none px-1
              ${activeChord === chord ? (isLight ? 'text-black' : 'text-white') : (isLight ? 'text-black' : 'text-white')}
            `}
            style={{ 
              backgroundColor: bgColor,
              textShadow: isLight ? 'none' : '0 1px 2px rgba(0,0,0,0.3)'
            }}
            onMouseDown={() => onChordSelect(chord)}
          >
            <span className="text-sm font-medium truncate">
              {chord}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ChordPalette;