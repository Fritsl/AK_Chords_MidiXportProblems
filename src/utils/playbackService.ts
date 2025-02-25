import { synth } from './synth';

interface PlaybackOptions {
  chords: string[];
  barLengths: number[];
  bpm: number;
  key: string;
}

class PlaybackService {
  private isPlaying: boolean = false;
  private currentChordIndex: number = 0;
  private timeoutId: number | null = null;
  private options: PlaybackOptions | null = null;
  private onProgressCallback: ((index: number) => void) | null = null;

  public setOnProgress(callback: (index: number) => void) {
    this.onProgressCallback = callback;
  }

  public start(options: PlaybackOptions) {
    if (this.isPlaying) return;
    
    this.options = options;
    this.isPlaying = true;
    this.currentChordIndex = 0;
    this.playNextChord();
  }

  public stop() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    synth.stopAll();
  }

  private playNextChord() {
    if (!this.isPlaying || !this.options) return;

    const { chords, barLengths, bpm, key } = this.options;
    
    if (this.currentChordIndex >= chords.length) {
      this.currentChordIndex = 0;
    }

    // Play the current chord
    const chord = chords[this.currentChordIndex];
    const barLength = barLengths[this.currentChordIndex];
    
    // Calculate duration based on BPM and bar length
    const beatDuration = 60 / bpm; // Duration of one beat in seconds
    const barDuration = beatDuration * barLength * 1000; // Convert to milliseconds

    // Play the chord
    synth.playChord(chord, barDuration / 1000, true, key);
    
    // Notify progress
    this.onProgressCallback?.(this.currentChordIndex);

    // Schedule next chord
    this.timeoutId = window.setTimeout(() => {
      this.currentChordIndex++;
      this.playNextChord();
    }, barDuration);
  }

  public get playing(): boolean {
    return this.isPlaying;
  }
}

export const playback = new PlaybackService();