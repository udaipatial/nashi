/**
 * Web Audio API Acoustic Soundscape & Real Audio Stream Engine for Nashi
 * Provides rich, organic audio (singing bowl, rain, stream, wind, and music chords)
 * combined with real audio playback for streaming legal music tracks.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private volume: number = 0.75;

  // Real Audio Streaming Element
  private audio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private isRealAudioPlaying: boolean = false;

  // Event Callbacks
  private timeUpdateCallbacks: Set<(currentTime: number, duration: number) => void> = new Set();
  private endedCallbacks: Set<() => void> = new Set();
  private errorCallbacks: Set<(err: string) => void> = new Set();
  private loadingCallbacks: Set<(isLoading: boolean) => void> = new Set();

  // Ambient nodes
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;
  private streamGain: GainNode | null = null;
  private windGain: GainNode | null = null;

  // Music playback harmonic oscillator loop (fallback pad)
  private musicPadOsc1: OscillatorNode | null = null;
  private musicPadOsc2: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPadPlaying: boolean = false;

  constructor() {
    this.initAudioElement();
  }

  private initAudioElement() {
    if (typeof window === 'undefined') return;
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.volume = this.volume;

      this.audio.addEventListener('timeupdate', () => {
        if (!this.audio) return;
        const cur = this.audio.currentTime;
        const dur = isNaN(this.audio.duration) || this.audio.duration === 0 ? 30 : this.audio.duration;
        this.timeUpdateCallbacks.forEach((cb) => cb(cur, dur));
      });

      this.audio.addEventListener('ended', () => {
        this.isRealAudioPlaying = false;
        this.endedCallbacks.forEach((cb) => cb());
      });

      this.audio.addEventListener('waiting', () => {
        this.loadingCallbacks.forEach((cb) => cb(true));
      });

      this.audio.addEventListener('playing', () => {
        this.isRealAudioPlaying = true;
        this.loadingCallbacks.forEach((cb) => cb(false));
      });

      this.audio.addEventListener('pause', () => {
        this.isRealAudioPlaying = false;
        this.loadingCallbacks.forEach((cb) => cb(false));
      });

      this.audio.addEventListener('error', () => {
        this.isRealAudioPlaying = false;
        this.loadingCallbacks.forEach((cb) => cb(false));
        const err = this.audio?.error?.message || 'Playback stream error';
        console.warn('Nashi AudioEngine error:', err);
        this.errorCallbacks.forEach((cb) => cb(err));
        // Graceful fallback to meditative harmonic pad if real audio fails
        this.startMusicPad(220);
      });
    }
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupAmbientLayers();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private setupAmbientLayers() {
    if (!this.ctx || !this.masterGain) return;

    // 1. Rain Generator (Filtered Pink Noise Buffer)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1100, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    rainSource.start(0);
    this.rainNode = rainSource;

    // 2. Stream Generator (Modulated Pink Noise)
    const streamSource = this.ctx.createBufferSource();
    streamSource.buffer = noiseBuffer;
    streamSource.loop = true;

    const streamFilter = this.ctx.createBiquadFilter();
    streamFilter.type = 'bandpass';
    streamFilter.frequency.setValueAtTime(750, this.ctx.currentTime);
    streamFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.streamGain = this.ctx.createGain();
    this.streamGain.gain.setValueAtTime(0, this.ctx.currentTime);

    streamSource.connect(streamFilter);
    streamFilter.connect(this.streamGain);
    this.streamGain.connect(this.masterGain);
    streamSource.start(0);

    // 3. Wind Generator (Ultra-low filtered noise with gentle swell)
    const windSource = this.ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(380, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0, this.ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    windSource.start(0);

    // 4. Music Harmonic Pad Node
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);
  }

  // ==========================================
  // REAL AUDIO PLAYBACK API
  // ==========================================

  public async playTrack(url?: string, startTime: number = 0): Promise<void> {
    this.initAudioElement();
    this.initContext();

    if (!url) {
      // Fallback to synthesized harmonic pad if no stream is provided
      if (this.audio) {
        this.audio.pause();
      }
      this.currentAudioUrl = null;
      this.startMusicPad(220);
      return;
    }

    if (!this.audio) return;

    try {
      this.stopMusicPad();

      if (this.currentAudioUrl !== url) {
        this.currentAudioUrl = url;
        this.audio.src = url;
        this.audio.currentTime = startTime;
        this.audio.volume = this.isMuted ? 0 : this.volume;
      } else if (startTime > 0 && Math.abs(this.audio.currentTime - startTime) > 2) {
        this.audio.currentTime = startTime;
      }

      await this.audio.play();
      this.isRealAudioPlaying = true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn('Nashi stream play error (falling back to harmonic pad):', errorMsg);
      this.isRealAudioPlaying = false;
      this.startMusicPad(220);
      this.errorCallbacks.forEach((cb) => cb(errorMsg));
    }
  }

  public pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
    this.stopMusicPad();
    this.isRealAudioPlaying = false;
  }

  public async resume(): Promise<void> {
    if (this.currentAudioUrl && this.audio) {
      try {
        await this.audio.play();
        this.isRealAudioPlaying = true;
      } catch {
        this.startMusicPad(220);
      }
    } else {
      this.startMusicPad(220);
    }
  }

  public seek(seconds: number): void {
    if (this.audio && this.currentAudioUrl) {
      if (!isNaN(this.audio.duration) && this.audio.duration > 0) {
        this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration));
      } else {
        this.audio.currentTime = Math.max(0, seconds);
      }
    }
  }

  public getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  public getDuration(): number {
    if (this.audio && !isNaN(this.audio.duration) && this.audio.duration > 0) {
      return this.audio.duration;
    }
    return 30;
  }

  public isPlaying(): boolean {
    return this.isRealAudioPlaying || this.isMusicPadPlaying;
  }

  public onTimeUpdate(callback: (currentTime: number, duration: number) => void): () => void {
    this.timeUpdateCallbacks.add(callback);
    return () => this.timeUpdateCallbacks.delete(callback);
  }

  public onEnded(callback: () => void): () => void {
    this.endedCallbacks.add(callback);
    return () => this.endedCallbacks.delete(callback);
  }

  public onError(callback: (err: string) => void): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  public onLoading(callback: (isLoading: boolean) => void): () => void {
    this.loadingCallbacks.add(callback);
    return () => this.loadingCallbacks.delete(callback);
  }

  // ==========================================
  // VOLUME & AMBIENT CONTROLS
  // ==========================================

  public setMasterVolume(vol: number) {
    this.initContext();
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;

    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : clamped;
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : clamped, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setMasterVolume(this.volume);
    return this.isMuted;
  }

  public updateAmbientLayers(layers: { rain: number; wind: number; stream: number; bell: number; active: boolean }) {
    this.initContext();
    if (!this.ctx) return;

    const mult = layers.active ? 1 : 0;
    if (this.rainGain) {
      this.rainGain.gain.setTargetAtTime((layers.rain / 100) * 0.28 * mult, this.ctx.currentTime, 0.1);
    }
    if (this.streamGain) {
      this.streamGain.gain.setTargetAtTime((layers.stream / 100) * 0.22 * mult, this.ctx.currentTime, 0.1);
    }
    if (this.windGain) {
      this.windGain.gain.setTargetAtTime((layers.wind / 100) * 0.25 * mult, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Play crystal-clear resonant Japanese singing bowl (Rin / 鈴) chime
   */
  public playSingingBowl(pitch: number = 432) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const baseFreqs = [pitch, pitch * 2.01, pitch * 3.015, pitch * 4.2];
    const amplitudes = [0.25, 0.12, 0.05, 0.02];

    baseFreqs.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(amplitudes[i], now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8 + i * 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 4.5 + i * 0.5);
    });
  }

  /**
   * Start tranquil musical harmonic backdrop for active song (fallback)
   */
  public startMusicPad(baseFrequency: number = 220) {
    this.initContext();
    if (!this.ctx || !this.musicGain) return;

    if (this.isMusicPadPlaying) {
      this.stopMusicPad();
    }

    const now = this.ctx.currentTime;

    // Dual soothing detuned sine oscillators for warm sumi-e aesthetic
    this.musicPadOsc1 = this.ctx.createOscillator();
    this.musicPadOsc2 = this.ctx.createOscillator();

    this.musicPadOsc1.type = 'sine';
    this.musicPadOsc1.frequency.setValueAtTime(baseFrequency, now);

    this.musicPadOsc2.type = 'triangle';
    this.musicPadOsc2.frequency.setValueAtTime(baseFrequency * 1.5, now); // Perfect fifth harmony

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);

    this.musicPadOsc1.connect(filter);
    this.musicPadOsc2.connect(filter);
    filter.connect(this.musicGain);

    this.musicGain.gain.setValueAtTime(0.001, now);
    this.musicGain.gain.exponentialRampToValueAtTime(0.18, now + 1.2);

    this.musicPadOsc1.start(now);
    this.musicPadOsc2.start(now);
    this.isMusicPadPlaying = true;
  }

  public stopMusicPad() {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    try {
      this.musicGain.gain.setTargetAtTime(0.0001, now, 0.4);
      setTimeout(() => {
        if (this.musicPadOsc1) {
          try {
            this.musicPadOsc1.stop();
            this.musicPadOsc1.disconnect();
          } catch {
            /* ignore */
          }
          this.musicPadOsc1 = null;
        }
        if (this.musicPadOsc2) {
          try {
            this.musicPadOsc2.stop();
            this.musicPadOsc2.disconnect();
          } catch {
            /* ignore */
          }
          this.musicPadOsc2 = null;
        }
        this.isMusicPadPlaying = false;
      }, 500);
    } catch {
      this.isMusicPadPlaying = false;
    }
  }
}

export const audioEngine = new AudioEngine();
