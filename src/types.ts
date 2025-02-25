export interface Block {
  Type: string;
  Name: string;
  HeightL: number;
  HeightR: number;
}

export interface TypeDefinition {
  Length: number;
}

export interface Arrangement {
  Version: string;
  Genre: string;
  Name: string;
  UserName: string;
  BPM: string;
  Key?: string;
  Blocks: Block[];
  Types: Record<string, TypeDefinition>;
}

export const VALID_GENRES = [
  'Pop/Rock/Disco',
  'EDM/House/Electronic',
  'RnB/Hip-Hop',
  'Jazz/Blues',
  'Ambient',
  'UserDefined'
] as const;

export const VALID_LENGTHS = [1, 2, 3, 4, 6, 8, 10, 12, 16, 24, 32] as const;

export const BLOCK_TYPE_MAPPINGS: Record<string, string> = {
  'A': 'Verse',
  'B': 'Chorus',
  'C': 'Solo-Break',
  'R': 'Bridge',
  'P': 'Pre-Chorus',
  'I': 'Intro',
  'O': 'Outro.Fade_Out',
  'S': 'Air'
};

export const GENRE_TYPE_MAPPINGS: Record<string, Record<string, string>> = {
  'Pop/Rock/Disco': BLOCK_TYPE_MAPPINGS,
  'EDM/House/Electronic': {
    'A': 'Break',
    'B': 'Drop',
    'C': 'Build',
    'R': 'Breakdown',
    'P': 'Buildup',
    'I': 'Intro',
    'O': 'Outro',
    'S': 'Air'
  },
  'RnB/Hip-Hop': {
    'A': 'Verse',
    'B': 'Hook',
    'C': 'Beat Switch',
    'R': 'Bridge',
    'P': 'Pre-Hook',
    'I': 'Intro',
    'O': 'Outro',
    'S': 'Air'
  },
  'Jazz/Blues': {
    'A': 'Head',
    'B': 'Solo',
    'C': 'Break',
    'R': 'Return',
    'P': 'Lead-in',
    'I': 'Intro',
    'O': 'Coda',
    'S': 'Air'
  },
  'Ambient': {
    'A': 'Exposition',
    'B': 'Development',
    'C': 'Cadence',
    'R': 'Transition',
    'P': 'Prelude',
    'I': 'Intro',
    'O': 'Finale',
    'S': 'Air'
  },
  'UserDefined': BLOCK_TYPE_MAPPINGS
};

export const MUSICAL_KEYS = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'C♯',
  'F', 'B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭',
  'Am', 'Em', 'Bm', 'F♯m', 'C♯m', 'G♯m', 'D♯m', 'A♯m',
  'Dm', 'Gm', 'Cm', 'Fm', 'B♭m', 'E♭m', 'A♭m'
] as const;