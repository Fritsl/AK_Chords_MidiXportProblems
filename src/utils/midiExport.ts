
// @ts-ignore - jsmidgen doesn't have types
import Midi from 'jsmidgen';

const TICKS_PER_BEAT = 128;
const NOTE_VELOCITY = 100;
const NOTE_PITCH = 60; // Middle C

export function generateMidiFile(
  pattern: ('on' | 'off')[],
  timeSignature: string = '4/4',
  bpm: number = 120,
  name: string = '',
  dividers: boolean[] = []
): Uint8Array {
  try {
    if (!pattern || pattern.length === 0) {
      throw new Error('Invalid pattern data');
    }

    const file = new Midi.File();
    const track = new Midi.Track();
    file.addTrack(track);

    // Set time signature
    const [numerator, denominator] = timeSignature.split('/').map(Number);
    if (!numerator || !denominator) {
      throw new Error('Invalid time signature');
    }
    track.setTimeSignature(numerator, Math.log2(denominator));

    // Set tempo (convert BPM to microseconds per quarter note)
    const mpqn = Math.floor(60000000 / bpm);
    track.setTempo(mpqn);

    // Add notes based on pattern
    let currentTick = 0;
    const noteDuration = TICKS_PER_BEAT / 4; // Sixteenth notes

    pattern.forEach((state, index) => {
      if (state === 'on') {
        track.addNote(0, NOTE_PITCH, noteDuration, NOTE_VELOCITY);
      } else {
        // Add rest
        currentTick += noteDuration;
      }

      // Add phrase marker if there's a divider
      if (dividers[index]) {
        track.addText(currentTick, 'Phrase');
      }
    });

    return new Uint8Array(file.toBytes());
  } catch (error) {
    console.error('Error generating MIDI file:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export async function downloadMidi(fileName: string, data: Uint8Array) {
  try {
    const blob = new Blob([data], { type: 'audio/midi' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.mid') ? fileName : `${fileName}.mid`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading MIDI file:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
