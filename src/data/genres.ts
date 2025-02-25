import chordProgressions from './chordprogressions.json';

export interface ChordProgression {
  name: string;
  progression: string[];
  key: string;
  bpm: number;
}

export interface BlockProgression {
  type: string;
  progression: string[];
}

export interface GenreData {
  name: string;
  subgenres: {
    name: string;
    progressions: {
      [blockType: string]: ChordProgression[];
    };
  }[];
}

export const getGenreCategories = (): { [key: string]: string[] } => {
  if (!chordProgressions || typeof chordProgressions !== 'object') {
    return {};
  }

  const categories: { [key: string]: string[] } = {};
  
  Object.entries(chordProgressions).forEach(([genre, subgenres]) => {
    if (typeof subgenres === 'object' && subgenres !== null) {
      categories[genre] = Object.keys(subgenres);
    }
  });

  return categories;
};

const DEFAULT_PROGRESSIONS: { [key: string]: string[] } = {
  'A': ['I', 'I', 'I', 'I'],           // Verse
  'B': ['I', 'I', 'I', 'I'],          // Chorus
  'C': ['I', 'I', 'I', 'I'],          // Solo/Break
  'R': ['I', 'I', 'I', 'I'],          // Bridge
  'P': ['I', 'I', 'I', 'I'],          // Pre-Chorus
  'I': ['I', 'I', 'I', 'I'],           // Intro
  'O': ['I', 'I', 'I', 'I'],          // Outro
  'S': ['I', 'I', 'I', 'I']                             // Air
};

function parseProgressionString(progression: string): string[] {
  if (!progression) return DEFAULT_PROGRESSIONS['A'];
  return progression.split('-').map(chord => chord.trim());
}

export const getProgressions = (genre: string, subgenre: string, blockType: string): ChordProgression[] => {
  try {
    const genreData = (chordProgressions as any)?.[genre]?.[subgenre];
    if (!genreData || typeof genreData !== 'object') {
      return [{
        name: 'Default',
        progression: DEFAULT_PROGRESSIONS[blockType] || DEFAULT_PROGRESSIONS['A'],
        key: 'C',
        bpm: 120
      }];
    }

    // Get the progression string for this block type
    const progressionString = genreData[blockType];
    if (!progressionString) {
      return [{
        name: 'Default',
        progression: DEFAULT_PROGRESSIONS[blockType] || DEFAULT_PROGRESSIONS['A'],
        key: 'C',
        bpm: 120
      }];
    }

    // Parse the progression string into an array
    const progression = parseProgressionString(progressionString);

    return [{
      name: `${genre} - ${subgenre} ${blockType}`,
      progression,
      key: 'C',
      bpm: 120
    }];
  } catch (error) {
    console.error('Error getting progressions:', error);
    return [{
      name: 'Default',
      progression: DEFAULT_PROGRESSIONS[blockType] || DEFAULT_PROGRESSIONS['A'],
      key: 'C',
      bpm: 120
    }];
  }
};

export default chordProgressions;