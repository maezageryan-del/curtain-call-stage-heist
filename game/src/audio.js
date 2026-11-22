// Synthesised sound for CURTAIN CALL — WebAudio only, no audio files, no
// network. One job: every sound the theatre makes, built from oscillators.

export function createAudio() {
  let ctx = null;
  let muted = false;
  let master = null;

  function ensure() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  // A short tone with an exponential decay envelope.
  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    g.gain.setValueAtTime(vol || 0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // Filtered noise burst (footsteps, smoke, applause wash).
  function noise(dur, vol, filterFreq) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = filterFreq || 800;
    const g = c.createGain();
    g.gain.setValueAtTime(vol || 0.15, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filt);
    filt.connect(g);
    g.connect(master);
    src.start(t0);
  }

  return {
    get muted() { return muted; },
    unlock() { ensure(); },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : 0.35;
      return muted;
    },
    step(sneak) {
      // Wooden boards: a soft knock; sneaking is a near-silent tap.
      if (sneak) tone(140, 0.05, 'triangle', 0.04);
      else { noise(0.07, 0.10, 500); tone(95, 0.06, 'sine', 0.08, 70); }
    },
    rose() { tone(660, 0.12, 'sine', 0.12, 990); noise(0.08, 0.05, 2000); },
    pickup() { tone(880, 0.10, 'sine', 0.15); tone(1318, 0.16, 'sine', 0.12); },
    diamond() {
      tone(1046, 0.25, 'sine', 0.16);
      tone(1568, 0.35, 'sine', 0.12);
      tone(2093, 0.5, 'sine', 0.08);
    },
    sting() {
      // Suspicion sting: a dissonant brass-ish bite.
      tone(220, 0.35, 'sawtooth', 0.10, 233);
      tone(233, 0.35, 'sawtooth', 0.10, 247);
    },
    alarm() {
      tone(620, 0.22, 'square', 0.09);
      setTimeout(() => tone(470, 0.22, 'square', 0.09), 240);
    },
    smoke() { noise(0.5, 0.12, 1200); },
    lights() { tone(180, 0.3, 'sawtooth', 0.10, 60); noise(0.2, 0.08, 300); },
    bell() { tone(1174, 0.9, 'sine', 0.10); tone(1760, 0.7, 'sine', 0.05); },
    door() { tone(320, 0.4, 'triangle', 0.12, 240); noise(0.25, 0.08, 400); },
    applause() {
      // The house erupts: a wash of noise, then a warm chord.
      noise(1.6, 0.16, 2500);
      setTimeout(() => noise(1.2, 0.10, 2500), 500);
      tone(523, 1.2, 'triangle', 0.07);
      tone(659, 1.2, 'triangle', 0.07);
      tone(784, 1.2, 'triangle', 0.07);
    },
    caught() {
      tone(110, 0.6, 'sawtooth', 0.14, 55);
      tone(165, 0.5, 'sawtooth', 0.10, 82);
    },
  };
}
