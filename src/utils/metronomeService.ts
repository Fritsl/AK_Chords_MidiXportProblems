import * as Tone from 'tone';

class MetronomeService {
  private isPlaying: boolean = false;
  private bpm: number = 120;
  private timeSignature: string = '4/4';
  private currentBeat: number = 0;
  private onProgressCallback: ((beat: number, time: number) => void) | null = null;
  private onStopCallback: (() => void) | null = null;
  private repeatId: number | null = null;

  // Strong beat sound
  private strongBeat = new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 2,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.1
    }
  }).toDestination();

  // Weak beat sound
  private weakBeat = new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 1,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.1
    }
  }).toDestination();

  constructor() {
    // Set initial volume
    this.strongBeat.volume.value = -12;
    this.weakBeat.volume.value = -12;
  }

  public setOnProgress(callback: ((beat: number, time: number) => void) | null) {
    this.onProgressCallback = callback;
  }

  public setOnStop(callback: (() => void) | null) {
    this.onStopCallback = callback;
  }

  public async start(bpm: number, timeSignature: string) {
    // Clean up any existing playback
    if (this.isPlaying) {
      this.stop();
      // Add a small delay to ensure clean restart
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      await Tone.start();
      
      this.bpm = bpm;
      this.timeSignature = timeSignature;
      this.currentBeat = 0;
      this.isPlaying = true;

      // Set Tone.js BPM
      Tone.Transport.bpm.value = bpm;

      // Get beats per bar from time signature
      const [beatsPerBar] = timeSignature.split('/').map(Number);
      
      // Schedule the metronome clicks
      const repeat = (time: number) => {
        if (!this.isPlaying) return;

        // Ensure we have a valid time
        const scheduleTime = time || Tone.now();

        try {
          // Schedule the click sound with a small offset
          const clickTime = scheduleTime + 0.01;
          
          // First beat gets strong click, others get weak clicks
          if (this.currentBeat === 0) {
            this.strongBeat.triggerAttackRelease('C4', '32n', clickTime, 0.5);
          } else {
            this.weakBeat.triggerAttackRelease('C3', '32n', clickTime, 0.3);
          }

          // Schedule the callback with a slightly later offset to ensure sound plays first
          if (this.onProgressCallback) {
            const callbackTime = clickTime + 0.02;
            Tone.Draw.schedule(() => {
              this.onProgressCallback?.(this.currentBeat, callbackTime);
            }, callbackTime);
          }

          // Increment beat and reset when reaching end of bar
          this.currentBeat = (this.currentBeat + 1) % beatsPerBar;
        } catch (error) {
          console.error('Error in metronome repeat:', error);
          this.stop();
        }
      };

      // Clean up any existing events
      if (this.repeatId !== null) {
        Tone.Transport.clear(this.repeatId);
      }

      // Schedule repeat at quarter note intervals
      this.repeatId = Tone.Transport.scheduleRepeat(repeat, '4n');

      // Start transport if it's not already running
      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
      }
    } catch (error) {
      console.error('Error starting metronome:', error);
      this.stop();
    }
  }

  public updateBPM(bpm: number) {
    if (bpm !== this.bpm) {
      this.bpm = bpm;
      Tone.Transport.bpm.value = bpm;
    }
  }

  public stop() {
    this.isPlaying = false;
    
    // Clear the repeat event
    if (this.repeatId !== null) {
      Tone.Transport.clear(this.repeatId);
      this.repeatId = null;
    }

    // Stop and reset transport
    Tone.Transport.stop();
    Tone.Transport.cancel();
    
    // Reset state
    this.currentBeat = 0;
    
    // Notify callbacks
    if (this.onStopCallback) {
      this.onStopCallback();
    }

    // Release any hanging notes
    const now = Tone.now();
    this.strongBeat.triggerRelease(now);
    this.weakBeat.triggerRelease(now);
  }

  public get playing(): boolean {
    return this.isPlaying;
  }
}

export const metronome = new MetronomeService();