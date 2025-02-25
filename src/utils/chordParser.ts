import { Note, Chord, Scale } from 'tonal';
import { CHORD_PATTERNS, SCALE_DEGREE_TO_INTERVAL, ROMAN_TO_DEGREE } from './chordLookup';

export function normalizeKey(key: string): string {
  try {
    // Handle special cases for flat and sharp keys
    const keyMap: Record<string, string> = {
      'Db': 'C#',
      'Eb': 'D#',
      'Gb': 'F#',
      'Ab': 'G#',
      'Bb': 'A#',
      'Dbm': 'C#m',
      'Ebm': 'D#m',
      'Gbm': 'F#m',
      'Abm': 'G#m',
      'Bbm': 'A#m'
    };

    // Replace ♯ and ♭ with # and b
    let normalized = key.replace('♯', '#').replace('♭', 'b');
    
    // Use the key mapping if available
    normalized = keyMap[normalized] || normalized;
    
    const isMinor = normalized.toLowerCase().endsWith('m');
    const root = normalized.replace(/m$/i, '');
    
    // Get the normalized pitch class
    const normalizedRoot = Note.get(root).pc || 'C';
    return normalizedRoot + (isMinor ? 'm' : '');
  } catch {
    return 'C';
  }
}

export function lookupChord(roman: string): {
  degree: number;
  quality: string;
  extension?: string;
  alterations?: string[];
  bass?: string;
} | null {
  // Extract the base pattern without slash chord notation
  const [pattern, bassNote] = roman.split('/');
  
  // Lookup the pattern
  const chordPattern = CHORD_PATTERNS[pattern];
  if (!chordPattern) return null;

  // Get the scale degree from the first characters of the pattern
  const degreeMatch = pattern.match(/^[IiVv]+/);
  if (!degreeMatch) return null;
  
  const degree = ROMAN_TO_DEGREE[degreeMatch[0]];
  if (degree === undefined) return null;

  // Return the chord information
  return {
    degree,
    quality: chordPattern.quality,
    extension: chordPattern.extension,
    alterations: chordPattern.alterations,
    bass: bassNote || chordPattern.bass
  };
}

export function romanToChord(roman: string, key: string = 'C'): string {
  try {
    const parsed = lookupChord(roman);
    if (!parsed) return 'C';

    // Normalize the key first
    const normalizedKey = normalizeKey(key);
    
    // Get the scale notes for the key
    const scaleType = normalizedKey.endsWith('m') ? 'minor' : 'major';
    const scaleRoot = normalizedKey.replace(/m$/, '');
    const scale = Scale.get(`${scaleRoot} ${scaleType}`).notes;
    
    // Get the root note for this chord
    const root = scale[parsed.degree];
    if (!root) return 'C';

    // Build the chord symbol
    let symbol = root + parsed.quality;
    
    // Add extension
    if (parsed.extension) {
      symbol += parsed.extension;
    }
    
    // Add alterations
    if (parsed.alterations && parsed.alterations.length > 0) {
      symbol += `(${parsed.alterations.join(',')})`;
    }
    
    // Handle slash chords
    if (parsed.bass) {
      if (parsed.bass.match(/^\d$/)) {
        // If bass is a scale degree number
        const interval = SCALE_DEGREE_TO_INTERVAL[parsed.bass];
        if (interval) {
          const bassNote = Note.transpose(root, interval);
          symbol += `/${bassNote}`;
        }
      } else {
        // If bass is already a note name
        symbol += `/${parsed.bass}`;
      }
    }
    
    return symbol;
  } catch {
    return 'C';
  }
}

export function getChordNotes(chordName: string, key: string = 'C', octave: number = 4): string[] {
  try {
    let chord;
    if (chordName.match(/^[IiVv]+/)) {
      // Convert Roman numeral to actual chord name in the given key
      const actualChord = romanToChord(chordName, key);
      chord = Chord.get(actualChord);
    } else {
      chord = Chord.get(chordName);
    }
    
    if (chord.empty) {
      return getDefaultChord(key, octave);
    }
    
    return chord.notes.map(note => {
      const noteObj = Note.get(note);
      return noteObj.pc + octave;
    });
  } catch (error) {
    console.error('Error getting chord notes:', error);
    return getDefaultChord(key, octave);
  }
}

export function getDefaultChord(key: string, octave: number = 4): string[] {
  try {
    const normalizedKey = normalizeKey(key);
    const isMinor = normalizedKey.toLowerCase().endsWith('m');
    const root = normalizedKey.replace(/m$/i, '');
    const intervals = isMinor ? ['1P', '3m', '5P'] : ['1P', '3M', '5P'];
    
    return intervals.map(interval => {
      const note = Note.transpose(root, interval);
      return note + octave;
    });
  } catch {
    return [`C${octave}`, `E${octave}`, `G${octave}`];
  }
}