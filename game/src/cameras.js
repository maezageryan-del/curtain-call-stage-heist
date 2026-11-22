// CURTAIN CALL — wall cameras and the great followspot: sweeping cones
// that watch on a rhythm the thief can learn and time.
window.CURTAIN_CAMERAS = (function () {
  const CFG = window.CURTAIN_CONFIG;
  const G = window.CURTAIN_GUARDS;

  function makeCamera(def) {
    return { x: def.x, y: def.y, base: def.base, sweep: def.sweep, period: def.period, angle: def.base, suspicion: 0 };
  }
  function makeFollowspot(def) {
    if (!def) return null;
    return { x: def.x, y: def.y, base: def.base, sweep: def.sweep, period: def.period, angle: def.base, suspicion: 0 };
  }

  function sweepAngle(cam, time) {
    return cam.base + Math.sin((time / cam.period) * Math.PI * 2) * cam.sweep;
  }

  // Returns true while this watcher can see the player; raises its suspicion.
  function updateWatcher(w, dt, time, player, solids, range, halfAngle, audio) {
    w.angle = sweepAngle(w, time);
    const seen = G.canSee(w, player.x, player.y, solids, range, halfAngle) && !player.hidden;
    if (seen) {
      const rate = player.sneaking ? CFG.suspicionRiseSneak : CFG.suspicionRise;
      const before = w.suspicion;
      w.suspicion = Math.min(100, w.suspicion + rate * dt);
      if (before < 50 && w.suspicion >= 50 && audio) audio.suspicionSting();
    } else {
      w.suspicion = Math.max(0, w.suspicion - CFG.suspicionDecay * dt);
    }
    return seen;
  }

  return { makeCamera, makeFollowspot, sweepAngle, updateWatcher };
})();
