import { Note } from 'tonal';
// @ts-ignore - jsmidgen doesn't have types
import Midi from 'jsmidgen';

interface RhythmData {
  pattern: ('on' | 'off')[];
  timeSignature: string;
  bpm: number;
  totalBeats: number;
  blockName: string;
  dividers: boolean[];
}

const TICKS_PER_BEAT = 128;
const NOTE_VELOCITY = 100;
const NOTE_PITCH = 60; // Middle C

export function generateMidiFile(
  pattern: ('on' | 'off')[],
  timeSignature: string = '4/4',
  bpm: number = 120,
  blockName: string = 'Unknown',
  dividers: boolean[] = []
): Uint8Array {
  try {
    if (!pattern || pattern.length === 0) {
      throw new Error('Invalid pattern data');
    }

    // Create a new MIDI file with one track
    const file = new Midi.File();
    const track = new Midi.Track();
    file.addTrack(track);

    // Set tempo (convert BPM to microseconds per quarter note)
    const mpqn = Math.floor(60000000 / bpm);
    track.setTempo(mpqn);

    // Set time signature
    const [numerator, denominator] = timeSignature.split('/').map(Number);
    if (!numerator || !denominator) {
      throw new Error('Invalid time signature');
    }
    track.setTimeSignature(numerator, Math.log2(denominator));

    // Ensure dividers array is correct length
    const correctDividers = dividers.length === pattern.length - 1 
      ? dividers 
      : Array(pattern.length - 1).fill(false);

    // Calculate duration for each note (in ticks)
    const noteDuration = TICKS_PER_BEAT / 4; // Sixteenth notes

    // Add notes based on pattern
    let currentTick = 0;
    pattern.forEach((state, index) => {
      if (state === 'on') {
        // Add note - channel 0, pitch 60 (middle C), duration, start time, velocity
        track.addNoteOn(0, NOTE_PITCH, currentTick, NOTE_VELOCITY);
        track.addNoteOff(0, NOTE_PITCH, currentTick + noteDuration);
      }

      // Add phrase marker if there's a divider
      if (index < correctDividers.length && correctDividers[index]) {
        // Add a text marker event
        track.addText(currentTick, 'Phrase');
      }

      // Move to next position
      currentTick += noteDuration;
    });

    // Convert to bytes
    const bytes = file.toBytes();
    if (!bytes || bytes.length === 0) {
      throw new Error('Failed to generate MIDI data');
    }

    return new Uint8Array(bytes);
  } catch (error) {
    console.error('Error generating MIDI file:', error);
    throw error;
  }
}

export function downloadMidi(fileName: string, data: Uint8Array): void {
  try {
    if (!data || data.length === 0) {
      throw new Error('No MIDI data provided');
    }

    // Create blob and download
    const blob = new Blob([data], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.mid') ? fileName : `${fileName}.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading MIDI file:', error);
    throw error;
  }
}