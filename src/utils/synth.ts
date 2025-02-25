import * as Tone from 'tone';
import { getChordNotes, normalizeKey } from './chordParser';

type Instrument = 'piano' | 'strings';
type PlaybackMode = 'chord' | 'both' | 'arpeggio';

class PianoSynth {
  private sampler: Tone.Sampler | null = null;
  private currentKey: string = 'C';
  private isInitialized: boolean = false;
  private _currentInstrument: Instrument = 'piano';
  private _playbackMode: PlaybackMode = 'both';
  private reverb: Tone.Reverb | null = null;

  constructor() {
    this.initSampler();
  }

  get currentInstrument(): Instrument {
    return this._currentInstrument;
  }

  get playbackMode(): PlaybackMode {
    return this._playbackMode;
  }

  set playbackMode(mode: PlaybackMode) {
    this._playbackMode = mode;
  }

  private getSamplerConfig() {
    if (this._currentInstrument === 'piano') {
      return {
        urls: {
          A0: "A0.mp3",
          C1: "C1.mp3",
          "D#1": "Ds1.mp3",
          "F#1": "Fs1.mp3",
          A1: "A1.mp3",
          C2: "C2.mp3",
          "D#2": "Ds2.mp3",
          "F#2": "Fs2.mp3",
          A2: "A2.mp3",
          C3: "C3.mp3",
          "D#3": "Ds3.mp3",
          "F#3": "Fs3.mp3",
          A3: "A3.mp3",
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
          C5: "C5.mp3",
          "D#5": "Ds5.mp3",
          "F#5": "Fs5.mp3",
          A5: "A5.mp3",
          C6: "C6.mp3",
          "D#6": "Ds6.mp3",
          "F#6": "Fs6.mp3",
          A6: "A6.mp3",
          C7: "C7.mp3",
          "D#7": "Ds7.mp3",
          "F#7": "Fs7.mp3",
          A7: "A7.mp3",
          C8: "C8.mp3"
        },
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        release: 1
      };
    } else {
      return {
        urls: {
          C4: "violin-C4.mp3",
          E4: "violin-E4.mp3",
          G4: "violin-G4.mp3",
          C5: "violin-C5.mp3"
        },
        baseUrl: "https://tonejs.github.io/examples/audio/violin/",
        release: 1.2
      };
    }
  }

  private async initSampler() {
    if (this.sampler) {
      this.sampler.releaseAll();
      this.sampler.dispose();
    }

    if (this.reverb) {
      this.reverb.dispose();
    }

    const fallbackSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: this._currentInstrument === 'piano' ? 'triangle' : 'sine'
      },
      envelope: {
        attack: this._currentInstrument === 'piano' ? 0.005 : 0.1,
        decay: this._currentInstrument === 'piano' ? 0.1 : 0.2,
        sustain: this._currentInstrument === 'piano' ? 0.3 : 0.6,
        release: this._currentInstrument === 'piano' ? 1 : 1.5
      }
    }).toDestination();

    try {
      const config = this.getSamplerConfig();
      this.sampler = new Tone.Sampler({
        ...config,
        onload: () => {
          this.isInitialized = true;
        },
        onerror: () => {
          console.warn('Failed to load samples, using fallback synth');
          this.sampler = fallbackSynth;
          this.isInitialized = true;
        }
      });

      // Create and configure reverb
      this.reverb = new Tone.Reverb({
        decay: this._currentInstrument === 'piano' ? 2.5 : 3.5,
        preDelay: 0.01,
        wet: this._currentInstrument === 'piano' ? 0.3 : 0.4
      }).toDestination();

      // Connect sampler through reverb to destination
      this.sampler.connect(this.reverb);

      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Loading timeout')), 5000)
      );

      await Promise.race([Tone.loaded(), timeout]).catch(() => {
        console.warn('Sample loading timed out, using fallback synth');
        this.sampler = fallbackSynth;
        this.isInitialized = true;
      });
    } catch (error) {
      console.warn('Error initializing sampler, using fallback synth:', error);
      this.sampler = fallbackSynth;
      this.isInitialized = true;
    }
  }

  public async toggleInstrument() {
    this._currentInstrument = this._currentInstrument === 'piano' ? 'strings' : 'piano';
    await this.initSampler();
  }

  public setKey(key: string) {
    this.currentKey = normalizeKey(key);
  }

  private sortNotesByPitch(notes: string[]): string[] {
    return [...notes].sort((a, b) => {
      const midiA = Tone.Frequency(a).toMidi();
      const midiB = Tone.Frequency(b).toMidi();
      return midiA - midiB;
    });
  }

  private async playNoteSequence(notes: string[], startTime: number, duration: number, velocity: number) {
    const noteSpacing = 0.2; // Time between notes in seconds
    const sortedNotes = this.sortNotesByPitch(notes);
    
    sortedNotes.forEach((note, index) => {
      const time = startTime + (index * noteSpacing);
      this.sampler?.triggerAttackRelease(
        note,
        duration,
        time,
        velocity + (Math.random() * 0.1)
      );
    });

    return startTime + (notes.length * noteSpacing);
  }

  public async playChord(chordName: string, duration: number = 0.5, forceChordOnly: boolean = false, key: string = 'C') {
    if (!this.sampler || !this.isInitialized) {
      await this.initSampler();
    }

    await Tone.start();

    try {
      const notes = getChordNotes(chordName, key);
      const sortedNotes = this.sortNotesByPitch(notes);
      const now = Tone.now();
      const velocity = this._currentInstrument === 'piano' ? 0.7 : 0.8;

      // If forceChordOnly is true, always play chord only
      if (forceChordOnly) {
        sortedNotes.forEach((note, index) => {
          const time = now + (index * (this._currentInstrument === 'piano' ? 0.01 : 0.03));
          this.sampler?.triggerAttackRelease(
            note,
            duration,
            time,
            velocity + (Math.random() * 0.1)
          );
        });
        return;
      }

      // Otherwise, respect the playback mode
      switch (this._playbackMode) {
        case 'chord':
          sortedNotes.forEach((note, index) => {
            const time = now + (index * (this._currentInstrument === 'piano' ? 0.01 : 0.03));
            this.sampler?.triggerAttackRelease(
              note,
              duration,
              time,
              velocity + (Math.random() * 0.1)
            );
          });
          break;

        case 'arpeggio':
          await this.playNoteSequence(notes, now, duration * 0.8, velocity * 0.9);
          break;

        case 'both':
          // Play chord first
          sortedNotes.forEach((note, index) => {
            const time = now + (index * (this._currentInstrument === 'piano' ? 0.01 : 0.03));
            this.sampler?.triggerAttackRelease(
              note,
              duration,
              time,
              velocity + (Math.random() * 0.1)
            );
          });

          // Then play arpeggio
          const arpeggioStartTime = now + duration + 0.1;
          await this.playNoteSequence(notes, arpeggioStartTime, duration * 0.8, velocity * 0.9);
          break;
      }
    } catch (error) {
      console.error('Error playing chord:', error);
    }
  }

  public stopAll() {
    this.sampler?.releaseAll();
  }
}

export const synth = new PianoSynth();