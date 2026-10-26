// Procedural Web Audio API sound generator - Zero external audio files

class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.015, this.ctx?.currentTime || 0);
    }
    return this.isMuted;
  }

  // Realistic mechanical keyboard keystroke sound
  public playKeyClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Randomize pitch slightly for organic typing feel
    const freq = 600 + Math.random() * 400;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.setValueAtTime(3, t);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // Coffee machine brewing & pour sound
  public playCoffeeBrew() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Bubble noise burst
    const bufferSize = this.ctx.sampleRate * 1.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.linearRampToValueAtTime(1200, t + 0.6);
    filter.frequency.exponentialRampToValueAtTime(300, t + 1.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 1.2);

    // Warm high chime at finish
    setTimeout(() => {
      this.playSuccess(880, 0.2);
    }, 900);
  }

  // Success / project delivered / cash sound
  public playSuccess(baseFreq: number = 523.25, duration: number = 0.35) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t); // C5
    osc.frequency.setValueAtTime(baseFreq * 1.25, t + 0.08); // E5
    osc.frequency.setValueAtTime(baseFreq * 1.5, t + 0.16); // G5
    osc.frequency.setValueAtTime(baseFreq * 2.0, t + 0.24); // C6

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + duration);
  }

  // Cash Ka-ching
  public playCashRegister() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // First high coin clink
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(987.77, t); // B5
    gain1.gain.setValueAtTime(0.18, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.3);

    // Second higher coin clink
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, t + 0.09); // E6
    gain2.gain.setValueAtTime(0.2, t + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t + 0.09);
    osc2.stop(t + 0.45);
  }

  // Server incident / warning siren
  public playAlert() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(660, t + 0.15);
    osc.frequency.linearRampToValueAtTime(440, t + 0.3);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  // Clean UI click
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.03);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.03);
  }

  // Footstep audio
  public playFootstep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + Math.random() * 40, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.05);

    gain.gain.setValueAtTime(0.035, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Start low subtle background office cyber drone
  public startAmbient() {
    if (this.ambientOsc) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this.ambientOsc = this.ctx.createOscillator();
    this.ambientGain = this.ctx.createGain();

    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.setValueAtTime(65.41, t); // C2 low warm drone

    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.012, t);

    this.ambientOsc.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);
    this.ambientOsc.start();
  }
}

export const soundManager = new SoundManager();
