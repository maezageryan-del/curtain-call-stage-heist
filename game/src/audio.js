// CURTAIN CALL — all sound is synthesised with WebAudio; no audio files.
window.CURTAIN_AUDIO = (function () {
  let ctx = null;
  let master = null;
  let muted = false;
  let bellTimer = 0;

  function ensure() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.16;
        master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (err) { return null; }
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    try {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, c.currentTime);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
      g.gain.setValueAtTime(vol || 0.5, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.connect(g); g.connect(master);
      o.start(); o.stop(c.currentTime + dur);
    } catch (err) { /* sound is optional */ }
  }

  function footstep(sneak) { tone(sneak ? 140 : 190, 0.07, 'triangle', sneak ? 0.10 : 0.22, 90); }
  function pickup() { tone(660, 0.12, 'sine', 0.5, 990); tone(990, 0.18, 'sine', 0.35, 1320); }
  function roseToss() { tone(520, 0.16, 'sine', 0.4, 760); }
  function smokePuff() { tone(300, 0.35, 'sawtooth', 0.12, 90); }
  function footlightCut() { tone(220, 0.3, 'square', 0.2, 55); }
  function suspicionSting() { tone(196, 0.4, 'sawtooth', 0.3, 392); }
  function alarmBlare() { tone(440, 0.5, 'square', 0.25, 440); tone(349, 0.5, 'square', 0.25, 349); }
  function caughtSting() { tone(110, 0.9, 'sawtooth', 0.4, 55); }
  function actClear() { tone(523, 0.15, 'sine', 0.4); tone(659, 0.15, 'sine', 0.4); tone(784, 0.3, 'sine', 0.4); }
  function applause() {
    if (muted) return;
    for (let i = 0; i < 14; i++) setTimeout(() => tone(900 + Math.random() * 900, 0.05, 'triangle', 0.12), i * 90);
    tone(523, 0.4, 'sine', 0.4); tone(784, 0.5, 'sine', 0.4);
  }
  function stageBell(dt) {
    bellTimer -= dt;
    if (bellTimer <= 0) { bellTimer = 9; tone(1046, 0.7, 'sine', 0.18, 1046); tone(1568, 0.5, 'sine', 0.08); }
  }
  function toggleMute() { muted = !muted; return muted; }
  function isMuted() { return muted; }

  return { footstep, pickup, roseToss, smokePuff, footlightCut, suspicionSting, alarmBlare, caughtSting, actClear, applause, stageBell, toggleMute, isMuted };
})();
