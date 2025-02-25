import React, { useState, useEffect, useCallback, useRef } from 'react';
import { metronome } from '../../utils/metronomeService';
import * as Tone from 'tone';

interface RhythmPatternEditorProps {
  totalBeats: number;
  timeSignature: string;
  blockName: string;
  onPatternChange?: (pattern: ('on' | 'off')[], dividers: boolean[]) => void;
}

type NoteState = 'off' | 'on';

const RhythmPatternEditor: React.FC<RhythmPatternEditorProps> = ({
  totalBeats,
  timeSignature,
  blockName,
  onPatternChange
}) => {
  const [pattern, setPattern] = useState<NoteState[]>(Array(totalBeats).fill('off'));
  const [dividers, setDividers] = useState<boolean[]>(Array(totalBeats - 1).fill(false));
  const [currentPosition, setCurrentPosition] = useState<number | null>(null);
  
  // Create a monophonic synth for the piano sound
  const synthRef = useRef<Tone.Synth | null>(null);
  const isPlayingRef = useRef(false);
  const lastNoteTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate beats per bar from time signature
  const [beatsPerBar] = timeSignature.split('/').map(Number);

  // Initialize synth
  useEffect(() => {
    synthRef.current = new Tone.Synth({
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.8,
        release: 0.5
      }
    }).toDestination();
    synthRef.current.volume.value = -12;

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, []);

  // Update pattern length when totalBeats changes
  useEffect(() => {
    setPattern(prev => {
      if (prev.length === totalBeats) return prev;
      const newPattern = Array(totalBeats).fill('off');
      prev.forEach((state, i) => {
        if (i < totalBeats) newPattern[i] = state;
      });
      return newPattern;
    });
    
    setDividers(prev => {
      const newDividers = Array(totalBeats - 1).fill(false);
      prev.forEach((state, i) => {
        if (i < totalBeats - 1) newDividers[i] = state;
      });
      return newDividers;
    });
  }, [totalBeats]);

  // Notify parent of pattern changes
  useEffect(() => {
    onPatternChange?.(pattern, dividers);
  }, [pattern, dividers, onPatternChange]);

  // Handle stopping all sounds
  const stopAllSounds = useCallback(() => {
    if (synthRef.current && isPlayingRef.current) {
      const now = Tone.now();
      synthRef.current.triggerRelease(now);
      isPlayingRef.current = false;
      lastNoteTimeRef.current = 0;
    }
    setCurrentPosition(null);
  }, []);

  // Find the next position in the pattern
  const findNextPosition = useCallback((currentPos: number | null): number => {
    if (currentPos === null) return 0;
    return (currentPos + 1) % totalBeats;
  }, [totalBeats]);

  // Handle piano sound based on pattern state
  const handlePatternSound = useCallback((position: number, time: number) => {
    if (!synthRef.current || !metronome.playing) {
      stopAllSounds();
      return;
    }

    const currentState = pattern[position];
    const hasYellowDivider = position > 0 && dividers[position - 1];
    const isStartingOver = position === 0;

    // Ensure time is strictly greater than the last note time
    const minTime = Math.max(time, lastNoteTimeRef.current + 0.05);

    if (currentState === 'on') {
      if (isPlayingRef.current) {
        synthRef.current.triggerRelease(minTime);
      }
      
      // Schedule the new note slightly after the release
      const attackTime = minTime + 0.02;
      synthRef.current.triggerAttack('C3', attackTime);
      isPlayingRef.current = true;
      lastNoteTimeRef.current = attackTime;
    } else if (isPlayingRef.current) {
      synthRef.current.triggerRelease(minTime);
      isPlayingRef.current = false;
    }
  }, [pattern, dividers, stopAllSounds]);

  // Update position when metronome ticks
  useEffect(() => {
    const updatePosition = (beat: number, time: number) => {
      // Use Tone.Draw to ensure UI updates are scheduled correctly
      Tone.Draw.schedule(() => {
        setCurrentPosition(prev => {
          const nextPos = findNextPosition(prev);
          handlePatternSound(nextPos, time);
          return nextPos;
        });
      }, time);
    };

    metronome.setOnProgress(updatePosition);
    metronome.setOnStop(stopAllSounds);

    return () => {
      metronome.setOnProgress(null);
      metronome.setOnStop(null);
      stopAllSounds();
    };
  }, [findNextPosition, handlePatternSound, stopAllSounds]);

  const handleNoteClick = (index: number) => {
    setPattern(prev => {
      const newPattern = [...prev];
      newPattern[index] = newPattern[index] === 'off' ? 'on' : 'off';
      return newPattern;
    });
  };

  const handleDividerClick = (index: number) => {
    setDividers(prev => {
      const newDividers = [...prev];
      newDividers[index] = !newDividers[index];
      return newDividers;
    });
  };

  const getDividerStyle = (index: number) => {
    if (dividers[index]) {
      return 'bg-[#FFC107]';
    }
    
    if (pattern[index] === 'on' && pattern[index + 1] === 'on') {
      return 'bg-[#03A9F4]';
    }
    
    return 'bg-[#1F1F1F]';
  };

  return (
    <div className="mt-6 p-4 bg-[#1F1F1F] rounded">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-[#E0E0E0]">Rhythm Pattern: {blockName}</h3>
        <p className="text-sm text-secondary mt-1">
          {Math.floor(totalBeats / beatsPerBar)} bars × {beatsPerBar} beats = {totalBeats} total beats
        </p>
      </div>

      <div 
        ref={containerRef}
        className="overflow-x-auto hide-scrollbar"
      >
        <div 
          className="flex flex-wrap gap-y-1 min-w-fit"
          style={{
            gridTemplateColumns: `repeat(${totalBeats}, minmax(2rem, 1fr))`
          }}
        >
          {pattern.map((state, index) => (
            <React.Fragment key={index}>
              {/* Note slot */}
              <div className="relative">
                <button
                  className={`w-8 aspect-square ${
                    state === 'on' ? 'bg-[#03A9F4]' : 'bg-[#2A2A2A]'
                  } hover:opacity-80 transition-colors ${
                    index % beatsPerBar === 0 ? 'border-l-2 border-[#1F1F1F]' : ''
                  }`}
                  onClick={() => handleNoteClick(index)}
                  title={`Beat ${index + 1}: ${state}`}
                />
                {/* Beat indicator line */}
                {currentPosition === index && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5252] transform translate-y-1" />
                )}
              </div>
              
              {/* Divider slot - only show between notes */}
              {index < pattern.length - 1 && (
                <button
                  className={`w-2 aspect-square hover:opacity-80 transition-colors ${
                    getDividerStyle(index)
                  }`}
                  onClick={() => handleDividerClick(index)}
                  title={`Divider ${index + 1}`}
                />
              )}

              {/* Add line break at bar boundaries if container is too narrow */}
              {(index + 1) % beatsPerBar === 0 && index !== pattern.length - 1 && (
                <div className="w-full h-1 border-b border-[#1F1F1F] lg:hidden" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#2A2A2A]" />
          <span className="text-sm text-secondary">Off</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#03A9F4]" />
          <span className="text-sm text-secondary">On</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#FFC107]" />
          <span className="text-sm text-secondary">Phrase Break</span>
        </div>
      </div>
    </div>
  );
};

export default RhythmPatternEditor;