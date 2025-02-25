// Chord pattern lookup table
// This maps every possible Roman numeral pattern from our dataset to its corresponding chord structure
export const CHORD_PATTERNS: Record<string, {
  quality: string;
  extension?: string;
  alterations?: string[];
  bass?: string;
}> = {
  // Basic triads (all inversions)
  ...Object.fromEntries([
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii',
    '#I', '#II', '#III', '#IV', '#V', '#VI', '#VII',
    '#i', '#ii', '#iii', '#iv', '#v', '#vi', '#vii',
    'bI', 'bII', 'bIII', 'bIV', 'bV', 'bVI', 'bVII',
    'bi', 'bii', 'biii', 'biv', 'bv', 'bvi', 'bvii'
  ].flatMap(numeral => {
    const isMinor = numeral === numeral.toLowerCase();
    const quality = isMinor ? 'm' : '';
    return [
      [numeral, { quality }],
      [`${numeral}/3`, { quality, bass: '3' }],
      [`${numeral}/5`, { quality, bass: '5' }],
      [`${numeral}/7`, { quality, bass: '7' }],
      [`${numeral}/2`, { quality, bass: '2' }],
      [`${numeral}/4`, { quality, bass: '4' }],
      [`${numeral}/6`, { quality, bass: '6' }],
      // Add support for Roman numeral bass notes
      [`${numeral}/I`, { quality, bass: '1' }],
      [`${numeral}/II`, { quality, bass: '2' }],
      [`${numeral}/III`, { quality, bass: '3' }],
      [`${numeral}/IV`, { quality, bass: '4' }],
      [`${numeral}/V`, { quality, bass: '5' }],
      [`${numeral}/VI`, { quality, bass: '6' }],
      [`${numeral}/VII`, { quality, bass: '7' }],
      // Add support for lowercase Roman numeral bass notes
      [`${numeral}/i`, { quality, bass: '1' }],
      [`${numeral}/ii`, { quality, bass: '2' }],
      [`${numeral}/iii`, { quality, bass: '3' }],
      [`${numeral}/iv`, { quality, bass: '4' }],
      [`${numeral}/v`, { quality, bass: '5' }],
      [`${numeral}/vi`, { quality, bass: '6' }],
      [`${numeral}/vii`, { quality, bass: '7' }]
    ];
  })),

  // Diminished triads (all inversions)
  ...Object.fromEntries([
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii',
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    '#i', '#ii', '#iii', '#iv', '#v', '#vi', '#vii',
    '#I', '#II', '#III', '#IV', '#V', '#VI', '#VII',
    'bi', 'bii', 'biii', 'biv', 'bv', 'bvi', 'bvii',
    'bI', 'bII', 'bIII', 'bIV', 'bV', 'bVI', 'bVII'
  ].flatMap(numeral => {
    return [
      [`${numeral}°`, { quality: 'dim' }],
      [`${numeral}dim`, { quality: 'dim' }],
      [`${numeral}°/3`, { quality: 'dim', bass: '3' }],
      [`${numeral}°/5`, { quality: 'dim', bass: '5' }],
      [`${numeral}dim/3`, { quality: 'dim', bass: '3' }],
      [`${numeral}dim/5`, { quality: 'dim', bass: '5' }],
      // Add support for Roman numeral bass notes
      [`${numeral}°/I`, { quality: 'dim', bass: '1' }],
      [`${numeral}°/III`, { quality: 'dim', bass: '3' }],
      [`${numeral}°/V`, { quality: 'dim', bass: '5' }],
      [`${numeral}dim/I`, { quality: 'dim', bass: '1' }],
      [`${numeral}dim/III`, { quality: 'dim', bass: '3' }],
      [`${numeral}dim/V`, { quality: 'dim', bass: '5' }]
    ];
  })),

  // Augmented triads
  ...Object.fromEntries([
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii',
    '#I', '#II', '#III', '#IV', '#V', '#VI', '#VII',
    '#i', '#ii', '#iii', '#iv', '#v', '#vi', '#vii',
    'bI', 'bII', 'bIII', 'bIV', 'bV', 'bVI', 'bVII',
    'bi', 'bii', 'biii', 'biv', 'bv', 'bvi', 'bvii'
  ].flatMap(numeral => {
    return [
      [`${numeral}+`, { quality: 'aug' }],
      [`${numeral}aug`, { quality: 'aug' }],
      [`${numeral}+/3`, { quality: 'aug', bass: '3' }],
      [`${numeral}+/5`, { quality: 'aug', bass: '5' }],
      // Add support for Roman numeral bass notes
      [`${numeral}+/III`, { quality: 'aug', bass: '3' }],
      [`${numeral}+/V`, { quality: 'aug', bass: '5' }],
      [`${numeral}aug/III`, { quality: 'aug', bass: '3' }],
      [`${numeral}aug/V`, { quality: 'aug', bass: '5' }]
    ];
  })),

  // Suspended chords
  ...Object.fromEntries([
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii',
    '#I', '#II', '#III', '#IV', '#V', '#VI', '#VII',
    '#i', '#ii', '#iii', '#iv', '#v', '#vi', '#vii',
    'bI', 'bII', 'bIII', 'bIV', 'bV', 'bVI', 'bVII',
    'bi', 'bii', 'biii', 'biv', 'bv', 'bvi', 'bvii'
  ].flatMap(numeral => {
    return [
      [`${numeral}sus2`, { quality: 'sus2' }],
      [`${numeral}sus4`, { quality: 'sus4' }],
      [`${numeral}sus`, { quality: 'sus4' }],
      [`${numeral}sus2/5`, { quality: 'sus2', bass: '5' }],
      [`${numeral}sus4/5`, { quality: 'sus4', bass: '5' }],
      // Add support for Roman numeral bass notes
      [`${numeral}sus2/V`, { quality: 'sus2', bass: '5' }],
      [`${numeral}sus4/V`, { quality: 'sus4', bass: '5' }],
      [`${numeral}sus/V`, { quality: 'sus4', bass: '5' }],
      // Add support for 7sus4 variations
      [`${numeral}7sus4`, { quality: 'sus4', extension: '7' }],
      [`${numeral}7sus`, { quality: 'sus4', extension: '7' }]
    ];
  })),

  // Seventh chords (all inversions)
  ...Object.fromEntries([
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii',
    '#I', '#II', '#III', '#IV', '#V', '#VI', '#VII',
    '#i', '#ii', '#iii', '#iv', '#v', '#vi', '#vii',
    'bI', 'bII', 'bIII', 'bIV', 'bV', 'bVI', 'bVII',
    'bi', 'bii', 'biii', 'biv', 'bv', 'bvi', 'bvii'
  ].flatMap(numeral => {
    const isMinor = numeral === numeral.toLowerCase();
    const quality = isMinor ? 'm' : '';
    return [
      [`${numeral}7`, { quality, extension: '7' }],
      [`${numeral}7/3`, { quality, extension: '7', bass: '3' }],
      [`${numeral}7/5`, { quality, extension: '7', bass: '5' }],
      [`${numeral}7/7`, { quality, extension: '7', bass: '7' }],
      [`${numeral}7/2`, { quality, extension: '7', bass: '2' }],
      [`${numeral}7/4`, { quality, extension: '7', bass: '4' }],
      [`${numeral}7/6`, { quality, extension: '7', bass: '6' }],
      // Add support for Roman numeral bass notes
      [`${numeral}7/I`, { quality, extension: '7', bass: '1' }],
      [`${numeral}7/III`, { quality, extension: '7', bass: '3' }],
      [`${numeral}7/V`, { quality, extension: '7', bass: '5' }],
      [`${numeral}7/VII`, { quality, extension: '7', bass: '7' }],
      // Add support for alternative notation
      [`${numeral}dom7`, { quality, extension: '7' }],
      [`${numeral}dom`, { quality, extension: '7' }],
      // Add support for m7 notation
      [`${numeral}m7`, { quality: 'm', extension: '7' }]
    ];
  })),

  // Major seventh chords (all inversions)
  ...Object.fromEntries([
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii',
    '#I', '#II', '#III', '#IV', '#V', '#VI', '#VII',
    '#i', '#ii', '#iii', '#iv', '#v', '#vi', '#vii',
    'bI', 'bII', 'bIII', 'bIV', 'bV', 'bVI', 'bVII',
    'bi', 'bii', 'biii', 'biv', 'bv', 'bvi', 'bvii'
  ].flatMap(numeral => {
    return [
      [`${numeral}maj7`, { quality: '', extension: 'maj7' }],
      [`${numeral}M7`, { quality: '', extension: 'maj7' }],
      [`${numeral}Δ`, { quality: '', extension: 'maj7' }],
      [`${numeral}Δ7`, { quality: '', extension: 'maj7' }],
      [`${numeral}maj7/3`, { quality: '', extension: 'maj7', bass: '3' }],
      [`${numeral}maj7/5`, { quality: '', extension: 'maj7', bass: '5' }],
      [`${numeral}maj7/7`, { quality: '', extension: 'maj7', bass: '7' }],
      // Add support for Roman numeral bass notes
      [`${numeral}maj7/III`, { quality: '', extension: 'maj7', bass: '3' }],
      [`${numeral}maj7/V`, { quality: '', extension: 'maj7', bass: '5' }],
      [`${numeral}maj7/VII`, { quality: '', extension: 'maj7', bass: '7' }],
      // Add support for alternative notation
      [`${numeral}ma7`, { quality: '', extension: 'maj7' }],
      [`${numeral}major7`, { quality: '', extension: 'maj7' }],
      [`${numeral}maj`, { quality: '', extension: 'maj7' }]
    ];
  })),

  // Minor seventh flat five
  ...Object.fromEntries([
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii',
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    '#i', '#ii', '#iii', '#iv', '#v', '#vi', '#vii',
    '#I', '#II', '#III', '#IV', '#V', '#VI', '#VII',
    'bi', 'bii', 'biii', 'biv', 'bv', 'bvi', 'bvii',
    'bI', 'bII', 'bIII', 'bIV', 'bV', 'bVI', 'bVII'
  ].flatMap(numeral => {
    return [
      [`${numeral}m7b5`, { quality: 'm', extension: '7', alterations: ['b5'] }],
      [`${numeral}ø`, { quality: 'm', extension: '7', alterations: ['b5'] }],
      [`${numeral}ø7`, { quality: 'm', extension: '7', alterations: ['b5'] }],
      [`${numeral}m7-5`, { quality: 'm', extension: '7', alterations: ['b5'] }],
      // Add support for alternative notation
      [`${numeral}min7b5`, { quality: 'm', extension: '7', alterations: ['b5'] }],
      [`${numeral}m7(-5)`, { quality: 'm', extension: '7', alterations: ['b5'] }],
      [`${numeral}m7(b5)`, { quality: 'm', extension: '7', alterations: ['b5'] }]
    ];
  })),

  // Diminished seventh chords
  ...Object.fromEntries([
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii',
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    '#i', '#ii', '#iii', '#iv', '#v', '#vi', '#vii',
    '#I', '#II', '#III', '#IV', '#V', '#VI', '#VII',
    'bi', 'bii', 'biii', 'biv', 'bv', 'bvi', 'bvii',
    'bI', 'bII', 'bIII', 'bIV', 'bV', 'bVI', 'bVII'
  ].flatMap(numeral => {
    return [
      [`${numeral}°7`, { quality: 'dim', extension: '7' }],
      [`${numeral}dim7`, { quality: 'dim', extension: '7' }],
      [`${numeral}°7/3`, { quality: 'dim', extension: '7', bass: '3' }],
      [`${numeral}°7/5`, { quality: 'dim', extension: '7', bass: '5' }],
      [`${numeral}°7/7`, { quality: 'dim', extension: '7', bass: '7' }],
      // Add support for Roman numeral bass notes
      [`${numeral}°7/III`, { quality: 'dim', extension: '7', bass: '3' }],
      [`${numeral}°7/V`, { quality: 'dim', extension: '7', bass: '5' }],
      [`${numeral}°7/VII`, { quality: 'dim', extension: '7', bass: '7' }],
      // Add support for alternative notation
      [`${numeral}dim7/III`, { quality: 'dim', extension: '7', bass: '3' }],
      [`${numeral}dim7/V`, { quality: 'dim', extension: '7', bass: '5' }],
      [`${numeral}dim7/VII`, { quality: 'dim', extension: '7', bass: '7' }]
    ];
  })),

  // Extended chords (9, 11, 13)
  ...Object.fromEntries([
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii',
    '#I', '#II', '#III', '#IV', '#V', '#VI', '#VII',
    '#i', '#ii', '#iii', '#iv', '#v', '#vi', '#vii',
    'bI', 'bII', 'bIII', 'bIV', 'bV', 'bVI', 'bVII',
    'bi', 'bii', 'biii', 'biv', 'bv', 'bvi', 'bvii'
  ].flatMap(numeral => {
    const isMinor = numeral === numeral.toLowerCase();
    const quality = isMinor ? 'm' : '';
    return [
      // Ninth chords
      [`${numeral}9`, { quality, extension: '9' }],
      [`${numeral}maj9`, { quality: '', extension: 'maj9' }],
      [`${numeral}M9`, { quality: '', extension: 'maj9' }],
      [`${numeral}Δ9`, { quality: '', extension: 'maj9' }],
      
      // Eleventh chords
      [`${numeral}11`, { quality, extension: '11' }],
      [`${numeral}maj11`, { quality: '', extension: 'maj11' }],
      [`${numeral}M11`, { quality: '', extension: 'maj11' }],
      [`${numeral}Δ11`, { quality: '', extension: 'maj11' }],
      
      // Thirteenth chords
      [`${numeral}13`, { quality, extension: '13' }],
      [`${numeral}maj13`, { quality: '', extension: 'maj13' }],
      [`${numeral}M13`, { quality: '', extension: 'maj13' }],
      [`${numeral}Δ13`, { quality: '', extension: 'maj13' }],

      // Add support for alternative notation
      [`${numeral}ma9`, { quality: '', extension: 'maj9' }],
      [`${numeral}ma11`, { quality: '', extension: 'maj11' }],
      [`${numeral}ma13`, { quality: '', extension: 'maj13' }],
      [`${numeral}major9`, { quality: '', extension: 'maj9' }],
      [`${numeral}major11`, { quality: '', extension: 'maj11' }],
      [`${numeral}major13`, { quality: '', extension: 'maj13' }]
    ];
  })),

  // Add chords
  ...Object.fromEntries([
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii',
    '#I', '#II', '#III', '#IV', '#V', '#VI', '#VII',
    '#i', '#ii', '#iii', '#iv', '#v', '#vi', '#vii',
    'bI', 'bII', 'bIII', 'bIV', 'bV', 'bVI', 'bVII',
    'bi', 'bii', 'biii', 'biv', 'bv', 'bvi', 'bvii'
  ].flatMap(numeral => {
    const isMinor = numeral === numeral.toLowerCase();
    const quality = isMinor ? 'm' : '';
    return [
      [`${numeral}add9`, { quality, alterations: ['add9'] }],
      [`${numeral}add11`, { quality, alterations: ['add11'] }],
      [`${numeral}add13`, { quality, alterations: ['add13'] }],
      [`${numeral}2`, { quality, alterations: ['add9'] }],
      [`${numeral}4`, { quality, alterations: ['add11'] }],
      // Add support for alternative notation
      [`${numeral}(add9)`, { quality, alterations: ['add9'] }],
      [`${numeral}(add11)`, { quality, alterations: ['add11'] }],
      [`${numeral}(add13)`, { quality, alterations: ['add13'] }]
    ];
  })),

  // Sixth chords
  ...Object.fromEntries([
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii',
    '#I', '#II', '#III', '#IV', '#V', '#VI', '#VII',
    '#i', '#ii', '#iii', '#iv', '#v', '#vi', '#vii',
    'bI', 'bII', 'bIII', 'bIV', 'bV', 'bVI', 'bVII',
    'bi', 'bii', 'biii', 'biv', 'bv', 'bvi', 'bvii'
  ].flatMap(numeral => {
    const isMinor = numeral === numeral.toLowerCase();
    const quality = isMinor ? 'm' : '';
    return [
      [`${numeral}6`, { quality, extension: '6' }],
      [`${numeral}6/9`, { quality, extension: '69' }],
      [`${numeral}69`, { quality, extension: '69' }],
      // Add support for alternative notation
      [`${numeral}maj6`, { quality, extension: '6' }],
      [`${numeral}M6`, { quality, extension: '6' }],
      [`${numeral}maj69`, { quality, extension: '69' }],
      [`${numeral}M69`, { quality, extension: '69' }]
    ];
  })),

  // Altered dominant chords (primarily for V7 but supporting all scale degrees)
  ...Object.fromEntries([
    'I7', 'II7', 'III7', 'IV7', 'V7', 'VI7', 'VII7',
    'i7', 'ii7', 'iii7', 'iv7', 'v7', 'vi7', 'vii7',
    '#I7', '#II7', '#III7', '#IV7', '#V7', '#VI7', '#VII7',
    '#i7', '#ii7', '#iii7', '#iv7', '#v7', '#vi7', '#vii7',
    'bI7', 'bII7', 'bIII7', 'bIV7', 'bV7', 'bVI7', 'bVII7',
    'bi7', 'bii7', 'biii7', 'biv7', 'bv7', 'bvi7', 'bvii7'
  ].flatMap(base => {
    return [
      [`${base}b5`, { quality: '', extension: '7', alterations: ['b5'] }],
      [`${base}#5`, { quality: '', extension: '7', alterations: ['#5'] }],
      [`${base}b9`, { quality: '', extension: '7', alterations: ['b9'] }],
      [`${base}#9`, { quality: '', extension: '7', alterations: ['#9'] }],
      [`${base}#11`, { quality: '', extension: '7', alterations: ['#11'] }],
      [`${base}b13`, { quality: '', extension: '7', alterations: ['b13'] }],
      [`${base}alt`, { quality: '', extension: '7', alterations: ['b5', 'b9', 'b13'] }],
      
      // Common combinations
      [`${base}b5b9`, { quality: '', extension: '7', alterations: ['b5', 'b9'] }],
      [`${base}b5#9`, { quality: '', extension: '7', alterations: ['b5', '#9'] }],
      [`${base}#5b9`, { quality: '', extension: '7', alterations: ['#5', 'b9'] }],
      [`${base}#5#9`, { quality: '', extension: '7', alterations: ['#5', '#9'] }],
      [`${base}b9b13`, { quality: '', extension: '7', alterations: ['b9', 'b13'] }],
      [`${base}#9b13`, { quality: '', extension: '7', alterations: ['#9', 'b13'] }],
      [`${base}#11b13`, { quality: '', extension: '7', alterations: ['#11', 'b13'] }],

      // Add support for alternative notation
      [`${base}(b5)`, { quality: '', extension: '7', alterations: ['b5'] }],
      [`${base}(#5)`, { quality: '', extension: '7', alterations: ['#5'] }],
      [`${base}(b9)`, { quality: '', extension: '7', alterations: ['b9'] }],
      [`${base}(#9)`, { quality: '', extension: '7', alterations: ['#9'] }],
      [`${base}(#11)`, { quality: '', extension: '7', alterations: ['#11'] }],
      [`${base}(b13)`, { quality: '', extension: '7', alterations: ['b13'] }],
      
      // Add support for multiple alterations with parentheses
      [`${base}(b5,b9)`, { quality: '', extension: '7', alterations: ['b5', 'b9'] }],
      [`${base}(b5,#9)`, { quality: '', extension: '7', alterations: ['b5', '#9'] }],
      [`${base}(#5,b9)`, { quality: '', extension: '7', alterations: ['#5', 'b9'] }],
      [`${base}(#5,#9)`, { quality: '', extension: '7', alterations: ['#5', '#9'] }],
      [`${base}(b9,b13)`, { quality: '', extension: '7', alterations: ['b9', 'b13'] }],
      [`${base}(#9,b13)`, { quality: '', extension: '7', alterations: ['#9', 'b13'] }],
      [`${base}(#11,b13)`, { quality: '', extension: '7', alterations: ['#11', 'b13'] }]
    ];
  }))
};

// Scale degree to interval mapping for bass notes
export const SCALE_DEGREE_TO_INTERVAL: Record<string, string> = {
  '1': '1P',
  '2': '2M',
  '3': '3M',
  '4': '4P',
  '5': '5P',
  '6': '6M',
  '7': '7M'
};

// Roman numeral to scale degree mapping
export const ROMAN_TO_DEGREE: Record<string, number> = {
  'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5, 'VII': 6,
  'i': 0, 'ii': 1, 'iii': 2, 'iv': 3, 'v': 4, 'vi': 5, 'vii': 6,
  '#I': 1, '#II': 2, '#III': 3, '#IV': 4, '#V': 5, '#VI': 6, '#VII': 0,
  '#i': 1, '#ii': 2, '#iii': 3, '#iv': 4, '#v': 5, '#vi': 6, '#vii': 0,
  'bI': 6, 'bII': 0, 'bIII': 1, 'bIV': 2, 'bV': 3, 'bVI': 4, 'bVII': 5,
  'bi': 6, 'bii': 0, 'biii': 1, 'biv': 2, 'bv': 3, 'bvi': 4, 'bvii': 5
};