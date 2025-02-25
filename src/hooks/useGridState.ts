import { useState, useCallback } from 'react';
import { BAR_PATTERNS, generateBarLengths } from '../data/barPatterns';
import { getProgressions } from '../data/genres';
import { generateChords } from '../utils/chordUtils';

export interface GridState {
  barLengths: number[];
  chords: string[];
  isEdited: boolean;
  totalBeats: number;
}

export interface GridStateOptions {
  initialBars?: number;
  pattern?: string;
  templateCategory?: string;
  templateSubgenre?: string;
  blockType?: string;
  mode?: 'repeat' | 'stretch';
}

export function useGridState(options: GridStateOptions = {}) {
  const {
    initialBars = 8,
    pattern = 'standard',
    templateCategory,
    templateSubgenre,
    blockType = 'A',
    mode = 'repeat'
  } = options;

  const [state, setState] = useState<GridState>(() => {
    // Initialize bar lengths from pattern
    const barPattern = BAR_PATTERNS[pattern];
    const lengths = generateBarLengths(barPattern, initialBars);
    const totalBeats = lengths.reduce((sum, len) => sum + len, 0);

    // Initialize chords from template if available
    let chords: string[] = Array(lengths.length).fill('I');
    if (templateCategory && templateSubgenre) {
      const progressions = getProgressions(templateCategory, templateSubgenre, blockType);
      if (progressions.length > 0) {
        const progression = progressions[0].progression;
        if (progression.length > 0) {
          chords = generateChords(progression, lengths.length, mode);
        }
      }
    }

    return {
      barLengths: lengths,
      chords,
      isEdited: false,
      totalBeats
    };
  });

  const splitBar = useCallback((index: number) => {
    if (index >= state.barLengths.length) return;
    
    const newLengths = [...state.barLengths];
    const currentLength = newLengths[index];
    
    if (currentLength <= 2) return; // Minimum 2 beats needed to split
    
    const halfLength = Math.floor(currentLength / 2);
    newLengths[index] = halfLength;
    newLengths.splice(index + 1, 0, currentLength - halfLength);
    
    const newChords = [...state.chords];
    newChords.splice(index + 1, 0, newChords[index]);
    
    setState(prev => ({
      ...prev,
      barLengths: newLengths,
      chords: newChords,
      isEdited: true,
      totalBeats: newLengths.reduce((sum, len) => sum + len, 0)
    }));
  }, [state]);

  const combineBar = useCallback((index: number) => {
    if (index >= state.barLengths.length - 1) return;
    
    const newLengths = [...state.barLengths];
    newLengths[index] += newLengths[index + 1];
    newLengths.splice(index + 1, 1);
    
    const newChords = [...state.chords];
    newChords.splice(index + 1, 1);
    
    setState(prev => ({
      ...prev,
      barLengths: newLengths,
      chords: newChords,
      isEdited: true,
      totalBeats: newLengths.reduce((sum, len) => sum + len, 0)
    }));
  }, [state]);

  const setChord = useCallback((index: number, chord: string) => {
    setState(prev => ({
      ...prev,
      chords: prev.chords.map((c, i) => i === index ? chord : c),
      isEdited: true
    }));
  }, []);

  const applyPattern = useCallback((newPattern: string) => {
    const pattern = BAR_PATTERNS[newPattern];
    const newLengths = generateBarLengths(pattern, state.barLengths.length);
    
    setState(prev => ({
      ...prev,
      barLengths: newLengths,
      totalBeats: newLengths.reduce((sum, len) => sum + len, 0),
      isEdited: true
    }));
  }, [state.barLengths.length]);

  const applyTemplate = useCallback((category: string, subgenre: string, type: string, mode: 'repeat' | 'stretch' = 'repeat') => {
    const progressions = getProgressions(category, subgenre, type);
    if (progressions.length > 0) {
      const progression = progressions[0].progression;
      if (progression.length > 0) {
        const newChords = generateChords(progression, state.barLengths.length, mode);
        setState(prev => ({
          ...prev,
          chords: newChords,
          isEdited: false
        }));
      }
    }
  }, [state.barLengths.length]);

  return {
    state,
    splitBar,
    combineBar,
    setChord,
    applyPattern,
    applyTemplate
  };
}