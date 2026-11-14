class MissionAudioService {
  private muted: boolean = false;
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  public playBeep(freq = 780, duration = 0.06, volume = 0.04) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio autoplay block
    }
  }

  public playSuccess() {
    this.playBeep(660, 0.07, 0.04);
    setTimeout(() => this.playBeep(920, 0.1, 0.045), 75);
  }

  public playWarning() {
    this.playBeep(520, 0.1, 0.05);
    setTimeout(() => this.playBeep(440, 0.12, 0.05), 110);
  }

  public playSafetyStop() {
    this.playBeep(380, 0.14, 0.06);
    setTimeout(() => this.playBeep(310, 0.18, 0.06), 150);
  }
}

export const missionAudio = new MissionAudioService();
