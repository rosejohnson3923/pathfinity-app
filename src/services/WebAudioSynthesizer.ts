/**
 * Web Audio Synthesizer
 * Generates game sounds dynamically using Web Audio API
 */

export class WebAudioSynthesizer {
  private audioContext: AudioContext;
  private masterGainNode: GainNode;

  constructor() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass();
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);
    this.masterGainNode.gain.value = 0.5;
  }

  /**
   * Resume audio context (needed for some browsers)
   */
  public async resume(): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Generate a button click sound
   */
  public playButtonClick(volume: number = 0.3): void {
    this.resume();
    const time = this.audioContext.currentTime;

    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    // Configure sound
    oscillator.frequency.setValueAtTime(800, time);
    oscillator.frequency.exponentialRampToValueAtTime(400, time + 0.05);

    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    // Play
    oscillator.start(time);
    oscillator.stop(time + 0.1);
  }

  /**
   * Generate card selection sound
   */
  public playCardSelect(volume: number = 0.4): void {
    this.resume();
    const time = this.audioContext.currentTime;

    // Create two oscillators for harmony
    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    // Configure frequencies (major third)
    osc1.frequency.setValueAtTime(523.25, time); // C5
    osc2.frequency.setValueAtTime(659.25, time); // E5

    osc1.type = 'sine';
    osc2.type = 'triangle';

    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    // Play
    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.2);
    osc2.stop(time + 0.2);
  }

  /**
   * Generate card placement sound
   */
  public playCardPlace(volume: number = 0.5): void {
    this.resume();
    const time = this.audioContext.currentTime;

    // Create noise for "thud" effect
    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    // Filter the noise for a deeper sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    const gainNode = this.audioContext.createGain();

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    noise.start(time);
    noise.stop(time + 0.1);
  }

  /**
   * Generate success sound (ascending arpeggio)
   */
  public playChallengeSuccess(volume: number = 0.6): void {
    this.resume();
    const time = this.audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGainNode);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = time + (i * 0.1);
      gainNode.gain.setValueAtTime(volume * (1 - i * 0.15), startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  }

  /**
   * Generate failure sound (descending notes)
   */
  public playChallengeFail(volume: number = 0.4): void {
    this.resume();
    const time = this.audioContext.currentTime;

    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    // Dissonant interval
    osc1.frequency.setValueAtTime(440, time);
    osc1.frequency.exponentialRampToValueAtTime(220, time + 0.3);

    osc2.frequency.setValueAtTime(466, time); // Slightly off for dissonance
    osc2.frequency.exponentialRampToValueAtTime(233, time + 0.3);

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.4);
    osc2.stop(time + 0.4);
  }

  /**
   * Generate timer warning beep
   */
  public playTimerWarning(volume: number = 0.5): void {
    this.resume();
    const time = this.audioContext.currentTime;

    for (let i = 0; i < 2; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGainNode);

      oscillator.frequency.value = 880; // A5
      oscillator.type = 'square';

      const startTime = time + (i * 0.15);
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.setValueAtTime(volume, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.1);
    }
  }

  /**
   * Generate synergy activation sound (magical sparkle)
   */
  public playSynergyActivate(volume: number = 0.7): void {
    this.resume();
    const time = this.audioContext.currentTime;

    // Create multiple oscillators for sparkle effect
    for (let i = 0; i < 8; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const panNode = this.audioContext.createStereoPanner();

      oscillator.connect(gainNode);
      gainNode.connect(panNode);
      panNode.connect(this.masterGainNode);

      // Random high frequency for sparkle
      const baseFreq = 2000 + Math.random() * 2000;
      oscillator.frequency.setValueAtTime(baseFreq, time + i * 0.02);
      oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 2, time + i * 0.02 + 0.1);

      oscillator.type = 'sine';

      // Random pan for spatial effect
      panNode.pan.value = (Math.random() - 0.5) * 2;

      const startTime = time + (i * 0.02);
      gainNode.gain.setValueAtTime(volume * (1 - i * 0.1), startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);
    }
  }

  /**
   * Generate notification sound
   */
  public playNotification(volume: number = 0.3): void {
    this.resume();
    const time = this.audioContext.currentTime;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    // Two-tone notification
    oscillator.frequency.setValueAtTime(659.25, time); // E5
    oscillator.frequency.setValueAtTime(783.99, time + 0.1); // G5

    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.setValueAtTime(volume, time + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

    oscillator.start(time);
    oscillator.stop(time + 0.25);
  }

  /**
   * Generate turn start fanfare
   */
  public playTurnStart(volume: number = 0.5): void {
    this.resume();
    const time = this.audioContext.currentTime;
    const notes = [392, 523.25, 392]; // G4, C5, G4

    notes.forEach((freq, i) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGainNode);

      oscillator.frequency.value = freq;
      oscillator.type = 'triangle';

      const startTime = time + (i * 0.08);
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    });
  }

  /**
   * Generate score increase sound (coin-like)
   */
  public playScoreIncrease(volume: number = 0.4): void {
    this.resume();
    const time = this.audioContext.currentTime;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    // Quick ascending glissando
    oscillator.frequency.setValueAtTime(880, time);
    oscillator.frequency.exponentialRampToValueAtTime(1760, time + 0.05);

    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    oscillator.start(time);
    oscillator.stop(time + 0.1);
  }

  /**
   * Generate victory fanfare
   */
  public playVictoryFanfare(volume: number = 0.8): void {
    this.resume();
    const time = this.audioContext.currentTime;

    // Victory chord progression
    const chords = [
      [261.63, 329.63, 392.00], // C major
      [349.23, 440.00, 523.25], // F major
      [392.00, 493.88, 587.33], // G major
      [523.25, 659.25, 783.99], // C major (octave higher)
    ];

    chords.forEach((chord, chordIndex) => {
      chord.forEach((freq, noteIndex) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGainNode);

        oscillator.frequency.value = freq;
        oscillator.type = noteIndex === 0 ? 'sawtooth' : 'triangle';

        const startTime = time + (chordIndex * 0.3);
        const noteVolume = volume * (1 - noteIndex * 0.2);

        gainNode.gain.setValueAtTime(noteVolume, startTime);
        gainNode.gain.setValueAtTime(noteVolume, startTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.5);
      });
    });
  }

  /**
   * Generate ambient menu music loop
   */
  public playMenuAmbient(volume: number = 0.2): { stop: () => void } {
    this.resume();

    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];

    // Create drone notes
    const frequencies = [130.81, 196.00, 261.63]; // C3, G3, C4

    frequencies.forEach((freq, i) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const lfo = this.audioContext.createOscillator();
      const lfoGain = this.audioContext.createGain();

      // Set up LFO for volume modulation
      lfo.frequency.value = 0.2 + i * 0.1;
      lfoGain.gain.value = volume * 0.3;

      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGainNode);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      gainNode.gain.value = volume * (1 - i * 0.3);

      oscillator.start();
      lfo.start();

      oscillators.push(oscillator);
      gainNodes.push(gainNode);
    });

    return {
      stop: () => {
        oscillators.forEach(osc => osc.stop());
      }
    };
  }

  /**
   * Set master volume
   */
  public setMasterVolume(volume: number): void {
    this.masterGainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.audioContext.close();
  }
}

// Export singleton instance
export const webAudioSynth = new WebAudioSynthesizer();