
// Basic MIDI file creation without external dependencies
export function generateMidiFile(
  pattern: ('on' | 'off')[],
  timeSignature: string = '4/4',
  bpm: number = 120,
  name: string = '',
  dividers: boolean[] = []
): Uint8Array {
  // Simple MIDI file format implementation
  const HEADER_CHUNK = [
    0x4D, 0x54, 0x68, 0x64, // MThd
    0x00, 0x00, 0x00, 0x06, // Chunk size
    0x00, 0x00, // Format type 0
    0x00, 0x01, // One track
    0x00, 0x60  // 96 ticks per quarter note
  ];

  const TRACK_START = [
    0x4D, 0x54, 0x72, 0x6B // MTrk
  ];

  // Create note events
  const events: number[] = [];
  let time = 0;
  const TICKS_PER_16TH = 24; // At 96 PPQ

  // Add tempo meta event (60000000 microseconds / BPM)
  const microsecondsPerBeat = Math.floor(60000000 / bpm);
  events.push(
    0x00, // Delta time
    0xFF, 0x51, 0x03, // Tempo meta event
    (microsecondsPerBeat >> 16) & 0xFF,
    (microsecondsPerBeat >> 8) & 0xFF,
    microsecondsPerBeat & 0xFF
  );

  // Add time signature
  const [numerator, denominator] = timeSignature.split('/').map(Number);
  events.push(
    0x00, // Delta time
    0xFF, 0x58, 0x04, // Time signature meta event
    numerator,
    Math.log2(denominator),
    24, // MIDI clocks per metronome click
    8 // 32nd notes per MIDI quarter note
  );

  // Add notes
  pattern.forEach((state, i) => {
    if (state === 'on') {
      // Note on
      events.push(
        0x00, // Delta time
        0x90, // Note on, channel 0
        60, // Middle C
        100 // Velocity
      );
      
      // Note off (after duration)
      events.push(
        TICKS_PER_16TH, // Delta time (16th note duration)
        0x80, // Note off, channel 0
        60, // Middle C
        0 // Velocity
      );
    } else {
      // Rest
      events.push(TICKS_PER_16TH);
    }
  });

  // End of track
  events.push(0x00, 0xFF, 0x2F, 0x00);

  // Calculate track length
  const trackLength = events.length;
  const trackLengthBytes = [
    (trackLength >> 24) & 0xFF,
    (trackLength >> 16) & 0xFF,
    (trackLength >> 8) & 0xFF,
    trackLength & 0xFF
  ];

  // Combine all parts
  const midiData = new Uint8Array([
    ...HEADER_CHUNK,
    ...TRACK_START,
    ...trackLengthBytes,
    ...events
  ]);

  return midiData;
}

export async function downloadMidi(fileName: string, data: Uint8Array) {
  try {
    console.log('MIDI file size:', data.length, 'bytes');
    console.log('First 20 bytes:', Array.from(data.slice(0, 20)));
    
    const blob = new Blob([data], { type: 'audio/midi' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading MIDI file:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

// Debug function to test MIDI generation
export function generateTestMidi(): Uint8Array {
  const testPattern: ('on' | 'off')[] = Array(16).fill('off').map((_, i) => i % 4 === 0 ? 'on' : 'off');
  return generateMidiFile(testPattern, '4/4', 120, 'test');
}
