// Zero-latency Web Audio sound synthesizer for realistic key clicks

class SoundManager {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playKeyClick(soundType: 'mechanical' | 'soft-click' | 'typewriter' | 'bubble' = 'mechanical', volume = 0.5) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.4, t);
      masterGain.connect(this.ctx.destination);

      if (soundType === 'mechanical') {
        // High frequency sharp transient followed by quick low damp
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(3200, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.025);

        gain.gain.setValueAtTime(1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.028);

        // Add a burst of filtered white noise for tactile switch crunch
        const bufferSize = this.ctx.sampleRate * 0.015;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(2500, t);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.015);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(t);
        osc.stop(t + 0.03);
        noise.start(t);
        noise.stop(t + 0.02);
      } else if (soundType === 'soft-click') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.02);

        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(t);
        osc.stop(t + 0.025);
      } else if (soundType === 'typewriter') {
        // Metallic snap
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(4500, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.035);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(t);
        osc.stop(t + 0.04);
      } else if (soundType === 'bubble') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(1400, t + 0.035);

        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(t);
        osc.stop(t + 0.04);
      }
    } catch {
      // AudioContext may be restricted by autoplay policy until user gesture
    }
  }

  playSpecialClick(type: 'enter' | 'delete' | 'space' | 'copy' | 'paste' | 'swipe') {
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.connect(this.ctx.destination);

      const osc = this.ctx.createOscillator();

      if (type === 'enter') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.05);
      } else if (type === 'delete') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(160, t + 0.04);
      } else if (type === 'copy' || type === 'paste') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(type === 'copy' ? 659.25 : 880, t);
        osc.frequency.exponentialRampToValueAtTime(type === 'copy' ? 880 : 1174.66, t + 0.06);
      } else if (type === 'swipe') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.06);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.03);
      }

      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain);
      osc.start(t);
      osc.stop(t + 0.07);
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundManager();
