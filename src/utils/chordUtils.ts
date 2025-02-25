import { getProgressions } from '../data/genres';

export function generateChords(progression: string[], numBars: number, mode: 'repeat' | 'stretch'): string[] {
  if (!progression || progression.length === 0) {
    return Array(numBars).fill('I');
  }

  if (mode === 'repeat') {
    const repeatedChords: string[] = [];
    for (let i = 0; i < numBars; i++) {
      repeatedChords.push(progression[i % progression.length]);
    }
    return repeatedChords;
  } else {
    const stretchedChords: string[] = [];
    const progressionLength = progression.length;
    for (let i = 0; i < numBars; i++) {
      const index = Math.floor((i * progressionLength) / numBars);
      stretchedChords.push(progression[index]);
    }
    return stretchedChords;
  }
}