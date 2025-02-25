import React, { useState, useEffect } from 'react';
import { CHORD_COLORS } from './constants';
import { playback } from '../../utils/playbackService';

interface ChordGridProps {
  numBars: number;
  barLengths: number[];
  visibleChords: string[];
  localChords: string[];
  onPaintMove: (position: number, currentChord: string) => void;
  onChordChange: (position: number, chord: string) => void;
  onPlayChord: (chord: string) => void;
}

function isLightColor(hexColor: string): boolean {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return brightness > 0.7;
}

const ChordGrid: React.FC<ChordGridProps> = ({
  numBars,
  barLengths,
  visibleChords,
  localChords,
  onPaintMove,
  onChordChange,
  onPlayChord
}) => {
  const [playbackPosition, setPlaybackPosition] = useState<number | null>(null);

  useEffect(() => {
    playback.setOnProgress((index) => {
      setPlaybackPosition(index);
    });

    return () => {
      playback.setOnProgress(null);
    };
  }, []);

  return (
    <div 
      className="grid relative"
      style={{ 
        gridTemplateColumns: barLengths.map(length => `${length}fr`).join(' ')
      }}
    >
      {/* Chord grid */}
      {visibleChords.map((chord, chordIndex) => {
        const bgColor = CHORD_COLORS[chord] || '#808080';
        const isLight = isLightColor(bgColor);
        
        return (
          <React.Fragment key={`grid-chord-${chord}-${chordIndex}`}>
            {Array.from({ length: numBars }).map((_, barIndex) => {
              const currentChord = localChords[barIndex];
              const isThisChord = currentChord === chord;
              const isAlternateBackground = Math.floor(barIndex / 4) % 2 === 1;
              const isPlaying = playbackPosition === barIndex;
              
              return (
                <div
                  key={`slot-${barIndex}-${chord}`}
                  onMouseEnter={() => onPaintMove(barIndex, currentChord)}
                  onMouseDown={() => {
                    if (isThisChord) {
                      onPlayChord(chord);
                    } else {
                      onChordChange(barIndex, chord);
                      onPlayChord(chord);
                    }
                  }}
                  className={`
                    h-10 border-l border-[#1F1F1F] first:border-l-0 cursor-pointer
                    ${isAlternateBackground ? 'bg-[#2E2E2E]' : 'bg-[#2A2A2A]'}
                    transition-colors duration-150 relative
                  `}
                >
                  {isThisChord && (
                    <div 
                      className={`h-full mx-1 ${isPlaying ? 'animate-pulse' : ''}`}
                      style={{
                        backgroundColor: bgColor,
                        opacity: isPlaying ? 1 : 0.8
                      }}
                    />
                  )}
                  {isPlaying && !isThisChord && (
                    <div 
                      className="absolute inset-0 bg-[#03A9F4] opacity-20 animate-pulse"
                    />
                  )}
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ChordGrid;