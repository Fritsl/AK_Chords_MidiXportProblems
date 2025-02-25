
import { Note } from 'tonal';
// @ts-ignore - jsmidgen doesn't have types
import Midi from 'jsmidgen';

const NOTE_PITCH = 60; // Middle C

export function generateMidiFile(
  pattern: ('on' | 'off')[],
  timeSignature: string = '4/4',
  tempo: number = 120,
  name: string = 'Untitled',
  dividers: boolean[] = []
): number[] {
  try {
    const file = new Midi.File();
    const track = new Midi.Track();
    file.addTrack(track);

    // Set tempo
    track.setTempo(tempo);

    // Convert time signature from string (e.g. "4/4") to numbers
    const [numerator, denominator] = timeSignature.split('/').map(Number);
    track.setTimeSignature(numerator, Math.log2(denominator));

    // Add notes based on pattern
    pattern.forEach((value, index) => {
      if (value === 'on') {
        // Add a note with velocity 127 (max) for 1/4 note duration
        track.addNote(0, NOTE_PITCH, 128);
      } else {
        // Add a rest for 1/4 note duration
        track.noteOff(0, NOTE_PITCH, 128);
      }
    });

    return file.toBytes();
  } catch (error) {
    console.error('Error generating MIDI file:', error);
    throw error;
  }
}

export function downloadMidi(fileName: string, data: number[] | Uint8Array): void {
  try {
    if (!data || data.length === 0) {
      throw new Error('No MIDI data provided');
    }

    const buffer = data instanceof Uint8Array ? data : new Uint8Array(data);
    const blob = new Blob([buffer], { type: 'audio/midi' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading MIDI file:', error);
    throw error;
  }
}
