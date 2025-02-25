// @ts-ignore - jsmidgen doesn't have types
import Midi from 'jsmidgen';

const TICKS_PER_BEAT = 128;
const NOTE_VELOCITY = 100;
const NOTE_PITCH = 60; // Middle C

export function generateMidiFile(
  pattern: ('on' | 'off')[],
  timeSignature: string = '4/4',
  bpm: number = 120,
  blockName: string = 'Unknown',
  dividers: boolean[] = []
): number[] {
  try {
    if (!pattern || pattern.length === 0) {
      throw new Error('Invalid pattern data');
    }

    const file = new Midi.File();
    const track = new Midi.Track();
    file.addTrack(track);

    // Set time signature
    const [numerator, denominator] = timeSignature.split('/').map(Number);
    track.setTimeSignature(numerator, Math.log2(denominator));

    // Set tempo
    track.setTempo(bpm);

    // Add notes based on pattern
    pattern.forEach((state, index) => {
      if (state === 'on') {
        // Note on with duration of 1/16th note
        track.addNote(0, NOTE_PITCH, TICKS_PER_BEAT / 4, NOTE_VELOCITY);
      }
    });

    return Array.from(file.toBytes());
  } catch (error) {
    console.error('Error generating MIDI file:', error);
    throw error;
  }
}

export function downloadMidi(fileName: string, data: number[]): void {
  try {
    if (!data || data.length === 0) {
      throw new Error('No MIDI data provided');
    }

    const buffer = new Uint8Array(data);
    const blob = new Blob([buffer], { type: 'audio/midi' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.mid') ? fileName : `${fileName}.mid`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading MIDI file:', error);
    throw error;
  }
}